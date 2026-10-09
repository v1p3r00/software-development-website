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
  keys: { en: string[]; hu: string[]; sk: string[] };
  next?: Next[];
  /** a link card under the answer */
  link?: { href: string; label: L10n };
}

export const faqs: Faq[] = [
  {
    id: 'check',
    q: { en: 'Can you check my current website?', hu: 'Meg tudod nézni a mostani weboldalamat?', sk: 'Môžete skontrolovať môj súčasný web?' },
    a: {
      en: 'Yes — the free website check gives an instant report on speed (Google PageSpeed), findability on Google, mobile readiness and security, with a plain-language fix for each issue. From the report you can ask for a free personal review.',
      hu: 'Igen — az ingyenes weboldal-ellenőrzés azonnali jelentést ad a sebességről (Google PageSpeed), a Google-ben való megtalálhatóságról, a mobilbarátságról és a biztonságról, minden hibához érthető javítási javaslattal. A jelentésből ingyenes személyes értékelést is kérhetsz.',
      sk: 'Áno — bezplatná kontrola webu okamžite vytvorí správu o rýchlosti (Google PageSpeed), nájditeľnosti v Google, prispôsobení pre mobily a bezpečnosti, ku každému problému s jasne vysvetleným riešením. Zo správy si môžete vyžiadať aj bezplatné osobné posúdenie.',
    },
    keys: {
      en: ['check', 'audit', 'review', 'test', 'analyse', 'analyze', 'scan', 'score', 'my', 'current', 'existing', 'evaluate'],
      hu: ['ellenőriz', 'ellenőrzés', 'ellenőrizd', 'audit', 'átvilágítás', 'teszt', 'elemzés', 'elemez', 'mostani', 'jelenlegi', 'meglévő', 'értékelés'],
      sk: ['kontrola', 'kontrolu', 'skontrolovat', 'skontrolujte', 'over', 'overenie', 'audit', 'analyza', 'analyzu', 'test', 'otestovat', 'hodnotenie', 'posudenie', 'sken', 'skore', 'moj', 'moju', 'sucasny', 'sucasnu', 'existujuci'],
    },
    link: { href: '/website-check/', label: { en: 'Free website check', hu: 'Ingyenes weboldal-ellenőrzés', sk: 'Bezplatná kontrola webu' } },
    next: [{ href: '/website-check/', label: { en: 'Run the check', hu: 'Ellenőrzés indítása', sk: 'Spustiť kontrolu' } }, { faq: 'modernize' }, { order: true }],
  },
  {
    id: 'services',
    q: { en: 'What do you build?', hu: 'Mit fejlesztesz?', sk: 'Čo vyvíjate?' },
    a: {
      en: 'Websites, web applications, online shops and custom business software — from a single landing page to enterprise systems. Modernizing old sites and systems, AI integration and connecting systems through APIs are part of it too.',
      hu: 'Weboldalakat, webalkalmazásokat, webshopokat és egyedi üzleti szoftvereket — egyetlen landing oldaltól a vállalati rendszerekig. Ide tartozik a régi oldalak és rendszerek modernizálása, az MI-integráció és a rendszerek API-kon keresztüli összekötése is.',
      sk: 'Weby, webové aplikácie, e-shopy a softvér na mieru pre firmy — od jednej landing page až po podnikové systémy. Patrí sem aj modernizácia starých webov a systémov, integrácia AI a prepájanie systémov cez API.',
    },
    keys: {
      en: ['build', 'make', 'offer', 'services', 'service', 'do', 'develop', 'help', 'work'],
      hu: ['szolgáltatás', 'szolgáltatások', 'készít', 'készítesz', 'fejleszt', 'fejlesztés', 'csinálsz', 'mit', 'segít', 'munka'],
      sk: ['sluzby', 'sluzba', 'sluzieb', 'robite', 'vyvijate', 'vyvoj', 'vytvorit', 'vytvarate', 'ponuka', 'ponukate', 'pomoc', 'pomozete', 'praca', 'co'],
    },
    next: [{ show: 'services' }, { show: 'projects' }, { order: true }],
  },
  {
    id: 'price-website',
    q: { en: 'How much does a website cost?', hu: 'Mennyibe kerül egy weboldal?', sk: 'Koľko stojí web?' },
    a: {
      en: 'Typical ranges in Hungary (2026): a landing page €200–700, a company website €800–2,500, a site with custom design €1,100–4,000+, a simple online shop €1,400–4,000, a custom web application €2,700–14,000+.\n\nThese are guide prices, not fixed rates — content, design, integrations and admin needs decide the final figure. After a short free consultation you get a concrete quote.',
      hu: 'Jellemző hazai ársávok (2026): landing oldal 70–250 ezer Ft, céges weboldal 300–900 ezer Ft, egyedi designnal készült oldal 400 ezer–1,5 M Ft+, egyszerű webshop 500 ezer–1,5 M Ft, egyedi webalkalmazás 1–5 M Ft+.\n\nEzek irányárak, nem fix tarifák — a tartalom, a design, az integrációk és az adminisztrációs igények határozzák meg a végső összeget. Egy rövid, ingyenes konzultáció után konkrét ajánlatot kapsz.',
      sk: 'Bežné cenové rozpätia (2026): landing page 200 – 700 €, firemný web 800 – 2 500 €, web s dizajnom na mieru 1 100 – 4 000 € a viac, jednoduchý e-shop 1 400 – 4 000 €, webová aplikácia na mieru 2 700 – 14 000 € a viac.\n\nIde o orientačné ceny, nie pevné sadzby — konečnú sumu určuje obsah, dizajn, integrácie a potreby administrácie. Po krátkej bezplatnej konzultácii dostanete konkrétnu cenovú ponuku.',
    },
    keys: {
      en: ['price', 'prices', 'cost', 'costs', 'much', 'budget', 'expensive', 'cheap', 'quote', 'pricing', 'fee', 'rate', 'website'],
      hu: ['ár', 'ára', 'árak', 'mennyibe', 'kerül', 'költség', 'költsége', 'drága', 'olcsó', 'árajánlat', 'díj', 'büdzsé', 'weboldal', 'honlap'],
      sk: ['cena', 'ceny', 'cien', 'cenu', 'kolko', 'stoji', 'stoja', 'naklady', 'nakladov', 'rozpocet', 'drahy', 'drahe', 'lacny', 'lacne', 'cenova', 'ponuka', 'cennik', 'poplatok', 'web', 'webstranka', 'stranka', 'eur'],
    },
    link: {
      href: '/articles/how-much-does-a-website-cost-2026/',
      label: { en: 'How much does a website cost in 2026?', hu: 'Mennyibe kerül egy weboldal 2026-ban?', sk: 'Koľko stojí web v roku 2026?' },
    },
    next: [{ order: true }, { faq: 'price-app' }, { faq: 'timeline' }],
  },
  {
    id: 'price-app',
    q: { en: 'What does a web app or custom software cost?', hu: 'Mennyibe kerül egy webalkalmazás vagy egyedi szoftver?', sk: 'Koľko stojí webová aplikácia alebo softvér na mieru?' },
    a: {
      en: 'A custom web application typically starts around €2,700 and can go to €14,000 or more; complex enterprise systems start around €14,000. The biggest drivers are the number of user roles and workflows, integrations with other systems, and how much data and reporting is involved.\n\nA good way to keep the risk low is to start with a small first version (MVP) and grow it.',
      hu: 'Egy egyedi webalkalmazás jellemzően 1 M Ft körül kezdődik és 5 M Ft fölé is mehet; a komplex vállalati rendszerek 5 M Ft-tól indulnak. Az árat leginkább a felhasználói szerepkörök és munkafolyamatok száma, a más rendszerekkel való integrációk, valamint az adat- és riportigény határozza meg.\n\nA kockázatot jól csökkenti, ha egy kisebb első verzióval (MVP) indulunk, és azt bővítjük.',
      sk: 'Webová aplikácia na mieru zvyčajne začína okolo 2 700 € a môže sa vyšplhať na 14 000 € aj viac; komplexné podnikové systémy začínajú približne na 14 000 €. Cenu najviac ovplyvňuje počet používateľských rolí a pracovných postupov, integrácie s inými systémami a rozsah dát a reportov.\n\nRiziko dobre znižuje, ak začneme menšou prvou verziou (MVP) a postupne ju rozširujeme.',
    },
    keys: {
      en: ['app', 'application', 'webapp', 'software', 'custom', 'system', 'mvp', 'saas', 'portal', 'price', 'cost'],
      hu: ['alkalmazás', 'webalkalmazás', 'webapp', 'szoftver', 'egyedi', 'rendszer', 'mvp', 'portál', 'ár', 'költség', 'mennyibe'],
      sk: ['aplikacia', 'aplikaciu', 'aplikacie', 'webapp', 'softver', 'softveru', 'mieru', 'system', 'systemu', 'mvp', 'saas', 'portal', 'cena', 'kolko', 'stoji', 'naklady'],
    },
    next: [{ order: true }, { faq: 'timeline' }, { show: 'projects' }],
  },
  {
    id: 'timeline',
    q: { en: 'How long does a project take?', hu: 'Mennyi idő alatt készül el?', sk: 'Ako dlho trvá projekt?' },
    a: {
      en: 'As a rough guide: a landing page takes 1–2 weeks, a company website 2–6 weeks, an online shop or a first version of a web app 1–3 months. Larger systems are planned and delivered in stages.\n\nThe exact schedule is part of the proposal, and you see working progress along the way, not only at the end.',
      hu: 'Irányszámok: egy landing oldal 1–2 hét, egy céges weboldal 2–6 hét, egy webshop vagy egy webalkalmazás első verziója 1–3 hónap. A nagyobb rendszereket szakaszokra bontva tervezem és szállítom.\n\nA pontos ütemezés az ajánlat része, és közben is látod a működő részeket, nem csak a végén.',
      sk: 'Orientačne: landing page trvá 1 – 2 týždne, firemný web 2 – 6 týždňov, e-shop alebo prvá verzia webovej aplikácie 1 – 3 mesiace. Väčšie systémy plánujem a dodávam po etapách.\n\nPresný harmonogram je súčasťou ponuky a funkčné časti vidíte priebežne, nie až na konci.',
    },
    keys: {
      en: ['long', 'time', 'timeline', 'weeks', 'months', 'deadline', 'fast', 'quickly', 'when', 'ready', 'duration'],
      hu: ['idő', 'mennyi', 'meddig', 'határidő', 'gyors', 'gyorsan', 'mikorra', 'hét', 'hónap', 'elkészül', 'átfutás'],
      sk: ['dlho', 'trva', 'cas', 'casu', 'termin', 'terminy', 'harmonogram', 'tyzden', 'tyzdne', 'tyzdnov', 'mesiac', 'mesiace', 'rychlo', 'rychly', 'kedy', 'hotove', 'hotovy', 'dokoncenie'],
    },
    next: [{ faq: 'process' }, { order: true }],
  },
  {
    id: 'process',
    q: { en: 'How does a project work?', hu: 'Hogyan zajlik egy projekt?', sk: 'Ako prebieha projekt?' },
    a: {
      en: '1. A short free consultation about your goals.\n2. A written proposal with scope, price and schedule.\n3. Design and development in steps, with regular previews you can click through.\n4. Launch, handover and support afterwards.\n\nYou always talk to the person who builds it.',
      hu: '1. Rövid, ingyenes konzultáció a céljaidról.\n2. Írásos ajánlat a tartalommal, az árral és az ütemezéssel.\n3. Tervezés és fejlesztés lépésenként, rendszeres, kipróbálható előnézetekkel.\n4. Élesítés, átadás és utána támogatás.\n\nMindig azzal beszélsz, aki fejleszti.',
      sk: '1. Krátka bezplatná konzultácia o vašich cieľoch.\n2. Písomná ponuka s rozsahom, cenou a harmonogramom.\n3. Návrh a vývoj po krokoch s pravidelnými náhľadmi, ktoré si môžete preklikať.\n4. Spustenie, odovzdanie a následná podpora.\n\nVždy hovoríte priamo s tým, kto projekt vyvíja.',
    },
    keys: {
      en: ['process', 'work', 'works', 'steps', 'start', 'begin', 'how', 'workflow', 'collaboration', 'proposal'],
      hu: ['folyamat', 'zajlik', 'lépések', 'kezdés', 'indul', 'hogyan', 'menete', 'együttműködés', 'ajánlat'],
      sk: ['proces', 'postup', 'prebieha', 'priebeh', 'kroky', 'krok', 'zaciatok', 'zacat', 'zacina', 'ako', 'spolupraca', 'spolupracu', 'ponuka', 'ponuku'],
    },
    next: [{ faq: 'consultation' }, { order: true }],
  },
  {
    id: 'consultation',
    q: { en: 'Is the first consultation free?', hu: 'Ingyenes az első konzultáció?', sk: 'Je prvá konzultácia bezplatná?' },
    a: {
      en: 'Yes. The first conversation is free and without obligation — online or in person in Budapest. Send a short request here and you get a reply, usually within 24 hours.',
      hu: 'Igen. Az első beszélgetés ingyenes és nem kötelez semmire — online vagy személyesen Budapesten. Küldj egy rövid megkeresést itt, és általában 24 órán belül választ kapsz.',
      sk: 'Áno. Prvý rozhovor je bezplatný a nezáväzný — online alebo osobne v Budapešti. Pošlite krátku požiadavku priamo tu a odpoveď zvyčajne dostanete do 24 hodín.',
    },
    keys: {
      en: ['consultation', 'free', 'call', 'meeting', 'meet', 'talk', 'discuss', 'online', 'person', 'budapest'],
      hu: ['konzultáció', 'ingyenes', 'hívás', 'találkozó', 'megbeszélés', 'beszélgetés', 'online', 'személyesen', 'budapest'],
      sk: ['konzultacia', 'konzultaciu', 'konzultacie', 'bezplatna', 'bezplatne', 'zadarmo', 'hovor', 'stretnutie', 'stretnut', 'porada', 'rozhovor', 'online', 'osobne', 'budapest', 'budapesti'],
    },
    next: [{ order: true }, { faq: 'contact' }],
  },
  {
    id: 'modernize',
    q: { en: 'Can you modernize my old website?', hu: 'Meg tudod újítani a régi weboldalamat?', sk: 'Môžete zmodernizovať môj starý web?' },
    a: {
      en: 'Yes — that is one of the most common jobs: a faster, mobile-friendly, better-looking site that is easier to find on Google, keeping what already works (content, address, search ranking).\n\nThe modernization page shows three dated small-business sites next to their redesigns. Older business software can be modernized step by step too, without a risky big-bang rewrite.',
      hu: 'Igen — ez az egyik leggyakoribb feladat: gyorsabb, mobilbarát, szebb és a Google-ben jobban megtalálható oldal, úgy, hogy ami már működik (tartalom, cím, keresési helyezés), az megmarad.\n\nA modernizálás oldalon három elavult kisvállalkozói oldal látható az újratervezett változata mellett. A régebbi üzleti szoftverek is modernizálhatók lépésenként, kockázatos teljes újraírás nélkül.',
      sk: 'Áno — patrí to k najčastejším zákazkám: rýchlejší, na mobiloch použiteľný a krajší web, ktorý sa ľahšie nájde v Google, pričom ostane zachované to, čo už funguje (obsah, adresa, pozícia vo vyhľadávaní).\n\nNa stránke o modernizácii nájdete tri zastarané weby malých firiem vedľa ich nových verzií. Aj starší firemný softvér sa dá modernizovať postupne, bez riskantného prepisovania všetkého naraz.',
    },
    keys: {
      en: ['modernize', 'modernise', 'modernization', 'redesign', 'old', 'outdated', 'refresh', 'update', 'renew', 'legacy', 'rebuild', 'existing'],
      hu: ['modernizál', 'modernizálás', 'megújít', 'megújítás', 'újratervez', 'régi', 'elavult', 'frissít', 'felújít', 'legacy', 'meglévő', 'átalakít'],
      sk: ['modernizacia', 'modernizaciu', 'modernizovat', 'zmodernizovat', 'redizajn', 'novy', 'dizajn', 'stary', 'stare', 'starsi', 'zastarany', 'zastarane', 'obnova', 'obnovit', 'aktualizacia', 'legacy', 'prerobit', 'prestavba', 'existujuci'],
    },
    link: { href: '/modernization/', label: { en: 'Website modernization: before & after', hu: 'Weboldal-modernizálás: előtte–utána', sk: 'Modernizácia webu: pred a po' } },
    next: [{ faq: 'check' }, { order: true }, { faq: 'takeover' }],
  },
  {
    id: 'takeover',
    q: { en: 'Do you take over existing projects?', hu: 'Átveszel meglévő projektet?', sk: 'Preberáte existujúce projekty?' },
    a: {
      en: 'Yes. Existing sites and applications can be taken over for fixes, new features or a gradual rebuild. The first step is a short review of the code and the hosting, so you know what state it is in and what makes sense next.',
      hu: 'Igen. Meglévő oldalak és alkalmazások átvehetők hibajavításra, új funkciókra vagy fokozatos újraépítésre. Az első lépés a kód és a tárhely rövid átnézése, hogy lásd, milyen állapotban van, és mi a következő ésszerű lépés.',
      sk: 'Áno. Existujúce weby a aplikácie môžem prevziať na opravy, nové funkcie alebo postupnú prestavbu. Prvým krokom je krátka kontrola kódu a hostingu, aby ste vedeli, v akom je stave a čo má zmysel urobiť ďalej.',
    },
    keys: {
      en: ['take', 'takeover', 'existing', 'inherit', 'previous', 'developer', 'agency', 'fix', 'bug', 'continue', 'maintain'],
      hu: ['átvesz', 'átvétel', 'meglévő', 'korábbi', 'fejlesztő', 'ügynökség', 'javít', 'hiba', 'folytat', 'karbantart'],
      sk: ['prevziat', 'prevzatie', 'preberate', 'existujuci', 'existujuce', 'predchadzajuci', 'byvaly', 'vyvojar', 'agentura', 'oprava', 'opravit', 'chyba', 'chyby', 'pokracovat', 'udrzba', 'udrziavat'],
    },
    next: [{ faq: 'support' }, { order: true }],
  },
  {
    id: 'support',
    q: { en: 'What happens after launch?', hu: 'Mi történik az élesítés után?', sk: 'Čo sa deje po spustení?' },
    a: {
      en: 'You get a handover and a short walkthrough. After that, support and maintenance can continue as needed: updates, fixes, monitoring, new features — agreed in advance, so there are no surprises.',
      hu: 'Átadást és rövid bemutatót kapsz. Utána a támogatás és karbantartás igény szerint folytatódhat: frissítések, javítások, felügyelet, új funkciók — előre egyeztetve, meglepetések nélkül.',
      sk: 'Dostanete odovzdanie a krátke zaškolenie. Potom môže podpora a údržba pokračovať podľa potreby: aktualizácie, opravy, monitoring, nové funkcie — vopred dohodnuté, bez prekvapení.',
    },
    keys: {
      en: ['after', 'launch', 'support', 'maintenance', 'updates', 'guarantee', 'warranty', 'monitoring', 'help', 'later'],
      hu: ['után', 'élesítés', 'támogatás', 'karbantartás', 'frissítés', 'garancia', 'felügyelet', 'később', 'üzemeltetés'],
      sk: ['spusteni', 'spustenie', 'podpora', 'podporu', 'udrzba', 'udrzbu', 'aktualizacie', 'zaruka', 'garancia', 'monitoring', 'neskor', 'prevadzka'],
    },
    next: [{ faq: 'hosting' }, { order: true }],
  },
  {
    id: 'hosting',
    q: { en: 'Do you handle hosting, domain and email?', hu: 'Tárhely, domain és e-mail is megoldható?', sk: 'Zabezpečíte aj hosting, doménu a e-mail?' },
    a: {
      en: 'Yes — choosing and setting up hosting, the domain, business email, SSL and backups can all be part of the project. The accounts are registered in your name, so you always own your site and your domain.',
      hu: 'Igen — a tárhely, a domain, a céges e-mail, az SSL és a mentések kiválasztása és beállítása is lehet a projekt része. A fiókok a te nevedre szólnak, így az oldal és a domain mindig a tiéd.',
      sk: 'Áno — výber a nastavenie hostingu, domény, firemného e-mailu, SSL a záloh môžu byť súčasťou projektu. Účty sú registrované na vaše meno, takže web aj doména vždy patria vám.',
    },
    keys: {
      en: ['hosting', 'host', 'domain', 'email', 'server', 'ssl', 'https', 'backup', 'cloud', 'dns', 'own'],
      hu: ['tárhely', 'domain', 'email', 'levelezés', 'szerver', 'ssl', 'https', 'mentés', 'felhő', 'dns', 'saját'],
      sk: ['hosting', 'hostingu', 'domena', 'domenu', 'email', 'mail', 'posta', 'server', 'ssl', 'https', 'zaloha', 'zalohy', 'cloud', 'dns', 'vlastny', 'vlastnictvo'],
    },
    next: [{ faq: 'cms' }, { order: true }],
  },
  {
    id: 'cms',
    q: { en: 'Can I edit the content myself?', hu: 'Tudom majd magam szerkeszteni?', sk: 'Budem môcť obsah upravovať sám?' },
    a: {
      en: 'Yes, if you want to. Depending on the project that is an easy admin panel built into the site, or a familiar system like WordPress, WooCommerce or Shopify. Texts, images, products, prices and blog posts can be edited without touching code.',
      hu: 'Igen, ha szeretnéd. A projekttől függően ez lehet az oldalba épített egyszerű adminfelület, vagy egy ismert rendszer, például WordPress, WooCommerce vagy Shopify. A szövegek, képek, termékek, árak és blogbejegyzések kód nélkül szerkeszthetők.',
      sk: 'Áno, ak chcete. Podľa projektu to môže byť jednoduchá administrácia zabudovaná priamo do webu alebo známy systém ako WordPress, WooCommerce či Shopify. Texty, obrázky, produkty, ceny aj blogové články upravíte bez zásahu do kódu.',
    },
    keys: {
      en: ['edit', 'myself', 'admin', 'cms', 'content', 'wordpress', 'shopify', 'woocommerce', 'update', 'blog', 'manage'],
      hu: ['szerkeszt', 'szerkesztés', 'magam', 'admin', 'cms', 'tartalom', 'wordpress', 'shopify', 'woocommerce', 'blog', 'kezel', 'módosít'],
      sk: ['upravit', 'upravovat', 'uprava', 'editovat', 'sam', 'sama', 'admin', 'administracia', 'cms', 'obsah', 'wordpress', 'shopify', 'woocommerce', 'blog', 'spravovat', 'sprava', 'zmenit'],
    },
    next: [{ faq: 'shop' }, { order: true }],
  },
  {
    id: 'shop',
    q: { en: 'Do you build online shops?', hu: 'Webshopot is készítesz?', sk: 'Robíte aj e-shopy?' },
    a: {
      en: 'Yes — from a simple shop with a few products to custom e-commerce with inventory, invoicing, shipping and payment integrations. It can be built on WooCommerce or Shopify, or custom when the business needs it.',
      hu: 'Igen — néhány termékes, egyszerű boltoktól az egyedi e-kereskedelmi rendszerekig, készletkezeléssel, számlázással, szállítási és fizetési integrációkkal. Készülhet WooCommerce-re vagy Shopify-ra, vagy egyedileg, ha az üzlet ezt kívánja.',
      sk: 'Áno — od jednoduchého obchodu s niekoľkými produktmi až po e-commerce riešenia na mieru so skladom, fakturáciou, dopravou a platobnými integráciami. E-shop môže byť postavený na WooCommerce alebo Shopify, prípadne na mieru, ak to biznis potrebuje.',
    },
    keys: {
      en: ['shop', 'webshop', 'store', 'ecommerce', 'commerce', 'sell', 'products', 'cart', 'payment', 'checkout', 'woocommerce', 'shopify'],
      hu: ['webshop', 'webáruház', 'bolt', 'áruház', 'eladás', 'termék', 'termékek', 'kosár', 'fizetés', 'woocommerce', 'shopify', 'értékesít'],
      sk: ['eshop', 'e-shop', 'obchod', 'internetovy', 'online', 'predaj', 'predavat', 'produkt', 'produkty', 'kosik', 'platba', 'platby', 'pokladna', 'woocommerce', 'shopify', 'ecommerce'],
    },
    next: [{ faq: 'price-website' }, { order: true }],
  },
  {
    id: 'seo',
    q: { en: 'Will my site be found on Google?', hu: 'Megtalálnak majd a Google-ben?', sk: 'Nájdu ma ľudia v Google?' },
    a: {
      en: 'Search visibility is built in from the start: fast pages, clean structure, proper titles and descriptions, structured data, a sitemap and Search Console set-up. It also covers being quoted by AI search tools (GEO / AEO), which matters more every year.',
      hu: 'A keresőbeli láthatóság az elejétől be van építve: gyors oldalak, tiszta szerkezet, megfelelő címek és leírások, strukturált adatok, oldaltérkép és Search Console beállítás. Kitér arra is, hogy az MI-alapú keresők idézzenek (GEO / AEO), ami évről évre fontosabb.',
      sk: 'Viditeľnosť vo vyhľadávaní je zabudovaná od začiatku: rýchle stránky, čistá štruktúra, správne nadpisy a popisy, štruktúrované dáta, sitemap a nastavenie Search Console. Myslí aj na to, aby vás citovali AI vyhľadávače (GEO / AEO), čo je rok čo rok dôležitejšie.',
    },
    keys: {
      en: ['seo', 'google', 'search', 'found', 'ranking', 'rank', 'visibility', 'geo', 'aeo', 'traffic', 'speed', 'fast'],
      hu: ['seo', 'google', 'kereső', 'keresés', 'megtalál', 'helyezés', 'láthatóság', 'geo', 'aeo', 'forgalom', 'gyors', 'gyorsaság'],
      sk: ['seo', 'google', 'vyhladavanie', 'vyhladavac', 'najst', 'najdu', 'najdenie', 'pozicia', 'poradie', 'viditelnost', 'geo', 'aeo', 'navstevnost', 'rychlost', 'rychly'],
    },
    next: [{ faq: 'check' }, { show: 'articles' }, { order: true }],
  },
  {
    id: 'ai',
    q: { en: 'Can you add AI to my business?', hu: 'Be tudsz vezetni MI-t a vállalkozásomba?', sk: 'Môžete zaviesť AI do mojej firmy?' },
    a: {
      en: 'Yes — practical AI that saves time: assistants and chatbots trained on your own documents, automatic processing of emails, invoices and forms, summaries and reports, or AI features inside your existing software. It starts with finding the tasks where it really pays off.',
      hu: 'Igen — gyakorlati MI, ami időt spórol: saját dokumentumaidra épülő asszisztensek és chatbotok, e-mailek, számlák és űrlapok automatikus feldolgozása, összefoglalók és riportok, vagy MI-funkciók a meglévő szoftveredben. Azzal kezdődik, hogy megkeressük a feladatokat, ahol tényleg megtérül.',
      sk: 'Áno — praktickú AI, ktorá šetrí čas: asistentov a chatboty postavené na vašich vlastných dokumentoch, automatické spracovanie e-mailov, faktúr a formulárov, zhrnutia a reporty alebo AI funkcie vo vašom existujúcom softvéri. Začína sa tým, že nájdeme úlohy, kde sa naozaj oplatí.',
    },
    keys: {
      en: ['ai', 'artificial', 'intelligence', 'chatbot', 'gpt', 'llm', 'automation', 'automate', 'agent', 'rag', 'assistant'],
      hu: ['mi', 'ai', 'mesterséges', 'intelligencia', 'chatbot', 'gpt', 'llm', 'automatizál', 'automatizálás', 'ügynök', 'rag', 'asszisztens'],
      sk: ['ai', 'umela', 'inteligencia', 'chatbot', 'gpt', 'llm', 'automatizacia', 'automatizovat', 'agent', 'rag', 'asistent'],
    },
    next: [{ show: 'articles' }, { order: true }],
  },
  {
    id: 'integration',
    q: { en: 'Can you connect our systems?', hu: 'Össze tudod kötni a rendszereinket?', sk: 'Viete prepojiť naše systémy?' },
    a: {
      en: 'Yes — webshops with invoicing or stock systems, CRMs with email tools, internal systems with each other, through APIs or scheduled data syncs. Moving a process out of spreadsheets into a proper business system is a common project too.',
      hu: 'Igen — webshopot számlázóval vagy készletkezelővel, CRM-et levelezőrendszerrel, belső rendszereket egymással, API-kon vagy ütemezett adatszinkronon keresztül. Gyakori projekt az is, amikor egy folyamat Excel-táblákból egy rendes üzleti rendszerbe költözik.',
      sk: 'Áno — e-shopy s fakturáciou alebo skladovým systémom, CRM s e-mailovými nástrojmi, interné systémy navzájom, cez API alebo plánovanú synchronizáciu dát. Častým projektom je aj presun procesu z excelových tabuliek do poriadneho firemného systému.',
    },
    keys: {
      en: ['connect', 'integrate', 'integration', 'api', 'sync', 'systems', 'crm', 'erp', 'invoicing', 'excel', 'spreadsheet', 'automation'],
      hu: ['összeköt', 'integrál', 'integráció', 'api', 'szinkron', 'rendszerek', 'crm', 'erp', 'számlázó', 'excel', 'táblázat', 'automatizálás'],
      sk: ['prepojit', 'prepojenie', 'integrovat', 'integracia', 'api', 'synchronizacia', 'systemy', 'crm', 'erp', 'fakturacia', 'excel', 'tabulka', 'tabulky', 'automatizacia'],
    },
    next: [{ faq: 'price-app' }, { order: true }],
  },
  {
    id: 'stack',
    q: { en: 'Which technologies do you use?', hu: 'Milyen technológiákkal dolgozol?', sk: 'Aké technológie používate?' },
    a: {
      en: 'Front end: React, Angular, TypeScript. Back end: Java and Spring Boot with REST and WebSockets. Databases: PostgreSQL, MariaDB. Infrastructure: Docker, CI/CD, Linux. Content and shops: WordPress, WooCommerce, Shopify. Plus AI integration. The tool is picked to fit the project, not the other way round.',
      hu: 'Frontend: React, Angular, TypeScript. Backend: Java és Spring Boot, REST és WebSocket. Adatbázis: PostgreSQL, MariaDB. Infrastruktúra: Docker, CI/CD, Linux. Tartalom és webshop: WordPress, WooCommerce, Shopify. Emellett MI-integráció. Az eszközt a projekthez választom, nem fordítva.',
      sk: 'Frontend: React, Angular, TypeScript. Backend: Java a Spring Boot s REST a WebSockets. Databázy: PostgreSQL, MariaDB. Infraštruktúra: Docker, CI/CD, Linux. Obsah a e-shopy: WordPress, WooCommerce, Shopify. A k tomu integrácia AI. Nástroj vyberám podľa projektu, nie naopak.',
    },
    keys: {
      en: ['technology', 'technologies', 'tech', 'stack', 'language', 'framework', 'tools', 'programming'],
      hu: ['technológia', 'technológiák', 'stack', 'nyelv', 'keretrendszer', 'eszközök', 'programozás'],
      sk: ['technologia', 'technologie', 'technologii', 'stack', 'jazyk', 'framework', 'nastroje', 'programovanie'],
    },
    next: [{ show: 'stack' }, { show: 'projects' }],
  },
  {
    id: 'languages',
    q: { en: 'Can the site be multilingual?', hu: 'Lehet többnyelvű az oldal?', sk: 'Môže byť web viacjazyčný?' },
    a: {
      en: 'Yes. Like this site, a website can have a proper address for every language, so each version can be found on Google, with a language switcher and translated metadata. Communication works in English and Hungarian.',
      hu: 'Igen. Ahogy ez az oldal is, egy weboldal minden nyelven saját címet kaphat, így mindegyik változat megtalálható a Google-ben, nyelvváltóval és lefordított metaadatokkal. A kommunikáció angolul és magyarul is megy.',
      sk: 'Áno. Rovnako ako tento web môže mať každý jazyk vlastnú adresu, takže každú verziu nájdete v Google, s prepínačom jazykov a preloženými metadátami. Komunikácia prebieha v angličtine a maďarčine.',
    },
    keys: {
      en: ['multilingual', 'languages', 'language', 'translation', 'english', 'hungarian', 'german', 'international'],
      hu: ['többnyelvű', 'nyelv', 'nyelvek', 'fordítás', 'angol', 'magyar', 'német', 'nemzetközi'],
      sk: ['viacjazycny', 'viacjazycna', 'jazyk', 'jazyky', 'jazykov', 'preklad', 'preklady', 'anglictina', 'anglicky', 'madarcina', 'madarsky', 'slovencina', 'slovensky', 'nemcina', 'medzinarodny'],
    },
    next: [{ order: true }],
  },
  {
    id: 'remote',
    q: { en: 'Do you work remotely or only in Budapest?', hu: 'Csak Budapesten vagy távolról is dolgozol?', sk: 'Pracujete na diaľku alebo len v Budapešti?' },
    a: {
      en: 'Both. Projects run remotely for clients anywhere, with online meetings; in-person meetings are possible in Budapest.',
      hu: 'Mindkettő. A projektek távolról is futnak, bárhol lévő ügyfelekkel, online megbeszélésekkel; személyes találkozó Budapesten lehetséges.',
      sk: 'Oboje. Projekty bežia na diaľku pre klientov odkiaľkoľvek, s online stretnutiami; osobné stretnutie je možné v Budapešti.',
    },
    keys: {
      en: ['remote', 'remotely', 'location', 'where', 'based', 'budapest', 'hungary', 'abroad', 'country', 'office'],
      hu: ['távolról', 'távmunka', 'hol', 'helyszín', 'budapest', 'magyarország', 'külföld', 'iroda', 'vidék'],
      sk: ['dialku', 'dialka', 'remote', 'kde', 'miesto', 'sidlo', 'budapest', 'budapesti', 'madarsko', 'zahranicie', 'slovensko', 'krajina', 'kancelaria'],
    },
    next: [{ faq: 'consultation' }, { order: true }],
  },
  {
    id: 'contact',
    q: { en: 'How can I get in touch?', hu: 'Hogyan tudlak elérni?', sk: 'Ako vás môžem kontaktovať?' },
    a: {
      en: 'The quickest way is a project request right here — it takes about a minute. You can also use the contact form at the bottom of the page or write an email. Replies usually come within 24 hours.',
      hu: 'A leggyorsabb egy projektmegkeresés itt — kb. egy perc. Használhatod az oldal alján lévő kapcsolatfelvételi űrlapot is, vagy írhatsz e-mailt. Válasz általában 24 órán belül érkezik.',
      sk: 'Najrýchlejšie je poslať požiadavku na projekt priamo tu — zaberie to asi minútu. Môžete použiť aj kontaktný formulár v spodnej časti stránky alebo napísať e-mail. Odpoveď zvyčajne príde do 24 hodín.',
    },
    keys: {
      en: ['contact', 'touch', 'email', 'reach', 'phone', 'call', 'message', 'write', 'human', 'person', 'reply'],
      hu: ['kapcsolat', 'elér', 'elérhetőség', 'email', 'telefon', 'hívás', 'üzenet', 'ír', 'ember', 'válasz'],
      sk: ['kontakt', 'kontaktovat', 'spojit', 'email', 'mail', 'telefon', 'zavolat', 'hovor', 'sprava', 'spravu', 'napisat', 'clovek', 'osoba', 'odpoved'],
    },
    next: [{ order: true }, { human: true }],
  },
  {
    id: 'demos',
    q: { en: 'What can I try on this site?', hu: 'Mit lehet kipróbálni az oldalon?', sk: 'Čo si môžem na webe vyskúšať?' },
    a: {
      en: 'Quite a lot: ten full-screen landing pages for fictional brands, a before/after website modernization comparison, a 3D garage configurator with a live estimate, a 3D T-shirt and hoodie designer, a cinematic 3D camera flight, a CV maker, a free full-stack course and an interview simulator.',
      hu: 'Elég sok mindent: tíz teljes képernyős bemutató oldalt kitalált márkáknak, egy előtte–utána weboldal-modernizálást, 3D garázskonfigurátort élő árbecsléssel, 3D póló- és pulóvertervezőt, filmes 3D kamerarepülést, önéletrajz-készítőt, ingyenes full-stack kurzust és interjú-szimulátort.',
      sk: 'Pomerne veľa: desať celoobrazovkových landing pages pre vymyslené značky, porovnanie modernizácie webu pred a po, 3D konfigurátor garáže so živým odhadom ceny, 3D návrhár tričiek a mikín, filmový 3D prelet kamerou, tvorcu životopisov, bezplatný full-stack kurz a simulátor pohovorov.',
    },
    keys: {
      en: ['try', 'demo', 'demos', 'showcase', 'interactive', 'play', 'labs'],
      hu: ['kipróbál', 'kipróbálni', 'demó', 'demo', 'bemutató', 'bemutatók', 'interaktív'],
      sk: ['vyskusat', 'skusit', 'demo', 'dema', 'ukazka', 'ukazky', 'interaktivny', 'interaktivne', 'hrat'],
    },
    next: [{ show: 'demos' }, { show: 'landings' }],
  },
  {
    id: 'references',
    q: { en: 'Can I see previous work?', hu: 'Megnézhetem a korábbi munkáidat?', sk: 'Môžem vidieť vaše predchádzajúce práce?' },
    a: {
      en: 'Sure. The case studies cover enterprise platforms, banking and fintech systems, a government platform, reporting and accounting software, websites and webshops, brand identity and photography. The interactive demos on the site show web design and 3D work you can try yourself.',
      hu: 'Persze. Az esettanulmányok között vállalati platformok, banki és fintech rendszerek, államigazgatási platform, riportáló és könyvelő szoftver, weboldalak és webshopok, arculat és fotózás szerepel. Az oldal interaktív bemutatói webdesign- és 3D-munkákat mutatnak, amiket ki is próbálhatsz.',
      sk: 'Samozrejme. Prípadové štúdie zahŕňajú podnikové platformy, bankové a fintech systémy, štátnu platformu, reportingový a účtovný softvér, weby a e-shopy, vizuálnu identitu a fotografiu. Interaktívne ukážky na webe predstavujú webdizajn a 3D práce, ktoré si môžete sami vyskúšať.',
    },
    keys: {
      en: ['previous', 'work', 'references', 'reference', 'portfolio', 'projects', 'clients', 'case', 'studies', 'experience', 'done'],
      hu: ['korábbi', 'munkák', 'munkáid', 'referencia', 'referenciák', 'portfólió', 'projektek', 'ügyfelek', 'esettanulmány', 'tapasztalat'],
      sk: ['predchadzajuce', 'prace', 'prac', 'referencie', 'referencia', 'portfolio', 'projekty', 'klienti', 'pripadova', 'studia', 'studie', 'skusenosti', 'skusenost'],
    },
    next: [{ show: 'projects' }, { show: 'demos' }],
  },
  {
    id: 'learning',
    q: { en: 'Is there something for learning to code?', hu: 'Van valami programozás tanulásához?', sk: 'Je tu niečo na učenie programovania?' },
    a: {
      en: 'Yes, two free tools: a hands-on full-stack course from the basics of the web to a deployed React + Spring Boot app (quizzes, exercises that run in the browser, a progress map), and an interview simulator with 14 technical tracks and 200 questions each.',
      hu: 'Igen, két ingyenes eszköz: egy gyakorlati full-stack kurzus a web alapjaitól egy élesített React + Spring Boot alkalmazásig (kvízek, böngészőben futó feladatok, haladási térkép), és egy interjú-szimulátor 14 technikai témával, témánként 200 kérdéssel.',
      sk: 'Áno, dva bezplatné nástroje: praktický full-stack kurz od základov webu až po nasadenú aplikáciu v React + Spring Boot (kvízy, úlohy spúšťané v prehliadači, mapa pokroku) a simulátor pohovorov so 14 technickými oblasťami, v každej 200 otázok.',
    },
    keys: {
      en: ['learn', 'learning', 'course', 'tutorial', 'study', 'interview', 'practice', 'junior', 'beginner', 'code', 'coding', 'student'],
      hu: ['tanul', 'tanulás', 'kurzus', 'tananyag', 'interjú', 'gyakorol', 'gyakorlás', 'junior', 'kezdő', 'programozás', 'diák', 'állásinterjú'],
      sk: ['ucit', 'ucenie', 'naucit', 'kurz', 'kurzu', 'tutorial', 'studium', 'pohovor', 'pohovoru', 'precvicovat', 'prax', 'junior', 'zaciatocnik', 'kod', 'programovanie', 'student'],
    },
    next: [
      { href: '/course/', label: { en: 'Open the course', hu: 'A kurzus megnyitása', sk: 'Otvoriť kurz' } },
      { href: '/interview/', label: { en: 'Interview simulator', hu: 'Interjú-szimulátor', sk: 'Simulátor pohovorov' } },
    ],
  },
  {
    id: 'bot',
    q: { en: 'Are you a real person?', hu: 'Valódi ember vagy?', sk: 'Ste skutočný človek?' },
    a: {
      en: 'No — I am an automated assistant. I answer from the content of this site and a set of prepared answers, and I do not use AI. Anything I cannot answer goes straight to a real person: just send your question.',
      hu: 'Nem — automatikus asszisztens vagyok. Az oldal tartalmából és előre megírt válaszokból felelek, MI-t nem használok. Amire nem tudok válaszolni, azt közvetlenül egy valódi ember kapja meg: csak küldd el a kérdésed.',
      sk: 'Nie — som automatický asistent. Odpovedám z obsahu tohto webu a pripravených odpovedí a nepoužívam AI. Na čo neviem odpovedať, dostane priamo skutočný človek: stačí poslať vašu otázku.',
    },
    keys: {
      en: ['bot', 'robot', 'real', 'person', 'human', 'who', 'automated', 'chatgpt'],
      hu: ['bot', 'robot', 'valódi', 'ember', 'ki', 'automatikus', 'chatgpt'],
      sk: ['bot', 'robot', 'skutocny', 'realny', 'clovek', 'kto', 'automaticky', 'chatgpt'],
    },
    next: [{ human: true }, { order: true }],
  },
  {
    id: 'privacy',
    q: { en: 'What happens to my data?', hu: 'Mi lesz az adataimmal?', sk: 'Čo sa stane s mojimi údajmi?' },
    a: {
      en: 'This chat is not recorded anywhere. Only what you choose to send — a project request or a question with your contact details — is delivered by email, and it is used only to reply to you.',
      hu: 'Ezt a beszélgetést sehol nem rögzítjük. Csak az kerül továbbításra e-mailben, amit te elküldesz — egy projektmegkeresés vagy egy kérdés az elérhetőségeddel —, és csak a válaszadásra használjuk.',
      sk: 'Tento rozhovor sa nikde neukladá. E-mailom sa doručí len to, čo sami odošlete — požiadavka na projekt alebo otázka s vašimi kontaktnými údajmi — a použije sa výlučne na odpoveď.',
    },
    keys: {
      en: ['data', 'privacy', 'gdpr', 'personal', 'stored', 'cookies', 'tracking', 'safe'],
      hu: ['adat', 'adataim', 'adatvédelem', 'gdpr', 'személyes', 'tárol', 'süti', 'követés', 'biztonság'],
      sk: ['udaje', 'udajov', 'data', 'sukromie', 'ochrana', 'gdpr', 'osobne', 'ulozene', 'ukladanie', 'cookies', 'sledovanie', 'bezpecnost'],
    },
  },
];

/** the questions offered as buttons when the visitor picks "Ask a question" */
export const popular = ['price-website', 'timeline', 'check', 'process', 'modernize', 'shop', 'ai', 'demos', 'references'];
