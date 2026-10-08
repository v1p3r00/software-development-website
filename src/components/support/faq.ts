import type { L10n } from '../../data/projects';

/**
 * The assistant's hand-written answers. Everything about the site's content (services,
 * projects, demos, articles, technologies) is read from the site data in knowledge.ts —
 * this file only holds the things a visitor asks that no page answers in one line.
 *
 * Edit freely: `keys` are extra search words (accents and letter case don't matter,
 * word endings are matched loosely), `next` are the follow-up buttons under the answer.
 * Prices and timelines are guide figures — keep them in line with the pricing article.
 */

export type Next =
  | { faq: string }
  | { order: true }
  | { show: 'services' | 'projects' | 'demos' | 'landings' | 'articles' | 'stack' }
  | { href: string; label: L10n }
  | { human: true };

export interface Faq {
  id: string;
  /** the question as shown on a button */
  q: L10n;
  /** the answer, plain text; a blank line starts a new bubble */
  a: L10n;
  keys: { en: string[]; hu: string[] };
  next?: Next[];
  /** a link card under the answer */
  link?: { href: string; label: L10n };
}

export const faqs: Faq[] = [
  {
    id: 'services',
    q: { en: 'What do you build?', hu: 'Mit fejlesztesz?' },
    a: {
      en: 'Websites, web applications, online shops and custom business software — from a single landing page to enterprise systems. Modernizing old sites and systems, AI integration and connecting systems through APIs are part of it too.',
      hu: 'Weboldalakat, webalkalmazásokat, webshopokat és egyedi üzleti szoftvereket — egyetlen landing oldaltól a vállalati rendszerekig. Ide tartozik a régi oldalak és rendszerek modernizálása, az MI-integráció és a rendszerek API-kon keresztüli összekötése is.',
    },
    keys: {
      en: ['build', 'make', 'offer', 'services', 'service', 'do', 'develop', 'help', 'work'],
      hu: ['szolgáltatás', 'szolgáltatások', 'készít', 'készítesz', 'fejleszt', 'fejlesztés', 'csinálsz', 'mit', 'segít', 'munka'],
    },
    next: [{ show: 'services' }, { show: 'projects' }, { order: true }],
  },
  {
    id: 'price-website',
    q: { en: 'How much does a website cost?', hu: 'Mennyibe kerül egy weboldal?' },
    a: {
      en: 'Typical ranges in Hungary (2026): a landing page €200–700, a company website €800–2,500, a site with custom design €1,100–4,000+, a simple online shop €1,400–4,000, a custom web application €2,700–14,000+.\n\nThese are guide prices, not fixed rates — content, design, integrations and admin needs decide the final figure. After a short free consultation you get a concrete quote.',
      hu: 'Jellemző hazai ársávok (2026): landing oldal 70–250 ezer Ft, céges weboldal 300–900 ezer Ft, egyedi designnal készült oldal 400 ezer–1,5 M Ft+, egyszerű webshop 500 ezer–1,5 M Ft, egyedi webalkalmazás 1–5 M Ft+.\n\nEzek irányárak, nem fix tarifák — a tartalom, a design, az integrációk és az adminisztrációs igények határozzák meg a végső összeget. Egy rövid, ingyenes konzultáció után konkrét ajánlatot kapsz.',
    },
    keys: {
      en: ['price', 'prices', 'cost', 'costs', 'much', 'budget', 'expensive', 'cheap', 'quote', 'pricing', 'fee', 'rate', 'website'],
      hu: ['ár', 'ára', 'árak', 'mennyibe', 'kerül', 'költség', 'költsége', 'drága', 'olcsó', 'árajánlat', 'díj', 'büdzsé', 'weboldal', 'honlap'],
    },
    link: {
      href: '/articles/how-much-does-a-website-cost-2026/',
      label: { en: 'How much does a website cost in 2026?', hu: 'Mennyibe kerül egy weboldal 2026-ban?' },
    },
    next: [{ order: true }, { faq: 'price-app' }, { faq: 'timeline' }],
  },
  {
    id: 'price-app',
    q: { en: 'What does a web app or custom software cost?', hu: 'Mennyibe kerül egy webalkalmazás vagy egyedi szoftver?' },
    a: {
      en: 'A custom web application typically starts around €2,700 and can go to €14,000 or more; complex enterprise systems start around €14,000. The biggest drivers are the number of user roles and workflows, integrations with other systems, and how much data and reporting is involved.\n\nA good way to keep the risk low is to start with a small first version (MVP) and grow it.',
      hu: 'Egy egyedi webalkalmazás jellemzően 1 M Ft körül kezdődik és 5 M Ft fölé is mehet; a komplex vállalati rendszerek 5 M Ft-tól indulnak. Az árat leginkább a felhasználói szerepkörök és munkafolyamatok száma, a más rendszerekkel való integrációk, valamint az adat- és riportigény határozza meg.\n\nA kockázatot jól csökkenti, ha egy kisebb első verzióval (MVP) indulunk, és azt bővítjük.',
    },
    keys: {
      en: ['app', 'application', 'webapp', 'software', 'custom', 'system', 'mvp', 'saas', 'portal', 'price', 'cost'],
      hu: ['alkalmazás', 'webalkalmazás', 'webapp', 'szoftver', 'egyedi', 'rendszer', 'mvp', 'portál', 'ár', 'költség', 'mennyibe'],
    },
    next: [{ order: true }, { faq: 'timeline' }, { show: 'projects' }],
  },
  {
    id: 'timeline',
    q: { en: 'How long does a project take?', hu: 'Mennyi idő alatt készül el?' },
    a: {
      en: 'As a rough guide: a landing page takes 1–2 weeks, a company website 2–6 weeks, an online shop or a first version of a web app 1–3 months. Larger systems are planned and delivered in stages.\n\nThe exact schedule is part of the proposal, and you see working progress along the way, not only at the end.',
      hu: 'Irányszámok: egy landing oldal 1–2 hét, egy céges weboldal 2–6 hét, egy webshop vagy egy webalkalmazás első verziója 1–3 hónap. A nagyobb rendszereket szakaszokra bontva tervezem és szállítom.\n\nA pontos ütemezés az ajánlat része, és közben is látod a működő részeket, nem csak a végén.',
    },
    keys: {
      en: ['long', 'time', 'timeline', 'weeks', 'months', 'deadline', 'fast', 'quickly', 'when', 'ready', 'duration'],
      hu: ['idő', 'mennyi', 'meddig', 'határidő', 'gyors', 'gyorsan', 'mikorra', 'hét', 'hónap', 'elkészül', 'átfutás'],
    },
    next: [{ faq: 'process' }, { order: true }],
  },
  {
    id: 'process',
    q: { en: 'How does a project work?', hu: 'Hogyan zajlik egy projekt?' },
    a: {
      en: '1. A short free consultation about your goals.\n2. A written proposal with scope, price and schedule.\n3. Design and development in steps, with regular previews you can click through.\n4. Launch, handover and support afterwards.\n\nYou always talk to the person who builds it.',
      hu: '1. Rövid, ingyenes konzultáció a céljaidról.\n2. Írásos ajánlat a tartalommal, az árral és az ütemezéssel.\n3. Tervezés és fejlesztés lépésenként, rendszeres, kipróbálható előnézetekkel.\n4. Élesítés, átadás és utána támogatás.\n\nMindig azzal beszélsz, aki fejleszti.',
    },
    keys: {
      en: ['process', 'work', 'works', 'steps', 'start', 'begin', 'how', 'workflow', 'collaboration', 'proposal'],
      hu: ['folyamat', 'zajlik', 'lépések', 'kezdés', 'indul', 'hogyan', 'menete', 'együttműködés', 'ajánlat'],
    },
    next: [{ faq: 'consultation' }, { order: true }],
  },
  {
    id: 'consultation',
    q: { en: 'Is the first consultation free?', hu: 'Ingyenes az első konzultáció?' },
    a: {
      en: 'Yes. The first conversation is free and without obligation — online or in person in Budapest. Send a short request here and you get a reply, usually within 24 hours.',
      hu: 'Igen. Az első beszélgetés ingyenes és nem kötelez semmire — online vagy személyesen Budapesten. Küldj egy rövid megkeresést itt, és általában 24 órán belül választ kapsz.',
    },
    keys: {
      en: ['consultation', 'free', 'call', 'meeting', 'meet', 'talk', 'discuss', 'online', 'person', 'budapest'],
      hu: ['konzultáció', 'ingyenes', 'hívás', 'találkozó', 'megbeszélés', 'beszélgetés', 'online', 'személyesen', 'budapest'],
    },
    next: [{ order: true }, { faq: 'contact' }],
  },
  {
    id: 'modernize',
    q: { en: 'Can you modernize my old website?', hu: 'Meg tudod újítani a régi weboldalamat?' },
    a: {
      en: 'Yes — that is one of the most common jobs: a faster, mobile-friendly, better-looking site that is easier to find on Google, keeping what already works (content, address, search ranking).\n\nThe modernization page shows three dated small-business sites next to their redesigns. Older business software can be modernized step by step too, without a risky big-bang rewrite.',
      hu: 'Igen — ez az egyik leggyakoribb feladat: gyorsabb, mobilbarát, szebb és a Google-ben jobban megtalálható oldal, úgy, hogy ami már működik (tartalom, cím, keresési helyezés), az megmarad.\n\nA modernizálás oldalon három elavult kisvállalkozói oldal látható az újratervezett változata mellett. A régebbi üzleti szoftverek is modernizálhatók lépésenként, kockázatos teljes újraírás nélkül.',
    },
    keys: {
      en: ['modernize', 'modernise', 'modernization', 'redesign', 'old', 'outdated', 'refresh', 'update', 'renew', 'legacy', 'rebuild', 'existing'],
      hu: ['modernizál', 'modernizálás', 'megújít', 'megújítás', 'újratervez', 'régi', 'elavult', 'frissít', 'felújít', 'legacy', 'meglévő', 'átalakít'],
    },
    link: { href: '/modernization/', label: { en: 'Website modernization: before & after', hu: 'Weboldal-modernizálás: előtte–utána' } },
    next: [{ order: true }, { faq: 'takeover' }],
  },
  {
    id: 'takeover',
    q: { en: 'Do you take over existing projects?', hu: 'Átveszel meglévő projektet?' },
    a: {
      en: 'Yes. Existing sites and applications can be taken over for fixes, new features or a gradual rebuild. The first step is a short review of the code and the hosting, so you know what state it is in and what makes sense next.',
      hu: 'Igen. Meglévő oldalak és alkalmazások átvehetők hibajavításra, új funkciókra vagy fokozatos újraépítésre. Az első lépés a kód és a tárhely rövid átnézése, hogy lásd, milyen állapotban van, és mi a következő ésszerű lépés.',
    },
    keys: {
      en: ['take', 'takeover', 'existing', 'inherit', 'previous', 'developer', 'agency', 'fix', 'bug', 'continue', 'maintain'],
      hu: ['átvesz', 'átvétel', 'meglévő', 'korábbi', 'fejlesztő', 'ügynökség', 'javít', 'hiba', 'folytat', 'karbantart'],
    },
    next: [{ faq: 'support' }, { order: true }],
  },
  {
    id: 'support',
    q: { en: 'What happens after launch?', hu: 'Mi történik az élesítés után?' },
    a: {
      en: 'You get a handover and a short walkthrough. After that, support and maintenance can continue as needed: updates, fixes, monitoring, new features — agreed in advance, so there are no surprises.',
      hu: 'Átadást és rövid bemutatót kapsz. Utána a támogatás és karbantartás igény szerint folytatódhat: frissítések, javítások, felügyelet, új funkciók — előre egyeztetve, meglepetések nélkül.',
    },
    keys: {
      en: ['after', 'launch', 'support', 'maintenance', 'updates', 'guarantee', 'warranty', 'monitoring', 'help', 'later'],
      hu: ['után', 'élesítés', 'támogatás', 'karbantartás', 'frissítés', 'garancia', 'felügyelet', 'később', 'üzemeltetés'],
    },
    next: [{ faq: 'hosting' }, { order: true }],
  },
  {
    id: 'hosting',
    q: { en: 'Do you handle hosting, domain and email?', hu: 'Tárhely, domain és e-mail is megoldható?' },
    a: {
      en: 'Yes — choosing and setting up hosting, the domain, business email, SSL and backups can all be part of the project. The accounts are registered in your name, so you always own your site and your domain.',
      hu: 'Igen — a tárhely, a domain, a céges e-mail, az SSL és a mentések kiválasztása és beállítása is lehet a projekt része. A fiókok a te nevedre szólnak, így az oldal és a domain mindig a tiéd.',
    },
    keys: {
      en: ['hosting', 'host', 'domain', 'email', 'server', 'ssl', 'https', 'backup', 'cloud', 'dns', 'own'],
      hu: ['tárhely', 'domain', 'email', 'levelezés', 'szerver', 'ssl', 'https', 'mentés', 'felhő', 'dns', 'saját'],
    },
    next: [{ faq: 'cms' }, { order: true }],
  },
  {
    id: 'cms',
    q: { en: 'Can I edit the content myself?', hu: 'Tudom majd magam szerkeszteni?' },
    a: {
      en: 'Yes, if you want to. Depending on the project that is an easy admin panel built into the site, or a familiar system like WordPress, WooCommerce or Shopify. Texts, images, products, prices and blog posts can be edited without touching code.',
      hu: 'Igen, ha szeretnéd. A projekttől függően ez lehet az oldalba épített egyszerű adminfelület, vagy egy ismert rendszer, például WordPress, WooCommerce vagy Shopify. A szövegek, képek, termékek, árak és blogbejegyzések kód nélkül szerkeszthetők.',
    },
    keys: {
      en: ['edit', 'myself', 'admin', 'cms', 'content', 'wordpress', 'shopify', 'woocommerce', 'update', 'blog', 'manage'],
      hu: ['szerkeszt', 'szerkesztés', 'magam', 'admin', 'cms', 'tartalom', 'wordpress', 'shopify', 'woocommerce', 'blog', 'kezel', 'módosít'],
    },
    next: [{ faq: 'shop' }, { order: true }],
  },
  {
    id: 'shop',
    q: { en: 'Do you build online shops?', hu: 'Webshopot is készítesz?' },
    a: {
      en: 'Yes — from a simple shop with a few products to custom e-commerce with inventory, invoicing, shipping and payment integrations. It can be built on WooCommerce or Shopify, or custom when the business needs it.',
      hu: 'Igen — néhány termékes, egyszerű boltoktól az egyedi e-kereskedelmi rendszerekig, készletkezeléssel, számlázással, szállítási és fizetési integrációkkal. Készülhet WooCommerce-re vagy Shopify-ra, vagy egyedileg, ha az üzlet ezt kívánja.',
    },
    keys: {
      en: ['shop', 'webshop', 'store', 'ecommerce', 'commerce', 'sell', 'products', 'cart', 'payment', 'checkout', 'woocommerce', 'shopify'],
      hu: ['webshop', 'webáruház', 'bolt', 'áruház', 'eladás', 'termék', 'termékek', 'kosár', 'fizetés', 'woocommerce', 'shopify', 'értékesít'],
    },
    next: [{ faq: 'price-website' }, { order: true }],
  },
  {
    id: 'seo',
    q: { en: 'Will my site be found on Google?', hu: 'Megtalálnak majd a Google-ben?' },
    a: {
      en: 'Search visibility is built in from the start: fast pages, clean structure, proper titles and descriptions, structured data, a sitemap and Search Console set-up. It also covers being quoted by AI search tools (GEO / AEO), which matters more every year.',
      hu: 'A keresőbeli láthatóság az elejétől be van építve: gyors oldalak, tiszta szerkezet, megfelelő címek és leírások, strukturált adatok, oldaltérkép és Search Console beállítás. Kitér arra is, hogy az MI-alapú keresők idézzenek (GEO / AEO), ami évről évre fontosabb.',
    },
    keys: {
      en: ['seo', 'google', 'search', 'found', 'ranking', 'rank', 'visibility', 'geo', 'aeo', 'traffic', 'speed', 'fast'],
      hu: ['seo', 'google', 'kereső', 'keresés', 'megtalál', 'helyezés', 'láthatóság', 'geo', 'aeo', 'forgalom', 'gyors', 'gyorsaság'],
    },
    next: [{ show: 'articles' }, { order: true }],
  },
  {
    id: 'ai',
    q: { en: 'Can you add AI to my business?', hu: 'Be tudsz vezetni MI-t a vállalkozásomba?' },
    a: {
      en: 'Yes — practical AI that saves time: assistants and chatbots trained on your own documents, automatic processing of emails, invoices and forms, summaries and reports, or AI features inside your existing software. It starts with finding the tasks where it really pays off.',
      hu: 'Igen — gyakorlati MI, ami időt spórol: saját dokumentumaidra épülő asszisztensek és chatbotok, e-mailek, számlák és űrlapok automatikus feldolgozása, összefoglalók és riportok, vagy MI-funkciók a meglévő szoftveredben. Azzal kezdődik, hogy megkeressük a feladatokat, ahol tényleg megtérül.',
    },
    keys: {
      en: ['ai', 'artificial', 'intelligence', 'chatbot', 'gpt', 'llm', 'automation', 'automate', 'agent', 'rag', 'assistant'],
      hu: ['mi', 'ai', 'mesterséges', 'intelligencia', 'chatbot', 'gpt', 'llm', 'automatizál', 'automatizálás', 'ügynök', 'rag', 'asszisztens'],
    },
    next: [{ show: 'articles' }, { order: true }],
  },
  {
    id: 'integration',
    q: { en: 'Can you connect our systems?', hu: 'Össze tudod kötni a rendszereinket?' },
    a: {
      en: 'Yes — webshops with invoicing or stock systems, CRMs with email tools, internal systems with each other, through APIs or scheduled data syncs. Moving a process out of spreadsheets into a proper business system is a common project too.',
      hu: 'Igen — webshopot számlázóval vagy készletkezelővel, CRM-et levelezőrendszerrel, belső rendszereket egymással, API-kon vagy ütemezett adatszinkronon keresztül. Gyakori projekt az is, amikor egy folyamat Excel-táblákból egy rendes üzleti rendszerbe költözik.',
    },
    keys: {
      en: ['connect', 'integrate', 'integration', 'api', 'sync', 'systems', 'crm', 'erp', 'invoicing', 'excel', 'spreadsheet', 'automation'],
      hu: ['összeköt', 'integrál', 'integráció', 'api', 'szinkron', 'rendszerek', 'crm', 'erp', 'számlázó', 'excel', 'táblázat', 'automatizálás'],
    },
    next: [{ faq: 'price-app' }, { order: true }],
  },
  {
    id: 'stack',
    q: { en: 'Which technologies do you use?', hu: 'Milyen technológiákkal dolgozol?' },
    a: {
      en: 'Front end: React, Angular, TypeScript. Back end: Java and Spring Boot with REST and WebSockets. Databases: PostgreSQL, MariaDB. Infrastructure: Docker, CI/CD, Linux. Content and shops: WordPress, WooCommerce, Shopify. Plus AI integration. The tool is picked to fit the project, not the other way round.',
      hu: 'Frontend: React, Angular, TypeScript. Backend: Java és Spring Boot, REST és WebSocket. Adatbázis: PostgreSQL, MariaDB. Infrastruktúra: Docker, CI/CD, Linux. Tartalom és webshop: WordPress, WooCommerce, Shopify. Emellett MI-integráció. Az eszközt a projekthez választom, nem fordítva.',
    },
    keys: {
      en: ['technology', 'technologies', 'tech', 'stack', 'language', 'framework', 'tools', 'programming'],
      hu: ['technológia', 'technológiák', 'stack', 'nyelv', 'keretrendszer', 'eszközök', 'programozás'],
    },
    next: [{ show: 'stack' }, { show: 'projects' }],
  },
  {
    id: 'languages',
    q: { en: 'Can the site be multilingual?', hu: 'Lehet többnyelvű az oldal?' },
    a: {
      en: 'Yes. Like this site, a website can have a proper address for every language, so each version can be found on Google, with a language switcher and translated metadata. Communication works in English and Hungarian.',
      hu: 'Igen. Ahogy ez az oldal is, egy weboldal minden nyelven saját címet kaphat, így mindegyik változat megtalálható a Google-ben, nyelvváltóval és lefordított metaadatokkal. A kommunikáció angolul és magyarul is megy.',
    },
    keys: {
      en: ['multilingual', 'languages', 'language', 'translation', 'english', 'hungarian', 'german', 'international'],
      hu: ['többnyelvű', 'nyelv', 'nyelvek', 'fordítás', 'angol', 'magyar', 'német', 'nemzetközi'],
    },
    next: [{ order: true }],
  },
  {
    id: 'remote',
    q: { en: 'Do you work remotely or only in Budapest?', hu: 'Csak Budapesten vagy távolról is dolgozol?' },
    a: {
      en: 'Both. Projects run remotely for clients anywhere, with online meetings; in-person meetings are possible in Budapest.',
      hu: 'Mindkettő. A projektek távolról is futnak, bárhol lévő ügyfelekkel, online megbeszélésekkel; személyes találkozó Budapesten lehetséges.',
    },
    keys: {
      en: ['remote', 'remotely', 'location', 'where', 'based', 'budapest', 'hungary', 'abroad', 'country', 'office'],
      hu: ['távolról', 'távmunka', 'hol', 'helyszín', 'budapest', 'magyarország', 'külföld', 'iroda', 'vidék'],
    },
    next: [{ faq: 'consultation' }, { order: true }],
  },
  {
    id: 'contact',
    q: { en: 'How can I get in touch?', hu: 'Hogyan tudlak elérni?' },
    a: {
      en: 'The quickest way is a project request right here — it takes about a minute. You can also use the contact form at the bottom of the page or write an email. Replies usually come within 24 hours.',
      hu: 'A leggyorsabb egy projektmegkeresés itt — kb. egy perc. Használhatod az oldal alján lévő kapcsolatfelvételi űrlapot is, vagy írhatsz e-mailt. Válasz általában 24 órán belül érkezik.',
    },
    keys: {
      en: ['contact', 'touch', 'email', 'reach', 'phone', 'call', 'message', 'write', 'human', 'person', 'reply'],
      hu: ['kapcsolat', 'elér', 'elérhetőség', 'email', 'telefon', 'hívás', 'üzenet', 'ír', 'ember', 'válasz'],
    },
    next: [{ order: true }, { human: true }],
  },
  {
    id: 'demos',
    q: { en: 'What can I try on this site?', hu: 'Mit lehet kipróbálni az oldalon?' },
    a: {
      en: 'Quite a lot: ten full-screen landing pages for fictional brands, a before/after website modernization comparison, a 3D garage configurator with a live estimate, a 3D T-shirt and hoodie designer, a cinematic 3D camera flight, a CV maker, a free full-stack course and an interview simulator.',
      hu: 'Elég sok mindent: tíz teljes képernyős bemutató oldalt kitalált márkáknak, egy előtte–utána weboldal-modernizálást, 3D garázskonfigurátort élő árbecsléssel, 3D póló- és pulóvertervezőt, filmes 3D kamerarepülést, önéletrajz-készítőt, ingyenes full-stack kurzust és interjú-szimulátort.',
    },
    keys: {
      en: ['try', 'demo', 'demos', 'showcase', 'interactive', 'play', 'labs'],
      hu: ['kipróbál', 'kipróbálni', 'demó', 'demo', 'bemutató', 'bemutatók', 'interaktív'],
    },
    next: [{ show: 'demos' }, { show: 'landings' }],
  },
  {
    id: 'references',
    q: { en: 'Can I see previous work?', hu: 'Megnézhetem a korábbi munkáidat?' },
    a: {
      en: 'Sure. The case studies cover enterprise platforms, banking and fintech systems, a government platform, reporting and accounting software, websites and webshops, brand identity and photography. The interactive demos on the site show web design and 3D work you can try yourself.',
      hu: 'Persze. Az esettanulmányok között vállalati platformok, banki és fintech rendszerek, államigazgatási platform, riportáló és könyvelő szoftver, weboldalak és webshopok, arculat és fotózás szerepel. Az oldal interaktív bemutatói webdesign- és 3D-munkákat mutatnak, amiket ki is próbálhatsz.',
    },
    keys: {
      en: ['previous', 'work', 'references', 'reference', 'portfolio', 'projects', 'clients', 'case', 'studies', 'experience', 'done'],
      hu: ['korábbi', 'munkák', 'munkáid', 'referencia', 'referenciák', 'portfólió', 'projektek', 'ügyfelek', 'esettanulmány', 'tapasztalat'],
    },
    next: [{ show: 'projects' }, { show: 'demos' }],
  },
  {
    id: 'learning',
    q: { en: 'Is there something for learning to code?', hu: 'Van valami programozás tanulásához?' },
    a: {
      en: 'Yes, two free tools: a hands-on full-stack course from the basics of the web to a deployed React + Spring Boot app (quizzes, exercises that run in the browser, a progress map), and an interview simulator with 14 technical tracks and 200 questions each.',
      hu: 'Igen, két ingyenes eszköz: egy gyakorlati full-stack kurzus a web alapjaitól egy élesített React + Spring Boot alkalmazásig (kvízek, böngészőben futó feladatok, haladási térkép), és egy interjú-szimulátor 14 technikai témával, témánként 200 kérdéssel.',
    },
    keys: {
      en: ['learn', 'learning', 'course', 'tutorial', 'study', 'interview', 'practice', 'junior', 'beginner', 'code', 'coding', 'student'],
      hu: ['tanul', 'tanulás', 'kurzus', 'tananyag', 'interjú', 'gyakorol', 'gyakorlás', 'junior', 'kezdő', 'programozás', 'diák', 'állásinterjú'],
    },
    next: [
      { href: '/course/', label: { en: 'Open the course', hu: 'A kurzus megnyitása' } },
      { href: '/interview/', label: { en: 'Interview simulator', hu: 'Interjú-szimulátor' } },
    ],
  },
  {
    id: 'bot',
    q: { en: 'Are you a real person?', hu: 'Valódi ember vagy?' },
    a: {
      en: 'No — I am an automated assistant. I answer from the content of this site and a set of prepared answers, and I do not use AI. Anything I cannot answer goes straight to a real person: just send your question.',
      hu: 'Nem — automatikus asszisztens vagyok. Az oldal tartalmából és előre megírt válaszokból felelek, MI-t nem használok. Amire nem tudok válaszolni, azt közvetlenül egy valódi ember kapja meg: csak küldd el a kérdésed.',
    },
    keys: {
      en: ['bot', 'robot', 'real', 'person', 'human', 'who', 'automated', 'chatgpt'],
      hu: ['bot', 'robot', 'valódi', 'ember', 'ki', 'automatikus', 'chatgpt'],
    },
    next: [{ human: true }, { order: true }],
  },
  {
    id: 'privacy',
    q: { en: 'What happens to my data?', hu: 'Mi lesz az adataimmal?' },
    a: {
      en: 'This chat is not recorded anywhere. Only what you choose to send — a project request or a question with your contact details — is delivered by email, and it is used only to reply to you.',
      hu: 'Ezt a beszélgetést sehol nem rögzítjük. Csak az kerül továbbításra e-mailben, amit te elküldesz — egy projektmegkeresés vagy egy kérdés az elérhetőségeddel —, és csak a válaszadásra használjuk.',
    },
    keys: {
      en: ['data', 'privacy', 'gdpr', 'personal', 'stored', 'cookies', 'tracking', 'safe'],
      hu: ['adat', 'adataim', 'adatvédelem', 'gdpr', 'személyes', 'tárol', 'süti', 'követés', 'biztonság'],
    },
  },
];

/** the questions offered as buttons when the visitor picks "Ask a question" */
export const popular = ['price-website', 'timeline', 'process', 'modernize', 'shop', 'ai', 'demos', 'references'];
