import { useCallback, useEffect, useState } from 'react';

/** what a learner has done, kept in this browser only */
export interface Progress {
  /** lessons marked complete */
  done: Record<string, true>;
  /** best quiz score per lesson, 0..1 */
  quiz: Record<string, number>;
  /** exercises whose tests all passed */
  exercise: Record<string, true>;
  /** the learner's own code per exercise */
  code: Record<string, string>;
  /** the last lesson opened, for "continue" */
  last?: string;
}

const KEY = 'dm.course.v1';
const EVENT = 'dm-course-progress';
const empty = (): Progress => ({ done: {}, quiz: {}, exercise: {}, code: {} });

export function readProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    /* blocked or corrupt storage: start fresh */
  }
  return empty();
}

function write(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode / quota: progress lasts for this visit only */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** shared progress state; every component using it stays in sync */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  useEffect(() => {
    const sync = () => setProgress(readProgress());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const update = useCallback((fn: (p: Progress) => Progress) => write(fn(readProgress())), []);
  return { progress, update };
}
