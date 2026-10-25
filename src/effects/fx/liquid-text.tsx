import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * A word under a sheet of water. The surface is a real 2D wave simulation (a height field):
 * moving the pointer drags a wake through it, pressing drops a stone, and the waves spread,
 * reflect and fade. Every pixel of the word is refracted by the slope of the water above it,
 * and the slopes also throw moving highlights across the pool. Idle, raindrops fall on it.
 */

const WORD = 'liquid';
const STEP = 1 / 60; // the wave equation runs at a fixed rate

interface S {
  gw: number;
  gh: number;
  cs: number; // cell size, px
  a: Float32Array; // previous heights
  b: Float32Array; // current heights
  acc: number;
  lx: number;
  ly: number;
  idle: number;
  rain: number;
  t: number;
}

function poke(s: S, x: number, y: number, amp: number, rad: number) {
  const cx = x / s.cs;
  const cy = y / s.cs;
  const r = Math.ceil(rad * 2);
  for (let j = Math.max(1, Math.floor(cy - r)); j <= Math.min(s.gh - 2, Math.ceil(cy + r)); j++) {
    for (let i = Math.max(1, Math.floor(cx - r)); i <= Math.min(s.gw - 2, Math.ceil(cx + r)); i++) {
      const d2 = ((i - cx) ** 2 + (j - cy) ** 2) / (rad * rad);
      s.b[j * s.gw + i] += amp * Math.exp(-d2);
    }
  }
}

export const sim = defineSim<S>({
  init(w, h) {
    const cs = Math.max(3, Math.min(w, h) / 110);
    const gw = Math.ceil(w / cs) + 2;
    const gh = Math.ceil(h / cs) + 2;
    return { gw, gh, cs, a: new Float32Array(gw * gh), b: new Float32Array(gw * gh), acc: 0, lx: -1, ly: -1, idle: 2, rain: 0, t: 0 };
  },
  step(s, f) {
    s.t += f.dt;
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    const speed = Math.hypot(f.p.vx, f.p.vy);
    // the pointer drags a wake: poke along the segment it travelled this frame
    if (f.p.over && s.lx >= 0 && speed > 20) {
      const n = Math.ceil(Math.hypot(f.p.x - s.lx, f.p.y - s.ly) / s.cs) + 1;
      for (let k = 1; k <= n; k++) poke(s, s.lx + ((f.p.x - s.lx) * k) / n, s.ly + ((f.p.y - s.ly) * k) / n, (-clamp(speed / 2500, 0, 0.6) / n) * 2.4, 2.2);
    }
    s.lx = f.p.x;
    s.ly = f.p.y;
    if (f.pressed) {
      poke(s, f.p.x, f.p.y, -7, 3.6);
      f.emit({ name: 'drip', gain: 0.55, rate: 0.8 });
    }
    // idle: a few raindrops, sometimes a bigger one on the word
    if (s.idle > 2) {
      s.rain -= f.dt;
      if (s.rain <= 0) {
        const big = f.rand() < 0.3;
        const x = big ? f.w * (0.25 + f.rand() * 0.5) : f.rand() * f.w;
        const y = big ? f.h * (0.4 + f.rand() * 0.2) : f.rand() * f.h;
        poke(s, x, y, big ? -5.5 : -2.2, big ? 3.2 : 1.8);
        f.emit({ name: 'drip', gain: big ? 0.4 : 0.15, rate: 0.9 + f.rand() * 0.5, pan: (x / f.w - 0.5) * 1.2 });
        s.rain = 0.25 + f.rand() * 0.45;
      }
    }
    // the wave equation (two-buffer form), fixed rate, with gentle damping
    s.acc = Math.min(s.acc + f.dt, STEP * 4);
    const damp = f.reduced ? 0.95 : 0.982;
    while (s.acc >= STEP) {
      s.acc -= STEP;
      const { a, b, gw, gh } = s;
      for (let j = 1; j < gh - 1; j++) {
        const o = j * gw;
        for (let i = 1; i < gw - 1; i++) {
          const k = o + i;
          a[k] = ((b[k - 1] + b[k + 1] + b[k - gw] + b[k + gw]) * 0.5 - a[k]) * damp;
        }
      }
      s.a = b;
      s.b = a;
    }
  },
});

function makeWord(w: number, h: number, sc: number) {
  const fs = Math.min((w * 0.8) / (WORD.length * 0.58), h * 0.42);
  const c = document.createElement('canvas');
  const bw = Math.min(w, fs * WORD.length * 0.62 + fs * 0.4);
  const bh = fs * 1.35;
  c.width = Math.ceil(bw * sc);
  c.height = Math.ceil(bh * sc);
  const g = c.getContext('2d')!;
  g.scale(sc, sc);
  g.font = `800 ${fs}px 'Archivo Variable', Archivo, system-ui`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const gr = g.createLinearGradient(0, bh * 0.15, 0, bh * 0.85);
  gr.addColorStop(0, '#ffffff');
  gr.addColorStop(1, '#bfefff');
  g.fillStyle = gr;
  g.fillText(WORD, bw / 2, bh * 0.52);
  return { data: g.getImageData(0, 0, c.width, c.height).data, sw: c.width, sh: c.height, x0: (w - bw) / 2, y0: (h - bh) / 2, bw, bh };
}

export default function LiquidText() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const ref = useRef<HTMLCanvasElement>(null);
  const tmp = useRef<{ word?: HTMLCanvasElement; glow?: HTMLCanvasElement; out?: ImageData }>({});
  const [fonts, setFonts] = useState(0);
  useEffect(() => {
    let on = true;
    document.fonts?.ready.then(() => on && setFonts(1));
    return () => {
      on = false;
    };
  }, []);
  const dpr = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  const word0 = useMemo(() => (typeof document === 'undefined' ? null : makeWord(w, h, 1)), [w, h, fonts]);
  // warp resolution: device px, capped so the per-pixel pass stays cheap
  const sc = word0 ? Math.min(dpr, Math.sqrt(300000 / (word0.bw * word0.bh))) : 1;
  const word = useMemo(() => (typeof document === 'undefined' ? null : makeWord(w, h, sc)), [w, h, sc, fonts]);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !word) return;
    const W = Math.round(w * dpr);
    const H = Math.round(h * dpr);
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the pool colour and vignette are CSS layers; the canvas only carries light and the word
    ctx.clearRect(0, 0, w, h);

    const { gw, gh, cs, b } = s;
    // slopes of the water, light from the upper left → moving highlights on the pool floor
    const t = tmp.current;
    if (!t.glow) t.glow = document.createElement('canvas');
    if (t.glow.width !== gw || t.glow.height !== gh) {
      t.glow.width = gw;
      t.glow.height = gh;
    }
    // slope of the surface at every grid node (central differences)
    const GX = new Float32Array(gw * gh);
    const GY = new Float32Array(gw * gh);
    for (let j = 1; j < gh - 1; j++) {
      for (let i = 1; i < gw - 1; i++) {
        const k = j * gw + i;
        GX[k] = (b[k + 1] - b[k - 1]) * 0.5;
        GY[k] = (b[k + gw] - b[k - gw]) * 0.5;
      }
    }
    const gctx = t.glow.getContext('2d')!;
    const gimg = gctx.createImageData(gw, gh);
    const gd = gimg.data;
    for (let j = 1; j < gh - 1; j++) {
      for (let i = 1; i < gw - 1; i++) {
        const k = j * gw + i;
        const l = clamp((-GX[k] - GY[k]) * 1.25, -1, 1);
        const o = k * 4;
        if (l > 0) {
          gd[o] = 190;
          gd[o + 1] = 240;
          gd[o + 2] = 255;
          gd[o + 3] = l * 200;
        } else {
          gd[o + 3] = -l * 120; // the far slopes darken a little
        }
      }
    }
    gctx.putImageData(gimg, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(t.glow, -cs, -cs, gw * cs, gh * cs);

    // refract the word: each output pixel samples the word at an offset set by the local slope
    if (!t.out || t.out.width !== word.sw || t.out.height !== word.sh) t.out = new ImageData(word.sw, word.sh);
    const out = t.out;
    const od = out.data;
    od.fill(0);
    const src = word.data;
    const K = cs * 3 * sc; // refraction strength (in word px)
    for (let py = 0; py < word.sh; py++) {
      const gyf = (word.y0 + py / sc) / cs;
      const j = Math.min(gh - 2, Math.max(1, Math.floor(gyf)));
      const fy = clamp(gyf - j);
      for (let px = 0; px < word.sw; px++) {
        const gxf = (word.x0 + px / sc) / cs;
        const i = Math.min(gw - 2, Math.max(1, Math.floor(gxf)));
        const fxx = clamp(gxf - i);
        const k = j * gw + i;
        // bilinear slopes, so the refraction bends smoothly between grid nodes
        const w00 = (1 - fxx) * (1 - fy), w10 = fxx * (1 - fy), w01 = (1 - fxx) * fy, w11 = fxx * fy;
        const sx = GX[k] * w00 + GX[k + 1] * w10 + GX[k + gw] * w01 + GX[k + gw + 1] * w11;
        const sy = GY[k] * w00 + GY[k + 1] * w10 + GY[k + gw] * w01 + GY[k + gw + 1] * w11;
        const qx = Math.round(px + sx * K);
        const qy = Math.round(py + sy * K);
        if (qx < 0 || qy < 0 || qx >= word.sw || qy >= word.sh) continue;
        const si = (qy * word.sw + qx) * 4;
        const al = src[si + 3];
        if (!al) continue;
        const o = (py * word.sw + px) * 4;
        const lit = 1 + clamp(-(sx + sy) * 0.9, -0.35, 0.5);
        od[o] = src[si] * lit;
        od[o + 1] = src[si + 1] * lit;
        od[o + 2] = src[si + 2] * lit;
        od[o + 3] = al;
      }
    }
    if (!t.word) t.word = document.createElement('canvas');
    if (t.word.width !== word.sw || t.word.height !== word.sh) {
      t.word.width = word.sw;
      t.word.height = word.sh;
    }
    t.word.getContext('2d')!.putImageData(out, 0, 0);
    ctx.drawImage(t.word, word.x0, word.y0, word.bw, word.bh);
  }, [fx.t, w, h, word, dpr, sc, s]);

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(70% 70% at 50% 45%, #0f5a78 0%, #08324a 55%, #03141f 100%)' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} role="img" aria-label={`The word ${WORD} under rippling water`} />
      {/* a soft vignette, like the edge of a pool */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(75% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,8,14,0.55) 100%)' }} />
    </Stage>
  );
}
