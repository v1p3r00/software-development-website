import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * Soft clay. A neumorphic power button moulded out of the surface. Pressing sinks it in: its
 * outer shadows melt into inner ones, a ridge of displaced clay swells around it and a soft
 * fingertip dent forms where you pressed. Clay is slow — it oozes back up and the dent relaxes late.
 */

interface S {
  e: Spring; // elevation: 1 raised … -1 sunk
  ridge: number; // displaced clay around the edge 0..1
  dent: number; // fingertip dent depth 0..1
  dx: number; // dent position (units of half size)
  dy: number;
  on: boolean;
  glow: number;
  pressing: boolean;
  idle: number;
  demo: number;
  demoDown: boolean;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const a = Math.min(m * 0.24, 190); // half size
  return { cx: w / 2, cy: h / 2, a, rad: a * 0.42, d: a * 0.12 };
}

export const sim = defineSim<S>({
  init: () => ({ e: sp(1), ridge: 0, dent: 0, dx: 0, dy: 0, on: false, glow: 0, pressing: false, idle: 0, demo: 0, demoDown: false }),
  step(s, f) {
    const { cx, cy, a } = geom(f.w, f.h);
    const dt = f.dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;
    const ux = (f.p.x - cx) / a;
    const uy = (f.p.y - cy) / a;
    const inside = Math.abs(ux) < 1.05 && Math.abs(uy) < 1.05;
    const press = (x: number, y: number) => {
      s.dx = clamp(x, -0.7, 0.7);
      s.dy = clamp(y, -0.7, 0.7);
      s.on = !s.on;
      f.emit({ name: 'thud', gain: 0.45, rate: 0.8 });
      f.emit({ name: 'switch', gain: 0.35, rate: s.on ? 1.1 : 0.9 });
    };
    if (f.pressed && inside) {
      s.pressing = true;
      press(ux, uy);
    }
    if (s.pressing && !f.p.down) {
      s.pressing = false;
      f.emit({ name: 'squeak', gain: 0.2, rate: 0.6 });
    }

    // self-demo: a slow press every 3 s, a slightly different spot each time
    if (!s.pressing && s.idle > 2.2) {
      s.demo += dt;
      const ph = s.demo % 3;
      const down = ph < 0.9;
      if (down && !s.demoDown) {
        const n = Math.floor(s.demo / 3);
        press(Math.sin(n * 2.1) * 0.3, Math.cos(n * 1.7) * 0.25);
      }
      s.demoDown = down;
    } else {
      s.demo = 0;
      s.demoDown = false;
    }
    const held = s.pressing || s.demoDown;
    if (s.pressing) {
      // the dent follows the finger, dragged through the clay
      s.dx = approach(s.dx, clamp(ux, -0.7, 0.7), 5, dt);
      s.dy = approach(s.dy, clamp(uy, -0.7, 0.7), 5, dt);
    }
    // viscous: sinks reasonably quickly, oozes back slowly with only a whisper of overshoot
    spring(s.e, held ? -1 : 1, held ? 60 : 22, held ? 13 : 7.5, dt);
    s.ridge = approach(s.ridge, held ? 1 : 0, held ? 5 : 1.6, dt);
    s.dent = approach(s.dent, held ? 1 : 0, held ? 7 : 1.1, dt);
    s.glow = approach(s.glow, s.on ? 1 : 0, 6, dt);
  },
});

export default function ClayButton() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, a, rad, d } = geom(w, h);
  const e = s.e.x;
  const up = clamp(e, 0, 1.2);
  const dn = clamp(-e, 0, 1);
  const sinkScale = 1 - dn * 0.035; // the face shrinks slightly as it sinks away
  const blur = a * 0.1;
  const big = a * 4;
  const frame = `M${-big} ${-big}H${big}V${big}H${-big}Z M${-a} ${-a + rad}a${rad} ${rad} 0 0 1 ${rad} ${-rad}H${a - rad}a${rad} ${rad} 0 0 1 ${rad} ${rad}V${a - rad}a${rad} ${rad} 0 0 1 ${-rad} ${rad}H${-a + rad}a${rad} ${rad} 0 0 1 ${-rad} ${-rad}Z`;
  const R = s.ridge;
  const glow = s.glow;
  const ic = a * 0.34;
  const iconCol = `rgb(${lerp(150, 255, glow) | 0},${lerp(138, 128, glow) | 0},${lerp(126, 60, glow) | 0})`;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#e6ddd2' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="40%" cy="30%" r="90%">
            <stop offset="0" stopColor="#f1e9df" />
            <stop offset="1" stopColor="#d3c7b9" />
          </radialGradient>
          <linearGradient id={`face${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={dn > 0 ? '#e2d8cc' : '#efe7dd'} />
            <stop offset="1" stopColor={dn > 0 ? '#ebe2d7' : '#ddd2c5'} />
          </linearGradient>
          <filter id={`b${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
          <filter id={`b2${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur * 1.8} />
          </filter>
          <radialGradient id={`dent${uid}`} cx="50%" cy="50%" r="50%" fx="38%" fy="36%">
            <stop offset="0" stopColor="#8a7864" stopOpacity={0.4 * s.dent} />
            <stop offset="0.7" stopColor="#8a7864" stopOpacity={0.12 * s.dent} />
            <stop offset="1" stopColor="#8a7864" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`dentL${uid}`} cx="50%" cy="50%" r="50%" fx="66%" fy="68%">
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.85" stopColor="#fff" stopOpacity={0.45 * s.dent} />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`led${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff9a3c" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`c${uid}`}>
            <rect x={-a} y={-a} width={a * 2} height={a * 2} rx={rad} />
          </clipPath>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        <g transform={`translate(${cx} ${cy})`}>
          {/* the ridge of displaced clay: a soft swelling all around the edge */}
          {R > 0.01 && (
            <g opacity={R}>
              <rect x={-a * 1.22 + d * 0.6} y={-a * 1.22 + d * 0.6} width={a * 2.44} height={a * 2.44} rx={rad * 1.4} fill="#a8957f" opacity={0.45} filter={`url(#b2${uid})`} />
              <rect x={-a * 1.22 - d * 0.6} y={-a * 1.22 - d * 0.6} width={a * 2.44} height={a * 2.44} rx={rad * 1.4} fill="#fffaf3" opacity={0.85} filter={`url(#b2${uid})`} />
              <rect x={-a * 1.18} y={-a * 1.18} width={a * 2.36} height={a * 2.36} rx={rad * 1.3} fill="#e8dfd4" />
            </g>
          )}
          {/* raised: the classic two-light neumorphic shadow */}
          {up > 0.01 && (
            <g opacity={Math.min(1, up)}>
              <rect x={-a + d * up} y={-a + d * up} width={a * 2} height={a * 2} rx={rad} fill="#a3907a" opacity={0.75} filter={`url(#b${uid})`} />
              <rect x={-a - d * up} y={-a - d * up} width={a * 2} height={a * 2} rx={rad} fill="#fffaf3" filter={`url(#b${uid})`} />
            </g>
          )}
          <g transform={`scale(${sinkScale})`}>
            <rect x={-a} y={-a} width={a * 2} height={a * 2} rx={rad} fill={`url(#face${uid})`} />
            {/* sunk: inner shadows (a blurred frame, offset, clipped to the face) */}
            <g clipPath={`url(#c${uid})`}>
              {dn > 0.01 && (
                <g>
                  <path d={frame} fillRule="evenodd" fill="#8f7b65" opacity={0.65 * dn} filter={`url(#b${uid})`} transform={`translate(${d * dn} ${d * dn})`} />
                  <path d={frame} fillRule="evenodd" fill="#fffaf3" opacity={0.9 * dn} filter={`url(#b${uid})`} transform={`translate(${-d * dn} ${-d * dn})`} />
                </g>
              )}
              {s.dent > 0.01 && (
                <g>
                  <ellipse cx={s.dx * a} cy={s.dy * a} rx={a * 0.42} ry={a * 0.4} fill={`url(#dent${uid})`} />
                  <ellipse cx={s.dx * a} cy={s.dy * a} rx={a * 0.42} ry={a * 0.4} fill={`url(#dentL${uid})`} />
                </g>
              )}
            </g>
            {/* the power glyph is pressed into the clay: light below, dark above */}
            <g transform={`translate(${s.dx * a * 0.08 * s.dent} ${s.dy * a * 0.08 * s.dent})`} fill="none" strokeWidth={a * 0.075} strokeLinecap="round">
              <circle r={ic * 1.6} fill={`url(#led${uid})`} stroke="none" opacity={glow} />
              <g stroke="#fffaf3" opacity={0.8} transform={`translate(${a * 0.012} ${a * 0.016})`}>
                <path d={`M${-ic * 0.62} ${-ic * 0.62} A${ic * 0.88} ${ic * 0.88} 0 1 0 ${ic * 0.62} ${-ic * 0.62}`} />
                <path d={`M0 ${-ic * 0.95} V${-ic * 0.1}`} />
              </g>
              <g stroke={iconCol}>
                <path d={`M${-ic * 0.62} ${-ic * 0.62} A${ic * 0.88} ${ic * 0.88} 0 1 0 ${ic * 0.62} ${-ic * 0.62}`} />
                <path d={`M0 ${-ic * 0.95} V${-ic * 0.1}`} />
              </g>
            </g>
          </g>
          {/* a tiny status LED pressed into the surface below */}
          <circle cx={0} cy={a * 1.55} r={a * 0.045} fill={glow > 0.5 ? '#ff9a3c' : '#c9bcae'} />
          <circle cx={0} cy={a * 1.55} r={a * 0.16} fill={`url(#led${uid})`} opacity={glow} />
        </g>
      </svg>
      <button
        type="button"
        aria-label="Power"
        aria-pressed={s.on}
        style={{ position: 'absolute', left: cx - a, top: cy - a, width: a * 2, height: a * 2, opacity: 0, borderRadius: rad }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
