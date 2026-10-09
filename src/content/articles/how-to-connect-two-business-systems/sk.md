---
title: "Ako prepojiť dva samostatné firemné systémy?"
description: "API, webhooky, middleware, Zapier, Make alebo vývoj na mieru? Praktický sprievodca prepájaním samostatných firemných systémov."
tags: [api, webhook, automation, integration, business]
date: 2026-10-11 08:00
image: /articles/how-to-connect-two-business-systems/share.jpg
---

Predstavte si, že prevádzkujete internetový obchod, CRM a fakturačný systém.

V obchode pribudne nová objednávka. Niekto musí preniesť údaje o zákazníkovi a objednávke do fakturačného systému, aktualizovať CRM a možno upozorniť kolegu.

Všetko to sa dá urobiť ručne.

Keď však máte desiatky či stovky objednávok, do popredia sa dostáva iná otázka:

> **Prečo by mali ľudia ručne kopírovať tie isté informácie medzi systémami?**

Práve tu prichádza na rad integrácia.

---

## Čo vlastne znamená prepojiť dva systémy?

Integrácia jednoducho znamená, že dva samostatné systémy si dokážu vymieňať informácie.

Napríklad:

```text
Internetový obchod
   ↓
Nová objednávka
   ↓
Integrácia
   ↓
Fakturačný systém
   ↓
Vystavená faktúra
   ↓
Aktualizované CRM
```

Tieto dva systémy nemusia nevyhnutne komunikovať priamo.

Medzi nimi môže byť middleware alebo platforma iPaaS.

Bežné prístupy zahŕňajú:

- API
- webhooky
- middleware alebo platformy iPaaS, napríklad Zapier či Make
- výmenu dát cez súbory
- vývoj integrácie na mieru

Každý z týchto prístupov má svoje miesto.

---

## 1. API – keď systémy komunikujú priamo

API poskytuje štruktúrovaný spôsob, ako môže jeden systém získať alebo zmeniť informácie v inom systéme.

Internetový obchod môže napríklad odoslať:

```text
POST /invoices

{
  "customer": "Peter Novák",
  "email": "peter@example.com",
  "amount": 125000
}
```

Fakturačný systém požiadavku spracuje a vráti odpoveď.

Odpoveď môže signalizovať, či bola požiadavka úspešná, či boli zaslané údaje neplatné alebo či v cieľovom systéme nastala chyba. HTTP definuje samostatné triedy pre úspešné odpovede 2xx, chyby klienta v rozsahu 4xx a chyby servera v rozsahu 5xx. [RFC 9110 – HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)

### Kedy je API dobrou voľbou?

API je užitočné najmä vtedy, keď:

- sa dáta musia preniesť okamžite,
- potrebujete obojsmernú komunikáciu,
- je v hre výrazná obchodná logika,
- pracujete s väčšími objemami dát,
- potrebujete integráciu presne kontrolovať.

### Nevýhoda

Integrácia cez API zvyčajne vyžaduje technický vývoj.

A nestačí vedieť, že API existuje. Musíte rozumieť jeho dokumentácii, autentifikácii, limitom počtu požiadaviek, podporovaným operáciám, verziám a spracovaniu chýb.

---

## 2. Webhooky – keď vám systém oznámi, že sa niečo stalo

Pri API sa iného systému často pýtate:

> „Pribudla nová objednávka?“

Webhook smer otáča.

Systém pošle notifikáciu vo chvíli, keď nastane udalosť.

Napríklad:

```text
Nová objednávka
    ↓
Webhook obchodu
    ↓
POST /webhooks/order-created
    ↓
Integrácia
    ↓
CRM + fakturácia
```

Make opisuje webhooky ako HTTPS požiadavky, ktoré môžu spustiť scenár, keď prídu dáta. Webhooky môžu slúžiť ako okamžité spúšťače namiesto opakovaného dopytovania služby na nové informácie. [Make – Webhooks](https://help.make.com/webhooks?v=2)

### Kedy sú webhooky užitočné?

Napríklad keď:

- vznikne nová objednávka,
- sa zaregistruje zákazník,
- prebehne úspešná platba,
- sa zmení stav objednávky,
- sa vygeneruje dokument,
- príde nový lead.

Webhook nemusí byť celou integráciou. Často je to udalosť, ktorá spúšťa ďalšiu časť procesu.

---

## 3. Zapier alebo Make – keď nechcete všetko stavať sami

Ak systémy už majú hotové integrácie, vlastný backend možno vôbec nepotrebujete.

Medzi systémy môžete zaradiť platformu iPaaS alebo nástroj na workflow:

```text
Internetový obchod
   ↓
Nová objednávka
   ↓
Make / Zapier
   ↓
Aktualizácia CRM
   ↓
Vystavenie faktúry
   ↓
Odoslanie e-mailu
```

Zapier dokáže prijímať webhookové požiadavky z externých systémov a zároveň odosielať webhookové požiadavky na externé URL a API. [Zapier – Trigger Zaps from webhooks](https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks) · [Zapier – Send webhooks in Zap workflows](https://help.zapier.com/hc/en-us/articles/8496326446989-Send-webhooks-in-Zap-workflows)

Make ponúka podobné workflow riadené webhookmi. [Make – Webhooks](https://help.make.com/webhooks?v=2)

### Výhody

- rýchla realizácia,
- málo vlastného kódu,
- množstvo hotových konektorov,
- pri jednoduchých workflow často lacnejšie než vývoj na mieru,
- ľahšie pochopiteľné a udržiavateľné aj pre neprogramátorov.

### Nevýhody

Čím zložitejšie workflow je, tým ťažšie sa môže udržiavať.

Toto je jednoduché:

```text
Nová objednávka → CRM → e-mail
```

Toto je však podstatne zložitejšie:

```text
Nová objednávka
 → nájsť zákazníka
 → skontrolovať duplicity
 → skontrolovať sklad
 → vystaviť faktúru
 → overiť platbu
 → aktualizovať CRM
 → pri chybe zopakovať
 → ak to stále zlyháva, niekoho upozorniť
```

V tejto fáze sa oplatí zvážiť, či by nedávala väčší zmysel lepšie kontrolovaná integrácia na mieru.

---

## 4. Integrácia cez súbory – niekedy najjednoduchšia odpoveď

Nie každý firemný systém má použiteľné API.

Informácie si však môžete vymieňať aj pomocou:

- súborov CSV,
- XML,
- JSON,
- exportov z Excelu,
- SFTP.

Napríklad:

```text
ERP
 ↓
Export CSV
 ↓
SFTP / nahratie
 ↓
Iný systém
 ↓
Import
```

Je to menej sofistikované než integrácia cez API v reálnom čase, ale to z nej nerobí nutne zlé riešenie.

Ak sa účtovné dáta potrebujú prenášať len raz denne, synchronizácia v reálnom čase môže priniesť len malú dodatočnú obchodnú hodnotu.

**Integrácia nie je dobrá preto, že je technicky módna. Je dobrá preto, že zodpovedá obchodnému procesu.**

---

## 5. Integrácia na mieru – keď potrebujete viac kontroly

Pri vývoji na mieru presne určujete, ako systémy medzi sebou komunikujú.

Napríklad:

```text
API internetového obchodu
       ↓
Integračná služba na mieru
       ↓
Transformácia dát
       ↓
CRM API
       ↓
Fakturačné API
```

Dáva to zmysel, keď:

- neexistuje hotový konektor,
- je veľa obchodných pravidiel,
- treba prepojiť viacero systémov,
- objemy dát sú významné,
- potrebujete plnú kontrolu,
- proces je pre firmu kritický.

Nevýhoda je zrejmá: niekto ho musí vyvinúť, otestovať, prevádzkovať a udržiavať.

Zmena externého API si navyše môže vyžiadať aj úpravu vašej integrácie.

---

## Ktorý prístup si vybrať?

Univerzálna odpoveď neexistuje.

Jednoduchý rozhodovací postup môže vyzerať takto:

```text
Existuje hotová integrácia?
    ↓ áno
Použite ju

    ↓ nie

Existuje API alebo webhook?
    ↓ áno
API / webhook / iPaaS

    ↓ nie

Existuje pravidelný export/import?
    ↓ áno
Integrácia cez súbory

    ↓ nie

Vývoj na mieru
```

Na jednoduché workflow CRM → e-mail môže Make alebo Zapier úplne postačovať.

Pri workflow internetový obchod → ERP → fakturácia → logistika sa oplatí o architektúre premýšľať dôkladnejšie.

---

## Ťažké nie je odoslať dáta

Prvá verzia integrácie sa zvyčajne opisuje ľahko:

> „Keď vznikne objednávka, pošli ju do druhého systému.“

Dôležitejšia otázka znie:

> **Čo sa stane, keď sa niečo pokazí?**

Napríklad:

- cieľový systém je nedostupný,
- vyprší časový limit,
- prídu neplatné dáta,
- chýba povinné pole,
- tá istá udalosť príde dvakrát,
- dosiahne sa limit počtu požiadaviek API,
- zmení sa verzia API.

Preto je pri návrhu firemnej integrácie spracovanie chýb rovnako dôležité ako samotný prenos dát.

---

## Čo ak tá istá objednávka príde dvakrát?

Toto je klasický integračný problém.

Predstavte si, že obchod odošle:

```text
Objednávka #12345
```

Fakturačný systém ju prijme a vystaví faktúru.

Odpoveď sa však stratí.

Obchod preto objednávku odošle znova.

Ak cieľový systém nedokáže rozpoznať, že ide o tú istú požiadavku, môžete skončiť s duplicitnou faktúrou alebo duplicitným záznamom.

Preto je dôležitá **idempotencia**: opakované spracovanie tej istej operácie by nemalo vytvoriť nechcenú druhú obchodnú operáciu.

Architektonické odporúčania Microsoftu aj AWS sa venujú idempotentnému spracovaniu a bezpečným stratégiám opakovania. [Microsoft – Retry pattern](https://learn.microsoft.com/th-th/azure/architecture/patterns/retry) · [AWS – Asynchronous communication](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/asynchronous.html)

---

## Opakujte, ale nie donekonečna

Ak je druhý systém dočasne nedostupný, zopakovať požiadavku môže dávať zmysel.

Napríklad:

```text
Pokus 1 → neúspešný
        ↓
čakanie
        ↓
Pokus 2 → neúspešný
        ↓
čakanie
        ↓
Pokus 3 → úspešný
```

Stratégia opakovania by mala byť kontrolovaná.

Microsoft odporúča zvážiť faktory ako idempotencia, latencia a riziko, že agresívne opakovanie vytvorí na dotknutých systémoch ďalšiu záťaž. [Microsoft – Recommendations for handling transient faults](https://learn.microsoft.com/en-us/azure/well-architected/design-guides/handle-transient-faults)

Ak operácia naďalej zlyháva, môže byť potrebná samostatná chybová fronta alebo dead-letter queue, aby sa neúspešné správy dali neskôr preskúmať a znova spracovať. [AWS – Asynchronous communication](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/asynchronous.html)

---

## Nestačí, aby to fungovalo – musí to byť aj vidieť

Integrácia je oveľa užitočnejšia, keď vidíte, čo sa v nej deje.

Minimálne by ste mali vedieť odpovedať na otázky:

- kedy proces bežal?
- bol úspešný?
- ktorý záznam spracoval?
- čo sa pokazilo?
- koľkokrát sa opakoval?
- ktorý systém vrátil chybu?

Keď je zapojených viac systémov, spoločný identifikátor, napríklad correlation ID, umožní sledovať transakciu naprieč celým reťazcom. [Microsoft – Microservices assessment and readiness](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/microservices-assessment)

**Keď integrácia zlyhá, prvým krokom by nemala byť otázka: „Netušíte niekto, čo sa stalo?“**

Systém by vám to mal v ideálnom prípade povedať sám.

---

## Dobrá integrácia nemusí byť zložitá

Pre malú firmu môže byť budovanie samostatnej integračnej vrstvy úplne zbytočné.

Možno vám stačí:

```text
Internetový obchod
   ↓
Make
   ↓
CRM
```

V inej situácii môže Zapier alebo Make priniesť príliš veľa kompromisov.

Napríklad prepojenie zložitého ERP s viacerými firemnými aplikáciami môže samostatnú integračnú vrstvu ospravedlniť.

Otázka teda neznie:

> **„Ktorá technológia je najmodernejšia?“**

Ale:

> **„Aké dáta sa musia prenášať, ako často, ako spoľahlivo a s akými následkami, ak sa niečo pokazí?“**

Keď na to odpoviete, výber technológie bude oveľa jednoduchší.

---

## Otázky, na ktoré treba odpovedať pred budovaním integrácie

Oplatí sa prejsť si tento kontrolný zoznam:

- Ktorý systém je zdrojom?
- Ktorý systém je cieľom?
- Aké presne dáta sa musia preniesť?
- Aká udalosť spúšťa proces?
- Musia dáta prísť okamžite?
- Existuje API?
- Existuje webhook?
- Existuje hotová integrácia?
- Aká autentifikácia je potrebná?
- Čo sa stane, keď niečo zlyhá?
- Môže sa ten istý záznam spracovať dvakrát?
- Ako sa dá dohľadať neúspešná transakcia?
- Kto dostane upozornenie, ak sa integrácia zastaví?
- Čo sa stane, ak niektorý systém zmení svoje API?

Na tieto otázky je najlepšie odpovedať ešte pred začiatkom vývoja.

---

## Cieľom nie je prepojiť všetko so všetkým

Firma sa ľahko dostane do stavu, keď je každý systém priamo prepojený s niekoľkými ďalšími.

Rýchlo môžete skončiť s niečím takýmto:

```text
CRM ───── ERP
 │ ╲       ╱ │
 │  ╲     ╱  │
Obchod ────── Fakturácia
 │             │
 └──── API ────┘
```

Čím viac prepojení máte, tým viac miest treba udržiavať, monitorovať a aktualizovať.

**Cieľom integrácie nie je mať viac technológií. Cieľom je znížiť manuálnu prácu a predchádzať zbytočným chybám.**

Ak prepojenie nerieši skutočný obchodný problém, možno ho vôbec nepotrebujete.

---

## Najdôležitejšia otázka

> **Máte dva systémy, medzi ktorými váš tím pravidelne ručne prenáša tie isté informácie?**

Začnite tým, že zistíte, či existuje API, webhook alebo hotová integrácia. To vám často napovie, či sa problém dá vyriešiť jednoduchým workflow, alebo je opodstatnený vývoj na mieru.

Ak je však integrácia pre firmu kritická, nestačí len zabezpečiť, aby sa dáta preniesli. Treba myslieť aj na spracovanie chýb, opakovanie, duplicitné spracovanie a monitoring.

**softwaredevelopment.hu — Dobrá integrácia nie je len tá, ktorá prepojí dva systémy. Je to tá, ktorá ich udrží spoľahlivo prepojené.**

---

## Zdroje

- MDN: [API – Glossary](https://developer.mozilla.org/en-US/docs/Glossary/API)
- Make: [Webhooks](https://help.make.com/webhooks?v=2)
- Zapier: [Trigger Zaps from webhooks](https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks)
- Zapier: [Send webhooks in Zap workflows](https://help.zapier.com/hc/en-us/articles/8496326446989-Send-webhooks-in-Zap-workflows)
- RFC Editor: [RFC 9110 – HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- Microsoft Learn: [Retry pattern](https://learn.microsoft.com/th-th/azure/architecture/patterns/retry)
- Microsoft Learn: [Recommendations for handling transient faults](https://learn.microsoft.com/en-us/azure/well-architected/design-guides/handle-transient-faults)
- Microsoft Learn: [Microservices assessment and readiness](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/microservices-assessment)
- AWS Prescriptive Guidance: [Asynchronous communication](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/asynchronous.html)
- AWS Prescriptive Guidance: [Publish-subscribe pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/publish-subscribe.html)
