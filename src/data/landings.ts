/** text in both site languages (same shape as L10n in projects.ts; kept local so the build's SEO script can import this file) */
type L10n = { en: string; hu: string; sk: string };

/**
 * The landing page showcase: premium one-page sites for fictional brands.
 * Each page is its own lazy chunk; the stage shows a branded loading screen while it loads.
 * The full roadmap of the ten pages is in the project plan; `ready` pages are listed and linked.
 * Brand names are invented and were checked against real companies in the same sector (2026-10-06).
 * Metadata only (the build's SEO script reads it); the page code is loaded via `landingLoaders.ts`.
 */
export interface Landing {
  slug: string;
  num: string;
  name: string;
  sector: L10n;
  /** the language the page itself is written in (its market) */
  market: 'hu' | 'en';
  concept: L10n;
  /** loader and gallery cover colours */
  colors: { bg: string; fg: string; accent: string };
  /** CSS font-family for the brand name on covers and the loader */
  display: string;
  /** font descriptors to have loaded before the page is revealed, e.g. '400 1em "Instrument Serif"' */
  fonts?: string[];
  /** hero images to decode before the page is revealed */
  images?: string[];
  /** a screenshot of the hero for covers (public path) */
  poster?: string;
  ready: boolean;
}

export const landings: Landing[] = [
  {
    slug: 'vaulmere',
    num: '01',
    name: 'Vaulmere',
    sector: { en: 'Fintech · private wealth', hu: 'Fintech · vagyonkezelés', sk: 'Fintech · správa majetku' },
    market: 'en',
    concept: {
      en: 'A private wealth app and metal card: dark, quiet luxury, a card that catches the light.',
      hu: 'Privát vagyonkezelő app és fémkártya: sötét, csendes luxus, a kártyán megcsillan a fény.',
      sk: 'Aplikácia na správu súkromného majetku a kovová karta: tmavý, tichý luxus a karta, na ktorej sa zachytáva svetlo.',
    },
    colors: { bg: '#0B0B0C', fg: '#F2ECE2', accent: '#C9A86A' },
    display: '"Instrument Serif", Georgia, serif',
    poster: '/landing/vaulmere/poster.webp',
    fonts: ['400 1em "Instrument Serif"', 'italic 400 1em "Instrument Serif"', '400 1em "Inter Variable"'],
    ready: true,
  },
  {
    slug: 'vizszel',
    poster: '/landing/vizszel/poster.webp',
    num: '02',
    name: 'Vízszél Villa',
    sector: { en: 'Boutique hotel & spa · Balaton', hu: 'Butikhotel és spa · Balaton', sk: 'Butikový hotel a spa · Balaton' },
    market: 'hu',
    concept: { en: 'Golden-hour lakeside calm with a live booking bar.', hu: 'Aranyórás tóparti nyugalom, élő foglalási sávval.', sk: 'Pokoj na brehu jazera v zlatej hodinke so živou rezervačnou lištou.' },
    colors: { bg: '#E9DFCF', fg: '#1F4E5A', accent: '#E07A5F' },
    display: '"Cormorant Garamond Variable", Georgia, serif',
    ready: true,
  },
  {
    slug: 'porcelia',
    poster: '/landing/porcelia/poster.webp',
    num: '03',
    name: 'Porcelia Klinika',
    sector: { en: 'Dental & aesthetics · Budapest', hu: 'Fogászat és esztétika · Budapest', sk: 'Zubná a estetická klinika · Budapešť' },
    market: 'hu',
    concept: { en: 'Porcelain-clean clinic with a smile slider and cost estimator.', hu: 'Porcelántiszta klinika mosolycsúszkával és költségbecslővel.', sk: 'Klinika čistá ako porcelán s posuvníkom úsmevu a odhadom nákladov.' },
    colors: { bg: '#F7F5F2', fg: '#0E3B43', accent: '#9FD3C7' },
    display: '"Fraunces Variable", Georgia, serif',
    ready: true,
  },
  {
    slug: 'revhajlat',
    poster: '/landing/revhajlat/poster.webp',
    num: '04',
    name: 'Révhajlat Rezidencia',
    sector: { en: 'Riverside residences', hu: 'Dunaparti rezidenciák', sk: 'Rezidencie na nábreží Dunaja' },
    market: 'hu',
    concept: { en: 'Pick a floor on the building to see what is available.', hu: 'Válassz emeletet az épületen, és lásd, mi szabad.', sk: 'Vyberte poschodie na budove a pozrite sa, čo je voľné.' },
    colors: { bg: '#1C1D1F', fg: '#E6E4DF', accent: '#B08D57' },
    display: '"Bodoni Moda Variable", Didot, serif',
    ready: true,
  },
  {
    slug: 'echovane',
    num: '05',
    name: 'Echovane',
    sector: { en: 'AI meeting intelligence', hu: 'MI-alapú meetingasszisztens', sk: 'AI asistent na porady' },
    market: 'en',
    concept: { en: 'A product UI that writes the meeting summary in front of you.', hu: 'Termékfelület, ami a szemed előtt írja meg a meeting összefoglalóját.', sk: 'Produktové rozhranie, ktoré pred vašimi očami napíše zhrnutie porady.' },
    colors: { bg: '#07070F', fg: '#EDEBFF', accent: '#8B7CFF' },
    display: '"Bricolage Grotesque Variable", system-ui, sans-serif',
    poster: '/landing/echovane/poster.webp',
    fonts: ['650 1em "Bricolage Grotesque Variable"', '400 1em "Inter Variable"'],
    ready: true,
  },
  {
    slug: 'zsarat',
    poster: '/landing/zsarat/poster.webp',
    num: '06',
    name: 'Zsarát',
    sector: { en: 'Fine dining · tasting menu', hu: 'Fine dining · kóstolómenü', sk: 'Fine dining · degustačné menu' },
    market: 'hu',
    concept: { en: 'The tasting menu told course by course, with an ember glow.', hu: 'A kóstolómenü fogásról fogásra, parázsló fényben.', sk: 'Degustačné menu chod po chode, v žiare pahreby.' },
    colors: { bg: '#141210', fg: '#F3EBDD', accent: '#E2572B' },
    display: '"Playfair Display Variable", Georgia, serif',
    ready: true,
  },
  {
    slug: 'kinvel',
    poster: '/landing/kinvel/poster.webp',
    num: '07',
    name: 'Kinvel One',
    sector: { en: 'Premium e-bike launch', hu: 'Prémium e-bike bevezetés', sk: 'Uvedenie prémiového e-bicykla' },
    market: 'en',
    concept: { en: 'A colour configurator and turntable for a product launch.', hu: 'Színkonfigurátor és körbeforgatható termék egy bevezetéshez.', sk: 'Farebný konfigurátor a otočný pohľad na produkt pri jeho uvedení na trh.' },
    colors: { bg: '#0A0A0A', fg: '#F5F5F5', accent: '#D7FF3A' },
    display: '"Unbounded Variable", system-ui, sans-serif',
    ready: true,
  },
  {
    slug: 'napkorso',
    poster: '/landing/napkorso/poster.webp',
    num: '08',
    name: 'Napkorsó Birtok',
    sector: { en: 'Tokaj winery', hu: 'Tokaji borászat', sk: 'Tokajské vinárstvo' },
    market: 'hu',
    concept: { en: 'A golden pour, a vintage timeline and a wine finder.', hu: 'Aranyló töltés, évjárat-idővonal és borválasztó.', sk: 'Zlatisté nalievanie, časová os ročníkov a sprievodca výberom vína.' },
    colors: { bg: '#5B1A27', fg: '#F4EDE1', accent: '#C99A2E' },
    display: '"Cormorant Garamond Variable", Georgia, serif',
    ready: true,
  },
  {
    slug: 'kovonal',
    poster: '/landing/kovonal/poster.webp',
    num: '09',
    name: 'Kővonal Stúdió',
    sector: { en: 'Architecture & interiors', hu: 'Építészet és belsőépítészet', sk: 'Architektúra a interiéry' },
    market: 'hu',
    concept: { en: 'An editorial portfolio with clip-path image reveals.', hu: 'Szerkesztőségi portfólió, kibomló képekkel.', sk: 'Portfólio v štýle magazínu s postupne odhaľovanými obrázkami.' },
    colors: { bg: '#E8E1D6', fg: '#121212', accent: '#8C8378' },
    display: '"Syne Variable", system-ui, sans-serif',
    ready: true,
  },
  {
    slug: 'velmira',
    poster: '/landing/velmira/poster.webp',
    num: '10',
    name: 'Velmira',
    sector: { en: 'Clean skincare', hu: 'Natúr bőrápolás', sk: 'Prírodná starostlivosť o pleť' },
    market: 'en',
    concept: { en: 'A routine builder with product hotspots and a bag drawer.', hu: 'Rutinépítő termék-hotspotokkal és kosárfiókkal.', sk: 'Zostavovač rutiny s interaktívnymi bodmi na produktoch a vysúvacím košíkom.' },
    colors: { bg: '#F3DCD4', fg: '#3E4A2F', accent: '#3E4A2F' },
    display: '"Instrument Serif", Georgia, serif',
    ready: true,
  },
];

export const readyLandings = landings.filter((l) => l.ready);

export function landingBySlug(slug: string | undefined): Landing | undefined {
  return readyLandings.find((l) => l.slug === slug);
}

/** /landing-pages/<slug>/ (language stripped) is the full-screen stage */
export function isLandingStage(path: string): boolean {
  return /^\/landing-pages\/[^/]+\/?$/.test(path);
}
