import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, lerp, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * A pendant lamp with a pull cord. Grab the bead and pull: the cord stretches out of the shade,
 * clicks, and the whole interface switches between light and dark. The cord is a simulated rope,
 * so it swings and recoils when you let go.
 */

const N = 16;

interface S {
  x: Float32Array;
  y: Float32Array;
  px: Float32Array;
  py: Float32Array;
  extra: Spring; // extra cord pulled out of the shade
  grabbed: boolean;
  armed: boolean;
  on: boolean; // lamp on = light theme
  dark: number; // 0 light … 1 dark (eased)
  flicker: number;
  idle: number;
  auto: number; // ghost-pull clock (gallery only)
  swing: Spring; // the shade swings a little when you yank it
}

function geom(w: number, h: number) {
  const portrait = h > w * 1.1;
  const m = Math.min(w, h);
  const lampX = portrait ? w * 0.5 : w * 0.28;
  const shadeY = portrait ? h * 0.2 : h * 0.3;
  const shadeW = m * (portrait ? 0.34 : 0.3);
  const cordLen = m * (portrait ? 0.3 : 0.34);
  const card = portrait
    ? { x: w * 0.08, y: h * 0.56, w: w * 0.84, h: h * 0.36 }
    : { x: w * 0.5, y: h * 0.16, w: w * 0.44, h: h * 0.68 };
  return { portrait, m, lampX, shadeY, shadeW, cordLen, card, anchorX: lampX + shadeW * 0.3, anchorY: shadeY + shadeW * 0.06 };
}

export const sim = defineSim<S>({
  init(w, h) {
    const g = geom(w, h);
    const s: S = {
      x: new Float32Array(N),
      y: new Float32Array(N),
      px: new Float32Array(N),
      py: new Float32Array(N),
      extra: sp(0),
      grabbed: false,
      armed: false,
      on: true,
      dark: 0,
      flicker: 0,
      idle: 0,
      auto: -1,
      swing: sp(0),
    };
    for (let i = 0; i < N; i++) {
      s.x[i] = s.px[i] = g.anchorX;
      s.y[i] = s.py[i] = g.anchorY + (i / (N - 1)) * g.cordLen;
    }
    return s;
  },
  step(s, f) {
    const g = geom(f.w, f.h);
    const bx = s.x[N - 1];
    const by = s.y[N - 1];
    // the ghost hand (gallery only): reach for the bead, pull down, let go
    let px = f.p.x;
    let py = f.p.y;
    let down = f.p.down;
    let pressed = f.pressed;
    if (f.pressed || f.p.down) {
      s.idle = 0;
      s.auto = -1;
    } else s.idle += f.dt;
    if (f.live && s.idle > 3 && s.auto < 0) s.auto = 0;
    if (s.auto >= 0) {
      const a0 = s.auto;
      s.auto += f.dt;
      const k = clamp((s.auto - 0.1) / 0.45);
      px = g.anchorX + Math.sin(s.auto * 3) * 4;
      py = g.anchorY + g.cordLen + k * g.cordLen * 0.3;
      down = s.auto > 0.1 && s.auto < 0.75;
      pressed = a0 <= 0.1 && s.auto > 0.1;
      if (s.auto > 2.2) {
        s.auto = -1;
        s.idle = 0;
      }
    }

    if (pressed && Math.hypot(px - bx, py - by) < g.m * 0.08) {
      s.grabbed = true;
      f.emit({ name: 'tick', gain: 0.25 });
    }
    const total = g.cordLen;
    if (s.grabbed) {
      const d = Math.hypot(px - g.anchorX, py - g.anchorY);
      s.extra.x = clamp(d - total, 0, total * 0.45);
      s.extra.v = 0;
      if (!s.armed && s.extra.x > total * 0.16) {
        s.armed = true;
        f.emit({ name: 'click', gain: 0.5, rate: 0.8 });
      }
      if (!down) {
        s.grabbed = false;
        s.swing.v += (s.x[N - 1] - g.anchorX) * 0.02;
        if (s.armed) {
          s.on = !s.on;
          s.flicker = s.on ? 0.35 : 0;
          f.emit({ name: 'switch', gain: 0.8, rate: s.on ? 1.05 : 0.95 });
        }
        s.armed = false;
      }
    } else spring(s.extra, 0, 260, 7, f.dt);
    for (const a of f.actions)
      if (a.type === 'toggle') {
        s.on = !s.on;
        s.flicker = s.on ? 0.35 : 0;
        f.emit({ name: 'switch', gain: 0.8 });
      }

    // verlet rope with gravity and air drag
    const seg = (total + Math.max(0, s.extra.x)) / (N - 1);
    const dt = f.dt;
    const G = 2200;
    for (let i = 1; i < N; i++) {
      const vx = (s.x[i] - s.px[i]) * 0.985;
      const vy = (s.y[i] - s.py[i]) * 0.985;
      s.px[i] = s.x[i];
      s.py[i] = s.y[i];
      s.x[i] += vx;
      s.y[i] += vy + G * dt * dt;
    }
    const ax = g.anchorX + s.swing.x * g.shadeW * 0.5;
    for (let it = 0; it < 24; it++) {
      s.x[0] = ax;
      s.y[0] = g.anchorY;
      if (s.grabbed) {
        s.x[N - 1] = px;
        s.y[N - 1] = py;
      }
      for (let i = 0; i < N - 1; i++) {
        const dx = s.x[i + 1] - s.x[i];
        const dy = s.y[i + 1] - s.y[i];
        const d = Math.hypot(dx, dy) || 1e-6;
        const diff = (d - seg) / d;
        const wa = i === 0 ? 0 : 0.5;
        const wb = i === 0 ? 1 : 0.5;
        s.x[i] += dx * diff * wa;
        s.y[i] += dy * diff * wa;
        s.x[i + 1] -= dx * diff * wb;
        s.y[i + 1] -= dy * diff * wb;
      }
    }
    if (s.grabbed) {
      // the pulled bead drags the cord out of the shade: keep it pinned to the finger
      s.px[N - 1] = s.x[N - 1] = px;
      s.py[N - 1] = s.y[N - 1] = py;
    }
    spring(s.swing, 0, 18, 1.2, f.dt);
    s.flicker = Math.max(0, s.flicker - f.dt);
    s.dark = approach(s.dark, s.on ? 0 : 1, 9, f.dt);
  },
});

const ui = "'Inter Variable', Inter, system-ui, sans-serif";
const disp = "'Archivo Variable', Archivo, system-ui, sans-serif";

export default function LampCord() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const g = geom(w, h);
  // a quick stutter when the bulb comes on
  const fl = s.flicker > 0 ? (Math.sin(s.flicker * 90) > 0.2 ? 1 : 0.35) : 1;
  const d = clamp(s.dark);
  const light = (1 - d) * fl;
  const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((c, i) => Math.round(lerp(c, b[i], k))).join(',')})`;
  const wall = mix([244, 236, 222], [17, 18, 24], 1 - light);
  const wall2 = mix([226, 214, 196], [10, 10, 14], 1 - light);
  const sw = s.swing.x * 12;
  const sx = g.lampX + s.swing.x * g.shadeW * 0.5;
  const cord = Array.from({ length: N }, (_, i) => `${s.x[i].toFixed(1)},${s.y[i].toFixed(1)}`).join(' ');
  const bx = s.x[N - 1];
  const by = s.y[N - 1];
  const br = g.m * 0.022;
  const c = g.card;
  const ink = mix([24, 22, 28], [236, 234, 228], d);
  const sub = mix([96, 90, 100], [150, 150, 160], d);
  const panel = mix([255, 252, 246], [26, 27, 34], d);
  const line = mix([232, 224, 210], [44, 46, 56], d);
  const night = d > 0.5;

  return (
    <Stage fx={fx} cursor="grab" style={{ background: `radial-gradient(120% 90% at ${(g.lampX / w) * 100}% ${(g.shadeY / h) * 100 + 10}%, ${wall}, ${wall2})` }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`cone${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe2a8" stopOpacity={0.55 * light} />
            <stop offset="1" stopColor="#ffe2a8" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`pool${uid}`}>
            <stop offset="0" stopColor="#ffd98a" stopOpacity={0.45 * light} />
            <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`shade${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1d1f24" />
            <stop offset="0.35" stopColor="#3a3d45" />
            <stop offset="0.55" stopColor="#2a2c32" />
            <stop offset="1" stopColor="#121317" />
          </linearGradient>
          <radialGradient id={`bulb${uid}`}>
            <stop offset="0" stopColor="#fffbe8" />
            <stop offset="0.5" stopColor={light > 0.5 ? '#ffd27a' : '#6a6458'} />
            <stop offset="1" stopColor={light > 0.5 ? '#ffb23e' : '#3a372f'} />
          </radialGradient>
        </defs>
        {/* light pool on the wall and the cone */}
        <ellipse cx={sx} cy={g.shadeY + g.m * 0.55} rx={g.m * 0.55} ry={g.m * 0.4} fill={`url(#pool${uid})`} />
        <path
          d={`M${sx - g.shadeW * 0.42} ${g.shadeY + g.shadeW * 0.12} L${sx + g.shadeW * 0.42} ${g.shadeY + g.shadeW * 0.12} L${sx + g.m * 0.62 + sw * 8} ${h} L${sx - g.m * 0.62 + sw * 8} ${h}Z`}
          fill={`url(#cone${uid})`}
          style={{ mixBlendMode: 'screen' }}
        />
        {/* the cable from the ceiling */}
        <line x1={g.lampX} y1={0} x2={sx} y2={g.shadeY - g.shadeW * 0.3} stroke="#22232a" strokeWidth={Math.max(1.5, g.m * 0.005)} />
        {/* shade */}
        <g transform={`rotate(${sw} ${g.lampX} 0)`}>
          <rect x={g.lampX - g.shadeW * 0.06} y={g.shadeY - g.shadeW * 0.34} width={g.shadeW * 0.12} height={g.shadeW * 0.1} rx={2} fill="#2b2d33" />
          <path
            d={`M${g.lampX - g.shadeW * 0.14} ${g.shadeY - g.shadeW * 0.25} C${g.lampX - g.shadeW * 0.2} ${g.shadeY - g.shadeW * 0.05} ${g.lampX - g.shadeW * 0.5} ${g.shadeY - g.shadeW * 0.02} ${g.lampX - g.shadeW * 0.5} ${g.shadeY + g.shadeW * 0.12} L${g.lampX + g.shadeW * 0.5} ${g.shadeY + g.shadeW * 0.12} C${g.lampX + g.shadeW * 0.5} ${g.shadeY - g.shadeW * 0.02} ${g.lampX + g.shadeW * 0.2} ${g.shadeY - g.shadeW * 0.05} ${g.lampX + g.shadeW * 0.14} ${g.shadeY - g.shadeW * 0.25}Z`}
            fill={`url(#shade${uid})`}
          />
          <ellipse cx={g.lampX} cy={g.shadeY + g.shadeW * 0.12} rx={g.shadeW * 0.5} ry={g.shadeW * 0.05} fill={light > 0.3 ? '#fff1cf' : '#2a2b30'} opacity={0.4 + light * 0.6} />
          <circle cx={g.lampX} cy={g.shadeY + g.shadeW * 0.13} r={g.shadeW * 0.1} fill={`url(#bulb${uid})`} />
          {light > 0.05 && <circle cx={g.lampX} cy={g.shadeY + g.shadeW * 0.14} r={g.shadeW * 0.35} fill="#ffe7b0" opacity={0.25 * light} style={{ filter: `blur(${g.m * 0.02}px)` }} />}
        </g>
        {/* the cord and the brass bead */}
        <polyline points={cord} fill="none" stroke={night ? '#8d8a80' : '#5b5348'} strokeWidth={Math.max(1.2, g.m * 0.004)} strokeLinejoin="round" strokeLinecap="round" />
        <ellipse cx={bx + 3} cy={by + br * 1.6} rx={br * 0.9} ry={br * 0.3} fill="#000" opacity={0.12} />
        <circle cx={bx} cy={by + br * 0.7} r={br} fill={night ? '#9c8450' : '#c9a24d'} />
        <circle cx={bx - br * 0.35} cy={by + br * 0.35} r={br * 0.35} fill="#fff6d8" opacity={0.7} />
        {s.grabbed && <circle cx={bx} cy={by + br * 0.7} r={br * 2.2} fill="none" stroke={night ? '#fff' : '#000'} strokeOpacity={0.15} />}
      </svg>

      {/* the interface that follows the lamp */}
      <div
        style={{
          position: 'absolute',
          left: c.x,
          top: c.y,
          width: c.w,
          height: c.h,
          borderRadius: g.m * 0.03,
          background: panel,
          boxShadow: `0 ${g.m * 0.03}px ${g.m * 0.08}px rgba(0,0,0,${0.12 + d * 0.3}), inset 0 0 0 1px ${line}`,
          overflow: 'hidden',
          fontFamily: ui,
          color: ink,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${c.h * 0.06}px ${c.w * 0.07}px`, borderBottom: `1px solid ${line}` }}>
          <span style={{ fontFamily: disp, fontWeight: 800, fontSize: c.h * 0.055 }}>atelier.</span>
          <span style={{ display: 'flex', gap: c.w * 0.04, fontSize: c.h * 0.038, color: sub }}>
            <span>Work</span>
            <span>Studio</span>
            <span>Contact</span>
          </span>
        </div>
        <div style={{ padding: `${c.h * 0.08}px ${c.w * 0.07}px` }}>
          <div style={{ fontSize: c.h * 0.035, letterSpacing: '.14em', color: night ? '#ffb27a' : '#d2501c', fontWeight: 600 }}>{night ? 'DARK MODE' : 'LIGHT MODE'}</div>
          <div style={{ fontFamily: disp, fontWeight: 750, fontSize: c.h * 0.11, lineHeight: 1.02, marginTop: c.h * 0.03, letterSpacing: '-.02em' }}>
            {night ? 'Good evening.' : 'Good morning.'}
          </div>
          <div style={{ marginTop: c.h * 0.05, display: 'grid', gap: c.h * 0.025 }}>
            {[0.92, 0.84, 0.6].map((k, i) => (
              <div key={i} style={{ height: c.h * 0.022, width: `${k * 100}%`, borderRadius: 99, background: line }} />
            ))}
          </div>
          <div style={{ marginTop: c.h * 0.08, display: 'inline-block', padding: `${c.h * 0.035}px ${c.w * 0.06}px`, borderRadius: 99, background: night ? '#ff8a4c' : '#16151a', color: night ? '#16151a' : '#fff', fontSize: c.h * 0.04, fontWeight: 600 }}>
            View projects →
          </div>
        </div>
        <div style={{ position: 'absolute', right: c.w * 0.06, bottom: c.h * 0.06, width: c.h * 0.16, height: c.h * 0.16, borderRadius: '50%', background: night ? 'radial-gradient(circle at 35% 35%, #e9ecf5, #9aa3b8)' : 'radial-gradient(circle at 35% 35%, #fff3b0, #ffb23e)', boxShadow: night ? '0 0 30px rgba(180,190,255,.3)' : '0 0 40px rgba(255,190,80,.5)', transform: `rotate(${t * 10}deg)` }} />
      </div>
      <button type="button" aria-label="Toggle the lamp" aria-pressed={!s.on} onClick={() => fx.dispatch({ type: 'toggle' })} style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, opacity: 0 }} />
    </Stage>
  );
}
