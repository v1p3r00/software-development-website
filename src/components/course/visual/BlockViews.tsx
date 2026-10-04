import type { CalloutVariant, CompareSpec } from './blocks';
import type { Lang } from '../../../data/projects';
import { mdToHtml } from './md';
import type { Tone } from './blocks';

const TERM_TONES: Tone[] = ['blue', 'violet', 'green', 'amber', 'pink', 'cyan'];

const CALLOUT: Record<CalloutVariant, { icon: string; en: string; hu: string }> = {
  tip: { icon: '✦', en: 'Tip', hu: 'Tipp' },
  warn: { icon: '!', en: 'Watch out', hu: 'Figyelem' },
  ide: { icon: '⌘', en: 'In IntelliJ IDEA', hu: 'IntelliJ IDEA-ban' },
  note: { icon: 'i', en: 'Note', hu: 'Megjegyzés' },
  info: { icon: '?', en: 'Good to know', hu: 'Jó tudni' },
};

export function Callout({ variant, title, md, lang }: { variant: CalloutVariant; title: string; md: string; lang: Lang }) {
  const c = CALLOUT[variant];
  return (
    <aside className={`vis-callout vis-callout-${variant}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span aria-hidden className="vis-callout-icon">
          {c.icon}
        </span>
        <span className="vis-callout-head font-mono text-[12px] font-semibold uppercase tracking-[0.14em]">{c[lang]}</span>
        {title && <span className="text-[17px] font-bold text-text">{title}</span>}
      </div>
      <div className="prose-article prose-compact mt-3" dangerouslySetInnerHTML={{ __html: mdToHtml(md) }} />
    </aside>
  );
}

export function Compare({ spec, lang }: { spec: CompareSpec; lang: Lang }) {
  const sides = [
    { s: spec.left, tone: 'bad', mark: '✕' },
    { s: spec.right, tone: 'good', mark: '✓' },
  ];
  return (
    <figure className="vis-figure">
      <div className="vis-kicker">{lang === 'hu' ? 'Összehasonlítás' : 'Side by side'}</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {sides.map(({ s, tone, mark }) => (
          <div key={tone} className={`vis-compare vis-compare-${tone} min-w-0`}>
            <div className="vis-compare-head flex items-center gap-2.5 px-4 py-2.5">
              <span aria-hidden className="vis-compare-mark">
                {mark}
              </span>
              <span className="text-[15.5px] font-bold text-text">{s.title}</span>
              {s.lang && <span className="label ml-auto">{s.lang}</span>}
            </div>
            <pre className="code-plain m-0 overflow-x-auto bg-transparent px-4 py-3.5 font-mono text-[13.5px] leading-[1.65] text-text">
              <code>{s.code}</code>
            </pre>
            {s.note && <p className="border-t border-line px-4 py-3 text-[14.5px] leading-relaxed text-muted">{s.note}</p>}
          </div>
        ))}
      </div>
    </figure>
  );
}

export function Terms({ items, lang }: { items: { term: string; def: string }[]; lang: Lang }) {
  return (
    <figure className="vis-figure">
      <div className="vis-kicker">{lang === 'hu' ? 'Kulcsfogalmak' : 'Key terms'}</div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((x, i) => (
          <div key={x.term} className={'vis-term tone-' + TERM_TONES[i % TERM_TONES.length]}>
            <dt className="font-mono text-[14.5px] font-bold">{x.term}</dt>
            <dd className="mt-1.5 text-[15px] leading-relaxed text-muted" dangerouslySetInnerHTML={{ __html: mdToHtml(x.def).replace(/^<p>|<\/p>\s*$/g, '') }} />
          </div>
        ))}
      </dl>
    </figure>
  );
}
