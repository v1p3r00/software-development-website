import { useState } from 'react';
import { Frame, Seg, tr } from './Frame';
import type { WidgetProps } from './Frame';

type J = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
const CUSTOMERS = [
  { id: 1, name: 'Anna' },
  { id: 2, name: 'Bence' },
  { id: 3, name: 'Csilla' },
];
const ORDERS = [
  { id: 10, customer_id: 1, total: 25 },
  { id: 11, customer_id: 1, total: 40 },
  { id: 12, customer_id: 3, total: 15 },
  { id: 13, customer_id: 9, total: 60 },
];

function join(j: J) {
  const rows: Array<{ c?: (typeof CUSTOMERS)[number]; o?: (typeof ORDERS)[number] }> = [];
  for (const c of CUSTOMERS) {
    const os = ORDERS.filter((o) => o.customer_id === c.id);
    if (os.length) os.forEach((o) => rows.push({ c, o }));
    else if (j === 'LEFT' || j === 'FULL') rows.push({ c });
  }
  if (j === 'RIGHT' || j === 'FULL') ORDERS.filter((o) => !CUSTOMERS.some((c) => c.id === o.customer_id)).forEach((o) => rows.push({ o }));
  if (j === 'RIGHT') rows.sort((a, b) => (a.o?.id ?? 0) - (b.o?.id ?? 0));
  return rows;
}

export default function SqlJoin({ lang }: WidgetProps) {
  const t = tr(lang);
  const [j, setJ] = useState<J>('INNER');
  const rows = join(j);
  const leftOn = j === 'LEFT' || j === 'FULL';
  const rightOn = j === 'RIGHT' || j === 'FULL';
  const nul = <span className="text-dim italic">NULL</span>;
  const desc: Record<J, [string, string]> = {
    INNER: ['Only rows that match on both sides. Bence (no orders) and order 13 (unknown customer) disappear.', 'Csak a mindkét oldalon egyező sorok. Bence (nincs rendelése) és a 13-as rendelés (ismeretlen vevő) kiesik.'],
    LEFT: ['Every customer, plus their orders if any. Bence stays with NULL order columns.', 'Minden vevő, és a rendelései, ha vannak. Bence NULL rendelésoszlopokkal marad.'],
    RIGHT: ['Every order, plus its customer if found. Order 13 stays with a NULL customer.', 'Minden rendelés, és a vevője, ha megvan. A 13-as rendelés NULL vevővel marad.'],
    FULL: ['Everything from both sides, matched where possible (PostgreSQL supports it; MySQL does not).', 'Mindkét oldal minden sora, ahol lehet, párosítva (PostgreSQL-ben van, MySQL-ben nincs).'],
  };
  return (
    <Frame lang={lang} title={t('SQL joins, visualised', 'SQL joinok szemléltetve')} hint={t('Same two tables, four kinds of join.', 'Ugyanaz a két tábla, négyféle join.')}>
      <Seg label="join" options={['INNER', 'LEFT', 'RIGHT', 'FULL'] as const} value={j} onChange={setJ} />
      <div className="mt-4 grid items-center gap-4 md:grid-cols-[13rem_1fr]">
        <svg viewBox="0 0 200 120" className="mx-auto w-full max-w-[13rem]" role="img" aria-label={`${j} JOIN`}>
          <defs>
            <clipPath id="sj-l"><circle cx="78" cy="60" r="48" /></clipPath>
          </defs>
          <circle cx="78" cy="60" r="48" className={leftOn ? 'fill-accent' : 'fill-none'} opacity={leftOn ? 0.35 : 1} />
          <circle cx="122" cy="60" r="48" className={rightOn ? 'fill-accent' : 'fill-none'} opacity={rightOn ? 0.35 : 1} />
          <circle cx="122" cy="60" r="48" clipPath="url(#sj-l)" className="fill-accent" opacity={0.75} />
          <circle cx="78" cy="60" r="48" className="fill-none stroke-accent" strokeWidth="1.5" />
          <circle cx="122" cy="60" r="48" className="fill-none stroke-accent" strokeWidth="1.5" />
          <text x="48" y="64" className="dg-sub strong" textAnchor="middle">customers</text>
          <text x="154" y="64" className="dg-sub strong" textAnchor="middle">orders</text>
        </svg>
        <div className="min-w-0">
          <pre className="vw-code">{`SELECT c.name, o.id, o.total\nFROM customers c\n${j === 'INNER' ? 'JOIN' : j + ' JOIN'} orders o ON o.customer_id = c.id;`}</pre>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{desc[j][lang === 'hu' ? 1 : 0]}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { title: 'customers', head: ['id', 'name'], body: CUSTOMERS.map((c) => [c.id, c.name]) },
          { title: 'orders', head: ['id', 'customer_id', 'total'], body: ORDERS.map((o) => [o.id, o.customer_id, o.total]) },
        ].map((tb) => (
          <table key={tb.title} className="w-full border border-line font-mono text-[13.5px]">
            <caption className="label pb-1 text-left">{tb.title}</caption>
            <thead><tr>{tb.head.map((h) => <th key={h} className="border-b border-line px-2 py-1 text-left font-normal text-dim">{h}</th>)}</tr></thead>
            <tbody>{tb.body.map((r, k) => <tr key={k}>{r.map((v, m) => <td key={m} className="px-2 py-0.5 text-text">{v}</td>)}</tr>)}</tbody>
          </table>
        ))}
        <table className="w-full border border-accent/60 font-mono text-[13.5px]">
          <caption className="label-a pb-1 text-left">{t('result', 'eredmény')} · {rows.length} {t('rows', 'sor')}</caption>
          <thead><tr>{['name', 'o.id', 'total'].map((h) => <th key={h} className="border-b border-line px-2 py-1 text-left font-normal text-dim">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, k) => (
              <tr key={k} className={!r.c || !r.o ? 'bg-accent/[0.07]' : ''}>
                <td className="px-2 py-0.5 text-text">{r.c ? r.c.name : nul}</td>
                <td className="px-2 py-0.5 text-text">{r.o ? r.o.id : nul}</td>
                <td className="px-2 py-0.5 text-text">{r.o ? r.o.total : nul}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}
