import { site } from '../../data/site';
import { Arrow, CornerMarks } from '../ui';
import type { CourseText } from './text';

export default function PatreonBox({ t }: { t: CourseText }) {
  return (
    <div className="relative border border-line bg-surface p-6 sm:p-8">
      <CornerMarks />
      <div className="label-a mb-2">// Patreon</div>
      <div className="display text-2xl leading-none sm:text-3xl">{t.patreonTitle}</div>
      <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-muted">{t.patreonText}</p>
      <div className="mt-6 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
        <div className="bg-bg p-4">
          <div className="label">{t.free}</div>
          <div className="mt-1 text-sm text-text">{t.freeText}</div>
        </div>
        <div className="bg-bg p-4">
          <div className="label-a">{t.supporter}</div>
          <div className="mt-1 text-sm text-text">{t.supporterText}</div>
        </div>
      </div>
      <a
        href={site.patreon}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="follow"
        className="group mt-6 inline-flex items-center gap-4 bg-accent px-6 py-4 font-mono text-[12.5px] uppercase tracking-tech text-onaccent transition-colors hover:bg-text"
      >
        {t.patreonCta}
        <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </div>
  );
}

