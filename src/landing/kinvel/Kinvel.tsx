import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import '@fontsource-variable/unbounded';
import './kinvel.css';
import { jump, useCountUp, useInView, usePointerTilt, useReveal, useScrolledPast, useToast } from '../kit';
import { AppIcons, AppSheet, AppTabBar, SwipeDots, useLandingPhone } from '../appKit';

/**
 * Kinvel One — a fictional premium city e-bike launch.
 * Black, volt and steel; one precise code-drawn bike that spins, recolours and zooms.
 */

type Colour = 'volt' | 'graphite' | 'bone';
type Size = 'S' | 'M' | 'L';
type Acc = 'rack' | 'lights' | 'lock';
type View = 'side' | 'drive' | 'cockpit';

const COLOURS: Array<{ id: Colour; name: string; note: string }> = [
  { id: 'volt', name: 'Volt', note: 'High-visibility powder coat, satin clear' },
  { id: 'graphite', name: 'Graphite', note: 'Anodised dark steel-grey, volt decals' },
  { id: 'bone', name: 'Bone', note: 'Warm off-white ceramic finish' },
];
const SIZES: Record<Size, string> = { S: '155–170 cm', M: '168–183 cm', L: '180–196 cm' };
const ACCS: Array<{ id: Acc; name: string; price: number; note: string }> = [
  { id: 'rack', name: 'Rear rack', price: 149, note: '25 kg, fits two panniers' },
  { id: 'lights', name: 'Lights Pro', price: 119, note: '1,200 lm beam, brake-sensing tail' },
  { id: 'lock', name: 'Frame lock', price: 89, note: 'Unlocks with the bike’s app' },
];
const BASE = 3690;
const HERO_VB = '0 70 1000 510';
const fmt = (n: number) => `€${Math.round(n).toLocaleString('en-GB')}`;

// invented names only — awards, test labs and rider titles that do not exist
const PRESS = ['NORTHCOG JOURNAL', 'Spoke & Asphalt', 'VELORIM DESIGN PRIZE ’26', 'The Commuter Ledger', 'KADENZIO WEEKLY', 'Brakefield Test Lab'];

/* ---------------- the bike ---------------- */

// tangentially laced spokes, generated once and reused by every wheel
const SPOKES = (() => {
  let d = '';
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    const b = a + ((i % 2 ? 1 : -1) * 34 * Math.PI) / 180;
    d += `M${(Math.cos(a) * 12).toFixed(1)} ${(Math.sin(a) * 12).toFixed(1)}L${(Math.cos(b) * 132).toFixed(1)} ${(Math.sin(b) * 132).toFixed(1)}`;
  }
  return d;
})();

// [path, stroke width]
const TUBES: Array<[string, number]> = [
  ['M452 430L250 400', 15],
  ['M408 220L250 400', 12],
  ['M454 424L404 204', 24],
  ['M406 210C520 196 610 176 694 158', 22],
  ['M456 420C560 360 640 282 704 230', 44],
  ['M688 146L708 226', 30],
  ['M706 222C724 280 748 345 770 400', 15],
];

function Wheel({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 400)`}>
      <circle r="150" className="kv-tyre" />
      <circle r="161" className="kv-tread" />
      <g className="kv-spin">
        <g className="kv-spin2">
          <circle r="136" className="kv-rim" />
          <path d="M-46.5 -127.8A136 136 0 0 1 46.5 -127.8" className="kv-decal" />
          <path d={SPOKES} className="kv-spoke" />
          <circle r="34" className="kv-rotor" />
          <circle r="15" className="kv-hub" />
          <rect x="-3" y="-131" width="6" height="9" rx="1.5" className="kv-valve" />
        </g>
      </g>
      <circle r="5" className="kv-axle" />
    </g>
  );
}

function Bike({
  part = 'all',
  colour = 'volt',
  rack = false,
  lights = false,
  lock = false,
  className = '',
  vb = '0 0 1000 600',
}: {
  part?: 'all' | 'wheels' | 'frame';
  colour?: Colour;
  rack?: boolean;
  lights?: boolean;
  lock?: boolean;
  className?: string;
  vb?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const wheels = part !== 'frame';
  const frame = part !== 'wheels';
  return (
    <svg viewBox={vb} className={`kv-bike ${className}`} data-c={colour} aria-hidden>
      <defs>
        <linearGradient id={`${uid}b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <path id={`${uid}t`} d="M470 202C560 192 620 176 690 161" />
      </defs>
      {wheels && (
        <>
          <ellipse cx="510" cy="566" rx="420" ry="10" className="kv-floor" />
          <Wheel x={250} />
          <Wheel x={770} />
        </>
      )}
      {frame && (
        <>
          {lights && <path d="M722 172L1000 92V300Z" style={{ fill: `url(#${uid}b)` }} className="kv-beam" />}
          <path d="M83.9 355.5A172 172 0 0 1 348.7 259.1" className="kv-fender" />
          <path d="M697.3 244.2A172 172 0 0 1 939.4 370.1" className="kv-fender" />
          {/* belt drive */}
          <path d="M452 392L250 382A18 18 0 0 0 250 418L452 466A37 37 0 0 0 452 392Z" className="kv-belt" />
          <path d="M452 392L250 382A18 18 0 0 0 250 418L452 466A37 37 0 0 0 452 392Z" className="kv-belt-teeth" />
          <circle cx="250" cy="400" r="18" className="kv-cog" />
          {/* far crank */}
          <path d="M452 428L418 360" className="kv-crank kv-crank--far" />
          {/* seatpost + saddle */}
          <path d="M404 206L392 142" className="kv-post" />
          <path d="M330 138C352 122 420 122 452 134C432 148 362 150 330 138Z" className="kv-saddle" />
          <path d="M346 132C376 124 414 124 438 130" className="kv-saddle-hi" />
          {/* frame: shade, body, highlight */}
          <g className="kv-tubes kv-tubes--lo">
            {TUBES.map(([d, w]) => (
              <path key={d} d={d} strokeWidth={w} transform="translate(0 4)" />
            ))}
          </g>
          <g className="kv-tubes">
            {TUBES.map(([d, w]) => (
              <path key={d} d={d} strokeWidth={w} />
            ))}
          </g>
          <g className="kv-tubes kv-tubes--hi">
            {TUBES.map(([d, w]) => (
              <path key={d} d={d} strokeWidth={Math.max(2.5, w * 0.16)} transform={`translate(0 ${-(w * 0.2).toFixed(1)})`} />
            ))}
          </g>
          {/* integrated battery panel */}
          <path d="M470 424C566 368 642 296 708 246" className="kv-batt" />
          <path d="M600 334L628 309" className="kv-led" />
          <text className="kv-logo">
            <textPath href={`#${uid}t`}>KINVEL ONE</textPath>
          </text>
          {/* cockpit */}
          <path d="M688 150L692 116L742 104" className="kv-stem" />
          <path d="M742 104C736 92 712 84 688 88" className="kv-bar" />
          <path d="M690 88L664 92" className="kv-grip" />
          <rect x="700" y="100" width="30" height="13" rx="3" transform="rotate(-13 715 106)" className="kv-display" />
          <path d="M704 108L722 104" transform="rotate(-13 715 106)" className="kv-display-line" />
          {/* lights */}
          <rect x="709" y="166" width="16" height="12" rx="4" className="kv-headlight" />
          <rect x="322" y="150" width="14" height="7" rx="3" className={`kv-tail ${lights ? 'is-on' : ''}`} />
          {/* motor + near crank */}
          <circle cx="452" cy="428" r="44" className="kv-motor" />
          <circle cx="452" cy="428" r="37" className="kv-sprocket" />
          <circle cx="452" cy="428" r="22" className="kv-motor-cap" />
          <path d="M452 428L488 500" className="kv-crank" />
          <rect x="466" y="495" width="46" height="10" rx="3" className="kv-pedal" />
          <path d="M440 446L414 548" className="kv-stand" />
          {rack && (
            <g className="kv-rack">
              <path d="M214 212H398" />
              <path d="M226 212L252 394M300 212L258 394M386 212L404 222" />
              <rect x="210" y="204" width="14" height="8" rx="2" className="kv-tail is-on" />
            </g>
          )}
          {lock && (
            <g transform="translate(300 330) rotate(-48)" className="kv-lock">
              <rect x="-18" y="-12" width="36" height="24" rx="7" />
              <circle cx="8" cy="0" r="3.4" />
            </g>
          )}
        </>
      )}
    </svg>
  );
}

/* ---------------- sections ---------------- */

function Wordmark() {
  return (
    <span className="kv-wordmark">
      KINVEL<i>/</i>ONE
    </span>
  );
}

function Nav() {
  const solid = useScrolledPast(30);
  return (
    <nav className={`kv-nav ${solid ? 'is-solid' : ''}`} aria-label="Kinvel">
      <div className="kv-wrap kv-nav-in">
        <a href="#top" onClick={jump('top')} aria-label="Kinvel home">
          <Wordmark />
        </a>
        <div className="kv-nav-links">
          {[
            ['design', 'Design'],
            ['configure', 'Configure'],
            ['range', 'Range'],
            ['compare', 'Compare'],
            ['faq', 'FAQ'],
          ].map(([id, l]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {l}
            </a>
          ))}
        </div>
        <a href="#configure" onClick={jump('configure')} className="kv-btn kv-btn--sm kv-btn--volt">
          Reserve <span className="kv-hide-s">· €199</span>
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const area = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  usePointerTilt(area, tilt, 7);
  return (
    <header className="kv-hero" id="top" ref={area}>
      <div className="kv-grid-bg" aria-hidden />
      <div className="kv-wrap kv-hero-top">
        <div>
          <p className="kv-pill" data-reveal>
            <span className="kv-live" /> Batch 01 · shipping March 2027
          </p>
          <h1 className="kv-h1" data-reveal style={{ '--d': '80ms' } as CSSProperties}>
            The city,
            <br />
            <span className="kv-volt">in one line.</span>
          </h1>
        </div>
        <div className="kv-hero-side" data-reveal style={{ '--d': '200ms' } as CSSProperties}>
          <p className="kv-lead">
            Kinvel One is a 17.9 kg monocoque e-bike with a silent carbon belt, a battery you will never see and up to 160 km
            between charges.
          </p>
          <div className="kv-cta-row">
            <a href="#configure" onClick={jump('configure')} className="kv-btn kv-btn--volt">
              Build yours <span aria-hidden>→</span>
            </a>
            <a href="#design" onClick={jump('design')} className="kv-btn kv-btn--line">
              Explore the design
            </a>
          </div>
        </div>
      </div>
      <div className="kv-hero-stage" data-reveal style={{ '--d': '260ms' } as CSSProperties}>
        <div className="kv-tilt" ref={tilt}>
          <span className="kv-ghost" aria-hidden>
            ONE
          </span>
          <div className="kv-layer kv-layer--wheels">
            <Bike part="wheels" vb={HERO_VB} />
          </div>
          <div className="kv-layer kv-layer--frame">
            <Bike part="frame" lights vb={HERO_VB} />
          </div>
          <div className="kv-chip kv-chip--a">
            <b>160</b> km range
          </div>
          <div className="kv-chip kv-chip--b">
            <b>17.9</b> kg
          </div>
          <div className="kv-chip kv-chip--c">
            <b>70</b> Nm mid-drive
          </div>
        </div>
      </div>
      <div className="kv-wrap kv-hero-foot">
        <span>Hover the bike — the wheels are live</span>
        <span>From {fmt(BASE)} · reserve for €199</span>
      </div>
    </header>
  );
}

function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="kv-marquee" aria-hidden>
      <div className="kv-marquee-track">
        {children}
        {children}
      </div>
    </div>
  );
}

function Pillars() {
  const items = [
    ['01', 'One piece of metal', 'A hydroformed aluminium monocoque: no welds to see, nothing bolted on, cables routed through the bars.'],
    ['02', 'Silence as a feature', 'A carbon belt instead of a chain. No oil, no stretch, no grease on your trousers — 30,000 km between swaps.'],
    ['03', 'Power you do not notice', '70 Nm arrives with the pressure of your foot, not after it. The motor reads your cadence 1,000 times a second.'],
  ];
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="kv-statement" id="story">
      <div className="kv-wrap">
        <p className="kv-kicker" data-reveal>
          [ 01 — Manifesto ]
        </p>
        <p className="kv-big" data-reveal>
          We took everything off the bike that a city does not need — <span className="kv-dim">the chain, the cables, the bolt-on battery, the noise</span> — and kept
          the one thing it does: <span className="kv-volt">momentum.</span>
        </p>
        <div className="kv-pillars lp-swipe" ref={row}>
          {items.map(([n, h, p], i) => (
            <article key={n} className="kv-pillar" data-reveal style={{ '--d': `${i * 110}ms` } as CSSProperties}>
              <span className="kv-num">{n}</span>
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

function Spec({ to, dec = 0, unit, label, run }: { to: number; dec?: number; unit: string; label: string; run: boolean }) {
  const v = useCountUp(to, run, 1800);
  return (
    <div className="kv-spec">
      <dd>
        {v.toFixed(dec)}
        <small>{unit}</small>
      </dd>
      <dt>{label}</dt>
      <i style={{ '--p': run ? 1 : 0 } as CSSProperties} />
    </div>
  );
}

function Specs() {
  const [ref, seen] = useInView<HTMLDListElement>(0.35);
  return (
    <section className="kv-specs-sec" id="specs">
      <div className="kv-wrap">
        <dl className="kv-specs" ref={ref}>
          <Spec to={160} unit="km" label="Range, Eco mode" run={seen} />
          <Spec to={17.9} dec={1} unit="kg" label="Weight, size M" run={seen} />
          <Spec to={25} unit="km/h" label="Top assisted speed" run={seen} />
          <Spec to={2.5} dec={1} unit="h" label="Charge, 0–80%" run={seen} />
        </dl>
      </div>
    </section>
  );
}

const SPOTS = [
  { x: 58, y: 54, t: 'Integrated 720 Wh battery', d: 'Sealed inside the down tube and removable from below with the key. Cells rated for 1,000 full cycles.' },
  { x: 45.2, y: 71.3, t: 'K1 mid-drive', d: '70 Nm, 2.4 kg, almost silent. Torque and cadence sensing tuned in-house for stop-and-go traffic.' },
  { x: 34, y: 70, t: 'Carbon belt drive', d: 'No oil, no rust, no noise. Pairs with a sealed 5-speed internal hub you can shift standing still.' },
  { x: 71.5, y: 17, t: 'Cockpit display', d: 'A 1.6″ always-readable screen built into the stem: speed, range, assist and turn-by-turn arrows.' },
  { x: 71.7, y: 28.6, t: 'Integrated light', d: '800 lm as standard, switched on with the motor. No clips, no cables, no batteries to forget.' },
  { x: 25, y: 66.7, t: 'Four-piston hydraulics', d: '180 mm rotors front and rear. Stops a fully loaded bike from 25 km/h in under four metres.' },
];

function Design() {
  const [on, setOn] = useState(0);
  const s = SPOTS[on];
  return (
    <section className="kv-design" id="design">
      <div className="kv-wrap">
        <div className="kv-head">
          <p className="kv-kicker" data-reveal>
            [ 02 — Design details ]
          </p>
          <h2 className="kv-h2" data-reveal>
            Nothing added.
            <br />
            <span className="kv-steel">Everything inside.</span>
          </h2>
        </div>
        <div className="kv-design-grid">
          <div className="kv-design-stage" data-reveal>
            <div className="kv-design-art">
            <Bike colour="graphite" />
            {SPOTS.map((p, i) => (
              <button
                key={p.t}
                type="button"
                className={`kv-spot ${on === i ? 'is-on' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` } as CSSProperties}
                onClick={() => setOn(i)}
                aria-label={p.t}
                aria-pressed={on === i}
              >
                <span>{i + 1}</span>
              </button>
            ))}
            </div>
          </div>
          <div className="kv-callout" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
            <div key={on} className="kv-callout-in">
              <span className="kv-num">0{on + 1} / 06</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
            <div className="kv-callout-nav lp-chips">
              {SPOTS.map((p, i) => (
                <button key={p.t} type="button" className={on === i ? 'is-on' : ''} onClick={() => setOn(i)}>
                  {p.t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type Build = ReturnType<typeof useBuild>;

/** the configurator's choices, shared by the inline configurator and the phone reserve sheet */
function useBuild(notify: (m: string) => void) {
  const [colour, setColour] = useState<Colour>('volt');
  const [size, setSize] = useState<Size>('M');
  const [acc, setAcc] = useState<Record<Acc, boolean>>({ rack: false, lights: true, lock: false });
  const total = BASE + ACCS.reduce((s, a) => s + (acc[a.id] ? a.price : 0), 0);
  const c = COLOURS.find((x) => x.id === colour)!;
  const reserve = () =>
    notify(`Kinvel One · ${c.name} · ${size} reserved for €199 — design showcase, nothing is charged.`);
  return { colour, setColour, size, setSize, acc, setAcc, total, c, reserve };
}

function BuildPanel({ b, onReserve, style, reveal = true }: { b: Build; onReserve: () => void; style?: CSSProperties; reveal?: boolean }) {
  const { colour, setColour, size, setSize, acc, setAcc, total, c } = b;
  return (
    <div className="kv-panel" data-reveal={reveal ? '' : undefined} style={style}>
      <fieldset>
        <legend>Colourway</legend>
        <div className="kv-swatches">
          {COLOURS.map((x) => (
            <button key={x.id} type="button" aria-pressed={colour === x.id} className={`kv-swatch ${colour === x.id ? 'is-on' : ''}`} onClick={() => setColour(x.id)}>
              <i data-c={x.id} />
              {x.name}
            </button>
          ))}
        </div>
        <p className="kv-note">{c.note}</p>
      </fieldset>
      <fieldset>
        <legend>Frame size</legend>
        <div className="kv-seg">
          {(Object.keys(SIZES) as Size[]).map((s) => (
            <button key={s} type="button" aria-pressed={size === s} className={size === s ? 'is-on' : ''} onClick={() => setSize(s)}>
              <b>{s}</b>
              <span>{SIZES[s]}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Accessories</legend>
        {ACCS.map((a) => (
          <label key={a.id} className={`kv-toggle ${acc[a.id] ? 'is-on' : ''}`}>
            <input type="checkbox" checked={acc[a.id]} onChange={() => setAcc({ ...acc, [a.id]: !acc[a.id] })} />
            <span className="kv-switch" aria-hidden />
            <span className="kv-toggle-t">
              {a.name}
              <small>{a.note}</small>
            </span>
            <b>+€{a.price}</b>
          </label>
        ))}
      </fieldset>
      <div className="kv-total">
        <div>
          <span>Your Kinvel One</span>
          <strong key={total}>{fmt(total)}</strong>
        </div>
        <button type="button" className="kv-btn kv-btn--volt" onClick={onReserve}>
          Reserve for €199
        </button>
      </div>
      <p className="kv-note">Fully refundable deposit · pay the rest when your bike ships</p>
    </div>
  );
}

function Configurator({ b }: { b: Build }) {
  const { colour, size, acc, c } = b;
  const [view, setView] = useState<View>('side');
  return (
    <section className="kv-config" id="configure">
      <div className="kv-wrap">
        <div className="kv-head">
          <p className="kv-kicker" data-reveal>
            [ 03 — Configure ]
          </p>
          <h2 className="kv-h2" data-reveal>
            Make it <span className="kv-volt">yours.</span>
          </h2>
        </div>
        <div className="kv-config-grid">
          <div className="kv-config-stage" data-reveal data-view={view} data-size={size}>
            <div className="kv-cam">
              <Bike colour={colour} rack={acc.rack} lights={acc.lights} lock={acc.lock} />
            </div>
            <div className="kv-views" role="tablist" aria-label="Camera">
              {(
                [
                  ['side', 'Side'],
                  ['drive', 'Drivetrain'],
                  ['cockpit', 'Cockpit'],
                ] as Array<[View, string]>
              ).map(([v, l]) => (
                <button key={v} type="button" role="tab" aria-selected={view === v} className={view === v ? 'is-on' : ''} onClick={() => setView(v)}>
                  {l}
                </button>
              ))}
            </div>
            <span className="kv-stage-tag">
              {c.name} · {size} · {SIZES[size]}
            </span>
          </div>

          <BuildPanel b={b} onReserve={b.reserve} style={{ '--d': '120ms' } as CSSProperties} />
        </div>
      </div>
    </section>
  );
}

/** phones: the reserve flow as a bottom sheet — same choices as the configurator */
function ReserveSheet({ b, open, onClose }: { b: Build; open: boolean; onClose: () => void }) {
  return (
    <AppSheet open={open} title="Reserve your Kinvel One" onClose={onClose}>
      <div className="kv-sheet-bike" aria-hidden>
        <Bike colour={b.colour} rack={b.acc.rack} lights={b.acc.lights} lock={b.acc.lock} />
        <span className="kv-stage-tag">
          {b.c.name} · {b.size} · {SIZES[b.size]}
        </span>
      </div>
      <BuildPanel
        b={b}
        reveal={false}
        onReserve={() => {
          onClose();
          b.reserve();
        }}
      />
    </AppSheet>
  );
}

const ASSIST = [
  ['Eco', 5.2],
  ['Tour', 7.2],
  ['Sport', 9.6],
  ['Boost', 13],
] as const;

function Range() {
  const [assist, setAssist] = useState(1);
  const [kg, setKg] = useState(78);
  const [hills, setHills] = useState(30);
  const wh = ASSIST[assist][1] * (1 + ((kg - 75) / 75) * 0.35) * (1 + (hills / 100) * 0.8);
  const km = Math.round(720 / wh);
  const days = Math.floor(km / 18);
  const terrain = hills < 25 ? 'Flat' : hills < 60 ? 'Rolling' : 'Hilly';
  return (
    <section className="kv-range" id="range">
      <div className="kv-wrap kv-range-grid">
        <div>
          <p className="kv-kicker" data-reveal>
            [ 04 — Range ]
          </p>
          <h2 className="kv-h2" data-reveal>
            How far is <span className="kv-volt">your</span> week?
          </h2>
          <p className="kv-body" data-reveal>
            Range depends on you, not on a lab. Set your assist level, weight and terrain — the estimate uses the same model as
            the bike’s own display.
          </p>
          <div className="kv-sliders" data-reveal>
            <label>
              <span>
                Assist level <b>{ASSIST[assist][0]}</b>
              </span>
              <input type="range" min={0} max={3} step={1} value={assist} onChange={(e) => setAssist(+e.target.value)} style={{ '--v': `${(assist / 3) * 100}%` } as CSSProperties} />
              <span className="kv-ticks" aria-hidden>
                {ASSIST.map(([n]) => (
                  <i key={n}>{n}</i>
                ))}
              </span>
            </label>
            <label>
              <span>
                Rider + cargo <b>{kg} kg</b>
              </span>
              <input type="range" min={50} max={130} value={kg} onChange={(e) => setKg(+e.target.value)} style={{ '--v': `${((kg - 50) / 80) * 100}%` } as CSSProperties} />
            </label>
            <label>
              <span>
                Terrain <b>{terrain}</b>
              </span>
              <input type="range" min={0} max={100} value={hills} onChange={(e) => setHills(+e.target.value)} style={{ '--v': `${hills}%` } as CSSProperties} />
            </label>
          </div>
        </div>
        <div className="kv-gauge" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
          <svg viewBox="0 0 240 140" aria-hidden>
            <path d="M20 125A100 100 0 0 1 220 125" className="kv-gauge-bg" pathLength={1} />
            <path d="M20 125A100 100 0 0 1 220 125" className="kv-gauge-fg" pathLength={1} style={{ strokeDashoffset: 1 - Math.min(1, km / 170) }} />
          </svg>
          <div className="kv-gauge-n" aria-live="polite">
            {km}
            <small>km</small>
          </div>
          <p className="kv-gauge-l">estimated range</p>
          <div className="kv-cells" aria-hidden>
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} className={i < Math.round((km / 170) * 12) ? 'is-on' : ''} />
            ))}
          </div>
          <p className="kv-gauge-x">
            ≈ <b>{days} days</b> of a 2 × 9 km commute on one charge
          </p>
        </div>
      </div>
    </section>
  );
}

function Bento() {
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="kv-bento-sec">
      <div className="kv-wrap">
        <div className="kv-head">
          <p className="kv-kicker" data-reveal>
            [ 05 — Close up ]
          </p>
          <h2 className="kv-h2" data-reveal>
            Engineered to <span className="kv-steel">disappear.</span>
          </h2>
        </div>
        <div className="kv-bento lp-swipe" ref={row}>
          <article className="kv-tile kv-tile--screen" data-reveal>
            <div className="kv-screen">
              <span className="kv-screen-mode">TOUR</span>
              <span className="kv-screen-n">
                24<small>km/h</small>
              </span>
              <span className="kv-screen-bar">
                <i />
              </span>
              <span className="kv-screen-meta">
                <span>↱ 300 m</span>
                <span>118 km</span>
              </span>
            </div>
            <h3>Cockpit, not a gadget</h3>
            <p>Readable in full sun, dimmed at night, never asks you to pair anything.</p>
          </article>
          <article className="kv-tile kv-tile--belt" data-reveal style={{ '--d': '90ms' } as CSSProperties}>
            <svg viewBox="0 0 200 200" className="kv-macro" aria-hidden>
              <circle cx="100" cy="100" r="86" className="kv-macro-belt" />
              <g className="kv-macro-spin">
                <circle cx="100" cy="100" r="74" className="kv-macro-teeth" />
                <circle cx="100" cy="100" r="58" className="kv-macro-ring" />
                {Array.from({ length: 5 }, (_, i) => (
                  <path key={i} d="M100 100L100 50" transform={`rotate(${i * 72} 100 100)`} className="kv-macro-arm" />
                ))}
                <circle cx="100" cy="100" r="16" className="kv-macro-hub" />
              </g>
            </svg>
            <h3>30,000 km belt</h3>
            <p>Carbon-reinforced, lubricant-free, quieter than your breathing.</p>
          </article>
          <article className="kv-tile kv-tile--light" data-reveal style={{ '--d': '150ms' } as CSSProperties}>
            <div className="kv-lightbar" aria-hidden>
              <i />
            </div>
            <h3>Seen from 800 m</h3>
            <p>A full-width tail bar that brightens when you brake — automatically.</p>
          </article>
          <article className="kv-tile kv-tile--lock" data-reveal style={{ '--d': '210ms' } as CSSProperties}>
            <svg viewBox="0 0 520 160" className="kv-route" aria-hidden>
              <path d="M10 130C80 130 90 60 160 60S250 110 320 92 400 30 470 34" className="kv-route-line" pathLength={1} />
              <circle cx="470" cy="34" r="7" className="kv-route-pin" />
              <circle cx="470" cy="34" r="16" className="kv-route-ring" />
            </svg>
            <div className="kv-phone" aria-hidden>
              <svg viewBox="0 0 48 48">
                <rect x="12" y="21" width="24" height="18" rx="4" />
                <path d="M17 21v-5a7 7 0 0 1 14 0v5" />
              </svg>
              <b>Locked</b>
              <span>GPS on · last seen 2 min ago</span>
            </div>
            <h3>Hard to steal, easy to find</h3>
            <p>Motor lock, movement alarm and live GPS — included for life, no subscription.</p>
          </article>
        </div>
        <SwipeDots row={row} count={4} />
      </div>
    </section>
  );
}

const COMPARE: Array<[string, string, string]> = [
  ['Weight', '17.9 kg', '24–27 kg'],
  ['Battery', '720 Wh, inside the frame', '500 Wh, bolted on'],
  ['Range', 'up to 160 km', '60–90 km'],
  ['Drive', 'Carbon belt, 30,000 km', 'Chain, oil every 300 km'],
  ['Charge 0–80%', '2.5 hours', '4–6 hours'],
  ['Lights', 'Integrated, 800 lm', 'Clip-on, sold separately'],
  ['Anti-theft', 'Motor lock + live GPS', 'Not included'],
  ['Warranty', '5 years frame & motor', '2 years'],
];

function Compare() {
  return (
    <section className="kv-compare" id="compare">
      <div className="kv-wrap">
        <div className="kv-head">
          <p className="kv-kicker" data-reveal>
            [ 06 — Compare ]
          </p>
          <h2 className="kv-h2" data-reveal>
            Kinvel One vs. <span className="kv-steel">a typical e-bike.</span>
          </h2>
        </div>
        <div className="kv-table" role="table" data-reveal>
          <div className="kv-tr kv-tr--h" role="row">
            <span role="columnheader" />
            <span role="columnheader">
              <Wordmark />
            </span>
            <span role="columnheader">Typical e-bike</span>
          </div>
          {COMPARE.map(([k, a, b], i) => (
            <div className="kv-tr" role="row" key={k} style={{ '--i': i } as CSSProperties}>
              <span role="rowheader">{k}</span>
              <span role="cell" className="kv-yes">
                {a}
              </span>
              <span role="cell" className="kv-no">
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TARGET = new Date('2026-11-20T10:00:00+01:00').getTime();

function Batch({ notify }: { notify: (m: string) => void }) {
  const ref = useRef<HTMLElement>(null);
  const [now, setNow] = useState(() => Date.now());
  const [bar, seen] = useInView<HTMLDivElement>(0.5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(t);
      if (e.isIntersecting) t = window.setInterval(() => setNow(Date.now()), 1000);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(t);
    };
  }, []);
  const left = Math.max(0, TARGET - now);
  const parts: Array<[number, string]> = [
    [Math.floor(left / 864e5), 'days'],
    [Math.floor(left / 36e5) % 24, 'hours'],
    [Math.floor(left / 6e4) % 60, 'min'],
    [Math.floor(left / 1e3) % 60, 'sec'],
  ];
  return (
    <section className="kv-batch" ref={ref}>
      <div className="kv-wrap kv-batch-grid">
        <div data-reveal>
          <p className="kv-kicker">[ 07 — Availability ]</p>
          <h2 className="kv-h2 kv-h2--sm">Batch 01 is almost gone.</h2>
          <div className="kv-progress" ref={bar}>
            <i style={{ '--p': seen ? 0.88 : 0 } as CSSProperties} />
          </div>
          <p className="kv-progress-l">
            <b>880</b> of 1,000 reserved · shipping March 2027
          </p>
        </div>
        <div className="kv-count" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
          <p>Batch 02 opens in</p>
          <div className="kv-count-row">
            {parts.map(([n, l]) => (
              <div key={l}>
                <b>{String(n).padStart(2, '0')}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <button type="button" className="kv-btn kv-btn--line" onClick={() => notify('We will ping you when Batch 02 opens — design showcase, nothing was saved.')}>
            Notify me for Batch 02
          </button>
        </div>
      </div>
    </section>
  );
}

const REVIEWS = [
  ['I sold my car in May. The One is lighter than my old city bike and it climbs Gellért Hill like it is flat.', 'Ilka V.', 'Architect · Budapest', 'Volt · M'],
  ['The belt is the thing. No clicking, no grease, no maintenance anxiety. It just goes, every morning.', 'Tomas R.', 'Product designer · Vienna', 'Graphite · L'],
  ['Six weeks of commuting, two charges. I honestly forgot there is a battery in it.', 'Sanne D.', 'Physician · Utrecht', 'Bone · S'],
];

function Reviews() {
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="kv-reviews">
      <div className="kv-wrap">
        <div className="kv-head">
          <p className="kv-kicker" data-reveal>
            [ 08 — Test riders ]
          </p>
          <h2 className="kv-h2" data-reveal>
            4.9 from 2,140 <span className="kv-steel">test rides.</span>
          </h2>
        </div>
        <div className="kv-review-grid lp-swipe" ref={row}>
          {REVIEWS.map(([q, n, r, b], i) => (
            <figure key={n} className="kv-review" data-reveal style={{ '--d': `${i * 110}ms` } as CSSProperties}>
              <span className="kv-stars" aria-label="5 out of 5">
                ★★★★★
              </span>
              <blockquote>“{q}”</blockquote>
              <figcaption>
                <span className="kv-avatar" aria-hidden>
                  {n[0]}
                </span>
                <span>
                  <b>{n}</b>
                  {r}
                </span>
                <em>{b}</em>
              </figcaption>
            </figure>
          ))}
        </div>
        <SwipeDots row={row} count={REVIEWS.length} />
        <p className="kv-fine">Reviews and riders are fictional — Kinvel One is a design showcase.</p>
      </div>
    </section>
  );
}

const FAQ = [
  ['When will my bike ship?', 'Batch 01 ships from March 2027 in reservation order. You will get a delivery window by email eight weeks before, and can change colour or size until then.'],
  ['Is the €199 deposit refundable?', 'Yes, fully and at any time before your bike ships. Cancel in your account and the deposit is back on your card within five working days.'],
  ['Can I take the battery out?', 'Yes. It unlocks with the bike key and slides out from below the down tube, so you can charge it indoors. A full charge takes 3.5 hours; 0–80% takes 2.5.'],
  ['Is it legal everywhere in the EU?', 'The One is a pedelec: assistance stops at 25 km/h and the motor is rated at 250 W continuous, so it needs no licence, plate or insurance in EU countries.'],
  ['Where do I get it serviced?', 'At 140 partner workshops across Europe, or by a mobile technician who comes to you. The belt and internal hub need almost nothing for the first 10,000 km.'],
  ['Can I try one first?', 'Test rides run in Budapest, Vienna, Prague and Amsterdam. Book a 30-minute slot after reserving — or before, it is free either way.'],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="kv-faq" id="faq">
      <div className="kv-wrap kv-faq-grid">
        <div>
          <p className="kv-kicker" data-reveal>
            [ 09 — FAQ ]
          </p>
          <h2 className="kv-h2" data-reveal>
            Before you <span className="kv-volt">ride.</span>
          </h2>
        </div>
        <div className="kv-acc">
          {FAQ.map(([q, a], n) => (
            <div key={q} className={`kv-acc-item ${open === n ? 'is-open' : ''}`} data-reveal style={{ '--d': `${n * 60}ms` } as CSSProperties}>
              <button type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                {q}
                <span aria-hidden />
              </button>
              <div className="kv-acc-body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Final({ notify, onReserve }: { notify: (m: string) => void; onReserve?: () => void }) {
  const [email, setEmail] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify('Please enter a valid email address.');
      return;
    }
    setEmail('');
    notify('You are on the launch list — design showcase, nothing was sent.');
  };
  return (
    <section className="kv-final" id="reserve">
      <div className="kv-wrap kv-final-in">
        <p className="kv-kicker" data-reveal>
          [ 10 — Pre-order ]
        </p>
        <h2 className="kv-h1 kv-h1--mid" data-reveal>
          One bike.
          <br />
          <span className="kv-volt">Zero excuses.</span>
        </h2>
        <div className="kv-final-bike" data-reveal aria-hidden>
          <Bike colour="bone" />
        </div>
        <div className="kv-final-row" data-reveal>
          <a
            href="#configure"
            onClick={
              onReserve
                ? (e) => {
                    e.preventDefault();
                    onReserve();
                  }
                : jump('configure')
            }
            className="kv-btn kv-btn--volt"
          >
            Reserve for €199 <span aria-hidden>→</span>
          </a>
          <form className="kv-form" onSubmit={submit} noValidate>
            <label className="kv-sr" htmlFor="kv-email">
              Email address
            </label>
            <input id="kv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Launch updates — you@domain.com" autoComplete="email" />
            <button type="submit" aria-label="Join the launch list">
              →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ['Kinvel One', ['Design', 'Configure', 'Range', 'Specs']],
    ['Riders', ['Test rides', 'Service network', 'Warranty', 'Manuals']],
    ['Company', ['About', 'Careers', 'Journal', 'Contact']],
  ];
  return (
    <footer className="kv-footer">
      <div className="kv-wrap">
        <div className="kv-footer-grid">
          <div>
            <Wordmark />
            <p className="kv-fine">Designed in Budapest · assembled in Győr</p>
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
        <div className="kv-footer-base">
          <span>© {new Date().getFullYear()} Kinvel</span>
          <span>Kinvel One is a fictional brand — a landing page concept by David Mészáros.</span>
        </div>
      </div>
    </footer>
  );
}

function BikeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="5.5" cy="15.5" r="3.5" />
      <circle cx="18.5" cy="15.5" r="3.5" />
      <path d="M5.5 15.5l4-7h7l2 7M9.5 8.5l3.5 7H5.5M15 5.5h2.5" />
    </svg>
  );
}

export default function Kinvel() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [toast, notify] = useToast(3600);
  const phone = useLandingPhone();
  const build = useBuild(notify);
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => setSheet(false), []);
  return (
    <div ref={root} className="kinvel">
      <Nav />
      <Hero />
      <section className="kv-press">
        <p>Tested and talked about by</p>
        <Marquee>
          {PRESS.map((p, i) => (
            <span key={p} className={`kv-press-item kv-press-item--${i % 3}`}>
              {p}
            </span>
          ))}
        </Marquee>
      </section>
      <Pillars />
      <Specs />
      <Design />
      <Configurator b={build} />
      <Range />
      <Bento />
      <Compare />
      <Batch notify={notify} />
      <Reviews />
      <Faq />
      <Final notify={notify} onReserve={phone ? () => setSheet(true) : undefined} />
      <Footer />
      <div className={`kv-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
      <ReserveSheet b={build} open={sheet} onClose={closeSheet} />
      <AppTabBar
        tabs={[
          { id: 'top', label: 'Bike', icon: <BikeIcon /> },
          { id: 'configure', label: 'Build', icon: <AppIcons.sliders /> },
          { id: 'range', label: 'Range', icon: <AppIcons.bolt /> },
          { id: 'compare', label: 'Compare', icon: <AppIcons.list /> },
        ]}
        action={{ label: 'Reserve', icon: <AppIcons.key />, onClick: () => setSheet(true) }}
      />
    </div>
  );
}
