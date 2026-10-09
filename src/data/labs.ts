import type { L10n } from './projects';

/**
 * Interactive projects that live on this site (as opposed to the client case studies).
 * Each one is listed in the home-page section and in the "Projects" menu.
 */
export interface Lab {
  id: string;
  num: string;
  /** a few letters for the badge */
  short: string;
  /** site path without the language prefix */
  path: string;
  title: L10n;
  desc: L10n;
  /** call to action on the card */
  cta: L10n;
  /** one short line under the title in the site header */
  tagline: L10n;
  tags: string[];
}

export const labs: Lab[] = [
  {
    id: 'landing',
    tagline: { en: 'Ten premium landing pages, each shown full screen', hu: 'Tíz prémium landing oldal, teljes képernyőn', sk: 'Desať prémiových landing pages, každá na celú obrazovku' },
    num: '01',
    short: 'LP',
    path: '/landing-pages/',
    title: { en: 'Landing pages', hu: 'Bemutató oldalak', sk: 'Landing pages' },
    desc: {
      en: 'Visitors make a decision within seconds about whether a business feels worth their attention. These ten landing pages showcase how I approach modern web design: distinctive visual direction, smooth animations, and interactive features that are not only engaging, but also designed to support real business goals — from bookings and price calculators to product configurators.\n\nEach concept opens as a full-screen, standalone website. Explore the one that feels closest to your business and imagine what the same approach could look like for your own brand.',
      hu: 'A látogatók néhány másodperc alatt eldöntik, hogy egy vállalkozás felkelti-e az érdeklődésüket. Ez a tíz landing oldal azt mutatja meg, hogyan gondolkodom a modern webdesignról: karakteres vizuális világ, letisztult animációk és olyan interaktív funkciók, amelyek nemcsak látványosak, hanem valódi üzleti célokat is szolgálnak — legyen szó foglalásról, árkalkulátorról vagy konfigurátorról.\n\nMindegyik oldal teljes képernyős, önálló weboldalként nyílik meg. Nézd meg azt, amelyik a legközelebb áll a vállalkozásodhoz, és képzeld el, hogyan működhetne ugyanez a saját márkáddal.',
      sk: 'Návštevníci sa v priebehu niekoľkých sekúnd rozhodnú, či im firma stojí za pozornosť. Týchto desať landing pages ukazuje, ako pristupujem k modernému webdizajnu: výrazný vizuálny smer, plynulé animácie a interaktívne prvky, ktoré nie sú len pútavé, ale slúžia aj skutočným obchodným cieľom — od rezervácií a cenových kalkulačiek až po produktové konfigurátory.\n\nKaždý koncept sa otvorí ako samostatný web na celú obrazovku. Pozrite si ten, ktorý má najbližšie k vášmu podnikaniu, a predstavte si, ako by rovnaký prístup mohol vyzerať pre vašu vlastnú značku.',
    },
    cta: { en: 'See the landing pages', hu: 'Nézd meg a bemutató oldalakat', sk: 'Pozrite si landing pages' },
    tags: ['Landing page', 'Conversion', 'Premium design'],
  },
  {
    id: 'modernization',
    tagline: { en: 'Dated small-business sites vs. their redesigns', hu: 'Elavult kisvállalkozói oldalak és újratervezésük', sk: 'Zastarané weby malých firiem a ich redizajn' },
    num: '02',
    short: 'UX',
    path: '/modernization/',
    title: { en: 'Website modernization', hu: 'Weboldal-modernizálás', sk: 'Modernizácia webu' },
    desc: {
      en: 'Dated small-business websites and their redesigns in one frame — a confectionery, a law firm and a webshop. Drag the divider to compare; the new versions are working mockups with menus, forms and a cart.',
      hu: 'Elavult kisvállalkozói weboldalak és újratervezett változataik egy keretben — cukrászda, ügyvédi iroda és webshop. Húzd az elválasztót; az új verziók működő mockupok menükkel, űrlapokkal és kosárral.',
      sk: 'Zastarané weby malých firiem a ich nové verzie v jednom rámčeku — cukráreň, advokátska kancelária a e-shop. Posuňte deliacu čiaru a porovnajte; nové verzie sú funkčné makety s menu, formulármi a košíkom.',
    },
    cta: { en: 'Compare before & after', hu: 'Előtte–utána összehasonlítás', sk: 'Porovnajte pred a po' },
    tags: ['UI / UX', 'Redesign', 'Responsive'],
  },
  {
    id: 'garage',
    tagline: { en: 'Configure a garage in 3D, with a live estimate', hu: 'Garázs 3D-ben, élő árbecsléssel', sk: 'Garáž v 3D s cenovým odhadom v reálnom čase' },
    num: '03',
    short: '3D',
    path: '/garage-designer/',
    title: { en: 'Garage designer', hu: 'Garázstervező', sk: 'Návrhár garáže' },
    desc: {
      en: 'A 3D product configurator: set the size of the garage, then pick the roof, the door, the cladding and the colours. The model rebuilds with every change and the price estimate follows.\n\nIf you want a custom development like this for your own site, ask for a free consultation.',
      hu: '3D termékkonfigurátor: állítsd be a garázs méretét, majd válassz tetőt, kaput, burkolatot és színeket. A modell minden változtatásra újraépül, az árbecslés pedig követi.\n\nHa szeretnél egy ilyen egyedi fejlesztést a saját oldaladra, kérj ingyenes konzultációt.',
      sk: '3D produktový konfigurátor: nastavte rozmery garáže a potom vyberte strechu, bránu, obklad a farby. Model sa pri každej zmene prestavia a cenový odhad sa prispôsobí.\n\nAk chcete podobné riešenie na mieru pre svoj web, požiadajte o bezplatnú konzultáciu.',
    },
    cta: { en: 'Design a garage', hu: 'Tervezz garázst', sk: 'Navrhnite garáž' },
    tags: ['three.js', 'Configurator', 'Price calculator'],
  },
  {
    id: 'shirt',
    tagline: { en: 'Put your text or image on a T-shirt or hoodie, in 3D', hu: 'Saját szöveg vagy kép pólón és pulóveren, 3D-ben', sk: 'Vlastný text alebo obrázok na tričku či mikine, v 3D' },
    num: '04',
    short: 'TEE',
    path: '/shirt-designer/',
    title: { en: '3D T-shirt & hoodie designer', hu: '3D póló- és pulóvertervező', sk: '3D návrhár tričiek a mikín' },
    desc: {
      en: 'Choose a man or a woman model, a T-shirt or a hoodie and a colour, then print your own text or image on the front or the back. The print wraps onto the 3D garment as you type, studio lighting presets show it in different light, and the order price updates with size and quantity.\n\nIf you want a custom development like this for your own site, ask for a free consultation.',
      hu: 'Válassz férfi vagy női modellt, pólót vagy kapucnis pulóvert és színt, majd nyomtass saját szöveget vagy képet az elejére vagy a hátára. A minta gépelés közben rákerül a 3D ruhára, a világítási beállításokkal különböző fényben is megnézheted, a rendelési ár pedig követi a méretet és a mennyiséget.\n\nHa szeretnél egy ilyen egyedi fejlesztést a saját oldaladra, kérj ingyenes konzultációt.',
      sk: 'Vyberte mužský alebo ženský model, tričko alebo mikinu a farbu a potom potlačte prednú či zadnú stranu vlastným textom alebo obrázkom. Potlač sa už počas písania prenesie na 3D odev, predvoľby štúdiového osvetlenia ho ukážu v rôznom svetle a cena objednávky sa mení podľa veľkosti a počtu kusov.\n\nAk chcete podobné riešenie na mieru pre svoj web, požiadajte o bezplatnú konzultáciu.',
    },
    cta: { en: 'Design a T-shirt', hu: 'Tervezz pólót', sk: 'Navrhnite tričko' },
    tags: ['three.js', 'WebGL shader', 'Webshop'],
  },
  {
    id: 'camera',
    tagline: { en: 'A cinematic camera that flies around a 3D statue', hu: 'Filmes kamera, amely egy 3D szobor körül repül', sk: 'Filmová kamera, ktorá lieta okolo 3D sochy' },
    num: '05',
    short: 'CAM',
    path: '/camera-study/',
    title: { en: '3D Model Camera Study', hu: '3D modell kamera\u00ADtanulmány', sk: 'Kamerová štúdia 3D modelu' },
    desc: {
      en: 'Navigation as a camera flight: every menu item is a destination around one Justice statue. The camera glides from her face to the scales, out to a wide shot and down to the sword, with eased flight paths and a soft depth of field, while the text appears where the camera arrives.\n\nIf you want a custom development like this for your own site, ask for a free consultation.',
      hu: 'Navigáció kamerarepülésként: minden menüpont egy úti cél egyetlen Justitia-szobor körül. A kamera az arctól a mérleghez siklik, kitávolodik egy totálra, majd a kardhoz ereszkedik, lágy gyorsulással és mélységélességgel, a szöveg pedig ott jelenik meg, ahová a kamera megérkezik.\n\nHa szeretnél egy ilyen egyedi fejlesztést a saját oldaladra, kérj ingyenes konzultációt.',
      sk: 'Navigácia ako let kamery: každá položka menu je cieľom okolo jedinej sochy Spravodlivosti. Kamera kĺže od jej tváre k váham, vzdiali sa do celku a klesne k meču — s plynulými dráhami letu a jemnou hĺbkou ostrosti, pričom text sa objaví tam, kam kamera dorazí.\n\nAk chcete podobné riešenie na mieru pre svoj web, požiadajte o bezplatnú konzultáciu.',
    },
    cta: { en: 'Take the flight', hu: 'Indulhat a repülés', sk: 'Vydajte sa na let' },
    tags: ['three.js', 'Camera paths', 'Depth of field'],
  },
  {
    id: 'cv',
    tagline: { en: 'Build an ATS-friendly CV and download it as PDF', hu: 'ATS-barát önéletrajz, letölthető PDF-ben', sk: 'Životopis vhodný pre ATS, na stiahnutie v PDF' },
    num: '06',
    short: 'CV',
    path: '/cv-maker/',
    title: { en: 'CV Maker', hu: 'Önéletrajz-készítő', sk: 'Tvorca životopisu' },
    desc: {
      en: 'Build a professional CV step by step with a live preview. 24 modern, creative and classic layouts, reorderable sections, an optional photo and a print-ready PDF — plus a practical guide to writing a CV that gets read.',
      hu: 'Készíts profi önéletrajzot lépésről lépésre, élő előnézettel. 24 modern, kreatív és klasszikus elrendezés, átrendezhető szakaszok, opcionális fotó és nyomtatásra kész PDF — gyakorlati útmutatóval ahhoz, hogy el is olvassák.',
      sk: 'Vytvorte si profesionálny životopis krok za krokom so živým náhľadom. 24 moderných, kreatívnych a klasických rozložení, sekcie s nastaviteľným poradím, voliteľná fotografia a PDF pripravené na tlač — a k tomu praktický návod, ako napísať životopis, ktorý si niekto naozaj prečíta.',
    },
    cta: { en: 'Create your CV', hu: 'Készítsd el az önéletrajzod', sk: 'Vytvorte si životopis' },
    tags: ['React', 'PDF', 'EN / HU'],
  },
  {
    id: 'course',
    tagline: { en: 'From zero to a deployed React + Spring Boot app', hu: 'Nulláról egy élesített React + Spring Boot alkalmazásig', sk: 'Od nuly po nasadenú aplikáciu v React + Spring Boot' },
    num: '07',
    short: 'EDU',
    path: '/course/',
    title: { en: 'Full-stack developer course', hu: 'Full-stack fejlesztő kurzus', sk: 'Kurz full-stack vývojára' },
    desc: {
      en: 'A free, hands-on path from the basics of the web to a deployed React + Spring Boot application — with quizzes, coding exercises that run in your browser, and a progress map.',
      hu: 'Ingyenes, gyakorlatias út a web alapjaitól egy élesített React + Spring Boot alkalmazásig — kvízekkel, böngészőben futó kódolási feladatokkal és haladási térképpel.',
      sk: 'Bezplatná praktická cesta od základov webu až po nasadenú aplikáciu v React + Spring Boot — s kvízmi, programátorskými úlohami, ktoré bežia priamo v prehliadači, a mapou pokroku.',
    },
    cta: { en: 'Start learning', hu: 'Kezdd el a tanulást', sk: 'Začnite sa učiť' },
    tags: ['React', 'Spring Boot', 'EN / HU'],
  },
  {
    id: 'interview',
    tagline: { en: 'Practise technical interviews: 14 tracks, 200 questions each', hu: 'Technikai interjúgyakorlás: 14 téma, témánként 200 kérdés', sk: 'Precvičte si technické pohovory: 14 tém, v každej 200 otázok' },
    num: '08',
    short: 'SIM',
    path: '/interview/',
    title: { en: 'Interview simulator', hu: 'Interjú-szimulátor', sk: 'Simulátor pohovoru' },
    desc: {
      en: 'Technical interview practice that feels like the real thing: read code, predict output, spot bugs and explain trade-offs — then see where you stand by level and topic.',
      hu: 'Technikai interjú gyakorlás, ami úgy zajlik, mint a valóságban: kódolvasás, output kitalálása, hibakeresés és döntések indoklása — a végén pedig szintenként és témakörönként látod, hol tartasz.',
      sk: 'Tréning technického pohovoru, ktorý pôsobí ako skutočný: čítanie kódu, odhad výstupu, hľadanie chýb a zdôvodňovanie kompromisov — a na konci uvidíte, kde sa nachádzate podľa úrovne a témy.',
    },
    cta: { en: 'Start practising', hu: 'Kezdd el a gyakorlást', sk: 'Začnite trénovať' },
    tags: ['React', 'TypeScript', 'EN / HU'],
  },
];

/** the interactive project a (language-stripped) path belongs to, e.g. /course/html-basics/ → course */
export function labFor(path: string): Lab | undefined {
  const p = path.endsWith('/') ? path : `${path}/`;
  return labs.find((lab) => p.startsWith(lab.path));
}
