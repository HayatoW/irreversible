import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";
import { build } from "./glyphs.mjs";

// The browser loads exactly this static font; never extract from a different
// system face. The bundled subset covers both source articles and ASCII.
const bytes = readFileSync(new URL("../public/fonts/reading-serif.ttf", import.meta.url));
const font = opentype.parse(
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
);
const ranges = Object.keys(font.tables.cmap.glyphIndexMap).map((cp) => [Number(cp), Number(cp)]);
const { meta, data } = build(font, ranges);
const output = new URL("../public/generated/", import.meta.url);
mkdirSync(output, { recursive: true });
writeFileSync(new URL("reading.json", output), JSON.stringify(meta));
writeFileSync(new URL("reading.bin", output), Buffer.from(data.buffer));
console.log(
  `Reading Room: ${Object.keys(meta.glyphs).length} glyphs, ${meta.curves} Bézier curves`,
);
