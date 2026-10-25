import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * A deck of travel cards. Grab the top one and fling it: it keeps your throw's momentum,
 * spins around where you grabbed it and arcs off under gravity. The cards below rise up
 * one slot with a springy overshoot, and thrown cards quietly rejoin the bottom of the deck.
 */

const DECK = [
  { name: 'Kyoto', sub: 'Japan · 9 days', sky: ['#ffb38a', '#ff6f91', '#6a4c93'], hills: ['#8e3b6b', '#4a1f4f'], sun: '#fff1c1' },
  { name: 'Reykjavík', sub: 'Iceland · 5 days', sky: ['#0b1d3a', '#1b5e7a', '#5ff0c6'], hills: ['#14324a', '#081626'], sun: '#d6fff2' },
  { name: 'Lisbon', sub: 'Portugal · 4 days', sky: ['#ffe29a', '#ffb06b', '#ff7a59'], hills: ['#c3573c', '#7a2e27'], sun: '#fffaf0' },
  { name: 'Patagonia', sub: 'Chile · 12 days', sky: ['#bfe3ff', '#7fb3ff', '#4a6cd6'], hills: ['#3e4f8a', '#1f2a54'], sun: '#ffffff' },
  { name: 'Marrakech', sub: 'Morocco · 6 days', sky: ['#ffd27a', '#f08a4b', '#b8423a'], hills: ['#8a3a2a', '#4f1d16'], sun: '#fff4d6' },
];

interface Card {
  x: Spring;
  y: Spring;
  r: Spring;
  slot: Spring; // position in the stack, 0 = top (springs with overshoot when the deck moves up)
  fly: boolean;
  vr: number;
}

interface S {
  cards: Card[];
  order: number[]; // card indices, top first
  drag: number; // index being dragged, -1 if none
  gx: number; // grab point relative to card centre
  gy: number;
  ox: number;
  oy: number;
  idle: number;
  demoClock: number;
  demo: number; // demo swipe progress (s), -1 when not demoing
  dir: number;
}

function geom(w: number, h: number) {
  const ch = Math.min(h * 0.66, w * 0.6 * 1.35);
  const cw = ch / 1.35;
  return { cx: w / 2, cy: h / 2 - ch * 0.04, cw, ch };
}

function fling(s: S, f: { emit: (x: { name: string; gain?: number; rate?: number; pan?: number }) => void }, i: number, vx: number, vy: number, gy: number) {
  const c = s.cards[i];
  c.fly = true;
  c.x.v = vx;
  c.y.v = vy;
  // a card grabbed high spins one way, grabbed low the other
  c.vr = vx * 0.045 * (gy < 0.12 ? 1 : -1);
  s.order.splice(s.order.indexOf(i), 1);
  f.emit({ name: 'whoosh', gain: clamp(Math.abs(vx) / 2400, 0.3, 0.9), rate: 1.1, pan: Math.sign(vx) * 0.6 });
}

export const sim = defineSim<S>({
  init: () => ({
    cards: DECK.map((_, i) => ({ x: sp(), y: sp(), r: sp(), slot: sp(i), fly: false, vr: 0 })),
    order: DECK.map((_, i) => i),
    drag: -1,
    gx: 0,
    gy: 0,
    ox: 0,
    oy: 0,
    idle: 0,
    demoClock: 0,
    demo: -1,
    dir: 1,
  }),
  step(s, f) {
    const { cx, cy, cw, ch } = geom(f.w, f.h);
    const top = s.order[0];
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;

    if (f.pressed && top !== undefined && Math.abs(f.p.x - cx) < cw / 2 && Math.abs(f.p.y - cy) < ch / 2) {
      s.drag = top;
      s.demo = -1;
      const c = s.cards[top];
      s.ox = f.p.x - c.x.x;
      s.oy = f.p.y - c.y.x;
      s.gx = (f.p.x - cx) / cw;
      s.gy = (f.p.y - cy) / ch;
      f.emit({ name: 'tick', gain: 0.3 });
    }
    if (s.drag >= 0) {
      const c = s.cards[s.drag];
      c.x.x = f.p.x - s.ox;
      c.y.x = f.p.y - s.oy;
      c.x.v = f.p.vx;
      c.y.v = f.p.vy;
      if (!f.p.down) {
        const far = Math.abs(c.x.x) > cw * 0.42;
        const fast = Math.abs(f.p.vx) > 650;
        if (far || fast) {
          const dir = fast ? Math.sign(f.p.vx) : Math.sign(c.x.x);
          fling(s, f, s.drag, dir * Math.max(Math.abs(f.p.vx), 1500), f.p.vy * 0.6 - 150, s.gy);
        } else f.emit({ name: 'swoosh', gain: 0.25 });
        s.drag = -1;
      }
    }

    // self-demo: pull the top card aside a little, then throw it
    if (s.drag < 0 && s.idle > 2.5) {
      if (s.demo < 0) {
        s.demoClock += f.dt;
        if (s.demoClock > 0.7 && top !== undefined) {
          s.demo = 0;
          s.demoClock = 0;
        }
      } else if (top !== undefined) {
        s.demo += f.dt;
        const c = s.cards[top];
        c.x.x = approach(c.x.x, s.dir * cw * 0.2, 7, f.dt);
        c.y.x = approach(c.y.x, -ch * 0.03, 7, f.dt);
        if (s.demo > 0.55) {
          fling(s, f, top, s.dir * 1900, -380, -0.2);
          s.dir *= -1;
          s.demo = -1;
        }
      }
    } else s.demo = -1;

    s.cards.forEach((c, i) => {
      if (c.fly) {
        // ballistic: keep the throw's momentum, fall under gravity, spin
        c.x.x += c.x.v * f.dt;
        c.y.x += c.y.v * f.dt;
        c.y.v += 2200 * f.dt;
        c.r.x += c.vr * f.dt;
        if (Math.abs(c.x.x) > f.w * 0.5 + cw * 1.2 || c.y.x > f.h + ch) {
          // rejoin the bottom of the deck
          c.fly = false;
          c.x.x = c.y.x = c.r.x = 0;
          c.x.v = c.y.v = c.r.v = 0;
          c.slot.x = DECK.length + 0.5;
          s.order.push(i);
        }
        return;
      }
      if (i === s.drag) {
        // tilt from the grab point, like a card held at one spot
        const k = s.gy < 0.12 ? 1 : -1;
        c.r.x = approach(c.r.x, (c.x.x / cw) * 22 * k, 18, f.dt);
      } else if (!(s.demo >= 0 && i === top)) {
        spring(c.x, 0, 220, 16, f.dt);
        spring(c.y, 0, 220, 16, f.dt);
        spring(c.r, 0, 220, 16, f.dt);
      } else c.r.x = approach(c.r.x, (c.x.x / cw) * 22, 10, f.dt);
      const slot = s.order.indexOf(i);
      const before = c.slot.x;
      spring(c.slot, slot, 170, f.reduced ? 26 : 13, f.dt);
      if (slot === 0 && before > 0.5 && c.slot.x <= 0.5) f.emit({ name: 'paper', gain: 0.25, rate: 1.2 });
    });
  },
});

export default function SwipeStack() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, cw, ch } = geom(w, h);
  const u = cw / 100;
  // draw back to front: stacked cards by slot, then any flying cards on top
  const ids = s.cards.map((_, i) => i).filter((i) => !s.cards[i].fly).sort((a, b) => s.cards[b].slot.x - s.cards[a].slot.x);
  const flying = s.cards.map((_, i) => i).filter((i) => s.cards[i].fly);

  const card = (i: number) => {
    const c = s.cards[i];
    const d = DECK[i];
    const slot = Math.max(0, c.slot.x);
    const sc = 1 - Math.min(slot, 3.5) * 0.055 + (i === s.drag ? 0.03 : 0);
    const oy = Math.min(slot, 3.5) * ch * 0.065;
    const op = clamp(4.2 - slot);
    const dx = c.x.x;
    const stamp = c.fly ? 0 : clamp(Math.abs(dx) / (cw * 0.35));
    const lifted = i === s.drag || c.fly ? 1 : 0;
    const dim = clamp(slot * 0.14, 0, 0.5);
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: cx - cw / 2,
          top: cy - ch / 2,
          width: cw,
          height: ch,
          borderRadius: u * 6,
          overflow: 'hidden',
          opacity: op,
          transform: `translate(${dx.toFixed(1)}px, ${(c.y.x + oy).toFixed(1)}px) rotate(${c.r.x.toFixed(2)}deg) scale(${sc.toFixed(4)})`,
          transformOrigin: '50% 60%',
          willChange: 'transform, opacity',
          boxShadow: `0 ${u * (2 + lifted * 6)}px ${u * (6 + lifted * 12)}px rgba(0,0,0,${0.35 + lifted * 0.2}), 0 0 0 1px rgba(255,255,255,0.08)`,
          background: '#111',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 135" preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id={`sk${uid}${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={d.sky[2]} />
              <stop offset="0.55" stopColor={d.sky[1]} />
              <stop offset="1" stopColor={d.sky[0]} />
            </linearGradient>
            <linearGradient id={`fd${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.5" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.75" />
            </linearGradient>
          </defs>
          <rect width="100" height="135" fill={`url(#sk${uid}${i})`} />
          {/* sun with a soft halo, a few stars in the high sky */}
          <circle cx={30 + i * 11} cy={58 - i * 3} r={30} fill={d.sun} opacity="0.12" />
          <circle cx={30 + i * 11} cy={58 - i * 3} r={20} fill={d.sun} opacity="0.18" />
          <circle cx={30 + i * 11} cy={58 - i * 3} r={13 + (i % 2) * 4} fill={d.sun} opacity="0.95" />
          {[12, 27, 48, 66, 83, 91, 39].map((x, k) => (
            <circle key={k} cx={x} cy={6 + ((k * 13 + i * 5) % 26)} r={0.5 + (k % 2) * 0.3} fill="#fff" opacity={0.35 + (k % 3) * 0.2} />
          ))}
          <path d={`M0 ${78 + i} Q 20 ${62 - i * 2} 42 ${74} T 100 ${66 + i * 2} V135 H0Z`} fill={d.hills[0]} />
          <path d={`M0 ${94} Q 30 ${80 + i} 58 ${92} T 100 ${86} V135 H0Z`} fill={d.hills[1]} />
          <rect width="100" height="135" fill={`url(#fd${uid})`} />
        </svg>
        <div style={{ position: 'absolute', left: u * 7, bottom: u * 8, right: u * 7, color: '#fff' }}>
          <div style={{ fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: u * 11, lineHeight: 1, letterSpacing: -u * 0.3 }}>{d.name}</div>
          <div style={{ fontFamily: "'Inter Variable', Inter, system-ui", fontSize: u * 4.8, opacity: 0.8, marginTop: u * 2 }}>{d.sub}</div>
        </div>
        {/* the verdict stamp appears as you pull the card aside */}
        <div
          style={{
            position: 'absolute',
            top: u * 9,
            [dx > 0 ? 'left' : 'right']: u * 8,
            padding: `${u * 1.2}px ${u * 3}px`,
            border: `${u * 1}px solid ${dx > 0 ? '#5dffb0' : '#ff5d7a'}`,
            color: dx > 0 ? '#5dffb0' : '#ff5d7a',
            borderRadius: u * 2,
            fontFamily: "'Archivo Variable', Archivo, system-ui",
            fontWeight: 900,
            fontSize: u * 8,
            letterSpacing: u * 0.5,
            transform: `rotate(${dx > 0 ? -14 : 14}deg) scale(${1.3 - stamp * 0.3})`,
            opacity: stamp,
          }}
        >
          {dx > 0 ? 'GO' : 'SKIP'}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: '#0b0d1a', opacity: dim }} />
      </div>
    );
  };

  return (
    <Stage fx={fx} cursor={s.drag >= 0 ? 'grabbing' : 'grab'} style={{ background: 'radial-gradient(90% 80% at 50% 35%, #2b2540 0%, #15121f 55%, #09080d 100%)' }}>
      <div style={{ position: 'absolute', left: cx - cw * 0.55, top: cy + ch * 0.48, width: cw * 1.1, height: ch * 0.14, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.6), rgba(0,0,0,0))' }} />
      {ids.map(card)}
      {flying.map(card)}
      <button type="button" aria-label="Swipe the top card" style={{ position: 'absolute', left: cx - cw / 2, top: cy - ch / 2, width: cw, height: ch, opacity: 0 }} />
    </Stage>
  );
}
