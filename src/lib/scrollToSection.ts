import { scrollBehavior } from './motion';

/**
 * Scrolls to a home-page section. The home page is lazy-loaded, so after a route change
 * the target may not exist yet: keep looking for it for a couple of seconds.
 */
export function scrollToSection(id: string, smooth = true) {
  const behavior = smooth ? scrollBehavior() : 'auto';
  const go = () => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior });
      return true;
    }
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior, block: 'start' });
    return true;
  };
  if (go()) return;
  const started = performance.now();
  const tick = () => {
    if (go() || performance.now() - started > 2500) return;
    window.setTimeout(tick, 50);
  };
  window.setTimeout(tick, 50);
}
