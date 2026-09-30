/**
 * Build-time SEO for a single-page app on GitHub Pages.
 *
 * GitHub Pages cannot rewrite URLs, and crawlers and link previews often do not
 * run JavaScript. So after the build this writes a real HTML file for every
 * route (home, each case study, the article index and each article), in English
 * at the bare path and in Hungarian under /hu/, each with
 * its own title, description, canonical URL, Open Graph / Twitter tags and
 * structured data, plus sitemap.xml, robots.txt and a noindex 404 page.
 * The app then takes over as usual and keeps the head current (useSeo).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { projects } from '../src/data/projects.ts';
import { site } from '../src/data/site.ts';
import { en } from '../src/i18n/en.ts';
import { hu } from '../src/i18n/hu.ts';
import { localePath } from '../src/i18n/paths.ts';
import { articlePath, isoDate, isPublished, parseArticle } from '../src/content/frontmatter.ts';
import { clip, siteGraph } from '../src/lib/seo-shared.ts';

type Lang = 'en' | 'hu';

interface Page {
  /** full path including the /hu prefix for Hungarian pages */
  path: string;
  lang: Lang;
  /** the page's path in each language it exists in, for hreflang */
  alternates?: Partial<Record<Lang, string>>;
  title: string;
  description: string;
  type?: 'website' | 'article';
  /** link-preview picture under public/, defaults to the site card */
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  jsonLd?: object;
  lastmod?: string;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// JSON inside <script>: never let a value close the tag early
const ld = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c');

const MARKER = /<!--seo-->[\s\S]*?<!--\/seo-->|<!--seo-->/;

function hreflang(page: Page) {
  const alt = page.alternates;
  if (!alt?.en || !alt.hu) return [];
  return [
    `<link rel="alternate" hreflang="en" href="${site.url}${alt.en}" />`,
    `<link rel="alternate" hreflang="hu" href="${site.url}${alt.hu}" />`,
    `<link rel="alternate" hreflang="x-default" href="${site.url}${alt.en}" />`,
  ];
}

function headTags(page: Page) {
  const url = site.url + page.path;
  const image = site.url + (page.image ?? site.ogImage);
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...hreflang(page),
    `<meta property="og:type" content="${page.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:locale" content="${page.lang === 'hu' ? 'hu_HU' : 'en_GB'}" />`,
    `<meta property="og:locale:alternate" content="${page.lang === 'hu' ? 'en_GB' : 'hu_HU'}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(page.imageAlt ?? `${site.name} — ${site.domain}`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json" id="site-jsonld">${ld(siteGraph())}</script>`,
  ];
  if (page.jsonLd) {
    tags.push(`<script type="application/ld+json" id="page-jsonld">${ld(page.jsonLd)}</script>`);
  }
  return `<!--seo-->\n    ${tags.join('\n    ')}\n    <!--/seo-->`;
}

const render = (html: string, page: Page) =>
  html.replace(MARKER, headTags(page)).replace(/<html lang="[a-z]+"/, `<html lang="${page.lang}"`);

const both = (bare: string) => ({ en: bare, hu: localePath(bare, 'hu') });

const home: Page = { path: '/', lang: 'en', alternates: both('/'), title: en.seo.homeTitle, description: en.seo.homeDescription };

function readArticles(root: string) {
  const dir = path.join(root, 'src/content/articles');
  if (!fs.existsSync(dir)) return [];
  const bySlug = new Map<string, { slug: string; versions: Record<string, ReturnType<typeof parseArticle>> }>();
  for (const slug of fs.readdirSync(dir)) {
    for (const lang of ['en', 'hu']) {
      const file = path.join(dir, slug, `${lang}.md`);
      const where = articlePath(`articles/${slug}/${lang}.md`);
      if (!where || !fs.existsSync(file)) continue;
      const parsed = parseArticle(fs.readFileSync(file, 'utf8'));
      if (parsed.meta.draft) continue;
      const entry = bySlug.get(slug) ?? { slug, versions: {} };
      entry.versions[lang] = parsed;
      bySlug.set(slug, entry);
    }
  }
  return [...bySlug.values()];
}

type SourceArticle = ReturnType<typeof readArticles>[number];

/** an article's publication time: the later of its language versions' dates */
const articleDate = (a: SourceArticle) =>
  Object.values(a.versions)
    .map((v) => isoDate(v.meta.date))
    .sort()
    .pop() ?? '';

function pages(root: string): Page[] {
  const list: Page[] = [];
  const articles = readArticles(root);

  for (const lang of ['en', 'hu'] as const) {
    const t = lang === 'en' ? en : hu;
    const at = (bare: string) => localePath(bare, lang);

    list.push({ path: at('/'), lang, alternates: both('/'), title: t.seo.homeTitle, description: t.seo.homeDescription });

    for (const p of projects) {
      const bare = `/project/${p.id}/`;
      list.push({
        path: at(bare),
        lang,
        alternates: both(bare),
        title: `${p.title}${p.kind ? ` — ${p.kind[lang]}` : ''} | ${site.name}`,
        description: clip(p.context[lang]),
      });
    }

    list.push({
      path: at('/articles/'),
      lang,
      alternates: both('/articles/'),
      title: t.seo.articlesTitle,
      description: t.seo.articlesDescription,
      noindex: !articles.some((a) => isPublished(articleDate(a))),
    });

    for (const a of articles) {
      // a page per language the article is written in
      const version = a.versions[lang];
      if (!version) continue;
      const { meta } = version;
      const bare = `/articles/${a.slug}/`;
      const url = site.url + at(bare);
      // each language can have its own picture; otherwise use the other one's
      const image = meta.image ?? a.versions.en?.meta.image ?? a.versions.hu?.meta.image;
      list.push({
        path: at(bare),
        lang,
        alternates: {
          en: a.versions.en ? bare : undefined,
          hu: a.versions.hu ? localePath(bare, 'hu') : undefined,
        },
        title: `${meta.title} — ${site.name}`,
        description: clip(meta.description),
        type: 'article',
        // scheduled articles get a live page now (so posts can link to it) but stay out of
        // search and the sitemap until the daily rebuild after their date
        noindex: !isPublished(articleDate(a)),
        image,
        imageAlt: image ? meta.title : undefined,
        lastmod: isoDate(meta.updated ?? meta.date).slice(0, 10),
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: meta.title,
          description: meta.description,
          datePublished: isoDate(meta.date),
          dateModified: isoDate(meta.updated ?? meta.date),
          inLanguage: lang,
          keywords: meta.tags.join(', '),
          url,
          mainEntityOfPage: url,
          image: site.url + (image ?? site.ogImage),
          author: { '@id': `${site.url}/#person` },
          publisher: { '@id': `${site.url}/#person` },
        },
      });
    }
  }
  return list;
}

export function seoPages(): Plugin {
  let root = process.cwd();
  let outDir = 'dist';
  return {
    name: 'seo-pages',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    // dev server and build: the home page's tags go into index.html itself
    transformIndexHtml(html) {
      return render(html, home);
    },
    closeBundle() {
      const indexFile = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexFile)) return;
      const template = fs.readFileSync(indexFile, 'utf8');
      const all = pages(root);

      for (const page of all) {
        const file = path.join(outDir, page.path, 'index.html');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, render(template, page));
      }

      // GitHub Pages serves this for any unknown URL (with a 404 status); the
      // app still boots, so client-side routes keep working
      fs.writeFileSync(
        path.join(outDir, '404.html'),
        render(template, { path: '/', lang: 'en', title: en.seo.notFoundTitle, description: en.seo.homeDescription, noindex: true }),
      );

      const urls = all
        .filter((p) => !p.noindex)
        // only articles carry a real modification date; a build date on every page would be noise
        .map((p) =>
          p.lastmod
            ? `  <url>\n    <loc>${site.url}${p.path}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </url>`
            : `  <url>\n    <loc>${site.url}${p.path}</loc>\n  </url>`,
        );
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      );
      fs.writeFileSync(
        path.join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`,
      );
    },
  };
}
