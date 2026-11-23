// Original banded nonzero-winding renderer. No glyph bitmaps or texture atlases.
export const shader = /* wgsl */ `
struct Settings {
  viewport: vec2f,
  stroke: f32,
  outline: f32,
};
struct Glyph {
  origin: vec2f,
  size: f32,
  bandOffset: u32,
};
@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read> edges: array<vec4f>;
@group(0) @binding(2) var<storage, read> bands: array<vec2u>;
@group(0) @binding(3) var<storage, read> glyphs: array<Glyph>;
struct Vertex {
  @builtin(position) position: vec4f,
  @location(0) local: vec2f,
  @location(1) @interpolate(flat) glyph: u32,
};
@vertex fn vertex(@builtin(vertex_index) vertex: u32, @builtin(instance_index) instance: u32) -> Vertex {
  let corners = array(vec2f(0,0),vec2f(1,0),vec2f(0,1),vec2f(0,1),vec2f(1,0),vec2f(1,1));
  let local = corners[vertex] * 1.4 - 0.2;
  let pixel = glyphs[instance].origin + local * glyphs[instance].size;
  var result: Vertex;
  result.position = vec4f(pixel / settings.viewport * vec2f(2,-2) + vec2f(-1,1),0,1);
  result.local = local;
  result.glyph = instance;
  return result;
}
@fragment fn fragment(in: Vertex) -> @location(0) vec4f {
  let p = in.local;
  let glyph = glyphs[in.glyph];
  let band = u32(clamp(floor((p.y + 0.2) / (1.4 / 32.0)),0.0,31.0));
  let range = bands[glyph.bandOffset + band];
  var winding = 0;
  var distance = 100.0;
  for (var i = 0u; i < range.y; i++) {
    let edge = edges[range.x + i];
    let a = edge.xy;
    let b = edge.zw;
    let delta = b - a;
    let t = clamp(dot(p-a,delta) / max(dot(delta,delta),0.0000000001),0.0,1.0);
    distance = min(distance,length(p - (a + t * delta)));
    if ((a.y <= p.y && b.y > p.y) || (b.y <= p.y && a.y > p.y)) {
      let crossing = a.x + (p.y-a.y) * delta.x / delta.y;
      if (crossing > p.x) { winding += select(-1,1,b.y > a.y); }
    }
  }
  let pixel = 1.0 / glyph.size;
  var coverageDistance = select(distance,-distance,winding != 0);
  if (settings.outline > 0.5) { coverageDistance = distance - settings.stroke * 0.5 * pixel; }
  let alpha = 1.0 - smoothstep(-0.65 * pixel,0.65 * pixel,coverageDistance);
  let ink = vec3f(0.76,0.23,0.13);
  return vec4f(ink,alpha);
}
`;
