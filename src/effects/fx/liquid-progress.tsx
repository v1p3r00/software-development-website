import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A glass sphere that fills as it loads. The liquid surface is a tilted, travelling wave whose
 * tilt is a spring driven by the sphere's own acceleration — drag the sphere around and the
 * liquid sloshes the other way, overshoots and settles. Click to pour a little faster.
 */

interface Bub {
  x: number; // -1..1 of the radius
  y: number; // px below the surface
  r: number;
  v: number;
}
interface S {
  prog: number; // 0..1 loaded
  level: Spring; // displayed fill (lags the progress a little)
  tilt: Spring; // surface slope
  amp: Spring; // wave height
  ox: Spring; // sphere offset from home
  oy: Spring;
  grab: boolean;
  gx: number;
  gy: number;
  done: number; // seconds since full (-1 = loading)
  bubbles: Bub[];
  t: number;
  last25: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  return { m, cx: w / 2, cy: h * 0.47, R: m * 0.3 };
}

export const sim = defineSim<S>({
  init: () => ({ prog: 0.08, level: sp(0.08), tilt: sp(), amp: sp(0.4), ox: sp(), oy: sp(), grab: false, gx: 0, gy: 0, done: -1, bubbles: [], t: 0, last25: 0 }),
  step(s, f) {
    const { w, h, dt } = f;
    if (dt <= 0) return;
    const g = geom(w, h);
    s.t += dt;
    // loading: uneven speed, like a real download
    if (s.done < 0) {
      const speed = 0.11 + 0.08 * Math.sin(s.t * 1.7) + 0.05 * Math.sin(s.t * 4.1);
      s.prog = Math.min(1, s.prog + Math.max(0.02, speed) * dt);
      const q = Math.floor(s.prog * 4);
      if (q > s.last25 && q < 4) {
        s.last25 = q;
        f.emit({ name: 'drip', gain: 0.25, rate: 0.9 + q * 0.12 });
      }
      if (s.prog >= 1) {
        s.done = 0;
        s.amp.v += 2;
        f.emit({ name: 'success', gain: 0.55 });
      }
    } else {
      s.done += dt;
      if (s.done > 2.2 && s.prog > 0) {
        // drain and start again
        if (s.prog === 1) f.emit({ name: 'whoosh', gain: 0.4, rate: 0.8 });
        s.prog = Math.max(0, s.prog - dt * 1.4);
        if (s.prog <= 0) {
          s.done = -1;
          s.last25 = 0;
        }
      }
    }
    const inside = Math.hypot(f.p.x - g.cx - s.ox.x, f.p.y - g.cy - s.oy.x) < g.R;
    if (f.pressed && inside) {
      s.grab = true;
      s.gx = f.p.x - s.ox.x;
      s.gy = f.p.y - s.oy.x;
      if (s.done < 0) s.prog = Math.min(1, s.prog + 0.06);
      s.amp.v += 1.5;
      f.emit({ name: 'glass', gain: 0.45, rate: 1.1 });
    }
    if (!f.p.down) s.grab = false;
    // dragging moves the sphere on a leash; it springs home when let go
    let tx = s.grab ? clamp(f.p.x - s.gx, -g.R * 0.8, g.R * 0.8) : 0;
    let ty = s.grab ? clamp(f.p.y - s.gy, -g.R * 0.5, g.R * 0.5) : 0;
    if (!f.p.over && !f.p.down) {
      // idle life: a slow bob that keeps the liquid moving
      tx = Math.sin(s.t * 1.3) * g.R * 0.06;
      ty = Math.sin(s.t * 2.1) * g.R * 0.03;
    }
    const vx0 = s.ox.v;
    const vy0 = s.oy.v;
    spring(s.ox, tx, s.grab ? 400 : 120, s.grab ? 40 : 9, dt);
    spring(s.oy, ty, s.grab ? 400 : 120, s.grab ? 40 : 9, dt);
    const ax = (s.ox.v - vx0) / dt;
    const ay = (s.oy.v - vy0) / dt;
    // the liquid lags: sideways acceleration tilts the surface the other way
    s.tilt.v += (-ax / (g.R * 9)) * dt * 60;
    s.amp.v += Math.min(4, (Math.abs(ax) + Math.abs(ay)) / (g.R * 120)) * dt * 60;
    spring(s.tilt, 0, 60, f.reduced ? 20 : 3.2, dt);
    spring(s.amp, 0.35, 40, f.reduced ? 20 : 2.5, dt);
    s.tilt.x = clamp(s.tilt.x, -0.9, 0.9);
    spring(s.level, s.prog, 90, 14, dt);
    // bubbles rise from the bottom while it loads
    if (s.done < 0 && f.rand() < dt * 9) s.bubbles.push({ x: (f.rand() - 0.5) * 1.2, y: 0, r: 0.012 + f.rand() * 0.02, v: 0.3 + f.rand() * 0.4 });
    for (const b of s.bubbles) {
      b.y += b.v * dt;
      b.x += Math.sin(s.t * 4 + b.r * 300) * dt * 0.08;
    }
    s.bubbles = s.bubbles.filter((b) => b.y < 2.2 * Math.max(0.05, s.level.x));
  },
});

export default function LiquidProgress() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const g = geom(w, h);
  const R = g.R;
  const cx = g.cx + s.ox.x;
  const cy = g.cy + s.oy.x;
  const lv = clamp(s.level.x, 0, 1.02);
  const surfY = cy + R - lv * 2 * R; // level in px
  const A = R * 0.045 * s.amp.x;
  const pts: string[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const x = -R * 1.05 + (2.1 * R * i) / n;
    const y = surfY + s.tilt.x * x * 0.5 + A * Math.sin(x / (R * 0.28) + t * 3.2) + A * 0.6 * Math.sin(x / (R * 0.17) - t * 4.7);
    pts.push(`${(cx + x).toFixed(1)},${y.toFixed(1)}`);
  }
  const liquid = `M${pts.join('L')}L${cx + R * 1.05},${cy + R * 1.1}L${cx - R * 1.05},${cy + R * 1.1}Z`;
  const pct = Math.round(clamp(s.prog) * 100);
  const done = s.done >= 0;
  const fs = R * 0.42;
  const label = done ? 'Done' : `${pct}%`;
  return (
    <Stage fx={fx} cursor="grab" style={{ background: 'radial-gradient(110% 90% at 50% 30%, #1d2a44 0%, #0d1424 60%, #060a12 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <clipPath id={`c${uid}`}>
            <circle cx={cx} cy={cy} r={R * 0.96} />
          </clipPath>
          <clipPath id={`l${uid}`}>
            <path d={liquid} />
          </clipPath>
          <linearGradient id={`liq${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={done ? '#5dffb0' : '#4fd8ff'} />
            <stop offset="1" stopColor={done ? '#0a8a5a' : '#1b5cff'} />
          </linearGradient>
          <radialGradient id={`gl${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0.75" stopColor="#bfe6ff" stopOpacity="0.02" />
            <stop offset="0.96" stopColor="#bfe6ff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#e8f6ff" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id={`hi${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id={`b${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={R * 0.08} />
          </filter>
        </defs>
        {/* floor shadow + coloured light thrown by the liquid */}
        <ellipse cx={cx} cy={g.cy + R * 1.18} rx={R * 0.8} ry={R * 0.12} fill="#000" opacity={0.5} filter={`url(#b${uid})`} />
        <ellipse cx={cx} cy={g.cy + R * 1.18} rx={R * 0.6 * lv + 1} ry={R * 0.08} fill={done ? '#3dffa0' : '#3aa0ff'} opacity={0.35 * lv} filter={`url(#b${uid})`} />
        {/* back of the glass */}
        <circle cx={cx} cy={cy} r={R} fill="rgba(160,200,255,0.05)" />
        <g clipPath={`url(#c${uid})`}>
          <path d={liquid} fill={`url(#liq${uid})`} />
          {/* a lighter band right under the surface: light refracted through the meniscus */}
          <path d={`M${pts.join('L')}`} fill="none" stroke="#c9f3ff" strokeOpacity={0.7} strokeWidth={R * 0.02} />
          <path d={`M${pts.join('L')}`} fill="none" stroke="#fff" strokeOpacity={0.15} strokeWidth={R * 0.12} transform={`translate(0 ${R * 0.06})`} filter={`url(#b${uid})`} />
          {s.bubbles.map((b, i) => {
            const by = cy + R - b.y * R;
            return by > surfY ? <circle key={i} cx={cx + b.x * R} cy={by} r={b.r * R * 2} fill="none" stroke="#e6fbff" strokeOpacity={0.55} strokeWidth={R * 0.008} /> : null;
          })}
        </g>
        {/* the number: dark on glass, white inside the liquid */}
        <text x={cx} y={cy + fs * 0.35} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={fs} fill="#9fc3ff" opacity={0.85}>
          {label}
        </text>
        <g clipPath={`url(#l${uid})`}>
          <text x={cx} y={cy + fs * 0.35} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={fs} fill="#fff">
            {label}
          </text>
        </g>
        {/* the glass: rim, a window highlight and a small specular kick */}
        <circle cx={cx} cy={cy} r={R} fill={`url(#gl${uid})`} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#dff1ff" strokeOpacity={0.35} strokeWidth={R * 0.012} />
        <ellipse cx={cx - R * 0.38} cy={cy - R * 0.5} rx={R * 0.3} ry={R * 0.16} fill={`url(#hi${uid})`} transform={`rotate(-35 ${cx - R * 0.38} ${cy - R * 0.5})`} opacity={0.75} />
        <circle cx={cx + R * 0.55} cy={cy + R * 0.48} r={R * 0.05} fill={`url(#hi${uid})`} opacity={0.6} />
        <text x={g.cx} y={g.cy + R * 1.5} textAnchor="middle" fontFamily="'JetBrains Mono Variable', monospace" fontSize={Math.max(10, g.m * 0.028)} fill="#7f9cc7" letterSpacing="0.1em">
          {done ? 'COMPLETE' : 'LOADING ASSETS'}
        </text>
      </svg>
      <button
        type="button"
        aria-label="Loading progress — click to pour faster"
        style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2, opacity: 0, borderRadius: '50%', cursor: 'grab' }}
      />
    </Stage>
  );
}
