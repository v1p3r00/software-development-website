import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { articles, formatDate, inLang, listedArticles, loadBody, useArticleBody } from '../data/articles';
import { isoDate, isPublished } from '../content/frontmatter';
import { site } from '../data/site';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useGoToSection } from '../hooks/useGoToSection';
import { Arrow } from '../components/ui';
import { usePageTransition } from '../lib/pageTransition';
import { ArticlePage, ArticlesPage } from './lazy';
import Breadcrumbs from '../components/Breadcrumbs';
import TableOfContents from '../components/TableOfContents';
import ShareButtons from '../components/ShareButtons';

export default function Article() {
  const { slug } = useParams();
  const { t, lang, lp } = useI18n();
  const goTo = useGoToSection();
  const { link } = usePageTransition();
  const article = articles.find((a) => a.slug === slug);
  const v = article ? inLang(article, lang) : null;
  // the share picture of the language shown, else the other language's
  const image = v?.image ?? article?.versions.en?.image ?? article?.versions.hu?.image;
  // links to other sites (sources, references) open in a new tab
  const body = useArticleBody(article?.slug, lang);
  const html = useMemo(
    () =>
      body !== null
        ? (marked.parse(body, { async: false }) as string).replace(
            /<a href="(https?:\/\/(?!softwaredevelopment\.hu)[^"]+)"/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer"',
          )
        : '',
    [body],
  );

  // newer / older neighbours in the list, and up to three articles sharing the most topics
  const listed = listedArticles();
  const pos = article ? listed.findIndex((a) => a.slug === article.slug) : -1;
  const newer = pos > 0 ? listed[pos - 1] : undefined;
  const older = pos >= 0 && pos < listed.length - 1 ? listed[pos + 1] : undefined;
  const related = useMemo(() => {
    if (!article || !v) return [];
    const mine = new Set(v.tags.map((x) => x.toLowerCase()));
    return listed
      .filter((a) => a.slug !== article.slug)
      .map((a) => ({ a, score: inLang(a, lang).tags.filter((x) => mine.has(x.toLowerCase())).length }))
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, 3)
      .map((x) => x.a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article, lang]);
  const openArticle = (slug: string) => {
    const to = lp(`/articles/${slug}/`);
    return link(to, 'slide', { prepare: () => Promise.all([ArticlePage.preload(), loadBody(slug, lang)]) });
  };

  useEffect(() => window.scrollTo(0, 0), [slug]);

  const jsonLd = useMemo(
    () =>
      article && v
        ? {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: v.title,
            description: v.description,
            datePublished: isoDate(v.date),
            dateModified: isoDate(v.updated ?? v.date),
            inLanguage: article.versions[lang] ? lang : Object.keys(article.versions)[0],
            keywords: v.tags.join(', '),
            url: `${site.url}${lp(`/articles/${article.slug}/`)}`,
            mainEntityOfPage: `${site.url}${lp(`/articles/${article.slug}/`)}`,
            image: site.url + (image ?? site.ogImage),
            author: { '@id': `${site.url}/#person` },
            publisher: { '@id': `${site.url}/#person` },
          }
        : undefined,
    [article, v, lang, image, lp],
  );

  useSeo(
    v && article
      ? {
          title: `${v.title} — ${site.name}`,
          description: v.description,
          path: `/articles/${article.slug}/`,
          type: 'article',
          image,
          // scheduled: reachable by link, but kept out of search results until its date
          noindex: !isPublished(article.date),
          langs: (['en', 'hu'] as const).filter((l) => article.versions[l]),
          jsonLd,
        }
      : { title: t.seo.notFoundTitle, description: t.articles.notFound, path: `/articles/${slug ?? ''}/`, noindex: true },
  );

  if (!article || !v) {
    return (
      <div className="grid min-h-[80vh] place-items-center px-6 text-center">
        <div>
          <div className="display text-5xl">404</div>
          <p className="mt-4 text-sm text-muted">{t.articles.notFound}</p>
          <Link to={lp('/articles/')} className="label-a mt-6 inline-block">
            ← {t.articles.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="relative mx-auto w-full max-w-[1500px] px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-36">
      <div className="mx-auto max-w-[760px]">
        <Breadcrumbs
          items={[
            { label: t.ux.home, to: lp('/') },
            { label: t.articles.title, to: lp('/articles/'), onClick: link(lp('/articles/'), 'collapse', { slug: article.slug, prepare: ArticlesPage.preload }) },
            { label: v.title },
          ]}
        />

        {/* .vt-article / .vt-media: the card on the index grows into this header (see pageTransition.ts) */}
        <header className="vt-article mt-8 border-b border-line pb-8">
          {image && (
            <div className="mb-8 aspect-[1200/630] overflow-hidden border border-line bg-surface2">
              <img src={image} alt="" width={1200} height={630} decoding="async" className="vt-media h-full w-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-2xs uppercase tracking-tech text-dim">
            <span>
              {t.articles.published}{' '}
              <time dateTime={isoDate(v.date)} className="text-text">
                {formatDate(v.date, lang)}
              </time>
            </span>
            {v.updated && (
              <span>
                {t.articles.updated}{' '}
                <time dateTime={isoDate(v.updated)} className="text-text">
                  {formatDate(v.updated, lang)}
                </time>
              </span>
            )}
            <span className="text-accent">
              {v.minutes} {t.articles.minutes}
            </span>
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <h1 className="display min-w-0 text-[clamp(2.2rem,6vw,4rem)] leading-[0.95]">{v.title}</h1>
            <ShareButtons url={`${site.url}${lp(`/articles/${article.slug}/`)}`} className="shrink-0 sm:flex-col sm:items-stretch sm:pt-2" />
          </div>
          {v.description && <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{v.description}</p>}
          {v.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {v.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`${lp('/articles/')}?tag=${encodeURIComponent(tag)}`}
                  data-cursor="follow"
                  className="border border-line px-2 py-0.5 font-mono text-2xs uppercase tracking-tech text-dim transition-colors hover:border-accent hover:text-accent"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        <TableOfContents
          root=".article-body"
          title={t.ux.onThisPage}
          deps={[html]}
          className="mt-8 border border-line bg-surface p-5 xl:fixed xl:right-[max(1.5rem,calc((100vw-760px)/2-300px))] xl:top-36 xl:mt-0 xl:max-h-[70vh] xl:w-[250px] xl:overflow-y-auto xl:border-0 xl:bg-transparent xl:p-0"
        />

        {body === null ? (
          <div className="mt-10 grid gap-3" aria-busy="true">
            {[92, 100, 84, 96, 70].map((w, i) => (
              <div key={i} className="h-4 animate-pulse bg-surface2" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <div className="article-body prose-article mt-10" dangerouslySetInnerHTML={{ __html: html }} />
        )}

        {(newer || older) && (
          <nav aria-label={`${t.ux.prev} / ${t.ux.next}`} className="mt-16 grid gap-3 sm:grid-cols-2">
            {older ? (
              <Link to={lp(`/articles/${older.slug}/`)} onClick={openArticle(older.slug)} data-cursor="follow" className="group border border-line p-5 transition-colors hover:border-accent">
                <span className="label">← {t.ux.prev}</span>
                <span className="mt-2 block font-display text-lg font-extrabold uppercase leading-tight tracking-tight transition-colors group-hover:text-accent">{inLang(older, lang).title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link to={lp(`/articles/${newer.slug}/`)} onClick={openArticle(newer.slug)} data-cursor="follow" className="group border border-line p-5 text-right transition-colors hover:border-accent">
                <span className="label">{t.ux.next} →</span>
                <span className="mt-2 block font-display text-lg font-extrabold uppercase leading-tight tracking-tight transition-colors group-hover:text-accent">{inLang(newer, lang).title}</span>
              </Link>
            )}
          </nav>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="label-a mb-4">// {t.ux.related}</h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {related.map((a) => {
                const r = inLang(a, lang);
                return (
                  <li key={a.slug} className="flex">
                    <Link to={lp(`/articles/${a.slug}/`)} onClick={openArticle(a.slug)} data-cursor="follow" className="group flex w-full flex-col border border-line bg-surface p-4 transition-colors hover:border-accent">
                      <span className="font-display text-base font-extrabold uppercase leading-tight tracking-tight transition-colors group-hover:text-accent">{r.title}</span>
                      <span className="label mt-auto pt-3">
                        {r.minutes} {t.articles.minutes}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <aside className="mt-16 border border-line bg-surface p-6 sm:p-8">
          <div className="font-display text-2xl font-extrabold uppercase tracking-tight">{t.articles.ctaTitle}</div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t.articles.ctaText}</p>
          <a
            href="#contact"
            onClick={goTo('contact')}
            data-cursor="follow"
            className="group mt-6 inline-flex items-center gap-3 bg-accent px-5 py-3 font-mono text-[12.5px] uppercase tracking-tech text-onaccent transition-colors hover:bg-text"
          >
            {t.articles.ctaButton}
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </aside>
      </div>
    </article>
  );
}
