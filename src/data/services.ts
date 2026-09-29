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
      hu: 'A termék teljes technológiai rétegén dolgozom az adatmodelltől és a backend szolgáltatásoktól az API-kon át a felhasználói felületig. Így a rétegek nem elszigetelten fejlődnek, hanem egy összefüggő rendszerként.',
    },
    flow: {
      input: { en: 'Business requirement', hu: 'Üzleti igény' },
      process: { en: 'Domain model + API design', hu: 'Domainmodell és API-tervezés' },
      system: { en: 'Spring Boot / Angular / React', hu: 'Spring Boot / Angular / React' },
      output: { en: 'Working, deployed feature', hu: 'Működő, élesben használható funkció' },
    },
  },
  {
    num: '02',
    id: 'webapps',
    title: { en: 'Web applications', hu: 'Webalkalmazások' },
    desc: {
      en: 'Dense, fast interfaces for people who use them all day — forms, tables, dashboards and workflows that respect the user’s time.',
      hu: 'Gyors és hatékony felületek olyan felhasználók számára, akik nap mint nap dolgoznak velük. Űrlapok, táblázatok, dashboardok és munkafolyamatok, amelyek a felhasználó idejét és figyelmét is szem előtt tartják.',
    },
    flow: {
      input: { en: 'User workflow', hu: 'Felhasználói munkafolyamat' },
      process: { en: 'Interaction + state design', hu: 'Interakciók és állapotok megtervezése' },
      system: { en: 'Component architecture', hu: 'Komponensarchitektúra' },
      output: { en: 'Application in production', hu: 'Éles környezetben működő alkalmazás' },
    },
  },
  {
    num: '03',
    id: 'design',
    title: { en: 'UI / UX & web design', hu: 'UI / UX és webdizájn' },
    desc: {
      en: 'Design that is made to be built. Type, grid, hierarchy and motion decided with the front-end implementation already in view.',
      hu: 'Olyan design, amely nemcsak jól néz ki, hanem ténylegesen meg is valósítható. A tipográfia, az elrendezés, a vizuális hierarchia és az animációk már a frontend technikai megvalósítását figyelembe véve születnek.',
    },
    flow: {
      input: { en: 'Brand + intent', hu: 'Márka és cél' },
      process: { en: 'Grid, type, hierarchy', hu: 'Rácsszerkezet, tipográfia és vizuális hierarchia' },
      system: { en: 'Reusable design system', hu: 'Újrahasznosítható design system' },
      output: { en: 'Interface people trust', hu: 'Intuitív és megbízható felhasználói felület' },
    },
  },
  {
    num: '04',
    id: 'architecture',
    title: { en: 'Software architecture', hu: 'Szoftverarchitektúra' },
    desc: {
      en: 'Structure decided early and deliberately: boundaries, contracts and failure modes, documented well enough that the next developer agrees with it.',
      hu: 'A rendszer legfontosabb szerkezeti döntéseit már a kezdetektől tudatosan kell meghozni. Modulhatárok, interfészek, felelősségi körök és hibakezelési stratégiák kialakítása úgy, hogy a rendszer később is érthető és továbbfejleszthető maradjon.',
    },
    flow: {
      input: { en: 'Constraints + scale', hu: 'Technikai korlátok és várható terhelés' },
      process: { en: 'Boundaries + contracts', hu: 'Modulhatárok és interfészek meghatározása' },
      system: { en: 'Modular services', hu: 'Moduláris szolgáltatások' },
      output: { en: 'System that survives change', hu: 'Változásokhoz alkalmazkodó, hosszú távon fenntartható rendszer' },
    },
  },
  {
    num: '05',
    id: 'enterprise',
    title: { en: 'Enterprise systems', hu: 'Vállalati rendszerek' },
    desc: {
      en: 'Long-lived platforms with real users, real audits and real legacy — banking, government and industrial environments where stability is the feature.',
      hu: 'Hosszú életciklusú rendszerek valódi felhasználókkal, szigorú auditkövetelményekkel és meglévő technológiai örökséggel. Banki, államigazgatási és ipari környezetben, ahol a stabilitás és a megbízhatóság nem extra, hanem alapkövetelmény.',
    },
    flow: {
      input: { en: 'Existing landscape', hu: 'Meglévő rendszerkörnyezet' },
      process: { en: 'Analysis + integration plan', hu: 'Rendszerelemzés és integrációs tervezés' },
      system: { en: 'Secure, auditable services', hu: 'Biztonságos és auditálható szolgáltatások' },
      output: { en: 'Platform in daily operation', hu: 'Napi működésben használt, stabil platform' },
    },
  },
  {
    num: '06',
    id: 'custom',
    title: { en: 'Custom solutions', hu: 'Egyedi megoldások' },
    desc: {
      en: 'For problems no product covers. Short discovery, an early prototype, then iteration against real use rather than assumptions.',
      hu: 'Olyan üzleti problémákra, amelyekre nincs megfelelő késztermék. Rövid felméréssel és korai prototípussal indulunk, majd a megoldást valós használatból származó tapasztalatok alapján iteráljuk, nem előzetes feltételezésekre építve.',
    },
    flow: {
      input: { en: 'An unusual problem', hu: 'Egyedi üzleti probléma' },
      process: { en: 'Discovery + prototype', hu: 'Felmérés és működő prototípus' },
      system: { en: 'Containerised delivery', hu: 'Konténerizált fejlesztés és üzemeltetés' },
      output: { en: 'A product that fits exactly', hu: 'Az adott problémára pontosan illeszkedő digitális termék' },
    },
  },
];
