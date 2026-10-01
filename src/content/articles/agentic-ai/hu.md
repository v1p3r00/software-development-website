---
title: "Agentic AI: hogyan működik egy AI, amely önállóan tervezi meg a feladat végrehajtását?"
description: "Hogyan tervez, használ eszközöket, tanul a visszajelzésből és kér emberi segítséget egy agentic AI rendszer?"
tags: [agentic-ai, ai-agent, automatizáció, ai, üzlet]
date: 2026-10-27 08:00
image: /articles/agentic-ai/share-hu.jpg
---

## Az AI, amely nem csak válaszol, hanem végigviszi a feladatot

Az előző cikkben az AI agenteket néztük meg: olyan rendszereket, amelyek nem csak szöveget generálnak, hanem eszközöket is használhatnak és műveleteket hajthatnak végre.

Az **agentic AI ennél egy tágabb fogalom**. Olyan AI-rendszereket jelöl, amelyek egy kitűzött cél érdekében képesek megtervezni a következő lépéseket, eszközöket használni, figyelni az eredményeket, majd ezek alapján módosítani a megközelítésüket.

A Microsoft például az agentic rendszereket olyan AI-ként írja le, amelyek terveznek, ciklusban dolgoznak, eszközöket hívnak meg, és állapotot vagy memóriát is kezelhetnek. ([Microsoft](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility-ai-agent))

A lényeg röviden:

> **Nem azt mondod meg minden lépésben, hogy mit csináljon. Megadod a célt, a rendelkezésére álló eszközöket és a korlátokat, ő pedig ezek alapján dolgozik.**

---

## Mi történik egy egyszerű chatbotnál?

Egy hagyományos chatbot működése nagyjából ilyen:

```text
Kérdés
  ↓
AI modell
  ↓
Válasz
```

Ha azt kérdezed:

> „Írj egy rövid ajánlatot egy weboldal készítésére.”

a modell elkészíti a szöveget.

De nem feltétlenül tudja:

- milyen ügyfélnek szól,
- milyen árakat használsz,
- van-e szabad kapacitásod,
- milyen ajánlatot küldtél korábban,
- elküldheti-e az e-mailt,
- vagy létre kell-e hoznia egy CRM-bejegyzést.

Ehhez további rendszerekre és műveletekre van szükség.

---

## Agentic AI: célból folyamat

Egy agentic rendszer működése inkább így néz ki:

```text
Cél
 ↓
Terv
 ↓
Információgyűjtés
 ↓
Eszköz használata
 ↓
Eredmény ellenőrzése
 ↓
Következő lépés megtervezése
 ↓
Újabb eszköz használata
 ↓
Ellenőrzés
 ↓
Feladat kész / emberi segítség
```

Az OpenAI agent dokumentációja ezt agent loopként kezeli: a modell dönt, szükség esetén toolt hív, megkapja az eredményt, majd folytatja a folyamatot, amíg el nem jut egy valódi befejezési ponthoz. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/running-agents))

**Ez a visszacsatolási ciklus az agentic AI egyik legfontosabb tulajdonsága.**

---

## 1. Planning – a feladat felbontása

Tegyük fel, hogy ezt mondod egy rendszernek:

> „Készíts egy piaci elemzést a következő hónapra.”

Ez nem egyetlen művelet.

Az agent felbonthatja például:

```text
1. Határozd meg a vizsgált piacot
2. Gyűjtsd össze a releváns adatokat
3. Keresd meg a legfontosabb versenytársakat
4. Hasonlítsd össze az árakat
5. Elemezd a változásokat
6. Készíts összefoglalót
7. Ellenőrizd a forrásokat
8. Készítsd el a végső riportot
```

Nem feltétlenül pontosan ezt a tervet választja.

**Az egyik fontos különbség a hagyományos automatizációhoz képest, hogy a rendszer a feladat aktuális állapota alapján alakíthatja a következő lépést.**

Ha például egy adatforrás nem elérhető, másik forrást kereshet. Ha hiányzik egy adat, megpróbálhatja máshonnan megszerezni.

---

## 2. Tool use – az agent kapcsolatba lép a külvilággal

Egy AI modell önmagában csak a rendelkezésére álló információval tud dolgozni.

Az agent viszont eszközöket használhat.

Például:

- webes kereső,
- CRM,
- ERP,
- adatbázis,
- e-mail,
- naptár,
- fájlrendszer,
- webshop API,
- GitHub,
- vállalati belső rendszer.

A Google Cloud az agentek egyik alapvető építőelemének tekinti a toolokat: ezek határozzák meg, hogy az agent milyen műveleteket tud végrehajtani a modellen kívüli rendszerekben. ([Google Cloud](https://cloud.google.com/resources/core-concepts-ai-agents))

Ezért egy agent képességeit nem csak az határozza meg, hogy milyen modell van mögötte.

Legalább ennyire fontos:

**Milyen adatokhoz fér hozzá? Milyen toolokat használhat? És milyen műveleteket engedélyezünk neki?**

---

## 3. Memory – az állapot megőrzése

Egy hosszabb feladat során az agentnek tudnia kell, hol tart.

Ehhez különböző típusú memória és állapotkezelés használható.

### Rövid távú memória

Az aktuális beszélgetés vagy feladat kontextusa.

### Munkamemória

Az adott feladat során összegyűjtött köztes eredmények.

### Hosszú távú memória

Olyan információ, amelyet későbbi feladatoknál is érdemes felhasználni.

Például egy értékesítési agent megjegyezheti egy ügyfél preferált termékeit vagy korábbi szerződéses feltételeit.

A Google Cloud különbséget tesz a hosszú távú tudás és memória, valamint az aktuális feladat rövid távú kontextusa között. ([Google Cloud](https://cloud.google.com/resources/core-concepts-ai-agents))

**A memória azonban nem egyenlő azzal, hogy mindent el kell menteni.** A tárolt adatokhoz jogosultság, megőrzési idő és adatvédelmi szabályok is tartoznak.

---

## 4. Feedback loop – mi történik, ha valami nem sikerül?

Ez az agentic AI egyik legérdekesebb része.

Egy egyszerű automatizáció például:

```text
Lépés 1
 ↓
Lépés 2
 ↓
Lépés 3
 ↓
Kész
```

Ha a második lépés hibázik, a folyamat általában leáll.

Egy agentic rendszer viszont megkaphatja a hibát, és újratervezheti a folyamatot.

```text
Feladat
 ↓
Tool meghívása
 ↓
Hiba
 ↓
AI elemzi az eredményt
 ↓
Másik megoldás?
 ├── Igen → új tool / új próbálkozás
 └── Nem → emberi segítség
```

Az Anthropic az agent működését hasonló önirányított ciklusként írja le: az agent tervez, cselekszik, megfigyeli az eredményt, módosítja a megközelítését, majd ismétel. ([Anthropic](https://www.anthropic.com/research/trustworthy-agents))

Ez azonban nem jelenti azt, hogy az agent mindig megtalálja a helyes megoldást.

**Az önálló újrapróbálkozás lehetőség, nem garancia a helyességre.**

---

## Egy konkrét üzleti példa: ügyfélszolgálati agent

Nézzünk egy webshopot.

Egy ügyfél ezt írja:

> „A rendelésem még mindig nem érkezett meg. Szeretném tudni, mi történt vele.”

Egy egyszerű chatbot válaszolhatna az ügyfélnek.

Egy agentic rendszer viszont végigviheti a teljes ügyet.

### 1. Megérti a problémát

Az agent felismeri, hogy szállítási problémáról van szó.

### 2. Megkeresi a rendelést

Lekérdezi a webshop adatbázisát:

```text
Customer → #48152
Order → #48152
Status → shipped
Courier → XYZ
Tracking → 123456
```

### 3. Lekérdezi a futárszolgálatot

Az agent meghívja a futár API-ját.

Az eredmény:

```text
Last update:
Package arrived at regional depot
Delay: 2 days
```

### 4. Újratervezi a választ

Az agentnek már nem kell általános választ adnia.

Tudja, hogy a csomag úton van, de késik.

### 5. Ellenőrzi a vállalati szabályt

Tegyük fel, hogy két nap késés esetén még nincs automatikus kompenzáció.

Az agent tehát nem ajánl fel saját döntésből visszatérítést.

### 6. Válaszol

Az ügyfél személyre szabott választ kap.

Ha azonban a csomag elveszett, vagy kompenzációt kellene adni, az agent megállhat.

```text
Normál késés
→ automatikus válasz

Elveszett csomag
→ emberi ügyintéző

Pénzvisszatérítés
→ jóváhagyás szükséges
```

**Az agent nem attól lesz jó, hogy mindent megcsinálhat. Attól lesz használható, hogy tudja, melyik esetben meddig mehet el.**

---

## Human-in-the-loop – az ember nem tűnik el

Az agentic AI egyik gyakori félreértése, hogy az embernek teljesen ki kell kerülnie a folyamatból.

A valóságban sok üzleti alkalmazásnál éppen az ellenkezője a célszerű.

Az agent végezheti az alacsony kockázatú munkát, az ember pedig a kritikus pontokon dönt.

A Google Cloud külön human-in-the-loop mintát javasol olyan esetekre, ahol emberi ellenőrzésre, szubjektív döntésre vagy kritikus művelet jóváhagyására van szükség. ([Google Cloud](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system))

Például:

```text
Információ keresése
→ AI

Riport összeállítása
→ AI

Ajánlat előkészítése
→ AI

Nagy összegű ajánlat kiküldése
→ Ember

Pénz visszautalása
→ Ember
```

Az ember így nem minden lépést ellenőriz, csak azokat, amelyeknél ennek valódi értéke van.

---

## Guardrails – korlátok az agent körül

Az agent nagyobb önállósága nagyobb kockázatot is jelent.

Ezért szükség van guardrailekre, vagyis olyan ellenőrzésekre és szabályokra, amelyek meghatározzák, hogy mit tehet és mit nem.

Az OpenAI dokumentációja például külön kezeli az input-, output- és tool-szintű guardraileket, valamint a magas kockázatú műveletekhez kapcsolódó emberi jóváhagyást. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals))

Tipikus korlátok:

- maximális lépésszám,
- maximális költség,
- engedélyezett toolok listája,
- hozzáférési jogosultságok,
- tiltott műveletek,
- emberi jóváhagyási pontok,
- időkorlát,
- auditnapló.

A Microsoft szintén a legkisebb szükséges jogosultságot, az érzékeny műveletek jóváhagyását, valamint az agent megállításának lehetőségét emeli ki. ([Microsoft](https://learn.microsoft.com/en-us/security/zero-trust/sfi/manage-agentic-risk))

---

## Hol működik jól az agentic AI ma?

Nem minden problémára kell agent.

Jelenleg különösen érdekesek azok a feladatok, amelyek:

- több lépésből állnak,
- több rendszer között mozognak,
- sok strukturálatlan információt tartalmaznak,
- gyakran igényelnek döntést,
- de jól meghatározható korlátok között zajlanak.

### Szoftverfejlesztés

Az agentek képesek lehetnek kódot keresni, módosítani, teszteket futtatni és a hibák alapján újabb változtatásokat készíteni.

Az Anthropic például a Claude Code-ot olyan agentként mutatja be, amely önállóan tud kódot írni, hibát javítani és szerkeszteni. ([Anthropic](https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents))

### Kutatás és elemzés

Egy agent több forrásból gyűjthet információt, rendszerezheti az eredményeket és elkészítheti az első elemzést.

### Ügyfélszolgálat

Egyszerűbb esetekben képes lehet több rendszer adatait összekapcsolni és végigvinni az ügyet.

### Belső vállalati folyamatok

Például dokumentumok keresése, riportok előkészítése, adatok összegyűjtése vagy CRM-frissítés.

---

## És hol nem működik jól?

Az agentic AI nem varázslat.

A Microsoft Research 2025-ös kutatási beszámolója szerint az agentek a komplex, több lépéses feladatokban egyre nagyobb képességeket mutatnak, de továbbra is elmaradnak az emberi teljesítménytől számos területen, többek között számítógép-használatban, szoftverfejlesztésben és kutatásban. ([Microsoft Research](https://www.microsoft.com/en-us/research/publication/magentic-ui-report/))

Különösen problémás lehet, ha:

- a feladat célja homályos,
- kevés megbízható adat áll rendelkezésre,
- a döntés erősen szubjektív,
- a hiba költsége nagyon magas,
- nincs lehetőség visszavonásra,
- vagy az agent túl sok jogosultságot kap.

Egy rossz válasz egy chatbotnál egy probléma.

Egy rossz döntési lánc egy agentnél már több egymásra épülő hibát jelenthet.

---

## Agentic AI vagy hagyományos automatizáció?

Nem minden folyamatot érdemes agentté alakítani.

Ha egy folyamat mindig ugyanaz:

```text
Bejön az adat
→ validálás
→ adatbázis
→ e-mail
→ kész
```

akkor egy hagyományos, determinisztikus workflow gyakran egyszerűbb és kiszámíthatóbb.

Ha viszont:

```text
Bejön a feladat
→ értelmezni kell
→ adatot kell keresni
→ több lehetséges út van
→ az eredménytől függ a következő lépés
→ bizonyos esetekben ember kell
```

akkor már lehet értelme agentic megközelítésben gondolkodni.

**Az agent nem a workflow-k helyettesítője. Olyan feladatoknál érdekes, ahol a workflow egy része nem előre meghatározott.**

---

## Hogyan érdemes elindulni?

Egy vállalkozásnak nem feltétlenül kell rögtön teljesen autonóm agentet építenie.

Érdemes egy konkrét folyamatot kiválasztani, majd fokozatosan növelni az autonómiát.

```text
1. AI csak javasol
   ↓
2. AI előkészít
   ↓
3. AI toolokat használ
   ↓
4. AI automatikusan végrehajt alacsony kockázatú lépéseket
   ↓
5. Ember jóváhagyja a kritikus műveleteket
   ↓
6. Több folyamat válik autonómabbá
```

Közben mérni kell a hibákat is.

Az Anthropic 2026-os agent-evaluációs útmutatója külön hangsúlyozza, hogy az agentek értékelése nehezebb, mert több lépésen keresztül használnak toolokat, módosítanak állapotot és alkalmazkodnak a köztes eredményekhez. ([Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents))

**A cél nem a maximális autonómia. A cél a megfelelő mértékű autonómia.**

---

## Hol van az agentic AI valódi helye?

Az agentic AI akkor válik igazán érdekessé, amikor egy üzleti feladat már túl összetett egy egyszerű chatbot számára, de még elég jól körülhatárolható ahhoz, hogy szabályokkal, jogosultságokkal és emberi kontrollal biztonságosan működtessük.

A következő években valószínűleg nem az lesz a legfontosabb kérdés, hogy „van-e AI a rendszerben”, hanem az, hogy **melyik feladatot érdemes AI-ra bízni, melyiket kell továbbra is determinisztikusan kezelni, és hol kell az embernek döntő szerepet megtartania.**

**softwaredevelopment.hu — AI, automatizáció és egyedi szoftvermegoldások vállalkozásoknak.**

---

## Források

- OpenAI: [A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- OpenAI: [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)
- OpenAI: [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- Anthropic: [Trustworthy agents in practice](https://www.anthropic.com/research/trustworthy-agents)
- Anthropic: [Our framework for developing safe and trustworthy agents](https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents)
- Anthropic: [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- Google Cloud: [Core concepts of AI agents](https://cloud.google.com/resources/core-concepts-ai-agents)
- Google Cloud: [Choose a design pattern for your agentic AI system](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system)
- Microsoft: [AI agent shared responsibility model](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility-ai-agent)
- Microsoft Research: [Magentic-UI: Towards Human-in-the-loop Agentic Systems](https://www.microsoft.com/en-us/research/publication/magentic-ui-report/)
