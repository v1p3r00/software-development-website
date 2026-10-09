import { useEffect, useState } from 'react';
import { articlePath, isoDate, isPublished } from '../content/frontmatter';
import type { ArticleMeta } from '../content/frontmatter';
import type { Lang } from './projects';

/** Intl locale per site language (dates, numbers) */
export const LOCALE: Record<Lang, string> = { en: 'en-GB', hu: 'hu-HU', sk: 'sk-SK' };

export interface ArticleVersion extends ArticleMeta {
  minutes: number;
}

export interface Article {
  slug: string;
  date: string;
  versions: Partial<Record<Lang, ArticleVersion>>;
}

// frontmatter + reading time of every src/content/articles/<slug>/<lang>.md (scripts/articleMeta.ts);
// the text itself is loaded on demand below, so the list and search stay light
const metas = import.meta.glob('../content/articles/*/*.md', {
  query: '?meta',
  import: 'default',
  eager: true,
}) as Record<string, { meta: ArticleMeta; minutes: number }>;
const bodies = import.meta.glob('../content/articles/*/*.md', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

const bodyPath = new Map<string, string>();
const bySlug = new Map<string, Article>();
for (const [path, { meta, minutes }] of Object.entries(metas)) {
  const where = articlePath(path);
  if (!where) continue;
  if (meta.draft && import.meta.env.PROD) continue;
  bodyPath.set(`${where.slug}/${where.lang}`, path);
  const article = bySlug.get(where.slug) ?? { slug: where.slug, date: meta.date, versions: {} };
  article.versions[where.lang] = { ...meta, minutes };
  if (isoDate(meta.date) > isoDate(article.date)) article.date = meta.date;
  bySlug.set(where.slug, article);
}

/** the language actually shown: the reader's, else English, else whichever exists */
const shownLang = (article: Article, lang: Lang): Lang =>
  article.versions[lang] ? lang : article.versions.en ? 'en' : article.versions.hu ? 'hu' : 'sk';

const loaded = new Map<string, string>();
const loading = new Map<string, Promise<string>>();

/** the Markdown text of one language version (without frontmatter); cached */
export function loadBody(slug: string, lang: Lang): Promise<string> {
  const article = bySlug.get(slug);
  const shown = article && shownLang(article, lang);
  const key = `${slug}/${shown}`;
  const path = bodyPath.get(key);
  if (!path) return Promise.resolve('');
  if (loaded.has(key)) return Promise.resolve(loaded.get(key)!);
  let p = loading.get(key);
  if (!p) {
    p = bodies[path]().then((raw) => {
      const text = raw.replace(/\r\n/g, '\n');
      const body = text.startsWith('---\n') ? text.slice(text.indexOf('\n---', 4) + 4).replace(/^\n+/, '') : text;
      loaded.set(key, body);
      return body;
    });
    loading.set(key, p);
  }
  return p;
}

/** the article text if already loaded, else null (and it starts loading) */
export function useArticleBody(slug: string | undefined, lang: Lang): string | null {
  const article = slug ? bySlug.get(slug) : undefined;
  const shown = article && shownLang(article, lang);
  const key = `${slug}/${shown}`;
  const [, rerender] = useState(0);
  useEffect(() => {
    if (!slug || loaded.has(key)) return;
    let live = true;
    void loadBody(slug, lang).then(() => live && rerender((n) => n + 1));
    return () => {
      live = false;
    };
  }, [slug, lang, key]);
  return loaded.get(key) ?? null;
}

/** newest first; a time in the date orders articles from the same day, the slug breaks any remaining tie */
export const articles: Article[] = [...bySlug.values()].sort(
  (a, b) => isoDate(b.date).localeCompare(isoDate(a.date)) || a.slug.localeCompare(b.slug),
);

/**
 * The articles shown on /articles: scheduled ones stay reachable by URL (see
 * Article.tsx) but are only listed once their date has passed. Checked in the
 * browser, so an article appears on time even before the next rebuild.
 */
export const listedArticles = () => articles.filter((a) => isPublished(a.date));

/** the version in the reader's language, falling back to whichever exists */
export function inLang(article: Article, lang: Lang): ArticleVersion {
  return (article.versions[lang] ?? article.versions.en ?? article.versions.hu ?? article.versions.sk)!;
}

export function formatDate(iso: string, lang: Lang) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric' });
}
