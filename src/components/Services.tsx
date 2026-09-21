import { useState } from 'react';
import { services } from '../data/services';
import { useI18n } from '../i18n';
import { Section, SectionHeader, cx } from './ui';

export default function Services() {
  const { t, pick } = useI18n();
  const [active, setActive] = useState(0);
  const current = services[active];

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
        <ul className="border-t border-line lg:col-span-7">
          {services.map((service, i) => {
            const on = i === active;
            return (
              <li key={service.id} className="border-b border-line">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-expanded={on}
                  data-cursor="follow"
                  className={cx(
                    'group flex w-full items-start gap-4 py-5 pr-4 text-left transition-colors duration-300 sm:gap-6',
                    on ? 'text-text' : 'text-muted',
                  )}
                >
                  <span
                    className={cx(
                      'mt-1.5 font-mono text-2xs tracking-tech transition-colors',
                      on ? 'text-accent' : 'text-dim',
                    )}
                  >
                    {service.num}
                  </span>
                  <span className="flex-1">
                    <span className="display block text-2xl leading-none sm:text-[2rem]">
                      {pick(service.title)}
                    </span>
                    <span
                      className={cx(
                        'mt-2 block max-w-[58ch] text-[13px] leading-relaxed transition-colors sm:text-sm',
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
              </li>
            );
          })}
        </ul>

        {/* process panel */}
        <div className="mt-8 lg:col-span-5 lg:mt-0 lg:border-l lg:border-t lg:border-line lg:pl-8 lg:pt-6">
          <div className="sticky top-28">
            <div className="label-a mb-1">// {t.ui.process}</div>
            <div className="display mb-6 text-xl">{pick(current.title)}</div>

            <ol className="relative">
              <span className="absolute bottom-3 left-[5px] top-3 w-px bg-line" aria-hidden />
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
