import { useId } from 'react';
import type { ReactElement } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * Velvet stage curtains. Each curtain is a row of folds on their own springs: the leading edge
 * is pulled, the folds behind it bunch up and follow a moment later, and the hems swing with the
 * motion and settle. Narrow (bunched) folds shade deeper, like real velvet.
 * Tap to open or close, or drag the curtains apart from the middle.
 */

const K = 14; // folds per curtain

interface S {
  open: number; // target 0 closed .. 1 open
  lead: Spring; // leading edge position 0..1
  folds: Spring[]; // fold seams, fraction of the half width (0 = outside edge)
  swing: Spring[]; // hem swing per seam, px
  drag: boolean;
  dx: number;
  l0: number;
  moved: number;
  idle: number;
  auto: number;
  moving: boolean;
}

export const sim = defineSim<S>({
  init: () => ({
    open: 0,
    lead: sp(0),
    folds: Array.from({ length: K + 1 }, (_, i) => sp(i / K)),
    swing: Array.from({ length: K + 1 }, () => sp()),
    drag: false,
    dx: 0,
    l0: 0,
    moved: 0,
    idle: 0,
    auto: 0.4,
    moving: false,
  }),
  step(s, f) {
    const half = f.w / 2;
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    let toggle = false;
    if (f.pressed) {
      s.drag = true;
      s.dx = Math.abs(f.p.x - half);
      s.l0 = s.open;
      s.moved = 0;
    }
    for (const a of f.actions) if (a.type === 'toggle') toggle = true;
    if (s.drag) {
      const d = Math.abs(f.p.x - half) - s.dx;
      s.moved = Math.max(s.moved, Math.abs(d));
      if (s.moved > 8) s.open = clamp(s.l0 + d / (half * 0.86));
      if (!f.p.down) {
        s.drag = false;
        if (s.moved <= 8) toggle = true;
        else s.open = s.open > 0.5 ? 1 : 0;
      }
    }
    if (s.idle > 1.2 && !s.drag) {
      s.auto += f.dt;
      if (s.auto > (s.open > 0.5 ? 2.6 : 1.4)) {
        s.auto = 0;
        toggle = true;
      }
    } else s.auto = 0;
    if (toggle) {
      s.open = s.open > 0.5 ? 0 : 1;
      f.emit({ name: 'rustle', gain: 0.55, rate: 0.9 + f.rand() * 0.2 });
    }
    const pv = s.lead.v;
    spring(s.lead, s.open, s.drag ? 220 : 26, s.drag ? 26 : f.reduced ? 14 : 8, f.dt);
    if (Math.abs(s.lead.v) > 0.6 && Math.abs(pv) <= 0.6 && !s.moving) {
      s.moving = true;
      f.emit({ name: 'whoosh', gain: 0.3, rate: 0.7 });
    } else if (Math.abs(s.lead.v) < 0.1) s.moving = false;
    // the edge position as a fraction of the half-width the cloth still spans
    const span = 1 - clamp(s.lead.x, -0.05, 1.05) * 0.86;
    for (let i = 0; i <= K; i++) {
      const u = i / K;
      // seams further from the leading edge respond later (cloth drags behind)
      const k = lerp(40, 160, u);
      spring(s.folds[i], u * span, k, f.reduced ? 18 : lerp(7, 12, u), f.dt);
      // the hem swings opposite to the motion and pendulums back
      spring(s.swing[i], -s.folds[i].v * half * 0.09 * u, 60, f.reduced ? 20 : 4, f.dt);
    }
  },
});

export default function Curtain() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const m = Math.min(w, h);
  const half = w / 2;
  const top = h * 0.12;
  const bot = h * 0.99;
  const o = clamp(s.lead.x);
  const spotOn = clamp((o - 0.2) / 0.5);

  const curtain = (side: -1 | 1) => {
    const out: ReactElement[] = [];
    for (let i = 0; i < K; i++) {
      const a = s.folds[i].x;
      const b = s.folds[i + 1].x;
      // x from the outside edge inwards, mirrored for the right curtain
      const X = (u: number) => (side < 0 ? u * half : w - u * half);
      const xa = X(a);
      const xb = X(b);
      const sa = s.swing[i].x * -side;
      const sb = s.swing[i + 1].x * -side;
      const width = Math.abs(xb - xa);
      const nominal = half / K;
      const crush = clamp(1 - width / nominal); // bunched folds are darker
      const hem = bot + m * 0.012 * Math.sin(i * 1.7 + t * 0.6);
      const mid = (top + hem) / 2;
      out.push(
        <path
          key={i}
          d={`M${xa},${top} L${xb},${top} C${xb},${mid} ${xb + sb * 0.6},${mid} ${xb + sb},${hem} Q${(xa + xb) / 2 + (sa + sb) / 2},${hem + m * 0.025} ${xa + sa},${hem} C${xa + sa * 0.6},${mid} ${xa},${mid} ${xa},${top} Z`}
          fill={`url(#fold${uid})`}
          stroke="#2a0306"
          strokeOpacity={0.25 + crush * 0.3}
          strokeWidth={0.6}
        />,
      );
      if (crush > 0.02)
        out.push(<path key={`c${i}`} d={`M${xa},${top} L${xb},${top} L${xb + sb},${hem} L${xa + sa},${hem} Z`} fill="#1a0004" opacity={crush * 0.45} />);
    }
    return out;
  };

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#0b0405' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`fold${uid}`} x1="0" y1="0" x2="1" y2="0">
            {/* a velvet tube: dark valleys, a soft sheen just off-centre */}
            <stop offset="0" stopColor="#3b040b" />
            <stop offset="0.3" stopColor="#8e0f1f" />
            <stop offset="0.48" stopColor="#c6283a" />
            <stop offset="0.62" stopColor="#9c1424" />
            <stop offset="1" stopColor="#3b040b" />
          </linearGradient>
          <linearGradient id={`curtV${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.55" />
            <stop offset="0.25" stopColor="#000" stopOpacity="0" />
            <stop offset="0.8" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id={`stage${uid}`} cx="50%" cy="60%" r="60%">
            <stop offset="0" stopColor="#3a2a4a" />
            <stop offset="1" stopColor="#0e0912" />
          </radialGradient>
          <linearGradient id={`floor${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b2416" />
            <stop offset="1" stopColor="#1a0f09" />
          </linearGradient>
          <linearGradient id={`beam${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3d1" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff3d1" stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id={`pool${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff1c9" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff1c9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`gold${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6d27a" />
            <stop offset="0.5" stopColor="#a8761f" />
            <stop offset="1" stopColor="#f0c060" />
          </linearGradient>
          <filter id={`soft${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.03} />
          </filter>
        </defs>
        {/* the stage behind */}
        <rect width={w} height={h} fill={`url(#stage${uid})`} />
        <rect y={h * 0.74} width={w} height={h * 0.26} fill={`url(#floor${uid})`} />
        {Array.from({ length: 12 }, (_, k) => (
          <line key={k} x1={w / 2 + (k - 5.5) * w * 0.02} y1={h * 0.74} x2={w / 2 + (k - 5.5) * w * 0.16} y2={h} stroke="#000" strokeOpacity="0.25" />
        ))}
        <g opacity={spotOn}>
          <path d={`M${w * 0.47},${top} L${w * 0.53},${top} L${w * 0.66},${h * 0.86} L${w * 0.34},${h * 0.86} Z`} fill={`url(#beam${uid})`} />
          <ellipse cx={w / 2} cy={h * 0.86} rx={w * 0.17} ry={h * 0.05} fill={`url(#pool${uid})`} />
        </g>
        <text x={w / 2} y={h * 0.52} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={900} fontSize={Math.min(w * 0.12, m * 0.16)} fill="#ffe9b8" opacity={0.25 + spotOn * 0.75} style={{ filter: `drop-shadow(0 0 ${m * 0.03}px rgba(255,200,120,${0.6 * spotOn}))` }}>
          TONIGHT
        </text>
        <text x={w / 2} y={h * 0.52 + m * 0.07} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontWeight={600} fontSize={m * 0.032} letterSpacing={m * 0.012} fill="#e7c9a0" opacity={0.2 + spotOn * 0.7}>
          THE GRAND PREMIERE
        </text>
        {/* footlights */}
        {Array.from({ length: 9 }, (_, k) => (
          <circle key={k} cx={((k + 0.5) / 9) * w} cy={h * 0.985} r={m * 0.05} fill="#ffcf7a" opacity={0.12 + spotOn * 0.15} filter={`url(#soft${uid})`} />
        ))}
        {/* curtains, then their vertical shading */}
        {curtain(-1)}
        {curtain(1)}
        <rect y={top} width={w} height={h - top} fill={`url(#curtV${uid})`} pointerEvents="none" />
        {/* the valance: a pelmet with scalloped swags and gold fringe */}
        <rect width={w} height={top} fill="#5a0812" />
        {Array.from({ length: 7 }, (_, k) => {
          const x0 = (k / 7) * w;
          const x1 = ((k + 1) / 7) * w;
          return (
            <g key={k}>
              <path d={`M${x0},${top * 0.6} Q${(x0 + x1) / 2},${top * 1.55} ${x1},${top * 0.6} L${x1},0 L${x0},0 Z`} fill={`url(#fold${uid})`} />
              <path d={`M${x0},${top * 0.6} Q${(x0 + x1) / 2},${top * 1.55} ${x1},${top * 0.6}`} fill="none" stroke={`url(#gold${uid})`} strokeWidth={m * 0.01} />
            </g>
          );
        })}
        <rect width={w} height={top * 0.22} fill={`url(#gold${uid})`} />
      </svg>
      <button
        type="button"
        aria-pressed={s.open > 0.5}
        aria-label={s.open > 0.5 ? 'Close the curtains' : 'Open the curtains'}
        style={{ position: 'absolute', inset: 0, opacity: 0 }}
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
