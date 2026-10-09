import { landingBySlug } from './landings.ts';
import type { Industry } from './industries.ts';

type L10n = { en: string; hu: string; sk: string };

/** what an industry page shows as its demo, whether a landing page or a modernization case */
export interface IndustryDemo {
  name: string;
  sector: L10n;
  /** site path without the language prefix */
  path: string;
  poster?: string;
  /** true for a before-and-after modernization case */
  redesign: boolean;
}

/** the modernization cases (brands are fictional), kept here so the SEO step can read them */
const CASES: Record<string, { name: string; sector: L10n }> = {
  bakery: { name: 'Málnavirág', sector: { en: 'Confectionery — redesign', hu: 'Cukrászda — megújítás', sk: 'Cukráreň — redizajn' } },
  law: { name: 'Halmos & Rét', sector: { en: 'Law firm — redesign', hu: 'Ügyvédi iroda — megújítás', sk: 'Advokátska kancelária — redizajn' } },
  shop: { name: 'Kőmáz', sector: { en: 'Ceramics webshop — redesign', hu: 'Kerámia webshop — megújítás', sk: 'E-shop s keramikou — redizajn' } },
};

export function industryDemo(ind: Pick<Industry, 'demo'>): IndustryDemo | undefined {
  if (ind.demo.startsWith('case:')) {
    const id = ind.demo.slice(5);
    const c = CASES[id];
    if (!c) return undefined;
    return { ...c, path: `/modernization/?case=${id}`, poster: `/industries/case-${id}.webp`, redesign: true };
  }
  const l = landingBySlug(ind.demo);
  if (!l) return undefined;
  return { name: l.name, sector: l.sector, path: `/landing-pages/${l.slug}/`, poster: l.poster, redesign: false };
}
