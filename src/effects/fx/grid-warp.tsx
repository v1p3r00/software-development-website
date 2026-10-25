import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Spacetime fabric. The cursor carries a mass; every grid node is pulled towards it by an amount
 * that falls off with distance (a gravity well), riding on its own spring so the fabric lags and
 * jiggles. Press to make the mass heavier and the well deeper; release and the sheet rings.
 */

interface S {
  cols: number;
  rows: number;
  g: number;
  ox: number;
  oy: number;
  dx: Float32Array; // node displacement
  dy: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  mx: number; // the mass
  my: number;
  mass: Spring;
  idle: number;
  t: number;
}

export const sim = defineSim<S>({
  init(w, h) {
    const m = Math.min(w, h);
    const g = m / 18;
    const cols = Math.ceil(w / g) + 3;
    const rows = Math.ceil(h / g) + 3;
    const n = cols * rows;
    return {
      cols,
      rows,
      g,
      ox: (w - (cols - 1) * g) / 2,
      oy: (h - (rows - 1) * g) / 2,
      dx: new Float32Array(n),
      dy: new Float32Array(n),
      vx: new Float32Array(n),
      vy: new Float32Array(n),
      mx: w / 2,
      my: h / 2,
      mass: sp(0),
      idle: 2,
      t: 0,
    };
  },
  step(s, f) {
    const { w, h, dt } = f;
    if (dt <= 0) return;
    const m = Math.min(w, h);
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    let tx = f.p.x;
    let ty = f.p.y;
    let M = f.p.over ? (f.p.down ? 1.3 : 0.85) : 0;
    if (s.idle > 2.5) {
      // self-demo: the mass orbits, and pulses heavy every few seconds
      const a = s.t * 0.55;
      tx = w / 2 + Math.cos(a) * w * 0.22;
      ty = h / 2 + Math.sin(a) * h * 0.2;
      M = 0.85 + (Math.sin(s.t * 1.3) > 0.85 ? 0.45 : 0);
    }
    if (f.pressed) f.emit({ name: 'thud', gain: 0.6, rate: 0.8 });
    if (f.released) f.emit({ name: 'boing', gain: 0.3, rate: 0.7 });
    s.mx = approach(s.mx, tx, 18, dt);
    s.my = approach(s.my, ty, 18, dt);
    spring(s.mass, M, 120, f.reduced ? 22 : 9, dt);
    const Mm = clamp(s.mass.x, -0.3, 1.35);
    const a2 = (m * 0.26) ** 2;
    const k = 140;
    const c = f.reduced ? 22 : 9;
    let i = 0;
    for (let r = 0; r < s.rows; r++)
      for (let q = 0; q < s.cols; q++, i++) {
        const hx = s.ox + q * s.g;
        const hy = s.oy + r * s.g;
        const ex = s.mx - hx;
        const ey = s.my - hy;
        const d2 = ex * ex + ey * ey;
        // pulled toward the mass; never past it (factor < 1)
        const pull = (0.74 * Mm * a2) / (d2 + a2);
        const txd = ex * pull;
        const tyd = ey * pull;
        s.vx[i] += (-(s.dx[i] - txd) * k - s.vx[i] * c) * dt;
        s.vy[i] += (-(s.dy[i] - tyd) * k - s.vy[i] * c) * dt;
        s.dx[i] += s.vx[i] * dt;
        s.dy[i] += s.vy[i] * dt;
      }
  },
});

export default function GridWarp() {
  const fx = useFx(sim);
  const cv = useRef<HTMLCanvasElement>(null);
  const { w, h } = fx;
  useLayoutEffect(() => {
    const cn = cv.current;
    if (!cn) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cn.width !== Math.round(w * dpr)) cn.width = Math.round(w * dpr);
    if (cn.height !== Math.round(h * dpr)) cn.height = Math.round(h * dpr);
    const ctx = cn.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const s = fx.s;
    const m = Math.min(w, h);
    const X = (i: number, q: number) => s.ox + q * s.g + s.dx[i];
    const Y = (i: number, r: number) => s.oy + r * s.g + s.dy[i];
    const M = clamp(s.mass.x, 0, 1.4);
    // halo of the well
    const gr = ctx.createRadialGradient(s.mx, s.my, 0, s.mx, s.my, m * 0.45);
    gr.addColorStop(0, `rgba(80,150,255,${0.22 * M})`);
    gr.addColorStop(1, 'rgba(80,150,255,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
    // the fabric lines: brighter where the sheet is stretched
    ctx.lineWidth = Math.max(0.8, m * 0.0018);
    const line = (pts: [number, number, number][]) => {
      for (let j = 0; j < pts.length - 1; j++) {
        const [x0, y0, e0] = pts[j];
        const [x1, y1, e1] = pts[j + 1];
        const e = (e0 + e1) / 2;
        ctx.strokeStyle = `rgba(${110 + e * 120},${170 + e * 70},255,${0.16 + e * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    };
    const energy = (i: number) => clamp(Math.hypot(s.dx[i], s.dy[i]) / (s.g * 1.3));
    for (let r = 0; r < s.rows; r++) {
      const pts: [number, number, number][] = [];
      for (let q = 0; q < s.cols; q++) {
        const i = r * s.cols + q;
        pts.push([X(i, q), Y(i, r), energy(i)]);
      }
      line(pts);
    }
    for (let q = 0; q < s.cols; q++) {
      const pts: [number, number, number][] = [];
      for (let r = 0; r < s.rows; r++) {
        const i = r * s.cols + q;
        pts.push([X(i, q), Y(i, r), energy(i)]);
      }
      line(pts);
    }
    // the nodes: dots that grow and warm up as they fall in
    for (let r = 0; r < s.rows; r++)
      for (let q = 0; q < s.cols; q++) {
        const i = r * s.cols + q;
        const e = energy(i);
        ctx.fillStyle = `rgba(${200 + e * 55},${225 + e * 20},255,${0.45 + e * 0.55})`;
        ctx.beginPath();
        ctx.arc(X(i, q), Y(i, r), m * (0.0035 + e * 0.004), 0, Math.PI * 2);
        ctx.fill();
      }
    // the mass: a dark core with a bright photon ring
    const R = m * (0.03 + M * 0.018);
    const core = ctx.createRadialGradient(s.mx, s.my, R * 0.2, s.mx, s.my, R * 2.4);
    core.addColorStop(0, 'rgba(4,6,14,1)');
    core.addColorStop(0.4, 'rgba(4,6,14,1)');
    core.addColorStop(0.46, `rgba(190,220,255,${0.4 + M * 0.5})`);
    core.addColorStop(0.6, `rgba(90,150,255,${0.25 * M + 0.1})`);
    core.addColorStop(1, 'rgba(90,150,255,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(s.mx, s.my, R * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }, [fx.t, w, h, fx.s]);
  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: 'radial-gradient(120% 100% at 50% 50%, #0c1630 0%, #070c1c 60%, #03050b 100%)' }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(85% 75% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
    </Stage>
  );
}
