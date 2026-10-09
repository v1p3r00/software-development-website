// kept free of Vite-only imports: the build-time SEO step (scripts/seo.ts) reads it too
type L10n = Record<'en' | 'hu' | 'sk', string>;

/** The full-stack course syllabus: modules and lessons (titles in both languages). */

export interface CourseLesson {
  slug: string;
  title: L10n;
  minutes: number;
}

export interface CourseModule {
  id: string;
  num: string;
  title: L10n;
  summary: L10n;
  lessons: CourseLesson[];
  /** the sample project of the module (full source on Patreon) */
  project?: L10n;
  /** related interview simulator tracks */
  tracks: string[];
}

const l = (slug: string, en: string, hu: string, sk: string, minutes = 15): CourseLesson => ({ slug, title: { en, hu, sk }, minutes });

export const modules: CourseModule[] = [
  {
    id: 'web', num: '01',
    title: { en: 'How the web works', hu: 'Hogyan működik a web', sk: 'Ako funguje web' },
    summary: { en: 'Browsers, servers, HTTP and the tools every developer uses daily.', hu: 'Böngészők, szerverek, HTTP és az eszközök, amelyeket minden fejlesztő naponta használ.', sk: 'Prehliadače, servery, HTTP a nástroje, ktoré každý vývojár používa denne.' },
    lessons: [
      l('how-a-website-loads', 'What happens when you open a website', 'Mi történik, amikor megnyitsz egy weboldalt', 'Čo sa deje, keď otvoríš webovú stránku'),
      l('http-basics', 'HTTP: requests, responses and status codes', 'HTTP: kérések, válaszok és státuszkódok', 'HTTP: požiadavky, odpovede a stavové kódy'),
      l('the-full-stack-map', 'Frontend, backend, database: the full-stack map', 'Frontend, backend, adatbázis: a full-stack térkép', 'Frontend, backend, databáza: mapa full-stacku'),
      l('developer-toolkit', 'Your toolkit: editor, terminal, Git and DevTools', 'Az eszköztárad: szerkesztő, terminál, Git és DevTools', 'Tvoja výbava: editor, terminál, Git a DevTools'),
    ],
    tracks: ['git'],
  },
  {
    id: 'html-css', num: '02',
    title: { en: 'HTML & CSS', hu: 'HTML és CSS', sk: 'HTML a CSS' },
    summary: { en: 'Semantic structure, accessible forms, modern layout and responsive design.', hu: 'Szemantikus szerkezet, akadálymentes űrlapok, modern elrendezés és reszponzív design.', sk: 'Sémantická štruktúra, prístupné formuláre, moderné rozloženie a responzívny dizajn.' },
    lessons: [
      l('html-structure', 'HTML structure and semantic elements', 'HTML-szerkezet és szemantikus elemek', 'Štruktúra HTML a sémantické elementy'),
      l('forms-and-accessibility', 'Forms and accessibility', 'Űrlapok és akadálymentesség', 'Formuláre a prístupnosť'),
      l('css-fundamentals', 'CSS fundamentals: selectors, cascade, box model', 'CSS alapok: szelektorok, kaszkád, box model', 'Základy CSS: selektory, kaskáda, box model'),
      l('flexbox-and-grid', 'Layout with Flexbox and Grid', 'Elrendezés Flexboxszal és Griddel', 'Rozloženie s Flexboxom a Gridom', 20),
      l('responsive-design', 'Responsive, mobile-first design', 'Reszponzív, mobile-first design', 'Responzívny dizajn, mobile first'),
    ],
    project: { en: 'Responsive portfolio site with a contact form', hu: 'Reszponzív portfólióoldal kapcsolatfelvételi űrlappal', sk: 'Responzívna portfóliová stránka s kontaktným formulárom' },
    tracks: [],
  },
  {
    id: 'javascript', num: '03',
    title: { en: 'JavaScript & TypeScript', hu: 'JavaScript és TypeScript', sk: 'JavaScript a TypeScript' },
    summary: { en: 'The language of the browser, from variables to async code and types.', hu: 'A böngésző nyelve a változóktól az aszinkron kódig és a típusokig.', sk: 'Jazyk prehliadača – od premenných po asynchrónny kód a typy.' },
    lessons: [
      l('js-values-and-types', 'Values, variables and types', 'Értékek, változók és típusok', 'Hodnoty, premenné a typy'),
      l('js-functions', 'Functions, scope and closures', 'Függvények, scope és closure', 'Funkcie, scope a closures'),
      l('js-arrays-objects', 'Arrays and objects', 'Tömbök és objektumok', 'Polia a objekty'),
      l('js-dom-events', 'The DOM and events', 'A DOM és az események', 'DOM a udalosti'),
      l('js-async', 'Async JavaScript and fetch', 'Aszinkron JavaScript és fetch', 'Asynchrónny JavaScript a fetch', 20),
      l('typescript-essentials', 'TypeScript essentials', 'TypeScript alapok', 'Základy TypeScriptu', 20),
    ],
    project: { en: 'Interactive to-do app with local storage', hu: 'Interaktív teendőlista helyi tárolással', sk: 'Interaktívny zoznam úloh s lokálnym úložiskom' },
    tracks: ['javascript'],
  },
  {
    id: 'react', num: '04',
    title: { en: 'React', hu: 'React', sk: 'React' },
    summary: { en: 'Components, state, effects and routing for real single-page apps.', hu: 'Komponensek, állapot, effektek és útvonalkezelés valódi egyoldalas alkalmazásokhoz.', sk: 'Komponenty, stav, efekty a routing pre skutočné single-page aplikácie.' },
    lessons: [
      l('react-components', 'Components and JSX', 'Komponensek és JSX', 'Komponenty a JSX'),
      l('react-state-props', 'State and props', 'Állapot és props', 'Stav a props'),
      l('react-effects-data', 'Effects and loading data', 'Effektek és adatbetöltés', 'Efekty a načítavanie dát', 20),
      l('react-forms', 'Forms in React', 'Űrlapok Reactben', 'Formuláre v Reacte'),
      l('react-routing', 'Routing and app structure', 'Útvonalak és alkalmazásszerkezet', 'Routing a štruktúra aplikácie'),
    ],
    project: { en: 'Task manager frontend', hu: 'Feladatkezelő frontend', sk: 'Frontend správcu úloh' },
    tracks: ['react'],
  },
  {
    id: 'spring', num: '05',
    title: { en: 'REST APIs with Spring Boot', hu: 'REST API-k Spring Boottal', sk: 'REST API so Spring Bootom' },
    summary: { en: 'Java for the web, controllers, validation and a layered backend.', hu: 'Java a webhez, controllerek, validáció és rétegzett backend.', sk: 'Java pre web, controllery, validácia a vrstvený backend.' },
    lessons: [
      l('java-for-web', 'Java essentials for web developers', 'Java alapok webfejlesztőknek', 'Základy Javy pre webových vývojárov', 20),
      l('spring-boot-setup', 'Your first Spring Boot project', 'Az első Spring Boot projekted', 'Tvoj prvý Spring Boot projekt'),
      l('rest-controllers', 'Controllers and REST design', 'Controllerek és REST-tervezés', 'Controllery a návrh REST API'),
      l('validation-errors', 'Validation and error handling', 'Validáció és hibakezelés', 'Validácia a spracovanie chýb'),
      l('layered-architecture', 'Services and layered architecture', 'Service-ek és rétegzett architektúra', 'Služby a vrstvená architektúra'),
    ],
    project: { en: 'Task manager REST API', hu: 'Feladatkezelő REST API', sk: 'REST API správcu úloh' },
    tracks: ['java', 'spring-boot'],
  },
  {
    id: 'data', num: '06',
    title: { en: 'Databases & JPA', hu: 'Adatbázisok és JPA', sk: 'Databázy a JPA' },
    summary: { en: 'SQL, schema design, JPA entities and safe migrations.', hu: 'SQL, sématervezés, JPA entitások és biztonságos migrációk.', sk: 'SQL, návrh schémy, JPA entity a bezpečné migrácie.' },
    lessons: [
      l('sql-fundamentals', 'SQL fundamentals', 'SQL alapok', 'Základy SQL', 20),
      l('schema-design', 'Schema design and relations', 'Sématervezés és kapcsolatok', 'Návrh schémy a vzťahy'),
      l('jpa-entities', 'JPA and Hibernate entities', 'JPA és Hibernate entitások', 'Entity v JPA a Hibernate', 20),
      l('flyway-migrations', 'Database migrations with Flyway', 'Adatbázis-migrációk Flywayjel', 'Migrácie databázy s Flyway'),
      l('query-performance', 'Queries and performance', 'Lekérdezések és teljesítmény', 'Dopyty a výkon'),
    ],
    project: { en: 'Booking system backend', hu: 'Időpontfoglaló rendszer backend', sk: 'Backend rezervačného systému' },
    tracks: ['sql'],
  },
  {
    id: 'security', num: '07',
    title: { en: 'Authentication & security', hu: 'Hitelesítés és biztonság', sk: 'Autentifikácia a bezpečnosť' },
    summary: { en: 'Logins, roles, JWT and the mistakes attackers look for.', hu: 'Bejelentkezés, szerepkörök, JWT és a hibák, amelyeket a támadók keresnek.', sk: 'Prihlasovanie, roly, JWT a chyby, ktoré útočníci hľadajú.' },
    lessons: [
      l('authn-authz', 'Authentication vs authorization', 'Hitelesítés és jogosultságkezelés', 'Autentifikácia vs. autorizácia'),
      l('spring-security-jwt', 'Spring Security and JWT', 'Spring Security és JWT', 'Spring Security a JWT', 25),
      l('protecting-the-frontend', 'Protecting routes in React', 'Útvonalak védelme Reactben', 'Ochrana routov v Reacte'),
      l('owasp-essentials', 'The OWASP essentials', 'OWASP alapok', 'Základy OWASP'),
    ],
    project: { en: 'Secure booking system with roles', hu: 'Biztonságos, szerepkörös időpontfoglaló', sk: 'Bezpečný rezervačný systém s rolami' },
    tracks: ['security'],
  },
  {
    id: 'testing', num: '08',
    title: { en: 'Testing', hu: 'Tesztelés', sk: 'Testovanie' },
    summary: { en: 'Unit, integration and end-to-end tests that catch real bugs.', hu: 'Unit-, integrációs és end-to-end tesztek, amelyek valódi hibákat fognak meg.', sk: 'Unit, integračné a end-to-end testy, ktoré zachytia skutočné chyby.' },
    lessons: [
      l('testing-pyramid', 'The testing pyramid', 'A tesztpiramis', 'Testovacia pyramída'),
      l('junit-unit-tests', 'Unit tests with JUnit', 'Unit tesztek JUnittal', 'Unit testy s JUnit'),
      l('integration-tests', 'Integration tests with Testcontainers', 'Integrációs tesztek Testcontainersszel', 'Integračné testy s Testcontainers', 20),
      l('frontend-tests', 'Frontend tests with Vitest', 'Frontend tesztek Vitesttel', 'Frontendové testy s Vitestom'),
      l('e2e-playwright', 'End-to-end tests with Playwright', 'End-to-end tesztek Playwrighttal', 'End-to-end testy s Playwrightom'),
    ],
    tracks: ['test-automation'],
  },
  {
    id: 'deploy', num: '09',
    title: { en: 'Docker, CI/CD & deployment', hu: 'Docker, CI/CD és élesítés', sk: 'Docker, CI/CD a nasadenie' },
    summary: { en: 'Containers, pipelines and getting your app online.', hu: 'Konténerek, pipeline-ok és az alkalmazás élesítése.', sk: 'Kontajnery, pipelines a spustenie aplikácie online.' },
    lessons: [
      l('docker-basics', 'Docker basics', 'Docker alapok', 'Základy Dockeru'),
      l('docker-compose-stack', 'A full stack with Docker Compose', 'Teljes stack Docker Compose-zal', 'Celý stack s Docker Compose'),
      l('ci-github-actions', 'CI with GitHub Actions', 'CI GitHub Actionsszel', 'CI s GitHub Actions'),
      l('deploying-to-the-cloud', 'Deploying to the cloud', 'Élesítés a felhőben', 'Nasadenie do cloudu', 20),
      l('logs-monitoring', 'Logs and monitoring', 'Naplózás és monitorozás', 'Logy a monitoring'),
    ],
    project: { en: 'Mini webshop, containerised and deployed', hu: 'Mini webshop konténerizálva és élesítve', sk: 'Mini e-shop v kontajneroch a nasadený' },
    tracks: ['devops', 'linux'],
  },
  {
    id: 'capstone', num: '10',
    title: { en: 'Capstone & career', hu: 'Záróprojekt és karrier', sk: 'Záverečný projekt a kariéra' },
    summary: { en: 'Build a customer portal end to end, then turn it into job offers.', hu: 'Építs ügyfélportált az elejétől a végéig, aztán váltsd állásajánlatokra.', sk: 'Postav zákaznícky portál od začiatku do konca a premeň ho na pracovné ponuky.' },
    lessons: [
      l('capstone-plan', 'Planning the capstone', 'A záróprojekt megtervezése', 'Plánovanie záverečného projektu'),
      l('capstone-build', 'Building the customer portal', 'Az ügyfélportál megépítése', 'Stavba zákazníckeho portálu', 30),
      l('portfolio-github', 'Portfolio and GitHub that get noticed', 'Portfólió és GitHub, amit észrevesznek', 'Portfólio a GitHub, ktoré si všimnú'),
      l('landing-the-job', 'CV, interviews and your first job', 'Önéletrajz, interjúk és az első állás', 'Životopis, pohovory a prvá práca'),
    ],
    project: { en: 'Capstone: customer portal', hu: 'Záróprojekt: ügyfélportál', sk: 'Záverečný projekt: zákaznícky portál' },
    tracks: [],
  },
];

