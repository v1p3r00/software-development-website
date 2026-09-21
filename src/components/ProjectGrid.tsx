import { useMemo, useState } from 'react';
import { filterKeys, projects } from '../data/projects';
import type { FilterKey } from '../data/projects';
import { useI18n } from '../i18n';
import ProjectCard from './ProjectCard';
import { Section, SectionHeader, cx } from './ui';

export default function ProjectGrid() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterKey>('all');

  const visible = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.filters.includes(filter))),
    [filter],
  );

  const labelFor = (key: FilterKey) =>
    key === 'all'
      ? t.projects.all
      : key === 'enterprise'
        ? t.projects.categories.enterprise
        : key === 'finance'
          ? t.projects.categories.finance
          : key === 'government'
            ? t.projects.categories.government
            : key === 'web'
              ? t.projects.categories.web
              : t.projects.categories.custom;

  return (
    <Section id="projects">
      <SectionHeader
        index={t.projects.index}
        title={t.projects.title}
        subtitle={t.projects.subtitle}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <span className="label mr-1 hidden sm:inline">{t.projects.filterLabel}</span>
            {filterKeys.map((key) => {
              const on = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={on}
                  data-cursor="follow"
                  className={cx(
                    'border px-2.5 py-1 font-mono text-2xs uppercase tracking-tech transition-colors duration-300',
                    on
                      ? 'border-accent text-accent'
                      : 'border-line text-dim hover:border-line-strong hover:text-text',
                  )}
                >
                  [ {labelFor(key)} ]
                </button>
              );
            })}
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <span className="label-a">
          {t.projects.count}: {String(visible.length).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </span>
        <span className="ticks-x h-2 flex-1 opacity-30" aria-hidden />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}

        {/* statement cell — fills the grid and carries the CTA */}
        <div className="relative flex min-h-[260px] flex-col justify-between border border-line bg-surface p-5">
          <div className="crosshair -left-[4px] -top-[4px]" aria-hidden />
          <div className="crosshair -bottom-[4px] -right-[4px]" aria-hidden />
          <p className="display max-w-[16ch] text-xl leading-[1.05] sm:text-2xl">{t.ui.quote}</p>
          <div>
            <div className="mb-4 h-px w-10 bg-accent" />
            <a
              href="#contact"
              data-cursor="follow"
              className="group inline-flex items-center gap-3 font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:text-accent"
            >
              {t.nav.talk}
              <span className="grid h-8 w-8 place-items-center rounded-full border border-line-strong transition-colors group-hover:border-accent">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
