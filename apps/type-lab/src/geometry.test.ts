import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import serifIndex from "./assets/serif.json";
import sansIndex from "./assets/sans.json";
import {
  BAND_COUNT,
  BAND_HEIGHT,
  BAND_MIN,
  BAND_PADDING,
  bandSegments,
  decodeOutlines,
  specimenSize,
  supportedText,
} from "./geometry";

const serif = decodeOutlines(
  serifIndex,
  new Uint8Array(readFileSync(new URL("./assets/serif.bin", import.meta.url))).buffer,
);
const sans = decodeOutlines(
  sansIndex,
  new Uint8Array(readFileSync(new URL("./assets/sans.bin", import.meta.url))).buffer,
);

describe("font coverage", () => {
  for (const [name, outlines] of Object.entries({ serif, sans })) {
    it(`${name} contains contours for every sample, with explicit missing-glyph fallback`, () => {
      expect(supportedText("鬱龍響永字八法花鳥風月あいうえお", outlines)).toBe(true);
      expect(supportedText("鬱🧪", outlines)).toBe(false);
      expect(outlines["鬱"].length).toBeGreaterThan(100);
      expect(
        Object.values(outlines).every((segments) =>
          segments.every((segment) => segment.length === 4 && segment.every(Number.isFinite)),
        ),
      ).toBe(true);
    });
  }
});

describe("y-band acceleration", () => {
  it("retains all winding crossings and all nearby edges in each band", () => {
    const segments = serif["鬱"];
    const packed = bandSegments(segments);
    for (let band = 0; band < BAND_COUNT; band++) {
      const y = BAND_MIN + (band + 0.5) * BAND_HEIGHT;
      const offset = packed.bands[band * 2];
      const count = packed.bands[band * 2 + 1];
      const actual = Array.from(packed.edges.slice(offset * 4, (offset + count) * 4));
      const expected = segments.filter(
        (s) => Math.max(s[1], s[3]) >= y - BAND_PADDING && Math.min(s[1], s[3]) <= y + BAND_PADDING,
      );
      for (const segment of expected) {
        const index = actual.findIndex(
          (value, i) =>
            i % 4 === 0 &&
            Math.abs(value - segment[0]) < 0.000001 &&
            segment.every((v, j) => Math.abs(actual[i + j] - v) < 0.000001),
        );
        expect(index).toBeGreaterThanOrEqual(0);
      }
    }
    expect(packed.edges.length).toBeLessThan(segments.length * 4 * BAND_COUNT);
  });
  it("handles spaces without invalid buffer offsets", () => {
    const packed = bandSegments([]);
    expect(packed.edges).toHaveLength(0);
    expect(Array.from(packed.bands)).toEqual(Array(BAND_COUNT * 2).fill(0));
  });
});

describe("responsive specimen sizing", () => {
  it("fits horizontal samples and spacing within a narrow viewport", () => {
    const size = specimenSize(320, 8, 240, 8, false);
    expect(size * 8 + (7 * 8 * size) / 240 + 48).toBeLessThanOrEqual(320);
    const crowded = specimenSize(280, 8, 240, 32, false);
    expect(crowded * 8 + (7 * 32 * crowded) / 240 + 48).toBeLessThanOrEqual(280.001);
    expect(specimenSize(320, 3, 240, 8, true)).toBe(240);
    expect(Number.isFinite(specimenSize(320, 0, 240, 8, false))).toBe(true);
  });
});
