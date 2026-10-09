---
title: "Agentic AI: ako AI sama naplánuje a vykoná úlohu?"
description: "Ako agentic AI plánuje úlohy, používa nástroje, pamätá si kontext, učí sa zo spätnej väzby a vie, kedy má zasiahnuť človek."
tags: [agentic-ai, ai-agent, automation, ai, business]
date: 2026-10-27 08:00
image: /articles/agentic-ai/share.jpg
---

## AI, ktorá robí viac než len odpovedá

V predchádzajúcom článku sme sa pozreli na AI agentov: systémy, ktoré dokážu viac než generovať text, pretože používajú nástroje a vykonávajú akcie.

**Agentic AI je širší pojem.** Označuje AI systémy, ktoré dokážu sledovať cieľ: naplánujú, čo treba urobiť, použijú nástroje, vyhodnotia výsledky a podľa toho upravia svoj postup.

Microsoft napríklad opisuje agentov ako systémy, ktoré dokážu konať autonómne, plánovať a prechádzať viacerými krokmi v slučke, používať nástroje a udržiavať stav či pamäť. ([Microsoft](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility-ai-agent))

Celú myšlienku možno zhrnúť pomerne jednoducho:

> **Namiesto toho, aby ste AI pri každom kroku presne hovorili, čo má robiť, dáte jej cieľ, nástroje a hranice – a cestu medzi nimi si nájde sama.**

---

## Čo sa deje pri jednoduchom chatbote?

Tradičný chatbot môže fungovať takto:

```text
Otázka
  ↓
AI model
  ↓
Odpoveď
```

Ak sa opýtate:

> „Napíš krátku ponuku na tvorbu webovej stránky.“

model text vygeneruje.

Nemusí však vedieť:

- kto je zákazník,
- aké ceny používate,
- či máte voľnú kapacitu,
- čo ste ponúkali predtým,
- či smie e-mail odoslať,
- ani či treba vytvoriť záznam v CRM.

Na to je potrebné viac než generovanie textu.

---

## Agentic AI premení cieľ na proces

Agentický systém vyzerá skôr takto:

```text
Cieľ
 ↓
Plán
 ↓
Zber informácií
 ↓
Použitie nástroja
 ↓
Kontrola výsledku
 ↓
Plánovanie ďalšieho kroku
 ↓
Použitie ďalšieho nástroja
 ↓
Opätovná kontrola
 ↓
Úloha splnená / otázka na človeka
```

Dokumentácia OpenAI k agentom to opisuje ako agentovú slučku: model rozhodne, čo urobiť, v prípade potreby zavolá nástroje, dostane ich výsledky a pokračuje, kým nedosiahne skutočný bod zastavenia. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/running-agents))

**Práve táto slučka spätnej väzby patrí k určujúcim vlastnostiam agentic AI.**

---

## 1. Plánovanie – rozloženie cieľa na kroky

Predstavte si, že AI systém požiadate:

> „Priprav analýzu trhu na budúci mesiac.“

To nie je jedna operácia.

Agent ju môže rozložiť napríklad takto:

```text
1. Vymedziť trh
2. Zhromaždiť relevantné dáta
3. Identifikovať hlavných konkurentov
4. Porovnať ceny
5. Analyzovať zmeny
6. Pripraviť zhrnutie
7. Overiť zdroje
8. Vypracovať záverečnú správu
```

Agent sa nemusí držať presne tohto plánu.

**Jeden z dôležitých rozdielov oproti tradičnej automatizácii je, že ďalší krok môže závisieť od toho, čo sa stalo v predchádzajúcom.**

Ak zdroj dát nie je dostupný, systém môže skúsiť iný. Ak chýba dôležitá informácia, môže ju hľadať inde.

---

## 2. Používanie nástrojov – prepojenie AI so skutočným svetom

Model dokáže pracovať len s informáciami, ktoré má k dispozícii.

Agent môže používať nástroje.

Môžu to byť napríklad:

- vyhľadávanie na webe,
- CRM systémy,
- ERP systémy,
- databázy,
- e-mail,
- kalendáre,
- súborové systémy,
- API webshopu,
- GitHub,
- interné firemné aplikácie.

Google Cloud uvádza nástroje ako jeden zo základných stavebných prvkov agentov, pretože určujú, čo agent dokáže reálne urobiť nad rámec generovania textu. ([Google Cloud](https://cloud.google.com/resources/core-concepts-ai-agents))

Schopnosti agenta teda neurčuje len model, ktorý za ním stojí.

Rovnako dôležité je:

**K akým dátam má prístup? Ktoré nástroje môže používať? A aké akcie smú tieto nástroje vykonávať?**

---

## 3. Pamäť – udržiavanie stavu

Agent, ktorý pracuje na dlhšej úlohe, potrebuje vedieť, kde sa nachádza a čo sa už stalo.

Používať sa môžu rôzne formy pamäte a stavu.

### Krátkodobá pamäť

Aktuálna konverzácia alebo kontext úlohy.

### Pracovná pamäť

Priebežné výsledky zhromaždené počas úlohy.

### Dlhodobá pamäť

Informácie zámerne uchované pre budúce úlohy.

Obchodný agent si napríklad môže pamätať produkty, ktoré zákazník uprednostňuje, alebo predtým dohodnuté obchodné podmienky.

Google Cloud rozlišuje dlhodobé znalosti a pamäť od krátkodobého kontextu potrebného na prebiehajúcu úlohu. ([Google Cloud](https://cloud.google.com/resources/core-concepts-ai-agents))

**Pamäť neznamená uchovávať všetko navždy.** Aj uložené informácie potrebujú riadenie prístupu, pravidlá uchovávania a primeranú ochranu súkromia.

---

## 4. Slučka spätnej väzby – čo sa stane, keď sa niečo pokazí?

Toto je jedna z najzaujímavejších častí agentic AI.

Jednoduchá automatizácia môže vyzerať takto:

```text
Krok 1
 ↓
Krok 2
 ↓
Krok 3
 ↓
Hotovo
```

Ak druhý krok zlyhá, proces sa zvyčajne zastaví.

Agentický systém naopak dokáže chybu prijať, interpretovať ju a rozhodnúť, či má zmysel iný postup.

```text
Úloha
 ↓
Volanie nástroja
 ↓
Chyba
 ↓
AI vyhodnotí výsledok
 ↓
Existuje alternatíva?
 ├── Áno → iný nástroj / ďalší pokus
 └── Nie → zásah človeka
```

Anthropic opisuje agentov v podobnej samoriadenej slučke: plánujú, konajú, sledujú výsledok, upravia postup a opakujú. ([Anthropic](https://www.anthropic.com/research/trustworthy-agents))

To neznamená, že agent vždy nájde správne riešenie.

**Schopnosť skúsiť to znova alebo sa prispôsobiť nie je zárukou správnosti.**

---

## Praktický príklad z podnikania: agent zákazníckeho servisu

Vezmime si internetový obchod.

Zákazník napíše:

> „Moja objednávka stále neprišla. Môžete mi povedať, čo sa stalo?“

Jednoduchý chatbot by mohol poslať všeobecnú odpoveď.

Agentický systém dokáže prípad preveriť sám.

### 1. Pochopiť problém

Agent rozpozná, že ide o problém s doručením.

### 2. Nájsť objednávku

Pošle dopyt do databázy webshopu:

```text
Zákazník → #48152
Objednávka → #48152
Stav → odoslaná
Kuriér → XYZ
Sledovanie → 123456
```

### 3. Overiť stav u kuriéra

Agent zavolá API kuriérskej služby.

Výsledok:

```text
Posledná aktualizácia:
Zásielka dorazila do regionálneho depa
Oneskorenie: 2 dni
```

### 4. Prispôsobiť odpoveď

Agent teraz vie, že zásielka sa nestratila. Stále je na ceste, len mešká.

### 5. Overiť firemné pravidlá

Predpokladajme, že podľa pravidiel firmy dvojdňové oneskorenie automaticky nezakladá nárok na kompenzáciu.

Agent si preto nesmie vymyslieť vrátenie peňazí.

### 6. Odpovedať zákazníkovi

Zákazník dostane konkrétnu odpoveď založenú na skutočných údajoch o objednávke.

Ak sa však zásielka stratila alebo je potrebná kompenzácia, agent sa môže zastaviť.

```text
Bežné oneskorenie
→ automatická odpoveď

Stratená zásielka
→ ľudská podpora

Vrátenie peňazí
→ potrebné schválenie
```

**Užitočný agent nie je ten, ktorý dokáže všetko. Je to ten, ktorý vie, kam až smie zájsť.**

---

## Human-in-the-loop – ľudia nezmiznú

Častou mylnou predstavou je, že agentic AI znamená vyradenie ľudí z procesu.

V mnohých firemných aplikáciách je rozumnejší opak.

Agent môže vybavovať prácu s nízkym rizikom, kým ľudia rozhodujú v kritických bodoch.

Google Cloud výslovne dokumentuje vzor human-in-the-loop pre situácie, ktoré si vyžadujú ľudský dohľad, subjektívny úsudok alebo schválenie kritických akcií. ([Google Cloud](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system))

Napríklad:

```text
Vyhľadanie informácií
→ AI

Príprava správy
→ AI

Návrh cenovej ponuky
→ AI

Odoslanie ponuky vysokej hodnoty
→ Človek

Vrátenie peňazí
→ Človek
```

Človek nemusí kontrolovať každú akciu. Stačí, ak zasiahne tam, kde jeho úsudok prináša skutočnú hodnotu.

---

## Guardrails – hranice okolo agenta

Väčšia autonómia znamená aj väčšie riziko.

Preto agentické systémy potrebujú guardrails: pravidlá a kontroly, ktoré určujú, čo agent smie a čo nesmie robiť.

Dokumentácia OpenAI rozlišuje guardrails na úrovni vstupu, výstupu a nástrojov a podporuje aj ľudské schválenie pri rizikových akciách. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals))

Typické kontroly zahŕňajú:

- maximálny počet krokov,
- maximálne náklady,
- zoznamy schválených nástrojov,
- prístupové oprávnenia,
- zakázané operácie,
- body ľudského schválenia,
- časové limity,
- auditné záznamy.

Microsoft podobne odporúča prístup s minimálnymi oprávneniami, schvaľovanie citlivých akcií a spoľahlivé mechanizmy na pozastavenie či zastavenie agentov. ([Microsoft](https://learn.microsoft.com/en-us/security/zero-trust/sfi/manage-agentic-risk))

Užitočná architektúra preto vyzerá takto:

```text
                ┌───────────────┐
                │   AI agent    │
                └───────┬───────┘
                        ↓
                 Guardrails
                        ↓
              Prístup k nástrojom
                        ↓
                Externé systémy
                        ↓
              Schválenie človekom
                 v prípade potreby
```

Dôležité je, že **model by nemal byť jedinou bezpečnostnou hranicou**.

Autentifikácia, autorizácia, deterministické pravidlá a štandardné bezpečnostné mechanizmy softvéru sú stále dôležité.

---

## Kde agentic AI funguje dobre už dnes?

Nie každý problém potrebuje agenta.

Agentické systémy sú zaujímavé najmä pri úlohách, ktoré:

- pozostávajú z viacerých krokov,
- prechádzajú medzi viacerými systémami,
- obsahujú neštruktúrované informácie,
- vyžadujú opakované rozhodnutia,
- no stále fungujú v jasných hraniciach.

### Vývoj softvéru

Agenti dokážu prehľadávať kódovú základňu, upravovať súbory, spúšťať testy a podľa výsledkov rozhodnúť, čo zmeniť ďalej.

Anthropic opisuje Claude Code ako agenta, ktorý dokáže autonómne písať, ladiť a upravovať kód. ([Anthropic](https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents))

### Výskum a analýza

Agent dokáže zhromaždiť informácie z viacerých zdrojov, usporiadať zistenia a pripraviť prvotnú analýzu.

### Zákaznícky servis

Vo vhodných prípadoch dokáže agent skombinovať informácie z objednávok, zákazníckych záznamov a doručovacích systémov a vyriešiť problém bez toho, aby pri každom kroku potreboval človeka.

### Interné firemné procesy

Napríklad vyhľadávanie v dokumentoch, príprava správ, zhromažďovanie informácií a aktualizácia záznamov v CRM.

---

## Kde má ešte stále problémy?

Agentic AI nie je mágia.

Správa Microsoft Research z roku 2025 o agentických systémoch typu human-in-the-loop uvádza, že agenti sú čoraz schopnejší pri zložitých viackrokových úlohách, no v mnohých oblastiach – vrátane práce s počítačom, vývoja softvéru a výskumu – stále nedosahujú ľudskú úroveň. ([Microsoft Research](https://www.microsoft.com/en-us/research/publication/magentic-ui-report/))

Agentické systémy môžu byť obzvlášť problematické, keď:

- cieľ je nejednoznačný,
- spoľahlivé dáta nie sú k dispozícii,
- úloha silno závisí od subjektívneho úsudku,
- chyby sú veľmi drahé,
- akcie sa nedajú ľahko vrátiť späť,
- alebo má agent príliš veľa oprávnení.

Zlá odpoveď chatbota je jeden problém.

Zlý reťazec rozhodnutí agenta môže spôsobiť niekoľko navzájom prepojených problémov.

---

## Agentic AI, alebo tradičná automatizácia?

Nie každý proces by sa mal stať agentom.

Ak je proces vždy rovnaký:

```text
Vstup
→ validácia
→ databáza
→ e-mail
→ hotovo
```

tradičný deterministický workflow je často jednoduchší a predvídateľnejší.

Ak proces vyzerá skôr takto:

```text
Príde úloha
→ jej interpretácia
→ vyhľadanie informácií
→ výber z viacerých možných ciest
→ rozhodnutie o ďalšom postupe podľa výsledku
→ v niektorých prípadoch otázka na človeka
```

potom môže mať agentický prístup zmysel.

**Agenti nenahrádzajú workflowy. Sú užitoční tam, kde sa časť procesu nedá vopred úplne špecifikovať.**

---

## Ako by mala firma začať?

Firma nemusí hneď od prvého dňa budovať úplne autonómneho agenta.

Bezpečnejšie je zvyšovať autonómiu postupne.

```text
1. AI navrhuje
   ↓
2. AI pripravuje
   ↓
3. AI používa nástroje
   ↓
4. AI automaticky vykonáva akcie s nízkym rizikom
   ↓
5. Kritické akcie schvaľuje človek
   ↓
6. Ďalšie časti sa stávajú autonómnymi
```

Systém treba zároveň priebežne vyhodnocovať.

Usmernenie spoločnosti Anthropic z roku 2026 o hodnotení agentov vysvetľuje, prečo sa agenti hodnotia ťažšie ako jednoduché odpovede modelu: fungujú v priebehu viacerých kôl, volajú nástroje, menia stav a prispôsobujú sa priebežným výsledkom. ([Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents))

**Cieľom nie je maximálna autonómia. Cieľom je správna miera autonómie.**

---

## Kam teda agentic AI skutočne patrí?

Agentic AI je užitočná najmä vtedy, keď je úloha príliš zložitá pre jednoduchý chatbot, no stále dostatočne štruktúrovaná na to, aby mohla bezpečne fungovať s jasnými oprávneniami, pravidlami a ľudským dohľadom.

Dôležitou otázkou pre firmu preto nie je len to, či by mala „používať agentov“.

Ide o to, **ktoré úlohy má riešiť AI, ktoré majú zostať deterministické a kde má ľudský úsudok zostať súčasťou procesu.**

**softwaredevelopment.hu — AI, automatizácia a softvér na mieru pre firmy.**

---

## Zdroje

- OpenAI: [A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- OpenAI: [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)
- OpenAI: [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- Anthropic: [Trustworthy agents in practice](https://www.anthropic.com/research/trustworthy-agents)
- Anthropic: [Our framework for developing safe and trustworthy agents](https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents)
- Anthropic: [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- Google Cloud: [Core concepts of AI agents](https://cloud.google.com/resources/core-concepts-ai-agents)
- Google Cloud: [Choose a design pattern for your agentic AI system](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system)
- Microsoft: [AI agent shared responsibility model](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility-ai-agent)
- Microsoft Research: [Magentic-UI: Towards Human-in-the-loop Agentic Systems](https://www.microsoft.com/en-us/research/publication/magentic-ui-report/)
