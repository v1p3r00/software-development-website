import type { L10n } from './projects';

export interface Service {
  num: string;
  id: string;
  title: L10n;
  desc: L10n;
  flow: { input: L10n; process: L10n; system: L10n; output: L10n };
}

export const services: Service[] = [
  {
    num: '01',
    id: 'fullstack',
    title: { en: 'Full-stack development', hu: 'Full-stack fejlesztés' },
    desc: {
      en: 'One person across the whole depth of the product — data model, services, API and interface — so nothing gets lost between layers.',
      hu: 'Egy ember a termék teljes mélységében — adatmodell, szolgáltatások, API és felület —, így semmi nem vész el a rétegek között.',
    },
    flow: {
      input: { en: 'Business requirement', hu: 'Üzleti igény' },
      process: { en: 'Domain model + API design', hu: 'Domain-modell + API-terv' },
      system: { en: 'Spring Boot / Angular / React', hu: 'Spring Boot / Angular / React' },
      output: { en: 'Working, deployed feature', hu: 'Működő, kiélesített funkció' },
    },
  },
  {
    num: '02',
    id: 'webapps',
    title: { en: 'Web applications', hu: 'Webalkalmazások' },
    desc: {
      en: 'Dense, fast interfaces for people who use them all day — forms, tables, dashboards and workflows that respect the user’s time.',
      hu: 'Sűrű, gyors felületek azoknak, akik naphosszat használják: űrlapok, táblák, dashboardok és folyamatok, amelyek tiszteletben tartják a felhasználó idejét.',
    },
    flow: {
      input: { en: 'User workflow', hu: 'Felhasználói folyamat' },
      process: { en: 'Interaction + state design', hu: 'Interakció- és állapotterv' },
      system: { en: 'Component architecture', hu: 'Komponensarchitektúra' },
      output: { en: 'Application in production', hu: 'Éles alkalmazás' },
    },
  },
  {
    num: '03',
    id: 'design',
    title: { en: 'UI / UX & web design', hu: 'UI / UX és webdizájn' },
    desc: {
      en: 'Design that is made to be built. Type, grid, hierarchy and motion decided with the front-end implementation already in view.',
      hu: 'Olyan design, amit meg is lehet építeni. Tipográfia, rács, hierarchia és mozgás — már a frontend megvalósítás ismeretében.',
    },
    flow: {
      input: { en: 'Brand + intent', hu: 'Márka és szándék' },
      process: { en: 'Grid, type, hierarchy', hu: 'Rács, tipográfia, hierarchia' },
      system: { en: 'Reusable design system', hu: 'Újrahasznosítható design system' },
      output: { en: 'Interface people trust', hu: 'Felület, amiben megbíznak' },
    },
  },
  {
    num: '04',
    id: 'architecture',
    title: { en: 'Software architecture', hu: 'Szoftverarchitektúra' },
    desc: {
      en: 'Structure decided early and deliberately: boundaries, contracts and failure modes, documented well enough that the next developer agrees with it.',
      hu: 'Korán és tudatosan meghozott szerkezeti döntések: határok, szerződések és hibakezelés — olyan dokumentáltsággal, hogy a következő fejlesztő is egyetértsen velük.',
    },
    flow: {
      input: { en: 'Constraints + scale', hu: 'Korlátok és méret' },
      process: { en: 'Boundaries + contracts', hu: 'Határok és szerződések' },
      system: { en: 'Modular services', hu: 'Moduláris szolgáltatások' },
      output: { en: 'System that survives change', hu: 'Változást is kibíró rendszer' },
    },
  },
  {
    num: '05',
    id: 'enterprise',
    title: { en: 'Enterprise systems', hu: 'Vállalati rendszerek' },
    desc: {
      en: 'Long-lived platforms with real users, real audits and real legacy — banking, government and industrial environments where stability is the feature.',
      hu: 'Hosszú életű platformok valódi felhasználókkal, valódi auditokkal és valódi örökséggel — banki, államigazgatási és ipari környezetben, ahol a stabilitás maga a funkció.',
    },
    flow: {
      input: { en: 'Existing landscape', hu: 'Meglévő rendszerkörnyezet' },
      process: { en: 'Analysis + integration plan', hu: 'Elemzés és integrációs terv' },
      system: { en: 'Secure, auditable services', hu: 'Biztonságos, auditálható szolgáltatások' },
      output: { en: 'Platform in daily operation', hu: 'Napi működésben lévő platform' },
    },
  },
  {
    num: '06',
    id: 'custom',
    title: { en: 'Custom solutions', hu: 'Egyedi megoldások' },
    desc: {
      en: 'For problems no product covers. Short discovery, an early prototype, then iteration against real use rather than assumptions.',
      hu: 'Olyan problémákra, amelyekre nincs kész termék. Rövid felmérés, korai prototípus, majd iteráció valós használat — nem feltételezések — alapján.',
    },
    flow: {
      input: { en: 'An unusual problem', hu: 'Nem szokványos probléma' },
      process: { en: 'Discovery + prototype', hu: 'Felmérés és prototípus' },
      system: { en: 'Containerised delivery', hu: 'Konténerizált szállítás' },
      output: { en: 'A product that fits exactly', hu: 'Pontosan illeszkedő termék' },
    },
  },
];
