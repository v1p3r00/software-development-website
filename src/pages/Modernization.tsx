import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import BeforeAfter from '../components/modernization/BeforeAfter';
import { RevealContext } from '../components/modernization/kit';
import { cases } from '../components/modernization/cases';
import type { ShowCase } from '../components/modernization/cases';
import { cx } from '../components/ui';

type Device = 'desktop' | 'mobile';

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: Array<{ id: T; label: string }>;
  onChange: (id: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex border border-line">
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            data-cursor="follow"
            className={cx(
              'px-3 py-1.5 font-mono text-2xs uppercase tracking-tech transition-colors duration-300 sm:px-3.5',
              on ? 'bg-accent text-onaccent' : 'text-muted hover:text-text',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** small line icons for the case tabs */
function CaseIcon({ id }: { id: ShowCase['id'] }) {
  const d =
    id === 'bakery'
      ? 'M4 20h16M6 20v-7h12v7M8 13V9h8v4M12 9V6M10.5 5.5c0-1 1.5-2 1.5-2s1.5 1 1.5 2a1.5 1.5 0 0 1-3 0z'
      : id === 'law'
        ? 'M12 4v16M7 20h10M5 7h14M5 7l-3 6a3 2 0 0 0 6 0zM19 7l-3 6a3 2 0 0 0 6 0z'
        : 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2';
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/**
 * Website modernization showcase: dated small-business sites and their
 * redesigns, split by a draggable divider. The redesigns are live mockups;
 * nothing in them navigates away. The site header shrinks to its menu button here.
 */
export default function Modernization() {
  const { t, lang } = useI18n();
  const tm = t.modern;
  useSeo({ title: t.seo.modernTitle, description: t.seo.modernDescription, path: '/modernization/' });

  const [params, setParams] = useSearchParams();
  const current = cases.find((c) => c.id === params.get('case')) ?? cases[0];
  const setCase = (id: ShowCase['id']) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        if (id === cases[0].id) n.delete('case');
        else n.set('case', id);
        return n;
      },
      { replace: true, preventScrollReset: true },
    );

  const [device, setDevice] = useState<Device>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
  );
  const [pos, setPos] = useState(50);
  const reveal = useCallback((side: 'before' | 'after') => setPos(side === 'after' ? 0 : 100), []);

  // a single sweep on arrival (and on each case switch) shows that the divider moves
  useEffect(() => {
    setPos(50);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const steps: Array<[number, number]> = [
      [700, 30],
      [1300, 70],
      [1900, 50],
    ];
    const timers = steps.map(([ms, p]) => window.setTimeout(() => setPos(p), ms));
    const stop = () => timers.forEach(clearTimeout);
    window.addEventListener('pointerdown', stop, { once: true });
    window.addEventListener('keydown', stop, { once: true });
    return () => {
      stop();
      window.removeEventListener('pointerdown', stop);
      window.removeEventListener('keydown', stop);
    };
  }, [current.id]);

  const preset = pos === 100 ? 'before' : pos === 0 ? 'after' : pos === 50 ? 'half' : null;
  const stageHeight = 'h-[clamp(460px,calc(100svh-230px),940px)]';
  const { Old, New } = current;

  const compare = (
    <RevealContext.Provider value={reveal}>
      <BeforeAfter
        key={`${current.id}-${device}`}
        before={<Old />}
        after={<New mobile={device === 'mobile'} />}
        beforeWidth={1280}
        afterWidth={device === 'mobile' ? 390 : 1280}
        beforeBg={current.beforeBg}
        pos={pos}
        onPos={setPos}
        labels={{ before: tm.before, after: tm.after }}
        sliderLabel={tm.slider}
        labelsAt={device === 'mobile' ? 'bottom' : 'top'}
        className="h-full w-full"
      />
    </RevealContext.Provider>
  );

  return (
    <section id="modernization" className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-[68px] sm:px-8 lg:px-12">
      {/* title */}
      <div className="flex flex-col gap-3 pt-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="label mb-1.5">
            // {tm.subtitle} · <span className="text-accent">{tm.concept}</span>
          </div>
          <h1 className="display text-[2rem] leading-[0.9] sm:text-[2.6rem]">{tm.title}</h1>
        </div>
        <p className="max-w-[62ch] text-sm leading-relaxed text-muted">{tm.intro}</p>
      </div>

      {/* case switcher + controls */}
      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 xl:flex-row xl:items-center xl:justify-between">
        <div role="tablist" aria-label={tm.examples} className="grid grid-cols-3 gap-px border border-line bg-line sm:flex sm:bg-transparent sm:gap-2 sm:border-0">
          {cases.map((c) => {
            const on = c.id === current.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setCase(c.id)}
                data-cursor="follow"
                className={cx(
                  'flex items-center justify-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-300 sm:justify-start sm:border sm:px-4',
                  on ? 'bg-accent text-onaccent sm:border-accent' : 'bg-bg text-muted hover:text-text sm:border-line sm:bg-transparent sm:hover:border-line-strong',
                )}
              >
                <CaseIcon id={c.id} />
                <span className="min-w-0">
                  <span className="block font-mono text-2xs uppercase tracking-tech">{c.tab[lang]}</span>
                  <span className={cx('hidden max-w-[24ch] truncate text-[12px] sm:block', on ? 'text-onaccent/80' : 'text-dim')}>{c.kind[lang]}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented<Device>
            label={tm.view}
            value={device}
            onChange={setDevice}
            options={[
              { id: 'desktop', label: tm.desktop },
              { id: 'mobile', label: tm.mobile },
            ]}
          />
          <Segmented<'before' | 'half' | 'after'>
            label={tm.compare}
            value={preset}
            onChange={(id) => setPos(id === 'before' ? 100 : id === 'after' ? 0 : 50)}
            options={[
              { id: 'before', label: tm.before },
              { id: 'half', label: '50 / 50' },
              { id: 'after', label: tm.after },
            ]}
          />
        </div>
      </div>

      <p className="mb-3 mt-3 flex items-start gap-2 text-[13px] text-text">
        <span className="mt-[3px] h-2 w-2 shrink-0 bg-accent" aria-hidden />
        {current.tryIt[lang]}
      </p>

      {/* the frame */}
      {device === 'desktop' ? (
        <div className="overflow-hidden rounded-[10px] border border-line-strong bg-surface shadow-2xl">
          <div className="flex items-center gap-3 border-b border-line px-3 py-2" aria-hidden>
            <span className="flex gap-1.5">
              <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-2 rounded-md bg-surface2 px-3 py-1 font-mono text-[11px] text-dim">
              <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" aria-hidden>
                <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
                <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
              </svg>
              <span className="truncate">{current.address}</span>
            </span>
            <span className="w-[42px]" />
          </div>
          <div className={stageHeight}>{compare}</div>
        </div>
      ) : (
        <div className={cx('flex justify-center', stageHeight)}>
          <div className="relative aspect-[9/19] h-full max-w-full rounded-[46px] border-[10px] border-[#151515] bg-[#151515] shadow-2xl ring-1 ring-line-strong">
            <div className="flex h-full flex-col overflow-hidden rounded-[36px] bg-white">
              {/* status bar: keeps the notch clear of the page, like a real phone */}
              <div className="relative flex h-[34px] shrink-0 items-center justify-between bg-white px-6 text-[12px] font-semibold text-black" aria-hidden>
                <span>9:41</span>
                <span className="absolute left-1/2 top-[7px] h-[20px] w-[30%] -translate-x-1/2 rounded-full bg-[#151515]" />
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 18 12" className="h-2.5 w-3.5" fill="currentColor">
                    <rect x="0" y="8" width="3" height="4" rx="1" />
                    <rect x="5" y="5" width="3" height="7" rx="1" />
                    <rect x="10" y="2" width="3" height="10" rx="1" />
                    <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35" />
                  </svg>
                  <svg viewBox="0 0 26 12" className="h-2.5 w-5" fill="none" stroke="currentColor">
                    <rect x="0.5" y="0.5" width="22" height="11" rx="3" opacity="0.5" />
                    <rect x="2.5" y="2.5" width="15" height="7" rx="1.5" fill="currentColor" stroke="none" />
                    <path d="M24.5 4v4" />
                  </svg>
                </span>
              </div>
              <div className="min-h-0 flex-1">{compare}</div>
            </div>
          </div>
        </div>
      )}

      <p className="label mt-3 flex flex-wrap justify-between gap-2">
        <span>{tm.hint}</span>
        <span className="text-dim">{tm.scrollHint}</span>
      </p>

      {/* what changed */}
      <div className="mt-16 border-t border-line pt-10">
        <div className="label-a mb-6">
          // {tm.changedTitle} · {current.tab[lang]}
        </div>
        <ol className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {current.changes.map((c, i) => (
            <li key={c.t.en} className="bg-surface p-6">
              <span className="font-mono text-2xs tracking-tech text-accent">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="mt-3 font-display text-xl font-extrabold uppercase leading-tight tracking-tight">{c.t[lang]}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.d[lang]}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-[80ch] text-xs leading-relaxed text-dim">{tm.note}</p>
      </div>
    </section>
  );
}
