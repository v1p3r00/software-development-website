---
title: "LLM vs. SLM: mi a különbség, és mikor melyiket érdemes használni?"
description: "LLM vagy SLM? Megmutatjuk, mikor érdemes nagy vagy kis nyelvi modellt választanod költség, sebesség, adatvédelem és infrastruktúra alapján."
tags: [ai, llm, slm, adatvédelem, automatizáció]
date: 2026-10-19 08:00
image: /articles/llm-vs-slm/share-hu.jpg
---

## Nem mindig a nagyobb AI-modell a jobb választás

Az AI-ról szóló beszélgetésekben gyakran úgy tűnik, hogy minél nagyobb egy modell, annál jobb.

Ez bizonyos feladatoknál valóban lehet előny. Egy nagy nyelvi modell, vagyis LLM, rengeteg különböző feladatra használható: szövegírásra, összefoglalásra, programozásra, fordításra, kérdések megválaszolására vagy összetett utasítások követésére.

De egy vállalkozásnak nem feltétlenül van szüksége egy óriási modellre.

Ha például csak azt szeretnéd, hogy egy rendszer felismerje, hogy egy beérkező e-mail „számlázással”, „szállítással” vagy „reklamációval” kapcsolatos, akkor lehet, hogy egy kisebb modell is tökéletesen megfelel.

Itt jön képbe az SLM, vagyis **Small Language Model**.

> **A kérdés nem az, hogy melyik modell a legerősebb, hanem az, hogy melyik modell elég jó az adott feladatra.**

---

## Mi az LLM és mi az SLM?

Az LLM, vagy Large Language Model, nagy általános célú nyelvi modell.

Az SLM ezzel szemben kisebb méretű, gyakran egy szűkebb feladatra vagy korlátozottabb környezetre optimalizált modell.

Az SLM-re nincs egyetlen, mindenki által elfogadott méretbeli határ. Az AWS például olyan kompakt modellekként írja le őket, amelyek tipikusan 20 milliárdnál kevesebb paraméterrel rendelkeznek, ugyanakkor azt is hangsúlyozza, hogy ez a meghatározás folyamatosan változik. ([AWS](https://aws.amazon.com/blogs/compute/running-and-optimizing-small-language-models-on-premises-and-at-the-edge/))

A Microsoft Phi termékcsaládja például kifejezetten kis méretű modelleket kínál különböző alkalmazásokhoz, míg a Meta Llama családjában egyaránt találunk nagyobb és kifejezetten könnyű, eszközön futtatható modelleket. ([Microsoft Azure](https://azure.microsoft.com/en-us/products/phi))

A különbséget egyszerűen így képzelheted el:

```text
LLM
↓
általánosabb képességek
↓
nagyobb erőforrásigény
↓
összetettebb feladatok

SLM
↓
szűkebb fókusz
↓
kisebb erőforrásigény
↓
gyors, célzott feladatok
```

Ez azonban nem jelenti azt, hogy az SLM egyszerűen egy „butább LLM”.

**Egy kisebb modell egy jól meghatározott feladaton kifejezetten hatékony lehet.**

---

## A legfontosabb különbség: mire használod?

Képzeld el, hogy van egy 50 fős vállalkozásod.

A beérkező e-mailek között minden nap vannak:

- ajánlatkérések,
- számlázási kérdések,
- szállítási problémák,
- reklamációk,
- általános érdeklődések.

Ha az a feladatod, hogy minden e-mailt automatikusan kategorizálj, nincs feltétlenül szükséged egy hatalmas általános célú modellre.

Egy kisebb modell is elvégezheti:

```text
beérkező e-mail
       ↓
     SLM
       ↓
számlázás / szállítás / reklamáció / egyéb
       ↓
megfelelő folyamat
```

Ezzel szemben ha azt mondod:

„Olvasd át ezt a 80 oldalas szerződést, hasonlítsd össze a korábbi verzióval, magyarázd el a változásokat, majd foglald össze vezetői nyelven”,

akkor már sokkal inkább indokolt lehet egy nagyobb és általánosabb modell.

---

## 1. Költség: nem csak az API-számla számít

Az egyik legkézenfekvőbb különbség a költség.

Egy nagyobb modell általában több számítási erőforrást igényel. Ha felhőben használod, ennek lehet közvetlen használati költsége. Ha saját infrastruktúrán futtatod, akkor pedig a hardver, energia, üzemeltetés és karbantartás költsége is számít.

Az AWS szerint az SLM-ek kisebb erőforrásigényük miatt különösen érdekesek lehetnek olyan alkalmazásoknál, ahol a költséghatékonyság és a korlátozott számítási kapacitás fontos szempont. ([AWS](https://aws.amazon.com/blogs/compute/running-and-optimizing-small-language-models-on-premises-and-at-the-edge/))

Az igazán fontos kérdés ezért nem az, hogy:

> „Mennyibe kerül egy AI-modell?”

Hanem:

> **„Mennyibe kerül egy feladat elvégzése ezzel a modellel?”**

Például ha naponta néhány összetett kérdést kell megválaszolnod, egy nagy modell költsége lehet teljesen elfogadható.

Ha viszont egy rendszernek több százezer rövid szöveget kell feldolgoznia, már sokkal érdekesebbé válhat egy kisebb modell.

---

## 2. Sebesség: amikor minden milliszekundum számít

A kisebb modellek egyik fontos előnye az alacsonyabb erőforrásigény.

Az AWS dokumentációja szerint az SLM-ek gyorsabb inference-re és kisebb erőforrásigényre lehetnek alkalmasak, ami különösen hasznos edge környezetben. ([AWS](https://aws.amazon.com/blogs/compute/running-and-optimizing-small-language-models-on-premises-and-at-the-edge/))

Ez olyan helyzetekben lehet fontos, ahol nem szeretnéd, hogy egy egyszerű művelet miatt a kérés elmenjen egy távoli szerverhez, ott feldolgozásra kerüljön, majd visszatérjen az eredmény.

A Microsoft Phi Silica például kifejezetten Windows-eszközökön történő helyi futtatásra optimalizált SLM. A Microsoft szerint az ilyen on-device feldolgozás alacsony késleltetést biztosíthat, miközben a prompt és a válasz helyben marad. ([Microsoft Learn](https://learn.microsoft.com/en-us/windows/ai/cards/phi-silica-platform-card))

Ez például egy laptopon futó alkalmazásnál lehet érdekes.

```text
Felhasználó
   ↓
helyi SLM
   ↓
azonnali feldolgozás
```

szemben:

```text
Felhasználó
   ↓
internet
   ↓
felhő
   ↓
LLM
   ↓
internet
   ↓
eredmény
```

**A kisebb modell egyik legnagyobb előnye az lehet, hogy bizonyos feladatoknál nincs szükség távoli AI-szolgáltatásra.**

---

## 3. Adatvédelem: mi hagyja el a cégedet?

Ez magyar és európai vállalkozásoknál különösen fontos kérdés.

Ha egy felhőben működő AI-szolgáltatásba küldesz adatot, meg kell vizsgálnod, hogy az adat milyen szolgáltatáson keresztül kerül feldolgozásra, milyen szerződéses és adatvédelmi feltételek vonatkoznak rá, és pontosan milyen adatokat küldesz.

Az Európai Bizottság GDPR-ról szóló tájékoztatója szerint a személyes adatok feldolgozásánál többek között az adatminimalizálás elvét is alkalmazni kell: csak olyan személyes adatot szabad feldolgozni, amely az adott célhoz szükséges. ([European Commission](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en))

Ebből nem következik az, hogy minden AI-t kötelező helyben futtatni.

Azt viszont igen, hogy **az adatáramlást tudatosan kell megtervezni**.

Egy SLM on-premise vagy on-device futtatása bizonyos esetekben segíthet abban, hogy az érzékeny adatok ne hagyják el az adott infrastruktúrát.

A Meta például a Llama 3.2 1B és 3B modelleket kifejezetten edge- és mobilhasználatra is pozicionálja, és kiemeli az olyan eseteket, amikor az adat helyben marad az eszközön. ([Meta](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/))

Fontos azonban:

**Az, hogy egy modell helyben fut, önmagában még nem jelenti azt, hogy az egész rendszer automatikusan GDPR-kompatibilis.**

A teljes adatkezelési folyamatot kell megvizsgálni.

---

## 4. On-premise: saját gépen, saját szerveren

Az on-premise azt jelenti, hogy az AI-rendszer a saját infrastruktúrádon fut.

Például:

```text
vállalati alkalmazás
       ↓
saját szerver
       ↓
SLM
       ↓
válasz
```

Ez különösen érdekes lehet olyan vállalkozásoknál, ahol érzékeny adatokkal dolgoznak, vagy szigorú belső szabályok vonatkoznak az adatkezelésre.

Az AWS külön is említi az on-premise és edge telepítést olyan helyzetekben, ahol adatrezidencia, információbiztonság vagy alacsony késleltetés fontos. Példaként szabályozott iparágakat és gyártási környezeteket is említ. ([AWS](https://aws.amazon.com/blogs/compute/running-and-optimizing-small-language-models-on-premises-and-at-the-edge/))

De van ára.

A saját AI-infrastruktúra nem csak annyi, hogy „letöltöm a modellt”.

Számolnod kell például:

- megfelelő hardverrel,
- GPU-val vagy más AI-gyorsítóval, ha szükséges,
- memóriával,
- tárhellyel,
- üzemeltetéssel,
- frissítésekkel,
- monitoringgal,
- biztonsággal,
- mentésekkel.

**Az on-premise nem feltétlenül olcsóbb. Elsősorban kontrollt és adatkezelési lehetőségeket ad.**

---

## 5. On-device: amikor maga a laptop vagy telefon futtatja az AI-t

Az on-device még egy lépéssel tovább megy.

Ilyenkor nem egy vállalati szerveren fut az AI, hanem közvetlenül azon az eszközön, ahol az alkalmazás működik.

Erre egyre több példa létezik.

A Microsoft Phi Silica például Windows-eszközök NPU-ján való futtatásra készült. A Microsoft dokumentációja szerint a modell helyben képes többek között szövegértési, összefoglalási és átírási feladatokat végrehajtani. ([Microsoft Learn](https://learn.microsoft.com/en-us/windows/ai/apis/phi-silica-transparency-note))

A Meta pedig a Llama 3.2 1B és 3B modelleket úgy tervezte, hogy bizonyos mobil- és edge-eszközökön is futtathatók legyenek.

Ez például egy olyan alkalmazásnál lehet hasznos, amely:

- offline is működik,
- gyors helyi válaszokat igényel,
- érzékeny adatot kezel,
- vagy gyenge internetkapcsolat mellett is használható kell legyen.

---

## 6. Infrastrukturális különbség

A modell mérete közvetlenül hat az infrastruktúrára.

Egy nagy modellnél könnyen előfordulhat, hogy komolyabb szerveres környezetre van szükség.

Egy kisebb modell viszont akár egy megfelelő laptopon, edge számítógépen vagy vállalati szerveren is futtatható lehet.

A Meta például a Llama 3.2 kisebb modelljeit kifejezetten edge és mobil eszközökre pozicionálja. ([Meta](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/))

A gyakorlatban tehát nem egyszerűen ezt kell kérdezned:

„Melyik modell a jobb?”

Hanem ezt:

```text
Feladat
  ↓
Szükséges pontosság
  ↓
Adatérzékenység
  ↓
Sebességigény
  ↓
Forgalom
  ↓
Elérhető hardver
  ↓
üzemeltetési költség
  ↓
modellválasztás
```

---

## 7. Konkrét üzleti példák

### Példa 1: E-mail kategorizálása

Egy webáruház napi több száz e-mailt kap.

A rendszernek csak azt kell eldöntenie:

- rendelés,
- számla,
- szállítás,
- reklamáció,
- egyéb.

**Erre egy SLM jó jelölt lehet.**

Nem kell általános célú, minden problémát megoldó AI.

---

### Példa 2: Belső dokumentumok keresése

Egy 100 fős vállalkozás munkatársai belső szabályzatokra kérdeznek rá.

Itt nem feltétlenül az a legfontosabb, hogy maga a modell óriási legyen.

Sokkal fontosabb lehet, hogy a rendszer megfelelően megtalálja a vállalati dokumentumokat.

Egy kisebb modell + RAG rendszer sok esetben érdekes alternatíva lehet.

```text
kérdés
  ↓
dokumentumok keresése
  ↓
releváns részek
  ↓
SLM
  ↓
válasz
```

Az AWS is kiemeli, hogy SLM-eknél RAG és fine-tuning segítségével egy adott területre specializált teljesítmény javítható. ([AWS](https://aws.amazon.com/blogs/compute/running-and-optimizing-small-language-models-on-premises-and-at-the-edge/))

---

### Példa 3: Gyártási környezet

Egy gyárban egy gép érzékelői folyamatosan adatot küldenek.

A cél nem egy hosszú, kreatív szöveg megírása.

A cél például:

„Van-e olyan mintázat, amely karbantartási problémára utal?”

Ilyen edge környezetben egy kisebb modell különösen érdekes lehet.

Az AWS konkrétan említi a gyártási környezeteket, ahol SLM-eket helyben lehet használni termelési adatok elemzésére és valós idejű berendezés-diagnosztikára. ([AWS](https://aws.amazon.com/blogs/compute/running-and-optimizing-small-language-models-on-premises-and-at-the-edge/))

---

### Példa 4: Marketinges szövegírás

Ha viszont azt kéred:

„Írj három különböző kampánykoncepciót egy új prémium termékhez, majd hasonlítsd össze őket és készíts hozzájuk célcsoport-specifikus üzeneteket”,

akkor már fontosabb lehet az általános nyelvi képesség és az összetettebb utasítások kezelése.

Itt egy nagyobb LLM lehet indokoltabb.

---

## 8. Az SLM-nek is vannak korlátai

Az SLM nem varázslatos megoldás.

A kisebb modell általában korlátozottabb kapacitással rendelkezik, és bizonyos összetett vagy általános feladatoknál gyengébb lehet egy nagyobb modellnél.

Az AWS is hangsúlyozza, hogy az SLM-ek bizonyos esetekben korlátozottabbak lehetnek hatókör és pontosság szempontjából, miközben célzott feladatokra megfelelő finomhangolással vagy RAG-gel erősek lehetnek. ([AWS](https://aws.amazon.com/blogs/compute/running-and-optimizing-small-language-models-on-premises-and-at-the-edge/))

Ráadásul a kisebb modell üzemeltetése sem automatikusan egyszerű.

Ha saját szerveren futtatod, akkor te felelsz a rendszerért.

Egy felhős AI API esetén a szolgáltató kezeli az infrastruktúra jelentős részét.

Ezért a döntésnek nem csak technológiai, hanem üzleti oldala is van.

---

## 9. Nem muszáj választanod a kettő között

Talán ez az egyik legfontosabb felismerés.

Nem kell minden feladatot ugyanazzal a modellel megoldani.

Egy vállalati rendszer használhat több modellt is.

Például:

```text
egyszerű kérdés
      ↓
SLM
      ↓
gyors válasz

összetett kérdés
      ↓
LLM
      ↓
részletesebb feldolgozás

érzékeny adat
      ↓
helyi SLM
      ↓
nem kerül ki a hálózatból
```

Ezt akár routingnak is nevezheted: a rendszer a feladat alapján eldönti, melyik modellhez küldje a kérést.

Így nem kell egy drága és erőforrás-igényes modellt használni minden egyes egyszerű feladatra.

---

## 10. Hogyan dönts vállalkozóként?

A modellválasztást érdemes a feladattal kezdeni, nem a modellek neveivel.

Tedd fel ezeket a kérdéseket:

### Mennyire összetett a feladat?

Egyszerű kategorizálás vagy összetett elemzés?

### Mennyire fontos a sebesség?

Elfogadható néhány másodperc várakozás, vagy azonnali válasz kell?

### Mennyire érzékenyek az adatok?

Van személyes adat, üzleti titok, ügyféladat vagy belső dokumentum?

### Hol szeretnéd futtatni?

Felhőben, saját szerveren vagy közvetlenül az eszközön?

### Mekkora a forgalom?

Napi tíz kérdésről beszélünk, vagy több százezer feldolgozásról?

### Van saját infrastruktúrád?

Ha nincs, lehet, hogy egy felhős szolgáltatás egyszerűbb és olcsóbb összességében.

### Megéri az üzemeltetés?

A saját SLM lehet technikailag vonzó, de a modell mellett a teljes infrastruktúrát is üzemeltetned kell.

---

## LLM vagy SLM? Először a problémát válaszd ki

Az LLM és az SLM nem feltétlenül két egymással versengő technológia.

Inkább két különböző eszköz ugyanabban az eszköztárban.

**LLM akkor lehet indokolt, ha általános, összetett, változatos feladatokat szeretnél megoldani, és a nagyobb infrastruktúra- vagy szolgáltatási költség elfogadható.**

**SLM akkor lehet érdekes, ha célzott feladatod van, fontos a gyorsaság, az alacsonyabb erőforrásigény, a helyi feldolgozás vagy az on-device működés.**

A legjobb megoldás pedig akár a kettő kombinációja is lehet.

---

## A vállalkozásodnak tényleg nagy modellre van szüksége?

Ha AI-rendszert szeretnél bevezetni, nem érdemes automatikusan a legnagyobb vagy legismertebb modellel kezdeni.

Először érdemes meghatározni a konkrét feladatot, az adatokat, a kívánt sebességet, a biztonsági követelményeket és az elfogadható költséget. Ezután már sokkal könnyebb eldönteni, hogy LLM, SLM, helyi modell vagy ezek kombinációja illik a rendszerhez.

**softwaredevelopment.hu — A jó AI-megoldás nem attól jó, hogy a legnagyobb modellt használja, hanem attól, hogy a megfelelő problémát a megfelelő technológiával oldja meg.**

---

## Források

- AWS: [Running and optimizing small language models on-premises and at the edge](https://aws.amazon.com/blogs/compute/running-and-optimizing-small-language-models-on-premises-and-at-the-edge/)
- Microsoft Azure: [Phi Open Models - Small Language Models](https://azure.microsoft.com/en-us/products/phi)
- Microsoft Learn: [Phi Silica platform card](https://learn.microsoft.com/en-us/windows/ai/cards/phi-silica-platform-card)
- Microsoft Learn: [Transparency Note: Phi Silica on Non-Copilot+ PCs](https://learn.microsoft.com/en-us/windows/ai/apis/phi-silica-transparency-note)
- Meta AI: [Llama 3.2: Revolutionizing edge AI and vision with open, customizable models](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/)
- European Commission: [Principles of personal data processing under the GDPR](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en)
