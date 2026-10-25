import { useId } from 'react';
import type { ReactNode } from 'react';
import { defineSim, sp, spring, useFx, Stage, clamp, smooth, lerp } from '../kit';
import type { Spring, Frame } from '../kit';

/**
 * Delete, literally: a shredder rises, the document is pulled into the slot and comes out the
 * bottom as curling strips that tumble away.
 */

const VW = 420; // designed at 420 × 600 and scaled to the stage
const VH = 600;
const CW = 250;
const CH = 300;
const CX = (VW - CW) / 2;
const SLOT = 372; // y of the shredder slot
const STRIPS = 14;

type Phase = 'idle' | 'rise' | 'feed' | 'drop' | 'done';

interface S {
  phase: Phase;
  timer: number;
  feed: number; // 0..1 how much of the page went through
  machine: Spring; // 0 hidden … 1 up
  btn: Spring;
  btnDown: boolean;
  hover: number;
  idle: number;
  fall: number; // strips falling clock
  toast: Spring;
  appear: Spring; // the next document
  shredTick: number;
}

function layout(w: number, h: number) {
  const k = Math.min(w / VW, h / VH) * 0.96;
  return { k, x: (w - VW * k) / 2, y: (h - VH * k) / 2 };
}

function go(s: S, p: Phase) {
  s.phase = p;
  s.timer = 0;
}

function del(s: S, f: Frame) {
  if (s.phase !== 'idle') return;
  go(s, 'rise');
  f.emit({ name: 'click', gain: 0.5 });
  f.emit({ name: 'whoosh', gain: 0.35, rate: 0.7 });
}

export const sim = defineSim<S>({
  init: () => ({ phase: 'idle', timer: 0, feed: 0, machine: sp(0), btn: sp(0), btnDown: false, hover: 0, idle: 0, fall: 0, toast: sp(0), appear: sp(1), shredTick: 0 }),
  step(s, f) {
    const { k, x, y } = layout(f.w, f.h);
    const lx = (f.p.x - x) / k;
    const ly = (f.p.y - y) / k;
    s.timer += f.dt;
    const onBtn = lx > CX + CW - 92 && lx < CX + CW - 14 && ly > 40 + CH - 52 && ly < 40 + CH - 14;
    s.hover += ((onBtn && f.p.over ? 1 : 0) - s.hover) * Math.min(1, f.dt * 12);
    if (f.pressed) s.idle = 0;
    else s.idle += f.dt;
    if (f.pressed && onBtn && s.phase === 'idle') s.btnDown = true;
    if (s.btnDown && !f.p.down) {
      s.btnDown = false;
      del(s, f);
    }
    if (f.live && s.idle > 2.6 && s.phase === 'idle' && s.timer > 1) {
      s.btnDown = true;
      s.idle = 2.2;
    }
    if (f.live && s.btnDown && !f.p.down && s.btn.x > 0.9) {
      s.btnDown = false;
      del(s, f);
    }
    for (const a of f.actions) if (a.type === 'delete') del(s, f);

    if (s.phase === 'rise' && s.timer > 0.45) {
      go(s, 'feed');
      f.emit({ name: 'buzz', gain: 0.7 });
    }
    if (s.phase === 'feed') {
      // the rollers grab the page: a jerky start, then a steady pull
      const sp0 = s.timer < 0.12 ? 0.2 : 0.85;
      s.feed = Math.min(1, s.feed + f.dt * sp0);
      s.shredTick += f.dt;
      if (s.shredTick > 0.11) {
        s.shredTick = 0;
        f.emit({ name: 'paper', gain: 0.35 + f.rand() * 0.2, rate: 0.9 + f.rand() * 0.3 });
      }
      if (s.feed >= 1) {
        go(s, 'drop');
        s.fall = 0;
      }
    }
    if (s.phase === 'drop') {
      s.fall += f.dt;
      if (s.timer > 0.35 && s.timer - f.dt <= 0.35) {
        s.toast.v = 8;
        f.emit({ name: 'chime', gain: 0.4 });
      }
      if (s.timer > 1.5) {
        go(s, 'done');
        s.appear.x = 0;
        f.emit({ name: 'pop', gain: 0.35, rate: 1.3 });
      }
    }
    if (s.phase === 'done' && s.timer > 0.6) {
      s.feed = 0;
      go(s, 'idle');
      s.idle = 0;
    }
    spring(s.machine, s.phase === 'rise' || s.phase === 'feed' || (s.phase === 'drop' && s.timer < 0.9) ? 1 : 0, 200, 16, f.dt);
    spring(s.btn, s.btnDown ? 1 : 0, 700, 26, f.dt);
    spring(s.toast, (s.phase === 'drop' && s.timer > 0.35) || (s.phase === 'done') ? 1 : 0, 260, 18, f.dt);
    spring(s.appear, s.phase === 'drop' ? 0 : 1, 180, 14, f.dt);
  },
});

const ui = "'Inter Variable', Inter, system-ui, sans-serif";

/** the document, drawn at (0,0) in its own 250 × 300 box */
function Doc({ hover, btn }: { hover: number; btn: number }) {
  return (
    <g>
      <rect width={CW} height={CH} rx={12} fill="#fbfaf7" />
      <rect x={20} y={22} width={34} height={42} rx={5} fill="#ff5f1f" />
      <text x={37} y={49} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff" fontFamily={ui}>
        PDF
      </text>
      <text x={66} y={38} fontSize={14} fontWeight={650} fill="#1d1d24" fontFamily={ui}>
        Invoice_0417.pdf
      </text>
      <text x={66} y={56} fontSize={11} fill="#8a8a96" fontFamily={ui}>
        248 KB · edited 2 days ago
      </text>
      {[92, 112, 132, 152, 172, 192].map((yy, i) => (
        <rect key={yy} x={20} y={yy} width={[200, 170, 190, 120, 180, 150][i]} height={7} rx={3.5} fill="#e9e6df" />
      ))}
      <rect x={20} y={214} width={90} height={18} rx={4} fill="#f2efe8" />
      <text x={26} y={227} fontSize={11} fill="#5b5b66" fontFamily={ui} fontWeight={600}>
        Total €1,240
      </text>
      <g transform={`translate(${CW - 92} ${CH - 52 + btn * 2})`}>
        <rect width={78} height={38} rx={10} fill={hover > 0.5 ? '#e5383b' : '#ef4444'} />
        <path d="M14 13h12M17 13v-2.5h6V13M15.5 13l1 12h7l1-12" stroke="#fff" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={35} y={24} fontSize={12.5} fontWeight={650} fill="#fff" fontFamily={ui}>
          Delete
        </text>
      </g>
    </g>
  );
}

export default function ShredDelete() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { k, x, y } = layout(w, h);
  const m = smooth(clamp(s.machine.x)) + (s.machine.x - clamp(s.machine.x));
  const feeding = s.phase === 'feed' || s.phase === 'drop';
  const fd = feeding ? s.feed : 0;
  // the page: it lifts toward the slot during "rise", then slides down through it
  const rise = s.phase === 'rise' ? smooth(s.timer / 0.45) : feeding ? 1 : 0;
  const topIdle = 40;
  const topReady = SLOT - CH - 6;
  const top = lerp(topIdle, topReady, rise) + fd * (CH + 10);
  const jitter = s.phase === 'feed' ? Math.sin(s.timer * 90) * 1.2 : 0;
  const pageX = CX + jitter;
  const below = Math.max(0, top + CH - SLOT); // length of strips out of the bottom
  const sw = CW / STRIPS;
  const machineY = lerp(VH + 20, SLOT - 26, m);
  const showPage = s.phase !== 'done' && !(s.phase === 'drop' && s.feed >= 1 && top > SLOT + CH);
  const strips: ReactNode[] = [];
  if (below > 0 || s.phase === 'drop') {
    for (let i = 0; i < STRIPS; i++) {
      const side = (i - (STRIPS - 1) / 2) / STRIPS;
      const fall = s.phase === 'drop' ? s.fall : 0;
      const fallY = fall * fall * 900 * (0.8 + ((i * 37) % 10) / 25);
      const len = Math.min(below, CH);
      // each strip curls a little and fans out the longer it gets
      const curl = Math.sin(i * 1.7 + fx.t * 6) * 3 * (len / CH) + side * len * 0.18 + fall * side * 120;
      const rot = side * 14 * (len / CH) + fall * side * 70 + Math.sin(i * 2.3) * fall * 30;
      strips.push(
        <g key={i} transform={`translate(${pageX + i * sw + sw / 2 + curl} ${SLOT + fallY}) rotate(${rot}) translate(${-(i * sw + sw / 2)} ${-SLOT})`} opacity={clamp(1 - fall * 1.2)}>
          <clipPath id={`st${uid}${i}`}>
            <rect x={i * sw + 0.6} y={SLOT} width={sw - 1.2} height={len} />
          </clipPath>
          <g clipPath={`url(#st${uid}${i})`}>
            <g transform={`translate(0 ${top})`}>
              <Doc hover={0} btn={0} />
            </g>
            {/* shading across the strip gives it a curl */}
            <rect x={i * sw} y={SLOT} width={sw} height={len} fill={`url(#curl${uid})`} />
          </g>
        </g>,
      );
    }
  }

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(110% 80% at 50% 30%, #2a2d36 0%, #14151b 60%, #0c0d11 100%)' }}>
      <svg width={w} height={h} viewBox={`${-x / k} ${-y / k} ${w / k} ${h / k}`} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`curl${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity=".18" />
            <stop offset="0.5" stopColor="#fff" stopOpacity=".1" />
            <stop offset="1" stopColor="#000" stopOpacity=".22" />
          </linearGradient>
          <linearGradient id={`body${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a4e5a" />
            <stop offset="0.12" stopColor="#30333c" />
            <stop offset="1" stopColor="#1a1b21" />
          </linearGradient>
          <filter id={`sh${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000" floodOpacity=".45" />
          </filter>
          <clipPath id={`above${uid}`}>
            <rect x={-1000} y={-1000} width={3000} height={1000 + SLOT} />
          </clipPath>
        </defs>

        {/* strips come out behind the machine's front lip */}
        {strips}

        {/* the page above the slot */}
        {showPage && (
          <g clipPath={feeding || s.phase === 'rise' ? `url(#above${uid})` : undefined}>
            <g transform={`translate(${pageX} ${top}) scale(${s.phase === 'idle' || s.phase === 'done' ? 0.9 + 0.1 * s.appear.x : 1})`} opacity={s.phase === 'idle' ? clamp(s.appear.x) : 1} filter={`url(#sh${uid})`}>
              <Doc hover={s.hover} btn={s.btn.x} />
            </g>
          </g>
        )}

        {/* the shredder */}
        <g transform={`translate(0 ${machineY - (SLOT - 26)})`} opacity={clamp(m * 3)}>
          <rect x={CX - 40} y={SLOT - 26} width={CW + 80} height={130} rx={18} fill={`url(#body${uid})`} filter={`url(#sh${uid})`} />
          <rect x={CX - 10} y={SLOT - 6} width={CW + 20} height={12} rx={6} fill="#07080b" />
          {/* the rollers' teeth, turning while it runs */}
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={CX - 6 + i * ((CW + 12) / 22)} y={SLOT - 2} width={4} height={4} rx={1} fill="#6b6f7c" opacity={0.5 + 0.5 * Math.sin(i + fx.t * (s.phase === 'feed' ? 40 : 0))} />
          ))}
          <rect x={CX - 40} y={SLOT - 26} width={CW + 80} height={4} rx={2} fill="#fff" opacity={0.12} />
          <circle cx={CX + CW + 18} cy={SLOT + 30} r={5} fill={s.phase === 'feed' ? '#22c55e' : '#3a3d45'} />
          {s.phase === 'feed' && <circle cx={CX + CW + 18} cy={SLOT + 30} r={12} fill="#22c55e" opacity={0.25} />}
          <text x={VW / 2} y={SLOT + 70} textAnchor="middle" fontSize={11} letterSpacing="3" fill="#8b8f9c" fontFamily={ui} fontWeight={600}>
            SECURE SHRED
          </text>
        </g>
      </svg>

      {/* toast */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: Math.max(16, h * 0.06),
          transform: `translate(-50%, ${(1 - s.toast.x) * 80}px)`,
          opacity: clamp(s.toast.x),
          background: '#f4f4f6',
          color: '#16161c',
          borderRadius: 12,
          padding: `${10 * Math.max(0.8, k)}px ${16 * Math.max(0.8, k)}px`,
          fontFamily: ui,
          fontSize: 13.5 * Math.max(0.85, k),
          fontWeight: 550,
          display: 'flex',
          gap: 14,
          whiteSpace: 'nowrap',
          boxShadow: '0 14px 30px rgba(0,0,0,.4)',
        }}
      >
        <span>Invoice_0417.pdf shredded</span>
        <span style={{ color: '#ff5f1f', fontWeight: 700 }}>Undo</span>
      </div>
      <button type="button" aria-label="Delete Invoice_0417.pdf" onClick={() => fx.dispatch({ type: 'delete' })} style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, opacity: 0 }} />
    </Stage>
  );
}
