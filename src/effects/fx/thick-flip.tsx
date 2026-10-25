import { useId } from 'react';
import type { CSSProperties } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A thick playing card (a real slab with a layered paper edge). Click to flip it, or drag it
 * sideways and let go: it lifts off the table, turns over, and lands with a little rebound
 * and a wobble around the landing angle.
 */

interface S {
  ang: Spring; // rotation around the vertical axis, deg
  target: number;
  hop: Spring; // landing rebound height (px)
  rx: Spring; // small tilt toward the pointer
  dragging: boolean;
  startX: number;
  startAng: number;
  moved: number;
  idle: number;
  nextDemo: number;
  cool: number; // landing-sound cooldown
  t: number;
}

function geom(w: number, h: number) {
  const ch = Math.min(h * 0.62, w * 0.62 * 1.4);
  const cw = ch / 1.4;
  return { cx: w / 2, cy: h / 2 - ch * 0.03, cw, ch, d: cw * 0.065 };
}

export const sim = defineSim<S>({
  init: () => ({ ang: sp(), target: 0, hop: sp(), rx: sp(), dragging: false, startX: 0, startAng: 0, moved: 0, idle: 0, nextDemo: 2.6, cool: 0, t: 0 }),
  step(s, f) {
    const { cx, cy, cw, ch } = geom(f.w, f.h);
    s.t += f.dt;
    s.cool -= f.dt;
    const inside = Math.abs(f.p.x - cx) < cw * 0.6 && Math.abs(f.p.y - cy) < ch * 0.55;
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;

    if (f.pressed && inside) {
      s.dragging = true;
      s.startX = f.p.x;
      s.startAng = s.ang.x;
      s.moved = 0;
    }
    if (s.dragging) {
      // the card follows the finger: a card-width of drag is half a turn
      s.moved = Math.max(s.moved, Math.abs(f.p.x - s.startX));
      const a = s.startAng + ((f.p.x - s.startX) / cw) * 150;
      s.ang.v = (a - s.ang.x) / Math.max(f.dt, 1e-3);
      s.ang.x = a;
      if (!f.p.down) {
        s.dragging = false;
        if (s.moved < 8) s.target = Math.round(s.ang.x / 180) * 180 + (f.p.x < cx ? -180 : 180);
        else s.target = Math.round((s.ang.x + clamp(s.ang.v, -900, 900) * 0.2) / 180) * 180;
        f.emit({ name: 'whoosh', gain: 0.45, rate: 1.1 });
      }
    } else {
      // self-demo: flip every couple of seconds
      if (s.idle > 2.5 && s.t > s.nextDemo) {
        s.target += 180;
        s.nextDemo = s.t + 2.4;
        f.emit({ name: 'whoosh', gain: 0.35, rate: 1.15 });
      }
      const before = s.ang.x - s.target;
      // under-damped: it overshoots the landing and rocks back
      spring(s.ang, s.target, f.reduced ? 120 : 75, f.reduced ? 22 : 9.5, f.dt);
      const after = s.ang.x - s.target;
      if (Math.sign(before) !== Math.sign(after) && Math.abs(s.ang.v) > 200 && s.cool <= 0) {
        s.cool = 0.4;
        const g = clamp(Math.abs(s.ang.v) / 900, 0.25, 1);
        f.emit({ name: 'thud', gain: g, rate: 1.3 });
        f.emit({ name: 'paper', gain: g * 0.5 });
        s.hop.v -= Math.abs(s.ang.v) * 0.25; // rebound off the table
      }
    }
    if (s.idle < 2.5) s.nextDemo = s.t + 0.3;
    spring(s.hop, 0, 260, 12, f.dt);
    const ty = f.p.over && !s.dragging ? clamp((f.p.y - cy) / ch, -0.7, 0.7) : Math.sin(s.t * 0.8) * 0.25;
    spring(s.rx, 14 - ty * 14, 60, 12, f.dt);
  },
});

const RED = '#c8102e';

export default function ThickFlip() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, cw, ch, d } = geom(w, h);
  const a = s.ang.x;
  const rad = (a * Math.PI) / 180;
  // halfway through a turn the card is highest
  const lift = Math.abs(Math.sin(rad)) * (s.dragging ? 0.5 : 1);
  const hop = s.hop.x;
  const r = cw * 0.06;
  const zLift = lift * cw * 0.35 - hop * 0.6;
  const yLift = -lift * ch * 0.08 + hop * 0.3;
  // simple diffuse light from the upper left, toward the viewer
  const L = [-0.45, -0.35, 0.82];
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const frontLit = clamp(sinA * L[0] * -1 + cosA * L[2]);
  const backLit = clamp(sinA * L[0] - cosA * L[2]);
  const edgeLit = (side: number) => clamp(side * (cosA * -L[0] + sinA * L[2]) * 0.9 + 0.25);
  const sheen = 50 - sinA * 70;

  const face = (back: boolean): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    borderRadius: r,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: back ? `rotateY(180deg) translateZ(${d / 2}px)` : `translateZ(${d / 2}px)`,
    overflow: 'hidden',
  });
  const edge = (w2: number, h2: number, tr: string, lit: number): CSSProperties => ({
    position: 'absolute',
    left: (cw - w2) / 2,
    top: (ch - h2) / 2,
    width: w2,
    height: h2,
    transform: tr,
    // stacked paper plies, lit by the angle to the light
    background: `repeating-linear-gradient(${w2 < h2 ? 90 : 0}deg, #f3ead6 0 ${d * 0.16}px, #d8ccb0 ${d * 0.16}px ${d * 0.2}px, #f3ead6 ${d * 0.2}px ${d * 0.33}px)`,
    filter: `brightness(${(0.72 + lit * 0.4).toFixed(3)})`,
    backfaceVisibility: 'hidden',
  });
  const shW = cw * (0.55 + 0.45 * Math.abs(cosA)) + d;
  const shBlur = 6 + cw * 0.05; // constant: a changing blur would repaint every frame

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(85% 75% at 50% 45%, #1f5a43 0%, #0f3527 55%, #071a12 100%)' }}>
      {/* felt texture: a faint diagonal weave */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 4px)' }} />
      {/* shadow on the table: narrows as the card turns edge-on, softens as it rises */}
      <div
        style={{
          position: 'absolute',
          left: cx - shW / 2 + lift * cw * 0.12,
          top: cy - ch / 2 + lift * ch * 0.06 + ch * 0.04,
          width: shW,
          height: ch,
          borderRadius: r,
          background: 'rgba(0,0,0,0.55)',
          filter: `blur(${shBlur}px)`,
          opacity: 0.85 - lift * 0.4,
          transform: `scale(${1 - lift * 0.08 + lift * 0.1})`,
        }}
      />
      <div style={{ position: 'absolute', left: cx - cw / 2, top: cy - ch / 2, width: cw, height: ch, perspective: cw * 3 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `translateY(${yLift.toFixed(2)}px) translateZ(${zLift.toFixed(2)}px) rotateZ(${(sinA * lift * 5).toFixed(2)}deg) rotateX(${s.rx.x.toFixed(2)}deg) rotateY(${a.toFixed(2)}deg)`,
          }}
        >
          {/* the four edges of the slab */}
          <div style={edge(d, ch - r * 1.2, `rotateY(-90deg) translateZ(${cw / 2}px)`, edgeLit(-1))} />
          <div style={edge(d, ch - r * 1.2, `rotateY(90deg) translateZ(${cw / 2}px)`, edgeLit(1))} />
          <div style={edge(cw - r * 1.2, d, `rotateX(90deg) translateZ(${ch / 2}px)`, 0.9)} />
          <div style={edge(cw - r * 1.2, d, `rotateX(-90deg) translateZ(${ch / 2}px)`, 0.2)} />
          {/* front: the ace of spades */}
          <div style={{ ...face(false), background: 'linear-gradient(160deg,#fffdf6,#f1e9d6)' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 140" style={{ display: 'block' }}>
              <defs>
                <linearGradient id={`ink${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2b2b33" />
                  <stop offset="1" stopColor="#09090c" />
                </linearGradient>
              </defs>
              <rect x="4" y="4" width="92" height="132" rx="4" fill="none" stroke="#c9b98f" strokeWidth="0.6" />
              {[0, 1].map((k) => (
                <g key={k} transform={k ? 'rotate(180 50 70)' : undefined}>
                  <text x="11" y="20" textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize="13" fill="#111">A</text>
                  <path d="M11 24 C 7 28 5 30 6.5 32.5 C 8 34.5 10 33.5 10.6 32.5 L 9.6 36 L 12.4 36 L 11.4 32.5 C 12 33.5 14 34.5 15.5 32.5 C 17 30 15 28 11 24 Z" fill="#111" />
                </g>
              ))}
              <path d="M50 38 C 34 54 22 62 26 76 C 30 88 44 86 48 78 L 44 96 L 56 96 L 52 78 C 56 86 70 88 74 76 C 78 62 66 54 50 38 Z" fill={`url(#ink${uid})`} />
              <path d="M50 44 C 40 55 32 61 33 70" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheen - 25}%, rgba(255,255,255,0.5) ${sheen}%, rgba(255,255,255,0) ${sheen + 25}%)`, mixBlendMode: 'soft-light' }} />
            <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: (1 - frontLit) * 0.55 }} />
          </div>
          {/* back: a red lattice */}
          <div style={{ ...face(true), background: '#fbf6ea' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 140" style={{ display: 'block' }}>
              <defs>
                <pattern id={`lat${uid}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="8" height="8" fill={RED} />
                  <path d="M0 4 H8 M4 0 V8" stroke="#ffd7d7" strokeOpacity="0.55" strokeWidth="0.7" />
                  <circle cx="4" cy="4" r="1.1" fill="#ffe9e9" opacity="0.8" />
                </pattern>
              </defs>
              <rect x="6" y="6" width="88" height="128" rx="4" fill={`url(#lat${uid})`} />
              <rect x="6" y="6" width="88" height="128" rx="4" fill="none" stroke="#7d0a1c" strokeWidth="1.2" />
              <circle cx="50" cy="70" r="15" fill="#fbf6ea" stroke="#7d0a1c" strokeWidth="1.2" />
              <path d="M50 60 L58 70 L50 80 L42 70 Z" fill={RED} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${120 - sheen - 25}%, rgba(255,255,255,0.45) ${120 - sheen}%, rgba(255,255,255,0) ${120 - sheen + 25}%)`, mixBlendMode: 'soft-light' }} />
            <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: (1 - backLit) * 0.55 }} />
          </div>
        </div>
      </div>
      <button type="button" aria-label="Flip the card" style={{ position: 'absolute', left: cx - cw / 2, top: cy - ch / 2, width: cw, height: ch, opacity: 0 }} />
    </Stage>
  );
}
