---
title: "Function Calling és Tool Use: hogyan tud egy AI API-kat és adatbázisokat használni?"
description: "Hogyan tud egy AI nemcsak válaszolni, hanem API-kat, adatbázisokat és külső eszközöket használni? Function calling és tool use érthetően."
tags: [function-calling, tool-use, ai-agent, api, mcp]
date: 2026-11-02 08:00
image: /articles/function-calling-and-tool-use/share-hu.jpg
---

## Mi történik, amikor az AI már nem csak válaszol?

Egy hagyományos chatbot nagyjából ennyit tud:

```text
Felhasználó
↓
AI
↓
Szöveges válasz
```text

Megkérdezed:

> „Mennyi a rendelés végösszege?”

Az AI válaszolhat.

De honnan tudná?

Ha az információ egy adatbázisban van, akkor önmagában a nyelvi modell nem fér hozzá.

Itt jön képbe a **function calling**, illetve a tágabb értelemben vett **tool use**.

Ilyenkor az AI nem közvetlenül hajtja végre a műveletet. A modell eldöntheti, hogy egy rendelkezésére bocsátott eszközt kell használnia, strukturált argumentumokat ad hozzá, majd az alkalmazásod végrehajtja a tényleges műveletet. A Google Gemini dokumentációja ezt kifejezetten így írja le: a modell kiválasztja a függvényt és az argumentumokat, de a függvény végrehajtása az alkalmazás felelőssége. [Google – Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling)

**Ez az egyik alapvető lépés a chatbot és egy valódi AI-agent között.**

---

## Mi az a function calling?

A legegyszerűbb példa egy időjárási függvény.

Az AI-nak megadod:

```text
get_weather(city)
```text

A felhasználó pedig ezt kérdezi:

> „Milyen idő van Budapesten?”

A modell nem feltétlenül próbálja meg kitalálni a választ.

Ehelyett kérheti:

```text
get_weather({
  "city": "Budapest"
})
```text

A backend ezt végrehajtja.

Az API visszaadja például:

```text
{
  "temperature": 18,
  "condition": "rain"
}
```text

Ezután az eredményt visszaadod az AI-nak, amely elkészíti a felhasználónak szóló választ.

```text
Felhasználó
↓
AI
↓
"get_weather Budapest"
↓
Backend
↓
Időjárás API
↓
18 °C, eső
↓
AI
↓
"Budapesten jelenleg 18 °C és esős idő van."
```text

**A modell tehát nem maga hívja meg az API-t. A modell kéri az eszköz használatát, az alkalmazás pedig végrehajtja.**

Az OpenAI Responses API szintén támogatja a saját függvények és külső eszközök bekapcsolását, többek között function calling és remote MCP segítségével. [OpenAI – Developer quickstart](https://platform.openai.com/docs/quickstart)

---

## Mi a különbség a function calling és a tool use között?

A két kifejezést sokszor egymás helyett használják.

A **function calling** általában azt jelenti, hogy egy modellt strukturált függvényhívásra használunk.

Például:

```text
get_customer(id)
create_invoice(customer_id, amount)
send_email(to, subject, body)
```text

A **tool use** ennél szélesebb fogalom.

Egy tool lehet:

- API,
- adatbázis-lekérdezés,
- kereső,
- kalkulátor,
- fájlkezelő,
- kódfuttató környezet,
- böngésző,
- másik AI-rendszer,
- MCP szerveren keresztül elérhető funkció.

A Hugging Face dokumentációja is úgy kezeli a tool use-t, mint olyan függvények használatát, amelyeket a modell válaszadás közben meghívhat. [Hugging Face – Tool use](https://huggingface.co/docs/transformers/main//chat_extras)

**A function calling tehát egy gyakori megvalósítási módja a tool use-nak.**

---

## Az AI valójában döntést hoz

Tegyük fel, hogy három eszközt adsz neki:

```text
get_customer
get_order
create_invoice
```text

A felhasználó ezt mondja:

> „Nézd meg a 12345-ös rendelést, és mondd meg, hogy kihez tartozik.”

Az AI-nak nincs szüksége mindháromra.

Valószínűleg:

```text
get_order(12345)
```text

Ezután az eredmény alapján megkérheti az alkalmazást:

```text
get_customer(678)
```text

Majd ezek után válaszolhat:

> „A 12345-ös rendelés Kovács Péterhez tartozik.”

Ez már egy több lépéses folyamat.

A Gemini dokumentációja külön is támogatja a szekvenciális, illetve több eszközt használó function calling folyamatokat. [Google – Function calling](https://ai.google.dev/gemini-api/docs/function-calling)

---

## Egy egyszerű működő példa

Képzeljünk el egy webshopot.

Van egy adatbázis:

```text
customers
orders
products
```text

És van egy AI-asszisztensed.

A felhasználó:

> „Hol tart a 8421-es rendelésem?”

A rendszer rendelkezésére áll egy tool:

```text
get_order_status(order_id)
```text

A folyamat:

```text
1. Felhasználó:
   "Hol tart a 8421-es rendelésem?"

2. AI:
   get_order_status(8421)

3. Backend:
   SELECT status
   FROM orders
   WHERE id = 8421

4. Adatbázis:
   SHIPPED

5. Backend → AI:
   {"status": "shipped"}

6. AI:
   "A rendelésedet már átadtuk a futárnak."
```text

A lényeg, hogy **az AI nem kap közvetlen hozzáférést az adatbázishoz**.

A backend dönti el, mit enged meg neki.

---

## Miért nem adjuk oda egyszerűen az adatbázist?

Mert ez:

```text
AI
↓
teljes adatbázis
```text

nagyon rossz architektúra lenne.

Sokkal biztonságosabb:

```text
AI
↓
get_order_status
↓
Backend
↓
engedélyezett lekérdezés
↓
Database
```text

Így a modell csak azt tudja megtenni, amit a tool lehetővé tesz.

Ha a tool csak rendelési státuszt ad vissza, akkor nem kell hozzáférnie:

- jelszavakhoz,
- banki adatokhoz,
- más ügyfelekhez,
- belső táblákhoz,
- adminisztrációs adatokhoz.

**A tool egy kontrollált kapu az AI és a vállalati rendszer között.**

---

## A tool definíciója is fontos

A modellnek valamilyen formában meg kell adnod, hogy milyen eszköz áll rendelkezésére.

Például:

```text
Name:
get_order_status

Description:
Returns the current status of a customer's order.

Parameters:
order_id: integer
```text

Ez alapján a modell képes lehet felismerni, mikor érdemes használni.

Az OpenAI API például a function tool definíciójában nevet, leírást és JSON Schema alapú paramétereket használ. A `strict` beállítás a paraméterek sémájának szigorú betartását is kikényszerítheti. [OpenAI – Responses API reference](https://platform.openai.com/docs/api-reference/responses)

A Google dokumentációja szintén kiemeli a függvény nevének, céljának, paramétereinek és azok leírásának jelentőségét. [Google – Function calling](https://ai.google.dev/gemini-api/docs/generate-content/function-calling)

**A tool leírása nem puszta dokumentáció: a modell ebből próbálja megérteni, mire való az eszköz.**

---

## A modell nem végrehajtó rendszer

Ez egy fontos különbség.

A modell mondhatja:

```text
create_invoice(
    customer_id=123,
    amount=250000
)
```text

De ez még nem jelenti azt, hogy számla létrejött.

Az alkalmazásodnak kell:

1. ellenőriznie az argumentumokat,
2. ellenőriznie a jogosultságokat,
3. végrehajtania a műveletet,
4. kezelnie a hibát,
5. visszaadnia az eredményt.

A Google hivatalos dokumentációja ezt kifejezetten hangsúlyozza: a custom function kódjának végrehajtása az alkalmazás felelőssége. [Google – Function calling](https://ai.google.dev/gemini-api/docs/function-calling)

A Hugging Face tool-use dokumentációja ugyanezt a ciklust írja le: a modell tool callt generál, az alkalmazás végrehajtja a megfelelő függvényt, majd a tool eredménye visszakerül a beszélgetésbe. [Hugging Face – Tool use](https://huggingface.co/docs/transformers/main//chat_extras)

---

## A teljes AI-tool ciklus

Egy agentikus rendszerben ez gyakran így néz ki:

```text
Felhasználó
↓
AI
↓
Szükség van külső adatra?
↓
Igen
↓
Tool kiválasztása
↓
Argumentumok generálása
↓
Backend validál
↓
Tool végrehajtása
↓
Eredmény
↓
AI
↓
Elég az információ?
↓
Nem → újabb tool
↓
Igen
↓
Végső válasz
```text

Ez a ciklus akár többször is lefuthat.

És pontosan ez teszi érdekessé az agenteket.

**Az AI nemcsak választ generál, hanem a következő szükséges műveletet is kiválaszthatja.**

---

## Példa: ügyfélszolgálati agent

Tegyük fel, hogy egy webshopnak van egy AI-asszisztense.

Az elérhető toolok:

```text
search_orders
get_order
get_product
check_stock
create_return_request
```text

A felhasználó:

> „A 8421-es rendelésemet szeretném visszaküldeni. Megvan még a termék?”

Az AI több lépést tehet:

```text
get_order(8421)
↓
get_product(product_id)
↓
check_stock(product_id)
↓
AI válasz
```text

Ha pedig a felhasználó ezt mondja:

> „Indítsd is el a visszaküldést.”

akkor megjelenik egy **műveletet végrehajtó tool**:

```text
create_return_request(order_id=8421)
```text

És itt válik igazán fontossá a biztonság.

---

## Nem minden tool egyformán veszélyes

Egy `get_weather` hívás általában csak információt olvas.

Egy `create_invoice` már adatot módosít.

Egy `delete_customer` még komolyabb következménnyel járhat.

Érdemes ezért legalább három kategóriában gondolkodni:

```text
READ
↓
Adat lekérése

WRITE
↓
Adat módosítása

DESTRUCTIVE
↓
Törlés / pénzügyi / visszafordíthatatlan művelet
```text

Az MCP specifikációjában a tools olyan végrehajtható funkciók, amelyekkel a modellek műveleteket végezhetnek vagy információt kérhetnek le. Az MCP ökoszisztéma külön foglalkozik a toolok viselkedésének és kockázatainak jelölésével is. [Model Context Protocol – Server overview](https://modelcontextprotocol.io/specification/draft/server/index) [MCP – Tool Annotations as Risk Vocabulary](https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/)

**Minél nagyobb a tool hatása, annál erősebb kontrollt érdemes köré építeni.**

---

## Least privilege: csak azt engedd, amire szüksége van

Ez az egyik legfontosabb biztonsági elv.

Ha az AI-nak csak rendelési státuszra van szüksége, ne adj neki teljes adatbázis-hozzáférést.

Ne:

```text
AI
↓
DB_ADMIN
```text

Hanem:

```text
AI
↓
get_order_status
↓
csak a szükséges adat
```text

Ugyanez API-knál.

Ha az agentnek csak olvasnia kell a CRM-et, ne kapjon törlési jogosultságot.

Ha csak egy adott ügyfél rekordjait kezelheti, ne kapjon teljes vállalati hozzáférést.

**Az AI jogosultsága legyen a lehető legszűkebb.**

---

## A validáció kötelező

Tegyük fel, hogy van:

```text
refund_order(order_id, amount)
```text

Az AI ezt generálja:

```text
refund_order(
    order_id=8421,
    amount=999999999
)
```text

A backendnek nem szabad egyszerűen végrehajtania.

Ellenőriznie kell például:

- létezik-e a rendelés,
- a felhasználó jogosult-e rá,
- valóban ennyi-e a visszatéríthető összeg,
- visszaküldhető-e a rendelés,
- nem történt-e már refund.

A tool argumentuma tehát **nem megbízható bemenet csak azért, mert az AI generálta.**

```text
AI output
↓
Schema validation
↓
Business validation
↓
Authorisation
↓
Execution
```text

---

## A „kérjünk megerősítést” szabály

Vannak műveletek, amelyeket nem érdemes automatikusan végrehajtani.

Például:

- pénz átutalása,
- számla kiállítása,
- rendelés törlése,
- e-mail kiküldése,
- szerződés elfogadása,
- felhasználó törlése.

Ilyenkor a rendszer kérdezhet:

> „A 8421-es rendeléshez 125 000 Ft visszatérítést szeretnél indítani. Jóváhagyod?”

Csak ezután:

```text
USER CONFIRMED
↓
refund_order(...)
```text

A Google function-calling dokumentációja is azt javasolja, hogy jelentős következménnyel járó műveleteknél a function call végrehajtása előtt validáljuk a hívást a felhasználóval. [Google – Function calling](https://ai.google.dev/gemini-api/docs/generate-content/function-calling)

---

## Mi történik, ha az AI rossz toolt választ?

Ez is előfordulhat.

Például a felhasználó:

> „Töröld a régi rendelésemet.”

A modell kiválaszthatja a `delete_order` toolt.

De honnan tudja, hogy:

- melyik rendelésre gondolt?
- valóban törölni akarja?
- van-e joga hozzá?
- a törlés engedélyezett-e?

Ezért az agent nem lehet az egyetlen biztonsági réteg.

**A backendnek akkor is ellenőriznie kell mindent, ha az AI már „eldöntötte”.**

---

## API-k használata AI-val

A function calling egyik legpraktikusabb felhasználása a meglévő API-k összekötése.

Például egy vállalkozásnak van:

- CRM-je,
- számlázója,
- webshopja,
- raktárkezelő rendszere,
- naptára.

Az AI föléjük építhető.

```text
                 ┌── CRM
                 │
AI Agent ─ Tools ├── Számlázó
                 │
                 ├── Webshop
                 │
                 ├── Raktár
                 │
                 └── Naptár
```text

A felhasználó pedig természetes nyelven kérdezhet:

> „Nézd meg, van-e készleten ebből a termékből, és ha igen, tegyél félre 20 darabot.”

Az agent először lekérdezheti a készletet.

Ha elegendő van, meghívhat egy másik toolt.

Ez már nem klasszikus chatbot.

**Ez egy természetes nyelvi interfész a meglévő üzleti rendszereidhez.**

---

## És mi van az adatbázissal?

Nem feltétlenül kell SQL-t generáltatnod az AI-jal.

Sok esetben jobb egy kontrollált tool:

```text
find_customer_orders(
    customer_id
)
```text

mint:

```text
execute_sql(
    "SELECT * FROM ..."
)
```text

Az elsőnél te határozod meg, hogy mit lehet lekérdezni.

A másodiknál az AI sokkal nagyobb mozgásteret kap.

Egy read-only reporting rendszerben természetesen lehet olyan architektúra, ahol az AI strukturált SQL-t generál, majd azt egy korlátozott adatbázis-környezet ellenőrzi és hajtja végre.

De production üzleti adatbázisnál:

**ne adj korlátlan SQL-hozzáférést egy LLM-nek csak azért, mert kényelmesnek tűnik.**

---

## Tool calling és MCP

Ha több AI-rendszert és több eszközt kezdesz összekötni, hamar felmerül az **MCP**, vagyis Model Context Protocol.

Az MCP egy szabványos protokoll az AI-alkalmazások és külső kontextusok, erőforrások és toolok összekapcsolására.

Az MCP-ben a tools olyan végrehajtható funkciók, amelyeket az AI-alkalmazás használhat például adatok lekérésére vagy műveletek végrehajtására. [Model Context Protocol – Server overview](https://modelcontextprotocol.io/specification/draft/server/index)

Egyszerűsítve:

```text
AI alkalmazás
↓
MCP Client
↓
MCP Server
↓
Tools
↓
CRM / Database / API / Files
```text

Az MCP tehát nem maga az AI.

És nem is egy adatbázis.

**Egy szabványos kommunikációs réteg, amelyen keresztül AI-alkalmazások toolokat és más kontextust érhetnek el.**

---

## Miért érdekes ez vállalkozásoknak?

Mert nem kell minden AI-alkalmazáshoz nulláról új integrációt készíteni.

Egy vállalkozás például létrehozhat egy saját MCP-szervert:

```text
Company MCP Server

Tools:
- search_customer
- get_order
- check_stock
- create_invoice
- create_support_ticket
```text

Ezt aztán megfelelő jogosultságokkal különböző AI-kliensek használhatják.

A 2026. július 28-i MCP-specifikáció már többek között a `tools/call` műveletet, a routingot és az autorizációs modellt is részletesen kezeli. [Model Context Protocol – 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/)

Ez az egyik oka annak, hogy az MCP fontos része lett az agentikus rendszerekről szóló beszélgetéseknek.

---

## A tool use nem varázslat

Fontos eloszlatni egy félreértést.

Az AI nem „belép” a vállalati rendszeredbe, és nem kezdi el önállóan böngészni az adatbázist.

A fejlesztőnek kell létrehoznia:

- a toolt,
- a paramétereket,
- a jogosultságokat,
- a validációt,
- a végrehajtási logikát,
- a hibakezelést,
- a naplózást.

Az AI ezek után **dönthet arról, mikor és milyen paraméterekkel érdemes meghívni az elérhető eszközöket.**

A Toolformer 2023-as kutatása már azt vizsgálta, hogyan lehet nyelvi modelleket külső API-k használatára tanítani, beleértve annak eldöntését, hogy mikor kell egy API-t meghívni, milyen argumentumokat kell adni, és hogyan kell felhasználni az eredményt. [arXiv – Toolformer](https://arxiv.org/abs/2302.04761)

---

## Egy jó agent architektúrája

Egy egyszerű vállalati rendszer például így nézhet ki:

```text
                    ┌── CRM Tool
                    │
                    ├── Order Tool
User → AI Agent ────┼── Invoice Tool
                    │
                    ├── Database Tool
                    │
                    └── Email Tool
                           ↓
                     Security Layer
                           ↓
                    Business Backend
```text

A biztonsági réteg feladata lehet:

- authentication,
- authorisation,
- input validation,
- rate limiting,
- audit logging,
- confirmation,
- transaction limits.

**Az AI legyen döntési és koordinációs réteg, ne az egyetlen biztonsági réteg.**

---

## Mikor érdemes tool use-t használni?

Nagyon jó választás lehet, ha az AI-nak:

- aktuális adatokat kell lekérnie,
- CRM-et kell használnia,
- rendeléseket kell ellenőriznie,
- számlázási adatokat kell lekérnie,
- naptárat kell kezelnie,
- API-kat kell összekötnie,
- fájlokat kell feldolgoznia,
- számításokat kell végeznie,
- üzleti folyamat több lépését kell koordinálnia.

Kevésbé érdekes, ha az AI-nak csak szöveget kell generálnia.

---

## A legfontosabb gondolat

A function calling önmagában nem tesz egy chatbotot agentté.

De megadja az egyik legfontosabb képességet:

**az AI a szövegen kívül műveleteket is kezdeményezhet.**

A folyamat:

```text
Megérti a kérést
↓
Kiválaszt egy toolt
↓
Argumentumokat generál
↓
Backend validál
↓
Tool lefut
↓
Eredmény visszakerül
↓
AI értelmezi
↓
Következő lépés
↓
Válasz
```text

És ha több tool áll rendelkezésére, az AI egyre összetettebb munkafolyamatokat is koordinálhat.

De a legfontosabb szabály nem változik:

> **Az AI dönthet arról, mit szeretne megpróbálni. A rendszered döntse el, hogy azt valóban szabad-e végrehajtani.**

Ez választja el az érdekes demót egy biztonságosan használható üzleti AI-rendszertől.

**softwaredevelopment.hu — AI-agentek, API-integrációk, MCP és egyedi üzleti automatizálás vállalkozásoknak.**

---

## Források

- OpenAI: [Developer quickstart – Extend the model with tools](https://platform.openai.com/docs/quickstart)
- OpenAI: [Responses API reference](https://platform.openai.com/docs/api-reference/responses)
- Anthropic: [Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)
- Google AI for Developers: [Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling)
- Google AI for Developers: [Using tools with Gemini API](https://ai.google.dev/gemini-api/docs/tools)
- Google AI for Developers: [Function calling – Generate Content API](https://ai.google.dev/gemini-api/docs/generate-content/function-calling)
- Microsoft Learn: [How to use function calling with Microsoft Foundry Models](https://learn.microsoft.com/en-sg/azure/ai-foundry/openai/how-to/function-calling)
- Microsoft Learn: [Fine-tuning and tool calling](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/fine-tuning-functions)
- Hugging Face: [Tool use](https://huggingface.co/docs/transformers/main//chat_extras)
- Hugging Face: [Expanding Chat Templates with Tools and Documents](https://huggingface.co/docs/transformers/main/chat_template_tools_and_documents)
- Model Context Protocol: [Server overview](https://modelcontextprotocol.io/specification/draft/server/index)
- Model Context Protocol: [The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- Model Context Protocol: [Tool Annotations as Risk Vocabulary](https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/)
- arXiv: [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761)
