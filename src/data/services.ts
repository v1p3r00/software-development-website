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
    title: { en: 'Full-stack development', hu: 'Full-stack fejlesztés', sk: 'Full-stack vývoj' },
    desc: {
      en: 'One person across the whole depth of the product — data model, services, API and interface — so nothing gets lost between layers.',
      hu: 'A termék teljes technológiai rétegén dolgozom az adatmodelltől és a backend szolgáltatásoktól az API-kon át a felhasználói felületig. Így a rétegek nem elszigetelten fejlődnek, hanem egy összefüggő rendszerként.',
      sk: 'Jeden človek naprieč celou hĺbkou produktu — dátový model, služby, API aj rozhranie —, takže sa medzi vrstvami nič nestratí.',
    },
    flow: {
      input: { en: 'Business requirement', hu: 'Üzleti igény', sk: 'Biznisová požiadavka' },
      process: { en: 'Domain model + API design', hu: 'Domainmodell és API-tervezés', sk: 'Doménový model + návrh API' },
      system: { en: 'Spring Boot / Angular / React', hu: 'Spring Boot / Angular / React', sk: 'Spring Boot / Angular / React' },
      output: { en: 'Working, deployed feature', hu: 'Működő, élesben használható funkció', sk: 'Funkčná, nasadená funkcionalita' },
    },
  },
  {
    num: '02',
    id: 'webapps',
    title: { en: 'Web applications', hu: 'Webalkalmazások', sk: 'Webové aplikácie' },
    desc: {
      en: 'Dense, fast interfaces for people who use them all day — forms, tables, dashboards and workflows that respect the user’s time.',
      hu: 'Gyors és hatékony felületek olyan felhasználók számára, akik nap mint nap dolgoznak velük. Űrlapok, táblázatok, dashboardok és munkafolyamatok, amelyek a felhasználó idejét és figyelmét is szem előtt tartják.',
      sk: 'Prehľadné a rýchle rozhrania pre ľudí, ktorí s nimi pracujú celý deň — formuláre, tabuľky, dashboardy a pracovné postupy, ktoré šetria čas používateľa.',
    },
    flow: {
      input: { en: 'User workflow', hu: 'Felhasználói munkafolyamat', sk: 'Pracovný postup používateľa' },
      process: { en: 'Interaction + state design', hu: 'Interakciók és állapotok megtervezése', sk: 'Návrh interakcií a stavov' },
      system: { en: 'Component architecture', hu: 'Komponensarchitektúra', sk: 'Komponentová architektúra' },
      output: { en: 'Application in production', hu: 'Éles környezetben működő alkalmazás', sk: 'Aplikácia v produkcii' },
    },
  },
  {
    num: '03',
    id: 'design',
    title: { en: 'UI / UX & web design', hu: 'UI / UX és webdizájn', sk: 'UI / UX a webdizajn' },
    desc: {
      en: 'Design that is made to be built. Type, grid, hierarchy and motion decided with the front-end implementation already in view.',
      hu: 'Olyan design, amely nemcsak jól néz ki, hanem ténylegesen meg is valósítható. A tipográfia, az elrendezés, a vizuális hierarchia és az animációk már a frontend technikai megvalósítását figyelembe véve születnek.',
      sk: 'Dizajn, ktorý sa dá skutočne postaviť. Typografia, mriežka, hierarchia aj animácie vznikajú s ohľadom na frontendovú implementáciu.',
    },
    flow: {
      input: { en: 'Brand + intent', hu: 'Márka és cél', sk: 'Značka + zámer' },
      process: { en: 'Grid, type, hierarchy', hu: 'Rácsszerkezet, tipográfia és vizuális hierarchia', sk: 'Mriežka, typografia, hierarchia' },
      system: { en: 'Reusable design system', hu: 'Újrahasznosítható design system', sk: 'Znovupoužiteľný design system' },
      output: { en: 'Interface people trust', hu: 'Intuitív és megbízható felhasználói felület', sk: 'Rozhranie, ktorému ľudia dôverujú' },
    },
  },
  {
    num: '04',
    id: 'architecture',
    title: { en: 'Software architecture', hu: 'Szoftverarchitektúra', sk: 'Softvérová architektúra' },
    desc: {
      en: 'Structure decided early and deliberately: boundaries, contracts and failure modes, documented well enough that the next developer agrees with it.',
      hu: 'A rendszer legfontosabb szerkezeti döntéseit már a kezdetektől tudatosan kell meghozni. Modulhatárok, interfészek, felelősségi körök és hibakezelési stratégiák kialakítása úgy, hogy a rendszer később is érthető és továbbfejleszthető maradjon.',
      sk: 'Štruktúra navrhnutá včas a zámerne: hranice modulov, kontrakty a správanie pri chybách, zdokumentované tak dobre, že s nimi bude súhlasiť aj ďalší vývojár.',
    },
    flow: {
      input: { en: 'Constraints + scale', hu: 'Technikai korlátok és várható terhelés', sk: 'Obmedzenia + škála' },
      process: { en: 'Boundaries + contracts', hu: 'Modulhatárok és interfészek meghatározása', sk: 'Hranice + kontrakty' },
      system: { en: 'Modular services', hu: 'Moduláris szolgáltatások', sk: 'Modulárne služby' },
      output: { en: 'System that survives change', hu: 'Változásokhoz alkalmazkodó, hosszú távon fenntartható rendszer', sk: 'Systém, ktorý zvládne zmeny' },
    },
  },
  {
    num: '05',
    id: 'enterprise',
    title: { en: 'Enterprise systems', hu: 'Vállalati rendszerek', sk: 'Podnikové systémy' },
    desc: {
      en: 'Long-lived platforms with real users, real audits and real legacy — banking, government and industrial environments where stability is the feature.',
      hu: 'Hosszú életciklusú rendszerek valódi felhasználókkal, szigorú auditkövetelményekkel és meglévő technológiai örökséggel. Banki, államigazgatási és ipari környezetben, ahol a stabilitás és a megbízhatóság nem extra, hanem alapkövetelmény.',
      sk: 'Platformy s dlhým životným cyklom, skutočnými používateľmi, skutočnými auditmi a skutočným legacy — bankové, verejné a priemyselné prostredie, kde je stabilita tou hlavnou funkciou.',
    },
    flow: {
      input: { en: 'Existing landscape', hu: 'Meglévő rendszerkörnyezet', sk: 'Existujúce systémové prostredie' },
      process: { en: 'Analysis + integration plan', hu: 'Rendszerelemzés és integrációs tervezés', sk: 'Analýza + integračný plán' },
      system: { en: 'Secure, auditable services', hu: 'Biztonságos és auditálható szolgáltatások', sk: 'Bezpečné, auditovateľné služby' },
      output: { en: 'Platform in daily operation', hu: 'Napi működésben használt, stabil platform', sk: 'Platforma v každodennej prevádzke' },
    },
  },
  {
    num: '06',
    id: 'custom',
    title: { en: 'Custom solutions', hu: 'Egyedi megoldások', sk: 'Riešenia na mieru' },
    desc: {
      en: 'For problems no product covers. Short discovery, an early prototype, then iteration against real use rather than assumptions.',
      hu: 'Olyan üzleti problémákra, amelyekre nincs megfelelő késztermék. Rövid felméréssel és korai prototípussal indulunk, majd a megoldást valós használatból származó tapasztalatok alapján iteráljuk, nem előzetes feltételezésekre építve.',
      sk: 'Pre problémy, ktoré nepokrýva žiadny produkt. Krátka úvodná analýza, skorý prototyp a potom iterácie podľa reálneho používania, nie podľa predpokladov.',
    },
    flow: {
      input: { en: 'An unusual problem', hu: 'Egyedi üzleti probléma', sk: 'Nezvyčajný problém' },
      process: { en: 'Discovery + prototype', hu: 'Felmérés és működő prototípus', sk: 'Analýza + prototyp' },
      system: { en: 'Containerised delivery', hu: 'Konténerizált fejlesztés és üzemeltetés', sk: 'Kontajnerizované nasadenie' },
      output: { en: 'A product that fits exactly', hu: 'Az adott problémára pontosan illeszkedő digitális termék', sk: 'Produkt, ktorý presne sedí' },
    },
  },
  {
    num: '07',
    id: 'ai',
    title: { en: 'AI integration & automation', hu: 'AI-integráció és automatizálás', sk: 'AI integrácia a automatizácia' },
    desc: {
      en: 'Language models put to work on your own data and tools — assistants, document search (RAG), agents and MCP connections, with clear limits on what they may do.',
      hu: 'Nyelvi modellek a saját adataidon és eszközeiden: asszisztensek, dokumentumkeresés (RAG), ágensek és MCP-kapcsolatok, világos keretekkel arra, mit tehetnek meg és mit nem.',
      sk: 'Jazykové modely zapojené do práce s vašimi vlastnými dátami a nástrojmi — asistenti, vyhľadávanie v dokumentoch (RAG), agenti a MCP prepojenia, s jasnými hranicami toho, čo smú robiť.',
    },
    flow: {
      input: { en: 'Repetitive, text-heavy work', hu: 'Ismétlődő, szövegigényes munka', sk: 'Opakujúca sa práca s množstvom textu' },
      process: { en: 'Use-case + data assessment', hu: 'Felhasználási eset és adatok felmérése', sk: 'Posúdenie use-casu a dát' },
      system: { en: 'LLM + RAG / agents / MCP', hu: 'LLM + RAG / ágensek / MCP', sk: 'LLM + RAG / agenti / MCP' },
      output: { en: 'Measurable time saved', hu: 'Mérhető időmegtakarítás', sk: 'Merateľne ušetrený čas' },
    },
  },
  {
    num: '08',
    id: 'integration',
    title: { en: 'System integration & APIs', hu: 'Rendszerintegráció és API-k', sk: 'Systémová integrácia a API' },
    desc: {
      en: 'Making the systems you already pay for talk to each other — ERP, CRM, webshop, billing — so data is entered once and stays consistent everywhere.',
      hu: 'A már meglévő rendszereid összekötése — ERP, CRM, webshop, számlázás —, hogy az adatot egyszer kelljen rögzíteni, és mindenhol ugyanaz legyen.',
      sk: 'Prepojenie systémov, za ktoré už platíte — ERP, CRM, e-shop, fakturácia —, aby sa dáta zadávali raz a všade zostali konzistentné.',
    },
    flow: {
      input: { en: 'Disconnected systems', hu: 'Egymástól elszigetelt rendszerek', sk: 'Neprepojené systémy' },
      process: { en: 'Data mapping + API contracts', hu: 'Adatleképezés és API-szerződések', sk: 'Mapovanie dát + API kontrakty' },
      system: { en: 'REST / events / sync jobs', hu: 'REST / események / szinkronfolyamatok', sk: 'REST / udalosti / synchronizačné úlohy' },
      output: { en: 'One source of truth', hu: 'Egyetlen hiteles adatforrás', sk: 'Jeden zdroj pravdy' },
    },
  },
  {
    num: '09',
    id: 'modernization',
    title: { en: 'Legacy modernisation', hu: 'Régi rendszerek modernizálása', sk: 'Modernizácia legacy systémov' },
    desc: {
      en: 'Moving old software and spreadsheet-run processes onto a maintainable stack step by step — without a risky big-bang rewrite or stopping daily work.',
      hu: 'Elavult szoftverek és Excelből vitt folyamatok fokozatos átvitele egy karbantartható technológiára — kockázatos „mindent egyszerre” újraírás és a napi munka leállítása nélkül.',
      sk: 'Postupný presun starého softvéru a procesov vedených v tabuľkách na udržiavateľný stack — bez riskantného prepísania všetkého naraz a bez zastavenia každodennej práce.',
    },
    flow: {
      input: { en: 'Ageing system or spreadsheets', hu: 'Elöregedett rendszer vagy táblázatok', sk: 'Zastaraný systém alebo tabuľky' },
      process: { en: 'Audit + migration roadmap', hu: 'Átvilágítás és migrációs ütemterv', sk: 'Audit + plán migrácie' },
      system: { en: 'Incremental replacement', hu: 'Lépésenkénti kiváltás', sk: 'Postupná náhrada' },
      output: { en: 'Maintainable modern platform', hu: 'Karbantartható, modern platform', sk: 'Udržiavateľná moderná platforma' },
    },
  },
  {
    num: '10',
    id: 'visibility',
    title: { en: 'Websites & search visibility', hu: 'Weboldalak és kereshetőség', sk: 'Weby a viditeľnosť vo vyhľadávaní' },
    desc: {
      en: 'Fast, mobile-first websites and webshops built to be found — technical SEO plus structured content that AI search engines can cite (GEO / AEO).',
      hu: 'Gyors, mobilra optimalizált weboldalak és webshopok, amelyeket meg is találnak — technikai SEO és olyan strukturált tartalom, amelyet az AI-alapú keresők is idézni tudnak (GEO / AEO).',
      sk: 'Rýchle weby a e-shopy navrhnuté najprv pre mobil, ktoré sa dajú nájsť — technické SEO a štruktúrovaný obsah, ktorý dokážu citovať aj AI vyhľadávače (GEO / AEO).',
    },
    flow: {
      input: { en: 'A site that brings no leads', hu: 'Ügyfelet nem hozó weboldal', sk: 'Web, ktorý neprináša dopyty' },
      process: { en: 'Content + technical audit', hu: 'Tartalmi és technikai átvilágítás', sk: 'Obsahový a technický audit' },
      system: { en: 'Fast static / CMS / shop', hu: 'Gyors statikus oldal / CMS / webshop', sk: 'Rýchly statický web / CMS / e-shop' },
      output: { en: 'Visitors who become clients', hu: 'Ügyféllé váló látogatók', sk: 'Návštevníci, z ktorých sa stávajú klienti' },
    },
  },
];
