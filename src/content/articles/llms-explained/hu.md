---
title: "LLM érthetően: hogyan működik valójában egy nagy nyelvi modell?"
description: "Mi történik a háttérben, amikor egy LLM választ ad? Tokenek, tanítás, inference, context window, temperature és hallucináció közérthetően."
tags: [ai, llm, gépi-tanulás, chatbot, technológia]
date: 2026-10-18 08:00
image: /articles/llms-explained/share-hu.jpg
---

## Mi történik valójában, amikor beírsz egy kérdést egy AI-nak?

Amikor beírod egy chatbotba, hogy „Írj egy rövid bemutatkozó szöveget a vállalkozásomnak”, kívülről úgy tűnik, mintha egy nagyon gyorsan gondolkodó ember válaszolna.

A háttérben azonban egészen más történik.

Egy Large Language Model, vagyis LLM nem úgy működik, mint egy ember, aki elővesz egy könyvet, megkeresi benne a választ, majd megfogalmazza azt. A modell szövegeket dolgoz fel, matematikai mintázatokat tanul meg belőlük, majd a kapott kontextus alapján tokenenként generálja a választ.

A Google Machine Learning Crash Course megfogalmazása szerint a nyelvi modellek tokenek vagy tokensorozatok valószínűségét becsülik egy hosszabb szövegkörnyezetben. ([Google for Developers](https://developers.google.com/machine-learning/crash-course/llm))

Ez elsőre száraznak hangzik, pedig egy egyszerű hasonlattal jól érthető.

> **Az LLM lényegében egy rendkívül összetett szöveg-kiegészítő rendszer – csak olyan nagy mennyiségű mintázatot tanult meg, hogy nagyon sokféle feladatot képes megoldani.**

---

## 1. Először nem szavakat lát, hanem tokeneket

Az első fontos félreértés: az LLM nem feltétlenül egész szavakat kezel.

A beírt szöveget egy tokenizer kisebb egységekre, úgynevezett tokenekre bontja. Egy token lehet egy teljes szó, egy szó egy része, egy írásjel vagy akár egyetlen karakter.

Például egy angol szó:

`unwatched`

felbontható például:

`un` + `watch` + `ed`

A pontos felbontás modelltől és tokenizerétől függ. A modern modellek gyakran úgynevezett subword tokenizációt használnak. ([Hugging Face](https://huggingface.co/docs/transformers/tokenizer_summary))

Magyarul ez különösen érdekes, mert a hosszú, összetett szavak miatt a tokenizáció nem mindig esik egybe a szavakkal.

A tokenizer végül nem egyszerűen szöveget ad át a modellnek. A tokenekhez számok, úgynevezett token ID-k tartoznak.

A folyamat leegyszerűsítve:

```text
"Írj egy weboldalt"
        ↓
tokenizálás
        ↓
[token 1] [token 2] [token 3] ...
        ↓
számokká alakítás
        ↓
LLM
```text

**A modell tehát nem közvetlenül a mondatokat „olvassa”, hanem azok numerikus reprezentációjával dolgozik.**

A tokenizálásnak üzleti szempontból is van jelentősége. A különböző modellek különböző tokenizerrel működhetnek, ezért ugyanaz a szöveg nem feltétlenül ugyanannyi tokenből áll minden modell esetében.

---

## 2. Hogyan tanul meg egy modell nyelvet?

A következő kérdés még érdekesebb.

Hogyan lesz egy számokkal dolgozó rendszerből olyan modell, amely képes magyarul, angolul vagy akár programozási nyelveken szöveget generálni?

Az alapfolyamatot legegyszerűbben úgy lehet elképzelni, mint egy hatalmas gyakorlófeladatot.

A modell rengeteg szöveges példán keresztül tanul mintázatokat. A klasszikus causal language modelling esetében a feladat az, hogy a korábbi tokenek alapján megjósolja a következő tokent. A Hugging Face dokumentációja ezt a GPT-szerű decoder modellek egyik alapvető működéseként írja le. ([Hugging Face](https://huggingface.co/docs/course/chapter1/5))

Például:

```text
"A cégünk új weboldala jövő héten"
                                      ↓
                           következő token?
                                      ↓
                              "indul"
```text

A modell nem egyszer tanulja meg ezt, hanem óriási mennyiségű példán keresztül folyamatosan módosítja a belső paramétereit.

A tréning során a modell előrejelzést készít, összehasonlítják az elvárt eredménnyel, majd a tanítási algoritmus módosítja a paramétereket.

Ezekből a paraméterekből nagyon sok lehet. Nem érdemes azonban úgy elképzelni őket, mint egy adatbázist, amelyben minden mondat külön el van tárolva.

Inkább úgy képzeld el, mint egy hatalmas matematikai hálózatot, amely megtanulja, milyen mintázatok kapcsolódnak egymáshoz.

---

## 3. A Transformer tette igazán használhatóvá a modern LLM-eket

A mai nagy nyelvi modellek mögött jellemzően Transformer-alapú architektúrák állnak.

A Transformer architektúrát a 2017-es „Attention Is All You Need” című tanulmány mutatta be. A megközelítés központi eleme az attention, amely lehetővé teszi, hogy a modell a bemenet különböző részei közötti kapcsolatokat kezelje. ([arXiv](https://arxiv.org/abs/1706.03762))

Miért fontos ez?

Nézzünk egy egyszerű mondatot:

> „A vállalkozás megkereste a fejlesztőt, mert ő készítette az új webshopot.”

Ahhoz, hogy a modell értelmezze az „ő” jelentését, fontos lehet a mondat korábbi része.

Az attention segítségével a modell különböző tokenek közötti kapcsolatokra tud figyelni.

Nem arról van szó, hogy a modellnek van egy emberhez hasonló „figyelme”. Ez egy matematikai mechanizmus, amely meghatározza, hogy az adott feldolgozás során mely információk milyen súllyal járulnak hozzá a következő lépésekhez.

**Ez az egyik oka annak, hogy a modern LLM-ek sokkal többre képesek egyszerű szövegkiegészítésnél.**

---

## 4. Mi történik, amikor már nem tanul, hanem válaszol?

A modell betanítása és használata két különböző folyamat.

A betanítás során a modell paraméterei módosulnak.

Amikor viszont beírod a kérdésedet egy chatbotba, általában már nem történik ilyen tanítás. A modell a meglévő paraméterei alapján számítja ki a választ.

Ezt inference-nek, vagyis következtetésnek nevezik.

A folyamat leegyszerűsítve:

```text
kérdés
  ↓
tokenizálás
  ↓
tokenek + kontextus
  ↓
Transformer modell
  ↓
következő token valószínűségei
  ↓
egy token kiválasztása
  ↓
következő token valószínűségei
  ↓
...
  ↓
kész válasz
```text

A Hugging Face Transformers dokumentációja is hasonló folyamatot mutat: a bemenet tokenizálása után a modell generálja a tokeneket, amelyeket végül visszaalakít szöveggé. ([Hugging Face](https://huggingface.co/docs/transformers/quicktour))

**Fontos: a válasz nem egyetlen óriási műveletként születik meg. A modell a generálás során egymás után választja ki a következő tokeneket.**

---

## 5. Mi az a context window?

Ha az LLM egy beszélgetésben korábbi üzeneteket is figyelembe vesz, felmerül egy fontos kérdés:

Meddig „lát vissza”?

Erre szolgál a context window, vagyis kontextusablak.

Ez határozza meg, hogy egy adott modell egy feldolgozás során mekkora tokenmennyiséget tud figyelembe venni.

Érdemes úgy elképzelni, mint egy asztalt.

Ha egy kis asztalon dolgozol, csak bizonyos mennyiségű dokumentum fér el egyszerre.

Egy nagyobb asztalra több dokumentumot tudsz kitenni.

```text
utasítás
+
korábbi beszélgetés
+
dokumentumok
+
felhasználói adatok
+
aktuális kérdés
        ↓
   context window
        ↓
       LLM
```text

A nagyobb context window tehát nem egyszerűen azt jelenti, hogy „okosabb” a modell.

Azt jelenti, hogy több információt lehet egyetlen feldolgozás során elé tenni.

A Google dokumentációja például külön kezeli a kontextus szerepét a nyelvi modellek működésében, és a modern rendszerek egyre nagyobb kontextusablakokat támogatnak. ([Google for Developers](https://developers.google.com/machine-learning/crash-course/llm))

Ez üzleti alkalmazásoknál különösen fontos lehet.

Egy belső vállalati asszisztens például dolgozhat:

- ügyfélszolgálati dokumentációval,
- termékleírásokkal,
- belső szabályzatokkal,
- korábbi beszélgetésekkel,
- aktuális felhasználói kérdéssel.

De attól, hogy mindezt „be tudjuk tenni” a rendszerbe, még nem biztos, hogy minden információt egyformán jól használ fel.

---

## 6. És akkor mi az a temperature?

A temperature az egyik gyakran félreértett beállítás.

Nem azt szabályozza, hogy a modell „mennyire gondolkodik”.

A generálás során a modell több lehetséges következő tokenhez különböző valószínűségeket rendel. A temperature azt befolyásolja, hogy ezekből mennyire legyen kiszámítható vagy változatos a választás.

Alacsonyabb temperature általában kiszámíthatóbb, koncentráltabb eredményt ad.

Magasabb temperature változatosabb, kreatívabb kimenetet eredményezhet. A Google Vertex AI dokumentációja ugyanezt írja le a sampling folyamat részeként. ([Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/content-generation-parameters))

Egyszerű hasonlattal:

**Alacsony temperature:** „Válaszd azt, ami a legvalószínűbb.”

**Magasabb temperature:** „Választhatsz a kevésbé valószínű lehetőségek közül is.”

Ezért egy kreatív szövegírási feladat és egy strukturált adatfeldolgozási feladat nem feltétlenül ugyanazokat a generálási beállításokat igényli.

Fontos viszont, hogy a temperature önmagában nem oldja meg a pontatlanság problémáját.

---

## 7. Miért hallucinál egy LLM?

Talán ez a legfontosabb része az egész témának.

Egy LLM képes nagyon magabiztosan olyan dolgot állítani, ami nem igaz.

Ezt nevezzük hallucinationnek, vagyis hallucinációnak.

Az OpenAI 2025-ös kutatása szerint a nyelvi modellek képesek olyan állításokat generálni, amelyek hihetőnek tűnnek, de hamisak. A kutatás egyik fontos megállapítása, hogy a modellek tanítási és értékelési folyamatai bizonyos helyzetekben a találgatást is ösztönözhetik a bizonytalanság kifejezése helyett. ([OpenAI](https://openai.com/index/why-language-models-hallucinate/))

Miért történik ez?

Mert az LLM alapvetően nem egy igazság-adatbázis.

Ha azt kérdezed:

> „Ki alapította 1987-ben a példabeli vállalkozást?”

a modell nem feltétlenül tudja egyszerűen ellenőrizni, hogy létezik-e ilyen vállalkozás.

Ha a kérdéshez hasonló nyelvi mintázatok alapján egy név valószínűnek tűnik, a modell generálhat egy meggyőző választ.

**A nyelvileg meggyőző válasz és a tényszerűen helyes válasz két külön dolog.**

Ezért üzleti környezetben különösen veszélyes lehet vakon elfogadni egy AI által generált információt.

---

## 8. Akkor az LLM „csak következő szót jósol”?

Igen is, meg nem is.

A következő token előrejelzése valóban a modern language modellek alapvető mechanizmusa.

De ebből nem következik, hogy a rendszer egyszerűen egy óriási autocomplete.

A modell tanítása során olyan összetett statisztikai reprezentációkat alakít ki, amelyek segítségével képes lehet összefoglalni, fordítani, programkódot generálni, strukturált szöveget készíteni vagy összetett utasításokat követni.

A Google LLM-tananyaga is kiemeli, hogy a tokenek mintázatainak modellezéséből a rendszerek rendkívül erős nyelvi reprezentációkat tudnak kialakítani. ([Google for Developers](https://developers.google.com/machine-learning/crash-course/llm))

A „következő token” tehát inkább az alapmechanizmus, mintsem a teljes magyarázat.

Olyan, mintha azt mondanánk, hogy egy autó „lényegében csak kereket forgat”.

Technikailag igaz, de nem magyarázza el, hogyan lett belőle működő autó.

---

## 9. Mit jelent mindez egy vállalkozás számára?

Ha vállalkozóként AI-eszközt szeretnél használni, nem feltétlenül kell tudnod, hogyan működik minden neuron vagy attention layer.

Néhány alapelvet viszont érdemes érteni.

### 1. Az AI nem automatikusan igazságellenőrző

Ha fontos adatot kapsz tőle, ellenőrizd.

### 2. A kontextus számít

Minél jobb és relevánsabb információt kap a modell, annál jobb eséllyel tud megfelelő választ adni.

### 3. Az AI nem tud automatikusan mindent a cégedről

Ha egy modellnek nincs hozzáférése a belső dokumentumaidhoz, CRM-edhez vagy adatbázisodhoz, nem fogja ezeket varázsütésre ismerni.

### 4. A modell és az alkalmazás nem ugyanaz

Egy LLM önmagában csak egy része lehet egy üzleti rendszernek.

Egy valódi AI-megoldás például így nézhet ki:

```text
felhasználói kérdés
        ↓
AI asszisztens
        ↓
vállalati adatok lekérése
        ↓
CRM / adatbázis / dokumentumok
        ↓
LLM
        ↓
válasz vagy művelet
```text

**A valódi üzleti érték sokszor nem magában az LLM-ben, hanem az LLM és a vállalati rendszerek összekapcsolásában van.**

---

## 10. Mit érdemes megjegyezned?

Ha csak néhány dolgot viszel magaddal ebből a cikkből, legyen ez az öt:

- **A token a modell által feldolgozott szövegegység, nem feltétlenül egy teljes szó.**
- **A modell tanítás során nyelvi mintázatokat és összefüggéseket tanul.**
- **Inference során a modell a rendelkezésére álló kontextus alapján generálja a választ.**
- **A context window határozza meg, mennyi információt tud egyszerre figyelembe venni.**
- **A meggyőző válasz nem feltétlenül jelent igaz választ.**

Ha ezt megérted, már sokkal könnyebb eligazodni az olyan kifejezések között is, mint a prompting, RAG, embedding, AI agent vagy function calling.

---

## Milyen AI-megoldásra van valóban szüksége a vállalkozásodnak?

Nem minden problémához kell saját AI-modell, és nem minden chatbotból lesz hasznos üzleti rendszer.

Lehet, hogy egy egyszerű automatizáció elég. Lehet, hogy egy meglévő LLM API-val érdemes dolgozni. Más esetben a vállalati adatokhoz kapcsolt AI-asszisztens lehet a megfelelő irány.

**softwaredevelopment.hu — Ha szeretnéd átgondolni, hogyan lehet az AI-t valódi üzleti folyamatba illeszteni, nézzük meg együtt a problémát, és ne a technológiából induljunk ki.**

---

## Források

- Google for Developers: [Introduction to Large Language Models](https://developers.google.com/machine-learning/crash-course/llm)
- Hugging Face: [How 🤗 Transformers solve tasks](https://huggingface.co/docs/course/chapter1/5)
- Hugging Face: [Tokenization algorithms](https://huggingface.co/docs/transformers/tokenizer_summary)
- Hugging Face: [Quicktour](https://huggingface.co/docs/transformers/quicktour)
- Google Cloud: [Content generation parameters](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/content-generation-parameters)
- OpenAI: [Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/)
- Vaswani et al.: [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
