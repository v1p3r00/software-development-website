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

/** Tracks which section id is currently in view. */
export function useActiveSection(ids: readonly string[], enabled = true): string {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => {
      const probe = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= probe) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids, enabled]);
  return active;
}

export function useScrollProgress(): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return p;
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
    const id = window.setInterval(update, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return time;
}
