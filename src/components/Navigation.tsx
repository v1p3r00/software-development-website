import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { stripLang } from '../i18n/paths';
import { useGoToSection } from '../hooks/useGoToSection';
import { site } from '../data/site';
import { useActiveSection } from '../hooks/useMisc';
import { useTheme } from '../hooks/useTheme';
import LanguageSwitcher from './LanguageSwitcher';
import { usePageTransition } from '../lib/pageTransition';
import { labPreload } from '../pages/lazy';
import LabIcon from './LabIcon';
import { labs } from '../data/labs';
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

/** "Projects" entry of the desktop nav: a dropdown listing the interactive projects. */
function ProjectsMenu({ active, onAll }: { active: boolean; onAll: (e: React.MouseEvent) => void }) {
  const { t, lp, lang } = useI18n();
  const { link } = usePageTransition();
  const { pathname } = useLocation();
  // remembers the page it was opened on, so navigating anywhere closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((typeof next === 'function' ? next(open) : next) ? pathname : null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpenOn(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenOn(null);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // opens on click (not hover, which opened it by accident); arrow keys move through the list
  const focusItem = (dir: 1 | -1 | 0) => {
    const links = [...(ref.current?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? [])];
    if (!links.length) return;
    const i = links.indexOf(document.activeElement as HTMLElement);
    const next = dir === 0 ? 0 : (i + dir + links.length) % links.length;
    links[next]?.focus();
  };
  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        window.setTimeout(() => focusItem(0), 30);
      } else focusItem(e.key === 'ArrowDown' ? 1 : -1);
    }
    if (e.key === 'Escape' && open) {
      setOpen(false);
      ref.current?.querySelector<HTMLElement>('button')?.focus();
    }
  };

  return (
    <div ref={ref} className="relative" onKeyDown={onMenuKey} onMouseEnter={() => labs.forEach((l) => void labPreload[l.id]?.())}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => labs.forEach((l) => void labPreload[l.id]?.())}
        aria-expanded={open}
        aria-controls="projects-menu"
        aria-haspopup="true"
        data-cursor="follow"
        className="group relative flex items-baseline gap-1.5 py-1 font-mono text-[12.5px] uppercase tracking-tech"
      >
        <span className={cx('transition-colors', active || open ? 'text-text' : 'text-muted group-hover:text-text')}>
          {t.nav.labs}
        </span>
        <svg
          viewBox="0 0 8 8"
          aria-hidden
          className={cx('h-2 w-2 self-center transition-transform duration-300', open ? 'rotate-180 text-accent' : 'text-dim')}
        >
          <path d="M1 2.5l3 3 3-3" fill="none" stroke="currentColor" />
        </svg>
        <span
          className={cx(
            'absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ease-tech',
            active ? 'w-full' : 'w-0 group-hover:w-full',
          )}
        />
      </button>

      <div
        id="projects-menu"
        className={cx(
          'absolute left-1/2 top-full z-50 w-[340px] -translate-x-1/2 pt-4 transition-all duration-300 ease-tech',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <div className="relative border border-line-strong bg-bg shadow-2xl">
          <div className="label border-b border-line px-4 py-2.5">// {t.labs.subtitle}</div>
          <ul>
            {labs.map((lab) => (
              <li key={lab.id} className="border-b border-line">
                <Link
                  to={lp(lab.path)}
                  onClick={link(lp(lab.path), 'slide', labPreload[lab.id] ? { prepare: labPreload[lab.id] } : {})}
                  data-cursor="follow"
                  data-menu-item
                  tabIndex={open ? 0 : -1}
                  className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface"
                >
                  <LabIcon id={lab.id} className="mt-0.5 h-6 w-6 shrink-0 text-muted transition-colors group-hover:text-text" />
                  <span className="flex-1">
                    <span className="block font-display text-base font-extrabold uppercase leading-tight tracking-tight transition-colors group-hover:text-accent">
                      {lab.title[lang]}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[12px] leading-snug text-muted">{lab.desc[lang]}</span>
                  </span>
                  <Arrow className="mt-1 shrink-0 text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
          <a
            href="#interactive"
            onClick={(e) => {
              setOpen(false);
              onAll(e);
            }}
            tabIndex={open ? 0 : -1}
            data-cursor="follow"
            data-menu-item
            className="flex items-center justify-between px-4 py-2.5 font-mono text-2xs uppercase tracking-tech text-dim transition-colors hover:text-accent"
          >
            {t.nav.labsAll}
            <span>↓</span>
          </a>
        </div>
      </div>
    </div>
  );
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export default function Navigation({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { t, lp, lang } = useI18n();
  const { theme, toggle } = useTheme();
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onHome = stripLang(pathname) === '/';
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

  // the "Projects" dropdown sits right after Home; the rest follow in page order
  const items = [
    { id: 'projects', label: t.nav.projects },
    { id: 'services', label: t.nav.services },
    { id: 'stack', label: t.nav.capabilities },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ];
  const home = { id: 'home', label: t.nav.home };
  const onInterview = stripLang(pathname).startsWith('/interview');
  // the modernization showcase keeps only the menu button, so the comparison gets the stage
  const showcase = stripLang(pathname).startsWith('/modernization');
  const headerRef = useRef<HTMLElement>(null);

  // there the menu is a dropdown, so a click outside it closes it
  useEffect(() => {
    if (!open || !showcase) return;
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, showcase]);

  return (
    <header
      ref={headerRef}
      // stays put above the page during route transitions
      style={{ viewTransitionName: 'site-header' }}
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
              'hidden overflow-hidden border-l border-line pl-4 transition-all duration-500 ease-tech',
              !showcase && 'sm:block xl:hidden min-[1400px]:block',
              compact ? 'max-h-4 opacity-70' : 'max-h-12 opacity-100',
            )}
          >
            <div className="whitespace-nowrap font-mono text-[12.5px] uppercase tracking-tech text-text">{site.name}</div>
            {!compact && (
              <div className="label mt-0.5 leading-tight">{t.ui.roleLine}</div>
            )}
          </div>
        </div>

        <nav aria-label="Primary" className={cx('hidden items-center gap-5 min-[1700px]:gap-6', !showcase && 'xl:flex')}>
          {[home].map((item) => {
            const on = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={goTo(item.id)}
                data-cursor="follow"
                className="group relative flex items-baseline gap-1.5 py-1 font-mono text-[12.5px] uppercase tracking-tech"
              >
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
          <ProjectsMenu active={onInterview || active === 'interactive'} onAll={goTo('interactive')} />
          {items.map((item) => {
            const on = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={goTo(item.id)}
                data-cursor="follow"
                className="group relative flex items-baseline gap-1.5 py-1 font-mono text-[12.5px] uppercase tracking-tech"
              >
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
          {!showcase && (<>
          <button
            type="button"
            onClick={onOpenPalette}
            data-cursor="follow"
            aria-label={t.ux.searchHint}
            title={t.ux.searchHint}
            className="flex h-[30px] items-center gap-2 border border-line px-2 text-muted transition-colors hover:border-accent hover:text-text sm:px-2.5"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4.5 4.5" strokeLinecap="round" />
            </svg>
            <span className="hidden font-mono text-2xs uppercase tracking-tech md:inline">{t.ux.search}</span>
            <kbd className="hidden border border-line px-1 font-mono text-[10.5px] text-dim lg:inline">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
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
            className="group hidden items-center gap-3 border border-line-strong px-4 py-2 font-mono text-[12.5px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent sm:flex"
          >
            {t.nav.talk}
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          </>)}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? t.nav.close : t.nav.menu}
            data-cursor="follow"
            className={cx('grid h-[30px] w-[30px] place-items-center border border-line text-text', !showcase && 'xl:hidden')}
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
          'overflow-hidden border-t border-line bg-bg transition-[max-height,visibility] duration-500 ease-tech',
          showcase && !open && 'invisible',
          showcase
            ? 'absolute right-0 top-full w-full overflow-y-auto sm:right-8 sm:w-[400px] sm:border-x sm:border-b sm:border-line-strong sm:shadow-2xl lg:right-12 min-[1500px]:right-[calc((100vw-1500px)/2+3rem)]'
            : 'xl:hidden',
          open ? 'max-h-[80vh]' : 'max-h-0',
        )}
      >
        <nav aria-label="Mobile" className="px-5 py-4 sm:px-8">
          <a
            href="#home"
            onClick={(e) => {
              setOpen(false);
              goTo('home')(e);
            }}
            className="flex items-baseline justify-between border-b border-line py-4 font-display text-2xl font-extrabold uppercase tracking-tight"
          >
            {t.nav.home}
            <span className="font-mono text-2xs tracking-tech text-accent">[01]</span>
          </a>
          <div className="border-b border-line py-4">
            <a
              href="#interactive"
              onClick={(e) => {
                setOpen(false);
                goTo('interactive')(e);
              }}
              className="flex items-baseline justify-between font-display text-2xl font-extrabold uppercase tracking-tight"
            >
              {t.nav.labs}
              <span className="font-mono text-2xs tracking-tech text-accent">[02]</span>
            </a>
            <ul className="mt-3 space-y-1 border-l border-line pl-4">
              {labs.map((lab) => (
                <li key={lab.id}>
                  <Link
                    to={lp(lab.path)}
                    onClick={() => {
                      setOpen(false);
                      void labPreload[lab.id]?.();
                    }}
                    className="flex items-center justify-between py-1.5 font-mono text-[12px] uppercase tracking-tech text-muted hover:text-accent"
                  >
                    <span>
                      <span className="mr-2 text-accent">{lab.num}</span>
                      {lab.title[lang]}
                    </span>
                    <Arrow className="text-dim" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {items.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                setOpen(false);
                goTo(item.id)(e);
              }}
              className="flex items-baseline justify-between border-b border-line py-4 font-display text-2xl font-extrabold uppercase tracking-tight last-of-type:border-b-0"
            >
              {item.label}
              <span className="font-mono text-2xs tracking-tech text-accent">
                [{String(i + 3).padStart(2, '0')}]
              </span>
            </a>
          ))}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="label break-all">{site.email}</span>
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
