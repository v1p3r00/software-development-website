/**
 * Language-switch letter morph.
 *
 * When the language changes, every visible heading, navigation label and button
 * whose text changed is redrawn for ~0.6 s as real glyph outlines in a fixed SVG
 * overlay: each character's contours are resampled, paired with the contours of the
 * character that replaces it, and interpolated point by point, so the letter itself
 * deforms into the new one (with a little rotation, stretch, overshoot and motion
 * softness). The real text is laid out in its final state underneath, hidden only
 * while the overlay runs, so layout, selection and screen readers are unaffected.
 *
 *   captureMorph()  — measure the current glyphs (call right before the switch)
 *   playMorph()     — after React has committed the new text (layout effect)
 *
 * Elements can opt in with [data-morph] or out with [data-no-morph].
 */
import { fontKey, getFont, glyphShape, loadFont, resample } from './glyphs';
import type { GlyphFont, GlyphShape, Ring } from './glyphs';

const SELECTOR = 'h1,h2,h3,h4,nav a,nav button,button,a[data-cursor],.label,.label-a,[data-morph]';
const MAX_TEXT = 80; // longer strings are body copy, not labels…
const MAX_HEADING = 240; // …except in headings (article titles run long)
const MAX_ELEMENTS = 120;
const MAX_GLYPHS = 1800; // keeps a page full of cards smooth
const DURATION = 540; // per glyph, ms
const STAGGER = 16; // ms between neighbouring glyphs…
const STAGGER_MAX = 150; // …but a whole string never takes longer than this to start
const HIDE = 'lang-morph-hide';
const NS = 'http://www.w3.org/2000/svg';

interface Glyph {
  ch: string;
  font: GlyphFont;
  shape: GlyphShape;
  /** pen position and baseline, viewport px */
  x: number;
  base: number;
  size: number;
  rgb: [number, number, number];
  alpha: number;
  /** which text node it came from — separately styled runs (a coloured full stop…) pair with each other */
  seg: number;
}

interface Snap {
  el: Element;
  path: string;
  text: string;
  glyphs: Glyph[];
}

interface Morph {
  rings: { a: Float32Array; b: Float32Array }[];
  pa: [number, number];
  pb: [number, number];
  ca: [number, number, number];
  cb: [number, number, number];
  aa: number;
  ab: number;
  delay: number;
  rot: number;
  stretch: number;
  fade: boolean;
  /** exact final outline, drawn on the last frame for a seamless hand-off to the real text */
  end: { path: string; x: number; y: number; scale: number } | null;
  node: SVGPathElement;
  done: boolean;
}

let captured: Snap[] | null = null;
let finishRunning: (() => void) | null = null;

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const smoothstep = (a: number, b: number, t: number) => {
  const x = clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};
const rand = (i: number) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/* ───────────────────────── measuring ───────────────────────── */

function candidates(viewportOnly: boolean): Element[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const list = [...document.querySelectorAll(SELECTOR)].filter((el) => {
    if (el.closest('[data-no-morph]')) return false;
    const text = norm(el.textContent);
    const max = /^H[1-4]$/.test(el.tagName) || el.hasAttribute('data-morph') ? MAX_HEADING : MAX_TEXT;
    if (!text || text.length > max) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    return !viewportOnly || (r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw);
  });
  const set = new Set(list);
  const outermost = list.filter((el) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
    return true;
  });
  return (viewportOnly ? outermost.filter(onTop) : outermost).slice(0, MAX_ELEMENTS);
}

/** skip text covered by something else (fixed header, open menu, dialog…) */
function onTop(el: Element): boolean {
  const r = el.getBoundingClientRect();
  const x = clamp(r.left + r.width / 2, 0, window.innerWidth - 1);
  const y = clamp(r.top + r.height / 2, 0, window.innerHeight - 1);
  const hit = document.elementFromPoint(x, y);
  return !!hit && (el.contains(hit) || hit.contains(el));
}

function parseColor(s: string): { rgb: [number, number, number]; alpha: number } {
  const n = (s.match(/-?[\d.]+(e-?\d+)?/g) ?? []).map(Number);
  if (s.startsWith('color(')) return { rgb: [n[0] * 255, n[1] * 255, n[2] * 255], alpha: n[3] ?? 1 };
  return { rgb: [n[0] ?? 0, n[1] ?? 0, n[2] ?? 0], alpha: n[3] ?? 1 };
}

interface TextStyle {
  key: string;
  font: GlyphFont;
  size: number;
  rgb: [number, number, number];
  alpha: number;
  transform: string;
}

function opacityChain(el: Element | null): number {
  let o = 1;
  for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
    o *= Number.parseFloat(getComputedStyle(e).opacity) || 0;
    if (o === 0) break;
  }
  return o;
}

function textStyle(parent: Element, cache: Map<Element, TextStyle | null>): TextStyle | null {
  if (cache.has(parent)) return cache.get(parent) ?? null;
  let out: TextStyle | null = null;
  const cs = getComputedStyle(parent);
  const box = parent.getBoundingClientRect();
  // visually hidden helpers (sr-only) have a 1px box
  if (cs.visibility === 'visible' && box.width >= 2 && box.height >= 2) {
    const key = fontKey(cs.fontFamily, cs.fontWeight);
    const font = key ? getFont(key) : undefined;
    if (key && !font) void loadFont(key);
    if (key && font) {
      const fill = cs.webkitTextFillColor;
      const c = parseColor(fill && !fill.includes('transparent') ? fill : cs.color);
      out = {
        key,
        font,
        size: Number.parseFloat(cs.fontSize),
        rgb: c.rgb,
        alpha: c.alpha * opacityChain(parent),
        transform: cs.textTransform,
      };
    }
  }
  cache.set(parent, out);
  return out;
}

function measure(el: Element): Glyph[] {
  const out: Glyph[] = [];
  const cache = new Map<Element, TextStyle | null>();
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let seg = -1;
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const parent = node.parentElement;
    let first = true;
    const st = parent ? textStyle(parent, cache) : null;
    if (!st || st.alpha < 0.02) continue;
    const data = node.data;
    for (let i = 0; i < data.length; i++) {
      const code = data.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdfff) continue; // emoji etc. aren't baked
      let ch = data[i];
      if (/\s/.test(ch)) continue;
      if (st.transform === 'uppercase') ch = ch.toUpperCase();
      else if (st.transform === 'lowercase') ch = ch.toLowerCase();
      if (ch.length !== 1) continue;
      const shape = glyphShape(st.key, ch);
      if (!shape) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getClientRects()[0];
      if (!r || r.width === 0) continue;
      const f = st.font;
      if (first) {
        seg++;
        first = false;
      }
      out.push({
        ch,
        font: f,
        shape,
        x: r.left,
        // a character's box is its font's content area: ascent above the baseline, descent below
        base: r.top + (r.height * f.asc) / (f.asc + f.desc),
        size: st.size,
        rgb: st.rgb,
        alpha: st.alpha,
        seg,
      });
    }
  }
  return out;
}

function cssPath(el: Element): string {
  const parts: string[] = [];
  for (let e: Element | null = el; e && e.parentElement && e !== document.body; e = e.parentElement) {
    parts.unshift(`${e.tagName.toLowerCase()}:nth-child(${[...e.parentElement.children].indexOf(e) + 1})`);
  }
  return ['body', ...parts].join(' > ');
}

/* ───────────────────────── geometry ───────────────────────── */

function reversePoints(p: Float32Array) {
  const n = p.length / 2;
  for (let i = 0, j = n - 1; i < j; i++, j--) {
    const x = p[2 * i];
    const y = p[2 * i + 1];
    p[2 * i] = p[2 * j];
    p[2 * i + 1] = p[2 * j + 1];
    p[2 * j] = x;
    p[2 * j + 1] = y;
  }
}

/** rotate b's starting point so that point i of a travels the shortest way to point i of b */
function align(a: Float32Array, b: Float32Array): Float32Array {
  const n = a.length / 2;
  const cost = (k: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + k) % n;
      const dx = a[2 * i] - b[2 * j];
      const dy = a[2 * i + 1] - b[2 * j + 1];
      s += dx * dx + dy * dy;
    }
    return s;
  };
  const coarse = n > 48 ? 2 : 1;
  let best = 0;
  let bestCost = Infinity;
  for (let k = 0; k < n; k += coarse) {
    const c = cost(k);
    if (c < bestCost) [best, bestCost] = [k, c];
  }
  if (coarse > 1)
    for (const k of [best - 1, best + 1]) {
      const kk = (k + n) % n;
      const c = cost(kk);
      if (c < bestCost) [best, bestCost] = [kk, c];
    }
  if (best === 0) return b;
  const out = new Float32Array(b.length);
  for (let i = 0; i < n; i++) {
    const j = (i + best) % n;
    out[2 * i] = b[2 * j];
    out[2 * i + 1] = b[2 * j + 1];
  }
  return out;
}

const pointsFor = (lenPx: number) => clamp(Math.round(lenPx / 3.5), 10, 110);

function collapsed(n: number, x: number, y: number): Float32Array {
  const p = new Float32Array(2 * n);
  for (let i = 0; i < n; i++) {
    p[2 * i] = x;
    p[2 * i + 1] = y;
  }
  return p;
}

/** pair the contours of two glyphs by position inside the glyph and by size */
function matchRings(A: GlyphShape, B: GlyphShape): [number, number][] {
  const sizeA = A.rings.reduce((s, r) => Math.max(s, Math.sqrt(Math.abs(r.area))), 1);
  const sizeB = B.rings.reduce((s, r) => Math.max(s, Math.sqrt(Math.abs(r.area))), 1);
  const options: [number, number, number][] = [];
  A.rings.forEach((ra, i) =>
    B.rings.forEach((rb, j) => {
      const d = Math.hypot(ra.cx - A.cx - (rb.cx - B.cx), ra.cy - A.cy - (rb.cy - B.cy)) / 1000;
      const s = Math.abs(Math.sqrt(Math.abs(ra.area)) / sizeA - Math.sqrt(Math.abs(rb.area)) / sizeB);
      options.push([d + s, i, j]);
    }),
  );
  options.sort((p, q) => p[0] - q[0]);
  const usedA = new Set<number>();
  const usedB = new Set<number>();
  const pairs: [number, number][] = [];
  for (const [, i, j] of options) {
    if (usedA.has(i) || usedB.has(j)) continue;
    usedA.add(i);
    usedB.add(j);
    pairs.push([i, j]);
  }
  return pairs;
}

function centre(g: Glyph): [number, number] {
  const s = g.size / g.font.upm;
  return [g.x + g.shape.cx * s, g.base + g.shape.cy * s];
}

function buildMorph(A: Glyph, B: Glyph | null, to: [number, number], index: number, delay: number): Omit<Morph, 'node' | 'done'> {
  const sa = A.size / A.font.upm;
  const rings: Morph['rings'] = [];
  const local = (r: Ring, s: number, sh: GlyphShape): [number, number] => [(r.cx - sh.cx) * s, (r.cy - sh.cy) * s];

  if (B) {
    const sb = B.size / B.font.upm;
    const pairs = matchRings(A.shape, B.shape);
    const usedA = new Set(pairs.map((p) => p[0]));
    const usedB = new Set(pairs.map((p) => p[1]));
    for (const [i, j] of pairs) {
      const ra = A.shape.rings[i];
      const rb = B.shape.rings[j];
      const n = pointsFor(Math.max(ra.len * sa, rb.len * sb));
      const a = resample(ra, n, sa, A.shape.cx, A.shape.cy);
      const b = resample(rb, n, sb, B.shape.cx, B.shape.cy);
      if (Math.sign(ra.area) !== Math.sign(rb.area)) reversePoints(b);
      rings.push({ a, b: align(a, b) });
    }
    // contours without a partner shrink into, or grow out of, a point
    A.shape.rings.forEach((ra, i) => {
      if (usedA.has(i)) return;
      const n = pointsFor(ra.len * sa);
      const [x, y] = local(ra, sa, A.shape);
      rings.push({ a: resample(ra, n, sa, A.shape.cx, A.shape.cy), b: collapsed(n, x * 0.4, y * 0.4) });
    });
    B.shape.rings.forEach((rb, j) => {
      if (usedB.has(j)) return;
      const n = pointsFor(rb.len * sb);
      const [x, y] = local(rb, sb, B.shape);
      rings.push({ a: collapsed(n, x * 0.4, y * 0.4), b: resample(rb, n, sb, B.shape.cx, B.shape.cy) });
    });
  } else {
    for (const ra of A.shape.rings) {
      const n = pointsFor(ra.len * sa);
      const [x, y] = local(ra, sa, A.shape);
      rings.push({ a: resample(ra, n, sa, A.shape.cx, A.shape.cy), b: collapsed(n, x * 0.25, y * 0.25) });
    }
  }

  const sign = index % 2 ? 1 : -1;
  return {
    rings,
    pa: centre(A),
    pb: B ? centre(B) : to,
    ca: A.rgb,
    cb: B ? B.rgb : A.rgb,
    aa: A.alpha,
    ab: B ? B.alpha : A.alpha,
    delay,
    rot: sign * (2 + 5 * rand(index)),
    stretch: (0.05 + 0.1 * rand(index + 17)) * (rand(index + 31) > 0.3 ? 1 : -1),
    fade: !B,
    end: B ? { path: B.shape.path, x: B.x, y: B.base, scale: B.size / B.font.upm } : null,
  };
}

/** proportional positions within a run, so it transforms in place */
function pairRun(oldG: Glyph[], newG: Glyph[], indexBase: number, first: number, step: number) {
  const nA = oldG.length;
  const nB = newG.length;
  const out: Omit<Morph, 'node' | 'done'>[] = [];
  const used = new Set<number>();
  newG.forEach((g, j) => {
    const i = nB === 1 ? 0 : Math.round((j * (nA - 1)) / (nB - 1));
    used.add(i);
    out.push(buildMorph(oldG[i], g, [0, 0], indexBase + first + j, (first + j) * step));
  });
  // left-over old letters dissolve into the neighbour that absorbs them
  oldG.forEach((g, i) => {
    if (used.has(i)) return;
    const j = nA === 1 ? 0 : Math.round((i * (nB - 1)) / (nA - 1));
    out.push(buildMorph(g, null, centre(newG[j]), indexBase + 1000 + first + i, (first + j) * step));
  });
  return out;
}

/** split a run into visual lines (a wrapped title keeps each letter on its own line where it can) */
const lines = (g: Glyph[]) =>
  g.reduce<Glyph[][]>((acc, x) => {
    const last = acc[acc.length - 1];
    if (!last || Math.abs(last[last.length - 1].base - x.base) > x.size * 0.5) acc.push([]);
    acc[acc.length - 1].push(x);
    return acc;
  }, []);

function pairLines(oldG: Glyph[], newG: Glyph[], indexBase: number, first: number, step: number) {
  const a = lines(oldG);
  const b = lines(newG);
  if (a.length < 2 || a.length !== b.length) return pairRun(oldG, newG, indexBase, first, step);
  const out: Omit<Morph, 'node' | 'done'>[] = [];
  let offset = first;
  a.forEach((line, k) => {
    out.push(...pairRun(line, b[k], indexBase, offset, step));
    offset += b[k].length;
  });
  return out;
}

const runs = (g: Glyph[]) =>
  g.reduce<Glyph[][]>((acc, x) => {
    if (!acc.length || acc[acc.length - 1][0].seg !== x.seg) acc.push([]);
    acc[acc.length - 1].push(x);
    return acc;
  }, []);

/** which old glyph turns into which new one: run by run when both texts have the same structure */
function pairUp(oldG: Glyph[], newG: Glyph[], indexBase: number) {
  const step = Math.min(STAGGER, STAGGER_MAX / Math.max(1, newG.length - 1));
  const a = runs(oldG);
  const b = runs(newG);
  if (a.length < 2 || a.length !== b.length) return pairLines(oldG, newG, indexBase, 0, step);
  const out: Omit<Morph, 'node' | 'done'>[] = [];
  let first = 0;
  a.forEach((run, k) => {
    out.push(...pairLines(run, b[k], indexBase, first, step));
    first += b[k].length;
  });
  return out;
}

/* ───────────────────────── playback ───────────────────────── */

function pathData(m: Morph, e: number): string {
  let d = '';
  for (const { a, b } of m.rings) {
    for (let i = 0; i < a.length; i += 2) {
      const x = a[i] + (b[i] - a[i]) * e;
      const y = a[i + 1] + (b[i + 1] - a[i + 1]) * e;
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += 'Z';
  }
  return d;
}

function render(m: Morph, t: number) {
  if (t >= 1) {
    if (m.done) return;
    m.done = true;
    if (m.end) {
      m.node.setAttribute('d', m.end.path);
      m.node.setAttribute('transform', `translate(${m.end.x} ${m.end.y}) scale(${m.end.scale})`);
      m.node.setAttribute('fill', `rgb(${m.cb.join(' ')})`);
      m.node.setAttribute('fill-opacity', String(m.ab));
    } else {
      m.node.setAttribute('fill-opacity', '0');
    }
    return;
  }
  const p = easeInOut(t);
  // shape progress overshoots by a few percent before settling
  const e = p + 0.055 * Math.sin(Math.PI * clamp((t - 0.55) / 0.45, 0, 1));
  const wave = Math.sin(Math.PI * t);
  const x = m.pa[0] + (m.pb[0] - m.pa[0]) * p;
  const y = m.pa[1] + (m.pb[1] - m.pa[1]) * p;
  const sx = 1 + m.stretch * wave;
  const sy = 1 - m.stretch * 0.45 * wave;
  const c = m.ca.map((v, i) => Math.round(v + (m.cb[i] - v) * p));
  const alpha = m.fade ? m.aa * (1 - smoothstep(0.2, 0.8, t)) : m.aa + (m.ab - m.aa) * p;
  m.node.setAttribute('d', pathData(m, e));
  m.node.setAttribute(
    'transform',
    `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(m.rot * wave).toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`,
  );
  m.node.setAttribute('fill', `rgb(${c.join(' ')})`);
  m.node.setAttribute('fill-opacity', alpha.toFixed(3));
}

function run(snaps: Snap[]) {
  const jobs: { el: Element; morphs: Omit<Morph, 'node' | 'done'>[] }[] = [];
  let index = 0;
  for (const s of snaps) {
    const el = s.el.isConnected ? s.el : document.querySelector(s.path);
    if (!el || norm(el.textContent) === s.text) continue;
    const now = measure(el);
    if (!now.length) continue;
    jobs.push({ el, morphs: pairUp(s.glyphs, now, index) });
    index += s.glyphs.length + now.length;
  }
  if (!jobs.length) return;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText =
    'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000;overflow:visible';
  const defs = document.createElementNS(NS, 'defs');
  const filter = document.createElementNS(NS, 'filter');
  filter.id = 'lang-morph-soften';
  for (const [k, v] of Object.entries({ x: '-10%', y: '-10%', width: '120%', height: '120%' })) filter.setAttribute(k, v);
  const blur = document.createElementNS(NS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '0 0');
  filter.appendChild(blur);
  defs.appendChild(filter);
  svg.appendChild(defs);
  const group = document.createElementNS(NS, 'g');
  group.setAttribute('filter', 'url(#lang-morph-soften)');
  svg.appendChild(group);

  const morphs: Morph[] = [];
  for (const job of jobs)
    for (const m of job.morphs) {
      const node = document.createElementNS(NS, 'path');
      node.setAttribute('fill-rule', 'evenodd');
      group.appendChild(node);
      morphs.push({ ...m, node, done: false });
    }
  const total = DURATION + Math.max(...morphs.map((m) => m.delay));

  const els = jobs.map((j) => j.el);
  let raf = 0;
  let timer = 0;
  const finish = () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(timer);
    svg.remove();
    for (const el of els) el.classList.remove(HIDE);
    if (finishRunning === finish) finishRunning = null;
  };
  finishRunning = finish;

  for (const m of morphs) render(m, 0);
  document.body.appendChild(svg);
  for (const el of els) el.classList.add(HIDE);

  const start = performance.now();
  const tick = (now: number) => {
    const elapsed = now - start;
    for (const m of morphs) render(m, clamp((elapsed - m.delay) / DURATION, 0, 1));
    // a touch of directional softness while the letters move fastest
    const s = Math.sin(Math.PI * clamp(elapsed / total, 0, 1)) ** 2;
    blur.setAttribute('stdDeviation', `${(0.85 * s).toFixed(2)} ${(0.25 * s).toFixed(2)}`);
    if (elapsed >= total) finish();
    else raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  timer = window.setTimeout(finish, total + 600); // background tabs throttle rAF
}

/** Measure the current glyphs. Call synchronously right before switching language. */
export function captureMorph() {
  finishRunning?.();
  captured = null;
  if (reducedMotion()) return;
  try {
    let budget = MAX_GLYPHS;
    captured = [];
    for (const el of candidates(true)) {
      const glyphs = measure(el);
      if (!glyphs.length || glyphs.length > budget) continue;
      budget -= glyphs.length;
      captured.push({ el, path: cssPath(el), text: norm(el.textContent), glyphs });
    }
  } catch {
    captured = null;
  }
}

/** Animate from the captured glyphs to the newly rendered text. Call in a layout effect after the switch. */
export function playMorph() {
  const snaps = captured;
  captured = null;
  if (!snaps?.length) return;
  try {
    run(snaps);
  } catch {
    finishRunning?.();
    document.querySelectorAll(`.${HIDE}`).forEach((el) => el.classList.remove(HIDE));
  }
}

/** Load the outlines the current page needs, while the browser is idle. */
export function prefetchMorphFonts() {
  if (reducedMotion()) return;
  const idle: (cb: () => void) => void = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 400));
  idle(() => {
    const keys = new Set<string>();
    for (const el of candidates(false)) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const parent = n.parentElement;
        if (!parent || !norm(n.textContent)) continue;
        const cs = getComputedStyle(parent);
        const key = fontKey(cs.fontFamily, cs.fontWeight);
        if (key) keys.add(key);
      }
    }
    keys.forEach((k) => void loadFont(k));
  });
}
