import { useId } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * Strength creature. A little blob sits on your password field and feels your password: weak
 * ones make it shrink, droop and cry; every step stronger it grows, perks up, hops, blushes, and
 * at full strength it beams with sparkles. Its eyes follow the caret as you type.
 */

interface S {
  text: string;
  score: number; // 0..4
  mood: Spring; // -1 … 1
  size: Spring;
  hop: Spring; // vertical offset
  sq: Spring; // squash
  look: number; // eye direction -1..1
  blink: number;
  tear: number; // tear progress 0..1
  sparkle: number;
  idle: number;
  demo: number;
  demoI: number;
  focus: boolean;
  t: number;
}

const DEMO = ['c', 'ca', 'cat', 'cats', 'cats1', 'Cats1', 'Cats1!', 'Cats1!Ta', 'Cats1!Tang', 'Cats1!Tango9', 'Cats1!Tango9#'];
const LABEL = ['Too weak', 'Weak', 'Okay', 'Strong', 'Unbreakable'];
const COL = ['#ff5a6e', '#ff9a4a', '#ffd34d', '#7ee07a', '#38d9c4'];

function scoreOf(p: string) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (p.length < 6) s = Math.min(s, 1);
  return Math.min(4, s);
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const fw = Math.min(w * 0.8, m * 1.0, 480);
  const fh = Math.min(fw * 0.15, m * 0.12);
  const R = Math.min(m * 0.17, 120);
  return { fw, fh, R, cx: w / 2, fy: h / 2 + R * 0.75 };
}

function setText(s: S, v: string, f: { emit: (x: { name: string; gain?: number; rate?: number }) => void }) {
  const before = s.score;
  s.text = v.slice(0, 28);
  s.score = scoreOf(s.text);
  s.hop.v -= 3; // a little reaction to every key
  if (s.score > before) {
    s.hop.v -= 9 + s.score * 2;
    f.emit({ name: s.score === 4 ? 'success' : 'chime', gain: 0.5, rate: 0.9 + s.score * 0.12 });
  } else if (s.score < before) {
    s.sq.v += 5;
    f.emit({ name: 'squeak', gain: 0.3, rate: 0.6 });
  } else f.emit({ name: 'tick', gain: 0.25, rate: 1 + s.text.length * 0.03 });
}

export const sim = defineSim<S>({
  init: () => ({ text: '', score: 0, mood: sp(-0.6), size: sp(0.8), hop: sp(), sq: sp(), look: 0, blink: 0, tear: 0, sparkle: 0, idle: 0, demo: 0, demoI: -1, focus: false, t: 0 }),
  step(s, f) {
    const g = geom(f.w, f.h);
    const dt = f.dt;
    s.t += dt;
    if (f.p.over || f.p.down || s.focus) s.idle = 0;
    else s.idle += dt;
    for (const a of f.actions) {
      if (a.type === 'focus') s.focus = true;
      if (a.type === 'blur') s.focus = false;
      if (a.type === 'text') {
        s.demoI = -1;
        setText(s, String(a.value ?? ''), f);
      }
    }
    // self-demo: types a password that keeps getting better, then clears it
    if (s.idle > 2.2) {
      s.demo += dt;
      const i = Math.floor(s.demo / 0.32);
      if (i !== s.demoI) {
        s.demoI = i;
        const k = i % (DEMO.length + 7);
        if (k < DEMO.length) setText(s, DEMO[k], f);
        else if (k === DEMO.length + 6) setText(s, '', f);
      }
    } else s.demo = 0;

    const target = s.text ? lerp(-0.8, 1, s.score / 4) : -0.2;
    const d = f.reduced ? 2 : 1;
    spring(s.mood, target, 60, 11, dt);
    spring(s.size, s.text ? 0.78 + s.score * 0.09 : 0.82, 120, 9 * d, dt);
    spring(s.hop, 0, 160, 9 * d, dt);
    spring(s.sq, 0, 260, 10 * d, dt);
    // a happy creature bounces on its own
    if (s.score === 4 && s.text && s.hop.x > -0.5 && s.hop.v > -1 && Math.sin(s.t * 6) > 0.98) s.hop.v -= 7;
    // eyes track the caret (the end of the text)
    const fs = g.fh * 0.4;
    const caretX = g.cx - g.fw / 2 + g.fh * 0.4 + s.text.length * fs * 0.62;
    s.look = approach(s.look, s.text ? clamp((caretX - g.cx) / (g.fw * 0.5), -1, 1) : 0, 8, dt);
    // blink every ~3.3 s
    const bp = (s.t % 3.3) / 3.3;
    s.blink = bp > 0.96 ? 1 : 0;
    s.tear = s.mood.x < -0.45 ? (s.tear + dt * 0.7) % 1 : approach(s.tear, 0, 4, dt);
    s.sparkle = approach(s.sparkle, s.score === 4 && s.text ? 1 : 0, 5, dt);
  },
});

export default function PasswordCreature() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h, t } = fx;
  const g = geom(w, h);
  const { fw, fh, cx, fy } = g;
  const mood = clamp(s.mood.x, -1, 1.1);
  const happy = clamp(mood);
  const sad = clamp(-mood);
  const R = g.R * s.size.x;
  const breathe = Math.sin(t * 2.2) * 0.02;
  const sq = s.sq.x - Math.min(0, s.hop.v) * 0.004;
  const sx = 1 + sq * 0.12 + breathe + sad * 0.06;
  const sy = 1 - sq * 0.12 - breathe - sad * 0.1;
  const hop = Math.min(0, s.hop.x) * R * 0.18;
  const baseY = fy - fh / 2; // sits on the field
  const by = baseY - R * sy + hop;
  // body colour: gloomy slate → mint → sunshine
  const c0 = [126, 140, 175];
  const c1 = [120, 226, 190];
  const c2 = [255, 205, 77];
  const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
  const col = mood < 0.3 ? mix(c0, c1, clamp((mood + 0.8) / 1.1)) : mix(c1, c2, clamp((mood - 0.3) / 0.7));
  const bodyC = `rgb(${col.join(',')})`;
  const darkC = `rgb(${col.map((v) => Math.round(v * 0.6)).join(',')})`;
  const lightC = `rgb(${col.map((v) => Math.round(v + (255 - v) * 0.5)).join(',')})`;
  const ex = R * 0.36;
  const eyR = R * 0.17 * (1 + happy * 0.15);
  const ey = -R * 0.12;
  const lookX = s.look * eyR * 0.45;
  const lid = s.blink ? 1 : clamp(sad * 0.55 + 0.05);
  const closedHappy = happy > 0.85;
  const mouthW = R * (0.22 + happy * 0.18);
  const mouthY = R * 0.3;
  const curve = mood * R * 0.22;
  const open = clamp((happy - 0.5) * 2);
  const ui = "'Inter Variable', Inter, system-ui, sans-serif";
  const fs = fh * 0.4;
  const len = s.text.length;
  const score = s.text ? s.score : -1;

  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(110% 90% at 50% 25%, #23203a 0%, #131222 60%, #0a0912 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`b${uid}`} cx="38%" cy="30%" r="80%">
            <stop offset="0" stopColor={lightC} />
            <stop offset="0.55" stopColor={bodyC} />
            <stop offset="1" stopColor={darkC} />
          </radialGradient>
          <radialGradient id={`aura${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd34d" stopOpacity="0.4" />
            <stop offset="1" stopColor="#ffd34d" stopOpacity="0" />
          </radialGradient>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={R * 0.08} />
          </filter>
        </defs>
        <circle cx={cx} cy={by} r={R * 2.2} fill={`url(#aura${uid})`} opacity={happy * 0.9} />
        {/* sparkles orbiting a delighted creature */}
        {s.sparkle > 0.02 &&
          Array.from({ length: 6 }, (_, i) => {
            const a = t * 1.3 + (i / 6) * Math.PI * 2;
            const r = R * (1.45 + 0.12 * Math.sin(t * 4 + i));
            const x = cx + Math.cos(a) * r;
            const y = by + Math.sin(a) * r * 0.75;
            const k = R * 0.09 * (0.6 + 0.4 * Math.sin(t * 7 + i * 2));
            return <path key={i} d={`M${x} ${y - k * 2}Q${x} ${y} ${x + k * 2} ${y}Q${x} ${y} ${x} ${y + k * 2}Q${x} ${y} ${x - k * 2} ${y}Q${x} ${y} ${x} ${y - k * 2}Z`} fill="#fff6c9" opacity={s.sparkle} />;
          })}
        {/* contact shadow on the field */}
        <ellipse cx={cx} cy={baseY + 2} rx={R * sx * (0.85 + hop / R * 0.3)} ry={R * 0.12} fill="#000" opacity={0.45} filter={`url(#sh${uid})`} />
        <g transform={`translate(${cx} ${by}) scale(${sx} ${sy})`}>
          {/* little feet and ears (ears perk up when happy) */}
          <ellipse cx={-R * 0.45} cy={R * 0.92} rx={R * 0.22} ry={R * 0.12} fill={darkC} />
          <ellipse cx={R * 0.45} cy={R * 0.92} rx={R * 0.22} ry={R * 0.12} fill={darkC} />
          <g transform={`rotate(${lerp(55, -10, clamp((mood + 1) / 2))} ${-R * 0.55} ${-R * 0.7})`}>
            <ellipse cx={-R * 0.55} cy={-R * 0.98} rx={R * 0.14} ry={R * 0.3} fill={bodyC} />
          </g>
          <g transform={`rotate(${lerp(-55, 10, clamp((mood + 1) / 2))} ${R * 0.55} ${-R * 0.7})`}>
            <ellipse cx={R * 0.55} cy={-R * 0.98} rx={R * 0.14} ry={R * 0.3} fill={bodyC} />
          </g>
          <circle r={R} fill={`url(#b${uid})`} />
          <ellipse cx={-R * 0.32} cy={-R * 0.55} rx={R * 0.3} ry={R * 0.15} fill="#fff" opacity={0.35} transform={`rotate(-20 ${-R * 0.32} ${-R * 0.55})`} />
          {/* cheeks */}
          <ellipse cx={-R * 0.58} cy={R * 0.18} rx={R * 0.14} ry={R * 0.08} fill="#ff6f91" opacity={happy * 0.6} />
          <ellipse cx={R * 0.58} cy={R * 0.18} rx={R * 0.14} ry={R * 0.08} fill="#ff6f91" opacity={happy * 0.6} />
          {/* eyes */}
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${sd * ex} ${ey})`}>
              {closedHappy && !s.blink ? (
                <path d={`M${-eyR} ${eyR * 0.2} Q0 ${-eyR * 1.3} ${eyR} ${eyR * 0.2}`} fill="none" stroke="#1d1a2b" strokeWidth={R * 0.07} strokeLinecap="round" />
              ) : (
                <g>
                  <circle r={eyR} fill="#fff" />
                  <circle cx={lookX} cy={eyR * 0.1 + sad * eyR * 0.3} r={eyR * 0.58} fill="#1d1a2b" />
                  <circle cx={lookX - eyR * 0.2} cy={-eyR * 0.18} r={eyR * 0.18} fill="#fff" />
                  {/* eyelid: droops with sadness (tilted down at the outer corner), shuts on blink */}
                  <path d={`M${-eyR * 1.2} ${-eyR * 1.2} H${eyR * 1.2} V${-eyR + lid * eyR * 2.1} L${-eyR * 1.2} ${-eyR + lid * eyR * 2.1 - sd * sad * eyR * 0.5}Z`} fill={bodyC} />
                </g>
              )}
              {/* worried brows */}
              <path d={`M${-eyR * 0.9} ${-eyR * 1.45 - sd * sad * eyR * 0.5} L${eyR * 0.9} ${-eyR * 1.45 + sd * sad * eyR * 0.5}`} stroke="#1d1a2b" strokeWidth={R * 0.045} strokeLinecap="round" opacity={sad} />
            </g>
          ))}
          {/* mouth: frown → smile → open grin */}
          {open > 0.02 ? (
            <g>
              <path d={`M${-mouthW} ${mouthY} Q0 ${mouthY + curve * 2.2} ${mouthW} ${mouthY} Z`} fill="#3a1424" />
              <ellipse cx={0} cy={mouthY + curve * 0.75} rx={mouthW * 0.45} ry={curve * 0.35} fill="#ff6f91" opacity={open} />
            </g>
          ) : (
            <path d={`M${-mouthW} ${mouthY} Q0 ${mouthY + curve * 2} ${mouthW} ${mouthY}`} fill="none" stroke="#1d1a2b" strokeWidth={R * 0.06} strokeLinecap="round" />
          )}
          {/* a tear rolling down when it's upset */}
          {sad > 0.45 && (
            <path
              transform={`translate(${-ex - eyR * 0.4} ${ey + eyR + s.tear * R * 0.7})`}
              d={`M0 ${-R * 0.08} Q${R * 0.06} ${R * 0.02} 0 ${R * 0.05} Q${-R * 0.06} ${R * 0.02} 0 ${-R * 0.08}Z`}
              fill="#9fdcff"
              opacity={(1 - s.tear) * clamp((sad - 0.45) * 4)}
            />
          )}
        </g>
        {/* the field */}
        <rect x={cx - fw / 2} y={fy - fh / 2} width={fw} height={fh} rx={fh * 0.24} fill="#0e0d18" stroke={s.focus ? '#a99bff' : '#2c2944'} strokeWidth={1.5} />
        {Array.from({ length: len }, (_, i) => (
          <circle key={i} cx={cx - fw / 2 + fh * 0.4 + i * fs * 0.62 + fs * 0.3} cy={fy} r={fs * 0.17} fill="#d9d4f5" />
        ))}
        {!len && (
          <text x={cx - fw / 2 + fh * 0.4} y={fy} dominantBaseline="central" fontFamily={ui} fontSize={fs * 0.9} fill="#5f5a80">
            Choose a password
          </text>
        )}
        {/* strength meter */}
        {Array.from({ length: 4 }, (_, i) => {
          const segW = (fw - fh * 0.3) / 4;
          const on = score >= 0 && i <= Math.max(0, score - 1) && score > 0;
          return <rect key={i} x={cx - fw / 2 + i * (segW + fh * 0.1)} y={fy + fh * 0.75} width={segW} height={Math.max(4, fh * 0.1)} rx={fh * 0.05} fill={on ? COL[score] : '#2a2740'} />;
        })}
        <text x={cx - fw / 2} y={fy + fh * 1.35} dominantBaseline="hanging" fontFamily={ui} fontWeight={600} fontSize={Math.max(11, fh * 0.26)} fill={score >= 0 ? COL[score] : '#5f5a80'}>
          {score >= 0 ? LABEL[score] : 'Make it happy'}
        </text>
      </svg>
      <input
        aria-label="Password"
        type="password"
        value={s.text}
        onChange={(e) => fx.dispatch({ type: 'text', value: e.target.value })}
        onFocus={() => fx.dispatch({ type: 'focus' })}
        onBlur={() => fx.dispatch({ type: 'blur' })}
        style={{ position: 'absolute', left: cx - fw / 2, top: fy - fh / 2, width: fw, height: fh, opacity: 0, fontSize: 16, cursor: 'text' }}
      />
    </Stage>
  );
}
