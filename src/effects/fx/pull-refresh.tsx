import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Pull-to-refresh as a rubber membrane. Drag the list down: an elastic sheet bulges out of the
 * header under your finger (rubber-band resistance, so it gets harder the further you pull),
 * and every row follows on its own spring, the lower ones lagging, so the list stretches
 * apart and closes up again. Pull past the line and the arrow flips; let go and the membrane
 * snaps back to a small drop holding the spinner, then a fresh message slides in on top.
 * Left alone, a ghost thumb pulls it every few seconds.
 */

const POOL = [
  ['Mira Kovács', 'Hero animation is 🔥', '#f472b6'],
  ['Deploy bot', 'v2.4.2 is live on production', '#22c55e'],
  ['Ádám Szabó', 'Can we move the call to 3pm?', '#60a5fa'],
  ['Figma', 'Lena left 3 comments on Landing', '#a78bfa'],
  ['Stripe', 'Payout of €1,250 is on its way', '#818cf8'],
  ['Nóra Tóth', 'Contract signed, see attached', '#fb923c'],
  ['GitHub', 'PR #128 approved by @rkiss', '#94a3b8'],
  ['Bence', 'Lunch? 🍜', '#facc15'],
];

interface S {
  pull: Spring; // membrane depth, px
  rows: Spring[]; // per-row follow
  bx: number; // bulge x
  drag: boolean;
  y0: number;
  over: boolean; // past the threshold
  refreshing: number; // seconds, -1 when not
  spin: number;
  items: number[]; // pool indices, top first
  next: number;
  insert: Spring; // 0..1 newest row slides in
  idle: number;
  ghost: number; // ghost pull timeline
  t: number;
}

function geom(w: number, h: number) {
  const u = clamp(Math.min(w / 420, h / 560), 0.55, 2);
  const cw = Math.min(w, 460 * u);
  return { u, cw, x0: (w - cw) / 2, hh: 70 * u, rh: 66 * u, maxD: 200 * u, thr: 105 * u, hold: 58 * u };
}

export const sim = defineSim<S>({
  init: () => ({ pull: sp(), rows: Array.from({ length: 14 }, () => sp()), bx: 0, drag: false, y0: 0, over: false, refreshing: -1, spin: 0, items: [0, 1, 2, 3, 4, 5, 6], next: 7, insert: sp(1), idle: 1.5, ghost: 0, t: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const G = geom(w, h);
    s.t += dt;
    s.idle = p.down ? 0 : s.idle + dt;
    // the ghost thumb: press near the top, drag down, let go
    let px = p.x, py = p.y, down = p.down, pressed = f.pressed;
    if (s.idle > 2.5 && s.refreshing < 0) {
      s.ghost += dt;
      const g = s.ghost % 5;
      px = w * 0.5 + Math.sin(s.t * 0.9) * G.cw * 0.12;
      py = G.hh + 40 * G.u + clamp((g - 0.6) / 0.9) ** 0.8 * 230 * G.u;
      down = g > 0.6 && g < 1.9;
      pressed = g - dt <= 0.6 && g > 0.6;
    } else s.ghost = 0;
    if (f.actions.some((a) => a.type === 'refresh') && s.refreshing < 0) s.refreshing = 0;
    if (pressed && py > G.hh && s.refreshing < 0) {
      s.drag = true;
      s.y0 = py;
      s.bx = px;
    }
    if (s.drag) {
      // rubber band: resistance grows with distance
      const raw = Math.max(0, py - s.y0);
      const D = G.maxD * (1 - Math.exp(-raw / G.maxD));
      spring(s.pull, D, 900, 50, dt);
      s.bx += (clamp(px, G.x0 + G.cw * 0.2, G.x0 + G.cw * 0.8) - s.bx) * (1 - Math.exp(-12 * dt));
      const was = s.over;
      s.over = s.pull.x > G.thr;
      if (s.over !== was) f.emit({ name: 'tick', gain: 0.4, rate: s.over ? 1.3 : 1 });
      if (!down) {
        s.drag = false;
        if (s.over) {
          s.refreshing = 0;
          f.emit({ name: 'boing', gain: 0.45, rate: 1.2 });
        } else f.emit({ name: 'boing', gain: 0.25, rate: 0.9 });
        s.over = false;
      }
    } else {
      // released: snap with a rubbery wobble (low damping), or hold at the spinner
      const target = s.refreshing >= 0 && s.refreshing < 1.1 ? G.hold : 0;
      spring(s.pull, target, 260, 9, dt);
    }
    if (s.refreshing >= 0) {
      s.refreshing += dt;
      s.spin += dt * 7;
      if (s.refreshing > 1.1 && s.refreshing - dt <= 1.1) {
        s.items.unshift(s.next % POOL.length);
        s.next++;
        s.items.length = Math.min(s.items.length, 12);
        s.insert.x = 0;
        s.insert.v = 0;
        f.emit({ name: 'pop', gain: 0.5, rate: 1.1 });
      }
      if (s.refreshing > 1.6) s.refreshing = -1;
    }
    spring(s.insert, 1, 160, 17, dt);
    // rows follow the membrane, deeper rows on softer springs: the list stretches
    for (let i = 0; i < s.rows.length; i++) spring(s.rows[i], s.pull.x * 0.72, 420 / (1 + i * 0.35), 15 / (1 + i * 0.12), dt);
  },
});

export default function PullRefresh() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const G = geom(w, h);
  const u = G.u;
  const D = s.pull.x;
  const Dp = Math.max(0, D);
  const font = "'Inter Variable', Inter, system-ui";
  const prog = clamp(Dp / G.thr);
  const refreshing = s.refreshing >= 0;
  // the membrane: flat header edge, bulging down under the finger
  const bx = s.bx || w / 2;
  const wb = G.cw * 0.32 + Dp * 0.6;
  const y = G.hh;
  const path = `M${G.x0} ${y - 1} L${bx - wb} ${y - 1} C${bx - wb * 0.45} ${y} ${bx - wb * 0.5} ${y + Dp} ${bx} ${y + Dp} C${bx + wb * 0.5} ${y + Dp} ${bx + wb * 0.45} ${y} ${bx + wb} ${y - 1} L${G.x0 + G.cw} ${y - 1} Z`;
  const sy = y + Dp * 0.5; // spinner centre rides in the bulge
  const sr = 13 * u * clamp(0.4 + prog * 0.6);
  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: 'radial-gradient(120% 80% at 50% 0%, #2b2f45 0%, #14161f 70%)' }}>
      <div style={{ position: 'absolute', left: G.x0, top: 0, width: G.cw, height: h, background: '#f8fafc', boxShadow: '0 0 60px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
        {/* rows */}
        {s.items.map((it, i) => {
          const [name, msg, col] = POOL[it];
          const first = i === 0;
          const ins = first ? s.insert.x : 1;
          const off = (s.rows[i]?.x ?? 0) + (first ? 0 : (1 - s.insert.x) * -G.rh);
          const top = G.hh + i * G.rh + off;
          if (top > h) return null;
          return (
            <div
              key={`${it}-${s.next - i}`}
              style={{
                position: 'absolute',
                left: 0,
                width: G.cw,
                top,
                height: G.rh,
                display: 'flex',
                alignItems: 'center',
                gap: 12 * u,
                padding: `0 ${18 * u}px`,
                boxSizing: 'border-box',
                borderBottom: '1px solid #e2e8f0',
                background: first && ins < 1 ? `rgba(224,231,255,${1 - ins})` : 'transparent',
                opacity: first ? clamp(ins * 1.5) : 1,
                transform: first ? `translateX(${(1 - ins) * -30 * u}px)` : undefined,
                fontFamily: font,
              }}
            >
              <div style={{ width: 40 * u, height: 40 * u, borderRadius: 99, background: `linear-gradient(135deg, ${col}, #1e293b)`, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15 * u, flex: 'none' }}>{name[0]}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 650, fontSize: 14.5 * u, color: '#0f172a' }}>{name}</span>
                  <span style={{ fontSize: 11.5 * u, color: '#94a3b8' }}>{i === 0 ? 'now' : `${i * 7 + 2}m`}</span>
                </div>
                <div style={{ fontSize: 13 * u, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 * u }}>{msg}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* the membrane and spinner */}
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden>
        <defs>
          <linearGradient id={`mem${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4f46e5" />
            <stop offset="1" stopColor={s.over || refreshing ? '#8b5cf6' : '#6366f1'} />
          </linearGradient>
          <clipPath id={`col${uid}`}>
            <rect x={G.x0} y={0} width={G.cw} height={h} />
          </clipPath>
          <filter id={`sh${uid}`} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy={4 * u} stdDeviation={6 * u} floodColor="#312e81" floodOpacity="0.35" />
          </filter>
        </defs>
        <rect x={G.x0} y={0} width={G.cw} height={G.hh} fill="#4f46e5" />
        <g clipPath={`url(#col${uid})`}>
          <path d={path} fill={`url(#mem${uid})`} filter={`url(#sh${uid})`} />
        </g>
        {/* a glossy highlight along the stretched skin */}
        <path d={`M${bx - wb * 0.5} ${y + Dp * 0.35} Q${bx} ${y + Dp * 0.9} ${bx + wb * 0.5} ${y + Dp * 0.35}`} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2 * u} strokeLinecap="round" opacity={clamp(Dp / (40 * u))} />
        <text x={G.x0 + 20 * u} y={G.hh * 0.62} fill="#fff" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={800} fontSize={24 * u}>
          Inbox
        </text>
        <text x={G.x0 + G.cw - 20 * u} y={G.hh * 0.6} fill="rgba(255,255,255,0.7)" fontFamily={font} fontSize={12 * u} textAnchor="end">
          {refreshing ? 'Updating…' : s.over ? 'Release to refresh' : Dp > 8 * u ? 'Pull to refresh' : ''}
        </text>
        {Dp > 6 * u && (
          <g transform={`translate(${bx} ${sy})`} opacity={clamp((Dp - 6 * u) / (20 * u))}>
            <circle r={sr + 3 * u} fill="rgba(255,255,255,0.18)" />
            {refreshing ? (
              <circle r={sr} fill="none" stroke="#fff" strokeWidth={2.6 * u} strokeLinecap="round" strokeDasharray={`${sr * 4} ${sr * 9}`} transform={`rotate(${(s.spin * 57.3) % 360})`} />
            ) : (
              <>
                {/* progress ring fills as you pull; the arrow flips past the line */}
                <circle r={sr} fill="none" stroke="#fff" strokeWidth={2.6 * u} strokeLinecap="round" pathLength={1} strokeDasharray={`${prog} 1`} transform="rotate(-90)" />
                <g transform={`rotate(${s.over ? 180 : prog * 150})`}>
                  <path d={`M0 ${-sr * 0.45} V${sr * 0.45} M${-sr * 0.35} ${sr * 0.12} L0 ${sr * 0.45} L${sr * 0.35} ${sr * 0.12}`} stroke="#fff" strokeWidth={2.2 * u} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </>
            )}
          </g>
        )}
      </svg>
      <button
        type="button"
        aria-label="Refresh inbox"
        style={{ position: 'absolute', left: G.x0, top: 0, width: G.cw, height: G.hh, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'refresh' });
          }
        }}
      />
    </Stage>
  );
}
