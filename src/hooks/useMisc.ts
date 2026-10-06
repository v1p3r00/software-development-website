import { useEffect, useRef, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function useIsCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCoarse(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return coarse;
}

/* ---- one shared, frame-batched scroll listener ----
   Every scroll-driven widget subscribes here instead of adding its own
   window listener; the callbacks run at most once per animation frame. */
type ScrollSub = () => void;
const scrollSubs = new Set<ScrollSub>();
let scrollQueued = false;
const flushScroll = () => {
  scrollQueued = false;
  scrollSubs.forEach((fn) => fn());
};
const queueScroll = () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(flushScroll);
};

/** Subscribe to scroll + resize, batched to one call per frame. Runs once on subscribe. */
export function subscribeScroll(fn: ScrollSub): () => void {
  if (scrollSubs.size === 0) {
    window.addEventListener('scroll', queueScroll, { passive: true });
    window.addEventListener('resize', queueScroll, { passive: true });
  }
  scrollSubs.add(fn);
  fn();
  return () => {
    scrollSubs.delete(fn);
    if (scrollSubs.size === 0) {
      window.removeEventListener('scroll', queueScroll);
      window.removeEventListener('resize', queueScroll);
    }
  };
}

/** Runs `fn` on scroll/resize, once per frame at most. Keep `fn` cheap; set state only on change. */
export function useScrollFrame(fn: ScrollSub, deps: readonly unknown[] = []) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    return subscribeScroll(() => ref.current());
  }, deps);
}

/* ---- active section: computed once per frame, shared by every reader ---- */
const sectionStores = new Map<string, { value: string; subs: Set<(v: string) => void>; stop?: () => void }>();

function computeActive(ids: readonly string[]) {
  const probe = window.innerHeight * 0.35;
  let current = ids[0];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= probe) current = id;
    else break; // sections are in page order: the rest are further down
  }
  return current;
}

/** Tracks which section id is currently in view. */
export function useActiveSection(ids: readonly string[], enabled = true): string {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!enabled) return;
    const key = ids.join('|');
    let store = sectionStores.get(key);
    if (!store) {
      const created = { value: ids[0], subs: new Set<(v: string) => void>() } as {
        value: string;
        subs: Set<(v: string) => void>;
        stop?: () => void;
      };
      created.stop = subscribeScroll(() => {
        const next = computeActive(ids);
        if (next === created.value) return;
        created.value = next;
        created.subs.forEach((fn) => fn(next));
      });
      sectionStores.set(key, created);
      store = created;
    }
    const s = store;
    s.subs.add(setActive);
    setActive(s.value);
    return () => {
      s.subs.delete(setActive);
      if (s.subs.size === 0) {
        s.stop?.();
        sectionStores.delete(key);
      }
    };
  }, [ids, enabled]);
  return active;
}

/** Scroll progress 0..1, written to the element via a callback (no React render per scroll). */
export function scrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, window.scrollY / max) : 0;
}

/** Counts up to `target` once the element enters the viewport. */
export function useCountUp(target: number, duration = 1100, enabled = true) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let started = false;
    const start_ = () => {
      if (started) return;
      started = true;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(target * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start_();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    // safety net: never leave the counter sitting at zero
    const fallback = window.setTimeout(start_, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
      cancelAnimationFrame(frame);
    };
  }, [target, duration, enabled]);

  return { ref, value };
}

export function useLocalClock(timeZone: string): string {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone,
        }).format(new Date()),
      );
    update();
    const id = window.setInterval(() => !document.hidden && update(), 15_000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', update);
    };
  }, [timeZone]);
  return time;
}
