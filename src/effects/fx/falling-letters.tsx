import { useId } from 'react';
import { defineSim, useFx, Stage, clamp, lerp } from '../kit';

/**
 * A heading whose letters are real rigid bodies. Click it and gravity takes over: the letters
 * fall, land on their corners, bounce, tumble and come to rest on the floor, knocking into each
 * other. Grab any letter by any point and it swings from your grip; let go to throw it.
 * Click empty space and they fly home. Idle, the heading drops and rebuilds itself.
 */

const WORD = 'GRAVITY';
const ADV: Record<string, number> = { G: 0.74, R: 0.68, A: 0.72, V: 0.7, I: 0.32, T: 0.64, Y: 0.68 };
const COLORS = ['#ff7a8a', '#ffb36b', '#ffe07a', '#8af0a8', '#7ad7ff', '#a99bff', '#ff9ae6'];
const G = 2600; // px/s²

interface Body {
  x: number;
  y: number;
  a: number; // angle, rad
  vx: number;
  vy: number;
  va: number;
  hw: number;
  hh: number;
  hx: number; // home slot
  hy: number;
  cool: number; // impact-sound cooldown
  delay: number;
}

interface S {
  b: Body[];
  mode: 'rest' | 'fall' | 'home';
  modeT: number;
  grab: number;
  lx: number; // grab point in the body's frame
  ly: number;
  idle: number;
  t: number;
}

function layout(w: number, h: number) {
  const em = Array.from(WORD).reduce((a, c) => a + ADV[c] + 0.04, 0);
  const fs = Math.min((w * 0.82) / em, h * 0.26);
  return { fs, floor: h - Math.min(w, h) * 0.08, top: h * 0.42, em };
}

function bodies(w: number, h: number): Body[] {
  const { fs, top, em } = layout(w, h);
  let x = (w - em * fs) / 2;
  return Array.from(WORD).map((c) => {
    const adv = (ADV[c] + 0.04) * fs;
    const b = { x: x + adv / 2, y: top, a: 0, vx: 0, vy: 0, va: 0, hw: ADV[c] * fs * 0.5, hh: fs * 0.37, hx: x + adv / 2, hy: top, cool: 0, delay: 0 };
    x += adv;
    return b;
  });
}

type Emit = (s: { name: string; gain?: number; rate?: number; pan?: number }) => void;

/** resolve one contact: corner r (relative to the centre) pushed along normal n */
function contact(b: Body, rx: number, ry: number, nx: number, ny: number, depth: number, e: number, mu: number, w: number, emit: Emit) {
  const I = ((b.hw * 2) ** 2 + (b.hh * 2) ** 2) / 12;
  const vx = b.vx - b.va * ry;
  const vy = b.vy + b.va * rx;
  const vn = vx * nx + vy * ny;
  if (vn < 0) {
    const rn = rx * ny - ry * nx;
    const j = (-(1 + (Math.abs(vn) < 120 ? 0 : e)) * vn) / (1 + (rn * rn) / I);
    b.vx += j * nx;
    b.vy += j * ny;
    b.va += (rn * j) / I;
    // Coulomb friction along the surface
    const tx = -ny;
    const ty = nx;
    const vt = (b.vx - b.va * ry) * tx + (b.vy + b.va * rx) * ty;
    const rt = rx * ty - ry * tx;
    const jt = clamp(-vt / (1 + (rt * rt) / I), -mu * j, mu * j);
    b.vx += jt * tx;
    b.vy += jt * ty;
    b.va += (rt * jt) / I;
    if (-vn > 350 && b.cool <= 0) {
      b.cool = 0.12;
      emit({ name: 'thud', gain: clamp(-vn / 2200, 0.1, 0.8), rate: 0.9 + b.hw / 300, pan: (b.x / w - 0.5) * 1.2 });
    }
  }
  b.x += nx * depth * 0.8;
  b.y += ny * depth * 0.8;
}

export const sim = defineSim<S>({
  init: (w, h) => ({ b: bodies(w, h), mode: 'rest', modeT: 0, grab: -1, lx: 0, ly: 0, idle: 1, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    s.modeT += f.dt;
    const { floor } = layout(f.w, f.h);
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    const hit = (bx: Body) => {
      const dx = f.p.x - bx.x;
      const dy = f.p.y - bx.y;
      const c = Math.cos(-bx.a);
      const sn = Math.sin(-bx.a);
      const lx = dx * c - dy * sn;
      const ly = dx * sn + dy * c;
      return Math.abs(lx) < bx.hw * 1.15 && Math.abs(ly) < bx.hh * 1.2 ? [lx, ly] : null;
    };
    const drop = () => {
      s.mode = 'fall';
      s.modeT = 0;
      s.b.forEach((b, i) => {
        b.delay = i * 0.045;
        b.va = (f.rand() - 0.5) * 3;
        b.vx = (f.rand() - 0.5) * 120;
        b.vy = -120 - f.rand() * 200;
      });
      f.emit({ name: 'pop', gain: 0.45 });
    };
    if (f.pressed) {
      const i = s.b.findIndex((b) => hit(b));
      if (s.mode === 'rest') {
        if (i >= 0) drop();
      } else if (i >= 0) {
        const l = hit(s.b[i])!;
        s.grab = i;
        s.lx = l[0];
        s.ly = l[1];
        s.mode = 'fall';
        s.b[i].delay = 0;
        f.emit({ name: 'click', gain: 0.35 });
      } else {
        s.mode = 'home';
        s.modeT = 0;
        f.emit({ name: 'swoosh', gain: 0.45 });
      }
    }
    // keyboard: the hidden button toggles drop / rebuild
    for (const a of f.actions) {
      if (a.type !== 'toggle') continue;
      if (s.mode === 'rest') drop();
      else {
        s.mode = 'home';
        s.modeT = 0;
      }
    }
    if (s.grab >= 0 && !f.p.down) {
      const b = s.b[s.grab];
      if (Math.hypot(b.vx, b.vy) > 900) f.emit({ name: 'whoosh', gain: 0.4 });
      s.grab = -1;
    }
    // idle: drop the heading, let it lie a while, then rebuild it
    if (s.idle > 2 && s.grab < 0) {
      if (s.mode === 'rest' && s.modeT > 2.2) drop();
      else if (s.mode === 'fall' && s.modeT > 4.2) {
        s.mode = 'home';
        s.modeT = 0;
        f.emit({ name: 'swoosh', gain: 0.35 });
      }
    }

    if (s.mode === 'rest') return;
    if (s.mode === 'home') {
      // fly home on critically-damped springs, one after another
      let done = true;
      s.b.forEach((b, i) => {
        const k = clamp((s.modeT - i * 0.05) * 3);
        if (k <= 0) {
          done = false;
          return;
        }
        const st = 140 * k;
        const dm = 2 * Math.sqrt(st);
        b.vx += ((b.hx - b.x) * st - b.vx * dm) * f.dt;
        b.vy += ((b.hy - b.y) * st - b.vy * dm) * f.dt;
        const da = Math.atan2(Math.sin(-b.a), Math.cos(-b.a));
        b.va += (da * st - b.va * dm) * f.dt;
        b.x += b.vx * f.dt;
        b.y += b.vy * f.dt;
        b.a += b.va * f.dt;
        if (Math.hypot(b.hx - b.x, b.hy - b.y) > 0.6 || Math.abs(da) > 0.003) done = false;
      });
      if (done && s.modeT > 0.6) {
        s.b.forEach((b) => {
          b.x = b.hx;
          b.y = b.hy;
          b.a = b.vx = b.vy = b.va = 0;
        });
        s.mode = 'rest';
        s.modeT = 0;
        f.emit({ name: 'click', gain: 0.3, rate: 1.2 });
      }
      return;
    }

    const N = 4;
    const h = f.dt / N;
    for (let it = 0; it < N; it++) {
      for (let i = 0; i < s.b.length; i++) {
        const b = s.b[i];
        b.cool -= h;
        if (b.delay > 0) {
          b.delay -= h;
          continue;
        }
        if (i === s.grab) {
          // a spring pulls the grabbed point toward the hand: the letter swings from it
          const c = Math.cos(b.a);
          const sn = Math.sin(b.a);
          const rx = s.lx * c - s.ly * sn;
          const ry = s.lx * sn + s.ly * c;
          const gvx = b.vx - b.va * ry;
          const gvy = b.vy + b.va * rx;
          const k = 900;
          const dmp = 38;
          const fx2 = (f.p.x - (b.x + rx)) * k - gvx * dmp;
          const fy2 = (f.p.y - (b.y + ry)) * k - gvy * dmp;
          const I = ((b.hw * 2) ** 2 + (b.hh * 2) ** 2) / 12;
          b.vx += fx2 * h;
          b.vy += fy2 * h;
          b.va += ((rx * fy2 - ry * fx2) / I) * h;
        }
        b.vy += G * h;
        b.va *= Math.exp(-0.6 * h);
        b.x += b.vx * h;
        b.y += b.vy * h;
        b.a += b.va * h;
        // corners against the floor, walls and ceiling
        const c = Math.cos(b.a);
        const sn = Math.sin(b.a);
        for (const [ux, uy] of [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ]) {
          const rx = ux * b.hw * c - uy * b.hh * sn;
          const ry = ux * b.hw * sn + uy * b.hh * c;
          const px = b.x + rx;
          const py = b.y + ry;
          if (py > floor) contact(b, rx, ry, 0, -1, py - floor, 0.32, 0.55, f.w, f.emit);
          if (px < 0) contact(b, rx, ry, 1, 0, -px, 0.4, 0.3, f.w, f.emit);
          if (px > f.w) contact(b, rx, ry, -1, 0, px - f.w, 0.4, 0.3, f.w, f.emit);
          if (py < 0) contact(b, rx, ry, 0, 1, -py, 0.3, 0.3, f.w, f.emit);
        }
      }
      // letters push each other apart (as rounded blobs) and trade momentum
      for (let i = 0; i < s.b.length; i++) {
        for (let j = i + 1; j < s.b.length; j++) {
          const A = s.b[i];
          const B = s.b[j];
          if (A.delay > 0 || B.delay > 0) continue;
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const d = Math.hypot(dx, dy) || 1;
          const ra = (A.hw + A.hh) * 0.48;
          const rb = (B.hw + B.hh) * 0.48;
          const pen = ra + rb - d;
          if (pen > 0) {
            const nx = dx / d;
            const ny = dy / d;
            A.x -= nx * pen * 0.5;
            A.y -= ny * pen * 0.5;
            B.x += nx * pen * 0.5;
            B.y += ny * pen * 0.5;
            const rv = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
            if (rv < 0) {
              const jn = -rv * 0.7;
              A.vx -= jn * nx;
              A.vy -= jn * ny;
              B.vx += jn * nx;
              B.vy += jn * ny;
              A.va -= jn * 0.004;
              B.va += jn * 0.004;
            }
          }
        }
      }
    }
  },
});

export default function FallingLetters() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { fs, floor } = layout(w, h);
  const u = Math.min(w, h) / 100;

  return (
    <Stage fx={fx} cursor={s.grab >= 0 ? 'grabbing' : 'pointer'} style={{ background: 'radial-gradient(100% 90% at 50% 25%, #2b2440 0%, #17131f 60%, #0c0a10 100%)' }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} role="img" aria-label={WORD}>
        <defs>
          <linearGradient id={`fl${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1c1727" />
            <stop offset="1" stopColor="#0f0c15" />
          </linearGradient>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={u * 0.9} />
          </filter>
          {COLORS.map((c, i) => (
            <linearGradient key={i} id={`c${uid}${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="0.25" stopColor={c} />
              <stop offset="1" stopColor={c} stopOpacity="0.85" />
            </linearGradient>
          ))}
        </defs>
        {/* the floor */}
        <rect x={0} y={floor} width={w} height={h - floor} fill={`url(#fl${uid})`} />
        <line x1={0} x2={w} y1={floor} y2={floor} stroke="rgba(255,255,255,0.12)" />
        <text x={w / 2} y={layout(w, h).top + fs * 0.75} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontSize={Math.max(11, u * 2.6)} letterSpacing={u * 0.4} fill="rgba(230,220,255,0.35)" opacity={s.mode === 'rest' ? 1 : 0}>
          CLICK THE HEADING
        </text>
        {/* contact shadows, tighter as each letter nears the floor */}
        {s.b.map((b, i) => {
          const gap = clamp((floor - (b.y + b.hh)) / (h * 0.5));
          return <ellipse key={`s${i}`} cx={b.x} cy={floor + u * 0.4} rx={b.hw * lerp(1.1, 0.5, gap)} ry={u * lerp(1, 0.5, gap)} fill="#000" opacity={lerp(0.55, 0.08, gap)} filter={`url(#sh${uid})`} />;
        })}
        {s.b.map((b, i) => (
          <g key={i} transform={`translate(${b.x.toFixed(2)} ${b.y.toFixed(2)}) rotate(${((b.a * 180) / Math.PI).toFixed(2)})`}>
            <text x={0} y={fs * 0.36} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={900} fontSize={fs} fill={`url(#c${uid}${i})`} style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.25)', strokeWidth: fs * 0.012 }}>
              {WORD[i]}
            </text>
            {i === s.grab && <circle cx={s.lx} cy={s.ly} r={u * 1.1} fill="#fff" opacity={0.85} />}
          </g>
        ))}
      </svg>
      <button type="button" aria-label="Drop the heading" style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, opacity: 0 }} onClick={() => fx.dispatch({ type: 'toggle' })} />
    </Stage>
  );
}
