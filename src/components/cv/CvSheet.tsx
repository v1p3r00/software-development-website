import type { CSSProperties, ReactNode } from 'react';
import { bullets, isSideKind } from './model';
import type { Cv, Entry, Section } from './model';
import { templateOf } from './templates';
import type { TemplateDef } from './templates';
import { cx } from '../ui';
import { headings } from './text';

const hasContent = (s: Section) => s.text.trim() !== '' || s.items.some((it) => it.title.trim() || it.description.trim());

const href = (url: string) => (/^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}`);
const bare = (url: string) => url.replace(/^https?:\/\//i, '').replace(/\/$/, '');

function Dots({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="cv-dots" aria-label={`${level}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={n <= level ? 'on' : ''} />
      ))}
    </span>
  );
}

function Desc({ text, allBullets }: { text: string; allBullets: boolean }) {
  if (!text.trim()) return null;
  if (allBullets) {
    return (
      <ul className="cv-bullets">
        {bullets(text).map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    );
  }
  // mixed: lines that start with a marker are bullets, the rest paragraphs
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={`u${blocks.length}`} className="cv-bullets">{list.map((b, i) => <li key={i}>{b}</li>)}</ul>);
    list = [];
  };
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    if (/^\s*[-•*–]\s+/.test(line)) list.push(line.replace(/^\s*[-•*–]\s+/, ''));
    else {
      flush();
      blocks.push(<p key={`p${blocks.length}`} className="cv-par">{line.trim()}</p>);
    }
  }
  flush();
  return <>{blocks}</>;
}

function dateRange(it: Entry, present: string) {
  const end = it.current ? present : it.end.trim();
  const start = it.start.trim();
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

function EntryBlock({ it, kind, present }: { it: Entry; kind: Section['kind']; present: string }) {
  const dates = dateRange(it, present);
  const meta = [it.subtitle, it.place].map((x) => x.trim()).filter(Boolean).join(' · ');
  return (
    <div className="cv-entry">
      <div className="cv-entry-head">
        <span className="cv-entry-title">{it.title || ' '}</span>
        {dates && <span className="cv-entry-date">{dates}</span>}
      </div>
      {meta && <div className="cv-entry-meta">{meta}</div>}
      {it.url.trim() && (
        <a className="cv-entry-url" href={href(it.url.trim())}>
          {bare(it.url.trim())}
        </a>
      )}
      <Desc text={it.description} allBullets={kind === 'experience' || kind === 'projects'} />
    </div>
  );
}

function Bar({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="cv-bar" aria-label={`${level}/5`}>
      <i style={{ width: `${level * 20}%` }} />
    </span>
  );
}

/** skills and languages, drawn the way the layout asks for */
function ShortList({ section, side, style }: { section: Section; side: boolean; style: TemplateDef['skills'] }) {
  const items = section.items.filter((it) => it.title.trim());
  const meter = (level: number) => (style === 'bars' ? <Bar level={level} /> : style === 'dots' && side ? <Dots level={level} /> : null);

  if (section.kind === 'languages') {
    const rows = side || style === 'bars';
    return (
      <ul className={rows ? 'cv-rows' : 'cv-inline-rows'}>
        {items.map((it) => (
          <li key={it.id} className={style === 'bars' ? 'cv-row-stack' : undefined}>
            <span>
              <b>{it.title}</b>
              {it.subtitle && <span className="cv-muted"> — {it.subtitle}</span>}
            </span>
            {rows && meter(it.level)}
          </li>
        ))}
      </ul>
    );
  }
  if (style === 'chips') {
    return (
      <ul className="cv-chips">
        {items.map((it) => (
          <li key={it.id}>{it.title}</li>
        ))}
      </ul>
    );
  }
  if (style === 'bars' || (style === 'dots' && side)) {
    return (
      <ul className={cx('cv-rows', style === 'bars' && side && 'cv-rows-stack')}>
        {items.map((it) => (
          <li key={it.id} className={style === 'bars' && side ? 'cv-row-stack' : undefined}>
            <span>{it.title}</span>
            {meter(it.level)}
          </li>
        ))}
      </ul>
    );
  }
  // grouped by the optional "group" field: "Frontend: React, TypeScript"
  const groups = new Map<string, string[]>();
  for (const it of items) {
    const g = it.subtitle.trim();
    groups.set(g, [...(groups.get(g) ?? []), it.title.trim()]);
  }
  return (
    <div className="cv-skill-groups">
      {[...groups].map(([g, names]) => (
        <p key={g} className="cv-par">
          {g && <b>{g}: </b>}
          {names.join(', ')}
        </p>
      ))}
    </div>
  );
}

function SectionBlock({ section, cv, side = false }: { section: Section; cv: Cv; side?: boolean }) {
  const h = headings[cv.design.lang];
  const style = templateOf(cv.design.template).skills;
  const title = section.title.trim() || h[section.kind];
  const short = section.kind === 'skills' || section.kind === 'languages';
  return (
    <section className={`cv-section cv-k-${section.kind}`}>
      <h2 className="cv-h">{title}</h2>
      {section.text.trim() && <Desc text={section.text} allBullets={false} />}
      {short ? (
        <ShortList section={section} side={side} style={style} />
      ) : (
        section.items
          .filter((it) => it.title.trim() || it.description.trim())
          .map((it) => <EntryBlock key={it.id} it={it} kind={section.kind} present={h.present} />)
      )}
    </section>
  );
}

function Contact({ cv, layout }: { cv: Cv; layout: 'list' | 'line' }) {
  const p = cv.personal;
  const items: Array<{ key: string; label?: string; text: string; href?: string }> = [];
  if (p.email.trim()) items.push({ key: 'e', label: 'Email', text: p.email.trim(), href: `mailto:${p.email.trim()}` });
  if (p.phone.trim()) items.push({ key: 'p', label: cv.design.lang === 'hu' ? 'Telefon' : 'Phone', text: p.phone.trim(), href: `tel:${p.phone.replace(/\s/g, '')}` });
  if (p.location.trim()) items.push({ key: 'l', text: p.location.trim() });
  for (const l of p.links) {
    if (!l.url.trim()) continue;
    items.push({ key: l.id, label: l.label.trim() || undefined, text: bare(l.url.trim()), href: href(l.url.trim()) });
  }
  if (!items.length) return null;
  if (layout === 'list') {
    return (
      <ul className="cv-contact-list">
        {items.map((it) => (
          <li key={it.key}>
            {it.label && <span className="cv-contact-label">{it.label}</span>}
            {it.href ? <a href={it.href}>{it.text}</a> : <span>{it.text}</span>}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="cv-contact-line">
      {items.map((it, i) => (
        <span key={it.key}>
          {i > 0 && <span className="cv-sep"> | </span>}
          {it.label && cv.design.template === 'ats' && `${it.label}: `}
          {it.href ? <a href={it.href}>{it.text}</a> : it.text}
        </span>
      ))}
    </p>
  );
}

export default function CvSheet({ cv, className = '' }: { cv: Cv; className?: string }) {
  const { personal: p, design } = cv;
  const def = templateOf(design.template);
  const sections = cv.sections.filter(hasContent);
  const photo = design.showPhoto && def.photo && p.photo ? p.photo : '';
  const style = { '--cv-accent': design.accent } as CSSProperties;
  const cls = cx('cv-sheet', `cv-${def.id}`, `cv-layout-${def.layout}`, `cv-d-${design.density}`, className);

  const titleBlock = (
    <div className="cv-title">
      <h1 className="cv-name">{p.name || '\u00a0'}</h1>
      {p.headline && <p className="cv-headline">{p.headline}</p>}
    </div>
  );

  if (def.layout !== 'single') {
    const side = sections.filter((s) => isSideKind(s.kind));
    const main = sections.filter((s) => !isSideKind(s.kind));
    return (
      <article className={cls} style={style} lang={design.lang}>
        <aside className="cv-side">
          {photo && <img className="cv-photo" src={photo} alt="" />}
          <section className="cv-section cv-k-contact">
            <h2 className="cv-h">{headings[design.lang].contact}</h2>
            <Contact cv={cv} layout="list" />
          </section>
          {side.map((s) => (
            <SectionBlock key={s.id} section={s} cv={cv} side />
          ))}
        </aside>
        <div className="cv-main">
          <header className="cv-header">{titleBlock}</header>
          {main.map((s) => (
            <SectionBlock key={s.id} section={s} cv={cv} />
          ))}
        </div>
      </article>
    );
  }

  return (
    <article className={cls} style={style} lang={design.lang}>
      <header className={cx('cv-header', def.contact === 'stack' && 'cv-header-split')}>
        {photo && <img className="cv-photo" src={photo} alt="" />}
        <div className="cv-header-text">
          {titleBlock}
          {def.contact === 'line' && <Contact cv={cv} layout="line" />}
        </div>
        {def.contact === 'stack' && <Contact cv={cv} layout="list" />}
      </header>
      <div className="cv-main">
        {sections.map((s) => (
          <SectionBlock key={s.id} section={s} cv={cv} side={false} />
        ))}
      </div>
    </article>
  );
}
