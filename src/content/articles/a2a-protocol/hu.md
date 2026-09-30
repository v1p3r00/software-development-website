---
title: "A2A Protocol: hogyan beszélgetnek egymással az AI agentek?"
description: "Az A2A szabványos módot ad arra, hogy különböző AI agentek felfedezzék egymást, feladatokat delegáljanak és együtt dolgozzanak."
tags: [a2a, ai-agent, multi-agent, mcp, automatizáció]
date: 2026-10-30 08:00
image: /articles/a2a-protocol/share-hu.jpg
---

## Mi történik, ha egy AI agentnek segítségre van szüksége?

Az előző cikkekben azt néztük meg, hogyan használhat egy AI agent külső eszközöket az MCP segítségével.

De képzeljünk el egy összetettebb rendszert.

Van egy ügyfélszolgálati agent, amely megkapja ezt a kérést:

> „Szeretném visszaküldeni a terméket, és érdekelne, mikor kapom vissza a pénzem.”

Az agent tudja kezelni az ügyfél kommunikációját, de lehet, hogy nem ő kezeli a számlázást vagy a visszatérítéseket.

Ilyenkor nem feltétlenül egy újabb toolra van szüksége.

**Lehet, hogy egy másik agenthez kell fordulnia.**

Itt jön képbe az **Agent2Agent Protocol, röviden A2A**.

Az A2A egy nyílt szabvány, amelynek célja, hogy különböző AI agentek kommunikálhassanak és együttműködhessenek egymással, akár akkor is, ha más frameworkben, más programozási nyelven vagy más gyártó infrastruktúráján futnak. Az A2A-t eredetileg a Google fejlesztette, majd a Linux Foundation keretében folytatódik a projekt. A jelenlegi hivatalos specifikáció 1.0.0 verziójú. ([A2A Protocol](https://a2a-protocol.org/v1.0.0/), [Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/))

---

## A2A nem egy újabb chatbot

Fontos különbséget tenni.

Az A2A nem egy AI-modell.

Nem egy agent framework.

És nem is maga az agent.

**Az A2A egy kommunikációs protokoll agentek között.**

Egyszerűsítve:

```text
Agent A
   ↓
   A2A
   ↓
Agent B
```text

Az egyik agent feladatot adhat a másiknak, információt kérhet, további kontextust küldhet, eredményt kaphat, vagy akár egy hosszabb ideig futó feladat állapotát is követheti.

A hivatalos dokumentáció szerint az A2A egyik fontos célja, hogy az agenteknek ne kelljen hozzáférniük egymás belső állapotához, memóriájához vagy tooljaihoz ahhoz, hogy együtt tudjanak működni. ([A2A Protocol – Specification](https://a2a-protocol.org/dev/specification/))

Ez nagyon fontos.

Egy agent lehet egy fekete doboz.

A másik agentnek elég tudnia:

- mire képes,
- hogyan érhető el,
- milyen feladatokat tud kezelni,
- milyen formában kommunikál,
- és milyen eredményt képes visszaadni.

---

## MCP és A2A: mi a különbség?

Ez az egyik legfontosabb különbség az új AI-protokollok között.

**MCP az agent és a toolok vagy erőforrások között teremt kapcsolatot.**

**A2A pedig agent és agent között.**

Egyszerűen:

```text
                    AI Agent
                   /        \
                MCP          A2A
                 ↓             ↓
          Tools / Data      Other Agents
```text

Az MCP például hozzáférést adhat:

- adatbázishoz,
- CRM-hez,
- fájlokhoz,
- GitHubhoz,
- API-khoz,
- vállalati rendszerekhez.

Az A2A pedig lehetővé teheti, hogy az agent egy másik agenthez forduljon.

Az A2A hivatalos dokumentációja ezt két kiegészítő rétegként írja le: az MCP az agent és a tools/resources közötti kapcsolatot kezeli, míg az A2A az agentek közötti együttműködést. ([A2A Protocol – A2A and MCP](https://a2a-protocol.org/dev/topics/a2a-and-mcp/))

Egy valós rendszerben akár mindkettő jelen lehet:

```text
Customer Agent
      │
      │ A2A
      ↓
Billing Agent
      │
      │ MCP
      ↓
Billing Database
```text

---

## 1. Agent discovery – hogyan találja meg egyik agent a másikat?

Mielőtt két agent együtt tudna dolgozni, az elsőnek tudnia kell, hogy a másik egyáltalán létezik.

És azt is tudnia kell, hogy mire képes.

Erre szolgál az **Agent Card**.

Az Agent Card egy strukturált JSON-dokumentum, amely az agent „digitális névjegykártyája”.

Tartalmazhat például:

- nevet,
- leírást,
- szolgáltatási URL-t,
- támogatott képességeket,
- készségeket,
- támogatott kommunikációs formákat,
- hitelesítési követelményeket.

A hivatalos dokumentáció szerint az Agent Card segítségével a kliens agent megismerheti a távoli agent képességeit és azt is, hogyan kell vele biztonságosan kommunikálni. ([A2A Protocol – Agent Discovery](https://a2a-protocol.org/dev/topics/agent-discovery/))

Egy leegyszerűsített példa:

```text
Agent Card

Name:
Billing Agent

Description:
Handles invoices and refunds

Skills:
- check_invoice
- calculate_refund
- process_refund

Endpoint:
https://billing.example.com/a2a
```text

Az egyik agent ebből már eldöntheti:

> „Ez az agent képes kezelni a visszatérítéseket. Érdemes hozzá delegálnom ezt a feladatot.”

---

## 2. Delegation – a feladat átadása

Tegyük fel, hogy egy Customer Service Agent kap egy ügyet:

> „A terméket visszaküldtem. Mikor kapom vissza a pénzem?”

A Customer Service Agent felismeri, hogy ehhez a Billing Agent tud megfelelő információt adni.

A folyamat:

```text
Ügyfél
  ↓
Customer Service Agent
  ↓
„Ez számlázási feladat”
  ↓
Billing Agent
  ↓
Visszatérítési információ
  ↓
Customer Service Agent
  ↓
Ügyfél
```text

A Customer Service Agentnek nem kell ismernie a Billing Agent belső működését.

Nem kell tudnia:

- milyen adatbázist használ,
- milyen modellt használ,
- milyen frameworkben írták,
- milyen toolokat használ belül.

**Csak a képességeit és az A2A interfészét kell ismernie.**

Ez a multi-agent rendszerek egyik fontos előnye.

---

## 3. Nem minden agent egyszerű function call

Elsőre könnyű lenne azt mondani:

> „Miért nem kezeljük a másik agentet egyszerű toolként?”

Néha ez működhet.

De egy agent ennél összetettebb lehet.

Egy tool tipikusan egy jól meghatározott művelet:

```text
get_customer(id)
```

Egy agent viszont:

* gondolkodhat,
* kérhet pontosítást,
* több lépést végezhet,
* hosszabb ideig dolgozhat,
* más toolokat használhat,
* állapotot tarthat fenn,
* és különböző eredményeket adhat vissza.

Az A2A ezért nem egyszerű function callingként kezeli az agenteket. A hivatalos dokumentáció szerint az A2A támogatja a többfordulós, állapottal rendelkező és hosszabb ideig futó feladatokat is. ([A2A Protocol – What is A2A?](https://a2a-protocol.org/dev/topics/what-is-a2a/))

---

## 4. Task – az együttműködés egysége

Az A2A-ban a **Task** egy állapottal rendelkező munkafolyamat.

Ez különösen akkor fontos, amikor egy agent nem tud azonnal válaszolni.

Például:

> „Elemezd a teljes vállalati értékesítési adatot, és készíts riportot.”

Ez akár percekig is tarthat.

A kliensnek ezért nem kell egyetlen HTTP-kérésben megkapnia a teljes eredményt.

A feladatnak lehet állapota:

```text
submitted
   ↓
working
   ↓
input-required
   ↓
working
   ↓
completed
```

Az A2A specifikáció a taskokat állapottal rendelkező egységként kezeli, amelyhez üzenetek és eredmények kapcsolódhatnak. ([A2A Protocol – Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/))

---

## 5. Messages és Artifacts

Az agentek nem csak egyszerű szövegeket küldhetnek egymásnak.

Az A2A külön kezeli a **Messages** és **Artifacts** fogalmát.

A Message a kommunikáció része.

Például:

> „A számlázási rendszerben megtaláltam a rendelést, de szükségem van a visszaküldés dátumára.”

Az Artifact pedig egy tényleges eredmény lehet:

* dokumentum,
* kép,
* strukturált JSON,
* fájl,
* elemzés,
* más generált adat.

Az A2A specifikáció szerint az Artifacts a feladat konkrét kimenetei, míg a Messages elsősorban a kommunikációt és a feladat közbeni információcserét szolgálják. ([A2A Protocol – Specification](https://a2a-protocol.org/dev/specification/))

Ez azért hasznos, mert egy agentnek nem mindig egyetlen szöveges válasz a feladata.

---

## Egy teljes üzleti példa: utazásszervezés

Nézzünk egy összetettebb példát.

A felhasználó ezt mondja:

> „Szervezz nekem egy háromnapos üzleti utat Berlinbe, repülővel és szállással.”

Egyetlen agent is megpróbálhatná kezelni.

De egy multi-agent rendszerben lehet:

```text
Travel Agent
   │
   ├── A2A → Flight Agent
   │
   ├── A2A → Hotel Agent
   │
   └── A2A → Calendar Agent
```

### 1. Travel Agent

A fő agent értelmezi a célt.

Megállapítja, hogy szüksége van:

* repülőjáratra,
* szállásra,
* naptár-integrációra.

### 2. Flight Agent

A Travel Agent delegálja:

> „Keress megfelelő járatokat Berlinbe a megadott időpontban.”

A Flight Agent saját rendszerét használja.

Belül akár MCP segítségével:

```text
Flight Agent
    ↓ MCP
Airline API
    ↓
Flight data
```

### 3. Hotel Agent

A Travel Agent egy másik agentet kér meg:

> „Keress megfelelő üzleti szállást a városközpont közelében.”

A Hotel Agent a saját adatforrásait használja.

### 4. Az eredmények visszatérnek

```text
Flight Agent
      ↓
3 flight options

Hotel Agent
      ↓
5 hotel options

Calendar Agent
      ↓
available dates
```

### 5. A fő agent összeállítja a tervet

A Travel Agent összerakja az információkat, és visszaadja az ajánlatot a felhasználónak.

A lényeg:

**A Travel Agentnek nem kell minden rendszerhez közvetlenül hozzáférnie.**

A megfelelő specializált agentekhez fordul.

---

## Multi-agent rendszer

Egy nagyobb vállalati rendszer akár így is kinézhet:

```text
                    User
                      ↓
                Orchestrator
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
       Sales       Support      Finance
       Agent        Agent        Agent
          │           │           │
         MCP         MCP         MCP
          ↓           ↓           ↓
        CRM         Tickets       ERP
```

Az agentek között A2A lehet a kommunikáció.

Az egyes agentek belül MCP-t használhatnak a saját eszközeikhez.

**A2A adja a rendszerek közötti kommunikációt, MCP pedig az egyes agentek eszközökhöz való hozzáférését.**

---

## Kommunikáció: nem csak kérdés és válasz

Az A2A többféle kommunikációs mintát támogat.

Egy rövid feladatnál elég lehet a request/response modell.

Hosszabb folyamatnál viszont szükség lehet:

* streamingre,
* állapotfrissítésekre,
* push értesítésekre,
* későbbi folytatásra.

A hivatalos A2A dokumentáció request/response kommunikációt, Server-Sent Events alapú streaminget és push notificationöket is dokumentál. ([A2A Protocol – Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/))

Ez különösen fontos hosszabb ideig futó üzleti feladatoknál.

Például:

```text
09:00 → Task started
09:01 → Searching data
09:03 → Waiting for external system
09:05 → 60% complete
09:08 → Completed
```

Az agentnek nem kell végig blokkolnia a másik oldalt.

---

## Miért jó, ha az agent „fekete doboz”?

Tegyük fel, hogy van egy adózási agented.

A Customer Service Agent csak azt tudja róla:

```text
Tax Agent

Skills:
- calculate_tax
- explain_tax_rule
- validate_tax_data
```

Nem kell ismernie:

* a modell típusát,
* a belső promptokat,
* a memória felépítését,
* az adatbázist,
* az MCP toolokat.

Ez erős absztrakciót ad.

Ha később lecseréled a Tax Agent belső implementációját, a többi agentnek nem feltétlenül kell változnia.

**Az A2A egyik fontos célja éppen az interoperabilitás különböző frameworkök, nyelvek és gyártók agentjei között.** ([A2A Protocol](https://a2a-protocol.org/))

---

## És mi a helyzet a biztonsággal?

Ha agentek kommunikálnak egymással, ugyanúgy szükség van hitelesítésre és jogosultságkezelésre, mint bármely más vállalati rendszerben.

Egy agent card például tartalmazhatja a hitelesítési követelményeket.

Az A2A dokumentáció szerint a hitelesítési adatok jellemzően a HTTP-fejlécekben kerülnek továbbításra, az A2A üzenet tartalmától elkülönítve. ([A2A Protocol – Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/))

Fontos kérdések:

* Ki hívhatja meg az agentet?
* Milyen feladatokat fogadhat el?
* Milyen adatokat adhat ki?
* Milyen agentekkel kommunikálhat?
* Milyen műveletekhez kell emberi jóváhagyás?
* Hogyan naplózzuk a delegált feladatokat?

Egy multi-agent rendszerben a jogosultságok különösen fontosak, mert **egy agent könnyen elindíthat egy másik agenten keresztül további műveleteket.**

---

## A2A + MCP: együtt lesz igazán érdekes

A két protokollt nem érdemes egymás alternatívájaként kezelni.

Egy agent például:

```text
Customer Agent
     │
     │ A2A
     ↓
Billing Agent
     │
     ├── MCP → Invoice Database
     ├── MCP → ERP
     └── MCP → Payment API
```

Itt jól látszik a két réteg.

**A2A: „Beszélj egy másik agenttel.”**

**MCP: „Használj egy toolt vagy férj hozzá egy resource-hoz.”**

Az A2A hivatalos dokumentációja kifejezetten úgy kezeli a két protokollt, mint egymást kiegészítő technológiákat: az MCP mélységet ad az egyes agenteknek a toolok és erőforrások révén, az A2A pedig összeköti ezeket az agenteket egymással. ([A2A Protocol – A2A and MCP](https://a2a-protocol.org/dev/topics/a2a-and-mcp/))

---

## Mikor van értelme multi-agent rendszert építeni?

Nem minden problémához kell több agent.

Egy egyszerű folyamatnál gyakran jobb:

```text
User
 ↓
One Agent
 ↓
MCP Tools
 ↓
Result
```

Multi-agent architektúra akkor lehet érdekes, ha:

* különálló szakmai területek vannak,
* külön csapatok vagy rendszerek kezelik az egyes feladatokat,
* külön jogosultságok szükségesek,
* az egyes agentek más adatforrásokkal dolgoznak,
* az agentek specializált feladatokat végeznek,
* vagy különböző szervezetek agentjeinek kell együttműködniük.

Például:

```text
Egy agent:
„Kezeld a teljes vállalati folyamatot.”

Több agent:
„Sales agent → CRM
Finance agent → ERP
Support agent → tickets
Legal agent → documents”
```

A második architektúra több komplexitást is jelent.

Ezért a több agent nem automatikusan jobb.

---

## A jövő inkább agentek hálózata?

Az A2A egyik fontos célja egy olyan környezet kialakítása, ahol az agentek nem elszigetelt alkalmazásokként működnek.

Egy agent képes lehet megtalálni egy másik agentet, megismerni annak képességeit, feladatot delegálni, majd feldolgozni az eredményt.

```text
                  Agent A
                 /       \
              A2A         A2A
               ↓           ↓
           Agent B      Agent C
              │             │
             MCP           MCP
              ↓             ↓
            Tools         Tools
```

Ez már nem egyszerű chatbot-architektúra.

Inkább egy **elosztott, AI-alapú szoftverrendszer**, ahol az egyes agentek különböző szerepeket tölthetnek be.

A2A-t a hivatalos dokumentáció is olyan szabványként pozicionálja, amely lehetővé teszi különböző frameworkökben és különböző gyártóknál készült agentek interoperabilitását. ([A2A Protocol](https://a2a-protocol.org/v1.0.0/))

## Mikor kell MCP, és mikor A2A?

Ha egy AI agentnek szüksége van egy adatbázisra, API-ra, fájlra vagy más eszközre, **MCP** lehet a megfelelő kapcsolati réteg.

Ha egy AI agentnek egy másik önálló agent segítségére van szüksége, **A2A** erre a kommunikációra készült.

A kettő együtt pedig egy érdekes architektúrát ad:

```text
User
 ↓
Agent A
 │
 ├── MCP → saját tools
 │
 └── A2A → Agent B
              │
              ├── MCP → saját tools
              └── A2A → Agent C
```

**Az MCP összeköti az agentet a képességeivel. Az A2A összeköti az agentet más agentekkel.**

Ez lehet az egyik fontos építőköve annak a világnak, ahol nem egyetlen „mindent tudó” AI dolgozik, hanem több specializált agent működik együtt egy közös célon.

**softwaredevelopment.hu — AI, automatizáció és egyedi szoftvermegoldások vállalkozásoknak.**

---

## Források

* A2A Protocol: [A2A Protocol 1.0.0](https://a2a-protocol.org/v1.0.0/)
* A2A Protocol: [What is A2A?](https://a2a-protocol.org/dev/topics/what-is-a2a/)
* A2A Protocol: [Core Concepts and Components](https://a2a-protocol.org/latest/topics/key-concepts/)
* A2A Protocol: [Agent Discovery](https://a2a-protocol.org/dev/topics/agent-discovery/)
* A2A Protocol: [A2A and MCP](https://a2a-protocol.org/dev/topics/a2a-and-mcp/)
* A2A Protocol: [Protocol Specification](https://a2a-protocol.org/dev/specification/)
* Google Developers Blog: [Announcing the Agent2Agent Protocol](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
* Google Developers Blog: [Developer’s Guide to AI Agent Protocols](https://developers.googleblog.com/developers-guide-to-ai-agent-protocols/)

````
