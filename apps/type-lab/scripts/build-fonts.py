"""Regenerate the bundled OFL font subsets and vector outlines.

Requires Python 3, fonttools==4.65.0, brotli==1.2.1.
No font downloads or Python are needed for normal development or CI.
"""

import io
import json
import struct
from pathlib import Path
from urllib.request import urlopen

from fontTools import subset
from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
REVISION = "06bfe0d62a98375cb09c942fa18e68bd32cff057"
BASE = f"https://raw.githubusercontent.com/google/fonts/{REVISION}/ofl"
# A deliberately small, inspectable lab alphabet, plus kana and ASCII.
TEXT = "鬱龍響鷹麒麟鳳凰薔薇檸檬憂鬱永字八法書体日本語文字輪郭実験室余白光影風花鳥月山水空海森雲雨雪春夏秋冬東京京都大阪美明朝角丸黒白赤青緑紫縦横組線点曲直言葉心夢愛無限未来静動高密度漢複雑透明境界描画比較細太強弱新古形象奥行"
TEXT += "".join(chr(n) for n in range(0x3041, 0x3097))
TEXT += "".join(chr(n) for n in range(0x30A1, 0x30FB))
TEXT += "".join(chr(n) for n in range(32, 127)) + "、。ー「」！？・"


class OutlinePen(BasePen):
    def __init__(self, glyph_set, units):
        super().__init__(glyph_set)
        self.units = units
        self.segments = []

    def point(self, p):
        return (p[0] / self.units, 0.88 - p[1] / self.units)

    def _moveTo(self, p):
        self.current = self.start = self.point(p)

    def line(self, p):
        if p != self.current:
            self.segments.append([*self.current, *p])
        self.current = p

    def _lineTo(self, p):
        self.line(self.point(p))

    def _qCurveToOne(self, control, end):
        a, b, c = self.current, self.point(control), self.point(end)
        # Adaptive subdivision to < 0.00025 em chord error.
        def flatten(p, q, r):
            if max(abs(p[i] - 2 * q[i] + r[i]) for i in range(2)) < 0.001:
                self.line(r)
                return
            pq = tuple((p[i] + q[i]) / 2 for i in range(2))
            qr = tuple((q[i] + r[i]) / 2 for i in range(2))
            mid = tuple((pq[i] + qr[i]) / 2 for i in range(2))
            flatten(p, pq, mid)
            flatten(mid, qr, r)
        flatten(a, b, c)

    def _curveToOne(self, b, c, d):
        a, b, c, d = self.current, self.point(b), self.point(c), self.point(d)
        def flatten(p, q, r, s):
            error = max(abs(p[i] - 2*q[i] + r[i]) + abs(q[i] - 2*r[i] + s[i]) for i in range(2))
            if error < 0.001:
                self.line(s)
                return
            pq, qr, rs = [tuple((u[i]+v[i])/2 for i in range(2)) for u,v in [(p,q),(q,r),(r,s)]]
            left = tuple((pq[i]+qr[i])/2 for i in range(2))
            right = tuple((qr[i]+rs[i])/2 for i in range(2))
            mid = tuple((left[i]+right[i])/2 for i in range(2))
            flatten(p,pq,left,mid)
            flatten(mid,right,rs,s)
        flatten(a,b,c,d)

    def _closePath(self):
        self.line(self.start)

    def _endPath(self):
        pass


for family in ("serif", "sans"):
    upstream = f"noto{family}jp"
    name = f"Noto{family.title()}JP"
    print(f"Building {name}…", flush=True)
    font = TTFont(io.BytesIO(urlopen(f"{BASE}/{upstream}/{name}%5Bwght%5D.ttf").read()))
    font = instantiateVariableFont(font, {"wght": 400}, inplace=True)
    options = subset.Options()
    options.recalc_timestamp = False
    sub = subset.Subsetter(options=options)
    sub.populate(text=TEXT)
    sub.subset(font)
    glyph_set = font.getGlyphSet()
    outlines = {}
    edges = []
    for codepoint, glyph_name in sorted(font.getBestCmap().items()):
        pen = OutlinePen(glyph_set, font["head"].unitsPerEm)
        glyph_set[glyph_name].draw(pen)
        outlines[chr(codepoint)] = [len(edges) // 4, len(pen.segments)]
        edges.extend(value for line in pen.segments for value in line)
    (ROOT / f"src/assets/{family}.json").write_text(json.dumps(outlines, ensure_ascii=False, indent=2) + "\n")
    (ROOT / f"src/assets/{family}.bin").write_bytes(struct.pack(f"<{len(edges)}f", *edges))
    font.flavor = "woff2"
    font.save(ROOT / f"public/fonts/{family}.woff2")
    (ROOT / f"public/fonts/{family}-OFL.txt").write_bytes(urlopen(f"{BASE}/{upstream}/OFL.txt").read())
