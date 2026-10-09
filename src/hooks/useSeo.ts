import { useEffect } from 'react';
import { site } from '../data/site';
import { useI18n } from '../i18n';
import { localePath } from '../i18n/paths';
import { LANGS } from '../data/projects';
import type { Lang } from '../data/projects';
export { clip } from '../lib/seo-shared';

export interface Seo {
  title: string;
  description: string;
  /** canonical path with a trailing slash, e.g. `/articles/` */
  path: string;
  type?: 'website' | 'article';
  image?: string;
  noindex?: boolean;
  /** languages this page exists in (for hreflang); all of them by default */
  langs?: Lang[];
  /** page-specific structured data, e.g. a BlogPosting */
  jsonLd?: Record<string, unknown>;
}

const OG_LOCALE: Record<Lang, string> = { en: 'en_GB', hu: 'hu_HU', sk: 'sk_SK' };

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Keeps the document head in step with the current route. The build writes the
 * same tags into a static HTML file per route (scripts/seo.ts), so crawlers and
 * link previews that do not run JavaScript still see them.
 */
export function useSeo({ title, description, path, type = 'website', image, noindex = false, langs, jsonLd }: Seo) {
  const { lang } = useI18n();
  const langKey = (langs ?? LANGS).join(',');
  useEffect(() => {
    const url = site.url + localePath(path, lang);
    const img = site.url + (image ?? site.ogImage);
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:locale', OG_LOCALE[lang]);
    document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove());
    for (const l of LANGS) {
      if (l === lang) continue;
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:locale:alternate');
      el.content = OG_LOCALE[l];
      document.head.appendChild(el);
    }
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', img);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // hreflang: point search engines at the other language's address
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    const available = langKey.split(',') as Lang[];
    if (available.length > 1) {
      const pairs: Array<[string, Lang]> = [...available.map((l): [string, Lang] => [l, l]), ['x-default', available.includes('en') ? 'en' : available[0]]];
      for (const [code, l] of pairs) {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = code;
        link.href = site.url + localePath(path, l);
        document.head.appendChild(link);
      }
    }

    let ld = document.getElementById('page-jsonld') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!ld) {
        ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.id = 'page-jsonld';
        document.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify(jsonLd);
    } else {
      ld?.remove();
    }
  }, [title, description, path, type, image, noindex, jsonLd, lang, langKey]);
}
