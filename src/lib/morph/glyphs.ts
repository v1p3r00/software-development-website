/**
 * Glyph outlines for the language-switch morph.
 *
 * Browsers don't expose glyph geometry, so the outlines of the site's variable
 * fonts are baked per family/weight by scripts/morph-glyphs.py into ./glyphs/*.json
 * (≈14 KB gzipped each) and loaded on demand. Paths are in a 1000-unit em,
 * y pointing down, origin at the pen position on the baseline.
 */

export interface GlyphFont {
  family: string;
  weight: number;
  upm: number;
  /** hhea ascent / descent (positive), used to find the baseline inside a character's box */
  asc: number;
  desc: number;
  /** character → [advance, SVG path data] */
  g: Record<string, [number, string]>;
}

/** A closed contour flattened to a polyline (em units). */
export interface Ring {
  pts: number[];
  /** signed area: the sign gives the winding direction */
  area: number;
  cx: number;
  cy: number;
  len: number;
}

export interface GlyphShape {
  rings: Ring[];
  /** the exact outline as a canvas path, built on first use */
  p2d?: Path2D;
  /** bounding-box centre (em units) — glyphs rotate and stretch around it */
  cx: number;
  cy: number;
  path: string;
}

type Family = 'archivo' | 'inter' | 'mono';

const WEIGHTS: Record<Family, number[]> = {
  archivo: [300, 400, 500, 600, 700, 800, 900],
  inter: [300, 400, 500, 600, 700],
  mono: [300, 400, 500, 600, 700],
};

const loaders = import.meta.glob<GlyphFont>('./glyphs/*.json', { import: 'default' });
const fonts = new Map<string, GlyphFont>();
const pending = new Map<string, Promise<void>>();
const shapes = new Map<string, GlyphShape | null>();

/** 'archivo-800' for a computed font-family / font-weight, or null if the family isn't baked */
export function fontKey(fontFamily: string, fontWeight: string): string | null {
  const f = fontFamily.toLowerCase();
  const family: Family | null = f.includes('archivo')
    ? 'archivo'
    : f.includes('jetbrains')
      ? 'mono'
      : f.includes('inter')
        ? 'inter'
        : null;
  if (!family) return null;
  const w = Number.parseFloat(fontWeight) || 400;
  const nearest = WEIGHTS[family].reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a));
  return `${family}-${nearest}`;
}

export const getFont = (key: string) => fonts.get(key);

export function loadFont(key: string): Promise<void> {
  if (fonts.has(key)) return Promise.resolve();
  let p = pending.get(key);
  if (!p) {
    const load = loaders[`./glyphs/${key}.json`];
    p = load
      ? load()
          .then((font) => void fonts.set(key, font))
          .catch(() => void pending.delete(key))
      : Promise.resolve();
    pending.set(key, p);
  }
  return p;
}

/** Flatten an SVG path (M/L/Q/C/Z, absolute) into closed polylines. */
function flatten(d: string): Ring[] {
  const rings: Ring[] = [];
  let pts: number[] = [];
  let x = 0;
  let y = 0;
  const close = () => {
    // drop a duplicated closing point
    const n = pts.length;
    if (n >= 4 && Math.abs(pts[0] - pts[n - 2]) < 1e-6 && Math.abs(pts[1] - pts[n - 1]) < 1e-6) pts.length = n - 2;
    if (pts.length >= 6) rings.push(ringOf(pts));
    pts = [];
  };
  for (const [, cmd, args] of d.matchAll(/([MLQCZ])([^MLQCZ]*)/g)) {
    const v = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    if (cmd === 'M') {
      if (pts.length) close();
      [x, y] = v;
      pts.push(x, y);
    } else if (cmd === 'L') {
      [x, y] = v;
      pts.push(x, y);
    } else if (cmd === 'Q') {
      const [x1, y1, x2, y2] = v;
      for (let i = 1; i <= 6; i++) {
        const t = i / 6;
        const u = 1 - t;
        pts.push(u * u * x + 2 * u * t * x1 + t * t * x2, u * u * y + 2 * u * t * y1 + t * t * y2);
      }
      [x, y] = [x2, y2];
    } else if (cmd === 'C') {
      const [x1, y1, x2, y2, x3, y3] = v;
      for (let i = 1; i <= 8; i++) {
        const t = i / 8;
        const u = 1 - t;
        pts.push(
          u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
          u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
        );
      }
      [x, y] = [x3, y3];
    } else {
      close();
    }
  }
  if (pts.length) close();
  return rings;
}

function ringOf(pts: number[]): Ring {
  const n = pts.length / 2;
  let area = 0;
  let cx = 0;
  let cy = 0;
  let len = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const x0 = pts[2 * i];
    const y0 = pts[2 * i + 1];
    const x1 = pts[2 * j];
    const y1 = pts[2 * j + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
    len += Math.hypot(x1 - x0, y1 - y0);
  }
  area /= 2;
  if (Math.abs(area) > 1e-6) {
    cx /= 6 * area;
    cy /= 6 * area;
  } else {
    cx = cy = 0;
    for (let i = 0; i < n; i++) {
      cx += pts[2 * i] / n;
      cy += pts[2 * i + 1] / n;
    }
  }
  return { pts, area, cx, cy, len };
}

/** Outline of one character, or null when the font has no (visible) glyph for it. */
export function glyphShape(key: string, ch: string): GlyphShape | null {
  const id = `${key}|${ch}`;
  const hit = shapes.get(id);
  if (hit !== undefined) return hit;
  const font = fonts.get(key);
  const entry = font?.g[ch];
  let shape: GlyphShape | null = null;
  if (entry && entry[1]) {
    const rings = flatten(entry[1]);
    if (rings.length) {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const r of rings)
        for (let i = 0; i < r.pts.length; i += 2) {
          x0 = Math.min(x0, r.pts[i]);
          x1 = Math.max(x1, r.pts[i]);
          y0 = Math.min(y0, r.pts[i + 1]);
          y1 = Math.max(y1, r.pts[i + 1]);
        }
      shape = { rings, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, path: entry[1] };
    }
  }
  if (font) shapes.set(id, shape); // only cache once the font is known
  return shape;
}

/**
 * Resample a ring to n evenly spaced points, scaled to px and expressed
 * relative to (ox, oy) — the glyph's centre in em units.
 */
export function resample(r: Ring, n: number, scale: number, ox: number, oy: number): Float32Array {
  const out = new Float32Array(2 * n);
  const m = r.pts.length / 2;
  const step = r.len / n;
  let seg = 0;
  let segStart = 0;
  let ax = r.pts[0];
  let ay = r.pts[1];
  let bx = r.pts[2 % r.pts.length];
  let by = r.pts[3 % r.pts.length];
  let segLen = Math.hypot(bx - ax, by - ay);
  for (let k = 0; k < n; k++) {
    const target = k * step;
    while (segStart + segLen < target && seg < m - 1) {
      segStart += segLen;
      seg++;
      ax = bx;
      ay = by;
      const j = (seg + 1) % m;
      bx = r.pts[2 * j];
      by = r.pts[2 * j + 1];
      segLen = Math.hypot(bx - ax, by - ay);
    }
    const t = segLen > 0 ? Math.min(1, (target - segStart) / segLen) : 0;
    out[2 * k] = (ax + (bx - ax) * t - ox) * scale;
    out[2 * k + 1] = (ay + (by - ay) * t - oy) * scale;
  }
  return out;
}

/** exact outline (em units) for canvas drawing */
export function outline(shape: GlyphShape): Path2D {
  return (shape.p2d ??= new Path2D(shape.path));
}
