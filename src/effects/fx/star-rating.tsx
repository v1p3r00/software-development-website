import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Five stars. Hover to preview, press to rate: the stars fill one after another, each with a
 * spark burst, a happy hop and a wiggle, and the mood word underneath changes.
 */

const N = 5;
const WORDS = ['Rate it', 'Terrible', 'Not great', 'Okay', 'Good', 'Amazing!'];

interface Star {
  on: number; // 0..1 fill
  due: number; // time at which it lights (-1 = not scheduled)
  y: Spring; // hop
  r: Spring; // wiggle, degrees
  sc: Spring;
  spark: number; // seconds since its spark (-1 none)
}

interface S {
  t: number;
  rating: number;
  hover: number; // stars under the pointer (0 = none), smoothed for the glow
  hoverN: number;
  stars: Star[];
  word: Spring; // word pop
  idle: number;
  auto: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const S = Math.min((w * 0.8) / N, m * 0.2);
  const gap = S * 1.12;
  return { m, S, gap, x0: w / 2 - gap * (N - 1) * 0.5, cy: h * 0.46 };
}

function rate(s: S, r: number) {
  const prev = s.rating;
  s.rating = r;
  s.word.x = 0.6;
  s.word.v = 6;
  s.stars.forEach((st, i) => {
    if (i < r) {
      // fill in a ripple from the left; the ones already lit hop again, a bit quicker
      st.due = s.t + i * (i < prev ? 0.045 : 0.075);
    } else {
      st.due = -1;
      if (st.on > 0.5) st.sc.v -= 3;
    }
  });
}

export const sim = defineSim<S>({
  init: () => ({
    t: 0,
    rating: 0,
    hover: 0,
    hoverN: 0,
    stars: Array.from({ length: N }, () => ({ on: 0, due: -1, y: sp(), r: sp(), sc: sp(1), spark: -1 })),
    word: sp(1),
    idle: 0,
    auto: 0,
  }),
  step(s, f) {
    s.t += f.dt;
    const { S, gap, x0, cy } = geom(f.w, f.h);
    const inRow = Math.abs(f.p.y - cy) < S * 0.8 && f.p.x > x0 - gap * 0.6 && f.p.x < x0 + gap * (N - 0.4);
    const idx = inRow ? clamp(Math.floor((f.p.x - (x0 - gap / 2)) / gap) + 1, 1, N) : 0;
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    let hov = f.p.over ? idx : 0;
    if (f.pressed && idx) rate(s, idx);
    for (const a of f.actions) if (a.type === 'rate') rate(s, clamp(a.r as number, 0, N));
    // self-demo: the pointer drifts along the row, then picks a rating
    if (s.idle > 1.5) {
      s.auto += f.dt;
      const sweep = clamp(s.auto / 0.9);
      const pick = 3 + Math.floor((s.t * 7.3) % 3);
      hov = Math.round(sweep * pick);
      if (s.auto > 0.9 && s.auto - f.dt <= 0.9) rate(s, pick);
      if (s.auto > 2.9) {
        rate(s, 0);
        s.auto = -0.3;
      }
    } else s.auto = 0;
    s.hoverN = hov;
    s.hover = approach(s.hover, hov, 18, f.dt);
    s.stars.forEach((st, i) => {
      if (st.due >= 0 && s.t >= st.due) {
        st.due = -1;
        const fresh = st.on < 0.5;
        st.on = Math.max(st.on, 0.01);
        st.spark = 0;
        st.y.v -= S * (fresh ? 9 : 6) * (f.reduced ? 0.3 : 1);
        st.r.v += (i % 2 ? 1 : -1) * 500 * (f.reduced ? 0.2 : 1);
        st.sc.v += 5;
        f.emit({ name: 'ding', gain: 0.35, rate: 1 + i * 0.12, pan: (i - 2) * 0.3 });
      }
      const want = i < s.rating ? 1 : 0;
      st.on = want ? (st.on > 0 ? Math.min(1, st.on + f.dt * 7) : 0) : st.on > 0.03 ? approach(st.on, 0, 14, f.dt) : 0;
      const hoverLift = s.hoverN > i ? 1.06 : 1;
      spring(st.y, 0, 380, f.reduced ? 40 : 14, f.dt);
      spring(st.r, 0, 300, f.reduced ? 40 : 10, f.dt);
      spring(st.sc, hoverLift, 420, 14, f.dt);
      if (st.spark >= 0) st.spark = st.spark > 0.6 ? -1 : st.spark + f.dt;
    });
    spring(s.word, 1, 380, 14, f.dt);
  },
});

/** a 5-point star with rounded tips */
function starPath(r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.48 : r;
    pts.push(`${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

export default function StarRating() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, S, gap, x0, cy } = geom(w, h);
  const R = S * 0.42;
  const path = starPath(R);
  const shown = s.rating || 0;
  const preview = s.hoverN;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#0d0c14' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`bg${uid}`} cx="50%" cy="40%" r="80%">
            <stop offset="0" stopColor="#2a2440" />
            <stop offset="0.55" stopColor="#141122" />
            <stop offset="1" stopColor="#08070d" />
          </radialGradient>
          <radialGradient id={`gold${uid}`} cx="38%" cy="28%" r="80%">
            <stop offset="0" stopColor="#fff6c4" />
            <stop offset="0.3" stopColor="#ffd34d" />
            <stop offset="0.75" stopColor="#ffa41b" />
            <stop offset="1" stopColor="#e2700a" />
          </radialGradient>
          <radialGradient id={`glow${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffc53d" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffc53d" stopOpacity="0" />
          </radialGradient>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={S * 0.06} />
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#bg${uid})`} />
        {s.stars.map((st, i) => {
          const cx = x0 + i * gap;
          const on = st.on;
          const pv = preview > i && on < 0.5 ? 1 : 0;
          const hop = Math.min(0, st.y.x);
          return (
            <g key={i}>
              {/* floor shadow shrinks while the star is in the air */}
              <ellipse cx={cx} cy={cy + R * 1.25} rx={R * 0.75 * (1 + hop / (S * 1.5))} ry={R * 0.12} fill="#000" opacity={0.5 + hop / (S * 3)} filter={`url(#sh${uid})`} />
              <circle cx={cx} cy={cy + st.y.x} r={R * 2.1} fill={`url(#glow${uid})`} opacity={on * 0.9} />
              {/* spark: short rays shooting out and fading */}
              {st.spark >= 0 &&
                Array.from({ length: 8 }, (_, k) => {
                  const a = (k / 8) * Math.PI * 2 + i;
                  const e = 1 - Math.pow(1 - clamp(st.spark / 0.45), 3);
                  const r0 = R * (1.05 + e * 0.9);
                  const r1 = R * (1.05 + e * 1.3) + (k % 2 ? 0 : R * 0.2);
                  return (
                    <line
                      key={k}
                      x1={cx + Math.cos(a) * r0}
                      y1={cy + st.y.x + Math.sin(a) * r0}
                      x2={cx + Math.cos(a) * r1}
                      y2={cy + st.y.x + Math.sin(a) * r1}
                      stroke={k % 2 ? '#fff2b0' : '#ffb21e'}
                      strokeWidth={R * 0.09 * (1 - e) + 0.3}
                      strokeLinecap="round"
                      opacity={1 - e}
                    />
                  );
                })}
              <g transform={`translate(${cx} ${cy + st.y.x}) rotate(${st.r.x}) scale(${st.sc.x * (1 + Math.max(0, -st.y.v) / (S * 60))} ${st.sc.x})`}>
                {/* empty socket */}
                <path d={path} fill="#231f33" stroke="#231f33" strokeWidth={R * 0.22} strokeLinejoin="round" />
                <path d={path} fill="none" stroke={pv ? '#ffd34d' : '#3d3656'} strokeOpacity={pv ? 0.9 : 1} strokeWidth={R * 0.07} strokeLinejoin="round" />
                {/* the gold fill grows from the middle */}
                <g transform={`scale(${on})`}>
                  <path d={path} fill={`url(#gold${uid})`} stroke="#ffb21e" strokeWidth={R * 0.22} strokeLinejoin="round" />
                  <path d={starPath(R * 0.55)} transform={`translate(${-R * 0.12} ${-R * 0.18})`} fill="#fff" opacity="0.22" />
                </g>
              </g>
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy + S * 0.85,
          textAlign: 'center',
          fontFamily: "'Archivo Variable', Archivo, system-ui",
          fontWeight: 800,
          fontSize: m * 0.065,
          color: shown ? '#ffd34d' : '#6f6890',
          transform: `scale(${s.word.x})`,
          textShadow: shown ? `0 0 ${m * 0.03}px rgba(255,180,40,0.45)` : 'none',
        }}
      >
        {WORDS[shown]}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy - S * 1.2, textAlign: 'center', fontFamily: "'Inter Variable', Inter, system-ui", fontWeight: 600, fontSize: m * 0.026, letterSpacing: m * 0.006, color: '#6f6890' }}>
        HOW WAS YOUR STAY?
      </div>
      {Array.from({ length: N }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i + 1} star${i ? 's' : ''}`}
          aria-pressed={s.rating === i + 1}
          style={{ position: 'absolute', left: x0 + i * gap - gap / 2, top: cy - S / 2, width: gap, height: S, opacity: 0 }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              fx.dispatch({ type: 'rate', r: i + 1 });
            }
          }}
        />
      ))}
    </Stage>
  );
}
