import { Cake, FigureCake, Petits } from '../art';

/**
 * BEFORE: a typical 2000s small-business site for a fictional confectionery —
 * fixed 830px column on a hot-pink tiled wallpaper, an arched photo banner,
 * a glossy menu bar and centred italic text. Purely visual: nothing is a link.
 */
export default function OldBakery() {
  const menu = ['Kezdőlap', 'Sütemények', 'Tortarendelés', 'Fagylalt', 'Galéria', 'Vendégkönyv', 'Kapcsolat'];
  return (
    <div className="ob" data-mz-root>
      <div className="ob-page">
        <div className="ob-head">
          <div className="ob-ribbon">
            <div className="ob-ribbon-band">Málnavirág Cukrászda</div>
            <span className="ob-anno">alapítva 1972</span>
          </div>
          <div className="ob-arch">
            <span>
              <Cake className="ob-pic" body="#fffaf6" cream="#ffe4ec" tiers={3} layers={0} top="flowers" accent="#ff4fa3" plate={false} />
            </span>
            <span>
              <FigureCake className="ob-pic" />
            </span>
            <span>
              <Cake className="ob-pic" body="#4a2c22" cream="#f3d9c4" drip="#2c1712" top="berries" accent="#e0245e" plate={false} />
            </span>
            <span>
              <Cake className="ob-pic" body="#f6c4d0" cream="#fff5f8" top="candles" accent="#ff4fa3" plate={false} />
            </span>
          </div>
        </div>

        <div className="ob-nav">
          {menu.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        <div className="ob-body">
          <h1>Üdvözöljük a Málnavirág Cukrászda honlapján!</h1>
          <div className="ob-sub">Házi készítésű finomságok 1972 óta</div>
          <div className="ob-marquee">
            <span>*** Kedves Vendégeink! Nyári szabadság miatt augusztus 1-15. között zárva tartunk!!! *** Tortarendelés telefonon *** Új: fagylalt kehelyben ***</span>
          </div>

          <div className="ob-welcome">
            Friss sütemények minden nap,
            <br />
            szeretettel készítve!
          </div>
          <div className="ob-big">
            ŐSZI AKCIÓ!! <span className="ob-new">ÚJ!</span>
            <br />
            Minden hétvégén 10% kedvezmény a gesztenyés süteményekre!
            <br />
            Tortarendelést 3 nappal előtte kérjük leadni.
          </div>

          <div className="ob-posters">
            <div className="ob-poster">
              <small>A hónap tortája</small>
              <b>MÁLNÁS ÁLOM</b>
              <Cake className="ob-pic" body="#f6c4d0" cream="#fff" top="berries" accent="#e0245e" />
              <small>Kóstolja meg Ön is!</small>
            </div>
            <div className="ob-poster">
              <small>Őszi különlegesség</small>
              <b>Gesztenyés</b>
              <Cake className="ob-pic" body="#c98a4b" cream="#fff1e0" drip="#6d3b1d" top="nuts" accent="#5d3a1a" />
              <small>Csak szeptembertől!</small>
            </div>
          </div>

          <div className="ob-list">
            Krémes, zserbó, rigójancsi és dobostorta
            <br />
            Születésnapi és ballagási torták rendelésre
            <br />
            Cukormentes és gluténmentes sütemények (kérésre)
            <br />
            Pogácsa és sós teasütemények kilóra
            <br />
            Lágy fagylalt májustól szeptemberig
            <br />
            Kávé, forró csokoládé, házi limonádé
          </div>
          <div className="ob-list">
            Céges rendezvényekre, esküvőkre és keresztelőkre
            <br />
            is vállalunk megrendelést!
          </div>

          <table className="ob-table">
            <caption>Galéria - kattintson a képre!</caption>
            <tbody>
              <tr>
                <td>
                  <Petits className="ob-pic" />
                </td>
                <td>
                  <Cake className="ob-pic" body="#f8bbd0" cream="#fff" drip="#ec407a" top="candles" accent="#ff80ab" />
                </td>
                <td>
                  <FigureCake className="ob-pic" />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="ob-list">
            Rendelést kizárólag telefonon vagy személyesen fogadunk.
            <br />
            A honlap folyamatosan bővül, látogasson vissza!
          </div>

          <div className="ob-hr" />

          <div className="ob-addr">
            <h2>Málnavirág Cukrászda</h2>
            Budapest
            <br />
            Nyitva: kedd - vasárnap 10.00 - 18.00
            <br />
            Hétfőn zárva
          </div>

          <div className="ob-foot">
            <span>
              Ön a(z)
              <span className="ob-counter">
                {'0018326'.split('').map((d, i) => (
                  <i key={i}>{d}</i>
                ))}
              </span>{' '}
              . látogató
            </span>
            <span>Frissítve: 2008.11.02.</span>
            <span className="ob-badge">Legjobb nézet: 800×600, Netscape 7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
