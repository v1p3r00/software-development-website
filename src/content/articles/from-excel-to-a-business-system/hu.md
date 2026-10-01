---
title: "Excelből vállalati rendszer? – Mikor nő ki egy vállalkozás az Excelből?"
description: "Mikor válik az Excel üzleti kockázattá? Megmutatjuk a figyelmeztető jeleket és az átállás lehetőségeit SaaS-tól az egyedi rendszerig."
tags: [excel, digitalizáció, automatizálás, saas, vállalati-rendszer]
date: 2026-10-12 08:00
image: /articles/from-excel-to-a-business-system/share-hu.jpg
---

Az Excel fantasztikus eszköz.

Egy induló vállalkozásnál gyakran pontosan erre van szükség: gyorsan lehet benne ügyfeleket, termékeket, költségeket, rendeléseket vagy projekteket vezetni.

A probléma általában nem akkor kezdődik, amikor valaki Excelt használ.

Hanem akkor, amikor **egyre több üzleti folyamat kezd egy Excel-fájl köré épülni.**

Először csak egy táblázat.

Aztán lesz belőle három.

Majd valaki készít egy másolatot:

```text
ugyfelek.xlsx
ugyfelek_final.xlsx
ugyfelek_final2.xlsx
ugyfelek_FINAL.xlsx
ugyfelek_FINAL_javitott.xlsx
```

Egy ponton már nem az Excel segíti a vállalkozást.

**A vállalkozás kezd alkalmazkodni az Excel korlátaihoz.**

---

## Az Excel önmagában nem probléma

Fontos különbséget tenni.

Nem attól „rossz” egy Excel-folyamat, hogy Excelben működik.

Ha egy munkatárs havonta egyszer készít egy egyszerű kimutatást, nincs feltétlenül szükség külön vállalati rendszerre.

Az Excel ma is támogatja például a megosztott munkát és a társszerzést a megfelelő Microsoft 365-környezetben. A Microsoft dokumentációja szerint több felhasználó ugyanazon a munkafüzeten is dolgozhat, és bizonyos verziókban a változások is követhetők. [Microsoft – Collaborate on Excel workbooks](https://support.microsoft.com/en-us/excel/get-started/collaborate-on-excel-workbooks-at-the-same-time-with-co-authoring)

A kérdés tehát nem az:

> **„Használunk Excelt?”**

Hanem:

> **„Az Excel még megfelelő eszköz ehhez a folyamathoz?”**

---

## 1. Ugyanabból az adatból több verzió létezik

Ez az egyik leggyakoribb figyelmeztető jel.

Ha valaki elküld egy Excel-fájlt e-mailben, a másik ember módosítja, majd visszaküldi, máris két különböző állapot létezhet.

Ha pedig többen dolgoznak rajta külön példányokban, gyorsan elveszhet az egyetlen megbízható adatforrás.

A modern Excel támogatja a társszerzést, de ehhez megfelelő verzió, Microsoft 365 és megfelelő tárolási környezet szükséges. Régebbi Excel-verziók például nem támogatják a társszerzést. [Microsoft – Excel file is locked for editing](https://support.microsoft.com/en-us/excel/excel-file-is-locked-for-editing)

Ha a mindennapi folyamat még mindig így néz ki:

```text
Péter → Excel
        ↓
e-mail
        ↓
Anna → Excel
        ↓
e-mail
        ↓
János → Excel
```

akkor érdemes feltenni a kérdést, hogy **nem lenne-e jobb egy közös rendszerben ugyanazt az adatot kezelni.**

---

## 2. Egy rossz cella komoly problémát okozhat

Az Excel egyik nagy előnye a rugalmassága.

És ez egyben a hátránya is.

Egy felhasználó könnyen:

- átírhat egy értéket,
- törölhet egy sort,
- felülírhat egy képletet,
- rossz formátumban vihet be adatot,
- módosíthat egy feltételt,
- hibásan másolhat egy képletet.

A Microsoft saját dokumentációja is külön kezeli a munkalapok, cellák és képletek védelmét, illetve hangsúlyozza, hogy a munkalapvédelem önmagában nem tekinthető teljes körű biztonsági megoldásnak. [Microsoft – Protection and security in Excel](https://support.microsoft.com/en-us/excel/protection-and-security-in-excel)

Egy üzleti rendszerben ezzel szemben meghatározható például:

```text
Ügyintéző
  → ügyfelet létrehozhat
  → árat módosíthat

Vezető
  → árat jóváhagyhat
  → riportot készíthet

Admin
  → felhasználókat kezelhet
```

**Nem minden felhasználónak kell minden adatot és minden műveletet elérnie.**

---

## 3. Senki nem tudja pontosan, ki mit módosított

Ez különösen problémás lehet pénzügyi, ügyfél- vagy készletadatoknál.

Egy Excel-folyamatban lehetnek változáskövetési lehetőségek, de ezek használata és elérhetősége függ a fájl formátumától, az Excel-verziótól és a munkafolyamattól. A Microsoft például jelzi, hogy bizonyos régebbi vagy egyszeri vásárlású Excel-verziókkal végzett módosítások nem jelennek meg a modern „Show Changes” nézetben. [Microsoft – Get help with Show Changes in Excel](https://support.microsoft.com/en-gb/excel/get-help-with-show-changes-in-excel)

Egy dedikált üzleti rendszerben viszont az auditálás eleve a rendszer része lehet:

```text
2026.09.30. 10:32
Kovács Anna
Ügyfél: #1245
Státusz:
"Ajánlat" → "Megrendelés"
```

Az audit trail nem minden vállalkozásnál szükséges.

De amikor már szükség lenne rá, általában későn derül ki, hogy az Excel nem erre lett kitalálva.

A rendszeres eseménynaplózás és az auditálható események meghatározása a biztonsági és informatikai kontrollokban is bevett gyakorlat. [NIST – Audit and Accountability](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/800-171r3/NIST.SP.800-171r3.html)

---

## 4. Ugyanazt az adatot több helyre be kell írni

Ez talán még fontosabb jel.

Például egy új ügyfél érkezik:

```text
Weboldal
   ↓
Excel
   ↓
CRM
   ↓
Számlázó
   ↓
Projekt Excel
   ↓
E-mail
```

Ha ugyanazt az adatot több rendszerbe manuálisan kell beírni, az nemcsak időt vesz el.

**Minden egyes másolás egy újabb lehetőség a hibára.**

Egy név elgépelhető.

Egy telefonszám kimaradhat.

Egy ár rossz helyre kerülhet.

Egy státusz elfelejtődhet.

Egy jó rendszerben lehetőség van arra, hogy az adat egyszer kerüljön be, majd a megfelelő rendszerek között automatikusan mozogjon.

Erről részletesebben az előző, üzleti rendszerek összekapcsolásáról szóló cikkben is írtunk.

---

## 5. Már nem egy ember használja

Amíg egy Excel-fájlt egy ember kezel, sok probléma egyszerűen nem jelentkezik.

Amikor viszont:

- értékesítés,
- pénzügy,
- ügyfélszolgálat,
- vezetőség

mind ugyanazt az adatot használja, már mások az elvárások.

Ki mit módosíthat?

Ki láthatja?

Ki hagyhatja jóvá?

Mi történik, ha két ember egyszerre módosít valamit?

Mi történik, ha valaki kilép a cégtől?

A Microsoft 365-ös Excelben már léteznek együttműködési és hozzáférés-kezelési lehetőségek, de ezek nem feltétlenül helyettesítenek egy olyan üzleti rendszert, amelynek eleve része a szerepkörök, folyamatok és üzleti szabályok kezelése. [Microsoft – Best practices for coauthoring](https://support.microsoft.com/en-us/excel/get-started/best-practices-for-coauthoring-in-excel)

---

## 6. Az Excel-fájl már „az egész vállalkozás”

Ez az egyik legjobb teszt.

Képzeld el, hogy valaki azt mondja:

> „Ha ez az Excel-fájl eltűnne, gyakorlatilag leállna az egyik üzleti folyamatunk.”

Ez már komoly figyelmeztető jel.

Nem feltétlenül azért, mert az Excel technikailag rossz.

Hanem azért, mert **egy üzleti szempontból kritikus folyamat egyetlen fájlra épül.**

Ilyenkor érdemes megvizsgálni:

- hol tároljuk az adatot,
- ki fér hozzá,
- milyen mentések vannak,
- hogyan követjük a változásokat,
- hogyan állítjuk vissza a korábbi állapotot,
- hogyan biztosítjuk az adat helyességét.

---

## 7. Milyen ponton érdemes váltani?

Nincs olyan szabály, hogy például 10 vagy 50 alkalmazott után kötelező elhagyni az Excelt.

A vállalkozás mérete önmagában nem jó mérce.

Egy 5 fős vállalkozás is kinőheti az Excelt egy összetett folyamatnál.

Egy 50 fős vállalkozás pedig bizonyos feladatokat továbbra is tökéletesen kezelhet vele.

Jobb kérdéseket feltenni:

- Hány ember használja?
- Hány folyamat függ tőle?
- Hány helyen szerepel ugyanaz az adat?
- Mennyi manuális másolás történik?
- Milyen gyakran történik hiba?
- Mennyibe kerül egy hiba?
- Szükség van jogosultságokra?
- Szükség van audit trailre?
- Kell automatikus riport?
- Kell API-integráció?
- Mi történik, ha a folyamatot jelenleg kezelő ember nincs bent?

Ha ezekre egyre több kellemetlen válasz születik, valószínűleg elérkezett az idő a következő lépésre.

---

## Nem feltétlenül egyedi szoftver a következő lépés

Amikor egy vállalkozás kinövi az Excelt, sokan rögtön egy saját fejlesztésű rendszerre gondolnak.

Pedig legalább három irány létezik.

### 1. Kész SaaS rendszer

Egy meglévő, előfizetéses üzleti szoftver.

Például:

- CRM,
- projektmenedzsment,
- készletkezelő,
- ERP,
- számlázó,
- helpdesk.

**Előnye:** gyorsabban bevezethető.

**Hátránya:** alkalmazkodnod kell a rendszer működéséhez.

Akkor jó választás, ha a vállalkozás folyamata nagyjából megfelel egy már létező termék logikájának.

---

## 2. Low-code / no-code rendszer

A low-code megoldásokkal kevesebb klasszikus programozással lehet üzleti alkalmazásokat és workflow-kat létrehozni.

Ez különösen érdekes lehet belső folyamatoknál:

```text
Űrlap
  ↓
Adatbázis
  ↓
Jóváhagyás
  ↓
Értesítés
  ↓
Riport
```

Előnye, hogy gyorsan lehet prototípust készíteni.

Hátránya, hogy a platform korlátai és hosszú távú költségei fontos szemponttá válhatnak.

Ezért nem érdemes csak azért low-code rendszert választani, mert „gyorsabb fejleszteni”.

A teljes életciklust kell nézni.

---

## 3. Egyedi fejlesztés

Ha a vállalkozás működése nagyon specifikus, lehet értelme saját rendszert építeni.

Például:

```text
Weboldal
   ↓
Saját üzleti rendszer
   ├── ügyfelek
   ├── projektek
   ├── feladatok
   ├── dokumentumok
   └── riportok
          ↓
      számlázó
```

Az egyedi rendszer előnye, hogy a folyamatot lehet hozzá igazítani.

A hátránya, hogy fejlesztési, üzemeltetési és karbantartási felelősséggel jár.

**Nem az a cél, hogy minden vállalkozásnak saját szoftvere legyen.**

Az a cél, hogy az üzleti folyamatodhoz megfelelő eszközt használj.

---

## Hogyan érdemes átállni?

Az egyik legnagyobb hiba, amikor valaki megpróbálja az egész Excel-világot egyszerre lecserélni.

Nem szükséges.

### 1. lépés: térképezd fel a folyamatot

Ne az Excelből indulj ki.

A folyamatból.

Például:

```text
Lead érkezik
   ↓
Értékesítő felveszi
   ↓
Ajánlat készül
   ↓
Ügyfél elfogadja
   ↓
Projekt indul
   ↓
Számlázás
```

Ezután jelöld meg, hogy jelenleg hol használtok Excelt.

---

## 2. lépés: keresd meg az adatforrást

Ha ugyanaz az ügyfél öt különböző Excelben szerepel, el kell dönteni:

> **Melyik legyen az egyetlen hivatalos adatforrás?**

Ez gyakran fontosabb kérdés, mint maga a technológia.

Például:

```text
Ügyfél
   ↓
CRM = egyetlen hivatalos rekord
   ↓
Projekt
   ↓
Számlázás
```

A többi rendszer innen kapja meg az adatot.

---

## 3. lépés: ne minden funkciót építs meg egyszerre

Első verzióban lehet, hogy csak ez kell:

- ügyfélkezelés,
- státuszok,
- keresés,
- jogosultságok,
- alap riport.

A bonyolult dashboard ráér.

Az AI ráér.

A mobilalkalmazás ráér.

A 25 különböző automatikus értesítés ráér.

**Először azt a problémát oldd meg, ami miatt kinőtted az Excelt.**

---

## 4. lépés: tisztítsd meg az adatokat

Ez az átállás egyik legfontosabb része.

Az Excelben lehetnek:

- duplikált ügyfelek,
- hiányzó adatok,
- eltérő elnevezések,
- régi rekordok,
- hibás telefonszámok,
- eltérő dátumformátumok.

Például:

```text
ABC Kft.
ABC KFT
ABC Kft
Abc Kft.
```

Egy ember számára ezek valószínűleg ugyanazt jelentik.

Egy adatbázis számára viszont nem feltétlenül.

**Nem érdemes a régi Excel káoszát egy új rendszerbe egyszerűen átmásolni.**

Először tisztítani kell.

---

## 5. lépés: induljon párhuzamosan

Az átállásnál sokszor jobb egy rövid átmeneti időszak.

```text
Excel
  ↓
adatimport
  ↓
Új rendszer
  ↓
teszt
  ↓
ellenőrzés
  ↓
éles használat
```

Egy ideig lehet ellenőrizni, hogy az új rendszer ugyanazokat az eredményeket adja-e.

Ha minden rendben van, az Excel fokozatosan kikerülhet a folyamatból.

---

## 6. lépés: az Excelt ne feltétlenül töröld ki azonnal

A régi fájlokat érdemes archiválni.

Nem azért, hogy továbbra is azokkal dolgozzatok.

Hanem azért, hogy megmaradjon a történeti adat és legyen visszakereshető előzmény.

Az aktív üzleti folyamat azonban már az új rendszerben fusson.

---

## Mennyi idő és pénz egy ilyen váltás?

Erre nincs univerzális ár.

Egy egyszerű belső folyamat kész SaaS rendszerrel akár külön fejlesztés nélkül is megoldható.

Egy low-code alkalmazás költsége a platformtól és a szükséges munkától függ.

Egy egyedi üzleti rendszer pedig már komolyabb fejlesztési projekt lehet.

**Guide árként**, magyar kisvállalkozási környezetben egy egyszerű, néhány folyamatot kezelő egyedi belső rendszer fejlesztése lehet például **500 000–2 000 000 Ft**, míg egy összetettebb rendszer ennél jelentősen többe kerülhet.

Ez nem hivatalos piaci árlista, hanem nagyságrendi példa.

A fontosabb kérdés inkább az:

> **Mennyibe kerül ma az Excel használata?**

Nem csak a szoftver ára számít.

Számold hozzá:

- a manuális adatbevitelt,
- a hibák javítását,
- az elveszett információt,
- a riportok elkészítésére fordított időt,
- a duplikált munkát,
- az üzleti döntések késését.

Lehet, hogy az Excel „ingyenesnek” tűnik.

A folyamat köré épített munka viszont egyáltalán nem az.

---

## Nem kell abbahagyni az Excel használatát

Ez is fontos.

Egy vállalkozás akkor is használhat Excelt, amikor már van saját CRM-je, ERP-je vagy belső rendszere.

Például:

```text
Vállalati rendszer
       ↓
adatok exportja
       ↓
Excel elemzés
       ↓
vezetői riport
```

Az Excel ilyenkor elemzőeszköz.

Nem pedig az egész vállalkozás adatbázisa.

**Az Excel helye nem feltétlenül eltűnik. A szerepe változik meg.**

---

## A valódi kérdés nem az, hogy „Excel vagy rendszer?”

Hanem az, hogy **melyik feladatra melyik eszköz a megfelelő.**

Excel:

- gyors számítás,
- elemzés,
- egyszeri kimutatás,
- ad-hoc feladat.

Üzleti rendszer:

- közös adatbázis,
- jogosultságok,
- folyamatok,
- audit trail,
- automatizálás,
- integráció,
- több felhasználó.

A kettő akár együtt is működhet.

---

## A legfontosabb kérdés

> **Ha holnap az a kolléga, aki az Excel-folyamatot a legjobban ismeri, két hétre kiesik, a vállalkozás ugyanúgy működik tovább?**

Ha a válasz nem, akkor valószínűleg nem egyszerűen egy Excel-fájlról van szó.

Hanem egy olyan üzleti folyamatról, amelynek a működése egy ember fejében és egy táblázatban van elrejtve.

Ilyenkor nem feltétlenül kell azonnal többmilliós vállalati rendszert építeni. Először érdemes feltérképezni a folyamatot, az adatokat és a valódi problémákat, majd kiválasztani, hogy kész SaaS, low-code vagy egyedi fejlesztés illik hozzá.

**softwaredevelopment.hu — Az Excel nem ellenség. Akkor válik problémává, amikor már egy teljes üzleti folyamatot próbálsz egy táblázattal működtetni.**

---

## Források

- Microsoft: [Collaborate on Excel workbooks at the same time with co-authoring](https://support.microsoft.com/en-us/excel/get-started/collaborate-on-excel-workbooks-at-the-same-time-with-co-authoring)
- Microsoft: [Excel file is locked for editing](https://support.microsoft.com/en-us/excel/excel-file-is-locked-for-editing)
- Microsoft: [Protection and security in Excel](https://support.microsoft.com/en-us/excel/protection-and-security-in-excel)
- Microsoft: [Get help with Show Changes in Excel](https://support.microsoft.com/en-gb/excel/get-help-with-show-changes-in-excel)
- Microsoft: [Best practices for coauthoring in Excel](https://support.microsoft.com/en-us/excel/get-started/best-practices-for-coauthoring-in-excel)
- Microsoft: [Restrict changes to files in Excel](https://support.microsoft.com/en-us/excel/restrict-changes-to-files-in-excel)
- NIST: [Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/800-171r3/NIST.SP.800-171r3.html)
- European Commission: [Digital Decade 2025 – Digitalisation of Business in the EU Member States](https://digital-strategy.ec.europa.eu/en/library/digital-decade-2025-digitalisation-business-eu-member-states)
- European Commission: [Commission reports show continued growth of European SMEs](https://single-market-economy.ec.europa.eu/news/commission-reports-show-continued-growth-european-smes-and-highlight-challenges-women-entrepreneurs-2026-06-22_en)
