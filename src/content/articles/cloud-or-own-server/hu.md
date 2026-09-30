---
title: "Cloud vagy saját szerver? – Melyik éri meg egy vállalkozásnak?"
description: "Shared hosting, VPS, cloud vagy saját szerver? Megmutatjuk, melyik megoldás mikor éri meg egy vállalkozásnak."
tags: [cloud, szerver, hosting, vps, digitalizáció]
date: 2026-10-14 08:00
image: /articles/cloud-or-own-server/share-hu.jpg
---

Amikor egy vállalkozásnak weboldalra, webshopra vagy saját üzleti rendszerre van szüksége, előbb-utóbb felmerül egy kérdés:

> **Hol fusson az egész?**

Egy olcsó tárhelyen?

Egy VPS-en?

AWS-en, Azure-on vagy Google Cloudon?

Egy saját bérelt dedikált szerveren?

Vagy a cég irodájában álljon egy saját szerver?

A válasz nem egyszerűen technológiai kérdés.

**A megfelelő infrastruktúrát nem az alapján érdemes kiválasztani, hogy melyik hangzik a legmodernebbnek, hanem hogy mennyi kontrollra, teljesítményre, rugalmasságra és üzemeltetésre van valóban szükséged.**

---

## Először tisztázzuk: mit jelent a cloud?

A „cloud” nem azt jelenti, hogy valami valahol „az interneten van”.

A cloud mögött ugyanúgy fizikai szerverek, adattárolók, hálózatok és adatközpontok működnek.

A különbség az, hogy ezeket a szolgáltató infrastruktúráján keresztül használod.

Például az AWS, a Microsoft Azure és a Google Cloud különböző számítási, tárhely-, adatbázis-, hálózati és egyéb szolgáltatásokat kínál.

Egy cloud környezet lehet nagyon egyszerű:

```text
Egy virtuális szerver
      ↓
Weboldal
      ↓
Adatbázis
```text

De lehet nagyon összetett is:

```text
Load balancer
      ↓
┌───────────────┐
│               │
Server 1     Server 2
│               │
└───────┬───────┘
        ↓
   Adatbázis
        ↓
     Backup
```text

Ezért a „cloud” önmagában még nem mondja meg, mennyire összetett vagy drága egy rendszer.

---

## 1. Shared hosting – a legegyszerűbb megoldás

A shared hostingnál ugyanazon a fizikai infrastruktúrán több ügyfél weboldala vagy alkalmazása fut.

Te gyakorlatilag egy kész szolgáltatást kapsz.

```text
Hosting szolgáltató
        ↓
┌───────┬───────┬───────┐
Weboldal Webshop Weboldal
   A        B        C
└───────┴───────┴───────┘
```text

Általában nincs szükséged szerveradminisztrációra.

A szolgáltató kezeli az infrastruktúra jelentős részét.

### Előnyei

- olcsó,
- egyszerű,
- gyorsan használható,
- kevés üzemeltetési feladat,
- kisebb weboldalakhoz általában elegendő.

### Hátrányai

- korlátozott erőforrások,
- kevésbé rugalmas konfiguráció,
- korlátozott hozzáférés,
- nehezebb egyedi backendeket futtatni,
- nagyobb terhelésnél gyorsan kevés lehet.

Egy egyszerű bemutatkozó weboldalnál ez sokszor teljesen megfelelő.

Egy Java Spring Boot backenddel, külön adatbázissal és háttérfolyamatokkal működő üzleti rendszerhez viszont már nem feltétlenül ez az ideális környezet.

---

## 2. VPS – amikor már saját virtuális szervered van

A VPS, vagyis Virtual Private Server egy virtuális szerver, amelyen saját operációs rendszert és alkalmazásokat futtathatsz.

Például:

```text
VPS
├── Linux
├── Docker
├── Nginx
├── Spring Boot
├── PostgreSQL
└── Redis
```text

A VPS lényegében nagyobb kontrollt ad, mint egy klasszikus shared hosting.

Te döntöd el például:

- milyen operációs rendszer legyen,
- milyen szoftvereket telepítesz,
- milyen portokat nyitsz meg,
- hogyan konfigurálod az alkalmazást,
- hogyan kezeled a frissítéseket.

### Előnyei

- nagyobb kontroll,
- kiszámíthatóbb környezet,
- saját backendek futtathatók,
- Docker és egyéb technológiák használhatók,
- általában kedvező ár/erőforrás arány.

### Hátrányai

**A VPS-sel együtt megkapod az üzemeltetés egy részét is.**

Ha a Linux szervered biztonsági frissítést igényel, neked vagy az üzemeltetődnek kell foglalkoznia vele.

Ha megtelik a lemez, valakinek észre kell vennie.

Ha elromlik az alkalmazás, valakinek meg kell keresnie az okát.

Ha nincs megfelelő backup, egy szerverhiba adatvesztést is okozhat.

---

## 3. Cloud – AWS, Azure vagy Google Cloud

A nagy cloud szolgáltatók egészen más szintű rugalmasságot kínálnak.

Használhatsz például:

- virtuális gépeket,
- menedzselt adatbázisokat,
- objektumtárhelyet,
- load balancert,
- konténerszolgáltatásokat,
- szerver nélküli funkciókat,
- monitorozási és biztonsági szolgáltatásokat.

Az AWS, Azure és Google Cloud modellje ráadásul nem egyszerűen „bérelt szerver”.

A cloudban külön-külön választhatsz infrastruktúra- és menedzselt szolgáltatásokat.

Ezért akár:

```text
Frontend
   ↓
Cloud hosting

Backend
   ↓
Container service

Database
   ↓
Managed database

Files
   ↓
Object storage

Backups
   ↓
Cloud backup
```text

is lehet az architektúra.

### Előnyei

- rugalmas skálázás,
- rengeteg szolgáltatás,
- automatizálható infrastruktúra,
- fejlett monitorozás,
- több régió és rendelkezésre állási lehetőség,
- könnyebb nagyobb rendszerek felépítése.

A Google Cloud Well-Architected Framework például külön kezeli a megbízhatóságot, biztonságot, költségoptimalizálást és teljesítményt mint önálló tervezési szempontokat. [Google Cloud – Well-Architected Framework](https://docs.cloud.google.com/architecture/framework)

### Hátránya

**A cloud nem feltétlenül olcsó.**

A költség sok szolgáltatásnál a használattól függ. A Google Cloud például pay-as-you-go árazást alkalmaz, és a szolgáltatások árát külön kell figyelembe venni. [Google Cloud – Pricing](https://cloud.google.com/pricing)

Egy rosszul megtervezett cloud környezetben könnyű olyan szolgáltatásokat használni, amelyekre valójában nincs szükséged.

---

## 4. Dedikált szerver – amikor az erőforrás csak a tiéd

Dedikált szervernél egy teljes fizikai szervert kapsz.

```text
Fizikai szerver
├── CPU
├── RAM
├── SSD
└── hálózat

       ↓

   A te rendszered
```text

Ez jóval nagyobb erőforrás-kontrollt biztosít, mint a shared hosting.

Egy dedikált szerver különösen érdekes lehet:

- nagyobb adatbázisoknál,
- nagy CPU- vagy RAM-igényű alkalmazásoknál,
- speciális szoftvereknél,
- kiszámítható, folyamatos terhelésnél,
- bizonyos compliance vagy infrastruktúra-követelményeknél.

### Hátránya

A szerver attól még nem lesz „önfenntartó”, hogy dedikált.

Valakinek kezelnie kell:

- az operációs rendszert,
- a biztonsági frissítéseket,
- a hálózatot,
- a backupokat,
- a monitorozást,
- a hibákat,
- a helyreállítást.

---

## 5. Saját szerver az irodában – on-premise

Az on-premise azt jelenti, hogy az infrastruktúra a saját helyszíneden működik.

Például:

```text
Iroda
│
├── Router / Firewall
│
├── Switch
│
├── Szerver
│    ├── VM 1
│    ├── VM 2
│    └── Adatbázis
│
└── Backup
```text

Elsőre olcsónak tűnhet.

„Veszünk egy szervert, és kész.”

Valójában azonban sokkal több költséggel kell számolni.

Például:

- szerverhardver,
- UPS,
- hálózati infrastruktúra,
- internetkapcsolat,
- tartalék hardver,
- backup,
- szerverhelyiség,
- hűtés,
- üzemeltetés,
- biztonság,
- cserealkatrészek.

És ott van a legfontosabb kérdés:

> **Ki fogja karbantartani?**

---

## A cloud sem jelenti azt, hogy „mindent a szolgáltató csinál”

Ez az egyik leggyakoribb félreértés.

AWS esetében például a biztonság úgynevezett shared responsibility modellben működik.

Az AWS felel a cloud infrastruktúrájának biztonságáért, de az ügyfél felelőssége a választott szolgáltatástól függően többek között a saját operációs rendszer, alkalmazások, jogosultságok és konfigurációk megfelelő kezelése. [AWS – Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/)

Egy EC2 virtuális gépnél például az operációs rendszer frissítése és konfigurációja továbbra is az ügyfél feladata.

Egy magasabb szintű menedzselt szolgáltatásnál viszont a szolgáltató több infrastruktúra-réteget kezel.

**A cloud nem elveszi az üzemeltetést, hanem megváltoztatja, hogy melyik része kihez tartozik.**

---

## És mi a helyzet a biztonsággal?

Sokan úgy gondolják:

> „A saját szerver biztonságosabb, mert nálunk van.”

Ez önmagában nem igaz.

Másrészt az sem igaz, hogy:

> „A cloud biztonságos, ezért nekünk semmit sem kell csinálnunk.”

Mindkettő lehet biztonságos.

A biztonság nagyban függ a konfigurációtól, a hozzáférésektől, a frissítésektől, a monitorozástól és az alkalmazásoktól.

AWS-nél például az ügyfél felelőssége a szolgáltatástól függően a jogosultságkezelés, a hálózati szabályok, a saját alkalmazások és az adatok védelme is. [AWS – Security and shared responsibility](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/shared-responsibility.html)

Egy saját szerver esetében pedig neked kell megszervezned az infrastruktúra és az azon futó rendszerek biztonságát.

---

## A backup nem ugyanaz, mint a szerver

Ez kritikus különbség.

Ha van egy szervered és azon van egy backup mappa, az még nem feltétlenül jelent megfelelő biztonsági mentést.

Mi történik, ha:

- meghibásodik a szerver,
- ransomware támadás történik,
- valaki törli az adatokat,
- az egész iroda elérhetetlenné válik?

Ha a backup ugyanazon a szerveren van, könnyen együtt tűnhet el az eredeti adattal.

**A backup akkor ér valamit, ha vissza is tudod állítani belőle a rendszert.**

A Google Cloud ajánlása szerint a mentéseket nemcsak létrehozni, hanem rendszeresen tesztelni is kell; a helyreállításnál érdemes többek között az RTO-t és RPO-t is meghatározni.

Az AWS Backup dokumentációja szintén kiemeli a backupok konfigurálását és a visszaállítási képesség rendszeres tesztelését. [AWS – Security in AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/security-considerations.html)

---

## RTO és RPO – két fogalom, amit érdemes ismerni

Az RPO azt jelzi, hogy **legfeljebb mennyi adat elvesztése elfogadható**.

Például:

```text
RPO = 1 óra
```

Ez nagyjából azt jelenti, hogy egy komoly hiba esetén legfeljebb az utolsó egy órában keletkezett adatok elvesztésére terveztél.

Az RTO pedig azt mutatja meg, hogy **mennyi idő alatt kell helyreállnia a rendszernek.**

Például:

```text
RTO = 4 óra
```

Ez azt jelenti, hogy a cél az, hogy egy meghibásodás után négy órán belül újra működjön a rendszer.

Nem minden vállalkozásnak kell másodperces helyreállítás.

Egy egyszerű céges weboldal és egy 24/7 működő webshop üzleti kockázata teljesen más.

---

## Mennyibe kerül?

Ez az a rész, ahol könnyű rossz döntést hozni.

Ne csak a havi szerverárat hasonlítsd össze.

Számold bele:

```text
Infrastruktúra
+ backup
+ monitoring
+ licencek
+ üzemeltetés
+ biztonság
+ fejlesztői idő
+ hibák kezelése
+ helyreállítás
= valódi költség
```

Egy VPS lehet például néhány ezer vagy tízezer forint havonta.

Egy nagyobb cloud környezet ennek többszöröse vagy sokszorosa is lehet.

Egy saját szerver pedig jelentős kezdeti beruházást igényelhet.

Viszont a legdrágább infrastruktúra nem feltétlenül az, amelyiknek a legmagasabb a havi számlája.

**A legdrágább rendszer lehet az, amelyik akkor áll le, amikor éppen a legnagyobb szükséged van rá.**

---

## A cloud egyik nagy előnye: nem kell előre mindent megvenned

Tegyük fel, hogy egy webshop indul.

Ma:

```text
100 látogató / nap
```

Egy év múlva:

```text
5 000 látogató / nap
```

Egy klasszikus saját infrastruktúránál előre kell tervezned a kapacitást.

Cloudban bizonyos architektúráknál könnyebb az erőforrásokat növelni vagy csökkenteni.

A Google Cloud megbízhatósági ajánlásai például külön foglalkoznak a horizontális skálázással és a redundáns infrastruktúrával. [Google Cloud – Reliability pillar](https://docs.cloud.google.com/architecture/framework/reliability)

Ez azonban nem jelenti azt, hogy minden cloud rendszer automatikusan skálázódik.

**A skálázást meg is kell tervezni.**

---

## Mikor érdemes shared hostingot választani?

Tipikusan akkor, ha:

* bemutatkozó weboldalad van,
* egyszerű céges oldalad van,
* kis forgalmú WordPress oldalról van szó,
* nincs szükséged saját backend infrastruktúrára,
* nem akarsz szervert üzemeltetni.

Egy egyszerű vállalkozói weboldalhoz gyakran felesleges AWS-t használni.

---

## Mikor jó egy VPS?

Jó középút lehet, ha:

* saját backend kell,
* Dockerben futtatnál alkalmazásokat,
* van adatbázisod,
* több szolgáltatást futtatnál,
* szükséged van SSH-hozzáférésre,
* szeretnél nagyobb kontrollt.

Egy kisebb webalkalmazás vagy belső üzleti rendszer számára gyakran ez praktikus megoldás.

---

## Mikor érdemes cloudba menni?

A cloud különösen érdekes lehet, ha:

* változó a terhelés,
* gyorsan növekszik a rendszer,
* több környezet kell,
* több régióra van szükség,
* sok külső szolgáltatást használsz,
* automatizált deployment kell,
* magasabb rendelkezésre állás szükséges,
* komolyabb monitoringra van szükség.

Egy gyorsan növekvő SaaS terméknél például teljesen más infrastruktúra lehet indokolt, mint egy helyi szolgáltató bemutatkozó oldalán.

---

## Mikor lehet indokolt a dedikált szerver?

A dedikált szerver akkor érdekes, ha:

* sok folyamatos erőforrásra van szükség,
* speciális hardverigény van,
* kiszámítható a terhelés,
* nagy adatbázist kezelsz,
* speciális infrastruktúra-követelményed van.

De érdemes összevetni a cloud költségével és az üzemeltetési igénnyel.

Nem automatikusan jobb.

---

## Mikor van értelme az on-premise rendszernek?

Saját infrastruktúra lehet indokolt, ha:

* speciális szabályozási követelmények vannak,
* bizonyos rendszereknek fizikailag helyben kell maradniuk,
* speciális ipari berendezésekhez kapcsolódnak,
* internetkapcsolat nélkül is működniük kell,
* már komoly meglévő infrastruktúrád van,
* van hozzá megfelelő IT-csapat.

A Microsoft hibrid cloud útmutatója is olyan környezetekkel számol, ahol egyes workloadoknak on-premise környezetben kell maradniuk, miközben más rendszerek cloudban futnak. [Microsoft – Hybrid and multicloud](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/scenarios/hybrid/toolchain)

Ezért nem feltétlenül „cloud vagy saját szerver” a kérdés.

Lehet:

**cloud + saját infrastruktúra.**

---

## Mit választanék különböző vállalkozásoknál?

Nem szabályként, hanem kiindulópontként:

| Vállalkozás                          | Kiinduló megoldás               |
| ------------------------------------ | ------------------------------- |
| Egyéni vállalkozó, egyszerű weboldal | Shared hosting                  |
| Kis cég, saját webalkalmazás         | VPS                             |
| Kisebb webshop                       | VPS vagy menedzselt cloud       |
| Növekvő SaaS                         | Cloud                           |
| Nagy forgalmú webalkalmazás          | Cloud / dedikált infrastruktúra |
| Nagy adatbázis, speciális terhelés   | Dedikált vagy cloud             |
| Ipari / speciális helyi rendszer     | On-premise vagy hybrid          |
| Több telephelyes vállalat            | Cloud vagy hybrid               |

Ezek nem merev kategóriák.

Egy kis vállalkozásnak is lehet olyan rendszere, amely cloudot igényel.

Egy nagyobb cégnek is lehet egyszerű weboldala shared hostingen.

---

## Ki fogja karbantartani?

Talán ez a legfontosabb kérdés az egész témában.

Mert a szerver nem csak egy hely, ahol fut az alkalmazás.

Valakinek figyelnie kell:

* a frissítésekre,
* a biztonságra,
* a backupokra,
* a tárhelyre,
* a CPU/RAM használatra,
* a tanúsítványokra,
* a hibákra,
* a logokra,
* a monitoringra.

Cloud esetén a szolgáltató sok infrastruktúra-elemet kezel, de a saját konfigurációidért és alkalmazásaidért továbbra is felelős vagy. [AWS – Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/)

Saját szervernél még több feladat kerül hozzád.

**Ha nincs embered, aki ezeket kezeli, ne csak a szerver árát nézd. Az üzemeltetés költségét is számold bele.**

---

## A legegyszerűbb döntési logika

Ha nagyon röviden kellene összefoglalni:

```text
Egyszerű weboldal?
        ↓
Shared hosting

Saját backend / kisebb rendszer?
        ↓
VPS

Növekvő vagy összetett alkalmazás?
        ↓
Cloud

Nagy, kiszámítható erőforrásigény?
        ↓
Dedikált szerver

Speciális helyi / szabályozott környezet?
        ↓
On-premise / Hybrid
```

És van még egy fontos szabály:

> **Ne vegyél infrastruktúrát egy problémára, amelyet még nem ismerünk.**

Először határozd meg:

* mekkora a terhelés,
* milyen adatok vannak,
* milyen rendelkezésre állás kell,
* mekkora kiesés elfogadható,
* ki fogja üzemeltetni,
* milyen biztonsági követelmények vannak,
* mennyit szeretnél rá költeni.

Utána válassz technológiát.

---

## A legfontosabb kérdés

> **Ha holnap leállna a szervered, mennyi ideig tudna működés nélkül maradni a vállalkozás?**

Ha a válasz „néhány nap”, valószínűleg nincs szükséged ugyanarra az infrastruktúrára, mint egy 24/7 működő webshopnak.

Ha viszont egy óra kiesés is komoly pénzügyi veszteséget jelent, akkor már nem egyszerű hostingot választasz.

**Rendelkezésre állást, backupot, monitorozást és helyreállítási stratégiát választasz.**

A legtöbb kisvállalkozásnak nem saját szerverparkra van szüksége. Sok esetben egy jó shared hosting, VPS vagy menedzselt cloud szolgáltatás egyszerűbb és biztonságosabban üzemeltethető.

**softwaredevelopment.hu — Nem az a kérdés, hogy cloud vagy saját szerver a „jobb”. Az a kérdés, hogy mennyi infrastruktúrára van valóban szükséged, és ki fogja működtetni.**

---

## Források

* AWS: [Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/)
* AWS: [Shared responsibility – Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/shared-responsibility.html)
* AWS: [Security in AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/security-considerations.html)
* Google Cloud: [Well-Architected Framework](https://docs.cloud.google.com/architecture/framework)
* Google Cloud: [Reliability pillar](https://docs.cloud.google.com/architecture/framework/reliability)
* Google Cloud: [Build highly available systems through resource redundancy](https://docs.cloud.google.com/architecture/framework/reliability/build-highly-available-systems)
* Google Cloud: [Pricing](https://cloud.google.com/pricing)
* Microsoft Learn: [Unified hybrid and multicloud operations](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/scenarios/hybrid/toolchain)
* Microsoft Learn: [Hosting applications on Azure](https://learn.microsoft.com/en-us/azure/developer/intro/hosting-apps-on-azure)
* DigitalOcean: [Backups Pricing](https://docs.digitalocean.com/products/backups/details/pricing/)

````
