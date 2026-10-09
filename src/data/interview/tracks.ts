type L10n = Record<'en' | 'hu' | 'sk', string>;

export interface Track {
  id: string;
  /** a few letters for the card badge */
  short: string;
  title: L10n;
  text: L10n;
  tags: string[];
}

// kept free of Vite-only imports: the build-time SEO step (scripts/seo.ts) reads it too
export const tracks: Track[] = [
  {
    id: 'javascript',
    short: 'JS',
    title: { en: 'JavaScript', hu: 'JavaScript', sk: 'JavaScript' },
    text: {
      en: 'From hoisting and coercion to the event loop, memory leaks, security and production debugging.',
      hu: 'A hoistingtól és a type coerciontől az event loopig, a memóriaszivárgásig, a biztonságig és a production hibakeresésig.',
      sk: 'Od hoistingu a type coercion cez event loop až po úniky pamäte, bezpečnosť a debugging v produkcii.',
    },
    tags: ['ES2024', 'Async', 'DOM', 'Security'],
  },
  {
    id: 'java',
    short: 'JAVA',
    title: { en: 'Java', hu: 'Java', sk: 'Java' },
    text: {
      en: 'OOP, collections, equals/hashCode, concurrency, the JVM and GC, streams and modern Java 17–21.',
      hu: 'OOP, collectionök, equals/hashCode, konkurencia, JVM és GC, streamek és a modern Java 17–21.',
      sk: 'OOP, kolekcie, equals/hashCode, súbežnosť, JVM a GC, streamy a moderná Java 17–21.',
    },
    tags: ['Java 21', 'JVM', 'Concurrency'],
  },
  {
    id: 'spring-boot',
    short: 'SB',
    title: { en: 'Spring Boot', hu: 'Spring Boot', sk: 'Spring Boot' },
    text: {
      en: 'Dependency injection, auto-configuration, JPA and transactions, Spring Security, testing and production issues.',
      hu: 'Dependency injection, auto-configuration, JPA és tranzakciók, Spring Security, tesztelés és production hibák.',
      sk: 'Dependency injection, auto-configuration, JPA a transakcie, Spring Security, testovanie a problémy v produkcii.',
    },
    tags: ['Spring 6', 'JPA', 'Security'],
  },
  {
    id: 'react',
    short: 'RE',
    title: { en: 'React', hu: 'React', sk: 'React' },
    text: {
      en: 'Rendering, hooks and effects, memoisation, state management, Suspense, Server Components and testing.',
      hu: 'Renderelés, hookok és effectek, memoizáció, state management, Suspense, Server Components és tesztelés.',
      sk: 'Renderovanie, hooky a efekty, memoizácia, state management, Suspense, Server Components a testovanie.',
    },
    tags: ['React 19', 'Hooks', 'SSR'],
  },
  {
    id: 'angular',
    short: 'NG',
    title: { en: 'Angular', hu: 'Angular', sk: 'Angular' },
    text: {
      en: 'Components, DI, change detection and signals, RxJS, routing, forms, NgRx and performance.',
      hu: 'Komponensek, DI, change detection és signalok, RxJS, routing, formok, NgRx és teljesítmény.',
      sk: 'Komponenty, DI, change detection a signály, RxJS, routing, formuláre, NgRx a výkon.',
    },
    tags: ['Angular 17+', 'RxJS', 'Signals'],
  },
  {
    id: 'sql',
    short: 'SQL',
    title: { en: 'SQL', hu: 'SQL', sk: 'SQL' },
    text: {
      en: 'Joins, NULLs, window functions, indexes and query plans, transactions, isolation levels and schema design.',
      hu: 'JOIN-ok, NULL-ok, window functionök, indexek és query planek, tranzakciók, izolációs szintek és sématervezés.',
      sk: 'JOINy, NULL hodnoty, window funkcie, indexy a query plány, transakcie, úrovne izolácie a návrh schémy.',
    },
    tags: ['PostgreSQL', 'Indexes', 'Transactions'],
  },
  {
    id: 'devops',
    short: 'OPS',
    title: { en: 'DevOps', hu: 'DevOps', sk: 'DevOps' },
    text: {
      en: 'CI/CD, Docker, Kubernetes, Terraform, observability, deployment strategies and incident handling.',
      hu: 'CI/CD, Docker, Kubernetes, Terraform, observability, deployment stratégiák és incidenskezelés.',
      sk: 'CI/CD, Docker, Kubernetes, Terraform, observability, stratégie nasadenia a riešenie incidentov.',
    },
    tags: ['Docker', 'Kubernetes', 'Terraform'],
  },
  {
    id: 'linux',
    short: 'SH',
    title: { en: 'Linux', hu: 'Linux', sk: 'Linux' },
    text: {
      en: 'Permissions, processes and signals, bash, text processing, systemd, networking and troubleshooting.',
      hu: 'Jogosultságok, processzek és signalok, bash, szövegfeldolgozás, systemd, hálózat és hibaelhárítás.',
      sk: 'Oprávnenia, procesy a signály, bash, spracovanie textu, systemd, sieť a riešenie problémov.',
    },
    tags: ['Bash', 'systemd', 'Networking'],
  },
  {
    id: 'git',
    short: 'GIT',
    title: { en: 'Git', hu: 'Git', sk: 'Git' },
    text: {
      en: 'The object model, merge vs rebase, undoing changes, reflog recovery, bisect and branching strategies.',
      hu: 'Az objektummodell, merge és rebase, változások visszavonása, reflog, bisect és branching stratégiák.',
      sk: 'Objektový model, merge vs. rebase, vrátenie zmien, obnova cez reflog, bisect a stratégie vetvenia.',
    },
    tags: ['Rebase', 'Reflog', 'Workflows'],
  },
  {
    id: 'security',
    short: 'SEC',
    title: { en: 'Application Security', hu: 'Alkalmazásbiztonság', sk: 'Bezpečnosť aplikácií' },
    text: {
      en: 'OWASP Top 10, XSS, CSRF, injection, OAuth/OIDC and JWT, access control, CSP, SSRF and threat modelling.',
      hu: 'OWASP Top 10, XSS, CSRF, injection, OAuth/OIDC és JWT, jogosultságkezelés, CSP, SSRF és threat modeling.',
      sk: 'OWASP Top 10, XSS, CSRF, injection, OAuth/OIDC a JWT, riadenie prístupu, CSP, SSRF a threat modeling.',
    },
    tags: ['OWASP', 'OAuth', 'AppSec'],
  },
  {
    id: 'performance',
    short: 'PERF',
    title: { en: 'Performance Engineering', hu: 'Teljesítménytesztelés', sk: 'Výkonnostné inžinierstvo' },
    text: {
      en: 'Percentiles, load and soak tests, k6/JMeter/Gatling, bottlenecks, profiling, caching and capacity planning.',
      hu: 'Percentilisek, load és soak tesztek, k6/JMeter/Gatling, szűk keresztmetszetek, profilozás, cache és kapacitástervezés.',
      sk: 'Percentily, load a soak testy, k6/JMeter/Gatling, úzke miesta, profilovanie, cache a plánovanie kapacity.',
    },
    tags: ['k6', 'JMeter', 'Profiling'],
  },
  {
    id: 'test-automation',
    short: 'AUTO',
    title: { en: 'Test Automation', hu: 'Tesztautomatizálás', sk: 'Automatizácia testovania' },
    text: {
      en: 'Test strategy, Selenium, Playwright and Cypress, flaky tests, Page Objects, API and contract testing, CI.',
      hu: 'Tesztstratégia, Selenium, Playwright és Cypress, flaky tesztek, Page Object, API- és contract tesztelés, CI.',
      sk: 'Testovacia stratégia, Selenium, Playwright a Cypress, flaky testy, Page Objects, testovanie API a kontraktov, CI.',
    },
    tags: ['Playwright', 'Selenium', 'API'],
  },
  {
    id: 'manual-testing',
    short: 'MQA',
    title: { en: 'Manual Testing / QA', hu: 'Manuális tesztelés / QA', sk: 'Manuálne testovanie / QA' },
    text: {
      en: 'Test design techniques, exploratory testing, bug reports, severity vs priority, regression and agile QA.',
      hu: 'Teszttervezési technikák, exploratory testing, hibajegyek, severity és priority, regresszió és agilis QA.',
      sk: 'Techniky návrhu testov, exploratívne testovanie, hlásenia chýb, severity vs. priority, regresia a agilné QA.',
    },
    tags: ['ISTQB', 'Test design', 'Agile'],
  },
  {
    id: 'ai',
    short: 'AI',
    title: { en: 'AI / Machine Learning', hu: 'AI / gépi tanulás', sk: 'AI / strojové učenie' },
    text: {
      en: 'ML fundamentals and metrics, transformers, LLMs, embeddings, RAG, agents, evaluation and AI in production.',
      hu: 'ML alapok és metrikák, transformerek, LLM-ek, embeddingek, RAG, agentek, kiértékelés és AI élesben.',
      sk: 'Základy ML a metriky, transformery, LLM, embeddingy, RAG, agenti, evaluácia a AI v produkcii.',
    },
    tags: ['LLM', 'RAG', 'ML'],
  },
];
