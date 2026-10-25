import { useLayoutEffect, useMemo, useRef } from 'react';
import { defineSim, useFx, Stage } from '../kit';

/**
 * A real wave equation on a height field. Every cell is pulled toward the average of its
 * neighbours, so a tap spreads as a ring, bounces off the pool walls and interferes with
 * other rings. The view refracts the tiled pool floor through the surface slope and adds a
 * sky highlight on the crests.
 */

const CELLS = 150; // cells along the long side
const HZ = 120; // wave steps per second (fixed, so it looks the same at any frame rate)

interface S {
  gw: number;
  gh: number;
  cur: Float32Array;
  prev: Float32Array;
  acc: number;
  idle: number;
  rainIn: number;
  lx: number;
  ly: number;
  t: number;
}

function drop(s: S, x: number, y: number, r: number, a: number) {
  const r2 = r * r;
  const R = Math.ceil(r * 2);
  for (let j = -R; j <= R; j++)
    for (let i = -R; i <= R; i++) {
      const gx = Math.round(x) + i;
      const gy = Math.round(y) + j;
      if (gx < 1 || gy < 1 || gx >= s.gw - 1 || gy >= s.gh - 1) continue;
      const d2 = (gx - x) ** 2 + (gy - y) ** 2;
      const v = a * Math.exp(-d2 / r2);
      s.cur[gy * s.gw + gx] -= v;
      s.prev[gy * s.gw + gx] -= v * 0.8;
    }
}

export const sim = defineSim<S>({
  init(w, h) {
    const cell = Math.max(w, h) / CELLS;
    const gw = Math.ceil(w / cell) + 1;
    const gh = Math.ceil(h / cell) + 1;
    return { gw, gh, cur: new Float32Array(gw * gh), prev: new Float32Array(gw * gh), acc: 0, idle: 2, rainIn: 0.2, lx: -1, ly: -1, t: 0 };
  },
  step(s, f) {
    const { w, h, dt } = f;
    s.t += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    const cell = Math.max(w, h) / CELLS;
    const gx = f.p.x / cell;
    const gy = f.p.y / cell;
    if (f.pressed) {
      drop(s, gx, gy, 3.2, 26);
      f.emit({ name: 'drip', gain: 0.6, rate: 0.9 + f.rand() * 0.2, pan: (f.p.x / w) * 2 - 1 });
    }
    // dragging a finger through the water leaves a wake; hovering just skims it
    if (f.p.over && s.lx >= 0) {
      const d = Math.hypot(gx - s.lx, gy - s.ly);
      const n = Math.min(8, Math.ceil(d / 1.5));
      for (let k = 1; k <= n; k++) drop(s, s.lx + ((gx - s.lx) * k) / n, s.ly + ((gy - s.ly) * k) / n, f.p.down ? 2.2 : 1.6, f.p.down ? 3.2 : 0.6);
    }
    s.lx = f.p.over ? gx : -1;
    s.ly = gy;
    if (s.idle > 2.5) {
      // rain: a few big drops so the self-demo shows rings meeting and reflecting
      s.rainIn -= dt;
      if (s.rainIn <= 0) {
        s.rainIn = 0.55 + f.rand() * 0.6;
        const x = (0.15 + f.rand() * 0.7) * s.gw;
        const y = (0.15 + f.rand() * 0.7) * s.gh;
        drop(s, x, y, 2.6 + f.rand() * 1.5, 18 + f.rand() * 12);
        f.emit({ name: 'drip', gain: 0.35, rate: 0.8 + f.rand() * 0.5, pan: (x / s.gw) * 2 - 1 });
      }
    }
    // fixed-rate wave steps
    s.acc += dt;
    const damp = f.reduced ? 0.975 : 0.995;
    const { gw, gh } = s;
    while (s.acc >= 1 / HZ) {
      s.acc -= 1 / HZ;
      const c = s.cur;
      const p = s.prev;
      for (let y = 1; y < gh - 1; y++) {
        let i = y * gw + 1;
        for (let x = 1; x < gw - 1; x++, i++) {
          // next = average of neighbours * 2 - previous  (discrete wave equation)
          p[i] = ((c[i - 1] + c[i + 1] + c[i - gw] + c[i + gw]) * 0.5 - p[i]) * damp;
        }
      }
      // walls stay at rest (fixed edges reflect the wave)
      s.prev = c;
      s.cur = p;
    }
  },
});

/** the pool floor: tiles, grout, depth shading — at the output resolution */
function makeFloor(ow: number, oh: number) {
  const px = new Uint8ClampedArray(ow * oh * 4);
  const tile = Math.max(ow, oh) / 10;
  for (let y = 0; y < oh; y++)
    for (let x = 0; x < ow; x++) {
      const i = (y * ow + x) * 4;
      const tx = (x / tile) % 1;
      const ty = (y / tile) % 1;
      // anti-aliased grout: blend over ~1px
      const md = Math.min(tx, 1 - tx, ty, 1 - ty) * tile;
      const gr = Math.min(1, Math.max(0, tile * 0.045 - md + 0.5));
      // each tile a slightly different shade
      const id = Math.floor(x / tile) * 7 + Math.floor(y / tile) * 13;
      const v = ((id * 2654435761) >>> 0) / 4294967296;
      const dx = x / ow - 0.5;
      const dy = y / oh - 0.45;
      const depth = 1 - Math.min(0.55, (dx * dx + dy * dy) * 1.5);
      px[i] = (20 + v * 18 + (120 - 20 - v * 18) * gr) * depth;
      px[i + 1] = (120 + v * 30 + (200 - 120 - v * 30) * gr) * depth;
      px[i + 2] = (165 + v * 25 + (215 - 165 - v * 25) * gr) * depth;
      px[i + 3] = 255;
    }
  return px;
}

export default function WaterRipple() {
  const fx = useFx(sim);
  const cv = useRef<HTMLCanvasElement>(null);
  const off = useRef<{ c: HTMLCanvasElement; img: ImageData } | null>(null);
  const { w, h, s } = fx;
  const ow = s.gw * 3;
  const oh = s.gh * 3;
  const floor = useMemo(() => makeFloor(ow, oh), [ow, oh]);

  useLayoutEffect(() => {
    const cn = cv.current;
    if (!cn) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cn.width !== Math.round(w * dpr)) cn.width = Math.round(w * dpr);
    if (cn.height !== Math.round(h * dpr)) cn.height = Math.round(h * dpr);
    if (!off.current || off.current.c.width !== ow || off.current.c.height !== oh) {
      const c = document.createElement('canvas');
      c.width = ow;
      c.height = oh;
      off.current = { c, img: new ImageData(ow, oh) };
    }
    const { c, img } = off.current;
    const out = img.data;
    const H = s.cur;
    const gw = s.gw;
    const gh = s.gh;
    const K = 3.2; // refraction strength, output px per unit slope
    for (let oy = 0; oy < oh; oy++) {
      const fy = Math.min(gh - 2, oy / 3);
      const y0 = Math.max(1, Math.floor(fy));
      const ty = fy - y0;
      for (let ox = 0; ox < ow; ox++) {
        const fxp = Math.min(gw - 2, ox / 3);
        const x0 = Math.max(1, Math.floor(fxp));
        const tx = fxp - x0;
        const i = y0 * gw + x0;
        // slope from central differences, bilinear between the two rows
        const sx0 = H[i + 1] - H[i - 1];
        const sx1 = H[i + gw + 1] - H[i + gw - 1];
        const sy0 = H[i + gw] - H[i - gw];
        const sy1 = H[i + gw + 1] - H[i - gw + 1];
        const sx = (sx0 + (sx1 - sx0) * ty) * 0.5;
        const sy = (sy0 + (sy1 - sy0) * tx) * 0.5;
        // look through the tilted surface at a shifted bit of floor
        let rx = (ox + sx * K) | 0;
        let ry = (oy + sy * K) | 0;
        rx = rx < 0 ? 0 : rx >= ow ? ow - 1 : rx;
        ry = ry < 0 ? 0 : ry >= oh ? oh - 1 : ry;
        const j = (ry * ow + rx) * 4;
        // light from the top left: slopes facing it glint, the others darken
        const l = -sx * 0.55 - sy * 0.8;
        const spec = l > 0 ? Math.min(150, l * l * 90) : 0;
        // focused light (caustics) where the surface is curved like a lens
        const lap = H[i - 1] + H[i + 1] + H[i - gw] + H[i + gw] - 4 * H[i];
        const caus = lap > 0 ? Math.min(90, lap * 22) : lap * 6;
        const dark = l < 0 ? Math.max(0.55, 1 + l * 0.12) : 1;
        const o = (oy * ow + ox) * 4;
        out[o] = floor[j] * dark + spec + caus * 0.7;
        out[o + 1] = floor[j + 1] * dark + spec + caus;
        out[o + 2] = floor[j + 2] * dark + spec * 0.95 + caus;
        out[o + 3] = 255;
      }
    }
    c.getContext('2d')!.putImageData(img, 0, 0);
    const ctx = cn.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const cell = Math.max(w, h) / CELLS;
    ctx.drawImage(c, 0, 0, ow * (cell / 3), oh * (cell / 3));
  }, [fx.t, w, h, s, ow, oh, floor]);

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#0b4a5e' }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      {/* sky reflection and a soft vignette sit on top of the water */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 40%), radial-gradient(90% 80% at 50% 45%, transparent 55%, rgba(0,20,35,0.5) 100%)',
        }}
      />
    </Stage>
  );
}
