import { useLayoutEffect, useRef, useState } from 'react';
import { services } from '../data/services';
import { useI18n } from '../i18n';
import { Section, SectionHeader, cx } from './ui';

export default function Services() {
  const { t, pick } = useI18n();
  const [active, setActive] = useState(0);
  const current = services[active];
  // phones (accordion): opening a service closes the one above it, which moves it up —
  // once the change is on screen, bring it back under the header if it went past it
  const tapped = useRef<HTMLButtonElement | null>(null);
  useLayoutEffect(() => {
    const el = tapped.current;
    tapped.current = null;
    if (!el || !window.matchMedia('(max-width: 767px)').matches) return;
    const top = el.getBoundingClientRect().top;
    if (top < 72) window.scrollBy({ top: top - 84, behavior: 'instant' });
  }, [active]);

  const steps = [
    { key: 'input', label: t.services.flow.input, value: pick(current.flow.input) },
    { key: 'process', label: t.services.flow.process, value: pick(current.flow.process) },
    { key: 'system', label: t.services.flow.system, value: pick(current.flow.system) },
    { key: 'output', label: t.services.flow.output, value: pick(current.flow.output) },
  ];

  return (
    <Section id="services">
      <SectionHeader
        index={t.services.index}
        title={t.services.title}
        subtitle={t.services.subtitle}
        right={<span className="label hidden sm:block">{t.services.hint}</span>}
      />

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
        {/* list */}
        <ul className="hp-services border-t border-line lg:col-span-7">
          {services.map((service, i) => {
            const on = i === active;
            return (
              <li key={service.id} className="border-b border-line">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onPointerDown={(e) => (tapped.current = e.currentTarget)}
                  onClick={() => {
                    setActive(i);
                    tapped.current = null;
                  }}
                  aria-expanded={on}
                  data-cursor="follow"
                  className={cx(
                    'group sv-row',
                    on ? 'text-text' : 'text-muted',
                  )}
                >
                  <span
                    className={cx(
                      'sv-num',
                      on ? 'text-accent' : 'text-dim',
                    )}
                  >
                    {service.num}
                  </span>
                  <span className="flex-1">
                    <span className="sv-title">
                      {pick(service.title)}
                    </span>
                    <span
                      className={cx(
                        'sv-text',
                        on ? 'text-muted' : 'text-dim',
                      )}
                    >
                      {pick(service.desc)}
                    </span>
                  </span>
                  <span
                    className={cx(
                      'mt-2 h-px transition-all duration-500 ease-tech',
                      on ? 'w-10 bg-accent' : 'w-4 bg-line-strong',
                    )}
                  />
                </button>
                {/* phones: the list is an accordion, the open service shows its process inline (the panel is hidden) */}
                {on && (
                  <ol className="hp-sv-flow md:hidden">
                    {steps.map((step, j) => (
                      <li key={step.key}>
                        <span className={cx('hp-sv-dot', j === 3 && 'is-end')} aria-hidden />
                        <span className="label block">{step.label}</span>
                        <span className="mt-0.5 block font-mono text-[12.5px] uppercase tracking-tech text-text">{step.value}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>

        {/* process panel */}
        <div className="hp-sv-panel mt-8 lg:col-span-5 lg:mt-0 lg:border-l lg:border-t lg:border-line lg:pl-8 lg:pt-6">
          <div className="sticky top-28">
            <div className="label-a mb-1">// {t.ui.process}</div>
            <div className="display mb-6 text-xl">{pick(current.title)}</div>

            {/* the vertical rail is drawn by ::before, so the <ol> holds only <li> items */}
            <ol className="relative before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-line before:content-['']">
              {steps.map((step, i) => (
                <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                  <span
                    className={cx(
                      'relative z-10 mt-1 h-[11px] w-[11px] shrink-0 border transition-colors duration-500',
                      i === 3 ? 'border-accent bg-accent' : 'border-line-strong bg-bg',
                    )}
                  />
                  <span className="flex-1">
                    <span className="label block">
                      {i > 0 && '→ '}
                      {step.label}
                    </span>
                    <span
                      key={`${current.id}-${step.key}`}
                      className="mt-1 block font-mono text-[13px] uppercase tracking-tech text-text"
                      style={{ animation: 'fadeUp .45s cubic-bezier(.16,1,.3,1) both', animationDelay: `${i * 60}ms` }}
                    >
                      {step.value}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="ticks-x mt-8 h-2 opacity-40" aria-hidden />
          </div>
        </div>
      </div>
    </Section>
  );
}
