---
title: "Generative AI: hogyan lesz egy egyszerű kérdésből szöveg, kép, hang vagy kód?"
description: "Hogyan lesz egy promptból szöveg, kép, hang vagy kód? Megmutatjuk a generatív AI alapjait, a Transformer és diffusion modellek működését."
tags: [ai, generative-ai, transformers, diffusion, automatizáció]
date: 2026-10-20 08:00
image: /articles/generative-ai-explained/share-hu.jpg
---

## Mit jelent valójában az, hogy generatív AI?

Amikor beírod egy AI-eszközbe, hogy:

> „Írj egy rövid bemutatkozást a cégemről, készíts hozzá egy modern képet, majd adj egy HTML-verziót is.”

néhány másodperccel később már ott lehet előtted a szöveg, a kép és akár a működő kód.

Kívülről ez szinte varázslatnak tűnik.

Valójában több különböző technológia dolgozhat a háttérben.

A generatív AI olyan mesterségesintelligencia-rendszerek összefoglaló neve, amelyek új tartalmat képesek létrehozni: például szöveget, képet, hangot, videót vagy programkódot.

**A legfontosabb gondolat: nem egyetlen „AI-gép” létezik, amely mindent ugyanúgy generál. A különböző tartalomtípusokhoz különböző modellek és módszerek használhatók.**

A szöveg és a kód generálásánál például gyakoriak a Transformer-alapú modellek. A képgenerálásban pedig a diffusion, vagyis diffúziós modellek váltak meghatározóvá.

---

## Először is: mi az a prompt?

A prompt egyszerűen az az utasítás vagy bemenet, amelyet a modell kap.

Lehet egyetlen mondat:

> „Írj egy rövid Facebook-posztot egy új étterem megnyitásáról.”

De lehet ennél sokkal összetettebb is:

> „Írj egy 300 szavas bemutatkozó oldalt egy budapesti könyvelőirodának, tegező hangnemben, szakzsargon nélkül, három alcímmel.”

A prompt azonban nem egy varázsige.

**A modell nem a prompt „jelentését” olvassa úgy, mint egy ember. A bemenetet a modell által feldolgozható reprezentációvá alakítja, majd ennek alapján generál kimenetet.**

Szöveges generálásnál ez tipikusan tokenekkel történik. A causal language model például a korábbi tokenek alapján próbálja előállítani a következő tokent. A Hugging Face dokumentációja ezt a szöveggenerálás egyik alapmechanizmusaként írja le. ([Hugging Face](https://huggingface.co/docs/transformers/tasks/language_modeling))

A folyamat leegyszerűsítve:

```text
prompt
  ↓
tokenizálás
  ↓
modell
  ↓
következő token
  ↓
következő token
  ↓
...
  ↓
kész szöveg
```

---

## Miért olyan fontosak a Transformerek?

A Transformer architektúrát a „Attention Is All You Need” című, 2017-ben publikált tanulmány mutatta be. A megközelítés központi eleme az attention mechanizmus, amely lehetővé teszi, hogy a modell a szöveg különböző részei közötti kapcsolatokat kezelje. ([arXiv](https://arxiv.org/abs/1706.03762))

Nem kell matematikusnak lenned ahhoz, hogy megértsd a lényeget.

Képzeld el, hogy ezt a mondatot olvasod:

> „A vállalkozás új weboldalt készített, mert a régi már nem felelt meg az ügyfelek elvárásainak.”

Ha megkérdezem, mire utal a „régi”, a mondat korábbi részei alapján válaszolsz.

A Transformer hasonlóan képes a különböző tokenek közötti kapcsolatokat kezelni.

Nem „figyel” emberi értelemben. Matematikai műveletekkel számolja ki, hogy az adott feldolgozás során mely információk mennyire relevánsak egymáshoz.

Ez az egyik alapja annak, hogy a Transformer-alapú modellek hosszabb és összetettebb szövegeket is képesek kezelni.

---

## Hogyan lesz ebből egy kész szöveg?

Tegyük fel, hogy ezt írod:

> „Írj egy rövid bemutatkozást egy budapesti webfejlesztő cég számára.”

A modell nem úgy működik, hogy elővesz egy kész bemutatkozó szöveget egy adatbázisból.

A szöveggeneráló modellek a bemenet alapján tokenenként állítják elő a választ.

Leegyszerűsítve:

```text
"Budapesti"
      ↓
"Budapesti webfejlesztő"
      ↓
"Budapesti webfejlesztő cég"
      ↓
"Budapesti webfejlesztő cégünk"
      ↓
...
```

Minden lépésnél több lehetséges következő token közül kell választania.

A generálásnak több stratégiája is lehet, például determinisztikusabb vagy mintavételezésen alapuló megközelítés. A Hugging Face dokumentációja több ilyen szöveggenerálási stratégiát is bemutat. ([Hugging Face](https://huggingface.co/docs/transformers/main/en/generation_strategies))

**A kész szöveg tehát nem egyetlen pillanatban „jelenik meg” a modellben. A rendszer fokozatosan építi fel.**

---

## És hogyan készül egy kép?

Itt már más jellegű technológiával találkozhatunk.

A modern képgeneráló rendszerek egyik fontos megközelítése a diffusion model, vagyis diffúziós modell.

Az alapötlet meglepően egyszerű.

Képzeld el, hogy van egy tiszta fényképed.

Elkezded egyre több véletlenszerű zajjal összekeverni, amíg végül már alig lehet felismerni az eredeti képet.

A modell megtanulja ennek a folyamatnak a fordítottját.

```text
véletlenszerű zaj
      ↓
kevesebb zaj
      ↓
még kevesebb zaj
      ↓
körvonalak
      ↓
részletek
      ↓
kész kép
```

A Hugging Face Diffusers dokumentációja szerint a diffusion modellek véletlenszerű zajból kiindulva, fokozatos denoising, vagyis zajcsökkentés segítségével hoznak létre kimenetet. ([Hugging Face](https://huggingface.co/docs/diffusers/en/quicktour))

Ezért hívják őket diffúziós modelleknek.

---

## De honnan tudja a modell, hogy mit kell rajzolnia?

Önmagában a zajból még nem derül ki, hogy te egy piros autót, egy budapesti irodát vagy egy űrhajót szeretnél.

Ehhez kell a szöveges feltétel.

Például:

> „Modern, minimalista iroda Budapesten, nagy ablakokkal, természetes fénnyel.”

A rendszer a szöveget olyan reprezentációvá alakítja, amely irányítani tudja a képgenerálási folyamatot.

A Hugging Face Diffusers dokumentációja szerint egy tipikus text-to-image pipeline-ban a text encoder a promptból embeddinget készít, amely a denoising folyamatot vezérli. A diffusion model ezután fokozatosan alakítja át a kezdeti zajt a kívánt kimenetté. ([Hugging Face](https://huggingface.co/docs/diffusers/en/quicktour))

Leegyszerűsítve:

```text
"modern budapesti iroda"
          ↓
     szöveges embedding
          ↓
     zaj + modell
          ↓
     fokozatos denoising
          ↓
        kép
```

Ez nem azt jelenti, hogy a modell „megrajzolja” az irodát úgy, ahogy egy grafikus tenné.

A modell megtanult mintázatok alapján hozza létre a képet.

---

## Mi az az embedding?

Az embeddinget legegyszerűbben úgy képzelheted el, mint egy matematikai térben elhelyezett jelentésbeli reprezentációt.

A „kutya” és a „macska” jelentése valamilyen szempontból közelebb áll egymáshoz, mint például a „kutya” és a „számla”.

A modell ezeket az összefüggéseket számszerű reprezentációkban tudja kezelni.

Ez azért fontos, mert a generatív AI nem csak konkrét szavakat vagy képpontokat dolgoz fel. A különböző modalitásokhoz kapcsolódó információk matematikai reprezentációkká alakíthatók.

Ez teszi lehetővé például azt is, hogy egy szöveges prompt egy kép generálását irányítsa.

---

## Mi történik, ha meglévő képet adsz neki?

Nem csak nulláról lehet képet generálni.

Az image-to-image rendszerek például meglévő képből indulhatnak ki, majd a képet zajosítják és újragenerálják a prompt alapján.

A Hugging Face dokumentációja szerint az ilyen folyamatban a kiinduló kép latent reprezentációba kerül, zajt adnak hozzá, majd a diffusion modell fokozatosan denoisingolja azt a szöveges prompt alapján. ([Hugging Face](https://huggingface.co/docs/diffusers/main/api/pipelines/stable_diffusion/img2img))

Ezért lehet például:

- egy vázlatból látványtervet készíteni,
- egy termékfotó hátterét módosítani,
- egy meglévő képet más stílusban újragondolni,
- egy kép bizonyos részét kicserélni.

**A generatív AI tehát nem csak „készít”, hanem meglévő tartalmat is képes átalakítani.**

---

## És a hang hogyan készül?

A hanggenerálás valamivel összetettebb terület, mert a hang időben változó jel.

Egy beszédgeneráló rendszer például szövegből készíthet beszédet.

A legegyszerűbb folyamat:

```text
szöveg
  ↓
nyelvi feldolgozás
  ↓
hang reprezentációja
  ↓
hanggenerálás
  ↓
audio
```

A modern rendszerekben többféle architektúra létezik, és a hanggenerálás sem feltétlenül ugyanazzal a módszerrel történik, mint a képgenerálás.

Az OpenAI API dokumentációja például külön speech endpointot biztosít, amely szövegből generál hangot. ([OpenAI](https://platform.openai.com/docs/api-reference/audio/voice-consent-list))

A Hugging Face Diffusers projektje pedig már képgenerálás mellett audio- és videós munkafolyamatokat is támogat. ([Hugging Face](https://huggingface.co/docs/diffusers/main/index))

**A fontos gondolat az, hogy a „generatív AI” nem egyetlen algoritmus neve. Inkább egy egész technológiai család.**

---

## Miért tud egy AI kódot is írni?

A programkód bizonyos szempontból nagyon hasonlít a természetes nyelvhez.

A kód is szekvenciákból áll:

```text
function
→ név
→ paraméter
→ utasítás
→ feltétel
→ eredmény
```

A szöveggeneráló Transformer-modellek képesek programkódot is generálni, ha a tanításuk során megfelelő kódpéldákat és feladatokat tanultak.

A Hugging Face dokumentációja például a causal language modelling alkalmazásai között külön említi az intelligens coding assistant jellegű felhasználást. ([Hugging Face](https://huggingface.co/docs/transformers/tasks/language_modeling))

Ezért működhet egy olyan kérés, mint:

> „Írj egy JavaScript függvényt, amely egy tömbből eltávolítja a duplikált értékeket.”

A modell felismeri a kérés nyelvi mintázatát, majd olyan kódrészletet generál, amely statisztikailag és szerkezetileg illeszkedik a feladathoz.

Ez azonban fontos különbséghez vezet.

**A kód attól még nem lesz automatikusan helyes, hogy egy AI generálta.**

Lehet benne logikai hiba, biztonsági probléma, rossz API-használat vagy olyan feltételezés, amely nem illik a projektedhez.

---

## A generatív AI valójában több különböző technológia

Amikor azt mondjuk, hogy „AI képet generál”, könnyű elképzelni egyetlen univerzális modellt.

A valóság inkább egy összetett rendszer:

```text
                GENERATÍV AI
                     ↓
        ┌────────────┼────────────┐
        ↓            ↓            ↓
      szöveg        kép          hang
        ↓            ↓            ↓
   Transformer   Diffusion    különböző
   modellek      modellek     generatív modellek
        ↓            ↓            ↓
      kód         videó      beszéd / zene
```

Ráadásul egyetlen alkalmazás több modellt is használhat.

Egy AI-asszisztens például először beszédfelismeréssel szöveggé alakítja, amit mondasz, majd egy nyelvi modellel értelmezi, végül egy beszédgeneráló modellel válaszol.

---

## Mire használható mindez egy vállalkozásban?

A technológia önmagában nem üzleti érték.

A kérdés inkább az, hogy milyen folyamatot tudsz vele gyorsabban vagy egyszerűbben elvégezni.

### Szöveg

Generálható például:

- termékleírás,
- blogvázlat,
- ügyfélszolgálati válasz,
- belső összefoglaló,
- ajánlat első változata,
- marketingötlet.

### Kép

Használható például:

- kampánykoncepciókhoz,
- közösségi média grafikákhoz,
- termékbemutatókhoz,
- webdesign-ötletekhez,
- moodboardokhoz,
- koncepciótervekhez.

### Hang

Lehetséges például:

- narráció,
- belső oktatási anyag,
- hangos ügyfélszolgálati alkalmazás,
- beszélt tartalom,
- prototípusok.

### Kód

Segíthet például:

- prototípusok készítésében,
- ismétlődő kód megírásában,
- dokumentáció létrehozásában,
- tesztek generálásában,
- hibák elemzésében.

**A legjobb üzleti felhasználás általában nem az, hogy „AI-val csináljunk valamit”, hanem hogy egy konkrét, ismétlődő vagy drága munkafolyamatból vegyünk ki felesleges manuális lépéseket.**

---

## Hol vannak a korlátok?

A generatív AI nagyon látványos, de nem hibátlan.

### 1. Nem garantálja az igazságot

Egy nyelvi modell képes hihető, de hibás információt generálni.

Ezért fontos üzleti adatok, jogi szövegek, pénzügyi információk vagy technikai specifikációk esetén az ellenőrzés.

### 2. A képek sem feltétlenül pontosak

A képgeneráló modell nem CAD-rendszer.

Ha egy mérnökileg pontos alkatrészre van szükséged, egy hangulatos AI-kép nem helyettesíti a műszaki tervezést.

### 3. A kódot tesztelni kell

A generált kód lehet működőképes, de lehet hibás vagy nem biztonságos is.

### 4. A stílus és a következetesség problémát okozhat

Egy marketingkampányban nem biztos, hogy minden generált kép pontosan ugyanazt a terméket, karaktert vagy vizuális világot fogja követni.

### 5. A jogi környezet is számít

Az EU AI Act külön szabályokat állapít meg bizonyos generatív AI-rendszerekre és általános célú AI-modellekre. A Bizottság tájékoztatása szerint a GPAI-modellekre vonatkozó kötelezettségek 2025 augusztusától alkalmazandók, míg bizonyos generatív AI-val kapcsolatos átláthatósági szabályok 2026. augusztus 2-től alkalmazandók. ([European Commission](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), [European Commission](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems))

Ez különösen akkor fontos, ha a vállalkozásod AI-generált tartalmat tesz közzé vagy AI-rendszert épít ügyfelek számára.

---

## Nem a prompt a varázslat

A generatív AI-ról sokszor úgy beszélünk, mintha a megfelelő prompt megtalálása lenne minden.

A prompt valóban számít.

De egy üzleti rendszerben általában ennél több kell.

```text
jó prompt
    ↓
megfelelő modell
    ↓
megfelelő vállalati adatok
    ↓
jó folyamat
    ↓
ellenőrzés
    ↓
emberi döntés
    ↓
üzleti eredmény
```

**A generatív AI akkor válik igazán hasznossá, amikor nem önálló „varázsdobozként”, hanem egy jól megtervezett folyamat részeként használod.**

---

## A legegyszerűbb mentális modell

Ha szeretnéd fejben rendbe tenni az egészet, gondolj így a generatív AI-ra:

**Szöveg és kód:** a modell tokenekből kiindulva fokozatosan generálja a következő tokeneket.

**Kép:** a diffusion modell zajból indulva fokozatosan állít elő egy koherens képet.

**Hang:** a rendszer a szöveges vagy más bemeneti információból hangot állít elő a választott generatív architektúrával.

**Videó:** a generatív rendszer a térbeli és időbeli információt is kezeli, hogy egymással összefüggő képkockákból mozgó tartalom szülessen.

És mindegyiknél ugyanaz az alapgondolat:

> **A modell nem úgy „alkot”, mint egy ember. A tanítás során megtanult mintázatok alapján számítja ki, milyen kimenet illeszkedhet a bemenethez.**

---

## Hol lenne valódi haszna a generatív AI-nak a vállalkozásodban?

A generatív AI akkor érdekes, ha egy konkrét problémát old meg.

Lehet, hogy nálad az ügyfélszolgálati e-mailek első feldolgozása lenne a jó kiindulópont. Lehet, hogy termékleírásokat szeretnél gyorsabban létrehozni. Vagy éppen a fejlesztési folyamatban szeretnél automatizálni ismétlődő feladatokat.

Érdemes először a folyamatot megvizsgálni, és csak utána eldönteni, milyen AI-modellre van szükséged.

**softwaredevelopment.hu — Ha szeretnéd megtalálni, hol lehet a generatív AI-nak valódi, mérhető szerepe a vállalkozásodban, érdemes a problémából kiindulni, nem a legújabb AI-eszközből.**

---

## Források

- Vaswani et al.: [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- Hugging Face: [Causal Language Modeling](https://huggingface.co/docs/transformers/tasks/language_modeling)
- Hugging Face: [Generation Strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies)
- Hugging Face: [Diffusers Quickstart](https://huggingface.co/docs/diffusers/en/quicktour)
- Hugging Face: [Stable Diffusion Image-to-Image](https://huggingface.co/docs/diffusers/main/api/pipelines/stable_diffusion/img2img)
- Hugging Face: [Diffusers](https://huggingface.co/docs/diffusers/main/index)
- OpenAI: [Audio API Reference](https://platform.openai.com/docs/api-reference/audio/voice-consent-list)
- European Commission: [AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
- European Commission: [Quick Facts: Transparency Rules for AI Systems](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems)
