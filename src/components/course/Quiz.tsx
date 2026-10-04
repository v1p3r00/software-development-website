import { useState } from 'react';
import type { QuizQuestion } from '../../data/course';
import { cx } from '../ui';
import { useProgress } from './progress';
import type { CourseText } from './text';

export default function Quiz({ slug, questions, t }: { slug: string; questions: QuizQuestion[]; t: CourseText }) {
  const { progress, update } = useProgress();
  const [picked, setPicked] = useState<Array<number | null>>(() => questions.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const right = picked.filter((p, i) => p === questions[i].answer).length;
  const finished = answered === questions.length;
  const best = progress.quiz[slug];

  const choose = (qi: number, oi: number) => {
    if (picked[qi] !== null) return;
    const next = picked.map((p, i) => (i === qi ? oi : p));
    setPicked(next);
    if (next.every((p) => p !== null)) {
      const score = next.filter((p, i) => p === questions[i].answer).length / questions.length;
      update((p) => ({ ...p, quiz: { ...p.quiz, [slug]: Math.max(score, p.quiz[slug] ?? 0) } }));
    }
  };

  return (
    <section className="mt-16" aria-labelledby={`quiz-${slug}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <div className="label-a mb-1">// {t.quiz}</div>
          <h2 id={`quiz-${slug}`} className="display text-2xl leading-none sm:text-3xl">
            {t.quiz}
          </h2>
        </div>
        <span className="label">
          {t.score}: <span className="text-text">{right} / {questions.length}</span>
          {best !== undefined && (
            <span className="ml-3">
              {t.best}: <span className="text-text">{Math.round(best * 100)}%</span>
            </span>
          )}
        </span>
      </div>
      <p className="mb-8 text-sm text-muted">{t.quizIntro}</p>

      <ol className="flex flex-col gap-10">
        {questions.map((q, qi) => {
          const p = picked[qi];
          return (
            <li key={qi}>
              <div className="mb-3 flex gap-3">
                <span className="mt-1 font-mono text-2xs tracking-tech text-accent">{String(qi + 1).padStart(2, '0')}</span>
                <p className="text-base font-medium leading-snug text-text">{q.question}</p>
              </div>
              <div className="grid grid-cols-1 gap-2 pl-7 sm:grid-cols-2">
                {q.options.map((o, oi) => {
                  const isAnswer = oi === q.answer;
                  const chosen = p === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={p !== null}
                      onClick={() => choose(qi, oi)}
                      data-cursor="follow"
                      className={cx(
                        'flex items-start gap-3 border px-4 py-3 text-left text-sm leading-snug transition-colors',
                        p === null && 'border-line text-muted hover:border-accent hover:text-text',
                        p !== null && isAnswer && 'border-accent bg-accent/10 text-text',
                        p !== null && chosen && !isAnswer && 'border-red-500/60 text-muted line-through decoration-red-500/50',
                        p !== null && !chosen && !isAnswer && 'border-line text-dim',
                      )}
                    >
                      <span className="font-mono text-2xs uppercase tracking-tech text-dim">{String.fromCharCode(65 + oi)}</span>
                      <span className="flex-1">{o}</span>
                    </button>
                  );
                })}
              </div>
              {p !== null && (
                <p className="mt-3 pl-7 text-sm leading-relaxed text-muted" style={{ animation: 'fadeUp .35s cubic-bezier(.16,1,.3,1) both' }}>
                  <span className={cx('label mr-2', p === q.answer ? '!text-accent' : '!text-red-500')}>{p === q.answer ? t.correct : t.wrong}</span>
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {finished && (
        <div className="mt-8 flex flex-wrap items-center gap-4 border border-line bg-surface px-5 py-4">
          <span className="display text-3xl">{Math.round((right / questions.length) * 100)}%</span>
          <button
            type="button"
            onClick={() => setPicked(questions.map(() => null))}
            className="border border-line-strong px-4 py-2 font-mono text-[12.5px] uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {t.retry}
          </button>
        </div>
      )}
    </section>
  );
}
