import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Cake, FigureCake, Petits } from '../art';
import type { CakeProps } from '../art';
import { Drawer, Modal, OverlayHost, goSection, huf, isEmail, useNow, useReveal, useToast } from '../kit';

/*
 * AFTER — "Málnavirág Cukrászda" (fictional), redesigned. A live mockup:
 * mega menu on hover, cart drawer, table booking, a cake configurator that
 * redraws the cake as you choose, a filterable carousel, live opening hours.
 * Nothing navigates away; menu items scroll inside the frame.
 */

type Cat = 'torta' | 'sutemeny' | 'mentes';
interface Product {
  id: string;
  name: string;
  note: string;
  price: number;
  cat: Cat;
  tag?: string;
  art: ReactNode;
}

const PRODUCTS: Product[] = [
  { id: 'malna', name: 'Málnavirág', note: 'Pisztácia, fehércsokoládé, málnazselé', price: 11490, cat: 'torta', tag: 'Névadónk', art: <Cake body="#f6c4d0" cream="#fff5f8" top="berries" accent="#e0245e" /> },
  { id: 'ej', name: 'Éjfekete', note: 'Étcsokoládé és erdei bogyók', price: 9790, cat: 'torta', art: <Cake body="#4a2c22" cream="#f3d9c4" drip="#2c1712" top="macarons" accent="#f48fb1" /> },
  { id: 'kar', name: 'Karamellás korona', note: 'Sós karamell, mascarpone, mandula', price: 10290, cat: 'torta', tag: 'Szezonális', art: <Cake body="#e9c7a0" cream="#fff1e0" drip="#c98a4b" top="nuts" accent="#a5683a" /> },
  { id: 'mese', name: 'Mesetorta', note: 'Névre szóló felirattal', price: 8990, cat: 'torta', art: <Cake body="#f8bbd0" cream="#fff" drip="#ec407a" top="candles" accent="#ff80ab" /> },
  { id: 'hab', name: 'Rózsás aprósütemény', note: 'Válogatás, 6 darab', price: 3490, cat: 'sutemeny', art: <Petits /> },
  { id: 'zser', name: 'Zserbó tálca', note: 'Dió, baracklekvár, csokoládé', price: 4290, cat: 'sutemeny', art: <Petits colors={['#5d4037', '#8d6e63', '#4e342e', '#a1887f']} /> },
  { id: 'ment', name: 'Mentes málnás', note: 'Glutén- és cukormentes', price: 9490, cat: 'mentes', tag: 'Mentes', art: <Cake body="#fde2e4" cream="#ffffff" top="berries" accent="#c2185b" layers={3} /> },
  { id: 'vegan', name: 'Vegán kókuszos', note: 'Kókusz, mangó, lime', price: 8790, cat: 'mentes', art: <Cake body="#fff6e5" cream="#ffe0a3" top="sprinkles" accent="#ffb74d" /> },
];

const CATS: Array<{ id: 'all' | Cat; label: string }> = [
  { id: 'all', label: 'Mind' },
  { id: 'torta', label: 'Torták' },
  { id: 'sutemeny', label: 'Sütemények' },
  { id: 'mentes', label: 'Mentes' },
];

const FLAVOURS: Record<string, { label: string; perSlice: number; art: Omit<CakeProps, 'top' | 'writing'> }> = {
  malna: { label: 'Málnás–pisztáciás', perSlice: 950, art: { body: '#f6c4d0', cream: '#fff5f8', accent: '#e0245e' } },
  csoki: { label: 'Étcsokoládés', perSlice: 900, art: { body: '#4a2c22', cream: '#f3d9c4', drip: '#2c1712', accent: '#f48fb1' } },
  karamell: { label: 'Sós karamellás', perSlice: 920, art: { body: '#e9c7a0', cream: '#fff1e0', drip: '#c98a4b', accent: '#a5683a' } },
  vanilia: { label: 'Vaníliás–epres', perSlice: 850, art: { body: '#fff3df', cream: '#ffd9e2', drip: '#f06292', accent: '#e53965' } },
};
const OCCASIONS = [
  { id: 'szulinap', label: 'Születésnap', top: 'candles' as const },
  { id: 'eskuvo', label: 'Esküvő', top: 'flowers' as const },
  { id: 'nevnap', label: 'Névnap', top: 'macarons' as const },
  { id: 'csak', label: 'Csak úgy', top: 'berries' as const },
];
const SIZES = [8, 12, 16, 24];

const MEGA = [
  { title: 'Torták', items: [['Ünnepi torták', 'torta'], ['Menyasszonyi torták', 'torta'], ['Mesefigurás torták', 'torta'], ['Egyedi torta', 'order']] },
  { title: 'Sütemények', items: [['Krémesek', 'sutemeny'], ['Aprósütemények', 'sutemeny'], ['Pogácsák', 'sutemeny'], ['Ajándékdobozok', 'sutemeny']] },
  { title: 'Mentes', items: [['Gluténmentes', 'mentes'], ['Cukormentes', 'mentes'], ['Vegán', 'mentes']] },
] as const;

/** "open now" from a weekly schedule: [day 0=Sun..6] → [open, close] in minutes, or null */
function openState(now: Date, hours: Array<[number, number] | null>) {
  const d = now.getDay();
  const m = now.getHours() * 60 + now.getMinutes();
  const today = hours[d];
  const fmt = (v: number) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
  if (today && m >= today[0] && m < today[1]) return { open: true, text: `Most nyitva · ${fmt(today[1])}-ig` };
  for (let i = 0; i < 7; i++) {
    const day = (d + i) % 7;
    const h = hours[day];
    if (h && (i > 0 || m < h[0])) {
      const names = ['vasárnap', 'hétfőn', 'kedden', 'szerdán', 'csütörtökön', 'pénteken', 'szombaton'];
      return { open: false, text: `Zárva · ${i === 0 ? 'ma' : i === 1 ? 'holnap' : names[day]} ${fmt(h[0])}-kor nyit` };
    }
  }
  return { open: false, text: 'Zárva' };
}
const SHOP_HOURS: Array<[number, number] | null> = [[600, 1080], null, [600, 1080], [600, 1080], [600, 1080], [600, 1080], [540, 1140]];
const CAFE_HOURS: Array<[number, number] | null> = [[540, 1200], [450, 1140], [450, 1140], [450, 1140], [450, 1140], [450, 1140], [540, 1200]];

/** ticks every second on its own, so the rest of the page doesn't re-render */
function Countdown() {
  const now = useNow(1000);
  const end = new Date(now.getFullYear(), 10, 30, 23, 59, 59);
  if (end.getTime() < now.getTime()) end.setFullYear(end.getFullYear() + 1);
  const left = Math.max(0, end.getTime() - now.getTime());
  const cd = [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60];
  return (
    <div className="nb-count" aria-label="Hátralévő idő">
      {cd.map((v, i) => (
        <span key={i}>
          <b>{String(v).padStart(2, '0')}</b>
          <small>{['nap', 'óra', 'perc', 'mp'][i]}</small>
        </span>
      ))}
    </div>
  );
}

function Logo() {
  return (
    <span className="nb-logo">
      <b>MÁLNAVIRÁG</b>
      <small>CUKRÁSZDA · 1972</small>
    </span>
  );
}

const Icon = {
  bag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  chev: (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
};

interface Line {
  id: string;
  name: string;
  price: number;
  qty: number;
  art: ReactNode;
}

export default function NewBakery({ mobile = false }: { mobile?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const reveal = useReveal();
  const [toast, showToast] = useToast();
  const go = (id: string) => goSection(root.current, id);

  // cart
  const [cart, setCart] = useState<Line[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [checkedOut, setCheckedOut] = useState(false);
  const count = cart.reduce((a, l) => a + l.qty, 0);
  const total = cart.reduce((a, l) => a + l.qty * l.price, 0);
  const add = (l: Omit<Line, 'qty'>) => {
    setCart((c) => {
      const f = c.find((x) => x.id === l.id);
      return f ? c.map((x) => (x.id === l.id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { ...l, qty: 1 }];
    });
    setBump((b) => b + 1);
    setCheckedOut(false);
    showToast(`Kosárba téve: ${l.name}`);
  };
  const qty = (id: string, d: number) => setCart((c) => c.flatMap((x) => (x.id !== id ? [x] : x.qty + d > 0 ? [{ ...x, qty: x.qty + d }] : [])));
  const openCart = () => {
    reveal('after');
    setCartOpen(true);
  };

  // menu
  const [drawer, setDrawer] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  // products
  const [cat, setCat] = useState<'all' | Cat>('all');
  const shown = PRODUCTS.filter((p) => cat === 'all' || p.cat === cat);
  const track = useRef<HTMLDivElement>(null);
  const slide = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };
  const browse = (c: 'all' | Cat | 'order') => {
    setMegaOpen(false);
    setDrawer(false);
    if (c === 'order') return go('order');
    setCat(c);
    if (track.current) track.current.scrollLeft = 0;
    go('products');
  };

  // configurator
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [flavour, setFlavour] = useState<keyof typeof FLAVOURS>('malna');
  const [size, setSize] = useState(12);
  const [writing, setWriting] = useState('Isten éltessen!');
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  }, []);
  const [date, setDate] = useState(minDate);
  const price = Math.round((FLAVOURS[flavour].perSlice * size + (writing.trim() ? 500 : 0)) / 10) * 10;
  const cakeArt = <Cake {...FLAVOURS[flavour].art} top={occasion.top} writing={writing.trim() || undefined} tiers={size >= 24 ? 2 : 1} />;

  // booking
  const [book, setBook] = useState(false);
  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    for (let i = 0; out.length < 5 && i < 9; i++) {
      const x = new Date(d);
      x.setDate(d.getDate() + i);
      out.push(x);
    }
    return out;
  }, []);
  const [bDay, setBDay] = useState(0);
  const [bTime, setBTime] = useState('15:00');
  const [guests, setGuests] = useState(2);
  const [bName, setBName] = useState('');
  const [booked, setBooked] = useState(false);
  const [bErr, setBErr] = useState(false);

  // newsletter + live clock
  const [mail, setMail] = useState('');
  const [mailState, setMailState] = useState<'idle' | 'bad' | 'ok'>('idle');
  const now = useNow();
  const shop = openState(now, SHOP_HOURS);
  const cafe = openState(now, CAFE_HOURS);
  const [pin, setPin] = useState<'shop' | 'cafe' | null>(null);

  const navItems: Array<[string, string]> = [
    ['Tortarendelés', 'order'],
    ['Történetünk', 'story'],
    ['Kávézó', 'visit'],
    ['Kapcsolat', 'contact'],
  ];

  const dayName = (d: Date, i: number) => (i === 0 ? 'Ma' : i === 1 ? 'Holnap' : ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'][d.getDay()]);

  return (
    <div ref={root} data-mz-root className={mobile ? 'nb m' : 'nb'}>
      <OverlayHost>
        {toast}
        {/* cart */}
        <Drawer open={cartOpen} onClose={() => setCartOpen(false)} className="nb-cart">
          <div className="nb-cart-head">
            <h3>Kosár ({count})</h3>
            <button type="button" aria-label="Bezárás" onClick={() => setCartOpen(false)} className="nb-x">
              {Icon.close}
            </button>
          </div>
          {checkedOut ? (
            <div className="nb-done">
              <Cake body="#f6c4d0" cream="#fff5f8" top="candles" accent="#e0245e" className="nb-done-art" />
              <h3>Köszönjük a rendelést!</h3>
              <p>Ez egy bemutató oldal — a valóságban itt jönne a fizetés és az e-mailes visszaigazolás.</p>
              <button type="button" className="nb-btn" onClick={() => setCartOpen(false)}>
                Vissza a sütikhez
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="nb-empty">
              <Petits className="nb-empty-art" />
              <p>Még üres a kosarad.</p>
              <button
                type="button"
                className="nb-btn sm"
                onClick={() => {
                  setCartOpen(false);
                  go('products');
                }}
              >
                Nézz körül
              </button>
            </div>
          ) : (
            <>
              <ul className="nb-lines">
                {cart.map((l) => (
                  <li key={l.id}>
                    <span className="nb-line-art">{l.art}</span>
                    <span className="nb-line-main">
                      <b>{l.name}</b>
                      <small>{huf(l.price)}</small>
                    </span>
                    <span className="nb-qty">
                      <button type="button" aria-label="Kevesebb" onClick={() => qty(l.id, -1)}>
                        −
                      </button>
                      <output>{l.qty}</output>
                      <button type="button" aria-label="Több" onClick={() => qty(l.id, 1)}>
                        +
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="nb-ship">
                {total >= 15000 ? (
                  <span>🎀 Ingyenes kiszállítás!</span>
                ) : (
                  <span>Még {huf(15000 - total)} az ingyenes kiszállításig</span>
                )}
                <i style={{ width: `${Math.min(100, (total / 15000) * 100)}%` }} />
              </div>
              <div className="nb-total">
                <span>Összesen</span>
                <b>{huf(total)}</b>
              </div>
              <button type="button" className="nb-btn wide" onClick={() => setCheckedOut(true)}>
                Tovább a fizetéshez →
              </button>
            </>
          )}
        </Drawer>

        {/* mobile menu */}
        <Drawer open={drawer} onClose={() => setDrawer(false)} side="left" className="nb-menu-drawer">
          <div className="nb-cart-head">
            <Logo />
            <button type="button" aria-label="Bezárás" onClick={() => setDrawer(false)} className="nb-x">
              {Icon.close}
            </button>
          </div>
          <button type="button" className={`nb-dl ${subOpen ? 'on' : ''}`} onClick={() => setSubOpen((o) => !o)} aria-expanded={subOpen}>
            Kínálat <span>{Icon.chev}</span>
          </button>
          <div className={`nb-sub ${subOpen ? 'on' : ''}`}>
            {MEGA.map((col) =>
              col.items.map(([label, c]) => (
                <button key={label} type="button" onClick={() => browse(c)}>
                  {label}
                </button>
              )),
            )}
          </div>
          {navItems.map(([label, id]) => (
            <button
              key={id}
              type="button"
              className="nb-dl"
              onClick={() => {
                setDrawer(false);
                go(id);
              }}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className="nb-btn wide"
            style={{ marginTop: 24 }}
            onClick={() => {
              setDrawer(false);
              setBook(true);
            }}
          >
            Foglalj asztalt
          </button>
        </Drawer>

        {/* table booking */}
        <Modal
          open={book}
          onClose={() => {
            setBook(false);
            setBooked(false);
          }}
          className="nb-modal"
        >
          <button type="button" aria-label="Bezárás" className="nb-x nb-modal-x" onClick={() => setBook(false)}>
            {Icon.close}
          </button>
          {booked ? (
            <div className="nb-done">
              <h3>Várunk szeretettel, {bName.trim().split(/\s+/).slice(-1)[0]}!</h3>
              <p>
                {dayName(days[bDay], bDay)} {bTime}, {guests} fő — a teraszon tartunk nektek asztalt. (Bemutató, nem küldtünk e-mailt.)
              </p>
              <button type="button" className="nb-btn" onClick={() => { setBook(false); setBooked(false); }}>
                Rendben
              </button>
            </div>
          ) : (
            <>
              <div className="nb-eyebrow">Teraszos kávézó</div>
              <h3 className="nb-modal-title">Asztalfoglalás</h3>
              <label className="nb-lab">Nap</label>
              <div className="nb-chips">
                {days.map((d, i) => (
                  <button key={i} type="button" className={bDay === i ? 'on' : ''} onClick={() => setBDay(i)}>
                    <b>{dayName(d, i)}</b>
                    <small>{d.getDate()}.</small>
                  </button>
                ))}
              </div>
              <label className="nb-lab">Időpont</label>
              <div className="nb-chips">
                {['10:00', '11:30', '13:00', '15:00', '16:30', '18:00'].map((t) => (
                  <button key={t} type="button" className={bTime === t ? 'on' : ''} onClick={() => setBTime(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="nb-row">
                <div>
                  <label className="nb-lab">Létszám</label>
                  <div className="nb-qty big">
                    <button type="button" aria-label="Kevesebb" onClick={() => setGuests((g) => Math.max(1, g - 1))}>
                      −
                    </button>
                    <output>{guests} fő</output>
                    <button type="button" aria-label="Több" onClick={() => setGuests((g) => Math.min(12, g + 1))}>
                      +
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="nb-lab" htmlFor="nb-bname">
                    Név
                  </label>
                  <input
                    id="nb-bname"
                    className={`nb-in ${bErr ? 'err' : ''}`}
                    value={bName}
                    placeholder="Kovács Anna"
                    onChange={(e) => {
                      setBName(e.target.value);
                      setBErr(false);
                    }}
                  />
                  {bErr && <small className="nb-err">Kérjük, add meg a neved.</small>}
                </div>
              </div>
              <button
                type="button"
                className="nb-btn wide"
                onClick={() => (bName.trim().length < 2 ? setBErr(true) : setBooked(true))}
              >
                Foglalás megerősítése
              </button>
            </>
          )}
        </Modal>
      </OverlayHost>

      {/* header */}
      <header className="nb-head">
        <div className="nb-wrap">
          {mobile && (
            <button type="button" className="nb-burger" aria-label="Menü" onClick={() => { reveal('after'); setDrawer(true); }}>
              <i />
              <i />
              <i />
            </button>
          )}
          <Logo />
          {!mobile && (
            <nav className="nb-menu">
              <div className={`nb-has-mega ${megaOpen ? 'open' : ''}`} onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
                <button type="button" aria-expanded={megaOpen} onClick={() => setMegaOpen((o) => !o)}>
                  Kínálat <span className="nb-chev">{Icon.chev}</span>
                </button>
                <div className="nb-mega">
                  {MEGA.map((col) => (
                    <div key={col.title}>
                      <h4>{col.title}</h4>
                      {col.items.map(([label, c]) => (
                        <button key={label} type="button" onClick={() => browse(c)}>
                          {label}
                        </button>
                      ))}
                    </div>
                  ))}
                  <div className="nb-mega-feat">
                    <Cake body="#e9c7a0" cream="#fff1e0" drip="#c98a4b" top="nuts" accent="#a5683a" />
                    <small>A hónap tortája</small>
                    <b>Karamellás korona</b>
                    <button
                      type="button"
                      className="nb-btn sm"
                      onClick={() => {
                        const p = PRODUCTS[2];
                        add({ id: p.id, name: p.name, price: p.price, art: p.art });
                      }}
                    >
                      Kosárba · {huf(10290)}
                    </button>
                  </div>
                </div>
              </div>
              {navItems.map(([label, id]) => (
                <button key={id} type="button" onClick={() => go(id)}>
                  {label}
                </button>
              ))}
            </nav>
          )}
          <div className="nb-actions">
            <button type="button" className="nb-cart-btn" aria-label={`Kosár, ${count} tétel`} onClick={openCart}>
              {Icon.bag}
              {count > 0 && (
                <span key={bump} className="nb-badge mz-bump">
                  {count}
                </span>
              )}
            </button>
            {!mobile && (
              <button type="button" className="nb-btn sm" onClick={() => { reveal('after'); setBook(true); }}>
                Foglalj asztalt
              </button>
            )}
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="nb-hero">
        <div className="nb-wrap">
          <div className="nb-hero-text">
            <div className="nb-eyebrow">Kézműves · Szezonális · Budapesti</div>
            <h1>Málnás álmok, 1972 óta frissen sütve</h1>
            <p>Kézzel díszített torták és sütemények, minden reggel frissen.</p>
            <div className="nb-hero-ctas">
              <button type="button" className="nb-btn" onClick={() => go('order')}>
                Tortát rendelek →
              </button>
              <button type="button" className="nb-btn ghost" onClick={() => go('products')}>
                Napi kínálat
              </button>
            </div>
            {!mobile && (
              <div className="nb-hero-meta">
                <div>
                  <b className={shop.open ? 'ok' : ''}>{shop.open ? 'Nyitva' : 'Zárva'}</b>
                  {shop.text.replace(/^(Most nyitva|Zárva) · /, '')}
                </div>
                <div>
                  <b>Terasz</b>40 férőhely
                </div>
                <div>
                  <b>3 nap</b>egyedi tortákhoz
                </div>
              </div>
            )}
          </div>
          <div className="nb-hero-art">
            <div className="nb-hero-glow" />
            <Cake body="#f6c4d0" cream="#fff5f8" top="berries" accent="#e0245e" tiers={2} layers={2} />
          </div>
        </div>
      </section>

      {/* categories */}
      <div className="nb-wrap">
        <div className="nb-tiles">
          {[
            { name: 'Ünnepi torták', c: 'torta' as const, art: <Cake body="#f8bbd0" cream="#fff" drip="#ec407a" top="candles" accent="#ff80ab" /> },
            { name: 'Menyasszonyi torták', c: 'torta' as const, art: <Cake body="#fffaf6" cream="#ffe4ec" tiers={3} layers={0} top="flowers" accent="#f8a5c2" /> },
            { name: 'Mesefigurás torták', c: 'torta' as const, art: <FigureCake /> },
            { name: 'Aprósütemények', c: 'sutemeny' as const, art: <Petits /> },
          ].map((t) => (
            <button key={t.name} type="button" className="nb-tile" onClick={() => browse(t.c)}>
              <span className="nb-tile-art">{t.art}</span>
              <span className="nb-tile-label">
                {t.name} <em>→</em>
              </span>
            </button>
          ))}
        </div>

        {/* seasonal banner with a live countdown */}
        <div className="nb-banner">
          <div className="nb-banner-art">
            <Cake body="#e9c7a0" cream="#fff1e0" drip="#c98a4b" top="nuts" accent="#a5683a" layers={3} />
          </div>
          <div className="nb-banner-text">
            <div className="nb-eyebrow">Szezonális ajánlat</div>
            <h2>Karamellás korona — csak novemberig</h2>
            <p>Sós karamell, mascarpone és pirított mandula. Foglald le előre a hétvégére!</p>
            <Countdown />
            <button
              type="button"
              className="nb-btn gold sm"
              onClick={() => {
                const p = PRODUCTS[2];
                add({ id: p.id, name: p.name, price: p.price, art: p.art });
              }}
            >
              Lefoglalom →
            </button>
          </div>
        </div>
      </div>

      {/* products */}
      <section className="nb-sec" data-mz="products">
        <div className="nb-wrap">
          <div className="nb-sec-head">
            <div>
              <div className="nb-eyebrow">Bestsellerek</div>
              <h2>Amit a legtöbben kérnek</h2>
            </div>
            <div className="nb-arrows">
              <button type="button" aria-label="Előző" onClick={() => slide(-1)}>
                ←
              </button>
              <button type="button" aria-label="Következő" onClick={() => slide(1)}>
                →
              </button>
            </div>
          </div>
          <div className="nb-filter">
            {CATS.map((c) => (
              <button key={c.id} type="button" className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>
                {c.label}
                <small>{c.id === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c.id).length}</small>
              </button>
            ))}
          </div>
          <div className="nb-products" ref={track}>
            {shown.map((p) => (
              <article className="nb-product" key={p.id}>
                <div className="nb-product-art">{p.art}</div>
                <div className="nb-product-body">
                  {p.tag && <span className="nb-tag">{p.tag}</span>}
                  <h3>{p.name}</h3>
                  <p>{p.note}</p>
                  <footer>
                    {huf(p.price)}
                    <button type="button" aria-label={`${p.name} kosárba`} onClick={() => add({ id: p.id, name: p.name, price: p.price, art: p.art })}>
                      +
                    </button>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* cake configurator */}
      <section className="nb-sec" data-mz="order">
        <div className="nb-wrap nb-order">
          <div className="nb-order-preview">
            <div className="nb-eyebrow">Tortarendelés</div>
            <h2>Álmodd meg, mi megsütjük</h2>
            <p>Válassz alkalmat, ízt és méretet, írd meg a feliratot — a torta itt rajzolódik ki előtted.</p>
            <div className="nb-preview-stage">
              {cakeArt}
              <span className="nb-preview-tag">
                {FLAVOURS[flavour].label} · {size} szelet
              </span>
            </div>
          </div>
          <div className="nb-form">
            <label className="nb-lab">Alkalom</label>
            <div className="nb-chips">
              {OCCASIONS.map((o) => (
                <button key={o.id} type="button" className={occasion.id === o.id ? 'on' : ''} onClick={() => setOccasion(o)}>
                  {o.label}
                </button>
              ))}
            </div>
            <label className="nb-lab" htmlFor="nb-flav">
              Íz
            </label>
            <select id="nb-flav" className="nb-in" value={flavour} onChange={(e) => setFlavour(e.target.value as keyof typeof FLAVOURS)}>
              {Object.entries(FLAVOURS).map(([k, f]) => (
                <option key={k} value={k}>
                  {f.label}
                </option>
              ))}
            </select>
            <label className="nb-lab">Méret</label>
            <div className="nb-seg">
              {SIZES.map((s) => (
                <button key={s} type="button" className={size === s ? 'on' : ''} onClick={() => setSize(s)}>
                  {s} szelet
                </button>
              ))}
            </div>
            <label className="nb-lab" htmlFor="nb-write">
              Felirat <small>{writing.length}/24</small>
            </label>
            <input id="nb-write" className="nb-in" maxLength={24} value={writing} onChange={(e) => setWriting(e.target.value)} placeholder="pl. Boldog szülinapot!" />
            <label className="nb-lab" htmlFor="nb-date">
              Átvétel napja
            </label>
            <input id="nb-date" type="date" className="nb-in" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
            <div className="nb-total">
              <span>Ár</span>
              <b>{huf(price)}</b>
            </div>
            <button
              type="button"
              className="nb-btn wide"
              onClick={() =>
                add({
                  id: `egyedi-${flavour}-${size}-${occasion.id}-${writing}`,
                  name: `Egyedi torta · ${FLAVOURS[flavour].label}, ${size} szelet`,
                  price,
                  art: cakeArt,
                })
              }
            >
              Kosárba teszem →
            </button>
          </div>
        </div>
      </section>

      {/* story */}
      <section className="nb-heritage" data-mz="story">
        <div className="nb-wrap">
          <h2>Egy kis cukrászda, nagy szeretettel</h2>
          {[
            ['1972', 'óta nyitva'],
            ['2', 'nemzedék cukrászmester'],
            ['40+', 'sütemény a pultban'],
            ['4,8', 'átlagos értékelés'],
          ].map(([b, s]) => (
            <div className="nb-stat" key={s}>
              <b>{b}</b>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* visit */}
      <section className="nb-sec" data-mz="visit">
        <div className="nb-wrap">
          <div className="nb-sec-head">
            <div>
              <div className="nb-eyebrow">Gyere be hozzánk</div>
              <h2>Cukrászda és kávézó</h2>
            </div>
          </div>
          <div className="nb-visit">
            {[
              { id: 'shop' as const, name: 'Cukrászda', note: 'Sütemények, torták, rendelések átvétele', st: shop, rows: [['Kedd – Szombat', '10:00 – 18:00'], ['Vasárnap', '10:00 – 18:00'], ['Hétfő', 'zárva']] },
              { id: 'cafe' as const, name: 'Teraszos kávézó', note: 'Specialty kávé, reggeli, születésnapi foglalás', st: cafe, rows: [['Hétköznap', '7:30 – 19:00'], ['Hétvégén', '9:00 – 20:00']] },
            ].map((c) => (
              <div key={c.id} className={`nb-card ${pin === c.id ? 'hl' : ''}`} onMouseEnter={() => setPin(c.id)} onMouseLeave={() => setPin(null)}>
                <h3>{c.name}</h3>
                <p>{c.note}</p>
                <div className="nb-hours">
                  {c.rows.map(([d, h]) => (
                    <div key={d}>
                      <span>{d}</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
                <span className={`nb-open ${c.st.open ? '' : 'closed'}`}>{c.st.text}</span>
              </div>
            ))}
            <div className="nb-map">
              <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice">
                <rect width="300" height="220" fill="#fbe6ee" />
                <path d="M-10 150 C60 120 120 170 310 90" stroke="#cfe0e8" strokeWidth="22" fill="none" />
                <g stroke="#fffafc" strokeWidth="7" fill="none">
                  <path d="M0 40h300M0 100h300M40 0v220M130 0v220M220 0v220M0 200L300 10" />
                </g>
                <g stroke="#fffafc" strokeWidth="3" fill="none">
                  <path d="M0 70h300M85 0v220M175 0v220M265 0v220M0 170h300" />
                </g>
                {[
                  { id: 'shop', x: 130, y: 100 },
                  { id: 'cafe', x: 220, y: 40 },
                ].map((p) => (
                  <g key={p.id} className={`nb-pin ${pin === p.id ? 'on' : ''}`} transform={`translate(${p.x} ${p.y})`}>
                    <circle r="18" fill="#b4245d" opacity="0.15" className="nb-pin-pulse" />
                    <path d="M0 6c-6-7-10-11-10-16a10 10 0 0 1 20 0c0 5-4 9-10 16z" fill={p.id === 'shop' ? '#b4245d' : '#f06292'} />
                    <circle cy="-10" r="3.5" fill="#fff" />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="nb-foot" data-mz="contact">
        <div className="nb-wrap">
          <div>
            <Logo />
            <p style={{ marginTop: 16, maxWidth: 260 }}>Kézműves cukrászda 1972 óta.</p>
          </div>
          <div>
            <h4>Finomságok</h4>
            {['Torták', 'Sütemények', 'Mentes kínálat'].map((x, i) => (
              <button key={x} type="button" className="nb-flink" onClick={() => browse((['torta', 'sutemeny', 'mentes'] as const)[i])}>
                {x}
              </button>
            ))}
          </div>
          <div>
            <h4>Rendelés</h4>
            <button type="button" className="nb-flink" onClick={() => go('order')}>
              Tortarendelés
            </button>
            <button type="button" className="nb-flink" onClick={openCart}>
              Kosár ({count})
            </button>
            <button type="button" className="nb-flink" onClick={() => { reveal('after'); setBook(true); }}>
              Asztalfoglalás
            </button>
          </div>
          <div className="nb-news">
            <h4>Hírlevél</h4>
            {mailState === 'ok' ? (
              <p>Köszönjük! Az első levélben egy kupon vár. 🎀</p>
            ) : (
              <>
                <p>Szezonális újdonságok elsőként.</p>
                <div className="nb-news-row">
                  <input
                    className={`nb-in ${mailState === 'bad' ? 'err' : ''}`}
                    placeholder="email@cimed.hu"
                    value={mail}
                    onChange={(e) => {
                      setMail(e.target.value);
                      setMailState('idle');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && setMailState(isEmail(mail) ? 'ok' : 'bad')}
                  />
                  <button type="button" className="nb-btn gold sm" onClick={() => setMailState(isEmail(mail) ? 'ok' : 'bad')}>
                    Kérem
                  </button>
                </div>
                {mailState === 'bad' && <small className="nb-err light">Ellenőrizd az e-mail címet.</small>}
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
