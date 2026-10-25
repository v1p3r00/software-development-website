import { useId } from 'react';
import { defineSim, useFx, Stage, clamp, approach, smooth } from '../kit';

/**
 * Cracked error. Submit a wrong code and the field takes the hit like a pane of glass: cracks
 * race out from the end of what you typed (main rays, side branches, two ring fractures), a few
 * shards drop out under gravity, and the whole field shakes. Edit the value and the glass heals.
 */

const VALID = 'GLASS25';
const DEMO = 'FREE$$$';

interface Crack {
  pts: number[][]; // polyline, stage px
  len: number;
  delay: number; // 0..1 of the growth
}
interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  va: number;
  pts: number[][]; // local triangle
}

interface S {
  val: string;
  state: 'idle' | 'bad' | 'ok';
  st: number;
  cracks: Crack[];
  shards: Shard[];
  heal: number; // 1 = fully cracked, fades to 0
  ix: number; // impact point
  iy: number;
  idle: number;
  demo: number;
  user: boolean;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const fw = Math.min(w * 0.84, m * 1.1, 500);
  const fh = Math.min(m * 0.15, 70);
  return { fw, fh, x: w / 2 - fw / 2, y: h / 2 - fh / 2, bw: fh * 1.6 };
}
const textX = (g: ReturnType<typeof geom>, n: number) => g.x + g.fh * 0.4 + n * g.fh * 0.36 * 0.62;

function shatter(s: S, g: ReturnType<typeof geom>, rand: () => number) {
  s.ix = Math.min(textX(g, s.val.length) + g.fh * 0.1, g.x + g.fw - g.bw - g.fh * 0.3);
  s.iy = g.y + g.fh * (0.42 + rand() * 0.16);
  s.cracks = [];
  const reach = g.fw * 0.75;
  const n = 11;
  const ringA: number[][] = [];
  const ringB: number[][] = [];
  for (let i = 0; i < n; i++) {
    let a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.4;
    let x = s.ix;
    let y = s.iy;
    const pts = [[x, y]];
    let len = 0;
    const L = reach * (0.35 + rand() * 0.65);
    while (len < L) {
      const step = g.fh * (0.12 + rand() * 0.22);
      a += (rand() - 0.5) * 0.5;
      x += Math.cos(a) * step;
      y += Math.sin(a) * step * 0.9;
      len += step;
      pts.push([x, y]);
      if (pts.length === 3) ringA.push([x, y]);
      if (pts.length === 6) ringB.push([x, y]);
      // a side branch now and then
      if (rand() < 0.18 && pts.length > 2) {
        const b = a + (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.6);
        const bp = [[x, y]];
        let bx = x;
        let by = y;
        let bl = 0;
        for (let k = 0; k < 3; k++) {
          const st = g.fh * (0.1 + rand() * 0.15);
          bx += Math.cos(b + (rand() - 0.5) * 0.4) * st;
          by += Math.sin(b + (rand() - 0.5) * 0.4) * st;
          bl += st;
          bp.push([bx, by]);
        }
        s.cracks.push({ pts: bp, len: bl, delay: clamp(len / reach) * 0.7 });
      }
    }
    s.cracks.push({ pts, len, delay: 0 });
  }
  // ring fractures join neighbouring rays
  for (const [ring, d] of [
    [ringA, 0.25],
    [ringB, 0.45],
  ] as [number[][], number][]) {
    for (let i = 0; i < ring.length; i++) {
      const p = ring[i];
      const q = ring[(i + 1) % ring.length];
      if (rand() < 0.75) s.cracks.push({ pts: [p, [(p[0] + q[0]) / 2 + (rand() - 0.5) * 6, (p[1] + q[1]) / 2 + (rand() - 0.5) * 6], q], len: Math.hypot(q[0] - p[0], q[1] - p[1]) * 1.1, delay: d });
    }
  }
  s.shards = [];
  for (let i = 0; i < 6; i++) {
    const r = g.fh * (0.06 + rand() * 0.1);
    s.shards.push({
      x: s.ix + (rand() - 0.5) * g.fh * 0.5,
      y: s.iy + (rand() - 0.5) * g.fh * 0.3,
      vx: (rand() - 0.5) * g.fh * 4,
      vy: -g.fh * (1 + rand() * 3),
      r,
      a: rand() * 6,
      va: (rand() - 0.5) * 14,
      pts: [
        [-r, -r * 0.4],
        [r * (0.4 + rand() * 0.6), -r],
        [r * 0.3, r],
      ],
    });
  }
}

export const sim = defineSim<S>({
  init: () => ({ val: '', state: 'idle', st: 0, cracks: [], shards: [], heal: 0, ix: 0, iy: 0, idle: 0, demo: 0, user: false }),
  step(s, f) {
    const g = geom(f.w, f.h);
    const dt = f.dt;
    s.st += dt;
    if (f.p.over || f.p.down || s.user) s.idle = 0;
    else s.idle += dt;
    const submit = () => {
      if (!s.val) return;
      s.st = 0;
      if (s.val.toUpperCase() === VALID) {
        s.state = 'ok';
        f.emit({ name: 'success', gain: 0.8 });
      } else {
        s.state = 'bad';
        s.heal = 1;
        shatter(s, g, f.rand);
        f.emit({ name: 'glass', gain: 1, pan: clamp((s.ix - f.w / 2) / (g.fw / 2), -1, 1) * 0.5 });
        f.emit({ name: 'error', gain: 0.5 });
      }
    };
    for (const a of f.actions) {
      if (a.type === 'text') {
        s.val = String(a.value ?? '').slice(0, 18);
        if (s.state !== 'idle') s.state = 'idle';
        s.user = true;
      }
      if (a.type === 'submit') submit();
      if (a.type === 'blur') s.user = false;
      if (a.type === 'focus') s.user = true;
    }
    const onBtn = f.p.x > g.x + g.fw - g.bw - 6 && f.p.x < g.x + g.fw && f.p.y > g.y && f.p.y < g.y + g.fh;
    if (f.pressed && onBtn) {
      f.emit({ name: 'click', gain: 0.5 });
      submit();
    }
    // self-demo: type a bogus code, smash, clear, repeat
    if (s.idle > 2.2) {
      s.demo += dt;
      const T = s.demo % 5;
      const n = clamp(Math.floor((T - 0.2) / 0.12), 0, DEMO.length);
      if (T < 1.4 && s.val !== DEMO.slice(0, n)) {
        s.val = DEMO.slice(0, n);
        s.state = 'idle';
        f.emit({ name: 'tick', gain: 0.15, rate: 1.3 });
      }
      if (T >= 1.5 && T - dt < 1.5) submit();
      if (T >= 4.4 && T - dt < 4.4) {
        s.val = '';
        s.state = 'idle';
      }
    } else s.demo = 0;

    s.heal = approach(s.heal, s.state === 'bad' ? 1 : 0, s.state === 'bad' ? 20 : 3, dt);
    if (s.heal < 0.01 && s.state !== 'bad') s.cracks = [];
    for (const sh of s.shards) {
      sh.vy += g.fh * 22 * dt;
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      sh.a += sh.va * dt;
    }
    s.shards = s.shards.filter((sh) => sh.y < f.h + 40);
  },
});

export default function CrackError() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const bad = s.state === 'bad';
  const ok = s.state === 'ok';
  const st = s.st;
  // the hit: a hard shove then a damped wobble
  const shake = bad ? Math.sin(st * 52) * Math.exp(-st * 6) * g.fh * 0.22 : 0;
  const rot = bad ? Math.sin(st * 41 + 1) * Math.exp(-st * 7) * 1.2 : 0;
  const grow = bad ? smooth(st / 0.28) : 1;
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const mono = "'JetBrains Mono Variable', monospace";
  const fs = g.fh * 0.36;
  const r = g.fh * 0.22;
  const edge = bad ? '#ff4d5e' : ok ? '#3ee58c' : '#323848';
  const cw = fs * 0.62;

  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(110% 90% at 50% 30%, #1b1e27 0%, #0e1016 60%, #07080b 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <clipPath id={`f${uid}`}>
            <rect x={g.x} y={g.y} width={g.fw} height={g.fh} rx={r} />
          </clipPath>
          <linearGradient id={`glass${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d2230" />
            <stop offset="1" stopColor="#141822" />
          </linearGradient>
          <radialGradient id={`hit${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <text x={g.x} y={g.y - g.fh * 0.35} fontFamily={ui} fontWeight={600} fontSize={Math.max(11, g.fh * 0.24)} fill="#aab2c5">
          Promo code
        </text>
        <g transform={`translate(${shake} 0) rotate(${rot} ${w / 2} ${h / 2})`}>
          <rect x={g.x} y={g.y + g.fh * 0.12} width={g.fw} height={g.fh} rx={r} fill="#000" opacity={0.35} />
          <rect x={g.x} y={g.y} width={g.fw} height={g.fh} rx={r} fill={`url(#glass${uid})`} />
          <rect x={g.x} y={g.y} width={g.fw} height={g.fh * 0.45} rx={r} fill="#fff" opacity={0.035} />
          {s.val ? (
            <text x={g.x + g.fh * 0.4} y={g.y + g.fh / 2} dominantBaseline="central" fontFamily={mono} fontWeight={600} fontSize={fs} fill={bad ? '#ffb3bb' : ok ? '#9dffcb' : '#e8ebf3'} letterSpacing={0}>
              {s.val.split('').map((c, i) => (
                <tspan key={i} x={g.x + g.fh * 0.4 + i * cw}>
                  {c}
                </tspan>
              ))}
            </text>
          ) : (
            <text x={g.x + g.fh * 0.4} y={g.y + g.fh / 2} dominantBaseline="central" fontFamily={ui} fontSize={fs * 0.92} fill="#596075">
              {`Try ${VALID}`}
            </text>
          )}
          {/* the apply button */}
          <rect x={g.x + g.fw - g.bw - g.fh * 0.12} y={g.y + g.fh * 0.12} width={g.bw} height={g.fh * 0.76} rx={r * 0.75} fill={ok ? '#2fcf7a' : '#e9ecf3'} />
          <text x={g.x + g.fw - g.bw / 2 - g.fh * 0.12} y={g.y + g.fh / 2} textAnchor="middle" dominantBaseline="central" fontFamily={ui} fontWeight={700} fontSize={fs * 0.82} fill="#11131a">
            {ok ? 'Applied' : 'Apply'}
          </text>
          {/* the fracture, clipped to the pane */}
          {s.cracks.length > 0 && (
            <g clipPath={`url(#f${uid})`} opacity={s.heal}>
              <circle cx={s.ix} cy={s.iy} r={g.fh * 0.5} fill={`url(#hit${uid})`} opacity={0.6} />
              {/* a couple of loosened facets catch the light */}
              {s.cracks.slice(0, 3).map((c, i) => (
                <polygon key={`p${i}`} points={`${s.ix},${s.iy} ${c.pts[Math.min(2, c.pts.length - 1)].join(',')} ${(s.cracks[i + 1]?.pts[2] ?? c.pts[1]).join(',')}`} fill="#cfe3ff" opacity={0.07 + i * 0.03} />
              ))}
              {s.cracks.map((c, i) => {
                const k = clamp((grow - c.delay) / (1 - c.delay));
                if (k <= 0) return null;
                const d = c.pts.map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
                const dash = `${c.len * k} ${c.len * 2}`;
                return (
                  <g key={i}>
                    <path d={d} fill="none" stroke="#000" strokeOpacity={0.55} strokeWidth={2.2} strokeDasharray={dash} transform="translate(0.8 1)" />
                    <path d={d} fill="none" stroke="#e9f2ff" strokeOpacity={0.85} strokeWidth={c.delay > 0 ? 0.9 : 1.3} strokeDasharray={dash} strokeLinejoin="round" />
                  </g>
                );
              })}
            </g>
          )}
          <rect x={g.x + 0.75} y={g.y + 0.75} width={g.fw - 1.5} height={g.fh - 1.5} rx={r} fill="none" stroke={edge} strokeWidth={bad || ok ? 2 : 1.5} />
        </g>
        {s.shards.map((sh, i) => (
          <polygon key={i} points={sh.pts.map((p) => `${p[0]},${p[1]}`).join(' ')} transform={`translate(${sh.x} ${sh.y}) rotate(${(sh.a * 180) / Math.PI})`} fill="#dbe8ff" fillOpacity={0.25} stroke="#f1f6ff" strokeOpacity={0.8} strokeWidth={1} />
        ))}
        <text x={g.x} y={g.y + g.fh * 1.55} fontFamily={ui} fontWeight={600} fontSize={Math.max(11, g.fh * 0.24)} fill={bad ? '#ff6b7a' : '#3ee58c'} opacity={bad ? smooth((st - 0.15) / 0.2) : ok ? smooth(st / 0.2) : 0} transform={`translate(${bad ? (1 - smooth((st - 0.15) / 0.3)) * -12 : 0} 0)`}>
          {bad ? 'That code is broken. So is the field.' : '25% off — nice.'}
        </text>
      </svg>
      <input
        aria-label="Promo code"
        value={s.val}
        onChange={(e) => fx.dispatch({ type: 'text', value: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') fx.dispatch({ type: 'submit' });
        }}
        onFocus={() => fx.dispatch({ type: 'focus' })}
        onBlur={() => fx.dispatch({ type: 'blur' })}
        style={{ position: 'absolute', left: g.x, top: g.y, width: g.fw - g.bw - g.fh * 0.3, height: g.fh, padding: `0 0 0 ${g.fh * 0.4}px`, border: 0, outline: 'none', background: 'transparent', color: 'transparent', caretColor: '#e8ebf3', fontFamily: mono, fontSize: fs, fontWeight: 600 }}
      />
      <button
        type="button"
        aria-label="Apply code"
        style={{ position: 'absolute', left: g.x + g.fw - g.bw - g.fh * 0.12, top: g.y + g.fh * 0.12, width: g.bw, height: g.fh * 0.76, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fx.dispatch({ type: 'submit' });
          }
        }}
      />
    </Stage>
  );
}
