---
title: "RAG zrozumiteľne: ako dať AI vaše vlastné znalosti?"
description: "RAG umožňuje AI odpovedať na základe vašich vlastných dokumentov a dát. Ako funguje chunking, embeddingy, vektorové vyhľadávanie a grounding."
tags: [ai, rag, embeddings, vectordatabase, llm]
date: 2026-10-22 08:00
image: /articles/rag-explained/share.jpg
---

## Čo ak AI nepozná vašu firmu?

Univerzálny LLM mohol byť natrénovaný na obrovskom množstve informácií, no to ešte neznamená, že automaticky pozná interné znalosti vašej firmy.

Automaticky nepozná:

- vaše interné smernice,
- to, ako fungujú vaše procesy,
- vašu najnovšiu produktovú dokumentáciu,
- vaše postupy v zákazníckom servise,
- vaše cenové pravidlá,
- ani to, čo je napísané v internej firemnej príručke.

Práve tu prichádza na rad **RAG, teda Retrieval-Augmented Generation**.

Základná myšlienka je jednoduchá: namiesto toho, aby sa systém spoliehal len na to, čo sa model naučil počas tréningu, vyhľadá relevantné informácie v externom zdroji znalostí a odovzdá ich LLM ešte predtým, než vygeneruje odpoveď. ([arxiv.org](https://arxiv.org/abs/2005.11401))

Google Cloud aj AWS opisujú RAG ako praktickú architektúru na prepojenie generatívnych AI systémov s podnikovými a inými externými zdrojmi dát. ([cloud.google.com](https://cloud.google.com/use-cases/retrieval-augmented-generation)) ([docs.aws.amazon.com](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/what-is-rag.html))

---

## RAG AI nepretrénuje

Toto je jeden z najdôležitejších rozdielov.

Ľahko si predstaviť, že keď nahráte 500 PDF súborov, AI sa ich všetky nejakým spôsobom „naučí“.

Pri RAG sa to však bežne nedeje.

**Váhy modelu netreba meniť zakaždým, keď sa zmenia vaše dokumenty. Dokumenty sú namiesto toho uložené v samostatnej prehľadávateľnej znalostnej báze a pri každej otázke sa z nej vyhľadajú relevantné časti.**

Zjednodušený postup vyzerá takto:

```text
vaše dokumenty
      ↓
spracovanie
      ↓
delenie na časti
      ↓
embeddingy
      ↓
vektorová databáza
      ↓
        ← otázka používateľa
      ↓
vyhľadanie relevantných častí
      ↓
LLM + otázka + nájdené informácie
      ↓
odpoveď
```

V podnikovom prostredí je to obzvlášť užitočné, pretože keď sa dokument zmení, stačí aktualizovať znalostnú bázu a nemusíte pretrénovať celý jazykový model.

---

## Krok 1: spracovanie dokumentov

Predstavte si firmu, ktorá má:

- 300 PDF súborov,
- interné smernice,
- produktovú dokumentáciu,
- vzory zmlúv,
- príručky pre zákaznícky servis,
- prezentácie,
- interné wiki stránky.

Prvým krokom je ich načítanie a spracovanie.

Nie vždy je to také jednoduché ako skopírovať text z PDF.

Dokument môže obsahovať:

- nadpisy,
- odseky,
- tabuľky,
- zoznamy,
- poznámky pod čiarou,
- obrázky,
- hlavičky,
- viacero stĺpcov.

Kvalita RAG sa teda začína ešte predtým, než informácie vôbec uvidí AI model.

Dokumentácia Google k RAG považuje spracovanie dát a delenie dokumentov na časti za samostatné fázy celého procesu. ([docs.cloud.google.com](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/rag-overview))

---

## Krok 2: chunking – prečo dokumenty deliť?

Povedzme, že máte 80-stranovú príručku pre zamestnancov.

Ak sa niekto opýta:

> „Koľko dní dovolenky si môžem vziať po skončení skúšobnej doby?“

nemá veľký zmysel posielať LLM zakaždým celý 80-stranový dokument.

Dokument sa preto rozdelí na menšie časti, ktoré sa nazývajú **chunky**.

Napríklad:

```text
80-stranové PDF
      ↓
chunk 1
chunk 2
chunk 3
...
chunk 250
```

Chunk nemusí znamenať jednu stranu.

Môže to byť odsek, niekoľko odsekov, kapitola alebo iný logicky súvisiaci celok informácií.

**Cieľom je vytvoriť prehľadávateľné jednotky, ktoré obsahujú dosť kontextu na to, aby boli po vyhľadaní užitočné.**

Aj AWS považuje chunking za základnú súčasť vektorového vyhľadávania v RAG systémoch. ([docs.aws.amazon.com](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/rag-custom-retrievers.html))

---

## Prečo na chunkingu záleží?

Ak sú chunky príliš veľké, vyhľadávanie môže vrátiť množstvo nepodstatných informácií.

Ak sú príliš malé, môže sa stratiť dôležitý kontext.

Napríklad:

```text
Príliš veľký:
„celá 80-stranová smernica“

Príliš malý:
„dovolenka“

Lepší:
„Počas prvého roka pracovného pomeru treba dovolenku
žiadať podľa nasledujúcich pravidiel...“
```

Cieľom teda nie je len rozsekať dokument na kúsky.

**Cieľom je vytvoriť chunky, ktoré sú zmysluplnými jednotkami informácií.**

Vďaka tomu je chunking dôležitým návrhovým rozhodnutím v produkčnom RAG systéme.

---

## Krok 3: čo je embedding?

Tu to začína byť obzvlášť zaujímavé.

Nestačí, aby počítač vedel, ktoré slová sa v chunku nachádzajú. Chceme, aby dokázal porovnávať aj význam rôznych textov.

Na to slúžia **embeddingy**.

Embedding je číselná reprezentácia textu, ktorá zachytáva aspekty jeho významu a vzťahov. Podobné texty sa vo výslednom vektorovom priestore zvyčajne nachádzajú bližšie pri sebe. ([docs.cloud.google.com](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/use-embedding-models))

Zjednodušene:

```text
„Ako si požiadam o dovolenku?“

          ↓ embedding

[0.12, -0.43, 0.77, ...]


„Aký je postup pri žiadosti o voľno?“

          ↓ embedding

[0.14, -0.40, 0.75, ...]
```

Tieto dve otázky nepoužívajú presne tie isté slová.

Ich význam je však podobný, takže aj ich embeddingy môžu byť blízko seba.

---

## Krok 4: vektorová databáza

Teraz máme veľa chunkov a každý z nich má svoj embedding.

Niekde ich potrebujeme uložiť.

Na to slúži **vektorová databáza**.

RAG systém zvyčajne neukladá len samotný vektor. Môže uchovávať aj pôvodný text a k nemu priradené metadáta.

Napríklad:

```text
Chunk:
„O dovolenku treba požiadať najmenej
päť pracovných dní vopred...“

Embedding:
[0.12, -0.43, 0.77, ...]

Metadata:
document = employee-handbook.pdf
section = annual-leave
version = 2026.03
access = employees
```

Vektorová databáza je navrhnutá tak, aby dokázala efektívne nájsť uložené informácie, ktoré sú k dopytu významovo relevantné.

Google Cloud aj AWS opisujú tento vzor: embeddingy sa indexujú a potom sa v nich vyhľadáva, aby sa našli relevantné informácie. ([docs.cloud.google.com](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/vector-db-choices)) ([docs.aws.amazon.com](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/rag-custom-retrievers.html))

---

## Krok 5: používateľ položí otázku

Povedzme, že sa zamestnanec opýta:

> „Koľko dovolenky si môžem vziať naraz?“

Aj otázka sa prevedie na embedding.

Systém potom vo vektorovej databáze hľadá chunky, ktoré sú otázke významovo blízke.

```text
Otázka používateľa
        ↓
embedding dopytu
        ↓
vektorové vyhľadávanie
        ↓
relevantné chunky
```

Systém môže nájsť napríklad:

```text
1. Žiadosti o dovolenku
2. Pravidlá dlhšej neprítomnosti
3. Podmienky čerpania dovolenky
```

Tieto časti sa stanú kontextom, ktorý môže LLM použiť pri odpovedi na otázku.

---

## Krok 6: retrieval + generation

Teraz sa dostávame k dvom častiam, ktoré má RAG v názve.

**Retrieval** znamená vyhľadanie relevantných informácií.

**Generation** znamená, že LLM tieto informácie premení na užitočnú odpoveď.

Celý tok vyzerá takto:

```text
Otázka
  ↓
Embedding
  ↓
Vektorové vyhľadávanie
  ↓
Relevantné časti dokumentov
  ↓
Prompt + časti dokumentov
  ↓
LLM
  ↓
Podložená odpoveď
```

„Podložená“ (grounded) odpoveď je taká, pri ktorej model dostal relevantné zdrojové materiály a očakáva sa, že odpoveď postaví na tomto kontexte.

Google Cloud opisuje grounding ako kľúčový prínos RAG: model dostane relevantné externé informácie ešte pred vygenerovaním odpovede. ([cloud.google.com](https://cloud.google.com/use-cases/retrieval-augmented-generation))

---

## Skutočný príklad z praxe

Predstavte si firmu s 200 zamestnancami.

Ľudia sa každý deň pýtajú napríklad:

- Ako dlho trvá skúšobná doba?
- Ako si požiadam o dovolenku?
- Kedy môžem pracovať z domu?
- Ktoré výdavky firma preplatí?
- Kto môže schváliť nákup?
- Aký je postup pri zakladaní nového zákazníka?

Odpovede sú roztrúsené v rôznych dokumentoch.

Namiesto toho, aby zamestnanci hľadali ručne:

```text
Zamestnanec
   ↓
„Ako u nás funguje práca z domu?“
   ↓
RAG
   ↓
interná smernica
   ↓
relevantné odseky
   ↓
LLM
   ↓
„Podľa aktuálnej smernice...“
```

Zamestnanec dostane odpoveď v podobe rozhovoru.

Je to viac než chatbot.

**V skutočnosti ide o rozhranie k firemnej znalostnej báze v prirodzenom jazyku.**

---

## Čo sa stane, keď sa dokument zmení?

Toto je jedna z najväčších praktických výhod RAG.

Povedzme, že sa zmení vaša smernica o práci z domu.

Aktualizujete dokument, spracujete novú verziu a zaindexujete ju.

```text
stará smernica
      ↓
nová smernica
      ↓
delenie na chunky
      ↓
nové embeddingy
      ↓
aktualizácia vektorovej databázy
      ↓
AI nájde nové informácie
```

Celý LLM netreba pretrénovať.

**Model môže zostať rovnaký, zatiaľ čo znalosti, ktoré má k dispozícii, sa menia.**

Preto je RAG obzvlášť užitočný pri informáciách, ktoré sa pravidelne menia.

---

## Google Search a grounding

Základná myšlienka RAG sa neobmedzuje len na interné firemné chatboty.

Podľa vlastnej dokumentácie Google využívajú generatívne AI funkcie vo vyhľadávaní Google vrátane AI Overviews a AI Mode retrieval-augmented generation, označovanú aj ako grounding: z vyhľadávacích systémov Google vyhľadajú relevantné a aktuálne webové stránky a použijú ich na zlepšenie generovaných odpovedí. ([developers.google.com](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide))

Google tiež vysvetlil, že AI Overviews sa negenerujú len zo znalostí získaných pri tréningu modelu. Sú prepojené so základnými systémami Google na hodnotenie webu, vyhľadávajú relevantné výsledky v indexe vyhľadávania a obsahujú odkazy, aby si používatelia mohli zdroje preskúmať. ([blog.google](https://blog.google/products-and-platforms/products/search/ai-overviews-update-may-2024/))

Zjednodušená myšlienka:

```text
AI model
   +
externé prehľadávateľné znalosti
   ↓
kontext
   ↓
vygenerovaná odpoveď
```

Rozdiel je v tom, že vo firemnom RAG systéme môžu byť externými znalosťami vaše interné dokumenty, kým vo vyhľadávacom produkte to môžu byť informácie vyhľadané na webe.

---

## Prečo jednoducho nedať všetko do promptu?

Logická otázka znie:

> „Ak moderné LLM zvládajú veľmi veľké kontextové okná, načo potrebujeme vektorovú databázu?“

Niekedy ju nepotrebujete.

Ak máte len pár krátkych dokumentov a pohodlne sa zmestia do kontextového okna modelu, môže byť jednoduchšie dať ich modelu priamo ako kontext.

Pri tisícoch dokumentov je to však oveľa menej praktické.

Nechcete modelu pri každej otázke posielať všetky dokumenty.

Vyhľadávanie rieši presne tento problém:

**modelu sa odovzdajú len tie časti znalostnej bázy, ktoré sú pravdepodobne relevantné pre aktuálnu otázku.**

Google Cloud to tiež uvádza ako prínos RAG v situáciách, keď sú dostupné zdrojové materiály príliš rozsiahle na to, aby sa celé zmestili do kontextového okna modelu. ([cloud.google.com](https://cloud.google.com/use-cases/retrieval-augmented-generation))

---

## Najväčší problém RAG: čo ak vyhľadávanie zlyhá?

RAG nie je mágia.

Model môže efektívne pracovať len s informáciami, ktoré dostane.

Ak vyhľadávanie vyberie nesprávny obsah:

```text
nesprávna interpretácia
       ↓
slabé vyhľadávanie
       ↓
nesprávny chunk
       ↓
LLM
       ↓
nesprávna alebo nepodstatná odpoveď
```

Preto **kvalitu RAG neurčuje len samotný LLM.**

Dôležité súčasti sú:

- kvalita dokumentov,
- parsovanie,
- chunking,
- embeddingový model,
- vyhľadávanie,
- zoraďovanie výsledkov,
- metadáta,
- oprávnenia,
- a LLM.

Dokumentácia Google k RAG výslovne upozorňuje, že relevantnosť vyhľadávania je kľúčová: ak sú nájdené informácie nepodstatné, výsledná odpoveď môže byť nesprávna, aj keď je generovanie technicky podložené. ([cloud.google.com](https://cloud.google.com/use-cases/retrieval-augmented-generation))

---

## Rovnako dôležité je riadenie prístupu

Pri internej znalostnej báze nie je jedinou otázkou relevantnosť.

Treba sa pýtať aj:

> „Smie tento používateľ tieto informácie vôbec vidieť?“

Predstavte si jeden systém, ktorý obsahuje:

- HR dokumenty,
- finančné informácie,
- technickú dokumentáciu,
- reporty pre vedenie.

Nechcete, aby zamestnanec získal dôverný dokument len preto, že je náhodou významovo relevantný k jeho otázke.

Produkčné RAG systémy preto potrebujú poriadnu správu identít a riadenie prístupu.

AWS výslovne zdôrazňuje jemne odstupňovaný prístup používateľov a správu identít ako dôležité aspekty podnikových RAG architektúr. ([docs.aws.amazon.com](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/what-is-rag.html))

---

## RAG neznamená, že AI má vždy pravdu

Grounding môže urobiť odpovede relevantnejšími a ľahšie overiteľnými, no neodstráni všetky možné chyby.

RAG systém môže zlyhať aj vtedy, keď:

- je zdrojový dokument zastaraný,
- potrebná informácia chýba,
- sa vyhľadá nesprávny chunk,
- je otázka nejednoznačná,
- LLM nesprávne pochopí nájdený materiál,
- si viaceré dokumenty navzájom odporujú.

**RAG neznamená, že AI vždy hovorí pravdu. Znamená, že AI má prístup k relevantným externým znalostiam, na ktorých môže postaviť svoju odpoveď.**

Pri produkčných systémoch sa preto oplatí vyhodnocovať kvalitu vyhľadávania aj kvalitu odpovedí.

---

## Kedy použiť RAG?

RAG je obzvlášť užitočný, keď AI potrebuje prístup k:

- internej dokumentácii,
- produktovým informáciám,
- firemným smerniciam,
- materiálom o zákazníkoch,
- znalostným bázam,
- často sa meniacim informáciám,
- súkromným alebo firemne špecifickým dátam.

Menej potrebný je, keď vám stačí bežné generovanie textu.

Na vytvorenie krátkeho marketingového príspevku napríklad vektorovú databázu pravdepodobne nepotrebujete.

Ak však máte 10 000 interných dokumentov a chcete, aby v nich zamestnanci vyhľadávali prirodzeným jazykom, situácia je úplne iná.

---

## RAG vyzerá jednoducho, produkčné systémy však nie

Základný proces je krátky:

```text
dokument
→ chunk
→ embedding
→ vektorová databáza
→ vyhľadávanie
→ LLM
→ odpoveď
```

Produkčný systém môže vyzerať skôr takto:

```text
Dokumenty
 ↓
Parser
 ↓
Chunking
 ↓
Embedding
 ↓
Vektorová DB
 ↓
Retriever
 ↓
Re-ranker
 ↓
Kontrola oprávnení
 ↓
LLM
 ↓
Grounding / citácie
 ↓
Odpoveď
```

Vytvoriť užitočný RAG systém teda neznamená len „položiť PDF vedľa ChatGPT“.

**Najťažšou časťou často nie je samotný LLM, ale zabezpečiť, aby sa k správnej otázke dostali k modelu správne informácie.**

---

## Dať AI vaše znalosti neznamená nevyhnutne vytvoriť novú AI

Toto môže byť najdôležitejšie obchodné ponaučenie z RAG.

Nemusíte nevyhnutne trénovať vlastný model.

Nemusíte nevyhnutne budovať obrovskú AI infraštruktúru.

V mnohých prípadoch stačí existujúci LLM v kombinácii s dobre navrhnutou vyhľadávacou vrstvou, aby AI získala prístup k vlastným znalostiam firmy.

```text
Vaše dokumenty
       +
dobré vyhľadávanie
       +
LLM
       ↓
AI postavená na vašich znalostiach
```

Skutočná hodnota často nespočíva vo vytvorení ďalšieho chatbota.

Spočíva v tom, že znalosti, ktoré vaša firma roky budovala, sa sprístupnia cez prirodzené rozhranie.

---

## Mohli by sa vaše firemné znalosti stať AI asistentom?

Ak máte veľké množstvo interných dokumentov, smerníc, produktových informácií alebo materiálov pre zákaznícky servis, RAG môže byť praktickým spôsobom, ako tieto znalosti sprístupniť na vyhľadávanie prirodzeným jazykom.

Dobré riešenie však nezačína výberom vektorovej databázy.

**Začína pochopením toho, aké znalosti AI potrebuje, na aké otázky má odpovedať a ktorí používatelia majú mať prístup ku ktorým informáciám.**

**softwaredevelopment.hu — AI riešenia, automatizácia a vývoj softvéru na mieru pre firmy.**

---

## Zdroje

- Lewis et al.: [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- Google Cloud: [What is Retrieval-Augmented Generation (RAG)?](https://cloud.google.com/use-cases/retrieval-augmented-generation)
- Google Cloud: [RAG Engine overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/rag-overview)
- Google Cloud: [Use embedding models with RAG Engine](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/use-embedding-models)
- Google for Developers: [Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- Google: [What happened with AI Overviews and next steps](https://blog.google/products-and-platforms/products/search/ai-overviews-update-may-2024/)
- AWS: [Understanding Retrieval Augmented Generation](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/what-is-rag.html)
- AWS: [Retrievers for RAG workflows](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/rag-custom-retrievers.html)
