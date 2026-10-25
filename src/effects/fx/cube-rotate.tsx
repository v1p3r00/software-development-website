import type { ReactNode } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Four app screens on the faces of a cube. Drag sideways to turn it (it keeps your throw and
 * snaps to the nearest face with a springy settle); mid-turn the camera pulls back so the edge
 * stays in frame, faces darken as they turn from the light and a sheen slides across them.
 */

const FACES = 4;

interface S {
  a: Spring; // rotation, degrees
  target: number;
  drag: boolean;
  x0: number;
  a0: number;
  idle: number;
  auto: number;
  face: number;
}

function geom(w: number, h: number) {
  const fh = Math.min(h * 0.7, w * 0.62 * 1.6);
  const fw = Math.min(fh / 1.6 * 1.15, w * 0.6);
  return { fw, fh };
}

export const sim = defineSim<S>({
  init: () => ({ a: sp(0), target: 0, drag: false, x0: 0, a0: 0, idle: 0, auto: 0, face: 0 }),
  step(s, f) {
    const { fw } = geom(f.w, f.h);
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    if (f.pressed) {
      s.drag = true;
      s.x0 = f.p.x;
      s.a0 = s.a.x;
      f.emit({ name: 'click', gain: 0.2, rate: 1.3 });
    }
    for (const a of f.actions) if (a.type === 'turn') s.target = (Math.round(s.target / 90) + (a.d as number)) * 90;
    if (s.drag) {
      // the face follows the finger: one face-width of drag is a quarter turn
      s.target = s.a0 + ((f.p.x - s.x0) / fw) * 90;
      if (!f.p.down) {
        s.drag = false;
        const throwA = (f.p.vx / fw) * 90 * 0.18;
        s.target = Math.round((s.target + clamp(throwA, -80, 80)) / 90) * 90;
        f.emit({ name: 'whoosh', gain: 0.4, rate: 1.1 });
      }
    } else if (s.idle > 1.4) {
      s.auto += f.dt;
      if (s.auto > 2) {
        s.auto = 0;
        s.target -= 90;
        f.emit({ name: 'whoosh', gain: 0.4, rate: 1 });
      }
    } else s.auto = 1.2;
    spring(s.a, s.target, s.drag ? 500 : 90, s.drag ? 45 : f.reduced ? 20 : 11, f.dt);
    const face = Math.round(-s.a.x / 90);
    if (face !== s.face) {
      s.face = face;
      f.emit({ name: 'thud', gain: 0.25, rate: 1.6 });
    }
  },
});

const ui = "'Inter Variable', Inter, system-ui";
const disp = "'Archivo Variable', Archivo, system-ui";

function Face({ i, fw }: { i: number; fw: number }): ReactNode {
  const u = fw / 100;
  const card = (bg: string, children: ReactNode, extra: object = {}) => (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 6 * u, overflow: 'hidden', background: bg, padding: 8 * u, color: '#fff', fontFamily: ui, ...extra }}>{children}</div>
  );
  if (i === 0)
    return card(
      'linear-gradient(160deg, #4fa8ff, #2a5bd7 60%, #1b2f8f)',
      <>
        <div style={{ fontSize: 5 * u, opacity: 0.8, fontWeight: 600 }}>Lisbon</div>
        <div style={{ fontFamily: disp, fontWeight: 800, fontSize: 30 * u, lineHeight: 1 }}>24°</div>
        <div style={{ fontSize: 5 * u, opacity: 0.85 }}>Mostly sunny</div>
        <div style={{ position: 'absolute', right: 8 * u, top: 10 * u, width: 26 * u, height: 26 * u, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #fff6c4, #ffd34d 60%, #ffb21e)', boxShadow: `0 0 ${12 * u}px #ffd34d` }} />
        <div style={{ position: 'absolute', left: 8 * u, right: 8 * u, bottom: 8 * u, display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.14)', borderRadius: 4 * u, padding: 4 * u }}>
          {['Mon', 'Tue', 'Wed', 'Thu'].map((d, k) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 4 * u }}>
              <div style={{ opacity: 0.7 }}>{d}</div>
              <div style={{ fontWeight: 700, fontSize: 5.5 * u }}>{22 + k}°</div>
            </div>
          ))}
        </div>
      </>,
    );
  if (i === 1)
    return card(
      'linear-gradient(170deg, #ff7a59, #ff3d7f 55%, #6a2bd9)',
      <>
        <div style={{ margin: `${4 * u}px auto 0`, width: 64 * u, height: 64 * u, borderRadius: 5 * u, background: 'radial-gradient(circle at 30% 30%, #ffd1e8, #b21d6b 55%, #2a0a3d)', boxShadow: `0 ${4 * u}px ${12 * u}px rgba(0,0,0,0.35)` }} />
        <div style={{ fontFamily: disp, fontWeight: 800, fontSize: 9 * u, marginTop: 8 * u }}>Neon Nights</div>
        <div style={{ fontSize: 4.5 * u, opacity: 0.8 }}>The Midnight Club</div>
        <div style={{ height: 1.4 * u, background: 'rgba(255,255,255,0.3)', borderRadius: u, marginTop: 6 * u }}>
          <div style={{ width: '42%', height: '100%', background: '#fff', borderRadius: u }} />
        </div>
      </>,
    );
  if (i === 2)
    return card(
      'linear-gradient(170deg, #0f2a22, #0a1a15)',
      <>
        <div style={{ fontSize: 5 * u, color: '#7fe3b8', fontWeight: 700 }}>ACTIVITY</div>
        <div style={{ position: 'relative', width: 70 * u, height: 70 * u, margin: `${6 * u}px auto` }}>
          {[0, 1, 2].map((k, _i, _a, c = ['#ff4f6d', '#a6ff4f', '#4fd8ff'][k]) => (
            <div
              key={k}
              style={{
                position: 'absolute',
                inset: k * 9 * u,
                borderRadius: '50%',
                borderStyle: 'solid',
                borderWidth: 6 * u,
                // rings filled to different amounts: some quarters left as the empty track
                borderColor: [c, 'rgba(255,255,255,0.08)', k === 0 ? 'rgba(255,255,255,0.08)' : c, c].join(' '),
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 4.5 * u }}>
          <span>
            <b style={{ fontSize: 7 * u }}>482</b> kcal
          </span>
          <span>
            <b style={{ fontSize: 7 * u }}>38</b> min
          </span>
        </div>
      </>,
    );
  return card(
    'linear-gradient(170deg, #f7f5f2, #e8e4de)',
    <>
      <div style={{ fontFamily: disp, fontWeight: 800, fontSize: 9 * u, color: '#1d1a16' }}>Messages</div>
      {[
        ['Mia', 'See you at 8?', '#ff7a59'],
        ['Leo', 'Sent the photos 📸', '#4f7bff'],
        ['Ana', 'Haha yes!!', '#1fbf8f'],
        ['Sam', 'Call me later', '#a05cff'],
      ].map(([n, t, c]) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 3 * u, marginTop: 5 * u, background: '#fff', borderRadius: 4 * u, padding: 3 * u, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 10 * u, height: 10 * u, borderRadius: '50%', background: c }} />
          <div style={{ color: '#1d1a16', fontSize: 4.6 * u }}>
            <div style={{ fontWeight: 700 }}>{n}</div>
            <div style={{ opacity: 0.6 }}>{t}</div>
          </div>
        </div>
      ))}
    </>,
  );
}

export default function CubeRotate() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const m = Math.min(w, h);
  const { fw, fh } = geom(w, h);
  const a = s.a.x;
  // pull back mid-turn so the leading edge stays in frame
  const mid = Math.abs(Math.sin((a * Math.PI) / 90));
  const sc = 1 - mid * 0.14;
  const cx = w / 2;
  const cy = h * 0.47;

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: 'radial-gradient(90% 80% at 50% 35%, #2b2f45 0%, #14161f 60%, #090a0e 100%)' }}>
      {/* floor glow and contact shadow */}
      <div style={{ position: 'absolute', left: cx - fw * 0.9, top: cy + fh * 0.5 * sc - m * 0.02, width: fw * 1.8, height: m * 0.08, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.7), transparent)', transform: `scaleX(${1 + mid * 0.4})` }} />
      <div style={{ position: 'absolute', left: cx - fw / 2, top: cy - fh / 2, width: fw, height: fh, perspective: fw * 4.2, transform: `scale(${sc})` }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${-fw / 2}px) rotateY(${a}deg)` }}>
          {Array.from({ length: FACES }, (_, i) => {
            const ang = a + i * 90;
            const c = Math.cos((ang * Math.PI) / 180);
            const sn = Math.sin((ang * Math.PI) / 180);
            // turned away from the camera = darker; a sheen sweeps across while turning
            const shade = clamp(1 - c) * 0.75;
            return (
              <div key={i} style={{ position: 'absolute', inset: 0, transform: `rotateY(${i * 90}deg) translateZ(${fw / 2}px)`, backfaceVisibility: 'hidden', borderRadius: fw * 0.06 }}>
                <Face i={i} fw={fw} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: fw * 0.06, background: `linear-gradient(${sn > 0 ? 90 : 270}deg, rgba(0,0,0,${shade * 0.4}), rgba(0,0,0,${shade}))` }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: fw * 0.06, background: `linear-gradient(105deg, transparent ${30 + sn * 40}%, rgba(255,255,255,${0.22 * Math.abs(sn)}) ${40 + sn * 40}%, transparent ${55 + sn * 40}%)` }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: fw * 0.06, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }} />
              </div>
            );
          })}
        </div>
      </div>
      {/* face indicator */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy + fh * 0.5 + m * 0.07, display: 'flex', justifyContent: 'center', gap: m * 0.015 }}>
        {Array.from({ length: FACES }, (_, i) => {
          const cur = ((Math.round(-a / 90) % FACES) + FACES) % FACES;
          return <div key={i} style={{ width: i === cur ? m * 0.04 : m * 0.014, height: m * 0.014, borderRadius: m, background: i === cur ? '#fff' : 'rgba(255,255,255,0.3)' }} />;
        })}
      </div>
      <button
        type="button"
        aria-label="Next screen"
        style={{ position: 'absolute', left: cx - fw / 2, top: cy - fh / 2, width: fw, height: fh, opacity: 0 }}
        onKeyDown={(e) => {
          const d = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ' ? -1 : 0;
          if (d) {
            e.preventDefault();
            fx.dispatch({ type: 'turn', d });
          }
        }}
      />
    </Stage>
  );
}
