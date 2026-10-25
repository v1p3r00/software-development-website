import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * Submit morph. Click: the pill collapses (with a squash) into a ring, the ring becomes a
 * spinner whose arc breathes as it turns; when the "request" lands, a green disc blooms out of
 * the centre with an overshoot, rays burst and the check is drawn. Then it grows back.
 */

type Phase = 'idle' | 'load' | 'done';

interface S {
  phase: Phase;
  pt: number; // time in phase
  wd: Spring; // 0 = full pill, 1 = circle
  sq: Spring; // squash
  bloom: Spring; // green disc scale
  rot: number; // spinner angle
  hover: number;
  idle: number;
  demo: number;
}

const LOAD = 1.7;

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const bw = Math.min(w * 0.62, m * 0.95, 420);
  const bh = bw * 0.24;
  return { cx: w / 2, cy: h / 2, bw, bh };
}

export const sim = defineSim<S>({
  init: () => ({ phase: 'idle', pt: 0, wd: sp(), sq: sp(), bloom: sp(), rot: 0, hover: 0, idle: 0, demo: 0 }),
  step(s, f) {
    const { cx, cy, bw, bh } = geom(f.w, f.h);
    const dt = f.dt;
    s.pt += dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;
    const curW = bw + (bh - bw) * s.wd.x;
    const onBtn = Math.abs(f.p.x - cx) < curW / 2 && Math.abs(f.p.y - cy) < bh / 2;
    s.hover += ((onBtn && f.p.over && s.phase === 'idle' ? 1 : 0) - s.hover) * Math.min(1, dt * 10);

    const go = () => {
      s.phase = 'load';
      s.pt = 0;
      s.sq.v += 7;
      f.emit({ name: 'click', gain: 0.7 });
      f.emit({ name: 'whoosh', gain: 0.35, rate: 1.4 });
    };
    if (f.pressed && onBtn && s.phase === 'idle') go();
    // self-demo
    if (s.idle > 2.2 && s.phase === 'idle') {
      s.demo += dt;
      if (s.demo > 0.8) {
        s.demo = 0;
        go();
      }
    } else if (s.phase === 'idle') s.demo = 0;

    if (s.phase === 'load') {
      s.rot += dt * (5 + 3 * Math.sin(s.pt * 3));
      if (s.pt > LOAD) {
        s.phase = 'done';
        s.pt = 0;
        s.bloom.v += 1;
        f.emit({ name: 'success', gain: 0.85 });
      }
    } else if (s.phase === 'done' && s.pt > 2.0) {
      s.phase = 'idle';
      s.pt = 0;
      s.sq.v -= 5;
      f.emit({ name: 'pop', gain: 0.4, rate: 0.9 });
    }
    const d = f.reduced ? 2 : 1;
    spring(s.wd, s.phase === 'idle' ? 0 : 1, 140, 13 * d, dt);
    spring(s.sq, 0, 320, 12 * d, dt);
    spring(s.bloom, s.phase === 'done' ? 1 : 0, s.phase === 'done' ? 170 : 400, s.phase === 'done' ? 9 * d : 30, dt);
  },
});

export default function SubmitMorph() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, bw, bh } = geom(w, h);
  const k = clamp(s.wd.x, -0.2, 1.2);
  const width = bw + (bh - bw) * k;
  const sq = s.sq.x;
  const sx = 1 + sq * 0.04;
  const sy = 1 - sq * 0.06;
  const r = bh / 2;
  const textA = clamp(1 - k * 3);
  const ringA = smooth((k - 0.6) / 0.4) * (s.phase === 'load' ? 1 : clamp(1 - s.bloom.x));
  const rr = r * 1.15;
  const circ = 2 * Math.PI * rr;
  // the spinner arc breathes between short and long
  const arc = s.phase === 'load' ? 0.18 + 0.5 * (0.5 + 0.5 * Math.sin(s.pt * 4)) : 0.25;
  const bloom = Math.max(0, s.bloom.x);
  const ck = s.phase === 'done' ? smooth((s.pt - 0.12) / 0.3) : bloom > 0.5 ? 1 : 0;
  const ckLen = r * 1.3;
  const rays = s.phase === 'done' ? clamp(s.pt / 0.5) : 1;
  const font = "'Archivo Variable', Archivo, system-ui, sans-serif";
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const hv = s.hover;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(110% 90% at 50% 30%, #172038 0%, #0b1020 60%, #060812 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`b${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6d7bff" />
            <stop offset="1" stopColor="#3b4cf0" />
          </linearGradient>
          <radialGradient id={`g${uid}`} cx="40%" cy="30%" r="80%">
            <stop offset="0" stopColor="#6ef0a8" />
            <stop offset="1" stopColor="#14b866" />
          </radialGradient>
          <linearGradient id={`arc${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8fa0ff" stopOpacity="0" />
            <stop offset="1" stopColor="#c7cfff" />
          </linearGradient>
          <filter id={`f${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={bh * 0.22} />
          </filter>
        </defs>
        <g transform={`translate(${cx} ${cy}) scale(${sx} ${sy})`}>
          {/* soft coloured shadow under the body */}
          <rect x={-width / 2 + bh * 0.2} y={-r + bh * 0.35} width={Math.max(0, width - bh * 0.4)} height={bh * 0.8} rx={r} fill={bloom > 0.3 ? '#14b866' : '#3b4cf0'} opacity={0.45 * (1 - ringA * 0.7) + hv * 0.15} filter={`url(#f${uid})`} />
          {/* the pill body, faded out as it becomes a ring */}
          <rect x={-width / 2} y={-r} width={width} height={bh} rx={r} fill={`url(#b${uid})`} opacity={1 - ringA * 0.92} />
          <clipPath id={`c${uid}`}>
            <rect x={-width / 2} y={-r} width={width} height={bh} rx={r} />
          </clipPath>
          <rect x={-width / 2} y={-r} width={width} height={bh * 0.5} fill="#fff" opacity={(0.1 + hv * 0.06) * (1 - ringA)} clipPath={`url(#c${uid})`} />
          <rect x={-width / 2 + 0.75} y={-r + 0.75} width={width - 1.5} height={bh - 1.5} rx={r - 0.75} fill="none" stroke="#c7cfff" strokeOpacity={0.35 + ringA * 0.2} strokeWidth={1.5} />
          {textA > 0 && (
            <g opacity={textA} fontFamily={font} fontWeight={750} fontSize={bh * 0.3} fill="#fff">
              <text x={-bh * 0.2} y={0} textAnchor="middle" dominantBaseline="central" transform={`translate(${-k * bh} 0) scale(${1 - k * 0.4})`}>
                Send message
              </text>
              <path d={`M${bw * 0.3 - bh * 0.12} ${-bh * 0.1} l${bh * 0.12} ${bh * 0.1} l${-bh * 0.12} ${bh * 0.1}`} transform={`translate(${-k * bw * 0.5 + hv * bh * 0.08} 0)`} fill="none" stroke="#fff" strokeWidth={bh * 0.05} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {/* spinner */}
          {ringA > 0.01 && (
            <g opacity={ringA}>
              <circle r={rr * 0.82} fill="none" stroke="#fff" strokeOpacity={0.1} strokeWidth={bh * 0.07} />
              <circle r={rr * 0.82} fill="none" stroke="#dfe4ff" strokeWidth={bh * 0.07} strokeLinecap="round" strokeDasharray={`${circ * 0.82 * arc} ${circ}`} transform={`rotate(${(s.rot * 180) / Math.PI})`} />
            </g>
          )}
          {/* success: rays and the green bloom */}
          {s.phase === 'done' && rays < 1 && (
            <g stroke="#7dffb9" strokeWidth={bh * 0.05} strokeLinecap="round" opacity={1 - rays}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2 + 0.3;
                const r0 = r * (1.2 + rays * 0.9);
                const r1 = r * (1.45 + rays * 1.4);
                return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} />;
              })}
            </g>
          )}
          {bloom > 0.01 && (
            <g transform={`scale(${bloom})`}>
              <circle r={r * 1.0} cy={bh * 0.06} fill="#000" opacity={0.3} filter={`url(#f${uid})`} />
              <circle r={r} fill={`url(#g${uid})`} />
              <ellipse cx={-r * 0.15} cy={-r * 0.5} rx={r * 0.5} ry={r * 0.22} fill="#fff" opacity={0.25} />
              <path d={`M${-r * 0.4} ${r * 0.02} L${-r * 0.12} ${r * 0.3} L${r * 0.42} ${-r * 0.26}`} fill="none" stroke="#fff" strokeWidth={bh * 0.075} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${ckLen * ck} ${ckLen}`} />
            </g>
          )}
        </g>
        <text x={cx} y={cy + bh * 1.35} textAnchor="middle" fontFamily={ui} fontSize={Math.max(11, bh * 0.2)} fontWeight={500} fill={s.phase === 'done' ? '#7dffb9' : '#8f9bc8'} opacity={s.phase === 'idle' ? 0 : 0.9}>
          {s.phase === 'load' ? 'Sending…' : s.phase === 'done' ? 'Message sent' : ''}
        </text>
      </svg>
      <button
        type="button"
        aria-label="Send message"
        style={{ position: 'absolute', left: cx - width / 2, top: cy - r, width, height: bh, opacity: 0, borderRadius: r }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
