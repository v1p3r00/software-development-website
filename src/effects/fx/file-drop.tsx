import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Drag a file onto the folder. While you hover it, the folder's front flap yawns open in
 * anticipation; drop it and the file falls in under gravity, the flap snaps shut and the whole
 * folder gulps — squash, stretch and a wobble — and the counter ticks up. Drop it anywhere else
 * and it springs back home. A new file pops in for the next round.
 */

const KINDS = [
  { ext: 'PDF', col: '#ff4d5e' },
  { ext: 'PNG', col: '#3aa0ff' },
  { ext: 'ZIP', col: '#ffb020' },
  { ext: 'MP4', col: '#9b6bff' },
];

interface S {
  mode: 'rest' | 'drag' | 'fall' | 'home';
  x: Spring;
  y: Spring;
  vy: number;
  tilt: Spring;
  scale: Spring;
  ox: number;
  oy: number;
  open: Spring;
  gulp: Spring;
  count: number;
  kind: number;
  idle: number;
  auto: number; // auto-demo timer (-1 = off)
  t: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const side = w > h * 1.1;
  const fw = m * 0.42;
  const fh = m * 0.3;
  return {
    m,
    fw,
    fh,
    pw: m * 0.17, // paper size
    ph: m * 0.22,
    hx: side ? w / 2 - m * 0.42 : w / 2,
    hy: side ? h * 0.42 : h * 0.3,
    cx: side ? w / 2 + m * 0.3 : w / 2,
    cy: side ? h * 0.6 : h * 0.68,
  };
}

export const sim = defineSim<S>({
  init: (w, h) => {
    const g = geom(w, h);
    return { mode: 'rest', x: sp(g.hx), y: sp(g.hy), vy: 0, tilt: sp(), scale: sp(1), ox: 0, oy: 0, open: sp(), gulp: sp(), count: 3, kind: 0, idle: 0, auto: -1, t: 0 };
  },
  step(s, f) {
    const { w, h, dt } = f;
    if (dt <= 0) return;
    const g = geom(w, h);
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    // pointer, or the auto-demo's invisible hand that carries the file along an arc
    let px = f.p.x;
    let py = f.p.y;
    let down = f.p.down;
    let pressed = f.pressed;
    // keyboard: the button runs the same carry-and-drop as the demo
    if (f.actions.some((a) => a.type === 'drop') && s.mode === 'rest') s.auto = 0;
    if (f.pressed && s.auto >= 0 && s.idle === 0) s.auto = -1; // a real press takes over
    if (s.auto >= 0 || (s.idle > 2.5 && s.mode === 'rest')) {
      if (s.auto < 0) s.auto = 0;
      s.auto += dt;
      const u = clamp((s.auto - 0.3) / 1.1);
      const e = u * u * (3 - 2 * u);
      px = g.hx + (g.cx - g.hx) * e;
      py = g.hy + (g.cy - g.fh * 0.35 - g.hy) * e - Math.sin(e * Math.PI) * g.m * 0.18;
      down = s.auto > 0.15 && s.auto < 1.55;
      pressed = s.auto - dt <= 0.15 && s.auto > 0.15;
      if (s.auto > 1.6) s.auto = -1;
    }
    const overFolder = Math.abs(px - g.cx) < g.fw * 0.6 && py > g.cy - g.fh * 0.95 && py < g.cy + g.fh * 0.6;
    const onFile = Math.abs(px - s.x.x) < g.pw * 0.65 && Math.abs(py - s.y.x) < g.ph * 0.65;
    if (pressed && onFile && (s.mode === 'rest' || s.mode === 'home')) {
      s.mode = 'drag';
      s.ox = s.x.x - px;
      s.oy = s.y.x - py;
      s.scale.v += 2;
      f.emit({ name: 'paper', gain: 0.4 });
    }
    if (s.mode === 'drag') {
      spring(s.x, px + s.ox, 900, 50, dt);
      spring(s.y, py + s.oy, 900, 50, dt);
      // the paper swings with the drag like it hangs from your finger
      spring(s.tilt, clamp(s.x.v / (g.m * 6), -0.5, 0.5), 200, 14, dt);
      spring(s.scale, 1.08, 300, 18, dt);
      if (!down) {
        if (overFolder) {
          s.mode = 'fall';
          s.vy = Math.max(0, s.y.v * 0.3);
          f.emit({ name: 'whoosh', gain: 0.3, rate: 1.4 });
        } else {
          s.mode = 'home';
          f.emit({ name: 'swoosh', gain: 0.25 });
        }
      }
    } else if (s.mode === 'fall') {
      s.x.x = approach(s.x.x, g.cx, 10, dt);
      s.vy += g.m * 6 * dt;
      s.y.x += s.vy * dt;
      spring(s.tilt, 0, 200, 14, dt);
      spring(s.scale, 0.9, 200, 14, dt);
      if (s.y.x > g.cy + g.fh * 0.2) {
        // swallowed
        s.count++;
        s.gulp.v -= 9;
        f.emit({ name: 'thud', gain: 0.5, rate: 1.1 });
        f.emit({ name: 'pop', gain: 0.5, rate: 0.9 });
        s.kind = (s.kind + 1) % KINDS.length;
        s.mode = 'rest';
        s.x.x = g.hx;
        s.x.v = 0;
        s.y.x = g.hy;
        s.y.v = 0;
        s.scale.x = 0;
        s.scale.v = 0;
        s.tilt.x = 0;
      }
    } else {
      spring(s.x, g.hx, 160, 13, dt);
      spring(s.y, g.hy, 160, 13, dt);
      spring(s.tilt, 0, 200, 12, dt);
      spring(s.scale, onFile && f.p.over ? 1.04 : 1, 260, 12, dt);
      if (s.mode === 'home' && Math.abs(s.x.x - g.hx) < 2 && Math.abs(s.y.x - g.hy) < 2) s.mode = 'rest';
    }
    // the flap opens when a dragged file hovers, and snaps shut as it falls in
    const want = s.mode === 'drag' ? (overFolder ? 1 : 0.15) : s.mode === 'fall' ? 0.9 : 0;
    spring(s.open, want, 260, f.reduced ? 30 : 13, dt);
    spring(s.gulp, 0, 240, f.reduced ? 30 : 8, dt);
  },
});

export default function FileDrop() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const { m, fw, fh, pw, ph, cx, cy } = g;
  const gu = clamp(s.gulp.x * 0.12, -0.2, 0.2);
  // gulp: squash wide/short, then stretch, around the folder's base
  const sx = 1 - gu;
  const sy = 1 + gu * 1.2;
  const op = clamp(s.open.x, -0.2, 1.2);
  const kind = KINDS[s.kind];
  const tab = fh * 0.14;
  const back = `M${-fw / 2} ${-fh / 2 + tab}V${fh / 2}H${fw / 2}V${-fh / 2 + tab}H${-fw * 0.05}L${-fw * 0.12} ${-fh / 2}H${-fw / 2 + fh * 0.08}Q${-fw / 2} ${-fh / 2} ${-fw / 2} ${-fh / 2 + tab}Z`;
  // the front flap tips forward when it opens: its top edge drops and widens
  const fTop = -fh / 2 + fh * 0.24 + op * fh * 0.22;
  const spread = op * fw * 0.08;
  const front = `M${-fw / 2 - spread} ${fTop}H${fw / 2 + spread}L${fw / 2} ${fh / 2}H${-fw / 2}Z`;
  const fileEl = (
    <g transform={`translate(${s.x.x} ${s.y.x}) rotate(${s.tilt.x * 40}) scale(${clamp(s.scale.x, 0, 1.3)})`}>
      <path
        d={`M${-pw / 2} ${-ph / 2}H${pw * 0.2}L${pw / 2} ${-ph / 2 + pw * 0.3}V${ph / 2}H${-pw / 2}Z`}
        fill="#fbfcff"
        stroke="#d5dbe8"
        strokeWidth={m * 0.003}
        filter={s.mode === 'drag' ? `url(#lift${uid})` : `url(#rest${uid})`}
      />
      <path d={`M${pw * 0.2} ${-ph / 2}V${-ph / 2 + pw * 0.3}H${pw / 2}Z`} fill="#dfe5f1" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-pw * 0.32} y={-ph * 0.12 + i * ph * 0.11} width={pw * (i === 3 ? 0.4 : 0.64)} height={ph * 0.04} rx={ph * 0.02} fill="#e3e8f2" />
      ))}
      <rect x={-pw * 0.36} y={-ph * 0.36} width={pw * 0.46} height={ph * 0.16} rx={ph * 0.04} fill={kind.col} />
      <text x={-pw * 0.13} y={-ph * 0.245} textAnchor="middle" fontFamily="'Inter Variable', Inter, system-ui" fontWeight={800} fontSize={ph * 0.1} fill="#fff">
        {kind.ext}
      </text>
    </g>
  );
  const falling = s.mode === 'fall';
  return (
    <Stage fx={fx} cursor={s.mode === 'drag' ? 'grabbing' : 'grab'} style={{ background: 'radial-gradient(110% 90% at 50% 20%, #f7f2ff 0%, #e8e1f7 55%, #d6cdec 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`bk${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b6cff" />
            <stop offset="1" stopColor="#3a3fc8" />
          </linearGradient>
          <linearGradient id={`fr${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8f9cff" />
            <stop offset="1" stopColor="#5c63e8" />
          </linearGradient>
          <filter id={`rest${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy={m * 0.008} stdDeviation={m * 0.01} floodColor="#3a2a7a" floodOpacity="0.2" />
          </filter>
          <filter id={`lift${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy={m * 0.03} stdDeviation={m * 0.025} floodColor="#3a2a7a" floodOpacity="0.28" />
          </filter>
          <filter id={`bl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.02} />
          </filter>
        </defs>
        {/* drop target hint */}
        <ellipse cx={cx} cy={cy + fh * 0.62} rx={fw * 0.55 * sx} ry={fh * 0.1} fill="#2a1f6a" opacity={0.22} filter={`url(#bl${uid})`} />
        <g transform={`translate(${cx} ${cy + fh / 2}) scale(${sx} ${sy}) translate(0 ${-fh / 2})`}>
          <path d={back} fill={`url(#bk${uid})`} />
          {/* a soft glow inside the open folder */}
          <rect x={-fw * 0.42} y={-fh * 0.3} width={fw * 0.84} height={fh * 0.4} rx={fh * 0.05} fill="#c9d0ff" opacity={0.25 * clamp(op)} filter={`url(#bl${uid})`} />
        </g>
        {falling && fileEl}
        <g transform={`translate(${cx} ${cy + fh / 2}) scale(${sx} ${sy}) translate(0 ${-fh / 2})`}>
          <path d={front} fill={`url(#fr${uid})`} />
          <path d={`M${-fw / 2 - spread} ${fTop}H${fw / 2 + spread}`} stroke="#fff" strokeOpacity={0.45} strokeWidth={m * 0.004} />
          {/* count badge */}
          <g transform={`translate(${fw * 0.38} ${fh * 0.32}) scale(${1 - s.gulp.x * 0.08})`}>
            <circle r={fh * 0.13} fill="#fff" />
            <text y={fh * 0.045} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={fh * 0.14} fill="#3a3fc8">
              {s.count}
            </text>
          </g>
          <text x={-fw * 0.4} y={fh * 0.38} fontFamily="'Inter Variable', Inter, system-ui" fontWeight={700} fontSize={fh * 0.12} fill="#fff" opacity={0.9}>
            Projects
          </text>
        </g>
        {!falling && fileEl}
        <text x={w / 2} y={h - m * 0.05} textAnchor="middle" fontFamily="'JetBrains Mono Variable', monospace" fontSize={Math.max(10, m * 0.026)} fill="#7a6ca8" letterSpacing="0.1em">
          DRAG THE FILE INTO THE FOLDER
        </text>
      </svg>
      <button
        type="button"
        aria-label="Put the file into the folder"
        onClick={(e) => e.detail === 0 && fx.dispatch({ type: 'drop' })}
        style={{ position: 'absolute', left: g.hx - pw / 2, top: g.hy - ph / 2, width: pw, height: ph, opacity: 0, cursor: 'grab' }}
      />
    </Stage>
  );
}
