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
  /** one short line under the title in the site header */
  tagline: L10n;
  tags: string[];
}

export const labs: Lab[] = [
  {
    id: 'modernization',
    tagline: { en: 'Dated small-business sites vs. their redesigns', hu: 'Elavult kisvállalkozói oldalak és újratervezésük' },
    num: '01',
    short: 'UX',
    path: '/modernization/',
    title: { en: 'Website modernization', hu: 'Weboldal-modernizálás' },
    desc: {
      en: 'Dated small-business websites and their redesigns in one frame — a confectionery, a law firm and a webshop. Drag the divider to compare; the new versions are working mockups with menus, forms and a cart.',
      hu: 'Elavult kisvállalkozói weboldalak és újratervezett változataik egy keretben — cukrászda, ügyvédi iroda és webshop. Húzd az elválasztót; az új verziók működő mockupok menükkel, űrlapokkal és kosárral.',
    },
    cta: { en: 'Compare before & after', hu: 'Előtte–utána összehasonlítás' },
    tags: ['UI / UX', 'Redesign', 'Responsive'],
  },
  {
    id: 'course',
    tagline: { en: 'From zero to a deployed React + Spring Boot app', hu: 'Nulláról egy élesített React + Spring Boot alkalmazásig' },
    num: '02',
    short: 'EDU',
    path: '/course/',
    title: { en: 'Full-stack developer course', hu: 'Full-stack fejlesztő kurzus' },
    desc: {
      en: 'A free, hands-on path from the basics of the web to a deployed React + Spring Boot application — with quizzes, coding exercises that run in your browser, and a progress map.',
      hu: 'Ingyenes, gyakorlatias út a web alapjaitól egy élesített React + Spring Boot alkalmazásig — kvízekkel, böngészőben futó kódolási feladatokkal és haladási térképpel.',
    },
    cta: { en: 'Start learning', hu: 'Kezdd el a tanulást' },
    tags: ['React', 'Spring Boot', 'EN / HU'],
  },
  {
    id: 'cv',
    tagline: { en: 'Build an ATS-friendly CV and download it as PDF', hu: 'ATS-barát önéletrajz, letölthető PDF-ben' },
    num: '03',
    short: 'CV',
    path: '/cv-maker/',
    title: { en: 'CV Maker', hu: 'Önéletrajz-készítő' },
    desc: {
      en: 'Build a professional CV step by step with a live preview. 24 modern, creative and classic layouts, reorderable sections, an optional photo and a print-ready PDF — plus a practical guide to writing a CV that gets read.',
      hu: 'Készíts profi önéletrajzot lépésről lépésre, élő előnézettel. 24 modern, kreatív és klasszikus elrendezés, átrendezhető szakaszok, opcionális fotó és nyomtatásra kész PDF — gyakorlati útmutatóval ahhoz, hogy el is olvassák.',
    },
    cta: { en: 'Create your CV', hu: 'Készítsd el az önéletrajzod' },
    tags: ['React', 'PDF', 'EN / HU'],
  },
  {
    id: 'interview',
    tagline: { en: 'Practise technical interviews: 14 tracks, 200 questions each', hu: 'Technikai interjúgyakorlás: 14 téma, témánként 200 kérdés' },
    num: '04',
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

/** the interactive project a (language-stripped) path belongs to, e.g. /course/html-basics/ → course */
export function labFor(path: string): Lab | undefined {
  const p = path.endsWith('/') ? path : `${path}/`;
  return labs.find((lab) => p.startsWith(lab.path));
}
