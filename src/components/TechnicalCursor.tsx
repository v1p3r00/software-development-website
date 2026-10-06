import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { useIsCoarsePointer, usePrefersReducedMotion } from '../hooks/useMisc';
import { useCursorPref } from '../hooks/useCursorPref';

type Kind = 'default' | 'open' | 'follow' | 'inspect' | 'text';

const INTERACTIVE = 'a, button, [role="button"], summary, label, select, [data-cursor]';
const TEXT_ENTRY = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';

/**
 * A decorative ring that sits exactly on the system cursor (which stays visible).
 * It grows over interactive elements, shows a small label on cards, hides over
 * text fields, while typing or using the keyboard, and can be switched off.
 */
export default function TechnicalCursor() {
  const { t } = useI18n();
  const coarse = useIsCoarsePointer();
  const reduced = usePrefersReducedMotion();
  const [enabled] = useCursorPref();
  const ringRef = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<Kind>('default');
  const [visible, setVisible] = useState(false);
  const active = enabled && !coarse;

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const pos = { x: -100, y: -100 };
    const place = () => {
      raf = 0;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    };
    // pointermove only moves the ring; React state changes only when the
    // visibility or the hovered element's kind actually changes
    let shown = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!raf) raf = requestAnimationFrame(place);
      if (!shown) {
        shown = true;
        setVisible(true);
      }
    };
    // what is under the pointer only changes on pointerover, not every move
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const target = e.target as HTMLElement | null;
      let next: Kind = 'default';
      if (target?.closest?.(TEXT_ENTRY) || target?.closest?.('.code-plain')) next = 'text';
      else {
        const el = target?.closest?.(INTERACTIVE) as HTMLElement | null;
        if (el) next = (el.dataset.cursor as Kind | undefined) ?? 'follow';
      }
      setKind((k) => (k === next ? k : next));
    };
    const hide = () => {
      shown = false;
      setVisible(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) hide();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerleave', hide);
    window.addEventListener('keydown', onKey);
    window.addEventListener('blur', hide);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('blur', hide);
    };
  }, [active]);

  if (!active) return null;

  const label = kind === 'open' ? t.cursor.open : kind === 'inspect' ? t.cursor.inspect : '';
  const big = kind !== 'default' && kind !== 'text';
  return (
    <div
      ref={ringRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden lg:block"
      style={{ opacity: visible && kind !== 'text' ? 1 : 0, transition: 'opacity .15s linear', viewTransitionName: 'tech-cursor' }}
    >
      <div
        className="cursor-ring"
        style={{
          transform: `translate(-50%, -50%) scale(${big ? 1 : 0.62})`,
          transition: reduced ? 'none' : 'transform .2s cubic-bezier(.16,1,.3,1), background-color .2s',
        }}
        data-big={big || undefined}
      />
      {label && (
        <span className="absolute left-6 top-5 whitespace-nowrap border border-accent bg-bg px-2 py-1 font-mono text-[12.5px] uppercase tracking-tech text-accent shadow-lg">
          {label} →
        </span>
      )}
    </div>
  );
}
