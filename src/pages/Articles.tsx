import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatDate, inLang, listedArticles, loadBody } from '../data/articles';
import { isoDate } from '../content/frontmatter';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useGoToSection } from '../hooks/useGoToSection';
import { Arrow, CornerMarks, Section, SectionHeader, cx } from '../components/ui';
import { collapseTarget, usePageTransition } from '../lib/pageTransition';
import { ArticlePage } from './lazy';

type Sort = 'new' | 'old' | 'quick';
const SORTS: Sort[] = ['new', 'old', 'quick'];
const TOP_TAGS = 10;

/** lower case without accents, so "kod" finds "kód" and "AI" finds "ai" */
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const tagKey = (tag: string) => norm(tag.trim());

export default function Articles() {
  const { t, lang, lp } = useI18n();
  const goTo = useGoToSection();
  const articles = listedArticles();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const tag = params.get('tag') ?? '';
  const sort: Sort = SORTS.includes(params.get('sort') as Sort) ? (params.get('sort') as Sort) : 'new';
  const [showAllTags, setShowAllTags] = useState(false);
  const query = useDeferredValue(q);
  // full-text search: the article texts are fetched the first time someone types
  const [texts, setTexts] = useState<Record<string, string>>({});
  const wantText = Boolean(q);
  useEffect(() => {
    if (!wantText) return;
    let live = true;
    Promise.all(articles.map((a) => loadBody(a.slug, lang).then((b) => [a.slug, norm(b)] as const))).then(
      (pairs) => live && setTexts(Object.fromEntries(pairs)),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantText, lang]);

  // the filter state lives in the URL: shareable, and kept when coming back from an article
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  // a search index per article in the reader's language: title, description, tags and text
  const indexed = useMemo(
    () =>
      articles.map((article, i) => {
        const v = inLang(article, lang);
        return { article, v, number: articles.length - i, text: norm([v.title, v.description ?? '', v.tags.join(' ')].join(' ')) + ' ' + (texts[article.slug] ?? ''), tags: v.tags.map(tagKey) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, texts],
  );

  const tagCounts = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const { v } of indexed)
      for (const t of v.tags) {
        const k = tagKey(t);
        const e = m.get(k) ?? { label: t, n: 0 };
        e.n++;
        m.set(k, e);
      }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n || a[1].label.localeCompare(b[1].label));
  }, [indexed]);

  const words = norm(query).split(/\s+/).filter(Boolean);
  const shown = indexed
    .filter((x) => (!tag || x.tags.includes(tagKey(tag))) && words.every((w) => x.text.includes(w)))
    .sort((a, b) => (sort === 'old' ? a.number - b.number : sort === 'quick' ? a.v.minutes - b.v.minutes || b.number - a.number : b.number - a.number));
  const filtering = Boolean(q || tag || sort !== 'new');
  const visibleTags = showAllTags ? tagCounts : tagCounts.slice(0, TOP_TAGS);
  // keep the selected topic visible even when it is not among the top ones
  if (tag && !visibleTags.some(([k]) => k === tagKey(tag))) {
    const sel = tagCounts.find(([k]) => k === tagKey(tag));
    if (sel) visibleTags.push(sel);
  }
  const clearAll = () => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true });
  const { link } = usePageTransition();
  // when coming back from an article, its card is where the page collapses into
  const returning = collapseTarget();

  useSeo({
    title: t.seo.articlesTitle,
    description: t.seo.articlesDescription,
    path: '/articles/',
    // an empty index is thin content: keep it out of search results until there is something to read
    noindex: articles.length === 0,
  });

  return (
    <Section id="articles" className="min-h-[70vh] pt-32 lg:pt-36">
      <SectionHeader
        index={t.articles.index}
        title={t.articles.title}
        subtitle={t.articles.subtitle}
        right={
          <span className="label flex items-center gap-4">
            <a href={lang === 'hu' ? '/hu/feed.xml' : '/feed.xml'} className="inline-flex items-center gap-1.5 transition-colors hover:text-accent" title={t.ux.rss}>
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                <circle cx="3" cy="13" r="1.8" />
                <path d="M1.5 6.5a8 8 0 0 1 8 8h-2a6 6 0 0 0-6-6zM1.5 1.5a13 13 0 0 1 13 13h-2a11 11 0 0 0-11-11z" />
              </svg>
              RSS
            </a>
            <span>
            {t.articles.count}: {filtering ? `${String(shown.length).padStart(2, '0')} / ` : ''}
            {String(articles.length).padStart(2, '0')}
            </span>
          </span>
        }
      />

      {articles.length === 0 ? (
        <div className="relative border border-line bg-surface p-8 sm:p-12">
          <CornerMarks />
          <p className="font-mono text-2xs uppercase tracking-tech text-dim">$ ls ./articles</p>
          <p className="mt-2 font-mono text-2xs uppercase tracking-tech text-accent">● {t.articles.emptyTitle}</p>
          <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted sm:text-base">{t.articles.emptyText}</p>
          <a
            href="#contact"
            onClick={goTo('contact')}
            data-cursor="follow"
            className="group mt-8 inline-flex items-center gap-3 border border-line-strong px-5 py-3 font-mono text-[12.5px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent"
          >
            {t.articles.emptyCta}
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      ) : (
        <>
        <div className="mb-8 grid gap-5 border border-line bg-surface p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">{t.articles.search}</span>
              <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="m13 13 4.5 4.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={q}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder={t.articles.searchPlaceholder}
                className="w-full border border-line-strong bg-bg py-3 pl-10 pr-4 text-[15px] text-text outline-none transition-colors placeholder:text-dim focus:border-accent"
              />
            </label>
            <div role="group" aria-label={t.articles.sort} className="flex shrink-0 items-center gap-1.5">
              <span className="label mr-1 hidden sm:inline">{t.articles.sort}</span>
              {SORTS.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={sort === k}
                  onClick={() => setParam('sort', k === 'new' ? '' : k)}
                  className={cx(
                    'border px-3 py-2 font-mono text-[12.5px] uppercase tracking-tech transition-colors',
                    sort === k ? 'border-accent bg-accent text-onaccent' : 'border-line-strong text-muted hover:border-accent hover:text-text',
                  )}
                >
                  {k === 'new' ? t.articles.newest : k === 'old' ? t.articles.oldest : t.articles.quickest}
                </button>
              ))}
            </div>
          </div>
          {tagCounts.length > 0 && (
            <div role="group" aria-label={t.articles.filterByTopic} className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                aria-pressed={!tag}
                onClick={() => setParam('tag', '')}
                className={cx('border px-2.5 py-1 font-mono text-[12.5px] uppercase tracking-tech transition-colors', !tag ? 'border-accent bg-accent text-onaccent' : 'border-line text-muted hover:border-accent hover:text-text')}
              >
                {t.articles.allTopics}
              </button>
              {visibleTags.map(([k, { label, n }]) => {
                const on = tagKey(tag) === k;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setParam('tag', on ? '' : label)}
                    className={cx('border px-2.5 py-1 font-mono text-[12.5px] uppercase tracking-tech transition-colors', on ? 'border-accent bg-accent text-onaccent' : 'border-line text-muted hover:border-accent hover:text-text')}
                  >
                    {label} <span className={on ? 'opacity-80' : 'text-dim'}>{n}</span>
                  </button>
                );
              })}
              {tagCounts.length > TOP_TAGS && (
                <button type="button" onClick={() => setShowAllTags((v) => !v)} className="label-a px-2 py-1 transition-colors hover:text-text">
                  {showAllTags ? `− ${t.articles.fewerTopics}` : `+ ${t.articles.moreTopics} (${tagCounts.length - TOP_TAGS})`}
                </button>
              )}
            </div>
          )}
          <p className="sr-only" role="status" aria-live="polite">
            {shown.length} / {articles.length} {t.articles.results}
          </p>
        </div>

        {shown.length === 0 ? (
          <div className="border border-dashed border-line-strong p-10 text-center">
            <p className="text-base text-muted">{t.articles.noResults}</p>
            <button type="button" onClick={clearAll} className="label-a mt-4 transition-colors hover:text-text">
              ✕ {t.articles.clearFilters}
            </button>
          </div>
        ) : (
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ article, v, number }, i) => {
            // the share picture of the language shown, else the other language's
            const image = v.image ?? article.versions.en?.image ?? article.versions.hu?.image;
            const to = lp(`/articles/${article.slug}/`);
            return (
              <li key={article.slug} className="flex">
                <Link
                  to={to}
                  onClick={link(to, 'expand', (el) => ({ source: el, prepare: () => Promise.all([ArticlePage.preload(), loadBody(article.slug, lang)]) }))}
                  data-cursor="follow"
                  className={`group relative flex w-full flex-col border border-line bg-surface transition-colors duration-300 hover:border-accent${
                    returning === article.slug ? ' vt-source' : ''
                  }`}
                >
                  <div className="relative aspect-[1200/630] overflow-hidden border-b border-line bg-surface2">
                    {image && (
                      <img
                        src={image}
                        alt=""
                        width={1200}
                        height={630}
                        loading={i < 6 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="vt-media h-full w-full object-cover transition-transform duration-700 ease-tech group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="font-mono text-2xs uppercase tracking-tech text-dim">
                      <span className="text-accent">{String(number).padStart(2, '0')}</span>
                      <span className="mx-2">/</span>
                      <time dateTime={isoDate(article.date)}>{formatDate(article.date, lang)}</time>
                      <span className="mx-2">·</span>
                      {v.minutes} {t.articles.minutes}
                    </div>
                    <h2 className="mt-3 font-display text-xl font-extrabold uppercase leading-tight tracking-tight transition-colors group-hover:text-accent">
                      {v.title}
                    </h2>
                    {v.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{v.description}</p>
                    )}
                    <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                      <div className="flex flex-wrap gap-1.5">
                        {v.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="border border-line px-2 py-0.5 font-mono text-2xs uppercase tracking-tech text-dim">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Arrow className="mb-1 shrink-0 text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
        )}
        </>
      )}
    </Section>
  );
}
