import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/manrope';
import './velmira.css';
import { jump, useCountUp, useInView, usePointerTilt, useReveal, useScrolledPast, useToast } from '../kit';

/**
 * Velmira — a fictional clean skincare brand.
 * Soft, sensorial, minimal: blush, sand and olive, code-drawn glass on a stone plinth.
 */

type Step = 'cleanse' | 'treat' | 'moisturise' | 'protect';
type Time = 'am' | 'pm';
type Shape = 'dropper' | 'pump' | 'jar' | 'tube';
type Product = {
  id: string;
  name: string;
  short: string;
  kind: string;
  step: Step;
  times: Time[];
  price: number;
  size: string;
  shape: Shape;
  glass: [string, string];
  liquid: string;
  cap: string;
  bulb?: string;
  blurb: string;
  rating: number;
  reviews: number;
  badge?: string;
};

const P: Product[] = [
  { id: 'dew', name: 'Dew Gel Cleanser', short: 'Dew', kind: 'Low-foam gel cleanser', step: 'cleanse', times: ['am', 'pm'], price: 26, size: '150 ml', shape: 'pump', glass: ['#F6ECE6', '#D9C3B8'], liquid: '#E9C9BC', cap: '#3E4A2F', blurb: 'A cushiony gel with oat beta-glucan that lifts the day away and leaves skin calm, never squeaky.', rating: 4.8, reviews: 3120, badge: 'Best-seller' },
  { id: 'milk', name: 'Oat Milk Cleanser', short: 'Oat Milk', kind: 'Cream-to-milk cleanser', step: 'cleanse', times: ['am', 'pm'], price: 28, size: '150 ml', shape: 'pump', glass: ['#F1EDE2', '#CFC6B1'], liquid: '#EFE6D2', cap: '#8C877F', blurb: 'A soft cream that melts make-up and SPF into a milk — for dry or reactive skin that dislikes foam.', rating: 4.8, reviews: 1430 },
  { id: 'clarity', name: 'Clarity Serum 10%', short: 'Clarity', kind: 'Niacinamide serum', step: 'treat', times: ['am', 'pm'], price: 42, size: '30 ml', shape: 'dropper', glass: ['#F3E6DA', '#CDB49C'], liquid: '#D8B48E', cap: '#3E4A2F', bulb: '#E6B8A8', blurb: '10% niacinamide and 1% zinc PCA refine the look of pores and even tone in four weeks.', rating: 4.9, reviews: 4210, badge: 'Most loved' },
  { id: 'bright', name: 'Bright C 15%', short: 'Bright C', kind: 'Vitamin C serum', step: 'treat', times: ['am'], price: 46, size: '30 ml', shape: 'dropper', glass: ['#F5E2C8', '#D7A866'], liquid: '#E8B25A', cap: '#3E4A2F', bulb: '#EBC9A8', blurb: '15% stable vitamin C with ferulic acid for a brighter, more even tone and a morning-long glow.', rating: 4.7, reviews: 1540 },
  { id: 'renew', name: 'Renewal Drops', short: 'Renewal', kind: 'Bakuchiol night oil', step: 'treat', times: ['pm'], price: 48, size: '30 ml', shape: 'dropper', glass: ['#EAD9BF', '#B99668'], liquid: '#C58F4E', cap: '#2F3824', bulb: '#C9A58C', blurb: 'Plant-derived bakuchiol in cold-pressed rosehip — the retinol-like reset, without the sting.', rating: 4.7, reviews: 1860 },
  { id: 'cloud', name: 'Cloud Cream', short: 'Cloud', kind: 'Whipped day & night cream', step: 'moisturise', times: ['am', 'pm'], price: 38, size: '50 ml', shape: 'jar', glass: ['#F7EFE9', '#DCCBC0'], liquid: '#F7E3DA', cap: '#B8AFA3', blurb: 'An airy whip of squalane and ceramides that melts on contact and holds moisture for 72 hours.', rating: 4.8, reviews: 2940, badge: 'Refill' },
  { id: 'balm', name: 'Barrier Balm', short: 'Barrier', kind: 'Rich overnight balm', step: 'moisturise', times: ['pm'], price: 44, size: '50 ml', shape: 'jar', glass: ['#EFE6D6', '#C9B89B'], liquid: '#E8D9BC', cap: '#3E4A2F', blurb: 'A dense, cocooning balm with 2% ceramides for dry, stressed or winter-worn skin.', rating: 4.8, reviews: 1270 },
  { id: 'veil', name: 'Daily Veil SPF 40', short: 'Veil 40', kind: 'Mineral sun fluid', step: 'protect', times: ['am'], price: 34, size: '50 ml', shape: 'tube', glass: ['#F4E4DC', '#DDBFB1'], liquid: '#F4E4DC', cap: '#3E4A2F', blurb: 'Sheer zinc oxide that disappears on every skin tone — no white cast, no pilling under make-up.', rating: 4.7, reviews: 2380, badge: 'New' },
  { id: 'sleep', name: 'Overnight Veil', short: 'Overnight', kind: 'Sleeping mask', step: 'protect', times: ['pm'], price: 36, size: '75 ml', shape: 'tube', glass: ['#E5E2D6', '#B9B5A3'], liquid: '#E5E2D6', cap: '#8C877F', blurb: 'A sealing gel-mask that locks in your evening routine while you sleep. Wake up to bounce.', rating: 4.6, reviews: 980 },
];
const byId = (id: string) => P.find((p) => p.id === id)!;

const STEPS: Array<[Step, string, string]> = [
  ['cleanse', 'Cleanse', 'Begin clean'],
  ['treat', 'Treat', 'The active step'],
  ['moisturise', 'Moisturise', 'Seal it in'],
  ['protect', 'Protect', 'Shield & lock'],
];

const INGREDIENTS = [
  { id: 'nia', name: 'Niacinamide', inci: 'Niacinamide', pct: 10, origin: 'Bio-fermented vitamin B3, Netherlands', benefit: 'Refines the look of pores, evens tone and strengthens the barrier over four weeks of daily use.', hue: '#D8B48E', products: ['clarity'] },
  { id: 'bak', name: 'Bakuchiol', inci: 'Bakuchiol', pct: 1, origin: 'Babchi seeds, sustainably harvested in India', benefit: 'A gentle, plant-derived alternative to retinol that smooths texture without redness or sun sensitivity.', hue: '#C58F4E', products: ['renew'] },
  { id: 'squ', name: 'Squalane', inci: 'Squalane', pct: 5, origin: 'Pressed olives, Andalusia', benefit: 'A weightless lipid that mirrors skin’s own oils — softens instantly and never clogs.', hue: '#9AA27A', products: ['cloud', 'renew'] },
  { id: 'cer', name: 'Ceramide NP', inci: 'Ceramide NP', pct: 2, origin: 'Plant-derived, fermented in France', benefit: 'Rebuilds the mortar between skin cells so moisture stays in and irritants stay out.', hue: '#E6C3B5', products: ['balm', 'cloud'] },
  { id: 'oat', name: 'Oat beta-glucan', inci: 'Avena Sativa Kernel Extract', pct: 3, origin: 'Whole oats, Finnish lake region', benefit: 'Soothes and hydrates deeper than hyaluronic acid, ideal for reactive skin after cleansing.', hue: '#E3D3B4', products: ['dew', 'milk', 'sleep'] },
  { id: 'vitc', name: 'Vitamin C', inci: '3-O-Ethyl Ascorbic Acid', pct: 15, origin: 'Bio-fermented, Swiss Alps', benefit: 'A stable form of vitamin C that brightens, fades dark spots and defends against daily pollution.', hue: '#E8B25A', products: ['bright'] },
  { id: 'zinc', name: 'Zinc oxide', inci: 'Zinc Oxide (non-nano)', pct: 18, origin: 'Mineral, purified in Germany', benefit: 'Broad-spectrum mineral protection that sits on the skin and calms it at the same time.', hue: '#D9D4CC', products: ['veil'] },
  { id: 'rose', name: 'Rosehip oil', inci: 'Rosa Canina Fruit Oil', pct: 12, origin: 'Cold-pressed wild rosehip, Patagonia', benefit: 'Rich in natural vitamin A and fatty acids that fade marks and restore glow overnight.', hue: '#D69A7E', products: ['renew', 'balm'] },
];

const TEXTURES = [
  { id: 'gel', name: 'Gel', product: 'dew', feel: 'Cool, cushiony, slips', finish: 'Fresh & clean', absorbs: 'Rinses in 30 s', scent: 'Unscented', note: 'A bouncy, water-clear gel that turns to a soft milk with a splash of water.', a: '#F4E2DA', b: '#E2BFB1' },
  { id: 'serum', name: 'Serum', product: 'clarity', feel: 'Silky, weightless', finish: 'Velvet-matte', absorbs: 'In 20 seconds', scent: 'Unscented', note: 'A fluid that glides like water and dries to a soft, blurred finish under make-up.', a: '#F0DDC4', b: '#C9A57C' },
  { id: 'cream', name: 'Cream', product: 'cloud', feel: 'Airy, whipped', finish: 'Dewy, never greasy', absorbs: 'In a minute', scent: 'A breath of oat', note: 'Whipped until it holds soft peaks — it melts the moment it meets warm skin.', a: '#FFFCFA', b: '#EED8CE' },
  { id: 'oil', name: 'Oil', product: 'renew', feel: 'Rich, glossy', finish: 'Lit-from-within', absorbs: 'Overnight', scent: 'Rosehip, faintly', note: 'Three drops warmed between the palms, pressed in — and the room smells faintly of rosehip.', a: '#E9C990', b: '#B57A3C' },
];

const PRESS = ['The Ondrel Edit', 'CASSAVINE', 'Pellory Weekly', 'THE MIREN JOURNAL', 'Sallowe Notes', 'VERSTAD', 'Lumière Quarterly'];

const REVIEWS = [
  { q: 'My skin stopped arguing with me. Three weeks of Clarity and my pores look airbrushed — in daylight.', who: 'Noémi V.', skin: 'Combination skin', product: 'Clarity Serum 10%', r: 5 },
  { q: 'The Cloud Cream feels like whipped silk. I bought the refill before I finished the first jar.', who: 'Hannah L.', skin: 'Dry skin', product: 'Cloud Cream', r: 5 },
  { q: 'Finally a mineral SPF that doesn’t turn me grey. It sits beautifully under foundation.', who: 'Amara O.', skin: 'Deep skin tone', product: 'Daily Veil SPF 40', r: 4.5 },
];

const FAQ = [
  ['What does “clean” mean at Velmira?', 'Every formula is free from added fragrance, drying alcohols, mineral oils and over 1,400 ingredients we choose not to use. Full ingredient lists sit on every product — nothing is hidden behind a “parfum”.'],
  ['Is it suitable for sensitive skin?', 'All formulas are dermatologist-tested on sensitive skin and pH-balanced. If you are reactive, start with Dew, Cloud and Veil, then introduce one active at a time.'],
  ['How does subscribe & save work?', 'Switch it on in your bag and every product ships on your chosen rhythm with 15% off. Skip, swap or pause any time — no fees, no lock-in.'],
  ['Are the bottles refillable?', 'Yes. Our glass and aluminium are made to be kept: refills arrive in compostable pouches and cost up to 20% less.'],
  ['When will I see results?', 'Hydration is immediate. Tone and texture usually shift within 4 weeks, which is one full skin cycle. We offer a 60-day comfort guarantee on every first order.'],
];

const eur = (n: number) => `€${n.toFixed(n % 1 ? 2 : 0)}`;
const SHIP_FREE = 60;

/* ---------------- art ---------------- */

function Shape({ p, uid }: { p: Product; uid: string }) {
  const g = `url(#${uid}g)`;
  const l = `url(#${uid}l)`;
  const defs = (
    <defs>
      <linearGradient id={`${uid}g`} x1="0" x2="1">
        <stop offset="0" stopColor={p.glass[1]} />
        <stop offset=".3" stopColor={p.glass[0]} />
        <stop offset=".68" stopColor={p.glass[0]} />
        <stop offset="1" stopColor={p.glass[1]} />
      </linearGradient>
      <linearGradient id={`${uid}l`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.liquid} stopOpacity=".5" />
        <stop offset="1" stopColor={p.liquid} stopOpacity="1" />
      </linearGradient>
    </defs>
  );
  const label = (y: number, w = 36) => (
    <g>
      <rect x={60 - w / 2} y={y} width={w} height="30" rx="2" fill="#FCF8F3" opacity=".92" />
      <text x="60" y={y + 11} textAnchor="middle" className="vm-svg-brand">
        VELMIRA
      </text>
      <text x="60" y={y + 23} textAnchor="middle" className="vm-svg-name">
        {p.short}
      </text>
    </g>
  );
  if (p.shape === 'dropper')
    return (
      <g>
        {defs}
        <rect x="50" y="6" width="20" height="36" rx="10" fill={p.bulb} />
        <rect x="54" y="11" width="3.5" height="24" rx="1.8" fill="#fff" opacity=".4" />
        <rect x="45" y="40" width="30" height="17" rx="3" fill={p.cap} />
        <rect x="47" y="42" width="26" height="3" rx="1.5" fill="#fff" opacity=".22" />
        <path d="M50 57h20v6c0 5 16 7 16 17v62a10 10 0 0 1-10 10H44a10 10 0 0 1-10-10V80c0-10 16-12 16-17z" fill={g} />
        <path d="M37 98h46v44a7 7 0 0 1-7 7H44a7 7 0 0 1-7-7z" fill={l} />
        <rect x="58.5" y="57" width="3" height="78" rx="1.5" fill="#fff" opacity=".45" />
        {label(104)}
        <rect x="38.5" y="80" width="5" height="62" rx="2.5" fill="#fff" opacity=".62" />
        <rect x="77" y="86" width="2.5" height="44" rx="1.2" fill="#fff" opacity=".38" />
      </g>
    );
  if (p.shape === 'pump')
    return (
      <g>
        {defs}
        <rect x="56" y="22" width="8" height="20" fill={p.cap} />
        <rect x="42" y="10" width="36" height="14" rx="4" fill={p.cap} />
        <rect x="72" y="13" width="28" height="6" rx="3" fill={p.cap} />
        <rect x="45" y="12" width="30" height="3" rx="1.5" fill="#fff" opacity=".2" />
        <rect x="47" y="38" width="26" height="14" rx="3" fill={p.cap} />
        <rect x="32" y="50" width="56" height="102" rx="16" fill={g} />
        <rect x="35" y="76" width="50" height="73" rx="13" fill={l} />
        <rect x="59" y="52" width="2" height="92" fill="#fff" opacity=".45" />
        {label(92, 40)}
        <rect x="37" y="60" width="5" height="82" rx="2.5" fill="#fff" opacity=".6" />
        <rect x="80" y="66" width="2.5" height="50" rx="1.2" fill="#fff" opacity=".35" />
      </g>
    );
  if (p.shape === 'jar')
    return (
      <g>
        {defs}
        <rect x="18" y="92" width="84" height="60" rx="16" fill={g} />
        <rect x="22" y="98" width="76" height="50" rx="12" fill={l} />
        <rect x="16" y="70" width="88" height="26" rx="7" fill={p.cap} />
        {[30, 42, 54, 66, 78, 90].map((x) => (
          <rect key={x} x={x} y="74" width="1.2" height="18" fill="#000" opacity=".1" />
        ))}
        <rect x="20" y="72.5" width="80" height="4" rx="2" fill="#fff" opacity=".28" />
        {label(108, 44)}
        <rect x="24" y="100" width="5" height="40" rx="2.5" fill="#fff" opacity=".6" />
        <rect x="93" y="104" width="2.5" height="28" rx="1.2" fill="#fff" opacity=".35" />
      </g>
    );
  return (
    <g>
      {defs}
      <rect x="32" y="12" width="56" height="12" rx="2" fill={p.glass[1]} />
      <path d="M36 15h48M36 19h48" stroke="#fff" strokeOpacity=".4" />
      <path d="M34 24h52l-8 104H42z" fill={g} />
      {label(64, 32)}
      <path d="M39 30h6l6 92h-4z" fill="#fff" opacity=".5" />
      <rect x="40" y="126" width="40" height="26" rx="5" fill={p.cap} />
      <rect x="43" y="129" width="4" height="20" rx="2" fill="#fff" opacity=".22" />
    </g>
  );
}

function ProductArt({ p, uid }: { p: Product; uid: string }) {
  return (
    <svg viewBox="0 0 120 160" className="vm-art" aria-hidden>
      <defs>
        <filter id={`${uid}s`} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <ellipse cx="62" cy="153" rx="42" ry="4.5" fill="#3E4A2F" opacity=".22" filter={`url(#${uid}s)`} />
      <Shape p={p} uid={uid} />
    </svg>
  );
}

function Stars({ r, size = 13 }: { r: number; size?: number }) {
  const five = Array.from({ length: 5 }, (_, i) => (
    <svg key={i} viewBox="0 0 20 20" width={size} height={size}>
      <path d="M10 1.6l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.9l6.1-.7z" />
    </svg>
  ));
  return (
    <span className="vm-stars" role="img" aria-label={`${r} out of 5 stars`} style={{ '--r': `${(r / 5) * 100}%` } as CSSProperties}>
      <span className="vm-stars-base">{five}</span>
      <span className="vm-stars-fill">{five}</span>
    </span>
  );
}

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`vm-wordmark ${className}`}>
      Velmira<i aria-hidden>°</i>
    </span>
  );
}

/* ---------------- hero ---------------- */

// placement of products in the still life (viewBox 640 x 600); hotspot in %
const STILL: Array<{ id: string; x: number; y: number; s: number; hx: number; hy: number }> = [
  { id: 'dew', x: 110, y: 236, s: 1.55, hx: 31.7, hy: 55 },
  { id: 'cloud', x: 364, y: 215, s: 1.35, hx: 69.5, hy: 54.5 },
  { id: 'clarity', x: 195, y: 210, s: 1.75, hx: 46.9, hy: 57 },
  { id: 'renew', x: 90, y: 348, s: 1, hx: 23.4, hy: 64.5 },
  { id: 'veil', x: 337, y: 335, s: 1.05, hx: 62.5, hy: 80.5 },
];

function StillLife() {
  return (
    <svg viewBox="0 0 640 600" className="vm-still" aria-hidden>
      <defs>
        <linearGradient id="vm-arch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3DCD4" />
          <stop offset="1" stopColor="#EBCFC4" />
        </linearGradient>
        <radialGradient id="vm-orb" cx=".35" cy=".35" r=".7">
          <stop offset="0" stopColor="#F4ECDD" />
          <stop offset="1" stopColor="#E0CFB2" />
        </radialGradient>
        <linearGradient id="vm-stone" x1="0" x2="1">
          <stop offset="0" stopColor="#CFC8BD" />
          <stop offset=".35" stopColor="#E9E4DC" />
          <stop offset=".7" stopColor="#DAD3C8" />
          <stop offset="1" stopColor="#B9B1A5" />
        </linearGradient>
        <linearGradient id="vm-stone-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EFEBE5" />
          <stop offset="1" stopColor="#E2DCD2" />
        </linearGradient>
        <filter id="vm-blur" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="vm-blur-s" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <path d="M130 600V280a190 190 0 0 1 380 0V600Z" fill="url(#vm-arch)" />
      <circle cx="212" cy="168" r="56" fill="url(#vm-orb)" className="vm-orb" />
      <g className="vm-sprig" fill="#3E4A2F">
        <path d="M566 470C560 390 584 300 612 214" stroke="#3E4A2F" strokeWidth="2" fill="none" />
        {[
          [570, 420, -60, 0.9],
          [578, 380, 40, 0.75],
          [584, 340, -55, 0.85],
          [594, 300, 35, 0.7],
          [600, 262, -50, 0.8],
          [610, 228, 30, 0.65],
        ].map(([x, y, r, o], i) => (
          <ellipse key={i} cx={x} cy={y} rx="24" ry="7" transform={`rotate(${r} ${x} ${y})`} opacity={o} />
        ))}
      </g>
      <g className="vm-sprig vm-sprig--b" fill="#6B7556">
        <path d="M96 476C80 410 66 350 40 290" stroke="#6B7556" strokeWidth="1.6" fill="none" />
        {[
          [88, 440, 55, 0.8],
          [78, 400, -40, 0.7],
          [68, 360, 50, 0.75],
          [56, 324, -35, 0.6],
        ].map(([x, y, r, o], i) => (
          <ellipse key={i} cx={x} cy={y} rx="20" ry="6" transform={`rotate(${r} ${x} ${y})`} opacity={o} />
        ))}
      </g>
      {/* main plinth */}
      <ellipse cx="320" cy="560" rx="250" ry="22" fill="#3E4A2F" opacity=".16" filter="url(#vm-blur)" />
      <path d="M86 472v72a234 32 0 0 0 468 0v-72z" fill="url(#vm-stone)" />
      <ellipse cx="320" cy="472" rx="234" ry="34" fill="url(#vm-stone-top)" />
      {[
        [150, 520, 1.4],
        [260, 540, 1],
        [420, 528, 1.6],
        [500, 506, 1],
        [330, 512, 0.8],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#8C877F" opacity=".35" />
      ))}
      {/* riser block */}
      <ellipse cx="452" cy="472" rx="96" ry="14" fill="#3E4A2F" opacity=".14" filter="url(#vm-blur-s)" />
      <path d="M356 420v50a89 15 0 0 0 178 0v-50z" fill="url(#vm-stone)" />
      <ellipse cx="445" cy="420" rx="89" ry="15" fill="#F2EEE8" />
      {/* contact shadows and a long, soft cast shadow (light from the left) */}
      <ellipse cx="236" cy="474" rx="70" ry="8" fill="#3E4A2F" opacity=".25" filter="url(#vm-blur-s)" />
      <ellipse cx="330" cy="478" rx="60" ry="8" fill="#3E4A2F" opacity=".24" filter="url(#vm-blur-s)" />
      <ellipse cx="460" cy="421" rx="66" ry="6" fill="#3E4A2F" opacity=".22" filter="url(#vm-blur-s)" />
      <ellipse cx="160" cy="500" rx="40" ry="6" fill="#3E4A2F" opacity=".25" filter="url(#vm-blur-s)" />
      <ellipse cx="410" cy="497" rx="44" ry="6" fill="#3E4A2F" opacity=".25" filter="url(#vm-blur-s)" />
      {STILL.map((s) => (
        <g key={s.id} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
          <Shape p={byId(s.id)} uid={`vm-h-${s.id}`} />
        </g>
      ))}
      {/* pebble and a single drop of serum */}
      <ellipse cx="520" cy="500" rx="22" ry="11" fill="#A9A196" />
      <ellipse cx="514" cy="495" rx="11" ry="4" fill="#fff" opacity=".35" />
      <path d="M262 492c5-1 9 1 8 4s-7 4-12 3-5-6 4-7z" fill="#D8B48E" opacity=".85" />
      <ellipse cx="263" cy="494" rx="2.5" ry="1" fill="#fff" opacity=".8" />
    </svg>
  );
}

function Hero({ onAdd }: { onAdd: (id: string) => void }) {
  const area = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  usePointerTilt(area, tilt, 5);
  const [open, setOpen] = useState<string | null>(null);
  const [statRef, seen] = useInView<HTMLDListElement>(0.4);
  const reviews = useCountUp(12400, seen, 1800);
  const spot = STILL.find((s) => s.id === open);
  const prod = open ? byId(open) : null;

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  return (
    <header ref={area} className="vm-hero" id="top">
      <div className="vm-wrap vm-hero-grid">
        <div className="vm-hero-copy">
          <p className="vm-kicker" data-reveal>
            Clean skincare · Formulated in Budapest
          </p>
          <h1 className="vm-h1" data-reveal style={{ '--d': '80ms' } as CSSProperties}>
            Skin, <em>softly</em>
            <br />
            kept.
          </h1>
          <p className="vm-lead" data-reveal style={{ '--d': '180ms' } as CSSProperties}>
            Nine quiet formulas with clinically meaningful doses, refillable glass and nothing you would need to look up. Build a routine in a
            minute — your skin will notice in a fortnight.
          </p>
          <div className="vm-cta-row" data-reveal style={{ '--d': '260ms' } as CSSProperties}>
            <a href="#routine" onClick={jump('routine')} className="vm-btn vm-btn--olive">
              Build your routine <span aria-hidden>→</span>
            </a>
            <a href="#shop" onClick={jump('shop')} className="vm-btn vm-btn--line">
              Shop best-sellers
            </a>
          </div>
          <dl className="vm-hero-stats" ref={statRef} data-reveal style={{ '--d': '340ms' } as CSSProperties}>
            <div>
              <dt>
                <Stars r={4.8} size={12} />
              </dt>
              <dd>{Math.round(reviews).toLocaleString('en-GB')} reviews</dd>
            </div>
            <div>
              <dt>100%</dt>
              <dd>refillable glass</dd>
            </div>
            <div>
              <dt>0</dt>
              <dd>added fragrance</dd>
            </div>
          </dl>
        </div>

        <div className="vm-stage-wrap" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
          <div className="vm-stage" ref={tilt}>
            <StillLife />
            {STILL.map((s) => {
              const p = byId(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`vm-spot ${open === s.id ? 'is-on' : ''}`}
                  style={{ left: `${s.hx}%`, top: `${s.hy}%` }}
                  aria-label={`${p.name} — details`}
                  aria-expanded={open === s.id}
                  onClick={() => setOpen(open === s.id ? null : s.id)}
                >
                  <span aria-hidden />
                </button>
              );
            })}
            {prod && spot && (
              <div
                key={prod.id}
                className={`vm-pcard ${spot.hx > 50 ? 'is-left' : ''}`}
                style={{ '--x': `${spot.hx}%`, '--y': `${spot.hy}%` } as CSSProperties}
                role="dialog"
                aria-label={prod.name}
              >
                <button type="button" className="vm-pcard-x" aria-label="Close" onClick={() => setOpen(null)}>
                  ×
                </button>
                <p className="vm-pcard-kind">
                  {prod.kind} · {prod.size}
                </p>
                <h3>{prod.name}</h3>
                <p className="vm-pcard-blurb">{prod.blurb}</p>
                <div className="vm-pcard-foot">
                  <span className="vm-pcard-rate">
                    <Stars r={prod.rating} size={11} /> {prod.rating}
                  </span>
                  <button
                    type="button"
                    className="vm-btn vm-btn--olive vm-btn--sm"
                    onClick={() => {
                      onAdd(prod.id);
                      setOpen(null);
                    }}
                  >
                    Add · {eur(prod.price)}
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="vm-stage-hint">
            <span className="vm-spot-mini" aria-hidden /> Tap a point to meet the formula
          </p>
        </div>
      </div>
    </header>
  );
}

/* ---------------- nav ---------------- */

function Nav({ count, onBag }: { count: number; onBag: () => void }) {
  const solid = useScrolledPast(30);
  return (
    <nav className={`vm-nav ${solid ? 'is-solid' : ''}`} aria-label="Velmira">
      <div className="vm-wrap vm-nav-in">
        <a href="#top" onClick={jump('top')} aria-label="Velmira home">
          <Wordmark />
        </a>
        <div className="vm-nav-links">
          {[
            ['shop', 'Shop'],
            ['routine', 'Routine'],
            ['ingredients', 'Ingredients'],
            ['reviews', 'Reviews'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {label}
            </a>
          ))}
        </div>
        <button type="button" className="vm-bagbtn" onClick={onBag} aria-label={`Open bag, ${count} items`}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M5 8h14l-1.2 12H6.2z M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span className="vm-bagbtn-label">Bag</span>
          <b key={count} className={count ? 'is-on' : ''}>
            {count}
          </b>
        </button>
      </div>
    </nav>
  );
}

/* ---------------- sections ---------------- */

function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="vm-marquee" aria-hidden>
      <div className="vm-marquee-track">
        {children}
        {children}
      </div>
    </div>
  );
}

function Pillars() {
  const items: Array<[string, string, ReactNode]> = [
    ['Doses that do something', 'Actives at the concentrations the research used — printed on the front, not buried in the small print.', <path key="a" d="M12 3v7l-5 9a1.5 1.5 0 0 0 1.3 2h7.4a1.5 1.5 0 0 0 1.3-2l-5-9V3M9 3h6M8.5 15h7" />],
    ['Nothing to decode', 'No added fragrance, no drying alcohols, no fillers. Every ingredient, why it is there, and where it comes from.', <path key="b" d="M4 6h16M4 12h10M4 18h7M17 15l2 2 3-4" />],
    ['Glass, made to be kept', 'Weighty refillable glass and aluminium. Refills arrive in compostable pouches and cost up to 20% less.', <path key="c" d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3zM7 13h10" />],
    ['Kind to reactive skin', 'Dermatologist-tested on sensitive skin, pH-balanced and gentle enough to use twice a day, every day.', <path key="d" d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />],
  ];
  return (
    <section className="vm-promise" id="promise">
      <div className="vm-wrap">
        <div className="vm-promise-head">
          <p className="vm-kicker" data-reveal>
            The Velmira promise
          </p>
          <h2 className="vm-h2" data-reveal>
            Fewer steps. <em>Better ones.</em>
          </h2>
        </div>
        <div className="vm-pillars">
          {items.map(([h, p, icon], i) => (
            <article key={h} className="vm-pillar" data-reveal style={{ '--d': `${i * 100}ms` } as CSSProperties}>
              <svg viewBox="0 0 24 24" className="vm-pillar-ico" aria-hidden>
                {icon}
              </svg>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BestSellers({ onAdd }: { onAdd: (id: string) => void }) {
  const list = ['clarity', 'cloud', 'dew', 'veil'].map(byId);
  return (
    <section className="vm-shop" id="shop">
      <div className="vm-wrap">
        <div className="vm-sec-head">
          <div>
            <p className="vm-kicker" data-reveal>
              Best-sellers
            </p>
            <h2 className="vm-h2" data-reveal>
              The four we are <em>asked about most.</em>
            </h2>
          </div>
          <p className="vm-body" data-reveal>
            Each one works alone and better together. Every bottle is refillable and every formula carries its full ingredient list.
          </p>
        </div>
        <div className="vm-grid">
          {list.map((p, i) => (
            <article key={p.id} className="vm-prod" data-reveal style={{ '--d': `${i * 90}ms` } as CSSProperties}>
              <div className={`vm-prod-art vm-tint-${i}`}>
                {p.badge && <span className="vm-badge">{p.badge}</span>}
                <ProductArt p={p} uid={`vm-bs-${p.id}`} />
              </div>
              <div className="vm-prod-meta">
                <p className="vm-prod-kind">{p.kind}</p>
                <h3>{p.name}</h3>
                <p className="vm-prod-rate">
                  <Stars r={p.rating} /> <span>{p.rating} · {p.reviews.toLocaleString('en-GB')}</span>
                </p>
                <div className="vm-prod-foot">
                  <span className="vm-price">
                    {eur(p.price)} <small>/ {p.size}</small>
                  </span>
                  <button type="button" className="vm-add" onClick={() => onAdd(p.id)} aria-label={`Add ${p.name} to bag`}>
                    <span aria-hidden>+</span> Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Routine({ onAddMany }: { onAddMany: (ids: string[]) => void }) {
  const [time, setTime] = useState<Time>('am');
  const [sel, setSel] = useState<Record<Time, Partial<Record<Step, string | null>>>>({
    am: { cleanse: 'dew', treat: 'clarity', moisturise: 'cloud', protect: 'veil' },
    pm: { cleanse: 'dew', treat: 'renew', moisturise: 'balm', protect: null },
  });
  const cur = sel[time];
  const chosen = STEPS.map(([s]) => cur[s]).filter(Boolean) as string[];
  const total = chosen.reduce((t, id) => t + byId(id).price, 0);
  const pick = (step: Step, id: string) => setSel((o) => ({ ...o, [time]: { ...o[time], [step]: o[time][step] === id ? null : id } }));

  return (
    <section className="vm-routine" id="routine">
      <div className="vm-wrap">
        <div className="vm-sec-head">
          <div>
            <p className="vm-kicker" data-reveal>
              Routine builder
            </p>
            <h2 className="vm-h2" data-reveal>
              Four steps. <em>Morning and night.</em>
            </h2>
          </div>
          <div className="vm-seg" role="tablist" aria-label="Time of day" data-reveal>
            {(['am', 'pm'] as const).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={time === t} className={time === t ? 'is-on' : ''} onClick={() => setTime(t)}>
                {t === 'am' ? (
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
                  </svg>
                )}
                {t === 'am' ? 'Morning' : 'Evening'}
              </button>
            ))}
          </div>
        </div>

        <div className="vm-routine-grid">
          <ol className="vm-steps">
            {STEPS.map(([s, label, hint], i) => {
              const opts = P.filter((p) => p.step === s && p.times.includes(time));
              return (
                <li key={s} className="vm-step" data-reveal style={{ '--d': `${i * 80}ms` } as CSSProperties}>
                  <div className="vm-step-head">
                    <span className="vm-step-n">0{i + 1}</span>
                    <div>
                      <h3>{label}</h3>
                      <p>{hint}</p>
                    </div>
                  </div>
                  <div className="vm-opts">
                    {opts.map((p) => {
                      const on = cur[s] === p.id;
                      return (
                        <button key={p.id} type="button" className={`vm-opt ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => pick(s, p.id)}>
                          <span className="vm-opt-art">
                            <ProductArt p={p} uid={`vm-o-${time}-${p.id}`} />
                          </span>
                          <span className="vm-opt-txt">
                            <b>{p.name}</b>
                            <span>{p.kind}</span>
                          </span>
                          <span className="vm-opt-price">{eur(p.price)}</span>
                          <span className="vm-check" aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ol>

          <aside className="vm-summary" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
            <div className="vm-shelf" data-time={time}>
              <div className="vm-shelf-sky" aria-hidden />
              <div className="vm-slots">
                {STEPS.map(([s, label]) => {
                  const id = cur[s];
                  return (
                    <div key={s} className={`vm-slot ${id ? 'is-full' : ''}`}>
                      {id ? (
                        <div key={`${time}-${id}`} className="vm-slot-art">
                          <ProductArt p={byId(id)} uid={`vm-sl-${time}-${id}`} />
                        </div>
                      ) : (
                        <div className="vm-slot-empty">{label}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="vm-shelf-ledge" aria-hidden />
            </div>
            <div className="vm-summary-body">
              <p className="vm-kicker">Your {time === 'am' ? 'morning' : 'evening'} ritual</p>
              <ul className="vm-sum-list">
                {STEPS.map(([s, label]) => {
                  const id = cur[s];
                  return (
                    <li key={s}>
                      <span>{label}</span>
                      <b>{id ? byId(id).name : '—'}</b>
                      <i>{id ? eur(byId(id).price) : ''}</i>
                    </li>
                  );
                })}
              </ul>
              <div className="vm-sum-total">
                <span>
                  {chosen.length} step{chosen.length === 1 ? '' : 's'} · about {chosen.length * 1.5} min
                </span>
                <b>{eur(total)}</b>
              </div>
              <button type="button" className="vm-btn vm-btn--olive vm-btn--block" disabled={!chosen.length} onClick={() => onAddMany(chosen)}>
                Add routine to bag
              </button>
              <p className="vm-fine">Tip: switch on subscribe & save in your bag for 15% off every refill.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Swatch({ t }: { t: (typeof TEXTURES)[number] }) {
  const id = `vm-sw-${t.id}`;
  return (
    <svg viewBox="0 0 400 260" className="vm-swatch" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.a} />
          <stop offset="1" stopColor={t.b} />
        </linearGradient>
        <filter id={`${id}f`} x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <path d="M30 170C80 120 200 96 300 100c50 2 80 20 72 40s-52 18-112 20c-80 4-170 36-220 36-16 0-18-16-10-26z" fill="#000" opacity=".28" filter={`url(#${id}f)`} transform="translate(8 16)" />
      <path d="M30 170C80 120 200 96 300 100c50 2 80 20 72 40s-52 18-112 20c-80 4-170 36-220 36-16 0-18-16-10-26z" fill={`url(#${id})`} />
      <path d="M70 158c50-36 140-50 220-48s64 10 70 22" stroke="#fff" strokeWidth="8" strokeLinecap="round" fill="none" opacity=".5" />
      <path d="M110 176c50-12 110-16 160-14" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".3" />
      {t.id === 'gel' &&
        [
          [150, 160, 6],
          [210, 136, 4],
          [262, 146, 7],
          [318, 124, 3],
          [96, 180, 3.5],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="none" stroke="#fff" strokeOpacity=".8" />
            <circle cx={x - r / 3} cy={y - r / 3} r={r / 4} fill="#fff" />
          </g>
        ))}
      {t.id === 'cream' && (
        <g transform="translate(20 34)">
          <path d="M196 80c10-26 22-40 30-44 2 14 10 30 30 44z" fill={t.a} />
          <path d="M214 70c6-14 10-22 12-26" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      )}
      {t.id === 'oil' &&
        [
          [320, 60, 1],
          [350, 34, 0.7],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0-22C8-8 14 0 14 8a14 14 0 0 1-28 0c0-8 6-16 14-30z" fill={t.b} />
            <ellipse cx="-5" cy="4" rx="3" ry="6" fill="#fff" opacity=".6" />
          </g>
        ))}
      {t.id === 'serum' && <ellipse cx="300" cy="124" rx="34" ry="8" fill="#fff" opacity=".35" />}
    </svg>
  );
}

function Texture() {
  const [i, setI] = useState(2);
  const t = TEXTURES[i];
  return (
    <section className="vm-texture" id="texture">
      <div className="vm-wrap vm-texture-grid">
        <div>
          <p className="vm-kicker vm-kicker--light" data-reveal>
            Texture & feel
          </p>
          <h2 className="vm-h2" data-reveal>
            Made to be <em>felt,</em> not just applied.
          </h2>
          <p className="vm-body" data-reveal>
            We test every texture for weeks before we test it in a lab. Choose one and feel it with your eyes first.
          </p>
          <div className="vm-tex-tabs" role="tablist" aria-label="Textures" data-reveal>
            {TEXTURES.map((x, n) => (
              <button key={x.id} type="button" role="tab" aria-selected={i === n} className={i === n ? 'is-on' : ''} onClick={() => setI(n)}>
                <span style={{ background: `linear-gradient(135deg, ${x.a}, ${x.b})` }} aria-hidden />
                {x.name}
              </button>
            ))}
          </div>
          <dl className="vm-tex-specs" key={t.id}>
            {[
              ['Feel', t.feel],
              ['Finish', t.finish],
              ['Absorbs', t.absorbs],
              ['Scent', t.scent],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="vm-tex-stage" data-reveal>
          <div className="vm-tex-disc" aria-hidden />
          <div key={t.id} className="vm-tex-swatch">
            <Swatch t={t} />
          </div>
          <p className="vm-tex-note" key={`n-${t.id}`}>
            <em>{byId(t.product).name}</em> — {t.note}
          </p>
        </div>
      </div>
    </section>
  );
}

function Ingredients({ onAdd }: { onAdd: (id: string) => void }) {
  const [sel, setSel] = useState('nia');
  const ing = INGREDIENTS.find((x) => x.id === sel)!;
  const [ringRef, seen] = useInView<HTMLDivElement>(0.4);
  const C = 2 * Math.PI * 52;
  const frac = Math.min(1, ing.pct / 20);
  return (
    <section className="vm-ingr" id="ingredients">
      <div className="vm-wrap">
        <div className="vm-sec-head vm-sec-head--center">
          <p className="vm-kicker" data-reveal>
            Ingredient explorer
          </p>
          <h2 className="vm-h2" data-reveal>
            Every ingredient, <em>out in the open.</em>
          </h2>
        </div>
        <div className="vm-chips" role="tablist" aria-label="Ingredients" data-reveal>
          {INGREDIENTS.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={sel === x.id} className={sel === x.id ? 'is-on' : ''} onClick={() => setSel(x.id)}>
              <span style={{ background: x.hue }} aria-hidden />
              {x.name}
            </button>
          ))}
        </div>
        <div className="vm-ingr-card" data-reveal ref={ringRef}>
          <div className="vm-ingr-visual" style={{ '--hue': ing.hue } as CSSProperties}>
            <svg viewBox="0 0 140 140" className="vm-ring" aria-hidden>
              <circle cx="70" cy="70" r="52" className="vm-ring-track" />
              <circle
                key={ing.id}
                cx="70"
                cy="70"
                r="52"
                className="vm-ring-bar"
                style={{ strokeDasharray: C, strokeDashoffset: seen ? C * (1 - frac) : C, stroke: ing.hue } as CSSProperties}
              />
            </svg>
            <div className="vm-ring-val">
              <b>{ing.pct}%</b>
              <span>concentration</span>
            </div>
          </div>
          <div className="vm-ingr-info" key={ing.id}>
            <h3>{ing.name}</h3>
            <p className="vm-inci">INCI · {ing.inci}</p>
            <p className="vm-ingr-benefit">{ing.benefit}</p>
            <dl className="vm-ingr-dl">
              <div>
                <dt>Origin</dt>
                <dd>{ing.origin}</dd>
              </div>
              <div>
                <dt>Found in</dt>
                <dd className="vm-found">
                  {ing.products.map((id) => {
                    const p = byId(id);
                    return (
                      <button key={id} type="button" onClick={() => onAdd(id)} aria-label={`Add ${p.name} to bag`}>
                        <span className="vm-found-art">
                          <ProductArt p={p} uid={`vm-f-${ing.id}-${id}`} />
                        </span>
                        <span>
                          <b>{p.name}</b>
                          <i>{eur(p.price)} · Add +</i>
                        </span>
                      </button>
                    );
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const dist = [82, 13, 3, 1, 1];
  return (
    <section className="vm-reviews" id="reviews">
      <div className="vm-wrap">
        <div className="vm-rev-top">
          <div data-reveal>
            <p className="vm-kicker">Reviews</p>
            <h2 className="vm-h2">
              Skin, <em>in its own words.</em>
            </h2>
          </div>
          <div className="vm-rev-score" data-reveal style={{ '--d': '100ms' } as CSSProperties}>
            <b>4.8</b>
            <div>
              <Stars r={4.8} size={16} />
              <p>from 12,400 reviews</p>
            </div>
            <ul aria-label="Rating distribution">
              {dist.map((v, i) => (
                <li key={i}>
                  <span>{5 - i}</span>
                  <i style={{ '--w': `${v}%` } as CSSProperties} />
                  <em>{v}%</em>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="vm-rev-grid">
          {REVIEWS.map((r, i) => (
            <figure key={r.who} className="vm-rev" data-reveal style={{ '--d': `${i * 110}ms` } as CSSProperties}>
              <Stars r={r.r} />
              <blockquote>“{r.q}”</blockquote>
              <figcaption>
                <span className="vm-avatar" aria-hidden>
                  {r.who[0]}
                </span>
                <span>
                  <b>{r.who}</b>
                  <i>
                    {r.skin} · on {r.product}
                  </i>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="vm-fine vm-center">Reviews are fictional — Velmira is a design showcase.</p>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="vm-faq" id="faq">
      <div className="vm-wrap vm-faq-grid">
        <div>
          <p className="vm-kicker" data-reveal>
            Questions
          </p>
          <h2 className="vm-h2" data-reveal>
            Good to <em>know.</em>
          </h2>
          <p className="vm-body" data-reveal>
            Still unsure what suits your skin? Our skin advisers reply within a day, seven days a week.
          </p>
        </div>
        <div className="vm-acc">
          {FAQ.map(([q, a], n) => (
            <div key={q} className={`vm-acc-item ${open === n ? 'is-open' : ''}`} data-reveal style={{ '--d': `${n * 60}ms` } as CSSProperties}>
              <button type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                {q}
                <span aria-hidden />
              </button>
              <div className="vm-acc-body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter({ notify }: { notify: (m: string) => void }) {
  const [email, setEmail] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify('Please enter a valid email address.');
      return;
    }
    setEmail('');
    notify('Welcome to the Velmira letter. (Design showcase — nothing was sent.)');
  };
  return (
    <section className="vm-news" id="news">
      <div className="vm-wrap">
        <div className="vm-news-card" data-reveal>
          <svg viewBox="0 0 600 300" className="vm-news-art" aria-hidden preserveAspectRatio="xMidYMid slice">
            <circle cx="520" cy="60" r="120" fill="#F3DCD4" opacity=".55" />
            <circle cx="70" cy="280" r="110" fill="#E8DCC8" opacity=".6" />
            <path d="M470 300C468 230 500 170 560 120" stroke="#3E4A2F" strokeWidth="1.6" fill="none" opacity=".35" />
            {[
              [480, 250, -55],
              [494, 210, 40],
              [514, 176, -50],
              [538, 146, 35],
            ].map(([x, y, r], i) => (
              <ellipse key={i} cx={x} cy={y} rx="20" ry="6" transform={`rotate(${r} ${x} ${y})`} fill="#3E4A2F" opacity=".3" />
            ))}
          </svg>
          <div className="vm-news-prods" aria-hidden>
            <ProductArt p={byId('renew')} uid="vm-n-renew" />
            <ProductArt p={byId('cloud')} uid="vm-n-cloud" />
          </div>
          <div className="vm-news-in">
            <p className="vm-kicker">The Velmira letter</p>
            <h2 className="vm-h2">
              Slow notes on <em>skin.</em>
            </h2>
            <p className="vm-body">One letter a month: ingredient deep-dives, seasonal routines and early access to new formulas. 10% off your first order.</p>
            <form className="vm-form" onSubmit={submit} noValidate>
              <label className="vm-sr" htmlFor="vm-email">
                Email address
              </label>
              <input id="vm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" autoComplete="email" />
              <button type="submit" className="vm-btn vm-btn--olive">
                Subscribe
              </button>
            </form>
            <p className="vm-fine">No spam. Unsubscribe in one click.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ['Shop', ['Cleansers', 'Serums', 'Moisturisers', 'Sun care', 'Refills']],
    ['Learn', ['Ingredient glossary', 'Routine guide', 'Our standards', 'Journal']],
    ['Help', ['Shipping & returns', 'Subscriptions', 'Contact', 'Privacy']],
  ];
  return (
    <footer className="vm-footer">
      <div className="vm-wrap">
        <div className="vm-footer-grid">
          <div>
            <Wordmark className="vm-wordmark--xl" />
            <p className="vm-fine">Clean skincare, formulated in Budapest.</p>
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
        <div className="vm-footer-base">
          <span>© {new Date().getFullYear()} Velmira</span>
          <span>Velmira is a fictional brand — a landing page concept by David Mészáros.</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- bag drawer ---------------- */

function Bag({
  open,
  lines,
  onClose,
  setQty,
  onCheckout,
}: {
  open: boolean;
  lines: Record<string, number>;
  onClose: () => void;
  setQty: (id: string, q: number) => void;
  onCheckout: () => void;
}) {
  const [sub, setSub] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const ids = Object.keys(lines).filter((id) => lines[id] > 0);
  const subtotal = ids.reduce((t, id) => t + byId(id).price * lines[id], 0);
  const discount = sub ? subtotal * 0.15 : 0;
  const after = subtotal - discount;
  const ship = !ids.length || after >= SHIP_FREE ? 0 : 4.9;
  const progress = Math.min(1, after / SHIP_FREE);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);

  return (
    <>
      <div className={`vm-scrim ${open ? 'is-on' : ''}`} onClick={onClose} aria-hidden />
      <aside className={`vm-drawer ${open ? 'is-on' : ''}`} role="dialog" aria-modal="true" aria-label="Your bag" aria-hidden={!open} inert={!open}>
        <div className="vm-drawer-head">
          <h2>
            Your bag <span>{ids.reduce((t, id) => t + lines[id], 0)}</span>
          </h2>
          <button type="button" ref={closeRef} className="vm-drawer-x" onClick={onClose} aria-label="Close bag">
            ×
          </button>
        </div>
        <div className="vm-ship">
          <p>{after >= SHIP_FREE ? 'You have unlocked free shipping.' : `You are ${eur(Math.ceil((SHIP_FREE - after) * 100) / 100)} away from free shipping.`}</p>
          <div className="vm-ship-bar">
            <i style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
        <div className="vm-lines">
          {!ids.length && (
            <div className="vm-empty">
              <p>Your bag is resting.</p>
              <span>Add a formula or a whole routine to begin.</span>
            </div>
          )}
          {ids.map((id) => {
            const p = byId(id);
            return (
              <div key={id} className="vm-line">
                <span className="vm-line-art">
                  <ProductArt p={p} uid={`vm-b-${id}`} />
                </span>
                <div className="vm-line-mid">
                  <b>{p.name}</b>
                  <span>
                    {p.kind} · {p.size}
                  </span>
                  <div className="vm-qty">
                    <button type="button" onClick={() => setQty(id, lines[id] - 1)} aria-label={`Fewer ${p.name}`}>
                      −
                    </button>
                    <output aria-live="polite">{lines[id]}</output>
                    <button type="button" onClick={() => setQty(id, lines[id] + 1)} aria-label={`More ${p.name}`}>
                      +
                    </button>
                  </div>
                </div>
                <div className="vm-line-price">
                  {sub && <s>{eur(p.price * lines[id])}</s>}
                  <b>{eur(p.price * lines[id] * (sub ? 0.85 : 1))}</b>
                  <button type="button" onClick={() => setQty(id, 0)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="vm-drawer-foot">
          <label className="vm-subtoggle">
            <input type="checkbox" checked={sub} onChange={(e) => setSub(e.target.checked)} />
            <span className="vm-switch" aria-hidden />
            <span>
              <b>Subscribe & save 15%</b>
              <i>Delivered every 8 weeks · skip or pause any time</i>
            </span>
          </label>
          <dl className="vm-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{eur(subtotal)}</dd>
            </div>
            {sub && (
              <div className="vm-save">
                <dt>Subscribe & save</dt>
                <dd>−{eur(Math.round(discount * 100) / 100)}</dd>
              </div>
            )}
            <div>
              <dt>Shipping</dt>
              <dd>{ship ? eur(ship) : ids.length ? 'Free' : '—'}</dd>
            </div>
            <div className="vm-grand">
              <dt>Total</dt>
              <dd>{eur(Math.round((after + ship) * 100) / 100)}</dd>
            </div>
          </dl>
          <button type="button" className="vm-btn vm-btn--olive vm-btn--block" disabled={!ids.length} onClick={onCheckout}>
            Checkout <span aria-hidden>→</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ---------------- page ---------------- */

export default function Velmira() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [toast, notify] = useToast();
  const [lines, setLines] = useState<Record<string, number>>({});
  const [bagOpen, setBagOpen] = useState(false);
  const count = Object.values(lines).reduce((a, b) => a + b, 0);

  const add = (id: string) => {
    setLines((l) => ({ ...l, [id]: (l[id] || 0) + 1 }));
    notify(`${byId(id).name} added to your bag.`);
  };
  const addMany = (ids: string[]) => {
    setLines((l) => {
      const n = { ...l };
      ids.forEach((id) => (n[id] = (n[id] || 0) + 1));
      return n;
    });
    setBagOpen(true);
  };
  const setQty = (id: string, q: number) => setLines((l) => ({ ...l, [id]: Math.max(0, Math.min(9, q)) }));
  const closeBag = useRef(() => setBagOpen(false)).current;

  return (
    <div ref={root} className="velmira">
      <Nav count={count} onBag={() => setBagOpen(true)} />
      <Hero onAdd={add} />
      <section className="vm-press" aria-label="As seen in">
        <p className="vm-press-label">As seen in</p>
        <Marquee>
          {PRESS.map((p, i) => (
            <span key={p} className={`vm-press-item vm-press-item--${i % 3}`}>
              {p}
            </span>
          ))}
        </Marquee>
      </section>
      <Pillars />
      <BestSellers onAdd={add} />
      <Routine onAddMany={addMany} />
      <Texture />
      <Ingredients onAdd={add} />
      <Reviews />
      <Faq />
      <Newsletter notify={notify} />
      <Footer />
      <Bag
        open={bagOpen}
        lines={lines}
        onClose={closeBag}
        setQty={setQty}
        onCheckout={() => {
          setBagOpen(false);
          setLines({});
          notify('Thank you — this is a design showcase, so no order was placed.');
        }}
      />
      <div className={`vm-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
