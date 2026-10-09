import type { Lang } from './projects';
import type { FlowSpec, FlowNode } from '../components/course/visual/blocks';

/**
 * One "module map" per course module: how the pieces of that module fit together.
 * Shown on the course overview and at the top of each module's first lesson.
 */
type N = [id: string, en: string, hu: string, sk: string, kind?: FlowNode['kind'], subEn?: string, subHu?: string, subSk?: string, highlight?: boolean, col?: number];
type E = [from: string, to: string, en?: string, hu?: string, sk?: string, dashed?: boolean];
interface MapDef {
  dir?: 'LR' | 'TB';
  caption: [string, string, string];
  nodes: N[];
  edges: E[];
}

const MAPS: Record<string, MapDef> = {
  web: {
    caption: ['From typing a URL to a rendered page — and the tools you use to inspect every step.', 'Az URL beírásától a megjelenített oldalig — és az eszközök, amelyekkel minden lépést megvizsgálhatsz.', 'Od zadania URL po vykreslenú stránku – a nástroje, ktorými preskúmaš každý krok.'],
    nodes: [
      ['user', 'You', 'Te', 'Ty', 'user'],
      ['browser', 'Browser', 'Böngésző', 'Prehliadač', 'client', 'HTML · CSS · JS', 'HTML · CSS · JS', 'HTML · CSS · JS', true],
      ['dns', 'DNS', 'DNS', 'DNS', 'cloud', 'name → IP', 'név → IP', 'názov → IP'],
      ['server', 'Web server', 'Webszerver', 'Webový server', 'server', 'HTTP responses', 'HTTP-válaszok', 'HTTP odpovede', true],
      ['db', 'Database', 'Adatbázis', 'Databáza', 'db'],
      ['tools', 'IntelliJ · Git · DevTools', 'IntelliJ · Git · DevTools', 'IntelliJ · Git · DevTools', 'code', 'your toolkit', 'az eszköztárad', 'tvoja výbava'],
    ],
    edges: [['user', 'browser', 'URL', 'URL', 'URL'], ['browser', 'dns', 'lookup', 'lekérdezés', 'vyhľadanie'], ['browser', 'server', 'HTTP request', 'HTTP-kérés', 'HTTP požiadavka'], ['server', 'db', 'SQL', 'SQL', 'SQL'], ['tools', 'browser', 'inspect', 'vizsgálat', 'kontrola', true]],
  },
  'html-css': {
    caption: ['HTML gives the page its structure, CSS its look, and responsive rules adapt it to every screen.', 'A HTML adja az oldal szerkezetét, a CSS a kinézetét, a reszponzív szabályok pedig minden képernyőhöz igazítják.', 'HTML dáva stránke štruktúru, CSS jej vzhľad a responzívne pravidlá ju prispôsobia každej obrazovke.'],
    nodes: [
      ['html', 'HTML', 'HTML', 'HTML', 'file', 'semantic structure', 'szemantikus szerkezet', 'sémantická štruktúra', true],
      ['forms', 'Forms', 'Űrlapok', 'Formuláre', 'file', 'labels · validation', 'címkék · ellenőrzés', 'labely · validácia'],
      ['css', 'CSS', 'CSS', 'CSS', 'code', 'cascade · box model', 'kaszkád · dobozmodell', 'kaskáda · box model', true],
      ['layout', 'Flexbox & Grid', 'Flexbox és Grid', 'Flexbox a Grid', 'code'],
      ['rwd', 'Media queries', 'Media query-k', 'Media queries', 'code', 'mobile first', 'mobile first', 'mobile first'],
      ['page', 'Accessible, responsive page', 'Akadálymentes, reszponzív oldal', 'Prístupná, responzívna stránka', 'client'],
    ],
    edges: [['html', 'css', 'styled by', 'stílusozza', 'štýluje ho'], ['forms', 'css'], ['css', 'layout'], ['css', 'rwd'], ['layout', 'page'], ['rwd', 'page']],
  },
  javascript: {
    caption: ['JavaScript adds behaviour: data and functions, the DOM, events and async calls to an API — then TypeScript adds types.', 'A JavaScript viselkedést ad: adatok és függvények, DOM, események és aszinkron API-hívások — aztán a TypeScript típusokat ad hozzá.', 'JavaScript pridáva správanie: dáta a funkcie, DOM, udalosti a asynchrónne volania API – a TypeScript k tomu pridá typy.'],
    nodes: [
      ['values', 'Values & types', 'Értékek és típusok', 'Hodnoty a typy', 'code'],
      ['fns', 'Functions & closures', 'Függvények és closure-ök', 'Funkcie a closures', 'code'],
      ['data', 'Arrays & objects', 'Tömbök és objektumok', 'Polia a objekty', 'code'],
      ['dom', 'DOM & events', 'DOM és események', 'DOM a udalosti', 'client', 'update the page', 'az oldal frissítése', 'aktualizácia stránky', true],
      ['async', 'fetch & async/await', 'fetch és async/await', 'fetch a async/await', 'cloud', 'talk to an API', 'kommunikáció egy API-val', 'komunikácia s API', true],
      ['ts', 'TypeScript', 'TypeScript', 'TypeScript', 'code', 'types catch bugs early', 'a típusok korán elkapják a hibákat', 'typy zachytia chyby včas'],
    ],
    edges: [['values', 'data'], ['fns', 'data'], ['data', 'dom'], ['data', 'async'], ['dom', 'ts'], ['async', 'ts']],
  },
  react: {
    caption: ['A React app is a tree of components: state flows down as props, effects load data, the router picks the screen.', 'Egy React app komponensek fája: az állapot propként lefelé áramlik, az effectek adatot töltenek, a router választja a képernyőt.', 'React aplikácia je strom komponentov: stav tečie nadol ako props, efekty načítavajú dáta, router vyberá obrazovku.'],
    dir: 'TB',
    nodes: [
      ['router', 'Router', 'Router', 'Router', 'client', '/tasks · /tasks/:id', '/tasks · /tasks/:id', '/tasks · /tasks/:id'],
      ['page', 'TasksPage', 'TasksPage', 'TasksPage', 'code', 'state + useEffect', 'állapot + useEffect', 'stav + useEffect', true],
      ['api', 'REST API', 'REST API', 'REST API', 'server'],
      ['form', 'TaskForm', 'TaskForm', 'TaskForm', 'code', 'controlled inputs', 'kontrollált mezők', 'kontrolované polia'],
      ['list', 'TaskList', 'TaskList', 'TaskList', 'code', 'props: tasks', 'props: tasks', 'props: tasks'],
      ['item', 'TaskItem', 'TaskItem', 'TaskItem', 'code', 'props: task, onToggle', 'props: task, onToggle', 'props: task, onToggle'],
    ],
    edges: [['router', 'page'], ['page', 'api', 'fetch', 'fetch', 'fetch', true], ['page', 'form', 'onSubmit', 'onSubmit', 'onSubmit'], ['page', 'list', 'tasks', 'tasks', 'tasks'], ['list', 'item']],
  },
  spring: {
    caption: ['A Spring Boot API in layers: controllers speak HTTP, services hold the rules, DTOs and validation guard the edges.', 'Egy rétegzett Spring Boot API: a controllerek HTTP-t beszélnek, a service-ek tartják a szabályokat, a DTO-k és az ellenőrzés védik a határokat.', 'Spring Boot API vo vrstvách: controllery hovoria HTTP, služby držia pravidlá, DTO a validácia strážia hranice.'],
    nodes: [
      ['client', 'React app', 'React app', 'React aplikácia', 'client'],
      ['ctrl', 'Controller', 'Controller', 'Controller', 'server', '@RestController · DTO · @Valid', '@RestController · DTO · @Valid', '@RestController · DTO · @Valid', true],
      ['svc', 'Service', 'Service', 'Service', 'service', 'business rules', 'üzleti szabályok', 'biznis pravidlá', true],
      ['repo', 'Repository', 'Repository', 'Repository', 'service', 'data access', 'adatelérés', 'prístup k dátam'],
      ['err', '@RestControllerAdvice', '@RestControllerAdvice', '@RestControllerAdvice', 'code', 'errors → 4xx JSON', 'hibák → 4xx JSON', 'chyby → 4xx JSON'],
    ],
    edges: [['client', 'ctrl', 'JSON', 'JSON', 'JSON'], ['ctrl', 'svc'], ['svc', 'repo'], ['ctrl', 'err', 'exceptions', 'kivételek', 'výnimky', true]],
  },
  data: {
    caption: ['Entities map to tables through JPA; Flyway versions the schema; indexes keep queries fast.', 'Az entitások JPA-n keresztül táblákra képeződnek; a Flyway verziózza a sémát; az indexek gyorsan tartják a lekérdezéseket.', 'Entity sa cez JPA mapujú na tabuľky; Flyway verziuje schému; indexy udržia dopyty rýchle.'],
    nodes: [
      ['svc', 'Service', 'Service', 'Service', 'service'],
      ['repo', 'Spring Data repository', 'Spring Data repository', 'Spring Data repository', 'service', 'findByOwner(…)', 'findByOwner(…)', 'findByOwner(…)'],
      ['jpa', 'JPA / Hibernate', 'JPA / Hibernate', 'JPA / Hibernate', 'code', '@Entity → SQL', '@Entity → SQL', '@Entity → SQL', true],
      ['db', 'PostgreSQL', 'PostgreSQL', 'PostgreSQL', 'db', 'tables · keys · indexes', 'táblák · kulcsok · indexek', 'tabuľky · kľúče · indexy', true],
      ['fly', 'Flyway', 'Flyway', 'Flyway', 'file', 'V1__init.sql …', 'V1__init.sql …', 'V1__init.sql …', false, 2],
    ],
    edges: [['svc', 'repo'], ['repo', 'jpa'], ['jpa', 'db', 'SQL', 'SQL', 'SQL'], ['fly', 'db', 'migrates', 'migrál', 'migruje', true]],
  },
  security: {
    caption: ['Log in once, get a signed token, send it with every request; the server checks who you are and what you may do.', 'Egyszer belépsz, kapsz egy aláírt tokent, és minden kéréssel elküldöd; a szerver ellenőrzi, ki vagy és mit tehetsz.', 'Raz sa prihlásiš, dostaneš podpísaný token a posielaš ho s každou požiadavkou; server overí, kto si a čo smieš.'],
    nodes: [
      ['user', 'User', 'Felhasználó', 'Používateľ', 'user'],
      ['spa', 'React app', 'React app', 'React aplikácia', 'client', 'protected routes', 'védett útvonalak', 'chránené routy'],
      ['auth', 'Auth endpoint', 'Auth végpont', 'Auth endpoint', 'service', 'BCrypt · issue JWT', 'BCrypt · JWT kiadása', 'BCrypt · vydanie JWT'],
      ['filter', 'Security filter chain', 'Security filter lánc', 'Security filter chain', 'server', 'JWT check', 'JWT-ellenőrzés', 'kontrola JWT', true],
      ['api', 'Protected API', 'Védett API', 'Chránené API', 'service', '@PreAuthorize', '@PreAuthorize', '@PreAuthorize', true],
    ],
    edges: [['user', 'spa', 'login', 'belépés', 'prihlásenie'], ['spa', 'auth', 'credentials', 'adatok', 'prihlasovacie údaje'], ['auth', 'spa', 'token', 'token', 'token', true], ['spa', 'filter', 'Bearer token', 'Bearer token', 'Bearer token'], ['filter', 'api', 'authorised', 'engedélyezve', 'autorizované']],
  },
  testing: {
    caption: ['Many fast unit tests, fewer integration tests, a handful of end-to-end tests — all run automatically.', 'Sok gyors unit teszt, kevesebb integrációs teszt, néhány end-to-end teszt — mind automatikusan fut.', 'Veľa rýchlych unit testov, menej integračných, zopár end-to-end testov – všetky bežia automaticky.'],
    nodes: [
      ['code', 'Your code', 'A kódod', 'Tvoj kód', 'code'],
      ['unit', 'Unit tests', 'Unit tesztek', 'Unit testy', 'code', 'JUnit · Vitest', 'JUnit · Vitest', 'JUnit · Vitest', true],
      ['int', 'Integration tests', 'Integrációs tesztek', 'Integračné testy', 'server', 'Testcontainers', 'Testcontainers', 'Testcontainers'],
      ['e2e', 'E2E tests', 'E2E tesztek', 'E2E testy', 'client', 'Playwright', 'Playwright', 'Playwright'],
      ['ci', 'CI', 'CI', 'CI', 'cloud', 'green before merge', 'zöld merge előtt', 'zelené pred merge', true],
    ],
    edges: [['code', 'unit', 'many', 'sok', 'veľa'], ['code', 'int', 'some', 'néhány', 'niekoľko'], ['code', 'e2e', 'few', 'kevés', 'málo'], ['unit', 'ci'], ['int', 'ci'], ['e2e', 'ci']],
  },
  deploy: {
    caption: ['Containerise the stack, let CI test and build every push, deploy the image, then watch logs and metrics.', 'Konténerizáld a stacket, a CI teszteljen és buildeljen minden pusht, élesítsd az image-et, aztán figyeld a naplókat és metrikákat.', 'Zabaľ stack do kontajnerov, nech CI otestuje a zbuilduje každý push, nasaď image a sleduj logy a metriky.'],
    nodes: [
      ['ci', 'GitHub Actions', 'GitHub Actions', 'GitHub Actions', 'cloud', 'every git push: test · build', 'minden git push: teszt · build', 'každý git push: test · build', true],
      ['img', 'Docker image', 'Docker image', 'Docker image', 'file', 'registry', 'registry', 'registry'],
      ['prod', 'Cloud', 'Felhő', 'Cloud', 'server', 'compose / PaaS', 'compose / PaaS', 'compose / PaaS', true],
      ['obs', 'Logs & metrics', 'Naplók és metrikák', 'Logy a metriky', 'queue', 'alerts', 'riasztások', 'alerty'],
    ],
    edges: [['ci', 'img', 'push', 'push', 'push'], ['img', 'prod', 'deploy', 'élesítés', 'nasadenie'], ['prod', 'obs']],
  },
  capstone: {
    caption: ['Plan it, build the customer portal end to end, publish it — and turn it into interviews.', 'Tervezd meg, építsd meg az ügyfélportált az elejétől a végéig, publikáld — és válts belőle interjúkat.', 'Naplánuj ho, postav zákaznícky portál od začiatku do konca, zverejni ho – a premeň ho na pohovory.'],
    nodes: [
      ['plan', 'Plan', 'Terv', 'Plán', 'file', 'stories · MVP', 'storyk · MVP', 'stories · MVP'],
      ['fe', 'React portal', 'React portál', 'React portál', 'client', 'orders · tickets', 'rendelések · jegyek', 'objednávky · tikety', true],
      ['api', 'Spring Boot API', 'Spring Boot API', 'Spring Boot API', 'server', 'JWT · REST', 'JWT · REST', 'JWT · REST', true],
      ['db', 'PostgreSQL', 'PostgreSQL', 'PostgreSQL', 'db'],
      ['ship', 'CI/CD + cloud', 'CI/CD + felhő', 'CI/CD + cloud', 'cloud'],
      ['job', 'Portfolio → job', 'Portfólió → állás', 'Portfólio → práca', 'user', 'README · CV · interviews', 'README · CV · interjúk', 'README · CV · pohovory'],
    ],
    edges: [['plan', 'fe'], ['plan', 'api'], ['api', 'db', 'SQL', 'SQL', 'SQL'], ['fe', 'ship'], ['api', 'ship'], ['ship', 'job']],
  },
};

export function moduleMap(id: string, lang: Lang): FlowSpec | null {
  const m = MAPS[id];
  if (!m) return null;
  const L = ({ en: 0, hu: 1, sk: 2 } as const)[lang];
  return {
    type: 'flow',
    direction: m.dir ?? 'LR',
    caption: m.caption[L],
    nodes: m.nodes.map(([id, en, hu, sk, kind, se, sh, ss, highlight, col]) => ({ id, label: [en, hu, sk][L], kind, sub: [se, sh, ss][L] || undefined, highlight, col })),
    edges: m.edges.map(([from, to, en, hu, sk, dashed]) => ({ from, to, label: [en, hu, sk][L] || undefined, dashed })),
  };
}
