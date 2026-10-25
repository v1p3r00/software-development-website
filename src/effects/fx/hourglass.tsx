import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A real sand hourglass. The sand is a falling-sand automaton: every grain drops if it can,
 * otherwise slides diagonally, so it funnels through the neck in a thin stream and builds a
 * cone at the angle of repose. When the top runs dry the glass flips on a spring (or click to
 * flip it any time) — the grid is turned over and the pour starts again.
 */

const HZ = 110;

interface S {
  gc: number;
  gr: number;
  cell: number;
  inside: Uint8Array;
  g: Uint8Array; // 0 empty, 1..4 grain colour
  rot: Spring; // visual rotation (rad), springs to 0 after a flip
  acc: number;
  emptyFor: number;
  t: number;
  idle: number;
  rustle: number;
  tilt: Spring;
  turning: boolean;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const H = Math.min(h * 0.78, m * 0.95);
  const W = H * 0.56;
  return { m, cx: w / 2, cy: h / 2, H, W };
}

/** half-width of the glass at height y (-1 top .. 1 bottom), 0..1 of the max */
function profile(y: number) {
  const a = Math.abs(y);
  const neck = 0.05;
  const bulb = Math.pow(Math.sin(clamp(a * 1.25) * (Math.PI / 2)), 1.5);
  const cap = Math.sqrt(Math.max(0, 1 - Math.pow(a, 10)));
  return (neck + (1 - neck) * bulb) * cap;
}

export const sim = defineSim<S>({
  init(w, h, rand) {
    const { H, W } = geom(w, h);
    const cell = Math.max(2.5, H / 130);
    const gr = Math.floor(H / cell);
    const gc = Math.floor(W / cell) | 1;
    const inside = new Uint8Array(gc * gr);
    const g = new Uint8Array(gc * gr);
    for (let r = 0; r < gr; r++) {
      const y = ((r + 0.5) / gr) * 2 - 1;
      const hw = profile(y) * (gc / 2) * 0.92;
      for (let c = 0; c < gc; c++) {
        const x = c + 0.5 - gc / 2;
        if (Math.abs(x) <= Math.max(1.1, hw)) inside[r * gc + c] = 1;
      }
    }
    // fill most of the top bulb
    for (let r = Math.floor(gr * 0.08); r < Math.floor(gr * 0.42); r++)
      for (let c = 0; c < gc; c++) if (inside[r * gc + c]) g[r * gc + c] = 1 + Math.floor(rand() * 4);
    return { gc, gr, cell, inside, g, rot: sp(0), acc: 0, emptyFor: 0, t: 0, idle: 0, rustle: 0, tilt: sp(0), turning: false };
  },
  step(s, f) {
    const { dt } = f;
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    const flip = () => {
      // turn the world over: reversing the grid is a 180° rotation
      s.g.reverse();
      s.rot.x -= Math.PI;
      s.emptyFor = 0;
      f.emit({ name: 'whoosh', gain: 0.5, rate: 0.9 });
    };
    const settled = Math.abs(s.rot.x) < 0.12;
    if (f.pressed && settled) flip();
    spring(s.rot, 0, 38, f.reduced ? 14 : 6.5, dt);
    spring(s.tilt, f.p.over ? clamp((f.p.x / f.w - 0.5) * 2, -1, 1) * 0.06 : 0, 40, 8, dt);
    if (Math.abs(s.rot.x) > 0.25) {
      s.turning = true;
      return; // sand holds still while the glass turns
    }
    if (s.turning) {
      s.turning = false;
      f.emit({ name: 'thud', gain: 0.35, rate: 1.3 });
    }
    s.acc += dt;
    const { gc, gr, g, inside } = s;
    let moved = 0;
    while (s.acc >= 1 / HZ) {
      s.acc -= 1 / HZ;
      for (let r = gr - 2; r >= 0; r--) {
        const ltr = (r + Math.floor(s.t * HZ)) % 2 === 0;
        for (let k = 0; k < gc; k++) {
          const c = ltr ? k : gc - 1 - k;
          const i = r * gc + c;
          const v = g[i];
          if (!v) continue;
          const b = i + gc;
          if (inside[b] && !g[b]) {
            g[b] = v;
            g[i] = 0;
            moved++;
            continue;
          }
          // slide down a slope: pick a side at random, try the other if blocked
          const first = f.rand() < 0.5 ? -1 : 1;
          for (const d of [first, -first]) {
            const cc = c + d;
            if (cc < 0 || cc >= gc) continue;
            const j = b + d;
            if (inside[j] && !g[j] && !g[i + d]) {
              g[j] = v;
              g[i] = 0;
              moved++;
              break;
            }
          }
        }
      }
    }
    // count what is left above the neck
    let top = 0;
    const half = Math.floor(gr / 2) - 1;
    for (let i = 0; i < half * gc; i++) if (g[i]) top++;
    s.rustle += dt;
    if (moved > 0 && s.rustle > 0.6) {
      s.rustle = 0;
      f.emit({ name: 'rustle', gain: 0.12, rate: 1.2 + f.rand() * 0.3 });
    }
    if (top === 0 && moved === 0) {
      s.emptyFor += dt;
      if (s.emptyFor > 0.9) flip();
    }
  },
});

const SAND = ['', '#f1c27a', '#e6ad5c', '#f7d396', '#d9984a'];

export default function Hourglass() {
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
    const { cx, cy, H, W, m } = geom(w, h);
    const { gc, gr, cell } = s;
    // table shadow
    const sh = ctx.createRadialGradient(cx, cy + H * 0.56, 0, cx, cy + H * 0.56, W * 0.8);
    sh.addColorStop(0, 'rgba(0,0,0,0.5)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.save();
    ctx.translate(cx, cy + H * 0.56);
    ctx.scale(1, 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, W * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(s.rot.x + s.tilt.x);
    // glass outline
    const gw = gc * cell;
    const gh = gr * cell;
    const outline = new Path2D();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const y = (i / steps) * 2 - 1;
      const x = profile(y) * (gw / 2) + m * 0.008;
      if (i === 0) outline.moveTo(x, y * (gh / 2));
      else outline.lineTo(x, y * (gh / 2));
    }
    for (let i = steps; i >= 0; i--) {
      const y = (i / steps) * 2 - 1;
      outline.lineTo(-profile(y) * (gw / 2) - m * 0.008, y * (gh / 2));
    }
    outline.closePath();
    ctx.fillStyle = 'rgba(200,225,255,0.06)';
    ctx.fill(outline);
    // sand
    const ox = -gw / 2;
    const oy = -gh / 2;
    for (let col = 1; col <= 4; col++) {
      ctx.fillStyle = SAND[col];
      ctx.beginPath();
      for (let r = 0; r < gr; r++)
        for (let c = 0; c < gc; c++) if (s.g[r * gc + c] === col) ctx.rect(ox + c * cell, oy + r * cell, cell * 1.02, cell * 1.02);
      ctx.fill();
    }
    // glass: rim light on the edges and a long vertical reflection
    ctx.strokeStyle = 'rgba(220,235,255,0.45)';
    ctx.lineWidth = Math.max(1, m * 0.004);
    ctx.stroke(outline);
    ctx.save();
    ctx.clip(outline);
    const refl = ctx.createLinearGradient(-gw / 2, 0, gw / 2, 0);
    refl.addColorStop(0, 'rgba(255,255,255,0.18)');
    refl.addColorStop(0.18, 'rgba(255,255,255,0.03)');
    refl.addColorStop(0.75, 'rgba(255,255,255,0)');
    refl.addColorStop(0.9, 'rgba(255,255,255,0.1)');
    refl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = refl;
    ctx.fillRect(-gw, -gh, gw * 2, gh * 2);
    ctx.restore();
    // wooden caps and posts
    const capW = gw * 1.25;
    const capH = m * 0.04;
    const wood = ctx.createLinearGradient(0, -capH, 0, capH);
    wood.addColorStop(0, '#9a5b34');
    wood.addColorStop(0.5, '#6e3b1f');
    wood.addColorStop(1, '#4a2612');
    for (const sgn of [-1, 1]) {
      ctx.save();
      ctx.translate(0, sgn * (gh / 2 + capH / 2));
      ctx.fillStyle = wood;
      ctx.beginPath();
      ctx.roundRect(-capW / 2, -capH / 2, capW, capH, capH * 0.35);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,220,180,0.18)';
      ctx.fillRect(-capW / 2 + capH * 0.3, -capH / 2 + 1, capW - capH * 0.6, capH * 0.18);
      ctx.restore();
    }
    for (const sx of [-1, 1]) {
      const px = sx * (capW / 2 - m * 0.022);
      const post = ctx.createLinearGradient(px - m * 0.01, 0, px + m * 0.01, 0);
      post.addColorStop(0, '#5a2f17');
      post.addColorStop(0.4, '#a8683d');
      post.addColorStop(1, '#4a2612');
      ctx.fillStyle = post;
      ctx.fillRect(px - m * 0.009, -gh / 2, m * 0.018, gh);
    }
    ctx.restore();
  }, [fx.t, w, h, fx.s]);
  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(90% 80% at 50% 35%, #2a2238 0%, #15111e 60%, #0a080f 100%)' }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      <button type="button" aria-label="Flip the hourglass" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
    </Stage>
  );
}
