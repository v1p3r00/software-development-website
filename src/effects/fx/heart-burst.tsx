import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A like button. Press and the heart crouches (anticipation); let go and it pops with overshoot,
 * floods with red from the middle, a shock ring expands and a ring of confetti bursts out,
 * fluttering down under gravity. The counter rolls up. Press again to unlike.
 */

const HEART = 'M50,88 C20,66 4,48 4,30 C4,16 15,6 28,6 C38,6 46,12 50,20 C54,12 62,6 72,6 C85,6 96,16 96,30 C96,48 80,66 50,88 Z';
const COLORS = ['#ff3d6e', '#ffb340', '#7c5cff', '#3ee0c5', '#ff7ac8', '#ffe066'];

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  ph: number; // flutter phase
  c: string;
  kind: 0 | 1; // 0 = dot, 1 = paper strip
  size: number;
  age: number;
  life: number;
}

interface S {
  liked: boolean;
  scale: Spring;
  fill: number; // 0..1 red flood
  ring: number; // seconds since the burst (-1 = none)
  bits: Bit[];
  count: number;
  roll: Spring; // counter roll 0..1
  dir: number;
  holding: boolean;
  idle: number;
  auto: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const size = m * 0.36;
  return { m, size, cx: w / 2, cy: h * 0.46 };
}

function burst(s: S, f: { rand: () => number }, size: number) {
  s.bits = [];
  // a ring of dot pairs, like a firework shell
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + (i % 2) * 0.12;
    const sp0 = size * (2.4 + (i % 2) * 0.7);
    s.bits.push({ x: 0, y: 0, vx: Math.cos(a) * sp0, vy: Math.sin(a) * sp0, rot: 0, vr: 0, ph: 0, c: COLORS[i % 2 ? 1 : 0], kind: 0, size: size * (i % 2 ? 0.035 : 0.05), age: 0, life: 0.65 });
  }
  // paper confetti that flutters down
  for (let i = 0; i < 36; i++) {
    const a = -Math.PI / 2 + (f.rand() - 0.5) * Math.PI * 1.7;
    const sp0 = size * (1.6 + f.rand() * 2.6);
    s.bits.push({
      x: (f.rand() - 0.5) * size * 0.3,
      y: (f.rand() - 0.5) * size * 0.2,
      vx: Math.cos(a) * sp0,
      vy: Math.sin(a) * sp0,
      rot: f.rand() * 360,
      vr: (f.rand() - 0.5) * 900,
      ph: f.rand() * 6,
      c: COLORS[Math.floor(f.rand() * COLORS.length)],
      kind: 1,
      size: size * (0.035 + f.rand() * 0.03),
      age: 0,
      life: 1.4 + f.rand() * 0.8,
    });
  }
}

export const sim = defineSim<S>({
  init: () => ({ liked: false, scale: sp(1), fill: 0, ring: -1, bits: [], count: 1284, roll: sp(1), dir: 1, holding: false, idle: 0, auto: 0 }),
  step(s, f) {
    const { size } = geom(f.w, f.h);
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    let fire = false;
    if (f.pressed) {
      s.holding = true;
      f.emit({ name: 'squeak', gain: 0.2, rate: 1.4 });
    }
    if (s.holding && f.released) {
      s.holding = false;
      fire = true;
    }
    for (const a of f.actions) if (a.type === 'toggle') fire = true;
    // self-demo: crouch and like; later unlike quietly
    if (s.idle > 1.4) {
      s.auto += f.dt;
      if (!s.liked && s.auto > 0.4 && s.auto < 0.62) s.holding = true;
      if (!s.liked && s.auto >= 0.62 && s.holding) {
        s.holding = false;
        fire = true;
      }
      if (s.liked && s.auto > 2.6) fire = true;
      if (fire) s.auto = 0;
    } else {
      s.auto = 0;
      if (!f.p.down) s.holding = false;
    }
    if (fire) {
      s.liked = !s.liked;
      s.count += s.liked ? 1 : -1;
      s.dir = s.liked ? 1 : -1;
      s.roll.x = 0;
      s.roll.v = 0;
      if (s.liked) {
        s.scale.v += f.reduced ? 2 : 9;
        s.ring = 0;
        s.fill = 0.001;
        burst(s, f, size);
        f.emit({ name: 'pop', gain: 0.9, rate: 1.1 });
        f.emit({ name: 'spark', gain: 0.4, rate: 1.2 });
      } else {
        s.scale.v -= 3;
        f.emit({ name: 'click', gain: 0.4, rate: 0.8 });
      }
    }
    spring(s.scale, s.holding ? 0.8 : 1, s.holding ? 300 : 260, f.reduced ? 30 : 9, f.dt);
    spring(s.roll, 1, 260, 18, f.dt);
    s.fill = s.liked ? (s.fill > 0 ? Math.min(1, s.fill + f.dt * 4.5) : 1) : s.fill > 0.02 ? approach(s.fill, 0, 16, f.dt) : 0;
    if (s.ring >= 0) s.ring = s.ring > 1 ? -1 : s.ring + f.dt;
    // confetti: drag, gravity, and paper flutter (sideways drift as it tumbles)
    for (const b of s.bits) {
      b.age += f.dt;
      const drag = b.kind ? 3.2 : 6;
      b.vx *= Math.exp(-drag * f.dt);
      b.vy *= Math.exp(-drag * f.dt);
      if (b.kind) {
        b.vy += size * 2.2 * f.dt;
        b.ph += f.dt * 9;
        b.vx += Math.sin(b.ph) * size * 1.2 * f.dt;
        b.rot += b.vr * f.dt;
      }
      b.x += b.vx * f.dt;
      b.y += b.vy * f.dt;
    }
    s.bits = s.bits.filter((b) => b.age < b.life);
  },
});

export default function HeartBurst() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, size, cx, cy } = geom(w, h);
  const k = size / 100;
  const sc = s.scale.x;
  // squash & stretch around the scale: wider when crouched, taller when popping
  const sx = sc * (1 + (1 - sc) * 0.35);
  const sy = sc * (1 - (1 - sc) * 0.25);
  const rt = s.ring >= 0 ? s.ring : 1;
  const ringE = 1 - Math.pow(1 - clamp(rt / 0.5), 3);
  const fillE = 1 - Math.pow(1 - s.fill, 3);
  const fmt = (n: number) => n.toLocaleString('en-US');
  const rollY = (1 - s.roll.x) * m * 0.06 * s.dir;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#120a10' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="50%" cy="42%" r="80%">
            <stop offset="0" stopColor={s.liked ? '#3a1424' : '#2a1a24'} />
            <stop offset="0.55" stopColor="#170c14" />
            <stop offset="1" stopColor="#08050a" />
          </radialGradient>
          <radialGradient id={`red${uid}`} cx="40%" cy="30%" r="80%">
            <stop offset="0" stopColor="#ff8aa6" />
            <stop offset="0.35" stopColor="#ff2d5c" />
            <stop offset="1" stopColor="#b3002f" />
          </radialGradient>
          <radialGradient id={`glass${uid}`} cx="40%" cy="30%" r="80%">
            <stop offset="0" stopColor="#4a3340" />
            <stop offset="1" stopColor="#21141c" />
          </radialGradient>
          <radialGradient id={`halo${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff2d5c" stopOpacity={0.35 * fillE} />
            <stop offset="1" stopColor="#ff2d5c" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`clip${uid}`}>
            <path d={HEART} />
          </clipPath>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.02} />
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        <circle cx={cx} cy={cy} r={size * 1.3} fill={`url(#halo${uid})`} />
        {/* contact shadow on the "floor" */}
        <ellipse cx={cx} cy={cy + size * 0.62} rx={size * 0.34 * sx} ry={size * 0.05} fill="#000" opacity="0.55" filter={`url(#sh${uid})`} />
        {/* shock ring */}
        {s.ring >= 0 && (
          <circle cx={cx} cy={cy} r={size * (0.3 + ringE * 0.75)} fill="none" stroke="#ff4d7a" strokeWidth={size * 0.12 * (1 - ringE) + 0.5} opacity={1 - ringE} />
        )}
        <g transform={`translate(${cx} ${cy + size * 0.38}) scale(${sx} ${sy}) translate(${-size / 2} ${-size * 0.85})`}>
          <g transform={`scale(${k})`}>
            <path d={HEART} fill={`url(#glass${uid})`} />
            <g clipPath={`url(#clip${uid})`}>
              <circle cx={50} cy={47} r={70 * fillE} fill={`url(#red${uid})`} />
              {/* inner shading and a glossy window highlight */}
              <path d={HEART} fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="8" />
              <ellipse cx={30} cy={22} rx={14} ry={8} fill="#fff" opacity={0.18 + 0.32 * fillE} transform="rotate(-30 30 22)" />
              <circle cx={76} cy={24} r={3} fill="#fff" opacity={0.15 + 0.4 * fillE} />
            </g>
            <path d={HEART} fill="none" stroke={s.liked ? '#ff6b8f' : '#8a6a7c'} strokeWidth="2.5" strokeOpacity={0.8 - fillE * 0.4} />
          </g>
        </g>
        {/* confetti */}
        {s.bits.map((b, i) => {
          const fade = clamp((b.life - b.age) / 0.35);
          if (!b.kind) return <circle key={i} cx={cx + b.x} cy={cy + b.y} r={b.size * (1 - b.age / b.life)} fill={b.c} opacity={fade} />;
          // a paper strip tumbling: its width shrinks as it turns edge-on
          return (
            <rect
              key={i}
              x={-b.size}
              y={-b.size * 0.4}
              width={b.size * 2}
              height={b.size * 0.8}
              rx={b.size * 0.15}
              fill={b.c}
              opacity={fade}
              transform={`translate(${cx + b.x} ${cy + b.y}) rotate(${b.rot}) scale(${Math.cos(b.ph * 0.7)} 1)`}
            />
          );
        })}
      </svg>
      {/* counter */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy + size * 0.78, textAlign: 'center', fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: m * 0.06, color: s.liked ? '#ff8aa6' : '#a7909c', height: m * 0.08, overflow: 'hidden' }}>
        <div style={{ transform: `translateY(${rollY}px)`, opacity: s.roll.x, fontVariantNumeric: 'tabular-nums' }}>{fmt(s.count)}</div>
      </div>
      <button
        type="button"
        aria-pressed={s.liked}
        aria-label="Like"
        style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'toggle' });
          }
        }}
      />
    </Stage>
  );
}
