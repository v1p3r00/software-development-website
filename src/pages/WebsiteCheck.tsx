import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { site } from '../data/site';
import { CATS, CAT_NAMES, CHECKS, CHECK_SEO, GRADE_TEXT, evaluate } from '../data/siteCheck';
import type { Facts, Report, Result, Speed, Status } from '../data/siteCheck';
import { featuredIndustries } from '../data/industries';
import { CornerMarks, Section, cx } from '../components/ui';

const T = {
  en: {
    kicker: 'Free website check',
    title: ['How good is', 'your website', 'today?'],
    lead: 'Type in an address and get an instant report on speed, findability on Google, mobile readiness and security — with a plain-language fix for every issue.',
    placeholder: 'yourwebsite.hu',
    run: 'Check it',
    running: 'Checking…',
    note: 'Free, no sign-up. Takes about 10 seconds; the Google speed test up to 30.',
    try: 'Try it with',
    steps: ['Loading the page', 'Checking HTTPS and security headers', 'Reading titles, descriptions and headings', 'Looking for robots.txt and the sitemap', 'Checking mobile basics and images', 'Scoring'],
    errBad: 'That doesn’t look like a website address. Try something like example.hu.',
    errDown: 'The site could not be reached. Check the address — or the site may be down right now.',
    errService: 'The check is not available right now. Please try again in a minute.',
    scoreOf: 'out of 100',
    checked: 'Checked',
    fixFirst: 'Fix first',
    better: 'Could be better',
    good: 'Looks good',
    showGood: 'Show what is already good',
    hideGood: 'Hide',
    how: 'How to fix',
    speedTitle: 'Google PageSpeed — mobile',
    speedWait: 'Google is measuring the mobile speed… this can take up to 30 seconds.',
    speedFail: 'Google’s speed test did not answer this time; the speed score above uses our own measurements.',
    speedCats: { performance: 'Performance', accessibility: 'Accessibility', bestPractices: 'Best practices', seo: 'SEO' },
    lcp: 'Main content',
    tbt: 'Blocking time',
    cls: 'Layout shift',
    weight: 'Page weight',
    share: 'Copy link to this report',
    copied: 'Link copied',
    ctaTitle: 'Want these fixed?',
    ctaText: 'Get a free personal review: David goes through the report, tells you what matters most for your business and what it would cost — usually within 24 hours. No obligation.',
    name: 'Name',
    email: 'Email',
    phone: 'Phone (optional)',
    message: 'Anything to add? (optional)',
    messagePh: 'e.g. we get few enquiries, the site is slow on phones…',
    send: 'Request my free review',
    sending: 'Sending…',
    sent: 'Thanks! Your review request is on its way — you will get an answer by email, usually within 24 hours.',
    failed: 'It could not be sent. Please try again or write to',
    errName: 'Please add your name.',
    errEmail: 'Please add a valid email address.',
    orChat: 'Or start a full project request',
    modernize: 'See what a modernized site looks like',
    whatTitle: 'What the check looks at',
    what: {
      speed: 'Google’s own mobile speed test, plus server response time, page weight, compression, images and scripts.',
      seo: 'Everything Google reads first: title, description, headings, canonical address, language, robots.txt, sitemap, link previews and structured data.',
      mobile: 'Whether the page is built for phones, image descriptions for screen readers, the site icon and one-tap contact links.',
      security: 'HTTPS, the redirect from http, and the security headers browsers use to protect visitors.',
      care: 'Signs of an unmaintained site: an old copyright year, outdated libraries, exposed software versions, missing statistics or cookie consent.',
    },
    limits: 'An automatic check reads the home page only and cannot judge design, texts or how well the site sells — that is what the personal review is for.',
    forTitle: 'Websites for your industry',
  },
  hu: {
    kicker: 'Ingyenes weboldal-ellenőrzés',
    title: ['Mennyire jó', 'ma a', 'weboldalad?'],
    lead: 'Írd be a címet, és azonnal kapsz egy jelentést a sebességről, a Google-ben való megtalálhatóságról, a mobilbarátságról és a biztonságról — minden hibához érthető javítási javaslattal.',
    placeholder: 'weboldalad.hu',
    run: 'Ellenőrzés',
    running: 'Ellenőrzés…',
    note: 'Ingyenes, regisztráció nélkül. Kb. 10 másodperc, a Google sebességteszt legfeljebb 30.',
    try: 'Próbáld ki ezzel:',
    steps: ['Az oldal betöltése', 'HTTPS és biztonsági fejlécek', 'Címek, leírások és címsorok', 'robots.txt és oldaltérkép keresése', 'Mobilos alapok és képek', 'Pontozás'],
    errBad: 'Ez nem tűnik weboldalcímnek. Próbáld így: pelda.hu.',
    errDown: 'Az oldal nem érhető el. Ellenőrizd a címet — vagy lehet, hogy az oldal épp nem működik.',
    errService: 'Az ellenőrzés most nem érhető el. Kérlek, próbáld újra egy perc múlva.',
    scoreOf: '/ 100 pont',
    checked: 'Ellenőrizve',
    fixFirst: 'Ezt javítsd először',
    better: 'Lehetne jobb',
    good: 'Rendben van',
    showGood: 'Mutasd, mi működik már jól',
    hideGood: 'Elrejtés',
    how: 'Javítás',
    speedTitle: 'Google PageSpeed — mobil',
    speedWait: 'A Google most méri a mobilos sebességet… ez akár 30 másodpercig is tarthat.',
    speedFail: 'A Google sebességtesztje most nem válaszolt; a fenti sebességpontszám a saját méréseinkből számol.',
    speedCats: { performance: 'Teljesítmény', accessibility: 'Akadálymentesség', bestPractices: 'Bevált gyakorlatok', seo: 'SEO' },
    lcp: 'Fő tartalom',
    tbt: 'Blokkolási idő',
    cls: 'Elrendezés-ugrás',
    weight: 'Oldalsúly',
    share: 'A jelentés linkjének másolása',
    copied: 'Link kimásolva',
    ctaTitle: 'Szeretnéd, ha ezeket valaki kijavítaná?',
    ctaText: 'Kérj ingyenes személyes értékelést: Dávid átnézi a jelentést, megmondja, mi a legfontosabb a vállalkozásodnak, és mennyibe kerülne — általában 24 órán belül. Kötelezettség nélkül.',
    name: 'Név',
    email: 'E-mail',
    phone: 'Telefon (nem kötelező)',
    message: 'Hozzátennél valamit? (nem kötelező)',
    messagePh: 'pl. kevés a megkeresés, lassú mobilon az oldal…',
    send: 'Ingyenes értékelést kérek',
    sending: 'Küldés…',
    sent: 'Köszönöm! Az értékelési kérésed megérkezett — e-mailben kapsz választ, általában 24 órán belül.',
    failed: 'Nem sikerült elküldeni. Próbáld újra, vagy írj ide:',
    errName: 'Kérlek, add meg a neved.',
    errEmail: 'Kérlek, adj meg egy érvényes e-mail-címet.',
    orChat: 'Vagy indíts teljes projektmegkeresést',
    modernize: 'Nézd meg, milyen egy modernizált oldal',
    whatTitle: 'Mit vizsgál az ellenőrzés?',
    what: {
      speed: 'A Google saját mobilos sebességtesztje, valamint a szerver válaszideje, az oldalsúly, a tömörítés, a képek és a szkriptek.',
      seo: 'Minden, amit a Google először elolvas: cím, leírás, címsorok, kanonikus cím, nyelv, robots.txt, oldaltérkép, linkelőnézet és strukturált adatok.',
      mobile: 'Mobilra készült-e az oldal, vannak-e képleírások a képernyőolvasóknak, oldalikon és egy érintéssel hívható elérhetőség.',
      security: 'HTTPS, átirányítás a http-ről, és a biztonsági fejlécek, amelyekkel a böngészők a látogatókat védik.',
      care: 'Az elhanyagolt oldal jelei: régi évszám a láblécben, elavult programkönyvtárak, látható szoftververzió, hiányzó statisztika vagy süti-hozzájárulás.',
    },
    limits: 'Az automatikus ellenőrzés csak a kezdőlapot nézi, és nem tudja megítélni a designt, a szövegeket vagy azt, hogy mennyire jól ad el az oldal — erre való a személyes értékelés.',
    forTitle: 'Weboldalak a te iparágadnak',
  },
};

const STATUS_COLOR: Record<Status, string> = { pass: '#3ccf7a', warn: '#f2b33d', fail: 'rgb(var(--c-accent))' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const host = (u: string) => {
  try {
    return new URL(u).host.replace(/^www\./, '');
  } catch {
    return u;
  }
};
const looksLikeUrl = (s: string) => /^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(s.trim());

export default function WebsiteCheck() {
  const { lang, lp } = useI18n();
  const t = T[lang];
  useSeo({ ...CHECK_SEO[lang], path: '/website-check/', image: `/og/website-check.${lang}.png` });

  const [params, setParams] = useSearchParams();
  const target = params.get('url') ?? '';
  const [input, setInput] = useState(target);
  const [facts, setFacts] = useState<Facts | null>(null);
  const [speed, setSpeed] = useState<Speed | null>(null);
  const [speedState, setSpeedState] = useState<'idle' | 'wait' | 'done' | 'fail'>('idle');
  const [state, setState] = useState<'idle' | 'run' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [showGood, setShowGood] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // the address in the URL is the source of truth: a shared link runs the check by itself
  useEffect(() => {
    setInput(target);
    if (!target) return;
    if (!looksLikeUrl(target)) {
      setState('error');
      setError(t.errBad);
      return;
    }
    let live = true;
    setState('run');
    setFacts(null);
    setSpeed(null);
    setSpeedState('wait');
    setError('');
    setStep(0);
    const ticker = window.setInterval(() => setStep((s) => Math.min(s + 1, t.steps.length - 1)), 900);
    const q = encodeURIComponent(target.trim());
    fetch(`${site.checkEndpoint}/check?url=${q}`)
      .then(async (r) => ({ ok: r.ok, data: (await r.json()) as Facts }))
      .then(({ data }) => {
        if (!live) return;
        if (data.error) {
          setState('error');
          setError(data.error === 'bad-url' ? t.errBad : data.error === 'unreachable' ? t.errDown : t.errService);
          return;
        }
        setFacts(data);
        setState('done');
        window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      })
      .catch(() => {
        if (!live) return;
        setState('error');
        setError(t.errService);
      })
      .finally(() => window.clearInterval(ticker));
    fetch(`${site.checkEndpoint}/speed?url=${q}`)
      .then((r) => r.json() as Promise<Speed>)
      .then((d) => {
        if (!live) return;
        if (d.error || d.performance == null) setSpeedState('fail');
        else {
          setSpeed(d);
          setSpeedState('done');
        }
      })
      .catch(() => live && setSpeedState('fail'));
    return () => {
      live = false;
      window.clearInterval(ticker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const report = useMemo(() => (facts ? evaluate(facts, speed) : null), [facts, speed]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!looksLikeUrl(v)) {
      setState('error');
      setError(t.errBad);
      return;
    }
    const next = new URLSearchParams(params);
    next.set('url', v.replace(/^https?:\/\//i, '').replace(/\/$/, ''));
    setParams(next, { replace: false, preventScrollReset: true });
  };

  return (
    <Section id="website-check" className="pt-28 lg:pt-32">
      {/* hero + form */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <div className="label mb-4">// {t.kicker}</div>
          <h1 className="display text-[clamp(2.6rem,10vw,5.4rem)] leading-[0.9]">
            {t.title.map((line, i) => (
              <span key={i} className={cx('block', i === 1 && 'text-muted')}>
                {line}
                {i === t.title.length - 1 && <span className="ml-1 inline-block h-[0.16em] w-[0.16em] bg-accent align-baseline" />}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-[56ch] text-[15.5px] leading-relaxed text-muted">{t.lead}</p>
        </div>
        <form onSubmit={submit} className="relative border border-line-strong bg-surface p-5 sm:p-6">
          <CornerMarks />
          <label htmlFor="wc-url" className="label mb-2 block">
            URL
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-2 border border-line-strong bg-bg px-3 focus-within:border-accent">
              <span className="font-mono text-[13px] text-accent" aria-hidden>
                https://
              </span>
              <input
                id="wc-url"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                className="h-12 min-w-0 flex-1 bg-transparent font-mono text-[15px] text-text outline-none placeholder:text-dim"
              />
            </div>
            <button type="submit" disabled={state === 'run'} data-cursor="follow" className="h-12 bg-accent px-6 font-mono text-[12.5px] font-semibold uppercase tracking-tech text-onaccent transition-colors hover:bg-text disabled:opacity-60">
              {state === 'run' ? t.running : `${t.run} →`}
            </button>
          </div>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-dim">{t.note}</p>
          {!target && (
            <p className="mt-2 font-mono text-[11px] text-muted">
              {t.try}{' '}
              <button type="button" onClick={() => setParams({ url: 'softwaredevelopment.hu' })} className="text-accent underline-offset-4 hover:underline" data-cursor="follow">
                softwaredevelopment.hu
              </button>
            </p>
          )}
        </form>
      </div>

      {/* progress */}
      {state === 'run' && (
        <div className="mt-10 border border-line bg-surface p-5 font-mono text-[12.5px] leading-7" aria-live="polite">
          <div className="text-muted">$ check {host(`https://${target}`)}</div>
          {t.steps.slice(0, step + 1).map((s, i) => (
            <div key={i} className={i === step ? 'text-text' : 'text-muted'}>
              <span className={i === step ? 'text-accent' : 'text-[#3ccf7a]'}>{i === step ? '›' : '✓'}</span> {s}
              {i === step && <span className="ml-1 animate-blink">_</span>}
            </div>
          ))}
        </div>
      )}
      {state === 'error' && <p className="mt-8 border border-accent bg-surface p-4 text-[14.5px] text-text">{error}</p>}

      {/* the report */}
      {state === 'done' && facts && report && (
        <div ref={resultRef} className="mt-12 scroll-mt-28 space-y-6">
          <Summary report={report} facts={facts} lang={lang} t={t} />
          <SpeedCard speed={speed} state={speedState} t={t} />
          <Findings report={report} lang={lang} t={t} showGood={showGood} setShowGood={setShowGood} />
          <ReviewForm report={report} facts={facts} speed={speed} lang={lang} t={t} lp={lp} />
        </div>
      )}

      {/* always: what is checked, and links on */}
      <div className="mt-20 grid gap-10 border-t border-line pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 className="display text-[clamp(1.6rem,6vw,2.4rem)] leading-[0.95]">{t.whatTitle}</h2>
          <dl className="mt-6 space-y-4">
            {CATS.map((c) => (
              <div key={c} className="border-l-2 border-line-strong pl-4">
                <dt className="font-mono text-[11.5px] uppercase tracking-tech text-accent">{CAT_NAMES[c][lang]}</dt>
                <dd className="mt-1 text-[14px] leading-relaxed text-muted">{t.what[c]}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[13px] leading-relaxed text-dim">{t.limits}</p>
        </div>
        <div>
          <h2 className="display text-[clamp(1.6rem,6vw,2.4rem)] leading-[0.95]">{t.forTitle}</h2>
          <ul className="mt-6 grid gap-2">
            {featuredIndustries.map((ind) => (
              <li key={ind.slug}>
                <Link to={lp(`/industries/${ind.slug}/`)} data-cursor="follow" className="group flex items-center justify-between border border-line bg-surface px-4 py-3 transition-colors hover:border-accent">
                  <span>
                    <span className="block font-display text-[16px] font-extrabold uppercase leading-tight text-text">{ind.nav[lang]}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">{ind.hero.short[lang]}</span>
                  </span>
                  <span className="font-mono text-[13px] text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">→</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to={lp('/industries/')} data-cursor="follow" className="group flex items-center justify-between border border-line px-4 py-3 transition-colors hover:border-accent">
                <span className="font-mono text-[12px] uppercase tracking-tech text-text">{lang === 'hu' ? 'Összes iparág' : 'All industries'}</span>
                <span className="font-mono text-[13px] text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">→</span>
              </Link>
            </li>
            <li>
              <Link to={lp('/modernization/')} data-cursor="follow" className="group flex items-center justify-between border border-line px-4 py-3 transition-colors hover:border-accent">
                <span className="font-mono text-[12px] uppercase tracking-tech text-text">{t.modernize}</span>
                <span className="font-mono text-[13px] text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">→</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

type Txt = (typeof T)['en'];

function Summary({ report, facts, lang, t }: { report: Report; facts: Facts; lang: 'en' | 'hu'; t: Txt }) {
  const [copied, setCopied] = useState(false);
  const color = report.score >= 75 ? '#3ccf7a' : report.score >= 50 ? '#f2b33d' : 'rgb(var(--c-accent))';
  const top = report.results.filter((r) => r.status === 'fail').sort((a, b) => b.weight - a.weight).slice(0, 3);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="relative grid gap-6 border border-line-strong bg-surface p-5 sm:p-7 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <CornerMarks />
      <div className="flex items-center gap-5 lg:flex-col lg:items-start">
        <div className="relative grid h-32 w-32 shrink-0 place-items-center">
          <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--c-line-strong))" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${(report.score / 100) * 326.7} 326.7`} className="transition-[stroke-dasharray] duration-1000" />
          </svg>
          <div className="text-center">
            <div className="font-display text-[44px] font-extrabold leading-none text-text">{report.score}</div>
            <div className="font-mono text-[10px] uppercase tracking-tech text-muted">{t.scoreOf}</div>
          </div>
        </div>
        <div>
          <div className="font-display text-[56px] font-extrabold leading-none" style={{ color }}>
            {report.grade}
          </div>
          <p className="mt-1 max-w-[24ch] text-[13.5px] leading-snug text-muted">{GRADE_TEXT[report.grade][lang]}</p>
        </div>
      </div>
      <div className="min-w-0">
        <div className="label">// {t.checked}</div>
        <a href={facts.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 block truncate font-mono text-[15px] text-text underline-offset-4 hover:text-accent hover:underline">
          {host(facts.url)}
        </a>
        <div className="mt-5 space-y-3">
          {CATS.map((c) => {
            const v = report.cats[c];
            if (v == null) return null;
            return (
              <div key={c}>
                <div className="flex justify-between font-mono text-[11px] uppercase tracking-tech">
                  <span className="text-muted">{CAT_NAMES[c][lang]}</span>
                  <span className="text-text">{v}</span>
                </div>
                <div className="mt-1 h-1.5 bg-line-strong">
                  <div className="h-full transition-[width] duration-700" style={{ width: `${v}%`, background: v >= 75 ? '#3ccf7a' : v >= 50 ? '#f2b33d' : 'rgb(var(--c-accent))' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="min-w-0">
        <div className="label">// {t.fixFirst}</div>
        <ol className="mt-3 space-y-3">
          {(top.length ? top : report.results.filter((r) => r.status === 'warn').slice(0, 3)).map((r, i) => (
            <li key={r.id} className="flex gap-3">
              <span className="font-mono text-[12px] text-accent">0{i + 1}</span>
              <div>
                <div className="text-[14.5px] font-semibold leading-snug text-text">{CHECKS[r.id].name[lang]}</div>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{CHECKS[r.id].bad[lang]}</p>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" onClick={copy} data-cursor="follow" className="mt-5 font-mono text-[11px] uppercase tracking-tech text-muted underline-offset-4 hover:text-accent hover:underline">
          {copied ? `✓ ${t.copied}` : `⧉ ${t.share}`}
        </button>
      </div>
    </div>
  );
}

function SpeedCard({ speed, state, t }: { speed: Speed | null; state: string; t: Txt }) {
  if (state === 'idle') return null;
  const dial = (label: string, v: number | null) => {
    const c = v == null ? 'rgb(var(--c-line-strong))' : v >= 90 ? '#3ccf7a' : v >= 50 ? '#f2b33d' : 'rgb(var(--c-accent))';
    return (
      <div key={label} className="flex flex-col items-center gap-2">
        <div className="relative grid h-[72px] w-[72px] place-items-center">
          <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgb(var(--c-line-strong))" strokeWidth="6" />
            {v != null && <circle cx="40" cy="40" r="34" fill="none" stroke={c} strokeWidth="6" strokeDasharray={`${(v / 100) * 213.6} 213.6`} />}
          </svg>
          <span className="font-display text-[22px] font-extrabold text-text">{v ?? '–'}</span>
        </div>
        <span className="text-center font-mono text-[10.5px] uppercase tracking-tech text-muted">{label}</span>
      </div>
    );
  };
  return (
    <div className="border border-line bg-surface p-5 sm:p-6">
      <div className="label">// {t.speedTitle}</div>
      {state === 'wait' && (
        <p className="mt-3 flex items-center gap-3 text-[14px] text-muted">
          <span className="support-dot inline-block h-2 w-2 bg-accent" aria-hidden />
          {t.speedWait}
        </p>
      )}
      {state === 'fail' && <p className="mt-3 text-[14px] text-muted">{t.speedFail}</p>}
      {state === 'done' && speed && (
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-4 gap-3 sm:gap-6">
            {dial(t.speedCats.performance, speed.performance)}
            {dial(t.speedCats.accessibility, speed.accessibility)}
            {dial(t.speedCats.bestPractices, speed.bestPractices)}
            {dial(t.speedCats.seo, speed.seo)}
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-[12px] sm:grid-cols-4 lg:grid-cols-2">
            {[
              [t.lcp, speed.lcp != null ? `${(speed.lcp / 1000).toFixed(1)} s` : '–'],
              [t.tbt, speed.tbt != null ? `${Math.round(speed.tbt)} ms` : '–'],
              [t.cls, speed.cls != null ? speed.cls.toFixed(2) : '–'],
              [t.weight, speed.weight != null ? `${(speed.weight / 1_000_000).toFixed(1)} MB` : '–'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="uppercase tracking-tech text-muted">{k}</dt>
                <dd className="text-[15px] text-text">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

function Row({ r, lang, t }: { r: Result; lang: 'en' | 'hu'; t: Txt }) {
  const c = CHECKS[r.id];
  return (
    <li className="grid grid-cols-[18px_minmax(0,1fr)] gap-3 border-b border-line py-4 last:border-0">
      <span className="mt-1.5 h-2.5 w-2.5" style={{ background: STATUS_COLOR[r.status] }} aria-label={r.status} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="text-[15px] font-semibold text-text">{c.name[lang]}</span>
          {r.value && <span className="font-mono text-[12px] text-muted">{r.value}</span>}
        </div>
        {r.status !== 'pass' && (
          <>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">{c.bad[lang]}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text">
              <span className="mr-2 font-mono text-[10.5px] uppercase tracking-tech text-accent">{t.how}</span>
              {c.fix[lang]}
            </p>
          </>
        )}
      </div>
    </li>
  );
}

function Findings({ report, lang, t, showGood, setShowGood }: { report: Report; lang: 'en' | 'hu'; t: Txt; showGood: boolean; setShowGood: (v: boolean) => void }) {
  const by = (s: Status) => report.results.filter((r) => r.status === s).sort((a, b) => b.weight - a.weight);
  const groups: Array<[Status, string]> = [
    ['fail', t.fixFirst],
    ['warn', t.better],
  ];
  const good = by('pass');
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {groups.map(([s, title]) => {
        const list = by(s);
        if (!list.length) return null;
        return (
          <div key={s} className="border border-line bg-surface px-5 pt-5 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5" style={{ background: STATUS_COLOR[s] }} aria-hidden />
              <span className="font-mono text-[11.5px] uppercase tracking-tech text-text">
                {title} · {list.length}
              </span>
            </div>
            <ul className="mt-1">
              {list.map((r) => (
                <Row key={r.id} r={r} lang={lang} t={t} />
              ))}
            </ul>
          </div>
        );
      })}
      <div className="border border-line px-5 py-4 sm:px-6 lg:col-span-2">
        <button type="button" onClick={() => setShowGood(!showGood)} aria-expanded={showGood} data-cursor="follow" className="flex w-full items-center justify-between font-mono text-[11.5px] uppercase tracking-tech text-text">
          <span className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5" style={{ background: STATUS_COLOR.pass }} aria-hidden />
            {t.good} · {good.length}
          </span>
          <span className="text-muted">{showGood ? t.hideGood : t.showGood}</span>
        </button>
        {showGood && (
          <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
            {good.map((r) => (
              <Row key={r.id} r={r} lang={lang} t={t} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ReviewForm({ report, facts, speed, lang, t, lp }: { report: Report; facts: Facts; speed: Speed | null; lang: 'en' | 'hu'; t: Txt; lp: (p: string) => string }) {
  const [v, setV] = useState({ name: '', email: '', phone: '', message: '', honey: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');
  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!v.name.trim()) return setErr(t.errName);
    if (!EMAIL.test(v.email.trim())) return setErr(t.errEmail);
    setErr('');
    if (v.honey) return setStatus('sent');
    setStatus('sending');
    const issues = report.results
      .filter((r) => r.status !== 'pass')
      .sort((a, b) => (a.status === b.status ? b.weight - a.weight : a.status === 'fail' ? -1 : 1))
      .map((r) => `${r.status === 'fail' ? '✗' : '!'} ${CHECKS[r.id].name[lang]}${r.value ? ` (${r.value})` : ''}`)
      .join('\n');
    try {
      const res = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: site.formAccessKey,
          from_name: 'softwaredevelopment.hu · website check',
          subject: `Website check review — ${host(facts.url)} (${report.score}/100, ${report.grade})`,
          name: v.name.trim(),
          email: v.email.trim(),
          phone: v.phone.trim() || '—',
          checked_site: facts.url,
          score: `${report.score}/100 (${report.grade})`,
          categories: CATS.map((c) => `${CAT_NAMES[c].en}: ${report.cats[c] ?? '–'}`).join(' · '),
          pagespeed_mobile: speed?.performance != null ? `${speed.performance}/100, LCP ${speed.lcp != null ? (speed.lcp / 1000).toFixed(1) : '–'} s` : '—',
          issues,
          message: v.message.trim() || '—',
          report_link: window.location.href,
          language: lang,
          replyto: v.email.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      setStatus(res.ok && String(data.success) === 'true' ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };
  const field = 'h-11 w-full border border-line-strong bg-bg px-3 font-mono text-[14px] text-text outline-none placeholder:text-dim focus:border-accent';
  return (
    <div className="relative grid gap-8 border border-accent/70 bg-surface p-5 sm:p-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <CornerMarks />
      <div>
        <div className="label">// {lang === 'hu' ? 'Személyes értékelés' : 'Personal review'}</div>
        <h2 className="display mt-2 text-[clamp(1.7rem,6vw,2.6rem)] leading-[0.95]">{t.ctaTitle}</h2>
        <p className="mt-4 max-w-[48ch] text-[14.5px] leading-relaxed text-muted">{t.ctaText}</p>
        <Link to={lp('/modernization/')} data-cursor="follow" className="mt-5 inline-block font-mono text-[11.5px] uppercase tracking-tech text-text underline-offset-4 hover:text-accent hover:underline">
          {t.modernize} →
        </Link>
      </div>
      {status === 'sent' ? (
        <p className="self-center border border-[#3ccf7a]/60 p-4 text-[15px] leading-relaxed text-text">
          <span className="mr-2 font-mono text-[#3ccf7a]">✓</span>
          {t.sent}
        </p>
      ) : (
        <form onSubmit={send} className="grid gap-3 sm:grid-cols-2" noValidate>
          <input name="botcheck" value={v.honey} onChange={(e) => setV({ ...v, honey: e.target.value })} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <label className="block">
            <span className="label mb-1 block">{t.name}</span>
            <input className={field} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoComplete="name" />
          </label>
          <label className="block">
            <span className="label mb-1 block">{t.email}</span>
            <input className={field} type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} autoComplete="email" />
          </label>
          <label className="block sm:col-span-2">
            <span className="label mb-1 block">{t.phone}</span>
            <input className={field} type="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} autoComplete="tel" />
          </label>
          <label className="block sm:col-span-2">
            <span className="label mb-1 block">{t.message}</span>
            <textarea className={cx(field, 'h-24 py-2')} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} placeholder={t.messagePh} maxLength={1500} />
          </label>
          {err && <p className="text-[13.5px] text-accent sm:col-span-2">{err}</p>}
          {status === 'error' && (
            <p className="text-[13.5px] text-accent sm:col-span-2">
              {t.failed}{' '}
              <a href={`mailto:${site.email}`} className="underline">
                {site.email}
              </a>
            </p>
          )}
          <button type="submit" disabled={status === 'sending'} data-cursor="follow" className="h-12 bg-accent px-6 font-mono text-[12.5px] font-semibold uppercase tracking-tech text-onaccent transition-colors hover:bg-text disabled:opacity-60 sm:col-span-2">
            {status === 'sending' ? t.sending : `${t.send} →`}
          </button>
        </form>
      )}
    </div>
  );
}
