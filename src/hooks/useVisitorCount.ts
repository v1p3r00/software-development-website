import { useEffect, useState } from 'react';
import { site } from '../data/site';

const COUNTED = 'dm.visit.counted';
const COUNT = 'dm.visit.count';

const session = {
  get: (k: string) => {
    try {
      return window.sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      window.sessionStorage.setItem(k, v);
    } catch {
      /* private mode: the visit is simply counted again next time */
    }
  },
};

// one request per page load, however many components ask (and StrictMode's double effects)
let pending: Promise<number | null> | null = null;

// The worker only answers https://softwaredevelopment.hu (CORS), and a blocked request
// would still add a visit. So local development never calls it and shows a sample.
const DEV_SAMPLE = 1284;

/**
 * The worker adds a visit on every request, so each browser session calls it once
 * and reuses the number afterwards: reloads and in-site navigation are not counted
 * again.
 */
function loadCount(): Promise<number | null> {
  if (pending) return pending;
  if (import.meta.env.DEV) {
    pending = Promise.resolve(DEV_SAMPLE);
    return pending;
  }
  const cached = Number(session.get(COUNT));
  if (session.get(COUNTED) && Number.isFinite(cached) && cached > 0) {
    pending = Promise.resolve(cached);
    return pending;
  }
  pending = fetch(site.counterEndpoint, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data: { visitors?: unknown } | null) => {
      const n = Number(data?.visitors);
      if (!Number.isFinite(n) || n < 0) return null;
      session.set(COUNTED, '1');
      session.set(COUNT, String(n));
      return n;
    })
    .catch(() => null);
  return pending;
}

/** undefined while loading, null if the counter is unavailable */
export function useVisitorCount() {
  const [count, setCount] = useState<number | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    loadCount().then((n) => alive && setCount(n));
    return () => {
      alive = false;
    };
  }, []);
  return count;
}
