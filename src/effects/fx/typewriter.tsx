import { useId } from 'react';
import { defineSim, useFx, Stage, sp, spring } from '../kit';
import type { Spring } from '../kit';

/**
 * A vintage typewriter. Click the round keys (or click the paper and type): the key sinks, a
 * typebar swings up and strikes the ribbon, and the carriage steps one letter to the left.
 * Near the end of the line the bell rings; at the end the carriage slams back and the paper
 * feeds up a line. Idle, it types a note by itself.
 */

const COLS = 26;
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const DEMO = 'Dear reader, every letter here was struck by a key. Ding! Back to the start of the line. ';

interface S {
  lines: string[];
  cur: string;
  queue: string[];
  next: number;
  car: Spring; // carriage offset (columns)
  feed: Spring; // paper feed (lines)
  keys: Record<string, Spring>;
  strike: number; // seconds since the last strike
  strikeAt: number; // which typebar (0..1 across the fan)
  bell: boolean;
  idle: number;
  demo: number;
  ret: number; // carriage-return timer
  t: number;
}

function geom(w: number, h: number) {
  const u = Math.min(w, h) / 100;
  const cw = Math.min(w / (COLS + 8), u * 3.6); // character advance on the paper
  const fs = cw / 0.6;
  const py = h * (h > w ? 0.38 : 0.42); // typing line (top of the platen)
  const kr = Math.min(w / 25, u * (h > w ? 4.3 : 3.6)); // key radius
  const ky = h * (h > w ? 0.68 : 0.7);
  const keys = ROWS.flatMap((row, r) =>
    Array.from(row, (ch, i) => ({ ch, x: w / 2 + (i - (row.length - 1) / 2) * kr * 2.35 + r * kr * 0.5, y: ky + r * kr * 2.3, r: kr })),
  );
  const space = { x: w / 2 + kr * 0.6, y: ky + 3 * kr * 2.3, w: kr * 12, h: kr * 1.1 };
  return { u, cw, fs, py, lh: fs * 1.45, kr, keys, space };
}

function hitKey(w: number, h: number, x: number, y: number) {
  const g = geom(w, h);
  const k = g.keys.find((k) => Math.hypot(x - k.x, y - k.y) < k.r * 1.1);
  if (k) return k.ch;
  if (Math.abs(x - g.space.x) < g.space.w / 2 && Math.abs(y - g.space.y) < g.space.h) return ' ';
  return null;
}

export const sim = defineSim<S>({
  init: () => ({ lines: [], cur: '', queue: [], next: 0, car: sp(), feed: sp(), keys: {}, strike: 9, strikeAt: 0.5, bell: false, idle: 1.5, demo: 0, ret: -1, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    s.strike += f.dt;
    const active = f.p.down || f.actions.length > 0;
    s.idle = active ? 0 : s.idle + f.dt;
    if (f.pressed) {
      const ch = hitKey(f.w, f.h, f.p.x, f.p.y);
      if (ch) s.queue.push(ch);
    }
    for (const a of f.actions) {
      if (a.type !== 'key') continue;
      const k = String(a.key);
      if (k === 'Enter') s.queue.push('\n');
      else if (k.length === 1) s.queue.push(k);
    }
    // idle: the typewriter types its own note, with a human rhythm
    if (s.idle > 2.5 && s.queue.length === 0 && s.ret < 0) {
      s.queue.push(DEMO[s.demo % DEMO.length]);
      s.demo++;
    }
    s.next -= f.dt;
    if (s.ret >= 0) {
      // carriage return in progress: wait for the slam, then feed the paper
      s.ret += f.dt;
      if (s.ret > 0.32) s.ret = -1;
    } else if (s.next <= 0 && s.queue.length) {
      const ch = s.queue.shift()!;
      s.next = s.idle > 2.5 ? 0.07 + f.rand() * 0.09 + (ch === ' ' ? 0.06 : 0) : 0.045;
      if (ch === '\n' || s.cur.length >= COLS) {
        s.lines.push(s.cur);
        if (s.lines.length > 40) s.lines.shift();
        s.cur = '';
        s.bell = false;
        s.ret = 0;
        f.emit({ name: 'whoosh', gain: 0.5, rate: 0.8 });
        f.emit({ name: 'switch', gain: 0.45, rate: 0.7 });
        if (ch !== '\n') s.queue.unshift(ch);
      } else {
        s.cur += ch;
        const up = ch.toUpperCase();
        if (!s.keys[up]) s.keys[up] = sp();
        s.keys[up].x = 1; // the key sinks at once and springs back up
        if (ch !== ' ') {
          s.strike = 0;
          const idx = ROWS.join('').indexOf(up);
          s.strikeAt = idx >= 0 ? idx / 25 : 0.5;
          f.emit({ name: 'click', gain: 0.55, rate: 0.85 + f.rand() * 0.25, pan: (s.strikeAt - 0.5) * 0.5 });
        } else f.emit({ name: 'tick', gain: 0.3, rate: 0.7 });
        // the margin bell rings a few letters before the end of the line
        if (s.cur.length === COLS - 5 && !s.bell) {
          s.bell = true;
          f.emit({ name: 'ding', gain: 0.6 });
        }
      }
    }
    // the escapement steps the carriage; the return is a long, bouncy slide
    spring(s.car, s.cur.length, s.ret >= 0 ? 90 : 900, s.ret >= 0 ? 13 : 45, f.dt);
    spring(s.feed, s.lines.length, 200, 18, f.dt);
    for (const k in s.keys) spring(s.keys[k], 0, 500, 22, f.dt);
  },
});

export default function Typewriter() {
  const fx = useFx(sim);
  const uid = useId().replace(/:/g, '');
  const { s, w, h } = fx;
  const { u, cw, fs, py, lh, kr, keys, space } = geom(w, h);
  const mono = "'JetBrains Mono Variable', monospace";
  // the paper moves with the carriage so the typing point stays put in the middle
  const px = w / 2 - s.car.x * cw;
  const paperW = (COLS + 6) * cw;
  const left = px - cw * 3;
  const feed = s.feed.x;
  const all = [...s.lines, s.cur];
  const strikeP = s.strike < 0.11 ? Math.sin((s.strike / 0.11) * Math.PI) : 0;
  const hubY = py + lh * 3.2;
  const ink = (i: number, j: number) => {
    // each impression is a little uneven: weight, height and tilt vary like a real slug
    const r = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
    const q = r - Math.floor(r);
    return { o: 0.72 + q * 0.28, dy: (q - 0.5) * fs * 0.06, rot: (q - 0.5) * 3 };
  };

  return (
    <Stage fx={fx} style={{ background: 'radial-gradient(100% 80% at 50% 30%, #3a3129 0%, #211b16 55%, #0f0c0a 100%)' }}>
      {/* the paper */}
      <div style={{ position: 'absolute', left, top: -h, width: paperW, height: h + py + lh * 0.35, background: 'linear-gradient(180deg,#f6f1e4,#efe8d6)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden', willChange: 'transform' }}>
        {all.map((line, j) => {
          const y = h + py - (all.length - 1 - j) * lh - (feed - s.lines.length) * lh - fs * 0.25;
          if (y < h - lh * 12) return null;
          return (
            <div key={j} style={{ position: 'absolute', left: cw * 3, top: y - fs, height: fs, fontFamily: mono, fontWeight: 500, fontSize: fs, lineHeight: `${fs}px`, color: '#17171c', whiteSpace: 'pre' }}>
              {Array.from(line, (ch, i) => {
                const k = ink(i, j);
                return (
                  <span key={i} style={{ display: 'inline-block', width: cw, textAlign: 'center', opacity: k.o, transform: `translateY(${k.dy}px) rotate(${k.rot}deg)`, textShadow: '0 0 0.6px rgba(20,20,30,0.6)' }}>
                    {ch}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      {/* platen and carriage */}
      <div style={{ position: 'absolute', left: left - kr * 1.4, top: py + lh * 0.2, width: paperW + kr * 2.8, height: lh * 1.4, borderRadius: lh * 0.7, background: 'linear-gradient(180deg,#3b3b40 0%,#121214 45%,#050506 70%,#2a2a2e 100%)', boxShadow: '0 8px 18px rgba(0,0,0,0.6)' }} />
      {[left - kr * 1.6, left + paperW + kr * 0.4].map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: py + lh * 0.05, width: kr * 1.2, height: lh * 1.7, borderRadius: kr * 0.3, background: 'linear-gradient(90deg,#8d8d93,#e6e6ea 40%,#6b6b70)' }} />
      ))}
      {/* type guide and the striking typebar */}
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`bar${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6e6e74" />
            <stop offset="0.5" stopColor="#d7d7dc" />
            <stop offset="1" stopColor="#5a5a60" />
          </linearGradient>
        </defs>
        <path d={`M ${w / 2 - cw * 1.2} ${py + lh * 0.25} L ${w / 2 + cw * 1.2} ${py + lh * 0.25} L ${w / 2 + cw * 0.5} ${py + lh * 0.05} L ${w / 2 - cw * 0.5} ${py + lh * 0.05} Z`} fill="#b9b9be" />
        {/* the fan of resting typebars */}
        {Array.from({ length: 23 }, (_, i) => {
          const a = Math.PI * (0.12 + (i / 22) * 0.76);
          return <line key={i} x1={w / 2 - Math.cos(a) * lh * 2.6} y1={hubY - Math.sin(a) * lh * 0.9} x2={w / 2 - Math.cos(a) * lh * 1.6} y2={hubY - Math.sin(a) * lh * 0.5} stroke="#58585e" strokeWidth={u * 0.35} strokeLinecap="round" />;
        })}
        {strikeP > 0 && (() => {
          // one bar swings up from its slot in the fan to the typing point
          const a0 = Math.PI * (0.12 + s.strikeAt * 0.76);
          const sx = w / 2 - Math.cos(a0) * lh * 2.6;
          const sy = hubY - Math.sin(a0) * lh * 0.9;
          const tx = sx + (w / 2 - sx) * strikeP;
          const ty = sy + (py - lh * 0.2 - sy) * strikeP;
          return <line x1={w / 2 - Math.cos(a0) * lh * 1.6} y1={hubY - Math.sin(a0) * lh * 0.5} x2={tx} y2={ty} stroke={`url(#bar${uid})`} strokeWidth={u * 0.7} strokeLinecap="round" />;
        })()}
        {/* ribbon */}
        <rect x={w / 2 - cw * 2} y={py - lh * 0.12} width={cw * 4} height={lh * 0.3} rx={2} fill="#7a1f24" opacity={0.85 - strikeP * 0.3} />
      </svg>
      {/* the machine body */}
      <div style={{ position: 'absolute', left: w / 2 - Math.min(w * 0.48, kr * 14), top: py + lh * 1.7, width: Math.min(w * 0.96, kr * 28), height: h, borderRadius: `${kr * 2}px ${kr * 2}px 0 0`, background: 'linear-gradient(180deg,#2c3b34 0%,#1b2621 40%,#121916 100%)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), 0 -6px 20px rgba(0,0,0,0.4)' }} />
      {/* keys */}
      {keys.map((k) => {
        const d = s.keys[k.ch]?.x ?? 0;
        return (
          <div key={k.ch} style={{ position: 'absolute', left: k.x - k.r, top: k.y - k.r + d * k.r * 0.35, width: k.r * 2, height: k.r * 2, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #3b3b40, #0c0c0e 70%)', border: `${Math.max(1.5, k.r * 0.16)}px solid #c9c9cf`, boxSizing: 'border-box', boxShadow: `0 ${k.r * (0.45 - d * 0.35)}px ${k.r * 0.3}px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.3)`, display: 'grid', placeItems: 'center', fontFamily: "'Inter Variable', Inter, system-ui", fontWeight: 700, fontSize: k.r * 0.85, color: '#f3efe6' }}>
            {k.ch}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: space.x - space.w / 2, top: space.y - space.h / 2 + (s.keys[' ']?.x ?? 0) * space.h * 0.25, width: space.w, height: space.h, borderRadius: space.h / 2, background: 'linear-gradient(180deg,#d8d8de,#8c8c92)', boxShadow: `0 ${space.h * 0.3}px ${space.h * 0.3}px rgba(0,0,0,0.6)` }} />
      {/* click the paper to type with a real keyboard */}
      <input
        aria-label="Type on the typewriter"
        onKeyDown={(e) => {
          fx.dispatch({ type: 'key', key: e.key });
          e.preventDefault();
        }}
        style={{ position: 'absolute', left: 0, top: 0, width: w, height: py, opacity: 0, cursor: 'text' }}
      />
    </Stage>
  );
}
