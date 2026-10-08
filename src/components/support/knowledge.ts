import type { Lang } from '../../data/projects';
import { projects } from '../../data/projects';
import { services } from '../../data/services';
import { labs } from '../../data/labs';
import { readyLandings } from '../../data/landings';
import { listedArticles, inLang } from '../../data/articles';
import { technologies } from '../../data/technologies';
import { tracks } from '../../data/interview/tracks';
import { modules } from '../../data/courseSyllabus';
import { en } from '../../i18n/en';
import { hu } from '../../i18n/hu';
import { faqs } from './faq';
import type { Faq } from './faq';

/**
 * The assistant's searchable index, built from the same data the pages use, so a new
 * project, demo or article is known as soon as it is on the site. Only public, business
 * content goes in: no biography, career history or personal details, and client names
 * are left out of the case studies.
 */

export type Kind = 'faq' | 'service' | 'project' | 'lab' | 'landing' | 'case' | 'article' | 'tech' | 'track' | 'module';

export interface Item {
  id: string;
  kind: Kind;
  title: string;
  /** one or two sentences */
  text: string;
  /** small mono label on cards, e.g. "ARTICLE · 6 MIN" */
  meta?: string;
  /** in-app path without the language prefix */
  path?: string;
  image?: string;
  faq?: Faq;
  /** weighted search words */
  words: Map<string, number>;
}

/* ---------- text normalisation ---------- */

const STOP = new Set(
  (
    'a an the and or of to in on for with by is are be can do does did you your i me my we our it this that what which how who when where why about from at as ' +
    'have has will would could should please any some there here just want need like get tell show me im its am was were ' +
    'az egy es is vagy de hogy nem meg mar mi mit mik milyen hogyan hol mikor miert ki kit van vannak lesz lehet kell kellene szeretnek szeretnem ' +
    'en te o mi ti ok nekem neked engem teged ez ezt azt ami amit ilyen olyan sok nagyon csak mar meg itt ott akkor ha mert pedig valami valamit vele velem tudsz tudod lenne'
  ).split(' '),
);
/** short words that still carry meaning */
const KEEP = new Set(['ai', 'ui', 'ux', '3d', 'cv', 'seo', 'api', 'crm', 'erp', 'geo', 'aeo', 'rag', 'mcp', 'llm', 'sql', 'php', 'css', 'js']);

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function tokens(s: string): string[] {
  return norm(s)
    .split(' ')
    .filter((w) => (w.length > 2 && !STOP.has(w)) || KEEP.has(w));
}

/** a few everyday words mapped onto the words the content uses (both languages) */
const SYN: Record<string, string[]> = {
  hotel: ['hotel', 'szalloda', 'szallas', 'villa', 'spa', 'butikhotel', 'panzio', 'apartman'],
  szalloda: ['hotel', 'villa', 'spa', 'butikhotel'],
  szallas: ['hotel', 'villa', 'spa'],
  restaurant: ['dining', 'etterem', 'menu', 'gasztro'],
  etterem: ['dining', 'restaurant', 'menu', 'gasztro'],
  dentist: ['dental', 'fogaszat', 'klinika', 'clinic'],
  fogorvos: ['fogaszat', 'dental', 'klinika'],
  clinic: ['klinika', 'dental', 'fogaszat', 'esztetika'],
  orvos: ['klinika', 'fogaszat', 'dental'],
  winery: ['boraszat', 'wine', 'tokaj', 'bor'],
  bor: ['boraszat', 'winery', 'tokaj'],
  wine: ['winery', 'boraszat', 'tokaj'],
  realestate: ['residences', 'rezidencia', 'ingatlan'],
  ingatlan: ['residences', 'rezidencia', 'lakas'],
  apartment: ['residences', 'rezidencia'],
  architect: ['architecture', 'epiteszet', 'interiors', 'belsoepiteszet'],
  epitesz: ['architecture', 'epiteszet', 'belsoepiteszet'],
  bank: ['finance', 'banking', 'fintech', 'penzugy', 'banki'],
  penzugy: ['finance', 'fintech', 'banking', 'bank'],
  finance: ['fintech', 'banking', 'bank', 'penzugy'],
  cosmetics: ['skincare', 'borapolas'],
  kozmetikum: ['skincare', 'borapolas'],
  bike: ['bike', 'ebike'],
  bicikli: ['bike', 'ebike'],
  kerekpar: ['bike', 'ebike'],
  bakery: ['confectionery', 'cukraszda'],
  cukraszda: ['confectionery', 'bakery'],
  pekseg: ['confectionery', 'cukraszda'],
  lawyer: ['law', 'ugyvedi', 'ugyved'],
  ugyved: ['law', 'ugyvedi'],
  webshop: ['shop', 'webshop', 'ecommerce', 'commerce', 'store'],
  shop: ['webshop', 'ecommerce', 'store'],
  webaruhaz: ['webshop', 'shop', 'ecommerce'],
  site: ['website', 'weboldal', 'honlap'],
  honlap: ['weboldal', 'website'],
  weboldal: ['website', 'honlap'],
  landing: ['landing', 'bemutato'],
  configurator: ['configurator', 'konfigurator', 'designer', '3d'],
  konfigurator: ['configurator', 'designer', '3d'],
  tshirt: ['shirt', 'polo', 'hoodie'],
  polo: ['shirt', 'hoodie', 'pulover'],
  garazs: ['garage'],
  garage: ['garazs'],
  government: ['government', 'allamigazgatasi', 'kozigazgatas'],
  allam: ['government', 'allamigazgatasi'],
  report: ['reporting', 'riport', 'data'],
  riport: ['reporting', 'report'],
  accounting: ['accounting', 'konyveles', 'konyvelesi'],
  konyveles: ['accounting', 'konyvelesi'],
  photo: ['photography', 'foto', 'fotozas'],
  foto: ['photography', 'photo'],
  brand: ['brand', 'arculat', 'identity'],
  arculat: ['brand', 'identity'],
  chatbot: ['chatbot', 'assistant', 'asszisztens', 'ai'],
  mesterseges: ['ai', 'mi'],
  ar: ['price', 'cost', 'mennyibe', 'kerul'],
  arak: ['price', 'cost'],
  price: ['cost', 'mennyibe'],
  cost: ['price', 'mennyibe'],
  regi: ['legacy', 'old', 'modernizal'],
  old: ['legacy', 'modernize', 'regi'],
};

export function expand(q: string[]): string[] {
  const out = new Set(q);
  for (const w of q) for (const s of SYN[w] ?? []) out.add(s);
  return [...out];
}

function addWords(map: Map<string, number>, text: string | undefined, weight: number) {
  if (!text) return;
  for (const w of tokens(text)) map.set(w, Math.max(map.get(w) ?? 0, weight));
}

/* ---------- the index ---------- */

const PROJECT_SUMMARY_OVERRIDE: Record<string, { en: string; hu: string }> = {
  // the case study pages name the clients; the assistant describes them generically
  'bank-projects': {
    en: 'Modernization of banking platforms: core business systems and integrations developed for a Hungarian bank.',
    hu: 'Banki platformok modernizációja: üzleti rendszerek és integrációk fejlesztése egy magyar bank számára.',
  },
  'reporting-system': {
    en: 'Reporting and data solutions for a large industrial company, built inside its own laboratory information system.',
    hu: 'Riportálási és adatmegoldások egy nagy ipari vállalat számára, a vállalat saját laborinformációs rendszerén belül.',
  },
};

/** the modernization showcase (the case components themselves are heavy, so their text lives here) */
const CASES = [
  {
    id: 'bakery',
    title: { en: 'Confectionery redesign', hu: 'Cukrászda újratervezése' },
    text: {
      en: 'A neighbourhood confectionery: mega menu, a cake designer that redraws live, cart, table booking and live opening hours.',
      hu: 'Környékbeli cukrászda: megamenü, élőben rajzolódó tortatervező, kosár, asztalfoglalás és élő nyitvatartás.',
    },
    words: 'bakery confectionery cukraszda pekseg cake torta cafe kavezo restaurant etterem booking foglalas',
  },
  {
    id: 'law',
    title: { en: 'Law firm redesign', hu: 'Ügyvédi iroda újratervezése' },
    text: {
      en: 'A business law firm: clear practice areas, credibility, consultation booking and a calm, modern look.',
      hu: 'Üzleti jogi iroda: átlátható szakterületek, bizalomépítés, konzultációfoglalás és nyugodt, modern megjelenés.',
    },
    words: 'law lawyer ugyved ugyvedi jog iroda office consulting professional services szolgaltatas',
  },
  {
    id: 'shop',
    title: { en: 'Webshop redesign', hu: 'Webshop újratervezése' },
    text: {
      en: 'A handmade ceramics shop: product browsing, filters, a cart and a checkout that works well on a phone.',
      hu: 'Kézműves kerámia webshop: termékböngészés, szűrők, kosár és telefonon is kényelmes pénztár.',
    },
    words: 'shop webshop store ecommerce ceramics keramia handmade kezmuves products termek cart kosar',
  },
];

let cache: Partial<Record<Lang, Item[]>> = {};
/** how specific each word is: words found in many items count for less */
const idf: Partial<Record<Lang, Map<string, number>>> = {};

export function knowledge(lang: Lang): Item[] {
  const hit = cache[lang];
  if (hit) return hit;
  const L = <T extends { en: string; hu: string }>(v: T) => v[lang];
  const dict = lang === 'hu' ? hu : en;
  const items: Item[] = [];
  const both = (map: Map<string, number>, v: { en: string; hu: string } | undefined, w: number) => {
    if (!v) return;
    addWords(map, v.en, w);
    addWords(map, v.hu, w);
  };

  for (const f of faqs) {
    const words = new Map<string, number>();
    both(words, f.q, 2.5);
    for (const k of [...f.keys.en, ...f.keys.hu]) addWords(words, k, 3);
    items.push({ id: `faq:${f.id}`, kind: 'faq', title: L(f.q), text: L(f.a), faq: f, words });
  }

  for (const s of services) {
    const words = new Map<string, number>();
    both(words, s.title, 3);
    both(words, s.desc, 1);
    both(words, s.flow.system, 1.5);
    items.push({ id: `service:${s.id}`, kind: 'service', title: L(s.title), text: L(s.desc), meta: lang === 'hu' ? 'SZOLGÁLTATÁS' : 'SERVICE', path: '/#services', words });
  }

  for (const p of projects) {
    const words = new Map<string, number>();
    addWords(words, p.title, 3);
    both(words, p.kind, 3);
    for (const t of p.tags) addWords(words, t, 2.5);
    addWords(words, en.projects.categories[p.category], 2.5);
    addWords(words, hu.projects.categories[p.category], 2.5);
    const summary = PROJECT_SUMMARY_OVERRIDE[p.id] ?? p.summary;
    both(words, summary, 1);
    both(words, p.outcome, 0.6);
    addWords(words, 'project projects projekt projektek case study esettanulmany reference referencia work munka', 1.2);
    items.push({
      id: `project:${p.id}`,
      kind: 'project',
      title: p.kind ? `${p.title} — ${L(p.kind)}` : p.title,
      text: L(summary),
      meta: `${lang === 'hu' ? 'ESETTANULMÁNY' : 'CASE STUDY'} · ${dict.projects.categories[p.category].toUpperCase()}`,
      path: `/project/${p.id}/`,
      words,
    });
  }

  for (const lab of labs) {
    const words = new Map<string, number>();
    both(words, lab.title, 3);
    both(words, lab.tagline, 2);
    for (const t of lab.tags) addWords(words, t, 2);
    both(words, { en: lab.desc.en.split('\n')[0], hu: lab.desc.hu.split('\n')[0] }, 1);
    addWords(words, 'demo interactive interaktiv bemutato kiprobal try', 1);
    items.push({
      id: `lab:${lab.id}`,
      kind: 'lab',
      title: L(lab.title),
      text: L(lab.tagline),
      meta: lang === 'hu' ? 'INTERAKTÍV BEMUTATÓ' : 'INTERACTIVE DEMO',
      path: lab.path,
      image: ['garage', 'shirt', 'camera'].includes(lab.id) ? `/labs/${lab.id}.webp` : lab.id === 'landing' ? readyLandings[0]?.poster : undefined,
      words,
    });
  }

  for (const l of readyLandings) {
    const words = new Map<string, number>();
    addWords(words, l.name, 3);
    both(words, l.sector, 3);
    both(words, l.concept, 1);
    addWords(words, 'landing page demo design bemutato oldal weboldal website', 0.8);
    items.push({
      id: `landing:${l.slug}`,
      kind: 'landing',
      title: l.name,
      text: `${L(l.sector)} — ${L(l.concept)}`,
      meta: lang === 'hu' ? 'BEMUTATÓ OLDAL' : 'LANDING PAGE',
      path: `/landing-pages/${l.slug}/`,
      image: l.poster,
      words,
    });
  }

  for (const c of CASES) {
    const words = new Map<string, number>();
    both(words, c.title, 3);
    both(words, c.text, 1);
    addWords(words, c.words, 2);
    addWords(words, 'modernization modernizalas redesign ujratervezes old regi before after elotte utana', 2);
    items.push({
      id: `case:${c.id}`,
      kind: 'case',
      title: L(c.title),
      text: L(c.text),
      meta: lang === 'hu' ? 'MODERNIZÁLÁS' : 'MODERNIZATION',
      path: '/modernization/',
      words,
    });
  }

  for (const a of listedArticles()) {
    const v = a.versions[lang] ?? inLang(a, lang);
    if (!v) continue;
    const words = new Map<string, number>();
    addWords(words, v.title, 2.2);
    for (const t of v.tags) addWords(words, t, 2);
    addWords(words, v.description, 0.8);
    // the other language's title helps a Hungarian query find an English-only article and vice versa
    const other = a.versions[lang === 'hu' ? 'en' : 'hu'];
    if (other) addWords(words, other.title, 1.2);
    items.push({
      id: `article:${a.slug}`,
      kind: 'article',
      title: v.title,
      text: v.description,
      meta: `${lang === 'hu' ? 'CIKK' : 'ARTICLE'} · ${v.minutes} MIN`,
      path: `/articles/${a.slug}/`,
      image: v.image,
      words,
    });
  }

  for (const t of technologies) {
    const words = new Map<string, number>();
    addWords(words, t.name, 4);
    addWords(words, t.id, 4);
    const used = projects.filter((p) => p.tags.some((tag) => norm(tag).includes(norm(t.name)) || norm(tag) === t.id));
    const list = used.map((p) => p.title).join(', ');
    items.push({
      id: `tech:${t.id}`,
      kind: 'tech',
      title: t.name,
      text:
        lang === 'hu'
          ? `Igen, a(z) ${t.name} része a használt technológiáknak.${list ? ` Projektek, ahol szerepel: ${list}.` : ''}`
          : `Yes — ${t.name} is part of the stack.${list ? ` Projects that use it: ${list}.` : ''}`,
      meta: lang === 'hu' ? 'TECHNOLÓGIA' : 'TECHNOLOGY',
      path: '/#stack',
      words,
    });
  }

  for (const tr of tracks) {
    const words = new Map<string, number>();
    both(words, tr.title, 2);
    for (const t of tr.tags) addWords(words, t, 1);
    addWords(words, 'interview interju practice gyakorlas questions kerdesek', 1.5);
    items.push({
      id: `track:${tr.id}`,
      kind: 'track',
      title: `${lang === 'hu' ? 'Interjú' : 'Interview'}: ${L(tr.title)}`,
      text: L(tr.text),
      meta: lang === 'hu' ? 'INTERJÚ-SZIMULÁTOR' : 'INTERVIEW SIMULATOR',
      path: `/interview/${tr.id}/`,
      words,
    });
  }

  for (const m of modules) {
    const words = new Map<string, number>();
    both(words, m.title, 2);
    both(words, m.summary, 0.8);
    addWords(words, 'course kurzus learn tanul lesson lecke', 1.5);
    items.push({
      id: `module:${m.id}`,
      kind: 'module',
      title: `${lang === 'hu' ? 'Kurzus' : 'Course'} ${m.num}: ${L(m.title)}`,
      text: L(m.summary),
      meta: lang === 'hu' ? 'FULL-STACK KURZUS' : 'FULL-STACK COURSE',
      path: '/course/',
      words,
    });
  }

  const df = new Map<string, number>();
  for (const it of items) for (const w of it.words.keys()) df.set(w, (df.get(w) ?? 0) + 1);
  const n = items.length;
  idf[lang] = new Map([...df].map(([w, d]) => [w, 0.45 + 0.55 * (Math.log(n / d) / Math.log(n))]));
  cache = { ...cache, [lang]: items };
  return items;
}

/* ---------- search ---------- */

const KIND_BOOST: Record<Kind, number> = {
  faq: 1.25,
  service: 1,
  project: 1,
  lab: 1.05,
  landing: 1,
  case: 0.95,
  article: 0.9,
  tech: 1.1,
  track: 0.75,
  module: 0.7,
};

function wordScore(q: string, w: string): number {
  if (q === w) return 1;
  if (q.length >= 4 && w.length >= 4) {
    // Hungarian endings and English plurals: "weboldalt" ~ "weboldal", "projects" ~ "project"
    const [s, l] = q.length <= w.length ? [q, w] : [w, q];
    if (l.startsWith(s) && l.length - s.length <= 5) return 0.75;
    if (s.length >= 5 && l.startsWith(s.slice(0, -1))) return 0.55;
  }
  return 0;
}

export interface Hit {
  item: Item;
  score: number;
  /** share of the visitor's words this item matched (0–1) */
  coverage: number;
}

export function search(lang: Lang, query: string, kinds?: Kind[]): Hit[] {
  const base = tokens(query);
  if (!base.length) return [];
  // each typed word with its synonyms; a group counts once
  const groups = base.map((w) => [w, ...(SYN[w] ?? [])]);
  const hits: Hit[] = [];
  const all = knowledge(lang);
  const spec = idf[lang]!;
  for (const item of all) {
    if (kinds && !kinds.includes(item.kind)) continue;
    let score = 0;
    let matched = 0;
    for (const g of groups) {
      let best = 0;
      for (const qw of g) {
        for (const [w, weight] of item.words) {
          const s = wordScore(qw, w);
          if (s) best = Math.max(best, s * weight * (spec.get(w) ?? 1));
        }
      }
      if (best) matched++;
      score += best;
    }
    if (!score) continue;
    // several different words matching beats one strong match
    score *= KIND_BOOST[item.kind] * (1 + 0.15 * (matched - 1));
    hits.push({ item, score, coverage: matched / groups.length });
  }
  return hits.sort((a, b) => b.score - a.score);
}

export const byKind = (lang: Lang, kind: Kind) => knowledge(lang).filter((i) => i.kind === kind);
export const faqItem = (lang: Lang, id: string) => knowledge(lang).find((i) => i.id === `faq:${id}`);
export const itemById = (lang: Lang, id: string) => knowledge(lang).find((i) => i.id === id);
