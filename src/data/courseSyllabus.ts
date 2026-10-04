// kept free of Vite-only imports: the build-time SEO step (scripts/seo.ts) reads it too
type L10n = Record<'en' | 'hu', string>;

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

const l = (slug: string, en: string, hu: string, minutes = 15): CourseLesson => ({ slug, title: { en, hu }, minutes });

export const modules: CourseModule[] = [
  {
    id: 'web', num: '01',
    title: { en: 'How the web works', hu: 'Hogyan működik a web' },
    summary: { en: 'Browsers, servers, HTTP and the tools every developer uses daily.', hu: 'Böngészők, szerverek, HTTP és az eszközök, amelyeket minden fejlesztő naponta használ.' },
    lessons: [
      l('how-a-website-loads', 'What happens when you open a website', 'Mi történik, amikor megnyitsz egy weboldalt'),
      l('http-basics', 'HTTP: requests, responses and status codes', 'HTTP: kérések, válaszok és státuszkódok'),
      l('the-full-stack-map', 'Frontend, backend, database: the full-stack map', 'Frontend, backend, adatbázis: a full-stack térkép'),
      l('developer-toolkit', 'Your toolkit: editor, terminal, Git and DevTools', 'Az eszköztárad: szerkesztő, terminál, Git és DevTools'),
    ],
    tracks: ['git'],
  },
  {
    id: 'html-css', num: '02',
    title: { en: 'HTML & CSS', hu: 'HTML és CSS' },
    summary: { en: 'Semantic structure, accessible forms, modern layout and responsive design.', hu: 'Szemantikus szerkezet, akadálymentes űrlapok, modern elrendezés és reszponzív design.' },
    lessons: [
      l('html-structure', 'HTML structure and semantic elements', 'HTML-szerkezet és szemantikus elemek'),
      l('forms-and-accessibility', 'Forms and accessibility', 'Űrlapok és akadálymentesség'),
      l('css-fundamentals', 'CSS fundamentals: selectors, cascade, box model', 'CSS alapok: szelektorok, kaszkád, box model'),
      l('flexbox-and-grid', 'Layout with Flexbox and Grid', 'Elrendezés Flexboxszal és Griddel', 20),
      l('responsive-design', 'Responsive, mobile-first design', 'Reszponzív, mobile-first design'),
    ],
    project: { en: 'Responsive portfolio site with a contact form', hu: 'Reszponzív portfólióoldal kapcsolatfelvételi űrlappal' },
    tracks: [],
  },
  {
    id: 'javascript', num: '03',
    title: { en: 'JavaScript & TypeScript', hu: 'JavaScript és TypeScript' },
    summary: { en: 'The language of the browser, from variables to async code and types.', hu: 'A böngésző nyelve a változóktól az aszinkron kódig és a típusokig.' },
    lessons: [
      l('js-values-and-types', 'Values, variables and types', 'Értékek, változók és típusok'),
      l('js-functions', 'Functions, scope and closures', 'Függvények, scope és closure'),
      l('js-arrays-objects', 'Arrays and objects', 'Tömbök és objektumok'),
      l('js-dom-events', 'The DOM and events', 'A DOM és az események'),
      l('js-async', 'Async JavaScript and fetch', 'Aszinkron JavaScript és fetch', 20),
      l('typescript-essentials', 'TypeScript essentials', 'TypeScript alapok', 20),
    ],
    project: { en: 'Interactive to-do app with local storage', hu: 'Interaktív teendőlista helyi tárolással' },
    tracks: ['javascript'],
  },
  {
    id: 'react', num: '04',
    title: { en: 'React', hu: 'React' },
    summary: { en: 'Components, state, effects and routing for real single-page apps.', hu: 'Komponensek, állapot, effektek és útvonalkezelés valódi egyoldalas alkalmazásokhoz.' },
    lessons: [
      l('react-components', 'Components and JSX', 'Komponensek és JSX'),
      l('react-state-props', 'State and props', 'Állapot és props'),
      l('react-effects-data', 'Effects and loading data', 'Effektek és adatbetöltés', 20),
      l('react-forms', 'Forms in React', 'Űrlapok Reactben'),
      l('react-routing', 'Routing and app structure', 'Útvonalak és alkalmazásszerkezet'),
    ],
    project: { en: 'Task manager frontend', hu: 'Feladatkezelő frontend' },
    tracks: ['react'],
  },
  {
    id: 'spring', num: '05',
    title: { en: 'REST APIs with Spring Boot', hu: 'REST API-k Spring Boottal' },
    summary: { en: 'Java for the web, controllers, validation and a layered backend.', hu: 'Java a webhez, controllerek, validáció és rétegzett backend.' },
    lessons: [
      l('java-for-web', 'Java essentials for web developers', 'Java alapok webfejlesztőknek', 20),
      l('spring-boot-setup', 'Your first Spring Boot project', 'Az első Spring Boot projekted'),
      l('rest-controllers', 'Controllers and REST design', 'Controllerek és REST-tervezés'),
      l('validation-errors', 'Validation and error handling', 'Validáció és hibakezelés'),
      l('layered-architecture', 'Services and layered architecture', 'Service-ek és rétegzett architektúra'),
    ],
    project: { en: 'Task manager REST API', hu: 'Feladatkezelő REST API' },
    tracks: ['java', 'spring-boot'],
  },
  {
    id: 'data', num: '06',
    title: { en: 'Databases & JPA', hu: 'Adatbázisok és JPA' },
    summary: { en: 'SQL, schema design, JPA entities and safe migrations.', hu: 'SQL, sématervezés, JPA entitások és biztonságos migrációk.' },
    lessons: [
      l('sql-fundamentals', 'SQL fundamentals', 'SQL alapok', 20),
      l('schema-design', 'Schema design and relations', 'Sématervezés és kapcsolatok'),
      l('jpa-entities', 'JPA and Hibernate entities', 'JPA és Hibernate entitások', 20),
      l('flyway-migrations', 'Database migrations with Flyway', 'Adatbázis-migrációk Flywayjel'),
      l('query-performance', 'Queries and performance', 'Lekérdezések és teljesítmény'),
    ],
    project: { en: 'Booking system backend', hu: 'Időpontfoglaló rendszer backend' },
    tracks: ['sql'],
  },
  {
    id: 'security', num: '07',
    title: { en: 'Authentication & security', hu: 'Hitelesítés és biztonság' },
    summary: { en: 'Logins, roles, JWT and the mistakes attackers look for.', hu: 'Bejelentkezés, szerepkörök, JWT és a hibák, amelyeket a támadók keresnek.' },
    lessons: [
      l('authn-authz', 'Authentication vs authorization', 'Hitelesítés és jogosultságkezelés'),
      l('spring-security-jwt', 'Spring Security and JWT', 'Spring Security és JWT', 25),
      l('protecting-the-frontend', 'Protecting routes in React', 'Útvonalak védelme Reactben'),
      l('owasp-essentials', 'The OWASP essentials', 'OWASP alapok'),
    ],
    project: { en: 'Secure booking system with roles', hu: 'Biztonságos, szerepkörös időpontfoglaló' },
    tracks: ['security'],
  },
  {
    id: 'testing', num: '08',
    title: { en: 'Testing', hu: 'Tesztelés' },
    summary: { en: 'Unit, integration and end-to-end tests that catch real bugs.', hu: 'Unit-, integrációs és end-to-end tesztek, amelyek valódi hibákat fognak meg.' },
    lessons: [
      l('testing-pyramid', 'The testing pyramid', 'A tesztpiramis'),
      l('junit-unit-tests', 'Unit tests with JUnit', 'Unit tesztek JUnittal'),
      l('integration-tests', 'Integration tests with Testcontainers', 'Integrációs tesztek Testcontainersszel', 20),
      l('frontend-tests', 'Frontend tests with Vitest', 'Frontend tesztek Vitesttel'),
      l('e2e-playwright', 'End-to-end tests with Playwright', 'End-to-end tesztek Playwrighttal'),
    ],
    tracks: ['test-automation'],
  },
  {
    id: 'deploy', num: '09',
    title: { en: 'Docker, CI/CD & deployment', hu: 'Docker, CI/CD és élesítés' },
    summary: { en: 'Containers, pipelines and getting your app online.', hu: 'Konténerek, pipeline-ok és az alkalmazás élesítése.' },
    lessons: [
      l('docker-basics', 'Docker basics', 'Docker alapok'),
      l('docker-compose-stack', 'A full stack with Docker Compose', 'Teljes stack Docker Compose-zal'),
      l('ci-github-actions', 'CI with GitHub Actions', 'CI GitHub Actionsszel'),
      l('deploying-to-the-cloud', 'Deploying to the cloud', 'Élesítés a felhőben', 20),
      l('logs-monitoring', 'Logs and monitoring', 'Naplózás és monitorozás'),
    ],
    project: { en: 'Mini webshop, containerised and deployed', hu: 'Mini webshop konténerizálva és élesítve' },
    tracks: ['devops', 'linux'],
  },
  {
    id: 'capstone', num: '10',
    title: { en: 'Capstone & career', hu: 'Záróprojekt és karrier' },
    summary: { en: 'Build a customer portal end to end, then turn it into job offers.', hu: 'Építs ügyfélportált az elejétől a végéig, aztán váltsd állásajánlatokra.' },
    lessons: [
      l('capstone-plan', 'Planning the capstone', 'A záróprojekt megtervezése'),
      l('capstone-build', 'Building the customer portal', 'Az ügyfélportál megépítése', 30),
      l('portfolio-github', 'Portfolio and GitHub that get noticed', 'Portfólió és GitHub, amit észrevesznek'),
      l('landing-the-job', 'CV, interviews and your first job', 'Önéletrajz, interjúk és az első állás'),
    ],
    project: { en: 'Capstone: customer portal', hu: 'Záróprojekt: ügyfélportál' },
    tracks: [],
  },
];

