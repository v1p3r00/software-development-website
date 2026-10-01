/**
 * Page transitions on top of the View Transitions API.
 *
 *  'slide'    — going to the articles index: the current page dissolves and the
 *               new one slides in from the right.
 *  'expand'   — opening an article: the clicked card (frame and picture) grows into
 *               the article's header while the rest of the page cross-dissolves.
 *  'collapse' — back to the index from an article: the reverse, into its card.
 *
 * The keyframes live in index.css under html[data-vt=…]. Browsers without the API,
 * or with reduced motion on, just navigate.
 */
import { useCallback, useLayoutEffect } from 'react';
import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type TransitionKind = 'slide' | 'expand' | 'collapse';

interface Options {
  /** element the 'expand' grows out of (gets .vt-source while the transition is captured) */
  source?: Element | null;
  /** load what the next page needs first, so it never shows a loading state mid-transition */
  prepare?: () => Promise<unknown>;
  /** for 'collapse': the article whose card the page shrinks into */
  slug?: string;
}

let onCommit: (() => void) | null = null;
let collapseSlug: string | null = null;

/** the card the index should mark as the collapse target (read while it renders) */
export const collapseTarget = () => collapseSlug;

const supported = () =>
  typeof document !== 'undefined' &&
  'startViewTransition' in document &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resolves a pending transition once the new route has committed. Use once, inside the router. */
export function useRouteCommitSignal() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    onCommit?.();
  }, [key]);
}

export function usePageTransition() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const go = useCallback(
    async (to: string, kind: TransitionKind, opts: Options = {}) => {
      const target = to.split(/[?#]/)[0];
      if (!supported() || target === pathname) {
        navigate(to);
        return;
      }
      await opts.prepare?.().catch(() => undefined);

      const root = document.documentElement;
      root.dataset.vt = kind;
      opts.source?.classList.add('vt-source');
      collapseSlug = kind === 'collapse' ? (opts.slug ?? null) : null;

      const vt = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const done = () => {
              onCommit = null;
              // a new page starts at the top; going back, the target card is brought into view
              const card = kind === 'collapse' ? document.querySelector('.vt-source') : null;
              if (card) card.scrollIntoView({ block: 'center', behavior: 'instant' });
              else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              resolve();
            };
            onCommit = done;
            navigate(to);
            window.setTimeout(() => onCommit === done && done(), 1000);
          }),
      );
      vt.finished.finally(() => {
        delete root.dataset.vt;
        opts.source?.classList.remove('vt-source');
        collapseSlug = null;
      });
    },
    [navigate, pathname],
  );

  /** onClick for a <Link>: keeps ctrl/cmd/middle-click (new tab) working */
  const link = useCallback(
    (to: string, kind: TransitionKind, opts: Options | ((el: HTMLElement) => Options) = {}) =>
      (e: MouseEvent<HTMLElement>) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        void go(to, kind, typeof opts === 'function' ? opts(e.currentTarget) : opts);
      },
    [go],
  );

  return { go, link };
}
