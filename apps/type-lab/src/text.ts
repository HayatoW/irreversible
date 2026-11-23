const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

export function splitText(value: string) {
  return Array.from(segmenter.segment(value), ({ segment }) => segment);
}

export function limitText(value: string) {
  return splitText(value).slice(0, 8).join("");
}
