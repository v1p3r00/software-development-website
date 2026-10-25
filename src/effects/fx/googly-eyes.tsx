import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Three little monsters with googly eyes. Each pupil is a loose disc inside a plastic dome:
 * gravity pulls it down, curiosity pulls it toward the cursor, and it bounces off the rim.
 * Press to make the nearest monster hop — the pupils rattle around when it lands.
 */

const MON = [
  { hue: '#8f5bff', dark: '#4a1fb0', eyes: [[-0.32, -0.18, 0.3], [0.3, -0.2, 0.24]] },
  { hue: '#ff8a3d', dark: '#b4440c', eyes: [[0, -0.22, 0.38]] },
  { hue: '#21c7a8', dark: '#0b7a66', eyes: [[-0.36, -0.12, 0.2], [0.02, -0.3, 0.26], [0.38, -0.1, 0.18]] },
] as const;

interface Eye {
  x: number; // pupil offset from the eye centre, in eye radii
  y: number;
  vx: number;
  vy: number;
}
interface Mon {
  hop: Spring; // vertical offset in body radii (negative = up)
  sq: Spring; // squash
  eyes: Eye[];
  blink: number;
  air: boolean;
}
interface S {
  mons: Mon[];
  idle: number;
  t: number;
  nextHop: number;
  nextBlink: number;
}

function layout(w: number, h: number) {
  const row = w >= h;
  const m = Math.min(w, h);
  const R = row ? Math.min(m * 0.2, w * 0.13) : Math.min(m * 0.26, h * 0.12);
  return MON.map((_, i) => {
    const k = i - 1;
    return row ? { cx: w / 2 + k * R * 2.6, cy: h * 0.56, R: R * (i === 1 ? 1.15 : 1) } : { cx: w / 2 + (i === 1 ? R * 0.35 : -R * 0.2), cy: h / 2 + k * R * 2.5, R: R * (i === 1 ? 1.15 : 1) };
  });
}

export const sim = defineSim<S>({
  init: () => ({
    mons: MON.map((m) => ({ hop: sp(), sq: sp(), eyes: m.eyes.map(() => ({ x: 0, y: 0.3, vx: 0, vy: 0 })), blink: 0, air: false })),
    idle: 2,
    t: 0,
    nextHop: 1.2,
    nextBlink: 1.5,
  }),
  step(s, f) {
    const { w, h, dt } = f;
    if (dt <= 0) return;
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    const L = layout(w, h);
    const auto = s.idle > 2.5;
    let tx = f.p.x;
    let ty = f.p.y;
    if (auto) {
      tx = w / 2 + Math.sin(s.t * 0.8) * w * 0.42;
      ty = h * 0.35 + Math.sin(s.t * 1.3) * h * 0.3;
    }
    const hop = (i: number) => {
      const mo = s.mons[i];
      if (mo.air) return;
      mo.hop.v -= 7;
      mo.sq.v -= 6;
      mo.air = true;
      f.emit({ name: 'boing', gain: 0.5, rate: 1.1 - i * 0.12, pan: (L[i].cx / w) * 2 - 1 });
    };
    if (f.pressed) {
      let best = 0;
      let bd = Infinity;
      L.forEach((l, i) => {
        const d = Math.hypot(l.cx - f.p.x, l.cy - f.p.y) / l.R;
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      hop(best);
    }
    if (auto) {
      s.nextHop -= dt;
      if (s.nextHop <= 0) {
        s.nextHop = 0.9 + f.rand() * 1.2;
        hop(Math.floor(f.rand() * 3));
      }
    }
    s.nextBlink -= dt;
    if (s.nextBlink <= 0) {
      s.nextBlink = 1.5 + f.rand() * 2.5;
      s.mons[Math.floor(f.rand() * 3)].blink = 1;
    }
    s.mons.forEach((mo, i) => {
      const l = L[i];
      // the hop: a ballistic arc with a springy landing
      const prevV = mo.hop.v;
      if (mo.air) {
        mo.hop.v += 22 * dt;
        mo.hop.x += mo.hop.v * dt;
        if (mo.hop.x >= 0 && mo.hop.v > 0) {
          mo.air = false;
          mo.hop.x = 0;
          mo.sq.v += mo.hop.v * 1.1;
          mo.hop.v = 0;
          f.emit({ name: 'thud', gain: 0.4, rate: 1.2 - i * 0.1 });
        }
      } else spring(mo.hop, 0, 300, 20, dt);
      spring(mo.sq, 0, 260, f.reduced ? 30 : 9, dt);
      // the eye's own acceleration (in eye radii/s²) pushes the pupil the other way
      const bodyAcc = (mo.hop.v - prevV) / dt;
      mo.blink = Math.max(0, mo.blink - dt * 5);
      MON[i].eyes.forEach(([ex, ey, er], j) => {
        const e = mo.eyes[j];
        const R = l.R * er;
        const cx = l.cx + ex * l.R;
        const cy = l.cy + ey * l.R + mo.hop.x * l.R;
        const dx = tx - cx;
        const dy = ty - cy;
        const d = Math.hypot(dx, dy) || 1;
        const lim = 0.48; // pupil can travel 48% of the eye radius
        const look = Math.min(1, d / (R * 3));
        const gx = (dx / d) * lim * look;
        const gy = (dy / d) * lim * look;
        // gravity + a soft pull toward the gaze + air drag
        const ax = (gx - e.x) * 40 - e.vx * 2.2;
        const ay = (gy - e.y) * 40 - e.vy * 2.2 + 9 - bodyAcc * (l.R / R) * 0.12;
        e.vx += ax * dt;
        e.vy += ay * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        const r = Math.hypot(e.x, e.y);
        if (r > lim) {
          // bounce off the rim
          const nx = e.x / r;
          const ny = e.y / r;
          e.x = nx * lim;
          e.y = ny * lim;
          const vn = e.vx * nx + e.vy * ny;
          if (vn > 0) {
            e.vx -= 1.55 * vn * nx;
            e.vy -= 1.55 * vn * ny;
            if (vn > 3.5) f.emit({ name: 'tick', gain: clamp(vn / 12, 0.1, 0.5), rate: 1.5 + er });
          }
        }
      });
    });
  },
});

export default function GooglyEyes() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const L = layout(w, h);
  const m = Math.min(w, h);
  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(120% 90% at 50% 10%, #fff3d9 0%, #ffd9a8 55%, #f2b27a 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          {MON.map((mo, i) => (
            <radialGradient key={i} id={`b${i}${uid}`} cx="38%" cy="30%" r="80%">
              <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
              <stop offset="0.25" stopColor={mo.hue} />
              <stop offset="1" stopColor={mo.dark} />
            </radialGradient>
          ))}
          <radialGradient id={`w${uid}`} cx="45%" cy="40%" r="60%">
            <stop offset="0.7" stopColor="#fff" />
            <stop offset="1" stopColor="#d9dbe6" />
          </radialGradient>
          <radialGradient id={`dome${uid}`} cx="35%" cy="28%" r="45%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.02} />
          </filter>
        </defs>
        {L.map((l, i) => {
          const mo = s.mons[i];
          const air = -mo.hop.x; // height in body radii
          const sq = clamp(mo.sq.x * 0.05, -0.25, 0.25);
          // squash & stretch around the feet
          const sx = 1 + sq;
          const sy = 1 - sq;
          const by = l.cy + mo.hop.x * l.R;
          const sh = clamp(1 - air * 0.4, 0.3, 1);
          return (
            <g key={i}>
              {/* contact shadow shrinks as the monster leaves the ground */}
              <ellipse cx={l.cx} cy={l.cy + l.R * 0.98} rx={l.R * 0.85 * sh} ry={l.R * 0.14 * sh} fill="#7a3a10" opacity={0.35 * sh} filter={`url(#sh${uid})`} />
              <g transform={`translate(${l.cx} ${by + l.R}) scale(${sx} ${sy}) translate(0 ${-l.R})`}>
                <path
                  d={`M${-l.R} ${l.R * 0.1}C${-l.R} ${-l.R * 1.05} ${l.R} ${-l.R * 1.05} ${l.R} ${l.R * 0.1}C${l.R} ${l.R * 0.75} ${l.R * 0.6} ${l.R} 0 ${l.R}C${-l.R * 0.6} ${l.R} ${-l.R} ${l.R * 0.75} ${-l.R} ${l.R * 0.1}Z`}
                  fill={`url(#b${i}${uid})`}
                />
                {/* little feet */}
                <ellipse cx={-l.R * 0.4} cy={l.R * 0.96} rx={l.R * 0.2} ry={l.R * 0.09} fill={MON[i].dark} />
                <ellipse cx={l.R * 0.4} cy={l.R * 0.96} rx={l.R * 0.2} ry={l.R * 0.09} fill={MON[i].dark} />
                {/* mouth opens on the hop */}
                <path
                  d={`M${-l.R * 0.22} ${l.R * 0.38}Q0 ${l.R * (0.5 + clamp(air) * 0.25)} ${l.R * 0.22} ${l.R * 0.38}`}
                  fill={air > 0.05 ? '#3a0f1f' : 'none'}
                  stroke="#2a0a18"
                  strokeWidth={l.R * 0.05}
                  strokeLinecap="round"
                />
                {MON[i].eyes.map(([ex, ey, er], j) => {
                  const R = l.R * er;
                  const e = mo.eyes[j];
                  const cx = ex * l.R;
                  const cy = ey * l.R;
                  const lid = smoothBlink(mo.blink);
                  return (
                    <g key={j} transform={`translate(${cx} ${cy})`}>
                      <circle r={R * 1.08} fill="#1d0b2a" opacity={0.35} />
                      <circle r={R} fill={`url(#w${uid})`} />
                      <circle cx={e.x * R} cy={e.y * R} r={R * 0.5} fill="#121018" />
                      <circle cx={e.x * R - R * 0.14} cy={e.y * R - R * 0.16} r={R * 0.1} fill="#fff" opacity={0.7} />
                      {/* eyelid (body coloured) for blinks */}
                      {lid > 0.01 && <rect x={-R * 1.1} y={-R * 1.1} width={R * 2.2} height={R * 2.2 * lid} fill={MON[i].hue} />}
                      {/* the clear plastic dome */}
                      <circle r={R} fill={`url(#dome${uid})`} opacity={0.75} />
                      <circle r={R} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={R * 0.05} />
                    </g>
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>
      {L.map((l, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Make monster ${i + 1} hop`}
          style={{ position: 'absolute', left: l.cx - l.R, top: l.cy - l.R, width: l.R * 2, height: l.R * 2, opacity: 0, borderRadius: '50%', cursor: 'pointer' }}
        />
      ))}
    </Stage>
  );
}

function smoothBlink(b: number) {
  // 0→1→0 over the blink
  const x = 1 - Math.abs(b * 2 - 1);
  return b > 0 ? x * x * (3 - 2 * x) : 0;
}
