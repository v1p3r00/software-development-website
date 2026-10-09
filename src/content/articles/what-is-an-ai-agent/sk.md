---
title: "Čo je AI agent a čím sa líši od chatbota?"
description: "AI agenti nielen konverzujú. Ako z AI robia model, uvažovanie, nástroje, pamäť a akčná slučka systém, ktorý dokáže dokončiť skutočné úlohy."
tags: [ai-agent, chatbot, ai, automation, business]
date: 2026-10-26 08:00
image: /articles/what-is-an-ai-agent/share.jpg
---

## Chatbot odpovedá. AI agent veci vybaví.

Chatbot a AI agent môžu zvonka vyzerať veľmi podobne. Obaja komunikujú prirodzeným jazykom, obaja môžu využívať veľký jazykový model a obaja zvládnu prekvapivo zložité otázky.

Podstatný rozdiel nemusí byť v tom, aký inteligentný sa systém zdá.

**Chatbot predovšetkým komunikuje. Agent využíva AI na to, aby sledoval cieľ, rozhodoval sa a konal.**

Klasický chatbot môže napríklad odpovedať na otázku:

> „Kedy mi príde objednávka?“

Agent by mohol:

- nájsť objednávku vo firemnej databáze,
- skontrolovať systém kuriéra,
- overiť stav doručenia,
- v prípade problému zariadiť náhradu,
- a upovedomiť zákazníka.

To už nie je len otázka a odpoveď.

---

## Z čoho sa skladá AI agent?

Agent nie je len LLM s honosnejším názvom.

Ide o kombináciu viacerých komponentov.

Google Cloud opisuje agentov prostredníctvom modelov, groundingu, nástrojov, architektúry dát a pamäte, orchestrácie a behového prostredia. OpenAI podobne označuje model, inštrukcie a nástroje za základné stavebné prvky agenta. ([Google Cloud](https://cloud.google.com/resources/core-concepts-ai-agents), [OpenAI](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/))

### 1. Model – „mozog“

Jazykový model interpretuje úlohu a pomáha rozhodnúť, čo sa má stať ďalej.

Napríklad:

> „Skontroluj, či máme na sklade 20 kusov tohto produktu, a ak áno, priprav pre zákazníka cenovú ponuku.“

Model dokáže rozpoznať, že nestačí len napísať vetu.

Potrebuje informácie odinakiaľ.

---

### 2. Uvažovanie – rozhodovanie o ďalšom kroku

Agent potrebuje nejaký spôsob, ako sa rozhodnúť, aká akcia má nasledovať.

Napríklad:

```text
Úloha
  ↓
Nájsť produkt
  ↓
Skontrolovať sklad
  ↓
Vypočítať cenu
  ↓
Vytvoriť ponuku
  ↓
Schválenie človekom?
  ↓
Odoslať ponuku
```

Nemusí ísť nevyhnutne o pevný, vopred naprogramovaný postup. V závislosti od architektúry si agent môže vybrať ďalšiu akciu podľa aktuálneho stavu, dostupných informácií a dostupných nástrojov.

To je jeden z dôležitých rozdielov medzi agentom a klasickou automatizáciou.

---

### 3. Nástroje – ruky agenta

LLM sa nedokáže zázračne prihlásiť do vášho CRM ani odoslať e-mail.

Potrebuje nástroje.

Medzi nástroje agenta môžu patriť:

- dopyty do CRM,
- databázy,
- fakturačné systémy,
- e-mail,
- kalendáre,
- vyhľadávanie na webe,
- prístup k súborom,
- API e-shopu,
- interné podnikové systémy.

Odporúčania OpenAI pre agentov opisujú nástroje na získavanie informácií, vykonávanie akcií v externých systémoch a dokonca aj na delegovanie práce na iných agentov. ([OpenAI](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/))

**Práve vďaka tomu sa z AI systému, ktorý o práci dokáže hovoriť, stáva systém, ktorý prácu dokáže aj vykonať.**

---

## 4. Pamäť – čo si agent dokáže zapamätať?

Agent nie vždy potrebuje dlhodobú pamäť. Pri zložitejších systémoch však pamäť môže byť dôležitá.

Pomáha rozlišovať niekoľko pojmov.

**Kontext:** informácie, ktoré má model práve k dispozícii.

**Pracovná pamäť:** aktuálny stav rozpracovanej úlohy.

**Dlhodobá pamäť:** informácie zámerne uložené na budúce použitie.

Obchodný agent môže mať napríklad prístup k informáciám o:

- predchádzajúcich nákupoch,
- preferenciách zákazníka,
- predchádzajúcich cenových ponukách,
- aktuálnej obchodnej príležitosti,
- cenách dohodnutých s konkrétnym zákazníkom.

Pamäť neznamená, že treba všetko uchovávať navždy.

Dobre navrhnutý systém musí rozhodnúť, **ktoré informácie sa oplatí uchovať, ako dlho a na aký účel.**

---

## 5. Akčná slučka – tu sa z agenta stáva skutočný agent

Jednou z určujúcich vlastností agenta je opakujúci sa cyklus rozhodovania a konania.

Aktuálna dokumentácia OpenAI k agentom opisuje slučku, v ktorej sa zavolá model, skontroluje sa jeho výstup, na požiadanie sa spustia nástroje a proces pokračuje, kým agent nedosiahne skutočný bod zastavenia. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/running-agents))

Zjednodušene:

```text
Úloha
   ↓
Model
   ↓
Rozhodnutie
   ↓
Použitie nástroja
   ↓
Výsledok nástroja
   ↓
Model znova vyhodnotí situáciu
   ↓
Ďalší nástroj?
   ├── Áno → späť k nástroju
   └── Nie → konečný výsledok
```

Je to dôležité, pretože agent nemusí vopred vedieť, koľko krokov si úloha vyžiada.

Jednoduchej požiadavke môže stačiť jedno volanie modelu.

Zložitá obchodná úloha môže zahŕňať množstvo rôznych operácií.

---

## Chatbot vs. AI agent

Konkrétne porovnanie pomôže rozdiel lepšie vidieť.

| Chatbot | AI agent |
|---|---|
| Odpovedá na otázky | Dokončuje úlohy |
| Hlavne generuje odpovede | Môže pracovať s externými systémami |
| Často stačí jedna výmena | Dokáže prejsť viacerými krokmi |
| Zvyčajne má obmedzený stav | Dokáže udržiavať stav a pamäť |
| „Toto by ste mali urobiť“ | „Už som to urobil“ |
| Akciu vykoná človek | Akciu môže vykonať agent |

Hranica nie je vždy úplne jasná.

Aj chatbot môže používať RAG, function calling alebo API. **Samotné sprístupnenie nástroja chatbotu z neho automaticky nerobí plnohodnotného agenta.**

Užitočná otázka znie:

> „Generuje AI len odpoveď, alebo riadi vykonanie úlohy?“

Ak riadi vykonanie, smerujete k agentnému systému.

---

## Praktický príklad z firmy: AI agent na cenové ponuky

Zoberme si jednoduchý B2B predajný proces.

Firma dostáva každý deň niekoľko e-mailov:

> „Radi by sme objednali 50 kusov tohto produktu. Aká by bola cena a kedy by ste ich vedeli dodať?“

Klasický chatbot by dokázal pripraviť návrh odpovede.

Agent môže potenciálne zájsť oveľa ďalej.

### 1. Príde e-mail

Agent prečíta správu a identifikuje:

- požadovaný produkt,
- množstvo,
- zákazníka,
- a to, že ide o žiadosť o cenovú ponuku.

### 2. Nájde zákazníka

Pomocou nástroja pre CRM agent získa relevantné informácie o zákazníkovi.

Môže skontrolovať:

- predchádzajúce objednávky,
- kategóriu zákazníka,
- dohodnuté ceny,
- platobné podmienky.

### 3. Skontroluje sklad

Agent potom zavolá skladový systém.

```text
Produkt: X
Požadované množstvo: 50
Dostupné na sklade: 72
→ objednávku možno splniť
```

### 4. Vypočíta cenovú ponuku

Agent použije cenové pravidlá zákazníka, uplatní prípadnú množstevnú zľavu a pripočíta príslušné náklady na dopravu.

### 5. Vytvorí cenovú ponuku

Systém vygeneruje dokument s cenovou ponukou.

Tu sa však objavuje dôležitá otázka návrhu.

**Smie ju agent odoslať automaticky?**

Nie nevyhnutne.

Firma si môže stanoviť jednoduché pravidlo:

```text
Do 1 000 € → automatické odoslanie
Nad 1 000 € → schválenie manažérom
```

### 6. Schválenie človekom

Ak ponuka prekročí hranicu, agent sa zastaví.

Manažér dostane napríklad takúto správu:

> „Pripravil som cenovú ponuku. Celková hodnota je 1 560 €. Schvaľujete jej odoslanie?“

Manažér ju schváli.

### 7. Agent dokončí úlohu

Agent odošle ponuku zákazníkovi a aktualizuje CRM.

Celý proces potom vyzerá takto:

```text
E-mail
  ↓
Interpretácia pomocou AI
  ↓
Vyhľadanie v CRM
  ↓
Kontrola skladu
  ↓
Výpočet ceny
  ↓
Vygenerovanie ponuky
  ↓
Pravidlo pre riziko
  ↓
Schválenie človekom
  ↓
Odoslanie e-mailu
  ↓
Aktualizácia CRM
```

To je automatizácia podnikového procesu pomocou agenta.

---

## Kde môžu byť agenti užitoční?

Agenti sú obzvlášť zaujímaví vtedy, keď si úloha vyžaduje **informácie z viacerých systémov a niekoľko rozhodnutí, kým sa dospeje ku konečnému výsledku.**

Príklady:

- zákaznícky servis,
- príprava cenových ponúk,
- príprava faktúr,
- kvalifikácia leadov,
- generovanie reportov,
- vyhľadávanie v interných dokumentoch,
- plánovanie stretnutí,
- úlohy pri vývoji softvéru.

Cieľom nemusí byť nahradiť celé oddelenie jedným AI systémom.

V mnohých prípadoch je oveľa lepším východiskom úzko vymedzený agent s prístupom k malému počtu dobre otestovaných nástrojov.

---

## Riziká AI agentov

Čím viac toho agent dokáže, tým väčšie môžu byť dôsledky chyby.

Zle napísaná odpoveď môže byť trápna.

Nesprávne vykonané volanie API môže spôsobiť finančnú alebo prevádzkovú škodu.

### Prompt injection

E-mail, dokument alebo webová stránka môžu obsahovať inštrukcie, ktorých cieľom je agenta zmanipulovať.

Obzvlášť dôležité je to vtedy, keď má agent oprávnenie zapisovať dáta, posielať správy alebo vykonávať citlivé operácie.

### Príliš veľa oprávnení

Agent by nemal mať prístup ku všetkému len preto, že by sa to raz mohlo hodiť.

Ak potrebuje objednávky len čítať, nemal by môcť mazať faktúry.

Ak dokáže pripravovať cenové ponuky, možno nepotrebuje možnosť realizovať platby.

**Oprávnenia agenta by sa mali riadiť rovnakým princípom ako pri akomkoľvek inom softvérovom systéme: systém má dostať len taký prístup, aký skutočne potrebuje.**

### Chyby sa môžu reťaziť

Agenti často vykonávajú niekoľko akcií za sebou.

Ak je prvé rozhodnutie nesprávne, ďalšie akcie môžu na tejto chybe stavať.

Preto je mimoriadne dôležité logovanie, testovanie, validácia, limity a ošetrenie chýb.

---

## Potrebuje agent stále človeka?

V mnohých reálnych aplikáciách áno.

Ľudský dohľad neznamená, že niekto musí schvaľovať každú jednotlivú akciu.

Lepším prístupom je často rozdeliť akcie podľa rizika:

```text
Nízke riziko
→ automatické vykonanie

Stredné riziko
→ dodatočná validácia

Vysoké riziko
→ schválenie človekom
```

Aktuálna dokumentácia OpenAI rozlišuje automatické ochranné mechanizmy (guardrails) a schvaľovanie s človekom v slučke (human-in-the-loop), najmä pri citlivých alebo nezvratných akciách. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals))

Dobrý agent teda nie je ten, ktorý trvá na tom, že všetko urobí sám.

**Dobrý agent vie aj to, kedy sa má zastaviť a opýtať sa človeka.**

---

## Od chatbota k agentovi

Pre väčšinu firiem by ďalším krokom nemalo byť okamžité budovanie úplne autonómneho AI systému.

Začnite jedným konkrétnym, opakujúcim sa procesom.

Napríklad:

```text
1. Otázka zákazníka
2. Zhromaždenie informácií
3. Príprava odpovede
4. Kontrola človekom
5. Odoslanie
```

Keď to funguje spoľahlivo, proces sa môže ďalej vyvíjať:

```text
1. Otázka zákazníka
2. Agent získa informácie
3. Agent urobí rozhodnutie
4. Agent pripraví odpoveď
5. Nízke riziko → automatické odoslanie
6. Vysoké riziko → žiadosť o schválenie človekom
```

**AI agent nie je len „múdrejší chatbot“. Je to softvérový pracovný postup poháňaný AI, ktorý dokáže zhromažďovať informácie, rozhodovať sa a vykonávať akcie na dosiahnutie cieľa.**

Skutočná obchodná hodnota nevzniká tým, že niečo nazvete „agentom“. Vzniká tým, že technológiu využijete na dokončenie dobre definovaného procesu s menším množstvom ručnej práce a so zachovaním správnych kontrol.

## Kde by AI agent mohol skutočne pomôcť vašej firme?

Ak má vaša firma proces, ktorý prechádza viacerými systémami, obsahuje opakované rozhodnutia a pravidelne zaberá ľudský čas, môže byť dobrým kandidátom na agenta.

Užitočnejšia otázka neznie „Potrebujeme AI?“, ale **„Ktorú konkrétnu úlohu by za nás AI mohla skutočne dokončiť pri zachovaní primeranej miery ľudskej kontroly?“**

**softwaredevelopment.hu — AI, automatizácia a softvérové riešenia na mieru pre firmy.**

---

## Zdroje

- OpenAI: [A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- OpenAI: [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)
- OpenAI: [Agent definitions](https://developers.openai.com/api/docs/guides/agents/define-agents)
- OpenAI: [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- OpenAI: [Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety)
- Google Cloud: [Core concepts of AI agents](https://cloud.google.com/resources/core-concepts-ai-agents)
- Google Cloud: [What are AI agents?](https://cloud.google.com/discover/what-are-ai-agents)
