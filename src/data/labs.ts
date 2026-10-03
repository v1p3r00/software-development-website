import type { L10n } from './projects';

/**
 * Interactive projects that live on this site (as opposed to the client case studies).
 * Each one is listed in the home-page section and in the "Projects" menu.
 */
export interface Lab {
  id: string;
  num: string;
  /** a few letters for the badge */
  short: string;
  /** site path without the language prefix */
  path: string;
  title: L10n;
  desc: L10n;
  /** call to action on the card */
  cta: L10n;
  tags: string[];
}

export const labs: Lab[] = [
  {
    id: 'cv',
    num: '01',
    short: 'CV',
    path: '/cv-maker/',
    title: { en: 'CV Maker', hu: 'Önéletrajz-készítő' },
    desc: {
      en: 'Build a professional CV step by step with a live preview. Four layouts, reorderable sections, an optional photo and a print-ready PDF — plus a practical guide to writing a CV that gets read.',
      hu: 'Készíts profi önéletrajzot lépésről lépésre, élő előnézettel. Négy elrendezés, átrendezhető szakaszok, opcionális fotó és nyomtatásra kész PDF — gyakorlati útmutatóval ahhoz, hogy el is olvassák.',
    },
    cta: { en: 'Create your CV', hu: 'Készítsd el az önéletrajzod' },
    tags: ['React', 'PDF', 'EN / HU'],
  },
  {
    id: 'interview',
    num: '02',
    short: 'SIM',
    path: '/interview/',
    title: { en: 'Interview simulator', hu: 'Interjú-szimulátor' },
    desc: {
      en: 'Technical interview practice that feels like the real thing: read code, predict output, spot bugs and explain trade-offs — then see where you stand by level and topic.',
      hu: 'Technikai interjú gyakorlás, ami úgy zajlik, mint a valóságban: kódolvasás, output kitalálása, hibakeresés és döntések indoklása — a végén pedig szintenként és témakörönként látod, hol tartasz.',
    },
    cta: { en: 'Start practising', hu: 'Kezdd el a gyakorlást' },
    tags: ['React', 'TypeScript', 'EN / HU'],
  },
];
