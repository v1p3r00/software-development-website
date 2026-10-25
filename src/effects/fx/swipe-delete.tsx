import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Swipe a row: left to delete, right to archive. The row follows your finger 1:1, uncovering the
 * action underneath; past the line the icon jumps forward (that's your "commit" moment). Let go
 * past it and the row is flung off with your release speed, then its height collapses on a
 * slightly bouncy spring, so the neighbours below slide up and settle with a tiny overshoot.
 * Short of the line it snaps back. New tasks trickle in at the bottom; idle, a ghost thumb swipes.
 */

const TASKS = [
  ['Review landing page copy', 'Marketing · today'],
  ['Send invoice to Acme Ltd.', 'Finance · overdue'],
  ['Fix Safari scroll jank', 'Web · high priority'],
  ['Record promo voice-over', 'Video · tomorrow'],
  ['Reply to Lena about fonts', 'Design · today'],
  ['Renew SSL certificate', 'Ops · in 3 days'],
  ['Book flights to Berlin', 'Personal · this week'],
  ['Update case-study numbers', 'Portfolio · Friday'],
];

interface Row {
  id: number;
  x: Spring; // horizontal offset, px
  hgt: Spring; // 0..1 of a row's height
  gone: number; // 0 live, -1 deleting, 1 archiving
  armed: boolean;
}

interface S {
  rows: Row[];
  next: number;
  drag: number; // id being dragged, -1 none
  x0: number;
  dx0: number;
  idle: number;
  ghost: number;
  ghostRow: number;
  refill: number;
  t: number;
}

function geom(w: number, h: number) {
  const u = clamp(Math.min(w / 440, h / 520), 0.55, 2);
  const cw = Math.min(w * 0.94, 420 * u);
  const rh = 72 * u;
  return { u, cw, rh, x0: (w - cw) / 2, y0: Math.max(70 * u, (h - rh * 5) / 2 + 20 * u), thr: cw * 0.32 };
}
const mk = (id: number, full = true): Row => ({ id, x: sp(), hgt: sp(full ? 1 : 0), gone: 0, armed: false });

export const sim = defineSim<S>({
  init: () => ({ rows: [0, 1, 2, 3, 4].map((i) => mk(i)), next: 5, drag: -1, x0: 0, dx0: 0, idle: 1.5, ghost: 0, ghostRow: 1, refill: 0, t: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const G = geom(w, h);
    s.t += dt;
    s.idle = p.down ? 0 : s.idle + dt;
    const yOf = (id: number) => {
      let y = G.y0;
      for (const r of s.rows) {
        if (r.id === id) return y;
        y += r.hgt.x * G.rh;
      }
      return y;
    };
    // ghost thumb: grab a row, drag it left (or right), release
    let px = p.x, py = p.y, down = p.down, pressed = f.pressed;
    if (s.idle > 2.5) {
      s.ghost += dt;
      const g = s.ghost % 3.2;
      const live = s.rows.filter((r) => r.gone === 0);
      const r = live[Math.min(live.length - 1, s.ghostRow % Math.max(1, live.length))];
      const dir = s.ghostRow % 3 === 2 ? 1 : -1;
      py = r ? yOf(r.id) + G.rh / 2 : py;
      const k = clamp((g - 0.4) / 0.55);
      px = w / 2 + dir * (k * k * (3 - 2 * k)) * G.cw * 0.48;
      down = g > 0.4 && g < 1.0;
      pressed = g - dt <= 0.4 && g > 0.4;
      if (g - dt <= 1.0 && g > 1.0) s.ghostRow++;
    } else s.ghost = 0;

    for (const a of f.actions) {
      const r = s.rows.find((q) => q.id === a.id && q.gone === 0);
      if (r && (a.type === 'delete' || a.type === 'archive')) {
        r.gone = a.type === 'delete' ? -1 : 1;
        f.emit({ name: 'swoosh', gain: 0.5, rate: 1.2 });
      }
    }
    if (pressed) {
      for (const r of s.rows) {
        const y = yOf(r.id);
        if (r.gone === 0 && py > y && py < y + G.rh && px > G.x0 && px < G.x0 + G.cw) {
          s.drag = r.id;
          s.x0 = px;
          s.dx0 = r.x.x;
        }
      }
    }
    for (const r of s.rows) {
      if (r.id === s.drag) {
        // follows the finger, with resistance past the full width
        let x = s.dx0 + px - s.x0;
        const lim = G.cw * 0.7;
        if (Math.abs(x) > lim) x = Math.sign(x) * (lim + (Math.abs(x) - lim) * 0.25);
        r.x.v = (x - r.x.x) / Math.max(dt, 1e-4);
        r.x.x = x;
        const armed = Math.abs(x) > G.thr;
        if (armed !== r.armed) f.emit({ name: 'tick', gain: 0.4, rate: armed ? 1.3 : 1 });
        r.armed = armed;
        if (!down) {
          s.drag = -1;
          if (armed) {
            r.gone = x < 0 ? -1 : 1;
            f.emit({ name: x < 0 ? 'swoosh' : 'whoosh', gain: 0.5, rate: 1.2 });
          }
        }
        continue;
      }
      if (r.gone !== 0) {
        // fling off, then collapse the gap
        spring(r.x, r.gone * G.cw * 1.15, 140, 16, dt);
        if (Math.abs(r.x.x) > G.cw * 0.95) spring(r.hgt, 0, 260, 15, dt);
      } else {
        spring(r.x, 0, 320, 16, dt); // snap back, a touch of wobble
        spring(r.hgt, 1, 220, 16, dt);
      }
      r.armed = Math.abs(r.x.x) > G.thr;
    }
    s.rows = s.rows.filter((r) => !(r.gone !== 0 && r.hgt.x < 0.01 && Math.abs(r.hgt.v) < 0.5));
    // keep the list topped up
    const live = s.rows.filter((r) => r.gone === 0).length;
    if (live < 5) {
      s.refill += dt;
      if (s.refill > 0.9) {
        s.refill = 0;
        s.rows.push(mk(s.next++, false));
        f.emit({ name: 'pop', gain: 0.25, rate: 1.3 });
      }
    } else s.refill = 0;
  },
});

const Trash = ({ s }: { s: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
);
const Archive = ({ s }: { s: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h18v4H3zM5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
  </svg>
);

export default function SwipeDelete() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const G = geom(w, h);
  const u = G.u;
  const font = "'Inter Variable', Inter, system-ui";
  let y = G.y0;
  return (
    <Stage fx={fx} cursor={s.drag >= 0 ? 'grabbing' : 'grab'} style={{ background: 'radial-gradient(120% 90% at 50% 0%, #f4f4f7 0%, #e4e5ea 70%, #d6d8df 100%)' }}>
      <div style={{ position: 'absolute', left: G.x0 + 4 * u, top: G.y0 - 44 * u, fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: 24 * u, color: '#111827' }}>
        Today <span style={{ fontFamily: font, fontWeight: 500, fontSize: 13 * u, color: '#9ca3af', marginLeft: 6 * u }}>swipe ← delete · archive →</span>
      </div>
      {s.rows.map((r) => {
        const top = y;
        const hh = Math.max(0, r.hgt.x) * G.rh;
        y += r.hgt.x * G.rh;
        const [title, sub] = TASKS[r.id % TASKS.length];
        const x = r.x.x;
        const reveal = clamp(Math.abs(x) / G.thr);
        const left = x < 0;
        // the icon waits near the edge until armed, then jumps to ride the row's edge
        const iconPos = r.armed ? Math.max(30 * u, Math.abs(x) - 30 * u) : Math.min(Math.abs(x) * 0.5, 30 * u);
        return (
          <div key={r.id} style={{ position: 'absolute', left: G.x0, top, width: G.cw, height: hh, overflow: 'hidden', borderRadius: 16 * u }}>
            {/* the action underneath */}
            <div
              style={{
                position: 'absolute',
                inset: `${4 * u}px 0`,
                borderRadius: 16 * u,
                background: left ? (r.armed ? '#ef4444' : `rgba(239,68,68,${0.35 + reveal * 0.45})`) : r.armed ? '#10b981' : `rgba(16,185,129,${0.35 + reveal * 0.45})`,
                opacity: Math.abs(x) > 1 ? 1 : 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  [left ? 'right' : 'left']: iconPos,
                  transform: `translate(${left ? 50 : -50}%, -50%) scale(${0.6 + reveal * 0.4 + (r.armed ? 0.25 : 0)})`,
                  transition: 'none',
                }}
              >
                {left ? <Trash s={22 * u} /> : <Archive s={22 * u} />}
              </div>
            </div>
            {/* the row */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 4 * u,
                width: G.cw,
                height: G.rh - 8 * u,
                transform: `translateX(${x}px) rotate(${x / G.cw * 1.5}deg)`,
                borderRadius: 16 * u,
                background: '#fff',
                boxShadow: `0 ${1 + Math.abs(x) * 0.02}px ${3 + Math.abs(x) * 0.08}px rgba(17,24,39,${0.06 + reveal * 0.06})`,
                display: 'flex',
                alignItems: 'center',
                gap: 14 * u,
                padding: `0 ${16 * u}px`,
                boxSizing: 'border-box',
                fontFamily: font,
              }}
            >
              <div style={{ width: 22 * u, height: 22 * u, borderRadius: 99, border: `${2 * u}px solid #d1d5db`, flex: 'none' }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 * u, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                <div style={{ fontSize: 12.5 * u, color: '#9ca3af', marginTop: 2 * u }}>{sub}</div>
              </div>
              <div style={{ width: 8 * u, height: 8 * u, borderRadius: 9, background: ['#f59e0b', '#ef4444', '#6366f1', '#10b981'][r.id % 4], flex: 'none' }} />
            </div>
            <button
              type="button"
              aria-label={`${title}: press Delete to delete, A to archive`}
              style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none' }}
              onKeyDown={(e) => {
                if (e.key === 'Delete' || e.key === 'Backspace') fx.dispatch({ type: 'delete', id: r.id });
                if (e.key === 'a' || e.key === 'A') fx.dispatch({ type: 'archive', id: r.id });
              }}
            />
          </div>
        );
      })}
    </Stage>
  );
}
