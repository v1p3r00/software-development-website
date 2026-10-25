import { defineSim, sp, spring, useFx, Stage, clamp, approach, smooth } from '../kit';
import type { Spring, Frame } from '../kit';

/**
 * A frosted glass sign-in card over drifting colour. Fill in the fields, press Continue and the
 * card flips over in 3D to a one-time-code screen; the digits pop into their slots, a shimmer
 * verifies them and the slots turn green.
 */

const CW = 360; // the card is designed at 360 × 440 and scaled to the stage
const CH = 440;
const EMAIL = 'david@studio.dev';
const PW_LEN = 11;
const CODE = '482 916'.replace(' ', '');

type Phase = 'login' | 'flip' | 'mfa' | 'verify' | 'done' | 'back';

interface S {
  phase: Phase;
  angle: Spring; // 0 = front, 180 = back
  email: number; // characters typed
  pw: number;
  code: number;
  focus: 'email' | 'pw' | 'code' | null;
  typeClock: number;
  btn: Spring; // button press depth
  btnDown: boolean;
  timer: number; // time in the current phase
  idle: number;
  auto: boolean;
  shimmer: number;
  pops: Spring[]; // per-digit pop scale
  glow: Spring;
  caret: number;
}

function layout(w: number, h: number) {
  const k = Math.min((w * 0.86) / CW, (h * 0.88) / CH);
  return { k, x: (w - CW * k) / 2, y: (h - CH * k) / 2 };
}

const hit = (lx: number, ly: number, x: number, y: number, ww: number, hh: number) => lx >= x && lx <= x + ww && ly >= y && ly <= y + hh;

function setPhase(s: S, p: Phase) {
  s.phase = p;
  s.timer = 0;
}

function press(s: S, f: Frame, lx: number, ly: number) {
  if (s.phase === 'login') {
    if (hit(lx, ly, 32, 166, 296, 54)) s.focus = 'email';
    else if (hit(lx, ly, 32, 232, 296, 54)) s.focus = 'pw';
    else if (hit(lx, ly, 32, 312, 296, 52)) s.btnDown = true;
    else s.focus = null;
    if (s.focus) f.emit({ name: 'tick', gain: 0.3 });
  } else if (s.phase === 'mfa') {
    if (hit(lx, ly, 20, 180, 320, 120)) s.focus = 'code';
  } else if (s.phase === 'done') {
    flipBack(s, f);
  }
}

function flipBack(s: S, f: Frame) {
  setPhase(s, 'back');
  s.angle.v -= 120;
  f.emit({ name: 'whoosh', gain: 0.5, rate: 1.1 });
}

export const sim = defineSim<S>({
  init: () => ({
    phase: 'login',
    angle: sp(0),
    email: 0,
    pw: 0,
    code: 0,
    focus: null,
    typeClock: 0,
    btn: sp(0),
    btnDown: false,
    timer: 0,
    idle: 0,
    auto: false,
    shimmer: 0,
    pops: Array.from({ length: 6 }, () => sp(0)),
    glow: sp(0),
    caret: 0,
  }),
  step(s, f) {
    const { k, x, y } = layout(f.w, f.h);
    const lx = (f.p.x - x) / k;
    const ly = (f.p.y - y) / k;
    s.timer += f.dt;
    s.caret += f.dt;

    // nobody around: the card demonstrates itself (gallery only)
    if (f.pressed || (f.p.over && Math.abs(f.p.vx) + Math.abs(f.p.vy) > 30)) {
      s.idle = 0;
      s.auto = false;
    } else s.idle += f.dt;
    if (f.live && s.idle > 2.5) s.auto = true;

    if (f.pressed) press(s, f, lx, ly);
    for (const a of f.actions) if (a.type === 'press') press(s, f, a.x as number, a.y as number);

    if (s.auto) {
      if (s.phase === 'login') {
        if (!s.focus && s.email < EMAIL.length && s.timer > 0.4) s.focus = 'email';
        if (s.email >= EMAIL.length && s.focus === 'email' && s.typeClock > 0.35) s.focus = 'pw';
        if (s.pw >= PW_LEN && s.focus === 'pw' && s.typeClock > 0.45) {
          s.btnDown = true;
          s.focus = null;
          s.typeClock = 0;
        }
        if (s.btnDown && s.btn.x > 0.85) s.btnDown = false;
      } else if (s.phase === 'mfa' && !s.focus && s.timer > 0.5) s.focus = 'code';
    }

    // typing: about 16 characters a second, a little uneven like a real hand
    s.typeClock += f.dt;
    const rate = s.focus === 'code' ? 0.16 : 0.055 + (Math.sin(s.caret * 13) + 1) * 0.012;
    if (s.typeClock > rate) {
      if (s.focus === 'email' && s.email < EMAIL.length) {
        s.email++;
        s.typeClock = 0;
        f.emit({ name: 'tick', gain: 0.22, rate: 0.9 + f.rand() * 0.3 });
      } else if (s.focus === 'pw' && s.pw < PW_LEN) {
        s.pw++;
        s.typeClock = 0;
        f.emit({ name: 'tick', gain: 0.22, rate: 0.9 + f.rand() * 0.3 });
      } else if (s.focus === 'code' && s.phase === 'mfa' && s.code < 6) {
        s.pops[s.code].v = 14;
        s.code++;
        s.typeClock = 0;
        f.emit({ name: 'click', gain: 0.5, rate: 0.95 + s.code * 0.05, pan: (s.code - 3.5) / 5 });
        if (s.code === 6) {
          setPhase(s, 'verify');
          s.focus = null;
        }
      }
    }

    // the button: down while held, Continue fires on release
    if (s.phase === 'login' && s.btnDown && !f.p.down && !s.auto) s.btnDown = false;
    const wasDown = s.btn.x > 0.5;
    spring(s.btn, s.btnDown ? 1 : 0, 900, 30, f.dt);
    if (s.phase === 'login' && !s.btnDown && wasDown && s.btn.x <= 0.5) {
      // fill anything still empty, then flip
      s.email = EMAIL.length;
      s.pw = PW_LEN;
      setPhase(s, 'flip');
      s.focus = null;
      f.emit({ name: 'click', gain: 0.6 });
      f.emit({ name: 'whoosh', gain: 0.7 });
    }

    // the flip spring overshoots a little, then the card settles like a heavy pane of glass
    const target = s.phase === 'login' || s.phase === 'back' ? 0 : 180;
    const before = s.angle.x;
    spring(s.angle, target, 70, 11, f.dt);
    if (s.phase === 'flip' && before < 180 && s.angle.x >= 180) f.emit({ name: 'glass', gain: 0.45 });
    if (s.phase === 'flip' && s.timer > 0.55) setPhase(s, 'mfa');
    if (s.phase === 'back' && s.timer > 0.6) {
      s.email = 0;
      s.pw = 0;
      s.code = 0;
      s.glow.x = 0;
      setPhase(s, 'login');
    }
    if (s.phase === 'verify') {
      s.shimmer = s.timer / 0.9;
      if (s.timer > 0.9) {
        setPhase(s, 'done');
        s.glow.v = 8;
        f.emit({ name: 'success', gain: 0.8 });
      }
    }
    if (s.phase === 'done' && (s.auto || !f.live) && s.timer > 2.6) flipBack(s, f);
    spring(s.glow, s.phase === 'done' ? 1 : 0, 120, 12, f.dt);
    for (const p of s.pops) spring(p, 0, 420, 16, f.dt);
    if (s.btnDown && s.phase === 'login' && f.p.down) s.idle = 0;
    s.shimmer = approach(s.shimmer, s.phase === 'verify' ? s.shimmer : 0, 1, f.dt);
  },
});

/** the colourful scene behind the glass; drawn twice: sharp behind, blurred inside the card */
function Blobs({ t, w, h, dx = 0, dy = 0 }: { t: number; w: number; h: number; dx?: number; dy?: number }) {
  const m = Math.max(w, h);
  const blob = (cx: number, cy: number, r: number, c: string, ph: number) => {
    const bx = cx * w + Math.sin(t * 0.35 + ph) * m * 0.06 - dx;
    const by = cy * h + Math.cos(t * 0.28 + ph * 1.7) * m * 0.05 - dy;
    return <div key={c} style={{ position: 'absolute', left: bx - r * m, top: by - r * m, width: r * m * 2, height: r * m * 2, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, ${c}00 68%)` }} />;
  };
  return (
    <>
      {blob(0.22, 0.24, 0.42, '#ff5f1f', 0)}
      {blob(0.82, 0.3, 0.38, '#7b4dff', 1.3)}
      {blob(0.7, 0.86, 0.44, '#00b3ff', 2.4)}
      {blob(0.18, 0.86, 0.32, '#ff2e88', 3.1)}
      {/* crisp glossy orbs: they make the frosting of the glass readable */}
      {orb(0.3, 0.3, 0.13, ['#ffd3b8', '#ff6a2b', '#9b2a00'], 0.4)}
      {orb(0.76, 0.68, 0.16, ['#d9ccff', '#7b4dff', '#2a0f8f'], 2.0)}
      {orb(0.62, 0.16, 0.06, ['#c9f1ff', '#00b3ff', '#00507a'], 4.2)}
      {orb(0.2, 0.8, 0.075, ['#ffd0e6', '#ff2e88', '#7a0038'], 5.1)}
    </>
  );
  function orb(cx: number, cy: number, r: number, c: string[], ph: number) {
    const bx = cx * w + Math.sin(t * 0.5 + ph) * m * 0.05 - dx;
    const by = cy * h + Math.cos(t * 0.42 + ph) * m * 0.04 - dy;
    const R = r * m;
    return (
      <div
        key={ph}
        style={{
          position: 'absolute',
          left: bx - R,
          top: by - R,
          width: R * 2,
          height: R * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle at 34% 30%, ${c[0]} 0%, ${c[1]} 42%, ${c[2]} 100%)`,
          boxShadow: `0 ${R * 0.25}px ${R * 0.6}px rgba(0,0,0,.35)`,
        }}
      />
    );
  }
}

const ui = "'Inter Variable', Inter, system-ui, sans-serif";

export default function GlassLogin() {
  const fx = useFx(sim);
  const { s, w, h, t } = fx;
  const { k, x, y } = layout(w, h);
  const a = s.angle.x;
  const showBack = a > 90;
  // a light sweep across the glass as it turns
  const sheen = Math.sin((a / 180) * Math.PI);
  const lift = sheen * 40; // the card comes forward while it turns
  const done = clamp(s.glow.x, 0, 1.2);
  const caretOn = Math.floor(s.caret * 2) % 2 === 0;

  const face = (back: boolean) => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 28,
        overflow: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : undefined,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.55), inset 0 0 0 1px rgba(255,255,255,.22), inset 0 -30px 60px rgba(255,255,255,.04)`,
      }}
    >
      {/* the frosted scene seen through the glass */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: w / k, height: h / k, filter: 'blur(26px) saturate(1.5)', transform: `translate(${-x / k}px, ${-y / k}px)` }}>
        <div style={{ position: 'absolute', inset: 0, background: '#0b0d18' }} />
        <Blobs t={t} w={w / k} h={h / k} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,.07) 45%, rgba(255,255,255,.04))' }} />
      {/* travelling specular band */}
      <div
        style={{
          position: 'absolute',
          inset: -60,
          background: `linear-gradient(105deg, transparent 35%, rgba(255,255,255,${0.08 + sheen * 0.35}) 50%, transparent 65%)`,
          transform: `translateX(${(a / 180 - 0.5) * 300 * (back ? -1 : 1)}px)`,
        }}
      />
      {back ? <Back s={s} done={done} caretOn={caretOn} /> : <Front s={s} caretOn={caretOn} />}
    </div>
  );

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#0b0d18' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Blobs t={t} w={w} h={h} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 50%, transparent 40%, rgba(5,6,12,.55))' }} />
      {/* soft shadow on the "floor" behind the card */}
      <div
        style={{
          position: 'absolute',
          left: x + CW * k * 0.1,
          top: y + CH * k * 0.12,
          width: CW * k * 0.8,
          height: CH * k * 0.86,
          borderRadius: 40 * k,
          background: 'rgba(4,5,14,.55)',
          filter: `blur(${(30 + lift) * k}px)`,
          transform: `translateY(${(26 + lift * 0.6) * k}px) scaleX(${Math.abs(Math.cos((a * Math.PI) / 180)) * 0.85 + 0.15})`,
        }}
      />
      <div style={{ position: 'absolute', left: x, top: y, width: CW, height: CH, transformOrigin: '0 0', transform: `scale(${k})`, perspective: 1100 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `translateZ(${lift}px) rotateY(${a}deg) rotateX(${sheen * 4}deg)`,
          }}
        >
          {face(false)}
          {face(true)}
          {/* success halo */}
          {showBack && done > 0.01 && (
            <div style={{ position: 'absolute', inset: -2, borderRadius: 30, transform: 'rotateY(180deg)', boxShadow: `0 0 ${60 * done}px rgba(52,211,153,${0.55 * done}), inset 0 0 0 1.5px rgba(110,231,183,${0.8 * done})`, pointerEvents: 'none' }} />
          )}
        </div>
      </div>
    </Stage>
  );
}

function Field({ y, label, value, focused, caretOn, mono }: { y: number; label: string; value: string; focused: boolean; caretOn: boolean; mono?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 32,
        top: y,
        width: 296,
        height: 54,
        borderRadius: 14,
        background: focused ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)',
        boxShadow: focused ? 'inset 0 0 0 1.5px rgba(255,255,255,.75), 0 0 0 4px rgba(255,255,255,.12)' : 'inset 0 0 0 1px rgba(255,255,255,.25)',
      }}
    >
      <div style={{ position: 'absolute', left: 16, top: 8, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>{label}</div>
      <div style={{ position: 'absolute', left: 16, top: 25, fontSize: mono ? 18 : 15.5, letterSpacing: mono ? '.18em' : 0, color: '#fff', fontWeight: 450, whiteSpace: 'nowrap' }}>
        {value}
        <span style={{ display: 'inline-block', width: 1.5, height: 17, marginLeft: 1, verticalAlign: -3, background: '#fff', opacity: focused && caretOn ? 1 : 0 }} />
      </div>
    </div>
  );
}

function Front({ s, caretOn }: { s: S; caretOn: boolean }) {
  const b = s.btn.x;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: ui, color: '#fff' }}>
      <div style={{ position: 'absolute', left: 32, top: 38, width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#fff,#ffd9c7)', boxShadow: '0 6px 18px rgba(0,0,0,.25)', display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: '#ff5f1f', transform: 'rotate(45deg)' }} />
      </div>
      <div style={{ position: 'absolute', left: 32, top: 96, fontSize: 27, fontWeight: 650, letterSpacing: '-.02em', fontFamily: "'Archivo Variable', Archivo, system-ui" }}>Welcome back</div>
      <div style={{ position: 'absolute', left: 32, top: 132, fontSize: 14, color: 'rgba(255,255,255,.7)' }}>Sign in to your workspace</div>
      <Field y={166} label="Email" value={EMAIL.slice(0, s.email)} focused={s.focus === 'email'} caretOn={caretOn} />
      <Field y={232} label="Password" value={'•'.repeat(s.pw)} focused={s.focus === 'pw'} caretOn={caretOn} mono />
      <div
        style={{
          position: 'absolute',
          left: 32,
          top: 312 + b * 3,
          width: 296,
          height: 52,
          borderRadius: 14,
          background: 'linear-gradient(180deg,#ffffff,#e9e9f2)',
          color: '#141420',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 650,
          fontSize: 15.5,
          transform: `scale(${1 - b * 0.03})`,
          boxShadow: `0 ${10 - b * 8}px ${26 - b * 18}px rgba(10,10,30,${0.35 - b * 0.15}), inset 0 -2px 0 rgba(0,0,0,.08)`,
        }}
      >
        Continue →
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 392, textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,.6)' }}>🔒 Protected by two-step verification</div>
    </div>
  );
}

function Back({ s, done, caretOn }: { s: S; done: number; caretOn: boolean }) {
  const ok = s.phase === 'done';
  const shimmer = s.phase === 'verify' ? s.shimmer : -1;
  const check = smooth((s.timer - 0.05) / 0.45);
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: ui, color: '#fff', textAlign: 'center' }}>
      <div style={{ position: 'absolute', left: 150, top: 40, width: 60, height: 60, borderRadius: 20, background: ok ? 'rgba(52,211,153,.25)' : 'rgba(255,255,255,.16)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.35)', display: 'grid', placeItems: 'center' }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {ok ? (
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="24" strokeDashoffset={24 * (1 - check)} />
          ) : (
            <path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
          )}
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, fontSize: 24, fontWeight: 650, letterSpacing: '-.02em', fontFamily: "'Archivo Variable', Archivo, system-ui" }}>
        {ok ? 'You’re in' : 'Two-step verification'}
      </div>
      <div style={{ position: 'absolute', left: 30, right: 30, top: 154, fontSize: 13.5, color: 'rgba(255,255,255,.7)' }}>{ok ? 'Signed in as david@studio.dev' : 'Enter the 6-digit code from your authenticator app'}</div>
      {Array.from({ length: 6 }, (_, i) => {
        const filled = i < s.code;
        const pop = s.pops[i].x;
        const sh = shimmer >= 0 ? Math.max(0, 1 - Math.abs(shimmer * 7.5 - 0.6 - i) / 1.2) : 0;
        const active = s.focus === 'code' && i === s.code;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 31 + i * 51 + (i >= 3 ? 6 : 0) - 3,
              top: 206,
              width: 44,
              height: 58,
              borderRadius: 13,
              background: ok ? `rgba(52,211,153,${0.18 + 0.1 * done})` : filled ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.09)',
              boxShadow: ok
                ? 'inset 0 0 0 1.5px rgba(110,231,183,.9)'
                : active
                  ? 'inset 0 0 0 1.5px #fff, 0 0 0 4px rgba(255,255,255,.14)'
                  : `inset 0 0 0 1px rgba(255,255,255,${0.25 + sh * 0.6}), 0 0 ${24 * sh}px rgba(255,255,255,${sh * 0.5})`,
              transform: `translateY(${-pop * 1.2 - (ok ? Math.sin(Math.min(1, s.timer * 2) * Math.PI) * 6 * Math.exp(-i * 0.0) : 0)}px) scale(${1 + pop * 0.012})`,
              display: 'grid',
              placeItems: 'center',
              fontSize: 26,
              fontWeight: 600,
              fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace",
            }}
          >
            {filled ? CODE[i] : active && caretOn ? <span style={{ width: 2, height: 24, background: '#fff' }} /> : ''}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 296, fontSize: 13.5, color: ok ? '#a7f3d0' : 'rgba(255,255,255,.75)', fontWeight: 500 }}>
        {s.phase === 'verify' ? 'Verifying…' : ok ? 'Verified — redirecting' : s.code ? `${6 - s.code} more` : 'Tap to enter the code'}
      </div>
      <div style={{ position: 'absolute', left: 32, top: 336, width: 296, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.12)', overflow: 'hidden' }}>
        <div style={{ width: `${ok ? 100 : (s.code / 6) * 100}%`, height: '100%', borderRadius: 4, background: ok ? '#34d399' : '#fff' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 392, fontSize: 12.5, color: 'rgba(255,255,255,.55)' }}>Didn’t get it? Resend in 0:24</div>
    </div>
  );
}
