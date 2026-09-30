---
title: "Prompt Engineering: hogyan adjunk olyan utasítást az AI-nak, amit valóban jól ért?"
description: "A jó AI-válasz nem csak a modelltől függ. Megmutatjuk, hogyan használj kontextust, szerepet, példákat, korlátokat és strukturált kimenetet."
tags: [prompt-engineering, prompting, ai, llm, mesterséges-intelligencia]
date: 2026-11-01 08:00
image: /articles/prompt-engineering/share-hu.jpg
---

## Miért nem azt csinálja az AI, amit kérsz?

Valószínűleg már találkoztál vele.

Beírod:

> „Írj egy jó bemutatkozó szöveget a cégemnek.”

Az AI pedig ír egy korrekt, de teljesen általános szöveget.

Újra megpróbálod:

> „Legyen jobb.”

Jön egy másik változat.

Majd:

> „Legyen professzionálisabb, de ne legyen túl hivatalos.”

Ez már valamivel jobb.

A probléma sokszor nem maga a modell.

**Egyszerűen túl kevés információt adtál neki ahhoz, hogy pontosan tudja, mit jelent számodra a „jó”.**

A prompt engineering, vagyis prompttervezés lényege nem valamilyen titkos varázsformula.

Arról szól, hogy **egyértelműen meghatározd a feladatot, a kontextust, a korlátokat és az elvárt eredményt.**

Az OpenAI, az Anthropic és a Google hivatalos útmutatói is hasonló alapelveket emelnek ki: világos instrukciók, megfelelő kontextus, példák, egyértelmű formátum és iteratív finomítás. [OpenAI – Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables) [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## A jó prompt nem feltétlenül hosszú

Ez fontos.

Nem az a cél, hogy minden kérdéshez egy 2000 szavas promptot írj.

Egy egyszerű feladathoz elég lehet egy mondat:

```text
Foglald össze ezt a szöveget 5 rövid bullet pointban.
```text

Egy összetett feladatnál viszont több információra lehet szükség.

A legfontosabb kérdések:

```text
Mit csináljon?
Kinek?
Milyen kontextusban?
Milyen szabályok szerint?
Milyen formátumban?
Milyen hosszban?
Milyen esetben ne találjon ki információt?
```text

**A jó prompt nem attól jó, hogy hosszú, hanem attól, hogy kevés fontos dolgot hagy bizonytalanul.**

---

## 1. Mondd meg, mi a feladat

A leggyakoribb rossz promptok egyike:

```text
Írj valamit a weboldalamról.
```text

Mi a probléma?

Az AI nem tudja:

- mi a weboldal,
- kinek szól,
- mi a cél,
- milyen hosszú legyen,
- milyen stílus kell,
- mit szeretnél elérni.

Jobb:

```text
Írj egy 120 szavas bemutatkozó szöveget egy budapesti
webfejlesztő vállalkozás weboldalára.

A célközönség kis- és középvállalkozások vezetői.
A cél, hogy megértsék, milyen problémákban tudunk segíteni.
Legyen professzionális, de közvetlen.
Ne használj túlzó marketingkifejezéseket.
```text

Az OpenAI hivatalos útmutatója is azt javasolja, hogy legyél konkrét az elvárt kontextussal, eredménnyel, hosszúsággal, formátummal és stílussal kapcsolatban. [OpenAI – Prompting techniques](https://help.openai.com/en/articles/6654000-prompting-techniques)

---

## 2. Adj kontextust

Az AI nem tudhat mindent, amit te tudsz.

Ha azt írod:

> „Írj választ az ügyfélnek.”

az AI nem tudja, hogy:

- ki az ügyfél,
- mi történt,
- mit ígértél,
- milyen hangnemben kommunikáltok,
- mi a célod.

Adj neki hátteret.

```text
Az ügyfél egy három hónapja velünk dolgozó webshop-tulajdonos.
A projekt jelenleg tesztelési fázisban van.
Az átadás két nappal később történik a tervezettnél,
mert egy fizetési integráció hibáját javítjuk.

Írj neki egy rövid, őszinte e-mailt.
Ne hárítsd a felelősséget.
Mondd el, mikor várható az átadás.
```text

A Google promptolási útmutatója is külön kiemeli a kontextus megadását: az információt nem érdemes a modell „általános tudására” hagyni, ha az adott feladathoz szükséges háttérinformációt te ismered. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

**A modell annál jobban tud dönteni, minél jobban érti a problémát, amelyben döntést kell hoznia.**

---

## 3. Adj szerepet – de csak ha tényleg segít

Hasznos lehet megmondani, milyen szerepben dolgozzon.

Például:

```text
Te egy senior UX designer vagy, aki B2B webalkalmazásokkal foglalkozik.
```text

Ezután:

```text
Értékeld ezt a regisztrációs folyamatot.
Keresd meg azokat a pontokat, ahol a felhasználó
bizonytalanná válhat vagy elhagyhatja az oldalt.
```text

A szerep segíthet a modellnek abban, hogy milyen szempontokat helyezzen előtérbe.

Az Anthropic hivatalos útmutatója is javasolja a szerep meghatározását, különösen rendszerüzenetben, amikor a kívánt viselkedést és kommunikációs módot szeretnéd rögzíteni. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

De itt is érdemes mértéket tartani.

Nem szükséges minden egyszerű kérdéshez:

> „Te vagy a világ legjobb, díjnyertes, nemzetközi szinten elismert…”

**A szerep célja a fókusz, nem a marketing.**

---

## 4. Határozd meg a korlátokat

Az AI-nak nemcsak azt érdemes megmondani, mit tegyen.

Azt is, mit **ne** tegyen.

Például:

```text
Írj egy 300 szavas cikket.

Korlátok:
- ne használj angol szakkifejezéseket, ha van megfelelő magyar szó,
- ne használj túlzó állításokat,
- ne írj kitalált statisztikákat,
- ne említs olyan funkciót, amelyről nincs információd,
- ne használj emoji-kat.
```text

Ez különösen fontos üzleti, jogi, pénzügyi vagy technikai tartalomnál.

A Google promptolási útmutatója is külön kezeli a constraints, vagyis a generálásra vonatkozó korlátozások meghatározását. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 5. Mondd meg, milyen legyen a kimenet

Az egyik legnagyobb különbséget gyakran az output formátuma jelenti.

Rossz:

```text
Elemezd ezt az ügyfelet.
```text

Jobb:

```text
Elemezd az ügyfelet az alábbi struktúrában:

1. Ügyfél típusa
2. Fő probléma
3. Valószínű üzleti igény
4. Kockázatok
5. Következő javasolt lépés

Minden pont maximum 2 mondat legyen.
```text

A Google dokumentációja szerint egyszerű formátumokat prompttal is meg lehet határozni, összetettebb JSON-kimenetekhez pedig érdemes strukturált output funkciót használni. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

Az OpenAI Structured Outputs funkciója például JSON Schema alapján tudja korlátozni a modell kimenetét, így alkalmazásokban megbízhatóbban feldolgozható eredményt lehet kapni. [OpenAI – Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

---

## 6. Ha gép fogja feldolgozni, ne csak szép szöveget kérj

Tegyük fel, hogy egy AI-val ügyféladatokat szeretnél kinyerni egy e-mailből.

Ne ezt kérd:

```text
Mondd meg, milyen adatokat találtál az e-mailben.
```text

Hanem:

```text
Nyerj ki az e-mailből ügyféladatokat.

A kimenet:
{
  "name": "...",
  "email": "...",
  "company": "...",
  "phone": "..."
}

Ha egy adat nem található, legyen null.
Ne találj ki hiányzó adatot.
```text

API-integráció esetén azonban még jobb lehet valódi strukturált outputot használni, nem pusztán arra hagyatkozni, hogy a modell „ígérete szerint” JSON-t ad vissza.

Az OpenAI dokumentációja szerint a Structured Outputs célja éppen az, hogy a modell válasza megfeleljen a megadott JSON Schema struktúrájának. [OpenAI – Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

---

## 7. Mutass példát

Az egyik legerősebb promptolási technika a **few-shot prompting**.

Nem csak elmondod, mit szeretnél.

Megmutatod.

Például:

```text
Feladat:
Alakítsd át a mondatot rövid, professzionális ügyfélszolgálati válasszá.

Példa 1:
Bemenet: "Nem működik a belépés."
Kimenet: "Sajnáljuk a kellemetlenséget. Kérjük, próbáld meg újra a jelszó visszaállítását."

Példa 2:
Bemenet: "Hol találom a számlát?"
Kimenet: "A számlákat a Profil → Számlák menüpontban találod."

Most alakítsd át:
"Bemenet: Nem tudom letölteni a számlát."
```text

A példákból a modell nemcsak a tartalmat, hanem a kívánt stílust és struktúrát is megértheti.

Az Anthropic hivatalos útmutatója a példákat az egyik legmegbízhatóbb módnak nevezi a kívánt output-formátum, hangnem és szerkezet irányítására. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

**Ha nehéz szavakkal elmagyarázni, mit szeretnél, mutass egy jó példát.**

---

## 8. Válaszd szét az instrukciót és az adatot

Ez különösen fontos hosszú szövegek, dokumentumok és AI-alkalmazások esetében.

Ne:

```text
Foglalj össze ezt a dokumentumot és ne írj ki semmilyen érzékeny adatot
A dokumentum itt kezdődik...
```text

Használj egyértelmű határokat:

```text
# Feladat

Foglald össze a dokumentumot 5 pontban.
Ne jeleníts meg személyes adatokat.

# Dokumentum

"""
[ide kerül a dokumentum]
"""
```text

Vagy:

```text
<instructions>
Foglald össze a dokumentumot 5 pontban.
Ne jeleníts meg személyes adatokat.
</instructions>

<document>
[ide kerül a dokumentum]
</document>
```text

Az OpenAI hivatalos dokumentációja szerint a Markdown és az XML tagek segíthetnek az instrukciók, példák és kontextus logikai határainak egyértelmű elválasztásában. [OpenAI – Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)

Az Anthropic szintén javasolja az XML tagek használatát összetett promptoknál, különösen akkor, amikor instrukciók, kontextus és példák keverednek. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

---

## 9. Összetett feladatnál bontsd lépésekre

Egy ilyen kérés:

> „Elemezd a vállalkozást, keresd meg a problémákat, tervezz marketingstratégiát, készíts költségvetést és írj belőle prezentációt.”

túl sok különböző feladatot rak egyetlen promptba.

Jobb lehet:

```text
1. Azonosítsd a vállalkozás fő problémáit.
2. Rangsorold őket üzleti hatás szerint.
3. Javasolj megoldásokat.
4. Készíts megvalósítási tervet.
5. A terv alapján készíts prezentációvázlatot.
```text

Az Anthropic útmutatója is azt javasolja, hogy amikor a sorrend vagy a feladat teljessége fontos, az instrukciókat számozott vagy bulletpontos lépésekben add meg. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

---

## Rossz prompt → jobb prompt

Nézzünk néhány gyakori példát.

### Példa 1: „Írj egy jó cikket”

**Rossz:**

```text
Írj egy jó cikket a mesterséges intelligenciáról.
```text

**Jobb:**

```text
Írj egy 1000 szavas, magyar nyelvű ismeretterjesztő cikket
KKV-tulajdonosok számára az AI gyakorlati használatáról.

Cél:
Mutasd be, milyen üzleti folyamatokban lehet valóban hasznos.

Stílus:
- professzionális, de közvetlen
- ne legyen hype-os
- technikai kifejezéseket magyarázd meg

Szerkezet:
- rövid bevezetés
- 5 gyakorlati példa
- kockázatok
- mikor nem érdemes használni
- rövid összefoglaló

Ne használj kitalált statisztikákat.
```text

---

## Példa 2: „Elemezd ezt”

**Rossz:**

```text
Elemezd ezt az üzleti tervet.
```text

**Jobb:**

```text
Elemezd az alábbi üzleti tervet KKV-tanácsadó szemmel.

Vizsgáld:
1. célpiac
2. bevételi modell
3. költségstruktúra
4. fő kockázatok
5. skálázhatóság

Minden pontnál:
- írj egy rövid megállapítást,
- adj konkrét indokot a dokumentumból,
- jelezd, ha nincs elegendő információ.

A végén adj 5 tisztázó kérdést.

<business_plan>
[szöveg]
</business_plan>
```text

Itt már nem csak azt mondod, hogy „elemezd”.

**Meghatározod, mit jelent számodra az elemzés.**

---

## Példa 3: „Írj kódot”

**Rossz:**

```text
Írj egy login rendszert Java-ban.
```text

**Jobb:**

```text
Készíts egy Spring Boot 3 alkalmazáshoz illeszkedő
REST API login modult Java 17 használatával.

Követelmények:
- Spring Security használata
- JWT-alapú autentikáció
- jelszavak biztonságos hash-elése
- hibás login esetén ne áruld el, hogy a felhasználó létezik-e
- DTO-k használata
- unit tesztek szükségesek

Kimenet:
1. szükséges osztályok
2. Java kód
3. konfiguráció
4. tesztek
5. rövid biztonsági megjegyzések

Ha valamelyik követelmény nem egyértelmű,
jelezz feltételezést a kód előtt.
```text

A fejlesztési feladatoknál különösen fontos a környezet és a technikai korlátok megadása.

**„Írj kódot” nem specifikáció.**

---

## Példa 4: „Írd át professzionálisabbra”

**Rossz:**

```text
Tedd professzionálisabbá ezt az e-mailt.
```text

**Jobb:**

```text
Írd át ezt az e-mailt üzleti, de közvetlen hangnemre.

Cél:
Az ügyfél fogadja el, hogy a projekt átadása 3 nappal később történik.

Korlátok:
- ne hárítsd a felelősséget,
- ne használj jogi vagy túl hivatalos nyelvezetet,
- maximum 150 szó,
- maradjon tegező.

Az eredeti szöveg:
"""
...
"""
```text

Az AI így nem azt próbálja kitalálni, mit jelent a „professzionális”.

**Te definiáltad.**

---

## Ne adj egymásnak ellentmondó utasításokat

Például:

```text
Legyen nagyon részletes.

Maximum 100 szóban válaszolj.

Magyarázz el minden részletet.

Ne írj hosszú választ.
```text

Ez nem jó prompt.

Ha több követelményed van, rangsorold vagy tedd egyértelművé őket:

```text
Maximum 100 szóban válaszolj.
A legfontosabb 3 szempontot emeld ki.
Ne adj háttérmagyarázatot.
```text

**A modell nem tud jól teljesíteni olyan specifikáció alapján, amely saját magával is ellentmondásban van.**

---

## Ne próbáld „varázsszavakkal” irányítani

Az interneten rengeteg prompt található ilyen mondatokkal:

> „Te mostantól a világ legjobb szakértője vagy.”

> „Ez a legfontosabb feladatod az életedben.”

> „Ha nem sikerül, nagy baj lesz.”

Ezek helyett általában sokkal hasznosabb:

```text
A választ senior backend fejlesztőnek írod.
Használj technikai, de tömör magyarázatot.
A példák Spring Boot 3 és Java 17 környezetben legyenek.
```text

**A konkrét követelmény többet ér, mint a hangzatos utasítás.**

---

## A prompt engineering nem egyszeri munka

Az első prompt ritkán tökéletes.

A jó folyamat:

```text
Prompt
↓
Eredmény
↓
Mi volt rossz?
↓
Módosított prompt
↓
Új eredmény
↓
Teszt
↓
Finomítás
```text

Az OpenAI és a Google is iteratív folyamatként kezeli a promptolást, nem egyszer elkészített, változatlan receptként. [OpenAI – Prompting](https://developers.openai.com/api/docs/guides/prompting) [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

Az Anthropic pedig azt javasolja, hogy a prompt engineering előtt legyenek meghatározott sikerkritériumok és valamilyen mérési vagy értékelési módszer. [Anthropic – Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)

---

## A jó promptot tesztelni is kell

Ha egy AI-rendszert üzleti folyamatban használsz, ne csak azt nézd meg, hogy egyetlen példán jól működik-e.

Legyen több teszteseted:

```text
Normál eset
↓
Egyszerű edge case
↓
Hiányos adat
↓
Hibás adat
↓
Szokatlan megfogalmazás
↓
Ellentmondásos adat
↓
Nem releváns input
```text

Például egy ügyfélszolgálati AI-nál nem elég, hogy egy normál kérdésre jól válaszol.

Azt is tesztelned kell, mi történik, ha az ügyfél:

- nem ad rendelési számot,
- rossz rendelési számot ad,
- több rendelésről beszél,
- hiányos információt ad,
- olyat kérdez, amire nincs adat.

**A prompt minőségét nem az alapján érdemes megítélni, hogy egyszer jól sikerült-e a válasz.**

---

## Egy használható prompt-sablon

Ha nem tudod, hogyan kezdj hozzá, használhatod ezt:

```text
# Szerep
[Ki vagy?]

# Cél
[Mit kell elérni?]

# Kontextus
[Mit kell tudnia a feladathoz?]

# Feladat
[Mit csináljon pontosan?]

# Korlátok
[Mit tegyen és mit ne tegyen?]

# Példák
[1–3 jó példa]

# Kimenet
[Milyen formátumban és milyen hosszban válaszoljon?]

# Bemenet
[Az aktuális adat vagy kérés]
```text

Nem kell mindig mind a hét részt használni.

Egy egyszerű kérdéshez elég lehet két mondat.

Egy komplex vállalati AI-rendszerben viszont ez a fajta struktúra sok félreértést megelőzhet.

A Google hivatalos útmutatója hasonlóan strukturált mintákat mutat be szerep, instrukciók, kontextus, korlátok és output-formátum elkülönítésével. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## A legfontosabb szabály

A jó prompt nem arról szól, hogy megtalálod a „tökéletes mondatot”.

Hanem arról, hogy **a modell számára minél kevesebb fontos dolgot hagysz találgatásra.**

Ha fontos:

- mondd meg,
- ha fontos a forma, mutasd meg,
- ha van korlát, írd le,
- ha van kontextus, add át,
- ha van jó példa, mutasd meg,
- ha gép fogja feldolgozni, használj strukturált outputot,
- ha üzleti folyamat része, teszteld többféle bemenettel.

A prompt engineering ezért valójában nem „AI-trükközés”.

**Jó specifikáció készítése egy olyan rendszer számára, amely természetes nyelven értelmezi az utasításaidat.**

És minél komolyabb feladatra használod az AI-t, annál inkább specifikációként kell gondolkodnod a promptokról.

**softwaredevelopment.hu — AI-integráció, automatizálás és egyedi AI-megoldások vállalkozásoknak.**

---

## Források

- OpenAI: [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
- OpenAI: [Prompting](https://developers.openai.com/api/docs/guides/prompting)
- OpenAI Help Center: [Best practices for prompt engineering with the OpenAI API](https://help.openai.com/en/articles/6654000-prompting-techniques)
- OpenAI: [Structured model outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- Anthropic: [Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)
- Anthropic: [Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- Google AI for Developers: [Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- Google AI for Developers: [Prompting best practices](https://ai.google.dev/gemini-api/docs/prompting-strategies)
