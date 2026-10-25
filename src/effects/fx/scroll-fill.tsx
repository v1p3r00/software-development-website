import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { defineSim, useFx, Stage, clamp, lerp } from '../kit';

/**
 * A manifesto that lights up as you read it. The stage is a little scroll view: drag it (with
 * momentum and rubber-band edges) or use the wheel; words fill with colour from left to right
 * as their line crosses the reading line, and key words get a highlighter swipe.
 * Left alone, it scrolls itself and rewinds at the end.
 */

const TEXT =
  'Great interfaces are *felt* before they are understood. Every pixel of *motion* tells a story — of weight, of intent, of *care*. When a word lights up as you read it, the page is *reading* with you. This is the craft: small *physics*, honest light, and timing that breathes. Build things people want to *touch.* Then make them move like they *mean* it.';

interface Word {
  t: string;
  key: boolean;
  line: number;
  idx: number; // index within its line
}

/** wrap with an estimated advance so the sim and the view agree on lines without measuring */
function layout(w: number, h: number) {
  const m = Math.min(w, h);
  const fs = Math.max(20, Math.min(m * 0.085, w * 0.075));
  const width = Math.min(w * 0.84, m * 1.45);
  const lh = fs * 1.22;
  const em = fs * 0.6; // generous average advance for a heavy grotesk
  const words: Word[] = [];
  const counts: number[] = [];
  let line = 0;
  let x = 0;
  for (const raw of TEXT.split(' ')) {
    const key = raw.includes('*');
    const t = raw.replace(/\*/g, '');
    const ww = t.length * em;
    if (x > 0 && x + ww > width) {
      line++;
      x = 0;
    }
    counts[line] = (counts[line] ?? 0) + 1;
    words.push({ t, key, line, idx: counts[line] - 1 });
    x += ww + em * 0.5;
  }
  const top = h * 0.5; // the text starts below the reading line
  const contentH = top + (line + 1) * lh + h * 0.45;
  return { fs, width, lh, words, counts, lines: line + 1, top, contentH, readY: h * 0.56, x0: (w - width) / 2 };
}

interface S {
  y: number; // scroll offset, px
  v: number;
  drag: boolean;
  py: number;
  idle: number;
  rewind: number; // > 0 while the self-demo rewinds
  pause: number;
  lit: number; // key words already lit (for the chime)
}

export const sim = defineSim<S>({
  init: () => ({ y: 0, v: 0, drag: false, py: 0, idle: 0, rewind: 0, pause: 0, lit: 0 }),
  step(s, f) {
    const L = layout(f.w, f.h);
    const max = Math.max(0, L.contentH - f.h);
    s.idle = f.p.down || Math.abs(f.p.vx) + Math.abs(f.p.vy) > 20 ? 0 : s.idle + f.dt;
    for (const a of f.actions)
      if (a.type === 'wheel') {
        s.v += (a.dy as number) * 3.5;
        s.v = clamp(s.v, -f.h * 6, f.h * 6);
        s.idle = 0;
        s.rewind = 0;
      }
    if (f.pressed) {
      s.drag = true;
      s.py = f.p.y;
      s.v = 0;
      s.rewind = 0;
    }
    if (s.drag) {
      // 1:1 with the finger, but heavier past the ends (rubber band)
      const d = s.py - f.p.y;
      s.py = f.p.y;
      const over = s.y < 0 ? -s.y : s.y > max ? s.y - max : 0;
      s.y += d * (over > 0 ? 0.35 / (1 + over / (f.h * 0.15)) : 1);
      s.v = lerp(s.v, d / Math.max(f.dt, 1e-3), 0.4);
      if (!f.p.down) s.drag = false;
    } else {
      if (s.idle > 1.6) {
        // self-demo: a calm reading speed, a beat at the end, then a quick rewind
        if (s.rewind > 0) {
          s.rewind -= f.dt;
          s.v = (0 - s.y) * 5;
        } else if (s.y >= max - 1) {
          s.pause += f.dt;
          s.v = 0;
          if (s.pause > 0.9) {
            s.rewind = 1.2;
            s.pause = 0;
            f.emit({ name: 'whoosh', gain: 0.35, rate: 1.2 });
          }
        } else s.v = lerp(s.v, L.lh * 1.4, 1 - Math.exp(-3 * f.dt));
      }
      s.y += s.v * f.dt;
      s.v *= Math.exp(-(s.idle > 1.6 ? 0 : 2.6) * f.dt);
      // edges pull back like a spring
      if (s.y < 0 || s.y > max) {
        const edge = s.y < 0 ? 0 : max;
        s.v += (edge - s.y) * 140 * f.dt;
        s.v *= Math.exp(-18 * f.dt);
        if (Math.abs(s.y - edge) < 0.3 && Math.abs(s.v) < 5) {
          s.y = edge;
          s.v = 0;
        }
      }
    }
    // count key words whose line has been read past the word
    let lit = 0;
    for (const w of L.words) {
      if (!w.key) continue;
      const lineTop = L.top + w.line * L.lh - s.y;
      const lp = clamp((L.readY - lineTop) / L.lh);
      if (lp * L.counts[w.line] - w.idx >= 1) lit++;
    }
    if (lit > s.lit) f.emit({ name: 'ding', gain: 0.25, rate: 1 + lit * 0.08 });
    s.lit = lit;
  },
});

const KEYS = ['#ff6b8b', '#ffb547', '#7cf2c4', '#7aa8ff', '#c38bff', '#ff8a5c', '#5ce1ff'];

export default function ScrollFill() {
  const fx = useFx(sim);
  const { s, w, h } = fx;
  const ref = useRef<HTMLCanvasElement | null>(null);
  const dpr = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  const [, setFonts] = useState(0);
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => live && setFonts(1));
    return () => {
      live = false;
    };
  }, []);

  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    const L = layout(w, h);
    const m = Math.min(w, h);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // background: deep ink with a soft glow at the reading line
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0b0b12');
    bg.addColorStop(1, '#08080d');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    const glow = g.createRadialGradient(w / 2, L.readY, 0, w / 2, L.readY, Math.max(w, h) * 0.6);
    glow.addColorStop(0, 'rgba(120,90,255,0.12)');
    glow.addColorStop(1, 'rgba(120,90,255,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, w, h);
    g.font = `850 ${L.fs}px 'Archivo Variable', Archivo, system-ui, sans-serif`;
    g.textBaseline = 'alphabetic';
    const space = g.measureText(' ').width;
    const fill = g.createLinearGradient(L.x0, 0, L.x0 + L.width, 0);
    fill.addColorStop(0, '#ffffff');
    fill.addColorStop(1, '#e9e3ff');
    let line = -1;
    let x = 0;
    let key = 0;
    for (const wd of L.words) {
      if (wd.line !== line) {
        line = wd.line;
        x = L.x0;
      }
      const tw = g.measureText(wd.t).width;
      const base = L.top + wd.line * L.lh - s.y + L.fs;
      if (base > -L.lh && base < h + L.lh) {
        const lineTop = base - L.fs;
        const lp = clamp((L.readY - lineTop) / L.lh);
        const p = clamp(lp * L.counts[wd.line] - wd.idx);
        // a filling word lifts a hair
        const y = base - Math.sin(p * Math.PI) * L.fs * 0.06;
        const col = wd.key ? KEYS[key % KEYS.length] : '';
        if (wd.key && p > 0) {
          // highlighter swipe behind key words
          g.fillStyle = col;
          g.globalAlpha = 0.22;
          g.beginPath();
          g.roundRect(x - L.fs * 0.08, y - L.fs * 0.78, (tw + L.fs * 0.16) * p, L.fs * 0.95, L.fs * 0.12);
          g.fill();
          g.globalAlpha = 1;
        }
        g.fillStyle = '#26252f';
        g.fillText(wd.t, x, y);
        if (p > 0) {
          g.save();
          g.beginPath();
          g.rect(x - 2, y - L.fs, tw * p + 2, L.fs * 1.4);
          g.clip();
          g.fillStyle = wd.key ? col : fill;
          if (wd.key) {
            g.shadowColor = col;
            g.shadowBlur = L.fs * 0.35;
          }
          g.fillText(wd.t, x, y);
          g.restore();
        }
      }
      if (wd.key) key++;
      x += tw + space;
    }
    // fade the top and bottom edges
    const fadeH = h * 0.18;
    const ft = g.createLinearGradient(0, 0, 0, fadeH);
    ft.addColorStop(0, 'rgba(11,11,18,1)');
    ft.addColorStop(1, 'rgba(11,11,18,0)');
    g.fillStyle = ft;
    g.fillRect(0, 0, w, fadeH);
    const fb = g.createLinearGradient(0, h - fadeH, 0, h);
    fb.addColorStop(0, 'rgba(8,8,13,0)');
    fb.addColorStop(1, 'rgba(8,8,13,1)');
    g.fillStyle = fb;
    g.fillRect(0, h - fadeH, w, fadeH);
    // scroll indicator
    const max = Math.max(1, L.contentH - h);
    const trackH = h * 0.5;
    const thumbH = Math.max(m * 0.05, trackH * (h / L.contentH));
    const ty = h * 0.25 + (trackH - thumbH) * clamp(s.y / max);
    g.fillStyle = 'rgba(255,255,255,0.08)';
    g.beginPath();
    g.roundRect(w - m * 0.04, h * 0.25, m * 0.008, trackH, m * 0.004);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.beginPath();
    g.roundRect(w - m * 0.04, ty, m * 0.008, thumbH, m * 0.004);
    g.fill();
    g.font = `600 ${Math.max(10, m * 0.024)}px 'JetBrains Mono Variable', monospace`;
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillText(`${String(Math.round(clamp(s.y / max) * 100)).padStart(3, '0')}%`, m * 0.05, h - m * 0.05);
  });

  return (
    <Stage fx={fx} cursor={s.drag ? 'grabbing' : 'grab'} style={{ background: '#0b0b12' }}>
      <div
        role="region"
        aria-label="Manifesto"
        style={{ position: 'absolute', inset: 0 }}
        onWheel={(e) => fx.dispatch({ type: 'wheel', dy: e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY })}
      >
        <canvas ref={ref} width={Math.round(w * dpr)} height={Math.round(h * dpr)} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
        <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>{TEXT.replace(/\*/g, '')}</p>
      </div>
    </Stage>
  );
}
