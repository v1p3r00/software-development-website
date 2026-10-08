import { useI18n } from '../i18n';
import { useGoToSection } from '../hooks/useGoToSection';
import { site } from '../data/site';
import { Link } from 'react-router-dom';
import { usePageTransition } from '../lib/pageTransition';
import { ArticlesPage } from '../pages/lazy';
import { useCursorPref } from '../hooks/useCursorPref';
import { featuredIndustries } from '../data/industries';

export default function Footer() {
  const { t, lp, lang } = useI18n();
  const { link } = usePageTransition();
  const year = new Date().getFullYear();
  const goTo = useGoToSection();
  const [cursorFx, setCursorFx] = useCursorPref();

  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="relative grid h-10 w-10 place-items-center border border-line-strong font-display text-lg font-extrabold leading-none">
              DM
              <span className="absolute -bottom-px -right-px h-1.5 w-1.5 bg-accent" />
            </span>
            <div>
              <div className="font-mono text-[12.5px] uppercase tracking-tech text-text">{site.name}</div>
              <div className="label mt-1">{t.ui.roleLine}</div>
              <p className="mt-3 max-w-[38ch] text-[13px] leading-relaxed text-muted">{t.footer.tagline}</p>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              ['home', t.nav.home],
              ['interactive', t.nav.labs],
              ['projects', t.nav.projects],
              ['services', t.nav.services],
              ['stack', t.nav.capabilities],
              ['about', t.nav.about],
              ['contact', t.nav.contact],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={goTo(id)}
                data-cursor="follow"
                className="flink"
              >
                {label}
              </a>
            ))}
            <Link
              to={lp('/articles/')}
              onClick={link(lp('/articles/'), 'slide', { prepare: ArticlesPage.preload })}
              data-cursor="follow"
              className="flink"
            >
              {t.nav.articles}
            </Link>
            <Link
              to={lp('/interview/')}
              data-cursor="follow"
              className="flink"
            >
              {t.nav.interview}
            </Link>
            <Link
              to={lp('/cv-maker/')}
              data-cursor="follow"
              className="flink"
            >
              {t.palette.goCv}
            </Link>
            <Link
              to={lp('/course/')}
              data-cursor="follow"
              className="flink"
            >
              {t.palette.goCourse}
            </Link>
            <Link
              to={lp('/website-check/')}
              data-cursor="follow"
              className="font-mono text-2xs uppercase tracking-tech text-accent transition-colors hover:text-text"
            >
              {lang === 'hu' ? 'Ingyenes weboldal-ellenőrzés' : 'Free website check'}
            </Link>
            {featuredIndustries.map((ind) => (
              <Link
                key={ind.slug}
                to={lp(`/industries/${ind.slug}/`)}
                data-cursor="follow"
                className="flink"
              >
                {ind.nav[lang]}
              </Link>
            ))}
            <Link
              to={lp('/industries/')}
              data-cursor="follow"
              className="font-mono text-2xs uppercase tracking-tech text-text transition-colors hover:text-accent"
            >
              {lang === 'hu' ? 'Összes iparág' : 'All industries'} →
            </Link>
          </nav>

          <div className="flex gap-2">
            {site.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                aria-label={l.label}
                data-cursor="follow"
                className="grid h-9 w-9 place-items-center border border-line font-mono text-2xs tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {l.short}
              </a>
            ))}
          </div>
        </div>

        <div className="ticks-x mt-10 h-2 opacity-30" aria-hidden />

        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 font-mono text-2xs uppercase tracking-tech text-dim sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {site.name}. {t.footer.rights}
          </span>
          <span className="hidden sm:block">{t.footer.colophon}</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              aria-pressed={cursorFx}
              onClick={() => setCursorFx(!cursorFx)}
              className="hidden uppercase transition-colors hover:text-accent lg:inline"
            >
              {t.ux.cursorFx}: <span className={cursorFx ? 'text-accent' : ''}>{cursorFx ? t.ux.cursorOn : t.ux.cursorOff}</span>
            </button>
            <a href={lp('/') === '/' ? '/feed.xml' : '/hu/feed.xml'} className="transition-colors hover:text-accent">
              RSS
            </a>
            <span>
              {site.version} / build {site.build}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
