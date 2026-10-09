---
title: "Function calling a tool use: ako môže AI používať API a databázy?"
description: "Ako môžu AI systémy používať API, databázy a externé nástroje? Function calling a tool use na praktickom príklade, vrátane bezpečnostných zásad."
tags: [function-calling, tool-use, ai-agent, api, mcp]
date: 2026-11-02 08:00
image: /articles/function-calling-and-tool-use/share.jpg
---

## Čo sa stane, keď AI dokáže viac než len odpovedať?

Tradičný chatbot funguje zhruba takto:

```text
Používateľ
↓
AI
↓
Textová odpoveď
```

Opýtate sa:

> „Aká je celková hodnota tejto objednávky?“

AI vám môže odpovedať.

Odkiaľ by však tú informáciu vzala?

Ak sú dáta uložené v databáze, jazykový model k nim automaticky nemá prístup.

Tu prichádza na rad **function calling** a širší pojem **tool use**.

Model môže rozhodnúť, že potrebuje použiť dostupný nástroj, pripraviť preň štruktúrované argumenty a samotnú operáciu potom nechať vykonať aplikáciu. Dokumentácia Google Gemini toto rozdelenie výslovne opisuje: model vyberie funkciu a argumenty, za vykonanie funkcie zodpovedá aplikácia. [Google – Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling)

**Toto je jeden z kľúčových krokov od chatbota k skutočnému AI agentovi.**

---

## Čo je function calling?

Najjednoduchším príkladom je funkcia na zistenie počasia.

AI dáte k dispozícii:

```text
get_weather(city)
```

Používateľ sa opýta:

> „Aké je počasie v Budapešti?“

Model sa nemusí pokúšať hádať.

Môže si vyžiadať:

```text
get_weather({
  "city": "Budapest"
})
```

Váš backend funkciu vykoná.

API vráti napríklad:

```text
{
  "temperature": 18,
  "condition": "rain"
}
```

Tento výsledok pošlete späť AI, ktorá z neho pripraví odpoveď pre používateľa.

```text
Používateľ
↓
AI
↓
"get_weather Budapest"
↓
Backend
↓
Weather API
↓
18 °C, dážď
↓
AI
↓
"V Budapešti je momentálne 18 °C a prší."
```

**Model nemusí API volať sám. Volanie nástroja si vyžiada; vykoná ho vaša aplikácia.**

Podobne aj OpenAI Responses API podporuje prepojenie modelov s externými dátami a funkciami prostredníctvom nástrojov vrátane function callingu a vzdialeného MCP. [OpenAI – Developer quickstart](https://platform.openai.com/docs/quickstart)

---

## Aký je rozdiel medzi function calling a tool use?

Tieto dva pojmy sa často používajú zameniteľne.

**Function calling** zvyčajne znamená, že model si môže vyžiadať štruktúrované volanie funkcie.

Napríklad:

```text
get_customer(id)
create_invoice(customer_id, amount)
send_email(to, subject, body)
```

**Tool use** je širší pojem.

Nástrojom môže byť:

- API,
- databázový dotaz,
- vyhľadávač,
- kalkulačka,
- súborový systém,
- prostredie na spúšťanie kódu,
- prehliadač,
- iný AI systém,
- funkcia sprístupnená cez MCP server.

Hugging Face opisuje tool use ako možnosť, aby jazykové modely pri generovaní odpovede volali externé funkcie. [Hugging Face – Tool use](https://huggingface.co/docs/transformers/main//chat_extras)

**Function calling je teda jednou z bežných implementácií tool use.**

---

## AI v skutočnosti robí rozhodnutie

Predstavte si, že AI dáte tri nástroje:

```text
get_customer
get_order
create_invoice
```

Používateľ povie:

> „Vyhľadaj objednávku 12345 a povedz mi, komu patrí.“

AI nepotrebuje všetky tri.

Môže si vyžiadať:

```text
get_order(12345)
```

Výsledok môže obsahovať:

```text
customer_id = 678
```

AI si potom môže vyžiadať:

```text
get_customer(678)
```

A nakoniec odpovie:

> „Objednávka 12345 patrí Petrovi Horváthovi.“

To je už viacstupňový proces.

Dokumentácia Gemini podporuje sekvenčné aj paralelné workflow volania funkcií. [Google – Function calling](https://ai.google.dev/gemini-api/docs/function-calling)

---

## Jednoduchý praktický príklad

Predstavte si e-shop.

Databáza obsahuje:

```text
customers
orders
products
```

A máte AI asistenta.

Aplikácia sprístupňuje:

```text
get_order_status(order_id)
```

Používateľ sa opýta:

> „Kde je moja objednávka 8421?“

Proces môže vyzerať takto:

```text
1. Používateľ:
   "Kde je moja objednávka 8421?"

2. AI:
   get_order_status(8421)

3. Backend:
   SELECT status
   FROM orders
   WHERE id = 8421

4. Databáza:
   SHIPPED

5. Backend → AI:
   {"status": "shipped"}

6. AI:
   "Vaša objednávka už bola odovzdaná kuriérovi."
```

Dôležité je, že **AI nepotrebuje priamy prístup k databáze**.

Čo smie robiť, rozhoduje váš backend.

---

## Prečo AI jednoducho nedať databázu?

Pretože toto:

```text
AI
↓
Celá databáza
```

by bola v mnohých firemných systémoch zlá architektúra.

Kontrolovanejší návrh vyzerá takto:

```text
AI
↓
get_order_status
↓
Backend
↓
Autorizovaný dotaz
↓
Databáza
```

Model dostane prístup len k tomu, čo nástroj sprístupní.

Ak nástroj vracia len stav objednávky, AI nepotrebuje prístup k:

- heslám,
- bankovým údajom,
- iným zákazníkom,
- interným tabuľkám,
- administratívnym údajom.

**Nástroj je kontrolovanou bránou medzi AI systémom a vašimi firemnými systémami.**

---

## Na definíciách nástrojov záleží

Model potrebuje nejakým spôsobom pochopiť, aké nástroje má k dispozícii.

Napríklad:

```text
Názov:
get_order_status

Popis:
Vráti aktuálny stav objednávky zákazníka.

Parametre:
order_id: integer
```

Model potom môže tieto informácie použiť pri rozhodovaní, kedy je nástroj relevantný.

Funkčné nástroje OpenAI používajú názov, popis a definíciu parametrov v štýle JSON Schema. API podporuje aj striktné vynucovanie schémy pre argumenty funkcií. [OpenAI – Responses API reference](https://platform.openai.com/docs/api-reference/responses)

Dokumentácia Google podobne zdôrazňuje dôležitosť názvu funkcie, jej účelu, parametrov a ich popisov. [Google – Function calling](https://ai.google.dev/gemini-api/docs/generate-content/function-calling)

**Popis nástroja nie je len dokumentácia. Je súčasťou informácií, podľa ktorých model rozhoduje, či a ako nástroj použije.**

---

## Model nie je vykonávacia vrstva

Toto je dôležité rozlíšenie.

Model si môže vyžiadať:

```text
create_invoice(
    customer_id=123,
    amount=250000
)
```

To neznamená, že faktúra bola vytvorená.

Vaša aplikácia stále musí:

1. overiť argumenty,
2. skontrolovať oprávnenia,
3. vykonať operáciu,
4. ošetriť chyby,
5. vrátiť výsledok.

Oficiálna dokumentácia Google výslovne uvádza, že vykonanie vlastného kódu funkcie je zodpovednosťou aplikácie. [Google – Function calling](https://ai.google.dev/gemini-api/docs/function-calling)

Hugging Face opisuje rovnakú slučku: model vygeneruje volanie nástroja, aplikácia vykoná funkciu a výsledok sa pridá späť do konverzácie. [Hugging Face – Tool use](https://huggingface.co/docs/transformers/main//chat_extras)

---

## Celá slučka AI a nástrojov

Agentový systém často funguje takto:

```text
Používateľ
↓
AI
↓
Potrebuje externé dáta?
↓
Áno
↓
Výber nástroja
↓
Vygenerovanie argumentov
↓
Backend overí
↓
Vykonanie nástroja
↓
Vrátenie výsledku
↓
AI
↓
Dosť informácií?
↓
Nie → ďalší nástroj
↓
Áno
↓
Finálna odpoveď
```

Táto slučka môže prebehnúť viackrát.

A práve preto sú agenti zaujímaví.

**AI negeneruje len odpoveď; dokáže aj vybrať ďalšiu operáciu potrebnú na dokončenie úlohy.**

---

## Príklad: agent zákazníckej podpory

Predstavte si e-shop s AI asistentom.

Dostupné nástroje:

```text
search_orders
get_order
get_product
check_stock
create_return_request
```

Používateľ sa opýta:

> „Chcem vrátiť objednávku 8421. Je produkt ešte na sklade?“

AI môže vykonať:

```text
get_order(8421)
↓
get_product(product_id)
↓
check_stock(product_id)
↓
Odpoveď AI
```

Potom používateľ povie:

> „Spusti aj vrátenie.“

Teraz má systém nástroj, ktorý vykonáva akciu:

```text
create_return_request(order_id=8421)
```

Tu začína byť bezpečnosť obzvlášť dôležitá.

---

## Nie všetky nástroje sú rovnako rizikové

Volanie `get_weather` je zvyčajne len na čítanie.

Volanie `create_invoice` mení dáta.

Volanie `delete_customer` má oveľa vážnejšie následky.

Je užitočné uvažovať aspoň v troch kategóriách:

```text
READ
↓
Získanie informácií

WRITE
↓
Zmena informácií

DESTRUCTIVE
↓
Mazanie / finančná / nevratná akcia
```

MCP definuje nástroje ako vykonateľné funkcie, ktoré modely môžu používať na získavanie informácií alebo vykonávanie akcií, a ekosystém MCP sa zaoberá aj anotáciami, ktoré opisujú správanie a riziko nástrojov. [Model Context Protocol – Server overview](https://modelcontextprotocol.io/specification/draft/server/index) [MCP – Tool Annotations as Risk Vocabulary](https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/)

**Čím väčší dosah má nástroj, tým silnejšie kontroly by ho mali obklopovať.**

---

## Least privilege: dajte mu len to, čo potrebuje

Toto je jedna z najdôležitejších bezpečnostných zásad.

Ak AI potrebuje len stav objednávky, nedávajte jej plný prístup k databáze.

Nie:

```text
AI
↓
DB_ADMIN
```

Ale:

```text
AI
↓
get_order_status
↓
Len potrebné dáta
```

To isté platí pre API.

Ak agent potrebuje z CRM len čítať, nedávajte mu oprávnenie mazať záznamy.

Ak má spravovať údaje jedného zákazníka, nedávajte mu prístup k celej firme.

**Oprávnenia AI by mali byť také úzke, ako je to prakticky možné.**

---

## Validácia je povinná

Predpokladajme, že máte:

```text
refund_order(order_id, amount)
```

AI vygeneruje:

```text
refund_order(
    order_id=8421,
    amount=999999999
)
```

Váš backend by takúto požiadavku nikdy nemal jednoducho vykonať.

Mal by overiť:

- či objednávka existuje,
- či je používateľ oprávnený,
- či je táto suma naozaj vratná,
- či objednávka spĺňa podmienky,
- či už vrátenie peňazí neprebehlo.

Argumenty nástrojov sú preto **nedôveryhodný vstup, aj keď ich vygeneroval AI model.**

```text
Výstup AI
↓
Validácia schémy
↓
Biznis validácia
↓
Autorizácia
↓
Vykonanie
```

---

## Pravidlo potvrdenia

Niektoré operácie by sa nemali diať automaticky.

Napríklad:

- prevod peňazí,
- vystavenie faktúry,
- zmazanie objednávky,
- odoslanie e-mailu,
- prijatie zmluvy,
- zmazanie používateľa.

Systém sa namiesto toho môže opýtať:

> „Chystáte sa vrátiť 3 100 € za objednávku 8421. Chcete to schváliť?“

Až potom:

```text
USER CONFIRMED
↓
refund_order(...)
```

Dokumentácia Google k function callingu výslovne odporúča pri akciách s významnými následkami overiť ich s používateľom ešte pred vykonaním. [Google – Function calling](https://ai.google.dev/gemini-api/docs/generate-content/function-calling)

---

## Čo ak AI vyberie nesprávny nástroj?

Môže sa to stať.

Používateľ povie:

> „Zmaž moju starú objednávku.“

Model môže vybrať:

```text
delete_order
```

Ako však vie:

- ktorú objednávku?
- či používateľ naozaj chce zmazanie?
- či má používateľ oprávnenie?
- či je zmazanie povolené?

Preto agent nemôže byť jedinou bezpečnostnou vrstvou.

**Váš backend musí všetko overiť aj potom, čo AI „rozhodla“.**

---

## Používanie API s AI

Jedným z najpraktickejších využití function callingu je prepojenie existujúcich API.

Firma môže mať:

- CRM,
- fakturačný systém,
- e-shop,
- skladový systém,
- kalendár.

Nad ne môžete postaviť AI vrstvu.

```text
                 ┌── CRM
                 │
AI agent ─ Tools ├── Fakturácia
                 │
                 ├── E-shop
                 │
                 ├── Sklad
                 │
                 └── Kalendár
```

Používateľ sa potom môže opýtať:

> „Skontroluj, či máme na sklade 20 kusov, a ak áno, zarezervuj ich.“

Agent najprv skontroluje sklad.

Ak je k dispozícii dosť kusov, môže zavolať ďalší nástroj.

Toto už nie je len chatbot.

**Stáva sa z neho rozhranie v prirodzenom jazyku k vašim existujúcim firemným systémom.**

---

## A čo databázy?

SQL nemusíte nevyhnutne generovať pomocou AI.

Kontrolovaný nástroj je často bezpečnejší:

```text
find_customer_orders(
    customer_id
)
```

než:

```text
execute_sql(
    "SELECT * FROM ..."
)
```

Pri prvom prístupe presne určíte, čo môže model dotazovať.

Druhý mu dáva podstatne viac voľnosti.

Pre SQL generované pomocou AI existujú legitímne prípady použitia, najmä v kontrolovaných analytických prostrediach, kde sa dotazy validujú a spúšťajú nad obmedzeným zdrojom dát len na čítanie.

Pri produkčnej firemnej databáze však platí:

**nedávajte LLM neobmedzený prístup k SQL len preto, že je to pohodlné.**

---

## Volanie nástrojov a MCP

Keď začnete prepájať viacero AI systémov s viacerými nástrojmi, začína byť relevantné **MCP**, teda Model Context Protocol.

MCP je protokol na prepojenie AI aplikácií s externým kontextom, zdrojmi a nástrojmi.

V MCP sú nástroje vykonateľné funkcie, ktoré AI aplikácie môžu používať na získavanie informácií alebo vykonávanie akcií. [Model Context Protocol – Server overview](https://modelcontextprotocol.io/specification/draft/server/index)

Zjednodušene:

```text
AI aplikácia
↓
MCP klient
↓
MCP server
↓
Nástroje
↓
CRM / Databáza / API / Súbory
```

MCP nie je samotná AI.

Nie je to ani databáza.

**Je to štandardizovaná komunikačná vrstva, cez ktorú môžu AI aplikácie pristupovať k nástrojom a ďalšiemu kontextu.**

---

## Prečo je to dôležité pre firmy?

Pretože nemusíte pre každú AI aplikáciu nevyhnutne budovať úplne samostatnú integráciu.

Firma si môže vytvoriť vlastný MCP server:

```text
Firemný MCP server

Nástroje:
- search_customer
- get_order
- check_stock
- create_invoice
- create_support_ticket
```

Rôzni AI klienti potom môžu tieto nástroje používať s príslušnými oprávneniami.

Špecifikácia MCP z 28. júla 2026 obsahuje okrem iných zmien protokolu aj mechanizmy týkajúce sa volaní nástrojov, smerovania a autorizácie. [Model Context Protocol – 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/)

To je jeden z dôvodov, prečo sa MCP stalo dôležitou súčasťou diskusie o agentových systémoch.

---

## Tool use nie je mágia

Je dôležité vyjasniť si jeden omyl.

AI sa jednoducho „neprihlási do vášho firemného systému“ a nezačne prechádzať databázu.

Vývojári stále musia vytvoriť:

- samotný nástroj,
- jeho parametre,
- oprávnenia,
- validáciu,
- vykonávaciu logiku,
- ošetrenie chýb,
- logovanie.

AI potom môže **rozhodnúť, kedy a s akými argumentmi si dostupný nástroj vyžiada.**

Výskum Toolformer z roku 2023 skúmal, ako sa jazykové modely môžu naučiť používať externé API – vrátane rozhodovania, kedy ich volať, aké argumenty im odovzdať a ako zapracovať vrátené výsledky. [arXiv – Toolformer](https://arxiv.org/abs/2302.04761)

---

## Dobrá architektúra agenta

Jednoduchý firemný systém môže vyzerať takto:

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
                   Bezpečnostná vrstva
                           ↓
                    Firemný backend
```

Bezpečnostná vrstva môže zabezpečovať:

- autentifikáciu,
- autorizáciu,
- validáciu vstupov,
- rate limiting,
- auditné logovanie,
- potvrdenie,
- limity transakcií.

**AI by mala byť vrstvou rozhodovania a koordinácie, nie jedinou bezpečnostnou vrstvou.**

---

## Kedy použiť tool use?

Je obzvlášť užitočný, keď AI potrebuje:

- získavať aktuálne informácie,
- pracovať s CRM,
- kontrolovať objednávky,
- pristupovať k fakturačným údajom,
- pracovať s kalendármi,
- prepájať API,
- spracovávať súbory,
- vykonávať výpočty,
- koordinovať viacstupňové firemné procesy.

Oveľa menej zaujímavý je, keď AI potrebuje len generovať text.

---

## Kľúčová myšlienka

Function calling z chatbota automaticky nespraví agenta.

Poskytuje však jednu z najdôležitejších schopností:

**AI môže iniciovať akcie nad rámec generovania textu.**

Proces vyzerá takto:

```text
Pochopenie požiadavky
↓
Výber nástroja
↓
Vygenerovanie argumentov
↓
Backend overí
↓
Nástroj sa vykoná
↓
Vrátenie výsledku
↓
AI ho interpretuje
↓
Ďalší krok
↓
Odpoveď
```

S viacerými dostupnými nástrojmi dokáže AI systém koordinovať čoraz zložitejšie workflow.

Jedno pravidlo však zostáva zásadné:

> **AI môže rozhodnúť, čo chce skúsiť. Či to naozaj smie urobiť, musí rozhodnúť váš systém.**

To je rozdiel medzi zaujímavým demom a firemným AI systémom, ktorý sa dá bezpečne používať.

**softwaredevelopment.hu — AI agenti, API integrácie, MCP a automatizácia na mieru pre firmy.**

---

## Zdroje

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
