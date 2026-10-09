import { useState } from 'react';
import { Frame, tr } from './Frame';
import type { WidgetProps } from './Frame';

const BPS = [
  { min: 0, name: 'base', q: '/* mobile first: no media query */', cols: 1 },
  { min: 640, name: 'sm', q: '@media (min-width: 640px)', cols: 2 },
  { min: 1024, name: 'lg', q: '@media (min-width: 1024px)', cols: 3 },
];

export default function Breakpoints({ lang }: WidgetProps) {
  const t = tr(lang);
  const [w, setW] = useState(375);
  const active = [...BPS].reverse().find((b) => w >= b.min)!;
  const sidebar = w >= 1024;
  return (
    <Frame lang={lang} title={t('Mobile-first breakpoints', 'Mobile-first töréspontok', 'Mobile-first breakpointy')} hint={t('Drag the viewport width. Styles stack up as the screen grows.', 'Húzd a nézetszélességet. Ahogy nő a képernyő, egymásra épülnek a stílusok.', 'Posúvaj šírku viewportu. Ako obrazovka rastie, štýly sa na seba vrstvia.')}>
      <label className="grid gap-1.5">
        <span className="label">viewport: {w}px {w < 640 ? t('(phone)', '(telefon)', '(telefón)') : w < 1024 ? t('(tablet)', '(tablet)', '(tablet)') : t('(desktop)', '(asztali)', '(desktop)')}</span>
        <input className="vw-range" type="range" min={320} max={1440} step={5} value={w} onChange={(e) => setW(Number(e.target.value))} aria-label="viewport width" />
      </label>
      <div className="mt-5 overflow-hidden border border-line bg-bg p-3">
        <div className="mx-auto border border-line-strong bg-surface transition-[width] duration-200" style={{ width: `${Math.max(18, (w / 1440) * 100)}%`, minWidth: 96 }}>
          <div className="flex items-center justify-between border-b border-line px-2 py-1.5">
            <span className="h-2 w-10 bg-accent/70" />
            {w >= 640 ? <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-6 bg-line-strong" />)}</span> : <span className="font-mono text-[10px] text-muted">☰</span>}
          </div>
          <div className={'grid gap-1.5 p-2 ' + (sidebar ? 'grid-cols-[1fr_3fr]' : '')}>
            {sidebar && <div className="min-h-[80px] border border-dashed border-line-strong" />}
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${active.cols}, 1fr)` }}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-10 border border-accent/60 bg-accent/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-1.5">
        {BPS.map((b) => {
          const on = w >= b.min;
          return (
            <div key={b.name} className={'flex flex-wrap items-baseline gap-x-3 border px-3 py-2 font-mono text-[13.5px] transition-colors ' + (on ? 'border-accent/60 text-text' : 'border-line text-dim')}>
              <span className={on ? 'text-accent' : ''}>{on ? '●' : '○'}</span>
              <span>{b.q}</span>
              <span className="ml-auto">{b.cols} {t(b.cols === 1 ? 'column' : 'columns', 'oszlop', b.cols === 1 ? 'stĺpec' : 'stĺpce')}{b.min >= 1024 ? t(' + sidebar', ' + oldalsáv', ' + bočný panel') : ''}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[15px] text-muted">{t('Base styles apply everywhere; each min-width query adds on top once the screen is wide enough.', 'Az alapstílusok mindenhol érvényesek; minden min-width lekérdezés csak akkor tesz hozzá, ha elég széles a képernyő.', 'Základné štýly platia všade; každý min-width query pridá svoje až vtedy, keď je obrazovka dosť široká.')}</p>
    </Frame>
  );
}
