import { coverage } from "./gpu/coverage";

interface Glyph {
  n: number;
  b: [number, number, number, number];
  t: number;
  k: number;
}
interface Font {
  ascent: number;
  glyphs: Record<string, Glyph>;
}

export const outlineShader = /* wgsl */ `
struct View { size: vec2f, offset: vec2f };
@group(0) @binding(0) var<uniform> view: View;
@group(0) @binding(1) var<storage, read> curves: array<vec4f>;
${coverage}
struct Vertex {
  @builtin(position) position: vec4f,
  @location(0) em: vec2f,
  @location(1) @interpolate(flat) glyph: vec2f,
  @location(2) @interpolate(flat) bbox: vec4f,
  @location(3) @interpolate(flat) color: vec4f,
};
fn corner(i: u32) -> vec2f {
  return array<vec2f, 6>(vec2f(0,0), vec2f(1,0), vec2f(0,1), vec2f(0,1), vec2f(1,0), vec2f(1,1))[i];
}
@vertex fn textVertex(@builtin(vertex_index) i: u32, @location(0) origin: vec2f, @location(1) size: f32,
  @location(2) bbox: vec4f, @location(3) glyph: vec2f, @location(4) color: vec4f) -> Vertex {
  let pad = vec2f(2.0 / size);
  let em = mix(bbox.xy - pad, bbox.zw + pad, corner(i));
  let pixel = origin + vec2f(em.x, -em.y) * size + view.offset;
  return Vertex(vec4f(pixel / view.size * vec2f(2,-2) + vec2f(-1,1), 0, 1), em, glyph, bbox, color);
}
@fragment fn textFragment(v: Vertex) -> @location(0) vec4f {
  // Derivatives precede coverage's non-uniform loops.
  let ppx = 1.0 / max(length(vec2f(dpdx(v.em.x), dpdy(v.em.x))), 1e-6);
  let ppy = 1.0 / max(length(vec2f(dpdx(v.em.y), dpdy(v.em.y))), 1e-6);
  let alpha = coverage(v.em, ppx, ppy, u32(v.glyph.x + 0.5), i32(v.glyph.y + 0.5), v.bbox, false) * v.color.a;
  return vec4f(v.color.rgb * alpha, alpha);
}
@vertex fn paperVertex(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  return vec4f(corner(i) * 2 - 1, 0, 1);
}
@fragment fn paperFragment() -> @location(0) vec4f { return vec4f(243.0/255.0, 240.0/255.0, 232.0/255.0, 1); }
`;

/** Range positions are browser shaped; ink is evaluated from Bézier outlines. */
function measure(
  article: HTMLElement,
  surface: HTMLElement,
  font: Font,
): Float32Array<ArrayBuffer> {
  const origin = surface.getBoundingClientRect();
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  const values: number[] = [];
  const range = document.createRange();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    const style = getComputedStyle(node.parentElement!);
    const size = parseFloat(style.fontSize);
    const channels = style.color.match(/[\d.]+/g)?.map(Number) ?? [37, 41, 35];
    const color = [channels[0]! / 255, channels[1]! / 255, channels[2]! / 255, channels[3] ?? 1];
    for (let offset = 0; offset < text.length;) {
      const cp = text.codePointAt(offset)!;
      const at = offset;
      offset += cp > 0xffff ? 2 : 1;
      if (/\s/u.test(String.fromCodePoint(cp))) continue;
      const glyph = font.glyphs[cp];
      // Never hide native text with incomplete GPU text after a copy change.
      if (!glyph?.n) throw new Error(`Outline unavailable for U+${cp.toString(16)}`);
      range.setStart(node, at);
      range.setEnd(node, offset);
      const rect = range.getClientRects()[0];
      if (!rect) continue;
      values.push(
        rect.left - origin.left,
        rect.top - origin.top + Math.round(font.ascent * size),
        size,
        ...glyph.b,
        glyph.t,
        glyph.k,
        ...color,
      );
    }
  }
  return new Float32Array(values);
}

export class TextRenderer {
  private vertices?: GPUBuffer;
  private readonly group: GPUBindGroup;
  private count = 0;
  private split = 50;
  private frame = 0;
  private disposed = false;
  private readonly outlines: GPUBuffer;
  private readonly uniform: GPUBuffer;
  private readonly paper: GPURenderPipeline;
  private readonly text: GPURenderPipeline;
  private readonly context: GPUCanvasContext;
  private readonly observer: ResizeObserver;
  private readonly canvas = document.createElement("canvas");

  static async create(
    article: HTMLElement,
    surface: HTMLElement,
    onFailure: () => void,
    onMeasure: (count: number) => void,
  ): Promise<TextRenderer> {
    if (!navigator.gpu) throw new Error("WebGPU unavailable");
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error("No GPU adapter");
    const device = await adapter.requestDevice();
    try {
      const [meta, bin, faces] = await Promise.all([
        fetch("/generated/reading.json"),
        fetch("/generated/reading.bin"),
        document.fonts.load('16px "Reading Serif"'),
      ]);
      if (!meta.ok || !bin.ok || !faces.length) throw new Error("Font outlines unavailable");
      const font = (await meta.json()) as Font;
      const data = await bin.arrayBuffer();
      if (data.byteLength > device.limits.maxStorageBufferBindingSize)
        throw new Error("Font exceeds GPU limits");
      const renderer = new TextRenderer(device, font, data, article, surface, onFailure, onMeasure);
      if (renderer.disposed) throw new Error("Outline measurement failed");
      return renderer;
    } catch (error) {
      device.destroy();
      throw error;
    }
  }

  private constructor(
    private readonly device: GPUDevice,
    private readonly font: Font,
    data: ArrayBuffer,
    private readonly article: HTMLElement,
    private readonly surface: HTMLElement,
    private readonly onFailure: () => void,
    private readonly onMeasure: (count: number) => void,
  ) {
    this.canvas.className = "gpu-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    const context = this.canvas.getContext("webgpu");
    if (!context) throw new Error("No WebGPU canvas");
    this.context = context;
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: "premultiplied" });
    const module = device.createShaderModule({ code: outlineShader });
    this.uniform = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.outlines = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.outlines, 0, data);
    this.text = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module,
        entryPoint: "textVertex",
        buffers: [
          {
            arrayStride: 52,
            stepMode: "instance",
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x2" },
              { shaderLocation: 1, offset: 8, format: "float32" },
              { shaderLocation: 2, offset: 12, format: "float32x4" },
              { shaderLocation: 3, offset: 28, format: "float32x2" },
              { shaderLocation: 4, offset: 36, format: "float32x4" },
            ],
          },
        ],
      },
      fragment: {
        module,
        entryPoint: "textFragment",
        targets: [
          {
            format,
            blend: {
              color: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
              alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
            },
          },
        ],
      },
    });
    this.group = device.createBindGroup({
      layout: this.text.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniform } },
        { binding: 1, resource: { buffer: this.outlines } },
      ],
    });
    this.paper = device.createRenderPipeline({
      layout: "auto",
      vertex: { module, entryPoint: "paperVertex" },
      fragment: { module, entryPoint: "paperFragment", targets: [{ format }] },
    });
    void device.lost.then(() => this.fail());
    device.addEventListener("uncapturederror", this.fail);
    this.observer = new ResizeObserver(this.rebuild);
    this.observer.observe(article);
    window.addEventListener("resize", this.rebuild);
    window.addEventListener("scroll", this.schedule, { passive: true });
    document.fonts.addEventListener("loadingdone", this.rebuild);
    document.addEventListener("selectionchange", this.schedule);
    document.addEventListener("focusin", this.schedule);
    document.addEventListener("focusout", this.schedule);
    document.body.append(this.canvas);
    this.rebuild();
  }

  private fail = (): void => {
    if (!this.disposed) {
      this.dispose();
      this.onFailure();
    }
  };
  setSplit(value: number): void {
    this.split = value;
    this.schedule();
  }

  rebuild = (): void => {
    if (this.disposed) return;
    try {
      const vertices = measure(this.article, this.surface, this.font);
      if (vertices.byteLength > this.device.limits.maxBufferSize)
        throw new Error("Article exceeds GPU limits");
      const buffer = this.device.createBuffer({
        size: Math.max(52, vertices.byteLength),
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      this.device.queue.writeBuffer(buffer, 0, vertices);
      this.vertices?.destroy();
      this.vertices = buffer;
      this.count = vertices.length / 13;
      this.onMeasure(this.count);
      this.schedule();
    } catch {
      this.fail();
    }
  };

  private schedule = (): void => {
    if (this.frame || this.disposed) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      try {
        this.draw();
      } catch {
        this.fail();
      }
    });
  };

  private draw(): void {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    // Fixed canvas CSS dimensions exclude classic scrollbar gutters.
    const viewport = this.canvas.getBoundingClientRect();
    if (!viewport.width || !viewport.height) return;
    const width = Math.round(viewport.width * dpr);
    const height = Math.round(viewport.height * dpr);
    if (
      width > this.device.limits.maxTextureDimension2D ||
      height > this.device.limits.maxTextureDimension2D
    )
      throw new Error("Viewport too large");
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    const scaleX = width / viewport.width;
    const scaleY = height / viewport.height;
    const rect = this.surface.getBoundingClientRect();
    const left = Math.max(0, Math.ceil((rect.left + (rect.width * this.split) / 100) * scaleX));
    const top = Math.max(0, Math.ceil(rect.top * scaleY));
    const right = Math.min(width, Math.floor(rect.right * scaleX));
    const bottom = Math.min(height, Math.floor(rect.bottom * scaleY));
    const selection = document.getSelection();
    const selecting =
      this.article.contains(document.activeElement) ||
      (selection &&
        !selection.isCollapsed &&
        (this.article.contains(selection.anchorNode) ||
          this.article.contains(selection.focusNode)));
    this.device.queue.writeBuffer(
      this.uniform,
      0,
      new Float32Array([viewport.width, viewport.height, rect.left, rect.top]),
    );
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: [0, 0, 0, 0],
        },
      ],
    });
    if (!selecting && right > left && bottom > top && this.vertices) {
      pass.setScissorRect(left, top, right - left, bottom - top);
      pass.setPipeline(this.paper);
      pass.draw(6);
      pass.setPipeline(this.text);
      pass.setBindGroup(0, this.group);
      pass.setVertexBuffer(0, this.vertices);
      pass.draw(6, this.count);
    }
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    window.removeEventListener("resize", this.rebuild);
    window.removeEventListener("scroll", this.schedule);
    document.fonts.removeEventListener("loadingdone", this.rebuild);
    document.removeEventListener("selectionchange", this.schedule);
    document.removeEventListener("focusin", this.schedule);
    document.removeEventListener("focusout", this.schedule);
    this.device.removeEventListener("uncapturederror", this.fail);
    this.canvas.remove();
    this.vertices?.destroy();
    this.uniform.destroy();
    this.outlines.destroy();
    this.context.unconfigure();
    this.device.destroy();
  }
}
