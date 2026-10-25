import { useId } from 'react';
import type { ReactNode } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * A neon sign on a brick wall. Flip the switch (click) and the tubes strike one after another:
 * each one stutters, catches, drops out and catches again before it holds, and its colour
 * spills onto the bricks around it. Lit, it hums with a faint shimmer and the odd sputter.
 * Idle, it switches itself off and on again.
 */

const TUBES = [
  { id: 'moon', color: '#ffd36b' },
  { id: 'open', color: '#ff4fa3' },
  { id: 'L', color: '#45e6ff' },
  { id: 'A', color: '#45e6ff' },
  { id: 'T', color: '#45e6ff' },
  { id: 'E', color: '#45e6ff' },
  { id: 'arrow', color: '#b07bff' },
];

interface Tube {
  b: number; // brightness 0..1
  lit: boolean; // the gas is conducting right now
  start: number; // when this tube begins to strike
  dur: number; // how long it stutters
  flip: number; // time to the next stutter toggle
  dip: number; // a brief sputter while running
}

interface S {
  tubes: Tube[];
  power: boolean;
  booted: boolean;
  since: number;
  idle: number;
  t: number;
}

function strike(s: S, rand: () => number) {
  s.since = 0;
  s.tubes.forEach((tb, i) => {
    tb.start = 0.25 + i * 0.32 + rand() * 0.15;
    tb.dur = 0.25 + rand() * 0.45;
    tb.flip = 0;
    tb.lit = false;
  });
}

export const sim = defineSim<S>({
  init: () => ({ tubes: TUBES.map(() => ({ b: 0, lit: false, start: 0, dur: 0, flip: 0, dip: 0 })), power: false, booted: false, since: 0, idle: 0, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    s.since += f.dt;
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    const toggle = () => {
      s.power = !s.power;
      f.emit({ name: 'switch', gain: 0.6 });
      if (s.power) strike(s, f.rand);
      else s.since = 0;
    };
    if (!s.booted && s.t > 0.5) {
      // switch on shortly after load
      s.booted = true;
      toggle();
    }
    if (f.pressed) toggle();
    for (const a of f.actions) if (a.type === 'toggle') toggle();
    // idle: on for a while, a short blackout, then on again
    if (s.idle > 2.5) {
      if (s.power && s.since > 6) toggle();
      else if (!s.power && s.since > 1.3) toggle();
    }
    s.tubes.forEach((tb, i) => {
      let want = 0;
      if (s.power) {
        const k = s.since - tb.start;
        if (k >= 0 && k < tb.dur) {
          // striking: the gas catches and drops out at random, holding longer as it warms
          tb.flip -= f.dt;
          if (tb.flip <= 0) {
            tb.lit = f.rand() < 0.35 + (k / tb.dur) * 0.6;
            tb.flip = 0.02 + f.rand() * 0.07;
            if (tb.lit) f.emit({ name: i === 0 && k < 0.05 ? 'spark' : 'buzz', gain: 0.18, rate: 0.9 + f.rand() * 0.3, pan: (i / TUBES.length - 0.5) * 0.8 });
          }
          want = tb.lit ? 1 : 0.05;
        } else if (k >= tb.dur) {
          // running: a faint shimmer, and now and then a sputter
          if (tb.dip <= 0 && f.rand() < f.dt * 0.08) tb.dip = 0.12 + f.rand() * 0.2;
          tb.dip -= f.dt;
          const sput = tb.dip > 0 ? (Math.sin(s.t * 90 + i) > 0 ? 0.25 : 1) : 1;
          want = (0.94 + 0.06 * Math.sin(s.t * 23 + i * 2.1)) * sput;
        }
      }
      // phosphor-free neon reacts almost instantly; a few ms of decay keeps it from aliasing
      tb.b += (want - tb.b) * clamp(f.dt * (want > tb.b ? 60 : 25));
    });
  },
});

export default function NeonSign() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const port = h > w * 1.05;
  const VW = port ? 600 : 1000;
  const VH = port ? 900 : 600;
  const L = port
    ? { moon: [300, 170, 75], open: [300, 445, 210], late: [300, 615, 118], arrow: [130, 700, 340] }
    : { moon: [190, 225, 72], open: [560, 270, 220], late: [560, 445, 120], arrow: [300, 515, 430] };
  const b = s.tubes.map((t) => t.b);
  const total = b.reduce((a, x) => a + x, 0) / b.length;

  const letters = ['L', 'A', 'T', 'E'];
  const [mx, my, mr] = L.moon;
  const [ox, oy, ofs] = L.open;
  const [lx, ly, lfs] = L.late;
  const [ax, ay, aw] = L.arrow;
  type P = { stroke: string; strokeWidth: number; opacity?: number; filter?: string };
  const ink = (p: P) => ({ fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...p });
  // each tube's shape, drawn with whatever stroke it is given
  const shapes: ((p: P) => ReactNode)[] = [
    (p) => <path d={`M ${mx + mr * 0.3} ${my - mr} A ${mr} ${mr} 0 1 0 ${mx + mr * 0.3} ${my + mr} A ${mr * 0.72} ${mr * 0.85} 0 1 1 ${mx + mr * 0.3} ${my - mr} Z`} {...ink(p)} />,
    (p) => (
      <text x={ox} y={oy} textAnchor="middle" fontFamily="Caveat, cursive" fontWeight={500} fontSize={ofs} {...ink(p)}>
        open
      </text>
    ),
    ...letters.map((ch, k) => (p: P) => (
      <text x={lx + (k - 1.5) * lfs * 0.95} y={ly} textAnchor="middle" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={300} fontSize={lfs} {...ink({ ...p, strokeWidth: p.strokeWidth * 0.8 })}>
        {ch}
      </text>
    )),
    (p) => <path d={`M ${ax} ${ay} L ${ax + aw} ${ay} M ${ax + aw - 26} ${ay - 22} L ${ax + aw} ${ay} L ${ax + aw - 26} ${ay + 22}`} {...ink(p)} />,
  ];
  // the light each tube throws on the wall
  const spill = [
    [mx, my, mr * 3, mr * 3, 1],
    [ox, oy - ofs * 0.2, ofs * 2.2, ofs * 1.2, 1],
    ...letters.map((_, k) => [lx + (k - 1.5) * lfs * 0.95, ly - lfs * 0.35, lfs * 1.3, lfs * 1.1, 0.8]),
    [ax + aw / 2, ay, aw * 0.7, 60, 0.7],
  ];
  const svgProps = { width: w, height: h, viewBox: `0 0 ${VW} ${VH}`, preserveAspectRatio: 'xMidYMid meet', style: { position: 'absolute' as const, inset: 0 } };

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#0b0a0e' }}>
      {/* the unlit wall, glass tubes and hardware: static, painted once */}
      <svg {...svgProps} role="img" aria-label="Neon sign: open late">
        <defs>
          <pattern id={`brick${uid}`} width="120" height="56" patternUnits="userSpaceOnUse">
            <rect width="120" height="56" fill="#1a1517" />
            <rect x="2" y="2" width="116" height="24" rx="3" fill="#2a2124" />
            <rect x="-58" y="30" width="116" height="24" rx="3" fill="#271f22" />
            <rect x="62" y="30" width="116" height="24" rx="3" fill="#2c2326" />
          </pattern>
        </defs>
        {/* backgrounds overshoot the view box so any stage aspect is covered */}
        <rect x={-VW} y={-VH} width={VW * 3} height={VH * 3} fill={`url(#brick${uid})`} />
        {[ox - ofs * 1.2, ox + ofs * 1.2].map((x, i) => (
          <g key={i}>
            <rect x={x - 2} y={oy - ofs * 0.55} width={4} height={ofs * 1.1 + lfs} fill="#444046" opacity={0.6} />
            <circle cx={x} cy={oy - ofs * 0.5} r={6} fill="#5a5560" />
            <circle cx={x} cy={ly} r={6} fill="#5a5560" />
          </g>
        ))}
        {shapes.map((el, i) => (
          <g key={i}>{el({ stroke: 'rgba(255,255,255,0.13)', strokeWidth: 7 })}</g>
        ))}
        <path d={`M ${VW - 60} ${VH} C ${VW - 60} ${VH - 120} ${VW - 120} ${VH - 140} ${VW - 150} ${VH - 90}`} stroke="#111" strokeWidth="5" fill="none" />
        <rect x={VW - 175} y={VH - 110} width={50} height={70} rx={8} fill="#2d2a30" stroke="#4a4650" />
        <rect x={VW - 158} y={s.power ? VH - 102 : VH - 74} width={16} height={26} rx={4} fill={s.power ? '#7dffb0' : '#8a8590'} />
      </svg>
      {/* each lit tube is its own layer: glow + coloured gas + hot white core, plus its spill on
          the bricks. Only the layer's opacity changes per frame, so flicker costs nothing. */}
      {shapes.map((el, i) => {
        const c = TUBES[i].color;
        const [ex, ey, erx, ery, eo] = spill[i];
        return (
          <svg key={i} {...svgProps} style={{ ...svgProps.style, opacity: b[i], willChange: 'opacity' }} aria-hidden>
            <defs>
              <radialGradient id={`spill${uid}${i}`}>
                <stop offset="0" stopColor={c} stopOpacity={0.5 * eo} />
                <stop offset="1" stopColor={c} stopOpacity="0" />
              </radialGradient>
              <filter id={`blur${uid}${i}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
            </defs>
            <ellipse cx={ex} cy={ey} rx={erx} ry={ery} fill={`url(#spill${uid}${i})`} />
            {el({ stroke: c, strokeWidth: 22, opacity: 0.85, filter: `url(#blur${uid}${i})` })}
            {el({ stroke: c, strokeWidth: 7 })}
            {el({ stroke: '#fff', strokeWidth: 2.4, opacity: 0.85 })}
          </svg>
        );
      })}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(75% 75% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)' }} />
      {/* the room is darker when the sign is off */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#000', opacity: 0.35 * (1 - total), willChange: 'opacity' }} />
      <button
        type="button"
        aria-label={s.power ? 'Switch the sign off' : 'Switch the sign on'}
        aria-pressed={s.power}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fx.dispatch({ type: 'toggle' });
          }
        }}
        style={{ position: 'absolute', right: 0, bottom: 0, width: 44, height: 44, opacity: 0 }}
      />
    </Stage>
  );
}
