import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * A phosphor screen. The cursor lights up the pixels it crosses; each one flashes white-hot,
 * cools to its colour and fades slowly with a long afterglow, like an old CRT. Press for a fat
 * brush. Scanlines, bloom and a curved-glass vignette finish the look.
 */

interface S {
  cw: number;
  ch: number;
  cell: number;
  I: Float32Array; // intensity 0..1
  hue: Float32Array;
  lx: number;
  ly: number;
  idle: number;
  t: number;
  ticked: number;
}

export const sim = defineSim<S>({
  init(w, h) {
    const cell = Math.max(7, Math.min(w, h) / 34);
    const cw = Math.ceil(w / cell);
    const ch = Math.ceil(h / cell);
    return { cw, ch, cell, I: new Float32Array(cw * ch), hue: new Float32Array(cw * ch), lx: -1, ly: -1, idle: 2, t: 0, ticked: 0 };
  },
  step(s, f) {
    const { w, h, dt } = f;
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    let x = f.p.x;
    let y = f.p.y;
    let on = f.p.over;
    let big = f.p.down;
    if (s.idle > 2.5) {
      // self-demo: a looping lissajous signature
      const a = s.t * 1.5;
      x = w / 2 + Math.sin(a * 1.0) * w * 0.33;
      y = h / 2 + Math.sin(a * 2.0 + 0.6) * h * 0.28;
      on = true;
      big = Math.sin(s.t * 0.7) > 0.8;
    }
    if (f.pressed) f.emit({ name: 'buzz', gain: 0.3, rate: 1.2 });
    // phosphor decay: fast drop from white, then a long tail
    const k = f.reduced ? 3.5 : 1.6;
    for (let i = 0; i < s.I.length; i++) {
      const v = s.I[i];
      if (v > 0) s.I[i] = Math.max(0, v - dt * (v > 0.6 ? 2.6 : 0) - v * k * dt * 0.6 - dt * 0.012);
    }
    const hue = (s.t * 60) % 360;
    const stamp = (px: number, py: number) => {
      const cx = Math.floor(px / s.cell);
      const cy = Math.floor(py / s.cell);
      const r = big ? 1.6 : 0.6;
      const R = Math.ceil(r);
      for (let j = -R; j <= R; j++)
        for (let i = -R; i <= R; i++) {
          const gx = cx + i;
          const gy = cy + j;
          if (gx < 0 || gy < 0 || gx >= s.cw || gy >= s.ch) continue;
          const d = Math.hypot(i, j);
          if (d > r + 0.2) continue;
          const id = gy * s.cw + gx;
          const v = d < 0.5 ? 1 : 0.75;
          if (s.I[id] < v) {
            s.I[id] = v;
            s.hue[id] = hue;
          }
        }
    };
    if (on) {
      if (s.lx >= 0) {
        // fill every cell along the path so fast strokes stay continuous
        const d = Math.hypot(x - s.lx, y - s.ly);
        const n = Math.max(1, Math.ceil(d / (s.cell * 0.5)));
        for (let i = 1; i <= n; i++) stamp(s.lx + ((x - s.lx) * i) / n, s.ly + ((y - s.ly) * i) / n);
        s.ticked += d;
        if (s.ticked > Math.min(w, h) * 0.5) {
          s.ticked = 0;
          f.emit({ name: 'tick', gain: 0.12, rate: 1.6 + f.rand() * 0.4 });
        }
      } else stamp(x, y);
      s.lx = x;
      s.ly = y;
    } else s.lx = -1;
  },
});

export default function PixelTrail() {
  const fx = useFx(sim);
  const cv = useRef<HTMLCanvasElement>(null);
  const { w, h } = fx;
  useLayoutEffect(() => {
    const cn = cv.current;
    if (!cn) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cn.width !== Math.round(w * dpr)) cn.width = Math.round(w * dpr);
    if (cn.height !== Math.round(h * dpr)) cn.height = Math.round(h * dpr);
    const ctx = cn.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const s = fx.s;
    const c = s.cell;
    const gap = Math.max(1, c * 0.12);
    // unlit pixel grid: you can just see the shadow mask
    ctx.fillStyle = 'rgba(120,255,200,0.035)';
    for (let y = 0; y < s.ch; y++) for (let x = 0; x < s.cw; x++) ctx.fillRect(x * c + gap / 2, y * c + gap / 2, c - gap, c - gap);
    ctx.globalCompositeOperation = 'lighter';
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < s.ch; y++)
        for (let x = 0; x < s.cw; x++) {
          const i = y * s.cw + x;
          const v = s.I[i];
          if (v < 0.01) continue;
          const hue = s.hue[i];
          // hot pixels are near-white; cooling ones keep their colour, then dim to an ember
          const l = clamp(32 + v * 60, 20, 95);
          const sat = clamp(60 + (1 - v) * 40, 0, 100);
          if (pass === 0) {
            // bloom: a soft larger square underneath
            ctx.fillStyle = `hsla(${hue},${sat}%,${l * 0.8}%,${v * 0.22})`;
            ctx.fillRect(x * c - c * 0.6, y * c - c * 0.6, c * 2.2, c * 2.2);
          } else {
            ctx.fillStyle = `hsla(${hue},${sat}%,${l}%,${Math.pow(v, 0.7)})`;
            ctx.fillRect(x * c + gap / 2, y * c + gap / 2, c - gap, c - gap);
          }
        }
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [fx.t, w, h, fx.s]);
  const m = Math.min(w, h);
  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: 'radial-gradient(100% 90% at 50% 50%, #0d1a16 0%, #070d0b 70%, #020403 100%)' }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      {/* scanlines + curved glass: darker edges and a faint reflection */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: m * 0.05,
          boxShadow: `inset 0 0 ${m * 0.12}px ${m * 0.04}px rgba(0,0,0,0.85)`,
          background: 'radial-gradient(70% 50% at 30% 18%, rgba(255,255,255,0.06) 0%, transparent 60%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: m * 0.06,
          top: m * 0.05,
          fontFamily: "'JetBrains Mono Variable', monospace",
          fontSize: Math.max(10, m * 0.03),
          color: 'rgba(140,255,200,0.55)',
          textShadow: '0 0 8px rgba(120,255,190,0.6)',
          letterSpacing: '0.12em',
          pointerEvents: 'none',
        }}
      >
        PHOSPHOR · CH 03
      </div>
    </Stage>
  );
}
