---
title: "Vektorové databázy: prečo klasická SQL databáza pre AI nestačí?"
description: "Čo dokáže vektorová databáza, čo klasické SQL nie? Vektorové vyhľadávanie, filtrovanie, hybridné vyhľadávanie a pgvector zrozumiteľne."
tags: [ai, vectordatabase, vectors, postgresql, semantic-search]
date: 2026-10-24 08:00
image: /articles/vector-databases/share.jpg
---

## Prečo by AI potrebovala iný druh databázy?

Klasická databáza výborne odpovedá na otázky ako:

- Ktorý zákazník má túto e-mailovú adresu?
- Ktoré produkty stoja menej ako 500 €?
- Ktoré objednávky vznikli včera?
- Ktorí používatelia sú aktívni?

Na tento typ problémov je SQL mimoriadne dobré.

Čo sa však stane, ak sa opýtate:

> „Nájdi produkty podobné týmto topánkam, ale vhodnejšie na dlhé turistické výlety.“

Už nehľadáte presnú hodnotu poľa.

Hľadáte **sémantickú podobnosť**.

Vektorová databáza je navrhnutá práve na tento typ problému. Ukladá vektory a umožňuje vyhľadať tie, ktoré sú najbližšie k vektoru dopytu. Qdrant to napríklad opisuje ako vyhľadávanie podobnosti alebo vyhľadávanie najbližších susedov. ([qdrant.tech](https://qdrant.tech/documentation/search/search/))

---

## Klasické SQL je navrhnuté na iný druh otázok

Predstavte si bežnú databázovú tabuľku:

```text
products

id | name              | category | price
---|-------------------|----------|-------
1  | Trail Runner      | shoes    | 450
2  | Mountain Boot     | shoes    | 680
3  | Road Runner       | shoes    | 390
```

Môžete sa opýtať:

```sql
SELECT *
FROM products
WHERE category = 'shoes'
AND price < 500;
```

To je presné.

Databáza presne vie, čo tieto podmienky znamenajú:

- `category = shoes`
- `price < 500`

Čo ak sa však opýtate:

> „Ktorá topánka je najpodobnejšia tomuto popisu produktu?“

Na to neexistuje žiadna zjavná podmienka `WHERE`.

Nehľadáte jednu presnú hodnotu.

Chcete, aby systém **zoradil záznamy podľa sémantickej podobnosti**.

---

## AI premieňa text na vektory

Ako sme videli v predchádzajúcom článku, embedding model dokáže premeniť text na číselný vektor.

Napríklad:

```text
„Nepremokavá turistická obuv na dlhé horské túry“
          ↓
[0.12, -0.44, 0.81, 0.17, ...]
```

Tento vektor možno uložiť do databázy.

Ak má iný produkt podobný embedding, systém môže tieto dva produkty považovať za sémanticky blízke.

```text
Produkt A
      ●

          ●
       Produkt B

                  ●
              Produkt C
```

Vektorová databáza teda nie je len miesto na uloženie veľkého množstva čísel.

**Jej dôležitou vlastnosťou je schopnosť tieto vektory efektívne prehľadávať podľa podobnosti.**

---

## Čo je vektorové vyhľadávanie?

Vektorové vyhľadávanie začína vektorom dopytu a hľadá najbližšie uložené vektory.

Zjednodušene:

```text
Otázka používateľa
        ↓
embedding
        ↓
query vector
        ↓
vector search
        ↓
najbližšie vektory
        ↓
relevantné dokumenty
```

Ak v internej znalostnej báze hľadáte:

> „Ako môžem požiadať o prácu z domu?“

systém nemusí nevyhnutne hľadať presné slovné spojenie „práca z domu“.

Dokáže nájsť aj dokumenty, ktorých význam s otázkou sémanticky súvisí.

Je to jeden zo základných stavebných prvkov RAG.

---

## Prečo jednoducho nepoužiť SQL?

V skutočnosti **niekedy môžete**.

Tento rozdiel je dôležitý.

Otázka neznie:

> „SQL, alebo vektorová databáza?“

Ale:

> „Aký typ problému s vyhľadávaním riešime?“

PostgreSQL už obsahuje funkcie fulltextového vyhľadávania na nájdenie dokumentov v prirodzenom jazyku a ich zoradenie podľa relevancie. ([postgresql.org](https://www.postgresql.org/docs/current/textsearch-intro.html))

A ak už PostgreSQL používate, rozšírenie `pgvector` dokáže do tej istej databázy pridať vyhľadávanie podľa vektorovej podobnosti.

---

## pgvector: keď sa aj PostgreSQL stane vektorovou databázou

**pgvector** je open-source rozšírenie PostgreSQL na vyhľadávanie podľa vektorovej podobnosti.

Podporuje okrem iného:

- presné vyhľadávanie najbližších susedov,
- približné vyhľadávanie najbližších susedov,
- kosínusovú vzdialenosť,
- skalárny súčin (inner product),
- vzdialenosť L2,
- indexy HNSW,
- indexy IVFFlat,
- filtrovanie pomocou SQL. ([github.com](https://github.com/pgvector/pgvector))

To znamená, že môžete mať tabuľku v PostgreSQL, ktorá obsahuje:

```text
id
title
content
category
created_at
embedding
```

Bežné dáta aj embeddingy môžu byť v tej istej databáze.

To môže byť mimoriadne praktické.

---

## Prečo je to užitočné v existujúcej aplikácii na PostgreSQL?

Predpokladajme, že už máte aplikáciu Spring Boot + PostgreSQL.

Obsahuje:

```text
customers
products
orders
documents
users
permissions
```

Teraz chcete pridať vyhľadávanie v dokumentoch s podporou AI.

Nemusíte nevyhnutne zavádzať úplne novú databázu.

S `pgvector` môžete ukladať embeddingy vedľa existujúcich dát v PostgreSQL.

Architektúra môže vyzerať takto:

```text
Spring Boot
     ↓
PostgreSQL
     ├── relačné dáta
     ├── metadata
     ├── dokumenty
     └── embeddings
```

Jednou z hlavných výhod pgvector je práve to, že vektory môžu byť uložené spolu s ostatnými dátami v PostgreSQL, pričom zostávajú zachované schopnosti PostgreSQL, ako sú JOIN-y a ACID transakcie. ([github.com](https://github.com/pgvector/pgvector))

---

## Prečo teda existujú samostatné vektorové databázy?

Ak PostgreSQL + pgvector dokáže robiť vektorové vyhľadávanie, prečo by niekto používal samostatnú vektorovú databázu?

Pretože väčšie systémy alebo systémy postavené najmä na vyhľadávaní môžu mať iné požiadavky.

Samostatná vektorová databáza je navrhnutá špeciálne pre záťaž, ako je:

- veľké množstvo embeddingov,
- rýchle vyhľadávanie podobnosti,
- zložité filtrovanie podľa metadát,
- hybridné vyhľadávanie,
- viacero vektorových reprezentácií,
- špecializované indexovanie,
- vysoká priepustnosť vyhľadávania.

Qdrant je napríklad navrhnutý špeciálne ako vektorový vyhľadávací engine a podporuje husté aj riedke vektory, filtrovanie a viacero stratégií vyhľadávania. ([qdrant.tech](https://qdrant.tech/documentation/search/search/)) ([qdrant.tech](https://qdrant.tech/documentation/search/filtering/))

**Samostatná vektorová databáza neexistuje preto, že by bol PostgreSQL „zlý“. Existuje preto, že niektorým problémom s vyhľadávaním prospieva špecializovaná infraštruktúra.**

---

## Metadáta sú rovnako dôležité ako vektor

Systém na vyhľadávanie s AI sa nezaujíma len o sémantickú podobnosť.

Predstavte si, že sa opýtate:

> „Aké notebooky na vývoj softvéru do 1 000 € by ste odporučili?“

Sémantické vyhľadávanie môže nájsť niekoľko podobných notebookov.

Vy však zároveň chcete:

- cenu pod 1 000 €,
- dostupnosť na sklade,
- dostupnosť na vašom trhu,
- správnu kategóriu.

To je **filtrovanie podľa metadát**.

```text
semantic similarity
        +
category = laptop
        +
price < 1000 €
        +
in_stock = true
        ↓
relevantné výsledky
```

Dokumentácia Qdrant výslovne upozorňuje, že sémantické vektory nedokážu vyjadriť každé obchodné obmedzenie, preto sú na požiadavky ako cena, sklad či lokalita potrebné filtre metadát. ([qdrant.tech](https://qdrant.tech/documentation/search/filtering/))

pgvector dokáže kombinovať vektorovú podobnosť s bežnými SQL podmienkami `WHERE`. ([github.com](https://github.com/pgvector/pgvector))

---

## Táto kombinácia patrí k najsilnejším častiam

Užitočný systém na vyhľadávanie s AI sa často nepýta len:

> „Čo je podobné tomuto?“

Pýta sa:

> „Čo je podobné tomuto a zároveň spĺňa tieto obmedzenia?“

Napríklad:

```text
„Nájdi podobnú turistickú obuv“

        ↓

semantic search

        +

category = hiking

        +

price < 150 €

        +

stock > 0

        ↓

konečné výsledky
```

**Vyhľadávanie s AI nenahrádza bežnú databázovú logiku. Často sú užitočnejšie spolu.**

---

## Čo je hybridné vyhľadávanie?

Vyhľadávanie v reálnom svete často potrebuje viac než sémantickú podobnosť.

Vezmite si:

> „iPhone 17 Pro Max 256GB“

Tu je dôležitá presná textová zhoda.

A teraz:

> „telefón s dobrým fotoaparátom a dlhou výdržou batérie“

Tu je oveľa dôležitejší sémantický význam.

Práve tu prichádza na rad **hybridné vyhľadávanie**.

Kombinuje sémantické a lexikálne vyhľadávanie.

```text
                  Vyhľadávanie
                       ↓
             ┌─────────┴─────────┐
             ↓                   ↓
       semantic search      keyword search
             ↓                   ↓
           význam          presné výrazy
             └─────────┬─────────┘
                       ↓
                  zoradenie
                       ↓
                   výsledky
```

Qdrant opisuje hybridné vyhľadávanie ako kombináciu hustého a riedkeho vyhľadávania, vďaka ktorej sa na zoradení výsledkov podieľa sémantická podobnosť aj presná zhoda kľúčových slov. ([qdrant.tech](https://qdrant.tech/documentation/search/text-search/hybrid-search/))

Je to užitočné najmä vtedy, keď sú niektoré vyhľadávania koncepčné, kým iné obsahujú presné identifikátory.

---

## Prečo sú presné kľúčové slová stále dôležité?

Predstavte si, že v dokumentácii pre vývojárov hľadáte:

> „Spring Boot 3.3.5“

Sémantické vyhľadávanie môže nájsť veľa dokumentov o Spring Boote.

Vy však môžete potrebovať **presne verziu 3.3.5**.

To isté platí pre:

- kódy produktov,
- ISBN,
- chybové kódy,
- ID zákazníkov,
- názvy API,
- čísla verzií.

V takýchto situáciách môže byť klasické vyhľadávanie podľa kľúčových slov mimoriadne cenné.

Dobrý systém na vyhľadávanie s AI si teda nemusí vyberať jeden prístup na úkor druhého.

**Kombinuje sémantické a lexikálne vyhľadávanie.**

---

## Ako to vyzerá v RAG systéme?

Teraz môžeme prepojiť myšlienky z predchádzajúcich článkov.

```text
Dokumenty
     ↓
chunking
     ↓
embedding
     ↓
vector database
     ↓
        ← otázka používateľa
     ↓
query embedding
     ↓
semantic / hybrid search
     ↓
metadata filtering
     ↓
relevantné časti dokumentov
     ↓
LLM
     ↓
odpoveď
```

Preto vektorová databáza v typickom RAG systéme nie je samotná AI.

**Je to vyhľadávacia vrstva, vďaka ktorej sa dá v znalostnej báze vyhľadávať.**

LLM potom môže nájdené informácie použiť na vygenerovanie konečnej odpovede.

---

## Kedy stačí klasická SQL databáza?

Veľmi často.

Predpokladajme, že váš e-shop má odpovedať na:

> „Ukáž mi čierne košele od 300 € do 500 €.“

Embeddingy nevyhnutne nepotrebujete.

SQL je na túto úlohu ako stvorené:

```sql
SELECT *
FROM products
WHERE category = 'shirt'
  AND colour = 'black'
  AND price BETWEEN 300 AND 500;
```

To isté platí pre:

- správu používateľov,
- objednávky,
- fakturáciu,
- skladové zásoby,
- oprávnenia,
- transakcie,
- reportovanie.

**Ak vyhľadávate v štruktúrovaných dátach podľa presných podmienok, klasické SQL je často jednoduchšie a lepšie riešenie.**

Nepridávajte vektorovú databázu len preto, že vaša aplikácia obsahuje AI.

---

## Kedy použiť pgvector?

PostgreSQL + pgvector môže byť silným východiskovým bodom, keď:

- už používate PostgreSQL,
- budujete stredne veľký systém na vyhľadávanie s AI,
- embeddingy úzko súvisia s relačnými dátami,
- potrebujete SQL JOIN-y a filtrovanie,
- chcete udržať infraštruktúru relatívne jednoduchú.

Napríklad:

```text
PostgreSQL
├── customers
├── products
├── documents
├── permissions
└── embeddings
```

Pre existujúcu firemnú aplikáciu to môže byť veľmi pohodlná architektúra.

pgvector podporuje presné aj približné vyhľadávanie najbližších susedov, pričom na približné indexovanie sú k dispozícii HNSW a IVFFlat. ([github.com](https://github.com/pgvector/pgvector))

---

## Kedy použiť samostatnú vektorovú databázu?

Samostatné riešenie môže dávať väčší zmysel, keď sa vyhľadávacia vrstva stane významným systémom sama osebe.

Napríklad:

```text
milióny / miliardy embeddingov
          ↓
vysoký objem vyhľadávaní
          ↓
zložité filtrovanie
          ↓
hybrid search
          ↓
viacero stratégií retrievalu
          ↓
dedikovaná vektorová infraštruktúra
```

Príkladmi samostatných vektorových databáz sú Qdrant, Pinecone, Weaviate a Milvus.

Výber by sa nemal zakladať len na popularite.

Zvážte:

- koľko dát máte,
- požadovanú latenciu,
- požiadavky na filtrovanie,
- požiadavky na hybridné vyhľadávanie,
- izoláciu tenantov,
- prevádzkový model,
- a akú zložitosť infraštruktúry ste ochotní spravovať.

---

## Nepotrebujete samostatnú databázu na všetko

Častou chybou v AI projektoch je príliš skoré zavádzanie novej infraštruktúry.

Ľahko môžete skončiť s:

```text
PostgreSQL
     +
Redis
     +
Vector DB
     +
Search Engine
     +
LLM
     +
samostatná ingestion služba
```

pričom samotný projekt obsahuje len niekoľko desiatok tisíc dokumentov.

PostgreSQL + pgvector môže úplne stačiť.

**Zložitosť infraštruktúry je tiež náklad.**

Nejde len o účty za servery.

Pribudne aj:

- prevádzka,
- monitoring,
- zálohovanie,
- bezpečnosť,
- nasadzovanie,
- riešenie problémov,
- čas vývojárov.

Preto je často rozumné začať s najjednoduchšou architektúrou, ktorá problém skutočne rieši.

---

## Vektorová databáza zázračne nerozumie AI dátam

Je tu ešte jedna mylná predstava, ktorú stojí za to vyjasniť.

Vektorová databáza sama osebe vašim dokumentom nerozumie.

Reprezentáciu, ktorú vektorová databáza ukladá a prehľadáva, vytvára embedding model.

```text
Dokument
    ↓
embedding model
    ↓
vektor
    ↓
vector database
    ↓
similarity search
```

Ak embedding model vytvorí zlú reprezentáciu, vektorová databáza aj tak veľmi efektívne nájde najbližšiu zlú reprezentáciu.

**Dobré vektorové vyhľadávanie závisí okrem samotnej databázy aj od embedding modelu, stratégie indexovania, filtrovania a návrhu vyhľadávania.**

---

## Kľúčový rozdiel

Ak by sme mali rozdiel zhrnúť do jednej vety:

**SQL sa primárne pýta: „Ktoré záznamy spĺňajú tieto podmienky?“**

**Vektorové vyhľadávanie sa pýta: „Ktoré záznamy sú sémanticky podobné tomuto?“**

Moderné AI systémy často kombinujú oboje:

```text
SQL
→ presné dáta
→ obmedzenia
→ oprávnenia
→ JOIN-y

+

Vector search
→ sémantická podobnosť
→ relevancia
→ súvisiaci obsah

+

LLM
→ odpoveď v prirodzenom jazyku
```

To je oveľa bližšie k tomu, ako by mala byť navrhnutá seriózna AI aplikácia.

---

## Potrebuje váš projekt naozaj vektorovú databázu?

Ak pracujete len so štruktúrovanými firemnými dátami, pravdepodobne nie.

Ak budujete vyhľadávanie v prirodzenom jazyku, RAG, podobnosť dokumentov, odporúčania alebo sémantické vyhľadávanie, oplatí sa o nej uvažovať.

**A ak už používate PostgreSQL, pgvector je často rozumným prvým krokom pred zavedením samostatnej vektorovej databázy.**

Dobrá architektúra sa nestáva modernou tým, že obsahuje čo najviac AI komponentov.

**Dobrou sa stáva vtedy, keď si vyberie najjednoduchšiu technológiu, ktorá problém s vyhľadávaním skutočne rieši.**

**softwaredevelopment.hu — AI riešenia, inteligentné vyhľadávanie a vývoj softvéru na mieru pre firmy.**

---

## Zdroje

- pgvector: [Open-source vector similarity search for Postgres](https://github.com/pgvector/pgvector)
- PostgreSQL: [Introduction to Full Text Search](https://www.postgresql.org/docs/current/textsearch-intro.html)
- Qdrant: [Similarity Search](https://qdrant.tech/documentation/search/search/)
- Qdrant: [Filtering](https://qdrant.tech/documentation/search/filtering/)
- Qdrant: [Hybrid Search](https://qdrant.tech/documentation/search/text-search/hybrid-search/)
- Qdrant: [Hybrid and Multi-Stage Queries](https://qdrant.tech/documentation/search/hybrid-queries/)
