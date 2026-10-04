export const site = {
  name: 'David Mészáros',
  monogram: 'DM',
  url: 'https://softwaredevelopment.hu',
  domain: 'softwaredevelopment.hu',
  github: 'https://github.com/v1p3r00',
  facebook: 'https://www.facebook.com/profile.php?id=61594757618918',
  ogImage: '/og.png',
  email: 'meszarosdavid@softwaredevelopment.hu',
  // the contact form posts to Web3Forms, which mails it to the address above.
  // The access key is public by design: it can only deliver to that address.
  formEndpoint: 'https://api.web3forms.com/submit',
  // Cloudflare Worker: every GET adds one visit and returns { visitors: n }
  counterEndpoint: 'https://softwaredevelopment-counter.punkboy40.workers.dev/',
  formAccessKey: '6663fd0a-d3f1-4c91-b881-8ea938ffb30e',
  // Patreon page for the course's sample projects; set the real address here
  patreon: 'https://www.patreon.com/',
  // hides every Patreon button and link until the Patreon page is ready
  showPatreon: false,
  build: '2026.09',
  version: 'v2.6',
  timezone: 'Europe/Budapest',
  links: [
    { label: 'LinkedIn', short: 'IN', href: 'https://www.linkedin.com/in/meszdav' },
    { label: 'Email', short: 'EM', href: 'mailto:meszarosdavid@softwaredevelopment.hu' },
  ],
  sections: ['home', 'about', 'projects', 'services', 'interactive', 'contact'] as const,
};

export type SectionId = (typeof site.sections)[number];
