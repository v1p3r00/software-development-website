---
title: "Prompt engineering: ako dať AI pokyny, ktorým naozaj porozumie"
description: "Dobrý výstup AI začína dobrými pokynmi. Ako využiť kontext, roly, obmedzenia, príklady a štruktúrovaný výstup na spoľahlivejšie výsledky."
tags: [prompt-engineering, prompting, ai, llm, artificial-intelligence]
date: 2026-11-01 08:00
image: /articles/prompt-engineering/share.jpg
---

## Prečo AI nerobí to, o čo ste ju požiadali?

Pravdepodobne ste to už zažili.

Napíšete:

> „Napíš dobré predstavenie mojej firmy.“

AI vytvorí úplne prijateľný, no celkom všeobecný text.

Skúsite to znova:

> „Urob to lepšie.“

Objaví sa ďalšia verzia.

Potom:

> „Urob to profesionálnejšie, ale nie príliš formálne.“

To ho možno trochu vylepší.

Problémom často nie je samotný model.

**Jednoducho ste mu nedali dosť informácií, aby vedel, čo „dobré“ znamená vo vašej konkrétnej situácii.**

Prompt engineering nie je o hľadaní tajnej zaklínacej formulky.

Ide o to, **definovať úlohu, kontext, obmedzenia a želaný výsledok tak jasne, aby model musel hádať čo najmenej dôležitých vecí.**

OpenAI, Anthropic aj Google vo svojich oficiálnych odporúčaniach zdôrazňujú podobné základy: jasné inštrukcie, užitočný kontext, príklady, explicitné formátovanie a postupné zdokonaľovanie. [OpenAI – Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables) [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## Dobrý prompt nemusí byť dlhý

To je dôležité.

Cieľom nie je písať ku každej požiadavke prompt s 2 000 slovami.

Pri jednoduchej úlohe môže stačiť jedna veta:

```text
Zhrň tento text do piatich krátkych odrážok.
```

Zložitá úloha si vyžaduje viac informácií.

Kľúčové otázky sú:

```text
Čo má urobiť?
Pre koho?
V akom kontexte?
Podľa akých pravidiel?
V akom formáte?
Aké dlhé to má byť?
Čo má urobiť, keď chýbajú informácie?
```

**Dobrý prompt nemusí byť dlhý. Jednoducho necháva menej dôležitých vecí nejasných.**

---

## 1. Pomenujte úlohu

Jeden z najčastejších slabých promptov znie:

```text
Napíš niečo o mojom webe.
```

Čo o tom AI vlastne vie?

Veľa nie.

Nevie:

- o aký web ide,
- pre koho je určený,
- aký je cieľ,
- aký dlhý má byť text,
- aký tón použiť,
- akú akciu má čitateľ urobiť.

Lepší prompt:

```text
Napíš 120-slovné predstavenie budapeštianskej
firmy zaoberajúcej sa vývojom webov.

Cieľovou skupinou sú majitelia a manažéri malých
a stredných firiem.

Cieľom je vysvetliť, pri riešení akých obchodných problémov vieme pomôcť.

Použi profesionálny, ale prístupný tón.
Vyhni sa prehnanému marketingovému jazyku.
```

Oficiálne odporúčania OpenAI k promptingu radia byť konkrétny v otázke kontextu, výsledku, dĺžky, formátu a štýlu. [OpenAI – Prompting techniques](https://help.openai.com/en/articles/6654000-prompting-techniques)

---

## 2. Doplňte kontext

AI nemôže vedieť všetko, čo viete vy.

Ak napíšete:

> „Napíš odpoveď zákazníkovi.“

model nevie:

- kto je zákazník,
- čo sa stalo,
- čo ste sľúbili,
- ako bežne komunikujete,
- aký výsledok chcete dosiahnuť.

Dajte mu potrebné pozadie.

```text
Zákazník s nami spolupracuje tri mesiace.
Projekt je momentálne vo fáze testovania.
Dodanie sa oproti pôvodnému plánu oneskorí o dva dni,
pretože opravujeme problém s integráciou platieb.

Napíš krátky, úprimný e-mail.
Nezvaľuj vinu na iných.
Vysvetli, kedy sa dodanie očakáva.
```

Odporúčania Google k promptingu výslovne radia poskytnúť modelu potrebné kontextové informácie a nepredpokladať, že relevantné pozadie už pozná. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

**Čím lepšie model rozumie problému, tým lepšie dokáže o úlohe uvažovať.**

---

## 3. Ak to pomáha, dajte mu rolu

Definovanie roly môže pomôcť.

Napríklad:

```text
Si skúsený UX dizajnér so špecializáciou na B2B webové aplikácie.
```

Potom:

```text
Posúď tento registračný proces.

Identifikuj miesta, kde by si používatelia mohli byť neistí
alebo by mohli proces opustiť.
```

Rola môže modelu pomôcť sústrediť sa na správne kritériá.

Oficiálne odporúčania Anthropic tiež radia definovať rolu, najmä v systémovom prompte, keď chcete nastaviť želané správanie a štýl komunikácie. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

Netreba to však preháňať.

Nepotrebujete:

> „Si najlepší, ocenený, medzinárodne uznávaný…“

pri každej jednoduchej otázke.

**Účelom roly je sústredenie, nie marketing.**

---

## 4. Definujte obmedzenia

Je užitočné povedať AI nielen to, čo má robiť, ale aj to, čo robiť **nemá**.

Napríklad:

```text
Napíš článok s rozsahom 300 slov.

Obmedzenia:
- vyhni sa zbytočnému žargónu,
- netvrď nič prehnané,
- nevymýšľaj si štatistiky,
- nespomínaj funkcie, o ktorých nemáš informácie,
- nepoužívaj emoji.
```

Je to obzvlášť dôležité pri obchodnom, právnom, finančnom a technickom obsahu.

Odporúčania Google k návrhu promptov výslovne považujú obmedzenia za súčasť návrhu promptu. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## 5. Definujte výstup

Jedno z najväčších zlepšení často prinesie presné určenie želaného výstupu.

Slabé:

```text
Analyzuj tohto zákazníka.
```

Lepšie:

```text
Analyzuj zákazníka podľa tejto štruktúry:

1. Typ zákazníka
2. Hlavný problém
3. Pravdepodobná obchodná potreba
4. Riziká
5. Odporúčaný ďalší krok

Najviac dve vety na každú časť.
```

Google odporúča explicitné inštrukcie k formátu výstupu a upozorňuje, že zložitejšie odpovede v JSON je lepšie riešiť pomocou funkcií štruktúrovaného výstupu než spoliehať sa len na formuláciu promptu. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

Funkcia Structured Outputs od OpenAI dokáže obmedziť odpovede modelu na zadanú JSON Schema, takže sa dajú v aplikáciách spoľahlivejšie spracovať. [OpenAI – Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

---

## 6. Ak bude odpoveď spracúvať softvér, žiadajte štruktúru

Predstavte si, že chcete, aby AI vytiahla z e-mailu údaje o zákazníkovi.

Nepýtajte sa len:

```text
Povedz mi, aké údaje o zákazníkovi si v tomto e-maile našla.
```

Namiesto toho:

```text
Vytiahni z e-mailu údaje o zákazníkovi.

Vráť:
{
  "name": "...",
  "email": "...",
  "company": "...",
  "phone": "..."
}

Ak informácia chýba, použi null.
Chýbajúce informácie si nikdy nevymýšľaj.
```

Pri integrácii cez API je však lepšie použiť skutočnú podporu štruktúrovaného výstupu, než sa úplne spoliehať na to, že model sľúbi vrátiť platný JSON.

Dokumentácia OpenAI k Structured Outputs opisuje túto funkciu práve ako spôsob, ako zabezpečiť, aby odpovede modelu zodpovedali zadanej JSON Schema. [OpenAI – Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

---

## 7. Ukážte príklad

Jednou z najúčinnejších techník promptingu je **few-shot prompting**.

Namiesto toho, aby ste len vysvetľovali, čo chcete, to ukážte.

Napríklad:

```text
Úloha:
Premeň vetu na krátku, profesionálnu odpoveď zákazníckej podpory.

Príklad 1:
Vstup: "Neviem sa prihlásiť."
Výstup: "Ospravedlňujeme sa za komplikácie. Skúste si, prosím, obnoviť heslo."

Príklad 2:
Vstup: "Kde nájdem svoju faktúru?"
Výstup: "Faktúry nájdete v časti Profil → Faktúry."

Teraz premeň:
Vstup: "Neviem si stiahnuť faktúru."
```

Príklady naučia model nielen obsah, ale aj želaný štýl a štruktúru.

Oficiálne odporúčania Anthropic opisujú príklady ako jeden z najspoľahlivejších spôsobov, ako usmerniť formát, tón a štruktúru výstupu. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

**Keď je ťažké opísať slovami, čo chcete, ukážte modelu dobrý príklad.**

---

## 8. Oddeľte inštrukcie od dát

Obzvlášť dôležité je to pri dlhých dokumentoch a AI aplikáciách.

Namiesto:

```text
Zhrň tento dokument a nezverejni žiadne osobné údaje
Tu sa začína dokument...
```

použite jasné hranice:

```text
# Úloha

Zhrň dokument do piatich bodov.
Nezverejni osobné údaje.

# Dokument

"""
[sem príde dokument]
"""
```

Alebo:

```text
<instructions>
Zhrň dokument do piatich bodov.
Nezverejni osobné údaje.
</instructions>

<document>
[sem príde dokument]
</document>
```

Oficiálna dokumentácia OpenAI odporúča štruktúry v Markdowne a XML, aby boli logické hranice medzi inštrukciami, príkladmi a kontextom zreteľnejšie. [OpenAI – Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)

Anthropic podobne odporúča XML značky pri zložitých promptoch, v ktorých sa miešajú inštrukcie, kontext a príklady. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

---

## 9. Rozdeľte zložité úlohy na kroky

Pozrite sa na túto požiadavku:

> „Analyzuj firmu, identifikuj jej problémy, vytvor marketingovú stratégiu, priprav rozpočet a sprav z toho prezentáciu.“

To je niekoľko rôznych úloh spojených do jednej.

Prehľadnejšia verzia:

```text
1. Identifikuj hlavné problémy firmy.
2. Zoraď ich podľa vplyvu na podnikanie.
3. Navrhni možné riešenia.
4. Vytvor plán implementácie.
5. Premeň plán na osnovu prezentácie.
```

Odporúčania Anthropic radia používať číslované zoznamy alebo odrážky, keď záleží na poradí alebo úplnosti. [Anthropic – Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)

---

## Zlý prompt → lepší prompt

Pozrime sa na niekoľko bežných príkladov.

### Príklad 1: „Napíš dobrý článok“

**Zlé:**

```text
Napíš dobrý článok o umelej inteligencii.
```

**Lepšie:**

```text
Napíš 1 000-slovný článok pre majiteľov malých a stredných firiem
o praktickom využití AI.

Cieľ:
Vysvetliť, ktorým firemným procesom môže AI skutočne pomôcť.

Štýl:
- profesionálny, ale prístupný
- praktický, bez zbytočného hypu
- technické pojmy vysvetli zrozumiteľne

Štruktúra:
- krátky úvod
- päť praktických príkladov
- riziká
- kedy AI nepoužívať
- krátky záver

Nevymýšľaj si štatistiky.
```

---

## Príklad 2: „Analyzuj to“

**Zlé:**

```text
Analyzuj tento podnikateľský plán.
```

**Lepšie:**

```text
Analyzuj nasledujúci podnikateľský plán z pohľadu
poradcu pre malé a stredné firmy.

Vyhodnoť:
1. cieľový trh
2. model príjmov
3. štruktúru nákladov
4. hlavné riziká
5. škálovateľnosť

Pri každej časti:
- uveď krátke hodnotenie,
- podlož ho dôkazmi z dokumentu,
- povedz, keď nie je dosť informácií.

Na záver polož päť doplňujúcich otázok.

<business_plan>
[text]
</business_plan>
```

Už nehovoríte len „analyzuj to“.

**Definovali ste, čo analýza znamená.**

---

## Príklad 3: „Napíš nejaký kód“

**Zlé:**

```text
Napíš prihlasovací systém v Jave.
```

**Lepšie:**

```text
Vytvor prihlasovací modul REST API pre aplikáciu Spring Boot 3
s použitím Java 17.

Požiadavky:
- použi Spring Security
- použi autentifikáciu JWT
- heslá bezpečne hashuj
- pri neúspešnom prihlásení neprezraď, či používateľ existuje
- použi DTO
- pridaj unit testy

Výstup:
1. potrebné triedy
2. kód v Jave
3. konfigurácia
4. testy
5. krátke bezpečnostné poznámky

Ak je niektorá požiadavka nejednoznačná,
uveď predpoklad pred kódom.
```

Pri vývojárskych úlohách nesmierne záleží na prostredí a technických obmedzeniach.

**„Napíš nejaký kód“ nie je špecifikácia.**

---

## Príklad 4: „Urob to profesionálnejšie“

**Zlé:**

```text
Urob tento e-mail profesionálnejším.
```

**Lepšie:**

```text
Prepíš tento e-mail profesionálnym, ale prístupným tónom.

Cieľ:
Dosiahnuť, aby zákazník akceptoval, že dodanie bude meškať tri dni.

Obmedzenia:
- nezvaľuj vinu na iných,
- vyhni sa právnickému alebo príliš formálnemu jazyku,
- najviac 150 slov,
- zachovaj priateľský tón.

Pôvodný text:
"""
...
"""
```

AI už nemusí hádať, čo znamená „profesionálne“.

**Definovali ste to.**

---

## Nedávajte protichodné pokyny

Napríklad:

```text
Buď mimoriadne podrobný.

Odpoveď nech má menej ako 100 slov.

Vysvetli každý detail.

Nepíš dlhú odpoveď.
```

To je zlá špecifikácia.

Ak máte viacero požiadaviek, jasne určte ich priority:

```text
Odpoveď nech má menej ako 100 slov.
Zvýrazni tri najdôležitejšie body.
Neuvádzaj vysvetlenie pozadia.
```

**Model nedokáže spoľahlivo dodržať špecifikáciu, ktorá si sama odporuje.**

---

## Nespoliehajte sa na zaklínadlá

Internet je plný promptov s vetami ako:

> „Teraz si najväčší odborník na svete.“

> „Toto je najdôležitejšia úloha tvojho života.“

> „Ak zlyháš, stane sa niečo hrozné.“

Tie sú vo všeobecnosti menej užitočné než niečo konkrétne:

```text
Píš pre skúseného backend vývojára.
Používaj stručné technické vysvetlenia.
Vo všetkých príkladoch použi Spring Boot 3 a Java 17.
```

**Konkrétna požiadavka je užitočnejšia než dramatická formulácia.**

---

## Prompt engineering je iteratívny proces

Váš prvý prompt bude len zriedka dokonalý.

Užitočný postup:

```text
Prompt
↓
Výsledok
↓
Čo bolo zle?
↓
Upravený prompt
↓
Nový výsledok
↓
Testovanie
↓
Doladenie
```

OpenAI aj Google opisujú prompting ako iteratívny proces, nie ako jednorazový recept. [OpenAI – Prompting](https://developers.openai.com/api/docs/guides/prompting) [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

Prehľad prompt engineeringu od Anthropic tiež odporúča definovať kritériá úspechu a spôsob vyhodnocovania ešte predtým, než začnete čas venovať optimalizácii promptov. [Anthropic – Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)

---

## Aj dobré prompty treba testovať

Ak je AI systém súčasťou firemného procesu, netestujte ho len na jednom príklade.

Vytvorte niekoľko testovacích prípadov:

```text
Bežný prípad
↓
Jednoduchý hraničný prípad
↓
Chýbajúce dáta
↓
Neplatné dáta
↓
Nezvyčajná formulácia
↓
Protichodné informácie
↓
Irelevantný vstup
```

Pri asistentovi zákazníckej podpory nestačí overiť, či správne odpovie na bežnú otázku.

Musíte vedieť aj to, čo sa stane, keď zákazník:

- neuvedie číslo objednávky,
- uvedie nesprávne číslo objednávky,
- spomenie viacero objednávok,
- poskytne neúplné informácie,
- sa pýta na niečo, čo v znalostnej báze nie je.

**Kvalitu promptu by ste nemali posudzovať podľa toho, či jedna odpoveď náhodou vyzerala dobre.**

---

## Praktická šablóna promptu

Ak neviete, kde začať, skúste toto:

```text
# Rola
[Kto si?]

# Cieľ
[Čo treba dosiahnuť?]

# Kontext
[Aké informácie sú potrebné?]

# Úloha
[Čo presne treba urobiť?]

# Obmedzenia
[Čo sa má a čo sa nemá stať?]

# Príklady
[1–3 dobré príklady]

# Výstup
[Formát a dĺžka]

# Vstup
[Aktuálne dáta alebo požiadavka]
```

Nie vždy potrebujete všetkých sedem častí.

Jednoduchej otázke môžu stačiť dve vety.

Zložitému firemnému AI systému môže takáto štruktúra výrazne pomôcť.

Oficiálne odporúčania Google ponúkajú podobne štruktúrované šablóny, ktoré oddeľujú rolu, inštrukcie, kontext, obmedzenia a formát výstupu. [Google – Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

## Najdôležitejšie pravidlo

Dobrý prompting nie je o hľadaní „dokonalej vety“.

Ide o to, **nechať modelu na hádanie čo najmenej dôležitých informácií.**

Ak na niečom záleží:

- povedzte to,
- ak záleží na formáte, ukážte ho,
- ak existuje obmedzenie, napíšte ho,
- ak záleží na kontexte, poskytnite ho,
- ak máte dobrý príklad, ukážte ho,
- ak bude odpoveď spracúvať softvér, použite štruktúrovaný výstup,
- ak je to súčasť firemného procesu, otestujte to na viacerých vstupoch.

Prompt engineering teda v skutočnosti nie je o „oklamaní AI“.

**Je o písaní dobrej špecifikácie pre systém, ktorý rozumie pokynom v prirodzenom jazyku.**

A čím dôležitejšia je úloha, tým viac by ste mali prompt vnímať ako špecifikáciu, nie ako ležérnu otázku.

**softwaredevelopment.hu — AI integrácia, automatizácia a AI riešenia na mieru pre firmy.**

---

## Zdroje

- OpenAI: [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
- OpenAI: [Prompting](https://developers.openai.com/api/docs/guides/prompting)
- OpenAI Help Center: [Best practices for prompt engineering with the OpenAI API](https://help.openai.com/en/articles/6654000-prompting-techniques)
- OpenAI: [Structured model outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- Anthropic: [Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)
- Anthropic: [Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- Google AI for Developers: [Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- Google AI for Developers: [Prompting best practices](https://ai.google.dev/gemini-api/docs/prompting-strategies)
