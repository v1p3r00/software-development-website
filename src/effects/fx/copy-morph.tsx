import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A copy button that answers. The front sheet of the copy icon is a closed outline of 64 points;
 * the check mark is the same 64 points walking along the tick and back again. A spring blends
 * one into the other, so the square visibly folds itself into the check (and overshoots a hair:
 * the pop), while the back sheet slides away, the button flushes green, sparks fly and a
 * "Copied" tag hops up. After a beat it all folds back. Idle, it copies itself every few seconds.
 */

const N = 64;

interface S {
  m: Spring; // 0 copy icon .. 1 check
  press: Spring; // button squash
  bump: Spring; // the pop
  tag: Spring; // the "Copied" label
  hover: number;
  done: number; // seconds since copied (-1 = idle)
  idle: number;
  sparks: { a: number; d: number; life: number }[];
  t: number;
}

function geom(w: number, h: number) {
  const u = clamp(Math.min(w / 520, h / 300), 0.55, 2.4);
  const cw = Math.min(w * 0.9, 460 * u);
  const ch = 120 * u;
  const bs = 46 * u; // button size
  const cx = w / 2, cy = h / 2 + 10 * u;
  return { u, cw, ch, bs, cx, cy, bx: cx + cw / 2 - 18 * u - bs / 2, by: cy + ch * 0.1 };
}

// the front sheet: a rounded square outline, in a 24-unit icon box
function squarePts() {
  const pts: [number, number][] = [];
  const x0 = 8, y0 = 8, s = 12, r = 2.5;
  // walk the perimeter by arc length
  const straight = s - 2 * r, arc = (Math.PI / 2) * r, per = 4 * straight + 4 * arc;
  for (let i = 0; i < N; i++) {
    let d = (i / N) * per;
    const seg = [straight, arc, straight, arc, straight, arc, straight, arc];
    let k = 0;
    while (d > seg[k]) d -= seg[k++];
    let x = 0, y = 0;
    const a = d / r;
    switch (k) {
      case 0: x = x0 + r + d; y = y0; break;
      case 1: x = x0 + s - r + Math.sin(a) * r; y = y0 + r - Math.cos(a) * r; break;
      case 2: x = x0 + s; y = y0 + r + d; break;
      case 3: x = x0 + s - r + Math.cos(a) * r; y = y0 + s - r + Math.sin(a) * r; break;
      case 4: x = x0 + s - r - d; y = y0 + s; break;
      case 5: x = x0 + r - Math.sin(a) * r; y = y0 + s - r + Math.cos(a) * r; break;
      case 6: x = x0; y = y0 + s - r - d; break;
      default: x = x0 + r - Math.cos(a) * r; y = y0 + r - Math.sin(a) * r;
    }
    pts.push([x, y]);
  }
  return pts;
}
// the check: out along the tick and back, so it is a closed loop of the same length
function checkPts() {
  const A: [number, number] = [5, 12.5], B: [number, number] = [10, 17.5], C: [number, number] = [19.5, 7];
  const l1 = Math.hypot(B[0] - A[0], B[1] - A[1]), l2 = Math.hypot(C[0] - B[0], C[1] - B[1]);
  const at = (u: number): [number, number] => {
    const d = u * (l1 + l2);
    if (d < l1) return [A[0] + ((B[0] - A[0]) * d) / l1, A[1] + ((B[1] - A[1]) * d) / l1];
    const e = (d - l1) / l2;
    return [B[0] + (C[0] - B[0]) * e, B[1] + (C[1] - B[1]) * e];
  };
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const u = i < N / 2 ? i / (N / 2) : 2 - i / (N / 2);
    pts.push(at(u));
  }
  // rotate the loop so its start lines up with the square's start (top edge ↔ tick start)
  return pts.slice(N - 8).concat(pts.slice(0, N - 8));
}
const SQ = squarePts();
const CK = checkPts();

export const sim = defineSim<S>({
  init: () => ({ m: sp(), press: sp(), bump: sp(), tag: sp(), hover: 0, done: -1, idle: 1.5, sparks: [], t: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const G = geom(w, h);
    s.t += dt;
    const on = Math.abs(p.x - G.bx) < G.bs * 0.7 && Math.abs(p.y - G.by) < G.bs * 0.7;
    s.hover = approach(s.hover, on && p.over ? 1 : 0, 14, dt);
    s.idle = p.over && on ? 0 : s.idle + dt;
    const copy = () => {
      s.done = 0;
      s.bump.v += f.reduced ? 3 : 9;
      for (let i = 0; i < 9; i++) s.sparks.push({ a: (i / 9) * Math.PI * 2 + f.rand() * 0.4, d: 0.8 + f.rand() * 0.5, life: 1 });
      f.emit({ name: 'pop', gain: 0.6, rate: 1.25 });
    };
    if (f.pressed && on) f.emit({ name: 'click', gain: 0.5 });
    if (f.released && on && s.done < 0) copy();
    if (f.actions.some((a) => a.type === 'copy') && s.done < 0) copy();
    if (s.idle > 2.5 && s.done < 0 && s.t % 3.6 < dt) {
      s.press.v -= 5; // the ghost finger presses too
      f.emit({ name: 'click', gain: 0.4 });
      copy();
    }
    if (s.done >= 0) {
      s.done += dt;
      if (s.done > 1.9) {
        s.done = -1;
        f.emit({ name: 'tick', gain: 0.25, rate: 0.9 });
      }
    }
    const checked = s.done >= 0;
    // the fold: snappy with a little overshoot into the check, calmer on the way back
    spring(s.m, checked ? 1 : 0, checked ? 260 : 200, checked ? 13 : 20, dt);
    spring(s.press, p.down && on ? 1 : 0, 500, 22, dt);
    spring(s.bump, 0, 420, 12, dt);
    spring(s.tag, checked && s.done < 1.6 ? 1 : 0, 300, 17, dt);
    for (const k of s.sparks) k.life -= dt * 2.2;
    s.sparks = s.sparks.filter((k) => k.life > 0);
  },
});

export default function CopyMorph() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const G = geom(w, h);
  const m = s.m.x;
  const mc = clamp(m);
  // blended outline (m may overshoot past 1: the check over-extends, then settles)
  const d =
    'M' +
    SQ.map((q, i) => `${lerp(q[0], CK[i][0], m).toFixed(2)},${lerp(q[1], CK[i][1], m).toFixed(2)}`).join('L') +
    'Z';
  const col = `rgb(${Math.round(lerp(148, 52, mc))},${Math.round(lerp(163, 211, mc))},${Math.round(lerp(184, 153, mc))})`;
  const scale = (1 - s.press.x * 0.08) * (1 + s.bump.x * 0.02);
  const mono = "'JetBrains Mono Variable', monospace";
  const cmd = 'npx create-fx-app@latest';
  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(110% 90% at 50% 0%, #1e2433 0%, #0d1018 60%, #07080c 100%)' }}>
      {/* the snippet card */}
      <div
        style={{
          position: 'absolute',
          left: G.cx - G.cw / 2,
          top: G.cy - G.ch / 2,
          width: G.cw,
          height: G.ch,
          borderRadius: 16 * G.u,
          background: 'linear-gradient(#171b26, #10131b)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: `0 ${20 * G.u}px ${50 * G.u}px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        <div style={{ position: 'absolute', left: 16 * G.u, top: 14 * G.u, display: 'flex', gap: 7 * G.u }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 10 * G.u, height: 10 * G.u, borderRadius: 9, background: c, opacity: 0.85 }} />
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 10 * G.u, textAlign: 'center', fontFamily: "'Inter Variable', Inter, system-ui", fontSize: 11.5 * G.u, color: '#5d6679' }}>Terminal</div>
        <div
          style={{
            position: 'absolute',
            left: 20 * G.u,
            right: G.bs + 30 * G.u,
            top: G.ch * 0.6 - 10 * G.u,
            fontFamily: mono,
            fontSize: 16 * G.u,
            color: '#e2e8f0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span style={{ color: '#34d399' }}>$ </span>
          {/* a selection highlight sweeps the text as it is copied */}
          <span style={{ background: `rgba(52,211,153,${0.22 * clamp(s.tag.x)})`, borderRadius: 3 }}>{cmd}</span>
        </div>
      </div>

      {/* sparks */}
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden>
        {s.sparks.map((k, i) => {
          const r = G.bs * (0.55 + (1 - k.life) * 0.7 * k.d);
          const x = G.bx + Math.cos(k.a) * r, y = G.by + Math.sin(k.a) * r;
          const len = 5 * G.u * k.life;
          return <line key={i} x1={x} y1={y} x2={x + Math.cos(k.a) * len} y2={y + Math.sin(k.a) * len} stroke="#34d399" strokeWidth={2.2 * G.u} strokeLinecap="round" opacity={k.life} />;
        })}
      </svg>

      {/* the button */}
      <div
        style={{
          position: 'absolute',
          left: G.bx - G.bs / 2,
          top: G.by - G.bs / 2,
          width: G.bs,
          height: G.bs,
          borderRadius: 12 * G.u,
          transform: `translateY(${-s.hover * 1.5 * G.u}px) scale(${scale})`,
          background: `linear-gradient(rgba(${lerp(255, 52, mc)},${lerp(255, 211, mc)},${lerp(255, 153, mc)},${0.07 + 0.08 * mc + 0.04 * s.hover}), rgba(255,255,255,0.03))`,
          border: `1px solid rgba(${lerp(255, 52, mc)},${lerp(255, 211, mc)},${lerp(255, 153, mc)},${0.12 + 0.25 * mc})`,
          boxShadow: `0 0 ${18 * G.u * mc}px rgba(52,211,153,${0.3 * mc})`,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
      >
        <svg width={G.bs * 0.56} height={G.bs * 0.56} viewBox="0 0 24 24">
          <defs>
            <filter id={`gl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={0.6 * mc} />
            </filter>
          </defs>
          {/* back sheet slides out from behind and fades as the check forms */}
          <path
            d="M5 15.5 V6.5 Q5 4 7.5 4 H15.5"
            fill="none"
            stroke={col}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={1 - mc}
            transform={`translate(${-mc * 3} ${-mc * 3})`}
          />
          <path d={d} fill="none" stroke="#34d399" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" opacity={mc * 0.6} filter={`url(#gl${uid})`} />
          <path d={d} fill="none" stroke={col} strokeWidth={lerp(2, 2.6, mc)} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>

      {/* the tag */}
      <div
        style={{
          position: 'absolute',
          left: G.bx,
          top: G.by - G.bs * 0.5 - 12 * G.u,
          transform: `translate(-50%, ${-100 + (1 - s.tag.x) * 40}%) scale(${0.6 + 0.4 * s.tag.x})`,
          transformOrigin: '50% 100%',
          opacity: clamp(s.tag.x),
          padding: `${5 * G.u}px ${10 * G.u}px`,
          borderRadius: 8 * G.u,
          background: '#34d399',
          color: '#052e1c',
          fontFamily: "'Inter Variable', Inter, system-ui",
          fontWeight: 700,
          fontSize: 12.5 * G.u,
          whiteSpace: 'nowrap',
          boxShadow: '0 6px 18px rgba(52,211,153,0.35)',
        }}
      >
        Copied!
      </div>
      <button
        type="button"
        aria-label="Copy command"
        style={{ position: 'absolute', left: G.bx - G.bs / 2, top: G.by - G.bs / 2, width: G.bs, height: G.bs, opacity: 0, borderRadius: 12 * G.u }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'copy' });
          }
        }}
      />
    </Stage>
  );
}
