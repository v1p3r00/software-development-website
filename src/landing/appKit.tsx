import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { reducedMotion } from './kit';
import './appKit.css';

/**
 * Phone "app mode" for the landing pages. On a phone each landing page behaves like
 * the brand's own app rather than a narrow website:
 *
 *   ┌──────────────────┐  a compact top bar (the page's own header, slimmed down)
 *   │                  │
 *   │  content, with   │  card lists become sideways swipe rows (.lp-swipe),
 *   │  swipe rows and  │  long forms open as bottom sheets (<AppSheet>)
 *   │  bottom sheets   │
 *   │                  │
 *   ├──────────────────┤
 *   │ ⌂  ▤  ◎  ☰  [●]  │  a bottom tab bar: four destinations + the main action
 *   └──────────────────┘
 *
 * Everything here renders or applies at ≤767px only; the desktop pages are untouched.
 * Colours come from CSS variables the page sets on its root (see appKit.css):
 * --app-bg, --app-fg, --app-dim, --app-accent, --app-on-accent, --app-line, --app-font.
 */

export const PHONE_QUERY = '(max-width: 767px)';

/** true on phone-sized screens (false during the prerender and on larger screens) */
export function useLandingPhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return phone;
}

export interface AppTab {
  /** the id of the section this tab scrolls to */
  id: string;
  label: string;
  icon: ReactNode;
}

/** scrolls to a section, leaving room for a sticky top bar */
export function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 8;
  window.scrollTo({ top: id === 'top' ? 0 : top, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

/** which of the given sections is on screen (the last one whose top passed 40% of the viewport) */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, [ids.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

/**
 * The bottom tab bar (phones only). Four tabs scroll to their sections and light up
 * while you are in them; the raised action button on the right is the page's main
 * call to action (book, buy, reserve…).
 */
export function AppTabBar({
  tabs,
  action,
  style,
  onSelect = goToSection,
  className = '',
}: {
  tabs: AppTab[];
  action?: { label: string; icon: ReactNode; onClick: () => void };
  style?: CSSProperties;
  /** how a tab reaches its section (default: goToSection) */
  onSelect?: (id: string) => void;
  /** extra class on the bar, for a page's own styling */
  className?: string;
}) {
  const phone = useLandingPhone();
  const active = useActiveSection(tabs.map((t) => t.id));
  useEffect(() => {
    if (!phone) return;
    document.documentElement.classList.add('lp-app');
    return () => document.documentElement.classList.remove('lp-app');
  }, [phone]);
  if (!phone) return null;
  return (
    <>
      <div className="lp-tabbar-space" aria-hidden />
      <nav className={`lp-tabbar${className ? ` ${className}` : ''}`} style={style} aria-label="App">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`lp-tab${active === t.id ? ' is-on' : ''}`}
            aria-current={active === t.id ? 'true' : undefined}
            onClick={() => onSelect(t.id)}
          >
            <span className="lp-tab-icon">{t.icon}</span>
            <span className="lp-tab-label">{t.label}</span>
          </button>
        ))}
        {action && (
          <button type="button" className="lp-tab-action" onClick={action.onClick}>
            <span className="lp-tab-action-icon">{action.icon}</span>
            <span className="lp-tab-label">{action.label}</span>
          </button>
        )}
      </nav>
    </>
  );
}

/**
 * A sheet that slides up from the bottom (phones) or shows as a centred dialog (larger
 * screens). Swipe its handle down, tap outside or press Escape to close.
 */
export function AppSheet({
  open,
  title,
  onClose,
  children,
  closeLabel = 'Close',
  style,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
  style?: CSSProperties;
}) {
  const startY = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.documentElement.classList.add('lp-sheet-open');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('lp-sheet-open');
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="lp-sheet" role="dialog" aria-modal="true" aria-label={title} style={style}>
      <button type="button" className="lp-sheet-backdrop" onClick={onClose} aria-label={closeLabel} />
      <div className="lp-sheet-panel" style={drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}>
        <div
          className="lp-sheet-head"
          onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
          onTouchMove={(e) => startY.current !== null && setDrag(Math.max(0, e.touches[0].clientY - startY.current))}
          onTouchEnd={() => {
            if (drag > 70) onClose();
            setDrag(0);
            startY.current = null;
          }}
        >
          <i className="lp-sheet-grip" aria-hidden />
          <b className="lp-sheet-title">{title}</b>
          <button type="button" className="lp-sheet-close" onClick={onClose} aria-label={closeLabel}>
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>
        <div className="lp-sheet-body">{children}</div>
      </div>
    </div>
  );
}

/**
 * Dots under a sideways swipe row (.lp-swipe) showing which card is in view; tapping a
 * dot scrolls to that card. Renders on phones only.
 */
export function SwipeDots({ row, count }: { row: RefObject<HTMLElement | null>; count: number }) {
  const phone = useLandingPhone();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const el = row.current;
    if (!el || !phone) return;
    const on = () => {
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) return;
      const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0');
      setIndex(Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / Math.max(1, step)))));
    };
    on();
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, [row, count, phone]);
  if (!phone || count < 2) return null;
  return (
    <div className="lp-dots" role="tablist">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-label={`${i + 1} / ${count}`}
          className={i === index ? 'is-on' : ''}
          onClick={() => {
            const el = row.current;
            const card = el?.children[i] as HTMLElement | undefined;
            if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || '0'), behavior: reducedMotion() ? 'auto' : 'smooth' });
          }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- icons (24px, stroke = currentColor) */

const I = (d: ReactNode) =>
  function Icon() {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {d}
      </svg>
    );
  };

export const AppIcons = {
  home: I(<path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5" />),
  grid: I(
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>,
  ),
  list: I(<path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.5M4 12h.5M4 17.5h.5" />),
  star: I(<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7 6.9 19.4l1-5.6-4.1-4 5.7-.8z" />),
  heart: I(<path d="M12 19.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 6.8a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10-7.5 10z" />),
  calendar: I(
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>,
  ),
  bag: I(<path d="M5.5 8h13l-1 12h-11zM9 8V6.5a3 3 0 0 1 6 0V8" />),
  chat: I(<path d="M4.5 6.5A2 2 0 0 1 6.5 4.5h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4.5 3.5v-3.5h0a2 2 0 0 1-1-2z" />),
  question: I(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.7-.9 1.3v.5M12 16.8h.01" />
    </>,
  ),
  pin: I(
    <>
      <path d="M12 20.5s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </>,
  ),
  phone: I(<path d="M7 3.5h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 5 5.5a2 2 0 0 1 2-2z" />),
  user: I(
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c.8-3.6 3.8-5.7 7.5-5.7s6.7 2.1 7.5 5.7" />
    </>,
  ),
  users: I(
    <>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3 19c.6-3 3-4.8 6-4.8s5.4 1.8 6 4.8M15.5 5.8a3.2 3.2 0 0 1 0 6.3M17.5 14.4c1.9.6 3.2 2.2 3.5 4.6" />
    </>,
  ),
  sparkle: I(<path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6-5.6-1.9 5.6-1.9z" />),
  leaf: I(<path d="M5 19c0-8 5-13.5 14-14 0 9-5.5 14-14 14zM5 19l7-7" />),
  card: I(
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17M7 14.5h4" />
    </>,
  ),
  building: I(<path d="M5 20.5V4.5h9v16M14 9.5h5v11M8 8h3M8 11.5h3M8 15h3M3.5 20.5h17" />),
  key: I(
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l8.5-8.5M16 7l2.5 2.5M14 9l2 2" />
    </>,
  ),
  plate: I(
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="4" />
    </>,
  ),
  glass: I(<path d="M7.5 3.5h9c0 6-1.8 8.5-4.5 8.5S7.5 9.5 7.5 3.5zM12 12v8.5M8.5 20.5h7" />),
  flame: I(<path d="M12 20.5c-3.6 0-6-2.4-6-5.6 0-4.4 4.4-6.2 4.4-10.4 2.6 1.7 7.6 5.6 7.6 10.4 0 3.2-2.4 5.6-6 5.6zM12 20.5c-1.5 0-2.5-1-2.5-2.4 0-1.8 2.5-3.3 2.5-3.3s2.5 1.5 2.5 3.3c0 1.4-1 2.4-2.5 2.4z" />),
  tooth: I(<path d="M7 4c-2 0-3.5 1.8-3.5 4.2 0 3 1.6 4.2 2.2 7.6.4 2.4.9 4.7 2.2 4.7 1.7 0 1.5-5.2 4.1-5.2s2.4 5.2 4.1 5.2c1.3 0 1.8-2.3 2.2-4.7.6-3.4 2.2-4.6 2.2-7.6C20.5 5.8 19 4 17 4c-2.3 0-3 1.2-5 1.2S9.3 4 7 4z" />),
  wave: I(<path d="M3 9c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.2-2 4.5-2 2.3 2 4.5 2M3 15c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.2-2 4.5-2 2.3 2 4.5 2" />),
  bed: I(<path d="M3.5 18.5V6M3.5 14h17v4.5M20.5 14v-3a2.5 2.5 0 0 0-2.5-2.5h-7V14M7.5 11.2a1.7 1.7 0 1 0 0-.1" />),
  car: I(
    <>
      <path d="M4 15.5V12l2-5h12l2 5v3.5H4zM4 15.5V18h3v-2.5M17 15.5V18h3v-2.5M4 12h16" />
      <circle cx="7.5" cy="13.8" r=".6" />
      <circle cx="16.5" cy="13.8" r=".6" />
    </>,
  ),
  bolt: I(<path d="M13 3.5L5.5 13.5H12l-1 7 7.5-10H12z" />),
  sliders: I(<path d="M5 6.5h8M17 6.5h2M5 12h2M11 12h8M5 17.5h10M19 17.5h0M15 4.5v4M9 10v4M17 15.5v4" />),
  play: I(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.8l5 3.2-5 3.2z" />
    </>,
  ),
  arrow: I(<path d="M5 12h14M13 6l6 6-6 6" />),
  gift: I(<path d="M4 9.5h16v3.5H4zM5.5 13v7.5h13V13M12 9.5v11M12 9.5S10.5 4 8 4.5 7 9.5 12 9.5zM12 9.5s1.5-5.5 4-5S17 9.5 12 9.5z" />),
  ruler: I(<path d="M3.5 15.5l12-12 5 5-12 12zM7 12l2 2M10 9l1.5 1.5M13 6l2 2" />),
  bottle: I(<path d="M10 3.5h4v3l1.5 2.5v11.5h-7V9L10 6.5zM8.5 12.5h7" />),
};
