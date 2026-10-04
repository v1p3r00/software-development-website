import { useState } from 'react';
import { useI18n } from '../../i18n';
import { site } from '../../data/site';

const NAME = 'dm.course.name';
const readName = () => {
  try {
    return window.localStorage.getItem(NAME) ?? '';
  } catch {
    return '';
  }
};

/** shown once every lesson is complete: a printable certificate (print → save as PDF) */
export default function Certificate({ finishedOn }: { finishedOn: Date }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState(readName);
  const date = finishedOn.toLocaleDateString(lang === 'hu' ? 'hu-HU' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const print = () => {
    document.documentElement.classList.add('print-cert');
    const done = () => {
      document.documentElement.classList.remove('print-cert');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
  };
  return (
    <section className="relative mb-12 border-2 border-accent bg-accent/[0.06] p-6 sm:p-8">
      <div className="label-a">// ✓ {t.ux.certTitle}</div>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted">{t.ux.certText}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">{t.ux.certName}</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              try {
                window.localStorage.setItem(NAME, e.target.value);
              } catch {
                /* not saved */
              }
            }}
            placeholder={t.ux.certName}
            className="w-full border border-line-strong bg-bg px-4 py-3 text-[15px] text-text outline-none focus:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={print}
          disabled={!name.trim()}
          className="bg-accent px-6 py-3 font-mono text-[12.5px] uppercase tracking-tech text-onaccent transition-colors hover:bg-text disabled:opacity-40"
        >
          {t.ux.certPrint}
        </button>
      </div>

      {/* the printed page (hidden on screen) */}
      <div className="cert-sheet" aria-hidden>
        <div className="cert-inner">
          <div className="cert-kicker">{t.ux.certIssued}</div>
          <div className="cert-name">{name || '—'}</div>
          <div className="cert-body">{t.ux.certBody}</div>
          <div className="cert-course">{t.ux.certCourse}</div>
          <div className="cert-foot">
            <span>{date}</span>
            <span>
              {site.name} · {site.domain}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
