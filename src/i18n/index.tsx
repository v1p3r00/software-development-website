import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { en } from './en';
import { hu } from './hu';
import { sk } from './sk';
import type { Dict } from './en';
import { LANGS } from '../data/projects';
import type { L10n, Lang } from '../data/projects';
import { langOfPath, localePath } from './paths';

// the letter-morph engine is fetched once the visitor starts using the page;
// a language switch before that simply happens without the morph
type Morph = typeof import('../lib/morph/engine');
let morph: Morph | null = null;
let morphLoading: Promise<Morph> | null = null;
const loadMorph = () => (morphLoading ??= import('../lib/morph/engine').then((m) => (morph = m)));

const dicts: Record<Lang, Dict> = { en, hu, sk };
const STORAGE_KEY = 'dm.lang';

interface Ctx {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
  toggle: () => void;
  pick: (value: L10n) => string;
  /** an in-app path in the current language: lp('/articles/') → '/hu/articles/' in Hungarian, '/sk/articles/' in Slovak */
  lp: (path: string) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

/**
 * The address is the source of truth: /hu/… is Hungarian, /sk/… Slovak, everything else English.
 * That way every page has a real URL per language, which link previews and search
 * engines can read (they never see a ?query or localStorage). Old ?lang= links and
 * a remembered choice are handled before the first render (initialUrl.ts).
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const lang = langOfPath(pathname);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode: the URL still carries the language */
    }
  }, [lang]);

  // letter-morph between languages: glyphs are measured before the switch (setLang)
  // and animated once every component has committed the new text — this layout
  // effect runs after the children's, before the browser paints.
  useLayoutEffect(() => {
    morph?.playMorph();
  }, [lang]);

  // the morph outlines are only fetched once the visitor starts using the page:
  // scanning the text for its fonts is layout work the first load doesn't need
  useEffect(() => {
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const;
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go));
      void loadMorph().then((m) => m.prefetchMorphFonts());
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    return () => events.forEach((e) => window.removeEventListener(e, go));
  }, [pathname]);

  const setLang = useCallback(
    (l: Lang) => {
      if (l === lang) return;
      morph?.captureMorph();
      navigate(`${localePath(pathname, l)}${search}${hash}`, { replace: true });
    },
    [lang, pathname, search, hash, navigate],
  );
  // cycles through the languages in switcher order
  const toggle = useCallback(() => setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]), [lang, setLang]);
  const pick = useCallback((value: L10n) => value[lang], [lang]);
  const lp = useCallback((path: string) => localePath(path, lang), [lang]);

  const value = useMemo<Ctx>(
    () => ({ lang, t: dicts[lang], setLang, toggle, pick, lp }),
    [lang, setLang, toggle, pick, lp],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used inside LanguageProvider');
  return ctx;
}
