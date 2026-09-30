---
title: "Hogyan lehet összekötni két különálló üzleti rendszert?"
description: "API, webhook, middleware, Zapier, Make vagy egyedi fejlesztés? Megmutatjuk, hogyan érdemes két üzleti rendszert összekötni."
tags: [api, webhook, automatizálás, integráció, üzlet]
date: 2026-10-11 08:00
image: /articles/how-to-connect-two-business-systems/share-hu.jpg
---

Képzeld el, hogy van egy webshopod, egy számlázórendszered és egy CRM-ed.

A webshopban létrejön egy rendelés. Valakinek ezt át kell vinnie a számlázóba, majd a CRM-be, esetleg értesíteni kell a kollégát is.

Lehet ezt kézzel is csinálni.

De ha naponta tíz, ötven vagy több száz rendelés érkezik, hamar felmerül a kérdés:

> **Miért kellene két rendszer között kézzel másolgatni ugyanazokat az adatokat?**

A válasz általában valamilyen integráció.

---

## Mit jelent az, hogy két rendszert összekötünk?

Az integráció egyszerűen azt jelenti, hogy két különálló rendszer adatot tud cserélni egymással.

Például:

```text
Webshop
   ↓
Rendelés létrejön
   ↓
Integráció
   ↓
Számlázó
   ↓
Számla elkészül
   ↓
CRM frissül
```text

Az integráció azonban nem feltétlenül jelenti azt, hogy a két rendszer közvetlenül kommunikál egymással.

Lehet közöttük egy köztes szolgáltatás, például egy middleware vagy iPaaS platform.

A gyakorlatban több megoldás közül választhatsz:

- API-k használata
- webhookok
- middleware vagy iPaaS, például Zapier vagy Make
- fájlalapú adatcsere
- egyedi integráció fejlesztése

Mindegyiknek megvan a helye.

---

## 1. API – amikor a rendszerek beszélgetnek egymással

Az API-ról az előző cikkben már részletesebben is írtunk. Röviden: az API egy szabályozott felület, amelyen keresztül egy rendszer adatokat kérhet vagy módosíthat egy másik rendszerben.

Például a webshop elküldheti a számlázónak:

```text
POST /invoices

{
  "customer": "Kiss Péter",
  "email": "peter@example.com",
  "amount": 125000
}
```text

A számlázó feldolgozza a kérést, majd választ ad.

A HTTP válaszkód például jelezheti, hogy a kérés sikeres volt, hibás adat érkezett, vagy a másik rendszerben történt probléma. A HTTP szabvány külön kezeli a sikeres 2xx, kliensoldali 4xx és szerveroldali 5xx válaszokat. [RFC 9110 – HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)

### Mikor jó az API?

Az API különösen akkor hasznos, ha:

- azonnal szeretnéd átadni az adatokat,
- kétirányú kommunikációra van szükség,
- összetett üzleti logikát kell megvalósítani,
- nagyobb mennyiségű adatot kezelsz,
- fontos a pontos és kontrollált működés.

### Hátránya

Az API-integrációhoz általában technikai fejlesztés szükséges.

Ráadásul nem elég azt tudni, hogy „van API”. Meg kell nézni a dokumentációt, a jogosultságokat, a limiteket, a verziókat, a hibakezelést és azt is, hogy pontosan milyen műveleteket támogat.

---

## 2. Webhook – amikor a rendszer szól, hogy történt valami

Az API gyakran úgy működik, hogy te kérdezed meg a rendszert:

> „Történt új rendelés?”

A webhook ennek a fordítottja.

A rendszer maga küld értesítést, amikor valamilyen esemény történik.

Például:

```text
Új rendelés
    ↓
Webshop webhook
    ↓
POST /webhooks/order-created
    ↓
Integráció
    ↓
Számlázó + CRM
```text

A Make dokumentációja szerint a webhookok HTTPS-en keresztül adatot küldhetnek, és az érkező kérés azonnal elindíthat egy folyamatot. [Make – Webhooks](https://help.make.com/webhooks?v=2)

Ez sok esetben hatékonyabb, mint folyamatosan lekérdezni a rendszert.

### Mikor érdemes webhookot használni?

Például:

- új rendelés történt,
- új ügyfél regisztrált,
- sikeres lett egy fizetés,
- megváltozott egy rendelés állapota,
- elkészült egy dokumentum,
- új lead érkezett.

A webhook azonban nem önmagában egy teljes integráció. Inkább egy eseményjelzés, amely elindít valamilyen további folyamatot.

---

## 3. Zapier vagy Make – amikor nem akarsz mindent lefejleszteni

Ha két rendszerhez már létezik kész integráció, sok esetben nincs szükség saját backend fejlesztésére.

Egy iPaaS vagy workflow platform közbeiktatásával például ilyen folyamat készíthető:

```text
Webshop
   ↓
Új rendelés
   ↓
Make / Zapier
   ↓
CRM frissítése
   ↓
Számlázás
   ↓
E-mail küldése
```text

A Zapier webhookokon keresztül külső rendszerekből is képes workflow-t indítani, illetve külső API-k felé is tud adatot küldeni. [Zapier – Trigger Zaps from webhooks](https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks)

A Make hasonló módon tud webhookokból azonnali folyamatokat indítani. [Make – Webhooks](https://help.make.com/webhooks?v=2)

### Előnyei

- gyorsan elkészíthető,
- kevés saját kód szükséges,
- sok kész csatlakozó érhető el,
- egyszerű folyamatoknál olcsóbb lehet, mint egy teljes egyedi fejlesztés,
- üzleti felhasználó számára is könnyebben átlátható.

### Hátrányai

Minél összetettebbé válik a folyamat, annál könnyebben lesz nehéz karbantartani.

Például egy ilyen folyamat még egyszerű:

```text
Új rendelés → CRM → e-mail
```text

De ez már egészen más:

```text
Új rendelés
 → ügyfél keresése
 → duplikáció ellenőrzése
 → készlet ellenőrzése
 → számla készítése
 → fizetés ellenőrzése
 → CRM frissítése
 → hiba esetén újrapróbálkozás
 → sikertelenség esetén értesítés
```text

Itt már érdemes megvizsgálni, hogy nem jobb-e egy kontrolláltabb egyedi integráció.

---

## 4. Fájlalapú adatcsere – néha a legegyszerűbb megoldás

Nem minden rendszer rendelkezik használható API-val.

Ilyenkor még mindig lehet adatot cserélni például:

- CSV-fájllal,
- XML-lel,
- JSON-fájllal,
- Excel-exporttal,
- SFTP-n keresztül.

Például:

```text
ERP
 ↓
CSV export
 ↓
SFTP / feltöltés
 ↓
Másik rendszer
 ↓
Import
```text

Ez kevésbé elegáns, mint egy valós idejű API-integráció, de ettől még lehet teljesen megfelelő.

Ha például egy rendszerben naponta egyszer kell átadni a könyvelési adatokat, nincs feltétlenül szükség másodpercenkénti szinkronizációra.

**Az integrációt nem attól kell jónak tekinteni, hogy technikailag modern, hanem attól, hogy megfelel az üzleti folyamatnak.**

---

## 5. Egyedi integráció – amikor nagyobb kontroll kell

Egyedi fejlesztésnél te határozod meg, hogyan működjön az adatcsere.

Például:

```text
Webshop API
     ↓
Saját integrációs szolgáltatás
     ↓
Adatátalakítás
     ↓
CRM API
     ↓
Számlázó API
```

Ez különösen akkor lehet indokolt, ha:

* nincs kész összekötés,
* sok üzleti szabály van,
* több rendszert kell összekapcsolni,
* nagy adatmennyiséget kezelsz,
* fontos a teljes kontroll,
* üzletileg kritikus folyamatról van szó.

A hátránya nyilvánvaló: fejleszteni, tesztelni, üzemeltetni és karbantartani kell.

Egy API változása például könnyen érintheti a saját integrációdat is.

---

## Melyik megoldást válaszd?

Nincs univerzális válasz.

Egy egyszerű döntési logika:

```text
Van kész integráció?
    ↓ igen
Használd a kész integrációt

    ↓ nem

Van API vagy webhook?
    ↓ igen
API / webhook / iPaaS

    ↓ nem

Van rendszeres export/import?
    ↓ igen
Fájlalapú integráció

    ↓ nem

Egyedi fejlesztés
```

Egy egyszerű CRM → e-mail folyamatnál például egy Make vagy Zapier workflow teljesen megfelelő lehet.

Egy webshop → ERP → számlázás → logisztika folyamatnál már érdemes alaposabban megtervezni az architektúrát.

---

## A legnagyobb probléma nem az adatküldés

Az első integráció általában nagyon látványos:

> „Ha létrejön egy rendelés, küldjük át a másik rendszernek.”

A valódi kérdés azonban az, hogy **mi történik akkor, ha valami nem működik?**

Például:

* a célrendszer nem elérhető,
* timeout történik,
* hibás adat érkezik,
* hiányzik egy kötelező mező,
* ugyanaz az esemény kétszer érkezik meg,
* az API elérte a rate limitet,
* megváltozott az API verziója.

Ezért egy üzleti integráció tervezésénél a hibakezelés ugyanolyan fontos, mint maga az adatküldés.

---

## Mi történik, ha kétszer érkezik meg ugyanaz a rendelés?

Ez az egyik klasszikus integrációs probléma.

Tegyük fel, hogy a webshop elküldi:

```text
Order #12345
```

A számlázó megkapja és létrehozza a számlát.

A válasz azonban elveszik.

A webshop ezért újra elküldi ugyanazt a rendelést.

Ha a célrendszer nem tudja felismerni, hogy ez ugyanaz a kérés, létrejöhet egy második számla vagy másik duplikált rekord.

Ezért fontos az **idempotencia**: ugyanannak a műveletnek az ismételt feldolgozása ne okozzon nem kívánt második műveletet.

A Microsoft és az AWS architektúra-ajánlásai is külön foglalkoznak az idempotens feldolgozással és az újrapróbálkozásokkal. [Microsoft – Retry pattern](https://learn.microsoft.com/th-th/azure/architecture/patterns/retry) · [AWS – Asynchronous communication](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/asynchronous.html)

---

## Újrapróbálkozás igen, végtelen újrapróbálkozás nem

Ha a másik rendszer éppen nem elérhető, érdemes lehet újrapróbálni a kérést.

Például:

```text
1. próbálkozás → sikertelen
        ↓
várakozás
        ↓
2. próbálkozás → sikertelen
        ↓
várakozás
        ↓
3. próbálkozás → sikeres
```

A retry mechanizmust azonban érdemes kontrolláltan kialakítani.

Az Azure ajánlása szerint a retry stratégiánál figyelembe kell venni többek között az idempotenciát, a késleltetést és azt is, hogy a túl agresszív újrapróbálkozás további terhelést okozhat. [Microsoft – Recommendations for handling transient faults](https://learn.microsoft.com/en-us/azure/well-architected/design-guides/handle-transient-faults)

Ha valami véglegesen hibázik, szükség lehet külön hibasorra vagy dead-letter queue-ra, ahol a sikertelen üzenetek később megvizsgálhatók és újrafeldolgozhatók. [AWS – Asynchronous communication](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/asynchronous.html)

---

## Ne csak működjön – legyen megfigyelhető

Egy integráció akkor igazán használható, ha tudod, mi történik vele.

Legalább ezeket érdemes látni:

* mikor futott le egy folyamat,
* sikeres vagy sikertelen volt-e,
* melyik rekordot dolgozta fel,
* mi volt a hiba,
* hányszor próbálkozott újra,
* melyik rendszer válaszolt hibával.

Különösen több rendszer összekapcsolásakor hasznos lehet egy közös azonosító, például egy correlation ID, amellyel egy adott tranzakció végigkövethető az egész folyamaton. [Microsoft – Microservices assessment and readiness](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/microservices-assessment)

**Ha egy integráció hibát okoz, ne az legyen az első lépés, hogy valaki megkérdezi: „Vajon mi történt?”**

A rendszernek lehetőleg magának kell megmutatnia.

---

## Egy jó integráció nem feltétlenül a legbonyolultabb

Egy kisvállalkozásnál lehet, hogy teljesen felesleges külön integrációs platformot vagy saját middleware-réteget építeni.

Lehet, hogy erre van szükség:

```text
Webshop
   ↓
Make
   ↓
CRM
```

Más esetben viszont a Make vagy Zapier használata már túl sok kompromisszumot jelenthet.

Például egy komplex ERP-rendszer és több üzleti alkalmazás összekapcsolásánál célszerű lehet egy saját integrációs réteg.

A kérdés ezért nem az:

> **„Melyik technológia a legmodernebb?”**

Hanem inkább:

> **„Milyen adatot, milyen gyakran, milyen megbízhatósággal és milyen következmények mellett kell átadnunk?”**

Ha erre válaszolsz, sokkal könnyebb kiválasztani a megfelelő megoldást.

---

## Mielőtt integrációt építesz, ezt tisztázd

Érdemes végigmenni ezen a rövid listán:

* Melyik rendszer a forrás?
* Melyik rendszer a cél?
* Pontosan milyen adatokat kell átadni?
* Milyen esemény indítja a folyamatot?
* Az adatnak azonnal meg kell érkeznie?
* Van API?
* Van webhook?
* Van kész integráció?
* Milyen autentikációt használ?
* Mi történik hiba esetén?
* Lehet-e ugyanazt az adatot kétszer feldolgozni?
* Hogyan lehet visszakeresni egy hibás tranzakciót?
* Ki kap értesítést, ha az integráció leáll?
* Mi történik, ha az egyik rendszer API-ja megváltozik?

Ezeket még a fejlesztés előtt érdemes tisztázni.

---

## Nem az a cél, hogy minden mindennel össze legyen kötve

Egy vállalkozásban könnyű eljutni oda, hogy minden rendszer minden másik rendszerrel kommunikál.

Ekkor viszont gyorsan kialakulhat egy nehezen karbantartható háló:

```text
CRM ───── ERP
 │ ╲       ╱ │
 │  ╲     ╱  │
Webshop ───── Számlázó
 │             │
 └──── API ────┘
```

Minél több kapcsolat van, annál több helyen kell figyelni változásokra, hibákra és jogosultságokra.

**Az integráció célja nem az, hogy több technológiád legyen, hanem hogy kevesebb manuális munkád és kevesebb hibád legyen.**

Ha egy kapcsolat nem old meg valódi üzleti problémát, lehet, hogy nincs is szükség rá.

---

## A legfontosabb kérdés

> **Van két rendszered, amelyek között ugyanazokat az adatokat rendszeresen kézzel mozgatjátok?**

Akkor érdemes először feltérképezni, hogy van-e API, webhook vagy kész integráció. Sokszor már ebből kiderül, hogy egy egyszerű workflow-val megoldható-e a probléma, vagy egyedi fejlesztésre van szükség.

Ha viszont az integráció üzletileg kritikus, nem elég azt megoldani, hogy „az adat átmenjen”. A hibakezelést, az újrapróbálkozást, a duplikációkat és a monitorozást is meg kell tervezni.

**softwaredevelopment.hu — A jó integráció nem attól jó, hogy összeköt két rendszert, hanem attól, hogy megbízhatóan összeköti őket.**

---

## Források

* MDN: [API – Glossary](https://developer.mozilla.org/en-US/docs/Glossary/API)
* Make: [Webhooks](https://help.make.com/webhooks?v=2)
* Zapier: [Trigger Zaps from webhooks](https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks)
* Zapier: [Send webhooks in Zap workflows](https://help.zapier.com/hc/en-us/articles/8496326446989-Send-webhooks-in-Zap-workflows)
* RFC Editor: [RFC 9110 – HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
* Microsoft Learn: [Retry pattern](https://learn.microsoft.com/th-th/azure/architecture/patterns/retry)
* Microsoft Learn: [Recommendations for handling transient faults](https://learn.microsoft.com/en-us/azure/well-architected/design-guides/handle-transient-faults)
* Microsoft Learn: [Microservices assessment and readiness](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/microservices-assessment)
* AWS Prescriptive Guidance: [Asynchronous communication](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/asynchronous.html)
* AWS Prescriptive Guidance: [Publish-subscribe pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/publish-subscribe.html)

````
