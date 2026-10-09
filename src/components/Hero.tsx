import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { site } from '../data/site';
import { labs } from '../data/labs';
import { usePrefersReducedMotion } from '../hooks/useMisc';
import { useGoToSection } from '../hooks/useGoToSection';
import HeroModel from './HeroModel';
import VisitorCounter from './VisitorCounter';
import { Arrow, CornerMarks, cx } from './ui';

/**
 * The rotating role line. Its own component so the 2.6 s tick re-renders only
 * this line, not the whole hero; it also stops while off screen or in a hidden tab.
 */
function RoleTicker({ roles, reduced }: { roles: readonly string[]; reduced: boolean }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    let id = 0;
    let onScreen = true;
    const sync = () => {
      window.clearInterval(id);
      id = 0;
      if (onScreen && !document.hidden) id = window.setInterval(() => setRoleIndex((i) => (i + 1) % roles.length), 2600);
    };
    const io = el
      ? new IntersectionObserver(([entry]) => {
          onScreen = entry.isIntersecting;
          sync();
        })
      : undefined;
    if (el) io?.observe(el);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      window.clearInterval(id);
      io?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [reduced, roles.length]);

  return (
    <span ref={ref} className="relative h-4 flex-1 overflow-hidden">
      {roles.map((role, i) => (
        <span
          key={role}
          className="absolute inset-0 font-mono text-[12.5px] uppercase tracking-tech text-text transition-all duration-500 ease-tech"
          style={{
            opacity: i === roleIndex ? 1 : 0,
            transform: `translateY(${(i - roleIndex) * 100}%)`,
          }}
        >
          {role}
        </span>
      ))}
    </span>
  );
}

const STACK = ['Java', 'Angular', 'React', 'Spring Boot', 'PostgreSQL', 'Docker'];

function Portrait() {
  const { t } = useI18n();
  return (
    <div className="relative h-full w-full" data-cursor="inspect">
      {/* frame */}
      <div className="absolute inset-0 border-x border-line" aria-hidden />
      <CornerMarks />

      {/* image */}
      <div className="relative h-full w-full overflow-hidden">
        <picture className="contents">
          <source
            srcSet="/portrait-480.webp 480w, /portrait-720.webp 720w, /portrait.webp 960w"
            sizes="(min-width: 1024px) 40vw, min(520px, 100vw)"
            type="image/webp"
          />
          <img
            src="/portrait.jpg"
            alt="David Mészáros"
            width={960}
            height={960}
            fetchPriority="high"
            className="portrait-img portrait-mask h-full w-full scale-[1.06] object-cover object-[50%_22%]"
          />
        </picture>
        <div className="scanlines pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(70% 55% at 50% 30%, transparent 0%, rgb(var(--c-bg) / 0.35) 70%, rgb(var(--c-bg)) 100%)',
          }}
        />
      </div>

      {/* rotating wireframe model, sitting in the dark below the photograph */}
      <div className="hero-model pointer-events-none absolute bottom-0 left-0 z-10 h-[56%] w-[92%] sm:h-[60%]">
        <div
          className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-transparent"
          aria-hidden
        />
        <HeroModel className="relative h-full w-full" />
        <div className="absolute bottom-1 left-2 flex flex-col gap-0.5">
          <span className="label-a">Model / dm_desk.glb</span>
          <span className="label hidden sm:block">low-poly · 57k tris · 0.30 rad·s⁻¹</span>
        </div>
      </div>

      {/* technical annotations over the portrait */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-[18%] w-full">
          <div className="h-px w-full bg-accent/25" />
          <span className="label-a absolute left-2 top-1.5 bg-bg/70 px-1.5 py-0.5">{t.hero.portraitTag}</span>
        </div>
        <div className="absolute left-0 top-[62%] h-px w-full bg-line" />
        <span className="label absolute left-2 top-[62%] mt-1.5">Ø 01.02 — frame / 960 × 960</span>
        <div className="absolute left-2 top-[30%] flex flex-col gap-1">
          <span className="label bg-bg/70 px-1.5 py-0.5">Exp +0.3</span>
          <span className="label bg-bg/70 px-1.5 py-0.5">ISO 400</span>
          <span className="label-a bg-bg/70 px-1.5 py-0.5">● REC</span>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d="M0 0 L100 100 M100 0 L0 100" stroke="rgb(var(--c-text))" strokeWidth="0.06" opacity="0.18" />
        </svg>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t, lp } = useI18n();
  const goTo = useGoToSection();
  const reduced = usePrefersReducedMotion();
  // pure CSS entrances: they play on the first paint of the prerendered page, before any script runs
  const reveal = (delay: number) => ({ animationDelay: `${delay}ms` }) as const;

  return (
    <section id="home" className="relative w-full overflow-hidden pt-24 lg:min-h-[100svh] lg:pt-20">
      <div className="tech-grid absolute inset-0 opacity-70" aria-hidden />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{ background: 'radial-gradient(90% 70% at 50% 0%, transparent 40%, rgb(var(--c-bg)) 100%)' }}
      />

      <div className="relative mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-0 px-5 sm:px-8 lg:grid-cols-12 lg:px-12">
        {/* ── left column: headline ── */}
        <div className="hero-text order-2 flex flex-col justify-center py-10 lg:order-1 lg:col-span-5 lg:py-16">
          <div style={reveal(60)} className="hero-kicker hero-rise label-a mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            // {t.hero.kicker}
          </div>

          <h1 className="hero-h1 display text-[clamp(2.8rem,10.5vw,5rem)] lg:text-[clamp(2.6rem,5.6vw,6rem)]">
            {[t.hero.l1, t.hero.l2, t.hero.l3].map((line, i) => (
              <span key={line} className="block">
                <span
                  className="hero-rise block"
                  style={{
                    ...reveal(140 + i * 110),
                    color: i === 1 ? 'rgb(var(--c-muted))' : undefined,
                  }}
                >
                  {line.replace('.', '')}
                  <span className="text-accent">.</span>
                </span>
              </span>
            ))}
          </h1>

          <p style={reveal(520)} className="hero-intro hero-rise mt-7 max-w-[46ch] text-sm leading-relaxed text-muted sm:text-base">
            {t.hero.intro}
          </p>

          <div style={reveal(600)} className="hero-actions hero-rise mt-9 flex flex-wrap items-center gap-6">
            <a
              href={`${lp('/')}#interactive`}
              onClick={goTo('interactive')}
              data-cursor="follow"
              className="hero-cta group relative inline-flex items-center gap-5 bg-accent px-8 py-5 text-onaccent transition-[transform,box-shadow,background-color] duration-300 ease-tech hover:-translate-y-0.5 hover:bg-text sm:px-9"
            >
              <span className="flex flex-col items-start gap-1.5">
                <span className="flex items-center gap-2.5 font-mono text-[14px] font-semibold uppercase tracking-tech sm:text-[15px]">
                  <span className="relative grid h-2 w-2 place-items-center" aria-hidden>
                    <span className="hero-cta-dot absolute h-2 w-2 rounded-full bg-onaccent" />
                    <span className="relative h-2 w-2 rounded-full bg-onaccent" />
                  </span>
                  {t.hero.cta}
                </span>
                <span className="font-mono text-[11px] normal-case tracking-normal opacity-80">
                  {labs.length} {t.hero.ctaSub}
                </span>
              </span>
              <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>

            <a href={`${lp('/')}#interactive`} onClick={goTo('interactive')} className="hero-scroll group flex items-center gap-2" aria-label={t.hero.scroll} data-cursor="follow">
              <span className="label">[ {t.hero.scroll} ]</span>
              <svg viewBox="0 0 8 22" className="h-5 w-2 text-accent" fill="none" aria-hidden>
                <path d="M4 0v18M1 15l3 3 3-3" stroke="currentColor" strokeWidth="1">
                  {!reduced && (
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0 -3; 0 3; 0 -3"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>
              </svg>
            </a>
          </div>

          {/* rotating role, reads like a status line */}
          <div style={reveal(680)} className="hero-role hero-rise mt-10 flex items-center gap-3 border-t border-line pt-4">
            <span className="label">{t.ui.role}</span>
            <RoleTicker roles={t.hero.roles} reduced={reduced} />
            <span className="label-a">●</span>
          </div>
        </div>

        {/* ── centre column: portrait ── */}
        <div className="relative order-1 lg:order-2 lg:col-span-5">
          <div
            className="hero-zoom hero-portrait relative mx-auto h-[52vh] min-h-[340px] w-full max-w-[520px] sm:h-[62vh] lg:h-[calc(100svh-15rem)] lg:max-w-none"

          >
            <Portrait />
          </div>
        </div>

        {/* ── right column: system metadata ── */}
        <div className="hero-meta order-3 flex flex-col justify-center gap-8 border-t border-line py-8 lg:col-span-2 lg:border-l lg:border-t-0 lg:py-12 lg:pl-6 2xl:pr-10">
          <div style={reveal(300)} className="hero-rise flex flex-row flex-wrap justify-between gap-x-6 gap-y-5 lg:flex-col lg:flex-nowrap">
            <div className="basis-full lg:basis-auto">
              <div className="label mb-2">{t.ux.followLabel}</div>
              <a
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="follow"
                aria-label={t.ux.followFacebook}
                title={t.ux.followFacebook}
                className="group inline-grid h-10 w-10 place-items-center border border-line-strong text-muted transition-all duration-300 hover:border-[#1877f2] hover:bg-[#1877f2]/10 hover:text-[#1877f2] hover:shadow-[0_0_14px_rgba(24,119,242,0.45)]"
              >
                <svg viewBox="0 0 16 16" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" aria-hidden>
                  <path d="M9.2 16V8.7h2.4l.4-2.8H9.2V4.1c0-.8.2-1.4 1.4-1.4H12V.1A19 19 0 0 0 9.9 0C7.8 0 6.4 1.3 6.4 3.6v2.3H4v2.8h2.4V16z" />
                </svg>
              </a>
            </div>
            <VisitorCounter className="basis-full lg:basis-auto" />
            <div>
              <div className="label mb-2">{t.ui.location}</div>
              <div className="font-mono text-[12.5px] uppercase leading-relaxed tracking-tech text-text">
                Budapest
                <br />
                Central Europe
              </div>
            </div>
            <div>
              <div className="label mb-2">{t.ui.build}</div>
              <div className="font-mono text-[12.5px] uppercase tracking-tech text-text">{site.build}</div>
              <div className="label-a mt-1">{t.ui.systemOnline}</div>
            </div>
          </div>

          <div style={reveal(380)} className="hero-rise hidden lg:block">
            <div className="label mb-2">{t.ui.stack}</div>
            <ul className="space-y-1">
              {STACK.map((s, i) => (
                <li key={s} className="group flex items-center justify-between gap-2">
                  <span className="font-mono text-[12.5px] uppercase tracking-tech text-muted transition-colors group-hover:text-text">
                    {s}
                  </span>
                  <span className="label">{String(i + 1).padStart(2, '0')}</span>
                </li>
              ))}
              <li className="label pt-1">{t.ui.andMore}</li>
            </ul>
          </div>

          <div
            style={reveal(460)}
            className="hero-rise hidden rotate-[-4deg] font-hand text-lg leading-tight text-sand lg:block"
            aria-hidden
          >
            {t.hero.note.split('\n').map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* bottom metadata strip */}
      <div
        className={cx(
          'hero-stats hero-rise relative mx-auto mt-2 w-full max-w-[1500px] border-t border-line px-5 sm:px-8 lg:px-12',
          'flex flex-wrap items-stretch pb-3',
        )}
        style={reveal(760)}
      >
        {[
          { v: '08+', l: t.about.stats[0].label },
          { v: '50+', l: t.about.stats[1].label },
          { v: '∞', l: t.hero.roles.length ? t.about.stats[2].label : '' },
        ].map((s) => (
          <div key={s.l} className="flex-1 border-r border-line py-5 pl-4 pr-4 first:pl-0 last:border-r-0 sm:pl-8 sm:pr-8">
            <div className="display text-3xl sm:text-4xl">{s.v}</div>
            <div className="label mt-1">{s.l}</div>
          </div>
        ))}
        <div className="hidden flex-[2] items-center justify-end gap-4 py-5 sm:flex">
          <span className="label">{t.system.availability}</span>
          <span className="ticks-x h-2 w-40 opacity-40" aria-hidden />
        </div>
      </div>
    </section>
  );
}
