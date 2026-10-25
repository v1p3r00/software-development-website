import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A double helix of dots, rotating in 3D: each dot's size, brightness and draw order come from
 * its depth, so the strands really pass in front of each other. Base pairs bridge the strands.
 * Hover to unzip the helix locally (the pairs let go and the strands bulge apart on springs);
 * press to spin it faster.
 */

const PAIRS = ['#ff5d8f', '#ffc94d', '#4de1c1', '#6aa8ff'];

interface S {
  N: number;
  zip: Spring[]; // 0 = zipped, 1 = open
  spin: Spring;
  phase: number;
  idle: number;
  t: number;
  prog: number;
  lastOpen: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  // on tall stages the helix stands up (drawn in a frame rotated 90° about the centre)
  const vert = h > w * 1.2;
  const L = vert ? h : w;
  const len = Math.min(L * 0.8, m * 1.5);
  const N = Math.max(14, Math.round(len / (m * 0.045)));
  return { m, vert, x0: w / 2 - len / 2, len, N, cy: vert ? h / 2 : h * 0.48, A: m * 0.13 };
}

export const sim = defineSim<S>({
  init: (w, h) => {
    const N = geom(w, h).N;
    return { N, zip: Array.from({ length: N }, () => sp()), spin: sp(1), phase: 0, idle: 2, t: 0, prog: 0, lastOpen: 0 };
  },
  step(s, f) {
    const { w, h, dt } = f;
    const g = geom(w, h);
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    spring(s.spin, f.p.down ? 3.2 : 1, 40, 8, dt);
    if (f.pressed) f.emit({ name: 'whoosh', gain: 0.4, rate: 1.3 });
    s.phase += dt * 1.6 * s.spin.x;
    s.prog = (s.prog + dt * 0.12 * s.spin.x) % 1;
    // pointer in the helix frame: along the strand, and across it
    let px = g.vert ? w / 2 + (f.p.y - h / 2) : f.p.x;
    const across = g.vert ? f.p.x - w / 2 : f.p.y - g.cy;
    let near = f.p.over && Math.abs(across) < g.A * 2.2;
    if (s.idle > 2.5) {
      // self-demo: an unzip bubble travels along the strand
      const u = (s.t * 0.45) % 1.4;
      px = g.x0 - g.len * 0.1 + u * g.len;
      near = u < 1.2;
    }
    let open = 0;
    s.zip.forEach((z, i) => {
      const x = g.x0 + (i / (s.N - 1)) * g.len;
      const d = (x - px) / (g.m * 0.14);
      const tg = near ? Math.exp(-d * d) : 0;
      spring(z, tg, 120, f.reduced ? 25 : 8, dt);
      if (z.x > 0.5) open++;
    });
    if (open > 0 && s.lastOpen === 0) f.emit({ name: 'rustle', gain: 0.25, rate: 1.4 });
    s.lastOpen = open;
  },
});

export default function DnaLoader() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const { m, x0, len, cy, A } = g;
  const N = s.N;
  const r0 = m * 0.017;
  type Dot = { x: number; y: number; z: number; strand: number; i: number };
  const dots: Dot[] = [];
  const rungs: { x: number; y1: number; y2: number; z: number; i: number; open: number }[] = [];
  for (let i = 0; i < N; i++) {
    const x = x0 + (i / (N - 1)) * len;
    const ph = i * 0.42 + s.phase;
    const open = clamp(s.zip[i].x, -0.2, 1.3);
    // unzipped strands bulge apart and flatten their twist
    const amp = A * (1 + open * 0.9);
    const ya = cy + Math.sin(ph) * amp * (1 - open * 0.4) - open * A * 0.5;
    const yb = cy - Math.sin(ph) * amp * (1 - open * 0.4) + open * A * 0.5;
    const za = Math.cos(ph);
    dots.push({ x, y: ya, z: za, strand: 0, i }, { x, y: yb, z: -za, strand: 1, i });
    rungs.push({ x, y1: ya, y2: yb, z: 0, i, open });
  }
  dots.sort((a, b) => a.z - b.z);
  const pct = Math.round(s.prog * 100);
  const lab = g.vert ? h / 2 + len / 2 + m * 0.09 : cy + A * 2.6;
  return (
    <Stage fx={fx} cursor="ew-resize" style={{ background: 'radial-gradient(110% 80% at 50% 45%, #0f2230 0%, #081520 55%, #030a10 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`a${uid}`} cx="35%" cy="30%" r="70%">
            <stop offset="0" stopColor="#e9fdff" />
            <stop offset="0.35" stopColor="#5fe3ff" />
            <stop offset="1" stopColor="#0c6aa8" />
          </radialGradient>
          <radialGradient id={`b${uid}`} cx="35%" cy="30%" r="70%">
            <stop offset="0" stopColor="#ffeefe" />
            <stop offset="0.35" stopColor="#c77dff" />
            <stop offset="1" stopColor="#5a1aa8" />
          </radialGradient>
          <filter id={`gl${uid}`} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.03} />
          </filter>
        </defs>
        <g transform={g.vert ? `rotate(90 ${w / 2} ${h / 2})` : undefined}>
        {/* a soft glow along the helix */}
        <rect x={x0} y={cy - A * 0.5} width={len} height={A} rx={A * 0.5} fill="#2bb8ff" opacity={0.12} filter={`url(#gl${uid})`} />
        {/* base pairs: two halves meet in the middle; they part when the helix unzips */}
        {rungs.map((r) => {
          const gap = clamp(r.open) * Math.abs(r.y2 - r.y1) * 0.5;
          const mid = (r.y1 + r.y2) / 2;
          const dir = r.y2 > r.y1 ? 1 : -1;
          const o = 0.55 * (1 - clamp(r.open) * 0.6);
          return (
            <g key={r.i} strokeWidth={m * 0.006} strokeLinecap="round" opacity={o}>
              <line x1={r.x} y1={r.y1} x2={r.x} y2={mid - (dir * gap) / 2} stroke={PAIRS[r.i % 4]} />
              <line x1={r.x} y1={mid + (dir * gap) / 2} x2={r.x} y2={r.y2} stroke={PAIRS[(r.i + 2) % 4]} />
            </g>
          );
        })}
        {dots.map((d) => {
          const k = (d.z + 1) / 2; // 0 back .. 1 front
          return (
            <circle
              key={`${d.strand}-${d.i}`}
              cx={d.x}
              cy={d.y}
              r={r0 * (0.55 + 0.6 * k)}
              fill={`url(#${d.strand ? 'b' : 'a'}${uid})`}
              opacity={0.35 + 0.65 * k}
            />
          );
        })}
        </g>
        <text x={w / 2} y={lab} textAnchor="middle" fontFamily="'JetBrains Mono Variable', monospace" fontSize={Math.max(10, m * 0.03)} fill="#7fc8e8" letterSpacing="0.16em">
          {`SEQUENCING · ${String(pct).padStart(2, '0')}%`}
        </text>
        <rect x={w / 2 - m * 0.2} y={lab + m * 0.025} width={m * 0.4} height={m * 0.006} rx={m * 0.003} fill="#fff" opacity={0.1} />
        <rect x={w / 2 - m * 0.2} y={lab + m * 0.025} width={m * 0.4 * s.prog} height={m * 0.006} rx={m * 0.003} fill="#5fe3ff" />
      </svg>
    </Stage>
  );
}
