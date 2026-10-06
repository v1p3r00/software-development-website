/**
 * Pauses every endlessly repeating CSS animation while its element is off screen.
 *
 * Infinite animations (marquees, glows, pulsing dots, drifting orbs) keep the
 * compositor — and often the painter — busy even when nobody can see them.
 * This scans a subtree once, in idle time, for elements whose own box or
 * ::before / ::after runs an infinite animation, and toggles
 * `data-offscreen` on them with an IntersectionObserver; the CSS rule
 * `[data-offscreen]` then sets `animation-play-state: paused`.
 *
 * Returns a cleanup function.
 */
export function pauseOffscreenAnimations(root: Element): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.removeAttribute('data-offscreen');
        else e.target.setAttribute('data-offscreen', '');
      }
    },
    { rootMargin: '120px 0px' },
  );

  const runsForever = (el: Element, pseudo?: string) => {
    const cs = getComputedStyle(el, pseudo);
    return cs.animationName !== 'none' && cs.animationIterationCount.includes('infinite');
  };

  const all = root.querySelectorAll('*');
  let i = 0;
  let handle = 0;
  const canIdle = typeof window.requestIdleCallback === 'function';

  const scan = (deadline?: IdleDeadline) => {
    const until = performance.now() + 8;
    while (i < all.length) {
      const el = all[i++];
      if (runsForever(el) || runsForever(el, '::before') || runsForever(el, '::after')) io.observe(el);
      if (deadline ? deadline.timeRemaining() < 1 : performance.now() > until) break;
    }
    if (i < all.length) handle = canIdle ? window.requestIdleCallback(scan) : window.setTimeout(scan, 16);
  };
  handle = canIdle ? window.requestIdleCallback(scan, { timeout: 1500 }) : window.setTimeout(scan, 200);

  return () => {
    if (canIdle) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
    io.disconnect();
    for (const el of root.querySelectorAll('[data-offscreen]')) el.removeAttribute('data-offscreen');
  };
}
