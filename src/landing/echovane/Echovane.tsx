import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import '@fontsource-variable/bricolage-grotesque';
import './echovane.css';
import { jump, reducedMotion, useCountUp, useInView, useReveal, useScrolledPast, useToast } from '../kit';
import { AppIcons, AppSheet, AppTabBar, SwipeDots, useLandingPhone } from '../appKit';

/**
 * Echovane — a fictional AI meeting assistant.
 * Landing page 05 of the showcase: night-sky SaaS with an aurora, and a product UI
 * that writes the meeting summary and action items in front of you.
 */

const PEOPLE = [
  { id: 'AM', name: 'Anna M.', hue: 262 },
  { id: 'DK', name: 'Dávid K.', hue: 190 },
  { id: 'SO', name: 'Sara O.', hue: 330 },
  { id: 'TB', name: 'Tom B.', hue: 40 },
];

type Line = { who: number; text: string; summary?: string; action?: { text: string; owner: string; due: string } };
const SCRIPT: Line[] = [
  { who: 0, text: 'Quick one — are we still on track to ship the new onboarding on the 24th?' },
  { who: 1, text: 'Engineering is done. QA found two blockers in the invite flow, both fixed by Thursday.', summary: 'Onboarding release stays on the 24th; two QA blockers to be fixed by Thursday.' },
  { who: 2, text: 'I need the final copy for the welcome emails by Wednesday to translate them.', action: { text: 'Send final welcome-email copy for translation', owner: 'TB', due: 'Wed' } },
  { who: 3, text: 'I can do that. Also, should we A/B test the checklist against the video?', summary: 'Team will A/B test the onboarding checklist against the intro video.' },
  { who: 0, text: 'Yes — 50/50 split for two weeks, and Dávid owns the dashboard.', action: { text: 'Set up A/B dashboard for checklist vs video', owner: 'DK', due: 'Fri' } },
  { who: 1, text: 'On it. I will share the link in the channel once it is live.', summary: 'Results reviewed in two weeks; dashboard shared in the team channel.' },
];

// invented company names (checked so they do not belong to real companies)
const LOGOS = ['nimbrel', 'OSTRAVEL', 'Varnick', 'pellorin', 'QUENDO', 'thessel', 'Ambrell', 'corvane.'];

const TIERS = [
  { name: 'Free', m: 0, y: 0, note: 'For trying it on your own calls', perks: ['20 meetings a month', 'Summaries and action items', '7-day history'] },
  { name: 'Pro', m: 18, y: 14, note: 'For people who live in meetings', perks: ['Unlimited meetings', 'Ask Echovane across all calls', 'Follow-up emails in one click', 'CRM and docs sync'], featured: true },
  { name: 'Business', m: 32, y: 26, note: 'For teams that need one source of truth', perks: ['Everything in Pro', 'Shared team library', 'Speaker insights and coaching', 'SSO and admin controls'] },
];

const FAQ = [
  ['Does Echovane join my calls as a bot?', 'You choose: a quiet bot that joins from your calendar, or the desktop app that listens locally with no bot in the room.'],
  ['Which languages does it understand?', 'Over 40, including mixed-language calls. Summaries can be written in a different language from the meeting.'],
  ['Where is my data stored?', 'In the EU by default, encrypted at rest and in transit. We never train models on your meetings.'],
  ['Can I try it without a card?', 'Yes. The Free plan needs no card, and every paid plan starts with a 14-day trial.'],
];

const QUOTES = [
  ['We stopped writing meeting notes in March. Nobody has missed them — the action items actually get done now.', 'Lea Fischer', 'COO, Nimbrel', 'LF'],
  ['Ask Echovane is the feature I did not know I needed. “What did the client say about pricing?” — answered in a second.', 'Bence Varga', 'Head of Sales, Varnick', 'BV'],
  ['It handles our Hungarian–English calls better than any tool we tried, and the summaries read like a person wrote them.', 'Priya Nair', 'Product Lead, Pellorin', 'PN'],
];

function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`lu-logo ${className}`}>
      <svg viewBox="0 0 32 32" aria-hidden>
        <defs>
          <linearGradient id="ev-logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B9A8FF" />
            <stop offset="1" stopColor="#5CE1E6" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="7" fill="url(#ev-logo-g)" />
        <path d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l2.8 2.8M23.2 23.2 26 26M26 6l-2.8 2.8M8.8 23.2 6 26" stroke="url(#ev-logo-g)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Echovane
    </span>
  );
}

function Avatar({ id, speaking = false, size = 'md' }: { id: string; speaking?: boolean; size?: 'sm' | 'md' }) {
  const p = PEOPLE.find((x) => x.id === id) ?? { hue: 260 };
  return (
    <span className={`lu-av lu-av--${size} ${speaking ? 'is-speaking' : ''}`} style={{ '--h': p.hue } as CSSProperties} aria-hidden>
      {id}
    </span>
  );
}

/** the product demo: transcript types itself, the summary and tasks fill in as it goes */
function ProductDemo() {
  const [ref, seen] = useInView<HTMLDivElement>(0.25);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [chars, setChars] = useState(0);
  const [tab, setTab] = useState<'summary' | 'actions'>('summary');
  const [done, setDone] = useState<Record<number, boolean>>({});

  // keep running only while on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    if (reducedMotion()) {
      setStep(SCRIPT.length);
      return;
    }
    if (!visible || !seen) return;
    const id = window.setInterval(() => {
      setChars((c) => {
        const line = SCRIPT[step];
        if (!line) return c;
        if (c < line.text.length) return c + 2;
        return c;
      });
    }, 22);
    return () => window.clearInterval(id);
  }, [visible, seen, step]);

  // advance to the next line after a short pause; loop after a longer one
  useEffect(() => {
    if (reducedMotion()) return;
    const line = SCRIPT[step];
    if (!line) {
      const t = window.setTimeout(() => {
        setStep(0);
        setChars(0);
        setDone({});
      }, 5200);
      return () => window.clearTimeout(t);
    }
    if (chars >= line.text.length) {
      const t = window.setTimeout(() => {
        setStep((s) => s + 1);
        setChars(0);
      }, 650);
      return () => window.clearTimeout(t);
    }
  }, [chars, step]);

  const shown = SCRIPT.slice(0, step);
  const current = SCRIPT[step];
  const summary = shown.filter((l) => l.summary);
  const actions = shown.filter((l) => l.action);
  const speaker = current ? PEOPLE[current.who].id : '';
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [step, chars]);

  return (
    <div className="lu-app" ref={ref}>
      <div className="lu-app-bar">
        <span className="lu-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="lu-app-title">Weekly product sync</span>
        <span className="lu-rec">
          <i /> REC 32:14
        </span>
      </div>
      <div className="lu-app-body">
        <aside className="lu-people">
          <div className="lu-label">In the call</div>
          {PEOPLE.map((p) => (
            <div key={p.id} className={`lu-person ${speaker === p.id ? 'is-on' : ''}`}>
              <Avatar id={p.id} speaking={speaker === p.id} />
              <span>{p.name}</span>
              <span className="lu-wave" aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
          ))}
        </aside>
        <div className="lu-transcript" ref={scroller}>
          <div className="lu-label">Live transcript</div>
          {shown.map((l, i) => (
            <p key={i} className="lu-line">
              <Avatar id={PEOPLE[l.who].id} size="sm" />
              <span>
                <b>{PEOPLE[l.who].name}</b> {l.text}
              </span>
            </p>
          ))}
          {current && (
            <p className="lu-line is-live">
              <Avatar id={PEOPLE[current.who].id} size="sm" />
              <span>
                <b>{PEOPLE[current.who].name}</b> {current.text.slice(0, chars)}
                <span className="lu-caret" />
              </span>
            </p>
          )}
        </div>
        <section className="lu-panel" aria-label="Echovane notes">
          <div className="lu-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'summary'} className={tab === 'summary' ? 'is-on' : ''} onClick={() => setTab('summary')}>
              Summary <span>{summary.length}</span>
            </button>
            <button type="button" role="tab" aria-selected={tab === 'actions'} className={tab === 'actions' ? 'is-on' : ''} onClick={() => setTab('actions')}>
              Action items <span>{actions.length}</span>
            </button>
          </div>
          {tab === 'summary' ? (
            <ul className="lu-notes">
              {summary.length === 0 && <li className="lu-wait">Listening…</li>}
              {summary.map((l) => (
                <li key={l.summary} className="lu-note">
                  <span className="lu-spark" aria-hidden>
                    ✦
                  </span>
                  {l.summary}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="lu-notes">
              {actions.length === 0 && <li className="lu-wait">No tasks yet…</li>}
              {actions.map((l, i) => (
                <li key={l.action!.text} className={`lu-task ${done[i] ? 'is-done' : ''}`}>
                  <button type="button" aria-pressed={!!done[i]} onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))} aria-label="Mark done" />
                  <span>{l.action!.text}</span>
                  <Avatar id={l.action!.owner} size="sm" />
                  <em>{l.action!.due}</em>
                </li>
              ))}
            </ul>
          )}
          <div className="lu-panel-foot">
            <span>✦ Written by Echovane</span>
            <span>Synced to Docs</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function Nav() {
  const solid = useScrolledPast(30);
  return (
    <nav className={`lu-nav ${solid ? 'is-solid' : ''}`} aria-label="Echovane">
      <div className="lu-wrap lu-nav-in">
        <a href="#top" onClick={jump('top')} aria-label="Echovane home">
          <Logo />
        </a>
        <div className="lu-nav-links">
          {[
            ['how', 'Product'],
            ['features', 'Features'],
            ['pricing', 'Pricing'],
            ['faq', 'FAQ'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {label}
            </a>
          ))}
        </div>
        <a href="#start" onClick={jump('start')} className="lu-btn lu-btn--sm lu-btn--light">
          Start free
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="lu-hero" id="top">
      <div className="lu-aurora" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="lu-stars" aria-hidden />
      <div className="lu-wrap lu-hero-in">
        <a href="#features" onClick={jump('features')} className="lu-chip" data-reveal>
          <span className="lu-chip-new">New</span> Ask Echovane — search every meeting you have ever had <span aria-hidden>→</span>
        </a>
        <h1 className="lu-h1" data-reveal style={{ '--d': '80ms' } as CSSProperties}>
          Every meeting,
          <br />
          <span className="lu-grad">already written up.</span>
        </h1>
        <p className="lu-lead" data-reveal style={{ '--d': '160ms' } as CSSProperties}>
          Echovane listens to your calls, writes the summary, assigns the action items and drafts the follow-up — before
          you have closed the tab.
        </p>
        <div className="lu-cta" data-reveal style={{ '--d': '240ms' } as CSSProperties}>
          <a href="#start" onClick={jump('start')} className="lu-btn lu-btn--grad">
            Start free — no card
          </a>
          <a href="#how" onClick={jump('how')} className="lu-btn lu-btn--ghost">
            <span className="lu-play" aria-hidden /> See how it works
          </a>
        </div>
        <p className="lu-trust" data-reveal style={{ '--d': '300ms' } as CSSProperties}>
          SOC 2 Type II · GDPR · EU data residency · 40+ languages
        </p>
        <div className="lu-stage">
          <div className="lu-stage-glow" aria-hidden />
          <ProductDemo />
        </div>
      </div>
    </header>
  );
}

function Logos() {
  return (
    <section className="lu-logos">
      <p>Trusted by 4,800 teams who would rather be building</p>
      <div className="lu-marquee" aria-hidden>
        <div className="lu-marquee-track">
          {[...LOGOS, ...LOGOS].map((l, i) => (
            <span key={i} className={`lu-logo-item lu-logo-item--${i % 4}`}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ['Listen', 'Echovane joins from your calendar or listens on your desktop — no bot required. It knows who is speaking.', 'wave'],
    ['Understand', 'Decisions, risks and owners are pulled out of the conversation, not just keywords.', 'mark'],
    ['Act', 'Tasks land in your tracker, notes in your docs and a follow-up email in your drafts.', 'check'],
  ];
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="lu-how" id="how">
      <div className="lu-wrap">
        <p className="lu-kicker" data-reveal>
          How it works
        </p>
        <h2 className="lu-h2" data-reveal>
          From talk to done, <span className="lu-grad">in three quiet steps.</span>
        </h2>
        <div className="lu-steps lp-swipe" ref={row}>
          {steps.map(([h, p, kind], i) => (
            <article key={h} className="lu-step" data-reveal style={{ '--d': `${i * 120}ms` } as CSSProperties}>
              <div className={`lu-step-vis lu-step-vis--${kind}`} aria-hidden>
                {kind === 'wave' && Array.from({ length: 28 }, (_, n) => <i key={n} style={{ '--i': n } as CSSProperties} />)}
                {kind === 'mark' && (
                  <p>
                    …so we <mark>ship on the 24th</mark> and <mark>Tom owns the copy</mark>…
                  </p>
                )}
                {kind === 'check' && (
                  <ul>
                    <li>Welcome-email copy</li>
                    <li>A/B dashboard</li>
                    <li>Share results</li>
                  </ul>
                )}
              </div>
              <span className="lu-step-n">0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <SwipeDots row={row} count={steps.length} />
      </div>
    </section>
  );
}

const ASK = {
  q: 'What did we decide about the onboarding launch?',
  a: 'You agreed to ship on the 24th after fixing two QA blockers, and to A/B test the checklist against the intro video for two weeks.',
};

function AskTile() {
  const [ref, seen] = useInView<HTMLElement>(0.4);
  const [n, setN] = useState(0);
  const [answer, setAnswer] = useState(false);
  useEffect(() => {
    if (!seen) return;
    if (reducedMotion()) {
      setN(ASK.q.length);
      setAnswer(true);
      return;
    }
    if (n < ASK.q.length) {
      const t = window.setTimeout(() => setN(n + 1), 32);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setAnswer(true), 500);
    return () => window.clearTimeout(t);
  }, [seen, n]);
  return (
    <article ref={ref} className="lu-tile lu-tile--ask" data-reveal>
      <div className="lu-label">Ask Echovane</div>
      <h3>Search every meeting like you search your inbox.</h3>
      <div className="lu-ask">
        <div className="lu-ask-q">
          <span className="lu-spark" aria-hidden>
            ✦
          </span>
          {ASK.q.slice(0, n)}
          {!answer && <span className="lu-caret" />}
        </div>
        <div className={`lu-ask-a ${answer ? 'is-on' : ''}`}>
          <p>{ASK.a}</p>
          <div className="lu-cites">
            <span>Product sync · 12 Sep · 04:18</span>
            <span>Product sync · 12 Sep · 11:02</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function TalkTile() {
  const [ref, seen] = useInView<HTMLElement>(0.4);
  const parts = [
    ['Anna', 34, '#8B7CFF'],
    ['Dávid', 28, '#5CE1E6'],
    ['Sara', 22, '#F28FCB'],
    ['Tom', 16, '#F5C26B'],
  ] as const;
  let acc = 0;
  return (
    <article ref={ref} className="lu-tile lu-tile--talk" data-reveal style={{ '--d': '80ms' } as CSSProperties}>
      <div className="lu-label">Speaker insights</div>
      <div className="lu-donut-row">
        <svg viewBox="0 0 120 120" className={`lu-donut ${seen ? 'is-on' : ''}`} aria-hidden>
          {parts.map(([k, v, c]) => {
            const el = (
              <circle key={k} cx="60" cy="60" r="46" pathLength={100} stroke={c} style={{ '--off': -acc, '--len': v - 1.5 } as CSSProperties} />
            );
            acc += v;
            return el;
          })}
        </svg>
        <ul>
          {parts.map(([k, v, c]) => (
            <li key={k}>
              <i style={{ background: c }} />
              {k}
              <b>{v}%</b>
            </li>
          ))}
        </ul>
      </div>
      <p>Talk time, questions asked and monologues — gentle coaching, only for you.</p>
    </article>
  );
}

const HELLOS = ['Hello', 'Szia', 'Hallo', 'Bonjour', 'Hola', 'Ciao', 'Cześć', 'Olá'];
function LangTile() {
  const [i, setI] = useState(0);
  const [ref, seen] = useInView<HTMLElement>(0.3);
  useEffect(() => {
    if (!seen || reducedMotion()) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % HELLOS.length), 1500);
    return () => window.clearInterval(t);
  }, [seen]);
  return (
    <article ref={ref} className="lu-tile lu-tile--lang" data-reveal style={{ '--d': '140ms' } as CSSProperties}>
      <div className="lu-label">40+ languages</div>
      <div className="lu-hello" aria-live="off">
        <span key={i} className={seen && !reducedMotion() ? 'is-run' : ''}>
          {HELLOS[i]}
        </span>
      </div>
      <p>Mixed-language calls included. Summaries in the language you read best.</p>
    </article>
  );
}

function SyncTile() {
  const apps = ['Calendar', 'CRM', 'Docs', 'Chat', 'Tasks', 'Email'];
  return (
    <article className="lu-tile lu-tile--sync" data-reveal style={{ '--d': '200ms' } as CSSProperties}>
      <div className="lu-label">Works with your stack</div>
      <div className="lu-orbit" aria-hidden>
        <span className="lu-orbit-core">
          <Logo className="lu-logo--mark" />
        </span>
        <div className="lu-orbit-ring">
          {apps.map((a, n) => (
            <span key={a} style={{ '--n': n } as CSSProperties}>
              <b>{a}</b>
            </span>
          ))}
        </div>
      </div>
      <p>Two-way sync with the tools you already use. Set it up once.</p>
    </article>
  );
}

function MailTile() {
  return (
    <article className="lu-tile lu-tile--mail" data-reveal style={{ '--d': '260ms' } as CSSProperties}>
      <div className="lu-label">Follow-up, drafted</div>
      <div className="lu-mail">
        <div className="lu-mail-head">
          <span>To: team@nimbrel.example</span>
          <span>Recap: Weekly product sync</span>
        </div>
        <p>
          Hi all — thanks for today. We are shipping onboarding on the <b>24th</b>. Tom sends the email copy by{' '}
          <b>Wednesday</b>; Dávid sets up the A/B dashboard by <b>Friday</b>.
        </p>
        <span className="lu-send">Send ↗</span>
      </div>
    </article>
  );
}

function Stats() {
  const [ref, seen] = useInView<HTMLDivElement>(0.4);
  const h = useCountUp(6.2, seen, 1600);
  const pct = useCountUp(93, seen, 1600);
  const teams = useCountUp(4800, seen, 1800);
  return (
    <section className="lu-stats">
      <div className="lu-wrap lu-stats-in" ref={ref}>
        <div data-reveal>
          <b>{h.toFixed(1)}h</b>
          <span>saved per person, every month</span>
        </div>
        <div data-reveal style={{ '--d': '100ms' } as CSSProperties}>
          <b>{Math.round(pct)}%</b>
          <span>of action items closed on time</span>
        </div>
        <div data-reveal style={{ '--d': '200ms' } as CSSProperties}>
          <b>{Math.round(teams).toLocaleString('en-US')}</b>
          <span>teams, from startups to banks</span>
        </div>
      </div>
    </section>
  );
}

function Pricing({
  notify,
  yearly,
  setYearly,
  onPick,
}: {
  notify: (m: string) => void;
  yearly: boolean;
  setYearly: (f: (y: boolean) => boolean) => void;
  /** phones: open the sign-up sheet with this plan instead of the toast */
  onPick?: (plan: string) => void;
}) {
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="lu-pricing" id="pricing">
      <div className="lu-wrap">
        <p className="lu-kicker lu-c" data-reveal>
          Pricing
        </p>
        <h2 className="lu-h2 lu-c" data-reveal>
          Simple plans. <span className="lu-grad">Cancel any time.</span>
        </h2>
        <div className="lu-switch" data-reveal>
          <span className={!yearly ? 'is-on' : ''}>Monthly</span>
          <button type="button" role="switch" aria-checked={yearly} aria-label="Bill yearly" onClick={() => setYearly((y) => !y)} className={yearly ? 'is-on' : ''}>
            <i />
          </button>
          <span className={yearly ? 'is-on' : ''}>
            Yearly <em>save 20%</em>
          </span>
        </div>
        <div className="lu-tiers lp-swipe" ref={row}>
          {TIERS.map((t, i) => (
            <article key={t.name} className={`lu-tier ${t.featured ? 'is-featured' : ''}`} data-reveal style={{ '--d': `${i * 100}ms` } as CSSProperties}>
              {t.featured && <span className="lu-pop">Most popular</span>}
              <h3>{t.name}</h3>
              <p className="lu-tier-note">{t.note}</p>
              <div className="lu-price">
                <b>${yearly ? t.y : t.m}</b>
                <span>{t.m ? 'per user / month' : 'forever'}</span>
              </div>
              <button type="button" className={`lu-btn lu-btn--block ${t.featured ? 'lu-btn--grad' : 'lu-btn--ghost'}`} onClick={() => (onPick ? onPick(t.name) : notify(`${t.name} plan picked — this is a design showcase, nothing is charged.`))}>
                {t.m ? 'Start 14-day trial' : 'Start free'}
              </button>
              <ul>
                {t.perks.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <SwipeDots row={row} count={TIERS.length} />
        <div className="lu-enterprise" data-reveal>
          <div>
            <h3>Enterprise</h3>
            <p>Private deployment, custom retention, audit logs and a named success manager.</p>
          </div>
          <button type="button" className="lu-btn lu-btn--ghost" onClick={() => notify('Thanks — this is a design showcase, no one will call you.')}>
            Talk to sales
          </button>
        </div>
      </div>
    </section>
  );
}

function Quotes() {
  const row = useRef<HTMLDivElement>(null);
  return (
    <section className="lu-quotes">
      <div className="lu-wrap">
        <h2 className="lu-h2 lu-c" data-reveal>
          Teams that <span className="lu-grad">stopped taking notes.</span>
        </h2>
        <div className="lu-quote-grid lp-swipe" ref={row}>
          {QUOTES.map(([q, who, role, ini], i) => (
            <figure key={who} className="lu-quote" data-reveal style={{ '--d': `${i * 100}ms` } as CSSProperties}>
              <blockquote>“{q}”</blockquote>
              <figcaption>
                <span className="lu-av lu-av--md" style={{ '--h': 220 + i * 50 } as CSSProperties} aria-hidden>
                  {ini}
                </span>
                <span>
                  <b>{who}</b>
                  <em>{role}</em>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <SwipeDots row={row} count={QUOTES.length} />
        <p className="lu-fine lu-c">Quotes and companies are fictional — Echovane is a design showcase.</p>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="lu-faq" id="faq">
      <div className="lu-wrap lu-faq-in">
        <h2 className="lu-h2" data-reveal>
          Questions, <span className="lu-grad">answered.</span>
        </h2>
        <div>
          {FAQ.map(([q, a], n) => (
            <div key={q} className={`lu-acc ${open === n ? 'is-open' : ''}`} data-reveal style={{ '--d': `${n * 60}ms` } as CSSProperties}>
              <button type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                {q}
                <i aria-hidden />
              </button>
              <div className="lu-acc-body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** the work-email form (inline in the closing section, and inside the phone sign-up sheet) */
function SignupForm({ notify, id, cta = 'Start free', onDone, reveal = true }: { notify: (m: string) => void; id: string; cta?: string; onDone?: () => void; reveal?: boolean }) {
  const [email, setEmail] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify('Please enter a valid work email.');
      return;
    }
    setEmail('');
    notify('Check your inbox! (Design showcase — nothing was sent.)');
    onDone?.();
  };
  return (
    <form className="lu-form" onSubmit={submit} noValidate data-reveal={reveal ? '' : undefined}>
      <label htmlFor={id} className="sr-only">
        Work email
      </label>
      <input id={id} type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <button type="submit" className="lu-btn lu-btn--grad">
        {cta}
      </button>
    </form>
  );
}

function Start({ notify }: { notify: (m: string) => void }) {
  return (
    <section className="lu-start" id="start">
      <div className="lu-aurora lu-aurora--low" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="lu-wrap lu-start-in">
        <h2 className="lu-h1 lu-h1--mid" data-reveal>
          Your next meeting <span className="lu-grad">writes itself.</span>
        </h2>
        <p className="lu-lead" data-reveal>
          Free for 20 meetings a month. Set up in two minutes, no card needed.
        </p>
        <SignupForm notify={notify} id="lu-email" />
      </div>
    </section>
  );
}

/** phones: the "Start" sheet — pick a plan and billing, then the same email form */
function StartSheet({
  open,
  onClose,
  plan,
  setPlan,
  yearly,
  setYearly,
  notify,
}: {
  open: boolean;
  onClose: () => void;
  plan: string;
  setPlan: (p: string) => void;
  yearly: boolean;
  setYearly: (f: (y: boolean) => boolean) => void;
  notify: (m: string) => void;
}) {
  const t = TIERS.find((x) => x.name === plan) ?? TIERS[1];
  const price = yearly ? t.y : t.m;
  return (
    <AppSheet open={open} title="Start with Echovane" onClose={onClose}>
      <div className="lu-sheet-label">Plan</div>
      <div className="lu-seg" role="radiogroup" aria-label="Plan">
        {TIERS.map((x) => (
          <button key={x.name} type="button" role="radio" aria-checked={x.name === plan} className={x.name === plan ? 'is-on' : ''} onClick={() => setPlan(x.name)}>
            {x.name}
          </button>
        ))}
      </div>
      {t.m > 0 && (
        <>
          <div className="lu-sheet-label">Billing</div>
          <div className="lu-seg" role="radiogroup" aria-label="Billing">
            <button type="button" role="radio" aria-checked={!yearly} className={!yearly ? 'is-on' : ''} onClick={() => setYearly(() => false)}>
              Monthly
            </button>
            <button type="button" role="radio" aria-checked={yearly} className={yearly ? 'is-on' : ''} onClick={() => setYearly(() => true)}>
              Yearly <em>−20%</em>
            </button>
          </div>
        </>
      )}
      <div className="lu-sheet-sum">
        <div>
          <b>{t.name}</b>
          <span>{t.note}</span>
        </div>
        <div className="lu-sheet-price">
          <b>${price}</b>
          <span>{t.m ? 'per user / mo' : 'forever'}</span>
        </div>
      </div>
      <ul className="lu-sheet-perks">
        {t.perks.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <SignupForm notify={notify} id="lu-email-sheet" reveal={false} cta={t.m ? 'Start 14-day trial' : 'Start free'} onDone={onClose} />
      <p className="lu-sheet-fine">{t.m ? 'No card for the trial. Cancel any time.' : 'No card needed. 20 meetings a month.'}</p>
    </AppSheet>
  );
}

function Footer() {
  return (
    <footer className="lu-footer">
      <div className="lu-wrap lu-footer-in">
        <Logo />
        <nav aria-label="Footer">
          {['Product', 'Pricing', 'Security', 'Careers', 'Blog', 'Status'].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} Echovane · a fictional brand — landing page concept by David Mészáros.</p>
      </div>
    </footer>
  );
}

export default function Echovane() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [toast, notify] = useToast();
  const phone = useLandingPhone();
  const bento = useRef<HTMLDivElement>(null);
  const [yearly, setYearly] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [plan, setPlan] = useState('Pro');
  const openSheet = (p?: string) => {
    if (p) setPlan(p);
    setSheet(true);
  };
  return (
    <div ref={root} className="lumen">
      <Nav />
      <Hero />
      <Logos />
      <How />
      <section className="lu-features" id="features">
        <div className="lu-wrap">
          <p className="lu-kicker lu-c" data-reveal>
            Features
          </p>
          <h2 className="lu-h2 lu-c" data-reveal>
            Less admin. <span className="lu-grad">More of the work you were hired for.</span>
          </h2>
          <div className="lu-bento lp-swipe" ref={bento}>
            <AskTile />
            <TalkTile />
            <LangTile />
            <SyncTile />
            <MailTile />
          </div>
          <SwipeDots row={bento} count={5} />
        </div>
      </section>
      <Stats />
      <Pricing notify={notify} yearly={yearly} setYearly={setYearly} onPick={phone ? openSheet : undefined} />
      <Quotes />
      <Faq />
      <Start notify={notify} />
      <Footer />
      <div className={`lu-toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
      {phone && (
        <StartSheet open={sheet} onClose={() => setSheet(false)} plan={plan} setPlan={setPlan} yearly={yearly} setYearly={setYearly} notify={notify} />
      )}
      <AppTabBar
        tabs={[
          { id: 'top', label: 'Home', icon: <AppIcons.home /> },
          { id: 'features', label: 'Features', icon: <AppIcons.sparkle /> },
          { id: 'pricing', label: 'Pricing', icon: <AppIcons.card /> },
          { id: 'faq', label: 'Help', icon: <AppIcons.question /> },
        ]}
        action={{ label: 'Start free', icon: <AppIcons.bolt />, onClick: () => openSheet() }}
      />
    </div>
  );
}
