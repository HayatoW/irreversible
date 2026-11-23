import "./style.css";
import { decodeOutlines, specimenSize, supportedText, type Outlines } from "./geometry";
import { createRenderer } from "./renderer";

function element<T extends HTMLElement>(selector: string) {
  const result = document.querySelector<T>(selector);
  if (!result) throw new Error(`Missing element: ${selector}`);
  return result;
}
const text = element<HTMLInputElement>("#text");
const font = element<HTMLSelectElement>("#font");
const size = element<HTMLInputElement>("#size");
const stroke = element<HTMLInputElement>("#stroke");
const spacing = element<HTMLInputElement>("#spacing");
const specimen = element("#specimen");
const stage = element("#stage");
const canvas = element<HTMLCanvasElement>("#canvas");
const engine = element("#engine");
const note = element("#render-note");
let mode = "outline";
let vertical = false;
let renderer: Awaited<ReturnType<typeof createRenderer>> | undefined;
let rendererState: "loading" | "ready" | "unavailable" = "loading";
let revision = 0;
let frame = 0;
const fonts = new Map<string, Promise<Outlines>>();

function loadFont(family: string) {
  let promise = fonts.get(family);
  if (!promise) {
    promise = (async () => {
      const data =
        family === "sans"
          ? await import("./assets/sans.json")
          : await import("./assets/serif.json");
      const url =
        family === "sans"
          ? new URL("./assets/sans.bin", import.meta.url)
          : new URL("./assets/serif.bin", import.meta.url);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Outline data unavailable");
      const buffer = await response.arrayBuffer();
      await document.fonts.load(`100px "Lab ${family}"`);
      if (!document.fonts.check(`100px "Lab ${family}"`)) throw new Error("Font unavailable");
      return decodeOutlines(data.default, buffer);
    })();
    fonts.set(family, promise);
    // A later interaction may retry a transient font loading failure.
    promise.catch(() => fonts.delete(family));
  }
  return promise;
}

function fallback(message: string) {
  stage.classList.remove("gpu-active");
  canvas.hidden = true;
  engine.classList.remove("ready");
  engine.textContent = "● DOM / フォールバック";
  element("#render-type").textContent = "DOM";
  element("#edge-count").textContent = "—";
  note.textContent = message;
}

async function render() {
  const current = ++revision;
  stage.classList.remove("gpu-active");
  canvas.hidden = true;
  const chars = Array.from(text.value).slice(0, 8);
  const family = font.value;
  const fontSize = specimenSize(
    stage.clientWidth,
    chars.length,
    Number(size.value),
    Number(spacing.value),
    vertical,
  );
  specimen.style.fontFamily = `"Lab ${family}", serif`;
  specimen.style.fontSize = `${fontSize}px`;
  specimen.style.setProperty(
    "--spacing",
    `${(Number(spacing.value) * fontSize) / Number(size.value)}px`,
  );
  specimen.dataset.direction = vertical ? "vertical" : "horizontal";
  specimen.replaceChildren(
    ...chars.map((char) => {
      const span = document.createElement("span");
      span.className = "glyph";
      span.textContent = char;
      return span;
    }),
  );
  stage.dataset.mode = mode;
  stage.style.setProperty("--stroke", `${stroke.value}px`);
  element("#size-output").textContent = `${size.value} px`;
  element("#size-output").setAttribute("title", "表示領域に合わせて自動縮小します");
  element("#stroke-output").textContent = `${Number(stroke.value).toFixed(1)} px`;
  element("#spacing-output").textContent = `${spacing.value} px`;
  for (const input of [size, stroke, spacing])
    input.setAttribute("aria-valuetext", `${input.value} px`);
  stroke.disabled = mode !== "outline";
  element("#size-caption").textContent = `${Math.round(fontSize)} PX / AUTO FIT`;
  element("#glyph-count").textContent = String(chars.length);
  element("#font-caption").textContent =
    `Noto ${family === "serif" ? "Serif" : "Sans"} JP / Regular`;
  document.querySelectorAll<HTMLButtonElement>("[data-text]").forEach((button, index) => {
    const selected = button.dataset.text === text.value;
    button.setAttribute("aria-pressed", String(selected));
    if (selected) element("#specimen-id").textContent = String(index + 1).padStart(3, "0");
  });
  if (
    !Array.from(document.querySelectorAll<HTMLButtonElement>("[data-text]")).some(
      (button) => button.dataset.text === text.value,
    )
  )
    element("#specimen-id").textContent = "CUSTOM";
  try {
    const outlines = await loadFont(family);
    if (current !== revision) return;
    if (!chars.length) {
      fallback("文字を入力すると、ここに試し組みを表示します。");
      return;
    }
    if (!supportedText(chars.join(""), outlines)) {
      fallback(
        "未収録の文字を含むため、全体をDOMで表示しています。サンプル・かな・英数字はGPU描画に対応しています。",
      );
      return;
    }
    if (!renderer || rendererState !== "ready") {
      fallback(
        rendererState === "loading"
          ? "WebGPUを準備しています。現在はDOMで表示中です。"
          : "この環境ではWebGPUを利用できないため、DOMで表示しています。すべての設定を試せます。",
      );
      return;
    }
    canvas.hidden = false;
    const origin = stage.getBoundingClientRect();
    const placements = Array.from(specimen.children).map((child, i) => {
      const rect = child.getBoundingClientRect();
      return {
        char: chars[i],
        x: rect.left - origin.left,
        y: rect.top - origin.top,
        size: fontSize,
      };
    });
    const edges = renderer.draw(outlines, placements, Number(stroke.value), mode === "outline");
    stage.classList.add("gpu-active");
    engine.classList.add("ready");
    engine.textContent = "● WebGPU / LIVE";
    element("#render-type").textContent = "WebGPU";
    element("#edge-count").textContent = edges.toLocaleString("ja-JP");
    note.textContent = "フォント輪郭の線分をWebGPUで描画中。文字はそのまま選択・コピーできます。";
  } catch {
    if (current === revision)
      fallback("フォントまたはGPUの読み込みに失敗しました。DOM表示で引き続き操作できます。");
  }
}

function schedule() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    void render();
  });
}
for (const input of [text, font, size, stroke, spacing]) input.addEventListener("input", schedule);
text.addEventListener("compositionend", () => {
  text.value = Array.from(text.value).slice(0, 8).join("");
  schedule();
});
text.addEventListener("input", (event) => {
  if (!(event as InputEvent).isComposing) text.value = Array.from(text.value).slice(0, 8).join("");
});
document.querySelectorAll<HTMLButtonElement>("[data-text]").forEach((button) => {
  button.addEventListener("click", () => {
    text.value = button.dataset.text ?? "";
    schedule();
  });
});
function updateButtons(selector: string, selected: HTMLButtonElement) {
  document
    .querySelectorAll<HTMLButtonElement>(selector)
    .forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
}
document.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode ?? "outline";
    updateButtons("[data-mode]", button);
    schedule();
  });
});
document.querySelectorAll<HTMLButtonElement>("[data-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    vertical = button.dataset.direction === "vertical";
    updateButtons("[data-direction]", button);
    schedule();
  });
});
element("#reset").addEventListener("click", () => {
  text.value = "鬱龍響";
  font.value = "serif";
  size.value = "240";
  stroke.value = "0.8";
  spacing.value = "8";
  mode = "outline";
  vertical = false;
  updateButtons("[data-mode]", element<HTMLButtonElement>('[data-mode="outline"]'));
  updateButtons("[data-direction]", element<HTMLButtonElement>('[data-direction="horizontal"]'));
  schedule();
});
new ResizeObserver(schedule).observe(element("#viewport"));
window.addEventListener("resize", schedule);
void createRenderer(canvas, () => {
  rendererState = "unavailable";
  renderer = undefined;
  schedule();
})
  .then((result) => {
    if (rendererState === "unavailable") return;
    renderer = result;
    rendererState = "ready";
    schedule();
  })
  .catch(() => {
    rendererState = "unavailable";
    schedule();
  });
schedule();
