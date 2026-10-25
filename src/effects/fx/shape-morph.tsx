import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Endless shape morph. Every outline is sampled at the same 160 angles, and each sample point
 * rides its own spring to the next shape. The springs are slightly different around the
 * outline, so the change ripples around the edge with a jelly overshoot instead of a flat
 * crossfade. Click to skip ahead; the shape leans toward the cursor.
 */

const N = 160;
const TAU = Math.PI * 2;
const SHAPES = ['circle', 'star', 'heart', 'squircle', 'flower', 'triangle'] as const;
const COLORS: [string, string][] = [
  ['#7bdcff', '#3a62ff'],
  ['#ffe066', '#ff8a00'],
  ['#ff8fb1', '#e0144c'],
  ['#9effa8', '#14a86e'],
  ['#e3a6ff', '#8a2be2'],
  ['#ffb08a', '#ff4e1a'],
];

function radius(kind: (typeof SHAPES)[number], a: number) {
  switch (kind) {
    case 'circle':
      return 0.9;
    case 'star': {
      const k = Math.abs(Math.cos(((a + Math.PI / 2) * 5) / 2));
      return 0.48 + 0.5 * Math.pow(k, 2.2);
    }
    case 'squircle':
      return 0.86 / Math.pow(Math.pow(Math.abs(Math.cos(a)), 4) + Math.pow(Math.abs(Math.sin(a)), 4), 0.25);
    case 'flower':
      return 0.72 + 0.22 * Math.cos(6 * a);
    case 'triangle': {
      const s = TAU / 3;
      const q = ((((a + Math.PI / 2) % s) + s) % s) - s / 2;
      return (0.5 / Math.cos(q)) * 0.88 + 0.12 * 0.7;
    }
    default: {
      // heart (point down in screen space): flip the angle so +y is down
      const t = -a;
      const r = 2 - 2 * Math.sin(t) + (Math.sin(t) * Math.sqrt(Math.abs(Math.cos(t)))) / (Math.sin(t) + 1.4);
      return r * 0.3;
    }
  }
}

interface S {
  px: Spring[];
  py: Spring[];
  idx: number;
  timer: number;
  ox: number; // centre offset for the current shape
  oy: number;
  rot: Spring;
  lean: Spring;
  kick: Spring;
  col: number;
  t: number;
}

function target(kind: (typeof SHAPES)[number]) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU;
    const r = radius(kind, a);
    xs.push(Math.cos(a) * r);
    ys.push(Math.sin(a) * r);
  }
  // centre the shape on its bounding box
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  return { xs: xs.map((x) => x - cx), ys: ys.map((y) => y - cy) };
}
const TARGETS = SHAPES.map(target);

export const sim = defineSim<S>({
  init: () => ({
    px: TARGETS[0].xs.map((x) => sp(x)),
    py: TARGETS[0].ys.map((y) => sp(y)),
    idx: 0,
    timer: 0,
    ox: 0,
    oy: 0,
    rot: sp(0),
    lean: sp(0),
    kick: sp(0),
    col: 0,
    t: 0,
  }),
  step(s, f) {
    const { w, h, dt } = f;
    s.t += dt;
    s.timer += dt;
    const next = () => {
      s.idx = (s.idx + 1) % SHAPES.length;
      s.timer = 0;
      s.rot.v += 1.6;
      s.kick.v += 3;
      f.emit({ name: 'swoosh', gain: 0.35, rate: 0.9 + s.idx * 0.06 });
    };
    if (f.pressed) next();
    else if (s.timer > 1.9) next();
    const T = TARGETS[s.idx];
    for (let i = 0; i < N; i++) {
      // stiffness varies around the outline so the morph travels as a ripple
      const a = (i / N) * TAU;
      const k = 70 + 50 * (0.5 + 0.5 * Math.sin(a * 2 + s.idx * 1.3));
      spring(s.px[i], T.xs[i], k, f.reduced ? 18 : 8.5, dt);
      spring(s.py[i], T.ys[i], k, f.reduced ? 18 : 8.5, dt);
    }
    spring(s.rot, 0, 30, 7, dt);
    spring(s.kick, 0, 200, 10, dt);
    const m = Math.min(w, h);
    spring(s.lean, f.p.over ? clamp((f.p.x - w / 2) / (m * 0.5), -1, 1) : Math.sin(s.t * 0.6) * 0.3, 60, 10, dt);
    s.col = approach(s.col, s.idx, 6, dt);
  },
});

export default function ShapeMorph() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const m = Math.min(w, h);
  const R = m * 0.3;
  const cx = w / 2;
  const cy = h * 0.47;
  let d = '';
  for (let i = 0; i < N; i++) {
    const x = s.px[i].x * R;
    const y = s.py[i].x * R;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  d += 'Z';
  const ci = Math.round(s.col) % COLORS.length;
  const [c0, c1] = COLORS[ci];
  const rot = s.rot.x * 25 + s.lean.x * 12;
  const sq = s.kick.x * 0.04;
  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(110% 90% at 50% 30%, #23233a 0%, #121222 60%, #08080f 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`f${uid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor={c0} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
          <radialGradient id={`hi${uid}`} cx="35%" cy="25%" r="60%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id={`gl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.05} />
          </filter>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.025} />
          </filter>
          <clipPath id={`c${uid}`}>
            <path d={d} />
          </clipPath>
        </defs>
        {/* floor shadow */}
        <ellipse cx={cx} cy={cy + R * 1.25} rx={R * 0.8 * (1 + sq)} ry={R * 0.1} fill="#000" opacity={0.5} filter={`url(#sh${uid})`} />
        <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${1 + sq} ${1 - sq})`}>
          {/* coloured glow behind */}
          <path d={d} fill={c1} opacity={0.45} filter={`url(#gl${uid})`} />
          <path d={d} fill={`url(#f${uid})`} />
          <g clipPath={`url(#c${uid})`}>
            {/* inner rim shade and a soft top highlight */}
            <path d={d} fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={R * 0.12} />
            <rect x={-R * 1.2} y={-R * 1.2} width={R * 2.4} height={R * 2.4} fill={`url(#hi${uid})`} transform={`rotate(${-rot})`} />
          </g>
          <path d={d} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={m * 0.003} />
        </g>
        <g transform={`translate(${cx} ${cy + R * 1.55})`}>
          {SHAPES.map((_, i) => (
            <circle key={i} cx={(i - (SHAPES.length - 1) / 2) * m * 0.035} cy={0} r={m * (i === s.idx ? 0.009 : 0.006)} fill={i === s.idx ? c0 : '#fff'} opacity={i === s.idx ? 1 : 0.25} />
          ))}
        </g>
      </svg>
      <button type="button" aria-label="Next shape" style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2, opacity: 0, cursor: 'pointer' }} />
    </Stage>
  );
}
