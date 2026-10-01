import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useGoToSection } from '../hooks/useGoToSection';
import { areaLabel, loadQuestions, tracks } from '../data/interview';
import { clip } from '../hooks/useSeo';
import type { Level, Question } from '../data/interview';
import { Arrow, CornerMarks, Section, SectionHeader, cx } from '../components/ui';

const LEVELS: Level[] = ['junior', 'medior', 'senior'];
const QUICK = 20;

interface Round {
  ids: number[];
  /** display order of each question's options (authored indexes) */
  order: Record<number, number[]>;
  /** chosen authored option index per question id */
  answers: Record<number, number>;
  pos: number;
  done: boolean;
}

/** inline `code` inside question, option and explanation text */
function Rich({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <code key={i} className="border border-line bg-surface2 px-1 py-px font-mono text-[0.88em] text-text">
            {p}
          </code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** an answer option: a line of text, or a whole listing when it spans lines */
function Option({ text }: { text: string }) {
  if (text.includes('\n')) return <pre className="code-block !p-3 text-left !text-[0.8rem]">{text}</pre>;
  return <Rich text={text} />;
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newRound(qs: Question[], ids: number[]): Round {
  const byId = new Map(qs.map((q) => [q.id, q]));
  const order: Record<number, number[]> = {};
  for (const id of ids) order[id] = byId.get(id)?.fixed ? [0, 1, 2, 3] : shuffle([0, 1, 2, 3]);
  return { ids, order, answers: {}, pos: 0, done: false };
}

const storeKey = (track: string) => `dm.interview.${track}`;
function readRound(track: string): Round | null {
  try {
    const raw = window.localStorage.getItem(storeKey(track));
    return raw ? (JSON.parse(raw) as Round) : null;
  } catch {
    return null;
  }
}
function writeRound(track: string, round: Round | null) {
  try {
    if (round) window.localStorage.setItem(storeKey(track), JSON.stringify(round));
    else window.localStorage.removeItem(storeKey(track));
  } catch {
    /* private mode: progress just isn't kept */
  }
}

const pct = (ok: number, all: number) => (all ? Math.round((ok / all) * 100) : 0);

function Bar({ label, ok, all }: { label: ReactNode; ok: number; all: number }) {
  const p = pct(ok, all);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 font-mono text-2xs uppercase tracking-tech">
        <span className="text-muted">{label}</span>
        <span className="text-text">
          {ok}/{all} · {p}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 bg-surface2">
        <div className="h-full bg-accent transition-[width] duration-700 ease-tech" style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

export default function InterviewTrack() {
  const { id = 'javascript' } = useParams();
  const track = tracks.find((x) => x.id === id) ?? tracks[0];
  const { t, lang, lp } = useI18n();
  const ti = t.interview;
  const goTo = useGoToSection();
  const [qs, setQs] = useState<Question[] | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [saved, setSaved] = useState<Round | null>(() => readRound(track.id));
  const [topic, setTopic] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useSeo({
    title: t.seo.interviewTrackTitle.replace('{name}', track.title[lang]),
    description: clip(t.seo.interviewTrackDescription.replace('{name}', track.title[lang]).replace('{text}', track.text[lang])),
    path: `/interview/${track.id}/`,
  });

  useEffect(() => {
    let live = true;
    void loadQuestions(track.id, lang).then((list) => live && setQs(list));
    return () => {
      live = false;
    };
  }, [track.id, lang]);

  const byId = useMemo(() => new Map((qs ?? []).map((q) => [q.id, q])), [qs]);
  const topics = useMemo(() => {
    const count = new Map<string, number>();
    for (const q of qs ?? []) count.set(q.area, (count.get(q.area) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => areaLabel(a[0], lang).localeCompare(areaLabel(b[0], lang), lang));
  }, [qs, lang]);

  const update = useCallback(
    (r: Round | null) => {
      setRound(r);
      writeRound(track.id, r && !r.done ? r : null);
      setSaved(r && !r.done ? r : null);
    },
    [track.id],
  );

  const start = (ids: number[]) => {
    if (!qs || !ids.length) return;
    update(newRound(qs, ids));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const current = round && !round.done ? byId.get(round.ids[round.pos]) : undefined;
  const chosen = current && round ? round.answers[current.id] : undefined;
  const answered = chosen !== undefined;

  const choose = useCallback(
    (authored: number) => {
      if (!round || !current || round.answers[current.id] !== undefined) return;
      update({ ...round, answers: { ...round.answers, [current.id]: authored } });
    },
    [round, current, update],
  );

  const next = useCallback(() => {
    if (!round) return;
    const last = round.pos >= round.ids.length - 1;
    update(last ? { ...round, done: true } : { ...round, pos: round.pos + 1 });
    requestAnimationFrame(() => {
      const top = cardRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 80 || last) window.scrollTo({ top: last ? 0 : window.scrollY + top - 110, behavior: 'smooth' });
    });
  }, [round, update]);

  useEffect(() => {
    if (!current || !round) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const n = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
      if (n >= 0 && e.key.length === 1 && !answered) {
        e.preventDefault();
        choose(round.order[current.id][n]);
      } else if (e.key === 'Enter' && answered) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, round, answered, choose, next]);

  const correctCount = round ? round.ids.filter((qid) => round.answers[qid] === byId.get(qid)?.answer).length : 0;
  const answeredCount = round ? Object.keys(round.answers).length : 0;

  const header = (
    <SectionHeader
      index={ti.index}
      title={`${track.title[lang]} ${ti.challenge}`}
      subtitle={ti.subtitle}
      right={
        <Link to={lp('/interview/')} data-cursor="follow" className="label transition-colors hover:text-accent">
          ← {ti.back}
        </Link>
      }
    />
  );

  if (!qs) {
    return (
      <Section id="interview" className="min-h-[70vh] pt-32 lg:pt-36">
        {header}
        <p className="font-mono text-2xs uppercase tracking-tech text-dim">
          $ load ./{track.id}.json <span className="animate-blink">_</span>
        </p>
      </Section>
    );
  }

  /* ---------- results ---------- */
  if (round?.done) {
    const asked = round.ids.map((qid) => byId.get(qid)).filter((q): q is Question => !!q);
    const ok = (q: Question) => round.answers[q.id] === q.answer;
    const p = pct(correctCount, asked.length);
    const senior = asked.filter((q) => q.level === 'senior');
    let v = p < 50 ? 0 : p < 70 ? 1 : p < 85 ? 2 : 3;
    // "senior-level" only means something if senior questions were in the round and went well
    if (v === 3 && (senior.length < 5 || pct(senior.filter(ok).length, senior.length) < 80)) v = 2;
    const verdict = [ti.verdict0, ti.verdict1, ti.verdict2, ti.verdict3][v];
    const verdictText = [ti.verdict0Text, ti.verdict1Text, ti.verdict2Text, ti.verdict3Text][v];
    const topicStats = [...new Set(asked.map((q) => q.area))]
      .map((area) => {
        const list = asked.filter((q) => q.area === area);
        return { name: areaLabel(area, lang), all: list.length, ok: list.filter(ok).length };
      })
      .sort((a, b) => a.ok / a.all - b.ok / b.all || b.all - a.all);
    // only areas with a miss are worth revising
    const weak = topicStats.filter((s) => s.ok < s.all);
    const missed = asked.filter((q) => !ok(q));

    return (
      <Section id="interview" className="min-h-[70vh] pt-32 lg:pt-36">
        {header}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative border border-line bg-surface p-6 sm:p-10">
            <CornerMarks />
            <p className="label">// {ti.resultsTitle}</p>
            <div className="mt-6 flex items-end gap-4">
              <span className="display text-[4.5rem] leading-none text-accent sm:text-[6rem]">{p}%</span>
              <span className="mb-3 font-mono text-2xs uppercase tracking-tech text-dim">
                {correctCount}/{asked.length} {ti.correct}
              </span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-extrabold uppercase tracking-tight">{verdict}</h2>
            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-muted sm:text-base">{verdictText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {missed.length > 0 && (
                <button
                  type="button"
                  onClick={() => start(missed.map((q) => q.id))}
                  data-cursor="follow"
                  className="group inline-flex items-center gap-3 bg-accent px-5 py-3 font-mono text-[11px] uppercase tracking-tech text-onaccent transition-colors hover:bg-text"
                >
                  {ti.retryMissed} ({missed.length})
                  <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              )}
              <button
                type="button"
                onClick={() => update(null)}
                data-cursor="follow"
                className="inline-flex items-center gap-3 border border-line-strong px-5 py-3 font-mono text-[11px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent"
              >
                {ti.again}
              </button>
            </div>
          </div>

          <div className="border border-line bg-surface p-6 sm:p-8">
            <p className="label">// {ti.byLevel}</p>
            <div className="mt-5 space-y-4">
              {LEVELS.map((l) => {
                const list = asked.filter((q) => q.level === l);
                return list.length ? <Bar key={l} label={ti[l]} ok={list.filter(ok).length} all={list.length} /> : null;
              })}
            </div>
            <p className="label mt-10">// {ti.weakest}</p>
            <div className="mt-5 space-y-4">
              {weak.length === 0 && <p className="text-sm text-muted">{ti.noMissed}</p>}
              {weak.slice(0, 6).map((s) => (
                <Bar key={s.name} label={s.name} ok={s.ok} all={s.all} />
              ))}
            </div>
          </div>
        </div>

        {topicStats.length > 1 && (
          <details className="mt-5 border border-line bg-surface p-6 sm:p-8">
            <summary className="label cursor-pointer">// {ti.byTopic} ({topicStats.length})</summary>
            <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
              {[...topicStats].sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
                <Bar key={s.name} label={s.name} ok={s.ok} all={s.all} />
              ))}
            </div>
          </details>
        )}

        <div className="mt-12">
          <p className="label mb-5">
            // {ti.missed} ({missed.length})
          </p>
          {missed.length === 0 ? (
            <p className="text-muted">{ti.noMissed}</p>
          ) : (
            <ol className="space-y-3">
              {missed.map((q) => (
                <li key={q.id}>
                  <details className="group border border-line bg-surface open:border-line-strong">
                    <summary className="flex cursor-pointer items-baseline gap-4 p-5">
                      <span className="font-mono text-2xs tracking-tech text-accent">Q{String(q.id).padStart(3, '0')}</span>
                      <span className="flex-1 text-sm leading-relaxed">
                        <Rich text={q.question} />
                      </span>
                      <span className="font-mono text-2xs uppercase tracking-tech text-dim">{q.topic}</span>
                    </summary>
                    <div className="border-t border-line p-5 text-sm leading-relaxed">
                      {q.code && <pre className="code-block mb-4">{q.code}</pre>}
                      <p className="text-muted">
                        <span className="label mr-2">{ti.rightAnswer}:</span>
                        <Option text={q.options[q.answer]} />
                      </p>
                      <p className="mt-3 whitespace-pre-line text-muted">
                        <Rich text={q.explanation} />
                      </p>
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside className="mt-16 border border-line bg-surface p-6 sm:p-8">
          <div className="font-display text-2xl font-extrabold uppercase tracking-tight">{ti.ctaTitle}</div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{ti.ctaText}</p>
          <a
            href="#contact"
            onClick={goTo('contact')}
            data-cursor="follow"
            className="group mt-6 inline-flex items-center gap-3 bg-accent px-5 py-3 font-mono text-[11px] uppercase tracking-tech text-onaccent transition-colors hover:bg-text"
          >
            {ti.ctaButton}
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </aside>
      </Section>
    );
  }

  /* ---------- a question ---------- */
  if (round && current) {
    const order = round.order[current.id] ?? [0, 1, 2, 3];
    const right = chosen === current.answer;
    const last = round.pos >= round.ids.length - 1;
    return (
      <Section id="interview" className="min-h-[70vh] pt-32 lg:pt-36">
        {header}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-mono text-2xs uppercase tracking-tech">
          <span className="text-muted">
            {ti.question} <span className="text-text">{round.pos + 1}</span> {ti.of} {round.ids.length}
          </span>
          <span className="text-muted">
            {ti.score}: <span className="text-accent">{correctCount}</span>/{answeredCount}
          </span>
        </div>
        <div className="mb-8 h-1 bg-surface2">
          <div
            className="h-full bg-accent transition-[width] duration-500 ease-tech"
            style={{ width: `${((round.pos + (answered ? 1 : 0)) / round.ids.length) * 100}%` }}
          />
        </div>

        <div ref={cardRef} className="relative mx-auto max-w-[900px] border border-line bg-surface p-5 sm:p-10">
          <CornerMarks />
          <div className="flex flex-wrap gap-2 font-mono text-2xs uppercase tracking-tech">
            <span className="text-accent">Q{String(current.id).padStart(3, '0')}</span>
            <span className="border border-line px-2 py-0.5 text-text">{ti[current.level]}</span>
            <span className="border border-line px-2 py-0.5 text-dim">{current.topic}</span>
          </div>
          <h2 className="mt-6 text-lg font-medium leading-relaxed sm:text-xl">
            <Rich text={current.question} />
          </h2>
          {current.code && <pre className="code-block mt-6">{current.code}</pre>}

          <ul className="mt-8 grid gap-3" role="list">
            {order.map((authored, n) => {
              const isAnswer = authored === current.answer;
              const isChosen = authored === chosen;
              return (
                <li key={authored}>
                  <button
                    type="button"
                    disabled={answered}
                    onClick={() => choose(authored)}
                    data-cursor="follow"
                    aria-pressed={isChosen}
                    className={cx(
                      'flex w-full items-start gap-4 border px-4 py-3.5 text-left text-sm leading-relaxed transition-colors duration-200 sm:text-base',
                      !answered && 'border-line hover:border-accent hover:bg-surface2',
                      answered && isAnswer && 'border-accent bg-accent/10',
                      answered && isChosen && !isAnswer && 'border-line-strong bg-surface2 line-through decoration-dim',
                      answered && !isAnswer && !isChosen && 'border-line opacity-55',
                    )}
                  >
                    <span
                      className={cx(
                        'grid h-6 w-6 shrink-0 place-items-center border font-mono text-2xs',
                        answered && isAnswer ? 'border-accent bg-accent text-onaccent' : 'border-line-strong text-dim',
                      )}
                    >
                      {'ABCD'[n]}
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5">
                      <Option text={current.options[authored]} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {answered && (
            <div className="mt-8 border-t border-line pt-6" aria-live="polite">
              <p className={cx('font-mono text-2xs uppercase tracking-tech', right ? 'text-accent' : 'text-text')}>
                {right ? `● ${ti.correct}` : `○ ${ti.wrong} — ${ti.rightAnswer}: ${'ABCD'[order.indexOf(current.answer)]}`}
              </p>
              <p className="label mt-5">// {ti.explanation}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted sm:text-base">
                <Rich text={current.explanation} />
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => update({ ...round, done: true, ids: round.ids.slice(0, round.pos + (answered ? 1 : 0)) })}
              className="font-mono text-2xs uppercase tracking-tech text-dim transition-colors hover:text-accent"
            >
              {ti.quit}
            </button>
            <span className="hidden font-mono text-2xs uppercase tracking-tech text-dim md:inline">{ti.keys}</span>
            <button
              type="button"
              onClick={next}
              disabled={!answered}
              data-cursor="follow"
              className="group inline-flex items-center gap-3 bg-accent px-5 py-3 font-mono text-[11px] uppercase tracking-tech text-onaccent transition-colors enabled:hover:bg-text disabled:opacity-30"
            >
              {last ? ti.finish : ti.next}
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </Section>
    );
  }

  /* ---------- setup ---------- */
  const all = qs.map((q) => q.id);
  const card =
    'group relative flex flex-col border border-line bg-surface p-6 text-left transition-colors duration-300 hover:border-accent';
  return (
    <Section id="interview" className="min-h-[70vh] pt-32 lg:pt-36">
      {header}
      <p className="mb-10 max-w-[68ch] text-base leading-relaxed text-muted sm:text-lg">{track.text[lang]}</p>

      {saved && !saved.done && (
        <div className="mb-8 flex flex-col gap-4 border border-accent bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-2xs uppercase tracking-tech text-text">
            <span className="text-accent">● </span>
            {ti.resume} — {Object.keys(saved.answers).length}/{saved.ids.length} {ti.resumeText}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRound(saved)}
              data-cursor="follow"
              className="group inline-flex items-center gap-3 bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-tech text-onaccent hover:bg-text"
            >
              {ti.start} <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => update(null)}
              className="border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-tech text-muted hover:text-accent"
            >
              {ti.discard}
            </button>
          </div>
        </div>
      )}

      <p className="label mb-5">// {ti.setupTitle}</p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <button type="button" className={card} data-cursor="follow" onClick={() => start(all)}>
          <CornerMarks />
          <span className="font-mono text-2xs uppercase tracking-tech text-accent">
            {qs.length} {ti.questions}
          </span>
          <span className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight group-hover:text-accent">
            {ti.modeFull}
          </span>
          <span className="mt-2 text-sm text-muted">{ti.modeFullText}</span>
        </button>
        <button
          type="button"
          className={card}
          data-cursor="follow"
          onClick={() => {
            // a spread over the levels, then served easiest first
            const pick = shuffle(all).slice(0, QUICK);
            start(pick.sort((a, b) => a - b));
          }}
        >
          <span className="font-mono text-2xs uppercase tracking-tech text-accent">
            {Math.min(QUICK, qs.length)} {ti.questions}
          </span>
          <span className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight group-hover:text-accent">
            {ti.modeQuick}
          </span>
          <span className="mt-2 text-sm text-muted">{ti.modeQuickText}</span>
        </button>

        <div className="border border-line bg-surface p-6">
          <span className="font-display text-2xl font-extrabold uppercase tracking-tight">{ti.modeLevel}</span>
          <p className="mt-2 text-sm text-muted">{ti.modeLevelText}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {LEVELS.map((l) => {
              const ids = qs.filter((q) => q.level === l).map((q) => q.id);
              return (
                <button
                  key={l}
                  type="button"
                  disabled={!ids.length}
                  onClick={() => start(ids)}
                  data-cursor="follow"
                  className="border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
                >
                  {ti[l]} <span className="text-dim">· {ids.length}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-line bg-surface p-6">
          <span className="font-display text-2xl font-extrabold uppercase tracking-tight">{ti.modeTopic}</span>
          <p className="mt-2 text-sm text-muted">{ti.modeTopicText}</p>
          <div className="mt-5 flex gap-2">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              aria-label={ti.modeTopic}
              className="min-w-0 flex-1 border border-line-strong bg-bg px-3 py-2 font-mono text-[11px] uppercase tracking-tech text-text"
            >
              <option value="">{ti.allTopics}</option>
              {topics.map(([name, n]) => (
                <option key={name} value={name}>
                  {areaLabel(name, lang)} ({n})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!topic}
              onClick={() => start(qs.filter((q) => q.area === topic).map((q) => q.id))}
              className="group inline-flex items-center gap-3 bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-tech text-onaccent transition-colors enabled:hover:bg-text disabled:opacity-30"
            >
              {ti.start} <Arrow />
            </button>
          </div>
        </div>
      </div>
      <p className="mt-8 font-mono text-2xs uppercase tracking-tech text-dim">{ti.note}</p>
    </Section>
  );
}
