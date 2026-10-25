import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A frosted glass card holding three layers (scene, planet, title) at different depths.
 * Tilt it with the pointer: the layers slide against each other (parallax) and their shadows
 * fall further the higher they float. Press to pull the layers further apart.
 */

interface S {
  rx: Spring; // tilt around the x axis, deg
  ry: Spring; // tilt around the y axis, deg
  spread: Spring; // how far the layers stand off the glass (1 = rest)
  idle: number; // seconds since the last interaction
  demo: number; // 0..1 blend into the self-demo orbit
  t: number;
  holding: boolean;
}

function geom(w: number, h: number) {
  const ch = Math.min(h * 0.72, w * 0.68 * 1.3);
  const cw = ch / 1.3;
  return { cx: w / 2, cy: h / 2, cw, ch };
}

export const sim = defineSim<S>({
  init: () => ({ rx: sp(), ry: sp(), spread: sp(1), idle: 0, demo: 0, t: 0, holding: false }),
  step(s, f) {
    const { cx, cy, cw, ch } = geom(f.w, f.h);
    s.t += f.dt;
    const moving = Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = f.p.over && (moving || f.p.down) ? 0 : s.idle + f.dt;
    s.demo = approach(s.demo, s.idle > 2.5 || !f.p.over ? 1 : 0, 2.5, f.dt);

    // the pointer's position across the card, -1..1
    const nx = clamp((f.p.x - cx) / (cw * 0.6), -1.3, 1.3);
    const ny = clamp((f.p.y - cy) / (ch * 0.6), -1.3, 1.3);
    // self-demo: a slow figure-of-eight sway
    const ax = Math.sin(s.t * 1.1) * 0.9;
    const ay = Math.sin(s.t * 2.2) * 0.55;
    const tx = lerp(nx, ax, s.demo);
    const ty = lerp(ny, ay, s.demo);
    const k = f.reduced ? 0.5 : 1;
    spring(s.ry, tx * 26 * k, 90, 11, f.dt);
    spring(s.rx, -ty * 20 * k, 90, 11, f.dt);

    if (f.pressed) {
      s.holding = true;
      f.emit({ name: 'whoosh', gain: 0.35, rate: 1.2 });
    }
    if (s.holding && f.released) {
      s.holding = false;
      f.emit({ name: 'thud', gain: 0.3, rate: 1.4 });
    }
    // press = layers spread out; the demo breathes them gently
    const breathe = s.demo * (0.35 + 0.35 * Math.sin(s.t * 1.6));
    spring(s.spread, 1 + (s.holding ? 1.3 : 0) + breathe, 140, s.holding ? 14 : 8, f.dt);
  },
});

export default function DepthCard() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, cw, ch } = geom(w, h);
  const rx = s.rx.x;
  const ry = s.ry.x;
  const sp1 = s.spread.x;
  const u = cw / 100; // card unit
  const r = u * 7;
  // light comes from the top-left: a layer at depth z casts its shadow down and right,
  // further and softer the higher it floats
  // (painted into each layer once: box/text shadows, not CSS filters, which would be
  // re-applied on every composite while the card turns)
  const shadowFor = (z: number) => {
    const ox = 1.2 * z * u * 0.08;
    const oy = 1.8 * z * u * 0.08;
    return `${ox.toFixed(1)}px ${oy.toFixed(1)}px ${(z * u * 0.12 + 2).toFixed(1)}px rgba(4,6,20,${clamp(0.25 + z * 0.004, 0, 0.6)})`;
  };
  const layer = (z: number) => ({
    position: 'absolute' as const,
    transform: `translateZ(${(z * sp1 * u * 0.4).toFixed(2)}px)`,
    transformStyle: 'preserve-3d' as const,
  });
  // glare position follows the tilt (a reflection of a window behind the viewer)
  const gx = 50 + ry * 3;
  const gy = 30 - rx * 3;

  return (
    <Stage
      fx={fx}
      cursor="grab"
      style={{ background: 'radial-gradient(90% 80% at 50% 40%, #1b1f3d 0%, #0d0f22 55%, #06070f 100%)' }}
    >
      {/* coloured light blobs behind the glass so the frosting reads */}
      <div style={{ position: 'absolute', left: cx - cw * 0.9, top: cy - ch * 0.55, width: cw * 1.1, height: cw * 1.1, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,92,170,0.55), rgba(255,92,170,0) 65%)', transform: `translate(${-ry * 2}px, ${rx * 2}px)`, willChange: 'transform' }} />
      <div style={{ position: 'absolute', left: cx - cw * 0.1, top: cy - ch * 0.05, width: cw * 1.1, height: cw * 1.1, borderRadius: '50%', background: 'radial-gradient(circle, rgba(70,140,255,0.55), rgba(70,140,255,0) 65%)', transform: `translate(${-ry * 2}px, ${rx * 2}px)`, willChange: 'transform' }} />
      {/* contact shadow on the floor */}
      <div style={{ position: 'absolute', left: cx - cw * 0.45 + ry * u * 0.6, top: cy + ch * 0.5 + u * 4, width: cw * 0.9, height: u * 10, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.65), rgba(0,0,0,0))', opacity: 0.8 }} />
      <div style={{ position: 'absolute', left: cx - cw / 2, top: cy - ch / 2, width: cw, height: ch, perspective: cw * 3.2 }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)` }}>
          {/* the glass slab */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: r,
              background: 'linear-gradient(140deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12))',
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -${u * 0.6}px ${u * 2}px rgba(120,160,255,0.15), 0 ${u * 6}px ${u * 12}px rgba(0,0,0,0.45)`,
            }}
          />
          {/* layer 1: the scene, printed on a panel just above the glass */}
          <div style={{ ...layer(12), left: u * 7, top: u * 7, width: u * 86, height: u * 74, borderRadius: r * 0.7, boxShadow: shadowFor(12) }}>
            <svg width="100%" height="100%" viewBox="0 0 86 74" preserveAspectRatio="none" style={{ display: 'block', borderRadius: r * 0.7 }}>
              <defs>
                <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#1d1b5e" />
                  <stop offset="0.55" stopColor="#c2407a" />
                  <stop offset="1" stopColor="#ff9a5a" />
                </linearGradient>
                <radialGradient id={`sun${uid}`}>
                  <stop offset="0" stopColor="#fff3c4" />
                  <stop offset="0.5" stopColor="#ffd27a" />
                  <stop offset="1" stopColor="#ff9a5a" stopOpacity="0" />
                </radialGradient>
                <clipPath id={`pc${uid}`}>
                  <rect width="86" height="74" rx="5" />
                </clipPath>
              </defs>
              <g clipPath={`url(#pc${uid})`}>
                <rect width="86" height="74" fill={`url(#sky${uid})`} />
                <circle cx="43" cy="48" r="16" fill={`url(#sun${uid})`} />
                <path d="M0 56 L14 42 L24 50 L38 34 L52 50 L62 42 L86 58 L86 74 L0 74Z" fill="#3b1950" />
                <path d="M0 64 L18 52 L32 60 L48 48 L66 62 L86 54 L86 74 L0 74Z" fill="#200d33" />
                {[6, 14, 25, 33, 59, 71, 79, 18, 64].map((x, i) => (
                  <circle key={i} cx={x} cy={4 + ((i * 7) % 16)} r={0.35 + (i % 3) * 0.15} fill="#fff" opacity={0.5 + (i % 2) * 0.4} />
                ))}
              </g>
              <rect width="86" height="74" rx="5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
            </svg>
          </div>
          {/* layer 2: a ringed planet hovering higher */}
          <div style={{ ...layer(40), left: u * 52, top: u * 2, width: u * 40, height: u * 40 }}>
            <svg width="100%" height="100%" viewBox="0 0 40 40" style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <radialGradient id={`pl${uid}`} cx="35%" cy="30%" r="75%">
                  <stop offset="0" stopColor="#d5f3ff" />
                  <stop offset="0.35" stopColor="#5fb4ff" />
                  <stop offset="1" stopColor="#1a2a8a" />
                </radialGradient>
              </defs>
              <filter id={`ps${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.8" />
              </filter>
              {/* the planet's own shadow on the layers below */}
              <circle cx="23.5" cy="25" r="11" fill="#04061a" opacity="0.45" filter={`url(#ps${uid})`} />
              <ellipse cx="20" cy="20" rx="19" ry="5" fill="none" stroke="#ffd8a8" strokeOpacity="0.5" strokeWidth="1.4" transform="rotate(-18 20 20)" />
              <circle cx="20" cy="20" r="11" fill={`url(#pl${uid})`} />
              {/* the near half of the ring passes in front of the planet */}
              <path d="M1 20 A19 5 0 0 0 39 20" fill="none" stroke="#ffe4c2" strokeWidth="1.6" transform="rotate(-18 20 20)" />
              <ellipse cx="16" cy="15" rx="4" ry="2.2" fill="#fff" opacity="0.5" transform="rotate(-30 16 15)" />
            </svg>
          </div>
          {/* layer 3: the title, floating highest */}
          <div style={{ ...layer(70), left: u * 9, top: u * 84, width: u * 82 }}>
            <div style={{ fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: u * 11, lineHeight: 1, color: '#fff', letterSpacing: -u * 0.3, textShadow: shadowFor(70) }}>Aurora</div>
            <div style={{ fontFamily: "'Inter Variable', Inter, system-ui", fontSize: u * 4.6, color: 'rgba(225,230,255,0.8)', marginTop: u * 2.2, textShadow: shadowFor(40) }}>Northern lights · 3 nights</div>
            <div style={{ position: 'absolute', right: 0, top: u * 1, padding: `${u * 2}px ${u * 4}px`, borderRadius: u * 10, background: 'linear-gradient(180deg,#ffffff,#dfe6ff)', color: '#1b1f4d', fontFamily: "'Inter Variable', Inter, system-ui", fontWeight: 700, fontSize: u * 4.4, boxShadow: `0 1px 0 rgba(255,255,255,0.8) inset, ${shadowFor(50)}` }}>
              $1,240
            </div>
          </div>
          {/* glare on the glass surface, topmost */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden', transform: `translateZ(${u * 0.5}px)`, pointerEvents: 'none' }}>
            {/* a fixed highlight that slides (compositor-only) instead of a gradient redrawn per frame */}
            <div style={{ position: 'absolute', left: -cw * 0.6, top: -ch * 0.45, width: cw * 1.2, height: ch * 0.9, background: 'radial-gradient(closest-side, rgba(255,255,255,0.26), rgba(255,255,255,0))', transform: `translate(${((gx / 100) * cw).toFixed(1)}px, ${((gy / 100) * ch).toFixed(1)}px)`, willChange: 'transform' }} />
          </div>
        </div>
      </div>
      <button type="button" aria-label="Tilt the depth card" style={{ position: 'absolute', left: cx - cw / 2, top: cy - ch / 2, width: cw, height: ch, opacity: 0 }} />
    </Stage>
  );
}
