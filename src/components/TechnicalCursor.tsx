import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { useIsCoarsePointer, usePrefersReducedMotion } from '../hooks/useMisc';

type Kind = 'default' | 'open' | 'follow' | 'inspect';

export default function TechnicalCursor() {
  const { t } = useI18n();
  const coarse = useIsCoarsePointer();
  const reduced = usePrefersReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<Kind>('default');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (coarse || reduced) return;
    document.body.classList.add('hide-cursor');

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...pos };
    let raf = 0;

    const render = () => {
      pos.x += (target.x - pos.x) * 0.28;
      pos.y += (target.y - pos.y) * 0.28;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      setVisible(true);
      const el = (e.target as HTMLElement | null)?.closest?.('[data-cursor]') as HTMLElement | null;
      const next = (el?.dataset.cursor as Kind | undefined) ?? 'default';
      setKind((k) => (k === next ? k : next));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.body.classList.remove('hide-cursor');
    };
  }, [coarse, reduced]);

  if (coarse || reduced) return null;

  const label =
    kind === 'open' ? t.cursor.open : kind === 'follow' ? t.cursor.follow : kind === 'inspect' ? t.cursor.inspect : '';

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden lg:block"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity .2s linear' }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* crosshair */}
        <svg
          viewBox="0 0 40 40"
          className="h-10 w-10 text-accent transition-transform duration-300 ease-tech"
          style={{ transform: kind === 'default' ? 'scale(0.55)' : 'scale(1)' }}
          fill="none"
        >
          <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1" opacity={kind === 'default' ? 0 : 0.7} />
          <path d="M20 4v8M20 28v8M4 20h8M28 20h8" stroke="currentColor" strokeWidth="1" />
          <circle cx="20" cy="20" r="1.6" fill="currentColor" />
        </svg>
      </div>
      {label && (
        <span className="absolute left-7 top-4 whitespace-nowrap border border-accent bg-bg/90 px-2 py-1 font-mono text-2xs uppercase tracking-tech text-accent">
          [ {label} → ]
        </span>
      )}
    </div>
  );
}
