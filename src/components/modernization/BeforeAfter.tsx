import { useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { cx } from '../ui';

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/**
 * Two full pages stacked in one scroll area: `after` underneath, `before` on top,
 * clipped at `pos` percent from the left. Each page is drawn at its own design
 * width and zoomed to the frame, so a 1280px desktop site and a 390px phone layout
 * can share one frame. Both scroll together, and both are live: menus, forms and
 * carts work. The divider moves with its handle (pointer) or the arrow keys.
 */
export default function BeforeAfter({
  before,
  after,
  beforeWidth,
  afterWidth,
  pos,
  onPos,
  labels,
  sliderLabel,
  labelsAt = 'top',
  beforeBg = '#ccc',
  className = '',
}: {
  before: ReactNode;
  after: ReactNode;
  beforeWidth: number;
  afterWidth: number;
  pos: number;
  onPos: (pos: number) => void;
  labels: { before: string; after: string };
  sliderLabel: string;
  /** where the Before / After chips sit — 'bottom' keeps them clear of a phone's notch */
  labelsAt?: 'top' | 'bottom';
  /** fills the before layer below a page shorter than the after page */
  beforeBg?: string;
  className?: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const width = size.w;
  const [active, setActive] = useState(false);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fromX = (clientX: number) => {
    const r = stage.current?.getBoundingClientRect();
    if (r && r.width) onPos(clamp(((clientX - r.left) / r.width) * 100));
  };

  const start = (e: PointerEvent<HTMLElement>) => {
    dragging.current = true;
    setActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    fromX(e.clientX);
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    if (dragging.current) fromX(e.clientX);
  };
  const end = () => {
    dragging.current = false;
    setActive(false);
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const next =
      e.key === 'ArrowLeft' || e.key === 'ArrowDown'
        ? pos - step
        : e.key === 'ArrowRight' || e.key === 'ArrowUp'
          ? pos + step
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? 100
              : null;
    if (next === null) return;
    e.preventDefault();
    onPos(clamp(next));
  };

  const zoomAfter = width ? width / afterWidth : 0;
  const zoomBefore = width ? width / beforeWidth : 0;

  return (
    <div ref={stage} className={cx('relative isolate overflow-hidden bg-[#111]', className)}>
      {/* the mockups are live sites: click, hover and type in them; only the handle moves the divider */}
      <div
        ref={scroller}
        data-mz-scroller
        className={cx(
          'absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          active && 'pointer-events-none select-none',
        )}
      >
        {width > 0 && (
          <div className="grid">
            {/* each page is its own stacking context, so the after page's z-indexed
                parts can't paint over the before page */}
            <div style={{ gridArea: '1 / 1' }} className="relative isolate z-0">
              <div style={{ width: afterWidth, zoom: zoomAfter, ['--mz-vh' as string]: `${size.h / zoomAfter}px` }}>{after}</div>
            </div>
            <div
              style={{ gridArea: '1 / 1', clipPath: `inset(0 ${100 - pos}% 0 0)`, background: beforeBg }}
              className={cx('relative isolate z-[1]', !active && 'transition-[clip-path] duration-500 ease-tech')}
            >
              <div style={{ width: beforeWidth, zoom: zoomBefore, ['--mz-vh' as string]: `${size.h / zoomBefore}px` }}>{before}</div>
            </div>
          </div>
        )}
      </div>

      {/* corner labels */}
      <span
        className={cx(
          'pointer-events-none absolute left-3 z-10 bg-black/70 px-2.5 py-1 font-mono text-2xs uppercase tracking-tech text-white backdrop-blur transition-opacity duration-300',
          labelsAt === 'top' ? 'top-3' : 'bottom-4',
          pos > 10 ? 'opacity-100' : 'opacity-0',
        )}
      >
        {labels.before}
      </span>
      <span
        className={cx(
          'pointer-events-none absolute right-3 z-10 bg-white/85 px-2.5 py-1 font-mono text-2xs uppercase tracking-tech text-black backdrop-blur transition-opacity duration-300',
          labelsAt === 'top' ? 'top-3' : 'bottom-4',
          pos < 90 ? 'opacity-100' : 'opacity-0',
        )}
      >
        {labels.after}
      </span>

      {/* divider */}
      <div
        className={cx('absolute inset-y-0 z-20 w-0', active ? '' : 'transition-[left] duration-500 ease-tech')}
        style={{ left: `${pos}%` }}
      >
        <div className="absolute inset-y-0 -left-px w-[2px] bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_0_18px_rgb(0_0_0/0.45)]" />
        <div
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onWheel={(e) => scroller.current?.scrollBy({ top: e.deltaY })}
          className={cx('absolute inset-y-0 -left-5 w-10 touch-none', active ? 'cursor-grabbing' : 'cursor-ew-resize')}
        >
          <button
            type="button"
            role="slider"
            aria-label={sliderLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${labels.before} ${Math.round(pos)}% · ${labels.after} ${100 - Math.round(pos)}%`}
            onKeyDown={onKey}
            style={{ marginLeft: pos <= 2 ? 26 : pos >= 98 ? -26 : 0 }}
            className={cx(
              'absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/55 text-white shadow-xl backdrop-blur-md transition-[transform,margin] duration-300',
              active ? 'scale-110' : 'hover:scale-105',
            )}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
