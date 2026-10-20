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
        jobTitle: 'Website & Web Application Developer',
        url: `${site.url}/`,
        email: `mailto:${site.email}`,
        image: `${site.url}/portrait.jpg`,
        address: { '@type': 'PostalAddress', addressLocality: 'Budapest', addressCountry: 'HU' },
        sameAs: [linkedin, site.github, site.facebook].filter(Boolean),
        knowsLanguage: ['en', 'hu'],
        knowsAbout: [
          'Website development',
          'Web application development',
          'Web design',
          'Full-stack development',
          'Search engine optimization',
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
        name: `${site.name} — Website & web application development`,
        description:
          'Website and web application development in Budapest: business websites, landing pages, webshops and custom web apps, designed and built end to end.',
        url: `${site.url}/`,
        email: site.email,
        image: site.url + site.ogImage,
        founder: { '@id': `${site.url}/#person` },
        address: { '@type': 'PostalAddress', addressLocality: 'Budapest', addressCountry: 'HU' },
        areaServed: [
          { '@type': 'Country', name: 'Hungary' },
          { '@type': 'Place', name: 'Europe' },
        ],
        // schema.org: languages belong on a ContactPoint, service names in an OfferCatalog
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: site.email,
          availableLanguage: ['English', 'Hungarian'],
        },
        knowsAbout: ['Website development', 'Web application development', 'Web design', 'Webshop development', 'Technical SEO'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Website & web application development',
          itemListElement: [
            ['Website development', 'Business websites and landing pages, designed and built from scratch: fast, mobile-first and search-friendly.'],
            ['Web application development', 'Custom web apps: customer portals, booking and admin systems, dashboards and internal tools.'],
            ['Webshop development', 'Online shops built around how the business sells.'],
            ['UI/UX & web design', 'Interface and website design made with the front-end build in view.'],
            ['Website modernization', 'Redesigning and rebuilding dated websites and legacy web systems.'],
            ['System integration & APIs', 'Connecting websites and web apps with ERP, CRM, billing and other systems.'],
          ].map(([name, description]) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name, description, serviceType: name, provider: { '@id': `${site.url}/#person` } },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.domain,
        inLanguage: ['en', 'hu', 'sk'],
        publisher: { '@id': `${site.url}/#person` },
      },
    ],
  };
}
