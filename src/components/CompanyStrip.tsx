import { useI18n } from '../i18n';

/**
 * Companies David has worked with, as a quiet strip of name wordmarks under the hero.
 * Set in one uniform style rather than the companies' own logos; a real logo file can
 * replace a name later (`logo` below) — keep it monochrome so the strip stays calm.
 */
const COMPANIES: { name: string; years: string; logo?: string }[] = [
  { name: 'Tricise', years: '2025 —' },
  { name: 'Capture Europe', years: '2025 —' },
  { name: 'United Consult', years: '2024 — 2025' },
  { name: 'ICZ a.s.', years: '2022 — 2023' },
  { name: 'MOL Group', years: '2019 — 2020' },
];

const LABEL = {
  en: 'Companies I have worked with',
  hu: 'Cégek, amelyekkel dolgoztam',
  sk: 'Firmy, s ktorými som spolupracoval',
};

export default function CompanyStrip() {
  const { lang } = useI18n();
  return (
    <section aria-label={LABEL[lang]} className="company-strip border-y border-line">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:gap-12 lg:px-12 lg:py-10">
        <p className="label shrink-0 lg:w-[220px]">
          <span className="text-accent">//</span> {LABEL[lang]}
        </p>
        <ul className="grid flex-1 grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:flex lg:items-center lg:justify-between lg:gap-8">
          {COMPANIES.map((c) => (
            <li key={c.name} className="group min-w-0">
              {c.logo ? (
                <img src={c.logo} alt={c.name} className="h-7 w-auto opacity-60 grayscale transition-opacity duration-300 group-hover:opacity-100" />
              ) : (
                <span className="block whitespace-nowrap font-display text-[clamp(1.05rem,2.2vw,1.45rem)] font-extrabold uppercase leading-none tracking-tight text-muted transition-colors duration-300 group-hover:text-text">
                  {c.name}
                </span>
              )}
              <span className="mt-1.5 block font-mono text-[10.5px] tracking-tech text-dim">{c.years}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
