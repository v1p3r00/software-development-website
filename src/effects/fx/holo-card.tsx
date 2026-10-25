import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * A holographic foil trading card. It tilts toward the pointer; the rainbow foil, the glitter
 * and the glare all move with the light, the way real foil does. Click to flip it over.
 */

interface S {
  rx: Spring;
  ry: Spring;
  gx: number; // glare position on the card 0..1
  gy: number;
  flip: Spring; // 0 front, 180 back
  side: 0 | 1;
  lift: Spring;
  idle: number;
  downAt: number;
  downX: number;
  downY: number;
  hover: number;
  t: number;
  sparkle: number;
}

function geom(w: number, h: number) {
  const ch = Math.min(h * 0.8, w * 0.6 * 1.4);
  const cw = ch / 1.4;
  return { cw, ch, x: (w - cw) / 2, y: (h - ch) / 2 };
}

export const sim = defineSim<S>({
  init: () => ({ rx: sp(), ry: sp(), gx: 0.5, gy: 0.3, flip: sp(0), side: 0, lift: sp(0), idle: 0, downAt: -1, downX: 0, downY: 0, hover: 0, t: 0, sparkle: 0 }),
  step(s, f) {
    const g = geom(f.w, f.h);
    s.t += f.dt;
    let px = (f.p.x - g.x) / g.cw;
    let py = (f.p.y - g.y) / g.ch;
    const near = f.p.over && px > -0.35 && px < 1.35 && py > -0.3 && py < 1.3;
    if (near && (Math.abs(f.p.vx) + Math.abs(f.p.vy) > 5 || f.p.down)) s.idle = 0;
    else s.idle += f.dt;
    let active = near;
    if (f.live && s.idle > 1.6) {
      // nobody around: an invisible hand turns the card in a slow figure of eight
      const k = s.t * 0.7;
      px = 0.5 + Math.sin(k) * 0.42;
      py = 0.5 + Math.sin(k * 2) * 0.3;
      active = true;
      if (s.idle > 7) {
        s.idle = 1.7;
        s.side = (1 - s.side) as 0 | 1;
        f.emit({ name: 'whoosh', gain: 0.45, rate: 1.3 });
      }
    }
    const tx = clamp(px, -0.2, 1.2) - 0.5;
    const ty = clamp(py, -0.2, 1.2) - 0.5;
    spring(s.ry, active ? tx * 36 : 0, 120, 12, f.dt);
    spring(s.rx, active ? -ty * 30 : 0, 120, 12, f.dt);
    s.gx = approach(s.gx, active ? clamp(px, 0, 1) : 0.5, 9, f.dt);
    s.gy = approach(s.gy, active ? clamp(py, 0, 1) : 0.3, 9, f.dt);
    const h0 = s.hover;
    s.hover = approach(s.hover, active ? 1 : 0, 5, f.dt);
    if (h0 < 0.5 && s.hover >= 0.5) f.emit({ name: 'chime', gain: 0.18, rate: 1.6 });

    // a click (short press without much travel) flips the card
    const inside = px >= 0 && px <= 1 && py >= 0 && py <= 1;
    if (f.pressed && inside) {
      s.downAt = s.t;
      s.downX = f.p.x;
      s.downY = f.p.y;
    }
    if (f.released && s.downAt >= 0) {
      if (s.t - s.downAt < 0.5 && Math.hypot(f.p.x - s.downX, f.p.y - s.downY) < 20) {
        s.side = (1 - s.side) as 0 | 1;
        f.emit({ name: 'whoosh', gain: 0.55, rate: 1.25 });
      }
      s.downAt = -1;
    }
    for (const a of f.actions) if (a.type === 'flip') s.side = (1 - s.side) as 0 | 1;
    const before = s.flip.x;
    spring(s.flip, s.side * 180, 90, 11, f.dt);
    if ((before - s.side * 180) * (s.flip.x - s.side * 180) < 0 && Math.abs(s.flip.v) > 60) f.emit({ name: 'tick', gain: 0.35 });
    // the foil glints audibly when the card turns quickly
    s.sparkle -= f.dt;
    const turn = Math.abs(s.rx.v) + Math.abs(s.ry.v);
    if (turn > 70 && s.sparkle <= 0) {
      s.sparkle = 0.5;
      f.emit({ name: 'shimmer', gain: clamp(turn / 300, 0.2, 0.6), rate: 0.9 + f.rand() * 0.3, pan: clamp(s.ry.x / 20, -0.7, 0.7) });
    }
    spring(s.lift, f.p.down && inside ? 1 : active ? 0.5 : 0, 160, 14, f.dt);
  },
});

export default function HoloCard() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const rx = s.rx.x;
  const ry = s.ry.x;
  const flip = s.flip.x;
  const lift = s.lift.x;
  const gx = s.gx * 100;
  const gy = s.gy * 100;
  // foil strength grows with the tilt, like real foil catching the light
  const tilt = clamp(Math.hypot(rx, ry) / 22);
  const foil = 0.12 + tilt * 0.5 * s.hover + 0.08 * s.hover;
  const r = g.cw * 0.045;
  const shadowX = -ry * 1.2;
  const shadowY = 30 + rx * 0.8 + lift * 18;

  const face: React.CSSProperties = { position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(90% 70% at 50% 40%, #232036 0%, #0d0c16 60%, #07070c 100%)' }}>
      {/* the light on the table */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: g.cw * 2.4, height: g.cw * 2.4, transform: 'translate(-50%,-50%)', background: `radial-gradient(circle, rgba(140,110,255,${0.12 + tilt * 0.1}), transparent 60%)` }} />
      <div
        style={{
          position: 'absolute',
          left: g.x + g.cw * 0.08 + shadowX,
          top: g.y + g.ch * 0.06 + shadowY,
          width: g.cw * 0.84,
          height: g.ch * 0.9,
          borderRadius: r * 2,
          background: 'rgba(0,0,0,.6)',
          filter: `blur(${18 + lift * 14}px)`,
          transform: `scale(${1 - lift * 0.04})`,
        }}
      />
      <div style={{ position: 'absolute', left: g.x, top: g.y, width: g.cw, height: g.ch, perspective: g.ch * 2.2 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `translateZ(${lift * g.ch * 0.06}px) rotateX(${rx}deg) rotateY(${ry + flip}deg)`,
          }}
        >
          {/* ── front */}
          <div style={{ ...face, background: 'linear-gradient(160deg,#f6d77a,#c99a2e 40%,#f3dd8f 70%,#a8771c)', padding: g.cw * 0.035 }}>
            <div style={{ position: 'absolute', inset: g.cw * 0.035, borderRadius: r * 0.7, background: 'linear-gradient(170deg,#1b1640,#2b1f5c 50%,#16112e)', overflow: 'hidden' }}>
              <CardFace uid={uid} cw={g.cw} ch={g.ch} />
            </div>
            {/* rainbow foil bands, sliding with the tilt */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(115deg, #ff3d7f 0%, #ffcf3d 6%, #4dffb4 12%, #3dc5ff 18%, #a84dff 24%, #ff3d7f 30%)',
                backgroundSize: '260% 260%',
                backgroundPosition: `${50 + ry * 2.2}% ${50 - rx * 2.2}%`,
                mixBlendMode: 'color-dodge',
                opacity: foil * 0.85,
              }}
            />
            {/* fine diagonal etching, only visible in the light */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.0) 0 3px, rgba(255,255,255,.22) 3px 4px), repeating-linear-gradient(-45deg, rgba(255,255,255,.0) 0 3px, rgba(255,255,255,.14) 3px 4px)',
                mixBlendMode: 'overlay',
                opacity: foil,
                WebkitMaskImage: `radial-gradient(circle at ${gx}% ${gy}%, #000 0%, transparent 55%)`,
                maskImage: `radial-gradient(circle at ${gx}% ${gy}%, #000 0%, transparent 55%)`,
              }}
            />
            {/* glitter */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, mixBlendMode: 'color-dodge', opacity: 0.25 + tilt * 0.75 * s.hover }}>
              {GLITTER.map(([x, y, sz, ph], i) => {
                const tw = Math.max(0, Math.sin(ph * 6.28 + (rx * 0.21 + ry * 0.17) * (1 + (i % 3))));
                return <circle key={i} cx={`${x * 100}%`} cy={`${y * 100}%`} r={sz * g.cw * 0.0042 * (0.3 + tw)} fill={`hsl(${(x * 360 + ry * 8) % 360},100%,80%)`} opacity={tw} />;
              })}
            </svg>
            {/* glare */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(farthest-corner circle at ${gx}% ${gy}%, rgba(255,255,255,${0.55 * s.hover + 0.1}) 0%, rgba(255,255,255,.1) 25%, rgba(0,0,0,.35) 90%)`,
                mixBlendMode: 'overlay',
              }}
            />
          </div>
          {/* ── back */}
          <div style={{ ...face, transform: 'rotateY(180deg)', background: 'linear-gradient(160deg,#1d2a6b,#0f1640)' }}>
            <CardBack cw={g.cw} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(farthest-corner circle at ${100 - gx}% ${gy}%, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,.3) 90%)`,
                mixBlendMode: 'overlay',
              }}
            />
          </div>
        </div>
      </div>
    </Stage>
  );
}

// fixed glitter points (x, y, size, phase) so every render matches
const GLITTER: [number, number, number, number][] = Array.from({ length: 90 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.678;
  const c = Math.sin(i * 39.425) * 9876.54;
  return [a - Math.floor(a), b - Math.floor(b), 1 + (c - Math.floor(c)) * 3, (a * 7) % 1];
});

const disp = "'Archivo Variable', Archivo, system-ui, sans-serif";

/** the printed front: an original "Solar Moth" creature in an art window, name, type and stats */
function CardFace({ uid, cw, ch }: { uid: string; cw: number; ch: number }) {
  const fs = cw * 0.06;
  return (
    <div style={{ position: 'absolute', inset: 0, color: '#f7f1ff', fontFamily: disp }}>
      <div style={{ position: 'absolute', left: cw * 0.05, right: cw * 0.05, top: cw * 0.035, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: fs * 1.25, fontWeight: 800, letterSpacing: '.01em' }}>Solar Moth</span>
        <span style={{ fontSize: fs * 0.9, fontWeight: 700, color: '#ffd76a' }}>
          HP <span style={{ fontSize: fs * 1.25 }}>120</span>
        </span>
      </div>
      <div style={{ position: 'absolute', left: cw * 0.05, right: cw * 0.05, top: cw * 0.16, height: ch * 0.44, borderRadius: cw * 0.02, overflow: 'hidden', boxShadow: 'inset 0 0 0 2px #e8c45a, 0 4px 12px rgba(0,0,0,.4)' }}>
        <svg viewBox="0 0 200 170" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id={`sky${uid}`} cx="50%" cy="45%" r="70%">
              <stop offset="0" stopColor="#ffb86b" />
              <stop offset="0.35" stopColor="#d9467a" />
              <stop offset="1" stopColor="#2a1a5e" />
            </radialGradient>
            <linearGradient id={`wing${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff1b8" />
              <stop offset="0.5" stopColor="#ff9a3d" />
              <stop offset="1" stopColor="#c2185b" />
            </linearGradient>
          </defs>
          <rect width="200" height="170" fill={`url(#sky${uid})`} />
          <circle cx="100" cy="78" r="46" fill="#ffe6a6" opacity=".9" />
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1="100" y1="78" x2={100 + Math.cos((i / 16) * 6.283) * 95} y2={78 + Math.sin((i / 16) * 6.283) * 95} stroke="#ffe6a6" strokeOpacity=".22" strokeWidth="3" />
          ))}
          <path d="M0 140 L40 108 L70 126 L105 96 L140 124 L170 104 L200 122 L200 170 L0 170Z" fill="#1c1240" />
          <path d="M0 152 L50 128 L90 146 L130 124 L200 150 L200 170 L0 170Z" fill="#120b2c" />
          {/* the moth */}
          <g transform="translate(100 84)">
            <path d="M0 0 C-20 -40 -70 -50 -78 -18 C-84 8 -40 14 0 4Z" fill={`url(#wing${uid})`} stroke="#5a1035" strokeWidth="1.5" />
            <path d="M0 0 C20 -40 70 -50 78 -18 C84 8 40 14 0 4Z" fill={`url(#wing${uid})`} stroke="#5a1035" strokeWidth="1.5" />
            <path d="M0 6 C-14 14 -46 36 -40 52 C-30 60 -8 34 0 14Z" fill="#ff7a3d" stroke="#5a1035" strokeWidth="1.5" />
            <path d="M0 6 C14 14 46 36 40 52 C30 60 8 34 0 14Z" fill="#ff7a3d" stroke="#5a1035" strokeWidth="1.5" />
            <circle cx="-44" cy="-18" r="9" fill="#2a1a5e" />
            <circle cx="44" cy="-18" r="9" fill="#2a1a5e" />
            <circle cx="-44" cy="-18" r="4" fill="#ffe6a6" />
            <circle cx="44" cy="-18" r="4" fill="#ffe6a6" />
            <ellipse cx="0" cy="12" rx="6" ry="24" fill="#3b1a4a" />
            <path d="M-2 -10 C-8 -26 -18 -32 -24 -30 M2 -10 C8 -26 18 -32 24 -30" stroke="#3b1a4a" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', left: cw * 0.05, right: cw * 0.05, top: ch * 0.53, textAlign: 'center', fontSize: fs * 0.62, letterSpacing: '.14em', color: '#cdbdf5', fontFamily: "'Inter Variable', Inter, sans-serif" }}>
        LIGHT TYPE · NO. 042 · LENGTH 3'7"
      </div>
      {[
        ['Sunflare', 'Scorches every card in play.', '90'],
        ['Dust Veil', 'The next attack misses.', '40'],
      ].map(([name, text, dmg], i) => (
        <div key={name} style={{ position: 'absolute', left: cw * 0.07, right: cw * 0.07, top: ch * (0.6 + i * 0.12), display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', borderBottom: i === 0 ? '1px solid rgba(255,255,255,.15)' : undefined, paddingBottom: ch * 0.015 }}>
          <div>
            <div style={{ fontSize: fs * 0.95, fontWeight: 750 }}>{name}</div>
            <div style={{ fontSize: fs * 0.62, color: '#cdbdf5', fontFamily: "'Inter Variable', Inter, sans-serif" }}>{text}</div>
          </div>
          <div style={{ fontSize: fs * 1.25, fontWeight: 800 }}>{dmg}</div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: cw * 0.06, right: cw * 0.06, bottom: ch * 0.03, display: 'flex', justifyContent: 'space-between', fontSize: fs * 0.55, color: '#a99ad6', fontFamily: "'Inter Variable', Inter, sans-serif", letterSpacing: '.08em' }}>
        <span>★ HOLO RARE</span>
        <span>042/100</span>
      </div>
    </div>
  );
}

function CardBack({ cw }: { cw: number }) {
  return (
    <svg viewBox="0 0 100 140" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      <rect x="4" y="4" width="92" height="132" rx="4" fill="none" stroke="#e8c45a" strokeWidth="1.2" />
      <rect x="8" y="8" width="84" height="124" rx="3" fill="none" stroke="#e8c45a" strokeOpacity=".4" strokeWidth=".5" />
      {Array.from({ length: 24 }, (_, i) => (
        <line key={i} x1="50" y1="70" x2={50 + Math.cos((i / 24) * 6.283) * 60} y2={70 + Math.sin((i / 24) * 6.283) * 60} stroke="#3a4cb0" strokeWidth=".6" />
      ))}
      <circle cx="50" cy="70" r="24" fill="#16205a" stroke="#e8c45a" strokeWidth="1.2" />
      <circle cx="50" cy="70" r="18" fill="none" stroke="#e8c45a" strokeOpacity=".5" strokeWidth=".6" />
      <path d="M50 54 L54 66 L66 70 L54 74 L50 86 L46 74 L34 70 L46 66Z" fill="#ffd76a" />
      <text x="50" y="118" textAnchor="middle" fontSize={cw > 0 ? 6 : 6} fill="#e8c45a" fontFamily={disp} fontWeight={700} letterSpacing="1.5">
        EFFECTS LAB
      </text>
    </svg>
  );
}
