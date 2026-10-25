import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * OTP snap. Each digit drops into its slot from above, lands with a squash and a click, and the
 * slot's rim flashes. A wrong code makes the whole row shake (a damped sine) and the digits are
 * flung out under gravity; the right one ripples green, slot by slot.
 */

const N = 6;
const CODE = '314159';

interface Dg {
  ch: string;
  y: Spring; // drop offset (units of tile height; starts negative)
  sq: Spring; // landing squash
  out: boolean; // flung out after a wrong code
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
}

interface S {
  dg: (Dg | null)[];
  value: string;
  state: 'type' | 'wrong' | 'ok';
  st: number; // time in state
  shake: number;
  flash: number[];
  idle: number;
  demoT: number;
  demoRound: number;
  focus: boolean;
}

function geom(w: number, h: number) {
  const tw = Math.min((w * 0.84) / (N + (N - 1) * 0.25 + 0.4), Math.min(w, h) * 0.17, 110);
  const gap = tw * 0.25;
  const th = tw * 1.24;
  const total = N * tw + (N - 1) * gap + tw * 0.4; // a wider gap after the 3rd
  return { tw, th, gap, x0: w / 2 - total / 2, cy: h / 2 };
}
const slotX = (g: ReturnType<typeof geom>, i: number) => g.x0 + i * (g.tw + g.gap) + (i >= 3 ? g.tw * 0.4 : 0);

function setValue(s: S, v: string, f: { emit: (x: { name: string; gain?: number; rate?: number; pan?: number }) => void; rand: () => number }) {
  v = v.replace(/\D/g, '').slice(0, N);
  for (let i = 0; i < N; i++) {
    const c = v[i];
    const cur = s.dg[i];
    if (c && (!cur || cur.out || cur.ch !== c)) {
      s.dg[i] = { ch: c, y: { x: -1.4, v: 0 }, sq: sp(), out: false, ox: 0, oy: 0, vx: 0, vy: 0, rot: (f.rand() - 0.5) * 0.4, vr: 0 };
    } else if (!c && cur && !cur.out) {
      // deleted: it hops out of the slot
      cur.out = true;
      cur.vx = (f.rand() - 0.5) * 2;
      cur.vy = -6;
      cur.vr = (f.rand() - 0.5) * 8;
    }
  }
  if (v.length < s.value.length) f.emit({ name: 'tick', gain: 0.3, rate: 0.8 });
  s.value = v;
}

export const sim = defineSim<S>({
  init: () => ({ dg: Array(N).fill(null), value: '', state: 'type', st: 0, shake: 0, flash: Array(N).fill(0), idle: 0, demoT: 0, demoRound: 0, focus: false }),
  step(s, f) {
    const dt = f.dt;
    s.st += dt;
    if (f.p.over || f.p.down || s.focus) s.idle = 0;
    else s.idle += dt;
    for (const a of f.actions) {
      if (a.type === 'focus') s.focus = true;
      if (a.type === 'blur') s.focus = false;
      if (a.type === 'set' && s.state === 'type') {
        s.idle = 0;
        s.demoT = 0;
        setValue(s, String(a.value ?? ''), f);
      }
    }
    // self-demo: types a wrong code, then the right one
    if (s.idle > 2.2 && s.state === 'type') {
      s.demoT += dt;
      const code = s.demoRound % 2 === 0 ? '271828' : CODE;
      if (s.demoT > 0.5 && s.value.length < N && s.demoT - 0.5 > s.value.length * 0.17) setValue(s, s.value + code[s.value.length], f);
    }
    // landings
    s.dg.forEach((d, i) => {
      if (!d) return;
      if (d.out) {
        d.vy += 22 * dt;
        d.ox += d.vx * dt;
        d.oy += d.vy * dt;
        d.rot += d.vr * dt;
        if (d.oy > 8) s.dg[i] = null;
        return;
      }
      const before = d.y.x;
      d.y.v += 30 * dt; // gravity
      d.y.x += d.y.v * dt;
      if (before < 0 && d.y.x >= 0) {
        d.y.x = 0;
        d.sq.v += Math.min(14, d.y.v * 1.6);
        d.y.v = -d.y.v * 0.18;
        if (d.y.v > -0.6) d.y.v = 0;
        s.flash[i] = 1;
        f.emit({ name: 'click', gain: 0.6, rate: 0.9 + i * 0.05, pan: (i / (N - 1) - 0.5) * 0.8 });
      }
      if (d.y.x > 0) {
        d.y.x = 0;
        d.y.v = Math.min(0, d.y.v);
      }
      d.rot = approach(d.rot, 0, 10, dt);
      spring(d.sq, 0, 500, 14, dt);
    });
    for (let i = 0; i < N; i++) s.flash[i] = approach(s.flash[i], 0, 5, dt);

    // full code: check once everything has landed
    const landed = s.value.length === N && s.dg.every((d) => d && !d.out && d.y.x === 0 && Math.abs(d.y.v) < 0.01);
    if (s.state === 'type' && landed && s.st > 0) {
      if (s.value === CODE) {
        s.state = 'ok';
        f.emit({ name: 'success', gain: 0.9 });
      } else {
        s.state = 'wrong';
        s.shake = f.reduced ? 0.4 : 1;
        f.emit({ name: 'error', gain: 0.8 });
      }
      s.st = 0;
    }
    if (s.state === 'wrong') {
      s.shake = approach(s.shake, 0, 3.2, dt);
      if (s.st > 0.65 && s.value) {
        // fling them out
        s.dg.forEach((d, i) => {
          if (d && !d.out) {
            d.out = true;
            d.vx = (i - 2.5) * 0.8 + (f.rand() - 0.5);
            d.vy = -7 - f.rand() * 3;
            d.vr = (f.rand() - 0.5) * 12;
          }
        });
        s.value = '';
        f.emit({ name: 'whoosh', gain: 0.4, rate: 1.3 });
      }
      if (s.st > 1.3) {
        s.state = 'type';
        s.st = 0;
        s.demoRound++;
        s.demoT = 0;
      }
    }
    if (s.state === 'ok' && s.st > 2.2) {
      s.dg.forEach((d, i) => {
        if (d) {
          d.out = true;
          d.vx = 0;
          d.vy = -5 - i * 0.4;
          d.vr = 0;
        }
      });
      s.value = '';
      s.state = 'type';
      s.st = 0;
      s.demoRound++;
      s.demoT = 0;
    }
  },
});

export default function OtpSnap() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const g = geom(w, h);
  const { tw, th, cy } = g;
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const mono = "'JetBrains Mono Variable', monospace";
  const wrong = s.state === 'wrong';
  const ok = s.state === 'ok';
  const shakeX = wrong ? Math.sin(s.st * 46) * s.shake * tw * 0.35 : 0;
  const caret = s.value.length < N && s.state === 'type' ? s.value.length : -1;

  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(110% 90% at 50% 30%, #191d2a 0%, #0d0f17 60%, #07080c 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`slot${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a0c12" />
            <stop offset="1" stopColor="#161a25" />
          </linearGradient>
          <linearGradient id={`tile${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6f7fb" />
            <stop offset="1" stopColor="#cfd4e2" />
          </linearGradient>
          <filter id={`gl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={tw * 0.1} />
          </filter>
        </defs>
        <text x={w / 2} y={cy - th * 1.15} textAnchor="middle" fontFamily={ui} fontWeight={600} fontSize={Math.max(12, tw * 0.24)} fill="#e6e9f2">
          Enter the 6-digit code
        </text>
        <text x={w / 2} y={cy - th * 1.15 + Math.max(14, tw * 0.3)} textAnchor="middle" fontFamily={ui} fontSize={Math.max(10, tw * 0.17)} fill="#7f879c">
          {`hint: ${CODE.split('').join(' ')}`}
        </text>
        <g transform={`translate(${shakeX} 0)`}>
          {Array.from({ length: N }, (_, i) => {
            const x = slotX(g, i);
            const fl = s.flash[i];
            const okW = ok ? clamp(s.st * 4 - i * 0.35) : 0;
            const okB = ok ? Math.sin(clamp(s.st * 3.2 - i * 0.28) * Math.PI) * th * 0.12 : 0;
            const rim = wrong ? '#ff4d5e' : okW > 0 ? '#3ee58c' : caret === i ? '#7c8cff' : '#2a3042';
            return (
              <g key={i}>
                <rect x={x} y={cy - th / 2} width={tw} height={th} rx={tw * 0.2} fill={`url(#slot${uid})`} stroke={rim} strokeWidth={caret === i || wrong || okW > 0 ? 2 : 1.5} />
                {fl > 0.02 && <rect x={x} y={cy - th / 2} width={tw} height={th} rx={tw * 0.2} fill="none" stroke="#a9b4ff" strokeWidth={3} opacity={fl} filter={`url(#gl${uid})`} />}
                {caret === i && <rect x={x + tw / 2 - 1} y={cy - th * 0.22} width={2} height={th * 0.44} fill="#7c8cff" opacity={Math.sin(fx.t * 6) > 0 ? 0.9 : 0.15} />}
                {(() => {
                  const d = s.dg[i];
                  if (!d) return null;
                  const sq = d.sq.x;
                  const yy = cy + (d.out ? d.oy : d.y.x) * th - okB;
                  const xx = x + tw / 2 + (d.out ? d.ox * tw : 0);
                  const sx = 1 + sq * 0.05;
                  const sy = 1 - sq * 0.07;
                  const tint = wrong ? '#ffd6db' : okW > 0 ? `rgb(${lerp(246, 200, okW) | 0},${lerp(247, 255, okW) | 0},${lerp(251, 222, okW) | 0})` : undefined;
                  return (
                    <g transform={`translate(${xx} ${yy}) rotate(${(d.rot * 180) / Math.PI}) scale(${sx} ${sy})`} opacity={d.out ? clamp(1 - d.oy / 6) : 1}>
                      {/* the tile drops in; shadow tightens as it lands */}
                      <rect x={-tw * 0.4} y={-th * 0.4 + th * 0.06} width={tw * 0.8} height={th * 0.8} rx={tw * 0.15} fill="#000" opacity={0.4} filter={`url(#gl${uid})`} />
                      <rect x={-tw * 0.4} y={-th * 0.4} width={tw * 0.8} height={th * 0.8} rx={tw * 0.15} fill={tint ?? `url(#tile${uid})`} />
                      <rect x={-tw * 0.4} y={-th * 0.4} width={tw * 0.8} height={th * 0.25} rx={tw * 0.15} fill="#fff" opacity={0.5} />
                      <text y={th * 0.03} textAnchor="middle" dominantBaseline="central" fontFamily={mono} fontWeight={700} fontSize={th * 0.44} fill={wrong ? '#c2182b' : okW > 0 ? '#0d8a4c' : '#141826'}>
                        {d.ch}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </g>
        <text x={w / 2} y={cy + th * 1.05} textAnchor="middle" fontFamily={ui} fontWeight={600} fontSize={Math.max(11, tw * 0.2)} fill={wrong ? '#ff6b7a' : '#3ee58c'} opacity={wrong ? clamp(s.st * 5) : ok ? clamp(s.st * 3) : 0}>
          {wrong ? 'That code didn’t match' : 'Verified — welcome back'}
        </text>
      </svg>
      <input
        aria-label="One-time code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={N}
        value={s.value}
        onChange={(e) => fx.dispatch({ type: 'set', value: e.target.value })}
        onFocus={() => fx.dispatch({ type: 'focus' })}
        onBlur={() => fx.dispatch({ type: 'blur' })}
        style={{ position: 'absolute', left: g.x0, top: cy - th / 2, width: slotX(g, N - 1) + tw - g.x0, height: th, opacity: 0, fontSize: 16, cursor: 'text' }}
      />
    </Stage>
  );
}
