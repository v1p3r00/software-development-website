import { useEffect, useRef, useState } from 'react';
import { Frame, tr } from './Frame';
import type { WidgetProps } from './Frame';

type C = 'App' | 'Header' | 'Counter' | 'TaskList';

export default function ReactRerender({ lang }: WidgetProps) {
  const t = tr(lang);
  const [count, setCount] = useState(0);
  const [dark, setDark] = useState(false);
  const [memo, setMemo] = useState(false);
  const [renders, setRenders] = useState<Record<C, number>>({ App: 1, Header: 1, Counter: 1, TaskList: 1 });
  const [flash, setFlash] = useState<C[]>([]);
  const [why, setWhy] = useState('');
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const update = (what: 'count' | 'theme') => {
    // App owns the state, so App always re-renders; children re-render with it unless memo() sees equal props
    const props: Record<Exclude<C, 'App'>, boolean> = { Header: what === 'theme', Counter: what === 'count', TaskList: false };
    const hit: C[] = ['App', ...(Object.keys(props) as Array<Exclude<C, 'App'>>).filter((c) => !memo || props[c])];
    if (what === 'count') setCount((c) => c + 1);
    else setDark((d) => !d);
    setRenders((r) => {
      const n = { ...r };
      hit.forEach((c) => (n[c] += 1));
      return n;
    });
    setFlash(hit);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash([]), 700);
    setWhy(
      memo
        ? t(`With memo(), only components whose props changed re-render: ${hit.join(', ')}.`, `memo() mellett csak azok renderelnek újra, akiknek változott a propja: ${hit.join(', ')}.`, `S memo() sa prerenderujú len komponenty, ktorým sa zmenili props: ${hit.join(', ')}.`)
        : t('App’s state changed, so App and every child below it re-render — even TaskList, whose props did not change.', 'Az App állapota változott, ezért az App és alatta minden gyerek újrarenderel — még a TaskList is, pedig a propjai nem változtak.', 'Zmenil sa stav v App, takže sa prerenderuje App aj každé dieťa pod ním – dokonca aj TaskList, hoci sa jeho props nezmenili.'),
    );
  };

  const node = (c: C, props: string, x: string) => (
    <div className={'relative border px-3 py-2.5 transition-colors duration-300 ' + x + ' ' + (flash.includes(c) ? 'border-accent bg-accent/20' : 'border-line-strong bg-bg')}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[14.5px] font-semibold text-text">{'<' + c + ' />'}</span>
        <span className="font-mono text-[12px] text-dim">
          {t('renders', 'render', 'rendery')}: <span className={flash.includes(c) ? 'text-accent' : 'text-muted'}>{renders[c]}</span>
        </span>
      </div>
      <div className="mt-1 truncate font-mono text-[12.5px] text-muted">{props}</div>
    </div>
  );

  return (
    <Frame lang={lang} title={t('Who re-renders when state changes?', 'Ki renderel újra, ha változik az állapot?', 'Kto sa prerenderuje, keď sa zmení stav?')} hint={t('State lives in App. Click the buttons and watch the render counters.', 'Az állapot az Appban él. Kattints a gombokra, és figyeld a renderszámlálókat.', 'Stav žije v App. Klikaj na tlačidlá a sleduj počítadlá renderov.')}>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className="vw-btn on" onClick={() => update('count')}>setCount(count + 1)</button>
        <button type="button" className="vw-btn" onClick={() => update('theme')}>setDark(!dark)</button>
        <label className="ml-auto flex items-center gap-2 text-[14.5px] text-muted">
          <input type="checkbox" checked={memo} onChange={(e) => setMemo(e.target.checked)} className="accent-[rgb(var(--c-accent))]" />
          {t('wrap children in', 'gyerekek becsomagolása:', 'obaľ deti do')} <code className="font-mono text-[13.5px]">memo()</code>
        </label>
      </div>
      <div className="mt-5 grid gap-3">
        {node('App', `state: { count: ${count}, dark: ${dark} }`, 'mx-auto w-full max-w-sm')}
        <div className="mx-auto h-4 w-px bg-line-strong" />
        <div className="grid gap-2 sm:grid-cols-3">
          {node('Header', `props: { dark: ${dark} }`, '')}
          {node('Counter', `props: { count: ${count}, onInc }`, '')}
          {node('TaskList', 'props: { tasks }', '')}
        </div>
      </div>
      <p className="mt-4 min-h-[2.75rem] text-[15.5px] leading-relaxed text-muted">{why || t('Data flows down as props; a state change re-runs the component that owns it.', 'Az adat propként lefelé áramlik; az állapotváltozás újrafuttatja azt a komponenst, amelyiké az állapot.', 'Dáta tečú nadol ako props; zmena stavu znova spustí komponent, ktorý ten stav vlastní.')}</p>
    </Frame>
  );
}
