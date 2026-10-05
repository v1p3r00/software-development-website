import { Scales } from '../art';

/**
 * BEFORE — a 2005-era law-firm site for the fictional Halmos & Rét: a centred
 * table layout, bevelled grey menu buttons, a gradient banner with clipart,
 * long justified paragraphs and a hit counter. Only hover effects work.
 */
export default function OldLaw() {
  const menu = ['Főoldal', 'Az irodáról', 'Szakterületeink', 'Ügyvédeink', 'Díjazás', 'Hírek', 'Kapcsolat', 'Jogi nyilatkozat'];
  return (
    <div className="ol" data-mz-root>
      <div className="ol-page">
        <div className="ol-banner">
          <Scales className="ol-clip" color="#f5d76e" />
          <div>
            <div className="ol-title">Dr. Halmos és Dr. Rét Ügyvédi Iroda</div>
            <div className="ol-tag">Jogi képviselet és tanácsadás 1998 óta</div>
          </div>
          <Scales className="ol-clip" color="#f5d76e" />
        </div>
        <div className="ol-strip">
          Mai dátum: 2007. május 21. hétfő &nbsp;|&nbsp; Névnap: Konstantin &nbsp;|&nbsp; <u>Kezdőlappá teszem</u> &nbsp;|&nbsp; <u>Kedvencekhez</u>
        </div>
        <table className="ol-table">
          <tbody>
            <tr>
              <td className="ol-side">
                {menu.map((m, i) => (
                  <span key={m} className={i === 0 ? 'ol-mb on' : 'ol-mb'}>
                    » {m}
                  </span>
                ))}
                <div className="ol-box">
                  <b>HÍREK</b>
                  <p>
                    <i>2007.04.12.</i>
                    <br />
                    Változik a társasházi törvény! Részletek irodánkban.
                  </p>
                  <p>
                    <i>2006.11.03.</i>
                    <br />
                    Új munkatárssal bővült irodánk.
                  </p>
                </div>
                <div className="ol-counter">
                  Látogatók:
                  <br />
                  <span>00 27 413</span>
                </div>
              </td>
              <td className="ol-main">
                <h1>Üdvözöljük honlapunkon!</h1>
                <p>
                  Irodánk 1998-ban alakult azzal a céllal, hogy ügyfeleink részére magas színvonalú jogi szolgáltatást nyújtson a polgári jog, a gazdasági
                  jog és a munkajog területén. Ügyvédeink több éves szakmai tapasztalattal rendelkeznek, és folyamatosan figyelemmel kísérik a jogszabályi
                  változásokat. Ügyfeleink között egyaránt megtalálhatók magánszemélyek, kis- és középvállalkozások, valamint gazdasági társaságok.
                </p>
                <p>
                  Szolgáltatásainkat ügyfeleink igényeihez igazítjuk. Az első személyes megbeszélés során felmérjük az ügy körülményeit, és tájékoztatást
                  adunk a lehetséges megoldásokról és azok költségeiről. Kérjük, hogy az irodába érkezés előtt telefonon egyeztessen időpontot!
                </p>
                <h2>Szakterületeink:</h2>
                <ul>
                  <li>Társasági jog, cégeljárás</li>
                  <li>Szerződések készítése, véleményezése</li>
                  <li>Ingatlan adásvétel, ellenjegyzés</li>
                  <li>Munkajog</li>
                  <li>Követelések behajtása, peres képviselet</li>
                </ul>
                <div className="ol-notice">
                  <b>FIGYELEM!</b> Az oldalon található információk nem minősülnek jogi tanácsadásnak!
                </div>
                <h2>Ügyfélfogadás:</h2>
                <p>
                  Hétfő - Csütörtök: 9.00 - 16.00
                  <br />
                  Péntek: 9.00 - 12.00
                  <br />
                  <b>Kizárólag előzetes telefonos időpont-egyeztetés alapján!</b>
                </p>
                <p>
                  E-mail: <u className="ol-mail">iroda@halmos-ret-ugyved.hu</u>
                </p>
                <div className="ol-foot">
                  Utoljára frissítve: 2007.05.21. &nbsp;|&nbsp; A honlap megtekintéséhez Internet Explorer 6.0 és 1024x768 felbontás ajánlott.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
