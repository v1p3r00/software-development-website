import type { CSSProperties, ReactNode } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A folded invitation: letter-folded in thirds, then in half. Click it and it opens panel by
 * panel in the reverse order it was folded (the half swings over, then the bottom third drops,
 * then the top third lifts). Every face is shaded by its angle to the light, so the paper
 * darkens as it turns away and catches light as it lands flat.
 */

interface S {
  a: Spring; // right half: 0 folded over, 1 open
  b: Spring; // bottom third
  c: Spring; // top third
  open: boolean;
  idle: number;
  demoClock: number;
  moving: [boolean, boolean, boolean];
}

function geom(w: number, h: number) {
  const nw = Math.min(w * 0.78, h * 0.86 * 1.25);
  const nh = nw / 1.25;
  return { cx: w / 2, cy: h / 2, nw, nh };
}

export const sim = defineSim<S>({
  init: () => ({ a: sp(), b: sp(), c: sp(), open: false, idle: 1.5, demoClock: 0, moving: [false, false, false] }),
  step(s, f) {
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    if (f.pressed) {
      s.open = !s.open;
      f.emit({ name: 'paper', gain: 0.5 });
    }
    // self-demo: open, linger, fold back up
    if (s.idle > 2.5) {
      s.demoClock += f.dt;
      if (s.demoClock > (s.open ? 3.2 : 1.6)) {
        s.open = !s.open;
        s.demoClock = 0;
        f.emit({ name: 'paper', gain: 0.4 });
      }
    } else s.demoClock = 0;
    // panels move one after another: unfold half → bottom → top, and fold in reverse
    const ta = s.open ? 1 : s.b.x < 0.15 ? 0 : 1;
    const tb = s.open ? (s.a.x > 0.8 ? 1 : 0) : s.c.x < 0.15 ? 0 : 1;
    const tc = s.open ? (s.b.x > 0.8 ? 1 : 0) : 0;
    const k = f.reduced ? 1.6 : 1;
    const springs = [s.a, s.b, s.c];
    [ta, tb, tc].forEach((t, i) => {
      const sp1 = springs[i];
      const was = s.moving[i];
      // slightly under-damped: paper overshoots flat a touch and settles
      spring(sp1, t, 60 * k, 10 * k, f.dt);
      const mv = Math.abs(sp1.x - t) > 0.05;
      if (mv && !was) f.emit({ name: i === 0 ? 'swoosh' : 'rustle', gain: 0.35, rate: 1 + i * 0.1 });
      if (!mv && was && t === 1) f.emit({ name: 'paper', gain: 0.25, rate: 1.3 });
      s.moving[i] = mv;
    });
  },
});

const L = (() => {
  const v = [-0.3, -0.5, 0.82];
  const n = Math.hypot(v[0], v[1], v[2]);
  return v.map((x) => x / n);
})();

/** brightness of a face whose normal was turned by rotateX(phi) then rotateY(theta) */
function lit(phiDeg: number, thetaDeg: number, back: boolean) {
  const p = (phiDeg * Math.PI) / 180;
  const t = (thetaDeg * Math.PI) / 180;
  const sg = back ? -1 : 1;
  const nx = Math.cos(p) * Math.sin(t) * sg;
  const ny = -Math.sin(p) * sg;
  const nz = Math.cos(p) * Math.cos(t) * sg;
  return clamp(nx * L[0] + ny * L[1] + nz * L[2]);
}

export default function OrigamiCard() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const { cx, cy, nw, nh } = geom(w, h);
  const pw = nw / 2;
  const ph = nh / 3;
  const a = s.a.x;
  const b = s.b.x;
  const c = s.c.x;
  const theta = -180 * (1 - a); // right half swings toward the viewer and over
  const phiB = 180 * (1 - b);
  const phiT = -180 * (1 - c);
  const u = nw / 100;
  // keep the visible paper centred while it grows
  const offX = lerp(pw / 2, 0, clamp(a));
  const busy = Math.max(Math.abs(Math.sin(a * Math.PI)), Math.abs(Math.sin(b * Math.PI)), Math.abs(Math.sin(c * Math.PI)));

  // the inside of the invitation, drawn once at full size and sliced into panels
  const inside = (
    <div style={{ position: 'absolute', left: 0, top: 0, width: nw, height: nh, background: 'linear-gradient(170deg,#fbf7ee,#f1e8d6)' }}>
      <svg width={nw} height={nh} viewBox="0 0 125 100" style={{ position: 'absolute', inset: 0 }}>
        <rect x="5" y="5" width="115" height="90" fill="none" stroke="#c9a96a" strokeWidth="0.35" />
        <rect x="6.5" y="6.5" width="112" height="87" fill="none" stroke="#c9a96a" strokeWidth="0.15" />
        {/* a little botanical sprig */}
        <g transform="translate(62.5 22)" stroke="#5c7a4a" strokeWidth="0.5" fill="none" strokeLinecap="round">
          <path d="M-14 4 C -6 0 6 0 14 4" />
          {[-10, -5, 0, 5, 10].map((x, i) => (
            <g key={i}>
              <path d={`M${x} ${2.4 + Math.abs(x) * 0.06} q -2 -4 -0.5 -6.5 q 2 2 0.5 6.5`} fill="#86a86d" fillOpacity="0.55" />
              <path d={`M${x + 1} ${2.6 + Math.abs(x) * 0.06} q 3 -2.4 5.4 -1.2 q -2.2 2.4 -5.4 1.2`} fill="#86a86d" fillOpacity="0.4" />
            </g>
          ))}
          <circle cx="0" cy="-5" r="1.4" fill="#e39a7a" stroke="none" />
        </g>
      </svg>
      <div style={{ position: 'absolute', top: nh * 0.36, left: 0, right: 0, textAlign: 'center', fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 300, fontSize: u * 7.4, letterSpacing: u * 0.2, color: '#2f2a22' }}>
        You&rsquo;re invited
      </div>
      <div style={{ position: 'absolute', top: nh * 0.5, left: 0, right: 0, textAlign: 'center', fontFamily: "'Inter Variable', Inter, system-ui", fontSize: u * 2.5, letterSpacing: u * 0.5, color: '#9a7b45', textTransform: 'uppercase' }}>
        a small dinner among friends
      </div>
      <div style={{ position: 'absolute', top: nh * 0.68, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: u * 8, fontFamily: "'Inter Variable', Inter, system-ui", color: '#3a342a' }}>
        {[
          ['Saturday', 'June 14'],
          ['7 pm', 'The Orchard'],
        ].map(([x, y]) => (
          <div key={x} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: u * 3.6, fontWeight: 600 }}>{x}</div>
            <div style={{ fontSize: u * 2.4, opacity: 0.6, marginTop: u * 0.6 }}>{y}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const shade = (v: number): CSSProperties => ({ position: 'absolute', inset: 0, background: '#1a1206', opacity: (1 - v) * 0.6, pointerEvents: 'none' });
  const faceBase: CSSProperties = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden' };
  // a panel: the front shows its slice of the inside, the back is the plain outside of the paper
  const panel = (row: number, col: number, phi: number, cover?: ReactNode) => {
    const th = col === 1 ? theta : 0;
    return (
      <>
        <div style={faceBase}>
          <div style={{ position: 'absolute', left: -col * pw, top: -row * ph }}>{inside}</div>
          {/* crease shading along the fold lines, visible once the paper is flat */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${col ? 90 : 270}deg, rgba(90,60,20,0.14), rgba(90,60,20,0) 12%)` }} />
          {row !== 1 && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${row === 0 ? 0 : 180}deg, rgba(90,60,20,0.12), rgba(90,60,20,0) 14%)` }} />}
          <div style={shade(lit(phi, th, false))} />
        </div>
        <div style={{ ...faceBase, transform: 'rotateY(180deg)', background: 'linear-gradient(160deg,#efe6d3,#e2d6bd)' }}>
          {cover}
          <div style={shade(lit(phi, th, true))} />
        </div>
      </>
    );
  };
  const cover = (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: u * 2 }}>
      {/* wax seal */}
      <div style={{ width: u * 9, height: u * 9, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #e0605a, #a3201c 60%, #6e100d)', boxShadow: `0 ${u * 0.4}px ${u * 1}px rgba(60,10,5,0.45), inset 0 0 0 ${u * 1}px rgba(255,255,255,0.08)`, display: 'grid', placeItems: 'center', color: 'rgba(255,220,210,0.75)', fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: u * 3.6 }}>✦</div>
      <div style={{ fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 400, fontSize: u * 2.6, letterSpacing: u * 0.7, color: '#6b5532', textTransform: 'uppercase' }}>for you</div>
    </div>
  );
  const half = (col: number) => {
    const p3 = (row: number, phi: number) => panel(row, col, phi, col === 1 && row === 1 ? cover : undefined);
    const box: CSSProperties = { position: 'absolute', left: 0, width: pw, height: ph, transformStyle: 'preserve-3d' };
    return (
      <div
        key={col}
        style={{
          position: 'absolute',
          left: col * pw,
          top: 0,
          width: pw,
          height: nh,
          transformStyle: 'preserve-3d',
          transformOrigin: '0 50%',
          // the folded half rides a few px above the other so the layers never touch
          transform: col ? `translateZ(${(6 * (1 - a)).toFixed(2)}px) rotateY(${theta.toFixed(2)}deg)` : undefined,
        }}
      >
        <div style={{ ...box, top: ph }}>{p3(1, 0)}</div>
        <div style={{ ...box, top: 0, transformOrigin: '50% 100%', transform: `translateY(0) translateZ(${(1 * (1 - c)).toFixed(2)}px) rotateX(${phiT.toFixed(2)}deg)` }}>{p3(0, phiT)}</div>
        <div style={{ ...box, top: ph * 2, transformOrigin: '50% 0%', transform: `translateZ(${(2 * (1 - b)).toFixed(2)}px) rotateX(${phiB.toFixed(2)}deg)` }}>{p3(2, phiB)}</div>
      </div>
    );
  };

  // shadow follows the footprint of the paper
  const fw = lerp(pw, nw, clamp(a));
  const fh2 = ph * (1 + clamp(b) + clamp(c));
  const fyOff = (clamp(b) - clamp(c)) * ph * 0.5;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(90% 80% at 50% 35%, #5a4a3a 0%, #2f261d 55%, #17120d 100%)' }}>
      {/* a wooden desk: faint grain */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'repeating-linear-gradient(92deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 9px, rgba(255,220,180,0.12) 9px 10px, transparent 10px 23px)' }} />
      <div
        style={{
          position: 'absolute',
          left: cx - fw / 2,
          top: cy - fh2 / 2 + fyOff + u * 2,
          width: fw,
          height: fh2,
          background: 'rgba(10,6,2,0.6)',
          // constant blur (cheap to composite); lifting panels push the shadow out instead
          filter: `blur(${u * 3}px)`,
          opacity: 1 - busy * 0.25,
          transform: `translate(${u * (1.5 + busy)}px, ${u * (1.5 + busy)}px)`,
        }}
      />
      <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, perspective: nw * 2.6, perspectiveOrigin: `${cx}px ${cy - nh * 0.4}px` }}>
        <div style={{ position: 'absolute', left: cx - nw / 2 + offX, top: cy - nh / 2, width: nw, height: nh, transformStyle: 'preserve-3d', transform: `rotateX(${(8 + busy * 4).toFixed(2)}deg)` }}>
          {half(0)}
          {half(1)}
        </div>
      </div>
      <button type="button" aria-label={s.open ? 'Fold the note' : 'Open the note'} style={{ position: 'absolute', left: cx - nw / 2, top: cy - nh / 2, width: nw, height: nh, opacity: 0 }} />
    </Stage>
  );
}
