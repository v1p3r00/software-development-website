import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projects } from '../data/projects';
import { useI18n } from '../i18n';
import ProjectVisual from '../components/ProjectVisual';
import { usePrefersReducedMotion } from '../hooks/useMisc';
import { Arrow, CornerMarks, cx } from '../components/ui';

function Loader({ num, label, progress }: { num: string; label: string; progress: number }) {
  const cells = 20;
  const filled = Math.round((progress / 100) * cells);
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-bg px-6">
      <div className="w-full max-w-[420px]">
        <div className="label-a mb-2">Project {num}</div>
        <div className="mb-4 font-mono text-sm uppercase tracking-tech text-text">{label}…</div>
        <div className="font-mono text-sm tracking-[0.05em] text-accent">
          {'█'.repeat(filled)}
          <span className="text-line-strong">{'█'.repeat(cells - filled)}</span>
          <span className="ml-3 text-muted">{String(progress).padStart(3, ' ')}%</span>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { t, pick } = useI18n();
  const reduced = usePrefersReducedMotion();
  const project = projects.find((p) => p.id === id);
  const idx = projects.findIndex((p) => p.id === id);
  const next = projects[(idx + 1) % projects.length];

  const [progress, setProgress] = useState(reduced ? 100 : 0);
  const done = progress >= 100;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (reduced) {
      setProgress(100);
      return;
    }
    setProgress(0);
    let p = 0;
    const id2 = window.setInterval(() => {
      p = Math.min(100, p + Math.round(8 + Math.random() * 22));
      setProgress(p);
      if (p >= 100) window.clearInterval(id2);
    }, 70);
    return () => window.clearInterval(id2);
  }, [id, reduced]);

  if (!project) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <div className="display text-5xl">404</div>
          <Link to="/" className="label-a mt-4 inline-block">
            ← {t.projects.back}
          </Link>
        </div>
      </div>
    );
  }

  const blocks = [
    { label: t.projects.detail.context, body: pick(project.context) },
    { label: t.projects.detail.approach, body: pick(project.approach) },
    { label: t.projects.detail.outcome, body: pick(project.outcome) },
  ];

  return (
    <>
      {!done && <Loader num={project.num} label={t.projects.loading} progress={progress} />}

      <article
        className={cx('relative pt-28 transition-opacity duration-700', done ? 'opacity-100' : 'opacity-0')}
      >
        <div className="tech-grid pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-50" aria-hidden />

        <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            data-cursor="follow"
            className="group inline-flex items-center gap-3 font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:text-accent"
          >
            <Arrow className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
            {t.projects.back}
          </Link>

          <header className="mt-8 border-b border-line pb-8">
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="display text-accent text-[2.6rem] leading-none">{project.num}</span>
              <h1 className="display text-[clamp(2.4rem,7vw,5rem)]">{project.title}</h1>
            </div>
            <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted">{pick(project.summary)}</p>
          </header>

          <div className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-12 lg:gap-8">
            {/* meta */}
            <aside className="lg:col-span-4 lg:order-2 lg:border-l lg:border-line lg:pl-8">
              <dl className="border-t border-line">
                {[
                  [t.projects.detail.category, t.projects.categories[project.category]],
                  [t.projects.detail.role, pick(project.role)],
                  [t.projects.detail.period, project.period],
                  ...(project.client ? [[t.ui.client, project.client]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                    <dt className="label">{k}</dt>
                    <dd className="text-right font-mono text-[12px] uppercase tracking-tech text-text">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6">
                <div className="label mb-3">{t.projects.detail.stack}</div>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-line px-2 py-1 font-mono text-2xs uppercase tracking-tech text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-8 border border-line p-4 text-[13px] leading-relaxed text-dim">
                {t.projects.detail.confidential}
              </p>
            </aside>

            {/* body */}
            <div className="lg:col-span-8 lg:order-1">
              <div className="relative border border-line" data-cursor="inspect">
                <CornerMarks />
                <div className="flex items-center justify-between border-b border-line px-4 py-2">
                  <span className="label-a">schematic / {project.visual}</span>
                  <span className="label">{project.id}</span>
                </div>
                <div className="mx-auto w-full max-w-[720px]">
                  <ProjectVisual variant={project.visual} />
                </div>
              </div>

              <div className="mt-10 space-y-8">
                {blocks.map((b, i) => (
                  <section key={b.label}>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="label-a">{String(i + 1).padStart(2, '0')}</span>
                      <h2 className="font-mono text-[11px] uppercase tracking-tech text-text">{b.label}</h2>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                    <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted">{b.body}</p>
                  </section>
                ))}
              </div>
            </div>
          </div>

          {/* next */}
          <Link
            to={`/project/${next.id}`}
            data-cursor="open"
            className="group mb-20 flex items-center justify-between gap-6 border-t border-line py-10"
          >
            <div>
              <div className="label mb-2">{t.projects.next}</div>
              <div className="display text-[clamp(1.8rem,5vw,3.4rem)] transition-colors group-hover:text-accent">
                {next.num} — {next.title}
              </div>
            </div>
            <Arrow className="h-4 w-12 shrink-0 text-dim transition-all duration-300 group-hover:translate-x-2 group-hover:text-accent" />
          </Link>
        </div>
      </article>
    </>
  );
}
