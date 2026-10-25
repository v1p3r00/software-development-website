import { site } from '../data/site';

/** a Patreon link tagged so the Patreon dashboard can tell which effect or reel sent the member */
export function patreonHref(content: string, source = 'site-effects') {
  const q = new URLSearchParams({ utm_source: source, utm_medium: 'referral', utm_campaign: 'effects-pack', utm_content: content });
  return `${site.patreon}?${q}`;
}

export const showEffectsPatreon = site.showEffectsPatreon;
