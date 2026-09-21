export const site = {
  name: 'David Mészáros',
  monogram: 'DM',
  email: 'meszarosdavid@protonmail.com',
  build: '2026.09',
  version: 'v2.6',
  timezone: 'Europe/Budapest',
  links: [
    { label: 'LinkedIn', short: 'IN', href: 'https://www.linkedin.com/' },
    { label: 'GitHub', short: 'GH', href: 'https://github.com/' },
    { label: 'Email', short: 'EM', href: 'mailto:meszarosdavid@protonmail.com' },
  ],
  sections: ['home', 'about', 'projects', 'services', 'contact'] as const,
};

export type SectionId = (typeof site.sections)[number];
