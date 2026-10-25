import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * One screen dissolves into the next, block by block. The wave starts where you tap and spreads
 * out with a little noise; each block shrinks away with a flash of the accent colour and the new
 * screen's block grows back in with overshoot. Drawn on a canvas (hundreds of blocks).
 */

const SCREENS = 3;

interface S {
  cur: number;
  p: number; // transition progress 0..1, -1 = none
  ox: number; // origin of the wave, px
  oy: number;
  idle: number;
  auto: number;
  ticks: number; // sound throttle
}

const hash = (i: number) => {
  let x = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};

const DUR = 1.25;

function start(s: S, x: number, y: number, emit: (x: { name: string; gain?: number; rate?: number; pan?: number }) => void, w: number) {
  if (s.p >= 0) return;
  s.p = 0;
  s.ox = x;
  s.oy = y;
  emit({ name: 'zap', gain: 0.4, rate: 1.2, pan: (x / w) * 1.6 - 0.8 });
}

export const sim = defineSim<S>({
  init: (w, h) => ({ cur: 0, p: -1, ox: w / 2, oy: h / 2, idle: 0, auto: 1.2, ticks: 0 }),
  step(s, f) {
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    if (f.pressed) start(s, f.p.x, f.p.y, f.emit, f.w);
    for (const a of f.actions) if (a.type === 'next') start(s, f.w / 2, f.h / 2, f.emit, f.w);
    if (s.idle > 1.2 && s.p < 0) {
      s.auto += f.dt;
      if (s.auto > 1.6) {
        s.auto = 0;
        start(s, f.w * (0.2 + f.rand() * 0.6), f.h * (0.2 + f.rand() * 0.6), f.emit, f.w);
      }
    }
    if (s.p >= 0) {
      s.p += f.dt / (f.reduced ? DUR * 0.6 : DUR);
      // a crackle of ticks while the wave runs
      s.ticks -= f.dt;
      if (s.ticks <= 0 && s.p < 0.8) {
        s.ticks = 0.07;
        f.emit({ name: 'tick', gain: 0.12, rate: 1.5 + f.rand() * 0.8 });
      }
      if (s.p >= 1) {
        s.p = -1;
        s.cur = (s.cur + 1) % SCREENS;
        f.emit({ name: 'chime', gain: 0.25, rate: 1.3 });
      }
    }
  },
});

const ACCENT = ['#7c5cff', '#ff4f8b', '#2bd4a8'];

/** paint one of the three screens into an offscreen canvas */
function paint(i: number, w: number, h: number, dpr: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * dpr));
  c.height = Math.max(1, Math.round(h * dpr));
  const g = c.getContext('2d')!;
  g.scale(dpr, dpr);
  const m = Math.min(w, h);
  const disp = "'Archivo Variable', Archivo, system-ui, sans-serif";
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const grad = (stops: string[], x0 = 0, y0 = 0, x1 = 0, y1 = h) => {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s, k) => gr.addColorStop(k / (stops.length - 1), s));
    return gr;
  };
  const card = (x: number, y: number, cw: number, ch: number, r: number, fill: string | CanvasGradient) => {
    g.beginPath();
    g.roundRect(x, y, cw, ch, r);
    g.fillStyle = fill;
    g.fill();
  };
  if (i === 0) {
    g.fillStyle = grad(['#15112b', '#0b0918']);
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff';
    g.font = `800 ${m * 0.09}px ${disp}`;
    g.fillText('Analytics', m * 0.08, m * 0.17);
    g.fillStyle = '#8f87c0';
    g.font = `500 ${m * 0.035}px ${ui}`;
    g.fillText('Visitors · last 30 days', m * 0.08, m * 0.23);
    card(m * 0.08, h * 0.32, w - m * 0.16, h * 0.56, m * 0.04, '#1e1838');
    g.beginPath();
    for (let k = 0; k <= 40; k++) {
      const x = m * 0.12 + (k / 40) * (w - m * 0.24);
      const y = h * 0.8 - (h * 0.36) * (0.25 + 0.5 * (k / 40) + 0.15 * Math.sin(k * 0.8) + 0.08 * Math.sin(k * 2.1));
      if (k) g.lineTo(x, y);
      else g.moveTo(x, y);
    }
    g.strokeStyle = '#a58bff';
    g.lineWidth = m * 0.012;
    g.lineJoin = 'round';
    g.stroke();
    g.lineTo(w - m * 0.12, h * 0.84);
    g.lineTo(m * 0.12, h * 0.84);
    g.fillStyle = grad(['rgba(124,92,255,0.45)', 'rgba(124,92,255,0)'], 0, h * 0.4, 0, h * 0.84);
    g.fill();
  } else if (i === 1) {
    g.fillStyle = grad(['#ff7a59', '#ff4f8b', '#6a2bd9'], 0, 0, w, h);
    g.fillRect(0, 0, w, h);
    const r = m * 0.24;
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.beginPath();
    g.arc(w / 2, h * 0.42 + m * 0.02, r, 0, Math.PI * 2);
    g.fill();
    card(w / 2 - r, h * 0.42 - r, r * 2, r * 2, m * 0.03, grad(['#1b1030', '#3a1a5a'], 0, h * 0.42 - r, 0, h * 0.42 + r));
    for (let k = 0; k < 6; k++) {
      g.strokeStyle = `rgba(255,140,190,${0.15 + k * 0.08})`;
      g.lineWidth = m * 0.006;
      g.beginPath();
      g.arc(w / 2, h * 0.42, r * (0.2 + k * 0.13), 0, Math.PI * 2);
      g.stroke();
    }
    g.textAlign = 'center';
    g.fillStyle = '#fff';
    g.font = `800 ${m * 0.07}px ${disp}`;
    g.fillText('Neon Nights', w / 2, h * 0.42 + r + m * 0.11);
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.font = `500 ${m * 0.035}px ${ui}`;
    g.fillText('The Midnight Club', w / 2, h * 0.42 + r + m * 0.165);
  } else {
    g.fillStyle = grad(['#4fb3ff', '#a7e3ff']);
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffe27a';
    g.beginPath();
    g.arc(w * 0.68, h * 0.3, m * 0.12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.92)';
    [
      [0.32, 0.36, 0.1],
      [0.42, 0.33, 0.13],
      [0.53, 0.37, 0.09],
    ].forEach(([x, y, r]) => {
      g.beginPath();
      g.arc(w * x, h * y, m * r, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = '#0b3a5c';
    g.font = `800 ${m * 0.22}px ${disp}`;
    g.fillText('24°', m * 0.08, h * 0.78);
    g.font = `600 ${m * 0.04}px ${ui}`;
    g.fillText('Lisbon · mostly sunny', m * 0.09, h * 0.86);
  }
  return c;
}

export default function PixelDissolve() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const ref = useRef<HTMLCanvasElement | null>(null);
  const dpr = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  // repaint the screens once the web fonts have arrived
  const [fonts, setFonts] = useState(0);
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => live && setFonts(1));
    return () => {
      live = false;
    };
  }, []);
  const screens = useMemo(() => (typeof document === 'undefined' ? [] : Array.from({ length: SCREENS }, (_, i) => paint(i, w, h, dpr))), [w, h, dpr, fonts]);

  useLayoutEffect(() => {
    const c = ref.current;
    if (!c || !screens.length) return;
    const g = c.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const A = screens[s.cur];
    const B = screens[(s.cur + 1) % SCREENS];
    g.drawImage(A, 0, 0, w, h);
    if (s.p < 0) return;
    const m = Math.min(w, h);
    const bs = Math.max(10, m / 16);
    const cols = Math.ceil(w / bs);
    const rows = Math.ceil(h / bs);
    const maxD = Math.hypot(Math.max(s.ox, w - s.ox), Math.max(s.oy, h - s.oy));
    const acc = ACCENT[(s.cur + 1) % SCREENS];
    const sp = 0.32; // how long one block's flip lasts, in progress units
    for (let r = 0; r < rows; r++)
      for (let q = 0; q < cols; q++) {
        const x = q * bs;
        const y = r * bs;
        const d = Math.hypot(x + bs / 2 - s.ox, y + bs / 2 - s.oy) / maxD;
        const delay = d * 0.55 + hash(r * 131 + q) * 0.13;
        const t = clamp((s.p - delay) / sp);
        if (t <= 0) continue;
        if (t >= 1) {
          // settled: draw a hair oversize so no seams show between blocks
          g.drawImage(B, x * dpr, y * dpr, (bs + 1) * dpr, (bs + 1) * dpr, x, y, bs + 1, bs + 1);
          continue;
        }
        g.fillStyle = '#05050a';
        g.fillRect(x, y, bs, bs);
        // first half: the old block shrinks away; second half: the new one grows in with overshoot
        const first = t < 0.5;
        const u = first ? t * 2 : (t - 0.5) * 2;
        const sc = first ? 1 - u * u : 1 + Math.sin(u * Math.PI) * 0.18 * (1 - u) - (1 - u) * (1 - u) * 0.9;
        const z = Math.max(0, sc) * bs;
        const cx = x + bs / 2;
        const cy = y + bs / 2;
        const sx = cx - z / 2;
        const sy = cy - z / 2;
        g.drawImage(first ? A : B, x * dpr, y * dpr, bs * dpr, bs * dpr, sx, sy, z, z);
        // the accent flash peaks as the block turns over
        const fl = 1 - Math.abs(t - 0.5) * 2;
        if (fl > 0) {
          g.globalAlpha = fl * 0.85;
          g.fillStyle = acc;
          g.fillRect(sx, sy, z, z);
          g.globalAlpha = fl * 0.6;
          g.fillStyle = '#fff';
          g.fillRect(sx, sy, z, Math.max(1, z * 0.12));
          g.globalAlpha = 1;
        }
      }
  }, [fx.t, s, w, h, dpr, screens]);

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#05050a' }}>
      <canvas ref={ref} width={Math.round(w * dpr)} height={Math.round(h * dpr)} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      <button
        type="button"
        aria-label="Next screen"
        style={{ position: 'absolute', inset: 0, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'next' });
          }
        }}
      />
    </Stage>
  );
}
