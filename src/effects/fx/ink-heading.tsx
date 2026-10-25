import '@fontsource-variable/fraunces/wght-italic.css';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { defineSim, useFx, Stage, clamp, mulberry32 } from '../kit';

/**
 * A heading written in ink on damp paper. The ink is a small fluid model on a grid: it is laid
 * down left to right like a pen stroke, then wicks outward through the paper fibres (which are
 * more absorbent along random strands), feathers at the edges and gathers darker at its rim as
 * the water evaporates and the spreading stops. Drag on the page to paint with the same ink.
 * Idle, the page is blotted clean and a new heading is written.
 */

const PHRASES = ['Ink & Paper', 'Written slowly'];
const FONT = "'Fraunces Variable', Georgia, serif";
const STEP = 1 / 60;

interface S {
  gw: number;
  gh: number;
  cs: number;
  I: Float32Array; // ink
  W: Float32Array; // water
  tmp: Float32Array;
  perm: Float32Array; // paper absorbency
  mask: Float32Array | null; // the heading, at grid resolution
  when: Float32Array | null; // when the pen reaches each cell
  k: number;
  phase: number; // seconds since the heading started
  mode: 'write' | 'wipe';
  fade: number;
  acc: number;
  idle: number;
  lx: number;
  ly: number;
  scratch: number;
  wait: number;
}

function fontsReady() {
  if (typeof document === 'undefined' || !document.fonts) return true;
  return document.fonts.check(`italic 400 40px 'Fraunces Variable'`);
}

/** the heading rasterised at grid resolution, plus the pen arrival time per cell */
function makeMask(s: S, w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = s.gw;
  c.height = s.gh;
  const g = c.getContext('2d')!;
  const text = PHRASES[s.k % PHRASES.length];
  const fs = Math.min((w * 0.86) / (text.length * 0.44), h * 0.3);
  g.scale(1 / s.cs, 1 / s.cs);
  g.font = `italic 500 ${fs}px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#000';
  g.fillText(text, w / 2, h * 0.46);
  const tw = Math.min(w * 0.95, g.measureText(text).width);
  const d = g.getImageData(0, 0, s.gw, s.gh).data;
  const mask = new Float32Array(s.gw * s.gh);
  const when = new Float32Array(s.gw * s.gh);
  const x0 = w / 2 - tw / 2;
  for (let j = 0; j < s.gh; j++)
    for (let i = 0; i < s.gw; i++) {
      const k = j * s.gw + i;
      mask[k] = d[k * 4 + 3] / 255;
      // the pen travels left to right, a little faster than reading speed
      when[k] = clamp((i * s.cs - x0) / tw) * 1.7 + ((i * 7 + j * 13) % 10) * 0.006;
    }
  s.mask = mask;
  s.when = when;
}

function dab(s: S, x: number, y: number, r: number, ink: number) {
  const cx = x / s.cs;
  const cy = y / s.cs;
  const rr = r / s.cs;
  for (let j = Math.max(1, Math.floor(cy - rr)); j <= Math.min(s.gh - 2, Math.ceil(cy + rr)); j++)
    for (let i = Math.max(1, Math.floor(cx - rr)); i <= Math.min(s.gw - 2, Math.ceil(cx + rr)); i++) {
      const q = 1 - Math.hypot(i - cx, j - cy) / rr;
      if (q <= 0) continue;
      const k = j * s.gw + i;
      s.I[k] += ink * q;
      s.W[k] += ink * 1.4 * q;
    }
}

export const sim = defineSim<S>({
  init(w, h, rand) {
    const cs = Math.max(1.6, Math.sqrt((w * h) / 110000));
    const gw = Math.ceil(w / cs) + 1;
    const gh = Math.ceil(h / cs) + 1;
    const n = gw * gh;
    // paper: soft blotchy absorbency plus brighter strands where fibres run
    const perm = new Float32Array(n);
    const cg = 8;
    const cw = Math.ceil(gw / cg) + 2;
    const coarse = Array.from({ length: cw * (Math.ceil(gh / cg) + 2) }, () => rand());
    for (let j = 0; j < gh; j++)
      for (let i = 0; i < gw; i++) {
        const fx = i / cg;
        const fy = j / cg;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const tx = fx - ix;
        const ty = fy - iy;
        const v = coarse[iy * cw + ix] * (1 - tx) * (1 - ty) + coarse[iy * cw + ix + 1] * tx * (1 - ty) + coarse[(iy + 1) * cw + ix] * (1 - tx) * ty + coarse[(iy + 1) * cw + ix + 1] * tx * ty;
        perm[j * gw + i] = 0.08 + v * 0.55 + rand() * rand() * 0.5;
      }
    for (let f = 0; f < n / 120; f++) {
      let x = rand() * gw;
      let y = rand() * gh;
      const a = rand() * Math.PI;
      const len = 6 + rand() * 18;
      for (let t = 0; t < len; t++) {
        x += Math.cos(a);
        y += Math.sin(a);
        const k = Math.floor(y) * gw + Math.floor(x);
        if (k >= 0 && k < n) perm[k] = Math.min(1.25, perm[k] + 0.55);
      }
    }
    return { gw, gh, cs, I: new Float32Array(n), W: new Float32Array(n), tmp: new Float32Array(n), perm, mask: null, when: null, k: 0, phase: 0, mode: 'write', fade: 1, acc: 0, idle: 0, lx: -1, ly: -1, scratch: 0, wait: 0 };
  },
  step(s, f) {
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    if (!s.mask) {
      // wait (briefly) for the italic face so the heading is written in the right font
      s.wait += f.dt;
      if (typeof document === 'undefined' || (!fontsReady() && s.wait < 1.5)) return;
      makeMask(s, f.w, f.h);
    }
    // painting with the pointer
    if (f.p.down) {
      if (f.pressed) {
        dab(s, f.p.x, f.p.y, Math.min(f.w, f.h) * 0.035, 1.6);
        f.emit({ name: 'drip', gain: 0.45, rate: 0.85 });
      } else if (s.lx >= 0) {
        const n = Math.ceil(Math.hypot(f.p.x - s.lx, f.p.y - s.ly) / s.cs) + 1;
        for (let q = 1; q <= n; q++) dab(s, s.lx + ((f.p.x - s.lx) * q) / n, s.ly + ((f.p.y - s.ly) * q) / n, Math.min(f.w, f.h) * 0.012, 0.5 / Math.sqrt(n));
        s.scratch += Math.hypot(f.p.vx, f.p.vy) * f.dt;
        if (s.scratch > 90) {
          s.scratch = 0;
          f.emit({ name: 'paper', gain: 0.12, rate: 1.5 });
        }
      }
      s.lx = f.p.x;
      s.ly = f.p.y;
    } else s.lx = -1;

    s.phase += f.dt;
    if (s.mode === 'write' && s.phase > 6 && s.idle > 2) {
      s.mode = 'wipe';
      f.emit({ name: 'swoosh', gain: 0.3 });
    }
    if (s.mode === 'wipe') {
      s.fade -= f.dt / 0.7;
      if (s.fade <= 0) {
        s.I.fill(0);
        s.W.fill(0);
        s.k++;
        s.phase = 0;
        s.fade = 1;
        s.mode = 'write';
        makeMask(s, f.w, f.h);
      }
      return;
    }

    const { gw, gh, I, W, perm, mask, when } = s;
    // the pen lays ink where the heading is, once it reaches each cell
    const pen = s.phase;
    if (pen < 2.2 && mask && when) {
      const prev = Math.floor((pen - f.dt) / 0.22);
      if (Math.floor(pen / 0.22) !== prev && pen < 1.8) f.emit({ name: 'rustle', gain: 0.12, rate: 1.6 });
      for (let k = 0; k < mask.length; k++) {
        const m = mask[k];
        if (m < 0.02) continue;
        const age = pen - when[k];
        if (age < 0 || age > 0.25) continue;
        I[k] += m * 4.2 * f.dt;
        W[k] += m * 4.5 * f.dt;
      }
    }

    // ink wicks through the paper with the water, fastest along fibres; water evaporates
    s.acc = Math.min(s.acc + f.dt, STEP * 3);
    while (s.acc >= STEP) {
      s.acc -= STEP;
      for (const [F, D] of [
        [I, 0.15],
        [W, 0.22],
      ] as const) {
        const T = s.tmp;
        for (let j = 1; j < gh - 1; j++) {
          for (let i = 1; i < gw - 1; i++) {
            const k = j * gw + i;
            const wk = W[k];
            const fk = F[k];
            const pk = perm[k];
            // flux from the four neighbours: wetter and more absorbent paper carries more
            const a1 = (F[k - 1] - fk) * Math.min(1, (wk + W[k - 1]) * 0.5) * (pk + perm[k - 1]);
            const a2 = (F[k + 1] - fk) * Math.min(1, (wk + W[k + 1]) * 0.5) * (pk + perm[k + 1]);
            const a3 = (F[k - gw] - fk) * Math.min(1, (wk + W[k - gw]) * 0.5) * (pk + perm[k - gw]);
            const a4 = (F[k + gw] - fk) * Math.min(1, (wk + W[k + gw]) * 0.5) * (pk + perm[k + gw]);
            T[k] = fk + (a1 + a2 + a3 + a4) * 0.5 * D;
          }
        }
        F.set(T);
      }
      const evap = Math.exp(-STEP * 0.55);
      for (let k = 0; k < W.length; k++) W[k] *= evap;
    }
  },
});

export default function InkHeading() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const ref = useRef<HTMLCanvasElement>(null);
  const grid = useRef<HTMLCanvasElement | null>(null);
  const dpr = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  // the paper, drawn once per size
  const paper = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const g = c.getContext('2d')!;
    g.scale(dpr, dpr);
    const bg = g.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.6);
    bg.addColorStop(0, '#f8f2e4');
    bg.addColorStop(0.7, '#efe5cf');
    bg.addColorStop(1, '#d9caa8');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    const r = mulberry32(7);
    g.lineWidth = 0.6;
    for (let i = 0; i < (w * h) / 900; i++) {
      const x = r() * w;
      const y = r() * h;
      const a = r() * Math.PI;
      const l = 3 + r() * 10;
      g.strokeStyle = `rgba(${r() < 0.5 ? '120,95,60' : '255,255,255'},${0.05 + r() * 0.08})`;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + r() * 2, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
    return c;
  }, [w, h, dpr]);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !paper) return;
    const W2 = Math.round(w * dpr);
    const H2 = Math.round(h * dpr);
    if (cv.width !== W2) cv.width = W2;
    if (cv.height !== H2) cv.height = H2;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(paper, 0, 0);
    const { gw, gh, I, W, perm } = s;
    let g = grid.current;
    if (!g) g = grid.current = document.createElement('canvas');
    if (g.width !== gw || g.height !== gh) {
      g.width = gw;
      g.height = gh;
    }
    const gctx = g.getContext('2d')!;
    const img = gctx.createImageData(gw, gh);
    const d = img.data;
    for (let j = 1; j < gh - 1; j++)
      for (let i = 1; i < gw - 1; i++) {
        const k = j * gw + i;
        const v = I[k];
        if (v < 0.004) continue;
        // pigment gathers at the rim of a drying stain: darker where the ink thins out fast
        const grad = Math.abs(I[k + 1] - I[k - 1]) + Math.abs(I[k + gw] - I[k - gw]);
        const body = clamp((v - 0.03) / 0.5);
        const a = clamp(body * body * (3 - 2 * body) * 0.9 + grad * 1.8) * (0.8 + perm[k] * 0.2);
        const thin = clamp(1 - v * 1.3);
        const wet = clamp(W[k]);
        const o = k * 4;
        d[o] = 18 + thin * 40 - grad * 30;
        d[o + 1] = 24 + thin * 52 - grad * 30;
        d[o + 2] = 62 + thin * 90 + wet * 20;
        d[o + 3] = a * 255;
      }
    gctx.putImageData(img, 0, 0);
    ctx.globalAlpha = clamp(s.fade);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(g, 0, 0, gw * s.cs * dpr, gh * s.cs * dpr);
    ctx.globalAlpha = 1;
  }, [fx.t, w, h, dpr, paper, s]);

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: '#efe5cf' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} role="img" aria-label={PHRASES[s.k % PHRASES.length]} />
    </Stage>
  );
}
