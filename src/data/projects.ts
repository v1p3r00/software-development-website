export type Lang = 'en' | 'hu';
export type L10n = Record<Lang, string>;

export type CategoryKey =
  | 'enterprise'
  | 'finance'
  | 'government'
  | 'data'
  | 'business'
  | 'web'
  | 'custom';

export type FilterKey = 'all' | 'enterprise' | 'finance' | 'government' | 'web' | 'custom';

export type VisualKey =
  | 'dashboard'
  | 'ledger'
  | 'market'
  | 'map'
  | 'pipeline'
  | 'table'
  | 'layout'
  | 'cube';

export interface Project {
  id: string;
  num: string;
  title: string;
  /** what the thing is — sits between the title and the client */
  kind?: L10n;
  client?: string;
  category: CategoryKey;
  filters: FilterKey[];
  visual: VisualKey;
  /** omit while the dates are still to be confirmed */
  period?: string;
  tags: string[];
  summary: L10n;
  role: L10n;
  context: L10n;
  approach: L10n;
  outcome: L10n;
}

export const projects: Project[] = [
  {
    id: '3c-tricise',
    num: '01',
    title: '3C',
    kind: { en: 'Enterprise Management Platform', hu: 'Vállalati menedzsmentplatform' },
    client: 'Tricise',
    category: 'enterprise',
    filters: ['enterprise'],
    visual: 'dashboard',
    period: '2025 — present',
    tags: ['Java', 'Angular', 'Spring', 'Clarity', 'Automic'],
    summary: {
      en: 'Development, architecture and long-term support.',
      hu: 'Fejlesztés, architektúra és hosszú távú támogatás.',
    },
    role: {
      en: 'Full-stack developer / architect',
      hu: 'Full-stack fejlesztő / architekt',
    },
    context: {
      en: 'A long-lived enterprise product used by operations teams to orchestrate and monitor complex workloads. The system has to stay predictable across releases while absorbing a steady stream of customer-specific requirements.',
      hu: 'Hosszú életciklusú vállalati termék, amellyel üzemeltetési csapatok összetett folyamatokat vezérelnek és felügyelnek. A rendszernek kiadásról kiadásra kiszámíthatónak kell maradnia, miközben folyamatosan érkeznek ügyfélspecifikus igények.',
    },
    approach: {
      en: 'Worked across the entire stack: domain modelling and Spring services on the backend, an Angular front end built on the Clarity design system, and Automic integration for scheduling and job control. A large part of the work was architectural — keeping modules isolated enough that features could ship independently.',
      hu: 'A teljes stacken dolgoztam: domain-modellezés és Spring szolgáltatások a backenden, Clarity design systemre épülő Angular felület, valamint Automic-integráció az ütemezéshez és a feladatvezérléshez. A munka jelentős része architektúra volt — a modulok olyan szintű elkülönítése, hogy a funkciók egymástól függetlenül szállíthatók legyenek.',
    },
    outcome: {
      en: 'Years of continuous delivery on a product that enterprise customers run in production, with a codebase that new developers can still reason about.',
      hu: 'Több éves folyamatos szállítás egy olyan terméken, amelyet vállalati ügyfelek élesben futtatnak — és amelynek kódbázisa új fejlesztők számára is átlátható maradt.',
    },
  },
  {
    id: 'bank-projects',
    num: '02',
    title: 'Bank projects',
    kind: { en: 'Banking Platform Modernization', hu: 'Banki platform modernizációja' },
    client: 'Merkantil Bank',
    category: 'finance',
    filters: ['finance', 'enterprise'],
    visual: 'ledger',
    period: '2024 — 2025',
    tags: ['Java', 'Angular', 'Spring Boot', 'Banking', 'Integration'],
    summary: {
      en: 'Software systems and integrations developed for Merkantil Bank.',
      hu: 'Szoftverrendszerek és integrációk a Merkantil Bank számára.',
    },
    role: { en: 'Full-stack developer', hu: 'Full-stack fejlesztő' },
    context: {
      en: 'Financial systems where correctness is not negotiable and where most of the difficulty lives in the seams between existing platforms rather than in any single application.',
      hu: 'Pénzügyi rendszerek, ahol a helyesség nem alku tárgya, és ahol a nehézség nagy része nem egyetlen alkalmazásban, hanem a meglévő platformok illesztéseiben rejlik.',
    },
    approach: {
      en: 'Built Spring Boot services and Angular interfaces around existing core banking processes, with careful attention to data validation, auditability and integration contracts. Requirements were refined directly with business stakeholders before a line of code was written.',
      hu: 'Spring Boot szolgáltatásokat és Angular felületeket építettem a meglévő banki folyamatok köré, kiemelt figyelmet fordítva az adatvalidációra, az auditálhatóságra és az integrációs szerződésekre. A követelményeket közvetlenül az üzleti oldallal pontosítottuk, még az első sor kód előtt.',
    },
    outcome: {
      en: 'Integrations that survived audit, and internal tools that replaced manual, error-prone steps in daily banking operations.',
      hu: 'Auditot is kiálló integrációk, valamint belső eszközök, amelyek kiváltották a napi banki működés manuális, hibalehetőségekkel teli lépéseit.',
    },
  },
  {
    id: 'refugee-management-system',
    num: '03',
    title: 'Refugee management system',
    kind: { en: 'Government Platform', hu: 'Államigazgatási platform' },
    client: 'ICZ',
    category: 'government',
    filters: ['government', 'enterprise'],
    visual: 'map',
    period: '2022 — 2023',
    tags: ['Java', 'Spring Boot', 'Angular', 'Security', 'Government'],
    summary: {
      en: 'Government project for the Czech Republic. A complex system for managing refugee-related processes and information.',
      hu: 'Államigazgatási projekt a Cseh Köztársaság számára. Összetett rendszer a menekültügyi folyamatok és információk kezelésére.',
    },
    role: { en: 'Full-stack developer', hu: 'Full-stack fejlesztő' },
    context: {
      en: 'A public-sector system handling sensitive personal data under real time pressure, used by caseworkers who cannot afford an interface that slows them down.',
      hu: 'Közszférás rendszer, amely érzékeny személyes adatokat kezel valós idejű nyomás alatt, és amelyet olyan ügyintézők használnak, akik nem engedhetik meg maguknak a lassú felületet.',
    },
    approach: {
      en: 'Role-based access control, strict data protection boundaries and an audit trail were designed in from the start rather than bolted on. The front end was deliberately plain and fast: dense forms, keyboard-friendly flows, no decoration that costs a click.',
      hu: 'A szerepkör-alapú jogosultságkezelés, a szigorú adatvédelmi határok és az audit napló már a tervezés részei voltak, nem utólagos kiegészítések. A felület szándékosan letisztult és gyors: sűrű űrlapok, billentyűzetbarát folyamatok, semmi olyan díszítés, ami egy kattintásba kerül.',
    },
    outcome: {
      en: 'A production system supporting real administrative work, built to meet public-sector security and data-protection expectations.',
      hu: 'Éles rendszer, amely valódi hatósági munkát támogat, és megfelel a közszféra biztonsági és adatvédelmi elvárásainak.',
    },
  },
  {
    id: 'wexo',
    num: '04',
    title: 'Stock Market Webapp',
    client: 'Wexo',
    category: 'finance',
    filters: ['finance', 'web'],
    visual: 'market',
    period: '2021 — 2022',
    tags: ['Node.js', 'Angular', 'TypeScript', 'REST'],
    summary: {
      en: 'Backend infrastructure in Node.js, front end in Angular — one owner across both.',
      hu: 'Backend infrastruktúra Node.js-ben, frontend Angularban — mindkét oldal egy kézben.',
    },
    role: { en: 'Full-stack developer', hu: 'Full-stack fejlesztő' },
    context: {
      en: 'A market application, where the interface has to stay readable while the numbers under it keep moving, and the backend has to keep up with the data feeding them.',
      hu: 'Tőzsdei alkalmazás, ahol a felületnek akkor is olvashatónak kell maradnia, amikor alatta folyamatosan mozognak a számok — a backendnek pedig lépést kell tartania az azokat tápláló adatokkal.',
    },
    approach: {
      en: 'Built the backend infrastructure in Node.js — services, data handling and the API the client reads from — and the Angular front end on top of it. Owning both sides meant the API contract was shaped by what the interface actually needed, rather than negotiated after the fact.',
      hu: 'A backend infrastruktúrát Node.js-ben építettem — szolgáltatások, adatkezelés és az az API, amelyből a kliens dolgozik —, a ráépülő Angular felülettel együtt. Mivel mindkét oldal nálam volt, az API-szerződést az szabta meg, amire a felületnek valóban szüksége volt, nem utólagos egyeztetés.',
    },
    outcome: {
      en: 'A front end and a backend designed together instead of across team boundaries, with market data reaching the screen through one owner rather than three handovers.',
      hu: 'Együtt tervezett frontend és backend, csapathatárokon átnyúló egyeztetés helyett — a tőzsdei adat egyetlen felelősön keresztül jut a képernyőre, nem három átadáson át.',
    },
  },
  {
    id: 'reporting-system',
    num: '05',
    title: 'Reporting system',
    kind: { en: 'Reporting & Data Platform', hu: 'Riportálási és adatplatform' },
    client: 'Slovnaft / MOL Group',
    category: 'data',
    filters: ['enterprise'],
    visual: 'pipeline',
    period: '2019 — 2020',
    tags: ['Java', 'Reporting', 'ETL', 'Analytics'],
    summary: {
      en: 'Reporting and data solutions for Slovnaft / MOL Group.',
      hu: 'Riportálási és adatmegoldások a Slovnaft / MOL Group számára.',
    },
    role: { en: 'Developer / data engineer', hu: 'Fejlesztő / adatmérnök' },
    context: {
      en: 'Operational and financial data spread across several systems, needed in a form that management could actually act on.',
      hu: 'Több rendszerben szétszórt működési és pénzügyi adatok, amelyekre a vezetőségnek döntésre alkalmas formában volt szüksége.',
    },
    approach: {
      en: 'Designed ETL routines to consolidate sources, then built reporting layers on top with an emphasis on reproducibility — the same report run twice has to produce the same numbers, and it has to be possible to explain where each figure came from.',
      hu: 'ETL folyamatokat terveztem a források konszolidálására, majd erre építettem a riportálási rétegeket, a reprodukálhatóságot szem előtt tartva: ugyanaz a riport kétszer lefuttatva ugyanazt az eredményt kell adja, és minden számról meg kell tudni mondani, honnan származik.',
    },
    outcome: {
      en: 'Automated reporting that removed recurring manual spreadsheet work and shortened the path from raw data to decision.',
      hu: 'Automatizált riportálás, amely kiváltotta a visszatérő manuális táblázatkezelést, és lerövidítette az utat a nyers adattól a döntésig.',
    },
  },
  {
    id: 'accounting-system',
    num: '06',
    title: 'Accounting system',
    kind: { en: 'Custom Accounting System', hu: 'Egyedi könyvelési rendszer' },
    category: 'business',
    filters: ['custom', 'finance'],
    visual: 'table',
    period: '2018',
    tags: ['Java', 'Angular', 'Finance', 'Automation'],
    summary: {
      en: 'Custom accounting software built around specific business requirements.',
      hu: 'Egyedi könyvelési szoftver konkrét üzleti igényekre szabva.',
    },
    role: { en: 'Full-stack developer / analyst', hu: 'Full-stack fejlesztő / elemző' },
    context: {
      en: 'A business whose accounting process did not fit any off-the-shelf package without expensive compromises in how the company actually works.',
      hu: 'Egy vállalkozás, amelynek könyvelési folyamatába egyetlen dobozos termék sem illeszkedett anélkül, hogy drága kompromisszumokat kellett volna kötni a tényleges működésben.',
    },
    approach: {
      en: 'Started with analysis: mapped the existing process end to end, then modelled it properly instead of copying the spreadsheet. Automated the repetitive calculations and left the judgement calls to people.',
      hu: 'Elemzéssel kezdtem: végigtérképeztem a meglévő folyamatot, majd rendesen modelleztem — nem a táblázatot másoltam le. Az ismétlődő számításokat automatizáltam, a mérlegelést igénylő döntéseket meghagytam az embereknek.',
    },
    outcome: {
      en: 'A system that matches how the business runs, with the monthly close measured in hours instead of days.',
      hu: 'Olyan rendszer, amely a vállalkozás tényleges működését követi — a havi zárás napok helyett órákban mérhető.',
    },
  },
  {
    id: 'various-web-design',
    num: '07',
    title: 'Various web design',
    kind: { en: 'Websites & E-commerce', hu: 'Weboldalak és e-kereskedelem' },
    category: 'web',
    filters: ['web'],
    visual: 'layout',
    period: '2018 — present',
    tags: ['WordPress', 'Shopify', 'WooCommerce', 'React', 'Next.js', 'UI/UX'],
    summary: {
      en: 'Modern websites, e-commerce experiences and custom web interfaces.',
      hu: 'Modern weboldalak, e-kereskedelmi élmények és egyedi webes felületek.',
    },
    role: { en: 'Designer / front-end developer', hu: 'Tervező / frontend fejlesztő' },
    context: {
      en: 'Clients who need a site that looks considered and performs well, rather than a theme with their logo dropped into it.',
      hu: 'Ügyfelek, akiknek átgondolt megjelenésű és jól teljesítő oldalra van szükségük — nem pedig egy sablonra, amibe belerakták a logójukat.',
    },
    approach: {
      en: 'Design and build in one pass: layout and type decisions made with the implementation in mind, then built in React or Next.js with real attention to performance, accessibility and the editing experience for whoever maintains it.',
      hu: 'Tervezés és fejlesztés egy menetben: az elrendezési és tipográfiai döntések már a megvalósítás ismeretében születnek, majd React vagy Next.js alapon épül fel a megoldás — figyelve a teljesítményre, az akadálymentességre és arra, hogy a tartalmat később is kényelmes legyen kezelni.',
    },
    outcome: {
      en: 'Sites that load fast, rank well and stay maintainable after handover.',
      hu: 'Gyorsan betöltő, jól kereshető oldalak, amelyek az átadás után is karbantarthatók maradnak.',
    },
  },
  {
    id: 'custom-solutions',
    num: '08',
    title: 'Custom solutions',
    kind: { en: 'Tailor-made Digital Products', hu: 'Egyedi digitális termékek' },
    category: 'custom',
    filters: ['custom'],
    visual: 'cube',
    tags: ['Java', 'Angular', 'React', 'AI', 'Cloud', 'Docker'],
    summary: {
      en: 'Tailor-made digital products and web applications for unique business challenges.',
      hu: 'Egyedi digitális termékek és webalkalmazások különleges üzleti kihívásokra.',
    },
    role: { en: 'Product builder', hu: 'Terméképítő' },
    context: {
      en: 'Problems that do not have a product category yet — internal tools, one-off platforms, automation that only makes sense for one company.',
      hu: 'Olyan problémák, amelyekre még nincs termékkategória: belső eszközök, egyedi platformok, automatizálás, amelynek csak egyetlen cégnél van értelme.',
    },
    approach: {
      en: 'Short discovery, a working prototype early, then iterate against real use. Containerised deployment from day one so that moving from prototype to production is a configuration change, not a rewrite.',
      hu: 'Rövid felmérés, korai működő prototípus, majd iteráció valós használat alapján. Konténerizált üzemeltetés az első naptól, hogy a prototípusból az élesbe vezető út konfiguráció kérdése legyen, ne újraírásé.',
    },
    outcome: {
      en: 'Products that exist because someone needed them, not because the market had a slot for them.',
      hu: 'Termékek, amelyek azért léteznek, mert valakinek szüksége volt rájuk — nem azért, mert volt rájuk piaci rés.',
    },
  },
];

export const filterKeys: FilterKey[] = ['all', 'enterprise', 'finance', 'government', 'web', 'custom'];
