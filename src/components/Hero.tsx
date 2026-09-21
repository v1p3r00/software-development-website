import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { site } from '../data/site';
import { usePrefersReducedMotion } from '../hooks/useMisc';
import { Arrow, CornerMarks, cx } from './ui';

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
        <img
          src="/portrait.jpg"
          alt="David Mészáros"
          width={960}
          height={960}
          className="portrait-img portrait-mask h-full w-full scale-[1.06] object-cover object-[50%_22%]"
        />
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
  const { t } = useI18n();
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setRoleIndex((i) => (i + 1) % t.hero.roles.length), 2600);
    return () => window.clearInterval(id);
  }, [reduced, t.hero.roles.length]);

  const reveal = (delay: number) =>
    ({
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity .8s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
    }) as const;

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
        <div className="order-2 flex flex-col justify-center py-10 lg:order-1 lg:col-span-5 lg:py-16">
          <div style={reveal(60)} className="label-a mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            // {t.hero.kicker}
          </div>

          <h1 className="display text-[clamp(2.8rem,10.5vw,5rem)] lg:text-[clamp(2.6rem,5.6vw,6rem)]">
            {[t.hero.l1, t.hero.l2, t.hero.l3].map((line, i) => (
              <span key={line} className="block">
                <span
                  className="block"
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

          <p style={reveal(520)} className="mt-7 max-w-[46ch] text-sm leading-relaxed text-muted sm:text-base">
            {t.hero.intro}
          </p>

          <div style={reveal(600)} className="mt-9 flex flex-wrap items-center gap-6">
            <a
              href="#projects"
              data-cursor="follow"
              className="group relative inline-flex items-center gap-5 border border-line-strong px-7 py-4 font-mono text-[11px] uppercase tracking-tech text-text transition-colors duration-300 hover:border-accent hover:text-accent"
            >
              {t.hero.cta}
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1.5" />
              <span className="absolute -bottom-px -right-px h-1.5 w-1.5 bg-accent" />
            </a>

            <a href="#about" className="group flex items-center gap-2" aria-label={t.hero.scroll} data-cursor="follow">
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
          <div style={reveal(680)} className="mt-10 flex items-center gap-3 border-t border-line pt-4">
            <span className="label">{t.ui.role}</span>
            <span className="relative h-4 flex-1 overflow-hidden">
              {t.hero.roles.map((role, i) => (
                <span
                  key={role}
                  className="absolute inset-0 font-mono text-[11px] uppercase tracking-tech text-text transition-all duration-500 ease-tech"
                  style={{
                    opacity: i === roleIndex ? 1 : 0,
                    transform: `translateY(${(i - roleIndex) * 100}%)`,
                  }}
                >
                  {role}
                </span>
              ))}
            </span>
            <span className="label-a">●</span>
          </div>
        </div>

        {/* ── centre column: portrait ── */}
        <div className="relative order-1 lg:order-2 lg:col-span-5">
          <div
            className="relative mx-auto h-[52vh] min-h-[340px] w-full max-w-[520px] sm:h-[62vh] lg:h-[calc(100svh-15rem)] lg:max-w-none"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'scale(1)' : 'scale(1.04)',
              transition: 'opacity 1.2s cubic-bezier(.16,1,.3,1), transform 1.4s cubic-bezier(.16,1,.3,1)',
            }}
          >
            <Portrait />
          </div>
        </div>

        {/* ── right column: system metadata ── */}
        <div className="order-3 flex flex-col justify-center gap-8 border-t border-line py-8 lg:col-span-2 lg:border-l lg:border-t-0 lg:py-12 lg:pl-6 2xl:pr-10">
          <div style={reveal(300)} className="flex flex-row justify-between gap-6 lg:flex-col">
            <div>
              <div className="label mb-2">{t.ui.location}</div>
              <div className="font-mono text-[11px] uppercase leading-relaxed tracking-tech text-text">
                Budapest
                <br />
                Central Europe
              </div>
            </div>
            <div>
              <div className="label mb-2">{t.ui.build}</div>
              <div className="font-mono text-[11px] uppercase tracking-tech text-text">{site.build}</div>
              <div className="label-a mt-1">{t.ui.systemOnline}</div>
            </div>
          </div>

          <div style={reveal(380)} className="hidden lg:block">
            <div className="label mb-2">{t.ui.stack}</div>
            <ul className="space-y-1">
              {STACK.map((s, i) => (
                <li key={s} className="group flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-tech text-muted transition-colors group-hover:text-text">
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
            className="hidden rotate-[-4deg] font-hand text-lg leading-tight text-sand lg:block"
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
          'relative mx-auto mt-2 w-full max-w-[1500px] border-t border-line px-5 sm:px-8 lg:px-12',
          'flex flex-wrap items-stretch pb-3',
        )}
        style={reveal(760)}
      >
        {[
          { v: '08+', l: t.about.stats[0].label },
          { v: '50+', l: t.about.stats[1].label },
          { v: '∞', l: t.hero.roles.length ? t.about.stats[2].label : '' },
        ].map((s) => (
          <div key={s.l} className="flex-1 border-r border-line py-5 pr-4 last:border-r-0 sm:pr-8">
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
