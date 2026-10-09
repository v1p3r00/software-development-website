import { memo, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import CvSheet from './CvSheet';
import { templateDefs, templateOf } from './templates';
import type { TemplateGroup } from './templates';
import { cx } from '../ui';
import { SupportShare } from '../ShareButtons';
import { site } from '../../data/site';
import { ActionBtn, Check, Field, IconBtn, Segmented } from './form';
import { Icons } from './icons';
import { accents, allKinds, move, newSection, readPhoto, uid, withTemplate } from './model';
import type { Cv, Design, Personal, Section, SectionKind, TemplateId } from './model';
import type { CvText } from './text';

type Props = { cv: Cv; t: CvText; setCv: (fn: (cv: Cv) => Cv) => void };

const setPersonal = (setCv: Props['setCv'], patch: Partial<Personal>) =>
  setCv((cv) => ({ ...cv, personal: { ...cv.personal, ...patch } }));
const setDesign = (setCv: Props['setCv'], patch: Partial<Design>) =>
  setCv((cv) => ({ ...cv, design: { ...cv.design, ...patch } }));

export function ProfileStep({ cv, t, setCv }: Props) {
  const p = cv.personal;
  const file = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);
  const pick = async (f: File | undefined) => {
    if (!f) return;
    try {
      setError(false);
      setPersonal(setCv, { photo: await readPhoto(f) });
      setDesign(setCv, { showPhoto: true });
    } catch {
      setError(true);
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <Field label={t.name} value={p.name} placeholder={t.namePh} autoComplete="name" onChange={(v) => setPersonal(setCv, { name: v })} />
      <Field label={t.headline} value={p.headline} placeholder={t.headlinePh} autoComplete="organization-title" onChange={(v) => setPersonal(setCv, { headline: v })} />
      <div className="flex flex-col gap-2">
        <span className="label">{t.photo}</span>
        <div className="flex items-center gap-4">
          <div className="grid h-[100px] w-20 shrink-0 place-items-center overflow-hidden border border-line bg-surface">
            {p.photo ? (
              <img src={p.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <svg viewBox="0 0 40 50" className="h-10 w-8 text-line-strong" fill="none" aria-hidden>
                <circle cx="20" cy="18" r="8" stroke="currentColor" />
                <path d="M5 47c2-9 8-14 15-14s13 5 15 14" stroke="currentColor" />
              </svg>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionBtn onClick={() => file.current?.click()}>{p.photo ? t.photoChange : t.photoUpload}</ActionBtn>
            {p.photo && <ActionBtn onClick={() => setPersonal(setCv, { photo: '' })}>{t.photoRemove}</ActionBtn>}
          </div>
          <input
            ref={file}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void pick(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        {error && <p className="text-[12px] text-red-500">{t.photoError}</p>}
        <p className="text-[12px] leading-snug text-dim">{t.photoHint}</p>
      </div>
    </div>
  );
}

export function ContactStep({ cv, t, setCv }: Props) {
  const p = cv.personal;
  const setLinks = (links: Personal['links']) => setPersonal(setCv, { links });
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.email} type="email" value={p.email} placeholder={t.emailPh} autoComplete="email" onChange={(v) => setPersonal(setCv, { email: v })} />
        <Field label={t.phone} type="tel" value={p.phone} placeholder={t.phonePh} autoComplete="tel" onChange={(v) => setPersonal(setCv, { phone: v })} />
        <Field className="sm:col-span-2" label={t.location} value={p.location} placeholder={t.locationPh} onChange={(v) => setPersonal(setCv, { location: v })} />
      </div>
      <div className="flex flex-col gap-3">
        <span className="label">{t.links}</span>
        <p className="-mt-1 text-[12px] leading-snug text-dim">{t.linksHint}</p>
        {p.links.map((l, i) => (
          <div key={l.id} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[9rem_1fr_auto]">
            <input
              aria-label={t.linkLabel}
              value={l.label}
              placeholder={t.linkLabelPh}
              onChange={(e) => setLinks(p.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              className="col-span-2 w-full border border-line bg-bg px-3 py-2.5 text-sm text-text placeholder:text-dim/70 focus:border-accent focus:outline-none sm:col-span-1"
            />
            <input
              aria-label={t.linkUrl}
              value={l.url}
              placeholder={t.linkUrlPh}
              inputMode="url"
              onChange={(e) => setLinks(p.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
              className="w-full border border-line bg-bg px-3 py-2.5 text-sm text-text placeholder:text-dim/70 focus:border-accent focus:outline-none"
            />
            <div className="flex items-center gap-1">
              <IconBtn label={t.moveUp} disabled={i === 0} onClick={() => setLinks(move(p.links, i, -1))}>
                {Icons.up}
              </IconBtn>
              <IconBtn label={t.remove} danger onClick={() => setLinks(p.links.filter((_, j) => j !== i))}>
                {Icons.remove}
              </IconBtn>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLinks([...p.links, { id: uid(), label: '', url: '' }])}
          data-cursor="follow"
          className="flex items-center justify-center gap-2 border border-dashed border-line-strong py-3 font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {Icons.plus} {t.addLink}
        </button>
      </div>
    </div>
  );
}

export function StructureStep({ cv, t, setCv, onEdit }: Props & { onEdit: (id: string) => void }) {
  const setSections = (fn: (s: Section[]) => Section[]) => setCv((c) => ({ ...c, sections: fn(c.sections) }));
  const present = new Set(cv.sections.map((s) => s.kind));
  const addable = allKinds.filter((k) => k === 'custom' || !present.has(k));
  const add = (kind: SectionKind) => {
    const s = newSection(kind);
    setSections((list) => [...list, s]);
    onEdit(s.id);
  };
  const remove = (s: Section) => {
    const filled = s.text.trim() || s.items.some((it) => it.title.trim() || it.description.trim());
    if (filled && !window.confirm(`${t.hide}: ${s.title || t.kindNames[s.kind]}?`)) return;
    setSections((list) => list.filter((x) => x.id !== s.id));
  };

  return (
    <div className="flex flex-col gap-8">
      <ol className="border-t border-line">
        {cv.sections.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 border-b border-line py-2.5">
            <span className="w-7 font-mono text-2xs tracking-tech text-accent">{String(i + 1).padStart(2, '0')}</span>
            <button type="button" onClick={() => onEdit(s.id)} className="group min-w-0 flex-1 text-left" data-cursor="follow">
              <span className="block truncate text-sm font-semibold text-text group-hover:text-accent">{s.title || t.kindNames[s.kind]}</span>
              <span className="block truncate font-mono text-2xs uppercase tracking-tech text-dim">
                {s.kind === 'summary' ? t.kindHints.summary : `${s.items.filter((it) => it.title.trim()).length} × ${t.entry}`}
              </span>
            </button>
            <IconBtn label={t.edit} onClick={() => onEdit(s.id)}>
              {Icons.edit}
            </IconBtn>
            <IconBtn label={t.moveUp} disabled={i === 0} onClick={() => setSections((l) => move(l, i, -1))}>
              {Icons.up}
            </IconBtn>
            <IconBtn label={t.moveDown} disabled={i === cv.sections.length - 1} onClick={() => setSections((l) => move(l, i, 1))}>
              {Icons.down}
            </IconBtn>
            <IconBtn label={t.hide} danger onClick={() => remove(s)}>
              {Icons.remove}
            </IconBtn>
          </li>
        ))}
      </ol>

      <div>
        <div className="label-a mb-3">// {t.addSection}</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {addable.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => add(k)}
              data-cursor="follow"
              className="group flex items-start gap-3 border border-line p-3 text-left transition-colors hover:border-accent"
            >
              <span className="mt-0.5 text-dim group-hover:text-accent">{Icons.plus}</span>
              <span>
                <span className="block text-sm font-semibold text-text group-hover:text-accent">{t.kindNames[k]}</span>
                <span className="block text-[12px] leading-snug text-dim">{t.kindHints[k]}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** the user's own CV in a given layout, shrunk to a thumbnail (first page only) */
const ThumbSheet = memo(function ThumbSheet({ cv, id }: { cv: Cv; id: TemplateId }) {
  const def = templateOf(id);
  const shown = { ...cv, design: { ...cv.design, template: id, accent: def.accent ?? cv.design.accent } };
  return (
    <span className="relative block aspect-[210/297] w-full overflow-hidden bg-white shadow-sm" aria-hidden>
      <span className="pointer-events-none absolute left-0 top-0 block origin-top-left" style={{ width: '210mm', transform: 'scale(var(--thumb-scale))' }}>
        <CvSheet cv={shown} />
      </span>
    </span>
  );
});

export function DesignStep({ cv, t, setCv }: Props) {
  const d = cv.design;
  const { lang } = useI18n();
  const [group, setGroup] = useState<'all' | 'ats' | TemplateGroup>('all');
  const grid = useRef<HTMLDivElement>(null);
  const [thumbScale, setThumbScale] = useState(0.2);
  useLayoutEffect(() => {
    const el = grid.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const cell = el.querySelector<HTMLElement>('[data-thumb]');
      if (cell) setThumbScale(cell.clientWidth / ((210 * 96) / 25.4));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const list = templateDefs.filter((tp) => group === 'all' || (group === 'ats' ? tp.ats : tp.group === group));
  const filters: Array<{ value: typeof group; label: string }> = [
    { value: 'all', label: `${t.layoutsAll} · ${templateDefs.length}` },
    { value: 'modern', label: t.layoutGroups.modern },
    { value: 'creative', label: t.layoutGroups.creative },
    { value: 'classic', label: t.layoutGroups.classic },
    { value: 'ats', label: t.atsBadge },
  ];
  const plain = templateOf(d.template).id === 'ats' || templateOf(d.template).id === 'academic';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Segmented label={t.template} value={group} options={filters} onChange={setGroup} />
        <div
          ref={grid}
          role="radiogroup"
          aria-label={t.template}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          style={{ '--thumb-scale': thumbScale } as React.CSSProperties}
        >
          {list.map((tp) => {
            const on = d.template === tp.id;
            return (
              <button
                key={tp.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setCv((c) => withTemplate(c, tp.id))}
                data-cursor="follow"
                className={cx('group flex flex-col gap-2 border p-2 text-left transition-colors', on ? 'border-accent' : 'border-line hover:border-line-strong')}
              >
                <span data-thumb className="block transition-transform duration-300 group-hover:-translate-y-0.5">
                  <ThumbSheet cv={cv} id={tp.id} />
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className={cx('font-mono text-2xs uppercase tracking-tech', on ? 'text-accent' : 'text-text')}>{tp.name[lang]}</span>
                  {tp.ats && <span className="border border-line px-1 font-mono text-[9px] uppercase tracking-tech text-dim">ATS</span>}
                </span>
                <span className="text-[11px] leading-snug text-dim">{tp.text[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={cx('flex flex-col gap-2', plain && 'pointer-events-none opacity-40')}>
        <span className="label">{t.accent}</span>
        <div className="flex flex-wrap items-center gap-2">
          {accents.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              aria-pressed={d.accent === c}
              onClick={() => setDesign(setCv, { accent: c })}
              className={cx('h-8 w-8 border-2 transition-transform hover:scale-110', d.accent === c ? 'border-text' : 'border-transparent')}
              style={{ background: c }}
            />
          ))}
          <label className="relative h-8 w-8 cursor-pointer border border-line" title={t.accent}>
            <input
              type="color"
              value={d.accent}
              onChange={(e) => setDesign(setCv, { accent: e.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label={t.accent}
            />
            <span className="grid h-full w-full place-items-center text-dim">{Icons.plus}</span>
          </label>
        </div>
      </div>

      <Segmented
        label={t.density}
        value={d.density}
        options={(['compact', 'normal', 'airy'] as const).map((v) => ({ value: v, label: t.densities[v] }))}
        onChange={(v) => setDesign(setCv, { density: v })}
      />
      <Segmented
        label={t.cvLang}
        value={d.lang}
        options={[
          { value: 'en', label: 'English' },
          { value: 'hu', label: 'Magyar' },
          { value: 'sk', label: 'Slovenčina' },
        ]}
        onChange={(v) => setDesign(setCv, { lang: v })}
      />
      {templateOf(d.template).photo && cv.personal.photo && (
        <Check label={t.showPhoto} checked={d.showPhoto} onChange={(v) => setDesign(setCv, { showPhoto: v })} />
      )}
    </div>
  );
}

export function ExportStep({
  cv,
  t,
  pages,
  onPrint,
  onImport,
  onExample,
  onBlank,
}: {
  cv: Cv;
  t: CvText;
  pages: number;
  onPrint: () => void;
  onImport: (file: File) => Promise<boolean>;
  onExample: () => void;
  onBlank: () => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState(false);
  const { t: ui, lp } = useI18n();
  const p = cv.personal;
  const summary = cv.sections.find((s) => s.kind === 'summary')?.text.trim() ?? '';
  const sentences = summary.split(/[.!?]+\s/).filter((x) => x.trim()).length;
  const work = cv.sections.filter((s) => s.kind === 'experience' || s.kind === 'projects');
  const allText = cv.sections.flatMap((s) => [s.text, ...s.items.map((it) => it.description)]).join(' ');
  const checks: Array<[string, boolean]> = [
    [t.checks.name, Boolean(p.name.trim() && p.headline.trim())],
    [t.checks.contact, Boolean(p.email.trim() || p.phone.trim())],
    [t.checks.summary, sentences >= 2 && sentences <= 5],
    [t.checks.experience, work.some((s) => s.items.some((it) => it.title.trim() && it.description.trim()))],
    [t.checks.numbers, /\d/.test(allText)],
    [t.checks.length, pages <= 2],
  ];

  const download = () => {
    const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    const slug = (p.name || 'cv').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug || 'cv'}-cv.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className="flex flex-col gap-8">
      <SupportShare url={`${site.url}${lp('/cv-maker/')}`} text={ui.ux.supportCv} />
      <div className="relative border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <ActionBtn solid onClick={onPrint}>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
              <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" />
            </svg>
            {t.pdf}
          </ActionBtn>
          <span className="label">
            {t.pages}: <span className="text-text">{pages} {pages === 1 ? t.page : t.pagesPlural}</span>
          </span>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-muted">{t.pdfHint}</p>
      </div>

      <div>
        <div className="label-a mb-3">// {t.checklist}</div>
        <ul className="border-t border-line">
          {checks.map(([label, ok]) => (
            <li key={label} className="flex items-center gap-3 border-b border-line py-2.5 text-sm">
              <span
                className={cx(
                  'grid h-5 w-5 shrink-0 place-items-center border text-[10px]',
                  ok ? 'border-accent bg-accent text-onaccent' : 'border-line-strong text-dim',
                )}
                aria-hidden
              >
                {ok ? '✓' : ''}
              </span>
              <span className={ok ? 'text-text' : 'text-muted'}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="label-a mb-2">// {t.backup}</div>
        <p className="mb-4 text-[13px] leading-relaxed text-muted">{t.backupHint}</p>
        <div className="flex flex-wrap gap-2">
          <ActionBtn onClick={download}>{t.download}</ActionBtn>
          <ActionBtn onClick={() => file.current?.click()}>{t.importFile}</ActionBtn>
          <ActionBtn onClick={onExample}>{t.example}</ActionBtn>
          <ActionBtn onClick={onBlank}>{t.blank}</ActionBtn>
        </div>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) setImportError(!(await onImport(f)));
          }}
        />
        {importError && <p className="mt-2 text-[12px] text-red-500">{t.importError}</p>}
      </div>
    </div>
  );
}
