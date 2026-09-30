---
title: "Miért kerül egy egyedi szoftver többe, mint egy kész alkalmazás?"
description: "Egy kész alkalmazás olcsóbbnak tűnik, de hosszú távon nem mindig az. Nézzük meg a fejlesztés, előfizetés, integráció és fenntartás valódi költségét."
tags: [egyedi-szoftver, kész-szoftver, tco, szoftverfejlesztés, digitalizáció]
date: 2026-10-16 08:00
image: /articles/why-custom-software-costs-more/share-hu.jpg
---

## Miért drágább elsőre a saját szoftver?

Ha egy vállalkozásnak szüksége van egy új rendszerre, két út általában gyorsan felmerül:

- előfizetünk egy kész alkalmazásra,
- vagy készíttetünk egy sajátot.

A kész alkalmazásnál az ár elsőre nagyon vonzónak tűnhet.

Havi 20 000 Ft, 50 000 Ft vagy 100 000 Ft még egészen más döntésnek látszik, mint egy többmilliós egyedi fejlesztés.

És sok esetben valóban a kész alkalmazás a jobb választás.

**A probléma akkor kezdődik, amikor csak a kezdeti árat hasonlítjuk össze, nem pedig a teljes használati költséget és az üzleti értéket.**

A Microsoft Azure Well-Architected Framework is azt javasolja, hogy a build-or-buy döntésnél a fejlesztési erőforrást, infrastruktúrát, karbantartást, támogatást, licenceket és előfizetéseket együtt vizsgáljuk. :contentReference[oaicite:0]{index=0}

---

## A kész alkalmazás nem feltétlenül „olcsóbb”

Egy kész SaaS alkalmazásnál jellemzően előfizetsz egy már működő szolgáltatásra.

A szolgáltató biztosítja többek között:

- az alkalmazást,
- a szerveroldali infrastruktúrát,
- a frissítéseket,
- a hibajavításokat,
- bizonyos biztonsági feladatokat,
- a támogatást.

Ezért nincs szükséged többmilliós kezdeti fejlesztésre.

Cserébe folyamatosan fizetsz.

Például egy egyszerű, szemléltető modell:

| Megoldás | Kezdeti költség | Havi költség |
|---|---:|---:|
| Kész alkalmazás | 0–300 ezer Ft | 30–100 ezer Ft |
| Egyedi szoftver | 5–10 M Ft | 50–200 ezer Ft |

**Ezek csak példaszámok, nem piaci árlisták.**

A kész rendszer lehet sokkal olcsóbb az első évben.

De nézzük meg öt év alatt.

Egy havi 100 000 Ft-os előfizetés:

```text
100 000 × 12 × 5 = 6 000 000 Ft
```text

És ebben még nincs benne:

- extra felhasználók díja,
- prémium funkciók,
- API-használat,
- további modulok,
- egyedi integráció,
- migráció,
- esetleges bevezetési díj.

A teljes tulajdonlási költség (TCO) éppen azért hasznos, mert nem csak a vételárat, hanem a teljes életciklus közvetlen és közvetett költségeit vizsgálja. :contentReference[oaicite:1]{index=1}

---

## Miért drága az egyedi szoftver?

Azért, mert valakinek először létre kell hoznia.

Egy kész alkalmazás esetében a fejlesztési költséget már sok másik ügyféllel közösen finanszírozzátok.

Ha egy SaaS terméket 5 000 vállalkozás használ, a szolgáltató ugyanazt a szoftvert sok ügyfél között tudja megosztani.

Egy saját rendszer esetében viszont a te üzleti folyamataidra készül a szoftver.

Ez azt jelenti, hogy valakinek ki kell fejlesztenie:

- a frontend működését,
- a backend logikát,
- az adatbázist,
- a jogosultságokat,
- az adminisztrációs felületet,
- az API-kat,
- az integrációkat,
- a hibakezelést,
- a teszteket,
- a telepítést.

**A magasabb kezdeti ár jelentős része annak az ára, hogy nem egy meglévő terméket használsz, hanem létrehozol egy újat.**

---

## A fejlesztési idő csak az egyik tényező

Egy saját szoftver elkészítése nem abból áll, hogy egy fejlesztő „megír néhány oldalt”.

A fejlesztés előtt meg kell érteni:

- mi a folyamat,
- milyen üzleti szabályok vannak,
- milyen adatokat kell tárolni,
- kik használják a rendszert,
- milyen jogosultságok vannak,
- milyen külső rendszerekhez kell kapcsolódni.

Utána jön a tervezés és implementáció.

Majd:

- tesztelés,
- hibajavítás,
- telepítés,
- monitoring,
- dokumentáció,
- későbbi karbantartás.

Ezért egy egyedi rendszer költségét nem érdemes pusztán a fejlesztői órák számával magyarázni.

A szoftver teljes életciklusa számít.

---

## A saját üzleti logika pénzbe kerül

A kész alkalmazás egyik legnagyobb előnye, hogy már megoldott üzleti problémákra épül.

Ha például egy kész számlázóprogramot választasz, nem neked kell kifizetned annak fejlesztését.

A saját rendszer viszont pontosan azt tudja, amit te szeretnél.

Ez lehet például:

- saját jóváhagyási folyamat,
- egyedi árképzés,
- speciális ügyfélkezelés,
- saját munkafolyamat,
- egyedi riportok,
- különleges jogosultsági modell.

Minél jobban eltér a vállalkozásod működése a kész alkalmazás által feltételezett folyamattól, annál több egyedi fejlesztésre lehet szükség.

> **A kérdés nem az, hogy „kell-e nekünk egy CRM?”, hanem az, hogy a vállalkozásunknak szüksége van-e olyan CRM-re, amelyet a meglévő termékek nem tudnak megfelelően kezelni.**

---

## Az integráció különösen meg tudja növelni az árat

Tegyük fel, hogy találtál egy kész alkalmazást, amely szinte mindent tud.

Csakhogy össze kellene kötni:

- a webshopoddal,
- a számlázóddal,
- a CRM-mel,
- a készletkezelőddel,
- a saját belső rendszereddel.

Ekkor a kész alkalmazás ára már nem feltétlenül csak az előfizetés.

Megjelenhetnek:

- API-díjak,
- integrációs szolgáltatások,
- fejlesztési költségek,
- middleware vagy iPaaS díjak,
- egyedi adatmozgatás,
- karbantartási költségek.

A Microsoft build-or-buy útmutatója is kiemeli, hogy a vásárolt megoldás előnye lehet az alacsonyabb induló költség és gyorsabb bevezetés, miközben a testreszabás és a hosszú távú karbantartás külön szempontként jelenik meg. :contentReference[oaicite:2]{index=2}

---

## És mi történik, ha a kész alkalmazás megváltozik?

Ez egy gyakran elfelejtett kockázat.

A kész szoftver nem a te tulajdonodban van.

A szolgáltató dönthet például:

- új funkciók bevezetéséről,
- API módosításáról,
- árak emeléséről,
- csomagok átalakításáról,
- egy funkció megszüntetéséről,
- egy régi verzió kivezetéséről.

A SaaS-előfizetések egyik jellemzője éppen a folyamatos szolgáltatási modell: a számlázás lehet havi vagy éves, a szolgáltató pedig a terméket továbbra is karbantartja. :contentReference[oaicite:3]{index=3}

Ez kényelmes.

De egyben függőséget is jelent.

**Kész alkalmazásnál általában a szolgáltató termékstratégiájához igazodsz. Saját szoftvernél te határozod meg a termékstratégiát.**

---

## A saját szoftver sem „egyszer kifizetem és kész”

Ez a másik gyakori tévhit.

Egy saját rendszer fejlesztése után is lesznek költségek.

Például:

- hosting,
- adatbázis,
- biztonsági mentések,
- monitoring,
- biztonsági frissítések,
- függőségek frissítése,
- hibajavítás,
- új funkciók,
- külső API-k változásainak kezelése.

A Microsoft saját útmutatója is kiemeli, hogy a saját megoldások jelentős kezdeti beruházást és folyamatos karbantartást igényelnek. :contentReference[oaicite:4]{index=4}

SaaS esetében ezeknek a feladatoknak egy jelentős részét a szolgáltató végzi el.

Ez az előfizetés egyik valódi értéke.

---

## Tulajdonjog: mit kapsz a pénzedért?

Egy saját fejlesztésnél fontos kérdés:

> „Kié lesz a szoftver?”

Nem minden fejlesztési szerződés jelent automatikusan ugyanazt.

Érdemes tisztázni:

- ki birtokolja a forráskódot,
- milyen licenceket kapsz,
- hol fut a rendszer,
- ki fér hozzá az adatbázishoz,
- ki kezelheti a szervert,
- hogyan lehet másik fejlesztőnek átadni a rendszert,
- milyen külső komponenseket használ a szoftver.

Ez különösen fontos hosszú távú üzleti rendszereknél.

**A saját szoftver egyik legfontosabb előnye a kontroll.**

Nem feltétlenül azért, mert minden technikai elemet neked kell kezelned, hanem azért, mert a rendszert a saját üzleti igényeid köré építheted.

---

## Mikor jobb a kész alkalmazás?

Nagyon sok esetben.

Ha a probléma általános, és több jó kész termék is létezik rá, általában nincs sok értelme újra feltalálni.

Például:

- projektmenedzsment,
- videókonferencia,
- általános könyvelés,
- e-mail marketing,
- egyszerű CRM,
- dokumentumkezelés,
- időpontfoglalás.

Ha egy kész termék:

- megfelelően kezeli a folyamatot,
- elfogadható az ára,
- megfelelőek az integrációi,
- biztonsági és adatvédelmi követelményeidnek megfelel,
- és nem jelent problémát a szolgáltatói függőség,

akkor az egyedi fejlesztés könnyen felesleges költség lehet.

A Microsoft platformstratégiai útmutatója is azt javasolja, hogy egyedi fejlesztést elsősorban olyan területeken érdemes használni, amelyek egyediek és nagy üzleti értéket képviselnek; egyéb esetekben a kész megoldás előnyösebb lehet. :contentReference[oaicite:5]{index=5}

---

## Mikor lehet indokolt a saját szoftver?

A saját fejlesztés akkor válhat érdekessé, amikor a szoftver maga is a vállalkozás működésének fontos része.

Például:

- a vállalkozásnak egyedi munkafolyamatai vannak,
- a kész rendszerekhez túl sok kompromisszum kell,
- több rendszert kell egyetlen folyamatba összekötni,
- fontos az egyedi automatizálás,
- a rendszer versenyelőnyt ad,
- sok manuális munka váltható ki,
- az adatok és folyamatok feletti kontroll kritikus.

Ilyenkor nem egyszerűen egy programot vásárolsz.

**Egy üzleti infrastruktúrát építesz.**

---

## TCO: ne az első éves árat hasonlítsd össze

A korrekt összehasonlítás inkább így néz ki:

### Kész alkalmazás

```text
Előfizetés
+ bevezetés
+ felhasználói licencek
+ extra modulok
+ integrációk
+ adatimport
+ esetleges migráció
+ támogatás
+ switching cost
= teljes költség
```text

### Egyedi szoftver

```text
Tervezés
+ fejlesztés
+ tesztelés
+ bevezetés
+ hosting
+ karbantartás
+ biztonsági frissítések
+ továbbfejlesztés
= teljes költség
```text

A TCO célja éppen az, hogy az egyszeri és folyamatos, közvetlen és közvetett költségeket együtt lásd. :contentReference[oaicite:6]{index=6}

---

## Egy egyszerű ötéves példa

Tegyük fel, hogy egy kész alkalmazás:

- havi 150 000 Ft,
- egyszeri bevezetés 500 000 Ft,
- integrációk és egyéb kezdeti munkák 1 000 000 Ft.

Öt év alatt:

```text
150 000 × 60
+ 500 000
+ 1 000 000
= 10 500 000 Ft
```text

Egy egyedi rendszer például:

- fejlesztés: 8 000 000 Ft,
- kezdeti bevezetés: 500 000 Ft,
- hosting és alap üzemeltetés: havi 80 000 Ft,
- karbantartás és kisebb fejlesztések: átlagosan havi 70 000 Ft.

Öt év alatt:

```text
8 000 000
+ 500 000
+ (80 000 × 60)
+ (70 000 × 60)
= 18 500 000 Ft
```text

**Ebben a példában az egyedi rendszer öt év alatt is drágább.**

És ez teljesen rendben van.

Lehet, hogy közben olyan folyamatokat automatizál, amelyeket a kész rendszerrel csak manuálisan lehetne elvégezni.

A TCO ugyanis nem csak kiadást jelent. Az üzleti értéket is érdemes mellé tenni.

---

## Nem minden költség jelenik meg a számlán

Tegyük fel, hogy egy kész rendszer miatt egy munkatárs hetente három órát tölt adatok másolásával egyik rendszerből a másikba.

Egy másik rendszerben ez automatikus.

A kész alkalmazás lehet olcsóbb.

De a vállalkozásod közben folyamatosan fizet a manuális munkával.

Ezért érdemes kiszámolni:

```text
éves manuális munka
+ hibák költsége
+ duplikált adatbevitel
+ elvesztett idő
+ integrációk költsége
+ előfizetések
```text

**A legolcsóbb szoftver nem feltétlenül a legalacsonyabb teljes költségű megoldás.**

---

## A jó döntés nem mindig a saját fejlesztés

Az egyedi szoftvernek vannak előnyei:

- testreszabhatóság,
- kontroll,
- saját üzleti logika,
- saját fejlesztési irány,
- egyedi integrációk lehetősége.

De vannak hátrányai is:

- magasabb kezdeti költség,
- hosszabb bevezetés,
- karbantartási felelősség,
- fejlesztői függőség,
- folyamatos technikai döntések.

A kész alkalmazás előnyei:

- gyorsabb indulás,
- kisebb kezdeti költség,
- kipróbált funkcionalitás,
- szolgáltatói támogatás,
- folyamatos frissítések.

Hátrányai lehetnek:

- előfizetési díj,
- korlátozott testreszabás,
- szolgáltatói függőség,
- integrációs korlátok,
- a szolgáltató termékstratégiájához való alkalmazkodás.

---

## Mit érdemes választanod?

Érdemes először azt megvizsgálni:

> „A problémám egyedi, vagy egy általános üzleti problémáról van szó?”

Ha általános problémát próbálsz megoldani, kezdd a kész alkalmazásokkal.

Ha viszont a vállalkozásod működése egyedi, és a szoftvernek ezt kell leképeznie, érdemes megvizsgálni az egyedi fejlesztést is.

És van egy harmadik lehetőség is: **a kettő kombinációja.**

Például:

- kész CRM,
- kész számlázó,
- kész e-mail rendszer,
- saját köztes üzleti alkalmazás,
- egyedi integrációk.

Nem kell mindent saját fejlesztésként létrehozni.

A cél az, hogy azt építsd egyedileg, ami valóban megkülönbözteti vagy hatékonyabbá teszi a vállalkozásodat.

### A kérdés nem az, hogy melyik olcsóbb

Hanem az, hogy **melyik megoldás adja a megfelelő üzleti eredményt elfogadható teljes költség mellett.**

A kész alkalmazás sokszor a racionális választás.

Az egyedi szoftver pedig akkor lehet indokolt, amikor a rugalmasság, az automatizálás, a kontroll vagy az egyedi üzleti logika hosszú távon többet ér, mint az alacsonyabb induló költség.

**softwaredevelopment.hu — Egyedi webalkalmazások, üzleti rendszerek és integrációk fejlesztése vállalkozásoknak.**

---

## Források

- Microsoft Azure Well-Architected Framework: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)
- Microsoft Learn: [Refine your Application Platform](https://learn.microsoft.com/en-us/platform-engineering/application-platform)
- Microsoft Azure Well-Architected Framework: [Billing and Cost Management for SaaS Workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/billing-cost-management)
- IBM: [What Is Total Cost of Ownership (TCO)?](https://www.ibm.com/think/topics/total-cost-of-ownership/jcr%3Acontent)
- Microsoft Learn: [Licensing and SaaS](https://learn.microsoft.com/en-us/cloud-computing/finops/framework/optimize/licensing)
- Microsoft Learn: [Sell software subscriptions through CSP](https://learn.microsoft.com/en-us/partner-center/customers/csp-software-subscriptions)
- Microsoft: [Fixed Lifecycle Policy](https://learn.microsoft.com/en-us/lifecycle/policies/fixed)
