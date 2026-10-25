import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, approach, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * Password lamp. A pendant lamp hangs over a password field. Pull its cord (a verlet rope with a
 * brass bead) — at the click the bulb flickers on and its cone of light reveals the characters it
 * falls on. The tug sets the lamp swinging, so the reveal sweeps back and forth before it settles.
 */

const SEG = 12;

interface S {
  rx: number[]; // rope points (verlet: current + previous)
  ry: number[];
  px: number[];
  py: number[];
  sw: Spring; // lamp swing angle, rad
  on: boolean;
  light: number; // 0..1
  onT: number; // time since switched on
  grab: boolean;
  armed: boolean; // pull must reset before it can click again
  text: string;
  idle: number;
  demo: number;
  ghost: number;
  gx: number;
  gy: number;
  focus: boolean;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const fw = Math.min(w * 0.82, m * 1.05, 540);
  const fh = Math.min(fw * 0.16, m * 0.13);
  const L = h * 0.22; // ceiling cable length
  const shade = Math.min(m * 0.14, 110);
  return { ax: w / 2, L, shade, fw, fh, fy: h * 0.7, cord: h * 0.17 };
}
function shadePos(g: ReturnType<typeof geom>, th: number) {
  return { x: g.ax + Math.sin(th) * g.L, y: Math.cos(th) * g.L };
}
function attach(g: ReturnType<typeof geom>, th: number) {
  const p = shadePos(g, th);
  // the cord hangs from the shade's right rim
  const rx = g.shade * 0.72;
  const ry = g.shade * 0.55;
  return { x: p.x + Math.cos(th) * rx + Math.sin(th) * ry, y: p.y - Math.sin(th) * rx + Math.cos(th) * ry };
}

export const sim = defineSim<S>({
  init(w, h) {
    const g = geom(w, h);
    const a = attach(g, 0);
    const rx: number[] = [];
    const ry: number[] = [];
    for (let i = 0; i <= SEG; i++) {
      rx.push(a.x);
      ry.push(a.y + (i / SEG) * g.cord);
    }
    return { rx, ry, px: [...rx], py: [...ry], sw: sp(), on: false, light: 0, onT: 0, grab: false, armed: true, text: 'Sunset-Harbor-42', idle: 0, demo: 0, ghost: 0, gx: 0, gy: 0, focus: false };
  },
  step(s, f) {
    const g = geom(f.w, f.h);
    const dt = Math.min(f.dt, 1 / 30);
    if (f.p.over || f.p.down || s.focus) s.idle = 0;
    else s.idle += dt;
    for (const a of f.actions) {
      if (a.type === 'text') s.text = String(a.value ?? '').slice(0, 24);
      if (a.type === 'focus') s.focus = true;
      if (a.type === 'blur') s.focus = false;
    }
    const bead = SEG;
    if (f.pressed && Math.hypot(f.p.x - s.rx[bead], f.p.y - s.ry[bead]) < Math.max(30, g.shade * 0.6)) s.grab = true;
    if (!f.p.down) s.grab = false;

    // the ghost hand: tug the cord every 3.6 s
    let hold = s.grab;
    let hx = f.p.x;
    let hy = f.p.y;
    if (!s.grab && s.idle > 2.2) {
      s.demo += dt;
      const ph = s.demo % 3.6;
      const rest = attach(g, s.sw.x);
      const pull = ph < 0.25 ? 0 : ph < 0.55 ? smooth((ph - 0.25) / 0.3) : ph < 0.7 ? 1 : -1;
      if (pull >= 0) {
        hold = true;
        hx = rest.x + g.shade * 0.15;
        hy = rest.y + g.cord * (1 + pull * 0.45);
      }
      s.ghost = approach(s.ghost, 1, 5, dt);
    } else {
      s.demo = 0;
      s.ghost = approach(s.ghost, 0, 10, dt);
    }
    s.gx = s.rx[bead];
    s.gy = s.ry[bead];

    // rope: verlet with gravity, then distance constraints
    const a = attach(g, s.sw.x);
    const segL = g.cord / SEG;
    const grav = f.h * 3.2;
    for (let i = 1; i <= SEG; i++) {
      const vx = (s.rx[i] - s.px[i]) * 0.985;
      const vy = (s.ry[i] - s.py[i]) * 0.985;
      s.px[i] = s.rx[i];
      s.py[i] = s.ry[i];
      s.rx[i] += vx;
      s.ry[i] += vy + grav * dt * dt;
    }
    s.rx[0] = a.x;
    s.ry[0] = a.y;
    let stretch = 0;
    if (hold) {
      // the bead goes where the hand is, but the cord only stretches so far
      const dx = hx - a.x;
      const dy = hy - a.y;
      const d = Math.hypot(dx, dy) || 1;
      const max = g.cord * 1.5;
      const k = Math.min(1, max / d);
      s.rx[bead] = a.x + dx * k;
      s.ry[bead] = a.y + dy * k;
      stretch = Math.max(0, d * k - g.cord) / g.cord;
    }
    const sl = segL * (1 + stretch);
    for (let it = 0; it < 12; it++) {
      for (let i = 0; i < SEG; i++) {
        const dx = s.rx[i + 1] - s.rx[i];
        const dy = s.ry[i + 1] - s.ry[i];
        const d = Math.hypot(dx, dy) || 1;
        const diff = (d - sl) / d;
        const w0 = i === 0 ? 0 : 0.5;
        const w1 = i + 1 === bead && hold ? 0 : 0.5;
        const tot = w0 + w1 || 1;
        s.rx[i] += dx * diff * (w0 / tot);
        s.ry[i] += dy * diff * (w0 / tot);
        s.rx[i + 1] -= dx * diff * (w1 / tot);
        s.ry[i + 1] -= dy * diff * (w1 / tot);
      }
    }
    // the click: the switch trips at 30 % stretch and re-arms once the cord is slack
    if (stretch > 0.3 && s.armed) {
      s.armed = false;
      s.on = !s.on;
      s.onT = 0;
      f.emit({ name: 'switch', gain: 0.8 });
      if (s.on) f.emit({ name: 'buzz', gain: 0.25, rate: 1.4 });
      // the tug swings the lamp
      s.sw.v += (f.reduced ? 0.12 : 0.55) * (hx > a.x ? -1 : 1);
    }
    if (stretch < 0.05) s.armed = true;
    spring(s.sw, 0, 7, f.reduced ? 3 : 0.5, dt);
    s.onT += dt;
    // incandescent: warms up with a couple of flickers, dies quickly
    const flick = s.on && s.onT < 0.3 ? (Math.sin(s.onT * 70) > 0.2 ? 1 : 0.15) : 1;
    s.light = approach(s.light, s.on ? flick : 0, s.on ? 14 : 9, dt);
  },
});

export default function PasswordLamp() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const th = s.sw.x;
  const sp0 = shadePos(g, th);
  const L = s.light;
  const R = g.shade;
  // the light cone, from the shade mouth down to the floor
  const mouthY = R * 0.6;
  const half = 0.36; // half-angle
  const mx = sp0.x + Math.sin(th) * mouthY;
  const my = sp0.y + Math.cos(th) * mouthY;
  const far = h * 1.2;
  const p1 = [mx - Math.cos(th) * R * 0.95, my + Math.sin(th) * R * 0.95];
  const p2 = [mx + Math.cos(th) * R * 0.95, my - Math.sin(th) * R * 0.95];
  const p3 = [p2[0] + Math.sin(th + half) * far, p2[1] + Math.cos(th + half) * far];
  const p4 = [p1[0] + Math.sin(th - half) * far, p1[1] + Math.cos(th - half) * far];
  const cone = `M${p1.join(',')} L${p2.join(',')} L${p3.join(',')} L${p4.join(',')}Z`;
  // where the cone crosses the field line
  const fy = g.fy;
  const ccx = mx + Math.tan(th) * (fy - my);
  const chw = R * 0.95 + Math.tan(half) * (fy - my);

  const mono = "'JetBrains Mono Variable', monospace";
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const chars = s.text.split('');
  const fs = g.fh * 0.42;
  const cw = fs * 0.62;
  const tx0 = w / 2 - (chars.length * cw) / 2;
  const rope = s.rx.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${s.ry[i].toFixed(1)}`).join('');
  const bx = s.rx[SEG];
  const by = s.ry[SEG];

  return (
    <Stage fx={fx} cursor={s.grab ? 'grabbing' : 'grab'} style={{ background: '#0a0b10' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`wall${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141722" />
            <stop offset="1" stopColor="#0a0b10" />
          </linearGradient>
          <linearGradient id={`beam${uid}`} gradientUnits="userSpaceOnUse" x1={mx} y1={my} x2={mx + Math.sin(th) * h} y2={my + Math.cos(th) * h}>
            <stop offset="0" stopColor="#ffd88a" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#ffc35c" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ffc35c" stopOpacity="0.02" />
          </linearGradient>
          <radialGradient id={`pool${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd27a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`shade${uid}`} cx="35%" cy="20%" r="90%">
            <stop offset="0" stopColor="#3d7a5e" />
            <stop offset="0.6" stopColor="#1d4535" />
            <stop offset="1" stopColor="#0d2219" />
          </radialGradient>
          <radialGradient id={`bulb${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fffbe8" />
            <stop offset="0.4" stopColor="#ffd98a" />
            <stop offset="1" stopColor="#ffb84d" stopOpacity="0" />
          </radialGradient>
          <filter id={`bl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={R * 0.25} />
          </filter>
          <clipPath id={`cone${uid}`}>
            <path d={cone} />
          </clipPath>
        </defs>
        <rect width={w} height={h} fill={`url(#wall${uid})`} />
        {/* floor/desk line */}
        <rect y={fy + g.fh * 1.1} width={w} height={h} fill="#07080b" />
        {/* the beam and the pool of light it throws */}
        <g opacity={L} style={{ mixBlendMode: 'screen' }}>
          <path d={cone} fill={`url(#beam${uid})`} />
          <ellipse cx={ccx} cy={fy} rx={chw * 1.15} ry={g.fh * 1.4} fill={`url(#pool${uid})`} />
          <ellipse cx={ccx + Math.tan(th) * g.fh * 1.1} cy={fy + g.fh * 1.15} rx={chw * 1.25} ry={g.fh * 0.6} fill={`url(#pool${uid})`} />
        </g>
        {/* ceiling cable */}
        <line x1={g.ax} y1={0} x2={sp0.x} y2={sp0.y - R * 0.3} stroke="#2b2f3a" strokeWidth={2} />
        {/* the shade */}
        <g transform={`translate(${sp0.x} ${sp0.y}) rotate(${(-th * 180) / Math.PI})`}>
          <rect x={-R * 0.12} y={-R * 0.48} width={R * 0.24} height={R * 0.22} rx={R * 0.04} fill="#1a1d24" />
          <ellipse cx={0} cy={R * 0.6} rx={R * 0.95} ry={R * 0.16} fill="#ffe7b0" opacity={0.15 + L * 0.85} />
          <circle cx={0} cy={R * 0.52} r={R * 0.75} fill={`url(#bulb${uid})`} opacity={L} filter={`url(#bl${uid})`} />
          <path d={`M${-R * 0.95} ${R * 0.6} C${-R * 0.95} ${-R * 0.1} ${-R * 0.5} ${-R * 0.32} 0 ${-R * 0.32} C${R * 0.5} ${-R * 0.32} ${R * 0.95} ${-R * 0.1} ${R * 0.95} ${R * 0.6} Z`} fill={`url(#shade${uid})`} />
          <path d={`M${-R * 0.7} ${R * 0.3} C${-R * 0.6} ${-R * 0.05} ${-R * 0.35} ${-R * 0.2} ${-R * 0.1} ${-R * 0.24}`} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={R * 0.06} strokeLinecap="round" />
          <ellipse cx={0} cy={R * 0.6} rx={R * 0.95} ry={R * 0.07} fill="none" stroke="#c9a45c" strokeWidth={R * 0.05} />
        </g>
        {/* the field */}
        <rect x={w / 2 - g.fw / 2} y={fy - g.fh / 2} width={g.fw} height={g.fh} rx={g.fh * 0.22} fill="#11141c" stroke={s.focus ? '#ffcf73' : '#2a2f3d'} strokeWidth={1.5} />
        <text x={w / 2 - g.fw / 2} y={fy - g.fh * 0.78} fontFamily={ui} fontWeight={600} fontSize={Math.max(11, g.fh * 0.28)} fill="#9aa3b8">
          Password
        </text>
        {/* lit field surface */}
        <g clipPath={`url(#cone${uid})`} opacity={L}>
          <rect x={w / 2 - g.fw / 2} y={fy - g.fh / 2} width={g.fw} height={g.fh} rx={g.fh * 0.22} fill="#3a2f1c" opacity={0.65} />
        </g>
        {chars.map((c, i) => {
          const x = tx0 + i * cw + cw / 2;
          // how lit this character is: soft edge at the cone boundary
          const lit = L * smooth(1 - (Math.abs(x - ccx) - chw * 0.85) / (chw * 0.2));
          return (
            <g key={i}>
              <circle cx={x} cy={fy} r={fs * 0.17} fill="#c5cbd8" opacity={1 - lit} />
              <text x={x} y={fy} textAnchor="middle" dominantBaseline="central" fontFamily={mono} fontWeight={600} fontSize={fs} fill="#ffe9b8" opacity={lit} style={{ filter: `drop-shadow(0 0 ${fs * 0.3}px rgba(255,200,100,${lit * 0.7}))` }}>
                {c}
              </text>
            </g>
          );
        })}
        {/* the cord and its brass bead */}
        <path d={rope} fill="none" stroke="#d8cbb0" strokeWidth={1.6} />
        <g transform={`translate(${bx} ${by})`}>
          <ellipse cx={0} cy={R * 0.12} rx={R * 0.09} ry={R * 0.14} fill="#a8782e" />
          <ellipse cx={-R * 0.03} cy={R * 0.07} rx={R * 0.03} ry={R * 0.05} fill="#ffe7a8" opacity={0.8} />
        </g>
        {s.ghost > 0.02 && (
          <g opacity={s.ghost} transform={`translate(${s.gx} ${s.gy + R * 0.2})`}>
            <circle r={R * 0.28} fill="#fff" opacity={0.1} />
            <circle r={R * 0.08} fill="#fff" opacity={0.9} />
          </g>
        )}
        <text x={w / 2 + g.fw / 2} y={fy + g.fh * 0.95} textAnchor="end" fontFamily={ui} fontSize={Math.max(10, g.fh * 0.22)} fill="#5d6577">
          pull the cord to peek
        </text>
      </svg>
      <input
        aria-label="Password"
        type="password"
        value={s.text}
        onChange={(e) => fx.dispatch({ type: 'text', value: e.target.value })}
        onFocus={() => fx.dispatch({ type: 'focus' })}
        onBlur={() => fx.dispatch({ type: 'blur' })}
        style={{ position: 'absolute', left: w / 2 - g.fw / 2, top: g.fy - g.fh / 2, width: g.fw, height: g.fh, opacity: 0, fontSize: 16, cursor: 'text' }}
      />
    </Stage>
  );
}
