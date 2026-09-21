import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useGoToSection } from '../hooks/useGoToSection';
import { site } from '../data/site';
import { useActiveSection } from '../hooks/useMisc';
import { useTheme } from '../hooks/useTheme';
import LanguageSwitcher from './LanguageSwitcher';
import { Arrow, cx } from './ui';

function Monogram({ compact }: { compact: boolean }) {
  return (
    <a href="#home" data-cursor="follow" className="group flex items-center gap-3" aria-label={site.name}>
      <span
        className={cx(
          'relative grid place-items-center border border-line-strong font-display font-extrabold leading-none transition-all duration-300 ease-tech',
          compact ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-lg',
        )}
      >
        <span className="text-text transition-colors group-hover:text-accent">DM</span>
        <span className="absolute -bottom-px -right-px h-1.5 w-1.5 bg-accent" />
      </span>
    </a>
  );
}

export default function Navigation({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const section = useActiveSection(site.sections, onHome);
  const active = onHome ? section : '';
  const goTo = useGoToSection();

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 64);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const items = [
    { id: 'home', label: t.nav.home },
    { id: 'about', label: t.nav.about },
    { id: 'projects', label: t.nav.projects },
    { id: 'services', label: t.nav.services },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ease-tech',
        compact
          ? 'border-line bg-bg/85 backdrop-blur-md'
          : 'border-transparent bg-gradient-to-b from-bg/80 to-transparent',
      )}
    >
      <div
        className={cx(
          'mx-auto flex w-full max-w-[1500px] items-center justify-between gap-6 px-5 transition-all duration-500 ease-tech sm:px-8 lg:px-12',
          compact ? 'py-2.5' : 'py-4',
        )}
      >
        <div className="flex items-center gap-4">
          <Monogram compact={compact} />
          <div
            className={cx(
              'hidden overflow-hidden border-l border-line pl-4 transition-all duration-500 ease-tech sm:block',
              compact ? 'max-h-4 opacity-70' : 'max-h-12 opacity-100',
            )}
          >
            <div className="font-mono text-[11px] uppercase tracking-tech text-text">{site.name}</div>
            {!compact && (
              <div className="label mt-0.5 leading-tight">{t.ui.roleLine}</div>
            )}
          </div>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {items.map((item, i) => {
            const on = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={goTo(item.id)}
                data-cursor="follow"
                className="group relative flex items-baseline gap-1.5 py-1 font-mono text-[11px] uppercase tracking-tech"
              >
                <span className={cx('transition-colors', on ? 'text-accent' : 'text-dim')}>
                  [{String(i + 1).padStart(2, '0')}]
                </span>
                <span className={cx('transition-colors', on ? 'text-text' : 'text-muted group-hover:text-text')}>
                  {item.label}
                </span>
                <span
                  className={cx(
                    'absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ease-tech',
                    on ? 'w-full' : 'w-0 group-hover:w-full',
                  )}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenPalette}
            data-cursor="follow"
            aria-label={t.palette.title}
            className="hidden items-center gap-2 border border-line px-2.5 py-1.5 font-mono text-2xs uppercase tracking-tech text-dim transition-colors hover:border-line-strong hover:text-text md:flex"
          >
            <span>⌘</span>
            <span>K</span>
          </button>

          <button
            type="button"
            onClick={toggle}
            data-cursor="follow"
            aria-label={t.palette.theme}
            className="grid h-[30px] w-[30px] place-items-center border border-line text-dim transition-colors hover:border-line-strong hover:text-accent"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="4.5" stroke="currentColor" />
              {theme === 'dark' ? (
                <path d="M8 3.5A4.5 4.5 0 0 1 8 12.5z" fill="currentColor" />
              ) : (
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M13 3l-1 1M4 12l-1 1" stroke="currentColor" />
              )}
            </svg>
          </button>

          <LanguageSwitcher />

          <a
            href="#contact"
            onClick={goTo('contact')}
            data-cursor="follow"
            className="group hidden items-center gap-3 border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent sm:flex"
          >
            {t.nav.talk}
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? t.nav.close : t.nav.menu}
            className="grid h-[30px] w-[30px] place-items-center border border-line text-text lg:hidden"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
              {open ? (
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" />
              ) : (
                <path d="M2 5h12M2 11h12" stroke="currentColor" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile panel */}
      <div
        className={cx(
          'overflow-hidden border-t border-line bg-bg transition-[max-height] duration-500 ease-tech lg:hidden',
          open ? 'max-h-[80vh]' : 'max-h-0',
        )}
      >
        <nav aria-label="Mobile" className="px-5 py-4 sm:px-8">
          {items.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                setOpen(false);
                goTo(item.id)(e);
              }}
              className="flex items-baseline justify-between border-b border-line py-4 font-display text-2xl font-extrabold uppercase tracking-tight last:border-b-0"
            >
              {item.label}
              <span className="font-mono text-2xs tracking-tech text-accent">
                [{String(i + 1).padStart(2, '0')}]
              </span>
            </a>
          ))}
          <div className="mt-4 flex items-center justify-between">
            <span className="label">{site.email}</span>
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
