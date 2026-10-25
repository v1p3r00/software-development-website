import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Lights out. The page is pitch dark; the cursor is a torch with a soft, slightly flickering
 * beam that lags a hair behind the hand. Dust drifts through the light. Hold the beam on the
 * three hidden things to find them (press to focus the beam into a tight, bright spot).
 */

const ITEMS = [
  { x: 0.2, y: 0.32, kind: 'key', label: 'the key' },
  { x: 0.8, y: 0.3, kind: 'eye', label: 'someone' },
  { x: 0.66, y: 0.76, kind: 'star', label: 'a wish' },
] as const;
const DUST = 46;

interface S {
  x: Spring;
  y: Spring;
  rad: Spring; // beam radius factor (press focuses it)
  dwell: number[];
  found: Spring[];
  isFound: boolean[];
  dust: { x: number; y: number; vx: number; vy: number; z: number }[];
  idle: number;
  t: number;
  resetIn: number;
}

export const sim = defineSim<S>({
  init: (w, h, rand) => ({
    x: sp(w * 0.5),
    y: sp(h * 0.5),
    rad: sp(1),
    dwell: ITEMS.map(() => 0),
    found: ITEMS.map(() => sp()),
    isFound: ITEMS.map(() => false),
    dust: Array.from({ length: DUST }, () => ({ x: rand(), y: rand(), vx: (rand() - 0.5) * 0.02, vy: (rand() - 0.5) * 0.02, z: rand() })),
    idle: 2,
    t: 0,
    resetIn: 0,
  }),
  step(s, f) {
    const { w, h, dt } = f;
    const m = Math.min(w, h);
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    let tx = f.p.x;
    let ty = f.p.y;
    if (s.idle > 2.5) {
      // self-demo: a searching sweep that lingers over each hiding place
      const k = (s.t * 0.22) % 1;
      const seg = Math.floor(k * 3);
      const u = (k * 3) % 1;
      const a = ITEMS[seg];
      const b = ITEMS[(seg + 1) % 3];
      const e = u < 0.45 ? 0 : (u - 0.45) / 0.55;
      const ee = e * e * (3 - 2 * e);
      tx = (a.x + (b.x - a.x) * ee) * w + Math.sin(s.t * 2.3) * m * 0.03;
      ty = (a.y + (b.y - a.y) * ee) * h + Math.cos(s.t * 1.9) * m * 0.03 - Math.sin(ee * Math.PI) * h * 0.12;
    }
    // the beam has a little inertia, like a real torch in a hand
    spring(s.x, tx, 210, 20, dt);
    spring(s.y, ty, 210, 20, dt);
    spring(s.rad, f.p.down ? 0.62 : 1, 200, 14, dt);
    if (f.pressed) f.emit({ name: 'switch', gain: 0.4 });
    const R = m * 0.29 * s.rad.x;
    ITEMS.forEach((it, i) => {
      const d = Math.hypot(it.x * w - s.x.x, it.y * h - s.y.x);
      const lit = d < R * 0.55;
      s.dwell[i] = lit ? s.dwell[i] + dt * (f.p.down ? 2 : 1) : Math.max(0, s.dwell[i] - dt);
      if (!s.isFound[i] && s.dwell[i] > 0.45) {
        s.isFound[i] = true;
        s.found[i].v += 6;
        f.emit({ name: 'chime', gain: 0.55, rate: 1 + i * 0.12, pan: it.x * 2 - 1 });
        if (s.isFound.every(Boolean)) {
          f.emit({ name: 'success', gain: 0.5 });
          s.resetIn = 3.5;
        }
      }
      spring(s.found[i], s.isFound[i] ? 1 : 0, 160, 9, dt);
    });
    if (s.resetIn > 0) {
      s.resetIn -= dt;
      if (s.resetIn <= 0) s.isFound = s.isFound.map(() => false);
    }
    // dust drifts slowly and swirls in the wake of the beam
    for (const p of s.dust) {
      p.vx = approach(p.vx, (f.rand() - 0.5) * 0.04 + s.x.v / w * 0.02 * p.z, 1, dt);
      p.vy = approach(p.vy, (f.rand() - 0.5) * 0.04 - 0.008 + s.y.v / h * 0.02 * p.z, 1, dt);
      p.x = (p.x + p.vx * dt + 1) % 1;
      p.y = (p.y + p.vy * dt + 1) % 1;
    }
  },
});

function Icon({ kind, s, glow }: { kind: string; s: number; glow: number }) {
  const st = { fill: 'none', stroke: '#f6d58a', strokeWidth: s * 0.07, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'key')
    return (
      <g {...st} transform={`rotate(-30)`}>
        <circle cx={-s * 0.35} cy={0} r={s * 0.22} />
        <path d={`M${-s * 0.13} 0H${s * 0.5}M${s * 0.32} 0v${s * 0.16}M${s * 0.45} 0v${s * 0.12}`} />
      </g>
    );
  if (kind === 'eye')
    return (
      <g {...st}>
        <path d={`M${-s * 0.5} 0Q0 ${-s * 0.42} ${s * 0.5} 0Q0 ${s * 0.42} ${-s * 0.5} 0Z`} />
        <circle r={s * 0.14} fill="#f6d58a" />
        <circle r={s * 0.05} cx={s * 0.05} cy={-s * 0.05} fill="#fff" stroke="none" opacity={0.6 + glow * 0.4} />
      </g>
    );
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? s * 0.2 : s * 0.48;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
  return <polygon points={pts} {...st} />;
}

export default function Flashlight() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const m = Math.min(w, h);
  // a faint battery flicker
  const flick = 1 - 0.04 * Math.max(0, Math.sin(t * 23) * Math.sin(t * 7.1) * Math.sin(t * 2.3));
  const R = m * 0.29 * s.rad.x;
  const bx = s.x.x;
  const by = s.y.x;
  const bright = flick * (1.15 - s.rad.x * 0.15);
  const mask = `radial-gradient(circle ${R}px at ${bx}px ${by}px, rgba(0,0,0,0) 0%, rgba(0,0,0,${0.12 / bright}) 38%, rgba(0,0,0,0.82) 72%, rgba(0,0,0,1) 100%)`;
  const nFound = s.isFound.filter(Boolean).length;
  const is = m * 0.11;

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: '#07070a' }}>
      {/* the hidden page, in full light */}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <pattern id={`wp${uid}`} width={m * 0.08} height={m * 0.08} patternUnits="userSpaceOnUse">
            <rect width={m * 0.08} height={m * 0.08} fill="#2a2532" />
            <path d={`M0 ${m * 0.04}L${m * 0.04} 0L${m * 0.08} ${m * 0.04}L${m * 0.04} ${m * 0.08}Z`} fill="none" stroke="#3b3446" strokeWidth={m * 0.004} />
            <circle cx={m * 0.04} cy={m * 0.04} r={m * 0.006} fill="#443b52" />
          </pattern>
          <radialGradient id={`gl${uid}`}>
            <stop offset="0" stopColor="#ffd88a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd88a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={w} height={h} fill={`url(#wp${uid})`} />
        {/* skirting board and a floor shadow so the wall reads as a room */}
        <rect y={h * 0.9} width={w} height={h * 0.1} fill="#1b1720" />
        <rect y={h * 0.9} width={w} height={m * 0.01} fill="#3d3446" />
        <text x={w / 2} y={h * 0.53} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={m * 0.14} fill="#d9cfe6" letterSpacing={-m * 0.003}>
          Who's there?
        </text>
        <text x={w / 2} y={h * 0.53 + m * 0.07} textAnchor="middle" fontFamily="'JetBrains Mono Variable', monospace" fontSize={m * 0.03} fill="#9d90b0">
          three things are hiding in this room
        </text>
        {ITEMS.map((it, i) => {
          const g = s.found[i].x;
          return (
            <g key={i} transform={`translate(${it.x * w} ${it.y * h}) scale(${1 + g * 0.15})`}>
              <circle r={is * 1.1} fill={`url(#gl${uid})`} opacity={0.3 + clamp(g) * 0.7} />
              <Icon kind={it.kind} s={is} glow={clamp(g)} />
              <text y={is * 0.85} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontWeight={600} fontSize={m * 0.028} fill="#f6d58a" opacity={0.5 + clamp(g) * 0.5}>
                {it.label}
              </text>
            </g>
          );
        })}
      </svg>
      {/* the darkness, with a soft hole where the beam lands */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,3,6,1)', WebkitMaskImage: mask, maskImage: mask, pointerEvents: 'none' }} />
      {/* warm light colour + a hot core */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          mixBlendMode: 'soft-light',
          background: `radial-gradient(circle ${R * 0.9}px at ${bx}px ${by}px, rgba(255,214,150,${0.9 * bright}) 0%, rgba(255,190,120,0.3) 50%, transparent 100%)`,
        }}
      />
      {/* dust only shows inside the light */}
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden>
        {s.dust.map((p, i) => {
          const x = p.x * w;
          const y = p.y * h;
          const d = Math.hypot(x - bx, y - by) / R;
          const o = clamp(1 - d) * (0.25 + p.z * 0.55) * bright;
          return o > 0.01 ? <circle key={i} cx={x} cy={y} r={m * (0.0018 + p.z * 0.003)} fill="#fff1d6" opacity={o} /> : null;
        })}
        {/* found markers glow through the dark once discovered */}
        {ITEMS.map((it, i) =>
          s.isFound[i] ? <circle key={i} cx={it.x * w} cy={it.y * h} r={m * 0.008} fill="#ffd88a" opacity={0.85} style={{ filter: `drop-shadow(0 0 ${m * 0.015}px #ffb84a)` }} /> : null,
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: m * 0.04,
          bottom: m * 0.035,
          fontFamily: "'JetBrains Mono Variable', monospace",
          fontSize: Math.max(10, m * 0.028),
          color: nFound === 3 ? '#ffd88a' : '#6f6680',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
        }}
      >
        {nFound === 3 ? 'all found ✦' : `${nFound} / 3 found`}
      </div>
    </Stage>
  );
}
