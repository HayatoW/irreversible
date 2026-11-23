export type Segment = [number, number, number, number];
export type Outlines = Record<string, Segment[]>;
export const BAND_COUNT = 32;
export const BAND_MIN = -0.2;
export const BAND_HEIGHT = 1.4 / BAND_COUNT;
// Includes the maximum 3px outline and its antialiasing footprint at 24px.
export const BAND_PADDING = 0.1;

/** Build-time generated little-endian float32 contours, with a JSON glyph index. */
export function decodeOutlines(index: Record<string, number[]>, buffer: ArrayBuffer): Outlines {
  const view = new DataView(buffer);
  const result: Outlines = {};
  for (const [char, [offset, count]] of Object.entries(index)) {
    const segments: Segment[] = [];
    for (let n = offset; n < offset + count; n++) {
      const i = n * 16;
      segments.push([
        view.getFloat32(i, true),
        view.getFloat32(i + 4, true),
        view.getFloat32(i + 8, true),
        view.getFloat32(i + 12, true),
      ]);
    }
    result[char] = segments;
  }
  return result;
}

/** Duplicate only nearby edges into y bands; retain the complete ray for winding. */
export function bandSegments(segments: Segment[]) {
  const edges: number[] = [];
  const bands: number[] = [];
  for (let band = 0; band < BAND_COUNT; band++) {
    const lo = BAND_MIN + band * BAND_HEIGHT - BAND_PADDING;
    const hi = lo + BAND_HEIGHT + 2 * BAND_PADDING;
    const offset = edges.length / 4;
    for (const edge of segments) {
      if (Math.max(edge[1], edge[3]) >= lo && Math.min(edge[1], edge[3]) <= hi) {
        edges.push(...edge);
      }
    }
    bands.push(offset, edges.length / 4 - offset);
  }
  return { edges: new Float32Array(edges), bands: new Uint32Array(bands) };
}

export function supportedText(text: string, outlines: Outlines) {
  return Array.from(text).every((char) => Object.hasOwn(outlines, char));
}

export function specimenSize(
  width: number,
  count: number,
  size: number,
  spacing: number,
  vertical: boolean,
) {
  const ems = vertical ? 1 : Math.max(1, count) + (Math.max(0, count - 1) * spacing) / size;
  return Math.max(1, Math.min(size, (width - 48) / ems));
}
