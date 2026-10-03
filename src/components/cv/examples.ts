import type { Lang } from '../../data/projects';
import { accents, emptyEntry, uid } from './model';
import type { Cv, Entry, Section, SectionKind } from './model';

const e = (fields: Partial<Entry>): Entry => ({ ...emptyEntry(), ...fields });
const s = (kind: SectionKind, items: Entry[] = [], text = ''): Section => ({ id: uid(), kind, title: '', text, items });

/** a fictional, complete CV so the templates have something to show on the first visit */
export function exampleCv(lang: Lang): Cv {
  const hu = lang === 'hu';
  return {
    version: 1,
    personal: {
      name: hu ? 'Kovács Anna' : 'Anna Kovács',
      headline: hu ? 'Senior frontend fejlesztő' : 'Senior Frontend Developer',
      email: 'anna.kovacs@example.com',
      phone: '+36 30 123 4567',
      location: hu ? 'Budapest' : 'Budapest, Hungary',
      photo: '',
      links: [
        { id: uid(), label: 'LinkedIn', url: 'linkedin.com/in/annakovacs' },
        { id: uid(), label: 'GitHub', url: 'github.com/annakovacs' },
      ],
    },
    sections: [
      s(
        'summary',
        [],
        hu
          ? 'Frontend fejlesztő 7 év tapasztalattal adatintenzív webalkalmazások fejlesztésében React és TypeScript alapon, főként pénzügyi ügyfeleknek. Vezettem egy 40 000 ügyfél által használt felület újraírását, és szívesen mentorálok junior fejlesztőket. Olyan termékcsapatot keresek, ahol a teljesítmény és a felhasználói élmény egyformán számít.'
          : 'Frontend developer with 7 years of experience building data-heavy web applications in React and TypeScript, mostly for financial clients. Led the rebuild of a dashboard used by 40,000 customers and enjoy mentoring junior developers. Looking for a product team where performance and usability matter equally.',
      ),
      s('experience', [
        e({
          title: hu ? 'Senior frontend fejlesztő' : 'Senior Frontend Developer',
          subtitle: 'Northbank Digital',
          place: 'Budapest',
          start: hu ? '2021/03' : '03/2021',
          current: true,
          description: hu
            ? '- Vezettem az ügyfélportál React-alapú újraírását, 40 000 aktív felhasználóval\n- 45%-kal csökkentettem a betöltési időt code splittinggel és cache-eléssel\n- Bevezettem a vizuális regressziós teszteket, a UI-hibák száma 60%-kal esett\n- 3 junior fejlesztőt mentoráltam, kettő azóta mid-level'
            : '- Led the React rebuild of the customer portal, used by 40,000 active customers\n- Cut load time by 45% with code splitting and smarter caching\n- Introduced visual regression tests, reducing UI bugs in production by 60%\n- Mentored 3 junior developers, two of whom have since been promoted',
        }),
        e({
          title: hu ? 'Frontend fejlesztő' : 'Frontend Developer',
          subtitle: 'Brightlane Software',
          place: 'Budapest',
          start: hu ? '2018/09' : '09/2018',
          end: hu ? '2021/02' : '02/2021',
          description: hu
            ? '- 12 belső admin felületet építettem Angularban egy logisztikai ügyfélnek\n- Közös komponenskönyvtárat hoztam létre, amely felére csökkentette az új képernyők fejlesztési idejét\n- Az akadálymentességi auditot követően WCAG 2.1 AA szintre hoztam a fő alkalmazást'
            : '- Built 12 internal admin interfaces in Angular for a logistics client\n- Created a shared component library that halved the time to build new screens\n- Brought the main application to WCAG 2.1 AA after an accessibility audit',
        }),
      ]),
      s('education', [
        e({
          title: hu ? 'Mérnökinformatikus BSc' : 'BSc Computer Science',
          subtitle: hu ? 'Budapesti Műszaki és Gazdaságtudományi Egyetem' : 'Budapest University of Technology and Economics',
          place: 'Budapest',
          start: '2014',
          end: '2018',
        }),
      ]),
      s('skills', [
        e({ title: 'React', level: 5 }),
        e({ title: 'TypeScript', level: 5 }),
        e({ title: 'Angular', level: 4 }),
        e({ title: hu ? 'Akadálymentesség' : 'Accessibility', level: 4 }),
        e({ title: 'Node.js', level: 3 }),
        e({ title: 'Figma', level: 3 }),
      ]),
      s('languages', [
        e({ title: hu ? 'Magyar' : 'Hungarian', subtitle: hu ? 'Anyanyelv' : 'Native', level: 5 }),
        e({ title: hu ? 'Angol' : 'English', subtitle: hu ? 'C1 — tárgyalóképes' : 'C1 — fluent', level: 4 }),
        e({ title: hu ? 'Német' : 'German', subtitle: hu ? 'B1 — középfok' : 'B1 — intermediate', level: 3 }),
      ]),
      s('certifications', [
        e({ title: 'Professional Scrum Master I', subtitle: 'Scrum.org', end: '2022' }),
      ]),
      s('projects', [
        e({
          title: hu ? 'Nyílt forráskódú dátumválasztó' : 'Open-source date picker',
          subtitle: 'React, TypeScript',
          url: 'github.com/annakovacs/datepick',
          start: '2023',
          description: hu
            ? '- Akadálymentes dátumválasztó komponens, heti 3000+ npm letöltéssel'
            : '- Accessible date picker component with 3,000+ weekly npm downloads',
        }),
      ]),
    ],
    design: { template: 'modern', accent: accents[0], density: 'normal', showPhoto: true, lang },
  };
}
