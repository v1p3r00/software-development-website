import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../ui';

/**
 * The configurators on a phone, built like an app rather than a narrow web page:
 *
 *   ┌───────────────┐  the 3D view fills the top of the screen; a few round buttons
 *   │   3D canvas   │  float on its edges (view, light, save)
 *   ├───────────────┤
 *   │ ▣ ▣ ▣ ▣ ▣     │  the steps, like an app's tab bar
 *   │ [ ] [ ] [ ] → │  each step is one row of big choices, swiped sideways
 *   ├───────────────┤
 *   │ Total ⌃  [Quote →] │  the price and the next action, always in reach
 *   └───────────────┘
 *
 * Everything fits one screen, nothing to scroll; the price breakdown opens as a
 * bottom sheet. A phone held sideways puts the panel to the right of the view.
 */

const QUERY = '(max-width: 767px), (max-height: 520px) and (max-width: 1024px) and (pointer: coarse)';

/**
 * true on phones (portrait or landscape), false on larger screens, null until the
 * page has hydrated — the prerendered markup is the desktop layout.
 */
export function usePhoneApp(): boolean | null {
  const [phone, setPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return phone;
}

/** the site header's height, so the app can fill exactly the rest of the screen */
function useHeaderHeight() {
  const [h, setH] = useState(72);
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const ro = new ResizeObserver(() => setH(Math.round(header.getBoundingClientRect().height)));
    ro.observe(header);
    return () => ro.disconnect();
  }, []);
  return h;
}

export interface AppTab<T extends string> {
  id: T;
  label: string;
  icon: ReactNode;
}

/** the whole phone screen: canvas on top, steps below, price bar at the bottom */
export function AppShell<T extends string>({
  canvas,
  tabs,
  tab,
  onTab,
  children,
  bar,
  label,
}: {
  canvas: ReactNode;
  tabs: AppTab<T>[];
  tab: T;
  onTab: (t: T) => void;
  children: ReactNode;
  bar: ReactNode;
  label: string;
}) {
  const top = useHeaderHeight();
  // the page behind does not scroll; the floating chat would cover the price bar
  useEffect(() => {
    document.body.classList.add('tool-app');
    return () => document.body.classList.remove('tool-app');
  }, []);
  return (
    <section
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-[40] flex flex-col overflow-hidden bg-bg landscape:flex-row"
      style={{ top }}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-surface">{canvas}</div>
      <div className="relative z-10 flex shrink-0 flex-col rounded-t-[22px] border-t border-line-strong bg-bg shadow-[0_-12px_30px_rgba(0,0,0,0.28)] landscape:w-[min(390px,48vw)] landscape:rounded-none landscape:border-l landscape:border-t-0 landscape:shadow-none">
        <nav role="tablist" className="flex border-b border-line px-1 pt-1.5">
          {tabs.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-label={t.label}
                onClick={() => onTab(t.id)}
                className={cx(
                  'relative flex min-w-0 flex-1 flex-col items-center gap-1 px-1 pb-2 pt-1.5 transition-colors landscape:pb-1.5 landscape:pt-1',
                  on ? 'text-text' : 'text-dim active:text-muted',
                )}
              >
                <span className="grid h-6 place-items-center">{t.icon}</span>
                <span className="w-full truncate text-center text-[11.5px] font-medium leading-none landscape:hidden">{t.label}</span>
                <span className={cx('absolute inset-x-[28%] bottom-0 h-[2px] rounded-full bg-accent transition-opacity', on ? 'opacity-100' : 'opacity-0')} />
              </button>
            );
          })}
        </nav>
        <div key={tab} className="app-step h-[200px] overflow-y-auto overscroll-contain px-4 py-3.5 landscape:h-auto landscape:min-h-0 landscape:flex-1">
          {children}
        </div>
        <div className="border-t border-line px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 landscape:pb-2 landscape:pt-2">{bar}</div>
      </div>
    </section>
  );
}

/** a sideways-scrolling row of big choices */
export function AppRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cx('app-row -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1', className)}>{children}</div>;
}

/** one big choice: a picture and a name */
export function AppCard({
  on,
  onClick,
  icon,
  label,
  sub,
  disabled,
  wide,
}: {
  on: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  sub?: string;
  disabled?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={cx(
        'relative flex shrink-0 snap-start flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 pb-2 pt-2.5 transition-[border-color,background-color,transform] active:scale-[0.97] disabled:opacity-35',
        wide ? 'w-[124px]' : 'w-[100px]',
        on ? 'border-accent bg-accent/10 text-text' : 'border-line bg-surface text-muted',
      )}
    >
      <span className={cx('grid h-[54px] w-full place-items-center', on ? 'text-accent' : 'text-text')}>{icon}</span>
      <span className="line-clamp-2 w-full text-center text-[12.5px] font-medium leading-tight">{label}</span>
      {sub && <span className="-mt-1 w-full truncate text-center font-mono text-[10px] text-dim">{sub}</span>}
      {on && (
        <span className="absolute right-2 top-2 grid h-[18px] w-[18px] place-items-center rounded-full bg-accent text-onaccent">
          <Check className="h-2.5 w-2.5" />
        </span>
      )}
    </button>
  );
}

/** a pill switch between a few options */
export function AppSeg<T extends string>({
  value,
  options,
  onChange,
  className = '',
}: {
  value: T;
  options: { id: T; label: string; disabled?: boolean }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cx('flex rounded-full border border-line bg-surface p-1', className)}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={o.disabled}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cx(
            'min-w-0 flex-1 truncate rounded-full px-3 py-2 text-[13px] font-medium transition-colors disabled:opacity-35',
            value === o.id ? 'bg-text text-bg' : 'text-muted active:text-text',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** a labelled slider on one line, with its value; − and + nudge it */
export function AppRange({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[74px] shrink-0 truncate text-[13px] leading-tight text-muted">{label}</span>
      <button type="button" aria-label={`${label} −`} onClick={() => onChange(clamp(value - step))} disabled={value <= min} className="app-round h-7 w-7">
        <Minus className="h-3 w-3" />
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="app-range min-w-0 flex-1"
        style={{ ['--p' as string]: `${((value - min) / (max - min)) * 100}%` }}
      />
      <button type="button" aria-label={`${label} +`} onClick={() => onChange(clamp(value + step))} disabled={value >= max} className="app-round h-7 w-7">
        <Plus className="h-3 w-3" />
      </button>
      <span className="w-[54px] shrink-0 text-right font-mono text-[13px] text-text">{format(value)}</span>
    </div>
  );
}

/** round colour choices */
export function AppDots({
  value,
  options,
  onChange,
  custom,
}: {
  value: string;
  options: { id: string; hex: string; label: string }[];
  onChange: (id: string) => void;
  /** adds a rainbow dot that opens the system colour picker */
  custom?: string;
}) {
  const isCustom = !options.some((o) => o.id === value);
  return (
    <div className="app-row -mx-4 flex gap-3 overflow-x-auto px-4 py-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          aria-label={o.label}
          className={cx(
            'grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-transform active:scale-90',
            value === o.id ? 'border-transparent ring-2 ring-accent ring-offset-2 ring-offset-bg' : 'border-line-strong',
          )}
          style={{ background: o.hex }}
        >
          {value === o.id && <Check className={cx('h-4 w-4', light(o.hex) ? 'text-black/75' : 'text-white')} />}
        </button>
      ))}
      {custom !== undefined && (
        <label
          aria-label={custom}
          className={cx(
            'relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border',
            isCustom ? 'border-transparent ring-2 ring-accent ring-offset-2 ring-offset-bg' : 'border-line-strong',
          )}
          style={{ background: isCustom ? value : 'conic-gradient(#e53, #ec3, #4c5, #3ae, #a4e, #e53)' }}
        >
          {isCustom ? <Check className={cx('h-4 w-4', light(value) ? 'text-black/75' : 'text-white')} /> : <Plus className="h-4 w-4 text-white drop-shadow" />}
          <input type="color" value={isCustom ? value : '#7a4b8c'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
      )}
    </div>
  );
}

const light = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 160;
};

/** an on/off choice as a card row */
export function AppSwitch({ label, icon, checked, onChange }: { label: string; icon: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        'flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-colors',
        checked ? 'border-accent/70 bg-accent/10' : 'border-line bg-surface',
      )}
    >
      <span className={cx('grid h-8 w-8 place-items-center', checked ? 'text-accent' : 'text-muted')}>{icon}</span>
      <span className={cx('flex-1 text-[14px]', checked ? 'text-text' : 'text-muted')}>{label}</span>
      <span className={cx('relative h-[26px] w-[44px] rounded-full transition-colors', checked ? 'bg-accent' : 'bg-line-strong')}>
        <span className={cx('absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-[left]', checked ? 'left-[21px]' : 'left-[3px]')} />
      </span>
    </button>
  );
}

/** a small caption line under a row */
export function AppCaption({ children }: { children: ReactNode }) {
  return <p className="mt-2.5 text-[12.5px] leading-snug text-muted">{children}</p>;
}

/** the bottom bar: what you have, the price, and the next step */
export function AppBar({
  title,
  sub,
  price,
  cta,
  onOpen,
  onCta,
}: {
  title: string;
  sub: string;
  price: string;
  cta: string;
  onOpen: () => void;
  onCta: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onOpen} aria-haspopup="dialog" className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-1 text-[12px] text-muted">
          {title} <ChevronUp className="h-3 w-3" />
        </span>
        <span className="block truncate font-display text-[1.35rem] font-extrabold leading-tight text-text">{price}</span>
        <span className="block truncate text-[11.5px] text-dim">{sub}</span>
      </button>
      <button
        type="button"
        onClick={onCta}
        className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-[14px] font-semibold text-onaccent shadow-[0_8px_24px_rgb(var(--c-accent)/0.35)] transition-transform active:scale-[0.97]"
      >
        {cta}
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </button>
    </div>
  );
}

/** a sheet that slides up from the bottom; swipe its handle down or tap outside to close */
export function AppSheet({ title, close, onClose, children }: { title: string; close: string; onClose: () => void; children: ReactNode }) {
  const startY = useRef<number | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="app-fade absolute inset-0 bg-black/55" onClick={onClose} aria-label={close} />
      <div className="app-rise relative max-h-[86svh] overflow-hidden rounded-t-[22px] border-t border-line-strong bg-bg">
        <div
          className="flex items-center gap-3 px-4 pb-2 pt-3"
          onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
          onTouchEnd={(e) => {
            if (startY.current !== null && e.changedTouches[0].clientY - startY.current > 50) onClose();
            startY.current = null;
          }}
        >
          <i className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line-strong" aria-hidden />
          <b className="mt-2 flex-1 font-display text-[1.1rem] font-extrabold text-text">{title}</b>
          <button type="button" onClick={onClose} aria-label={close} className="app-round mt-2 h-9 w-9">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="max-h-[calc(86svh-60px)] overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}

/** the price lines in the sheet */
export function AppPrice({ lines, total, totalLabel, note }: { lines: { label: string; value: string }[]; total: string; totalLabel: string; note: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <ul className="space-y-2">
        {lines.map((l) => (
          <li key={l.label} className="flex justify-between gap-3 text-[13.5px] text-muted">
            <span className="min-w-0">{l.label}</span>
            <span className="shrink-0 font-mono text-text">{l.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
        <span className="text-[14px] font-semibold text-text">{totalLabel}</span>
        <span className="font-display text-[1.7rem] font-extrabold leading-none text-accent">{total}</span>
      </div>
      <p className="mt-2 text-[12px] text-dim">{note}</p>
    </div>
  );
}

/** a round button floating over the 3D view */
export function Fab({ label, onClick, children, on, disabled }: { label: string; onClick: () => void; children: ReactNode; on?: boolean; disabled?: boolean }) {
  return (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        aria-pressed={on}
        className={cx(
          'grid h-12 w-12 place-items-center rounded-full border shadow-lg backdrop-blur-md transition-[transform,background-color] active:scale-90 disabled:opacity-40',
          on ? 'border-accent bg-accent text-onaccent' : 'border-line-strong bg-bg/75 text-text',
        )}
      >
        {children}
      </button>
  );
}

/** the pill switch at the top of the 3D view */
export function FloatSeg<T extends string>({ value, options, onChange }: { value: T | null; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-full border border-line-strong bg-bg/75 p-1 shadow-lg backdrop-blur-md">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cx('rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors', value === o.id ? 'bg-text text-bg' : 'text-muted')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** a short message over the 3D view that fades on its own */
export function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div key={text} className="app-toast pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-md">
      {text}
    </div>
  );
}

/* ---------------------------------------------------------------- icons */

type IconProps = { className?: string };
const icon = (d: ReactNode) =>
  function Icon({ className = 'h-[22px] w-[22px]' }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {d}
      </svg>
    );
  };

export const Check = icon(<path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth="2.6" />);
export const Plus = icon(<path d="M12 5v14M5 12h14" strokeWidth="2" />);
export const Minus = icon(<path d="M5 12h14" strokeWidth="2" />);
export const ChevronUp = icon(<path d="M6 15l6-6 6 6" strokeWidth="2.2" />);
export const Download = icon(<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" />);
export const Sun = icon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </>,
);
export const Zoom = icon(
  <>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l5 5M8 10.5h5M10.5 8v5" />
  </>,
);
export const ZoomOut = icon(
  <>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l5 5M8 10.5h5" />
  </>,
);
export const Ruler = icon(
  <>
    <rect x="2.5" y="8" width="19" height="8" rx="1" />
    <path d="M6.5 8v3M10.5 8v4M14.5 8v3M18.5 8v4" />
  </>,
);
export const Palette = icon(
  <>
    <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.2-1.6-1.2-2.8 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z" />
    <circle cx="7.5" cy="11" r="1.2" />
    <circle cx="10" cy="7" r="1.2" />
    <circle cx="15" cy="7" r="1.2" />
  </>,
);
export const Sparkle = icon(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />);
export const TextIcon = icon(<path d="M5 6.5V5h14v1.5M12 5v14M9 19h6" />);
export const ImageIcon = icon(
  <>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="M4 17l5-4.5 3.5 3 3-2.5 4.5 4" />
  </>,
);
export const Move = icon(<path d="M12 3v18M3 12h18M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5" />);
export const Upload = icon(<path d="M12 15.5V4M7 8.5l5-5 5 5M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" />);
export const Trash = icon(<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 10.5v6M14 10.5v6" />);
export const Shirt = icon(<path d="M8.5 3.5L3.5 6l2 4.5 2-1V20.5h9V9.5l2 1 2-4.5-5-2.5c-.5 1.5-1.9 2.5-3.5 2.5S9 5 8.5 3.5z" />);
export const Door = icon(
  <>
    <path d="M4 20.5V8l8-4.5L20 8v12.5" />
    <rect x="7" y="11" width="10" height="9.5" />
    <path d="M7 14h10M7 17h10" />
  </>,
);
export const Roof = icon(<path d="M2.5 12L12 4.5l9.5 7.5M5.5 10v10h13V10" />);
export const Plusbox = icon(
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <path d="M12 8v8M8 12h8" />
  </>,
);
