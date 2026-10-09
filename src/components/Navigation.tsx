import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { stripLang } from '../i18n/paths';
import { useGoToSection } from '../hooks/useGoToSection';
import { site } from '../data/site';
import { useActiveSection, useScrollFrame } from '../hooks/useMisc';
import { useTheme } from '../hooks/useTheme';
import LanguageSwitcher from './LanguageSwitcher';
import { usePageTransition } from '../lib/pageTransition';
import { ArticlesPage, labPreload } from '../pages/lazy';
import { labFor, labs } from '../data/labs';
import { isLandingStage, readyLandings } from '../data/landings';
import { Arrow, cx } from './ui';

function Monogram({ compact }: { compact: boolean }) {
  const goTo = useGoToSection();
  const { lp } = useI18n();
  return (
    <a href={lp('/')} onClick={goTo('home')} data-cursor="follow" className="group flex shrink-0 items-center gap-3" aria-label={site.name}>
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
        className="group nv-link"
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
            'nv-rule',
            active ? 'w-full' : 'w-0 group-hover:w-full',
          )}
        />
      </button>

      <div
        id="projects-menu"
        className={cx(
          'absolute left-1/2 top-full z-50 w-[330px] -translate-x-1/2 pt-4 transition-all duration-300 ease-tech',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <div className="relative border border-line-strong bg-bg shadow-2xl">
          <div className="label border-b border-line px-4 py-2.5">// {t.labs.subtitle}</div>
          <ul>
            {labs.map((lab) => (
              <li key={lab.id}>
                <Link
                  to={lp(lab.path)}
                  onClick={link(lp(lab.path), 'slide', labPreload[lab.id] ? { prepare: labPreload[lab.id] } : {})}
                  data-cursor="follow"
                  data-menu-item
                  tabIndex={open ? 0 : -1}
                  className="group nm-item"
                >
                  <span className="nm-num">{lab.num}</span>
                  <span className="nm-title">
                    {lab.title[lang]}
                  </span>
                  <Arrow className="nm-arrow" />
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={`${lp('/')}#interactive`}
            onClick={(e) => {
              setOpen(false);
              onAll(e);
            }}
            tabIndex={open ? 0 : -1}
            data-cursor="follow"
            data-menu-item
            className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-2xs uppercase tracking-tech text-dim transition-colors hover:text-accent"
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
  // the mobile list is only built once it is first opened: the same links are in the
  // desktop menu and the footer, so the prerendered page stays lighter
  const [panelSeen, setPanelSeen] = useState(false);
  if (open && !panelSeen) setPanelSeen(true);
  const { pathname } = useLocation();
  const onHome = stripLang(pathname) === '/';
  const section = useActiveSection(site.sections, onHome);
  const active = onHome ? section : '';
  const goTo = useGoToSection();
  const { link } = usePageTransition();
  const onArticles = stripLang(pathname).startsWith('/articles');
  const toArticles = lp('/articles/');

  useScrollFrame(() => setCompact(window.scrollY > 64));

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // the "Projects" dropdown sits right after Home, then Articles; the rest follow in page order
  const items = [
    { id: 'projects', label: t.nav.projects },
    { id: 'services', label: t.nav.services },
    { id: 'stack', label: t.nav.capabilities },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ];
  const home = { id: 'home', label: t.nav.home };
  const onInterview = stripLang(pathname).startsWith('/interview');
  // the interactive projects keep only the logo, their title and the menu button, so the project gets the stage
  const lab = labFor(stripLang(pathname));
  const showcase = !!lab;
  // the camera study fills a phone screen with the statue: there the bar keeps only the logo and the menu button
  const bare = lab?.id === 'camera';
  // a landing page owns the screen: only the menu button stays, floating in the top-right corner
  const stage = isLandingStage(stripLang(pathname));
  const stageIdx = stage ? readyLandings.findIndex((l) => stripLang(pathname).startsWith(`/landing-pages/${l.slug}`)) : -1;
  const headerRef = useRef<HTMLElement>(null);

  // the name block beside the logo must never show a cut-off name. It takes the richest form
  // that fits beside the menu and the controls (a longer menu in another language leaves less
  // room): name and role on one line each → the name alone → the name on two lines → nothing.
  // Invisible copies are measured against the space the rest of the row leaves free.
  const leftRef = useRef<HTMLDivElement>(null);
  const probeFull = useRef<HTMLDivElement>(null);
  const probeName = useRef<HTMLDivElement>(null);
  const probeStack = useRef<HTMLDivElement>(null);
  const [nameMode, setNameMode] = useState<'full' | 'name' | 'stack' | 'none'>('full');
  useEffect(() => {
    const left = leftRef.current;
    const row = left?.parentElement;
    if (!left || !row || !probeFull.current || !probeName.current || !probeStack.current) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const cs = getComputedStyle(row);
      const gap = parseFloat(cs.columnGap) || 0;
      const inner = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const others = [...row.children].filter((c) => c !== left && getComputedStyle(c).display !== 'none');
      const used = others.reduce((w, c) => w + (c as HTMLElement).offsetWidth, 0) + gap * others.length;
      const logo = (left.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      const free = inner - used - logo - 16;
      setNameMode(
        free >= probeFull.current!.offsetWidth
          ? 'full'
          : free >= probeName.current!.offsetWidth
            ? 'name'
            : free >= probeStack.current!.offsetWidth
              ? 'stack'
              : 'none',
      );
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    const ro = new ResizeObserver(queue);
    ro.observe(row);
    for (const c of row.children) ro.observe(c);
    void document.fonts?.ready.then(queue);
    queue();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [lang]);

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
        'site-header fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-tech',
        stage
          ? 'pointer-events-none'
          : bare
            ? 'sm:border-b sm:border-transparent sm:bg-gradient-to-b sm:from-bg/80 sm:to-transparent' // phones: nothing behind the logo and menu button
            : compact
            ? 'border-b border-line bg-bg/95 lg:bg-bg/90 lg:backdrop-blur-sm'
            : 'border-b border-transparent bg-gradient-to-b from-bg/80 to-transparent',
      )}
    >
      <div
        className={cx(
          'mx-auto flex w-full items-center gap-6 transition-all duration-500 ease-tech',
          stage ? 'justify-end px-3 py-3 sm:px-4 sm:py-4' : 'max-w-[1500px] justify-between px-5 sm:px-8 lg:px-12',
          !stage && (compact ? 'py-2.5' : 'py-4'),
        )}
      >
        <div ref={leftRef} className={cx('flex min-w-0 items-center gap-4', stage && 'hidden')}>
          <Monogram compact={compact} />
          {lab && (
            <Link
              to={lp(lab.path)}
              data-cursor="follow"
              className={cx('group min-w-0 border-l border-line pl-4', bare && 'hidden sm:block')}
            >
              <div className="label leading-tight">
                <span className="text-accent">{lab.num}</span> / {t.nav.labs}
              </div>
              <div className="truncate font-display text-[15px] font-extrabold uppercase leading-tight tracking-tight transition-colors group-hover:text-accent sm:text-[17px]">
                {lab.title[lang]}
              </div>
              <div className="hidden truncate text-[12.5px] leading-snug text-muted md:block">{lab.tagline[lang]}</div>
            </Link>
          )}
          {/* name (and role): never cut off — see nameMode */}
          <div
            className={cx(
              'hidden shrink-0 overflow-hidden border-l border-line pl-4 transition-all duration-500 ease-tech',
              !showcase && nameMode !== 'none' && 'sm:block xl:hidden min-[1400px]:block',
              compact ? 'max-h-4 opacity-70' : 'max-h-12 opacity-100',
              compact && nameMode === 'stack' && 'max-h-8',
            )}
          >
            <div className={cx('font-mono text-[12.5px] uppercase tracking-tech text-text', nameMode === 'stack' ? 'leading-tight' : 'whitespace-nowrap')}>
              {nameMode === 'stack' ? t.ui.fullName.split(' ').map((w) => <div key={w}>{w}</div>) : t.ui.fullName}
            </div>
            {!compact && nameMode === 'full' && <div className="label mt-0.5 whitespace-nowrap leading-tight">{t.ui.roleLine}</div>}
          </div>
          {/* invisible copies of the block in each form, measured to choose the one that fits */}
          <div aria-hidden className="pointer-events-none invisible absolute left-0 top-0">
            <div ref={probeFull} className="absolute w-max border-l pl-4">
              <div className="whitespace-nowrap font-mono text-[12.5px] uppercase tracking-tech">{t.ui.fullName}</div>
              <div className="label mt-0.5 whitespace-nowrap leading-tight">{t.ui.roleLine}</div>
            </div>
            <div ref={probeName} className="absolute w-max border-l pl-4">
              <div className="whitespace-nowrap font-mono text-[12.5px] uppercase tracking-tech">{t.ui.fullName}</div>
            </div>
            <div ref={probeStack} className="absolute w-max border-l pl-4 font-mono text-[12.5px] uppercase tracking-tech">
              {t.ui.fullName.split(' ').map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
          </div>
        </div>

        <nav aria-label="Primary" className={cx('hidden items-center gap-3.5 min-[1440px]:gap-5 min-[1700px]:gap-6', !showcase && 'xl:flex')}>
          {[home].map((item) => {
            const on = active === item.id;
            return (
              <a
                key={item.id}
                href={`${lp('/')}#${item.id}`}
                onClick={goTo(item.id)}
                data-cursor="follow"
                className="group nv-link"
              >
                <span className={cx('transition-colors', on ? 'text-text' : 'text-muted group-hover:text-text')}>
                  {item.label}
                </span>
                <span
                  className={cx(
                    'nv-rule',
                    on ? 'w-full' : 'w-0 group-hover:w-full',
                  )}
                />
              </a>
            );
          })}
          <ProjectsMenu active={onInterview || active === 'interactive'} onAll={goTo('interactive')} />
          <Link
            to={toArticles}
            onClick={link(toArticles, 'slide', { prepare: ArticlesPage.preload })}
            aria-current={onArticles ? 'page' : undefined}
            data-cursor="follow"
            className="group nv-link"
          >
            <span className={cx('transition-colors', onArticles ? 'text-text' : 'text-muted group-hover:text-text')}>
              {t.nav.articles}
            </span>
            <span
              className={cx(
                'nv-rule',
                onArticles ? 'w-full' : 'w-0 group-hover:w-full',
              )}
            />
          </Link>
          {items.map((item) => {
            const on = active === item.id;
            return (
              <a
                key={item.id}
                href={`${lp('/')}#${item.id}`}
                onClick={goTo(item.id)}
                data-cursor="follow"
                className="group nv-link"
              >
                <span className={cx('transition-colors', on ? 'text-text' : 'text-muted group-hover:text-text')}>
                  {item.label}
                </span>
                <span
                  className={cx(
                    'nv-rule',
                    on ? 'w-full' : 'w-0 group-hover:w-full',
                  )}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
            <span className="hidden font-mono text-2xs uppercase tracking-tech md:inline xl:hidden min-[1700px]:inline">{t.ux.search}</span>
            <kbd className="hidden border border-line px-1 font-mono text-[10.5px] text-dim lg:inline xl:hidden min-[1700px]:inline">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
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
            href={`${lp('/')}#contact`}
            onClick={goTo('contact')}
            data-cursor="follow"
            className="hero-cta group hidden items-center gap-3 bg-accent px-5 py-2.5 font-mono text-[13.5px] font-semibold uppercase tracking-tech text-onaccent transition-[transform,background-color] duration-300 hover:-translate-y-px hover:bg-text sm:flex"
          >
            <span className="relative grid h-2 w-2 place-items-center" aria-hidden>
              <span className="hero-cta-dot absolute h-2 w-2 rounded-full bg-onaccent" />
              <span className="relative h-2 w-2 rounded-full bg-onaccent" />
            </span>
            {t.nav.talk}
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          </>)}

          {showcase && !stage && (<>
          <LanguageSwitcher large className="mr-1 hidden sm:flex" />
          <button
            type="button"
            onClick={toggle}
            data-cursor="follow"
            aria-label={t.palette.theme}
            title={t.palette.theme}
            className={cx(
              'h-10 w-10 place-items-center border border-line text-muted transition-colors hover:border-accent hover:text-accent',
              bare ? 'hidden sm:grid' : 'grid',
            )}
          >
            <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="4.5" stroke="currentColor" />
              {theme === 'dark' ? (
                <path d="M8 3.5A4.5 4.5 0 0 1 8 12.5z" fill="currentColor" />
              ) : (
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M13 3l-1 1M4 12l-1 1" stroke="currentColor" />
              )}
            </svg>
          </button>
          </>)}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? t.nav.close : t.nav.menu}
            data-cursor="follow"
            className={cx(
              'grid place-items-center border',
              stage
                ? 'pointer-events-auto h-12 w-12 border-white/20 bg-black/70 text-white shadow-lg transition-colors hover:border-white/60 hover:bg-black/75'
                : 'border-line text-text',
              !stage && (showcase ? 'h-10 w-10 hover:border-accent' : 'h-[30px] w-[30px] xl:hidden'),
            )}
          >
            <svg viewBox="0 0 16 16" className={showcase ? 'h-5 w-5' : 'h-3.5 w-3.5'} fill="none" aria-hidden>
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
          // the list is taller than a phone screen: it scrolls inside the panel (the page behind is locked)
          'pointer-events-auto overflow-x-hidden overflow-y-auto overscroll-contain border-t border-line bg-bg transition-[max-height,visibility] duration-500 ease-tech',
          showcase && !open && 'invisible',
          stage
            ? 'absolute right-0 top-full w-full overflow-y-auto sm:right-4 sm:w-[400px] sm:border-x sm:border-b sm:border-line-strong sm:shadow-2xl'
            : showcase
              ? 'absolute right-0 top-full w-full overflow-y-auto sm:right-8 sm:w-[400px] sm:border-x sm:border-b sm:border-line-strong sm:shadow-2xl lg:right-12 min-[1500px]:right-[calc((100vw-1500px)/2+3rem)]'
              : 'xl:hidden',
          open ? 'max-h-[calc(100svh-4.5rem)]' : 'max-h-0',
        )}
      >
        {(open || panelSeen) && (
        <nav aria-label="Mobile" className="px-5 py-4 sm:px-8">
          {stage && (
            <div className="border-b border-line pb-4">
              <div className="flex items-center justify-between">
                <Link
                  to={lp('/landing-pages/')}
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl font-extrabold uppercase tracking-tight hover:text-accent"
                >
                  {t.landing.menuTitle}
                </Link>
                <span className="font-mono text-2xs tracking-tech text-accent">
                  {String(stageIdx + 1).padStart(2, '0')} / {String(readyLandings.length).padStart(2, '0')}
                </span>
              </div>
              <ul className="mt-3 space-y-1 border-l border-line pl-4">
                {readyLandings.map((l, i) => (
                  <li key={l.slug}>
                    <Link
                      to={lp(`/landing-pages/${l.slug}/`)}
                      onClick={() => setOpen(false)}
                      aria-current={i === stageIdx ? 'page' : undefined}
                      className={cx(
                        'flex items-center gap-3 py-1.5 font-mono text-[12px] uppercase tracking-tech hover:text-accent',
                        i === stageIdx ? 'text-text' : 'text-muted',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-accent">{l.num}</span>
                        <span className="h-2 w-2 shrink-0" style={{ background: l.colors.accent }} aria-hidden />
                        {l.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {readyLandings.length > 1 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    [t.landing.prev, readyLandings[(stageIdx - 1 + readyLandings.length) % readyLandings.length]],
                    [t.landing.next, readyLandings[(stageIdx + 1) % readyLandings.length]],
                  ].map(([label, l], i) => (
                    <Link
                      key={i}
                      to={lp(`/landing-pages/${(l as (typeof readyLandings)[number]).slug}/`)}
                      onClick={() => setOpen(false)}
                      className={cx(
                        'border border-line px-3 py-2 font-mono text-2xs uppercase tracking-tech text-muted hover:border-accent hover:text-accent',
                        i === 1 && 'text-right',
                      )}
                    >
                      {i === 0 ? '← ' : ''}
                      {label as string}
                      {i === 1 ? ' →' : ''}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          <a
            href={lp('/')}
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
              href={`${lp('/')}#interactive`}
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
          <Link
            to={toArticles}
            onClick={(e) => {
              setOpen(false);
              link(toArticles, 'slide', { prepare: ArticlesPage.preload })(e);
            }}
            aria-current={onArticles ? 'page' : undefined}
            className="flex items-baseline justify-between border-b border-line py-4 font-display text-2xl font-extrabold uppercase tracking-tight"
          >
            {t.nav.articles}
            <span className="font-mono text-2xs tracking-tech text-accent">[03]</span>
          </Link>
          <Link
            to={lp('/website-check/')}
            onClick={() => setOpen(false)}
            className="flex items-baseline justify-between border-b border-line py-4 font-display text-2xl font-extrabold uppercase tracking-tight"
          >
            {{ en: 'Website check', hu: 'Weboldal-ellenőrzés', sk: 'Kontrola webu' }[lang]}
            <span className="font-mono text-2xs tracking-tech text-accent">{{ en: 'FREE', hu: 'INGYENES', sk: 'ZADARMO' }[lang]}</span>
          </Link>
          {items.map((item, i) => (
            <a
              key={item.id}
              href={`${lp('/')}#${item.id}`}
              onClick={(e) => {
                setOpen(false);
                goTo(item.id)(e);
              }}
              className="flex items-baseline justify-between border-b border-line py-4 font-display text-2xl font-extrabold uppercase tracking-tight last-of-type:border-b-0"
            >
              {item.label}
              <span className="font-mono text-2xs tracking-tech text-accent">
                [{String(i + 4).padStart(2, '0')}]
              </span>
            </a>
          ))}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="label break-all">{site.email}</span>
            <LanguageSwitcher />
          </div>
        </nav>
        )}
      </div>
    </header>
  );
}
