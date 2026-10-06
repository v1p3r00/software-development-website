import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/manrope';
import './vizszel.css';
import { jump, reducedMotion, useCountUp, useInView, useReveal, useScrolledPast, useToast } from '../kit';

/**
 * Vízszél Villa — a fictional boutique lakeside hotel & spa on Lake Balaton.
 * Golden-hour calm, slow luxury: a code-drawn lake at sunset, a room carousel and a live booking bar.
 */

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
const ft = (n: number) => `${Math.round(n).toLocaleString('hu-HU')} Ft`;
const TAX = 600; // idegenforgalmi adó / fő / éj

type Win = 'arch' | 'wide' | 'round' | 'double' | 'roof';
type Furn = 'bed' | 'twin' | 'tub';
type Room = {
  id: string;
  name: string;
  tag: string;
  size: number;
  view: string;
  cap: number;
  price: number;
  art: { win: Win; furn: Furn; wall: [string, string]; floor: string; sky: [string, string, string]; throw: string };
};

const ROOMS: Room[] = [
  {
    id: 'nadas',
    name: 'Nádas szoba',
    tag: 'Csendes kerti oldal',
    size: 28,
    view: 'Kert és nádas',
    cap: 2,
    price: 58000,
    art: { win: 'arch', furn: 'bed', wall: ['#EFE6D8', '#E2D4BF'], floor: '#C9AE8C', sky: ['#9FC3C4', '#F1D7AE', '#6E9C98'], throw: '#7E9F8E' },
  },
  {
    id: 'molo',
    name: 'Móló junior lakosztály',
    tag: 'Kilátás a stégre',
    size: 38,
    view: 'Részleges tóra néző',
    cap: 2,
    price: 76000,
    art: { win: 'wide', furn: 'bed', wall: ['#E9DFCF', '#D9C8AF'], floor: '#B89773', sky: ['#7FA9B3', '#F3C893', '#2F6470'], throw: '#E07A5F' },
  },
  {
    id: 'naplemente',
    name: 'Naplemente lakosztály',
    tag: 'Saját terasz nyugatra',
    size: 52,
    view: 'Panoráma a tóra',
    cap: 3,
    price: 98000,
    art: { win: 'double', furn: 'bed', wall: ['#F0E4D2', '#E3CBAE'], floor: '#A9825E', sky: ['#3E6B78', '#F2A66E', '#24525E'], throw: '#C9644A' },
  },
  {
    id: 'vitorlas',
    name: 'Vitorlás családi szoba',
    tag: 'Két hálótér, gyerekágy',
    size: 46,
    view: 'Kert és tó',
    cap: 4,
    price: 88000,
    art: { win: 'round', furn: 'twin', wall: ['#E6E0D3', '#D2C9B6'], floor: '#BFA07C', sky: ['#A9CFD3', '#F6E2BC', '#4D8590'], throw: '#1F4E5A' },
  },
  {
    id: 'teto',
    name: 'Villa-tetőtér',
    tag: 'Kád az ablak előtt',
    size: 64,
    view: '180° a tóra',
    cap: 2,
    price: 128000,
    art: { win: 'roof', furn: 'tub', wall: ['#EDE3D3', '#D8C4A7'], floor: '#9C7756', sky: ['#1F4E5A', '#E8956A', '#163E48'], throw: '#E9DFCF' },
  },
];

const PRESS = ['Tavaszél Revü', 'KÉKÓRA UTAZÁS', 'Lassú Hétvégék', 'MÓLÓ & MÁS', 'Partvonal Kritika', 'SÓSZÉL MAGAZIN', 'Hullámtér'];

const FAQ: Array<[string, string]> = [
  ['Mikor lehet érkezni és távozni?', 'A szobák 15 órától foglalhatók el, távozni 11 óráig kell. Késői kijelentkezést 14 óráig kérésre, szabad kapacitás esetén díjmentesen biztosítunk.'],
  ['Gyerekekkel is jöhetünk?', 'Igen, a Vitorlás családi szobában négy fő kényelmesen elfér. A spa felnőttzónája 16 éves kortól látogatható, a gyerekmedence egész nap nyitva áll.'],
  ['Mit tartalmaz a szobaár?', 'A bőséges reggelit a teraszon, a spa korlátlan használatát, köntöst és papucsot, valamint a kerékpárok és a kajakok ingyenes bérlését. Az idegenforgalmi adó külön fizetendő.'],
  ['Hozhatjuk a kutyánkat?', 'A kerti oldali Nádas szobákba szeretettel várjuk a kisebb kutyákat, éjszakánként 6 000 Ft takarítási díj ellenében. Tálat és fekhelyet mi adunk.'],
  ['Van parkolási lehetőség?', 'A villa mögötti, fákkal árnyékolt parkoló díjmentes. Két elektromosautó-töltőpontot is kialakítottunk.'],
  ['Hogyan módosíthatom vagy mondhatom le a foglalást?', 'Az érkezés előtt 7 nappal díjmentesen lemondhat vagy módosíthat. Ezen belül az első éjszaka díját számítjuk fel.'],
];

const QUOTES: Array<[string, string, string]> = [
  ['„Reggel hétkor csak mi voltunk a stégen és egy szürke gém. Ennél nyugodtabb reggelt nem tudok elképzelni.”', 'Szalay Dóra', 'Budapest · Naplemente lakosztály'],
  ['„A tetőtéri kádból néztük a vihart a tó felett. A személyzet közben észrevétlenül meleg teát hozott.”', 'Kertész Áron', 'Győr · Villa-tetőtér'],
  ['„A gyerekek a kajakot, mi a teraszt és a kéknyelűt szerettük. Jövőre ugyanarra a hétre foglaltunk.”', 'Major Eszter', 'Pécs · Vitorlás családi szoba'],
];

const OFFERS = [
  {
    id: 'lassu',
    name: 'Lassú hétvége',
    nights: 2,
    room: 'molo',
    from: 168000,
    season: 'Egész évben',
    perks: ['Két éj a Móló lakosztályban', 'Késői kijelentkezés 14 óráig', 'Egy palack olaszrizling érkezéskor'],
  },
  {
    id: 'szuret',
    name: 'Szüreti hét a hegyen',
    nights: 5,
    room: 'naplemente',
    from: 486000,
    season: 'Szeptember – október',
    perks: ['Öt éj, panoráma a tóra', 'Kóstoló két északi parti pincében', 'Vezetett túra a Szent György-hegyen'],
    featured: true,
  },
  {
    id: 'tel',
    name: 'Téli tó, meleg víz',
    nights: 3,
    room: 'teto',
    from: 342000,
    season: 'November – március',
    perks: ['Három éj a tetőtérben', 'Két fő 60 perces nádas-olajos masszázs', 'Forralt bor a kandalló mellett'],
  },
];

const EXP = [
  {
    id: 'vitorla',
    tab: 'Vitorlázás',
    title: 'Délután a vízen, kapitánnyal',
    text: 'Saját 28 lábas hajónk a stégről indul. Tihany felé hajózunk, a szél éppen annyi, hogy a poharak ne boruljanak.',
    meta: [['Indul', 'a stégről, 16:30'], ['Időtartam', '3 óra'], ['Fő', 'legfeljebb 6']],
  },
  {
    id: 'bor',
    tab: 'Borhegyek',
    title: 'Bazaltpincék az északi parton',
    text: 'Komppal Tihanyon át a Badacsony lábához. Két családi pince, a Bazaltkert Birtok és a Szélhegy Pince vár kóstolóval.',
    meta: [['Indul', 'reggel 10-kor'], ['Időtartam', 'fél nap'], ['Kóstoló', '8 bor']],
  },
  {
    id: 'bicikli',
    tab: 'Kerékpár',
    title: 'A déli part, a nyugalom felé',
    text: 'Vegye kölcsön egyik túrakerékpárunkat, és tekerjen nyugatra a parti úton, ahol nádasok és apró strandok váltják egymást.',
    meta: [['Táv', '38 km'], ['Szint', 'könnyű, sík'], ['Kerékpár', 'díjmentes']],
  },
];

/* ---------- helpers ---------- */
const iso = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
const addDays = (s: string, n: number) => {
  const [y, m, dd] = s.split('-').map(Number);
  return iso(new Date(y, m - 1, dd + n));
};
const nightsBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

/** deterministic pseudo-random for the drawings, so every render is identical */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ---------- small art ---------- */
/* static illustrations are kept as raw SVG strings: far lighter than JSX for markup that never changes */
const grad = (id: string, stops: Array<[number, string, number?]>, h = false) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}">${stops
    .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`)
    .join('')}</linearGradient>`;
const loop = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i)).join('');
const steam = (paths: string[], cls = 'vz-steam', extra = '') =>
  `<g class="${cls}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"${extra}>${paths.map((p, i) => `<path d="${p}" style="--i:${i}"/>`).join('')}</g>`;

function Art({ html, className, vb = '0 0 600 440', par }: { html: string; className: string; vb?: string; par?: string }) {
  return <svg viewBox={vb} className={className} preserveAspectRatio={par} aria-hidden dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------- hero art ---------- */
const reeds = (x: number, w: number, h: number, seed: number, n: number) => {
  const r = rng(seed);
  return `<g class="vz-reeds" style="--sw:${(seed % 5) * 0.6 + 4}s">${loop(n, () => {
    const bx = x + r() * w;
    const top = 900 - h * (0.45 + r() * 0.55);
    const lean = (r() - 0.5) * 70;
    const cat = r() > 0.72;
    const wd = 2 + r() * 3;
    const tx = (bx + lean).toFixed(1);
    return `<path d="M${bx.toFixed(1)} 900Q${(bx + lean * 0.2).toFixed(1)} ${((900 + top) / 2).toFixed(1)} ${tx} ${top.toFixed(1)}" stroke-width="${wd.toFixed(1)}"/>${
      cat ? `<rect x="${(bx + lean - 4).toFixed(1)}" y="${(top - 4).toFixed(1)}" width="8" height="34" rx="4" fill="#2A2420" stroke="none" transform="rotate(${(lean * 0.25).toFixed(1)} ${tx} ${top.toFixed(1)})"/>` : ''
    }`;
  })}</g>`;
};

const HERO = (() => {
  const r = rng(7);
  const ripples = loop(46, (i) => {
    const y = 572 + Math.pow(r(), 1.6) * 320;
    const t = (y - 560) / 340;
    const x = r() * 1600;
    const w = 20 + t * 120 * (0.4 + r());
    return `<line x1="${x.toFixed(0)}" x2="${(x + w).toFixed(0)}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke-opacity="${(0.15 + (1 - t) * 0.3).toFixed(2)}" stroke-width="${(1 + (y - 560) / 160).toFixed(1)}" style="--i:${i % 9}"/>`;
  });
  const glints = loop(22, (i) => {
    const y = (566 + i * 6 + i * i * 0.72).toFixed(1);
    const w = 26 + i * 11;
    return `<line x1="${900 - w / 2}" x2="${900 + w / 2}" y1="${y}" y2="${y}" stroke-opacity="${Math.max(0.12, 0.95 - i * 0.04).toFixed(2)}" stroke-width="${(1.6 + i * 0.28).toFixed(2)}" style="--i:${i % 7}"/>`;
  });
  const posts = loop(8, (i) => {
    const t = i / 7;
    const x = (1010 + t * t * 590 + t * 40 - 1.5 - t * 4).toFixed(1);
    const y = 614 + t * t * 132 + t * 10;
    const len = 10 + t * 70;
    const w = (3 + t * 8).toFixed(1);
    return `<rect x="${x}" y="${y.toFixed(1)}" width="${w}" height="${len.toFixed(1)}"/><rect x="${x}" y="${(y + len + 4).toFixed(1)}" width="${w}" height="${(len * 0.9).toFixed(1)}" opacity=".28"/>`;
  });
  const clouds = [[380, 250, 260, 9, 0.22], [560, 282, 190, 6, 0.2], [1240, 330, 300, 10, 0.26], [1110, 362, 170, 5, 0.3], [700, 420, 330, 7, 0.28], [1420, 440, 210, 6, 0.22]]
    .map(([cx, cy, rx, ry, o]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" opacity="${o}"/>`)
    .join('');
  return `<defs>${grad('vz-sky', [[0, '#0E2A31'], [0.34, '#285661'], [0.6, '#8E8C83'], [0.82, '#E3A271'], [1, '#F8D49C']])}
<radialGradient id="vz-glow" cx="900" cy="530" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFE6B6" stop-opacity=".95"/><stop offset=".18" stop-color="#F7C487" stop-opacity=".55"/><stop offset=".5" stop-color="#E07A5F" stop-opacity=".16"/><stop offset="1" stop-color="#E07A5F" stop-opacity="0"/></radialGradient>
${grad('vz-water', [[0, '#F0BC86'], [0.1, '#C99078'], [0.34, '#4C7176'], [0.7, '#1F4E5A'], [1, '#0C252B']])}${grad('vz-haze', [[0, '#F8D49C', 0], [1, '#F8D49C', 0.55]])}</defs>
<rect width="1600" height="562" fill="url(#vz-sky)"/><rect width="1600" height="900" fill="url(#vz-glow)"/>
<g class="vz-clouds" fill="#F6CC9C">${clouds}</g>
<circle cx="900" cy="532" r="74" fill="#FFE9BE" opacity=".35"/><circle cx="900" cy="532" r="44" fill="#FFF1D0"/>
<path d="M0 562L0 520C70 514 130 510 190 506L238 474C262 466 342 464 378 470L430 502C520 514 620 528 720 546L820 562Z" fill="#B0908A" opacity=".55"/>
<path d="M760 562C860 552 980 546 1100 540C1220 532 1300 520 1400 522C1480 524 1540 516 1600 512L1600 562Z" fill="#A98C88" opacity=".5"/>
<path d="M0 562L0 538C90 532 170 540 260 548C330 554 400 556 470 562Z" fill="#6F6E73" opacity=".55"/>
<path d="M1200 562C1290 548 1380 542 1480 544C1540 545 1580 540 1600 538L1600 562Z" fill="#7A6F72" opacity=".5"/>
<rect y="520" width="1600" height="44" fill="url(#vz-haze)"/><rect y="560" width="1600" height="340" fill="url(#vz-water)"/>
<g class="vz-ripples" stroke="#F6D7A6" stroke-linecap="round">${ripples}</g>
<g class="vz-glints" stroke="#FFE4B0" stroke-linecap="round">${glints}</g>
<g class="vz-sail vz-sail--a"><path d="M612 552L612 512L632 550Z" fill="#F6E4CC" opacity=".85"/><path d="M610 552L604 518L611 552Z" fill="#E9C9A6" opacity=".7"/><path d="M598 554L638 554L632 559L603 559Z" fill="#3B3A3E" opacity=".8"/></g>
<g class="vz-sail vz-sail--b"><path d="M1328 554L1328 526L1342 553Z" fill="#F2DBC0" opacity=".7"/><path d="M1318 556L1346 556L1342 560L1322 560Z" fill="#3B3A3E" opacity=".65"/></g>
<path class="vz-birds" d="M1180 330q8-7 16 0q8-7 16 0M1232 308q6-5 12 0q6-5 12 0" stroke="#3A4A4E" stroke-width="2" fill="none" stroke-linecap="round"/>
<g fill="#0B2026">${posts}</g>
<path d="M1000 610L1600 726L1600 772L1000 616Z" fill="#0D252B"/><path d="M1000 610L1600 726L1600 734L1000 612Z" fill="#E9A776" opacity=".55"/>
<rect x="1004" y="580" width="3" height="32" fill="#0D252B"/><circle cx="1005.5" cy="578" r="4" fill="#FFE2A8"/><circle class="vz-lamp" cx="1005.5" cy="578" r="16" fill="#FFD48E" opacity=".35"/>
<path d="M1180 700C1210 714 1290 716 1320 702L1312 714C1280 726 1220 724 1192 712Z" fill="#0B2026"/>
<path d="M1186 716C1220 728 1280 728 1314 716" stroke="#F3C08A" stroke-opacity=".35" stroke-width="2" fill="none"/>
<g stroke="#0A2329" fill="none" stroke-linecap="round">${reeds(-30, 300, 330, 11, 34)}${reeds(560, 140, 170, 23, 12)}${reeds(1480, 160, 260, 31, 18)}</g>`;
})();

/* ---------- room interiors ---------- */
const WIN: Record<Win, [number, number, number, number, string]> = {
  arch: [150, 40, 110, 140, '<path d="M150 180L150 95A55 55 0 0 1 260 95L260 180Z"/>'],
  wide: [60, 54, 280, 110, '<rect x="60" y="54" width="280" height="110" rx="4"/>'],
  round: [140, 44, 120, 120, '<circle cx="200" cy="104" r="60"/>'],
  double: [70, 36, 260, 150, '<path d="M70 186L70 36L196 36L196 186ZM204 186L204 36L330 36L330 186Z"/>'],
  roof: [170, 60, 180, 130, '<path d="M190 60L350 60L350 190L170 190Z"/>'],
};
const MULLION: Partial<Record<Win, string>> = {
  wide: 'M200 54V164',
  arch: 'M205 40V180',
  round: 'M140 104H260',
};

function roomSvg(room: Room, idx: number) {
  const a = room.art;
  const id = `vz-r${idx}`;
  const [x, y, w, h, clip] = WIN[a.win];
  const hz = y + h * 0.6;
  const sx = x + w * 0.62;
  const win = `<clipPath id="${id}-c">${clip}</clipPath>${grad(`${id}-s`, [[0, a.sky[0]], [1, a.sky[1]]])}
<g clip-path="url(#${id}-c)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-s)"/><circle cx="${sx}" cy="${hz - 6}" r="${a.win === 'wide' ? 12 : 10}" fill="#FFF0CF"/>
<path d="M${x} ${hz}C${x + w * 0.2} ${hz - 12} ${x + w * 0.35} ${hz - 14} ${x + w * 0.5} ${hz - 4}L${x + w} ${hz - 2}L${x + w} ${hz}Z" fill="${a.sky[2]}" opacity=".55"/><rect x="${x}" y="${hz}" width="${w}" height="${h}" fill="${a.sky[2]}"/>
${loop(4, (i) => `<line x1="${sx - 10 - i * 5}" x2="${sx + 10 + i * 5}" y1="${hz + 5 + i * 7}" y2="${hz + 5 + i * 7}" stroke="#FFE6B8" stroke-opacity="${0.8 - i * 0.15}" stroke-width="1.5" stroke-linecap="round"/>`)}
${MULLION[a.win] ? `<path d="${MULLION[a.win]}" stroke="#F7F1E7" stroke-width="5"/>` : ''}</g><g fill="none" stroke="#F7F1E7" stroke-width="6">${clip}</g>`;
  const beds = (a.furn === 'twin' ? [[78, 150], [222, 150]] : [[90, 220]])
    .map(([bx, bw]) => {
      const tall = a.furn === 'twin';
      return `<rect x="${bx}" y="${tall ? 170 : 150}" width="${bw}" height="${tall ? 40 : 60}" rx="6" fill="${a.wall[1]}" stroke="#000" stroke-opacity=".08"/><rect x="${bx - 4}" y="206" width="${bw + 8}" height="40" rx="6" fill="#FBF8F2"/>
<rect x="${bx - 4}" y="222" width="${bw + 8}" height="24" fill="${a.throw}" opacity=".9"/><rect x="${bx + 10}" y="192" width="${bw / 2 - 16}" height="20" rx="9" fill="#fff"/><rect x="${bx + bw / 2 + 6}" y="192" width="${bw / 2 - 16}" height="20" rx="9" fill="#fff"/>
<rect x="${bx}" y="246" width="6" height="10" fill="#8C6A4A"/><rect x="${bx + bw - 6}" y="246" width="6" height="10" fill="#8C6A4A"/>`;
    })
    .join('');
  const tub = `<path d="M130 196L290 196C292 236 262 252 210 252C158 252 128 236 130 196Z" fill="#FBF8F2"/><path d="M130 196L290 196" stroke="#D9CDBB" stroke-width="5" stroke-linecap="round"/>
<rect x="146" y="250" width="8" height="12" fill="#B48A5C"/><rect x="266" y="250" width="8" height="12" fill="#B48A5C"/><path d="M282 196V168Q282 160 274 160H268" stroke="#B48A5C" stroke-width="4" fill="none" stroke-linecap="round"/>
${steam(['M180 188q-8-14 0-26q8-12 0-24', 'M214 186q8-14 0-26q-8-12 0-26', 'M246 188q-8-12 0-22'], 'vz-steam', ' stroke-opacity=".7"')}
<rect x="300" y="220" width="40" height="30" rx="4" fill="${a.throw}"/><rect x="304" y="210" width="32" height="12" rx="6" fill="#fff" opacity=".85"/>`;
  return `<defs>${grad(`${id}-w`, [[0, a.wall[0]], [1, a.wall[1]]])}<radialGradient id="${id}-l"><stop offset="0" stop-color="#FFE2A8" stop-opacity=".7"/><stop offset="1" stop-color="#FFE2A8" stop-opacity="0"/></radialGradient>${grad(`${id}-sun`, [[0, '#FFE0A8', 0.38], [1, '#FFE0A8', 0]])}</defs>
<rect width="400" height="300" fill="url(#${id}-w)"/>${a.win === 'roof' ? '<path d="M0 0L150 0L0 110Z" opacity=".07"/>' : ''}${win}
<rect y="218" width="400" height="82" fill="${a.floor}"/>${loop(5, (i) => `<line x1="0" x2="400" y1="${232 + i * 15 + i * i * 1.2}" y2="${232 + i * 15 + i * i * 1.2}" stroke="#000" stroke-opacity=".07"/>`)}
<rect y="214" width="400" height="5" opacity=".06"/><path d="M150 190L270 190L340 300L190 300Z" fill="url(#${id}-sun)"/><ellipse cx="205" cy="268" rx="150" ry="20" fill="#F4EBDD" opacity=".55"/>
${a.furn === 'tub' ? tub : beds}
<circle cx="352" cy="176" r="46" fill="url(#${id}-l)"/><rect x="330" y="210" width="44" height="40" rx="3" fill="#B48A5C"/><line x1="352" y1="178" x2="352" y2="210" stroke="#3D3A36" stroke-width="2"/><path d="M338 178L366 178L360 160L344 160Z" fill="#F7E9CF"/>
<path d="M30 252L58 252L54 222L34 222Z" fill="#D7C2A4"/>${[-34, -18, -4, 10, 26].map((rt, i) => `<ellipse cx="44" cy="190" rx="7" ry="28" fill="${i % 2 ? '#4F7B66' : '#3E6656'}" transform="rotate(${rt} 44 222)"/>`).join('')}`;
}

const SPA = `<defs>${grad('vz-spa-sky', [[0, '#0B232A'], [0.55, '#2B5560'], [1, '#D88E6B']])}${grad('vz-spa-lake', [[0, '#B87A66'], [1, '#1A434D']])}${grad('vz-pool', [[0, '#5FB3B3'], [1, '#1C6670']])}</defs>
<rect width="600" height="236" fill="url(#vz-spa-sky)"/><circle cx="430" cy="226" r="24" fill="#FFD9A0" opacity=".9"/>
<path d="M0 236C80 224 160 220 240 226C300 230 380 222 600 230L600 240L0 240Z" fill="#5E5761" opacity=".75"/>
<rect y="236" width="600" height="80" fill="url(#vz-spa-lake)"/>
${loop(4, (i) => `<line x1="${420 - i * 8}" x2="${440 + i * 8}" y1="${246 + i * 9}" y2="${246 + i * 9}" stroke="#FFD9A0" stroke-opacity="${0.7 - i * 0.12}" stroke-width="2" stroke-linecap="round"/>`)}
<path d="M0 300L600 292L600 440L0 440Z" fill="url(#vz-pool)"/><path d="M0 300L600 292" stroke="#BFE6E2" stroke-width="2.5" opacity=".9"/>
<g class="vz-pool-lines" stroke="#CFF0EA" stroke-opacity=".4" stroke-width="1.5" fill="none">${[[40, 340], [260, 372], [120, 410], [420, 330]].map(([x, y]) => `<path d="M${x} ${y}q30-6 60 0t60 0"/>`).join('')}</g>
${steam([70, 180, 300, 410, 520].map((x) => `M${x} 300q-14-24 0-46q14-22 0-44`), 'vz-wisps')}
${[90, 250, 510].map((x) => `<circle cx="${x}" cy="288" r="14" fill="#FFCF8A" opacity=".25"/><rect x="${x - 4}" y="280" width="8" height="12" rx="2" fill="#FFE2AE"/>`).join('')}`;

const TERRACE = `<defs>${grad('vz-morn', [[0, '#CFE0DD'], [0.7, '#F6E5C6'], [1, '#F9DDB0']])}${grad('vz-morn-lake', [[0, '#9DBFC0'], [1, '#3F7480']])}${grad('vz-wine', [[0, '#F2D98C'], [1, '#D9B45E']])}</defs>
<rect width="600" height="210" fill="url(#vz-morn)"/>
<path d="M0 210C70 176 120 168 170 172L196 150C214 144 262 144 276 152L300 176C360 186 460 190 600 200L600 212L0 212Z" fill="#9CA6A3" opacity=".7"/>
<rect y="210" width="600" height="110" fill="url(#vz-morn-lake)"/>
${loop(6, (i) => `<line x1="${60 + i * 90}" x2="${110 + i * 90}" y1="${226 + (i % 3) * 22}" y2="${226 + (i % 3) * 22}" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/>`)}
<g class="vz-sail vz-sail--a"><path d="M420 206L420 176L436 205Z" fill="#fff"/><path d="M410 208L440 208L436 212L414 212Z" fill="#3D4B4E"/></g>
<rect y="300" width="600" height="6" fill="#E9DFCF"/>${loop(16, (i) => `<rect x="${i * 40 + 16}" y="306" width="4" height="40" fill="#E9DFCF"/>`)}
<path d="M0 340L600 340L600 440L0 440Z" fill="#F7F1E7"/><path d="M0 340L600 340" stroke="#D8CCB8" stroke-width="3"/>
<ellipse cx="190" cy="380" rx="96" ry="22" fill="#fff" stroke="#E2D7C5"/>
<path d="M140 378C150 352 230 350 242 378C226 372 210 382 192 374C176 382 156 372 140 378Z" fill="#D99A55"/>
<path d="M168 362L176 378M192 356L194 376M216 360L210 377" stroke="#B4733A" stroke-width="2.5"/>
<ellipse cx="350" cy="392" rx="54" ry="13" fill="#fff" stroke="#E2D7C5"/>
<path d="M318 352L382 352L376 386C374 394 326 394 324 386Z" fill="#1F4E5A"/><ellipse cx="350" cy="352" rx="32" ry="7" fill="#6B4430"/>
<path d="M382 360C398 360 398 378 380 378" stroke="#1F4E5A" stroke-width="5" fill="none"/>
${steam(['M338 342q-8-14 0-26q8-12 0-24', 'M360 340q8-14 0-26q-8-12 0-24'])}
<path d="M478 288C470 324 482 340 500 342C518 340 530 324 522 288Z" fill="#fff" fill-opacity=".55" stroke="#C9BBA6"/>
<path d="M474 314C476 332 486 340 500 340C514 340 524 332 526 314Z" fill="url(#vz-wine)" opacity=".9"/>
<rect x="498" y="342" width="4" height="40" fill="#C9BBA6"/><ellipse cx="500" cy="384" rx="24" ry="6" fill="#fff" stroke="#C9BBA6"/>
<circle cx="80" cy="410" r="14" fill="#F0A35E"/><circle cx="104" cy="416" r="12" fill="#E8904C"/><path d="M80 396q6-8 12-6" stroke="#4F7B66" stroke-width="3" fill="none"/>`;

const NIGHT = (() => {
  const r = rng(42);
  const stars = loop(70, () => `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 520).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" class="vz-star" style="--i:${Math.floor(r() * 6)}"/>`);
  return `<defs>${grad('vz-night', [[0, '#06171B'], [0.6, '#123A44'], [1, '#2C5560']])}<radialGradient id="vz-moon" cx="1180" cy="200" r="220" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F3ECE1" stop-opacity=".35"/><stop offset="1" stop-color="#F3ECE1" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="700" fill="url(#vz-night)"/><rect width="1600" height="700" fill="url(#vz-moon)"/><g fill="#F3ECE1">${stars}</g>
<circle cx="1180" cy="200" r="34" fill="#F6EEDC"/><circle cx="1194" cy="192" r="30" fill="#0F333C" opacity=".22"/>
<path d="M0 590C160 572 300 568 420 576C520 552 600 550 680 566C860 576 1100 572 1600 582L1600 600L0 600Z" fill="#0A2228"/><rect y="598" width="1600" height="102" fill="#0B272E"/>
<g class="vz-glints">${loop(9, (i) => `<line x1="${1168 - i * 9}" x2="${1192 + i * 9}" y1="${606 + i * 9 + i * i * 0.4}" y2="${606 + i * 9 + i * i * 0.4}" stroke="#F3ECE1" stroke-opacity="${(0.6 - i * 0.05).toFixed(2)}" stroke-width="${1.5 + i * 0.3}" stroke-linecap="round" style="--i:${i % 7}"/>`)}</g>
${[220, 300, 360, 1420].map((x, i) => `<circle cx="${x}" cy="${586 - (i % 2) * 4}" r="2.6" fill="#FFD48E" opacity=".9"/>`).join('')}`;
})();

const LAKE =
  'M60 236C70 214 100 206 140 200C190 192 240 176 290 158C330 144 360 136 380 128C392 124 398 138 404 152C412 160 420 152 424 140C440 120 480 104 520 92C552 82 578 70 596 66C606 64 610 74 600 84C572 104 532 118 490 136C456 150 436 162 418 170C380 186 330 204 280 220C220 238 160 254 110 266C84 272 58 262 60 236Z';
const pin = (n: string, x: number, y: number, a: string) =>
  `<g class="vz-pin"><circle cx="${x}" cy="${y}" r="3.5"/><text x="${x + (a === 'end' ? -8 : a === 'start' ? 8 : 0)}" y="${y + (a === 'middle' ? -10 : 4)}" text-anchor="${a}">${n}</text></g>`;
const MAP = `<defs><pattern id="vz-vines" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><circle cx="2" cy="2" r="1.3" fill="#7E9F8E" opacity=".55"/></pattern>
<linearGradient id="vz-lake" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#5E9AA0"/><stop offset="1" stop-color="#2E6A76"/></linearGradient></defs>
<path d="M150 170C200 120 290 100 380 92C320 120 250 150 200 180Z" fill="url(#vz-vines)"/><path d="M150 196C180 150 230 150 260 162C230 176 190 190 170 204Z" fill="url(#vz-vines)"/>
<path d="${LAKE}" fill="none" stroke="#1F4E5A" stroke-width="6" transform="translate(0 3)" opacity=".1"/><path d="${LAKE}" fill="url(#vz-lake)"/>
${pin('Keszthely', 70, 250, 'end')}${pin('Badacsony', 206, 196, 'end')}${pin('Tihany', 400, 116, 'middle')}${pin('Siófok', 534, 140, 'start')}
<g class="vz-pin vz-pin--home"><circle cx="468" cy="158" r="14" class="vz-pin-pulse"/><circle cx="468" cy="158" r="6"/><text x="476" y="180">Vízszél Villa</text></g>
<g class="vz-compass" transform="translate(586 238)"><circle r="18"/><path d="M0 -14L5 0L0 14L-5 0Z"/><text y="-24" text-anchor="middle">É</text></g>
<g class="vz-scale" transform="translate(40 40)"><line x1="0" x2="60" y1="0" y2="0"/><text x="0" y="-8">10 km</text></g>`;
const ROUTES: Record<string, string> = {
  vitorla: 'M470 152C488 128 522 110 556 98C574 92 584 100 568 110C540 126 502 140 470 152',
  bor: 'M468 156C446 168 424 162 412 150C402 132 372 130 330 140C290 152 252 168 214 192',
  bicikli: 'M468 160C424 180 366 198 304 218C244 238 184 252 124 266',
};

function BalatonMap({ active }: { active: string }) {
  return (
    <svg viewBox="0 0 640 300" className="vz-map" role="img" aria-label="A Balaton vázlatos térképe az élmények útvonalaival">
      <g dangerouslySetInnerHTML={{ __html: MAP }} />
      {Object.entries(ROUTES).map(([k, p]) => (
        <path key={k} d={p} pathLength={1} className={`vz-route ${active === k ? 'is-on' : ''}`} />
      ))}
    </svg>
  );
}

/* ---------- sections ---------- */
function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`vz-wordmark ${className}`}>
      <svg viewBox="0 0 40 24" aria-hidden className="vz-mark">
        <circle cx="20" cy="12" r="7" />
        <path d="M2 16 C10 13 14 19 20 16 S30 13 38 16 M6 21 C12 19 16 22 20 20.5 S28 19 34 21" />
      </svg>
      Vízszél <i>Villa</i>
    </span>
  );
}

function Nav() {
  const solid = useScrolledPast(40);
  return (
    <nav className={`vz-nav ${solid ? 'is-solid' : ''}`} aria-label="Vízszél Villa">
      <div className="vz-wrap vz-nav-in">
        <a href="#top" onClick={jump('top')} aria-label="Vízszél Villa – kezdőlap">
          <Wordmark />
        </a>
        <div className="vz-nav-links">
          {[
            ['szobak', 'Szobák'],
            ['wellness', 'Wellness'],
            ['gasztro', 'Gasztronómia'],
            ['elmenyek', 'Élmények'],
            ['ajanlatok', 'Ajánlatok'],
          ].map(([id, l]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {l}
            </a>
          ))}
        </div>
        <a href="#foglalas" onClick={jump('foglalas')} className="vz-btn vz-btn--sm vz-btn--coral">
          Foglalás
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="vz-hero" id="top">
      <div className="vz-scene-wrap">
        <Art html={HERO} className="vz-scene" vb="0 0 1600 900" par="xMidYMid slice" />
      </div>
      <div className="vz-hero-shade" aria-hidden />
      <div className="vz-wrap vz-hero-in">
        <p className="vz-eyebrow vz-eyebrow--light" data-reveal>
          Butikhotel & spa · Balaton déli part · 14 szoba
        </p>
        <h1 className="vz-h1" data-reveal style={d(120)}>
          <span className="vz-line">
            <span>Ahol a tó</span>
          </span>
          <span className="vz-line">
            <span>
              <em>lassabban</em>
            </span>
          </span>
          <span className="vz-line">
            <span>lélegzik.</span>
          </span>
        </h1>
        <p className="vz-lead vz-lead--light" data-reveal style={d(520)}>
          Tizennégy szoba egy századfordulós villában, saját stéggel, nádassal és a naplementével, amely minden este a
          teraszunk előtt ér vízre.
        </p>
        <div className="vz-cta-row" data-reveal style={d(640)}>
          <a href="#szobak" onClick={jump('szobak')} className="vz-btn vz-btn--coral">
            Szobák és árak <span aria-hidden>→</span>
          </a>
          <a href="#ajanlatok" onClick={jump('ajanlatok')} className="vz-btn vz-btn--glass">
            Csomagajánlatok
          </a>
        </div>
      </div>
      <div className="vz-hero-meta vz-wrap" data-reveal style={d(760)}>
        <span>
          <b>19:42</b> ma a naplemente
        </span>
        <span>
          <b>23 °C</b> a víz hőmérséklete
        </span>
      </div>
    </header>
  );
}

type Booking = { arr: string; dep: string; guests: number; room: string };

function quote(b: Booking) {
  const room = ROOMS.find((r) => r.id === b.room) ?? ROOMS[0];
  const nights = Math.max(0, nightsBetween(b.arr, b.dep) || 0);
  const tax = nights * b.guests * TAX;
  return { room, nights, tax, total: nights * room.price + tax };
}

function BookingBar({ b, set, onBook, pulse }: { b: Booking; set: (p: Partial<Booking>) => void; onBook: () => void; pulse: number }) {
  const today = iso(new Date());
  const { room, nights, tax, total } = quote(b);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onBook();
  };

  return (
    <form className={`vz-book ${pulse ? 'is-pulse' : ''}`} onSubmit={submit} noValidate aria-label="Foglalás">
      <label className="vz-field">
        <span>Érkezés</span>
        <input
          type="date"
          value={b.arr}
          min={today}
          onChange={(e) => {
            const arr = e.target.value;
            set(arr && nightsBetween(arr, b.dep) < 1 ? { arr, dep: addDays(arr, 1) } : { arr });
          }}
        />
      </label>
      <label className="vz-field">
        <span>Távozás</span>
        <input type="date" value={b.dep} min={b.arr ? addDays(b.arr, 1) : today} onChange={(e) => set({ dep: e.target.value })} />
      </label>
      <div className="vz-field vz-field--guests">
        <span id="vz-guests-l">Vendégek</span>
        <div className="vz-stepper" role="group" aria-labelledby="vz-guests-l">
          <button type="button" aria-label="Kevesebb vendég" disabled={b.guests <= 1} onClick={() => set({ guests: b.guests - 1 })}>
            −
          </button>
          <output aria-live="polite">{b.guests} fő</output>
          <button type="button" aria-label="Több vendég" disabled={b.guests >= room.cap} onClick={() => set({ guests: b.guests + 1 })}>
            +
          </button>
        </div>
      </div>
      <label className="vz-field vz-field--room">
        <span>Szoba</span>
        <select
          value={b.room}
          onChange={(e) => {
            const r = ROOMS.find((x) => x.id === e.target.value) ?? ROOMS[0];
            set({ room: r.id, guests: Math.min(b.guests, r.cap) });
          }}
        >
          {ROOMS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      <div className="vz-book-total" aria-live="polite">
        <span className="vz-book-calc">
          {nights} éj × {ft(room.price)} + IFA {ft(tax)}
        </span>
        <strong>{ft(total)}</strong>
      </div>
      <button type="submit" className="vz-btn vz-btn--coral vz-book-go">
        Foglalás
      </button>
    </form>
  );
}

/** a slim docked summary that follows the visitor once the full booking bar has scrolled away */
function Dock({ b, show, pulse, onBook }: { b: Booking; show: boolean; pulse: number; onBook: () => void }) {
  const { room, nights, total } = quote(b);
  return (
    <div className={`vz-dock ${show ? 'is-on' : ''} ${pulse ? 'is-pulse' : ''}`} aria-hidden={!show}>
      <a href="#foglalas" onClick={jump('foglalas')} className="vz-dock-info" tabIndex={show ? 0 : -1}>
        <span className="vz-dock-room">{room.name}</span>
        <span className="vz-dock-sub">
          {nights} éj · {b.guests} fő · <u>módosítás</u>
        </span>
      </a>
      <strong className="vz-dock-total">{ft(total)}</strong>
      <button type="button" className="vz-btn vz-btn--coral vz-btn--sm" onClick={onBook} tabIndex={show ? 0 : -1}>
        Foglalás
      </button>
    </div>
  );
}

function Press() {
  const row = (
    <>
      {PRESS.map((p, i) => (
        <span key={p} className={`vz-press-item vz-press-item--${i % 3}`}>
          {p}
          <i aria-hidden>✦</i>
        </span>
      ))}
    </>
  );
  return (
    <section className="vz-press" aria-label="Rólunk írták">
      <p className="vz-press-label">Rólunk írták</p>
      <div className="vz-marquee" aria-hidden>
        <div className="vz-marquee-track">
          {row}
          {row}
        </div>
      </div>
    </section>
  );
}

function Intro() {
  const [ref, seen] = useInView<HTMLDListElement>(0.4);
  const rooms = useCountUp(14, seen, 1400);
  const steps = useCountUp(90, seen, 1600);
  const year = useCountUp(1908, seen, 1800);
  return (
    <section className="vz-intro" id="villa">
      <div className="vz-wrap vz-intro-grid">
        <div>
          <p className="vz-eyebrow" data-reveal>
            A villa
          </p>
          <h2 className="vz-h2" data-reveal style={d(80)}>
            Egy ház, amely a <em>vízre</em> figyel.
          </h2>
        </div>
        <div>
          <p className="vz-body vz-body--lg" data-reveal style={d(140)}>
            A Vízszél egy 1908-ban épült nyaralóból lett szálloda, de ma is úgy működik, mint egy jó barát nyári háza:
            nincs lobbi zsivaj, nincs animáció. Van viszont reggel friss kalács, délután hűtött bor, este pedig egy pokróc a
            stégen.
          </p>
          <dl className="vz-stats" ref={ref}>
            <div>
              <dt>szoba és lakosztály</dt>
              <dd>{Math.round(rooms)}</dd>
            </div>
            <div>
              <dt>lépés a víz partjáig</dt>
              <dd>{Math.round(steps)}</dd>
            </div>
            <div>
              <dt>óta áll a villa</dt>
              <dd>{Math.round(year)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="vz-wrap vz-pillars">
        {[
          ['I.', 'Saját stég és nádas', 'Hajnalban kajakkal, délben egy könyvvel, este egy pohár borral. A stég a vendégeinké.'],
          ['II.', 'Lassú reggelek', 'Reggeli tizenegyig a tóra néző teraszon, helyi termelők sajtjaival, mézével és barackjával.'],
          ['III.', 'Meleg víz, egész évben', 'Panorámás medence 32 fokon, finn szauna és sókamra — télen a legszebb.'],
        ].map(([n, h, p], i) => (
          <article key={n} className="vz-pillar" data-reveal style={d(i * 120)}>
            <span className="vz-pillar-n">{n}</span>
            <h3>{h}</h3>
            <p>{p}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Rooms({ onPick }: { onPick: (id: string) => void }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const t = track.current;
    if (!t || !('IntersectionObserver' in window)) return;
    const first = t.firstElementChild;
    const last = t.lastElementChild;
    if (!first || !last) return;
    const io = new IntersectionObserver(
      (es) => {
        setEdge((prev) => {
          const next = { ...prev };
          for (const e of es) {
            if (e.target === first) next.start = e.intersectionRatio > 0.9;
            if (e.target === last) next.end = e.intersectionRatio > 0.9;
          }
          return next;
        });
      },
      { root: t, threshold: [0, 0.9, 1] },
    );
    io.observe(first);
    io.observe(last);
    return () => io.disconnect();
  }, []);

  const move = (dir: number) => {
    const t = track.current;
    const card = t?.firstElementChild as HTMLElement | null;
    if (!t || !card) return;
    t.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <section className="vz-rooms" id="szobak">
      <div className="vz-wrap vz-rooms-head">
        <div>
          <p className="vz-eyebrow" data-reveal>
            Szobák és lakosztályok
          </p>
          <h2 className="vz-h2" data-reveal style={d(80)}>
            Öt hangulat, <em>egy kilátás.</em>
          </h2>
        </div>
        <div className="vz-arrows" data-reveal style={d(160)}>
          <button type="button" aria-label="Előző szoba" disabled={edge.start} onClick={() => move(-1)}>
            ←
          </button>
          <button type="button" aria-label="Következő szoba" disabled={edge.end} onClick={() => move(1)}>
            →
          </button>
        </div>
      </div>
      <ul className="vz-track" ref={track} aria-label="Szobák">
        {ROOMS.map((r, i) => (
          <li key={r.id} className="vz-room" data-reveal style={d(i * 90)}>
            <div className="vz-room-media">
              <Art html={roomSvg(r, i)} className="vz-room-art" vb="0 0 400 300" />
              <span className="vz-room-tag">{r.tag}</span>
            </div>
            <div className="vz-room-body">
              <h3>{r.name}</h3>
              <ul className="vz-room-meta">
                <li>{r.size} m²</li>
                <li>{r.view}</li>
                <li>max. {r.cap} fő</li>
              </ul>
              <div className="vz-room-foot">
                <p className="vz-room-price">
                  <strong>{ft(r.price)}</strong>
                  <span>/ éj, reggelivel</span>
                </p>
                <button type="button" className="vz-btn vz-btn--line vz-btn--sm" onClick={() => onPick(r.id)}>
                  Ezt választom
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Spa() {
  const rituals: Array<[string, string, string]> = [
    ['Nádas-olajos masszázs', '60 perc', '24 000 Ft'],
    ['Bazaltköves hátmasszázs', '45 perc', '19 000 Ft'],
    ['Levendulás testpakolás', '50 perc', '21 000 Ft'],
    ['Páros rituálé naplementekor', '90 perc', '52 000 Ft'],
  ];
  return (
    <section className="vz-spa" id="wellness">
      <div className="vz-wrap vz-spa-grid">
        <div className="vz-spa-media" data-reveal>
          <Art html={SPA} className="vz-spa-art" />
          <div className="vz-spa-badge">
            <b>32 °C</b>
            <span>panorámás medence</span>
          </div>
        </div>
        <div>
          <p className="vz-eyebrow vz-eyebrow--light" data-reveal>
            Spa & wellness
          </p>
          <h2 className="vz-h2 vz-h2--light" data-reveal style={d(80)}>
            A medence széle <em>a tóban</em> ér véget.
          </h2>
          <p className="vz-body vz-body--light" data-reveal style={d(140)}>
            Kilencszáz négyzetméter csend a kert mélyén: végtelenített medence a tó felé, finn és bioszauna, sókamra,
            pihenőterasz pokrócokkal. Kezeléseinkhez balatoni levendulát és felvidéki gyógynövényeket használunk.
          </p>
          <ul className="vz-rituals" data-reveal style={d(200)}>
            {rituals.map(([n, t, p]) => (
              <li key={n}>
                <span>{n}</span>
                <i aria-hidden />
                <span className="vz-ritual-t">{t}</span>
                <b>{p}</b>
              </li>
            ))}
          </ul>
          <p className="vz-fine vz-fine--light" data-reveal style={d(240)}>
            Nyitva minden nap 7 és 22 óra között · a felnőttzóna 16 éves kortól
          </p>
        </div>
      </div>
    </section>
  );
}

function Gastro() {
  const wines: Array<[string, string, string, string]> = [
    ['Olaszrizling', 'Bazaltkert Birtok · 2024', 'Mandula, sárgabarack, sós lecsengés.', '#E9D58F'],
    ['Kéknyelű', 'Szélhegy Pince · 2023', 'Feszes sav, vulkáni ásványosság, hárs.', '#DCC873'],
    ['Szürkebarát', 'Kőhegyi Műhely · 2022', 'Méz, érett körte, krémes test.', '#E3B66A'],
  ];
  return (
    <section className="vz-gastro" id="gasztro">
      <div className="vz-wrap">
        <div className="vz-gastro-head">
          <p className="vz-eyebrow" data-reveal>
            Gasztronómia
          </p>
          <h2 className="vz-h2" data-reveal style={d(80)}>
            Reggeli a teraszon, <em>bor a hegyről.</em>
          </h2>
        </div>
        <div className="vz-gastro-grid">
          <article className="vz-gastro-card vz-gastro-card--art" data-reveal>
            <Art html={TERRACE} className="vz-gastro-art" par="xMidYMax slice" />
            <div className="vz-gastro-cap">
              <h3>Teraszreggeli 7:30 – 11:00</h3>
              <p>Kovászos kenyér a falu pékjétől, kecskesajt Zánkáról, akácméz, barackdzsem és tojásételek rendelésre. Az asztalokat úgy terítjük, hogy mindenki a vízre lásson.</p>
            </div>
          </article>
          <article className="vz-gastro-card vz-gastro-card--dinner" data-reveal style={d(120)}>
            <p className="vz-eyebrow">Esti menü · Csütörtöktől vasárnapig</p>
            <h3>Öt fogás, a tó körül szedve</h3>
            <ol className="vz-menu">
              <li>Füstölt fogas, savanyított retek, kapor</li>
              <li>Hideg meggyleves, tárkonyos tejföl</li>
              <li>Lassan sült kacsamell, szilva, rozmaring</li>
              <li>Kecskesajt, akácméz, dió</li>
              <li>Levendulás krémes, sós karamell</li>
            </ol>
            <p className="vz-menu-price">
              <b>24 000 Ft</b> / fő · borpárosítással <b>36 000 Ft</b>
            </p>
          </article>
          <article className="vz-gastro-card vz-gastro-card--wine" data-reveal style={d(200)}>
            <p className="vz-eyebrow">Az északi part borai</p>
            <ul className="vz-wines">
              {wines.map(([n, w, t, c]) => (
                <li key={n}>
                  <span className="vz-glass" style={{ '--wine': c } as CSSProperties} aria-hidden />
                  <div>
                    <h4>{n}</h4>
                    <span className="vz-wine-house">{w}</span>
                    <p>{t}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function Experiences() {
  const [act, setAct] = useState(EXP[0].id);
  const cur = EXP.find((e) => e.id === act) ?? EXP[0];
  return (
    <section className="vz-exp" id="elmenyek">
      <div className="vz-wrap vz-exp-grid">
        <div>
          <p className="vz-eyebrow" data-reveal>
            Környék és élmények
          </p>
          <h2 className="vz-h2" data-reveal style={d(80)}>
            Vitorla, <em>borhegy,</em> kerékpár.
          </h2>
          <div className="vz-tabs" role="tablist" aria-label="Élmények" data-reveal style={d(140)}>
            {EXP.map((e) => (
              <button key={e.id} type="button" role="tab" aria-selected={act === e.id} className={act === e.id ? 'is-on' : ''} onClick={() => setAct(e.id)}>
                {e.tab}
              </button>
            ))}
          </div>
          <div className="vz-exp-panel" key={cur.id} role="tabpanel">
            <h3>{cur.title}</h3>
            <p>{cur.text}</p>
            <dl>
              {cur.meta.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="vz-map-card" data-reveal style={d(160)}>
          <BalatonMap active={act} />
          <p className="vz-fine">Vázlatos térkép · a villa a déli part egy csendes öblében áll</p>
        </div>
      </div>
    </section>
  );
}

function Offers({ onPick }: { onPick: (room: string, nights: number, name: string) => void }) {
  return (
    <section className="vz-offers" id="ajanlatok">
      <div className="vz-wrap">
        <p className="vz-eyebrow vz-eyebrow--light vz-center" data-reveal>
          Csomagajánlatok
        </p>
        <h2 className="vz-h2 vz-h2--light vz-center" data-reveal style={d(80)}>
          Maradjon <em>egy kicsit tovább.</em>
        </h2>
        <div className="vz-offer-grid">
          {OFFERS.map((o, i) => (
            <article key={o.id} className={`vz-offer ${o.featured ? 'is-featured' : ''}`} data-reveal style={d(i * 110)}>
              {o.featured && <span className="vz-badge">Vendégeink kedvence</span>}
              <p className="vz-offer-season">{o.season}</p>
              <h3>{o.name}</h3>
              <p className="vz-offer-price">
                <strong>{ft(o.from)}</strong>
                <span>-tól / 2 fő / {o.nights} éj</span>
              </p>
              <ul>
                {o.perks.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <button type="button" className={`vz-btn vz-btn--block ${o.featured ? 'vz-btn--coral' : 'vz-btn--glass'}`} onClick={() => onPick(o.room, o.nights, o.name)}>
                Ezt kérem
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quotes() {
  return (
    <section className="vz-quotes">
      <div className="vz-wrap">
        <p className="vz-eyebrow vz-center" data-reveal>
          Vendégeink írták
        </p>
        <div className="vz-quote-grid">
          {QUOTES.map(([q, who, where], i) => (
            <figure key={who} className="vz-quote" data-reveal style={d(i * 120)}>
              <span className="vz-stars" aria-label="5 csillag">
                ★★★★★
              </span>
              <blockquote>{q}</blockquote>
              <figcaption>
                <b>{who}</b>
                <span>{where}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="vz-fine vz-center" data-reveal>
          A vélemények fiktívek — a Vízszél Villa egy design-bemutató része.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="vz-faq" id="gyik">
      <div className="vz-wrap vz-faq-grid">
        <div>
          <p className="vz-eyebrow" data-reveal>
            Gyakori kérdések
          </p>
          <h2 className="vz-h2" data-reveal style={d(80)}>
            Mielőtt <em>útnak indul.</em>
          </h2>
          <p className="vz-body" data-reveal style={d(140)}>
            Nem talál választ? Írjon nekünk, a recepció 8 és 22 óra között egy órán belül válaszol.
          </p>
        </div>
        <div className="vz-acc">
          {FAQ.map(([q, a], n) => (
            <div key={q} className={`vz-acc-item ${open === n ? 'is-open' : ''}`} data-reveal style={d(n * 60)}>
              <button type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                {q}
                <span aria-hidden />
              </button>
              <div className="vz-acc-body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="vz-final">
      <Art html={NIGHT} className="vz-night-art" vb="0 0 1600 700" par="xMidYMax slice" />
      <div className="vz-wrap vz-final-in">
        <p className="vz-eyebrow vz-eyebrow--light" data-reveal>
          A tó vár
        </p>
        <h2 className="vz-h1 vz-h1--mid" data-reveal style={d(80)}>
          Foglalja le <em>a naplementét.</em>
        </h2>
        <p className="vz-lead vz-lead--light" data-reveal style={d(160)}>
          Közvetlen foglalás esetén a legjobb árat, késői kijelentkezést és egy palack északi parti bort adunk ajándékba.
        </p>
        <div className="vz-cta-row" data-reveal style={d(240)}>
          <a href="#foglalas" onClick={jump('foglalas')} className="vz-btn vz-btn--coral">
            Időpontot választok <span aria-hidden>→</span>
          </a>
          <a href="#gyik" onClick={jump('gyik')} className="vz-btn vz-btn--glass">
            Kérdésem van
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ['A villa', ['Szobák', 'Wellness', 'Gasztronómia', 'Élmények']],
    ['Tervezés', ['Csomagok', 'Ajándékutalvány', 'Rendezvények', 'Megközelítés']],
    ['Kapcsolat', ['+36 84 000 000', 'hello@vizszel.example', 'Vízszél sor 1., Balaton']],
  ];
  return (
    <footer className="vz-footer">
      <div className="vz-wrap">
        <div className="vz-footer-grid">
          <div>
            <Wordmark className="vz-wordmark--xl" />
            <p className="vz-fine vz-fine--light">Balaton déli part · nyitva egész évben</p>
          </div>
          {cols.map(([h, l]) => (
            <div key={h}>
              <h4>{h}</h4>
              <ul>
                {l.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="vz-footer-base">
          <span>© {new Date().getFullYear()} Vízszél Villa</span>
          <span>A Vízszél Villa fiktív márka — David Mészáros landing page koncepciója.</span>
        </div>
      </div>
    </footer>
  );
}

export default function Vizszel() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [toast, notify] = useToast(4200);
  const [b, setB] = useState<Booking>(() => {
    const arr = addDays(iso(new Date()), 14);
    return { arr, dep: addDays(arr, 3), guests: 2, room: 'naplemente' };
  });
  const [pulse, setPulse] = useState(0);
  const set = (p: Partial<Booking>) => setB((prev) => ({ ...prev, ...p }));

  // the dock shows once the page is past the hero and the full bar is out of view (observer, no scroll handler)
  const past = useScrolledPast(700);
  const slot = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(true);
  useEffect(() => {
    const el = slot.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const dock = past && !barVisible;

  const book = () => {
    const q = quote(b);
    if (!b.arr || !b.dep || q.nights < 1) {
      notify('A távozás napja legyen legalább egy nappal az érkezés után.');
      return;
    }
    notify(`Foglalási kérés: ${q.room.name}, ${q.nights} éj, ${b.guests} fő — ${ft(q.total)}. (Design-bemutató, nem történt foglalás.)`);
  };

  const bringBar = () => setPulse((n) => n + 1);

  const pickRoom = (id: string) => {
    const r = ROOMS.find((x) => x.id === id) ?? ROOMS[0];
    set({ room: id, guests: Math.min(b.guests, r.cap) });
    bringBar();
    notify(`${r.name} kiválasztva — az árat lent, a foglalási sávban látja.`);
  };

  const pickOffer = (room: string, nights: number, name: string) => {
    set({ room, dep: addDays(b.arr, nights), guests: 2 });
    setPulse((n) => n + 1);
    document.getElementById('foglalas')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    notify(`„${name}” betöltve: ${nights} éj — ellenőrizze a dátumokat a foglalási sávban.`);
  };

  // the pulse is only a visual cue on the booking bar; clear it so it can replay
  useEffect(() => {
    if (!pulse) return;
    const t = window.setTimeout(() => setPulse(0), 1400);
    return () => window.clearTimeout(t);
  }, [pulse]);

  return (
    <div ref={root} className={`vizszel ${dock ? 'has-dock' : ''}`}>
      <Nav />
      <Hero />
      <div className="vz-stay">
        <div id="foglalas" className="vz-anchor" />
        <div className="vz-book-slot" ref={slot}>
          <div className="vz-wrap">
            <BookingBar b={b} set={set} onBook={book} pulse={pulse} />
          </div>
        </div>
        <Press />
        <Intro />
        <Rooms onPick={pickRoom} />
      </div>
      <Spa />
      <Gastro />
      <Experiences />
      <Offers onPick={pickOffer} />
      <Quotes />
      <Faq />
      <FinalCta />
      <Footer />
      <Dock b={b} show={dock} pulse={pulse} onBook={book} />
      <div className={`vz-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
