import { Link } from 'react-router-dom';
import type { Project } from '../data/projects';
import { useI18n } from '../i18n';
import ProjectVisual from './ProjectVisual';
import { Arrow } from './ui';

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t, pick, lp } = useI18n();

  return (
    <Link
      to={lp(`/project/${project.id}`)}
      data-cursor="open"
      aria-label={`${project.num} — ${project.title}`}
      className="lift group pc"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="pc-num">
          {project.num}
        </span>
        <span className="label truncate">{t.projects.categories[project.category]}</span>
      </div>

      {/* visual */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
        <div className="pc-vis">
          <ProjectVisual variant={project.visual} />
        </div>

        {/* technical overlay on hover */}
        <div className="pc-ovl">
          <div className="pc-chip left-3 top-3 text-accent">
            ID {project.id}
          </div>
          {project.period && (
            <div className="pc-chip bottom-3 left-3 text-muted">
              {project.period.replace('present', t.ui.present)}
            </div>
          )}
          <span className="pc-open">
            {t.projects.open}
          </span>
        </div>

        {/* animated accent rule */}
        <span className="pc-rule" />
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="display text-lg leading-tight sm:text-xl">{project.title}</h3>
        {project.kind && (
          <div className="mt-1 text-[13px] leading-snug text-muted">{pick(project.kind)}</div>
        )}
        {project.client && <div className="label-a mt-1.5">{project.client}</div>}
        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">{pick(project.summary)}</p>

        <div className="mt-4 flex items-end gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="pc-tag"
            >
              {tag}
            </span>
          ))}
          </div>
          <Arrow className="pc-arrow" />
        </div>
      </div>
    </Link>
  );
}
