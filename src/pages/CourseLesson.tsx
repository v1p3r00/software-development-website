import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { allLessons, isReady, loadLesson } from '../data/course';
import type { LessonContent } from '../data/course';
import type { Lang } from '../data/projects';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { Arrow, cx } from '../components/ui';
import Quiz from '../components/course/Quiz';
import ExerciseBox from '../components/course/ExerciseBox';
import PatreonBox from '../components/course/PatreonBox';
import LessonBody from '../components/course/visual/LessonBody';
import TableOfContents from '../components/TableOfContents';
import ShareButtons from '../components/ShareButtons';
import Diagram from '../components/course/visual/Diagram';
import { moduleMap } from '../data/courseMaps';
import { useProgress } from '../components/course/progress';
import { courseText } from '../components/course/text';
import { site } from '../data/site';

export default function CourseLesson() {
  const { slug = '' } = useParams();
  const { t: site_t, lang, lp } = useI18n();
  const t = courseText[lang];
  const { progress, update } = useProgress();
  const [state, setState] = useState<{ slug: string; content: LessonContent; lang: Lang } | null | 'missing'>(null);

  const index = allLessons.findIndex((l) => l.slug === slug);
  const meta = allLessons[index];
  const module = meta?.module;
  const prev = allLessons.slice(0, Math.max(index, 0)).reverse().find((l) => isReady(l.slug));
  const next = index >= 0 ? allLessons.slice(index + 1).find((l) => isReady(l.slug)) : undefined;

  useEffect(() => {
    let live = true;
    loadLesson(slug, lang).then((r) => {
      if (live) setState(r ? { slug, ...r } : 'missing');
    });
    window.scrollTo(0, 0);
    if (meta) update((p) => ({ ...p, last: slug }));
    return () => {
      live = false;
    };
  }, [slug, lang, meta, update]);

  const content = state && state !== 'missing' && state.slug === slug ? state.content : null;

  const shownLang: Lang = state && state !== 'missing' ? state.lang : lang;
  const num = module ? `${Number(module.num)}.${module.lessons.findIndex((l) => l.slug === slug) + 1}` : '';
  useSeo(
    meta && content
      ? {
          title: `${meta.title[lang]} — ${t.title} | ${site.name}`,
          description: content.intro,
          path: `/course/${slug}/`,
          type: 'article',
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: meta.title[lang],
            description: content.intro,
            learningResourceType: 'Lesson',
            educationalLevel: 'Beginner',
            inLanguage: shownLang,
            isPartOf: { '@type': 'Course', name: t.title, url: `${site.url}${lp('/course/')}` },
            author: { '@id': `${site.url}/#person` },
          },
        }
      : { title: site_t.seo.courseTitle, description: site_t.seo.courseDescription, path: `/course/${slug}/`, noindex: state === 'missing' },
  );

  if (state === 'missing' || !meta) {
    return (
      <div className="grid min-h-[80vh] place-items-center px-6 text-center">
        <div>
          <p className="text-sm text-muted">{t.notFound}</p>
          <Link to={lp('/course/')} className="label-a mt-6 inline-block">
            ← {t.backToCourse}
          </Link>
        </div>
      </div>
    );
  }

  const done = Boolean(progress.done[slug]);
  const toggleDone = () =>
    update((p) => {
      const d = { ...p.done };
      if (d[slug]) delete d[slug];
      else d[slug] = true;
      return { ...p, done: d };
    });

  return (
    <div className="relative mx-auto w-full max-w-[1500px] px-5 pb-24 pt-24 sm:px-8 lg:px-12 lg:pt-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <article className="min-w-0 lg:col-span-8">
          <nav aria-label="Breadcrumb" className="label flex flex-wrap items-center gap-2">
            <Link to={lp('/course/')} className="transition-colors hover:text-accent">
              {t.shortTitle}
            </Link>
            <span>/</span>
            <Link to={`${lp('/course/')}#module-${module.id}`} className="transition-colors hover:text-accent">
              {t.module} {module.num} · {module.title[lang]}
            </Link>
          </nav>

          <header className="mt-8 border-b border-line pb-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-2xs uppercase tracking-tech text-dim">
              <span className="text-accent">
                {t.lesson} {num}
              </span>
              <span>
                {meta.minutes} {t.min}
              </span>
              {done && <span className="text-accent">✓ {t.done}</span>}
            </div>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <h1 className="display min-w-0 text-[clamp(2rem,5.5vw,3.6rem)] leading-[0.95]">{meta.title[lang]}</h1>
              <ShareButtons url={`${site.url}${lp(`/course/${slug}/`)}`} className="shrink-0 sm:flex-col sm:items-stretch sm:pt-1" />
            </div>
            {content && <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg">{content.intro}</p>}
            {content && shownLang !== lang && <p className="mt-4 text-[13px] text-dim">{t.langFallback}</p>}
          </header>

          {!content ? (
            <p className="label mt-10">{t.loading}…</p>
          ) : (
            <>
              {module.lessons[0]?.slug === slug && moduleMap(module.id, lang) && (
                <div className="mt-10">
                  <Diagram spec={moduleMap(module.id, lang)!} kicker={`${t.moduleMap} · ${t.module} ${module.num}`} />
                </div>
              )}
              <div className="mt-10">
                <LessonBody body={content.body} lang={shownLang} />
              </div>

              {content.takeaways.length > 0 && (
                <aside className="mt-12 border-l-2 border-accent bg-surface px-6 py-5">
                  <div className="label-a mb-3">// {t.takeaways}</div>
                  <ul className="grid gap-2">
                    {content.takeaways.map((k) => (
                      <li key={k} className="flex gap-3 text-[15px] leading-relaxed text-text">
                        <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden />
                        {k}
                      </li>
                    ))}
                  </ul>
                </aside>
              )}

              {content.quiz.length > 0 && <Quiz key={slug} slug={slug} questions={content.quiz} t={t} />}
              {content.exercise && <ExerciseBox key={`${slug}-${shownLang}`} slug={slug} ex={content.exercise} t={t} />}

              <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8">
                <button
                  type="button"
                  onClick={toggleDone}
                  aria-pressed={done}
                  data-cursor="follow"
                  className={cx(
                    'flex items-center justify-center gap-3 px-6 py-4 font-mono text-[12.5px] uppercase tracking-tech transition-colors',
                    done ? 'border border-accent text-accent hover:bg-accent/10' : 'bg-accent text-onaccent hover:bg-text',
                  )}
                >
                  {done ? `✓ ${t.markedDone} · ${t.undo}` : t.markDone}
                </button>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {prev ? (
                    <Link to={lp(`/course/${prev.slug}/`)} data-cursor="follow" className="group border border-line p-4 transition-colors hover:border-accent">
                      <span className="label">← {t.prev}</span>
                      <span className="mt-1 block text-sm text-text group-hover:text-accent">{prev.title[lang]}</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next && (
                    <Link
                      to={lp(`/course/${next.slug}/`)}
                      onClick={() => {
                        if (!done) toggleDone();
                      }}
                      data-cursor="follow"
                      className="group border border-line p-4 text-right transition-colors hover:border-accent"
                    >
                      <span className="label">{t.next} →</span>
                      <span className="mt-1 block text-sm text-text group-hover:text-accent">{next.title[lang]}</span>
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </article>

        <aside className="lg:col-span-4">
          <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
            {content && <TableOfContents root=".lesson-body" title={site_t.ux.onThisPage} deps={[content]} className="hidden lg:block" />}
            <div>
              <div className="label-a mb-3">// {t.inThisModule}</div>
              <ol className="border-t border-line">
                {module.lessons.map((l, i) => {
                  const on = l.slug === slug;
                  const ok = isReady(l.slug);
                  const row = (
                    <>
                      <span
                        aria-hidden
                        className={cx(
                          'grid h-4 w-4 shrink-0 place-items-center text-[9px]',
                          progress.done[l.slug] ? 'bg-accent text-onaccent' : ok ? 'border border-line-strong' : 'border border-dashed border-line',
                        )}
                      >
                        {progress.done[l.slug] ? '✓' : ''}
                      </span>
                      <span className="font-mono text-2xs text-dim">
                        {Number(module.num)}.{i + 1}
                      </span>
                      <span className={cx('flex-1 text-[13px] leading-snug', on ? 'font-semibold text-accent' : ok ? 'text-text' : 'text-dim')}>{l.title[lang]}</span>
                    </>
                  );
                  return (
                    <li key={l.slug} className="border-b border-line">
                      {ok && !on ? (
                        <Link to={lp(`/course/${l.slug}/`)} className="flex items-center gap-3 py-2.5 hover:text-accent">
                          {row}
                        </Link>
                      ) : (
                        <div aria-current={on ? 'page' : undefined} className="flex items-center gap-3 py-2.5">
                          {row}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
              <Link to={lp('/course/')} className="label mt-4 inline-flex items-center gap-2 transition-colors hover:text-accent">
                <Arrow className="rotate-180" /> {t.backToCourse}
              </Link>
            </div>
            {module.project && site.showPatreon && <PatreonBox t={t} />}
          </div>
        </aside>
      </div>
    </div>
  );
}
