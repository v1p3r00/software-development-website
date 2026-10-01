---
title: "RAG érthetően: hogyan adhatunk saját tudást egy AI-nak?"
description: "Hogyan tud egy AI a céged saját dokumentumaiból válaszolni? Megmutatjuk a RAG működését, az embeddinget, a vector database-t és a korlátokat."
tags: [ai, rag, embeddings, vectordatabase, llm]
date: 2026-10-22 08:00
image: /articles/rag-explained/share-hu.jpg
---

## Mi van, ha az AI nem ismeri a cégedet?

Egy általános LLM rengeteg szövegen tanult, de ettől még nem ismeri automatikusan a vállalkozásod belső tudását.

Nem tudja magától, hogy:

- milyen szabályzatot használtok,
- hogyan működik a belső folyamatotok,
- milyen feltételekkel dolgoztok,
- mi van a legutóbbi ügyfélszolgálati dokumentációban,
- vagy pontosan mit tartalmaz a saját terméketek kézikönyve.

Itt jön képbe a **RAG, vagyis Retrieval-Augmented Generation**.

A RAG lényege egyszerű: az AI nem csak a korábban megtanult tudására támaszkodik, hanem egy külső tudásbázisból először megkeresi a releváns információt, majd ezt adja át az LLM-nek a válasz elkészítéséhez. ([arxiv.org](https://arxiv.org/abs/2005.11401))

A Google Cloud és az AWS is ezt az architektúrát írja le tipikus módszerként arra, hogy egy LLM-et vállalati vagy más külső adatokkal egészítsünk ki. ([cloud.google.com](https://cloud.google.com/use-cases/retrieval-augmented-generation)) ([docs.aws.amazon.com](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/what-is-rag.html))

---

## A RAG nem újratanítja az AI-t

Ez az egyik legfontosabb különbség.

Sokan úgy képzelik el, hogy ha feltöltünk 500 PDF-et egy AI-rendszerbe, akkor az AI „megtanulja” ezeket.

A RAG esetében általában nem ez történik.

**A modell súlyait nem kell minden alkalommal módosítani. A dokumentumokat egy külön kereshető tudásbázisban tároljuk, és kérdésenként megkeressük a releváns részeket.**

A folyamat leegyszerűsítve:

```text
saját dokumentumok
      ↓
feldolgozás
      ↓
darabolás
      ↓
embedding
      ↓
vector database
      ↓
        ← felhasználói kérdés
      ↓
releváns részek keresése
      ↓
LLM + kérdés + talált információ
      ↓
válasz
```

Ezért is praktikus a RAG vállalati környezetben: ha változik egy dokumentum, nem feltétlenül kell újratanítani az egész modellt. A tudásbázist kell frissíteni.

---

## 1. lépés: a dokumentumok feldolgozása

Képzeld el, hogy egy vállalkozásnak van:

- 300 PDF-je,
- belső szabályzata,
- termékdokumentációja,
- szerződésmintái,
- ügyfélszolgálati útmutatói,
- prezentációi,
- belső wiki-oldalai.

Ezeket először be kell olvasni és feldolgozni.

Ez nem mindig olyan egyszerű, mint egy PDF szövegének kimásolása.

Egy dokumentumban lehet:

- cím,
- bekezdés,
- táblázat,
- lista,
- lábjegyzet,
- kép,
- fejléc,
- több oszlop.

A RAG minősége ezért már az adatfeldolgozásnál elkezdődik.

A Google saját RAG-dokumentációja is külön lépésként kezeli az adatok feldolgozását és a dokumentumok chunkokra bontását. ([docs.cloud.google.com](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/rag-overview))

---

## 2. lépés: chunking – miért kell feldarabolni a dokumentumot?

Tegyük fel, hogy van egy 80 oldalas munkavállalói szabályzat.

Ha valaki azt kérdezi:

> „Hány nap szabadság jár próbaidő után?”

nem lenne hatékony minden alkalommal elküldeni az egész 80 oldalas dokumentumot az LLM-nek.

Ezért a dokumentumot kisebb részekre, úgynevezett **chunkokra** bontjuk.

Például:

```text
80 oldalas PDF
      ↓
1. chunk
2. chunk
3. chunk
...
250. chunk
```

A chunk nem feltétlenül egyenlő egy oldallal.

Lehet például egy bekezdés, több bekezdés, egy fejezet vagy egy logikailag összetartozó rész.

**A chunking egyik legfontosabb célja, hogy a keresés során olyan méretű és tartalmú szövegrészeket találjunk, amelyek önmagukban is elegendő kontextust adnak a válaszhoz.**

Az AWS RAG-dokumentációja is a chunkinget a retrieval folyamat alapvető lépéseként kezeli. ([docs.aws.amazon.com](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/rag-custom-retrievers.html))

---

## Miért nem mindegy, hogyan darabolunk?

Túl nagy chunkok esetén a keresés sok felesleges szöveget adhat vissza.

Túl kicsi chunkok esetén pedig elveszhet a kontextus.

Például:

```text
Túl nagy:
„A teljes 80 oldalas szabályzat”

Túl kicsi:
„A szabadság”

Jobb:
„A munkaviszony első évében a szabadság
igénylésére vonatkozó szabályok...”
```

A cél tehát nem egyszerűen az, hogy „daraboljuk fel a PDF-et”.

**A cél olyan kereshető egységeket létrehozni, amelyek jelentésükben is értelmesek.**

Ezért a production RAG-rendszerekben a chunking stratégia önálló tervezési kérdés.

---

## 3. lépés: mi az az embedding?

Itt válik igazán érdekessé a rendszer.

A számítógépnek nem elég azt tudnia, hogy egy chunk milyen szavakat tartalmaz. Azt is szeretnénk, hogy a jelentés alapján tudjon hasonlóságot keresni.

Ehhez használunk **embeddinget**.

Az embedding egy szöveg numerikus reprezentációja, amely egy vektor formájában írja le a szöveg jelentését és kapcsolatait. A hasonló jelentésű szövegek embeddingjei általában közelebb kerülnek egymáshoz a vektortérben. ([docs.cloud.google.com](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/use-embedding-models))

Egyszerűen:

```text
„Hogyan kérhetek szabadságot?”

          ↓ embedding

[0.12, -0.43, 0.77, ...]


„Mi a szabadság igénylésének menete?”

          ↓ embedding

[0.14, -0.40, 0.75, ...]
```

A két kérdés szövege nem azonos.

A jelentésük viszont hasonló, ezért a vektoraik is közel kerülhetnek egymáshoz.

---

## 4. lépés: a vector database

Most már van sok chunkunk és minden chunkhoz tartozik egy embedding.

Ezeket el kell tárolni valahol.

Erre szolgálhat egy **vector database**, vagyis vektoradatbázis.

A rendszerben általában nem csak maga a vektor szerepel, hanem az eredeti szöveg és különböző metadata is.

Például:

```text
Chunk:
„A szabadságot legalább 5 munkanappal
korábban kell igényelni...”

Embedding:
[0.12, -0.43, 0.77, ...]

Metadata:
document = employee-handbook.pdf
section = szabadság
version = 2026.03
access = employees
```

A vector database feladata, hogy gyorsan megtalálja azokat a dokumentumrészeket, amelyek jelentésük alapján relevánsak a kérdéshez.

A Google Cloud és az AWS dokumentációja is ezt a modellt írja le: az embeddingek indexelése után a rendszer szemantikai kereséssel talál releváns információt. ([docs.cloud.google.com](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/vector-db-choices)) ([docs.aws.amazon.com](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/rag-custom-retrievers.html))

---

## 5. lépés: a felhasználó kérdez

Tegyük fel, hogy egy kolléga ezt írja:

> „Mennyi szabadságot vehetek ki egybefüggően?”

A kérdésből szintén embedding készül.

Ezután a rendszer megkeresi a vector database-ben a hozzá legközelebb álló dokumentumrészeket.

```text
Felhasználói kérdés
        ↓
query embedding
        ↓
vector search
        ↓
releváns chunkok
```

A rendszer például visszakaphat három releváns részletet:

```text
1. Szabadság igénylése
2. Hosszabb távollét szabályai
3. A szabadság kiadásának feltételei
```

Ezekből áll össze az a kontextus, amelyet az LLM megkap.

---

## 6. lépés: retrieval + generation

Most érkezünk el a RAG nevének második feléhez.

A retrieval azt jelenti, hogy **megkeressük a releváns információt**.

A generation pedig azt, hogy **az LLM ezek alapján megfogalmazza a választ**.

A teljes folyamat:

```text
Kérdés
  ↓
Embedding
  ↓
Vector search
  ↓
Releváns dokumentumrészek
  ↓
Prompt + dokumentumrészek
  ↓
LLM
  ↓
Grounded answer
```

A „grounded” vagyis megalapozott válasz azt jelenti, hogy a modell a rendelkezésére bocsátott forrásokra támaszkodva készíti el a választ.

A Google Cloud a RAG egyik fő előnyeként éppen ezt a groundingot emeli ki: a modell a válasz elkészítése előtt külső, releváns információt kap. ([cloud.google.com](https://cloud.google.com/use-cases/retrieval-augmented-generation))

---

## Egy valódi üzleti példa

Tegyük fel, hogy van egy 200 fős vállalatod.

A munkatársak naponta kérdeznek ilyeneket:

- Mennyi a próbaidő?
- Hogyan igényelhetek szabadságot?
- Mikor jár home office?
- Milyen költségeket térít a cég?
- Ki hagyhatja jóvá a beszerzést?
- Mit kell tenni egy új ügyfél létrehozásakor?

A válaszok több különböző dokumentumban vannak.

Ahelyett, hogy mindenki keresgélne:

```text
Employee
   ↓
„Hogyan működik a home office?”
   ↓
RAG
   ↓
belső szabályzat
   ↓
releváns bekezdések
   ↓
LLM
   ↓
„A jelenlegi szabályzat szerint...”
```

A kolléga pedig egy normál beszélgetéshez hasonló választ kap.

Ez már nem egyszerű chatbot.

**Ez egy belső tudásbázis természetes nyelvű keresőfelülettel.**

---

## És mi történik, ha frissül a dokumentum?

Ez a RAG egyik nagy előnye.

Tegyük fel, hogy megváltozik a home office szabályzat.

A dokumentumot frissíted, majd az új verziót feldolgozod és indexeled.

```text
régi szabályzat
      ↓
új szabályzat
      ↓
chunkolás
      ↓
új embeddingek
      ↓
vector database frissítése
      ↓
AI már az új információt találja
```

Nincs szükség arra, hogy a teljes LLM-et újratanítsd.

**A modell marad ugyanaz, miközben a hozzáférhető vállalati tudás változhat.**

Ez különösen hasznos olyan információknál, amelyek gyakran frissülnek.

---

## Google Search és a grounding

A RAG gondolata nem csak vállalati chatbotokban jelenik meg.

A Google saját dokumentációja szerint a Google Search generatív AI-funkciói, például az AI Overviews és az AI Mode, retrieval-augmented generationt, illetve groundingot is használnak: a Search rendszereiből releváns, friss weboldalakat keresnek, és ezekre támaszkodnak a generált válaszoknál. ([developers.google.com](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide))

A Google korábbi leírása szerint az AI Overviews nem egyszerűen a modell training során megszerzett tudásából generál választ, hanem a Search indexével és ranking rendszereivel együttműködve releváns webes eredményeket keres. ([blog.google](https://blog.google/products-and-platforms/products/search/ai-overviews-update-may-2024/))

Ez nagyon jól mutatja a RAG alapötletét:

```text
AI modell
   +
külső kereshető tudás
   ↓
kontextus
   ↓
generált válasz
```

A különbség az, hogy egy vállalati RAG esetében a „külső tudás” lehet a saját dokumentációtok, míg egy kereső esetében ez lehet a web.

---

## Miért nem elég egyszerűen mindent betenni a promptba?

Felmerülhet a kérdés:

> „Ha az LLM képes hosszú szöveget kezelni, miért kell vector database?”

Bizonyos esetekben tényleg nincs szükség klasszikus RAG-ra.

Ha van néhány rövid dokumentum, és azok beleférnek a modell context window-jába, egyszerűbb lehet közvetlenül átadni őket.

Nagyobb tudásbázisnál viszont ez gyorsan problémássá válik.

Ha több ezer dokumentumod van, nem akarod minden kérdésnél elküldeni az összeset.

A retrieval éppen azt oldja meg, hogy:

**csak azt a kis részt adjuk át a modellnek, amely az adott kérdéshez valószínűleg releváns.**

A Google Cloud is kiemeli, hogy a RAG csökkentheti a modellnek átadott tokenmennyiséget olyan esetekben, amikor a teljes tudásbázis nem férne bele hatékonyan a context window-ba.

[https://cloud.google.com/use-cases/retrieval-augmented-generation](https://cloud.google.com/use-cases/retrieval-augmented-generation)

---

## A RAG legnagyobb problémája: mi van, ha rosszat keres?

A RAG nem varázslat.

A modell csak abból tud jól dolgozni, amit megkap.

Ha a retrieval rossz dokumentumrészt talál:

```text
rossz kérdésértelmezés
       ↓
rossz embedding / keresés
       ↓
rossz chunk
       ↓
LLM
       ↓
rossz vagy irreleváns válasz
```

Ezért **egy RAG-rendszer minőségét nem csak az LLM határozza meg.**

Nagyon fontos:

* a dokumentumok minősége,
* a parsing,
* a chunking,
* az embedding modell,
* a retrieval,
* a ranking,
* a metadata,
* a hozzáférési szabályok,
* és az LLM.

A Google saját RAG-dokumentációja is kiemeli, hogy a retrieval relevanciája kritikus: ha a rendszer irreleváns információt talál, a generált válasz akkor is lehet hibás, ha egyébként „grounded”.

[https://cloud.google.com/use-cases/retrieval-augmented-generation](https://cloud.google.com/use-cases/retrieval-augmented-generation)

---

## A hozzáférési jogosultság különösen fontos

Egy belső tudásbázisnál nem elég azt tudni, hogy melyik dokumentum releváns.

Azt is tudni kell:

> „Ezt a felhasználó egyáltalán láthatja?”

Tegyük fel, hogy ugyanabban a rendszerben vannak:

* HR-dokumentumok,
* pénzügyi adatok,
* fejlesztői dokumentáció,
* vezetői anyagok.

Nem szeretnéd, hogy egy egyszerű kérdés miatt egy alkalmazott olyan dokumentumrészletet kapjon vissza, amelyhez nincs jogosultsága.

Ezért production RAG esetén az identity és access management nem opcionális extra.

Az AWS útmutatója is külön kiemeli a felhasználói jogosultságok és a finomhangolt hozzáférés-kezelés fontosságát vállalati RAG-rendszereknél.

[https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/what-is-rag.html](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/what-is-rag.html)

---

## RAG nem egyenlő automatikusan igazsággal

A grounding jelentősen javíthatja a válaszok relevanciáját és ellenőrizhetőségét, de nem szünteti meg az összes hibát.

A rendszer továbbra is hibázhat például akkor, ha:

* a dokumentum elavult,
* hiányzik a szükséges információ,
* rossz chunkot választ,
* a kérdés félreérthető,
* az LLM rosszul értelmezi a megtalált információt,
* ellentmondó dokumentumok léteznek.

**A RAG tehát nem azt jelenti, hogy az AI mindig igazat mond. Azt jelenti, hogy az AI számára releváns külső tudást biztosítunk, amelyre a válaszát alapozhatja.**

Ezért production környezetben érdemes mérni a retrieval és a generált válasz minőségét is.

---

## Mikor érdemes RAG-ot használni?

RAG különösen érdekes lehet, ha az AI-nak hozzá kell férnie:

* belső dokumentációhoz,
* termékadatokhoz,
* szabályzatokhoz,
* ügyfélanyagokhoz,
* tudásbázishoz,
* gyakran frissülő információhoz,
* privát vagy vállalatspecifikus adatokhoz.

Kevésbé indokolt, ha csak általános szöveggenerálásra van szükséged.

Például egy egyszerű marketingposzt generálásához nincs feltétlenül szükség vector database-re.

Egy 10 000 dokumentumból álló belső tudásbázis természetes nyelvű kereséséhez viszont már egészen más a helyzet.

---

## A RAG egyszerűnek tűnik, de productionben összetett

A bemutatott folyamat rövid:

```text
dokumentum
→ chunk
→ embedding
→ vector database
→ retrieval
→ LLM
→ válasz
```

Egy valódi rendszer azonban ennél jóval több elemből állhat:

```text
Dokumentumok
 ↓
Parser
 ↓
Chunking
 ↓
Embedding
 ↓
Vector DB
 ↓
Retriever
 ↓
Re-ranker
 ↓
Permission check
 ↓
LLM
 ↓
Grounding / citation
 ↓
Válasz
```

Ezért egy jó RAG-rendszer felépítése nem egyszerűen annyi, hogy „tegyünk egy PDF-et a ChatGPT mellé”.

**A nehéz rész gyakran nem maga az LLM, hanem annak biztosítása, hogy a megfelelő kérdéshez a megfelelő információ kerüljön a modell elé.**

---

## Saját tudást adni az AI-nak nem feltétlenül jelent új AI-t

Ez talán a RAG legfontosabb üzleti üzenete.

Nem feltétlenül kell saját modellt tanítani.

Nem feltétlenül kell több milliárd forint értékű AI-infrastruktúrát építeni.

Sok esetben egy meglévő LLM és egy jól megtervezett retrieval réteg elegendő ahhoz, hogy az AI hozzáférjen a vállalkozás saját tudásához.

```text
Saját dokumentumok
       +
jó keresés
       +
LLM
       ↓
saját tudásra épülő AI
```

A valódi érték sokszor nem abban van, hogy létrehozol még egy chatbotot.

Hanem abban, hogy **az AI végre hozzáfér ahhoz a tudáshoz, amelyet a vállalkozásod évek alatt felhalmozott.**

---

## Lehet a céged tudásbázisából AI-asszisztens?

Ha van sok belső dokumentációd, szabályzatod, termékleírásod vagy ügyfélszolgálati anyagod, a RAG lehet az egyik legegyszerűbb út ahhoz, hogy ezek természetes nyelven kereshetővé váljanak.

A jó megoldás azonban nem ott kezdődik, hogy kiválasztunk egy vector database-t.

**Először azt kell megérteni, milyen tudásból, milyen kérdésekre és milyen jogosultságok mellett kell az AI-nak válaszolnia.**

**softwaredevelopment.hu — AI-megoldások, automatizálás és egyedi szoftverek vállalkozások számára.**

---

## Források

* Lewis et al.: [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
* Google Cloud: [What is Retrieval-Augmented Generation (RAG)?](https://cloud.google.com/use-cases/retrieval-augmented-generation)
* Google Cloud: [RAG Engine overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/rag-overview)
* Google Cloud: [Use embedding models with RAG Engine](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/use-embedding-models)
* Google for Developers: [Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
* Google: [What happened with AI Overviews and next steps](https://blog.google/products-and-platforms/products/search/ai-overviews-update-may-2024/)
* AWS: [Understanding Retrieval Augmented Generation](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/what-is-rag.html)
* AWS: [Retrievers for RAG workflows](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/rag-custom-retrievers.html)

