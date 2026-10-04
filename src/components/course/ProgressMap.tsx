import { Link } from 'react-router-dom';
import { isReady, modules } from '../../data/course';
import { useI18n } from '../../i18n';
import { cx } from '../ui';
import type { Progress } from './progress';
import type { CourseText } from './text';

/** the course as a route of ten stations; each lesson is a dot that fills in when done */
export default function ProgressMap({ progress, t }: { progress: Progress; t: CourseText }) {
  const { lang, lp } = useI18n();
  return (
    <ol className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
      {modules.map((m, i) => {
        const done = m.lessons.filter((l) => progress.done[l.slug]).length;
        const ready = m.lessons.some((l) => isReady(l.slug));
        const complete = done === m.lessons.length;
        const first = m.lessons.find((l) => isReady(l.slug));
        const station = (
          <>
            {/* rail */}
            <span aria-hidden className={cx('absolute left-0 right-0 top-[11px] h-px', i === 0 ? 'left-1/2' : '', i === modules.length - 1 ? 'right-1/2' : '', done ? 'bg-accent' : 'bg-line-strong')} />
            <span
              aria-hidden
              className={cx(
                'relative z-10 mx-auto grid h-[23px] w-[23px] place-items-center border font-mono text-[9px] transition-colors',
                complete ? 'border-accent bg-accent text-onaccent' : done ? 'border-accent bg-bg text-accent' : ready ? 'border-line-strong bg-bg text-text' : 'border-dashed border-line-strong bg-bg text-dim',
              )}
            >
              {complete ? '✓' : m.num}
            </span>
            <span className="mt-3 block px-2 text-center text-[13px] font-semibold leading-snug text-text transition-colors group-hover:text-accent">
              {m.title[lang]}
            </span>
            <span className="mt-2 flex flex-wrap justify-center gap-1 px-2" aria-label={`${done}/${m.lessons.length} ${t.completed}`}>
              {m.lessons.map((l) => (
                <i
                  key={l.slug}
                  className={cx(
                    'block h-1.5 w-1.5',
                    progress.done[l.slug] ? 'bg-accent' : isReady(l.slug) ? 'border border-line-strong' : 'border border-dashed border-line',
                  )}
                />
              ))}
            </span>
            <span className="label mt-1.5 block text-center">{ready ? `${done}/${m.lessons.length}` : t.soon}</span>
          </>
        );
        return (
          <li key={m.id} className="relative">
            {first ? (
              <Link to={lp(`/course/${first.slug}/`)} data-cursor="follow" className="group block">
                {station}
              </Link>
            ) : (
              <a href={`#module-${m.id}`} className="group block opacity-80">
                {station}
              </a>
            )}
          </li>
        );
      })}
    </ol>
  );
}
