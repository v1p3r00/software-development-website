import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * A word made of glass. Click it and it shatters from the point you hit: shards nearest the
 * impact fly hardest, every piece tumbles in 3D (catching the light as it turns) and drifts
 * down. A moment later they are pulled back, each on its own spring, and snap into place one
 * by one until the word is whole again. Idle, it gets struck by itself.
 */

const WORD = 'SHATTER';

interface Shard {
  hx: number; // home centroid
  hy: number;
  v: number[]; // triangle vertices relative to the centroid
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number; // in-plane rotation
  va: number;
  phi: number; // tumble (fake 3D tilt around an in-plane axis)
  vphi: number;
  axis: number;
  delay: number;
  home: boolean;
}

interface S {
  shards: Shard[];
  mode: 'whole' | 'fly' | 'back';
  modeT: number;
  idle: number;
  snaps: number;
  t: number;
}

function box(w: number, h: number) {
  const fs = Math.min((w * 0.88) / (WORD.length * 0.7), h * 0.3);
  const bw = Math.min(w * 0.94, fs * WORD.length * 0.72);
  const bh = fs * 1.05;
  return { fs, bw, bh, x0: (w - bw) / 2, y0: h / 2 - bh / 2 };
}

export const sim = defineSim<S>({
  init(w, h, rand) {
    const { bw, bh, x0, y0, fs } = box(w, h);
    // a jittered grid split into triangles: irregular shards that tile the word exactly
    const cell = fs * 0.24;
    const nx = Math.max(4, Math.round(bw / cell));
    const ny = Math.max(3, Math.round(bh / cell));
    const P: number[][] = [];
    for (let j = 0; j <= ny; j++)
      for (let i = 0; i <= nx; i++) {
        const jx = i > 0 && i < nx ? (rand() - 0.5) * 0.8 : 0;
        const jy = j > 0 && j < ny ? (rand() - 0.5) * 0.8 : 0;
        P.push([x0 + ((i + jx) / nx) * bw, y0 + ((j + jy) / ny) * bh]);
      }
    const shards: Shard[] = [];
    const add = (a: number[], b: number[], c: number[]) => {
      const hx = (a[0] + b[0] + c[0]) / 3;
      const hy = (a[1] + b[1] + c[1]) / 3;
      shards.push({ hx, hy, v: [a[0] - hx, a[1] - hy, b[0] - hx, b[1] - hy, c[0] - hx, c[1] - hy], x: hx, y: hy, vx: 0, vy: 0, a: 0, va: 0, phi: 0, vphi: 0, axis: rand() * Math.PI, delay: 0, home: true });
    };
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const p00 = P[j * (nx + 1) + i];
        const p10 = P[j * (nx + 1) + i + 1];
        const p01 = P[(j + 1) * (nx + 1) + i];
        const p11 = P[(j + 1) * (nx + 1) + i + 1];
        if ((i + j) % 2) {
          add(p00, p10, p11);
          add(p00, p11, p01);
        } else {
          add(p00, p10, p01);
          add(p10, p11, p01);
        }
      }
    return { shards, mode: 'whole', modeT: 0, idle: 1.5, snaps: 0, t: 0 };
  },
  step(s, f) {
    s.t += f.dt;
    s.modeT += f.dt;
    const { bw, bh, x0, y0, fs } = box(f.w, f.h);
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    const shatter = (px: number, py: number) => {
      s.mode = 'fly';
      s.modeT = 0;
      for (const sh of s.shards) {
        const dx = sh.x - px;
        const dy = sh.y - py;
        const d = Math.hypot(dx, dy) + 1;
        // the blast falls off with distance; a little chaos in every piece
        const imp = (fs * 3.4) / (d / fs + 0.7);
        sh.vx = (dx / d) * imp + (f.rand() - 0.5) * fs * 1.6;
        sh.vy = (dy / d) * imp + (f.rand() - 0.5) * fs * 1.6 - fs * 1.8;
        sh.va = (f.rand() - 0.5) * 12 * clamp(imp / (fs * 5), 0.3, 1.5);
        sh.vphi = (f.rand() - 0.5) * 22;
        sh.home = false;
      }
      f.emit({ name: 'glass', gain: 0.8 });
      f.emit({ name: 'thud', gain: 0.35, rate: 1.4 });
    };
    const reassemble = () => {
      s.mode = 'back';
      s.modeT = 0;
      s.snaps = 0;
      for (const sh of s.shards) sh.delay = f.rand() * 0.35 + (Math.hypot(sh.x - f.w / 2, sh.y - f.h / 2) / Math.hypot(f.w, f.h)) * 0.3;
      f.emit({ name: 'whoosh', gain: 0.5, rate: 0.8 });
    };
    if (f.pressed) {
      const onWord = f.p.x > x0 && f.p.x < x0 + bw && f.p.y > y0 && f.p.y < y0 + bh;
      if (s.mode === 'whole' && onWord) shatter(f.p.x, f.p.y);
      else if (s.mode === 'fly') reassemble();
    }
    if (s.mode === 'fly' && s.modeT > 1.5) reassemble();
    // idle: strike the word somewhere every few seconds
    if (s.mode === 'whole' && s.idle > 2.2 && s.modeT > 2.2) shatter(x0 + bw * (0.25 + f.rand() * 0.5), y0 + bh * (0.3 + f.rand() * 0.4));

    let snapped = 0;
    for (const sh of s.shards) {
      if (sh.home) continue;
      if (s.mode === 'fly' || sh.delay > 0) {
        if (s.mode === 'back') sh.delay -= f.dt;
        // free flight: air drag, gentle gravity, tumbling
        const drag = Math.exp(-2.4 * f.dt);
        sh.vx *= drag;
        sh.vy = sh.vy * drag + fs * 2.2 * f.dt;
        sh.va *= Math.exp(-0.5 * f.dt);
      } else {
        // pulled home by a stiff, slightly under-damped spring
        const k = 160;
        const c = 16;
        sh.vx += ((sh.hx - sh.x) * k - sh.vx * c) * f.dt;
        sh.vy += ((sh.hy - sh.y) * k - sh.vy * c) * f.dt;
        const ta = Math.round(sh.a / (Math.PI * 2)) * Math.PI * 2;
        const tp = Math.round(sh.phi / Math.PI) * Math.PI;
        sh.va += ((ta - sh.a) * k - sh.va * c) * f.dt;
        sh.vphi += ((tp - sh.phi) * k - sh.vphi * c) * f.dt;
        if (Math.hypot(sh.hx - sh.x, sh.hy - sh.y) < 0.6 && Math.abs(ta - sh.a) < 0.01 && Math.abs(tp - sh.phi) < 0.02 && Math.hypot(sh.vx, sh.vy) < 30) {
          sh.home = true;
          sh.x = sh.hx;
          sh.y = sh.hy;
          sh.a = sh.phi = sh.vx = sh.vy = sh.va = sh.vphi = 0;
          snapped++;
          continue;
        }
      }
      sh.x += sh.vx * f.dt;
      sh.y += sh.vy * f.dt;
      sh.a += sh.va * f.dt;
      sh.phi += sh.vphi * f.dt;
    }
    if (snapped) {
      s.snaps += snapped;
      if (s.snaps % 12 < snapped) f.emit({ name: 'tick', gain: 0.18, rate: 1.4 + f.rand() * 0.4 });
    }
    if (s.mode === 'back' && s.shards.every((sh) => sh.home)) {
      s.mode = 'whole';
      s.modeT = 0;
      f.emit({ name: 'chime', gain: 0.4 });
    }
  },
});

export default function TextShatter() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const ref = useRef<HTMLCanvasElement>(null);
  const [fonts, setFonts] = useState(0);
  useEffect(() => {
    let on = true;
    document.fonts?.ready.then(() => on && setFonts(1));
    return () => {
      on = false;
    };
  }, []);
  const dpr = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  const b = box(w, h);
  // the word (glassy gradient) and a pure-white copy used for the glints
  const art = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const mk = (white: boolean) => {
      const c = document.createElement('canvas');
      c.width = Math.ceil(b.bw * dpr);
      c.height = Math.ceil(b.bh * dpr);
      const g = c.getContext('2d')!;
      g.scale(dpr, dpr);
      g.font = `900 ${b.fs}px 'Archivo Variable', Archivo, system-ui`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      if (white) g.fillStyle = '#ffffff';
      else {
        const gr = g.createLinearGradient(0, 0, b.bw * 0.4, b.bh);
        gr.addColorStop(0, '#e9fbff');
        gr.addColorStop(0.45, '#7fd8ff');
        gr.addColorStop(0.55, '#4a8cff');
        gr.addColorStop(1, '#b28bff');
        g.fillStyle = gr;
      }
      g.fillText(WORD, b.bw / 2, b.bh * 0.53, b.bw);
      return c;
    };
    const word = mk(false);
    // which shards actually carry some of the word (empty ones are skipped)
    const d = word.getContext('2d')!.getImageData(0, 0, word.width, word.height).data;
    const vis = s.shards.map((sh) => {
      // sample the centre, near each corner and near each edge midpoint
      const pts: [number, number][] = [[0, 0]];
      for (let k = 0; k < 3; k++) {
        const n = (k + 1) % 3;
        pts.push([sh.v[k * 2] * 0.75, sh.v[k * 2 + 1] * 0.75]);
        pts.push([(sh.v[k * 2] + sh.v[n * 2]) * 0.45, (sh.v[k * 2 + 1] + sh.v[n * 2 + 1]) * 0.45]);
      }
      for (const [qx, qy] of pts) {
        const px = sh.hx + qx;
        const py = sh.hy + qy;
        const ix = Math.floor((px - b.x0) * dpr);
        const iy = Math.floor((py - b.y0) * dpr);
        if (ix >= 0 && iy >= 0 && ix < word.width && iy < word.height && d[(iy * word.width + ix) * 4 + 3] > 10) return true;
      }
      return false;
    });
    return { word, white: mk(true), vis };
  }, [w, h, dpr, fonts, s.shards, b.bw, b.bh, b.fs, b.x0]);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !art) return;
    const W2 = Math.round(w * dpr);
    const H2 = Math.round(h * dpr);
    if (cv.width !== W2) cv.width = W2;
    if (cv.height !== H2) cv.height = H2;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W2, H2);
    if (s.mode === 'whole') {
      // whole: one draw, with a slow sheen running across the glass
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(art.word, b.x0, b.y0, b.bw, b.bh);
      const k = (s.t * 0.45) % 1.6;
      ctx.globalAlpha = clamp(Math.sin((k / 1.6) * Math.PI) * 0.35);
      ctx.save();
      ctx.beginPath();
      ctx.rect(b.x0 + (k - 0.3) * b.bw, b.y0, b.bw * 0.12, b.bh);
      ctx.clip();
      ctx.drawImage(art.white, b.x0, b.y0, b.bw, b.bh);
      ctx.restore();
      ctx.globalAlpha = 1;
      return;
    }
    s.shards.forEach((sh, i) => {
      if (!art.vis[i]) return;
      const cphi = Math.cos(sh.phi);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.a + sh.axis);
      ctx.scale(Math.abs(cphi) < 0.04 ? 0.04 * Math.sign(cphi || 1) : cphi, 1);
      ctx.rotate(-sh.axis);
      ctx.beginPath();
      ctx.moveTo(sh.v[0], sh.v[1]);
      ctx.lineTo(sh.v[2], sh.v[3]);
      ctx.lineTo(sh.v[4], sh.v[5]);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.drawImage(art.word, b.x0 - sh.hx, b.y0 - sh.hy, b.bw, b.bh);
      // a glint as the shard turns its face to the light
      const glint = clamp(Math.pow(Math.abs(Math.sin(sh.phi * 0.5 + sh.a * 0.3)), 6)) * (sh.home ? 0 : 0.85);
      if (glint > 0.02) {
        ctx.globalAlpha = glint;
        ctx.drawImage(art.white, b.x0 - sh.hx, b.y0 - sh.hy, b.bw, b.bh);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      if (!sh.home) {
        // crisp cut edges
        ctx.strokeStyle = 'rgba(220,245,255,0.35)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    });
  }, [fx.t, w, h, dpr, art, s, b.x0, b.y0, b.bw, b.bh]);

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(90% 80% at 50% 45%, #1a2140 0%, #0c0f1e 55%, #05060c 100%)' }}>
      <div style={{ position: 'absolute', left: b.x0 - b.bw * 0.1, top: b.y0 - b.bh * 0.3, width: b.bw * 1.2, height: b.bh * 1.6, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(90,140,255,0.18), rgba(90,140,255,0))' }} />
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} role="img" aria-label={WORD} />
      <button
        type="button"
        aria-label="Shatter the word"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
        }}
        style={{ position: 'absolute', left: b.x0, top: b.y0, width: b.bw, height: b.bh, opacity: 0 }}
      />
    </Stage>
  );
}
