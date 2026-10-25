import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A grid of feature cards on a dark page. A soft light follows the pointer (a little behind,
 * on springs) and catches the card borders around it, so the edges glow across several cards
 * at once. Press to send a ring of light out across the grid. Idle, the light drifts on its own.
 */

const ITEMS = [
  { t: 'Instant', d: 'Edge rendering in under 50 ms.', i: 'M13 2 L4 14 H11 L10 22 L20 9 H13 Z' },
  { t: 'Secure', d: 'Keys never leave your device.', i: 'M12 2 L20 6 V12 C20 17 16 20.5 12 22 C8 20.5 4 17 4 12 V6 Z' },
  { t: 'Insights', d: 'Live metrics, zero setup.', i: 'M4 20 V10 M10 20 V4 M16 20 V13 M22 20 H2' },
  { t: 'Global', d: '300 cities, one network.', i: 'M12 2 A10 10 0 1 0 12.01 2 M2 12 H22 M12 2 C 8 6 8 18 12 22 C 16 18 16 6 12 2' },
  { t: 'Layers', d: 'Compose anything, nest freely.', i: 'M12 3 L22 8 L12 13 L2 8 Z M2 13 L12 18 L22 13 M2 17 L12 22 L22 17' },
  { t: 'Realtime', d: 'Every change, everywhere, now.', i: 'M3 12 H7 L10 4 L14 20 L17 12 H21' },
  { t: 'Cloud', d: 'Scale to zero, then to millions.', i: 'M7 18 H17 A4 4 0 0 0 17 10 A6 6 0 0 0 5.5 11 A3.5 3.5 0 0 0 7 18 Z' },
  { t: 'API', d: 'Typed, versioned, documented.', i: 'M8 6 L2 12 L8 18 M16 6 L22 12 L16 18 M14 4 L10 20' },
  { t: 'Private', d: 'Your data is yours alone.', i: 'M6 11 H18 V21 H6 Z M8.5 11 V7.5 A3.5 3.5 0 0 1 15.5 7.5 V11' },
  { t: 'Teams', d: 'Roles, reviews and history.', i: 'M9 11 A3.5 3.5 0 1 0 9 4 A3.5 3.5 0 1 0 9 11 M2 20 C2 15 16 15 16 20 M16 4.5 A3 3 0 0 1 16 10.5 M19 15 C21 16 22 17.5 22 20' },
  { t: 'Offline', d: 'Works on a plane, syncs on land.', i: 'M2 9 C 8 3 16 3 22 9 M5 12.5 C 9 9 15 9 19 12.5 M8.5 16 C 10.5 14.5 13.5 14.5 15.5 16 M12 19.5 V19.6' },
  { t: 'Themes', d: 'Light, dark, and everything else.', i: 'M12 3 A9 9 0 1 0 12 21 A9 9 0 0 1 12 3 Z' },
];

interface S {
  lx: Spring;
  ly: Spring;
  glow: Spring; // overall light strength
  rings: { x: number; y: number; r: number }[]; // press shockwaves, radius grows over time
  idle: number;
  t: number;
}

function grid(w: number, h: number) {
  const land = w / h;
  const cols = land > 1.5 ? 4 : land > 0.8 ? 3 : 2;
  const rows = Math.min(Math.ceil(ITEMS.length / cols), land > 0.8 ? 3 : 6);
  const m = Math.min(w, h) * 0.06;
  const gap = Math.min(w, h) * 0.022;
  const cw = (w - m * 2 - gap * (cols - 1)) / cols;
  const ch = (h - m * 2 - gap * (rows - 1)) / rows;
  const cells = Array.from({ length: cols * rows }, (_, i) => ({ x: m + (i % cols) * (cw + gap), y: m + Math.floor(i / cols) * (ch + gap), w: cw, h: ch }));
  return { cells, R: Math.min(w, h) * 0.42 };
}

export const sim = defineSim<S>({
  init: (w, h) => ({ lx: sp(w * 0.3), ly: sp(h * 0.3), glow: sp(0.6), rings: [], idle: 3, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    // idle: the light drifts on a slow Lissajous path across the grid
    const auto = s.idle > 2;
    const tx = auto ? f.w * (0.5 + 0.36 * Math.sin(s.t * 0.55)) : f.p.x;
    const ty = auto ? f.h * (0.5 + 0.32 * Math.sin(s.t * 0.9 + 1)) : f.p.y;
    spring(s.lx, tx, 60, 13, f.dt);
    spring(s.ly, ty, 60, 13, f.dt);
    spring(s.glow, (f.p.over || auto ? 1 : 0.35) + (f.p.down ? 0.35 : 0), 120, 14, f.dt);
    if (f.pressed) {
      s.rings.push({ x: f.p.x, y: f.p.y, r: 0 });
      s.glow.v += 6;
      f.emit({ name: 'zap', gain: 0.35, rate: 1.3 });
    }
    if (auto && Math.floor((s.t - f.dt) / 3.2) !== Math.floor(s.t / 3.2)) s.rings.push({ x: s.lx.x, y: s.ly.x, r: 0 });
    const maxR = Math.hypot(f.w, f.h);
    for (const r of s.rings) r.r += f.dt * maxR * (f.reduced ? 0.6 : 0.9);
    s.rings = s.rings.filter((r) => r.r < maxR);
  },
});

/** an SVG path of rounded rectangles (used to clip the shared light layers to the cards) */
function roundRects(cells: { x: number; y: number; w: number; h: number }[], inset: number, r: number) {
  return cells
    .map(({ x, y, w, h }) => {
      const a = x + inset;
      const b = y + inset;
      const c = x + w - inset;
      const d = y + h - inset;
      const q = Math.max(0, r - inset);
      return `M${a + q} ${b}H${c - q}Q${c} ${b} ${c} ${b + q}V${d - q}Q${c} ${d} ${c - q} ${d}H${a + q}Q${a} ${d} ${a} ${d - q}V${b + q}Q${a} ${b} ${a + q} ${b}Z`;
    })
    .join('');
}

export default function SpotlightGrid() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const { cells, R } = grid(w, h);
  const lx = s.lx.x;
  const ly = s.ly.x;
  const g = clamp(s.glow.x, 0, 1.6);
  const g1 = Math.min(1, g);
  const u = Math.min(w, h) / 100;
  const maxR = Math.hypot(w, h);
  const rad = u * 2.4;
  const bw = 1.5; // border width
  // one light for the whole page, clipped to the card outlines (the borders) and, dimmer, to the
  // card bodies. The light blobs have fixed gradients and only move (compositor-only transforms).
  const outer = roundRects(cells, 0, rad);
  const blob = (size: number, bg: string, op: number) => (
    <div style={{ position: 'absolute', left: 0, top: 0, width: size * 2, height: size * 2, borderRadius: '50%', background: bg, opacity: op, transform: `translate(${(lx - size).toFixed(1)}px, ${(ly - size).toFixed(1)}px)`, willChange: 'transform, opacity' }} />
  );

  return (
    <Stage fx={fx} style={{ background: '#07080c' }}>
      {/* the page itself: a dot grid that also catches the light */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1.4px)', backgroundSize: `${u * 3}px ${u * 3}px` }} />
      {blob(R * 1.6, 'radial-gradient(closest-side, rgba(110,130,255,0.2), rgba(170,80,255,0.06) 57%, transparent 100%)', Math.min(1.4, g))}
      {/* the press shockwave, faint on the page itself */}
      {s.rings.map((r, k) => (
        <div key={k} style={{ position: 'absolute', left: r.x - maxR, top: r.y - maxR, width: maxR * 2, height: maxR * 2, borderRadius: '50%', boxSizing: 'border-box', border: `${u * 1.2}px solid rgba(160,170,255,${(0.35 * (1 - r.r / maxR)).toFixed(3)})`, transform: `scale(${(r.r / maxR).toFixed(4)})`, willChange: 'transform' }} />
      ))}
      {/* borders: the light seen through a thin rim around every card */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `path('${outer}')`, background: 'rgba(255,255,255,0.07)' }}>
        {blob(R, 'radial-gradient(closest-side, rgba(200,225,255,1), rgba(120,110,255,0.75) 44%, rgba(190,70,255,0.3) 75%, transparent 100%)', g1)}
        {s.rings.map((r, k) => {
          const fade = 1 - r.r / maxR;
          return <div key={k} style={{ position: 'absolute', left: r.x - maxR, top: r.y - maxR, width: maxR * 2, height: maxR * 2, borderRadius: '50%', boxSizing: 'border-box', border: `${u * 3}px solid rgba(215,225,255,${fade.toFixed(3)})`, boxShadow: `inset 0 0 ${u * 6}px ${u * 2}px rgba(170,150,255,${(fade * 0.8).toFixed(3)})`, transform: `scale(${(r.r / maxR).toFixed(4)})`, willChange: 'transform' }} />;
        })}
      </div>
      {cells.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: c.x + bw, top: c.y + bw, width: c.w - bw * 2, height: c.h - bw * 2, borderRadius: rad - bw, background: 'linear-gradient(180deg,#11131b,#0b0c12)' }} />
      ))}
      {/* a faint wash of the same light inside the cards */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `path('${roundRects(cells, bw, rad)}')` }}>{blob(R * 0.9, 'radial-gradient(closest-side, rgba(130,140,255,0.16), transparent 100%)', g)}</div>
      {cells.map((c, i) => {
        const it = ITEMS[i % ITEMS.length];
        const dx = clamp(lx, c.x, c.x + c.w) - lx;
        const dy = clamp(ly, c.y, c.y + c.h) - ly;
        const near = clamp(1 - Math.hypot(dx, dy) / R) * g;
        const pad = Math.min(c.w, c.h) * 0.12;
        return (
          <div key={i} style={{ position: 'absolute', left: c.x + pad, top: c.y + pad, width: c.w - pad * 2 }}>
            <svg width={u * 5.4} height={u * 5.4} viewBox="0 0 24 24" fill="none" stroke={`rgba(${Math.round(170 + near * 85)},${Math.round(175 + near * 70)},255,${0.55 + near * 0.45})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', filter: near > 0.05 ? `drop-shadow(0 0 ${(near * u).toFixed(1)}px rgba(140,150,255,${near.toFixed(2)}))` : undefined }}>
              <path d={it.i} />
            </svg>
            <div style={{ fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 700, fontSize: u * 3.4, color: '#eef0ff', marginTop: u * 2 }}>{it.t}</div>
            <div style={{ fontFamily: "'Inter Variable', Inter, system-ui", fontSize: u * 2.3, lineHeight: 1.45, color: 'rgba(200,205,230,0.55)', marginTop: u * 0.8 }}>{it.d}</div>
          </div>
        );
      })}
    </Stage>
  );
}
