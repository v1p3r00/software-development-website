import type { L10n, Lang, VisualKey } from '../../data/projects';
import { LANGS, projects } from '../../data/projects';
import { services } from '../../data/services';
import { labs } from '../../data/labs';
import { readyLandings } from '../../data/landings';
import { listedArticles, inLang } from '../../data/articles';
import { technologies } from '../../data/technologies';
import { tracks } from '../../data/interview/tracks';
import { modules } from '../../data/courseSyllabus';
import { en } from '../../i18n/en';
import { hu } from '../../i18n/hu';
import { sk } from '../../i18n/sk';
import { faqs } from './faq';
import { industryDemo } from '../../data/industryDemo';
import { industries } from '../../data/industries';
import type { Faq } from './faq';

/**
 * The assistant's searchable index, built from the same data the pages use, so a new
 * project, demo or article is known as soon as it is on the site. Only public, business
 * content goes in: no biography, career history or personal details, and client names
 * are left out of the case studies.
 */

export type Kind = 'faq' | 'service' | 'project' | 'lab' | 'landing' | 'case' | 'article' | 'tech' | 'track' | 'module' | 'industry';

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
  /** case studies: the same wireframe schematic their cards use on the site */
  visual?: VisualKey;
  /** demos without a photo: their line icon (LabIcon id) */
  icon?: string;
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
    'en te o mi ti ok nekem neked engem teged ez ezt azt ami amit ilyen olyan sok nagyon csak mar meg itt ott akkor ha mert pedig valami valamit vele velem tudsz tudod lenne ' +
    'ako aky aka ake akych kde kedy preco kto koho comu cim mam mate mame moze mozem mozete mozes viete vies chcem chceme chcel chcela potrebujem potrebujeme ' +
    'som ste sme bude budem budete bol bola bolo tak tiez ale alebo lebo ked ten tento tato toto tie tej toho tomu tym ich jeho jej vas vam nam nas pre pri pod nad ' +
    'bez pred este len uz velmi trochu nieco nejaky nejaka nejake prosim ahoj dakujem dobry den mna mne tebe teba sa si'
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

/** a few everyday words mapped onto the words the content uses (all languages) */
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
  ubytovanie: ['hotel', 'villa', 'spa', 'butikhotel'],
  penzion: ['hotel', 'villa', 'spa'],
  restauracia: ['dining', 'restaurant', 'etterem', 'menu', 'gastro'],
  restauraciu: ['dining', 'restaurant', 'etterem', 'menu'],
  zubar: ['dental', 'fogaszat', 'klinika', 'clinic', 'zubna'],
  zubna: ['dental', 'fogaszat', 'klinika', 'clinic'],
  lekar: ['klinika', 'clinic', 'dental'],
  ambulancia: ['klinika', 'clinic', 'dental'],
  vinarstvo: ['winery', 'wine', 'boraszat', 'tokaj'],
  vino: ['winery', 'boraszat', 'tokaj', 'vinarstvo'],
  nehnutelnost: ['residences', 'rezidencia', 'realestate', 'reality'],
  nehnutelnosti: ['residences', 'rezidencia', 'realestate', 'reality'],
  reality: ['residences', 'rezidencia', 'nehnutelnosti'],
  architekt: ['architecture', 'architektura', 'interiors', 'interier'],
  banka: ['finance', 'banking', 'fintech', 'bankove', 'bank'],
  financie: ['finance', 'fintech', 'banking', 'bank'],
  kozmetika: ['skincare', 'starostlivost', 'pletu'],
  bicykel: ['bike', 'ebike'],
  cukraren: ['confectionery', 'bakery', 'cukraszda'],
  pekaren: ['confectionery', 'bakery', 'cukraren'],
  advokat: ['law', 'lawyer', 'advokatska', 'pravo'],
  pravnik: ['law', 'lawyer', 'advokatska', 'pravo'],
  eshop: ['webshop', 'shop', 'ecommerce', 'store'],
  obchod: ['webshop', 'shop', 'ecommerce', 'store', 'eshop'],
  web: ['website', 'webstranka', 'stranka'],
  webstranka: ['website', 'web'],
  stranka: ['website', 'web', 'webstranka'],
  tricko: ['shirt', 'hoodie', 'mikina'],
  mikina: ['hoodie', 'shirt', 'tricko'],
  garaz: ['garage', 'garazs'],
  statna: ['government', 'allamigazgatasi', 'statnu'],
  statnu: ['government', 'allamigazgatasi', 'statna'],
  uctovnictvo: ['accounting', 'uctovny', 'konyveles'],
  fotografia: ['photography', 'photo', 'foto'],
  fotka: ['photography', 'photo', 'foto'],
  znacka: ['brand', 'identity', 'identita'],
  identita: ['brand', 'identity'],
  umela: ['ai', 'inteligencia'],
  cena: ['price', 'cost', 'kolko', 'stoji'],
  ceny: ['price', 'cost', 'kolko'],
  kolko: ['price', 'cost', 'cena'],
  stary: ['legacy', 'old', 'modernize', 'modernizacia'],
  zastarany: ['legacy', 'old', 'modernize', 'modernizacia'],
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

const PROJECT_SUMMARY_OVERRIDE: Record<string, L10n> = {
  // the case study pages name the clients; the assistant describes them generically
  'bank-projects': {
    en: 'Modernization of banking platforms: core business systems and integrations developed for a Hungarian bank.',
    hu: 'Banki platformok modernizációja: üzleti rendszerek és integrációk fejlesztése egy magyar bank számára.',
    sk: 'Modernizácia bankových platforiem: vývoj kľúčových podnikových systémov a integrácií pre maďarskú banku.',
  },
  'reporting-system': {
    en: 'Reporting and data solutions for a large industrial company, built inside its own laboratory information system.',
    hu: 'Riportálási és adatmegoldások egy nagy ipari vállalat számára, a vállalat saját laborinformációs rendszerén belül.',
    sk: 'Reportingové a dátové riešenia pre veľkú priemyselnú spoločnosť, vytvorené priamo v jej vlastnom laboratórnom informačnom systéme.',
  },
};

/** the modernization showcase (the case components themselves are heavy, so their text lives here) */
const CASES = [
  {
    id: 'bakery',
    title: { en: 'Confectionery redesign', hu: 'Cukrászda újratervezése', sk: 'Redizajn cukrárne' },
    text: {
      en: 'A neighbourhood confectionery: mega menu, a cake designer that redraws live, cart, table booking and live opening hours.',
      hu: 'Környékbeli cukrászda: megamenü, élőben rajzolódó tortatervező, kosár, asztalfoglalás és élő nyitvatartás.',
      sk: 'Susedská cukráreň: mega menu, návrhár tort, ktorý sa prekresľuje naživo, košík, rezervácia stola a aktuálne otváracie hodiny.',
    },
    words: 'bakery confectionery cukraszda pekseg cake torta cafe kavezo restaurant etterem booking foglalas cukraren pekaren kaviaren restauracia rezervacia',
  },
  {
    id: 'law',
    title: { en: 'Law firm redesign', hu: 'Ügyvédi iroda újratervezése', sk: 'Redizajn advokátskej kancelárie' },
    text: {
      en: 'A business law firm: clear practice areas, credibility, consultation booking and a calm, modern look.',
      hu: 'Üzleti jogi iroda: átlátható szakterületek, bizalomépítés, konzultációfoglalás és nyugodt, modern megjelenés.',
      sk: 'Kancelária obchodného práva: prehľadné oblasti práva, budovanie dôvery, rezervácia konzultácie a pokojný, moderný vzhľad.',
    },
    words: 'law lawyer ugyved ugyvedi jog iroda office consulting professional services szolgaltatas advokat advokatska pravnik pravo kancelaria poradenstvo sluzby',
  },
  {
    id: 'shop',
    title: { en: 'Webshop redesign', hu: 'Webshop újratervezése', sk: 'Redizajn e-shopu' },
    text: {
      en: 'A handmade ceramics shop: product browsing, filters, a cart and a checkout that works well on a phone.',
      hu: 'Kézműves kerámia webshop: termékböngészés, szűrők, kosár és telefonon is kényelmes pénztár.',
      sk: 'E-shop s ručne robenou keramikou: prehliadanie produktov, filtre, košík a pokladňa, ktorá pohodlne funguje aj v telefóne.',
    },
    words: 'shop webshop store ecommerce ceramics keramia handmade kezmuves products termek cart kosar eshop obchod keramika rucne produkty kosik',
  },
];

let cache: Partial<Record<Lang, Item[]>> = {};
/** how specific each word is: words found in many items count for less */
const idf: Partial<Record<Lang, Map<string, number>>> = {};

export function knowledge(lang: Lang): Item[] {
  const hit = cache[lang];
  if (hit) return hit;
  const L = (v: L10n) => v[lang];
  const dict = { en, hu, sk }[lang];
  const items: Item[] = [];
  /** indexes every language version, so a query in any language finds the item */
  const both = (map: Map<string, number>, v: Partial<L10n> | undefined, w: number) => {
    if (!v) return;
    for (const l of LANGS) addWords(map, v[l], w);
  };
  const tag = (v: L10n) => v[lang];

  for (const f of faqs) {
    const words = new Map<string, number>();
    both(words, f.q, 2.5);
    for (const k of [...f.keys.en, ...f.keys.hu, ...f.keys.sk]) addWords(words, k, 3);
    items.push({ id: `faq:${f.id}`, kind: 'faq', title: L(f.q), text: L(f.a), faq: f, words });
  }

  for (const s of services) {
    const words = new Map<string, number>();
    both(words, s.title, 3);
    both(words, s.desc, 1);
    both(words, s.flow.system, 1.5);
    items.push({ id: `service:${s.id}`, kind: 'service', title: L(s.title), text: L(s.desc), meta: tag({ en: 'SERVICE', hu: 'SZOLGÁLTATÁS', sk: 'SLUŽBA' }), path: '/#services', words });
  }

  for (const p of projects) {
    const words = new Map<string, number>();
    addWords(words, p.title, 3);
    both(words, p.kind, 3);
    for (const t of p.tags) addWords(words, t, 2.5);
    addWords(words, en.projects.categories[p.category], 2.5);
    addWords(words, hu.projects.categories[p.category], 2.5);
    addWords(words, sk.projects.categories[p.category], 2.5);
    const summary = PROJECT_SUMMARY_OVERRIDE[p.id] ?? p.summary;
    both(words, summary, 1);
    both(words, p.outcome, 0.6);
    addWords(words, 'project projects projekt projektek case study esettanulmany reference referencia work munka projekty pripadova studia referencie praca prace', 1.2);
    items.push({
      id: `project:${p.id}`,
      kind: 'project',
      title: p.kind ? `${p.title} — ${L(p.kind)}` : p.title,
      text: L(summary),
      meta: `${tag({ en: 'CASE STUDY', hu: 'ESETTANULMÁNY', sk: 'PRÍPADOVÁ ŠTÚDIA' })} · ${dict.projects.categories[p.category].toUpperCase()}`,
      path: `/project/${p.id}/`,
      visual: p.visual,
      words,
    });
  }

  for (const lab of labs) {
    const words = new Map<string, number>();
    both(words, lab.title, 3);
    both(words, lab.tagline, 2);
    for (const t of lab.tags) addWords(words, t, 2);
    both(words, { en: lab.desc.en.split('\n')[0], hu: lab.desc.hu.split('\n')[0], sk: lab.desc.sk?.split('\n')[0] }, 1);
    addWords(words, 'demo interactive interaktiv bemutato kiprobal try ukazka interaktivna vyskusat', 1);
    items.push({
      id: `lab:${lab.id}`,
      kind: 'lab',
      title: L(lab.title),
      text: L(lab.tagline),
      meta: tag({ en: 'INTERACTIVE DEMO', hu: 'INTERAKTÍV BEMUTATÓ', sk: 'INTERAKTÍVNA UKÁŽKA' }),
      path: lab.path,
      image: ['garage', 'shirt', 'camera'].includes(lab.id) ? `/labs/${lab.id}-640.webp` : lab.id === 'landing' ? readyLandings[0]?.poster : undefined,
      icon: lab.id,
      words,
    });
  }

  for (const l of readyLandings) {
    const words = new Map<string, number>();
    addWords(words, l.name, 3);
    both(words, l.sector, 3);
    both(words, l.concept, 1);
    addWords(words, 'landing page demo design bemutato oldal weboldal website ukazka stranka web webstranka dizajn', 0.8);
    items.push({
      id: `landing:${l.slug}`,
      kind: 'landing',
      title: l.name,
      text: `${L(l.sector)} — ${L(l.concept)}`,
      meta: tag({ en: 'LANDING PAGE', hu: 'BEMUTATÓ OLDAL', sk: 'LANDING PAGE' }),
      path: `/landing-pages/${l.slug}/`,
      image: l.poster,
      words,
    });
  }

  for (const ind of industries) {
    const words = new Map<string, number>();
    both(words, ind.nav, 3.2);
    both(words, ind.hero.kicker, 2);
    both(words, ind.hero.short, 1.5);
    for (const p of ind.problems) both(words, p.t, 0.8);
    for (const f of ind.features) both(words, f.t, 0.8);
    items.push({
      id: `industry:${ind.slug}`,
      kind: 'industry',
      title: L(ind.hero.kicker),
      text: L(ind.hero.lead),
      meta: tag({ en: 'INDUSTRY OFFER', hu: 'IPARÁGI AJÁNLAT', sk: 'PONUKA PRE ODVETVIE' }),
      path: `/industries/${ind.slug}/`,
      image: industryDemo(ind)?.poster,
      words,
    });
  }

  for (const c of CASES) {
    const words = new Map<string, number>();
    both(words, c.title, 3);
    both(words, c.text, 1);
    addWords(words, c.words, 2);
    addWords(words, 'modernization modernizalas redesign ujratervezes old regi before after elotte utana modernizacia stary stare pred', 2);
    items.push({
      id: `case:${c.id}`,
      kind: 'case',
      title: L(c.title),
      text: L(c.text),
      meta: tag({ en: 'MODERNIZATION', hu: 'MODERNIZÁLÁS', sk: 'MODERNIZÁCIA' }),
      path: '/modernization/',
      icon: 'modernization',
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
    // the other languages' titles help a query in one language find an article written only in another
    for (const l of LANGS) {
      const other = l === lang ? undefined : a.versions[l];
      if (other) addWords(words, other.title, 1.2);
    }
    items.push({
      id: `article:${a.slug}`,
      kind: 'article',
      title: v.title,
      text: v.description,
      meta: `${tag({ en: 'ARTICLE', hu: 'CIKK', sk: 'ČLÁNOK' })} · ${v.minutes} MIN`,
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
          : lang === 'sk'
            ? `Áno — ${t.name} patrí medzi používané technológie.${list ? ` Projekty, v ktorých sa používa: ${list}.` : ''}`
            : `Yes — ${t.name} is part of the stack.${list ? ` Projects that use it: ${list}.` : ''}`,
      meta: tag({ en: 'TECHNOLOGY', hu: 'TECHNOLÓGIA', sk: 'TECHNOLÓGIA' }),
      path: '/#stack',
      words,
    });
  }

  for (const tr of tracks) {
    const words = new Map<string, number>();
    both(words, tr.title, 2);
    for (const t of tr.tags) addWords(words, t, 1);
    addWords(words, 'interview interju practice gyakorlas questions kerdesek pohovor pohovoru precvicovanie otazky', 1.5);
    items.push({
      id: `track:${tr.id}`,
      kind: 'track',
      title: `${tag({ en: 'Interview', hu: 'Interjú', sk: 'Pohovor' })}: ${L(tr.title)}`,
      text: L(tr.text),
      meta: tag({ en: 'INTERVIEW SIMULATOR', hu: 'INTERJÚ-SZIMULÁTOR', sk: 'SIMULÁTOR POHOVOROV' }),
      path: `/interview/${tr.id}/`,
      words,
    });
  }

  for (const m of modules) {
    const words = new Map<string, number>();
    both(words, m.title, 2);
    both(words, m.summary, 0.8);
    addWords(words, 'course kurzus learn tanul lesson lecke kurz ucenie ucit lekcia', 1.5);
    items.push({
      id: `module:${m.id}`,
      kind: 'module',
      title: `${tag({ en: 'Course', hu: 'Kurzus', sk: 'Kurz' })} ${m.num}: ${L(m.title)}`,
      text: L(m.summary),
      meta: tag({ en: 'FULL-STACK COURSE', hu: 'FULL-STACK KURZUS', sk: 'FULL-STACK KURZ' }),
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
  industry: 1.15,
};

function wordScore(q: string, w: string): number {
  if (q === w) return 1;
  if (q.length >= 4 && w.length >= 4) {
    // Hungarian and Slovak endings, English plurals: "weboldalt" ~ "weboldal", "projekty" ~ "projekt"
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
