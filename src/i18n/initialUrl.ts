import { langOfPath, localePath } from './paths';

/**
 * Runs once, before the app renders: turns old `?lang=hu` links into their /hu/
 * address, and sends a returning visitor who chose Hungarian to the /hu/ page.
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
    fromQuery === 'hu' || fromQuery === 'en' ? fromQuery : current === 'en' && stored === 'hu' ? 'hu' : current;

  if (fromQuery !== null || wanted !== current) {
    const rest = params.toString() ? `?${params}` : '';
    window.history.replaceState(window.history.state, '', `${localePath(pathname, wanted)}${rest}${hash}`);
    return true;
  }
  return false;
}
