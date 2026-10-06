import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/** Shared building blocks for the landing pages: cheap, compositor-only motion. */

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Marks every `[data-reveal]` inside `root` with `data-in` once it scrolls into view.
 * The page's CSS decides what the reveal looks like; `--d` on an element staggers it.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach((i) => i.setAttribute('data-in', ''));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', '');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [root]);
}

/** true once the element has been on screen */
export function useInView<T extends HTMLElement>(threshold = 0.3): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

/** counts from 0 to `to` with an ease-out once `run` turns true */
export function useCountUp(to: number, run: boolean, ms = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reducedMotion()) {
      setV(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setV(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, ms]);
  return v;
}

/**
 * Pointer tilt for one element: writes --rx / --ry / --mx / --my on it from a single rAF,
 * only while the pointer is over `area`, and eases back to rest when it leaves.
 */
export function usePointerTilt(area: RefObject<HTMLElement | null>, target: RefObject<HTMLElement | null>, max = 14) {
  useEffect(() => {
    const a = area.current;
    const el = target.current;
    if (!a || !el || reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const loop = () => {
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-y * max * 0.8).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(50 + x * 50).toFixed(1)}%`);
      el.style.setProperty('--my', `${(50 + y * 50).toFixed(1)}%`);
      if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.4)));
      kick();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    a.addEventListener('pointermove', move);
    a.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      a.removeEventListener('pointermove', move);
      a.removeEventListener('pointerleave', leave);
    };
  }, [area, target, max]);
}

/** true once the page has scrolled past `y` */
export function useScrolledPast(y = 24) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const on = () => setPast(window.scrollY > y);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [y]);
  return past;
}

/** a short-lived message; returns [message, show] */
export function useToast(ms = 3200): [string, (msg: string) => void] {
  const [msg, setMsg] = useState('');
  const timer = useRef(0);
  const show = (m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(''), ms);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return [msg, show];
}

/** scrolls to an in-page anchor of the landing page without touching the URL */
export function jump(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
}
