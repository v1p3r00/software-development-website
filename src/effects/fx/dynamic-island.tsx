import type { ReactNode } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * The black pill at the top of the screen that becomes whatever needs your attention: a timer,
 * an incoming call, the music player, a Face ID check, charging. Width, height and corner radius
 * each ride an under-damped spring, so the shape stretches past its target and settles like a
 * drop of ink; the old content blurs out first, the new content blurs in once the shape has
 * mostly arrived. Tap the island to step through notifications; left alone it cycles itself.
 */

// shape per state, in base px (scaled with the stage)
const SHAPES = [
  { w: 120, h: 36, r: 18 }, // idle
  { w: 236, h: 36, r: 18 }, // timer
  { w: 344, h: 78, r: 39 }, // call
  { w: 352, h: 158, r: 44 }, // music
  { w: 150, h: 150, r: 46 }, // face id
  { w: 300, h: 36, r: 18 }, // charging
];
const SEQ = [1, 2, 3, 4, 5, 0];

interface S {
  st: number; // current state
  W: Spring;
  H: Spring;
  R: Spring;
  bump: Spring; // a little scale kick on each morph
  op: number[]; // content visibility per state
  since: number; // seconds in the current state
  idle: number;
  seq: number;
  t: number;
}

const unit = (w: number, h: number) => clamp(Math.min(w / 420, h / 420), 0.7, 2.2);

export const sim = defineSim<S>({
  init: () => ({ st: 0, W: sp(120), H: sp(36), R: sp(18), bump: sp(), op: SHAPES.map((_, i) => (i === 0 ? 1 : 0)), since: 0, idle: 1.2, seq: SEQ.length - 1, t: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const u = unit(w, h);
    s.t += dt;
    s.since += dt;
    const go = (next: number) => {
      s.st = next;
      s.since = 0;
      s.bump.v += f.reduced ? 0.4 : 1.6;
      const names = ['click', 'tick', 'ding', 'whoosh', 'success', 'chime'];
      f.emit({ name: names[next], gain: next === 0 ? 0.25 : 0.5, rate: 1 });
    };
    // tap on the island
    const cx = w / 2, top = 14 * u;
    const onIsland = Math.abs(p.x - cx) < (s.W.x * u) / 2 + 8 && p.y > top - 8 && p.y < top + s.H.x * u + 8;
    const tapped = (f.pressed && onIsland) || f.actions.some((a) => a.type === 'next');
    if (tapped) {
      s.idle = 0;
      s.seq = (s.seq + 1) % SEQ.length;
      go(SEQ[s.seq]);
    } else s.idle += dt;
    // self-demo: step on every ~2.6 s (the big ones linger a little longer)
    const hold = s.st === 3 ? 3.4 : s.st === 0 ? 1.4 : 2.4;
    if (s.idle > 2.5 && s.since > hold) {
      s.seq = (s.seq + 1) % SEQ.length;
      go(SEQ[s.seq]);
    }
    const T = SHAPES[s.st];
    // bouncy: low damping on size, a little more on the radius
    const k = 190, d = 15;
    spring(s.W, T.w, k, d, dt);
    spring(s.H, T.h, k, d * 1.05, dt);
    spring(s.R, T.r, k, d * 1.2, dt);
    spring(s.bump, 0, 260, 14, dt);
    // content: out fast, in only once the shape is ~70 % there
    const close = 1 - clamp(Math.abs(s.W.x - T.w) / Math.max(40, Math.abs(T.w - 120)) + Math.abs(s.H.x - T.h) / 120);
    for (let i = 0; i < s.op.length; i++) {
      const want = i === s.st && close > 0.55 && s.since > 0.08 ? 1 : 0;
      const rate = want ? 9 : 22;
      s.op[i] += (want - s.op[i]) * (1 - Math.exp(-rate * dt));
    }
  },
});

function Bars({ t, n, col, h }: { t: number; n: number; col: string; h: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: h * 0.12, height: h }}>
      {Array.from({ length: n }, (_, i) => {
        const v = 0.3 + 0.7 * Math.abs(Math.sin(t * (5 + i * 1.7) + i * 1.3) * Math.sin(t * 2.1 + i));
        return <div key={i} style={{ width: h * 0.13, height: h * v, borderRadius: h, background: col }} />;
      })}
    </div>
  );
}

export default function DynamicIsland() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const u = unit(w, h);
  const W = s.W.x * u, H = s.H.x * u, R = Math.max(0, s.R.x) * u;
  const bump = 1 + s.bump.x * 0.025;
  const font = "'Inter Variable', Inter, system-ui";
  const t = s.t;
  const layer = (i: number, node: ReactNode) => {
    const o = s.op[i];
    if (o < 0.01) return null;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: o,
          filter: `blur(${((1 - o) * 6 * u).toFixed(2)}px)`,
          transform: `scale(${lerp(0.88, 1, o)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: SHAPES[i].w * u, height: SHAPES[i].h * u, transform: 'translate(-50%,-50%)' }}>{node}</div>
      </div>
    );
  };
  const pad = 14 * u;
  const time = 299 - Math.floor(t % 300);
  return (
    <Stage fx={fx} style={{ background: '#0b0b14' }}>
      {/* wallpaper: soft colour fields that drift */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(60% 50% at ${30 + 8 * Math.sin(t * 0.2)}% ${70 + 6 * Math.cos(t * 0.17)}%, #6d28d9 0%, transparent 70%),
            radial-gradient(55% 45% at ${75 + 6 * Math.cos(t * 0.15)}% ${40 + 8 * Math.sin(t * 0.22)}%, #db2777 0%, transparent 70%),
            radial-gradient(70% 60% at 50% 110%, #f59e0b 0%, transparent 60%), linear-gradient(#141428, #0b0b14)`,
          opacity: 0.85,
        }}
      />
      {/* lock screen */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: h * 0.44, textAlign: 'center', color: 'rgba(255,255,255,0.92)', fontFamily: "'Archivo Variable', Archivo, system-ui", textShadow: '0 2px 20px rgba(0,0,0,0.25)' }}>
        <div style={{ fontSize: 15 * u, fontFamily: font, fontWeight: 500, opacity: 0.8 }}>Saturday, 25 October</div>
        <div style={{ fontSize: 84 * u, fontWeight: 700, letterSpacing: -2 * u, lineHeight: 1.05 }}>9:41</div>
      </div>
      <div style={{ position: 'absolute', left: 24 * u, top: 20 * u, color: '#fff', fontFamily: font, fontWeight: 600, fontSize: 14 * u }}>9:41</div>
      <div style={{ position: 'absolute', right: 24 * u, top: 22 * u, display: 'flex', gap: 5 * u, alignItems: 'center' }}>
        {[0.45, 0.65, 0.85, 1].map((v, i) => (
          <div key={i} style={{ width: 3 * u, height: 10 * u * v, background: '#fff', borderRadius: 1 }} />
        ))}
        <div style={{ width: 22 * u, height: 11 * u, border: `${1.2 * u}px solid rgba(255,255,255,0.7)`, borderRadius: 3 * u, marginLeft: 4 * u, padding: 1.2 * u, boxSizing: 'border-box' }}>
          <div style={{ width: '82%', height: '100%', background: '#fff', borderRadius: 1.5 * u }} />
        </div>
      </div>

      {/* the island */}
      <div
        style={{
          position: 'absolute',
          left: w / 2 - W / 2,
          top: 14 * u,
          width: W,
          height: H,
          borderRadius: R,
          background: '#000',
          transform: `scale(${bump})`,
          transformOrigin: '50% 0%',
          boxShadow: `0 ${6 * u}px ${24 * u}px rgba(0,0,0,${0.25 + clamp((H / u - 36) / 120) * 0.3}), inset 0 0 0 ${0.8 * u}px rgba(255,255,255,0.06)`,
          overflow: 'hidden',
          color: '#fff',
          fontFamily: font,
          cursor: 'pointer',
        }}
      >
        {/* the camera lens, always there at the right of the pill */}
        <div style={{ position: 'absolute', right: 12 * u, top: 18 * u - 6 * u, width: 12 * u, height: 12 * u, borderRadius: 99, background: 'radial-gradient(circle at 35% 35%, #2a3550, #05070c 60%)', opacity: s.op[0] }} />
        {layer(
          1,
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: `0 ${pad}px` }}>
            <svg width={20 * u} height={20 * u} viewBox="0 0 20 20">
              <circle cx="10" cy="11" r="7.5" fill="none" stroke="#ff9f0a" strokeWidth="2" />
              <path d={`M10 11 L${10 + 6 * Math.sin((t % 60) / 60 * 6.283)} ${11 - 6 * Math.cos((t % 60) / 60 * 6.283)}`} stroke="#ff9f0a" strokeWidth="2" strokeLinecap="round" />
              <rect x="8" y="1" width="4" height="2" rx="1" fill="#ff9f0a" />
            </svg>
            <div style={{ color: '#ff9f0a', fontWeight: 600, fontSize: 17 * u, fontVariantNumeric: 'tabular-nums' }}>
              {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
            </div>
          </div>,
        )}
        {layer(
          2,
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: `0 ${pad}px`, gap: 12 * u }}>
            <div style={{ width: 48 * u, height: 48 * u, borderRadius: 99, background: 'linear-gradient(135deg,#f472b6,#8b5cf6)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 20 * u }}>M</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12 * u, color: 'rgba(255,255,255,0.55)' }}>mobile</div>
              <div style={{ fontSize: 17 * u, fontWeight: 600 }}>Mira Kovács</div>
            </div>
            {[
              ['#ff3b30', 'M5 12 Q12 6 19 12 L17 15 L14 13 L14 11 Q12 10 10 11 L10 13 L7 15 Z'],
              ['#34c759', 'M6 4 L9 4 L11 9 L9 11 Q10 14 13 15 L15 13 L20 15 L20 18 Q12 20 6 4 Z'],
            ].map(([c, d], i) => (
              <div key={i} style={{ width: 46 * u, height: 46 * u, borderRadius: 99, background: c, display: 'grid', placeItems: 'center', transform: i ? `rotate(${Math.sin(t * 18) * 6 * (Math.sin(t * 3) > 0.3 ? 1 : 0)}deg)` : undefined }}>
                <svg width={24 * u} height={24 * u} viewBox="0 0 24 24">
                  <path d={d} fill="#fff" />
                </svg>
              </div>
            ))}
          </div>,
        )}
        {layer(
          3,
          <div style={{ padding: `${16 * u}px ${18 * u}px`, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 * u }}>
              <div style={{ width: 54 * u, height: 54 * u, borderRadius: 12 * u, background: 'conic-gradient(from 200deg, #f97316, #db2777, #6d28d9, #0ea5e9, #f97316)', boxShadow: '0 4px 14px rgba(219,39,119,0.35)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16 * u, fontWeight: 600 }}>Midnight Drive</div>
                <div style={{ fontSize: 13 * u, color: 'rgba(255,255,255,0.55)' }}>Neon Harbour</div>
              </div>
              <Bars t={t} n={5} col="#f472b6" h={22 * u} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 * u, fontSize: 11 * u, color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>
              <span>1:{String(Math.floor(12 + (t % 40))).padStart(2, '0')}</span>
              <div style={{ flex: 1, height: 4 * u, borderRadius: 4, background: 'rgba(255,255,255,0.18)' }}>
                <div style={{ width: `${30 + ((t % 40) / 40) * 30}%`, height: '100%', borderRadius: 4, background: '#fff' }} />
              </div>
              <span>-2:08</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 34 * u, fontSize: 20 * u }}>
              <span>◀◀</span>
              <span style={{ letterSpacing: -2 * u }}>❙❙</span>
              <span>▶▶</span>
            </div>
          </div>,
        )}
        {layer(
          4,
          <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
            <svg width={80 * u} height={80 * u} viewBox="0 0 80 80">
              {/* a Face ID frame, then the check draws itself */}
              <g stroke={s.since > 0.9 ? '#34c759' : '#fff'} strokeWidth="4" fill="none" strokeLinecap="round">
                <path d="M8 24 V14 Q8 8 14 8 H24 M56 8 H66 Q72 8 72 14 V24 M72 56 V66 Q72 72 66 72 H56 M24 72 H14 Q8 72 8 66 V56" />
                {s.since > 0.9 ? (
                  <path d="M24 41 L35 52 L57 29" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp((s.since - 0.9) / 0.35)} strokeWidth="5" />
                ) : (
                  <g opacity={0.5 + 0.5 * Math.sin(s.since * 16)}>
                    <path d="M30 30 V34 M50 30 V34 M40 32 V44 Q40 46 37 46 M31 54 Q40 60 49 54" />
                  </g>
                )}
              </g>
            </svg>
          </div>,
        )}
        {layer(
          5,
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: `0 ${pad}px`, fontSize: 14 * u, fontWeight: 600 }}>
            <span style={{ color: '#34c759' }}>Charging</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 * u }}>
              <span style={{ color: '#34c759' }}>{Math.min(100, 82 + Math.floor(s.since * 2))}%</span>
              <span style={{ width: 26 * u, height: 13 * u, borderRadius: 4 * u, border: `${1.5 * u}px solid #34c759`, padding: 1.5 * u, boxSizing: 'border-box', display: 'inline-block' }}>
                <span style={{ display: 'block', width: '82%', height: '100%', borderRadius: 2 * u, background: '#34c759', boxShadow: '0 0 6px #34c759' }} />
              </span>
            </span>
          </div>,
        )}
      </div>
      <button
        type="button"
        aria-label="Show the next notification"
        style={{ position: 'absolute', left: w / 2 - W / 2, top: 14 * u, width: W, height: H, opacity: 0, borderRadius: R }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'next' });
          }
        }}
      />
    </Stage>
  );
}
