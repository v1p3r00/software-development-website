import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Anchor navigation that also works from a case-study route:
 * routes back to the home page first, then scrolls to the section.
 */
export function useGoToSection() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (pathname === '/') {
        scroll();
        history.replaceState(null, '', `#${id}`);
      } else {
        navigate('/');
        window.setTimeout(scroll, 80);
      }
    },
    [navigate, pathname],
  );
}
