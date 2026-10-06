import type { ComponentType } from 'react';
import type { Landing } from './landings';

/** each landing page is its own chunk */
const loaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  vaulmere: () => import('../landing/vaulmere/Vaulmere'),
  echovane: () => import('../landing/echovane/Echovane'),
  vizszel: () => import('../landing/vizszel/Vizszel'),
  porcelia: () => import('../landing/porcelia/Porcelia'),
  revhajlat: () => import('../landing/revhajlat/Revhajlat'),
  zsarat: () => import('../landing/zsarat/Zsarat'),
  kinvel: () => import('../landing/kinvel/Kinvel'),
  napkorso: () => import('../landing/napkorso/Napkorso'),
  kovonal: () => import('../landing/kovonal/Kovonal'),
  velmira: () => import('../landing/velmira/Velmira'),
};

export function loadLanding(slug: string) {
  return loaders[slug]?.();
}

/** load a landing page's code, fonts and hero images, so it can be revealed in one go */
export async function prepareLanding(l: Landing): Promise<ComponentType> {
  const mod = await loaders[l.slug]();
  const fonts = (l.fonts ?? []).map((f) => document.fonts?.load(f).catch(() => undefined));
  const images = (l.images ?? []).map((src) => {
    const img = new Image();
    img.src = src;
    return img.decode().catch(() => undefined);
  });
  await Promise.all([...fonts, ...images]);
  return mod.default;
}
