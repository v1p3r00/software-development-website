import { useEffect, useRef, useState } from 'react';
import { Frame, Seg, tr } from './Frame';
import type { WidgetProps } from './Frame';

const NAMES = ['dora', 'adam', 'mira', 'zoli', 'bea', 'kata', 'gabor', 'eszter', 'peti', 'lili', 'oliver', 'hanna', 'tomi', 'cili', 'noel', 'reka'];
const ROWS = NAMES.map((n, i) => ({ id: i + 1, email: `${n}@mail.hu` }));
const SORTED = [...ROWS].sort((a, b) => a.email.localeCompare(b.email));
const TARGET = 'oliver@mail.hu';

export default function IndexScan({ lang }: WidgetProps) {
  const t = tr(lang);
  const [mode, setMode] = useState<'scan' | 'index'>('scan');
  const [visited, setVisited] = useState<number[]>([]);
  const [found, setFound] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // the ids each strategy has to look at
  const path = (() => {
    if (mode === 'scan') return ROWS.map((r) => r.id);
    const out: number[] = [];
    let lo = 0, hi = SORTED.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      out.push(SORTED[mid].id);
      const cmp = SORTED[mid].email.localeCompare(TARGET);
      if (cmp === 0) break;
      if (cmp < 0) lo = mid + 1;
      else hi = mid - 1;
    }
    return out;
  })();

  const run = () => {
    timers.current.forEach(clearTimeout);
    setVisited([]);
    setFound(false);
    path.forEach((id, k) => timers.current.push(window.setTimeout(() => setVisited((v) => [...v, id]), k * (mode === 'scan' ? 140 : 380))));
    timers.current.push(window.setTimeout(() => setFound(true), path.length * (mode === 'scan' ? 140 : 380)));
  };

  const list = mode === 'scan' ? ROWS : SORTED;
  return (
    <Frame lang={lang} title={t('Full table scan vs. index lookup', 'Teljes táblaolvasás vs. indexes keresés')} hint={t('Run the same query twice: without and with an index on email.', 'Futtasd le ugyanazt a lekérdezést kétszer: email index nélkül és indexszel.')}>
      <div className="flex flex-wrap items-center gap-2">
        <Seg
          label="mode"
          value={mode}
          onChange={(m) => {
            timers.current.forEach(clearTimeout);
            setMode(m);
            setVisited([]);
            setFound(false);
          }}
          options={[
            { v: 'scan', l: t('No index (Seq Scan)', 'Index nélkül (Seq Scan)') },
            { v: 'index', l: 'CREATE INDEX … (email)' },
          ]}
        />
        <button type="button" className="vw-btn on ml-auto" onClick={run}>
          ▶ {t('Run query', 'Lekérdezés futtatása')}
        </button>
      </div>
      <pre className="vw-code mt-3">{`SELECT * FROM users WHERE email = '${TARGET}';`}</pre>
      <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4">
        {list.map((r) => {
          const seen = visited.includes(r.id);
          const hit = seen && r.email === TARGET;
          return (
            <div key={r.id} className={'truncate border px-2 py-1 font-mono text-[12.5px] transition-colors duration-150 ' + (hit ? 'border-accent bg-accent text-onaccent' : seen ? 'border-accent/50 bg-accent/10 text-text' : 'border-line text-dim')}>
              {r.email}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <span className="font-mono text-[14.5px] text-text">
          {t('rows examined', 'megvizsgált sorok')}: <span className="text-accent">{visited.length}</span> / {ROWS.length}
        </span>
        {found && (
          <span className="text-[15px] text-muted">
            {mode === 'scan'
              ? t('Without an index the database reads every row — the cost grows with the table.', 'Index nélkül az adatbázis minden sort elolvas — a költség a táblával együtt nő.')
              : t('The B-tree index is sorted, so each step halves the search space: ~log₂(n) reads.', 'A B-fa index rendezett, így minden lépés megfelezi a keresési teret: kb. log₂(n) olvasás.')}
          </span>
        )}
      </div>
    </Frame>
  );
}
