export type Lang = 'en' | 'hu' | 'sk';
/** every language the site is published in, in switcher order */
export const LANGS: readonly Lang[] = ['en', 'hu', 'sk'];
export type L10n = Record<Lang, string>;

export type CategoryKey =
  | 'enterprise'
  | 'finance'
  | 'government'
  | 'data'
  | 'business'
  | 'web'
  | 'custom'
  | 'consulting'
  | 'design'
  | 'analysis';

export type FilterKey = 'all' | 'enterprise' | 'finance' | 'government' | 'web' | 'custom' | 'consulting';

export type VisualKey =
  | 'dashboard'
  | 'ledger'
  | 'market'
  | 'map'
  | 'pipeline'
  | 'table'
  | 'layout'
  | 'cube'
  | 'compass'
  | 'lens'
  | 'flow';

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
    kind: { en: 'Enterprise Management Platform', hu: 'Vállalati menedzsmentplatform', sk: 'Podniková platforma na riadenie' },
    client: 'Tricise',
    category: 'enterprise',
    filters: ['enterprise'],
    visual: 'dashboard',
    period: '2025 — present',
    tags: ['Java', 'Angular', 'Spring', 'Clarity', 'Automic'],
    summary: {
      en: 'Development, architecture and long-term support.',
      hu: 'Fejlesztés, rendszerarchitektúra és hosszú távú támogatás.',
      sk: 'Vývoj, architektúra a dlhodobá podpora.',
    },
    role: {
      en: 'Full-stack developer / architect',
      hu: 'Full-stack fejlesztő / architekt',
      sk: 'Full-stack vývojár / architekt',
    },
    context: {
      en: 'A long-lived enterprise product used by operations teams to orchestrate and monitor complex workloads. The system has to stay predictable across releases while absorbing a steady stream of customer-specific requirements.',
      hu: 'Hosszú életciklusú vállalati termék, amelyet üzemeltetési csapatok használnak összetett folyamatok vezérlésére és felügyeletére. A rendszernek minden új kiadás mellett stabilan és kiszámíthatóan kell működnie, miközben folyamatosan új, ügyfélspecifikus igényekkel bővül.',
      sk: 'Podnikový produkt s dlhým životným cyklom, ktorý prevádzkové tímy používajú na riadenie a monitorovanie zložitých procesov. Systém musí zostať predvídateľný naprieč vydaniami a zároveň priebežne vstrebávať nové požiadavky konkrétnych zákazníkov.',
    },
    approach: {
      en: 'Worked across the entire stack: domain modelling and Spring services on the backend, an Angular front end built on the Clarity design system, and Automic integration for scheduling and job control. A large part of the work was architectural — keeping modules isolated enough that features could ship independently.',
      hu: 'A teljes technológiai stacken dolgoztam: a backend domainmodelljeinek és Spring-alapú szolgáltatásainak kialakításától az Angular és Clarity Design System alapú frontend fejlesztésén át az Automic integrációjáig. A munka jelentős része rendszertervezési és architekturális feladat volt: a modulokat úgy alakítottam ki, hogy azok megfelelően elkülönüljenek, és a funkciók egymástól függetlenül is fejleszthetők és szállíthatók legyenek.',
      sk: 'Pracoval som naprieč celým stackom: od doménového modelu a Spring služieb na backende cez Angular frontend postavený na dizajnovom systéme Clarity až po integráciu s Automic na plánovanie a riadenie úloh. Veľká časť práce bola architektonická — moduly som oddelil tak, aby sa jednotlivé funkcie dali vyvíjať a nasadzovať nezávisle.',
    },
    outcome: {
      en: 'Years of continuous delivery on a product that enterprise customers run in production, with a codebase that new developers can still reason about.',
      hu: 'Folyamatos fejlesztés és szállítás egy éles környezetben használt vállalati terméken, miközben a kódbázis hosszú távon is átlátható és továbbfejleszthető maradt.',
      sk: 'Roky nepretržitého vývoja a dodávok na produkte, ktorý podnikoví zákazníci používajú v produkcii — s kódom, v ktorom sa noví vývojári stále dokážu zorientovať.',
    },
  },
  {
    id: 'bank-projects',
    num: '02',
    title: 'Bank projects',
    kind: { en: 'Banking Platform Modernization', hu: 'Banki platformok modernizációja', sk: 'Modernizácia bankových platforiem' },
    client: 'Merkantil Bank',
    category: 'finance',
    filters: ['finance', 'enterprise'],
    visual: 'ledger',
    period: '2024 — 2025',
    tags: ['Java', 'Angular', 'Spring Boot', 'Banking', 'Integration'],
    summary: {
      en: 'Software systems and integrations developed for Merkantil Bank.',
      hu: 'Szoftverrendszerek és integrációk fejlesztése a Merkantil Bank számára.',
      sk: 'Softvérové systémy a integrácie vyvinuté pre Merkantil Bank.',
    },
    role: { en: 'Full-stack developer', hu: 'Full-stack fejlesztő', sk: 'Full-stack vývojár' },
    context: {
      en: 'Financial systems where correctness is not negotiable and where most of the difficulty lives in the seams between existing platforms rather than in any single application.',
      hu: 'Pénzügyi rendszerek, ahol a pontosság és megbízhatóság alapkövetelmény. A komplexitás jelentős része a meglévő rendszerek és platformok közötti integrációkból adódott, nem pedig egyetlen alkalmazás működéséből.',
      sk: 'Finančné systémy, kde presnosť nie je predmetom kompromisu a kde väčšina zložitosti nespočíva v jednej aplikácii, ale v prepojeniach medzi existujúcimi platformami.',
    },
    approach: {
      en: 'Built Spring Boot services and Angular interfaces around existing core banking processes, with careful attention to data validation, auditability and integration contracts. Requirements were refined directly with business stakeholders before a line of code was written.',
      hu: 'Spring Boot alapú backend szolgáltatásokat és Angular felületeket fejlesztettem a meglévő banki folyamatokra építve. Kiemelt figyelmet fordítottam az adatvalidációra, az auditálhatóságra és az integrációs szerződések pontos kialakítására. A követelményeket közvetlenül az üzleti szereplőkkel egyeztettük és pontosítottuk már a fejlesztés megkezdése előtt.',
      sk: 'Vyvíjal som Spring Boot služby a Angular rozhrania nadväzujúce na existujúce bankové procesy, s dôrazom na validáciu dát, auditovateľnosť a presne definované integračné kontrakty. Požiadavky sme spresňovali priamo s biznisom ešte predtým, než vznikol prvý riadok kódu.',
    },
    outcome: {
      en: 'Integrations that survived audit, and internal tools that replaced manual, error-prone steps in daily banking operations.',
      hu: 'Megbízható, auditálható integrációk és olyan belső rendszerek készültek, amelyek kiváltották a napi banki működés több manuális és hibára hajlamos lépését.',
      sk: 'Integrácie, ktoré obstáli pri audite, a interné nástroje, ktoré nahradili manuálne a chybové kroky v každodennej prevádzke banky.',
    },
  },
  {
    id: 'refugee-management-system',
    num: '03',
    title: 'Refugee management system',
    kind: { en: 'Government Platform', hu: 'Államigazgatási platform', sk: 'Platforma pre verejnú správu' },
    client: 'ICZ',
    category: 'government',
    filters: ['government', 'enterprise'],
    visual: 'map',
    period: '2022 — 2023',
    tags: ['Java', 'Spring Boot', 'Angular', 'Security', 'Government'],
    summary: {
      en: 'Government project for the Czech Republic. A complex system for managing refugee-related processes and information.',
      hu: 'Államigazgatási projekt a Cseh Köztársaság számára, menekültügyi folyamatok és kapcsolódó adatok kezelésére.',
      sk: 'Projekt verejnej správy pre Českú republiku. Komplexný systém na správu procesov a informácií súvisiacich s utečencami.',
    },
    role: { en: 'Full-stack developer', hu: 'Full-stack fejlesztő', sk: 'Full-stack vývojár' },
    context: {
      en: 'A public-sector system handling sensitive personal data under real time pressure, used by caseworkers who cannot afford an interface that slows them down.',
      hu: 'Közszférában használt rendszer érzékeny személyes adatok kezelésére, ahol az ügyintézők napi munkáját valós időben támogató, gyors és megbízható működés alapvető követelmény volt.',
      sk: 'Systém verejného sektora, ktorý pracuje s citlivými osobnými údajmi pod skutočným časovým tlakom a ktorý používajú referenti, ktorí si nemôžu dovoliť rozhranie, ktoré ich brzdí.',
    },
    approach: {
      en: 'Role-based access control, strict data protection boundaries and an audit trail were designed in from the start rather than bolted on. The front end was deliberately plain and fast: dense forms, keyboard-friendly flows, no decoration that costs a click.',
      hu: 'A szerepkör-alapú jogosultságkezelést, a szigorú adatvédelmi szabályokat és az auditálhatóságot már a rendszer tervezése során beépítettük. A frontend kialakításánál elsődleges szempont volt a gyors és hatékony munkavégzés: letisztult felületek, sűrű információs elrendezés és billentyűzetbarát munkafolyamatok kerültek előtérbe a felesleges vizuális elemek helyett.',
      sk: 'Riadenie prístupu podľa rolí, prísne hranice ochrany údajov a auditná stopa boli súčasťou návrhu od začiatku, nie dodatočne pridané. Frontend bol zámerne strohý a rýchly: husté formuláre, postupy prívetivé ku klávesnici a žiadne ozdoby, ktoré stoja kliknutie navyše.',
    },
    outcome: {
      en: 'A production system supporting real administrative work, built to meet public-sector security and data-protection expectations.',
      hu: 'Éles környezetben működő rendszer, amely valódi hatósági munkafolyamatokat támogat, miközben megfelel a közszféra biztonsági és adatvédelmi követelményeinek.',
      sk: 'Produkčný systém, ktorý podporuje skutočnú úradnú agendu a spĺňa nároky verejného sektora na bezpečnosť a ochranu údajov.',
    },
  },
  {
    id: 'wexo',
    num: '04',
    title: 'Stock Market Webapp',
    kind: { en: 'Fintech Platform', hu: 'Fintech platform', sk: 'Fintech platforma' },
    client: 'Wexo',
    category: 'finance',
    filters: ['finance', 'web'],
    visual: 'market',
    period: '2021 — 2022',
    tags: ['Node.js', 'Angular', 'TypeScript', 'REST'],
    summary: {
      en: 'Backend infrastructure in Node.js, front end in Angular — one owner across both.',
      hu: 'Node.js alapú backend és Angular frontend fejlesztése, a teljes technológiai réteg átfogó felelősségével.',
      sk: 'Backendová infraštruktúra v Node.js, frontend v Angulari — jeden zodpovedný človek za obe strany.',
    },
    role: { en: 'Full-stack developer', hu: 'Full-stack fejlesztő', sk: 'Full-stack vývojár' },
    context: {
      en: 'A market application, where the interface has to stay readable while the numbers under it keep moving, and the backend has to keep up with the data feeding them.',
      hu: 'Tőzsdei alkalmazás, ahol a felületnek nagy mennyiségű és folyamatosan változó adat mellett is jól olvashatónak és használhatónak kell maradnia, miközben a backendnek stabilan kell kiszolgálnia az adatfolyamot.',
      sk: 'Burzová aplikácia, v ktorej musí rozhranie zostať čitateľné, aj keď sa čísla neustále menia, a backend musí stíhať dáta, ktoré ich živia.',
    },
    approach: {
      en: 'Built the backend infrastructure in Node.js — services, data handling and the API the client reads from — and the Angular front end on top of it. Owning both sides meant the API contract was shaped by what the interface actually needed, rather than negotiated after the fact.',
      hu: 'Node.js alapú backend infrastruktúrát fejlesztettem, beleértve a szolgáltatásokat, az adatkezelést és a frontend által használt API-kat, valamint az erre épülő Angular felületet. Mivel a frontend és a backend fejlesztése egy kézben volt, az API-k kialakítása közvetlenül a tényleges felhasználói és frontend igényekhez igazodhatott.',
      sk: 'Postavil som backendovú infraštruktúru v Node.js — služby, prácu s dátami a API, z ktorého klient číta — a nad ňou Angular frontend. Keďže som mal na starosti obe strany, API sa formovalo podľa toho, čo rozhranie skutočne potrebovalo, a nie dohadovalo dodatočne.',
    },
    outcome: {
      en: 'A front end and a backend designed together instead of across team boundaries, with market data reaching the screen through one owner rather than three handovers.',
      hu: 'A frontend és backend egymással összehangoltan készült, így az adatmodell, az API-k és a felhasználói felület nem különálló rétegekként, hanem egy egységes rendszer részeként fejlődtek.',
      sk: 'Frontend a backend navrhnuté spoločne, nie cez hranice tímov — trhové dáta sa na obrazovku dostávajú cez jedného zodpovedného človeka namiesto troch odovzdávok.',
    },
  },
  {
    id: 'reporting-system',
    num: '05',
    title: 'Reporting system',
    kind: { en: 'Reporting & Data Platform', hu: 'Riportálási és adatplatform', sk: 'Reportingová a dátová platforma' },
    client: 'Slovnaft / MOL Group',
    category: 'data',
    filters: ['enterprise'],
    visual: 'pipeline',
    period: '2019 — 2020',
    tags: ['Java', 'SQL', 'LIMS', 'Reporting', 'ETL'],
    summary: {
      en: 'Reporting and data solutions for Slovnaft / MOL Group, built inside their own LIMS.',
      hu: 'Riportálási és adatmegoldások fejlesztése a Slovnaft / MOL Group számára, a vállalat saját LIMS-rendszerében.',
      sk: 'Reportingové a dátové riešenia pre Slovnaft / MOL Group, vytvorené priamo v ich vlastnom systéme LIMS.',
    },
    role: { en: 'Developer / data engineer', hu: 'Fejlesztő / adatmérnök', sk: 'Vývojár / dátový inžinier' },
    context: {
      en: 'Operational and financial data spread across several systems, needed in a form that management could actually act on.',
      hu: 'Több különböző rendszerben rendelkezésre álló működési és pénzügyi adatok, amelyeket a vezetőség számára egységes, megbízható és döntéstámogatásra alkalmas formában kellett elérhetővé tenni.',
      sk: 'Prevádzkové a finančné dáta roztrúsené v niekoľkých systémoch, ktoré bolo treba dostať do podoby, podľa ktorej môže vedenie skutočne rozhodovať.',
    },
    approach: {
      en: 'Worked inside the company\u2019s own LIMS (laboratory information management system), with SQL for the data work. Designed ETL routines to consolidate sources, then built reporting layers on top with an emphasis on reproducibility — the same report run twice has to produce the same numbers, and it has to be possible to explain where each figure came from.',
      hu: 'A munka a vállalat saját LIMS-rendszerén (laboratóriumi információkezelő rendszer) belül zajlott, SQL-lel. ETL-folyamatokat terveztem és fejlesztettem a különböző adatforrások konszolidálására, majd ezekre építettem a riportálási réteget. Kiemelt szempont volt a reprodukálhatóság: ugyanannak a riportnak azonos adatokból mindig ugyanazt az eredményt kellett adnia, miközben az egyes értékek eredete is visszakövethető maradt.',
      sk: 'Pracoval som priamo vo firemnom systéme LIMS (laboratórny informačný manažérsky systém) a na prácu s dátami som používal SQL. Navrhol som ETL procesy na konsolidáciu zdrojov a nad nimi vybudoval reportingovú vrstvu s dôrazom na reprodukovateľnosť — ten istý report spustený dvakrát musí dať rovnaké čísla a pri každej hodnote musí byť možné vysvetliť, odkiaľ pochádza.',
    },
    outcome: {
      en: 'Automated reporting that removed recurring manual spreadsheet work and shortened the path from raw data to decision.',
      hu: 'Automatizált riportálási folyamatok váltották ki a rendszeresen ismétlődő manuális táblázatkezelést, jelentősen lerövidítve az utat a nyers adatoktól a döntéstámogató információkig.',
      sk: 'Automatizovaný reporting, ktorý odstránil opakovanú manuálnu prácu s tabuľkami a skrátil cestu od surových dát k rozhodnutiu.',
    },
  },
  {
    id: 'accounting-system',
    num: '06',
    title: 'Accounting system',
    kind: { en: 'Custom Accounting System', hu: 'Egyedi könyvelési rendszer', sk: 'Účtovný systém na mieru' },
    category: 'business',
    filters: ['custom', 'finance'],
    visual: 'table',
    period: '2018',
    tags: ['Java', 'Angular', 'Finance', 'Automation'],
    summary: {
      en: 'Custom accounting software built around specific business requirements.',
      hu: 'Egyedi könyvelési szoftver fejlesztése konkrét üzleti folyamatokra szabva.',
      sk: 'Účtovný softvér na mieru, postavený na konkrétnych požiadavkách firmy.',
    },
    role: { en: 'Full-stack developer / analyst', hu: 'Full-stack fejlesztő / elemző', sk: 'Full-stack vývojár / analytik' },
    context: {
      en: 'A business whose accounting process did not fit any off-the-shelf package without expensive compromises in how the company actually works.',
      hu: 'Olyan vállalati környezet, ahol a meglévő könyvelési folyamatok nem illeszkedtek megfelelően a kész, dobozos megoldásokhoz anélkül, hogy a vállalkozás működésében jelentős kompromisszumokat kellett volna kötni.',
      sk: 'Firma, ktorej účtovné procesy nezapadali do žiadneho krabicového riešenia bez drahých kompromisov v tom, ako skutočne funguje.',
    },
    approach: {
      en: 'Started with analysis: mapped the existing process end to end, then modelled it properly instead of copying the spreadsheet. Automated the repetitive calculations and left the judgement calls to people.',
      hu: 'A fejlesztést részletes folyamat- és üzleti elemzéssel kezdtem. A meglévő működést teljes egészében feltérképeztem, majd a folyamatokat a táblázatok egyszerű leképezése helyett önálló üzleti modellként alakítottam ki. Az ismétlődő számításokat és manuális lépéseket automatizáltam, míg a szakmai mérlegelést igénylő döntéseket továbbra is a felhasználók kezében hagytam.',
      sk: 'Začal som analýzou: zmapoval som existujúci proces od začiatku do konca a potom ho poriadne namodeloval namiesto toho, aby som len skopíroval tabuľku. Opakujúce sa výpočty som automatizoval a rozhodnutia, ktoré si vyžadujú úsudok, som nechal na ľuďoch.',
    },
    outcome: {
      en: 'A system that matches how the business runs, with the monthly close measured in hours instead of days.',
      hu: 'A vállalkozás tényleges működéséhez igazodó rendszer, amely jelentősen csökkentette a manuális munkát, és a havi zárás idejét napokról órákra rövidítette.',
      sk: 'Systém, ktorý zodpovedá tomu, ako firma funguje — mesačná uzávierka sa meria v hodinách, nie v dňoch.',
    },
  },
  {
    id: 'various-web-design',
    num: '07',
    title: 'Various web design',
    kind: { en: 'Websites & E-commerce', hu: 'Weboldalak és e-kereskedelmi megoldások', sk: 'Webstránky a e-commerce' },
    category: 'web',
    filters: ['web'],
    visual: 'layout',
    period: '2018 — present',
    tags: ['WordPress', 'Shopify', 'WooCommerce', 'React', 'Next.js', 'UI/UX'],
    summary: {
      en: 'Modern websites, e-commerce experiences and custom web interfaces.',
      hu: 'Modern weboldalak, e-kereskedelmi megoldások és egyedi webes felületek tervezése és fejlesztése.',
      sk: 'Moderné webstránky, e-shopy a webové rozhrania na mieru.',
    },
    role: { en: 'Designer / front-end developer', hu: 'Designer / frontend fejlesztő', sk: 'Dizajnér / frontend vývojár' },
    context: {
      en: 'Clients who need a site that looks considered and performs well, rather than a theme with their logo dropped into it.',
      hu: 'Olyan ügyfelek számára készülő digitális felületek, ahol nem elegendő egy meglévő sablon testreszabása: a megjelenésnek tudatosan megtervezettnek, a működésnek pedig gyorsnak és megbízhatónak kell lennie.',
      sk: 'Klienti, ktorí potrebujú web, ktorý pôsobí premyslene a dobre funguje — nie šablónu, do ktorej niekto vložil ich logo.',
    },
    approach: {
      en: 'Design and build in one pass: layout and type decisions made with the implementation in mind, then built in React or Next.js with real attention to performance, accessibility and the editing experience for whoever maintains it.',
      hu: 'A tervezést és a fejlesztést szorosan összekapcsolva végzem: a layout- és tipográfiai döntések már a technikai megvalósítás figyelembevételével születnek. A megoldásokat React vagy Next.js alapon építem fel, külön figyelmet fordítva a teljesítményre, az akadálymentességre és arra, hogy az átadás után a tartalom kezelése és a rendszer karbantartása is egyszerű maradjon.',
      sk: 'Návrh a vývoj v jednom kroku: rozhodnutia o rozložení a typografii vznikajú s ohľadom na implementáciu, potom web postavím v Reacte alebo Next.js so skutočným dôrazom na výkon, prístupnosť a pohodlnú správu obsahu pre toho, kto sa oň bude starať.',
    },
    outcome: {
      en: 'Sites that load fast, rank well and stay maintainable after handover.',
      hu: 'Gyors, jól kereshető és hosszú távon is karbantartható weboldalak és e-kereskedelmi felületek.',
      sk: 'Weby, ktoré sa rýchlo načítajú, dobre sa umiestňujú vo vyhľadávaní a dajú sa ľahko udržiavať aj po odovzdaní.',
    },
  },
  {
    id: 'custom-solutions',
    num: '08',
    title: 'Custom solutions',
    kind: { en: 'Tailor-made Digital Products', hu: 'Egyedi digitális termékek', sk: 'Digitálne produkty na mieru' },
    category: 'custom',
    filters: ['custom'],
    visual: 'cube',
    tags: ['Java', 'Angular', 'React', 'AI', 'Cloud', 'Docker'],
    summary: {
      en: 'Tailor-made digital products and web applications for unique business challenges.',
      hu: 'Egyedi digitális termékek és webalkalmazások fejlesztése speciális üzleti problémákra.',
      sk: 'Digitálne produkty a webové aplikácie na mieru pre jedinečné podnikateľské výzvy.',
    },
    role: { en: 'Product builder', hu: 'Termékfejlesztő', sk: 'Tvorca produktov' },
    context: {
      en: 'Problems that do not have a product category yet — internal tools, one-off platforms, automation that only makes sense for one company.',
      hu: 'Olyan problémák, amelyekre nincs kész termékkategória vagy megfelelő dobozos megoldás: belső vállalati eszközök, egyedi platformok és olyan automatizációk, amelyek egy adott vállalkozás működésére szabva teremtenek valódi értéket.',
      sk: 'Problémy, pre ktoré ešte neexistuje produktová kategória — interné nástroje, jedinečné platformy a automatizácia, ktorá dáva zmysel len pre jednu konkrétnu firmu.',
    },
    approach: {
      en: 'Short discovery, a working prototype early, then iterate against real use. Containerised deployment from day one so that moving from prototype to production is a configuration change, not a rewrite.',
      hu: 'Rövid felméréssel és korai, működő prototípussal indulok, majd a megoldást a valós használatból származó visszajelzések alapján iterálom. A konténerizált üzemeltetést már a fejlesztés kezdetétől kialakítom, így a prototípus éles környezetbe történő átültetése elsősorban konfigurációs feladat, nem pedig teljes újratervezés.',
      sk: 'Krátka úvodná analýza, čo najskôr funkčný prototyp a potom iterácie podľa reálneho používania. Kontajnerizované nasadenie od prvého dňa, aby prechod z prototypu do produkcie bol otázkou konfigurácie, nie prepisovania.',
    },
    outcome: {
      en: 'Products that exist because someone needed them, not because the market had a slot for them.',
      hu: 'Célzott digitális termékek és megoldások, amelyeket konkrét üzleti problémákra építünk — nem egy meglévő termékkategóriába próbáljuk beleilleszteni az igényt.',
      sk: 'Produkty, ktoré existujú preto, že ich niekto potreboval — nie preto, že na trhu bolo pre ne voľné miesto.',
    },
  },
  {
    id: 'digital-consulting',
    num: '09',
    title: 'Digital consulting',
    kind: { en: 'Opportunity & Technology Consulting', hu: 'Lehetőség- és technológiai tanácsadás', sk: 'Konzultácie príležitostí a technológií' },
    category: 'consulting',
    filters: ['consulting'],
    visual: 'compass',
    tags: ['Discovery', 'Digital strategy', 'AI', 'Automation', 'Process mapping', 'Roadmap'],
    summary: {
      en: 'Consulting on where digital tools, automation and AI can create real value — before anything is built.',
      hu: 'Tanácsadás arról, hol teremthetnek valódi értéket a digitális eszközök, az automatizáció és az AI — még mielőtt bármi elkészülne.',
      sk: 'Konzultácie o tom, kde môžu digitálne nástroje, automatizácia a AI priniesť skutočnú hodnotu — ešte predtým, než sa čokoľvek začne stavať.',
    },
    role: { en: 'Consultant', hu: 'Tanácsadó', sk: 'Konzultant' },
    context: {
      en: 'Businesses that know something could work better — more enquiries, less admin, a system they have outgrown — but are not sure whether the answer is a website, an automation, AI, an integration or custom software.',
      hu: 'Olyan vállalkozások, amelyek érzik, hogy valami jobban is működhetne — több érdeklődő, kevesebb adminisztráció, egy kinőtt rendszer —, de nem biztosak benne, hogy a megoldás weboldal, automatizáció, AI, rendszerintegráció vagy egyedi szoftver.',
      sk: 'Firmy, ktoré cítia, že by niečo mohlo fungovať lepšie — viac dopytov, menej administratívy, systém, z ktorého už vyrástli —, no nie sú si isté, či je riešením web, automatizácia, AI, integrácia alebo softvér na mieru.',
    },
    approach: {
      en: 'Start from the business, not the technology: map the current processes, find where time, money or leads are lost, then compare the options on cost, risk and expected return. The result is a prioritised, realistic roadmap — including the things that are not worth building.',
      hu: 'Az üzletből indulok ki, nem a technológiából: feltérképezem a jelenlegi folyamatokat, megkeresem, hol vész el idő, pénz vagy érdeklődő, majd költség, kockázat és várható megtérülés alapján összevetem a lehetőségeket. Az eredmény egy priorizált, reális ütemterv — benne azzal is, amit nem érdemes megépíteni.',
      sk: 'Vychádzam z biznisu, nie z technológie: zmapujem súčasné procesy, nájdem miesta, kde sa strácajú čas, peniaze alebo potenciálni zákazníci, a potom porovnám možnosti podľa nákladov, rizika a očakávanej návratnosti. Výsledkom je prioritizovaný a realistický plán — vrátane vecí, ktoré sa neoplatí stavať.',
    },
    outcome: {
      en: 'Clear decisions before the budget is spent, and projects that start from a real problem.',
      hu: 'Megalapozott döntések még a költségvetés elköltése előtt, és valós problémából induló projektek.',
      sk: 'Jasné rozhodnutia ešte pred minutím rozpočtu a projekty, ktoré vychádzajú zo skutočného problému.',
    },
  },
  {
    id: 'brand-and-photography',
    num: '10',
    title: 'Brand identity & photography',
    kind: { en: 'Visual Identity, Product & Portrait Photos', hu: 'Arculat, termék- és portréfotók', sk: 'Vizuálna identita, produktové a portrétne fotografie' },
    category: 'design',
    filters: ['web'],
    visual: 'lens',
    tags: ['Brand identity', 'Logo', 'Typography', 'Colour systems', 'Product photography', 'Portraits'],
    summary: {
      en: 'Brand identities and original product and portrait photography, so a site does not have to rely on stock images.',
      hu: 'Arculattervezés, valamint saját termék- és portréfotók, hogy egy weboldalnak ne stockképekre kelljen támaszkodnia.',
      sk: 'Vizuálne identity a vlastné produktové a portrétne fotografie, aby sa web nemusel spoliehať na fotobanky.',
    },
    role: { en: 'Brand designer / photographer', hu: 'Arculattervező / fotós', sk: 'Dizajnér značky / fotograf' },
    context: {
      en: 'A new site is only as convincing as what goes on it. Many businesses have no consistent logo, colours or type, and no photos of their own products or people.',
      hu: 'Egy új weboldal csak annyira meggyőző, amennyire a tartalma. Sok vállalkozásnak nincs egységes logója, színvilága vagy tipográfiája, és nincsenek saját fotói a termékeiről vagy a csapatáról.',
      sk: 'Nový web je len taký presvedčivý ako jeho obsah. Mnohé firmy nemajú jednotné logo, farby ani typografiu a nemajú vlastné fotografie svojich produktov či ľudí.',
    },
    approach: {
      en: 'Identity first: logo, colour palette, typography and simple usage rules that work on the web, in print and on social media. Then photography planned for the site itself — product shots on consistent backgrounds and portraits in a matching style, edited and exported for fast loading.',
      hu: 'Először az arculat: logó, színpaletta, tipográfia és egyszerű használati szabályok, amelyek weben, nyomtatásban és a közösségi médiában is működnek. Ezután a fotózás, kifejezetten a weboldalhoz tervezve — egységes hátterű termékfotók és hozzájuk illő stílusú portrék, gyors betöltésre optimalizálva.',
      sk: 'Najprv identita: logo, farebná paleta, typografia a jednoduché pravidlá používania, ktoré fungujú na webe, v tlači aj na sociálnych sieťach. Potom fotografie plánované priamo pre web — produktové zábery na jednotnom pozadí a portréty v zladenom štýle, upravené a exportované pre rýchle načítanie.',
    },
    outcome: {
      en: 'A consistent, recognisable brand and authentic images that build more trust than stock photos.',
      hu: 'Egységes, felismerhető arculat és hiteles képek, amelyek több bizalmat építenek, mint a stockfotók.',
      sk: 'Jednotná, rozpoznateľná značka a autentické fotografie, ktoré budujú viac dôvery než zábery z fotobánk.',
    },
  },
  {
    id: 'business-analysis',
    num: '11',
    title: 'Business analysis & documentation',
    kind: { en: 'Requirements, Processes & System Documentation', hu: 'Követelmények, folyamatok és rendszerdokumentáció', sk: 'Požiadavky, procesy a systémová dokumentácia' },
    category: 'analysis',
    filters: ['consulting', 'enterprise'],
    visual: 'flow',
    tags: ['Requirements', 'Process modelling', 'BPMN', 'UML', 'User stories', 'Documentation'],
    summary: {
      en: 'Turning business needs into clear requirements, and documenting how existing systems actually work.',
      hu: 'Az üzleti igények egyértelmű követelményekké alakítása, és a meglévő rendszerek tényleges működésének dokumentálása.',
      sk: 'Premena biznisových potrieb na jasné požiadavky a zdokumentovanie toho, ako existujúce systémy skutočne fungujú.',
    },
    role: { en: 'Business analyst', hu: 'Üzleti elemző', sk: 'Biznis analytik' },
    context: {
      en: "Projects rarely fail on code alone; they fail on unclear requirements and on systems whose logic lives only in a few people's heads. Before a rebuild, a modernisation or a handover, someone has to write down what the system does and what the business really needs.",
      hu: 'A projektek ritkán csak a kódon buknak el; sokkal gyakrabban a tisztázatlan követelményeken és azokon a rendszereken, amelyek logikája csak néhány ember fejében létezik. Egy újraírás, modernizáció vagy átadás előtt valakinek le kell írnia, mit csinál a rendszer, és mire van valójában szüksége az üzletnek.',
      sk: 'Projekty len zriedka zlyhajú iba na kóde; zlyhávajú na nejasných požiadavkách a na systémoch, ktorých logika existuje len v hlavách niekoľkých ľudí. Pred prestavbou, modernizáciou či odovzdaním musí niekto spísať, čo systém robí a čo biznis naozaj potrebuje.',
    },
    approach: {
      en: 'Interviews with the people who use the system, analysis of the existing code and data, and process models (BPMN, UML) that both developers and business stakeholders can read. Requirements are broken down into user stories with acceptance criteria, and the documentation is kept where the team already works.',
      hu: 'Interjúk a rendszert használó munkatársakkal, a meglévő kód és adatok elemzése, valamint olyan folyamatmodellek (BPMN, UML), amelyeket a fejlesztők és az üzleti oldal is értenek. A követelményeket elfogadási feltételekkel ellátott user story-kra bontom, a dokumentációt pedig ott tartom karban, ahol a csapat amúgy is dolgozik.',
      sk: 'Rozhovory s ľuďmi, ktorí systém používajú, analýza existujúceho kódu a dát a procesné modely (BPMN, UML), ktorým rozumejú vývojári aj biznis. Požiadavky rozdelím na user stories s akceptačnými kritériami a dokumentáciu udržiavam tam, kde tím aj tak pracuje.',
    },
    outcome: {
      en: 'Shared understanding between business and IT, fewer surprises during development, and systems that can be handed over.',
      hu: 'Közös értelmezés az üzleti és az IT oldal között, kevesebb meglepetés a fejlesztés során, és átadható rendszerek.',
      sk: 'Spoločné porozumenie medzi biznisom a IT, menej prekvapení počas vývoja a systémy, ktoré sa dajú odovzdať.',
    },
  },
];

export const filterKeys: FilterKey[] = ['all', 'enterprise', 'finance', 'government', 'web', 'custom', 'consulting'];
