import { Link } from 'react-router-dom';
import { formatDate, inLang, listedArticles } from '../data/articles';
import { isoDate } from '../content/frontmatter';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useGoToSection } from '../hooks/useGoToSection';
import { Arrow, CornerMarks, Section, SectionHeader } from '../components/ui';
import { collapseTarget, usePageTransition } from '../lib/pageTransition';
import { ArticlePage } from './lazy';

export default function Articles() {
  const { t, lang, lp } = useI18n();
  const goTo = useGoToSection();
  const articles = listedArticles();
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
          <span className="label">
            {t.articles.count}: {String(articles.length).padStart(2, '0')}
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
            className="group mt-8 inline-flex items-center gap-3 border border-line-strong px-5 py-3 font-mono text-[11px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent"
          >
            {t.articles.emptyCta}
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      ) : (
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((article, i) => {
            const v = inLang(article, lang);
            // the share picture of the language shown, else the other language's
            const image = v.image ?? article.versions.en?.image ?? article.versions.hu?.image;
            const to = lp(`/articles/${article.slug}/`);
            return (
              <li key={article.slug} className="flex">
                <Link
                  to={to}
                  onClick={link(to, 'expand', (el) => ({ source: el, prepare: ArticlePage.preload }))}
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
                      <span className="text-accent">{String(articles.length - i).padStart(2, '0')}</span>
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
    </Section>
  );
}
