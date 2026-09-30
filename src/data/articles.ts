import { articlePath, isoDate, parseArticle, readingMinutes } from '../content/frontmatter';
import type { ArticleMeta } from '../content/frontmatter';
import type { Lang } from './projects';

export interface ArticleVersion extends ArticleMeta {
  body: string;
  minutes: number;
}

export interface Article {
  slug: string;
  date: string;
  versions: Partial<Record<Lang, ArticleVersion>>;
}

// every src/content/articles/<slug>/<lang>.md, read at build time
const files = import.meta.glob('../content/articles/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const bySlug = new Map<string, Article>();
for (const [path, raw] of Object.entries(files)) {
  const where = articlePath(path);
  if (!where) continue;
  const { meta, body } = parseArticle(raw);
  if (meta.draft && import.meta.env.PROD) continue;
  const article = bySlug.get(where.slug) ?? { slug: where.slug, date: meta.date, versions: {} };
  article.versions[where.lang] = { ...meta, body, minutes: readingMinutes(body) };
  if (isoDate(meta.date) > isoDate(article.date)) article.date = meta.date;
  bySlug.set(where.slug, article);
}

/** newest first; a time in the date orders articles from the same day, the slug breaks any remaining tie */
export const articles: Article[] = [...bySlug.values()].sort(
  (a, b) => isoDate(b.date).localeCompare(isoDate(a.date)) || a.slug.localeCompare(b.slug),
);

/** the version in the reader's language, falling back to whichever exists */
export function inLang(article: Article, lang: Lang): ArticleVersion {
  return (article.versions[lang] ?? article.versions.en ?? article.versions.hu)!;
}

export function formatDate(iso: string, lang: Lang) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(lang === 'hu' ? 'hu-HU' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}
