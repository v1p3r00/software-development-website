import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * Liquid fill. Colour pours in from exactly where the pointer crossed the edge: two liquid layers
 * (a bright one racing ahead, a deep one behind) grow from that point. Their edges are springy —
 * moving the pointer stretches and sloshes them. Leaving drains the liquid out through the exit.
 */

const H = 5; // edge harmonics

interface Blob {
  x: Spring;
  y: Spring;
  r: Spring;
}

interface S {
  a: Blob; // bright lead layer
  b: Blob; // deep layer
  amp: Spring[]; // slosh harmonics
  phase: number[];
  svx: Spring; // stretch along the pointer's motion
  svy: Spring;
  inside: boolean;
  gx: number; // the pointer we follow (real or ghost)
  gy: number;
  gvx: number;
  gvy: number;
  ghost: number;
  idle: number;
  demo: number;
  t: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const bw = Math.min(w * 0.7, m * 1.0, 480);
  const bh = bw * 0.28;
  return { cx: w / 2, cy: h / 2, bw, bh };
}

const blob = (): Blob => ({ x: sp(), y: sp(), r: sp() });

export const sim = defineSim<S>({
  init: (w, h, rand) => ({
    a: blob(),
    b: blob(),
    amp: Array.from({ length: H }, () => sp()),
    phase: Array.from({ length: H }, () => rand() * 6.28),
    svx: sp(),
    svy: sp(),
    inside: false,
    gx: w / 2,
    gy: h / 2,
    gvx: 0,
    gvy: 0,
    ghost: 0,
    idle: 3,
    demo: 0,
    t: 0,
  }),
  step(s, f) {
    const { cx, cy, bw, bh } = geom(f.w, f.h);
    const dt = f.dt;
    s.t += dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;

    // the ghost: crosses the button on a different line every 3.2 s
    let px = f.p.x;
    let py = f.p.y;
    let over = f.p.over;
    if (s.idle > 2.2) {
      s.demo += dt;
      const n = Math.floor(s.demo / 3.2);
      const u = (s.demo % 3.2) / 3.2;
      const ang = [2.6, -0.5, 1.9, -2.3][n % 4];
      const from = [cx + Math.cos(ang) * bw * 0.75, cy + Math.sin(ang) * bh * 1.6];
      const mid = [cx + Math.cos(ang) * bw * 0.1, cy + Math.sin(ang) * bh * 0.15];
      const to = [cx - Math.cos(ang + 0.6) * bw * 0.75, cy - Math.sin(ang + 0.6) * bh * 1.6];
      const e = (v: number) => v * v * (3 - 2 * v);
      const k = u < 0.35 ? e(u / 0.35) : u < 0.65 ? 1 : 1 + e((u - 0.65) / 0.35);
      if (k <= 1) {
        px = from[0] + (mid[0] - from[0]) * k;
        py = from[1] + (mid[1] - from[1]) * k;
      } else {
        px = mid[0] + (to[0] - mid[0]) * (k - 1);
        py = mid[1] + (to[1] - mid[1]) * (k - 1);
      }
      over = true;
      s.ghost = approach(s.ghost, 1, 5, dt);
    } else {
      s.demo = 0;
      s.ghost = approach(s.ghost, 0, 12, dt);
    }
    s.gvx = dt > 0 ? (px - s.gx) / dt : 0;
    s.gvy = dt > 0 ? (py - s.gy) / dt : 0;
    s.gx = px;
    s.gy = py;

    // inside the pill?
    const r = bh / 2;
    const qx = Math.max(0, Math.abs(px - cx) - (bw / 2 - r));
    const qy = py - cy;
    const inside = over && qx * qx + qy * qy <= r * r;
    const big = Math.hypot(bw, bh) * 1.05; // radius that covers the button from anywhere
    if (inside && !s.inside) {
      // pour starts at the entry point
      for (const b of [s.a, s.b]) {
        if (b.r.x < bh * 0.2) {
          b.x.x = px;
          b.y.x = py;
          b.x.v = b.y.v = 0;
        }
      }
      for (const a of s.amp) a.v += (f.rand() - 0.5) * 3;
      f.emit({ name: 'swoosh', gain: 0.5, rate: 1.1, pan: clamp((px - cx) / bw, -1, 1) });
    }
    if (!inside && s.inside) f.emit({ name: 'drip', gain: 0.4, rate: 0.9, pan: clamp((px - cx) / bw, -1, 1) });
    s.inside = inside;

    // the liquid's centre trails the pointer (that lag is the slosh), the radius floods out
    const tx = clamp(px, cx - bw * 0.7, cx + bw * 0.7);
    const ty = clamp(py, cy - bh * 1.2, cy + bh * 1.2);
    const d = f.reduced ? 2 : 1;
    spring(s.a.x, tx, 60, 9 * d, dt);
    spring(s.a.y, ty, 60, 9 * d, dt);
    spring(s.b.x, tx, 40, 8 * d, dt);
    spring(s.b.y, ty, 40, 8 * d, dt);
    spring(s.a.r, inside ? big : 0, inside ? 50 : 90, inside ? 11 : 16, dt);
    spring(s.b.r, inside ? big : 0, inside ? 26 : 120, inside ? 9 : 20, dt);
    if (s.a.r.x < 0) s.a.r.x = 0;
    if (s.b.r.x < 0) s.b.r.x = 0;

    // stretch follows velocity; harmonics are kicked by speed and ring down
    const vmax = bw * 6;
    spring(s.svx, clamp(s.gvx, -vmax, vmax) * 0.03, 120, 10, dt);
    spring(s.svy, clamp(s.gvy, -vmax, vmax) * 0.03, 120, 10, dt);
    const speed = Math.min(1, Math.hypot(s.gvx, s.gvy) / (bw * 3));
    s.amp.forEach((a, i) => {
      a.v += (f.rand() - 0.5) * speed * 80 * dt * (inside ? 1 : 0.3);
      spring(a, 0, 40 + i * 30, 2.2 * d, dt);
      s.phase[i] += dt * (1.4 + i * 0.7);
    });
  },
});

function blobPath(cx: number, cy: number, r: number, s: S, scale: number, k: number) {
  if (r < 0.5) return '';
  const n = 72;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * Math.PI * 2;
    const c = Math.cos(th);
    const sn = Math.sin(th);
    let off = 0;
    for (let j = 0; j < H; j++) off += s.amp[j].x * Math.sin((j + 2) * th + s.phase[j] * k);
    off = off * scale * 0.16 + (c * s.svx.x + sn * s.svy.x) * 0.5;
    const rr = Math.max(0, r + off);
    d += `${i ? 'L' : 'M'}${(cx + c * rr).toFixed(1)},${(cy + sn * rr).toFixed(1)}`;
  }
  return d + 'Z';
}

export default function LiquidFillButton() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, bw, bh } = geom(w, h);
  const r = bh / 2;
  const pa = blobPath(s.a.x.x, s.a.y.x, s.a.r.x, s, bh, 1);
  const pb = blobPath(s.b.x.x, s.b.y.x, s.b.r.x, s, bh, 1.3);
  const font = "'Archivo Variable', Archivo, system-ui, sans-serif";
  const fill = clamp(s.b.r.x / (bw * 0.7));
  const label = (color: string) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontFamily={font} fontWeight={800} fontSize={bh * 0.3} letterSpacing={bh * 0.01} fill={color}>
      Start a project
    </text>
  );
  const m = Math.min(w, h);

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(120% 100% at 50% 30%, #fbf8f2 0%, #efe9df 60%, #e2dacd 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <clipPath id={`pill${uid}`}>
            <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx={r} />
          </clipPath>
          <clipPath id={`liq${uid}`}>
            <path d={pb || 'M0 0Z'} />
          </clipPath>
          <linearGradient id={`deep${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2cff" />
            <stop offset="1" stopColor="#1416b8" />
          </linearGradient>
          <filter id={`sh${uid}`} x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation={bh * 0.18} />
          </filter>
        </defs>
        {/* soft contact shadow, grows a little warmer as the button fills */}
        <rect x={cx - bw * 0.46} y={cy + bh * 0.2} width={bw * 0.92} height={bh * 0.45} rx={bh * 0.2} fill={fill > 0.5 ? '#2a2cff' : '#5a4a30'} opacity={0.18 + fill * 0.12} filter={`url(#sh${uid})`} />
        <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx={r} fill="#fffdf8" />
        <g clipPath={`url(#pill${uid})`}>
          {pa && <path d={pa} fill="#7cf0ff" />}
          {label('#16161a')}
          {pb && <path d={pb} fill={`url(#deep${uid})`} />}
          {/* a glossy surface highlight rides on the deep layer */}
          {pb && <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh * 0.45} fill="#fff" opacity={0.1} clipPath={`url(#liq${uid})`} />}
          <g clipPath={`url(#liq${uid})`}>{label('#ffffff')}</g>
        </g>
        <rect x={cx - bw / 2 + 1} y={cy - bh / 2 + 1} width={bw - 2} height={bh - 2} rx={r - 1} fill="none" stroke="#16161a" strokeWidth={Math.max(2, bh * 0.035)} />
        {s.ghost > 0.02 && (
          <g opacity={s.ghost} transform={`translate(${s.gx} ${s.gy})`}>
            <path d={`M0 0 l0 ${m * 0.05} l${m * 0.012} ${-m * 0.012} l${m * 0.012} ${m * 0.022} l${m * 0.008} ${-m * 0.004} l${-m * 0.011} ${-m * 0.021} l${m * 0.017} 0Z`} fill="#16161a" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
          </g>
        )}
      </svg>
      <button
        type="button"
        aria-label="Start a project"
        style={{ position: 'absolute', left: cx - bw / 2, top: cy - bh / 2, width: bw, height: bh, opacity: 0, borderRadius: r }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
