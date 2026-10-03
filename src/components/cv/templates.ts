import type { L10n } from '../../data/projects';

/**
 * Every CV layout. The structure fields pick how CvSheet arranges the content;
 * the look of each layout lives in cv.css under `.cv-<id>`.
 */
export type TemplateGroup = 'modern' | 'creative' | 'classic';

export interface TemplateDef {
  id: string;
  name: L10n;
  text: L10n;
  group: TemplateGroup;
  /** single column, or a sidebar on the left / right */
  layout: 'single' | 'left' | 'right';
  /** how skills are drawn */
  skills: 'dots' | 'bars' | 'chips' | 'text';
  /** contact details: one line under the name, or a stacked list beside it */
  contact: 'line' | 'stack';
  /** plain enough for applicant tracking systems: one column, real text, standard headings */
  ats: boolean;
  /** shows the profile photo */
  photo: boolean;
  /** colour the layout is designed around; applied when the layout is picked */
  accent?: string;
}

export const templateDefs = [
  {
    id: 'modern',
    name: { en: 'Modern', hu: 'Modern' },
    text: { en: 'Two columns with a tinted sidebar. A reliable all-rounder.', hu: 'Két hasáb, színezett oldalsávval. Megbízható, sokoldalú választás.' },
    group: 'modern', layout: 'left', skills: 'dots', contact: 'stack', ats: false, photo: true, accent: '#1f6feb',
  },
  {
    id: 'minimal',
    name: { en: 'Minimal', hu: 'Minimál' },
    text: { en: 'Lots of white space, light type and almost no colour. Quiet confidence.', hu: 'Sok levegő, könnyed betűk, szinte semmi szín. Csendes magabiztosság.' },
    group: 'modern', layout: 'single', skills: 'text', contact: 'line', ats: true, photo: true, accent: '#111827',
  },
  {
    id: 'swiss',
    name: { en: 'Swiss grid', hu: 'Svájci rács' },
    text: { en: 'Headings in a left margin column, strict grid, one red accent.', hu: 'Címsorok a bal margóban, szigorú rács, egyetlen piros kiemelés.' },
    group: 'modern', layout: 'single', skills: 'text', contact: 'line', ats: true, photo: false, accent: '#dc2626',
  },
  {
    id: 'split',
    name: { en: 'Split right', hu: 'Jobb oldalsáv' },
    text: { en: 'Experience first, with skills and education in a right-hand column.', hu: 'Elöl a tapasztalat, a készségek és tanulmányok jobb oldali hasábban.' },
    group: 'modern', layout: 'right', skills: 'bars', contact: 'stack', ats: false, photo: true, accent: '#7c3aed',
  },
  {
    id: 'nordic',
    name: { en: 'Nordic', hu: 'Skandináv' },
    text: { en: 'Soft grey sidebar, rounded photo and calm, muted colours.', hu: 'Lágy szürke oldalsáv, kerek fotó, nyugodt, tompa színek.' },
    group: 'modern', layout: 'left', skills: 'bars', contact: 'stack', ats: false, photo: true, accent: '#0e7490',
  },
  {
    id: 'soft',
    name: { en: 'Soft cards', hu: 'Lágy kártyák' },
    text: { en: 'Each section on a rounded, lightly tinted card. Friendly and modern.', hu: 'Minden szakasz lekerekített, halványan színezett kártyán. Barátságos és modern.' },
    group: 'modern', layout: 'single', skills: 'chips', contact: 'line', ats: false, photo: true, accent: '#db2777',
  },
  {
    id: 'bento',
    name: { en: 'Bento', hu: 'Bento' },
    text: { en: 'A grid of rounded boxes, like a modern dashboard.', hu: 'Lekerekített dobozok rácsa, mint egy modern dashboard.' },
    group: 'modern', layout: 'right', skills: 'chips', contact: 'stack', ats: false, photo: true, accent: '#2563eb',
  },
  {
    id: 'startup',
    name: { en: 'Startup', hu: 'Startup' },
    text: { en: 'Geometric headings, skill tags and contact details beside the name.', hu: 'Geometrikus címsorok, készségcímkék, elérhetőség a név mellett.' },
    group: 'modern', layout: 'single', skills: 'chips', contact: 'stack', ats: false, photo: true, accent: '#6366f1',
  },
  {
    id: 'gradient',
    name: { en: 'Gradient', hu: 'Színátmenet' },
    text: { en: 'A colour-gradient header band with white type.', hu: 'Színátmenetes fejléc fehér betűkkel.' },
    group: 'modern', layout: 'single', skills: 'chips', contact: 'line', ats: false, photo: true, accent: '#7c3aed',
  },
  {
    id: 'compact',
    name: { en: 'Compact', hu: 'Tömör' },
    text: { en: 'Small type and a narrow sidebar: a long career on one page.', hu: 'Kisebb betűk, keskeny oldalsáv: hosszú pálya egy oldalon.' },
    group: 'modern', layout: 'left', skills: 'bars', contact: 'stack', ats: false, photo: false, accent: '#334155',
  },
  {
    id: 'technical',
    name: { en: 'Technical', hu: 'Technikai' },
    text: { en: 'Bold condensed type and a strong accent rail. Tech and design roles.', hu: 'Erős, keskeny betűk, hangsúlyos kiemelősáv. Tech és design pozíciókhoz.' },
    group: 'creative', layout: 'single', skills: 'text', contact: 'line', ats: false, photo: true,
  },
  {
    id: 'bold',
    name: { en: 'Bold', hu: 'Merész' },
    text: { en: 'Black header band with an oversized name. Impossible to overlook.', hu: 'Fekete fejléc óriási névvel. Nem lehet nem észrevenni.' },
    group: 'creative', layout: 'single', skills: 'chips', contact: 'line', ats: false, photo: true, accent: '#f97316',
  },
  {
    id: 'statement',
    name: { en: 'Statement', hu: 'Statement' },
    text: { en: 'Oversized typography across the full width, thin rules, no clutter.', hu: 'Teljes szélességű, túlméretezett tipográfia, vékony vonalak.' },
    group: 'creative', layout: 'single', skills: 'text', contact: 'line', ats: false, photo: false, accent: '#111827',
  },
  {
    id: 'midnight',
    name: { en: 'Midnight', hu: 'Éjfél' },
    text: { en: 'Dark sidebar with white type and a bright accent.', hu: 'Sötét oldalsáv fehér betűkkel és élénk kiemelőszínnel.' },
    group: 'creative', layout: 'left', skills: 'bars', contact: 'stack', ats: false, photo: true, accent: '#38bdf8',
  },
  {
    id: 'creative',
    name: { en: 'Creative', hu: 'Kreatív' },
    text: { en: 'A solid colour sidebar and numbered sections. For creative fields.', hu: 'Teli színes oldalsáv és számozott szakaszok. Kreatív területekre.' },
    group: 'creative', layout: 'left', skills: 'bars', contact: 'stack', ats: false, photo: true, accent: '#ea580c',
  },
  {
    id: 'outline',
    name: { en: 'Outline', hu: 'Körvonal' },
    text: { en: 'Headings in outlined pills, outlined skill tags, rounded corners.', hu: 'Körvonalas címkékbe foglalt címsorok és készségek, lekerekített sarkok.' },
    group: 'creative', layout: 'single', skills: 'chips', contact: 'line', ats: false, photo: true, accent: '#0891b2',
  },
  {
    id: 'developer',
    name: { en: 'Developer', hu: 'Fejlesztő' },
    text: { en: 'Monospaced type and code-style headings. Made for engineers.', hu: 'Fix szélességű betűk, kódszerű címsorok. Mérnököknek.' },
    group: 'creative', layout: 'single', skills: 'chips', contact: 'line', ats: false, photo: false, accent: '#16a34a',
  },
  {
    id: 'timeline',
    name: { en: 'Timeline', hu: 'Idővonal' },
    text: { en: 'Experience and education on a vertical timeline.', hu: 'Tapasztalat és tanulmányok függőleges idővonalon.' },
    group: 'creative', layout: 'single', skills: 'chips', contact: 'line', ats: false, photo: true, accent: '#0f766e',
  },
  {
    id: 'classic',
    name: { en: 'Classic', hu: 'Klasszikus' },
    text: { en: 'Single column with serif headings. Conservative industries.', hu: 'Egy hasáb, talpas címsorok. Konzervatív iparágakba.' },
    group: 'classic', layout: 'single', skills: 'text', contact: 'line', ats: true, photo: true,
  },
  {
    id: 'editorial',
    name: { en: 'Editorial', hu: 'Szerkesztői' },
    text: { en: 'Magazine-style serif on warm paper. Elegant and literary.', hu: 'Magazinszerű talpas betűk meleg tónusú papíron. Elegáns, irodalmi.' },
    group: 'classic', layout: 'single', skills: 'text', contact: 'line', ats: false, photo: true, accent: '#9a3412',
  },
  {
    id: 'executive',
    name: { en: 'Executive', hu: 'Vezetői' },
    text: { en: 'Navy header band and restrained type. Senior and management roles.', hu: 'Sötétkék fejléc, visszafogott tipográfia. Vezetői pozíciókhoz.' },
    group: 'classic', layout: 'single', skills: 'text', contact: 'stack', ats: false, photo: true, accent: '#1e3a5f',
  },
  {
    id: 'corporate',
    name: { en: 'Corporate', hu: 'Vállalati' },
    text: { en: 'Clean sans-serif, accent rules beside each section. Banking, consulting.', hu: 'Letisztult, talpatlan betűk, kiemelővonal minden szakasz mellett. Bank, tanácsadás.' },
    group: 'classic', layout: 'single', skills: 'text', contact: 'line', ats: true, photo: false, accent: '#1d4ed8',
  },
  {
    id: 'academic',
    name: { en: 'Academic', hu: 'Akadémiai' },
    text: { en: 'Traditional serif, small caps, black only. Research and teaching.', hu: 'Hagyományos talpas betűk, kiskapitális, csak fekete. Kutatás, oktatás.' },
    group: 'classic', layout: 'single', skills: 'text', contact: 'line', ats: true, photo: false, accent: '#111111',
  },
  {
    id: 'ats',
    name: { en: 'ATS plain', hu: 'ATS-barát' },
    text: { en: 'No columns, colour or photo. Safest for applicant tracking systems.', hu: 'Hasábok, szín és fotó nélkül. A legbiztosabb választás jelentkeztető rendszerekhez.' },
    group: 'classic', layout: 'single', skills: 'text', contact: 'line', ats: true, photo: false,
  },
] as const satisfies readonly TemplateDef[];

export type TemplateId = (typeof templateDefs)[number]['id'];
export const templateIds = templateDefs.map((t) => t.id) as TemplateId[];
export const templateOf = (id: string): TemplateDef => templateDefs.find((t) => t.id === id) ?? templateDefs[0];
