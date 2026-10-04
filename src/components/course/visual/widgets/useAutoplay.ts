import { useEffect } from 'react';

/** advances a step index every `ms` while playing; stops at the end */
export function useAutoplay(playing: boolean, i: number, n: number, setI: (i: number) => void, setPlaying: (p: boolean) => void, ms = 1600) {
  useEffect(() => {
    if (!playing) return;
    if (i >= n - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI(i + 1), ms);
    return () => clearTimeout(t);
  }, [playing, i, n, setI, setPlaying, ms]);
}
