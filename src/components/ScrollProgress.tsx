import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { site } from '../data/site';
import { useActiveSection, useScrollProgress } from '../hooks/useMisc';
import { cx } from './ui';

export default function ScrollProgress() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const active = useActiveSection(site.sections, onHome);
  const progress = useScrollProgress();
  const labels: Record<string, string> = {
    home: t.nav.home,
    about: t.nav.about,
    projects: t.nav.projects,
    services: t.nav.services,
    contact: t.nav.contact,
  };

  return (
    <>
      {/* thin top progress bar (all viewports) */}
      <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-px bg-line">
        <div
          className="h-px bg-accent transition-[width] duration-150 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* right-hand section rail (desktop) */}
      {onHome && (
      <nav
        aria-label="Section progress"
        className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 rail:flex"
      >
        {site.sections.map((id, i) => {
          const on = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              data-cursor="follow"
              className="group flex items-center gap-3 font-mono text-2xs uppercase tracking-tech"
            >
              <span
                className={cx(
                  'transition-all duration-300',
                  on ? 'text-accent opacity-100' : 'text-dim opacity-0 group-hover:opacity-100',
                )}
              >
                {String(i + 1).padStart(2, '0')} / {labels[id]}
              </span>
              <span
                className={cx(
                  'block h-px transition-all duration-300',
                  on ? 'w-8 bg-accent' : 'w-4 bg-line-strong group-hover:w-6',
                )}
              />
            </a>
          );
        })}
      </nav>
      )}
    </>
  );
}
