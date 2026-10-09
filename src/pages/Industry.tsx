import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { site } from '../data/site';
import { industries, industryBySlug, INDUSTRIES_SEO } from '../data/industries';
import type { Industry as IndustryData } from '../data/industries';
import { industryDemo } from '../data/industryDemo';
import { CornerMarks, Section, cx } from '../components/ui';
import { openSupport } from '../components/support/open';
import NotFound from './NotFound';

const T = {
  en: {
    start: 'Start a project',
    check: 'Check my current site — free',
    demo: 'Open the demo',
    like: 'I want a site like this',
    problemsLabel: 'Why customers slip away',
    problemsTitle: 'What usually goes wrong',
    featuresLabel: 'What your site gets',
    featuresTitle: 'Built to win customers',
    demoLabel: 'Live demo',
    redesignLabel: 'Before & after',
    pricesLabel: 'Guide prices',
    pricesTitle: 'What it costs',
    pricesNote: 'Guide prices including design and development; the exact price comes in a written quote after a free consultation.',
    pricesMore: 'How much does a website cost in 2026?',
    processLabel: 'How it works',
    process: [
      ['Free consultation', 'A short call about your business, goals and what you have today.'],
      ['Written proposal', 'Scope, price and schedule in writing — no surprises later.'],
      ['Design and build', 'Step by step, with previews you can click through on your phone.'],
      ['Launch and care', 'Go live, a short handover, then support as you need it.'],
    ],
    faqLabel: 'Questions',
    faqTitle: 'Frequently asked',
    checkTitle: 'How does your current site do?',
    checkText: 'Run the free check: speed, Google basics, mobile and security in about 10 seconds.',
    checkPh: 'yourwebsite.hu',
    checkRun: 'Check',
    others: 'Other industries',
    all: 'All industries',
    indexKicker: 'Websites by industry',
    indexTitle: ['A website', 'built around', 'your business'],
    indexLead: 'Every kind of business wins customers differently: a clinic needs bookings, a hotel needs direct reservations, a restaurant needs a menu people can read on a phone. These offers start from that.',
  },
  hu: {
    start: 'Projektet indítok',
    check: 'Ellenőrzöm a mostani oldalam — ingyen',
    demo: 'Demó megnyitása',
    like: 'Ilyen oldalt szeretnék',
    problemsLabel: 'Miért mennek el az ügyfelek',
    problemsTitle: 'Ami általában nem működik',
    featuresLabel: 'Mit kap az oldalad',
    featuresTitle: 'Ügyfélszerzésre építve',
    demoLabel: 'Élő demó',
    redesignLabel: 'Előtte–utána',
    pricesLabel: 'Irányárak',
    pricesTitle: 'Mennyibe kerül',
    pricesNote: 'Irányárak tervezéssel és fejlesztéssel együtt; a pontos árat egy ingyenes konzultáció után, írásos ajánlatban kapod meg.',
    pricesMore: 'Mennyibe kerül egy weboldal 2026-ban?',
    processLabel: 'Hogyan zajlik',
    process: [
      ['Ingyenes konzultáció', 'Rövid beszélgetés a vállalkozásodról, a céljaidról és arról, mi van most.'],
      ['Írásos ajánlat', 'Tartalom, ár és ütemezés írásban — később nincs meglepetés.'],
      ['Tervezés és fejlesztés', 'Lépésenként, telefonon is kipróbálható előnézetekkel.'],
      ['Élesítés és gondozás', 'Indulás, rövid átadás, utána pedig támogatás, amikor kell.'],
    ],
    faqLabel: 'Kérdések',
    faqTitle: 'Gyakori kérdések',
    checkTitle: 'Hogy teljesít a mostani oldalad?',
    checkText: 'Futtasd le az ingyenes ellenőrzést: sebesség, Google-alapok, mobil és biztonság kb. 10 másodperc alatt.',
    checkPh: 'weboldalad.hu',
    checkRun: 'Ellenőrzés',
    others: 'További iparágak',
    all: 'Összes iparág',
    indexKicker: 'Weboldal iparáganként',
    indexTitle: ['Weboldal,', 'ami a vállalkozásod', 'köré épül'],
    indexLead: 'Minden vállalkozás máshogy szerez ügyfelet: a rendelőnek foglalás kell, a szállásnak közvetlen foglalás, az étteremnek mobilon is olvasható étlap. Ezek az ajánlatok ebből indulnak ki.',
  },
  sk: {
    start: 'Začať projekt',
    check: 'Skontrolovať môj súčasný web — zadarmo',
    demo: 'Otvoriť demo',
    like: 'Chcem takýto web',
    problemsLabel: 'Prečo zákazníci odchádzajú',
    problemsTitle: 'Čo zvyčajne nefunguje',
    featuresLabel: 'Čo váš web dostane',
    featuresTitle: 'Postavený na získavanie zákazníkov',
    demoLabel: 'Živé demo',
    redesignLabel: 'Pred a po',
    pricesLabel: 'Orientačné ceny',
    pricesTitle: 'Koľko to stojí',
    pricesNote: 'Orientačné ceny vrátane dizajnu a vývoja; presnú cenu dostanete v písomnej ponuke po bezplatnej konzultácii.',
    pricesMore: 'Koľko stojí web v roku 2026?',
    processLabel: 'Ako to prebieha',
    process: [
      ['Bezplatná konzultácia', 'Krátky rozhovor o vašom podnikaní, cieľoch a o tom, čo máte dnes.'],
      ['Písomná ponuka', 'Rozsah, cena a harmonogram písomne — žiadne neskoršie prekvapenia.'],
      ['Návrh a vývoj', 'Krok za krokom, s náhľadmi, ktoré si preklikáte aj v telefóne.'],
      ['Spustenie a starostlivosť', 'Spustenie, krátke odovzdanie a potom podpora podľa potreby.'],
    ],
    faqLabel: 'Otázky',
    faqTitle: 'Časté otázky',
    checkTitle: 'Ako si vedie váš súčasný web?',
    checkText: 'Spustite bezplatnú kontrolu: rýchlosť, základy Google, mobil a bezpečnosť približne za 10 sekúnd.',
    checkPh: 'vasweb.sk',
    checkRun: 'Skontrolovať',
    others: 'Ďalšie odvetvia',
    all: 'Všetky odvetvia',
    indexKicker: 'Weby podľa odvetvia',
    indexTitle: ['Web', 'postavený okolo', 'vášho podnikania'],
    indexLead: 'Každý typ podniku získava zákazníkov inak: ambulancia potrebuje objednávky, hotel priame rezervácie, reštaurácia menu, ktoré sa dá prečítať aj v telefóne. Z toho tieto ponuky vychádzajú.',
  },
};

const pricesArticle = '/articles/how-much-does-a-website-cost-2026/';

/** small heading block used by every section */
function Head({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8">
      <div className="label mb-2">// {label}</div>
      <h2 className="display text-[clamp(1.8rem,7vw,3rem)] leading-[0.92]">{title}</h2>
    </div>
  );
}

function CheckBox({ t }: { t: (typeof T)['en'] }) {
  const { lp } = useI18n();
  const navigate = useNavigate();
  const [v, setV] = useState('');
  const go = (e: FormEvent) => {
    e.preventDefault();
    const url = v.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    navigate(`${lp('/website-check/')}${url ? `?url=${encodeURIComponent(url)}` : ''}`);
  };
  return (
    <form onSubmit={go} className="relative border border-line-strong bg-surface p-5 sm:p-7">
      <CornerMarks />
      <h2 className="display text-[clamp(1.5rem,5vw,2.2rem)] leading-[0.95]">{t.checkTitle}</h2>
      <p className="mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-muted">{t.checkText}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 border border-line-strong bg-bg px-3 focus-within:border-accent">
          <span className="font-mono text-[13px] text-accent" aria-hidden>
            https://
          </span>
          <input value={v} onChange={(e) => setV(e.target.value)} placeholder={t.checkPh} aria-label={t.checkPh} inputMode="url" spellCheck={false} className="h-12 min-w-0 flex-1 bg-transparent font-mono text-[15px] text-text outline-none placeholder:text-dim" />
        </div>
        <button type="submit" data-cursor="follow" className="h-12 bg-accent px-6 font-mono text-[12.5px] font-semibold uppercase tracking-tech text-onaccent transition-colors hover:bg-text">
          {t.checkRun} →
        </button>
      </div>
    </form>
  );
}

function IndustryPage({ ind }: { ind: IndustryData }) {
  const { lang, lp } = useI18n();
  const t = T[lang];
  const demo = industryDemo(ind);
  const url = `${site.url}${lp(`/industries/${ind.slug}/`)}`;
  useSeo({
    title: ind.seo.title[lang],
    description: ind.seo.description[lang],
    path: `/industries/${ind.slug}/`,
    image: `/og/industry-${ind.slug}.${lang}.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Service', name: ind.hero.kicker[lang], description: ind.seo.description[lang], url, provider: { '@id': `${site.url}/#person` }, areaServed: 'HU' },
        { '@type': 'FAQPage', mainEntity: ind.faq.map((f) => ({ '@type': 'Question', name: f.q[lang], acceptedAnswer: { '@type': 'Answer', text: f.a[lang] } })) },
      ],
    },
  });
  const start = (interest?: string) => openSupport(interest ?? ind.interest[lang]);

  return (
    <>
      {/* hero */}
      <Section id="industry" className="pb-10 pt-28 lg:pb-14 lg:pt-32">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <div className="label mb-4">// {ind.hero.kicker[lang]}</div>
            <h1 className="display text-[clamp(2.4rem,9.5vw,5rem)] leading-[0.9]">
              {ind.hero.title[lang].map((line, i, all) => (
                <span key={i} className={cx('block', i === 1 && 'text-muted')}>
                  {line}
                  {i === all.length - 1 && <span className="ml-1 inline-block h-[0.16em] w-[0.16em] bg-accent align-baseline" />}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-[56ch] text-[15.5px] leading-relaxed text-muted">{ind.hero.lead[lang]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => start()} data-cursor="follow" className="bg-accent px-6 py-4 font-mono text-[12.5px] font-semibold uppercase tracking-tech text-onaccent transition-colors hover:bg-text">
                {t.start} →
              </button>
              <Link to={lp('/website-check/')} data-cursor="follow" className="border border-line-strong px-6 py-4 font-mono text-[12.5px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent">
                {t.check}
              </Link>
            </div>
          </div>
          {demo && (
            <Link to={lp(demo.path)} data-cursor="follow" className="group relative block border border-line-strong bg-surface p-2">
              <CornerMarks />
              {demo.poster && <img src={demo.poster} srcSet={`${demo.poster.replace('.webp', '-640.webp')} 640w, ${demo.poster} 1600w`} sizes="(min-width: 1024px) 50vw, 80vw" alt={`${demo.name} — ${demo.sector[lang]}`} width={1600} height={1000} className="aspect-[16/10] w-full object-cover" fetchPriority="high" />}
              <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
                <span>
                  <span className="block font-mono text-[10.5px] uppercase tracking-tech text-accent">{demo.redesign ? t.redesignLabel : t.demoLabel}</span>
                  <span className="block font-display text-[17px] font-extrabold uppercase text-text">{demo.name}</span>
                </span>
                <span className="font-mono text-[11.5px] uppercase tracking-tech text-muted transition-colors group-hover:text-accent">{t.demo} ↗</span>
              </div>
            </Link>
          )}
        </div>
      </Section>

      {/* problems */}
      <Section id="problems" className="py-10 lg:py-14">
        <Head label={t.problemsLabel} title={t.problemsTitle} />
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {ind.problems.map((p, i) => (
            <div key={i} className="bg-bg p-6">
              <span className="font-mono text-[11px] text-accent">✗ 0{i + 1}</span>
              <h3 className="mt-2 text-[17px] font-semibold leading-snug text-text">{p.t[lang]}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{p.d[lang]}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* features */}
      <Section id="features" className="py-10 lg:py-14">
        <Head label={t.featuresLabel} title={t.featuresTitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ind.features.map((f, i) => (
            <div key={i} className="relative border border-line bg-surface p-6">
              <span className="font-mono text-[11px] text-accent">[{String(i + 1).padStart(2, '0')}]</span>
              <h3 className="mt-3 font-display text-[19px] font-extrabold uppercase leading-tight text-text">{f.t[lang]}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{f.d[lang]}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* demo */}
      {demo && (
        <Section id="demo" className="py-10 lg:py-14">
          <div className="grid gap-8 border-y border-line py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <div className="label mb-2">// {demo.redesign ? t.redesignLabel : t.demoLabel}</div>
              <h2 className="display text-[clamp(1.8rem,7vw,3rem)] leading-[0.92]">{demo.name}</h2>
              <p className="mt-2 font-mono text-[12px] uppercase tracking-tech text-muted">{demo.sector[lang]}</p>
              <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-muted">{ind.demoText[lang]}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to={lp(demo.path)} data-cursor="follow" className="border border-line-strong px-5 py-3.5 font-mono text-[12px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent">
                  {t.demo} ↗
                </Link>
                <button type="button" onClick={() => start()} data-cursor="follow" className="bg-accent px-5 py-3.5 font-mono text-[12px] font-semibold uppercase tracking-tech text-onaccent transition-colors hover:bg-text">
                  {t.like} →
                </button>
              </div>
            </div>
            {demo.poster && (
              <Link to={lp(demo.path)} data-cursor="follow" className="block border border-line-strong">
                <img src={demo.poster} srcSet={`${demo.poster.replace('.webp', '-640.webp')} 640w, ${demo.poster} 1600w`} sizes="(min-width: 1024px) 33vw, 80vw" alt={`${demo.name} — ${demo.sector[lang]}`} loading="lazy" decoding="async" width={1600} height={1000} className="aspect-[16/10] w-full object-cover" />
              </Link>
            )}
          </div>
        </Section>
      )}

      {/* prices */}
      <Section id="prices" className="py-10 lg:py-14">
        <Head label={t.pricesLabel} title={t.pricesTitle} />
        <div className="grid gap-4 lg:grid-cols-3">
          {ind.prices.map((p, i) => (
            <div key={i} className={cx('relative flex flex-col border bg-surface p-6', i === 1 ? 'border-accent' : 'border-line')}>
              {i === 1 && <CornerMarks />}
              <h3 className="font-mono text-[12px] uppercase tracking-tech text-muted">{p.name[lang]}</h3>
              <div className="mt-3 font-display text-[clamp(1.7rem,6vw,2.3rem)] font-extrabold leading-none text-text">{p.range[lang]}</div>
              <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-muted">{p.text[lang]}</p>
              <button type="button" onClick={() => start(`${ind.interest[lang]} — ${p.name[lang]}`)} data-cursor="follow" className="mt-5 self-start font-mono text-[11.5px] uppercase tracking-tech text-accent underline-offset-4 hover:underline">
                {t.start} →
              </button>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-[70ch] text-[13.5px] leading-relaxed text-dim">
          {t.pricesNote}{' '}
          <Link to={lp(pricesArticle)} className="text-muted underline underline-offset-4 hover:text-accent">
            {t.pricesMore}
          </Link>
        </p>
      </Section>

      {/* process */}
      <Section id="process" className="py-10 lg:py-14">
        <Head label={t.processLabel} title={t.processLabel} />
        <ol className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {t.process.map(([h, d], i) => (
            <li key={i} className="bg-bg p-6">
              <span className="font-display text-[40px] font-extrabold leading-none text-line-strong">{i + 1}</span>
              <h3 className="mt-3 text-[16px] font-semibold text-text">{h}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* faq + check */}
      <Section id="faq" className="py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <Head label={t.faqLabel} title={t.faqTitle} />
            <div className="border-t border-line">
              {ind.faq.map((f, i) => (
                <details key={i} className="group border-b border-line py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] font-semibold leading-snug text-text [&::-webkit-details-marker]:hidden" data-cursor="follow">
                    {f.q[lang]}
                    <span className="mt-0.5 font-mono text-[16px] text-accent transition-transform group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[64ch] text-[14.5px] leading-relaxed text-muted">{f.a[lang]}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="lg:sticky lg:top-28">
            <CheckBox t={t} />
          </div>
        </div>
      </Section>

      {/* other industries */}
      <Section id="more" className="pb-24 pt-6 lg:pb-28">
        <div className="label mb-4">// {t.others}</div>
        <div className="flex flex-wrap gap-2">
          {industries
            .filter((x) => x.slug !== ind.slug)
            .map((x) => (
              <Link key={x.slug} to={lp(`/industries/${x.slug}/`)} data-cursor="follow" className="border border-line-strong px-4 py-2.5 font-mono text-[12px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent">
                {x.nav[lang]} →
              </Link>
            ))}
          <Link to={lp('/industries/')} data-cursor="follow" className="px-4 py-2.5 font-mono text-[12px] uppercase tracking-tech text-muted transition-colors hover:text-accent">
            {t.all}
          </Link>
        </div>
      </Section>
    </>
  );
}

function IndustriesIndex() {
  const { lang, lp } = useI18n();
  const t = T[lang];
  useSeo({ title: INDUSTRIES_SEO.title[lang], description: INDUSTRIES_SEO.description[lang], path: '/industries/', image: `/og/industries.${lang}.png` });
  return (
    <Section id="industries" className="pt-28 lg:pt-32">
      <div className="label mb-4">// {t.indexKicker}</div>
      <h1 className="display text-[clamp(2.4rem,9.5vw,5rem)] leading-[0.9]">
        {t.indexTitle.map((line, i, all) => (
          <span key={i} className={cx('block', i === 1 && 'text-muted')}>
            {line}
            {i === all.length - 1 && <span className="ml-1 inline-block h-[0.16em] w-[0.16em] bg-accent align-baseline" />}
          </span>
        ))}
      </h1>
      <p className="mt-6 max-w-[60ch] text-[15.5px] leading-relaxed text-muted">{t.indexLead}</p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind) => {
          const demo = industryDemo(ind);
          return (
            <Link key={ind.slug} to={lp(`/industries/${ind.slug}/`)} data-cursor="follow" className="group border border-line bg-surface transition-colors hover:border-accent">
              {demo?.poster && <img src={demo.poster} srcSet={`${demo.poster.replace('.webp', '-640.webp')} 640w, ${demo.poster} 1600w`} sizes="(min-width: 1024px) 33vw, 80vw" alt={`${ind.nav[lang]} — ${demo.name}`} loading="lazy" decoding="async" width={1600} height={1000} className="aspect-[16/8] w-full border-b border-line object-cover" />}
              <div className="p-5">
                <div className="font-display text-[22px] font-extrabold uppercase leading-tight text-text">{ind.nav[lang]}</div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{ind.hero.lead[lang]}</p>
                <span className="mt-3 inline-block font-mono text-[11.5px] uppercase tracking-tech text-accent">→</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-14 max-w-[720px]">
        <CheckBox t={t} />
      </div>
    </Section>
  );
}

export default function Industry() {
  const { slug } = useParams();
  if (!slug) return <IndustriesIndex />;
  const ind = industryBySlug(slug);
  if (!ind) return <NotFound onSearch={() => {}} />;
  return <IndustryPage ind={ind} />;
}
