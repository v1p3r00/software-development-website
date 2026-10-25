import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Hand-drawn checkboxes on notebook paper. Tick one and a pen draws the check in a single quick
 * flick (slow into the corner, fast up the long stroke), the box bounces from the impact, then the
 * pen strikes the task through. Unticking scrubs the ink back out.
 */

const ITEMS = ['Sketch the landing page', 'Record the 2-second demo', 'Polish the micro-interactions', 'Ship it'];

interface Item {
  on: boolean;
  draw: number; // check progress 0..1
  strike: number; // strike-through progress 0..1
  b: Spring; // bounce
}

interface S {
  it: Item[];
  idle: number;
  demo: number;
  demoK: number;
  pen: number; // which item the pen is on (-1 none)
}

const hash = (n: number) => {
  const x = Math.sin(n * 91.7 + 13.1) * 43758.5453;
  return x - Math.floor(x);
};

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const lw = Math.min(w * 0.84, m * 1.15, 520);
  const rh = Math.min(h / (ITEMS.length + 2.6), m * 0.16, 76);
  const top = h / 2 - (rh * ITEMS.length) / 2 + rh * 0.35;
  return { lw, rh, x: w / 2 - lw / 2, top, box: rh * 0.5 };
}

/** pen pressure: the check eases into the corner, then whips up the long stroke */
const penEase = (u: number) => (u < 0.35 ? (u / 0.35) * 0.3 : 0.3 + (1 - Math.pow(1 - (u - 0.35) / 0.65, 2.2)) * 0.7);

export const sim = defineSim<S>({
  init: () => ({ it: ITEMS.map(() => ({ on: false, draw: 0, strike: 0, b: sp() })), idle: 0, demo: 0, demoK: -1, pen: -1 }),
  step(s, f) {
    const g = geom(f.w, f.h);
    const dt = f.dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;
    const toggle = (i: number) => {
      const it = s.it[i];
      it.on = !it.on;
      if (it.on) f.emit({ name: 'paper', gain: 0.5, rate: 1.1 });
      else f.emit({ name: 'rustle', gain: 0.35, rate: 1.3 });
    };
    if (f.pressed) {
      const i = Math.floor((f.p.y - g.top) / g.rh);
      if (i >= 0 && i < ITEMS.length && f.p.x > g.x - g.rh * 0.3 && f.p.x < g.x + g.lw) toggle(i);
    }
    // self-demo: tick the list top to bottom, then clear it
    if (s.idle > 2.2) {
      s.demo += dt;
      const k = Math.floor(s.demo / 0.75) % (ITEMS.length * 2 + 2);
      if (k !== s.demoK) {
        s.demoK = k;
        if (k < ITEMS.length && !s.it[k].on) toggle(k);
        if (k === ITEMS.length + 2) s.it.forEach((it, i) => it.on && i % 2 === 0 && toggle(i));
        if (k === ITEMS.length + 3) s.it.forEach((it, i) => it.on && toggle(i));
      }
    } else s.demo = 0;

    s.pen = -1;
    s.it.forEach((it, i) => {
      const before = it.draw;
      if (it.on) {
        it.draw = Math.min(1, it.draw + dt / 0.34);
        if (it.draw >= 1) it.strike = Math.min(1, it.strike + dt / 0.4);
        if (it.draw < 1 || it.strike < 1) s.pen = i;
      } else {
        // erasing goes the other way, quicker
        it.strike = Math.max(0, it.strike - dt / 0.18);
        if (it.strike <= 0) it.draw = Math.max(0, it.draw - dt / 0.2);
      }
      // the pen hits the paper at the end of the flick: the box jumps
      if (before < 1 && it.draw >= 1) {
        it.b.v += f.reduced ? 3 : 9;
        f.emit({ name: 'tick', gain: 0.45, rate: 1.1 + i * 0.05 });
      }
      spring(it.b, 0, 420, 11, dt);
    });
  },
});

/** a slightly wobbly hand-drawn rounded square, deterministic per item */
function sketchBox(x: number, y: number, s: number, seed: number) {
  const j = (k: number) => (hash(seed * 13 + k) - 0.5) * s * 0.08;
  const r = s * 0.22;
  return `M${x + r + j(1)} ${y + j(2)} L${x + s - r + j(3)} ${y + j(4)} Q${x + s + j(5)} ${y + j(6)} ${x + s + j(7)} ${y + r + j(8)} L${x + s + j(9)} ${y + s - r + j(10)} Q${x + s + j(11)} ${y + s + j(12)} ${x + s - r + j(13)} ${y + s + j(14)} L${x + r + j(15)} ${y + s + j(16)} Q${x + j(17)} ${y + s + j(18)} ${x + j(19)} ${y + s - r + j(20)} L${x + j(21)} ${y + r + j(22)} Q${x + j(23)} ${y + j(24)} ${x + r + s * 0.12} ${y + j(25) - s * 0.03}`;
}

export default function DrawnCheckbox() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const fs = g.rh * 0.3;
  const ink = '#1f3fbf';
  const B = g.box;
  // check path in box units, and its approximate length
  const ck = (bx: number, by: number) => `M${bx + B * 0.18} ${by + B * 0.5} Q${bx + B * 0.32} ${by + B * 0.62} ${bx + B * 0.42} ${by + B * 0.86} Q${bx + B * 0.62} ${by + B * 0.3} ${bx + B * 1.12} ${by - B * 0.12}`;
  const ckLen = B * 1.75;
  const nib: { p: { x: number; y: number } | null } = { p: null };

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#f7f3ea' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`paper${uid}`} cx="50%" cy="40%" r="80%">
            <stop offset="0" stopColor="#fdfbf5" />
            <stop offset="1" stopColor="#e9e1cf" />
          </radialGradient>
          <filter id={`ink${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={Math.max(1.2, B * 0.05)} />
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#paper${uid})`} />
        {/* ruled lines and the red margin */}
        {Array.from({ length: Math.ceil(h / g.rh) + 2 }, (_, i) => {
          const y0 = g.top + g.rh * 0.85;
          const y = y0 - Math.ceil(y0 / g.rh) * g.rh + i * g.rh;
          return <line key={i} x1={0} y1={y} x2={w} y2={y} stroke="#9fb8d9" strokeOpacity={0.4} strokeWidth={1} />;
        })}
        <line x1={g.x - g.rh * 0.45} y1={0} x2={g.x - g.rh * 0.45} y2={h} stroke="#e46b6b" strokeOpacity={0.55} strokeWidth={1.5} />
        <text x={g.x} y={g.top - g.rh * 0.55} fontFamily="'Archivo Variable', Archivo, system-ui, sans-serif" fontWeight={800} fontSize={g.rh * 0.42} fill="#22242c">
          Today
        </text>
        {ITEMS.map((label, i) => {
          const it = s.it[i];
          const cy = g.top + i * g.rh + g.rh / 2;
          const bx = g.x;
          const by = cy - B / 2;
          const bs = 1 + it.b.x * 0.06;
          const d = penEase(clamp(it.draw));
          const st = clamp(it.strike);
          const tx = bx + B * 1.6;
          const tw = label.length * fs * 0.52;
          const strikeD = `M${tx - fs * 0.2} ${cy + fs * 0.02} C${tx + tw * 0.3} ${cy - fs * 0.12} ${tx + tw * 0.6} ${cy + fs * 0.16} ${tx + tw + fs * 0.3} ${cy - fs * 0.05}`;
          const stLen = tw * 1.05 + fs * 0.6;
          if (s.pen === i) {
            // where the nib is right now
            if (it.draw < 1) {
              const u = d;
              nib.p =
                u < 0.3
                  ? { x: bx + B * (0.18 + 0.24 * (u / 0.3)), y: by + B * (0.5 + 0.36 * (u / 0.3)) }
                  : { x: bx + B * (0.42 + 0.7 * ((u - 0.3) / 0.7)), y: by + B * (0.86 - 0.98 * ((u - 0.3) / 0.7)) };
            } else nib.p = { x: tx - fs * 0.2 + (tw + fs * 0.5) * st, y: cy };
          }
          return (
            <g key={i}>
              <g transform={`translate(${bx + B / 2} ${cy}) scale(${bs}) translate(${-bx - B / 2} ${-cy})`}>
                <path d={sketchBox(bx, by, B, i)} fill="none" stroke="#2b2f3a" strokeWidth={Math.max(1.5, B * 0.07)} strokeLinecap="round" strokeLinejoin="round" filter={`url(#ink${uid})`} />
                {d > 0 && <path d={ck(bx, by)} fill="none" stroke={ink} strokeWidth={Math.max(2.5, B * 0.13)} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${ckLen * d} ${ckLen}`} filter={`url(#ink${uid})`} />}
              </g>
              <text x={tx} y={cy} dominantBaseline="central" fontFamily={ui} fontWeight={500} fontSize={fs} fill={st > 0.9 ? '#8a8576' : '#22242c'}>
                {label}
              </text>
              {st > 0 && <path d={strikeD} fill="none" stroke={ink} strokeWidth={Math.max(2, fs * 0.12)} strokeLinecap="round" strokeDasharray={`${stLen * st} ${stLen}`} filter={`url(#ink${uid})`} opacity={0.9} />}
            </g>
          );
        })}
        {/* the pen nib, tilted like it's held in a right hand */}
        {nib.p && (
          <g transform={`translate(${nib.p.x} ${nib.p.y}) rotate(35)`}>
            <path d={`M0 0 L${-B * 0.12} ${-B * 0.4} L${-B * 0.12} ${-B * 2.4} L${B * 0.12} ${-B * 2.4} L${B * 0.12} ${-B * 0.4} Z`} fill="#22242c" opacity={0.92} />
            <path d={`M0 0 L${-B * 0.12} ${-B * 0.4} L${B * 0.12} ${-B * 0.4} Z`} fill="#c9a24a" />
            <rect x={-B * 0.12} y={-B * 1.7} width={B * 0.24} height={B * 0.1} fill="#c9a24a" opacity={0.8} />
          </g>
        )}
      </svg>
      {ITEMS.map((label, i) => (
        <button
          key={i}
          type="button"
          role="checkbox"
          aria-checked={s.it[i].on}
          aria-label={label}
          style={{ position: 'absolute', left: g.x - g.rh * 0.3, top: g.top + i * g.rh, width: g.lw, height: g.rh, opacity: 0 }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
          }}
        />
      ))}
    </Stage>
  );
}
