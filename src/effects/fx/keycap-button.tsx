import { useId } from 'react';
import type { ReactNode } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, approach } from '../kit';
import type { Spring } from '../kit';

/**
 * A big 2u Enter key on a mechanical board. Press it: the cap travels down against the switch
 * spring, actuates halfway (click + the underglow flashes), bottoms out with a tiny rebound,
 * and on release it shoots back up, just overshoots the top stop and settles.
 */

interface S {
  d: Spring; // travel 0 (up) … 1 (bottomed out)
  pressing: boolean;
  act: boolean; // switch is past the actuation point
  flash: number; // underglow flash 0..1
  shake: Spring; // board rattle on bottom-out
  count: number;
  idle: number;
  demo: number;
  demoDown: boolean;
}

function geom(w: number, h: number) {
  const K = Math.min(Math.min(w, h) * 0.3, w * 0.2, 240); // one key unit, px
  return { cx: w / 2, cy: h / 2 + K * 0.1, K, Bw: K * 0.98, Bd: K * 0.38, Hc: K * 0.3 };
}

export const sim = defineSim<S>({
  init: () => ({ d: sp(), pressing: false, act: false, flash: 0, shake: sp(), count: 0, idle: 0, demo: 0, demoDown: false }),
  step(s, f) {
    const { cx, cy, Bw, Bd, Hc } = geom(f.w, f.h);
    const dt = f.dt;
    const inside = Math.abs(f.p.x - cx) < Bw && f.p.y > cy - Bd - Hc && f.p.y < cy + Bd;
    if (f.p.over || f.p.down) s.idle = 0;
    else s.idle += dt;
    if (f.pressed && inside) s.pressing = true;
    if (s.pressing && !f.p.down) s.pressing = false;

    // self-demo: a quick tap every 2.4 s
    if (!s.pressing && s.idle > 2.2) {
      s.demo += dt;
      s.demoDown = s.demo % 2.4 < 0.22;
    } else {
      s.demo = 0;
      s.demoDown = false;
    }
    const held = s.pressing || s.demoDown;

    // switch spring: a stiff push when held, a strong linear spring back up when released
    const prev = s.d.x;
    spring(s.d, held ? 1.15 : 0, held ? 420 : 520, held ? 18 : 15, dt);
    // hard stops: bottom-out (plastic on plate) and the top housing
    if (s.d.x > 1) {
      if (s.d.v > 1.5) {
        f.emit({ name: 'thud', gain: clamp(s.d.v / 10, 0.25, 0.8), rate: 1.6 });
        s.shake.v += Math.min(s.d.v, 10) * (f.reduced ? 2 : 9);
      }
      s.d.x = 1;
      s.d.v = -s.d.v * 0.22;
    }
    if (s.d.x < -0.06) {
      if (s.d.v < -2) f.emit({ name: 'tick', gain: 0.4, rate: 1.4 });
      s.d.x = -0.06;
      s.d.v = -s.d.v * 0.3;
    }
    // actuation point at 45% travel, with hysteresis on the way back
    if (!s.act && prev < 0.45 && s.d.x >= 0.45) {
      s.act = true;
      s.flash = 1;
      s.count++;
      f.emit({ name: 'click', gain: 0.8, rate: 1 + f.rand() * 0.1 });
    }
    if (s.act && s.d.x < 0.3) s.act = false;
    s.flash = approach(s.flash, s.act ? 0.55 : 0, s.act ? 3 : 4, dt);
    spring(s.shake, 0, 900, 30, dt);
  },
});

const ROWS = ['QWERTYUIOP[]', 'ASDFGHJKL;\'', 'ZXCVBNM,./', '1234567890-='];

/** a keycap as a frustum: base footprint at the plate, a smaller dished top lifted by Hc */
function Cap(p: { x: number; y: number; bw: number; bd: number; hc: number; top: string; side: string; front: string; legend: ReactNode; uid: string; dark?: boolean }) {
  const { x, y, bw, bd, hc } = p;
  const tw = bw * 0.8;
  const td = bd * 0.66;
  const ty = y - hc - bd * 0.08; // top face centre (sits a bit to the back)
  const r = Math.min(bw, bd) * 0.18;
  const bl = [x - bw, y + bd];
  const br = [x + bw, y + bd];
  const fl = [x - tw, ty + td];
  const fr = [x + tw, ty + td];
  const backL = [x - bw, y - bd];
  const backR = [x + bw, y - bd];
  const tl = [x - tw, ty - td];
  const trr = [x + tw, ty - td];
  const q = (a: number[][]) => a.map((v) => v.join(',')).join(' ');
  return (
    <g>
      <polygon points={q([backL, backR, trr, tl])} fill={p.side} />
      <polygon points={q([backL, tl, fl, bl])} fill={p.side} />
      <polygon points={q([backR, trr, fr, br])} fill={p.side} />
      <polygon points={q([bl, br, fr, fl])} fill={p.front} />
      <rect x={x - tw} y={ty - td} width={tw * 2} height={td * 2} rx={r} fill={p.top} />
      {/* the dish: a soft concave shading on the top face */}
      <rect x={x - tw} y={ty - td} width={tw * 2} height={td * 2} rx={r} fill={`url(#dish${p.uid})`} opacity={p.dark ? 0.6 : 1} />
      <g transform={`translate(${x} ${ty})`}>{p.legend}</g>
    </g>
  );
}

export default function KeycapButton() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { cx, cy, K, Bw, Bd, Hc } = geom(w, h);
  const d = s.d.x;
  const sink = d * Hc * 0.62; // screen px the cap drops
  const shake = s.shake.x * K * 0.0012;
  const u = K; // 1u pitch
  const rowP = K * 1.0;
  const glow = clamp(s.flash);
  const mono = "'JetBrains Mono Variable', monospace";
  const disp = "'Archivo Variable', Archivo, system-ui, sans-serif";

  // neighbouring keys fill the stage
  const keys: ReactNode[] = [];
  const front: ReactNode[] = [];
  for (let r = -3; r <= 3; r++) {
    const yy = cy + r * rowP;
    const row = ROWS[(r + 30) % ROWS.length];
    const off = (r % 2) * u * 0.25;
    for (let i = -8; i <= 8; i++) {
      const xx = cx + off + i * u;
      if (r === 0 && Math.abs(xx - cx) < Bw + u * 0.4) continue; // the big key lives here
      if (xx < -u || xx > w + u || yy < -rowP || yy > h + rowP) continue;
      const ch = row[(i + 40) % row.length];
      (r > 0 ? front : keys).push(
        <Cap
          key={`${r}:${i}`}
          uid={uid}
          dark
          x={xx}
          y={yy}
          bw={u * 0.45}
          bd={Bd}
          hc={Hc}
          top="#2b2e35"
          side="#1d1f24"
          front="#17181c"
          legend={
            <text textAnchor="middle" dominantBaseline="middle" fontFamily={mono} fontSize={u * 0.16} fill="#8b909c" opacity={0.75}>
              {ch}
            </text>
          }
        />,
      );
    }
  }

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#0b0c0f' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`dish${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.22" />
            <stop offset="0.45" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id={`top${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffa25c" />
            <stop offset="1" stopColor="#ff6a1a" />
          </linearGradient>
          <linearGradient id={`front${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e35a10" />
            <stop offset="1" stopColor="#a33a05" />
          </linearGradient>
          <radialGradient id={`glow${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff8a3d" stopOpacity="1" />
            <stop offset="0.5" stopColor="#ff5e1a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ff5e1a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`vig${uid}`} cx="50%" cy="45%" r="75%">
            <stop offset="0.5" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.75" />
          </radialGradient>
          <clipPath id={`hole${uid}`}>
            {/* everything of the cap that sinks below the plate is hidden */}
            <rect x={cx - Bw * 1.05} y={-h} width={Bw * 2.1} height={h + cy + Bd * 1.04} />
          </clipPath>
          <filter id={`bl${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={K * 0.08} />
          </filter>
        </defs>
        <g transform={`translate(${shake * 0.4} ${shake})`}>
          {/* aluminium plate */}
          <rect x={0} y={0} width={w} height={h} fill="#15171b" />
          {keys}
          {/* the switch well and its RGB underglow */}
          <rect x={cx - Bw * 1.05} y={cy - Bd * 1.05} width={Bw * 2.1} height={Bd * 2.1} rx={K * 0.06} fill="#050506" />
          <ellipse cx={cx} cy={cy} rx={Bw * (1.5 + glow * 0.4)} ry={Bd * (1.8 + glow * 0.5)} fill={`url(#glow${uid})`} opacity={0.35 + glow * 0.65} />
          <ellipse cx={cx} cy={cy + Bd * 0.3} rx={Bw * 0.95} ry={Bd * 0.6} fill="#000" opacity={0.6 - d * 0.3} filter={`url(#bl${uid})`} />
          <g clipPath={`url(#hole${uid})`}>
            <Cap
              uid={uid}
              x={cx}
              y={cy + sink}
              bw={Bw * 0.98}
              bd={Bd * 0.98}
              hc={Hc}
              top={`url(#top${uid})`}
              side="#c8500e"
              front={`url(#front${uid})`}
              legend={
                <g>
                  <text x={-K * 0.12} y={-Bd * 0.02} textAnchor="middle" dominantBaseline="middle" fontFamily={disp} fontWeight={800} fontSize={K * 0.2} letterSpacing={K * 0.02} fill="#3a1300" opacity={0.85}>
                    ENTER
                  </text>
                  <path
                    d={`M${K * 0.6} ${-Bd * 0.3} v${Bd * 0.42} h${-K * 0.2} m${K * 0.07} ${-Bd * 0.16} l${-K * 0.07} ${Bd * 0.16} l${K * 0.07} ${Bd * 0.16}`}
                    fill="none"
                    stroke="#3a1300"
                    strokeOpacity={0.7}
                    strokeWidth={K * 0.022}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              }
            />
            {/* specular on the top edge, brighter while the glow is on */}
            <rect x={cx - Bw * 0.74} y={cy + sink - Hc - Bd * 0.08 - Bd * 0.64} width={Bw * 1.48} height={Bd * 0.07} rx={Bd * 0.03} fill="#fff" opacity={0.35 + glow * 0.2} />
          </g>
          {/* glow spills over the front lip when actuated */}
          <rect x={cx - Bw} y={cy + Bd * 0.98} width={Bw * 2} height={K * 0.03} fill="#ffb37a" opacity={glow * 0.8} filter={`url(#bl${uid})`} />
          {front}
        </g>
        <rect width={w} height={h} fill={`url(#vig${uid})`} />
        <rect x={w / 2 - Math.max(60, K * 0.6)} y={h - Math.min(w, h) * 0.06 - Math.max(14, K * 0.11)} width={Math.max(120, K * 1.2)} height={Math.max(22, K * 0.17)} rx={Math.max(11, K * 0.085)} fill="#0b0c0f" opacity={0.85} />
        <text x={w / 2} y={h - Math.min(w, h) * 0.06} textAnchor="middle" fontFamily={mono} fontSize={Math.max(10, K * 0.11)} fill="#ff9a55" opacity={0.35 + glow * 0.6}>
          {`actuated × ${s.count}`}
        </text>
      </svg>
      <button
        type="button"
        aria-label="Enter key"
        style={{ position: 'absolute', left: cx - Bw, top: cy - Bd - Hc, width: Bw * 2, height: Bd * 2 + Hc, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
