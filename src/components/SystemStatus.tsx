import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { site } from '../data/site';
import { useLocalClock } from '../hooks/useMisc';

export default function SystemStatus() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const clock = useLocalClock(site.timezone);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="fixed bottom-4 left-4 z-40 hidden transition-all duration-500 ease-tech lg:block"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(8px)',
        pointerEvents: shown ? 'auto' : 'none',
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-cursor="follow"
        className="flex items-center gap-2 border border-line bg-bg/85 px-3 py-2 font-mono text-2xs uppercase tracking-tech text-muted backdrop-blur-sm transition-colors hover:border-line-strong"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        {t.system.label}
        <span className="text-text">{t.system.online}</span>
      </button>

      <div
        className="absolute bottom-full left-0 mb-2 w-[290px] origin-bottom-left border border-line bg-surface/95 p-4 backdrop-blur-sm transition-all duration-300 ease-tech"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.98)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="ticks-x mb-3 h-2 opacity-40" />
        <dl className="space-y-1.5 font-mono text-2xs uppercase tracking-tech">
          {[
            [t.system.build, site.build],
            [t.system.stack, 'Java / React / Angular'],
            [t.system.mode, t.system.modeValue],
            [t.system.localTime, `${clock} CET`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="text-dim">{k}</dt>
              <dd className="text-right text-text">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 border-t border-line pt-2 font-mono text-2xs uppercase tracking-tech text-accent">
          ● {t.system.availability}
        </div>
      </div>
    </div>
  );
}
