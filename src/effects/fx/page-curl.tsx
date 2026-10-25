import { useId } from 'react';
import type { ReactNode } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A page you can peel. Grab a right-hand corner and drag: the fold is the perpendicular bisector
 * between the corner and your finger, the flap is the page reflected across it (we see its back),
 * and the paper can never stretch past the spine. The flap casts a soft shadow on the page and
 * the fold darkens the next page beneath. Let go past the middle and the page turns over.
 */

type V = [number, number];

const PAGES = [
  { bg: ['#ff6b4a', '#ff9a5a'], ink: '#2a0d06', kicker: 'CHAPTER ONE', title: 'Low Tide', no: '01' },
  { bg: ['#2f6bff', '#5aa0ff'], ink: '#050f2a', kicker: 'CHAPTER TWO', title: 'Blue Hour', no: '02' },
  { bg: ['#1fbf8f', '#8ee07a'], ink: '#03251b', kicker: 'CHAPTER THREE', title: 'Green Room', no: '03' },
  { bg: ['#f2c94c', '#ffe58a'], ink: '#2a2104', kicker: 'CHAPTER FOUR', title: 'Hay Fever', no: '04' },
];

interface S {
  idx: number;
  px: Spring; // the dragged corner, stage px
  py: Spring;
  corner: number; // +1 bottom-right, -1 top-right
  drag: boolean;
  turning: boolean; // released past the middle: finishing the turn
  idle: number;
  auto: number; // self-demo clock (-1 off)
}

function geom(w: number, h: number) {
  const W = Math.min(w * 0.45, h * 0.84 * 0.74);
  const H = W / 0.74;
  const x0 = w / 2;
  const y0 = (h - H) / 2;
  return { W, H, x0, y0 };
}

const cornerOf = (g: ReturnType<typeof geom>, c: number): V => [g.x0 + g.W, c > 0 ? g.y0 + g.H : g.y0];

/** keep the paper inextensible: the corner stays within reach of both spine corners */
function constrain(g: ReturnType<typeof geom>, c: number, p: V): V {
  const s1: V = [g.x0, c > 0 ? g.y0 + g.H : g.y0];
  const s2: V = [g.x0, c > 0 ? g.y0 : g.y0 + g.H];
  const lim = (q: V, s: V, r: number): V => {
    const d = Math.hypot(q[0] - s[0], q[1] - s[1]);
    return d > r ? [s[0] + ((q[0] - s[0]) * r) / d, s[1] + ((q[1] - s[1]) * r) / d] : q;
  };
  return lim(lim(p, s1, g.W), s2, Math.hypot(g.W, g.H));
}

export const sim = defineSim<S>({
  init: (w, h) => {
    const g = geom(w, h);
    const c = cornerOf(g, 1);
    return { idx: 0, px: sp(c[0]), py: sp(c[1]), corner: 1, drag: false, turning: false, idle: 0, auto: -1 };
  },
  step(s, f) {
    const g = geom(f.w, f.h);
    const { W, H, x0, y0 } = g;
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    const onPage = f.p.x > x0 && f.p.x < x0 + W && f.p.y > y0 && f.p.y < y0 + H;
    if (f.pressed && onPage && !s.turning) {
      s.drag = true;
      s.auto = -1;
      s.corner = f.p.y > y0 + H / 2 ? 1 : -1;
      f.emit({ name: 'paper', gain: 0.35, rate: 1.1 });
    }
    for (const a of f.actions) if (a.type === 'turn' && !s.turning && !s.drag) s.auto = 0;
    let C = cornerOf(g, s.corner);
    let target: V = C;
    if (s.drag) {
      target = [f.p.x, f.p.y];
      if (!f.p.down) {
        s.drag = false;
        // past the middle of the page? finish the turn, else fall back
        if (s.px.x < x0 + W * 0.55) {
          s.turning = true;
          f.emit({ name: 'whoosh', gain: 0.45, rate: 1.1 });
        } else f.emit({ name: 'paper', gain: 0.25, rate: 0.8 });
      }
    } else if (s.auto >= 0) {
      // self-demo: a hand lifts the bottom corner and sweeps it over the spine
      s.auto += f.dt;
      const e = clamp((s.auto - 0.2) / 1.1);
      const ee = e * e * (3 - 2 * e);
      target = [C[0] - W * 2 * ee, C[1] - H * 0.3 * Math.sin(Math.PI * ee) - W * 0.08 * clamp(s.auto / 0.2)];
      if (e >= 1) {
        s.auto = -1;
        s.turning = true;
        f.emit({ name: 'whoosh', gain: 0.4 });
      }
    } else if (!s.turning) {
      if (s.idle > 1.6) {
        s.auto = 0;
        s.corner = 1;
        C = cornerOf(g, 1);
      }
      // hover near a corner: it lifts a little, inviting a peel
      const near = Math.hypot(f.p.x - C[0], f.p.y - C[1]) < W * 0.3 && f.p.over;
      if (near) target = [C[0] - W * 0.09, C[1] - s.corner * W * 0.07];
      else if (f.p.over && onPage) s.corner = f.p.y > y0 + H / 2 ? 1 : -1;
    }
    if (s.turning) target = [x0 - W, C[1]];
    const tp = constrain(g, s.corner, target);
    const k = s.drag ? 520 : s.turning ? 120 : 160;
    const d = s.drag ? 38 : s.turning ? 20 : f.reduced ? 30 : 14;
    spring(s.px, tp[0], k, d, f.dt);
    spring(s.py, tp[1], k, d, f.dt);
    const cp = constrain(g, s.corner, [s.px.x, s.py.x]);
    s.px.x = cp[0];
    s.py.x = cp[1];
    // the turn lands: the next page becomes the current one
    if (s.turning && s.px.x < x0 - W * 0.96) {
      s.turning = false;
      s.idx = (s.idx + 1) % PAGES.length;
      const c = cornerOf(g, s.corner);
      s.px.x = c[0];
      s.py.x = c[1];
      s.px.v = s.py.v = 0;
      s.idle = 0; // a breath before the next self-demo
      f.emit({ name: 'paper', gain: 0.5, rate: 0.9 });
    }
  },
});

/** keep the part of a polygon on the side of the line where dot(x - m, n) * sign <= 0 */
function clipHalf(poly: V[], m: V, n: V, sign: number): V[] {
  const out: V[] = [];
  const side = (p: V) => ((p[0] - m[0]) * n[0] + (p[1] - m[1]) * n[1]) * sign;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = side(a);
    const db = side(b);
    if (da <= 0) out.push(a);
    if (da * db < 0) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}
const pts = (p: V[]) => p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');

function Page({ i, x0, y0, W, H, uid }: { i: number; x0: number; y0: number; W: number; H: number; uid: string }): ReactNode {
  const p = PAGES[i % PAGES.length];
  const u = W / 100;
  return (
    <g>
      <rect x={x0} y={y0} width={W} height={H} fill="#fbf7ef" />
      <rect x={x0 + 8 * u} y={y0 + 8 * u} width={W - 16 * u} height={H * 0.5} rx={2 * u} fill={`url(#pg${p.no}${uid})`} />
      {/* a sun / shape motif on the plate */}
      <circle cx={x0 + W * 0.66} cy={y0 + 8 * u + H * 0.22} r={W * 0.17} fill="#fff" opacity="0.35" />
      <path d={`M${x0 + 8 * u},${y0 + 8 * u + H * 0.5} L${x0 + W * 0.35},${y0 + H * 0.38} L${x0 + W * 0.55},${y0 + H * 0.46} L${x0 + W * 0.78},${y0 + H * 0.33} L${x0 + W - 8 * u},${y0 + H * 0.44} L${x0 + W - 8 * u},${y0 + 8 * u + H * 0.5} Z`} fill={p.ink} opacity="0.35" />
      <text x={x0 + 8 * u} y={y0 + H * 0.64} fontFamily="'Inter Variable', Inter, system-ui" fontWeight={700} fontSize={3.4 * u} letterSpacing={0.8 * u} fill="#9a8f7d">
        {p.kicker}
      </text>
      <text x={x0 + 8 * u} y={y0 + H * 0.64 + 12 * u} fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={850} fontSize={11 * u} fill="#1d1a16">
        {p.title}
      </text>
      {[0, 1, 2, 3, 4].map((k) => (
        <rect key={k} x={x0 + 8 * u} y={y0 + H * 0.64 + 19 * u + k * 4.6 * u} width={(k === 4 ? 0.55 : 0.95 - (k % 2) * 0.05) * (W - 16 * u)} height={1.6 * u} rx={0.8 * u} fill="#d6cfc2" />
      ))}
      <text x={x0 + W - 8 * u} y={y0 + H - 5 * u} textAnchor="end" fontFamily="'JetBrains Mono Variable', monospace" fontSize={3 * u} fill="#a59b8a">
        {p.no}
      </text>
    </g>
  );
}

export default function PageCurl() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const { W, H, x0, y0 } = g;
  const C = cornerOf(g, s.corner);
  const P: V = [s.px.x, s.py.x];
  const dx = C[0] - P[0];
  const dy = C[1] - P[1];
  const dist = Math.hypot(dx, dy);
  const rect: V[] = [
    [x0, y0],
    [x0 + W, y0],
    [x0 + W, y0 + H],
    [x0, y0 + H],
  ];
  const curled = dist > 0.5;
  const n: V = curled ? [dx / dist, dy / dist] : [1, 0];
  const M: V = [(C[0] + P[0]) / 2, (C[1] + P[1]) / 2];
  const keep = curled ? clipHalf(rect, M, n, 1) : rect;
  const gone = curled ? clipHalf(rect, M, n, -1) : [];
  // the flap: the peeled part reflected across the fold
  const flap = gone.map((q): V => {
    const dd = (q[0] - M[0]) * n[0] + (q[1] - M[1]) * n[1];
    return [q[0] - 2 * dd * n[0], q[1] - 2 * dd * n[1]];
  });
  const lift = clamp(dist / (W * 0.8));
  const half = dist / 2;
  const cur = s.idx;
  const nxt = (s.idx + 1) % PAGES.length;
  const shadowW = Math.min(W * 0.18, half * 0.6 + 2);

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: '#1b1612' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`desk${uid}`} cx="55%" cy="40%" r="85%">
            <stop offset="0" stopColor="#4a3a2c" />
            <stop offset="0.6" stopColor="#2a2019" />
            <stop offset="1" stopColor="#120e0b" />
          </radialGradient>
          {PAGES.map((p) => (
            <linearGradient key={p.no} id={`pg${p.no}${uid}`} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor={p.bg[1]} />
              <stop offset="1" stopColor={p.bg[0]} />
            </linearGradient>
          ))}
          {/* back of the flap: a bright crest near the fold, darker towards the tip */}
          <linearGradient id={`back${uid}`} gradientUnits="userSpaceOnUse" x1={M[0]} y1={M[1]} x2={M[0] - n[0] * half} y2={M[1] - n[1] * half}>
            <stop offset="0" stopColor="#cfc6b5" />
            <stop offset="0.18" stopColor="#f3ede2" />
            <stop offset="0.42" stopColor="#fffcf6" />
            <stop offset="1" stopColor="#e6dfd1" />
          </linearGradient>
          {/* shade on the next page just past the fold (the curl hovers over it) */}
          <linearGradient id={`gap${uid}`} gradientUnits="userSpaceOnUse" x1={M[0]} y1={M[1]} x2={M[0] + n[0] * shadowW} y2={M[1] + n[1] * shadowW}>
            <stop offset="0" stopColor="#000" stopOpacity={0.55 * Math.min(1, lift * 3)} />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          {/* the page bends up into the fold: darken it a touch */}
          <linearGradient id={`bend${uid}`} gradientUnits="userSpaceOnUse" x1={M[0]} y1={M[1]} x2={M[0] - n[0] * shadowW * 1.5} y2={M[1] - n[1] * shadowW * 1.5}>
            <stop offset="0" stopColor="#000" stopOpacity={0.22 * Math.min(1, lift * 3)} />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`spineL${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
          <clipPath id={`keep${uid}`}>
            <polygon points={pts(keep)} />
          </clipPath>
          <filter id={`blur${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={4 + lift * W * 0.04} />
          </filter>
          <filter id={`stack${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={W * 0.04} />
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#desk${uid})`} />
        {/* the book: the left page (already read) and a stack of edges under the right one */}
        <rect x={x0 - W - 6} y={y0 + W * 0.05} width={W * 2 + 12} height={H} rx={4} fill="#000" opacity="0.6" filter={`url(#stack${uid})`} />
        <rect x={x0 - W} y={y0} width={W} height={H} fill="#efe9dd" />
        <rect x={x0 - W} y={y0} width={W} height={H} fill={`url(#pg${PAGES[(cur + PAGES.length - 1) % PAGES.length].no}${uid})`} opacity="0.08" />
        {/* left page: the back of the last one, set as plain text */}
        {Array.from({ length: 14 }, (_, k) => (
          <rect key={k} x={x0 - W * 0.88} y={y0 + H * 0.1 + k * H * 0.058} width={W * (k % 5 === 4 ? 0.45 : 0.74)} height={H * 0.012} rx={H * 0.006} fill="#d9d1c2" />
        ))}
        <rect x={x0 - W * 0.3} y={y0} width={W * 0.3} height={H} fill={`url(#spineL${uid})`} />
        {[3, 2, 1].map((k) => (
          <rect key={k} x={x0} y={y0 + k * 1.2} width={W + k * 1.6} height={H} fill={k % 2 ? '#e2dccf' : '#efe9de'} />
        ))}
        {/* spine shadow */}
        <rect x={x0 - W * 0.12} y={y0} width={W * 0.24} height={H} fill="#000" opacity="0.08" />

        {/* next page */}
        <Page i={nxt} x0={x0} y0={y0} W={W} H={H} uid={uid} />
        {curled && <polygon points={pts(gone)} fill={`url(#gap${uid})`} />}

        {/* current page, minus the peeled part */}
        <g clipPath={`url(#keep${uid})`}>
          <Page i={cur} x0={x0} y0={y0} W={W} H={H} uid={uid} />
          <rect x={x0} y={y0} width={W} height={H} fill={`url(#bend${uid})`} />
          {/* the flap's shadow falls on the page beneath it */}
          {curled && <polygon points={pts(flap)} transform={`translate(${-n[0] * (3 + lift * 10)} ${-n[1] * (3 + lift * 10) + lift * 6})`} fill="#000" opacity={0.18 + lift * 0.2} filter={`url(#blur${uid})`} />}
        </g>
        <rect x={x0} y={y0} width={W * 0.08} height={H} fill="#000" opacity="0.06" />
        {/* the flap itself */}
        {curled && flap.length > 2 && (
          <g>
            <polygon points={pts(flap)} fill={`url(#back${uid})`} />
            <polygon points={pts(flap)} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
          </g>
        )}
      </svg>
      <button
        type="button"
        aria-label="Turn the page"
        style={{ position: 'absolute', left: x0 + W * 0.7, top: y0 + H * 0.7, width: W * 0.3, height: H * 0.3, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'turn' });
          }
        }}
      />
    </Stage>
  );
}
