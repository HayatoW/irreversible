import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import opentype from "opentype.js";
import { build } from "./glyphs.mjs";

describe("font outline extraction", () => {
  const bytes = readFileSync(new URL("../public/fonts/reading-serif.ttf", import.meta.url));
  const font = opentype.parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
  const cps = Object.keys(font.tables.cmap.glyphIndexMap).map(Number);
  const { meta, data } = build(
    font,
    cps.map((cp) => [cp, cp]),
  );

  it("includes the real Japanese and Latin article glyphs", () => {
    for (const name of ["neon", "last-train-home"]) {
      const markdown = readFileSync(
        new URL(`../../blog/pages/posts/${name}.md`, import.meta.url),
        "utf8",
      );
      for (const char of markdown) {
        if (/\s/.test(char)) continue;
        expect(meta.glyphs[char.codePointAt(0)], `missing ${char}`).toBeDefined();
      }
    }
    expect(meta.glyphs["車".codePointAt(0)].n).toBeGreaterThan(0);
    expect(meta.ascent).toBeGreaterThan(0);
  });

  it("packs finite curve data and valid band references for the shader", () => {
    expect(data.every(Number.isFinite)).toBe(true);
    expect(meta.curves).toBeGreaterThan(1000);
    for (const glyph of Object.values(meta.glyphs)) {
      expect(glyph.c + glyph.n).toBeLessThanOrEqual(meta.curves);
      expect((glyph.t + glyph.k * 2) * 4).toBeLessThanOrEqual(data.length);
      for (let band = 0; band < glyph.k * 2; band++) {
        const offset = data[(glyph.t + band) * 4];
        const count = data[(glyph.t + band) * 4 + 1];
        expect((offset + Math.ceil(count / 4)) * 4).toBeLessThanOrEqual(data.length);
        for (let i = 0; i < count; i++) {
          expect(data[offset * 4 + i]).toBeLessThan(meta.curves);
        }
      }
    }
  });
});
