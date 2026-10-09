---
title: "Protokol A2A: ako spolu komunikujú AI agenti?"
description: "Ako A2A umožňuje AI agentom navzájom sa nájsť, delegovať úlohy a spolupracovať – a v čom sa v multiagentových systémoch líši od MCP."
tags: [a2a, ai-agent, multi-agent, mcp, automation]
date: 2026-10-30 08:00
image: /articles/a2a-protocol/share.jpg
---

## Čo sa stane, keď AI agent potrebuje pomoc?

V predchádzajúcich článkoch sme sa pozreli na to, ako môže AI agent využívať externé nástroje prostredníctvom MCP.

Predstavte si však zložitejší systém.

Máte agenta zákazníckej podpory, ktorý dostane takúto požiadavku:

> „Tovar som vrátil. Kedy mi vrátite peniaze?“

Agent zákazníckej podpory zvládne samotnú konverzáciu, no faktúry ani refundácie možno nespravuje.

Namiesto toho, aby sa každý systém pripájal priamo k tomu istému agentovi, môže požiadať o pomoc iného, špecializovaného agenta.

**Práve tu prichádza na rad protokol Agent2Agent, skrátene A2A.**

A2A je otvorený štandard, ktorý umožňuje nezávislým AI agentom komunikovať a spolupracovať, aj keď vznikli v rôznych frameworkoch, programovacích jazykoch či u rôznych dodávateľov. Pôvodne ho vyvinul Google, dnes ho zastrešuje ekosystém Linux Foundation. Aktuálna oficiálna špecifikácia má verziu 1.0.0. ([A2A Protocol](https://a2a-protocol.org/v1.0.0/), [Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/))

---

## A2A nie je ďalší chatbot

Je dôležité oddeliť od seba niekoľko pojmov.

A2A nie je AI model.

Nie je to ani framework na tvorbu agentov.

A nie je to ani samotný agent.

**A2A je komunikačný protokol pre agentov.**

Zjednodušene:

```text
Agent A
   ↓
   A2A
   ↓
Agent B
```

Jeden agent môže delegovať úlohu, vyžiadať si informácie, odovzdať kontext, prevziať výsledok alebo sledovať dlhšie bežiacu úlohu.

Oficiálna špecifikácia A2A je navrhnutá tak, aby agenti mohli spolupracovať bez toho, aby potrebovali prístup k vnútornému stavu, pamäti či nástrojom toho druhého. ([A2A Protocol – Specification](https://a2a-protocol.org/dev/specification/))

To je dôležité.

Agent môže byť v podstate čierna skrinka.

Inému agentovi stačí vedieť:

- čo dokáže,
- kde je dostupný,
- aké úlohy podporuje,
- ako s ním komunikovať,
- a aký druh výsledku môže vrátiť.

---

## A2A a MCP: aký je medzi nimi rozdiel?

Ide o jedno z najdôležitejších rozlíšení v dnešnej architektúre agentov.

**MCP prepája agenta s nástrojmi a zdrojmi.**

**A2A prepája agenta s inými agentmi.**

Jednoduchý obraz:

```text
                    AI Agent
                   /        \
                MCP          A2A
                 ↓             ↓
          Tools / Data      Other Agents
```

Cez MCP môže agent získať prístup k:

- databázam,
- CRM systémom,
- súborom,
- GitHubu,
- API,
- interným firemným systémom.

A2A umožňuje agentovi komunikovať s iným agentom.

Oficiálna dokumentácia A2A ich opisuje ako vzájomne sa dopĺňajúce vrstvy: MCP rieši vzťah medzi agentom a nástrojmi či zdrojmi, A2A zasa spoluprácu medzi agentmi. ([A2A Protocol – A2A and MCP](https://a2a-protocol.org/dev/topics/a2a-and-mcp/))

Reálny systém môže využívať oboje:

```text
Customer Agent
      │
      │ A2A
      ↓
Billing Agent
      │
      │ MCP
      ↓
Billing Database
```

---

## 1. Objavovanie agentov – ako jeden agent nájde druhého?

Skôr než dvaja agenti začnú spolupracovať, jeden z nich musí vedieť, že ten druhý existuje.

A musí tiež vedieť, čo ten druhý agent v skutočnosti dokáže.

Tu prichádza na rad **Agent Card**.

Agent Card je štruktúrovaný JSON dokument, ktorý slúži ako digitálna vizitka agenta.

Môže opisovať:

- názov agenta,
- popis,
- endpoint služby,
- schopnosti,
- zručnosti (skills),
- podporované formáty interakcie,
- požiadavky na autentifikáciu.

Podľa oficiálnej dokumentácie Agent Card umožňuje klientskemu agentovi pochopiť schopnosti vzdialeného agenta a to, ako s ním bezpečne komunikovať. ([A2A Protocol – Agent Discovery](https://a2a-protocol.org/dev/topics/agent-discovery/))

Zjednodušený príklad:

```text
Agent Card

Name:
Billing Agent

Description:
Handles invoices and refunds

Skills:
- check_invoice
- calculate_refund
- process_refund

Endpoint:
https://billing.example.com/a2a
```

Volajúci agent sa teraz môže rozhodnúť:

> „Tento agent vie vybaviť refundácie. Túto časť úlohy by som mal delegovať jemu.“

---

## 2. Delegovanie – odovzdanie úlohy

Predstavme si, že agent zákazníckej podpory (Customer Service Agent) dostane správu:

> „Tovar som vrátil. Kedy mi vrátite peniaze?“

Agent rozpozná, že ide o úlohu súvisiacu s fakturáciou.

Proces môže vyzerať takto:

```text
Zákazník
  ↓
Customer Service Agent
  ↓
„Toto je úloha pre fakturáciu“
  ↓
Billing Agent
  ↓
Informácie o refundácii
  ↓
Customer Service Agent
  ↓
Zákazník
```

Customer Service Agent nemusí vedieť, ako Billing Agent funguje vnútri.

Nemusí vedieť:

- akú databázu používa,
- aký model používa,
- aký framework používa,
- ani aké nástroje interne využíva.

**Stačí mu rozumieť schopnostiam, ktoré agent deklaruje, a jeho rozhraniu A2A.**

Je to jedna z dôležitých myšlienok, na ktorých stoja multiagentové systémy.

---

## 3. Agent nie je len ďalšie volanie funkcie

Na prvý pohľad sa môže zdať jednoduchšie sprístupniť iného agenta ako nástroj.

Niekedy to môže fungovať.

Agent však môže byť podstatne zložitejší než bežná funkcia.

Nástroj môže vyzerať takto:

```text
get_customer(id)
```

Agent naproti tomu môže:

- uvažovať o úlohe,
- pýtať sa na upresnenie,
- vykonať viacero krokov,
- pracovať dlhší čas,
- využívať viacero nástrojov,
- udržiavať stav,
- a vytvárať rôzne druhy výsledkov.

A2A preto chápe agentov ako niečo viac než jednoduché volania funkcií. Oficiálna dokumentácia podporuje viackolové, stavové a dlhšie bežiace interakcie. ([A2A Protocol – What is A2A?](https://a2a-protocol.org/dev/topics/what-is-a2a/))

---

## 4. Úlohy (Tasks) – základná jednotka spolupráce

V A2A predstavuje **Task** stavovú jednotku práce.

Užitočné je to vtedy, keď agent nedokáže odpovedať okamžite.

Napríklad:

> „Zanalyzuj celý náš dataset predajov a priprav report.“

To môže trvať aj niekoľko minút.

Klient by nemal musieť držať otvorenú jednu požiadavku, kým sa všetko nedokončí.

Úloha namiesto toho môže mať svoj životný cyklus:

```text
submitted
   ↓
working
   ↓
input-required
   ↓
working
   ↓
completed
```

Špecifikácia A2A chápe úlohy ako stavové jednotky práce, ku ktorým patria správy a výsledky. ([A2A Protocol – Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/))

Vďaka tomu je A2A vhodný na viac než len jednoduché interakcie typu požiadavka – odpoveď.

---

## 5. Správy a artefakty

Agenti si nemusia vymieňať iba čistý text.

A2A rozlišuje medzi **správami (Messages)** a **artefaktmi (Artifacts)**.

Správa je súčasťou komunikácie.

Napríklad:

> „Faktúru som našiel, ale na výpočet refundácie potrebujem dátum vrátenia tovaru.“

Artefakt je konkrétny výsledok, napríklad:

- dokument,
- obrázok,
- štruktúrovaný JSON,
- súbor,
- analýza,
- alebo iný vygenerovaný výstup.

Špecifikácia A2A oddeľuje komunikáciu od výstupov úlohy: správy slúžia na interakciu a oznamovanie stavu, artefakty predstavujú konkrétne výsledky, ktoré úloha vytvorí. ([A2A Protocol – Specification](https://a2a-protocol.org/dev/specification/))

Je to dôležité, pretože výstupom agenta nie je vždy len jedna veta.

---

## Kompletný firemný príklad: plánovanie cesty

Zoberme si takúto požiadavku:

> „Naplánuj trojdňovú služobnú cestu do Berlína vrátane letenky a hotela.“

Jeden agent by sa mohol pokúsiť zvládnuť všetko sám.

Multiagentová architektúra by namiesto toho mohla vyzerať takto:

```text
Travel Agent
   │
   ├── A2A → Flight Agent
   │
   ├── A2A → Hotel Agent
   │
   └── A2A → Calendar Agent
```

### 1. Travel Agent

Hlavný agent interpretuje cieľ.

Zistí, že treba vyriešiť:

- lety,
- ubytovanie,
- voľné termíny v kalendári.

### 2. Flight Agent

Travel Agent deleguje:

> „Nájdi vhodné lety do Berlína na požadované dátumy.“

Flight Agent využíva vlastné systémy.

Interne môže používať MCP:

```text
Flight Agent
    ↓ MCP
Airline API
    ↓
Flight data
```

### 3. Hotel Agent

Travel Agent požiada ďalšieho agenta:

> „Nájdi vhodné ubytovanie pre služobnú cestu v blízkosti centra.“

Hotel Agent využíva vlastné dátové zdroje.

### 4. Výsledky sa vracajú

```text
Flight Agent
      ↓
3 flight options

Hotel Agent
      ↓
5 hotel options

Calendar Agent
      ↓
Available dates
```

### 5. Hlavný agent poskladá výsledok

Travel Agent skombinuje informácie a predloží používateľovi itinerár.

Podstatné je:

**Travel Agent nepotrebuje priamy prístup ku každému systému v pozadí.**

Špecializovanú prácu deleguje na špecializovaných agentov.

---

## Multiagentová architektúra

Väčší podnikový systém môže vyzerať takto:

```text
                    User
                      ↓
                Orchestrator
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
       Sales       Support      Finance
       Agent        Agent        Agent
          │           │           │
         MCP         MCP         MCP
          ↓           ↓           ↓
        CRM         Tickets       ERP
```

Komunikáciu medzi agentmi môže zabezpečovať A2A.

Vnútri každého agenta môže MCP sprístupňovať jeho vlastné nástroje a dáta.

**A2A zabezpečuje komunikáciu medzi agentmi; MCP tvorí vrstvu nástrojov a zdrojov vnútri každého agenta.**

---

## Komunikácia je viac než požiadavka a odpoveď

A2A podporuje viacero vzorov interakcie.

Pri krátkej úlohe môže stačiť požiadavka/odpoveď.

Pri dlhšie bežiacej operácii môže systém potrebovať:

- streaming,
- priebežné aktualizácie stavu,
- push notifikácie,
- asynchrónne spracovanie.

Oficiálna dokumentácia A2A uvádza ako podporované mechanizmy interakcie požiadavku/odpoveď, streaming cez Server-Sent Events a push notifikácie. ([A2A Protocol – Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/))

Pri dlhších firemných procesoch to má význam.

Napríklad:

```text
09:00 → Task started
09:01 → Searching data
09:03 → Waiting for external system
09:05 → 60% complete
09:08 → Completed
```

Klient nemusí byť nevyhnutne zablokovaný, kým vzdialený agent pracuje.

---

## Prečo je užitočné, aby bol agent „čiernou skrinkou“?

Predstavte si, že vaša firma má daňového agenta.

Inému agentovi stačí vedieť:

```text
Tax Agent

Skills:
- calculate_tax
- explain_tax_rule
- validate_tax_data
```

Nemusí poznať:

- model, na ktorom beží,
- interné prompty,
- architektúru pamäte,
- databázu,
- nástroje MCP.

Vzniká tak pevná hranica abstrakcie.

Ak sa interná implementácia Tax Agenta neskôr zmení, ostatní agenti sa možno vôbec nebudú musieť meniť.

**Jedným z hlavných cieľov A2A je interoperabilita medzi agentmi vytvorenými v rôznych frameworkoch, jazykoch a u rôznych dodávateľov.** ([A2A Protocol](https://a2a-protocol.org/))

---

## A čo bezpečnosť?

Keď agenti komunikujú medzi sebou, autentifikácia a autorizácia sú rovnako dôležité ako v akomkoľvek inom podnikovom systéme.

Agent Card môže deklarovať požiadavky na autentifikáciu.

Dokumentácia A2A uvádza, že prihlasovacie údaje, ako sú OAuth tokeny alebo API kľúče, sa odovzdávajú v HTTP hlavičkách, nie ako súčasť obsahu samotnej A2A správy. ([A2A Protocol – Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/))

Medzi dôležité otázky patrí:

- Kto smie tohto agenta volať?
- Aké úlohy môže prijať?
- Aké informácie smie poskytnúť?
- Ktorých ďalších agentov môže kontaktovať?
- Ktoré akcie vyžadujú schválenie človekom?
- Ako sa zaznamenávajú delegované úlohy?

Mimoriadne dôležité je to preto, že **jeden agent môže prostredníctvom iného agenta spustiť konkrétne akcie**.

Problém s oprávneniami sa tak môže preniesť cez viacero krokov.

---

## A2A + MCP: tu to začína byť naozaj zaujímavé

Tieto dva protokoly nie sú alternatívy.

Agent môže vyzerať takto:

```text
Customer Agent
     │
     │ A2A
     ↓
Billing Agent
     │
     ├── MCP → Invoice Database
     ├── MCP → ERP
     └── MCP → Payment API
```

Úlohy sú teraz jasne rozdelené.

**A2A: „Porozprávaj sa s iným agentom.“**

**MCP: „Použi nástroj alebo pristúp k zdroju.“**

Oficiálna dokumentácia A2A výslovne opisuje MCP a A2A ako vzájomne sa dopĺňajúce: MCP dáva jednotlivému agentovi prístup k nástrojom a zdrojom, A2A mu zasa umožňuje spolupracovať s inými agentmi. ([A2A Protocol – A2A and MCP](https://a2a-protocol.org/dev/topics/a2a-and-mcp/))

---

## Kedy má multiagentový systém zmysel?

Nie každý problém potrebuje viacerých agentov.

Pri jednoduchej úlohe môže stačiť toto:

```text
User
 ↓
One Agent
 ↓
MCP Tools
 ↓
Result
```

Multiagentová architektúra začína byť zaujímavá vtedy, keď:

- ide o rôzne odborné oblasti,
- rôzne úlohy vlastnia rôzne tímy alebo systémy,
- sú potrebné rôzne oprávnenia,
- agenti využívajú rôzne dátové zdroje,
- špecializovaní agenti plnia odlišné roly,
- alebo musia spolupracovať agenti patriaci rôznym organizáciám.

Napríklad:

```text
Jeden agent:
„Zvládni celý firemný proces.“

Viacero agentov:
„Sales agent → CRM
 Finance agent → ERP
 Support agent → tickets
 Legal agent → documents“
```

Druhá architektúra so sebou prináša aj vyššiu zložitosť.

Viac agentov automaticky neznamená lepší systém.

---

## Smerujeme k sieťam agentov?

Jedným z cieľov A2A je ekosystém, v ktorom agenti nie sú izolované aplikácie.

Agent dokáže nájsť iného agenta, zistiť jeho schopnosti, delegovať mu prácu a spracovať výsledok.

```text
                  Agent A
                 /       \
              A2A         A2A
               ↓           ↓
           Agent B      Agent C
              │             │
             MCP           MCP
              ↓             ↓
            Tools         Tools
```

Toto už nie je jednoduchá architektúra chatbota.

Má bližšie k **distribuovanému softvérovému systému, v ktorom AI agenti plnia špecializované roly a spolupracujú na spoločnom cieli.**

Oficiálna dokumentácia A2A predstavuje protokol ako vrstvu interoperability pre agentov vytvorených v rôznych frameworkoch a rôznymi dodávateľmi. ([A2A Protocol](https://a2a-protocol.org/v1.0.0/))

## Kedy použiť MCP a kedy A2A?

Ak AI agent potrebuje prístup k databáze, API, súboru alebo inému nástroju, vhodnou integračnou vrstvou môže byť **MCP**.

Ak AI agent potrebuje pomoc od iného autonómneho agenta, na takúto komunikáciu je určený **A2A**.

Spolu môžu tvoriť napríklad takúto architektúru:

```text
User
 ↓
Agent A
 │
 ├── MCP → vlastné nástroje
 │
 └── A2A → Agent B
              │
              ├── MCP → vlastné nástroje
              └── A2A → Agent C
```

**MCP prepája agenta s jeho schopnosťami. A2A prepája agenta s inými agentmi.**

Toto rozlíšenie bude pravdepodobne čoraz dôležitejšie, keďže sa AI systémy posúvajú od samostatných asistentov k špecializovaným, prepojeným agentovým systémom.

**softwaredevelopment.hu — AI, automatizácia a softvér na mieru pre firmy.**

---

## Zdroje

- A2A Protocol: [A2A Protocol 1.0.0](https://a2a-protocol.org/v1.0.0/)
- A2A Protocol: [What is A2A?](https://a2a-protocol.org/dev/topics/what-is-a2a/)
- A2A Protocol: [Core Concepts and Components](https://a2a-protocol.org/latest/topics/key-concepts/)
- A2A Protocol: [Agent Discovery](https://a2a-protocol.org/dev/topics/agent-discovery/)
- A2A Protocol: [A2A and MCP](https://a2a-protocol.org/dev/topics/a2a-and-mcp/)
- A2A Protocol: [Protocol Specification](https://a2a-protocol.org/dev/specification/)
- Google Developers Blog: [Announcing the Agent2Agent Protocol](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- Google Developers Blog: [Developer’s Guide to AI Agent Protocols](https://developers.googleblog.com/developers-guide-to-ai-agent-protocols/)
