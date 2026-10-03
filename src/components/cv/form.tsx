import { useId } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../ui';

export const inputCls =
  'w-full border border-line bg-bg px-3 py-2.5 text-sm text-text placeholder:text-dim/70 transition-colors focus:border-accent focus:outline-none';

export function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 4,
  className = '',
  autoComplete,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cx(inputCls, 'resize-y leading-relaxed')}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
      {hint && <p className="text-[12px] leading-snug text-dim">{hint}</p>}
    </div>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[rgb(var(--c-accent))]"
      />
      {label}
    </label>
  );
}

/** small square icon button in the site's bordered style */
export function IconBtn({
  label,
  onClick,
  disabled,
  children,
  danger,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-cursor="follow"
      className={cx(
        'grid h-8 w-8 shrink-0 place-items-center border border-line text-dim transition-colors disabled:pointer-events-none disabled:opacity-30',
        danger ? 'hover:border-red-500/60 hover:text-red-500' : 'hover:border-line-strong hover:text-accent',
      )}
    >
      {children}
    </button>
  );
}


/** a row of mutually exclusive options, in the site's bracketed filter style */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              data-cursor="follow"
              className={cx(
                'border px-3 py-1.5 font-mono text-2xs uppercase tracking-tech transition-colors',
                on ? 'border-accent text-accent' : 'border-line text-dim hover:border-line-strong hover:text-text',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** primary / outline action buttons matching TechButton, usable with any handler */
export function ActionBtn({
  children,
  onClick,
  solid,
  className = '',
}: {
  children: ReactNode;
  onClick: () => void;
  solid?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="follow"
      className={cx(
        'group inline-flex items-center justify-center gap-3 px-5 py-3 font-mono text-[11px] uppercase tracking-tech transition-colors duration-300',
        solid ? 'bg-accent text-onaccent hover:bg-text' : 'border border-line-strong text-text hover:border-accent hover:text-accent',
        className,
      )}
    >
      {children}
    </button>
  );
}
