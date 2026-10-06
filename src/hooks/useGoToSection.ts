import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { stripLang } from '../i18n/paths';
import { scrollToSection } from '../lib/scrollToSection';

/**
 * Anchor navigation that also works from a case-study route:
 * routes back to the home page first, then scrolls to the section.
 */
export function useGoToSection() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { lp } = useI18n();

  return useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (stripLang(pathname) === '/') {
        scrollToSection(id);
        history.replaceState(null, '', id === 'home' ? lp('/') : `#${id}`);
      } else {
        // from another page (e.g. /modernization/): go to the home page, then to the section
        navigate(id === 'home' ? lp('/') : `${lp('/')}#${id}`);
        scrollToSection(id, false);
      }
    },
    [navigate, pathname, lp],
  );
}
