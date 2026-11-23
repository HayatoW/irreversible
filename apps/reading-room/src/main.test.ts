// @vitest-environment jsdom
import { expect, it, vi } from "vite-plus/test";
import html from "../index.html?raw";

vi.mock("./renderer", () => ({
  TextRenderer: { create: async () => ({ setSplit: vi.fn(), rebuild: vi.fn(), dispose: vi.fn() }) },
}));

it("retains the chosen comparison split after opening and cancelling print preview", async () => {
  document.body.innerHTML = new DOMParser().parseFromString(html, "text/html").body.innerHTML;
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
  await import("./main");
  await vi.waitFor(() => expect(document.body.dataset.gpu).toBe("ready"));
  const seam = document.querySelector<HTMLInputElement>("#seam")!;
  seam.value = "37";
  seam.dispatchEvent(new Event("input"));
  window.dispatchEvent(new Event("beforeprint"));
  window.dispatchEvent(new Event("afterprint"));
  expect(seam.value).toBe("37");
  expect(seam.getAttribute("aria-valuetext")).toBe("DOM 37%、GPU 63%");
});
