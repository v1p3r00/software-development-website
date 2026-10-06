import { useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import '@fontsource-variable/bodoni-moda/standard.css';
import '@fontsource-variable/bodoni-moda/standard-italic.css';
import './revhajlat.css';
import { jump, reducedMotion, useCountUp, useInView, useReveal, useScrolledPast, useToast } from '../kit';

/**
 * Révhajlat Rezidencia — a fictional riverside residence on the Danube in Budapest.
 * Landing page 04: graphite, brass and river mist; dusk light, an elevation you can read floor by floor.
 */

type View = 'Duna' | 'park';
type Status = 'szabad' | 'foglalt' | 'eladva';
type Unit = { id: string; floor: number; rooms: number; area: number; view: View; orient: string; price: number; status: Status };

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/* ---------- data: 33 residences on 9 floors ---------- */
const TPL: Array<[number, number, View, string]> = [
  [2, 58.4, 'Duna', 'Ny'],
  [3, 88.6, 'Duna', 'DNy'],
  [4, 117.2, 'park', 'DK'],
  [1, 42.8, 'park', 'K'],
];
const TPL8: typeof TPL = [
  [3, 96.4, 'Duna', 'Ny'],
  [5, 141.5, 'Duna', 'DNy'],
  [3, 101.8, 'park', 'K'],
];
const TPL9: typeof TPL = [
  [5, 196.3, 'Duna', 'Ny–D–K'],
  [4, 158.7, 'Duna', 'DNy–K'],
];
const STATUS = ['eesf', 'sfes', 'esse', 'sefs', 'fsse', 'sesf', 'essf', 'sef', 'fs'];
const ST: Record<string, Status> = { s: 'szabad', f: 'foglalt', e: 'eladva' };
const UNITS: Unit[] = [];
for (let f = 1; f <= 9; f++) {
  (f === 9 ? TPL9 : f === 8 ? TPL8 : TPL).forEach(([rooms, base, view, orient], i) => {
    const area = Math.round((base + (f % 3) * 0.3) * 10) / 10;
    const ppm = 1.92 + f * 0.085 + (view === 'Duna' ? 0.38 : 0) + (f === 9 ? 0.55 : 0);
    const status = ST[STATUS[f - 1][i]];
    UNITS.push({ id: `${f}.0${i + 1}`, floor: f, rooms, area, view, orient, price: Math.round(area * ppm * 10) * 1e5, status });
  });
}
const FLOORS = [9, 8, 7, 6, 5, 4, 3, 2, 1];
const ft = (n: number) => `${n.toLocaleString('hu-HU')} Ft`;
const m2 = (a: number) => `${a.toLocaleString('hu-HU', { maximumFractionDigits: 1 })} m²`;
const mft = (n: number) => `${(n / 1e6).toLocaleString('hu-HU', { maximumFractionDigits: 1 })} M Ft`;

/* ---------- facade geometry (local units) ---------- */
const BW = 360;
const GT = 450;
const FH = 50;
const ftop = (f: number) => GT - f * FH;
const fx = (f: number): [number, number] => (f === 9 ? [40, 330] : [0, BW]);
const lit = (f: number, i: number, salt: number) => ((f * 7 + i * 13 + salt * 5) * 2654435761) % 4294967296 % 7 < 2;

function FacadeDefs({ p }: { p: string }) {
  return (
    <>
      <linearGradient id={`${p}-glass`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a4b5a" />
        <stop offset=".55" stopColor="#2b2d36" />
        <stop offset="1" stopColor="#1d1f25" />
      </linearGradient>
      <linearGradient id={`${p}-warm`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6cf8e" />
        <stop offset="1" stopColor="#d58f4f" />
      </linearGradient>
      <linearGradient id={`${p}-brass`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e2c48c" />
        <stop offset=".5" stopColor="#b08d57" />
        <stop offset="1" stopColor="#6f5532" />
      </linearGradient>
      <linearGradient id={`${p}-lobby`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f0c487" />
        <stop offset="1" stopColor="#9a6438" />
      </linearGradient>
    </>
  );
}

/** the river elevation of the building, drawn in local units 360 × 514 */
function Facade({ p, lamps = false }: { p: string; lamps?: boolean }) {
  const parts: ReactNode[] = [];
  for (let f = 1; f <= 9; f++) {
    const [x0, x1] = fx(f);
    const y = ftop(f);
    const w = x1 - x0;
    const n = Math.round((w - 12) / 30);
    const pw = (w - 12) / n;
    parts.push(<rect key={`g${f}`} x={x0 + 6} y={y + 4} width={w - 12} height={FH - 9} fill={`url(#${p}-glass)`} />);
    for (let i = 0; i < n; i++) {
      if (!lit(f, i, lamps ? 3 : 0)) continue;
      parts.push(
        <rect
          key={`l${f}-${i}`}
          className={lamps ? 'rh-lamp' : undefined}
          style={lamps ? d(((f * 3 + i * 5) % 13) * 260 + 500) : undefined}
          x={x0 + 6 + i * pw + 1.2}
          y={y + 5}
          width={pw - 2.4}
          height={FH - 11}
          fill={`url(#${p}-warm)`}
          opacity={0.55 + ((f + i) % 3) * 0.15}
        />,
      );
    }
    const mull = Array.from({ length: n - 1 }, (_, i) => `M${(x0 + 6 + (i + 1) * pw).toFixed(1)} ${y + 4}v${FH - 9}`).join('');
    parts.push(<path key={`m${f}`} d={mull} stroke="#141519" strokeWidth="1.4" />);
    const off = 16 + ((f * 2) % 3) * 12;
    const fins = [];
    for (let x = x0 + off; x < x1 - 8; x += 48) fins.push(`M${x} ${y + 1}v${FH - 6}`);
    parts.push(<rect key={`b${f}`} x={x0 - 5} y={y + FH - 19} width={w + 10} height={13} fill="rgb(230 228 223 / 0.07)" stroke="rgb(230 228 223 / 0.3)" strokeWidth=".7" />);
    parts.push(<path key={`f${f}`} d={fins.join('')} stroke={`url(#${p}-brass)`} strokeWidth="3.2" />);
    parts.push(<rect key={`s${f}`} x={x0 - 7} y={y + FH - 5} width={w + 14} height={5} fill="#3b3c41" />);
    parts.push(<rect key={`e${f}`} x={x0 - 7} y={y + FH - 5} width={w + 14} height={0.9} fill="#c9a66c" opacity=".75" />);
  }
  return (
    <g id={`${p}-fac`}>
      <rect x="0" y="50" width={BW} height={GT + 64 - 50} fill="#26272c" />
      <rect x="40" y="0" width="290" height="50" fill="#26272c" />
      {parts}
      {/* lobby */}
      <rect x="4" y={GT + 2} width={BW - 8} height="62" fill={`url(#${p}-lobby)`} opacity=".9" />
      <path d={Array.from({ length: 6 }, (_, k) => `M${30 + k * 60} ${GT}v64`).join('')} stroke="#1c1d1f" strokeWidth="7" />
      <rect x="140" y={GT + 14} width="80" height="3" fill={`url(#${p}-brass)`} />
      <rect x="0" y={GT + 62} width={BW} height="3" fill="#0f1012" />
      {/* roof */}
      <rect x="34" y="-6" width="302" height="6" fill="#3b3c41" />
      <rect x="34" y="-6" width="302" height="1" fill="#d6b67f" />
      <path d="M0 36h40M330 36h30" stroke="rgb(230 228 223 / 0.35)" strokeWidth="1" />
      <circle cx="14" cy="40" r="7" fill="#1a1d1b" />
      <circle cx="346" cy="41" r="6" fill="#1a1d1b" />
    </g>
  );
}

/* ---------- small pieces ---------- */
function Wordmark({ big = false }: { big?: boolean }) {
  return (
    <span className={`rh-mark ${big ? 'rh-mark--big' : ''}`}>
      <span className="rh-mark-name">Révhajlat</span>
      <span className="rh-mark-sub">Rezidencia</span>
    </span>
  );
}

function StatusPill({ s }: { s: Status }) {
  return <span className={`rh-pill rh-pill--${s}`}>{s}</span>;
}

function Nav() {
  const solid = useScrolledPast(40);
  return (
    <nav className={`rh-nav ${solid ? 'is-solid' : ''}`} aria-label="Révhajlat Rezidencia">
      <div className="rh-wrap rh-nav-in">
        <a href="#top" onClick={jump('top')} aria-label="Révhajlat Rezidencia — az oldal teteje">
          <Wordmark />
        </a>
        <div className="rh-nav-links">
          {[
            ['epulet', 'Az épület'],
            ['kereso', 'Lakáskereső'],
            ['feny', 'Fény'],
            ['helyszin', 'Helyszín'],
            ['gyik', 'GYIK'],
          ].map(([id, l]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {l}
            </a>
          ))}
        </div>
        <a href="#bejaras" onClick={jump('bejaras')} className="rh-btn rh-btn--line rh-btn--sm">
          Bejárás foglalása
        </a>
      </div>
    </nav>
  );
}

/* ---------- hero ---------- */
function Hero() {
  const towns = useMemo(() => {
    const r: Array<[number, number, number]> = [];
    let x = 0;
    let s = 7;
    while (x < 960) {
      s = (s * 9301 + 49297) % 233280;
      const w = 14 + (s % 30);
      const h = 6 + ((s >> 3) % 26);
      r.push([x, w, h]);
      x += w + 2;
    }
    return r;
  }, []);
  return (
    <header className="rh-hero" id="top">
      <svg className="rh-hero-scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax meet" aria-hidden>
        <defs>
          <FacadeDefs p="rhh" />
          <radialGradient id="rhh-sun" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#ffd9a0" />
            <stop offset=".25" stopColor="#f2a866" stopOpacity=".85" />
            <stop offset="1" stopColor="#c8744a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rhh-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset=".7" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rhh-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".12" stopColor="#fff" />
          </linearGradient>
          <mask id="rhh-refl" maskUnits="userSpaceOnUse" x="0" y="700" width="1600" height="300">
            <rect x="0" y="700" width="1600" height="300" fill="url(#rhh-fade)" />
          </mask>
          <mask id="rhh-left" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1000">
            <rect width="1600" height="1000" fill="url(#rhh-edge)" />
          </mask>
        </defs>
        <circle cx="430" cy="676" r="230" fill="url(#rhh-sun)" opacity=".75" />
        <circle cx="430" cy="684" r="26" fill="#ffe2b0" />
        <g mask="url(#rhh-left)">
          <path d="M0 640 C 120 600 210 610 300 630 S 470 590 560 620 S 720 660 820 668 L 960 690 V 700 H 0 Z" fill="#2c2734" />
          <path d="M0 668 C 150 650 260 662 380 672 S 600 668 720 684 L 960 696 V 700 H 0 Z" fill="#221f29" />
          {towns.map(([x, w, h], i) => (
            <rect key={i} x={x} y={700 - h} width={w} height={h} fill="#1b1a20" />
          ))}
          {towns
            .filter((_, i) => i % 3 === 0)
            .map(([x, w, h], i) => (
              <rect key={`t${i}`} x={x + w / 3} y={700 - h + 4} width="2" height="2" fill="#f1c27e" opacity=".7" />
            ))}
          {/* distant bridge */}
          <path d="M60 700 V 646 M250 700 V 646 M60 652 Q 155 700 250 652 M250 652 Q 345 700 440 652 M440 700 V 646" stroke="#16151b" strokeWidth="3" fill="none" />
          <path d="M0 684 H 520" stroke="#16151b" strokeWidth="4" />
        </g>
        {/* sun on the water */}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={`sw${i}`} className="rh-glint" style={d(i * 340)} x={430 - (70 - i * 6)} y={712 + i * 22} width={(70 - i * 6) * 2} height="2.2" rx="1" fill="#f3b878" opacity={0.6 - i * 0.05} />
        ))}
        {/* far bank + embankment */}
        <rect x="900" y="692" width="700" height="8" fill="#232328" />
        <g transform="translate(1040 186)">
          <Facade p="rhh" lamps />
        </g>
        <g fill="#141615">
          <circle cx="1000" cy="672" r="26" />
          <circle cx="972" cy="684" r="18" />
          <circle cx="1430" cy="666" r="32" />
          <circle cx="1470" cy="680" r="22" />
          <circle cx="1530" cy="676" r="28" />
        </g>
        {[930, 1010, 1420, 1500, 1580].map((x) => (
          <circle key={x} cx={x} cy="688" r="2.2" fill="#ffd8a0" />
        ))}
        <g mask="url(#rhh-refl)">
          <use href="#rhh-fac" transform="translate(1040 1214) scale(1 -1)" />
        </g>
        <g className="rh-ripples" stroke="rgb(230 228 223 / 0.14)" strokeWidth="1">
          <path d="M1000 740h380M960 776h300M1080 810h340M990 860h420M1040 920h260" />
        </g>
      </svg>
      <div className="rh-hero-shade" aria-hidden />
      <div className="rh-wrap rh-hero-in">
        <p className="rh-kicker" data-reveal>
          Pesti Duna-part · Budapest · Átadás 2028 tavaszán
        </p>
        <h1 className="rh-h1" data-reveal style={d(90)}>
          Lakni a folyó <em>hajlatában.</em>
        </h1>
        <p className="rh-lead" data-reveal style={d(180)}>
          33 rezidencia kilenc szinten, mély erkélyekkel és bronz lamellákkal. Minden második ablakból a víz látszik — és
          minden este a budai hegyek mögött ér véget.
        </p>
        <div className="rh-cta-row" data-reveal style={d(260)}>
          <a href="#epulet" onClick={jump('epulet')} className="rh-btn rh-btn--brass">
            Válasszon emeletet <span aria-hidden>→</span>
          </a>
          <a href="#bejaras" onClick={jump('bejaras')} className="rh-btn rh-btn--ghost">
            Bejárás foglalása
          </a>
        </div>
      </div>
      <dl className="rh-wrap rh-hero-stats" data-reveal style={d(360)}>
        <div>
          <dt>Rezidencia</dt>
          <dd>33</dd>
        </div>
        <div>
          <dt>Alapterület</dt>
          <dd>42–197 m²</dd>
        </div>
        <div>
          <dt>Duna-part</dt>
          <dd>140 m</dd>
        </div>
        <div>
          <dt>Birtokbaadás</dt>
          <dd>2028 Q2</dd>
        </div>
      </dl>
    </header>
  );
}

function Marquee() {
  const items = [
    'Hídvégi & Kőrös Építészek',
    'Duna Design Díj 2026 — döntős',
    'Sóvár Építő',
    'A++ energetikai besorolás',
    'Szelvény Építészeti Szemle',
    'Révpart Ingatlanfejlesztő',
    'Független műszaki ellenőr: Alpár Mérnökiroda',
  ];
  const row = items.map((t) => (
    <span key={t} className="rh-mq-item">
      {t}
      <i aria-hidden>◆</i>
    </span>
  ));
  return (
    <section className="rh-mq" aria-label="Partnerek és elismerések">
      <div className="rh-mq-track">
        <div>{row}</div>
        <div aria-hidden>{row}</div>
      </div>
    </section>
  );
}

function Statement() {
  const words =
    'A folyó nem háttér. A homlokzatot úgy rajzoltuk meg, hogy minden szint a víz ritmusát kövesse: mély erkélyek, bronz lamellák, és fény, amely este a házban marad.'.split(
      ' ',
    );
  const [ref, seen] = useInView<HTMLDivElement>(0.4);
  const sold = UNITS.filter((u) => u.status !== 'szabad').length;
  const a = useCountUp(33, seen, 1400);
  const b = useCountUp(Math.round((sold / UNITS.length) * 100), seen, 1600);
  const c = useCountUp(3.1, seen, 1400);
  return (
    <section className="rh-statement">
      <div className="rh-wrap">
        <p className="rh-kicker" data-reveal>
          01 — A gondolat
        </p>
        <p className="rh-big" data-reveal>
          {words.map((w, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties}>
              {w}{' '}
            </span>
          ))}
        </p>
        <div className="rh-pillars">
          {[
            ['Víz felé fordítva', 'A Duna-oldali lakások teljes szélességben üvegezettek; a 2,4 méter mély erkélyek nyáron árnyékolnak, télen beengedik a fényt.'],
            ['Csendes anyagok', 'Tölgy, travertin, bronz és füstüveg. Kevés anyag, sok gonddal — úgy, hogy húsz év múlva is ugyanilyen jó legyen hozzájuk érni.'],
            ['Ház, amely gondoskodik', 'Concierge a nap minden órájában, wellness, mélygarázs elektromos töltéssel és saját stég a folyóparton.'],
          ].map(([h, p], i) => (
            <article key={h} className="rh-pillar" data-reveal style={d(i * 120)}>
              <span className="rh-num">0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <div className="rh-counters" ref={ref}>
          <div>
            <b>{Math.round(a)}</b>
            <span>rezidencia, köztük két penthouse</span>
          </div>
          <div>
            <b>{Math.round(b)}%</b>
            <span>már foglalt vagy eladott</span>
          </div>
          <div>
            <b>{c.toFixed(1).replace('.', ',')} m</b>
            <span>belmagasság minden szinten</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- the elevation ---------- */
function Building({ onReserve }: { onReserve: (id: string) => void }) {
  const [floor, setFloor] = useState(6);
  const units = UNITS.filter((u) => u.floor === floor);
  const free = units.filter((u) => u.status === 'szabad').length;
  const areas = units.map((u) => u.area);
  return (
    <section className="rh-building" id="epulet">
      <div className="rh-wrap">
        <div className="rh-head">
          <p className="rh-kicker" data-reveal>
            02 — Az épület
          </p>
          <h2 className="rh-h2" data-reveal>
            Válasszon <em>emeletet.</em>
          </h2>
          <p className="rh-body" data-reveal>
            Vigye az egeret — vagy érintse meg — bármelyik szintet a homlokzaton, és megmutatjuk, mely lakások szabadok ott ma.
          </p>
        </div>
        <div className="rh-bld-grid">
          <div className="rh-elev" data-reveal>
            <svg viewBox="0 0 640 760" role="group" aria-label="Az épület Duna-felőli homlokzata, szintenként választható">
              <defs>
                <FacadeDefs p="rhe" />
                <linearGradient id="rhe-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#15171f" />
                  <stop offset=".45" stopColor="#262636" />
                  <stop offset=".78" stopColor="#5d4650" />
                  <stop offset="1" stopColor="#b9805a" />
                </linearGradient>
                <linearGradient id="rhe-water" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3a3038" />
                  <stop offset="1" stopColor="#141518" />
                </linearGradient>
                <linearGradient id="rhe-fade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity=".5" />
                  <stop offset=".8" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id="rhe-refl" maskUnits="userSpaceOnUse" x="0" y="560" width="640" height="200">
                  <rect x="0" y="560" width="640" height="200" fill="url(#rhe-fade)" />
                </mask>
              </defs>
              <rect width="640" height="560" fill="url(#rhe-sky)" />
              <rect y="560" width="640" height="200" fill="url(#rhe-water)" />
              {[
                [60, 60],
                [120, 130],
                [560, 50],
                [590, 170],
                [40, 220],
                [600, 300],
                [90, 330],
              ].map(([x, y]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r="1" fill="#e6e4df" opacity=".5" />
              ))}
              <path d="M0 520 C 60 500 100 512 150 524 L 150 560 H 0 Z M500 528 C 560 506 600 516 640 520 V 560 H 500 Z" fill="#2a2532" />
              <g transform="translate(140 46)">
                <Facade p="rhe" />
              </g>
              <g mask="url(#rhe-refl)">
                <use href="#rhe-fac" transform="translate(140 1074) scale(1 -1)" />
              </g>
              <rect y="556" width="640" height="5" fill="#2b2b30" />
              <g fill="#141615">
                <circle cx="96" cy="538" r="22" />
                <circle cx="70" cy="548" r="14" />
                <circle cx="560" cy="536" r="24" />
                <circle cx="594" cy="548" r="15" />
              </g>
              <g className="rh-ripples" stroke="rgb(230 228 223 / 0.12)">
                <path d="M120 600h200M360 620h180M80 660h260M300 700h240" />
              </g>
              {/* floor overlays */}
              <g transform="translate(140 46)">
                {FLOORS.map((f) => {
                  const [x0, x1] = fx(f);
                  const y = ftop(f);
                  const fu = UNITS.filter((u) => u.floor === f);
                  const tot = fu.reduce((s, u) => s + u.area, 0);
                  let acc = x0 + 6;
                  const on = floor === f;
                  return (
                    <g key={f} className={`rh-fl ${on ? 'is-on' : ''}`}>
                      <text className="rh-fl-num" x={-36} y={y + FH / 2 + 5} textAnchor="end">
                        {String(f).padStart(2, '0')}
                      </text>
                      <g className="rh-fl-hl">
                        <rect x={x0 - 9} y={y} width={x1 - x0 + 18} height={FH} />
                        {fu.map((u, i) => {
                          const w = ((x1 - x0 - 12) * u.area) / tot;
                          const cx = acc + w / 2;
                          const div = i ? <path d={`M${acc} ${y + 4}v${FH - 8}`} className="rh-fl-div" /> : null;
                          acc += w;
                          return (
                            <g key={u.id}>
                              {div}
                              <circle cx={cx} cy={y + 18} r="5" className={`rh-dot rh-dot--${u.status}`} />
                              <text x={cx} y={y + 38} textAnchor="middle" className="rh-fl-id">
                                {u.id}
                              </text>
                            </g>
                          );
                        })}
                        <path d={`M${x1 + 12} ${y + FH / 2}H${x1 + 34}`} className="rh-fl-lead" />
                        <text x={x1 + 40} y={y + FH / 2 - 2} className="rh-fl-tag">
                          {f === 9 ? 'Penthouse' : `${f}. emelet`}
                        </text>
                        <text x={x1 + 40} y={y + FH / 2 + 16} className="rh-fl-sub">
                          {fu.filter((u) => u.status === 'szabad').length} szabad
                        </text>
                      </g>
                      <rect
                        className="rh-fl-hit"
                        x={x0 - 10}
                        y={y}
                        width={x1 - x0 + 20}
                        height={FH}
                        tabIndex={0}
                        role="button"
                        aria-label={`${f}. emelet`}
                        aria-pressed={on}
                        onPointerEnter={(e) => e.pointerType === 'mouse' && setFloor(f)}
                        onClick={() => setFloor(f)}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter' && e.key !== ' ') return;
                          e.preventDefault();
                          setFloor(f);
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
            <div className="rh-legend" aria-hidden>
              <span>
                <i className="rh-dot--szabad" /> szabad
              </span>
              <span>
                <i className="rh-dot--foglalt" /> foglalt
              </span>
              <span>
                <i className="rh-dot--eladva" /> eladva
              </span>
            </div>
          </div>

          <div className="rh-panel" data-reveal style={d(120)}>
            <div className="rh-floor-rail" role="group" aria-label="Emelet">
              {[...FLOORS].reverse().map((f) => (
                <button key={f} type="button" aria-pressed={floor === f} className={floor === f ? 'is-on' : ''} onClick={() => setFloor(f)}>
                  {f === 9 ? 'PH' : f}
                </button>
              ))}
            </div>
            <div className="rh-panel-head" key={`h${floor}`}>
              <span className="rh-panel-n">{floor === 9 ? 'PH' : `${floor}.`}</span>
              <div>
                <h3>{floor === 9 ? 'Penthouse-szint' : `${floor}. emelet`}</h3>
                <p>
                  {units.length} rezidencia · {free} szabad · {m2(Math.min(...areas))} – {m2(Math.max(...areas))}
                </p>
              </div>
            </div>
            <ul className="rh-units" key={floor} aria-live="polite">
              {units.map((u, i) => (
                <li key={u.id} style={d(i * 60)}>
                  <span className="rh-u-id">{u.id}</span>
                  <span className="rh-u-spec">
                    {u.rooms} szoba · {m2(u.area)}
                    <small>
                      {u.view === 'Duna' ? 'Duna-panoráma' : 'Parkra néző'} · {u.orient}
                    </small>
                  </span>
                  <span className="rh-u-price">{u.status === 'eladva' ? '—' : ft(u.price)}</span>
                  <StatusPill s={u.status} />
                  <button type="button" className="rh-u-go" disabled={u.status === 'eladva'} onClick={() => onReserve(u.id)} aria-label={`Bejárás kérése: ${u.id}`}>
                    →
                  </button>
                </li>
              ))}
            </ul>
            <p className="rh-fine">Az árak bruttó árak, mélygarázs-beálló nélkül. Az elérhetőség tájékoztató jellegű.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- finder ---------- */
type Level = 'all' | 'low' | 'mid' | 'high';
const LEVELS: Array<[Level, string]> = [
  ['all', 'Bármely'],
  ['low', '1–3.'],
  ['mid', '4–6.'],
  ['high', '7.–PH'],
];
function Finder({ onReserve }: { onReserve: (id: string) => void }) {
  const [rooms, setRooms] = useState(0);
  const [min, setMin] = useState(40);
  const [max, setMax] = useState(200);
  const [level, setLevel] = useState<Level>('all');
  const [view, setView] = useState<'all' | View>('all');
  const [onlyFree, setOnlyFree] = useState(true);
  const res = useMemo(
    () =>
      UNITS.filter(
        (u) =>
          (!rooms || (rooms === 5 ? u.rooms >= 5 : u.rooms === rooms)) &&
          u.area >= min &&
          u.area <= max &&
          (level === 'all' || (level === 'low' ? u.floor <= 3 : level === 'mid' ? u.floor >= 4 && u.floor <= 6 : u.floor >= 7)) &&
          (view === 'all' || u.view === view) &&
          (!onlyFree || u.status === 'szabad'),
      ).sort((a, b) => a.price - b.price),
    [rooms, min, max, level, view, onlyFree],
  );
  const reset = () => {
    setRooms(0);
    setMin(40);
    setMax(200);
    setLevel('all');
    setView('all');
    setOnlyFree(false);
  };
  const pct = (v: number) => ((v - 40) / 160) * 100;
  return (
    <section className="rh-finder" id="kereso">
      <div className="rh-wrap">
        <div className="rh-head rh-head--row">
          <div>
            <p className="rh-kicker" data-reveal>
              03 — Lakáskereső
            </p>
            <h2 className="rh-h2" data-reveal>
              Az otthon, <em>ahogy elképzelte.</em>
            </h2>
          </div>
          <p className="rh-body" data-reveal style={d(100)}>
            Szűrjön szobaszámra, alapterületre, szintre és kilátásra. A lista ár szerint rendezve mutatja a megfelelő lakásokat.
          </p>
        </div>
        <div className="rh-finder-grid">
          <form className="rh-filters" data-reveal onSubmit={(e) => e.preventDefault()}>
            <fieldset>
              <legend>Szobaszám</legend>
              <div className="rh-chips">
                {[0, 1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" aria-pressed={rooms === r} className={rooms === r ? 'is-on' : ''} onClick={() => setRooms(r)}>
                    {r === 0 ? 'Mind' : r === 5 ? '5+' : r}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                Alapterület <output>{min}–{max} m²</output>
              </legend>
              <div className="rh-range" style={{ '--a': pct(min), '--b': pct(max) } as CSSProperties}>
                <span className="rh-range-fill" aria-hidden />
                <input type="range" min={40} max={200} step={5} value={min} aria-label="Minimum alapterület" onChange={(e) => setMin(Math.min(+e.target.value, max - 10))} />
                <input type="range" min={40} max={200} step={5} value={max} aria-label="Maximum alapterület" onChange={(e) => setMax(Math.max(+e.target.value, min + 10))} />
              </div>
            </fieldset>
            <fieldset>
              <legend>Emelet</legend>
              <div className="rh-seg">
                {LEVELS.map(([k, l]) => (
                  <button key={k} type="button" aria-pressed={level === k} className={level === k ? 'is-on' : ''} onClick={() => setLevel(k)}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Kilátás</legend>
              <div className="rh-seg">
                {(
                  [
                    ['all', 'Mindegy'],
                    ['Duna', 'Duna'],
                    ['park', 'Park'],
                  ] as const
                ).map(([k, l]) => (
                  <button key={k} type="button" aria-pressed={view === k} className={view === k ? 'is-on' : ''} onClick={() => setView(k)}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="rh-switch">
              <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} />
              <span aria-hidden />
              Csak a szabad lakások
            </label>
          </form>

          <div className="rh-results" data-reveal style={d(120)}>
            <div className="rh-results-head">
              <p>
                <b>{res.length}</b> lakás felel meg
              </p>
              <button type="button" className="rh-link" onClick={reset}>
                Szűrők törlése
              </button>
            </div>
            {res.length ? (
              <ul className="rh-cards">
                {res.map((u) => (
                  <li key={u.id} className="rh-card">
                    <div className="rh-card-top">
                      <span className="rh-card-id">{u.id}</span>
                      <StatusPill s={u.status} />
                    </div>
                    <p className="rh-card-spec">
                      {u.rooms} szoba · {m2(u.area)}
                    </p>
                    <p className="rh-card-meta">
                      {u.floor === 9 ? 'Penthouse' : `${u.floor}. emelet`} · {u.view === 'Duna' ? 'Duna' : 'park'} · {u.orient}
                    </p>
                    <div className="rh-card-foot">
                      <span>{u.status === 'eladva' ? 'Elkelt' : ft(u.price)}</span>
                      <button type="button" disabled={u.status === 'eladva'} onClick={() => onReserve(u.id)}>
                        Bejárást kérek <span aria-hidden>→</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rh-empty">
                <p>Ezekkel a feltételekkel most nincs szabad lakás.</p>
                <button type="button" className="rh-btn rh-btn--line rh-btn--sm" onClick={reset}>
                  Szűrők törlése
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- sun path ---------- */
type Room = { x: number; y: number; w: number; h: number; name: string; area: string; lx: number; ly: number };
const ROOMS: Record<string, Room> = {
  liv: { x: 60, y: 50, w: 220, h: 170, name: 'Nappali · konyha', area: '41,2 m²', lx: 214, ly: 156 },
  mas: { x: 60, y: 220, w: 160, h: 130, name: 'Hálószoba', area: '17,6 m²', lx: 150, ly: 236 },
  bat: { x: 220, y: 220, w: 80, h: 130, name: 'Fürdő', area: '8,1 m²', lx: 260, ly: 268 },
  hal: { x: 280, y: 50, w: 70, h: 170, name: 'Előtér', area: '9,4 m²', lx: 315, ly: 160 },
  pan: { x: 300, y: 220, w: 50, h: 130, name: 'Kamra', area: '', lx: 325, ly: 290 },
  kid: { x: 350, y: 50, w: 120, h: 140, name: 'Gyerekszoba', area: '13,8 m²', lx: 410, ly: 72 },
  stu: { x: 350, y: 190, w: 120, h: 160, name: 'Dolgozó', area: '12,9 m²', lx: 418, ly: 252 },
};
const WINDOWS: Array<[string, number, number, number, number, number, number]> = [
  ['liv', 60, 64, 60, 206, -1, 0],
  ['mas', 60, 234, 60, 336, -1, 0],
  ['mas', 84, 350, 196, 350, 0, 1],
  ['kid', 470, 66, 470, 176, 1, 0],
  ['stu', 470, 206, 470, 336, 1, 0],
  ['stu', 372, 350, 448, 350, 0, 1],
];
const sunAt = (t: number) => {
  const az = 88 + ((t - 6) / 14) * 210;
  const alt = Math.max(1.5, 61 * Math.sin((Math.PI * (t - 5.2)) / 15.6));
  return { az, alt };
};
const hhmm = (t: number) => `${Math.floor(t)}:${String(Math.round((t % 1) * 60)).padStart(2, '0')}`;
const SUN_TEXT: Array<[number, string, string]> = [
  [9, 'Reggel', 'Kelet felől, a park fölött érkezik a fény: a gyerekszoba és a dolgozó ébred elsőként.'],
  [12, 'Délelőtt', 'A déli ablakokon át szórt, egyenletes fény tölti meg a hálószobát és a dolgozót.'],
  [15, 'Dél', 'A nap magasan jár — a mély erkélyek árnyékolnak, így a nappali nyáron sem melegszik túl.'],
  [18, 'Délután', 'A Duna felől fordul be a fény, és egyre mélyebbre fut a tölgypadlón.'],
  [21, 'Naplemente', 'A nap a budai hegyek mögé bukik — a nappali ilyenkor egészen az előszobáig aranyban áll.'],
];

function SunPath() {
  const [t, setT] = useState(18.5);
  const { az, alt } = sunAt(t);
  const rad = (az * Math.PI) / 180;
  const sx = Math.sin(rad);
  const sy = -Math.cos(rad);
  const L = Math.min(330, 52 / Math.tan((Math.max(alt, 4) * Math.PI) / 180));
  const k = 1 - Math.min(1, alt / 45);
  const col = `rgb(${Math.round(246 - 8 * k)} ${Math.round(216 - 78 * k)} ${Math.round(150 - 84 * k)})`;
  const phase = SUN_TEXT.find(([h]) => t < h) ?? SUN_TEXT[4];
  // the sun on the little dial: azimuth around, altitude toward the centre
  const dr = 48 * (1 - alt / 90);
  return (
    <section className="rh-sun" id="feny" style={{ '--k': k.toFixed(3) } as CSSProperties}>
      <div className="rh-wrap">
        <div className="rh-head rh-head--row">
          <div>
            <p className="rh-kicker" data-reveal>
              04 — Fény
            </p>
            <h2 className="rh-h2" data-reveal>
              Egy nap <em>a B típusú lakásban.</em>
            </h2>
          </div>
          <p className="rh-body" data-reveal style={d(100)}>
            Átmenő, háromszobás otthon 92 m²-en: nyugatra a Duna, keletre a park. Húzza a csúszkát, és nézze, hogyan vándorol a fény
            reggel hattól este nyolcig.
          </p>
        </div>
        <div className="rh-sun-grid" data-reveal>
          <div className="rh-plan">
            <svg viewBox="-34 24 572 352" role="img" aria-label={`Alaprajz, napfény ${hhmm(t)}-kor`}>
              <defs>
                {Object.entries(ROOMS).map(([id, r]) => (
                  <clipPath key={id} id={`rhs-c-${id}`}>
                    <rect x={r.x} y={r.y} width={r.w} height={r.h} />
                  </clipPath>
                ))}
                <pattern id="rhs-deck" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M0 4h8" stroke="rgb(28 29 31 / 0.18)" strokeWidth="1" />
                </pattern>
                <filter id="rhs-soft" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>
              <rect x="18" y="50" width="42" height="300" fill="#d4cbbb" />
              <rect x="18" y="50" width="42" height="300" fill="url(#rhs-deck)" />
              <rect x="470" y="60" width="28" height="280" fill="#d4cbbb" />
              <rect x="60" y="50" width="410" height="300" fill="#efece6" />
              <rect x="60" y="50" width="220" height="300" fill="#e7dccb" opacity=".55" />
              {/* sunlight */}
              <g filter="url(#rhs-soft)">
                {WINDOWS.map(([room, x1, y1, x2, y2, nx, ny], i) => {
                  const dot = sx * nx + sy * ny;
                  if (dot <= 0.02) return null;
                  const op = Math.min(1, dot * 1.15) * Math.min(1, alt / 6) * 0.82;
                  const pts = `${x1},${y1} ${x2},${y2} ${x2 - sx * L},${y2 - sy * L} ${x1 - sx * L},${y1 - sy * L}`;
                  return <polygon key={i} points={pts} clipPath={`url(#rhs-c-${room})`} fill={col} opacity={op} />;
                })}
              </g>
              <rect x="60" y="50" width="410" height="300" fill="#1c1d1f" opacity={(0.3 * k * k).toFixed(3)} />
              {/* furniture */}
              <g className="rh-furn">
                <rect x="150" y="56" width="124" height="18" rx="2" />
                <rect x="176" y="104" width="76" height="20" rx="3" />
                <rect x="76" y="132" width="22" height="74" rx="5" />
                <rect x="98" y="186" width="56" height="20" rx="5" />
                <rect x="110" y="148" width="36" height="26" rx="3" />
                <circle cx="118" cy="96" r="18" />
                <rect x="104" y="260" width="92" height="76" rx="4" />
                <path d="M104 278h92" />
                <rect x="232" y="296" width="58" height="44" rx="10" />
                <rect x="232" y="228" width="40" height="18" rx="3" />
                <rect x="392" y="96" width="60" height="80" rx="4" />
                <rect x="360" y="300" width="76" height="22" rx="2" />
                <rect x="452" y="200" width="12" height="90" />
              </g>
              {/* walls */}
              <g className="rh-walls">
                <path d="M296 50H60V350H470V50H330" strokeWidth="6" />
                <path d="M60 220H150M188 220H220M220 220V236M220 268V350M220 220H254M288 220H350M300 220V350M280 50V110M350 50V128M350 160V196M350 226V350M350 190H470" strokeWidth="3" />
              </g>
              {WINDOWS.map(([, x1, y1, x2, y2], i) => (
                <path key={i} d={`M${x1} ${y1}L${x2} ${y2}`} className="rh-win" />
              ))}
              {Object.entries(ROOMS).map(([id, r]) => (
                <g key={id} className="rh-room-label">
                  <text x={r.lx} y={r.ly} textAnchor="middle">
                    {r.name}
                  </text>
                  {r.area && (
                    <text x={r.lx} y={r.ly + 13} textAnchor="middle" className="rh-room-area">
                      {r.area}
                    </text>
                  )}
                </g>
              ))}
              <text x="-10" y="200" className="rh-plan-side" transform="rotate(-90 -10 200)" textAnchor="middle">
                Duna · nyugat
              </text>
              <text x="522" y="200" className="rh-plan-side" transform="rotate(90 522 200)" textAnchor="middle">
                Park · kelet
              </text>
              <text x="38" y="364" className="rh-plan-side" textAnchor="middle">
                terasz
              </text>
            </svg>
          </div>
          <div className="rh-sun-side">
            <div className="rh-dial-row">
              <svg viewBox="-60 -60 120 120" className="rh-dial" aria-hidden>
                <circle r="48" className="rh-dial-ring" />
                <circle r="24" className="rh-dial-ring rh-dial-ring--in" />
                <path d="M0 -56V-44M0 44V56M-56 0H-44M44 0H56" className="rh-dial-tick" />
                <text y="-30" textAnchor="middle">
                  É
                </text>
                <text y="36" textAnchor="middle">
                  D
                </text>
                <text x="-34" y="4" textAnchor="middle">
                  Ny
                </text>
                <text x="34" y="4" textAnchor="middle">
                  K
                </text>
                <line x1="0" y1="0" x2={sx * dr} y2={sy * dr} className="rh-dial-ray" />
                <circle cx={sx * dr} cy={sy * dr} r="6.5" className="rh-dial-sun" />
              </svg>
              <div>
                <p className="rh-time">{hhmm(t)}</p>
                <p className="rh-sun-meta">
                  {Math.round(az)}° · {Math.round(alt)}° magasan
                </p>
              </div>
            </div>
            <p className="rh-sun-phase">{phase[1]}</p>
            <p className="rh-sun-text" aria-live="polite">
              {phase[2]}
            </p>
            <div className="rh-slider">
              <input type="range" min={6} max={20} step={0.25} value={t} onChange={(e) => setT(+e.target.value)} aria-label="Napszak" aria-valuetext={hhmm(t)} style={{ '--p': `${((t - 6) / 14) * 100}%` } as CSSProperties} />
              <div className="rh-slider-ticks" aria-hidden>
                {['6:00', '9:00', '12:00', '15:00', '18:00', '20:00'].map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
            </div>
            <div className="rh-presets">
              {(
                [
                  [7, 'Reggel'],
                  [12.5, 'Dél'],
                  [19.5, 'Naplemente'],
                ] as const
              ).map(([v, l]) => (
                <button key={l} type="button" className={t === v ? 'is-on' : ''} onClick={() => setT(v)}>
                  {l}
                </button>
              ))}
            </div>
            <p className="rh-fine">Szemléltetés a nyári napforduló környéki napjárás alapján, egyszerűsítve.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- location ---------- */
const POIS: Array<[string, string, number, number]> = [
  ['Rév kikötő', 'hajóállomás · 3 perc gyalog', 262, 318],
  ['Partfüzes park', 'futókör, játszótér · 1 perc', 360, 214],
  ['Malomkert csarnok', 'termelői piac · 7 perc gyalog', 448, 318],
  ['Hajlat híd', 'át Budára · 9 perc gyalog', 186, 118],
  ['Nádliget Nemzetközi Iskola', 'óvodától érettségiig · 6 perc autóval', 500, 128],
  ['Belváros', '14 perc autóval · 20 perc hajóval', 470, 420],
];
function Location() {
  const [hov, setHov] = useState(-1);
  return (
    <section className="rh-loc" id="helyszin">
      <div className="rh-wrap rh-loc-grid">
        <div>
          <p className="rh-kicker" data-reveal>
            05 — Helyszín
          </p>
          <h2 className="rh-h2" data-reveal>
            Ahol a Duna <em>kanyart vesz.</em>
          </h2>
          <p className="rh-body" data-reveal>
            A Révhajlat a pesti part egyetlen olyan pontján áll, ahol a folyó ívet rajzol: a nappaliból egyszerre látszik a víz felfelé és lefelé. Mögötte
            park, előtte sétány, tíz percen belül minden, ami egy városi élethez kell.
          </p>
          <ol className="rh-pois" data-reveal>
            {POIS.map(([n, s], i) => (
              <li key={n} onPointerEnter={() => setHov(i)} onPointerLeave={() => setHov(-1)} onFocus={() => setHov(i)} onBlur={() => setHov(-1)} tabIndex={0} className={hov === i ? 'is-on' : ''}>
                <span className="rh-poi-n">{i + 1}</span>
                <span>
                  <b>{n}</b>
                  <small>{s}</small>
                </span>
              </li>
            ))}
          </ol>
          <div className="rh-dist" data-reveal>
            <span>Repülőtér · 28 perc</span>
            <span>Körgyűrű · 9 perc</span>
            <span>Metró · 6 perc gyalog</span>
          </div>
        </div>
        <div className="rh-map" data-reveal style={d(120)}>
          <svg viewBox="0 0 600 460" role="img" aria-label="Stilizált térkép a Duna-kanyarról és a környező helyekről">
            <defs>
              <linearGradient id="rhm-river" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2f3a48" />
                <stop offset="1" stopColor="#262e3a" />
              </linearGradient>
            </defs>
            <rect width="600" height="460" fill="#202124" />
            <g className="rh-map-contour">
              {[0, 1, 2, 3, 4].map((i) => (
                <path key={i} d={`M-10 ${150 + i * 34} C ${40 + i * 6} ${120 + i * 30} ${90 - i * 4} ${230 + i * 22} ${30 + i * 10} ${300 + i * 30} S ${-10} ${420 + i * 10} ${70 + i * 8} 470`} />
              ))}
            </g>
            <g className="rh-map-streets">
              {Array.from({ length: 13 }, (_, i) => (
                <path key={`h${i}`} d={`M230 ${22 + i * 34} L610 ${4 + i * 34}`} />
              ))}
              {Array.from({ length: 8 }, (_, i) => (
                <path key={`v${i}`} d={`M${300 + i * 46} -10 L${330 + i * 46} 470`} />
              ))}
              <path d="M300 -10 C 320 120 300 230 380 300 S 520 380 600 400" className="rh-map-avenue" />
            </g>
            <path d="M318 176 C 360 160 410 178 420 206 S 396 252 352 250 S 300 214 318 176 Z" fill="#2c332c" />
            <path d="M190 -20 C 200 90 130 170 210 250 C 270 310 350 330 380 480" stroke="#34363b" strokeWidth="92" fill="none" />
            <path d="M190 -20 C 200 90 130 170 210 250 C 270 310 350 330 380 480" stroke="url(#rhm-river)" strokeWidth="80" fill="none" />
            <path d="M190 -20 C 200 90 130 170 210 250 C 270 310 350 330 380 480" className="rh-map-flow" />
            <path d="M150 168 C 160 150 176 156 178 176 S 170 214 158 206 S 146 182 150 168 Z" fill="#2c332c" opacity=".9" />
            <path d="M120 118 L 252 118" className="rh-map-bridge" />
            <text x="96" y="80" className="rh-map-label" transform="rotate(-62 96 80)">
              DUNA
            </text>
            <text x="54" y="390" className="rh-map-label rh-map-label--dim">
              BUDA
            </text>
            <text x="520" y="250" className="rh-map-label rh-map-label--dim">
              PEST
            </text>
            {POIS.map(([n, , x, y], i) => (
              <g key={n} className={`rh-map-poi ${hov === i ? 'is-on' : ''}`} transform={`translate(${x} ${y})`}>
                <circle r="13" />
                <text y="4.5" textAnchor="middle">
                  {i + 1}
                </text>
              </g>
            ))}
            <g transform="translate(296 262)" className="rh-map-home">
              <circle r="30" className="rh-map-pulse" />
              <circle r="15" />
              <path d="M-6 5V-3L0 -8L6 -3V5Z" />
            </g>
            <text x="330" y="282" className="rh-map-home-label">
              Révhajlat
            </text>
            <g transform="translate(552 40)" className="rh-map-north">
              <path d="M0 -16L6 6L0 2L-6 6Z" />
              <text y="22" textAnchor="middle">
                É
              </text>
            </g>
            <g transform="translate(36 432)" className="rh-map-scale">
              <path d="M0 0H80M0 -5V5M80 -5V5" />
              <text x="40" y="-9" textAnchor="middle">
                500 m
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ---------- amenities ---------- */
const AMEN: Array<[string, string, string, string]> = [
  ['Concierge', '24/7', 'Csomagátvétel, takarítás, asztalfoglalás, kulcskezelés — a recepción mindig vár valaki, aki név szerint ismeri.', 'M12 30h24M14 30a10 10 0 0 1 20 0M24 18v-3M20 15h8M10 34h28'],
  ['Wellness', '18 m', 'Sós vizű medence a Duna felé néző üvegfal mögött, finn szauna, gőzkabin és edzőterem, csak a lakóknak.', 'M8 30c4 3 8 3 12 0s8-3 12 0 8 3 12 0M8 36c4 3 8 3 12 0s8-3 12 0 8 3 12 0M18 24V12a4 4 0 0 1 8 0M30 24V12'],
  ['Mélygarázs', '2 szint', '58 beálló két szinten, széles parkolóhelyek, lift egyenesen a lakásszintekre, külön kerékpártároló.', 'M10 38V18l14-8 14 8v20M16 38V26h16v12M16 32h16'],
  ['EV-töltés', '11 kW', 'Minden beálló előkészítve saját fogyasztásmérős töltőre; két 22 kW-os közös töltő a vendégeknek.', 'M26 8l-10 18h9l-3 14 12-20h-9z'],
];
function Amenities() {
  return (
    <section className="rh-amen" id="szolgaltatasok">
      <div className="rh-wrap">
        <div className="rh-head rh-head--center">
          <p className="rh-kicker" data-reveal>
            06 — Szolgáltatások
          </p>
          <h2 className="rh-h2" data-reveal>
            A ház, amely <em>gondol Önre.</em>
          </h2>
        </div>
        <div className="rh-amen-grid">
          {AMEN.map(([h, big, p, icon], i) => (
            <article key={h} className="rh-amen-card" data-reveal style={d(i * 90)}>
              <svg viewBox="0 0 48 48" className="rh-icon" aria-hidden>
                <path d={icon} />
              </svg>
              <span className="rh-amen-big">{big}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <ul className="rh-amen-more" data-reveal>
          {['Tetőkert grillezővel', 'Saját stég kajakoknak', 'Vendégapartman', 'Okosotthon-vezérlés', 'Kutyamosó', 'Borospince-rekeszek'].map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- materials ---------- */
const MATS: Array<[string, string, string]> = [
  ['oak', 'Tölgy', '22 cm széles, olajozott tölgy hajópadló halszálka mintában, padlófűtéssel és rejtett szegélylécekkel.'],
  ['trav', 'Travertin', 'Nagyformátumú, töltött travertin a fürdőkben és a lobbyban — mattra csiszolva, hogy mezítláb is meleg legyen.'],
  ['brass', 'Bronz', 'Eloxált bronz lamellák a homlokzaton, és ugyanez a tónus a kilincseken, a liftajtókon és a lépcsőkorláton.'],
  ['glass', 'Füstüveg', 'Háromrétegű hővédő üvegezés, 2,9 m magas tolóajtók; belül füstüveg térelválasztók a gardróbokban.'],
];
const SPECS: Array<[string, string]> = [
  ['Szerkezet', 'Monolit vasbeton, 3,1 m belmagasság, A++ energetika'],
  ['Homlokzat', 'Háromrétegű üvegezés, bronz lamellák, travertin lábazat'],
  ['Gépészet', 'Hőszivattyú, mennyezethűtés, hővisszanyerős szellőzés'],
  ['Konyha', 'Egyedi gyártású bútor, kőpult, beépített gépek'],
  ['Fürdők', 'Walk-in zuhany, rejtett szifon, fali WC, törölközőszárító'],
  ['Biztonság', 'Videós beléptetés, ujjlenyomatos zár, 24 órás portaszolgálat'],
];
function Materials() {
  const [m, setM] = useState(0);
  return (
    <section className="rh-mat" id="anyagok">
      <div className="rh-wrap rh-mat-grid">
        <div>
          <p className="rh-kicker" data-reveal>
            07 — Anyagok és műszaki tartalom
          </p>
          <h2 className="rh-h2" data-reveal>
            Kevés anyag, <em>sok gonddal.</em>
          </h2>
          <div className="rh-swatches" role="tablist" aria-label="Anyagminták" data-reveal>
            {MATS.map(([id, n], i) => (
              <button key={id} type="button" role="tab" aria-selected={m === i} className={m === i ? 'is-on' : ''} onClick={() => setM(i)}>
                <span className={`rh-sw rh-sw--${id}`} aria-hidden />
                {n}
              </button>
            ))}
          </div>
          <div className="rh-mat-stage" data-reveal>
            <div className={`rh-sw rh-sw--${MATS[m][0]} rh-sw--big`} key={m} aria-hidden />
            <p role="tabpanel">
              <b>{MATS[m][1]}.</b> {MATS[m][2]}
            </p>
          </div>
        </div>
        <dl className="rh-specs" data-reveal style={d(120)}>
          {SPECS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------- payment ---------- */
const PAY: Array<[string, string, number, string]> = [
  ['2026 IV. n.év', 'Szerződéskötés', 10, 'Foglaló és adásvételi szerződés; a befizetés ügyvédi letétbe kerül.'],
  ['2027 II. n.év', 'Szerkezetkész', 20, 'A teherhordó szerkezet a penthouse-szintig elkészül.'],
  ['2027 IV. n.év', 'Zárt homlokzat', 20, 'Üvegezés, bronz lamellák és tető — az épület zárt.'],
  ['2028 I. n.év', 'Belsőépítészet', 20, 'Burkolatok, gépészet, egyedi módosítások lezárása.'],
  ['2028 II. n.év', 'Birtokbaadás', 30, 'Kulcsátadás a használatbavételi engedély után.'],
];
function Payment() {
  const examples = useMemo(() => [UNITS.find((u) => u.id === '3.01')!, UNITS.find((u) => u.id === '6.02')!, UNITS.find((u) => u.id === '9.02')!], []);
  const [ex, setEx] = useState(1);
  const [ref, seen] = useInView<HTMLOListElement>(0.3);
  const u = examples[ex];
  let cum = 0;
  return (
    <section className="rh-pay" id="fizetes">
      <div className="rh-wrap">
        <div className="rh-head rh-head--row">
          <div>
            <p className="rh-kicker" data-reveal>
              08 — Fizetési ütemezés
            </p>
            <h2 className="rh-h2" data-reveal>
              Az építéssel <em>együtt fizet.</em>
            </h2>
          </div>
          <p className="rh-body" data-reveal style={d(100)}>
            Minden részlet egy független műszaki ellenőr által igazolt készültségi fokhoz kötött. Előre semmit, csak azt, ami már áll.
          </p>
        </div>
        <div className="rh-pay-pick" data-reveal role="group" aria-label="Példa lakás">
          <span>Példa:</span>
          {examples.map((x, i) => (
            <button key={x.id} type="button" aria-pressed={ex === i} className={ex === i ? 'is-on' : ''} onClick={() => setEx(i)}>
              {x.id} · {x.rooms} szoba · {mft(x.price)}
            </button>
          ))}
        </div>
        <ol className={`rh-timeline ${seen ? 'is-in' : ''}`} ref={ref}>
          <span className="rh-tl-line" aria-hidden />
          <span className="rh-tl-now" aria-hidden>
            Most · alapozás
          </span>
          {PAY.map(([when, h, pct, p], i) => {
            cum += pct;
            return (
              <li key={h} style={d(200 + i * 140)}>
                <span className="rh-tl-dot" aria-hidden />
                <span className="rh-tl-when">{when}</span>
                <h3>{h}</h3>
                <p className="rh-tl-amt">
                  <b>{pct}%</b> · {mft((u.price * pct) / 100)}
                </p>
                <p className="rh-tl-p">{p}</p>
                <span className="rh-tl-cum">Összesen {cum}%</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ---------- quotes / faq ---------- */
const QUOTES: Array<[string, string, string]> = [
  ['Az első bejáráson tíz percig csak álltunk a nappali ablakában. A víz felől jövő fény eldöntötte helyettünk.', 'Bárdos Eszter és Gergely', 'a 6.02 vásárlói'],
  ['Harminc éve tervezek házakat. Ritkán látok ilyen fegyelmezett homlokzatot és ennyire átgondolt gépészetet.', 'Szendrei Ádám', 'építész, a 8.01 vásárlója'],
  ['A letéti konstrukciót a saját ügyvédünk is rendben találta, az ütemezés pedig átlátható. Nálunk ez döntött.', 'Kertész-Molnár Dóra', 'a 4.03 vásárlója'],
];
function Quotes() {
  return (
    <section className="rh-quotes">
      <div className="rh-wrap">
        <p className="rh-kicker rh-center" data-reveal>
          09 — Akik már itt laknak — gondolatban
        </p>
        <div className="rh-quote-grid">
          {QUOTES.map(([q, who, what], i) => (
            <figure key={who} className="rh-quote" data-reveal style={d(i * 120)}>
              <span className="rh-qmark" aria-hidden>
                “
              </span>
              <blockquote>{q}</blockquote>
              <figcaption>
                <b>{who}</b>
                <span>{what}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="rh-fine rh-center">A vásárlói idézetek fiktívek — a Révhajlat Rezidencia egy design-bemutató.</p>
      </div>
    </section>
  );
}

const FAQ: Array<[string, string]> = [
  ['Mikor lesz a birtokbaadás?', 'A műszaki átadást 2028 első negyedévére, a kulcsátadást 2028 tavaszára tervezzük. Az adásvételi szerződésben rögzített véghatáridő 2028. június 30.'],
  ['Mennyire biztonságos a befizetés?', 'Minden befizetés ügyvédi letétbe, majd elkülönített projektszámlára kerül. A részletek csak a független műszaki ellenőr által igazolt készültség után esedékesek.'],
  ['Módosíthatom az alaprajzot?', 'A szerkezetkész állapotig a belső válaszfalak, a konyha és a fürdők kialakítása díjmentesen egyeztethető belsőépítészünkkel. Két lakás összenyitása is lehetséges.'],
  ['Hány parkolóhely tartozik egy lakáshoz?', 'Minden lakáshoz vásárolható mélygarázs-beálló (8,9 M Ft), a penthouse-okhoz kettő tartozik. Mindegyik elő van készítve elektromos autó töltésére.'],
  ['Mennyi lesz a közös költség?', 'Várhatóan 980 Ft/m² havonta. Ez tartalmazza a concierge-szolgáltatást, a wellness használatát, a közös terek takarítását és az épület biztosítását.'],
  ['Kiadhatom a lakást?', 'Igen. Concierge-csapatunk igény esetén teljes körű bérbeadás-kezelést vállal, rövid és hosszú távra egyaránt.'],
];
function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="rh-faq" id="gyik">
      <div className="rh-wrap rh-faq-grid">
        <div>
          <p className="rh-kicker" data-reveal>
            10 — Gyakori kérdések
          </p>
          <h2 className="rh-h2" data-reveal>
            Kérdések, <em>egyenes válaszok.</em>
          </h2>
        </div>
        <div className="rh-acc">
          {FAQ.map(([q, a], n) => (
            <div key={q} className={`rh-acc-item ${open === n ? 'is-open' : ''}`} data-reveal style={d(n * 60)}>
              <button type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                {q}
                <span aria-hidden />
              </button>
              <div className="rh-acc-body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- booking ---------- */
const SLOTS = ['Hétköznap délelőtt', 'Hétköznap délután', 'Szombat', 'Naplemente-bejárás'];
function Booking({ unit, setUnit, notify }: { unit: string; setUnit: (s: string) => void; notify: (m: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [slot, setSlot] = useState(3);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return notify('Kérjük, adja meg a nevét.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify('Kérjük, érvényes e-mail-címet adjon meg.');
    notify(`Köszönjük, ${name.trim().split(' ')[0]}! Ez egy design-bemutató — semmit nem küldtünk el.`);
    setName('');
    setEmail('');
    setPhone('');
  };
  return (
    <section className="rh-book" id="bejaras">
      <div className="rh-book-glow" aria-hidden />
      <div className="rh-wrap rh-book-grid">
        <div>
          <p className="rh-kicker" data-reveal>
            11 — Bejárás
          </p>
          <h2 className="rh-h1 rh-h1--mid" data-reveal>
            Nézze meg <em>naplementekor.</em>
          </h2>
          <p className="rh-lead" data-reveal>
            Bemutatótermünkben a mintalakás teljes berendezéssel várja, a teraszáról pedig a valódi kilátás. Csütörtökönként naplemente-bejárást is tartunk.
          </p>
          <ul className="rh-book-facts" data-reveal>
            <li>
              <b>Bemutatóterem</b> Révhajlat sétány 1., Budapest
            </li>
            <li>
              <b>Nyitva</b> hétfőtől szombatig 10–19 óráig
            </li>
            <li>
              <b>Telefon</b> +36 1 555 0140
            </li>
          </ul>
        </div>
        <form className="rh-form" onSubmit={submit} noValidate data-reveal style={d(120)}>
          <div className="rh-field">
            <label htmlFor="rh-name">Név</label>
            <input id="rh-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Kovács Anna" />
          </div>
          <div className="rh-field-row">
            <div className="rh-field">
              <label htmlFor="rh-email">E-mail</label>
              <input id="rh-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="anna@pelda.hu" />
            </div>
            <div className="rh-field">
              <label htmlFor="rh-phone">Telefon (nem kötelező)</label>
              <input id="rh-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+36 30 123 4567" />
            </div>
          </div>
          <div className="rh-field">
            <label htmlFor="rh-unit">Érdeklő lakás</label>
            <input id="rh-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pl. 6.02 — vagy hagyja üresen" />
          </div>
          <fieldset className="rh-field">
            <legend>Időpont</legend>
            <div className="rh-chips rh-chips--wrap">
              {SLOTS.map((s, i) => (
                <button key={s} type="button" aria-pressed={slot === i} className={slot === i ? 'is-on' : ''} onClick={() => setSlot(i)}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="rh-btn rh-btn--brass rh-btn--block">
            Bejárást kérek <span aria-hidden>→</span>
          </button>
          <p className="rh-fine">Munkatársunk egy munkanapon belül visszahívja az időpont egyeztetéséhez.</p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ['Rezidencia', ['Az épület', 'Lakáskereső', 'Anyagok', 'Fizetés']],
    ['Bemutatóterem', ['Révhajlat sétány 1.', 'H–Szo 10–19', '+36 1 555 0140']],
    ['Csapat', ['Révpart Ingatlanfejlesztő', 'Hídvégi & Kőrös Építészek', 'Sóvár Építő']],
  ];
  return (
    <footer className="rh-footer">
      <div className="rh-wrap">
        <div className="rh-footer-grid">
          <div>
            <Wordmark big />
            <p className="rh-fine">Dunaparti rezidenciák · Budapest</p>
          </div>
          {cols.map(([h, ls]) => (
            <div key={h}>
              <h4>{h}</h4>
              <ul>
                {ls.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="rh-footer-base">
          <span>© {new Date().getFullYear()} Révhajlat Rezidencia</span>
          <span>A Révhajlat Rezidencia fiktív márka — David Mészáros landing page koncepciója.</span>
        </div>
      </div>
    </footer>
  );
}

export default function Revhajlat() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [toast, notify] = useToast(3600);
  const [unit, setUnit] = useState('');
  const reserve = (id: string) => {
    setUnit(id);
    document.getElementById('bejaras')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <div ref={root} className="revhajlat">
      <Nav />
      <Hero />
      <Marquee />
      <Statement />
      <Building onReserve={reserve} />
      <Finder onReserve={reserve} />
      <SunPath />
      <Location />
      <Amenities />
      <Materials />
      <Payment />
      <Quotes />
      <Faq />
      <Booking unit={unit} setUnit={setUnit} notify={notify} />
      <Footer />
      <div className={`rh-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
