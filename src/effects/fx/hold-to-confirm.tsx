import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, approach, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * Hold to confirm. Holding charges a ring around the button: sparks get sucked in, the glow
 * builds and the button trembles under the strain. At 100 % it bursts — a shockwave, a spray
 * of sparks and the icon flips to a check. Letting go early drains the ring on a spring.
 */

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  out: boolean; // burst spark (true) or charging mote (false)
}

interface S {
  prog: number;
  holding: boolean;
  done: number; // seconds since completion (-1 = not done)
  sq: Spring; // press squish
  pop: Spring; // completion scale kick
  parts: P[];
  spawn: number;
  idle: number;
  demo: number;
  t: number;
  lastTick: number;
}

const HOLD = 1.5; // seconds to fill

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const R = Math.min(m * 0.2, 170);
  return { cx: w / 2, cy: h / 2 - m * 0.04, R, m };
}

export const sim = defineSim<S>({
  init: () => ({ prog: 0, holding: false, done: -1, sq: sp(), pop: sp(), parts: [], spawn: 0, idle: 0, demo: 0, t: 0, lastTick: 0 }),
  step(s, f) {
    const { cx, cy, R } = geom(f.w, f.h);
    const dt = f.dt;
    s.t += dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;
    const onBtn = Math.hypot(f.p.x - cx, f.p.y - cy) < R * 1.15;
    if (f.pressed && onBtn && s.done < 0) {
      s.holding = true;
      f.emit({ name: 'click', gain: 0.5 });
    }
    if (!f.p.down) s.holding = false;

    // self-demo: hold for the full charge every 4 s
    let demoHold = false;
    if (s.idle > 2.2 && !f.p.down) {
      s.demo += dt;
      demoHold = s.demo % 4 < HOLD + 0.2 && s.done < 0;
    } else s.demo = 0;
    const hold = (s.holding || demoHold) && s.done < 0;

    if (s.done < 0) {
      if (hold) s.prog = Math.min(1, s.prog + dt / HOLD);
      else s.prog = approach(s.prog, 0, 5, dt); // drains back
      // rising ticks while charging
      const q = Math.floor(s.prog * 10);
      if (hold && q > s.lastTick) f.emit({ name: 'tick', gain: 0.25 + s.prog * 0.3, rate: 0.8 + s.prog * 0.8 });
      s.lastTick = hold ? q : Math.floor(s.prog * 10);
      if (s.prog >= 1) {
        s.done = 0;
        s.holding = false;
        s.pop.v += 9;
        f.emit({ name: 'success', gain: 0.9 });
        f.emit({ name: 'spark', gain: 0.6 });
        const n = f.reduced ? 18 : 46;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + f.rand() * 0.2;
          const v = R * (2.2 + f.rand() * 3.2);
          s.parts.push({ x: cx + Math.cos(a) * R * 1.2, y: cy + Math.sin(a) * R * 1.2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 0.6 + f.rand() * 0.6, out: true });
        }
      }
    } else {
      s.done += dt;
      if (s.done > 2.2) {
        s.done = -1;
        s.prog = 0;
        s.lastTick = 0;
        s.demo = 0;
      }
    }

    // charging motes stream inward toward the ring
    if (hold) {
      s.spawn += dt * (14 + s.prog * 50);
      while (s.spawn > 1) {
        s.spawn--;
        const a = f.rand() * Math.PI * 2;
        const d = R * (2.2 + f.rand() * 1.4);
        s.parts.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, vx: 0, vy: 0, life: 0, max: 0.7, out: false });
      }
    }
    for (const p of s.parts) {
      p.life += dt;
      if (p.out) {
        p.vx *= Math.exp(-3 * dt);
        p.vy = p.vy * Math.exp(-3 * dt) + R * 1.5 * dt; // a little gravity
      } else {
        // pulled toward the ring, accelerating
        const dx = cx - p.x;
        const dy = cy - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const pull = R * 9;
        p.vx += (dx / d) * pull * dt;
        p.vy += (dy / d) * pull * dt;
        if (d < R * 1.12) p.life = p.max;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    s.parts = s.parts.filter((p) => p.life < p.max);
    spring(s.sq, hold ? 1 : 0, 300, 18, dt);
    spring(s.pop, 0, 260, 9, dt);
  },
});

export default function HoldToConfirm() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const { cx, cy, R, m } = geom(w, h);
  const p = smooth(s.prog);
  const done = s.done >= 0;
  const dn = done ? s.done : 0;
  // strain: a fine tremble that grows near the end
  const tr = done ? 0 : Math.pow(s.prog, 3) * R * 0.025;
  const jx = Math.sin(t * 91) * tr;
  const jy = Math.cos(t * 77) * tr;
  const scale = 1 - s.sq.x * 0.06 + s.pop.x * 0.02;
  const rr = R * 1.22; // ring radius
  const circ = 2 * Math.PI * rr;
  const glow = done ? Math.max(0, 1 - dn * 1.2) : p;
  const font = "'Archivo Variable', Archivo, system-ui, sans-serif";
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const checkLen = R * 1.1;
  const ck = done ? smooth(dn / 0.35) : 0;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(100% 80% at 50% 40%, #1d1420 0%, #0e0a11 60%, #060407 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`ring${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb347" />
            <stop offset="0.5" stopColor="#ff4f7b" />
            <stop offset="1" stopColor="#b44bff" />
          </linearGradient>
          <radialGradient id={`btn${uid}`} cx="40%" cy="30%" r="80%">
            <stop offset="0" stopColor={done ? '#5cf2a8' : '#3a2a3f'} />
            <stop offset="1" stopColor={done ? '#109a5c' : '#1a1220'} />
          </radialGradient>
          <radialGradient id={`aura${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0.45" stopColor={done ? '#3dffa0' : '#ff4f7b'} stopOpacity="0.6" />
            <stop offset="1" stopColor={done ? '#3dffa0' : '#ff4f7b'} stopOpacity="0" />
          </radialGradient>
          <filter id={`gl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={R * 0.08} />
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={R * 2.3} fill={`url(#aura${uid})`} opacity={glow * 0.55} />
        {/* the shockwave */}
        {done && dn < 0.7 && <circle cx={cx} cy={cy} r={rr + dn * R * 3.2} fill="none" stroke="#bfffe0" strokeWidth={R * 0.12 * (1 - dn / 0.7)} opacity={1 - dn / 0.7} />}
        {s.parts.map((q, i) => {
          const k = q.life / q.max;
          if (q.out) {
            const len = Math.hypot(q.vx, q.vy) * 0.06;
            const a = Math.atan2(q.vy, q.vx);
            return <line key={i} x1={q.x} y1={q.y} x2={q.x - Math.cos(a) * len} y2={q.y - Math.sin(a) * len} stroke={i % 3 ? '#9dffcf' : '#ffe08a'} strokeWidth={R * 0.05} strokeLinecap="round" opacity={1 - k} />;
          }
          return <circle key={i} cx={q.x} cy={q.y} r={R * 0.022} fill="#ffb3c6" opacity={Math.min(1, k * 4) * 0.85} />;
        })}
        <g transform={`translate(${cx + jx} ${cy + jy})`}>
          {/* track and charge ring */}
          <circle r={rr} fill="none" stroke="#fff" strokeOpacity={0.08} strokeWidth={R * 0.1} />
          <circle r={rr} fill="none" stroke={done ? '#3dffa0' : `url(#ring${uid})`} strokeWidth={R * 0.1} strokeLinecap="round" strokeDasharray={`${circ * (done ? 1 : p)} ${circ}`} transform="rotate(-90)" filter={`url(#gl${uid})`} opacity={0.9 * (0.4 + glow * 0.6)} />
          <circle r={rr} fill="none" stroke={done ? '#3dffa0' : `url(#ring${uid})`} strokeWidth={R * 0.1} strokeLinecap="round" strokeDasharray={`${circ * (done ? 1 : p)} ${circ}`} transform="rotate(-90)" />
          {/* the leading spark of the ring */}
          {!done && p > 0.01 && <circle cx={Math.sin(p * Math.PI * 2) * rr} cy={-Math.cos(p * Math.PI * 2) * rr} r={R * 0.09} fill="#fff" opacity={0.9} filter={`url(#gl${uid})`} />}
          <g transform={`scale(${scale})`}>
            <circle r={R} cy={R * 0.06} fill="#000" opacity={0.5} filter={`url(#gl${uid})`} />
            <circle r={R} fill={`url(#btn${uid})`} />
            <circle r={R * 0.97} fill="none" stroke="#fff" strokeOpacity={0.12} strokeWidth={1.5} />
            <ellipse cx={-R * 0.2} cy={-R * 0.52} rx={R * 0.55} ry={R * 0.25} fill="#fff" opacity={0.1} />
            {/* inner heat as the charge builds */}
            {!done && <circle r={R * 0.9} fill="#ff4f7b" opacity={p * 0.25} filter={`url(#gl${uid})`} />}
            {done ? (
              <path
                d={`M${-R * 0.38} ${R * 0.02} L${-R * 0.1} ${R * 0.3} L${R * 0.42} ${-R * 0.28}`}
                fill="none"
                stroke="#fff"
                strokeWidth={R * 0.13}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${checkLen * ck} ${checkLen}`}
              />
            ) : (
              /* a trash icon that lifts its lid as the charge builds */
              <g stroke="#f4e9f6" strokeWidth={R * 0.07} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.92}>
                <g transform={`rotate(${-p * 22} ${R * 0.3} ${-R * 0.22}) translate(0 ${-p * R * 0.06})`}>
                  <path d={`M${-R * 0.34} ${-R * 0.22} H${R * 0.34} M${-R * 0.1} ${-R * 0.22} V${-R * 0.32} H${R * 0.1} V${-R * 0.22}`} />
                </g>
                <path d={`M${-R * 0.26} ${-R * 0.1} L${-R * 0.2} ${R * 0.36} H${R * 0.2} L${R * 0.26} ${-R * 0.1}`} />
                <path d={`M${-R * 0.07} ${R * 0.0} V${R * 0.24} M${R * 0.07} ${R * 0.0} V${R * 0.24}`} strokeWidth={R * 0.05} />
              </g>
            )}
          </g>
        </g>
        <text x={cx} y={cy + rr + m * 0.11} textAnchor="middle" fontFamily={done ? font : ui} fontWeight={done ? 800 : 600} fontSize={Math.max(12, R * 0.17)} letterSpacing={done ? R * 0.01 : R * 0.02} fill={done ? '#7dffbf' : '#e9dcec'} opacity={done ? 1 : 0.7 + p * 0.3}>
          {done ? 'Deleted' : s.prog > 0.02 ? `Keep holding… ${Math.round(s.prog * 100)}%` : 'Hold to delete'}
        </text>
      </svg>
      <button
        type="button"
        aria-label="Hold to delete"
        style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2, opacity: 0, borderRadius: '50%' }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
