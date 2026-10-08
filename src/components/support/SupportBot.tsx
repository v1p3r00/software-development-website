import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { stripLang } from '../../i18n/paths';
import { isLandingStage } from '../../data/landings';
import { cx } from '../ui';
import { TEXT } from './text';
import { SUPPORT_EVENT } from './open';
import type { SupportRequest } from './open';
import './support.css';

// the conversation (and the site index it searches) is only fetched on the first open
const loadPanel = () => import('./SupportPanel');
const SupportPanel = lazy(loadPanel);

const TEASER_KEY = 'dm.support.teaser';
/** set once the visitor has opened the chat: the "1 new message" badge stays until then */
const SEEN_KEY = 'dm.support.seen';
const OPEN_KEY = 'dm.support.open';

/** pages that are full-screen tools: the button would sit on top of their controls */
export function supportHidden(path: string) {
  const p = path.endsWith('/') ? path : `${path}/`;
  return (
    isLandingStage(path) ||
    ['/garage-designer/', '/shirt-designer/', '/camera-study/', '/cv-maker/'].some((x) => p.startsWith(x)) ||
    /^\/course\/[^/]+\//.test(p) ||
    /^\/interview\/[^/]+\//.test(p)
  );
}

const session = {
  get: (k: string) => {
    try {
      return window.sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      window.sessionStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
};

/**
 * The round button in the bottom-right corner, its one-time teaser bubble and the chat
 * panel. The panel stays mounted once opened, so the conversation survives closing it
 * and moving between pages.
 */
export default function SupportBot() {
  const { lang } = useI18n();
  const T = TEXT[lang];
  const path = stripLang(useLocation().pathname);
  const hidden = supportHidden(path);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [unread, setUnread] = useState(false);

  // the greeting waits as "1 new message" until the chat is first opened
  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem(SEEN_KEY);
    } catch {
      /* ignore */
    }
    if (seen) return;
    const id = window.setTimeout(() => setUnread(true), 3500);
    return () => window.clearTimeout(id);
  }, []);

  // reopen after a reload if it was open
  useEffect(() => {
    if (session.get(OPEN_KEY) === '1') {
      setMounted(true);
      setOpen(true);
    }
  }, []);
  useEffect(() => session.set(OPEN_KEY, open ? '1' : '0'), [open]);

  // a single teaser per visit, after the visitor has looked around a little
  useEffect(() => {
    if (hidden || mounted) return;
    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem(TEASER_KEY);
    } catch {
      /* ignore */
    }
    if (seen) return;
    const id = window.setTimeout(() => setTeaser(true), 25000);
    return () => window.clearTimeout(id);
  }, [hidden, mounted]);
  const dismissTeaser = useCallback(() => {
    setTeaser(false);
    try {
      window.localStorage.setItem(TEASER_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, []);

  // warm the panel up in idle time, so the first open is instant
  useEffect(() => {
    const id = window.setTimeout(() => void loadPanel(), 9000);
    return () => window.clearTimeout(id);
  }, []);

  const toggle = () => {
    dismissTeaser();
    if (unread) {
      setUnread(false);
      try {
        window.localStorage.setItem(SEEN_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    }
    setMounted(true);
    setOpen((v) => !v);
  };
  const close = useCallback(() => setOpen(false), []);

  // other parts of the site can open the chat, e.g. a "Start a project" button
  const [request, setRequest] = useState<{ n: number; interest?: string } | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<SupportRequest>).detail ?? {};
      setMounted(true);
      setOpen(true);
      setUnread(false);
      setRequest((r) => ({ n: (r?.n ?? 0) + 1, interest: d.interest }));
    };
    window.addEventListener(SUPPORT_EVENT, on);
    return () => window.removeEventListener(SUPPORT_EVENT, on);
  }, []);

  if (hidden) return null;
  return (
    <>
      {teaser && !open && (
        <div className="support-teaser fixed bottom-5 right-[84px] z-[45] w-[250px] border border-line-strong bg-bg p-3 pr-8 shadow-lg sm:bottom-6 sm:right-[92px]" role="status">
          <button type="button" onClick={toggle} className="text-left text-[13px] leading-snug text-text" data-cursor="follow">
            {T.teaser}
          </button>
          <button type="button" onClick={dismissTeaser} aria-label={T.teaserClose} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center text-muted hover:text-accent" data-cursor="follow">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
          <i aria-hidden className="absolute -right-[7px] bottom-5 h-3 w-3 -rotate-45 border-b border-r border-line-strong bg-bg" />
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        onPointerEnter={() => void loadPanel()}
        aria-expanded={open}
        aria-label={open ? T.close : unread ? `${T.launcher} · ${T.unread}` : T.launcher}
        title={open ? T.close : T.launcher}
        data-cursor="follow"
        className={cx(
          'support-launcher group fixed bottom-5 right-5 z-[45] grid h-14 w-14 place-items-center rounded-full border bg-surface text-text shadow-lg transition-[transform,border-color] duration-300 ease-tech hover:-translate-y-0.5 hover:border-accent sm:bottom-6 sm:right-6',
          open ? 'border-accent' : 'border-line-strong',
          open && 'max-sm:hidden',
        )}
      >
        {open ? (
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M4 5.5h16v10H9.5L5.5 19v-3.5H4z" strokeLinejoin="round" />
            <path d="M8 9.5l2 1.5-2 1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path className="support-caret" d="M12.5 12.5h3.5" strokeLinecap="round" />
          </svg>
        )}
        {unread && !open ? (
          <>
            {/* "1 new message" */}
            <span aria-hidden className="support-ping absolute -right-1 -top-1 h-5 w-5 rounded-full bg-accent" />
            <span aria-hidden className="support-badge absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-bg bg-accent px-1 font-mono text-[10.5px] font-bold leading-none text-onaccent">
              1
            </span>
          </>
        ) : (
          <i aria-hidden className="absolute right-[7px] top-[7px] h-2 w-2 bg-accent" />
        )}
      </button>

      {mounted && (
        <Suspense fallback={null}>
          <SupportPanel open={open} onClose={close} request={request} />
        </Suspense>
      )}
    </>
  );
}
