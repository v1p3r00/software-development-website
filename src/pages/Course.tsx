import { Link } from 'react-router-dom';
import { allLessons, isReady, modules, readyLessons } from '../data/course';
import { site } from '../data/site';
import { tracks } from '../data/interview';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { Arrow, CornerMarks, Section, SectionHeader, cx } from '../components/ui';
import ProgressMap from '../components/course/ProgressMap';
import { useProgress } from '../components/course/progress';
import { courseText } from '../components/course/text';
import { usePageTransition } from '../lib/pageTransition';
import { CourseLessonPage } from './lazy';
import PatreonBox from '../components/course/PatreonBox';
import Certificate from '../components/course/Certificate';
import Diagram from '../components/course/visual/Diagram';
import { moduleMap } from '../data/courseMaps';

export default function Course() {
  const { t: site_t, lang, lp } = useI18n();
  const t = courseText[lang];
  const { progress, update } = useProgress();
  const { link } = usePageTransition();
  useSeo({ title: site_t.seo.courseTitle, description: site_t.seo.courseDescription, path: '/course/' });

  const doneCount = allLessons.filter((l) => progress.done[l.slug]).length;
  const minutes = allLessons.reduce((n, l) => n + l.minutes, 0);
  const next =
    (progress.last && readyLessons.find((l) => l.slug === progress.last && !progress.done[l.slug])) ??
    readyLessons.find((l) => !progress.done[l.slug]) ??
    readyLessons[0];
  const started = doneCount > 0 || Boolean(progress.last);
  const pct = Math.round((doneCount / allLessons.length) * 100);
  const lessonNum = (slug: string) => {
    const m = modules.find((x) => x.lessons.some((l) => l.slug === slug))!;
    return `${Number(m.num)}.${m.lessons.findIndex((l) => l.slug === slug) + 1}`;
  };

  return (
    <>
      <Section id="course" className="pt-32 lg:pt-36">
        <SectionHeader
          index="12"
          title={t.title}
          subtitle={t.subtitle}
          right={
            <span className="label flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-accent" aria-hidden />
              {t.progressNote}
            </span>
          }
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg">{t.intro}</p>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-px border border-line bg-line">
              {[
                [t.modules, String(modules.length).padStart(2, '0')],
                [t.lessons, String(allLessons.length)],
                [t.hours, `~${Math.round(minutes / 60)}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-bg p-4">
                  <dt className="label">{k}</dt>
                  <dd className="display mt-1 text-3xl">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="relative border border-line bg-surface p-6">
              <CornerMarks />
              <div className="flex items-baseline justify-between">
                <span className="label">{t.progress}</span>
                <span className="display text-3xl">{pct}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-line" aria-hidden>
                <div className="h-full bg-accent transition-[width] duration-700 ease-tech" style={{ width: `${pct}%` }} />
              </div>
              <p className="label mt-2">
                {doneCount} / {allLessons.length} {t.completed}
              </p>
              {next && (
                <Link
                  to={lp(`/course/${next.slug}/`)}
                  onClick={link(lp(`/course/${next.slug}/`), 'slide', { prepare: CourseLessonPage.preload })}
                  data-cursor="follow"
                  className="group mt-6 flex items-center justify-between gap-4 bg-accent px-5 py-4 text-onaccent transition-colors hover:bg-text"
                >
                  <span>
                    <span className="block font-mono text-[12.5px] uppercase tracking-tech">{started ? t.continue : t.start}</span>
                    <span className="mt-1 block text-sm opacity-85">
                      {lessonNum(next.slug)} · {next.title[lang]}
                    </span>
                  </span>
                  <Arrow className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="label-a mb-6">// {t.map}</div>
          <ProgressMap progress={progress} t={t} />
        </div>
      </Section>

      <Section id="syllabus" className="pt-0 lg:pt-0">
        {doneCount === allLessons.length && <Certificate finishedOn={new Date()} />}
        <SectionHeader index="13" title={t.syllabus} subtitle={`${modules.length} ${t.modules.toLowerCase()} · ${allLessons.length} ${t.lessons.toLowerCase()}`} />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <ol className="border-t border-line lg:col-span-8">
            {modules.map((m) => {
              const ready = m.lessons.some((l) => isReady(l.slug));
              const done = m.lessons.filter((l) => progress.done[l.slug]).length;
              return (
                <li key={m.id} id={`module-${m.id}`} className="scroll-mt-28 border-b border-line py-8">
                  <div className="flex items-start gap-5">
                    <span className="mt-1.5 font-mono text-2xs tracking-tech text-accent">{m.num}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="display text-2xl leading-none sm:text-[2rem]">{m.title[lang]}</h3>
                        <span className="label">{ready ? `${done}/${m.lessons.length} ${t.completed}` : t.soon}</span>
                      </div>
                      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted">{m.summary[lang]}</p>
                      {moduleMap(m.id, lang) && (
                        <details className="group mt-3">
                          <summary className="label-a inline-flex cursor-pointer list-none items-center gap-2 transition-colors hover:text-text">
                            <span className="transition-transform group-open:rotate-90">▸</span>
                            {t.showModuleMap}
                          </summary>
                          <div className="mt-3">
                            <Diagram spec={moduleMap(m.id, lang)!} kicker={t.moduleMap} />
                          </div>
                        </details>
                      )}
                      <ul className="mt-4">
                        {m.lessons.map((l, i) => {
                          const ok = isReady(l.slug);
                          const isDone = progress.done[l.slug];
                          const row = (
                            <>
                              <span
                                aria-hidden
                                className={cx(
                                  'grid h-4 w-4 shrink-0 place-items-center text-[9px]',
                                  isDone ? 'bg-accent text-onaccent' : ok ? 'border border-line-strong' : 'border border-dashed border-line',
                                )}
                              >
                                {isDone ? '✓' : ''}
                              </span>
                              <span className="font-mono text-2xs tracking-tech text-dim">
                                {Number(m.num)}.{i + 1}
                              </span>
                              <span className={cx('flex-1 text-sm', ok ? 'text-text group-hover:text-accent' : 'text-dim')}>{l.title[lang]}</span>
                              <span className="label">{ok ? `${l.minutes} ${t.min}` : t.soon}</span>
                            </>
                          );
                          return (
                            <li key={l.slug}>
                              {ok ? (
                                <Link
                                  to={lp(`/course/${l.slug}/`)}
                                  onClick={link(lp(`/course/${l.slug}/`), 'slide', { prepare: CourseLessonPage.preload })}
                                  data-cursor="follow"
                                  className="group flex items-center gap-3 py-2"
                                >
                                  {row}
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 py-2">{row}</div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {m.project && site.showPatreon && (
                          <a
                            href={site.patreon}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor="follow"
                            className="group flex items-center gap-2 border border-line px-3 py-2 text-[13px] text-muted transition-colors hover:border-accent hover:text-text"
                          >
                            <span className="label-a">{t.project}</span>
                            {m.project[lang]}
                            <span className="text-dim group-hover:text-accent">↗</span>
                          </a>
                        )}
                        {m.tracks.map((id) => {
                          const tr = tracks.find((x) => x.id === id);
                          return tr ? (
                            <Link
                              key={id}
                              to={lp(`/interview/${id}/`)}
                              data-cursor="follow"
                              className="group flex items-center gap-2 border border-line px-3 py-2 text-[13px] text-muted transition-colors hover:border-accent hover:text-text"
                            >
                              <span className="label">{t.practice}</span>
                              {tr.title[lang]}
                              <span className="text-dim group-hover:text-accent">↗</span>
                            </Link>
                          ) : null;
                        })}
                      </div>
                      {!ready && <p className="mt-3 text-[13px] text-dim">{t.comingSoonModule}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              {site.showPatreon && <PatreonBox t={t} />}
              {started && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t.confirmResetProgress)) update(() => ({ done: {}, quiz: {}, exercise: {}, code: {} }));
                  }}
                  className="label mt-4 transition-colors hover:text-accent"
                >
                  {t.reset_progress}
                </button>
              )}
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
