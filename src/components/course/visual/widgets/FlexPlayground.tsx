import { useState } from 'react';
import { Frame, Field, Seg, tr } from './Frame';
import type { WidgetProps } from './Frame';

const HEIGHTS = [44, 70, 54, 86, 48, 62];

export default function FlexPlayground({ lang }: WidgetProps) {
  const t = tr(lang);
  const [mode, setMode] = useState<'flex' | 'grid'>('flex');
  const [dir, setDir] = useState<'row' | 'column'>('row');
  const [justify, setJustify] = useState<'flex-start' | 'center' | 'space-between' | 'space-evenly' | 'flex-end'>('flex-start');
  const [align, setAlign] = useState<'stretch' | 'flex-start' | 'center' | 'flex-end'>('stretch');
  const [wrap, setWrap] = useState<'nowrap' | 'wrap'>('nowrap');
  const [gap, setGap] = useState(8);
  const [count, setCount] = useState(4);
  const [cols, setCols] = useState(3);
  const items = Array.from({ length: count }, (_, i) => i);
  const css =
    mode === 'flex'
      ? `.row {\n  display: flex;\n  flex-direction: ${dir};\n  justify-content: ${justify};\n  align-items: ${align};\n  flex-wrap: ${wrap};\n  gap: ${gap}px;\n}`
      : `.grid {\n  display: grid;\n  grid-template-columns: repeat(${cols}, 1fr);\n  gap: ${gap}px;\n}`;
  return (
    <Frame lang={lang} title={t('Flexbox & Grid playground', 'Flexbox és Grid játszótér')} hint={t('Change one property at a time and watch the boxes move.', 'Egyszerre egy tulajdonságot változtass, és figyeld a dobozokat.')}>
      <div className="mb-4">
        <Seg label="mode" options={[{ v: 'flex', l: 'display: flex' }, { v: 'grid', l: 'display: grid' }]} value={mode} onChange={setMode} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {mode === 'flex' ? (
          <>
            <Field label="flex-direction"><Seg label="direction" options={['row', 'column'] as const} value={dir} onChange={setDir} /></Field>
            <Field label="flex-wrap"><Seg label="wrap" options={['nowrap', 'wrap'] as const} value={wrap} onChange={setWrap} /></Field>
            <Field label="justify-content"><Seg label="justify" options={['flex-start', 'center', 'space-between', 'space-evenly', 'flex-end'] as const} value={justify} onChange={setJustify} /></Field>
            <Field label="align-items"><Seg label="align" options={['stretch', 'flex-start', 'center', 'flex-end'] as const} value={align} onChange={setAlign} /></Field>
          </>
        ) : (
          <Field label={`grid-template-columns: repeat(${cols}, 1fr)`}>
            <input className="vw-range" type="range" min={1} max={4} value={cols} onChange={(e) => setCols(Number(e.target.value))} aria-label="columns" />
          </Field>
        )}
        <Field label={`gap: ${gap}px`}>
          <input className="vw-range" type="range" min={0} max={32} value={gap} onChange={(e) => setGap(Number(e.target.value))} aria-label="gap" />
        </Field>
        <Field label={t(`items: ${count}`, `elemek: ${count}`)}>
          <input className="vw-range" type="range" min={1} max={6} value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label="items" />
        </Field>
      </div>
      <div
        className="mt-5 border border-dashed border-line-strong bg-bg p-2"
        style={
          mode === 'flex'
            ? { display: 'flex', flexDirection: dir, justifyContent: justify, alignItems: align, flexWrap: wrap, gap, minHeight: dir === 'column' ? 360 : 150 }
            : { display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, minHeight: 150 }
        }
      >
        {items.map((i) => (
          <div
            key={i}
            className="grid place-items-center border border-accent bg-accent/15 font-mono text-[14.5px] font-semibold text-accent transition-all duration-300"
            style={{ minWidth: mode === 'flex' ? (wrap === 'wrap' ? 120 : 52) : undefined, height: align === 'stretch' && mode === 'flex' && dir === 'row' ? undefined : HEIGHTS[i], minHeight: HEIGHTS[i], padding: '0 12px' }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <pre className="vw-code mt-4">{css}</pre>
    </Frame>
  );
}
