/**
 * Industry pages: a website offer for one kind of business, each paired with the
 * landing page demo that shows it. Kept free of React and Vite imports, because the
 * build's SEO step reads it for the static pages, the sitemap and the FAQ data.
 *
 * Prices are guide ranges in line with the 2026 pricing article — adjust them freely.
 */

import { moreIndustries } from './industries-more.ts';

type L10n = { en: string; hu: string };
interface Item {
  t: L10n;
  d: L10n;
}

export interface Industry {
  slug: string;
  /** short name for menus and link lists */
  nav: L10n;
  /** the demo: a landing page slug (landings.ts) or `case:<id>` for a modernization case */
  demo: string;
  seo: { title: L10n; description: L10n };
  hero: { kicker: L10n; title: { en: string[]; hu: string[] }; lead: L10n; short: L10n };
  problems: Item[];
  features: Item[];
  demoText: L10n;
  prices: Array<{ name: L10n; range: L10n; text: L10n }>;
  faq: Array<{ q: L10n; a: L10n }>;
  /** what the chat assistant notes as the visitor's interest when they start a request */
  interest: L10n;
}

const baseIndustries: Industry[] = [
  {
    slug: 'dentists',
    nav: { en: 'Dentists & clinics', hu: 'Fogorvosok és klinikák' },
    demo: 'porcelia',
    seo: {
      title: { en: 'Websites for dentists and clinics — online booking, prices, trust | softwaredevelopment.hu', hu: 'Weboldal fogorvosoknak és klinikáknak — online foglalás, árak, bizalom | softwaredevelopment.hu' },
      description: {
        en: 'A calm, fast website for dental and aesthetic clinics: clear treatments and prices, before-and-after results, online appointment booking and Google visibility. Guide prices and a live demo.',
        hu: 'Nyugodt, gyors weboldal fogászatoknak és esztétikai klinikáknak: átlátható kezelések és árak, előtte–utána eredmények, online időpontfoglalás és Google-láthatóság. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for dentists & clinics', hu: 'Weboldal fogorvosoknak és klinikáknak' },
      title: { en: ['Websites that', 'fill the', 'appointment book'], hu: ['Weboldal, ami', 'megtölti az', 'előjegyzési naptárt'] },
      lead: {
        en: 'Patients choose a clinic online before they ever call. A clear, calm and fast website with transparent prices and online booking turns those visitors into appointments.',
        hu: 'A páciensek már az első hívás előtt online választanak rendelőt. Egy átlátható, nyugodt és gyors weboldal, nyílt árakkal és online foglalással, ezekből a látogatókból időpontot csinál.',
      },
      short: { en: 'Booking, prices and trust for clinics', hu: 'Foglalás, árak és bizalom rendelőknek' },
    },
    problems: [
      { t: { en: 'Patients cannot see prices', hu: 'A páciens nem látja az árakat' }, d: { en: 'Without at least a price range, people assume the worst and move on to the next clinic.', hu: 'Legalább egy ársáv nélkül a látogató a legrosszabbra gondol, és továbblép a következő rendelőhöz.' } },
      { t: { en: 'Booking means phoning during opening hours', hu: 'Időpontot csak telefonon, rendelési időben lehet kérni' }, d: { en: 'Many patients look for a dentist in the evening — and forget by the next morning.', hu: 'Sokan este keresnek fogorvost — és reggelre elfelejtik felhívni.' } },
      { t: { en: 'The site looks dated on a phone', hu: 'Mobilon elavultnak tűnik az oldal' }, d: { en: 'An old or slow site makes a clinic look old-fashioned, however modern the equipment is.', hu: 'Egy régi vagy lassú oldal maradinak mutatja a rendelőt, bármilyen modern is a felszerelés.' } },
      { t: { en: 'Hard to find on Google Maps and search', hu: 'Nehéz megtalálni a Google-ben és a térképen' }, d: { en: '“Dentist near me” searches go to the clinics whose site and Google profile are in order.', hu: 'A „fogorvos a közelemben” keresések azokhoz a rendelőkhöz jutnak, akiknek az oldala és a Google-profilja rendben van.' } },
    ],
    features: [
      { t: { en: 'Online appointment booking', hu: 'Online időpontfoglalás' }, d: { en: 'Three simple steps — treatment, time, details — or a connection to the booking system you already use.', hu: 'Három egyszerű lépés — kezelés, időpont, adatok —, vagy kapcsolódás a már használt foglalási rendszerhez.' } },
      { t: { en: 'Treatments and transparent prices', hu: 'Kezelések és átlátható árak' }, d: { en: 'Clear treatment pages with price ranges, and an optional calculator with monthly instalments.', hu: 'Érthető kezelésoldalak ársávokkal, igény szerint havi részletet is számoló kalkulátorral.' } },
      { t: { en: 'Before-and-after results', hu: 'Előtte–utána eredmények' }, d: { en: 'An honest comparison slider and real cases — with the patient’s consent.', hu: 'Visszafogott összehasonlító csúszka és valódi esetek — a páciens hozzájárulásával.' } },
      { t: { en: 'Team and trust', hu: 'Csapat és bizalom' }, d: { en: 'Doctors, qualifications, reviews and the clinic itself, so patients know who to expect.', hu: 'Orvosok, végzettségek, értékelések és maga a rendelő, hogy a páciens tudja, kire számíthat.' } },
      { t: { en: 'Local SEO and Google profile', hu: 'Helyi SEO és Google-profil' }, d: { en: 'Structured data for dentists, a tidy Google Business Profile and pages for each treatment.', hu: 'Fogászati strukturált adatok, rendezett Google Cégprofil és külön oldal minden kezeléshez.' } },
      { t: { en: 'Fast, accessible, GDPR-aware', hu: 'Gyors, akadálymentes, GDPR-tudatos' }, d: { en: 'Loads quickly on a phone, readable for everyone, with health data handled carefully.', hu: 'Mobilon is gyorsan tölt, mindenki számára olvasható, és az egészségügyi adatokat körültekintően kezeli.' } },
    ],
    demoText: {
      en: 'Porcelia Klinika is a fictional aesthetic dental clinic: light, porcelain-like surfaces, a before-and-after slider, a cost estimator with monthly instalments and a three-step booking flow.',
      hu: 'A Porcelia Klinika egy kitalált esztétikai fogászat: világos, porcelánszerű felületek, előtte–utána csúszka, havi részletet is számoló árkalkulátor és háromlépéses időpontfoglalás.',
    },
    prices: [
      { name: { en: 'Clinic website', hu: 'Rendelői weboldal' }, range: { en: '€800–2,500', hu: '300–900 ezer Ft' }, text: { en: 'Treatments, team, prices, contact and Google basics.', hu: 'Kezelések, csapat, árak, elérhetőség és Google-alapok.' } },
      { name: { en: 'With booking & calculator', hu: 'Foglalással és kalkulátorral' }, range: { en: '€1,600–4,000', hu: '600 ezer–1,5 M Ft' }, text: { en: 'Online booking, price calculator, before-and-after, reviews.', hu: 'Online foglalás, árkalkulátor, előtte–utána, értékelések.' } },
      { name: { en: 'Patient portal / integrations', hu: 'Páciensportál / integrációk' }, range: { en: 'from €4,000', hu: '1,5 M Ft-tól' }, text: { en: 'Connection to practice software, reminders, patient accounts.', hu: 'Kapcsolat a rendelői szoftverrel, emlékeztetők, páciensfiókok.' } },
    ],
    faq: [
      { q: { en: 'Can the site connect to our existing booking system?', hu: 'Össze lehet kötni a meglévő foglalási rendszerünkkel?' }, a: { en: 'Usually yes — most booking and practice systems offer an embed or an API. If not, a simple booking flow that emails the reception works well too.', hu: 'Általában igen — a legtöbb foglalási és rendelői rendszer kínál beágyazást vagy API-t. Ha nem, egy egyszerű, a recepciónak e-mailt küldő foglalás is jól működik.' } },
      { q: { en: 'Should we show prices on the website?', hu: 'Érdemes kiírni az árakat?' }, a: { en: 'At least price ranges, yes. Patients compare clinics online, and a clear range builds more trust than “ask for a quote”.', hu: 'Legalább ársávokat igen. A páciensek online hasonlítják össze a rendelőket, és egy világos ársáv több bizalmat ad, mint az „érdeklődjön”.' } },
      { q: { en: 'Can we update treatments and prices ourselves?', hu: 'Mi magunk is frissíthetjük a kezeléseket és az árakat?' }, a: { en: 'Yes. Texts, prices, team members and photos can be edited in a simple admin, without touching code.', hu: 'Igen. A szövegek, árak, csapattagok és fotók egyszerű adminfelületen, kód nélkül szerkeszthetők.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A clinic website takes about 3–6 weeks, depending on content and whether booking is connected to another system.', hu: 'Egy rendelői weboldal kb. 3–6 hét, a tartalomtól és attól függően, hogy a foglalás másik rendszerhez kapcsolódik-e.' } },
      { q: { en: 'What about patient data and GDPR?', hu: 'Mi a helyzet a páciensadatokkal és a GDPR-ral?' }, a: { en: 'Booking forms collect only what is needed, data is transferred securely and not stored on the website longer than necessary; the privacy notice is part of the project.', hu: 'A foglalási űrlap csak a szükséges adatokat kéri, az adatok biztonságosan utaznak, és a weboldal nem tárolja őket a szükségesnél tovább; az adatkezelési tájékoztató a projekt része.' } },
    ],
    interest: { en: 'Website for a dental clinic (Porcelia style)', hu: 'Weboldal fogászatnak (Porcelia stílus)' },
  },
  {
    slug: 'hotels',
    nav: { en: 'Hotels & guesthouses', hu: 'Szállodák és panziók' },
    demo: 'vizszel',
    seo: {
      title: { en: 'Websites for hotels and guesthouses — direct bookings without commission | softwaredevelopment.hu', hu: 'Weboldal szállodáknak és panzióknak — közvetlen foglalás jutalék nélkül | softwaredevelopment.hu' },
      description: {
        en: 'A beautiful, fast website for hotels, guesthouses and holiday homes that brings direct bookings: rooms, offers, multilingual content, a booking engine and Google visibility. Guide prices and a live demo.',
        hu: 'Gyönyörű, gyors weboldal szállodáknak, panzióknak és apartmanoknak, ami közvetlen foglalásokat hoz: szobák, ajánlatok, többnyelvű tartalom, foglalómotor és Google-láthatóság. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for hotels & guesthouses', hu: 'Weboldal szállodáknak és panzióknak' },
      title: { en: ['More direct', 'bookings,', 'less commission'], hu: ['Több közvetlen', 'foglalás,', 'kevesebb jutalék'] },
      lead: {
        en: 'Guests find you on Booking.com — then look you up on Google. If your own site is beautiful, fast and lets them book in a few taps, many of them book with you directly.',
        hu: 'A vendégek a Bookingon találnak rád — aztán rákeresnek a Google-ben. Ha a saját oldalad szép, gyors, és pár érintéssel lehet foglalni rajta, sokan közvetlenül nálad foglalnak.',
      },
      short: { en: 'Direct bookings for hotels and holiday homes', hu: 'Közvetlen foglalás szállásadóknak' },
    },
    problems: [
      { t: { en: 'Platforms take 15–20% of every booking', hu: 'A platformok minden foglalásból 15–20%-ot visznek' }, d: { en: 'Even a small share of direct bookings pays for a good website within a season.', hu: 'Már a foglalások kis részének közvetlenné tétele egy szezon alatt kifizeti a jó weboldalt.' } },
      { t: { en: 'Photos that do not do the place justice', hu: 'A fotók nem adják vissza a hely hangulatát' }, d: { en: 'Small galleries and slow pages hide what makes your place special.', hu: 'A kis galériák és a lassú oldalak elrejtik, mitől különleges a szállás.' } },
      { t: { en: 'No booking on your own site', hu: 'Saját oldalon nem lehet foglalni' }, d: { en: 'An email form instead of live availability sends guests back to the platforms.', hu: 'Az élő elérhetőség helyetti e-mail-űrlap visszaküldi a vendégeket a platformokra.' } },
      { t: { en: 'Only in one language', hu: 'Csak egy nyelven érhető el' }, d: { en: 'Foreign guests leave a site they cannot read — and book elsewhere.', hu: 'A külföldi vendég elhagyja az oldalt, amit nem ért — és máshol foglal.' } },
    ],
    features: [
      { t: { en: 'Booking bar and live availability', hu: 'Foglalósáv és élő elérhetőség' }, d: { en: 'Dates and guests always within reach, connected to your booking engine or channel manager.', hu: 'Dátum és létszám mindig kéznél, a foglalómotorodhoz vagy channel managereddel összekötve.' } },
      { t: { en: 'Rooms, offers and packages', hu: 'Szobák, ajánlatok és csomagok' }, d: { en: 'Room pages with big photos, seasonal offers and packages that are easy to update.', hu: 'Szobaoldalak nagy fotókkal, szezonális ajánlatok és könnyen frissíthető csomagok.' } },
      { t: { en: 'Multilingual by design', hu: 'Alapból többnyelvű' }, d: { en: 'Hungarian, English, German or more — each language with its own address for Google.', hu: 'Magyar, angol, német vagy több nyelv — mindegyik saját címmel a Google-nek.' } },
      { t: { en: 'The place, told well', hu: 'A hely jól elmesélve' }, d: { en: 'Surroundings, spa, restaurant and programmes — the reasons to choose you over a lookalike.', hu: 'Környék, wellness, étterem és programok — az okok, amiért téged választanak egy hasonló helyett.' } },
      { t: { en: 'Fast on a phone', hu: 'Mobilon is gyors' }, d: { en: 'Optimised images and a modern build, so the site feels quick even on holiday Wi-Fi.', hu: 'Optimalizált képek és modern felépítés, hogy az oldal nyaralós wifin is gyors legyen.' } },
      { t: { en: 'Google, Maps and reviews', hu: 'Google, térkép és értékelések' }, d: { en: 'Hotel structured data, a tidy Google profile and your best reviews on the page.', hu: 'Szállás típusú strukturált adatok, rendezett Google-profil és a legjobb értékelések az oldalon.' } },
    ],
    demoText: {
      en: 'Vízszél Villa is a fictional boutique hotel and spa on Lake Balaton: golden-hour lakeside calm, and a live booking bar that is always within reach.',
      hu: 'A Vízszél Villa egy kitalált balatoni butikhotel és spa: aranyórás tóparti nyugalom és mindig kéznél lévő, élő foglalósáv.',
    },
    prices: [
      { name: { en: 'Guesthouse website', hu: 'Szállás weboldal' }, range: { en: '€1,100–3,300', hu: '400 ezer–1,2 M Ft' }, text: { en: 'Rooms, gallery, surroundings, enquiry form, two languages.', hu: 'Szobák, galéria, környék, ajánlatkérő űrlap, két nyelv.' } },
      { name: { en: 'Direct booking site', hu: 'Közvetlen foglalású oldal' }, range: { en: '€2,200–5,500', hu: '800 ezer–2 M Ft' }, text: { en: 'Booking engine connected, offers, multilingual, reviews.', hu: 'Foglalómotor bekötve, ajánlatok, többnyelvűség, értékelések.' } },
      { name: { en: 'Custom booking & payments', hu: 'Egyedi foglalás és fizetés' }, range: { en: 'from €5,500', hu: '2 M Ft-tól' }, text: { en: 'Own booking flow, online payment, channel manager integration.', hu: 'Saját foglalási folyamat, online fizetés, channel manager integráció.' } },
    ],
    faq: [
      { q: { en: 'Can it work with our booking engine or channel manager?', hu: 'Működik a meglévő foglalómotorunkkal vagy channel managerünkkel?' }, a: { en: 'Yes, most booking engines and channel managers can be embedded or connected, so availability stays in sync with the platforms.', hu: 'Igen, a legtöbb foglalómotor és channel manager beágyazható vagy összeköthető, így az elérhetőség szinkronban marad a platformokkal.' } },
      { q: { en: 'Will direct bookings really increase?', hu: 'Tényleg nő a közvetlen foglalások száma?' }, a: { en: 'Guests who already know you often check your own site before booking. A fast site with a clear booking option, and maybe a small direct-booking perk, converts a good share of them.', hu: 'A már téged ismerő vendégek gyakran megnézik a saját oldaladat foglalás előtt. Egy gyors oldal világos foglalási lehetőséggel — és esetleg egy kis közvetlen foglalási kedvezménnyel — jó részüket megtartja.' } },
      { q: { en: 'How many languages can the site have?', hu: 'Hány nyelvű lehet az oldal?' }, a: { en: 'As many as you need. Each language gets its own address, so guests find the right version on Google.', hu: 'Ahány nyelv kell. Minden nyelv saját címet kap, így a vendégek a Google-ben a megfelelő változatot találják.' } },
      { q: { en: 'Can we change prices and offers ourselves?', hu: 'Az árakat és az ajánlatokat mi magunk is módosíthatjuk?' }, a: { en: 'Yes — offers, packages, photos and texts are edited in a simple admin; prices and availability come from your booking system.', hu: 'Igen — az ajánlatok, csomagok, fotók és szövegek egyszerű adminfelületen szerkeszthetők; az árak és az elérhetőség a foglalási rendszeredből jönnek.' } },
      { q: { en: 'When should we start before the season?', hu: 'Mikor érdemes elkezdeni a szezon előtt?' }, a: { en: 'Ideally 2–3 months ahead: a direct booking site takes about 4–8 weeks, and Google needs a few weeks to pick up the new pages.', hu: 'Ideális esetben 2–3 hónappal előtte: egy közvetlen foglalású oldal kb. 4–8 hét, és a Google-nek is kell néhány hét az új oldalak felfedezéséhez.' } },
    ],
    interest: { en: 'Website for a hotel / guesthouse (Vízszél Villa style)', hu: 'Weboldal szállásnak (Vízszél Villa stílus)' },
  },
  {
    slug: 'restaurants',
    nav: { en: 'Restaurants & cafés', hu: 'Éttermek és kávézók' },
    demo: 'zsarat',
    seo: {
      title: { en: 'Websites for restaurants and cafés — menu, table booking, Google | softwaredevelopment.hu', hu: 'Weboldal éttermeknek és kávézóknak — étlap, asztalfoglalás, Google | softwaredevelopment.hu' },
      description: {
        en: 'A website that makes people hungry and gets tables booked: a menu that is easy to read and update, online reservations, events, opening hours and Google Maps visibility. Guide prices and a live demo.',
        hu: 'Weboldal, amitől megéheznek a vendégek, és lefoglalják az asztalt: könnyen olvasható és frissíthető étlap, online asztalfoglalás, események, nyitvatartás és Google-térképes láthatóság. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for restaurants & cafés', hu: 'Weboldal éttermeknek és kávézóknak' },
      title: { en: ['From hungry', 'to booked', 'in one minute'], hu: ['Az éhes látogatóból', 'egy perc alatt', 'foglalás'] },
      lead: {
        en: 'People decide where to eat on their phone, often minutes before they leave. A fast site with the menu, today’s opening hours and a booking button wins those minutes.',
        hu: 'Az emberek a telefonjukon döntik el, hol esznek — gyakran percekkel indulás előtt. Egy gyors oldal az étlappal, a mai nyitvatartással és egy foglalás gombbal megnyeri ezeket a perceket.',
      },
      short: { en: 'Menus, reservations and events', hu: 'Étlap, asztalfoglalás és események' },
    },
    problems: [
      { t: { en: 'The menu is a PDF or a photo', hu: 'Az étlap PDF vagy fotó' }, d: { en: 'Hard to read on a phone, invisible to Google and always out of date.', hu: 'Mobilon nehezen olvasható, a Google nem látja, és mindig elavult.' } },
      { t: { en: 'Booking only by phone', hu: 'Foglalni csak telefonon lehet' }, d: { en: 'Calls come at the busiest moments — or not at all, when the line is engaged.', hu: 'A hívások a legforgalmasabb pillanatban jönnek — vagy egyáltalán nem, ha foglalt a vonal.' } },
      { t: { en: 'Opening hours people do not trust', hu: 'Nyitvatartás, amiben nem bíznak' }, d: { en: 'Different hours on the site, on Google and on Facebook make guests go somewhere safer.', hu: 'Ha az oldalon, a Google-ben és a Facebookon más a nyitvatartás, a vendég inkább máshová megy.' } },
      { t: { en: 'Events and offers get lost', hu: 'Az események és ajánlatok elvesznek' }, d: { en: 'Wine dinners, menus of the day and catering offers deserve more than a Facebook post.', hu: 'A borvacsorák, napi menük és catering-ajánlatok többet érdemelnek egy Facebook-posztnál.' } },
    ],
    features: [
      { t: { en: 'A menu that sells', hu: 'Étlap, ami elad' }, d: { en: 'Readable on a phone, with photos, allergens and prices — updated in a minute from your phone.', hu: 'Mobilon is olvasható, fotókkal, allergénekkel és árakkal — egy perc alatt frissíthető a telefonodról.' } },
      { t: { en: 'Online table booking', hu: 'Online asztalfoglalás' }, d: { en: 'Date, time and party size, connected to your reservation system or sent straight to you.', hu: 'Dátum, időpont és létszám, a foglalási rendszeredhez kötve vagy közvetlenül neked elküldve.' } },
      { t: { en: '“Open now” that is always right', hu: 'Mindig pontos „most nyitva”' }, d: { en: 'Opening hours, holidays and special days in one place, calculated live.', hu: 'Nyitvatartás, ünnepnapok és különleges napok egy helyen, élőben számolva.' } },
      { t: { en: 'Events, menus of the day, catering', hu: 'Események, napi menü, catering' }, d: { en: 'Pages that are easy to update and easy to share.', hu: 'Könnyen frissíthető és könnyen megosztható oldalak.' } },
      { t: { en: 'Takeaway and ordering', hu: 'Elvitel és rendelés' }, d: { en: 'Optional online ordering for pickup or delivery, without platform commission.', hu: 'Igény szerint online rendelés elvitelre vagy kiszállításra, platformjutalék nélkül.' } },
      { t: { en: 'Found on Google Maps', hu: 'Megtalálható a Google Térképen' }, d: { en: 'Restaurant structured data, a tidy Google profile and reviews that match the site.', hu: 'Éttermi strukturált adatok, rendezett Google-profil és az oldallal összhangban lévő értékelések.' } },
    ],
    demoText: {
      en: 'Zsarát is a fictional fine-dining restaurant where every course is cooked over fire: a code-drawn plate that changes course by course as you scroll, wine pairings and a reservation module with the total.',
      hu: 'A Zsarát egy kitalált fine dining étterem, ahol minden fogás tűzön készül: görgetés közben fogásról fogásra változó, kódból rajzolt tányér, borpárosítás és foglalási modul a végösszeggel.',
    },
    prices: [
      { name: { en: 'Menu & contact site', hu: 'Étlap és elérhetőség oldal' }, range: { en: '€700–1,900', hu: '250–700 ezer Ft' }, text: { en: 'Menu, opening hours, gallery, map and Google basics.', hu: 'Étlap, nyitvatartás, galéria, térkép és Google-alapok.' } },
      { name: { en: 'With table booking & events', hu: 'Asztalfoglalással és eseményekkel' }, range: { en: '€1,400–3,300', hu: '500 ezer–1,2 M Ft' }, text: { en: 'Online reservations, events, menus of the day, two languages.', hu: 'Online foglalás, események, napi menü, két nyelv.' } },
      { name: { en: 'Online ordering', hu: 'Online rendelés' }, range: { en: 'from €2,500', hu: '900 ezer Ft-tól' }, text: { en: 'Pickup or delivery ordering with online payment.', hu: 'Rendelés elvitelre vagy kiszállításra, online fizetéssel.' } },
    ],
    faq: [
      { q: { en: 'Can we update the menu ourselves?', hu: 'Az étlapot mi magunk is frissíthetjük?' }, a: { en: 'Yes — dishes, prices, photos and the menu of the day can be changed from a phone in a minute.', hu: 'Igen — az ételek, árak, fotók és a napi menü egy perc alatt módosíthatók akár telefonról is.' } },
      { q: { en: 'Does it work with our reservation system?', hu: 'Működik a meglévő foglalási rendszerünkkel?' }, a: { en: 'Most reservation systems can be embedded. If you do not use one, bookings can arrive by email or in a simple dashboard.', hu: 'A legtöbb foglalási rendszer beágyazható. Ha nem használtok ilyet, a foglalások e-mailben vagy egy egyszerű felületen érkezhetnek.' } },
      { q: { en: 'Can guests order online without the delivery platforms?', hu: 'Rendelhetnek a vendégek online a kiszállító platformok nélkül?' }, a: { en: 'Yes, an own ordering page for pickup or delivery avoids platform commission; it can sit next to the platforms you already use.', hu: 'Igen, egy saját rendelőoldal elvitelre vagy kiszállításra kiváltja a platformjutalékot; a már használt platformok mellett is működhet.' } },
      { q: { en: 'How quickly can it be live?', hu: 'Milyen gyorsan lehet élesben?' }, a: { en: 'A menu and contact site takes about 1–3 weeks; with booking and events about 3–5 weeks.', hu: 'Egy étlap- és elérhetőségoldal kb. 1–3 hét; foglalással és eseményekkel kb. 3–5 hét.' } },
      { q: { en: 'Will we show up on Google Maps?', hu: 'Megjelenünk a Google Térképen?' }, a: { en: 'The map listing comes from your Google Business Profile; the website supports it with matching details, structured data and a link to reviews — setting that up is part of the project.', hu: 'A térképes megjelenés a Google Cégprofilból jön; a weboldal egyező adatokkal, strukturált adatokkal és az értékelésekre mutató linkkel támogatja — ennek beállítása a projekt része.' } },
    ],
    interest: { en: 'Website for a restaurant / café (Zsarát style)', hu: 'Weboldal étteremnek (Zsarát stílus)' },
  },
  {
    slug: 'wineries',
    nav: { en: 'Wineries', hu: 'Borászatok' },
    demo: 'napkorso',
    seo: {
      title: { en: 'Websites for wineries — wine shop, tastings, story | softwaredevelopment.hu', hu: 'Weboldal borászatoknak — webshop, borkóstoló, történet | softwaredevelopment.hu' },
      description: {
        en: 'A website for wineries that tells your story and sells: wines with tasting notes, an online wine shop with age check and shipping, tasting and visit bookings, multilingual content. Guide prices and a live demo.',
        hu: 'Weboldal borászatoknak, ami elmeséli a történetet és el is ad: borok kóstolási jegyzetekkel, webshop korhatár-ellenőrzéssel és szállítással, borkóstoló- és látogatásfoglalás, többnyelvű tartalom. Irányárak és élő demó.',
      },
    },
    hero: {
      kicker: { en: 'Websites for wineries', hu: 'Weboldal borászatoknak' },
      title: { en: ['Your wines,', 'your story,', 'sold online'], hu: ['A borod,', 'a történeted,', 'online eladva'] },
      lead: {
        en: 'Visitors fall in love with a winery at the cellar door — and want to order again at home. A website that carries the atmosphere and sells the wines keeps them coming back.',
        hu: 'A látogatók a pincében szeretnek bele egy borászatba — és otthon újra rendelnének. Egy weboldal, ami átadja a hangulatot és el is adja a borokat, visszahozza őket.',
      },
      short: { en: 'Wine shop, tastings and story', hu: 'Webshop, borkóstoló és történet' },
    },
    problems: [
      { t: { en: 'Guests cannot reorder after a visit', hu: 'Látogatás után nem tudnak újrarendelni' }, d: { en: 'Without an online shop, the bottle they loved becomes a phone call they never make.', hu: 'Webshop nélkül a megszeretett palackból egy telefonhívás lesz, amit sosem ejtenek meg.' } },
      { t: { en: 'Wine lists without the story', hu: 'Borlista történet nélkül' }, d: { en: 'Names and prices alone do not show the vineyard, the vintage or the people behind it.', hu: 'A nevek és árak önmagukban nem mutatják meg a dűlőt, az évjáratot és a mögötte álló embereket.' } },
      { t: { en: 'Tastings booked by email chains', hu: 'Kóstolófoglalás e-mail-láncokban' }, d: { en: 'Back-and-forth messages cost time in the busiest season.', hu: 'Az oda-vissza üzenetek a legforgalmasabb szezonban viszik el az időt.' } },
      { t: { en: 'Only in Hungarian', hu: 'Csak magyarul' }, d: { en: 'Wine tourists and foreign buyers need at least English — and often German.', hu: 'A bor­turistáknak és a külföldi vevőknek legalább angol — és gyakran német — tartalom kell.' } },
    ],
    features: [
      { t: { en: 'Wine shop', hu: 'Bor webshop' }, d: { en: 'Wines with tasting notes and pairings, age check, shipping rules and online payment.', hu: 'Borok kóstolási jegyzetekkel és párosítással, korhatár-ellenőrzés, szállítási szabályok és online fizetés.' } },
      { t: { en: 'Tasting and visit booking', hu: 'Kóstoló- és látogatásfoglalás' }, d: { en: 'Pick a programme, date and group size — confirmed without email chains.', hu: 'Program, dátum és létszám kiválasztása — visszaigazolás e-mail-láncok nélkül.' } },
      { t: { en: 'The vineyard, told well', hu: 'A dűlő jól elmesélve' }, d: { en: 'Terroir, vintages, the family and the cellar — the story that makes a bottle worth its price.', hu: 'Terroir, évjáratok, a család és a pince — a történet, amitől egy palack megéri az árát.' } },
      { t: { en: 'Wine club and subscriptions', hu: 'Borklub és előfizetés' }, d: { en: 'Optional quarterly boxes and member prices for loyal customers.', hu: 'Igény szerint negyedéves borcsomagok és tagi árak a hűséges vásárlóknak.' } },
      { t: { en: 'Multilingual for wine tourism', hu: 'Többnyelvű a bor­turizmushoz' }, d: { en: 'Hungarian, English and German, each with its own address for Google.', hu: 'Magyar, angol és német, mindegyik saját címmel a Google-nek.' } },
      { t: { en: 'B2B and press corner', hu: 'B2B és sajtósarok' }, d: { en: 'Price lists for restaurants and shops, awards, photos and technical sheets to download.', hu: 'Árlisták éttermeknek és boltoknak, díjak, fotók és letölthető technikai lapok.' } },
    ],
    demoText: {
      en: 'Napkorsó Birtok is a fictional Tokaj winery: a golden pour, a vintage timeline and a wine finder.',
      hu: 'A Napkorsó Birtok egy kitalált tokaji borászat: aranyló töltés, évjárat-idővonal és borválasztó.',
    },
    prices: [
      { name: { en: 'Winery website', hu: 'Borászati weboldal' }, range: { en: '€1,100–2,700', hu: '400 ezer–1 M Ft' }, text: { en: 'Story, wines, visits, gallery and contact, two languages.', hu: 'Történet, borok, látogatás, galéria és elérhetőség, két nyelv.' } },
      { name: { en: 'With wine shop & tastings', hu: 'Webshoppal és kóstolófoglalással' }, range: { en: '€2,200–5,500', hu: '800 ezer–2 M Ft' }, text: { en: 'Online shop with age check and shipping, tasting bookings.', hu: 'Webshop korhatár-ellenőrzéssel és szállítással, kóstolófoglalás.' } },
      { name: { en: 'Wine club / B2B portal', hu: 'Borklub / B2B portál' }, range: { en: 'from €5,500', hu: '2 M Ft-tól' }, text: { en: 'Subscriptions, member prices, trade price lists and ordering.', hu: 'Előfizetés, tagi árak, viszonteladói árlisták és rendelés.' } },
    ],
    faq: [
      { q: { en: 'Can we sell wine online legally?', hu: 'Lehet legálisan bort árulni online?' }, a: { en: 'Yes, with an age check, the right shipping partner and the required product information. The shop is built to handle these from the start; excise and licensing questions are for your accountant.', hu: 'Igen, korhatár-ellenőrzéssel, megfelelő szállítópartnerrel és a kötelező termékinformációkkal. A webshop ezeket az elejétől kezeli; a jövedéki és engedélyezési kérdésekben a könyvelőd a mérvadó.' } },
      { q: { en: 'Which shop system do you use?', hu: 'Milyen webshoprendszerrel dolgozol?' }, a: { en: 'WooCommerce or Shopify for most wineries, or a custom shop when you need special flows like subscriptions or trade pricing.', hu: 'A legtöbb borászatnak WooCommerce vagy Shopify, egyedi webshop pedig akkor, ha különleges folyamat kell, például előfizetés vagy viszonteladói ár.' } },
      { q: { en: 'Can we manage wines and vintages ourselves?', hu: 'A borokat és évjáratokat mi magunk kezelhetjük?' }, a: { en: 'Yes — new vintages, tasting notes, prices and stock are edited in the admin.', hu: 'Igen — az új évjáratok, kóstolási jegyzetek, árak és a készlet az adminfelületen szerkeszthetők.' } },
      { q: { en: 'How do tasting bookings work?', hu: 'Hogyan működik a kóstolófoglalás?' }, a: { en: 'Visitors pick a programme, date and group size; you get the booking by email or in a calendar, and they get an automatic confirmation.', hu: 'A látogató kiválasztja a programot, a dátumot és a létszámot; te e-mailben vagy naptárban kapod meg, ő pedig automatikus visszaigazolást.' } },
      { q: { en: 'How long does it take?', hu: 'Mennyi idő alatt készül el?' }, a: { en: 'A winery website takes about 3–5 weeks; with a wine shop and bookings about 6–10 weeks.', hu: 'Egy borászati weboldal kb. 3–5 hét; webshoppal és foglalással kb. 6–10 hét.' } },
    ],
    interest: { en: 'Website for a winery (Napkorsó style)', hu: 'Weboldal borászatnak (Napkorsó stílus)' },
  },
];

export const industries: Industry[] = [...baseIndustries, ...moreIndustries];

/** the short list for the footer, the home page and the website check */
const FEATURED = ['dentists', 'restaurants', 'hotels', 'webshops', 'law-firms', 'ai-startups'];
export const featuredIndustries = FEATURED.map((slug) => industries.find((i) => i.slug === slug)).filter((i): i is Industry => !!i);

export const industryBySlug = (slug: string | undefined) => industries.find((i) => i.slug === slug);

/** the index page */
export const INDUSTRIES_SEO = {
  title: { en: 'Websites by industry — clinics, hotels, restaurants, shops, law firms, startups | softwaredevelopment.hu', hu: 'Weboldal iparáganként — rendelők, szállások, éttermek, webshopok, ügyvédek, startupok | softwaredevelopment.hu' },
  description: {
    en: 'Website offers built around how each kind of business wins customers: online booking for clinics, direct bookings for hotels, reservations for restaurants, shops for wineries and makers, trust for law firms, launch pages for products and AI startups.',
    hu: 'Weboldal-ajánlatok aszerint, hogyan szerez ügyfelet az adott vállalkozás: online foglalás rendelőknek, közvetlen foglalás szállásoknak, asztalfoglalás éttermeknek, webshop borászatoknak és kézműveseknek, bizalom ügyvédi irodáknak, bemutatkozó oldal termékeknek és AI-startupoknak.',
  },
};
