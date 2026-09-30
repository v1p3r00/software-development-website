---
title: "Embeddings: hogyan „érti” az AI, hogy két szöveg hasonló jelentésű?"
description: "Az embeddingek számmá alakítják a jelentést. Megmutatjuk, hogyan működik a szemantikus hasonlóság, a cosine similarity és a vektorkeresés."
tags: [ai, embeddings, vectors, semantic-search, machine-learning]
date: 2026-10-23 08:00
image: /articles/embeddings-explained/share-hu.jpg
---

## Mit jelent az, hogy két szöveg hasonló?

Nézzük ezt a két mondatot:

> „Hogyan tudom visszaállítani az elfelejtett jelszavamat?”

és:

> „Nem emlékszem a jelszavamra, mit kell tennem?”

Szó szerint nézve kevés közös szó van bennük.

Egy egyszerű kulcsszavas kereső mégis nehezen kapcsolná össze őket. Egy AI-alapú kereső viszont jó eséllyel ugyanahhoz a tudásbázishoz vezetné mindkettőt.

De honnan tudja az AI, hogy a két mondat jelentése hasonló?

A válasz egyik fontos része az **embedding**.

Az embedding egy szöveg, kép vagy más adat numerikus reprezentációja, amelyet egy modell vektorként állít elő. Ezek a vektorok lehetővé teszik, hogy matematikailag összehasonlítsuk az adatok jelentésbeli hasonlóságát. A Sentence Transformers dokumentációja például kifejezetten használ embeddingeket szemantikus hasonlóság, keresés, klaszterezés és duplikátumkeresés feladataira. ([sbert.net](https://www.sbert.net/docs/quickstart.html))

---

## Az embedding: amikor a szövegből számok lesznek

Az AI számára egy mondat végül nem úgy jelenik meg, mint nekünk.

A rendszer egy embedding modell segítségével egy hosszabb számsort készít belőle.

Egyszerűsített példa:

```text
„Hogyan tudom megváltoztatni a jelszavamat?”
        ↓
embedding
        ↓
[0.18, -0.42, 0.71, 0.09, ...]


„Hol tudom módosítani a jelszót?”
        ↓
embedding
        ↓
[0.20, -0.39, 0.69, 0.11, ...]
```text

A valós embeddingek ennél sokkal több dimenzióból állhatnak, és az egyes számok önmagukban általában nem értelmezhetők úgy, hogy „ez a szám a jelszót jelenti”.

**A jelentés az egész vektor mintázatában van.**

Az embedding modell tanítása során a rendszer olyan reprezentációt tanulhat, amelyben a szemantikailag hasonló szövegek hasonló helyre kerülnek a vektortérben.

---

## Mi az a vektor?

A „vektor” elsőre matematikai fogalomnak hangzik, pedig az alapötlet egyszerű.

Képzelj el egy koordinátarendszert.

Egy pontnak lehet például két koordinátája:

```text
A = (2, 3)
B = (5, 4)
C = (-2, 6)
```text

Ezeket a pontokat el tudjuk helyezni egy térképen.

Az embeddingeknél ugyanez történik, csak nem feltétlenül két vagy három dimenzióban dolgozunk.

Egy szöveg egy nagyon sokdimenziós térben kap egy pozíciót.

```text
                 hasonló jelentésű szövegek
                         ● ●
                      ●
                   ●
                ●
        ●

                    ●

          ● ●
                 más témájú szövegek
```text

A valós rendszerben ezt nem tudjuk egyszerűen lerajzolni, mert az embeddingnek sok dimenziója lehet.

**A lényeg az, hogy a szövegek közötti kapcsolatot matematikai távolságokkal és hasonlósági mérőszámokkal tudjuk vizsgálni.**

---

## Nem a szavakat, hanem a jelentést hasonlítjuk

Ez a szemantikus keresés egyik legfontosabb különbsége a hagyományos kereséshez képest.

Tegyük fel, hogy van egy webáruházad.

A felhasználó ezt írja:

> „Kényelmes cipő hosszú sétákhoz”

A termékoldalon viszont ez szerepel:

> „Ergonomikus kialakítású, egész napos használatra optimalizált lábbeli.”

A két szövegben szinte ugyanazok a szavak nem jelennek meg.

A jelentésük viszont kapcsolódik.

A szemantikus keresés képes lehet ezt a kapcsolatot felismerni.

A Sentence Transformers dokumentációja szerint a semantic search egyik előnye, hogy szinonimák, rövidítések és eltérő megfogalmazások esetén is képes releváns találatokat adni, nem csak pontos kulcsszóegyezések alapján. ([sbert.net](https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html))

---

## Hogyan mérjük a hasonlóságot?

Ha két szöveget két vektorrá alakítottunk, már össze tudjuk hasonlítani őket.

Az egyik gyakori módszer a **cosine similarity**, vagyis koszinusz-hasonlóság.

Ahelyett, hogy egyszerűen azt néznénk, milyen messze van egymástól két pont, azt vizsgáljuk, hogy a két vektor milyen irányba mutat.

Egyszerűsítve:

```text
A vektor
      ↗
     /
    /

        ↗
       /
      /
     B vektor

kis szög → hasonló irány
nagy szög → kevésbé hasonló irány
```text

A cosine similarity matematikailag a két vektor közötti szög koszinuszán alapul:

$$
\text{cosine similarity} =
\frac{A \cdot B}{\|A\|\|B\|}
$$

A Sentence Transformers alapértelmezett similarity funkciói között a cosine similarity is szerepel, és a könyvtár közvetlenül támogatja embeddingek közötti cosine similarity számítását. ([sbert.net](https://sbert.net/docs/package_reference/util/similarity.html))

---

## Miért pont a szög számít?

Képzeld el, hogy két ember ugyanabba az irányba indul el.

Az egyik 100 métert, a másik 10 kilométert tesz meg.

A távolságuk jelentősen eltérhet, de az irányuk ugyanaz.

A cosine similarity hasonló gondolatot használ: **elsősorban azt nézi, mennyire hasonló irányba mutatnak a vektorok.**

Ez hasznos lehet szövegek összehasonlításakor, mert nem feltétlenül az a fontos, hogy két embedding minden numerikus értéke közel legyen egymáshoz.

A szemantikai irány lehet a fontosabb.

---

## A similarity score nem „jelentésérték”

Fontos félreértés lenne azt gondolni, hogy:

> „0,9 = a szöveg 90%-ban ugyanazt jelenti.”

Nem ilyen egyszerű.

A similarity score jelentése függ többek között:

- az embedding modelltől,
- a feladattól,
- a használt similarity mérőszámtól,
- az adatoktól.

A Sentence Transformers példáiban például két hasonló mondat magasabb cosine similarity értéket kap, mint két egymástól távoli jelentésű mondat. Ez azonban nem általános „jelentés százalék”, hanem az adott embeddingek közötti hasonlósági mérés. ([sbert.net](https://sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html))

Ezért production rendszerben érdemes saját adatokon meghatározni, milyen similarity threshold működik jól.

---

## 1. példa: intelligens kereső

Az egyik legkézenfekvőbb felhasználási terület a keresés.

Tegyük fel, hogy van egy belső vállalati tudásbázisod.

A dokumentumokban ez szerepel:

> „A szabadság iránti kérelmet legalább öt munkanappal korábban kell benyújtani.”

A munkatárs viszont ezt kérdezi:

> „Mikor kell szólnom, ha ki akarok venni pár napot?”

Kulcsszavas keresésnél a két szöveg között nem feltétlenül van tökéletes egyezés.

Embedding alapú keresésnél:

```text
Dokumentumok
   ↓
embeddingek
   ↓
vector database


Felhasználói kérdés
   ↓
query embedding
   ↓
hasonlóság keresése
   ↓
legközelebbi dokumentumok
```text

A rendszer így a jelentés alapján találhat releváns információt.

Ez a RAG-rendszerek egyik alapvető építőköve is.

---

## 2. példa: termékajánlás

Az embedding nem csak keresésre használható.

Egy webshopban például minden termékhez készíthetsz embeddinget.

```text
Termék A
„Vízálló túracipő, hosszú utakhoz”
        ↓
embedding


Termék B
„Könnyű futócipő aszfaltos használatra”
        ↓
embedding


Termék C
„Vízálló bakancs hegyi túrákhoz”
        ↓
embedding
```text

Ha a felhasználó olyan terméket néz, amelynek embeddingje közel van egy másik termékéhez, az egyik jel lehet arra, hogy a két termék tartalmilag hasonló.

Ezután kombinálhatod más adatokkal:

- ár,
- kategória,
- készlet,
- vásárlási előzmények,
- értékelések,
- felhasználói preferenciák.

**Az embedding tehát nem maga a teljes ajánlórendszer, hanem egy fontos információ lehet benne.**

---

## 3. példa: duplikátumok felismerése

Egy másik praktikus feladat a duplikált vagy majdnem duplikált tartalmak keresése.

Például egy ügyfélszolgálati rendszerben előfordulhat:

```text
„Nem tudok belépni a fiókomba.”

„Nem sikerül bejelentkeznem.”

„Nem enged be a rendszer.”
```text

Szövegesen különböznek.

A jelentésük azonban nagyon hasonló.

Embeddingekkel megkereshetjük az egymáshoz közeli szövegeket.

Ez használható:

- ismétlődő ügyfélszolgálati kérdések felismerésére,
- duplikált tudásbázis-cikkek keresésére,
- hasonló termékleírások azonosítására,
- ismétlődő hibajegyek csoportosítására.

A Sentence Transformers dokumentációja a paraphrase mininget és a szemantikus hasonlóságot is az embeddingek tipikus alkalmazásai között említi. ([sbert.net](https://www.sbert.net/docs/quickstart.html))

---

## Mi történik egy nagy adatbázissal?

Tegyük fel, hogy van 1 millió dokumentumod.

Nem szeretnéd minden kérdésnél egyesével összehasonlítani a kérdés embeddingjét minden dokumentum embeddingjével.

Ezért használnak a rendszerek különböző vektorindexeket és keresési technikákat.

Egyszerűsítve:

```text
1 000 000 dokumentum
        ↓
embeddingek
        ↓
vektorindex
        ↓
felhasználói kérdés
        ↓
query embedding
        ↓
hasonlósági keresés
        ↓
Top 10 találat
```text

A Sentence Transformers például közvetlenül támogat szemantikus keresést embeddingek között, és a dokumentációja szerint cosine similarity használható alapértelmezett score-ként. ([sbert.net](https://www.sbert.net/docs/package_reference/util/retrieval.html))

Nagyobb rendszereknél ezt külön erre optimalizált vector database vagy vector search infrastruktúra is megvalósíthatja.

---

## Az embedding modell számít

Nem létezik egyetlen univerzális embedding, amely minden feladatra tökéletes.

Más lehet az ideális modell:

- általános kereséshez,
- jogi dokumentumokhoz,
- termékkereséshez,
- többnyelvű szövegekhez,
- kódhoz,
- képekhez.

Az is fontos, hogy a query és a dokumentum hogyan kerül embeddingelésre.

A Sentence Transformers például külön `encode_query` és `encode_document` használatát is támogatja olyan modelleknél, amelyek eltérő promptokat vagy utasításokat használnak a két feladathoz. ([sbert.net](https://sbert.net/docs/sentence_transformer/usage/usage.html))

**A jó embedding tehát nem pusztán egy számokból álló lista. Egy konkrét keresési vagy összehasonlítási feladatra optimalizált reprezentáció.**

---

## Az embedding nem ugyanaz, mint az LLM

Fontos különválasztani a fogalmakat.

Egy LLM elsősorban szöveg generálására használható.

Egy embedding modell pedig egy adatpontot olyan vektorba alakít, amelyet összehasonlításra, keresésre vagy csoportosításra használhatunk.

A folyamat például:

```text
Szöveg
   ↓
Embedding modell
   ↓
vektor
   ↓
keresés / hasonlóság / klaszterezés
```text

Ezután egy LLM akár felhasználhatja a megtalált információt.

Így működik például egy tipikus RAG-rendszerben:

```text
kérdés
 ↓
embedding
 ↓
keresés
 ↓
releváns dokumentumok
 ↓
LLM
 ↓
válasz
```text

**Az embedding tehát sokszor az AI-rendszer keresési rétege, nem maga a válaszadó.**

---

## Vannak korlátai is

A szemantikus hasonlóság nem jelenti azt, hogy a rendszer valóban megértette a szöveget emberi értelemben.

Az embedding modell hibázhat.

Előfordulhat például, hogy:

- két hasonlóan megfogalmazott szöveg mást jelent,
- egy fontos negáció elveszik a hasonlósági képben,
- egy szakkifejezés rosszul reprezentálódik,
- két azonos témájú, de ellentétes állítás túl közel kerül egymáshoz.

Például:

> „A termék támogatja az offline használatot.”

és:

> „A termék nem támogatja az offline használatot.”

Nagyon hasonló mondatok.

A jelentésük viszont éppen ellentétes.

**Ezért a semantic similarity nem jelent logikai azonosságot.**

Egy production rendszerben az embeddinges keresést gyakran további rankinggel, szabályokkal vagy más modellekkel kombinálják.

A Sentence Transformers dokumentációja is bemutatja a kétlépcsős retrieval megközelítést, ahol az embedding alapú keresés után egy Cross-Encoder újrarangsorolhatja a találatokat. ([sbert.net](https://www.sbert.net/docs/quickstart.html))

---

## Miért fontos ez a gyakorlatban?

Az embeddingek mögött egy nagyon egyszerű, mégis rendkívül hasznos ötlet áll:

**alakítsuk át az adatokat olyan matematikai reprezentációvá, amelyben a jelentésbeli kapcsolatok kereshetővé válnak.**

Ebből rengeteg rendszer építhető:

```text
Embedding
   ↓
├── szemantikus keresés
├── RAG
├── ajánlórendszer
├── duplikátumkeresés
├── dokumentumcsoportosítás
├── hasonló ügyek keresése
└── tartalomfelderítés
```text

Ezért találkozol az embedding fogalmával szinte minden komolyabb AI-alapú keresési rendszerben.

---

## Mit jelent ez egy vállalkozás számára?

Ha van több ezer terméked, dokumentumod, ügyfélszolgálati kérdésed vagy belső tudásbázisod, a hagyományos kulcsszavas keresés egy ponton kevés lehet.

Az embeddingek lehetővé teszik, hogy a rendszer ne csak azt keresse, **milyen szavakat írt be a felhasználó**, hanem azt is, hogy **melyik információ hasonló jelentésű a kérdéshez**.

Ez az egyik alapja annak, hogy az AI-alapú keresők természetesebbnek érződnek.

---

## Lehet, hogy az AI „nem is érti” – mégis működik?

Az embeddingek jó példát adnak arra, hogy az AI működését nem mindig érdemes emberi fogalmakkal leírni.

Nem feltétlenül kell azt mondanunk, hogy a modell „érti” a mondatot úgy, ahogy egy ember.

Elég, hogy megtanul egy olyan matematikai reprezentációt létrehozni, amelyben a hasonló jelentésű dolgok gyakran közel kerülnek egymáshoz.

**A végén pedig ebből az egyszerű ötletből lesz szemantikus kereső, ajánlórendszer, RAG vagy akár egy vállalati AI-asszisztens.**

**softwaredevelopment.hu — AI-megoldások, intelligens keresők és egyedi szoftverek vállalkozások számára.**

---

## Források

- Sentence Transformers: [Quickstart](https://www.sbert.net/docs/quickstart.html)
- Sentence Transformers: [Semantic Textual Similarity](https://sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html)
- Sentence Transformers: [Semantic Search](https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html)
- Sentence Transformers: [Similarity Functions](https://sbert.net/docs/package_reference/util/similarity.html)
- Sentence Transformers: [Semantic Search Retrieval](https://www.sbert.net/docs/package_reference/util/retrieval.html)
- Sentence Transformers: [Usage and Query / Document Embeddings](https://sbert.net/docs/sentence_transformer/usage/usage.html)
