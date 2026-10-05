import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/*
 * Shared plumbing for the live mockups: in-frame scrolling instead of links,
 * a sticky overlay host for modals / drawers / toasts, and a way for a mockup
 * to ask the comparison to reveal it fully (e.g. when its cart opens).
 */

/** scrolls the comparison frame (not the page) to an element inside a mockup */
export function scrollInFrame(el: Element | null | undefined) {
  if (!el) return;
  const sc = el.closest('[data-mz-scroller]') as HTMLElement | null;
  if (!sc) return;
  const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
  sc.scrollTo({ top: Math.max(0, top - 4), behavior: 'smooth' });
}

/** scroll to the element with `[data-mz="<id>"]` inside the same mockup */
export function goSection(from: Element | null, id: string) {
  const root = from?.closest('[data-mz-root]');
  scrollInFrame(root?.querySelector(`[data-mz="${id}"]`));
}

type Side = 'before' | 'after';
export const RevealContext = createContext<(side: Side) => void>(() => {});
/** a mockup calls reveal('after') when it opens a modal, so nothing covers it */
export const useReveal = () => useContext(RevealContext);

/**
 * Holds modals, drawers and toasts at the top of the visible frame while the
 * page underneath scrolls (sticky, zero height; children use .mz-layer).
 */
export function OverlayHost({ children }: { children: ReactNode }) {
  return <div className="mz-host">{children}</div>;
}

export function Modal({ open, onClose, children, className = '' }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="mz-layer mz-center">
      <div className="mz-backdrop" onClick={onClose} />
      <div role="dialog" aria-modal="true" className={`mz-dialog ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, side = 'right', children, className = '' }: { open: boolean; onClose: () => void; side?: 'left' | 'right'; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  return (
    <div className={`mz-layer ${open ? '' : 'mz-off'}`} aria-hidden={!open}>
      <div className="mz-backdrop" onClick={onClose} />
      <aside className={`mz-drawer mz-${side} ${className}`}>{children}</aside>
    </div>
  );
}

/** a short-lived message at the bottom of the frame */
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<number | undefined>(undefined);
  const show = (m: string) => {
    setMsg(m);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setMsg(null), 2400);
  };
  useEffect(() => () => window.clearTimeout(t.current), []);
  const node = msg ? (
    <div className="mz-layer mz-pass">
      <div className="mz-toast" role="status">
        {msg}
      </div>
    </div>
  ) : null;
  return [node, show] as const;
}

/** the current time, refreshed every 30 s — for "open now" badges and countdowns */
export function useNow(every = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), every);
    return () => window.clearInterval(id);
  }, [every]);
  return now;
}

export const huf = (n: number) => `${n.toLocaleString('hu-HU').replace(/ /g, ' ')} Ft`;

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
