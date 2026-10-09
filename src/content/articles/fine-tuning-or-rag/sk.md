---
title: "Fine-tuning: kedy potrebujete trénovať vlastný model a kedy stačí RAG?"
description: "Fine-tuning, prompting alebo RAG? Kedy ktorý prístup dáva zmysel, aké dáta potrebujete a kde vznikajú skutočné náklady na prispôsobenie AI systému."
tags: [fine-tuning, rag, prompting, ai, llm]
date: 2026-11-03 08:00
image: /articles/fine-tuning-or-rag/share.jpg
---

## Naozaj potrebujete trénovať vlastný model?

Keď firma začne plánovať AI riešenie, skôr či neskôr padne otázka:

> „Nebolo by lepšie natrénovať model na našich vlastných dátach?“

Znie to logicky.

Máte interné dokumenty, informácie o produktoch, komunikáciu so zákazníkmi alebo firemné know-how. Prečo to všetko jednoducho nevložiť do modelu?

Pretože **využívanie vlastných dát a trénovanie modelu sú dva rozdielne problémy**.

Ak chcete, aby AI systém pracoval s aktuálnymi dokumentmi vašej firmy, často nepotrebujete fine-tuning, ale **RAG (Retrieval-Augmented Generation)**.

Ak chcete, aby sa model správal určitým spôsobom, konzistentne vykonával špecializovanú úlohu alebo dodržiaval konkrétny formát výstupu, fine-tuning môže dávať zmysel.

A je tu aj tretia možnosť:

**Dobrý prompt môže stačiť.**

---

## Tri rôzne problémy, tri rôzne nástroje

Najjednoduchšie je uvažovať takto:

```text
Prompting
→ Ako modelu povieme, čo má robiť?

RAG
→ Aké externé informácie mu k tejto požiadavke poskytneme?

Fine-tuning
→ Ako prispôsobíme správanie modelu konkrétnej úlohe?
```

Nejde o technológie, ktoré by sa navzájom vylučovali.

Jeden systém môže využívať všetky tri.

AI pre zákaznícku podporu môže napríklad použiť:

- prompting na pravidlá správania,
- RAG na najnovšiu produktovú dokumentáciu,
- fine-tuning na štýl odpovedí, ktorý firma preferuje.

**Otázka neznie „RAG, alebo fine-tuning?“ Znie: „čo presne sa snažíte zmeniť?“**

---

## Začnite promptingom

Zvyčajne je to najjednoduchší začiatok.

Predstavte si, že chcete, aby AI systém:

- písal krátke odpovede zákazníkom,
- používal priateľský tón,
- odpovedal v troch bodoch,
- na záver sa spýtal, či môže ešte s niečím pomôcť.

Na to nemusíte trénovať model.

Systémový prompt môže vyzerať takto:

```text
Si asistent zákazníckej podpory.

Vždy:
- používaj priateľský tón,
- odpovedaj najviac 5 vetami,
- používaj jednoduchý jazyk,
- povedz, keď nemáš dosť informácií,
- nikdy si nevymýšľaj informácie o produktoch.
```

Oficiálne odporúčania Anthropic k promptingu uvádzajú jasné inštrukcie, relevantný kontext a príklady ako základné techniky na zlepšenie správania modelu. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

**Ak problém vyrieši prompting, zvyčajne nie je dôvod skočiť rovno k fine-tuningu.**

---

## Kedy potrebujete RAG?

RAG je užitočný, keď AI potrebuje informácie, ktoré nechcete natrvalo zabudovať do parametrov modelu.

Napríklad:

- interné smernice,
- produktové katalógy,
- príručky,
- obchodné podmienky,
- znalostné bázy,
- aktuálne cenníky,
- interné wiki,
- dokumentáciu podpory.

Proces vyzerá takto:

```text
Používateľ položí otázku
↓
Vyhľadávanie vo vašich dátach
↓
Získanie relevantných častí dokumentov
↓
Prompt + získané informácie
↓
LLM
↓
Odpoveď
```

Model sa tie informácie nemusí „naučiť“.

**Získa ich vo chvíli, keď ich potrebuje.**

Odporúčania Microsoftu k RAG opisujú práve tento vzor: vyhľadávací systém nájde relevantné podkladové dáta a poskytne ich jazykovému modelu, ktorý potom na základe tohto kontextu vygeneruje odpoveď. [Microsoft – RAG prompt engineering](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-prompt-engineering)

Pôvodný výskum RAG bol čiastočne motivovaný obmedzeniami ukladania všetkých užitočných faktických znalostí do parametrov modelu a priniesol spôsob, ako skombinovať parametrickú pamäť modelu s externou neparametrickou pamäťou. [arXiv – Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)

---

## Prečo je RAG užitočný pre firemné dáta?

Predstavte si, že máte 500 strán internej dokumentácie.

Pravdepodobne nechcete model pretrénovať zakaždým, keď sa zmení nejaká smernica.

S RAG:

```text
Starý dokument
↓
Nový dokument
↓
Aktualizácia indexu
↓
AI môže použiť nové informácie
```

To je dôležité najmä vtedy, keď sa informácie pravidelne menia.

Bežne by ste napríklad nechceli robiť fine-tuning modelu len preto, že sa zmenili ceny 30 produktov.

**Meniace sa znalosti sú typicky problémom vyhľadávania, nie fine-tuningu.**

Dokumentácia Microsoftu podobne opisuje RAG ako spôsob, ako pracovať s novými alebo meniacimi sa informáciami bez toho, aby bolo potrebné upravovať samotný model ďalším trénovaním. [Microsoft – Retrieval Augmented Generation using Azure Machine Learning](https://learn.microsoft.com/en-us/azure/machine-learning/concept-retrieval-augmented-generation)

---

## Na čo je teda fine-tuning vlastne dobrý?

Fine-tuning znamená vziať už predtrénovaný model a ďalej ho trénovať na cielených príkladoch.

Nestaviate LLM od nuly.

Prispôsobujete existujúci model konkrétnej úlohe.

Hugging Face definuje fine-tuning ako pokračovanie trénovania predtrénovaného modelu na menšej dátovej sade špecifickej pre danú úlohu alebo doménu. [Hugging Face – Fine-tuning](https://huggingface.co/docs/transformers/main/en/training)

Napríklad:

> „Chcem, aby AI zaradila každý prichádzajúci tiket podpory do jednej z ôsmich kategórií.“

Alebo:

> „Chcem, aby model konzistentne generoval presne tento štruktúrovaný formát.“

Alebo:

> „Máme tisíce kvalitných príkladov, ktoré presne ukazujú, ako sa má táto špecializovaná úloha vykonávať.“

Práve tu začína byť fine-tuning zaujímavý.

---

## Fine-tuning nie je to isté ako nahratie znalostnej bázy

Toto je jedno z najčastejších nedorozumení.

Predstavte si, že máte:

**10 000 produktov.**

Váš cieľ je:

> „AI by mala vždy poznať aktuálne informácie o produktoch.“

To automaticky neznamená, že by ste mali model trénovať na všetkých 10 000 produktoch.

Prirodzenejšia architektúra často vyzerá takto:

```text
Produktová databáza
↓
Embedding / vyhľadávanie
↓
Relevantné produkty
↓
LLM
↓
Odpoveď
```

Ak je však váš cieľ:

> „Model by mal každý popis produktu previesť presne do tohto štruktúrovaného formátu JSON.“

potom je fine-tuning oveľa relevantnejší.

**RAG rieši prístup k znalostiam, fine-tuning sa zameriava predovšetkým na správanie modelu a výkon v konkrétnej úlohe.**

---

## Koľko dát potrebujete?

Univerzálne číslo neexistuje.

A to je podstatné.

Nie je pravda, že „na fine-tuning potrebujete presne 1 000 príkladov“.

Potrebné množstvo závisí od:

- úlohy,
- modelu,
- kvality dát,
- hraničných prípadov,
- požadovanej presnosti,
- metodiky vyhodnocovania.

Aktuálne odporúčania Microsoftu opisujú scenáre, v ktorých môžu byť užitočné stovky až niekoľko tisíc kvalitných príkladov špecifických pre danú úlohu. [Microsoft – Fine-tuning considerations](https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/fine-tuning-considerations)

Samotný objem však nie je hlavný.

**1 000 slabých príkladov môže byť horších než niekoľko stoviek výborných.**

---

## Skutočné náklady na fine-tuning nie sú len čas na GPU

Ľudia sa často sústreďujú na účet za trénovanie.

Celkové náklady sú však širšie:

```text
Zber dát
+
Čistenie dát
+
Anotácia
+
Príprava dátovej sady
+
Fine-tuning
+
Testovanie
+
Vyhodnotenie
+
Opätovné trénovanie
+
Prevádzka
```

Ak vlastný alebo doladený model prevádzkujete sami, ďalšie náklady môžu zahŕňať:

- výpočtový výkon GPU,
- úložisko,
- inferenciu,
- monitoring,
- aktualizácie modelu,
- MLOps,
- čas špecializovaných inžinierov.

Parametricky efektívne metódy fine-tuningu, ako napríklad LoRA, môžu časť tejto záťaže znížiť, pretože aktualizujú len malú časť modelu namiesto všetkých parametrov. Dokumentácia Hugging Face k PEFT opisuje tieto metódy ako spôsob, ako pri prispôsobovaní veľkých predtrénovaných modelov znížiť nároky na pamäť a výpočtový výkon. [Hugging Face – PEFT](https://huggingface.co/docs/peft/index)

---

## Ani RAG nie je zadarmo

RAG môže pôsobiť jednoduchšie, no aj on vyžaduje infraštruktúru.

Napríklad:

- úložisko dokumentov,
- spracovanie textu,
- embeddingy,
- vektorové vyhľadávanie,
- vyhľadávanie relevantného obsahu,
- opätovnú indexáciu,
- riadenie prístupu,
- monitoring.

A zle navrhnutý systém RAG môže vyhľadať nesprávne informácie.

Model potom môže vytvoriť dokonale plynulú odpoveď postavenú na zlom kontexte.

**Ak vyhľadáte nesprávne informácie, ani lepší model vám zázračne nezaručí správnu odpoveď.**

Odporúčania Microsoftu k RAG preto považujú kvalitu vyhľadávania, delenie textu na časti (chunking), správu kontextového okna a vyhodnocovanie za dôležité súčasti systému. [Microsoft – RAG prompt engineering](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-prompt-engineering)

---

## Jednoduchý sprievodca rozhodovaním

**Prompting** použite, keď:

- potrebujete definovať správanie,
- chcete konkrétny formát,
- nastavujete pravidlá alebo rolu,
- stačí niekoľko príkladov.

**RAG** použite, keď:

- AI potrebuje vaše dokumenty,
- sa informácie menia,
- potrebujete zdrojové podklady,
- máte rozsiahlu znalostnú bázu,
- chcete aktualizovať znalosti bez opätovného trénovania modelu.

**Fine-tuning** použite, keď:

- chcete konzistentnejšie správanie,
- potrebujete optimalizovať špecializovanú úlohu,
- máte veľa dobrých príkladov,
- prompty sú už príliš dlhé alebo preplnené príkladmi,
- dokážete zmerať konkrétne zlepšenie výkonu.

A v niektorých prípadoch:

**Použite ich spolu.**

---

## Jednoduchý rozhodovací strom

```text
Čo sa snažíte vyriešiť?
        ↓
Správanie / formát?
        ↓
     PROMPT
        │
        └── Nie
             ↓
      Externé / interné znalosti?
             ↓
            RAG
             │
             └── Nie
                  ↓
       Špecializovaná úloha alebo správanie?
                  ↓
             FINE-TUNING
```

Je tu jeden dôležitý doplnok.

Fine-tuning a RAG môžete používať spoločne:

```text
Doladený model
      +
    RAG
      +
   Prompt
      ↓
Firemný AI systém
```

---

## Čo by som zvolil pre bežnú firmu?

Ak mi malá alebo stredná firma povie:

> „Máme 500 PDF súborov, interné dokumenty a popisy produktov. Chceme AI asistenta.“

**Fine-tuning by nebol mojím prvým krokom.**

Začal by som:

1. dobrým promptom,
2. vhodným modelom,
3. RAG,
4. vyhodnotením,
5. fine-tuningom, len ak výsledky ukážu, že je naozaj potrebný.

Dôvod je jednoduchý.

S RAG môžete dokumenty aktualizovať bez toho, aby ste pri každej zmene znalostí spúšťali nové trénovanie.

Fine-tuning začína byť relevantný, keď presne viete, **aké správanie alebo úlohu nedokážete s promptingom a RAG dosiahnuť dostatočne dobre.**

Porovnanie fine-tuningu a vyhľadávania pri dopĺňaní znalostí z roku 2023 zistilo, že RAG prekonal testovaný prístup fine-tuningu vo viacerých scenároch náročných na znalosti, najmä pri nových alebo menej známych faktoch. To neznamená, že RAG je vždy lepší; výsledky závisia od úlohy a implementácie. [arXiv – Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs](https://arxiv.org/abs/2312.05934)

---

## Najdôležitejšia otázka

Nezačínajte slovami:

> „Máme veľa dát, tak natrénujme model.“

Začnite otázkou:

> **„Chceme, aby sa model tieto informácie naučil, alebo chceme len, aby k nim mal pri odpovedaní prístup?“**

Ak sa informácie často menia, vyhľadávanie je zvyčajne vhodnejšie.

Ak sa model potrebuje naučiť špecializovanú úlohu alebo správanie, fine-tuning môže dávať zmysel.

Ak sú problémom len nejasné inštrukcie, môže stačiť lepší prompt.

Moderné AI systémy dokážu tiež kombinovať všetky tri prístupy.

**Dobrý produkčný systém je často prompt + RAG + správny model, pričom fine-tuning sa pridá len vtedy, keď prináša merateľný prínos.**

---

## Cieľom nie je mať „vlastný model“

Je ľahké, aby sa cieľom stala samotná technológia.

„Vlastná AI.“

„Vlastný model.“

„Fine-tuning.“

Nič z toho nie je obchodným výsledkom.

Skutočná otázka znie:

> **Ktorý prístup vám prinesie požadovaný výsledok s najmenšou zbytočnou zložitosťou, nákladmi a rizikom?**

Niekedy je odpoveďou lepší prompt.

Niekedy RAG.

Niekedy fine-tuning.

Niekedy kombinácia.

**softwaredevelopment.hu — AI riešenia pre firmy: RAG, integrácia LLM, automatizácia a AI systémy na mieru.**

---

## Zdroje

- OpenAI: [Fine-tuning API Reference](https://platform.openai.com/docs/api-reference/fine-tuning)
- OpenAI: [Vector Stores API Reference](https://platform.openai.com/docs/api-reference/vector-stores)
- OpenAI: [OpenAI API pricing](https://platform.openai.com/pricing)
- Anthropic: [Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)
- Microsoft: [Fine-tuning considerations](https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/fine-tuning-considerations)
- Microsoft: [Customize a model with fine-tuning](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/fine-tuning)
- Microsoft: [RAG prompt engineering](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-prompt-engineering)
- Microsoft: [Retrieval Augmented Generation using Azure Machine Learning](https://learn.microsoft.com/en-us/azure/machine-learning/concept-retrieval-augmented-generation)
- Hugging Face: [Fine-tuning](https://huggingface.co/docs/transformers/main/en/training)
- Hugging Face: [PEFT](https://huggingface.co/docs/peft/index)
- arXiv: [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- arXiv: [Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs](https://arxiv.org/abs/2312.05934)
- arXiv: [Fine Tuning vs. Retrieval Augmented Generation for Less Popular Knowledge](https://arxiv.org/abs/2403.01432)
