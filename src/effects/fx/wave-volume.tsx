import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A volume slider drawn as a live waveform. Left of the thumb the signal plays: louder towards
 * the thumb and faster/taller as the volume rises; right of it the line rests flat. The speaker
 * radiates arcs by level, and tapping it mutes with a little collapse.
 */

const PTS = 180;

interface S {
  target: number;
  vol: Spring;
  drag: boolean;
  phase: number; // wave phase, advances faster when louder
  idle: number;
  auto: number;
  muted: boolean;
  saved: number;
  step: number;
  kick: Spring; // speaker cone pulse
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const spk = m * 0.11;
  const len = Math.min(w * 0.8, m * 1.4) - spk * 1.6;
  const x0 = (w - len) / 2 + spk * 0.8;
  return { m, len, x0, cy: h / 2, spk, A: Math.min(h * 0.3, m * 0.24) };
}

export const sim = defineSim<S>({
  init: () => ({ target: 0.55, vol: sp(0.55), drag: false, phase: 0, idle: 0, auto: 0, muted: false, saved: 0.55, step: 5, kick: sp() }),
  step(s, f) {
    const { len, x0, cy, spk, A } = geom(f.w, f.h);
    const onSpk = Math.hypot(f.p.x - (x0 - spk * 1.3), f.p.y - cy) < spk * 0.9;
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    let toggle = false;
    if (f.pressed) {
      if (onSpk) toggle = true;
      else if (Math.abs(f.p.y - cy) < A * 1.3 + 20) s.drag = true;
    }
    for (const a of f.actions) {
      if (a.type === 'mute') toggle = true;
      if (a.type === 'set') s.target = clamp(a.v as number);
    }
    if (toggle) {
      s.muted = !s.muted;
      if (s.muted) {
        s.saved = Math.max(0.15, s.target);
        s.target = 0;
      } else s.target = s.saved;
      f.emit({ name: 'click', gain: 0.5, rate: s.muted ? 0.8 : 1.2 });
    }
    if (s.drag) {
      s.target = clamp((f.p.x - x0) / len);
      s.muted = false;
      if (!f.p.down) s.drag = false;
    } else if (s.idle > 1.5) {
      // self-demo: someone rides the fader up into a swell and back down
      s.auto += f.dt;
      s.muted = false;
      s.target = 0.5 + 0.42 * Math.sin(s.auto * 1.6 - 0.4);
    }
    spring(s.vol, s.target, s.drag ? 400 : 140, f.reduced ? 40 : 17, f.dt);
    const v = clamp(s.vol.x);
    s.phase += f.dt * (2.5 + v * 7);
    const st = Math.round(v * 10);
    if (st !== s.step) {
      if (st > s.step) s.kick.v += 4;
      s.step = st;
      f.emit({ name: 'tick', gain: 0.15 + v * 0.3, rate: 0.7 + v * 0.8, pan: v * 1.6 - 0.8 });
    }
    // the cone throbs with the beat of the wave
    spring(s.kick, Math.max(0, Math.sin(s.phase * 0.5)) * v * 0.5, 300, 14, f.dt);
  },
});

export default function WaveVolume() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, len, x0, cy, spk, A } = geom(w, h);
  const v = clamp(s.vol.x);
  const tx = x0 + clamp(s.vol.x, -0.02, 1.02) * len;
  const k = (Math.PI * 2 * 3.2) / len;
  const wave = (x: number, layer: number) => {
    const ph = s.phase + layer * 1.1;
    return Math.sin(k * x - ph) * 0.62 + Math.sin(k * 2.3 * x - ph * 1.7 + layer) * 0.28 + Math.sin(k * 5.1 * x + ph * 2.2) * 0.1;
  };
  // envelope: swells towards the thumb, then dies out in a short tail
  const env = (x: number) => {
    const dx = x - (tx - x0);
    if (dx > 0) return Math.exp(-(dx * dx) / (len * len * 0.002));
    return Math.pow(clamp(x / Math.max(1, tx - x0)), 0.9);
  };
  const path = (layer: number, amp: number) => {
    let d = '';
    for (let i = 0; i <= PTS; i++) {
      const x = (i / PTS) * len;
      const y = cy + wave(x, layer) * env(x) * A * v * amp;
      d += `${i ? 'L' : 'M'}${(x0 + x).toFixed(1)},${y.toFixed(1)}`;
    }
    return d;
  };
  const ty = cy + wave(tx - x0, 0) * env(tx - x0) * A * v;
  const sx = x0 - spk * 1.3;
  const arcs = s.muted && v < 0.05 ? 0 : Math.ceil(v * 3 + 0.001);
  const cone = 1 + s.kick.x * 0.15;

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'pointer'} style={{ background: '#070b10' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="50%" cy="50%" r="80%">
            <stop offset="0" stopColor={`rgb(${Math.round(lerp(14, 30, v))},${Math.round(lerp(26, 40, v))},${Math.round(lerp(38, 60, v))})`} />
            <stop offset="0.6" stopColor="#0a1018" />
            <stop offset="1" stopColor="#040609" />
          </radialGradient>
          <linearGradient id={`wg${uid}`} gradientUnits="userSpaceOnUse" x1={x0} x2={x0 + len} y1="0" y2="0">
            <stop offset="0" stopColor="#21d4fd" />
            <stop offset="0.5" stopColor="#3cf0b4" />
            <stop offset="1" stopColor="#d6ff4a" />
          </linearGradient>
          <filter id={`glow${uid}`} x="-10%" y="-100%" width="120%" height="300%">
            <feGaussianBlur stdDeviation={m * 0.012} />
          </filter>
          <clipPath id={`lit${uid}`}>
            <rect x={0} y={0} width={tx} height={h} />
          </clipPath>
          <clipPath id={`dim${uid}`}>
            <rect x={tx} y={0} width={w} height={h} />
          </clipPath>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        {/* faint grid like a scope */}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={x0} x2={x0 + len} y1={cy + (i - 4) * A * 0.27} y2={cy + (i - 4) * A * 0.27} stroke="#9fd8ff" strokeOpacity={i === 4 ? 0.1 : 0.035} />
        ))}
        {/* dim resting line to the right of the thumb */}
        <path d={path(0, 1)} clipPath={`url(#dim${uid})`} stroke="#2a3a4a" strokeWidth={m * 0.006} fill="none" strokeLinecap="round" />
        <g clipPath={`url(#lit${uid})`}>
          <path d={path(0, 1)} stroke={`url(#wg${uid})`} strokeWidth={m * 0.02} fill="none" opacity={0.35 + v * 0.4} filter={`url(#glow${uid})`} />
          <path d={path(2, 0.55)} stroke={`url(#wg${uid})`} strokeWidth={m * 0.003} fill="none" opacity="0.45" />
          <path d={path(1, 0.8)} stroke={`url(#wg${uid})`} strokeWidth={m * 0.004} fill="none" opacity="0.6" />
          <path d={path(0, 1)} stroke={`url(#wg${uid})`} strokeWidth={m * 0.008} fill="none" strokeLinecap="round" />
        </g>
        {/* thumb rides the wave */}
        <circle cx={tx} cy={ty} r={m * 0.05 * (s.drag ? 1.3 : 1)} fill="#d6ff4a" opacity={0.25 + v * 0.3} filter={`url(#glow${uid})`} />
        <circle cx={tx} cy={ty} r={m * 0.024 * (s.drag ? 1.2 : 1)} fill="#f4ffe0" stroke="#0a1018" strokeWidth={m * 0.004} />
        {/* speaker */}
        <g transform={`translate(${sx} ${cy})`}>
          <g transform={`scale(${(spk / 24) * cone} ${spk / 24})`}>
            <path d="M-10,-4 L-4,-4 L4,-11 L4,11 L-4,4 L-10,4 Z" fill="#cfe9ff" stroke="#cfe9ff" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
          {[1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${spk * (0.22 + i * 0.16)},${-spk * (0.18 + i * 0.13)} A${spk * (0.25 + i * 0.2)},${spk * (0.25 + i * 0.2)} 0 0 1 ${spk * (0.22 + i * 0.16)},${spk * (0.18 + i * 0.13)}`}
              fill="none"
              stroke="#3cf0b4"
              strokeWidth={spk * 0.09}
              strokeLinecap="round"
              opacity={i <= arcs ? 0.9 : 0.12}
            />
          ))}
          {s.muted && <path d={`M${spk * 0.3},${-spk * 0.3} L${spk * 0.9},${spk * 0.3} M${spk * 0.9},${-spk * 0.3} L${spk * 0.3},${spk * 0.3}`} stroke="#ff5a6e" strokeWidth={spk * 0.1} strokeLinecap="round" />}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: x0, width: len, top: cy + A * 1.1, display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono Variable', monospace", fontSize: m * 0.03, color: '#5b7086' }}>
        <span>VOLUME</span>
        <span style={{ color: '#d6ff4a', fontSize: m * 0.05, fontWeight: 600 }}>{Math.round(v * 100)}%</span>
      </div>
      <button type="button" aria-label={s.muted ? 'Unmute' : 'Mute'} aria-pressed={s.muted} style={{ position: 'absolute', left: sx - spk * 0.8, top: cy - spk * 0.8, width: spk * 1.6, height: spk * 1.6, opacity: 0 }} onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          fx.dispatch({ type: 'mute' });
        }
      }} />
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(v * 100)}
        aria-label="Volume"
        onChange={(e) => fx.dispatch({ type: 'set', v: +e.target.value / 100 })}
        style={{ position: 'absolute', left: x0, top: cy - 10, width: len, height: 20, opacity: 0, pointerEvents: 'none' }}
      />
    </Stage>
  );
}
