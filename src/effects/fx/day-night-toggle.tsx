import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A day / night switch. The sun rolls across and turns into a moon, the clouds sink away and
 * the stars drop in — and the whole scene behind the switch goes from noon to midnight.
 */

interface S {
  night: boolean;
  pos: Spring; // 0 day … 1 night
  press: Spring;
  drag: boolean;
  dragFrom: number;
  moved: boolean;
  idle: number;
  t: number;
}

function geom(w: number, h: number) {
  const W = Math.min(w * 0.72, h * 1.5, 620);
  const H = W * 0.38;
  return { W, H, x: (w - W) / 2, y: (h - H) / 2, r: H * 0.4 };
}

export const sim = defineSim<S>({
  init: () => ({ night: false, pos: sp(0), press: sp(0), drag: false, dragFrom: 0, moved: false, idle: 0, t: 0 }),
  step(s, f) {
    const g = geom(f.w, f.h);
    s.t += f.dt;
    const inside = f.p.x > g.x - 10 && f.p.x < g.x + g.W + 10 && f.p.y > g.y - 10 && f.p.y < g.y + g.H + 10;
    const toggle = (to: boolean) => {
      if (to === s.night) return;
      s.night = to;
      f.emit({ name: 'switch', gain: 0.7, rate: to ? 0.92 : 1.05 });
      f.emit({ name: 'whoosh', gain: 0.3, rate: to ? 0.8 : 1.2 });
    };
    if (f.pressed && inside) {
      s.drag = true;
      s.dragFrom = f.p.x;
      s.moved = false;
      s.idle = 0;
    }
    if (s.drag) {
      // the knob can be dragged; it follows the finger with a little resistance
      const span = g.W - g.H;
      const k = clamp((f.p.x - g.x - g.H / 2) / span);
      if (Math.abs(f.p.x - s.dragFrom) > 6) s.moved = true;
      if (s.moved) s.pos.x = lerp(s.pos.x, k, 0.35);
      if (!f.p.down) {
        s.drag = false;
        if (s.moved) toggle(s.pos.x > 0.5);
        else toggle(!s.night);
      }
    }
    for (const a of f.actions) if (a.type === 'toggle') toggle(!s.night);
    s.idle += f.dt;
    if (f.live && s.idle > 3.2) {
      s.idle = 0;
      toggle(!s.night);
    }
    if (!s.drag || !s.moved) spring(s.pos, s.night ? 1 : 0, 170, 15, f.dt);
    spring(s.press, s.drag ? 1 : 0, 400, 22, f.dt);
  },
});

const STARS: [number, number, number][] = [
  [0.12, 0.28, 1],
  [0.22, 0.62, 0.7],
  [0.3, 0.3, 0.55],
  [0.38, 0.7, 0.9],
  [0.46, 0.22, 0.6],
  [0.18, 0.45, 0.45],
  [0.52, 0.52, 0.5],
];

export default function DayNightToggle() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const g = geom(w, h);
  const p = clamp(s.pos.x, -0.1, 1.1);
  const q = clamp(p);
  const v = s.pos.v;
  const { W, H, r } = g;
  const kx = H / 2 + p * (W - H);
  const ky = H / 2;
  // squash and stretch along the travel, a little flatter when pressed
  const stretch = clamp(Math.abs(v) * 0.04, 0, 0.15);
  const sx = 1 + stretch + s.press.x * 0.06;
  const sy = 1 - stretch * 0.6 - s.press.x * 0.04;
  const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((c, i) => Math.round(lerp(c, b[i], k))).join(',')})`;
  const pillBg = mix([61, 143, 224], [27, 31, 59], q);
  const skyTop = mix([118, 182, 255], [8, 10, 28], q);
  const skyBot = mix([226, 240, 255], [33, 30, 72], q);
  const sunCol = mix([255, 211, 61], [210, 216, 228], q);
  const sunCol2 = mix([255, 170, 30], [160, 170, 190], q);

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: `linear-gradient(180deg, ${skyTop}, ${skyBot})` }}>
      {/* the scene: big soft sun glow by day, stars and a moon glow by night */}
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <circle cx={w * 0.82} cy={h * 0.18} r={Math.min(w, h) * 0.32} fill={`url(#glow${uid})`} opacity={1 - q * 0.6} />
        {Array.from({ length: 60 }, (_, i) => {
          const a = Math.sin(i * 91.7) * 1000;
          const b = Math.sin(i * 47.3) * 1000;
          const x = (a - Math.floor(a)) * w;
          const y = (b - Math.floor(b)) * h * 0.85;
          const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + (i % 5) * 0.4) + i);
          return <circle key={i} cx={x} cy={y} r={0.6 + (i % 3) * 0.5} fill="#fff" opacity={q * (0.3 + tw * 0.7) * clamp((q - (i % 10) / 20) * 2)} />;
        })}
        <path d={`M0 ${h * 0.86} Q ${w * 0.25} ${h * 0.78} ${w * 0.5} ${h * 0.84} T ${w} ${h * 0.8} V ${h} H 0Z`} fill={mix([140, 200, 140], [20, 24, 50], q)} />
        <path d={`M0 ${h * 0.92} Q ${w * 0.3} ${h * 0.86} ${w * 0.6} ${h * 0.92} T ${w} ${h * 0.9} V ${h} H 0Z`} fill={mix([96, 170, 110], [14, 16, 36], q)} />
        <defs>
          <radialGradient id={`glow${uid}`}>
            <stop offset="0" stopColor={q < 0.5 ? '#fff6c8' : '#cfd8ff'} stopOpacity=".9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <svg width={W + 160} height={H + 200} viewBox={`-80 -80 ${W + 160} ${H + 200}`} style={{ position: 'absolute', left: g.x - 80, top: g.y - 80 }} aria-hidden>
        <defs>
          <clipPath id={`pill${uid}`}>
            <rect x={0} y={0} width={W} height={H} rx={H / 2} />
          </clipPath>
          <radialGradient id={`sun${uid}`} cx="38%" cy="34%" r="70%">
            <stop offset="0" stopColor="#fff9d6" />
            <stop offset="0.45" stopColor={sunCol} />
            <stop offset="1" stopColor={sunCol2} />
          </radialGradient>
          <linearGradient id={`inner${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity=".35" />
            <stop offset="0.25" stopColor="#000" stopOpacity="0" />
            <stop offset="0.85" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity=".18" />
          </linearGradient>
          <filter id={`ksh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx={H * 0.02} dy={H * 0.05} stdDeviation={H * 0.04} floodColor="#000" floodOpacity=".35" />
          </filter>
          <filter id={`drop${uid}`} x="-30%" y="-80%" width="160%" height="300%">
            <feDropShadow dx="0" dy={H * 0.1} stdDeviation={H * 0.12} floodColor="#000" floodOpacity=".35" />
          </filter>
        </defs>
        <rect x={0} y={0} width={W} height={H} rx={H / 2} fill={pillBg} filter={`url(#drop${uid})`} />
        <g clipPath={`url(#pill${uid})`}>
          {/* halo rings around the knob */}
          {[2.4, 1.95, 1.5].map((m, i) => (
            <circle key={m} cx={kx} cy={ky} r={r * m} fill="#fff" opacity={0.07 + i * 0.03} />
          ))}
          {/* stars drop in from above at night */}
          {STARS.map(([x, y, sz], i) => {
            const tw = 0.7 + 0.3 * Math.sin(t * 3 + i * 1.7);
            const yy = lerp(-H * 0.6, y * H, clamp(q * 1.4 - i * 0.05));
            const rr = H * 0.05 * sz * tw;
            return (
              <path
                key={i}
                d={`M${x * W} ${yy - rr}Q${x * W} ${yy} ${x * W + rr} ${yy}Q${x * W} ${yy} ${x * W} ${yy + rr}Q${x * W} ${yy} ${x * W - rr} ${yy}Q${x * W} ${yy} ${x * W} ${yy - rr}Z`}
                fill="#fff"
                opacity={q}
              />
            );
          })}
          {/* clouds sink away at night */}
          <g transform={`translate(0 ${q * H * 0.9})`} opacity={1 - q * 0.4}>
            {[
              [0.62, 0.95, 0.28],
              [0.74, 0.78, 0.26],
              [0.86, 0.66, 0.24],
              [0.97, 0.52, 0.26],
              [0.55, 1.05, 0.22],
            ].map(([x, y, rr], i) => (
              <circle key={'b' + i} cx={x * W + Math.sin(t * 0.8 + i) * 3} cy={y * H - H * 0.08} r={rr * H} fill="#cfe3fb" />
            ))}
            {[
              [0.66, 1.02, 0.26],
              [0.78, 0.86, 0.24],
              [0.9, 0.76, 0.24],
              [1.0, 0.64, 0.26],
            ].map(([x, y, rr], i) => (
              <circle key={'f' + i} cx={x * W + Math.sin(t * 0.9 + i * 2) * 2} cy={y * H + H * 0.02} r={rr * H} fill="#fff" />
            ))}
          </g>
          <rect x={0} y={0} width={W} height={H} fill={`url(#inner${uid})`} />
        </g>
        {/* the knob: sun → moon */}
        <g transform={`translate(${kx} ${ky}) scale(${sx} ${sy}) rotate(${q * 140})`} filter={`url(#ksh${uid})`}>
          <circle r={r} fill={`url(#sun${uid})`} />
          <g opacity={q}>
            <circle cx={-r * 0.32} cy={-r * 0.22} r={r * 0.22} fill="#9aa3b8" />
            <circle cx={r * 0.3} cy={r * 0.3} r={r * 0.15} fill="#9aa3b8" />
            <circle cx={r * 0.34} cy={-r * 0.36} r={r * 0.1} fill="#9aa3b8" />
            <circle cx={-r * 0.12} cy={r * 0.45} r={r * 0.07} fill="#9aa3b8" />
          </g>
          {/* rim light */}
          <circle r={r * 0.97} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={r * 0.04} strokeDasharray={`${r * 1.6} ${r * 10}`} transform="rotate(200)" />
        </g>
      </svg>
      <button
        type="button"
        role="switch"
        aria-checked={s.night}
        aria-label="Dark mode"
        onClick={() => fx.dispatch({ type: 'toggle' })}
        onPointerDown={(e) => e.preventDefault()}
        style={{ position: 'absolute', left: g.x, top: g.y, width: W, height: H, borderRadius: H, opacity: 0, pointerEvents: 'none' }}
      />
    </Stage>
  );
}
