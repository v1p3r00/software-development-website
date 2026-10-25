import { useId } from 'react';
import type { PointerEvent as RPE } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * Ink underline. Click a field: a drop of ink lands exactly where you clicked and bleeds outward
 * along the baseline (fast at first, slowing like real diffusion), with a few spatters and a wet
 * sheen that dries. The label floats up and takes the ink colour. Leave an empty field and the ink fades.
 */

const FIELDS = ['Full name', 'Email address'];
const DEMO = ['Ada Lovelace', 'ada@analytical.engine'];

interface Ink {
  x0: number; // click point, 0..1 of the field width
  age: number; // seconds since the drop
  alive: number; // 0..1 (fades out on blur when empty)
  drops: number[][]; // [dx (0..1), dy (units of line), r, delay]
}

interface S {
  val: string[];
  focus: number; // focused field, -1 none
  ink: (Ink | null)[];
  lab: Spring[]; // label float 0..1
  idle: number;
  demo: number;
  demoK: number;
  user: boolean; // a real focus is active
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const fw = Math.min(w * 0.78, m * 1.1, 460);
  const fh = Math.min(m * 0.13, 64);
  const gap = fh * 1.55;
  return { fw, fh, x: w / 2 - fw / 2, y0: h / 2 - gap / 2 - fh * 0.15, gap };
}

function drop(s: S, i: number, x0: number, rand: () => number, emit: (x: { name: string; gain?: number; rate?: number; pan?: number }) => void) {
  const drops: number[][] = [];
  for (let k = 0; k < 5; k++) drops.push([(rand() - 0.5) * 0.12, -1.5 - rand() * 3.5, 0.3 + rand() * 0.9, rand() * 0.08]);
  s.ink[i] = { x0, age: 0, alive: 1, drops };
  emit({ name: 'drip', gain: 0.5, rate: 0.9 + rand() * 0.2, pan: (x0 - 0.5) * 0.8 });
}

export const sim = defineSim<S>({
  init: () => ({ val: ['', ''], focus: -1, ink: [null, null], lab: [sp(), sp()], idle: 0, demo: 0, demoK: -1, user: false }),
  step(s, f) {
    const dt = f.dt;
    if (f.p.over || f.p.down || s.user) s.idle = 0;
    else s.idle += dt;
    for (const a of f.actions) {
      const i = Number(a.i ?? -1);
      if (a.type === 'focus' && i >= 0) {
        if (s.focus !== i || !s.ink[i]) drop(s, i, clamp(Number(a.x ?? 0.5)), f.rand, f.emit);
        s.focus = i;
        s.user = true;
        s.demo = 0;
      }
      if (a.type === 'blur' && i === s.focus) {
        s.focus = -1;
        s.user = false;
      }
      if (a.type === 'text' && i >= 0) {
        s.val[i] = String(a.value ?? '').slice(0, 40);
        f.emit({ name: 'tick', gain: 0.15, rate: 1.2 });
      }
    }
    // self-demo: click into each field somewhere, write, then let everything dry and fade
    if (s.idle > 2.2) {
      s.demo += dt;
      const T = s.demo % 9;
      const step = T < 0.3 ? 0 : T < 3.6 ? 1 : T < 7 ? 2 : 3;
      if (step !== s.demoK) {
        s.demoK = step;
        if (step === 0) {
          s.val = ['', ''];
          s.focus = -1;
        }
        if (step === 1 || step === 2) {
          const i = step - 1;
          s.focus = i;
          drop(s, i, [0.3, 0.68][i] + (f.rand() - 0.5) * 0.15, f.rand, f.emit);
        }
        if (step === 3) s.focus = -1;
      }
      if (step === 1 || step === 2) {
        const i = step - 1;
        const n = Math.floor((T - (i ? 3.6 : 0.3) - 0.6) / 0.11);
        const txt = DEMO[i].slice(0, clamp(n, 0, DEMO[i].length));
        if (txt !== s.val[i]) {
          s.val[i] = txt;
          f.emit({ name: 'tick', gain: 0.12, rate: 1.3 });
        }
      }
    } else if (s.demoK >= 0) {
      s.demoK = -1;
      s.demo = 0;
    }
    for (let i = 0; i < FIELDS.length; i++) {
      const ink = s.ink[i];
      const keep = s.focus === i || s.val[i].length > 0;
      if (ink) {
        ink.age += dt;
        ink.alive = approach(ink.alive, keep ? 1 : 0, keep ? 8 : 2.5, dt);
        if (!keep && ink.alive < 0.01) s.ink[i] = null;
      }
      spring(s.lab[i], keep ? 1 : 0, 260, f.reduced ? 40 : 17, dt);
    }
  },
});

export default function InkInput() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const fs = g.fh * 0.36;
  const toStageX = (e: RPE<HTMLInputElement>) => {
    const r = fx.ref.current?.getBoundingClientRect();
    if (!r) return 0.5;
    return ((e.clientX - r.left) / (r.width || 1)) * w;
  };

  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(120% 100% at 50% 20%, #fbf7ee 0%, #f2ead9 60%, #e4d9c3 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          {/* paper-fibre bleed: the ink edge is displaced by fractal noise */}
          <filter id={`bleed${uid}`} x="-10%" y="-200%" width="120%" height="500%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06 0.5" numOctaves={3} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={g.fh * 0.07} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`soft${uid}`} x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation={g.fh * 0.025} />
          </filter>
        </defs>
        <text x={g.x} y={g.y0 - g.fh * 1.05} fontFamily="'Archivo Variable', Archivo, system-ui, sans-serif" fontWeight={800} fontSize={g.fh * 0.5} fill="#1d2433">
          Write to us
        </text>
        {FIELDS.map((label, i) => {
          const y = g.y0 + i * g.gap; // field top
          const base = y + g.fh * 0.92; // underline y
          const ink = s.ink[i];
          const lf = s.lab[i].x;
          let inkEl = null;
          if (ink) {
            // radius grows like diffusion: quick then slow (√t), reaching the ends in about a second
            const r = Math.min(1.25, Math.sqrt(ink.age / 1.0)) * g.fw;
            const cx = g.x + ink.x0 * g.fw;
            const left = Math.max(g.x, cx - r);
            const right = Math.min(g.x + g.fw, cx + r);
            const wet = clamp(1 - ink.age / 1.4); // glossy while wet
            const th = g.fh * (0.055 + 0.05 * wet); // thick wet line dries thinner
            const pool = g.fh * 0.13 * clamp(1 - ink.age / 0.9) + th; // the drop's pool at the click point
            const n = 40;
            let top = '';
            let bot = '';
            for (let k = 0; k <= n; k++) {
              const x = left + ((right - left) * k) / n;
              const dd = Math.abs(x - cx) / Math.max(1, g.fw * 0.12);
              const taper = clamp(Math.min(x - left, right - x) / (g.fh * 0.6) + 0.15);
              const t2 = (th + (pool - th) * Math.exp(-dd * dd)) * taper;
              top += `${k ? 'L' : 'M'}${x.toFixed(1)},${(base - t2 / 2).toFixed(1)}`;
              bot = `L${x.toFixed(1)},${(base + t2 / 2).toFixed(1)}` + bot;
            }
            inkEl = (
              <g opacity={ink.alive}>
                <path d={top + bot + 'Z'} fill="#1b2a6b" filter={`url(#bleed${uid})`} />
                <path d={top + bot + 'Z'} fill="#3b5cff" opacity={0.35 * wet} filter={`url(#soft${uid})`} />
                {/* the wet highlight */}
                <ellipse cx={cx - g.fh * 0.05} cy={base - pool * 0.2} rx={pool * 0.9} ry={pool * 0.22} fill="#fff" opacity={0.5 * wet} />
                {ink.drops.map(([dx, dy, rr, dl], k) => {
                  const a = clamp((ink.age - dl) / 0.08);
                  return <circle key={k} cx={cx + dx * g.fw} cy={base + dy * th} r={rr * g.fh * 0.045 * a} fill="#1b2a6b" opacity={0.9} filter={`url(#soft${uid})`} />;
                })}
              </g>
            );
          }
          return (
            <g key={i}>
              {/* the dry pencil rule underneath */}
              <line x1={g.x} y1={base} x2={g.x + g.fw} y2={base} stroke="#b9ad97" strokeWidth={1.2} />
              {inkEl}
              <text
                x={g.x}
                y={y + g.fh * 0.62 - lf * g.fh * 0.62}
                fontFamily={ui}
                fontWeight={lf > 0.5 ? 650 : 450}
                fontSize={fs * (1 - lf * 0.28)}
                letterSpacing={lf * fs * 0.04}
                fill={lf > 0.5 ? '#1b2a6b' : '#8a7f6c'}
                style={{ textTransform: lf > 0.5 ? 'uppercase' : 'none' }}
              >
                {label}
              </text>
              <text x={g.x} y={y + g.fh * 0.66} fontFamily={ui} fontSize={fs * 1.05} fill="#141a2e">
                {s.val[i]}
                {s.focus === i && !s.user && <tspan fill="#1b2a6b" opacity={Math.sin(fx.t * 7) > 0 ? 1 : 0}>|</tspan>}
              </text>
            </g>
          );
        })}
      </svg>
      {FIELDS.map((label, i) => (
        <input
          key={i}
          aria-label={label}
          value={s.val[i]}
          onPointerDown={(e) => fx.dispatch({ type: 'focus', i, x: (toStageX(e) - g.x) / g.fw })}
          onFocus={() => fx.dispatch({ type: 'focus', i, x: s.ink[i]?.x0 ?? 0.05 })}
          onBlur={() => fx.dispatch({ type: 'blur', i })}
          onChange={(e) => fx.dispatch({ type: 'text', i, value: e.target.value })}
          style={{
            position: 'absolute',
            left: g.x,
            top: g.y0 + i * g.gap + g.fh * 0.18,
            width: g.fw,
            height: g.fh * 0.7,
            padding: 0,
            border: 0,
            outline: 'none',
            background: 'transparent',
            color: 'transparent',
            caretColor: '#1b2a6b',
            fontFamily: ui,
            fontSize: fs * 1.05,
          }}
        />
      ))}
    </Stage>
  );
}
