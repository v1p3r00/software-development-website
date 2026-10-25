import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A slider strung like a rubber band. The thumb trails the finger on a spring and stretches
 * along its velocity; the value bubble above it swings like a flag on a stick; pulling the
 * thumb off the line bends the band, and letting go makes it twang.
 */

interface S {
  val: number; // target value 0..1
  pos: Spring; // thumb position 0..1
  bend: Spring; // band displacement at the thumb, px
  tilt: Spring; // bubble swing, radians
  grow: Spring; // thumb press scale
  drag: boolean;
  idle: number;
  next: number; // idle: time until the next phantom drag
  goal: number;
  lastStep: number; // last tick bucket for the tick sound
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const len = Math.min(w * 0.72, m * 1.25);
  return { m, len, x0: (w - len) / 2, cy: h * 0.56, R: m * 0.05 };
}

export const sim = defineSim<S>({
  init: () => ({ val: 0.32, pos: sp(0.32), bend: sp(), tilt: sp(), grow: sp(1), drag: false, idle: 0, next: 0.6, goal: 0.32, lastStep: 6 }),
  step(s, f) {
    const { m, len, x0, cy } = geom(f.w, f.h);
    for (const a of f.actions) if (a.type === 'set') {
      s.val = clamp(a.v as number);
      s.idle = 0;
    }
    const u = clamp((f.p.x - x0) / len);
    if (f.pressed && Math.abs(f.p.y - cy) < m * 0.22) {
      s.drag = true;
      f.emit({ name: 'click', gain: 0.4, rate: 1.2 });
    }
    let pull = 0;
    if (s.drag) {
      s.val = u;
      pull = clamp((f.p.y - cy) * 0.55, -m * 0.12, m * 0.12);
      s.idle = 0;
      if (!f.p.down) {
        s.drag = false;
        if (Math.abs(s.bend.x) > m * 0.03) f.emit({ name: 'boing', gain: clamp(Math.abs(s.bend.x) / (m * 0.1), 0.2, 0.8), rate: 1.3 });
      }
    } else {
      s.idle = Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
      if (s.idle > 1.6) {
        // self-demo: a phantom finger flicks the thumb to a new value, with a little tug
        s.next -= f.dt;
        if (s.next <= 0) {
          s.goal = s.val < 0.5 ? 0.62 + f.rand() * 0.33 : 0.05 + f.rand() * 0.33;
          s.next = 1.7;
        }
        s.val = approach(s.val, s.goal, 7, f.dt);
        pull = Math.sin(clamp((1.7 - s.next) / 0.5) * Math.PI) * -m * 0.05;
      }
    }
    const pv = s.pos.v;
    spring(s.pos, s.val, s.drag ? 260 : 170, f.reduced ? 40 : 15, f.dt);
    // the bubble swings opposite to the thumb's acceleration, plus a lean into the motion
    const acc = (s.pos.v - pv) / Math.max(f.dt, 1e-4);
    s.tilt.v += -acc * len * 0.000045 * f.dt * 60;
    spring(s.tilt, clamp(-s.pos.v * 0.9, -0.6, 0.6), 90, f.reduced ? 30 : 5, f.dt);
    spring(s.bend, pull, s.drag ? 400 : 220, s.drag ? 30 : f.reduced ? 30 : 4.5, f.dt);
    spring(s.grow, s.drag ? 1.22 : 1, 500, 16, f.dt);
    // a tick every 5 units
    const step = Math.round(s.pos.x * 20);
    if (step !== s.lastStep) {
      s.lastStep = step;
      f.emit({ name: 'tick', gain: 0.18, rate: 0.8 + s.pos.x * 0.8, pan: s.pos.x * 2 - 1 });
    }
  },
});

export default function ElasticSlider() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, len, x0, cy, R } = geom(w, h);
  const x1 = x0 + len;
  const pos = clamp(s.pos.x, -0.03, 1.03);
  const tx = x0 + pos * len;
  const ty = cy + s.bend.x;
  // stretch along the speed (volume kept: sy = 1/sqrt(sx))
  const speed = Math.abs(s.pos.v) * len;
  const sx = 1 + Math.min(0.6, speed / (m * 6));
  const sy = 1 / Math.sqrt(sx);
  const g = s.grow.x;
  const val = Math.round(clamp(s.pos.x) * 100);
  // the band: two smooth curves meeting at the thumb
  const a = Math.max(8, tx - x0);
  const b = Math.max(8, x1 - tx);
  const left = `M${x0},${cy} C${x0 + a * 0.55},${cy} ${tx - a * 0.35},${ty} ${tx},${ty}`;
  const right = `M${tx},${ty} C${tx + b * 0.35},${ty} ${x1 - b * 0.55},${cy} ${x1},${cy}`;
  const tw = m * 0.022;
  const bw = m * 0.2;
  const bh = m * 0.12;
  const lift = R * 1.15 * g + bh * 0.5 + m * 0.035;
  const ticks = 21;

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: '#0c0b14' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="50%" cy="40%" r="80%">
            <stop offset="0" stopColor="#221d3b" />
            <stop offset="0.55" stopColor="#120f22" />
            <stop offset="1" stopColor="#07060d" />
          </radialGradient>
          <linearGradient id={`fill${uid}`} gradientUnits="userSpaceOnUse" x1={x0} x2={x1} y1="0" y2="0">
            <stop offset="0" stopColor="#38e1ff" />
            <stop offset="0.55" stopColor="#7b5cff" />
            <stop offset="1" stopColor="#ff4fd8" />
          </linearGradient>
          <radialGradient id={`thumb${uid}`} cx="38%" cy="30%" r="75%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#e9e6ff" />
            <stop offset="1" stopColor="#a49dd6" />
          </radialGradient>
          <linearGradient id={`bub${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8d74ff" />
            <stop offset="1" stopColor="#5a3fe0" />
          </linearGradient>
          <filter id={`glow${uid}`} x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation={m * 0.018} />
          </filter>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.012} />
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        {/* ticks */}
        {Array.from({ length: ticks }, (_, i) => {
          const u = i / (ticks - 1);
          const on = u <= s.pos.x + 1e-3;
          const big = i % 5 === 0;
          return (
            <rect
              key={i}
              x={x0 + u * len - m * 0.002}
              y={cy + m * 0.09}
              width={m * 0.004}
              height={big ? m * 0.03 : m * 0.016}
              rx={m * 0.002}
              fill={on ? '#b9a8ff' : '#3a3557'}
              opacity={on ? 0.9 : 0.8}
            />
          );
        })}
        {[0, 50, 100].map((v) => (
          <text key={v} x={x0 + (v / 100) * len} y={cy + m * 0.16} textAnchor="middle" fontFamily="'JetBrains Mono Variable', monospace" fontSize={m * 0.028} fill="#6d6893">
            {v}
          </text>
        ))}
        {/* the band: groove, then the lit part with a glow */}
        <path d={right} stroke="#000" strokeOpacity="0.45" strokeWidth={tw * 1.5} fill="none" strokeLinecap="round" />
        <path d={left} stroke="#000" strokeOpacity="0.45" strokeWidth={tw * 1.5} fill="none" strokeLinecap="round" />
        <path d={right} stroke="#2a2645" strokeWidth={tw} fill="none" strokeLinecap="round" />
        <path d={left} stroke={`url(#fill${uid})`} strokeWidth={tw * 2.2} fill="none" strokeLinecap="round" opacity="0.55" filter={`url(#glow${uid})`} />
        <path d={left} stroke={`url(#fill${uid})`} strokeWidth={tw} fill="none" strokeLinecap="round" />
        <path d={left} stroke="#fff" strokeOpacity="0.35" strokeWidth={tw * 0.25} fill="none" strokeLinecap="round" transform={`translate(0 ${-tw * 0.22})`} />

        {/* value bubble on a short stalk, swinging about the thumb */}
        <g transform={`translate(${tx} ${ty}) rotate(${(clamp(s.tilt.x, -0.5, 0.5) * 180) / Math.PI})`}>
          <g transform={`translate(0 ${-lift}) scale(${0.85 + (g - 1) * 0.9})`}>
            <rect x={-bw / 2} y={-bh / 2 + m * 0.012} width={bw} height={bh} rx={bh * 0.32} fill="#000" opacity="0.4" filter={`url(#sh${uid})`} />
            <path
              d={`M${-bw / 2 + bh * 0.32},${-bh / 2} H${bw / 2 - bh * 0.32} Q${bw / 2},${-bh / 2} ${bw / 2},${-bh / 2 + bh * 0.32} V${bh / 2 - bh * 0.32} Q${bw / 2},${bh / 2} ${bw / 2 - bh * 0.32},${bh / 2} H${bh * 0.22} L0,${bh / 2 + bh * 0.24} L${-bh * 0.22},${bh / 2} H${-bw / 2 + bh * 0.32} Q${-bw / 2},${bh / 2} ${-bw / 2},${bh / 2 - bh * 0.32} V${-bh / 2 + bh * 0.32} Q${-bw / 2},${-bh / 2} ${-bw / 2 + bh * 0.32},${-bh / 2} Z`}
              fill={`url(#bub${uid})`}
            />
            <rect x={-bw / 2 + bh * 0.15} y={-bh / 2 + bh * 0.08} width={bw - bh * 0.3} height={bh * 0.3} rx={bh * 0.15} fill="#fff" opacity="0.14" />
            <text y={bh * 0.17} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={bh * 0.52} fill="#fff" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {val}
            </text>
          </g>
        </g>

        {/* contact shadow + thumb, stretched along its motion */}
        <ellipse cx={tx} cy={ty + R * 0.9} rx={R * sx * g} ry={R * 0.35} fill="#000" opacity="0.5" filter={`url(#sh${uid})`} />
        <g transform={`translate(${tx} ${ty}) scale(${sx * g} ${sy * g})`}>
          <circle r={R * 1.5} fill="#8d74ff" opacity={0.25 * (g - 1) * 4.5} filter={`url(#glow${uid})`} />
          <circle r={R} fill={`url(#thumb${uid})`} />
          <circle r={R * 0.38} fill="none" stroke="#7b5cff" strokeWidth={R * 0.14} opacity="0.9" />
          <ellipse cx={-R * 0.25} cy={-R * 0.45} rx={R * 0.45} ry={R * 0.22} fill="#fff" opacity="0.7" />
        </g>
      </svg>
      <input
        type="range"
        min={0}
        max={100}
        value={val}
        aria-label="Elastic slider"
        onChange={(e) => fx.dispatch({ type: 'set', v: +e.target.value / 100 })}
        style={{ position: 'absolute', left: x0, top: cy - R, width: len, height: R * 2, opacity: 0, pointerEvents: 'none' }}
      />
    </Stage>
  );
}
