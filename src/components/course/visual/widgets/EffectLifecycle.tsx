import { useState } from 'react';
import { Frame, Seg, tr } from './Frame';
import type { WidgetProps } from './Frame';

type Deps = 'none' | 'empty' | 'userId';
type Entry = { kind: 'render' | 'effect' | 'cleanup' | 'info'; text: string };

export default function EffectLifecycle({ lang }: WidgetProps) {
  const t = tr(lang);
  const [deps, setDeps] = useState<Deps>('userId');
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState(1);
  const [other, setOther] = useState(0);
  const [log, setLog] = useState<Entry[]>([]);
  const [prev, setPrev] = useState<number | null>(null);
  const depsText = deps === 'none' ? '' : deps === 'empty' ? ', []' : ', [userId]';

  const run = (next: { userId: number; other: number }, kind: 'mount' | 'update' | 'unmount') => {
    const out: Entry[] = [];
    if (kind === 'unmount') {
      out.push({ kind: 'cleanup', text: t(`cleanup: abort request for user ${prev}`, `cleanup: a(z) ${prev}. felhasználó kérésének megszakítása`) });
      out.push({ kind: 'info', text: t('component removed from the screen', 'a komponens lekerül a képernyőről') });
      setLog((l) => [...l, ...out]);
      setMounted(false);
      setPrev(null);
      return;
    }
    out.push({ kind: 'render', text: `render (userId=${next.userId}, other=${next.other})` });
    const shouldRun = kind === 'mount' || deps === 'none' || (deps === 'userId' && next.userId !== userId);
    if (shouldRun) {
      if (kind !== 'mount') out.push({ kind: 'cleanup', text: t(`cleanup: abort request for user ${prev}`, `cleanup: a(z) ${prev}. felhasználó kérésének megszakítása`) });
      out.push({ kind: 'effect', text: t(`effect: fetch('/api/users/${next.userId}')`, `effect: fetch('/api/users/${next.userId}')`) });
      setPrev(next.userId);
    } else out.push({ kind: 'info', text: t('effect skipped: dependencies unchanged', 'effect kihagyva: a függőségek nem változtak') });
    setLog((l) => [...l, ...out]);
    setUserId(next.userId);
    setOther(next.other);
  };

  const color = { render: 'text-text', effect: 'text-accent', cleanup: 'text-sand', info: 'text-dim' };
  return (
    <Frame lang={lang} title={t('When does useEffect run?', 'Mikor fut le a useEffect?')} hint={t('Choose a dependency array, then mount, update and unmount the component.', 'Válassz függőségi tömböt, majd csatold fel, frissítsd és vedd le a komponenst.')}>
      <Seg
        label="deps"
        value={deps}
        onChange={(d) => {
          setDeps(d);
          setLog([]);
          setMounted(false);
          setPrev(null);
        }}
        options={[
          { v: 'none', l: t('no array', 'nincs tömb') },
          { v: 'empty', l: '[]' },
          { v: 'userId', l: '[userId]' },
        ]}
      />
      <pre className="vw-code mt-3">{`useEffect(() => {\n  const ctrl = new AbortController();\n  fetch(\`/api/users/\${userId}\`, { signal: ctrl.signal });\n  return () => ctrl.abort();   // cleanup\n}${depsText});`}</pre>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button type="button" className="vw-btn on" disabled={mounted} onClick={() => { setMounted(true); run({ userId: 1, other: 0 }, 'mount'); }}>
          {t('Mount', 'Felcsatolás')}
        </button>
        <button type="button" className="vw-btn" disabled={!mounted} onClick={() => run({ userId: userId + 1, other }, 'update')}>
          userId → {userId + 1}
        </button>
        <button type="button" className="vw-btn" disabled={!mounted} onClick={() => run({ userId, other: other + 1 }, 'update')}>
          {t('other state', 'más állapot')} → {other + 1}
        </button>
        <button type="button" className="vw-btn" disabled={!mounted} onClick={() => run({ userId, other }, 'unmount')}>
          {t('Unmount', 'Levétel')}
        </button>
        <button type="button" className="vw-btn ml-auto" onClick={() => { setLog([]); setMounted(false); setPrev(null); setUserId(1); setOther(0); }}>
          ⟲
        </button>
      </div>
      <ol className="mt-3 max-h-56 min-h-[7rem] overflow-y-auto border border-line bg-bg p-3 font-mono text-[13.5px] leading-relaxed">
        {log.length === 0 && <li className="text-dim">{t('Press Mount to start.', 'Kezdéshez nyomd meg a Felcsatolást.')}</li>}
        {log.map((e, i) => (
          <li key={i} className={color[e.kind]}>
            <span className="text-dim">{String(i + 1).padStart(2, '0')}</span> {e.text}
          </li>
        ))}
      </ol>
    </Frame>
  );
}
