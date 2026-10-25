import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach, smooth } from '../kit';
import type { Spring } from '../kit';

/**
 * A magnetic button. Inside its field it leans toward the pointer (translate + 3D tilt, the label
 * moving further than the body for parallax); outside it snaps home on an under-damped spring.
 * Iron filings on the desk align to the field between the button and the pointer.
 */

interface S {
  x: Spring; // body offset, px
  y: Spring;
  rx: Spring; // tilt, deg
  ry: Spring;
  sq: Spring; // press squish
  pull: number; // 0..1 how strongly the pointer holds it
  inField: boolean;
  gx: number; // the pointer the field follows (real or ghost)
  gy: number;
  ghost: number; // ghost-pointer visibility
  idle: number;
  demo: number;
  ripple: number; // seconds since the last press (for the ring)
  pressing: boolean;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const bw = Math.min(m * 0.62, w * 0.6, 420);
  const bh = bw * 0.24;
  return { cx: w / 2, cy: h / 2, bw, bh, R: bw * 0.95 };
}

export const sim = defineSim<S>({
  init: (w, h) => ({ x: sp(), y: sp(), rx: sp(), ry: sp(), sq: sp(), pull: 0, inField: false, gx: w / 2, gy: h * 0.9, ghost: 0, idle: 3, demo: 0, ripple: 9, pressing: false }),
  step(s, f) {
    const { cx, cy, bw, bh, R } = geom(f.w, f.h);
    const dt = f.dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;
    s.ripple += dt;

    // the ghost: a pointer that wanders in, circles the button and drifts away again
    let tx = f.p.x;
    let ty = f.p.y;
    let active = f.p.over;
    if (s.idle > 2.2) {
      s.demo += dt;
      const ph = (s.demo % 5) / 5;
      const a = ph * Math.PI * 2;
      const near = smooth(Math.sin(ph * Math.PI) * 1.6);
      tx = cx + Math.cos(a * 2) * bw * (1.1 - near * 0.62);
      ty = cy + Math.sin(a * 3) * bh * (2.6 - near * 1.7);
      active = true;
      s.ghost = approach(s.ghost, 1, 4, dt);
    } else {
      s.demo = 0;
      s.ghost = approach(s.ghost, 0, 10, dt);
    }
    s.gx = s.ghost > 0.01 && !f.p.over ? approach(s.gx, tx, 12, dt) : tx;
    s.gy = s.ghost > 0.01 && !f.p.over ? approach(s.gy, ty, 12, dt) : ty;

    // field strength: 1 on the button, fading to 0 at radius R from its edge
    const dx = s.gx - cx;
    const dy = s.gy - cy;
    const ex = Math.max(0, Math.abs(dx) - bw / 2);
    const ey = Math.max(0, Math.abs(dy) - bh / 2);
    const dEdge = Math.hypot(ex, ey);
    const pull = active ? smooth(1 - dEdge / (R * 0.6)) : 0;
    const was = s.inField;
    s.inField = pull > 0.05;
    if (s.inField && !was) f.emit({ name: 'whoosh', gain: 0.25, rate: 1.4 });
    if (!s.inField && was) f.emit({ name: 'boing', gain: 0.35, rate: 1.3, pan: clamp(dx / bw, -1, 1) * 0.5 });
    s.pull = approach(s.pull, pull, 14, dt);

    const onBtn = Math.abs(f.p.x - cx - s.x.x) < bw / 2 && Math.abs(f.p.y - cy - s.y.x) < bh / 2;
    if (f.pressed && onBtn) {
      s.pressing = true;
      s.ripple = 0;
      f.emit({ name: 'click', gain: 0.7 });
    }
    if (s.pressing && !f.p.down) {
      s.pressing = false;
      s.sq.v -= 6;
      f.emit({ name: 'pop', gain: 0.4, rate: 1.3 });
    }

    // lean: a fraction of the way toward the pointer; tight when held, loose and wobbly when let go
    const k = s.inField ? 260 : 180;
    const c = s.inField ? 20 : 7;
    const damp = f.reduced ? 2.5 : 1;
    spring(s.x, dx * 0.42 * s.pull, k, c * damp, dt);
    spring(s.y, dy * 0.5 * s.pull, k, c * damp, dt);
    spring(s.ry, clamp(dx / bw, -1, 1) * 18 * s.pull, k, c * damp, dt);
    spring(s.rx, -clamp(dy / bh, -2, 2) * 9 * s.pull, k, c * damp, dt);
    spring(s.sq, s.pressing ? 1 : 0, 500, 22, dt);
  },
});

export default function MagneticButton() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, bw, bh } = geom(w, h);
  const bx = cx + s.x.x;
  const by = cy + s.y.x;
  const pull = s.pull;

  // iron filings: a dipole field from the button (N on the left, S on the right),
  // plus a sink at the pointer that grows with the pull
  const m = Math.min(w, h);
  const gap = Math.max(16, m / 26);
  const seg = gap * 0.36;
  let d = '';
  let dHi = '';
  const nX = bx - bw * 0.35;
  const sX = bx + bw * 0.35;
  for (let y = gap / 2; y < h; y += gap) {
    for (let x = gap / 2; x < w; x += gap) {
      const qx = x + ((y / gap) % 2) * gap * 0.5;
      const fld = (px: number, py: number, q: number) => {
        const vx = qx - px;
        const vy = y - py;
        const r2 = vx * vx + vy * vy + gap * gap;
        return [(q * vx) / r2, (q * vy) / r2];
      };
      const a = fld(nX, by, 1);
      const b = fld(sX, by, -1);
      const c = fld(s.gx, s.gy, -1.4 * pull);
      const fx2 = a[0] + b[0] + c[0];
      const fy2 = a[1] + b[1] + c[1];
      const mag = Math.hypot(fx2, fy2) || 1e-9;
      const ux = (fx2 / mag) * seg;
      const uy = (fy2 / mag) * seg;
      const strong = mag * m > 2.2;
      const str = `M${(qx - ux).toFixed(1)} ${(y - uy).toFixed(1)}l${(ux * 2).toFixed(1)} ${(uy * 2).toFixed(1)}`;
      if (strong) dHi += str;
      else d += str;
    }
  }

  const sq = s.sq.x;
  const rip = s.ripple;
  const font = "'Archivo Variable', Archivo, system-ui, sans-serif";

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(120% 90% at 50% 40%, #1a1d2b 0%, #0d0f17 60%, #07080c 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`halo${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#7c6bff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#7c6bff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={d} stroke="#8a93b8" strokeOpacity={0.22} strokeWidth={1.2} strokeLinecap="round" />
        <path d={dHi} stroke="#b9a8ff" strokeOpacity={0.55} strokeWidth={1.4} strokeLinecap="round" />
        <ellipse cx={bx + s.x.x * 0.3} cy={by + bh * 0.9} rx={bw * 0.7} ry={bh * 0.7} fill={`url(#halo${uid})`} opacity={0.4 + pull * 0.6} />
        {rip < 0.8 && (
          <rect
            x={bx - bw / 2 - rip * 60}
            y={by - bh / 2 - rip * 60}
            width={bw + rip * 120}
            height={bh + rip * 120}
            rx={bh / 2 + rip * 60}
            fill="none"
            stroke="#c4b8ff"
            strokeWidth={2}
            opacity={(1 - rip / 0.8) * 0.8}
          />
        )}
      </svg>
      {/* the button body: a 3D-tilted pill; its label leans further (parallax) */}
      <div style={{ position: 'absolute', left: bx - bw / 2, top: by - bh / 2, width: bw, height: bh, perspective: bw * 2.2, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: bh / 2,
            transform: `rotateX(${s.rx.x}deg) rotateY(${s.ry.x}deg) scale(${1 - sq * 0.05}, ${1 - sq * 0.08})`,
            background: 'linear-gradient(180deg, #2c2a48 0%, #19182b 100%)',
            boxShadow: `0 ${bh * 0.3}px ${bh * 0.6}px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1.5px rgba(160,140,255,${0.25 + pull * 0.5}), 0 0 ${bh * pull}px rgba(124,107,255,${pull * 0.6})`,
            overflow: 'hidden',
          }}
        >
          {/* a sheen that slides with the tilt */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(60% 120% at ${50 + s.ry.x * 2.2}% ${-10 - s.rx.x * 3}%, rgba(200,190,255,0.45), rgba(200,190,255,0) 70%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: bh * 0.22,
              transform: `translate(${clamp(s.x.x * 0.35, -bw * 0.12, bw * 0.12)}px, ${clamp(s.y.x * 0.35, -bh * 0.12, bh * 0.12)}px)`,
              fontFamily: font,
              fontWeight: 750,
              fontSize: bh * 0.3,
              letterSpacing: '0.01em',
              color: '#efeaff',
            }}
          >
            <span>Let’s talk</span>
            <span
              style={{
                display: 'inline-flex',
                width: bh * 0.52,
                height: bh * 0.52,
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#7c6bff',
                color: '#fff',
                fontSize: bh * 0.28,
                transform: `translate(${clamp(s.x.x * 0.25, -bh * 0.15, bh * 0.15)}px, ${clamp(s.y.x * 0.25, -bh * 0.06, bh * 0.06)}px)`,
                boxShadow: `0 0 ${bh * 0.4 * pull}px rgba(124,107,255,0.9)`,
              }}
            >
              →
            </span>
          </div>
        </div>
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden>
        {/* the ghost pointer for the self-demo */}
        {s.ghost > 0.02 && (
          <g opacity={s.ghost * 0.9}>
            <circle cx={s.gx} cy={s.gy} r={m * 0.03} fill="#c4b8ff" opacity={0.15} />
            <circle cx={s.gx} cy={s.gy} r={m * 0.008} fill="#fff" />
          </g>
        )}
      </svg>
      <button
        type="button"
        aria-label="Let's talk"
        style={{ position: 'absolute', left: bx - bw / 2, top: by - bh / 2, width: bw, height: bh, opacity: 0, borderRadius: bh / 2 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
