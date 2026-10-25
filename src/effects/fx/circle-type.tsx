import { useId } from 'react';
import type { ReactNode } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Text set around a ring that turns slowly by itself. Grab it and spin it like a record:
 * it follows your hand, keeps the momentum when you let go, and friction brings it back to
 * its idle drift. Faster spins blur and brighten the type, a pawl at the top clicks over the
 * dots, and an inner ring counter-rotates through gearing. Idle, it gets a flick now and then.
 */

const OUTER = 'SPIN ME ROUND • KEEP IT MOVING • ';
const INNER = 'MOMENTUM · FRICTION · ';
const BASE = 0.35; // idle drift, rad/s
const DOTS = 2; // separators on the outer ring

interface S {
  th: number; // ring angle, rad
  om: number; // angular velocity, rad/s
  drag: boolean;
  last: number; // last pointer angle while dragging
  grab: Spring; // 0..1 grabbed (ring presses in a little)
  idle: number;
  kick: number;
  t: number;
}

function geom(w: number, h: number) {
  const R = Math.min(w, h) * 0.36;
  return { cx: w / 2, cy: h / 2, R };
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export const sim = defineSim<S>({
  init: () => ({ th: 0, om: BASE, drag: false, last: 0, grab: sp(), idle: 1, kick: 0, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    const { cx, cy, R } = geom(f.w, f.h);
    const dx = f.p.x - cx;
    const dy = f.p.y - cy;
    const d = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    if (f.pressed && d < R * 1.35 && d > R * 0.15) {
      s.drag = true;
      s.last = ang;
      f.emit({ name: 'click', gain: 0.3 });
    }
    const th0 = s.th;
    if (s.drag) {
      // the ring turns exactly with the hand; its speed is the smoothed hand speed
      const da = wrap(ang - s.last);
      s.last = ang;
      s.th += da;
      s.om = approach(s.om, da / Math.max(f.dt, 1e-3), 18, f.dt);
      if (!f.p.down) {
        s.drag = false;
        if (Math.abs(s.om) > 4) f.emit({ name: 'whoosh', gain: clamp(Math.abs(s.om) / 25, 0.2, 0.8), rate: 1 + Math.abs(s.om) * 0.01 });
      }
    } else {
      // idle flicks so the gallery sees it spin up and coast down
      if (s.idle > 2.5) {
        s.kick -= f.dt;
        if (s.kick <= 0) {
          s.om += 11 + f.rand() * 5;
          s.kick = 4.2;
          f.emit({ name: 'whoosh', gain: 0.35 });
        }
      } else s.kick = 0.6;
      // friction: exponential decay back toward the idle drift
      s.om = BASE + (s.om - BASE) * Math.exp(-(f.reduced ? 2 : 0.7) * f.dt);
      s.th += s.om * f.dt;
    }
    spring(s.grab, s.drag ? 1 : 0, 300, 18, f.dt);
    // the pawl clicks every time a separator dot passes the top
    const seg = (Math.PI * 2) / DOTS;
    if (Math.floor(th0 / seg) !== Math.floor(s.th / seg) && Math.abs(s.om) > 1.5) f.emit({ name: 'tick', gain: clamp(Math.abs(s.om) / 30, 0.1, 0.5), rate: 1.3 });
  },
});

export default function CircleType() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, R } = geom(w, h);
  const deg = (s.th * 180) / Math.PI;
  const sp1 = Math.abs(s.om);
  const fast = clamp((sp1 - 1) / 18);
  const g = s.grab.x;
  const fsO = R * 0.15;
  const Ri = R * 0.66;
  const fsI = R * 0.085;
  // text length = the path's own circumference, so the phrase closes the loop exactly
  const C = 2 * Math.PI * (R - fsO * 0.36);
  const Ci = 2 * Math.PI * (Ri - fsI * 0.36);
  const rpm = Math.round((sp1 * 60) / (Math.PI * 2));
  // each moving part is its own SVG layer turned with a CSS transform, so spinning is pure
  // compositing (no re-rasterising text every frame)
  // (layers are only as big as the disc: the box around it, in stage coordinates via viewBox)
  const B = R * 1.1;
  const layer = (rot: number, op: number, children: ReactNode, key?: number) => (
    <svg key={key} width={B * 2} height={B * 2} viewBox={`${cx - B} ${cy - B} ${B * 2} ${B * 2}`} style={{ position: 'absolute', left: cx - B, top: cy - B, transform: `rotate(${rot.toFixed(3)}deg)`, opacity: op }} aria-hidden>
      {children}
    </svg>
  );
  const outer = (k: number) => (
    <>
      <defs>
        {/* circle path starting at the top, running clockwise */}
        <path id={`p${uid}${k}`} d={`M ${cx} ${cy - R + fsO * 0.36} a ${R - fsO * 0.36} ${R - fsO * 0.36} 0 1 1 -0.01 0`} fill="none" />
        <linearGradient id={`tx${uid}${k}`} gradientUnits="userSpaceOnUse" x1={cx - R} y1={cy - R} x2={cx + R} y2={cy + R}>
          <stop offset="0" stopColor="#ffd1f0" />
          <stop offset="0.5" stopColor={fast > 0.5 ? '#ffffff' : '#ff8ad8'} />
          <stop offset="1" stopColor="#8f7bff" />
        </linearGradient>
      </defs>
      <text fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={fsO} fill={`url(#tx${uid}${k})`}>
        <textPath href={`#p${uid}${k}`} textLength={C - fsO * 0.1} lengthAdjust="spacing">
          {OUTER.replace(/ /g, '\u00a0')}
        </textPath>
      </text>
    </>
  );

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: 'radial-gradient(90% 80% at 50% 50%, #2a1f3d 0%, #150f22 55%, #09060f 100%)' }}>
      {/* the glow around the disc brightens with speed */}
      <div style={{ position: 'absolute', left: cx - R * 1.25, top: cy - R * 1.25, width: R * 2.5, height: R * 2.5, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,106,213,0) 60%, rgba(255,106,213,0.42) 85%, rgba(255,106,213,0) 100%)', opacity: 0.28 + fast * 0.72, willChange: 'opacity' }} />
      <div style={{ position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${(1 - g * 0.03).toFixed(4)})` }} role="img" aria-label="Spinning circular text">
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
          <defs>
            <radialGradient id={`disc${uid}`} cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#3a2a55" />
              <stop offset="1" stopColor="#140d22" />
            </radialGradient>
            <linearGradient id={`sheen${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.09" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* vinyl-like disc behind the text with fine grooves, and a sheen that stays put */}
          <circle cx={cx} cy={cy} r={R * 1.04} fill={`url(#disc${uid})`} stroke="rgba(255,255,255,0.08)" />
          {[0.95, 0.88, 0.8, 0.56, 0.5].map((k) => (
            <circle key={k} cx={cx} cy={cy} r={R * k} fill="none" stroke="rgba(255,255,255,0.05)" />
          ))}
          <circle cx={cx} cy={cy} r={R * 1.04} fill={`url(#sheen${uid})`} />
        </svg>
        {/* motion blur: trailing ghost copies spread over the last few milliseconds of rotation */}
        {fast > 0.05 && [4, 3, 2, 1].map((k) => layer(deg - Math.sign(s.om) * k * fast * 4, (0.35 * fast) / k, outer(k), k))}
        {layer(deg, 1, outer(0))}
        {/* the inner ring is geared: turns the other way, 1.6× slower */}
        {layer(
          -deg / 1.6,
          1,
          <>
            <defs>
              <path id={`q${uid}`} d={`M ${cx} ${cy - Ri + fsI * 0.36} a ${Ri - fsI * 0.36} ${Ri - fsI * 0.36} 0 1 1 -0.01 0`} fill="none" />
            </defs>
            <text fontFamily="'JetBrains Mono Variable', monospace" fontWeight={600} fontSize={fsI} fill="rgba(220,210,255,0.6)">
              <textPath href={`#q${uid}`} textLength={Ci - fsI * 0.15} lengthAdjust="spacing">
                {(INNER + INNER).replace(/ /g, '\u00a0')}
              </textPath>
            </text>
          </>,
        )}
        {/* hub with a speed readout */}
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
          <circle cx={cx} cy={cy} r={R * 0.4} fill="#0e0918" stroke="rgba(255,138,216,0.35)" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={R * 0.4 * (0.2 + fast * 0.8)} fill="#ff6ad5" opacity={0.08 + fast * 0.15} />
          <text x={cx} y={cy + R * 0.06} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={R * 0.2} fill="#fff">
            {rpm}
          </text>
          <text x={cx} y={cy + R * 0.2} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontWeight={600} fontSize={R * 0.06} letterSpacing={R * 0.02} fill="rgba(255,200,240,0.6)">
            RPM
          </text>
        </svg>
      </div>
      {/* the pawl at the top */}
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <path d={`M ${cx - R * 0.05} ${cy - R * 1.14} L ${cx + R * 0.05} ${cy - R * 1.14} L ${cx} ${cy - R * 1.04} Z`} fill="#ffd1f0" />
      </svg>
    </Stage>
  );
}
