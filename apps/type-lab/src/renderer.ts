import { bandSegments, type Outlines } from "./geometry";
import { shader } from "./shader";

export type Placement = { char: string; x: number; y: number; size: number };

export async function createRenderer(canvas: HTMLCanvasElement, onLost: () => void) {
  if (!navigator.gpu) throw new Error("WebGPU unavailable");
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No WebGPU adapter");
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) {
    device.destroy();
    throw new Error("No canvas context");
  }
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });
  void device.lost.then(onLost);
  device.addEventListener("uncapturederror", onLost);
  device.pushErrorScope("validation");
  const module = device.createShaderModule({ code: shader });
  const pipeline = await device.createRenderPipelineAsync({
    layout: "auto",
    vertex: { module, entryPoint: "vertex" },
    fragment: {
      module,
      entryPoint: "fragment",
      targets: [
        {
          format,
          blend: {
            color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha" },
            alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
          },
        },
      ],
    },
    primitive: { topology: "triangle-list" },
  });
  const error = await device.popErrorScope();
  if (error) {
    device.destroy();
    throw new Error(error.message);
  }
  let buffers: GPUBuffer[] = [];

  return {
    draw(outlines: Outlines, placements: Placement[], stroke: number, outline: boolean) {
      for (const buffer of buffers) buffer.destroy();
      buffers = [];
      const edges: number[] = [];
      const bands: number[] = [];
      const instance = new ArrayBuffer(Math.max(16, placements.length * 16));
      const view = new DataView(instance);
      let segmentCount = 0;
      placements.forEach((placement, i) => {
        const segments = outlines[placement.char] ?? [];
        const packed = bandSegments(segments);
        const bandOffset = bands.length / 2;
        for (let n = 0; n < packed.bands.length; n += 2) {
          bands.push(packed.bands[n] + edges.length / 4, packed.bands[n + 1]);
        }
        edges.push(...packed.edges);
        segmentCount += segments.length;
        view.setFloat32(i * 16, placement.x, true);
        view.setFloat32(i * 16 + 4, placement.y, true);
        view.setFloat32(i * 16 + 8, placement.size, true);
        view.setUint32(i * 16 + 12, bandOffset, true);
      });
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const settings = new Float32Array([rect.width, rect.height, stroke, outline ? 1 : 0]);
      function buffer(data: ArrayBuffer, uniform = false) {
        const item = device.createBuffer({
          size: Math.max(16, data.byteLength),
          usage:
            (uniform ? GPUBufferUsage.UNIFORM : GPUBufferUsage.STORAGE) | GPUBufferUsage.COPY_DST,
        });
        if (data.byteLength) device.queue.writeBuffer(item, 0, data);
        buffers.push(item);
        return item;
      }
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          settings.buffer,
          new Float32Array(edges).buffer,
          new Uint32Array(bands).buffer,
          instance,
        ].map((data, binding) => ({ binding, resource: { buffer: buffer(data, binding === 0) } })),
      });
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(6, placements.length);
      pass.end();
      device.queue.submit([encoder.finish()]);
      return segmentCount;
    },
  };
}
