/**
 * The free website check: what the worker measures (workers/site-check/worker.js),
 * how it is scored, and every text of the report in both languages.
 * Kept free of React and Vite imports: the build's SEO step reads the page meta from here.
 */

type L10n = { en: string; hu: string; sk: string };
type Lang = 'en' | 'hu' | 'sk';

/* ---------- what the worker returns ---------- */

export interface Facts {
  input: string;
  url: string;
  status: number;
  timeMs: number;
  bytes: number;
  https: boolean;
  httpRedirect: boolean | null;
  headers: { hsts: boolean; csp: boolean; cspMeta?: boolean; xcto: boolean; frame: boolean; referrer: boolean; permissions: boolean; compression: boolean; server: string; poweredBy: string };
  robots: { exists: boolean; sitemapListed: boolean; blocksAll: boolean };
  sitemap: boolean;
  page: {
    title: string;
    description: string | null;
    viewport: string | null;
    lang: string | null;
    h1: number;
    canonical: string | null;
    icon: boolean;
    ogTitle: string | null;
    ogImage: string | null;
    jsonLd: boolean;
    images: number;
    imagesNoAlt: number;
    imagesLazy: number;
    modernImages: boolean;
    scripts: number;
    stylesheets: number;
    words: number;
    generator: string | null;
    wordpress: boolean;
    jquery: string | null;
    copyrightYear: number | null;
    insecureResources: number;
    tel: boolean;
    mail: boolean;
    form: boolean;
    analytics: boolean;
    /** a tracker that sets cookies (GA, Meta pixel, Clarity, Matomo); cookieless tools need no banner */
    trackingCookies?: boolean;
    cookieBanner: boolean;
    flash: boolean;
  };
  error?: string;
}

export interface Speed {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
  lcp: number | null;
  cls: number | null;
  tbt: number | null;
  weight: number | null;
  error?: string;
}

/* ---------- scoring ---------- */

export type Cat = 'security' | 'seo' | 'mobile' | 'speed' | 'care';
export type Status = 'pass' | 'warn' | 'fail';
export const CATS: Cat[] = ['speed', 'seo', 'mobile', 'security', 'care'];

export interface Result {
  id: CheckId;
  cat: Cat;
  status: Status;
  weight: number;
  /** 0–1, for partial credit (PageSpeed) */
  earned: number;
  /** a measured value to show, e.g. "2.4 s" */
  value?: string;
}

export type CheckId =
  | 'reachable'
  | 'https'
  | 'redirect'
  | 'hsts'
  | 'csp'
  | 'nosniff'
  | 'frame'
  | 'referrer'
  | 'mixed'
  | 'title'
  | 'description'
  | 'h1'
  | 'canonical'
  | 'lang'
  | 'robots'
  | 'sitemap'
  | 'social'
  | 'schema'
  | 'viewport'
  | 'alt'
  | 'icon'
  | 'contact'
  | 'performance'
  | 'lcp'
  | 'server'
  | 'size'
  | 'compression'
  | 'images'
  | 'scripts'
  | 'copyright'
  | 'jquery'
  | 'generator'
  | 'flash'
  | 'analytics'
  | 'cookies';

export interface Report {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  cats: Record<Cat, number | null>;
  results: Result[];
}

const kb = (b: number) => (b >= 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.round(b / 1000)} KB`);
const sec = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

export function evaluate(f: Facts, speed: Speed | null, now = new Date()): Report {
  const r: Result[] = [];
  const add = (id: CheckId, cat: Cat, weight: number, status: Status, value?: string, earned?: number) =>
    r.push({ id, cat, weight, status, value, earned: earned ?? (status === 'pass' ? 1 : status === 'warn' ? 0.5 : 0) });
  const p = f.page;

  // reachable at all
  add('reachable', 'seo', 6, f.status >= 200 && f.status < 400 ? 'pass' : 'fail', String(f.status));

  // security
  add('https', 'security', 8, f.https ? 'pass' : 'fail');
  if (f.https && f.httpRedirect !== null) add('redirect', 'security', 4, f.httpRedirect ? 'pass' : 'fail');
  if (f.https) add('hsts', 'security', 3, f.headers.hsts ? 'pass' : 'warn');
  add('csp', 'security', 2, f.headers.csp ? 'pass' : 'warn');
  add('nosniff', 'security', 1.5, f.headers.xcto ? 'pass' : 'warn');
  add('frame', 'security', 1.5, f.headers.frame ? 'pass' : 'warn');
  add('referrer', 'security', 1, f.headers.referrer ? 'pass' : 'warn');
  if (f.https) add('mixed', 'security', 3, p.insecureResources ? 'fail' : 'pass', p.insecureResources ? String(p.insecureResources) : undefined);

  // findability
  const tl = p.title.length;
  add('title', 'seo', 6, !tl ? 'fail' : tl < 10 || tl > 65 ? 'warn' : 'pass', tl ? `${tl}` : undefined);
  const dl = p.description?.length ?? 0;
  add('description', 'seo', 6, !dl ? 'fail' : dl < 50 || dl > 170 ? 'warn' : 'pass', dl ? `${dl}` : undefined);
  add('h1', 'seo', 4, p.h1 === 1 ? 'pass' : p.h1 === 0 ? 'fail' : 'warn', String(p.h1));
  add('canonical', 'seo', 2, p.canonical ? 'pass' : 'warn');
  add('lang', 'seo', 2, p.lang ? 'pass' : 'warn', p.lang ?? undefined);
  add('robots', 'seo', 2, f.robots.blocksAll ? 'fail' : f.robots.exists ? 'pass' : 'warn');
  add('sitemap', 'seo', 3, f.sitemap ? 'pass' : 'fail');
  add('social', 'seo', 2, p.ogTitle && p.ogImage ? 'pass' : p.ogTitle || p.ogImage ? 'warn' : 'fail');
  add('schema', 'seo', 2, p.jsonLd ? 'pass' : 'warn');

  // phones and accessibility
  add('viewport', 'mobile', 8, p.viewport && /width\s*=\s*device-width/i.test(p.viewport) ? 'pass' : 'fail');
  const noAlt = p.images ? p.imagesNoAlt / p.images : 0;
  add('alt', 'mobile', 4, noAlt <= 0.1 ? 'pass' : noAlt <= 0.4 ? 'warn' : 'fail', p.images ? `${p.imagesNoAlt}/${p.images}` : undefined);
  add('icon', 'mobile', 1.5, p.icon ? 'pass' : 'warn');
  add('contact', 'mobile', 2, p.tel || p.mail ? 'pass' : 'warn');

  // speed: Google's own measurement when it is available, our server-side numbers otherwise
  if (speed && !speed.error && speed.performance != null) {
    const s = speed.performance;
    add('performance', 'speed', 12, s >= 90 ? 'pass' : s >= 50 ? 'warn' : 'fail', `${s}/100`, s / 100);
    if (speed.lcp != null) add('lcp', 'speed', 4, speed.lcp <= 2500 ? 'pass' : speed.lcp <= 4000 ? 'warn' : 'fail', sec(speed.lcp));
  }
  add('server', 'speed', 4, f.timeMs <= 800 ? 'pass' : f.timeMs <= 2000 ? 'warn' : 'fail', sec(f.timeMs));
  add('size', 'speed', 2, f.bytes <= 150_000 ? 'pass' : f.bytes <= 400_000 ? 'warn' : 'fail', kb(f.bytes));
  add('compression', 'speed', 2, f.headers.compression ? 'pass' : 'warn');
  if (p.images > 3) add('images', 'speed', 2, p.modernImages && p.imagesLazy > 0 ? 'pass' : p.modernImages || p.imagesLazy > 0 ? 'warn' : 'fail');
  add('scripts', 'speed', 2, p.scripts <= 15 ? 'pass' : p.scripts <= 30 ? 'warn' : 'fail', String(p.scripts));

  // signs of an unmaintained site
  const year = now.getFullYear();
  if (p.copyrightYear) add('copyright', 'care', 2, p.copyrightYear >= year - 1 ? 'pass' : 'warn', `© ${p.copyrightYear}`);
  if (p.jquery) add('jquery', 'care', 2, +p.jquery.split('.')[0] >= 3 ? 'pass' : 'warn', p.jquery);
  if (p.generator && /\d/.test(p.generator)) add('generator', 'care', 1.5, 'warn', p.generator);
  if (p.flash) add('flash', 'care', 3, 'fail');
  add('analytics', 'care', 1, p.analytics ? 'pass' : 'warn');
  // a banner is only needed when something sets tracking cookies
  if (p.trackingCookies ?? p.analytics) add('cookies', 'care', 2, p.cookieBanner ? 'pass' : 'warn');

  const total = r.reduce((s, x) => s + x.weight, 0);
  const got = r.reduce((s, x) => s + x.weight * x.earned, 0);
  const score = Math.round((got / total) * 100);
  const cats = Object.fromEntries(
    CATS.map((c) => {
      const list = r.filter((x) => x.cat === c);
      const w = list.reduce((s, x) => s + x.weight, 0);
      return [c, w ? Math.round((list.reduce((s, x) => s + x.weight * x.earned, 0) / w) * 100) : null];
    }),
  ) as Record<Cat, number | null>;
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 45 ? 'D' : 'F';
  return { score, grade, cats, results: r };
}

/* ---------- texts ---------- */

interface CheckText {
  name: L10n;
  /** shown when it fails or could be better */
  bad: L10n;
  /** what to do about it */
  fix: L10n;
}

export const CHECKS: Record<CheckId, CheckText> = {
  reachable: {
    name: { en: 'Page loads', hu: 'Az oldal betölt', sk: 'Stránka sa načíta' },
    bad: { en: 'The address returned an error instead of the page.', hu: 'A cím az oldal helyett hibát adott vissza.', sk: 'Adresa namiesto stránky vrátila chybu.' },
    fix: { en: 'Check the hosting and the address; visitors and Google see the same error.', hu: 'Érdemes megnézni a tárhelyet és a címet — a látogatók és a Google is ugyanezt a hibát látják.', sk: 'Skontrolujte hosting a adresu — návštevníci aj Google vidia rovnakú chybu.' },
  },
  https: {
    name: { en: 'Secure connection (HTTPS)', hu: 'Biztonságos kapcsolat (HTTPS)', sk: 'Zabezpečené pripojenie (HTTPS)' },
    bad: { en: 'The site does not load over HTTPS, so browsers mark it “Not secure”.', hu: 'Az oldal nem tölt be HTTPS-en, ezért a böngészők „Nem biztonságos” jelzést mutatnak.', sk: 'Stránka sa nenačítava cez HTTPS, preto ju prehliadače označujú ako „Nezabezpečené“.' },
    fix: { en: 'Install a free SSL certificate (most hosts offer one) and serve the site on https://.', hu: 'Egy ingyenes SSL-tanúsítvány (a legtöbb tárhely ad ilyet) és https:// cím megoldja.', sk: 'Nainštalujte bezplatný SSL certifikát (väčšina hostingov ho ponúka) a prevádzkujte web na adrese https://.' },
  },
  redirect: {
    name: { en: 'Redirect from http:// to https://', hu: 'Átirányítás http://-ről https://-re', sk: 'Presmerovanie z http:// na https://' },
    bad: { en: 'The old http:// address still opens an unencrypted version.', hu: 'A régi http:// cím még mindig titkosítatlan változatot nyit meg.', sk: 'Stará adresa http:// stále otvára nešifrovanú verziu.' },
    fix: { en: 'Add a permanent (301) redirect from http to https on the server.', hu: 'Állandó (301) átirányítás kell a szerveren a http-ről a https-re.', sk: 'Nastavte na serveri trvalé (301) presmerovanie z http na https.' },
  },
  hsts: {
    name: { en: 'HSTS header', hu: 'HSTS fejléc', sk: 'Hlavička HSTS' },
    bad: { en: 'Browsers are not told to always use HTTPS for this site.', hu: 'A böngészők nem kapnak utasítást, hogy mindig HTTPS-t használjanak.', sk: 'Prehliadače nedostávajú pokyn, aby pre tento web vždy používali HTTPS.' },
    fix: { en: 'Send a Strict-Transport-Security header once HTTPS works everywhere.', hu: 'Strict-Transport-Security fejléc, amint a HTTPS mindenhol működik.', sk: 'Keď HTTPS funguje všade, posielajte hlavičku Strict-Transport-Security.' },
  },
  csp: {
    name: { en: 'Content Security Policy', hu: 'Content Security Policy', sk: 'Content Security Policy' },
    bad: { en: 'No policy limits which scripts may run, which makes injected code easier to exploit.', hu: 'Nincs szabály arra, milyen szkriptek futhatnak, így egy befecskendezett kód könnyebben kárt okoz.', sk: 'Žiadne pravidlo neobmedzuje, ktoré skripty môžu bežať, takže vložený škodlivý kód napácha škodu ľahšie.' },
    fix: { en: 'Add a Content-Security-Policy header that allows only your own and trusted sources.', hu: 'Content-Security-Policy fejléc, ami csak a saját és a megbízható forrásokat engedi.', sk: 'Pridajte hlavičku Content-Security-Policy, ktorá povolí len vaše vlastné a dôveryhodné zdroje.' },
  },
  nosniff: {
    name: { en: 'X-Content-Type-Options', hu: 'X-Content-Type-Options', sk: 'X-Content-Type-Options' },
    bad: { en: 'Browsers may guess file types, a small but avoidable risk.', hu: 'A böngészők találgathatják a fájltípusokat — kicsi, de elkerülhető kockázat.', sk: 'Prehliadače môžu typy súborov hádať — malé, ale zbytočné riziko.' },
    fix: { en: 'Send “X-Content-Type-Options: nosniff”.', hu: '„X-Content-Type-Options: nosniff” fejléc.', sk: 'Posielajte hlavičku „X-Content-Type-Options: nosniff“.' },
  },
  frame: {
    name: { en: 'Clickjacking protection', hu: 'Clickjacking elleni védelem', sk: 'Ochrana proti clickjackingu' },
    bad: { en: 'Other sites can embed this page in a frame.', hu: 'Más oldalak keretbe ágyazhatják ezt az oldalt.', sk: 'Iné weby môžu túto stránku vložiť do rámca.' },
    fix: { en: 'Send X-Frame-Options or a CSP frame-ancestors rule.', hu: 'X-Frame-Options vagy CSP frame-ancestors szabály.', sk: 'Posielajte X-Frame-Options alebo pravidlo CSP frame-ancestors.' },
  },
  referrer: {
    name: { en: 'Referrer policy', hu: 'Referrer policy', sk: 'Referrer policy' },
    bad: { en: 'Full page addresses may leak to other sites when visitors click a link.', hu: 'Kattintáskor a teljes oldalcím kiszivároghat más oldalak felé.', sk: 'Keď návštevník klikne na odkaz, úplná adresa stránky môže uniknúť na iné weby.' },
    fix: { en: 'Send “Referrer-Policy: strict-origin-when-cross-origin”.', hu: '„Referrer-Policy: strict-origin-when-cross-origin” fejléc.', sk: 'Posielajte hlavičku „Referrer-Policy: strict-origin-when-cross-origin“.' },
  },
  mixed: {
    name: { en: 'Insecure files on the page', hu: 'Titkosítatlan fájlok az oldalon', sk: 'Nezabezpečené súbory na stránke' },
    bad: { en: 'Some images or scripts still load over http://; browsers may block them or show a warning.', hu: 'Néhány kép vagy szkript még http://-n töltődik; a böngésző letilthatja vagy figyelmeztetést mutathat.', sk: 'Niektoré obrázky alebo skripty sa stále načítavajú cez http://; prehliadač ich môže zablokovať alebo zobraziť upozornenie.' },
    fix: { en: 'Change those links to https:// (or relative addresses).', hu: 'Ezeket a hivatkozásokat https://-re (vagy relatív címre) kell cserélni.', sk: 'Zmeňte tieto odkazy na https:// (alebo na relatívne adresy).' },
  },
  title: {
    name: { en: 'Page title', hu: 'Oldalcím', sk: 'Titulok stránky' },
    bad: { en: 'The title is missing or a poor length; it is the headline of your result on Google.', hu: 'A cím hiányzik vagy nem jó hosszúságú — ez a találat címe a Google-ben.', sk: 'Titulok chýba alebo nemá vhodnú dĺžku — práve on je nadpisom vášho výsledku v Googli.' },
    fix: { en: 'Write a 30–60 character title with what you do and where, e.g. “Dental clinic in Szeged — Name”.', hu: '30–60 karakteres cím arról, mit és hol csinálsz, pl. „Fogászat Szegeden — Név”.', sk: 'Napíšte titulok s dĺžkou 30–60 znakov o tom, čo robíte a kde, napr. „Zubná ambulancia v Nitre — Názov“.' },
  },
  description: {
    name: { en: 'Meta description', hu: 'Meta leírás', sk: 'Meta popis' },
    bad: { en: 'Google has no good summary to show under your title, so it picks random text.', hu: 'A Google-nek nincs jó összefoglalója a cím alá, ezért véletlenszerű szöveget mutat.', sk: 'Google nemá pod titulkom čo zobraziť ako dobré zhrnutie, preto vyberie náhodný text.' },
    fix: { en: 'Add a 120–160 character description that makes people want to click.', hu: '120–160 karakteres leírás, ami kattintásra csábít.', sk: 'Pridajte popis s dĺžkou 120–160 znakov, ktorý ľudí naláka kliknúť.' },
  },
  h1: {
    name: { en: 'One main heading (H1)', hu: 'Egy fő címsor (H1)', sk: 'Jeden hlavný nadpis (H1)' },
    bad: { en: 'The page should have exactly one main heading saying what it is about.', hu: 'Az oldalon pontosan egy fő címsornak kell lennie arról, miről szól.', sk: 'Stránka by mala mať práve jeden hlavný nadpis, ktorý hovorí, o čom je.' },
    fix: { en: 'Mark the main headline as H1 and use H2/H3 for the rest.', hu: 'A fő címet H1-ként, a többit H2/H3-ként érdemes jelölni.', sk: 'Hlavný nadpis označte ako H1 a pre ostatné použite H2/H3.' },
  },
  canonical: {
    name: { en: 'Canonical address', hu: 'Kanonikus cím', sk: 'Kanonická adresa' },
    bad: { en: 'Without it, Google may treat versions of the same page as duplicates.', hu: 'Enélkül a Google ugyanannak az oldalnak több változatát duplikátumnak tekintheti.', sk: 'Bez nej môže Google považovať rôzne verzie tej istej stránky za duplikáty.' },
    fix: { en: 'Add <link rel="canonical"> pointing at the preferred address.', hu: '<link rel="canonical"> a preferált címre.', sk: 'Pridajte <link rel="canonical"> odkazujúci na preferovanú adresu.' },
  },
  lang: {
    name: { en: 'Page language set', hu: 'Az oldal nyelve megadva', sk: 'Nastavený jazyk stránky' },
    bad: { en: 'Browsers, translators and screen readers do not know the page’s language.', hu: 'A böngészők, a fordítók és a képernyőolvasók nem tudják, milyen nyelvű az oldal.', sk: 'Prehliadače, prekladače ani čítačky obrazovky nevedia, v akom jazyku je stránka.' },
    fix: { en: 'Add lang="hu" (or the right language) to the <html> tag.', hu: 'lang="hu" (vagy a megfelelő nyelv) a <html> tagbe.', sk: 'Pridajte do značky <html> atribút lang="sk" (alebo príslušný jazyk).' },
  },
  robots: {
    name: { en: 'robots.txt', hu: 'robots.txt', sk: 'robots.txt' },
    bad: { en: 'The robots.txt file is missing — or it blocks search engines from the whole site.', hu: 'A robots.txt hiányzik — vagy az egész oldalt letiltja a keresők elől.', sk: 'Súbor robots.txt chýba — alebo vyhľadávačom blokuje celý web.' },
    fix: { en: 'Publish a robots.txt that allows crawling and lists the sitemap.', hu: 'Olyan robots.txt, ami engedi a feltérképezést és megadja az oldaltérképet.', sk: 'Zverejnite robots.txt, ktorý povoľuje prehľadávanie a uvádza mapu stránok.' },
  },
  sitemap: {
    name: { en: 'Sitemap', hu: 'Oldaltérkép (sitemap)', sk: 'Mapa stránok (sitemap)' },
    bad: { en: 'No sitemap.xml was found, so Google has to discover pages on its own.', hu: 'Nincs sitemap.xml, így a Google-nek magának kell felfedeznie az oldalakat.', sk: 'Nenašli sme sitemap.xml, takže Google musí stránky objavovať sám.' },
    fix: { en: 'Generate a sitemap.xml and submit it in Google Search Console.', hu: 'sitemap.xml készítése és beküldése a Google Search Console-ban.', sk: 'Vygenerujte sitemap.xml a odošlite ju v Google Search Console.' },
  },
  social: {
    name: { en: 'Link previews (Open Graph)', hu: 'Linkelőnézet (Open Graph)', sk: 'Náhľady odkazov (Open Graph)' },
    bad: { en: 'Shared on Facebook, LinkedIn or Messenger, the link shows no proper title or picture.', hu: 'Facebookon, LinkedInen vagy Messengeren megosztva a linknek nincs rendes címe vagy képe.', sk: 'Pri zdieľaní na Facebooku, LinkedIne alebo v Messengeri nemá odkaz poriadny titulok ani obrázok.' },
    fix: { en: 'Add og:title, og:description and a 1200×630 og:image.', hu: 'og:title, og:description és egy 1200×630-as og:image.', sk: 'Pridajte og:title, og:description a og:image s rozmermi 1200×630.' },
  },
  schema: {
    name: { en: 'Structured data', hu: 'Strukturált adatok', sk: 'Štruktúrované dáta' },
    bad: { en: 'Google gets no machine-readable details (opening hours, address, reviews…).', hu: 'A Google nem kap gépileg olvasható adatokat (nyitvatartás, cím, értékelések…).', sk: 'Google nedostáva strojovo čitateľné údaje (otváracie hodiny, adresa, hodnotenia…).' },
    fix: { en: 'Add JSON-LD for your business type (LocalBusiness, Restaurant, Dentist…).', hu: 'JSON-LD a vállalkozás típusához (LocalBusiness, Restaurant, Dentist…).', sk: 'Pridajte JSON-LD pre typ vašej firmy (LocalBusiness, Restaurant, Dentist…).' },
  },
  viewport: {
    name: { en: 'Built for phones', hu: 'Mobilra készült', sk: 'Prispôsobené pre mobily' },
    bad: { en: 'The page has no mobile viewport, so phones show a shrunken desktop page.', hu: 'Nincs mobil viewport, ezért a telefon egy lekicsinyített asztali oldalt mutat.', sk: 'Stránka nemá mobilný viewport, preto telefóny zobrazujú zmenšenú desktopovú verziu.' },
    fix: { en: 'A responsive layout with <meta name="viewport" content="width=device-width">.', hu: 'Reszponzív elrendezés és <meta name="viewport" content="width=device-width">.', sk: 'Responzívne rozloženie s <meta name="viewport" content="width=device-width">.' },
  },
  alt: {
    name: { en: 'Image descriptions (alt text)', hu: 'Képleírások (alt szöveg)', sk: 'Popisy obrázkov (alt text)' },
    bad: { en: 'Many images have no alt text: screen readers skip them and Google cannot read them.', hu: 'Sok képnek nincs alt szövege: a képernyőolvasók átugorják, a Google nem érti őket.', sk: 'Mnohé obrázky nemajú alt text: čítačky obrazovky ich preskočia a Google im nerozumie.' },
    fix: { en: 'Describe meaningful images in a few words; give decorative ones an empty alt="".', hu: 'A fontos képeket pár szóval érdemes leírni, a díszítőknek üres alt="" jár.', sk: 'Dôležité obrázky opíšte niekoľkými slovami, dekoratívnym dajte prázdny alt="".' },
  },
  icon: {
    name: { en: 'Site icon (favicon)', hu: 'Oldalikon (favicon)', sk: 'Ikona webu (favicon)' },
    bad: { en: 'No icon appears in the browser tab or on Google’s mobile results.', hu: 'Nem jelenik meg ikon a böngészőfülön és a Google mobiltalálatainál.', sk: 'Na karte prehliadača ani v mobilných výsledkoch Googlu sa nezobrazuje žiadna ikona.' },
    fix: { en: 'Add a favicon and an apple-touch-icon.', hu: 'Favicon és apple-touch-icon hozzáadása.', sk: 'Pridajte favicon a apple-touch-icon.' },
  },
  contact: {
    name: { en: 'One-tap phone or email', hu: 'Egy érintéses telefon vagy e-mail', sk: 'Telefón alebo e-mail na jedno ťuknutie' },
    bad: { en: 'Phone numbers and emails are not tappable links, so calling takes extra effort on a phone.', hu: 'A telefonszám és az e-mail nem kattintható, így mobilon nehezebb hívni vagy írni.', sk: 'Telefónne čísla a e-maily nie sú klikateľné odkazy, takže zavolať alebo napísať z mobilu je zbytočne prácne.' },
    fix: { en: 'Use tel: and mailto: links, ideally a call button visible on phones.', hu: 'tel: és mailto: linkek, ideális esetben mobilon látható hívás gomb.', sk: 'Použite odkazy tel: a mailto:, ideálne aj tlačidlo na volanie viditeľné na mobiloch.' },
  },
  performance: {
    name: { en: 'Google PageSpeed (mobile)', hu: 'Google PageSpeed (mobil)', sk: 'Google PageSpeed (mobil)' },
    bad: { en: 'Google rates the mobile experience as slow; slow pages lose visitors and rank lower.', hu: 'A Google lassúnak értékeli a mobilos élményt — a lassú oldal látogatókat veszít és hátrébb kerül.', sk: 'Google hodnotí mobilnú verziu ako pomalú — pomalé stránky strácajú návštevníkov a umiestňujú sa nižšie.' },
    fix: { en: 'Lighter images (WebP/AVIF), fewer scripts, caching and a modern build usually fix most of it.', hu: 'Könnyebb képek (WebP/AVIF), kevesebb szkript, gyorsítótár és modern felépítés többnyire megoldja.', sk: 'Ľahšie obrázky (WebP/AVIF), menej skriptov, cache a moderný build zvyčajne vyriešia väčšinu problémov.' },
  },
  lcp: {
    name: { en: 'Main content appears (LCP)', hu: 'A fő tartalom megjelenése (LCP)', sk: 'Zobrazenie hlavného obsahu (LCP)' },
    bad: { en: 'The main content takes too long to appear on a phone (Google’s target is 2.5 s).', hu: 'A fő tartalom túl lassan jelenik meg mobilon (a Google célértéke 2,5 mp).', sk: 'Hlavný obsah sa na mobile zobrazuje príliš dlho (cieľová hodnota Googlu je 2,5 s).' },
    fix: { en: 'Optimise the hero image, preload key fonts and remove render-blocking scripts.', hu: 'A nyitókép optimalizálása, a fontos betűtípusok előtöltése és a blokkoló szkriptek kiiktatása.', sk: 'Optimalizujte úvodný obrázok, vopred načítajte kľúčové písma a odstráňte skripty, ktoré blokujú vykresľovanie.' },
  },
  server: {
    name: { en: 'Server response time', hu: 'Szerver válaszideje', sk: 'Čas odozvy servera' },
    bad: { en: 'The server is slow to answer, before anything is even drawn.', hu: 'A szerver lassan válaszol, még mielőtt bármi megjelenne.', sk: 'Server odpovedá pomaly, ešte predtým, než sa čokoľvek vykreslí.' },
    fix: { en: 'Caching, a faster host or a CDN in front of the site.', hu: 'Gyorsítótár, gyorsabb tárhely vagy CDN az oldal elé.', sk: 'Cache, rýchlejší hosting alebo CDN pred webom.' },
  },
  size: {
    name: { en: 'Page size (HTML)', hu: 'Oldalméret (HTML)', sk: 'Veľkosť stránky (HTML)' },
    bad: { en: 'The page’s HTML alone is heavy, often a sign of a bloated theme or page builder.', hu: 'Már maga a HTML is nehéz — gyakran túlzsúfolt sablon vagy oldalépítő jele.', sk: 'Už samotné HTML stránky je ťažké — často je to znak preplnenej šablóny alebo page buildera.' },
    fix: { en: 'Leaner templates and moving inline code into cached files.', hu: 'Karcsúbb sablon és a beágyazott kód gyorsítótárazható fájlokba szervezése.', sk: 'Štíhlejšie šablóny a presun vloženého kódu do súborov, ktoré sa dajú cachovať.' },
  },
  compression: {
    name: { en: 'Compression', hu: 'Tömörítés', sk: 'Kompresia' },
    bad: { en: 'The page is sent uncompressed, so it downloads slower than it needs to.', hu: 'Az oldal tömörítés nélkül érkezik, így lassabban töltődik le a szükségesnél.', sk: 'Stránka sa posiela bez kompresie, takže sa sťahuje pomalšie, než je nutné.' },
    fix: { en: 'Turn on gzip or Brotli on the server (often one setting).', hu: 'gzip vagy Brotli bekapcsolása a szerveren (gyakran egyetlen beállítás).', sk: 'Zapnite na serveri gzip alebo Brotli (často ide o jedno nastavenie).' },
  },
  images: {
    name: { en: 'Modern, lazy-loaded images', hu: 'Modern, késleltetve töltött képek', sk: 'Moderné, oneskorene načítané obrázky' },
    bad: { en: 'Images are not in modern formats or all load at once, which slows phones down.', hu: 'A képek nem modern formátumúak, vagy egyszerre töltődnek be, ami lassítja a telefonokat.', sk: 'Obrázky nie sú v moderných formátoch alebo sa načítavajú všetky naraz, čo spomaľuje telefóny.' },
    fix: { en: 'Serve WebP/AVIF and add loading="lazy" to images below the fold.', hu: 'WebP/AVIF képek és loading="lazy" a lejjebb lévő képekre.', sk: 'Používajte WebP/AVIF a obrázkom nižšie na stránke pridajte loading="lazy".' },
  },
  scripts: {
    name: { en: 'Number of scripts', hu: 'Szkriptek száma', sk: 'Počet skriptov' },
    bad: { en: 'Many separate scripts load; each one costs time on a phone.', hu: 'Sok külön szkript töltődik be; mindegyik időbe kerül mobilon.', sk: 'Načítava sa veľa samostatných skriptov; každý z nich stojí na mobile čas.' },
    fix: { en: 'Remove unused plugins and bundle the rest.', hu: 'A nem használt bővítmények eltávolítása, a többi összevonása.', sk: 'Odstráňte nepoužívané pluginy a zvyšok spojte do balíka.' },
  },
  copyright: {
    name: { en: 'Signs of updates', hu: 'Frissítés jelei', sk: 'Známky aktualizácií' },
    bad: { en: 'The footer shows an old year, which makes the business look inactive.', hu: 'A láblécben régi évszám áll, amitől a vállalkozás inaktívnak tűnik.', sk: 'V pätičke je starý rok, vďaka čomu firma pôsobí neaktívne.' },
    fix: { en: 'Update the year (or show it automatically) and refresh outdated content.', hu: 'Az évszám frissítése (vagy automatikus megjelenítése) és az elavult tartalom felújítása.', sk: 'Aktualizujte rok (alebo ho zobrazujte automaticky) a obnovte zastaraný obsah.' },
  },
  jquery: {
    name: { en: 'Library versions', hu: 'Programkönyvtárak verziója', sk: 'Verzie knižníc' },
    bad: { en: 'An old jQuery version is loaded; old versions have known security issues.', hu: 'Régi jQuery verzió töltődik be; a régi verzióknak ismert biztonsági hibáik vannak.', sk: 'Načítava sa stará verzia jQuery; staré verzie majú známe bezpečnostné chyby.' },
    fix: { en: 'Update the theme and plugins, or remove jQuery if nothing needs it.', hu: 'A sablon és a bővítmények frissítése, vagy a jQuery elhagyása, ha nincs rá szükség.', sk: 'Aktualizujte šablónu a pluginy, alebo jQuery odstráňte, ak ho nič nepotrebuje.' },
  },
  generator: {
    name: { en: 'Visible software version', hu: 'Látható szoftververzió', sk: 'Viditeľná verzia softvéru' },
    bad: { en: 'The page announces its exact software version, which helps attackers find known holes.', hu: 'Az oldal kiírja a pontos szoftververziót, ami segít a támadóknak az ismert hibák megtalálásában.', sk: 'Stránka prezrádza presnú verziu softvéru, čo útočníkom uľahčuje hľadanie známych zraniteľností.' },
    fix: { en: 'Keep the software updated and remove the generator tag.', hu: 'A szoftver frissen tartása és a generator tag eltávolítása.', sk: 'Udržiavajte softvér aktualizovaný a odstráňte značku generator.' },
  },
  flash: {
    name: { en: 'Flash content', hu: 'Flash tartalom', sk: 'Obsah vo Flashi' },
    bad: { en: 'The page uses Flash, which no browser has supported since 2021.', hu: 'Az oldal Flash-t használ, amit 2021 óta egyetlen böngésző sem támogat.', sk: 'Stránka používa Flash, ktorý od roku 2021 nepodporuje žiadny prehliadač.' },
    fix: { en: 'Replace it with HTML5 video or images.', hu: 'HTML5 videóra vagy képekre kell cserélni.', sk: 'Nahraďte ho videom v HTML5 alebo obrázkami.' },
  },
  analytics: {
    name: { en: 'Visitor statistics', hu: 'Látogatottsági statisztika', sk: 'Štatistiky návštevnosti' },
    bad: { en: 'No analytics was detected, so you cannot see what visitors do or where they come from.', hu: 'Nem találtunk statisztikát, így nem látod, mit csinálnak a látogatók és honnan jönnek.', sk: 'Nezistili sme žiadnu analytiku, takže nevidíte, čo návštevníci robia ani odkiaľ prichádzajú.' },
    fix: { en: 'A privacy-friendly tool (e.g. Plausible, Cloudflare Web Analytics) or GA4 with consent.', hu: 'Adatvédelem-barát eszköz (pl. Plausible, Cloudflare Web Analytics) vagy GA4 hozzájárulással.', sk: 'Nástroj šetrný k súkromiu (napr. Plausible, Cloudflare Web Analytics) alebo GA4 so súhlasom.' },
  },
  cookies: {
    name: { en: 'Cookie consent', hu: 'Süti-hozzájárulás', sk: 'Súhlas s cookies' },
    bad: { en: 'Tracking runs but no cookie consent banner was detected (a GDPR requirement in the EU).', hu: 'Követőkód fut, de nem találtunk süti-hozzájárulást (GDPR-követelmény az EU-ban).', sk: 'Beží sledovací kód, ale nenašli sme lištu so súhlasom s cookies (v EÚ to vyžaduje GDPR).' },
    fix: { en: 'Add a consent banner that blocks tracking until the visitor agrees.', hu: 'Hozzájárulási sáv, ami a beleegyezésig blokkolja a követést.', sk: 'Pridajte lištu so súhlasom, ktorá zablokuje sledovanie, kým návštevník nesúhlasí.' },
  },
};

export const CAT_NAMES: Record<Cat, L10n> = {
  speed: { en: 'Speed', hu: 'Sebesség', sk: 'Rýchlosť' },
  seo: { en: 'Findability (SEO)', hu: 'Megtalálhatóság (SEO)', sk: 'Nájditeľnosť (SEO)' },
  mobile: { en: 'Mobile & accessibility', hu: 'Mobil és akadálymentesség', sk: 'Mobil a prístupnosť' },
  security: { en: 'Security', hu: 'Biztonság', sk: 'Bezpečnosť' },
  care: { en: 'Maintenance', hu: 'Karbantartottság', sk: 'Údržba' },
};

export const GRADE_TEXT: Record<Report['grade'], L10n> = {
  A: { en: 'Excellent — only fine-tuning left.', hu: 'Kiváló — csak finomhangolás maradt.', sk: 'Výborné — zostáva už len doladenie.' },
  B: { en: 'Good, with a few things worth fixing.', hu: 'Jó, néhány javítanivalóval.', sk: 'Dobré, s niekoľkými vecami, ktoré sa oplatí opraviť.' },
  C: { en: 'Average — visitors and Google notice the gaps.', hu: 'Átlagos — a látogatók és a Google is észreveszik a hiányosságokat.', sk: 'Priemerné — nedostatky si všímajú návštevníci aj Google.' },
  D: { en: 'Weak — the site is likely costing you customers.', hu: 'Gyenge — az oldal valószínűleg ügyfeleket veszít.', sk: 'Slabé — web vás pravdepodobne pripravuje o zákazníkov.' },
  F: { en: 'Poor — a modern rebuild would pay off quickly.', hu: 'Rossz — egy modern újraépítés gyorsan megtérülne.', sk: 'Zlé — moderná prestavba by sa rýchlo vrátila.' },
};

export const CHECK_SEO: Record<Lang, { title: string; description: string }> = {
  en: {
    title: 'Free website check: speed, SEO, mobile and security | softwaredevelopment.hu',
    description: 'Type in your website address and get an instant report: Google PageSpeed, SEO basics, mobile readiness, HTTPS and security headers — with a plain-language fix for each issue.',
  },
  hu: {
    title: 'Ingyenes weboldal-ellenőrzés: sebesség, SEO, mobil és biztonság | softwaredevelopment.hu',
    description: 'Írd be a weboldalad címét, és azonnal kapsz egy jelentést: Google PageSpeed, SEO-alapok, mobilbarátság, HTTPS és biztonsági fejlécek — minden hibához érthető javítási javaslattal.',
  },
  sk: {
    title: 'Bezplatná kontrola webu: rýchlosť, SEO, mobil a bezpečnosť | softwaredevelopment.hu',
    description: 'Zadajte adresu svojho webu a okamžite dostanete správu: Google PageSpeed, základy SEO, prispôsobenie pre mobily, HTTPS a bezpečnostné hlavičky — ku každému problému zrozumiteľný návrh riešenia.',
  },
};
