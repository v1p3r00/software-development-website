import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * A fresh instant photo. Grab it and shake: it swings from your fingers (the free end lags
 * behind each jerk and rocks back), and the shaking speeds up the chemistry: the murky grey
 * clears in uneven blooms, the colours come in washed out and then deepen. Once developed, a new
 * print drops in. Idle, an invisible hand shakes it for you.
 */

interface S {
  x: Spring; // centre of the print
  y: Spring;
  ang: Spring; // deg
  gx: number; // grab point relative to the centre (px)
  gy: number;
  drag: boolean;
  dev: number; // 0 = undeveloped, 1 = done
  done: number; // seconds since fully developed
  scene: number;
  drop: Spring; // vertical offset for the print swap
  pvx: number;
  pvy: number;
  lastDir: number;
  idle: number;
  demo: number;
  t: number;
}

function geom(w: number, h: number) {
  const pw = Math.min(w * 0.62, (h * 0.7) / 1.2);
  return { cx: w / 2, cy: h / 2, pw, ph: pw * 1.2 };
}

export const sim = defineSim<S>({
  init: (w, h) => ({ x: sp(w / 2), y: sp(h / 2), ang: sp(-4), gx: 0, gy: 0, drag: false, dev: 0, done: 0, scene: 0, drop: sp(), pvx: 0, pvy: 0, lastDir: 0, idle: 1, demo: 0, t: 0 }),
  step(s, f) {
    const { cx, cy, pw, ph } = geom(f.w, f.h);
    s.t += f.dt;
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    const inside = Math.abs(f.p.x - s.x.x) < pw * 0.55 && Math.abs(f.p.y - s.y.x) < ph * 0.55;
    if (f.pressed && inside) {
      s.drag = true;
      s.gx = f.p.x - s.x.x;
      s.gy = f.p.y - s.y.x;
      f.emit({ name: 'paper', gain: 0.35 });
    }
    if (s.drag && !f.p.down) s.drag = false;

    // a virtual hand for the idle demo: pinch the top edge and shake in bursts
    let hx = f.p.x;
    let hy = f.p.y;
    let vx = f.p.vx;
    let vy = f.p.vy;
    let holding = s.drag;
    if (!s.drag && s.idle > 2) {
      s.demo += f.dt;
      const ph2 = s.demo % 3.6;
      if (ph2 < 2.4 && s.dev < 1) {
        const k = smooth(ph2 / 0.3) * smooth((2.4 - ph2) / 0.3);
        const om = 15;
        hx = cx + Math.sin(s.demo * om) * pw * 0.13 * k;
        hy = cy - ph * 0.38 + Math.sin(s.demo * om * 2) * pw * 0.02 * k;
        vx = Math.cos(s.demo * om) * pw * 0.13 * k * om;
        vy = 0;
        s.gx = 0;
        s.gy = -ph * 0.38;
        holding = true;
      }
    } else s.demo = 0;

    const ax = clamp((vx - s.pvx) / Math.max(f.dt, 1e-3), -40000, 40000);
    const ay = clamp((vy - s.pvy) / Math.max(f.dt, 1e-3), -40000, 40000);
    s.pvx = vx;
    s.pvy = vy;
    if (holding) {
      spring(s.x, hx - s.gx, 420, 30, f.dt);
      spring(s.y, hy - s.gy, 420, 30, f.dt);
      // inertia: the free end lags behind each jerk of the hand (torque = r × a)
      const kick = (-s.gy * ax + s.gx * ay) * 0.0028;
      s.ang.v += clamp(kick, -4000, 4000) * f.dt;
      const hang = clamp((-Math.atan2(s.gx, Math.max(40, -s.gy + 60)) * 180) / Math.PI, -18, 18);
      spring(s.ang, hang, 55, 3.2, f.dt);
      // shaking feeds the chemistry; a little happens anyway
      const speed = Math.hypot(vx, vy);
      s.dev += f.dt * (0.04 + clamp(speed / 900) * 0.5);
      const dir = Math.sign(vx);
      if (speed > 500 && dir !== s.lastDir && dir !== 0) {
        s.lastDir = dir;
        f.emit({ name: 'rustle', gain: clamp(speed / 2500, 0.15, 0.5), rate: 1.2 + f.rand() * 0.2, pan: dir * 0.3 });
      }
    } else {
      spring(s.x, cx, 120, 14, f.dt);
      spring(s.y, cy, 120, 14, f.dt);
      spring(s.ang, -4, 90, 9, f.dt);
      s.dev += f.dt * 0.03;
    }
    if (s.dev >= 1 && s.done === 0) f.emit({ name: 'chime', gain: 0.4 });
    s.dev = Math.min(1, s.dev);
    s.done = s.dev >= 1 ? s.done + f.dt : 0;
    // swap in a fresh print once this one has been admired for a while
    if (s.done > 2.6 && !s.drag) {
      s.drop.x = -f.h;
      s.drop.v = 0;
      s.dev = 0;
      s.done = 0;
      s.scene = (s.scene + 1) % 2;
      s.ang.x = 10;
      f.emit({ name: 'whoosh', gain: 0.35 });
    }
    const was = s.drop.x;
    spring(s.drop, 0, 160, 13, f.dt);
    if (was < -2 && s.drop.x >= -2 && s.drop.v > 200) f.emit({ name: 'paper', gain: 0.4 });
  },
});

function Scene({ k, uid }: { k: number; uid: string }) {
  if (k === 0)
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`s0${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3d2a6b" />
            <stop offset="0.45" stopColor="#e2557a" />
            <stop offset="0.7" stopColor="#ffb36b" />
          </linearGradient>
          <linearGradient id={`w0${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff9a6b" />
            <stop offset="1" stopColor="#3a2457" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#s0${uid})`} />
        <circle cx="62" cy="62" r="13" fill="#ffe7a8" />
        <rect y="64" width="100" height="36" fill={`url(#w0${uid})`} />
        {[66, 69, 73, 78, 84].map((y, i) => (
          <rect key={i} x={62 - 14 + i * 2} y={y} width={28 - i * 4} height="0.9" fill="#ffe7a8" opacity={0.7 - i * 0.12} />
        ))}
        {/* a palm leaning in from the left */}
        <path d="M8 100 C 12 80 16 60 24 44" stroke="#1d1030" strokeWidth="2.2" fill="none" />
        {[-20, -13, -6, 7, 14, 21].map((dx, i) => (
          <path key={i} d={`M24 44 q ${dx * 0.45} ${-8 + Math.abs(dx) * 0.12} ${dx} ${2 + Math.abs(dx) * 0.35} q ${-dx * 0.35} ${-4} ${-dx} ${-2 - Math.abs(dx) * 0.35}`} fill="#1d1030" />
        ))}
        {/* a small sailboat on the horizon */}
        <path d="M80 70 h8 l-1.5 1.6 h-5 Z M84 69.6 v-6 l3.4 5.6 Z" fill="#1d1030" opacity="0.85" />
      </svg>
    );
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`s1${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc4ff" />
          <stop offset="0.6" stopColor="#d9f0ff" />
        </linearGradient>
        <linearGradient id={`w1${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f8fa6" />
          <stop offset="1" stopColor="#123f52" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#s1${uid})`} />
      <path d="M0 62 L18 34 L28 46 L44 20 L60 44 L72 32 L100 62 Z" fill="#5b6f8f" />
      <path d="M38 30 L44 20 L50 30 L46 28 L44 31 L41 28 Z M15 39 L18 34 L21 39 Z" fill="#fff" />
      <path d="M0 62 L14 50 L26 58 L40 48 L56 60 L76 50 L100 62 Z" fill="#2e5e4a" />
      <rect y="62" width="100" height="38" fill={`url(#w1${uid})`} />
      <path d="M0 62 L18 82 L28 72 L44 98 L60 74 L72 86 L100 62 Z" fill="#5b6f8f" opacity="0.25" />
      <path d="M40 76 h14 l-3 3 h-8 Z" fill="#c2412d" />
      <path d="M47 76 v-8 l5 7 Z" fill="#fff6e8" />
    </svg>
  );
}

export default function Polaroid() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { pw, ph } = geom(w, h);
  const d = s.dev;
  const x = s.x.x;
  const y = s.y.x + s.drop.x;
  const ang = s.ang.x;
  const u = pw / 100;
  const ps = pw * 0.88; // the square photo
  // development: murky grey clears first, then colour and contrast arrive
  const grey = 1 - smooth(d * 1.35);
  // the chemistry is a crossfade of fixed-filter layers (cheap): murky → washed out → full colour
  const washed = clamp(d * 2);
  const full = smooth(clamp((d - 0.35) / 0.65));
  const blob = (lag: number) => clamp(1 - smooth((d - lag) * 1.8));
  const gloss = 50 + ang * 3;
  const lift = clamp(Math.hypot(s.x.v, s.y.v) / 1500) + (s.drag ? 0.4 : 0);
  const ox = (x - w / 2) * 0.04 + u * 2;
  const tag = s.scene === 0 ? 'summer ’26' : 'lake day';

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: 'radial-gradient(90% 80% at 50% 40%, #3b3530 0%, #211d1a 55%, #120f0d 100%)' }}>
      {/* soft shadow on the table, further and softer when lifted */}
      <div
        style={{
          position: 'absolute',
          left: x - pw / 2 + ox + lift * u * 6,
          top: y - ph / 2 + u * 3 + lift * u * 10,
          width: pw,
          height: ph,
          background: 'rgba(0,0,0,0.55)',
          filter: `blur(${u * 4}px)`,
          transform: `rotate(${ang}deg)`,
          opacity: 0.9 - lift * 0.3,
          willChange: 'transform, opacity',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - pw / 2,
          top: y - ph / 2,
          width: pw,
          height: ph,
          transform: `rotate(${ang.toFixed(2)}deg) scale(${1 + lift * 0.03})`,
          transformOrigin: `${50 + (s.gx / pw) * 100}% ${50 + (s.gy / ph) * 100}%`,
          willChange: 'transform',
          background: 'linear-gradient(170deg,#fbfaf6,#ece9e1)',
          borderRadius: u * 0.8,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05), inset 0 -2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ position: 'absolute', left: (pw - ps) / 2, top: (pw - ps) / 2, width: ps, height: ps, overflow: 'hidden', background: '#2d302c', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)' }}>
          <div style={{ position: 'absolute', inset: 0, filter: 'saturate(0.3) contrast(0.6) brightness(0.85) sepia(0.5)', opacity: washed }}>
            <Scene k={s.scene} uid={uid} />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: full }}>
            <Scene k={s.scene} uid={uid + 'f'} />
          </div>
          {/* the undeveloped layer clears unevenly, in soft blooms */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#4a4f4a,#33382f)', opacity: grey }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(40% 35% at 30% 70%, rgba(40,46,40,${blob(0.35)}), transparent 70%), radial-gradient(35% 40% at 75% 30%, rgba(40,46,40,${blob(0.45) * 0.9}), transparent 70%), radial-gradient(60% 50% at 50% 50%, rgba(70,90,110,${(1 - d) * 0.25}), transparent 80%)` }} />
          {/* glossy surface */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(125deg, rgba(255,255,255,0) ${gloss - 30}%, rgba(255,255,255,0.18) ${gloss}%, rgba(255,255,255,0) ${gloss + 30}%)` }} />
          <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${u * 6}px rgba(0,0,0,${0.35 - d * 0.2})` }} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: pw * 0.96, height: ph - pw * 0.96, display: 'grid', placeItems: 'center', fontFamily: "Caveat, 'Archivo Variable', cursive", fontWeight: 500, fontSize: u * 9, color: '#2d3a6b', opacity: 0.85, transform: 'rotate(-2deg)' }}>
          {tag}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: Math.min(w, h) * 0.05, textAlign: 'center', fontFamily: "'Inter Variable', Inter, system-ui", fontSize: Math.max(11, Math.min(w, h) * 0.024), letterSpacing: 2, color: 'rgba(255,240,220,0.4)', textTransform: 'uppercase' }}>
        {d < 1 ? `shake it · ${Math.round(d * 100)}%` : 'developed'}
      </div>
      <button type="button" aria-label="Shake the photo" style={{ position: 'absolute', left: x - pw / 2, top: y - ph / 2, width: pw, height: ph, opacity: 0 }} />
    </Stage>
  );
}
