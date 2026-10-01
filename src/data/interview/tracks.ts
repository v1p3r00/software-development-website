type L10n = Record<'en' | 'hu', string>;

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
    title: { en: 'JavaScript', hu: 'JavaScript' },
    text: {
      en: 'From hoisting and coercion to the event loop, memory leaks, security and production debugging.',
      hu: 'A hoistingtól és a type coerciontől az event loopig, a memóriaszivárgásig, a biztonságig és a production hibakeresésig.',
    },
    tags: ['ES2024', 'Async', 'DOM', 'Security'],
  },
  {
    id: 'java',
    short: 'JAVA',
    title: { en: 'Java', hu: 'Java' },
    text: {
      en: 'OOP, collections, equals/hashCode, concurrency, the JVM and GC, streams and modern Java 17–21.',
      hu: 'OOP, collectionök, equals/hashCode, konkurencia, JVM és GC, streamek és a modern Java 17–21.',
    },
    tags: ['Java 21', 'JVM', 'Concurrency'],
  },
  {
    id: 'spring-boot',
    short: 'SB',
    title: { en: 'Spring Boot', hu: 'Spring Boot' },
    text: {
      en: 'Dependency injection, auto-configuration, JPA and transactions, Spring Security, testing and production issues.',
      hu: 'Dependency injection, auto-configuration, JPA és tranzakciók, Spring Security, tesztelés és production hibák.',
    },
    tags: ['Spring 6', 'JPA', 'Security'],
  },
  {
    id: 'react',
    short: 'RE',
    title: { en: 'React', hu: 'React' },
    text: {
      en: 'Rendering, hooks and effects, memoisation, state management, Suspense, Server Components and testing.',
      hu: 'Renderelés, hookok és effectek, memoizáció, state management, Suspense, Server Components és tesztelés.',
    },
    tags: ['React 19', 'Hooks', 'SSR'],
  },
  {
    id: 'angular',
    short: 'NG',
    title: { en: 'Angular', hu: 'Angular' },
    text: {
      en: 'Components, DI, change detection and signals, RxJS, routing, forms, NgRx and performance.',
      hu: 'Komponensek, DI, change detection és signalok, RxJS, routing, formok, NgRx és teljesítmény.',
    },
    tags: ['Angular 17+', 'RxJS', 'Signals'],
  },
  {
    id: 'sql',
    short: 'SQL',
    title: { en: 'SQL', hu: 'SQL' },
    text: {
      en: 'Joins, NULLs, window functions, indexes and query plans, transactions, isolation levels and schema design.',
      hu: 'JOIN-ok, NULL-ok, window functionök, indexek és query planek, tranzakciók, izolációs szintek és sématervezés.',
    },
    tags: ['PostgreSQL', 'Indexes', 'Transactions'],
  },
  {
    id: 'devops',
    short: 'OPS',
    title: { en: 'DevOps', hu: 'DevOps' },
    text: {
      en: 'CI/CD, Docker, Kubernetes, Terraform, observability, deployment strategies and incident handling.',
      hu: 'CI/CD, Docker, Kubernetes, Terraform, observability, deployment stratégiák és incidenskezelés.',
    },
    tags: ['Docker', 'Kubernetes', 'Terraform'],
  },
  {
    id: 'linux',
    short: 'SH',
    title: { en: 'Linux', hu: 'Linux' },
    text: {
      en: 'Permissions, processes and signals, bash, text processing, systemd, networking and troubleshooting.',
      hu: 'Jogosultságok, processzek és signalok, bash, szövegfeldolgozás, systemd, hálózat és hibaelhárítás.',
    },
    tags: ['Bash', 'systemd', 'Networking'],
  },
  {
    id: 'git',
    short: 'GIT',
    title: { en: 'Git', hu: 'Git' },
    text: {
      en: 'The object model, merge vs rebase, undoing changes, reflog recovery, bisect and branching strategies.',
      hu: 'Az objektummodell, merge és rebase, változások visszavonása, reflog, bisect és branching stratégiák.',
    },
    tags: ['Rebase', 'Reflog', 'Workflows'],
  },
  {
    id: 'security',
    short: 'SEC',
    title: { en: 'Application Security', hu: 'Alkalmazásbiztonság' },
    text: {
      en: 'OWASP Top 10, XSS, CSRF, injection, OAuth/OIDC and JWT, access control, CSP, SSRF and threat modelling.',
      hu: 'OWASP Top 10, XSS, CSRF, injection, OAuth/OIDC és JWT, jogosultságkezelés, CSP, SSRF és threat modeling.',
    },
    tags: ['OWASP', 'OAuth', 'AppSec'],
  },
  {
    id: 'performance',
    short: 'PERF',
    title: { en: 'Performance Engineering', hu: 'Teljesítménytesztelés' },
    text: {
      en: 'Percentiles, load and soak tests, k6/JMeter/Gatling, bottlenecks, profiling, caching and capacity planning.',
      hu: 'Percentilisek, load és soak tesztek, k6/JMeter/Gatling, szűk keresztmetszetek, profilozás, cache és kapacitástervezés.',
    },
    tags: ['k6', 'JMeter', 'Profiling'],
  },
  {
    id: 'test-automation',
    short: 'AUTO',
    title: { en: 'Test Automation', hu: 'Tesztautomatizálás' },
    text: {
      en: 'Test strategy, Selenium, Playwright and Cypress, flaky tests, Page Objects, API and contract testing, CI.',
      hu: 'Tesztstratégia, Selenium, Playwright és Cypress, flaky tesztek, Page Object, API- és contract tesztelés, CI.',
    },
    tags: ['Playwright', 'Selenium', 'API'],
  },
  {
    id: 'manual-testing',
    short: 'MQA',
    title: { en: 'Manual Testing / QA', hu: 'Manuális tesztelés / QA' },
    text: {
      en: 'Test design techniques, exploratory testing, bug reports, severity vs priority, regression and agile QA.',
      hu: 'Teszttervezési technikák, exploratory testing, hibajegyek, severity és priority, regresszió és agilis QA.',
    },
    tags: ['ISTQB', 'Test design', 'Agile'],
  },
  {
    id: 'ai',
    short: 'AI',
    title: { en: 'AI / Machine Learning', hu: 'AI / gépi tanulás' },
    text: {
      en: 'ML fundamentals and metrics, transformers, LLMs, embeddings, RAG, agents, evaluation and AI in production.',
      hu: 'ML alapok és metrikák, transformerek, LLM-ek, embeddingek, RAG, agentek, kiértékelés és AI élesben.',
    },
    tags: ['LLM', 'RAG', 'ML'],
  },
];
