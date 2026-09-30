import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { usePrefersReducedMotion } from '../hooks/useMisc';
import { useVisitorCount } from '../hooks/useVisitorCount';
import { cx } from './ui';

const DIGITS = 6;

/** eases from 0 up to the target once it arrives, like an instrument settling */
function useCountUp(target: number | null | undefined, enabled: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null || !enabled) return;
    let raf = 0;
    const start = performance.now();
    const duration = Math.min(1600, 500 + target * 2);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);
  // with reduced motion there is no animation: show the number straight away
  return enabled ? value : (target ?? 0);
}

/**
 * Visitor readout for the hero's metadata column, set like the Location and
 * Build entries: label with a live dot, then a six-cell mono counter.
 * Hidden entirely if the counter cannot be reached.
 */
export default function VisitorCounter({ className = '' }: { className?: string }) {
  const { t, lang } = useI18n();
  const reduced = usePrefersReducedMotion();
  const count = useVisitorCount();
  const shown = useCountUp(count, !reduced);

  if (count === null) return null;

  const loading = count === undefined;
  const digits = loading ? '–'.repeat(DIGITS) : String(shown).padStart(DIGITS, '0');
  const label = loading
    ? t.hero.visitors
    : `${count.toLocaleString(lang === 'hu' ? 'hu-HU' : 'en-GB')} ${t.hero.visitors.toLowerCase()}`;

  return (
    <div className={className} title={t.hero.visitorsTitle} role="status" aria-live="polite" aria-label={label}>
      <div className="label mb-2 flex items-center gap-2">
        {t.hero.visitors}
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          {!reduced && !loading && (
            <span className="absolute inline-flex h-full w-full animate-ping bg-accent opacity-60" />
          )}
          <span className={cx('relative inline-flex h-1.5 w-1.5', loading ? 'bg-line-strong' : 'bg-accent')} />
        </span>
      </div>
      <div className="flex items-center gap-[2px]" aria-hidden>
        {digits.split('').map((d, i) => {
          const lead = !loading && i < DIGITS - String(shown).length;
          return (
            <span
              key={i}
              className={cx(
                'grid h-[22px] w-4 place-items-center border font-mono text-[11px] tabular-nums leading-none transition-colors duration-300',
                i === DIGITS - 3 && 'ml-1',
                lead ? 'border-line text-line-strong' : 'border-line-strong bg-bg text-text',
              )}
            >
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}
