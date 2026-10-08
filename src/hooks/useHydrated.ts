import { useEffect, useState } from 'react';

/** false during prerendering and the first client render, true right after hydration */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
