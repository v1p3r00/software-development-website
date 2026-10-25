import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A segmented control whose white pill is a soft body: it stretches along its speed, squashes
 * when it stops, and jiggles before it settles. You can also grab the pill and drag it; it snaps
 * to the nearest segment. The little chart below re-grows its bars for each range.
 */

const SEG = ['Day', 'Week', 'Month', 'Year'];
const BARS = 9;
// a deterministic set of bar heights per segment
const DATA = SEG.map((_, k) => Array.from({ length: BARS }, (_, i) => 0.25 + 0.7 * Math.abs(Math.sin(i * (1.3 + k * 0.7) + k * 2.1))));

interface S {
  idx: number;
  x: Spring; // pill position in segments
  j: Spring; // jelly: + = wide/flat, - = tall/narrow
  drag: boolean;
  grab: number; // where on the pill it was grabbed, in segments
  bars: Spring[];
  idle: number;
  auto: number;
  pressSc: Spring;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const bw = Math.min(w * 0.86, m * 1.35);
  const bh = Math.max(40, m * 0.13);
  const sw = bw / SEG.length;
  const ch = Math.min(h * 0.46, bw * 0.55);
  // centre the whole column: heading, control, chart card
  const y0 = Math.max(bh * 0.95, (h - (bh * 2.5 + ch)) / 2 + bh * 0.9);
  return { m, bw, bh, sw, x0: (w - bw) / 2, y0, ch };
}

function pick(s: S, i: number, emit: (x: { name: string; gain?: number; rate?: number }) => void) {
  if (i === s.idx) return;
  s.idx = i;
  emit({ name: 'switch', gain: 0.4, rate: 1 + i * 0.07 });
}

export const sim = defineSim<S>({
  init: () => ({ idx: 1, x: sp(1), j: sp(), drag: false, grab: 0, bars: DATA[1].map((v) => sp(v)), idle: 0, auto: 0, pressSc: sp(1) }),
  step(s, f) {
    const { bh, sw, x0, y0 } = geom(f.w, f.h);
    const u = (f.p.x - x0) / sw; // pointer in segment units
    const onBar = f.p.y > y0 - bh * 0.4 && f.p.y < y0 + bh * 1.4 && u > -0.2 && u < SEG.length + 0.2;
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    if (f.pressed && onBar) {
      if (u >= s.x.x && u <= s.x.x + 1) {
        s.drag = true;
        s.grab = u - s.x.x;
      } else pick(s, clamp(Math.floor(u), 0, SEG.length - 1), f.emit);
    }
    for (const a of f.actions) if (a.type === 'seg') pick(s, a.i as number, f.emit);
    if (s.drag) {
      // the pill follows the finger; the selection follows the pill
      const want = clamp(u - s.grab, -0.15, SEG.length - 0.85);
      pick(s, clamp(Math.round(want), 0, SEG.length - 1), f.emit);
      spring(s.x, want, 900, 50, f.dt);
      if (!f.p.down) s.drag = false;
    } else spring(s.x, s.idx, f.reduced ? 500 : 260, f.reduced ? 45 : 21, f.dt);
    if (s.idle > 1.4) {
      s.auto += f.dt;
      if (s.auto > 1.25) {
        s.auto = 0;
        const seq = [2, 0, 3, 1];
        pick(s, seq[s.idx], f.emit);
      }
    } else s.auto = 0.8;
    // jelly follows speed with little damping, so a sudden stop makes it overshoot into a squash
    spring(s.j, clamp(Math.abs(s.x.v) * 0.09, 0, 0.45), 420, f.reduced ? 40 : 9, f.dt);
    spring(s.pressSc, s.drag ? 0.94 : 1, 500, 20, f.dt);
    s.bars.forEach((b, i) => {
      // bars regrow in a quick left-to-right ripple
      const lag = clamp((Math.abs(s.x.x - s.idx) - i * 0.04) * 3);
      spring(b, lerp(DATA[s.idx][i], 0.08, lag), 240, 13, f.dt);
    });
  },
});

export default function SegmentedPill() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, bw, bh, sw, x0, y0, ch } = geom(w, h);
  const pad = bh * 0.09;
  const j = s.j.x;
  const pw = (sw - pad * 2) * (1 + j) * s.pressSc.x;
  const ph = (bh - pad * 2) * (1 - j * 0.45) * (2 - s.pressSc.x);
  const pcx = x0 + (s.x.x + 0.5) * sw;
  const cy = y0 + bh / 2;
  // chart card
  const cw = bw;
  const cyy = y0 + bh * 1.6;
  const gap = cw / BARS;

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'pointer'} style={{ background: '#e9e6e1' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="50%" cy="25%" r="90%">
            <stop offset="0" stopColor="#fbf8f3" />
            <stop offset="0.6" stopColor="#ebe6de" />
            <stop offset="1" stopColor="#d3ccc1" />
          </radialGradient>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={bh * 0.12} />
          </filter>
          <filter id={`sh2${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={bh * 0.05} />
          </filter>
          <linearGradient id={`track${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9d3c9" />
            <stop offset="1" stopColor="#e6e1d9" />
          </linearGradient>
          <linearGradient id={`pill${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#f4f1ec" />
          </linearGradient>
          <linearGradient id={`barg${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff7a45" />
            <stop offset="1" stopColor="#ff4f6d" />
          </linearGradient>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        {/* recessed track */}
        <rect x={x0} y={y0} width={bw} height={bh} rx={bh / 2} fill={`url(#track${uid})`} />
        <rect x={x0} y={y0} width={bw} height={bh} rx={bh / 2} fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth={bh * 0.04} />
        <rect x={x0 + 1} y={y0 + bh * 0.04} width={bw - 2} height={bh} rx={bh / 2} fill="none" stroke="#000" strokeOpacity="0.05" strokeWidth={bh * 0.04} />
        {/* pill: soft drop shadow + crisp contact shadow, then the body */}
        <rect x={pcx - pw / 2} y={cy - ph / 2 + bh * 0.12} width={pw} height={ph} rx={ph / 2} fill="#5a4630" opacity="0.22" filter={`url(#sh${uid})`} />
        <rect x={pcx - pw / 2} y={cy - ph / 2 + bh * 0.03} width={pw} height={ph} rx={ph / 2} fill="#5a4630" opacity="0.2" filter={`url(#sh2${uid})`} />
        <rect x={pcx - pw / 2} y={cy - ph / 2} width={pw} height={ph} rx={ph / 2} fill={`url(#pill${uid})`} />
        <rect x={pcx - pw / 2 + 0.5} y={cy - ph / 2 + 0.5} width={pw - 1} height={ph - 1} rx={ph / 2} fill="none" stroke="#fff" strokeWidth="1" />
        {SEG.map((t, i) => {
          const c = x0 + (i + 0.5) * sw;
          const on = clamp(1 - Math.abs(c - pcx) / (sw * 0.6));
          return (
            <text
              key={t}
              x={c}
              y={cy + bh * 0.11}
              textAnchor="middle"
              fontFamily="'Inter Variable', Inter, system-ui"
              fontWeight={on > 0.5 ? 700 : 560}
              fontSize={bh * 0.3}
              fill={on > 0.5 ? '#1d1a16' : '#8a8073'}
              transform={`translate(${c} ${cy}) scale(${1 + on * 0.04}) translate(${-c} ${-cy})`}
            >
              {t}
            </text>
          );
        })}
        {/* chart card */}
        <rect x={x0} y={cyy + bh * 0.1} width={cw} height={ch} rx={bh * 0.4} fill="#5a4630" opacity="0.14" filter={`url(#sh${uid})`} />
        <rect x={x0} y={cyy} width={cw} height={ch} rx={bh * 0.4} fill="#fbfaf7" />
        <text x={x0 + bh * 0.45} y={cyy + bh * 0.6} fontFamily="'Inter Variable', Inter, system-ui" fontWeight={600} fontSize={bh * 0.22} fill="#8a8073">
          Revenue · {SEG[s.idx]}
        </text>
        <text x={x0 + bh * 0.45} y={cyy + bh * 1.15} fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={bh * 0.42} fill="#1d1a16">
          ${(DATA[s.idx].reduce((a, b) => a + b, 0) * [1.2, 8.4, 36, 410][s.idx]).toLocaleString('en-US', { maximumFractionDigits: 1 })}k
        </text>
        {s.bars.map((b, i) => {
          const top = cyy + bh * 1.5;
          const bottom = cyy + ch - bh * 0.4;
          const hh = Math.max(2, (bottom - top) * clamp(b.x, 0.02, 1.1));
          const bwid = gap * 0.46;
          const bx = x0 + gap * (i + 0.5) - bwid / 2;
          return <rect key={i} x={bx} y={bottom - hh} width={bwid} height={hh} rx={bwid * 0.35} fill={`url(#barg${uid})`} opacity={0.55 + 0.45 * (i / BARS)} />;
        })}
      </svg>
      <div role="radiogroup" aria-label="Range" style={{ position: 'absolute', left: x0, top: y0, width: bw, height: bh, display: 'flex' }}>
        {SEG.map((t, i) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={s.idx === i}
            aria-label={t}
            style={{ flex: 1, opacity: 0 }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                fx.dispatch({ type: 'seg', i });
              }
            }}
          />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y0 - bh * 0.9, textAlign: 'center', fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: m * 0.05, color: '#2a251f', display: m < 260 ? 'none' : 'block' }}>
        Overview
      </div>
    </Stage>
  );
}
