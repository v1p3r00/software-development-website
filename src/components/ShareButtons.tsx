import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { cx } from './ui';

const FB = (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // older browsers / insecure context: a hidden textarea and execCommand
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** "Copy link" and "Share on Facebook" for a page */
export default function ShareButtons({ url, className, size = 'sm' }: { url: string; className?: string; size?: 'sm' | 'md' }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);
  const btn = cx(
    'inline-flex items-center gap-2 border font-mono uppercase tracking-tech transition-colors',
    size === 'md' ? 'px-4 py-3 text-[12.5px]' : 'px-3 py-2 text-2xs',
  );
  return (
    <div role="group" aria-label={t.ux.shareLabel} className={cx('flex flex-wrap items-center gap-2', className)}>
      <button
        type="button"
        onClick={async () => setCopied(await copy(url))}
        data-cursor="follow"
        className={cx(btn, copied ? 'border-accent text-accent' : 'border-line-strong text-muted hover:border-accent hover:text-text')}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          {copied ? (
            <path d="M3 8.5 6.5 12 13 4.5" />
          ) : (
            <path d="M6.5 9.5 9.5 6.5M7 4.5l1.2-1.2a2.6 2.6 0 0 1 3.6 3.6L10.5 8M9 11.5l-1.2 1.2a2.6 2.6 0 0 1-3.6-3.6L5.5 8" />
          )}
        </svg>
        <span aria-live="polite">{copied ? t.ux.linkCopied : t.ux.copyLink}</span>
      </button>
      <a
        href={FB(url)}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="follow"
        className={cx(btn, 'border-[#1877f2]/60 text-[#1877f2] hover:bg-[#1877f2] hover:text-white')}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          <path d="M9.2 16V8.7h2.4l.4-2.8H9.2V4.1c0-.8.2-1.4 1.4-1.4H12V.1A19 19 0 0 0 9.9 0C7.8 0 6.4 1.3 6.4 3.6v2.3H4v2.8h2.4V16z" />
        </svg>
        {t.ux.shareFacebook}
      </a>
    </div>
  );
}

/** a "support me with a share" box for the free tools */
export function SupportShare({ url, text, className }: { url: string; text: string; className?: string }) {
  const { t } = useI18n();
  return (
    <aside className={cx('relative border border-accent/50 bg-accent/[0.06] p-5 sm:p-6', className)}>
      <div className="flex items-center gap-2 font-display text-lg font-extrabold uppercase tracking-tight text-text">
        <span aria-hidden className="text-accent">♥</span>
        {t.ux.supportTitle}
      </div>
      <p className="mt-2 max-w-[62ch] text-[14.5px] leading-relaxed text-muted">{text}</p>
      <ShareButtons url={url} size="md" className="mt-4" />
    </aside>
  );
}

/** a compact "Share on Facebook" link, for lists */
export function FacebookShare({ url, label, className }: { url: string; label?: string; className?: string }) {
  const { t } = useI18n();
  return (
    <a
      href={FB(url)}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="follow"
      title={label ?? t.ux.shareFacebook}
      className={cx(
        'inline-flex items-center gap-2 border border-[#1877f2]/60 px-3 py-2 text-[13px] text-[#1877f2] transition-colors hover:bg-[#1877f2] hover:text-white',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
        <path d="M9.2 16V8.7h2.4l.4-2.8H9.2V4.1c0-.8.2-1.4 1.4-1.4H12V.1A19 19 0 0 0 9.9 0C7.8 0 6.4 1.3 6.4 3.6v2.3H4v2.8h2.4V16z" />
      </svg>
      {label ?? t.ux.shareFacebook}
    </a>
  );
}
