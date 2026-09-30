// kept free of other imports: the build-time SEO step (scripts/seo.ts) uses it too
type Lang = 'en' | 'hu';

/**
 * Hungarian pages live under /hu (/hu/, /hu/articles/<slug>/ …); English, the
 * default, keeps the bare paths. Shared by the app and the build-time SEO step.
 */
const HU_PREFIX = /^\/hu(?=\/|$)/;

export const langOfPath = (pathname: string): Lang => (HU_PREFIX.test(pathname) ? 'hu' : 'en');

/** `/hu/articles/x/` → `/articles/x/`, `/hu` → `/` */
export const stripLang = (pathname: string) => pathname.replace(HU_PREFIX, '') || '/';

/** `/articles/x/` → `/hu/articles/x/` for Hungarian, unchanged for English */
export const localePath = (path: string, lang: Lang) => {
  const bare = stripLang(path);
  return lang === 'hu' ? `/hu${bare}` : bare;
};
