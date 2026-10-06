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
    id: 'landing',
    tagline: { en: 'Ten premium landing pages, each shown full screen', hu: 'Tíz prémium landing oldal, teljes képernyőn' },
    num: '01',
    short: 'LP',
    path: '/landing-pages/',
    title: { en: 'Landing pages', hu: 'Bemutató oldalak' },
    desc: {
      en: 'Visitors make a decision within seconds about whether a business feels worth their attention. These ten landing pages showcase how I approach modern web design: distinctive visual direction, smooth animations, and interactive features that are not only engaging, but also designed to support real business goals — from bookings and price calculators to product configurators.\n\nEach concept opens as a full-screen, standalone website. Explore the one that feels closest to your business and imagine what the same approach could look like for your own brand.',
      hu: 'A látogatók néhány másodperc alatt eldöntik, hogy egy vállalkozás felkelti-e az érdeklődésüket. Ez a tíz landing oldal azt mutatja meg, hogyan gondolkodom a modern webdesignról: karakteres vizuális világ, letisztult animációk és olyan interaktív funkciók, amelyek nemcsak látványosak, hanem valódi üzleti célokat is szolgálnak — legyen szó foglalásról, árkalkulátorról vagy konfigurátorról.\n\nMindegyik oldal teljes képernyős, önálló weboldalként nyílik meg. Nézd meg azt, amelyik a legközelebb áll a vállalkozásodhoz, és képzeld el, hogyan működhetne ugyanez a saját márkáddal.',
    },
    cta: { en: 'See the landing pages', hu: 'Nézd meg a bemutató oldalakat' },
    tags: ['Landing page', 'Conversion', 'Premium design'],
  },
  {
    id: 'modernization',
    tagline: { en: 'Dated small-business sites vs. their redesigns', hu: 'Elavult kisvállalkozói oldalak és újratervezésük' },
    num: '02',
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
    id: 'garage',
    tagline: { en: 'Configure a garage in 3D, with a live estimate', hu: 'Garázs 3D-ben, élő árbecsléssel' },
    num: '03',
    short: '3D',
    path: '/garage-designer/',
    title: { en: 'Garage designer', hu: 'Garázstervező' },
    desc: {
      en: 'A 3D product configurator: set the size of the garage, then pick the roof, the door, the cladding and the colours. The model rebuilds with every change and the price estimate follows.\n\nIf you want a custom development like this for your own site, ask for a free consultation.',
      hu: '3D termékkonfigurátor: állítsd be a garázs méretét, majd válassz tetőt, kaput, burkolatot és színeket. A modell minden változtatásra újraépül, az árbecslés pedig követi.\n\nHa szeretnél egy ilyen egyedi fejlesztést a saját oldaladra, kérj ingyenes konzultációt.',
    },
    cta: { en: 'Design a garage', hu: 'Tervezz garázst' },
    tags: ['three.js', 'Configurator', 'Price calculator'],
  },
  {
    id: 'shirt',
    tagline: { en: 'Put your text or image on a T-shirt, in 3D', hu: 'Saját szöveg vagy kép pólón, 3D-ben' },
    num: '04',
    short: 'TEE',
    path: '/shirt-designer/',
    title: { en: '3D T-shirt designer', hu: '3D pólótervező' },
    desc: {
      en: 'Choose a man or a woman model and a shirt colour, then print your own text or image on the front or the back. The print wraps onto the 3D shirt as you type, and the order price updates with size and quantity.\n\nIf you want a custom development like this for your own site, ask for a free consultation.',
      hu: 'Válassz férfi vagy női modellt és pólószínt, majd nyomtass saját szöveget vagy képet az elejére vagy a hátára. A minta gépelés közben rákerül a 3D pólóra, a rendelési ár pedig követi a méretet és a mennyiséget.\n\nHa szeretnél egy ilyen egyedi fejlesztést a saját oldaladra, kérj ingyenes konzultációt.',
    },
    cta: { en: 'Design a T-shirt', hu: 'Tervezz pólót' },
    tags: ['three.js', 'WebGL shader', 'Webshop'],
  },
  {
    id: 'cv',
    tagline: { en: 'Build an ATS-friendly CV and download it as PDF', hu: 'ATS-barát önéletrajz, letölthető PDF-ben' },
    num: '05',
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
    id: 'course',
    tagline: { en: 'From zero to a deployed React + Spring Boot app', hu: 'Nulláról egy élesített React + Spring Boot alkalmazásig' },
    num: '06',
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
    id: 'interview',
    tagline: { en: 'Practise technical interviews: 14 tracks, 200 questions each', hu: 'Technikai interjúgyakorlás: 14 téma, témánként 200 kérdés' },
    num: '07',
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
