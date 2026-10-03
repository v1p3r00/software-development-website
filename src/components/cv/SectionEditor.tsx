import { useState } from 'react';
import { cx } from '../ui';
import { Check, Field, IconBtn, inputCls } from './form';
import { Icons } from './icons';
import { emptyEntry, fieldsOf, hasText, move } from './model';
import type { Entry, Section } from './model';
import type { CvText } from './text';

/** skills and languages: one compact row per entry */
function RowEditor({ section, t, onItems }: { section: Section; t: CvText; onItems: (items: Entry[]) => void }) {
  const f = t.fields[section.kind];
  const ph = t.placeholders[section.kind];
  const set = (i: number, patch: Partial<Entry>) => onItems(section.items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  return (
    <div className="flex flex-col gap-2">
      <div className="hidden grid-cols-[1fr_1fr_8.5rem_6.5rem] gap-2 sm:grid">
        <span className="label">{f.title}</span>
        <span className="label">{f.subtitle}</span>
        <span className="label">{f.level}</span>
        <span />
      </div>
      {section.items.map((it, i) => (
        <div key={it.id} className="grid grid-cols-2 gap-2 border border-line p-2 sm:grid-cols-[1fr_1fr_8.5rem_6.5rem] sm:border-0 sm:p-0">
          <input
            aria-label={f.title}
            value={it.title}
            placeholder={ph.title}
            onChange={(e) => set(i, { title: e.target.value })}
            className={cx(inputCls, 'col-span-2 sm:col-span-1')}
          />
          <input
            aria-label={f.subtitle}
            value={it.subtitle}
            placeholder={ph.subtitle}
            onChange={(e) => set(i, { subtitle: e.target.value })}
            className={cx(inputCls, 'col-span-2 sm:col-span-1')}
          />
          <select
            aria-label={f.level}
            value={it.level}
            onChange={(e) => set(i, { level: Number(e.target.value) })}
            className={cx(inputCls, 'px-2')}
          >
            <option value={0}>{t.levelNone}</option>
            {t.levels.map((l, n) => (
              <option key={l} value={n + 1}>
                {n + 1} — {l}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-end gap-1">
            <IconBtn label={t.moveUp} disabled={i === 0} onClick={() => onItems(move(section.items, i, -1))}>
              {Icons.up}
            </IconBtn>
            <IconBtn label={t.moveDown} disabled={i === section.items.length - 1} onClick={() => onItems(move(section.items, i, 1))}>
              {Icons.down}
            </IconBtn>
            <IconBtn label={t.remove} danger onClick={() => onItems(section.items.filter((_, j) => j !== i))}>
              {Icons.remove}
            </IconBtn>
          </div>
        </div>
      ))}
    </div>
  );
}

/** experience, education, projects…: collapsible cards */
function CardEditor({ section, t, onItems }: { section: Section; t: CvText; onItems: (items: Entry[]) => void }) {
  // the last entry starts open, so a freshly added one is ready to type into
  const [openId, setOpenId] = useState<string | null>(section.items.at(-1)?.id ?? null);
  // a newly added entry opens straight away
  const [count, setCount] = useState(section.items.length);
  if (section.items.length !== count) {
    setCount(section.items.length);
    if (section.items.length > count) setOpenId(section.items.at(-1)?.id ?? null);
  }
  const fields = fieldsOf[section.kind];
  const f = t.fields[section.kind];
  const ph = t.placeholders[section.kind];
  const set = (i: number, patch: Partial<Entry>) => onItems(section.items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const has = (k: keyof Entry) => fields.includes(k);

  return (
    <div className="flex flex-col gap-3">
      {section.items.map((it, i) => {
        const open = openId === it.id;
        const dates = [it.start, it.current ? '…' : it.end].filter(Boolean).join(' – ');
        return (
          <div key={it.id} className={cx('border transition-colors', open ? 'border-line-strong bg-surface' : 'border-line')}>
            <div className="flex items-center gap-2 p-2 pl-3">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : it.id)}
                aria-expanded={open}
                className="group flex min-w-0 flex-1 items-baseline gap-3 text-left"
              >
                <span className="font-mono text-2xs tracking-tech text-accent">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text group-hover:text-accent">
                    {it.title || <span className="text-dim">{t.untitled}</span>}
                  </span>
                  <span className="block truncate font-mono text-2xs uppercase tracking-tech text-dim">
                    {[it.subtitle, dates].filter(Boolean).join(' · ') || ' '}
                  </span>
                </span>
              </button>
              <IconBtn label={open ? t.done : t.edit} onClick={() => setOpenId(open ? null : it.id)}>
                {open ? Icons.up : Icons.edit}
              </IconBtn>
              <IconBtn label={t.moveUp} disabled={i === 0} onClick={() => onItems(move(section.items, i, -1))}>
                {Icons.up}
              </IconBtn>
              <IconBtn label={t.moveDown} disabled={i === section.items.length - 1} onClick={() => onItems(move(section.items, i, 1))}>
                {Icons.down}
              </IconBtn>
              <IconBtn label={t.remove} danger onClick={() => onItems(section.items.filter((_, j) => j !== i))}>
                {Icons.remove}
              </IconBtn>
            </div>

            {open && (
              <div className="grid grid-cols-2 gap-4 border-t border-line p-4" style={{ animation: 'fadeUp .35s cubic-bezier(.16,1,.3,1) both' }}>
                {has('title') && <Field className="col-span-2 sm:col-span-1" label={f.title!} value={it.title} placeholder={ph.title} onChange={(v) => set(i, { title: v })} />}
                {has('subtitle') && <Field className="col-span-2 sm:col-span-1" label={f.subtitle!} value={it.subtitle} placeholder={ph.subtitle} onChange={(v) => set(i, { subtitle: v })} />}
                {has('place') && <Field className="col-span-2" label={f.place!} value={it.place} placeholder={ph.place} onChange={(v) => set(i, { place: v })} />}
                {has('start') && <Field label={f.start!} value={it.start} placeholder={ph.start} onChange={(v) => set(i, { start: v })} />}
                {has('end') && (
                  <div className={cx('flex flex-col gap-2', !has('start') && 'col-span-2 sm:col-span-1')}>
                    {it.current ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="label">{f.end}</span>
                        <span className={cx(inputCls, 'text-dim')}>—</span>
                      </div>
                    ) : (
                      <Field label={f.end!} value={it.end} placeholder={ph.end} onChange={(v) => set(i, { end: v })} />
                    )}
                  </div>
                )}
                {has('current') && (
                  <div className="col-span-2">
                    <Check label={f.current!} checked={it.current} onChange={(v) => set(i, { current: v })} />
                  </div>
                )}
                {has('url') && <Field className="col-span-2" label={f.url!} value={it.url} placeholder={ph.url || 'https://'} onChange={(v) => set(i, { url: v })} />}
                {has('description') && (
                  <Field
                    className="col-span-2"
                    label={f.description!}
                    value={it.description}
                    placeholder={ph.description}
                    multiline
                    rows={5}
                    hint={section.kind === 'experience' || section.kind === 'projects' ? t.descHint : undefined}
                    onChange={(v) => set(i, { description: v })}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SectionEditor({ section, t, onChange }: { section: Section; t: CvText; onChange: (s: Section) => void }) {
  const onItems = (items: Entry[]) => onChange({ ...section, items });
  const rows = section.kind === 'skills' || section.kind === 'languages';
  return (
    <div className="flex flex-col gap-6">
      <Field
        label={t.sectionTitle}
        hint={t.sectionTitleHint}
        value={section.title}
        placeholder={t.kindNames[section.kind]}
        onChange={(v) => onChange({ ...section, title: v })}
      />
      {hasText(section.kind) && (
        <Field
          label={t.text}
          value={section.text}
          multiline
          rows={section.kind === 'summary' ? 6 : 4}
          placeholder={section.kind === 'summary' ? t.summaryPh : t.customPh}
          hint={section.kind === 'summary' ? t.summaryHint : undefined}
          onChange={(v) => onChange({ ...section, text: v })}
        />
      )}
      {section.kind !== 'summary' && (
        <div className="flex flex-col gap-3">
          {rows ? <RowEditor section={section} t={t} onItems={onItems} /> : <CardEditor section={section} t={t} onItems={onItems} />}
          <button
            type="button"
            onClick={() => onItems([...section.items, emptyEntry()])}
            data-cursor="follow"
            className="flex items-center justify-center gap-2 border border-dashed border-line-strong py-3 font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {Icons.plus} {t.addEntry}
          </button>
        </div>
      )}
    </div>
  );
}
