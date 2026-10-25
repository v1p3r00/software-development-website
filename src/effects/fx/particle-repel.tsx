import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, approach } from '../kit';

/**
 * A field of thousands of particles, each tied to its home by a soft spring. The cursor is a
 * moving pressure source: particles are pushed out and swirled around it, then flow back with
 * a little overshoot. Press for a shockwave.
 */

interface S {
  n: number;
  hx: Float32Array;
  hy: Float32Array;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  hue: Float32Array;
  idle: number;
  cx: number;
  cy: number;
  force: number; // how strongly the cursor pushes (fades in/out with hover)
  wave: number; // shockwave radius, px (<0 = none)
  t: number;
}

export const sim = defineSim<S>({
  init(w, h, rand) {
    const n = Math.round(Math.min(9000, Math.max(2400, (w * h) / 80)));
    const g = Math.sqrt((w * h) / n);
    const cols = Math.ceil(w / g);
    const rows = Math.ceil(h / g);
    const tot = cols * rows;
    const s: S = {
      n: tot,
      hx: new Float32Array(tot),
      hy: new Float32Array(tot),
      x: new Float32Array(tot),
      y: new Float32Array(tot),
      vx: new Float32Array(tot),
      vy: new Float32Array(tot),
      hue: new Float32Array(tot),
      idle: 2,
      cx: w / 2,
      cy: h / 2,
      force: 0,
      wave: -1,
      t: 0,
    };
    let i = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        // a jittered grid: even coverage without looking mechanical
        const x = (c + 0.5 + (rand() - 0.5) * 0.8) * g;
        const y = (r + 0.5 + (rand() - 0.5) * 0.8) * g;
        s.hx[i] = s.x[i] = x;
        s.hy[i] = s.y[i] = y;
        // colour drifts across the field in a diagonal gradient with a bit of noise
        s.hue[i] = (x / w) * 0.6 + (y / h) * 0.4 + (rand() - 0.5) * 0.12;
        i++;
      }
    return s;
  },
  step(s, f) {
    const { w, h, dt } = f;
    if (dt <= 0) return;
    const m = Math.min(w, h);
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    let tx = f.p.x;
    let ty = f.p.y;
    let on = f.p.over ? 1 : 0;
    if (s.idle > 2.5) {
      const a = s.t * 0.7;
      tx = w / 2 + Math.cos(a) * w * 0.3;
      ty = h / 2 + Math.sin(a * 1.6) * h * 0.25;
      on = 1;
    }
    s.cx = approach(s.cx, tx, 30, dt);
    s.cy = approach(s.cy, ty, 30, dt);
    s.force = approach(s.force, on, 6, dt);
    if (f.pressed) {
      s.wave = 0;
      f.emit({ name: 'whoosh', gain: 0.6, pan: (f.p.x / w) * 2 - 1 });
    }
    if (s.wave >= 0) {
      s.wave += dt * m * 1.6;
      if (s.wave > m * 1.6) s.wave = -1;
    }
    const R = m * 0.17 * (1 + (f.p.down ? 0.35 : 0));
    const R2 = R * R;
    const push = m * 60 * s.force;
    const k = f.reduced ? 60 : 38; // spring home
    const c = f.reduced ? 14 : 5.5; // damping: low enough to overshoot a bit
    const wv = s.wave;
    const wW = m * 0.08;
    const pvx = f.p.vx;
    const pvy = f.p.vy;
    for (let i = 0; i < s.n; i++) {
      const x = s.x[i];
      const y = s.y[i];
      let ax = -(x - s.hx[i]) * k - s.vx[i] * c;
      let ay = -(y - s.hy[i]) * k - s.vy[i] * c;
      const dx = x - s.cx;
      const dy = y - s.cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2 && d2 > 1e-4) {
        const d = Math.sqrt(d2);
        const q = 1 - d / R;
        const fm = (push * q * q) / d;
        ax += dx * fm;
        ay += dy * fm;
        // a swirl, plus a little of the cursor's own motion dragged along (wake)
        ax += -dy * fm * 0.35 + pvx * q * 2.5;
        ay += dx * fm * 0.35 + pvy * q * 2.5;
      }
      if (wv >= 0) {
        const d = Math.sqrt(d2) || 1;
        const band = Math.abs(d - wv);
        if (band < wW) {
          const fm = (m * 38 * (1 - band / wW) * (1 - wv / (m * 1.6))) / d;
          ax += dx * fm;
          ay += dy * fm;
        }
      }
      s.vx[i] += ax * dt;
      s.vy[i] += ay * dt;
      s.x[i] = x + s.vx[i] * dt;
      s.y[i] = y + s.vy[i] * dt;
    }
  },
});

// colour buckets: base hue ramp × energy (displaced particles glow hotter)
const RAMP = ['#4f8dff', '#6f7fff', '#9b6cff', '#d066f5', '#ff6fb4', '#ff9878'];
const HOT = ['#d4e4ff', '#d8dcff', '#e6d6ff', '#f8d8ff', '#ffe0ee', '#fff0e6'];

export default function ParticleRepel() {
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
    const sz = Math.max(1.3, m * 0.0042);
    // the cursor's soft glow
    const gr = ctx.createRadialGradient(s.cx, s.cy, 0, s.cx, s.cy, m * 0.2);
    gr.addColorStop(0, `rgba(160,120,255,${0.18 * s.force})`);
    gr.addColorStop(1, 'rgba(160,120,255,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
    // bucket by colour so we only switch fillStyle a dozen times
    const NB = RAMP.length;
    for (let hot = 0; hot < 2; hot++)
      for (let b = 0; b < NB; b++) {
        ctx.fillStyle = hot ? HOT[b] : RAMP[b];
        ctx.beginPath();
        for (let i = 0; i < s.n; i++) {
          const bi = Math.min(NB - 1, Math.max(0, Math.floor(s.hue[i] * NB)));
          if (bi !== b) continue;
          const ex = s.x[i] - s.hx[i];
          const ey = s.y[i] - s.hy[i];
          const e = ex * ex + ey * ey > m * m * 0.0004 ? 1 : 0;
          if (e !== hot) continue;
          const r = hot ? sz * 1.35 : sz;
          ctx.rect(s.x[i] - r / 2, s.y[i] - r / 2, r, r);
        }
        ctx.fill();
      }
    if (s.wave >= 0) {
      ctx.strokeStyle = `rgba(200,180,255,${0.25 * (1 - s.wave / (m * 1.6))})`;
      ctx.lineWidth = m * 0.006;
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, s.wave, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [fx.t, w, h, fx.s]);
  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: 'radial-gradient(120% 100% at 50% 40%, #121029 0%, #0a0918 60%, #050409 100%)' }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)' }} />
    </Stage>
  );
}
