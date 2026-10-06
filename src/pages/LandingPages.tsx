import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { landings, readyLandings } from '../data/landings';
import LandingCover from '../components/LandingCover';
import { loadLanding } from '../data/landingLoaders';
import { Arrow, CornerMarks, Section, SectionHeader } from '../components/ui';
import { useGoToSection } from '../hooks/useGoToSection';

export default function LandingPages() {
  const { t, lp, lang } = useI18n();
  const tl = t.landing;
  useSeo({ title: t.seo.landingTitle, description: t.seo.landingDescription, path: '/landing-pages/' });
  const upcoming = landings.filter((l) => !l.ready);
  const goTo = useGoToSection();

  return (
    <Section id="landing-pages" className="min-h-[70vh] pt-24 lg:pt-24">
      <SectionHeader
        index="01"
        title={tl.title}
        inHeader
        subtitle={tl.subtitle}
        right={
          <span className="label">
            {tl.live}: {String(readyLandings.length).padStart(2, '0')} / {String(landings.length).padStart(2, '0')}
          </span>
        }
      />
      <p className="mb-10 max-w-[68ch] whitespace-pre-line text-base leading-relaxed text-muted sm:text-lg">{tl.intro}</p>

      <ol className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {readyLandings.map((l) => (
          <li key={l.slug} className="flex">
            <Link
              to={lp(`/landing-pages/${l.slug}/`)}
              onMouseEnter={() => void loadLanding(l.slug)}
              onFocus={() => void loadLanding(l.slug)}
              data-cursor="follow"
              className="group relative flex w-full flex-col border border-line bg-surface p-3 transition-colors duration-300 hover:border-accent sm:p-4"
            >
              <CornerMarks />
              <LandingCover l={l} className="aspect-[16/10] w-full" />
              <div className="flex flex-1 flex-col px-2 pb-2 pt-5 sm:px-3">
                <div className="flex items-center justify-between font-mono text-2xs uppercase tracking-tech text-dim">
                  <span>
                    <span className="text-accent">{l.num}</span>
                    <span className="mx-2">/</span>
                    {l.sector[lang]}
                  </span>
                  <span className="border border-line px-1.5 py-0.5">{l.market.toUpperCase()}</span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-extrabold uppercase leading-none tracking-tight transition-colors group-hover:text-accent">
                  {l.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{l.concept[lang]}</p>
                <span className="mt-auto inline-flex items-center gap-3 pt-6 font-mono text-[12.5px] font-semibold uppercase tracking-tech text-accent">
                  {tl.open}
                  <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      {upcoming.length > 0 && (
        <div className="mt-10 border-t border-line pt-6">
          <div className="label mb-4">
            {tl.upcoming} · {upcoming.length}
          </div>
          <ul className="flex flex-wrap gap-2">
            {upcoming.map((l) => (
              <li key={l.slug} className="flex items-center gap-2 border border-line px-3 py-2 font-mono text-2xs uppercase tracking-tech text-muted">
                <span className="h-2 w-2" style={{ background: l.colors.accent }} aria-hidden />
                {l.name}
                <span className="text-dim">· {l.sector[lang]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <aside className="relative mt-10 flex flex-col gap-5 border-2 border-accent bg-accent/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="font-display text-[clamp(1.2rem,6.4vw,1.5rem)] font-extrabold uppercase tracking-tight [overflow-wrap:anywhere]">{tl.ctaTitle}</div>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted sm:text-base">{tl.ctaText}</p>
        </div>
        <a
          href={`${lp('/')}#contact`}
          onClick={goTo('contact')}
          data-cursor="follow"
          className="hero-cta group inline-flex shrink-0 items-center justify-center gap-3 bg-accent px-7 py-4 font-mono text-[13.5px] font-semibold uppercase tracking-tech text-onaccent transition-colors hover:bg-text"
        >
          {t.nav.talk}
          <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </aside>
    </Section>
  );
}
