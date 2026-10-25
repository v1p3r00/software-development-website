import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A desktop dock. Icons swell under the cursor with a bell-shaped falloff, each on its own
 * spring so the wave rolls along with a little overshoot, and the shelf grows to make room.
 * Click an icon to launch it: it hops (twice, with squash on landing) and a running dot lights.
 */

const APPS = [
  { name: 'Finder', a: '#5ac8fa', b: '#1a6dff' },
  { name: 'Mail', a: '#6fd3ff', b: '#1e88ff' },
  { name: 'Music', a: '#ff6f91', b: '#f2254a' },
  { name: 'Photos', a: '#fff3c4', b: '#ffd36a' },
  { name: 'Messages', a: '#7cf27c', b: '#20b84a' },
  { name: 'Calendar', a: '#ffffff', b: '#e9e9ee' },
  { name: 'Terminal', a: '#3b3f4a', b: '#111317' },
  { name: 'Settings', a: '#c9ccd4', b: '#7c818c' },
];

interface Icon {
  sc: Spring; // magnification
  hop: number; // launch bounce timer (s), <0 = none
  sq: Spring;
  run: number; // running-dot brightness
}
interface S {
  icons: Icon[];
  idle: number;
  t: number;
  ax: number;
  hover: number;
  hot: number;
  autoNext: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const B = Math.min((w * 0.9) / (APPS.length * 1.18 + 2.2), m * 0.12);
  const gap = B * 0.18;
  const pad = B * 0.2;
  const base = h - m * 0.06 - pad; // icon bottoms sit here
  const W0 = APPS.length * B + (APPS.length - 1) * gap;
  const x0 = w / 2 - W0 / 2;
  // resting centres (used for the magnify falloff, so it does not chase its own tail)
  const cx = APPS.map((_, i) => x0 + B / 2 + i * (B + gap));
  return { m, B, gap, pad, base, cx };
}

export const sim = defineSim<S>({
  init: (w) => ({ icons: APPS.map(() => ({ sc: sp(1), hop: -1, sq: sp(), run: 0 })), idle: 2, t: 0, ax: w / 2, hover: 0, hot: -1, autoNext: 1 }),
  step(s, f) {
    const { w, h, dt } = f;
    const g = geom(w, h);
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    let px = f.p.x;
    let near = f.p.over && f.p.y > g.base - g.B * 2.6;
    let click = f.pressed && near;
    if (s.idle > 2.5) {
      // self-demo: glide along the dock, launching an app now and then
      px = w / 2 + Math.sin(s.t * 0.75) * (g.cx[g.cx.length - 1] - g.cx[0]) * 0.55;
      near = true;
      s.autoNext -= dt;
      click = false;
      if (s.autoNext <= 0) {
        s.autoNext = 2.4;
        click = true;
      }
    }
    s.ax = approach(s.ax, px, 25, dt);
    s.hover = approach(s.hover, near ? 1 : 0, 9, dt);
    const sigma = g.B * 1.35;
    let hot = -1;
    let best = Infinity;
    s.icons.forEach((ic, i) => {
      const d = (s.ax - g.cx[i]) / sigma;
      if (Math.abs(s.ax - g.cx[i]) < best) {
        best = Math.abs(s.ax - g.cx[i]);
        hot = i;
      }
      const target = 1 + 0.85 * Math.exp(-d * d) * s.hover;
      spring(ic.sc, target, 380, f.reduced ? 40 : 22, dt);
      if (ic.hop >= 0) {
        const prev = ic.hop;
        ic.hop += dt;
        // a landing between bounces squashes the icon
        if ((prev < 0.42 && ic.hop >= 0.42) || (prev < 0.84 && ic.hop >= 0.84)) {
          ic.sq.v += 5;
          f.emit({ name: 'thud', gain: 0.2, rate: 1.6 });
        }
        if (ic.hop > 0.84) ic.hop = -1;
      }
      spring(ic.sq, 0, 420, 12, dt);
      if (ic.run > 0 && ic.run < 1) ic.run = Math.min(1, ic.run + dt * 2);
    });
    if (best > g.B * 0.7) hot = -1;
    if (hot !== s.hot && hot >= 0 && near) f.emit({ name: 'tick', gain: 0.08, rate: 1.8 });
    s.hot = near ? hot : -1;
    if (click && hot >= 0 && s.icons[hot].hop < 0) {
      s.icons[hot].hop = 0;
      if (s.icons[hot].run === 0) s.icons[hot].run = 0.01;
      f.emit({ name: 'pop', gain: 0.5, rate: 1.1, pan: (g.cx[hot] / w) * 2 - 1 });
    }
  },
});

function Glyph({ i, B }: { i: number; B: number }) {
  const sw = B * 0.07;
  const st = { fill: 'none', stroke: '#fff', strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const u = B / 2;
  switch (i) {
    case 0:
      return (
        <g>
          <path d={`M${u} ${B * 0.12}V${B * 0.88}`} stroke="#0b3a8a" strokeWidth={sw * 0.6} opacity={0.5} />
          <circle cx={B * 0.32} cy={B * 0.4} r={B * 0.05} fill="#0b2a66" />
          <circle cx={B * 0.68} cy={B * 0.4} r={B * 0.05} fill="#0b2a66" />
          <path d={`M${B * 0.3} ${B * 0.64}Q${u} ${B * 0.78} ${B * 0.7} ${B * 0.64}`} {...st} stroke="#0b2a66" />
        </g>
      );
    case 1:
      return <path d={`M${B * 0.2} ${B * 0.3}H${B * 0.8}V${B * 0.7}H${B * 0.2}ZM${B * 0.2} ${B * 0.3}L${u} ${B * 0.52}L${B * 0.8} ${B * 0.3}`} {...st} />;
    case 2:
      return (
        <g>
          <path d={`M${B * 0.42} ${B * 0.68}V${B * 0.26}L${B * 0.72} ${B * 0.2}V${B * 0.62}`} {...st} />
          <circle cx={B * 0.35} cy={B * 0.69} r={B * 0.08} fill="#fff" />
          <circle cx={B * 0.65} cy={B * 0.63} r={B * 0.08} fill="#fff" />
        </g>
      );
    case 3:
      return (
        <g transform={`translate(${u} ${u})`}>
          {Array.from({ length: 8 }, (_, k) => (
            <ellipse key={k} cx={0} cy={-B * 0.18} rx={B * 0.09} ry={B * 0.17} fill={`hsl(${k * 45} 85% 60%)`} opacity={0.85} transform={`rotate(${k * 45})`} />
          ))}
        </g>
      );
    case 4:
      return <path d={`M${u} ${B * 0.24}C${B * 0.84} ${B * 0.24} ${B * 0.84} ${B * 0.66} ${u} ${B * 0.66}C${B * 0.44} ${B * 0.66} ${B * 0.38} ${B * 0.65} ${B * 0.33} ${B * 0.63}L${B * 0.22} ${B * 0.74}L${B * 0.25} ${B * 0.58}C${B * 0.16} ${B * 0.42} ${B * 0.24} ${B * 0.24} ${u} ${B * 0.24}Z`} fill="#fff" />;
    case 5:
      return (
        <g fontFamily="'Inter Variable', Inter, system-ui" textAnchor="middle">
          <text x={u} y={B * 0.3} fontSize={B * 0.15} fontWeight={600} fill="#ff3b30">
            FRI
          </text>
          <text x={u} y={B * 0.74} fontSize={B * 0.44} fontWeight={300} fill="#1c1c1e">
            25
          </text>
        </g>
      );
    case 6:
      return (
        <g fontFamily="'JetBrains Mono Variable', monospace" fontWeight={700}>
          <text x={B * 0.18} y={B * 0.42} fontSize={B * 0.24} fill="#7cf27c">
            &gt;_
          </text>
        </g>
      );
    default:
      return (
        <g transform={`translate(${u} ${u})`}>
          {Array.from({ length: 10 }, (_, k) => (
            <rect key={k} x={-B * 0.05} y={-B * 0.34} width={B * 0.1} height={B * 0.12} rx={B * 0.02} fill="#3a3d45" transform={`rotate(${k * 36})`} />
          ))}
          <circle r={B * 0.25} fill="#3a3d45" />
          <circle r={B * 0.1} fill="#c9ccd4" />
        </g>
      );
  }
}

export default function DockMagnify() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const { B, gap, pad, base, m } = g;
  // lay icons out from their current sizes so the shelf grows
  const sizes = s.icons.map((ic) => B * clamp(ic.sc.x, 0.8, 2.2));
  const total = sizes.reduce((a, b) => a + b, 0) + gap * (APPS.length - 1);
  let x = w / 2 - total / 2;
  const xs = sizes.map((sz) => {
    const c = x + sz / 2;
    x += sz + gap;
    return c;
  });
  const shelfW = total + pad * 2;
  const hot = s.hot;
  const lf = Math.max(10, B * 0.17); // label font size
  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(90% 70% at 20% 10%, #ff9a8b 0%, transparent 55%), radial-gradient(80% 70% at 85% 25%, #7a6bff 0%, transparent 60%), linear-gradient(180deg, #2b1f5c 0%, #0f1030 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          {APPS.map((a, i) => (
            <linearGradient key={i} id={`a${i}${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={a.a} />
              <stop offset="1" stopColor={a.b} />
            </linearGradient>
          ))}
          <linearGradient id={`gl${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id={`sh${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy={B * 0.06} stdDeviation={B * 0.06} floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>
        {/* the glass shelf */}
        <rect x={w / 2 - shelfW / 2} y={base - B - pad * 0.6} width={shelfW} height={B + pad * 1.6} rx={B * 0.3} fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
        <rect x={w / 2 - shelfW / 2 + 1} y={base - B - pad * 0.6 + 1} width={shelfW - 2} height={(B + pad * 1.6) * 0.5} rx={B * 0.3} fill={`url(#gl${uid})`} />
        {s.icons.map((ic, i) => {
          const sz = sizes[i];
          // launch hop: two parabolic bounces, the second smaller
          let lift = 0;
          if (ic.hop >= 0) {
            const tt = ic.hop < 0.42 ? ic.hop / 0.42 : (ic.hop - 0.42) / 0.42;
            const amp = ic.hop < 0.42 ? 0.9 : 0.4;
            lift = 4 * tt * (1 - tt) * amp * B;
          }
          const sq = clamp(ic.sq.x * 0.05, -0.2, 0.2);
          const r = sz * 0.23;
          return (
            <g key={i} transform={`translate(${xs[i]} ${base - lift}) scale(${1 + sq} ${1 - sq}) translate(${-sz / 2} ${-sz})`}>
              <g filter={`url(#sh${uid})`}>
                <rect width={sz} height={sz} rx={r} fill={`url(#a${i}${uid})`} />
              </g>
              <g transform={`scale(${sz / B})`}>
                <Glyph i={i} B={B} />
              </g>
              <rect width={sz} height={sz * 0.5} rx={r} fill={`url(#gl${uid})`} opacity={0.6} />
              <rect width={sz} height={sz} rx={r} fill="none" stroke="#fff" strokeOpacity={0.18} />
            </g>
          );
        })}
        {/* running indicators */}
        {s.icons.map((ic, i) => (ic.run > 0 ? <circle key={i} cx={xs[i]} cy={base + pad * 0.55} r={B * 0.045} fill="#fff" opacity={ic.run * 0.9} /> : null))}
        {/* label bubble over the hovered icon */}
        {hot >= 0 && s.hover > 0.5 && (
          <g transform={`translate(${xs[hot]} ${base - sizes[hot] - B * 0.32})`} opacity={clamp((s.hover - 0.5) * 2)}>
            <rect x={-lf * 4.4} y={-lf * 2.1} width={lf * 8.8} height={lf * 2} rx={lf * 0.6} fill="rgba(30,30,40,0.82)" />
            <text y={-lf * 0.75} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontSize={lf} fontWeight={600} fill="#fff">
              {APPS[hot].name}
            </text>
          </g>
        )}
        <text x={w / 2} y={h * 0.32} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={m * 0.09} fill="#fff" opacity={0.92}>
          9:41
        </text>
        <text x={w / 2} y={h * 0.32 + m * 0.06} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontSize={m * 0.03} fill="#fff" opacity={0.6}>
          hover the dock
        </text>
      </svg>
      {APPS.map((a, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Open ${a.name}`}
          style={{ position: 'absolute', left: xs[i] - sizes[i] / 2, top: base - sizes[i], width: sizes[i], height: sizes[i], opacity: 0, borderRadius: sizes[i] * 0.23 }}
        />
      ))}
    </Stage>
  );
}
