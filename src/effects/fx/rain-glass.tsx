import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * Rain on a window at night. Drops land and sit (surface tension holds them) until merging makes
 * one heavy enough to break free; then it runs down in stick-slip jerks, swallowing every drop in
 * its way (merges keep the volume: r = √(r₁² + r₂²)), shedding tiny beads behind and wiping a
 * clear track through the fogged glass, which slowly mists over again. Each drop is a little lens:
 * it shows the city behind it, sharp and upside down. Drag your finger to wipe the glass clear.
 */

interface Drop {
  x: number;
  y: number;
  r: number;
  vy: number;
  stall: number; // seconds left stuck
  shed: number; // distance since the last bead was left behind
  vx: number;
}

interface S {
  d: Drop[];
  clear: Float32Array; // how clear each cell of glass is (0 fogged .. 1 wiped)
  gw: number;
  gh: number;
  cell: number;
  t: number;
  lastDrip: number;
  lx: number;
  ly: number;
}

const sc = (w: number, h: number) => Math.min(w, h) / 600;

export const sim = defineSim<S>({
  init(w, h, rand) {
    const cell = 8;
    const gw = Math.ceil(w / cell), gh = Math.ceil(h / cell);
    const k = sc(w, h);
    const d: Drop[] = [];
    // the glass starts already beaded with rain
    for (let i = 0; i < 300; i++) {
      const big = rand() < 0.07; // a few heavy drops, about to go
      d.push({ x: rand() * w, y: rand() * h * 0.8, r: (big ? 9 + rand() * 5 : 1.5 + Math.pow(rand(), 3) * 8) * k, vy: 0, stall: rand() * 4, shed: 0, vx: 0 });
    }
    return { d, clear: new Float32Array(gw * gh), gw, gh, cell, t: 0, lastDrip: 0, lx: -1, ly: -1 };
  },
  step(s, f) {
    const { dt, p, w, h } = f;
    const k = sc(w, h);
    s.t += dt;
    const wipe = (x: number, y: number, r: number) => {
      const c = s.cell;
      const i0 = Math.max(0, Math.floor((x - r) / c)), i1 = Math.min(s.gw - 1, Math.floor((x + r) / c));
      const j0 = Math.max(0, Math.floor((y - r) / c)), j1 = Math.min(s.gh - 1, Math.floor((y + r) / c));
      for (let j = j0; j <= j1; j++)
        for (let i = i0; i <= i1; i++) {
          const dd = Math.hypot((i + 0.5) * c - x, (j + 0.5) * c - y) / r;
          if (dd < 1) s.clear[j * s.gw + i] = Math.max(s.clear[j * s.gw + i], (1 - dd * dd) ** 2); // soft-edged
        }
    };

    // new rain landing
    const rate = 30 * (w * h) / (800 * 600);
    let n = rate * dt;
    while (n > 0) {
      if (f.rand() < n) s.d.push({ x: f.rand() * w, y: f.rand() * h * 0.95, r: (1.2 + Math.pow(f.rand(), 3) * 10) * k, vy: 0, stall: 0.5, shed: 0, vx: 0 });
      n -= 1;
    }

    // the finger wipes a clear swathe and pushes the water away
    if (f.pressed) f.emit({ name: 'squeak', gain: 0.5, rate: 1.1 + f.rand() * 0.2 });
    if (p.down) {
      if (s.lx < 0) {
        s.lx = p.x;
        s.ly = p.y;
      }
      const R = 34 * k;
      const steps = Math.max(1, Math.ceil(Math.hypot(p.x - s.lx, p.y - s.ly) / 6));
      for (let i = 1; i <= steps; i++) wipe(s.lx + ((p.x - s.lx) * i) / steps, s.ly + ((p.y - s.ly) * i) / steps, R);
      for (const d of s.d) if (Math.hypot(d.x - p.x, d.y - p.y) < R) d.r = 0;
      s.lx = p.x;
      s.ly = p.y;
    } else s.lx = -1;

    // drops: heavy ones run, light ones cling
    const rRun = 10 * k;
    const g = 900 * k;
    for (const d of s.d) {
      if (d.r <= 0) continue;
      if (d.r > rRun) {
        if (d.stall > 0) {
          d.stall -= dt;
          d.vy *= Math.exp(-20 * dt);
        } else {
          // terminal speed grows with size; random snags make the stick-slip motion
          const vmax = (d.r / k - 7) * 34 * k;
          d.vy = Math.min(vmax, d.vy + g * dt);
          if (f.rand() < dt * 1.4 * (14 * k) / d.r) d.stall = 0.08 + f.rand() * 0.35;
        }
        // the path wanders a little as the drop finds the wettest glass
        d.vx = (f.rand() - 0.5) * 40 * k;
        const dy = d.vy * dt;
        d.y += dy;
        d.x += d.vx * dt * (d.vy > 1 ? 1 : 0);
        d.shed += dy;
        wipe(d.x, d.y - d.r * 0.3, d.r * 0.85);
        // leave a bead behind every so often (the drop loses a little water)
        if (d.shed > d.r * 1.6) {
          d.shed = 0;
          if (f.rand() < 0.7) {
            const br = d.r * (0.18 + f.rand() * 0.14);
            s.d.push({ x: d.x + (f.rand() - 0.5) * d.r * 0.5, y: d.y - d.r * 1.2, r: br, vy: 0, stall: 1, shed: 0, vx: 0 });
            d.r = Math.sqrt(Math.max(0, d.r * d.r - br * br));
          }
        }
      }
    }
    // merging: a moving drop swallows what it touches
    const arr = s.d.filter((d) => d.r > 0.6 * k && d.y < h + 30);
    arr.sort((a, b) => a.x - b.x);
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      if (a.r <= 0) continue;
      for (let j = i + 1; j < arr.length; j++) {
        const b = arr[j];
        if (b.x - a.x > (a.r + 12 * k) * 1.6) break;
        if (b.r <= 0) continue;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < (a.r + b.r) * 0.82) {
          const [big, small] = a.r >= b.r ? [a, b] : [b, a];
          // area is conserved; the merged drop keeps the bigger one's momentum
          const nr = Math.sqrt(big.r * big.r + small.r * small.r);
          big.x += (small.x - big.x) * (small.r / nr) * 0.3;
          // the merge that makes a drop heavy enough to break free
          if (big.r <= rRun && nr > rRun && s.t - s.lastDrip > 0.3) {
            f.emit({ name: 'drip', gain: 0.2, rate: 1.2 + f.rand() * 0.5, pan: (big.x / w) * 2 - 1 });
            s.lastDrip = s.t;
          }
          big.r = Math.min(26 * k, nr);
          small.r = 0;
        }
      }
    }
    s.d = arr.filter((d) => d.r > 0);
    if (s.d.length > 520) s.d.splice(0, s.d.length - 520);
    // the glass slowly fogs over again
    const fog = Math.exp(-0.12 * dt);
    for (let i = 0; i < s.clear.length; i++) s.clear[i] *= fog;
  },
});

// a deterministic hash for the city lights
const hsh = (i: number, j: number) => {
  let n = (i * 374761393 + j * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

function cityScene(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0c1830');
  bg.addColorStop(0.5, '#1a2c48');
  bg.addColorStop(0.8, '#3a2a3a');
  bg.addColorStop(1, '#22161e');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const m = Math.min(w, h);
  // building silhouettes with lit windows
  for (let i = 0; i < 14; i++) {
    const x = (i / 14) * w, bw = w / 14 + 1, top = h * (0.25 + hsh(i, 9) * 0.3);
    g.fillStyle = `rgb(${8 + i % 3 * 4},${14 + i % 2 * 5},${28 + i % 3 * 6})`;
    g.fillRect(x, top, bw, h - top);
    for (let y = top + m * 0.02; y < h * 0.9; y += m * 0.03)
      for (let xx = x + m * 0.012; xx < x + bw - m * 0.015; xx += m * 0.022)
        if (hsh(Math.floor(xx), Math.floor(y)) < 0.3) {
          g.fillStyle = hsh(Math.floor(y), Math.floor(xx)) < 0.7 ? 'rgba(255,200,120,0.85)' : 'rgba(160,210,255,0.8)';
          g.fillRect(xx, y, m * 0.01, m * 0.014);
        }
  }
  // street lights and car lamps: glowing points
  for (let i = 0; i < 110; i++) {
    const warm = hsh(i, 1) < 0.65;
    const x = hsh(i, 2) * w;
    const y = h * (0.45 + hsh(i, 3) * 0.5);
    const r = m * (0.008 + hsh(i, 4) * 0.02);
    const col = warm ? (hsh(i, 5) < 0.5 ? '255,176,90' : '255,110,70') : hsh(i, 5) < 0.5 ? '120,200,255' : '210,120,255';
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,250,235,1)');
    gr.addColorStop(0.2, `rgba(${col},0.95)`);
    gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return c;
}

function blurred(src: HTMLCanvasElement, px: number) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d')!;
  g.filter = `blur(${px}px)`;
  g.drawImage(src, 0, 0);
  // fogged glass scatters light: a lifted, hazy veil
  g.filter = 'none';
  g.fillStyle = 'rgba(120,140,170,0.07)';
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

export default function RainGlass() {
  const fx = useFx(sim);
  const ref = useRef<HTMLCanvasElement>(null);
  const cache = useRef<{ w: number; h: number; blurred: HTMLCanvasElement; sharp: HTMLCanvasElement; mist: HTMLCanvasElement; mask: HTMLCanvasElement; tmp: HTMLCanvasElement } | null>(null);
  const { s, w, h } = fx;

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    if (!cache.current || cache.current.w !== w || cache.current.h !== h) {
      // misty micro-droplets on the inside of the glass
      const mist = document.createElement('canvas');
      mist.width = w;
      mist.height = h;
      const mg = mist.getContext('2d')!;
      mg.fillStyle = 'rgba(190,210,230,0.05)';
      mg.fillRect(0, 0, w, h);
      for (let i = 0; i < (w * h) / 90; i++) {
        const x = hsh(i, 21) * w, y = hsh(i, 22) * h, r = 0.4 + hsh(i, 23) * 1.1;
        mg.fillStyle = `rgba(220,235,255,${0.12 + hsh(i, 24) * 0.2})`;
        mg.beginPath();
        mg.arc(x, y, r, 0, 6.283);
        mg.fill();
      }
      const tmp = document.createElement('canvas');
      tmp.width = w;
      tmp.height = h;
      const sharp = cityScene(w, h);
      cache.current = { w, h, blurred: blurred(sharp, Math.min(w, h) * 0.016), sharp, mist, mask: document.createElement('canvas'), tmp };
    }
    const C = cache.current;
    const c = cv.getContext('2d')!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.drawImage(C.blurred, 0, 0);
    c.drawImage(C.mist, 0, 0);

    // wiped glass: the sharp city through a soft mask
    const M = C.mask;
    if (M.width !== s.gw || M.height !== s.gh) {
      M.width = s.gw;
      M.height = s.gh;
    }
    const mc = M.getContext('2d')!;
    const img = mc.createImageData(s.gw, s.gh);
    for (let i = 0; i < s.clear.length; i++) img.data[i * 4 + 3] = clamp(s.clear[i] * 1.2) * 255;
    mc.putImageData(img, 0, 0);
    const tc = C.tmp.getContext('2d')!;
    tc.globalCompositeOperation = 'source-over';
    tc.clearRect(0, 0, w, h);
    tc.drawImage(C.sharp, 0, 0);
    tc.globalCompositeOperation = 'destination-in';
    tc.imageSmoothingEnabled = true;
    tc.filter = `blur(${s.cell * 0.8}px)`; // soft edges on the wiped track
    tc.drawImage(M, 0, 0, s.gw * s.cell, s.gh * s.cell);
    tc.filter = 'none';
    c.drawImage(C.tmp, 0, 0);

    // drops: lenses that flip the scene behind them
    for (const d of s.d) {
      const moving = d.vy > 5 && d.stall <= 0;
      const rx = d.r, ry = d.r * (moving ? 1.18 : 1);
      if (d.r > 2.2) {
        c.save();
        c.beginPath();
        c.ellipse(d.x, d.y, rx, ry, 0, 0, 6.283);
        c.clip();
        const R = d.r * 4;
        c.translate(d.x, d.y);
        c.scale(-1, -1);
        c.drawImage(C.sharp, d.x - R, d.y - R * 1.4, R * 2, R * 2.8, -rx, -ry, rx * 2, ry * 2);
        // water concentrates light: lenses read brighter than the glass around them
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(70,80,100,0.35)';
        c.fillRect(-rx, -ry, rx * 2, ry * 2);
        c.restore();
      }
      // shading: dark refracted rim at the bottom, a bright spec near the top
      const sh = c.createRadialGradient(d.x, d.y - ry * 0.25, d.r * 0.3, d.x, d.y, d.r * 1.05);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.8, 'rgba(10,20,35,0.06)');
      sh.addColorStop(1, 'rgba(5,10,20,0.4)');
      c.fillStyle = d.r > 2.2 ? sh : 'rgba(200,220,240,0.35)';
      c.beginPath();
      c.ellipse(d.x, d.y, rx, ry, 0, 0, 6.283);
      c.fill();
      if (d.r > 1.8) {
        c.fillStyle = 'rgba(255,255,255,0.75)';
        c.beginPath();
        c.ellipse(d.x - rx * 0.3, d.y - ry * 0.42, rx * 0.22, ry * 0.14, -0.5, 0, 6.283);
        c.fill();
        // a faint contact shadow on the glass below the drop
        c.fillStyle = 'rgba(0,0,0,0.12)';
        c.beginPath();
        c.ellipse(d.x + rx * 0.08, d.y + ry * 0.92, rx * 0.7, ry * 0.18, 0, 0, 6.283);
        c.fill();
      }
    }
    const vg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }, [fx.t, w, h, s]);

  return (
    <Stage fx={fx} cursor="grab" style={{ background: '#0a1424' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} role="img" aria-label="Rain on a window; drag to wipe the glass" />
    </Stage>
  );
}
