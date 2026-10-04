import { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import type { Exercise } from '../../data/course';
import { CornerMarks, cx } from '../ui';
import { SANDBOX, buildDoc } from './runner';
import type { RunResult, TestResult } from './runner';
import { useProgress } from './progress';
import type { CourseText } from './text';

const TIMEOUT = 7000;

/** a plain textarea code editor: line numbers, Tab indents, ⌘/Ctrl+Enter runs */
function CodeEditor({ value, onChange, onRun, label }: { value: string; onChange: (v: string) => void; onRun: () => void; label: string }) {
  const area = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split('\n').length;
  return (
    <div className="relative flex max-h-[460px] min-h-[260px] overflow-hidden border border-line bg-bg code-plain font-mono text-[13px] leading-[1.6]">
      <div ref={gutter} aria-hidden className="select-none overflow-hidden border-r border-line px-3 py-3 text-right text-dim">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={area}
        aria-label={label}
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        wrap="off"
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
        }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            onRun();
            return;
          }
          if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            const el = e.currentTarget;
            const { selectionStart: s, selectionEnd: end } = el;
            const next = value.slice(0, s) + '  ' + value.slice(end);
            onChange(next);
            requestAnimationFrame(() => {
              el.selectionStart = el.selectionEnd = s + 2;
            });
          }
        }}
        className="min-w-0 flex-1 resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 text-text caret-accent outline-none"
      />
    </div>
  );
}

export default function ExerciseBox({ slug, ex, t }: { slug: string; ex: Exercise; t: CourseText }) {
  const { progress, update } = useProgress();
  const [code, setCode] = useState(() => progress.code[slug] ?? ex.starter);
  // one run = a clean preview frame (no tests) + a fresh hidden frame per test
  const [run, setRun] = useState<{ nonce: string; doc: string; tests: string[] } | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [hint, setHint] = useState(false);
  const [solution, setSolution] = useState(false);
  // phones: show the task and preview first, the editor opens on request
  const [editorOpen, setEditorOpen] = useState(() => typeof window === 'undefined' || !window.matchMedia('(max-width: 639px)').matches);
  const passed = Boolean(progress.exercise[slug]);
  // pages and React apps get a live preview; scripts show their console output
  const visual = ex.kind === 'web' || ex.kind === 'react';
  const taskHtml = useMemo(() => marked.parse(ex.task, { async: false }) as string, [ex.task]);

  // keep the learner's code
  useEffect(() => {
    const id = window.setTimeout(() => update((p) => ({ ...p, code: { ...p.code, [slug]: code } })), 500);
    return () => window.clearTimeout(id);
  }, [code, slug, update]);

  // web exercises show the starting page straight away (without judging it)
  useEffect(() => {
    if (visual) setRun({ nonce: 'preview', doc: buildDoc(ex, code, 'preview', -1), tests: [] });
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // results come back from the sandbox: the preview frame brings console output and errors,
  // each test frame brings its one result
  useEffect(() => {
    if (!run || run.nonce === 'preview') return;
    const got: Array<TestResult | null> = run.tests.map(() => null);
    let base: { logs: string[]; error: string | null } | null = null;
    const timer = window.setTimeout(() => {
      setTimedOut(true);
      setRun(null);
    }, TIMEOUT);
    const finish = () => {
      if (!base || got.some((g) => g === null)) return;
      window.clearTimeout(timer);
      const results = got as TestResult[];
      setResult({ results, logs: base.logs, error: base.error });
      if (results.length && results.every((x) => x.pass)) update((p) => ({ ...p, exercise: { ...p.exercise, [slug]: true } }));
    };
    const onMessage = (e: MessageEvent) => {
      const tag = e.data?.course;
      if (typeof tag !== 'string' || !tag.startsWith(run.nonce)) return;
      const r = e.data as RunResult;
      if (tag === run.nonce) base = { logs: r.logs ?? [], error: r.error ?? null };
      else {
        const i = Number(tag.slice(run.nonce.length + 1));
        got[i] = r.results[0] ?? { name: ex.tests[i]?.name ?? '', pass: false, error: r.error ?? undefined };
      }
      finish();
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
    };
  }, [run, slug, update, ex.tests]);

  const runTests = () => {
    const nonce = Math.random().toString(36).slice(2);
    setTimedOut(false);
    setResult(null);
    setRun({ nonce, doc: buildDoc(ex, code, nonce, -1), tests: ex.tests.map((_, i) => buildDoc(ex, code, `${nonce}:${i}`, i)) });
  };

  const all = result && result.results.length > 0 && result.results.every((r) => r.pass);
  const solutionHtml = useMemo(() => marked.parse('```\n' + ex.solution + '\n```', { async: false }) as string, [ex.solution]);

  return (
    <section className="relative mt-16 border border-line bg-surface" aria-labelledby={`ex-${slug}`}>
      <CornerMarks />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <span className="label-a">// {t.exercise}</span>
        {(passed || all) && (
          <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-tech text-accent">
            <span className="grid h-4 w-4 place-items-center bg-accent text-[9px] text-onaccent">✓</span>
            {t.done}
          </span>
        )}
      </div>

      <div className="px-5 pb-6 pt-5 sm:px-6">
        <h2 id={`ex-${slug}`} className="display text-2xl leading-none sm:text-3xl">
          {ex.title}
        </h2>
        <div className="prose-article mt-4 !text-base" dangerouslySetInnerHTML={{ __html: taskHtml }} />

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {editorOpen ? (
            <CodeEditor value={code} onChange={setCode} onRun={runTests} label={t.editorLabel} />
          ) : (
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              className="order-last flex items-center justify-center gap-3 border border-dashed border-line-strong bg-bg px-4 py-5 font-mono text-[12.5px] uppercase tracking-tech text-text"
            >
              {'</>'} {t.editorShow}
            </button>
          )}

          <div className={cx('flex min-h-[260px] flex-col border border-line bg-bg', !editorOpen && 'order-first')}>
            <div className="label border-b border-line px-3 py-2">{visual ? t.preview : t.output}</div>
            {visual ? (
              run ? (
                <iframe
                  key={run.nonce}
                  title={t.preview}
                  sandbox={SANDBOX}
                  srcDoc={run.doc}
                  className="min-h-[260px] w-full flex-1 bg-white"
                />
              ) : (
                <div className="flex-1" />
              )
            ) : (
              <>
                {run && <iframe key={run.nonce} title="runner" sandbox={SANDBOX} srcDoc={run.doc} className="hidden" />}
                <pre className="flex-1 overflow-auto whitespace-pre-wrap px-3 py-2 font-mono text-[12.5px] leading-relaxed text-muted">
                  {result ? (result.logs.length ? result.logs.join('\n') : t.noOutput) : ' '}
                  {result?.error && <span className="block text-red-500">{result.error}</span>}
                </pre>
              </>
            )}
          </div>
        </div>

        {run && run.tests.length > 0 && (
          <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0 h-[600px] w-[600px] overflow-hidden opacity-0">
            {run.tests.map((doc, i) => (
              <iframe key={`${run.nonce}:${i}`} title={`test ${i + 1}`} sandbox={SANDBOX} srcDoc={doc} className="h-[600px] w-[600px]" />
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={runTests}
            data-cursor="follow"
            className="inline-flex items-center gap-3 bg-accent px-5 py-3 font-mono text-[12.5px] uppercase tracking-tech text-onaccent transition-colors hover:bg-text"
          >
            ▶ {t.run}
            <span className="opacity-60">⌘↵</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t.confirmReset)) setCode(ex.starter);
            }}
            data-cursor="follow"
            className="border border-line-strong px-4 py-3 font-mono text-[12.5px] uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {t.reset}
          </button>
          {ex.hint && (
            <button
              type="button"
              onClick={() => setHint((h) => !h)}
              data-cursor="follow"
              className="border border-line px-4 py-3 font-mono text-[12.5px] uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {t.showHint}
            </button>
          )}
          <button
            type="button"
            onClick={() => setSolution((s) => !s)}
            data-cursor="follow"
            className="border border-line px-4 py-3 font-mono text-[12.5px] uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {solution ? t.hideSolution : t.showSolution}
          </button>
        </div>

        {hint && ex.hint && (
          <p className="mt-4 border-l-2 border-accent bg-bg px-4 py-3 text-sm leading-relaxed text-muted">{ex.hint}</p>
        )}

        {timedOut && <p className="mt-4 text-sm text-red-500">{t.timeout}</p>}

        {result && (
          <div className="mt-5">
            <div className="label mb-2">{t.tests}</div>
            <ul className="border-t border-line">
              {result.results.map((r) => (
                <li key={r.name} className="flex items-start gap-3 border-b border-line py-2.5 text-sm">
                  <span
                    aria-hidden
                    className={cx(
                      'mt-0.5 grid h-4 w-4 shrink-0 place-items-center text-[9px]',
                      r.pass ? 'bg-accent text-onaccent' : 'border border-red-500/70 text-red-500',
                    )}
                  >
                    {r.pass ? '✓' : '✕'}
                  </span>
                  <span className={r.pass ? 'text-text' : 'text-muted'}>
                    {r.name}
                    {r.error && <span className="mt-0.5 block font-mono text-[12px] text-red-500">{r.error}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className={cx('mt-3 text-sm font-semibold', all ? 'text-accent' : 'text-muted')}>{all ? t.allPassed : t.someFailed}</p>
          </div>
        )}

        {solution && (
          <div className="mt-5">
            <div className="prose-article !text-sm" dangerouslySetInnerHTML={{ __html: solutionHtml }} />
            <button
              type="button"
              onClick={() => {
                if (code === ex.solution || code === ex.starter || window.confirm(t.confirmSolution)) setCode(ex.solution);
              }}
              className="mt-2 font-mono text-2xs uppercase tracking-tech text-dim transition-colors hover:text-accent"
            >
              {t.useSolution} →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
