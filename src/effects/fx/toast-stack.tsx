import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Notifications that pile up in depth: the newest sits in front, older ones peek out above it,
 * each a little smaller and dimmer (as if further away). Hover the stack and it fans out into a
 * readable list; every card rides its own spring, so they unfold with a staggered overshoot.
 * New toasts drop in from below, old ones time out (the timer pauses while you're reading),
 * and the × flicks a card away. Left alone, it keeps receiving messages and fans itself out.
 */

interface Toast {
  id: number;
  kind: number;
  y: Spring; // px, offset from the anchor (up = negative)
  sc: Spring;
  op: Spring;
  x: Spring; // slide-out
  life: number; // seconds left before auto-dismiss
  leaving: boolean;
}

interface S {
  ts: Toast[];
  next: number;
  open: Spring; // 0 stacked .. 1 fanned
  hover: boolean;
  idle: number;
  t: number;
  auto: number; // next idle event
  autoOpen: number; // idle fan-out timer
  btn: Spring; // the notify button press
}

const KINDS = [
  { icon: '✓', col: '#16a34a', bg: '#dcfce7', title: 'Deployment live', body: 'softwaredevelopment.hu is serving v2.4.1' },
  { icon: 'M', col: '#7c3aed', bg: '#ede9fe', title: 'Mira commented', body: '“Love the new hero animation!”' },
  { icon: '!', col: '#d97706', bg: '#fef3c7', title: 'Storage at 82%', body: 'Clean up old builds to free space' },
  { icon: '↓', col: '#2563eb', bg: '#dbeafe', title: 'Export ready', body: 'report-q3.pdf · 2.4 MB' },
  { icon: '$', col: '#0891b2', bg: '#cffafe', title: 'Payment received', body: '€1,250.00 from Acme Ltd.' },
  { icon: '★', col: '#db2777', bg: '#fce7f3', title: 'New 5-star review', body: '“Fast, friendly, flawless.”' },
];
const LIFE = 9;

function geom(w: number, h: number) {
  const u = clamp(Math.min(w / 420, h / 420), 0.62, 1.5);
  const cw = Math.min(w * 0.88, 360 * u);
  const ch = 66 * u;
  return { u, cw, ch, cx: w / 2, ay: h * 0.84 - ch, gap: 10 * u };
}

export const sim = defineSim<S>({
  init: () => ({ ts: [], next: 0, open: sp(), hover: false, idle: 2, t: 0, auto: 0.3, autoOpen: 0, btn: sp() }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const G = geom(w, h);
    s.t += dt;
    const live = s.ts.filter((t) => !t.leaving);
    const add = () => {
      const t: Toast = { id: s.next, kind: s.next % KINDS.length, y: sp(G.ch * 1.4), sc: sp(0.9), op: sp(0), x: sp(), life: LIFE, leaving: false };
      s.next++;
      s.ts.unshift(t);
      f.emit({ name: 'pop', gain: 0.5, rate: 1.1 });
      const l = s.ts.filter((q) => !q.leaving);
      if (l.length > 5) l[l.length - 1].leaving = true; // the oldest steps aside
    };
    // the notify button
    const by = h * 0.14, bw = 150 * G.u, bh = 40 * G.u;
    // the stack's footprint: generous while fanned so the hover doesn't flicker off
    const n = live.length;
    const fanH = Math.min((n - 1) * (G.ch + G.gap), G.ay - (by + bh / 2 + 14 * G.u));
    const topY = G.ay - (s.open.x > 0.5 ? fanH : 2 * 12 * G.u) - 10;
    const inStack = p.over && Math.abs(p.x - G.cx) < G.cw / 2 + 8 && p.y > topY && p.y < G.ay + G.ch + 8;
    const onBtn = Math.abs(p.x - G.cx) < bw / 2 && Math.abs(p.y - by) < bh / 2;
    s.idle = p.over && (inStack || onBtn || p.down) ? 0 : s.idle + dt;

    let pressed = f.pressed;
    for (const a of f.actions) {
      if (a.type === 'notify') add();
      if (a.type === 'dismiss') {
        const t = live[0];
        if (t) t.leaving = true;
      }
    }
    if (pressed && onBtn) {
      add();
      s.btn.v -= 6;
      pressed = false;
    }
    // hit-test the × on each visible card (front first)
    if (pressed) {
      for (let i = 0; i < live.length; i++) {
        const t = live[i];
        const cy = G.ay + t.y.x + G.ch / 2;
        const xx = G.cx + G.cw / 2 - 22 * G.u, xy = cy - G.ch * 0.22;
        if (Math.hypot(p.x - xx, p.y - xy) < 22 * G.u && t.op.x > 0.5) {
          t.leaving = true;
          f.emit({ name: 'swoosh', gain: 0.4, rate: 1.2 });
          break;
        }
      }
    }
    spring(s.btn, 0, 500, 18, dt);

    // self-demo: messages trickle in, and every so often the stack fans open
    if (s.idle > 2.5) {
      if (s.t > s.auto) {
        add();
        s.auto = s.t + 2.2;
      }
      s.autoOpen = (s.autoOpen + dt) % 7;
    } else s.autoOpen = 0;
    const wantOpen = inStack || (s.idle > 2.5 && s.autoOpen > 4.4);
    if (wantOpen !== s.hover) f.emit({ name: 'tick', gain: 0.25, rate: wantOpen ? 1.2 : 0.9 });
    s.hover = wantOpen;
    spring(s.open, wantOpen ? 1 : 0, 170, 22, dt);

    // fanned spacing shrinks if the list would run into the button
    const room = G.ay - (by + bh / 2 + 14 * G.u);
    const step = Math.min(G.ch + G.gap, room / Math.max(1, live.length - 1));
    let i = 0;
    for (const t of s.ts) {
      if (t.leaving) {
        // flick away to the right, fading
        spring(t.x, G.cw * 0.9, 120, 14, dt);
        spring(t.op, 0, 120, 16, dt);
        continue;
      }
      if (!s.hover) t.life -= dt;
      if (t.life <= 0) t.leaving = true;
      const o = s.open.x;
      // stacked: tucked behind, peeking up 12px each; fanned: a full list
      const yStack = -i * 12 * G.u;
      const yFan = -i * step;
      const ty = yStack + (yFan - yStack) * o;
      const ts = 1 - i * 0.055 * (1 - o);
      const to = i < 3 || o > 0.5 ? 1 - i * 0.18 * (1 - o) : 0;
      // deeper cards lag a touch: a staggered unfold
      const k = 240 - i * 25;
      spring(t.y, ty, k, 19, dt);
      spring(t.sc, ts, k, 19, dt);
      spring(t.op, to, 200, 22, dt);
      spring(t.x, 0, 200, 20, dt);
      i++;
    }
    s.ts = s.ts.filter((t) => !(t.leaving && t.op.x < 0.02));
  },
});

export default function ToastStack() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const G = geom(w, h);
  const live = s.ts.filter((t) => !t.leaving);
  const by = h * 0.14, bw = 150 * G.u, bh = 40 * G.u;
  // draw back to front
  const order = [...s.ts].reverse();
  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(120% 90% at 50% 10%, #f7f8fb 0%, #e6e9f0 60%, #d5dae4 100%)' }}>
      {/* a faint app canvas behind */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(30,40,70,0.09) 1px, transparent 1px)', backgroundSize: `${22 * G.u}px ${22 * G.u}px` }} />
      <div
        style={{
          position: 'absolute',
          left: G.cx - bw / 2,
          top: by - bh / 2,
          width: bw,
          height: bh,
          borderRadius: bh / 2,
          background: 'linear-gradient(#24262e, #121318)',
          color: '#fff',
          fontFamily: "'Inter Variable', Inter, system-ui",
          fontWeight: 600,
          fontSize: 14 * G.u,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8 * G.u,
          boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset, 0 6px 16px rgba(10,15,30,0.25)',
          transform: `scale(${1 + s.btn.x * 0.012})`,
          cursor: 'pointer',
        }}
      >
        <span style={{ width: 8 * G.u, height: 8 * G.u, borderRadius: 9, background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
        Notify me
      </div>
      {order.map((t) => {
        const K = KINDS[t.kind];
        const idx = live.indexOf(t);
        const depth = idx < 0 ? 0 : idx;
        const content = 1 - clamp(depth * (1 - s.open.x)); // only the front card's text reads while stacked
        return (
          <div
            key={t.id}
            style={{
              position: 'absolute',
              left: G.cx - G.cw / 2,
              top: G.ay,
              width: G.cw,
              height: G.ch,
              transform: `translate(${t.x.x}px, ${t.y.x}px) scale(${t.sc.x})`,
              transformOrigin: '50% 100%',
              opacity: clamp(t.op.x),
              borderRadius: 14 * G.u,
              background: '#fff',
              border: '1px solid rgba(15,23,42,0.07)',
              boxShadow: `0 ${1 + depth}px 2px rgba(15,23,42,0.05), 0 ${8 * G.u}px ${24 * G.u}px rgba(15,23,42,${0.1 + 0.04 * s.open.x})`,
              display: 'flex',
              alignItems: 'center',
              gap: 12 * G.u,
              padding: `0 ${14 * G.u}px`,
              boxSizing: 'border-box',
              fontFamily: "'Inter Variable', Inter, system-ui",
              overflow: 'hidden',
            }}
          >
            <div style={{ opacity: content, display: 'flex', alignItems: 'center', gap: 12 * G.u, flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: 34 * G.u,
                  height: 34 * G.u,
                  flex: 'none',
                  borderRadius: 10 * G.u,
                  background: K.bg,
                  color: K.col,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 16 * G.u,
                  fontFamily: "'Archivo Variable', Archivo, system-ui",
                }}
              >
                {K.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14 * G.u, fontWeight: 650, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{K.title}</div>
                <div style={{ fontSize: 12.5 * G.u, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 * G.u }}>{K.body}</div>
              </div>
              <div style={{ alignSelf: 'flex-start', marginTop: 10 * G.u, color: '#94a3b8', fontSize: 15 * G.u, lineHeight: 1, width: 16 * G.u, textAlign: 'center' }}>×</div>
            </div>
            {/* time-left bar: freezes while the stack is open */}
            <div style={{ position: 'absolute', left: 0, bottom: 0, height: 2.5 * G.u, width: `${(clamp(t.life / LIFE) * 100).toFixed(2)}%`, background: K.col, opacity: 0.35 * content }} />
          </div>
        );
      })}
      <button
        type="button"
        aria-label="Show a notification"
        style={{ position: 'absolute', left: G.cx - bw / 2, top: by - bh / 2, width: bw, height: bh, opacity: 0, borderRadius: bh / 2 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'notify' });
          }
        }}
      />
      <button
        type="button"
        aria-label="Dismiss the newest notification"
        style={{ position: 'absolute', left: G.cx - G.cw / 2, top: G.ay, width: G.cw, height: G.ch, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'dismiss' });
          }
        }}
      />
    </Stage>
  );
}
