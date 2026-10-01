---
title: "Multi-Agent Systems: miért lehet jobb több AI-agent, mint egyetlen szuper-agent?"
description: "Több AI-agent vagy egyetlen? Megmutatjuk a specializált agentek, delegálás és orchestráció előnyeit, költségeit és tipikus hibáit."
tags: [multi-agent, ai-agent, orchestration, ai, mcp]
date: 2026-10-31 08:00
image: /articles/multi-agent-systems/share-hu.jpg
---

## Miért kellene több AI-agent?

Ha már van egy AI-agented, felmerülhet a kérdés:

> „Miért ne adjunk neki egyszerűen minden eszközt és minden feladatot?”

Elsőre logikusnak tűnik.

Legyen egy nagy agent, amely:

- ügyfélszolgálatot kezel,
- számlázást intéz,
- CRM-et használ,
- dokumentumokat elemez,
- kódot ír,
- riportokat készít,
- e-maileket küld.

Egyetlen „szuper-agent”.

Csakhogy egy bizonyos pont után ez a megközelítés elkezdhet romlani.

Túl sok instrukció.

Túl sok tool.

Túl sok jogosultság.

Túl sok lehetséges út.

És egyre nehezebb megmondani, hogy egy adott döntést miért hozott.

A **multi-agent rendszer** más megközelítést használ: több, szűkebb feladatra specializált agent dolgozik együtt.

Az OpenAI jelenlegi dokumentációja is két alapvető mintát különböztet meg: egy manager agent specialistákat hívhat toolként, vagy az egyik agent átadhatja a feladatot egy másik specialistának. [OpenAI – Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)

**A cél nem az, hogy minél több agentünk legyen. A cél az, hogy minden feladatot a megfelelő komponens végezzen.**

---

## Mi az a multi-agent rendszer?

Egy egyszerű agent:

```text
Felhasználó
↓
AI-agent
↓
Toolok
↓
Eredmény
```

Egy multi-agent rendszer:

```text
                  ┌── Sales agent
                  │
Felhasználó → Orchestrator
                  │
                  ├── Support agent
                  │
                  ├── Finance agent
                  │
                  └── Technical agent
```

Az orchestrator, vagyis koordinátor feladata lehet eldönteni:

- melyik agentre van szükség,
- milyen részfeladatot kapjon,
- milyen sorrendben dolgozzanak,
- mikor kell összesíteni az eredményeket.

A specialisták pedig nem feltétlenül ismerik az egész rendszert.

Csak a saját feladatukat.

**Egy jó multi-agent rendszer inkább csapatként működik, mint egyetlen mindent tudó chatbotként.**

---

## Miért lehet jobb a specializáció?

Képzelj el egy ügyfélszolgálati rendszert.

Az egyetlen agentnek ezt kellene tudnia:

```text
- rendelés
- számlázás
- visszatérítés
- termékadatok
- technikai hibák
- szerződések
- szállítás
```

Ehhez rengeteg instrukció és tool tartozhat.

Ehelyett feloszthatod:

```text
Triage Agent
    ↓
    ├── Order Agent
    ├── Billing Agent
    ├── Technical Support Agent
    └── Product Agent
```

Az Order Agent például csak a rendelésekkel foglalkozik.

A Billing Agent csak számlázással.

A Technical Support Agent pedig technikai problémákkal.

**A kisebb feladatkör gyakran egyszerűbb promptot, kevesebb toolt és szűkebb jogosultságot jelent.**

Az OpenAI saját útmutatója is azt javasolja, hogy specialistát akkor érdemes hozzáadni, ha valóban más instrukciókra, toolokra, policykra vagy jól elkülöníthető feladatra van szükség. [OpenAI – Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)

---

## 1. Manager + specialisták

Az egyik legegyszerűbb minta egy központi manager agent.

```text
                    ┌── Research Agent
                    │
User → Manager ─────┼── Finance Agent
                    │
                    ├── Technical Agent
                    │
                    └── Writer Agent
```

A manager kapja a felhasználó kérését.

Például:

> „Elemezd, hogy érdemes-e bevezetnünk egy új előfizetéses csomagot.”

A manager ezt felbonthatja:

```text
Research Agent
→ piaci információk

Finance Agent
→ bevételi és költségszámítás

Technical Agent
→ megvalósítási követelmények

Writer Agent
→ végső összefoglaló
```

Ezután a manager összerakja az eredményeket.

Az OpenAI ezt **manager patternnek**, vagyis „agents as tools” mintának nevezi: a manager megtartja a workflow és a végső válasz feletti kontrollt, miközben specialistákat használ feladatok elvégzésére. [OpenAI – A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)

---

## 2. Handoff: amikor az agent átadja a feladatot

Másik lehetőség, hogy nem egy manager tartja folyamatosan kézben a beszélgetést.

Egy agent átadhatja a munkát egy másiknak.

```text
User
↓
Triage Agent
↓
Technical Support Agent
↓
Billing Agent
```

Például:

> „A számlám hibás, és emiatt nem tudom aktiválni az előfizetésemet.”

A Triage Agent felismeri, hogy először számlázási probléma van:

```text
Triage
↓
Billing Agent
```

A Billing Agent pedig később továbbadhatja:

```text
Billing
↓
Technical Support
```

Az OpenAI Agents SDK ezt handoffnak nevezi: az execution control átkerül a specialistához. [OpenAI – Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)

Ez akkor hasznos, ha **a következő specialistának kell átvennie a feladat tulajdonjogát**, nem csak egy részfeladatot kell elvégeznie.

---

## 3. Párhuzamos agentek

A multi-agent rendszerek egyik legerősebb tulajdonsága a párhuzamos munkavégzés.

Tegyük fel, hogy egy vállalkozás piacra akar lépni egy új termékkel.

Egyetlen agent:

```text
Piackutatás
↓
Versenytársak
↓
Pénzügyi elemzés
↓
Technikai elemzés
↓
Összefoglaló
```

Ez egymás után történik.

Több agenttel:

```text
             ┌── Piackutatás
             │
             ├── Versenytársak
User → Orchestrator ── Pénzügyi elemzés
             │
             └── Technikai elemzés
                       ↓
                   Összesítés
```

A négy részfeladat bizonyos esetekben egymástól függetlenül elvégezhető.

Az OpenAI multi-agent dokumentációja kifejezetten olyan független feladatokat említ jó jelöltként, amelyek párhuzamosan dolgozhatók fel, például külön dokumentumok vizsgálata vagy egy probléma különböző okainak felderítése. [OpenAI – Multi-agent](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)

Anthropic saját Research rendszerét is orchestrator-worker architektúrával írja le: egy vezető agent részfeladatokat oszt ki specialistáknak, akik párhuzamosan kutathatnak. [Anthropic – How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

**A párhuzamosítás nem mindig teszi olcsóbbá a rendszert, de megfelelő feladatnál jelentősen lerövidítheti a teljes munkafolyamatot.**

---

## Egy konkrét példa: üzleti elemző rendszer

Tegyük fel, hogy egy cég azt kérdezi:

> „Érdemes-e bevezetnünk egy új, 50 000 Ft-os havi előfizetéses szolgáltatást?”

Egyetlen agent mindent megpróbálhatna egyszerre.

Egy multi-agent rendszer inkább:

### Research Agent

Megvizsgálja:

- piacot,
- versenytársakat,
- elérhető nyilvános információkat.

### Finance Agent

Számol:

- ügyfélszámot,
- bevételt,
- költségeket,
- megtérülési forgatókönyveket.

### Product Agent

Megvizsgálja:

- szükséges funkciókat,
- technikai követelményeket,
- integrációkat.

### Risk Agent

Keresi:

- üzleti kockázatokat,
- technikai kockázatokat,
- adatvédelmi vagy biztonsági problémákat.

Majd:

```text
Research ─────┐
Finance ──────┤
Product ──────┼→ Manager → Végső jelentés
Risk ─────────┘
```

A manager nem feltétlenül végzi el ezeket a feladatokat.

**Koordinálja őket.**

---

## Miért lehet jobb a kisebb prompt?

Egyetlen „szuper-agent” promptja idővel ilyen lehet:

```text
Te vagy a vállalat általános AI-asszisztense.

Kezeld a számlázást.
Kezeld a rendeléseket.
Elemezd a szerződéseket.
Írj marketinganyagot.
Segíts technikai problémákban.
Kezeld a CRM-et.
Küldj e-maileket.
...
```

Ehhez rengeteg tool is társul.

Egy specialistánál:

```text
Te vagy a vállalat számlázási specialistája.

Feladataid:
- számlák lekérdezése
- számlák állapotának ellenőrzése
- hibás számlák azonosítása

Nem küldhetsz ki számlát
felhasználói jóváhagyás nélkül.
```

Ez sokkal szűkebb.

**A specializáció egyik értéke, hogy kisebb döntési teret adsz az agentnek.**

---

## A toolok száma is számít

Képzelj el egy agentet 50 különböző tool-lal.

Lehet:

- CRM,
- ERP,
- számlázás,
- naptár,
- e-mail,
- fájlkezelés,
- keresés,
- adatbázis,
- webshop,
- raktár,
- riportok,
- adminisztráció.

Minden egyes toolhoz tartozik:

- név,
- leírás,
- paraméter,
- jogosultság,
- hibakezelés.

Egy ponton a probléma már nem az, hogy az AI „nem elég okos”.

**Egyszerűen túl sok lehetséges művelet közül kell választania.**

Az OpenAI jelenlegi ajánlása is az, hogy először próbáld meg javítani a toolok nevét, paramétereit és leírásait; több agentet akkor érdemes bevezetni, ha ez már nem javítja megfelelően a teljesítményt. [OpenAI – A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)

---

## De a multi-agent nem ingyenes

Ez az a rész, amit az AI-agentekről szóló marketinganyagok gyakran kevésbé hangsúlyoznak.

Több agent:

- több modellhívást jelenthet,
- több tokent használhat,
- több kontextust kezelhet,
- több adatot továbbíthat,
- több logot termelhet,
- több infrastruktúrát igényelhet.

Egy egyszerű kérdéshez:

```text
User
↓
1 agent
↓
Answer
```

Egy multi-agent megoldás:

```text
User
↓
Manager
↓
3 specialist
↓
Manager
↓
Answer
```

Akár négyszer vagy még többször is meghívhatod a modellt.

**Ha a feladatot egy agent jól megoldja, a több agent csak fölösleges költség és komplexitás.**

A Microsoft saját architektúra-útmutatója ezért azt javasolja, hogy a lehető legalacsonyabb komplexitási szinten kezdj: ha egyetlen agent megbízhatóan megoldja a feladatot, nincs szükség multi-agent architektúrára. [Microsoft – AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)

---

## A latency is nőhet

Több agent nemcsak pénzbe kerülhet.

Időbe is.

Ha:

```text
Manager
↓
Agent A
↓
Agent B
↓
Agent C
↓
Manager
```

minden lépés egymás után történik, a válaszidő könnyen megnő.

Ha viszont:

```text
        ┌── Agent A
        │
Manager ├── Agent B
        │
        └── Agent C
             ↓
          Manager
```

a három feladat párhuzamosan futhat.

Ezért az orchestráció egyik fontos kérdése:

> **Mi futhat párhuzamosan, és mi függ az előző lépéstől?**

---

## Új hibaforrásokat is létrehozol

Egyetlen agent hibája:

```text
Agent
↓
Hibás döntés
```

Multi-agent esetén:

```text
Agent A
↓
hibás eredmény
↓
Manager
↓
rossz összesítés
↓
Agent B
↓
rossz következő döntés
```

Lehetnek olyan hibák is, amelyek egyetlen agentnél nem léteznek:

- rossz agenthez delegálás,
- duplikált munka,
- elveszett kontextus,
- hibás eredmény-összesítés,
- körkörös handoff,
- túl sok agent-hívás,
- eltérő agentek által adott egymásnak ellentmondó eredmények.

Anthropic a saját multi-agent kutatási rendszeréről szóló beszámolójában például leírja, hogy a specialisták részfeladatainak pontatlan meghatározása duplikált munkához és kihagyott területekhez vezethetett. [Anthropic – How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

**A több agent nem automatikusan jelent jobb eredményt. Jobb koordinációt igényel.**

---

## A kontextus kezelése külön probléma

Egyetlen agent esetében:

```text
User
↓
Agent
↓
Context
↓
Tool
```

Multi-agent rendszernél el kell döntened, mit kapjon a következő agent.

Mindent?

Semmit?

Csak az előző eredményt?

Például:

```text
Research Agent
↓
10 oldalas jelentés
↓
Manager
↓
3 fontos megállapítás
↓
Finance Agent
```

Ha túl sok adatot továbbítasz, nő a költség és a zaj.

Ha túl keveset, elveszhet a fontos információ.

**Az agentek közötti kommunikációt is meg kell tervezni.**

---

## Nem minden agentnek ugyanazt a modellt kell használnia

Ez egy másik érdekes lehetőség.

Például:

```text
Manager
→ erősebb modell

Simple classifier
→ olcsóbb modell

Summarizer
→ gyors modell

Complex analyst
→ erősebb modell
```

Nem minden részfeladat igényel ugyanakkora „intelligenciát”.

Egy egyszerű kategorizálást kár lehet a legdrágább modellel elvégezni.

Egy komplex pénzügyi vagy technikai elemzésnél viszont lehet értelme nagyobb képességű modellt használni.

**A multi-agent architektúra egyik gazdasági előnye lehet, hogy feladatonként választhatsz modellt.**

De ezt mérni kell.

Ha a kisebb modell túl sok hibát okoz, az olcsóbb inference végül drágább lehet a javítások miatt.

---

## Biztonsági határok is lehetnek

Ez különösen érdekes vállalati környezetben.

Tegyük fel:

```text
Research Agent
→ csak webes keresés

Finance Agent
→ csak pénzügyi adatok olvasása

Billing Agent
→ számlázási API

Admin Agent
→ kritikus műveletek
```

Nem kell mindegyiknek ugyanazt a hozzáférést adnod.

A Microsoft multi-agent ajánlása is a least privilege, egyszerűség, auditálhatóság és governance elveit emeli ki az agentek közötti kommunikáció és toolhasználat során. [Microsoft – Multi-agent patterns](https://learn.microsoft.com/en-us/agents/architecture/multi-agent-patterns)

Ez azt jelenti, hogy a specializáció nemcsak teljesítménybeli kérdés.

**Biztonsági architektúra is lehet.**

---

## MCP és multi-agent rendszerek

Ha az agentek különböző toolokat használnak, felmerülhet az **MCP**, a Model Context Protocol.

Az MCP szabványos módot biztosít arra, hogy AI-alkalmazások külső toolokhoz és adatokhoz kapcsolódjanak.

Egy architektúra például:

```text
Manager Agent
      ↓
MCP
      ↓
CRM / ERP / Database
```

Vagy különböző specialisták saját toolkészletet kaphatnak:

```text
Research Agent → Search MCP
Finance Agent  → Finance MCP
Support Agent  → CRM MCP
```

Az MCP célja az AI-alkalmazások és külső kontextusok, erőforrások és toolok közötti interoperabilitás. [Model Context Protocol – Server overview](https://modelcontextprotocol.io/specification/draft/server/index)

**Az MCP tehát inkább az agent és a tool közötti kapcsolatot szabványosítja; nem maga a multi-agent orchestráció.**

---

## És az A2A?

Ha nem csak a saját alkalmazásodon belüli agentekről beszélünk, hanem különálló agentrendszerek kommunikációjáról, akkor érdekes az **Agent2Agent, vagyis A2A**.

Az A2A egy nyílt szabvány, amely különálló, akár különböző frameworkkel vagy különböző szolgáltatóknál készült agentek közötti kommunikációt és együttműködést célozza. [A2A Protocol – Overview](https://a2a-protocol.org/dev/specification/)

Egyszerűen:

```text
Saját AI Agent
      ↓
      A2A
      ↓
Külső specialist Agent
```

Például egy utazási rendszerben:

```text
Travel Agent
↓
A2A
├── Flight Agent
├── Hotel Agent
└── Insurance Agent
```

Az agenteknek nem feltétlenül kell ismerniük egymás belső működését.

**Az MCP inkább agent → tool/data, az A2A inkább agent → agent kommunikációs problémára ad szabványt.**

---

## Mikor elég egyetlen agent?

Nagyon gyakran.

Például:

* ügyfélszolgálati chatbot,
* egyszerű belső asszisztens,
* dokumentumösszefoglalás,
* egyetlen adatbázis lekérdezése,
* egyszerű CRM-asszisztens,
* egy jól körülhatárolt automatizáció.

A Microsoft szerint egyetlen toolokat használó agent sok vállalati esetben jó alapértelmezett megoldás, mert dinamikus toolhasználatot tesz lehetővé, miközben egyszerűbb tesztelni és hibakeresni, mint egy multi-agent rendszert. [Microsoft – AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)

Ezért érdemes:

> **Először egy agenttel megoldani a problémát.**

Csak utána szétbontani.

---

## Mikor érdemes több agent?

A multi-agent megközelítés akkor válhat indokolttá, ha:

* különböző szakterületek vannak,
* nagyon sok tool áll rendelkezésre,
* a prompt túl komplex,
* különböző biztonsági szabályok kellenek,
* egymástól független feladatokat párhuzamosan lehet végezni,
* különböző modelleket szeretnél használni,
* különálló rendszerek agentjeit kell összekapcsolni.

Egy egyszerű döntési fa:

```text
Megoldja egy agent?
        ↓
       Igen
        ↓
   Maradjon egy agent

       Nem
        ↓
Miért nem?

├── Túl sok tool?
│      ↓
│   Specializálj
│
├── Több független feladat?
│      ↓
│   Párhuzamos agentek
│
├── Más biztonsági határ?
│      ↓
│   Külön agent
│
├── Más szakterület?
│      ↓
│   Specialist agent
│
└── Másik agentrendszer?
       ↓
      A2A
```

---

## Egy jó multi-agent rendszer nem feltétlenül bonyolult

A végső architektúra lehet meglepően egyszerű:

```text
                 ┌── Research
                 │
User → Manager ──┼── Finance
                 │
                 └── Technical
                       ↓
                    Summary
```

A lényeg az, hogy mindegyik komponensnek világos legyen a felelőssége.

### Manager

Feladata:

* feladatfelosztás,
* sorrend meghatározása,
* eredmények összesítése.

### Research Agent

Feladata:

* információkeresés,
* források feldolgozása.

### Finance Agent

Feladata:

* számítások,
* pénzügyi elemzés.

### Technical Agent

Feladata:

* technikai megvalósíthatóság,
* architektúra.

**A jó specialista nem mindenhez ért egy kicsit. Egy konkrét feladatot végez megbízhatóan.**

---

## A legnagyobb hiba: agentek hozzáadása csak azért, mert lehet

Ez könnyen megtörténik.

Először:

```text
1 agent
```

Aztán:

```text
3 agent
```

Majd:

```text
10 agent
```

Végül:

```text
Manager
↓
Agent
↓
Agent
↓
Agent
↓
Agent
↓
Manager
↓
Agent
```

A rendszer működik.

Csak senki nem tudja pontosan, miért.

Az OpenAI dokumentációja kifejezetten azt ajánlja, hogy specialistákat csak akkor adj hozzá, ha azok valóban javítják a capability isolationt, a policy isolationt, a prompt tisztaságát vagy a workflow átláthatóságát. [OpenAI – Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)

**A multi-agent nem cél. Architektúra-eszköz.**

---

## Hogyan építsd fel?

Egy jó fejlesztési sorrend:

```text
1. Oldd meg egy agenttel.
        ↓
2. Mérd meg a hibákat.
        ↓
3. Azonosítsd a szűk keresztmetszetet.
        ↓
4. Határozd meg a specialistát.
        ↓
5. Adj neki szűk tool- és promptkészletet.
        ↓
6. Döntsd el: manager vagy handoff?
        ↓
7. Teszteld külön és együtt.
        ↓
8. Mérd a költséget és latency-t.
```

Ez sokkal jobb, mint előre megtervezni egy tíz agentből álló rendszert.

---

## A multi-agent jövője nem feltétlenül „több AI”

A fontosabb változás inkább az, hogy **különböző képességeket lehet komponálni**.

Egy vállalkozásnak lehet:

```text
Customer Agent
Finance Agent
Sales Agent
Technical Agent
Research Agent
```

Ezek nem feltétlenül önálló termékek.

Lehetnek egy nagyobb üzleti workflow komponensei.

És megfelelő szabványokkal akár különböző szolgáltatók agentjei is együttműködhetnek. Az A2A specifikáció kifejezetten az ilyen, különálló agentek közötti interoperabilitást célozza. [A2A Protocol – Specification](https://a2a-protocol.org/dev/specification/)

Ez egy olyan irányt jelez, ahol nem feltétlenül egyetlen AI-rendszer próbál mindent megoldani.

**Inkább több specialista dolgozik együtt egy közös cél érdekében.**

---

## A kérdés nem az, hogy hány agent kell

A rossz kérdés:

> „Hány AI-agentet használjunk?”

A jobb:

> **„Melyik feladatokat érdemes különválasztani?”**

Ha egy agent jól működik, hagyd egyben.

Ha túl sok feladatot próbál kezelni, specializálj.

Ha több független feladat van, párhuzamosíts.

Ha különböző jogosultságokra van szükség, válaszd szét.

Ha különálló agentrendszereket kapcsolsz össze, vizsgáld meg az A2A-t.

És minden esetben mérd:

- pontosság,
- latency,
- tokenhasználat,
- költség,
- hibaarány,
- emberi beavatkozás szükségessége.

**A jó multi-agent rendszer nem attól jó, hogy sok agentből áll, hanem attól, hogy a komplexitást ott osztja szét, ahol annak valódi előnye van.**

**softwaredevelopment.hu — AI-agentek, automatizálás, multi-agent rendszerek és egyedi AI-architektúrák vállalkozásoknak.**

---

## Források

- OpenAI: [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)
- OpenAI: [Multi-agent](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)
- OpenAI: [A practical guide to building AI agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- OpenAI: [Agents SDK](https://developers.openai.com/api/docs/guides/agents/sdk)
- OpenAI: [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)
- Anthropic: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- Microsoft: [AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- Microsoft: [Multi-agent patterns](https://learn.microsoft.com/en-us/agents/architecture/multi-agent-patterns)
- Model Context Protocol: [Server overview](https://modelcontextprotocol.io/specification/draft/server/index)
- A2A Protocol: [Agent2Agent Protocol Specification](https://a2a-protocol.org/dev/specification/)
- A2A Protocol: [Agent2Agent Protocol](https://a2a-protocol.org/v1.0.0/)
- arXiv: [Reinforcement Learning for LLM-based Multi-Agent Systems through Orchestration Traces](https://arxiv.org/abs/2605.02801)
