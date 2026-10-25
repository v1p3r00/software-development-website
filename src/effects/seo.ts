// kept free of other imports: the build-time SEO step (scripts/seo.ts) uses it too
export const EFFECTS_SEO: Record<'en' | 'hu' | 'sk', { title: string; description: string }> = {
  en: {
    title: '100 interface effects: tactile buttons, glass UI, 3D cards | softwaredevelopment.hu',
    description: 'A live gallery of 100 hand-built web interface effects — balloon buttons, a glass login that flips to MFA, holographic cards, bubble wrap and more. Every one runs on mouse and touch.',
  },
  hu: {
    title: '100 felületi effekt: tapintható gombok, üveg UI, 3D kártyák | softwaredevelopment.hu',
    description: '100 saját fejlesztésű webes felületi effekt élőben — lufigomb, MFA-ra forduló üveg bejelentkezés, holografikus kártyák, buborékfólia és még sok más. Egérrel és érintéssel is működnek.',
  },
  sk: {
    title: '100 efektov rozhrania: hmatové tlačidlá, sklenené UI, 3D karty | softwaredevelopment.hu',
    description: 'Živá galéria 100 ručne vytvorených webových efektov — balónové tlačidlo, sklenené prihlásenie, ktoré sa otočí na MFA, holografické karty, bublinková fólia a ďalšie. Fungujú s myšou aj dotykom.',
  },
};
