// kept free of other imports: the build-time SEO step (scripts/seo.ts) uses it too
type Lang = 'en' | 'hu' | 'sk';

/**
 * Hungarian pages live under /hu and Slovak ones under /sk (/hu/, /sk/articles/<slug>/ …);
 * English, the default, keeps the bare paths. Shared by the app and the build-time SEO step.
 */
const PREFIX = /^\/(hu|sk)(?=\/|$)/;

export const langOfPath = (pathname: string): Lang => (PREFIX.exec(pathname)?.[1] as Lang | undefined) ?? 'en';

/** `/hu/articles/x/` → `/articles/x/`, `/sk` → `/` */
export const stripLang = (pathname: string) => pathname.replace(PREFIX, '') || '/';

/** `/articles/x/` → `/hu/articles/x/` (or `/sk/…`), unchanged for English */
export const localePath = (path: string, lang: Lang) => {
  const bare = stripLang(path);
  return lang === 'en' ? bare : `/${lang}${bare}`;
};
