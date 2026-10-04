import type { ReactNode } from 'react';
import type { Lang } from '../../../../data/projects';

export type WidgetProps = { lang: Lang };

/** picks the EN or HU string */
export const tr = (lang: Lang) => (en: string, hu: string) => (lang === 'hu' ? hu : en);

export function Frame({ lang, title, hint, children }: { lang: Lang; title: string; hint?: string; children: ReactNode }) {
  return (
    <figure className="vis-widget not-prose">
      <div className="vis-widget-head">
        <span className="vis-kicker w-full" style={{ color: 'rgb(var(--v-violet))' }}>
          ▶ {lang === 'hu' ? 'Interaktív' : 'Interactive'}
        </span>
        <span className="vis-title !mt-0">{title}</span>
        {hint && <span className="w-full text-[16.5px] leading-snug text-muted">{hint}</span>}
      </div>
      <div className="vis-widget-body">{children}</div>
    </figure>
  );
}

export function Seg<T extends string>({ options, value, onChange, label }: { options: readonly T[] | Array<{ v: T; l: string }>; value: T; onChange: (v: T) => void; label: string }) {
  const opts = (options as Array<T | { v: T; l: string }>).map((o) => (typeof o === 'string' ? { v: o, l: o } : o));
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {opts.map((o) => (
        <button key={o.v} type="button" className="vw-btn" aria-pressed={o.v === value} onClick={() => onChange(o.v)}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <span className="label">{label}</span>
      {children}
    </div>
  );
}

/** prev / next / play controls for step-through explainers */
export function Stepper({ lang, i, n, setI, playing, setPlaying }: { lang: Lang; i: number; n: number; setI: (i: number) => void; playing: boolean; setPlaying: (p: boolean) => void }) {
  const t = tr(lang);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" className="vw-btn" onClick={() => { setPlaying(false); setI(0); }} disabled={i === 0}>
        ⟲ {t('Reset', 'Elölről')}
      </button>
      <button type="button" className="vw-btn" onClick={() => { setPlaying(false); setI(Math.max(0, i - 1)); }} disabled={i === 0}>
        ← {t('Back', 'Vissza')}
      </button>
      <button type="button" className="vw-btn on" onClick={() => { setPlaying(false); setI(Math.min(n - 1, i + 1)); }} disabled={i >= n - 1}>
        {t('Next', 'Tovább')} →
      </button>
      <button type="button" className="vw-btn" onClick={() => { if (i >= n - 1) setI(0); setPlaying(!playing); }}>
        {playing ? '❚❚ ' + t('Pause', 'Szünet') : '▶ ' + t('Play', 'Lejátszás')}
      </button>
      <span className="label ml-auto">
        {i + 1} / {n}
      </span>
    </div>
  );
}
