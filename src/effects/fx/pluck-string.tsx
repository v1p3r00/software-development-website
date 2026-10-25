import { useId } from 'react';
import { defineSim, useFx, Stage, clamp, approach } from '../kit';

/**
 * A divider you can pluck. Grab the line (or swipe across it) and it bends into a triangle
 * under your finger; let go and it rings. The vibration is real modal physics: the released
 * shape is split into harmonics, each ringing at n × the fundamental and dying faster the
 * higher it is — so you see the bright, kinked attack smooth out into a soft hum.
 */

const N = 120;
const MODES = 14;

interface S {
  re: number[]; // each harmonic as a rotating phasor: displacement = re
  im: number[];
  hold: 0 | 1 | 2; // 0 free, 1 grabbed with a press, 2 caught by a swipe
  hx: number; // grab point along the string (0..1)
  hy: number; // pull, px
  py: number; // last pointer y relative to the line (for swipe detection)
  idle: number;
  autoT: number;
  autoX: number;
  t: number;
  ring: number; // 0..1 how loudly it is ringing (for the glow)
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const x0 = w * 0.1;
  const x1 = w * 0.9;
  return { m, x0, x1, y: h * 0.52, max: m * 0.16 };
}

/** the held shape: a triangle with a slightly rounded apex */
function tri(x: number, hx: number, hy: number) {
  const k = x < hx ? x / Math.max(1e-3, hx) : (1 - x) / Math.max(1e-3, 1 - hx);
  return hy * (k * k * (3 - 2 * k) * 0.25 + k * 0.75);
}

function shape(s: S, x: number) {
  if (s.hold) return tri(x, s.hx, s.hy);
  let y = 0;
  for (let n = 0; n < MODES; n++) y += s.re[n] * Math.sin((n + 1) * Math.PI * x);
  return y;
}

export const sim = defineSim<S>({
  init: () => ({ re: Array(MODES).fill(0), im: Array(MODES).fill(0), hold: 0, hx: 0.5, hy: 0, py: 0, idle: 2, autoT: 0, autoX: 0.4, t: 0, ring: 0 }),
  step(s, f) {
    const { w, h, dt } = f;
    const g = geom(w, h);
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    const release = () => {
      // project the bent shape onto the string's harmonics
      for (let n = 0; n < MODES; n++) {
        let a = 0;
        for (let i = 1; i < N; i++) {
          const x = i / N;
          a += tri(x, s.hx, s.hy) * Math.sin((n + 1) * Math.PI * x);
        }
        s.re[n] = (2 / N) * a;
        s.im[n] = 0;
      }
      const amp = Math.abs(s.hy) / g.max;
      f.emit({ name: 'boing', gain: clamp(0.25 + amp, 0, 1), rate: 1.4 + (0.5 - Math.abs(s.hx - 0.5)) * 0.6, pan: s.hx * 2 - 1 });
      s.hold = 0;
    };
    let px = f.p.x;
    let py = f.p.y;
    let down = f.p.down;
    if (s.idle > 2.5) {
      // self-demo: an invisible finger plucks at a new spot every couple of seconds
      s.autoT += dt;
      if (s.autoT > 2.2) {
        s.autoT = 0;
        s.autoX = 0.25 + f.rand() * 0.5;
      }
      const u = clamp((s.autoT - 0.2) / 0.5);
      px = g.x0 + (g.x1 - g.x0) * s.autoX;
      py = g.y - u * u * g.max * 0.75;
      down = s.autoT > 0.15 && s.autoT < 0.7;
      if (down && !s.hold) {
        s.hold = 1;
        s.hx = s.autoX;
      }
    }
    const ux = clamp((px - g.x0) / (g.x1 - g.x0), 0.03, 0.97);
    const rel = py - g.y;
    const inside = px > g.x0 && px < g.x1;
    if (!s.hold && inside) {
      const here = shape(s, ux);
      if (f.pressed && Math.abs(rel - here) < g.m * 0.07) {
        s.hold = 1;
        s.hx = ux;
        f.emit({ name: 'tick', gain: 0.25 });
      } else if (!down && f.p.over && Math.sign(rel) !== Math.sign(s.py) && Math.abs(s.py) < g.m * 0.1 && s.idle === 0) {
        // swiping across the line catches it for a moment
        s.hold = 2;
        s.hx = ux;
      }
    }
    // pressing while a swipe has the string turns it into a proper grab
    if (s.hold === 2 && f.pressed) s.hold = 1;
    if (s.hold) {
      s.hx = approach(s.hx, ux, 20, dt);
      s.hy = clamp(rel, -g.max * 1.2, g.max * 1.2);
      const lim = s.hold === 2 ? g.m * 0.07 : g.max;
      if ((s.hold === 1 && !down) || Math.abs(rel) > lim || !inside) release();
    }
    s.py = rel;
    // ring the harmonics: rotate each phasor by its frequency and damp it
    let e = 0;
    const w1 = Math.PI * 2 * 2.4; // a slow, visible fundamental
    for (let n = 0; n < MODES; n++) {
      const k = n + 1;
      const om = w1 * k;
      const d = Math.exp(-(f.reduced ? 5 : 1.1 + 0.45 * k) * dt);
      const c = Math.cos(om * dt) * d;
      const sn = Math.sin(om * dt) * d;
      const re = s.re[n] * c - s.im[n] * sn;
      s.im[n] = s.re[n] * sn + s.im[n] * c;
      s.re[n] = re;
      e += Math.hypot(s.re[n], s.im[n]);
    }
    s.ring = approach(s.ring, clamp(e / (g.m * 0.08)), 12, dt);
  },
});

export default function PluckString() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    pts.push(`${(g.x0 + (g.x1 - g.x0) * x).toFixed(1)},${(g.y + shape(s, x)).toFixed(1)}`);
  }
  const d = `M${pts.join('L')}`;
  const ring = s.ring;
  const tension = s.hold ? clamp(Math.abs(s.hy) / g.max) : 0;
  const fs = g.m * 0.1;
  return (
    <Stage fx={fx} cursor="grab" style={{ background: 'linear-gradient(180deg, #f6f1e9 0%, #ece4d6 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`s${uid}`} x1="0" x2="1">
            <stop offset="0" stopColor="#a8875a" />
            <stop offset="0.5" stopColor={`rgb(${200 + ring * 40},${120 + ring * 30},${60})`} />
            <stop offset="1" stopColor="#a8875a" />
          </linearGradient>
          <filter id={`b${uid}`} x="-10%" y="-100%" width="120%" height="300%">
            <feGaussianBlur stdDeviation={g.m * 0.012} />
          </filter>
          <radialGradient id={`v${uid}`} cx="50%" cy="45%" r="75%">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#5a4026" stopOpacity="0.22" />
          </radialGradient>
        </defs>
        {/* page content above and below the divider */}
        <text x={g.x0} y={g.y - g.m * 0.24} fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={fs} fill="#2b2118" letterSpacing={-fs * 0.02}>
          Chapter two
        </text>
        <text x={g.x0} y={g.y - g.m * 0.24 + fs * 0.75} fontFamily="'JetBrains Mono Variable', monospace" fontSize={fs * 0.26} fill="#8a7458" letterSpacing={fs * 0.02}>
          PLUCK THE LINE ↓
        </text>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={g.x0} y={g.y + g.m * 0.22 + i * g.m * 0.065} width={(g.x1 - g.x0) * [0.92, 0.84, 0.55][i]} height={g.m * 0.022} rx={g.m * 0.011} fill="#d8ccb8" />
        ))}
        {/* the pegs at each end */}
        {[g.x0, g.x1].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={g.y + g.m * 0.006} r={g.m * 0.016} fill="#000" opacity={0.15} filter={`url(#b${uid})`} />
            <circle cx={x} cy={g.y} r={g.m * 0.012} fill="#7d5d38" />
            <circle cx={x - g.m * 0.004} cy={g.y - g.m * 0.004} r={g.m * 0.004} fill="#fff" opacity={0.6} />
          </g>
        ))}
        {/* shadow of the string on the page, and a warm glow while it rings */}
        <path d={d} fill="none" stroke="#5a4026" strokeOpacity={0.18} strokeWidth={g.m * 0.01} transform={`translate(0 ${g.m * 0.016})`} filter={`url(#b${uid})`} />
        <path d={d} fill="none" stroke="#ff9a3c" strokeOpacity={ring * 0.55} strokeWidth={g.m * 0.03} filter={`url(#b${uid})`} />
        {/* the string thins slightly under tension */}
        <path d={d} fill="none" stroke={`url(#s${uid})`} strokeWidth={g.m * (0.007 - tension * 0.002)} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={g.m * 0.0018} transform={`translate(0 ${-g.m * 0.0015})`} />
        {s.hold ? <circle cx={g.x0 + (g.x1 - g.x0) * s.hx} cy={g.y + s.hy} r={g.m * 0.018} fill="#2b2118" opacity={0.18} /> : null}
        <rect width={w} height={h} fill={`url(#v${uid})`} />
      </svg>
    </Stage>
  );
}
