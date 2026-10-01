---
title: "AI Agent – Mi az, és miben különbözik egy chatbottól?"
description: "Az AI agent nem csak válaszol: gondolkodik, eszközöket használ, emlékszik és lépéseket hajt végre egy cél eléréséhez."
tags: [ai-agent, chatbot, ai, automatizáció, üzlet]
date: 2026-10-26 08:00
image: /articles/what-is-an-ai-agent/share-hu.jpg
---

## A chatbot válaszol. Egy AI agent feladatot old meg.

A chatbot és az AI agent kívülről hasonlíthat. Mindkettővel beszélgethetsz természetes nyelven, mindkettő mögött lehet egy nagy nyelvi modell, és mindkettő képes összetett kérdésekre válaszolni.

A lényeges különbség azonban nem az, hogy melyik „okosabb”.

**A chatbot elsősorban kommunikál. Az agent egy cél eléréséhez döntéseket hoz és műveleteket hajt végre.**

Egy hagyományos chatbot például válaszolhat erre:

> „Mikor érkezik meg a rendelésem?”

Egy agent viszont képes lehet arra, hogy:

- megkeresse a rendelést az adatbázisban,
- lekérdezze a futárszolgálat rendszerét,
- ellenőrizze a szállítási státuszt,
- ha probléma van, új szállítást indítson,
- majd értesítse az ügyfelet.

Ez már nem egyszerű kérdés-válasz.

---

## Mi alkot egy AI agentet?

Egy agentet nem önmagában az LLM tesz agentté. Több komponens együttese adja a működését.

A Google Cloud az agentek fő elemei között a modellt, a groundingot, a toolokat, a memória- és adatarchitektúrát, valamint az orchestrationt emeli ki. Az OpenAI hasonlóan a modellt, az instrukciókat és a toolokat tekinti az alapvető építőelemeknek. ([Google Cloud](https://cloud.google.com/resources/core-concepts-ai-agents), [OpenAI](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/))

### 1. Model – az „agy”

Az LLM értelmezi a feladatot és eldönti, hogy mi legyen a következő lépés.

Például:

> „Ellenőrizd, hogy van-e készleten 20 darab ebből a termékből, és ha igen, készíts ajánlatot az ügyfélnek.”

A modell felismeri, hogy ehhez nem elég egy szöveges választ írni.

---

### 2. Reasoning – döntés a következő lépésről

Az agentnek valamilyen módon el kell döntenie, mit csináljon először.

Például:

```text
Feladat
  ↓
Meg kell keresni a terméket
  ↓
Készlet ellenőrzése
  ↓
Ár kiszámítása
  ↓
Ajánlat létrehozása
  ↓
Emberi jóváhagyás?
  ↓
Ajánlat elküldése
```

Nem feltétlenül egy előre megírt, merev workflow minden egyes lépése határozza meg ezt. Az agent képes lehet a rendelkezésére álló információ és eszközök alapján kiválasztani a következő műveletet.

Ez az egyik legfontosabb különbség egy klasszikus automatizációhoz képest.

---

### 3. Tools – kezek a külvilág felé

Az LLM önmagában nem tud belépni a vállalat CRM rendszerébe vagy elküldeni egy e-mailt.

Ehhez toolokra van szüksége.

Egy agent tooljai lehetnek például:

- CRM lekérdezés,
- adatbázis,
- számlázórendszer,
- e-mail küldés,
- naptár,
- webes keresés,
- fájlok olvasása,
- webshop API,
- belső vállalati rendszer.

Az OpenAI agent útmutatója a toolokat többek között adatlekérdezésre, külső rendszerek módosítására és más agentek bevonására használható képességekként írja le. ([OpenAI](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/))

**Ez választja el igazán a „beszélgető AI-t” a cselekvő AI-tól.**

---

## 4. Memory – mit tud megjegyezni?

Egy agent működéséhez nem mindig kell hosszú távú memória, de összetettebb rendszereknél nagyon hasznos lehet.

Érdemes három dolgot különválasztani:

**Context:** amit az agent az aktuális feladat során lát.

**Working memory:** az adott folyamat aktuális állapota.

**Long-term memory:** korábban eltárolt, később is felhasználható információ.

Például egy értékesítési agent tudhatja, hogy egy ügyfél:

- milyen termékeket vásárolt korábban,
- milyen preferenciái vannak,
- milyen ajánlatokat kapott,
- milyen státuszban van az aktuális üzlet.

A memória azonban nem azt jelenti, hogy mindent korlátlanul el kell tárolni. Az agent architektúrájának azt is meg kell határoznia, **milyen információt, milyen ideig és milyen célból tárolunk.**

---

## 5. Az action loop – ettől lesz agent

Az agent egyik legfontosabb tulajdonsága az ismétlődő döntési ciklus.

Az OpenAI jelenlegi agent dokumentációja ezt lényegében úgy írja le, hogy a rendszer meghívja a modellt, megvizsgálja annak eredményét, végrehajtja a tool hívásokat, majd folytatja a ciklust, amíg el nem jut egy valódi befejezési ponthoz. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/running-agents))

Egyszerűsítve:

```text
Feladat
   ↓
Model
   ↓
Döntés
   ↓
Tool használata
   ↓
Tool eredménye
   ↓
Model újraértékeli a helyzetet
   ↓
Újabb tool?
   ├── Igen → vissza a toolhoz
   └── Nem → eredmény
```

Ez azért fontos, mert egy agent nem feltétlenül tudja előre, hány lépésre lesz szüksége.

Egy egyszerű kérdéshez lehet, hogy egyetlen modellhívás elég.

Egy összetett üzleti feladathoz viszont tíz vagy akár több különböző műveletre is szükség lehet.

---

## Chatbot vs. AI agent

A különbséget érdemes egy konkrét példán keresztül nézni.

| Chatbot | AI agent |
|---|---|
| Válaszol a kérdésre | Feladatot hajt végre |
| Főként szöveget generál | Külső rendszereket is használ |
| Egy beszélgetési kör is elég lehet | Több lépésen keresztül dolgozhat |
| Korlátozott állapotot kezel | Állapotot és memóriát is használhat |
| „Így kellene csinálni” | „Megcsináltam” |
| Ember végzi a műveletet | Az agent is végrehajthat műveleteket |

A határ azonban nem mindig éles.

Egy chatbot mögött is lehet RAG, function calling vagy API-integráció. **Nem minden toolt használó chatbot lesz automatikusan teljes értékű agent.**

Az egyik hasznos kérdés:

> „Az AI csak választ generál, vagy önállóan vezérli a feladat végrehajtását?”

Ha az utóbbi történik, már agent-szerű rendszerről beszélünk.

---

## Egy konkrét üzleti példa: ajánlatkészítő agent

Nézzünk egy egyszerű B2B folyamatot.

Egy cég naponta több érdeklődőtől kap e-mailt:

> „Szeretnénk 50 darabot rendelni ebből a termékből. Mennyi lenne az ára és mikorra tudnák szállítani?”

Egy hagyományos chatbot megírhatná az e-mailre a választ.

Egy agent ennél tovább mehet.

### 1. Beérkezik az e-mail

Az agent elolvassa az üzenetet, és felismeri:

- milyen termékről van szó,
- milyen mennyiséget kérnek,
- milyen ügyfélről van szó,
- ajánlatkérésről van szó.

### 2. Megkeresi az ügyfelet

A CRM tool segítségével lekéri az ügyfél adatait.

Megnézheti például:

- korábbi rendeléseket,
- ügyfélkategóriát,
- egyedi árakat,
- fizetési feltételeket.

### 3. Ellenőrzi a készletet

Ezután meghívja a készletkezelő rendszer API-ját.

```text
Termék: X
Kért mennyiség: 50
Készlet: 72
→ teljesíthető
```

### 4. Kiszámítja az ajánlatot

Az agent az ügyfélhez tartozó árlista alapján kiszámolja az árat, majd figyelembe veszi a mennyiségi kedvezményt és a szállítási költséget.

### 5. Elkészíti az ajánlatot

A rendszer létrehozza az ajánlat dokumentumát.

De itt már érdemes megállni egy pillanatra.

**Nem biztos, hogy az agentnek joga kell legyen azonnal elküldeni az ajánlatot.**

Lehet például egy szabály:

```text
500 000 Ft alatt → automatikus küldés
500 000 Ft felett → vezetői jóváhagyás
```

### 6. Emberi jóváhagyás

Ha az ajánlat meghaladja a határt, az agent megáll.

A vezető megkapja:

> „Elkészítettem az ajánlatot. Az érték 780 000 Ft. Jóváhagyod a kiküldést?”

A vezető jóváhagyja.

### 7. Az agent végrehajtja a műveletet

Az agent elküldi az ajánlatot az ügyfélnek, majd frissíti a CRM-et.

A teljes folyamat így néz ki:

```text
E-mail
  ↓
AI értelmezés
  ↓
CRM lekérdezés
  ↓
Készlet ellenőrzése
  ↓
Árkalkuláció
  ↓
Ajánlat generálása
  ↓
Kockázati szabály
  ↓
Emberi jóváhagyás
  ↓
E-mail küldés
  ↓
CRM frissítés
```

Ez már valódi üzleti folyamat automatizálása.

---

## Miért lehet ez hasznos egy vállalkozásnak?

Az agentek ott érdekesek, ahol nem egyetlen lépést kell automatizálni, hanem **több különböző rendszerből származó információt kell összekapcsolni egy cél eléréséhez.**

Ilyen lehet például:

- ügyfélszolgálati ügyek kezelése,
- ajánlatkészítés,
- számlák előkészítése,
- leadek kvalifikálása,
- riportok összeállítása,
- belső dokumentumok keresése,
- időpont-egyeztetés,
- fejlesztői feladatok előkészítése.

Nem feltétlenül az a cél, hogy „egy AI dolgozzon minden helyettünk”.

Sok esetben jobb megközelítés egy szűk feladatkörű agent, amely jól definiált eszközökhöz fér hozzá.

---

## Az agentek kockázatai

Minél több mindent tud egy agent megtenni, annál nagyobb a hibák következménye.

Egy rosszul generált szöveges válasz kellemetlen lehet.

Egy rosszul végrehajtott API-hívás viszont már pénzügyi vagy üzleti kárt is okozhat.

### Prompt injection

Egy külső dokumentum vagy e-mail olyan utasítást tartalmazhat, amely megpróbálja félrevezetni az agentet.

Ez különösen veszélyes akkor, ha az agentnek írási vagy pénzügyi jogosultságai is vannak.

### Túlzott jogosultság

Egy agentnek nem kell hozzáférnie mindenhez.

Ha csak rendeléseket olvashat, ne tudjon számlát törölni.

Ha ajánlatot készíthet, ne feltétlenül tudjon pénzt utalni.

**Az agent jogosultságait ugyanúgy érdemes a legkisebb szükséges jogosultság elvére építeni, mint bármely más szoftverrendszernél.**

### Hibás döntési lánc

Az agent több lépést is egymásra építhet. Ha az első lépés hibás, a későbbi lépések is erre épülhetnek.

Ezért fontos a naplózás, a tesztelés, a korlátok és a jól meghatározott hibakezelés.

---

## Kell-e ember az agent mögé?

A válasz sok esetben: igen.

Az emberi ellenőrzés nem feltétlenül jelenti azt, hogy minden egyes lépést egy embernek kell jóváhagynia.

Jobb lehet kockázat alapján felosztani a műveleteket:

```text
Alacsony kockázat
→ automatikus végrehajtás

Közepes kockázat
→ extra ellenőrzés

Magas kockázat
→ emberi jóváhagyás
```

Az OpenAI agent dokumentációja is külön kezeli a guardraileket és a human-in-the-loop jóváhagyást, különösen érzékeny vagy visszafordíthatatlan műveleteknél. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals))

A jó agent tehát nem az, amelyik mindenáron önállóan dolgozik.

**A jó agent tudja azt is, mikor kell megállnia és embertől segítséget kérnie.**

---

## Chatbotból agent?

A legtöbb vállalkozásnak nem az a következő lépése, hogy azonnal felépít egy teljesen autonóm AI rendszert.

Érdemes először kiválasztani egy konkrét, ismétlődő folyamatot.

Például:

```text
1. Ügyfél kérdése
2. Információk összegyűjtése
3. Válasz előkészítése
4. Ember ellenőrzi
5. Küldés
```

Ha ez stabilan működik, lehet továbblépni:

```text
1. Ügyfél kérdése
2. Agent adatot keres
3. Agent dönt
4. Agent elkészíti a választ
5. Alacsony kockázat → automatikus küldés
6. Magas kockázat → emberi jóváhagyás
```

**Az agent nem egyszerűen egy „okosabb chatbot”. Inkább egy AI-val vezérelt szoftveres munkafolyamat, amely képes információt gyűjteni, döntéseket hozni és műveleteket végrehajtani.**

A valódi üzleti érték pedig nem abból származik, hogy egy rendszer agentnek nevezi magát, hanem abból, hogy egy jól kiválasztott folyamatot kevesebb manuális munkával, megfelelő kontroll mellett képes végigvinni.

## Hol lenne értelme egy AI agentnek a vállalkozásodban?

Ha van a cégedben olyan folyamat, amely több rendszer között mozog, sok ismétlődő döntést tartalmaz, és rendszeresen emberi időt igényel, az jó kiindulópont lehet egy agent számára.

A következő kérdés már nem az, hogy „kell-e AI”, hanem az, hogy **melyik konkrét feladatnál tud valódi munkát elvégezni úgy, hogy közben a kontroll is megmaradjon.**

**softwaredevelopment.hu — AI, automatizáció és egyedi szoftvermegoldások vállalkozásoknak.**

---

## Források

- OpenAI: [A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- OpenAI: [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)
- OpenAI: [Agent definitions](https://developers.openai.com/api/docs/guides/agents/define-agents)
- OpenAI: [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- OpenAI: [Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety)
- Google Cloud: [Core concepts of AI agents](https://cloud.google.com/resources/core-concepts-ai-agents)
- Google Cloud: [What are AI agents?](https://cloud.google.com/discover/what-are-ai-agents)
