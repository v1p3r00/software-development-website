import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * Silk ribbons on a string. Each ribbon is a verlet rope pinned to the cursor: it trails behind
 * when you move, then drag and a touch of gravity let it settle and sway. A twist travels along
 * every ribbon, so it turns edge-on and catches the light like real silk.
 */

const R = 4; // ribbons
const N = 64; // points per ribbon
const COLORS: [number, number][] = [
  [338, 82], // hue, saturation
  [24, 90],
  [268, 70],
  [190, 75],
];

const segLen = (w: number, h: number) => Math.min(w, h) * 0.013;

interface Pt {
  x: number;
  y: number;
  px: number;
  py: number;
}
interface S {
  ropes: Pt[][];
  idle: number;
  hx: number;
  hy: number;
  t: number;
  wasFast: boolean;
}


export const sim = defineSim<S>({
  init: (w, h) => ({
    // start hanging straight down from the centre
    ropes: Array.from({ length: R }, (_, r) =>
      Array.from({ length: N }, (_, i) => {
        const x = w / 2 + (r - 1.5) * i * 0.4;
        const y = h * 0.3 + i * segLen(w, h);
        return { x, y, px: x, py: y };
      }),
    ),
    idle: 3,
    hx: w / 2,
    hy: h / 2,
    t: 0,
    wasFast: false,
  }),
  step(s, f) {
    const { w, h, dt } = f;
    if (dt <= 0) return;
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    const m = Math.min(w, h);
    let tx = f.p.x;
    let ty = f.p.y;
    if (s.idle > 2.5) {
      // self-demo: a lazy figure-eight through the stage
      const a = s.t * 0.9;
      tx = w / 2 + Math.sin(a) * w * 0.3;
      ty = h / 2 + Math.sin(a * 2) * h * 0.18;
    }
    s.hx = tx;
    s.hy = ty;
    const L = segLen(w, h);
    const g = m * 0.9; // gentle gravity so a still ribbon hangs and sways
    const damp = f.reduced ? 0.9 : 0.965;
    s.ropes.forEach((rope, r) => {
      // each ribbon's knot sits slightly apart from the others, slowly circling
      const ang = (r / R) * Math.PI * 2 + s.t * 0.6;
      const ox = Math.cos(ang) * m * 0.02;
      const oy = Math.sin(ang) * m * 0.02;
      for (let i = 1; i < N; i++) {
        const p = rope[i];
        const vx = (p.x - p.px) * damp;
        const vy = (p.y - p.py) * damp;
        p.px = p.x;
        p.py = p.y;
        // a soft breeze that differs per ribbon keeps them from overlapping
        const breeze = Math.sin(s.t * 1.3 + i * 0.14 + r * 1.7) * m * 0.25;
        p.x += vx + breeze * dt * dt;
        p.y += vy + g * dt * dt;
      }
      rope[0].x = tx + ox;
      rope[0].y = ty + oy;
      rope[0].px = rope[0].x;
      rope[0].py = rope[0].y;
      // distance constraints, head pinned
      for (let it = 0; it < 6; it++) {
        for (let i = 1; i < N; i++) {
          const a = rope[i - 1];
          const b = rope[i];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1e-6;
          const k = (d - L) / d;
          if (i === 1) {
            b.x -= dx * k;
            b.y -= dy * k;
          } else {
            a.x += dx * k * 0.5;
            a.y += dy * k * 0.5;
            b.x -= dx * k * 0.5;
            b.y -= dy * k * 0.5;
          }
        }
      }
    });
    const fast = Math.hypot(f.p.vx, f.p.vy) > m * 4 && s.idle === 0;
    if (fast && !s.wasFast) f.emit({ name: 'swoosh', gain: 0.35, rate: 0.9 + f.rand() * 0.2, pan: (f.p.x / w) * 2 - 1 });
    s.wasFast = fast;
  },
});

export default function RibbonTrail() {
  const fx = useFx(sim);
  const cv = useRef<HTMLCanvasElement>(null);
  const { w, h } = fx;

  useLayoutEffect(() => {
    const c = cv.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr)) c.width = Math.round(w * dpr);
    if (c.height !== Math.round(h * dpr)) c.height = Math.round(h * dpr);
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const s = fx.s;
    const m = Math.min(w, h);
    const W = m * 0.036; // ribbon half-width
    s.ropes.forEach((rope, r) => {
      const [hue, sat] = COLORS[r];
      // normals along the chain
      const nx: number[] = [];
      const ny: number[] = [];
      for (let i = 0; i < N; i++) {
        const a = rope[Math.max(0, i - 1)];
        const b = rope[Math.min(N - 1, i + 1)];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        nx.push(-dy / d);
        ny.push(dx / d);
      }
      // the twist: travels down the ribbon, and bends add to it
      const tw: number[] = [];
      let acc = r * 1.3 + s.t * 1.6;
      for (let i = 0; i < N; i++) {
        if (i > 0) acc += 0.09 + Math.abs(nx[i] - nx[i - 1]) * 0.9;
        tw.push(acc);
      }
      // contact shadow on the "page" below
      ctx.beginPath();
      rope.forEach((p, i) => (i ? ctx.lineTo(p.x + m * 0.012, p.y + m * 0.03) : ctx.moveTo(p.x + m * 0.012, p.y + m * 0.03)));
      ctx.strokeStyle = 'rgba(0,0,0,0.28)';
      ctx.lineWidth = W * 1.1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      for (let i = 0; i < N - 1; i++) {
        const taper0 = 1 - (i / N) * 0.65;
        const taper1 = 1 - ((i + 1) / N) * 0.65;
        const c0 = Math.cos(tw[i]);
        const c1 = Math.cos(tw[i + 1]);
        // the visible width shrinks as the ribbon turns edge-on
        const w0 = W * taper0 * (0.12 + 0.88 * Math.abs(c0));
        const w1 = W * taper1 * (0.12 + 0.88 * Math.abs(c1));
        const a = rope[i];
        const b = rope[i + 1];
        // silk sheen: bright when the face points at the light, dark on the back side
        const face = (c0 + c1) / 2;
        const sheen = Math.pow(Math.abs(face), 3);
        const back = face < 0;
        const light = clamp((back ? 30 : 46) + sheen * 34 - (i / N) * 8, 18, 92);
        ctx.beginPath();
        ctx.moveTo(a.x + nx[i] * w0, a.y + ny[i] * w0);
        ctx.lineTo(b.x + nx[i + 1] * w1, b.y + ny[i + 1] * w1);
        ctx.lineTo(b.x - nx[i + 1] * w1, b.y - ny[i + 1] * w1);
        ctx.lineTo(a.x - nx[i] * w0, a.y - ny[i] * w0);
        ctx.closePath();
        const col = `hsl(${hue + (back ? -8 : 0)} ${sat}% ${light}%)`;
        ctx.fillStyle = col;
        ctx.strokeStyle = col; // hairline stroke hides the seams between quads
        ctx.lineWidth = 0.8;
        ctx.fill();
        ctx.stroke();
      }
      // a bright knot where the ribbons are tied to the cursor
      const hd = rope[0];
      ctx.beginPath();
      ctx.arc(hd.x, hd.y, W * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue} ${sat}% 70%)`;
      ctx.fill();
    });
    // the tie point
    ctx.beginPath();
    ctx.arc(s.hx, s.hy, m * 0.014, 0, Math.PI * 2);
    ctx.fillStyle = '#fff6ee';
    ctx.shadowColor = 'rgba(255,220,200,0.8)';
    ctx.shadowBlur = m * 0.03;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [fx.t, w, h, fx.s]);

  return (
    <Stage fx={fx} cursor="none" style={{ background: 'radial-gradient(120% 100% at 50% 0%, #2b2230 0%, #16121a 55%, #0b090d 100%)' }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(80% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </Stage>
  );
}
