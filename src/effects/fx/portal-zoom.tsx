import { useId } from 'react';
import type { ReactNode } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * An endless zoom through windows. Each scene holds a window (same shape as the screen) that
 * shows the next scene; the camera zooms exponentially about the zoom's fixed point, so when the
 * window fills the frame the next scene is exactly in place and the loop carries on.
 * Tap to dive in, or drag upwards to scrub the zoom yourself.
 */

const SCENES = 3;

interface S {
  cur: number;
  z: Spring; // 0 at rest .. 1 = the window fills the frame
  target: number;
  drag: boolean;
  y0: number;
  moved: number;
  idle: number;
  auto: number;
  dived: boolean;
}

/** where each scene keeps its window, as fractions of the stage (height follows the aspect) */
const PORTAL = [
  { x: 0.36, y: 0.22, s: 0.28 },
  { x: 0.56, y: 0.38, s: 0.17 },
  { x: 0.33, y: 0.25, s: 0.3 },
];
const portal = (i: number, w: number, h: number) => {
  const p = PORTAL[i % SCENES];
  return { x: p.x * w, y: p.y * h, w: p.s * w, h: p.s * h, k: 1 / p.s };
};

export const sim = defineSim<S>({
  init: () => ({ cur: 0, z: sp(), target: 0, drag: false, y0: 0, moved: 0, idle: 0, auto: 0, dived: false }),
  step(s, f) {
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    let dive = false;
    if (f.pressed) {
      s.drag = true;
      s.y0 = f.p.y;
      s.moved = 0;
    }
    for (const a of f.actions) if (a.type === 'dive') dive = true;
    if (s.drag) {
      const d = (s.y0 - f.p.y) / (f.h * 0.7);
      s.moved = Math.max(s.moved, Math.abs(s.y0 - f.p.y));
      if (s.moved > 8) s.target = clamp(d, 0, 1);
      if (!f.p.down) {
        s.drag = false;
        if (s.moved <= 8 || s.z.x > 0.3) dive = true;
        else s.target = 0;
      }
    }
    if (s.idle > 1.4 && !s.drag) {
      s.auto += f.dt;
      if (s.auto > 2.2) {
        s.auto = 0;
        dive = true;
      }
    } else s.auto = 1.2;
    if (dive && !s.dived) {
      s.dived = true;
      s.target = 1;
      f.emit({ name: 'whoosh', gain: 0.6, rate: 0.9 });
    }
    spring(s.z, s.target, s.drag ? 200 : 16, s.drag ? 28 : f.reduced ? 9 : 6.5, f.dt);
    // through the window: the next scene is now the room we stand in
    if (s.z.x >= 1) {
      s.z.x -= 1;
      s.cur = (s.cur + 1) % SCENES;
      s.target = 0;
      s.dived = false;
      if (s.drag) s.y0 -= f.h * 0.7;
      f.emit({ name: 'glass', gain: 0.4, rate: 1.2 });
    }
  },
});

function Scene({ i, w, h, uid, depth }: { i: number; w: number; h: number; uid: string; depth: number }): ReactNode {
  const m = Math.min(w, h);
  const P = portal(i, w, h);
  const inner =
    depth < 2 ? (
      <g transform={`translate(${P.x} ${P.y}) scale(${P.w / w})`}>
        <g clipPath={`url(#clip${uid})`}>
          <Scene i={i + 1} w={w} h={h} uid={uid} depth={depth + 1} />
        </g>
      </g>
    ) : (
      <rect x={P.x} y={P.y} width={P.w} height={P.h} fill="#888" />
    );
  const bw = P.w * 0.06; // frame width
  if (i % SCENES === 0)
    // a gallery wall with one framed picture under a spotlight
    return (
      <g>
        <rect width={w} height={h} fill={`url(#wall${uid})`} />
        <rect y={h * 0.78} width={w} height={h * 0.22} fill="#2a1c14" />
        <rect y={h * 0.78} width={w} height={h * 0.012} fill="#4a3426" />
        <path d={`M${P.x + P.w / 2 - m * 0.04},0 L${P.x - P.w * 0.4},${h * 0.78} L${P.x + P.w * 1.4},${h * 0.78} L${P.x + P.w / 2 + m * 0.04},0 Z`} fill="#fff6dc" opacity="0.08" />
        <rect x={P.x - bw} y={P.y - bw + m * 0.02} width={P.w + bw * 2} height={P.h + bw * 2} fill="#000" opacity="0.4" filter={`url(#blur${uid})`} />
        <rect x={P.x - bw} y={P.y - bw} width={P.w + bw * 2} height={P.h + bw * 2} fill={`url(#gold${uid})`} />
        <rect x={P.x - bw * 0.35} y={P.y - bw * 0.35} width={P.w + bw * 0.7} height={P.h + bw * 0.7} fill="#f3ead8" />
        {inner}
        <rect x={P.x + P.w * 0.3} y={P.y + P.h + bw * 2.2} width={P.w * 0.4} height={P.h * 0.12} fill="#e9dfc9" />
        {/* a bench and a visitor silhouette */}
        <rect x={w * 0.2} y={h * 0.7} width={w * 0.3} height={h * 0.03} rx={2} fill="#140d09" />
        <rect x={w * 0.22} y={h * 0.73} width={w * 0.01} height={h * 0.05} fill="#140d09" />
        <rect x={w * 0.47} y={h * 0.73} width={w * 0.01} height={h * 0.05} fill="#140d09" />
        <g fill="#0e0907">
          <circle cx={w * 0.72} cy={h * 0.47} r={m * 0.035} />
          <path d={`M${w * 0.68},${h * 0.78} L${w * 0.69},${h * 0.52} Q${w * 0.72},${h * 0.5} ${w * 0.75},${h * 0.52} L${w * 0.76},${h * 0.78} Z`} />
        </g>
      </g>
    );
  if (i % SCENES === 1)
    // a city at dusk; one high window glows
    return (
      <g>
        <rect width={w} height={h} fill={`url(#dusk${uid})`} />
        <circle cx={w * 0.2} cy={h * 0.25} r={m * 0.06} fill="#ffe9c7" opacity="0.9" />
        {Array.from({ length: 12 }, (_, k) => {
          const bx = (k / 12) * w;
          const bh2 = h * (0.3 + 0.25 * Math.abs(Math.sin(k * 1.9)));
          return <rect key={k} x={bx} y={h - bh2} width={w / 12 - 2} height={bh2} fill={k % 2 ? '#1d1838' : '#241d44'} />;
        })}
        {/* the tower with the window */}
        <rect x={P.x - P.w * 0.6} y={P.y - P.h * 0.8} width={P.w * 2.2} height={h} fill="#2c2550" />
        {Array.from({ length: 30 }, (_, k) => (
          <rect key={k} x={P.x - P.w * 0.45 + (k % 5) * P.w * 0.42} y={P.y - P.h * 0.6 + Math.floor(k / 5) * P.h * 0.7 + (k % 5 === 2 || k % 5 === 1 ? 0 : 0)} width={P.w * 0.25} height={P.h * 0.35} fill="#ffcf6e" opacity={(k * 7) % 3 === 0 ? 0.8 : 0.12} />
        ))}
        <rect x={P.x - P.w * 0.1} y={P.y - P.h * 0.1} width={P.w * 1.2} height={P.h * 1.2} fill="#ffcf6e" opacity="0.35" filter={`url(#blur${uid})`} />
        <rect x={P.x - bw * 0.5} y={P.y - bw * 0.5} width={P.w + bw} height={P.h + bw} fill="#141029" />
        {inner}
      </g>
    );
  // a desk with a laptop; the screen is the window
  return (
    <g>
      <rect width={w} height={h} fill={`url(#desk${uid})`} />
      <rect y={h * 0.82} width={w} height={h * 0.18} fill="#c79a6b" />
      <rect y={h * 0.82} width={w} height={h * 0.01} fill="#e3b989" />
      <rect x={P.x - bw * 1.2} y={P.y - bw * 1.2} width={P.w + bw * 2.4} height={P.h + bw * 2.4} rx={bw} fill="#202227" />
      {inner}
      <path d={`M${P.x - bw * 3},${h * 0.82} L${P.x - bw * 1.2},${P.y + P.h + bw * 1.2} L${P.x + P.w + bw * 1.2},${P.y + P.h + bw * 1.2} L${P.x + P.w + bw * 3},${h * 0.82} Z`} fill="#b9bcc4" />
      <rect x={P.x - bw * 3.3} y={h * 0.82 - h * 0.012} width={P.w + bw * 6.6} height={h * 0.014} rx={3} fill="#8d9099" />
      {/* plant and mug */}
      <rect x={w * 0.78} y={h * 0.66} width={w * 0.06} height={h * 0.16} rx={4} fill="#e8e1d6" />
      <ellipse cx={w * 0.81} cy={h * 0.6} rx={w * 0.05} ry={h * 0.09} fill="#3f8a5a" />
      <ellipse cx={w * 0.84} cy={h * 0.55} rx={w * 0.03} ry={h * 0.07} fill="#56a872" />
      <rect x={w * 0.12} y={h * 0.74} width={w * 0.05} height={h * 0.08} rx={3} fill="#e45b4b" />
    </g>
  );
}

export default function PortalZoom() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const m = Math.min(w, h);
  const P = portal(s.cur, w, h);
  const z = clamp(s.z.x, -0.2, 1);
  // pure exponential zoom about the fixed point of the window → screen mapping
  const K = P.k;
  const Fx = (P.x * K) / (K - 1);
  const Fy = (P.y * K) / (K - 1);
  const S = Math.pow(K, z);
  const speed = clamp(Math.abs(s.z.v) * 0.6);

  return (
    <Stage fx={fx} cursor="zoom-in" style={{ background: '#000' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <clipPath id={`clip${uid}`}>
            <rect width={w} height={h} />
          </clipPath>
          <linearGradient id={`wall${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f4b4a" />
            <stop offset="1" stopColor="#123332" />
          </linearGradient>
          <linearGradient id={`gold${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6d58a" />
            <stop offset="0.5" stopColor="#b9862e" />
            <stop offset="1" stopColor="#f0c76a" />
          </linearGradient>
          <linearGradient id={`dusk${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b1f5c" />
            <stop offset="0.6" stopColor="#c0507a" />
            <stop offset="1" stopColor="#ff9b6a" />
          </linearGradient>
          <linearGradient id={`desk${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2e6d4" />
            <stop offset="1" stopColor="#dcc8ad" />
          </linearGradient>
          <filter id={`blur${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.02} />
          </filter>
          <radialGradient id={`vig${uid}`} cx="50%" cy="50%" r="70%">
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity={0.35 + speed * 0.4} />
          </radialGradient>
        </defs>
        <g transform={`translate(${Fx} ${Fy}) scale(${S}) translate(${-Fx} ${-Fy})`}>
          <Scene i={s.cur} w={w} h={h} uid={uid} depth={0} />
        </g>
        <rect width={w} height={h} fill={`url(#vig${uid})`} />
        {/* speed streaks radiating from the zoom point while flying */}
        {speed > 0.05 &&
          Array.from({ length: 18 }, (_, k) => {
            const a = (k / 18) * Math.PI * 2 + k;
            const r0 = m * (0.35 + ((k * 37) % 10) / 20);
            const r1 = r0 + m * 0.25 * speed;
            return <line key={k} x1={Fx + Math.cos(a) * r0} y1={Fy + Math.sin(a) * r0} x2={Fx + Math.cos(a) * r1} y2={Fy + Math.sin(a) * r1} stroke="#fff" strokeOpacity={0.25 * speed} strokeWidth={Math.max(1, m * 0.003)} strokeLinecap="round" />;
          })}
      </svg>
      <button
        type="button"
        aria-label="Zoom through the window"
        style={{ position: 'absolute', inset: 0, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'dive' });
          }
        }}
      />
    </Stage>
  );
}
