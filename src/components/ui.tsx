import type { ReactNode } from 'react';

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Four engineering-style crosshairs pinned to a container's corners. */
export function CornerMarks({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={cx('pointer-events-none absolute inset-0', className)}>
      <span className="crosshair -left-[4px] -top-[4px]" />
      <span className="crosshair -right-[4px] -top-[4px]" />
      <span className="crosshair -bottom-[4px] -left-[4px]" />
      <span className="crosshair -bottom-[4px] -right-[4px]" />
    </div>
  );
}

export function SectionHeader({
  index,
  title,
  subtitle,
  right,
}: {
  index: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-end gap-4">
        <span className="font-mono text-2xs tracking-tech text-accent">[{index}]</span>
        <div>
          {subtitle && (
            <div className="label mb-1">
              // {subtitle}
            </div>
          )}
          <h2 className="display text-[2.4rem] leading-[0.9] sm:text-[3.4rem]">{title}</h2>
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function Section({
  id,
  children,
  className = '',
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cx('relative mx-auto w-full max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28', className)}
    >
      {children}
    </section>
  );
}

export function TechTag({ children }: { children: ReactNode }) {
  return (
    <span className="border border-line px-2 py-1 font-mono text-2xs uppercase tracking-tech text-muted transition-colors duration-300 group-hover:border-line-strong group-hover:text-text">
      {children}
    </span>
  );
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 12" className={cx('h-3 w-6', className)} fill="none" aria-hidden>
      <path d="M0 6h22M17 1l5 5-5 5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function TechButton({
  children,
  onClick,
  href,
  variant = 'outline',
  className = '',
  ...rest
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'outline' | 'solid';
  className?: string;
  [key: string]: unknown;
}) {
  const base =
    'group relative inline-flex items-center gap-4 px-6 py-4 font-mono text-[11px] uppercase tracking-tech transition-colors duration-300';
  const styles =
    variant === 'solid'
      ? 'bg-accent text-black hover:bg-text'
      : 'border border-line-strong text-text hover:border-accent hover:text-accent';
  const content = (
    <>
      <span>{children}</span>
      <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
    </>
  );
  if (href) {
    return (
      <a href={href} className={cx(base, styles, className)} data-cursor="follow" {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cx(base, styles, className)} data-cursor="follow" {...rest}>
      {content}
    </button>
  );
}

/** A thin ruler strip with measurement ticks and an optional caption. */
export function Ruler({ caption }: { caption?: string }) {
  return (
    <div aria-hidden className="flex items-center gap-3">
      <div className="ticks-x h-2 flex-1 opacity-40" />
      {caption && <span className="label whitespace-nowrap">{caption}</span>}
    </div>
  );
}
