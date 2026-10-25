import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Tabs with a liquid indicator. Its leading edge darts to the new tab on a stiff spring while
 * the trailing edge follows on a soft one, so the blob stretches thin and then snaps together;
 * a few lagging droplets run through a goo filter (blur + alpha threshold) so they merge like ink.
 */

const TABS = ['Home', 'Search', 'Likes', 'Profile'];
const ICONS = [
  'M3 11 L12 3 L21 11 V20 a1 1 0 0 1 -1 1 H15 V15 H9 V21 H4 a1 1 0 0 1 -1 -1 Z',
  'M10.5 3 a7.5 7.5 0 1 1 0 15 a7.5 7.5 0 1 1 0 -15 Z M16 16 L21 21',
  'M12 20 C6 16 3 13 3 9 C3 6 5.5 4 8 4 C10 4 11.3 5.2 12 6.5 C12.7 5.2 14 4 16 4 C18.5 4 21 6 21 9 C21 13 18 16 12 20 Z',
  'M12 3 a4.5 4.5 0 1 1 0 9 a4.5 4.5 0 1 1 0 -9 Z M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21',
];

interface S {
  idx: number;
  L: Spring; // left edge, in tab units
  R: Spring; // right edge
  drops: Spring[]; // lagging droplets (centre x in tab units)
  sq: Spring; // vertical squash of the blob
  idle: number;
  auto: number;
  dir: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const bw = Math.min(w * 0.88, m * 1.5);
  const bh = Math.max(44, m * 0.17);
  return { m, bw, bh, x0: (w - bw) / 2, y0: h / 2 - bh / 2, tw: bw / TABS.length };
}

function select(s: S, i: number, f: { emit: (x: { name: string; gain?: number; rate?: number; pan?: number }) => void }) {
  if (i === s.idx) return;
  s.dir = i > s.idx ? 1 : -1;
  s.idx = i;
  s.sq.v += 6;
  f.emit({ name: 'drip', gain: 0.5, rate: 0.9 + i * 0.08, pan: (i / (TABS.length - 1)) * 1.4 - 0.7 });
}

export const sim = defineSim<S>({
  init: () => ({ idx: 0, L: sp(0), R: sp(1), drops: [sp(0.5), sp(0.5), sp(0.5)], sq: sp(), idle: 0, auto: 0, dir: 1 }),
  step(s, f) {
    const { bh, x0, y0, tw } = geom(f.w, f.h);
    const onBar = f.p.y > y0 - bh * 0.3 && f.p.y < y0 + bh * 1.3 && f.p.x > x0 && f.p.x < x0 + tw * TABS.length;
    const i = clamp(Math.floor((f.p.x - x0) / tw), 0, TABS.length - 1);
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    // press a tab, or scrub across the bar with the finger down
    if (f.p.down && onBar) select(s, i, f);
    for (const a of f.actions) if (a.type === 'tab') select(s, a.i as number, f);
    if (s.idle > 1.4) {
      s.auto += f.dt;
      if (s.auto > 1.3) {
        s.auto = 0;
        // ping-pong with an occasional long jump, the most liquid-looking move
        const next = s.idx === 0 ? 3 : s.idx === 3 ? 1 : s.idx === 1 ? 2 : 0;
        select(s, next, f);
      }
    } else s.auto = 0.9;
    const k = f.reduced ? 3 : 1;
    // the edge that leads is stiff, the one that trails is lazy
    const lead = [520 * k, 30];
    const trail = [130 * k, 15];
    const [lk, ld] = s.dir > 0 ? trail : lead;
    const [rk, rd] = s.dir > 0 ? lead : trail;
    spring(s.L, s.idx, lk, ld, f.dt);
    spring(s.R, s.idx + 1, rk, rd, f.dt);
    s.drops.forEach((d, j) => spring(d, s.idx + 0.5, 70 + j * 45, 9 + j * 2, f.dt));
    // the blob gets thinner as it stretches (volume), then wobbles back
    const stretch = s.R.x - s.L.x - 1;
    spring(s.sq, clamp(stretch * 0.5, 0, 0.6), 300, 12, f.dt);
  },
});

export default function GooeyTabs() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, bw, bh, x0, y0, tw } = geom(w, h);
  const pad = bh * 0.12;
  const L = x0 + Math.max(-0.06, s.L.x) * tw + pad;
  const R = x0 + Math.min(TABS.length + 0.06, s.R.x) * tw - pad;
  const sq = s.sq.x;
  const bhh = (bh - pad * 2) * (1 - sq * 0.35);
  const cy = y0 + bh / 2;
  const blur = bh * 0.09;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#0a0d14' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="50%" cy="35%" r="85%">
            <stop offset="0" stopColor="#1b2540" />
            <stop offset="0.55" stopColor="#0e1322" />
            <stop offset="1" stopColor="#05070c" />
          </radialGradient>
          <linearGradient id={`blob${uid}`} gradientUnits="userSpaceOnUse" x1={x0} x2={x0 + bw} y1="0" y2="0">
            <stop offset="0" stopColor="#4f7bff" />
            <stop offset="0.5" stopColor="#8a5bff" />
            <stop offset="1" stopColor="#ff5fa2" />
          </linearGradient>
          <filter id={`goo${uid}`} x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
            <feComposite in="SourceGraphic" in2="g" operator="atop" />
          </filter>
          <filter id={`glow${uid}`} x="-50%" y="-200%" width="200%" height="500%">
            <feGaussianBlur stdDeviation={bh * 0.25} />
          </filter>
          <linearGradient id={`bar${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1c2236" />
            <stop offset="1" stopColor="#121726" />
          </linearGradient>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        {/* bar: soft shadow, body, hairline highlight */}
        <rect x={x0} y={y0 + bh * 0.18} width={bw} height={bh} rx={bh / 2} fill="#000" opacity="0.55" filter={`url(#glow${uid})`} />
        <rect x={x0} y={y0} width={bw} height={bh} rx={bh / 2} fill={`url(#bar${uid})`} />
        <rect x={x0 + 0.5} y={y0 + 0.5} width={bw - 1} height={bh - 1} rx={bh / 2} fill="none" stroke="#fff" strokeOpacity="0.08" />
        {/* coloured light the blob throws on the bar */}
        <rect x={L} y={cy - bhh / 2} width={Math.max(1, R - L)} height={bhh} rx={bhh / 2} fill={`url(#blob${uid})`} opacity="0.45" filter={`url(#glow${uid})`} />
        {/* the goo */}
        <g filter={`url(#goo${uid})`}>
          <rect x={L} y={cy - bhh / 2} width={Math.max(1, R - L)} height={bhh} rx={bhh / 2} fill={`url(#blob${uid})`} />
          {s.drops.map((d, j) => (
            <circle key={j} cx={x0 + d.x * tw} cy={cy + (j - 1) * bhh * 0.12} r={bhh * (0.36 - j * 0.06)} fill={`url(#blob${uid})`} />
          ))}
        </g>
        {/* glossy top on the blob */}
        <rect x={L + bhh * 0.3} y={cy - bhh / 2 + bhh * 0.08} width={Math.max(0, R - L - bhh * 0.6)} height={bhh * 0.22} rx={bhh * 0.11} fill="#fff" opacity="0.22" />
        {TABS.map((t, i) => {
          const c = x0 + (i + 0.5) * tw;
          // the label lights up while the blob covers it
          const cover = clamp(Math.min((c - L) / (bhh * 0.4), (R - c) / (bhh * 0.4)));
          const ic = bh * 0.3;
          const showLabel = tw > bh * 1.6;
          const ix = showLabel ? c - ic * 0.5 - (t.length * bh * 0.105) / 2 - ic * 0.15 : c;
          return (
            <g key={t} opacity={0.55 + cover * 0.45}>
              <g transform={`translate(${ix - ic / 2} ${cy - ic / 2 - cover * bh * 0.02}) scale(${ic / 24})`}>
                <path d={ICONS[i]} fill={i === 2 && cover > 0.5 ? '#fff' : 'none'} stroke={cover > 0.5 ? '#fff' : '#8a93b0'} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              </g>
              {showLabel && (
                <text x={ix + ic * 0.75} y={cy + bh * 0.07} fontFamily="'Inter Variable', Inter, system-ui" fontWeight={650} fontSize={bh * 0.2} fill={cover > 0.5 ? '#fff' : '#8a93b0'}>
                  {t}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div role="tablist" aria-label="Sections" style={{ position: 'absolute', left: x0, top: y0, width: bw, height: bh, display: 'flex' }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={s.idx === i}
            aria-label={t}
            style={{ flex: 1, opacity: 0 }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                fx.dispatch({ type: 'tab', i });
              }
            }}
          />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y0 + bh * 1.6, textAlign: 'center', fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: m * 0.07, color: '#e8ecff', opacity: 0.9 }}>
        {TABS[s.idx]}
      </div>
    </Stage>
  );
}
