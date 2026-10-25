import { useLayoutEffect, useRef } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A liquid glass lens. Real per-pixel refraction: the flat middle magnifies, the rounded rim
 * bends the picture sharply, colours split at the edge (chromatic aberration) and a specular
 * rim catches the light. The lens follows the pointer on a spring and stretches like a drop
 * when it moves fast; press to make it swell.
 */

interface S {
  x: Spring;
  y: Spring;
  sx: Spring; // stretch along x / y
  sy: Spring;
  grow: Spring;
  idle: number;
  t: number;
  swish: number;
}

export const sim = defineSim<S>({
  init: (w, h) => ({ x: sp(w * 0.5), y: sp(h * 0.55), sx: sp(1), sy: sp(1), grow: sp(0), idle: 0, t: 0, swish: 0 }),
  step(s, f) {
    s.t += f.dt;
    let tx = f.p.x;
    let ty = f.p.y;
    if (f.p.over && (Math.abs(f.p.vx) + Math.abs(f.p.vy) > 4 || f.p.down)) s.idle = 0;
    else s.idle += f.dt;
    if ((f.live && s.idle > 1.6) || (!f.p.over && f.live)) {
      // drifting on its own in a slow lissajous
      const k = s.t * 0.55;
      tx = f.w * (0.5 + Math.sin(k) * 0.3);
      ty = f.h * (0.5 + Math.sin(k * 1.7 + 1) * 0.22);
    }
    if (f.pressed) f.emit({ name: 'glass', gain: 0.45, rate: 1.1 });
    if (f.released) f.emit({ name: 'glass', gain: 0.3, rate: 0.85 });
    spring(s.x, tx, 90, 13, f.dt);
    spring(s.y, ty, 90, 13, f.dt);
    // stretch along the motion, keep the area
    const vx = s.x.v / Math.max(f.w, 1);
    const vy = s.y.v / Math.max(f.h, 1);
    const ax = clamp(Math.abs(vx) * 0.25, 0, 0.35) - clamp(Math.abs(vy) * 0.15, 0, 0.2);
    spring(s.sx, 1 + ax, 260, 9, f.dt);
    spring(s.sy, 1 / (1 + ax), 260, 9, f.dt);
    spring(s.grow, f.p.down ? 1 : 0, 220, 12, f.dt);
    // a soft swish when the glass moves fast
    const speed = Math.hypot(s.x.v, s.y.v) / Math.min(f.w, f.h);
    s.swish -= f.dt;
    if (speed > 1.6 && s.swish <= 0) {
      s.swish = 0.45;
      f.emit({ name: 'swoosh', gain: clamp(speed / 5, 0.25, 0.7), rate: 0.9 + clamp(speed / 10, 0, 0.4), pan: (s.x.x / f.w - 0.5) * 0.8 });
    }
  },
});

/** the scene behind the glass, drawn once per size */
function paintScene(c: HTMLCanvasElement, w: number, h: number) {
  const g = c.getContext('2d')!;
  const m = Math.min(w, h);
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#120f2a');
  bg.addColorStop(1, '#05060f');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // thin grid
  g.strokeStyle = 'rgba(255,255,255,.07)';
  g.lineWidth = Math.max(1, m * 0.002);
  const step = m * 0.06;
  for (let x = 0; x < w; x += step) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke();
  }
  for (let y = 0; y < h; y += step) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
  const orb = (x: number, y: number, r: number, c0: string, c1: string) => {
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    gr.addColorStop(0, c0);
    gr.addColorStop(1, c1);
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  };
  orb(w * 0.18, h * 0.24, m * 0.17, '#ffb38a', '#ff4d1f');
  orb(w * 0.86, h * 0.2, m * 0.12, '#b8f5ff', '#2f7bff');
  orb(w * 0.78, h * 0.8, m * 0.2, '#ffc6ec', '#d4147a');
  orb(w * 0.12, h * 0.86, m * 0.1, '#e6ffb3', '#3fbf3f');
  // stripes band
  g.save();
  g.translate(w * 0.5, h * 0.5);
  g.rotate(-0.25);
  for (let i = -30; i < 30; i++) {
    g.fillStyle = i % 2 ? 'rgba(255,214,90,.9)' : 'rgba(255,214,90,0)';
    g.fillRect(i * m * 0.03, -m * 0.04 + m * 0.36, m * 0.015, m * 0.08);
  }
  g.restore();
  // type
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const fs = Math.min(w * 0.19, h * 0.24);
  g.font = `800 ${fs}px "Archivo Variable", Archivo, system-ui, sans-serif`;
  g.fillText('LIQUID', w * 0.5, h * 0.4);
  g.font = `300 italic ${fs * 0.86}px "Archivo Variable", Archivo, system-ui, sans-serif`;
  g.fillStyle = 'rgba(255,255,255,.92)';
  g.fillText('glass', w * 0.5, h * 0.4 + fs * 0.88);
  g.font = `500 ${Math.max(10, m * 0.026)}px "JetBrains Mono Variable", ui-monospace, monospace`;
  g.fillStyle = 'rgba(255,255,255,.6)';
  g.fillText('REFRACTION · DISPERSION · SPECULAR RIM', w * 0.5, h * 0.4 - fs * 0.72);
}

export default function LiquidGlass() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const canvas = useRef<HTMLCanvasElement>(null);
  const cache = useRef<{ key: string; scene: HTMLCanvasElement; data: Uint8ClampedArray; W: number; H: number } | null>(null);

  useLayoutEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const sc = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5);
    const W = Math.max(1, Math.round(w * sc));
    const H = Math.max(1, Math.round(h * sc));
    const key = `${W}x${H}`;
    if (!cache.current || cache.current.key !== key) {
      const scene = document.createElement('canvas');
      scene.width = W;
      scene.height = H;
      paintScene(scene, W, H);
      const data = scene.getContext('2d')!.getImageData(0, 0, W, H).data;
      cache.current = { key, scene, data, W, H };
      cv.width = W;
      cv.height = H;
    }
    const { scene, data } = cache.current;
    const g = cv.getContext('2d')!;
    g.drawImage(scene, 0, 0);

    // ── the lens
    const m = Math.min(W, H);
    const grow = 1 + s.grow.x * 0.18;
    const a = m * 0.26 * s.sx.x * grow; // half width
    const b = m * 0.16 * s.sy.x * grow; // half height
    const r = Math.min(a, b) * 0.98; // corner radius: a capsule
    const cx = s.x.x * sc;
    const cy = s.y.x * sc;
    const bevel = Math.min(a, b) * 0.55;

    // soft shadow under the glass
    g.save();
    g.shadowColor = 'rgba(0,0,0,.55)';
    g.shadowBlur = m * 0.06;
    g.shadowOffsetY = m * 0.025;
    g.fillStyle = 'rgba(0,0,0,.4)';
    g.beginPath();
    g.roundRect(cx - a, cy - b, a * 2, b * 2, r);
    g.fill();
    g.restore();

    const x0 = Math.max(0, Math.floor(cx - a - 2));
    const y0 = Math.max(0, Math.floor(cy - b - 2));
    const x1 = Math.min(W, Math.ceil(cx + a + 2));
    const y1 = Math.min(H, Math.ceil(cy + b + 2));
    const bw = x1 - x0;
    const bh = y1 - y0;
    if (bw <= 0 || bh <= 0) return;
    const out = g.getImageData(x0, y0, bw, bh);
    const o = out.data;
    const zoom = 1.18 + s.grow.x * 0.12;
    const strength = bevel * 0.9;
    const qa = a - r;
    const qb = b - r;
    const sample = (x: number, y: number, ch: number) => {
      x = x < 0 ? 0 : x > W - 1.001 ? W - 1.001 : x;
      y = y < 0 ? 0 : y > H - 1.001 ? H - 1.001 : y;
      const ix = x | 0;
      const iy = y | 0;
      const fx2 = x - ix;
      const fy = y - iy;
      const i00 = (iy * W + ix) * 4 + ch;
      const v00 = data[i00];
      const v10 = data[i00 + 4];
      const v01 = data[i00 + W * 4];
      const v11 = data[i00 + W * 4 + 4];
      return (v00 * (1 - fx2) + v10 * fx2) * (1 - fy) + (v01 * (1 - fx2) + v11 * fx2) * fy;
    };
    const Lx = -0.6;
    const Ly = -0.8;
    for (let py = 0; py < bh; py++) {
      for (let px = 0; px < bw; px++) {
        const X = x0 + px + 0.5 - cx;
        const Y = y0 + py + 0.5 - cy;
        // rounded-box signed distance and its outward normal
        const qx = Math.abs(X) - qa;
        const qy = Math.abs(Y) - qb;
        const mx = Math.max(qx, 0);
        const my = Math.max(qy, 0);
        const outer = Math.hypot(mx, my);
        const d = outer + Math.min(Math.max(qx, qy), 0) - r;
        if (d > 0.5) continue;
        let nx: number, ny: number;
        if (outer > 0) {
          nx = (mx / outer) * Math.sign(X);
          ny = (my / outer) * Math.sign(Y);
        } else if (qx > qy) {
          nx = Math.sign(X);
          ny = 0;
        } else {
          nx = 0;
          ny = Math.sign(Y);
        }
        const inside = -d; // distance from the rim, px
        const e = 1 - Math.min(inside / bevel, 1); // 1 at the rim, 0 on the flat
        // slope of a circular bevel: steep at the rim
        const slope = e > 0 ? e / Math.sqrt(Math.max(1e-3, 1 - e * e * 0.96)) : 0;
        const off = slope * strength;
        const i = (py * bw + px) * 4;
        const bxs = cx + X / zoom;
        const bys = cy + Y / zoom;
        for (let ch = 0; ch < 3; ch++) {
          const k = 1 + ch * 0.07; // dispersion: blue bends most
          o[i + ch] = sample(bxs - nx * off * k, bys - ny * off * k, ch);
        }
        // tint, rim light and a soft inner shade at the bottom
        const facing = Math.max(0, -(nx * Lx + ny * Ly));
        const rim = Math.pow(e, 6) * (0.35 + facing * 1.4);
        const back = Math.pow(e, 3) * Math.max(0, nx * Lx + ny * Ly) * 0.25;
        const lift = 10;
        for (let ch = 0; ch < 3; ch++) o[i + ch] = Math.min(255, o[i + ch] * (1 - back) + lift + rim * 255);
        // anti-aliased edge
        o[i + 3] = d > -0.5 ? Math.round(255 * (0.5 - d)) : 255;
      }
    }
    // composite the lens over the scene (alpha-aware)
    const tmp = cache.current as unknown as { lens?: HTMLCanvasElement };
    const lens = tmp.lens ?? (tmp.lens = document.createElement('canvas'));
    lens.width = bw;
    lens.height = bh;
    lens.getContext('2d')!.putImageData(out, 0, 0);
    g.drawImage(lens, x0, y0);
    // a broad soft highlight on the top of the glass
    const hl = g.createLinearGradient(0, cy - b, 0, cy);
    hl.addColorStop(0, 'rgba(255,255,255,.22)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.save();
    g.beginPath();
    g.roundRect(cx - a + bevel * 0.35, cy - b + bevel * 0.12, (a - bevel * 0.35) * 2, b * 0.8, r);
    g.clip();
    g.fillStyle = hl;
    g.fillRect(cx - a, cy - b, a * 2, b);
    g.restore();
  });

  return (
    <Stage fx={fx} cursor="none" style={{ background: '#05060f' }}>
      <canvas ref={canvas} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-label="A glass lens refracting the text behind it" role="img" />
    </Stage>
  );
}
