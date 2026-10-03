import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CvSheet from './CvSheet';
import type { Cv } from './model';

const MM = 96 / 25.4; // CSS px per millimetre
const PAGE_W = 210 * MM;
const PAGE_H = 297 * MM;

/**
 * The CV drawn at true A4 size and scaled down to fit its column, with dashed
 * guides where a printed page would end. Reports the estimated page count.
 */
export default function Preview({ cv, onPages }: { cv: Cv; onPages?: (n: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(PAGE_H);
  const [content, setContent] = useState(0);
  const [pad, setPad] = useState(15 * MM);

  // the sheet is at least one A4 tall, so the content's own extent decides the page count
  const measure = useCallback(() => {
    const root = sheet.current?.querySelector<HTMLElement>('.cv-sheet');
    if (!root) return;
    const top = root.getBoundingClientRect().top;
    const k = root.getBoundingClientRect().height / root.offsetHeight || 1;
    let bottom = 0;
    root.querySelectorAll('.cv-header, .cv-section').forEach((el) => {
      bottom = Math.max(bottom, el.getBoundingClientRect().bottom - top);
    });
    setContent(bottom / k);
    setPad((parseFloat(getComputedStyle(root).getPropertyValue('--cv-pad-y')) || 15) * MM);
    setHeight(root.offsetHeight);
  }, []);

  useLayoutEffect(() => {
    const b = box.current;
    const s = sheet.current;
    if (!b || !s) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, b.clientWidth / PAGE_W));
      measure();
    });
    ro.observe(b);
    ro.observe(s);
    return () => ro.disconnect();
  }, [measure]);

  useLayoutEffect(measure, [cv, measure]);

  // printed, every page repeats the sheet's vertical padding (see cv.css): the first
  // page ends one padding above the edge, later ones also start one padding down
  const FIRST = PAGE_H - pad;
  const NEXT = PAGE_H - 2 * pad;
  const pages = content <= FIRST + 1 ? 1 : 1 + Math.ceil((content - FIRST) / NEXT);
  useEffect(() => onPages?.(pages), [pages, onPages]);

  const guides = Array.from({ length: pages - 1 }, (_, i) => FIRST + i * NEXT);

  return (
    <div ref={box} className="w-full">
      <div className="relative mx-auto origin-top-left" style={{ width: PAGE_W * scale, height: height * scale }}>
        <div
          ref={sheet}
          className="absolute left-0 top-0 origin-top-left shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]"
          style={{ transform: `scale(${scale})`, width: PAGE_W }}
        >
          <CvSheet cv={cv} />
          {guides.map((y, i) => (
            <div
              key={y}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#9aa3b2]"
              style={{ top: y }}
            >
              <span className="absolute right-2 top-1 bg-white px-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9aa3b2]">
                {i + 2}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** an unscaled copy of the CV that only exists for the print dialog */
export function PrintCopy({ cv }: { cv: Cv }) {
  return createPortal(
    <div className="cv-print-root">
      <CvSheet cv={cv} />
    </div>,
    document.body,
  );
}
