import { useEffect, useRef, useState } from 'react';

/**
 * false during prerendering and until the element comes within `margin` of the
 * viewport; then true for good. Used to build decorative visuals only when the
 * visitor scrolls towards them, so they cost nothing during the initial load.
 */
export function useNearViewport<T extends Element>(margin = '300px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    // inside a sideways swipe row (phones) the cards past the first are clipped by the row,
    // so they would never intersect: watch the row itself and build them all as it comes near
    const row = el.closest<HTMLElement>('.lp-swipe');
    const clipped = !!row && getComputedStyle(row).overflowX !== 'visible';
    io.observe(clipped ? row : el);
    return () => io.disconnect();
  }, [near, margin]);
  return [ref, near] as const;
}
