#!/usr/bin/env node
// Adapted from Glyph by Jesper Landberg (MIT). See public/licenses/Glyph.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import opentype from "opentype.js";

/*
 * Glyph outlines for GPU text, extracted ONCE at build time.
 *
 * The shader never samples a rasterised glyph: it solves the glyph's
 * quadratic Bézier outline per pixel. All it needs from the font is every
 * glyph's curve list plus a band index, which is what this writes — a flat
 * Float32 array the client uploads straight into a storage buffer, and a
 * small JSON with the per-glyph offsets and the face's vertical metrics.
 *
 * Parsing the font in the browser works too, but costs ~80KB of parser and a
 * few ms of main thread for a result that never changes.
 *
 *   node glyphs.mjs <font.woff|ttf|otf> <outDir> [id]
 *
 * Units: em, y UP, origin at the pen position on the baseline. A straight
 * segment is stored as a degenerate quadratic (control point at the midpoint)
 * so the shader has exactly one curve type to solve.
 *
 * Output: {id}.json  { curves, ascent, descent, glyphs{cp → c n a b t k} }
 *         {id}.bin   vec4 texels — curves, then each glyph's band tables
 *
 * opentype.js has no Brotli, so it cannot read woff2. Point this at the
 * woff/ttf/otf beside it; the browser still downloads the woff2.
 */

/* The subset. Every glyph in a font is ~600KB of curves; Latin copy fits
   these ranges with room. A character outside them sends its whole element
   back to the DOM (see measure.ts) rather than drawing it with a hole. */
const RANGES = [
  [0x20, 0x7e], // ASCII
  [0xa0, 0xff], // Latin-1
  [0x2010, 0x2027], // dashes, quotes, bullets, ellipsis
  [0x2030, 0x203a],
  [0x20ac, 0x20ac], // €
  [0x2122, 0x2122], // ™
];

/*
 * Band acceleration — the part borrowed from Slug (Lengyel 2017, public
 * domain since March 2026). A glyph's ink box is cut into horizontal bands
 * and each band lists only the curves whose control polygon crosses it, so a
 * pixel tests a handful of curves instead of the glyph's sixty. Within a band
 * the list is sorted by the curve's rightmost x DESCENDING: the shader walks
 * in +x, so once a curve lies wholly left of the pixel every later one does
 * too and the loop breaks. Roughly a band per six curves, capped.
 *
 * Vertical bands (sorted by top y) are written too: only the Slug mode's
 * second ray reads them.
 */
const MAX_BANDS = 16;

export function build(font, ranges = RANGES) {
  const upm = font.unitsPerEm;

  const glyphs = {};
  const curves = [];
  const seen = new Map();

  for (const [lo, hi] of ranges) {
    for (let cp = lo; cp <= hi; cp++) {
      const glyph = font.charToGlyph(String.fromCodePoint(cp));
      if (!glyph || glyph.index === 0) continue;

      /* several codepoints can share a glyph (space / nbsp) — store once */
      if (seen.has(glyph.index)) {
        glyphs[cp] = seen.get(glyph.index);
        continue;
      }

      const start = curves.length;
      let x = 0,
        y = 0,
        sx = 0,
        sy = 0;
      let xmin = Infinity,
        ymin = Infinity,
        xmax = -Infinity,
        ymax = -Infinity;

      const push = (x0, y0, x1, y1, x2, y2) => {
        curves.push(x0 / upm, y0 / upm, x1 / upm, y1 / upm, x2 / upm, y2 / upm);
        for (const [px, py] of [
          [x0, y0],
          [x1, y1],
          [x2, y2],
        ]) {
          if (px < xmin) xmin = px;
          if (px > xmax) xmax = px;
          if (py < ymin) ymin = py;
          if (py > ymax) ymax = py;
        }
      };

      for (const c of glyph.path.commands) {
        switch (c.type) {
          case "M":
            x = sx = c.x;
            y = sy = c.y;
            break;
          case "L":
            push(x, y, (x + c.x) / 2, (y + c.y) / 2, c.x, c.y);
            x = c.x;
            y = c.y;
            break;
          case "Q":
            push(x, y, c.x1, c.y1, c.x, c.y);
            x = c.x;
            y = c.y;
            break;
          case "C": {
            /*
             * A CFF outline. Split the cubic at t = .5 (de Casteljau) and
             * give each half the quadratic whose control point is
             * (3(c1 + c2) - c0 - c3) / 4. Two per cubic is plenty at text
             * sizes: the error is well under a font unit.
             *
             * Taking that control point for the WHOLE cubic instead puts it
             * well outside the curve — every round letter comes out with
             * bulging, squared-off corners.
             */
            const a1x = (x + c.x1) / 2,
              a1y = (y + c.y1) / 2;
            const a2x = (x + 2 * c.x1 + c.x2) / 4,
              a2y = (y + 2 * c.y1 + c.y2) / 4;
            const mx = (x + 3 * c.x1 + 3 * c.x2 + c.x) / 8,
              my = (y + 3 * c.y1 + 3 * c.y2 + c.y) / 8;
            const b1x = (c.x1 + 2 * c.x2 + c.x) / 4,
              b1y = (c.y1 + 2 * c.y2 + c.y) / 4;
            const b2x = (c.x2 + c.x) / 2,
              b2y = (c.y2 + c.y) / 2;
            push(x, y, (3 * (a1x + a2x) - x - mx) / 4, (3 * (a1y + a2y) - y - my) / 4, mx, my);
            push(
              mx,
              my,
              (3 * (b1x + b2x) - mx - c.x) / 4,
              (3 * (b1y + b2y) - my - c.y) / 4,
              c.x,
              c.y,
            );
            x = c.x;
            y = c.y;
            break;
          }
          case "Z":
            if (x !== sx || y !== sy) push(x, y, (x + sx) / 2, (y + sy) / 2, sx, sy);
            x = sx;
            y = sy;
            break;
        }
      }

      const count = (curves.length - start) / 6;
      const first = start / 6;

      /* axis 1 = cut on y (horizontal bands, sorted by max x),
			   axis 0 = cut on x (vertical bands, sorted by max y) */
      const nb = Math.max(1, Math.min(MAX_BANDS, Math.ceil(count / 6)));
      const bands = (axis) => {
        const lo0 = axis ? ymin : xmin,
          hi0 = axis ? ymax : xmax;
        const out = [];
        for (let b = 0; b < nb; b++) {
          const b0 = lo0 + ((hi0 - lo0) * b) / nb;
          const b1 = lo0 + ((hi0 - lo0) * (b + 1)) / nb;
          const list = [];
          for (let c = 0; c < count; c++) {
            const s6 = (first + c) * 6;
            const cut = [curves[s6 + axis], curves[s6 + 2 + axis], curves[s6 + 4 + axis]].map(
              (v) => v * upm,
            );
            const along = [curves[s6 + 1 - axis], curves[s6 + 3 - axis], curves[s6 + 5 - axis]];
            /* the control polygon bounds the curve, so this never misses */
            if (Math.max(...cut) < b0 || Math.min(...cut) > b1) continue;
            list.push({ i: first + c, m: Math.max(...along) });
          }
          list.sort((a, b) => b.m - a.m);
          out.push(list.map((l) => l.i));
        }
        return out;
      };

      const entry = {
        /* first curve, curve count */
        c: first,
        n: count,
        /* advance and ink box, em */
        a: glyph.advanceWidth / upm,
        b: count ? [xmin / upm, ymin / upm, xmax / upm, ymax / upm] : [0, 0, 0, 0],
        /* band table texel (k horizontal bands, then k vertical) — set
				   once the curve region is sized */
        t: 0,
        k: nb,
        _bands: [...bands(1), ...bands(0)],
      };

      glyphs[cp] = entry;
      seen.set(glyph.index, entry);
    }
  }

  /*
   * Pack. Curves first, two texels each: (x0 y0 x1 y1) (x2 y2 0 0), so curve
   * i is texels 2i and 2i+1. Then per glyph its band table: one header texel
   * per band, (offset count), pointing at a run of texels holding four curve
   * indices each.
   */
  const texels = [];

  for (let i = 0; i < curves.length; i += 6) {
    texels.push(curves[i], curves[i + 1], curves[i + 2], curves[i + 3]);
    texels.push(curves[i + 4], curves[i + 5], 0, 0);
  }

  for (const entry of seen.values()) {
    entry.t = texels.length / 4;

    const header = texels.length;
    for (let b = 0; b < entry.k * 2; b++) texels.push(0, 0, 0, 0);

    entry._bands.forEach((list, b) => {
      texels[header + b * 4] = texels.length / 4;
      texels[header + b * 4 + 1] = list.length;
      for (let i = 0; i < list.length; i += 4) {
        texels.push(list[i], list[i + 1] ?? 0, list[i + 2] ?? 0, list[i + 3] ?? 0);
      }
    });

    delete entry._bands;
  }

  const hhea = font.tables.hhea;

  return {
    meta: {
      curves: curves.length / 6,
      /* the browser's content box for this face: a text Range's rect is
			   exactly ascent + descent tall, which is how the client finds the
			   baseline inside a measured rect — see measure.ts */
      ascent: hhea.ascender / upm,
      descent: -hhea.descender / upm,
      glyphs,
    },
    data: new Float32Array(texels),
  };
}

/* CLI */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [file, outDir, id = basename(file).replace(/\.(woff|ttf|otf)$/i, "")] =
    process.argv.slice(2);

  if (!file || !outDir) {
    console.error("usage: node glyphs.mjs <font.woff|ttf|otf> <outDir> [id]");
    process.exit(1);
  }

  const buf = readFileSync(file);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const { meta, data } = build(font);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `${id}.bin`), Buffer.from(data.buffer));
  writeFileSync(join(outDir, `${id}.json`), JSON.stringify(meta));

  console.log(
    `${id}: ${Object.keys(meta.glyphs).length} glyphs, ${meta.curves} curves, ${(data.byteLength / 1024).toFixed(0)} KB`,
  );

  /*
   * Said once, because it is a licensing call and not an implementation
   * detail: the .bin is the face's outlines in an open format, served
   * publicly. A webfont licence covers serving the woff2; it does not
   * obviously cover a derivative anyone can rebuild a subset font from.
   * Fine for OFL faces. Check before doing it with a commercial one.
   */
  console.log(
    "note: this is outline data for the face, publicly served — check the licence of commercial faces",
  );
}
