import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * A block of gelatin you can poke. Pressing squashes it into the plate (it spreads sideways to
 * keep its volume), dragging shears the top, and letting go fires it up into a stretch that
 * wobbles down through a few under-damped bounces — the bottom stays stuck to the plate.
 */

const N = 96;

interface S {
  sy: Spring; // vertical scale (1 = rest)
  shear: Spring; // top offset, in units of height
  jig: Spring; // a faster surface jiggle
  pressing: boolean;
  px: number; // where the press started (stage px)
  idle: number; // seconds since the last real interaction
  demo: number; // phase of the self-demo poke
  demoDown: boolean;
  hover: number;
  t: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const A = Math.min(m * 0.36, w * 0.36, 280); // half width
  const H = A * 0.95; // height
  return { cx: w / 2, by: h / 2 + H * 0.52, A, H };
}

export const sim = defineSim<S>({
  init: () => ({ sy: sp(1), shear: sp(), jig: sp(), pressing: false, px: 0, idle: 0, demo: 0, demoDown: false, hover: 0, t: 0 }),
  step(s, f) {
    const { cx, by, A, H } = geom(f.w, f.h);
    const dt = f.dt;
    s.t += dt;
    const inside = Math.abs(f.p.x - cx) < A * 1.05 && f.p.y < by + 8 && f.p.y > by - H * 1.1;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;

    if (f.pressed && inside) {
      s.pressing = true;
      s.px = f.p.x;
      s.demoDown = false;
      f.emit({ name: 'squeak', gain: 0.5, rate: 0.8 + f.rand() * 0.2 });
    }
    const release = () => {
      // stored squash becomes upward speed: the jelly overshoots into a tall stretch
      const e = 1 - s.sy.x;
      s.sy.v += e * 14;
      s.jig.v += e * 30;
      f.emit({ name: 'boing', gain: clamp(e * 2.5, 0.3, 1), rate: 1.1 });
    };
    if (s.pressing && !f.p.down) {
      s.pressing = false;
      release();
    }

    // self-demo: a poke every 2.6 s when nobody is around (with a little sideways drag)
    let demoShear = 0;
    if (!s.pressing && s.idle > 2.2) {
      s.demo += dt;
      const ph = s.demo % 2.6;
      const down = ph < 0.42;
      if (down && !s.demoDown) {
        s.demoDown = true;
        f.emit({ name: 'squeak', gain: 0.35, rate: 0.9 });
      }
      if (!down && s.demoDown) {
        s.demoDown = false;
        release();
      }
      if (down) demoShear = Math.sin((ph / 0.42) * Math.PI) * 0.18 * (Math.floor(s.demo / 2.6) % 2 ? 1 : -1);
    } else {
      s.demo = 0;
      if (s.demoDown) {
        s.demoDown = false;
        release();
      }
    }

    const held = s.pressing || s.demoDown;
    const shearT = s.pressing ? clamp((f.p.x - s.px) / A, -1, 1) * 0.35 : demoShear;
    s.hover = approach(s.hover, inside && f.p.over && !f.p.down ? 1 : 0, 8, dt);
    const soft = f.reduced ? 2.5 : 1;
    spring(s.sy, held ? 0.76 : 1 + s.hover * 0.03, 200, held ? 16 : 5.5 * soft, dt);
    spring(s.shear, shearT, 150, held ? 14 : 4 * soft, dt);
    spring(s.jig, 0, 900, 9 * soft, dt);
    // shear swinging past centre excites the jiggle a little (secondary motion)
    s.jig.v += -s.shear.v * dt * 6;
  },
});

export default function JellyButton() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, by, A, H } = geom(w, h);
  const sy = s.sy.x;
  const sx = Math.pow(1 / Math.max(0.4, sy), 0.75); // volume: squash → spread
  const sh = s.shear.x;
  const jg = s.jig.x;

  // outline: a soft dome-topped block, bottom glued to the plate
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    const c = Math.cos(th);
    const sn = Math.sin(th);
    const ex = sn < 0 ? 0.42 : 0.18; // rounder top, squarer base
    let x = Math.sign(c) * Math.pow(Math.abs(c), ex) * A;
    let y = Math.sign(sn) * Math.pow(Math.abs(sn), ex) * (H / 2) - H / 2; // 0 at base, -H at top
    const u = clamp(-y / H); // 0 base … 1 top
    const belly = Math.pow(Math.sin(u * Math.PI), 0.6) * (sx - 1) * 0.28 + 1; // the middle bulges more than the base
    x = x * (1 + (sx - 1) * 0.75) * belly + sh * H * Math.pow(u, 1.6);
    y = y * sy;
    // a fast ripple across the top surface
    y += jg * H * 0.05 * Math.pow(u, 3) * Math.cos((x / A) * Math.PI);
    pts.push([x, y]);
  }
  const path = `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z`;
  const topY = -H * sy;
  const tx = sh * H; // where the top went
  const squash = clamp(1 - sy, 0, 1);

  // a few suspended bubbles ride the deformation
  const bubbles = [
    [-0.45, 0.35, 0.05],
    [0.32, 0.55, 0.035],
    [0.1, 0.22, 0.025],
    [-0.15, 0.72, 0.03],
    [0.55, 0.28, 0.02],
  ];

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(110% 80% at 50% 25%, #2b1830 0%, #160c1a 55%, #09060b 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`body${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff7aa8" />
            <stop offset="0.45" stopColor="#f2286a" />
            <stop offset="1" stopColor="#8a0835" />
          </linearGradient>
          <radialGradient id={`core${uid}`} cx="50%" cy="62%" r="55%">
            <stop offset="0" stopColor="#ffd0de" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#ff5a8f" stopOpacity="0.15" />
            <stop offset="1" stopColor="#ff5a8f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`edge${uid}`} cx="50%" cy="45%" r="60%">
            <stop offset="0.7" stopColor="#40001a" stopOpacity="0" />
            <stop offset="1" stopColor="#40001a" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id={`spec${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`caus${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff4f88" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff4f88" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`plate${uid}`} cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#3a2a40" />
            <stop offset="1" stopColor="#140c17" />
          </radialGradient>
          <filter id={`b${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={A * 0.035} />
          </filter>
          <clipPath id={`clip${uid}`}>
            <path d={path} />
          </clipPath>
        </defs>
        {/* the plate */}
        <ellipse cx={cx} cy={by + H * 0.06} rx={A * 1.75} ry={A * 0.32} fill={`url(#plate${uid})`} />
        <ellipse cx={cx} cy={by + H * 0.02} rx={A * 1.6} ry={A * 0.26} fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth={1.5} />
        {/* light passing through the jelly paints the plate pink; brighter when squashed */}
        <ellipse cx={cx + tx * 0.3} cy={by + H * 0.04} rx={A * sx * 1.45} ry={A * 0.24} fill={`url(#caus${uid})`} opacity={0.7 + squash * 0.6} />
        <ellipse cx={cx} cy={by + 2} rx={A * sx * 1.02} ry={A * 0.09} fill="#000" opacity={0.6} filter={`url(#b${uid})`} />
        <g transform={`translate(${cx} ${by})`}>
          <path d={path} fill={`url(#body${uid})`} opacity={0.94} />
          <g clipPath={`url(#clip${uid})`}>
            <ellipse cx={tx * 0.5} cy={topY * 0.4} rx={A * sx * 0.8} ry={-topY * 0.55} fill={`url(#core${uid})`} />
            {bubbles.map(([bx, bu, br], i) => {
              const u = bu;
              const x = bx * A * (1 + (sx - 1) * 0.8) + sh * H * Math.pow(u, 1.6);
              const y = -u * H * sy;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={br * A} fill="#ffe3ec" fillOpacity="0.12" stroke="#ffe3ec" strokeOpacity="0.45" strokeWidth={1.2} />
                  <circle cx={x - br * A * 0.35} cy={y - br * A * 0.35} r={br * A * 0.28} fill="#fff" opacity="0.7" />
                </g>
              );
            })}
            <path d={path} fill={`url(#edge${uid})`} />
            {/* the top-face gloss sits on the dome and rides the shear */}
            <ellipse cx={tx * 0.85 - A * 0.12} cy={topY * 0.86} rx={A * sx * 0.62} ry={A * 0.11 * (0.6 + sy * 0.4)} fill={`url(#spec${uid})`} opacity={0.9} />
            <ellipse cx={-A * sx * 0.78 + tx * 0.35} cy={topY * 0.42} rx={A * 0.06} ry={-topY * 0.26} fill={`url(#spec${uid})`} opacity={0.55} />
            <ellipse cx={A * sx * 0.7 + tx * 0.6} cy={topY * 0.7} rx={A * 0.05} ry={A * 0.05} fill={`url(#spec${uid})`} opacity={0.75} />
          </g>
          {/* rim light along the dome */}
          <path d={path} fill="none" stroke="#ffc2d6" strokeOpacity={0.35} strokeWidth={1.4} />
          {/* label set inside the gel: it shears and squashes with it */}
          <text
            transform={`translate(${tx * 0.5} ${topY * 0.46}) skewX(${(-Math.atan(sh * 0.9) * 180) / Math.PI}) scale(${sx * 0.9 + 0.1} ${sy})`}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Archivo Variable', Archivo, system-ui, sans-serif"
            fontWeight={850}
            fontSize={A * 0.26}
            letterSpacing={A * 0.02}
            fill="#fff"
            fillOpacity={0.88}
            style={{ paintOrder: 'stroke', stroke: 'rgba(110,0,40,0.4)', strokeWidth: A * 0.012 }}
          >
            JELLY
          </text>
        </g>
      </svg>
      <button
        type="button"
        aria-label="Jelly button"
        style={{ position: 'absolute', left: cx - A, top: by - H, width: A * 2, height: H, opacity: 0, borderRadius: A * 0.4 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
