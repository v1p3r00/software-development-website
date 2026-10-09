import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './vaulmere.css';
import { jump, useCountUp, useInView, usePointerTilt, useReveal, useScrolledPast, useToast } from '../kit';
import { AppIcons, AppSheet, AppTabBar, SwipeDots, useLandingPhone } from '../appKit';

/**
 * Vaulmere — a fictional private wealth app and metal card.
 * Landing page 01 of the showcase: dark quiet luxury, one champagne accent, a card that catches the light.
 */

type Finish = 'champagne' | 'obsidian' | 'pearl';
const FINISHES: Array<{ id: Finish; name: string; note: string }> = [
  { id: 'champagne', name: 'Champagne', note: 'Brushed steel, PVD gold' },
  { id: 'obsidian', name: 'Obsidian', note: 'Bead-blasted, black DLC' },
  { id: 'pearl', name: 'Pearl', note: 'Ceramic-coated, satin white' },
];

// invented publication names (checked so they do not belong to real outlets)
const PRESS = ['The Velloran Review', 'KESTWICK CAPITAL', 'Ambrell Weekly', 'FENMORE & CO.', 'Corvane Journal', 'THESSEL QUARTERLY'];

const TIERS = [
  {
    name: 'Reserve',
    monthly: 0,
    blurb: 'Everything you need to see your wealth in one place.',
    perks: ['All accounts and assets in one view', 'Virtual card, 0% FX up to €5,000 a month', 'Monthly wealth report'],
  },
  {
    name: 'Private',
    monthly: 29,
    blurb: 'A banker who knows your name — and the metal card.',
    perks: ['Champagne, Obsidian or Pearl metal card', 'Dedicated private banker, same-day replies', 'Unlimited 0% FX, 1,400+ airport lounges', 'Tax-aware rebalancing'],
    featured: true,
  },
  {
    name: 'Black',
    monthly: 89,
    blurb: 'For family offices and the people who run them.',
    perks: ['Everything in Private', 'Family accounts and shared vaults', 'Concierge 24/7, travel and events', 'Quarterly review with a wealth strategist'],
  },
];

const FAQ = [
  ['Is Vaulmere a bank?', 'Vaulmere works with regulated partner banks and custodians. Your money and assets are held in your name, separately from Vaulmere’s own balance sheet.'],
  ['Who can join?', 'Vaulmere is invitation-only while we grow. Request an invitation and a member of the team will reply within two working days.'],
  ['Which assets can I connect?', 'Current and savings accounts, brokerage and pension accounts, crypto wallets, property and private holdings — over 12,000 institutions across Europe.'],
  ['What does the card weigh?', 'Eighteen grams. It is cut from a single sheet of stainless steel and finished by hand in Pforzheim.'],
  ['Can I leave at any time?', 'Yes. There is no lock-in: cancel in the app and your plan ends at the close of the billing period.'],
];

const QUOTES = [
  ['“The first finance app that feels like it was designed by people who own a good watch.”', 'Helena R.', 'Founder, Zurich'],
  ['“My banker answered at 23:40 from another time zone. That is the product.”', 'Márton K.', 'Investor, Budapest'],
  ['“I closed three tabs and two spreadsheets. Everything finally lives in one quiet place.”', 'James W.', 'Partner, London'],
];

function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`au-wordmark ${className}`}>
      Vaulmere<span className="au-dot">.</span>
    </span>
  );
}

function Chip() {
  return (
    <svg viewBox="0 0 46 34" className="au-chip" aria-hidden>
      <rect x="0.5" y="0.5" width="45" height="33" rx="6" fill="url(#au-chip-g)" stroke="rgba(0,0,0,.25)" />
      <path d="M15 1v32M31 1v32M1 12h14M31 12h14M1 22h14M31 22h14M15 17h16" stroke="rgba(0,0,0,.28)" fill="none" />
      <defs>
        <linearGradient id="au-chip-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5e3b5" />
          <stop offset=".5" stopColor="#c7a35f" />
          <stop offset="1" stopColor="#efd9a6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MetalCard({ finish, small = false }: { finish: Finish; small?: boolean }) {
  return (
    <div className={`au-card ${small ? 'au-card--sm' : ''}`} data-finish={finish}>
      <div className="au-card-face">
        <div className="au-card-top">
          <Wordmark />
          <svg viewBox="0 0 24 24" className="au-nfc" aria-hidden>
            <path d="M8 6c2 3.6 2 8.4 0 12M12 4c2.8 4.8 2.8 11.2 0 16M16 2.5c3.4 6 3.4 13 0 19" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <Chip />
        <div className="au-card-bottom">
          <div>
            <div className="au-card-num">•••• 2048</div>
            <div className="au-card-name">E. VÁRADI</div>
          </div>
          <div className="au-card-tier">PRIVATE</div>
        </div>
        <span className="au-sheen" aria-hidden />
        <span className="au-sweep" aria-hidden />
      </div>
    </div>
  );
}

function Spark({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 120 36" className={`au-spark ${draw ? 'is-drawn' : ''}`} aria-hidden>
      <path d="M1 30 C 12 28, 18 22, 28 24 S 44 14, 54 17 S 72 8, 82 11 S 104 4, 119 2" />
    </svg>
  );
}

function Money({ value }: { value: number }) {
  return <>€{Math.round(value).toLocaleString('en-GB')}</>;
}

function Hero() {
  const area = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  usePointerTilt(area, tilt, 16);
  const [stageRef, seen] = useInView<HTMLDivElement>(0.2);
  const worth = useCountUp(4812390, seen, 2200);

  return (
    <header ref={area} className="au-hero" id="top">
      <div className="au-glow au-glow--a" aria-hidden />
      <div className="au-glow au-glow--b" aria-hidden />
      <div className="au-wrap au-hero-grid">
        <div className="au-hero-copy">
          <p className="au-pill" data-reveal>
            <span className="au-live" /> Private beta · London · Zurich · Budapest
          </p>
          <h1 className="au-h1" data-reveal style={{ '--d': '80ms' } as CSSProperties}>
            Wealth,
            <br />
            held <em>quietly.</em>
          </h1>
          <p className="au-lead" data-reveal style={{ '--d': '180ms' } as CSSProperties}>
            Every account, every asset and a private banker who knows your name — in one calm app, with a card cut from
            eighteen grams of steel.
          </p>
          <div className="au-cta-row" data-reveal style={{ '--d': '260ms' } as CSSProperties}>
            <a href="#invite" onClick={jump('invite')} className="au-btn au-btn--gold">
              Request an invitation <span aria-hidden>→</span>
            </a>
            <a href="#card" onClick={jump('card')} className="au-btn au-btn--ghost">
              See the card
            </a>
          </div>
          <dl className="au-hero-stats" data-reveal style={{ '--d': '340ms' } as CSSProperties}>
            <div>
              <dt>Assets connected</dt>
              <dd>€2.1bn</dd>
            </div>
            <div>
              <dt>Banker reply time</dt>
              <dd>11 min</dd>
            </div>
            <div>
              <dt>Member rating</dt>
              <dd>4.9 ★</dd>
            </div>
          </dl>
        </div>

        <div className="au-hero-stage" ref={stageRef}>
          <div className="au-tilt" ref={tilt}>
            <div className="au-float">
              <MetalCard finish="champagne" />
            </div>
            <div className="au-glass au-glass--worth">
              <div className="au-glass-label">Net worth</div>
              <div className="au-glass-value">
                <Money value={worth} />
              </div>
              <div className="au-glass-row">
                <span className="au-up">▲ 2.4%</span> <span>this month</span>
              </div>
              <Spark draw={seen} />
            </div>
            <div className="au-glass au-glass--concierge">
              <span className="au-avatar" aria-hidden>
                LB
              </span>
              <div>
                <div className="au-glass-label">Lena · your banker</div>
                <div className="au-glass-msg">Your table at Maison Calvène is confirmed for 8:30 pm.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a href="#story" onClick={jump('story')} className="au-scroll" aria-label="Scroll">
        <span />
      </a>
    </header>
  );
}

function Nav({ onInvite }: { onInvite: (e: React.MouseEvent) => void }) {
  const solid = useScrolledPast(30);
  return (
    <nav className={`au-nav ${solid ? 'is-solid' : ''}`} aria-label="Vaulmere">
      <div className="au-wrap au-nav-in">
        <a href="#top" onClick={jump('top')} aria-label="Vaulmere home">
          <Wordmark />
        </a>
        <div className="au-nav-links">
          {[
            ['card', 'The card'],
            ['app', 'The app'],
            ['membership', 'Membership'],
            ['faq', 'FAQ'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {label}
            </a>
          ))}
        </div>
        <a href="#invite" onClick={onInvite} className="au-btn au-btn--sm au-btn--line">
          Request invitation
        </a>
      </div>
    </nav>
  );
}

function Statement() {
  const text =
    'We built Vaulmere for people whose money already works hard — and who would rather it worked quietly. No noise, no confetti, no upsell. Just clarity, and someone to call.';
  const words = text.split(' ');
  return (
    <section className="au-statement" id="story">
      <div className="au-wrap">
        <p className="au-kicker" data-reveal>
          ( Our view )
        </p>
        <p className="au-big" data-reveal>
          {words.map((w, i) => (
            <span key={i} className="au-word" style={{ '--i': i } as CSSProperties}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

function Pillars() {
  const row = useRef<HTMLDivElement>(null);
  const items = [
    ['01', 'One view of everything', 'Bank accounts, brokers, pensions, property and crypto — reconciled every night into one honest number.'],
    ['02', 'A banker, not a bot', 'A named private banker with real authority, on chat, phone or in person. Average first reply: eleven minutes.'],
    ['03', 'Made to be kept', 'Eighteen grams of hand-finished steel, 0% FX worldwide and 1,400 airport lounges, without the plastic.'],
  ];
  return (
    <section className="au-pillars">
      <div className="au-wrap">
        <div className="au-pillars-grid lp-swipe" ref={row}>
          {items.map(([n, h, p], i) => (
            <article key={n} className="au-pillar" data-reveal style={{ '--d': `${i * 120}ms` } as CSSProperties}>
              <span className="au-num">{n}</span>
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

function CardSection() {
  const [finish, setFinish] = useState<Finish>('champagne');
  const area = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  usePointerTilt(area, tilt, 22);
  const [specRef, seen] = useInView<HTMLDListElement>(0.4);
  const grams = useCountUp(18, seen, 1200);
  const lounges = useCountUp(1400, seen, 1600);
  const current = FINISHES.find((f) => f.id === finish)!;
  return (
    <section className="au-cardsec" id="card" ref={area}>
      <div className="au-wrap au-cardsec-grid">
        <div className="au-cardsec-stage">
          <div className="au-ring" aria-hidden />
          <div className="au-tilt au-tilt--big" ref={tilt}>
            <MetalCard finish={finish} />
          </div>
          <div className="au-shadow" aria-hidden />
        </div>
        <div>
          <p className="au-kicker" data-reveal>
            ( The Vaulmere card )
          </p>
          <h2 className="au-h2" data-reveal>
            Cut from steel. <em>Finished by hand.</em>
          </h2>
          <p className="au-body" data-reveal>
            Each card is laser-cut from a single sheet of stainless steel, then brushed, coated and checked by hand. It
            lands on a table with a sound you will learn to like.
          </p>
          <div className="au-finishes lp-chips" role="radiogroup" aria-label="Card finish" data-reveal>
            {FINISHES.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={finish === f.id}
                onClick={() => setFinish(f.id)}
                className={`au-finish ${finish === f.id ? 'is-on' : ''}`}
              >
                <span className="au-swatch" data-finish={f.id} aria-hidden />
                {f.name}
              </button>
            ))}
          </div>
          <p className="au-finish-note" aria-live="polite">
            {current.name} — {current.note}
          </p>
          <dl className="au-specs" ref={specRef}>
            <div>
              <dt>Weight</dt>
              <dd>{Math.round(grams)} g</dd>
            </div>
            <div>
              <dt>FX fees</dt>
              <dd>0%</dd>
            </div>
            <div>
              <dt>Airport lounges</dt>
              <dd>{Math.round(lounges).toLocaleString('en-GB')}+</dd>
            </div>
            <div>
              <dt>Concierge</dt>
              <dd>24/7</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Bento() {
  const [chartRef, drawn] = useInView<HTMLDivElement>(0.35);
  const [range, setRange] = useState<'1M' | '1Y' | '5Y'>('1Y');
  const path = useMemo(
    () =>
      ({
        '1M': 'M0 120 C 40 112, 70 118, 110 100 S 180 96, 220 84 S 300 90, 340 70 S 410 60, 440 52',
        '1Y': 'M0 140 C 40 130, 70 120, 110 124 S 170 96, 210 92 S 280 70, 320 74 S 400 34, 440 24',
        '5Y': 'M0 150 C 50 148, 80 140, 120 132 S 190 128, 230 104 S 300 80, 340 60 S 410 26, 440 10',
      })[range],
    [range],
  );
  const gain = { '1M': '+2.4%', '1Y': '+14.8%', '5Y': '+61.2%' }[range];
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="au-bento-sec" id="app">
      <div className="au-wrap">
        <p className="au-kicker" data-reveal>
          ( The app )
        </p>
        <h2 className="au-h2 au-h2--center" data-reveal>
          Everything you own. <em>One calm screen.</em>
        </h2>
        <div className="au-bento">
          <article className="au-tile au-tile--chart" data-reveal ref={chartRef}>
            <div className="au-tile-head">
              <div>
                <div className="au-glass-label">Total wealth</div>
                <div className="au-tile-big">€4,812,390</div>
                <div className="au-up">▲ {gain}</div>
              </div>
              <div className="au-seg" role="tablist" aria-label="Range">
                {(['1M', '1Y', '5Y'] as const).map((r) => (
                  <button key={r} type="button" role="tab" aria-selected={range === r} className={range === r ? 'is-on' : ''} onClick={() => setRange(r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <svg viewBox="0 0 440 160" className={`au-chart ${drawn ? 'is-drawn' : ''}`} preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="au-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#C9A86A" stopOpacity=".35" />
                  <stop offset="1" stopColor="#C9A86A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path key={`a-${range}`} d={`${path} L440 160 L0 160 Z`} className="au-chart-area" fill="url(#au-area)" />
              <path key={range} d={path} className="au-chart-line" pathLength={1} />
            </svg>
            <ul className="au-alloc">
              {[
                ['Equities', 46],
                ['Property', 28],
                ['Bonds', 14],
                ['Cash', 8],
                ['Digital', 4],
              ].map(([k, v]) => (
                <li key={k}>
                  <span>{k}</span>
                  <i style={{ '--w': `${v}%` } as CSSProperties} className={drawn ? 'is-on' : ''} />
                  <b>{v}%</b>
                </li>
              ))}
            </ul>
          </article>

          {/* the four small tiles: part of the bento grid on larger screens (display: contents), a swipe row on phones */}
          <div className="au-bento-rest lp-swipe" ref={row}>
          <article className="au-tile au-tile--chat" data-reveal style={{ '--d': '100ms' } as CSSProperties}>
            <div className="au-glass-label">Private banker</div>
            <div className="au-bubbles">
              <p className="au-bubble au-bubble--me">Can we move €200k into the bond ladder before Friday?</p>
              <p className="au-bubble">Done — staggered over 4 maturities. I have sent the summary to your accountant too.</p>
              <p className="au-typing" aria-hidden>
                <span />
                <span />
                <span />
              </p>
            </div>
          </article>

          <article className="au-tile au-tile--secure" data-reveal style={{ '--d': '160ms' } as CSSProperties}>
            <div className="au-lock" aria-hidden>
              <svg viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" className="au-lock-ring" />
                <path d="M23 29v-5a9 9 0 0 1 18 0v5" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="20" y="29" width="24" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3>Held in your name</h3>
            <p>Assets sit with regulated custodians, ring-fenced from Vaulmere. Biometric sign-in, hardware keys, zero ads.</p>
          </article>

          <article className="au-tile au-tile--world" data-reveal style={{ '--d': '220ms' } as CSSProperties}>
            <div className="au-glass-label">Spend anywhere</div>
            <div className="au-tile-big">0% FX</div>
            <p>In 150+ currencies, at the real exchange rate.</p>
            <div className="au-dots" aria-hidden>
              {Array.from({ length: 60 }, (_, i) => (
                <i key={i} style={{ '--i': i } as CSSProperties} />
              ))}
            </div>
          </article>

          <article className="au-tile au-tile--family" data-reveal style={{ '--d': '280ms' } as CSSProperties}>
            <div className="au-glass-label">Family vaults</div>
            <div className="au-faces" aria-hidden>
              {['EV', 'MV', 'AV', '+2'].map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
            <p>Share what you choose, with who you choose — down to a single account.</p>
          </article>
          </div>
        </div>
        <SwipeDots row={row} count={4} />
      </div>
    </section>
  );
}

function Membership({ onPick }: { onPick: (tier: string) => void }) {
  const [yearly, setYearly] = useState(true);
  const phone = useLandingPhone();
  const row = useRef<HTMLDivElement>(null);
  // on phones the plans are a swipe row: open it on the featured plan
  useEffect(() => {
    const el = row.current;
    const featured = el?.querySelector<HTMLElement>('.is-featured');
    if (!phone || !el || !featured) return;
    el.scrollLeft = featured.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || '0');
  }, [phone]);
  return (
    <section className="au-member" id="membership">
      <div className="au-wrap">
        <p className="au-kicker au-center" data-reveal>
          ( Membership )
        </p>
        <h2 className="au-h2 au-h2--center" data-reveal>
          Three ways in. <em>No small print.</em>
        </h2>
        <div className="au-billing" data-reveal>
          <button type="button" className={!yearly ? 'is-on' : ''} onClick={() => setYearly(false)} aria-pressed={!yearly}>
            Monthly
          </button>
          <button type="button" className={yearly ? 'is-on' : ''} onClick={() => setYearly(true)} aria-pressed={yearly}>
            Yearly <span>2 months free</span>
          </button>
        </div>
        <div className="au-tiers lp-swipe" ref={row}>
          {TIERS.map((tier, i) => {
            const price = yearly ? Math.round((tier.monthly * 10) / 12) : tier.monthly;
            return (
              <article key={tier.name} className={`au-tier ${tier.featured ? 'is-featured' : ''}`} data-reveal style={{ '--d': `${i * 110}ms` } as CSSProperties}>
                {tier.featured && <span className="au-badge">Most chosen</span>}
                <h3>{tier.name}</h3>
                <p className="au-tier-blurb">{tier.blurb}</p>
                <div className="au-price">
                  <span className="au-price-n">€{price}</span>
                  <span className="au-price-u">{tier.monthly ? '/ month' : 'forever'}</span>
                </div>
                <p className="au-price-sub">{tier.monthly ? (yearly ? `billed €${tier.monthly * 10} yearly` : 'billed monthly') : 'no card needed'}</p>
                <ul>
                  {tier.perks.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <button type="button" className={`au-btn ${tier.featured ? 'au-btn--gold' : 'au-btn--line'} au-btn--block`} onClick={() => onPick(tier.name)}>
                  Choose {tier.name}
                </button>
              </article>
            );
          })}
        </div>
        <SwipeDots row={row} count={TIERS.length} />
      </div>
    </section>
  );
}

function Quotes() {
  const [i, setI] = useState(0);
  const [q, who, where] = QUOTES[i];
  const startX = useRef<number | null>(null);
  return (
    <section className="au-quotes">
      <div
        className="au-wrap au-quotes-in"
        data-reveal
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) setI((n) => (n + (dx < 0 ? 1 : QUOTES.length - 1)) % QUOTES.length);
        }}
      >
        <blockquote key={i} className="au-quote">
          <p>{q}</p>
          <footer>
            {who} <span>· {where}</span>
          </footer>
        </blockquote>
        <div className="au-quote-nav">
          {QUOTES.map((_, n) => (
            <button key={n} type="button" aria-label={`Quote ${n + 1}`} aria-current={n === i} className={n === i ? 'is-on' : ''} onClick={() => setI(n)} />
          ))}
        </div>
        <p className="au-fine">Members’ quotes are fictional — Vaulmere is a design showcase.</p>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="au-faq" id="faq">
      <div className="au-wrap au-faq-grid">
        <div>
          <p className="au-kicker" data-reveal>
            ( Questions )
          </p>
          <h2 className="au-h2" data-reveal>
            Asked, <em>answered.</em>
          </h2>
        </div>
        <div className="au-acc">
          {FAQ.map(([q, a], n) => (
            <div key={q} className={`au-acc-item ${open === n ? 'is-open' : ''}`} data-reveal style={{ '--d': `${n * 60}ms` } as CSSProperties}>
              <button type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                {q}
                <span aria-hidden />
              </button>
              <div className="au-acc-body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InviteForm({ notify, id = 'au-email', className = '', onDone }: { notify: (m: string) => void; id?: string; className?: string; onDone?: () => void }) {
  const [email, setEmail] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify('Please enter a valid email address.');
      return;
    }
    setEmail('');
    onDone?.();
    notify('You are on the list. (Design showcase — nothing was sent.)');
  };
  return (
    <form className={`au-form ${className}`} onSubmit={submit} data-reveal={onDone ? undefined : ''} noValidate>
      <label className="sr-only" htmlFor={id}>
        Email address
      </label>
      <input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" autoComplete="email" />
      <button type="submit" className="au-btn au-btn--gold">
        Request invitation
      </button>
    </form>
  );
}

function Invite({ notify }: { notify: (m: string) => void }) {
  return (
    <section className="au-invite" id="invite">
      <div className="au-glow au-glow--c" aria-hidden />
      <div className="au-wrap au-invite-in">
        <div className="au-mini-card" data-reveal aria-hidden>
          <MetalCard finish="obsidian" small />
        </div>
        <h2 className="au-h1 au-h1--mid" data-reveal>
          Your invitation <em>is waiting.</em>
        </h2>
        <p className="au-lead au-center" data-reveal>
          We open a limited number of memberships each month. Leave your email and we will be in touch personally.
        </p>
        <InviteForm notify={notify} />
      </div>
    </section>
  );
}

function Footer() {
  const cols: Array<[string, string[]]> = [
    ['Vaulmere', ['The card', 'The app', 'Membership', 'Security']],
    ['Company', ['About', 'Careers', 'Press', 'Journal']],
    ['Help', ['Contact', 'Status', 'Legal', 'Privacy']],
  ];
  return (
    <footer className="au-footer">
      <div className="au-wrap">
        <div className="au-footer-grid">
          <div>
            <Wordmark className="au-wordmark--xl" />
            <p className="au-fine">London · Zurich · Budapest</p>
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
        <div className="au-footer-base">
          <span>© {new Date().getFullYear()} Vaulmere</span>
          <span>Vaulmere is a fictional brand — a landing page concept by David Mészáros. Not a financial product.</span>
        </div>
      </div>
    </footer>
  );
}

function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="au-marquee" aria-hidden>
      <div className="au-marquee-track">
        {children}
        {children}
      </div>
    </div>
  );
}

/** phones: the invitation form as a bottom sheet (opened from the tab bar or a plan) */
function InviteSheet({ open, plan, onClose, notify }: { open: boolean; plan: string; onClose: () => void; notify: (m: string) => void }) {
  return (
    <AppSheet open={open} title="Request an invitation" onClose={onClose}>
      <div className="au-sheet">
        <div className="au-sheet-card" aria-hidden>
          <MetalCard finish="obsidian" small />
        </div>
        {plan && (
          <p className="au-sheet-plan">
            <span>Membership</span> <b>{plan}</b>
          </p>
        )}
        <p className="au-sheet-copy">We open a limited number of memberships each month. Leave your email and we will be in touch personally.</p>
        <InviteForm notify={notify} id="au-email-sheet" className="au-form--sheet" onDone={onClose} />
        <p className="au-fine">A member of the team replies within two working days.</p>
      </div>
    </AppSheet>
  );
}

export default function Vaulmere() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [toast, notify] = useToast();
  const phone = useLandingPhone();
  const [sheet, setSheet] = useState<{ open: boolean; plan: string }>({ open: false, plan: '' });
  const openInvite = (plan = '') => setSheet({ open: true, plan });
  const closeInvite = useMemo(() => () => setSheet((s) => ({ ...s, open: false })), []);
  return (
    <div ref={root} className="aurel">
      <Nav onInvite={jump('invite')} />
      <Hero />
      <section className="au-press">
        <p className="au-press-label">As featured in</p>
        <Marquee>
          {PRESS.map((p, i) => (
            <span key={p} className={`au-press-item au-press-item--${i % 3}`}>
              {p}
            </span>
          ))}
        </Marquee>
      </section>
      <Statement />
      <Pillars />
      <CardSection />
      <Bento />
      <Membership onPick={(tier) => (phone ? openInvite(tier) : notify(`${tier} selected — this is a design showcase, nothing is charged.`))} />
      <Quotes />
      <Faq />
      <Invite notify={notify} />
      <Footer />
      <div className={`au-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
      <InviteSheet open={sheet.open} plan={sheet.plan} onClose={closeInvite} notify={notify} />
      <AppTabBar
        tabs={[
          { id: 'top', label: 'Home', icon: <AppIcons.home /> },
          { id: 'card', label: 'Card', icon: <AppIcons.card /> },
          { id: 'app', label: 'App', icon: <AppIcons.grid /> },
          { id: 'membership', label: 'Plans', icon: <AppIcons.star /> },
        ]}
        action={{ label: 'Invite', icon: <AppIcons.key />, onClick: () => openInvite() }}
      />
    </div>
  );
}
