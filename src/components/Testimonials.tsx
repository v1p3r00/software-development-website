import { useI18n } from '../i18n';
import { testimonials } from '../data/testimonials';
import { Section, SectionHeader } from './ui';

/** client quotes; renders nothing until src/data/testimonials.ts has entries */
export default function Testimonials() {
  const { t, lang } = useI18n();
  if (testimonials.length === 0) return null;
  return (
    <Section id="testimonials">
      <SectionHeader index="—" title={t.ux.testimonials} subtitle={t.ux.testimonialsSub} />
      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((x) => (
          <li key={x.name} className="flex flex-col border border-line bg-surface p-6">
            <blockquote className="flex-1 text-[16px] leading-relaxed text-text">“{x.quote[lang]}”</blockquote>
            <div className="mt-5 border-t border-line pt-4">
              <div className="font-semibold text-text">{x.url ? <a href={x.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{x.name}</a> : x.name}</div>
              <div className="label mt-1">{x.role[lang]}</div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
