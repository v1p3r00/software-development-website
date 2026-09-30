import { useEffect } from 'react';
import { site } from '../data/site';
export { clip } from '../lib/seo-shared';

export interface Seo {
  title: string;
  description: string;
  /** canonical path with a trailing slash, e.g. `/articles/` */
  path: string;
  type?: 'website' | 'article';
  image?: string;
  noindex?: boolean;
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
export function useSeo({ title, description, path, type = 'website', image, noindex = false, jsonLd }: Seo) {
  useEffect(() => {
    const url = site.url + path;
    const img = site.url + (image ?? site.ogImage);
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
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
  }, [title, description, path, type, image, noindex, jsonLd]);
}
