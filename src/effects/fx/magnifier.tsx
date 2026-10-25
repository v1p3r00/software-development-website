import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, mulberry32 } from '../kit';
import type { Spring } from '../kit';

/**
 * A magnifying glass over a dense star atlas. The lens is a real per-pixel bulge: strong
 * magnification in the middle, squeezed toward the rim, with a hint of colour fringing at the
 * edge. It glides after the pointer on a spring and the handle swings behind it. Hold to zoom
 * in further. Idle, it drifts across the chart by itself.
 */

interface S {
  lx: Spring;
  ly: Spring;
  zoom: Spring;
  swing: Spring; // handle angle offset, radians
  idle: number;
  t: number;
}

export const sim = defineSim<S>({
  init: (w, h) => ({ lx: sp(w * 0.45), ly: sp(h * 0.45), zoom: sp(2.1), swing: sp(), idle: 3, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    const auto = s.idle > 2 || !f.p.over;
    const tx = auto ? f.w * (0.5 + 0.3 * Math.sin(s.t * 0.42)) : f.p.x;
    const ty = auto ? f.h * (0.5 + 0.26 * Math.sin(s.t * 0.77 + 0.6)) : f.p.y;
    spring(s.lx, tx, 80, 11, f.dt);
    spring(s.ly, ty, 80, 11, f.dt);
    if (f.pressed) f.emit({ name: 'glass', gain: 0.3, rate: 1.4 });
    // pressing pushes the zoom in; the auto drift breathes a little
    const z = f.p.down ? 3.4 : auto ? 2.1 + 0.5 * Math.max(0, Math.sin(s.t * 0.9)) : 2.1;
    spring(s.zoom, z, 120, f.reduced ? 22 : 12, f.dt);
    // the handle lags behind the motion like a pendulum
    spring(s.swing, clamp(-s.lx.v * 0.0007, -0.45, 0.45), 50, 5, f.dt);
  },
});

/** draws the atlas at `S` canvas px per CSS px (high-res so the lens stays sharp) */
function drawAtlas(w: number, h: number, S: number) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * S);
  c.height = Math.round(h * S);
  const g = c.getContext('2d')!;
  g.scale(S, S);
  const rand = mulberry32(42);
  const bg = g.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.65);
  bg.addColorStop(0, '#16224a');
  bg.addColorStop(0.6, '#0b1330');
  bg.addColorStop(1, '#050817');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const m = Math.min(w, h);
  const cx = w / 2;
  const cy = h * 0.55;
  // coordinate grid: declination circles and hour lines
  g.strokeStyle = 'rgba(140,170,255,0.16)';
  g.lineWidth = 0.6;
  for (let r = m * 0.12; r < Math.hypot(w, h); r += m * 0.12) {
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.stroke();
  }
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * w * 2, cy + Math.sin(a) * w * 2);
    g.stroke();
    g.fillStyle = 'rgba(160,185,255,0.45)';
    g.font = `${m * 0.012}px 'JetBrains Mono Variable', monospace`;
    g.fillText(`${k}h`, cx + Math.cos(a) * m * 0.37, cy + Math.sin(a) * m * 0.37);
  }
  // milky way haze
  for (let i = 0; i < 70; i++) {
    const t = rand();
    const x = t * w;
    const y = h * 0.2 + t * h * 0.5 + (rand() - 0.5) * m * 0.2;
    const rg = g.createRadialGradient(x, y, 0, x, y, m * (0.05 + rand() * 0.08));
    rg.addColorStop(0, 'rgba(150,170,255,0.05)');
    rg.addColorStop(1, 'rgba(150,170,255,0)');
    g.fillStyle = rg;
    g.fillRect(x - m * 0.2, y - m * 0.2, m * 0.4, m * 0.4);
  }
  // stars: many tiny ones, a few bright ones with catalogue labels (only legible through the lens)
  const tiny = m * 0.0068;
  for (let i = 0; i < (w * h) / 220; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const b = Math.pow(rand(), 3);
    const r = 0.25 + b * 1.6;
    const hue = rand();
    g.fillStyle = hue < 0.15 ? `rgba(255,200,160,${0.5 + b * 0.5})` : hue > 0.85 ? `rgba(170,200,255,${0.5 + b * 0.5})` : `rgba(255,255,255,${0.45 + b * 0.55})`;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    if (b > 0.6) {
      g.fillStyle = 'rgba(190,210,255,0.55)';
      g.font = `${tiny}px 'JetBrains Mono Variable', monospace`;
      g.fillText(`HD ${Math.floor(rand() * 90000 + 1000)}`, x + r + 1, y + tiny * 0.35);
    }
  }
  // constellations
  const cons = [
    { n: 'CYGNUS', p: [[0.2, 0.2], [0.26, 0.3], [0.33, 0.38], [0.24, 0.36], [0.29, 0.25]] },
    { n: 'LYRA', p: [[0.62, 0.18], [0.66, 0.24], [0.7, 0.22], [0.68, 0.3], [0.64, 0.31]] },
    { n: 'AQUILA', p: [[0.45, 0.62], [0.5, 0.56], [0.55, 0.5], [0.52, 0.66], [0.58, 0.7]] },
    { n: 'DRACO', p: [[0.76, 0.6], [0.82, 0.52], [0.88, 0.58], [0.84, 0.72], [0.9, 0.8]] },
    { n: 'VULPECULA', p: [[0.12, 0.66], [0.18, 0.72], [0.26, 0.7], [0.3, 0.8]] },
  ];
  for (const k of cons) {
    g.strokeStyle = 'rgba(140,200,255,0.55)';
    g.lineWidth = 0.7;
    g.beginPath();
    k.p.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h)));
    g.stroke();
    for (const [x, y] of k.p) {
      const sg = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, m * 0.012);
      sg.addColorStop(0, 'rgba(255,255,255,1)');
      sg.addColorStop(0.3, 'rgba(200,225,255,0.6)');
      sg.addColorStop(1, 'rgba(200,225,255,0)');
      g.fillStyle = sg;
      g.fillRect(x * w - m * 0.012, y * h - m * 0.012, m * 0.024, m * 0.024);
    }
    g.fillStyle = 'rgba(170,215,255,0.75)';
    g.font = `600 ${m * 0.016}px 'Inter Variable', Inter, system-ui`;
    g.fillText(k.n.split('').join(' '), k.p[0][0] * w + 6, k.p[0][1] * h - 8);
  }
  g.fillStyle = 'rgba(220,230,255,0.9)';
  g.font = `300 ${m * 0.045}px 'Archivo Variable', Archivo, system-ui`;
  g.fillText('Celestial Atlas', m * 0.06, m * 0.1);
  g.fillStyle = 'rgba(170,190,240,0.6)';
  g.font = `${m * 0.016}px 'Inter Variable', Inter, system-ui`;
  g.fillText('PLATE IV · THE SUMMER TRIANGLE · EPOCH J2000', m * 0.06, m * 0.1 + m * 0.035);
  return { c, data: g.getImageData(0, 0, c.width, c.height).data, sw: c.width, sh: c.height };
}

export default function Magnifier() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const ref = useRef<HTMLCanvasElement>(null);
  const lensRef = useRef<HTMLCanvasElement | null>(null);
  const [fonts, setFonts] = useState(0);
  useEffect(() => {
    let on = true;
    document.fonts?.ready.then(() => on && setFonts(1));
    return () => {
      on = false;
    };
  }, []);
  const dpr = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  // source resolution: twice the screen, capped to keep memory sane
  const S = Math.max(1, Math.min(dpr * 2, Math.sqrt(9e6 / Math.max(1, w * h))));
  const atlas = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const a = drawAtlas(w, h, S);
    // a copy at screen resolution, so the per-frame background is a plain 1:1 blit
    const base = document.createElement('canvas');
    base.width = Math.round(w * dpr);
    base.height = Math.round(h * dpr);
    const bctx = base.getContext('2d')!;
    bctx.imageSmoothingQuality = 'high';
    bctx.drawImage(a.c, 0, 0, base.width, base.height);
    return { ...a, base };
  }, [w, h, S, dpr, fonts]);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !atlas) return;
    const W = Math.round(w * dpr);
    const H = Math.round(h * dpr);
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(atlas.base, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const R = Math.min(w, h) * 0.17;
    const lx = s.lx.x;
    const ly = s.ly.x;
    const ang = Math.PI * 0.25 + s.swing.x;
    const hx = Math.cos(ang);
    const hy = Math.sin(ang);
    const handle = (path: CanvasRenderingContext2D) => {
      path.save();
      path.translate(lx + hx * R * 1.05, ly + hy * R * 1.05);
      path.rotate(ang);
      path.beginPath();
      path.roundRect(0, -R * 0.12, R * 1.25, R * 0.24, R * 0.12);
      path.restore();
    };
    // drop shadow of the whole glass on the chart
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = R * 0.35 * dpr;
    ctx.shadowOffsetX = R * 0.14 * dpr;
    ctx.shadowOffsetY = R * 0.22 * dpr;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(lx, ly, R * 1.06, 0, Math.PI * 2);
    ctx.fill();
    handle(ctx);
    ctx.fill();
    ctx.restore();

    // the lens: remap every pixel inside the circle through the bulge
    const Rd = R * dpr;
    const N = Math.ceil(Rd * 2) + 2;
    let lc = lensRef.current;
    if (!lc) lc = lensRef.current = document.createElement('canvas');
    if (lc.width !== N) lc.width = lc.height = N;
    const lctx = lc.getContext('2d')!;
    const img = lctx.createImageData(N, N);
    const out = img.data;
    const src = atlas.data;
    const sw = atlas.sw;
    const sh = atlas.sh;
    const a = 1 / Math.max(1.01, s.zoom.x); // scale at the centre = 1 / magnification
    const ox = lx * dpr - N / 2;
    const oy = ly * dpr - N / 2;
    const k = S / dpr; // device px → source px
    for (let py = 0; py < N; py++) {
      const dy = (py + 0.5 - N / 2) / Rd;
      for (let px = 0; px < N; px++) {
        const dx = (px + 0.5 - N / 2) / Rd;
        const d2 = dx * dx + dy * dy;
        if (d2 > 1.02) continue;
        const d = Math.sqrt(d2);
        // g(d) = d·(a + (1−a)·d²): magnified middle, compressed rim, seamless at the edge
        const g = a + (1 - a) * d2;
        const fringe = 0.03 * d2 * d2;
        const o = (py * N + px) * 4;
        for (let ch = 0; ch < 3; ch++) {
          const gg = g * (1 + (ch - 1) * fringe);
          const sx = Math.min(sw - 1, Math.max(0, Math.round((ox + N / 2 + dx * Rd * gg) * k)));
          const sy = Math.min(sh - 1, Math.max(0, Math.round((oy + N / 2 + dy * Rd * gg) * k)));
          out[o + ch] = src[(sy * sw + sx) * 4 + ch];
        }
        // a darker band just inside the rim (light lost in the thick glass)
        const vig = 1 - 0.5 * Math.pow(d, 10);
        out[o] *= vig;
        out[o + 1] *= vig;
        out[o + 2] = out[o + 2] * vig + 6;
        out[o + 3] = clamp((1 - d) * Rd + 0.5) * 255;
      }
    }
    lctx.putImageData(img, 0, 0);
    ctx.drawImage(lc, ox / dpr, oy / dpr, N / dpr, N / dpr);

    // glass reflections
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, R, 0, Math.PI * 2);
    ctx.clip();
    const sg = ctx.createRadialGradient(lx - R * 0.42, ly - R * 0.5, 0, lx - R * 0.42, ly - R * 0.5, R * 0.75);
    sg.addColorStop(0, 'rgba(255,255,255,0.32)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(lx - R, ly - R, R * 2, R * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = R * 0.03;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(lx, ly, R * 0.82, Math.PI * 1.08, Math.PI * 1.38);
    ctx.stroke();
    ctx.restore();

    // the handle and the metal bezel
    const hg = ctx.createLinearGradient(lx + hx * R - hy * R * 0.12, ly + hy * R + hx * R * 0.12, lx + hx * R + hy * R * 0.12, ly + hy * R - hx * R * 0.12);
    hg.addColorStop(0, '#5b2e1a');
    hg.addColorStop(0.45, '#a8653c');
    hg.addColorStop(1, '#3a1a0d');
    handle(ctx);
    ctx.fillStyle = hg;
    ctx.fill();
    const bz = ctx.createLinearGradient(lx - R, ly - R, lx + R, ly + R);
    bz.addColorStop(0, '#f6e7c1');
    bz.addColorStop(0.35, '#b58a3e');
    bz.addColorStop(0.6, '#6b4c1c');
    bz.addColorStop(1, '#d9b46a');
    ctx.strokeStyle = bz;
    ctx.lineWidth = R * 0.09;
    ctx.beginPath();
    ctx.arc(lx, ly, R + R * 0.04, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,240,200,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(lx, ly, R + R * 0.085, Math.PI * 1.0, Math.PI * 1.6);
    ctx.stroke();
  }, [fx.t, w, h, atlas, dpr, s]);

  return (
    <Stage fx={fx} cursor="none" style={{ background: '#050817' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-label="Star atlas under a magnifying glass" role="img" />
    </Stage>
  );
}
