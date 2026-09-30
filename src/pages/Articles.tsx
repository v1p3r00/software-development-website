import { Link } from 'react-router-dom';
import { articles, formatDate, inLang } from '../data/articles';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useGoToSection } from '../hooks/useGoToSection';
import { Arrow, CornerMarks, Section, SectionHeader } from '../components/ui';

export default function Articles() {
  const { t, lang } = useI18n();
  const goTo = useGoToSection();

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
        <ol className="border-t border-line">
          {articles.map((article, i) => {
            const v = inLang(article, lang);
            return (
              <li key={article.slug} className="border-b border-line">
                <Link
                  to={`/articles/${article.slug}/`}
                  data-cursor="follow"
                  className="group grid grid-cols-1 gap-3 py-7 sm:grid-cols-12 sm:gap-6"
                >
                  <div className="font-mono text-2xs uppercase tracking-tech text-dim sm:col-span-3">
                    <span className="text-accent">{String(articles.length - i).padStart(2, '0')}</span>
                    <span className="mx-2">/</span>
                    <time dateTime={article.date}>{formatDate(article.date, lang)}</time>
                    <div className="mt-1">
                      {v.minutes} {t.articles.minutes}
                    </div>
                  </div>
                  <div className="sm:col-span-8">
                    <h2 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight transition-colors group-hover:text-accent sm:text-3xl">
                      {v.title}
                    </h2>
                    {v.description && <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-muted">{v.description}</p>}
                    {v.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {v.tags.map((tag) => (
                          <span key={tag} className="border border-line px-2 py-0.5 font-mono text-2xs uppercase tracking-tech text-dim">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="hidden items-start justify-end sm:col-span-1 sm:flex">
                    <Arrow className="mt-2 text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
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
