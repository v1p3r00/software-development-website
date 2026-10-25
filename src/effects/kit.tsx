/**
 * The effects kit: one simulation model for both the live gallery and the Remotion videos.
 *
 * An effect is a pure simulation (init + step) and a view that draws its state.
 *  - live:  stepped by requestAnimationFrame from the real pointer and real clicks,
 *           paused while off screen.
 *  - video: stepped by the Remotion frame number from a scripted pointer. Any frame can be
 *           asked for in any order: the sim re-runs from frame 0 when needed, so every
 *           render tab draws the same picture.
 * Effects also `emit()` sound cues; the videos collect them to place the sound design.
 */
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';

export interface Ptr {
  /** position in the stage, px (top-left origin) */
  x: number;
  y: number;
  /** velocity, px/s */
  vx: number;
  vy: number;
  down: boolean;
  /** the pointer is over the stage (always true while down) */
  over: boolean;
}

export interface Action {
  type: string;
  [k: string]: unknown;
}

export interface Sfx {
  /** sound name, e.g. 'pop', 'click', 'whoosh' */
  name: string;
  /** 0..1 */
  gain?: number;
  /** playback rate (pitch), 1 = original */
  rate?: number;
  /** stereo pan -1..1 */
  pan?: number;
}

export interface Frame {
  /** seconds since the last step (fixed 1/fps in video mode, clamped in live mode) */
  dt: number;
  /** seconds since start */
  t: number;
  p: Ptr;
  /** pointer went down / up during this step */
  pressed: boolean;
  released: boolean;
  /** actions dispatched by the view (live) or the script (video) since the last step */
  actions: Action[];
  w: number;
  h: number;
  /** seeded random 0..1 — use it instead of Math.random so videos are deterministic */
  rand: () => number;
  reduced: boolean;
  live: boolean;
  emit: (s: Sfx) => void;
}

export interface Sim<S> {
  init: (w: number, h: number, rand: () => number) => S;
  step: (s: S, f: Frame) => void;
}

export function defineSim<S>(sim: Sim<S>): Sim<S> {
  return sim;
}

// ───────────────────────────────────────────── video script

export interface PointerKey {
  /** seconds */
  t: number;
  /** 0..1 of the stage */
  x: number;
  y: number;
  down?: boolean;
}

export interface FxScript {
  pointer: PointerKey[];
  actions?: { t: number; action: Action }[];
}

/** smooth pointer path through the keys (eased between keys; `down` holds until the next key) */
export function pointerAt(script: FxScript, t: number): { x: number; y: number; down: boolean } {
  const k = script.pointer;
  if (!k.length) return { x: 0.5, y: 0.5, down: false };
  if (t <= k[0].t) return { x: k[0].x, y: k[0].y, down: !!k[0].down };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (t >= a.t && t < b.t) {
      const u = (t - a.t) / Math.max(1e-6, b.t - a.t);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, down: !!a.down };
    }
  }
  const z = k[k.length - 1];
  return { x: z.x, y: z.y, down: !!z.down };
}

interface VideoCtx {
  mode: 'video';
  frame: number;
  fps: number;
  w: number;
  h: number;
  script: FxScript;
}
type Ctx = { mode: 'live' } | VideoCtx;

export const FxContext = createContext<Ctx>({ mode: 'live' });

/** how touches on the stage behave: 'none' (full screen) or 'pan-y' (cards in a scrolling grid, so the page still scrolls) */
export const FxTouchContext = createContext<'none' | 'pan-y'>('none');

export function FxVideo({ frame, fps, w, h, script, children }: Omit<VideoCtx, 'mode'> & { children: ReactNode }) {
  const v = useMemo<VideoCtx>(() => ({ mode: 'video', frame, fps, w, h, script }), [frame, fps, w, h, script]);
  return <FxContext.Provider value={v}>{children}</FxContext.Provider>;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** a runner that steps a sim; shared by the hook and the offline sound-cue collector */
export function createRunner<S>(sim: Sim<S>, w: number, h: number, live: boolean, reduced = false) {
  const rand = mulberry32(1234567);
  const state = sim.init(w, h, rand);
  const p: Ptr = { x: w / 2, y: h / 2, vx: 0, vy: 0, down: false, over: false };
  let t = 0;
  let wasDown = false;
  return {
    state,
    p,
    get t() {
      return t;
    },
    step(dt: number, nx: number, ny: number, down: boolean, over: boolean, actions: Action[], emit: (s: Sfx) => void, w2 = w, h2 = h) {
      if (dt > 0) {
        p.vx = p.vx * 0.5 + ((nx - p.x) / dt) * 0.5;
        p.vy = p.vy * 0.5 + ((ny - p.y) / dt) * 0.5;
      }
      p.x = nx;
      p.y = ny;
      p.down = down;
      p.over = over || down;
      t += dt;
      sim.step(state, { dt, t, p, pressed: down && !wasDown, released: !down && wasDown, actions, w: w2, h: h2, rand, reduced, live, emit });
      wasDown = down;
    },
  };
}

/** runs a sim over a video script offline and returns every sound cue with its frame */
export function collectCues<S>(sim: Sim<S>, script: FxScript, w: number, h: number, fps: number, frames: number) {
  const r = createRunner(sim, w, h, false);
  const out: (Sfx & { frame: number })[] = [];
  for (let f = 0; f <= frames; f++) {
    const t = f / fps;
    const q = pointerAt(script, t);
    const acts = (script.actions ?? []).filter((a) => a.t > (f - 1) / fps && a.t <= t).map((a) => a.action);
    r.step(f === 0 ? 0 : 1 / fps, q.x * w, q.y * h, q.down, true, acts, (s) => out.push({ ...s, frame: f }));
  }
  return out;
}

const prefersReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface FxHandle<S> {
  ref: RefObject<HTMLDivElement | null>;
  s: S;
  w: number;
  h: number;
  t: number;
  p: Ptr;
  live: boolean;
  dispatch: (a: Action) => void;
}

/**
 * Runs a sim and re-renders the view every step.
 * Put `ref` on the stage element (it should fill its parent: `absolute inset-0` or w/h 100%).
 */
export function useFx<S>(sim: Sim<S>): FxHandle<S> {
  const ctx = useContext(FxContext);
  const ref = useRef<HTMLDivElement | null>(null);
  const [, bump] = useReducer((n: number) => (n + 1) | 0, 0);
  const runner = useRef<ReturnType<typeof createRunner<S>> | null>(null);
  const meta = useRef({ frame: -1, w: 0, h: 0 });
  const queue = useRef<Action[]>([]);

  // ── video: computed synchronously during render
  if (ctx.mode === 'video') {
    const { frame, fps, w, h, script } = ctx;
    const m = meta.current;
    if (!runner.current || m.w !== w || m.h !== h || frame < m.frame || frame > m.frame + 1) {
      runner.current = createRunner(sim, w, h, false);
      m.w = w;
      m.h = h;
      m.frame = -1;
    }
    const r = runner.current;
    for (let f = m.frame + 1; f <= frame; f++) {
      const t = f / fps;
      const q = pointerAt(script, t);
      const acts = (script.actions ?? []).filter((a) => a.t > (f - 1) / fps && a.t <= t).map((a) => a.action);
      r.step(f === 0 ? 0 : 1 / fps, q.x * w, q.y * h, q.down, true, acts, () => {});
    }
    m.frame = frame;
    return { ref, s: r.state, w, h, t: r.t, p: r.p, live: false, dispatch: () => {} };
  }

  // ── live
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLiveLoop(ref, sim, runner, meta, queue, bump);
  const r = runner.current;
  const m = meta.current;
  return {
    ref,
    s: (r?.state ?? (runner.current = createRunner(sim, 360, 360, true)).state) as S,
    w: m.w || 360,
    h: m.h || 360,
    t: r?.t ?? 0,
    p: (r ?? runner.current!).p,
    live: true,
    dispatch: (a) => queue.current.push(a),
  };
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function useLiveLoop<S>(
  ref: RefObject<HTMLDivElement | null>,
  sim: Sim<S>,
  runner: { current: ReturnType<typeof createRunner<S>> | null },
  meta: { current: { frame: number; w: number; h: number } },
  queue: { current: Action[] },
  bump: () => void,
) {
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = prefersReduced();
    let w = el.clientWidth || 360;
    let h = el.clientHeight || 360;
    meta.current.w = w;
    meta.current.h = h;
    runner.current = createRunner(sim, w, h, true, reduced);
    const ptr = { x: w / 2, y: h / 2, down: false, over: false };
    let visible = true;
    let raf = 0;
    let last = 0;
    const local = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      // the stage may be scaled with CSS transforms: map back into its own px
      ptr.x = ((e.clientX - b.left) / (b.width || 1)) * w;
      ptr.y = ((e.clientY - b.top) / (b.height || 1)) * h;
    };
    const onMove = (e: PointerEvent) => {
      local(e);
      ptr.over = true;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea,select,[data-fx-native]')) return;
      local(e);
      ptr.down = true;
      ptr.over = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      wake();
    };
    const onUp = (e: PointerEvent) => {
      local(e);
      ptr.down = false;
      if (e.pointerType !== 'mouse') ptr.over = false;
    };
    const onLeave = () => {
      if (!ptr.down) ptr.over = false;
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', onLeave);
    const tick = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;
      last = now;
      const acts = queue.current.splice(0);
      runner.current!.step(dt, ptr.x, ptr.y, ptr.down, ptr.over, acts, playLive, w, h);
      bump();
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && visible) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) wake();
    });
    io.observe(el);
    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth || w;
      const nh = el.clientHeight || h;
      if (Math.abs(nw - w) > 1 || Math.abs(nh - h) > 1) {
        // a new size starts the sim again so layouts stay correct
        ptr.x = (ptr.x / w) * nw;
        ptr.y = (ptr.y / h) * nh;
        w = nw;
        h = nh;
        meta.current.w = w;
        meta.current.h = h;
        runner.current = createRunner(sim, w, h, true, reduced);
        bump();
      }
    });
    ro.observe(el);
    const onVis = () => wake();
    document.addEventListener('visibilitychange', onVis);
    wake();
    bump();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);
}

// ───────────────────────────────────────────── live sound (tiny WebAudio synth, opt-in)

let audioOn = false;
let ac: AudioContext | null = null;
export function setFxSound(on: boolean) {
  audioOn = on;
  if (on && !ac && typeof AudioContext !== 'undefined') ac = new AudioContext();
  void ac?.resume();
}
export function fxSoundOn() {
  return audioOn;
}

/** short procedural UI sounds for the live gallery (the videos use rendered WAVs instead) */
function playLive(s: Sfx) {
  if (!audioOn || !ac) return;
  const now = ac.currentTime;
  const g = ac.createGain();
  const gain = Math.min(1, s.gain ?? 0.6) * 0.35;
  const rate = s.rate ?? 1;
  const pan = ac.createStereoPanner();
  pan.pan.value = s.pan ?? 0;
  g.connect(pan).connect(ac.destination);
  const noise = (dur: number, f: number, q: number, type: BiquadFilterType = 'bandpass') => {
    const b = ac!.createBuffer(1, Math.max(1, Math.floor(ac!.sampleRate * dur)), ac!.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = ac!.createBufferSource();
    src.buffer = b;
    const bq = ac!.createBiquadFilter();
    bq.type = type;
    bq.frequency.value = f;
    bq.Q.value = q;
    src.connect(bq).connect(g);
    src.start(now);
  };
  const tone = (f0: number, f1: number, dur: number, type: OscillatorType = 'sine') => {
    const o = ac!.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0 * rate, now);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1 * rate), now + dur);
    o.connect(g);
    o.start(now);
    o.stop(now + dur + 0.02);
  };
  g.gain.setValueAtTime(gain, now);
  switch (s.name) {
    case 'pop':
      tone(520, 160, 0.07);
      noise(0.05, 1800, 1.2);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      break;
    case 'click':
    case 'tick':
      noise(0.025, 3800, 2);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      break;
    case 'whoosh':
      noise(0.35, 900, 0.7);
      g.gain.setValueAtTime(0.001, now);
      g.gain.exponentialRampToValueAtTime(gain, now + 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      break;
    case 'chime':
    case 'success':
      tone(880, 880, 0.5);
      tone(1320, 1320, 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      break;
    case 'thud':
      tone(140, 50, 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      break;
    case 'error':
      tone(220, 180, 0.18, 'square');
      g.gain.setValueAtTime(gain * 0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      break;
    default:
      tone(600, 400, 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  }
}

// ───────────────────────────────────────────── math helpers

export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
/** frame-rate independent exponential approach: k ≈ how fast (1/s) */
export const approach = (cur: number, target: number, k: number, dt: number) => target + (cur - target) * Math.exp(-k * dt);

/** a damped spring (semi-implicit Euler, sub-stepped for stability) */
export interface Spring {
  x: number;
  v: number;
}
export function spring(s: Spring, target: number, stiffness: number, damping: number, dt: number) {
  const n = Math.max(1, Math.ceil(dt / (1 / 240)));
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    s.v += (-(s.x - target) * stiffness - s.v * damping) * h;
    s.x += s.v * h;
  }
}
export const sp = (x = 0): Spring => ({ x, v: 0 });

/** the stage element every effect renders into */
export function Stage({
  fx,
  className = '',
  style,
  children,
  cursor = 'default',
}: {
  fx: { ref: RefObject<HTMLDivElement | null> };
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  cursor?: CSSProperties['cursor'];
}) {
  const touch = useContext(FxTouchContext);
  return (
    <div
      ref={fx.ref}
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: touch, userSelect: 'none', WebkitUserSelect: 'none', cursor, ...style }}
    >
      {children}
    </div>
  );
}
