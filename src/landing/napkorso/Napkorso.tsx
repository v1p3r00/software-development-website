import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import '@fontsource-variable/cormorant';
import '@fontsource-variable/cormorant/wght-italic.css';
import '@fontsource-variable/manrope';
import './napkorso.css';
import { jump, reducedMotion, useCountUp, useInView, usePointerTilt, useReveal, useScrolledPast, useToast } from '../kit';

/**
 * Napkorsó Birtok — a fictional family winery in Tokaj.
 * Heritage, warm, golden: a code-drawn golden pour, a vintage timeline, a tasting radar and a cellar booking.
 */

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
const ft = (n: number) => `${Math.round(n).toLocaleString('hu-HU')} Ft`;

/* ------------------------------------------------------------------ data */

type Weather = 'sun' | 'rain' | 'fog' | 'frost' | 'cloud';
const VINTAGES: Array<{ y: number; w: Weather; tag: string; note: string; harvest: string; aszu: number; r: number }> = [
  { y: 2013, w: 'cloud', tag: 'Kései botritisz', note: 'Meleg nyár, esős október eleje. A nemes rothadás későn érkezett, de tisztán és egyenletesen — a türelem évjárata.', harvest: 'okt. 14 – nov. 22.', aszu: 14, r: 4 },
  { y: 2014, w: 'rain', tag: 'Hűvös és csapadékos', note: 'Szinte egész évben esett. Aszú alig készült, a száraz furmintok viszont feszesek, sósak, hosszan érlelhetők.', harvest: 'szept. 29 – okt. 30.', aszu: 3, r: 2.5 },
  { y: 2015, w: 'sun', tag: 'Napfényes ősz', note: 'Forró, száraz nyár után tökéletes, ködös reggelekkel teli ősz. Telt, mézes borok, ragyogó savgerinccel.', harvest: 'okt. 6 – nov. 18.', aszu: 18, r: 4.5 },
  { y: 2016, w: 'frost', tag: 'Tavaszi fagy', note: 'Áprilisi fagy csípte meg a dűlők alját. Kevesebb termés, de elegáns, ásványos, krétás furmintok.', harvest: 'okt. 3 – nov. 9.', aszu: 9, r: 3.5 },
  { y: 2017, w: 'fog', tag: 'Nagy aszúévjárat', note: 'Kiegyensúlyozott év: ködös hajnalok, napos délutánok. A Bodrog párája szinte minden fürtre ráült — a ház aszúinak csúcsa.', harvest: 'okt. 9 – nov. 28.', aszu: 26, r: 5 },
  { y: 2018, w: 'sun', tag: 'Korai bőség', note: 'Korai, bőséges szüret. Gyümölcsös, kerek, barátságos borok, amelyeket fiatalon is öröm inni.', harvest: 'szept. 18 – okt. 26.', aszu: 11, r: 3.5 },
  { y: 2019, w: 'sun', tag: 'Koncentrált fürtök', note: 'Száraz ősz, apró, sűrű bogyók. Ideális szamorodni-év: dió, aszalt barack, füst és hosszú, sós lecsengés.', harvest: 'szept. 30 – nov. 12.', aszu: 17, r: 4.5 },
  { y: 2020, w: 'cloud', tag: 'Lassú érés', note: 'Hosszú, hűvös vegetáció, november közepéig tartó szüret. A késői szüretelésű borok különösen finomra sikerültek.', harvest: 'okt. 5 – nov. 17.', aszu: 15, r: 4 },
  { y: 2021, w: 'fog', tag: 'Friss savak', note: 'Hűvös tavasz, aranyló szeptember. Élénk, ropogós savak és tiszta gyümölcs — klasszikus hegyaljai profil.', harvest: 'okt. 1 – nov. 15.', aszu: 13, r: 4 },
  { y: 2022, w: 'sun', tag: 'Aszály és megváltás', note: 'Nyári aszály, majd szeptemberi eső, ami megmentette az évet. Testes, érett borok, kicsit alacsonyabb savval.', harvest: 'szept. 20 – okt. 29.', aszu: 10, r: 3.5 },
  { y: 2023, w: 'fog', tag: 'Illatos ősz', note: 'Szép, egészséges botritisz és rendkívül illatos muskotályok. Az aszúk még hordóban pihennek.', harvest: 'szept. 26 – nov. 10.', aszu: 19, r: 4.5 },
  { y: 2024, w: 'frost', tag: 'Kevés, de kincs', note: 'Korai fagy, korai szüret, kis termés. Amit leszedtünk, az viszont tiszta, koncentrált és nagyon ígéretes.', harvest: 'szept. 12 – okt. 21.', aszu: 7, r: 3.5 },
];

const AXES = ['Édesség', 'Savasság', 'Test', 'Gyümölcs', 'Ásványosság'];
type Wine = { id: string; name: string; year: number; style: string; v: number[]; pair: string; price: number; vol: string; abv: string; label: string; glass: string; note: string };
const WINES: Wine[] = [
  { id: 'hajnalpir', name: 'Hajnalpír Furmint', year: 2022, style: 'Száraz fehér', v: [1.5, 8.5, 5, 6, 8.5], pair: 'Pisztráng vajban, újburgonya, kapor', price: 4900, vol: '0,75 l', abv: '12,5%', label: '#EFE3B8', glass: '#9AA65A', note: 'Zöldalma, birs és nedves kő; reggeli frissesség a Rigócsőr-dűlőből.' },
  { id: 'varjuko', name: 'Varjúkő Hárslevelű', year: 2021, style: 'Félszáraz fehér', v: [4, 6, 6, 8, 6], pair: 'Kecskesajt, sült körte, pirított dió', price: 5600, vol: '0,75 l', abv: '12%', label: '#E8CF93', glass: '#A39248', note: 'Hársvirág, méz és körte; selymes, kerek, hosszan illatos.' },
  { id: 'kodlato', name: 'Ködlátó Szamorodni', year: 2019, style: 'Száraz szamorodni', v: [2, 6.5, 8, 5, 9], pair: 'Füstölt mandula, érlelt sonka, kemény sajt', price: 7400, vol: '0,5 l', abv: '14%', label: '#D9B26A', glass: '#7A5A22', note: 'Dió, aszalt barack, füst; hártya alatt érlelve, sósan hosszú.' },
  { id: 'mezhold', name: 'Mézhold Sárgamuskotály', year: 2023, style: 'Édeskés fehér', v: [6, 5.5, 4, 9.5, 3.5], pair: 'Barackos lepény, kókuszos curry', price: 4200, vol: '0,75 l', abv: '11%', label: '#F1D88A', glass: '#B9A251', note: 'Szőlővirág, bodza, friss őszibarack — nyári esték bora.' },
  { id: 'aranyeso', name: 'Aranyeső Késői szüret', year: 2020, style: 'Édes fehér', v: [7.5, 7, 6.5, 8.5, 5.5], pair: 'Libamáj, karamellizált alma', price: 8900, vol: '0,5 l', abv: '11,5%', label: '#E7B54B', glass: '#A6741F', note: 'Narancshéj, sárgabarack, akácméz; édes, mégis légies.' },
  { id: 'aszu', name: 'Dérfalvi Aszú 6 puttonyos', year: 2017, style: 'Aszú', v: [9.5, 9, 9, 9, 7], pair: 'Kéksajt, narancsos étcsokoládé-torta', price: 18900, vol: '0,5 l', abv: '10,5%', label: '#C99A2E', glass: '#6E3B12', note: 'Füge, kandírozott narancs, sáfrány; végtelen, vibráló savak.' },
];

type Plot = { id: string; name: string; ha: number; soil: string; aspect: string; grape: string; path: string; lx: number; ly: number; note: string };
const PLOTS: Plot[] = [
  { id: 'rigo', name: 'Rigócsőr', ha: 2.4, soil: 'riolittufa', aspect: 'dél-délnyugat', grape: 'Furmint', path: 'M118 262 L206 224 L238 278 L150 314 Z', lx: 178, ly: 272, note: 'A legkorábban kelő dűlő; ebből születik a Hajnalpír.' },
  { id: 'napkorso', name: 'Napkorsó', ha: 3.1, soil: 'andezit, agyag', aspect: 'dél', grape: 'Furmint, Hárslevelű', path: 'M212 220 L318 186 L344 250 L244 274 Z', lx: 278, ly: 236, note: 'A névadó dűlő, korsó alakú katlan — délben itt a legforróbb.' },
  { id: 'kodlato', name: 'Ködlátó', ha: 1.8, soil: 'löszös vályog', aspect: 'délkelet', grape: 'Furmint (szamorodni)', path: 'M324 183 L420 164 L440 226 L350 246 Z', lx: 382, ly: 208, note: 'Innen látni elsőként, ahogy reggel felszáll a Bodrog ködje.' },
  { id: 'varju', name: 'Varjúkő', ha: 2.2, soil: 'kvarcos kőtörmelék', aspect: 'délnyugat', grape: 'Hárslevelű', path: 'M426 162 L522 154 L538 214 L446 224 Z', lx: 482, ly: 192, note: 'Köves, sovány talaj, apró fürtök, koncentrált illat.' },
  { id: 'aranyhat', name: 'Aranyhát', ha: 2.9, soil: 'vörös nyirok', aspect: 'dél', grape: 'Furmint, Kövérszőlő (aszú)', path: 'M156 320 L250 282 L350 256 L372 306 L262 342 L178 356 Z', lx: 262, ly: 314, note: 'Az aszúk szíve: ködös hajlat, ahol a botritisz a legszebb.' },
  { id: 'bagoly', name: 'Kisbagoly', ha: 1.6, soil: 'lösz', aspect: 'kelet', grape: 'Sárgamuskotály', path: 'M358 254 L446 232 L540 222 L556 276 L378 304 Z', lx: 460, ly: 266, note: 'Hűvösebb keleti lejtő — itt marad meg a muskotály illata.' },
];

const PACKAGES = [
  { id: 'pince', name: 'Pincejárás', price: 6900, time: '60 perc', items: ['Séta a 18. századi járatban', '4 bor a pincemester kíséretében', 'Pogácsa, kenyér, ásványvíz'] },
  { id: 'dulo', name: 'Dűlőséta & kóstoló', price: 12900, time: '2,5 óra', items: ['Gyalogtúra a Napkorsó-dűlőbe', '6 bor, köztük szamorodni', 'Helyi sajttál és lekvárok'], featured: true },
  { id: 'aszu', name: 'Aszú-est a családdal', price: 24900, time: '4 óra', items: ['Vacsora a pince hosszú asztalánál', '8 bor, két évjárat aszúja', 'Beszélgetés Dérfalvi Annával'] },
];

const QUOTES = [
  { q: 'A pince hűvösében, gyertyafénynél kóstolni a 2017-es aszút — azóta minden ősszel visszajárunk.', who: 'Réka és Tamás V.', where: 'Debrecen' },
  { q: 'Nem borászatban voltunk, hanem vendégségben. Anna minden dűlőről mesélt egy családi történetet.', who: 'Lőrinc B.', where: 'Budapest' },
  { q: 'A Ködlátó szamorodni a mi asztalunknál karácsonyi hagyomány lett. Sós, diós, felejthetetlen.', who: 'Hanna K.', where: 'Győr' },
];

const FAQ = [
  ['Kell előre foglalni?', 'Igen, a kóstolók kis csoportokban, legfeljebb 12 fővel indulnak, ezért előzetes foglalással fogadunk. Szüreti hétvégéken érdemes két-három héttel előbb jelentkezni.'],
  ['Mikor tartotok nyitva?', 'Keddtől vasárnapig 10 és 19 óra között. Hétfőn a család a dűlőkben dolgozik, ilyenkor a pince zárva tart.'],
  ['Mit vegyek fel a pincébe?', 'A járatban egész évben 11 °C van, és a padló helyenként egyenetlen. Egy pulóvert és kényelmes, zárt cipőt ajánlunk.'],
  ['Hazavihetem a megkóstolt borokat?', 'Természetesen. A pincében minden bort megvásárolhattok, és a Borbolt rendeléseit Magyarországon belül két munkanapon belül kiszállítjuk.'],
  ['Mi az a puttony?', 'Hagyományos, kb. 25 kilós szedőkosár. Régen azt jelezte, hány puttony aszúszemet adtak egy hordó musthoz — ma a bor édességét és koncentráltságát jelzi.'],
  ['Van program nem iszó vendégeknek?', 'Igen: a sofőröknek és gyerekeknek házi szőlőlé-kóstolót készítünk, a dűlőséta pedig mindenkinek élmény.'],
];

/* ------------------------------------------------------------------ small art */

function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="nk-mark" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        {Array.from({ length: 9 }, (_, i) => {
          const a = ((-170 + i * 20) * Math.PI) / 180;
          return <line key={i} x1={20 + Math.cos(a) * 13} y1={17 + Math.sin(a) * 13} x2={20 + Math.cos(a) * 17.5} y2={17 + Math.sin(a) * 17.5} />;
        })}
      </g>
      <path d="M14 15h12l-1.6 3.4c3.4 2 5.2 5.4 5.2 9.2 0 5.6-4.4 9.4-9.6 9.4s-9.6-3.8-9.6-9.4c0-3.8 1.8-7.2 5.2-9.2Z" fill="currentColor" />
      <path d="M26.5 21.5c3.3-.6 5 1.2 4.6 3.6-.4 2.6-3.2 3.6-5.4 3.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.4 27.5c2.8 1.6 6.4 1.6 9.2 0" fill="none" stroke="var(--parch)" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

function Wordmark() {
  return (
    <span className="nk-wordmark">
      <Mark />
      <span>
        Napkorsó<small>Birtok · Tokaj</small>
      </span>
    </span>
  );
}

function WeatherIcon({ w }: { w: Weather }) {
  return (
    <svg viewBox="0 0 32 32" className="nk-wx" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {w === 'sun' && (
          <>
            <circle cx="16" cy="16" r="6" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              return <line key={i} x1={16 + Math.cos(a) * 9.5} y1={16 + Math.sin(a) * 9.5} x2={16 + Math.cos(a) * 13} y2={16 + Math.sin(a) * 13} />;
            })}
          </>
        )}
        {w === 'cloud' && (
          <>
            <circle cx="12" cy="11" r="4.5" />
            <path d="M8 24h15a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.4 1.6A4.2 4.2 0 0 0 8 24Z" fill="var(--wx-fill, transparent)" />
          </>
        )}
        {w === 'rain' && (
          <>
            <path d="M8 18h15a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.4 1.6A4.2 4.2 0 0 0 8 18Z" />
            <path d="M11 22l-1.5 4M16 22l-1.5 4M21 22l-1.5 4" />
          </>
        )}
        {w === 'fog' && <path d="M5 11h16M9 16h18M5 21h14M11 26h14" />}
        {w === 'frost' && (
          <>
            <path d="M16 4v24M5.6 10l20.8 12M5.6 22l20.8-12" />
            <path d="M13 6.5l3 2.5 3-2.5M13 25.5l3-2.5 3 2.5" />
          </>
        )}
      </g>
    </svg>
  );
}

function Grapes({ r }: { r: number }) {
  return (
    <span className="nk-grapes" aria-label={`${r} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className={r >= i + 1 ? 'is-full' : r > i ? 'is-half' : ''} />
      ))}
    </span>
  );
}

function Bottle({ wine, className = '' }: { wine: Wine; className?: string }) {
  const slim = wine.vol === '0,5 l';
  const id = `nk-b-${wine.id}-${className.length}`;
  return (
    <svg viewBox="0 0 80 240" className={`nk-bottle ${className}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={wine.glass} stopOpacity=".95" />
          <stop offset=".35" stopColor={wine.glass} stopOpacity=".55" />
          <stop offset=".55" stopColor="#1d0b0e" stopOpacity=".55" />
          <stop offset="1" stopColor="#1d0b0e" stopOpacity=".9" />
        </linearGradient>
      </defs>
      {slim ? (
        <path d="M34 8h12v52c0 10 14 16 14 34v136c0 4-3 6-6 6H26c-3 0-6-2-6-6V94c0-18 14-24 14-34Z" fill={`url(#${id})`} />
      ) : (
        <path d="M34 8h12v46c0 14 20 20 20 42v134c0 4-3 6-6 6H20c-3 0-6-2-6-6V96c0-22 20-28 20-42Z" fill={`url(#${id})`} />
      )}
      <rect x="32.5" y="4" width="15" height="34" rx="2.5" fill="#C99A2E" />
      <rect x="32.5" y="30" width="15" height="3" fill="#8a6519" />
      <rect x={slim ? 22 : 16} y="126" width={slim ? 36 : 48} height="64" rx="3" fill={wine.label} />
      <rect x={slim ? 25 : 19} y="129" width={slim ? 30 : 42} height="58" rx="2" fill="none" stroke="#5B1A27" strokeOpacity=".35" />
      <circle cx="40" cy="146" r="6" fill="none" stroke="#5B1A27" strokeWidth="1.2" />
      <path d="M34 164h12M31 171h18M35 178h10" stroke="#5B1A27" strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
      <path d="M24 102c-2 30-2 90 0 124" stroke="#fff" strokeOpacity=".28" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** static, decorative SVG markup is kept as strings: far smaller than JSX for art that never changes */
const html = (h: string) => ({ dangerouslySetInnerHTML: { __html: h } });
const grad = (id: string, a: string, b: string, h = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${h ? 0 : 1}" y2="${h ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** the layered vineyard hills, reused by hero and final CTA */
const hills = (id: string) =>
  `<defs>${grad(id + 1, '#E9C985', '#D8AE5E')}${grad(id + 2, '#C99A2E', '#A87A1E')}${grad(id + 3, '#8A3442', '#5B1A27')}${grad(id + 4, '#4A1320', '#2E0A13')}</defs>` +
  `<path d="M0 338C90 300 170 318 250 292S420 250 500 276S580 296 600 290V640H0Z" fill="url(#${id}1)" opacity=".85"/>` +
  `<g class="nk-mist"><ellipse cx="160" cy="340" rx="150" ry="14" fill="#FBF4E6" opacity=".5"/><ellipse cx="470" cy="312" rx="120" ry="11" fill="#FBF4E6" opacity=".45"/></g>` +
  `<path d="M0 392C110 352 210 372 310 340S500 322 600 352V640H0Z" fill="url(#${id}2)"/>` +
  `<g fill="none" stroke="#7d5612" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.1 9">${range(6)
    .map((i) => `<path d="M${-10 + i * 6} ${392 + i * 14}C110 ${356 + i * 15} 220 ${376 + i * 13} 320 ${346 + i * 14}S510 ${330 + i * 14} 610 ${358 + i * 13}"/>`)
    .join('')}</g>` +
  `<path d="M0 470C120 428 260 452 380 424S540 404 600 418V640H0Z" fill="url(#${id}3)"/>` +
  `<g fill="none" stroke="#C99A2E" stroke-opacity=".28" stroke-width="2" stroke-linecap="round" stroke-dasharray="0.1 11">${range(4)
    .map((i) => `<path d="M-10 ${480 + i * 16}C120 ${440 + i * 16} 260 ${462 + i * 15} 380 ${436 + i * 15}S540 ${416 + i * 15} 610 ${430 + i * 14}"/>`)
    .join('')}</g>` +
  `<path d="M0 540C150 506 320 528 460 506S570 498 600 502V640H0Z" fill="url(#${id}4)"/>`;

/* ------------------------------------------------------------------ hero */

const star = (x: number, y: number) => `M${x} ${y - 7}L${x + 2} ${y - 2}L${x + 7} ${y}L${x + 2} ${y + 2}L${x} ${y + 7}L${x - 2} ${y + 2}L${x - 7} ${y}L${x - 2} ${y - 2}Z`;
const BOWL = 'M250 398C248 470 274 506 300 506C326 506 352 470 350 398';
const pourSvg =
  `<defs><clipPath id="nk-arch"><path d="M0 640V300A300 300 0 0 1 600 300V640Z"/></clipPath>` +
  `<linearGradient id="nk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E6BE"/><stop offset=".55" stop-color="#F1CE84"/><stop offset="1" stop-color="#E5AE4F"/></linearGradient>` +
  `<radialGradient id="nk-sun"><stop offset="0" stop-color="#FFF6DA"/><stop offset=".45" stop-color="#FBE2A0"/><stop offset="1" stop-color="#FBE2A0" stop-opacity="0"/></radialGradient>` +
  `<linearGradient id="nk-wine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C657"/><stop offset=".5" stop-color="#D9A033"/><stop offset="1" stop-color="#A86E14"/></linearGradient>` +
  grad('nk-stream', '#E4B24A', '#F6D27A') +
  `<linearGradient id="nk-bglass"><stop offset="0" stop-color="#2a3a1c"/><stop offset=".3" stop-color="#4f6430"/><stop offset=".55" stop-color="#1e2a12"/><stop offset="1" stop-color="#0f160a"/></linearGradient>` +
  `<linearGradient id="nk-glassg"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#fff" stop-opacity=".12"/><stop offset=".8" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".45"/></linearGradient>` +
  `<clipPath id="nk-bowl"><path d="${BOWL}Z"/></clipPath></defs>` +
  `<g clip-path="url(#nk-arch)"><rect width="600" height="640" fill="url(#nk-sky)"/><circle cx="430" cy="210" r="150" fill="url(#nk-sun)"/>` +
  `<g class="nk-rays">${range(18)
    .map((i) => {
      const a = (i * 20 * Math.PI) / 180;
      const c = Math.cos(a);
      const s = Math.sin(a);
      return `<line x1="${(430 + c * 70).toFixed(1)}" y1="${(210 + s * 70).toFixed(1)}" x2="${(430 + c * 128).toFixed(1)}" y2="${(210 + s * 128).toFixed(1)}"/>`;
    })
    .join('')}</g>` +
  `<circle cx="430" cy="210" r="54" fill="#FCEBB8"/>` +
  `<g class="nk-birds" fill="none" stroke="#5B1A27" stroke-width="1.6" stroke-linecap="round" opacity=".55"><path d="M120 170q8-7 14 0q6-7 14 0M160 140q6-5 10 0q4-5 10 0"/></g>` +
  hills('nkh') +
  `<g transform="translate(470 262)" opacity=".85"><rect y="6" width="34" height="18" fill="#F4EDE1"/><path d="M-4 8L17-8L38 8Z" fill="#8A3442"/><rect x="13" y="13" width="7" height="11" fill="#5B1A27"/></g>` +
  `<path d="M0 586H600V640H0Z" fill="#2A0C14"/><path d="M0 586H600" stroke="#C99A2E" stroke-opacity=".5"/></g>` +
  // glass with a rising wine level
  `<ellipse cx="300" cy="582" rx="62" ry="8" opacity=".28"/>` +
  `<g clip-path="url(#nk-bowl)"><g class="nk-level"><rect x="240" y="420" width="120" height="120" fill="url(#nk-wine)"/><ellipse cx="300" cy="420" rx="60" ry="5" fill="#F8D985"/></g></g>` +
  `<ellipse class="nk-ripple" cx="300" cy="430" rx="14" ry="3" fill="none" stroke="#FFF1C4" stroke-width="1.4"/>` +
  `<path d="${BOWL}" fill="url(#nk-glassg)" stroke="#FFF8E8" stroke-opacity=".85" stroke-width="1.6"/>` +
  `<ellipse cx="300" cy="398" rx="50" ry="5" fill="none" stroke="#FFF8E8" stroke-opacity=".9" stroke-width="1.4"/>` +
  `<path d="M262 420C262 456 272 480 286 492" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M297 506V568H303V506" fill="#FFF8E8" fill-opacity=".55"/><ellipse cx="300" cy="572" rx="40" ry="6" fill="#FFF8E8" fill-opacity=".55" stroke="#FFF8E8" stroke-opacity=".9"/>` +
  // the golden stream
  `<path class="nk-stream" d="M330 306C322 330 308 360 304 470" pathLength="1" fill="none" stroke="url(#nk-stream)" stroke-width="5" stroke-linecap="round"/>` +
  // bottle: local origin is the mouth, body extends along +x
  `<g transform="translate(330 304)"><g class="nk-bottle-rot">` +
  `<path d="M0-7H62C78-7 84-30 108-30H252C258-30 262-26 262-20V20C262 26 258 30 252 30H108C84 30 78 7 62 7H0Z" fill="url(#nk-bglass)"/>` +
  `<rect x="-4" y="-9" width="44" height="18" rx="3" fill="#C99A2E"/><rect x="34" y="-9" width="5" height="18" fill="#8a6519"/>` +
  `<rect x="140" y="-30" width="78" height="60" fill="#F4EDE1"/><rect x="144" y="-26" width="70" height="52" fill="none" stroke="#5B1A27" stroke-opacity=".5"/>` +
  `<circle cx="166" r="10" fill="none" stroke="#C99A2E" stroke-width="2"/><path d="M184-8h22M184 0h18M184 8h22" stroke="#5B1A27" stroke-width="2" stroke-linecap="round" opacity=".7"/>` +
  `<path d="M112-22H246" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/></g></g>` +
  `<g class="nk-sparks" fill="#FFF3C8">${[[230, 360, 0], [372, 440, 1.2], [210, 470, 2.4], [388, 360, 3.1], [262, 300, 4.2]]
    .map(([x, y, t]) => `<path d="${star(x, y)}" style="animation-delay:${t}s"/>`)
    .join('')}</g>` +
  `<path d="M2 640V300A298 298 0 0 1 598 300V640" fill="none" stroke="#C99A2E" stroke-width="2"/>`;

function PourScene() {
  return (
    <svg
      viewBox="0 0 600 640"
      className="nk-scene"
      role="img"
      aria-label="Arany bor ömlik egy palackból a pohárba, mögötte szőlővel borított dombok"
      {...html(pourSvg)}
    />
  );
}

const sealSvg =
  `<defs><path id="nk-seal-c" d="M16 60a44 44 0 1 1 88 0a44 44 0 1 1-88 0"/></defs><circle cx="60" cy="60" r="58" fill="#5B1A27"/><circle cx="60" cy="60" r="53" fill="none" stroke="#C99A2E" stroke-opacity=".6"/>` +
  `<g class="nk-seal-text"><text font-size="10.5" letter-spacing="3.2" fill="#E9C985"><textPath href="#nk-seal-c">CSALÁDI BIRTOK · TOKAJ · 1891 · KÉZZEL SZEDVE ·</textPath></text></g>` +
  `<text x="60" y="58" text-anchor="middle" font-size="12" fill="#E9C985" letter-spacing="2">ANNO</text>` +
  `<text x="60" y="80" text-anchor="middle" font-size="24" fill="#F4EDE1" font-style="italic" class="nk-seal-y">1891</text>`;

function Seal() {
  return <svg viewBox="0 0 120 120" className="nk-seal" aria-hidden {...html(sealSvg)} />;
}

function Hero() {
  const area = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  usePointerTilt(area, tilt, 6);
  return (
    <header className="nk-hero" id="top" ref={area}>
      <div className="nk-hero-bg" aria-hidden />
      <div className="nk-wrap nk-hero-grid">
        <div className="nk-hero-copy">
          <p className="nk-kicker" data-reveal>
            <span className="nk-rule" /> Tokaj-Hegyalja · négy generáció óta
          </p>
          <h1 className="nk-h1" data-reveal style={d(80)}>
            Napfény,
            <br />
            <em>palackba zárva.</em>
          </h1>
          <p className="nk-lead" data-reveal style={d(180)}>
            A Dérfalvi család 1891 óta műveli ugyanazt a hat dűlőt a Bodrog felett. Kézzel szedett furmint, ködben érlelt aszú,
            és egy pince, ahol az idő lassabban telik.
          </p>
          <div className="nk-cta-row" data-reveal style={d(260)}>
            <a href="#booking" onClick={jump('booking')} className="nk-btn nk-btn--gold">
              Kóstoló foglalása <span aria-hidden>→</span>
            </a>
            <a href="#finder" onClick={jump('finder')} className="nk-btn nk-btn--line">
              Borkereső
            </a>
          </div>
          <dl className="nk-hero-stats" data-reveal style={d(340)}>
            <div>
              <dt>Dűlő</dt>
              <dd>6</dd>
            </div>
            <div>
              <dt>Hektár</dt>
              <dd>14</dd>
            </div>
            <div>
              <dt>Palack / év</dt>
              <dd>38 000</dd>
            </div>
          </dl>
        </div>
        <div className="nk-hero-stage" data-reveal style={d(120)}>
          <div className="nk-tilt" ref={tilt}>
            <PourScene />
          </div>
          <Seal />
          <div className="nk-hero-tag">
            <span>Most kóstolható</span>
            <b>Dérfalvi Aszú 2017</b>
          </div>
        </div>
      </div>
    </header>
  );
}

function Nav() {
  const solid = useScrolledPast(30);
  return (
    <nav className={`nk-nav ${solid ? 'is-solid' : ''}`} aria-label="Napkorsó Birtok">
      <div className="nk-wrap nk-nav-in">
        <a href="#top" onClick={jump('top')} aria-label="Napkorsó Birtok — kezdőlap">
          <Wordmark />
        </a>
        <div className="nk-nav-links">
          {[
            ['story', 'Birtok'],
            ['vintages', 'Évjáratok'],
            ['finder', 'Borok'],
            ['plots', 'Dűlők'],
            ['cellar', 'Pince'],
          ].map(([id, l]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {l}
            </a>
          ))}
        </div>
        <a href="#booking" onClick={jump('booking')} className="nk-btn nk-btn--sm nk-btn--wine">
          Kóstoló
        </a>
      </div>
    </nav>
  );
}

function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="nk-marquee" aria-hidden>
      <div className="nk-marquee-track">
        {children}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ story */

function Statement() {
  const text = 'Nem siettetjük a szőlőt. Megvárjuk a ködöt, a napot és a nemes rothadást — és csak azt szedjük le, ami már kész.';
  return (
    <section className="nk-statement">
      <div className="nk-wrap">
        <p className="nk-big" data-reveal>
          {text.split(' ').map((w, i) => (
            <span key={i} className="nk-word" style={{ '--i': i } as CSSProperties}>
              {w}{' '}
            </span>
          ))}
        </p>
        <div className="nk-pillars">
          {[
            ['Föld', 'Vulkáni riolit, andezit és vörös nyirok. A hegy ásványossága minden pohárban ott van.', 'M4 26 L12 12 L18 20 L24 8 L32 26 Z'],
            ['Idő', 'A Bodrog és a Tisza őszi párája hívja elő a botritiszt — ezt kivárni a mesterségünk.', 'M18 6 a12 12 0 1 0 0.01 0 M18 11 V18 L23 22'],
            ['Kéz', 'Aszúszemeinket szemenként, akár hat menetben szedjük. Gép nem jár a dűlőinkben.', 'M10 30 V14 a2 2 0 0 1 4 0 V12 a2 2 0 0 1 4 0 V13 a2 2 0 0 1 4 0 V16 a2 2 0 0 1 4 0 V24 c0 4-3 6-7 6Z'],
          ].map(([h, p, icon], i) => (
            <article key={h} className="nk-pillar" data-reveal style={d(i * 120)}>
              <svg viewBox="0 0 36 36" aria-hidden>
                <path d={icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <span className="nk-num">0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const DOOR_ARCH = 'M60 500V190A140 140 0 0 1 340 190V500';
const doorSvg = (() => {
  const p = (r: number, t: number) => `${(200 + Math.cos(t) * r).toFixed(1)} ${(190 + Math.sin(t) * r).toFixed(1)}`;
  const stones = range(10)
    .map((i) => {
      const a = Math.PI + (i * Math.PI) / 10;
      const b = Math.PI + ((i + 1) * Math.PI) / 10;
      return `<path d="M${p(178, a)}L${p(140, a)}A140 140 0 0 1 ${p(140, b)}L${p(178, b)}A178 178 0 0 0 ${p(178, a)}Z" fill="${i % 2 ? '#D9C7A6' : '#E6D8BE'}" stroke="#B89F76"/>`;
    })
    .join('');
  const leaves = [[40, 260], [58, 210], [96, 128], [360, 290], [340, 222], [296, 116]]
    .map(
      ([x, y]) =>
        `<path d="M${x} ${y}c-14-4-16-18-4-22c4-10 18-8 18 2c10 2 8 18-4 20Z" fill="#7E8C43"/><g fill="#C99A2E"><circle cx="${x + 6}" cy="${y + 6}" r="4"/><circle cx="${x + 13}" cy="${y + 6}" r="4"/><circle cx="${x + 9.5}" cy="${y + 12}" r="4"/><circle cx="${x + 9.5}" cy="${y + 18}" r="3.4"/></g>`,
    )
    .join('');
  return (
    `<defs>${grad('nk-wood', '#4A1A12', '#6B2C1A', false)}${grad('nk-stone', '#E2D3B8', '#CDB894')}<clipPath id="nk-doorclip"><path d="${DOOR_ARCH}Z"/></clipPath></defs>` +
    `<path d="M20 500V190A180 180 0 0 1 380 190V500Z" fill="url(#nk-stone)"/>${stones}` +
    `<path d="${DOOR_ARCH}Z" fill="url(#nk-wood)"/>` +
    `<g clip-path="url(#nk-doorclip)" stroke="#2a0c08" stroke-opacity=".5" stroke-width="2">${range(5)
      .map((i) => `<line x1="${60 + (i + 1) * 46.6}" y1="40" x2="${60 + (i + 1) * 46.6}" y2="500"/>`)
      .join('')}</g>` +
    `<path d="${DOOR_ARCH}" fill="none" stroke="#2a0c08" stroke-width="6"/>` +
    `<g fill="none" stroke="#1a0905" stroke-width="9" stroke-linecap="round"><path d="M70 250H200M70 410H200"/><path d="M200 250c20-14 40-14 54 0M200 410c20-14 40-14 54 0" stroke-width="6"/></g>` +
    `<circle cx="300" cy="340" r="14" fill="none" stroke="#C99A2E" stroke-width="4"/><circle cx="300" cy="320" r="4" fill="#C99A2E"/>` +
    `<text x="200" y="150" text-anchor="middle" fill="#C99A2E" font-size="34" font-style="italic" style="font-family:var(--display)">D · 1891</text>` +
    `<g fill="none" stroke="#6E7B3A" stroke-width="3" stroke-linecap="round"><path d="M24 300C50 260 30 220 60 190S90 120 140 80"/><path d="M376 330C350 290 372 240 344 200S300 110 250 70"/></g>${leaves}`
  );
})();

function Door() {
  return <svg viewBox="0 0 400 500" className="nk-door" aria-hidden {...html(doorSvg)} />;
}

function Story() {
  const gens = [
    ['1891', 'Dérfalvi Ignác', 'Kádármesterként vásárolja meg az első két holdat és a sziklába vájt pincét.'],
    ['1957', 'Dérfalvi Mária', 'Titokban megőrzi a régi furmint-klónokat, amikor a dűlőket összevonják.'],
    ['1994', 'Dérfalvi Gábor', 'Visszaszerzi a családi dűlőket, és újraindítja a palackozást.'],
    ['2013', 'Anna és Bence', 'A negyedik generáció: természetes erjesztés, kézi szüret, kis tételek.'],
  ];
  return (
    <section className="nk-story" id="story">
      <div className="nk-wrap nk-story-grid">
        <div className="nk-story-art" data-reveal>
          <Door />
          <p className="nk-caption">A pince bejárata, ma is az eredeti tölgyajtóval.</p>
        </div>
        <div>
          <p className="nk-kicker" data-reveal>
            <span className="nk-rule" /> A birtok története
          </p>
          <h2 className="nk-h2" data-reveal>
            Egy kádármester, <em>egy pince</em> és százharminc szüret.
          </h2>
          <p className="nk-body" data-reveal>
            A Napkorsó nevet a falu öregjei adták a déli katlannak, ahol délben úgy gyűlik a meleg, mint víz a korsóban. Dérfalvi Ignác
            itt vette meg az első tőkéket — azóta minden generáció hozzátett valamit, de elvenni senki sem mert.
          </p>
          <ol className="nk-gens">
            {gens.map(([y, who, what], i) => (
              <li key={y} data-reveal style={d(i * 90)}>
                <span className="nk-gen-y">{y}</span>
                <div>
                  <b>{who}</b>
                  <p>{what}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ vintages */

function Vintages() {
  const [sel, setSel] = useState(2017);
  const track = useRef<HTMLDivElement>(null);
  const v = VINTAGES.find((x) => x.y === sel)!;
  const center = (y: number, smooth: boolean) => {
    const t = track.current;
    const b = t?.querySelector<HTMLElement>(`[data-y="${y}"]`);
    if (t && b) t.scrollTo({ left: b.offsetLeft - t.clientWidth / 2 + b.clientWidth / 2, behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' });
  };
  useEffect(() => center(2017, false), []);
  const go = (y: number) => {
    const ny = Math.min(2024, Math.max(2013, y));
    setSel(ny);
    center(ny, true);
  };
  return (
    <section className="nk-vint" id="vintages">
      <div className="nk-wrap">
        <div className="nk-head-row">
          <div>
            <p className="nk-kicker" data-reveal>
              <span className="nk-rule" /> Évjárat-napló
            </p>
            <h2 className="nk-h2" data-reveal>
              Tizenkét ősz, <em>tizenkét karakter.</em>
            </h2>
          </div>
          <div className="nk-arrows" data-reveal>
            <button type="button" onClick={() => go(sel - 1)} disabled={sel === 2013} aria-label="Előző évjárat">
              ←
            </button>
            <button type="button" onClick={() => go(sel + 1)} disabled={sel === 2024} aria-label="Következő évjárat">
              →
            </button>
          </div>
        </div>
      </div>
      <div className="nk-track" ref={track} data-reveal role="tablist" aria-label="Évjáratok">
        <div className="nk-track-line" aria-hidden />
        {VINTAGES.map((x) => (
          <button
            key={x.y}
            type="button"
            role="tab"
            data-y={x.y}
            aria-selected={sel === x.y}
            className={`nk-year ${sel === x.y ? 'is-on' : ''}`}
            onClick={() => go(x.y)}
          >
            <span className="nk-year-bar" style={{ '--h': x.r / 5 } as CSSProperties} aria-hidden />
            <span className="nk-year-dot" aria-hidden />
            <span className="nk-year-n">{x.y}</span>
            <WeatherIcon w={x.w} />
            <span className="nk-year-tag">{x.tag}</span>
          </button>
        ))}
      </div>
      <div className="nk-wrap">
        <div className="nk-vdetail" key={sel} role="tabpanel">
          <div className="nk-vdetail-year">
            <span>{v.y}</span>
            <WeatherIcon w={v.w} />
          </div>
          <div className="nk-vdetail-text">
            <h3>{v.tag}</h3>
            <p>{v.note}</p>
          </div>
          <dl className="nk-vdetail-stats">
            <div>
              <dt>Értékelésünk</dt>
              <dd>
                <Grapes r={v.r} /> <span>{v.r.toLocaleString('hu-HU')} / 5</span>
              </dd>
            </div>
            <div>
              <dt>Szüret</dt>
              <dd>{v.harvest}</dd>
            </div>
            <div>
              <dt>Aszúszem aránya</dt>
              <dd>
                <span className="nk-meter">
                  <i style={{ transform: `scaleX(${v.aszu / 30})` }} />
                </span>
                {v.aszu}%
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ finder */

const R = 120;
const C = 160;
const vert = (vals: number[], scale = 1) =>
  vals.map((x, i) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    const r = (x / 10) * R * scale;
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
  });
const toPath = (p: ReadonlyArray<readonly [number, number]>) => `M${p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;

function Radar({ wine }: { wine: Wine }) {
  const pts = vert(wine.v);
  const path = toPath(pts);
  return (
    <svg viewBox="-125 -42 570 372" className="nk-radar" role="img" aria-label={`Ízprofil: ${AXES.map((a, i) => `${a} ${wine.v[i]}`).join(', ')}`}>
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <path key={s} d={toPath(vert([10, 10, 10, 10, 10], s))} className="nk-radar-ring" />
      ))}
      {vert([10, 10, 10, 10, 10]).map(([x, y], i) => (
        <line key={i} x1={C} y1={C} x2={x} y2={y} className="nk-radar-axis" />
      ))}
      <path d={path} style={{ d: `path("${path}")` } as CSSProperties} className="nk-radar-shape" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx="0" cy="0" r="5" className="nk-radar-dot" style={{ transform: `translate(${x}px, ${y}px)` }} />
      ))}
      {vert([10, 10, 10, 10, 10], 1.17).map(([x, y], i) => (
        <text key={i} x={x} y={i ? y + 2 : y - 26} textAnchor={i === 0 ? 'middle' : x < C ? 'end' : 'start'} className="nk-radar-label">
          {AXES[i]}
          <tspan x={x} dy="1.15em" className="nk-radar-val">
            {wine.v[i].toLocaleString('hu-HU')}
          </tspan>
        </text>
      ))}
    </svg>
  );
}

function Finder({ onAdd }: { onAdd: (w: Wine) => void }) {
  const [id, setId] = useState('hajnalpir');
  const wine = WINES.find((w) => w.id === id)!;
  return (
    <section className="nk-finder" id="finder">
      <div className="nk-wrap">
        <p className="nk-kicker nk-center" data-reveal>
          <span className="nk-rule" /> Borkereső <span className="nk-rule" />
        </p>
        <h2 className="nk-h2 nk-center" data-reveal>
          Melyik <em>a te borod?</em>
        </h2>
        <p className="nk-body nk-center" data-reveal>
          Válassz egyet a hat borunk közül, és nézd meg az ízprofilját — a pincemesterünk jegyzetei alapján, tízes skálán.
        </p>
        <div className="nk-chips" role="tablist" aria-label="Borok" data-reveal>
          {WINES.map((w) => (
            <button key={w.id} type="button" role="tab" aria-selected={id === w.id} className={id === w.id ? 'is-on' : ''} onClick={() => setId(w.id)}>
              <i style={{ background: w.label }} aria-hidden />
              {w.name}
            </button>
          ))}
        </div>
        <div className="nk-finder-grid" data-reveal>
          <div className="nk-finder-bottle">
            <div key={wine.id} className="nk-finder-bottle-in">
              <Bottle wine={wine} />
            </div>
            <div className="nk-plinth" aria-hidden />
          </div>
          <div className="nk-finder-radar">
            <Radar wine={wine} />
          </div>
          <div className="nk-finder-info" key={wine.id} aria-live="polite">
            <p className="nk-style">
              {wine.style} · {wine.year}
            </p>
            <h3>{wine.name}</h3>
            <p className="nk-note">{wine.note}</p>
            <dl>
              <div>
                <dt>Ételpárosítás</dt>
                <dd>{wine.pair}</dd>
              </div>
              <div>
                <dt>Kiszerelés</dt>
                <dd>
                  {wine.vol} · {wine.abv}
                </dd>
              </div>
            </dl>
            <div className="nk-buy">
              <span className="nk-price">{ft(wine.price)}</span>
              <button type="button" className="nk-btn nk-btn--wine" onClick={() => onAdd(wine)}>
                Kosárba
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ plots map */

const mapBg =
  `<defs><pattern id="nk-rows" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><line y1="4" x2="8" y2="4" stroke="#5B1A27" stroke-opacity=".22" stroke-width="1.6"/></pattern>` +
  `<radialGradient id="nk-hillg" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#F6EBD3"/><stop offset="1" stop-color="#E3CFA8"/></radialGradient></defs>` +
  `<rect x="40" y="40" width="580" height="400" fill="#EFE4CF"/><path d="M60 380C120 220 220 110 340 96S560 150 600 360Z" fill="url(#nk-hillg)"/>` +
  `<g fill="none" stroke="#B89F76" stroke-opacity=".55">${range(5)
    .map(
      (i) =>
        `<path d="M${90 + i * 26} ${370 - i * 6}C${150 + i * 20} ${240 + i * 18} ${240 + i * 10} ${140 + i * 22} 340 ${126 + i * 24}S${540 - i * 18} ${170 + i * 20} ${580 - i * 24} ${352 - i * 4}"${i % 2 ? ' stroke-dasharray="4 5"' : ''}/>`,
    )
    .join('')}</g>` +
  `<path d="M40 410C140 380 220 420 330 396S520 388 620 410V440H40Z" fill="#B9C3BC" opacity=".8"/><path d="M40 412C140 382 220 422 330 398S520 390 620 412" fill="none" stroke="#fff" stroke-opacity=".7" stroke-dasharray="10 8"/>` +
  `<text x="560" y="430" class="nk-map-river">Bodrog</text>` +
  `<g transform="translate(340 100)"><path d="M0-14L8 0H-8Z" fill="#5B1A27"/><text x="12" y="-2" class="nk-map-small">Napkorsó-hegy · 412 m</text></g>`;
const mapFg =
  `<g transform="translate(250 382)"><rect x="-9" y="-9" width="18" height="18" rx="3" fill="#5B1A27"/><path d="M-5 4V-1A5 5 0 0 1 5-1V4Z" fill="#C99A2E"/><text x="16" y="5" class="nk-map-small">Pince &amp; kóstolóterem</text></g>` +
  `<g transform="translate(580 80)"><circle r="16" fill="none" stroke="#5B1A27" stroke-opacity=".4"/><path d="M0-12L4 0L0 12L-4 0Z" fill="#5B1A27"/><text y="-20" text-anchor="middle" class="nk-map-small">É</text></g>`;

function Plots() {
  const [act, setAct] = useState('napkorso');
  const p = PLOTS.find((x) => x.id === act)!;
  return (
    <section className="nk-plots" id="plots">
      <div className="nk-wrap nk-plots-grid">
        <div>
          <p className="nk-kicker" data-reveal>
            <span className="nk-rule" /> A dűlők
          </p>
          <h2 className="nk-h2" data-reveal>
            Hat dűlő, <em>hat temperamentum.</em>
          </h2>
          <p className="nk-body" data-reveal>
            Ugyanaz a hegy, mégis minden parcella mást mond. Vidd az egeret — vagy koppints — egy dűlőre, és megmutatjuk, mi teszi különlegessé.
          </p>
          <div className="nk-plot-card" key={p.id} aria-live="polite">
            <div className="nk-plot-card-head">
              <h3>{p.name}</h3>
              <span>{p.ha.toLocaleString('hu-HU')} ha</span>
            </div>
            <p>{p.note}</p>
            <dl>
              <div>
                <dt>Talaj</dt>
                <dd>{p.soil}</dd>
              </div>
              <div>
                <dt>Kitettség</dt>
                <dd>{p.aspect}</dd>
              </div>
              <div>
                <dt>Szőlő</dt>
                <dd>{p.grape}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="nk-map" data-reveal style={d(120)}>
          <svg viewBox="40 40 580 400" role="group" aria-label="A birtok dűlőinek térképe">
            <g {...html(mapBg)} />
            {PLOTS.map((pl) => (
              <g key={pl.id} className={`nk-plot ${act === pl.id ? 'is-on' : ''}`}>
                <path
                  d={pl.path}
                  tabIndex={0}
                  role="button"
                  aria-label={`${pl.name} dűlő, ${pl.ha} hektár`}
                  aria-pressed={act === pl.id}
                  onMouseEnter={() => setAct(pl.id)}
                  onFocus={() => setAct(pl.id)}
                  onClick={() => setAct(pl.id)}
                />
                <path d={pl.path} fill="url(#nk-rows)" pointerEvents="none" />
                <text x={pl.lx} y={pl.ly} textAnchor="middle" className="nk-map-label" pointerEvents="none">
                  {pl.name}
                </text>
              </g>
            ))}
            <g {...html(mapFg)} />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ cellar */

const cellarSvg = (() => {
  const arch = 'M-150 200V-20A150 150 0 0 1 150 -20V200';
  const arches = [1.25, 1, 0.78, 0.6, 0.46, 0.35, 0.27, 0.2]
    .map(
      (s, i) =>
        `<g transform="translate(300 ${210 + 10 * s}) scale(${s * 1.7})"><path d="${arch}H-150Z" fill="${i % 2 ? '#2B0E16' : '#341219'}" opacity="${1 - i * 0.05}"/><path d="${arch}" fill="none" stroke="#C99A2E" stroke-opacity="${0.08 + i * 0.04}" stroke-width="${(2 / s / 1.7).toFixed(2)}"/></g>`,
    )
    .join('');
  const barrels = [[-1, 108, 330, 58], [-1, 176, 300, 40], [-1, 222, 280, 28], [1, 492, 330, 58], [1, 424, 300, 40], [1, 378, 280, 28]]
    .map(
      ([s, x, y, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="${r * 0.92}" ry="${r}" fill="url(#nk-barrel)" stroke="#1a0805" stroke-width="${(r / 9).toFixed(1)}"/><ellipse cx="${x}" cy="${y}" rx="${r * 0.6}" ry="${r * 0.66}" fill="none" stroke="#C99A2E" stroke-opacity=".35" stroke-width="1.4"/><circle cx="${x + s * r * 0.1}" cy="${y + r * 0.35}" r="${r * 0.08}" fill="#C99A2E" opacity=".6"/>`,
    )
    .join('');
  return (
    `<defs><radialGradient id="nk-glow"><stop offset="0" stop-color="#FFD983" stop-opacity=".9"/><stop offset=".4" stop-color="#C99A2E" stop-opacity=".35"/><stop offset="1" stop-color="#C99A2E" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="nk-barrel"><stop offset="0" stop-color="#3a160c"/><stop offset=".5" stop-color="#6b3018"/><stop offset="1" stop-color="#2a0f08"/></linearGradient></defs>` +
    `<rect width="600" height="420" fill="#1E0910"/>${arches}` +
        `<circle cx="300" cy="200" r="120" fill="url(#nk-glow)" class="nk-candle-glow"/><rect x="296" y="204" width="8" height="22" rx="2" fill="#F4EDE1"/>` +
    `<path class="nk-flame" d="M300 186C306 194 306 202 300 204C294 202 294 194 300 186Z" fill="#FFD983"/>${barrels}` +
    `<rect y="380" width="600" height="40" fill="#14060a"/>`
  );
})();

function CellarArt() {
  return <svg viewBox="0 0 600 420" className="nk-cellar-art" aria-hidden {...html(cellarSvg)} />;
}

function Cellar() {
  const [ref, seen] = useInView<HTMLDListElement>(0.4);
  const m = useCountUp(640, seen, 1800);
  const b = useCountUp(212, seen, 1800);
  return (
    <section className="nk-cellar" id="cellar">
      <div className="nk-wrap nk-cellar-grid">
        <div className="nk-cellar-frame" data-reveal>
          <CellarArt />
        </div>
        <div>
          <p className="nk-kicker nk-kicker--light" data-reveal>
            <span className="nk-rule" /> A pince
          </p>
          <h2 className="nk-h2" data-reveal>
            Ahol a bor <em>megtanul várni.</em>
          </h2>
          <p className="nk-body" data-reveal>
            A riolittufába vájt járatot a 18. században kezdték faragni. Falait vastagon borítja a nemes pincepenész, amely magától tartja
            a páratartalmat és a csendet. Itt érnek a hordóink — és itt kóstolunk gyertyafénynél.
          </p>
          <dl className="nk-cellar-stats" ref={ref}>
            <div>
              <dd>{Math.round(m)} m</dd>
              <dt>járat a hegy alatt</dt>
            </div>
            <div>
              <dd>11 °C</dd>
              <dt>egész évben</dt>
            </div>
            <div>
              <dd>92%</dd>
              <dt>páratartalom</dt>
            </div>
            <div>
              <dd>{Math.round(b)}</dd>
              <dt>gönci és szerednyei hordó</dt>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ shop */

function Shop({ onAdd }: { onAdd: (w: Wine) => void }) {
  return (
    <section className="nk-shop" id="shop">
      <div className="nk-wrap">
        <div className="nk-head-row">
          <div>
            <p className="nk-kicker" data-reveal>
              <span className="nk-rule" /> Borbolt
            </p>
            <h2 className="nk-h2" data-reveal>
              A pincéből <em>egyenesen hozzátok.</em>
            </h2>
          </div>
          <p className="nk-body nk-shop-note" data-reveal>
            Ingyenes kiszállítás 6 palacktól. Minden üveget kézzel csomagolunk, papírba és szalmába.
          </p>
        </div>
        <ul className="nk-shop-grid">
          {WINES.map((w, i) => (
            <li key={w.id} className="nk-prod" data-reveal style={d((i % 3) * 90)}>
              <div className="nk-prod-art" style={{ '--tint': w.label } as CSSProperties}>
                <Bottle wine={w} className="nk-bottle--sm" />
              </div>
              <div className="nk-prod-body">
                <p className="nk-style">
                  {w.style} · {w.year}
                </p>
                <h3>{w.name}</h3>
                <p className="nk-prod-note">{w.note}</p>
                <div className="nk-prod-foot">
                  <span>
                    <b>{ft(w.price)}</b> <small>/ {w.vol}</small>
                  </span>
                  <button type="button" className="nk-add" onClick={() => onAdd(w)} aria-label={`${w.name} kosárba`}>
                    +
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ booking */

function Booking({ notify }: { notify: (m: string) => void }) {
  const [pkg, setPkg] = useState('dulo');
  const [people, setPeople] = useState(2);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const min = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().slice(0, 10);
  }, []);
  const p = PACKAGES.find((x) => x.id === pkg)!;
  const sub = p.price * people;
  const disc = people >= 6 ? Math.round(sub * 0.1) : 0;
  const total = sub - disc;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!date) return notify('Kérjük, válassz dátumot a kóstolóhoz.');
    if (date < min) return notify('A legkorábbi időpont holnap — válassz későbbi napot.');
    if (new Date(`${date}T12:00:00`).getDay() === 1) return notify('Hétfőn a pince zárva tart — válassz másik napot.');
    if (name.trim().length < 2) return notify('Kérjük, add meg a neved.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify('Kérjük, érvényes e-mail-címet adj meg.');
    notify(`Köszönjük, ${name.trim()}! ${p.name}, ${people} fő, ${ft(total)} — design bemutató, foglalás nem történt.`);
    setName('');
    setEmail('');
  };
  return (
    <section className="nk-book" id="booking">
      <div className="nk-book-bg" aria-hidden />
      <div className="nk-wrap">
        <p className="nk-kicker nk-kicker--light nk-center" data-reveal>
          <span className="nk-rule" /> Látogatás <span className="nk-rule" />
        </p>
        <h2 className="nk-h2 nk-center" data-reveal>
          Gyertek le <em>a pincébe.</em>
        </h2>
        <form className="nk-book-grid" onSubmit={submit} noValidate>
          <div className="nk-book-main" data-reveal>
            <fieldset className="nk-pkgs">
              <legend>1. Kóstolócsomag</legend>
              {PACKAGES.map((x) => (
                <label key={x.id} className={`nk-pkg ${pkg === x.id ? 'is-on' : ''}`}>
                  <input type="radio" name="pkg" value={x.id} checked={pkg === x.id} onChange={() => setPkg(x.id)} />
                  <span className="nk-pkg-head">
                    <b>{x.name}</b>
                    {x.featured && <em>Kedvenc</em>}
                  </span>
                  <span className="nk-pkg-price">
                    {ft(x.price)} <small>/ fő · {x.time}</small>
                  </span>
                  <ul>
                    {x.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </label>
              ))}
            </fieldset>
            <div className="nk-fields">
              <label className="nk-field">
                <span>2. Dátum</span>
                <input type="date" min={min} value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <div className="nk-field">
                <span id="nk-ppl">3. Létszám</span>
                <div className="nk-stepper" role="group" aria-labelledby="nk-ppl">
                  <button type="button" onClick={() => setPeople(Math.max(1, people - 1))} aria-label="Kevesebb fő" disabled={people <= 1}>
                    −
                  </button>
                  <output aria-live="polite">{people} fő</output>
                  <button type="button" onClick={() => setPeople(Math.min(12, people + 1))} aria-label="Több fő" disabled={people >= 12}>
                    +
                  </button>
                </div>
              </div>
              <label className="nk-field">
                <span>Név</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kovács Eszter" autoComplete="name" />
              </label>
              <label className="nk-field">
                <span>E-mail</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="eszter@pelda.hu" autoComplete="email" />
              </label>
            </div>
          </div>
          <aside className="nk-summary" data-reveal style={d(120)}>
            <p className="nk-summary-k">Összesítő</p>
            <h3>{p.name}</h3>
            <ul>
              <li>
                <span>
                  {ft(p.price)} × {people} fő
                </span>
                <span>{ft(sub)}</span>
              </li>
              <li className={disc ? '' : 'is-muted'}>
                <span>Csoportkedvezmény (6 főtől −10%)</span>
                <span>{disc ? `−${ft(disc)}` : '—'}</span>
              </li>
              <li>
                <span>Időpont</span>
                <span>{date ? new Date(`${date}T12:00:00`).toLocaleDateString('hu-HU', { month: 'long', day: 'numeric', weekday: 'short' }) : 'válassz napot'}</span>
              </li>
            </ul>
            <div className="nk-total">
              <span>Fizetendő a helyszínen</span>
              <b key={total}>{ft(total)}</b>
            </div>
            <button type="submit" className="nk-btn nk-btn--gold nk-btn--block">
              Foglalás elküldése
            </button>
            <p className="nk-fine">Kedd–vasárnap, 10–19 óra. Lemondás díjmentesen 48 órával előtte.</p>
          </aside>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ voices, faq, cta, footer */

function Voices() {
  return (
    <section className="nk-voices">
      <div className="nk-wrap">
        <p className="nk-kicker nk-center" data-reveal>
          <span className="nk-rule" /> Vendégeink írták <span className="nk-rule" />
        </p>
        <h2 className="nk-h2 nk-center" data-reveal>
          Akik már <em>koccintottak velünk.</em>
        </h2>
        <div className="nk-voice-grid">
          {QUOTES.map((q, i) => (
            <figure key={q.who} className="nk-voice" data-reveal style={d(i * 110)}>
              <svg viewBox="0 0 40 30" className="nk-qmark" aria-hidden>
                <path d="M0 30V17C0 7 5 1 15 0v6c-5 1-7 4-7 9h7v15ZM23 30V17c0-10 5-16 15-17v6c-5 1-7 4-7 9h7v15Z" />
              </svg>
              <blockquote>{q.q}</blockquote>
              <figcaption>
                <b>{q.who}</b> · {q.where}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="nk-fine nk-center" data-reveal>
          A vendégvélemények kitaláltak — a Napkorsó Birtok egy design bemutató része.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="nk-faq" id="faq">
      <div className="nk-wrap nk-faq-grid">
        <div>
          <p className="nk-kicker" data-reveal>
            <span className="nk-rule" /> Kérdések
          </p>
          <h2 className="nk-h2" data-reveal>
            Mielőtt <em>útnak indulnátok.</em>
          </h2>
          <p className="nk-body" data-reveal>
            Ha valamit nem találtok, írjatok nyugodtan — Anna minden levélre maga válaszol.
          </p>
        </div>
        <div className="nk-acc">
          {FAQ.map(([q, a], n) => (
            <div key={q} className={`nk-acc-item ${open === n ? 'is-open' : ''}`} data-reveal style={d(n * 60)}>
              <button type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                {q}
                <span aria-hidden />
              </button>
              <div className="nk-acc-body">
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
    <section className="nk-final">
      <div className="nk-final-sun" aria-hidden />
      <svg viewBox="0 268 600 372" preserveAspectRatio="none" className="nk-final-art" aria-hidden {...html(hills('nkf'))} />
      <div className="nk-wrap nk-final-in">
        <p className="nk-kicker nk-center" data-reveal>
          <span className="nk-rule" /> Szüreti hétvégék ősszel <span className="nk-rule" />
        </p>
        <h2 className="nk-h1 nk-h1--mid" data-reveal>
          Az ősz <em>nálunk</em> kezdődik.
        </h2>
        <p className="nk-lead nk-center" data-reveal>
          Szedjetek velünk aszúszemet, kóstoljátok a mustot, és vigyétek haza a saját évjáratotokat.
        </p>
        <div className="nk-cta-row nk-cta-row--c" data-reveal>
          <a href="#booking" onClick={jump('booking')} className="nk-btn nk-btn--wine">
            Időpontot foglalok <span aria-hidden>→</span>
          </a>
          <a href="#shop" onClick={jump('shop')} className="nk-btn nk-btn--line">
            Borbolt
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ['Birtok', ['Történetünk', 'Dűlők', 'Évjáratok', 'Pince']],
    ['Látogatás', ['Kóstolók', 'Szüreti hétvégék', 'Csoportoknak', 'Megközelítés']],
    ['Borbolt', ['Összes bor', 'Ajándékdobozok', 'Szállítás', 'ÁSZF']],
  ];
  return (
    <footer className="nk-footer">
      <div className="nk-wrap">
        <div className="nk-footer-grid">
          <div>
            <Wordmark />
            <p className="nk-footer-addr">
              Napkorsó köz 7. · Tokaj
              <br />
              Kedd–vasárnap 10–19 óra
            </p>
          </div>
          {cols.map(([h, links]) => (
            <div key={h}>
              <h4>{h}</h4>
              <ul>
                {links.map((l) => (
                  <li key={l}>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="nk-footer-base">
          <span>© {new Date().getFullYear()} Napkorsó Birtok · Fogyassz felelősséggel.</span>
          <span>A Napkorsó Birtok kitalált márka — David Mészáros landing page koncepciója.</span>
        </div>
      </div>
    </footer>
  );
}

export default function Napkorso() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [toast, notify] = useToast(4200);
  const add = (w: Wine) => notify(`${w.name} a kosárban — design bemutató, vásárlás nem történik.`);
  return (
    <div ref={root} className="napkorso">
      <Nav />
      <Hero />
      <section className="nk-band" aria-label="Fajták és stílusok">
        <Marquee>
          {['Furmint', 'Hárslevelű', 'Sárgamuskotály', 'Kövérszőlő', 'Szamorodni', 'Késői szüret', 'Aszú', 'Kézi szüret', 'Vulkáni talaj'].map((x) => (
            <span key={x} className="nk-band-item">
              {x}
              <svg viewBox="0 0 12 12" aria-hidden>
                <path d="M6 0L7.4 4.6L12 6L7.4 7.4L6 12L4.6 7.4L0 6L4.6 4.6Z" />
              </svg>
            </span>
          ))}
        </Marquee>
      </section>
      <Statement />
      <Story />
      <Vintages />
      <Finder onAdd={add} />
      <Plots />
      <Cellar />
      <Shop onAdd={add} />
      <Booking notify={notify} />
      <Voices />
      <Faq />
      <FinalCta />
      <Footer />
      <div className={`nk-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
