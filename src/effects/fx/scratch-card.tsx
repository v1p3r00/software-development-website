import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * A scratch card. Rub the silver foil with your finger: it scrapes away with soft edges and
 * little silver flakes, and once enough is gone the rest dissolves and the prize celebrates.
 */

const GW = 140; // scratch mask resolution

interface Flake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  spin: number;
}
interface Confetto {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  c: number;
  life: number;
}

interface S {
  mask: Float32Array; // 0 foil … 1 scratched
  GH: number;
  lastX: number;
  lastY: number;
  had: boolean;
  scratched: number; // fraction
  reveal: number; // 0..1 foil dissolve after the threshold
  revealed: boolean;
  flakes: Flake[];
  confetti: Confetto[];
  soundClock: number;
  idle: number;
  ghostT: number;
  resetT: number;
  version: number; // bumps on every change so the view can redraw the mask
}

function geom(w: number, h: number) {
  // a taller card on a portrait screen
  const ratio = h > w * 1.2 ? 0.95 : 1.45;
  const cw = Math.min(w * (ratio < 1 ? 0.9 : 0.86), h * 0.92 * ratio, 640);
  const ch = cw / ratio;
  const x = (w - cw) / 2;
  const y = (h - ch) / 2;
  const area = { x: x + cw * 0.08, y: y + ch * 0.3, w: cw * 0.84, h: ch * 0.52 };
  return { cw, ch, x, y, area, base: Math.min(ch, cw / 1.45) };
}

function fresh(s: S) {
  s.mask.fill(0);
  s.scratched = 0;
  s.reveal = 0;
  s.revealed = false;
  s.version++;
}

export const sim = defineSim<S>({
  init(w, h) {
    const { area } = geom(w, h);
    const GH = Math.max(8, Math.round((GW * area.h) / area.w));
    return { mask: new Float32Array(GW * GH), GH, lastX: 0, lastY: 0, had: false, scratched: 0, reveal: 0, revealed: false, flakes: [], confetti: [], soundClock: 0, idle: 0, ghostT: 0, resetT: 0, version: 0 };
  },
  step(s, f) {
    const g = geom(f.w, f.h);
    const A = g.area;
    let px = f.p.x;
    let py = f.p.y;
    let down = f.p.down;
    if (f.p.down) s.idle = 0;
    else s.idle += f.dt;
    // the gallery's ghost finger scratches in a zig-zag
    if (f.live && s.idle > 2.5 && !s.revealed) {
      s.ghostT += f.dt;
      const u = s.ghostT * 0.55;
      px = A.x + A.w * (0.08 + 0.84 * (0.5 + 0.5 * Math.sin(u * 5.2)));
      py = A.y + A.h * (0.15 + 0.7 * ((u * 0.9) % 1));
      down = true;
    }
    const cell = A.w / GW;
    const brush = Math.max(2.2, (Math.min(f.w, f.h) * 0.045) / cell);
    if (down && !s.revealed) {
      const gx = (px - A.x) / cell;
      const gy = (py - A.y) / cell;
      const sx = s.had ? s.lastX : gx;
      const sy = s.had ? s.lastY : gy;
      const dist = Math.hypot(gx - sx, gy - sy);
      const n = Math.max(1, Math.ceil(dist / (brush * 0.3)));
      let gained = 0;
      for (let k = 1; k <= n; k++) {
        const cx = sx + ((gx - sx) * k) / n;
        const cy = sy + ((gy - sy) * k) / n;
        const r0 = Math.floor(cy - brush - 1);
        const r1 = Math.ceil(cy + brush + 1);
        const c0 = Math.floor(cx - brush - 1);
        const c1 = Math.ceil(cx + brush + 1);
        for (let r = Math.max(0, r0); r <= Math.min(s.GH - 1, r1); r++)
          for (let c = Math.max(0, c0); c <= Math.min(GW - 1, c1); c++) {
            const d = Math.hypot(c + 0.5 - cx, r + 0.5 - cy) / brush;
            if (d >= 1) continue;
            // a soft, slightly ragged brush: the coin doesn't take everything in one pass
            const rag = 0.75 + 0.25 * Math.sin(c * 12.9898 + r * 78.233);
            const amt = (1 - d * d) * 0.55 * rag;
            const i = r * GW + c;
            const v = Math.min(1, s.mask[i] + amt);
            gained += v - s.mask[i];
            s.mask[i] = v;
          }
      }
      if (gained > 0) {
        s.version++;
        // silver flakes come off where you scratch
        const inArea = px > A.x && px < A.x + A.w && py > A.y && py < A.y + A.h;
        if (inArea && f.rand() < Math.min(1, gained * 0.08)) {
          for (let k = 0; k < 2; k++)
            s.flakes.push({ x: px, y: py, vx: (f.rand() - 0.5) * 160 + f.p.vx * 0.15, vy: -f.rand() * 80, r: 1 + f.rand() * 2.5, life: 0, spin: f.rand() * 6 });
        }
        s.soundClock += f.dt;
        if (s.soundClock > 0.045 && inArea) {
          s.soundClock = 0;
          f.emit({ name: 'scratch', gain: clamp(0.25 + gained * 0.004, 0.25, 0.8), rate: 0.85 + f.rand() * 0.35 });
        }
      }
      s.lastX = gx;
      s.lastY = gy;
      s.had = true;
    } else s.had = false;

    // how much is gone?
    if (!s.revealed && s.version % 6 === 0) {
      let sum = 0;
      for (let i = 0; i < s.mask.length; i++) sum += s.mask[i] > 0.6 ? 1 : 0;
      s.scratched = sum / s.mask.length;
      if (s.scratched > 0.68) {
        s.revealed = true;
        s.resetT = 0;
        f.emit({ name: 'success', gain: 0.8 });
        f.emit({ name: 'pop', gain: 0.6, rate: 0.8 });
        const cols = 6;
        for (let k = 0; k < 90; k++) {
          const a = -Math.PI / 2 + (f.rand() - 0.5) * 2.2;
          const v = 300 + f.rand() * 520;
          s.confetti.push({ x: g.x + g.cw / 2 + (f.rand() - 0.5) * g.cw * 0.4, y: A.y + A.h * 0.6, vx: Math.cos(a) * v, vy: Math.sin(a) * v, a: f.rand() * 6, va: (f.rand() - 0.5) * 18, c: k % cols, life: 0 });
        }
      }
    }
    if (s.revealed) {
      s.reveal = Math.min(1, s.reveal + f.dt * 2.2);
      s.resetT += f.dt;
      if (f.live && s.resetT > 3.2) {
        fresh(s);
        s.ghostT = 0;
        s.idle = 0;
        f.emit({ name: 'rustle', gain: 0.35 });
      }
    }
    for (const a of f.actions) if (a.type === 'reset') fresh(s);
    for (const fl of s.flakes) {
      fl.life += f.dt;
      fl.vy += 900 * f.dt;
      fl.x += fl.vx * f.dt;
      fl.y += fl.vy * f.dt;
    }
    s.flakes = s.flakes.filter((fl) => fl.life < 0.8);
    for (const c of s.confetti) {
      c.life += f.dt;
      c.vx *= Math.exp(-2.2 * f.dt);
      c.vy = c.vy * Math.exp(-2.2 * f.dt) + 700 * f.dt;
      c.x += c.vx * f.dt + Math.sin(c.life * 8 + c.a) * 30 * f.dt;
      c.y += c.vy * f.dt;
      c.a += c.va * f.dt;
    }
    s.confetti = s.confetti.filter((c) => c.life < 2.6);
  },
});

const CONF = ['#ff5f1f', '#ffd23f', '#3ddc97', '#4cc9f0', '#f72585', '#ffffff'];

export default function ScratchCard() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const g = geom(w, h);
  const A = g.area;
  const fx2 = useRef<HTMLCanvasElement>(null);
  const cache = useRef<{ key: string; foil: HTMLCanvasElement; maskC: HTMLCanvasElement } | null>(null);

  useLayoutEffect(() => {
    const cv = fx2.current;
    if (!cv) return;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    const W = Math.round(w * dpr);
    const H = Math.round(h * dpr);
    const key = `${W}x${H}`;
    if (!cache.current || cache.current.key !== key) {
      cv.width = W;
      cv.height = H;
      // the foil, painted once: brushed silver, a diamond pattern and an embossed label
      const foil = document.createElement('canvas');
      foil.width = Math.round(A.w * dpr);
      foil.height = Math.round(A.h * dpr);
      const q = foil.getContext('2d')!;
      q.scale(dpr, dpr);
      const gr = q.createLinearGradient(0, 0, A.w, A.h);
      gr.addColorStop(0, '#d9dce3');
      gr.addColorStop(0.35, '#a7adb9');
      gr.addColorStop(0.5, '#eef0f4');
      gr.addColorStop(0.68, '#9aa0ad');
      gr.addColorStop(1, '#c8ccd5');
      q.fillStyle = gr;
      q.fillRect(0, 0, A.w, A.h);
      for (let i = 0; i < A.h; i += 1.5) {
        q.fillStyle = `rgba(255,255,255,${0.04 + 0.05 * Math.abs(Math.sin(i * 0.37))})`;
        q.fillRect(0, i, A.w, 0.7);
      }
      const d = Math.min(A.w, A.h) * 0.12;
      q.strokeStyle = 'rgba(255,255,255,.18)';
      q.lineWidth = 1;
      for (let x = -A.h; x < A.w + A.h; x += d) {
        q.beginPath();
        q.moveTo(x, 0);
        q.lineTo(x + A.h, A.h);
        q.moveTo(x, A.h);
        q.lineTo(x + A.h, 0);
        q.stroke();
      }
      q.textAlign = 'center';
      q.textBaseline = 'middle';
      q.font = `800 ${Math.min(A.h * 0.2, A.w * 0.09)}px "Archivo Variable", Archivo, system-ui, sans-serif`;
      q.fillStyle = 'rgba(80,86,100,.55)';
      q.fillText('SCRATCH HERE', A.w / 2 + 1, A.h / 2 + 1.5);
      q.fillStyle = 'rgba(255,255,255,.7)';
      q.fillText('SCRATCH HERE', A.w / 2, A.h / 2);
      const maskC = document.createElement('canvas');
      maskC.width = GW;
      maskC.height = s.GH;
      cache.current = { key, foil, maskC };
    }
    const { foil, maskC } = cache.current;
    const c = cv.getContext('2d')!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    // the mask → alpha image, scaled up with smoothing for soft scraped edges
    const mc = maskC.getContext('2d')!;
    const img = mc.createImageData(GW, s.GH);
    for (let i = 0; i < s.mask.length; i++) {
      img.data[i * 4 + 3] = Math.round(s.mask[i] * 255);
    }
    mc.putImageData(img, 0, 0);
    const fade = 1 - s.reveal;
    if (fade > 0) {
      c.save();
      c.beginPath();
      c.roundRect(A.x, A.y, A.w, A.h, Math.min(A.w, A.h) * 0.08);
      c.clip();
      c.globalAlpha = fade;
      c.drawImage(foil, A.x, A.y, A.w, A.h);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'destination-out';
      c.imageSmoothingEnabled = true;
      c.drawImage(maskC, A.x, A.y, A.w, A.h);
      c.restore();
    }
    // flakes
    for (const fl of s.flakes) {
      c.save();
      c.translate(fl.x, fl.y);
      c.rotate(fl.spin + fl.life * 10);
      c.globalAlpha = 1 - fl.life / 0.8;
      c.fillStyle = fl.r > 2 ? '#e6e8ee' : '#9aa0ad';
      c.fillRect(-fl.r, -fl.r * 0.5, fl.r * 2, fl.r);
      c.restore();
    }
    // confetti
    const m = Math.min(w, h);
    for (const cf of s.confetti) {
      c.save();
      c.translate(cf.x, cf.y);
      c.rotate(cf.a);
      c.scale(1, Math.cos(cf.life * 9 + cf.a));
      c.globalAlpha = Math.min(1, (2.6 - cf.life) * 2);
      c.fillStyle = CONF[cf.c];
      c.fillRect(-m * 0.008, -m * 0.005, m * 0.016, m * 0.01);
      c.restore();
    }
  });

  const pulse = s.revealed ? 1 + Math.sin(Math.min(1, s.reveal) * Math.PI) * 0.08 : 1;
  const disp = "'Archivo Variable', Archivo, system-ui, sans-serif";
  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: 'radial-gradient(100% 80% at 50% 30%, #3b1d5e 0%, #1a0d2e 60%, #0d0718 100%)' }}>
      {/* the card */}
      <div
        style={{
          position: 'absolute',
          left: g.x,
          top: g.y,
          width: g.cw,
          height: g.ch,
          borderRadius: g.cw * 0.045,
          background: 'linear-gradient(135deg,#ff6a2b 0%,#ff3d7f 55%,#7b2ff7 100%)',
          boxShadow: '0 30px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.35)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-radial-gradient(circle at 85% 10%, rgba(255,255,255,.07) 0 6px, transparent 6px 18px)' }} />
        <div style={{ position: 'absolute', left: g.cw * 0.08, top: g.ch * 0.08, fontFamily: disp, fontWeight: 800, fontSize: g.base * 0.1, color: '#fff', letterSpacing: '-.01em' }}>Scratch & win</div>
        <div style={{ position: 'absolute', right: g.cw * 0.08, top: g.ch * 0.1, fontFamily: "'JetBrains Mono Variable', monospace", fontSize: g.base * 0.04, color: 'rgba(255,255,255,.8)', letterSpacing: '.12em' }}>No. 004 172</div>
        <div style={{ position: 'absolute', left: g.cw * 0.08, bottom: g.ch * 0.055, fontFamily: "'Inter Variable', Inter, sans-serif", fontSize: g.base * 0.038, color: 'rgba(255,255,255,.75)' }}>One code per visitor · valid 30 days</div>
      </div>
      {/* the prize under the foil */}
      <div
        style={{
          position: 'absolute',
          left: A.x,
          top: A.y,
          width: A.w,
          height: A.h,
          borderRadius: Math.min(A.w, A.h) * 0.08,
          background: 'linear-gradient(180deg,#fff8e8,#ffe9c2)',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          boxShadow: 'inset 0 2px 8px rgba(120,60,0,.25)',
        }}
      >
        <div style={{ transform: `scale(${pulse})` }}>
          <div style={{ fontFamily: disp, fontWeight: 900, fontSize: Math.min(A.h * 0.42, A.w * 0.2), lineHeight: 0.95, background: 'linear-gradient(180deg,#ff7a1f,#e0115f)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', letterSpacing: '-.03em' }}>
            50% OFF
          </div>
          <div style={{ fontFamily: "'Inter Variable', Inter, sans-serif", fontWeight: 600, fontSize: Math.min(A.h * 0.1, A.w * 0.045), color: '#7a3b12', marginTop: A.h * 0.04 }}>your first project · code LUCKY50</div>
        </div>
      </div>
      <canvas ref={fx2} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} role="img" aria-label="Silver scratch foil" />
      <button type="button" aria-label="Reveal the prize" onClick={() => fx.dispatch({ type: 'reset' })} style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, opacity: 0 }} />
    </Stage>
  );
}
