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
      hu: 'Fejlesztés, rendszerarchitektúra és hosszú távú támogatás.',
    },
    role: {
      en: 'Full-stack developer / architect',
      hu: 'Full-stack fejlesztő / architekt',
    },
    context: {
      en: 'A long-lived enterprise product used by operations teams to orchestrate and monitor complex workloads. The system has to stay predictable across releases while absorbing a steady stream of customer-specific requirements.',
      hu: 'Hosszú életciklusú vállalati termék, amelyet üzemeltetési csapatok használnak összetett folyamatok vezérlésére és felügyeletére. A rendszernek minden új kiadás mellett stabilan és kiszámíthatóan kell működnie, miközben folyamatosan új, ügyfélspecifikus igényekkel bővül.',
    },
    approach: {
      en: 'Worked across the entire stack: domain modelling and Spring services on the backend, an Angular front end built on the Clarity design system, and Automic integration for scheduling and job control. A large part of the work was architectural — keeping modules isolated enough that features could ship independently.',
      hu: 'A teljes technológiai stacken dolgoztam: a backend domainmodelljeinek és Spring-alapú szolgáltatásainak kialakításától az Angular és Clarity Design System alapú frontend fejlesztésén át az Automic integrációjáig. A munka jelentős része rendszertervezési és architekturális feladat volt: a modulokat úgy alakítottam ki, hogy azok megfelelően elkülönüljenek, és a funkciók egymástól függetlenül is fejleszthetők és szállíthatók legyenek.',
    },
    outcome: {
      en: 'Years of continuous delivery on a product that enterprise customers run in production, with a codebase that new developers can still reason about.',
      hu: 'Folyamatos fejlesztés és szállítás egy éles környezetben használt vállalati terméken, miközben a kódbázis hosszú távon is átlátható és továbbfejleszthető maradt.',
    },
  },
  {
    id: 'bank-projects',
    num: '02',
    title: 'Bank projects',
    kind: { en: 'Banking Platform Modernization', hu: 'Banki platformok modernizációja' },
    client: 'Merkantil Bank',
    category: 'finance',
    filters: ['finance', 'enterprise'],
    visual: 'ledger',
    period: '2024 — 2025',
    tags: ['Java', 'Angular', 'Spring Boot', 'Banking', 'Integration'],
    summary: {
      en: 'Software systems and integrations developed for Merkantil Bank.',
      hu: 'Szoftverrendszerek és integrációk fejlesztése a Merkantil Bank számára.',
    },
    role: { en: 'Full-stack developer', hu: 'Full-stack fejlesztő' },
    context: {
      en: 'Financial systems where correctness is not negotiable and where most of the difficulty lives in the seams between existing platforms rather than in any single application.',
      hu: 'Pénzügyi rendszerek, ahol a pontosság és megbízhatóság alapkövetelmény. A komplexitás jelentős része a meglévő rendszerek és platformok közötti integrációkból adódott, nem pedig egyetlen alkalmazás működéséből.',
    },
    approach: {
      en: 'Built Spring Boot services and Angular interfaces around existing core banking processes, with careful attention to data validation, auditability and integration contracts. Requirements were refined directly with business stakeholders before a line of code was written.',
      hu: 'Spring Boot alapú backend szolgáltatásokat és Angular felületeket fejlesztettem a meglévő banki folyamatokra építve. Kiemelt figyelmet fordítottam az adatvalidációra, az auditálhatóságra és az integrációs szerződések pontos kialakítására. A követelményeket közvetlenül az üzleti szereplőkkel egyeztettük és pontosítottuk már a fejlesztés megkezdése előtt.',
    },
    outcome: {
      en: 'Integrations that survived audit, and internal tools that replaced manual, error-prone steps in daily banking operations.',
      hu: 'Megbízható, auditálható integrációk és olyan belső rendszerek készültek, amelyek kiváltották a napi banki működés több manuális és hibára hajlamos lépését.',
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
      hu: 'Államigazgatási projekt a Cseh Köztársaság számára, menekültügyi folyamatok és kapcsolódó adatok kezelésére.',
    },
    role: { en: 'Full-stack developer', hu: 'Full-stack fejlesztő' },
    context: {
      en: 'A public-sector system handling sensitive personal data under real time pressure, used by caseworkers who cannot afford an interface that slows them down.',
      hu: 'Közszférában használt rendszer érzékeny személyes adatok kezelésére, ahol az ügyintézők napi munkáját valós időben támogató, gyors és megbízható működés alapvető követelmény volt.',
    },
    approach: {
      en: 'Role-based access control, strict data protection boundaries and an audit trail were designed in from the start rather than bolted on. The front end was deliberately plain and fast: dense forms, keyboard-friendly flows, no decoration that costs a click.',
      hu: 'A szerepkör-alapú jogosultságkezelést, a szigorú adatvédelmi szabályokat és az auditálhatóságot már a rendszer tervezése során beépítettük. A frontend kialakításánál elsődleges szempont volt a gyors és hatékony munkavégzés: letisztult felületek, sűrű információs elrendezés és billentyűzetbarát munkafolyamatok kerültek előtérbe a felesleges vizuális elemek helyett.',
    },
    outcome: {
      en: 'A production system supporting real administrative work, built to meet public-sector security and data-protection expectations.',
      hu: 'Éles környezetben működő rendszer, amely valódi hatósági munkafolyamatokat támogat, miközben megfelel a közszféra biztonsági és adatvédelmi követelményeinek.',
    },
  },
  {
    id: 'wexo',
    num: '04',
    title: 'Stock Market Webapp',
    kind: { en: 'Fintech Platform', hu: 'Fintech platform' },
    client: 'Wexo',
    category: 'finance',
    filters: ['finance', 'web'],
    visual: 'market',
    period: '2021 — 2022',
    tags: ['Node.js', 'Angular', 'TypeScript', 'REST'],
    summary: {
      en: 'Backend infrastructure in Node.js, front end in Angular — one owner across both.',
      hu: 'Node.js alapú backend és Angular frontend fejlesztése, a teljes technológiai réteg átfogó felelősségével.',
    },
    role: { en: 'Full-stack developer', hu: 'Full-stack fejlesztő' },
    context: {
      en: 'A market application, where the interface has to stay readable while the numbers under it keep moving, and the backend has to keep up with the data feeding them.',
      hu: 'Tőzsdei alkalmazás, ahol a felületnek nagy mennyiségű és folyamatosan változó adat mellett is jól olvashatónak és használhatónak kell maradnia, miközben a backendnek stabilan kell kiszolgálnia az adatfolyamot.',
    },
    approach: {
      en: 'Built the backend infrastructure in Node.js — services, data handling and the API the client reads from — and the Angular front end on top of it. Owning both sides meant the API contract was shaped by what the interface actually needed, rather than negotiated after the fact.',
      hu: 'Node.js alapú backend infrastruktúrát fejlesztettem, beleértve a szolgáltatásokat, az adatkezelést és a frontend által használt API-kat, valamint az erre épülő Angular felületet. Mivel a frontend és a backend fejlesztése egy kézben volt, az API-k kialakítása közvetlenül a tényleges felhasználói és frontend igényekhez igazodhatott.',
    },
    outcome: {
      en: 'A front end and a backend designed together instead of across team boundaries, with market data reaching the screen through one owner rather than three handovers.',
      hu: 'A frontend és backend egymással összehangoltan készült, így az adatmodell, az API-k és a felhasználói felület nem különálló rétegekként, hanem egy egységes rendszer részeként fejlődtek.',
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
      hu: 'Riportálási és adatmegoldások fejlesztése a Slovnaft / MOL Group számára.',
    },
    role: { en: 'Developer / data engineer', hu: 'Fejlesztő / adatmérnök' },
    context: {
      en: 'Operational and financial data spread across several systems, needed in a form that management could actually act on.',
      hu: 'Több különböző rendszerben rendelkezésre álló működési és pénzügyi adatok, amelyeket a vezetőség számára egységes, megbízható és döntéstámogatásra alkalmas formában kellett elérhetővé tenni.',
    },
    approach: {
      en: 'Designed ETL routines to consolidate sources, then built reporting layers on top with an emphasis on reproducibility — the same report run twice has to produce the same numbers, and it has to be possible to explain where each figure came from.',
      hu: 'ETL-folyamatokat terveztem és fejlesztettem a különböző adatforrások konszolidálására, majd ezekre építettem a riportálási réteget. Kiemelt szempont volt a reprodukálhatóság: ugyanannak a riportnak azonos adatokból mindig ugyanazt az eredményt kellett adnia, miközben az egyes értékek eredete is visszakövethető maradt.',
    },
    outcome: {
      en: 'Automated reporting that removed recurring manual spreadsheet work and shortened the path from raw data to decision.',
      hu: 'Automatizált riportálási folyamatok váltották ki a rendszeresen ismétlődő manuális táblázatkezelést, jelentősen lerövidítve az utat a nyers adatoktól a döntéstámogató információkig.',
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
      hu: 'Egyedi könyvelési szoftver fejlesztése konkrét üzleti folyamatokra szabva.',
    },
    role: { en: 'Full-stack developer / analyst', hu: 'Full-stack fejlesztő / elemző' },
    context: {
      en: 'A business whose accounting process did not fit any off-the-shelf package without expensive compromises in how the company actually works.',
      hu: 'Olyan vállalati környezet, ahol a meglévő könyvelési folyamatok nem illeszkedtek megfelelően a kész, dobozos megoldásokhoz anélkül, hogy a vállalkozás működésében jelentős kompromisszumokat kellett volna kötni.',
    },
    approach: {
      en: 'Started with analysis: mapped the existing process end to end, then modelled it properly instead of copying the spreadsheet. Automated the repetitive calculations and left the judgement calls to people.',
      hu: 'A fejlesztést részletes folyamat- és üzleti elemzéssel kezdtem. A meglévő működést teljes egészében feltérképeztem, majd a folyamatokat a táblázatok egyszerű leképezése helyett önálló üzleti modellként alakítottam ki. Az ismétlődő számításokat és manuális lépéseket automatizáltam, míg a szakmai mérlegelést igénylő döntéseket továbbra is a felhasználók kezében hagytam.',
    },
    outcome: {
      en: 'A system that matches how the business runs, with the monthly close measured in hours instead of days.',
      hu: 'A vállalkozás tényleges működéséhez igazodó rendszer, amely jelentősen csökkentette a manuális munkát, és a havi zárás idejét napokról órákra rövidítette.',
    },
  },
  {
    id: 'various-web-design',
    num: '07',
    title: 'Various web design',
    kind: { en: 'Websites & E-commerce', hu: 'Weboldalak és e-kereskedelmi megoldások' },
    category: 'web',
    filters: ['web'],
    visual: 'layout',
    period: '2018 — present',
    tags: ['WordPress', 'Shopify', 'WooCommerce', 'React', 'Next.js', 'UI/UX'],
    summary: {
      en: 'Modern websites, e-commerce experiences and custom web interfaces.',
      hu: 'Modern weboldalak, e-kereskedelmi megoldások és egyedi webes felületek tervezése és fejlesztése.',
    },
    role: { en: 'Designer / front-end developer', hu: 'Designer / frontend fejlesztő' },
    context: {
      en: 'Clients who need a site that looks considered and performs well, rather than a theme with their logo dropped into it.',
      hu: 'Olyan ügyfelek számára készülő digitális felületek, ahol nem elegendő egy meglévő sablon testreszabása: a megjelenésnek tudatosan megtervezettnek, a működésnek pedig gyorsnak és megbízhatónak kell lennie.',
    },
    approach: {
      en: 'Design and build in one pass: layout and type decisions made with the implementation in mind, then built in React or Next.js with real attention to performance, accessibility and the editing experience for whoever maintains it.',
      hu: 'A tervezést és a fejlesztést szorosan összekapcsolva végzem: a layout- és tipográfiai döntések már a technikai megvalósítás figyelembevételével születnek. A megoldásokat React vagy Next.js alapon építem fel, külön figyelmet fordítva a teljesítményre, az akadálymentességre és arra, hogy az átadás után a tartalom kezelése és a rendszer karbantartása is egyszerű maradjon.',
    },
    outcome: {
      en: 'Sites that load fast, rank well and stay maintainable after handover.',
      hu: 'Gyors, jól kereshető és hosszú távon is karbantartható weboldalak és e-kereskedelmi felületek.',
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
      hu: 'Egyedi digitális termékek és webalkalmazások fejlesztése speciális üzleti problémákra.',
    },
    role: { en: 'Product builder', hu: 'Termékfejlesztő' },
    context: {
      en: 'Problems that do not have a product category yet — internal tools, one-off platforms, automation that only makes sense for one company.',
      hu: 'Olyan problémák, amelyekre nincs kész termékkategória vagy megfelelő dobozos megoldás: belső vállalati eszközök, egyedi platformok és olyan automatizációk, amelyek egy adott vállalkozás működésére szabva teremtenek valódi értéket.',
    },
    approach: {
      en: 'Short discovery, a working prototype early, then iterate against real use. Containerised deployment from day one so that moving from prototype to production is a configuration change, not a rewrite.',
      hu: 'Rövid felméréssel és korai, működő prototípussal indulok, majd a megoldást a valós használatból származó visszajelzések alapján iterálom. A konténerizált üzemeltetést már a fejlesztés kezdetétől kialakítom, így a prototípus éles környezetbe történő átültetése elsősorban konfigurációs feladat, nem pedig teljes újratervezés.',
    },
    outcome: {
      en: 'Products that exist because someone needed them, not because the market had a slot for them.',
      hu: 'Célzott digitális termékek és megoldások, amelyeket konkrét üzleti problémákra építünk — nem egy meglévő termékkategóriába próbáljuk beleilleszteni az igényt.',
    },
  },
];

export const filterKeys: FilterKey[] = ['all', 'enterprise', 'finance', 'government', 'web', 'custom'];
