import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Live-stream reactions. Tap a reaction (or hold to spray): it pops out of the button with an
 * overshooting scale, then rises like a little balloon: buoyancy up, air drag, and a sideways
 * sway whose amplitude grows as it climbs (it gets pushed around more the further it drifts).
 * Each one tilts into its sway, and fades out near the top. The rest of the audience reacts too,
 * so the stream never looks dead.
 */

const EMO = ['❤️', '😂', '😮', '👏', '🔥'];
const CHAT = [
  ['anna.k', 'this drop 🔥🔥'],
  ['dev_bence', 'how is this real-time??'],
  ['lili', 'from Budapest 👋'],
  ['marco', 'turn it up!!'],
  ['zsofi', 'the lights omg'],
  ['tom_h', 'best set this year'],
];

interface P {
  e: number;
  x0: number;
  y: number;
  vy: number;
  ph: number;
  fq: number;
  amp: number;
  sz: number;
  pop: Spring;
  age: number;
  mine: boolean;
}
interface S {
  ps: P[];
  btn: Spring[];
  held: number; // which button is held, -1 none
  holdT: number;
  crowd: number;
  idle: number;
  viewers: number;
  t: number;
}

function geom(w: number, h: number) {
  const u = clamp(Math.min(w / 480, h / 480), 0.6, 2.2);
  const bs = 46 * u, gap = 8 * u;
  const n = EMO.length;
  const bw = n * bs + (n - 1) * gap;
  const bx0 = w - bw - 18 * u;
  const by = h - bs / 2 - 18 * u;
  return { u, bs, gap, bx0, by, colX: w - 18 * u - bw * 0.35 };
}
const btnX = (G: ReturnType<typeof geom>, i: number) => G.bx0 + i * (G.bs + G.gap) + G.bs / 2;

export const sim = defineSim<S>({
  init: () => ({ ps: [], btn: EMO.map(() => sp()), held: -1, holdT: 0, crowd: 0, idle: 1.5, viewers: 2418, t: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const G = geom(w, h);
    s.t += dt;
    const spawn = (e: number, x: number, mine: boolean) => {
      s.ps.push({
        e, x0: x, y: G.by - G.bs * 0.4, vy: -(60 + f.rand() * 60) * G.u,
        ph: f.rand() * 6.28, fq: 1.6 + f.rand() * 1.6, amp: (14 + f.rand() * 22) * G.u,
        sz: (mine ? 34 : 24 + f.rand() * 8) * G.u, pop: sp(0), age: 0, mine,
      });
      if (s.ps.length > 140) s.ps.splice(0, s.ps.length - 140);
    };
    let hit = -1;
    for (let i = 0; i < EMO.length; i++) if (Math.abs(p.x - btnX(G, i)) < G.bs / 2 + 3 && Math.abs(p.y - G.by) < G.bs / 2 + 3) hit = i;
    s.idle = p.down ? 0 : s.idle + dt;
    const tap = (i: number) => {
      spawn(i, btnX(G, i), true);
      s.btn[i].v -= 9;
      f.emit({ name: 'pop', gain: 0.45, rate: 0.9 + i * 0.08 + f.rand() * 0.1, pan: (btnX(G, i) / w) * 2 - 1 });
    };
    for (const a of f.actions) if (a.type === 'react') tap(a.i as number);
    if (f.pressed && hit >= 0) {
      s.held = hit;
      s.holdT = 0;
      tap(hit);
    }
    if (s.held >= 0) {
      s.holdT += dt;
      // holding sprays: faster and faster
      const rate = Math.min(14, 4 + s.holdT * 8);
      if (s.holdT > 0.25 && f.rand() < rate * dt) tap(s.held);
      if (!p.down) s.held = -1;
    }
    // the audience: a steady drizzle, with bursts; a ghost viewer taps when idle
    s.crowd += dt * (2.2 + 2 * Math.max(0, Math.sin(s.t * 0.7)) ** 3);
    while (s.crowd > 1) {
      s.crowd -= 1;
      spawn(Math.floor(f.rand() * EMO.length), G.colX + (f.rand() - 0.5) * G.bs * 2, false);
    }
    if (s.idle > 2.5 && f.rand() < dt * 2.5) tap(s.t % 6 < 3 ? 0 : 4);
    if (f.rand() < dt * 1.5) s.viewers += Math.floor((f.rand() - 0.4) * 9);
    for (const b of s.btn) spring(b, 0, 600, 16, dt);
    for (const q of s.ps) {
      q.age += dt;
      // buoyancy against drag: settles at a gentle climb rate
      q.vy += (-(110 * G.u) - q.vy) * (1 - Math.exp(-1.2 * dt));
      q.y += q.vy * dt;
      spring(q.pop, 1, 260, 11, dt);
    }
    s.ps = s.ps.filter((q) => q.y > -60 * G.u);
  },
});

export default function EmojiFloat() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const G = geom(w, h);
  const u = G.u;
  const t = s.t;
  const font = "'Inter Variable', Inter, system-ui";
  const chatTop = Math.floor(t / 1.6);
  return (
    <Stage fx={fx} style={{ background: '#08060f' }}>
      {/* the "stream": a concert stage with sweeping lights */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(40% 60% at ${50 + 30 * Math.sin(t * 0.6)}% 0%, rgba(255,60,170,0.55), transparent 70%),
            radial-gradient(40% 60% at ${50 - 30 * Math.sin(t * 0.5 + 1)}% 0%, rgba(60,140,255,0.5), transparent 70%),
            radial-gradient(70% 40% at 50% 100%, rgba(255,150,40,${0.35 + 0.15 * Math.sin(t * 4) ** 2}), transparent 70%),
            linear-gradient(#1a0f2e, #0b0714)`,
        }}
      />
      {/* crowd silhouettes */}
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        {Array.from({ length: 22 }, (_, i) => {
          const x = (i / 21) * w;
          const bob = Math.abs(Math.sin(t * 4 + i * 1.7)) * 6 * u;
          const r = (18 + (i * 7) % 9) * u;
          return (
            <g key={i} fill="#05030a">
              <circle cx={x} cy={h - r * 2.6 - bob} r={r * 0.62} />
              <rect x={x - r} y={h - r * 2 - bob} width={r * 2} height={r * 3} rx={r * 0.8} />
            </g>
          );
        })}
        {(Math.floor(t * 2) % 3 === 0) && <rect width={w} height={h} fill="rgba(255,255,255,0.02)" />}
      </svg>
      {/* LIVE badge */}
      <div style={{ position: 'absolute', left: 16 * u, top: 16 * u, display: 'flex', gap: 8 * u, fontFamily: font, fontSize: 12 * u, fontWeight: 700 }}>
        <span style={{ background: '#ef4444', color: '#fff', padding: `${4 * u}px ${8 * u}px`, borderRadius: 6 * u, letterSpacing: 0.5 * u }}>● LIVE</span>
        <span style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', padding: `${4 * u}px ${8 * u}px`, borderRadius: 6 * u }}>👁 {(s.viewers / 1000).toFixed(1)}K</span>
      </div>
      {/* chat */}
      <div style={{ position: 'absolute', left: 16 * u, bottom: G.bx0 < 16 * u + Math.min(w * 0.5, 260 * u) + 10 * u ? G.bs + 34 * u : 16 * u, width: Math.min(w * 0.5, 260 * u), fontFamily: font, fontSize: 13 * u, color: '#fff', display: 'flex', flexDirection: 'column', gap: 6 * u }}>
        {[3, 2, 1, 0].map((k) => {
          const [n, m] = CHAT[(chatTop + 6 - k) % CHAT.length];
          const fade = k === 0 ? clamp(((t / 1.6) % 1) * 4) : 1;
          return (
            <div key={chatTop - k} style={{ opacity: (1 - k * 0.22) * fade, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              <b style={{ opacity: 0.75, marginRight: 6 * u }}>{n}</b>
              {m}
            </div>
          );
        })}
      </div>
      {/* the floating reactions */}
      {s.ps.map((q, i) => {
        const rise = clamp((G.by - q.y) / (h * 0.85));
        const amp = q.amp * (0.3 + rise);
        const sway = Math.sin(q.ph + q.age * q.fq);
        const x = q.x0 + sway * amp;
        const tilt = Math.cos(q.ph + q.age * q.fq) * 14 * (0.3 + rise);
        const op = clamp((1 - rise) * 2.2) * (q.mine ? 1 : 0.85);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: q.y,
              fontSize: q.sz,
              lineHeight: 1,
              transform: `translate(-50%,-50%) rotate(${tilt}deg) scale(${Math.max(0, q.pop.x) * (1 - rise * 0.25)})`,
              opacity: op,
              filter: q.mine ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' : undefined,
              pointerEvents: 'none',
            }}
          >
            {EMO[q.e]}
          </div>
        );
      })}
      {/* reaction buttons */}
      {EMO.map((e, i) => (
        <button
          key={e}
          type="button"
          aria-label={`React ${e}`}
          onKeyDown={(ev) => {
            if (ev.key === ' ' || ev.key === 'Enter') {
              ev.preventDefault();
              fx.dispatch({ type: 'react', i });
            }
          }}
          style={{
            position: 'absolute',
            left: btnX(G, i) - G.bs / 2,
            top: G.by - G.bs / 2,
            width: G.bs,
            height: G.bs,
            borderRadius: 99,
            border: '1px solid rgba(255,255,255,0.18)',
            background: s.held === i ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            fontSize: G.bs * 0.5,
            lineHeight: 1,
            padding: 0,
            transform: `scale(${1 + s.btn[i].x * 0.02})`,
            cursor: 'pointer',
          }}
        >
          {e}
        </button>
      ))}
    </Stage>
  );
}
