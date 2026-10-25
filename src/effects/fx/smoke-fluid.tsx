import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * Ink in water: a real stable-fluids solver (Stam 1999) on a coarse grid, Canvas2D.
 * Each frame: forces (your drag, ink being heavier than water, vorticity confinement to keep
 * the small curls alive) → semi-Lagrangian advection of velocity → pressure projection so the
 * water is incompressible → advection of three ink channels. The ink is drawn subtractively
 * (Beer–Lambert: light through the water is absorbed per channel), so overlapping colours
 * mix darker, like real dye. Hovering only stirs; pressing and dragging also releases ink.
 */

interface S {
  W: number; // grid cells across / down (without the 1-cell border)
  H: number;
  cell: number; // px per cell
  u: Float32Array;
  v: Float32Array;
  u0: Float32Array;
  v0: Float32Array;
  p: Float32Array;
  div: Float32Array;
  ink: Float32Array[]; // absorbance per colour channel (r, g, b)
  tmp: Float32Array;
  lx: number; // last pointer position (px)
  ly: number;
  hue: number;
  wasInk: boolean;
  idle: number;
  t: number;
  lastSwoosh: number;
}

// ink colours as absorbance (what the dye takes out of white light)
const INKS = [
  [0.95, 0.75, 0.12], // indigo
  [0.12, 0.95, 0.55], // magenta
  [0.95, 0.25, 0.3], // teal
  [0.1, 0.45, 0.95], // amber
];

export const sim = defineSim<S>({
  init(w, h) {
    const cell = Math.max(w, h) / 120;
    const W = Math.max(8, Math.round(w / cell)), H = Math.max(8, Math.round(h / cell));
    const n = (W + 2) * (H + 2);
    const f = () => new Float32Array(n);
    return { W, H, cell, u: f(), v: f(), u0: f(), v0: f(), p: f(), div: f(), ink: [f(), f(), f()], tmp: f(), lx: -1, ly: -1, hue: 0, wasInk: false, idle: 3, t: 0, lastSwoosh: 0 };
  },
  step(s, f) {
    const { W, H, cell } = s;
    const dt = Math.min(f.dt, 1 / 30);
    if (dt <= 0) return;
    s.t += dt;
    const R = W + 2;
    const IX = (i: number, j: number) => i + R * j;
    const { p } = f;
    const moving = Math.abs(p.vx) + Math.abs(p.vy) > 5;
    s.idle = p.down || (p.over && moving) ? 0 : s.idle + dt;

    // the pointer we use: the real one, or after a pause a ghost hand drawing slow loops
    let x = p.x, y = p.y, inking = p.down, stir = p.over;
    if (s.idle > 2.5) {
      const T = s.t * 0.55;
      x = f.w * (0.5 + 0.34 * Math.sin(T) * Math.cos(T * 0.37));
      y = f.h * (0.45 + 0.3 * Math.sin(T * 1.7 + 0.6));
      inking = s.t % 3.4 < 1.6;
      stir = true;
    }
    if (inking && !s.wasInk) {
      s.hue = (s.hue + 1) % INKS.length;
      f.emit({ name: 'drip', gain: 0.4, rate: 0.8 + f.rand() * 0.3, pan: (x / f.w) * 2 - 1 });
    }
    s.wasInk = inking;
    if (s.lx < 0) {
      s.lx = x;
      s.ly = y;
    }

    // 1. forces: splat along the pointer's path so fast strokes leave no gaps
    const { u, v } = s;
    if (stir) {
      const dx = x - s.lx, dy = y - s.ly;
      const dist = Math.hypot(dx, dy);
      const vx = dx / dt / cell, vy = dy / dt / cell; // cells / s
      const sp = Math.hypot(vx, vy);
      if (sp > 140 && s.t - s.lastSwoosh > 0.5) {
        f.emit({ name: 'swoosh', gain: clamp(sp / 400, 0.2, 0.6), rate: 0.8, pan: (x / f.w) * 2 - 1 });
        s.lastSwoosh = s.t;
      }
      const steps = Math.max(1, Math.ceil(dist / cell));
      const r = 3.2;
      const col = INKS[s.hue];
      for (let k = 0; k < steps; k++) {
        const cx = (s.lx + (dx * (k + 1)) / steps) / cell + 0.5;
        const cy = (s.ly + (dy * (k + 1)) / steps) / cell + 0.5;
        const i0 = Math.max(1, Math.floor(cx - r * 2)), i1 = Math.min(W, Math.ceil(cx + r * 2));
        const j0 = Math.max(1, Math.floor(cy - r * 2)), j1 = Math.min(H, Math.ceil(cy + r * 2));
        for (let j = j0; j <= j1; j++)
          for (let i = i0; i <= i1; i++) {
            const g = Math.exp(-((i - cx) ** 2 + (j - cy) ** 2) / (r * r));
            if (g < 0.01) continue;
            const id = IX(i, j);
            // drag the water along with the hand
            const m = (g * 0.5) / steps;
            u[id] += (clamp(vx, -400, 400) - u[id]) * m * 1.6;
            v[id] += (clamp(vy, -400, 400) - v[id]) * m * 1.6;
            if (inking) {
              const a = (g * (0.9 + Math.min(1, dist / cell / 4))) * dt * 6 / steps;
              for (let c = 0; c < 3; c++) s.ink[c][id] = Math.min(4, s.ink[c][id] + col[c] * a);
            }
          }
      }
    }
    s.lx = x;
    s.ly = y;

    // ink is a little heavier than water: dense regions sink and curl into plumes
    const sink = 7;
    for (let j = 1; j <= H; j++)
      for (let i = 1; i <= W; i++) {
        const id = IX(i, j);
        v[id] += (s.ink[0][id] + s.ink[1][id] + s.ink[2][id]) * sink * dt;
      }

    // vorticity confinement: puts back the small swirls the coarse grid smears out
    const curl = s.tmp;
    for (let j = 1; j <= H; j++)
      for (let i = 1; i <= W; i++) curl[IX(i, j)] = 0.5 * (v[IX(i + 1, j)] - v[IX(i - 1, j)] - (u[IX(i, j + 1)] - u[IX(i, j - 1)]));
    const eps = 6;
    for (let j = 2; j < H; j++)
      for (let i = 2; i < W; i++) {
        const nx = 0.5 * (Math.abs(curl[IX(i + 1, j)]) - Math.abs(curl[IX(i - 1, j)]));
        const ny = 0.5 * (Math.abs(curl[IX(i, j + 1)]) - Math.abs(curl[IX(i, j - 1)]));
        const l = Math.hypot(nx, ny) + 1e-5;
        const w = curl[IX(i, j)];
        u[IX(i, j)] += eps * (ny / l) * w * dt;
        v[IX(i, j)] -= eps * (nx / l) * w * dt;
      }

    const bnd = (b: number, a: Float32Array) => {
      for (let i = 1; i <= W; i++) {
        a[IX(i, 0)] = b === 2 ? -a[IX(i, 1)] : a[IX(i, 1)];
        a[IX(i, H + 1)] = b === 2 ? -a[IX(i, H)] : a[IX(i, H)];
      }
      for (let j = 1; j <= H; j++) {
        a[IX(0, j)] = b === 1 ? -a[IX(1, j)] : a[IX(1, j)];
        a[IX(W + 1, j)] = b === 1 ? -a[IX(W, j)] : a[IX(W, j)];
      }
    };
    // semi-Lagrangian advection: look back along the velocity and sample bilinearly
    const advect = (b: number, d: Float32Array, d0: Float32Array, uu: Float32Array, vv: Float32Array, decay: number) => {
      for (let j = 1; j <= H; j++)
        for (let i = 1; i <= W; i++) {
          const id = IX(i, j);
          const x0 = clamp(i - dt * uu[id], 0.5, W + 0.5);
          const y0 = clamp(j - dt * vv[id], 0.5, H + 0.5);
          const i0 = Math.floor(x0), j0 = Math.floor(y0);
          const s1 = x0 - i0, t1 = y0 - j0;
          d[id] =
            ((1 - s1) * ((1 - t1) * d0[IX(i0, j0)] + t1 * d0[IX(i0, j0 + 1)]) + s1 * ((1 - t1) * d0[IX(i0 + 1, j0)] + t1 * d0[IX(i0 + 1, j0 + 1)])) * decay;
        }
      bnd(b, d);
    };
    // projection: solve for pressure so the velocity field has no divergence
    const project = (uu: Float32Array, vv: Float32Array) => {
      const { p: pr, div } = s;
      for (let j = 1; j <= H; j++)
        for (let i = 1; i <= W; i++) {
          div[IX(i, j)] = -0.5 * (uu[IX(i + 1, j)] - uu[IX(i - 1, j)] + vv[IX(i, j + 1)] - vv[IX(i, j - 1)]);
          pr[IX(i, j)] = 0;
        }
      bnd(0, div);
      bnd(0, pr);
      for (let k = 0; k < 18; k++) {
        for (let j = 1; j <= H; j++)
          for (let i = 1; i <= W; i++)
            pr[IX(i, j)] = (div[IX(i, j)] + pr[IX(i - 1, j)] + pr[IX(i + 1, j)] + pr[IX(i, j - 1)] + pr[IX(i, j + 1)]) / 4;
        bnd(0, pr);
      }
      for (let j = 1; j <= H; j++)
        for (let i = 1; i <= W; i++) {
          uu[IX(i, j)] -= 0.5 * (pr[IX(i + 1, j)] - pr[IX(i - 1, j)]);
          vv[IX(i, j)] -= 0.5 * (pr[IX(i, j + 1)] - pr[IX(i, j - 1)]);
        }
      bnd(1, uu);
      bnd(2, vv);
    };

    bnd(1, u);
    bnd(2, v);
    project(u, v);
    s.u0.set(u);
    s.v0.set(v);
    const damp = Math.exp(-0.35 * dt); // water slowly comes to rest
    advect(1, u, s.u0, s.u0, s.v0, damp);
    advect(2, v, s.v0, s.u0, s.v0, damp);
    project(u, v);
    const fade = Math.exp(-0.08 * dt); // ink slowly thins out (keeps the tank from going murky)
    for (let c = 0; c < 3; c++) {
      s.tmp.set(s.ink[c]);
      advect(0, s.ink[c], s.tmp, u, v, fade);
    }
  },
});

export default function SmokeFluid() {
  const fx = useFx(sim);
  const ref = useRef<HTMLCanvasElement>(null);
  const low = useRef<HTMLCanvasElement | null>(null);
  const mid = useRef<HTMLCanvasElement | null>(null);
  const { s, w, h } = fx;

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const c = cv.getContext('2d')!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { W, H } = s;
    if (!low.current) low.current = document.createElement('canvas');
    const L = low.current;
    if (L.width !== W || L.height !== H) {
      L.width = W;
      L.height = H;
    }
    const lc = L.getContext('2d')!;
    const img = lc.createImageData(W, H);
    const d = img.data;
    const R = W + 2;
    for (let j = 0; j < H; j++)
      for (let i = 0; i < W; i++) {
        const id = i + 1 + R * (j + 1);
        // the tank is lit from above: brighter water near the top
        const lightTop = 1 - (j / H) * 0.12;
        const k = (j * W + i) * 4;
        d[k] = 246 * lightTop * Math.exp(-s.ink[0][id] * 1.4);
        d[k + 1] = 243 * lightTop * Math.exp(-s.ink[1][id] * 1.4);
        d[k + 2] = 236 * lightTop * Math.exp(-s.ink[2][id] * 1.4);
        d[k + 3] = 255;
      }
    lc.putImageData(img, 0, 0);
    // upscale in two passes with a tiny blur in between: a smooth, cubic-looking result
    // instead of the diamond artefacts of one big bilinear stretch
    if (!mid.current) mid.current = document.createElement('canvas');
    const M = mid.current;
    if (M.width !== W * 3 || M.height !== H * 3) {
      M.width = W * 3;
      M.height = H * 3;
    }
    const mc = M.getContext('2d')!;
    mc.imageSmoothingEnabled = true;
    mc.imageSmoothingQuality = 'high';
    mc.filter = 'blur(1.4px)';
    mc.drawImage(L, -0.5, -0.5, W * 3 + 1, H * 3 + 1);
    mc.filter = 'none';
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(M, 0, 0, w, h);
    // a soft caustic sheen from the surface and a lens vignette
    const sheen = c.createLinearGradient(0, 0, 0, h * 0.35);
    sheen.addColorStop(0, 'rgba(255,255,255,0.35)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = sheen;
    c.fillRect(0, 0, w, h * 0.35);
    const vg = c.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.35, w / 2, h * 0.45, Math.max(w, h) * 0.8);
    vg.addColorStop(0, 'rgba(40,50,60,0)');
    vg.addColorStop(1, 'rgba(40,50,60,0.35)');
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }, [fx.t, w, h, s]);

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: '#f2efe8' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} role="img" aria-label="Water tank; drag to swirl coloured ink" />
    </Stage>
  );
}
