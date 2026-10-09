import { useState } from 'react';
import { useScrollFrame } from '../hooks/useMisc';
import { useI18n } from '../i18n';
import { cx } from './ui';
import { scrollBehavior } from '../lib/motion';

/** appears after a screen and a half of scrolling */
export default function BackToTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  useScrollFrame(() => setShow(window.scrollY > window.innerHeight * 1.5));
  return (
    <button
      type="button"
      aria-label={t.ux.backToTop}
      title={t.ux.backToTop}
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
      className={cx(
        'back-to-top fixed bottom-[88px] right-[26px] z-40 grid h-11 w-11 place-items-center border border-line-strong bg-bg/95 text-text shadow-lg transition-all duration-300 hover:border-accent hover:text-accent sm:bottom-[96px] sm:right-[30px]',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
      </svg>
    </button>
  );
}
