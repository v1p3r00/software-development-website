---
title: "Mikor érdemes saját ügyfélportált fejleszteni?"
description: "Dokumentumok, státuszok, számlák, rendelések és kommunikáció egy helyen. Mikor éri meg saját ügyfélportált fejleszteni?"
tags: [ügyfélportál, webfejlesztés, crm, gdpr, digitalizáció]
date: 2026-10-13 08:00
image: /articles/when-to-build-a-customer-portal/share-hu.jpg
---

Egy ügyfél e-mailt küld.

Megkérdezi, hol tart a rendelése.

Később újra ír, mert nem találja a szerződést.

A számlát külön e-mailben kapta meg.

A kolléga közben egy másik rendszerben nézi a projekt állapotát.

Az ügyfél pedig továbbra is csak annyit lát, hogy:

> „Majd visszajelzünk.”

Egy bizonyos méret fölött ez már nem egyszerű kommunikációs probléma.

**Lehet, hogy hiányzik egy ügyfélportál.**

---

## Mi az ügyfélportál?

Az ügyfélportál egy belépés után elérhető online felület, ahol az ügyfél a saját adatait, dokumentumait és folyamatait egy helyen láthatja.

Például:

```text
Ügyfél belép
    ↓
Saját ügyfélportál
    ├── Profil
    ├── Rendelések
    ├── Számlák
    ├── Dokumentumok
    ├── Projekt státusza
    ├── Üzenetek
    └── Ügyfélszolgálat
```text

A pontos funkciók természetesen vállalkozásonként változnak.

Egy webshopnak elsősorban rendelések és számlák lehetnek fontosak.

Egy könyvelőirodának dokumentumok és kommunikáció.

Egy kivitelezőnek projektstátusz, tervrajzok, számlák és jóváhagyások.

Egy B2B szolgáltatónak pedig akár az egész ügyfélkapcsolat egy közös felületen.

---

## Mit lát az ügyfél?

A legfontosabb előny, hogy az ügyfélnek nem kell minden információért külön e-mailt írnia.

Egy jól megtervezett portál például ezt mutathatja:

```text
Jó napot, Péter!

Aktív projekt: Weboldal fejlesztés

Státusz: Fejlesztés alatt
Következő lépés: Tesztelés
Határidő: október 15.

Dokumentumok:
✓ Szerződés
✓ Ajánlat
✓ Specifikáció

Számlák:
✓ 1. részszámla
○ 2. részszámla
```text

Az ügyfél rögtön látja, hogy hol tart a folyamat.

Nem kell megkeresnie egy régi e-mailt.

Nem kell telefonálnia.

Nem kell megkérdeznie, hogy „Mi újság a projekttel?”

---

## Dokumentumok egy helyen

Sok vállalkozásnál a dokumentumkezelés önmagában elegendő indok lehet egy portálra.

Például:

- szerződések,
- ajánlatok,
- műszaki dokumentáció,
- számlák,
- teljesítési igazolások,
- jegyzőkönyvek,
- tervrajzok,
- használati útmutatók.

Ahelyett, hogy az ügyfél e-mailjeiben kellene keresgélnie:

```text
E-mail
   ├── szerződés.pdf
   ├── szerződés_final.pdf
   ├── szerződés_final2.pdf
   └── szerződés_aláírt.pdf
```text

a portálon lehet egy strukturált dokumentumtár:

```text
Dokumentumok
├── Szerződések
├── Számlák
├── Műszaki dokumentáció
└── Egyéb
```text

**A cél nem pusztán az, hogy a fájlok online legyenek, hanem hogy a megfelelő ügyfél a megfelelő fájlokat lássa.**

Ez már hozzáférés-kezelési kérdés is.

---

## Rendelések és státuszok

Egy portál különösen hasznos lehet akkor, ha az ügyfél folyamata több lépésből áll.

Például:

```text
Rendelés leadva
      ↓
Feldolgozás
      ↓
Gyártás
      ↓
Minőségellenőrzés
      ↓
Szállítás
      ↓
Teljesítve
```text

Az ügyfélnek nem kell minden állapotváltozás miatt e-mailt küldenie.

A portál egyszerűen megmutatja az aktuális állapotot.

Hasonló logika működhet szolgáltatásoknál is:

```text
Ajánlat
  ↓
Megrendelés
  ↓
Előkészítés
  ↓
Folyamatban
  ↓
Ellenőrzés
  ↓
Lezárva
```text

A státuszoknak ráadásul nem feltétlenül kell technikai állapotokat megjeleníteniük.

A belső rendszerben lehet például:

`IN_PROGRESS`

miközben az ügyfél ezt látja:

**„A projekt fejlesztés alatt áll.”**

---

## Számlák és fizetések

Egy ügyfélportál a számlázást is kényelmesebbé teheti.

Az ügyfél például láthatja:

- kiállított számlák,
- fizetési határidők,
- fizetési státuszok,
- letölthető PDF-ek,
- kapcsolódó rendelések vagy projektek.

Akár egy fizetési folyamat is elindítható közvetlenül a portálból.

```text
Számla
   ↓
Fizetés
   ↓
Online fizetési szolgáltató
   ↓
Sikeres fizetés
   ↓
Portál frissül
   ↓
"Fizetve"
```text

Ilyenkor a portál nem maga kezeli feltétlenül a bankkártyaadatokat. A fizetést egy erre kialakított fizetési szolgáltató kezelheti.

Ez biztonsági és fejlesztési szempontból is fontos különbség.

---

## Kommunikáció e-mail helyett

Egy másik erős funkció az ügyfél és a vállalkozás közötti kommunikáció.

Például:

```text
Projekt #1045

Ügyfél:
"Elkészült a logó végleges változata."

Vállalkozás:
"Igen, megkaptuk. Feltöltöttük a projekt dokumentumai közé."

Ügyfél:
"Rendben, jóváhagyom."
```text

A kommunikáció így közvetlenül kapcsolódhat az adott projekthez, rendeléshez vagy ügyhöz.

A Zendesk ügyfélportálja például lehetővé teszi, hogy az ügyfelek beküldjék, megtekintsék és kövessék a támogatási kéréseiket, valamint kommenteket is hozzáadhassanak. :contentReference[oaicite:0]{index=0}

Ez azért fontos, mert a kommunikáció nem feltétlenül marad különálló e-mailekben.

---

## Mit nyer ezzel a vállalkozás?

Az ügyfélportál előnye nem csak az ügyféloldalon jelentkezik.

A vállalkozás számára is csökkentheti a repetitív ügyfélszolgálati munkát.

Például ha egy ügyfél havonta egyszer megkérdezi:

> „El tudnád küldeni még egyszer a számlát?”

akkor egy portálon egyszerűen letöltheti.

Ugyanez igaz lehet:

- rendelési státuszra,
- dokumentumokra,
- projektállapotra,
- korábbi kommunikációra,
- fizetési információkra.

A Salesforce például a customer portal egyik céljaként az önkiszolgálást és a támogatási megkeresések csökkentését emeli ki. :contentReference[oaicite:1]{index=1}

**A jó ügyfélportál nem több munkát ad az ügyfélszolgálatnak. A gyakran ismétlődő kérdéseket próbálja kivonni a folyamatból.**

---

## Mikor van tényleg szükség rá?

Nem minden vállalkozásnak kell ügyfélportál.

Ha évente néhány alkalommal kommunikálsz egy ügyféllel, és minden projekt egyszerű, valószínűleg nincs rá szükség.

Érdemes viszont elgondolkodni rajta, ha:

- sok visszatérő ügyfeled van,
- ugyanazokat az információkat rendszeresen elkülditek,
- sok dokumentumot osztotok meg,
- hosszú projektek futnak,
- az ügyfél gyakran kér státuszfrissítést,
- sok rendelés vagy ügy van egy ügyfélhez,
- több munkatárs kezeli ugyanazt az ügyfelet,
- az ügyfélnek rendszeresen kell dokumentumokat feltöltenie,
- jóváhagyásokat kell kérni,
- az ügyfél több rendszerből kap információkat.

Egy jó teszt:

> **Ha ugyanazt a kérdést hetente többször kapjátok meg az ügyfelektől, érdemes megnézni, hogy nem lehet-e az információt önkiszolgálóvá tenni.**

---

## Saját portál vagy kész megoldás?

Ez az egyik legfontosabb döntés.

Nem biztos, hogy saját fejlesztésre van szükség.

### Kész rendszer

Sok üzleti szoftver már tartalmaz ügyféloldali felületet.

Például egy support rendszer ügyfélportálja megmutathatja a hibajegyeket és azok állapotát. A Zendesk esetében az ügyfél a saját kéréseit megtekintheti, szűrheti, keresheti és követheti. :contentReference[oaicite:2]{index=2}

**Előnyei:**

- gyorsabb bevezetés,
- kisebb kezdeti fejlesztés,
- kész autentikáció,
- kész adminisztráció,
- támogatott frissítések.

**Hátránya:**

- alkalmazkodnod kell a rendszerhez,
- korlátozottabb lehet a testreszabás,
- előfizetési díjjal járhat,
- nehezebb lehet több különböző üzleti rendszerrel összekapcsolni.

---

## Mikor érdemes sajátot fejleszteni?

A saját portál akkor válik érdekesebbé, amikor **nem csak egy általános ügyfélfelületre van szükséged, hanem a saját üzleti folyamatodat akarod megjeleníteni.**

Például egy építőipari vállalkozásnál:

```text
Ügyfél
  ↓
Projekt
  ├── szerződés
  ├── tervrajzok
  ├── feladatok
  ├── státuszok
  ├── változtatási kérelmek
  ├── számlák
  └── üzenetek
```text

Egy általános CRM ezt részben megoldhatja.

De ha a vállalkozásnak saját, speciális folyamatai vannak, egy egyedi portál sokkal pontosabban tud ezekhez igazodni.

---

## A saját fejlesztés legnagyobb előnye: az integráció

A portál önmagában nem túl érdekes.

Az válik igazán hasznossá, amikor össze van kötve a háttérrendszerekkel.

Például:

```text
                   ┌── CRM
                   │
Ügyfélportál ───────┼── ERP
                   │
                   ├── Számlázó
                   │
                   ├── Webshop
                   │
                   └── Projektkezelő
```text

Az ügyfél egy helyen látja az információt.

A háttérben viszont több rendszer dolgozik.

Ezért egy ügyfélportál fejlesztésénél az API-k és az adatmodell legalább olyan fontosak, mint maga a felület.

---

## Biztonság: itt már nem lehet félvállról venni

Egy ügyfélportál személyes és üzleti adatokat is kezelhet.

Lehet benne:

- név,
- e-mail-cím,
- telefonszám,
- számlázási adatok,
- szerződések,
- számlák,
- rendelések,
- belső kommunikáció,
- üzleti dokumentumok.

Ezért a biztonságot már a tervezésnél figyelembe kell venni.

Az Európai Bizottság szerint a GDPR alapján megfelelő technikai és szervezési intézkedéseket kell alkalmazni a személyes adatok védelmére, többek között a jogosulatlan hozzáférés és az adatvesztés ellen. :contentReference[oaicite:3]{index=3}

Az EDPB külön kiemeli a biztonság, a hozzáférés-kezelés, a titkosítás, a mentések és a rendszeres biztonsági ellenőrzések fontosságát. :contentReference[oaicite:4]{index=4}

---

## A bejelentkezés önmagában nem elég

Az egyik gyakori hiba:

> „Bejelentkezett, tehát láthat mindent.”

Nem.

Két külön fogalomról beszélünk:

**Authentication:** ki vagy?

**Authorisation:** mit szabad látnod és csinálnod?

Az OWASP szerint a jogosultságkezelésnek minden olyan erőforrásnál érvényesülnie kell, amely nem nyilvános, és alapelvként érdemes a minimálisan szükséges jogosultságokat alkalmazni. :contentReference[oaicite:5]{index=5}

Például:

```text
Ügyfél A
  → csak A projektjeit látja

Ügyfél B
  → csak B projektjeit látja

Admin
  → minden ügyfelet kezelhet
```text

Nem elég elrejteni egy gombot a felületen.

A backendnek is ellenőriznie kell, hogy az adott felhasználó hozzáférhet-e az adott adathoz.

---

## GDPR: néhány alapvető kérdés

Egy ügyfélportál esetében érdemes már a tervezés elején tisztázni:

- milyen személyes adatokat tárolunk?
- miért van szükség rájuk?
- meddig tároljuk őket?
- ki férhet hozzájuk?
- milyen jogosultságok vannak?
- hol tároljuk az adatokat?
- milyen adatfeldolgozók vesznek részt?
- hogyan kezeljük a törlési vagy hozzáférési kérelmeket?
- mi történik adatvédelmi incidens esetén?

A GDPR egyik alapelve az adatminimalizálás: csak olyan személyes adatot érdemes kezelni, amely az adott célhoz szükséges. Az EDPB ugyanezt hangsúlyozza a kisvállalkozásoknak szóló útmutatójában. :contentReference[oaicite:6]{index=6}

**Nem kell minden információt begyűjteni csak azért, mert technikailag meg lehet oldani.**

---

## Mire figyelj a dokumentumoknál?

A fájlok különösen érzékeny részei lehetnek a rendszernek.

Nem elég, hogy a dokumentum URL-je ne legyen nyilvános.

Például ez nem megfelelő biztonsági modell:

```text
https://pelda.hu/uploads/szerzodes-123.pdf
```text

és azt feltételezni, hogy csak az fér hozzá, aki ismeri a linket.

A rendszernek ellenőriznie kell, hogy az adott felhasználónak valóban joga van-e hozzáférni a dokumentumhoz.

A hozzáférési szabályokat a backendnek is ellenőriznie kell, nem csak a frontendnek. Az OWASP hozzáférés-kezelési ajánlásai is a jogosultságok következetes szerveroldali érvényesítését és a legkisebb szükséges jogosultság elvét hangsúlyozzák. :contentReference[oaicite:7]{index=7}

---

## Hogyan építenék fel egy első verziót?

Nem kezdeném 30 funkcióval.

Egy első verzió lehet például:

```text
1. Bejelentkezés
2. Ügyfélprofil
3. Dokumentumok
4. Rendelések / projektek
5. Státuszok
6. Számlák
7. Üzenetek
8. Értesítések
```text

Ez már önmagában komoly értéket adhat.

Később jöhet:

- online fizetés,
- dokumentum-jóváhagyás,
- elektronikus aláírás,
- időpontfoglalás,
- reklamációkezelés,
- részletes riportok,
- mobilalkalmazás,
- AI-asszisztens.

**Először azt érdemes digitalizálni, ami ma a legtöbb manuális ügyfélkommunikációt okozza.**

---

## Mennyibe kerülhet?

Egy kész ügyfélportál ára az adott SaaS rendszer csomagjától és felhasználószámától függ.

Egy egyszerű egyedi portál fejlesztése már komolyabb projekt, mert nem csak egy weboldalról van szó.

Van:

- felhasználókezelés,
- jogosultságkezelés,
- adatbázis,
- backend,
- API-integráció,
- dokumentumkezelés,
- biztonság,
- naplózás,
- adminisztráció.

**Guide árként** egy egyszerű, néhány fő funkciót tartalmazó egyedi ügyfélportál magyar kisvállalkozásnál például **800 000–2 500 000 Ft** fejlesztési nagyságrend lehet.

Egy összetett, több rendszerrel integrált portál ennél jelentősen drágább lehet.

Ez nem hivatalos piaci árlista, hanem irányadó fejlesztési példa.

A kész rendszer vagy az egyedi fejlesztés között ezért nem csak a fejlesztési költséget érdemes összehasonlítani.

Nézd meg:

- mennyibe kerül az előfizetés,
- mennyi a testreszabás,
- mennyi idő a bevezetés,
- milyen integrációk vannak,
- mennyire függsz a szolgáltatótól,
- mennyire illeszkedik a saját folyamatodhoz.

---

## A legfontosabb: ne portált építs, hanem problémát oldj meg

Az ügyfélportál önmagában nem üzleti cél.

A cél például lehet:

**„Az ügyfelek 80%-a saját maga megtalálja a szükséges dokumentumokat.”**

Vagy:

**„Ne kelljen naponta húsz státusz e-mailre válaszolni.”**

Vagy:

**„Az ügyfél egy helyen lássa a projekt teljes történetét.”**

Ezek már konkrét problémák.

Ha egy portál ezekből old meg néhányat, van értelme.

Ha viszont csak azért készül, mert „minden modern cégnek kell egy ügyfélportál”, könnyen egy drága, ritkán használt rendszert kapsz.

---

## A legfontosabb kérdés

> **Az ügyfeleid rendszeresen olyan információkat kérnek tőletek, amelyeket valójában már most is kezeltek valamilyen rendszerben?**

Ha igen, érdemes megnézni, hogy ezeket az információkat hogyan lehetne egyetlen ügyfélfelületre összegyűjteni.

Nem feltétlenül kell sajátot fejleszteni. Ha egy kész CRM vagy ügyfélszolgálati rendszer lefedi az igényeidet, az lehet a gyorsabb és egyszerűbb út.

Ha viszont a vállalkozásodnak saját folyamatai, több háttérrendszere és speciális ügyfélélménye van, akkor egy egyedi portál már sokkal több lehet egyszerű dokumentumtárnál: **a vállalkozás digitális ügyfélkapcsolati felületévé válhat.**

**softwaredevelopment.hu — Egy jó ügyfélportál nem egy újabb felület. Hanem egy hely, ahol az ügyfél végre megtalálja azt, amiért egyébként e-mailt írna.**

---

## Források

- Európai Bizottság: [A GDPR alapelvei](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en)
- Európai Bizottság: [GDPR kötelezettségek – személyes adatok biztonsága](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en)
- EDPB: [Data protection basics](https://www.edpb.europa.eu/sme/learn-the-basics/data-protection-basics_en)
- EDPB: [Secure personal data](https://www.edpb.europa.eu/sme/be-compliant/secure-personal-data_en)
- EDPB: [Data subject rights](https://www.edpb.europa.eu/topics/key-gdpr-concepts/data-subject-rights_en)
- OWASP: [Enforce Access Controls](https://devguide.owasp.org/en/04-design/02-web-app-checklist/07-access-controls/)
- OWASP: [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- Salesforce: [Build a Portal with the Customer Account Portal Solution](https://help.salesforce.com/s/articleView?id=networks_customer_account_portal_build.htm&language=en_US&type=0)
- Salesforce: [What Is a Customer Portal – And Why Do You Need One?](https://www.salesforce.com/eu/blog/what-is-a-customer-portal/)
- Zendesk: [Submitting and tracking requests in the help center Customer Portal](https://support.zendesk.com/hc/en-us/articles/4408846805530-Submitting-and-tracking-requests-in-the-help-center-Customer-Portal)
- Zendesk: [What are the customer portal ticket statuses?](https://support.zendesk.com/hc/en-us/articles/4408825864858-What-are-the-customer-portal-ticket-statuses)
