import type { Lang } from './projects';
import type { FlowSpec, FlowNode } from '../components/course/visual/blocks';

/**
 * One "module map" per course module: how the pieces of that module fit together.
 * Shown on the course overview and at the top of each module's first lesson.
 */
type N = [id: string, en: string, hu: string, kind?: FlowNode['kind'], subEn?: string, subHu?: string, highlight?: boolean, col?: number];
type E = [from: string, to: string, en?: string, hu?: string, dashed?: boolean];
interface MapDef {
  dir?: 'LR' | 'TB';
  caption: [string, string];
  nodes: N[];
  edges: E[];
}

const MAPS: Record<string, MapDef> = {
  web: {
    caption: ['From typing a URL to a rendered page — and the tools you use to inspect every step.', 'Az URL beírásától a megjelenített oldalig — és az eszközök, amelyekkel minden lépést megvizsgálhatsz.'],
    nodes: [
      ['user', 'You', 'Te', 'user'],
      ['browser', 'Browser', 'Böngésző', 'client', 'HTML · CSS · JS', 'HTML · CSS · JS', true],
      ['dns', 'DNS', 'DNS', 'cloud', 'name → IP', 'név → IP'],
      ['server', 'Web server', 'Webszerver', 'server', 'HTTP responses', 'HTTP-válaszok', true],
      ['db', 'Database', 'Adatbázis', 'db'],
      ['tools', 'IntelliJ · Git · DevTools', 'IntelliJ · Git · DevTools', 'code', 'your toolkit', 'az eszköztárad'],
    ],
    edges: [['user', 'browser', 'URL', 'URL'], ['browser', 'dns', 'lookup', 'lekérdezés'], ['browser', 'server', 'HTTP request', 'HTTP-kérés'], ['server', 'db', 'SQL', 'SQL'], ['tools', 'browser', 'inspect', 'vizsgálat', true]],
  },
  'html-css': {
    caption: ['HTML gives the page its structure, CSS its look, and responsive rules adapt it to every screen.', 'A HTML adja az oldal szerkezetét, a CSS a kinézetét, a reszponzív szabályok pedig minden képernyőhöz igazítják.'],
    nodes: [
      ['html', 'HTML', 'HTML', 'file', 'semantic structure', 'szemantikus szerkezet', true],
      ['forms', 'Forms', 'Űrlapok', 'file', 'labels · validation', 'címkék · ellenőrzés'],
      ['css', 'CSS', 'CSS', 'code', 'cascade · box model', 'kaszkád · dobozmodell', true],
      ['layout', 'Flexbox & Grid', 'Flexbox és Grid', 'code'],
      ['rwd', 'Media queries', 'Media query-k', 'code', 'mobile first', 'mobile first'],
      ['page', 'Accessible, responsive page', 'Akadálymentes, reszponzív oldal', 'client'],
    ],
    edges: [['html', 'css', 'styled by', 'stílusozza'], ['forms', 'css'], ['css', 'layout'], ['css', 'rwd'], ['layout', 'page'], ['rwd', 'page']],
  },
  javascript: {
    caption: ['JavaScript adds behaviour: data and functions, the DOM, events and async calls to an API — then TypeScript adds types.', 'A JavaScript viselkedést ad: adatok és függvények, DOM, események és aszinkron API-hívások — aztán a TypeScript típusokat ad hozzá.'],
    nodes: [
      ['values', 'Values & types', 'Értékek és típusok', 'code'],
      ['fns', 'Functions & closures', 'Függvények és closure-ök', 'code'],
      ['data', 'Arrays & objects', 'Tömbök és objektumok', 'code'],
      ['dom', 'DOM & events', 'DOM és események', 'client', 'update the page', 'az oldal frissítése', true],
      ['async', 'fetch & async/await', 'fetch és async/await', 'cloud', 'talk to an API', 'kommunikáció egy API-val', true],
      ['ts', 'TypeScript', 'TypeScript', 'code', 'types catch bugs early', 'a típusok korán elkapják a hibákat'],
    ],
    edges: [['values', 'data'], ['fns', 'data'], ['data', 'dom'], ['data', 'async'], ['dom', 'ts'], ['async', 'ts']],
  },
  react: {
    caption: ['A React app is a tree of components: state flows down as props, effects load data, the router picks the screen.', 'Egy React app komponensek fája: az állapot propként lefelé áramlik, az effectek adatot töltenek, a router választja a képernyőt.'],
    dir: 'TB',
    nodes: [
      ['router', 'Router', 'Router', 'client', '/tasks · /tasks/:id', '/tasks · /tasks/:id'],
      ['page', 'TasksPage', 'TasksPage', 'code', 'state + useEffect', 'állapot + useEffect', true],
      ['api', 'REST API', 'REST API', 'server'],
      ['form', 'TaskForm', 'TaskForm', 'code', 'controlled inputs', 'kontrollált mezők'],
      ['list', 'TaskList', 'TaskList', 'code', 'props: tasks', 'props: tasks'],
      ['item', 'TaskItem', 'TaskItem', 'code', 'props: task, onToggle', 'props: task, onToggle'],
    ],
    edges: [['router', 'page'], ['page', 'api', 'fetch', 'fetch', true], ['page', 'form', 'onSubmit', 'onSubmit'], ['page', 'list', 'tasks', 'tasks'], ['list', 'item']],
  },
  spring: {
    caption: ['A Spring Boot API in layers: controllers speak HTTP, services hold the rules, DTOs and validation guard the edges.', 'Egy rétegzett Spring Boot API: a controllerek HTTP-t beszélnek, a service-ek tartják a szabályokat, a DTO-k és az ellenőrzés védik a határokat.'],
    nodes: [
      ['client', 'React app', 'React app', 'client'],
      ['ctrl', 'Controller', 'Controller', 'server', '@RestController · DTO · @Valid', '@RestController · DTO · @Valid', true],
      ['svc', 'Service', 'Service', 'service', 'business rules', 'üzleti szabályok', true],
      ['repo', 'Repository', 'Repository', 'service', 'data access', 'adatelérés'],
      ['err', '@RestControllerAdvice', '@RestControllerAdvice', 'code', 'errors → 4xx JSON', 'hibák → 4xx JSON'],
    ],
    edges: [['client', 'ctrl', 'JSON', 'JSON'], ['ctrl', 'svc'], ['svc', 'repo'], ['ctrl', 'err', 'exceptions', 'kivételek', true]],
  },
  data: {
    caption: ['Entities map to tables through JPA; Flyway versions the schema; indexes keep queries fast.', 'Az entitások JPA-n keresztül táblákra képeződnek; a Flyway verziózza a sémát; az indexek gyorsan tartják a lekérdezéseket.'],
    nodes: [
      ['svc', 'Service', 'Service', 'service'],
      ['repo', 'Spring Data repository', 'Spring Data repository', 'service', 'findByOwner(…)', 'findByOwner(…)'],
      ['jpa', 'JPA / Hibernate', 'JPA / Hibernate', 'code', '@Entity → SQL', '@Entity → SQL', true],
      ['db', 'PostgreSQL', 'PostgreSQL', 'db', 'tables · keys · indexes', 'táblák · kulcsok · indexek', true],
      ['fly', 'Flyway', 'Flyway', 'file', 'V1__init.sql …', 'V1__init.sql …', false, 2],
    ],
    edges: [['svc', 'repo'], ['repo', 'jpa'], ['jpa', 'db', 'SQL', 'SQL'], ['fly', 'db', 'migrates', 'migrál', true]],
  },
  security: {
    caption: ['Log in once, get a signed token, send it with every request; the server checks who you are and what you may do.', 'Egyszer belépsz, kapsz egy aláírt tokent, és minden kéréssel elküldöd; a szerver ellenőrzi, ki vagy és mit tehetsz.'],
    nodes: [
      ['user', 'User', 'Felhasználó', 'user'],
      ['spa', 'React app', 'React app', 'client', 'protected routes', 'védett útvonalak'],
      ['auth', 'Auth endpoint', 'Auth végpont', 'service', 'BCrypt · issue JWT', 'BCrypt · JWT kiadása'],
      ['filter', 'Security filter chain', 'Security filter lánc', 'server', 'JWT check', 'JWT-ellenőrzés', true],
      ['api', 'Protected API', 'Védett API', 'service', '@PreAuthorize', '@PreAuthorize', true],
    ],
    edges: [['user', 'spa', 'login', 'belépés'], ['spa', 'auth', 'credentials', 'adatok'], ['auth', 'spa', 'token', 'token', true], ['spa', 'filter', 'Bearer token', 'Bearer token'], ['filter', 'api', 'authorised', 'engedélyezve']],
  },
  testing: {
    caption: ['Many fast unit tests, fewer integration tests, a handful of end-to-end tests — all run automatically.', 'Sok gyors unit teszt, kevesebb integrációs teszt, néhány end-to-end teszt — mind automatikusan fut.'],
    nodes: [
      ['code', 'Your code', 'A kódod', 'code'],
      ['unit', 'Unit tests', 'Unit tesztek', 'code', 'JUnit · Vitest', 'JUnit · Vitest', true],
      ['int', 'Integration tests', 'Integrációs tesztek', 'server', 'Testcontainers', 'Testcontainers'],
      ['e2e', 'E2E tests', 'E2E tesztek', 'client', 'Playwright', 'Playwright'],
      ['ci', 'CI', 'CI', 'cloud', 'green before merge', 'zöld merge előtt', true],
    ],
    edges: [['code', 'unit', 'many', 'sok'], ['code', 'int', 'some', 'néhány'], ['code', 'e2e', 'few', 'kevés'], ['unit', 'ci'], ['int', 'ci'], ['e2e', 'ci']],
  },
  deploy: {
    caption: ['Containerise the stack, let CI test and build every push, deploy the image, then watch logs and metrics.', 'Konténerizáld a stacket, a CI teszteljen és buildeljen minden pusht, élesítsd az image-et, aztán figyeld a naplókat és metrikákat.'],
    nodes: [
      ['ci', 'GitHub Actions', 'GitHub Actions', 'cloud', 'every git push: test · build', 'minden git push: teszt · build', true],
      ['img', 'Docker image', 'Docker image', 'file', 'registry', 'registry'],
      ['prod', 'Cloud', 'Felhő', 'server', 'compose / PaaS', 'compose / PaaS', true],
      ['obs', 'Logs & metrics', 'Naplók és metrikák', 'queue', 'alerts', 'riasztások'],
    ],
    edges: [['ci', 'img', 'push', 'push'], ['img', 'prod', 'deploy', 'élesítés'], ['prod', 'obs']],
  },
  capstone: {
    caption: ['Plan it, build the customer portal end to end, publish it — and turn it into interviews.', 'Tervezd meg, építsd meg az ügyfélportált az elejétől a végéig, publikáld — és válts belőle interjúkat.'],
    nodes: [
      ['plan', 'Plan', 'Terv', 'file', 'stories · MVP', 'storyk · MVP'],
      ['fe', 'React portal', 'React portál', 'client', 'orders · tickets', 'rendelések · jegyek', true],
      ['api', 'Spring Boot API', 'Spring Boot API', 'server', 'JWT · REST', 'JWT · REST', true],
      ['db', 'PostgreSQL', 'PostgreSQL', 'db'],
      ['ship', 'CI/CD + cloud', 'CI/CD + felhő', 'cloud'],
      ['job', 'Portfolio → job', 'Portfólió → állás', 'user', 'README · CV · interviews', 'README · CV · interjúk'],
    ],
    edges: [['plan', 'fe'], ['plan', 'api'], ['api', 'db', 'SQL', 'SQL'], ['fe', 'ship'], ['api', 'ship'], ['ship', 'job']],
  },
};

export function moduleMap(id: string, lang: Lang): FlowSpec | null {
  const m = MAPS[id];
  if (!m) return null;
  const L = lang === 'hu' ? 1 : 0;
  return {
    type: 'flow',
    direction: m.dir ?? 'LR',
    caption: m.caption[L],
    nodes: m.nodes.map(([id, en, hu, kind, se, sh, highlight, col]) => ({ id, label: L ? hu : en, kind, sub: (L ? sh : se) || undefined, highlight, col })),
    edges: m.edges.map(([from, to, en, hu, dashed]) => ({ from, to, label: (L ? hu : en) || undefined, dashed })),
  };
}
