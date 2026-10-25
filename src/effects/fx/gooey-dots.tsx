import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Metaball loader. Six drops orbit a core, breathing in and out so they merge into it and
 * pinch off again; a shared "goo" filter turns the overlaps into liquid bridges. The drops are
 * springs, so they stretch on the way out. Hover pulls nearby drops toward you; press to
 * swallow them all into one blob, release to burst them back out.
 */

const K = 6;

interface Dot {
  x: Spring;
  y: Spring;
}
interface S {
  dots: Dot[];
  core: Spring; // core radius factor
  merge: Spring; // 1 = all drops pulled into the core
  t: number;
  phase: number;
  pulls: number;
  lastJoin: boolean[];
}

export const sim = defineSim<S>({
  init: (w, h) => ({
    dots: Array.from({ length: K }, () => ({ x: sp(w / 2), y: sp(h / 2) })),
    core: sp(1),
    merge: sp(0),
    t: 0,
    phase: 0,
    pulls: 0,
    lastJoin: Array(K).fill(true),
  }),
  step(s, f) {
    const { w, h, dt } = f;
    const m = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const R0 = m * 0.25;
    s.t += dt;
    s.phase += dt * (1.1 + s.merge.x * 2);
    spring(s.merge, f.p.down ? 1 : 0, f.p.down ? 120 : 160, f.p.down ? 14 : 8, dt);
    if (f.pressed) f.emit({ name: 'squeak', gain: 0.35, rate: 0.7 });
    if (f.released) f.emit({ name: 'pop', gain: 0.6, rate: 0.8 });
    // the core swells as it swallows drops
    spring(s.core, 1 + clamp(s.merge.x) * 0.55, 200, 9, dt);
    s.dots.forEach((d, i) => {
      const a = s.phase * (i % 2 ? 1 : -0.7) + (i / K) * Math.PI * 2;
      // each drop breathes in and out on its own beat, so they merge and split at different times
      const breathe = 0.5 + 0.5 * Math.sin(s.t * 1.8 + i * 1.05);
      let r = R0 * (0.15 + 0.85 * breathe) * (1 - clamp(s.merge.x)) + R0 * 0.25 * Math.max(0, -s.merge.x) * 3;
      r = Math.max(0, r);
      let tx = cx + Math.cos(a) * r;
      let ty = cy + Math.sin(a) * r;
      if (f.p.over && !f.p.down) {
        // curiosity: drops near the pointer lean toward it
        const dx = f.p.x - tx;
        const dy = f.p.y - ty;
        const dd = Math.hypot(dx, dy);
        const k = clamp(1 - dd / (m * 0.35)) * 0.55;
        tx += dx * k;
        ty += dy * k;
      }
      spring(d.x, tx, 70, f.reduced ? 20 : 7, dt);
      spring(d.y, ty, 70, f.reduced ? 20 : 7, dt);
      // a soft blip each time a drop pinches off the core
      const joined = Math.hypot(d.x.x - cx, d.y.x - cy) < m * 0.11;
      if (!joined && s.lastJoin[i] && s.pulls <= 0) {
        f.emit({ name: 'drip', gain: 0.12, rate: 1.2 + i * 0.07 });
        s.pulls = 0.25;
      }
      s.lastJoin[i] = joined;
    });
    s.pulls = Math.max(0, s.pulls - dt);
  },
});

export default function GooeyDots() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const m = Math.min(w, h);
  const cx = w / 2;
  const cy = h / 2;
  const rCore = m * 0.085 * s.core.x;
  const rDot = m * 0.048;
  const blur = m * 0.022;
  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(100% 90% at 50% 35%, #fff8ef 0%, #f6e9da 60%, #e9d6c2 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`g${uid}`} gradientUnits="userSpaceOnUse" x1={cx - m * 0.3} y1={cy - m * 0.3} x2={cx + m * 0.3} y2={cy + m * 0.3}>
            <stop offset="0" stopColor="#ffb238" />
            <stop offset="0.55" stopColor="#ff5a36" />
            <stop offset="1" stopColor="#e0245e" />
          </linearGradient>
          <filter id={`goo${uid}`} x="0" y="0" width={w} height={h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="goo" />
            <feGaussianBlur in="goo" stdDeviation={blur * 0.8} result="gb" />
            <feSpecularLighting in="gb" surfaceScale={m * 0.014} specularConstant="1" specularExponent="26" lightingColor="#fff" result="spec">
              <feDistantLight azimuth="225" elevation="50" />
            </feSpecularLighting>
            <feComposite in="spec" in2="goo" operator="in" result="specIn" />
            <feMerge>
              <feMergeNode in="goo" />
              <feMergeNode in="specIn" />
            </feMerge>
          </filter>
          <filter id={`sh${uid}`} x="0" y="0" width={w} height={h} filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation={m * 0.03} />
          </filter>
        </defs>
        {/* a soft coloured shadow on the table */}
        <g filter={`url(#sh${uid})`} opacity={0.3} transform={`translate(0 ${m * 0.04})`}>
          <circle cx={cx} cy={cy} r={rCore} fill="#b0301a" />
          {s.dots.map((d, i) => (
            <circle key={i} cx={d.x.x} cy={d.y.x} r={rDot} fill="#b0301a" />
          ))}
        </g>
        <g filter={`url(#goo${uid})`} fill={`url(#g${uid})`}>
          <circle cx={cx} cy={cy} r={rCore} />
          {s.dots.map((d, i) => {
            // stretch each drop along its velocity
            const v = Math.hypot(d.x.v, d.y.v);
            const st = clamp(v / (m * 5), 0, 0.5);
            const ang = (Math.atan2(d.y.v, d.x.v) * 180) / Math.PI;
            return <ellipse key={i} rx={rDot * (1 + st)} ry={rDot * (1 - st * 0.4)} transform={`translate(${d.x.x} ${d.y.x}) rotate(${ang})`} />;
          })}
        </g>
        <text x={cx} y={cy + m * 0.38} textAnchor="middle" fontFamily="'JetBrains Mono Variable', monospace" fontSize={Math.max(10, m * 0.03)} fill="#a0634a" letterSpacing="0.18em">
          {`LOADING${'.'.repeat(1 + (Math.floor(fx.t * 2.5) % 3))}`}
        </text>
      </svg>
    </Stage>
  );
}
