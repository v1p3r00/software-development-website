import { memo } from 'react';
import type { CSSProperties } from 'react';
import { defineSim, useFx, Stage, clamp } from '../kit';

/**
 * An airport departure board. Every cell is a little drum of flaps: to reach a new letter it
 * flips through the alphabet one flap at a time (the top half falls, the next letter's bottom
 * half slaps down and settles). Cells start a beat apart, so a new board ripples across in a
 * clatter. Click for the next board; idle, it updates itself.
 */

const DRUM = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-.';
const FLIP = 0.075; // seconds per flap

type Row = [string, string, string, string];
const BOARDS: Row[][] = [
  [
    ['08:45', 'LISBON', 'B12', 'ON TIME'],
    ['09:10', 'REYKJAVIK', 'A04', 'BOARDING'],
    ['09:25', 'KYOTO', 'C21', 'DELAYED'],
    ['09:40', 'NEW YORK', 'D02', 'ON TIME'],
    ['10:05', 'MARRAKECH', 'B07', 'GATE OPEN'],
    ['10:20', 'OSLO', 'A11', 'ON TIME'],
    ['10:35', 'BUDAPEST', 'C03', 'CANCELLED'],
    ['10:50', 'SYDNEY', 'E09', 'ON TIME'],
  ],
  [
    ['11:00', 'BERLIN', 'A02', 'BOARDING'],
    ['11:15', 'CAPE TOWN', 'E14', 'ON TIME'],
    ['11:30', 'SEOUL', 'C08', 'ON TIME'],
    ['11:45', 'LIMA', 'D19', 'DELAYED'],
    ['12:00', 'HELSINKI', 'A07', 'GATE OPEN'],
    ['12:20', 'MONTREAL', 'B03', 'ON TIME'],
    ['12:35', 'ATHENS', 'C15', 'ON TIME'],
    ['12:50', 'DUBAI', 'E01', 'BOARDING'],
  ],
  [
    ['13:05', 'VIENNA', 'B10', 'ON TIME'],
    ['13:20', 'SINGAPORE', 'E06', 'DELAYED'],
    ['13:35', 'PRAGUE', 'A09', 'BOARDING'],
    ['13:50', 'NAIROBI', 'D12', 'ON TIME'],
    ['14:10', 'BOGOTA', 'C02', 'ON TIME'],
    ['14:25', 'TOKYO', 'E11', 'GATE OPEN'],
    ['14:40', 'DUBLIN', 'A05', 'ON TIME'],
    ['14:55', 'MADRID', 'B08', 'CANCELLED'],
  ],
];

function cols(w: number, h: number) {
  // wide stages show the full row; narrow ones keep destination + gate
  return w / h > 0.9 ? [5, 10, 3, 9] : [0, 10, 3, 0];
}

function rowText(r: Row, c: number[]) {
  const parts = r.map((x, i) => (c[i] ? x.padEnd(c[i]).slice(0, c[i]) : null)).filter((x) => x !== null);
  return parts.join(' ');
}

function layout(w: number, h: number) {
  const c = cols(w, h);
  const n = c.filter(Boolean).reduce((a, b) => a + b, 0) + c.filter(Boolean).length - 1;
  const cw = Math.min((w * 0.92) / n, h * 0.075);
  const ch = cw * 1.5;
  const rows = clamp(Math.floor((h * 0.78) / (ch * 1.18)), 3, 8);
  return { c, n, cw, ch, rows, gap: cw * 0.12 };
}

interface Cell {
  cur: number;
  tgt: number;
  ph: number; // flip progress 0..1
  wait: number; // delay before this cell starts flipping
}

interface S {
  cells: Cell[];
  n: number;
  rows: number;
  board: number;
  idle: number;
  since: number;
  t: number;
}

function setBoard(s: S, k: number, w: number, h: number, rand: () => number) {
  const { c, n, rows } = layout(w, h);
  s.board = k;
  s.since = 0;
  const b = BOARDS[k % BOARDS.length];
  if (s.cells.length !== n * rows) {
    s.cells = Array.from({ length: n * rows }, () => ({ cur: 0, tgt: 0, ph: 0, wait: 0 }));
    s.n = n;
    s.rows = rows;
  }
  for (let r = 0; r < rows; r++) {
    const txt = rowText(b[r % b.length], c).padEnd(n);
    for (let i = 0; i < n; i++) {
      const cell = s.cells[r * n + i];
      cell.tgt = Math.max(0, DRUM.indexOf(txt[i]));
      // the update ripples across the board, row by row
      cell.wait = r * 0.09 + i * 0.03 + rand() * 0.05;
    }
  }
}

export const sim = defineSim<S>({
  init: () => ({ cells: [], n: 0, rows: 0, board: -1, idle: 0, since: 0, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    if (s.board < 0) setBoard(s, 0, f.w, f.h, f.rand);
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    s.since += f.dt;
    if (f.pressed) {
      setBoard(s, s.board + 1, f.w, f.h, f.rand);
      f.emit({ name: 'click', gain: 0.4 });
    } else if (s.idle > 2 && s.since > 5.5) setBoard(s, s.board + 1, f.w, f.h, f.rand);
    let flaps = 0;
    for (const c of s.cells) {
      if (c.cur === c.tgt && c.ph === 0) continue;
      if (c.wait > 0) {
        c.wait -= f.dt;
        continue;
      }
      c.ph += f.dt / FLIP;
      if (c.ph >= 1) {
        c.cur = (c.cur + 1) % DRUM.length;
        c.ph = c.cur === c.tgt ? 0 : c.ph - 1;
        flaps++;
      }
    }
    // the clatter: one cue per frame, louder when many flaps land together
    if (flaps) f.emit({ name: 'tick', gain: clamp(0.08 + flaps * 0.02, 0, 0.6), rate: 0.85 + f.rand() * 0.4, pan: (f.rand() - 0.5) * 0.6 });
  },
});

const STATUS: Record<string, string> = { 'ON TIME': '#7dffb0', BOARDING: '#ffd166', DELAYED: '#ffb347', CANCELLED: '#ff5d6c', 'GATE OPEN': '#8fd3ff' };

const MONO = "'JetBrains Mono Variable', monospace";

/** one flap cell; memoised so the board only re-renders the cells that are moving */
const FlapCell = memo(function FlapCell({ cur, ph, color, x, y, cw, ch }: { cur: number; ph: number; color: string; x: number; y: number; cw: number; ch: number }) {
  const next = (cur + 1) % DRUM.length;
  const flipping = ph > 0;
  const rr = cw * 0.12;
  const glyph: CSSProperties = { position: 'absolute', left: 0, width: cw, height: ch, lineHeight: `${ch}px`, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: ch * 0.68, color };
  // one half of a flap showing half of a letter
  const half = (k: number, top: boolean, extra?: CSSProperties) => (
    <div style={{ position: 'absolute', left: 0, top: top ? 0 : ch / 2, width: cw, height: ch / 2, overflow: 'hidden', borderRadius: top ? `${rr}px ${rr}px 0 0` : `0 0 ${rr}px ${rr}px`, background: top ? 'linear-gradient(180deg,#2c2f36,#22252b)' : 'linear-gradient(180deg,#1c1e23,#25282e)', ...extra }}>
      <div style={{ ...glyph, top: top ? 0 : -ch / 2 }}>{DRUM[k]}</div>
    </div>
  );
  // the falling top flap accelerates like a hinged plate, the bottom one slaps and settles
  const topAng = ph < 0.5 ? -90 * (ph / 0.5) ** 2 : -90;
  const botAng = ph >= 0.5 ? 90 * (1 - Math.sin(((ph - 0.5) / 0.5) * Math.PI * 0.5)) : 90;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: cw, height: ch, perspective: flipping ? ch * 4 : undefined }}>
      {/* static halves: next letter's top waits behind, current bottom shows below */}
      {half(flipping ? next : cur, true)}
      {half(cur, false)}
      {flipping && ph < 0.5 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: cw, height: ch / 2, transformOrigin: '50% 100%', transform: `rotateX(${topAng}deg)` }}>
          {half(cur, true)}
          <div style={{ position: 'absolute', left: 0, top: 0, width: cw, height: ch / 2, background: '#000', opacity: (-topAng / 90) * 0.6, borderRadius: `${rr}px ${rr}px 0 0` }} />
        </div>
      )}
      {flipping && ph >= 0.5 && (
        <div style={{ position: 'absolute', left: 0, top: ch / 2, width: cw, height: ch / 2, transformOrigin: '50% 0%', transform: `rotateX(${botAng}deg)` }}>
          {half(next, false, { top: 0 })}
          <div style={{ position: 'absolute', left: 0, top: 0, width: cw, height: ch / 2, background: '#fff', opacity: (botAng / 90) * 0.12, borderRadius: `0 0 ${rr}px ${rr}px` }} />
        </div>
      )}
      {/* the hinge gap, the axle pin and a soft gloss */}
      <div style={{ position: 'absolute', left: 0, top: ch / 2 - 0.75, width: cw, height: 1.5, background: '#07080a' }} />
      <div style={{ position: 'absolute', left: -cw * 0.04, top: ch / 2 - cw * 0.08, width: cw * 0.08, height: cw * 0.16, background: '#3a3d44', borderRadius: 1 }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: rr, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 ${ch * 0.04}px ${ch * 0.08}px rgba(0,0,0,0.6)`, pointerEvents: 'none' }} />
    </div>
  );
});

export default function SplitFlap() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const { c, n, cw, ch, rows, gap } = layout(w, h);
  const ok = s.n === n && s.rows === rows;
  const boardW = n * cw + (n - 1) * gap * 0.3;
  const x0 = (w - boardW) / 2;
  const rowH = ch * 1.18;
  const y0 = h / 2 - (rows * rowH) / 2 + ch * 0.55;
  const b = BOARDS[Math.max(0, s.board) % BOARDS.length];
  // which column a character belongs to (to colour the status column)
  const statusStart = c[0] + (c[0] ? 1 : 0) + c[1] + 1 + c[2] + 1;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(100% 90% at 50% 30%, #23262e 0%, #121318 60%, #08090b 100%)' }}>
      {/* header */}
      <div style={{ position: 'absolute', left: x0, top: y0 - ch * 1.75, display: 'flex', alignItems: 'center', gap: cw * 0.5, color: '#ffd166', fontFamily: "'Archivo Variable', Archivo, system-ui", fontWeight: 800, fontSize: ch * 0.62, letterSpacing: ch * 0.06 }}>
        <svg width={ch * 0.7} height={ch * 0.7} viewBox="0 0 24 24" fill="#ffd166">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
        </svg>
        DEPARTURES
      </div>
      {ok &&
        Array.from({ length: rows }, (_, r) => (
          <div key={r}>
            {Array.from({ length: n }, (_, i) => {
              const cell = s.cells[r * n + i];
              const status = c[3] && i >= statusStart;
              const color = status ? STATUS[b[r % b.length][3]] ?? '#f2efe6' : '#f2efe6';
              return <FlapCell key={i} cur={cell.cur} ph={cell.ph} color={color} x={x0 + i * (cw + gap * 0.3)} y={y0 + r * rowH} cw={cw} ch={ch} />;
            })}
          </div>
        ))}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }} aria-live="polite">
        {b.slice(0, rows).map((r) => r.join(' ')).join('; ')}
      </span>
      <button type="button" aria-label="Show the next departures" style={{ position: 'absolute', inset: 0, opacity: 0 }} />
    </Stage>
  );
}
