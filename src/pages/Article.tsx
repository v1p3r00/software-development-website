import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { articles, formatDate, inLang } from '../data/articles';
import { isoDate, isPublished } from '../content/frontmatter';
import { site } from '../data/site';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useGoToSection } from '../hooks/useGoToSection';
import { Arrow } from '../components/ui';
import { usePageTransition } from '../lib/pageTransition';
import { ArticlesPage } from './lazy';

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
  const html = useMemo(
    () =>
      v
        ? (marked.parse(v.body, { async: false }) as string).replace(
            /<a href="(https?:\/\/(?!softwaredevelopment\.hu)[^"]+)"/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer"',
          )
        : '',
    [v],
  );

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
        <Link
          to={lp('/articles/')}
          onClick={link(lp('/articles/'), 'collapse', { slug: article.slug, prepare: ArticlesPage.preload })}
          data-cursor="follow"
          className="label transition-colors hover:text-accent"
        >
          ← {t.articles.back}
        </Link>

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
          <h1 className="display mt-5 text-[clamp(2.2rem,6vw,4rem)] leading-[0.95]">{v.title}</h1>
          {v.description && <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{v.description}</p>}
          {v.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {v.tags.map((tag) => (
                <span key={tag} className="border border-line px-2 py-0.5 font-mono text-2xs uppercase tracking-tech text-dim">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose-article mt-10" dangerouslySetInnerHTML={{ __html: html }} />

        <aside className="mt-16 border border-line bg-surface p-6 sm:p-8">
          <div className="font-display text-2xl font-extrabold uppercase tracking-tight">{t.articles.ctaTitle}</div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t.articles.ctaText}</p>
          <a
            href="#contact"
            onClick={goTo('contact')}
            data-cursor="follow"
            className="group mt-6 inline-flex items-center gap-3 bg-accent px-5 py-3 font-mono text-[11px] uppercase tracking-tech text-onaccent transition-colors hover:bg-text"
          >
            {t.articles.ctaButton}
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </aside>
      </div>
    </article>
  );
}
