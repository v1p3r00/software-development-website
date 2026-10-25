import { useId, useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A live payment card. Type in the form and the card fills in: digits drop into their slots,
 * the brand (and its colours) is recognised from the first digit, a focus ring glides to the
 * field you are editing, and the card flips over to show the CVV on the signature strip.
 * Idle, it fills itself in as a demo.
 */

type Field = 'num' | 'name' | 'exp' | 'cvv';
const FIELDS: Field[] = ['num', 'name', 'exp', 'cvv'];
const MAX: Record<Field, number> = { num: 16, name: 22, exp: 4, cvv: 3 };
const DEMO = { num: '4539148803436467', name: 'ALEX MORGAN', exp: '0829', cvv: '731' };

interface S {
  v: Record<Field, string>;
  focus: Field | null;
  flip: Spring; // 0 = front, 1 = back
  pop: Spring[]; // per number digit: 0 = just typed, 1 = settled
  namePop: Spring;
  ring: { x: Spring; y: Spring; w: Spring; h: Spring; o: number };
  brand: number[]; // crossfade weights: none, visa, master, amex
  idle: number;
  demo: number; // demo clock, -1 when off
  userFocus: boolean;
}

const brandOf = (n: string) => (n[0] === '4' ? 1 : n[0] === '5' ? 2 : n[0] === '3' ? 3 : 0);

// where each field sits on the card front, in card units (card is 100 × 63)
const SLOT: Record<Field, [number, number, number, number]> = {
  num: [6, 33, 88, 12],
  name: [6, 48, 58, 13],
  exp: [68, 48, 26, 13],
  cvv: [6, 2, 0, 0],
};

/** the demo script as a pure function of time: what has been "typed" by t seconds */
function demoAt(t: number) {
  const take = (s: string, t0: number, rate: number) => s.slice(0, clamp(Math.floor((t - t0) * rate), 0, s.length));
  const v = { num: take(DEMO.num, 0.2, 13), name: take(DEMO.name, 1.7, 13), exp: take(DEMO.exp, 2.8, 9), cvv: take(DEMO.cvv, 3.9, 6) };
  const focus: Field | null = t < 1.6 ? 'num' : t < 2.7 ? 'name' : t < 3.4 ? 'exp' : t < 5.2 ? 'cvv' : null;
  return { v, focus };
}

export const sim = defineSim<S>({
  init: () => ({
    v: { num: '', name: '', exp: '', cvv: '' },
    focus: null,
    flip: sp(),
    pop: Array.from({ length: 16 }, () => sp(1)),
    namePop: sp(1),
    ring: { x: sp(6), y: sp(33), w: sp(88), h: sp(12), o: 0 },
    brand: [1, 0, 0, 0],
    idle: 1.2,
    demo: -1,
    userFocus: false,
  }),
  step(s, f) {
    const set = (k: Field, val: string) => {
      const old = s.v[k];
      if (val === old) return;
      if (val.length > old.length) {
        f.emit({ name: 'tick', gain: 0.35, rate: 0.9 + f.rand() * 0.3 });
        if (k === 'num') for (let i = old.length; i < val.length; i++) s.pop[i].x = 0;
        if (k === 'name') s.namePop.x = 0.6;
      }
      s.v[k] = val;
    };
    for (const a of f.actions) {
      s.idle = 0;
      s.demo = -1;
      if (a.type === 'field') set(a.field as Field, String(a.value));
      if (a.type === 'focus') {
        s.focus = (a.field as Field | null) ?? null;
        s.userFocus = !!a.field;
      }
    }
    if (f.p.down) s.idle = 0;
    s.idle += f.dt;
    // the self-demo runs only when nobody is using the form
    if (!s.userFocus && s.idle > 3) {
      if (s.demo < 0) {
        s.demo = 0;
        FIELDS.forEach((k) => (s.v[k] = ''));
      }
      s.demo += f.dt;
      const d = demoAt(s.demo);
      FIELDS.forEach((k) => set(k, d.v[k]));
      s.focus = d.focus;
      if (s.demo > 7) {
        // loop: wipe the card and type it again
        s.demo = 0;
        FIELDS.forEach((k) => (s.v[k] = ''));
      }
    }
    const wantBack = s.focus === 'cvv';
    const before = s.flip.x;
    spring(s.flip, wantBack ? 1 : 0, 70, f.reduced ? 20 : 11, f.dt);
    if ((before < 0.5) !== (s.flip.x < 0.5)) f.emit({ name: 'whoosh', gain: 0.4, rate: 1.2 });
    s.pop.forEach((p) => spring(p, 1, 320, 16, f.dt));
    spring(s.namePop, 1, 260, 14, f.dt);
    // the focus ring glides to the field being edited
    const r = s.focus && s.focus !== 'cvv' ? SLOT[s.focus] : null;
    if (r) {
      spring(s.ring.x, r[0], 200, 20, f.dt);
      spring(s.ring.y, r[1], 200, 20, f.dt);
      spring(s.ring.w, r[2], 200, 20, f.dt);
      spring(s.ring.h, r[3], 200, 20, f.dt);
    }
    s.ring.o = approach(s.ring.o, r ? 1 : 0, 10, f.dt);
    const b = brandOf(s.v.num);
    s.brand = s.brand.map((x, i) => approach(x, i === b ? 1 : 0, 6, f.dt));
  },
});

const GRAD = [
  'linear-gradient(135deg,#3a3f4b 0%,#20232b 55%,#111318 100%)',
  'linear-gradient(135deg,#2b5cff 0%,#3b1fa8 55%,#160b4a 100%)',
  'linear-gradient(135deg,#ff8a3d 0%,#b8262f 50%,#1a0a10 100%)',
  'linear-gradient(135deg,#2fd6b5 0%,#0b6e78 55%,#06263a 100%)',
];

export default function CreditCard() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const land = w / h > 1.15;
  const cw = land ? Math.min(w * 0.44, h * 0.52 * 1.586) : Math.min(w * 0.84, h * 0.36 * 1.586);
  const chh = cw / 1.586;
  const ccx = land ? w * 0.3 : w / 2;
  const ccy = land ? h / 2 : h * 0.27;
  const u = cw / 100;
  const flip = s.flip.x * 180;
  const lift = Math.sin(clamp(s.flip.x) * Math.PI);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  const fmt: Record<Field, (x: string) => string> = {
    num: (x) => x.replace(/(.{4})/g, '$1 ').trim(),
    name: (x) => x,
    exp: (x) => (x.length > 2 ? `${x.slice(0, 2)}/${x.slice(2)}` : x),
    cvv: (x) => x,
  };
  // the demo types into the real inputs too (only while the user is not editing)
  useLayoutEffect(() => {
    FIELDS.forEach((k) => {
      const el = refs.current[k];
      if (el && document.activeElement !== el && el.value !== fmt[k](s.v[k])) el.value = fmt[k](s.v[k]);
    });
  });
  const clean = (k: Field, raw: string) => (k === 'name' ? raw.toUpperCase().replace(/[^A-Z .'-]/g, '') : raw.replace(/\D/g, '')).slice(0, MAX[k]);

  const mono = "'JetBrains Mono Variable', monospace";
  const ui = "'Inter Variable', Inter, system-ui";
  const face = (back: boolean): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    borderRadius: u * 5,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: back ? 'rotateY(180deg)' : undefined,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
  });
  const sheen = 30 + s.flip.x * 60;
  const digits = Array.from({ length: 16 }, (_, i) => s.v.num[i]);

  // form geometry
  const fw = land ? w * 0.36 : cw;
  const fxl = land ? w * 0.57 : ccx - cw / 2;
  const fh = clamp(Math.min(w, h) * 0.075, 24, 52);
  const fs = fh * 0.38;
  const rowH = fh + fs * 1.9;
  const fy = land ? h / 2 - rowH * 1.5 : h * 0.52;
  const input = (k: Field, label: string, x: number, y: number, ww: number, ph: string) => (
    <label key={k} style={{ position: 'absolute', left: x, top: y, width: ww }}>
      <span style={{ display: 'block', fontFamily: ui, fontSize: fs * 0.78, color: s.focus === k ? '#9fb6ff' : 'rgba(210,215,235,0.6)', marginBottom: fs * 0.4, letterSpacing: 0.3 }}>{label}</span>
      <input
        ref={(el) => {
          refs.current[k] = el;
        }}
        aria-label={label}
        placeholder={ph}
        inputMode={k === 'name' ? 'text' : 'numeric'}
        autoComplete="off"
        onFocus={() => fx.dispatch({ type: 'focus', field: k })}
        onBlur={() => fx.dispatch({ type: 'focus', field: null })}
        onChange={(e) => {
          const v = clean(k, e.target.value);
          e.target.value = fmt[k](v);
          fx.dispatch({ type: 'field', field: k, value: v });
        }}
        style={{
          width: '100%',
          height: fh,
          boxSizing: 'border-box',
          padding: `0 ${fs * 0.8}px`,
          borderRadius: fh * 0.24,
          border: `1px solid ${s.focus === k ? 'rgba(130,160,255,0.9)' : 'rgba(255,255,255,0.12)'}`,
          background: 'rgba(255,255,255,0.05)',
          boxShadow: s.focus === k ? '0 0 0 3px rgba(90,120,255,0.25)' : 'none',
          color: '#eef1ff',
          fontFamily: k === 'name' ? ui : mono,
          fontSize: fs,
          outline: 'none',
        }}
      />
    </label>
  );

  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(90% 80% at 30% 30%, #1d2133 0%, #0f111a 60%, #08090d 100%)' }}>
      {/* soft floor shadow, shrinking as the card lifts to flip */}
      <div style={{ position: 'absolute', left: ccx - cw * 0.46, top: ccy + chh * 0.42, width: cw * 0.92, height: chh * 0.3, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.7), rgba(0,0,0,0))', transform: `scale(${1 - lift * 0.15})`, opacity: 1 - lift * 0.4 }} />
      <div style={{ position: 'absolute', left: ccx - cw / 2, top: ccy - chh / 2, width: cw, height: chh, perspective: cw * 3.5 }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateY(${-lift * chh * 0.1}px) rotateX(${8 - lift * 6}deg) rotateY(${flip.toFixed(2)}deg) scale(${1 + lift * 0.04})` }}>
          {/* front */}
          <div style={face(false)}>
            {GRAD.map((g, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, background: g, opacity: s.brand[i] }} />
            ))}
            <svg width="100%" height="100%" viewBox="0 0 100 63" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <linearGradient id={`chip${uid}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff1b8" />
                  <stop offset="0.5" stopColor="#d4a84a" />
                  <stop offset="1" stopColor="#8a6418" />
                </linearGradient>
              </defs>
              <circle cx="88" cy="-6" r="40" fill="#fff" opacity="0.05" />
              <circle cx="104" cy="70" r="36" fill="#fff" opacity="0.04" />
              <rect x="8" y="16" width="13" height="10" rx="2" fill={`url(#chip${uid})`} />
              <path d="M8 21 H21 M12.5 16 V26 M16.5 16 V26" stroke="#7a5512" strokeWidth="0.4" opacity="0.6" />
              <path d="M26 17.5 a5 5 0 0 1 0 7 M28.2 15.8 a8 8 0 0 1 0 10.4 M30.4 14 a11 11 0 0 1 0 14" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" strokeLinecap="round" />
              {/* brand marks crossfade with the colours */}
              <text x="92" y="13" textAnchor="end" fontFamily="'Archivo Variable', Archivo, system-ui" fontStyle="italic" fontWeight={900} fontSize="8" fill="#fff" opacity={s.brand[1]}>VISA</text>
              <g opacity={s.brand[2]}>
                <circle cx="80" cy="10" r="5" fill="#eb001b" />
                <circle cx="87" cy="10" r="5" fill="#f79e1b" opacity="0.9" />
              </g>
              <text x="92" y="13" textAnchor="end" fontFamily="'Archivo Variable', Archivo, system-ui" fontWeight={900} fontSize="6" fill="#fff" opacity={s.brand[3]}>AMEX</text>
            </svg>
            {/* the number: placeholders until a digit drops into its slot */}
            <div style={{ position: 'absolute', left: u * 8, top: u * 35, display: 'flex', fontFamily: mono, fontSize: u * 6.4, color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}>
              {digits.map((d, i) => {
                const p = s.pop[i].x;
                return (
                  <span key={i} style={{ width: u * 4.95, marginRight: i % 4 === 3 ? u * 2.5 : 0, textAlign: 'center', display: 'inline-block', position: 'relative' }}>
                    <span style={{ opacity: d ? 0 : 0.35 }}>•</span>
                    {d && <span style={{ position: 'absolute', left: 0, right: 0, transform: `translateY(${((1 - p) * -u * 5).toFixed(2)}px) scale(${(1 + (1 - p) * 0.5).toFixed(3)})`, opacity: clamp(p * 1.5) }}>{d}</span>}
                  </span>
                );
              })}
            </div>
            <div style={{ position: 'absolute', left: u * 8, top: u * 50, fontFamily: ui, fontSize: u * 2.6, color: 'rgba(255,255,255,0.55)', letterSpacing: u * 0.2 }}>CARD HOLDER</div>
            <div style={{ position: 'absolute', left: u * 8, top: u * 54, fontFamily: ui, fontWeight: 600, fontSize: u * 4.2, color: '#fff', letterSpacing: u * 0.25, transform: `translateY(${(1 - s.namePop.x) * u * 2}px)`, whiteSpace: 'nowrap' }}>{s.v.name || 'FULL NAME'}</div>
            <div style={{ position: 'absolute', left: u * 70, top: u * 50, fontFamily: ui, fontSize: u * 2.6, color: 'rgba(255,255,255,0.55)', letterSpacing: u * 0.2 }}>EXPIRES</div>
            <div style={{ position: 'absolute', left: u * 70, top: u * 54, fontFamily: mono, fontSize: u * 4.4, color: '#fff' }}>{`${(s.v.exp.slice(0, 2) + 'MM'.slice(s.v.exp.slice(0, 2).length))}/${s.v.exp.slice(2) + 'YY'.slice(s.v.exp.slice(2).length)}`}</div>
            {/* focus ring */}
            <div style={{ position: 'absolute', left: s.ring.x.x * u, top: s.ring.y.x * u, width: s.ring.w.x * u, height: s.ring.h.x * u, borderRadius: u * 2, border: `${Math.max(1, u * 0.35)}px solid rgba(255,255,255,0.75)`, background: 'rgba(255,255,255,0.06)', opacity: s.ring.o, boxShadow: '0 0 12px rgba(160,190,255,0.35)' }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(120deg, rgba(255,255,255,0) ${sheen - 20}%, rgba(255,255,255,0.16) ${sheen}%, rgba(255,255,255,0) ${sheen + 20}%)` }} />
          </div>
          {/* back */}
          <div style={face(true)}>
            {GRAD.map((g, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, background: g, opacity: s.brand[i] }} />
            ))}
            <div style={{ position: 'absolute', left: 0, right: 0, top: u * 8, height: u * 12, background: 'linear-gradient(180deg,#0b0b0d,#1d1d22)' }} />
            <div style={{ position: 'absolute', left: u * 8, top: u * 27, width: u * 64, height: u * 10, borderRadius: u, background: 'repeating-linear-gradient(-12deg,#f4f1e8 0 6px,#e6e1d2 6px 12px)' }} />
            <div style={{ position: 'absolute', left: u * 74, top: u * 27, width: u * 18, height: u * 10, borderRadius: u, background: '#fff', display: 'grid', placeItems: 'center', fontFamily: mono, fontSize: u * 4.6, color: '#1a1a22', fontStyle: 'italic', boxShadow: `0 0 0 ${u * 0.5}px rgba(255,255,255,${0.35 * s.flip.x})` }}>
              {(s.v.cvv + '•••'.slice(s.v.cvv.length)).split('').join(' ')}
            </div>
            <div style={{ position: 'absolute', left: u * 74, top: u * 39, fontFamily: ui, fontSize: u * 2.4, color: 'rgba(255,255,255,0.6)' }}>CVV</div>
            <div style={{ position: 'absolute', left: u * 8, bottom: u * 7, right: u * 8, fontFamily: ui, fontSize: u * 2.2, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>This card is property of the issuer. If found, please return it.</div>
          </div>
        </div>
      </div>
      {/* the form */}
      {input('num', 'Card number', fxl, fy, fw, '1234 5678 9012 3456')}
      {input('name', 'Name on card', fxl, fy + rowH, fw, 'Full name')}
      {input('exp', 'Expiry', fxl, fy + rowH * 2, fw * 0.48, 'MM/YY')}
      {input('cvv', 'CVV', fxl + fw * 0.52, fy + rowH * 2, fw * 0.48, '•••')}
    </Stage>
  );
}
