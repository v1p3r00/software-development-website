import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, lerp, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * A liquid swipe. The next page waits as a small drop on the right edge; pull it and the drop
 * swells into a wave that follows your finger up and down, then floods the screen. The wave's
 * width, height and side strip each ride their own spring, so the liquid lags, bulges and
 * jiggles. Let go early and it slurps back.
 */

const PAGES = [
  { bg: '#ff5e5b', deep: '#c93b48', ink: '#fff6ef', title: 'Discover', sub: 'Places worth the trip', shape: 0 },
  { bg: '#ffd166', deep: '#e8a93a', ink: '#2a1d05', title: 'Collect', sub: 'Save what you love', shape: 1 },
  { bg: '#3a86ff', deep: '#2556c9', ink: '#f2f7ff', title: 'Share', sub: 'Plans with friends', shape: 2 },
  { bg: '#06d6a0', deep: '#05a07a', ink: '#022a20', title: 'Go', sub: 'Let’s get moving', shape: 0 },
];

interface S {
  cur: number;
  p: Spring; // pull 0..1
  target: number;
  hr: Spring; // horizontal radius of the wave, px
  vr: Spring; // vertical radius
  cy: Spring; // wave centre y
  drag: boolean;
  x0: number;
  pop: Spring; // the next drop popping in after a swap
  idle: number;
  auto: number;
  done: boolean;
}

export const sim = defineSim<S>({
  init: (w, h) => ({ cur: 0, p: sp(), target: 0, hr: sp(Math.min(w, h) * 0.07), vr: sp(Math.min(w, h) * 0.2), cy: sp(h * 0.62), drag: false, x0: 0, pop: sp(1), idle: 0, auto: 0, done: false }),
  step(s, f) {
    const { w, h } = f;
    const m = Math.min(w, h);
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    let wantY = h * 0.62;
    if (f.pressed && s.target < 1) {
      s.drag = true;
      s.x0 = Math.max(f.p.x, w * 0.6);
      s.auto = 0;
      f.emit({ name: 'drip', gain: 0.4, rate: 0.9 });
    }
    for (const a of f.actions) if (a.type === 'next' && s.target === 0) s.target = 1;
    if (s.drag) {
      s.target = clamp((s.x0 - f.p.x) / (w * 0.8), 0, 1);
      wantY = f.p.y;
      if (!f.p.down) {
        s.drag = false;
        // a flick or a long pull commits; otherwise the liquid slurps back
        s.target = s.p.x > 0.3 || f.p.vx < -w * 0.8 ? 1 : 0;
        f.emit({ name: s.target ? 'swoosh' : 'drip', gain: 0.5, rate: s.target ? 1 : 1.2 });
      }
    } else if ((s.idle > 1.1 && s.target === 0) || s.auto > 0) {
      // self-demo: a phantom thumb pulls the drop, sweeping a little up as it goes
      s.auto += f.dt;
      const u = clamp((s.auto - 0.3) / 0.9);
      s.target = smooth(u) * 0.45;
      wantY = lerp(h * 0.62, h * 0.42, smooth(u));
      if (u >= 1) {
        s.target = 1;
        s.auto = 0;
        f.emit({ name: 'swoosh', gain: 0.5 });
      }
    } else if (s.target === 1) wantY = s.cy.x;
    const k = s.drag ? 300 : s.target === 1 ? 45 : 120;
    spring(s.p, s.target, k, s.drag ? 30 : f.reduced ? 20 : 9, f.dt);
    const p = clamp(s.p.x, -0.2, 1);
    // the wave grows fast at first (a bulge), then the side strip takes over
    const breathe = Math.sin(f.t * 2.2) * m * 0.006;
    spring(s.hr, m * 0.07 + breathe + w * 0.5 * smooth(p * 1.6), 160, f.reduced ? 30 : 10, f.dt);
    spring(s.vr, m * 0.2 + h * 0.75 * smooth(p * 1.3), 120, f.reduced ? 30 : 10, f.dt);
    spring(s.cy, wantY, s.drag ? 260 : 60, s.drag ? 24 : 9, f.dt);
    spring(s.pop, 1, 260, 11, f.dt);
    // filled the screen: the next page becomes current, and a fresh drop pops in
    if (s.target === 1 && s.p.x > 0.985) {
      s.cur = (s.cur + 1) % PAGES.length;
      s.target = 0;
      s.p.x = 0;
      s.p.v = 0;
      s.hr.x = 0;
      s.hr.v = 0;
      s.vr.x = m * 0.1;
      s.pop.x = 0;
      s.idle = 0;
      f.emit({ name: 'pop', gain: 0.4, rate: 1.3 });
    }
  },
});

/** the liquid edge: a side strip plus a smooth cosine bump around cy */
function wavePath(w: number, h: number, sw: number, hr: number, vr: number, cy: number) {
  let d = `M${w + 2},${-2}`;
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const y = (i / n) * h;
    const u = (y - cy) / vr;
    const bump = Math.abs(u) < 1 ? (1 + Math.cos(Math.PI * u)) / 2 : 0;
    const x = w - sw - hr * bump;
    d += `L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return `${d}L${w + 2},${h + 2}Z`;
}

function Page({ i, w, h, dx, uid }: { i: number; w: number; h: number; dx: number; uid: string }) {
  const pg = PAGES[i % PAGES.length];
  const m = Math.min(w, h);
  const cx = w / 2 + dx;
  const cy = h * 0.4;
  const R = m * 0.22;
  return (
    <g>
      <rect width={w} height={h} fill={pg.bg} />
      <circle cx={cx} cy={cy} r={R * 1.6} fill={`url(#halo${uid})`} />
      {/* a simple illustration per page */}
      <g transform={`translate(${cx} ${cy})`}>
        <circle r={R} fill={pg.deep} />
        {pg.shape === 0 && <path d={`M${-R * 0.7},${R * 0.45} L${-R * 0.15},${-R * 0.35} L${R * 0.15},${R * 0.05} L${R * 0.35},${-R * 0.2} L${R * 0.75},${R * 0.45} Z`} fill={pg.ink} opacity="0.9" />}
        {pg.shape === 1 && <path d={`M0,${R * 0.55} C${-R * 0.9},${-R * 0.05} ${-R * 0.45},${-R * 0.75} 0,${-R * 0.3} C${R * 0.45},${-R * 0.75} ${R * 0.9},${-R * 0.05} 0,${R * 0.55} Z`} fill={pg.ink} opacity="0.9" />}
        {pg.shape === 2 && (
          <g fill={pg.ink} opacity="0.9">
            <circle cx={-R * 0.32} cy={-R * 0.1} r={R * 0.2} />
            <circle cx={R * 0.32} cy={-R * 0.1} r={R * 0.2} />
            <rect x={-R * 0.65} y={R * 0.15} width={R * 0.6} height={R * 0.32} rx={R * 0.16} />
            <rect x={R * 0.05} y={R * 0.15} width={R * 0.6} height={R * 0.32} rx={R * 0.16} />
          </g>
        )}
      </g>
      <text x={cx} y={h * 0.72} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={850} fontSize={m * 0.12} fill={pg.ink}>
        {pg.title}
      </text>
      <text x={cx} y={h * 0.72 + m * 0.07} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontWeight={500} fontSize={m * 0.04} fill={pg.ink} opacity="0.75">
        {pg.sub}
      </text>
      {/* page dots */}
      {PAGES.map((_, k) => (
        <circle key={k} cx={w / 2 + (k - (PAGES.length - 1) / 2) * m * 0.04 + dx} cy={h * 0.9} r={m * (k === i % PAGES.length ? 0.011 : 0.007)} fill={pg.ink} opacity={k === i % PAGES.length ? 1 : 0.4} />
      ))}
    </g>
  );
}

export default function LiquidSwipe() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const m = Math.min(w, h);
  const p = clamp(s.p.x, 0, 1);
  const sw = Math.max(0, (p - 0.35) / 0.65) ** 1.4 * (w + m * 0.1);
  const hr = Math.max(0, s.hr.x) * s.pop.x;
  const vr = Math.max(m * 0.05, s.vr.x) * (0.4 + 0.6 * s.pop.x);
  const cy = s.cy.x;
  const path = wavePath(w, h, sw, hr, vr, cy);
  const next = (s.cur + 1) % PAGES.length;
  const arrowOp = clamp(1 - p * 5) * s.pop.x;
  const tipX = w - sw - hr;

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: PAGES[s.cur].bg }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`halo${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`liq${uid}`}>
            <path d={path} />
          </clipPath>
          <filter id={`sh${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={m * 0.02} />
          </filter>
        </defs>
        {/* the current page slides back a touch as the liquid pushes in */}
        <Page i={s.cur} w={w} h={h} dx={-p * w * 0.12} uid={uid} />
        {/* soft shadow of the liquid on the page under it */}
        <path d={path} fill="#000" opacity={0.18 + p * 0.1} filter={`url(#sh${uid})`} transform={`translate(${-m * 0.015} 0)`} />
        <g clipPath={`url(#liq${uid})`}>
          <Page i={next} w={w} h={h} dx={(1 - p) * (1 - p) * (w * 0.6 + m * 0.45)} uid={uid} />
        </g>
        {/* a glossy rim along the liquid edge */}
        <path d={path} fill="none" stroke="#fff" strokeOpacity={0.25 * (1 - p)} strokeWidth={m * 0.004} />
        {/* the chevron in the drop */}
        <g transform={`translate(${tipX + hr * 0.42} ${cy})`} opacity={arrowOp}>
          <path d={`M${m * 0.012},${-m * 0.022} L${-m * 0.012},0 L${m * 0.012},${m * 0.022}`} fill="none" stroke={PAGES[next].ink} strokeWidth={m * 0.008} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <button
        type="button"
        aria-label="Next page"
        style={{ position: 'absolute', right: 0, top: cy - m * 0.1, width: m * 0.12, height: m * 0.2, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'next' });
          }
        }}
      />
    </Stage>
  );
}
