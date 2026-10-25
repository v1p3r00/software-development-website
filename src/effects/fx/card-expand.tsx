import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, lerp, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * A grid of project tiles. Click one: the same tile grows into the full detail view in one
 * spring-driven motion (its art becomes the header, its title slides into place and grows,
 * the body text cascades in). The other tiles sink back and dim. Click again to fold it home.
 */

const TILES = [
  { name: 'Aurora', tag: 'Brand system', c: ['#ff7eb3', '#7a5cff', '#21114a'] },
  { name: 'Monolith', tag: 'Architecture', c: ['#d9d4c7', '#7d7468', '#2a2622'] },
  { name: 'Tide', tag: 'Mobile app', c: ['#7af0ff', '#2d7bff', '#0a1c4a'] },
  { name: 'Ember', tag: 'Motion study', c: ['#ffd36e', '#ff5e3a', '#4a0f12'] },
  { name: 'Bloom', tag: 'Packaging', c: ['#c6ff8a', '#2fbf71', '#0b3324'] },
  { name: 'Drift', tag: 'Web experience', c: ['#ffb3f2', '#a855f7', '#1e0b3a'] },
];

interface S {
  open: number; // the tile that is (or was last) open
  want: boolean; // whether it should be open
  p: Spring; // 0 = tile, 1 = detail view
  idle: number;
  demoClock: number;
  demoNext: number;
  t: number;
}

function layout(w: number, h: number) {
  const cols = w >= h ? 3 : 2;
  const rows = TILES.length / cols;
  const m = Math.min(w, h) * 0.07;
  const gap = Math.min(w, h) * 0.035;
  const tw = (w - m * 2 - gap * (cols - 1)) / cols;
  const th = (h - m * 2 - gap * (rows - 1)) / rows;
  const tiles = TILES.map((_, i) => ({ x: m + (i % cols) * (tw + gap), y: m + Math.floor(i / cols) * (th + gap), w: tw, h: th }));
  const dm = Math.min(w, h) * 0.05;
  const dw = Math.min(w - dm * 2, h * 1.1);
  const detail = { x: (w - dw) / 2, y: dm, w: dw, h: h - dm * 2 };
  return { tiles, detail };
}

export const sim = defineSim<S>({
  init: () => ({ open: 0, want: false, p: sp(), idle: 0, demoClock: 0, demoNext: 0, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    const { tiles } = layout(f.w, f.h);
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    if (f.pressed) {
      if (s.want) {
        s.want = false;
        f.emit({ name: 'swoosh', gain: 0.5, rate: 0.95 });
      } else if (s.p.x < 0.35) {
        const i = tiles.findIndex((r) => f.p.x > r.x && f.p.x < r.x + r.w && f.p.y > r.y && f.p.y < r.y + r.h);
        if (i >= 0) {
          s.open = i;
          s.want = true;
          f.emit({ name: 'whoosh', gain: 0.55, rate: 1.05 });
        }
      }
    }
    // self-demo: open a tile, linger, close it, move on to the next one
    if (s.idle > 2.5) {
      s.demoClock += f.dt;
      if (s.demoClock > s.demoNext) {
        if (s.want) {
          s.want = false;
          s.demoNext = s.demoClock + 0.9;
          f.emit({ name: 'swoosh', gain: 0.4 });
        } else {
          s.open = (s.open + 1) % TILES.length;
          s.want = true;
          s.demoNext = s.demoClock + 1.9;
          f.emit({ name: 'whoosh', gain: 0.45 });
        }
      }
    } else {
      s.demoClock = 0;
      s.demoNext = 0.3;
    }
    // a soft spring with a little overshoot: the card "lands" in its new size
    spring(s.p, s.want ? 1 : 0, 150, f.reduced ? 28 : 17, f.dt);
  },
});

function Art({ c, uid, k }: { c: string[]; uid: string; k: number }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`bg${uid}${k}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c[1]} />
          <stop offset="1" stopColor={c[2]} />
        </linearGradient>
        <radialGradient id={`gl${uid}${k}`} cx="30%" cy="30%" r="60%">
          <stop offset="0" stopColor={c[0]} stopOpacity="0.95" />
          <stop offset="1" stopColor={c[0]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="100" fill={`url(#bg${uid}${k})`} />
      <circle cx={50 + k * 9} cy={40 - (k % 2) * 8} r="46" fill={`url(#gl${uid}${k})`} />
      <circle cx={112 - k * 5} cy={62} r={20 + (k % 3) * 5} fill={c[0]} opacity="0.85" />
      <circle cx={112 - k * 5} cy={62} r={20 + (k % 3) * 5} fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.6" />
      <path d={`M0 ${78 - k} C 40 ${60 + k * 2} 80 ${96} 160 ${70 + k}`} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
    </svg>
  );
}

export default function CardExpand() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { tiles, detail } = layout(w, h);
  const p = s.p.x;
  const pc = clamp(p);
  const i0 = s.open;
  const a = tiles[i0];
  const d = detail;
  // the growing card: every edge travels from the tile to the detail rect
  const rx = lerp(a.x, d.x, p);
  const ry = lerp(a.y, d.y, p);
  const rw = lerp(a.w, d.w, p);
  const rh = lerp(a.h, d.h, p);
  const unit = Math.min(w, h) / 100;
  const pad = lerp(unit * 3.2, unit * 5.5, pc);
  const headH = lerp(a.h, d.h * (d.h > d.w ? 0.5 : 0.42), p);
  const tSize = lerp(unit * 5, unit * 9, p);
  const tTop = lerp(a.h - pad - tSize * 1.9, headH + pad, smooth(pc));
  const body = (k: number) => smooth((pc - 0.55 - k * 0.07) / 0.3);
  const tileText = (i: number) => (
    <div style={{ position: 'absolute', left: unit * 3.2, bottom: unit * 3.2, color: '#fff' }}>
      <div style={{ fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: unit * 5, lineHeight: 1 }}>{TILES[i].name}</div>
      <div style={{ fontFamily: "'Inter Variable', Inter, system-ui", fontSize: unit * 2.6, opacity: 0.8, marginTop: unit * 0.9 }}>{TILES[i].tag}</div>
    </div>
  );
  const shade = 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)';

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(100% 90% at 50% 0%, #20232e 0%, #111319 60%, #0a0b0f 100%)' }}>
      {tiles.map((r, i) => {
        const isOpen = i === i0 && p > 0.002;
        // the rest of the grid sinks away and dims while a card is open
        const sink = isOpen ? 0 : pc;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              borderRadius: unit * 3,
              overflow: 'hidden',
              opacity: isOpen ? 0 : 1 - sink * 0.55,
              transform: `scale(${1 - sink * 0.06})`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            <Art c={TILES[i].c} uid={uid} k={i} />
            <div style={{ position: 'absolute', inset: 0, background: shade }} />
            {tileText(i)}
          </div>
        );
      })}
      {/* the backdrop darkens under the open card */}
      <div style={{ position: 'absolute', inset: 0, background: '#06070a', opacity: pc * 0.45, pointerEvents: 'none' }} />
      {p > 0.002 && (
        <div
          style={{
            position: 'absolute',
            left: rx,
            top: ry,
            width: rw,
            height: rh,
            borderRadius: lerp(unit * 3, unit * 4, pc),
            overflow: 'hidden',
            background: '#15171f',
            boxShadow: `0 ${unit * (2 + pc * 4)}px ${unit * (6 + pc * 10)}px rgba(0,0,0,${0.35 + pc * 0.3}), 0 0 0 1px rgba(255,255,255,0.08)`,
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, width: rw, height: headH }}>
            <Art c={TILES[i0].c} uid={uid + 'x'} k={i0} />
            <div style={{ position: 'absolute', inset: 0, background: shade, opacity: 1 - pc }} />
          </div>
          <div style={{ position: 'absolute', left: pad, top: tTop, right: pad, color: '#fff' }}>
            <div style={{ fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: tSize, lineHeight: 1, letterSpacing: -tSize * 0.02 }}>{TILES[i0].name}</div>
            <div style={{ fontFamily: "'Inter Variable', Inter, system-ui", fontSize: lerp(unit * 2.6, unit * 3, pc), opacity: 0.75, marginTop: lerp(unit * 0.9, unit * 1.6, pc), color: TILES[i0].c[0] }}>{TILES[i0].tag} · 2026</div>
            <p style={{ fontFamily: "'Inter Variable', Inter, system-ui", fontSize: unit * 3, lineHeight: 1.5, color: 'rgba(230,233,245,0.78)', marginTop: unit * 3, opacity: body(0), transform: `translateY(${(1 - body(0)) * unit * 3}px)`, maxWidth: unit * 90 }}>
              A study in light and rhythm: a living identity that adapts to every surface, from print to motion.
            </p>
            <div style={{ display: 'flex', gap: unit * 1.6, marginTop: unit * 3, opacity: body(1), transform: `translateY(${(1 - body(1)) * unit * 3}px)` }}>
              {['12 screens', '4 weeks', 'Figma · React'].map((t) => (
                <span key={t} style={{ fontFamily: "'Inter Variable', Inter, system-ui", fontSize: unit * 2.4, padding: `${unit * 0.8}px ${unit * 1.8}px`, borderRadius: unit * 4, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', whiteSpace: 'nowrap' }}>
                  {t}
                </span>
              ))}
            </div>
            <div style={{ marginTop: unit * 3.4, opacity: body(2), transform: `translateY(${(1 - body(2)) * unit * 3}px)`, display: 'inline-block', padding: `${unit * 1.4}px ${unit * 3.2}px`, borderRadius: unit * 5, background: TILES[i0].c[0], color: '#111', fontFamily: "'Inter Variable', Inter, system-ui", fontWeight: 700, fontSize: unit * 2.8 }}>
              View case study →
            </div>
          </div>
          {/* close affordance */}
          <div style={{ position: 'absolute', right: unit * 3, top: unit * 3, width: unit * 6, height: unit * 6, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', opacity: body(0), color: '#fff', display: 'grid', placeItems: 'center', fontSize: unit * 3.4, fontFamily: "'Inter Variable', Inter, system-ui" }}>✕</div>
        </div>
      )}
      {tiles.map((r, i) => (
        <button key={i} type="button" aria-label={`Open ${TILES[i].name}`} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: 0 }} tabIndex={s.want ? -1 : 0} />
      ))}
    </Stage>
  );
}
