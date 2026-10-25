import { useId } from 'react';
import type { CSSProperties } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A machined aluminium knob. Turn it by dragging around it: it clicks through detents
 * (the angle is pulled into each notch), the LED ring fills from green to red and the
 * brushed-metal highlight stays put while the knurled skirt turns, like real anisotropic metal.
 */

const STEPS = 30; // detents across the 270° sweep
const DOTS = 31;

interface S {
  raw: number; // where the hand has turned it, 0..1
  ang: Spring; // displayed value 0..1 (snaps to detents)
  drag: boolean;
  lastA: number;
  notch: number;
  idle: number;
  goal: number;
  wait: number;
  press: Spring;
  hover: number;
  flash: number; // brief LED flash at the ends
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  return { m, cx: w / 2, cy: h * 0.47, R: m * 0.2 };
}

export const sim = defineSim<S>({
  init: () => ({ raw: 0.4, ang: sp(0.4), drag: false, lastA: 0, notch: 12, idle: 0, goal: 0.4, wait: 0.3, press: sp(), hover: 0, flash: 0 }),
  step(s, f) {
    const { cx, cy, R } = geom(f.w, f.h);
    const dx = f.p.x - cx;
    const dy = f.p.y - cy;
    const a = Math.atan2(dy, dx);
    const near = Math.hypot(dx, dy) < R * 1.9;
    if (f.pressed && near) {
      s.drag = true;
      s.lastA = a;
      f.emit({ name: 'click', gain: 0.25, rate: 0.7 });
    }
    s.idle = s.drag || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    if (s.drag) {
      // turning: follow the change of angle around the centre
      let d = a - s.lastA;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      s.lastA = a;
      const before = s.raw;
      s.raw = clamp(s.raw + d / (Math.PI * 1.5));
      if ((s.raw === 0 || s.raw === 1) && before !== s.raw) {
        s.flash = 1;
        f.emit({ name: 'thud', gain: 0.4 });
      }
      if (!f.p.down) s.drag = false;
    } else if (s.idle > 1.5) {
      // self-demo: someone turns it to a new level in a few flicks
      s.wait -= f.dt;
      if (s.wait <= 0) {
        s.goal = s.raw > 0.5 ? 0.08 + f.rand() * 0.3 : 0.62 + f.rand() * 0.38;
        s.wait = 1.9;
      }
      s.raw = approach(s.raw, s.goal, 4.5, f.dt);
    }
    for (const act of f.actions) if (act.type === 'step') s.raw = clamp(Math.round(s.raw * STEPS + (act.d as number)) / STEPS);
    // detents: the shown angle is pulled into the nearest notch
    const snapped = Math.round(s.raw * STEPS) / STEPS;
    const target = s.drag ? lerp(s.raw, snapped, 0.75) : snapped;
    spring(s.ang, target, 900, f.reduced ? 70 : 28, f.dt);
    const n = Math.round(clamp(s.ang.x) * STEPS);
    if (n !== s.notch) {
      s.notch = n;
      f.emit({ name: 'tick', gain: 0.3, rate: 0.9 + n / STEPS * 0.5 });
    }
    spring(s.press, s.drag ? 1 : 0, 400, 22, f.dt);
    s.hover = approach(s.hover, near && f.p.over ? 1 : 0, 8, f.dt);
    s.flash = approach(s.flash, 0, 6, f.dt);
  },
});

const ledColor = (u: number) => {
  // green → amber → red
  const c = u < 0.6 ? [lerp(60, 255, u / 0.6), lerp(235, 200, u / 0.6), lerp(140, 60, u / 0.6)] : [255, lerp(200, 60, (u - 0.6) / 0.4), lerp(60, 70, (u - 0.6) / 0.4)];
  return `rgb(${c.map(Math.round).join(',')})`;
};

export default function KnobDial() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, cx, cy, R } = geom(w, h);
  const v = clamp(s.ang.x, -0.02, 1.02);
  const deg = -135 + v * 270;
  const lift = 1 - s.press.x * 0.35 + s.hover * 0.1;
  const rr = R * 1.42;
  const val = Math.round(clamp(s.ang.x) * STEPS);
  const knob = (r: number): CSSProperties => ({ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%' });

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: '#0b0c0f' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="50%" cy="38%" r="80%">
            <stop offset="0" stopColor="#2a2d34" />
            <stop offset="0.55" stopColor="#15171b" />
            <stop offset="1" stopColor="#07080a" />
          </radialGradient>
          <filter id={`glow${uid}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={m * 0.012} />
          </filter>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={R * 0.12 * lift} />
          </filter>
          <radialGradient id={`well${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0.7" stopColor="#0b0c0f" />
            <stop offset="0.92" stopColor="#1d2026" />
            <stop offset="1" stopColor="#30343c" />
          </radialGradient>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        {/* recessed panel ring */}
        <circle cx={cx} cy={cy} r={rr * 1.18} fill={`url(#well${uid})`} />
        {/* LED ring: lit up to the value, with a halo */}
        {Array.from({ length: DOTS }, (_, i) => {
          const u = i / (DOTS - 1);
          const th = ((-225 + u * 270) * Math.PI) / 180;
          const on = u <= clamp(s.ang.x) + 1e-3;
          const x = cx + Math.cos(th) * rr;
          const y = cy + Math.sin(th) * rr;
          const col = ledColor(u);
          const head = on && Math.abs(u - clamp(s.ang.x)) < 0.5 / STEPS + 0.02;
          return (
            <g key={i}>
              {on && <circle cx={x} cy={y} r={m * (head ? 0.03 : 0.02)} fill={col} opacity={0.55 + s.flash * 0.4} filter={`url(#glow${uid})`} />}
              <circle cx={x} cy={y} r={m * 0.0085} fill={on ? col : '#23262c'} stroke="#000" strokeOpacity="0.5" strokeWidth={m * 0.002} />
              {on && <circle cx={x - m * 0.002} cy={y - m * 0.002} r={m * 0.003} fill="#fff" opacity="0.8" />}
            </g>
          );
        })}
        {/* min / max legends */}
        {[0, 1].map((u) => {
          const th = ((-225 + u * 270) * Math.PI) / 180;
          return (
            <text key={u} x={cx + Math.cos(th) * rr * 1.2} y={cy + Math.sin(th) * rr * 1.2 + m * 0.03} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontWeight={600} fontSize={m * 0.026} fill="#5d626d">
              {u ? 'MAX' : 'MIN'}
            </text>
          );
        })}
        {/* drop shadow: longer and softer when the knob is lifted by hover */}
        <circle cx={cx + R * 0.05} cy={cy + R * 0.16 * lift} r={R * 1.04} fill="#000" opacity="0.75" filter={`url(#sh${uid})`} />
      </svg>
      {/* knurled skirt: turns with the knob */}
      <div style={{ ...knob(R * 1.06), transform: `rotate(${deg}deg)`, background: 'repeating-conic-gradient(#5b616b 0deg 3deg, #c9ced6 3deg 4.5deg, #3e434b 4.5deg 6deg)', boxShadow: '0 0 0 1px rgba(0,0,0,0.6)' }} />
      <div style={{ ...knob(R * 1.06), background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.25), rgba(0,0,0,0.45) 75%)' }} />
      {/* the cap: brushed radial aluminium, highlight fixed to the light */}
      <div
        style={{
          ...knob(R * 0.92),
          background:
            'repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.04) 1px 2px), conic-gradient(from 20deg, #8d929b, #f5f7fa 10%, #a4a9b2 22%, #dfe3e8 34%, #858a93 50%, #f2f4f7 62%, #a0a5ae 74%, #e6e9ed 86%, #8d929b)',
          boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.7), inset 0 -3px 6px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.6)',
        }}
      />
      {/* pointer groove + a little lit dot: rotate with the knob */}
      <div style={{ ...knob(R * 0.92), transform: `rotate(${deg}deg)` }}>
        <div style={{ position: 'absolute', left: '50%', top: R * 0.1, width: R * 0.07, height: R * 0.32, marginLeft: -R * 0.035, borderRadius: R, background: 'linear-gradient(90deg, #4a4f57, #1c1f24 60%, #9aa0a8)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.7)' }} />
        <div style={{ position: 'absolute', left: '50%', top: R * 0.14, width: R * 0.035, height: R * 0.035, marginLeft: -R * 0.0175, borderRadius: '50%', background: ledColor(clamp(s.ang.x)), boxShadow: `0 0 ${R * 0.08}px ${ledColor(clamp(s.ang.x))}` }} />
      </div>
      {/* centre dimple */}
      <div style={{ ...knob(R * 0.18), background: 'radial-gradient(circle at 50% 65%, #f4f6f8, #8b9099 70%)', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.4)' }} />
      {/* read-out */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy + rr * 1.3, textAlign: 'center', fontFamily: "'JetBrains Mono Variable', monospace", color: ledColor(clamp(s.ang.x)), fontSize: m * 0.06, fontWeight: 600, textShadow: `0 0 ${m * 0.02}px ${ledColor(clamp(s.ang.x))}66` }}>
        {String(Math.round(clamp(s.ang.x) * 100)).padStart(3, '0')}
        <span style={{ fontSize: m * 0.028, color: '#5d626d', marginLeft: m * 0.012 }}>LEVEL</span>
      </div>
      <button
        type="button"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={STEPS}
        aria-valuenow={val}
        aria-label="Rotary knob"
        style={{ ...knob(R), opacity: 0 }}
        onKeyDown={(e) => {
          const d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -1 : 0;
          if (d) {
            e.preventDefault();
            fx.dispatch({ type: 'step', d });
          }
        }}
      />
    </Stage>
  );
}
