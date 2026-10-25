import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A camera iris as a scene transition. Eight blades, each a plate whose inner edge is tangent to
 * the aperture, sweep in with a twist, slam shut with a tiny bounce, and swing open again on the
 * next scene. Press and hold to keep it shut; let go to reveal.
 */

const N = 8;
const SCENES = [
  { title: 'Golden hour', no: '01' },
  { title: 'City lights', no: '02' },
  { title: 'Alpine blue', no: '03' },
];

interface S {
  r: Spring; // aperture 0 (shut) .. 1 (open past the corners)
  shut: boolean; // wants to be shut
  hold: number; // seconds it stays shut on a tap
  scene: number;
  swapped: boolean;
  flash: number;
  idle: number;
  auto: number;
}

export const sim = defineSim<S>({
  init: () => ({ r: sp(1), shut: false, hold: 0, scene: 0, swapped: true, flash: 0, idle: 0, auto: 0 }),
  step(s, f) {
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    let snap = false;
    if (f.pressed) snap = true;
    for (const a of f.actions) if (a.type === 'snap') snap = true;
    if (s.idle > 1.4) {
      s.auto += f.dt;
      if (s.auto > 2.4) {
        s.auto = 0;
        snap = true;
      }
    } else s.auto = 1.6;
    if (snap && !s.shut) {
      s.shut = true;
      s.hold = 0.12;
      s.swapped = false;
      f.emit({ name: 'click', gain: 0.6, rate: 0.9 });
    }
    if (s.shut) {
      // a tap holds it shut for a beat; a held press keeps it shut until release
      if (s.r.x < 0.03) s.hold -= f.dt;
      if (s.hold <= 0 && !f.p.down) {
        s.shut = false;
        s.flash = 1;
        f.emit({ name: 'whoosh', gain: 0.35, rate: 1.3 });
      }
    }
    const prev = s.r.x;
    spring(s.r, s.shut ? 0 : 1, s.shut ? 260 : 70, s.shut ? 16 : f.reduced ? 18 : 11, f.dt);
    // blades hit each other: bounce off the closed position
    if (s.r.x < 0) {
      s.r.x = 0;
      s.r.v = Math.abs(s.r.v) * (f.reduced ? 0 : 0.25);
      if (prev > 0) f.emit({ name: 'thud', gain: 0.5, rate: 1.4 });
    }
    if (!s.swapped && s.r.x < 0.01) {
      s.swapped = true;
      s.scene = (s.scene + 1) % SCENES.length;
    }
    s.flash = Math.max(0, s.flash - f.dt * 3);
  },
});

function Scene({ i, w, h, uid }: { i: number; w: number; h: number; uid: string }) {
  const m = Math.min(w, h);
  if (i === 0)
    return (
      <g>
        <rect width={w} height={h} fill={`url(#s0${uid})`} />
        <circle cx={w * 0.62} cy={h * 0.58} r={m * 0.16} fill="#ffe2a0" />
        <circle cx={w * 0.62} cy={h * 0.58} r={m * 0.3} fill="#ffb36b" opacity="0.25" />
        <rect y={h * 0.62} width={w} height={h * 0.38} fill="#3a1f4a" />
        {Array.from({ length: 9 }, (_, k) => (
          <rect key={k} x={w * 0.62 - m * (0.18 - k * 0.012)} y={h * (0.64 + k * 0.035)} width={m * (0.36 - k * 0.024)} height={h * 0.008} rx={2} fill="#ffcf8a" opacity={0.7 - k * 0.06} />
        ))}
      </g>
    );
  if (i === 1)
    return (
      <g>
        <rect width={w} height={h} fill={`url(#s1${uid})`} />
        {Array.from({ length: 40 }, (_, k) => (
          <circle key={k} cx={((k * 97.3) % 100) / 100 * w} cy={((k * 41.7) % 50) / 100 * h} r={m * 0.002 * (1 + (k % 3))} fill="#fff" opacity={0.3 + (k % 4) * 0.15} />
        ))}
        {Array.from({ length: 16 }, (_, k) => {
          const bw = w / 16;
          const bh = h * (0.25 + 0.35 * Math.abs(Math.sin(k * 2.7)));
          return (
            <g key={k}>
              <rect x={k * bw} y={h - bh} width={bw * 0.92} height={bh} fill={k % 2 ? '#131a3a' : '#0f1530'} />
              {Array.from({ length: Math.floor(bh / (h * 0.05)) }, (_, j) =>
                [0, 1, 2].map((c) => ((k * 7 + j * 3 + c) % 5 < 2 ? <rect key={`${j}${c}`} x={k * bw + bw * (0.15 + c * 0.27)} y={h - bh + h * 0.02 + j * h * 0.05} width={bw * 0.14} height={h * 0.02} fill="#ffd27a" opacity="0.8" /> : null)),
              )}
            </g>
          );
        })}
      </g>
    );
  return (
    <g>
      <rect width={w} height={h} fill={`url(#s2${uid})`} />
      <path d={`M0,${h * 0.75} L${w * 0.22},${h * 0.42} L${w * 0.36},${h * 0.58} L${w * 0.55},${h * 0.3} L${w * 0.78},${h * 0.6} L${w * 0.9},${h * 0.48} L${w},${h * 0.6} L${w},${h} L0,${h} Z`} fill="#3d6c8f" />
      <path d={`M${w * 0.55},${h * 0.3} L${w * 0.49},${h * 0.39} L${w * 0.53},${h * 0.37} L${w * 0.56},${h * 0.41} L${w * 0.6},${h * 0.37} Z M${w * 0.22},${h * 0.42} L${w * 0.17},${h * 0.49} L${w * 0.22},${h * 0.47} L${w * 0.26},${h * 0.48} Z`} fill="#f4fbff" />
      <path d={`M0,${h * 0.85} L${w * 0.3},${h * 0.66} L${w * 0.6},${h * 0.8} L${w},${h * 0.7} L${w},${h} L0,${h} Z`} fill="#1f4462" />
    </g>
  );
}

export default function Shutter() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const m = Math.min(w, h);
  const cx = w / 2;
  const cy = h / 2;
  const half = Math.hypot(w, h) / 2;
  const r = clamp(s.r.x) * half * 1.04;
  const L = half * 2.2;
  const tan = Math.tan(Math.PI / N);
  // the whole blade set turns as it closes, like a real iris ring
  const twist = (1 - clamp(s.r.x)) * 70;
  const sc = SCENES[s.scene];
  const blade = `M${r},${-r * tan} L${r},${L} L${r + L},${L} L${r + L},${-r * tan} Z`;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#000' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`s0${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b1a52" />
            <stop offset="0.45" stopColor="#c2456b" />
            <stop offset="0.62" stopColor="#ff9a5c" />
          </linearGradient>
          <linearGradient id={`s1${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#050818" />
            <stop offset="1" stopColor="#24305e" />
          </linearGradient>
          <linearGradient id={`s2${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7cc7ff" />
            <stop offset="1" stopColor="#d9f0ff" />
          </linearGradient>
          {/* blade metal: dark anodised, lighter at the cutting edge */}
          <linearGradient id={`blade${uid}`} gradientUnits="userSpaceOnUse" x1={r} y1="0" x2={r + m * 0.5} y2="0">
            <stop offset="0" stopColor="#4a4f5a" />
            <stop offset="0.04" stopColor="#2a2e36" />
            <stop offset="1" stopColor="#101216" />
          </linearGradient>
          <filter id={`ds${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0" stdDeviation={m * 0.012} floodColor="#000" floodOpacity="0.7" />
          </filter>
          <clipPath id={`last${uid}`}>
            <path d={blade} transform={`rotate(${((N - 1) * 360) / N})`} />
          </clipPath>
          <radialGradient id={`vig${uid}`} cx="50%" cy="50%" r="70%">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <Scene i={s.scene} w={w} h={h} uid={uid} />
        <rect width={w} height={h} fill={`url(#vig${uid})`} />
        {/* the flash as it reopens, seen through the aperture */}
        <rect width={w} height={h} fill="#fff" opacity={s.flash * 0.4} />
        {/* blades: each starts at its corner of the aperture polygon and runs off past the frame */}
        <g transform={`translate(${cx} ${cy}) rotate(${twist})`}>
          {[...Array.from({ length: N }, (_, i) => i), 0].map((i, k) => (
            // the first blade is drawn again on top, clipped to the last one, so the pinwheel overlaps all the way round
            <g key={k} clipPath={k === N ? `url(#last${uid})` : undefined}>
              <g transform={`rotate(${(i * 360) / N})`} filter={`url(#ds${uid})`}>
                <path d={blade} fill={`url(#blade${uid})`} />
                <line x1={r + 0.5} y1={-r * tan} x2={r + 0.5} y2={L} stroke="#9aa3b5" strokeOpacity="0.55" strokeWidth={Math.max(1, m * 0.003)} />
                {/* a rivet near where the blade pivots on the ring */}
                <circle cx={r + m * 0.06} cy={-r * tan + m * 0.06} r={m * 0.008} fill="#5a606c" opacity={1 - clamp(s.r.x) * 0.9} />
              </g>
            </g>
          ))}
        </g>
        {/* viewfinder marks */}
        <g stroke="#fff" strokeOpacity="0.7" strokeWidth={Math.max(1, m * 0.004)} fill="none">
          {[
            [1, 1],
            [-1, 1],
            [1, -1],
            [-1, -1],
          ].map(([sx, sy], k) => (
            <path key={k} d={`M${cx - sx * (w / 2 - m * 0.06)},${cy - sy * (h / 2 - m * 0.06) + sy * m * 0.06} v${-sy * m * 0.06} h${sx * m * 0.06}`} />
          ))}
          <circle cx={cx} cy={cy} r={m * 0.03} strokeOpacity="0.5" />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: m * 0.08, bottom: m * 0.08, fontFamily: "'JetBrains Mono Variable', monospace", color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
        <div style={{ fontSize: m * 0.03, opacity: 0.75 }}>FRAME {sc.no} · 1/250 · ƒ2.8</div>
        <div style={{ fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: m * 0.08 }}>{sc.title}</div>
      </div>
      <div style={{ position: 'absolute', right: m * 0.06, top: m * 0.06, display: 'flex', alignItems: 'center', gap: m * 0.012, fontFamily: "'JetBrains Mono Variable', monospace", fontSize: m * 0.028, color: '#fff' }}>
        <span style={{ width: m * 0.02, height: m * 0.02, borderRadius: '50%', background: '#ff3b3b', opacity: 0.5 + 0.5 * Math.round((fx.t * 1.6) % 1) }} />
        REC
      </div>
      <button
        type="button"
        aria-label="Take the shot"
        style={{ position: 'absolute', inset: 0, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'snap' });
          }
        }}
      />
    </Stage>
  );
}
