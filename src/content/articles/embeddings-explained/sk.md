---
title: "Embeddingy: ako AI „vie“, že dva texty znamenajú niečo podobné?"
description: "Embeddingy menia význam na vektory. Zistite, ako sémantická a kosínusová podobnosť poháňajú vyhľadávanie, odporúčania a hľadanie duplikátov."
tags: [ai, embeddings, vectors, semantic-search, machine-learning]
date: 2026-10-23 08:00
image: /articles/embeddings-explained/share.jpg
---

## Čo znamená, že sú dva texty podobné?

Pozrime sa na tieto dve vety:

> „Ako môžem obnoviť zabudnuté heslo?“

a:

> „Neviem si spomenúť na heslo. Čo mám robiť?“

Majú spoločných len veľmi málo slov.

Jednoduché vyhľadávanie podľa kľúčových slov by ich mohlo len ťažko spojiť. Vyhľadávací systém poháňaný umelou inteligenciou však dokáže rozpoznať, že sa v podstate pýtajú na to isté.

Ako to však robí?

Dôležitou súčasťou odpovede sú **embeddingy**.

Embedding je číselná reprezentácia dát – napríklad textu, obrázkov alebo iných vstupov –, ktorú vytvára model. Výsledný vektor umožňuje systému matematicky porovnávať jednotlivé dáta na základe ich naučenej reprezentácie. Knižnica Sentence Transformers napríklad používa embeddingy na sémantickú podobnosť, sémantické vyhľadávanie, zhlukovanie a hľadanie parafráz. ([sbert.net](https://www.sbert.net/docs/quickstart.html))

---

## Embedding mení text na čísla

Počítač nepracuje s vetou celkom tak ako my.

Embeddingový model ju premení na číselný vektor.

Zjednodušený príklad:

```text
„Ako si môžem zmeniť heslo?“
        ↓
embedding
        ↓
[0.18, -0.42, 0.71, 0.09, ...]


„Kde si môžem upraviť heslo?“
        ↓
embedding
        ↓
[0.20, -0.39, 0.69, 0.11, ...]
```

Skutočné embeddingy môžu mať veľa rozmerov a jednotlivé čísla zvyčajne nemajú jednoduchý, človeku zrozumiteľný význam typu „toto číslo predstavuje heslá“.

**Význam je zachytený vo vzore celého vektora.**

Počas trénovania sa embeddingový model môže naučiť také reprezentácie, v ktorých sa významovo príbuzné texty zvyčajne ocitnú v podobných oblastiach vektorového priestoru.

---

## Čo je vektor?

„Vektor“ znie ako veľmi matematický pojem, no základná myšlienka je jednoduchá.

Predstavte si súradnicový systém.

Bod môže mať dve súradnice:

```text
A = (2, 3)
B = (5, 4)
C = (-2, 6)
```

Tieto body môžete zakresliť do mapy.

Embeddingy vychádzajú z rovnakej základnej myšlienky, len reprezentácia nemusí byť dvoj- ani trojrozmerná.

Text dostane polohu v priestore s oveľa väčším počtom rozmerov.

```text
                 významovo podobné texty
                         ● ●
                      ●
                   ●
                ●
        ●

                    ●

          ● ●
                 iné témy
```

V skutočnom systéme tento priestor jednoducho nakresliť nemôžeme, pretože embeddingy môžu mať veľa rozmerov.

**Dôležité je, že vzťahy medzi textami sa dajú matematicky vyjadriť pomocou vzdialeností, smerov a mier podobnosti.**

---

## Porovnávame význam, nielen slová

Práve v tom je jeden z najväčších rozdielov medzi sémantickým vyhľadávaním a klasickým vyhľadávaním podľa kľúčových slov.

Predstavte si, že prevádzkujete e-shop.

Zákazník hľadá:

> „Pohodlné topánky na dlhé prechádzky“

Na stránke produktu však stojí:

> „Ergonomicky navrhnutá obuv optimalizovaná na celodenné nosenie.“

Slová sú dosť odlišné.

Význam je príbuzný.

Systém sémantického vyhľadávania dokáže tento vzťah potenciálne rozpoznať.

Podľa dokumentácie Sentence Transformers si sémantické vyhľadávanie poradí so synonymami, skratkami aj preklepmi a nespolieha sa len na zhodu slov. ([sbert.net](https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html))

---

## Ako meriame podobnosť?

Keď sú dva texty premenené na vektory, potrebujeme spôsob, ako ich porovnať.

Jedným z bežných prístupov je **kosínusová podobnosť** (cosine similarity).

Kosínusová podobnosť nemeria len to, ako ďaleko sú od seba dva body, ale sleduje uhol medzi dvoma vektormi.

Zjednodušene:

```text
Vektor A
      ↗
     /
    /

        ↗
       /
      /
     Vektor B

malý uhol → podobný smer
veľký uhol → menej podobný smer
```

Matematická definícia je:

$$
\text{cosine similarity} =
\frac{A \cdot B}{\|A\|\|B\|}
$$

Sentence Transformers uvádza kosínusovú podobnosť medzi podporovanými funkciami podobnosti a ponúka priamo funkcie na jej výpočet medzi embeddingmi. ([sbert.net](https://sbert.net/docs/package_reference/util/similarity.html))

---

## Prečo záleží na smere?

Predstavte si dvoch ľudí, ktorí kráčajú rovnakým smerom.

Jeden prejde 100 metrov.

Druhý 10 kilometrov.

Prejdené vzdialenosti sú veľmi rozdielne, smer je však rovnaký.

Kosínusová podobnosť stojí na podobnej myšlienke: **sústreďuje sa na to, nakoľko dva vektory smerujú rovnakým smerom.**

Pri porovnávaní textov to môže byť užitočné, pretože vzťah medzi reprezentáciami môže byť dôležitejší než ich absolútna číselná veľkosť.

---

## Skóre podobnosti nie je „percento významu“

Bolo by chybou predpokladať:

> „0,9 znamená, že tieto texty sú z 90 % rovnaké vo význame.“

Takto to nefunguje.

Čo skóre podobnosti znamená, závisí napríklad od:

- embeddingového modelu,
- úlohy,
- funkcie podobnosti,
- porovnávaných dát.

Dokumentácia Sentence Transformers napríklad ukazuje, že významovo príbuzné vety môžu dostať oveľa vyššie skóre kosínusovej podobnosti než nesúvisiace vety. Skóre však nie je univerzálne percento významovej zhody. ([sbert.net](https://sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html))

Pri produkčnom systéme sa preto oplatí vyhodnotiť vlastné dáta a určiť, aké prahy podobnosti vo vašom prípade naozaj fungujú.

---

## Príklad 1: inteligentné vyhľadávanie

Jedným z najzrejmejších využití je vyhľadávanie.

Predstavte si internú firemnú znalostnú bázu.

V jednom dokumente stojí:

> „Žiadosť o dovolenku treba podať najmenej päť pracovných dní vopred.“

Zamestnanec sa pýta:

> „Ako dlho dopredu musím dať vedieť, ak chcem pár dní voľna?“

Tieto dva texty nemusia mať veľa presne rovnakých slov.

S embeddingmi môže proces vyzerať takto:

```text
Dokumenty
   ↓
embeddingy
   ↓
vector database


Otázka používateľa
   ↓
query embedding
   ↓
vyhľadávanie podobnosti
   ↓
najrelevantnejšie dokumenty
```

Systém tak dokáže nájsť informácie podľa významovej relevancie, a nie podľa presnej zhody kľúčových slov.

Je to zároveň jeden zo základných stavebných kameňov systémov RAG.

---

## Príklad 2: odporúčanie produktov

Embeddingy môžu byť užitočné aj pri odporúčaniach.

Predstavte si e-shop, v ktorom má každý produkt svoj embedding.

```text
Produkt A
„Nepremokavá turistická obuv na dlhé túry“
        ↓
embedding


Produkt B
„Ľahká bežecká obuv na asfalt“
        ↓
embedding


Produkt C
„Nepremokavé horské topánky na turistiku“
        ↓
embedding
```

Ak je embedding jedného produktu blízko embeddingu iného, môže to byť jeden zo signálov, že produkty spolu významovo súvisia.

Tento signál potom môžete skombinovať s ďalšími informáciami:

- cena,
- kategória,
- skladová zásoba,
- história nákupov,
- hodnotenia,
- preferencie zákazníka.

**Embedding teda nie je celý odporúčací systém. Je to jeden užitočný signál v ňom.**

---

## Príklad 3: hľadanie duplikátov

Ďalším praktickým využitím je hľadanie duplicitného alebo takmer duplicitného obsahu.

Systém zákazníckej podpory môže obsahovať napríklad:

```text
„Neviem sa prihlásiť do svojho účtu.“

„Nedarí sa mi prihlásiť.“

„Systém ma nechce pustiť dnu.“
```

Formulácie sú rozdielne.

Význam je veľmi podobný.

Embeddingy pomáhajú nájsť texty, ktoré sú v sémantickom priestore blízko seba.

To sa hodí na:

- hľadanie opakujúcich sa otázok na podporu,
- odhalenie duplicitných článkov v znalostnej báze,
- zoskupovanie podobných popisov produktov,
- zhlukovanie opakujúcich sa tiketov podpory.

Sentence Transformers uvádza hľadanie parafráz a sémantickú podobnosť medzi bežnými využitiami embeddingov. ([sbert.net](https://www.sbert.net/docs/quickstart.html))

---

## Čo sa deje pri veľkej databáze?

Predpokladajme, že máte milión dokumentov.

Pri každom vyhľadávaní nechcete porovnávať embedding dopytu s každým dokumentom jeden po druhom.

Preto systémy používajú vektorové indexy a špecializované techniky vyhľadávania.

Zjednodušený postup vyzerá takto:

```text
1 000 000 dokumentov
        ↓
embeddingy
        ↓
vektorový index
        ↓
otázka používateľa
        ↓
query embedding
        ↓
vyhľadávanie podobnosti
        ↓
Top 10 výsledkov
```

Sentence Transformers ponúka funkcie na sémantické vyhľadávanie, ktoré predvolene používajú kosínusovú podobnosť a dokážu z korpusu vybrať výsledky s najvyšším skóre. ([sbert.net](https://www.sbert.net/docs/package_reference/util/retrieval.html))

Vo väčšom rozsahu možno na zefektívnenie tohto procesu použiť špecializované vektorové databázy a infraštruktúru na vektorové vyhľadávanie.

---

## Na embeddingovom modeli záleží

Neexistuje jeden embeddingový model, ktorý by bol dokonalý na každú situáciu.

Najlepšia voľba sa môže líšiť pre:

- všeobecné vyhľadávanie,
- právne dokumenty,
- vyhľadávanie produktov,
- viacjazyčné texty,
- zdrojový kód,
- obrázky.

Záleží aj na tom, ako sa kódujú dopyty a dokumenty.

Sentence Transformers napríklad podporuje samostatné metódy `encode_query` a `encode_document` pre modely, ktoré pre dopyty a dokumenty používajú odlišné prompty alebo inštrukcie. ([sbert.net](https://sbert.net/docs/sentence_transformer/usage/usage.html))

**Dobrý embedding je teda viac než len zoznam čísel. Je to reprezentácia navrhnutá tak, aby dobre fungovala pri konkrétnej úlohe porovnávania alebo vyhľadávania.**

---

## Embeddingový model nie je to isté ako LLM

Tieto pojmy sa oplatí rozlišovať.

LLM je navrhnutý predovšetkým na generovanie alebo pretváranie obsahu.

Embeddingový model premení vstup na vektor, ktorý sa potom dá použiť na porovnávanie, vyhľadávanie alebo zhlukovanie.

Napríklad:

```text
Text
   ↓
Embeddingový model
   ↓
vektor
   ↓
vyhľadávanie / podobnosť / zhlukovanie
```

Nájdené informácie potom môže využiť LLM.

Presne to sa deje v typickej architektúre RAG:

```text
otázka
 ↓
embedding
 ↓
vyhľadávanie
 ↓
relevantné dokumenty
 ↓
LLM
 ↓
odpoveď
```

**Embedding je často súčasťou vyhľadávacej vrstvy systému AI, a nie komponentom, ktorý píše výslednú odpoveď.**

---

## Má to aj obmedzenia

Sémantická podobnosť neznamená, že systém pochopil vetu presne tak ako človek.

Embeddingový model sa môže mýliť.

Napríklad:

- dva podobne formulované texty môžu mať rozdielny význam,
- zápor môže byť dôležitý,
- odborná terminológia môže byť zachytená slabo,
- dve tvrdenia na rovnakú tému si môžu v skutočnosti protirečiť.

Pozrite sa na:

> „Produkt podporuje používanie offline.“

a:

> „Produkt nepodporuje používanie offline.“

Formulácia viet je mimoriadne podobná.

Ich význam je opačný.

**Sémantická podobnosť preto nie je to isté ako logická ekvivalencia.**

V produkčných systémoch sa vyhľadávanie založené na embeddingoch často kombinuje s ďalším radením, pravidlami alebo inými modelmi.

Sentence Transformers opisuje dvojstupňový prístup k vyhľadávaniu, pri ktorom retriever založený na embeddingoch nájde kandidátov a Cross-Encoder potom môže najlepšie výsledky znovu zoradiť. ([sbert.net](https://www.sbert.net/docs/quickstart.html))

---

## Prečo je to dôležité v praxi?

Myšlienka embeddingov je prekvapivo jednoduchá a mimoriadne užitočná:

**premeniť dáta na matematickú reprezentáciu, v ktorej sa dajú vyhľadávať zmysluplné vzťahy.**

Z tejto základnej myšlienky sa dá postaviť množstvo rôznych systémov:

```text
Embedding
   ↓
├── sémantické vyhľadávanie
├── RAG
├── odporúčacie systémy
├── hľadanie duplikátov
├── zhlukovanie dokumentov
├── vyhľadávanie podobných prípadov
└── objavovanie obsahu
```

Preto sa slovo „embedding“ v moderných vyhľadávacích systémoch s AI objavuje tak často.

---

## Čo to znamená pre firmu?

Ak máte tisíce produktov, dokumentov, tiketov podpory alebo záznamov v internej znalostnej báze, klasické vyhľadávanie podľa kľúčových slov môže časom začať obmedzovať.

Embeddingy umožňujú systému pozerať sa nielen na to, **aké slová používateľ napísal**, ale aj na to, **ktoré informácie majú podobný význam ako dopyt**.

To je jeden z hlavných dôvodov, prečo vyhľadávanie s AI pôsobí prirodzenejšie než klasické vyhľadávanie podľa kľúčových slov.

---

## Naozaj AI text „rozumie“?

Embeddingy sú dobrým príkladom toho, prečo systémy AI nemusíme vždy opisovať ľudskými pojmami.

Model nemusí vetu „chápať“ presne tak ako človek.

Namiesto toho sa môže naučiť matematickú reprezentáciu, v ktorej sa významovo príbuzné veci zvyčajne ocitnú blízko seba.

**Z tejto pomerne jednoduchej myšlienky môžeme postaviť sémantické vyhľadávanie, odporúčacie systémy, RAG pipeline aj asistentov s AI, ktorí pracujú s veľkým množstvom informácií.**

**softwaredevelopment.hu — riešenia s AI, inteligentné vyhľadávanie a vývoj softvéru na mieru pre firmy.**

---

## Zdroje

- Sentence Transformers: [Quickstart](https://www.sbert.net/docs/quickstart.html)
- Sentence Transformers: [Semantic Textual Similarity](https://sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html)
- Sentence Transformers: [Semantic Search](https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html)
- Sentence Transformers: [Similarity Functions](https://sbert.net/docs/package_reference/util/similarity.html)
- Sentence Transformers: [Semantic Search Retrieval](https://www.sbert.net/docs/package_reference/util/retrieval.html)
- Sentence Transformers: [Usage and Query / Document Embeddings](https://sbert.net/docs/sentence_transformer/usage/usage.html)
