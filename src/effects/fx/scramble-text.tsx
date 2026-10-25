import { defineSim, useFx, Stage, clamp, smooth } from '../kit';

/**
 * Decrypting text. Every character spins through random glyphs, then they lock in one by one,
 * left to right: each lock lands with a bright flash that cools to white. Hover the words to
 * scramble them again, click for the next message. Idle, it cycles through messages.
 */

const PHRASES = ['SIGNAL|ACQUIRED', 'ACCESS|GRANTED', 'HELLO|WORLD', 'SYSTEM|ONLINE', 'NODE 07|LINKED'];
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/\\?@!';
const STAGGER = 0.055;
const LEAD = 0.35; // everything scrambles for a moment before the first lock

interface S {
  k: number; // phrase index
  start: number; // time the current decrypt started
  lock: number[]; // lock time per character (relative to start)
  shown: string[]; // what each slot currently shows
  next: number[]; // when each slot changes glyph next
  done: boolean;
  hoverArmed: boolean;
  idle: number;
  t: number;
}

const chars = (k: number) => PHRASES[k % PHRASES.length].replace('|', '');

function begin(s: S, f: { rand: () => number }, k: number) {
  s.k = k;
  s.start = s.t;
  const c = chars(k);
  s.lock = Array.from(c, (_, i) => LEAD + i * STAGGER + f.rand() * 0.08);
  s.shown = Array.from(c, () => GLYPHS[Math.floor(f.rand() * GLYPHS.length)]);
  s.next = Array.from(c, () => 0);
  s.done = false;
}

function layout(w: number, h: number, k: number) {
  const lines = PHRASES[k % PHRASES.length].split('|');
  const n = Math.max(...PHRASES.map((p) => Math.max(...p.split('|').map((l) => l.length))));
  const fs = Math.min((w * 0.84) / (n * 0.62), h * 0.19);
  return { lines, fs, cw: fs * 0.62, lh: fs * 1.08 };
}

export const sim = defineSim<S>({
  init: () => ({ k: 0, start: -10, lock: [], shown: [], next: [], done: true, hoverArmed: true, idle: 2.2, t: 0 }),
  step(s, f) {
    s.t += f.dt;
    if (!s.lock.length) begin(s, f, 0);
    const active = f.p.down || Math.hypot(f.p.vx, f.p.vy) > 4;
    s.idle = active && f.p.over ? 0 : s.idle + f.dt;
    const { lines, cw, lh } = layout(f.w, f.h, s.k);
    const tw = Math.max(...lines.map((l) => l.length)) * cw;
    const over = f.p.over && Math.abs(f.p.x - f.w / 2) < tw / 2 + cw && Math.abs(f.p.y - f.h / 2) < lh * 1.2;
    if (f.pressed) {
      begin(s, f, s.k + 1);
      f.emit({ name: 'click', gain: 0.4 });
      s.hoverArmed = false;
    } else if (over && s.hoverArmed && s.done) {
      begin(s, f, s.k);
      s.hoverArmed = false;
    }
    if (!over) s.hoverArmed = true;
    // idle: next message a few seconds after the last one locked
    const total = LEAD + s.lock.length * STAGGER + 0.1;
    if (s.idle > 2 && s.done && s.t - s.start > total + 2.2) begin(s, f, s.k + 1);

    const rt = s.t - s.start;
    const c = chars(s.k);
    let locked = 0;
    for (let i = 0; i < c.length; i++) {
      if (rt >= s.lock[i]) {
        if (s.shown[i] !== c[i]) {
          s.shown[i] = c[i];
          if (c[i] !== ' ' && i % 2 === 0) f.emit({ name: 'tick', gain: 0.22, rate: 1.4 + i * 0.03, pan: (i / c.length - 0.5) * 0.8 });
        }
        locked++;
      } else if (rt >= s.next[i]) {
        // unlocked slots flicker through glyphs, faster as their lock time approaches
        s.shown[i] = c[i] === ' ' ? ' ' : GLYPHS[Math.floor(f.rand() * GLYPHS.length)];
        s.next[i] = rt + 0.03 + f.rand() * 0.06;
      }
    }
    if (!s.done && locked === c.length) {
      s.done = true;
      f.emit({ name: 'success', gain: 0.35 });
    }
  },
});

export default function ScrambleText() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const { lines, fs, cw, lh } = layout(w, h, s.k);
  const rt = s.t - s.start;
  const c = chars(s.k);
  const prog = c.length ? s.lock.filter((t) => rt >= t).length / c.length : 1;
  const mono = "'JetBrains Mono Variable', monospace";
  const u = Math.min(w, h) / 100;
  let idx = 0;
  // a scan bar sweeps down the screen
  const scan = ((s.t * 0.35) % 1.3) * h;

  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(90% 80% at 50% 50%, #0d1a17 0%, #070c0b 60%, #030505 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(80,255,200,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(80,255,200,0.04) 1px, transparent 1px)', backgroundSize: `${u * 6}px ${u * 6}px` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: scan - h * 0.15, height: h * 0.15, background: 'linear-gradient(180deg, rgba(80,255,200,0), rgba(80,255,200,0.05))' }} />
      <div style={{ position: 'absolute', left: 0, top: h / 2 - (lh * lines.length) / 2, width: w, fontFamily: mono, fontWeight: 700, fontSize: fs, lineHeight: `${lh}px` }}>
        {lines.map((line, li) => (
          <div key={li} style={{ display: 'flex', justifyContent: 'center' }}>
            {Array.from(line).map((ch) => {
              const i = idx++;
              const since = rt - (s.lock[i] ?? 0);
              const isLocked = since >= 0;
              // a lock flashes mint-white and cools over ~0.4 s
              const flash = isLocked ? 1 - smooth(since / 0.45) : 0;
              const near = isLocked ? 0 : clamp(1 - (s.lock[i] - rt) / 0.5);
              const color = isLocked ? `rgb(${Math.round(235 + flash * 20)},${Math.round(245 + flash * 10)},${Math.round(240 + flash * 15)})` : `rgba(80,255,190,${0.35 + near * 0.45})`;
              return (
                <span
                  key={i}
                  style={{
                    width: cw,
                    textAlign: 'center',
                    display: 'inline-block',
                    color,
                    transform: `translateY(${(isLocked ? -flash * fs * 0.06 : 0).toFixed(2)}px) scale(${(1 + flash * 0.12).toFixed(3)})`,
                    textShadow: isLocked
                      ? `0 0 ${fs * (0.08 + flash * 0.5)}px rgba(110,255,200,${0.35 + flash * 0.6})`
                      : `${fs * 0.03}px 0 rgba(255,60,120,0.5), ${-fs * 0.03}px 0 rgba(60,160,255,0.5)`,
                  }}
                >
                  {ch === ' ' ? ' ' : s.shown[i] ?? ch}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      {/* status line + progress */}
      <div style={{ position: 'absolute', left: w / 2 - Math.min(w * 0.7, fs * 6) / 2, width: Math.min(w * 0.7, fs * 6), top: h / 2 + (lh * lines.length) / 2 + u * 4, fontFamily: mono, fontSize: Math.max(10, u * 2.4), color: 'rgba(120,255,200,0.6)', letterSpacing: 1 }}>
        <div style={{ height: 2, background: 'rgba(120,255,200,0.12)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${prog * 100}%`, height: '100%', background: 'linear-gradient(90deg, rgba(80,255,190,0.4), #b9ffe6)', boxShadow: '0 0 8px rgba(120,255,200,0.8)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: u * 1.6 }}>
          <span>{prog < 1 ? 'DECRYPTING' : 'VERIFIED'}</span>
          <span>{`0x${((s.k * 7919 + Math.floor(prog * 255)) & 0xffff).toString(16).padStart(4, '0').toUpperCase()} · ${Math.round(prog * 100)}%`}</span>
        </div>
      </div>
      {/* scanlines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)' }} />
      <button type="button" aria-label="Decrypt the next message" style={{ position: 'absolute', inset: 0, opacity: 0 }} />
    </Stage>
  );
}
