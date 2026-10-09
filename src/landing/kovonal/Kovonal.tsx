import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode, RefObject } from 'react';
import '@fontsource-variable/syne';
import './kovonal.css';
import { jump, reducedMotion, useCountUp, useInView, useReveal, useScrolledPast, useToast } from '../kit';
import { AppIcons, AppSheet, AppTabBar, SwipeDots, useLandingPhone } from '../appKit';

/**
 * Kővonal Stúdió — a fictional architecture & interior design studio in Budapest.
 * Editorial, gallery-like: an asymmetric project grid with clip-path reveals, a filter that
 * re-lays the grid (FLIP), magnetic buttons and a cursor-follow label on the project cards.
 * Every "photo" is a code-drawn architectural composition.
 */

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

type Cat = 'Lakóház' | 'Iroda' | 'Belsőépítészet' | 'Vendéglátás';
const CATS: Array<'Mind' | Cat> = ['Mind', 'Lakóház', 'Iroda', 'Belsőépítészet', 'Vendéglátás'];

/* ------------------------------------------------------------------ art */

function Art({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" className="ko-art" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

const lin = (id: string, stops: string[], x2 = 0, y2 = 1) => (
  <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
    {stops.map((c, i) => {
      const [col, op] = c.split('/');
      return <stop key={i} offset={i / (stops.length - 1)} stopColor={col} stopOpacity={op ?? 1} />;
    })}
  </linearGradient>
);

/** hero: a travertine colonnade facade in low sun */
function HeroArt() {
  return (
    <Art label="Travertin homlokzat mély ablakbélletekkel, alacsony napfényben">
      <defs>
        {lin('ko-h-sky', ['#EFE6D9', '#DCCDB9'])}
        {lin('ko-h-open', ['#16130f', '#3a3029'])}
        {lin('ko-h-glow', ['#e9b877/0', '#f2cf93/.85'])}
        {lin('ko-h-ground', ['#cdbfab', '#b9aa95'])}
        <pattern id="ko-h-tr" width="96" height="30" patternUnits="userSpaceOnUse">
          <rect width="96" height="30" fill="#DDD1BF" />
          <path d="M0 9h96M0 17h96" stroke="#CFC1AB" strokeWidth="1.2" opacity=".7" />
          <path d="M0 24h96" stroke="#E7DDCD" strokeWidth="2" />
          <path d="M0 29.5h96M95.5 0v30" stroke="#BFAF97" />
          <ellipse cx="22" cy="13" rx="4" ry="1.2" fill="#C3B39B" />
          <ellipse cx="70" cy="21" rx="6" ry="1.1" fill="#C7B8A1" />
          <ellipse cx="51" cy="6" rx="2.5" ry=".8" fill="#BBAA91" />
        </pattern>
      </defs>
      <rect width="600" height="600" fill="url(#ko-h-sky)" />
      <circle cx="505" cy="92" r="34" fill="#F6E7CC" />
      <rect x="40" y="78" width="560" height="430" fill="url(#ko-h-tr)" />
      <rect x="40" y="70" width="560" height="14" fill="#E9E0D2" />
      <rect x="40" y="84" width="560" height="6" fill="#000" opacity=".12" />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 78 + i * 108;
        return (
          <g key={i}>
            <rect x={x} y="150" width="62" height="300" fill="url(#ko-h-open)" />
            <rect x={x} y="330" width="62" height="120" fill="url(#ko-h-glow)" />
            <path d={`M${x} 150h62l-30 42H${x}z`} fill="#000" opacity=".35" />
            <path d={`M${x + 62} 150l26 0 l-60 300 h-28 z`} fill="#3b2f25" opacity=".14" />
            <rect x={x - 6} y="450" width="74" height="8" fill="#EDE5D8" />
          </g>
        );
      })}
      <path d="M40 78 L600 78 L600 300 Z" fill="#fff" opacity=".1" />
      <rect x="0" y="508" width="600" height="92" fill="url(#ko-h-ground)" />
      <path d="M40 508h560l-120 40H0z" fill="#3b2f25" opacity=".16" />
      <g fill="#121212">
        <circle cx="402" cy="471" r="5" />
        <path d="M397 478h10l1 30h-12z" />
      </g>
      <path d="M402 508 l-60 22" stroke="#121212" strokeWidth="9" opacity=".13" strokeLinecap="round" />
    </Art>
  );
}

const ART: Record<string, () => ReactNode> = {
  hegy: () => (
    <Art label="Konzolos betonház domboldalon, alkonyatkor">
      <defs>
        {lin('ko-a-sky', ['#C8B6A3', '#EAD7BE', '#F1E5D3'])}
        {lin('ko-a-glow', ['#F7E2BA', '#D69B5B'])}
        {lin('ko-a-con', ['#DCD4C7', '#BDB4A6'])}
      </defs>
      <rect width="600" height="600" fill="url(#ko-a-sky)" />
      <circle cx="455" cy="200" r="48" fill="#F5DFB8" opacity=".85" />
      <path d="M0 410 Q220 350 600 320 V600 H0z" fill="#7C7266" />
      <g fill="#5F574D">
        <circle cx="70" cy="378" r="26" />
        <circle cx="104" cy="366" r="34" />
        <circle cx="140" cy="380" r="22" />
      </g>
      <rect x="130" y="322" width="270" height="96" fill="url(#ko-a-con)" />
      <rect x="150" y="345" width="230" height="50" fill="url(#ko-a-glow)" />
      <path d="M196 345v50M242 345v50M288 345v50M334 345v50" stroke="#6b5a48" strokeWidth="2" />
      <rect x="215" y="250" width="330" height="74" fill="#DCD4C8" />
      <rect x="215" y="250" width="330" height="5" fill="#F1EBE2" />
      <rect x="236" y="268" width="250" height="34" fill="#2A2622" />
      <rect x="236" y="268" width="110" height="34" fill="url(#ko-a-glow)" opacity=".85" />
      <path d={Array.from({ length: 14 }, (_, i) => `M${360 + i * 9} 268v34`).join('')} stroke="#C9BFB1" strokeWidth="2.5" />
      <rect x="400" y="324" width="145" height="16" fill="#000" opacity=".22" />
      <path d="M0 470 Q320 430 600 452 V600 H0z" fill="#5C544A" />
      <path d="M130 418h270" stroke="#3d3730" strokeWidth="3" />
    </Art>
  ),
  rakpart: () => (
    <Art label="Üveghomlokzatú irodaház függőleges lamellákkal a folyóparton">
      <defs>
        {lin('ko-b-sky', ['#D8D4CD', '#EEE9E1'])}
        {lin('ko-b-glass', ['#8E9796', '#D3D7D2', '#9AA3A1', '#C2C8C3'], 1, 1)}
        {lin('ko-b-river', ['#9AA3A0', '#7F8987'])}
        <pattern id="ko-b-pane" width="30" height="36" patternUnits="userSpaceOnUse">
          <path d="M0 .5h30M.5 0v36" stroke="#F4F1EA" strokeOpacity=".55" />
        </pattern>
      </defs>
      <rect width="600" height="600" fill="url(#ko-b-sky)" />
      <rect x="30" y="300" width="130" height="212" fill="#CFC5B6" />
      {[0, 1, 2, 3, 4].map((r) => (
        <rect key={r} x="44" y={318 + r * 38} width="102" height="16" fill="#5A5550" opacity=".55" />
      ))}
      <rect x="170" y="70" width="290" height="442" fill="url(#ko-b-glass)" />
      <rect x="170" y="70" width="290" height="442" fill="url(#ko-b-pane)" />
      <path d="M170 70h150L170 330z" fill="#fff" opacity=".22" />
      <path d={Array.from({ length: 15 }, (_, i) => `M${174 + i * 20} 70v442`).join('')} stroke="#232323" strokeWidth="5" opacity=".86" />
      <rect x="160" y="54" width="310" height="18" fill="#2A2928" />
      <rect x="160" y="490" width="310" height="24" fill="#3A3836" />
      <rect x="470" y="380" width="110" height="132" fill="#B7AC9C" />
      <rect x="0" y="512" width="600" height="88" fill="url(#ko-b-river)" />
      <rect x="170" y="514" width="290" height="70" fill="#C6CCC7" opacity=".28" />
      <path d="M40 540h80M220 552h140M400 566h90M80 584h120" stroke="#EEF0EC" strokeWidth="2" opacity=".6" />
    </Art>
  ),
  tolgy: () => (
    <Art label="Belső tér tölgy padlóval és íves ablakkal, beáramló fénnyel">
      <defs>
        {lin('ko-c-left', ['#D9CFC1', '#C3B6A3'])}
        {lin('ko-c-floor', ['#C99E6D', '#A6784A'])}
        {lin('ko-c-win', ['#FFF9EE', '#F1DFBF'])}
        {lin('ko-c-beam', ['#FFF6E4/.55', '#FFF6E4/0'])}
      </defs>
      <rect width="600" height="600" fill="#F2ECE3" />
      <rect x="180" y="170" width="240" height="220" fill="#ECE3D5" />
      <path d="M0 0L180 170V390L0 600z" fill="url(#ko-c-left)" />
      <path d="M600 0L420 170V390L600 600z" fill="#E1D7C9" />
      <path d="M180 390H420L600 600H0z" fill="url(#ko-c-floor)" />
      <path d={Array.from({ length: 13 }, (_, i) => `M${180 + i * 20} 390L${-60 + i * 60} 600`).join('')} stroke="#7f5735" strokeWidth="1.4" opacity=".35" />
      <path d="M255 372V246A45 45 0 0 1 345 246V372z" fill="url(#ko-c-win)" />
      <path d="M300 201V372M255 300H345" stroke="#BCA98E" strokeWidth="2.5" />
      <path d="M255 372H345L470 600H130z" fill="url(#ko-c-beam)" />
      <ellipse cx="300" cy="500" rx="170" ry="36" fill="#E9DCC7" opacity=".55" />
      <rect x="352" y="350" width="62" height="34" rx="6" fill="#8C8378" />
      <rect x="352" y="340" width="62" height="14" rx="6" fill="#A29788" />
      <path d="M300 0V112" stroke="#121212" strokeWidth="1.5" />
      <path d="M278 132a22 22 0 0 1 44 0z" fill="#121212" />
      <circle cx="300" cy="134" r="5" fill="#F6D9A2" />
    </Art>
  ),
  meszko: () => (
    <Art label="Bisztró belső tér travertin pulttal és függőlámpákkal">
      <defs>
        {lin('ko-d-wall', ['#4A3C32', '#271F1A'])}
        <radialGradient id="ko-d-glow">
          <stop offset="0" stopColor="#F7D9A0" stopOpacity=".6" />
          <stop offset="1" stopColor="#F7D9A0" stopOpacity="0" />
        </radialGradient>
        <pattern id="ko-d-tr" width="140" height="22" patternUnits="userSpaceOnUse">
          <rect width="140" height="22" fill="#DCCFBA" />
          <path d="M0 7h140M0 15h140" stroke="#CDBDA4" strokeWidth="1.5" />
          <path d="M0 21.5h140M139.5 0v22" stroke="#B9A88E" />
          <ellipse cx="40" cy="11" rx="6" ry="1" fill="#C1AE92" />
        </pattern>
      </defs>
      <rect width="600" height="600" fill="url(#ko-d-wall)" />
      <path d="M50 150h500M50 215h500M50 280h500" stroke="#7A6553" strokeWidth="3" />
      {Array.from({ length: 27 }, (_, i) => {
        const row = i % 3;
        const h = 26 + ((i * 7) % 4) * 6;
        return <rect key={i} x={64 + Math.floor(i / 3) * 54 + row * 14} y={150 + row * 65 - h} width="9" height={h} rx="2" fill={['#6E8A6A', '#A8673E', '#D8C9A8'][(i * 5) % 3]} opacity=".75" />;
      })}
      {[150, 300, 450].map((x) => (
        <g key={x}>
          <circle cx={x} cy="260" r="110" fill="url(#ko-d-glow)" />
          <path d={`M${x} 0V226`} stroke="#0e0c0a" strokeWidth="1.5" />
          <path d={`M${x - 24} 250Q${x} 214 ${x + 24} 250z`} fill="#C89B5F" />
          <ellipse cx={x} cy="251" rx="14" ry="3" fill="#FFE7BC" />
        </g>
      ))}
      <rect x="30" y="362" width="540" height="170" fill="url(#ko-d-tr)" />
      <rect x="22" y="348" width="556" height="16" fill="#EEE4D4" />
      <rect x="30" y="364" width="540" height="10" fill="#000" opacity=".2" />
      <rect x="0" y="532" width="600" height="68" fill="#211B17" />
      {[90, 210, 330, 450].map((x) => (
        <g key={x} fill="#121212">
          <rect x={x} y="470" width="56" height="9" rx="4" />
          <rect x={x + 25} y="478" width="6" height="90" />
        </g>
      ))}
    </Art>
  ),
  nyaralo: () => (
    <Art label="Nyeregtetős faházas nyaraló a tóparton">
      <defs>
        {lin('ko-e-sky', ['#D9DED8', '#EFE6D8'])}
        {lin('ko-e-glow', ['#F6E3BF', '#DCA466'])}
        <pattern id="ko-e-slat" width="9" height="20" patternUnits="userSpaceOnUse">
          <rect width="9" height="20" fill="#BC9264" />
          <path d="M8 0v20" stroke="#8E6942" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="600" height="600" fill="url(#ko-e-sky)" />
      <path d="M0 360 Q140 320 280 346 T600 330 V400 H0z" fill="#B7BBB2" />
      <rect y="384" width="600" height="90" fill="#A5B2AC" />
      <path d="M40 410h70M180 428h110M420 404h80M330 446h60" stroke="#F0F2EE" strokeWidth="2" opacity=".7" />
      <path d="M0 462 Q300 448 600 466 V600 H0z" fill="#B3A88E" />
      <rect x="190" y="282" width="220" height="172" fill="url(#ko-e-slat)" />
      <path d="M170 290L300 168L430 290z" fill="#262422" />
      <path d="M240 454V306L300 252L360 306V454z" fill="url(#ko-e-glow)" />
      <path d="M300 252V454M240 360H360" stroke="#5c4632" strokeWidth="2.5" />
      <rect x="160" y="452" width="290" height="10" fill="#6B5843" />
      <path d={Array.from({ length: 22 }, (_, i) => `M${i < 11 ? 10 + i * 12 : 420 + (i - 11) * 15} 600q${(i % 3) * 4 - 4} -${60 + (i * 13) % 50} ${(i % 2) * 10 - 5} -${90 + (i * 17) % 60}`).join('')} stroke="#77735A" strokeWidth="2.5" fill="none" />
    </Art>
  ),
  muhely: () => (
    <Art label="Fűrészfogas tetős téglacsarnok új betontömeggel">
      <defs>
        <pattern id="ko-f-brick" width="28" height="14" patternUnits="userSpaceOnUse">
          <rect width="28" height="14" fill="#C9957A" />
          <rect x="1" y="1" width="26" height="5.5" fill="#A8674A" />
          <rect x="-13" y="8" width="26" height="5.5" fill="#9E5F44" />
          <rect x="15" y="8" width="26" height="5.5" fill="#AD6C4E" />
        </pattern>
        <pattern id="ko-f-con" width="44" height="32" patternUnits="userSpaceOnUse">
          <rect width="44" height="32" fill="#CAC4BB" />
          <path d="M0 31.5h44M43.5 0v32" stroke="#B5AEA4" />
          <circle cx="11" cy="8" r="1.6" fill="#A39C91" />
          <circle cx="33" cy="8" r="1.6" fill="#A39C91" />
        </pattern>
        {lin('ko-f-glow', ['#F5DDAF', '#D4995B'])}
      </defs>
      <rect width="600" height="600" fill="#E6E0D6" />
      <path d={`M40 512V220${[0, 1, 2, 3].map((i) => `L${115 + i * 75} 160V220`).join('')}L340 512z`} fill="url(#ko-f-brick)" />
      <path d={[0, 1, 2, 3].map((i) => `M${40 + i * 75} 220L${115 + i * 75} 160`).join('')} stroke="#6e3f2b" strokeWidth="3" />
      <rect x="80" y="290" width="200" height="190" fill="#2C2E2F" />
      <path d="M80 290h200v190H80zM130 290v190M180 290v190M230 290v190M80 353h200M80 416h200" stroke="#6E7273" strokeWidth="4" fill="none" />
      <path d="M80 290h200L80 400z" fill="#fff" opacity=".07" />
      <rect x="330" y="230" width="230" height="282" fill="url(#ko-f-con)" />
      <rect x="360" y="270" width="160" height="128" fill="url(#ko-f-glow)" />
      <rect x="360" y="270" width="160" height="10" fill="#000" opacity=".25" />
      <rect x="0" y="512" width="600" height="88" fill="#8C8378" />
      <circle cx="575" cy="470" r="30" fill="#7A806A" />
    </Art>
  ),
  terasz: () => (
    <Art label="Lépcsőzetes teraszház zöldtetőkkel a hegyoldalban">
      <defs>{lin('ko-g-glow', ['#F3D9AB', '#C88E55'])}</defs>
      <rect width="600" height="600" fill="#EAE3D7" />
      <path d="M0 330 Q260 160 600 150 V600 H0z" fill="#A3A792" />
      {[
        [40, 420, 520, 82],
        [140, 330, 420, 72],
        [240, 244, 320, 66],
      ].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x + 22} y={y + 18} width={w - 40} height={h} fill="#2C2A27" />
          <rect x={x + 22} y={y + 18} width={(w - 40) * (0.42 + i * 0.12)} height={h} fill="url(#ko-g-glow)" opacity=".85" />
          <path d={Array.from({ length: Math.floor((w - 40) / 46) }, (_, k) => `M${x + 22 + k * 46} ${y + 18}v${h}`).join('')} stroke="#F4F0E9" strokeWidth="3" />
          <rect x={x} y={y} width={w} height="20" fill="#F5F1EA" />
          <rect x={x} y={y + 20} width={w} height="5" fill="#000" opacity=".15" />
          {Array.from({ length: 7 }, (_, k) => (
            <circle key={k} cx={x + 14 + k * (w / 7)} cy={y - 6} r={9 + (k % 3) * 4} fill={k % 2 ? '#6C7858' : '#7F8C68'} />
          ))}
        </g>
      ))}
      <rect y="520" width="600" height="80" fill="#CDC2B0" />
    </Art>
  ),
  tokaj: () => (
    <Art label="Hosszú lapostetős borterasz pavilon szőlősorok fölött naplementében">
      <defs>{lin('ko-h2-sky', ['#E7C49A', '#F3E4CE'])}</defs>
      <rect width="600" height="600" fill="url(#ko-h2-sky)" />
      <circle cx="430" cy="250" r="62" fill="#F7DAA9" />
      <path d="M0 330 Q200 270 420 300 T600 290 V600 H0z" fill="#B39A79" />
      <path d="M0 400 Q300 350 600 380 V600 H0z" fill="#98805F" />
      <path d={Array.from({ length: 10 }, (_, i) => `M0 ${420 + i * 20}Q300 ${386 + i * 22} 600 ${410 + i * 22}`).join('')} stroke="#5F5B42" strokeWidth="3" fill="none" strokeDasharray="2 7" />
      <rect x="140" y="312" width="250" height="68" fill="#F2CF95" />
      <path d="M190 312v68M240 312v68M290 312v68M340 312v68" stroke="#7a5a3a" strokeWidth="2" />
      <rect x="100" y="298" width="390" height="12" fill="#1C1A18" />
      <path d={Array.from({ length: 9 }, (_, i) => `M${118 + i * 44} 310v72`).join('')} stroke="#1C1A18" strokeWidth="3" />
      <rect x="90" y="380" width="410" height="9" fill="#DCCFBA" />
    </Art>
  ),
  galeria: () => (
    <Art label="Galériás lakás felülvilágítóval és lebegő lépcsővel">
      <defs>{lin('ko-i-beam', ['#FFFFFF/.75', '#FFFFFF/0'])}</defs>
      <rect width="600" height="600" fill="#E9E7E2" />
      <rect x="420" width="180" height="600" fill="#DCD9D3" />
      <rect y="520" width="600" height="80" fill="#C9C4BC" />
      <rect x="200" y="0" width="130" height="10" fill="#B9B4AC" />
      <path d="M205 10H325L440 600H120z" fill="url(#ko-i-beam)" />
      <rect x="300" y="282" width="300" height="16" fill="#121212" />
      <path d={`M300 238H600${Array.from({ length: 12 }, (_, i) => `M${312 + i * 24} 238v44`).join('')}`} stroke="#121212" strokeWidth="2" />
      <path d={`M100 520${'h26v-26'.repeat(9)}h66`} stroke="#121212" strokeWidth="4" fill="none" transform="translate(30 0)" />
      <path d="M130 520L364 286" stroke="#121212" strokeWidth="2" opacity=".35" />
      <path d="M440 330h130v150H440zM440 380h130M440 430h130M505 330v150" stroke="#9D978D" strokeWidth="2" fill="none" />
      <rect x="52" y="470" width="34" height="50" fill="#8C8378" />
      <g fill="#6E7858">
        <ellipse cx="60" cy="440" rx="12" ry="34" transform="rotate(-20 60 440)" />
        <ellipse cx="80" cy="430" rx="11" ry="40" transform="rotate(14 80 430)" />
        <ellipse cx="70" cy="414" rx="9" ry="44" />
      </g>
    </Art>
  ),
};

type Project = { id: keyof typeof ART; title: string; place: string; year: number; cat: Cat; area: string };
const PROJECTS: Project[] = [
  { id: 'hegy', title: 'Hegyoldali ház', place: 'Szentendre', year: 2025, cat: 'Lakóház', area: '310 m²' },
  { id: 'rakpart', title: 'Rakpart Iroda', place: 'Budapest XIII.', year: 2024, cat: 'Iroda', area: '4 200 m²' },
  { id: 'tolgy', title: 'Tölgyfa lakás', place: 'Budapest VI.', year: 2025, cat: 'Belsőépítészet', area: '142 m²' },
  { id: 'meszko', title: 'Mészkő Bisztró', place: 'Pécs', year: 2024, cat: 'Vendéglátás', area: '260 m²' },
  { id: 'nyaralo', title: 'Nádas nyaraló', place: 'Tihany', year: 2023, cat: 'Lakóház', area: '128 m²' },
  { id: 'muhely', title: 'Kőfal Műhelyház', place: 'Budapest VIII.', year: 2023, cat: 'Iroda', area: '1 650 m²' },
  { id: 'galeria', title: 'Galérialakás', place: 'Budapest XIII.', year: 2024, cat: 'Belsőépítészet', area: '96 m²' },
  { id: 'terasz', title: 'Teraszház', place: 'Budapest II.', year: 2022, cat: 'Lakóház', area: '540 m²' },
  { id: 'tokaj', title: 'Szőlőhegyi borterasz', place: 'Tokaj', year: 2025, cat: 'Vendéglátás', area: '380 m²' },
];

/** editorial slots by visible position: grid column, aspect ratio, vertical offset */
const SLOTS: Array<[string, string, number]> = [
  ['1 / span 7', '4 / 3', 0],
  ['9 / span 4', '4 / 5', 140],
  ['2 / span 4', '3 / 4', 0],
  ['7 / span 6', '5 / 4', 90],
  ['1 / span 6', '1 / 1', 40],
  ['8 / span 5', '4 / 5', 180],
  ['3 / span 5', '4 / 5', 0],
  ['9 / span 4', '3 / 4', 120],
  ['2 / span 10', '21 / 9', 40],
];

/* ------------------------------------------------------------------ data */

const CLIENTS = ['Arvelo Szállodák', 'Kerekdomb Pincészet', 'Lumora Klinika', 'Fenyvár Csoport', 'Teraszkert Bisztró', 'Malvin Ingatlan', 'Sóvirág Fürdő', 'Ternova Irodaház'];

const SERVICES: Array<[string, string, string[]]> = [
  ['Építészeti tervezés', 'Családi házak, nyaralók, társasházak és irodaépületek a koncepciótól az engedélyes és kiviteli tervekig.', ['Koncepcióterv', 'Engedélyezés', 'Kiviteli terv']],
  ['Belsőépítészet', 'Lakások, irodák és vendéglátóhelyek belső terei: alaprajz, anyagok, világítás és egyedi bútor egy kézben.', ['Látványterv', 'Anyagterv', 'Világításterv']],
  ['Felújítás és átalakítás', 'Polgári lakások, régi házak és ipari csarnokok új élete — a meglévő értékek megtartásával.', ['Állapotfelmérés', 'Energetika', 'Bontási terv']],
  ['Bútor- és tárgytervezés', 'Pultok, könyvfalak, lámpák és kőmunkák, hazai műhelyekkel közösen fejlesztve és legyártva.', ['Egyedi bútor', 'Prototípus', 'Gyártás']],
  ['Tervezői művezetés', 'Ott vagyunk az építkezésen, hogy a terv ne csak papíron legyen jó, hanem az átadás napján is.', ['Művezetés', 'Költségkontroll', 'Átadás']],
];

const STEPS: Array<[string, string, string]> = [
  ['Ismerkedés', '1–2 hét', 'Bejárjuk a telket vagy a teret, meghallgatjuk, hogyan élnek és dolgoznak, és közösen kijelöljük a keretet: időt, költséget, szándékot.'],
  ['Koncepció', '3–6 hét', 'Két-három irányt mutatunk vázlatokban és fizikai makettben. Itt dől el a ház karaktere — ezen a ponton még minden olcsón módosítható.'],
  ['Tervezés', '3–6 hónap', 'Engedélyes és kiviteli tervek, anyag- és világításterv, tételes költségbecslés. Minden döntés egy helyen, átláthatóan dokumentálva.'],
  ['Megvalósítás', 'az átadásig', 'Közösen választunk kivitelezőt, hetente ott vagyunk az építkezésen, és addig maradunk, amíg az utolsó kilincs is a helyére kerül.'],
];

const AWARDS: Array<[number, string, string, string]> = [
  [2025, 'Csendes Homlokzat Díj', 'Fődíj', 'Hegyoldali ház'],
  [2025, 'Közép-európai Belsőtér Szemle', 'Az év vendéglátó tere', 'Mészkő Bisztró'],
  [2024, 'Anyag & Fény Biennálé', 'Rövidlista', 'Galérialakás'],
  [2023, 'Fenntartható Terek Fóruma', 'Különdíj', 'Kőfal Műhelyház'],
  [2022, 'Városi Megújulás Elismerés', 'Dicséret', 'Teraszház'],
];

const TEAM: Array<[string, string, string, string]> = [
  ['Halmi Bora', 'Alapító, vezető építész', 'Kőben és fényben gondolkodik. Rotterdamban és Bázelben dolgozott, mielőtt hazajött.', 'HB'],
  ['Kerekes Ádám', 'Alapító partner, építész', 'Nála minden csomópont 1:5-ös léptékben is megrajzolódik — és működik.', 'KÁ'],
  ['Vida Luca', 'Vezető belsőépítész', 'Anyagmintákkal teli fiókok és tévedhetetlen színérzék. A világításterveink gazdája.', 'VL'],
  ['Szalai Márk', 'Projektvezető', 'Ő tartja a határidőket, a költségvetést és — ha kell — a nyugalmat az építkezésen.', 'SzM'],
];

const QUOTES: Array<[string, string, string]> = [
  ['Azt kértük, hogy a ház ne legyen feltűnő. Két év után is minden reggel észrevesszük, milyen szépen jön be a fény.', 'Bencze Dóra és Ambrus', 'Hegyoldali ház, Szentendre'],
  ['A nyitás után három héttel a vendégeink már a térről írtak, nem csak az ételről. A pult lett a hely szíve.', 'Vándor Zsófia', 'tulajdonos, Mészkő Bisztró'],
  ['Határidőre és kereten belül — és közben egyszer sem éreztük, hogy sürgetnének egy döntést.', 'Tarján Gergely', 'ügyvezető, Ternova Irodaház'],
];

const FAQ: Array<[string, string]> = [
  ['Mekkora projektekkel foglalkoznak?', 'Egy 60 négyzetméteres lakás belsőépítészetétől a 4000 négyzetméteres irodaházig. A méretnél fontosabb a közös szándék és az, hogy legyen elég idő a jó döntésekhez.'],
  ['Mennyibe kerül a tervezés?', 'A tervezési díj jellemzően a beruházási költség 6–11%-a, a feladat összetettségétől függően. Az első konzultáció után tételes, fázisokra bontott ajánlatot adunk.'],
  ['Mennyi ideig tart egy családi ház tervezése?', 'A koncepciótól az engedélyes tervig általában 4–6 hónap, a kiviteli tervekkel együtt 8–10 hónap. Az építkezés ezután jellemzően 12–18 hónap.'],
  ['Vállalják a kivitelezés felügyeletét is?', 'Igen. Tervezői művezetést és műszaki ellenőrzést is vállalunk, és szívesen ajánlunk megbízható kivitelezőket — a döntés azonban mindig az Öné.'],
  ['Dolgoznak Budapesten kívül is?', 'Igen, az ország egész területén — leggyakrabban a Balaton-felvidéken, a Dunakanyarban és Tokaj-Hegyalján. Külföldi megbízást egyedi egyeztetés alapján vállalunk.'],
];

/* ------------------------------------------------------------------ motion */

/**
 * One shared rAF loop for the magnetic buttons ([data-magnet]) and the cursor-follow label
 * on project cards ([data-follow]). It runs only while the pointer moves over one of them
 * and stops as soon as everything has settled.
 */
function usePointerMagnets(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const r = root.current;
    if (!r || reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;
    type S = { m: boolean; tx: number; ty: number; x: number; y: number };
    const st = new Map<HTMLElement, S>();
    let raf = 0;
    let active: HTMLElement | null = null;
    const loop = () => {
      let busy = false;
      st.forEach((s, el) => {
        s.x += (s.tx - s.x) * (s.m ? 0.15 : 0.2);
        s.y += (s.ty - s.y) * (s.m ? 0.15 : 0.2);
        const moving = Math.abs(s.tx - s.x) > 0.08 || Math.abs(s.ty - s.y) > 0.08;
        if (s.m) {
          el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
          if (!moving && s.tx === 0 && s.ty === 0) {
            el.style.translate = '';
            st.delete(el);
          }
        } else {
          el.style.setProperty('--fx', `${s.x.toFixed(1)}px`);
          el.style.setProperty('--fy', `${s.y.toFixed(1)}px`);
        }
        if (moving) busy = true;
      });
      raf = busy ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const release = (el: HTMLElement) => {
      const s = st.get(el);
      if (!s) return;
      if (s.m) {
        s.tx = 0;
        s.ty = 0;
        kick();
      } else {
        st.delete(el);
        el.classList.remove('is-hover');
      }
    };
    const move = (e: PointerEvent) => {
      const t = (e.target as Element).closest<HTMLElement>('[data-magnet],[data-follow]');
      if (active && active !== t) release(active);
      active = t;
      if (!t) return;
      const b = t.getBoundingClientRect();
      if ('magnet' in t.dataset) {
        const s = st.get(t) ?? { m: true, tx: 0, ty: 0, x: 0, y: 0 };
        st.set(t, s);
        s.tx = (e.clientX - b.left - b.width / 2) * 0.32;
        s.ty = (e.clientY - b.top - b.height / 2) * 0.42;
      } else {
        const px = e.clientX - b.left;
        const py = e.clientY - b.top;
        let s = st.get(t);
        if (!s) {
          s = { m: false, tx: px, ty: py, x: px, y: py };
          st.set(t, s);
          t.style.setProperty('--fx', `${px}px`);
          t.style.setProperty('--fy', `${py}px`);
          t.classList.add('is-hover');
        }
        s.tx = px;
        s.ty = py;
      }
      kick();
    };
    const leave = () => {
      if (active) release(active);
      active = null;
    };
    r.addEventListener('pointermove', move);
    r.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      r.removeEventListener('pointermove', move);
      r.removeEventListener('pointerleave', leave);
    };
  }, [root]);
}

/* ------------------------------------------------------------------ parts */

function Mark() {
  return (
    <svg viewBox="0 0 28 28" className="ko-mark" aria-hidden>
      <rect x="1" y="1" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M1 17h26" stroke="currentColor" strokeWidth="1.6" />
      <rect x="1" y="17" width="26" height="10" fill="currentColor" />
    </svg>
  );
}

function Wordmark({ big = false }: { big?: boolean }) {
  return (
    <span className={`ko-wordmark ${big ? 'ko-wordmark--big' : ''}`}>
      <Mark />
      <span>
        Kővonal<i>Stúdió</i>
      </span>
    </span>
  );
}

function Nav() {
  const solid = useScrolledPast(40);
  return (
    <nav className={`ko-nav ${solid ? 'is-solid' : ''}`} aria-label="Kővonal Stúdió">
      <div className="ko-wrap ko-nav-in">
        <a href="#top" onClick={jump('ko-top')} aria-label="Kővonal Stúdió — vissza az elejére">
          <Wordmark />
        </a>
        <div className="ko-nav-links">
          {[
            ['ko-projects', 'Projektek'],
            ['ko-services', 'Szolgáltatások'],
            ['ko-process', 'Folyamat'],
            ['ko-studio', 'Stúdió'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {label}
            </a>
          ))}
        </div>
        <a href="#ko-contact" onClick={jump('ko-contact')} className="ko-btn ko-btn--sm ko-btn--ink">
          Projektindítás
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="ko-hero" id="ko-top">
      <div className="ko-wrap ko-hero-grid">
        <div className="ko-hero-copy">
          <p className="ko-kicker" data-reveal>
            Építészet és belsőépítészet — Budapest, 2012 óta
          </p>
          <h1 className="ko-h1" aria-label="Csend. Fény. Anyag.">
            {['Csend.', 'Fény.', 'Anyag.'].map((w, i) => (
              <span key={w} className="ko-line" data-reveal style={d(120 + i * 110)}>
                <span>{i === 1 ? <em>{w}</em> : w}</span>
              </span>
            ))}
          </h1>
          <p className="ko-lead" data-reveal style={d(480)}>
            Lakóházakat, irodákat, vendéglátóhelyeket és belső tereket tervezünk — a telek első bejárásától az utolsó kilincsig. Kevesebb gesztus, több gondosság.
          </p>
          <div className="ko-cta-row" data-reveal style={d(580)}>
            <a href="#ko-contact" onClick={jump('ko-contact')} className="ko-btn ko-btn--ink" data-magnet>
              Projekt indítása <span aria-hidden>→</span>
            </a>
            <a href="#ko-projects" onClick={jump('ko-projects')} className="ko-btn ko-btn--line" data-magnet>
              Munkáink
            </a>
          </div>
        </div>
        <figure className="ko-hero-fig">
          <div className="ko-hero-art" data-reveal style={d(200)}>
            <div className="ko-hero-clip">
              <HeroArt />
            </div>
          </div>
          <figcaption data-reveal style={d(700)}>
            <span>
              <b>Oszlopsor-ház</b> · Balatonfüred, 2026 — tervezés alatt
            </span>
            <span className="ko-swatches" aria-label="Anyagok: travertin, tölgy, beton">
              <i className="ko-sw ko-sw--tr" />
              <i className="ko-sw ko-sw--oak" />
              <i className="ko-sw ko-sw--con" />
            </span>
          </figcaption>
        </figure>
      </div>
      <div className="ko-wrap ko-hero-meta" data-reveal style={d(760)}>
        <span>47,4979° É · 19,0402° K</span>
        <span>64 megvalósult projekt</span>
        <span>9 szakmai elismerés</span>
        <a href="#ko-statement" onClick={jump('ko-statement')} className="ko-scroll">
          Görgessen <span aria-hidden>↓</span>
        </a>
      </div>
    </header>
  );
}

function Clients() {
  const row = (
    <>
      {CLIENTS.map((c) => (
        <span key={c} className="ko-client">
          {c}
          <i aria-hidden>◆</i>
        </span>
      ))}
    </>
  );
  return (
    <section className="ko-clients" aria-label="Megbízóink">
      <p className="ko-clients-label">Megbízóink közül (kitalált partnerek)</p>
      <div className="ko-marquee" aria-hidden>
        <div className="ko-marquee-track">
          {row}
          {row}
        </div>
      </div>
      <ul className="sr-only">
        {CLIENTS.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </section>
  );
}

function Statement() {
  const row = useRef<HTMLDivElement>(null);
  const text = 'Nem stílust tervezünk, hanem viszonyokat: a fény és a fal, a lépés és a lépcső, a ház és a telek között. Ami jól van megtervezve, arról nem beszélünk — csak jól érezzük magunkat benne.';
  const accent = new Set(['viszonyokat:', 'jól']);
  return (
    <section className="ko-statement" id="ko-statement">
      <div className="ko-wrap">
        <p className="ko-kicker" data-reveal>
          ( 01 — A stúdióról )
        </p>
        <p className="ko-big" data-reveal>
          {text.split(' ').map((w, i) => (
            <span key={i} className={`ko-word ${accent.has(w) ? 'is-accent' : ''}`} style={{ '--i': i } as CSSProperties}>
              {w}{' '}
            </span>
          ))}
        </p>
        <div className="ko-pillars lp-swipe" ref={row}>
          {[
            ['Fény', 'Minden tervünk a nap járásával kezdődik: hol ébred a ház, és hová esik az utolsó délutáni sugár.'],
            ['Anyag', 'Kő, fa, mész, beton — kevés, őszinte anyag, amely szépen öregszik, és nem kér folyamatos figyelmet.'],
            ['Arány', 'A kényelem mérhető. A belmagasságtól a lépcsőfokig minden méretet emberi léptékre szabunk.'],
          ].map(([h, p], i) => (
            <article key={h} className="ko-pillar" data-reveal style={d(i * 120)}>
              <span className="ko-num">0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <SwipeDots row={row} count={3} />
      </div>
    </section>
  );
}

function Projects({ notify, phone }: { notify: (m: string) => void; phone: boolean }) {
  const [cat, setCat] = useState<(typeof CATS)[number]>('Mind');
  const grid = useRef<HTMLDivElement>(null);
  const before = useRef(new Map<string, DOMRect>());

  const pick = (c: (typeof CATS)[number]) => {
    if (c === cat || !grid.current) return;
    if (phone) {
      // phones: the grid is a sideways swipe row — no FLIP, just start the new list from its first card
      grid.current.scrollTo({ left: 0 });
      setCat(c);
      return;
    }
    const m = new Map<string, DOMRect>();
    grid.current.querySelectorAll<HTMLElement>('[data-id]').forEach((el) => {
      if (!el.hidden) m.set(el.dataset.id!, el.getBoundingClientRect());
    });
    before.current = m;
    setCat(c);
  };

  useLayoutEffect(() => {
    const m = before.current;
    const g = grid.current;
    if (!m.size || !g || reducedMotion()) return;
    before.current = new Map();
    const ease = 'cubic-bezier(.16,1,.3,1)';
    let n = 0;
    g.querySelectorAll<HTMLElement>('[data-id]').forEach((el) => {
      if (el.hidden) return;
      const r = el.getBoundingClientRect();
      const p = m.get(el.dataset.id!);
      if (p) {
        const s = p.width / r.width;
        el.animate([{ transform: `translate(${p.left - r.left}px, ${p.top - r.top}px) scale(${s})` }, { transform: 'none' }], { duration: 900, easing: ease });
      } else {
        el.setAttribute('data-in', '');
        el.animate([{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 80 + n++ * 70, easing: ease, fill: 'backwards' });
      }
    });
  }, [cat]);

  const visible = PROJECTS.filter((p) => cat === 'Mind' || p.cat === cat);
  return (
    <section className="ko-projects" id="ko-projects">
      <div className="ko-wrap">
        <div className="ko-sec-head">
          <div>
            <p className="ko-kicker" data-reveal>
              ( 02 — Válogatott munkák )
            </p>
            <h2 className="ko-h2" data-reveal>
              Projektek, <em>közelről.</em>
            </h2>
          </div>
          <div className="ko-filter lp-chips" role="tablist" aria-label="Projektek szűrése" data-reveal>
            {CATS.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? 'is-on' : ''} onClick={() => pick(c)}>
                {c}
                <sup>{c === 'Mind' ? PROJECTS.length : PROJECTS.filter((p) => p.cat === c).length}</sup>
              </button>
            ))}
          </div>
        </div>
        <div className="ko-grid lp-swipe" ref={grid} aria-live="polite">
          {(phone ? visible : PROJECTS).map((p) => {
            const idx = visible.indexOf(p);
            const [col, ar, mt] = SLOTS[Math.max(0, idx) % SLOTS.length];
            const Pic = ART[p.id];
            return (
              <article
                key={p.id}
                data-id={p.id}
                hidden={idx < 0}
                className={`ko-card ${idx % 2 ? 'is-odd' : ''}`}
                data-reveal
                style={{ '--col': col, '--ar': ar, '--mt': `${mt}px` } as CSSProperties}
              >
                <button type="button" className="ko-media" data-follow onClick={() => notify(`${p.title} — az esettanulmány ebben a design bemutatóban nem érhető el.`)} aria-label={`${p.title}, ${p.place} — esettanulmány`}>
                  <span className="ko-media-in">
                    <Pic />
                  </span>
                  <span className="ko-follow" aria-hidden>
                    Megnézem
                  </span>
                </button>
                <div className="ko-cap">
                  <span className="ko-cap-n">{String(PROJECTS.indexOf(p) + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>
                      {p.place} · {p.year} · {p.area}
                    </p>
                  </div>
                  <span className="ko-tag">{p.cat}</span>
                </div>
              </article>
            );
          })}
        </div>
        <SwipeDots row={grid} count={visible.length} />
      </div>
    </section>
  );
}

function Services() {
  const row = useRef<HTMLOListElement>(null);
  return (
    <section className="ko-services" id="ko-services">
      <div className="ko-wrap ko-services-grid">
        <div className="ko-sticky">
          <p className="ko-kicker" data-reveal>
            ( 03 — Szolgáltatások )
          </p>
          <h2 className="ko-h2" data-reveal>
            Egy kézben, <em>az elejétől.</em>
          </h2>
          <p className="ko-body" data-reveal>
            Kis csapattal dolgozunk, egyszerre legfeljebb nyolc projekten. Így minden tervet az a két ember visz végig, akivel az első kávét megittuk.
          </p>
        </div>
        <div className="ko-svc-wrap">
          <ol className="ko-svc-list lp-swipe" ref={row}>
          {SERVICES.map(([h, p, tags], i) => (
            <li key={h} className="ko-svc" data-reveal style={d(i * 70)}>
              <span className="ko-num">0{i + 1}</span>
              <div>
                <h3>{h}</h3>
                <p>{p}</p>
                <ul>
                  {tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <span className="ko-svc-arrow" aria-hidden>
                ↗
              </span>
            </li>
          ))}
          </ol>
          <SwipeDots row={row} count={SERVICES.length} />
        </div>
      </div>
    </section>
  );
}

function Process() {
  const row = useRef<HTMLOListElement>(null);
  return (
    <section className="ko-process" id="ko-process">
      <div className="ko-wrap">
        <p className="ko-kicker" data-reveal>
          ( 04 — Folyamat )
        </p>
        <h2 className="ko-h2 ko-h2--wide" data-reveal>
          Négy lépés a telektől <em>a kulcsátadásig.</em>
        </h2>
        <ol className="ko-steps lp-swipe" ref={row}>
          {STEPS.map(([h, t, p], i) => (
            <li key={h} className="ko-step" data-reveal style={d(i * 140)}>
              <span className="ko-step-line" aria-hidden />
              <span className="ko-step-n">0{i + 1}</span>
              <h3>{h}</h3>
              <span className="ko-step-t">{t}</span>
              <p>{p}</p>
            </li>
          ))}
        </ol>
        <SwipeDots row={row} count={STEPS.length} />
      </div>
    </section>
  );
}

function Stat({ to, label, suffix = '', run }: { to: number; label: string; suffix?: string; run: boolean }) {
  const v = useCountUp(to, run, 1800);
  return (
    <div>
      <dd>
        {Math.round(v).toLocaleString('hu-HU')}
        {suffix}
      </dd>
      <dt>{label}</dt>
    </div>
  );
}

function Awards() {
  const [ref, seen] = useInView<HTMLDListElement>(0.4);
  return (
    <section className="ko-awards">
      <div className="ko-wrap">
        <dl className="ko-stats" ref={ref}>
          <Stat to={64} label="megvalósult projekt" run={seen} />
          <Stat to={14} label="év a szakmában" run={seen} />
          <Stat to={38000} label="tervezett négyzetméter" run={seen} />
          <Stat to={9} label="szakmai elismerés" run={seen} />
        </dl>
        <div className="ko-awards-grid">
          <div>
            <p className="ko-kicker" data-reveal>
              ( 05 — Elismerések )
            </p>
            <h2 className="ko-h2" data-reveal>
              Csendes munka, <em>hangos visszhang.</em>
            </h2>
            <p className="ko-fine" data-reveal>
              Az itt szereplő díjak és szemlék nevei kitaláltak.
            </p>
          </div>
          <ul className="ko-award-list">
            {AWARDS.map(([y, a, r, p], i) => (
              <li key={a} data-reveal style={d(i * 70)}>
                <span className="ko-aw-y">{y}</span>
                <span className="ko-aw-a">{a}</span>
                <span className="ko-aw-r">{r}</span>
                <span className="ko-aw-p">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Quotes() {
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="ko-quotes">
      <div className="ko-wrap">
        <div className="ko-quotes-grid lp-swipe" ref={row}>
          {QUOTES.map(([q, who, what], i) => (
            <figure key={who} className={`ko-quote ${i === 0 ? 'is-lead' : ''}`} data-reveal style={d(i * 120)}>
              <span className="ko-qmark" aria-hidden>
                „
              </span>
              <blockquote>{q}</blockquote>
              <figcaption>
                <b>{who}</b>
                <span>{what}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <SwipeDots row={row} count={QUOTES.length} />
        <p className="ko-fine ko-center" data-reveal>
          A vélemények és a megbízók kitaláltak — a Kővonal Stúdió egy design bemutató.
        </p>
      </div>
    </section>
  );
}

function Team() {
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="ko-team" id="ko-studio">
      <div className="ko-wrap">
        <div className="ko-sec-head">
          <div>
            <p className="ko-kicker" data-reveal>
              ( 06 — A stúdió )
            </p>
            <h2 className="ko-h2" data-reveal>
              Tizenkét ember, <em>egy asztal.</em>
            </h2>
          </div>
          <p className="ko-body" data-reveal>
            Építészek, belsőépítészek és egy makettező, egy VIII. kerületi egykori nyomdaműhelyben. Minden hétfőn ugyanannál a hosszú tölgyasztalnál kezdünk.
          </p>
        </div>
        <div className="ko-team-grid lp-swipe" ref={row}>
          {TEAM.map(([n, r, p, m], i) => (
            <article key={n} className="ko-person" data-reveal style={d(i * 100)}>
              <div className={`ko-portrait ko-portrait--${i}`} aria-hidden>
                <span>{m}</span>
              </div>
              <h3>{n}</h3>
              <p className="ko-role">{r}</p>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <SwipeDots row={row} count={TEAM.length} />
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="ko-faq">
      <div className="ko-wrap ko-faq-grid">
        <div>
          <p className="ko-kicker" data-reveal>
            ( 07 — Kérdések )
          </p>
          <h2 className="ko-h2" data-reveal>
            Amit elsőre <em>kérdezni szoktak.</em>
          </h2>
        </div>
        <div className="ko-acc">
          {FAQ.map(([q, a], n) => (
            <div key={q} className={`ko-acc-item ${open === n ? 'is-open' : ''}`} data-reveal style={d(n * 60)}>
              <button type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                {q}
                <span aria-hidden />
              </button>
              <div className="ko-acc-body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** the project enquiry form — inline in the contact section on larger screens, in a bottom sheet on phones */
function ContactForm({ notify, onSent }: { notify: (m: string) => void; onSent?: () => void }) {
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') ?? '').trim();
    const email = String(f.get('email') ?? '').trim();
    const msg = String(f.get('msg') ?? '').trim();
    if (name.length < 2) return notify('Kérjük, adja meg a nevét.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify('Kérjük, érvényes e-mail-címet adjon meg.');
    if (!type) return notify('Válassza ki, milyen projektről van szó.');
    if (msg.length < 15) return notify('Írjon pár mondatot a tervéről (legalább 15 karakter).');
    e.currentTarget.reset();
    setType('');
    setBudget('');
    notify('Köszönjük! Ez egy design bemutató — az üzenet nem lett elküldve.');
    onSent?.();
  };
  return (
    <form className="ko-form" onSubmit={submit} noValidate data-reveal style={d(120)}>
      <div className="ko-field-row">
        <label className="ko-field">
          <span>Név</span>
          <input name="name" autoComplete="name" placeholder="Kovács Anna" />
        </label>
        <label className="ko-field">
          <span>E-mail</span>
          <input name="email" type="email" autoComplete="email" placeholder="anna@email.hu" />
        </label>
      </div>
      <fieldset className="ko-chips">
        <legend>Projekt típusa</legend>
        {['Lakóház', 'Iroda', 'Belsőépítészet', 'Vendéglátás', 'Egyéb'].map((t) => (
          <button key={t} type="button" aria-pressed={type === t} className={type === t ? 'is-on' : ''} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
      </fieldset>
      <fieldset className="ko-chips">
        <legend>Becsült keret</legend>
        {['50 M Ft alatt', '50–150 M Ft', '150 M Ft felett', 'Még nem tudom'].map((t) => (
          <button key={t} type="button" aria-pressed={budget === t} className={budget === t ? 'is-on' : ''} onClick={() => setBudget(t)}>
            {t}
          </button>
        ))}
      </fieldset>
      <label className="ko-field">
        <span>Helyszín</span>
        <input name="place" placeholder="pl. Budapest XII., vagy Balaton-felvidék" />
      </label>
      <label className="ko-field">
        <span>Pár mondat a tervről</span>
        <textarea name="msg" rows={4} placeholder="Egy 1930-as évekbeli villát szeretnénk felújítani, kerttel együtt…" />
      </label>
      <div className="ko-form-foot">
        <p className="ko-fine">Az űrlap nem küld adatot — ez egy design bemutató.</p>
        <button type="submit" className="ko-btn ko-btn--light" data-magnet>
          Üzenet küldése <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}

function Contact({ notify, phone, onOpen }: { notify: (m: string) => void; phone: boolean; onOpen: () => void }) {
  return (
    <section className="ko-contact" id="ko-contact">
      <div className="ko-wrap ko-contact-grid">
        <div className="ko-contact-copy">
          <p className="ko-kicker" data-reveal>
            ( 08 — Projektindítás )
          </p>
          <h2 className="ko-h1 ko-h1--mid" data-reveal>
            Beszéljünk <em>a terveiről.</em>
          </h2>
          <p className="ko-lead" data-reveal>
            Írja le pár mondatban, mit szeretne építeni vagy átalakítani. Két munkanapon belül válaszolunk, és az első, egyórás konzultáció díjtalan.
          </p>
          <dl className="ko-contact-dl" data-reveal>
            <div>
              <dt>Stúdió</dt>
              <dd>1085 Budapest, Nyomda köz 4.</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>iroda@kovonal.studio</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>+36 1 555 0142</dd>
            </div>
            <div>
              <dt>Nyitvatartás</dt>
              <dd>H–P · 9:00–18:00</dd>
            </div>
          </dl>
        </div>
        {phone ? (
          <div className="ko-contact-app">
            <button type="button" className="ko-btn ko-btn--light" onClick={onOpen}>
              Projekt indítása <span aria-hidden>→</span>
            </button>
            <p className="ko-fine">Pár kérdés, kb. 2 perc. Az első konzultáció díjtalan.</p>
          </div>
        ) : (
          <ContactForm notify={notify} />
        )}
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ['Stúdió', ['Projektek', 'Szolgáltatások', 'Folyamat', 'Csapat']],
    ['Kapcsolat', ['iroda@kovonal.studio', '+36 1 555 0142', '1085 Budapest, Nyomda köz 4.']],
    ['Kövessen', ['Napló', 'Hírlevél', 'Karrier']],
  ];
  return (
    <footer className="ko-footer">
      <div className="ko-wrap">
        <div className="ko-footer-grid">
          <div>
            <Wordmark />
            <p className="ko-fine">Építészet és belsőépítészet, Budapest.</p>
          </div>
          {cols.map(([h, items]) => (
            <div key={h}>
              <h4>{h}</h4>
              <ul>
                {items.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="ko-footer-giant" aria-hidden>
          Kővonal
        </p>
        <div className="ko-footer-base">
          <span>© {new Date().getFullYear()} Kővonal Stúdió</span>
          <span>A Kővonal Stúdió kitalált márka — David Mészáros landing page koncepciója.</span>
        </div>
      </div>
    </footer>
  );
}

export default function Kovonal() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  usePointerMagnets(root);
  const [toast, notify] = useToast(3600);
  const phone = useLandingPhone();
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => setSheet(false), []);
  return (
    <div ref={root} className="kovonal">
      <Nav />
      <Hero />
      <Clients />
      <Statement />
      <Projects notify={notify} phone={phone} />
      <Services />
      <Process />
      <Awards />
      <Quotes />
      <Team />
      <Faq />
      <Contact notify={notify} phone={phone} onOpen={() => setSheet(true)} />
      <Footer />
      <div className={`ko-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
      <AppSheet open={sheet && phone} title="Projekt indítása" onClose={closeSheet} closeLabel="Bezárás">
        <ContactForm notify={notify} onSent={closeSheet} />
      </AppSheet>
      <AppTabBar
        tabs={[
          { id: 'ko-top', label: 'Kezdés', icon: <AppIcons.home /> },
          { id: 'ko-projects', label: 'Munkák', icon: <AppIcons.grid /> },
          { id: 'ko-process', label: 'Folyamat', icon: <AppIcons.list /> },
          { id: 'ko-studio', label: 'Stúdió', icon: <AppIcons.users /> },
        ]}
        action={{ label: 'Projekt', icon: <AppIcons.ruler />, onClick: () => setSheet(true) }}
      />
    </div>
  );
}
