import { useEffect, useRef, useState } from 'react';
import { Frame, tr } from './Frame';
import type { WidgetProps } from './Frame';

type Id = 'document' | 'card' | 'list' | 'button';
const PATH: Id[] = ['document', 'card', 'list', 'button'];

export default function EventBubbling({ lang }: WidgetProps) {
  const t = tr(lang);
  const [capture, setCapture] = useState(false);
  const [stopAt, setStopAt] = useState<Id | null>(null);
  const [log, setLog] = useState<Array<{ id: Id; phase: string }>>([]);
  const [lit, setLit] = useState<Id | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const fire = (target: Id) => {
    timers.current.forEach(clearTimeout);
    const upTo = PATH.indexOf(target);
    const seq: Array<{ id: Id; phase: string }> = [];
    if (capture) PATH.slice(0, upTo).forEach((id) => seq.push({ id, phase: 'capture' }));
    seq.push({ id: target, phase: 'target' });
    for (const id of PATH.slice(0, upTo).reverse()) {
      if (stopAt && seq.some((s) => s.id === stopAt && s.phase !== 'capture')) break;
      seq.push({ id, phase: 'bubble' });
    }
    if (stopAt === target) seq.splice(seq.findIndex((s) => s.phase === 'target') + 1);
    setLog([]);
    seq.forEach((s, k) => {
      timers.current.push(window.setTimeout(() => {
        setLit(s.id);
        setLog((l) => [...l, s]);
      }, k * 450));
    });
    timers.current.push(window.setTimeout(() => setLit(null), seq.length * 450 + 300));
  };

  const box = (id: Id, label: string, children?: React.ReactNode) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        fire(id);
      }}
      className={'cursor-pointer border p-3 transition-colors duration-200 ' + (lit === id ? 'border-accent bg-accent/15' : 'border-line-strong bg-bg/60')}
    >
      <div className="mb-2 font-mono text-[12.5px] text-muted">{label}</div>
      {children}
    </div>
  );

  return (
    <Frame lang={lang} title={t('Event capturing & bubbling', 'Esemény-elkapás és buborékolás')} hint={t('Click any box. Every ancestor with a listener hears the click as it bubbles up.', 'Kattints bármelyik dobozra. Buborékolás közben minden figyelővel rendelkező ős megkapja a kattintást.')}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[15px] text-muted">
          <input type="checkbox" checked={capture} onChange={(e) => setCapture(e.target.checked)} className="accent-[rgb(var(--c-accent))]" />
          {t('also listen in the capture phase', 'figyelés elkapási fázisban is')}
        </label>
        <label className="flex items-center gap-2 text-[15px] text-muted">
          stopPropagation() {t('in', 'itt:')}
          <select value={stopAt ?? ''} onChange={(e) => setStopAt((e.target.value || null) as Id | null)} className="border border-line bg-bg px-2 py-1 font-mono text-[13.5px] text-text">
            <option value="">—</option>
            {PATH.slice(1).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
        {box(
          'document',
          'document',
          box(
            'card',
            '<article class="card">',
            box(
              'list',
              '<ul class="actions">',
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fire('button');
                }}
                className={'vw-btn ' + (lit === 'button' ? 'on' : '')}
              >
                {'<button>'} {t('Add to cart', 'Kosárba')}
              </button>,
            ),
          ),
        )}
        <ol className="min-h-[10rem] border border-line bg-bg p-3 font-mono text-[13.5px]">
          <li className="label mb-2">{t('listeners fired, in order', 'lefutott figyelők, sorrendben')}</li>
          {log.map((l, k) => (
            <li key={k} className="py-0.5 text-text">
              <span className="text-dim">{k + 1}.</span> {l.id} <span className={l.phase === 'capture' ? 'text-sand' : l.phase === 'target' ? 'text-accent' : 'text-muted'}>({l.phase})</span>
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
}
