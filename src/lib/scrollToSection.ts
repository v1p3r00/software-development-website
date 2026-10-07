import { scrollBehavior } from './motion';

/**
 * Scrolls to a home-page section. The home page is lazy-loaded, so after a route change
 * the target may not exist yet: keep looking for it for a few seconds (the sections below the hero are their own chunk).
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
    // a section can mark a block that must be fully in view on arrival (e.g. the contact form):
    // land with the section heading just under the site header, and only scroll further
    // (never past the block's top) when the block would otherwise be cut off at the bottom
    const must = el.querySelector<HTMLElement>(`[data-scroll-target="${id}"]`);
    if (must) {
      const header = document.querySelector('header')?.getBoundingClientRect().height ?? 64;
      const heading = (el.firstElementChild as HTMLElement | null) ?? el;
      const y0 = window.scrollY;
      const headingTop = heading.getBoundingClientRect().top + y0 - header - 16;
      const box = must.getBoundingClientRect();
      const mustTop = box.top + y0 - header - 12;
      const mustBottom = box.bottom + y0 + 16;
      const top = Math.min(Math.max(headingTop, mustBottom - window.innerHeight), mustTop);
      window.scrollTo({ top: Math.max(0, top), behavior });
      return true;
    }
    el.scrollIntoView({ behavior, block: 'start' });
    return true;
  };
  if (go()) return;
  const started = performance.now();
  const tick = () => {
    if (go() || performance.now() - started > 6000) return;
    window.setTimeout(tick, 50);
  };
  window.setTimeout(tick, 50);
}
