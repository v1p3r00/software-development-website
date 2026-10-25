import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Northern lights over a still lake. Three luminous curtains hang from a wavy base line; each
 * base line is a chain of springs, so the curtains bend toward the cursor and sway back with
 * a soft, delayed overshoot. Fine vertical rays drift along the folds. Left alone, an invisible
 * breeze wanders across the sky and does the bending.
 */

const K = 18; // control points per curtain

interface Curtain {
  pts: Spring[]; // vertical offset of each base-line point, px
  base: number; // base height, 0..1 of the sky
  phase: number;
  hue: number; // 0 green, 1 teal
  tall: number;
}

interface S {
  c: Curtain[];
  ax: number; // the attractor (cursor or idle breeze)
  ay: number;
  pull: number; // 0..1 strength of the bend
  idle: number; // seconds since the last pointer activity
  surge: Spring; // a brightening pulse on press
  stars: { x: number; y: number; r: number; tw: number }[];
  t: number;
}

const skyH = (h: number) => h * 0.74; // horizon line

export const sim = defineSim<S>({
  init(w, h, rand) {
    const c: Curtain[] = [0, 1, 2].map((i) => ({
      pts: Array.from({ length: K }, () => sp()),
      base: 0.5 + i * 0.13,
      phase: rand() * 10,
      hue: i === 1 ? 1 : 0,
      tall: 0.6 - i * 0.07,
    }));
    const stars = Array.from({ length: 160 }, () => ({ x: rand(), y: Math.pow(rand(), 1.4), r: 0.3 + rand() * rand() * 1.4, tw: rand() * 6.28 }));
    return { c, ax: w * 0.5, ay: h * 0.3, pull: 0, idle: 9, surge: sp(), stars, t: 0 };
  },
  step(s, f) {
    const { w, h, dt, p } = f;
    s.t += dt;
    const active = p.over && (Math.abs(p.vx) + Math.abs(p.vy) > 4 || p.down);
    s.idle = active ? 0 : s.idle + dt;
    // the idle breeze: a slow figure-eight across the sky
    const bx = w * (0.5 + 0.38 * Math.sin(s.t * 0.21));
    const by = skyH(h) * (0.32 + 0.16 * Math.sin(s.t * 0.37 + 1));
    const useP = p.over && s.idle < 2.5;
    s.ax = approach(s.ax, useP ? p.x : bx, useP ? 6 : 1.2, dt);
    s.ay = approach(s.ay, useP ? p.y : by, useP ? 6 : 1.2, dt);
    s.pull = approach(s.pull, useP ? 1 : 0.55, 2, dt);
    if (f.pressed) {
      s.surge.v += f.reduced ? 2 : 6;
      f.emit({ name: 'whoosh', gain: 0.25, rate: 0.7, pan: (p.x / w) * 2 - 1 });
    }
    spring(s.surge, 0, 18, 3.2, dt);
    const sh = skyH(h);
    const reach = w * 0.22;
    for (const cu of s.c) {
      for (let i = 0; i < K; i++) {
        const x = (i / (K - 1)) * w * 1.2 - w * 0.1;
        const y0 = cu.base * sh;
        const fall = Math.exp(-((x - s.ax) ** 2) / (2 * reach * reach));
        // pull the base toward the attractor's height, capped so curtains never leave the sky
        const target = clamp((s.ay - y0) * 0.5, -sh * 0.2, sh * 0.2) * fall * s.pull;
        // soft springs: a lazy, liquid sway with a little overshoot
        spring(cu.pts[i], target, 7, 2.6, dt);
      }
    }
  },
});

// a 1px-wide vertical sprite: bright lower edge, green body, violet fringe on top
function sprite(hue: number) {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 128;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 128, 0, 0);
  if (hue === 0) {
    gr.addColorStop(0, 'rgba(60,255,160,0)');
    gr.addColorStop(0.2, 'rgba(60,255,160,0.16)');
    gr.addColorStop(0.25, 'rgba(190,255,220,0.95)');
    gr.addColorStop(0.36, 'rgba(60,255,150,0.75)');
    gr.addColorStop(0.5, 'rgba(30,200,140,0.3)');
    gr.addColorStop(0.8, 'rgba(150,60,220,0.16)');
    gr.addColorStop(1, 'rgba(150,60,220,0)');
  } else {
    gr.addColorStop(0, 'rgba(60,200,255,0)');
    gr.addColorStop(0.2, 'rgba(60,200,255,0.14)');
    gr.addColorStop(0.25, 'rgba(180,250,255,0.85)');
    gr.addColorStop(0.4, 'rgba(40,210,230,0.6)');
    gr.addColorStop(0.6, 'rgba(60,110,255,0.22)');
    gr.addColorStop(1, 'rgba(220,60,200,0)');
  }
  g.fillStyle = gr;
  g.fillRect(0, 0, 1, 128);
  return c;
}

// Catmull-Rom through the spring chain
function sample(pts: Spring[], u: number) {
  const f = clamp(u) * (K - 1);
  const i = Math.min(K - 2, Math.floor(f));
  const t = f - i;
  const p0 = pts[Math.max(0, i - 1)].x, p1 = pts[i].x, p2 = pts[i + 1].x, p3 = pts[Math.min(K - 1, i + 2)].x;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
}

export default function Aurora() {
  const fx = useFx(sim);
  const ref = useRef<HTMLCanvasElement>(null);
  const cache = useRef<{ spr: HTMLCanvasElement[]; low: HTMLCanvasElement } | null>(null);
  const { s, w, h } = fx;

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    if (!cache.current) cache.current = { spr: [sprite(0), sprite(1)], low: document.createElement('canvas') };
    const { spr, low } = cache.current;
    const g = cv.getContext('2d')!;
    const t = s.t;
    const sh = skyH(h);

    // the aurora is painted at 1/4 resolution and scaled up: free, natural softness
    const LS = 4;
    const lw = Math.ceil(w / LS), lh = Math.ceil(sh / LS);
    if (low.width !== lw || low.height !== lh) {
      low.width = lw;
      low.height = lh;
    }
    const l = low.getContext('2d')!;
    l.globalCompositeOperation = 'source-over';
    l.clearRect(0, 0, lw, lh);
    l.globalCompositeOperation = 'lighter';
    const glow = 1 + Math.max(0, s.surge.x) * 0.35;
    for (const cu of s.c) {
      for (let x = 0; x < lw; x++) {
        const X = x * LS;
        const u = (X + w * 0.1) / (w * 1.2);
        // the fold: slow travelling waves along the curtain
        const fold = Math.sin(u * 7 + t * 0.35 + cu.phase) * sh * 0.06 + Math.sin(u * 17 - t * 0.6 + cu.phase * 2) * sh * 0.018;
        const base = cu.base * sh + fold + sample(cu.pts, u);
        // rays: fine, drifting brightness stripes
        const ray = 0.55 + 0.3 * Math.sin(u * 90 + t * 1.3 + cu.phase) * Math.sin(u * 37 - t * 0.8) + 0.25 * Math.sin(u * 5 - t * 0.25 + cu.phase);
        const fade = 0.25 + 0.75 * Math.sin(clamp(u) * Math.PI); // dimmer toward the ends
        const a = clamp(ray * fade * 0.85 * glow, 0, 1);
        if (a < 0.02) continue;
        const ht = sh * cu.tall * (0.75 + 0.35 * Math.sin(u * 11 + t * 0.5 + cu.phase));
        l.globalAlpha = a;
        // the sprite's lower quarter is a faint glow that hangs below the bright edge
        l.drawImage(spr[cu.hue], 0, 0, 1, 128, x, (base - ht) / LS, 1.4, (ht * 4) / 3 / LS);
      }
    }
    l.globalAlpha = 1;

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // sky
    const sky = g.createLinearGradient(0, 0, 0, sh);
    sky.addColorStop(0, '#02040c');
    sky.addColorStop(0.6, '#061428');
    sky.addColorStop(1, '#0b2a3a');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, sh + 1);
    for (const st of s.stars) {
      const tw = 0.55 + 0.45 * Math.sin(t * 1.7 + st.tw * 3);
      g.globalAlpha = tw * 0.8;
      g.fillStyle = '#dfefff';
      g.beginPath();
      g.arc(st.x * w, st.y * sh * 0.95, st.r, 0, 6.283);
      g.fill();
    }
    g.globalAlpha = 1;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.globalCompositeOperation = 'lighter';
    g.drawImage(low, 0, 0, lw, lh, 0, 0, lw * LS, lh * LS);
    // a wide, faint second pass: the glow the aurora casts into the air
    g.globalAlpha = 0.35;
    g.drawImage(low, 0, 0, lw, lh, -w * 0.02, -sh * 0.02, lw * LS * 1.04, lh * LS * 1.04);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';

    // lake: the sky mirrored, darker and rippled
    const lake = g.createLinearGradient(0, sh, 0, h);
    lake.addColorStop(0, '#071a24');
    lake.addColorStop(1, '#010306');
    g.fillStyle = lake;
    g.fillRect(0, sh, w, h - sh);
    g.save();
    g.globalCompositeOperation = 'lighter';
    const rows = Math.ceil((h - sh) / 3);
    for (let r = 0; r < rows; r++) {
      const y = sh + r * 3;
      const d = (y - sh) / (h - sh);
      const srcY = sh - (y - sh) * 1.25; // the reflection is squashed toward the horizon
      if (srcY < 0) break;
      const off = Math.sin(r * 0.9 + t * 1.6) * (1 + d * 6);
      g.globalAlpha = 0.7 * (1 - 0.7 * d);
      g.drawImage(low, 0, srcY / LS, lw, 3 / LS, off, y, w, 3);
    }
    g.restore();

    // mountains: two ridge layers, the far one lit faintly by the aurora
    const ridge = (amp: number, yb: number, seed: number, col: string) => {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, sh + 1);
      for (let x = 0; x <= w; x += 6) {
        const u = x / w;
        const y = yb - amp * (0.5 * Math.abs(Math.sin(u * 3.1 + seed)) + 0.3 * Math.abs(Math.sin(u * 7.3 + seed * 2)) + 0.12 * Math.sin(u * 23 + seed));
        g.lineTo(x, y);
      }
      g.lineTo(w, sh + 1);
      g.closePath();
      g.fill();
    };
    const m = Math.min(w, h);
    ridge(m * 0.12, sh + 1, 1.3, '#0a1a24');
    ridge(m * 0.06, sh + 1, 4.1, '#03080d');
    g.fillStyle = 'rgba(160,255,220,0.12)';
    g.fillRect(0, sh, w, 1);

    // vignette
    const v = g.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.3, w / 2, h * 0.45, Math.max(w, h) * 0.8);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.6)');
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
  }, [fx.t, w, h, s]);

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: '#02040c' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-label="Aurora that bends toward the cursor" role="img" />
    </Stage>
  );
}
