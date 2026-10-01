---
title: "Vector Database: miért nem elég egy hagyományos SQL-adatbázis az AI-hoz?"
description: "Mit tud egy vector database, amit egy hagyományos SQL-adatbázis nem? Vektoros keresés, szűrés, hybrid search és pgvector egyszerűen."
tags: [ai, vectordatabase, vectors, postgresql, semantic-search]
date: 2026-10-24 08:00
image: /articles/vector-databases/share-hu.jpg
---

## Miért kellene külön adatbázis az AI-nak?

Egy hagyományos adatbázis nagyon jól tudja megválaszolni az olyan kérdéseket, mint:

- melyik ügyfélnek ez az e-mail címe?
- melyik termék ára 100 000 forint alatt van?
- melyik rendelés készült tegnap?
- melyik felhasználó aktív?

Ezekhez kiválóan működik az SQL.

De mi történik, ha ezt kérdezed?

> „Keress olyan termékeket, amelyek hasonlóak ehhez a cipőhöz, de inkább hosszú túrákhoz valók.”

Itt már nem feltétlenül egy konkrét értéket keresel.

**Jelentésbeli hasonlóságot keresel.**

Egy vector database éppen erre a problémára specializálódik: adatokat vektorokként tárol és olyan keresést tesz lehetővé, amely a lekérdezéshez legközelebb eső vektorokat keresi meg. A Qdrant dokumentációja ezt similarity searchként, illetve nearest-neighbour keresésként írja le. ([qdrant.tech](https://qdrant.tech/documentation/search/search/))

---

## A hagyományos SQL más kérdésre készült

Egy klasszikus relációs adatbázisban például lehet egy ilyen táblád:

```text
products

id | name              | category | price
---|-------------------|----------|-------
1  | Trail Runner      | shoes    | 45000
2  | Mountain Boot     | shoes    | 68000
3  | Road Runner       | shoes    | 39000
```

És ezt kérdezed:

```sql
SELECT *
FROM products
WHERE category = 'shoes'
AND price < 50000;
```

Ez nagyon pontos.

A rendszer pontosan tudja, mit jelent:

- `category = shoes`
- `price < 50000`

Viszont ha ezt kérdezed:

> „Melyik cipő hasonlít legjobban erre a termékleírásra?”

akkor nincs egyértelmű `WHERE` feltétel.

Nem egy konkrét mező értékét keresed.

Azt szeretnéd, hogy a rendszer **jelentésbeli közelség alapján rangsorolja a találatokat**.

---

## Az AI számára a szöveg vektorrá válik

Az előző cikkben már láttuk, hogy az embedding modell egy szöveget numerikus vektorrá alakíthat.

Például:

```text
„Vízálló túracipő hosszú hegyi utakhoz”
          ↓
[0.12, -0.44, 0.81, 0.17, ...]
```

Ezt a vektort el lehet tárolni egy adatbázisban.

Ha egy másik termék embeddingje hasonló irányba mutat, akkor a rendszer szerint a két termék jelentésben közel lehet egymáshoz.

```text
Termék A
      ●

          ●
       Termék B

                  ●
              Termék C
```

A vector database feladata tehát nem egyszerűen az, hogy „számokat tároljon”.

**A fontos rész az, hogy ezekkel a vektorokkal hatékony hasonlósági keresést tudjon végezni.**

---

## Mi az a vector search?

A vector search során van egy query vectorod, és megkeresed hozzá a legközelebbi tárolt vektorokat.

Egyszerűsítve:

```text
Felhasználói kérdés
        ↓
embedding
        ↓
query vector
        ↓
vector search
        ↓
legközelebbi vektorok
        ↓
releváns dokumentumok
```

Ha például egy belső tudásbázisban keresel:

> „Hogyan igényelhetek home office-t?”

akkor a rendszer nem feltétlenül azt keresi, hogy melyik dokumentumban szerepel pontosan a „home office” kifejezés.

Megkeresheti azokat a dokumentumrészeket is, amelyek szemantikailag hasonlóak.

Ez a RAG egyik alapvető építőeleme.

---

## Miért nem csináljuk ezt egyszerűen SQL-lel?

Valójában **bizonyos esetekben megtehetjük**.

Ez nagyon fontos.

A kérdés nem az, hogy:

> „SQL vagy vector database?”

hanem inkább:

> „Milyen keresési problémát akarunk megoldani?”

A PostgreSQL például natívan is kínál full-text search funkciókat, amelyek természetes nyelvű dokumentumokban képesek releváns kifejezéseket keresni és relevancia szerint rendezni. ([postgresql.org](https://www.postgresql.org/docs/current/textsearch-intro.html))

Ha pedig PostgreSQL-t használsz, a `pgvector` kiterjesztéssel ugyanabban az adatbázisban vektoros keresést is végezhetsz.

---

## A pgvector: amikor a PostgreSQL vektoros adatbázissá is válik

A **pgvector** egy nyílt forráskódú PostgreSQL-kiterjesztés vektoros hasonlósági kereséshez.

A projekt támogat többek között:

- exact nearest-neighbour keresést,
- approximate nearest-neighbour keresést,
- cosine distance-et,
- inner productot,
- L2 distance-et,
- HNSW indexeket,
- IVFFlat indexeket,
- és SQL-alapú szűrést. ([github.com](https://github.com/pgvector/pgvector))

Ez azt jelenti, hogy például egy PostgreSQL táblában lehet:

```text
id
title
content
category
created_at
embedding
```

A klasszikus adatokat és az embeddinget ugyanabban az adatbázisban tárolhatod.

Ez nagyon praktikus lehet.

---

## Miért jó ez egy meglévő PostgreSQL-projektnél?

Tegyük fel, hogy már van egy Spring Boot + PostgreSQL alkalmazásod.

Van benne:

```text
customers
products
orders
documents
users
permissions
```

És szeretnél hozzá AI-alapú dokumentumkeresést.

Nem feltétlenül kell azonnal új infrastruktúrát felépítened.

A `pgvector` segítségével az embeddingeket ugyanabban a PostgreSQL-ben tárolhatod.

A rendszer akár ilyen lehet:

```text
Spring Boot
     ↓
PostgreSQL
     ├── normál SQL adatok
     ├── metadata
     ├── dokumentumok
     └── embeddings
```

A pgvector egyik fontos előnye éppen az, hogy a vektorokat a PostgreSQL többi adatával együtt lehet kezelni, és megmaradnak a PostgreSQL olyan képességei, mint a JOIN-ok és az ACID-tranzakciók. ([github.com](https://github.com/pgvector/pgvector))

---

## De akkor miért léteznek külön vector database-ek?

Ha PostgreSQL + pgvector is képes vektoros keresésre, miért használna bárki külön vector database-t?

Mert nagyobb vagy kifejezetten keresésközpontú rendszereknél más szempontok válhatnak fontossá.

Egy dedikált vector database általában eleve olyan problémákra van optimalizálva, mint:

- nagy mennyiségű embedding,
- gyors similarity search,
- komplex metadata filtering,
- hybrid search,
- többféle vector representation,
- speciális indexing,
- nagy keresési terhelés.

A Qdrant például kifejezetten vektoros keresőmotor, és a dokumentációja szerint dense és sparse vektorokat, filteringet és többféle keresési stratégiát is támogat. ([qdrant.tech](https://qdrant.tech/documentation/search/search/)) ([qdrant.tech](https://qdrant.tech/documentation/search/filtering/))

**A dedikált vector database nem azért létezik, mert a PostgreSQL „rossz”, hanem mert bizonyos keresési problémákra más infrastruktúra lehet célszerűbb.**

---

## A metadata legalább olyan fontos, mint maga a vector

Egy AI-keresőben nem csak az számít, hogy egy dokumentum mennyire hasonló.

Tegyük fel, hogy ezt keresed:

> „Milyen laptopokat ajánlasz fejlesztéshez 500 000 Ft alatt?”

A vector search megtalálhat több hasonló laptopot.

De azt is szeretnéd, hogy:

- az ár legyen 500 000 Ft alatt,
- legyen készleten,
- magyarországi legyen,
- a megfelelő kategóriába tartozzon.

Ez már **metadata filtering**.

```text
semantic similarity
        +
category = laptop
        +
price < 500000
        +
in_stock = true
        ↓
releváns találatok
```

A Qdrant dokumentációja külön kiemeli, hogy a vektoros keresés önmagában nem tud minden üzleti feltételt reprezentálni, ezért metadata alapján történő filteringre is szükség van. ([qdrant.tech](https://qdrant.tech/documentation/search/filtering/))

A pgvector ugyanezt SQL `WHERE` feltételekkel is lehetővé teszi. ([github.com](https://github.com/pgvector/pgvector))

---

## Ez az egyik legerősebb kombináció

Az igazán hasznos AI-kereső gyakran nem csak azt kérdezi:

> „Mi hasonlít ehhez?”

Hanem:

> „Mi hasonlít ehhez, és közben feleljen meg ezeknek a feltételeknek is?”

Például:

```text
„keress hasonló túracipőt”

        ↓

semantic search

        +

category = hiking

        +

price < 80000

        +

stock > 0

        ↓

végső találatok
```

**Az AI nem váltja ki a hagyományos adatbázis-logikát. A kettőt gyakran együtt érdemes használni.**

---

## Mi az a hybrid search?

A valós keresésben gyakran nem elég a semantic search.

Vegyük ezt:

> „iPhone 17 Pro Max 256GB”

Itt fontos a pontos szövegegyezés.

Egy másik eset:

> „telefon jó kamerával és hosszú üzemidővel”

Itt inkább a jelentés számít.

Ezért használható **hybrid search**, amely kombinálhatja a szemantikus és a klasszikus lexikális keresést.

```text
                    Keresés
                       ↓
             ┌─────────┴─────────┐
             ↓                   ↓
       semantic search      keyword search
             ↓                   ↓
        jelentés               pontos szavak
             └─────────┬─────────┘
                       ↓
                  rangsorolás
                       ↓
                    találatok
```

A Qdrant dokumentációja szerint a hybrid search dense és sparse keresési eredményeket kombinálhat, így egyszerre használható szemantikus hasonlóság és pontos kulcsszóegyezés. ([qdrant.tech](https://qdrant.tech/documentation/search/text-search/hybrid-search/))

Ez különösen hasznos lehet olyan kereséseknél, ahol néha egy fogalmat, máskor pedig egy konkrét azonosítót, cikkszámot vagy nevet keresünk.

---

## Miért fontosak a pontos kulcsszavak?

Képzeld el, hogy egy fejlesztői dokumentációban keresel:

> „Spring Boot 3.3.5”

A semantic search találhat hasonló Spring Boot dokumentumokat.

De neked lehet, hogy **pontosan a 3.3.5-ös verzió** kell.

Ugyanez igaz:

- cikkszámokra,
- ISBN-ekre,
- hibakódokra,
- ügyfélazonosítókra,
- API-nevekre,
- verziószámokra.

Ilyenkor a klasszikus keyword search nagyon értékes.

Ezért a jó AI-kereső gyakran nem választ a két világ között.

**A szemantikus és a lexikális keresést kombinálja.**

---

## Hogy néz ki egy RAG-rendszerben?

Most már összeállíthatjuk az eddigi cikkekből ismert folyamatot.

```text
Dokumentumok
     ↓
chunking
     ↓
embedding
     ↓
vector database
     ↓
        ← felhasználói kérdés
     ↓
query embedding
     ↓
semantic / hybrid search
     ↓
metadata filtering
     ↓
releváns dokumentumrészek
     ↓
LLM
     ↓
válasz
```

Ezért a vector database sok RAG-rendszerben nem maga az AI.

**A vector database a tudásbázis keresési rétege.**

Az LLM pedig felhasználhatja a megtalált információt a válasz létrehozásához.

---

## Mikor elég a hagyományos SQL?

Nagyon sok esetben.

Ha például egy webshopban ezt kérdezed:

> „Mutasd a 30 000 és 50 000 forint közötti fekete pólókat.”

ehhez nincs feltétlenül szükség embeddingre.

Egy SQL lekérdezés tökéletes:

```sql
SELECT *
FROM products
WHERE category = 'shirt'
  AND colour = 'black'
  AND price BETWEEN 30000 AND 50000;
```

Ugyanez igaz például:

- felhasználók kezelésére,
- rendelési adatokra,
- számlázásra,
- készletre,
- jogosultságokra,
- tranzakciókra,
- riportokra.

**Ha pontos strukturált adatot keresel, a hagyományos SQL gyakran jobb és egyszerűbb megoldás.**

Nem kell vector database csak azért, mert a rendszerben AI is van.

---

## Mikor érdemes pgvector-t választani?

A PostgreSQL + pgvector jó kiindulópont lehet, ha:

- már PostgreSQL-t használsz,
- közepes méretű AI-keresést építesz,
- az embeddingek szorosan kapcsolódnak a relációs adatokhoz,
- sok JOIN-ra és SQL-alapú filteringre van szükséged,
- egyszerűbb infrastruktúrát szeretnél.

Például:

```text
PostgreSQL
├── customers
├── products
├── documents
├── permissions
└── embeddings
```

Ez egy nagyon kényelmes architektúra lehet egy meglévő üzleti alkalmazásban.

A pgvector támogat exact és approximate nearest-neighbour keresést is; az approximate kereséshez többek között HNSW és IVFFlat indexek állnak rendelkezésre.

[https://github.com/pgvector/pgvector](https://github.com/pgvector/pgvector)

---

## Mikor érdemes dedikált vector database-t választani?

Akkor lehet indokolt, ha a keresési réteg önmagában nagy és összetett rendszer.

Például:

```text
több millió / milliárd embedding
          ↓
nagy keresési terhelés
          ↓
összetett filtering
          ↓
hybrid search
          ↓
többféle retrieval stratégia
          ↓
dedikált vector infrastructure
```

Ilyenkor olyan megoldások jöhetnek szóba, mint például Qdrant, Pinecone, Weaviate vagy Milvus.

A konkrét választást nem érdemes pusztán népszerűség alapján meghozni. Fontosabb kérdések:

* mekkora az adatmennyiség,
* milyen latency kell,
* milyen filtering szükséges,
* kell-e hybrid search,
* hogyan kezelhető a tenantok elkülönítése,
* milyen üzemeltetési modellt szeretnél,
* és mennyire fontos az egyszerűség.

---

## Nem kell mindent külön adatbázisba tenni

Egy gyakori hiba az, hogy egy AI-projektben túl korán új infrastruktúrát építenek.

Például:

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
külön ingestion service
```

Miközben a projekt valójában néhány tízezer dokumentumból áll.

Lehet, hogy erre a PostgreSQL + pgvector tökéletesen elegendő.

**Az infrastruktúra komplexitása is költség.**

Nem csak a szerver ára számít, hanem:

* üzemeltetés,
* monitoring,
* backup,
* security,
* deployment,
* hibakeresés,
* fejlesztői idő.

Ezért érdemes a legegyszerűbb olyan architektúrából indulni, amely ténylegesen megoldja a problémát.

---

## A vector database nem varázslatos AI-adatbázis

Fontos egy másik félreértést is eloszlatni.

A vector database nem „érti” a dokumentumokat.

Nem tudja magától, hogy egy mondat mit jelent.

Az embedding modell készíti el azt a reprezentációt, amelyet a vector database tárol és keres.

```text
Dokumentum
    ↓
embedding modell
    ↓
vektor
    ↓
vector database
    ↓
similarity search
```

Ha rossz embeddinget készítesz, a vector database nagyon gyorsan megkeresi a rossz vektorok közül a legközelebbit.

**A jó vector search tehát az embedding modelltől, az indexeléstől, a filteringtől és a keresési stratégiától is függ.**

---

## A legfontosabb különbség

Ha egyetlen mondatban kellene összefoglalni:

**Az SQL elsősorban azt kérdezi: „Melyik rekord felel meg ennek a feltételnek?”**

**A vector search inkább azt kérdezi: „Melyik rekord hasonlít ehhez a jelentéshez?”**

A modern AI-rendszerekben pedig gyakran a kettő együtt működik:

```text
SQL
→ pontos adatok
→ feltételek
→ jogosultságok
→ JOIN-ok

+

Vector search
→ szemantikus hasonlóság
→ relevancia
→ hasonló tartalom

+

LLM
→ természetes nyelvű válasz
```

Ez sokkal közelebb áll ahhoz, ahogyan egy komoly AI-alapú alkalmazást érdemes megtervezni.

---

## Kell a projektedhez vector database?

Ha csak strukturált adatokat kezelsz, valószínűleg nincs rá szükséged.

Ha viszont természetes nyelvű keresést, RAG-ot, dokumentumhasonlóságot, ajánlásokat vagy szemantikus keresést építesz, már érdemes megvizsgálni.

**És ha már PostgreSQL-t használsz, a pgvector lehet az első lépés, mielőtt külön vector database-re váltanál.**

A jó architektúra nem attól lesz modern, hogy minél több AI-komponenst tartalmaz.

**Attól lesz jó, hogy a keresési problémához a lehető legegyszerűbb, mégis megfelelő technológiát választod.**

**softwaredevelopment.hu — AI-megoldások, intelligens keresők és egyedi szoftverek vállalkozások számára.**

---

## Források

* pgvector: [Open-source vector similarity search for Postgres](https://github.com/pgvector/pgvector)
* PostgreSQL: [Introduction to Full Text Search](https://www.postgresql.org/docs/current/textsearch-intro.html)
* Qdrant: [Similarity Search](https://qdrant.tech/documentation/search/search/)
* Qdrant: [Filtering](https://qdrant.tech/documentation/search/filtering/)
* Qdrant: [Hybrid Search](https://qdrant.tech/documentation/search/text-search/hybrid-search/)
* Qdrant: [Hybrid and Multi-Stage Queries](https://qdrant.tech/documentation/search/hybrid-queries/)

