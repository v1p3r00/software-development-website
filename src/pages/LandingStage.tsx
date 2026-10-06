import { useEffect, useRef, useState } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { landingBySlug, readyLandings } from '../data/landings';
import { loadLanding, prepareLanding } from '../data/landingLoaders';
import type { Landing } from '../data/landings';
import { useGoToSection } from '../hooks/useGoToSection';
import { pauseOffscreenAnimations } from '../lib/pauseOffscreen';

const MIN_LOADER_MS = 650;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// a page that has loaded once switches back without waiting for the network again
const loaded = new Map<string, ComponentType>();

/**
 * Full-screen stage for one landing page. The site shows only its menu button here.
 * Switching pages raises a loading screen in the next brand's colours, waits for that page's
 * code, fonts and hero images, swaps it in at the top, then lifts the screen away.
 */
export default function LandingStage() {
  const { slug } = useParams();
  const target = landingBySlug(slug);
  const { lp } = useI18n();
  if (!target) return <Navigate to={lp('/landing-pages/')} replace />;
  return <Stage target={target} />;
}

function Stage({ target }: { target: Landing }) {
  const { t, lang, lp } = useI18n();
  const tl = t.landing;
  const [page, setPage] = useState<{ slug: string; C: ComponentType } | null>(() => {
    const C = loaded.get(target.slug);
    return C ? { slug: target.slug, C } : null;
  });
  // what the loader shows: the brand being loaded
  const [loader, setLoader] = useState<{ l: Landing; phase: 'in' | 'out' } | null>(() => ({ l: target, phase: 'in' }));
  const timers = useRef<number[]>([]);

  useSeo({
    title: `${target.name} — ${tl.seoTitle}`,
    description: `${target.concept[lang]} ${tl.seoDescription}`,
    path: `/landing-pages/${target.slug}/`,
  });

  useEffect(() => {
    let cancelled = false;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLoader({ l: target, phase: 'in' });
    const started = performance.now();
    const minMs = reduced() ? 150 : MIN_LOADER_MS;
    const cached = loaded.get(target.slug);
    const ready = cached ? Promise.resolve(cached) : prepareLanding(target);
    ready
      .then((C) => {
        loaded.set(target.slug, C);
        const wait = Math.max(0, minMs - (performance.now() - started));
        timers.current.push(
          window.setTimeout(() => {
            if (cancelled) return;
            setPage({ slug: target.slug, C });
            window.scrollTo(0, 0);
            // let the new page paint under the loader, then lift it
            timers.current.push(
              window.setTimeout(() => {
                if (cancelled) return;
                setLoader({ l: target, phase: 'out' });
                timers.current.push(window.setTimeout(() => !cancelled && setLoader(null), 900));
              }, 80),
            );
          }, wait),
        );
      })
      .catch(() => {
        if (!cancelled) setLoader(null);
      });
    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.slug]);

  // once the page is shown, pause its endless animations while they are off screen
  const stageRef = useRef<HTMLDivElement>(null);
  const settled = page !== null && loader === null;
  useEffect(() => {
    if (!settled || !stageRef.current) return;
    return pauseOffscreenAnimations(stageRef.current);
  }, [settled, page?.slug]);

  const C = page?.C;
  const index = readyLandings.findIndex((l) => l.slug === target.slug);

  return (
    <div ref={stageRef} className="landing-stage">
      {C ? <C key={page.slug} /> : <div className="min-h-screen" style={{ background: target.colors.bg }} />}
      {readyLandings.length > 1 &&
        ([
          ['prev', readyLandings[(index - 1 + readyLandings.length) % readyLandings.length]],
          ['next', readyLandings[(index + 1) % readyLandings.length]],
        ] as const).map(([dir, l]) => (
          <Link
            key={dir}
            to={lp(`/landing-pages/${l.slug}/`)}
            className={`landing-arrow landing-arrow--${dir}`}
            aria-label={`${dir === 'prev' ? tl.prev : tl.next}: ${l.name}`}
            onMouseEnter={() => void loadLanding(l.slug)}
            onFocus={() => void loadLanding(l.slug)}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d={dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="landing-arrow-label">
              <small>{dir === 'prev' ? tl.prev : tl.next}</small>
              {l.name}
            </span>
          </Link>
        ))}
      {!loader && <ContactCta />}
      {loader && <Loader l={loader.l} phase={loader.phase} label={tl.loading} pos={`${String(index + 1).padStart(2, '0')} / ${String(readyLandings.length).padStart(2, '0')}`} />}
    </div>
  );
}

function Loader({ l, phase, label, pos }: { l: Landing; phase: 'in' | 'out'; label: string; pos: string }) {
  const { lang } = useI18n();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${label}: ${l.name}`}
      className={`landing-loader ${phase === 'out' ? 'is-out' : ''}`}
      style={{ '--lb': l.colors.bg, '--lf': l.colors.fg, '--la': l.colors.accent } as CSSProperties}
    >
      <div className="landing-loader-in">
        <div className="landing-loader-meta">
          <span>{pos}</span>
          <span>{l.sector[lang]}</span>
        </div>
        <div className="landing-loader-name" style={{ fontFamily: l.display }}>
          {l.name}
        </div>
        <div className="landing-loader-bar" aria-hidden>
          <i />
        </div>
        <div className="landing-loader-foot">{label}</div>
      </div>
    </div>
  );
}

// once hidden, the offer stays hidden while the visitor browses the other pages
let ctaDismissed = false;

/** a quiet, floating offer: the visitor is looking at the work, so make the next step easy */
function ContactCta() {
  const { t, lp } = useI18n();
  const tl = t.landing;
  const goTo = useGoToSection();
  const [shown, setShown] = useState(false);
  const [hidden, setHidden] = useState(ctaDismissed);
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 1400);
    return () => window.clearTimeout(id);
  }, []);
  if (hidden) return null;
  return (
    <aside className={`landing-cta ${shown ? 'is-on' : ''}`} aria-label={tl.ctaAsk}>
      <span className="landing-cta-dot" aria-hidden />
      <span className="landing-cta-ask">{tl.ctaAsk}</span>
      <a href={`${lp('/')}#contact`} onClick={goTo('contact')} className="landing-cta-btn">
        <span className="landing-cta-long">{tl.ctaBtn}</span>
        <span className="landing-cta-short">{tl.ctaShort}</span>
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
      <button
        type="button"
        className="landing-cta-x"
        aria-label={tl.ctaHide}
        title={tl.ctaHide}
        onClick={() => {
          ctaDismissed = true;
          setHidden(true);
        }}
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </aside>
  );
}
