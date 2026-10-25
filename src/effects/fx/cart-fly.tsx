import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * Add to cart, with a throw. The product lifts off the card as a round chip and is tossed into
 * the cart along a curved path: it speeds up on the way in (ease-in, like falling), spins,
 * shrinks with distance and leaves a faint motion trail. When it lands the cart squashes and
 * rebounds, the badge pops and its number rolls up. The button confirms with a check.
 * Left alone, a ghost shopper keeps adding.
 */

interface Flyer {
  t: number; // 0..1 along the path
  spin: number;
}
interface S {
  fly: Flyer[];
  count: number;
  shown: Spring; // rolling counter (eases to count)
  cart: Spring; // cart squash
  badge: Spring;
  press: Spring;
  added: number; // seconds since the last add (button shows the check)
  hover: number;
  idle: number;
  t: number;
}

function geom(w: number, h: number) {
  const u = clamp(Math.min(w / 460, h / 520), 0.5, 2.2);
  const hh = 58 * u; // header
  const cw = Math.min(w * 0.82, 300 * u);
  const ch = Math.min(h - hh - 30 * u, 380 * u);
  const cx = w / 2, cy = hh + (h - hh) / 2;
  const btnH = 44 * u;
  return {
    u, hh, cw, ch, cx, cy, btnH,
    img: { x: cx, y: cy - ch / 2 + ch * 0.33, r: ch * 0.22 },
    btn: { x: cx, y: cy + ch / 2 - 18 * u - btnH / 2, w: cw - 36 * u },
    cart: { x: w - 34 * u, y: hh / 2 },
  };
}

export const sim = defineSim<S>({
  init: () => ({ fly: [], count: 2, shown: sp(2), cart: sp(), badge: sp(), press: sp(), added: 9, hover: 0, idle: 1.5, t: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const G = geom(w, h);
    s.t += dt;
    s.added += dt;
    const on = Math.abs(p.x - G.btn.x) < G.btn.w / 2 && Math.abs(p.y - G.btn.y) < G.btnH / 2;
    s.hover = approach(s.hover, on && p.over ? 1 : 0, 12, dt);
    s.idle = p.over && on ? 0 : s.idle + dt;
    const add = () => {
      s.fly.push({ t: 0, spin: (f.rand() - 0.5) * 2 });
      s.added = 0;
      f.emit({ name: 'whoosh', gain: 0.35, rate: 1.4 });
    };
    if (f.pressed && on) f.emit({ name: 'click', gain: 0.5 });
    if (f.released && on) add();
    if (f.actions.some((a) => a.type === 'add')) add();
    if (s.idle > 2.5 && s.t % 3 < dt) {
      s.press.v += 6;
      add();
    }
    spring(s.press, p.down && on ? 1 : 0, 500, 24, dt);
    for (const fl of s.fly) {
      // a throw: the path parameter accelerates
      fl.t += dt / 0.8;
      if (fl.t >= 1) {
        s.count++;
        s.cart.v += f.reduced ? 3 : 11;
        s.badge.v += f.reduced ? 4 : 14;
        f.emit({ name: 'pop', gain: 0.6, rate: 1 + Math.min(0.5, s.count * 0.02) });
        f.emit({ name: 'thud', gain: 0.25, rate: 1.6 });
      }
    }
    s.fly = s.fly.filter((fl) => fl.t < 1);
    spring(s.shown, s.count, 120, 18, dt);
    spring(s.cart, 0, 380, 11, dt);
    spring(s.badge, 0, 420, 12, dt);
  },
});

// eased path: a quadratic Bézier that swoops out sideways, then up into the cart
function pathAt(G: ReturnType<typeof geom>, t: number) {
  const e = t * t * (1.6 - 0.6 * t); // ease-in: slow lift, fast arrival
  const a = G.img, b = G.cart;
  const c = { x: lerp(a.x, b.x, 0.95), y: lerp(a.y, b.y, 0.05) };
  const x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * c.x + e * e * b.x;
  const y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * c.y + e * e * b.y;
  return { x, y, e };
}

function Headphones({ size, uid }: { size: number; uid: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id={`cup${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb38a" />
          <stop offset="0.5" stopColor="#ff6a3d" />
          <stop offset="1" stopColor="#b8320f" />
        </linearGradient>
        <linearGradient id={`band${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3f4a" />
          <stop offset="1" stopColor="#14161c" />
        </linearGradient>
      </defs>
      <path d="M20 58 Q20 16 50 16 Q80 16 80 58" fill="none" stroke={`url(#band${uid})`} strokeWidth="8" strokeLinecap="round" />
      <path d="M24 50 Q26 24 50 22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" />
      {[18, 82].map((x) => (
        <g key={x}>
          <rect x={x - 11} y="48" width="22" height="34" rx="10" fill={`url(#cup${uid})`} />
          <rect x={x - 7} y="52" width="5" height="22" rx="2.5" fill="rgba(255,255,255,0.35)" />
        </g>
      ))}
    </svg>
  );
}

export default function CartFly() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const G = geom(w, h);
  const u = G.u;
  const font = "'Inter Variable', Inter, system-ui";
  const done = s.added < 1.2;
  const cs = s.cart.x;
  const shown = s.shown.x;
  const base = Math.floor(shown + 0.001);
  const frac = shown - base;
  return (
    <Stage fx={fx} style={{ background: 'linear-gradient(#f6f3ee, #ebe5dc)' }}>
      {/* header */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: G.hh, background: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(60,40,20,0.08)', display: 'flex', alignItems: 'center', padding: `0 ${20 * u}px`, fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: 18 * u, color: '#1c1917', letterSpacing: -0.3 * u }}>
        sound<span style={{ color: '#ff6a3d' }}>/</span>shop
      </div>
      {/* cart */}
      <div style={{ position: 'absolute', left: G.cart.x - 18 * u, top: G.cart.y - 18 * u, width: 36 * u, height: 36 * u, transform: `scale(${1 + cs * 0.04}, ${1 - cs * 0.05}) rotate(${cs * 1.2}deg)`, transformOrigin: '50% 90%' }}>
        <svg width={36 * u} height={36 * u} viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h3l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 7H6" />
          <circle cx="9.5" cy="20" r="1.4" />
          <circle cx="17.5" cy="20" r="1.4" />
        </svg>
        {/* badge: pops, and the number rolls */}
        <div
          style={{
            position: 'absolute',
            right: -6 * u,
            top: -6 * u,
            minWidth: 20 * u,
            height: 20 * u,
            borderRadius: 10 * u,
            background: '#ff6a3d',
            color: '#fff',
            fontFamily: font,
            fontWeight: 700,
            fontSize: 11.5 * u,
            overflow: 'hidden',
            transform: `scale(${1 + s.badge.x * 0.05})`,
            boxShadow: `0 2px 6px rgba(255,106,61,0.5), 0 0 0 ${2 * u}px #fff`,
          }}
        >
          <div style={{ transform: `translateY(${-frac * 20 * u}px)` }}>
            {[base, base + 1].map((n) => (
              <div key={n} style={{ height: 20 * u, lineHeight: `${20 * u}px`, textAlign: 'center', padding: `0 ${5 * u}px` }}>
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* product card */}
      <div style={{ position: 'absolute', left: G.cx - G.cw / 2, top: G.cy - G.ch / 2, width: G.cw, height: G.ch, borderRadius: 22 * u, background: '#fff', boxShadow: `0 ${18 * u}px ${40 * u}px rgba(80,50,20,0.12), 0 2px 4px rgba(80,50,20,0.05)` }}>
        <div style={{ position: 'absolute', left: 12 * u, right: 12 * u, top: 12 * u, height: G.ch * 0.56, borderRadius: 14 * u, background: 'radial-gradient(80% 70% at 50% 40%, #ffe9dc, #f6e4d6 60%, #eedccb)' }} />
        <div style={{ position: 'absolute', left: 20 * u, right: 20 * u, top: G.ch * 0.6 + 14 * u, fontFamily: font }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontWeight: 700, fontSize: 17 * u, color: '#1c1917' }}>Aero Studio</div>
            <div style={{ fontWeight: 700, fontSize: 17 * u, color: '#1c1917' }}>€249</div>
          </div>
          <div style={{ fontSize: 13 * u, color: '#78716c', marginTop: 3 * u }}>Wireless · Sunset orange</div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 18 * u,
            right: 18 * u,
            bottom: 18 * u,
            height: G.btnH,
            borderRadius: G.btnH / 2,
            background: done ? '#16a34a' : '#1c1917',
            color: '#fff',
            fontFamily: font,
            fontWeight: 600,
            fontSize: 15 * u,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8 * u,
            transform: `scale(${1 - s.press.x * 0.04 + s.hover * 0.01})`,
            boxShadow: `0 ${6 + s.hover * 4}px ${14 + s.hover * 8}px rgba(28,25,23,${0.2 + s.hover * 0.1})`,
            cursor: 'pointer',
          }}
        >
          {done ? (
            <>
              <svg width={16 * u} height={16 * u} viewBox="0 0 24 24">
                <path d="M4 12.5 L10 18 L20 6" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(s.added / 0.3)} />
              </svg>
              Added
            </>
          ) : (
            'Add to cart'
          )}
        </div>
      </div>
      {/* the product, resting on the card (dims while a copy is in the air) */}
      <div style={{ position: 'absolute', left: G.img.x - G.img.r * 1.3, top: G.img.y - G.img.r * 1.3 }}>
        <Headphones size={G.img.r * 2.6} uid={uid + 'a'} />
      </div>

      {/* the flyers, with a faint trail */}
      {s.fly.map((fl, i) =>
        [0.12, 0.06, 0].map((lag, j) => {
          const q = pathAt(G, Math.max(0, fl.t - lag));
          const sc = lerp(1, 0.22, q.e);
          const r = G.img.r * 1.15 * sc;
          return (
            <div
              key={`${i}-${j}`}
              style={{
                position: 'absolute',
                left: q.x - r,
                top: q.y - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 35%, #fff4ec, #ffd9c4)',
                boxShadow: j === 2 ? `0 ${8 * sc * u}px ${20 * sc * u}px rgba(120,60,20,0.3), 0 0 0 ${2 * u}px #fff` : 'none',
                opacity: j === 2 ? 1 : 0.18 * (j + 1),
                transform: `rotate(${fl.spin * q.e * 200}deg)`,
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              {j === 2 && <Headphones size={r * 1.7} uid={`${uid}f${i}`} />}
            </div>
          );
        }),
      )}
      <button
        type="button"
        aria-label="Add to cart"
        style={{ position: 'absolute', left: G.btn.x - G.btn.w / 2, top: G.btn.y - G.btnH / 2, width: G.btn.w, height: G.btnH, opacity: 0, borderRadius: G.btnH / 2 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'add' });
          }
        }}
      />
    </Stage>
  );
}
