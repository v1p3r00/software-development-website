import { useCallback, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, KeyboardEvent, MouseEvent as RMouseEvent, PointerEvent as RPointerEvent, ReactNode } from 'react';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import './porcelia.css';
import { jump, reducedMotion, useCountUp, useInView, useReveal, useScrolledPast, useToast } from '../kit';
import { AppIcons, AppSheet, AppTabBar, SwipeDots, useLandingPhone } from '../appKit';

/**
 * Porcelia Klinika — a fictional premium dental & aesthetic clinic in Budapest.
 * Porcelain light page, mint accent, deep teal ink: clinical luxury that calms rather than sells.
 */

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
const ft = (n: number) => `${Math.round(n).toLocaleString('hu-HU')} Ft`;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });

/* ------------------------------------------------------------------ data */

type TreatId = 'implant' | 'veneer' | 'white' | 'aligner' | 'crown' | 'hygiene';
type Treat = { id: TreatId; name: string; unit: string; min: number; max: number; cap: number; blurb: string; time: string };

const TREATS: Treat[] = [
  { id: 'implant', name: 'Implantátum', unit: 'db', min: 390000, max: 520000, cap: 8, time: '2 alkalom + gyógyulás', blurb: 'Titán gyökér és cirkónium korona — úgy rág és úgy néz ki, mint a saját foga.' },
  { id: 'veneer', name: 'Porcelán héj', unit: 'fog', min: 145000, max: 190000, cap: 10, time: '2–3 alkalom, 7 nap', blurb: '0,4 mm vékony, kézzel rétegzett kerámia: forma, szín és harmónia, minimális csiszolással.' },
  { id: 'white', name: 'Fogfehérítés', unit: 'alkalom', min: 79000, max: 99000, cap: 2, time: '90 perc', blurb: 'Rendelői, kíméletes fehérítés hideg fénnyel — akár 6–8 árnyalatnyi különbség.' },
  { id: 'aligner', name: 'Láthatatlan sín', unit: 'kezelés', min: 890000, max: 1290000, cap: 1, time: '6–14 hónap', blurb: 'Átlátszó, kivehető sínek, digitálisan megtervezett lépésekkel. Senki sem veszi észre.' },
  { id: 'crown', name: 'Cirkónium korona', unit: 'db', min: 135000, max: 165000, cap: 8, time: '2 alkalom', blurb: 'Fémmentes, természetesen áttetsző korona, amely évtizedekig megtartja a színét.' },
  { id: 'hygiene', name: 'Dentálhigiénia', unit: 'alkalom', min: 22000, max: 28000, cap: 4, time: '60 perc', blurb: 'Fogkő-eltávolítás, airflow polírozás és személyre szabott otthoni rutin.' },
];

// invented publications and awards (checked to be generic, not real outlets)
const PRESS = ['Medora Szemle', 'VELANTIS REVIEW', 'Fehérkő Díj 2025', 'Lumina Egészségkalauz', 'ORVENTA', 'Dunaparti Életmód', 'Kalmia Design Award'];

const DOCTORS = [
  { mono: 'HE', name: 'Dr. Halmos Eszter', role: 'Esztétikai fogorvos, alapító', note: '19 év, több mint 3 000 porcelán héj', hue: 'a' },
  { mono: 'TB', name: 'Dr. Ternai Bence', role: 'Szájsebész, implantológus', note: 'Vezető implantológus, oktató', hue: 'b' },
  { mono: 'VL', name: 'Dr. Vadkerti Lilla', role: 'Fogszabályozó szakorvos', note: 'Láthatatlan sínes kezelések', hue: 'c' },
  { mono: 'KD', name: 'Kőrösi Dóra', role: 'Dentálhigiénikus', note: 'Szorongásmentes ellátás', hue: 'd' },
];

const PRICES: Array<[string, Array<[string, string, string]>]> = [
  [
    'Első lépések',
    [
      ['Konzultáció és 3D szkennelés', 'digitális mosolyterv-előnézettel', 'díjtalan'],
      ['Panoráma röntgen', 'alacsony dózisú', '9 900 Ft'],
      ['CBCT 3D felvétel', 'implantációs tervezéshez', '29 000 Ft'],
    ],
  ],
  [
    'Esztétika',
    [
      ['Porcelán héj (préskerámia)', 'fogankénti ár', '145 000 Ft-tól'],
      ['Rendelői fogfehérítés', 'otthoni utókezelő készlettel', '79 000 Ft'],
      ['Esztétikai tömés', 'kompozit, rétegzett', '32 000 Ft-tól'],
    ],
  ],
  [
    'Pótlás és szabályozás',
    [
      ['Implantátum koronával', 'életre szóló implantátumgarancia', '390 000 Ft-tól'],
      ['Cirkónium korona', 'fémmentes', '135 000 Ft'],
      ['Láthatatlan sínes fogszabályozás', 'teljes kezelés, minden sínnel', '890 000 Ft-tól'],
    ],
  ],
  ['Megelőzés', [['Dentálhigiénia', 'airflow polírozással', '22 000 Ft']]],
];

const QUOTES = [
  { q: 'Húsz évig kerültem a fogorvost. Itt végig elmagyarázták, mi történik, és a képernyőn előre megmutatták, milyen lesz a mosolyom. Most a fotókon is mosolygok.', who: 'Anna, 41', what: 'Porcelán héj, 8 fog' },
  { q: 'Az implantátum beültetése kevésbé volt kellemetlen, mint egy fogkőleszedés máshol. A pontos árat már az első napon írásban megkaptam.', who: 'Gábor, 56', what: 'Implantátum' },
  { q: 'Tárgyalásokra járok, nem akartam fémet a számba. A sínt senki sem vette észre, kilenc hónap múlva pedig egyenes lett minden.', who: 'Réka, 33', what: 'Láthatatlan sín' },
];

const FAQ = [
  ['Fájdalmas a kezelés?', 'Számítógép-vezérelt, szinte érezhetetlen érzéstelenítést használunk, és kérésre szedációs lehetőséget is kínálunk. Minden lépés előtt elmondjuk, mit fog érezni — és bármikor szólhat, ha szünetet szeretne.'],
  ['Mennyire pontos a kalkulátor becslése?', 'A kalkulátor a leggyakoribb esetek árait mutatja sávosan. A végleges, írásos árajánlatot a díjtalan konzultáción, a 3D szkennelés és a röntgen alapján kapja meg — ez a kezelés végéig nem változik.'],
  ['Hogyan működik a 0%-os részletfizetés?', 'A 150 000 Ft feletti kezeléseknél a teljes összeget 12 egyenlő havi részletben fizetheti, kamat és kezelési költség nélkül. Az igénylés a konzultáción tíz perc.'],
  ['Mennyi ideig tart egy porcelán héj?', 'Megfelelő szájhigiénia mellett 15–20 évig is. A préskerámia nem színeződik el, és mi 5 év garanciát vállalunk rá.'],
  ['Milyen garanciát vállalnak?', 'Implantátumra élethosszig tartó gyártói és 10 év klinikai garanciát, koronákra és héjakra 5 évet adunk, évenkénti kontroll mellett.'],
  ['Hol tudok parkolni?', 'A klinika épületének mélygarázsában vendégeinknek két órán át díjtalanul biztosítunk helyet; a metró három perc sétára van.'],
];

/* ------------------------------------------------------------- the smile */

// one side of the arch, from the centre outwards: [width, height]
const SMILE_ARCH: Array<[number, number]> = [
  [44, 70],
  [34, 61],
  [31, 58],
  [27, 49],
  [24, 42],
  [21, 36],
];
// before: small, believable flaws per tooth (rotation°, height change, shift)
const FLAW_L: Array<[number, number, number]> = [[-3, -2, 0], [5, -6, 2], [-4, 3, -1], [2, -3, 0], [0, 0, 0], [0, 0, 0]];
const FLAW_R: Array<[number, number, number]> = [[2, 1, 0], [-4, -4, -2], [3, -2, 0], [-2, 2, 0], [0, 0, 0], [0, 0, 0]];

type ToothBox = { x: number; w: number; top: number; h: number; side: number; i: number };
function archTeeth(): ToothBox[] {
  const out: ToothBox[] = [];
  for (const side of [-1, 1]) {
    let edge = 300 + side * 1.5;
    SMILE_ARCH.forEach(([w, h], i) => {
      const x = side < 0 ? edge - w : edge;
      const dx = Math.abs(x + w / 2 - 300);
      // gum line rises gently towards the corners of the smile
      const top = 166 + 0.00042 * dx * dx;
      out.push({ x, w, top, h: h - 0.0006 * dx * dx, side, i });
      edge += side * (w + 3);
    });
  }
  return out;
}
const TEETH = archTeeth();

/** a tooth crown: straight sides, softly rounded incisal edge */
const crown = (x: number, w: number, top: number, h: number) => {
  const r = w * 0.42;
  const b = top + h;
  return `M${x} ${top}V${b - r}C${x} ${b - r * 0.25} ${x + r * 0.45} ${b} ${x + w / 2} ${b}C${x + w - r * 0.45} ${b} ${x + w} ${b - r * 0.25} ${x + w} ${b - r}V${top}Z`;
};

/** a lower tooth: rounded edge on top */
const lowCrown = (x: number, w: number, top: number, bottom: number) => {
  const r = w * 0.4;
  return `M${x} ${bottom}V${top + r}C${x} ${top + r * 0.25} ${x + r * 0.45} ${top} ${x + w / 2} ${top}C${x + w - r * 0.45} ${top} ${x + w} ${top + r * 0.25} ${x + w} ${top + r}V${bottom}Z`;
};

const MOUTH = 'M128 196C210 160 390 160 472 196C424 290 176 290 128 196Z';

function Smile({ after }: { after: boolean }) {
  const p = after ? 'pa' : 'pb';
  return (
    <svg viewBox="0 0 600 400" className="pc-smile" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="45%" r="70%">
          <stop offset="0" stopColor={after ? '#F4EEE8' : '#EFE8E1'} />
          <stop offset=".7" stopColor={after ? '#E9DDD2' : '#E4D8CD'} />
          <stop offset="1" stopColor={after ? '#DCCABC' : '#D7C6B8'} />
        </radialGradient>
        <linearGradient id={`${p}-t`} x1="0" y1="0" x2="0" y2="1">
          {after ? (
            <>
              <stop offset="0" stopColor="#F3F6F5" />
              <stop offset=".45" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#E9F0EF" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#E2D4B3" />
              <stop offset=".45" stopColor="#EEE3C8" />
              <stop offset="1" stopColor="#DCCBA4" />
            </>
          )}
        </linearGradient>
        <linearGradient id={`${p}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".1" />
          <stop offset=".25" stopColor="#000" stopOpacity="0" />
          <stop offset=".75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".1" />
        </linearGradient>
        <linearGradient id={`${p}-gum`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9868C" />
          <stop offset="1" stopColor="#E9A7A9" />
        </linearGradient>
        <linearGradient id={`${p}-lip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C97D80" />
          <stop offset="1" stopColor="#B4666C" />
        </linearGradient>
        <linearGradient id={`${p}-lip2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B9686E" />
          <stop offset=".5" stopColor="#D08C8E" />
          <stop offset="1" stopColor="#C07578" />
        </linearGradient>
        <clipPath id={`${p}-m`}>
          <path d={MOUTH} />
        </clipPath>
      </defs>
      <rect width="600" height="400" fill={`url(#${p}-bg)`} />
      <ellipse cx="300" cy="226" rx="250" ry="150" fill="#fff" opacity=".18" />

      <g clipPath={`url(#${p}-m)`}>
        {/* the mouth, kept warm rather than black */}
        <rect x="120" y="150" width="360" height="150" fill="#8C4651" />
        <path d="M120 150H480V188C420 174 180 174 120 188Z" fill={`url(#${p}-gum)`} />
        {/* lower teeth, mostly hidden */}
        {[-3, -2, -1, 0, 1, 2].map((n) => (
          <path key={n} d={lowCrown(300 + n * 25 + 1.5, 22, 250 + Math.abs(n + 0.5) * 2, 300)} fill={`url(#${p}-t)`} opacity=".85" />
        ))}
        {TEETH.map((t) => {
          const flaw = after ? [0, 0, 0] : (t.side < 0 ? FLAW_L : FLAW_R)[t.i];
          const d = crown(t.x + flaw[2], t.w, t.top - 4, t.h + flaw[1]);
          return (
            <g key={`${t.side}${t.i}`} transform={`rotate(${flaw[0]} ${t.x + t.w / 2} ${t.top})`}>
              <path d={d} fill={`url(#${p}-t)`} />
              <path d={d} fill={`url(#${p}-side)`} />
            </g>
          );
        })}
        {after && (
          <g fill="#fff" opacity=".85">
            <rect x="268" y="180" width="5" height="34" rx="2.5" />
            <rect x="314" y="180" width="5" height="34" rx="2.5" />
            <rect x="234" y="184" width="3.5" height="22" rx="1.75" opacity=".7" />
            <rect x="358" y="184" width="3.5" height="22" rx="1.75" opacity=".7" />
          </g>
        )}
        {/* soft shadow under the upper lip and in the corners */}
        <path d="M128 196C210 160 390 160 472 196C390 178 210 178 128 196Z" fill="#5a2a32" opacity=".28" />
        <ellipse cx="138" cy="206" rx="34" ry="30" fill="#5a2a32" opacity=".35" />
        <ellipse cx="462" cy="206" rx="34" ry="30" fill="#5a2a32" opacity=".35" />
      </g>

      {/* lips */}
      <path d="M128 196C210 160 390 160 472 196C436 160 372 132 330 138Q300 150 270 138C228 132 164 160 128 196Z" fill={`url(#${p}-lip)`} />
      <path d="M128 196C176 290 424 290 472 196C446 318 154 318 128 196Z" fill={`url(#${p}-lip2)`} />
      <path d="M232 296C268 306 332 306 368 296" stroke="#fff" strokeOpacity=".35" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M246 146C266 141 286 143 296 149" stroke="#fff" strokeOpacity=".25" strokeWidth="3" fill="none" strokeLinecap="round" />
      {after && (
        <g className="pc-sparkle" fill="#fff">
          <path d="M356 170l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        </g>
      )}
    </svg>
  );
}

function SmileSlider() {
  const [pos, setPos] = useState(52);
  const [touched, setTouched] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const fromX = (x: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(clamp(((x - r.left) / r.width) * 100, 3, 97));
    setTouched(true);
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    drag.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    fromX(e.clientX);
  };
  const key = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 4;
    const map: Record<string, number> = { ArrowLeft: pos - step, ArrowRight: pos + step, Home: 3, End: 97, PageDown: pos - 20, PageUp: pos + 20 };
    if (e.key in map) {
      e.preventDefault();
      setPos(clamp(map[e.key], 3, 97));
      setTouched(true);
    }
  };
  return (
    <div
      ref={box}
      className={`pc-ba ${touched ? 'is-touched' : ''}`}
      style={{ '--pos': `${pos}%` } as CSSProperties}
      onPointerDown={down}
      onPointerMove={(e) => drag.current && fromX(e.clientX)}
      onPointerUp={() => (drag.current = false)}
      onPointerCancel={() => (drag.current = false)}
    >
      <div className="pc-ba-layer">
        <Smile after={false} />
      </div>
      <div className="pc-ba-layer pc-ba-after">
        <Smile after />
      </div>
      <span className="pc-ba-tag pc-ba-tag--l">Előtte</span>
      <span className="pc-ba-tag pc-ba-tag--r">Utána</span>
      <div className="pc-ba-line" aria-hidden />
      <button
        type="button"
        className="pc-ba-knob"
        role="slider"
        aria-label="Előtte–utána összehasonlítás"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(100 - pos)}% utána látható`}
        onKeyDown={key}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M9 6l-5 6 5 6M15 6l5 6-5 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- pieces */

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`pc-wordmark ${className}`}>
      <svg viewBox="0 0 32 32" className="pc-logo" aria-hidden>
        <path d="M8 6c-3 0-5 3-4.6 7.2.4 4 1.6 6.4 2.4 10.4C6.4 27 7.4 28 8.6 28c1.6 0 2-2.4 2.6-5 .6-2.4 1.2-4 2.8-4s2.2 1.6 2.8 4c.6 2.6 1 5 2.6 5 1.2 0 2.2-1 2.8-4.4.8-4 2-6.4 2.4-10.4C25 9 23 6 20 6c-2.2 0-3.2 1.4-6 1.4S10.2 6 8 6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M24 3.5l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9z" fill="var(--mint)" />
      </svg>
      Porcelia<span className="pc-wm-sub">Klinika</span>
    </span>
  );
}

const ICONS: Record<TreatId, ReactNode> = {
  implant: (
    <>
      <path d="M14 6c-4 0-6 3-5.4 7 .4 3 2 4.6 2.4 6h18c.4-1.4 2-3 2.4-6C32 9 30 6 26 6c-2.4 0-3.4 1.4-6 1.4S16.4 6 14 6z" />
      <path d="M13 23h14M14 27h12M15 31h10M16.5 35h7" />
    </>
  ),
  veneer: (
    <>
      <path d="M13 6h14c2 0 3 1.4 3 3.4v14C30 31 26 35 20 35s-10-4-10-11.6v-14C10 7.4 11 6 13 6z" />
      <path d="M15 10c-.6 6 0 14 3 20" opacity=".5" />
    </>
  ),
  white: (
    <>
      <path d="M14 10c-4 0-6 3-5.4 7.2.5 3.6 1.4 6 2 9.6.5 3 1.4 4.2 2.6 4.2 1.6 0 2-2.2 2.6-4.6.6-2.2 1.2-3.6 2.8-3.6" />
      <path d="M29 4l1.4 3.6L34 9l-3.6 1.4L29 14l-1.4-3.6L24 9l3.6-1.4z" />
      <path d="M33 20l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  aligner: (
    <>
      <path d="M6 28C6 14 12 7 20 7s14 7 14 21" />
      <path d="M11 28c0-10 4-15.5 9-15.5S29 18 29 28" opacity=".55" />
      <path d="M4 31h32" />
    </>
  ),
  crown: (
    <>
      <path d="M9 16l4-8 7 5 7-5 4 8" />
      <path d="M9 16c0 8 2 12 4 18h14c2-6 4-10 4-18" />
    </>
  ),
  hygiene: (
    <>
      <path d="M20 5c5 7 9 12 9 17a9 9 0 0 1-18 0c0-5 4-10 9-17z" />
      <path d="M16 23a4 4 0 0 0 4 4" />
    </>
  ),
};

function Icon({ id }: { id: TreatId }) {
  return (
    <svg viewBox="0 0 40 40" className="pc-icon" aria-hidden>
      {ICONS[id]}
    </svg>
  );
}

function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="pc-marquee" aria-hidden>
      <div className="pc-marquee-track">
        {children}
        {children}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- sections */

/** click handler for every "book" link: scrolls to the booking card, or opens the booking sheet on phones */
type BookLink = (e: RMouseEvent) => void;

function Nav({ onBook }: { onBook: BookLink }) {
  const solid = useScrolledPast(30);
  return (
    <nav className={`pc-nav ${solid ? 'is-solid' : ''}`} aria-label="Porcelia Klinika">
      <div className="pc-wrap pc-nav-in">
        <a href="#top" onClick={jump('top')} aria-label="Porcelia Klinika — vissza az elejére">
          <Wordmark />
        </a>
        <div className="pc-nav-links">
          {[
            ['kezelesek', 'Kezelések'],
            ['kalkulator', 'Árkalkulátor'],
            ['technologia', 'Technológia'],
            ['orvosaink', 'Orvosaink'],
            ['gyik', 'GYIK'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {label}
            </a>
          ))}
        </div>
        <a href="#foglalas" onClick={onBook} className="pc-btn pc-btn--sm pc-btn--teal">
          Időpontfoglalás
        </a>
      </div>
    </nav>
  );
}

function Hero({ onBook }: { onBook: BookLink }) {
  return (
    <header className="pc-hero" id="top">
      <div className="pc-hero-bg" aria-hidden>
        <span className="pc-orb pc-orb--a" />
        <span className="pc-orb pc-orb--b" />
        <svg viewBox="0 0 800 800" className="pc-rings">
          {[120, 200, 280, 360].map((r) => (
            <circle key={r} cx="400" cy="400" r={r} />
          ))}
        </svg>
      </div>
      <div className="pc-wrap pc-hero-grid">
        <div className="pc-hero-copy">
          <p className="pc-pill" data-reveal>
            <span className="pc-live" /> Budapest, V. kerület · új páciensek fogadása
          </p>
          <h1 className="pc-h1" data-reveal style={d(80)}>
            A mosoly, amit <em>mindig is</em> szeretett volna.
          </h1>
          <p className="pc-lead" data-reveal style={d(180)}>
            Esztétikai fogászat porcelánpontossággal és nyugodt tempóban. Digitálisan megtervezzük az új mosolyát, előre
            megmutatjuk — és csak akkor kezdünk bele, amikor Ön is biztos benne.
          </p>
          <div className="pc-cta-row" data-reveal style={d(260)}>
            <a href="#foglalas" onClick={onBook} className="pc-btn pc-btn--teal">
              Díjtalan konzultáció <span aria-hidden>→</span>
            </a>
            <a href="#kalkulator" onClick={jump('kalkulator')} className="pc-btn pc-btn--ghost">
              Árkalkulátor
            </a>
          </div>
          <ul className="pc-hero-ticks" data-reveal style={d(340)}>
            <li>Fix, írásos árajánlat</li>
            <li>0% részletfizetés 12 hónapra</li>
            <li>5 év garancia</li>
          </ul>
        </div>

        <div className="pc-hero-stage" data-reveal style={d(160)}>
          <div className="pc-frame">
            <SmileSlider />
            <div className="pc-frame-foot">
              <span>Digitális mosolyterv · 8 porcelán héj</span>
              <span className="pc-frame-hint">Húzza a csúszkát</span>
            </div>
          </div>
          <div className="pc-chip pc-chip--a">
            <span className="pc-chip-ico" aria-hidden>
              ★
            </span>
            <div>
              <b>4,9 / 5</b>
              <small>2 400+ páciens értékelése</small>
            </div>
          </div>
          <div className="pc-chip pc-chip--b">
            <span className="pc-chip-shade" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <div>
              <b>A3 → BL2</b>
              <small>árnyalat, természetes áttetszőséggel</small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Stat({ to, dec = 0, suffix, label, run }: { to: number; dec?: number; suffix: string; label: string; run: boolean }) {
  const v = useCountUp(to, run, 1800);
  return (
    <div className="pc-stat">
      <dd>
        {v.toLocaleString('hu-HU', { minimumFractionDigits: dec, maximumFractionDigits: dec })}
        <span>{suffix}</span>
      </dd>
      <dt>{label}</dt>
    </div>
  );
}

function Trust() {
  const [ref, seen] = useInView<HTMLDListElement>(0.35);
  return (
    <section className="pc-trust" aria-label="Számokban">
      <div className="pc-wrap">
        <dl className="pc-stats" ref={ref}>
          <Stat to={19} suffix=" év" label="esztétikai fogászati tapasztalat" run={seen} />
          <Stat to={12400} suffix="+" label="elvégzett kezelés" run={seen} />
          <Stat to={98} suffix="%" label="ajánlana minket barátainak" run={seen} />
          <Stat to={4.9} dec={1} suffix=" ★" label="átlagos értékelés" run={seen} />
        </dl>
      </div>
      <p className="pc-press-label">Rólunk írták · díjaink</p>
      <Marquee>
        {PRESS.map((p, i) => (
          <span key={p} className={`pc-press-item pc-press-item--${i % 3}`}>
            {p}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

function Pillars() {
  const row = useRef<HTMLDivElement>(null);
  const items = [
    ['Nyugalom', 'Csendes kezelők, takaró, zajszűrős fejhallgató és szinte érezhetetlen, számítógép-vezérelt érzéstelenítés. Annyi idő, amennyire szüksége van.'],
    ['Átláthatóság', 'A konzultáció végén írásos, tételes árajánlatot kap, amely a kezelés végéig nem változik. Rejtett költség nincs, meglepetés sincs.'],
    ['Precizitás', '3D szkenner, digitális mosolytervezés és saját labor: a héjak mikronos pontossággal illeszkednek, és Ön előre látja az eredményt.'],
  ];
  return (
    <section className="pc-pillars">
      <div className="pc-wrap">
        <p className="pc-kicker" data-reveal>
          A Porcelia-módszer
        </p>
        <h2 className="pc-h2 pc-h2--narrow" data-reveal>
          Fogászat, amelytől nem kell tartani. <em>Csak várni rá.</em>
        </h2>
        <div className="pc-pillars-grid lp-swipe" ref={row}>
          {items.map(([h, p], i) => (
            <article key={h} className="pc-pillar" data-reveal style={d(i * 120)}>
              <span className="pc-num">0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <SwipeDots row={row} count={items.length} />
      </div>
    </section>
  );
}

function Treatments({ onAdd }: { onAdd: (id: TreatId) => void }) {
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="pc-treat" id="kezelesek">
      <div className="pc-wrap">
        <div className="pc-head-row">
          <div>
            <p className="pc-kicker" data-reveal>
              Kezeléseink
            </p>
            <h2 className="pc-h2" data-reveal>
              Minden, ami egy <em>őszinte mosolyhoz</em> kell.
            </h2>
          </div>
          <p className="pc-body" data-reveal style={d(100)}>
            Egy helyen, egy csapattal: az első szkenneléstől a végleges héjig. Válasszon kezelést, és tegye a kalkulátorba
            egy kattintással.
          </p>
        </div>
        <div className="pc-treat-grid lp-swipe" ref={row}>
          {TREATS.map((t, i) => (
            <article key={t.id} className="pc-tcard" data-reveal style={d((i % 3) * 90)}>
              <div className="pc-tcard-top">
                <Icon id={t.id} />
                <span className="pc-tcard-time">{t.time}</span>
              </div>
              <h3>{t.name}</h3>
              <p>{t.blurb}</p>
              <div className="pc-tcard-foot">
                <span>
                  <small>Ár</small>
                  {ft(t.min)}-tól
                </span>
                <button type="button" className="pc-add" onClick={() => onAdd(t.id)} aria-label={`${t.name} hozzáadása a kalkulátorhoz`}>
                  <span aria-hidden>+</span>
                </button>
              </div>
            </article>
          ))}
        </div>
        <SwipeDots row={row} count={TREATS.length} />
      </div>
    </section>
  );
}

function Estimator({ qty, setQty, onBook }: { qty: Record<TreatId, number>; setQty: (id: TreatId, n: number) => void; onBook: (id: TreatId | '') => void }) {
  const [instal, setInstal] = useState(true);
  const chosen = TREATS.filter((t) => qty[t.id] > 0);
  const lo = chosen.reduce((s, t) => s + t.min * qty[t.id], 0);
  const hi = chosen.reduce((s, t) => s + t.max * qty[t.id], 0);
  const mid = (lo + hi) / 2;
  const top = chosen.slice().sort((a, b) => b.max * qty[b.id] - a.max * qty[a.id])[0];
  const phone = useLandingPhone();
  return (
    <section className="pc-est" id="kalkulator">
      <div className="pc-wrap">
        <p className="pc-kicker pc-center" data-reveal>
          Árkalkulátor
        </p>
        <h2 className="pc-h2 pc-h2--center" data-reveal>
          Tudja, mire számíthat — <em>még az első találkozás előtt.</em>
        </h2>
        <div className="pc-est-grid">
          {/* a plain grid item on desktop; on phones it bounds the sticky running total */}
          <div className="pc-est-col">
            {phone && (
              <div className="pc-est-dock" aria-live="polite">
                <div>
                  <small>Becsült költség</small>
                  <b>{chosen.length ? `${ft(lo).replace(' Ft', '')} – ${ft(hi)}` : 'Válasszon kezelést'}</b>
                  {instal && mid >= 150000 && <small>vagy havonta {ft(lo / 12)}-tól, 0% THM</small>}
                </div>
                <button type="button" className="pc-btn pc-btn--teal pc-btn--sm" onClick={() => onBook(top ? top.id : '')}>
                  Foglalok
                </button>
              </div>
            )}
            <ul className="pc-est-list" data-reveal>
              {TREATS.map((t) => {
                const n = qty[t.id];
                return (
                  <li key={t.id} className={n ? 'is-on' : ''}>
                    <Icon id={t.id} />
                    <div className="pc-est-name">
                      <b>{t.name}</b>
                      <small>
                        {ft(t.min)} – {ft(t.max)} / {t.unit}
                      </small>
                    </div>
                    <div className="pc-step" role="group" aria-label={`${t.name} mennyiség`}>
                      <button type="button" onClick={() => setQty(t.id, n - 1)} disabled={n === 0} aria-label="Kevesebb">
                        −
                      </button>
                      <output aria-live="polite">{n}</output>
                      <button type="button" onClick={() => setQty(t.id, n + 1)} disabled={n >= t.cap} aria-label="Több">
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="pc-est-card" data-reveal style={d(120)}>
            <div className="pc-est-glow" aria-hidden />
            <p className="pc-est-label">Becsült teljes költség</p>
            {chosen.length ? (
              <p className="pc-est-range" aria-live="polite">
                {ft(lo).replace(' Ft', '')}
                <span> – </span>
                {ft(hi)}
              </p>
            ) : (
              <p className="pc-est-range pc-est-range--empty">Válasszon kezelést</p>
            )}
            <div className="pc-est-bar" aria-hidden>
              {chosen.map((t) => (
                <i key={t.id} data-t={t.id} style={{ flexGrow: ((t.min + t.max) / 2) * qty[t.id] }} />
              ))}
            </div>
            <ul className="pc-est-lines">
              {chosen.map((t) => (
                <li key={t.id}>
                  <span>
                    <i data-t={t.id} /> {t.name} × {qty[t.id]}
                  </span>
                  <span>{ft(((t.min + t.max) / 2) * qty[t.id])}</span>
                </li>
              ))}
            </ul>
            <label className="pc-switch">
              <input type="checkbox" checked={instal} onChange={(e) => setInstal(e.target.checked)} />
              <span className="pc-switch-ui" aria-hidden />
              <span>0% THM részletfizetés, 12 hónap</span>
            </label>
            {instal && mid >= 150000 && (
              <div className="pc-est-month">
                <span>Havi részlet, 12 hónapon át</span>
                <b>
                  {ft(lo / 12).replace(' Ft', '')} – {ft(hi / 12)}
                </b>
              </div>
            )}
            {instal && chosen.length > 0 && mid < 150000 && <p className="pc-est-note">Részletfizetés 150 000 Ft feletti kezelésnél vehető igénybe.</p>}
            <button type="button" className="pc-btn pc-btn--mint pc-btn--block" onClick={() => onBook(top ? top.id : '')}>
              Ezzel a tervvel foglalok <span aria-hidden>→</span>
            </button>
            <p className="pc-fine">Tájékoztató jellegű becslés. A végleges árat a díjtalan konzultáción, írásban kapja meg.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* dental arch seen from above, drawn along an ellipse */
const ARCH = Array.from({ length: 14 }, (_, i) => {
  const a = ((172 + (i * 196) / 13) * Math.PI) / 180;
  const x = 200 + 128 * Math.cos(a);
  const y = 262 + 200 * Math.sin(a);
  const edge = Math.abs(i - 6.5) / 6.5; // 0 front, 1 back
  const w = 22 + edge * 16;
  const h = 26 + edge * 12;
  const rot = (Math.atan2(200 * Math.cos(a), -128 * Math.sin(a)) * 180) / Math.PI;
  return { x, y, w, h, rot };
});

function TechVisual({ tab }: { tab: number }) {
  return (
    <svg viewBox="0 0 400 320" className="pc-tech-svg" data-tab={tab} aria-hidden>
      <defs>
        <linearGradient id="pc-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FD3C7" stopOpacity="0" />
          <stop offset=".85" stopColor="#9FD3C7" stopOpacity=".55" />
          <stop offset="1" stopColor="#E9FFF8" stopOpacity=".95" />
        </linearGradient>
        <clipPath id="pc-arch-clip">
          <rect x="40" y="40" width="320" height="250" />
        </clipPath>
      </defs>
      <g className="pc-grid-lines">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 40}H400`} />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 40} 0V320`} />
        ))}
      </g>
      <g className="pc-arch">
        {ARCH.map((t, i) => (
          <g key={i} transform={`translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) rotate(${t.rot.toFixed(1)})`}>
            <rect x={-t.w / 2} y={-t.h / 2} width={t.w} height={t.h} rx={Math.min(t.w, t.h) / 2.4} />
            {t.w > 30 && <path d={`M${-t.w / 4} 0H${t.w / 4}M0 ${-t.h / 4}V${t.h / 4}`} className="pc-arch-fiss" />}
          </g>
        ))}
      </g>
      <g className="pc-tl pc-tl--0" clipPath="url(#pc-arch-clip)">
        <rect className="pc-scanband" x="40" y="-40" width="320" height="70" fill="url(#pc-scan)" />
        {ARCH.filter((_, i) => i % 2 === 0).map((t, i) => (
          <circle key={i} cx={t.x} cy={t.y} r="2.4" className="pc-scan-dot" />
        ))}
      </g>
      <g className="pc-tl pc-tl--1">
        <path d="M200 22V300" className="pc-guide pc-guide--mid" />
        <path d="M92 156C126 36 274 36 308 156" className="pc-guide" />
        {[140, 172, 228, 260].map((x) => (
          <path key={x} d={`M${x} 34V118`} className="pc-guide" />
        ))}
        <text x="206" y="30">középvonal</text>
        <text x="266" y="46">1,618 arány</text>
      </g>
      <g className="pc-tl pc-tl--2" transform="translate(-100 -50)">
        <rect x="226" y="140" width="148" height="148" rx="18" className="pc-lab-card" />
        <path d="M268 190c-8 0-12 6-11 14 1 7 3 12 4 20 1 6 3 9 5 9 3 0 4-5 5-10 1-4 2-7 5-7h12c3 0 4 3 5 7 1 5 2 10 5 10 2 0 4-3 5-9 1-8 3-13 4-20 1-8-3-14-11-14-4 0-6 3-12 3s-8-3-12-3z" className="pc-lab-crown" transform="translate(19 2) scale(1)" />
        <path d="M256 258H344M256 254V262M344 254V262" className="pc-guide" />
        <text x="300" y="276" textAnchor="middle">0,4 mm</text>
        <text x="300" y="166" textAnchor="middle">préskerámia · A1</text>
      </g>
    </svg>
  );
}

function Technology() {
  const [tab, setTab] = useState(0);
  const items = [
    ['Intraorális 3D szkenner', 'Nincs több kellemetlen lenyomatanyag. Négy perc alatt, 20 mikronos pontossággal rögzítjük a fogsorát, és a képernyőn azonnal együtt nézzük meg.', '4 perc', 'teljes fogsor'],
    ['Digitális mosolytervezés', 'Arcarányai, ajkai és mosolyvonala alapján tervezzük meg az új fogakat. Próbamosolyként a szájában is kipróbálhatja, mielőtt bármi végleges lenne.', '1:1', 'próbamosoly'],
    ['Saját digitális labor', 'A héjakat és koronákat a klinika saját laborjában marjuk és kézzel rétegezzük. Így egy héten belül elkészül, és a fogtechnikus a próbán is ott van.', '7 nap', 'héjtól a mosolyig'],
  ];
  return (
    <section className="pc-tech" id="technologia">
      <div className="pc-wrap pc-tech-grid">
        <div>
          <p className="pc-kicker pc-kicker--mint" data-reveal>
            Technológia
          </p>
          <h2 className="pc-h2" data-reveal>
            Előbb a képernyőn. <em>Aztán a tükörben.</em>
          </h2>
          <div className="pc-tabs" role="tablist" aria-label="Technológiáink" data-reveal>
            {items.map(([h, p, big, small], i) => (
              <button key={h} type="button" role="tab" aria-selected={tab === i} className={`pc-tab ${tab === i ? 'is-on' : ''}`} onClick={() => setTab(i)}>
                <span className="pc-tab-head">
                  <span className="pc-tab-n">0{i + 1}</span>
                  {h}
                </span>
                <span className="pc-tab-body">
                  <span>
                    {p}
                    <span className="pc-tab-stat">
                      <b>{big}</b> {small}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="pc-tech-stage" data-reveal style={d(120)}>
          <div className="pc-tech-screen">
            <div className="pc-tech-bar">
              <i />
              <i />
              <i />
              <span>{['szkennelés · élő', 'mosolyterv v3', 'labor · préskerámia'][tab]}</span>
            </div>
            <TechVisual tab={tab} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Portrait({ mono, hue }: { mono: string; hue: string }) {
  return (
    <svg viewBox="0 0 240 300" className="pc-portrait" data-hue={hue} aria-hidden>
      <defs>
        <linearGradient id={`pc-pg-${hue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="pc-pg-a" />
          <stop offset="1" className="pc-pg-b" />
        </linearGradient>
      </defs>
      <path d="M0 120a120 120 0 0 1 240 0V300H0z" fill={`url(#pc-pg-${hue})`} />
      <circle cx="120" cy="120" r="92" className="pc-p-ring" />
      <text x="120" y="150" textAnchor="middle" className="pc-p-mono">
        {mono}
      </text>
      <rect x="108" y="196" width="24" height="40" rx="10" className="pc-p-head" />
      <path d="M30 300c6-48 40-72 90-72s84 24 90 72z" className="pc-p-bust" />
      <ellipse cx="120" cy="180" rx="30" ry="34" className="pc-p-head" />
      <path d="M100 229l20 22 20-22" className="pc-p-collar" />
      <path d="M58 272v28M182 272v28" className="pc-p-seam" />
    </svg>
  );
}

function Doctors() {
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="pc-docs" id="orvosaink">
      <div className="pc-wrap">
        <div className="pc-head-row">
          <div>
            <p className="pc-kicker" data-reveal>
              Orvosaink
            </p>
            <h2 className="pc-h2" data-reveal>
              Kevés kéz, <em>sok figyelem.</em>
            </h2>
          </div>
          <p className="pc-body" data-reveal style={d(100)}>
            Kis csapatban dolgozunk, hogy minden páciens ugyanazzal az orvossal találkozzon a kezelés elejétől a végéig.
          </p>
        </div>
        <div className="pc-docs-grid lp-swipe" ref={row}>
          {DOCTORS.map((doc, i) => (
            <article key={doc.name} className="pc-doc" data-reveal style={d(i * 90)}>
              <Portrait mono={doc.mono} hue={doc.hue} />
              <h3>{doc.name}</h3>
              <p className="pc-doc-role">{doc.role}</p>
              <p className="pc-doc-note">{doc.note}</p>
            </article>
          ))}
        </div>
        <SwipeDots row={row} count={DOCTORS.length} />
      </div>
    </section>
  );
}

function PriceList() {
  return (
    <section className="pc-prices" id="arlista">
      <div className="pc-wrap pc-prices-grid">
        <div className="pc-prices-intro">
          <p className="pc-kicker" data-reveal>
            Árlista
          </p>
          <h2 className="pc-h2" data-reveal>
            Egyértelmű árak, <em>apró betű nélkül.</em>
          </h2>
          <p className="pc-body" data-reveal>
            Az árak az anyagköltséget, a labormunkát és a kontrollokat is tartalmazzák. Érvényes: 2026. január 1-jétől.
          </p>
        </div>
        <div className="pc-table-wrap" data-reveal style={d(100)}>
          <table className="pc-table">
            {PRICES.map(([group, rows]) => (
              <tbody key={group}>
                <tr className="pc-table-group">
                  <th colSpan={2} scope="colgroup">
                    {group}
                  </th>
                </tr>
                {rows.map(([n, note, price]) => (
                  <tr key={n}>
                    <th scope="row">
                      {n}
                      <small>{note}</small>
                    </th>
                    <td className={price === 'díjtalan' ? 'is-free' : ''}>{price}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </section>
  );
}

const BOOK_OPTS: Array<{ id: TreatId | 'consult'; name: string; note: string }> = [
  { id: 'consult', name: 'Konzultáció + 3D szkennelés', note: '45 perc · díjtalan' },
  { id: 'veneer', name: 'Porcelán héj', note: 'mosolytervezéssel' },
  { id: 'implant', name: 'Implantátum', note: 'CBCT-vel' },
  { id: 'white', name: 'Fogfehérítés', note: '90 perc' },
  { id: 'aligner', name: 'Láthatatlan sín', note: 'szkenneléssel' },
  { id: 'hygiene', name: 'Dentálhigiénia', note: '60 perc' },
];
const WD = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
const SLOTS = ['8:30', '9:30', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];

type BookProps = { pick: string; setPick: (s: string) => void; notify: (m: string) => void };

/** the three-step booking card: inline in the booking section on larger screens, inside the booking sheet on phones */
function BookingCard({ pick, setPick, notify, inSheet = false }: BookProps & { inSheet?: boolean }) {
  const [step, setStep] = useState(0);
  const [day, setDay] = useState(-1);
  const [slot, setSlot] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '', ok: false });
  const [done, setDone] = useState(false);
  const days = useMemo(() => {
    const out: Date[] = [];
    const t = new Date();
    for (let i = 1; out.length < 10; i++) {
      const x = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
      if (x.getDay() !== 0) out.push(x);
    }
    return out;
  }, []);
  const opt = BOOK_OPTS.find((o) => o.id === pick);
  const dateLabel = day >= 0 ? days[day].toLocaleDateString('hu-HU', { month: 'long', day: 'numeric', weekday: 'long' }) : '';

  const next = () => {
    if (step === 0 && !opt) return notify('Kérjük, válasszon kezelést.');
    if (step === 1 && (day < 0 || !slot)) return notify('Kérjük, válasszon napot és időpontot.');
    setStep(step + 1);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 3) return notify('Kérjük, adja meg a teljes nevét.');
    if (form.phone.replace(/\D/g, '').length < 9) return notify('Kérjük, adjon meg egy érvényes telefonszámot.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return notify('Kérjük, adjon meg egy érvényes e-mail-címet.');
    if (!form.ok) return notify('Kérjük, fogadja el az adatkezelési tájékoztatót.');
    setDone(true);
    notify(`Köszönjük, ${form.name.trim()}! Ez egy designbemutató — foglalás nem történt.`);
  };
  const reset = () => {
    setDone(false);
    setStep(0);
    setDay(-1);
    setSlot('');
    setForm({ name: '', phone: '', email: '', note: '', ok: false });
  };
  const field = (k: 'name' | 'phone' | 'email' | 'note') => ({
    value: form[k],
    onChange: (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <div className={`pc-book-card${inSheet ? ' pc-book-card--sheet' : ''}`} {...(inSheet ? {} : { 'data-reveal': '', style: d(100) })}>
      <ol className="pc-progress" aria-label="Foglalás lépései">
        {['Kezelés', 'Időpont', 'Adatok'].map((s, i) => (
          <li key={s} className={`${i === step && !done ? 'is-now' : ''} ${i < step || done ? 'is-done' : ''}`} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step || done ? '✓' : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="pc-progress-bar" aria-hidden>
        <i style={{ transform: `scaleX(${done ? 1 : (step + 1) / 3})` }} />
      </div>

      {done ? (
        <div className="pc-book-done">
          <svg viewBox="0 0 64 64" className="pc-done-ico" aria-hidden>
            <circle cx="32" cy="32" r="29" />
            <path d="M20 33l8 8 16-17" />
          </svg>
          <h3>Időpontját rögzítettük</h3>
          <p>
            {opt?.name} · {dateLabel}, {slot}
          </p>
          <p className="pc-fine">Designbemutató: adatai nem kerültek elküldésre.</p>
          <button type="button" className="pc-btn pc-btn--ghost" onClick={reset}>
            Új foglalás
          </button>
        </div>
      ) : (
        <div className="pc-book-body" key={step}>
          {step === 0 && (
            <div className="pc-opts" role="radiogroup" aria-label="Kezelés">
              {BOOK_OPTS.map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={pick === o.id} className={`pc-opt ${pick === o.id ? 'is-on' : ''}`} onClick={() => setPick(o.id)}>
                  <b>{o.name}</b>
                  <small>{o.note}</small>
                </button>
              ))}
            </div>
          )}
          {step === 1 && (
            <>
              <p className="pc-book-label">Nap</p>
              <div className="pc-days" role="radiogroup" aria-label="Nap">
                {days.map((x, i) => (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={day === i}
                    className={`pc-day ${day === i ? 'is-on' : ''}`}
                    onClick={() => {
                      setDay(i);
                      setSlot('');
                    }}
                  >
                    <small>{WD[x.getDay()]}</small>
                    <b>{x.getDate()}</b>
                    <small>{x.toLocaleDateString('hu-HU', { month: 'short' })}</small>
                  </button>
                ))}
              </div>
              <p className="pc-book-label">Időpont {day >= 0 && <span>· {dateLabel}</span>}</p>
              <div className="pc-slots" role="radiogroup" aria-label="Időpont">
                {SLOTS.map((s, i) => {
                  const sat = day >= 0 && days[day].getDay() === 6;
                  const off = day < 0 || (day * 3 + i) % 5 === 0 || (sat && i > 3);
                  return (
                    <button key={s} type="button" role="radio" aria-checked={slot === s} disabled={off} className={`pc-slot ${slot === s ? 'is-on' : ''}`} onClick={() => setSlot(s)}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {step === 2 && (
            <form id="pc-book-form" className="pc-form" onSubmit={submit} noValidate>
              <p className="pc-summary">
                <b>{opt?.name}</b> · {dateLabel}, {slot}
              </p>
              <label>
                <span>Teljes név</span>
                <input {...field('name')} autoComplete="name" placeholder="Kovács Júlia" />
              </label>
              <div className="pc-form-row">
                <label>
                  <span>Telefonszám</span>
                  <input {...field('phone')} type="tel" autoComplete="tel" placeholder="+36 30 123 4567" />
                </label>
                <label>
                  <span>E-mail-cím</span>
                  <input {...field('email')} type="email" autoComplete="email" placeholder="julia@email.hu" />
                </label>
              </div>
              <label>
                <span>Megjegyzés (nem kötelező)</span>
                <textarea {...field('note')} rows={2} placeholder="Pl. szeretném, ha lassan haladnánk." />
              </label>
              <label className="pc-check">
                <input type="checkbox" checked={form.ok} onChange={(e) => setForm({ ...form, ok: e.target.checked })} />
                <span>Elfogadom az adatkezelési tájékoztatót.</span>
              </label>
            </form>
          )}
        </div>
      )}

      {!done && (
        <div className="pc-book-nav">
          {step > 0 ? (
            <button type="button" className="pc-btn pc-btn--ghost pc-btn--sm" onClick={() => setStep(step - 1)}>
              ← Vissza
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button type="button" className="pc-btn pc-btn--teal pc-btn--sm" onClick={next}>
              Tovább →
            </button>
          ) : (
            <button type="submit" form="pc-book-form" className="pc-btn pc-btn--teal pc-btn--sm">
              Foglalás véglegesítése
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Booking({ onOpen, ...props }: BookProps & { onOpen: () => void }) {
  const phone = useLandingPhone();
  return (
    <section className="pc-book" id="foglalas">
      <div className="pc-wrap pc-book-grid">
        <div className="pc-book-intro">
          <p className="pc-kicker" data-reveal>
            Időpontfoglalás
          </p>
          <h2 className="pc-h2" data-reveal>
            Három lépés, <em>két perc.</em>
          </h2>
          <p className="pc-body" data-reveal>
            Az első konzultáció és a 3D szkennelés díjtalan. Foglalása után munkatársunk 24 órán belül felhívja, hogy
            mindent pontosítson.
          </p>
          <ul className="pc-book-facts" data-reveal>
            <li>
              <b>H–P</b> 8:00–20:00 · <b>Szo</b> 9:00–14:00
            </li>
            <li>1054 Budapest, Porcelán köz 3.</li>
            <li>+36 1 555 0142</li>
          </ul>
        </div>

        {phone ? (
          // phones: a compact entry point; the full three-step card opens as a bottom sheet
          <div className="pc-book-launch">
            <ol>
              {['Kezelés', 'Időpont', 'Adatok'].map((x, n) => (
                <li key={x}>
                  <span>{n + 1}</span>
                  {x}
                </li>
              ))}
            </ol>
            <button type="button" className="pc-btn pc-btn--teal pc-btn--block" onClick={onOpen}>
              Időpontot foglalok <span aria-hidden>→</span>
            </button>
            <p className="pc-fine">Díjtalan konzultáció · visszahívás 24 órán belül</p>
          </div>
        ) : (
          <BookingCard {...props} />
        )}
      </div>
    </section>
  );
}

function Testimonials() {
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="pc-quotes">
      <div className="pc-wrap">
        <p className="pc-kicker pc-center" data-reveal>
          Pácienseink mondták
        </p>
        <h2 className="pc-h2 pc-h2--center" data-reveal>
          A legszebb visszajelzés <em>egy mosoly.</em>
        </h2>
        <div className="pc-quotes-grid lp-swipe" ref={row}>
          {QUOTES.map((q, i) => (
            <figure key={q.who} className="pc-quote" data-reveal style={d(i * 110)}>
              <div className="pc-stars" aria-label="5 csillag">
                ★★★★★
              </div>
              <blockquote>„{q.q}”</blockquote>
              <figcaption>
                <span className="pc-q-av" aria-hidden>
                  {q.who[0]}
                </span>
                <span>
                  <b>{q.who}</b>
                  <small>{q.what}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <SwipeDots row={row} count={QUOTES.length} />
        <p className="pc-fine pc-center">A vélemények kitaláltak — a Porcelia Klinika egy designbemutató.</p>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="pc-faq" id="gyik">
      <div className="pc-wrap pc-faq-grid">
        <div>
          <p className="pc-kicker" data-reveal>
            Gyakori kérdések
          </p>
          <h2 className="pc-h2" data-reveal>
            Kérdezzen bátran. <em>Mi is ezt tesszük.</em>
          </h2>
          <p className="pc-body" data-reveal>
            Nem találja a választ? Írjon nekünk, és egy fogorvos válaszol — nem chatbot.
          </p>
        </div>
        <div className="pc-acc">
          {FAQ.map(([q, a], n) => (
            <div key={q} className={`pc-acc-item ${open === n ? 'is-open' : ''}`} data-reveal style={d(n * 60)}>
              <button type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                {q}
                <span aria-hidden />
              </button>
              <div className="pc-acc-body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ onBook }: { onBook: BookLink }) {
  return (
    <section className="pc-final">
      <div className="pc-final-art" aria-hidden>
        <svg viewBox="0 0 600 300">
          <path d="M60 120C160 260 440 260 540 120" />
          <path d="M100 128C190 230 410 230 500 128" />
          <path d="M140 136C220 200 380 200 460 136" />
        </svg>
      </div>
      <div className="pc-wrap pc-final-in">
        <p className="pc-kicker pc-kicker--mint pc-center" data-reveal>
          Az első lépés díjtalan
        </p>
        <h2 className="pc-h1 pc-h1--mid" data-reveal>
          Nézze meg új mosolyát, <em>mielőtt döntene.</em>
        </h2>
        <p className="pc-lead pc-center" data-reveal>
          45 perces konzultáció, 3D szkennelés és digitális mosolyterv-előnézet — kötelezettség nélkül.
        </p>
        <div className="pc-cta-row pc-cta-row--center" data-reveal>
          <a href="#foglalas" onClick={onBook} className="pc-btn pc-btn--mint">
            Időpontot foglalok <span aria-hidden>→</span>
          </a>
          <a href="#kalkulator" onClick={jump('kalkulator')} className="pc-btn pc-btn--ghost-l">
            Árat számolok
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ['Kezelések', ['Porcelán héj', 'Implantátum', 'Fogfehérítés', 'Láthatatlan sín']],
    ['Klinika', ['Orvosaink', 'Technológia', 'Árlista', 'Karrier']],
    ['Kapcsolat', ['1054 Budapest, Porcelán köz 3.', '+36 1 555 0142', 'hello@porcelia.example', 'H–P 8–20 · Szo 9–14']],
  ];
  return (
    <footer className="pc-footer">
      <div className="pc-wrap">
        <div className="pc-footer-grid">
          <div>
            <Wordmark className="pc-wordmark--xl" />
            <p className="pc-fine">Esztétikai fogászat · Budapest</p>
          </div>
          {cols.map(([h, links]) => (
            <div key={h}>
              <h4>{h}</h4>
              <ul>
                {links.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pc-footer-base">
          <span>© {new Date().getFullYear()} Porcelia Klinika</span>
          <span>A Porcelia Klinika kitalált márka — David Mészáros landing page koncepciója. Nem valódi egészségügyi szolgáltató.</span>
        </div>
      </div>
    </footer>
  );
}

const START_QTY: Record<TreatId, number> = { implant: 0, veneer: 4, white: 1, aligner: 0, crown: 0, hygiene: 1 };

export default function Porcelia() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [toast, notify] = useToast(3600);
  const [qty, setQtyAll] = useState<Record<TreatId, number>>(START_QTY);
  const [pick, setPick] = useState('');
  const phone = useLandingPhone();
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => setSheet(false), []);
  const toBook = () => (phone ? setSheet(true) : go('foglalas'));
  const onBookLink: BookLink = (e) => {
    e.preventDefault();
    toBook();
  };
  const setQty = (id: TreatId, n: number) => {
    const t = TREATS.find((x) => x.id === id)!;
    setQtyAll((q) => ({ ...q, [id]: clamp(n, 0, t.cap) }));
  };
  const add = (id: TreatId) => {
    setQty(id, Math.max(1, qty[id] + 1));
    const t = TREATS.find((x) => x.id === id)!;
    notify(`${t.name} hozzáadva a kalkulátorhoz.`);
    go('kalkulator');
  };
  const book = (id: TreatId | '') => {
    const opt = BOOK_OPTS.find((o) => o.id === id);
    setPick(opt ? opt.id : 'consult');
    toBook();
  };
  return (
    <div ref={root} className="porcelia">
      <Nav onBook={onBookLink} />
      <Hero onBook={onBookLink} />
      <Trust />
      <Pillars />
      <Treatments onAdd={add} />
      <Estimator qty={qty} setQty={setQty} onBook={book} />
      <Technology />
      <Doctors />
      <PriceList />
      <Booking pick={pick} setPick={setPick} notify={notify} onOpen={() => setSheet(true)} />
      <Testimonials />
      <Faq />
      <FinalCta onBook={onBookLink} />
      <Footer />
      <div className={`pc-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
      {phone && (
        <AppSheet open={sheet} title="Időpontfoglalás" onClose={closeSheet} closeLabel="Bezárás">
          <BookingCard pick={pick} setPick={setPick} notify={notify} inSheet />
        </AppSheet>
      )}
      <AppTabBar
        tabs={[
          { id: 'top', label: 'Főoldal', icon: <AppIcons.home /> },
          { id: 'kezelesek', label: 'Kezelések', icon: <AppIcons.tooth /> },
          { id: 'kalkulator', label: 'Árak', icon: <AppIcons.sliders /> },
          { id: 'orvosaink', label: 'Orvosok', icon: <AppIcons.users /> },
        ]}
        action={{ label: 'Foglalás', icon: <AppIcons.calendar />, onClick: () => setSheet(true) }}
      />
    </div>
  );
}
