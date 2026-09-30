import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { stripLang } from '../i18n/paths';

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
      const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (stripLang(pathname) === '/') {
        scroll();
        history.replaceState(null, '', `#${id}`);
      } else {
        navigate(lp('/'));
        window.setTimeout(scroll, 80);
      }
    },
    [navigate, pathname, lp],
  );
}
