---
title: "Reasoning modellek: mit jelent, hogy egy AI „gondolkodik”?"
description: "Mi történik, amikor egy AI nem csak válaszol, hanem több számítást használ a probléma megoldásához? És mikor éri meg ezt választani?"
tags: [ai, reasoning, llm, inference, automatizalas]
date: 2026-10-21 08:00
image: /articles/reasoning-models/share-hu.jpg
---

## Az AI tényleg „gondolkodik”?

Az utóbbi időben egyre többet hallani reasoning modellekről, vagyis olyan AI-modellekről, amelyek a válaszadás előtt több számítást fordítanak egy probléma megoldására.

Ez könnyen félrevezető lehet. A „gondolkodik” szó ugyanis emberi tulajdonságot sugall.

**Egy reasoning modell nem úgy gondolkodik, mint egy ember.** Inkább arról van szó, hogy a rendszer az inference, vagyis a válasz előállítása közben nagyobb számítási erőforrást használhat fel a probléma felbontására, alternatívák vizsgálatára, tervezésre vagy ellenőrzésre.

Az OpenAI például a reasoning modelleket olyan modellekként írja le, amelyek belső reasoning tokeneket használnak a válasz előtt, és ez segíthet összetett, több lépésből álló problémák, kódolási feladatok és agentic workflow-k megoldásában. ([developers.openai.com](https://developers.openai.com/api/docs/guides/reasoning))

---

## Mi történik egy hagyományos LLM-nél?

Egy hagyományos LLM működésének egyik egyszerűsített modellje:

```text
kérdés
   ↓
tokenizálás
   ↓
LLM
   ↓
következő token
   ↓
következő token
   ↓
következő token
   ↓
válasz
```

A modell a rendelkezésére álló kontextus alapján valószínűsíti, hogy milyen tokenekből érdemes felépíteni a választ.

Ez nem azt jelenti, hogy minden kérdésre „egy lépésben” válaszol. Egy hosszú válasz természetesen sok tokenből állhat.

A fontos különbség inkább az, hogy **egy reasoning modellnél a rendszer tudatosan több inference-time compute-ot, vagyis több számítási kapacitást fordíthat a feladat megoldására.**

Ez különösen akkor hasznos, amikor a feladat nem egyszerű információ-visszaadás, hanem több egymásra épülő lépést igényel.

---

## Mi az inference-time compute?

A modell működését két nagy szakaszra lehet leegyszerűsíteni.

Az első a training, amikor a modellt hatalmas mennyiségű adaton tanítják.

A második az inference, amikor már egy konkrét felhasználói kérdésre kell választ adnia.

Hagyományosan a legtöbb hangsúly a training során felhasznált számítási kapacitáson volt. A reasoning modellek egyik fontos újítása, hogy **a számítási kapacitás egy részét a válaszadás pillanatára is áthelyezik.**

Ezt nevezik inference-time compute-nak vagy test-time compute-nak.

Egyszerű példával:

```text
Egyszerű kérdés
→ kevés számítás
→ gyors válasz

Összetett probléma
→ több számítás
→ több ellenőrzés / tervezés
→ lassabb válasz
→ nagyobb esély a helyes megoldásra
```

A kutatásokban a test-time scaling kifejezést is használják arra, amikor a rendszer több számítás felhasználásával próbál jobb eredményt elérni. A módszer nem egyetlen technikát jelenthet: különböző megközelítések léteznek például több megoldás előállítására, azok összevetésére vagy részleges megoldások keresésére. ([arxiv.org](https://arxiv.org/abs/2608.04001))

---

## Miért jobb néha, ha az AI „többet dolgozik”?

Vegyünk egy egyszerű üzleti példát.

Ha azt kérdezed:

> „Írj egy rövid bemutatkozó szöveget a cégemnek.”

ehhez valószínűleg nincs szükség hosszú reasoning folyamatra.

Ha viszont ezt kérdezed:

> „Elemezd a következő három üzleti folyamatunkat, keresd meg a szűk keresztmetszeteket, számold ki a várható időmegtakarítást, majd javasolj automatizálási sorrendet.”

már egészen más a feladat.

A modellnek több dolgot kell összekapcsolnia:

1. megérteni a bemenetet,
2. azonosítani a problémákat,
3. felállítani egy elemzési struktúrát,
4. számításokat végezni,
5. összevetni az eredményeket,
6. következtetést levonni.

**Minél több egymásra épülő lépést tartalmaz egy feladat, annál értékesebb lehet az inference-time compute.**

Ez nem garancia arra, hogy a reasoning modell mindig helyes lesz. A több számítás nem egyenlő automatikusan több igazsággal.

---

## Reasoning model vs. hagyományos LLM

A két megközelítés közötti különbséget legegyszerűbben így lehet elképzelni:

```text
Hagyományos LLM

Kérdés
  ↓
Válasz előállítása
  ↓
Kész


Reasoning modell

Kérdés
  ↓
Probléma értelmezése
  ↓
Tervezés / következtetés
  ↓
Alternatívák és részfeladatok
  ↓
Ellenőrzés
  ↓
Végső válasz
```

A konkrét belső működés modellenként eltérhet, és nem minden reasoning modell ugyanazt a technikát használja.

A lényeg nem az, hogy egy emberhez hasonló „belső hang” jelenik meg, hanem az, hogy **a modell több számítást használhat fel a végső válasz előállításához.**

A Google Gemini API dokumentációja például külön thinking level beállítást kínál, amellyel a fejlesztő szabályozhatja, hogy a modell mennyi reasoning erőforrást használjon. ([ai.google.dev](https://ai.google.dev/gemini-api/docs/thinking))

---

## A „thinking budget” valójában erőforrás-kérdés

A reasoning egyik legfontosabb üzleti következménye, hogy a jobb problémamegoldásnak ára lehet.

Ha egy modell több reasoning tokent generál, több számítás történik.

Ez hatással lehet:

- a költségre,
- a válaszidőre,
- a kapacitásra,
- a párhuzamosan kiszolgálható felhasználók számára.

A Google dokumentációja például kifejezetten jelzi, hogy a thinking tokenek beleszámíthatnak a felhasználásba és a költségbe, miközben a nagyobb thinking effort magasabb latency-t is okozhat. ([ai.google.dev](https://ai.google.dev/gemini-api/docs/thinking))

Ezért egy üzleti rendszerben nem feltétlenül az a cél, hogy **mindig a lehető legtöbbet gondolkodó modellt használjuk.**

Inkább azt kell eldönteni, hogy az adott feladat értéke indokolja-e a többletköltséget.

---

## Gyors válasz vagy alaposabb válasz?

Ez sokszor egyszerű üzleti kompromisszum.

```text
Alacsony reasoning
→ gyors
→ olcsóbb
→ egyszerű feladatokhoz jó

Magas reasoning
→ lassabb
→ több compute
→ drágább lehet
→ összetett feladatoknál hasznosabb
```

Egy ügyfélszolgálati chatbotnál például lehet fontos, hogy a válasz néhány pillanaton belül megérkezzen.

Egy olyan rendszerben viszont, amely egy több száz oldalas szerződést elemez, kockázatokat keres és strukturált jelentést készít, már sokkal kevésbé probléma, ha a válasz tovább tart.

**Nem a „legokosabb” modellt kell mindenhol használni, hanem a feladathoz megfelelő reasoning szintet.**

---

## Mikor érdemes reasoning modellt használni?

Néhány tipikus eset:

### Összetett üzleti elemzés

Ha több adatforrásból kell következtetést levonni, a reasoning hasznos lehet.

Például:

```text
értékesítési adatok
+ ügyfélszolgálati adatok
+ költségek
       ↓
AI elemzés
       ↓
problémák azonosítása
       ↓
lehetséges okok
       ↓
javasolt intézkedések
```

### Programozás

A kódgenerálás nem mindig csak arról szól, hogy „írj nekem egy Java osztályt”.

Egy összetettebb feladatnál a rendszernek meg kell értenie a meglévő architektúrát, az adatmodellt, az API-kat és az egymásra épülő követelményeket.

Az OpenAI dokumentációja is kiemeli a reasoning modellek alkalmazását komplex coding és több lépésből álló agentic feladatokban. ([developers.openai.com](https://developers.openai.com/api/docs/guides/reasoning))

### Matematikai és logikai feladatok

Itt különösen jól látható, miért számít a több inference-time compute.

Egy egyszerű összeadásnál nincs sok értelme hosszasan elemezni.

Egy összetett optimalizálási vagy matematikai probléma esetén viszont több köztes lépésre lehet szükség.

### Agentek

Egy AI agent gyakran nem egyetlen választ ad.

Ehelyett:

```text
feladat
 ↓
terv
 ↓
eszköz használata
 ↓
eredmény
 ↓
ellenőrzés
 ↓
következő lépés
 ↓
végső eredmény
```

Minél több ilyen lépést tartalmaz a workflow, annál fontosabb lehet a reasoning képesség.

---

## Mikor nincs rá szükség?

Rengeteg feladatnál a reasoning túlzás.

Például:

- egy e-mail átírása,
- rövid termékleírás készítése,
- egyszerű fordítás,
- egy meeting összefoglalása,
- alapvető FAQ-k megválaszolása,
- egyszerű szövegformázás.

Ezeknél gyakran fontosabb a sebesség és az alacsony költség.

A Google saját dokumentációja is azt javasolja, hogy latency-érzékeny feladatoknál alacsonyabb thinking effort legyen használható, míg a magasabb szint inkább mély reasoninget és nehéz, több lépéses feladatokat céloz. ([ai.google.dev](https://ai.google.dev/gemini-api/docs/latest-model))

---

## A reasoning nem helyettesíti az ellenőrzést

Van egy fontos félreértés, amit érdemes elkerülni.

**Attól, hogy egy AI több időt tölt egy problémával, még nem válik tévedhetetlenné.**

A reasoning javíthatja a problémamegoldást, de a modell továbbra is hibázhat.

Ez különösen fontos üzleti alkalmazásoknál.

Ha például egy AI:

- pénzügyi döntést támogat,
- szerződést elemez,
- programkódot módosít,
- ügyféladatokat dolgoz fel,
- automatizált döntést készít,

akkor továbbra is szükség lehet szabályokra, validációra, tesztelésre és emberi kontrollra.

A reasoning tehát nem „biztonsági garancia”, hanem egy további eszköz a jobb problémamegoldáshoz.

---

## Hogyan válassz reasoning modellt egy vállalkozásban?

Érdemes először nem modellt, hanem feladatot választani.

Készíts egy egyszerű táblázatot:

| Feladat | Összetettség | Sebességigény | Hibaköltség | Reasoning |
|---|---:|---:|---:|---:|
| E-mail átírás | alacsony | magas | alacsony | alacsony |
| FAQ chatbot | alacsony | magas | közepes | alacsony |
| Dokumentumelemzés | magas | közepes | magas | közepes/magas |
| Komplex kódolás | magas | közepes | magas | magas |
| Stratégiai elemzés | magas | alacsony | magas | magas |

Ezután érdemes valódi céges példákon tesztelni.

Ne azt kérdezd:

> „Melyik AI a legjobb?”

Inkább ezt:

> „Melyik feladathoz mennyi reasoning szükséges ahhoz, hogy az eredmény üzletileg megérje?”

Ez sokkal használhatóbb kérdés.

---

## A következő AI-verseny egyik fontos része nem csak a nagyobb modell

Az AI fejlődését sokáig főként a modellek méretével és training compute-jával kapcsoltuk össze.

A reasoning modellek megjelenésével egyre fontosabbá vált az is, hogy **mennyi számítást engedünk a modellnek a konkrét probléma megoldására.**

Ez egy érdekes váltás:

```text
Korábban:
nagyobb modell
→ több training compute
→ jobb képességek

Egyre inkább:
jobb modell
+ több inference-time compute
→ jobb problémamegoldás
```

A test-time scaling kutatása jelenleg is aktív terület, és a különböző módszerek eltérő költséggel, teljesítménnyel és hibamintázattal járhatnak. ([arxiv.org](https://arxiv.org/abs/2608.04001))

Ezért a jövő AI-rendszereiben valószínűleg nem egyszerűen az lesz a kérdés, hogy „melyik modellt használjuk?”, hanem az is, hogy **mikor és mennyit érdemes számoltatni vele.**

---

## Mikor érdemes egy vállalkozásnak reasoning AI-ra váltania?

Ha a vállalkozásod AI-jának feladata egyszerű szöveggenerálás vagy információ-visszaadás, valószínűleg nincs szükség minden esetben magas reasoning szintre.

Ha viszont a rendszernek összetett döntési logikát kell kezelnie, több dokumentumot kell összevetnie, kódot kell elemeznie, eszközöket kell használnia vagy több lépésben kell megoldania egy problémát, már érdemes reasoning modelleket is tesztelni.

**A jó AI-rendszer nem attól jó, hogy mindig „a legjobban gondolkodó” modellt használja, hanem attól, hogy a megfelelő feladathoz a megfelelő mennyiségű számítást rendeli.**

---

## A te rendszerednek kellene „gondolkodnia”?

A következő AI-projektednél érdemes végigmenni a konkrét feladatokon, és különválasztani a gyors, egyszerű műveleteket azoktól, amelyek valódi több lépéses következtetést igényelnek.

Ez gyakran olcsóbb, gyorsabb és megbízhatóbb architektúrát eredményez, mint minden feladatra ugyanazt a modellt használni.

**softwaredevelopment.hu — AI-megoldások, automatizálás és egyedi szoftverek vállalkozások számára.**

---

## Források

- OpenAI: [Reasoning models](https://developers.openai.com/api/docs/guides/reasoning)
- Google AI for Developers: [Gemini thinking](https://ai.google.dev/gemini-api/docs/thinking)
- Google AI for Developers: [What's new in Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/latest-model)
- Google AI for Developers: [Gemini API optimisation and inference](https://ai.google.dev/gemini-api/docs/optimization)
- Hariri et al.: [Test-Time Scaling in Reasoning LLMs](https://arxiv.org/abs/2608.04001)
