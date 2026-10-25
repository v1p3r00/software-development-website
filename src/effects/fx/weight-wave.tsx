import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * Magnetic type. Each letter of a variable font gains weight as the pointer (the "magnet")
 * comes near, and leans toward it. The weights ride on springs, so a fast pass leaves a
 * wobbling wake of bold letters. Iron filings on the page line up with the field.
 * Press to switch the magnet to full power. Idle, the magnet sweeps over the words by itself.
 */

const LINES = ['MAGNETIC', 'TYPE'];
const ADV: Record<string, number> = { A: 0.66, B: 0.64, C: 0.66, D: 0.68, E: 0.58, F: 0.55, G: 0.69, H: 0.7, I: 0.3, J: 0.5, K: 0.65, L: 0.54, M: 0.84, N: 0.7, O: 0.72, P: 0.62, Q: 0.72, R: 0.64, S: 0.6, T: 0.6, U: 0.68, V: 0.66, W: 0.92, X: 0.64, Y: 0.64, Z: 0.6 };
const slot = (c: string) => (ADV[c] ?? 0.6) * 1.12 + 0.03;

interface Letter {
  ch: string;
  x: number;
  y: number;
  w: number; // slot width
}

function layout(w: number, h: number) {
  const em = Math.max(...LINES.map((l) => Array.from(l).reduce((a, c) => a + slot(c), 0)));
  const fs = Math.min((w * 0.88) / em, h * 0.3);
  const lh = fs * 0.98;
  const letters: Letter[] = [];
  LINES.forEach((line, li) => {
    const lw = Array.from(line).reduce((a, c) => a + slot(c) * fs, 0);
    let x = (w - lw) / 2;
    const y = h / 2 + (li - (LINES.length - 1) / 2) * lh;
    for (const ch of line) {
      const sw = slot(ch) * fs;
      letters.push({ ch, x: x + sw / 2, y, w: sw });
      x += sw;
    }
  });
  return { letters, fs, lh };
}

interface S {
  wt: Spring[]; // per-letter weight 0..1
  mx: Spring; // magnet position
  my: Spring;
  power: Spring;
  idle: number;
  t: number;
}

export const sim = defineSim<S>({
  init: (w, h) => ({ wt: layout(w, h).letters.map(() => sp()), mx: sp(-w * 0.2), my: sp(h / 2), power: sp(1), idle: 2, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    const { letters, fs } = layout(f.w, f.h);
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    const auto = s.idle > 2 || !f.p.over;
    // idle: the magnet sweeps back and forth over the words
    const tx = auto ? f.w * (0.5 + 0.48 * Math.sin(s.t * 0.75)) : f.p.x;
    const ty = auto ? f.h * (0.5 + 0.16 * Math.sin(s.t * 1.7)) : f.p.y;
    spring(s.mx, tx, 160, 20, f.dt);
    spring(s.my, ty, 160, 20, f.dt);
    if (f.pressed) f.emit({ name: 'buzz', gain: 0.3, rate: 0.8 });
    spring(s.power, f.p.down ? 1.9 : 1, 90, 10, f.dt);
    const R = fs * 1.15 * s.power.x;
    letters.forEach((l, i) => {
      const d = Math.hypot((l.x - s.mx.x) * 0.9, l.y - s.my.x);
      const target = Math.exp(-((d / R) ** 2));
      const before = s.wt[i].x;
      // under-damped: letters overshoot and ripple as the field sweeps past
      spring(s.wt[i], target, 140, f.reduced ? 26 : 8, f.dt);
      if (before < 0.75 && s.wt[i].x >= 0.75 && s.wt[i].v > 2) f.emit({ name: 'tick', gain: 0.12, rate: 0.7 + (l.x / f.w) * 0.6, pan: (l.x / f.w - 0.5) * 1.4 });
    });
  },
});

export default function WeightWave() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const { letters, fs } = layout(w, h);
  const cvs = useRef<HTMLCanvasElement>(null);
  const mx = s.mx.x;
  const my = s.my.x;
  const pw = s.power.x;

  // iron filings: short strokes aligned with the field around the magnet
  useLayoutEffect(() => {
    const c = cvs.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr)) c.width = Math.round(w * dpr);
    if (c.height !== Math.round(h * dpr)) c.height = Math.round(h * dpr);
    const g = c.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const step = Math.max(14, Math.min(w, h) * 0.038);
    const R = fs * 1.6 * pw;
    g.lineCap = 'round';
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        const dx = x - mx;
        const dy = y - my;
        const d = Math.hypot(dx, dy) + 1e-3;
        const near = Math.exp(-((d / (R * 1.4)) ** 2));
        // a dipole-ish field: radial near the pole, curling around further out
        const a = Math.atan2(dy, dx) + (1 - near) * 0.9 * Math.sign(dx || 1);
        const len = step * (0.18 + near * 0.32);
        g.strokeStyle = `rgba(${Math.round(lerp(120, 255, near))},${Math.round(lerp(130, 170, near))},${Math.round(lerp(170, 90, near))},${0.12 + near * 0.6})`;
        g.lineWidth = 1 + near * 1.2;
        g.beginPath();
        g.moveTo(x - Math.cos(a) * len, y - Math.sin(a) * len);
        g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        g.stroke();
      }
    }
  }, [fx.t, w, h, mx, my, fs, pw]);

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: 'radial-gradient(100% 90% at 50% 50%, #191b24 0%, #0e0f15 60%, #07080b 100%)' }}>
      <canvas ref={cvs} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      {/* the magnet's glow */}
      <div style={{ position: 'absolute', left: mx - fs * 1.2, top: my - fs * 1.2, width: fs * 2.4, height: fs * 2.4, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(255,150,80,${0.16 * pw}), rgba(255,90,60,0) 100%)` }} />
      {letters.map((l, i) => {
        const v = clamp(s.wt[i].x, -0.1, 1.15);
        const wght = clamp(100 + v * 800, 100, 900);
        // lean toward the magnet in proportion to the pull
        const dx = mx - l.x;
        const dy = my - l.y;
        const d = Math.hypot(dx, dy) + 1;
        const pull = clamp(v) * fs * 0.06;
        const heat = clamp(v);
        return (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              left: l.x - l.w / 2,
              top: l.y - fs * 0.62,
              width: l.w,
              textAlign: 'center',
              fontFamily: "'Archivo Variable', Archivo, system-ui",
              fontSize: fs,
              lineHeight: 1.2,
              fontWeight: Math.round(wght),
              fontVariationSettings: `'wght' ${wght.toFixed(1)}`,
              color: `rgb(${Math.round(lerp(150, 255, heat))},${Math.round(lerp(158, 196, heat))},${Math.round(lerp(190, 150, heat))})`,
              textShadow: `0 0 ${fs * 0.12 * heat}px rgba(255,140,70,${0.45 * heat})`,
              transform: `translate(${((dx / d) * pull).toFixed(2)}px, ${((dy / d) * pull).toFixed(2)}px) scale(${(1 + heat * 0.04).toFixed(3)})`,
            }}
          >
            {l.ch}
          </span>
        );
      })}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{LINES.join(' ')}</span>
    </Stage>
  );
}
