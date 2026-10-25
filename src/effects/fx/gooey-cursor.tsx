import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A liquid cursor. A blob chases the pointer on a spring with a tail of smaller drops; all of it
 * shares one "goo" filter with the buttons, so when the blob comes close the two surfaces
 * pull into a single bridge of liquid and the button swells to swallow it.
 */

const LABELS = ['Work', 'Studio', 'Contact'];
const TAIL = 5;

interface Btn {
  hov: Spring; // swell when the blob touches it
  press: Spring; // squash on click
}
interface S {
  x: Spring;
  y: Spring;
  tail: { x: number; y: number }[];
  btn: Btn[];
  idle: number;
  autoT: number;
  autoI: number;
  autoDown: boolean;
  wasIn: number;
  t: number;
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const row = w > h * 0.95;
  let bw = m * (row ? 0.34 : 0.5);
  const bh = m * 0.15;
  const gap = m * 0.08;
  if (row) bw = Math.min(bw, (w * 0.86 - gap * 2) / 3);
  const r = m * 0.055; // blob radius
  const btns = LABELS.map((_, i) => {
    const k = i - 1;
    return row
      ? { cx: w / 2 + k * (bw + gap), cy: h / 2, w: bw, h: bh }
      : { cx: w / 2, cy: h / 2 + k * (bh + gap * 1.4), w: bw, h: bh };
  });
  return { m, btns, r };
}

/** distance from a point to a rounded rect (pill), negative inside */
function pillDist(px: number, py: number, b: { cx: number; cy: number; w: number; h: number }) {
  const rr = b.h / 2;
  const qx = Math.abs(px - b.cx) - (b.w / 2 - rr);
  const qy = Math.abs(py - b.cy) - (b.h / 2 - rr);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rr;
}

export const sim = defineSim<S>({
  init: (w, h) => ({
    x: sp(w / 2),
    y: sp(h * 0.8),
    tail: Array.from({ length: TAIL }, () => ({ x: w / 2, y: h * 0.8 })),
    btn: LABELS.map(() => ({ hov: sp(), press: sp() })),
    idle: 2,
    autoT: 0,
    autoI: 0,
    autoDown: false,
    wasIn: -1,
    t: 0,
  }),
  step(s, f) {
    const { btns, m, r } = geom(f.w, f.h);
    s.t += f.dt;
    s.idle = f.p.over || f.p.down ? 0 : s.idle + f.dt;
    const auto = s.idle > 2.5;
    let tx = f.p.x;
    let ty = f.p.y;
    let down = f.p.down;
    let pressed = f.pressed;
    if (auto) {
      // self-demo: drift from button to button, dip in and "click"
      s.autoT += f.dt;
      if (s.autoT > 1.6) {
        s.autoT = 0;
        s.autoI = (s.autoI + 1) % btns.length;
      }
      const b = btns[s.autoI];
      const wob = Math.sin(s.t * 1.7) * m * 0.03;
      tx = b.cx + Math.sin(s.t * 0.9) * b.w * 0.18;
      ty = b.cy + (s.autoT < 0.4 ? b.h * 1.2 : 0) + wob;
      down = s.autoT > 0.75 && s.autoT < 0.95;
      pressed = down && !s.autoDown;
      s.autoDown = down;
    }
    // the blob: a soft spring, so it lags and overshoots like a heavy drop
    spring(s.x, tx, 170, 15, f.dt);
    spring(s.y, ty, 170, 15, f.dt);
    // every drop of the tail chases the one ahead of it
    let px = s.x.x;
    let py = s.y.x;
    for (const d of s.tail) {
      d.x = approach(d.x, px, 26, f.dt);
      d.y = approach(d.y, py, 26, f.dt);
      px = d.x;
      py = d.y;
    }
    let inside = -1;
    btns.forEach((b, i) => {
      const dist = pillDist(s.x.x, s.y.x, b);
      // closeness 0..1 within a blob-and-a-half of the edge
      const near = clamp(1 - dist / (r * 2.2));
      if (dist < 0) inside = i;
      spring(s.btn[i].hov, near, 260, f.reduced ? 30 : 14, f.dt);
      if (pressed && pillDist(tx, ty, b) < 0) {
        s.btn[i].press.v += 9;
        f.emit({ name: 'pop', gain: 0.6, rate: 0.9 + i * 0.08, pan: (b.cx / f.w) * 2 - 1 });
      }
      spring(s.btn[i].press, down && pillDist(tx, ty, b) < 0 ? 0.5 : 0, 380, 13, f.dt);
    });
    if (inside >= 0 && inside !== s.wasIn) f.emit({ name: 'drip', gain: 0.35, rate: 1 + inside * 0.1 });
    s.wasIn = inside;
  },
});

export default function GooeyCursor() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { btns, r, m } = geom(w, h);
  const vx = s.x.v;
  const vy = s.y.v;
  const sp2 = Math.hypot(vx, vy);
  // stretch along the direction of travel, thinner across it (volume kept)
  const st = clamp(sp2 / (m * 6), 0, 0.55);
  const ang = (Math.atan2(vy, vx) * 180) / Math.PI;
  // the blob gets a little smaller as it is absorbed into a button
  const absorb = Math.max(...s.btn.map((b) => clamp(b.hov.x)));
  const br = r * (1 - absorb * 0.25);
  const blur = m * 0.018;

  return (
    <Stage fx={fx} cursor="none" style={{ background: 'radial-gradient(110% 90% at 50% 15%, #241a3a 0%, #120e1f 55%, #08070d 100%)' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`g${uid}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={w} y2={h}>
            <stop offset="0" stopColor="#ff5fa2" />
            <stop offset="0.5" stopColor="#b44dff" />
            <stop offset="1" stopColor="#5b6bff" />
          </linearGradient>
          <filter id={`goo${uid}`} x="0" y="0" width={w} height={h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="b" />
            {/* crush the blurred alpha back into a hard edge: nearby shapes fuse */}
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo" />
            {/* a glossy wet highlight lit from the top left */}
            <feGaussianBlur in="goo" stdDeviation={blur * 0.9} result="gb" />
            <feSpecularLighting in="gb" surfaceScale={m * 0.012} specularConstant="0.9" specularExponent="22" lightingColor="#fff" result="spec">
              <feDistantLight azimuth="235" elevation="48" />
            </feSpecularLighting>
            <feComposite in="spec" in2="goo" operator="in" result="specIn" />
            <feMerge>
              <feMergeNode in="goo" />
              <feMergeNode in="specIn" />
            </feMerge>
          </filter>
          <filter id={`sh${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={m * 0.03} />
          </filter>
        </defs>
        {/* soft coloured glow under the liquid */}
        <g opacity="0.45" filter={`url(#sh${uid})`}>
          {btns.map((b, i) => (
            <rect key={i} x={b.cx - b.w / 2} y={b.cy - b.h / 2 + m * 0.03} width={b.w} height={b.h} rx={b.h / 2} fill="#7a2cff" opacity={0.4 + s.btn[i].hov.x * 0.5} />
          ))}
          <circle cx={s.x.x} cy={s.y.x + m * 0.02} r={br} fill="#ff4f9a" />
        </g>
        <g filter={`url(#goo${uid})`} fill={`url(#g${uid})`}>
          {btns.map((b, i) => {
            const hv = s.btn[i].hov.x;
            const pr = s.btn[i].press.x;
            const bw = b.w * (1 + hv * 0.05 + pr * 0.06);
            const bh = b.h * (1 + hv * 0.12 - pr * 0.18);
            return <rect key={i} x={b.cx - bw / 2} y={b.cy - bh / 2} width={bw} height={bh} rx={bh / 2} />;
          })}
          {s.tail.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={br * (0.85 - i * 0.12)} />
          ))}
          <ellipse cx={0} cy={0} rx={br * (1 + st)} ry={br * (1 - st * 0.45)} transform={`translate(${s.x.x} ${s.y.x}) rotate(${ang})`} />
        </g>
        {btns.map((b, i) => {
          const hv = s.btn[i].hov.x;
          const pr = s.btn[i].press.x;
          return (
            <text
              key={i}
              x={b.cx}
              y={b.cy + b.h * 0.13}
              textAnchor="middle"
              fontFamily="'Archivo Variable', Archivo, system-ui, sans-serif"
              fontWeight={700}
              fontSize={b.h * 0.36 * (1 + hv * 0.06 - pr * 0.1)}
              letterSpacing={b.h * 0.01}
              fill="#fff"
              opacity={0.82 + hv * 0.18}
              style={{ textShadow: '0 1px 6px rgba(60,0,90,0.45)' }}
            >
              {LABELS[i]}
            </text>
          );
        })}
        {/* the exact pointer: a tiny precise dot inside the lagging blob */}
        <circle cx={fx.s.idle > 2.5 ? s.x.x : fx.p.x} cy={fx.s.idle > 2.5 ? s.y.x : fx.p.y} r={Math.max(2, m * 0.007)} fill="#fff" opacity={0.9} />
      </svg>
      {btns.map((b, i) => (
        <button
          key={i}
          type="button"
          aria-label={LABELS[i]}
          style={{ position: 'absolute', left: b.cx - b.w / 2, top: b.cy - b.h / 2, width: b.w, height: b.h, opacity: 0, borderRadius: b.h / 2, cursor: 'none' }}
        />
      ))}
    </Stage>
  );
}
