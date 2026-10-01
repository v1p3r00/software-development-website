---
title: "Fine-tuning: mikor kell saját modellt tanítani, és mikor elég a RAG?"
description: "Fine-tuning, prompting vagy RAG? Megmutatjuk, mikor melyik megoldás éri meg, milyen adatok kellenek hozzá, és hol jelennek meg a valódi költségek."
tags: [fine-tuning, rag, prompting, ai, llm]
date: 2026-11-03 08:00
image: /articles/fine-tuning-or-rag/share-hu.jpg
---

## Tényleg saját modellt kell tanítanod?

Ha egy vállalkozás AI-megoldást szeretne, előbb-utóbb felmerül a kérdés:

> „Nem lenne jobb, ha a modellt megtanítanánk a saját adatainkra?”

Elsőre logikusnak tűnik.

Van egy csomó belső dokumentumod, termékleírásod, ügyfélszolgálati válaszod vagy korábbi beszélgetésed. Miért ne töltenéd be ezeket a modellbe?

Azért, mert **a saját adatok használata és a modell tanítása két külön probléma**.

Ha azt szeretnéd, hogy az AI ismerje a céged aktuális dokumentumait, gyakran nem fine-tuningra, hanem **RAG-ra (Retrieval-Augmented Generation)** van szükséged.

Ha viszont azt szeretnéd, hogy a modell következetesen egy meghatározott módon viselkedjen, például egy adott formátumban válaszoljon vagy egy speciális feladatot végezzen, már lehet értelme a fine-tuningnak.

És van egy harmadik lehetőség is:

**Lehet, hogy egy jó prompt önmagában elég.**

---

## Három különböző problémát három különböző eszköz old meg

A legegyszerűbb megközelítés:

```text
Prompting
→ Hogyan mondjuk meg a modellnek, mit csináljon?

RAG
→ Milyen külső információt adjunk neki az adott kérdéshez?

Fine-tuning
→ Hogyan alakítsuk át a modell viselkedését egy konkrét feladatra?
```

Ez nem három egymást kizáró technológia.

Egyetlen rendszerben akár mindhárom jelen lehet.

Például egy ügyfélszolgálati AI használhat:

- promptot a viselkedési szabályokhoz,
- RAG-ot a legfrissebb termékdokumentációhoz,
- fine-tuningot a vállalat saját válaszstílusához.

**A kérdés nem az, hogy „RAG vagy fine-tuning?”, hanem az, hogy pontosan mit szeretnél megváltoztatni.**

---

## Először próbáld meg prompttal

Ez a legolcsóbb és legegyszerűbb kiindulópont.

Tegyük fel, hogy szeretnéd, ha az AI minden ügyfélszolgálati válaszban:

- röviden fogalmazna,
- tegezné az ügyfelet,
- három pontban adná meg a megoldást,
- a végén kérdezné meg, hogy szükség van-e további segítségre.

Nem kell ezért modellt tanítani.

Elég lehet egy jó system prompt:

```text
Te egy magyar ügyfélszolgálati asszisztens vagy.

Mindig:
- tegeződj,
- maximum 5 mondatban válaszolj,
- használj egyszerű nyelvezetet,
- ha nincs elegendő információd, jelezd ezt,
- ne találj ki termékinformációt.
```

A prompting egyik alapelve, hogy minél pontosabban határozod meg az elvárt feladatot, formátumot, kontextust és példákat, annál jobban tud alkalmazkodni a modell. Az Anthropic hivatalos útmutatója például a világos instrukciókat, a kontextust és a few-shot példákat is a hatékony promptolás alapvető eszközei között kezeli. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

**Ha prompttal megoldható, általában nincs értelme rögtön fine-tuninggal kezdeni.**

---

## Mikor kell RAG?

A RAG akkor érdekes, amikor az AI-nak olyan információkra van szüksége, amelyeket nem érdemes a modell paramétereibe „beleégetni”.

Például:

- belső szabályzat,
- termékkatalógus,
- használati útmutató,
- szerződési feltételek,
- tudásbázis,
- aktuális árlista,
- belső wiki,
- ügyfélszolgálati dokumentáció.

A folyamat:

```text
Felhasználó kérdez
↓
Keresés a saját adatbázisban
↓
Releváns dokumentumrészek
↓
Prompt + megtalált információ
↓
LLM
↓
Válasz
```

A modell ilyenkor nem feltétlenül „tanulja meg” az adatokat.

**Lekérdezi őket, amikor szüksége van rájuk.**

A Microsoft RAG-útmutatója is ezt a megközelítést írja le: a retrieval rendszer releváns kontextust keres, majd ezt adja át a nyelvi modellnek, amely az információ alapján generál választ. [Microsoft – RAG prompt engineering](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-prompt-engineering)

Az eredeti RAG-kutatás egyik fontos motivációja éppen az volt, hogy a modellek paramétereiben tárolt tudás mellett legyen hozzáférhető külső, nem paraméteres memória is. [arXiv – Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)

---

## Miért jó a RAG vállalati adatokhoz?

Tegyük fel, hogy van egy 500 oldalas belső dokumentációtok.

Nem feltétlenül akarod újratanítani a modellt, amikor módosul egy szabály.

RAG esetén:

```text
Régi dokumentum
↓
Új dokumentum
↓
Index frissítése
↓
Az AI már az új információt használja
```

Ez különösen fontos olyan adatoknál, amelyek folyamatosan változnak.

Például egy webshop árlistáját nem érdemes azért fine-tuningolni, mert megváltozott 30 termék ára.

**A változó tudás tipikusan retrieval-probléma, nem fine-tuning-probléma.**

A Microsoft dokumentációja szintén kiemeli, hogy a RAG különösen hasznos lehet új vagy folyamatosan változó adatok bevonására, míg a fine-tuning más típusú testreszabási problémákra alkalmas. [Microsoft – Retrieval Augmented Generation using Azure Machine Learning](https://learn.microsoft.com/en-us/azure/machine-learning/concept-retrieval-augmented-generation)

---

## Akkor mire való a fine-tuning?

A fine-tuning során egy már előre betanított modellt további, célzott adatokon tanítasz.

Nem nulláról építesz LLM-et.

Egy meglévő modellt alakítasz egy konkrét feladathoz.

A Hugging Face definíciója szerint a fine-tuning egy előre betanított modell további tanítása kisebb, feladathoz vagy domainhez kapcsolódó adathalmazon. [Hugging Face – Fine-tuning](https://huggingface.co/docs/transformers/main/en/training)

Például:

> „Azt szeretném, hogy az AI minden beérkező hibajegyet ugyanabba a 8 kategóriába soroljon.”

Vagy:

> „A modell következetesen ebben a strukturált formátumban generáljon választ.”

Vagy:

> „Van több ezer jó minőségű példa arra, hogyan kell ezt a speciális feladatot végrehajtani.”

Itt már lehet értelme a fine-tuningnak.

---

## Fine-tuning nem egyenlő azzal, hogy feltöltöd a tudásbázist

Ez az egyik legfontosabb félreértés.

Tegyük fel, hogy van:

**10 000 terméked.**

A cél:

> „Az AI mindig tudja az aktuális termékadatokat.”

Erre általában nem az a természetes megoldás, hogy megtanítod a modellt mind a 10 000 termékre.

Sokkal inkább:

```text
Termékadatbázis
↓
Embedding / keresés
↓
Releváns termékek
↓
LLM
↓
Válasz
```

Ha viszont a cél:

> „A modell minden termékleírásból ugyanazt a strukturált JSON-formátumot állítsa elő.”

akkor a fine-tuning már érdekesebb lehet.

**RAG a tudás hozzáférését, fine-tuning inkább a modell viselkedését és feladatspecifikus teljesítményét célozza.**

---

## Mennyi adat kell?

Nincs egyetlen univerzális szám.

Ez nagyon fontos.

Nem igaz, hogy „fine-tuninghoz pontosan 1000 példa kell”.

A szükséges adatmennyiség függ:

- a feladattól,
- a modell képességeitől,
- az adatok minőségétől,
- az edge case-ek számától,
- az elvárt pontosságtól,
- az értékelési módszertől.

A Microsoft jelenlegi dokumentációja például olyan eseteket említ, ahol akár több száz vagy néhány ezer jó minőségű, feladatspecifikus példa is használható. [Microsoft – Fine-tuning considerations](https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/fine-tuning-considerations)

A lényeg azonban nem a nyers darabszám.

**1000 rossz példa rosszabb lehet, mint néhány száz nagyon jó példa.**

---

## A fine-tuning valódi költsége nem csak a GPU

Sokan csak a tréning árát nézik.

Pedig a teljes költség inkább:

```text
Adatgyűjtés
+
Adattisztítás
+
Annotálás
+
Dataset készítés
+
Fine-tuning
+
Tesztelés
+
Értékelés
+
Újratanítás
+
Üzemeltetés
```

Ha saját modellt vagy saját fine-tuned modellt üzemeltetsz, további költségek is megjelenhetnek:

- GPU/compute,
- storage,
- inference,
- monitoring,
- modellfrissítések,
- MLOps,
- szakértői munka.

A parameter-efficient fine-tuning, például a LoRA, ezt bizonyos esetekben jelentősen csökkentheti, mert nem a teljes modell összes paraméterét módosítja. A Hugging Face PEFT dokumentációja szerint ezek a módszerek kevesebb memóriát és számítási kapacitást igényelhetnek, miközben a teljes fine-tuninghoz hasonló teljesítményt céloznak. [Hugging Face – PEFT](https://huggingface.co/docs/peft/index)

---

## RAG-nál sincs „ingyen” a rendszer

A RAG egyszerűbbnek tűnhet, de annak is van infrastruktúrája.

Például:

- dokumentumtárolás,
- szövegfeldolgozás,
- embeddingek,
- vector database,
- retrieval,
- újraindexelés,
- hozzáférés-kezelés,
- monitoring.

Egy rosszul felépített RAG rendszer ráadásul rossz dokumentumokat is visszaadhat.

Ezután a modell hiába jó.

**Ha rossz információt adsz neki kontextusként, jó választ sem fog tudni garantálni.**

A Microsoft RAG-útmutatója ezért külön foglalkozik a retrieval minőségével, a chunkolással, a context window kezelésével és az értékeléssel. [Microsoft – RAG prompt engineering](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-prompt-engineering)

---

## Egyszerű döntési útmutató

Használj **promptingot**, ha:

- egyszerű viselkedést szeretnél,
- formátumot akarsz meghatározni,
- szerepet és szabályokat adsz a modellnek,
- néhány példával megoldható a feladat.

Használj **RAG-ot**, ha:

- saját dokumentumokra kell támaszkodni,
- az információ változik,
- forrásokat szeretnél megőrizni,
- nagy tudásbázist kell kereshetővé tenni,
- nem akarod minden adatváltozás után újratanítani a modellt.

Használj **fine-tuningot**, ha:

- a modell viselkedését akarod következetesebbé tenni,
- speciális feladatra akarod optimalizálni,
- sok jó minőségű példád van,
- a prompt túl hosszú vagy túl sok példát igényel,
- mérhető teljesítményjavulást szeretnél egy konkrét feladaton.

És bizonyos esetekben:

**használd együtt őket.**

---

## Egy egyszerű döntési fa

```text
Mit szeretnél megoldani?
        ↓
Viselkedés / formátum?
        ↓
     PROMPT
        │
        └── Nem
             ↓
      Külső / saját tudás?
             ↓
            RAG
             │
             └── Nem
                  ↓
       Speciális feladat vagy viselkedés?
                  ↓
             FINE-TUNING
```

Van egy fontos kiegészítés:

Ha RAG-ot használsz, attól még lehet szükséged fine-tuningra is.

Például:

```text
Fine-tuned model
      +
    RAG
      +
   Prompt
      ↓
Vállalati AI-rendszer
```

---

## Mit választanék egy átlagos vállalkozásnál?

Ha egy KKV azt mondja:

> „Van 500 PDF-ünk, belső dokumentációnk és termékleírásunk. Szeretnénk egy AI-asszisztenst.”

**Nem a fine-tuning lenne az első lépésem.**

Először:

1. jó prompt,
2. megfelelő modell,
3. RAG,
4. értékelés,
5. csak utána fine-tuning, ha konkrét mérési eredmények alapján szükséges.

Ennek egyszerű oka van.

A RAG-gal a dokumentumok frissíthetők anélkül, hogy minden alkalommal új tréninget kellene futtatni.

A fine-tuning pedig akkor kerül elő, amikor már pontosan tudod, **milyen viselkedést vagy feladatot nem tudsz megfelelően elérni prompttal és RAG-gal.**

Egy 2023-as összehasonlító kutatás szerint tudásintenzív feladatokon a RAG több vizsgált esetben jobb eredményt adott a fine-tuningnál, különösen új vagy ritkább tények esetén. Ez természetesen nem jelenti azt, hogy a RAG minden feladatban jobb: a kutatás feladattól és megközelítéstől függő különbségeket vizsgált. [arXiv – Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs](https://arxiv.org/abs/2312.05934)

---

## A legfontosabb szabály

Ne abból indulj ki, hogy:

> „Van sok adatunk, ezért tanítsuk be a modellt.”

Először kérdezd meg:

> **„Ezt az adatot meg akarjuk tanítani a modellnek, vagy csak szeretnénk, hogy válaszadáskor hozzáférjen?”**

Ha az információ gyakran változik, általában jobb, ha a rendszer lekéri.

Ha a modellnek egy speciális feladatot kell megtanulnia, a fine-tuning lehet érdekes.

Ha csak pontosabb instrukciókra van szükség, elég lehet egy jobb prompt.

A modern AI-rendszerekben ráadásul ezek nem egymás alternatívái.

**A jó rendszer gyakran prompt + RAG + megfelelő modell, és csak akkor kerül bele fine-tuning, amikor annak mérhető előnye van.**

---

## A cél nem a „saját modell”

A vállalkozásoknál könnyű beleesni abba a hibába, hogy a technológia lesz a cél.

„Saját AI.”

„Saját modell.”

„Fine-tuning.”

Ezek önmagukban nem üzleti eredmények.

A valódi kérdés:

> **Melyik megoldással tudod a kívánt eredményt a legkevesebb komplexitással, költséggel és kockázattal elérni?**

Lehet, hogy erre egy egyszerű prompt a válasz.

Lehet, hogy RAG.

Lehet, hogy fine-tuning.

És lehet, hogy egy kombinációjuk.

**softwaredevelopment.hu — AI-megoldások tervezése vállalkozásoknak: RAG, LLM-integráció, automatizálás és egyedi AI-rendszerek.**

---

## Források

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
