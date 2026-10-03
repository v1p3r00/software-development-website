import type { Lang } from '../../data/projects';
import { templateIds } from './templates';
import type { TemplateId } from './templates';

export type { TemplateId };

/** Every kind of section a CV can hold. `custom` sections can be added any number of times. */
export type SectionKind =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'projects'
  | 'custom';

/** One entry of a list section. Which fields are used depends on the section kind. */
export interface Entry {
  id: string;
  title: string;
  subtitle: string;
  place: string;
  start: string;
  end: string;
  current: boolean;
  url: string;
  /** free text; in experience and projects every line is a bullet */
  description: string;
  /** 0 = not shown, 1–5 */
  level: number;
}

export interface Section {
  id: string;
  kind: SectionKind;
  /** heading override; empty = the default heading in the CV language */
  title: string;
  /** summary text (summary and custom sections) */
  text: string;
  items: Entry[];
}

export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface Personal {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  /** data: URL, already downscaled */
  photo: string;
  links: Link[];
}

export type Density = 'compact' | 'normal' | 'airy';

export interface Design {
  template: TemplateId;
  accent: string;
  density: Density;
  showPhoto: boolean;
  /** language of the headings printed on the CV */
  lang: Lang;
}

export interface Cv {
  version: 1;
  personal: Personal;
  sections: Section[];
  design: Design;
}

export const accents = ['#1f6feb', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#334155'];
export const allKinds: SectionKind[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'languages',
  'certifications',
  'projects',
  'custom',
];

/** fields shown in the editor for each list kind */
export const fieldsOf: Record<SectionKind, Array<keyof Entry>> = {
  summary: [],
  experience: ['title', 'subtitle', 'place', 'start', 'end', 'current', 'description'],
  education: ['title', 'subtitle', 'place', 'start', 'end', 'description'],
  skills: ['title', 'subtitle', 'level'],
  languages: ['title', 'subtitle', 'level'],
  certifications: ['title', 'subtitle', 'end', 'url'],
  projects: ['title', 'subtitle', 'url', 'start', 'end', 'description'],
  custom: ['title', 'subtitle', 'start', 'end', 'description'],
};

/** sections that are lists of entries (all but the summary) */
export const hasItems = (kind: SectionKind) => kind !== 'summary';
/** sections with a free-text paragraph */
export const hasText = (kind: SectionKind) => kind === 'summary' || kind === 'custom';
/** short entries that fit a sidebar */
export const isSideKind = (kind: SectionKind) => kind === 'skills' || kind === 'languages' || kind === 'certifications';

export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyEntry = (): Entry => ({
  id: uid(),
  title: '',
  subtitle: '',
  place: '',
  start: '',
  end: '',
  current: false,
  url: '',
  description: '',
  level: 0,
});

export const newSection = (kind: SectionKind): Section => ({
  id: uid(),
  kind,
  title: '',
  text: '',
  items: hasItems(kind) && kind !== 'custom' ? [emptyEntry()] : [],
});

export const blankCv = (lang: Lang): Cv => ({
  version: 1,
  personal: { name: '', headline: '', email: '', phone: '', location: '', photo: '', links: [] },
  sections: (['summary', 'experience', 'education', 'skills', 'languages'] as SectionKind[]).map(newSection),
  design: { template: 'modern', accent: accents[0], density: 'normal', showPhoto: true, lang },
});

/** turns pasted / stored data back into a valid CV, filling anything missing */
export function normalize(raw: unknown, lang: Lang): Cv | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<Cv>;
  if (!r.personal || !Array.isArray(r.sections)) return null;
  const base = blankCv(lang);
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    version: 1,
    personal: {
      ...base.personal,
      ...Object.fromEntries(Object.entries(r.personal).filter(([, v]) => typeof v === 'string')),
      links: Array.isArray(r.personal.links)
        ? r.personal.links.map((l) => ({ id: str(l?.id) || uid(), label: str(l?.label), url: str(l?.url) }))
        : [],
    },
    sections: r.sections
      .filter((s) => s && allKinds.includes(s.kind))
      .map((s) => ({
        id: str(s.id) || uid(),
        kind: s.kind,
        title: str(s.title),
        text: str(s.text),
        items: Array.isArray(s.items)
          ? s.items.map((it) => ({
              ...emptyEntry(),
              ...Object.fromEntries(Object.entries(it ?? {}).filter(([, v]) => typeof v === 'string')),
              id: str(it?.id) || uid(),
              current: Boolean(it?.current),
              level: Math.max(0, Math.min(5, Number(it?.level) || 0)),
            }))
          : [],
      })),
    design: {
      ...base.design,
      ...(r.design ?? {}),
      template: templateIds.includes(r.design?.template as TemplateId) ? (r.design!.template as TemplateId) : 'modern',
      lang: r.design?.lang === 'hu' || r.design?.lang === 'en' ? r.design.lang : lang,
    },
  };
}

/** moves the element at `from` by `delta` places, returning a new array */
export function move<T>(list: T[], from: number, delta: number): T[] {
  const to = from + delta;
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

/** description text → bullet lines, dropping list markers people type themselves */
export const bullets = (text: string) =>
  text
    .split('\n')
    .map((l) => l.replace(/^\s*[-•*–]\s*/, '').trim())
    .filter(Boolean);

/** reads an image file and downsizes it to a square-ish JPEG data URL */
export function readPhoto(file: File, max = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image'));
      img.onload = () => {
        // centre crop to 4:5, a common CV photo ratio
        const ratio = 4 / 5;
        let sw = img.width;
        let sh = img.height;
        if (sw / sh > ratio) sw = sh * ratio;
        else sh = sw / ratio;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        const w = Math.min(max, Math.round(sw));
        const h = Math.round(w / ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas'));
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
