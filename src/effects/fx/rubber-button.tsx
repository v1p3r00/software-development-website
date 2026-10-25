import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * A rubber button. Grab it and pull: a blob of rubber follows your hand while the body stays
 * pinned, the neck between them thins as it stretches (volume is kept) and resistance grows.
 * Let go and it snaps home, overshoots through the anchor and twangs to rest.
 */

interface S {
  ex: Spring; // stretch vector, px
  ey: Spring;
  grab: boolean;
  gx: number; // where the grab started
  gy: number;
  tension: number; // last tension step (for creaks)
  idle: number;
  demo: number;
  demoGrab: boolean;
  ghost: number;
  hx: number; // the hand (real or ghost) for drawing
  hy: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const bw = Math.min(m * 0.6, w * 0.42, 340);
  const bh = bw * 0.36;
  return { cx: w / 2, cy: h / 2, bw, bh, L: Math.min(w, h) * 0.7 };
}

export const sim = defineSim<S>({
  init: (w, h) => ({ ex: sp(), ey: sp(), grab: false, gx: 0, gy: 0, tension: 0, idle: 0, demo: 0, demoGrab: false, ghost: 0, hx: w / 2, hy: h / 2 }),
  step(s, f) {
    const { cx, cy, bw, bh, L } = geom(f.w, f.h);
    const dt = f.dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;
    const onBtn = Math.abs(f.p.x - cx) < bw / 2 && Math.abs(f.p.y - cy) < bh / 2;
    const snap = () => {
      const k = Math.hypot(s.ex.x, s.ey.x) / L;
      f.emit({ name: 'boing', gain: clamp(k * 1.5, 0.3, 1), rate: 0.9 + k * 0.5 });
      f.emit({ name: 'pop', gain: clamp(k, 0.2, 0.7), rate: 0.7 });
    };
    if (f.pressed && onBtn) {
      s.grab = true;
      s.gx = f.p.x;
      s.gy = f.p.y;
      f.emit({ name: 'squeak', gain: 0.35, rate: 1.2 });
    }
    if (s.grab && !f.p.down) {
      s.grab = false;
      snap();
    }

    // self-demo: the ghost hand grabs the button, pulls it out in a new direction and lets go
    let tx = 0;
    let ty = 0;
    if (!s.grab && s.idle > 2.2) {
      s.demo += dt;
      const ph = s.demo % 3.2;
      const n = Math.floor(s.demo / 3.2);
      const ang = [-0.5, 3.6, 0.9, 2.4][n % 4];
      const dist = L * 1.4 * clamp((ph - 0.25) / 0.8) * (ph < 1.4 ? 1 : 0);
      const want = ph > 0.15 && ph < 1.4;
      if (want && !s.demoGrab) f.emit({ name: 'squeak', gain: 0.25, rate: 1.2 });
      if (!want && s.demoGrab) snap();
      s.demoGrab = want;
      tx = Math.cos(ang) * dist;
      ty = Math.sin(ang) * dist * 0.7;
      s.ghost = approach(s.ghost, 1, 4, dt);
    } else {
      s.demo = 0;
      s.demoGrab = false;
      s.ghost = approach(s.ghost, 0, 10, dt);
    }
    if (s.grab) {
      tx = f.p.x - s.gx;
      ty = f.p.y - s.gy;
    }
    const held = s.grab || s.demoGrab;
    // rubber resists more the further it goes
    const d = Math.hypot(tx, ty);
    const eff = d > 0 ? (L * Math.tanh(d / L)) / d : 0;
    const k = f.reduced ? 2 : 1;
    if (held) {
      spring(s.ex, tx * eff, 700, 45, dt);
      spring(s.ey, ty * eff, 700, 45, dt);
    } else {
      spring(s.ex, 0, 380, 5.5 * k, dt);
      spring(s.ey, 0, 380, 5.5 * k, dt);
    }
    // a creak for every notch of tension
    const ten = Math.floor((Math.hypot(s.ex.x, s.ey.x) / L) * 5);
    if (held && ten > s.tension) f.emit({ name: 'squeak', gain: 0.15 + ten * 0.05, rate: 0.8 + ten * 0.15 });
    s.tension = ten;
    s.hx = cx + s.ex.x;
    s.hy = cy + s.ey.x;
  },
});

export default function RubberButton() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, bw, bh, L } = geom(w, h);
  const ex = s.ex.x;
  const ey = s.ey.x;
  const len = Math.hypot(ex, ey);
  const k = clamp(len / L, 0, 1.3);
  // the body gives up a little volume to the neck
  const pw = bw * (1 - 0.14 * k);
  const ph = bh * (1 - 0.1 * k);
  const ox = ex * 0.1;
  const oy = ey * 0.1;
  const endR = bh * 0.56 * (1 - 0.2 * k);
  const neck = bh * Math.max(0.15, 0.48 - 0.4 * k);
  const beads = [];
  const n = 14;
  for (let i = 1; i <= n; i++) {
    const u = i / (n + 1);
    // thinnest in the middle of the neck
    const r = endR + (neck - endR) * Math.sin(u * Math.PI) * Math.min(1, k * 3);
    beads.push(<circle key={i} cx={cx + ox + (ex - ox) * u} cy={cy + oy + (ey - oy) * u} r={Math.max(2, r)} fill="#fff" />);
  }
  const shape = (
    <g>
      <rect x={cx + ox - pw / 2} y={cy + oy - ph / 2} width={pw} height={ph} rx={ph / 2} fill="#fff" />
      {beads}
      <circle cx={cx + ex} cy={cy + ey} r={endR} fill="#fff" />
    </g>
  );
  const blur = bh * 0.09;
  const ang = (Math.atan2(ey, ex) * 180) / Math.PI;
  const font = "'Archivo Variable', Archivo, system-ui, sans-serif";
  const m = Math.min(w, h);

  return (
    <Stage fx={fx} cursor={s.grab ? 'grabbing' : 'grab'} style={{ background: 'radial-gradient(120% 90% at 50% 30%, #1b2a2e 0%, #0e171a 60%, #070c0e 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          {/* metaball merge: blur + alpha threshold welds the beads into one smooth rubber body */}
          <filter id={`goo${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur} />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
          <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
            <g filter={`url(#goo${uid})`}>{shape}</g>
          </mask>
          <linearGradient id={`rub${uid}`} gradientUnits="userSpaceOnUse" x1={0} y1={Math.min(cy, cy + ey) - bh * 0.6} x2={0} y2={Math.max(cy, cy + ey) + bh * 0.6}>
            <stop offset="0" stopColor="#ffe873" />
            <stop offset="0.5" stopColor="#ffc21a" />
            <stop offset="1" stopColor="#d47f00" />
          </linearGradient>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={bh * 0.2} />
          </filter>
        </defs>
        {/* the anchor pin: a dark socket the body is stuck to */}
        <ellipse cx={cx} cy={cy + bh * 0.62} rx={bw * 0.46} ry={bh * 0.16} fill="#000" opacity={0.5} filter={`url(#sh${uid})`} />
        <g opacity={0.45} transform={`translate(0 ${bh * 0.35})`} filter={`url(#sh${uid})`}>
          <rect x={0} y={0} width={w} height={h} fill="#000" mask={`url(#m${uid})`} />
        </g>
        <rect x={0} y={0} width={w} height={h} fill={`url(#rub${uid})`} mask={`url(#m${uid})`} />
        {/* rim darkening and a long gloss streak that follows the stretch */}
        <g mask={`url(#m${uid})`}>
          <rect x={cx + ox - pw / 2 + ph * 0.25} y={cy + oy - ph * 0.36} width={pw - ph * 0.5} height={ph * 0.16} rx={ph * 0.08} fill="#fff" opacity={0.55} />
          <line x1={cx + ox} y1={cy + oy - ph * 0.2} x2={cx + ex} y2={cy + ey - endR * 0.55} stroke="#fff" strokeOpacity={0.35 * Math.min(1, k * 3)} strokeWidth={Math.max(2, neck * 0.25)} strokeLinecap="round" />
          <circle cx={cx + ex - endR * 0.3} cy={cy + ey - endR * 0.4} r={endR * 0.22} fill="#fff" opacity={0.6 * Math.min(1, k * 3)} />
        </g>
        {/* the label is printed on the rubber: it stretches along the pull */}
        <g transform={`translate(${cx + ox} ${cy + oy}) rotate(${ang}) scale(${1 + k * 0.18} ${1 - k * 0.12}) rotate(${-ang})`}>
          <text textAnchor="middle" dominantBaseline="central" fontFamily={font} fontWeight={900} fontSize={bh * 0.32} letterSpacing={bh * 0.02} fill="#6b3a00" opacity={0.9}>
            PULL ME
          </text>
        </g>
        {s.ghost > 0.02 && (
          <g opacity={s.ghost * (s.demoGrab ? 1 : 0.5)} transform={`translate(${s.hx} ${s.hy})`}>
            <circle r={m * 0.035} fill="#fff" opacity={0.15} />
            <circle r={m * 0.012} fill="#fff" />
          </g>
        )}
      </svg>
      <button
        type="button"
        aria-label="Pull me"
        style={{ position: 'absolute', left: cx - bw / 2, top: cy - bh / 2, width: bw, height: bh, opacity: 0, borderRadius: bh / 2 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
