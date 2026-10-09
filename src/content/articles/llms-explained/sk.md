---
title: "LLM zrozumiteľne: ako vlastne funguje veľký jazykový model?"
description: "Praktické vysvetlenie tokenov, tréningu, inferencie, kontextového okna, teploty a halucinácií – bez zbytočného AI žargónu."
tags: [ai, llm, machine-learning, chatbots, technology]
date: 2026-10-18 08:00
image: /articles/llms-explained/share.jpg
---

## Čo sa vlastne deje, keď sa AI na niečo opýtate?

Do AI chatbota napíšete napríklad „Napíš krátke predstavenie mojej firmy“ a o pár sekúnd dostanete vyšperkovanú odpoveď.

Môžete mať pocit, že za obrazovkou sedí veľmi rýchly človek, ktorý si vašu požiadavku prečíta, porozmýšľa o nej a napíše odpoveď.

V skutočnosti sa deje niečo iné.

Veľký jazykový model (Large Language Model, LLM) spracúva text ako číselné reprezentácie, učí sa štatistické vzory z veľmi rozsiahlych tréningových dát a potom generuje odpoveď token po tokene.

Kurz Machine Learning Crash Course od Googlu opisuje jazykové modely ako systémy, ktoré odhadujú pravdepodobnosť výskytu tokenov alebo sekvencií tokenov v rámci dlhšej sekvencie. ([Google for Developers](https://developers.google.com/machine-learning/crash-course/llm))

Znie to zložito, no existuje užitočné prirovnanie z každodenného života.

> **LLM je mimoriadne sofistikovaný systém na predpovedanie textu, ktorý sa naučil dosť vzorov na to, aby zvládol prekvapivo široké spektrum jazykových úloh.**

---

## 1. LLM v skutočnosti nevidí slová

Jedna z prvých vecí, ktoré sa oplatí pochopiť: LLM nemusí nevyhnutne spracúvať celé slová.

Skôr než sa váš text dostane k modelu, prejde tokenizerom. Tokenizer rozdelí text na menšie jednotky, ktoré sa nazývajú tokeny.

Token môže byť:

- celé slovo,
- časť slova,
- interpunkčné znamienko,
- alebo, v závislosti od tokenizera, menšia jednotka na úrovni znakov.

Moderné jazykové modely bežne používajú tokenizáciu na podslová (subword tokenization). Napríklad anglické slovo:

`unwatched`

môže byť reprezentované ako:

`un` + `watch` + `ed`

Presný výsledok závisí od modelu a jeho tokenizera. Hugging Face dokumentuje viacero bežných prístupov vrátane BPE, Unigram a WordPiece. ([Hugging Face](https://huggingface.co/docs/transformers/tokenizer_summary))

Rovnaký princíp platí aj pre iné jazyky. Dlhé alebo nezvyčajné slovo – v slovenčine napríklad s bohatým skloňovaním – sa môže rozdeliť na viacero tokenov namiesto toho, aby sa spracovalo ako jeden celok.

Tieto tokeny sa napokon priradia k číselným ID, s ktorými model dokáže pracovať.

Zjednodušene:

```text
"Vytvor mi web"
        ↓
tokenizácia
        ↓
[token 1] [token 2] [token 3] ...
        ↓
čísla
        ↓
LLM
```

**Model teda vašu vetu nečíta priamo tak ako človek. Spracúva jej číselnú reprezentáciu.**

V praxi je to dôležité, pretože rôzne modely môžu používať rôzne spôsoby tokenizácie. Ten istý text preto môže v závislosti od modelu spotrebovať rôzny počet tokenov.

---

## 2. Ako sa model učí jazyk?

Tu to začína byť zaujímavejšie.

Ako sa systém, ktorý v konečnom dôsledku pracuje s číslami, naučí písať prirodzeným jazykom, odpovedať na otázky alebo generovať kód?

V úplnom základe sa jazykový model trénuje na obrovskom množstve textu a učí sa predpovedať, čo bude nasledovať.

Kauzálny jazykový model, teda architektúra, akú používajú modely typu GPT, predpovedá ďalší token na základe tokenov, ktoré mu predchádzajú. Hugging Face opisuje kauzálne jazykové modelovanie ako predpovedanie ďalšieho tokenu z predchádzajúceho kontextu. ([Hugging Face](https://huggingface.co/docs/course/chapter1/5))

Napríklad:

```text
"Firma spúšťa svoj nový web budúci"
                                      ↓
                          pravdepodobný ďalší token?
                                      ↓
                                  "týždeň"
```

Model vykonáva takéto predpovede počas tréningu znova a znova.

Keď sa v predpovedi pomýli, tréningový proces vypočíta chybu a upraví vnútorné parametre modelu.

Na obrovskom množstve tréningových príkladov sa model postupne zlepšuje v predpovedaní jazyka.

Je dôležité nepredstavovať si to tak, že ho niekto ručne učí gramatické pravidlá.

Nikto nemusí modelu hovoriť:

„Toto je podstatné meno.“

„Toto je sloveso.“

„Toto slovo patrí k tamtomu slovu.“

Mnohé z týchto vzťahov namiesto toho vyplynú zo štatistických vzorov, ktoré sa model naučí počas tréningu.

---

## 3. Čo je Transformer?

Moderné LLM sú bežne postavené na architektúre Transformer.

Transformer bol predstavený v roku 2017 vo výskumnom článku „Attention Is All You Need“. Jeho ústrednou myšlienkou bol mechanizmus pozornosti (attention), ktorý modelu umožňuje spracúvať vzťahy medzi rôznymi časťami sekvencie. ([arXiv](https://arxiv.org/abs/1706.03762))

Prečo je to dôležité?

Zoberme si túto vetu:

> „Firma oslovila vývojára, pretože vytvoril nový e-shop.“

Na to, aby model správne pochopil, kto „vytvoril“ e-shop, záleží na okolitom kontexte.

Model musí zohľadniť vzťahy medzi rôznymi tokenmi, a nie brať každé slovo ako izolovanú položku.

Attention poskytuje matematický mechanizmus, ako to urobiť.

Nejde o ľudskú pozornosť. Model sa na slovo doslova „nepozerá“ a nepremýšľa o ňom.

Architektúra namiesto toho vypočítava vzťahy medzi reprezentáciami tokenov a tieto vzťahy využíva pri spracovaní.

**Táto schopnosť modelovať vzťahy naprieč celou sekvenciou je jedným zo základov moderných LLM.**

---

## 4. Tréning a inferencia sú dve rôzne veci

Medzi trénovaním modelu a jeho používaním je dôležitý rozdiel.

Počas tréningu sa parametre modelu aktualizujú.

Keď sa však chatbota na niečo opýtate, model sa tú informáciu zvyčajne neučí tak, že by na mieste menil svoje parametre. Na vygenerovanie odpovede používa parametre, ktoré už má.

Tomu sa hovorí inferencia.

Zjednodušene to vyzerá takto:

```text
vaša otázka
     ↓
tokenizácia
     ↓
tokeny + kontext
     ↓
model Transformer
     ↓
pravdepodobnosti ďalšieho tokenu
     ↓
výber jedného tokenu
     ↓
pravdepodobnosti ďalšieho tokenu
     ↓
...
     ↓
výsledná odpoveď
```

Dokumentácia Hugging Face Transformers ukazuje rovnaký základný postup: text sa tokenizuje, prejde modelom, vygenerujú sa nové ID tokenov a tie sa dekódujú späť na text. ([Hugging Face](https://huggingface.co/docs/transformers/quicktour))

**Odpoveď teda zvyčajne nevzniká ako jeden obrovský blok. Model ju generuje postupne, token po tokene.**

Toto rozlíšenie sa hodí, keď sa snažíme pochopiť pojmy ako teplota, kontextové okno či halucinácie.

---

## 5. Čo je kontextové okno?

Predstavte si, že pracujete na veľkom projekte a na stole máte kopu dokumentov.

Čím viac miesta máte, tým viac dokumentov môžete mať naraz pred sebou.

Kontextové okno modelu funguje podobne.

Určuje, koľko tokenizovaných informácií môže byť zahrnutých v kontexte, ktorý má model k dispozícii pri konkrétnej úlohe.

Tento kontext môže obsahovať:

- vašu aktuálnu otázku,
- predchádzajúce správy,
- systémové pokyny,
- dokumenty,
- vyhľadané firemné informácie,
- výsledky nástrojov,
- ďalšie relevantné dáta.

Napríklad:

```text
pokyny
+
história konverzácie
+
firemné dokumenty
+
informácie o zákazníkovi
+
aktuálna otázka
        ↓
   kontextové okno
        ↓
       LLM
```

Materiály Googlu o LLM vysvetľujú, aký dôležitý je kontext pre predpovede jazykového modelu, pričom moderné generatívne AI systémy podporujú čoraz väčšie kontextové okná. ([Google for Developers](https://developers.google.com/machine-learning/crash-course/llm))

Väčšie kontextové okno automaticky neznamená, že je model inteligentnejší.

Znamená to, že mu v rámci jednej interakcie možno poskytnúť viac informácií.

Pre firemné aplikácie to môže byť mimoriadne užitočné.

Interný firemný asistent môže napríklad potrebovať pracovať s:

- produktovou dokumentáciou,
- postupmi zákazníckej podpory,
- internými smernicami,
- históriou predchádzajúcej konverzácie,
- a aktuálnou otázkou používateľa.

Je tu však dôležitý rozdiel:

**To, že informáciu do kontextu vložíte, ešte nezaručuje, že model každú jej časť použije správne.**

---

## 6. Čo vlastne robí teplota?

Teplota (temperature) je ďalší pojem, ktorý sa často chápe nesprávne.

Neznamená, že modelu prikazujete „premýšľať intenzívnejšie“.

Počas generovania model priraďuje pravdepodobnosti možným ďalším tokenom. Teplota ovplyvňuje, ako sa tieto pravdepodobnosti využijú pri výbere ďalšieho tokenu.

Nižšia teplota vo všeobecnosti robí generovanie predvídateľnejším a sústredenejším.

Vyššia teplota môže priniesť rozmanitejšie a kreatívnejšie výsledky. Dokumentácia Google Vertex AI opisuje teplotu ako parameter vzorkovania, ktorý riadi mieru náhodnosti pri výbere tokenov. ([Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/content-generation-parameters))

Jednoducho si to môžete predstaviť takto:

**Nižšia teplota:** „Uprednostni najpravdepodobnejšiu možnosť.“

**Vyššia teplota:** „Dovoľ, aby sa menej pravdepodobné možnosti vyberali častejšie.“

To môže dávať zmysel pri kreatívnom písaní, brainstormingu alebo hľadaní alternatívnych nápadov.

Pri štruktúrovanej firemnej úlohe budete možno chcieť predvídateľnejší výstup.

Teplota však nie je zázračné nastavenie „presnosti“.

Jej znížením sa z LLM nestane databáza na overovanie faktov.

---

## 7. Prečo LLM halucinujú?

Toto je pravdepodobne najdôležitejšie obmedzenie, ktoré treba pochopiť.

LLM môže vytvoriť odpoveď, ktorá znie úplne presvedčivo, a pritom je fakticky nesprávna.

Tomu sa zvyčajne hovorí halucinácia.

Výskum OpenAI o halucináciách z roku 2025 ich opisuje ako vierohodne znejúce, no nepravdivé tvrdenia, ktoré generujú jazykové modely. Výskum sa venuje aj tomu, ako bežné postupy pri tréningu a hodnotení môžu modely viesť k tomu, aby radšej hádali, než priznali neistotu. ([OpenAI](https://openai.com/index/why-language-models-hallucinate/))

Prečo sa to deje?

Pretože LLM v podstate nie je autoritatívna databáza faktov.

Predstavte si, že sa opýtate:

> „Kto v roku 1987 založil fiktívnu firmu Example s.r.o.?“

Model nemusí mať o takejto firme žiadne spoľahlivé informácie.

Jazykové vzory však môžu naznačovať, že vierohodným pokračovaním otázky je meno nejakej osoby.

Model preto môže vygenerovať plynulú odpoveď, aj keď skutočný fakt nemá k dispozícii.

Z toho vyplýva jedno z najdôležitejších pravidiel pri používaní AI:

**Sebavedomá odpoveď nie je nevyhnutne overená odpoveď.**

Vo firemnom prostredí je tento rozdiel nesmierne dôležitý.

Nesprávna špecifikácia produktu môže byť nepríjemná.

Nesprávne právne, finančné, zdravotné či zmluvné tvrdenie môže mať oveľa vážnejšie následky.

Preto by sa dôležité informácie vygenerované AI mali overovať v spoľahlivých zdrojoch alebo by sa mali opierať o dôveryhodné firemné dáta.

---

## 8. Je teda LLM len automatické dopĺňanie textu?

V istom zmysle áno.

V inom zmysle je takýto opis príliš zjednodušený.

Predpovedanie ďalšieho tokenu je základom toho, ako sa mnohé moderné jazykové modely trénujú a používajú.

Vzory, ktoré sa model týmto spôsobom naučí, však môžu byť mimoriadne bohaté.

Kurz Googlu o LLM vysvetľuje, že modelovaním štatistických vzorov v tokenoch si moderné jazykové modely vytvárajú silné vnútorné reprezentácie, ktoré umožňujú úlohy ako generovanie textu, preklad či sumarizáciu. ([Google for Developers](https://developers.google.com/machine-learning/crash-course/llm))

Nazvať LLM „automatickým dopĺňaním“ je teda trochu ako povedať:

„Auto je v podstate stroj, ktorý otáča kolesami.“

Technicky pravda.

Ako vysvetlenie fungovania celého systému to však veľmi nepomôže.

Mechanizmus predpovedania ďalšieho tokenu je základ. Schopnosti, ktoré vznikajú pri trénovaní veľkých modelov Transformer, sú oveľa širšie.

---

## 9. Čo to všetko znamená pre firmu?

Ak vediete malú alebo strednú firmu, nemusíte rozumieť každému detailu matematiky Transformerov.

Pochopenie základov vám však môže pomôcť vyhnúť sa drahým omylom.

### AI automaticky nevie, čo je pravda

Ak na informácii záleží, overte si ju.

### Na kontexte záleží

Kvalita a relevantnosť informácií, ktoré modelu poskytnete, môže výrazne ovplyvniť užitočnosť jeho odpovede.

### LLM automaticky nepozná vašu firmu

Ak model nemá prístup k vášmu CRM, dokumentom, produktovej databáze či interným systémom, nemôže tieto veci jednoducho „vedieť“ len preto, že niekde vo vašej firme existujú.

### LLM je len jednou časťou AI aplikácie

Užitočný firemný systém môže kombinovať LLM s vaším existujúcim softvérom a dátami.

Napríklad:

```text
otázka zákazníka
        ↓
AI asistent
        ↓
vyhľadanie firemných informácií
        ↓
CRM / databáza / dokumenty
        ↓
LLM
        ↓
odpoveď alebo akcia
```

**V mnohých reálnych firemných aplikáciách neprináša hodnotu ani tak samotné LLM, ako skôr prepojenie modelu so správnymi informáciami a procesmi.**

Aj preto môžu dve firmy, ktoré používajú ten istý model, skončiť s úplne odlišnými AI systémami.

Jedna ho môže využívať len ako asistenta na písanie.

Druhá ho môže prepojiť s CRM, produktovým katalógom, internou dokumentáciou a procesom zákazníckej podpory.

Samotný model je len jednou zo súčastí.

---

## 10. Päť vecí, ktoré si oplatí zapamätať

Ak z tohto článku zabudnete všetko ostatné, zapamätajte si týchto päť bodov:

- **Tokeny sú jednotky textu, ktoré jazykový model spracúva; nemusia to byť celé slová.**
- **Tréning učí model štatistické vzory pomocou veľkého množstva dát a opakovanej optimalizácie.**
- **Inferencia je proces, pri ktorom sa natrénovaný model používa na generovanie odpovede.**
- **Kontextové okno určuje, koľko informácií možno v danej interakcii poskytnúť ako kontext.**
- **Plynulá a sebavedomá odpoveď môže byť napriek tomu fakticky nesprávna.**

Keď vám tieto pojmy dávajú zmysel, ďalšie AI pojmy sa chápu oveľa ľahšie.

Embeddingy, RAG, AI agenti, function calling či používanie nástrojov nie sú izolované kúsky mágie. Sú to ďalšie mechanizmy, ktoré sa dajú postaviť okolo jazykových modelov, aby boli v reálnych aplikáciách užitočnejšie.

---

## Čo by mohlo LLM reálne urobiť pre vašu firmu?

Nie každý firemný problém potrebuje AI model.

Niekedy je lepším riešením bežná automatizácia. Niekedy stačí existujúce LLM API. V iných prípadoch je skutočnou príležitosťou AI asistent prepojený s vlastnými dátami a systémami vašej firmy.

Užitočná otázka preto neznie jednoducho „Kam môžeme dať AI?“

Ale:

> **„Ktorý firemný problém by sa s AI systémom stal naozaj jednoduchším, rýchlejším alebo spoľahlivejším?“**

**softwaredevelopment.hu — Ak chcete zistiť, kde môže mať AI vo vašej firme reálne miesto, začnite problémom, nie technológiou.**

---

## Zdroje

- Google for Developers: [Introduction to Large Language Models](https://developers.google.com/machine-learning/crash-course/llm)
- Hugging Face: [How 🤗 Transformers solve tasks](https://huggingface.co/docs/course/chapter1/5)
- Hugging Face: [Tokenization algorithms](https://huggingface.co/docs/transformers/tokenizer_summary)
- Hugging Face: [Quicktour](https://huggingface.co/docs/transformers/quicktour)
- Google Cloud: [Content generation parameters](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/content-generation-parameters)
- OpenAI: [Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/)
- Vaswani et al.: [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
