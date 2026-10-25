import { useId } from 'react';
import type { ReactNode } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, lerp, smooth } from '../kit';
import type { Spring, Frame } from '../kit';

/**
 * Press Send and the message folds itself into a paper plane: the top corners crease in, the
 * sheet narrows into a dart, lifts into 3D and loops away across the sky.
 */

type Phase = 'compose' | 'fold' | 'narrow' | 'fly' | 'sent';

interface S {
  phase: Phase;
  timer: number;
  btn: Spring;
  btnDown: boolean;
  idle: number;
  trail: { x: number; y: number }[];
  slide: Spring; // the next sheet sliding up
  toast: Spring;
  seed: number;
}

const FOLD = 0.5;
const NARROW = 0.45;
const FLY = 1.9;

function geom(w: number, h: number) {
  const ph = Math.min(h * 0.64, w * 0.78 * 1.38);
  const pw = ph / 1.38;
  const u = pw / 2; // paper units: x −1..1, y 0..2.76
  const cx = w / 2;
  const top = h * 0.44 - ph / 2;
  const btn = { x: cx - u * 0.62, y: top + ph + h * 0.035, w: u * 1.24, h: Math.max(30, u * 0.32) };
  return { pw, ph, u, cx, top, btn };
}

function send(s: S, f: Frame) {
  s.phase = 'fold';
  s.timer = 0;
  s.trail = [];
  f.emit({ name: 'click', gain: 0.55 });
  f.emit({ name: 'paper', gain: 0.6, rate: 1 });
}

export const sim = defineSim<S>({
  init: () => ({ phase: 'compose', timer: 0, btn: sp(0), btnDown: false, idle: 0, trail: [], slide: sp(0), toast: sp(0), seed: 0 }),
  step(s, f) {
    const g = geom(f.w, f.h);
    s.timer += f.dt;
    const onBtn = f.p.x > g.btn.x && f.p.x < g.btn.x + g.btn.w && f.p.y > g.btn.y && f.p.y < g.btn.y + g.btn.h;
    if (f.pressed) s.idle = 0;
    else s.idle += f.dt;
    if (s.phase === 'compose') {
      if (f.pressed && onBtn) s.btnDown = true;
      const auto = f.live && s.idle > 2.6 && s.timer > 1;
      if (auto && !s.btnDown) {
        s.btnDown = true;
        s.idle = 2.2;
      }
      if (s.btnDown && ((!f.p.down && !auto) || (auto && s.btn.x > 0.9))) {
        s.btnDown = false;
        send(s, f);
      }
      for (const a of f.actions) if (a.type === 'send') send(s, f);
    } else if (s.phase === 'fold' && s.timer > FOLD) {
      s.phase = 'narrow';
      s.timer = 0;
      f.emit({ name: 'paper', gain: 0.5, rate: 1.15 });
    } else if (s.phase === 'narrow' && s.timer > NARROW) {
      s.phase = 'fly';
      s.timer = 0;
      f.emit({ name: 'whoosh', gain: 0.85, rate: 1 });
    } else if (s.phase === 'fly') {
      const pos = flight(s.timer / FLY, g, f.w, f.h);
      s.trail.push({ x: pos.x, y: pos.y });
      if (s.trail.length > 70) s.trail.shift();
      if (Math.abs(s.timer - FLY * 0.42) < f.dt / 2 + 1e-4) f.emit({ name: 'swoosh', gain: 0.5, rate: 1.2 });
      if (s.timer > FLY) {
        s.phase = 'sent';
        s.timer = 0;
        s.toast.v = 9;
        f.emit({ name: 'success', gain: 0.6 });
      }
    } else if (s.phase === 'sent') {
      if (s.trail.length) s.trail.shift();
      if (s.timer > 0.5 && s.slide.x < 0.5 && s.timer < 0.6) f.emit({ name: 'rustle', gain: 0.35 });
      if (s.timer > 1.6) {
        s.phase = 'compose';
        s.timer = 0;
        s.idle = 0;
        s.seed++;
      }
    }
    spring(s.btn, s.btnDown ? 1 : 0, 700, 26, f.dt);
    spring(s.toast, s.phase === 'sent' && s.timer < 1.3 ? 1 : 0, 240, 16, f.dt);
    spring(s.slide, s.phase === 'sent' && s.timer > 0.5 ? 1 : 0, 160, 18, f.dt);
    if (s.phase === 'compose') s.slide.x = 0;
  },
});

/** the flight: a short climb, a loop, then away to the upper right; z grows (smaller) at the end */
function flight(u: number, g: ReturnType<typeof geom>, w: number, h: number) {
  const sx = g.cx;
  const sy = g.top + g.u * 1.3;
  const R = Math.min(w, h) * 0.2;
  let x: number, y: number, z: number;
  const v = clamp(u);
  const lx = sx - R * 0.6; // the left side of the loop
  const ccy = sy - R * 0.9;
  if (v < 0.3) {
    const k = smooth(v / 0.3);
    // a small dip (anticipation), then up and to the left
    x = sx + (lx - sx) * k;
    y = sy + Math.sin(k * Math.PI) * R * 0.15 - k * R * 0.9;
    z = 0;
  } else if (v < 0.72) {
    // a full loop, clockwise on screen: up the left side, over the top
    const k = (v - 0.3) / 0.42;
    const a = Math.PI + k * Math.PI * 2;
    x = lx + R + Math.cos(a) * R;
    y = ccy + Math.sin(a) * R;
    z = Math.sin(k * Math.PI) * 0.6;
  } else {
    const k = (v - 0.72) / 0.28;
    x = lx + w * 0.75 * k * k;
    y = ccy - h * 0.75 * k;
    z = k * k * 5;
  }
  return { x, y, z };
}

type V3 = [number, number, number];
function rot(p: V3, yaw: number, pitch: number, roll: number): V3 {
  let [x, y, z] = p;
  // roll about the plane's long axis (y)
  let c = Math.cos(roll),
    s = Math.sin(roll);
  [x, z] = [x * c + z * s, -x * s + z * c];
  // pitch about x
  c = Math.cos(pitch);
  s = Math.sin(pitch);
  [y, z] = [y * c - z * s, y * s + z * c];
  // yaw about the view axis
  c = Math.cos(yaw);
  s = Math.sin(yaw);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

const ui = "'Inter Variable', Inter, system-ui, sans-serif";

export default function PaperPlaneSend() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const { u, cx, top } = g;
  const P = (x: number, y: number) => [cx + x * u, top + y * u] as const;
  const pts = (arr: (readonly [number, number])[]) => arr.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  const fold = s.phase === 'fold' ? smooth(s.timer / FOLD) : s.phase === 'compose' ? 0 : 1;
  const narrow = s.phase === 'narrow' ? smooth(s.timer / NARROW) : s.phase === 'fly' || s.phase === 'sent' ? 1 : 0;
  const flying = s.phase === 'fly';
  const showSheet = s.phase === 'compose' || s.phase === 'fold' || s.phase === 'narrow';

  // ── the flat sheet: pentagon outline after the first fold, narrowing into a dart
  const WD = 0.78;
  const L = 2.5;
  const pent: [number, number][] = [
    [0, 0],
    [lerp(-1, -WD * 0.5, narrow), lerp(fold > 0 ? 1 : 0, L * 0.5, narrow)],
    [lerp(-1, -WD, narrow), lerp(2.76, L, narrow)],
    [lerp(1, WD, narrow), lerp(2.76, L, narrow)],
    [lerp(1, WD * 0.5, narrow), lerp(fold > 0 ? 1 : 0, L * 0.5, narrow)],
  ];
  // before the fold the top edge is flat: use the rectangle
  const sheet: [number, number][] = fold > 0 || narrow > 0 ? pent : [[-1, 0], [-1, 0], [-1, 2.76], [1, 2.76], [1, 0]];

  // the corner flaps rotate about the creases (0,0)–(∓1,1): orthographic, so the part across the crease scales by cos θ
  const th = fold * Math.PI;
  const flap = (side: -1 | 1) => {
    const corner: [number, number] = [side, 0];
    // foot of the corner on the crease line through (0,0) direction (side,1)/√2
    const d = [side / Math.SQRT2, 1 / Math.SQRT2];
    const dot = corner[0] * d[0] + corner[1] * d[1];
    const foot: [number, number] = [d[0] * dot, d[1] * dot];
    const c2: [number, number] = [foot[0] + (corner[0] - foot[0]) * Math.cos(th), foot[1] + (corner[1] - foot[1]) * Math.cos(th)];
    const a: [number, number] = [0, 0];
    const b: [number, number] = [side, 1];
    // during the narrowing the flap follows the outline
    const bb: [number, number] = [lerp(b[0], side * WD * 0.5, narrow), lerp(b[1], L * 0.5, narrow)];
    const cc: [number, number] = [lerp(c2[0], side * 0.02, narrow), lerp(c2[1], L * 0.62, narrow)];
    return { tri: [a, bb, cc].map(([x, y]) => P(x, y)), back: Math.cos(th) < 0 };
  };

  // ── the 3D plane while flying
  let plane: ReactNode = null;
  if (flying) {
    const k = s.timer / FLY;
    const p0 = flight(k, g, w, h);
    const p1 = flight(k + 0.01, g, w, h);
    const yaw = Math.atan2(p1.y - p0.y, p1.x - p0.x) + Math.PI / 2;
    const lift = smooth(k / 0.12);
    const pitch = -0.55 * lift - (k > 0.72 ? (k - 0.72) * 1.6 : 0);
    const inLoop = k > 0.3 && k < 0.72;
    const roll = (inLoop ? Math.sin(((k - 0.3) / 0.42) * Math.PI) * 0.7 : 0) + Math.sin(k * 9) * 0.08;
    const sc = (u / (1 + p0.z * 0.45)) * 0.95;
    const dep = 0.42 * lift;
    const dih = 0.18 * lift;
    const V: Record<string, V3> = {
      n: [0, -L * 0.6, 0],
      l: [-WD, L * 0.4, -dih],
      r: [WD, L * 0.4, -dih],
      t: [0, L * 0.4, 0],
      k: [0, L * 0.4, dep],
      kn: [0, -L * 0.45, dep * 0.15],
    };
    const proj = (q: V3) => {
      const [x, y, z] = rot(q, yaw, pitch, roll);
      const pz = 1 / (1 + z * 0.08);
      return { x: p0.x + x * sc * pz, y: p0.y + y * sc * pz, z };
    };
    const P3 = Object.fromEntries(Object.entries(V).map(([key, q]) => [key, proj(q)]));
    const faces = [
      { v: ['n', 'l', 't'], c: 'wl' },
      { v: ['n', 't', 'r'], c: 'wr' },
      { v: ['n', 'k', 't'], c: 'kl' },
      { v: ['kn', 'k', 't'], c: 'kr' },
    ];
    const light: V3 = [-0.4, -0.6, -0.7];
    const shaded = faces
      .map((fc) => {
        const [a, b, c] = fc.v.map((key) => rot(V[key], yaw, pitch, roll));
        const ux = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const vx = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const n = [ux[1] * vx[2] - ux[2] * vx[1], ux[2] * vx[0] - ux[0] * vx[2], ux[0] * vx[1] - ux[1] * vx[0]];
        const len = Math.hypot(n[0], n[1], n[2]) || 1;
        const lam = Math.abs((n[0] * light[0] + n[1] * light[1] + n[2] * light[2]) / len);
        const z = (a[2] + b[2] + c[2]) / 3;
        return { fc, lam, z };
      })
      .sort((p, q) => q.z - p.z);
    const shadow = { x: p0.x + 30 * (1 + p0.z), y: p0.y + 50 * (1 + p0.z * 0.5) };
    plane = (
      <g>
        <ellipse cx={shadow.x} cy={shadow.y} rx={sc * 0.9} ry={sc * 0.35} fill="#2b4d7a" opacity={0.12 / (1 + p0.z)} filter={`url(#soft${uid})`} />
        {shaded.map(({ fc, lam }) => {
          const l = Math.round(205 + lam * 50);
          return (
            <polygon
              key={fc.c}
              points={fc.v.map((key) => `${P3[key].x.toFixed(1)},${P3[key].y.toFixed(1)}`).join(' ')}
              fill={`rgb(${l},${l},${Math.min(255, l + 4)})`}
              stroke="rgba(60,80,110,.35)"
              strokeWidth={0.8}
              strokeLinejoin="round"
            />
          );
        })}
      </g>
    );
  }

  const trail = s.trail.length > 2 ? `M${s.trail.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L')}` : '';
  const textOp = 1 - clamp(fold * 1.6) * 0.15 - narrow * 1.6;
  const lines = ['Hi Anna,', 'The final designs are ready —', 'have a look when you can.', 'Talk soon,', 'David'];
  const sl = s.slide.x;
  const b = s.btn.x;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'linear-gradient(180deg,#bcd6f5 0%,#dce9f8 55%,#f3ece2 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <filter id={`soft${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={Math.max(4, u * 0.08)} />
          </filter>
          <filter id={`cloud${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={Math.max(6, u * 0.12)} />
          </filter>
          <linearGradient id={`paper${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#f1efe9" />
          </linearGradient>
        </defs>
        {/* drifting clouds */}
        {[0, 1, 2].map((i) => {
          const x = ((fx.t * (8 + i * 4) + i * w * 0.4) % (w * 1.4)) - w * 0.2;
          const y = h * (0.12 + i * 0.13);
          return (
            <g key={i} filter={`url(#cloud${uid})`} opacity={0.85}>
              <ellipse cx={x} cy={y} rx={u * 0.9} ry={u * 0.22} fill="#fff" />
              <ellipse cx={x + u * 0.35} cy={y - u * 0.12} rx={u * 0.45} ry={u * 0.22} fill="#fff" />
            </g>
          );
        })}
        {trail && <path d={trail} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={Math.max(1.5, u * 0.025)} strokeDasharray={`${u * 0.06} ${u * 0.07}`} strokeLinecap="round" />}

        {showSheet && (
          <g>
            {/* shadow under the paper */}
            <polygon points={pts(sheet.map(([x, y]) => P(x + 0.05, y + 0.08)))} fill="#2b4d7a" opacity={0.18} filter={`url(#soft${uid})`} />
            <polygon points={pts(sheet.map(([x, y]) => P(x, y)))} fill={`url(#paper${uid})`} stroke="rgba(60,80,110,.18)" strokeWidth={1} strokeLinejoin="round" />
            <clipPath id={`sheet${uid}`}>
              <polygon points={pts(sheet.map(([x, y]) => P(x, y)))} />
            </clipPath>
            {/* the letter */}
            <g opacity={clamp(textOp)} fontFamily={ui} clipPath={`url(#sheet${uid})`}>
              <text x={cx - u * 0.8} y={top + u * 0.42} fontSize={u * 0.1} fill="#7a8599" letterSpacing={u * 0.01}>
                TO: ANNA KOVÁCS
              </text>
              <line x1={cx - u * 0.8} x2={cx + u * 0.8} y1={top + u * 0.55} y2={top + u * 0.55} stroke="#e3e0d8" />
              {lines.map((ln, i) => (
                <text key={i} x={cx - u * 0.8} y={top + u * (0.95 + i * 0.27 + (i > 2 ? 0.18 : 0))} fontSize={u * 0.125} fill="#2a2f3a" fontWeight={i === 4 ? 600 : 400}>
                  {ln}
                </text>
              ))}
            </g>
            {/* crease lines */}
            {(fold > 0 || narrow > 0) && (
              <g stroke="rgba(60,80,110,.28)" strokeWidth={1}>
                <line x1={cx} y1={top} x2={cx} y2={top + lerp(2.76, L, narrow) * u} strokeOpacity={0.3 + narrow * 0.7} />
              </g>
            )}
            {fold > 0 &&
              ([-1, 1] as const).map((side) => {
                const fl = flap(side);
                return (
                  <polygon
                    key={side}
                    points={pts(fl.tri)}
                    fill={fl.back ? '#ebe8e1' : '#ffffff'}
                    stroke="rgba(60,80,110,.3)"
                    strokeWidth={1}
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 1px 1.5px rgba(30,40,60,.18))' }}
                  />
                );
              })}
          </g>
        )}
        {plane}

        {/* the next sheet slides up */}
        {s.phase === 'sent' && sl > 0.01 && (
          <g transform={`translate(0 ${(1 - sl) * (h - top + 20)})`}>
            <rect x={cx - u} y={top} width={u * 2} height={u * 2.76} fill={`url(#paper${uid})`} stroke="rgba(60,80,110,.18)" />
            <text x={cx - u * 0.8} y={top + u * 0.42} fontSize={u * 0.1} fill="#7a8599" fontFamily={ui}>
              TO:
            </text>
          </g>
        )}
      </svg>

      {/* send button */}
      <button
        type="button"
        aria-label="Send message"
        style={{
          position: 'absolute',
          left: g.btn.x,
          top: g.btn.y + b * 2,
          width: g.btn.w,
          height: g.btn.h,
          borderRadius: g.btn.h,
          border: 0,
          background: s.phase === 'compose' ? 'linear-gradient(180deg,#ff7a3d,#ff5f1f)' : '#9fb3cc',
          color: '#fff',
          fontFamily: ui,
          fontWeight: 650,
          fontSize: g.btn.h * 0.38,
          letterSpacing: '.02em',
          transform: `scale(${1 - b * 0.05})`,
          boxShadow: `0 ${8 - b * 6}px ${20 - b * 14}px rgba(255,95,31,${0.35 - b * 0.2})`,
          opacity: s.phase === 'compose' ? 1 : 0.6,
          cursor: 'pointer',
        }}
        onClick={() => fx.dispatch({ type: 'send' })}
        tabIndex={0}
      >
        Send ✈
      </button>

      {/* the toast */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: h * 0.06,
          transform: `translate(-50%, ${(1 - s.toast.x) * -h * 0.15}px) scale(${0.8 + 0.2 * s.toast.x})`,
          opacity: clamp(s.toast.x),
          background: '#14213a',
          color: '#fff',
          borderRadius: 999,
          padding: `${u * 0.08}px ${u * 0.2}px`,
          fontFamily: ui,
          fontSize: Math.max(12, u * 0.12),
          fontWeight: 600,
          boxShadow: '0 12px 30px rgba(20,33,58,.3)',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#5eead4' }}>✓</span> Sent to Anna
      </div>
    </Stage>
  );
}
