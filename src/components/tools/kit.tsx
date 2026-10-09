import type { ReactNode } from 'react';
import { useI18n } from '../../i18n';
import type { Lang } from '../../data/projects';
import { useGoToSection } from '../../hooks/useGoToSection';
import { Arrow, cx } from '../ui';

/** The offer under every configurator: this is a demo, a custom one is a conversation away. */
export function ConsultCta({ className = '' }: { className?: string }) {
  const { lang, lp } = useI18n();
  const goTo = useGoToSection();
  const c = {
    en: {
      label: 'Custom development',
      lead: 'Want a custom development like this for your own site? Ask for a free consultation.',
      body: 'A configurator, a 3D product view, a price calculator or a quote request — built around your products, prices and brand.',
      cta: 'Free consultation',
    },
    hu: {
      label: 'Egyedi fejlesztés',
      lead: 'Szeretnél egy ilyen egyedi fejlesztést a saját oldaladra? Kérj ingyenes konzultációt.',
      body: 'Konfigurátor, 3D termékbemutató, árkalkulátor vagy ajánlatkérő — a saját termékeiddel, áraiddal és arculatoddal.',
      cta: 'Ingyenes konzultáció',
    },
    sk: {
      label: 'Vývoj na mieru',
      lead: 'Chceli by ste podobné riešenie na mieru aj pre svoj web? Dohodnite si bezplatnú konzultáciu.',
      body: 'Konfigurátor, 3D ukážka produktu, cenová kalkulačka alebo dopyt po ponuke — postavené na vašich produktoch, cenách a vizuálnej identite.',
      cta: 'Bezplatná konzultácia',
    },
  }[lang];
  return (
    <div className={cx('contact-box border border-accent bg-surface p-5 sm:p-6', className)}>
      <div className="label-a">// {c.label}</div>
      <p className="mt-2 text-[15px] font-semibold leading-snug text-text sm:text-base">
        {c.lead}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        {c.body}
      </p>
      <a
        href={`${lp('/')}#contact`}
        onClick={goTo('contact')}
        data-cursor="follow"
        className="hero-cta group mt-4 inline-flex items-center gap-3 bg-accent px-5 py-3 font-mono text-[12.5px] font-semibold uppercase tracking-tech text-onaccent transition-colors hover:bg-text"
      >
        {c.cta}
        <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </div>
  );
}

/** a titled block of controls in the side panel */
export function Group({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="border-b border-line py-4 last:border-b-0">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="label">{title}</span>
        {aside && <span className="font-mono text-2xs uppercase tracking-tech text-text">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

/** a row of mutually exclusive options */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  cols,
}: {
  value: T;
  options: { id: T; label: string; disabled?: boolean }[];
  onChange: (v: T) => void;
  cols?: number;
}) {
  return (
    <div className="grid gap-px border border-line bg-line" style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={o.disabled}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          data-cursor="follow"
          className={cx(
            'px-2 py-2 font-mono text-[11px] uppercase tracking-tech transition-colors disabled:cursor-not-allowed disabled:opacity-35',
            value === o.id ? 'bg-accent text-onaccent' : 'bg-surface text-muted hover:text-text',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** colour chips with a name */
export function Swatches({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; hex: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          aria-label={o.label}
          title={o.label}
          data-cursor="follow"
          className={cx(
            'h-8 w-8 border transition-transform duration-200 hover:-translate-y-0.5',
            value === o.id ? 'border-accent outline outline-2 outline-offset-2 outline-accent' : 'border-line-strong',
          )}
          style={{ background: o.hex }}
        />
      ))}
    </div>
  );
}

/** a labelled range input with its value */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-tech text-muted">{label}</span>
        <span className="font-mono text-[12px] text-text">{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tool-range w-full"
      />
    </label>
  );
}

/** an on/off option */
export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      data-cursor="follow"
      className={cx(
        'flex w-full items-center justify-between gap-3 border px-3 py-2 text-left font-mono text-[11px] uppercase tracking-tech transition-colors',
        checked ? 'border-accent text-text' : 'border-line text-muted hover:text-text',
      )}
    >
      {label}
      <span className={cx('relative h-4 w-7 border transition-colors', checked ? 'border-accent bg-accent' : 'border-line-strong')}>
        <span className={cx('absolute top-0.5 h-2.5 w-2.5 transition-all', checked ? 'left-3.5 bg-onaccent' : 'left-0.5 bg-dim')} />
      </span>
    </button>
  );
}

export const huf = (n: number) => `${Math.round(n / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft';

/** demo prices are kept in forints; Slovak visitors see them in euros (~400 Ft = 1 €, rounded to 10 €) */
export const money = (n: number, lang: Lang) =>
  lang === 'sk' ? `${Math.round(n / 4000) * 10}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €' : huf(n);
