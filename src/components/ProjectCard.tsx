import { Link } from 'react-router-dom';
import type { Project } from '../data/projects';
import { useI18n } from '../i18n';
import ProjectVisual from './ProjectVisual';
import { Arrow } from './ui';

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t, pick } = useI18n();

  return (
    <Link
      to={`/project/${project.id}`}
      data-cursor="open"
      aria-label={`${project.num} — ${project.title}`}
      className="group relative flex h-full flex-col border border-line bg-surface transition-[border-color,transform] duration-500 ease-tech hover:z-10 hover:border-line-strong hover:-translate-y-1"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="font-mono text-2xs tracking-tech text-dim transition-colors duration-300 group-hover:text-accent">
          {project.num}
        </span>
        <span className="label truncate">{t.projects.categories[project.category]}</span>
      </div>

      {/* visual */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-tech group-hover:scale-[1.05] group-hover:-translate-y-1">
          <ProjectVisual variant={project.visual} />
        </div>

        {/* technical overlay on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-bg/55" />
          <div className="absolute left-3 top-3 font-mono text-2xs uppercase tracking-tech text-accent">
            ID {project.id}
          </div>
          <div className="absolute bottom-3 left-3 font-mono text-2xs uppercase tracking-tech text-muted">
            {project.period}
          </div>
          <div className="absolute inset-x-0 top-1/2 h-px bg-accent/40" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-accent/40" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 border border-accent px-2 py-1 font-mono text-2xs uppercase tracking-tech text-accent">
            {t.projects.open}
          </span>
        </div>

        {/* animated accent rule */}
        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-accent transition-[width] duration-500 ease-tech group-hover:w-full" />
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="display text-lg leading-tight sm:text-xl">{project.title}</h3>
        {project.client && <div className="label-a mt-1">{project.client}</div>}
        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">{pick(project.summary)}</p>

        <div className="mt-4 flex items-end gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="border border-line px-1.5 py-0.5 font-mono text-2xs uppercase tracking-tech text-dim transition-colors duration-300 group-hover:border-line-strong group-hover:text-muted"
            >
              {tag}
            </span>
          ))}
          </div>
          <Arrow className="mb-1 ml-auto shrink-0 text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
        </div>
      </div>
    </Link>
  );
}
