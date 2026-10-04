/**
 * SEO helpers shared by the app (useSeo) and the build step (scripts/seo.ts).
 * Kept free of DOM, React and Vite APIs so both can import it.
 */
import { site } from '../data/site.ts';

/** trims to ~155 characters on a word boundary, for meta descriptions */
export function clip(text: string, max = 155) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.—–-]+$/, '')}…`;
}

/** who and what the site is about, for search engines (schema.org) */
export function siteGraph() {
  const linkedin = site.links.find((l) => l.href.includes('linkedin.com'))?.href;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${site.url}/#person`,
        name: site.name,
        alternateName: 'Mészáros Dávid',
        jobTitle: 'Full-Stack Developer & Web Designer',
        url: `${site.url}/`,
        email: `mailto:${site.email}`,
        image: `${site.url}/portrait.jpg`,
        address: { '@type': 'PostalAddress', addressLocality: 'Budapest', addressCountry: 'HU' },
        sameAs: [linkedin, site.github, site.facebook].filter(Boolean),
        knowsLanguage: ['en', 'hu'],
        knowsAbout: [
          'Full-stack development',
          'Web design',
          'E-commerce',
          'Enterprise software',
          'Software architecture',
          'Java',
          'Spring Boot',
          'Angular',
          'React',
          'TypeScript',
          'PostgreSQL',
        ],
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${site.url}/#service`,
        name: `${site.name} — Software development & web design`,
        url: `${site.url}/`,
        email: site.email,
        image: site.url + site.ogImage,
        founder: { '@id': `${site.url}/#person` },
        address: { '@type': 'PostalAddress', addressLocality: 'Budapest', addressCountry: 'HU' },
        areaServed: [
          { '@type': 'Country', name: 'Hungary' },
          { '@type': 'Place', name: 'Europe' },
        ],
        availableLanguage: ['English', 'Hungarian'],
        serviceType: ['Custom web applications', 'Websites', 'E-commerce', 'Enterprise systems', 'UI/UX design'],
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.domain,
        inLanguage: ['en', 'hu'],
        publisher: { '@id': `${site.url}/#person` },
      },
    ],
  };
}
