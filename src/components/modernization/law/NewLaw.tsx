import { useMemo, useRef, useState } from 'react';
import { Avatar, Facade, Scales } from '../art';
import { Drawer, Modal, OverlayHost, goSection, huf, isEmail, useNow, useReveal } from '../kit';

/*
 * AFTER — "Halmos & Rét Ügyvédi Iroda" (fictional), redesigned. Live mockup:
 * mega menu, practice-area tabs, team cards, fee toggle, FAQ accordion,
 * a three-step consultation booking and a validated contact form.
 */

const AREAS = [
  {
    id: 'tarsasagi',
    name: 'Társasági jog',
    short: 'Cégalapítás, módosítás, átalakulás',
    icon: 'M4 20V9l8-5 8 5v11M9 20v-6h6v6',
    text: 'Cégalapítástól a tulajdonosváltásig: átlátható struktúrát és gyors cégeljárást biztosítunk, hogy a vállalkozás az üzletre figyelhessen.',
    points: ['Kft. és Zrt. alapítása 1–3 munkanap alatt', 'Tagi szerződések, üzletrész-adásvétel', 'Átalakulás, végelszámolás'],
    fee: 'Cégalapítás 120 000 Ft-tól',
  },
  {
    id: 'szerzodes',
    name: 'Szerződések',
    short: 'Megírás, átnézés, tárgyalás',
    icon: 'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6',
    text: 'Érthető, a valós kockázatokra szabott szerződéseket írunk, és két munkanapon belül véleményezzük a kapott tervezeteket.',
    points: ['ÁSZF és vállalkozási szerződések', 'Szerződés-véleményezés 2 munkanap alatt', 'Tárgyalás a másik féllel'],
    fee: 'Véleményezés 60 000 Ft-tól',
  },
  {
    id: 'ingatlan',
    name: 'Ingatlanjog',
    short: 'Adásvétel, ellenjegyzés, bérlet',
    icon: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5',
    text: 'Ingatlan-adásvételnél a tulajdoni lap ellenőrzésétől a földhivatali bejegyzésig mindent intézünk, ügyvédi letéttel.',
    points: ['Adásvételi szerződés és ellenjegyzés', 'Ügyvédi letétkezelés', 'Bérleti és használati szerződések'],
    fee: 'Ellenjegyzés a vételár 0,5%-a',
  },
  {
    id: 'munkajog',
    name: 'Munkajog',
    short: 'Munkáltatóknak és munkavállalóknak',
    icon: 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 7h18v12H3zM3 12h18',
    text: 'Munkaszerződések, szabályzatok és felmondások — megelőzzük a vitát, és ha mégis kialakul, képviseljük Önt.',
    points: ['Munkaszerződés és munkaköri leírás', 'Felmondás, közös megegyezés', 'Munkaügyi per'],
    fee: 'Munkaszerződés-csomag 80 000 Ft-tól',
  },
  {
    id: 'adatvedelem',
    name: 'Adatvédelem',
    short: 'GDPR megfelelés, tájékoztatók',
    icon: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    text: 'GDPR-megfelelés auditál, adatkezelési tájékoztatók és adatfeldolgozói szerződések — webshopoknak és szolgáltatóknak.',
    points: ['GDPR audit és cselekvési terv', 'Adatkezelési tájékoztató, süti-szabályzat', 'Incidenskezelés'],
    fee: 'Tájékoztató-csomag 90 000 Ft-tól',
  },
  {
    id: 'vita',
    name: 'Vitarendezés',
    short: 'Követelés, peres képviselet',
    icon: 'M4 21h16M6 17h12M12 3v14M5 7h14',
    text: 'Fizetési meghagyástól a peres eljárásig: először a gyors, peren kívüli megoldást keressük, ha kell, bíróság előtt képviseljük.',
    points: ['Fizetési meghagyás, végrehajtás', 'Peren kívüli egyezség', 'Polgári és gazdasági perek'],
    fee: 'Fizetési felszólítás 25 000 Ft-tól',
  },
];

const TEAM = [
  { id: 'halmos', name: 'Dr. Halmos Eszter', role: 'Alapító partner', area: 'Társasági jog, szerződések', langs: 'HU · EN · DE', hue: 215, initials: 'HE', hair: 'bun' as const, bio: '25 év cégjogi gyakorlat, korábban nemzetközi irodában dolgozott. Tárgyalásokon higgadt, szerződésekben precíz.' },
  { id: 'ret', name: 'Dr. Rét Balázs', role: 'Partner', area: 'Ingatlanjog, vitarendezés', langs: 'HU · EN', hue: 30, initials: 'RB', hair: 'short' as const, bio: 'Több mint 600 ingatlanügylet és száznál több per. A legbonyolultabb tulajdoni helyzetet is kibogozza.' },
  { id: 'szabo', name: 'Dr. Szabó Lilla', role: 'Ügyvéd', area: 'Munkajog, adatvédelem', langs: 'HU · EN · FR', hue: 340, initials: 'SL', hair: 'long' as const, bio: 'Munkáltatókat segít szabályzatokkal és GDPR-megfeleléssel; tanúsított adatvédelmi szakértő.' },
];

const FAQ = [
  ['Mennyibe kerül az első konzultáció?', 'Az első, 30 perces konzultáció díja 25 000 Ft + ÁFA, amit megbízás esetén beszámítunk az ügy díjába.'],
  ['Lehet online is egyeztetni?', 'Igen, videóhívásban is tartunk konzultációt; a dokumentumokat titkosított feltöltéssel kérjük el.'],
  ['Mennyi idő alatt kapok választ?', 'Munkanapokon 48 órán belül visszajelzünk, sürgős ügyben aznap.'],
  ['Hogyan zajlik a díjazás?', 'Óradíjas, átalánydíjas és sikerdíjas konstrukciót is ajánlunk — a választott modellt írásban rögzítjük.'],
  ['Vidéki ügyet is vállalnak?', 'Igen, az ország egész területén eljárunk, a tárgyalásokra utazunk.'],
];

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const close = 'M6 6l12 12M18 6L6 18';
const chev = 'M6 9l6 6 6-6';

function Logo() {
  return (
    <span className="nl-logo">
      <Scales className="nl-logo-mark" />
      <span>
        <b>HALMOS &amp; RÉT</b>
        <small>ÜGYVÉDI IRODA</small>
      </span>
    </span>
  );
}

export default function NewLaw({ mobile = false }: { mobile?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const reveal = useReveal();
  const go = (id: string) => goSection(root.current, id);
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [area, setArea] = useState(AREAS[0].id);
  const [company, setCompany] = useState(true);
  const [faq, setFaq] = useState<number | null>(0);
  const now = useNow();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const officeOpen = day >= 1 && day <= 5 && mins >= 510 && mins < (day === 5 ? 840 : 1050);

  // booking
  const [book, setBook] = useState(false);
  const [step, setStep] = useState(1);
  const [bArea, setBArea] = useState<string | null>(null);
  const [bLawyer, setBLawyer] = useState<string>('any');
  const [mode, setMode] = useState<'iroda' | 'online'>('online');
  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    for (let i = 1; out.length < 5 && i < 12; i++) {
      const x = new Date(d);
      x.setDate(d.getDate() + i);
      if (x.getDay() !== 0 && x.getDay() !== 6) out.push(x);
    }
    return out;
  }, []);
  const [bDay, setBDay] = useState(0);
  const [bSlot, setBSlot] = useState<string | null>(null);
  const [bForm, setBForm] = useState({ name: '', email: '', note: '' });
  const [bTried, setBTried] = useState(false);
  const [bDone, setBDone] = useState(false);
  const taken = (di: number, s: string) => (di * 7 + s.charCodeAt(1) + s.charCodeAt(3)) % 3 === 0;

  const openBooking = (a?: string, lawyer?: string) => {
    reveal('after');
    setMega(false);
    setDrawer(false);
    setBArea(a ?? null);
    setBLawyer(lawyer ?? 'any');
    setStep(a ? 2 : 1);
    setBSlot(null);
    setBDone(false);
    setBTried(false);
    setBook(true);
  };
  const bValid = bForm.name.trim().length > 2 && isEmail(bForm.email);

  // contact form
  const [form, setForm] = useState({ name: '', email: '', topic: 'tarsasagi', msg: '', ok: false });
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);
  const errs = {
    name: form.name.trim().length < 3,
    email: !isEmail(form.email),
    msg: form.msg.trim().length < 10,
    ok: !form.ok,
  };
  const valid = !Object.values(errs).some(Boolean);

  const cur = AREAS.find((a) => a.id === area)!;
  const fees = [
    { name: 'Első konzultáció', price: 25000, unit: '/ 30 perc', note: 'Beszámítjuk a megbízás díjába', feat: ['Ügy áttekintése', 'Kockázatok és lehetőségek', 'Írásos összefoglaló'] },
    { name: 'Óradíj', price: 45000, unit: '/ óra', note: 'Negyedórás elszámolás', feat: ['Rugalmas, eseti ügyekhez', 'Havi kimutatás', 'Online egyeztetés'], hot: true },
    { name: 'Átalánydíj', price: 180000, unit: '/ hó-tól', note: 'Folyamatos jogi támogatás', feat: ['Korlátlan konzultáció', 'Szerződés-véleményezés', 'Elsőbbségi válaszidő'] },
  ];
  const navItems: Array<[string, string]> = [
    ['Ügyvédeink', 'team'],
    ['Díjazás', 'fees'],
    ['GYIK', 'faq'],
    ['Kapcsolat', 'contact'],
  ];

  return (
    <div ref={root} data-mz-root className={mobile ? 'nl m' : 'nl'}>
      <OverlayHost>
        <Drawer open={drawer} onClose={() => setDrawer(false)} side="right" className="nl-drawer">
          <div className="nl-drawer-head">
            <Logo />
            <button type="button" className="nl-x" aria-label="Bezárás" onClick={() => setDrawer(false)}>
              <Icon d={close} />
            </button>
          </div>
          <div className="nl-dl-title">Szakterületek</div>
          {AREAS.map((a) => (
            <button
              key={a.id}
              type="button"
              className="nl-dl small"
              onClick={() => {
                setArea(a.id);
                setDrawer(false);
                go('areas');
              }}
            >
              {a.name}
            </button>
          ))}
          <div className="nl-dl-title">Iroda</div>
          {navItems.map(([l, id]) => (
            <button
              key={id}
              type="button"
              className="nl-dl"
              onClick={() => {
                setDrawer(false);
                go(id);
              }}
            >
              {l}
            </button>
          ))}
          <button type="button" className="nl-btn wide" onClick={() => openBooking()}>
            Konzultáció foglalása
          </button>
        </Drawer>

        <Modal open={book} onClose={() => setBook(false)} className="nl-modal">
          <button type="button" className="nl-x nl-modal-x" aria-label="Bezárás" onClick={() => setBook(false)}>
            <Icon d={close} />
          </button>
          {bDone ? (
            <div className="nl-done">
              <span className="nl-done-mark">✓</span>
              <h3>Időpont rögzítve</h3>
              <p>
                {days[bDay].toLocaleDateString('hu-HU', { month: 'long', day: 'numeric', weekday: 'long' })}, {bSlot} ·{' '}
                {mode === 'online' ? 'videóhívás' : 'személyesen az irodában'}
                <br />
                {AREAS.find((a) => a.id === bArea)?.name} · {bLawyer === 'any' ? 'az első szabad kollégánál' : TEAM.find((t) => t.id === bLawyer)?.name}
              </p>
              <small>Ez egy bemutató — nem küldtünk e-mailt, és nem foglaltunk valódi időpontot.</small>
              <button type="button" className="nl-btn" onClick={() => setBook(false)}>
                Rendben
              </button>
            </div>
          ) : (
            <>
              <div className="nl-steps">
                {['Téma', 'Időpont', 'Adatok'].map((s, i) => (
                  <span key={s} className={step > i ? 'on' : ''}>
                    <b>{i + 1}</b>
                    {s}
                  </span>
                ))}
              </div>
              {step === 1 && (
                <>
                  <h3 className="nl-modal-title">Miben segíthetünk?</h3>
                  <div className="nl-pick">
                    {AREAS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className={bArea === a.id ? 'on' : ''}
                        onClick={() => {
                          setBArea(a.id);
                          setStep(2);
                        }}
                      >
                        <Icon d={a.icon} />
                        <b>{a.name}</b>
                        <small>{a.short}</small>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h3 className="nl-modal-title">Válasszon időpontot</h3>
                  <div className="nl-toggle">
                    {(['online', 'iroda'] as const).map((m) => (
                      <button key={m} type="button" className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
                        {m === 'online' ? 'Videóhívás' : 'Személyesen'}
                      </button>
                    ))}
                  </div>
                  <label className="nl-lab" htmlFor="nl-lawyer">
                    Ügyvéd
                  </label>
                  <select id="nl-lawyer" className="nl-in" value={bLawyer} onChange={(e) => setBLawyer(e.target.value)}>
                    <option value="any">Az első szabad kolléga</option>
                    {TEAM.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <label className="nl-lab">Nap</label>
                  <div className="nl-days">
                    {days.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        className={bDay === i ? 'on' : ''}
                        onClick={() => {
                          setBDay(i);
                          setBSlot(null);
                        }}
                      >
                        <small>{d.toLocaleDateString('hu-HU', { weekday: 'short' })}</small>
                        <b>{d.getDate()}</b>
                      </button>
                    ))}
                  </div>
                  <label className="nl-lab">Szabad időpontok</label>
                  <div className="nl-slots">
                    {['09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30'].map((s) => {
                      const off = taken(bDay, s);
                      return (
                        <button key={s} type="button" disabled={off} className={bSlot === s ? 'on' : ''} onClick={() => setBSlot(s)}>
                          {off ? 'foglalt' : s}
                        </button>
                      );
                    })}
                  </div>
                  <div className="nl-modal-foot">
                    <button type="button" className="nl-link" onClick={() => setStep(1)}>
                      ← Vissza
                    </button>
                    <button type="button" className="nl-btn" disabled={!bSlot} onClick={() => setStep(3)}>
                      Tovább
                    </button>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <h3 className="nl-modal-title">Elérhetőség</h3>
                  <label className="nl-lab" htmlFor="nl-bn">
                    Név
                  </label>
                  <input id="nl-bn" className={`nl-in ${bTried && bForm.name.trim().length <= 2 ? 'err' : ''}`} value={bForm.name} onChange={(e) => setBForm({ ...bForm, name: e.target.value })} />
                  <label className="nl-lab" htmlFor="nl-be">
                    E-mail
                  </label>
                  <input id="nl-be" className={`nl-in ${bTried && !isEmail(bForm.email) ? 'err' : ''}`} value={bForm.email} onChange={(e) => setBForm({ ...bForm, email: e.target.value })} />
                  {bTried && !bValid && <small className="nl-err">Kérjük, adja meg a nevét és egy érvényes e-mail címet.</small>}
                  <label className="nl-lab" htmlFor="nl-bm">
                    Röviden az ügyről <small>(nem kötelező)</small>
                  </label>
                  <textarea id="nl-bm" rows={3} className="nl-in" value={bForm.note} onChange={(e) => setBForm({ ...bForm, note: e.target.value })} />
                  <div className="nl-summary">
                    <span>{AREAS.find((a) => a.id === bArea)?.name}</span>
                    <span>
                      {days[bDay].toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })} · {bSlot}
                    </span>
                    <span>{huf(25000)} + ÁFA</span>
                  </div>
                  <div className="nl-modal-foot">
                    <button type="button" className="nl-link" onClick={() => setStep(2)}>
                      ← Vissza
                    </button>
                    <button type="button" className="nl-btn" onClick={() => (bValid ? setBDone(true) : setBTried(true))}>
                      Foglalás véglegesítése
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </Modal>
      </OverlayHost>

      <header className="nl-head">
        <div className="nl-wrap">
          <Logo />
          {!mobile ? (
            <>
              <nav className="nl-menu">
                <div className={`nl-has-mega ${mega ? 'open' : ''}`} onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
                  <button type="button" aria-expanded={mega} onClick={() => setMega((m) => !m)}>
                    Szakterületek
                    <span className="nl-chev">
                      <Icon d={chev} />
                    </span>
                  </button>
                  <div className="nl-mega">
                    <div className="nl-mega-grid">
                      {AREAS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            setArea(a.id);
                            setMega(false);
                            go('areas');
                          }}
                        >
                          <span className="nl-ico">
                            <Icon d={a.icon} />
                          </span>
                          <span>
                            <b>{a.name}</b>
                            <small>{a.short}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="nl-mega-side">
                      <small>Nem tudja, hova tartozik az ügye?</small>
                      <b>Írja le röviden, mi irányítjuk a megfelelő kollégához.</b>
                      <button type="button" className="nl-btn sm" onClick={() => openBooking()}>
                        Konzultáció foglalása
                      </button>
                    </div>
                  </div>
                </div>
                {navItems.map(([l, id]) => (
                  <button key={id} type="button" onClick={() => go(id)}>
                    {l}
                  </button>
                ))}
              </nav>
              <button type="button" className="nl-btn sm" onClick={() => openBooking()}>
                Konzultáció foglalása
              </button>
            </>
          ) : (
            <button
              type="button"
              className="nl-burger"
              aria-label="Menü"
              onClick={() => {
                reveal('after');
                setDrawer(true);
              }}
            >
              <i />
              <i />
            </button>
          )}
        </div>
      </header>

      <section className="nl-hero">
        <Facade className="nl-facade" />
        <div className="nl-wrap">
          <div className="nl-eyebrow">Üzleti jog · 1998 óta</div>
          <h1>
            Üzleti ügyek, <em>világos</em> válaszokkal.
          </h1>
          <p>Társasági jog, szerződések, ingatlan- és munkajog — vállalkozásoknak és magánszemélyeknek, érthető nyelven.</p>
          <div className="nl-ctas">
            <button type="button" className="nl-btn gold" onClick={() => openBooking()}>
              Konzultáció foglalása →
            </button>
            <button type="button" className="nl-btn line" onClick={() => go('areas')}>
              Szakterületek
            </button>
          </div>
          <div className="nl-proof">
            {[
              ['25+', 'év gyakorlat'],
              ['1 200+', 'lezárt ügy'],
              ['48 óra', 'válaszidő'],
            ].map(([b, s]) => (
              <div key={s}>
                <b>{b}</b>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nl-sec" data-mz="areas">
        <div className="nl-wrap">
          <div className="nl-eyebrow dark">Szakterületek</div>
          <h2>Amiben a legtöbbet segítünk</h2>
          <div className="nl-areas">
            <div className="nl-tabs" role="tablist">
              {AREAS.map((a) => (
                <button key={a.id} type="button" role="tab" aria-selected={area === a.id} className={area === a.id ? 'on' : ''} onClick={() => setArea(a.id)}>
                  <span className="nl-ico">
                    <Icon d={a.icon} />
                  </span>
                  <span>
                    <b>{a.name}</b>
                    {!mobile && <small>{a.short}</small>}
                  </span>
                </button>
              ))}
            </div>
            <div className="nl-panel" key={cur.id} role="tabpanel">
              <h3>{cur.name}</h3>
              <p>{cur.text}</p>
              <ul>
                {cur.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="nl-panel-foot">
                <span>{cur.fee}</span>
                <button type="button" className="nl-btn" onClick={() => openBooking(cur.id)}>
                  Erről kérdeznék →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="nl-sec" data-mz="team">
        <div className="nl-wrap">
          <div className="nl-eyebrow dark">Ügyvédeink</div>
          <h2>Akikkel dolgozni fog</h2>
          <div className="nl-team">
            {TEAM.map((t) => (
              <article key={t.id} className="nl-person" tabIndex={0}>
                <div className="nl-photo">
                  <Avatar initials={t.initials} hue={t.hue} hair={t.hair} />
                  <div className="nl-bio">
                    <p>{t.bio}</p>
                    <button type="button" className="nl-btn sm gold" onClick={() => openBooking(undefined, t.id)}>
                      Időpont nála
                    </button>
                  </div>
                </div>
                <h3>{t.name}</h3>
                <span>{t.role}</span>
                <small>
                  {t.area} · {t.langs}
                </small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nl-sec" data-mz="fees">
        <div className="nl-wrap">
          <div className="nl-fees-head">
            <div>
              <div className="nl-eyebrow dark">Díjazás</div>
              <h2>Kiszámítható díjak</h2>
            </div>
            <div className="nl-toggle">
              <button type="button" className={company ? 'on' : ''} onClick={() => setCompany(true)}>
                Cégeknek
              </button>
              <button type="button" className={!company ? 'on' : ''} onClick={() => setCompany(false)}>
                Magánszemélyeknek
              </button>
            </div>
          </div>
          <div className="nl-fees">
            {fees.map((f) => {
              const price = company ? f.price : Math.round((f.price * 1.27) / 100) * 100;
              return (
                <div key={f.name} className={`nl-fee ${f.hot ? 'hot' : ''}`}>
                  {f.hot && <span className="nl-fee-badge">Leggyakoribb</span>}
                  <h3>{f.name}</h3>
                  <div className="nl-price">
                    <b>{huf(price)}</b> <span>{f.unit}</span>
                  </div>
                  <small>{company ? '+ ÁFA' : 'bruttó, ÁFÁ-val'} · {f.note}</small>
                  <ul>
                    {f.feat.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <button type="button" className={`nl-btn ${f.hot ? '' : 'line dark'} wide`} onClick={() => openBooking()}>
                    Ezt választom
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="nl-sec" data-mz="faq">
        <div className="nl-wrap nl-faq-wrap">
          <div>
            <div className="nl-eyebrow dark">GYIK</div>
            <h2>Gyakori kérdések</h2>
            <p className="nl-muted">Nem találja a választ? Írjon nekünk, 48 órán belül jelentkezünk.</p>
          </div>
          <div className="nl-faq">
            {FAQ.map(([q, a], i) => (
              <div key={q} className={`nl-q ${faq === i ? 'on' : ''}`}>
                <button type="button" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? null : i)}>
                  {q}
                  <span>+</span>
                </button>
                <div className="nl-a">
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nl-sec" data-mz="contact">
        <div className="nl-wrap nl-contact">
          <div className="nl-office">
            <div className="nl-eyebrow">Iroda</div>
            <h2>Budapest, belváros</h2>
            <p>Ügyfélfogadás előzetes egyeztetés alapján, személyesen vagy videóhívásban.</p>
            <div className="nl-hours">
              <div>
                <span>Hétfő – Csütörtök</span>
                <span>8:30 – 17:30</span>
              </div>
              <div>
                <span>Péntek</span>
                <span>8:30 – 14:00</span>
              </div>
            </div>
            <span className={`nl-open ${officeOpen ? '' : 'closed'}`}>{officeOpen ? 'Most elérhetők vagyunk' : 'Most zárva — írjon, holnap válaszolunk'}</span>
          </div>
          <div className="nl-form">
            {sent ? (
              <div className="nl-done">
                <span className="nl-done-mark">✓</span>
                <h3>Köszönjük, {form.name.split(' ').slice(-1)[0]}!</h3>
                <p>Üzenetét megkaptuk, 48 órán belül válaszolunk. (Bemutató — semmi nem lett elküldve.)</p>
                <button
                  type="button"
                  className="nl-link"
                  onClick={() => {
                    setSent(false);
                    setTried(false);
                    setForm({ name: '', email: '', topic: 'tarsasagi', msg: '', ok: false });
                  }}
                >
                  Új üzenet
                </button>
              </div>
            ) : (
              <>
                <h3>Írjon nekünk</h3>
                <div className="nl-grid2">
                  <div>
                    <label className="nl-lab" htmlFor="nl-cn">
                      Név
                    </label>
                    <input id="nl-cn" className={`nl-in ${tried && errs.name ? 'err' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    {tried && errs.name && <small className="nl-err">Adja meg a teljes nevét.</small>}
                  </div>
                  <div>
                    <label className="nl-lab" htmlFor="nl-ce">
                      E-mail
                    </label>
                    <input id="nl-ce" className={`nl-in ${tried && errs.email ? 'err' : form.email && !errs.email ? 'ok' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    {tried && errs.email && <small className="nl-err">Érvénytelen e-mail cím.</small>}
                  </div>
                </div>
                <label className="nl-lab" htmlFor="nl-ct">
                  Téma
                </label>
                <select id="nl-ct" className="nl-in" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                  {AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <label className="nl-lab" htmlFor="nl-cm">
                  Üzenet <small>{form.msg.length}/600</small>
                </label>
                <textarea id="nl-cm" rows={4} maxLength={600} className={`nl-in ${tried && errs.msg ? 'err' : ''}`} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
                {tried && errs.msg && <small className="nl-err">Írjon legalább pár szót az ügyről.</small>}
                <label className={`nl-check ${tried && errs.ok ? 'err' : ''}`}>
                  <input type="checkbox" checked={form.ok} onChange={(e) => setForm({ ...form, ok: e.target.checked })} />
                  <span>Elolvastam az adatkezelési tájékoztatót, és hozzájárulok adataim kezeléséhez.</span>
                </label>
                <button type="button" className="nl-btn wide" onClick={() => (valid ? setSent(true) : setTried(true))}>
                  Üzenet küldése
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="nl-foot">
        <div className="nl-wrap">
          <Logo />
          <div className="nl-foot-links">
            {AREAS.slice(0, 4).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setArea(a.id);
                  go('areas');
                }}
              >
                {a.name}
              </button>
            ))}
          </div>
          <small>Ez egy kitalált iroda, bemutató célra — a nevek, árak és időpontok nem valósak.</small>
        </div>
      </footer>
    </div>
  );
}
