---
title: "Context Window és Context Engineering: mit tud valójában „látni” az AI?"
description: "Mi fér bele egy AI kontextusába, és mi történik, ha túl sok információt adunk neki? Context window, memory és context engineering."
tags: [ai, context-window, context-engineering, llm, agents]
date: 2026-10-25 08:00
image: /articles/context-window-and-context-engineering/share-hu.jpg
---

## Mit „lát” valójában egy AI?

Amikor egy AI-asszisztenssel beszélgetsz, könnyű úgy elképzelni, hogy a modell folyamatosan mindent lát, amit korábban mondtál neki.

Valójában ennél összetettebb a helyzet.

Egy nyelvi modell egy adott válasz elkészítésekor egy **context window**, vagyis kontextusablak rendelkezésére álló tartalmából dolgozik. Ebbe kerülhetnek az utasítások, a beszélgetés előzményei, a csatolt dokumentumok, a keresésből származó információk, a toolok eredményei és más, az alkalmazás által átadott adatok.

Anthropic ezt a kontextust úgy definiálja, mint azokat a tokeneket, amelyek az adott inference során a modell rendelkezésére állnak. A context engineering pedig éppen arról szól, hogyan válogassuk ki és tartsuk karban ezt az információt. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

**Az AI tehát nem egyszerűen „mindent lát”. Azt látja, amit az adott pillanatban a rendszer a kontextusába betesz.**

---

## Mi az a context window?

A context window az a maximális mennyiségű bemenet, amelyet egy modell egy adott feldolgozás során képes kezelni.

Ezt jellemzően **tokenekben** mérik.

A token nem pontosan ugyanaz, mint egy szó.

Egy token lehet:

- egy teljes szó,
- egy szó egy része,
- írásjel,
- szám,
- vagy egy rövidebb karakterlánc.

Ezért amikor egy modellről azt mondjuk, hogy például több százezer tokenes context window-ja van, abból nem lehet egyszerűen ugyanennyi szót vagy oldalt kiszámolni.

A pontos kapacitás modelltől és használati módtól függ. Az Anthropic például jelenleg 200K+ tokenes kontextust támogat több modelljénél, míg egyes modelljeinél 1M tokenes API-kontextust is dokumentál. ([support.anthropic.com](https://support.anthropic.com/en/articles/8606395-how-large-is-the-anthropic-api-s-context-window))

---

## A context window olyan, mint egy munkaasztal

Egy jó analógia a munkaasztal.

Képzeld el, hogy egy szerelő előtt van egy nagy asztal.

Ráteszi:

- a munkautasítást,
- a szerszámokat,
- a rajzot,
- a korábbi mérési eredményeket,
- az alkatrészeket.

Ezekkel tud dolgozni.

Ha valami nincs az asztalon, nem tudja közvetlenül használni.

Az AI context window-ja hasonló.

```text
                 CONTEXT WINDOW

┌─────────────────────────────────────┐
│ rendszerutasítás                    │
│                                     │
│ beszélgetés előzményei              │
│                                     │
│ dokumentumok                        │
│                                     │
│ tool eredmények                     │
│                                     │
│ felhasználói kérdés                 │
└─────────────────────────────────────┘
                  ↓
                 LLM
                  ↓
                válasz
```

A kontextusba bekerülő információ nem feltétlenül mind ugyanonnan érkezik.

Egy AI-alkalmazás maga is összeállíthatja, hogy mit küldjön a modellnek.

Ez vezet el a context engineeringhez.

---

## Context window ≠ memória

Ez egy különösen fontos különbség.

A **context** az adott feldolgozás során rendelkezésre álló információ.

A **memory** ezzel szemben olyan információ, amelyet egy rendszer külön tárolhat és később ismét elővehet.

Egyszerűsítve:

```text
Memory
   ↓
eltárolt információ
   ↓
későbbi lekérés
   ↓
Context
   ↓
LLM
   ↓
válasz
```

Egy AI-alkalmazás például tárolhatja:

- a felhasználó beállításait,
- korábbi beszélgetések összefoglalóját,
- egy projekt állapotát,
- egy ügyfél adatait,
- korábbi döntéseket.

De ezeket nem feltétlenül kell minden egyes kérdésnél teljes egészében átadni a modellnek.

**A memory inkább egy külső tároló, a context pedig az aktuális munkamenethez kiválasztott információ.**

---

## Miért nem adjunk oda mindent?

Elsőre logikusnak tűnhet:

> „Ha a modell nagy context window-val rendelkezik, akkor adjunk neki minden információt.”

Nem feltétlenül jó ötlet.

Tegyük fel, hogy egy ügyfélszolgálati AI-nak rendelkezésére áll:

- 5000 dokumentum,
- 2000 korábbi ügy,
- 50 000 chatüzenet,
- teljes termékadatbázis,
- minden belső szabályzat.

Elméletileg rengeteg információt tudunk neki adni.

Gyakorlatban azonban felmerül egy probléma:

**a több információ nem feltétlenül jelent jobb választ.**

A modellnek azt is ki kell derítenie, hogy a rengeteg információból mi fontos az adott kérdéshez.

---

## A „Lost in the Middle” probléma

A kutatások egyik ismert eredménye, hogy hosszú kontextusoknál a modellek nem mindig használják egyformán jól a bemenet minden részét.

A „Lost in the Middle” című kutatás azt vizsgálta, hogyan teljesítenek a modellek hosszú kontextusokban, és azt találta, hogy a releváns információ helyzete számíthat: a teljesítmény sok esetben jobb volt, amikor a fontos információ a bemenet elején vagy végén szerepelt, és romlott, amikor ugyanaz az információ a közepére került. ([arxiv.org](https://arxiv.org/abs/2307.03172))

Ezt leegyszerűsítve így képzelhetjük el:

```text
CONTEXT

[ FONTOS ]
[ adat ]
[ adat ]
[ adat ]
[ adat ]
[ FONTOS INFORMÁCIÓ ]
[ adat ]
[ adat ]
[ adat ]
[ FONTOS ]

↑ jobb hozzáférés lehet
      ↓
  középen elveszhet
```

Ez nem azt jelenti, hogy minden modern modell mindig „elfelejti” a középen lévő információt.

A jelenség modell-, feladat- és kontextusfüggő.

A fontos tanulság inkább az:

**nem elég, hogy egy modell sok információt képes befogadni; az is számít, hogy mennyire tudja hatékonyan felhasználni azt.**

---

## A hosszabb context window nem old meg mindent

Az AI-modellek context window-ja folyamatosan nőtt.

Ez nagyon hasznos.

Egy nagyobb ablak lehetővé teszi, hogy:

- hosszabb dokumentumokat adj át,
- több üzenetet tarts meg,
- nagyobb kódbázist vizsgálj,
- több tool eredményt használj,
- hosszabb munkafolyamatot kezelj.

De a nagyobb ablak önmagában nem oldja meg a relevancia problémáját.

Anthropic saját context engineering útmutatója is arra hívja fel a figyelmet, hogy még nagyon nagy context window esetén is számít a kontextus szennyeződése és az információ relevanciája. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

**A cél nem az, hogy minél több adat legyen a contextben. A cél az, hogy a megfelelő adat legyen benne.**

---

## Innen jön a Context Engineering

A prompt engineering fő kérdése sokáig ez volt:

> „Hogyan írjuk meg jól a promptot?”

A context engineering ennél szélesebb.

A kérdés inkább:

> „Milyen információt adjunk a modellnek ebben a pillanatban ahhoz, hogy jó döntést vagy választ hozzon?”

Anthropic a context engineeringet a prompt engineering természetes továbbfejlődéseként írja le. Ide tartozik többek között a rendszerutasítások, a toolok, az MCP, a külső adatok és a beszélgetési előzmények kezelése. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

Egy AI-alkalmazás tehát nem csak egy prompt lehet.

Lehet egy komplett rendszer, amely minden kérdés előtt összerakja a megfelelő kontextust.

---

## Hogyan épül össze egy jó context?

Tegyük fel, hogy egy vállalati AI-asszisztens egy ügyfél panaszára válaszol.

A rendszernek szüksége lehet:

```text
System instructions
        +
customer information
        +
current conversation
        +
relevant company policy
        +
relevant product information
        +
previous case summary
        +
available tools
        ↓
      CONTEXT
        ↓
       LLM
        ↓
      answer
```

Nem feltétlenül kell hozzáadni:

- az összes vállalati dokumentumot,
- minden korábbi ügyfélbeszélgetést,
- minden termék adatlapját,
- minden tool teljes dokumentációját.

**A context engineering lényege a válogatás.**

---

## 1. lépés: határozd meg a feladatot

A jó context megtervezése nem azzal kezdődik, hogy:

> „Mit tudunk beadni a modellnek?”

Hanem azzal:

> „Mit kell a modellnek megoldania?”

Például:

```text
Feladat:
„Válaszolj az ügyfél garanciális kérdésére.”
```

Ehhez szükség lehet:

- az adott termékre,
- a vásárlás dátumára,
- a garanciális szabályzatra,
- az aktuális ügyfélüzenetre.

Más információk valószínűleg nem relevánsak.

---

## 2. lépés: keresd meg a releváns információt

Itt kapcsolódik össze a context engineering és a RAG.

```text
Felhasználói kérdés
        ↓
retrieval
        ↓
releváns dokumentumok
        ↓
context
        ↓
LLM
```

Nem az egész tudásbázist küldöd át.

Először megkeresed a megfelelő részeket.

A retrieval történhet például:

- vector search segítségével,
- keyword search-csel,
- hybrid search-csel,
- adatbázis-lekérdezéssel,
- API-hívással,
- vagy ezek kombinációjával.

Anthropic Contextual Retrieval megközelítése is azt célozza, hogy a releváns információ pontosabban kerüljön be a modell kontextusába. ([anthropic.com](https://www.anthropic.com/engineering/contextual-retrieval))

---

## 3. lépés: adj hozzá strukturált állapotot

Egy AI-agent esetében a kontextus nem csak dokumentumokból állhat.

Lehet benne például:

```text
TASK
Current goal:
Prepare the customer response.

STATE
Customer verified: yes
Order found: yes
Refund eligible: yes

AVAILABLE TOOLS
- get_order
- issue_refund
- send_email

RELEVANT DATA
Order #18452
Product: ...
Purchase date: ...
```

Ez sokkal hasznosabb lehet, mint egy hosszú, strukturálatlan szöveghalmaz.

**A jól strukturált context segít a modellnek megérteni, mi fontos, mi történt már, és mit kell még megtennie.**

---

## 4. lépés: ne ismételd feleslegesen ugyanazt

Egy hosszú beszélgetésben sok információ többször is megjelenhet.

Például:

```text
User:
„A projekt Budapesten készül.”

Assistant:
„Értem, tehát Budapesten készül.”

User:
„Igen, és a határidő december.”

Assistant:
„Értem, a projekt Budapesten készül,
a határidő december.”
```

Ha ezt több száz üzeneten keresztül folytatjuk, a context egyre nagyobb lesz.

Egy agent rendszer ezért használhat például:

- összefoglalást,
- tömörített állapotot,
- strukturált jegyzeteket,
- relevancia-alapú visszakeresést.

Anthropic ezt többek között **compaction** és strukturált jegyzetelés segítségével javasolja hosszabb ideig futó agenteknél. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

---

## A memory valójában lehet egy másik adatbázis

Egy fejlettebb AI-alkalmazásban érdemes különválasztani:

```text
                 ┌───────────────┐
                 │   Database    │
                 │ users / data  │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    Memory     │
                 │ summaries /   │
                 │ preferences   │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │   Retrieval   │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    Context    │
                 └───────┬───────┘
                         ↓
                        LLM
```

Ez sokkal skálázhatóbb, mint minden adatot minden kérdésnél elküldeni.

---

## A toolok is a context részei

Egy AI-agent nem csak szöveget kap.

Toolokat is használhat.

Például:

```text
User asks:
„Mikor érkezik a rendelésem?”

        ↓

AI context
        ↓
available tool:
get_order_status
        ↓
tool result
        ↓
context update
        ↓
LLM
        ↓
answer
```

A tool eredménye tehát új információként bekerülhet a következő inference kontextusába.

Ezért context engineeringnél nem csak a promptot kell megtervezni.

Azt is meg kell határozni:

- milyen toolok legyenek elérhetők,
- mikor használja őket a modell,
- milyen eredményt adjanak vissza,
- mennyi adatot adjanak vissza,
- hogyan legyenek strukturálva.

---

## A túl sok tool is probléma lehet

Ugyanaz az elv a toolokra is érvényes.

Ha egy agentnek 100 különböző toolt adsz, nem biztos, hogy jobb lesz.

A modellnek meg kell értenie:

- melyik mire való,
- mikor kell használni,
- milyen paramétereket vár,
- melyik eredmény mit jelent.

Ezért egy jól tervezett agent gyakran csak a feladat szempontjából releváns toolokat kapja meg.

**A context nem csak adat. A rendelkezésre álló műveletek és azok leírása is része annak, amit a modell „lát”.**

---

## Egy jó context gyakran rövidebb

Ez elsőre ellentmondásosnak tűnhet.

Ha több információ áll rendelkezésre, miért ne adnánk oda mindet?

Mert a releváns információ aránya számít.

Hasonlítsd össze:

```text
A:
100 oldal
95 oldal irreleváns
5 oldal fontos

B:
12 oldal
10 oldal fontos
2 oldal háttér
```

A második context lehet sokkal hatékonyabb.

A hosszú kontextusokkal kapcsolatos kutatások éppen azt mutatják, hogy az információ mennyisége és elhelyezkedése befolyásolhatja a modell teljesítményét. ([arxiv.org](https://arxiv.org/abs/2307.03172))

**A context engineering egyik célja ezért az információs zaj csökkentése.**

---

## Ne csak a mennyiséget, a szerkezetet is tervezd

Egy AI-nak nem mindegy, hogyan kapja meg ugyanazt az információt.

Például ez:

```text
Customer is John.
Order is 18452.
It was bought on 12 May.
The product is X.
The customer wants a refund.
Refund policy says ...
```

működhet.

De strukturált formában:

```text
CUSTOMER
name: John

ORDER
id: 18452
product: X
purchase_date: 12 May

REQUEST
type: refund

POLICY
...
```

egyértelműbb lehet.

Anthropic hosszú kontextusú prompting útmutatója például strukturált XML-elemek használatát javasolja több dokumentum kezelésekor, és azt is ajánlja, hogy a modell számára világosan legyenek elkülönítve az egyes dokumentumok és azok metaadatai. ([docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables))

---

## Mi legyen a contextben?

Egy praktikus ellenőrzőlista:

```text
[✓] aktuális feladat
[✓] releváns instrukciók
[✓] szükséges felhasználói adatok
[✓] releváns dokumentumok
[✓] aktuális állapot
[✓] szükséges toolok
[✓] tool eredmények
[✓] korábbi döntések / összefoglaló

[✗] irreleváns dokumentumok
[✗] régi, már érvénytelen adatok
[✗] duplikált információ
[✗] felesleges toolok
[✗] teljes adatbázis
```

Ez természetesen alkalmazásonként változik.

De a gondolkodásmód fontos:

**ne azt kérdezd, hogy „mit tudunk elküldeni?”, hanem azt, hogy „mire van szüksége a modellnek?”.**

---

## Context Engineering egy valódi AI-alkalmazásban

Tegyük fel, hogy egy vállalati AI-asszisztens egy support ticketet kezel.

A rendszer:

```text
1. Felhasználó kérdez
          ↓
2. Azonosítjuk az ügyfelet
          ↓
3. Lekérjük a releváns rendelést
          ↓
4. Megkeressük a kapcsolódó dokumentációt
          ↓
5. Ellenőrizzük a jogosultságokat
          ↓
6. Összeállítjuk a contextet
          ↓
7. LLM válaszol
          ↓
8. Ha szükséges, toolt használ
          ↓
9. Az eredmény visszakerül a contextbe
```

Ez már sokkal inkább **context engineering**, mint egyszerű promptírás.

---

## És mi történik hosszú feladatoknál?

Egy agent akár órákig dolgozhat egy feladaton.

Egyetlen context window viszont véges.

Ezért hosszú feladatoknál szükség lehet arra, hogy a rendszer:

- összefoglalja a korábbi munkát,
- elmentse az állapotot,
- új context window-t indítson,
- visszatöltse a fontos információkat.

Anthropic ezt többek között compaction, structured note-taking és több context window használatával kezeli hosszabb ideig futó agenteknél. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

Egyszerűsítve:

```text
Context 1
   ↓
munka
   ↓
összefoglaló / state
   ↓
Context 2
   ↓
folytatás
   ↓
összefoglaló / state
   ↓
Context 3
```

**A hosszú távú memória tehát gyakran nem egyetlen hatalmas context window, hanem több context között kezelt állapot.**

---

## A jövő AI-alkalmazásainak egyik kulcsa a context

Az LLM önmagában csak egy része egy AI-rendszernek.

Egy komoly alkalmazásban legalább ennyire fontos:

- milyen adatot kap,
- mikor kapja,
- milyen sorrendben kapja,
- mit hagyunk ki,
- mit keresünk vissza,
- mit tárolunk memóriaként,
- milyen toolokat adunk neki.

```text
                 AI APPLICATION

Data ────────┐
Memory ──────┤
RAG ─────────┤
Tools ───────┼──→ Context → LLM → Output
History ─────┤
State ───────┤
Instructions ┘
```

**Egy jó AI-rendszer nem egyszerűen egy jó modellből áll. A modell és a számára összeállított context együtt határozza meg, hogy az alkalmazás mit tud ténylegesen megoldani.**

---

## Mit „lát” tehát valójában az AI?

Nem a teljes vállalati adatbázisodat.

Nem automatikusan az összes korábbi beszélgetést.

Nem minden dokumentumot, amit valaha feltöltöttél.

És nem feltétlenül használja egyformán jól a context minden részét.

**Azt látja, amit az alkalmazás az adott inference során a context window-ba helyez.**

Ezért a modern AI-fejlesztés egyik fontos kérdése már nem pusztán az, hogy:

> „Melyik modellt használjuk?”

Hanem az is:

> „Milyen contextet adjunk neki, hogy valóban azt az információt lássa, amire szüksége van?”

---

## A jó AI nem mindent lát – a megfelelőt látja

Ha AI-alkalmazást építesz, a context window mérete fontos technikai paraméter, de önmagában nem stratégia.

A valódi feladat az, hogy a rendszer képes legyen kiválasztani, tömöríteni, strukturálni és frissíteni a szükséges információt.

**A context engineering lényege nem az, hogy minél több információt adjunk az AI-nak, hanem hogy a megfelelő pillanatban a megfelelő információt adjuk neki.**

**softwaredevelopment.hu — AI-megoldások, automatizálás és intelligens alkalmazások vállalkozások számára.**

---

## Források

- Anthropic: [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Anthropic: [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval)
- Anthropic: [Prompt engineering for Claude's long context window](https://www.anthropic.com/research/prompting-long-context)
- Anthropic Documentation: [Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)
- Anthropic Help Center: [How large is the Anthropic API's context window?](https://support.anthropic.com/en/articles/8606395-how-large-is-the-anthropic-api-s-context-window)
- Liu et al.: [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)
- Anthropic: [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
