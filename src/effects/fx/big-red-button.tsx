import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * The big red button. A hinged acrylic safety cover has to be flipped up first (it swings on a
 * spring and bounces against its stop); then the dome can be pressed. On press the whole console
 * shakes, the alarm strobes and a shock ring rolls out. The cover slams shut again on its own.
 */

interface S {
  lid: Spring; // cover angle, radians (0 closed … ~1.95 open)
  open: boolean;
  btn: Spring; // button travel 0..1
  pressing: boolean;
  shake: number; // shake energy
  alarm: number; // seconds since the launch (-1 = none)
  openFor: number;
  idle: number;
  demo: number;
  t: number;
}

const OPEN = 1.95;
const C = 0.62; // depth foreshortening

function geom(w: number, h: number) {
  const P = Math.min(Math.min(w, h) * 0.8, w * 0.7, 640);
  const rB = P * 0.2;
  const bx = w / 2;
  const by = h / 2 + P * 0.14;
  const Wc = rB * 2.5;
  const Dc = rB * 2.3;
  return { P, rB, bx, by, Wc, Dc, hingeY: by - (Dc / 2) * C, Hw: P * 0.11, hB: P * 0.075 };
}

export const sim = defineSim<S>({
  init: () => ({ lid: sp(), open: false, btn: sp(), pressing: false, shake: 0, alarm: -1, openFor: 0, idle: 0, demo: 0, t: 0 }),
  step(s, f) {
    const g = geom(f.w, f.h);
    const dt = f.dt;
    s.t += dt;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;
    const onBtn = Math.hypot((f.p.x - g.bx) / g.rB, (f.p.y - g.by) / (g.rB * C)) < 1.25;
    const onCover = Math.abs(f.p.x - g.bx) < g.Wc / 2 && f.p.y > g.hingeY - g.Dc * 0.9 && f.p.y < g.by + g.Dc * C;
    const flip = (open: boolean) => {
      s.open = open;
      s.openFor = 0;
      f.emit({ name: open ? 'whoosh' : 'click', gain: open ? 0.35 : 0.6, rate: open ? 1.3 : 0.8 });
    };
    const launch = () => {
      s.pressing = true;
      s.alarm = 0;
      s.shake = f.reduced ? 0.25 : 1;
      f.emit({ name: 'thud', gain: 1, rate: 0.7 });
      f.emit({ name: 'zap', gain: 0.8 });
      f.emit({ name: 'buzz', gain: 0.5 });
    };
    if (f.pressed) {
      if (!s.open && onCover) flip(true);
      else if (s.open && s.lid.x > 1.1 && onBtn) launch();
      else if (s.open && f.p.y < g.hingeY) flip(false);
    }
    if (!f.p.down && s.pressing && s.idle < 0.5) s.pressing = false;

    // self-demo: open … press … let the alarm play … close
    if (s.idle > 2.2) {
      s.demo += dt;
      const ph = s.demo % 5.2;
      if (ph < 0.6 && !s.open && s.alarm < 0) flip(true);
      if (ph > 1.1 && ph < 1.4 && s.open && !s.pressing && (s.alarm < 0 || s.alarm > 2)) launch();
      if (ph > 1.4) s.pressing = false;
    } else s.demo = 0;

    // the cover closes by itself a while after launch (or if left open)
    if (s.open) {
      s.openFor += dt;
      if (s.openFor > (s.alarm >= 0 ? 3.2 : 4.5) && !s.pressing) flip(false);
    }
    const prev = s.lid.x;
    spring(s.lid, s.open ? OPEN : 0, s.open ? 70 : 90, s.open ? 7 : 6, dt);
    // stops: the lid bounces off the open stop and the closed seat
    if (s.lid.x > OPEN + 0.12) {
      s.lid.x = OPEN + 0.12;
      s.lid.v *= -0.35;
    }
    if (s.lid.x < 0) {
      if (prev > 0.02 && s.lid.v < -1.5) {
        f.emit({ name: 'thud', gain: 0.5, rate: 1.5 });
        s.shake = Math.max(s.shake, f.reduced ? 0.05 : 0.18);
      }
      s.lid.x = 0;
      s.lid.v *= -0.3;
    }
    spring(s.btn, s.pressing ? 1 : 0, 900, s.pressing ? 40 : 14, dt);
    s.shake = approach(s.shake, 0, 2.2, dt);
    if (s.alarm >= 0) {
      s.alarm += dt;
      if (s.alarm > 3) s.alarm = -1;
    }
  },
});

export default function BigRedButton() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const { P, rB, bx, by, Wc, Dc, hingeY, Hw, hB } = geom(w, h);
  const m = Math.min(w, h);
  const sh = s.shake * s.shake;
  const ox = (Math.sin(t * 57) + Math.sin(t * 23) * 0.6) * sh * m * 0.03;
  const oy = (Math.cos(t * 49) + Math.sin(t * 31) * 0.6) * sh * m * 0.03;
  const rot = Math.sin(t * 37) * sh * 2;
  const al = s.alarm;
  const strobe = al >= 0 ? (Math.sin(al * 22) > 0 ? 1 : 0.25) * Math.min(1, (3 - al) * 1.5) : 0;

  // the cover is a box hinged at its back-bottom edge. Local coords: x across, u depth from the
  // hinge, v height. Rotate by th about the hinge, then project with a touch of perspective
  // (higher and nearer points spread out) so the side walls read.
  const th = s.lid.x;
  const ct = Math.cos(th);
  const st = Math.sin(th);
  const pr = (x: number, u: number, v: number): [number, number] => {
    const dep = u * ct - v * st;
    const hgt = u * st + v * ct;
    const yy = hingeY + dep * C - hgt * 0.8;
    const pf = 1 + (hgt / P) * 0.45 + ((hingeY + dep * C - by) / P) * 0.22;
    return [bx + x * pf, yy];
  };
  const X = Wc / 2;
  const q = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const BL0 = pr(-X, 0, 0), BR0 = pr(X, 0, 0), FL0 = pr(-X, Dc, 0), FR0 = pr(X, Dc, 0);
  const BL1 = pr(-X, 0, Hw), BR1 = pr(X, 0, Hw), FL1 = pr(-X, Dc, Hw), FR1 = pr(X, Dc, Hw);
  const behind = th > 1.25;
  const press = s.btn.x;
  const hb = hB * (1 - press * 0.75);
  const glint = (a: number, b: number): [number, number] => pr(-X + Wc * a, Dc * b, Hw);

  const cover = (
    <g strokeLinejoin="round">
      {/* back wall, side walls, front wall, lid: translucent acrylic with bright edges */}
      <polygon points={q([BL0, BR0, BR1, BL1])} fill="#ff6b6b" fillOpacity={0.1} stroke="#ffc9c9" strokeOpacity={0.35} strokeWidth={1.2} />
      <polygon points={q([BL0, FL0, FL1, BL1])} fill="#ff6b6b" fillOpacity={0.14} stroke="#ffc9c9" strokeOpacity={0.5} strokeWidth={1.5} />
      <polygon points={q([BR0, FR0, FR1, BR1])} fill="#ff6b6b" fillOpacity={0.14} stroke="#ffc9c9" strokeOpacity={0.5} strokeWidth={1.5} />
      <polygon points={q([FL0, FR0, FR1, FL1])} fill="#ff8080" fillOpacity={0.2} stroke="#ffd0d0" strokeOpacity={0.7} strokeWidth={1.5} />
      <polygon points={q([BL1, BR1, FR1, FL1])} fill={`url(#acr${uid})`} stroke="#ffe0e0" strokeOpacity={0.8} strokeWidth={2} />
      <polygon points={q([glint(0.1, 0.08), glint(0.28, 0.08), glint(0.16, 0.92), glint(-0.02, 0.92)].map((p) => [Math.max(p[0], FL1[0]), p[1]] as [number, number]))} fill="#fff" opacity={0.16} />
      {/* finger tab on the front edge */}
      <rect x={(FL1[0] + FR1[0]) / 2 - Wc * 0.12} y={(FL1[1] + FL0[1]) / 2 - P * 0.012} width={Wc * 0.24} height={P * 0.024} rx={P * 0.012} fill="#ffd4d4" opacity={0.8} />
      <text x={bx} y={(BL1[1] + FL1[1]) / 2} textAnchor="middle" dominantBaseline="central" fontFamily="'JetBrains Mono Variable', monospace" fontSize={P * 0.03} letterSpacing={P * 0.004} fill="#ffe2e2" opacity={0.6 * Math.max(0, ct)}>
        LIFT COVER
      </text>
    </g>
  );

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#0b0c0e' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="50%" cy="40%" r="75%">
            <stop offset="0" stopColor="#2a2d33" />
            <stop offset="1" stopColor="#0b0c0e" />
          </radialGradient>
          <linearGradient id={`plate${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b3f46" />
            <stop offset="1" stopColor="#24272c" />
          </linearGradient>
          <pattern id={`haz${uid}`} width={P * 0.06} height={P * 0.06} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={P * 0.06} height={P * 0.06} fill="#111" />
            <rect width={P * 0.03} height={P * 0.06} fill="#f5c400" />
          </pattern>
          <radialGradient id={`dome${uid}`} cx="40%" cy="30%" r="75%">
            <stop offset="0" stopColor="#ff8a7a" />
            <stop offset="0.35" stopColor="#f0201a" />
            <stop offset="1" stopColor="#7a0604" />
          </radialGradient>
          <linearGradient id={`side${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5a0302" />
            <stop offset="0.35" stopColor="#c2140e" />
            <stop offset="1" stopColor="#4a0201" />
          </linearGradient>
          <linearGradient id={`acr${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff9b9b" stopOpacity="0.3" />
            <stop offset="1" stopColor="#ff5c5c" stopOpacity="0.16" />
          </linearGradient>
          <radialGradient id={`al${uid}`} cx="50%" cy="0%" r="90%">
            <stop offset="0" stopColor="#ff2a1a" stopOpacity="0.8" />
            <stop offset="1" stopColor="#ff2a1a" stopOpacity="0" />
          </radialGradient>
          <filter id={`bl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={P * 0.02} />
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        <g transform={`translate(${ox} ${oy}) rotate(${rot} ${w / 2} ${h / 2})`}>
          {/* the console plate with bolts */}
          <rect x={bx - P * 0.5} y={by - P * 0.64} width={P} height={P * 0.98} rx={P * 0.05} fill={`url(#plate${uid})`} stroke="#4c5058" strokeWidth={1.5} />
          {[
            [-0.44, -0.56],
            [0.44, -0.56],
            [-0.44, 0.27],
            [0.44, 0.27],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={bx + x * P} cy={by + y * P} r={P * 0.016} fill="#1b1d21" />
              <line x1={bx + x * P - P * 0.01} y1={by + y * P} x2={bx + x * P + P * 0.01} y2={by + y * P} stroke="#5d626b" strokeWidth={P * 0.005} transform={`rotate(${i * 40 + 20} ${bx + x * P} ${by + y * P})`} />
            </g>
          ))}
          {/* status LEDs */}
          {[0, 1, 2, 3].map((i) => {
            const on = al >= 0 ? (Math.floor(al * 10 + i) % 2 === 0 ? 1 : 0.2) : i === 0 ? 1 : 0.25;
            const col = al >= 0 ? '#ff3b2f' : i === 0 ? '#38e07b' : '#4b5059';
            return <circle key={i} cx={bx - P * 0.12 + i * P * 0.08} cy={by - P * 0.53} r={P * 0.014} fill={col} opacity={on} />;
          })}
          <text x={bx} y={by - P * 0.44} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui, sans-serif" fontWeight={850} fontSize={P * 0.04} letterSpacing={P * 0.008} fill={al >= 0 ? '#ff6a5c' : '#c9ccd2'} opacity={al >= 0 ? 0.45 + strobe * 0.55 : 0.75}>
            {al >= 0 ? 'LAUNCH INITIATED' : 'DO NOT PRESS'}
          </text>
          {/* hazard ring around the well */}
          <ellipse cx={bx} cy={by} rx={rB * 1.55} ry={rB * 1.55 * C} fill={`url(#haz${uid})`} />
          <ellipse cx={bx} cy={by} rx={rB * 1.22} ry={rB * 1.22 * C} fill="#08090a" />
          {behind && cover}
          {/* the button: a red cylinder with a domed cap */}
          <ellipse cx={bx} cy={by + hB * 0.15} rx={rB * 1.08} ry={rB * 1.08 * C} fill="#000" opacity={0.6} filter={`url(#bl${uid})`} />
          <path d={`M${bx - rB} ${by} v${-hb} a${rB} ${rB * C} 0 0 0 ${rB * 2} 0 v${hb} a${rB} ${rB * C} 0 0 1 ${-rB * 2} 0Z`} fill={`url(#side${uid})`} />
          <ellipse cx={bx} cy={by - hb} rx={rB} ry={rB * C} fill={`url(#dome${uid})`} />
          <ellipse cx={bx - rB * 0.28} cy={by - hb - rB * C * 0.4} rx={rB * 0.42} ry={rB * C * 0.22} fill="#fff" opacity={0.35} />
          <ellipse cx={bx} cy={by - hb} rx={rB * 0.98} ry={rB * C * 0.98} fill="none" stroke="#ffb3a8" strokeOpacity={0.35} strokeWidth={1.5} />
          {/* the button's own glow while the alarm is live */}
          <ellipse cx={bx} cy={by - hb} rx={rB * 1.6} ry={rB * C * 1.6} fill="#ff2a1a" opacity={strobe * 0.35} filter={`url(#bl${uid})`} />
          {!behind && cover}
          {/* shock ring */}
          {al >= 0 && al < 0.6 && <ellipse cx={bx} cy={by} rx={rB * (1.3 + al * 6)} ry={rB * C * (1.3 + al * 6)} fill="none" stroke="#ffb199" strokeWidth={P * 0.02 * (1 - al / 0.6)} opacity={1 - al / 0.6} />}
        </g>
        {/* alarm wash + text */}
        <rect width={w} height={h} fill={`url(#al${uid})`} opacity={strobe * 0.9} />
        <rect width={w} height={h} fill="#ff2a1a" opacity={al >= 0 && al < 0.12 ? 0.35 * (1 - al / 0.12) : 0} />
      </svg>
      <button
        type="button"
        aria-label={s.open ? 'Big red button' : 'Lift the safety cover'}
        style={{ position: 'absolute', left: bx - Wc / 2, top: hingeY - Dc * 0.6, width: Wc, height: Dc * 1.2, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
