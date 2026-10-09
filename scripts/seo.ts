/**
 * Build-time SEO for a single-page app on GitHub Pages.
 *
 * GitHub Pages cannot rewrite URLs, and crawlers and link previews often do not
 * run JavaScript. So after the build this writes a real HTML file for every
 * route (home, each case study, the article index and each article), in English
 * at the bare path, in Hungarian under /hu/ and in Slovak under /sk/, each with
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
import { sk } from '../src/i18n/sk.ts';
import { localePath } from '../src/i18n/paths.ts';
import { articlePath, isoDate, isPublished, parseArticle } from '../src/content/frontmatter.ts';
import { clip, siteGraph } from '../src/lib/seo-shared.ts';
import { tracks } from '../src/data/interview/tracks.ts';
import { modules as courseModules } from '../src/data/courseSyllabus.ts';
import { readyLandings } from '../src/data/landings.ts';
import { industries, INDUSTRIES_SEO } from '../src/data/industries.ts';
import { industryDemo } from '../src/data/industryDemo.ts';
import { CHECK_SEO } from '../src/data/siteCheck.ts';

type Lang = 'en' | 'hu' | 'sk';
const LANGS = ['en', 'hu', 'sk'] as const;
const DICTS = { en, hu, sk };
const OG_LOCALE: Record<Lang, string> = { en: 'en_GB', hu: 'hu_HU', sk: 'sk_SK' };
const FEED_LANG: Record<Lang, string> = { en: 'en-GB', hu: 'hu-HU', sk: 'sk-SK' };
const ARTICLES_WORD: Record<Lang, string> = { en: 'Articles', hu: 'Cikkek', sk: 'Články' };
const feedPath = (lang: Lang) => (lang === 'en' ? '/feed.xml' : `/${lang}/feed.xml`);

/** a share picture in the page's language, else the English one (public/og/…) */
const ogFor = (root: string, base: string, lang: Lang) =>
  fs.existsSync(path.join(root, 'public/og', `${base}.${lang}.png`)) ? `/og/${base}.${lang}.png` : `/og/${base}.en.png`;

interface Page {
  /** full path including the /hu or /sk prefix */
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
  const present = LANGS.filter((l) => alt?.[l]);
  if (!alt || present.length < 2) return [];
  return [
    ...present.map((l) => `<link rel="alternate" hreflang="${l}" href="${site.url}${alt[l]}" />`),
    `<link rel="alternate" hreflang="x-default" href="${site.url}${alt.en ?? alt[present[0]]}" />`,
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
    ...(site.fbAppId ? [`<meta property="fb:app_id" content="${esc(site.fbAppId)}" />`] : []),
    `<meta property="og:locale" content="${OG_LOCALE[page.lang]}" />`,
    ...LANGS.filter((l) => l !== page.lang).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
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
    `<link rel="alternate" type="application/rss+xml" title="${esc(site.name)} — ${ARTICLES_WORD[page.lang]}" href="${site.url}${feedPath(page.lang)}" />`,
  ];
  if (page.jsonLd) {
    tags.push(`<script type="application/ld+json" id="page-jsonld">${ld(page.jsonLd)}</script>`);
  }
  return `<!--seo-->\n    ${tags.join('\n    ')}\n    <!--/seo-->`;
}

const render = (html: string, page: Page) =>
  html.replace(MARKER, headTags(page)).replace(/<html lang="[a-z]+"/, `<html lang="${page.lang}"`);

const both = (bare: string) => ({ en: bare, hu: localePath(bare, 'hu'), sk: localePath(bare, 'sk') });
/** the address in every language a content file exists for */
const whereExists = (bare: string, exists: (l: Lang) => boolean) =>
  Object.fromEntries(LANGS.filter(exists).map((l) => [l, localePath(bare, l)])) as Partial<Record<Lang, string>>;

const home: Page = { path: '/', lang: 'en', alternates: both('/'), title: en.seo.homeTitle, description: en.seo.homeDescription };

function readArticles(root: string) {
  const dir = path.join(root, 'src/content/articles');
  if (!fs.existsSync(dir)) return [];
  const bySlug = new Map<string, { slug: string; versions: Record<string, ReturnType<typeof parseArticle>> }>();
  for (const slug of fs.readdirSync(dir)) {
    for (const lang of LANGS) {
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

  for (const lang of LANGS) {
    const t = DICTS[lang];
    const og = (base: string) => ogFor(root, base, lang);
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
        // each case study shares with its own picture (public/og/project-<id>.<lang>.png)
        image: og(`project-${p.id}`),
        imageAlt: `${p.title}${p.kind ? ` — ${p.kind[lang]}` : ''}`,
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

    // the free tools share with their own pictures (public/og/<tool>.<lang>.png)
    const ogTool = (tool: string) => ({ image: og(tool), imageAlt: tool === 'course' ? t.seo.courseTitle : tool === 'interview' ? t.seo.interviewTitle : tool === 'modernization' ? t.seo.modernTitle : tool === 'garage-designer' ? t.seo.garageTitle : tool === 'shirt-designer' ? t.seo.shirtTitle : tool === 'camera-study' ? t.seo.cameraTitle : t.seo.cvTitle });
    list.push({ path: at('/landing-pages/'), lang, alternates: both('/landing-pages/'), title: t.seo.landingTitle, description: t.seo.landingDescription, image: og('landing-pages'), imageAlt: t.seo.landingTitle });
    for (const l of readyLandings) {
      const bare = `/landing-pages/${l.slug}/`;
      list.push({ path: at(bare), lang, alternates: both(bare), title: `${l.name} — ${t.landing.seoTitle}`, description: `${l.concept[lang]} ${t.landing.seoDescription}`, image: og(`landing-${l.slug}`), imageAlt: `${l.name} — ${t.landing.seoTitle}` });
    }
    list.push({ path: at('/interview/'), lang, alternates: both('/interview/'), title: t.seo.interviewTitle, description: t.seo.interviewDescription, ...ogTool('interview') });
    list.push({ path: at('/course/'), lang, alternates: both('/course/'), title: t.seo.courseTitle, description: t.seo.courseDescription, ...ogTool('course') });
    for (const lesson of courseModules.flatMap((m) => m.lessons)) {
      // a page for every lesson that has content in this language
      const file = path.join(root, `src/content/course/${lesson.slug}.${lang}.json`);
      if (!fs.existsSync(file)) continue;
      const content = JSON.parse(fs.readFileSync(file, 'utf8')) as { intro: string };
      const bare = `/course/${lesson.slug}/`;
      list.push({
        path: at(bare),
        lang,
        alternates: whereExists(bare, (l) => fs.existsSync(path.join(root, `src/content/course/${lesson.slug}.${l}.json`))),
        title: `${lesson.title[lang]} — ${t.seo.courseTitle.split(':')[0]} | ${site.name}`,
        description: clip(content.intro),
        type: 'article',
        ...ogTool('course'),
      });
    }
    list.push({ path: at('/cv-maker/'), lang, alternates: both('/cv-maker/'), title: t.seo.cvTitle, description: t.seo.cvDescription, ...ogTool('cv-maker') });
    list.push({ path: at('/modernization/'), lang, alternates: both('/modernization/'), title: t.seo.modernTitle, description: t.seo.modernDescription, ...ogTool('modernization') });
    list.push({ path: at('/garage-designer/'), lang, alternates: both('/garage-designer/'), title: t.seo.garageTitle, description: t.seo.garageDescription, ...ogTool('garage-designer') });
    list.push({ path: at('/shirt-designer/'), lang, alternates: both('/shirt-designer/'), title: t.seo.shirtTitle, description: t.seo.shirtDescription, ...ogTool('shirt-designer') });
    list.push({ path: at('/camera-study/'), lang, alternates: both('/camera-study/'), title: t.seo.cameraTitle, description: t.seo.cameraDescription, ...ogTool('camera-study') });
    // the free website check and the industry offers
    list.push({ path: at('/website-check/'), lang, alternates: both('/website-check/'), title: CHECK_SEO[lang].title, description: CHECK_SEO[lang].description, image: og('website-check'), imageAlt: CHECK_SEO[lang].title });
    list.push({ path: at('/industries/'), lang, alternates: both('/industries/'), title: INDUSTRIES_SEO.title[lang], description: INDUSTRIES_SEO.description[lang], image: og('industries'), imageAlt: INDUSTRIES_SEO.title[lang] });
    for (const ind of industries) {
      const bare = `/industries/${ind.slug}/`;
      const url = site.url + at(bare);
      list.push({
        path: at(bare),
        lang,
        alternates: both(bare),
        title: ind.seo.title[lang],
        description: ind.seo.description[lang],
        image: og(`industry-${ind.slug}`),
        imageAlt: `${ind.hero.kicker[lang]} — ${industryDemo(ind)?.name ?? ''}`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Service', name: ind.hero.kicker[lang], description: ind.seo.description[lang], url, provider: { '@id': `${site.url}/#person` }, areaServed: 'HU', inLanguage: lang },
            { '@type': 'FAQPage', mainEntity: ind.faq.map((f) => ({ '@type': 'Question', name: f.q[lang], acceptedAnswer: { '@type': 'Answer', text: f.a[lang] } })) },
          ],
        },
      });
    }
    for (const tr of tracks) {
      // only tracks whose question set is in the build
      if (!fs.existsSync(path.join(root, `src/data/interview/${tr.id}.${lang}.json`))) continue;
      const bare = `/interview/${tr.id}/`;
      list.push({
        path: at(bare),
        lang,
        alternates: whereExists(bare, (l) => fs.existsSync(path.join(root, `src/data/interview/${tr.id}.${l}.json`))),
        title: t.seo.interviewTrackTitle.replace('{name}', tr.title[lang]),
        description: clip(t.seo.interviewTrackDescription.replace('{name}', tr.title[lang]).replace('{text}', tr.text[lang])),
        ...ogTool('interview'),
      });
    }

    for (const a of articles) {
      // a page per language the article is written in
      const version = a.versions[lang];
      if (!version) continue;
      const { meta } = version;
      const bare = `/articles/${a.slug}/`;
      const url = site.url + at(bare);
      // each language can have its own picture; otherwise use the other one's
      const image = meta.image ?? a.versions.en?.meta.image ?? a.versions.hu?.meta.image ?? a.versions.sk?.meta.image;
      list.push({
        path: at(bare),
        lang,
        alternates: whereExists(bare, (l) => !!a.versions[l]),
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

/** Budapest local time → RFC 822 (CET is close enough for a feed's ordering) */
const rssDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00+01:00` : `${iso}+01:00`).toUTCString();

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
      // RSS feeds of the published articles, one per language
      const published = readArticles(root)
        .filter((a) => isPublished(articleDate(a)))
        .sort((a, b) => articleDate(b).localeCompare(articleDate(a)))
        .slice(0, 40);
      for (const lang of LANGS) {
        const items = published
          .map((a) => {
            const v = a.versions[lang] ?? a.versions.en ?? a.versions.hu ?? a.versions.sk;
            const link = `${site.url}${localePath(`/articles/${a.slug}/`, lang)}`;
            return [
              '    <item>',
              `      <title>${esc(v.meta.title)}</title>`,
              `      <link>${link}</link>`,
              `      <guid isPermaLink="true">${link}</guid>`,
              `      <pubDate>${rssDate(isoDate(v.meta.date))}</pubDate>`,
              `      <description>${esc(v.meta.description)}</description>`,
              ...v.meta.tags.map((tag) => `      <category>${esc(tag)}</category>`),
              '    </item>',
            ].join('\n');
          })
          .join('\n');
        const self = `${site.url}${feedPath(lang)}`;
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>${esc(site.name)} — ${ARTICLES_WORD[lang]}</title>\n    <link>${site.url}${localePath('/articles/', lang)}</link>\n    <atom:link href="${self}" rel="self" type="application/rss+xml" />\n    <description>${esc(DICTS[lang].seo.articlesDescription)}</description>\n    <language>${FEED_LANG[lang]}</language>\n${items}\n  </channel>\n</rss>\n`;
        const file = path.join(outDir, lang === 'en' ? '' : lang, 'feed.xml');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, xml);
      }

      fs.writeFileSync(
        path.join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`,
      );
    },
  };
}
