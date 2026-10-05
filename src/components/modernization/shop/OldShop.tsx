import { useState } from 'react';
import { Ceramic } from '../art';
import { ITEMS } from './data';

/**
 * BEFORE — a 2009-style webshop for the fictional Kőmáz: Verdana 11px, a
 * category tree, a table of tiny thumbnails, grey "Kosárba" buttons and a
 * cart that is only a counter in the header (the page would reload).
 */
export default function OldShop() {
  const [cart, setCart] = useState(0);
  const [sum, setSum] = useState(0);
  const items = ITEMS.slice(0, 8);
  return (
    <div className="os" data-mz-root>
      <div className="os-page">
        <div className="os-top">
          <span>Belépés</span> | <span>Regisztráció</span> | <span>ÁSZF</span> | <span>Szállítási információk</span>
          <b className="os-cart">
            Kosár: {cart} db termék, {sum.toLocaleString('hu-HU')} Ft
          </b>
        </div>
        <div className="os-head">
          <div className="os-logo">
            KŐMÁZ <small>Kerámia Webáruház</small>
          </div>
          <div className="os-search">
            <input placeholder="Keresett kifejezés..." />
            <span className="os-gbtn">Keresés</span>
            <br />
            <u>Részletes keresés</u>
          </div>
        </div>
        <div className="os-menu">
          {['Főoldal', 'Termékek', 'Akciók', 'Újdonságok', 'Rólunk', 'Kapcsolat'].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <table className="os-layout">
          <tbody>
            <tr>
              <td className="os-left">
                <div className="os-box">
                  <div className="os-box-t">Kategóriák</div>
                  {['Bögrék', 'Csészék', 'Tálak', 'Tányérok', 'Vázák', 'Kaspók', 'Teáskannák', 'Egyéb'].map((c, i) => (
                    <div key={c} className="os-cat">
                      {i < 3 ? '[+]' : '[-]'} <u>{c}</u> ({(i * 7) % 9 + 2})
                    </div>
                  ))}
                </div>
                <div className="os-box">
                  <div className="os-box-t">Hírlevél</div>
                  E-mail cím:
                  <input className="os-in" />
                  <span className="os-gbtn">Feliratkozás</span>
                </div>
                <div className="os-box os-pay">Fizetési módok: utánvét, banki átutalás</div>
              </td>
              <td className="os-main">
                <div className="os-path">
                  Ön itt van: <u>Főoldal</u> &gt; Kiemelt termékek
                </div>
                <div className="os-promo">
                  <span className="os-burst">AKCIÓ!</span>
                  <div>
                    <b>ŐSZI KIÁRUSÍTÁS!!!</b>
                    <br />
                    Kaspók most 15% kedvezménnyel! Készlet erejéig!
                  </div>
                </div>
                <h1>Kiemelt termékeink</h1>
                <table className="os-grid">
                  <tbody>
                    {[0, 1].map((r) => (
                      <tr key={r}>
                        {items.slice(r * 4, r * 4 + 4).map((it) => (
                          <td key={it.id}>
                            <div className="os-thumb">
                              <Ceramic kind={it.kind} glaze={it.glazes[0].hex} />
                            </div>
                            <u className="os-name">{it.name}</u>
                            <div className="os-cikk">Cikkszám: KM-{it.price % 997}</div>
                            <div className="os-price">Ár: {it.price.toLocaleString('hu-HU')} Ft</div>
                            <div className="os-netto">(nettó: {Math.round(it.price / 1.27).toLocaleString('hu-HU')} Ft)</div>
                            <button
                              type="button"
                              className="os-gbtn"
                              onClick={() => {
                                setCart((c) => c + 1);
                                setSum((s) => s + it.price);
                              }}
                            >
                              Kosárba
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="os-pages">
                  Oldal: <b>1</b> <u>2</u> <u>3</u> <u>Következő &gt;&gt;</u>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="os-foot">
          Kőmáz Kerámia Webáruház | <u>ÁSZF</u> | <u>Adatvédelem</u> | Webáruház motor: ShopKit 2.1 | Ajánlott böngésző: Internet Explorer 7
        </div>
      </div>
    </div>
  );
}
