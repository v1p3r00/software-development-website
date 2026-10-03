import { CornerMarks, Section, SectionHeader } from '../ui';
import { ActionBtn } from './form';
import { scrollToId } from './scroll';
import type { Guide as GuideData } from './guideContent';


function Example({ weak, strong, why, g }: { weak: string; strong: string; why: string; g: GuideData }) {
  return (
    <div className="relative mt-6 border border-line bg-surface">
      <CornerMarks />
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="border-b border-line p-5 sm:border-b-0 sm:border-r">
          <div className="mb-2 flex items-center gap-2 font-mono text-2xs uppercase tracking-tech text-dim">
            <span className="grid h-4 w-4 place-items-center border border-line-strong text-[9px]">✕</span>
            {g.weak}
          </div>
          <p className="text-sm leading-relaxed text-muted line-through decoration-line-strong/60">{weak}</p>
        </div>
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2 font-mono text-2xs uppercase tracking-tech text-accent">
            <span className="grid h-4 w-4 place-items-center bg-accent text-[9px] text-onaccent">✓</span>
            {g.strong}
          </div>
          <p className="text-sm leading-relaxed text-text">{strong}</p>
        </div>
      </div>
      <p className="border-t border-line px-5 py-3 text-[13px] leading-relaxed text-muted">
        <span className="label-a mr-2">{g.why}</span>
        {why}
      </p>
    </div>
  );
}

export default function Guide({ g, index, onStart }: { g: GuideData; index: string; onStart: () => void }) {
  return (
    <Section id="cv-guide">
      <SectionHeader index={index} title={g.title} subtitle={g.subtitle} />
      <p className="mb-12 max-w-[68ch] text-base leading-relaxed text-muted sm:text-lg">{g.intro}</p>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* contents */}
        <nav aria-label={g.subtitle} className="hidden lg:col-span-3 lg:block">
          <ol className="sticky top-28 border-t border-line">
            {[...g.topics, { id: 'mistakes', title: g.mistakesTitle }].map((tp, i) => (
              <li key={tp.id} className="border-b border-line">
                <a
                  href={`#guide-${tp.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(`guide-${tp.id}`);
                  }}
                  data-cursor="follow"
                  className="group flex gap-3 py-2.5 text-[13px] leading-snug text-muted transition-colors hover:text-text"
                >
                  <span className="font-mono text-2xs tracking-tech text-dim group-hover:text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {tp.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="lg:col-span-9">
          {g.topics.map((tp, i) => (
            <article key={tp.id} id={`guide-${tp.id}`} className="scroll-mt-28 border-t border-line py-10 first:pt-0 first:border-t-0">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-2xs tracking-tech text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display text-2xl leading-none sm:text-[2rem]">{tp.title}</h3>
              </div>
              <p className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-muted">{tp.body}</p>
              {tp.points && (
                <ul className="mt-5 grid max-w-[70ch] gap-2">
                  {tp.points.map((pt) => (
                    <li key={pt} className="flex gap-3 text-sm leading-relaxed text-text">
                      <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden />
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
              {tp.examples?.map((ex) => <Example key={ex.weak} g={g} {...ex} />)}
            </article>
          ))}

          <article id="guide-mistakes" className="scroll-mt-28 border-t border-line py-10">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-2xs tracking-tech text-accent">{String(g.topics.length + 1).padStart(2, '0')}</span>
              <h3 className="display text-2xl leading-none sm:text-[2rem]">{g.mistakesTitle}</h3>
            </div>
            <p className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-muted">{g.mistakesIntro}</p>
            <div className="mt-6 border-t border-line">
              <div className="hidden grid-cols-2 gap-6 border-b border-line py-2 sm:grid">
                <span className="label">{g.mistakeLabel}</span>
                <span className="label-a">{g.fixLabel}</span>
              </div>
              {g.mistakes.map((m) => (
                <div key={m.mistake} className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-2 sm:gap-6">
                  <p className="text-sm leading-relaxed text-muted">
                    <span className="label mr-2 sm:hidden">{g.mistakeLabel}</span>
                    {m.mistake}
                  </p>
                  <p className="text-sm leading-relaxed text-text">
                    <span className="label-a mr-2 sm:hidden">{g.fixLabel}</span>
                    {m.fix}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <ActionBtn solid onClick={onStart}>
                {g.cta} ↑
              </ActionBtn>
            </div>
          </article>
        </div>
      </div>
    </Section>
  );
}
