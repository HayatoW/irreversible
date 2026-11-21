import "./style.css";
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  DirectionalLight,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Spherical,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import modelUrl from "./assets/field-desk.glb?url";

const presets = {
  overview: { position: [1.47, 1.35, 2.02], target: [0, 0.315, 0] },
  rear: { position: [0.14, 0.96, -2.63], target: [0, 0.385, 0] },
  joint: { position: [0.877, 0.809, 0.426], target: [0.585, 0.707, 0.323] },
} as const;
type View = keyof typeof presets;

const viewport = document.querySelector<HTMLDivElement>("#viewport")!;
const canvas = document.querySelector<HTMLCanvasElement>("#scene")!;
const poster = document.querySelector<HTMLImageElement>(".poster")!;
const status = document.querySelector<HTMLSpanElement>("#status")!;
const fallback = document.querySelector<HTMLParagraphElement>("#fallback")!;
const help = document.querySelector<HTMLParagraphElement>("#controls-help")!;
const viewButtons = document.querySelectorAll<HTMLButtonElement>(".presets button");
const toolbarButtons = document.querySelectorAll<HTMLButtonElement>(".toolbar button");

function showStatus(state: "ready" | "loading" | "static", label: string) {
  status.dataset.state = state;
  status.textContent = label;
}

function showStillImage(message: string) {
  showStatus("static", "Still image");
  poster.hidden = false;
  canvas.hidden = true;
  fallback.textContent = message;
  fallback.hidden = false;
  help.hidden = true;
  for (const button of toolbarButtons) {
    button.disabled = true;
  }
}

function setActiveView(view?: View) {
  for (const button of viewButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.view === view));
  }
}

function addGroundShadows(scene: Scene) {
  const source = document.createElement("canvas");
  source.width = source.height = 128;
  const context = source.getContext("2d");
  if (!context) return;

  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.54)");
  gradient.addColorStop(0.75, "rgba(255, 255, 255, 0.12)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const map = new CanvasTexture(source);
  const geometry = new PlaneGeometry(1, 1);
  const soft = new MeshBasicMaterial({
    map,
    color: 0x4d5549,
    transparent: true,
    opacity: 0.29,
    depthWrite: false,
  });
  const ambientShadow = new Mesh(geometry, soft);
  ambientShadow.scale.set(1.75, 1.25, 1);
  ambientShadow.rotation.x = -Math.PI / 2;
  ambientShadow.position.set(0, -0.002, -0.035);
  scene.add(ambientShadow);

  const contact = soft.clone();
  contact.opacity = 0.61;
  for (const x of [-0.5875, 0.5875]) {
    for (const z of [-0.375, 0.375]) {
      const shadow = new Mesh(geometry, contact);
      shadow.position.set(x, -0.001, z);
      shadow.scale.setScalar(0.102);
      shadow.rotation.x = -Math.PI / 2;
      shadow.renderOrder = 1;
      scene.add(shadow);
    }
  }
}

async function start() {
  showStatus("loading", "Loading model");
  if (!canvas.getContext("webgl2", { antialias: true, alpha: true })) {
    showStillImage("This browser could not start WebGL 2.");
    return;
  }

  let renderer: WebGLRenderer | undefined;
  let observer: ResizeObserver | undefined;
  let frame = 0;
  function stop(message: string) {
    observer?.disconnect();
    cancelAnimationFrame(frame);
    renderer?.dispose();
    showStillImage(message);
  }
  canvas.addEventListener("webglcontextlost", () => stop("The 3D display was interrupted."), {
    once: true,
  });

  try {
    const gltf = await new GLTFLoader().loadAsync(modelUrl);
    if (canvas.getContext("webgl2")?.isContextLost()) return;

    const view = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer = view;
    view.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    view.toneMapping = ACESFilmicToneMapping;
    view.toneMappingExposure = 1.02;

    const scene = new Scene();
    const room = new RoomEnvironment();
    const pmrem = new PMREMGenerator(view);
    scene.environment = pmrem.fromScene(room, 0.035).texture;
    scene.environmentIntensity = 0.82;
    room.dispose();
    pmrem.dispose();

    const fill = new HemisphereLight(0xf0f5ff, 0x9f9b8c, 0.52);
    const key = new DirectionalLight(0xfff6e8, 1.25);
    key.position.set(-2.7, 4.1, 2.8);
    const rim = new DirectionalLight(0xf2f7ff, 0.7);
    rim.position.set(3, 2.5, -3);
    scene.add(gltf.scene, fill, key, rim);
    addGroundShadows(scene);

    const camera = new PerspectiveCamera(32, 1, 0.01, 20);
    const orbit = new OrbitControls(camera, canvas);
    orbit.enablePan = false;
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.16;
    orbit.minDistance = 0.145;
    orbit.maxDistance = 5.1;
    orbit.minPolarAngle = 0.07;
    orbit.maxPolarAngle = Math.PI / 2 + 0.055;

    const render = () => view.render(scene, camera);
    function scheduleRender() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        orbit.update();
        render();
      });
    }

    function resize() {
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      // 表示領域が静止画（5:4）より縦長なら、静止画と同じ横方向の画角を保つ。
      const fit = Math.min(1, camera.aspect / 1.25);
      camera.fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(16)) / fit));
      camera.updateProjectionMatrix();
      view.setSize(width, height, false);
      scheduleRender();
    }

    function setView(name: View) {
      const preset = presets[name];
      // カメラを移動する前に、ドラッグ操作による慣性をリセットする。
      orbit.enableDamping = false;
      orbit.update();
      camera.position.fromArray(preset.position);
      orbit.target.fromArray(preset.target);
      orbit.update();
      orbit.enableDamping = true;
      setActiveView(name);
      scheduleRender();
    }

    function zoom(factor: number) {
      const offset = camera.position.clone().sub(orbit.target);
      const distance = MathUtils.clamp(
        offset.length() * factor,
        orbit.minDistance,
        orbit.maxDistance,
      );
      camera.position.copy(orbit.target).add(offset.setLength(distance));
      orbit.update();
      setActiveView();
      scheduleRender();
    }

    function rotate(azimuth: number, elevation: number) {
      const offset = new Spherical().setFromVector3(camera.position.clone().sub(orbit.target));
      offset.theta += azimuth;
      offset.phi = MathUtils.clamp(
        offset.phi + elevation,
        orbit.minPolarAngle,
        orbit.maxPolarAngle,
      );
      camera.position.copy(orbit.target).add(new Vector3().setFromSpherical(offset));
      orbit.update();
      setActiveView();
      scheduleRender();
    }

    const keyActions = new Map(
      Object.entries({
        ArrowLeft: () => rotate(-0.14, 0),
        ArrowRight: () => rotate(0.14, 0),
        ArrowUp: () => rotate(0, -0.14),
        ArrowDown: () => rotate(0, 0.14),
        "+": () => zoom(0.82),
        "=": () => zoom(0.82),
        "-": () => zoom(1.22),
        Home: () => setView("overview"),
      }),
    );
    canvas.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const action = keyActions.get(event.key);
      if (!action) return;
      event.preventDefault();
      action();
    });
    for (const button of viewButtons) {
      button.addEventListener("click", () => setView(button.dataset.view as View));
    }
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-zoom]")) {
      button.addEventListener("click", () => zoom(button.dataset.zoom === "in" ? 0.82 : 1.22));
    }
    document.querySelector("#reset")?.addEventListener("click", () => setView("overview"));

    orbit.addEventListener("change", scheduleRender);
    orbit.addEventListener("start", () => setActiveView());
    setView("overview");
    resize();
    render();
    observer = new ResizeObserver(resize);
    observer.observe(viewport);
    canvas.tabIndex = 0;
    canvas.hidden = false;
    poster.hidden = true;
    help.hidden = false;
    for (const button of toolbarButtons) {
      button.disabled = false;
    }
    showStatus("ready", "Interactive");
  } catch (error) {
    console.error("Could not initialize the field desk viewer", error);
    stop("The 3D model could not be loaded.");
  }
}

void start();
