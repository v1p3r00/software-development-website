import type { Lang } from '../projects';

export type Level = 'junior' | 'medior' | 'senior';

export interface Question {
  id: number;
  level: Level;
  /** a grouping of topics, see `areas` */
  area: string;
  /** the specific subject, as written by the author */
  topic: string;
  type: string;
  question: string;
  code?: string;
  /** four options in their authored order; `answer` indexes into them */
  options: string[];
  answer: number;
  explanation: string;
  /** the explanation names options by letter, so they must stay in authored order */
  fixed?: boolean;
}

/** topic areas used for filtering and the results breakdown */
export const areas: Record<string, Record<Lang, string>> = {
  scope: { en: 'Scope & hoisting', hu: 'Scope és hoisting', sk: 'Scope a hoisting' },
  types: { en: 'Types & coercion', hu: 'Típusok és coercion', sk: 'Typy a coercion' },
  functions: { en: 'Functions, closures & this', hu: 'Függvények, closure, this', sk: 'Funkcie, closures a this' },
  collections: { en: 'Arrays & collections', hu: 'Tömbök és gyűjtemények', sk: 'Polia a kolekcie' },
  objects: { en: 'Objects, prototypes & classes', hu: 'Objektumok, prototype, class', sk: 'Objekty, prototypy a triedy' },
  errors: { en: 'Error handling', hu: 'Hibakezelés', sk: 'Spracovanie chýb' },
  modules: { en: 'Modules', hu: 'Modulok', sk: 'Moduly' },
  async: { en: 'Promises & async', hu: 'Promise és async', sk: 'Promises a async' },
  iterators: { en: 'Iterators & generators', hu: 'Iterátorok és generátorok', sk: 'Iterátory a generátory' },
  eventloop: { en: 'Event loop', hu: 'Event loop', sk: 'Event loop' },
  performance: { en: 'Performance', hu: 'Teljesítmény', sk: 'Výkon' },
  memory: { en: 'Memory management', hu: 'Memóriakezelés', sk: 'Správa pamäte' },
  syntax: { en: 'Modern syntax & FP', hu: 'Modern szintaxis és FP', sk: 'Moderná syntax a FP' },
  dom: { en: 'DOM & events', hu: 'DOM és események', sk: 'DOM a udalosti' },
  browser: { en: 'Browser APIs', hu: 'Böngésző API-k', sk: 'API prehliadača' },
  security: { en: 'Security', hu: 'Biztonság', sk: 'Bezpečnosť' },
  storage: { en: 'Storage & cookies', hu: 'Tárolás és cookie-k', sk: 'Úložisko a cookies' },
  patterns: { en: 'Patterns & architecture', hu: 'Minták és architektúra', sk: 'Vzory a architektúra' },
  typescript: { en: 'TypeScript-adjacent JS', hu: 'TypeScript-közeli JS', sk: 'JS blízky TypeScriptu' },
  debugging: { en: 'Testing & debugging', hu: 'Tesztelés és debugging', sk: 'Testovanie a debugging' },
};
export const areaLabel = (area: string, lang: Lang) => areas[area]?.[lang] ?? area;

export { tracks } from './tracks';
export type { Track } from './tracks';
import { tracks } from './tracks';

// each question set is its own chunk, fetched only when its track is opened
const sets = import.meta.glob<{ default: Question[] }>('./*.json');

export async function loadQuestions(track: string, lang: Lang): Promise<Question[]> {
  const load = sets[`./${track}.${lang}.json`] ?? sets[`./${track}.en.json`] ?? sets[`./${track}.hu.json`] ?? sets[`./${track}.sk.json`];
  if (!load) return [];
  return (await load()).default;
}

/** tracks whose question set exists in at least one language */
export const readyTracks = tracks.filter((t) => Object.keys(sets).some((k) => k.startsWith(`./${t.id}.`)));
