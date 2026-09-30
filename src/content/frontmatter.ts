/**
 * Minimal frontmatter reader for the articles, shared by the app and the
 * build-time SEO step (so it must stay free of DOM and Vite APIs).
 *
 *   ---
 *   title: How long does a custom web app take?
 *   description: One or two sentences for search results and link previews.
 *   date: 2026-10-15           (or 2026-10-15 14:30, to order articles published the same day)
 *   updated: 2026-11-02        (optional)
 *   tags: [web apps, planning]  (optional)
 *   draft: true                 (optional; drafts only show in `npm run dev`)
 *   ---
 */
export interface ArticleMeta {
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  draft: boolean;
}

export interface ParsedArticle {
  meta: ArticleMeta;
  body: string;
}

const unquote = (v: string) => v.trim().replace(/^(['"])(.*)\1$/, '$2');

export function parseArticle(raw: string): ParsedArticle {
  const text = raw.replace(/\r\n/g, '\n');
  const fields: Record<string, string> = {};
  let body = text;

  if (text.startsWith('---\n')) {
    const end = text.indexOf('\n---', 4);
    if (end !== -1) {
      for (const line of text.slice(4, end).split('\n')) {
        const i = line.indexOf(':');
        if (i > 0) fields[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      }
      body = text.slice(end + 4).replace(/^\n+/, '');
    }
  }

  const tags = (fields.tags ?? '')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(unquote)
    .filter(Boolean);

  return {
    meta: {
      title: unquote(fields.title ?? 'Untitled'),
      description: unquote(fields.description ?? ''),
      date: unquote(fields.date ?? ''),
      updated: fields.updated ? unquote(fields.updated) : undefined,
      tags,
      draft: unquote(fields.draft ?? '') === 'true',
    },
    body,
  };
}

/** `…/articles/<slug>/<lang>.md` → { slug, lang } */
export function articlePath(path: string): { slug: string; lang: 'en' | 'hu' } | null {
  const m = /articles\/([^/]+)\/(en|hu)\.md$/.exec(path);
  return m && !m[1].startsWith('_') ? { slug: m[1], lang: m[2] as 'en' | 'hu' } : null;
}

/** `2026-10-15` or `2026-10-15 14:30` → ISO 8601 (`2026-10-15T14:30:00`), for <time> and schema.org */
export function isoDate(value: string) {
  const m = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/.exec(value.trim());
  if (!m) return value;
  return m[2] ? `${m[1]}T${m[2]}:00` : m[1];
}

export const readingMinutes = (body: string) =>
  Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));
