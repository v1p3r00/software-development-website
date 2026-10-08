import type { Industry } from './industries.ts';

/**
 * The remaining industry pages: one for every other landing page demo, and three built on
 * the website modernization cases (`case:<id>` demos open /modernization/?case=<id>).
 */
export const moreIndustries: Industry[] = [
  {
    slug: 'confectioneries',
    nav: { en: 'Confectioneries & bakeries', hu: 'Cukrászdák és pékségek' },
    demo: 'case:bakery',
    seo: {
      title: { en: 'Websites for confectioneries, bakeries and cafés — cake orders, opening hours | softwaredevelopment.hu', hu: 'Weboldal cukrászdáknak, pékségeknek és kávézóknak — tortarendelés, nyitvatartás | softwaredevelopment.hu' },
      description: {
        en: 'A sweet, fast website for confectioneries, bakeries and cafés: online cake orders, the daily offer, opening hours that are always right, table booking and Google Maps visibility. Guide prices and a live before-and-after demo.',
        hu: 'Kedves, gyors weboldal cukrászdáknak, pékségeknek és kávézóknak: online tortarendelés, napi kínálat, mindig pontos nyitvatartás, asztalfoglalás és Google-térképes láthatóság. Irányárak és élő előtte–utána demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for confectioneries & cafés', hu: 'Weboldal cukrászdáknak és kávézóknak' },
      title: { en: ['Cake orders', 'while you', 'bake'], hu: ['Tortarendelés,', 'amíg te', 'sütsz'] },
      lead: {
        en: 'Birthday cakes, trays for the office, a coffee on the way: people decide on their phone. A site that shows today’s offer and takes cake orders online saves you phone calls in the busiest hours.',
        hu: 'Születésnapi torta, sütemény az irodába, egy kávé útközben: az emberek a telefonjukon döntenek. Egy oldal, ami mutatja a napi kínálatot és online fogadja a tortarendelést, a legforgalmasabb órákban spórol meg hívásokat.',
      },
      short: { en: 'Cake orders, daily offer, opening hours', hu: 'Tortarendelés, napi kínálat, nyitvatartás' },
    },
    problems: [
      { t: { en: 'Cake orders by phone only', hu: 'Tortát csak telefonon lehet rendelni' }, d: { en: 'Every order means a call at the counter, a notepad and back-and-forth about size and flavour.', hu: 'Minden rendelés egy hívás a pultnál, egy jegyzettömb és oda-vissza egyeztetés a méretről és az ízről.' } },
      { t: { en: 'An offer that is never up to date', hu: 'Sosem friss a kínálat' }, d: { en: 'A photo gallery from years ago does not show what is in the window today.', hu: 'Egy évekkel ezelőtti galéria nem mutatja, mi van ma a vitrinben.' } },
      { t: { en: 'Unclear opening hours', hu: 'Bizonytalan nyitvatartás' }, d: { en: 'Holidays and summer closures that are missing online send guests to a closed door.', hu: 'Az online hiányzó ünnepi és nyári zárva tartás zárt ajtóhoz küldi a vendéget.' } },
      { t: { en: 'A dated look on a phone', hu: 'Mobilon elavult megjelenés' }, d: { en: 'A tiny, zoomed-out page does not do justice to beautiful cakes.', hu: 'Egy apró, kicsinyített oldal nem adja vissza a szép tortákat.' } },
    ],
    features: [
      { t: { en: 'Online cake orders', hu: 'Online tortarendelés' }, d: { en: 'Size, flavour, decoration, inscription and pickup date — sent to you as a clear order.', hu: 'Méret, íz, díszítés, felirat és átvételi nap — rendezett rendelésként érkezik hozzád.' } },
      { t: { en: 'Today’s offer', hu: 'Napi kínálat' }, d: { en: 'Cakes and pastries updated from your phone in a minute, with photos and allergens.', hu: 'Sütemények egy perc alatt frissítve a telefonodról, fotókkal és allergénekkel.' } },
      { t: { en: '“Open now” that is always right', hu: 'Mindig pontos „most nyitva”' }, d: { en: 'Opening hours, holidays and seasonal offers calculated live.', hu: 'Nyitvatartás, ünnepnapok és szezonális ajánlatok élőben számolva.' } },
      { t: { en: 'Table booking and cart', hu: 'Asztalfoglalás és kosár' }, d: { en: 'Book a table for a birthday or order trays for pickup — no call needed.', hu: 'Asztal egy születésnapra vagy tálak elvitelre — hívás nélkül.' } },
      { t: { en: 'Events and catering', hu: 'Rendezvények és catering' }, d: { en: 'Wedding cakes, office orders and corporate gifts with their own pages.', hu: 'Esküvői torták, irodai rendelések és céges ajándékok saját oldallal.' } },
      { t: { en: 'Found on Google Maps', hu: 'Megtalálható a Google Térképen' }, d: { en: 'Bakery structured data, a tidy Google profile and reviews that match the site.', hu: 'Cukrászdai strukturált adatok, rendezett Google-profil és az oldallal egyező értékelések.' } },
    ],
    demoText: {
      en: 'Málnavirág is a fictional neighbourhood confectionery shown before and after a redesign: a mega menu, a cake designer that redraws live, a cart, table booking and opening hours calculated in real time.',
      hu: 'A Málnavirág egy kitalált környékbeli cukrászda, újratervezés előtt és után: megamenü, élőben rajzolódó tortatervező, kosár, asztalfoglalás és valós időben számolt nyitvatartás.',
    },
    prices: [
      { name: { en: 'Café / confectionery website', hu: 'Cukrászdai weboldal' }, range: { en: '€700–1,900', hu: '250–700 ezer Ft' }, text: { en: 'Offer, opening hours, gallery, map and Google basics.', hu: 'Kínálat, nyitvatartás, galéria, térkép és Google-alapok.' } },
      { name: { en: 'With cake orders & booking', hu: 'Tortarendeléssel és foglalással' }, range: { en: '€1,600–4,000', hu: '600 ezer–1,5 M Ft' }, text: { en: 'Online cake orders, table booking, daily offer you update yourself.', hu: 'Online tortarendelés, asztalfoglalás, magad frissítette napi kínálat.' } },
      { name: { en: 'Online shop & delivery', hu: 'Webshop és kiszállítás' }, range: { en: 'from €3,300', hu: '1,2 M Ft-tól' }, text: { en: 'Pastries and gift boxes with online payment and delivery slots.', hu: 'Sütemények és ajándékdobozok online fizetéssel és kiszállítási idősávokkal.' } },
    ],
    faq: [
      { q: { en: 'Can customers order a custom cake online?', hu: 'Rendelhetnek a vevők egyedi tortát online?' }, a: { en: 'Yes — they choose size, flavour, decoration and the pickup day, add an inscription or a photo, and you receive a clear order; payment can be online or at pickup.', hu: 'Igen — kiválasztják a méretet, ízt, díszítést és az átvétel napját, feliratot vagy fotót adnak hozzá, te pedig rendezett rendelést kapsz; fizetni lehet online vagy átvételkor.' } },
      { q: { en: 'Can we update the daily offer ourselves?', hu: 'A napi kínálatot mi magunk frissíthetjük?' }, a: { en: 'Yes, from your phone in a minute: switch cakes on and off, change prices and photos.', hu: 'Igen, akár telefonról egy perc alatt: süteményeket kapcsolhattok be és ki, árakat és fotókat módosíthattok.' } },
      { q: { en: 'Is it worth having a site if we are on Facebook?', hu: 'Megéri saját oldal, ha Facebookon már fent vagyunk?' }, a: { en: 'Facebook is great for posts, but Google searches like “cake order near me” lead to websites and Maps profiles — and on your own site orders do not get lost in messages.', hu: 'A Facebook posztokra jó, de az olyan Google-keresések, mint a „tortarendelés a közelben”, weboldalakhoz és térképes profilokhoz vezetnek — a saját oldalon pedig nem vesznek el a rendelések az üzenetek között.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A café website takes about 2–3 weeks; with cake orders and booking about 4–6 weeks.', hu: 'Egy kávézói oldal kb. 2–3 hét; tortarendeléssel és foglalással kb. 4–6 hét.' } },
      { q: { en: 'Can you modernize our existing site?', hu: 'A meglévő oldalunkat is meg tudod újítani?' }, a: { en: 'Yes — the demo shows exactly that: same address and content, a fresh design and online ordering on top.', hu: 'Igen — a demó pont ezt mutatja: ugyanaz a cím és tartalom, friss design és online rendelés.' } },
    ],
    interest: { en: 'Website for a confectionery / café (Málnavirág style)', hu: 'Weboldal cukrászdának / kávézónak (Málnavirág stílus)' },
  },
  {
    slug: 'law-firms',
    nav: { en: 'Law firms', hu: 'Ügyvédi irodák' },
    demo: 'case:law',
    seo: {
      title: { en: 'Websites for law firms and lawyers — trust, practice areas, consultation booking | softwaredevelopment.hu', hu: 'Weboldal ügyvédi irodáknak és ügyvédeknek — bizalom, szakterületek, konzultációfoglalás | softwaredevelopment.hu' },
      description: {
        en: 'A calm, credible website for law firms: clear practice areas, the team, answers before the first call and consultation booking — fast, accessible and found on Google. Guide prices and a live before-and-after demo.',
        hu: 'Nyugodt, hiteles weboldal ügyvédi irodáknak: átlátható szakterületek, a csapat, válaszok az első hívás előtt és konzultációfoglalás — gyorsan, akadálymentesen, a Google-ben megtalálhatóan. Irányárak és élő előtte–utána demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for law firms', hu: 'Weboldal ügyvédi irodáknak' },
      title: { en: ['Trust', 'before the', 'first call'], hu: ['Bizalom', 'már az', 'első hívás előtt'] },
      lead: {
        en: 'Clients look for a lawyer when something is at stake. A calm, clear website that explains what you do, who they will work with and how to book a consultation turns that search into a call.',
        hu: 'Az ügyfél akkor keres ügyvédet, amikor valami fontos a tét. Egy nyugodt, átlátható weboldal, ami elmondja, mivel foglalkozol, kivel fog dolgozni és hogyan foglalhat konzultációt, a keresésből hívást csinál.',
      },
      short: { en: 'Practice areas, credibility, consultations', hu: 'Szakterületek, hitelesség, konzultáció' },
    },
    problems: [
      { t: { en: 'A wall of legal text', hu: 'Jogi szövegfal' }, d: { en: 'Clients cannot tell from the site whether you handle their kind of case.', hu: 'Az ügyfél az oldalból nem tudja eldönteni, foglalkozol-e az ő ügyével.' } },
      { t: { en: 'Dated design, lower trust', hu: 'Elavult design, kisebb bizalom' }, d: { en: 'An old site makes a firm look less established than it is.', hu: 'Egy régi oldal kevésbé tűnik megbízhatónak, mint amilyen az iroda valójában.' } },
      { t: { en: 'No easy way to get in touch', hu: 'Nincs egyszerű kapcsolatfelvétel' }, d: { en: 'Only a phone number during office hours — evening searchers move on.', hu: 'Csak egy telefonszám irodaidőben — az esti keresők továbbállnak.' } },
      { t: { en: 'Invisible for local searches', hu: 'Láthatatlan a helyi keresésekben' }, d: { en: '“Divorce lawyer Budapest” or “company formation lawyer” goes to firms with clear practice pages.', hu: 'A „válóperes ügyvéd Budapest” vagy a „cégalapítás ügyvéd” keresés a jól tagolt szakterület-oldalakkal rendelkező irodákhoz jut.' } },
    ],
    features: [
      { t: { en: 'Clear practice areas', hu: 'Átlátható szakterületek' }, d: { en: 'A page for each area in plain language: typical cases, process and what to bring.', hu: 'Minden szakterületnek saját oldal, közérthetően: jellemző ügyek, menet és mit kell hozni.' } },
      { t: { en: 'Consultation booking', hu: 'Konzultációfoglalás' }, d: { en: 'Pick a topic and a time slot, online or in person — confirmed automatically.', hu: 'Téma és időpont választása, online vagy személyesen — automatikus visszaigazolással.' } },
      { t: { en: 'Answers before the call', hu: 'Válaszok a hívás előtt' }, d: { en: 'Frequent questions, fees explained and next steps, so clients arrive prepared.', hu: 'Gyakori kérdések, a díjazás magyarázata és a következő lépések, hogy az ügyfél felkészülten érkezzen.' } },
      { t: { en: 'Team and credentials', hu: 'Csapat és szakmai háttér' }, d: { en: 'Lawyers, languages, bar membership and publications — the reasons to trust you.', hu: 'Ügyvédek, nyelvek, kamarai tagság és publikációk — a bizalom alapjai.' } },
      { t: { en: 'Forms that guide', hu: 'Vezető űrlapok' }, d: { en: 'Short, secure enquiry forms that ask the right questions for each case type.', hu: 'Rövid, biztonságos megkeresési űrlapok, amelyek ügytípusonként a megfelelő kérdéseket teszik fel.' } },
      { t: { en: 'Articles and local SEO', hu: 'Cikkek és helyi SEO' }, d: { en: 'A simple blog for legal updates, legal-service structured data and a tidy Google profile.', hu: 'Egyszerű blog a jogi újdonságokhoz, ügyvédi strukturált adatok és rendezett Google-profil.' } },
    ],
    demoText: {
      en: 'Halmos & Rét is a fictional business law firm shown before and after a redesign: trust at first glance, a consultation booking flow, answers before the call and forms that guide the client.',
      hu: 'A Halmos & Rét egy kitalált üzleti jogi iroda, újratervezés előtt és után: bizalom első ránézésre, konzultációfoglalás, válaszok a hívás előtt és az ügyfelet vezető űrlapok.',
    },
    prices: [
      { name: { en: 'Law firm website', hu: 'Ügyvédi weboldal' }, range: { en: '€900–2,500', hu: '330–900 ezer Ft' }, text: { en: 'Practice areas, team, contact, privacy notice and Google basics.', hu: 'Szakterületek, csapat, elérhetőség, adatkezelési tájékoztató és Google-alapok.' } },
      { name: { en: 'With booking & articles', hu: 'Foglalással és cikkekkel' }, range: { en: '€1,800–4,400', hu: '650 ezer–1,6 M Ft' }, text: { en: 'Consultation booking, guided forms, FAQ and a blog, two languages.', hu: 'Konzultációfoglalás, vezető űrlapok, GYIK és blog, két nyelv.' } },
      { name: { en: 'Client portal', hu: 'Ügyfélportál' }, range: { en: 'from €5,500', hu: '2 M Ft-tól' }, text: { en: 'Secure document exchange, case status and appointments for clients.', hu: 'Biztonságos dokumentumcsere, ügystátusz és időpontok az ügyfeleknek.' } },
    ],
    faq: [
      { q: { en: 'What can a law firm show on its website?', hu: 'Mit mutathat meg egy ügyvédi iroda a weboldalán?' }, a: { en: 'Practice areas, the team, contact details and factual information are fine; the content is written to stay within the bar’s rules on lawyer advertising — the final wording is always yours to approve.', hu: 'A szakterületek, a csapat, az elérhetőség és a tényszerű információk rendben vannak; a tartalom úgy készül, hogy a kamarai reklámszabályokon belül maradjon — a végső szöveget mindig te hagyod jóvá.' } },
      { q: { en: 'Is the enquiry form secure?', hu: 'Biztonságos az űrlap?' }, a: { en: 'Yes: HTTPS, only the data that is needed, and messages delivered to you rather than stored on the website; the privacy notice is part of the project.', hu: 'Igen: HTTPS, csak a szükséges adatok, és az üzenetek hozzád érkeznek, nem a weboldalon tárolódnak; az adatkezelési tájékoztató a projekt része.' } },
      { q: { en: 'Can clients book a consultation online?', hu: 'Foglalhatnak az ügyfelek konzultációt online?' }, a: { en: 'Yes — they pick a topic and a slot from your calendar, in person or online, and get an automatic confirmation.', hu: 'Igen — témát és időpontot választanak a naptáradból, személyesen vagy online, és automatikus visszaigazolást kapnak.' } },
      { q: { en: 'Can the site be in several languages?', hu: 'Lehet több nyelvű az oldal?' }, a: { en: 'Yes, many firms serve foreign clients; each language gets its own address for Google.', hu: 'Igen, sok iroda külföldi ügyfeleket is kiszolgál; minden nyelv saját címet kap a Google-nek.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A law firm website takes about 3–5 weeks, mostly depending on how quickly the texts are approved.', hu: 'Egy ügyvédi weboldal kb. 3–5 hét, főleg attól függően, milyen gyorsan születik meg a szövegek jóváhagyása.' } },
    ],
    interest: { en: 'Website for a law firm (Halmos & Rét style)', hu: 'Weboldal ügyvédi irodának (Halmos & Rét stílus)' },
  },
  {
    slug: 'webshops',
    nav: { en: 'Webshops', hu: 'Webshopok' },
    demo: 'case:shop',
    seo: {
      title: { en: 'Webshop development — fast, mobile-first online shops that sell | softwaredevelopment.hu', hu: 'Webshop készítés — gyors, mobilra tervezett webáruházak, amelyek eladnak | softwaredevelopment.hu' },
      description: {
        en: 'Online shops built to sell: fast product search, product pages that convince, a cart that keeps buyers, payment, shipping and invoicing integrations — on WooCommerce, Shopify or custom. Guide prices and a live demo.',
        hu: 'Eladásra épített webshopok: gyors termékkeresés, meggyőző termékoldalak, vásárlót megtartó kosár, fizetési, szállítási és számlázási integrációk — WooCommerce-en, Shopify-on vagy egyedileg. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Webshop development', hu: 'Webshop készítés' },
      title: { en: ['A shop that', 'sells while', 'you sleep'], hu: ['Webshop, ami', 'akkor is elad,', 'amikor alszol'] },
      lead: {
        en: 'Most shoppers browse on a phone and leave at the first obstacle. A fast shop with clear products, a simple checkout and the payment methods they expect keeps them until the order.',
        hu: 'A vásárlók többsége telefonon böngészik, és az első akadálynál elmegy. Egy gyors webshop átlátható termékekkel, egyszerű pénztárral és a megszokott fizetési módokkal a rendelésig megtartja őket.',
      },
      short: { en: 'Online shops that convert', hu: 'Webshopok, amelyek eladnak' },
    },
    problems: [
      { t: { en: 'Visitors cannot find products', hu: 'A látogató nem találja a terméket' }, d: { en: 'Weak search and filters hide the very product someone came for.', hu: 'A gyenge keresés és szűrés pont azt a terméket rejti el, amiért jött.' } },
      { t: { en: 'Carts abandoned at checkout', hu: 'Pénztárnál elhagyott kosarak' }, d: { en: 'Forced registration, surprise shipping costs and long forms lose sales at the last step.', hu: 'A kötelező regisztráció, a meglepetés szállítási díj és a hosszú űrlap az utolsó lépésnél veszít el eladásokat.' } },
      { t: { en: 'Slow on a phone', hu: 'Lassú mobilon' }, d: { en: 'Heavy themes and plugins make every page wait — and buyers do not.', hu: 'A nehéz sablonok és bővítmények miatt minden oldal vár — a vásárló viszont nem.' } },
      { t: { en: 'Manual work behind the scenes', hu: 'Kézi munka a háttérben' }, d: { en: 'Copying orders into the invoicing and stock systems by hand costs hours every week.', hu: 'A rendelések kézi átvezetése a számlázóba és a készletkezelőbe heti órákat visz el.' } },
    ],
    features: [
      { t: { en: 'Search and filters that work', hu: 'Működő keresés és szűrés' }, d: { en: 'Instant search, categories and filters that lead to the right product in a few taps.', hu: 'Azonnali keresés, kategóriák és szűrők, amelyek pár érintéssel a megfelelő termékhez vezetnek.' } },
      { t: { en: 'Product pages that sell', hu: 'Termékoldalak, amik eladnak' }, d: { en: 'Big photos, variants, stock, delivery time and reviews — answers before the question.', hu: 'Nagy fotók, változatok, készlet, szállítási idő és értékelések — válasz a kérdés előtt.' } },
      { t: { en: 'A checkout that keeps buyers', hu: 'Vásárlót megtartó pénztár' }, d: { en: 'Guest checkout, a free-delivery bar, card, Apple Pay / Google Pay and bank transfer.', hu: 'Vendégvásárlás, ingyenes szállítás sáv, bankkártya, Apple Pay / Google Pay és átutalás.' } },
      { t: { en: 'Shipping and invoicing integrations', hu: 'Szállítási és számlázási integrációk' }, d: { en: 'Parcel lockers and couriers, automatic invoices (e.g. Számlázz.hu, Billingo) and stock sync.', hu: 'Csomagautomaták és futárok, automatikus számla (pl. Számlázz.hu, Billingo) és készletszinkron.' } },
      { t: { en: 'Built for phones', hu: 'Telefonra tervezve' }, d: { en: 'A mobile-first layout and lean code, so pages load quickly even on mobile data.', hu: 'Mobilra tervezett elrendezés és karcsú kód, hogy mobilneten is gyorsan töltsön.' } },
      { t: { en: 'Marketing built in', hu: 'Beépített marketing' }, d: { en: 'Discount codes, newsletter sign-up, product feeds for Google Shopping and analytics with consent.', hu: 'Kuponkódok, hírlevél-feliratkozás, termékfeed a Google Shoppinghoz és hozzájárulásos analitika.' } },
    ],
    demoText: {
      en: 'Kőmáz is a fictional handmade ceramics shop shown before and after a redesign: products that are easy to find, product cards that sell, a cart that keeps buyers and a layout built for phones.',
      hu: 'A Kőmáz egy kitalált kézműves kerámia webshop, újratervezés előtt és után: könnyen megtalálható termékek, eladó termékkártyák, vásárlót megtartó kosár és telefonra tervezett elrendezés.',
    },
    prices: [
      { name: { en: 'Simple webshop', hu: 'Egyszerű webshop' }, range: { en: '€1,400–4,000', hu: '500 ezer–1,5 M Ft' }, text: { en: 'Up to a few hundred products, payment, shipping and invoicing.', hu: 'Néhány száz termékig, fizetés, szállítás és számlázás.' } },
      { name: { en: 'Growing shop', hu: 'Növekvő webshop' }, range: { en: '€4,000–11,000', hu: '1,5–4 M Ft' }, text: { en: 'Custom design, advanced filters, stock and ERP sync, multiple languages.', hu: 'Egyedi design, haladó szűrők, készlet- és ERP-szinkron, több nyelv.' } },
      { name: { en: 'Custom e-commerce / B2B', hu: 'Egyedi e-kereskedelem / B2B' }, range: { en: 'from €11,000', hu: '4 M Ft-tól' }, text: { en: 'Wholesale prices, quotes, customer accounts and complex integrations.', hu: 'Nagykereskedelmi árak, ajánlatkérés, ügyfélfiókok és összetett integrációk.' } },
    ],
    faq: [
      { q: { en: 'WooCommerce, Shopify or custom?', hu: 'WooCommerce, Shopify vagy egyedi?' }, a: { en: 'Shopify is quick to run with a monthly fee, WooCommerce is flexible and has no platform fee, custom is for special processes or large scale. The choice is made together, based on your products and plans.', hu: 'A Shopify gyorsan üzemeltethető havidíjjal, a WooCommerce rugalmas és nincs platformdíja, az egyedi pedig különleges folyamatokhoz vagy nagy méretekhez való. A döntést együtt hozzuk meg a termékeid és terveid alapján.' } },
      { q: { en: 'Can it connect to our invoicing and stock system?', hu: 'Összeköthető a számlázónkkal és a készletkezelőnkkel?' }, a: { en: 'Yes — the common Hungarian invoicing services, couriers and parcel lockers have ready connections, and most ERP or stock systems can be linked through their API.', hu: 'Igen — a gyakori hazai számlázókhoz, futárszolgálatokhoz és csomagautomatákhoz kész kapcsolat van, a legtöbb ERP- vagy készletrendszer pedig az API-ján keresztül köthető be.' } },
      { q: { en: 'Can you take over or rebuild our current shop?', hu: 'Át tudod venni vagy újra tudod építeni a mostani webshopunkat?' }, a: { en: 'Yes. Products, customers and orders are migrated, and old addresses are redirected so search rankings are kept.', hu: 'Igen. A termékek, vásárlók és rendelések átkerülnek, a régi címek pedig átirányítással megmaradnak, így a keresési helyezések sem vesznek el.' } },
      { q: { en: 'Can we manage products ourselves?', hu: 'A termékeket mi magunk kezelhetjük?' }, a: { en: 'Yes — products, prices, stock, discounts and orders are handled in the admin, with a short training at handover.', hu: 'Igen — a termékeket, árakat, készletet, kedvezményeket és rendeléseket az adminfelületen kezelitek, átadáskor rövid betanítással.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A simple webshop takes about 4–8 weeks; larger shops with integrations 2–4 months.', hu: 'Egy egyszerű webshop kb. 4–8 hét; a nagyobb, integrációs webshopok 2–4 hónap.' } },
    ],
    interest: { en: 'Webshop (Kőmáz style)', hu: 'Webshop (Kőmáz stílus)' },
  },
  {
    slug: 'beauty-brands',
    nav: { en: 'Beauty & cosmetics brands', hu: 'Szépség- és kozmetikai márkák' },
    demo: 'velmira',
    seo: {
      title: { en: 'Websites for beauty and cosmetics brands — shop, routine builder, ingredients | softwaredevelopment.hu', hu: 'Weboldal szépség- és kozmetikai márkáknak — webshop, rutinépítő, összetevők | softwaredevelopment.hu' },
      description: {
        en: 'A brand site and shop for skincare and cosmetics: product hotspots, a routine builder, a transparent ingredient explorer, subscriptions and a smooth mobile checkout. Guide prices and a live demo.',
        hu: 'Márkaoldal és webshop bőrápolási és kozmetikai márkáknak: termék-hotspotok, rutinépítő, átlátható összetevő-böngésző, előfizetés és gördülékeny mobilos fizetés. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for beauty & cosmetics brands', hu: 'Weboldal szépség- és kozmetikai márkáknak' },
      title: { en: ['Trust in', 'every', 'ingredient'], hu: ['Bizalom', 'minden', 'összetevőben'] },
      lead: {
        en: 'In skincare, people buy what they understand. A brand site that explains every ingredient, builds a routine for the visitor and checks out in a few taps turns curiosity into repeat orders.',
        hu: 'A bőrápolásban azt veszik meg, amit értenek. Egy márkaoldal, ami minden összetevőt elmagyaráz, rutint állít össze a látogatónak és pár érintéssel fizet, a kíváncsiságból visszatérő rendelést csinál.',
      },
      short: { en: 'Brand shop, routines, ingredients', hu: 'Márkabolt, rutin, összetevők' },
    },
    problems: [
      { t: { en: 'Products that look the same', hu: 'Egyformának tűnő termékek' }, d: { en: 'Without guidance, visitors cannot tell which serum or cream is for them.', hu: 'Útmutatás nélkül a látogató nem tudja, melyik szérum vagy krém való neki.' } },
      { t: { en: 'Ingredients hidden in small print', hu: 'Apró betűben rejtett összetevők' }, d: { en: 'Conscious buyers want concentrations and origins — and leave when they cannot find them.', hu: 'A tudatos vásárló koncentrációt és eredetet szeretne látni — és továbbáll, ha nem találja.' } },
      { t: { en: 'One order, then silence', hu: 'Egy rendelés, aztán csend' }, d: { en: 'Without routines, refills or subscriptions, customers forget to come back.', hu: 'Rutinok, utántöltés vagy előfizetés nélkül a vásárló elfelejt visszatérni.' } },
      { t: { en: 'The brand feels generic', hu: 'Jellegtelen márka' }, d: { en: 'A standard template does not carry the look and feeling of the packaging.', hu: 'Egy átlagos sablon nem adja vissza a csomagolás hangulatát.' } },
    ],
    features: [
      { t: { en: 'Routine builder', hu: 'Rutinépítő' }, d: { en: 'Morning and evening steps put together for the visitor, with a total and one-click add to bag.', hu: 'Reggeli és esti lépések a látogatóra szabva, végösszeggel és egy kattintásos kosárba tétellel.' } },
      { t: { en: 'Ingredient explorer', hu: 'Összetevő-böngésző' }, d: { en: 'Each active with concentration, origin and the products it is in.', hu: 'Minden hatóanyag koncentrációval, eredettel és azzal, mely termékekben szerepel.' } },
      { t: { en: 'Product hotspots', hu: 'Termék-hotspotok' }, d: { en: 'Tap a product in a still life to see its details — browsing that feels like the counter.', hu: 'Egy csendéleten a termékre koppintva megjelennek a részletek — mintha a pultnál válogatnál.' } },
      { t: { en: 'Subscriptions and refills', hu: 'Előfizetés és utántöltés' }, d: { en: 'Subscribe-and-save and refill reminders that bring customers back.', hu: 'Előfizetéses kedvezmény és utántöltési emlékeztető, ami visszahozza a vásárlókat.' } },
      { t: { en: 'A bag that keeps buyers', hu: 'Vásárlót megtartó kosár' }, d: { en: 'A slide-in bag with the amount left until free shipping and mobile-friendly payment.', hu: 'Oldalról beúszó kosár az ingyenes szállításig hátralévő összeggel és mobilbarát fizetéssel.' } },
      { t: { en: 'Multi-market ready', hu: 'Több piacra felkészítve' }, d: { en: 'Languages, currencies and shipping zones for selling across the EU.', hu: 'Nyelvek, pénznemek és szállítási zónák az EU-s értékesítéshez.' } },
    ],
    demoText: {
      en: 'Velmira is a fictional clean skincare brand: a code-drawn still life with product hotspots, a routine builder with a running total, an ingredient explorer and a slide-in bag with subscribe-and-save.',
      hu: 'A Velmira egy kitalált natúr bőrápolási márka: kódból rajzolt csendélet termék-hotspotokkal, végösszeget számoló rutinépítő, összetevő-böngésző és oldalról beúszó kosár előfizetéses kedvezménnyel.',
    },
    prices: [
      { name: { en: 'Brand site & shop', hu: 'Márkaoldal és webshop' }, range: { en: '€2,200–5,500', hu: '800 ezer–2 M Ft' }, text: { en: 'Custom brand design, product pages, payment and shipping.', hu: 'Egyedi márkadesign, termékoldalak, fizetés és szállítás.' } },
      { name: { en: 'With routine builder & ingredients', hu: 'Rutinépítővel és összetevőkkel' }, range: { en: '€4,000–8,000', hu: '1,5–3 M Ft' }, text: { en: 'Routine builder, ingredient explorer, hotspots, reviews.', hu: 'Rutinépítő, összetevő-böngésző, hotspotok, értékelések.' } },
      { name: { en: 'Subscriptions & multi-market', hu: 'Előfizetés és több piac' }, range: { en: 'from €8,000', hu: '3 M Ft-tól' }, text: { en: 'Subscriptions, several languages and currencies, CRM integration.', hu: 'Előfizetés, több nyelv és pénznem, CRM-integráció.' } },
    ],
    faq: [
      { q: { en: 'Can it run on Shopify?', hu: 'Működhet Shopify-on?' }, a: { en: 'Yes — many beauty brands use Shopify; the routine builder and ingredient explorer can be built on top of it, or the whole shop can be custom.', hu: 'Igen — sok szépségmárka Shopify-t használ; a rutinépítő és az összetevő-böngésző ráépíthető, vagy az egész bolt lehet egyedi.' } },
      { q: { en: 'Can we sell subscriptions?', hu: 'Árulhatunk előfizetést?' }, a: { en: 'Yes, with recurring card payments, pause and skip options and automatic reminders.', hu: 'Igen, ismétlődő kártyás fizetéssel, szüneteltetési és kihagyási lehetőséggel és automatikus emlékeztetőkkel.' } },
      { q: { en: 'What about product claims and regulations?', hu: 'Mi a helyzet a termékállításokkal és a szabályozással?' }, a: { en: 'The site displays the ingredient lists and texts you provide; cosmetic claims and labelling follow your regulatory documentation, which stays your responsibility.', hu: 'Az oldal az általad megadott összetevőlistákat és szövegeket jeleníti meg; a kozmetikai állítások és a címkézés a szabályozási dokumentációdat követik, ami a te felelősséged marad.' } },
      { q: { en: 'Can we sell abroad?', hu: 'Árulhatunk külföldre?' }, a: { en: 'Yes — languages, currencies, VAT rules and shipping zones can be set up per market.', hu: 'Igen — nyelvek, pénznemek, áfaszabályok és szállítási zónák piaconként beállíthatók.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A brand site with shop takes about 6–10 weeks; with routine builder and subscriptions 2–4 months.', hu: 'Egy márkaoldal webshoppal kb. 6–10 hét; rutinépítővel és előfizetéssel 2–4 hónap.' } },
    ],
    interest: { en: 'Website for a beauty brand (Velmira style)', hu: 'Weboldal szépségmárkának (Velmira stílus)' },
  },
  {
    slug: 'product-launches',
    nav: { en: 'Product launches', hu: 'Termékbevezetések' },
    demo: 'kinvel',
    seo: {
      title: { en: 'Product launch websites — 3D configurators, pre-orders, launch pages | softwaredevelopment.hu', hu: 'Termékbevezető weboldal — 3D konfigurátor, előrendelés, launch oldal | softwaredevelopment.hu' },
      description: {
        en: 'A launch page that makes people want the product: a colour configurator, a 360° turntable or 3D model, specs that read well, pre-orders and a waiting list. Guide prices and a live demo.',
        hu: 'Bevezető oldal, amitől az emberek megkívánják a terméket: színkonfigurátor, 360°-os forgatás vagy 3D modell, jól olvasható specifikáció, előrendelés és várólista. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for product launches', hu: 'Weboldal termékbevezetéshez' },
      title: { en: ['Make them', 'want it', 'before it ships'], hu: ['Kívánják meg,', 'mielőtt', 'megérkezik'] },
      lead: {
        en: 'A launch has one chance to impress. A page where people can turn the product, try its colours and pre-order on the spot turns attention into a waiting list — and the waiting list into sales.',
        hu: 'Egy bevezetésnek egyetlen esélye van lenyűgözni. Egy oldal, ahol a terméket körbe lehet forgatni, ki lehet próbálni a színeit és azonnal elő lehet rendelni, a figyelemből várólistát csinál — a várólistából pedig eladást.',
      },
      short: { en: 'Configurators, 3D and pre-orders', hu: 'Konfigurátor, 3D és előrendelés' },
    },
    problems: [
      { t: { en: 'Photos that do not convince', hu: 'Nem meggyőző fotók' }, d: { en: 'A few static images cannot show a product people have never touched.', hu: 'Néhány állókép nem tudja megmutatni a terméket, amit még senki nem fogott a kezében.' } },
      { t: { en: 'Buzz that fades', hu: 'Elillanó érdeklődés' }, d: { en: 'Launch traffic with no waiting list or pre-order is attention lost.', hu: 'A bevezetéskor érkező forgalom várólista vagy előrendelés nélkül elveszett figyelem.' } },
      { t: { en: 'Specs nobody reads', hu: 'Senki nem olvassa a specifikációt' }, d: { en: 'Long tables hide the two numbers that matter.', hu: 'A hosszú táblázatok elrejtik azt a két számot, ami igazán számít.' } },
      { t: { en: 'Slow, heavy pages', hu: 'Lassú, nehéz oldalak' }, d: { en: 'Big visuals done carelessly make the page crawl on phones.', hu: 'A gondatlanul kezelt nagy látványelemek mobilon lelassítják az oldalt.' } },
    ],
    features: [
      { t: { en: 'Colour and options configurator', hu: 'Szín- és opciókonfigurátor' }, d: { en: 'Pick colours and options and see the product change instantly, with the price.', hu: 'Színek és opciók választása, a termék azonnal változik, az árral együtt.' } },
      { t: { en: '360° turntable or 3D model', hu: '360°-os forgatás vagy 3D modell' }, d: { en: 'Turn the product in the browser — like the garage and T-shirt designers on this site.', hu: 'A termék körbeforgatható a böngészőben — mint az oldal garázs- és pólótervezője.' } },
      { t: { en: 'Pre-orders and waiting list', hu: 'Előrendelés és várólista' }, d: { en: 'Deposits or sign-ups with launch updates by email.', hu: 'Előleg vagy feliratkozás, bevezetési hírekkel e-mailben.' } },
      { t: { en: 'Specs that read well', hu: 'Jól olvasható specifikáció' }, d: { en: 'The key numbers up front, comparisons and details for those who want them.', hu: 'A fontos számok elöl, összehasonlítás és részletek annak, aki kéri.' } },
      { t: { en: 'Motion that performs', hu: 'Gyors animációk' }, d: { en: 'Scroll animations and visuals optimised so the page stays fast on phones.', hu: 'Görgetési animációk és látványelemek úgy optimalizálva, hogy mobilon is gyors maradjon.' } },
      { t: { en: 'Press and dealers', hu: 'Sajtó és kereskedők' }, d: { en: 'A press kit, dealer finder or B2B enquiry form.', hu: 'Sajtócsomag, kereskedőkereső vagy B2B megkeresési űrlap.' } },
    ],
    demoText: {
      en: 'Kinvel One is a fictional premium e-bike launch: a colour configurator and a turntable that rotates the bike, specs that read at a glance and a clear path to pre-order.',
      hu: 'A Kinvel One egy kitalált prémium e-bike bevezetése: színkonfigurátor, körbeforgatható kerékpár, egy pillantással olvasható specifikáció és egyértelmű út az előrendelésig.',
    },
    prices: [
      { name: { en: 'Launch landing page', hu: 'Bevezető landing oldal' }, range: { en: '€1,100–3,300', hu: '400 ezer–1,2 M Ft' }, text: { en: 'One page with story, specs, gallery and waiting list.', hu: 'Egy oldal történettel, specifikációval, galériával és várólistával.' } },
      { name: { en: 'With configurator', hu: 'Konfigurátorral' }, range: { en: '€3,300–8,000', hu: '1,2–3 M Ft' }, text: { en: 'Colour configurator or 360° turntable, pre-orders, two languages.', hu: 'Színkonfigurátor vagy 360°-os forgatás, előrendelés, két nyelv.' } },
      { name: { en: 'Full 3D configurator', hu: 'Teljes 3D konfigurátor' }, range: { en: 'from €8,000', hu: '3 M Ft-tól' }, text: { en: 'Real-time 3D model, options with pricing, orders and dealer integration.', hu: 'Valós idejű 3D modell, árazott opciók, rendelés és kereskedői integráció.' } },
    ],
    faq: [
      { q: { en: 'Do we need a 3D model of the product?', hu: 'Kell a termékről 3D modell?' }, a: { en: 'For a real 3D configurator, yes — CAD files can usually be converted and optimised for the web. A 360° turntable works from a series of photos instead.', hu: 'Valódi 3D konfigurátorhoz igen — a CAD-fájlok általában átalakíthatók és optimalizálhatók a webre. A 360°-os forgatás fotósorozatból is működik.' } },
      { q: { en: 'Can people pre-order or pay a deposit?', hu: 'Lehet előrendelni vagy előleget fizetni?' }, a: { en: 'Yes, with online card payment, and the waiting list gets automatic launch emails.', hu: 'Igen, online kártyás fizetéssel, a várólista pedig automatikus bevezetési e-maileket kap.' } },
      { q: { en: 'Will heavy visuals slow the page down?', hu: 'Lelassítják az oldalt a nagy látványelemek?' }, a: { en: 'Not if they are built carefully: compressed models and images, loading only what is visible and animations that respect reduced-motion settings.', hu: 'Nem, ha gondosan készülnek: tömörített modellek és képek, csak a látható rész betöltése, és a csökkentett mozgást tiszteletben tartó animációk.' } },
      { q: { en: 'Can it become a full shop after launch?', hu: 'Lehet belőle teljes webshop a bevezetés után?' }, a: { en: 'Yes — the launch page can grow into a shop with accessories, financing and dealer search.', hu: 'Igen — a bevezető oldalból kiegészítőkkel, finanszírozással és kereskedőkeresővel bővülő webshop lehet.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A launch page takes about 2–4 weeks; with a configurator 6–10 weeks, so start well before the launch date.', hu: 'Egy bevezető oldal kb. 2–4 hét; konfigurátorral 6–10 hét, ezért érdemes jóval a bevezetés előtt elkezdeni.' } },
    ],
    interest: { en: 'Product launch page (Kinvel style)', hu: 'Termékbevezető oldal (Kinvel stílus)' },
  },
  {
    slug: 'ai-startups',
    nav: { en: 'AI startups & SaaS', hu: 'MI-startupok és SaaS' },
    demo: 'echovane',
    seo: {
      title: { en: 'Websites for AI startups and SaaS — live product demos, pricing, sign-ups | softwaredevelopment.hu', hu: 'Weboldal MI-startupoknak és SaaS-cégeknek — élő termékdemó, árazás, regisztráció | softwaredevelopment.hu' },
      description: {
        en: 'A SaaS website that shows the product working instead of describing it: a live demo in the hero, features in motion, clear pricing, sign-up and docs — plus the web app behind it if you need one. Guide prices and a live demo.',
        hu: 'SaaS-weboldal, ami működés közben mutatja a terméket ahelyett, hogy leírná: élő demó a nyitóképen, mozgó funkcióbemutatók, átlátható árazás, regisztráció és dokumentáció — és ha kell, a mögötte lévő webalkalmazás is. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for AI startups & SaaS', hu: 'Weboldal MI-startupoknak és SaaS-cégeknek' },
      title: { en: ['Show it', 'working,', 'not described'], hu: ['Mutasd meg', 'működés', 'közben'] },
      lead: {
        en: 'Visitors decide in seconds whether a product is worth a trial. A site that shows the product doing its job — live, right in the hero — explains more than any paragraph and gets more sign-ups.',
        hu: 'A látogató másodpercek alatt dönti el, megér-e egy próbát a termék. Egy oldal, ami élőben, már a nyitóképen mutatja a terméket munka közben, többet elmond bármilyen bekezdésnél, és több regisztrációt hoz.',
      },
      short: { en: 'Live demos, pricing and sign-ups', hu: 'Élő demó, árazás és regisztráció' },
    },
    problems: [
      { t: { en: 'Buzzwords instead of a product', hu: 'Divatszavak a termék helyett' }, d: { en: '“AI-powered platform” tells visitors nothing about what they will get.', hu: 'Az „MI-alapú platform” semmit nem mond arról, mit kap a látogató.' } },
      { t: { en: 'Screenshots that go stale', hu: 'Elavuló képernyőképek' }, d: { en: 'Static images fall behind every release and never show the magic moment.', hu: 'Az állóképek minden kiadással lemaradnak, és sosem mutatják a varázslatos pillanatot.' } },
      { t: { en: 'Pricing that confuses', hu: 'Zavaros árazás' }, d: { en: 'Unclear plans and hidden limits stop people at the last step.', hu: 'Az átláthatatlan csomagok és rejtett korlátok az utolsó lépésnél állítják meg a látogatót.' } },
      { t: { en: 'A slow marketing site', hu: 'Lassú marketingoldal' }, d: { en: 'A heavy builder site hurts both first impressions and search rankings.', hu: 'Egy nehéz, oldalépítős oldal az első benyomást és a keresési helyezést is rontja.' } },
    ],
    features: [
      { t: { en: 'A live demo in the hero', hu: 'Élő demó a nyitóképen' }, d: { en: 'The product working in front of the visitor, built in code rather than a video.', hu: 'A termék a látogató előtt dolgozik, kódból felépítve, nem videóként.' } },
      { t: { en: 'Features in motion', hu: 'Mozgó funkcióbemutatók' }, d: { en: 'Each feature shown briefly and working, from search to integrations.', hu: 'Minden funkció röviden, működés közben, a kereséstől az integrációkig.' } },
      { t: { en: 'Clear pricing', hu: 'Átlátható árazás' }, d: { en: 'Plans, limits and a monthly/yearly toggle that answer questions before sales calls.', hu: 'Csomagok, korlátok és havi/éves kapcsoló, ami az értékesítési hívás előtt megválaszolja a kérdéseket.' } },
      { t: { en: 'Sign-up and onboarding', hu: 'Regisztráció és bevezetés' }, d: { en: 'Trial sign-up, waiting list or demo booking, connected to your product and CRM.', hu: 'Próbaregisztráció, várólista vagy demófoglalás, a termékedhez és a CRM-hez kötve.' } },
      { t: { en: 'Docs, changelog and blog', hu: 'Dokumentáció, changelog és blog' }, d: { en: 'Content that ranks, builds trust and is easy for the team to update.', hu: 'Tartalom, ami jól rangsorol, bizalmat épít, és a csapat könnyen frissíti.' } },
      { t: { en: 'The web app, too', hu: 'A webalkalmazás is' }, d: { en: 'The product itself — dashboard, AI features, APIs — built in React and Java/Spring.', hu: 'Maga a termék is — dashboard, MI-funkciók, API-k — React és Java/Spring alapokon.' } },
    ],
    demoText: {
      en: 'Echovane is a fictional AI meeting assistant: the hero is a live demo where the transcript types itself while the summary and action items come together, every feature is shown in motion and pricing switches between monthly and yearly.',
      hu: 'Az Echovane egy kitalált MI-alapú meetingasszisztens: a nyitókép élő demó, ahol gépelődik az átirat, mellette összeáll az összefoglaló és a teendőlista, minden funkció működés közben látszik, az árazás pedig havi és éves között vált.',
    },
    prices: [
      { name: { en: 'Launch landing page', hu: 'Bevezető landing oldal' }, range: { en: '€1,100–3,300', hu: '400 ezer–1,2 M Ft' }, text: { en: 'One page with the story, features, waiting list and analytics.', hu: 'Egy oldal a történettel, funkciókkal, várólistával és analitikával.' } },
      { name: { en: 'Product website', hu: 'Termékweboldal' }, range: { en: '€2,700–6,500', hu: '1–2,4 M Ft' }, text: { en: 'Live demo, feature pages, pricing, docs/blog and sign-up integration.', hu: 'Élő demó, funkcióoldalak, árazás, dokumentáció/blog és regisztrációs integráció.' } },
      { name: { en: 'MVP web app', hu: 'MVP webalkalmazás' }, range: { en: 'from €8,000', hu: '3 M Ft-tól' }, text: { en: 'The product’s first version: accounts, core features, AI integration, billing.', hu: 'A termék első verziója: fiókok, alapfunkciók, MI-integráció, számlázás.' } },
    ],
    faq: [
      { q: { en: 'Can you build the product too, not just the website?', hu: 'A terméket is meg tudod építeni, nem csak a weboldalt?' }, a: { en: 'Yes — web applications with React front ends, Java/Spring back ends and AI integration (LLMs, RAG, function calling) are a core service.', hu: 'Igen — a React frontendes, Java/Spring backendes, MI-integrációs (LLM, RAG, function calling) webalkalmazások a fő szolgáltatások közé tartoznak.' } },
      { q: { en: 'Why a coded demo instead of a video?', hu: 'Miért kódolt demó videó helyett?' }, a: { en: 'It loads faster, stays sharp on every screen, can be interactive and is easy to update when the product changes.', hu: 'Gyorsabban tölt, minden képernyőn éles marad, lehet interaktív, és könnyű frissíteni, ha a termék változik.' } },
      { q: { en: 'Can the team edit the site without a developer?', hu: 'Szerkesztheti a csapat fejlesztő nélkül?' }, a: { en: 'Yes — blog, docs, changelog and pricing can be edited in a CMS or as Markdown in your repository.', hu: 'Igen — a blog, a dokumentáció, a changelog és az árazás CMS-ben vagy Markdownként a repóban szerkeszthető.' } },
      { q: { en: 'Do you work with early-stage startups?', hu: 'Korai fázisú startupokkal is dolgozol?' }, a: { en: 'Yes — a focused landing page and a small MVP are a good way to test an idea before a larger build.', hu: 'Igen — egy fókuszált landing oldal és egy kis MVP jó módja egy ötlet tesztelésének a nagyobb fejlesztés előtt.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A landing page takes about 2–3 weeks, a product website 4–8 weeks, an MVP typically 2–4 months.', hu: 'Egy landing oldal kb. 2–3 hét, egy termékweboldal 4–8 hét, egy MVP jellemzően 2–4 hónap.' } },
    ],
    interest: { en: 'Website for an AI startup / SaaS (Echovane style)', hu: 'Weboldal MI-startupnak / SaaS-nak (Echovane stílus)' },
  },
  {
    slug: 'fintech',
    nav: { en: 'Fintech & finance', hu: 'Fintech és pénzügy' },
    demo: 'vaulmere',
    seo: {
      title: { en: 'Websites and web apps for fintech and financial services | softwaredevelopment.hu', hu: 'Weboldal és webalkalmazás fintech- és pénzügyi cégeknek | softwaredevelopment.hu' },
      description: {
        en: 'Premium, trustworthy websites and secure web applications for fintech and financial services: calculators, onboarding flows, client portals — built by a developer with banking platform experience. Guide prices and a live demo.',
        hu: 'Prémium, megbízható weboldalak és biztonságos webalkalmazások fintech- és pénzügyi szolgáltatóknak: kalkulátorok, regisztrációs folyamatok, ügyfélportálok — banki platformokon szerzett tapasztalattal. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for fintech & finance', hu: 'Weboldal fintech- és pénzügyi cégeknek' },
      title: { en: ['Quiet', 'luxury,', 'serious security'], hu: ['Csendes', 'luxus,', 'komoly biztonság'] },
      lead: {
        en: 'In finance, the website is the first proof that money is safe with you. A calm, premium site with clear numbers — and secure applications behind it — earns that trust.',
        hu: 'A pénzügyekben a weboldal az első bizonyíték arra, hogy nálad biztonságban van a pénz. Egy nyugodt, prémium oldal világos számokkal — és mögötte biztonságos alkalmazásokkal — kiérdemli ezt a bizalmat.',
      },
      short: { en: 'Trust, calculators and secure apps', hu: 'Bizalom, kalkulátorok és biztonságos appok' },
    },
    problems: [
      { t: { en: 'Generic “bank blue” sites', hu: 'Egyforma „bankkék” oldalak' }, d: { en: 'Interchangeable templates make a premium service look ordinary.', hu: 'A felcserélhető sablonok hétköznapivá teszik a prémium szolgáltatást.' } },
      { t: { en: 'Numbers people cannot use', hu: 'Használhatatlan számok' }, d: { en: 'Rates and fees in fine print instead of a calculator that answers “what does it mean for me?”', hu: 'Kamatok és díjak apró betűvel, kalkulátor helyett, ami megválaszolja: „mit jelent ez nekem?”' } },
      { t: { en: 'Onboarding that loses people', hu: 'Elvesző ügyfelek a regisztrációnál' }, d: { en: 'Long, unclear sign-up flows drop applicants at every step.', hu: 'A hosszú, átláthatatlan regisztráció minden lépésnél veszít el jelentkezőket.' } },
      { t: { en: 'Security as an afterthought', hu: 'Utólagos biztonság' }, d: { en: 'Missing headers, outdated libraries and weak forms are a risk regulators and clients notice.', hu: 'A hiányzó fejlécek, elavult könyvtárak és gyenge űrlapok olyan kockázatok, amelyeket a felügyelet és az ügyfelek is észrevesznek.' } },
    ],
    features: [
      { t: { en: 'Premium brand design', hu: 'Prémium márkadesign' }, d: { en: 'A distinctive, calm visual identity that feels as valuable as the service.', hu: 'Egyedi, nyugodt vizuális arculat, ami olyan értékesnek hat, mint a szolgáltatás.' } },
      { t: { en: 'Calculators and comparisons', hu: 'Kalkulátorok és összehasonlítások' }, d: { en: 'Loan, savings, fee or return calculators that make the offer concrete.', hu: 'Hitel-, megtakarítási, díj- vagy hozamkalkulátorok, amelyek kézzelfoghatóvá teszik az ajánlatot.' } },
      { t: { en: 'Guided onboarding', hu: 'Vezetett regisztráció' }, d: { en: 'Step-by-step application flows with progress, validation and saved drafts.', hu: 'Lépésenkénti jelentkezés haladásjelzővel, ellenőrzéssel és mentett piszkozattal.' } },
      { t: { en: 'Client portals', hu: 'Ügyfélportálok' }, d: { en: 'Secure dashboards for portfolios, documents and statements.', hu: 'Biztonságos felületek portfóliókhoz, dokumentumokhoz és kimutatásokhoz.' } },
      { t: { en: 'Security by default', hu: 'Alapértelmezett biztonság' }, d: { en: 'HTTPS, security headers, audited dependencies and careful handling of personal data.', hu: 'HTTPS, biztonsági fejlécek, ellenőrzött függőségek és a személyes adatok gondos kezelése.' } },
      { t: { en: 'Banking-grade experience', hu: 'Banki tapasztalat' }, d: { en: 'Built by a developer who has worked on banking platform modernisation and integrations.', hu: 'Olyan fejlesztőtől, aki banki platformok modernizációján és integrációin dolgozott.' } },
    ],
    demoText: {
      en: 'Vaulmere is a fictional private wealth app and metal card: dark, quiet luxury, a card that catches the light and a product story told with restraint.',
      hu: 'A Vaulmere egy kitalált privát vagyonkezelő app és fémkártya: sötét, csendes luxus, a kártyán megcsillanó fény és visszafogottan elmesélt termék.',
    },
    prices: [
      { name: { en: 'Marketing website', hu: 'Marketingweboldal' }, range: { en: '€2,200–5,500', hu: '800 ezer–2 M Ft' }, text: { en: 'Premium design, product pages, compliance texts and lead forms.', hu: 'Prémium design, termékoldalak, megfelelőségi szövegek és ajánlatkérő űrlapok.' } },
      { name: { en: 'With calculators & onboarding', hu: 'Kalkulátorokkal és regisztrációval' }, range: { en: '€4,400–11,000', hu: '1,6–4 M Ft' }, text: { en: 'Interactive calculators, multi-step applications, CRM integration.', hu: 'Interaktív kalkulátorok, többlépéses jelentkezés, CRM-integráció.' } },
      { name: { en: 'Portals & platforms', hu: 'Portálok és platformok' }, range: { en: 'from €14,000', hu: '5 M Ft-tól' }, text: { en: 'Client portals, dashboards and integrations with core systems.', hu: 'Ügyfélportálok, dashboardok és integráció a központi rendszerekkel.' } },
    ],
    faq: [
      { q: { en: 'Do you have experience with financial systems?', hu: 'Van tapasztalatod pénzügyi rendszerekkel?' }, a: { en: 'Yes — banking platform modernisation, a stock market web app and an accounting system are among the case studies on this site.', hu: 'Igen — banki platformok modernizációja, tőzsdei webalkalmazás és könyvelési rendszer is szerepel az oldal esettanulmányai között.' } },
      { q: { en: 'How is security handled?', hu: 'Hogyan kezeled a biztonságot?' }, a: { en: 'HTTPS everywhere, strict security headers, minimal third-party scripts, input validation and least-privilege access; deeper audits and penetration tests can be arranged with specialists.', hu: 'Mindenhol HTTPS, szigorú biztonsági fejlécek, minimális külső szkript, bemeneti ellenőrzés és legkisebb jogosultság elve; mélyebb auditot és behatolásteszt szakértőkkel szervezhető.' } },
      { q: { en: 'Can the site meet regulatory requirements?', hu: 'Meg tud felelni a szabályozói elvárásoknak?' }, a: { en: 'The site is built to display the disclosures, risk warnings and privacy information your compliance team provides; the legal content itself stays with them.', hu: 'Az oldal úgy készül, hogy megjelenítse a megfelelőségi csapatod által adott közzétételeket, kockázati figyelmeztetéseket és adatvédelmi információkat; a jogi tartalom felelőssége náluk marad.' } },
      { q: { en: 'Can it connect to our core systems?', hu: 'Összeköthető a központi rendszereinkkel?' }, a: { en: 'Yes, through APIs or secure integration layers — integrations with banking systems are part of the experience.', hu: 'Igen, API-kon vagy biztonságos integrációs rétegen keresztül — a banki rendszerekkel való integráció is a tapasztalat része.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A marketing site takes about 4–8 weeks; calculators and onboarding 2–4 months; portals are planned in phases.', hu: 'Egy marketingoldal kb. 4–8 hét; kalkulátorok és regisztráció 2–4 hónap; a portálokat szakaszokra bontva tervezzük.' } },
    ],
    interest: { en: 'Website for fintech / finance (Vaulmere style)', hu: 'Weboldal fintech / pénzügyi cégnek (Vaulmere stílus)' },
  },
  {
    slug: 'real-estate',
    nav: { en: 'Real estate & developments', hu: 'Ingatlan és lakóparkok' },
    demo: 'revhajlat',
    seo: {
      title: { en: 'Websites for residential developments and real estate — interactive availability | softwaredevelopment.hu', hu: 'Weboldal lakóparkoknak és ingatlanfejlesztőknek — interaktív lakáskereső | softwaredevelopment.hu' },
      description: {
        en: 'A project website that sells apartments: an interactive building elevation, a live apartment finder with prices and status, floor plans, sunlight and enquiry forms that reach the sales team. Guide prices and a live demo.',
        hu: 'Projektoldal, ami eladja a lakásokat: interaktív homlokzat, élő lakáskereső árakkal és státusszal, alaprajzok, napfény és az értékesítőkhöz érkező érdeklődés. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for real estate developments', hu: 'Weboldal ingatlanfejlesztéseknek' },
      title: { en: ['Find the', 'apartment', 'in one click'], hu: ['Egy kattintás,', 'és megvan', 'a lakás'] },
      lead: {
        en: 'Buyers want to know which apartments are free, what they cost and how much light they get. A site that answers on the building itself sends the sales team warm, specific enquiries.',
        hu: 'A vevő tudni akarja, melyik lakás szabad, mennyibe kerül és mennyi fény lesz benne. Egy oldal, ami magán az épületen válaszol, konkrét, meleg érdeklődőket küld az értékesítőknek.',
      },
      short: { en: 'Interactive availability and floor plans', hu: 'Interaktív lakáskereső és alaprajzok' },
    },
    problems: [
      { t: { en: 'PDF price lists', hu: 'PDF árlisták' }, d: { en: 'Outdated lists by email mean questions about apartments that are already sold.', hu: 'Az e-mailben küldött, elavult listák miatt már eladott lakásokról jönnek kérdések.' } },
      { t: { en: 'Renders without answers', hu: 'Látványtervek válaszok nélkül' }, d: { en: 'Beautiful images, but no way to see sizes, orientation or status.', hu: 'Szép képek, de nem látszik a méret, a tájolás vagy a státusz.' } },
      { t: { en: 'Unqualified enquiries', hu: 'Pontatlan érdeklődések' }, d: { en: '“Send me everything” emails cost the sales team time.', hu: 'A „küldjenek el mindent” e-mailek az értékesítők idejét viszik.' } },
      { t: { en: 'A site that ages with the project', hu: 'A projekttel együtt öregedő oldal' }, d: { en: 'Statuses, phases and prices that nobody updates in time.', hu: 'Státuszok, ütemek és árak, amelyeket senki nem frissít időben.' } },
    ],
    features: [
      { t: { en: 'Interactive building', hu: 'Interaktív épület' }, d: { en: 'Point at a floor to see its apartments with size, orientation, price and status.', hu: 'Egy emeletre mutatva látszanak a lakások mérettel, tájolással, árral és státusszal.' } },
      { t: { en: 'Apartment finder', hu: 'Lakáskereső' }, d: { en: 'Filter by rooms, area, floor, view and price — always in sync with availability.', hu: 'Szűrés szobaszám, alapterület, emelet, kilátás és ár szerint — mindig naprakész elérhetőséggel.' } },
      { t: { en: 'Floor plans and sunlight', hu: 'Alaprajzok és napfény' }, d: { en: 'Downloadable plans and a slider that moves the sun across the plan through the day.', hu: 'Letölthető alaprajzok és egy csúszka, ami végigviszi a napot az alaprajzon a nap folyamán.' } },
      { t: { en: 'Enquiries per apartment', hu: 'Lakásonkénti érdeklődés' }, d: { en: 'Enquiries and viewing requests that name the apartment, straight to sales or the CRM.', hu: 'Az adott lakást megnevező érdeklődés és bejárási kérés, közvetlenül az értékesítőkhöz vagy a CRM-be.' } },
      { t: { en: 'Easy status updates', hu: 'Egyszerű státuszfrissítés' }, d: { en: 'Sales mark apartments reserved or sold in an admin, or it syncs from your sales system.', hu: 'Az értékesítők az adminban jelölik a foglalt vagy eladott lakást, vagy az értékesítési rendszerből szinkronizál.' } },
      { t: { en: 'Location and progress', hu: 'Elhelyezkedés és építési napló' }, d: { en: 'Neighbourhood map, construction updates and phases that keep buyers informed.', hu: 'Környéktérkép, építési hírek és ütemek, amelyek tájékoztatva tartják a vevőket.' } },
    ],
    demoText: {
      en: 'Révhajlat Rezidencia is a fictional riverside development: an interactive elevation where each floor shows its apartments, an apartment finder and a slider that moves the sun across a floor plan from morning to evening.',
      hu: 'A Révhajlat Rezidencia egy kitalált dunaparti fejlesztés: interaktív homlokzat, ahol minden emelet mutatja a lakásait, lakáskereső és egy csúszka, ami reggeltől estig végigviszi a napot az alaprajzon.',
    },
    prices: [
      { name: { en: 'Project website', hu: 'Projektoldal' }, range: { en: '€1,600–4,000', hu: '600 ezer–1,5 M Ft' }, text: { en: 'Story, renders, location, apartment list and enquiry form.', hu: 'Történet, látványtervek, elhelyezkedés, lakáslista és érdeklődési űrlap.' } },
      { name: { en: 'With interactive availability', hu: 'Interaktív lakáskeresővel' }, range: { en: '€3,300–8,000', hu: '1,2–3 M Ft' }, text: { en: 'Interactive building, apartment finder, floor plans, admin for statuses.', hu: 'Interaktív épület, lakáskereső, alaprajzok, státuszkezelő admin.' } },
      { name: { en: 'Sales integration', hu: 'Értékesítési integráció' }, range: { en: 'from €8,000', hu: '3 M Ft-tól' }, text: { en: 'CRM/sales system sync, reservations and multi-project portal.', hu: 'CRM-/értékesítési rendszer szinkron, foglalás és több projektet kezelő portál.' } },
    ],
    faq: [
      { q: { en: 'Who updates the apartment statuses?', hu: 'Ki frissíti a lakások státuszát?' }, a: { en: 'Your sales team in a simple admin — or automatically from the sales system or CRM if you use one.', hu: 'Az értékesítő csapat egy egyszerű adminban — vagy automatikusan az értékesítési rendszerből vagy a CRM-ből, ha használtok ilyet.' } },
      { q: { en: 'Do we need a 3D model of the building?', hu: 'Kell 3D modell az épületről?' }, a: { en: 'No — the interactive elevation is built on your renders; a 3D model is an optional extra.', hu: 'Nem — az interaktív homlokzat a látványterveitekre épül; a 3D modell opcionális extra.' } },
      { q: { en: 'Can one site handle several projects?', hu: 'Egy oldal több projektet is kezelhet?' }, a: { en: 'Yes, as a developer portal with a page and finder per project.', hu: 'Igen, fejlesztői portálként, projektenként saját oldallal és keresővel.' } },
      { q: { en: 'Can buyers reserve online?', hu: 'Foglalhatnak a vevők online?' }, a: { en: 'Usually enquiries and viewing requests work best; online reservations with a deposit are possible when your sales process allows it.', hu: 'Általában az érdeklődés és a bejárási kérés működik a legjobban; előleges online foglalás is lehetséges, ha az értékesítési folyamat megengedi.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A project site takes about 3–5 weeks; with the interactive building and finder 6–10 weeks — ideally ready for the start of sales.', hu: 'Egy projektoldal kb. 3–5 hét; interaktív épülettel és lakáskeresővel 6–10 hét — ideális esetben az értékesítés indulására.' } },
    ],
    interest: { en: 'Website for a residential development (Révhajlat style)', hu: 'Weboldal lakóparknak (Révhajlat stílus)' },
  },
  {
    slug: 'architects',
    nav: { en: 'Architects & interior designers', hu: 'Építészek és belsőépítészek' },
    demo: 'kovonal',
    seo: {
      title: { en: 'Websites for architects and interior designers — editorial portfolios | softwaredevelopment.hu', hu: 'Weboldal építészeknek és belsőépítészeknek — szerkesztőségi portfólió | softwaredevelopment.hu' },
      description: {
        en: 'An editorial portfolio that lets the work speak: large images that reveal as you scroll, project stories, a studio page and enquiries — fast, minimal and easy to update. Guide prices and a live demo.',
        hu: 'Szerkesztőségi portfólió, ahol a munka beszél: görgetésre kibomló nagy képek, projekttörténetek, stúdióoldal és ajánlatkérés — gyorsan, letisztultan, könnyen frissíthetően. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for architects & interior designers', hu: 'Weboldal építészeknek és belsőépítészeknek' },
      title: { en: ['Let the', 'work', 'speak'], hu: ['Hadd', 'beszéljen', 'a munka'] },
      lead: {
        en: 'Clients choose an architect by the work. An editorial portfolio with large, fast images and the story behind each project shows your eye — and brings enquiries from the clients you want.',
        hu: 'Az ügyfél a munkák alapján választ építészt. Egy szerkesztőségi portfólió nagy, gyors képekkel és minden projekt történetével megmutatja a szemléletedet — és azoktól az ügyfelektől hoz megkeresést, akiket szeretnél.',
      },
      short: { en: 'Editorial portfolios that bring clients', hu: 'Ügyfelet hozó szerkesztőségi portfólió' },
    },
    problems: [
      { t: { en: 'A template that fights the work', hu: 'Sablon, ami elnyomja a munkát' }, d: { en: 'Busy layouts and small images undersell carefully designed spaces.', hu: 'A zsúfolt elrendezés és a kis képek alulértékelik a gondosan tervezett tereket.' } },
      { t: { en: 'Slow, heavy galleries', hu: 'Lassú, nehéz galériák' }, d: { en: 'Huge photos that load for seconds lose visitors before the best shot.', hu: 'A másodpercekig töltődő óriásfotók a legjobb kép előtt elveszítik a látogatót.' } },
      { t: { en: 'Projects without a story', hu: 'Projektek történet nélkül' }, d: { en: 'Pictures alone do not explain the brief, the constraints and your solution.', hu: 'A képek önmagukban nem mondják el a feladatot, a korlátokat és a megoldást.' } },
      { t: { en: 'Hard to update', hu: 'Nehezen frissíthető' }, d: { en: 'New projects wait months because adding them is a chore.', hu: 'Az új projektek hónapokig várnak, mert a feltöltésük nyűg.' } },
    ],
    features: [
      { t: { en: 'Editorial layouts', hu: 'Szerkesztőségi elrendezés' }, d: { en: 'Magazine-like pages with generous white space and typography that frames the work.', hu: 'Magazinszerű oldalak bőséges térrel és a munkát keretező tipográfiával.' } },
      { t: { en: 'Image reveals that perform', hu: 'Gyors, kibomló képek' }, d: { en: 'Large images that unfold as you scroll, optimised in modern formats.', hu: 'Görgetésre kibomló nagy képek, modern formátumban optimalizálva.' } },
      { t: { en: 'Project stories', hu: 'Projekttörténetek' }, d: { en: 'Brief, plans, materials, before-and-after and credits for each project.', hu: 'Feladat, tervek, anyagok, előtte–utána és közreműködők minden projektnél.' } },
      { t: { en: 'Filters and categories', hu: 'Szűrők és kategóriák' }, d: { en: 'Residential, commercial, interiors, competitions — easy to browse.', hu: 'Lakóépület, kereskedelmi, belsőépítészet, pályázat — könnyen böngészhető.' } },
      { t: { en: 'Simple project uploads', hu: 'Egyszerű projektfeltöltés' }, d: { en: 'Add a project with photos and text in minutes; images are resized automatically.', hu: 'Projekt fotókkal és szöveggel percek alatt; a képek automatikusan méreteződnek.' } },
      { t: { en: 'Studio and enquiries', hu: 'Stúdió és ajánlatkérés' }, d: { en: 'Team, approach, press and an enquiry form that asks about the project.', hu: 'Csapat, szemlélet, sajtó és a projektre rákérdező ajánlatkérő űrlap.' } },
    ],
    demoText: {
      en: 'Kővonal Stúdió is a fictional architecture and interiors studio: an editorial portfolio where images unfold with clip-path reveals as you scroll, with calm typography and project stories.',
      hu: 'A Kővonal Stúdió egy kitalált építész- és belsőépítész-stúdió: szerkesztőségi portfólió, ahol a képek görgetésre kibomlanak, nyugodt tipográfiával és projekttörténetekkel.',
    },
    prices: [
      { name: { en: 'Portfolio website', hu: 'Portfólió weboldal' }, range: { en: '€1,100–3,300', hu: '400 ezer–1,2 M Ft' }, text: { en: 'Projects, studio, contact and image optimisation.', hu: 'Projektek, stúdió, elérhetőség és képoptimalizálás.' } },
      { name: { en: 'Editorial portfolio', hu: 'Szerkesztőségi portfólió' }, range: { en: '€2,200–5,000', hu: '800 ezer–1,8 M Ft' }, text: { en: 'Custom editorial design, scroll reveals, project CMS, two languages.', hu: 'Egyedi szerkesztőségi design, kibomló képek, projekt-CMS, két nyelv.' } },
      { name: { en: '3D and interactive extras', hu: '3D és interaktív extrák' }, range: { en: 'from €5,500', hu: '2 M Ft-tól' }, text: { en: 'Interactive 3D models, virtual walkthroughs or material configurators.', hu: 'Interaktív 3D modellek, virtuális bejárás vagy anyagkonfigurátor.' } },
    ],
    faq: [
      { q: { en: 'Will large photos make the site slow?', hu: 'Lelassítják az oldalt a nagy fotók?' }, a: { en: 'No — images are served in modern formats at the right size for each screen and load as they come into view.', hu: 'Nem — a képek modern formátumban, minden képernyőhöz megfelelő méretben érkeznek, és akkor töltődnek, amikor láthatóvá válnak.' } },
      { q: { en: 'Can we add projects ourselves?', hu: 'Mi magunk is feltölthetünk projekteket?' }, a: { en: 'Yes, in a simple admin: upload photos, write the story, choose the category — the layout takes care of the rest.', hu: 'Igen, egy egyszerű adminban: fotók feltöltése, a történet megírása, kategória kiválasztása — a többit az elrendezés intézi.' } },
      { q: { en: 'Can we show 3D models or walkthroughs?', hu: 'Mutathatunk 3D modelleket vagy bejárást?' }, a: { en: 'Yes — models from your design software can be optimised for the browser, like the 3D projects on this site.', hu: 'Igen — a tervezőszoftverből származó modellek optimalizálhatók a böngészőre, mint az oldal 3D projektjei.' } },
      { q: { en: 'Is it good for search too?', hu: 'A keresőknek is jó?' }, a: { en: 'Yes: each project gets its own page with text, image descriptions and structured data, which helps for searches like “interior designer Budapest”.', hu: 'Igen: minden projekt saját oldalt kap szöveggel, képleírással és strukturált adatokkal, ami segít az olyan kereséseknél, mint a „belsőépítész Budapest”.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A portfolio takes about 3–5 weeks; an editorial portfolio 5–8 weeks, depending on the number of projects.', hu: 'Egy portfólió kb. 3–5 hét; egy szerkesztőségi portfólió 5–8 hét, a projektek számától függően.' } },
    ],
    interest: { en: 'Portfolio for an architecture studio (Kővonal style)', hu: 'Portfólió építészstúdiónak (Kővonal stílus)' },
  },
];
