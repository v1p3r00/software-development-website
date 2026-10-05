import { useMemo, useRef, useState } from 'react';
import { Ceramic } from '../art';
import { Drawer, OverlayHost, goSection, huf, isEmail, scrollInFrame, useReveal, useToast } from '../kit';
import { CATS, ITEMS } from './data';
import type { Glaze, Item, ShopCat } from './data';

/*
 * AFTER — "Kőmáz" (fictional) ceramics webshop, redesigned. Live mockup:
 * live search with suggestions, mega menu, filters + price range + sort,
 * glaze swatches that recolour the product, wishlist, a cart drawer with
 * quantities, coupon and free-shipping bar. Nothing leaves the page.
 */

const FREE = 20000;
type Sort = 'pop' | 'asc' | 'desc' | 'new';

interface Line {
  key: string;
  item: Item;
  glaze: Glaze;
  qty: number;
}

const I = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
  close: 'M6 6l12 12M18 6L6 18',
  chev: 'M6 9l6 6 6-6',
  filter: 'M4 6h16M7 12h10M10 18h4',
  menu: 'M4 7h16M4 12h16M4 17h16',
};
const Svg = ({ d, fill }: { d: string; fill?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function Stars({ v }: { v: number }) {
  return (
    <span className="ns-stars" aria-label={`${v} csillag`}>
      <span style={{ width: `${(v / 5) * 100}%` }}>★★★★★</span>★★★★★
    </span>
  );
}

function Card({
  item,
  fav,
  onFav,
  onAdd,
  hl,
}: {
  item: Item;
  fav: boolean;
  onFav: () => void;
  onAdd: (g: Glaze) => void;
  hl: boolean;
}) {
  const [g, setG] = useState(item.glazes[0]);
  return (
    <article className={`ns-card ${hl ? 'hl' : ''}`} data-mz={`p-${item.id}`}>
      <div className="ns-card-art">
        <Ceramic kind={item.kind} glaze={g.hex} />
        <div className="ns-badges">
          {item.isNew && <span className="new">Új</span>}
          {item.was && <span className="sale">−{Math.round((1 - item.price / item.was) * 100)}%</span>}
        </div>
        <button type="button" className={`ns-fav ${fav ? 'on' : ''}`} aria-pressed={fav} aria-label="Kedvencekhez" onClick={onFav}>
          <Svg d={I.heart} fill={fav} />
        </button>
        <button type="button" className="ns-quick" onClick={() => onAdd(g)}>
          Kosárba · {g.name}
        </button>
      </div>
      <div className="ns-card-body">
        <div className="ns-swatches" role="radiogroup" aria-label="Máz">
          {item.glazes.map((x) => (
            <button
              key={x.name}
              type="button"
              role="radio"
              aria-checked={g.name === x.name}
              title={x.name}
              className={g.name === x.name ? 'on' : ''}
              style={{ background: x.hex }}
              onClick={() => setG(x)}
            />
          ))}
          <small>{g.name}</small>
        </div>
        <h3>{item.name}</h3>
        <div className="ns-rate">
          <Stars v={item.rating} /> <small>({item.reviews})</small>
        </div>
        <div className="ns-price">
          <b>{huf(item.price)}</b>
          {item.was && <s>{huf(item.was)}</s>}
        </div>
        {item.stock <= 5 && <small className="ns-low">Már csak {item.stock} db raktáron</small>}
      </div>
    </article>
  );
}

export default function NewShop({ mobile = false }: { mobile?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const reveal = useReveal();
  const [toast, showToast] = useToast();
  const go = (id: string) => goSection(root.current, id);

  const [q, setQ] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cat, setCat] = useState<ShopCat | 'all' | 'fav'>('all');
  const [max, setMax] = useState(20000);
  const [sort, setSort] = useState<Sort>('pop');
  const [favs, setFavs] = useState<string[]>([]);
  const [hl, setHl] = useState<string | null>(null);
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const [filters, setFilters] = useState(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const out = ITEMS.filter(
      (i) =>
        (cat === 'all' || (cat === 'fav' ? favs.includes(i.id) : i.cat === cat)) &&
        i.price <= max &&
        (!s || i.name.toLowerCase().includes(s) || i.glazes.some((g) => g.name.toLowerCase().includes(s))),
    );
    const by: Record<Sort, (a: Item, b: Item) => number> = {
      pop: (a, b) => b.pop - a.pop,
      asc: (a, b) => a.price - b.price,
      desc: (a, b) => b.price - a.price,
      new: (a, b) => Number(!!b.isNew) - Number(!!a.isNew),
    };
    return out.sort(by[sort]);
  }, [q, cat, max, sort, favs]);

  const suggestions = q.trim() ? ITEMS.filter((i) => i.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 4) : [];

  // cart
  const [cart, setCart] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState(false);
  const [couponErr, setCouponErr] = useState(false);
  const [paid, setPaid] = useState(false);
  const count = cart.reduce((a, l) => a + l.qty, 0);
  const sub = cart.reduce((a, l) => a + l.qty * l.item.price, 0);
  const discount = applied ? Math.round(sub * 0.1) : 0;
  const ship = sub === 0 || sub - discount >= FREE ? 0 : 1490;
  const add = (item: Item, glaze: Glaze) => {
    const key = `${item.id}-${glaze.name}`;
    setCart((c) => (c.some((l) => l.key === key) ? c.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l)) : [...c, { key, item, glaze, qty: 1 }]));
    setBump((b) => b + 1);
    setPaid(false);
    showToast(`${item.name} (${glaze.name}) a kosárban`);
  };
  const qty = (key: string, d: number) => setCart((c) => c.flatMap((l) => (l.key !== key ? [l] : l.qty + d > 0 ? [{ ...l, qty: l.qty + d }] : [])));
  const openCart = () => {
    reveal('after');
    setOpen(true);
  };
  const toggleFav = (id: string) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const jump = (id: string) => {
    setQ('');
    setSearchFocus(false);
    setSearchOpen(false);
    setCat('all');
    setMax(20000);
    setHl(id);
    window.setTimeout(() => scrollInFrame(root.current?.querySelector(`[data-mz="p-${id}"]`)), 60);
    window.setTimeout(() => setHl(null), 2200);
  };
  const browse = (c: ShopCat | 'all' | 'fav') => {
    setCat(c);
    setMega(false);
    setMenu(false);
    go('shop');
  };

  const [mail, setMail] = useState('');
  const [mailState, setMailState] = useState<'idle' | 'bad' | 'ok'>('idle');

  const search = (
    <div className={`ns-search ${searchFocus && suggestions.length ? 'open' : ''}`}>
      <Svg d={I.search} />
      <input
        value={q}
        placeholder="Keresés: bögre, váza, zsálya…"
        aria-label="Keresés"
        onChange={(e) => {
          setQ(e.target.value);
          if (cat !== 'all') setCat('all');
        }}
        onFocus={() => setSearchFocus(true)}
        onBlur={() => window.setTimeout(() => setSearchFocus(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setSearchFocus(false);
            go('shop');
          }
        }}
      />
      {q && (
        <button type="button" aria-label="Törlés" onClick={() => setQ('')} className="ns-clear">
          <Svg d={I.close} />
        </button>
      )}
      <div className="ns-suggest">
        {suggestions.map((s) => (
          <button key={s.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => jump(s.id)}>
            <span className="ns-mini">
              <Ceramic kind={s.kind} glaze={s.glazes[0].hex} />
            </span>
            <span>
              <b>{s.name}</b>
              <small>{huf(s.price)}</small>
            </span>
          </button>
        ))}
        <button type="button" className="ns-all" onMouseDown={(e) => e.preventDefault()} onClick={() => { setSearchFocus(false); go('shop'); }}>
          Mind a(z) {list.length} találat →
        </button>
      </div>
    </div>
  );

  const filterControls = (
    <>
      <div className="ns-chips">
        {[{ id: 'all' as const, label: 'Minden' }, ...CATS.map((c) => ({ id: c.id, label: c.label })), { id: 'fav' as const, label: `♥ Kedvencek (${favs.length})` }].map((c) => (
          <button key={c.id} type="button" className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="ns-tools">
        <label className="ns-range">
          <span>
            Max. ár: <b>{huf(max)}</b>
          </span>
          <input type="range" min={5000} max={20000} step={500} value={max} onChange={(e) => setMax(+e.target.value)} />
        </label>
        <label className="ns-sort">
          Rendezés
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="pop">Népszerű</option>
            <option value="asc">Ár szerint ↑</option>
            <option value="desc">Ár szerint ↓</option>
            <option value="new">Újdonságok</option>
          </select>
        </label>
      </div>
    </>
  );

  return (
    <div ref={root} data-mz-root className={mobile ? 'ns m' : 'ns'}>
      <OverlayHost>
        {toast}
        <Drawer open={open} onClose={() => setOpen(false)} className="ns-cart">
          <div className="ns-dhead">
            <h3>Kosár ({count})</h3>
            <button type="button" className="ns-x" aria-label="Bezárás" onClick={() => setOpen(false)}>
              <Svg d={I.close} />
            </button>
          </div>
          {paid ? (
            <div className="ns-done">
              <Ceramic kind="mug" glaze="#c4673f" />
              <h3>Köszönjük a vásárlást!</h3>
              <p>Bemutató webshop — a valóságban itt jönne a fizetés, a számla és a csomagkövetés.</p>
              <button type="button" className="ns-btn" onClick={() => setOpen(false)}>
                Vissza a boltba
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="ns-done">
              <Ceramic kind="bowl" glaze="#e8dccb" />
              <p>A kosarad még üres.</p>
              <button
                type="button"
                className="ns-btn"
                onClick={() => {
                  setOpen(false);
                  go('shop');
                }}
              >
                Termékek böngészése
              </button>
            </div>
          ) : (
            <>
              <div className="ns-freebar">
                {sub - discount >= FREE ? <span>Ingyenes szállítás ✓</span> : <span>Még {huf(FREE - (sub - discount))} és ingyen szállítunk</span>}
                <i style={{ width: `${Math.min(100, ((sub - discount) / FREE) * 100)}%` }} />
              </div>
              <ul className="ns-lines">
                {cart.map((l) => (
                  <li key={l.key}>
                    <span className="ns-line-art">
                      <Ceramic kind={l.item.kind} glaze={l.glaze.hex} />
                    </span>
                    <span className="ns-line-main">
                      <b>{l.item.name}</b>
                      <small>
                        {l.glaze.name} · {huf(l.item.price)}
                      </small>
                      <span className="ns-qty">
                        <button type="button" aria-label="Kevesebb" onClick={() => qty(l.key, -1)}>
                          −
                        </button>
                        <output>{l.qty}</output>
                        <button type="button" aria-label="Több" onClick={() => qty(l.key, 1)}>
                          +
                        </button>
                      </span>
                    </span>
                    <span className="ns-line-sum">
                      {huf(l.qty * l.item.price)}
                      <button type="button" className="ns-rm" onClick={() => qty(l.key, -l.qty)}>
                        Törlés
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="ns-coupon">
                <input
                  value={coupon}
                  placeholder="Kuponkód (próbáld: KOMAZ10)"
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setCouponErr(false);
                  }}
                  disabled={applied}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (applied) {
                      setApplied(false);
                      setCoupon('');
                    } else if (coupon.trim().toUpperCase() === 'KOMAZ10') setApplied(true);
                    else setCouponErr(true);
                  }}
                >
                  {applied ? 'Eltávolít' : 'Beváltom'}
                </button>
              </div>
              {couponErr && <small className="ns-err">Ez a kupon nem érvényes.</small>}
              <dl className="ns-sum">
                <div>
                  <dt>Részösszeg</dt>
                  <dd>{huf(sub)}</dd>
                </div>
                {applied && (
                  <div className="ok">
                    <dt>Kedvezmény (10%)</dt>
                    <dd>−{huf(discount)}</dd>
                  </div>
                )}
                <div>
                  <dt>Szállítás</dt>
                  <dd>{ship ? huf(ship) : 'Ingyenes'}</dd>
                </div>
                <div className="tot">
                  <dt>Összesen</dt>
                  <dd>{huf(sub - discount + ship)}</dd>
                </div>
              </dl>
              <button type="button" className="ns-btn wide" onClick={() => setPaid(true)}>
                Tovább a pénztárhoz
              </button>
            </>
          )}
        </Drawer>

        <Drawer open={menu} onClose={() => setMenu(false)} side="left" className="ns-menu">
          <div className="ns-dhead">
            <span className="ns-logo">kőmáz</span>
            <button type="button" className="ns-x" aria-label="Bezárás" onClick={() => setMenu(false)}>
              <Svg d={I.close} />
            </button>
          </div>
          {CATS.map((c) => (
            <button key={c.id} type="button" className="ns-dl" onClick={() => browse(c.id)}>
              <span className="ns-mini">
                <Ceramic kind={c.kind} glaze={c.glaze} />
              </span>
              {c.label}
            </button>
          ))}
          <button type="button" className="ns-dl" onClick={() => { setMenu(false); go('workshop'); }}>
            A műhely
          </button>
          <button type="button" className="ns-dl" onClick={() => browse('fav')}>
            ♥ Kedvencek ({favs.length})
          </button>
        </Drawer>

        {mobile && (
        <Drawer open={filters} onClose={() => setFilters(false)} side="left" className="ns-sheet">
          <div className="ns-dhead">
            <h3>Szűrés</h3>
            <button type="button" className="ns-x" aria-label="Bezárás" onClick={() => setFilters(false)}>
              <Svg d={I.close} />
            </button>
          </div>
          {filterControls}
          <button type="button" className="ns-btn wide" onClick={() => setFilters(false)}>
            {list.length} termék mutatása
          </button>
        </Drawer>
        )}
      </OverlayHost>

      <div className="ns-bar">
        Ingyenes szállítás 20 000 Ft felett<span> · Kézzel készült Budapesten · 30 napos visszaküldés</span>
      </div>
      <header className="ns-head">
        <div className="ns-wrap">
          {mobile && (
            <button type="button" className="ns-icon" aria-label="Menü" onClick={() => { reveal('after'); setMenu(true); }}>
              <Svg d={I.menu} />
            </button>
          )}
          <span className="ns-logo">kőmáz</span>
          {!mobile && (
            <nav className="ns-nav">
              <div className={`ns-has-mega ${mega ? 'open' : ''}`} onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
                <button type="button" aria-expanded={mega} onClick={() => setMega((m) => !m)}>
                  Termékek
                  <span className="ns-chev">
                    <Svg d={I.chev} />
                  </span>
                </button>
                <div className="ns-mega">
                  {CATS.map((c) => (
                    <button key={c.id} type="button" onClick={() => browse(c.id)}>
                      <span className="ns-mega-art">
                        <Ceramic kind={c.kind} glaze={c.glaze} />
                      </span>
                      <b>{c.label}</b>
                      <small>{ITEMS.filter((i) => i.cat === c.id).length} termék</small>
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => { setSort('new'); browse('all'); }}>
                Újdonságok
              </button>
              <button type="button" onClick={() => go('workshop')}>
                A műhely
              </button>
            </nav>
          )}
          {!mobile && search}
          <div className="ns-actions">
            {mobile && (
              <button type="button" className="ns-icon" aria-label="Keresés" onClick={() => setSearchOpen((o) => !o)}>
                <Svg d={I.search} />
              </button>
            )}
            <button type="button" className="ns-icon" aria-label="Kedvencek" onClick={() => browse('fav')}>
              <Svg d={I.heart} fill={favs.length > 0} />
              {favs.length > 0 && <span className="ns-badge light">{favs.length}</span>}
            </button>
            <button type="button" className="ns-icon" aria-label={`Kosár, ${count} termék`} onClick={openCart}>
              <Svg d={I.bag} />
              {count > 0 && (
                <span key={bump} className="ns-badge mz-bump">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
        {mobile && searchOpen && <div className="ns-wrap ns-msearch">{search}</div>}
      </header>

      <section className="ns-hero">
        <div className="ns-wrap">
          <div className="ns-hero-text">
            <span className="ns-kicker">Őszi kollekció · 2026</span>
            <h1>Kézzel formált, mindennapra.</h1>
            <p>Korongozott bögrék, tálak és vázák egy budapesti műhelyből — mindegyik egyedi mázzal, kis szériában.</p>
            <div className="ns-ctas">
              <button type="button" className="ns-btn" onClick={() => go('shop')}>
                Vásárlás
              </button>
              <button type="button" className="ns-btn ghost" onClick={() => go('workshop')}>
                A műhelyünk
              </button>
            </div>
          </div>
          <div className="ns-hero-art">
            <div className="ns-shelf" />
            <Ceramic kind="vase" glaze="#7d8f7a" className="a" />
            <Ceramic kind="mug" glaze="#c4673f" className="b" />
            <Ceramic kind="bowl" glaze="#e8dccb" className="c" />
          </div>
        </div>
      </section>

      <div className="ns-wrap">
        <div className="ns-cats">
          {CATS.map((c) => (
            <button key={c.id} type="button" onClick={() => browse(c.id)}>
              <span className="ns-cat-art">
                <Ceramic kind={c.kind} glaze={c.glaze} />
              </span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <section className="ns-sec" data-mz="shop">
        <div className="ns-wrap">
          <div className="ns-shop-head">
            <h2>{cat === 'fav' ? 'Kedvenceid' : cat === 'all' ? 'Minden termék' : CATS.find((c) => c.id === cat)?.label}</h2>
            <span>{list.length} termék</span>
            {mobile && (
              <button type="button" className="ns-filter-btn" onClick={() => { reveal('after'); setFilters(true); }}>
                <Svg d={I.filter} /> Szűrés
              </button>
            )}
          </div>
          {!mobile && filterControls}
          {list.length === 0 ? (
            <div className="ns-empty">
              <Ceramic kind="cup" glaze="#e8dccb" />
              <p>{cat === 'fav' ? 'Még nincs kedvenced — koppints a szívre egy terméken.' : 'Nincs a szűrésnek megfelelő termék.'}</p>
              <button
                type="button"
                className="ns-btn ghost"
                onClick={() => {
                  setQ('');
                  setCat('all');
                  setMax(20000);
                }}
              >
                Szűrők törlése
              </button>
            </div>
          ) : (
            <div className="ns-grid">
              {list.map((i) => (
                <Card key={i.id} item={i} hl={hl === i.id} fav={favs.includes(i.id)} onFav={() => toggleFav(i.id)} onAdd={(g) => add(i, g)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="ns-sec" data-mz="workshop">
        <div className="ns-wrap ns-workshop">
          <div>
            <span className="ns-kicker">A műhely</span>
            <h2>Agyagtól az asztalig</h2>
            <p>Minden darab a mi kezünk között készül: korongozás, két égetés és kézzel öntött máz. Ezért nincs két egyforma bögre.</p>
          </div>
          <ol className="ns-steps">
            {[
              ['Korongozás', 'Budapesti műhelyünkben, kis szériában.'],
              ['Égetés', '1240 °C-on, két körben — mosogatógépben is bírja.'],
              ['Mázazás', 'Saját receptű, ólommentes mázak.'],
            ].map(([t, d], i) => (
              <li key={t}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <span>
                  <strong>{t}</strong>
                  {d}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ns-sec">
        <div className="ns-wrap">
          <div className="ns-reviews">
            {[
              ['„A bögre pont úgy fekszik a kézben, ahogy kell. A mázat élőben is imádom.”', 'Anna, Szeged'],
              ['„Gyors szállítás, gyönyörű csomagolás. Ajándékba vettem, másodszor is rendelek.”', 'Gergő, Budapest'],
              ['„A kaspó színe pont olyan, mint a képen kiválasztott máz.”', 'Kata, Győr'],
            ].map(([t, n]) => (
              <figure key={n}>
                <Stars v={5} />
                <blockquote>{t}</blockquote>
                <figcaption>{n} · fiktív vélemény</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <footer className="ns-foot">
        <div className="ns-wrap">
          <div>
            <span className="ns-logo">kőmáz</span>
            <p>Kézműves kerámia — kitalált márka, bemutató webshop.</p>
          </div>
          <div className="ns-news">
            <b>10% kedvezmény az első rendelésből</b>
            {mailState === 'ok' ? (
              <p>Elküldtük a kuponkódot: KOMAZ10 ✓</p>
            ) : (
              <div className="ns-news-row">
                <input
                  value={mail}
                  placeholder="E-mail címed"
                  className={mailState === 'bad' ? 'err' : ''}
                  onChange={(e) => {
                    setMail(e.target.value);
                    setMailState('idle');
                  }}
                />
                <button type="button" className="ns-btn" onClick={() => setMailState(isEmail(mail) ? 'ok' : 'bad')}>
                  Feliratkozom
                </button>
              </div>
            )}
            {mailState === 'bad' && <small className="ns-err">Adj meg egy érvényes e-mail címet.</small>}
          </div>
        </div>
      </footer>

      {mobile && count > 0 && !open && (
        <button type="button" className="ns-sticky-cart" onClick={openCart}>
          <span>{count} termék</span>
          <b>Kosár · {huf(sub)}</b>
        </button>
      )}
    </div>
  );
}
