import type { Lang } from '../../data/projects';
import { accents, emptyEntry, uid } from './model';
import type { Cv, Entry, Section, SectionKind } from './model';

const e = (fields: Partial<Entry>): Entry => ({ ...emptyEntry(), ...fields });
const s = (kind: SectionKind, items: Entry[] = [], text = ''): Section => ({ id: uid(), kind, title: '', text, items });

/** a fictional, complete CV so the templates have something to show on the first visit */
export function exampleCv(lang: Lang): Cv {
  const hu = lang === 'hu';
  const sk = lang === 'sk';
  return {
    version: 1,
    personal: {
      name: hu ? 'Kovács Anna' : sk ? 'Jana Nováková' : 'Anna Kovács',
      headline: hu ? 'Senior frontend fejlesztő' : sk ? 'Senior frontend vývojárka' : 'Senior Frontend Developer',
      email: sk ? 'jana.novakova@example.com' : 'anna.kovacs@example.com',
      phone: sk ? '+421 905 123 456' : '+36 30 123 4567',
      location: hu ? 'Budapest' : sk ? 'Bratislava' : 'Budapest, Hungary',
      photo: '',
      links: [
        { id: uid(), label: 'LinkedIn', url: sk ? 'linkedin.com/in/jananovakova' : 'linkedin.com/in/annakovacs' },
        { id: uid(), label: 'GitHub', url: sk ? 'github.com/jananovakova' : 'github.com/annakovacs' },
      ],
    },
    sections: [
      s(
        'summary',
        [],
        hu
          ? 'Frontend fejlesztő 7 év tapasztalattal adatintenzív webalkalmazások fejlesztésében React és TypeScript alapon, főként pénzügyi ügyfeleknek. Vezettem egy 40 000 ügyfél által használt felület újraírását, és szívesen mentorálok junior fejlesztőket. Olyan termékcsapatot keresek, ahol a teljesítmény és a felhasználói élmény egyformán számít.'
          : sk
            ? 'Frontend vývojárka so 7 rokmi skúseností s vývojom webových aplikácií pracujúcich s veľkým objemom dát v React a TypeScript, prevažne pre klientov z finančného sektora. Viedla som prestavbu klientskeho rozhrania, ktoré používa 40 000 zákazníkov, a rada mentorujem juniorných vývojárov. Hľadám produktový tím, v ktorom výkon a použiteľnosť majú rovnakú váhu.'
            : 'Frontend developer with 7 years of experience building data-heavy web applications in React and TypeScript, mostly for financial clients. Led the rebuild of a dashboard used by 40,000 customers and enjoy mentoring junior developers. Looking for a product team where performance and usability matter equally.',
      ),
      s('experience', [
        e({
          title: hu ? 'Senior frontend fejlesztő' : sk ? 'Senior frontend vývojárka' : 'Senior Frontend Developer',
          subtitle: 'Northbank Digital',
          place: sk ? 'Bratislava' : 'Budapest',
          start: hu ? '2021/03' : '03/2021',
          current: true,
          description: hu
            ? '- Vezettem az ügyfélportál React-alapú újraírását, 40 000 aktív felhasználóval\n- 45%-kal csökkentettem a betöltési időt code splittinggel és cache-eléssel\n- Bevezettem a vizuális regressziós teszteket, a UI-hibák száma 60%-kal esett\n- 3 junior fejlesztőt mentoráltam, kettő azóta mid-level'
            : sk
              ? '- Viedla som prestavbu zákazníckeho portálu v Reacte, ktorý používa 40 000 aktívnych zákazníkov\n- Vďaka code splittingu a lepšiemu cachovaniu som skrátila čas načítania o 45 %\n- Zaviedla som vizuálne regresné testy, chyby v UI v produkcii klesli o 60 %\n- Mentorovala som 3 juniorných vývojárov, dvaja z nich odvtedy povýšili'
              : '- Led the React rebuild of the customer portal, used by 40,000 active customers\n- Cut load time by 45% with code splitting and smarter caching\n- Introduced visual regression tests, reducing UI bugs in production by 60%\n- Mentored 3 junior developers, two of whom have since been promoted',
        }),
        e({
          title: hu ? 'Frontend fejlesztő' : sk ? 'Frontend vývojárka' : 'Frontend Developer',
          subtitle: 'Brightlane Software',
          place: sk ? 'Bratislava' : 'Budapest',
          start: hu ? '2018/09' : '09/2018',
          end: hu ? '2021/02' : '02/2021',
          description: hu
            ? '- 12 belső admin felületet építettem Angularban egy logisztikai ügyfélnek\n- Közös komponenskönyvtárat hoztam létre, amely felére csökkentette az új képernyők fejlesztési idejét\n- Az akadálymentességi auditot követően WCAG 2.1 AA szintre hoztam a fő alkalmazást'
            : sk
              ? '- Vytvorila som 12 interných administračných rozhraní v Angulari pre klienta z oblasti logistiky\n- Zostavila som spoločnú knižnicu komponentov, ktorá skrátila vývoj nových obrazoviek na polovicu\n- Po audite prístupnosti som hlavnú aplikáciu dostala na úroveň WCAG 2.1 AA'
              : '- Built 12 internal admin interfaces in Angular for a logistics client\n- Created a shared component library that halved the time to build new screens\n- Brought the main application to WCAG 2.1 AA after an accessibility audit',
        }),
      ]),
      s('education', [
        e({
          title: hu ? 'Mérnökinformatikus BSc' : sk ? 'Bc. Informatika' : 'BSc Computer Science',
          subtitle: hu
            ? 'Budapesti Műszaki és Gazdaságtudományi Egyetem'
            : sk
              ? 'Slovenská technická univerzita v Bratislave'
              : 'Budapest University of Technology and Economics',
          place: sk ? 'Bratislava' : 'Budapest',
          start: '2014',
          end: '2018',
        }),
      ]),
      s('skills', [
        e({ title: 'React', level: 5 }),
        e({ title: 'TypeScript', level: 5 }),
        e({ title: 'Angular', level: 4 }),
        e({ title: hu ? 'Akadálymentesség' : sk ? 'Prístupnosť' : 'Accessibility', level: 4 }),
        e({ title: 'Node.js', level: 3 }),
        e({ title: 'Figma', level: 3 }),
      ]),
      s('languages', [
        e({ title: hu ? 'Magyar' : sk ? 'Slovenčina' : 'Hungarian', subtitle: hu ? 'Anyanyelv' : sk ? 'Materinský jazyk' : 'Native', level: 5 }),
        e({ title: hu ? 'Angol' : sk ? 'Angličtina' : 'English', subtitle: hu ? 'C1 — tárgyalóképes' : sk ? 'C1 — plynulo' : 'C1 — fluent', level: 4 }),
        e({ title: hu ? 'Német' : sk ? 'Nemčina' : 'German', subtitle: hu ? 'B1 — középfok' : sk ? 'B1 — stredne pokročilá' : 'B1 — intermediate', level: 3 }),
      ]),
      s('certifications', [
        e({ title: 'Professional Scrum Master I', subtitle: 'Scrum.org', end: '2022' }),
      ]),
      s('projects', [
        e({
          title: hu ? 'Nyílt forráskódú dátumválasztó' : sk ? 'Open-source výber dátumu' : 'Open-source date picker',
          subtitle: 'React, TypeScript',
          url: sk ? 'github.com/jananovakova/datepick' : 'github.com/annakovacs/datepick',
          start: '2023',
          description: hu
            ? '- Akadálymentes dátumválasztó komponens, heti 3000+ npm letöltéssel'
            : sk
              ? '- Prístupný komponent na výber dátumu s viac ako 3 000 stiahnutiami z npm týždenne'
              : '- Accessible date picker component with 3,000+ weekly npm downloads',
        }),
      ]),
    ],
    design: { template: 'modern', accent: accents[0], density: 'normal', showPhoto: true, lang },
  };
}
