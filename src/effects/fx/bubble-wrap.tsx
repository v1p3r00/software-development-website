import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * Bubble wrap you can pop. Hold a bubble: it squashes as the pressure builds, then pops flat
 * with a crinkle. Drag across the sheet to pop a row. A fresh sheet slides in when it's done.
 */

interface Bubble {
  x: number;
  y: number;
  p: number; // pressure 0..1
  popped: number; // seconds since the pop, -1 = intact
  seed: number;
  wob: number; // a small wobble after release
  wv: number;
}

interface S {
  bubbles: Bubble[];
  R: number;
  puffs: { x: number; y: number; a: number; t: number }[];
  idle: number;
  ghost: { x: number; y: number; t: number; target: number };
  refill: number; // >0 while a new sheet slides in
  count: number;
}

function build(w: number, h: number, rand: () => number) {
  const m = Math.min(w, h);
  const R = clamp(m * (h > w * 1.2 ? 0.1 : 0.072), 14, 64);
  const dx = R * 2.18;
  const dy = dx * 0.866;
  const cols = Math.floor((w - R * 0.6) / dx);
  const rows = Math.floor((h - R * 0.6) / dy);
  const ox = (w - (cols - 1) * dx) / 2;
  const oy = (h - (rows - 1) * dy) / 2;
  const bubbles: Bubble[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols - (r % 2 ? 1 : 0); c++)
      bubbles.push({ x: ox + c * dx + (r % 2 ? dx / 2 : 0), y: oy + r * dy, p: 0, popped: -1, seed: rand(), wob: 0, wv: 0 });
  return { bubbles, R };
}

export const sim = defineSim<S>({
  init(w, h, rand) {
    const { bubbles, R } = build(w, h, rand);
    return { bubbles, R, puffs: [], idle: 0, ghost: { x: w / 2, y: h / 2, t: 0, target: -1 }, refill: 0, count: 0 };
  },
  step(s, f) {
    let px = f.p.x;
    let py = f.p.y;
    let down = f.p.down;
    if (f.p.down) s.idle = 0;
    else s.idle += f.dt;
    // the gallery's ghost finger pops a bubble every so often
    if (f.live && s.idle > 2.5 && s.refill <= 0) {
      const gh = s.ghost;
      gh.t += f.dt;
      if (gh.target < 0 || s.bubbles[gh.target].popped >= 0) {
        const left = s.bubbles.map((b, i) => (b.popped < 0 ? i : -1)).filter((i) => i >= 0);
        gh.target = left.length ? left[Math.floor(f.rand() * left.length)] : -1;
        gh.t = 0;
      }
      if (gh.target >= 0) {
        const b = s.bubbles[gh.target];
        gh.x += (b.x - gh.x) * Math.min(1, f.dt * 10);
        gh.y += (b.y - gh.y) * Math.min(1, f.dt * 10);
        px = gh.x;
        py = gh.y;
        down = gh.t > 0.35;
      }
    }
    const R = s.R;
    for (const b of s.bubbles) {
      const under = down && (px - b.x) ** 2 + (py - b.y) ** 2 < R * R * 1.2;
    const speed = Math.hypot(f.p.vx, f.p.vy) / R;
      if (b.popped >= 0) {
        b.popped += f.dt;
        continue;
      }
      if (under) {
        // pressure builds; a firm press pops in about a fifth of a second
        b.p = Math.min(1, b.p + f.dt * (5.5 + b.seed * 2 + Math.min(40, speed * 1.2)));
        if (b.p >= 1) {
          b.popped = 0;
          s.count++;
          f.emit({ name: 'pop', gain: 0.75 + b.seed * 0.25, rate: 0.85 + b.seed * 0.4, pan: (b.x / f.w - 0.5) * 0.8 });
          for (let k = 0; k < 5; k++) s.puffs.push({ x: b.x, y: b.y, a: (k / 5) * Math.PI * 2 + b.seed * 3, t: 0 });
        }
      } else if (b.p > 0) {
        // let go before it popped: it springs back with a wobble
        b.wv += b.p * 30;
        b.p = Math.max(0, b.p - f.dt * 8);
      }
      b.wv += -b.wob * 600 * f.dt - b.wv * 14 * f.dt;
      b.wob += b.wv * f.dt;
    }
    for (const p of s.puffs) p.t += f.dt;
    s.puffs = s.puffs.filter((p) => p.t < 0.35);
    // all popped (or most, in the gallery): a fresh sheet
    const intact = s.bubbles.filter((b) => b.popped < 0).length;
    if (s.refill <= 0 && (intact === 0 || (f.live && intact < s.bubbles.length * 0.25 && s.idle > 2.5))) {
      s.refill = 0.0001;
      f.emit({ name: 'rustle', gain: 0.5 });
    }
    if (s.refill > 0) {
      s.refill += f.dt;
      if (s.refill > 0.45 && s.bubbles.some((b) => b.popped >= 0)) {
        for (const b of s.bubbles) {
          b.popped = -1;
          b.p = 0;
        }
        s.count = 0;
      }
      if (s.refill > 0.9) s.refill = 0;
    }
  },
});

export default function BubbleWrap() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    const W = Math.round(w * dpr);
    const H = Math.round(h * dpr);
    if (cv.width !== W || cv.height !== H) {
      cv.width = W;
      cv.height = H;
    }
    const g = cv.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the desk
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#ff7a3d');
    bg.addColorStop(1, '#d9431a');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    const R = s.R;
    // the sheet slides away and a new one in while refilling
    const rf = s.refill;
    const slide = rf > 0 ? (rf < 0.45 ? -((rf / 0.45) ** 2) : (1 - (rf - 0.45) / 0.45) ** 2) * w * 1.1 : 0;
    g.save();
    g.translate(slide, 0);
    // the plastic film between the bubbles
    g.fillStyle = 'rgba(220,240,255,.10)';
    g.fillRect(0, 0, w, h);
    for (const b of s.bubbles) {
      const seedRot = b.seed * Math.PI * 2;
      if (b.popped >= 0) {
        // flattened, crinkled plastic
        const k = Math.min(1, b.popped / 0.08);
        const rr = R * (1.02 - 0.1 * k);
        g.beginPath();
        for (let i = 0; i <= 14; i++) {
          const a = (i / 14) * Math.PI * 2 + seedRot;
          const n = 1 + Math.sin(a * 5 + b.seed * 20) * 0.05 * k + Math.sin(a * 9 + b.seed * 7) * 0.03 * k;
          const x = b.x + Math.cos(a) * rr * n;
          const y = b.y + Math.sin(a) * rr * n;
          if (i) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.closePath();
        g.fillStyle = 'rgba(120,30,0,.16)';
        g.fill();
        g.strokeStyle = 'rgba(255,230,210,.22)';
        g.lineWidth = 1;
        g.stroke();
        // creases
        g.strokeStyle = `rgba(255,240,230,${0.5 * k})`;
        g.lineWidth = Math.max(1, R * 0.03);
        g.beginPath();
        for (let c = 0; c < 3; c++) {
          const a = seedRot + c * 2.1;
          g.moveTo(b.x + Math.cos(a) * R * 0.15, b.y + Math.sin(a) * R * 0.15);
          g.lineTo(b.x + Math.cos(a + 0.4) * R * 0.75, b.y + Math.sin(a + 0.4) * R * 0.75);
        }
        g.stroke();
        continue;
      }
      const p = b.p;
      const sq = 1 + p * 0.1 + b.wob * 0.02;
      const rr = R * sq;
      // shadow on the desk
      g.fillStyle = `rgba(90,20,0,${0.28 - p * 0.12})`;
      g.beginPath();
      g.ellipse(b.x + R * 0.18, b.y + R * 0.24, rr * 0.98, rr * 0.92, 0, 0, Math.PI * 2);
      g.fill();
      // the dome: clear plastic, brighter at the rim
      const gr = g.createRadialGradient(b.x - R * 0.2, b.y - R * 0.25, R * 0.1, b.x, b.y, rr);
      gr.addColorStop(0, `rgba(255,255,255,${0.1 + p * 0.06})`);
      gr.addColorStop(0.7, `rgba(210,235,255,${0.12 + p * 0.1})`);
      gr.addColorStop(0.92, `rgba(235,248,255,${0.55 + p * 0.2})`);
      gr.addColorStop(1, 'rgba(255,255,255,.12)');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(b.x, b.y, rr, 0, Math.PI * 2);
      g.fill();
      // darker core under pressure (the dome flattens)
      if (p > 0.02) {
        g.fillStyle = `rgba(120,30,0,${p * 0.22})`;
        g.beginPath();
        g.arc(b.x, b.y, rr * 0.55 * p, 0, Math.PI * 2);
        g.fill();
      }
      // speculars: a window highlight and a small bounce
      g.fillStyle = `rgba(255,255,255,${0.85 - p * 0.4})`;
      g.beginPath();
      g.ellipse(b.x - R * 0.36, b.y - R * 0.4, R * 0.24 * (1 - p * 0.4), R * 0.13 * (1 - p * 0.5), -0.6, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)';
      g.beginPath();
      g.arc(b.x + R * 0.42, b.y + R * 0.4, R * 0.07, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,.28)';
      g.lineWidth = Math.max(1, R * 0.04);
      g.beginPath();
      g.arc(b.x, b.y, rr * 0.97, Math.PI * 0.9, Math.PI * 1.55);
      g.stroke();
    }
    // puffs of air from each pop
    for (const p of s.puffs) {
      const k = p.t / 0.35;
      const d0 = R * (0.6 + k * 0.9);
      const d1 = R * (0.9 + k * 1.1);
      g.strokeStyle = `rgba(255,255,255,${(1 - k) * 0.8})`;
      g.lineWidth = Math.max(1.2, R * 0.05);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(p.x + Math.cos(p.a) * d0, p.y + Math.sin(p.a) * d0);
      g.lineTo(p.x + Math.cos(p.a) * d1, p.y + Math.sin(p.a) * d1);
      g.stroke();
    }
    g.restore();
    // counter
    g.font = `600 ${Math.max(11, Math.min(w, h) * 0.028)}px "JetBrains Mono Variable", ui-monospace, monospace`;
    g.fillStyle = 'rgba(255,255,255,.75)';
    g.textAlign = 'right';
    g.textBaseline = 'top';
    g.fillText(`POPPED ${String(s.count).padStart(2, '0')}/${s.bubbles.length}`, w - 14, 12);
  });

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#d9431a' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} role="img" aria-label="A sheet of bubble wrap" />
    </Stage>
  );
}
