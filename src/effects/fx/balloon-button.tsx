import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * An inflated button. Press anywhere on it: the skin dents under the finger, the rest of the
 * balloon bulges to keep its volume, and on release it springs back with a rubbery wobble.
 */

const N = 120; // outline points

interface S {
  depth: Spring; // 0..1 how deep the dent is (overshoots below 0 on release = bulge)
  sq: Spring; // squash of the whole body
  lift: Spring; // vertical bounce
  dx: number; // dent position relative to the centre, in units of the half-size
  dy: number;
  pressing: boolean;
  hover: number;
  t: number;
}

function geom(w: number, h: number) {
  const a = Math.min(w * (h > w * 1.2 ? 0.43 : 0.36), 300);
  const b = a * 0.46;
  return { cx: w / 2, cy: h / 2, a, b };
}

export const sim = defineSim<S>({
  init: () => ({ depth: sp(), sq: sp(), lift: sp(), dx: 0, dy: 0, pressing: false, hover: 0, t: 0 }),
  step(s, f) {
    const { cx, cy, a, b } = geom(f.w, f.h);
    const ux = (f.p.x - cx) / a;
    const uy = (f.p.y - cy) / b;
    const inside = Math.pow(Math.abs(ux), 4) + Math.pow(Math.abs(uy), 4) <= 1.05;
    s.t += f.dt;
    if (f.pressed && inside) {
      s.pressing = true;
      s.dx = ux;
      s.dy = uy;
      f.emit({ name: 'squeak', gain: 0.55, rate: 0.9 + f.rand() * 0.25, pan: ux * 0.4 });
    }
    if (s.pressing) {
      // the dent follows the finger, a little behind (the skin drags)
      s.dx = approach(s.dx, clamp(ux, -0.95, 0.95), 14, f.dt);
      s.dy = approach(s.dy, clamp(uy, -0.9, 0.9), 14, f.dt);
    }
    if (s.pressing && !f.p.down) {
      s.pressing = false;
      f.emit({ name: 'boing', gain: clamp(s.depth.x, 0.25, 1), rate: 0.95 + f.rand() * 0.1, pan: s.dx * 0.4 });
      // a kick for the release wobble
      s.sq.v -= 9 * s.depth.x;
      s.lift.v -= 260 * s.depth.x;
    }
    s.hover = approach(s.hover, inside && f.p.over ? 1 : 0, 10, f.dt);
    spring(s.depth, s.pressing ? 1 : 0, 260, s.pressing ? 22 : 9, f.dt);
    spring(s.sq, s.pressing ? 0.6 * s.depth.x : 0, 300, 10, f.dt);
    spring(s.lift, 0, 220, 11, f.dt);
  },
});

export default function BalloonButton() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, a, b } = geom(w, h);
  const d = s.depth.x; // may be negative (bulge) after release
  const sq = s.sq.x;
  // the body squashes down and spreads out a little when pressed (volume is kept)
  const sx = 1 + sq * 0.06;
  const sy = 1 - sq * 0.08;
  const lift = s.lift.x * 0.06;

  // dent location on the body, px
  const px = s.dx * a;
  const py = s.dy * b;
  const r = a * 0.42; // dent radius
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    const c = Math.cos(th);
    const sn = Math.sin(th);
    // superellipse (n = 4): a soft, inflated pill
    let x = Math.sign(c) * Math.pow(Math.abs(c), 0.5) * a;
    let y = Math.sign(sn) * Math.pow(Math.abs(sn), 0.5) * b;
    const len = Math.hypot(x / a, y / b) || 1;
    const nx = x / a / len;
    const ny = y / b / len;
    const dist2 = ((x - px) ** 2 + (y - py) ** 2) / (r * r);
    const pinch = Math.exp(-dist2) * d * a * 0.13; // the skin near the finger is pulled in
    const bulge = d * a * 0.03 * (1 - Math.exp(-dist2)); // and the rest swells
    // the release wobble: a 2-lobe mode
    const wob = Math.min(0, d) * a * 0.05 * Math.cos(2 * th);
    x += nx * (bulge - pinch + wob);
    y += ny * (bulge - pinch - wob);
    pts.push(`${(x * sx).toFixed(1)},${(y * sy).toFixed(1)}`);
  }
  const path = `M${pts.join('L')}Z`;
  const dd = Math.max(0, d);
  const label = 'PUSH';

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(120% 90% at 50% 20%, #2a2f3a 0%, #12141a 55%, #0a0b0e 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`body${uid}`} cx="38%" cy="28%" r="85%">
            <stop offset="0" stopColor="#ffb08a" />
            <stop offset="0.28" stopColor="#ff6a2b" />
            <stop offset="0.7" stopColor="#e2430f" />
            <stop offset="1" stopColor="#8f2205" />
          </radialGradient>
          <radialGradient id={`rim${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0.82" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#3a0b00" stopOpacity="0.55" />
          </radialGradient>
          <radialGradient id={`spec${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.4" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          {/* the dent: shadowed on the side facing the light, lit on the far side */}
          <radialGradient id={`dentS${uid}`} cx="50%" cy="50%" r="50%" fx="38%" fy="34%">
            <stop offset="0" stopColor="#5a1400" stopOpacity={0.55 * dd} />
            <stop offset="0.55" stopColor="#5a1400" stopOpacity={0.25 * dd} />
            <stop offset="1" stopColor="#5a1400" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`dentL${uid}`} cx="50%" cy="50%" r="50%" fx="66%" fy="72%">
            <stop offset="0.45" stopColor="#ffd2b8" stopOpacity="0" />
            <stop offset="0.8" stopColor="#ffd2b8" stopOpacity={0.55 * dd} />
            <stop offset="1" stopColor="#ffd2b8" stopOpacity="0" />
          </radialGradient>
          <filter id={`blur${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={a * 0.06} />
          </filter>
          <clipPath id={`clip${uid}`}>
            <path d={path} />
          </clipPath>
        </defs>
        {/* contact shadow: tighter and darker as the button is pushed down */}
        <ellipse
          cx={cx}
          cy={cy + b * 1.12}
          rx={a * (0.92 + sq * 0.08 - lift * 0.002)}
          ry={b * (0.2 - dd * 0.04)}
          fill="#000"
          opacity={0.55 + dd * 0.2}
          filter={`url(#blur${uid})`}
        />
        <g transform={`translate(${cx} ${cy + sq * b * 0.08 + lift})`}>
          <path d={path} fill={`url(#body${uid})`} />
          <g clipPath={`url(#clip${uid})`}>
            {/* hover: a faint inner warmth */}
            <rect x={-a * 1.2} y={-b * 1.4} width={a * 2.4} height={b * 2.8} fill="#ffcfa8" opacity={0.08 * s.hover} />
            {/* the big window highlight, pushed away from the dent */}
            <ellipse
              cx={-a * 0.36 - s.dx * a * 0.08 * dd}
              cy={-b * 0.5 - s.dy * b * 0.08 * dd}
              rx={a * 0.42 * (1 - dd * 0.12)}
              ry={b * 0.22}
              fill={`url(#spec${uid})`}
              transform={`rotate(-8 ${-a * 0.36} ${-b * 0.5})`}
            />
            <ellipse cx={a * 0.55} cy={-b * 0.52} rx={a * 0.08} ry={b * 0.08} fill={`url(#spec${uid})`} opacity="0.8" />
            {/* the dent itself */}
            <ellipse cx={px} cy={py} rx={r * 0.95} ry={r * 0.82} fill={`url(#dentS${uid})`} />
            <ellipse cx={px} cy={py} rx={r * 0.95} ry={r * 0.82} fill={`url(#dentL${uid})`} />
            {/* a crease ring around the finger */}
            <ellipse cx={px} cy={py} rx={r * 0.5 * dd + 0.01} ry={r * 0.42 * dd + 0.01} fill="none" stroke="#3a0b00" strokeOpacity={0.18 * dd} strokeWidth={a * 0.02} filter={`url(#blur${uid})`} />
            <path d={path} fill={`url(#rim${uid})`} />
          </g>
          {/* the label is printed on the skin: it shifts and shrinks into the dent */}
          <text
            x={px * 0.12 * dd}
            y={b * 0.17 + py * 0.12 * dd}
            textAnchor="middle"
            fontFamily="'Archivo Variable', Archivo, system-ui, sans-serif"
            fontWeight={850}
            fontSize={b * 0.55 * (1 - dd * 0.05)}
            letterSpacing={b * 0.04}
            fill="#fff4ec"
            style={{ paintOrder: 'stroke', stroke: 'rgba(120,30,0,0.35)', strokeWidth: b * 0.02 }}
          >
            {label}
          </text>
        </g>
      </svg>
      <button
        type="button"
        aria-label="Balloon button"
        style={{ position: 'absolute', left: cx - a, top: cy - b, width: a * 2, height: b * 2, opacity: 0, borderRadius: b }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
