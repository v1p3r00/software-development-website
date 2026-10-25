import { useId, useMemo } from 'react';
import type { ReactNode } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A trail map that unfolds like paper. Four panels hang from the header in a zig-zag of
 * hinges; each one opens a little after the one above it, with a papery overshoot. Panels
 * tilted towards the light are bright, the ones tilted away are shaded, and the creases catch.
 * Drag the map down to pull it open, or tap to toggle.
 */

const N = 4;

interface S {
  open: Spring; // 0 folded .. 1 open (overshoots a bit)
  target: number;
  drag: boolean;
  y0: number; // pointer y at grab
  o0: number;
  moved: number;
  idle: number;
  auto: number;
  half: boolean[]; // each panel past half-open (for the paper sound)
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  const pw = Math.min(w * 0.72, m * 1.15);
  const hh = Math.max(40, m * 0.12);
  const ph = Math.min((h * 0.8 - hh) / N, pw * 0.32);
  const top = (h - (hh + ph * N)) / 2;
  return { m, pw, hh, ph, top, x: (w - pw) / 2 };
}

/** the fold angle of panel k for a given openness: staggered top to bottom */
const angleOf = (open: number, k: number) => {
  const u = clamp(open * (1 + (N - 1) * 0.35) - k * 0.35, -0.2, 1.2);
  return 89 * (1 - u);
};

export const sim = defineSim<S>({
  init: () => ({ open: sp(0.15), target: 0.15, drag: false, y0: 0, o0: 0, moved: 0, idle: 0, auto: 0.5, half: Array(N).fill(false) }),
  step(s, f) {
    const { pw, hh, ph, top, x } = geom(f.w, f.h);
    const inside = f.p.x > x && f.p.x < x + pw && f.p.y > top && f.p.y < top + hh + ph * N * clamp(s.open.x, 0.2, 1);
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    if (f.pressed && inside) {
      s.drag = true;
      s.y0 = f.p.y;
      s.o0 = s.target;
      s.moved = 0;
    }
    let toggle = false;
    for (const a of f.actions) if (a.type === 'toggle') toggle = true;
    if (s.drag) {
      // pull the map open (or push it shut) with the finger
      const dy = f.p.y - s.y0;
      s.moved = Math.max(s.moved, Math.abs(dy));
      if (s.moved > 6) s.target = clamp(s.o0 + dy / (ph * N), 0, 1.05);
      if (!f.p.down) {
        s.drag = false;
        if (s.moved <= 6) toggle = true;
        else s.target = s.target + f.p.vy * 0.0004 > 0.5 ? 1 : 0;
      }
    }
    if (toggle) s.target = s.target > 0.5 ? 0 : 1;
    if (s.idle > 1.5 && !s.drag) {
      s.auto += f.dt;
      if (s.auto > 2.2) {
        s.auto = 0;
        s.target = s.target > 0.5 ? 0 : 1;
      }
    } else s.auto = 1.6;
    spring(s.open, s.target, s.drag ? 400 : 60, s.drag ? 40 : f.reduced ? 20 : 8.5, f.dt);
    for (let k = 0; k < N; k++) {
      const h2 = angleOf(s.open.x, k) < 45;
      if (h2 !== s.half[k]) {
        s.half[k] = h2;
        f.emit({ name: 'paper', gain: 0.25 + 0.1 * k, rate: 0.9 + k * 0.08 });
      }
    }
  },
});

function MapArt({ W, H, uid }: { W: number; H: number; uid: string }) {
  // a little topographic map: contour rings around two hills, a lake, a trail with pins
  const art = useMemo(() => {
    const hills = [
      [W * 0.3, H * 0.3, W * 0.42],
      [W * 0.72, H * 0.68, W * 0.48],
    ];
    const rings: string[] = [];
    hills.forEach(([cx, cy, R], hi) => {
      for (let r = 1; r <= 7; r++) {
        let d = '';
        for (let i = 0; i <= 64; i++) {
          const a = (i / 64) * Math.PI * 2;
          const rr = (R * r) / 8 * (1 + 0.12 * Math.sin(a * 3 + r + hi) + 0.06 * Math.sin(a * 5 - r));
          d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr * 0.8).toFixed(1)}`;
        }
        rings.push(d + 'Z');
      }
    });
    const trail = `M${W * 0.08},${H * 0.06} C${W * 0.5},${H * 0.12} ${W * 0.1},${H * 0.42} ${W * 0.45},${H * 0.5} S${W * 0.95},${H * 0.55} ${W * 0.6},${H * 0.82} S${W * 0.2},${H * 0.95} ${W * 0.3},${H * 0.98}`;
    return { rings, trail };
  }, [W, H]);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`paper${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3ecd9" />
          <stop offset="1" stopColor="#e6dcc0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#paper${uid})`} />
      {art.rings.map((d, i) => (
        <path key={i} d={d} fill={i % 7 === 6 ? '#c9d9a8' : 'none'} fillOpacity="0.35" stroke="#a7976a" strokeOpacity={i % 7 === 3 ? 0.7 : 0.35} strokeWidth={i % 7 === 3 ? 1.4 : 0.8} />
      ))}
      <path d={`M${W * 0.7},${H * 0.12} q${W * 0.15},-${H * 0.04} ${W * 0.2},${H * 0.06} q${W * 0.02},${H * 0.08} -${W * 0.12},${H * 0.1} q-${W * 0.14},-${H * 0.02} -${W * 0.08},-${H * 0.16} Z`} fill="#8cc4d8" stroke="#5c9db5" strokeWidth="1" />
      <path d={art.trail} fill="none" stroke="#fff" strokeWidth={W * 0.016} strokeLinecap="round" opacity="0.7" />
      <path d={art.trail} fill="none" stroke="#e2482d" strokeWidth={W * 0.008} strokeDasharray={`${W * 0.02} ${W * 0.014}`} strokeLinecap="round" />
      {[
        [0.08, 0.06],
        [0.45, 0.5],
        [0.3, 0.98],
      ].map(([px, py], i) => (
        <g key={i} transform={`translate(${W * px} ${H * py})`}>
          <circle r={W * 0.022} fill={i === 2 ? '#e2482d' : '#2d5d4a'} stroke="#fff" strokeWidth={W * 0.006} />
        </g>
      ))}
      <text x={W * 0.52} y={H * 0.33} fontFamily="'Inter Variable', Inter, system-ui" fontSize={W * 0.028} fontWeight={600} fill="#6d5f3a" letterSpacing={W * 0.004}>
        EAGLE RIDGE · 1,840 m
      </text>
      <text x={W * 0.08} y={H * 0.74} fontFamily="'Inter Variable', Inter, system-ui" fontSize={W * 0.028} fontWeight={600} fill="#6d5f3a" letterSpacing={W * 0.004}>
        PINE HOLLOW
      </text>
    </svg>
  );
}

export default function FoldAccordion() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { m, pw, hh, ph, top, x } = geom(w, h);
  const open = s.open.x;
  const art = <MapArt W={pw} H={ph * N} uid={uid} />;
  // the visible length of the map, for the floor shadow
  let len = 0;
  for (let k = 0; k < N; k++) len += ph * Math.cos((angleOf(open, k) * Math.PI) / 180);

  // nested hinges: each panel is the child of the one above, rotated relative to it
  let panel: ReactNode = null;
  for (let k = N - 1; k >= 0; k--) {
    const a = angleOf(open, k);
    const abs = (k % 2 ? 1 : -1) * a; // zig-zag: odd panels tilt the other way
    const prevAbs = k ? ((k - 1) % 2 ? 1 : -1) * angleOf(open, k - 1) : 0;
    const rel = abs - prevAbs;
    // light comes from above: panels whose face tips up are lit, the others shaded
    const shade = abs < 0 ? 0.08 + (a / 90) * 0.15 : (a / 90) * 0.6;
    panel = (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: k ? '100%' : hh,
          width: pw,
          height: ph,
          transformOrigin: '50% 0',
          transform: `rotateX(${rel}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backfaceVisibility: 'hidden' }}>
          <div style={{ transform: `translateY(${-k * ph}px)` }}>{art}</div>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${abs < 0 ? 180 : 0}deg, rgba(40,25,5,${shade * 0.6}), rgba(40,25,5,${shade}))` }} />
          {/* crease: a dark valley line and a bright ridge */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.max(1, ph * 0.04), background: `linear-gradient(rgba(${k % 2 ? '255,255,255,0.5' : '60,40,10,0.35'}), transparent)` }} />
        </div>
        {panel}
      </div>
    );
  }

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: 'radial-gradient(110% 90% at 50% 30%, #3b4a3f 0%, #1c2620 55%, #0b100d 100%)' }}>
      {/* floor shadow grows with the unfolded length */}
      <div style={{ position: 'absolute', left: x + pw * 0.04, top: top + hh * 0.6, width: pw * 0.92, height: hh * 0.5 + len, borderRadius: m * 0.02, background: 'rgba(0,0,0,0.55)', filter: `blur(${m * 0.03}px)` }} />
      <div style={{ position: 'absolute', left: x, top, width: pw, height: hh, perspective: Math.max(w, h) * 1.4, perspectiveOrigin: `50% ${hh + ph * N * 0.5}px` }}>
        <div style={{ position: 'relative', width: pw, height: hh, transformStyle: 'preserve-3d' }}>
          {/* header card: the map's cover */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: `${m * 0.018}px ${m * 0.018}px 0 0`, background: 'linear-gradient(180deg, #2f6b4f, #24563f)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', padding: `0 ${hh * 0.35}px`, gap: hh * 0.25 }}>
            <svg width={hh * 0.5} height={hh * 0.5} viewBox="0 0 24 24">
              <path d="M2 20 L9 7 L13 13 L16 9 L22 20 Z" fill="#f3ecd9" />
              <circle cx="17" cy="5" r="2" fill="#f2c14e" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: hh * 0.32, color: '#f3ecd9', lineHeight: 1.1 }}>Eagle Ridge Loop</div>
              <div style={{ fontFamily: "'Inter Variable', Inter, system-ui", fontWeight: 500, fontSize: hh * 0.2, color: '#a9d1b8' }}>12.4 km · 640 m climb</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono Variable', monospace", fontSize: hh * 0.22, color: '#f3ecd9', transform: `rotate(${clamp(open) * 180}deg)` }}>▾</div>
          </div>
          {panel}
        </div>
      </div>
      <button
        type="button"
        aria-expanded={s.target > 0.5}
        aria-label="Unfold the trail map"
        style={{ position: 'absolute', left: x, top, width: pw, height: hh, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            fx.dispatch({ type: 'toggle' });
          }
        }}
      />
    </Stage>
  );
}
