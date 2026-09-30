/**
 * Build-time SEO for a single-page app on GitHub Pages.
 *
 * GitHub Pages cannot rewrite URLs, and crawlers and link previews often do not
 * run JavaScript. So after the build this writes a real HTML file for every
 * route (home, each case study, the article index and each article), each with
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
import { articlePath, isoDate, parseArticle } from '../src/content/frontmatter.ts';
import { clip, siteGraph } from '../src/lib/seo-shared.ts';

interface Page {
  path: string;
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

function headTags(page: Page) {
  const url = site.url + page.path;
  const image = site.url + (page.image ?? site.ogImage);
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${page.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:locale:alternate" content="hu_HU" />`,
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

const render = (html: string, page: Page) => html.replace(MARKER, headTags(page));

const home: Page = { path: '/', title: en.seo.homeTitle, description: en.seo.homeDescription };

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

function pages(root: string): Page[] {
  const list: Page[] = [home];

  for (const p of projects) {
    list.push({
      path: `/project/${p.id}/`,
      title: `${p.title}${p.kind ? ` — ${p.kind.en}` : ''} | ${site.name}`,
      description: clip(p.context.en),
    });
  }

  const articles = readArticles(root);
  list.push({
    path: '/articles/',
    title: en.seo.articlesTitle,
    description: en.seo.articlesDescription,
    noindex: articles.length === 0,
  });

  for (const a of articles) {
    const lang = a.versions.en ? 'en' : 'hu';
    const { meta } = a.versions[lang];
    const url = `${site.url}/articles/${a.slug}/`;
    const image = a.versions.en?.meta.image ?? a.versions.hu?.meta.image;
    list.push({
      path: `/articles/${a.slug}/`,
      title: `${meta.title} — ${site.name}`,
      description: clip(meta.description),
      type: 'article',
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
        render(template, { path: '/', title: en.seo.notFoundTitle, description: en.seo.homeDescription, noindex: true }),
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
