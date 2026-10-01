---
title: "Miért lassú a weboldalam? – A leggyakoribb technikai okok"
description: "Lassú a weboldalad? Megmutatjuk a leggyakoribb technikai okokat a tárhelytől a képeken át a JavaScriptig és a gyorsítótárazásig."
tags: [weboldal, teljesítmény, pagespeed, fejlesztés, seo]
date: 2026-10-04 08:00
image: /articles/why-is-my-website-slow/share-hu.jpg
---

Egy lassú weboldalnál könnyű azt mondani: „rossz a tárhely” vagy „túl sok minden van rajta”.

A valóság ennél általában összetettebb.

Lehet, hogy a szerver válaszol lassan. Lehet, hogy egyetlen hatalmas kép fogja vissza az oldal betöltését. Lehet, hogy túl sok JavaScript fut a böngészőben, egy plugin minden oldalon betölt valamit, vagy egy adatbázis-lekérdezés miatt várakozik a szerver.

És az is előfordulhat, hogy maga a weboldal gyorsan betöltődik, de a felhasználó mégis lassúnak érzi, mert a gombok késve reagálnak vagy a tartalom betöltés közben ugrál.

**Ezért a weboldal sebességét nem érdemes egyetlen számmal vagy egyetlen PageSpeed pontszámmal elintézni.**

A Google PageSpeed Insights labor- és valós felhasználói adatokat is használhat a teljesítmény vizsgálatához, ezért jó kiindulópont lehet annak megértéséhez, hol van probléma. ([Google for Developers – About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about))

---

## Először: mit jelent az, hogy lassú?

A „lassú weboldal” több különböző problémát jelenthet.

### Lassú a szerver

A böngésző elküldi a kérést, de sokáig vár az első válaszra.

```text
Böngésző → szerver → adatbázis → alkalmazás → HTML
                         ↑
                    hosszú várakozás
```

### Lassú a böngésző

A szerver már elküldte az oldalt, de a böngészőnek túl sok JavaScriptet, CSS-t vagy más erőforrást kell feldolgoznia.

```text
Szerver → HTML + JS + CSS → böngésző → feldolgozás → használható oldal
                                      ↑
                                  túl sok munka
```

### Lassúak az erőforrások

A HTML gyorsan megérkezik, de például egy 5 MB-os kép vagy egy külső script későn töltődik be.

Ezért érdemes először meghatározni, **hol van a várakozás**.

---

## 1. Gyenge vagy rosszul konfigurált tárhely

A legegyszerűbb esetben maga a szerver okozza a problémát.

Egy olcsó vagy túlterhelt megosztott tárhelyen több weboldal osztozhat ugyanazon erőforrásokon. Egy nagyobb forgalmi időszak vagy másik webhely terhelése is hatással lehet a válaszidőre.

De nem minden lassú szerver egyenlő rossz tárhellyel.

A szerver válaszidejét befolyásolhatja például:

- a szerver terhelése,
- a futtatási környezet,
- az alkalmazás kódja,
- az adatbázis,
- a hálózati kapcsolat,
- a gyorsítótárazás hiánya,
- a szerver földrajzi elhelyezkedése.

A web.dev teljesítményre vonatkozó útmutatói is külön kezelik a szerver válaszidejét és a böngészőben történő feldolgozást. ([web.dev – Understand the critical path](https://web.dev/learn/performance/understanding-the-critical-path))

### Mit csinálj?

Ne rögtön tárhelyet válts.

Először mérd meg, hogy valóban a szerver válaszideje-e a probléma.

Ha egy egyszerű statikus oldal gyorsan válaszol, de egy adatbázisból épülő oldal lassú, könnyen lehet, hogy nem a hosting a fő gond.

**A drágább szerver nem javít ki automatikusan egy rosszul működő alkalmazást.**

---

## 2. Túl nagyok a képek

Ez az egyik leggyakoribb és legegyszerűbben javítható probléma.

Egy modern telefon vagy fényképezőgép több megabájtos képeket készíthet. Egy weboldalnak viszont gyakran nincs szüksége ilyen méretű fájlra.

Ha egy 5000 pixel széles fényképet egy 800 pixel széles helyen jelenítesz meg, a böngésző akkor is letöltheti a nagy fájlt, ha abból csak egy kisebb változat látható.

A web.dev szerint a képek a weboldalak egyik legnagyobb erőforrás-kategóriáját jelentik, ezért optimalizálásuk jelentős teljesítményjavulást hozhat. ([web.dev – Image performance](https://web.dev/learn/performance/image-performance))

### Mit érdemes csinálni?

- megfelelő méretű képet szolgálj ki,
- használj modern képformátumokat, ahol megfelelő,
- tömörítsd a képeket,
- használj reszponzív képeket,
- a képernyőn kívüli képeket töltsd később.

A `loading="lazy"` például lehetővé teszi, hogy a böngésző a képernyőn kívüli képeket ne töltse le azonnal. ([web.dev – Key performance issues](https://web.dev/learn/images/performance-issues))

Egy fontos kivétel: **a kezdőképernyőn, felül látható fő képét nem érdemes automatikusan lazy loadolni**, mert ezzel éppen a legfontosabb kép betöltését késleltetheted. ([web.dev – Key performance issues](https://web.dev/learn/images/performance-issues))

---

## 3. Túl sok JavaScript fut

A JavaScript teszi interaktívvá a weboldalakat.

Menük, animációk, űrlapok, kosarak, kalkulátorok, analitika és rengeteg más funkció épülhet rá.

A probléma akkor kezdődik, amikor mindenhez JavaScript kell.

Egy egyszerű bemutatkozó oldalnak például nincs feltétlenül szüksége több tucat külső scriptre.

A web.dev szerint a túl sok JavaScript lassíthatja a betöltést és a felhasználói interakciókra adott válaszidőt is. ([web.dev – Optimise resource loading](https://web.dev/learn/performance/optimize-resource-loading))

A böngészőnek nemcsak le kell töltenie a JavaScriptet.

Fel kell dolgoznia, elemeznie és végre is kell hajtania.

### Mit csinálj?

Nézd át:

- mely JavaScript-fájlok töltődnek be,
- melyek szükségesek,
- melyek töltődnek be minden oldalon,
- vannak-e fölösleges könyvtárak,
- betöltődik-e valami csak egyetlen funkció miatt,
- lehet-e egyes scripteket későbbre halasztani.

**Nem minden JavaScript rossz. A fölösleges JavaScript a probléma.**

---

## 4. Túl sok plugin és külső szolgáltatás

Ez különösen gyakori kész weboldalrendszereknél.

Felkerül egy plugin a kapcsolatfelvételhez.

Egy másik a cookie-khoz.

Egy harmadik az analitikához.

Egy negyedik a chathez.

Egy ötödik az animációkhoz.

A végén minden plugin hozzáad valamit a betöltéshez.

A harmadik féltől származó JavaScript különösen nehéz lehet, mert nem teljesen te kontrollálod: külső szerverről érkezik, és a működését vagy teljesítményét sem mindig tudod közvetlenül optimalizálni. ([web.dev – Third-party JavaScript performance](https://web.dev/articles/third-party-javascript))

### Mit csinálj?

Évente legalább egyszer nézd át:

> Ezt a plugint valóban használjuk még?

Ha a válasz nem, távolítsd el.

Ha két plugin ugyanazt a feladatot végzi, válassz egyet.

És ha egy funkciót néhány sor saját kóddal is meg lehet oldani, lehet, hogy nem kell hozzá egy teljes könyvtár.

---

## 5. Lassú adatbázis-lekérdezések

Ez a probléma kevésbé látható, de webalkalmazásoknál nagyon fontos.

Tegyük fel, hogy az ügyfél megnyit egy oldalt.

A szervernek ki kell keresnie:

- az ügyfél adatait,
- a rendeléseit,
- a termékeket,
- az árakat,
- a jogosultságokat.

Ha ezek közül egy lekérdezés nagyon lassú, a teljes oldal várhat rá.

```text
HTTP kérés
   ↓
Backend
   ↓
SQL lekérdezés
   ↓
adatbázis várakozik
   ↓
Backend
   ↓
HTML / JSON
   ↓
Böngésző
```

A felhasználó ebből csak annyit lát, hogy „nem történik semmi”.

### Mi okozhatja?

Például:

- hiányzó adatbázis-index,
- rosszul megírt SQL,
- túl sok adat lekérése,
- egymás után futó lekérdezések,
- fölösleges JOIN-ok,
- N+1 lekérdezési problémák,
- nagy táblák nem megfelelő szűrése.

### Mit csinálj?

Itt nem egy képtömörítő plugin fog segíteni.

A fejlesztőnek meg kell mérnie, melyik lekérdezés mennyi időt vesz igénybe, és hogyan lehet optimalizálni.

**Ha az adatbázis miatt vár a szerver, a frontend újratervezése nem oldja meg a problémát.**

---

## 6. Frontend- vagy backendprobléma?

Ez az egyik legfontosabb kérdés.

### Frontendprobléma

A szerver gyorsan válaszol, de a böngésző sok munkát végez.

Tipikus okok:

- túl sok JavaScript,
- túl nagy képek,
- túl sok CSS,
- rengeteg DOM-elem,
- animációk,
- külső scriptek.

### Backendprobléma

A böngésző már a szerver válaszára vár.

Tipikus okok:

- lassú adatbázis,
- lassú API,
- rossz backend-logika,
- túl sok szerveroldali feldolgozás,
- külső API-kra való várakozás.

A két problémát teljesen más módon kell javítani.

Ezért nem érdemes azt mondani:

> „A weboldal lassú, csináljuk gyorsabbra.”

Először azt kell megtalálni, **hol tölti el az időt a rendszer**.

---

## 7. Nincs megfelelő gyorsítótárazás

A caching, vagyis gyorsítótárazás lényege egyszerű:

**amit nem kell minden alkalommal újra kiszámolni vagy letölteni, azt ne számoljuk és töltsük le minden alkalommal.**

Például ha egy látogató ugyanazt a statikus CSS-fájlt tölti le, a böngészőnek nem feltétlenül kell minden alkalommal újra letöltenie.

Ugyanez működhet szerveroldalon is.

Ha egy oldal tartalma ritkán változik, bizonyos részei gyorsítótárból szolgálhatók ki.

A web.dev teljesítményanyagában a cache-elés és a resource loading optimalizálása is a weboldal gyorsításának fontos része. ([web.dev – Optimise resource loading](https://web.dev/learn/performance/optimize-resource-loading))

### Mit csinálj?

Érdemes átgondolni:

- böngészőcache,
- szerveroldali cache,
- CDN cache,
- statikus fájlok cache-elése,
- API-válaszok cache-elése, ahol biztonságos és értelmes.

Nem minden adatot szabad cache-elni.

Egy személyes ügyféloldal például teljesen más megközelítést igényel, mint egy nyilvános blogcikk.

---

## 8. Nincs CDN, pedig lenne értelme

A CDN, vagyis Content Delivery Network több földrajzi helyen működő szerverek hálózata.

A célja, hogy a tartalmat lehetőleg a felhasználóhoz közelebbi szerverről szolgálja ki.

A web.dev szerint a CDN-ek többek között azzal javíthatják a teljesítményt, hogy csökkentik a felhasználó és az eredeti szerver közötti hálózati távolságot, illetve cache-ből tudnak kiszolgálni tartalmakat. ([web.dev – Content delivery networks](https://web.dev/articles/content-delivery-networks))

Ez különösen hasznos lehet:

- képekhez,
- CSS-hez,
- JavaScripthez,
- videókhoz,
- statikus fájlokhoz,
- nagyobb nemzetközi forgalomnál.

De egy budapesti kisvállalkozás néhány száz látogatójánál nem biztos, hogy ez az első optimalizálási feladat.

**A CDN nem varázspálca. Akkor érdemes használni, ha a konkrét rendszerednél valóban javít a kiszolgáláson.**

---

## 9. Mi az a Core Web Vitals?

A Core Web Vitals három olyan mérőszám, amely a felhasználói élmény fontos részeit próbálja számszerűsíteni.

### LCP – Largest Contentful Paint

Egyszerűen:

**Mikor jelenik meg a képernyőn a legfontosabb nagy tartalmi elem?**

Ez gyakran egy nagy kép, cím vagy más fő tartalmi blokk.

A web.dev szerint az LCP a felhasználó által érzékelt betöltés egyik fontos mutatója. ([web.dev – Key performance issues](https://web.dev/learn/images/performance-issues))

### INP – Interaction to Next Paint

Ez azt mutatja, hogy mennyire gyorsan reagál az oldal a felhasználói interakciókra.

Például:

```text
Kattintás → feldolgozás → vizuális válasz
```

Ha rákattintasz egy menüre, és a böngésző hosszú ideig dolgozik, mielőtt reagálna, az rossz interaktivitási élmény.

### CLS – Cumulative Layout Shift

Ez a vizuális stabilitást méri.

Biztosan láttál már ilyet:

Megnyitsz egy oldalt, elkezdenél kattintani valamire, majd egy kép vagy reklám betöltődik, és az egész tartalom lejjebb ugrik.

Ez a CLS problémája.

A Core Web Vitals jelenlegi készlete az LCP-t, az INP-t és a CLS-t tartalmazza. ([Google for Developers – About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about))

**A három szám mögött valójában három egyszerű kérdés áll: gyorsan megjelenik? gyorsan reagál? stabil marad?**

---

## Hogyan mérd meg a weboldalad?

A legegyszerűbb kiindulópont a Google PageSpeed Insights.

[https://pagespeed.web.dev/](https://pagespeed.web.dev/)

Írd be a weboldalad URL-jét, majd nézd meg külön a mobil és desktop eredményeket.

A PageSpeed Insights laboradatokat és, ha rendelkezésre állnak, valós felhasználói adatokat is megjelenít. A valós adatok a Chrome User Experience Reportból, vagyis CrUX-ból származnak. ([Google for Developers – About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about))

Ez fontos különbség.

### Laboradat

A teszt egy ellenőrzött környezetben fut.

Ez nagyon hasznos fejlesztés közben.

### Valós felhasználói adat

A rendszer tényleges látogatók tapasztalatait mutatja, amikor elegendő adat áll rendelkezésre.

Ez jobban megmutathatja, hogy a valódi felhasználók mit tapasztalnak.

**Ne csak a 0–100 közötti pontszámot nézd.**

A „Diagnostics” és az ajánlások sokkal fontosabbak lehetnek, mert megmutatják, mi okozza a problémát.

---

## Mit javíts először?

Ez az egyik legfontosabb kérdés.

Nem minden PageSpeed-ajánlást érdemes azonnal megvalósítani.

Egy praktikus sorrend:

### 1. Nagy képek

Ha a kezdőoldalon több megabájtnyi képet töltesz le, kezdd ezekkel.

### 2. Felesleges JavaScript

Nézd meg, mely scriptek szükségesek, és melyek halaszthatók vagy eltávolíthatók.

### 3. Lassú szerverválasz

Ha a backend lassan adja vissza az első választ, vizsgáld meg a hostingot, az alkalmazást és az adatbázist.

### 4. Cache

A gyakran használt statikus és megfelelő dinamikus tartalmakat érdemes lehet cache-elni.

### 5. Külső scriptek

Chat, analitika, hirdetés, social widget és egyéb harmadik féltől származó kódok mind hozzáadhatnak a betöltési költséghez.

### 6. CDN

Ha a tartalom földrajzilag távolról érkezik, vagy sok statikus adatot szolgálsz ki, érdemes lehet CDN-t használni.

### 7. Mélyebb backend-optimalizálás

Ha a problémát SQL-lekérdezések, API-k vagy összetett üzleti logika okozza, már fejlesztői szintű optimalizálásra van szükség.

**Mindig azt javítsd először, ami a legtöbb időt vagy adatot viszi el.**

---

## Ne a PageSpeed pontszámot hajszold

A 100/100 jól mutat.

De nem ez az üzleti cél.

Egy weboldalnak nem attól lesz több ügyfele, hogy a PageSpeed Insightsban 100 pontot kapott.

A valódi cél inkább az, hogy:

* gyorsan megjelenjen a fontos tartalom,
* használható legyen mobilon,
* gyorsan reagáljon,
* ne ugráljon a tartalom,
* ne töltsön le fölösleges adatokat,
* a szerver ne várakoztassa feleslegesen a látogatót.

A PageSpeed Insights maga is hangsúlyozza, hogy az optimalizálási javaslatokat az adott weboldal költségei és várható előnyei alapján érdemes mérlegelni. ([Google – PageSpeed Insights FAQ](https://developers.google.com/speed/docs/insights/faq))

**A gyors weboldal nem egy teszteredmény. Hanem jobb felhasználói élmény.**

---

## Mikor kell fejlesztő?

Ha a probléma egy nagy kép, valószínűleg egyszerűen optimalizálható.

Ha viszont ilyeneket látsz:

* lassú API,
* adatbázis-lekérdezések,
* szerveroldali feldolgozás,
* túl sok JavaScript,
* összetett caching,
* CDN-konfiguráció,
* renderelési problémák,

akkor érdemes fejlesztői szinten megvizsgálni a rendszert.

A teljesítményoptimalizálás ugyanis sokszor nem egyetlen beállítás.

```
Mérés → probléma azonosítása → változtatás → újramérés
```

**A jó optimalizálás mérésből indul, nem találgatásból.**

---

## Lassú a weboldalad? Ne a legdrágább megoldással kezdd

Ha a weboldalad lassú, nem feltétlenül kell új tárhely, új framework vagy teljes újraépítés.

Lehet, hogy egyetlen nagy kép okozza a problémát.

Lehet, hogy öt fölösleges plugin.

Lehet, hogy egy rossz SQL-lekérdezés.

Vagy éppen az, hogy semmi nincs megfelelően cache-elve.

A legjobb első lépés általában egy mérés és egy rövid technikai audit.

Nézd meg a PageSpeed Insights eredményét, azonosítsd a legnagyobb problémát, és **először azt javítsd, ami ténylegesen lassítja a felhasználói élményt.**

**softwaredevelopment.hu — Teljesítményoptimalizálás, webfejlesztés és technikai megoldások magyar vállalkozások számára.**

---

## Források

* Google for Developers: [About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about)
* Google for Developers: [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/rest)
* Google: [PageSpeed Insights](https://pagespeed.web.dev/)
* web.dev: [Understand the critical path](https://web.dev/learn/performance/understanding-the-critical-path)
* web.dev: [Optimise resource loading](https://web.dev/learn/performance/optimize-resource-loading)
* web.dev: [Image performance](https://web.dev/learn/performance/image-performance)
* web.dev: [Key performance issues](https://web.dev/learn/images/performance-issues)
* web.dev: [Third-party JavaScript performance](https://web.dev/articles/third-party-javascript)
* web.dev: [Content delivery networks](https://web.dev/articles/content-delivery-networks)
* web.dev: [Getting started with measuring Web Vitals](https://web.dev/articles/vitals-measurement-getting-started)
* Google for Developers: [PageSpeed Insights FAQ](https://developers.google.com/speed/docs/insights/faq)

