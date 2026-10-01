#!/usr/bin/env python3
"""Bake glyph outlines for the language-switch morph (src/lib/morph).

The morph animates the real letter shapes, so it needs outlines of the exact
variable fonts the site uses, at the weights the animated text is set in.
Browsers don't expose glyph outlines, so they are extracted here once and
committed as small JSON files (one per family/weight, loaded on demand).

Re-run after adding text with characters that aren't covered yet, or a new weight:
    pip install fonttools brotli
    python3 scripts/morph-glyphs.py
Characters missing at runtime simply aren't morphed (the text switches as usual).
"""
import json
import pathlib
import re

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/lib/morph/glyphs'
FS = ROOT / 'node_modules/@fontsource-variable'

# family key -> (fontsource package, file prefix, weights to bake)
FAMILIES = {
    'archivo': ('archivo', 'archivo', [300, 400, 500, 600, 700, 800, 900]),
    'inter': ('inter', 'inter', [300, 400, 500, 600, 700]),
    'mono': ('jetbrains-mono', 'jetbrains-mono', [300, 400, 500, 600, 700]),
}
UPM = 1000  # outlines are normalised to a 1000-unit em


def charset() -> set[str]:
    """Every character the site's UI text and article titles can contain (plus case variants)."""
    text = ''.join(chr(c) for c in range(0x20, 0x7F)) + 'áéíóöőúüűÁÉÍÓÖŐÚÜŰ€–—’“”„…·'
    for p in list((ROOT / 'src/i18n').glob('*.ts')) + list((ROOT / 'src/data').glob('*.ts')):
        text += p.read_text(encoding='utf-8')
    for p in (ROOT / 'src/content/articles').glob('*/*.md'):
        m = re.search(r'^title:\s*(.*)$', p.read_text(encoding='utf-8'), re.M)
        if m:
            text += m.group(1)
    chars = set(text) | set(text.upper()) | set(text.lower())
    return {c for c in chars if c.isprintable() and not c.isspace()}


class SvgPen(BasePen):
    """Absolute SVG path data, y flipped to screen space, scaled to UPM, integer coordinates."""

    def __init__(self, glyphset, scale):
        super().__init__(glyphset)
        self.s = scale
        self.d: list[str] = []

    def p(self, pt):
        return f'{round(pt[0] * self.s)} {round(-pt[1] * self.s)}'

    def _moveTo(self, pt):
        self.d.append('M' + self.p(pt))

    def _lineTo(self, pt):
        self.d.append('L' + self.p(pt))

    def _qCurveToOne(self, p1, p2):
        self.d.append('Q' + self.p(p1) + ' ' + self.p(p2))

    def _curveToOne(self, p1, p2, p3):
        self.d.append('C' + self.p(p1) + ' ' + self.p(p2) + ' ' + self.p(p3))

    def _closePath(self):
        self.d.append('Z')


def bake(family: str, pkg: str, prefix: str, weight: int, chars: set[str]) -> dict:
    glyphs: dict[str, list] = {}
    meta = {}
    for subset in ('latin', 'latin-ext'):  # latin wins where both cover a character
        src = FS / pkg / 'files' / f'{prefix}-{subset}-wght-normal.woff2'
        font = instancer.instantiateVariableFont(TTFont(src), {'wght': weight})
        scale = UPM / font['head'].unitsPerEm
        if not meta:
            meta = {'asc': round(font['hhea'].ascent * scale), 'desc': round(-font['hhea'].descent * scale)}
        cmap = font.getBestCmap()
        gs = font.getGlyphSet()
        hmtx = font['hmtx']
        for ch in sorted(chars):
            if ch in glyphs or ord(ch) not in cmap:
                continue
            name = cmap[ord(ch)]
            pen = SvgPen(gs, scale)
            gs[name].draw(pen)
            glyphs[ch] = [round(hmtx[name][0] * scale), ''.join(pen.d)]
    return {'family': family, 'weight': weight, 'upm': UPM, **meta, 'g': glyphs}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    chars = charset()
    for family, (pkg, prefix, weights) in FAMILIES.items():
        for w in weights:
            data = bake(family, pkg, prefix, w, chars)
            out = OUT / f'{family}-{w}.json'
            out.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
            print(f'{out.relative_to(ROOT)}  {len(data["g"])} glyphs  {out.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
