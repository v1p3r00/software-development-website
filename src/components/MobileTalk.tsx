import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { stripLang } from '../i18n/paths';
import { useGoToSection } from '../hooks/useGoToSection';
import { cx } from './ui';

/**
 * Phones hide the header's "Let's talk" button, so after the first screen a small
 * floating one appears — except while the contact section itself is on screen
 * and inside the course and tools, where it would cover the work area.
 */
export default function MobileTalk() {
  const { t, lp } = useI18n();
  const goTo = useGoToSection();
  const { pathname } = useLocation();
  const path = stripLang(pathname);
  const allowed = path === '/' || path.startsWith('/articles') || path.startsWith('/project');
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const contact = document.getElementById('contact')?.getBoundingClientRect();
      const contactVisible = contact ? contact.top < window.innerHeight && contact.bottom > 0 : false;
      setShow(window.scrollY > window.innerHeight * 0.8 && !contactVisible);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);
  if (!allowed) return null;
  return (
    <a
      href={`${lp('/')}#contact`}
      onClick={goTo('contact')}
      tabIndex={show ? 0 : -1}
      className={cx(
        'hero-cta fixed bottom-5 left-5 z-40 inline-flex items-center gap-2.5 bg-accent px-5 py-3.5 font-mono text-[14px] font-semibold uppercase tracking-tech text-onaccent shadow-lg transition-[transform,opacity] duration-300 sm:hidden',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <span className="relative grid h-2 w-2 place-items-center" aria-hidden>
        <span className="hero-cta-dot absolute h-2 w-2 rounded-full bg-onaccent" />
        <span className="relative h-2 w-2 rounded-full bg-onaccent" />
      </span>
      {t.ux.talk} →
    </a>
  );
}
