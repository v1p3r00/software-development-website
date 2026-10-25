import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { Section, cx } from '../components/ui';
import { CATALOG, CATEGORIES } from '../effects/catalog';
import type { FxCategory, FxEntry } from '../effects/catalog';
import { FxTouchContext, setFxSound } from '../effects/kit';
import { EFFECTS_SEO } from '../effects/seo';
import type { Lang } from '../data/projects';
import { patreonHref, showEffectsPatreon } from '../effects/patreon';

// every effect is its own chunk, fetched when its card scrolls near the viewport
const modules = import.meta.glob<{ default: ComponentType }>('../effects/fx/*.tsx');
const cache = new Map<string, LazyExoticComponent<ComponentType>>();
function effectFor(id: string) {
  const load = modules[`../effects/fx/${id}.tsx`];
  if (!load) return null;
  let C = cache.get(id);
  if (!C) {
    C = lazy(load);
    cache.set(id, C);
  }
  return C;
}

const T: Record<Lang, { kicker: string; title: string[]; lead: string; all: string; videos: string; sound: string; soundOff: string; open: string; close: string; hint: string; soon: string; band: string; bandCta: string; source: string }> = {
  en: {
    kicker: 'Effects lab',
    title: ['100 interface', 'effects'],
    lead: 'Buttons you can dent, cards that catch the light, forms that fold into paper planes. Every effect here is live code: press, drag and hold. Each one runs on mouse and touch and respects reduced-motion settings.',
    all: 'All',
    videos: 'On video',
    sound: 'Sound on',
    soundOff: 'Sound off',
    open: 'Full screen',
    close: 'Close',
    hint: 'Try it',
    soon: 'In the workshop',
    band: 'All 100 effects as clean React + TypeScript source, with new ones every month.',
    bandCta: 'Source from $5/month on Patreon',
    source: 'Get the source',
  },
  hu: {
    kicker: 'Effektlabor',
    title: ['100 felületi', 'effekt'],
    lead: 'Gombok, amelyeket be lehet nyomni, kártyák, amelyeken megcsillan a fény, űrlapok, amelyek papírrepülővé hajtogatják magukat. Minden effekt élő kód: nyomd meg, húzd, tartsd lenyomva. Egérrel és érintéssel is működnek, és figyelembe veszik a csökkentett mozgás beállítást.',
    all: 'Mind',
    videos: 'Videón',
    sound: 'Hang be',
    soundOff: 'Hang ki',
    open: 'Teljes képernyő',
    close: 'Bezárás',
    hint: 'Próbáld ki',
    soon: 'Készül',
    band: 'Mind a 100 effekt tiszta React + TypeScript forráskóddal, minden hónapban újakkal.',
    bandCta: 'Forráskód havi 5 dollártól a Patreonon',
    source: 'Forráskód',
  },
  sk: {
    kicker: 'Laboratórium efektov',
    title: ['100 efektov', 'rozhrania'],
    lead: 'Tlačidlá, ktoré sa dajú premáčknuť, karty, na ktorých sa leskne svetlo, formuláre, ktoré sa poskladajú do papierového lietadla. Každý efekt je živý kód: stlačte, ťahajte, podržte. Fungujú s myšou aj dotykom a rešpektujú nastavenie obmedzeného pohybu.',
    all: 'Všetky',
    videos: 'Na videu',
    sound: 'Zvuk zap.',
    soundOff: 'Zvuk vyp.',
    open: 'Celá obrazovka',
    close: 'Zavrieť',
    hint: 'Vyskúšajte',
    soon: 'Pripravuje sa',
    band: 'Všetkých 100 efektov ako čistý zdrojový kód v React + TypeScript, každý mesiac nové.',
    bandCta: 'Zdrojový kód od 5 $ mesačne na Patreone',
    source: 'Zdrojový kód',
  },
};

function Live({ id, eager = false }: { id: string; eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(eager);
  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);
  const C = near ? effectFor(id) : null;
  // data-cursor="text" hides the site's cursor ring: each effect owns its cursor
  return (
    <div ref={ref} className="absolute inset-0" data-cursor="text">
      {C && (
        <FxTouchContext.Provider value={eager ? 'none' : 'pan-y'}>
          <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-surface2" />}>
            <C />
          </Suspense>
        </FxTouchContext.Provider>
      )}
    </div>
  );
}

function Card({ e, n, onOpen, t }: { e: FxEntry; n: number; onOpen: () => void; t: (typeof T)['en'] }) {
  const ready = !!modules[`../effects/fx/${e.id}.tsx`];
  return (
    <article className="group relative flex flex-col border border-line bg-surface transition-colors duration-300 hover:border-line-strong">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface2">
        {ready ? (
          <Live id={e.id} />
        ) : (
          <div className="absolute inset-0 grid place-items-center font-mono text-2xs uppercase tracking-tech text-dim">{t.soon}</div>
        )}
        {e.video && (
          <span className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5 bg-black/55 px-2 py-1 font-mono text-[10.5px] uppercase tracking-tech text-white backdrop-blur">
            <i className="h-1.5 w-1.5 rounded-full bg-accent" /> {t.videos}
          </span>
        )}
        {ready && (
          <button
            type="button"
            onClick={onOpen}
            className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center bg-black/55 text-white opacity-80 backdrop-blur transition-opacity hover:opacity-100"
            aria-label={`${t.open}: ${e.name}`}
            title={t.open}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-line p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[17px] font-semibold leading-tight text-text">{e.name}</h2>
          <span className="font-mono text-[11px] tracking-tech text-dim">{String(n).padStart(3, '0')}</span>
        </div>
        <p className="text-[13.5px] leading-snug text-muted">{e.hook}</p>
        {showEffectsPatreon && (
          <a
            href={patreonHref(e.id)}
            target="_blank"
            rel="noreferrer"
            data-cursor="follow"
            className="mt-auto self-start pt-2 font-mono text-[11.5px] uppercase tracking-tech text-accent transition-opacity hover:opacity-80"
          >
            {t.source} →
          </a>
        )}
      </div>
    </article>
  );
}

export default function Effects() {
  const { lang } = useI18n();
  const t = T[lang];
  useSeo({ ...EFFECTS_SEO[lang], path: '/effects/' });
  const [params, setParams] = useSearchParams();
  const solo = params.get('solo');
  const open = params.get('fx');
  const [cat, setCat] = useState<FxCategory | 'all' | 'video'>('all');
  const [sound, setSound] = useState(false);
  const list = useMemo(
    () => CATALOG.map((e, i) => ({ e, n: i + 1 })).filter(({ e }) => cat === 'all' || (cat === 'video' ? e.video : e.cat === cat)),
    [cat],
  );
  const openEntry = open ? CATALOG.find((e) => e.id === open) : undefined;

  useEffect(() => {
    if (!openEntry) return;
    const onKey = (ev: KeyboardEvent) => ev.key === 'Escape' && setParams({}, { replace: true });
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [openEntry, setParams]);

  // a bare stage for screen captures and the video renders: /effects/?solo=<id>
  if (solo)
    return (
      <div className="fixed inset-0 z-[95] bg-black">
        <Live id={solo} eager />
      </div>
    );

  const chip = (id: typeof cat, label: string, count: number) => (
    <button
      key={id}
      type="button"
      onClick={() => setCat(id)}
      aria-pressed={cat === id}
      className={cx(
        'shrink-0 border px-3 py-1.5 font-mono text-[11.5px] uppercase tracking-tech transition-colors',
        cat === id ? 'border-accent bg-accent text-onaccent' : 'border-line-strong text-muted hover:border-accent hover:text-text',
      )}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );

  return (
    <Section id="effects" className="pt-28 lg:pt-32">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <div className="label mb-4">// {t.kicker}</div>
          <h1 className="display text-[clamp(2.6rem,10vw,5.4rem)] leading-[0.9]">
            {t.title.map((line, i) => (
              <span key={i} className={cx('block', i === 1 && 'text-muted')}>
                {line}
                {i === t.title.length - 1 && <span className="ml-1 inline-block h-[0.16em] w-[0.16em] bg-accent align-baseline" />}
              </span>
            ))}
          </h1>
        </div>
        <div>
          <p className="max-w-[56ch] text-[15.5px] leading-relaxed text-muted">{t.lead}</p>
          <button
            type="button"
            onClick={() => {
              setFxSound(!sound);
              setSound(!sound);
            }}
            aria-pressed={sound}
            className="mt-5 inline-flex items-center gap-2 border border-line-strong px-3 py-2 font-mono text-[11.5px] uppercase tracking-tech text-text transition-colors hover:border-accent"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <path d="M2 6h3l4-3v10l-4-3H2z" strokeLinejoin="round" />
              {sound ? <path d="M11 5.5a3.5 3.5 0 010 5M12.8 3.6a6 6 0 010 8.8" strokeLinecap="round" /> : <path d="M11 6l4 4M15 6l-4 4" strokeLinecap="round" />}
            </svg>
            {sound ? t.sound : t.soundOff}
          </button>
        </div>
      </div>

      {showEffectsPatreon && (
        <div className="mt-10 flex flex-col gap-3 border border-line-strong bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14.5px] text-muted">{t.band}</p>
          <a
            href={patreonHref('band')}
            target="_blank"
            rel="noreferrer"
            data-cursor="follow"
            className="shrink-0 bg-accent px-4 py-2.5 font-mono text-[11.5px] uppercase tracking-tech text-onaccent transition-opacity hover:opacity-90"
          >
            {t.bandCta} →
          </a>
        </div>
      )}

      <div className="mt-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]" role="toolbar">
        {chip('all', t.all, CATALOG.length)}
        {chip('video', t.videos, CATALOG.filter((e) => e.video).length)}
        {CATEGORIES.map((c) => chip(c.id, c.name, CATALOG.filter((e) => e.cat === c.id).length))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map(({ e, n }) => (
          <Card key={e.id} e={e} n={n} t={t} onOpen={() => setParams({ fx: e.id }, { replace: false })} />
        ))}
      </div>

      {openEntry && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={openEntry.name}>
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white">
            <div className="min-w-0">
              <div className="truncate font-display text-[17px] font-semibold">{openEntry.name}</div>
              <div className="truncate text-[13px] text-white/60">{openEntry.hook}</div>
            </div>
            {showEffectsPatreon && (
              <a
                href={patreonHref(openEntry.id, 'site-effects-full')}
                target="_blank"
                rel="noreferrer"
                className="ml-auto shrink-0 bg-accent px-3 py-1.5 font-mono text-[11.5px] uppercase tracking-tech text-onaccent"
              >
                {t.source} →
              </a>
            )}
            <button
              type="button"
              autoFocus
              onClick={() => setParams({}, { replace: true })}
              className="shrink-0 border border-white/25 px-3 py-1.5 font-mono text-[11.5px] uppercase tracking-tech hover:border-white"
            >
              {t.close} ✕
            </button>
          </div>
          <div className="relative flex-1">
            <Live key={openEntry.id} id={openEntry.id} eager />
          </div>
        </div>
      )}
    </Section>
  );
}
