import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useGoToSection } from '../hooks/useGoToSection';
import { Arrow, Section, SectionHeader, cx } from '../components/ui';
import Preview, { PrintCopy } from '../components/cv/Preview';
import SectionEditor from '../components/cv/SectionEditor';
import Guide from '../components/cv/Guide';
import { scrollToId } from '../components/cv/scroll';
import { ContactStep, DesignStep, ExportStep, ProfileStep, StructureStep } from '../components/cv/Steps';
import { ActionBtn, IconBtn } from '../components/cv/form';
import { Icons } from '../components/cv/icons';
import { blankCv, move, normalize, templates } from '../components/cv/model';
import type { Cv, Section as CvSection } from '../components/cv/model';
import { exampleCv } from '../components/cv/examples';
import { cvText } from '../components/cv/text';
import { guides } from '../components/cv/guideContent';
import '../components/cv/cv.css';

const STORE = 'dm.cv.v1';
const EXAMPLE = 'dm.cv.example';

type Step = { key: string; label: string; section?: CvSection };

function load(lang: 'en' | 'hu'): { cv: Cv; example: boolean } {
  try {
    const raw = window.localStorage.getItem(STORE);
    const cv = raw ? normalize(JSON.parse(raw), lang) : null;
    if (cv) return { cv, example: window.localStorage.getItem(EXAMPLE) === '1' };
  } catch {
    /* storage blocked or corrupt: start fresh */
  }
  return { cv: exampleCv(lang), example: true };
}

export default function CvMaker() {
  const { lang } = useI18n();
  const { t: site } = useI18n();
  const t = cvText[lang];
  const g = guides[lang];
  const goTo = useGoToSection();

  useSeo({ title: site.seo.cvTitle, description: site.seo.cvDescription, path: '/cv-maker/' });

  const [{ cv, example }, setState] = useState(() => load(lang));
  const setCv = useCallback((fn: (cv: Cv) => Cv) => setState((s) => ({ cv: fn(s.cv), example: false })), []);
  const replace = (next: Cv, isExample: boolean) => setState({ cv: next, example: isExample });

  // autosave, lightly debounced
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORE, JSON.stringify(cv));
        window.localStorage.setItem(EXAMPLE, example ? '1' : '0');
      } catch {
        /* quota (a very large photo) or private mode: the session still works */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [cv, example]);

  const steps: Step[] = [
    { key: 'profile', label: t.steps.profile },
    { key: 'contact', label: t.steps.contact },
    { key: 'structure', label: t.steps.structure },
    ...cv.sections.map((s) => ({ key: s.id, label: s.title || t.kindNames[s.kind], section: s })),
    { key: 'design', label: t.steps.design },
    { key: 'export', label: t.steps.export },
  ];
  const [stepKey, setStepKey] = useState('profile');
  const index = Math.max(0, steps.findIndex((s) => s.key === stepKey));
  const step = steps[index] ?? steps[2];
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [pages, setPages] = useState(1);
  const editorTop = useRef<HTMLDivElement>(null);
  const chipRow = useRef<HTMLOListElement>(null);

  const go = (key: string) => {
    setStepKey(key);
    setView('edit');
    const top = editorTop.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) editorTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // keep the active step chip visible in the scrolling row
  useEffect(() => {
    chipRow.current?.querySelector<HTMLElement>('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [stepKey]);

  const print = () => window.print();
  const confirmReplace = () => example || window.confirm(t.confirmReset);
  const loadExample = () => {
    if (!confirmReplace()) return;
    replace(exampleCv(lang), true);
    setStepKey('profile');
  };
  const startBlank = () => {
    if (!confirmReplace()) return;
    replace(blankCv(lang), false);
    setStepKey('profile');
  };
  const importFile = async (f: File) => {
    try {
      const next = normalize(JSON.parse(await f.text()), lang);
      if (!next) return false;
      replace(next, false);
      return true;
    } catch {
      return false;
    }
  };

  const updateSection = (s: CvSection) => setCv((c) => ({ ...c, sections: c.sections.map((x) => (x.id === s.id ? s : x)) }));
  const sectionIndex = step.section ? cv.sections.findIndex((s) => s.id === step.section!.id) : -1;
  const tipKey = step.section ? step.section.kind : step.key;
  const stepText = step.section ? t.kindHints[step.section.kind] : t.stepText[step.key as keyof typeof t.stepText];

  let body: React.ReactNode;
  if (step.section) body = <SectionEditor key={step.section.id} section={step.section} t={t} onChange={updateSection} />;
  else if (step.key === 'profile') body = <ProfileStep cv={cv} t={t} setCv={setCv} />;
  else if (step.key === 'contact') body = <ContactStep cv={cv} t={t} setCv={setCv} />;
  else if (step.key === 'structure') body = <StructureStep cv={cv} t={t} setCv={setCv} onEdit={go} />;
  else if (step.key === 'design') body = <DesignStep cv={cv} t={t} setCv={setCv} />;
  else
    body = (
      <ExportStep cv={cv} t={t} pages={pages} onPrint={print} onImport={importFile} onExample={loadExample} onBlank={startBlank} />
    );

  const last = index === steps.length - 1;

  return (
    <>
      <Section id="cv-maker" className="pt-32 lg:pt-36">
        <SectionHeader
          index="10"
          title={t.title}
          subtitle={t.subtitle}
          right={
            <div className="flex items-center gap-4">
              <span className="label hidden items-center gap-2 sm:flex">
                <span className="h-1.5 w-1.5 bg-accent" aria-hidden />
                {t.saved}
              </span>
              <a
                href="#cv-guide"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId('cv-guide');
                }}
                data-cursor="follow"
                className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-tech text-text transition-colors hover:text-accent"
              >
                {t.guideLink} <span className="transition-transform group-hover:translate-y-0.5">↓</span>
              </a>
            </div>
          }
        />
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-[68ch] text-base leading-relaxed text-muted sm:text-lg">{t.intro}</p>
          <Link
            to="#interactive"
            onClick={goTo('interactive')}
            data-cursor="follow"
            className="label shrink-0 transition-colors hover:text-accent"
          >
            ← {t.back}
          </Link>
        </div>

        {example && (
          <div className="mb-6 flex flex-col gap-3 border border-accent/40 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              <span className="label-a mr-2">{t.tipLabel}</span>
              {t.exampleNote}
            </p>
            <ActionBtn onClick={startBlank} className="shrink-0">
              {t.blank}
            </ActionBtn>
          </div>
        )}

        {/* mobile: switch between the form and the preview */}
        <div className="sticky top-[57px] z-30 -mx-5 mb-6 grid grid-cols-2 border-y border-line bg-bg/90 backdrop-blur-md sm:-mx-8 lg:hidden">
          {(['edit', 'preview'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cx(
                'relative py-3 font-mono text-[11px] uppercase tracking-tech transition-colors',
                view === v ? 'text-text' : 'text-dim',
              )}
            >
              {t.tabs[v]}
              {v === 'preview' && <span className="ml-2 text-dim">{pages}p</span>}
              <span className={cx('absolute inset-x-0 bottom-0 h-px bg-accent transition-transform duration-300', view === v ? 'scale-x-100' : 'scale-x-0')} />
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {/* ---------- editor ---------- */}
          <div ref={editorTop} className={cx('scroll-mt-28 lg:col-span-6 xl:col-span-5', view === 'preview' && 'hidden lg:block')}>
            <ol ref={chipRow} className="no-scrollbar -mx-1 mb-8 flex gap-1.5 overflow-x-auto px-1 pb-2" aria-label={t.step}>
              {steps.map((s, i) => {
                const on = i === index;
                return (
                  <li key={s.key} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => go(s.key)}
                      aria-current={on ? 'step' : undefined}
                      data-cursor="follow"
                      className={cx(
                        'flex items-center gap-2 border px-2.5 py-1.5 font-mono text-2xs uppercase tracking-tech transition-colors',
                        on ? 'border-accent text-accent' : i < index ? 'border-line-strong text-muted hover:text-text' : 'border-line text-dim hover:border-line-strong hover:text-text',
                      )}
                    >
                      <span className={on ? 'text-accent' : 'text-dim'}>{String(i + 1).padStart(2, '0')}</span>
                      <span className="max-w-[11rem] truncate">{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div key={step.key} style={{ animation: 'fadeUp .45s cubic-bezier(.16,1,.3,1) both' }}>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="label mb-2">
                    {t.step} <span className="text-accent">{String(index + 1).padStart(2, '0')}</span> {t.of} {String(steps.length).padStart(2, '0')}
                  </div>
                  <h2 className="display text-[2rem] leading-none sm:text-[2.4rem]">{step.label}</h2>
                  {stepText && <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-muted">{stepText}</p>}
                </div>
                {step.section && (
                  <div className="flex shrink-0 gap-1">
                    <IconBtn label={t.moveUp} disabled={sectionIndex <= 0} onClick={() => setCv((c) => ({ ...c, sections: move(c.sections, sectionIndex, -1) }))}>
                      {Icons.up}
                    </IconBtn>
                    <IconBtn
                      label={t.moveDown}
                      disabled={sectionIndex === cv.sections.length - 1}
                      onClick={() => setCv((c) => ({ ...c, sections: move(c.sections, sectionIndex, 1) }))}
                    >
                      {Icons.down}
                    </IconBtn>
                    <IconBtn
                      label={t.hide}
                      danger
                      onClick={() => {
                        if (!window.confirm(`${t.hide}: ${step.label}?`)) return;
                        setCv((c) => ({ ...c, sections: c.sections.filter((x) => x.id !== step.section!.id) }));
                        setStepKey('structure');
                      }}
                    >
                      {Icons.remove}
                    </IconBtn>
                  </div>
                )}
              </div>

              {t.tips[tipKey] && (
                <aside className="mb-8 border-l-2 border-accent bg-surface px-4 py-3">
                  <p className="text-[13px] leading-relaxed text-muted">
                    <span className="label-a mr-2">{t.tipLabel}</span>
                    {t.tips[tipKey]}
                  </p>
                  <a
                    href={`#guide-${t.tipTarget[tipKey]}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId(`guide-${t.tipTarget[tipKey]}`);
                    }}
                    className="mt-1.5 inline-block font-mono text-2xs uppercase tracking-tech text-dim transition-colors hover:text-accent"
                  >
                    {t.readMore} ↓
                  </a>
                </aside>
              )}

              {body}
            </div>

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
              <ActionBtn onClick={() => go(steps[index - 1].key)} className={cx(index === 0 && 'invisible')}>
                ← {t.prev}
              </ActionBtn>
              {last ? (
                <ActionBtn solid onClick={print}>
                  {t.pdf}
                </ActionBtn>
              ) : (
                <ActionBtn solid onClick={() => go(steps[index + 1].key)}>
                  {t.next}: {steps[index + 1].label}
                  <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </ActionBtn>
              )}
            </div>
          </div>

          {/* ---------- live preview ---------- */}
          <div className={cx('lg:col-span-6 xl:col-span-7', view === 'edit' && 'hidden lg:block')}>
            <div className="lg:sticky lg:top-24">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t.template}>
                  {templates.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={cv.design.template === id}
                      onClick={() => setCv((c) => ({ ...c, design: { ...c.design, template: id } }))}
                      data-cursor="follow"
                      className={cx(
                        'border px-2.5 py-1 font-mono text-2xs uppercase tracking-tech transition-colors',
                        cv.design.template === id ? 'border-accent text-accent' : 'border-line text-dim hover:border-line-strong hover:text-text',
                      )}
                    >
                      {t.templates[id].name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={print}
                  data-cursor="follow"
                  className="flex items-center gap-2 bg-accent px-3 py-1.5 font-mono text-2xs uppercase tracking-tech text-onaccent transition-colors hover:bg-text"
                >
                  {t.pdf}
                  <span className="opacity-70">· {pages}p</span>
                </button>
              </div>
              <div className="tech-grid border border-line bg-surface2 p-3 sm:p-6 lg:max-h-[calc(100vh-9.5rem)] lg:overflow-y-auto">
                <Preview cv={cv} onPages={setPages} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Guide g={g} index="11" onStart={() => scrollToId('cv-maker')} />
      <PrintCopy cv={cv} />
    </>
  );
}
