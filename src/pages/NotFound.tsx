import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { labs } from '../data/labs';
import { Arrow } from '../components/ui';

/** unknown addresses: a real "not found" page (kept out of search) instead of the home page */
export default function NotFound({ onSearch }: { onSearch: () => void }) {
  const { t, lp, lang } = useI18n();
  useSeo({ title: t.seo.notFoundTitle, description: t.ux.notFoundText, path: '/404/', noindex: true });
  const links = [
    { to: lp('/'), label: t.ux.notFoundHome },
    { to: lp('/articles/'), label: t.articles.title },
    ...labs.map((l) => ({ to: lp(l.path), label: l.title[lang] })),
  ];
  return (
    <section className="mx-auto grid min-h-[80vh] w-full max-w-[900px] content-center px-5 pb-20 pt-32 sm:px-8">
      <p className="label-a">// 404</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,8vw,5rem)] leading-[0.9]">{t.ux.notFoundTitle}</h1>
      <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted sm:text-lg">{t.ux.notFoundText}</p>
      <button
        type="button"
        onClick={onSearch}
        className="mt-8 flex w-full max-w-[520px] items-center gap-3 border border-line-strong bg-surface px-4 py-3 text-left text-muted transition-colors hover:border-accent hover:text-text"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m13 13 4.5 4.5" strokeLinecap="round" />
        </svg>
        {t.ux.searchHint}…
      </button>
      <ul className="mt-10 grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} data-cursor="follow" className="group flex items-center justify-between border border-line px-4 py-3 transition-colors hover:border-accent">
              <span className="text-[15px] text-text group-hover:text-accent">{l.label}</span>
              <Arrow className="text-dim transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
