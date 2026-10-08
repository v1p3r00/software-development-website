import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { featuredIndustries } from '../data/industries';
import { CornerMarks } from './ui';

const T = {
  en: {
    label: 'Free website check',
    title: 'How does your website do today?',
    text: 'Speed, Google basics, mobile and security — an instant report with a fix for every issue.',
    ph: 'yourwebsite.hu',
    run: 'Check it',
    for: 'Websites for',
  },
  hu: {
    label: 'Ingyenes weboldal-ellenőrzés',
    title: 'Hogy teljesít ma a weboldalad?',
    text: 'Sebesség, Google-alapok, mobil és biztonság — azonnali jelentés, minden hibához javítási javaslattal.',
    ph: 'weboldalad.hu',
    run: 'Ellenőrzés',
    for: 'Weboldal:',
  },
};

/** a home-page band leading to the website check and the industry pages */
export default function CheckBand() {
  const { lang, lp } = useI18n();
  const t = T[lang];
  const navigate = useNavigate();
  const [v, setV] = useState('');
  const go = (e: FormEvent) => {
    e.preventDefault();
    const url = v.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    navigate(`${lp('/website-check/')}${url ? `?url=${encodeURIComponent(url)}` : ''}`);
  };
  return (
    <section id="website-check-band" className="relative mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
      <div className="relative grid gap-6 border border-line-strong bg-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <CornerMarks />
        <div>
          <div className="label mb-2">// {t.label}</div>
          <h2 className="display text-[clamp(1.7rem,6vw,2.8rem)] leading-[0.92]">{t.title}</h2>
          <p className="mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-muted">{t.text}</p>
        </div>
        <div>
          <form onSubmit={go} className="flex flex-col gap-2 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-2 border border-line-strong bg-bg px-3 focus-within:border-accent">
              <span className="font-mono text-[13px] text-accent" aria-hidden>
                https://
              </span>
              <input value={v} onChange={(e) => setV(e.target.value)} placeholder={t.ph} aria-label={t.ph} inputMode="url" spellCheck={false} className="h-12 min-w-0 flex-1 bg-transparent font-mono text-[15px] text-text outline-none placeholder:text-dim" />
            </div>
            <button type="submit" data-cursor="follow" className="h-12 bg-accent px-6 font-mono text-[12.5px] font-semibold uppercase tracking-tech text-onaccent transition-colors hover:bg-text">
              {t.run} →
            </button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11.5px] uppercase tracking-tech">
            <span className="text-dim">{t.for}</span>
            {featuredIndustries.map((ind) => (
              <Link key={ind.slug} to={lp(`/industries/${ind.slug}/`)} data-cursor="follow" className="text-muted underline-offset-4 transition-colors hover:text-accent hover:underline">
                {ind.nav[lang]}
              </Link>
            ))}
            <Link to={lp('/industries/')} data-cursor="follow" className="text-text underline-offset-4 transition-colors hover:text-accent hover:underline">
              {lang === 'hu' ? 'Összes iparág' : 'All industries'} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
