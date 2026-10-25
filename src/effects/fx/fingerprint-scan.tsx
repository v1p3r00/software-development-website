import { useId, useMemo } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * Fingerprint scan. Hold on the sensor: a scan line sweeps the pad and the ridges of the print
 * light up one by one from the core outward, each one drawing itself in. When the last ridge
 * lands everything flashes green, a ring rolls out and the padlock springs open.
 */

const RINGS = 11;
const SCAN = 1.7; // seconds of holding to complete

interface S {
  prog: number;
  holding: boolean;
  done: number; // seconds since unlock (-1 = locked)
  press: Spring;
  shackle: Spring;
  lit: number; // segments lit (to emit ticks)
  idle: number;
  demo: number;
  t: number;
}

interface Seg {
  d: string;
  len: number;
}

// deterministic hash for the ridge gaps
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** a whorl print: wobbly nested ellipses, each broken into a few ridge segments */
function ridges(R: number): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < RINGS; i++) {
    const r = R * (0.1 + (i / (RINGS - 1)) * 0.9);
    const cx = Math.sin(i * 0.7) * R * 0.03;
    const cy = -i * R * 0.012;
    // the open bottom of the outer rings, plus 1–2 random gaps
    const open = i > 6 ? 0.9 + (i - 6) * 0.12 : 0.25;
    const start = Math.PI / 2 + open / 2;
    const end = Math.PI / 2 + Math.PI * 2 - open / 2;
    const cuts = [start];
    const nGap = i < 2 ? 0 : 1 + Math.floor(hash(i) * 2);
    for (let k = 0; k < nGap; k++) cuts.push(start + (end - start) * ((k + 0.3 + hash(i * 7 + k) * 0.5) / (nGap + 0.2)));
    cuts.push(end);
    for (let k = 0; k < cuts.length - 1; k++) {
      const a0 = cuts[k] + (k ? 0.12 : 0);
      const a1 = cuts[k + 1] - (k < cuts.length - 2 ? 0.12 : 0);
      if (a1 - a0 < 0.2) continue;
      let d = '';
      let len = 0;
      let px = 0;
      let py = 0;
      const n = Math.max(8, Math.ceil((a1 - a0) * 12));
      for (let j = 0; j <= n; j++) {
        const a = a0 + ((a1 - a0) * j) / n;
        const wob = 1 + 0.035 * Math.sin(a * 3 + i) + 0.02 * Math.sin(a * 7 - i * 2);
        const x = cx + Math.cos(a) * r * 0.82 * wob;
        const y = cy + Math.sin(a) * r * 1.0 * wob;
        if (j) len += Math.hypot(x - px, y - py);
        d += `${j ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
        px = x;
        py = y;
      }
      out.push({ d, len });
    }
  }
  return out;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const R = Math.min(m * 0.24, 190);
  return { cx: w / 2, cy: h / 2 - m * 0.04, R, m };
}

export const sim = defineSim<S>({
  init: () => ({ prog: 0, holding: false, done: -1, press: sp(), shackle: sp(), lit: 0, idle: 0, demo: 0, t: 0 }),
  step(s, f) {
    const { cx, cy, R } = geom(f.w, f.h);
    const dt = f.dt;
    s.t += dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;
    const onPad = Math.abs(f.p.x - cx) < R * 1.05 && Math.abs(f.p.y - cy) < R * 1.25;
    if (f.pressed && onPad && s.done < 0) {
      s.holding = true;
      f.emit({ name: 'tick', gain: 0.4, rate: 0.7 });
    }
    if (!f.p.down) s.holding = false;
    let demoHold = false;
    if (s.idle > 2.2 && !f.p.down) {
      s.demo += dt;
      demoHold = s.demo % 4.6 < SCAN + 0.15;
    } else s.demo = 0;
    const hold = (s.holding || demoHold) && s.done < 0;

    if (s.done < 0) {
      s.prog = hold ? Math.min(1, s.prog + dt / SCAN) : approach(s.prog, 0, 4, dt);
      const lit = Math.floor(s.prog * 30);
      if (hold && lit > s.lit) f.emit({ name: 'tick', gain: 0.18, rate: 1 + s.prog * 0.9 });
      s.lit = lit;
      if (s.prog >= 1) {
        s.done = 0;
        s.holding = false;
        f.emit({ name: 'success', gain: 0.9 });
        f.emit({ name: 'click', gain: 0.6, rate: 0.8 });
      }
    } else {
      s.done += dt;
      if (s.done > 2.4) {
        s.done = -1;
        s.prog = 0;
        s.lit = 0;
        f.emit({ name: 'click', gain: 0.4, rate: 1.2 });
      }
    }
    spring(s.press, hold ? 1 : 0, 300, 20, dt);
    spring(s.shackle, s.done >= 0 ? 1 : 0, 220, s.done >= 0 ? 9 : 20, dt);
  },
});

export default function FingerprintScan() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const { cx, cy, R } = geom(w, h);
  const segs = useMemo(() => ridges(R * 0.78), [R]);
  const done = s.done >= 0;
  const dn = done ? s.done : 0;
  const p = s.prog;
  const n = segs.length;
  const press = s.press.x;
  // scan line bounces over the pad while scanning
  const scanY = cy + Math.sin(t * 4.2) * R * 0.85;
  const accent = done ? '#3dffa0' : '#38d6ff';
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const mono = "'JetBrains Mono Variable', monospace";
  const ly = cy + R * 1.62; // lock row
  const lk = Math.max(10, R * 0.13);
  const sh = clamp(s.shackle.x, -0.2, 1.3);

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(100% 80% at 50% 35%, #0f2230 0%, #08131c 55%, #04080c 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`pad${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#13283a" />
            <stop offset="1" stopColor="#0a1622" />
          </linearGradient>
          <radialGradient id={`touch${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={accent} stopOpacity="0.28" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`scan${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#38d6ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#bff3ff" stopOpacity="1" />
            <stop offset="1" stopColor="#38d6ff" stopOpacity="0" />
          </linearGradient>
          <filter id={`gl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={R * 0.035} />
          </filter>
          <clipPath id={`clip${uid}`}>
            <rect x={cx - R} y={cy - R * 1.2} width={R * 2} height={R * 2.4} rx={R * 0.38} />
          </clipPath>
        </defs>
        {done && dn < 0.8 && <rect x={cx - R - dn * R} y={cy - R * 1.2 - dn * R} width={R * 2 + dn * R * 2} height={R * 2.4 + dn * R * 2} rx={R * 0.38 + dn * R} fill="none" stroke="#3dffa0" strokeWidth={R * 0.05 * (1 - dn / 0.8)} opacity={1 - dn / 0.8} />}
        {/* the sensor pad */}
        <rect x={cx - R} y={cy - R * 1.2} width={R * 2} height={R * 2.4} rx={R * 0.38} fill={`url(#pad${uid})`} stroke={accent} strokeOpacity={0.25 + p * 0.5} strokeWidth={1.5} />
        <g clipPath={`url(#clip${uid})`}>
          <ellipse cx={cx} cy={cy} rx={R * 0.95} ry={R * 1.15} fill={`url(#touch${uid})`} opacity={press + (done ? 1 - dn / 2.4 : 0)} />
          <g transform={`translate(${cx} ${cy}) scale(${1 - press * 0.02})`} fill="none" strokeLinecap="round">
            {segs.map((sg, i) => {
              // each segment owns a slice of the progress and draws itself in during it
              const k = clamp(p * n * 1.08 - i);
              const fl = done ? 1 : smooth(k);
              return (
                <g key={i}>
                  <path d={sg.d} stroke="#2c4a60" strokeWidth={R * 0.035} opacity={0.9} />
                  {fl > 0 && <path d={sg.d} stroke={accent} strokeWidth={R * 0.06} strokeDasharray={`${sg.len * fl} ${sg.len}`} filter={`url(#gl${uid})`} opacity={0.8} />}
                  {fl > 0 && <path d={sg.d} stroke={done ? '#c9ffe4' : '#c4f3ff'} strokeWidth={R * 0.03} strokeDasharray={`${sg.len * fl} ${sg.len}`} />}
                </g>
              );
            })}
          </g>
          {!done && p > 0.01 && (
            <g opacity={Math.min(1, p * 6) * (s.press.x > 0.1 || p < 1 ? 1 : 0)}>
              <rect x={cx - R} y={scanY - R * 0.12} width={R * 2} height={R * 0.12} fill="#38d6ff" opacity={0.12} />
              <rect x={cx - R} y={scanY - 1} width={R * 2} height={2.5} fill={`url(#scan${uid})`} />
            </g>
          )}
        </g>
        {/* padlock + status */}
        <g transform={`translate(${cx - R * 0.55} ${ly})`}>
          <path d={`M${-lk * 0.55} ${-lk * 0.1} V${-lk * 0.55 - sh * lk * 0.5} A${lk * 0.55} ${lk * 0.55} 0 0 1 ${lk * 0.55} ${-lk * 0.55 - sh * lk * 0.5} V${-lk * 0.1 - sh * lk * 0.5}`} transform={`rotate(${sh * -18} ${-lk * 0.55} ${-lk * 0.1})`} fill="none" stroke={done ? '#3dffa0' : '#8fb4c9'} strokeWidth={lk * 0.2} strokeLinecap="round" />
          <rect x={-lk * 0.85} y={-lk * 0.2} width={lk * 1.7} height={lk * 1.3} rx={lk * 0.25} fill={done ? '#3dffa0' : '#8fb4c9'} />
          <circle cx={0} cy={lk * 0.4} r={lk * 0.17} fill="#08131c" />
        </g>
        <text x={cx - R * 0.55 + lk * 1.4} y={ly + lk * 0.3} dominantBaseline="middle" fontFamily={ui} fontWeight={600} fontSize={lk * 1.15} fill={done ? '#3dffa0' : '#cfe7f3'}>
          {done ? 'Unlocked' : p > 0.01 ? 'Scanning' : 'Hold to unlock'}
        </text>
        {!done && p > 0.01 && (
          <text x={cx + R} y={cy - R * 1.32} textAnchor="end" fontFamily={mono} fontSize={Math.max(10, R * 0.09)} fill="#38d6ff" opacity={0.85}>
            {`${Math.round(p * 100)}%`}
          </text>
        )}
        <text x={cx - R} y={cy - R * 1.32} fontFamily={mono} fontSize={Math.max(10, R * 0.09)} fill="#5c7f93" opacity={0.85}>
          TOUCH ID
        </text>
      </svg>
      <button
        type="button"
        aria-label="Hold to scan fingerprint"
        style={{ position: 'absolute', left: cx - R, top: cy - R * 1.2, width: R * 2, height: R * 2.4, opacity: 0, borderRadius: R * 0.38 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
