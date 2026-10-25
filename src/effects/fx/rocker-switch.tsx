import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A chunky illuminated rocker switch seen slightly from above. The rocker pivots in its bezel:
 * the pressed half sinks and catches the top light, the raised half shows its side wall and
 * throws a shadow on the plate. Turning it on warms the translucent cap up with a short flicker.
 */

interface S {
  tilt: Spring; // -1 = off (bottom pressed) .. +1 = on (top pressed)
  on: boolean;
  held: number; // which half the finger holds: +1 top, -1 bottom, 0 none
  lamp: number; // shown lamp brightness 0..1 (with flicker)
  glow: number; // smoothed lamp for the bloom
  flick: number; // seconds of flicker left
  jolt: Spring; // the plate jumps a hair on each snap
  idle: number;
  auto: number; // auto-demo press timer
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const W = m * 0.44;
  const H = m * 0.66;
  const cx = w / 2;
  const cy = h / 2 + H * 0.05;
  return { m, W, H, cx, cy, rw: W * 0.6, rh: H * 0.56, led: cy - H * 0.355 };
}

export const sim = defineSim<S>({
  init: () => ({ tilt: sp(-1), on: false, held: 0, lamp: 0, glow: 0, flick: 0, jolt: sp(), idle: 0, auto: 0 }),
  step(s, f) {
    const { cx, cy, rw, rh } = geom(f.w, f.h);
    const inRocker = Math.abs(f.p.x - cx) < rw * 0.75 && Math.abs(f.p.y - cy) < rh * 0.7;
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    if (f.pressed) {
      // press a half to push it in; a press anywhere else simply flips it
      s.held = inRocker ? (f.p.y < cy ? 1 : -1) : s.on ? -1 : 1;
      f.emit({ name: 'click', gain: 0.35, rate: 0.8 });
    }
    if (f.p.down && s.held && inRocker) s.held = f.p.y < cy ? 1 : -1; // rolling the thumb across
    for (const a of f.actions) if (a.type === 'toggle') s.auto = 0.16; // keyboard
    // idle: a phantom thumb presses the other half every couple of seconds
    if (s.idle > 1.2 && s.auto <= 0) {
      s.auto -= f.dt;
      if (s.auto < -1.8) s.auto = 0.2;
    } else if (s.idle <= 1.2 && s.auto < 0) s.auto = 0;
    if (s.auto > 0) {
      if (s.held === 0) s.held = s.on ? -1 : 1;
      s.auto -= f.dt;
      if (s.auto <= 0) s.held = 0;
    } else if (!f.p.down && s.held) s.held = 0;

    const target = s.held ? s.held * 1.14 : s.on ? 1 : -1;
    const prev = s.tilt.x;
    spring(s.tilt, target, s.held ? 700 : 520, f.reduced ? 48 : 17, f.dt);
    // the detent: crossing the middle snaps the state over
    if (prev < 0 && s.tilt.x >= 0 && !s.on) {
      s.on = true;
      s.flick = f.reduced ? 0 : 0.16;
      s.jolt.v += 60;
      f.emit({ name: 'switch', gain: 0.8, rate: 1.05 });
    } else if (prev > 0 && s.tilt.x <= 0 && s.on) {
      s.on = false;
      s.jolt.v -= 50;
      f.emit({ name: 'switch', gain: 0.7, rate: 0.9 });
    }
    spring(s.jolt, 0, 900, 30, f.dt);
    // lamp: an old filament-ish warm-up with a couple of stutters
    if (s.flick > 0) {
      s.flick -= f.dt;
      s.lamp = f.rand() < 0.5 ? 0.15 + f.rand() * 0.3 : 0.7 + f.rand() * 0.3;
    } else s.lamp = approach(s.lamp, s.on ? 1 : 0, s.on ? 14 : 9, f.dt);
    s.glow = approach(s.glow, s.lamp, 8, f.dt);
  },
});

/** one half of the rocker face: outer corners rounded, inner edge straight */
function half(x0: number, x1: number, yo: number, yi: number, r: number) {
  const d = yo < yi ? 1 : -1;
  return `M${x0},${yi} L${x0},${yo + r * d} Q${x0},${yo} ${x0 + r},${yo} L${x1 - r},${yo} Q${x1},${yo} ${x1},${yo + r * d} L${x1},${yi} Z`;
}

export default function RockerSwitch() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, W, H, cx, cy, rw, rh, led } = geom(w, h);
  const t = clamp(s.tilt.x, -1.2, 1.2);
  const L = s.lamp;
  const G = s.glow;
  // oblique view: things that stick out towards us slide down the screen by z*k
  const k = 0.6;
  const D = rh * 0.12;
  const Z0 = D * 0.95;
  const zt = Math.max(0, Z0 - t * D * 0.82);
  const zb = Math.max(0, Z0 + t * D * 0.82);
  const top = -rh / 2 + zt * k;
  const bot = rh / 2 + zb * k;
  const mid = Z0 * k;
  // a half facing up catches the light; facing down goes dark
  const slope = (Z0 - zt) / (rh / 2);
  const bT = clamp(0.5 + slope * 2.4, 0, 1);
  const bB = clamp(0.5 - slope * 2.4, 0, 1);
  const x0 = -rw / 2;
  const x1 = rw / 2;
  const rr = rw * 0.12;
  const jy = s.jolt.x * 0.02;
  const capOff = '#3b0e0b';
  const capOn = '#ff4a1c';
  const cap = (b: number) => {
    // translucent cap: lit from inside when on, lit by the room light otherwise
    const c0 = [46, 12, 12];
    const c1 = [255, 84, 36];
    const mix = clamp(L * 0.85 + b * 0.25);
    return `rgb(${c0.map((v, i) => Math.round(lerp(v, c1[i], mix))).join(',')})`;
  };

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#0b0a0d' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="50%" cy="42%" r="75%">
            <stop offset="0" stopColor="#24222a" />
            <stop offset="0.6" stopColor="#121116" />
            <stop offset="1" stopColor="#060608" />
          </radialGradient>
          <radialGradient id={`bloom${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff5a24" stopOpacity={0.42 * G} />
            <stop offset="0.45" stopColor="#ff3a10" stopOpacity={0.14 * G} />
            <stop offset="1" stopColor="#ff3a10" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`plate${uid}`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#3a3a42" />
            <stop offset="0.5" stopColor="#24242a" />
            <stop offset="1" stopColor="#18181c" />
          </linearGradient>
          <linearGradient id={`bevel${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.02" />
            <stop offset="1" stopColor="#000" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`hole${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#020203" />
            <stop offset="1" stopColor="#0e0d10" />
          </linearGradient>
          <linearGradient id={`wall${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={capOff} />
            <stop offset="1" stopColor={L > 0.5 ? '#c22a0c' : '#5a1810'} stopOpacity={0.7 + L * 0.3} />
          </linearGradient>
          <linearGradient id={`sheen${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.25" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.05" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`inner${uid}`} cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.75 * L} />
            <stop offset="0.6" stopColor="#ff7a3a" stopOpacity={0.25 * L} />
            <stop offset="1" stopColor="#ff7a3a" stopOpacity="0" />
          </radialGradient>
          <filter id={`blur${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.018} />
          </filter>
          <filter id={`soft${uid}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={m * 0.012} />
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        <ellipse cx={cx} cy={cy} rx={m * 0.75} ry={m * 0.75} fill={`url(#bloom${uid})`} />

        <g transform={`translate(${cx} ${jy})`}>
          {/* wall plate with a soft drop shadow and bevelled rim */}
          <rect x={-W / 2} y={cy - H / 2 + m * 0.03} width={W} height={H} rx={W * 0.12} fill="#000" opacity="0.6" filter={`url(#blur${uid})`} />
          <rect x={-W / 2} y={cy - H / 2} width={W} height={H} rx={W * 0.12} fill={`url(#plate${uid})`} />
          <rect x={-W / 2} y={cy - H / 2} width={W} height={H} rx={W * 0.12} fill="none" stroke={`url(#bevel${uid})`} strokeWidth={m * 0.006} />
          {/* screws */}
          {[-1, 1].map((d) => (
            <g key={d} transform={`translate(0 ${cy + d * H * 0.44})`}>
              <circle r={m * 0.014} fill="#141418" />
              <circle r={m * 0.012} fill="#4a4a52" />
              <line x1={-m * 0.008} y1={-m * 0.004} x2={m * 0.008} y2={m * 0.004} stroke="#1a1a1e" strokeWidth={m * 0.003} />
            </g>
          ))}
          {/* indicator LED */}
          <circle cy={led} r={m * 0.05} fill="#ff4a1c" opacity={0.5 * G} filter={`url(#soft${uid})`} />
          <circle cy={led} r={m * 0.014} fill="#0a0a0c" />
          <circle cy={led} r={m * 0.01} fill={L > 0.05 ? capOn : '#2a0e0a'} opacity={0.35 + L * 0.65} />
          <circle cx={-m * 0.003} cy={led - m * 0.003} r={m * 0.004} fill="#fff" opacity={0.25 + L * 0.6} />
          <text y={led + m * 0.006} x={m * 0.035} fontFamily="'Inter Variable', Inter, system-ui" fontSize={m * 0.022} fontWeight={600} letterSpacing={m * 0.004} fill="#8b8b96">
            POWER
          </text>

          <g transform={`translate(0 ${cy})`}>
            {/* the hole in the bezel */}
            <rect x={x0 - m * 0.014} y={-rh / 2 - m * 0.014} width={rw + m * 0.028} height={rh + m * 0.028} rx={rr * 1.2} fill="#09090b" />
            <rect x={x0 - m * 0.006} y={-rh / 2 - m * 0.006} width={rw + m * 0.012} height={rh + m * 0.012} rx={rr} fill={`url(#hole${uid})`} />
            {/* the raised end throws its shadow onto the plate below it */}
            <rect x={x0 + rw * 0.05} y={bot - rh * 0.05} width={rw * 0.9} height={zb * k * 1.4 + rh * 0.06} rx={rr} fill="#000" opacity={0.25 + zb / D * 0.25} filter={`url(#soft${uid})`} />
            {/* side wall of the top end, visible from above */}
            <path d={half(x0, x1, -rh / 2, top + rr, rr)} fill={`url(#wall${uid})`} />
            {/* the two halves of the cap */}
            <path d={half(x0, x1, top, mid, rr)} fill={cap(bT)} />
            <path d={half(x0, x1, bot, mid, rr)} fill={cap(bB * 0.6)} />
            <path d={half(x0, x1, bot, mid, rr)} fill="#000" opacity={0.25 + (1 - bB) * 0.25} />
            {/* glow from the lamp inside, strongest on the "I" half */}
            <rect x={x0} y={top} width={rw} height={bot - top} rx={rr} fill={`url(#inner${uid})`} />
            {/* the crease at the pivot and a vertical sheen along the plastic */}
            <line x1={x0 + 1} x2={x1 - 1} y1={mid} y2={mid} stroke="#1a0402" strokeOpacity="0.55" strokeWidth={m * 0.004} />
            <line x1={x0 + 1} x2={x1 - 1} y1={mid + m * 0.004} y2={mid + m * 0.004} stroke="#fff" strokeOpacity={0.08 + bB * 0.12} strokeWidth={m * 0.002} />
            <rect x={x0} y={top} width={rw} height={bot - top} rx={rr} fill={`url(#sheen${uid})`} opacity={0.6 + bT * 0.4} />
            {/* rim highlight on the top edge of whichever half faces the light */}
            <path d={`M${x0 + rr},${top + 1} L${x1 - rr},${top + 1}`} stroke="#fff" strokeOpacity={0.15 + bT * 0.4} strokeWidth={m * 0.003} strokeLinecap="round" />
            {/* legends: I is lit from behind, O is just moulded */}
            <rect x={-rw * 0.03} y={lerp(top, mid, 0.3)} width={rw * 0.06} height={(mid - top) * 0.4} rx={rw * 0.03} fill={L > 0.02 ? '#fff3d6' : '#6e2a1c'} opacity={0.5 + L * 0.5} />
            <rect x={-rw * 0.06} y={lerp(top, mid, 0.3) - rw * 0.01} width={rw * 0.12} height={(mid - top) * 0.4 + rw * 0.02} rx={rw * 0.05} fill="#ffcf8a" opacity={0.5 * L} filter={`url(#soft${uid})`} />
            <ellipse cx={0} cy={lerp(mid, bot, 0.5)} rx={rw * 0.13} ry={(bot - mid) * 0.18} fill="none" stroke="#1a0603" strokeOpacity="0.6" strokeWidth={rw * 0.045} />
            <ellipse cx={0} cy={lerp(mid, bot, 0.5) + m * 0.003} rx={rw * 0.13} ry={(bot - mid) * 0.18} fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth={rw * 0.02} />
          </g>
        </g>
      </svg>
      <button
        type="button"
        role="switch"
        aria-checked={s.on}
        aria-label="Power rocker switch"
        style={{ position: 'absolute', left: cx - rw / 2, top: cy - rh / 2, width: rw, height: rh, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'toggle' });
          }
        }}
      />
    </Stage>
  );
}
