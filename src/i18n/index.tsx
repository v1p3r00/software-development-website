import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { en } from './en';
import { hu } from './hu';
import type { Dict } from './en';
import type { L10n, Lang } from '../data/projects';
import { langOfPath, localePath } from './paths';

const dicts: Record<Lang, Dict> = { en, hu };
const STORAGE_KEY = 'dm.lang';

interface Ctx {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
  toggle: () => void;
  pick: (value: L10n) => string;
  /** an in-app path in the current language: lp('/articles/') → '/hu/articles/' in Hungarian */
  lp: (path: string) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

/**
 * The address is the source of truth: /hu/… is Hungarian, everything else English.
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

  const setLang = useCallback(
    (l: Lang) => {
      if (l === lang) return;
      navigate(`${localePath(pathname, l)}${search}${hash}`, { replace: true });
    },
    [lang, pathname, search, hash, navigate],
  );
  const toggle = useCallback(() => setLang(lang === 'en' ? 'hu' : 'en'), [lang, setLang]);
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
