import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { en } from './en';
import { hu } from './hu';
import type { Dict } from './en';
import type { L10n, Lang } from '../data/projects';

const dicts: Record<Lang, Dict> = { en, hu };
const STORAGE_KEY = 'dm.lang';

interface Ctx {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
  toggle: () => void;
  pick: (value: L10n) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'hu' || stored === 'en' ? stored : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(() => setLangState((l) => (l === 'en' ? 'hu' : 'en')), []);
  const pick = useCallback((value: L10n) => value[lang], [lang]);

  const value = useMemo<Ctx>(
    () => ({ lang, t: dicts[lang], setLang, toggle, pick }),
    [lang, setLang, toggle, pick],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used inside LanguageProvider');
  return ctx;
}
