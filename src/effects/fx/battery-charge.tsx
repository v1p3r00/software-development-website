import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A glass battery charging up. Glowing electrolyte rises with a gently rippling surface while
 * bubbles stream up through it; the colour warms from red to green. At 100% the terminal
 * throws a shower of sparks and the whole cell flashes. Hold to fast-charge.
 */

interface Bub {
  x: number; // 0..1 across the cell
  y: number; // 0..1 from the bottom
  r: number;
  v: number;
  ph: number;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}
interface S {
  lvl: number;
  shown: Spring;
  full: number; // seconds since full (-1 = charging)
  flash: number;
  bubbles: Bub[];
  sparks: Spark[];
  turbo: number;
  t: number;
  pop: Spring; // scale kick on full
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  // taller in portrait, where there is room
  const bh = Math.min(h * 0.55, m * 0.75);
  const bw = bh * 0.6;
  return { m, cx: w / 2, cy: h * 0.45, bw, bh, x0: w / 2 - bw / 2, y0: h * 0.45 - bh / 2 };
}

const colorAt = (l: number): [number, number, number] =>
  l < 0.2 ? [255, 77, 77] : l < 0.5 ? [lerp(255, 255, (l - 0.2) / 0.3), lerp(77, 190, (l - 0.2) / 0.3), 60] : [lerp(255, 60, clamp((l - 0.5) / 0.3)), lerp(190, 230, clamp((l - 0.5) / 0.3)), lerp(60, 120, clamp((l - 0.5) / 0.3))];

export const sim = defineSim<S>({
  init: () => ({ lvl: 0.12, shown: sp(0.12), full: -1, flash: 0, bubbles: [], sparks: [], turbo: 0, t: 0, pop: sp(1) }),
  step(s, f) {
    const { w, h, dt } = f;
    if (dt <= 0) return;
    const g = geom(w, h);
    s.t += dt;
    s.turbo = approach(s.turbo, f.p.down ? 1 : 0, 6, dt);
    if (f.pressed) f.emit({ name: 'switch', gain: 0.45 });
    if (s.full < 0) {
      s.lvl = Math.min(1, s.lvl + dt * (0.17 + s.turbo * 0.45));
      if (s.lvl >= 1) {
        s.full = 0;
        s.flash = 1;
        s.pop.v += 4;
        f.emit({ name: 'zap', gain: 0.7 });
        f.emit({ name: 'success', gain: 0.4, rate: 1.2 });
        for (let i = 0; i < 46; i++) {
          const a = -Math.PI / 2 + (f.rand() - 0.5) * 2.4;
          const v = g.m * (0.6 + f.rand() * 1.4);
          s.sparks.push({ x: g.cx + (f.rand() - 0.5) * g.bw * 0.3, y: g.y0 - g.m * 0.04, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.4 + f.rand() * 0.5 });
        }
      }
    } else {
      s.full += dt;
      // after a moment the demo drains and charges again
      if (s.full > 2) s.lvl = Math.max(0.1, s.lvl - dt * 0.9);
      if (s.full > 2 && s.lvl <= 0.1) s.full = -1;
    }
    spring(s.shown, s.lvl, 70, 13, dt);
    spring(s.pop, 1, 260, f.reduced ? 30 : 9, dt);
    s.flash = approach(s.flash, 0, 4, dt);
    const rate = s.full < 0 ? 10 + s.turbo * 30 : 3;
    if (f.rand() < dt * rate)
      s.bubbles.push({ x: 0.1 + f.rand() * 0.8, y: 0, r: 0.012 + f.rand() * 0.025, v: 0.25 + f.rand() * 0.35 + s.turbo * 0.4, ph: f.rand() * 6 });
    for (const b of s.bubbles) {
      b.y += b.v * dt;
      b.x += Math.sin(s.t * 5 + b.ph) * dt * 0.05;
    }
    s.bubbles = s.bubbles.filter((b) => b.y < s.shown.x - 0.01);
    for (const p of s.sparks) {
      p.vy += g.m * 2.6 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    s.sparks = s.sparks.filter((p) => p.life > 0);
  },
});

export default function BatteryCharge() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const g = geom(w, h);
  const { m, bw, bh, x0, y0, cx } = g;
  const pad = m * 0.025;
  const ix = x0 + pad;
  const iw = bw - pad * 2;
  const iy = y0 + pad;
  const ih = bh - pad * 2;
  const lv = clamp(s.shown.x);
  const sy = iy + ih * (1 - lv);
  const [r, gg, b] = colorAt(lv);
  const col = `rgb(${r | 0},${gg | 0},${b | 0})`;
  const A = m * 0.006 * (1 + s.turbo * 1.5);
  const pts: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = ix + (iw * i) / 24;
    pts.push(`${x.toFixed(1)},${(sy + Math.sin(i * 0.6 + t * 4) * A + Math.sin(i * 1.3 - t * 6) * A * 0.5).toFixed(1)}`);
  }
  const liquid = `M${pts.join('L')}L${ix + iw},${iy + ih}L${ix},${iy + ih}Z`;
  const pct = Math.round(clamp(s.lvl) * 100);
  const pop = s.pop.x;
  const bolt = `M${cx + m * 0.02} ${g.cy - m * 0.11}L${cx - m * 0.06} ${g.cy + m * 0.015}H${cx - m * 0.005}L${cx - m * 0.02} ${g.cy + m * 0.11}L${cx + m * 0.06} ${g.cy - m * 0.015}H${cx + m * 0.005}Z`;
  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(100% 80% at 50% 40%, #182028 0%, #0c1116 60%, #05080a 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`lq${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={col} stopOpacity="0.75" />
            <stop offset="0.45" stopColor={col} />
            <stop offset="1" stopColor={col} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id={`gl${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="0.18" stopColor="#fff" stopOpacity="0.04" />
            <stop offset="0.8" stopColor="#fff" stopOpacity="0.02" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
          </linearGradient>
          <clipPath id={`c${uid}`}>
            <rect x={ix} y={iy} width={iw} height={ih} rx={m * 0.035} />
          </clipPath>
          <clipPath id={`lc${uid}`}>
            <path d={liquid} />
          </clipPath>
          <filter id={`bl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.04} />
          </filter>
        </defs>
        {/* the glow the charge throws on the table */}
        <ellipse cx={cx} cy={y0 + bh + m * 0.03} rx={bw * 0.9} ry={m * 0.05} fill={col} opacity={0.18 + lv * 0.25 + s.flash * 0.4} filter={`url(#bl${uid})`} />
        <g transform={`translate(${cx} ${g.cy}) scale(${pop}) translate(${-cx} ${-g.cy})`}>
          {/* terminal */}
          <rect x={cx - bw * 0.18} y={y0 - m * 0.045} width={bw * 0.36} height={m * 0.06} rx={m * 0.015} fill="#8b97a3" />
          <rect x={cx - bw * 0.18} y={y0 - m * 0.045} width={bw * 0.36} height={m * 0.018} rx={m * 0.009} fill="#d5dde4" />
          {/* casing */}
          <rect x={x0} y={y0} width={bw} height={bh} rx={m * 0.055} fill="#121a20" stroke="#4a5763" strokeWidth={m * 0.008} />
          <g clipPath={`url(#c${uid})`}>
            <rect x={ix} y={iy} width={iw} height={ih} fill="#0b1014" />
            <path d={liquid} fill={`url(#lq${uid})`} />
            <path d={liquid} fill={col} opacity={0.35} filter={`url(#bl${uid})`} />
            {/* the bright meniscus line */}
            <path d={`M${pts.join('L')}`} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={m * 0.006} />
            {s.bubbles.map((bb, i) => (
              <circle key={i} cx={ix + bb.x * iw} cy={iy + ih * (1 - bb.y)} r={bb.r * iw} fill="#fff" fillOpacity={0.12} stroke="#fff" strokeOpacity={0.55} strokeWidth={m * 0.003} />
            ))}
            {/* capacity marks */}
            {[0.25, 0.5, 0.75].map((k) => (
              <rect key={k} x={ix} y={iy + ih * (1 - k)} width={iw * 0.12} height={m * 0.004} fill="#fff" opacity={0.25} />
            ))}
            <rect x={ix} y={iy} width={iw} height={ih} fill="#fff" opacity={s.flash * 0.5} />
          </g>
          {/* the bolt: outline on dark glass, solid white inside the charge */}
          <path d={bolt} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={m * 0.006} strokeLinejoin="round" />
          <g clipPath={`url(#lc${uid})`}>
            <path d={bolt} fill="#fff" opacity={0.95} />
          </g>
          <rect x={x0} y={y0} width={bw} height={bh} rx={m * 0.055} fill={`url(#gl${uid})`} />
          <rect x={x0 + bw * 0.1} y={y0 + m * 0.03} width={bw * 0.08} height={bh * 0.75} rx={bw * 0.04} fill="#fff" opacity={0.08} />
        </g>
        {/* sparks: short streaks along their velocity */}
        {s.sparks.map((p, i) => (
          <line
            key={i}
            x1={p.x}
            y1={p.y}
            x2={p.x - p.vx * 0.03}
            y2={p.y - p.vy * 0.03}
            stroke={i % 3 ? '#fff6c2' : '#ffd23f'}
            strokeWidth={m * 0.006}
            strokeLinecap="round"
            opacity={clamp(p.life * 2.5)}
          />
        ))}
        <text x={cx} y={y0 + bh + m * 0.12} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={m * 0.075} fill={col}>
          {pct}%
        </text>
        <text x={cx} y={y0 + bh + m * 0.17} textAnchor="middle" fontFamily="'JetBrains Mono Variable', monospace" fontSize={Math.max(9, m * 0.026)} fill="#7d8b97" letterSpacing="0.12em">
          {s.full >= 0 ? 'FULLY CHARGED' : s.turbo > 0.5 ? 'FAST CHARGING ⚡' : 'CHARGING · HOLD TO BOOST'}
        </text>
      </svg>
      <button type="button" aria-label="Hold to fast-charge" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
    </Stage>
  );
}
