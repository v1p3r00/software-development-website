import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Download → lift-off. The pill button collapses into a launch pad, a progress ring charges
 * while the rocket rumbles harder and smoke builds up, and at 100% it launches with real
 * acceleration, a flickering flame and billowing exhaust. The button then springs back as
 * "Downloaded".
 */

interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  hot: number; // 1 = flame-lit, cools to grey
}
interface S {
  phase: 0 | 1 | 2 | 3; // ready, charging, launch, done
  pt: number; // time in phase
  prog: number;
  pill: Spring; // 1 = pill, 0 = round pad
  ry: number; // rocket height above the pad, px
  rv: number;
  hover: Spring;
  puffs: Puff[];
  shake: number;
  idle: number;
  t: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  return { m, cx: w / 2, cy: h * 0.62, pw: Math.min(w * 0.8, m * 0.62), ph: m * 0.15, pad: m * 0.2 };
}

export const sim = defineSim<S>({
  init: () => ({ phase: 0, pt: 0, prog: 0, pill: sp(1), ry: 0, rv: 0, hover: sp(), puffs: [], shake: 0, idle: 0, t: 0 }),
  step(s, f) {
    const { w, h, dt } = f;
    if (dt <= 0) return;
    const g = geom(w, h);
    s.t += dt;
    s.pt += dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + dt;
    const bw = g.pw * (0.3 + 0.7 * s.pill.x);
    const over = Math.abs(f.p.x - g.cx) < bw / 2 && Math.abs(f.p.y - g.cy) < g.ph * 0.7;
    spring(s.hover, over && s.phase === 0 ? 1 : 0, 300, 18, dt);
    const go = (f.pressed && over) || (s.idle > 2.5 && s.phase === 0 && s.pt > 0.8);
    const puff = (x: number, y: number, vx: number, vy: number, r: number, max: number, hot: number) =>
      s.puffs.push({ x, y, vx, vy, r, life: 0, max, hot });
    if (s.phase === 0 && go) {
      s.phase = 1;
      s.pt = 0;
      s.prog = 0;
      f.emit({ name: 'click', gain: 0.6 });
    } else if (s.phase === 1) {
      // charging: uneven download speed
      s.prog = Math.min(1, s.prog + dt * (0.38 + 0.25 * Math.sin(s.t * 5)));
      s.shake = s.prog * s.prog;
      if (f.rand() < dt * (4 + s.prog * 30)) {
        const side = f.rand() < 0.5 ? -1 : 1;
        puff(g.cx + side * g.m * 0.03, g.cy + g.m * 0.05, side * g.m * (0.2 + f.rand() * 0.4), -g.m * 0.05 * f.rand(), g.m * (0.02 + f.rand() * 0.02), 0.9 + f.rand() * 0.6, 0);
      }
      if (s.prog >= 1) {
        s.phase = 2;
        s.pt = 0;
        s.rv = 0;
        f.emit({ name: 'whoosh', gain: 0.9, rate: 0.7 });
        f.emit({ name: 'thud', gain: 0.6, rate: 0.6 });
        // a ring of smoke bursts out of the pad
        for (let i = 0; i < 22; i++) {
          const a = f.rand() * Math.PI;
          puff(g.cx, g.cy + g.m * 0.05, Math.cos(a) * g.m * (0.6 + f.rand() * 0.9), -Math.sin(a) * g.m * 0.25, g.m * (0.03 + f.rand() * 0.03), 1.0 + f.rand() * 0.6, 0.6);
        }
      }
    } else if (s.phase === 2) {
      // thrust > gravity: accelerating climb
      s.rv += g.m * 7 * dt;
      s.ry += s.rv * dt;
      s.shake = Math.max(0, 1 - s.pt * 2);
      const fy = g.cy - s.ry + g.m * 0.1;
      if (fy > -g.m * 0.1)
        for (let i = 0; i < 3; i++)
          puff(g.cx + (f.rand() - 0.5) * g.m * 0.03, fy, (f.rand() - 0.5) * g.m * 0.3, g.m * (0.2 + f.rand() * 0.4), g.m * (0.018 + f.rand() * 0.02), 0.7 + f.rand() * 0.6, 1);
      if (s.pt > 0.9) {
        s.phase = 3;
        s.pt = 0;
        f.emit({ name: 'success', gain: 0.6 });
      }
    } else if (s.phase === 3 && s.pt > 2.6) {
      s.phase = 0;
      s.pt = 0;
      s.ry = 0;
    }
    spring(s.pill, s.phase === 1 || s.phase === 2 ? 0 : 1, 220, f.reduced ? 30 : 15, dt);
    for (const p of s.puffs) {
      p.life += dt;
      p.vx = approach(p.vx, 0, 2.2, dt);
      p.vy = approach(p.vy, -g.m * 0.06, 1.6, dt); // smoke slows and drifts up
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // exhaust hitting the ground spreads sideways along it
      const ground = g.cy + g.m * 0.07;
      if (p.y > ground) {
        p.y = ground;
        p.vx += Math.sign(p.x - g.cx || 1) * Math.abs(p.vy) * 0.8;
        p.vy = 0;
      }
      p.r += g.m * 0.05 * dt;
      p.hot = approach(p.hot, 0, 5, dt);
    }
    s.puffs = s.puffs.filter((p) => p.life < p.max);
  },
});

function Rocket({ u, flame, uid }: { u: number; flame: number; uid: string }) {
  // drawn pointing up, origin at the nozzle
  return (
    <g>
      {flame > 0 && (
        <g>
          <path d={`M${-u * 0.16} 0Q0 ${u * (1.4 * flame + 0.2)} ${u * 0.16} 0Z`} fill={`url(#fl${uid})`} />
          <path d={`M${-u * 0.08} 0Q0 ${u * (0.7 * flame + 0.1)} ${u * 0.08} 0Z`} fill="#fffbe6" />
        </g>
      )}
      <path d={`M${-u * 0.3} ${-u * 0.28}L${-u * 0.42} ${-u * 0.02}L${-u * 0.2} ${-u * 0.1}Z`} fill="#ff4d5e" />
      <path d={`M${u * 0.3} ${-u * 0.28}L${u * 0.42} ${-u * 0.02}L${u * 0.2} ${-u * 0.1}Z`} fill="#d42a3e" />
      <rect x={-u * 0.12} y={-u * 0.12} width={u * 0.24} height={u * 0.12} rx={u * 0.03} fill="#5a6070" />
      <path d={`M0 ${-u * 1.1}C${u * 0.32} ${-u * 0.85} ${u * 0.3} ${-u * 0.35} ${u * 0.2} ${-u * 0.1}H${-u * 0.2}C${-u * 0.3} ${-u * 0.35} ${-u * 0.32} ${-u * 0.85} 0 ${-u * 1.1}Z`} fill={`url(#bd${uid})`} />
      <path d={`M0 ${-u * 1.1}C${u * 0.12} ${-u * 1.0} ${u * 0.2} ${-u * 0.9} ${u * 0.24} ${-u * 0.82}H${-u * 0.24}C${-u * 0.2} ${-u * 0.9} ${-u * 0.12} ${-u * 1.0} 0 ${-u * 1.1}Z`} fill="#ff4d5e" />
      <circle cy={-u * 0.56} r={u * 0.11} fill="#1d3b6e" stroke="#c9d2e3" strokeWidth={u * 0.035} />
      <circle cx={-u * 0.035} cy={-u * 0.6} r={u * 0.035} fill="#9fd0ff" />
    </g>
  );
}

export default function RocketDownload() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const g = geom(w, h);
  const { m, cx, cy, ph } = g;
  const bw = g.pw * (0.3 + 0.7 * s.pill.x);
  const bh = ph * (1 + (1 - s.pill.x) * 0.35);
  const sh = s.shake * m * 0.006 * Math.sin(t * 80);
  const lift = s.hover.x * m * 0.008;
  const pill = s.pill.x;
  const u = m * 0.14;
  const showRocket = s.phase === 1 || s.phase === 2;
  const ringR = bh * 0.62;
  const flame = s.phase === 2 ? 0.8 + 0.2 * Math.sin(t * 60) : s.phase === 1 ? s.prog * 0.25 * (0.7 + 0.3 * Math.sin(t * 50)) : 0;
  const labelO = clamp((pill - 0.6) / 0.4);
  const done = s.phase === 3;
  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'linear-gradient(180deg, #0b1230 0%, #1b1f4a 55%, #3a2c5c 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`bd${uid}`} x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#dfe4ee" />
            <stop offset="1" stopColor="#9aa3b5" />
          </linearGradient>
          <linearGradient id={`fl${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3b0" />
            <stop offset="0.4" stopColor="#ffb340" />
            <stop offset="1" stopColor="#ff4d1a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`btn${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={done ? '#3ee08f' : '#6c7bff'} />
            <stop offset="1" stopColor={done ? '#14a865' : '#4a4fe0'} />
          </linearGradient>
          <radialGradient id={`smk${uid}`}>
            <stop offset="0" stopColor="#e6e8f2" stopOpacity="0.75" />
            <stop offset="0.6" stopColor="#c9cddd" stopOpacity="0.35" />
            <stop offset="1" stopColor="#c9cddd" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`fire${uid}`}>
            <stop offset="0" stopColor="#fff2b8" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#ff9a3a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ff5a1a" stopOpacity="0" />
          </radialGradient>
          <filter id={`bl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.02} />
          </filter>
        </defs>
        {/* stars */}
        {Array.from({ length: 40 }, (_, i) => {
          const x = ((i * 9301 + 49297) % 233280) / 233280;
          const y = ((i * 4241 + 1013) % 9973) / 9973;
          return <circle key={i} cx={x * w} cy={y * h * 0.6} r={m * (0.002 + (i % 3) * 0.001)} fill="#fff" opacity={0.25 + 0.35 * Math.abs(Math.sin(t * 0.8 + i))} />;
        })}
        <g transform={`translate(${sh} 0)`}>
          {/* pad / button */}
          <ellipse cx={cx} cy={cy + bh * 0.62} rx={bw * 0.48} ry={bh * 0.12} fill="#000" opacity={0.35} filter={`url(#bl${uid})`} />
          <rect x={cx - bw / 2} y={cy - bh / 2 - lift} width={bw} height={bh} rx={bh / 2} fill={`url(#btn${uid})`} />
          <rect x={cx - bw / 2 + 2} y={cy - bh / 2 - lift + 2} width={bw - 4} height={bh * 0.45} rx={bh * 0.4} fill="#fff" opacity={0.15} />
          {/* progress ring around the pad */}
          {s.phase === 1 && (
            <g>
              <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="#fff" strokeOpacity={0.15} strokeWidth={m * 0.012} />
              <circle
                cx={cx}
                cy={cy}
                r={ringR}
                fill="none"
                stroke="#ffd36a"
                strokeWidth={m * 0.012}
                strokeLinecap="round"
                strokeDasharray={`${s.prog * Math.PI * 2 * ringR} ${Math.PI * 2 * ringR}`}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            </g>
          )}
          {labelO > 0 && (
            <g opacity={labelO} fontFamily="'Inter Variable', Inter, system-ui" fontWeight={700} fill="#fff">
              <text x={cx + ph * 0.25} y={cy + ph * 0.13 - lift} textAnchor="middle" fontSize={ph * 0.34}>
                {done ? 'Downloaded' : 'Download'}
              </text>
              {done ? (
                <path d={`M${cx - bw / 2 + ph * 0.42} ${cy - lift}l${ph * 0.1} ${ph * 0.1}l${ph * 0.2} ${-ph * 0.22}`} fill="none" stroke="#fff" strokeWidth={ph * 0.07} strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d={`M${cx - bw / 2 + ph * 0.55} ${cy - ph * 0.2 - lift}v${ph * 0.36}m${-ph * 0.14} ${-ph * 0.14}l${ph * 0.14} ${ph * 0.14}l${ph * 0.14} ${-ph * 0.14}`} fill="none" stroke="#fff" strokeWidth={ph * 0.07} strokeLinecap="round" strokeLinejoin="round" />
              )}
            </g>
          )}
        </g>
        {/* exhaust: hot puffs glow orange, then cool to grey smoke */}
        {s.puffs.map((p, i) => {
          const k = p.life / p.max;
          return <circle key={i} cx={p.x} cy={p.y} r={p.r * 1.4} fill={`url(#${p.hot > 0.3 ? 'fire' : 'smk'}${uid})`} opacity={(1 - k) * (1 - k * 0.3)} />;
        })}
        {showRocket && (
          <g transform={`translate(${cx + sh * 1.5} ${cy + ph * 0.18 - s.ry})`} opacity={clamp(1 - pill * 2.5)}>
            <Rocket u={u} flame={flame} uid={uid} />
          </g>
        )}
        {s.phase === 1 && (
          <text x={cx} y={cy + bh * 1.35} textAnchor="middle" fontFamily="'JetBrains Mono Variable', monospace" fontSize={Math.max(10, m * 0.032)} fill="#c9d0ff">
            {`T-${Math.max(0, Math.ceil((1 - s.prog) * 3))} · ${Math.round(s.prog * 100)}%`}
          </text>
        )}
      </svg>
      <button
        type="button"
        aria-label="Download"
        style={{ position: 'absolute', left: cx - g.pw / 2, top: cy - ph / 2, width: g.pw, height: ph, opacity: 0, borderRadius: ph / 2, cursor: 'pointer' }}
      />
    </Stage>
  );
}
