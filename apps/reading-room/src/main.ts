import "./style.css";
import { articles, renderArticle } from "./articles";
import { TextRenderer } from "./renderer";

const article = document.querySelector<HTMLElement>("#article")!;
const surface = document.querySelector<HTMLElement>("#surface")!;
const contents = document.querySelector<HTMLElement>("#contents")!;
const picker = document.querySelector<HTMLSelectElement>("#post")!;
const seam = document.querySelector<HTMLInputElement>("#seam")!;
const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-split]")];
const status = document.querySelector<HTMLElement>("#status")!;
const metrics = document.querySelector<HTMLElement>("#metrics")!;
const ratio = document.querySelector<HTMLElement>("#ratio")!;
let renderer: TextRenderer | undefined;
let split = 50;
let ready = false;

function setSplit(value: number): void {
  split = Math.min(100, Math.max(0, value));
  seam.value = String(split);
  seam.setAttribute("aria-valuetext", `DOM ${split}%、GPU ${100 - split}%`);
  // Account for the native thumb's 16px radius so its centre and the seam
  // align exactly at every value, including both article edges.
  const page = document.querySelector<HTMLElement>(".comparison-head")!.getBoundingClientRect();
  const bounds = surface.getBoundingClientRect();
  seam.style.left = `${bounds.left - page.left - 16}px`;
  seam.style.width = `${bounds.width + 32}px`;
  surface.style.setProperty("--split", `${split}%`);
  surface.querySelector<HTMLElement>(".seam-line")!.hidden = split === 0 || split === 100;
  ratio.textContent = ready ? `DOM ${split} / GPU ${100 - split}` : "DOM 100 / GPU 0";
  buttons.forEach((button) =>
    button.setAttribute("aria-pressed", String(Number(button.dataset.split) === split)),
  );
  renderer?.setSplit(split);
}

function selectArticle(): void {
  const key = picker.value as keyof typeof articles;
  renderArticle(articles[key], article, contents);
  document.querySelector<HTMLElement>("#folio")!.textContent =
    key === "neon" ? "01 / 02" : "02 / 02";
  document.title = `${articles[key].title} — Reading Room`;
  renderer?.rebuild();
  setSplit(split);
}

function fallback(): void {
  ready = false;
  renderer = undefined;
  document.body.dataset.gpu = "unavailable";
  document.querySelector<HTMLElement>("#fallback")!.hidden = false;
  status.textContent = "DOM FALLBACK";
  metrics.textContent = "NATIVE DOM TEXT / WEBGPU UNAVAILABLE";
  seam.disabled = true;
  buttons.forEach((button) => {
    button.disabled = button.dataset.split !== "100";
  });
  setSplit(100);
}

buttons.forEach((button) =>
  button.addEventListener("click", () => setSplit(Number(button.dataset.split))),
);
seam.addEventListener("input", () => setSplit(Number(seam.value)));
picker.addEventListener("change", selectArticle);
window.addEventListener("resize", () => setSplit(split));
// Browser find shows native text. Print CSS hides the overlay without
// changing the on-screen split, including when print preview is cancelled.
window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") setSplit(100);
});
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) renderer?.dispose();
});
selectArticle();

async function start(): Promise<void> {
  try {
    await document.fonts.ready;
    const created = await TextRenderer.create(article, surface, fallback, (count) => {
      metrics.textContent = `${count} GLYPHS / GPU BÉZIER OUTLINES`;
    });
    // Initial layout can fail synchronously on limited devices.
    if (document.body.dataset.gpu === "unavailable") return;
    renderer = created;
    ready = true;
    document.body.dataset.gpu = "ready";
    status.textContent = "WEBGPU ACTIVE";
    seam.disabled = false;
    setSplit(split);
  } catch {
    fallback();
  }
}
void start();
