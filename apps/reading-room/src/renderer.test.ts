// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { TextRenderer } from "./renderer";

const frames: FrameRequestCallback[] = [];
const writeBuffer = vi.fn();
const draw = vi.fn();
let renderer: TextRenderer;
let article: HTMLElement;
let surface: HTMLElement;

beforeEach(async () => {
  document.body.innerHTML = '<div id="surface"><article></article></div>';
  article = document.querySelector("article")!;
  surface = document.querySelector("#surface")!;
  vi.spyOn(surface, "getBoundingClientRect").mockReturnValue(new DOMRect(100, 100, 800, 600));
  // A 20px scrollbar leaves a 980px canvas inside a 1000px window.
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 980, 640),
  );
  vi.stubGlobal("innerWidth", 1000);
  vi.stubGlobal("innerHeight", 640);
  vi.stubGlobal("devicePixelRatio", 2);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("GPUBufferUsage", { UNIFORM: 64, COPY_DST: 8, STORAGE: 128, VERTEX: 32 });
  const pipeline = { getBindGroupLayout: vi.fn() };
  const pass = {
    setScissorRect: vi.fn(),
    setPipeline: vi.fn(),
    setBindGroup: vi.fn(),
    setVertexBuffer: vi.fn(),
    draw,
    end: vi.fn(),
  };
  const device = {
    limits: { maxStorageBufferBindingSize: 1024, maxBufferSize: 1024, maxTextureDimension2D: 8192 },
    createBuffer: vi.fn(() => ({ destroy: vi.fn() })),
    createShaderModule: vi.fn(),
    createRenderPipeline: vi.fn(() => pipeline),
    createBindGroup: vi.fn(),
    createCommandEncoder: vi.fn(() => ({ beginRenderPass: () => pass, finish: vi.fn() })),
    queue: { writeBuffer, submit: vi.fn() },
    lost: new Promise(() => {}),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    destroy: vi.fn(),
  };
  vi.stubGlobal("navigator", {
    gpu: {
      requestAdapter: async () => ({ requestDevice: async () => device }),
      getPreferredCanvasFormat: () => "bgra8unorm",
    },
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    configure: vi.fn(),
    unconfigure: vi.fn(),
    getCurrentTexture: () => ({ createView: vi.fn() }),
  } as unknown as GPUCanvasContext);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ ascent: 1, glyphs: {} }),
      arrayBuffer: async () => new ArrayBuffer(16),
    })),
  );
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: Object.assign(new EventTarget(), { load: async () => [{}] }),
  });
  renderer = await TextRenderer.create(article, surface, vi.fn(), vi.fn());
});

afterEach(() => {
  renderer?.dispose();
  frames.length = 0;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("GPU composition over native DOM", () => {
  it("uses the canvas CSS extent, not the scrollbar-inclusive window, for projection", () => {
    frames.shift()!(0);
    const canvas = document.querySelector("canvas")!;
    expect(canvas.width).toBe(1960);
    expect(canvas.height).toBe(1280);
    expect(writeBuffer.mock.lastCall?.[2]).toEqual(new Float32Array([980, 640, 100, 100]));
  });

  it("reveals native selection when select-all endpoints are outside the article", () => {
    article.textContent = "Selected article text";
    surface.before(document.createTextNode("Before the article"));
    surface.after(document.createTextNode("After the article"));
    frames.shift()!(0);
    expect(draw).toHaveBeenCalled();
    draw.mockClear();
    const range = document.createRange();
    range.selectNodeContents(document.body);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    expect(article.contains(selection.anchorNode)).toBe(false);
    expect(article.contains(selection.focusNode)).toBe(false);
    document.dispatchEvent(new Event("selectionchange"));
    frames.shift()!(0);
    expect(draw).not.toHaveBeenCalled();
    selection.removeAllRanges();
  });
});
