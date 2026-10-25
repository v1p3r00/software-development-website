import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * The moment a payment goes through. Press the pill: it squeezes into a circle and spins while
 * "processing"; then the circle floods green and swells past its size (spring overshoot), the
 * check mark draws itself stroke-first, two shock rings ripple out and fade, and a burst of
 * particles flies off with air drag and a little gravity, twinkling as they slow. A caption
 * rises in, and after a beat the button resets. Idle, it plays itself.
 */

interface Pt {
  a: number;
  v: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  c: number;
  r: number;
  star: boolean;
}
interface S {
  phase: number; // 0 button, 1 processing, 2 success
  pt: number; // seconds in phase
  W: Spring; // pill width (base px)
  D: Spring; // pill height / circle diameter
  green: Spring;
  press: Spring;
  hover: number;
  ps: Pt[];
  idle: number;
  t: number;
}
const COLS = ['#34d399', '#a7f3d0', '#fde68a', '#93c5fd', '#f9a8d4', '#ffffff'];
const unit = (w: number, h: number) => clamp(Math.min(w / 420, h / 360), 0.6, 2.4);

export const sim = defineSim<S>({
  init: () => ({ phase: 0, pt: 0, W: sp(230), D: sp(58), green: sp(), press: sp(), hover: 0, ps: [], idle: 1, t: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const u = unit(w, h);
    const cx = w / 2, cy = h * 0.46;
    s.t += dt;
    s.pt += dt;
    const on = Math.abs(p.x - cx) < (s.W.x * u) / 2 && Math.abs(p.y - cy) < (s.D.x * u) / 2;
    s.hover += ((on && p.over && s.phase === 0 ? 1 : 0) - s.hover) * (1 - Math.exp(-12 * dt));
    s.idle = p.over && on ? 0 : s.idle + dt;
    const start = () => {
      s.phase = 1;
      s.pt = 0;
      f.emit({ name: 'click', gain: 0.5 });
    };
    if (s.phase === 0) {
      if ((f.released && on) || f.actions.some((a) => a.type === 'pay') || (s.idle > 2.5 && s.pt > 1.2)) start();
    } else if (s.phase === 1 && s.pt > 0.9) {
      s.phase = 2;
      s.pt = 0;
      s.D.v += f.reduced ? 80 : 420; // the swell
      f.emit({ name: 'success', gain: 0.8 });
      f.emit({ name: 'spark', gain: 0.4, rate: 1.2 });
      for (let i = 0; i < 46; i++) {
        const a = (i / 46) * Math.PI * 2 + (f.rand() - 0.5) * 0.25;
        const v = (240 + f.rand() * 380) * u;
        s.ps.push({ a, v, x: Math.cos(a) * 44 * u, y: Math.sin(a) * 44 * u, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: Math.floor(f.rand() * COLS.length), r: (2 + f.rand() * 3.5) * u, star: f.rand() < 0.3 });
      }
    } else if (s.phase === 2 && s.pt > 2.8) {
      s.phase = 0;
      s.pt = 0;
      f.emit({ name: 'tick', gain: 0.2 });
    }
    spring(s.press, p.down && on && s.phase === 0 ? 1 : 0, 500, 24, dt);
    const tw = s.phase === 0 ? 230 : s.phase === 1 ? 58 : 96;
    const td = s.phase === 0 ? 58 : s.phase === 1 ? 58 : 96;
    // squeeze is quick and firm; the success swell is bouncy
    spring(s.W, tw, s.phase === 2 ? 240 : 300, s.phase === 2 ? 13 : 24, dt);
    spring(s.D, td, s.phase === 2 ? 240 : 300, s.phase === 2 ? 13 : 24, dt);
    spring(s.green, s.phase === 2 ? 1 : 0, 200, 22, dt);
    for (const q of s.ps) {
      const d = Math.exp(-3.2 * dt); // air drag
      q.vx *= d;
      q.vy = q.vy * d + 260 * u * dt; // and a little gravity
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.life -= dt * 0.75;
    }
    s.ps = s.ps.filter((q) => q.life > 0);
  },
});

export default function SuccessBurst() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const u = unit(w, h);
  const cx = w / 2, cy = h * 0.46;
  const W = s.W.x * u * (1 - s.press.x * 0.04), D = s.D.x * u * (1 - s.press.x * 0.04);
  const g = clamp(s.green.x);
  const font = "'Inter Variable', Inter, system-ui";
  const pt = s.pt;
  const draw = s.phase === 2 ? clamp((pt - 0.12) / 0.35) : 0;
  const ease = 1 - Math.pow(1 - draw, 3);
  const ring = (delay: number) => {
    const k = s.phase === 2 ? clamp((pt - delay) / 0.9) : 0;
    return { r: (48 + k * 120) * u, o: k > 0 && k < 1 ? (1 - k) ** 1.5 : 0, sw: (6 * (1 - k) + 1) * u };
  };
  const r1 = ring(0.05), r2 = ring(0.2);
  const caption = s.phase === 2 ? clamp((pt - 0.35) / 0.4) : 0;
  const bg = `rgb(${Math.round(lerp(79, 16, g))},${Math.round(lerp(70, 185, g))},${Math.round(lerp(229, 129, g))})`;
  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(110% 90% at 50% 30%, #1d2235 0%, #0d0f18 65%, #07080d 100%)' }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`glow${uid}`}>
            <stop offset="0" stopColor="#34d399" stopOpacity={0.45 * g} />
            <stop offset="1" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`face${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={200 * u} fill={`url(#glow${uid})`} />
        {[r1, r2].map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r.r} fill="none" stroke="#34d399" strokeWidth={r.sw} opacity={r.o} />
        ))}
        {/* particles: dots and little four-point stars that twinkle as they slow */}
        {s.ps.map((q, i) => {
          const x = cx + q.x, y = cy + q.y;
          const tw = q.star ? 0.6 + 0.4 * Math.sin(s.t * 30 + i) : 1;
          const r = q.r * (0.4 + q.life * 0.6) * tw;
          return q.star ? (
            <path key={i} d={`M${x} ${y - r * 2}L${x + r * 0.5} ${y - r * 0.5}L${x + r * 2} ${y}L${x + r * 0.5} ${y + r * 0.5}L${x} ${y + r * 2}L${x - r * 0.5} ${y + r * 0.5}L${x - r * 2} ${y}L${x - r * 0.5} ${y - r * 0.5}Z`} fill={COLS[q.c]} opacity={Math.min(1, q.life * 1.6)} />
          ) : (
            <circle key={i} cx={x} cy={y} r={r} fill={COLS[q.c]} opacity={Math.min(1, q.life * 1.6)} />
          );
        })}
        {/* the pill / circle */}
        <ellipse cx={cx} cy={cy + D * 0.62} rx={W * 0.42} ry={D * 0.1} fill="#000" opacity="0.35" />
        <rect x={cx - W / 2} y={cy - D / 2} width={W} height={D} rx={D / 2} fill={bg} />
        <rect x={cx - W / 2} y={cy - D / 2} width={W} height={D} rx={D / 2} fill={`url(#face${uid})`} />
        <rect x={cx - W / 2 + 0.5} y={cy - D / 2 + 0.5} width={W - 1} height={D - 1} rx={D / 2} fill="none" stroke="rgba(255,255,255,0.18)" />
        {s.phase === 1 && (
          <circle cx={cx} cy={cy} r={D * 0.28} fill="none" stroke="#fff" strokeWidth={3 * u} strokeLinecap="round" strokeDasharray={`${D * 0.5} ${D * 2}`} transform={`rotate(${(pt * 540) % 360} ${cx} ${cy})`} opacity={clamp(pt / 0.2)} />
        )}
        {s.phase === 2 && (
          <path
            d={`M${cx - D * 0.2} ${cy + D * 0.01} L${cx - D * 0.05} ${cy + D * 0.16} L${cx + D * 0.23} ${cy - D * 0.15}`}
            fill="none"
            stroke="#fff"
            strokeWidth={Math.max(3, D * 0.085)}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ease}
          />
        )}
      </svg>
      {/* the label lives in the pill until it squeezes */}
      <div
        style={{
          position: 'absolute',
          left: cx - W / 2,
          top: cy - D / 2,
          width: W,
          height: D,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontFamily: font,
          fontWeight: 650,
          fontSize: 17 * u,
          opacity: s.phase === 0 ? clamp((s.W.x - 150) / 70) : 0,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transform: `translateY(${-s.hover * 1}px)`,
        }}
      >
        Pay €249.00
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy + 80 * u, textAlign: 'center', fontFamily: font, opacity: caption, transform: `translateY(${(1 - caption) * 14 * u}px)` }}>
        <div style={{ fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: 22 * u, color: '#ecfdf5' }}>Payment successful</div>
        <div style={{ fontSize: 13.5 * u, color: '#8b93a7', marginTop: 4 * u }}>Receipt sent to you@example.com</div>
      </div>
      <button
        type="button"
        aria-label="Pay €249.00"
        style={{ position: 'absolute', left: cx - W / 2, top: cy - D / 2, width: W, height: D, opacity: 0, borderRadius: D / 2, cursor: 'pointer' }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'pay' });
          }
        }}
      />
    </Stage>
  );
}
