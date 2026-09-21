import { useI18n } from '../i18n';
import { usePrefersReducedMotion, useCountUp } from '../hooks/useMisc';
import { Section, SectionHeader } from './ui';

function Stat({ value, label }: { value: string; label: string }) {
  const reduced = usePrefersReducedMotion();
  const numeric = Number.parseInt(value.replace(/\D/g, ''), 10);
  const animatable = Number.isFinite(numeric) && numeric > 0;
  const { ref, value: n } = useCountUp(animatable ? numeric : 0, 1100, animatable && !reduced);

  return (
    <div className="border-t border-line pt-4">
      <span ref={ref} className="display block text-[2.6rem] leading-none sm:text-[3.4rem]">
        {animatable ? `${String(n).padStart(2, '0')}+` : value}
      </span>
      <span className="label mt-2 block">{label}</span>
    </div>
  );
}

export default function About() {
  const { t } = useI18n();

  return (
    <Section id="about">
      <SectionHeader
        index={t.about.index}
        title={t.about.title}
        subtitle={t.about.subtitle}
        right={<span className="label">/ profile.read()</span>}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <p className="max-w-[62ch] text-lg leading-relaxed text-text sm:text-xl">{t.about.p1}</p>
          <p className="mt-6 max-w-[64ch] text-sm leading-relaxed text-muted sm:text-base">{t.about.p2}</p>
          <p className="mt-5 max-w-[64ch] text-sm leading-relaxed text-muted sm:text-base">{t.about.p3}</p>

          <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8">
            {t.about.stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 lg:border-l lg:border-line lg:pl-8">
          <div className="label mb-4">{t.about.disciplinesLabel}</div>
          <ul className="border-t border-line">
            {t.about.disciplines.map((d, i) => (
              <li
                key={d}
                className="group flex items-baseline justify-between gap-4 border-b border-line py-2.5 transition-colors hover:bg-surface"
              >
                <span className="font-mono text-2xs tracking-tech text-dim">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 text-sm text-muted transition-colors group-hover:text-text">{d}</span>
                <span className="font-mono text-2xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  ●
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 border border-line p-4">
            <div className="label-a mb-3">// {t.ui.signature}</div>
            <p className="font-hand text-2xl leading-tight text-sand">{t.ui.signatureText}</p>
            <div className="ticks-x mt-4 h-2 opacity-40" aria-hidden />
          </div>
        </div>
      </div>
    </Section>
  );
}
