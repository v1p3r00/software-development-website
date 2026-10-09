import { langOfPath, localePath } from './paths';

const KNOWN = ['en', 'hu', 'sk'] as const;
type Known = (typeof KNOWN)[number];
const isLang = (v: string | null): v is Known => !!v && (KNOWN as readonly string[]).includes(v);

/**
 * Runs once, before the app renders: turns old `?lang=hu` / `?lang=sk` links into
 * their /hu/ or /sk/ address, and sends a returning visitor who chose Hungarian or
 * Slovak to that language's page.
 * Done with replaceState up front so the first render is already in the right
 * language (no flash, no extra history entry).
 */
export function applyInitialLang(): boolean {
  const { pathname, search, hash } = window.location;
  const params = new URLSearchParams(search);
  const fromQuery = params.get('lang');
  params.delete('lang');

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem('dm.lang');
  } catch {
    /* storage blocked: go by the URL alone */
  }

  const current = langOfPath(pathname);
  const wanted =
    isLang(fromQuery) ? fromQuery : current === 'en' && isLang(stored) && stored !== 'en' ? stored : current;

  if (fromQuery !== null || wanted !== current) {
    const rest = params.toString() ? `?${params}` : '';
    window.history.replaceState(window.history.state, '', `${localePath(pathname, wanted)}${rest}${hash}`);
    return true;
  }
  return false;
}
