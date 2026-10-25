import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, approach, clamp, lerp } from '../kit';

/**
 * A lava lamp. Each wax blob carries a temperature: the bulb heats the ones resting in the pool,
 * they expand (buoyant) and rise, cool near the cap and sink again. The wax is a metaball field,
 * so blobs that touch merge into one body and stretch apart into necks when they split.
 * Drag inside the glass to stir the wax; your hand also warms what it hovers over.
 */

interface Blob {
  x: number; // px from the glass axis
  y: number; // px up from the glass floor
  vx: number;
  vy: number;
  r: number;
  temp: number; // 0 cold .. 1 hot
  ph: number; // wander phase
  wasLow: boolean;
}

interface S {
  b: Blob[];
  t: number;
  lastDrip: number;
}

// lamp geometry from the stage size
function geom(w: number, h: number) {
  const H = Math.min(h * 0.9, w * 1.9);
  const cx = w / 2;
  const top = h / 2 - H * 0.36; // glass top
  const bot = h / 2 + H * 0.2; // glass floor
  const GH = bot - top;
  const wb = H * 0.15; // half widths of the glass: wide at the bottom, narrow at the top
  const wt = H * 0.08;
  return { H, cx, top, bot, GH, wb, wt };
}
const halfW = (g: ReturnType<typeof geom>, y: number) => lerp(g.wb, g.wt, clamp(y / g.GH));

export const sim = defineSim<S>({
  init(w, h, rand) {
    const g = geom(w, h);
    const b: Blob[] = Array.from({ length: 8 }, (_, i) => ({
      x: (i % 2 ? 1 : -1) * (0.2 + rand() * 0.4) * g.wb,
      y: g.GH * (0.12 + (i / 8) * 0.75),
      vx: 0,
      vy: 0,
      r: g.H * (0.026 + rand() * 0.024),
      temp: rand(),
      ph: rand() * 20,
      wasLow: false,
    }));
    return { b, t: 0, lastDrip: 0 };
  },
  step(s, f) {
    const { dt, p } = f;
    const g = geom(f.w, f.h);
    s.t += dt;
    const G = g.GH * 0.55; // buoyancy scale, px/s²
    const px = p.x - g.cx;
    const py = g.bot - p.y;
    const inGlass = py > 0 && py < g.GH && Math.abs(px) < halfW(g, py) + 10;
    for (const b of s.b) {
      // heat exchange: the bulb under the floor, the cool cap above
      const u = b.y / g.GH;
      if (u < 0.18) b.temp = approach(b.temp, 1.05, 0.55, dt);
      else if (u > 0.78) b.temp = approach(b.temp, -0.05, 0.7, dt);
      else b.temp = approach(b.temp, 0.5, 0.06, dt);
      // a warm hand over the glass
      if (inGlass && p.over) {
        const d = Math.hypot(px - b.x, py - b.y) / (g.GH * 0.2);
        b.temp += Math.exp(-d * d) * 0.25 * dt;
      }
      // hot wax is lighter than the liquid, cold wax heavier
      b.vy += (b.temp - 0.5) * G * dt;
      // a slow sideways wander so columns never line up
      b.vx += Math.sin(s.t * (0.4 + (b.ph % 1) * 0.5) + b.ph) * g.H * 0.05 * dt;
      if (p.down && inGlass) {
        const d = Math.hypot(px - b.x, py - b.y) / (g.GH * 0.22);
        const k = Math.exp(-d * d) * 4 * dt;
        b.vx += p.vx * k;
        b.vy -= p.vy * k;
      }
      // the liquid is viscous: heavy drag
      const drag = Math.exp(-1.6 * dt);
      b.vx *= drag;
      b.vy *= drag;
      const vmax = g.GH * 0.4;
      b.vy = clamp(b.vy, -vmax, vmax);
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y < b.r * 0.2) {
        b.y = b.r * 0.2;
        b.vy *= -0.1;
      }
      if (b.y > g.GH - b.r * 0.6) {
        b.y = g.GH - b.r * 0.6;
        b.vy *= -0.1;
      }
      const lim = halfW(g, b.y) - b.r * 0.75;
      if (Math.abs(b.x) > lim) {
        b.x = Math.sign(b.x) * lim;
        b.vx *= -0.3;
      }
      // a blob tearing off the pool: a soft drip cue
      const low = u < 0.16;
      if (b.wasLow && !low && b.vy > 0 && s.t - s.lastDrip > 1.2) {
        f.emit({ name: 'drip', gain: 0.25, rate: 0.6 + f.rand() * 0.3, pan: b.x / g.wb * 0.5 });
        s.lastDrip = s.t;
      }
      b.wasLow = low;
    }
    // gentle separation so two blobs don't sit exactly on top of each other forever
    for (let i = 0; i < s.b.length; i++)
      for (let j = i + 1; j < s.b.length; j++) {
        const a = s.b[i], c = s.b[j];
        const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 1;
        const m = (a.r + c.r) * 0.6;
        if (d < m) {
          const k = ((m - d) / m) * g.H * 0.15 * dt;
          a.vx -= (dx / d) * k;
          a.vy -= (dy / d) * k;
          c.vx += (dx / d) * k;
          c.vy += (dy / d) * k;
        }
      }
  },
});

function glassPath(c: CanvasRenderingContext2D, g: ReturnType<typeof geom>) {
  c.beginPath();
  c.moveTo(g.cx - g.wt, g.top);
  c.lineTo(g.cx + g.wt, g.top);
  c.quadraticCurveTo(g.cx + g.wb * 1.02, g.bot - g.GH * 0.35, g.cx + g.wb, g.bot);
  c.lineTo(g.cx - g.wb, g.bot);
  c.quadraticCurveTo(g.cx - g.wb * 1.02, g.bot - g.GH * 0.35, g.cx - g.wt, g.top);
  c.closePath();
}

export default function LavaLamp() {
  const fx = useFx(sim);
  const ref = useRef<HTMLCanvasElement>(null);
  const low = useRef<HTMLCanvasElement | null>(null);
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
    const g = geom(w, h);
    const flick = 0.92 + 0.05 * Math.sin(s.t * 2.3) + 0.03 * Math.sin(s.t * 7.1);

    // the room: dark wall washed with the lamp's warm glow, a tabletop
    c.fillStyle = '#0b0610';
    c.fillRect(0, 0, w, h);
    const glow = c.createRadialGradient(g.cx, g.bot - g.GH * 0.45, 0, g.cx, g.bot - g.GH * 0.45, Math.max(w, h) * 0.7);
    glow.addColorStop(0, `rgba(255,90,60,${0.32 * flick})`);
    glow.addColorStop(0.3, `rgba(160,30,90,${0.18 * flick})`);
    glow.addColorStop(1, 'rgba(20,5,30,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, w, h);
    const floorY = g.bot + g.H * 0.17;
    const tbl = c.createLinearGradient(0, floorY, 0, h);
    tbl.addColorStop(0, '#2a1218');
    tbl.addColorStop(1, '#0a0507');
    c.fillStyle = tbl;
    c.fillRect(0, floorY, w, h - floorY);
    const pool = c.createRadialGradient(g.cx, floorY, 0, g.cx, floorY, g.H * 0.45);
    pool.addColorStop(0, `rgba(255,120,60,${0.35 * flick})`);
    pool.addColorStop(1, 'rgba(255,120,60,0)');
    c.save();
    c.translate(g.cx, floorY);
    c.scale(1, 0.18);
    c.translate(-g.cx, -floorY);
    c.fillStyle = pool;
    c.fillRect(g.cx - g.H * 0.5, floorY - g.H * 0.5, g.H, g.H);
    c.restore();

    // the wax field, evaluated at low resolution and scaled up (bilinear = soft anti-aliased edges)
    const cell = Math.max(1.6, g.H / 260);
    const lw = Math.ceil((g.wb * 2.1) / cell), lh = Math.ceil(g.GH / cell);
    if (!low.current) low.current = document.createElement('canvas');
    const L = low.current;
    if (L.width !== lw || L.height !== lh) {
      L.width = lw;
      L.height = lh;
    }
    const lc = L.getContext('2d')!;
    const img = lc.createImageData(lw, lh);
    const d = img.data;
    const x0 = -g.wb * 1.05;
    const poolR2 = (g.GH * 0.07) ** 2;
    const FF = new Float32Array(lw * lh);
    // pass 1: the field
    for (let j = 0; j < lh; j++) {
      const yy = g.GH - (j + 0.5) * cell; // up from the floor
      for (let i = 0; i < lw; i++) {
        const xx = x0 + (i + 0.5) * cell;
        // the molten pool on the floor: a field from a horizontal line
        let F = poolR2 / (yy * yy + 1);
        for (const b of s.b) {
          const dx = xx - b.x, dy = yy - b.y;
          F += (b.r * b.r) / (dx * dx + dy * dy + 1);
        }
        FF[j * lw + i] = F;
      }
    }
    // pass 2: shade. Wax is translucent and lit from the bulb below, so the undersides of
    // the blobs glow and their tops go deep red; the field gradient tells us which is which.
    for (let j = 0; j < lh; j++) {
      const yy = g.GH - (j + 0.5) * cell;
      const hw = halfW(g, yy);
      const v = yy / g.GH;
      for (let i = 0; i < lw; i++) {
        const xx = x0 + (i + 0.5) * cell;
        const F = FF[j * lw + i];
        const up = FF[Math.max(0, j - 1) * lw + i] - FF[Math.min(lh - 1, j + 1) * lw + i];
        const sx = FF[j * lw + Math.min(lw - 1, i + 1)] - FF[j * lw + Math.max(0, i - 1)];
        const gl = Math.hypot(up, sx) + 1e-4;
        const under = up / gl; // +1 on the underside of a blob, -1 on top
        const u = clamp(Math.abs(xx) / hw, 0, 1);
        const cyl = Math.sqrt(1 - u * u); // light falls off toward the sides of the cylinder
        const heat = Math.pow(1 - v, 1.6); // and toward the top, away from the bulb
        // the liquid: translucent magenta, glowing near the bulb
        let r = 70 + 150 * heat, gg = 10 + 20 * heat, bb = 70 + 60 * heat;
        const a = clamp((F - 0.94) / 0.12);
        const rim = 1 - clamp((F - 1) / 1.6); // 1 near the skin, 0 deep inside
        const glowU = clamp(0.55 + 0.45 * under * rim + 0.25 * heat);
        const wr = 255, wg = 55 + 135 * glowU, wbb = 20 + 50 * glowU * glowU;
        r = lerp(r, wr * (0.7 + 0.3 * glowU), a);
        gg = lerp(gg, wg, a);
        bb = lerp(bb, wbb, a);
        const lit = (0.35 + 0.65 * cyl) * (0.65 + 0.35 * heat + 0.15 * a) * flick;
        const k = (j * lw + i) * 4;
        d[k] = Math.min(255, r * lit);
        d[k + 1] = gg * lit;
        d[k + 2] = bb * lit;
        d[k + 3] = 255;
      }
    }
    lc.putImageData(img, 0, 0);
    c.save();
    glassPath(c, g);
    c.clip();
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(L, g.cx + x0, g.top, lw * cell, lh * cell);
    // glass: a cool reflection strip and a bright edge glint
    const gl = c.createLinearGradient(g.cx - g.wb, 0, g.cx + g.wb, 0);
    gl.addColorStop(0, 'rgba(255,255,255,0.0)');
    gl.addColorStop(0.18, 'rgba(255,240,255,0.22)');
    gl.addColorStop(0.24, 'rgba(255,240,255,0.04)');
    gl.addColorStop(0.78, 'rgba(255,255,255,0)');
    gl.addColorStop(0.86, 'rgba(255,220,240,0.12)');
    gl.addColorStop(1, 'rgba(0,0,0,0.4)');
    c.fillStyle = gl;
    c.fillRect(g.cx - g.wb * 1.1, g.top, g.wb * 2.2, g.GH);
    c.restore();
    glassPath(c, g);
    c.strokeStyle = 'rgba(255,200,230,0.25)';
    c.lineWidth = 1;
    c.stroke();

    // chrome cap and base: cones with banded metal gradients
    const chrome = (x1: number, x2: number) => {
      const m = c.createLinearGradient(x1, 0, x2, 0);
      m.addColorStop(0, '#2a1e26');
      m.addColorStop(0.22, '#e8d6dc');
      m.addColorStop(0.32, '#8a6f78');
      m.addColorStop(0.6, '#3a2a30');
      m.addColorStop(0.85, '#c79a9a');
      m.addColorStop(1, '#2a1a20');
      return m;
    };
    const capT = g.top - g.H * 0.16;
    c.fillStyle = chrome(g.cx - g.wt, g.cx + g.wt);
    c.beginPath();
    c.moveTo(g.cx - g.wt * 1.06, g.top + 1);
    c.lineTo(g.cx - g.wt * 0.42, capT);
    c.quadraticCurveTo(g.cx, capT - g.H * 0.012, g.cx + g.wt * 0.42, capT);
    c.lineTo(g.cx + g.wt * 1.06, g.top + 1);
    c.closePath();
    c.fill();
    const baseB = floorY;
    c.fillStyle = chrome(g.cx - g.wb * 1.15, g.cx + g.wb * 1.15);
    c.beginPath();
    c.moveTo(g.cx - g.wb * 1.03, g.bot - 1);
    c.lineTo(g.cx + g.wb * 1.03, g.bot - 1);
    c.lineTo(g.cx + g.wb * 0.62, g.bot + (baseB - g.bot) * 0.55);
    c.lineTo(g.cx + g.wb * 1.12, baseB);
    c.lineTo(g.cx - g.wb * 1.12, baseB);
    c.lineTo(g.cx - g.wb * 0.62, g.bot + (baseB - g.bot) * 0.55);
    c.closePath();
    c.fill();
    // warm light spilling onto the chrome from the glass
    const spill = c.createLinearGradient(0, g.bot, 0, g.bot + g.H * 0.06);
    spill.addColorStop(0, `rgba(255,140,80,${0.5 * flick})`);
    spill.addColorStop(1, 'rgba(255,140,80,0)');
    c.fillStyle = spill;
    c.fill();

    const vg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.65)');
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }, [fx.t, w, h, s]);

  return (
    <Stage fx={fx} cursor="grab" style={{ background: '#0b0610' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} role="img" aria-label="Lava lamp; drag inside the glass to stir the wax" />
    </Stage>
  );
}
