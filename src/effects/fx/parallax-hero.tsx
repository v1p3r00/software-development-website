import { useId, useMemo } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A mountain hero in layers. Each ridge sits at its own depth: near layers slide further than far
 * ones as you move, air haze fades the distant ranges, mist drifts between them and the title
 * hides behind the front peaks. Press to dolly in; leave it and the camera drifts on its own.
 */

const LAYERS = [
  // depth (0 far .. 1 near), base height (fraction of h), roughness, colours
  { d: 0.08, y: 0.62, r: 0.3, c0: '#8fa6d6', c1: '#b9c4e6' },
  { d: 0.22, y: 0.7, r: 0.28, c0: '#6c84c0', c1: '#93a6d6' },
  { d: 0.42, y: 0.8, r: 0.26, c0: '#465c9a', c1: '#6a7fb8' },
  { d: 0.68, y: 0.9, r: 0.2, c0: '#283a6c', c1: '#3c5089' },
  { d: 1.0, y: 1.0, r: 0.16, c0: '#121a36', c1: '#1d2850' },
];
const TEXT_DEPTH = 0.32;

interface S {
  cx: Spring; // camera, -1..1
  cy: Spring;
  zoom: Spring;
  idle: number;
  wasIn: boolean;
}

export const sim = defineSim<S>({
  init: () => ({ cx: sp(), cy: sp(), zoom: sp(1), idle: 0, wasIn: false }),
  step(s, f) {
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    let tx = (f.p.x / f.w) * 2 - 1;
    let ty = (f.p.y / f.h) * 2 - 1;
    if (!f.p.over || s.idle > 1.5) {
      // idle: a slow drone-like drift
      tx = Math.sin(f.t * 0.45) * 0.85;
      ty = Math.sin(f.t * 0.31 + 1) * 0.5;
    }
    spring(s.cx, clamp(tx, -1, 1), 30, f.reduced ? 14 : 9, f.dt);
    spring(s.cy, clamp(ty, -1, 1), 30, f.reduced ? 14 : 9, f.dt);
    const dolly = f.p.down || (s.idle > 1.5 && Math.sin(f.t * 0.6) > 0.55);
    if (dolly && !s.wasIn) f.emit({ name: 'whoosh', gain: 0.3, rate: 0.8 });
    s.wasIn = dolly;
    spring(s.zoom, dolly ? 1.12 : 1, 40, f.reduced ? 16 : 10, f.dt);
  },
});

/** a ridge line: layered sines plus a couple of peaks, deterministic per layer */
function ridge(i: number, w: number, h: number) {
  const L = LAYERS[i];
  const pts: string[] = [];
  const x0 = -w * 0.35;
  const x1 = w * 1.35;
  const n = 120;
  for (let k = 0; k <= n; k++) {
    const x = x0 + ((x1 - x0) * k) / n;
    const u = x / w;
    // ridged noise: 1 - |sin| makes sharp crests like real ranges
    const r = (f: number, ph: number) => 1 - Math.abs(Math.sin(u * f + ph));
    const massif = Math.exp(-(((u - [0.3, 0.72, 0.18, 0.85, 0.5][i]) * 2.6) ** 2));
    const hgt = (0.35 * r(2.3 + i * 0.4, i * 1.9) + 0.25 * r(5.7 + i, i * 0.7 + 1) + 0.12 * r(13.3, i * 2.3) + 0.04 * Math.sin(u * 41 + i)) * (0.5 + massif) + massif * 0.45;
    const y = h * (L.y - L.r * hgt);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${x0},${h * 1.3} L${pts.join(' L')} L${x1},${h * 1.3} Z`;
}

export default function ParallaxHero() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const m = Math.min(w, h);
  const paths = useMemo(() => LAYERS.map((_, i) => ridge(i, w, h)), [w, h]);
  const amp = w * 0.1;
  const z = s.zoom.x;
  // each layer moves (and scales) by its depth
  const layerT = (d: number) => {
    const sc = 1 + (z - 1) * (0.3 + d * 1.2);
    return `translate(${w / 2 - s.cx.x * amp * d} ${h * 0.6 - s.cy.x * amp * 0.5 * d}) scale(${sc}) translate(${-w / 2} ${-h * 0.6})`;
  };
  const sunX = w * 0.68 - s.cx.x * amp * 0.03;
  const sunY = h * 0.36 - s.cy.x * amp * 0.02;

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: '#1d2850' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b2556" />
            <stop offset="0.45" stopColor="#6b5ea8" />
            <stop offset="0.75" stopColor="#f19a8a" />
            <stop offset="1" stopColor="#ffd2a1" />
          </linearGradient>
          <radialGradient id={`sun${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff4d6" />
            <stop offset="0.25" stopColor="#ffd9a0" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff9a7a" stopOpacity="0" />
          </radialGradient>
          {LAYERS.map((L, i) => (
            <linearGradient key={i} id={`l${i}${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={L.c1} />
              <stop offset="0.5" stopColor={L.c0} />
            </linearGradient>
          ))}
          <linearGradient id={`mist${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe6d6" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffe6d6" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ffe6d6" stopOpacity="0" />
          </linearGradient>
          <filter id={`soft${uid}`} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.02} />
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#sky${uid})`} />
        {/* stars, nearly fixed */}
        {Array.from({ length: 36 }, (_, k) => (
          <circle key={k} cx={(((k * 61.7) % 100) / 100) * w - s.cx.x * 2} cy={(((k * 23.3) % 38) / 100) * h} r={m * 0.0018 * (1 + (k % 3))} fill="#fff" opacity={(0.3 + 0.4 * Math.abs(Math.sin(t * 1.3 + k))) * 0.8} />
        ))}
        <circle cx={sunX} cy={sunY} r={m * 0.32} fill={`url(#sun${uid})`} />
        <circle cx={sunX} cy={sunY} r={m * 0.06} fill="#fff6e2" />
        {LAYERS.map((L, i) => (
          <g key={i} transform={layerT(L.d)}>
            <path d={paths[i]} fill={`url(#l${i}${uid})`} />
            {/* rim light on the ridge facing the sun */}
            <path d={paths[i]} fill="none" stroke="#ffd2b0" strokeOpacity={0.35 - L.d * 0.25} strokeWidth={Math.max(1, m * 0.003)} />
            {/* mist drifting behind this ridge's feet */}
            {i < 4 && <rect x={-w * 0.3 + ((t * (8 + i * 6)) % (w * 0.3))} y={h * (L.y + 0.02)} width={w * 1.9} height={h * 0.1} fill={`url(#mist${uid})`} filter={`url(#soft${uid})`} />}
            {i === 0 && (
              // the title lives between the ranges: front peaks pass in front of it
              <g transform={`translate(${-s.cx.x * amp * (TEXT_DEPTH - L.d)} 0)`}>
                <text x={w / 2} y={h * 0.41} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={900} fontSize={Math.min(w * 0.16, m * 0.24)} letterSpacing={m * 0.004} fill="#fff7ee" opacity="0.95">
                  WILD
                </text>
              </g>
            )}
          </g>
        ))}
        {/* birds gliding across the near sky */}
        {Array.from({ length: 5 }, (_, k) => {
          const bx = (((t * (30 + k * 6) + k * 170) % (w * 1.4)) - w * 0.2) - s.cx.x * amp * 0.6;
          const by = h * (0.22 + k * 0.035) + Math.sin(t * 2 + k) * m * 0.01 - s.cy.x * amp * 0.3;
          const flap = Math.sin(t * 9 + k * 2) * m * 0.008;
          const bs = m * 0.014 * (1 + (k % 2) * 0.4);
          return <path key={k} d={`M${bx - bs},${by - flap} Q${bx - bs * 0.4},${by - flap * 0.2} ${bx},${by} Q${bx + bs * 0.4},${by - flap * 0.2} ${bx + bs},${by - flap}`} fill="none" stroke="#1d2244" strokeWidth={Math.max(1, m * 0.003)} strokeLinecap="round" />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: h * 0.06, textAlign: 'center', fontFamily: "'Inter Variable', Inter, system-ui", fontWeight: 600, fontSize: m * 0.03, letterSpacing: m * 0.008, color: '#c8d2f2', transform: `translateX(${-s.cx.x * amp * 1.2}px)` }}>
        EXPLORE THE HIGH COUNTRY
      </div>
    </Stage>
  );
}
