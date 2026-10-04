import { useEffect, useState } from 'react';

/** whether the decorative cursor ring is on; the normal system cursor always stays visible */
const KEY = 'dm.cursor';
const EVENT = 'dm-cursor-pref';

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setCursorFx(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* private mode: the choice lasts for this page only */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: on }));
}

export function useCursorPref(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(read);
  useEffect(() => {
    const onChange = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  return [on, setCursorFx];
}
