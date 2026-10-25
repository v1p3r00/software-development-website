import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * Face scan ring. Move the pointer around the face (or hold it down for an automatic pass):
 * the head turns to follow and the ticks of the ring light up, one by one, wherever it is
 * looking. When every tick is lit they retract into one solid ring and the face resolves into a check.
 */

const N = 64;

interface S {
  ticks: number[]; // 0..1 lit
  got: boolean[];
  count: number;
  gx: Spring; // gaze, -1..1
  gy: Spring;
  done: number; // seconds since resolved (-1 = scanning)
  auto: number; // auto-sweep angle (hold / idle)
  idle: number;
  pop: Spring;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const R = Math.min(m * 0.32, 260);
  return { cx: w / 2, cy: h / 2 - m * 0.03, R, m };
}

export const sim = defineSim<S>({
  init: () => ({ ticks: Array(N).fill(0), got: Array(N).fill(false), count: 0, gx: sp(), gy: sp(), done: -1, auto: -Math.PI / 2, idle: 0, pop: sp() }),
  step(s, f) {
    const { cx, cy, R } = geom(f.w, f.h);
    const dt = f.dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;

    // where is it looking? the pointer, or an automatic circle when held / idle
    let ang = 0;
    let look = 0;
    const dx = f.p.x - cx;
    const dy = f.p.y - cy;
    const dist = Math.hypot(dx, dy);
    if (f.p.down || s.idle > 2.2) {
      s.auto += dt * (f.p.down ? 4.2 : 3.4);
      ang = s.auto;
      look = 1;
    } else if (f.p.over && dist > R * 0.25) {
      ang = Math.atan2(dy, dx);
      look = clamp((dist - R * 0.25) / (R * 0.5));
      s.auto = ang;
    }
    spring(s.gx, Math.cos(ang) * look, 120, 16, dt);
    spring(s.gy, Math.sin(ang) * look, 120, 16, dt);

    if (s.done < 0) {
      // light the ticks the gaze is pointing at (±14°)
      if (look > 0.5) {
        for (let i = 0; i < N; i++) {
          const a = (i / N) * Math.PI * 2 - Math.PI / 2;
          let d = Math.abs(a - ang) % (Math.PI * 2);
          if (d > Math.PI) d = Math.PI * 2 - d;
          if (d < 0.24 && !s.got[i]) {
            s.got[i] = true;
            s.count++;
            if (s.count % 3 === 0) f.emit({ name: 'tick', gain: 0.25, rate: 0.9 + (s.count / N) * 0.8 });
          }
        }
      }
      if (s.count >= N) {
        s.done = 0;
        s.pop.v += 6;
        f.emit({ name: 'success', gain: 0.9 });
      }
    } else {
      s.done += dt;
      if (s.done > 2.6) {
        s.done = -1;
        s.got.fill(false);
        s.count = 0;
        f.emit({ name: 'whoosh', gain: 0.25, rate: 1.4 });
      }
    }
    for (let i = 0; i < N; i++) s.ticks[i] = approach(s.ticks[i], s.got[i] ? 1 : 0, s.got[i] ? 14 : 6, dt);
    spring(s.pop, 0, 220, 10, dt);
  },
});

export default function FaceScan() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const { cx, cy, R } = geom(w, h);
  const done = s.done >= 0;
  const dn = done ? s.done : 0;
  const retract = done ? smooth(dn / 0.35) : 0; // ticks shrink into the ring
  const ring = done ? smooth((dn - 0.15) / 0.35) : 0;
  const faceOut = done ? smooth(dn / 0.3) : 0;
  const check = done ? smooth((dn - 0.3) / 0.35) : 0;
  const gx = s.gx.x;
  const gy = s.gy.x;
  const F = R * 0.52; // face glyph size
  const accent = done ? '#3ddc84' : '#ffffff';
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const scale = 1 + s.pop.x * 0.03;
  const pct = Math.round((s.count / N) * 100);
  const ckL = R * 1.1;
  const sweep = !done && s.count > 0 ? (t * 1.6) % 1 : -1;

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: 'radial-gradient(100% 80% at 50% 35%, #1a1b22 0%, #0d0e12 60%, #060608 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <filter id={`gl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={R * 0.025} />
          </filter>
          <radialGradient id={`v${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#3ddc84" stopOpacity="0.3" />
            <stop offset="1" stopColor="#3ddc84" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`face${uid}`}>
            <circle cx={cx} cy={cy} r={R * 0.82} />
          </clipPath>
        </defs>
        {done && <circle cx={cx} cy={cy} r={R * 1.6} fill={`url(#v${uid})`} opacity={1 - Math.max(0, dn - 1.6)} />}
        <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
          {/* the tick ring */}
          {Array.from({ length: N }, (_, i) => {
            const a = (i / N) * Math.PI * 2 - Math.PI / 2;
            const k = s.ticks[i];
            const len = R * (0.11 + k * 0.06) * (1 - retract);
            const r0 = R * 0.92;
            const c = Math.cos(a);
            const sn = Math.sin(a);
            return <line key={i} x1={c * r0} y1={sn * r0} x2={c * (r0 + len)} y2={sn * (r0 + len)} stroke={k > 0.5 ? accent : '#3a3c47'} strokeOpacity={0.45 + k * 0.55} strokeWidth={R * 0.022} strokeLinecap="round" />;
          })}
          {/* solid ring the ticks become */}
          {ring > 0 && <circle r={R * 0.95} fill="none" stroke="#3ddc84" strokeWidth={R * 0.05} strokeDasharray={`${Math.PI * 2 * R * 0.95 * ring} ${Math.PI * 2 * R}`} transform="rotate(-90)" />}
          {ring > 0 && <circle r={R * 0.95} fill="none" stroke="#3ddc84" strokeWidth={R * 0.07} opacity={0.5 * ring} filter={`url(#gl${uid})`} />}
        </g>
        {/* the face glyph turns toward the gaze (features slide more than the outline) */}
        <g clipPath={`url(#face${uid})`} opacity={1 - faceOut}>
          <g transform={`translate(${cx + gx * F * 0.12} ${cy + gy * F * 0.12}) scale(${1 - faceOut * 0.3})`} fill="none" stroke="#e8e9ee" strokeWidth={R * 0.035} strokeLinecap="round" strokeLinejoin="round">
            {/* corner brackets */}
            {[
              [-1, -1],
              [1, -1],
              [-1, 1],
              [1, 1],
            ].map(([sx, sy], i) => (
              <path key={i} d={`M${sx * F} ${sy * F * 0.45} V${sy * F * 0.8} Q${sx * F} ${sy * F} ${sx * F * 0.8} ${sy * F} H${sx * F * 0.45}`} opacity={0.7} />
            ))}
            <g transform={`translate(${gx * F * 0.18} ${gy * F * 0.16})`}>
              <path d={`M${-F * 0.32} ${-F * 0.3} v${F * 0.14} M${F * 0.32} ${-F * 0.3} v${F * 0.14}`} />
              <path d={`M${gx * F * 0.06} ${-F * 0.28} v${F * 0.3} q0 ${F * 0.08} ${-F * 0.1} ${F * 0.08}`} />
              <path d={`M${-F * 0.3} ${F * 0.32} Q0 ${F * (0.5 + gy * 0.05)} ${F * 0.3} ${F * 0.32}`} />
            </g>
          </g>
          {/* a faint scan band crossing the face */}
          {sweep >= 0 && <rect x={cx - R} y={cy - R * 0.82 + sweep * R * 1.64} width={R * 2} height={R * 0.05} fill="#fff" opacity={0.08} />}
        </g>
        {check > 0 && (
          <path
            d={`M${cx - R * 0.32} ${cy + R * 0.02} L${cx - R * 0.08} ${cy + R * 0.27} L${cx + R * 0.38} ${cy - R * 0.25}`}
            fill="none"
            stroke="#3ddc84"
            strokeWidth={R * 0.08}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${ckL * check} ${ckL}`}
          />
        )}
        <text x={cx} y={cy + R * 1.38} textAnchor="middle" fontFamily={ui} fontWeight={600} fontSize={Math.max(12, R * 0.1)} fill={done ? '#3ddc84' : '#d6d7de'}>
          {done ? 'Face ID set up' : s.count ? `Move your head slowly… ${pct}%` : 'Look around the circle'}
        </text>
      </svg>
      <button
        type="button"
        aria-label="Scan face"
        style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2, opacity: 0, borderRadius: '50%' }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
