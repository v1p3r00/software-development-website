import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * A synthwave flight over an endless wireframe landscape. The ground is a value-noise height
 * field sampled on a grid that slides toward the camera; strips are painted far to near and
 * filled, so nearer ridges hide the lines behind them (hidden-line wireframe, like the old
 * vector games). Steer with the cursor: the craft banks into turns and drifts sideways; press to
 * boost. Left alone, an autopilot weaves gently down the valley.
 */

interface S {
  z: number; // distance flown
  camX: number;
  vx: number; // lateral speed
  bank: Spring; // roll, rad
  alt: Spring; // camera height
  speed: Spring;
  boost: boolean;
  idle: number;
  t: number;
}

// deterministic value noise + fbm
function hash(x: number, y: number) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = smooth(x - xi), v = smooth(y - yi);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function height(x: number, z: number) {
  const n = noise(x * 0.16, z * 0.16) * 0.6 + noise(x * 0.37 + 9, z * 0.37) * 0.28 + noise(x * 0.9, z * 0.9 + 4) * 0.12;
  // a flat valley floor down the middle, mountains rising on both sides
  const side = clamp((Math.abs(x) - 1.6) / 6);
  return n * n * 9 * side * side + n * 0.25;
}

const BASE = 9; // cruise speed, units / s

export const sim = defineSim<S>({
  init: () => ({ z: 0, camX: 0, vx: 0, bank: sp(), alt: sp(1.6), speed: sp(BASE), boost: false, idle: 9, t: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    s.t += dt;
    const act = p.over && (p.down || Math.abs(p.vx) + Math.abs(p.vy) > 3);
    s.idle = act ? 0 : s.idle + dt;
    const auto = s.idle > 2.5 || !p.over;
    // steering input -1..1 (autopilot: a lazy slalom)
    const sx = auto ? Math.sin(s.t * 0.45) * 0.55 : clamp((p.x / w) * 2 - 1, -1, 1);
    const sy = auto ? 0.35 + Math.sin(s.t * 0.31) * 0.25 : clamp(p.y / h, 0, 1);
    if (f.pressed) f.emit({ name: 'whoosh', gain: 0.7, rate: 0.8 });
    if (f.released) f.emit({ name: 'whoosh', gain: 0.3, rate: 0.55 });
    const autoBoost = auto && s.t % 9 > 7;
    s.boost = p.down || autoBoost;
    spring(s.speed, s.boost ? BASE * 3.2 : BASE, 6, 4.5, dt);
    // banking turns: roll leads, the sideways drift follows
    spring(s.bank, -clamp(sx * 0.6 + s.vx * 0.12, -1, 1) * (f.reduced ? 0.12 : 0.32), 18, 7, dt);
    // the craft slides toward its lane, never further than the valley floor allows
    const target = sx * 2.1;
    const nv = approach(s.vx, (target - s.camX) * 2.2, 4, dt);
    s.vx = nv;
    s.camX = clamp(s.camX + nv * dt, -2.3, 2.3);
    spring(s.alt, 0.9 + (1 - sy) * 2.4, 10, 6, dt);
    s.z += s.speed.x * dt;
  },
});

export default function Terrain() {
  const fx = useFx(sim);
  const ref = useRef<HTMLCanvasElement>(null);
  const { s, w, h } = fx;

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const c = cv.getContext('2d')!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const boost = clamp((s.speed.x - BASE) / (BASE * 2.2));
    const hor = h * 0.5 + (s.alt.x - 1.6) * h * 0.04;
    const F = Math.max(w * 0.6, h * 0.45);
    const R = Math.hypot(w, h);

    c.save();
    c.translate(w / 2, h / 2);
    c.rotate(s.bank.x);
    c.translate(-w / 2, -h / 2);

    // sky: deep violet into a hot pink horizon
    const sky = c.createLinearGradient(0, hor - R * 0.6, 0, hor);
    sky.addColorStop(0, '#07021a');
    sky.addColorStop(0.55, '#2a0a4a');
    sky.addColorStop(0.9, '#8a1f6e');
    sky.addColorStop(1, '#ff4f8a');
    c.fillStyle = sky;
    c.fillRect(-R, hor - R, w + 2 * R, R + 1);
    // stars
    c.fillStyle = '#ffe9ff';
    for (let i = 0; i < 90; i++) {
      const x = hash(i, 7) * (w + 400) - 200 - s.camX * 3;
      const y = hor - hash(i, 11) * R * 0.55 - 10;
      c.globalAlpha = 0.25 + hash(i, 3) * 0.6 * (0.7 + 0.3 * Math.sin(s.t * 2 + i));
      c.fillRect(((x % (w + 400)) + w + 400) % (w + 400) - 200, y, 1.3, 1.3);
    }
    c.globalAlpha = 1;

    // the sun: banded gradient disc, slits drifting down
    const sr = Math.min(w, h) * 0.24;
    const sx = w / 2 - s.camX * 6;
    const sy = hor - sr * 0.45;
    const halo = c.createRadialGradient(sx, sy, sr * 0.6, sx, sy, sr * 2.6);
    halo.addColorStop(0, 'rgba(255,90,140,0.45)');
    halo.addColorStop(1, 'rgba(255,90,140,0)');
    c.fillStyle = halo;
    c.fillRect(sx - sr * 3, sy - sr * 3, sr * 6, sr * 6);
    c.save();
    c.beginPath();
    c.arc(sx, sy, sr, 0, Math.PI * 2);
    c.clip();
    const sg = c.createLinearGradient(0, sy - sr, 0, sy + sr);
    sg.addColorStop(0, '#fff27a');
    sg.addColorStop(0.45, '#ff9a3c');
    sg.addColorStop(1, '#ff2f7e');
    c.fillStyle = sg;
    c.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
    c.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 9; i++) {
      const u = (i + ((s.t * 0.35) % 1)) / 9;
      const y = sy - sr * 0.1 + u * sr * 1.2;
      c.fillRect(sx - sr, y, sr * 2, u * sr * 0.09);
    }
    c.restore();

    // the ground
    const NZ = 46, NX = 44, dxw = 1, dzw = 1;
    const zn = 0.8;
    const frac = (s.z / dzw) % 1;
    const x0 = Math.floor(s.camX / dxw) - NX / 2;
    const rows: { x: number; y: number }[][] = [];
    for (let k = 0; k <= NZ; k++) {
      const z = zn + (k - frac) * dzw;
      const zw = Math.floor(s.z / dzw) + k;
      const row: { x: number; y: number }[] = [];
      for (let i = 0; i <= NX; i++) {
        const xw = (x0 + i) * dxw;
        const y = height(xw, zw * dzw);
        const zz = Math.max(0.05, z);
        row.push({ x: w / 2 + ((xw - s.camX) / zz) * F, y: hor + ((s.alt.x - y) / zz) * F });
      }
      rows.push(row);
    }
    c.lineJoin = 'round';
    for (let k = NZ - 1; k >= 0; k--) {
      const a = rows[k], b = rows[k + 1];
      // fill the strip: it hides everything behind it
      c.beginPath();
      c.moveTo(b[0].x, b[0].y);
      for (let i = 1; i <= NX; i++) c.lineTo(b[i].x, b[i].y);
      for (let i = NX; i >= 0; i--) c.lineTo(a[i].x, a[i].y);
      c.closePath();
      const fog = k / NZ;
      c.fillStyle = `rgb(${14 + fog * 40},${4 + fog * 6},${30 + fog * 40})`;
      c.fill();
      // lines: hot magenta far, electric cyan near; brighter while boosting
      c.beginPath();
      c.moveTo(b[0].x, b[0].y);
      for (let i = 1; i <= NX; i++) c.lineTo(b[i].x, b[i].y);
      for (let i = 0; i <= NX; i++) {
        c.moveTo(a[i].x, a[i].y);
        c.lineTo(b[i].x, b[i].y);
      }
      const near = 1 - fog;
      const col = `rgba(${Math.round(255 - near * 200)},${Math.round(60 + near * 170)},255,`;
      c.strokeStyle = col + (0.12 + near * 0.25) * (1 + boost * 0.6) + ')';
      c.lineWidth = 1 + near * 3.5;
      c.stroke();
      c.strokeStyle = col + (0.35 + near * 0.65) + ')';
      c.lineWidth = 0.6 + near * 1.1;
      c.stroke();
    }
    // horizon haze
    const hz = c.createLinearGradient(0, hor - h * 0.06, 0, hor + h * 0.08);
    hz.addColorStop(0, 'rgba(255,80,150,0)');
    hz.addColorStop(0.45, 'rgba(255,80,150,0.32)');
    hz.addColorStop(1, 'rgba(255,80,150,0)');
    c.fillStyle = hz;
    c.fillRect(-R, hor - h * 0.06, w + 2 * R, h * 0.14);
    c.restore();

    // speed streaks at the edges while boosting
    if (boost > 0.05) {
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = `rgba(160,230,255,${0.25 * boost})`;
      c.lineWidth = 1.2;
      c.beginPath();
      for (let i = 0; i < 28; i++) {
        const a = hash(i, 5) * Math.PI * 2;
        const r0 = R * (0.3 + ((hash(i, 9) + s.t * 2.5) % 1) * 0.5);
        c.moveTo(w / 2 + Math.cos(a) * r0, h / 2 + Math.sin(a) * r0);
        c.lineTo(w / 2 + Math.cos(a) * (r0 + R * 0.12 * boost), h / 2 + Math.sin(a) * (r0 + R * 0.12 * boost));
      }
      c.stroke();
      c.globalCompositeOperation = 'source-over';
    }
    const vg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, R * 0.6);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,10,0.6)');
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
    // scanlines, very faint
    c.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
  }, [fx.t, w, h, s]);

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: '#07021a' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} role="img" aria-label="Wireframe terrain flight; move to steer, press to boost" />
    </Stage>
  );
}
