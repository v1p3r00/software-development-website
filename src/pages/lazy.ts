import { createElement, lazy, useState } from 'react';
import type { ComponentType } from 'react';

/**
 * React.lazy with a preload(): once preloaded, the page renders straight away
 * instead of suspending for a frame — a page transition can then capture the real
 * page rather than the loading placeholder.
 */
function lazyPage(load: () => Promise<{ default: ComponentType }>) {
  let Loaded: ComponentType | null = null;
  let pending: Promise<void> | null = null;
  const preload = () =>
    (pending ??= load().then((m) => {
      Loaded = m.default;
    }));
  const Lazy = lazy(() => preload().then(() => ({ default: Loaded as ComponentType })));
  function Page() {
    // fixed per mount, so a later preload doesn't swap the component type under React
    const [C] = useState<ComponentType>(() => Loaded ?? Lazy);
    return createElement(C);
  }
  return Object.assign(Page, { preload });
}

// the article pages (and the Markdown renderer) load only when visited
export const ArticlesPage = lazyPage(() => import('./Articles'));
export const ArticlePage = lazyPage(() => import('./Article'));
