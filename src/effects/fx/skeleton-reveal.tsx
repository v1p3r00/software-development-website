import { useId } from 'react';
import { defineSim, useFx, Stage, smooth } from '../kit';

/**
 * Skeleton → content. Grey placeholder blocks shimmer with a light sweep, then each block
 * resolves into the real thing in a staggered cascade — avatar, title, photo, copy, buttons —
 * rising a few pixels and sharpening as it fades in. Click to load again.
 */

interface S {
  phase: 'load' | 'show';
  pt: number;
  t: number;
  shimmerX: number;
}

const LOAD = 1.6;
const SHOW = 3.4;

export const sim = defineSim<S>({
  init: () => ({ phase: 'load', pt: 0, t: 0, shimmerX: 0 }),
  step(s, f) {
    const { dt } = f;
    s.t += dt;
    s.pt += dt;
    // the shimmer sweeps continuously; hovering lets the light follow the pointer
    const auto = (((s.t * 0.7) % 1.3) - 0.15) * f.w;
    s.shimmerX = f.p.over ? s.shimmerX + (f.p.x - s.shimmerX) * Math.min(1, dt * 10) : auto;
    if (f.pressed) {
      s.phase = 'load';
      s.pt = 0;
      f.emit({ name: 'click', gain: 0.4 });
    }
    if (s.phase === 'load' && s.pt > LOAD) {
      s.phase = 'show';
      s.pt = 0;
      f.emit({ name: 'pop', gain: 0.35, rate: 1.3 });
    } else if (s.phase === 'show') {
      // a soft tick as each card lands
      if (s.pt - dt < 0.35 && s.pt >= 0.35) f.emit({ name: 'tick', gain: 0.2, rate: 1.4 });
      if (s.pt > SHOW && !f.p.over) {
        s.phase = 'load';
        s.pt = 0;
      }
    }
  },
});

function layout(w: number, h: number) {
  const m = Math.min(w, h);
  const side = w > h;
  const gap = m * 0.05;
  // two cards when they fit at a sensible aspect, otherwise one
  const two = side ? w > h * 1.25 : (h * 0.88 - gap) / 2 >= Math.min(w * 0.86, m) * 1.15;
  const n = two ? 2 : 1;
  const cw = side ? Math.min((w * 0.88 - gap * (n - 1)) / n, m * 0.85) : Math.min(w * 0.86, m * 1.0);
  const ch = side ? Math.min(h * 0.82, cw * 1.25) : Math.min((h * 0.88 - gap * (n - 1)) / n, cw * 1.2);
  const cards = Array.from({ length: n }, (_, i) =>
    side
      ? { x: w / 2 - (n * cw + (n - 1) * gap) / 2 + i * (cw + gap), y: h / 2 - ch / 2, w: cw, h: ch }
      : { x: w / 2 - cw / 2, y: h / 2 - (n * ch + (n - 1) * gap) / 2 + i * (ch + gap), w: cw, h: ch },
  );
  return { m, cards };
}

const POSTS = [
  { name: 'Mira Holt', meta: '2h · Lofoten, Norway', title: 'Northern lights over Reine', body: 'Waited four nights for this sky. Worth every frozen minute.', sky: ['#0b1e3f', '#1b6b6f', '#7cf0b5'] },
  { name: 'Studio Kiln', meta: '5h · Lisbon', title: 'Glaze test no. 41', body: 'Iron red over celadon, fired to cone 10. Keeping this one.', sky: ['#f6c08a', '#e2734a', '#7a2f3b'] },
];

export default function SkeletonReveal() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, cards } = layout(w, h);
  const showing = s.phase === 'show';
  const sx = s.shimmerX;
  const SW = m * 0.35;
  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'linear-gradient(180deg, #eef0f5 0%, #e2e6ee 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`sh${uid}`} gradientUnits="userSpaceOnUse" x1={sx - SW} y1={0} x2={sx + SW} y2={SW * 0.4}>
            <stop offset="0" stopColor="#dfe3eb" />
            <stop offset="0.5" stopColor="#fbfcfe" />
            <stop offset="1" stopColor="#dfe3eb" />
          </linearGradient>
          <filter id={`ds${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy={m * 0.012} stdDeviation={m * 0.02} floodColor="#1a2340" floodOpacity="0.12" />
          </filter>
          {POSTS.map((p, i) => (
            <linearGradient key={i} id={`sky${i}${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={p.sky[0]} />
              <stop offset="0.6" stopColor={p.sky[1]} />
              <stop offset="1" stopColor={p.sky[2]} />
            </linearGradient>
          ))}
        </defs>
        {cards.map((c, ci) => {
          const p = POSTS[ci % POSTS.length];
          const pad = c.w * 0.07;
          const av = c.w * 0.13;
          const imgY = c.y + pad * 1.6 + av;
          const imgH = c.h * 0.42;
          const ty = imgY + imgH + pad * 0.9;
          const fs = c.w * 0.055;
          // each element's reveal progress (staggered per card and per element)
          const e = (k: number) => (showing ? smooth((s.pt - ci * 0.18 - k * 0.08) / 0.35) : 0);
          const lift = (k: number) => (1 - e(k)) * m * 0.012;
          const sk = (k: number, x: number, y: number, ww: number, hh: number, r: number) => (
            <rect x={x} y={y} width={ww} height={hh} rx={r} fill={`url(#sh${uid})`} opacity={1 - e(k)} />
          );
          return (
            <g key={ci}>
              <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={c.w * 0.05} fill="#fff" filter={`url(#ds${uid})`} />
              {/* avatar */}
              {sk(0, c.x + pad, c.y + pad, av, av, av / 2)}
              <g opacity={e(0)} transform={`translate(0 ${lift(0)})`}>
                <circle cx={c.x + pad + av / 2} cy={c.y + pad + av / 2} r={av / 2} fill={`url(#sky${ci}${uid})`} />
                <text x={c.x + pad + av / 2} y={c.y + pad + av * 0.66} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={av * 0.45} fill="#fff">
                  {p.name[0]}
                </text>
              </g>
              {/* name + meta */}
              {sk(1, c.x + pad * 1.4 + av, c.y + pad + av * 0.12, c.w * 0.4, av * 0.28, av * 0.14)}
              {sk(2, c.x + pad * 1.4 + av, c.y + pad + av * 0.58, c.w * 0.28, av * 0.22, av * 0.11)}
              <g opacity={e(1)} transform={`translate(0 ${lift(1)})`} fontFamily="'Inter Variable', Inter, system-ui">
                <text x={c.x + pad * 1.4 + av} y={c.y + pad + av * 0.36} fontSize={fs * 0.95} fontWeight={700} fill="#141a2b">
                  {p.name}
                </text>
                <text x={c.x + pad * 1.4 + av} y={c.y + pad + av * 0.8} fontSize={fs * 0.72} fill="#7a8399" opacity={e(2)}>
                  {p.meta}
                </text>
              </g>
              {/* photo: a little landscape that settles from a slight zoom */}
              {sk(3, c.x + pad, imgY, c.w - pad * 2, imgH, c.w * 0.03)}
              <g opacity={e(3)}>
                <clipPath id={`ic${ci}${uid}`}>
                  <rect x={c.x + pad} y={imgY} width={c.w - pad * 2} height={imgH} rx={c.w * 0.03} />
                </clipPath>
                <g clipPath={`url(#ic${ci}${uid})`}>
                  <g transform={`translate(${c.x + c.w / 2} ${imgY + imgH / 2}) scale(${1.08 - 0.08 * e(3)}) translate(${-c.x - c.w / 2} ${-imgY - imgH / 2})`}>
                    <rect x={c.x + pad} y={imgY} width={c.w - pad * 2} height={imgH} fill={`url(#sky${ci}${uid})`} />
                    {ci % 2 === 0 ? (
                      <>
                        <path d={`M${c.x + pad} ${imgY + imgH * 0.35}Q${c.x + c.w * 0.4} ${imgY + imgH * 0.1} ${c.x + c.w - pad} ${imgY + imgH * 0.3}`} stroke="#9dffcf" strokeOpacity="0.55" strokeWidth={imgH * 0.08} fill="none" />
                        <path d={`M${c.x + pad} ${imgY + imgH}L${c.x + c.w * 0.3} ${imgY + imgH * 0.5}L${c.x + c.w * 0.45} ${imgY + imgH * 0.7}L${c.x + c.w * 0.62} ${imgY + imgH * 0.42}L${c.x + c.w - pad} ${imgY + imgH * 0.85}V${imgY + imgH}Z`} fill="#06121f" />
                      </>
                    ) : (
                      <>
                        <ellipse cx={c.x + c.w / 2} cy={imgY + imgH * 0.95} rx={c.w * 0.3} ry={imgH * 0.12} fill="#3b1820" opacity="0.5" />
                        <path d={`M${c.x + c.w * 0.36} ${imgY + imgH * 0.3}Q${c.x + c.w * 0.3} ${imgY + imgH * 0.95} ${c.x + c.w / 2} ${imgY + imgH * 0.95}Q${c.x + c.w * 0.7} ${imgY + imgH * 0.95} ${c.x + c.w * 0.64} ${imgY + imgH * 0.3}Z`} fill="#8fb8a4" />
                        <path d={`M${c.x + c.w * 0.36} ${imgY + imgH * 0.3}Q${c.x + c.w * 0.33} ${imgY + imgH * 0.6} ${c.x + c.w / 2} ${imgY + imgH * 0.62}Q${c.x + c.w * 0.67} ${imgY + imgH * 0.6} ${c.x + c.w * 0.64} ${imgY + imgH * 0.3}Z`} fill="#9e2b25" />
                        <ellipse cx={c.x + c.w / 2} cy={imgY + imgH * 0.3} rx={c.w * 0.14} ry={imgH * 0.05} fill="#5a1915" />
                      </>
                    )}
                  </g>
                </g>
              </g>
              {/* title + copy */}
              {sk(4, c.x + pad, ty, c.w * 0.62, fs * 1.0, fs * 0.5)}
              {sk(5, c.x + pad, ty + fs * 1.6, c.w - pad * 2, fs * 0.7, fs * 0.35)}
              {sk(6, c.x + pad, ty + fs * 2.6, c.w * 0.55, fs * 0.7, fs * 0.35)}
              <g fontFamily="'Inter Variable', Inter, system-ui">
                <text x={c.x + pad} y={ty + fs * 0.85 + lift(4)} fontSize={fs * 1.05} fontWeight={750} fill="#141a2b" opacity={e(4)}>
                  {p.title}
                </text>
                <foreignObject x={c.x + pad} y={ty + fs * 1.4 + lift(5)} width={c.w - pad * 2} height={fs * 2.8} opacity={e(5)}>
                  <div style={{ fontFamily: "'Inter Variable', Inter, system-ui", fontSize: fs * 0.78, lineHeight: 1.45, color: '#4a5368' }}>{p.body}</div>
                </foreignObject>
              </g>
              {/* actions */}
              {[0, 1, 2].map((k) => {
                const bx = c.x + pad + k * c.w * 0.22;
                const by = c.y + c.h - pad - fs * 1.3;
                return (
                  <g key={k}>
                    {sk(7 + k, bx, by, c.w * 0.18, fs * 1.3, fs * 0.65)}
                    <g opacity={e(7 + k)} transform={`translate(0 ${lift(7 + k)})`}>
                      <rect x={bx} y={by} width={c.w * 0.18} height={fs * 1.3} rx={fs * 0.65} fill={k === 0 ? '#ffe3ea' : '#eef1f7'} />
                      <text x={bx + c.w * 0.09} y={by + fs * 0.88} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontSize={fs * 0.7} fontWeight={600} fill={k === 0 ? '#e0144c' : '#4a5368'}>
                        {['♥ 248', '✎ 31', '↗ Share'][k]}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <button type="button" aria-label="Reload content" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
    </Stage>
  );
}
