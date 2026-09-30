---
title: "Mennyibe kerül egy saját szoftver fejlesztése? – Mitől függ az ár?"
description: "Mennyibe kerül egy egyedi szoftver? Megmutatjuk, mi határozza meg az árat, milyen költségekkel számolj, és hogyan csökkentheted a kockázatot."
tags: [egyedi-szoftver, szoftverfejlesztés, fejlesztési-költség, mvp, digitalizáció]
date: 2026-10-15 08:00
image: /articles/how-much-does-custom-software-cost/share-hu.jpg
---

## Egy saját szoftver ára nem egyetlen funkciótól függ

Amikor egy vállalkozás saját szoftvert szeretne fejleszteni, az első kérdés általában:

> „Mennyibe fog ez kerülni?”

A válasz viszont nem az, hogy „egy webalkalmazás ennyibe kerül”. Két látszólag hasonló rendszer fejlesztési költsége között akár többszörös különbség is lehet.

Egy egyszerű belső nyilvántartás és egy olyan rendszer, amely ügyfeleket kezel, számláz, külső rendszerekhez kapcsolódik, jogosultságokat kezel és automatikusan riportokat készít, technikailag teljesen más nagyságrend.

**A szoftver ára elsősorban nem a képernyők számától, hanem a mögöttük lévő üzleti logikától, integrációktól, biztonsági követelményektől és üzemeltetéstől függ.**

A 2026-os magyar piacon egy kisebb, jól körülhatárolt egyedi üzleti alkalmazás néhány millió forintos projekt lehet, míg egy összetettebb CRM, vállalatirányítási rendszer vagy ügyfélplatform könnyen elérheti a több tízmillió forintos nagyságrendet. Magyar fejlesztői piaci becslések alapján a projektek körülbelül 1,5–50+ millió Ft között is mozoghatnak, a rendszertől és a hatókörtől függően. Ez piaci irányszám, nem hivatalos tarifa. [AppForge – Custom Software Development Costs in 2026](https://appforge.hu/en/blog/custom-software-development-cost-2026/)

---

## Mi kerül valójában pénzbe?

Egy saját szoftvernél nem csak a programozásért fizetsz.

A projekt tipikusan több részből áll:

- üzleti és technikai tervezés,
- frontend fejlesztés,
- backend fejlesztés,
- adatbázis,
- adminisztrációs felület,
- külső rendszerek integrációja,
- jogosultságkezelés,
- tesztelés,
- biztonsági ellenőrzések,
- telepítés és üzemeltetés,
- dokumentáció,
- későbbi karbantartás.

Ezek közül néhányat a felhasználó közvetlenül lát, másokat egyáltalán nem.

Ezért félrevezető például azt mondani, hogy:

> „Csak 10 oldal kell, ez nem lehet drága.”

Lehet.

Ha a 10 oldal mögött összetett jogosultságok, automatizmusok, számlázás, API-kapcsolatok és bonyolult üzleti szabályok vannak, a képernyők száma önmagában keveset mond.

---

## 1. A funkciók mennyisége és összetettsége

Ez az egyik legfontosabb költségtényező.

Egy egyszerű ügyféllista például lehet:

- név,
- e-mail,
- telefonszám,
- keresés,
- szerkesztés,
- törlés.

Egy valódi CRM-ben viszont ugyanez már tartalmazhat:

- ügyféltörténetet,
- ajánlatokat,
- feladatokat,
- státuszokat,
- automatikus értesítéseket,
- dokumentumokat,
- riportokat,
- jogosultságokat,
- exportokat,
- külső integrációkat.

A két rendszer kívülről hasonlóan nézhet ki, a fejlesztési munka viszont nagyon különböző lehet.

**Minél több üzleti szabályt kell a rendszernek automatikusan betartania, annál nagyobb a fejlesztési munka.**

---

## 2. Frontend – amit a felhasználó lát

A frontend a rendszer látható része.

Ide tartozik például:

- bejelentkezés,
- dashboard,
- listák,
- űrlapok,
- táblázatok,
- grafikonok,
- keresés és szűrés,
- mobilnézet,
- értesítések,
- fájlfeltöltés.

Egy egyszerű adminfelület általában kevesebb munkát igényel, mint egy ügyfelek által is használt, teljesen egyedi felhasználói felület.

Külön költségtényező lehet az UX/UI tervezés is.

Ha csak egy működő belső rendszerre van szükséged, elegendő lehet egy jól használható, meglévő komponensekre épülő felület.

Egy ügyfeleknek értékesített digitális terméknél viszont a felhasználói élmény már üzleti kérdés.

---

## 3. Backend – a rendszer motorja

A backendben történik az üzleti logika jelentős része.

Például:

- ki mit láthat,
- ki mit módosíthat,
- hogyan számolódik ki egy ár,
- mikor küldjön e-mailt a rendszer,
- mikor változzon egy státusz,
- hogyan működjön egy jóváhagyási folyamat,
- hogyan kommunikáljon más rendszerekkel.

Ez az a rész, amit a felhasználó sokszor nem lát, mégis jelentős része lehet a fejlesztési költségnek.

Egy egyszerű CRUD rendszer backendje és egy több szerepkörös, összetett üzleti folyamatokat kezelő rendszer backendje között nagyságrendi különbség is lehet.

---

## 4. Adatbázis

A legtöbb üzleti szoftver valamilyen adatbázisra épül.

Tárolni kell például:

- ügyfeleket,
- termékeket,
- rendeléseket,
- számlákat,
- felhasználókat,
- jogosultságokat,
- dokumentumokat,
- eseményeket.

Nem mindegy azonban, hogy csak néhány egyszerű táblára van szükség, vagy egymással összefüggő üzleti adatok százait kell kezelni.

A komplexitást tovább növelheti:

- nagy adatmennyiség,
- keresések optimalizálása,
- riportok,
- adatimport,
- régi rendszerből történő migráció,
- biztonsági mentések,
- naplózás.

---

## 5. Adminfelület és jogosultságok

Az adminisztrációs felületet gyakran alábecsülik.

Pedig egy vállalati rendszerben nem csak egy „admin” és egy „felhasználó” létezhet.

Lehet például:

- adminisztrátor,
- értékesítő,
- könyvelő,
- projektvezető,
- ügyfélszolgálatos,
- külső partner.

És mindegyikük mást láthat és módosíthat.

**A jogosultságkezelés nem pusztán egy extra kapcsoló a rendszerben: minden releváns funkciót és tesztesetet érinthet.**

A biztonságos hozzáférés-vezérlés és annak ellenőrzése önálló fejlesztési és tesztelési feladat lehet. Az OWASP Application Security Verification Standard például külön területeként kezeli az autentikációt, a sessionkezelést, a hozzáférés-vezérlést és az adatvédelmet. [OWASP ASVS](https://owasp.org/projects/asvs)

---

## 6. Integrációk: amikor a szoftvernek beszélnie kell más rendszerekkel

Az integráció gyakran az egyik legnagyobb költségnövelő tényező.

Például össze kell kapcsolni a rendszert:

- számlázóval,
- webshopmotorral,
- bankkal,
- futárszolgálattal,
- CRM-mel,
- ERP-vel,
- NAV Online Számlával,
- e-mail szolgáltatóval,
- külső API-val.

Egy API-integráció nem feltétlenül csak annyiból áll, hogy „lekérünk néhány adatot”.

Figyelni kell:

- hitelesítésre,
- hibák kezelésére,
- időtúllépésekre,
- újrapróbálkozásra,
- adateltérésekre,
- naplózásra,
- verzióváltozásokra.

**Három-négy külső rendszer összekötése már önmagában jelentős fejlesztési munkát jelenthet.**

---

## 7. Tesztelés és biztonság

A fejlesztés nem akkor ér véget, amikor „már működik”.

Tesztelni kell például:

- normál felhasználói folyamatokat,
- hibás adatokat,
- jogosultságokat,
- API-kat,
- integrációkat,
- különböző eszközöket és böngészőket,
- adatkezelési folyamatokat.

Egy üzletileg fontos rendszer esetében a biztonsági tesztelés sem elhanyagolható. Az OWASP ASVS kifejezetten arra szolgál, hogy a webalkalmazások biztonsági kontrolljainak ellenőrzéséhez strukturált követelményrendszert adjon. [OWASP Application Security Verification Standard](https://owasp.org/projects/asvs?tab=main)

Ezért amikor egy ajánlatot hasonlítasz össze, érdemes megkérdezni:

> „A tesztelés pontosan mit tartalmaz?”

Mert az egyik ajánlatban lehet automatizált tesztelés, manuális ellenőrzés és biztonsági tesztelés, míg a másikban csak a fejlesztő saját ellenőrzése.

---

## Mennyibe kerülhet egy saját szoftver?

Az alábbi összegek **2026-os, magyar piaci irányszámok**, nem hivatalos árlisták. A konkrét projekt ára a részletes specifikáció után határozható meg.

| Rendszer típusa | Irányár |
|---|---:|
| Egyszerű belső üzleti alkalmazás | 1,5–4 M Ft |
| Komplexebb adminisztrációs rendszer | 3–8 M Ft |
| Ügyfélportál | 3–10 M Ft |
| Egyedi CRM | 8–30+ M Ft |
| Összetett üzleti platform | 15–50+ M Ft |
| Nagy ERP / több rendszeres vállalati megoldás | 30–100+ M Ft |

A tartományok szándékosan szélesek. Egy egyedi CRM például lehet egy néhány modulból álló, belső használatú rendszer, de lehet több vállalati rendszerrel integrált platform is.

A 2026-os magyar fejlesztői piacon publikált piaci becslések szintén többmilliós belső alkalmazásoktól több tízmilliós CRM- és ERP-projektekig terjedő sávokat mutatnak. [AppForge – Custom Software Development Costs in 2026](https://appforge.hu/en/blog/custom-software-development-cost-2026/)

---

## És mennyibe kerül a fenntartás?

A fejlesztési költség csak a kezdet.

Egy működő rendszerhez szükség lehet:

- szerverre vagy cloud infrastruktúrára,
- adatbázisra,
- biztonsági mentésekre,
- monitorozásra,
- domainre és SSL-re,
- hibajavításokra,
- biztonsági frissítésekre,
- külső API-k karbantartására,
- kisebb fejlesztésekre.

A cloud költsége használattól függ. Az AWS például külön kezeli a számítási kapacitás és az adatbázis költségeit, és mindkettő használat alapú lehet. [AWS EC2 Pricing](https://aws.amazon.com/ec2/pricing/on-demand/) [AWS RDS Pricing](https://aws.amazon.com/rds/pricing/)

**Egy kis rendszer hostingja lehet havi néhány ezer vagy néhány tízezer forint, egy nagyobb, magas rendelkezésre állású rendszeré viszont ennek sokszorosa is lehet.**

A karbantartásra gyakran használt iparági ökölszabály az éves fejlesztési költség körülbelül 15–20%-a, de ez csak tervezési irányelv. A tényleges összeg attól függ, mennyi támogatást, frissítést és továbbfejlesztést kérsz. [MG Software – Custom Software Maintenance Cost](https://www.mgsoftware.nl/en/blog/what-does-custom-software-maintenance-cost)

---

## Hogyan lehet csökkenteni a kockázatot?

A legnagyobb hiba gyakran nem az, hogy túl drága a fejlesztés.

Hanem az, hogy egy vállalkozás az első verzióba megpróbál mindent beletenni.

Jobb megközelítés az MVP.

### Mi legyen az MVP-ben?

Az MVP nem egy „rosszabb minőségű” szoftver.

Hanem az első olyan verzió, amely a legfontosabb üzleti problémát már valóban megoldja.

Például egy belső munkafolyamatnál:

**MVP**

- bejelentkezés,
- ügyfelek kezelése,
- feladatok kezelése,
- státuszok,
- alap riport.

**2. fázis**

- automatikus e-mailek,
- részletes riportok,
- dokumentumkezelés,
- külső integrációk.

**3. fázis**

- mobilalkalmazás,
- automatizált folyamatok,
- fejlettebb analitika,
- további rendszerek integrációja.

Így nem kell az első napon kifizetned minden olyan funkció fejlesztését, amelynek üzleti értékét még nem ismered.

---

## Az olcsóbb fejlesztés nem feltétlenül a kevesebb munka

Három dologgal lehet érdemben csökkenteni a kezdeti költséget:

1. **Kevesebb funkcióval indulni.**
2. **Kész, bevált komponenseket és szolgáltatásokat használni, ahol ez ésszerű.**
3. **Fázisokra bontani a fejlesztést.**

Amit viszont nem érdemes „kispórolni”:

- biztonság,
- adatmentés,
- alapvető tesztelés,
- jogosultságkezelés,
- hibakezelés,
- dokumentáció,
- karbantartható kód.

Ezek kihagyása később sokkal drágább lehet.

---

## Mit kérj egy fejlesztőtől árajánlat előtt?

Ne csak ezt kérdezd:

> „Mennyibe kerülne egy ilyen rendszer?”

Adj inkább egy rövid üzleti specifikációt:

- kik használják,
- milyen problémát old meg,
- milyen folyamatot kell kezelnie,
- milyen adatokat tárol,
- milyen külső rendszerekhez kapcsolódik,
- milyen jogosultságok vannak,
- mi legyen az első verzióban,
- mi kerülhet későbbi fázisba.

Ezután már sokkal értelmesebb ajánlatot lehet készíteni.

Érdemes azt is tisztázni, hogy az ár tartalmazza-e:

- a tervezést,
- UI/UX munkát,
- frontend és backend fejlesztést,
- adatbázist,
- tesztelést,
- telepítést,
- dokumentációt,
- garanciális javításokat,
- hostingot,
- karbantartást.

---

## A saját szoftver nem feltétlenül több tízmilliós projekt

Egy saját rendszer lehet néhány millió forintos fejlesztés is, ha jól körülhatárolt problémát old meg.

A nagyobb költség általában akkor jelenik meg, amikor sok felhasználói szerepkör, összetett üzleti logika, több külső rendszer, egyedi frontend, komoly adatkezelés és magasabb rendelkezésre állási igény kerül a projektbe.

**A legjobb költségcsökkentés sokszor nem az olcsóbb fejlesztő keresése, hanem a megfelelő első verzió meghatározása.**

### Mennyit érdemes első körben fejlesztened?

Ha van egy ötleted egy saját vállalati rendszerre, ne azzal kezdd, hogy minden elképzelt funkciót felsorolsz.

Kezdd azzal, hogy megfogalmazod:

> „Mi az az egy üzleti probléma, amit a rendszernek mindenképpen meg kell oldania?”

Ha ez megvan, az MVP és a későbbi fejlesztési fázisok már sokkal könnyebben meghatározhatók.

A cél nem az, hogy minél több szoftvert építsünk. **Hanem hogy annyit építsünk, amennyi valódi üzleti értéket ad.**

**softwaredevelopment.hu — Egyedi webalkalmazások, üzleti rendszerek és integrációk fejlesztése vállalkozásoknak.**

---

## Források

- AppForge: [Custom Software Development Costs in 2026](https://appforge.hu/en/blog/custom-software-development-cost-2026/)
- OWASP: [Application Security Verification Standard](https://owasp.org/projects/asvs?tab=main)
- OWASP Developer Guide: [ASVS](https://devguide.owasp.org/en/06-verification/01-guides/03-asvs/)
- AWS: [Amazon EC2 On-Demand Pricing](https://aws.amazon.com/ec2/pricing/on-demand/)
- AWS: [Amazon RDS Pricing](https://aws.amazon.com/rds/pricing/)
- MG Software: [What Does Custom Software Maintenance Cost Per Year?](https://www.mgsoftware.nl/en/blog/what-does-custom-software-maintenance-cost)
- Eurostat: [Digitalisation in Europe – 2026 edition](https://ec.europa.eu/eurostat/en/web/interactive-publications/digitalisation-2026)
