import { useEffect } from 'react';
import { site } from '../data/site';
import { useI18n } from '../i18n';
import { localePath } from '../i18n/paths';
export { clip } from '../lib/seo-shared';

export interface Seo {
  title: string;
  description: string;
  /** canonical path with a trailing slash, e.g. `/articles/` */
  path: string;
  type?: 'website' | 'article';
  image?: string;
  noindex?: boolean;
  /** languages this page exists in (for hreflang); both by default */
  langs?: ('en' | 'hu')[];
  /** page-specific structured data, e.g. a BlogPosting */
  jsonLd?: Record<string, unknown>;
}

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
  const langKey = (langs ?? ['en', 'hu']).join(',');
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
    setMeta('property', 'og:locale', lang === 'hu' ? 'hu_HU' : 'en_GB');
    setMeta('property', 'og:locale:alternate', lang === 'hu' ? 'en_GB' : 'hu_HU');
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
    const available = langKey.split(',') as ('en' | 'hu')[];
    if (available.length > 1) {
      for (const [code, l] of [['en', 'en'], ['hu', 'hu'], ['x-default', 'en']] as const) {
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
