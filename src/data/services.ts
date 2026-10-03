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
  {
    num: '07',
    id: 'ai',
    title: { en: 'AI integration & automation', hu: 'AI-integráció és automatizálás' },
    desc: {
      en: 'Language models put to work on your own data and tools — assistants, document search (RAG), agents and MCP connections, with clear limits on what they may do.',
      hu: 'Nyelvi modellek a saját adataidon és eszközeiden: asszisztensek, dokumentumkeresés (RAG), ágensek és MCP-kapcsolatok, világos keretekkel arra, mit tehetnek meg és mit nem.',
    },
    flow: {
      input: { en: 'Repetitive, text-heavy work', hu: 'Ismétlődő, szövegigényes munka' },
      process: { en: 'Use-case + data assessment', hu: 'Felhasználási eset és adatok felmérése' },
      system: { en: 'LLM + RAG / agents / MCP', hu: 'LLM + RAG / ágensek / MCP' },
      output: { en: 'Measurable time saved', hu: 'Mérhető időmegtakarítás' },
    },
  },
  {
    num: '08',
    id: 'integration',
    title: { en: 'System integration & APIs', hu: 'Rendszerintegráció és API-k' },
    desc: {
      en: 'Making the systems you already pay for talk to each other — ERP, CRM, webshop, billing — so data is entered once and stays consistent everywhere.',
      hu: 'A már meglévő rendszereid összekötése — ERP, CRM, webshop, számlázás —, hogy az adatot egyszer kelljen rögzíteni, és mindenhol ugyanaz legyen.',
    },
    flow: {
      input: { en: 'Disconnected systems', hu: 'Egymástól elszigetelt rendszerek' },
      process: { en: 'Data mapping + API contracts', hu: 'Adatleképezés és API-szerződések' },
      system: { en: 'REST / events / sync jobs', hu: 'REST / események / szinkronfolyamatok' },
      output: { en: 'One source of truth', hu: 'Egyetlen hiteles adatforrás' },
    },
  },
  {
    num: '09',
    id: 'modernization',
    title: { en: 'Legacy modernisation', hu: 'Régi rendszerek modernizálása' },
    desc: {
      en: 'Moving old software and spreadsheet-run processes onto a maintainable stack step by step — without a risky big-bang rewrite or stopping daily work.',
      hu: 'Elavult szoftverek és Excelből vitt folyamatok fokozatos átvitele egy karbantartható technológiára — kockázatos „mindent egyszerre” újraírás és a napi munka leállítása nélkül.',
    },
    flow: {
      input: { en: 'Ageing system or spreadsheets', hu: 'Elöregedett rendszer vagy táblázatok' },
      process: { en: 'Audit + migration roadmap', hu: 'Átvilágítás és migrációs ütemterv' },
      system: { en: 'Incremental replacement', hu: 'Lépésenkénti kiváltás' },
      output: { en: 'Maintainable modern platform', hu: 'Karbantartható, modern platform' },
    },
  },
  {
    num: '10',
    id: 'visibility',
    title: { en: 'Websites & search visibility', hu: 'Weboldalak és kereshetőség' },
    desc: {
      en: 'Fast, mobile-first websites and webshops built to be found — technical SEO plus structured content that AI search engines can cite (GEO / AEO).',
      hu: 'Gyors, mobilra optimalizált weboldalak és webshopok, amelyeket meg is találnak — technikai SEO és olyan strukturált tartalom, amelyet az AI-alapú keresők is idézni tudnak (GEO / AEO).',
    },
    flow: {
      input: { en: 'A site that brings no leads', hu: 'Ügyfelet nem hozó weboldal' },
      process: { en: 'Content + technical audit', hu: 'Tartalmi és technikai átvilágítás' },
      system: { en: 'Fast static / CMS / shop', hu: 'Gyors statikus oldal / CMS / webshop' },
      output: { en: 'Visitors who become clients', hu: 'Ügyféllé váló látogatók' },
    },
  },
];
