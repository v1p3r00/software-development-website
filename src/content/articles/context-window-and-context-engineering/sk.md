---
title: "Kontextové okno a context engineering: čo AI v skutočnosti „vidí“?"
description: "Čo AI v skutočnosti vidí? Ako kontextové okno, tokeny, pamäť a context engineering určujú, s čím môže AI aplikácia pracovať."
tags: [ai, context-window, context-engineering, llm, agents]
date: 2026-10-25 08:00
image: /articles/context-window-and-context-engineering/share.jpg
---

## Čo AI v skutočnosti „vidí“?

Keď sa rozprávate s AI asistentom, ľahko si predstavíte, že model neustále vidí všetko, čo ste mu kedy povedali.

Skutočnosť je zložitejšia.

Keď jazykový model generuje odpoveď, pracuje s **kontextom**, ktorý má k dispozícii pre danú inferenciu. Tento kontext môže obsahovať systémové inštrukcie, históriu konverzácie, dokumenty, výsledky vyhľadávania, výstupy nástrojov a ďalšie informácie, ktoré mu dodá aplikácia.

Anthropic opisuje kontext ako tokeny, ktoré sú zahrnuté vo chvíli, keď LLM generuje odpoveď. Context engineering je potom proces výberu a udržiavania tých najužitočnejších informácií pre danú inferenciu. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

**AI jednoducho „nevidí všetko“. Vidí to, čo jej aplikácia v danom okamihu vloží do kontextu.**

---

## Čo je kontextové okno?

Kontextové okno (context window) je maximálne množstvo vstupu, ktoré model dokáže spracovať počas jednej operácie.

Spravidla sa meria v **tokenoch**.

Token nie je presne to isté ako slovo.

Tokenom môže byť:

- celé slovo,
- časť slova,
- interpunkcia,
- číslo,
- alebo krátka postupnosť znakov.

Keď sa teda o modeli píše, že má kontextové okno so stovkami tisíc tokenov, nemožno toto číslo jednoducho prepočítať na rovnaký počet slov alebo strán.

Presná kapacita závisí od modelu a od spôsobu jeho použitia. Anthropic v súčasnosti pri viacerých modeloch uvádza kontext v API s veľkosťou 200K+ tokenov a pri niektorých modeloch až 1M tokenov. ([support.anthropic.com](https://support.anthropic.com/en/articles/8606395-how-large-is-the-anthropic-api-s-context-window))

---

## Predstavte si kontextové okno ako pracovný stôl

Užitočnou analógiou je pracovný stôl.

Predstavte si technika, ktorý pracuje na stroji.

Na stole môže mať:

- návod,
- náradie,
- technický výkres,
- predchádzajúce merania,
- súčiastky, s ktorými práve pracuje.

Pracovať môže s tým, čo má na stole.

Ak tam niečo nie je, nemôže to priamo použiť.

Kontextové okno AI funguje podobne.

```text
                 KONTEXTOVÉ OKNO

┌─────────────────────────────────────┐
│ systémové inštrukcie                │
│                                     │
│ história konverzácie                │
│                                     │
│ dokumenty                           │
│                                     │
│ výsledky nástrojov                  │
│                                     │
│ požiadavka používateľa              │
└─────────────────────────────────────┘
                  ↓
                 LLM
                  ↓
               odpoveď
```

Informácie v kontexte nemusia pochádzať z jedného miesta.

AI aplikácia si môže kontext pred volaním modelu zostaviť sama.

A práve tu začína byť dôležitý context engineering.

---

## Kontextové okno ≠ pamäť

Toto je dôležité rozlíšenie.

**Kontext** sú informácie, ktoré má model k dispozícii počas konkrétnej inferencie.

**Pamäť** sú informácie, ktoré si aplikácia môže uložiť zvlášť a neskôr ich znova načítať.

Zjednodušená architektúra môže vyzerať takto:

```text
Pamäť
   ↓
uložené informácie
   ↓
vyhľadanie
   ↓
Kontext
   ↓
LLM
   ↓
odpoveď
```

AI aplikácia si môže ukladať:

- preferencie používateľa,
- zhrnutia predchádzajúcich konverzácií,
- stav projektu,
- informácie o zákazníkoch,
- predchádzajúce rozhodnutia.

Nemusí však všetky tieto informácie posielať modelu pri každej otázke.

**Pamäť je skôr externé úložisko; kontext sú informácie vybrané pre aktuálnu úlohu.**

---

## Prečo modelu jednoducho nedať všetko?

Na prvý pohľad to znie rozumne:

> „Ak má model veľmi veľké kontextové okno, dajme mu všetky informácie.“

To však nemusí byť dobrý nápad.

Predstavte si AI asistenta zákazníckeho servisu, ktorý má prístup k:

- 5 000 dokumentom,
- 2 000 predchádzajúcim prípadom,
- 50 000 správam z chatu,
- celej produktovej databáze,
- všetkým interným pravidlám.

Teoreticky mu môžete poskytnúť obrovské množstvo informácií.

V praxi sa však objaví iný problém:

**viac informácií automaticky neznamená lepšiu odpoveď.**

Model stále musí rozpoznať, ktoré časti sú pre aktuálnu otázku naozaj dôležité.

---

## Problém „Lost in the Middle“

Výskum ukázal, že modely nevyužívajú všetky časti dlhého kontextu vždy rovnako efektívne.

Štúdia *Lost in the Middle* skúmala, ako jazykové modely pracujú s dlhým kontextom, a zistila, že výkon môže závisieť od toho, kde sa relevantná informácia nachádza. V mnohých testovaných nastaveniach bol výkon lepší, keď sa relevantná informácia nachádzala blízko začiatku alebo konca kontextu, a horší, keď bola v strede. ([arxiv.org](https://arxiv.org/abs/2307.03172))

Zjednodušená ilustrácia:

```text
KONTEXT

[ DÔLEŽITÉ ]
[ dáta ]
[ dáta ]
[ dáta ]
[ dáta ]
[ DÔLEŽITÁ INFORMÁCIA ]
[ dáta ]
[ dáta ]
[ dáta ]
[ DÔLEŽITÉ ]

↑ potenciálne ľahšie dohľadateľné
            ↓
       v strede to môže
       byť ťažšie
```

Neznamená to, že každý moderný model vždy „zabudne“ informácie v strede.

Efekt závisí od modelu, úlohy aj kontextu.

Dôležité ponaučenie znie:

**nestačí, aby model prijal veľké množstvo informácií; musí ich aj efektívne využiť.**

---

## Väčšie kontextové okno nevyrieši všetko

Kontextové okná sa výrazne zväčšili.

To je užitočné.

Väčšie okno môže aplikácii umožniť:

- spracovať dlhšie dokumenty,
- uchovať dlhšiu históriu konverzácie,
- prechádzať väčšie codebase,
- zahrnúť viac výsledkov nástrojov,
- podporovať dlhšie pracovné postupy.

Väčšie okno však automaticky nerieši problém relevancie.

Aj samotné odporúčania Anthropic ku context engineeringu uvádzajú, že aj veľmi veľké kontextové okná môžu byť ovplyvnené znečistením kontextu a problémami s relevanciou informácií. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

**Cieľom nie je vložiť do kontextu čo najviac informácií. Cieľom je vložiť doň tie správne.**

---

## Tu prichádza na rad context engineering

Prompt engineering sa tradične sústreďoval na otázku:

> „Ako máme napísať prompt?“

Context engineering je širší.

Otázka znie:

> „Aké informácie má model v tejto chvíli dostať, aby priniesol želaný výsledok?“

Anthropic opisuje context engineering ako prirodzené pokračovanie prompt engineeringu. Zahŕňa správu systémových inštrukcií, nástrojov, MCP, externých dát a histórie konverzácie. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

AI aplikácia teda nemusí byť len prompt.

Môže to byť celý systém, ktorý pred každým volaním modelu zostaví vhodný kontext.

---

## Ako vytvoriť dobrý kontext?

Predstavte si firemného AI asistenta, ktorý odpovedá na reklamáciu zákazníka.

Systém môže potrebovať:

```text
Systémové inštrukcie
        +
informácie o zákazníkovi
        +
aktuálna konverzácia
        +
relevantné firemné pravidlá
        +
relevantné informácie o produkte
        +
zhrnutie predchádzajúceho prípadu
        +
dostupné nástroje
        ↓
      KONTEXT
        ↓
       LLM
        ↓
      odpoveď
```

Pravdepodobne nepotrebuje:

- všetky firemné dokumenty,
- všetky predchádzajúce konverzácie so zákazníkmi,
- všetky produktové špecifikácie,
- popisy všetkých nástrojov.

**Context engineering je o výbere.**

---

## Krok 1: definujte úlohu

Dobrý návrh kontextu nezačína otázkou:

> „Čo všetko môžeme modelu poslať?“

ale otázkou:

> „Čo model naozaj potrebuje, aby úlohu splnil?“

Napríklad:

```text
Úloha:
„Odpovedz na otázku zákazníka ohľadom záruky.“
```

Model môže potrebovať:

- príslušný produkt,
- dátum nákupu,
- záručné podmienky,
- aktuálnu správu zákazníka.

Väčšina ostatných firemných informácií je pravdepodobne irelevantná.

---

## Krok 2: vyhľadajte relevantné informácie

Tu sa context engineering priamo prepája s RAG.

```text
Otázka používateľa
        ↓
vyhľadanie
        ↓
relevantné dokumenty
        ↓
kontext
        ↓
LLM
```

Namiesto posielania celej znalostnej bázy aplikácia najprv vyhľadá relevantné časti.

Vyhľadávanie môže využívať:

- vektorové vyhľadávanie,
- vyhľadávanie podľa kľúčových slov,
- hybridné vyhľadávanie,
- databázové dotazy,
- volania API,
- alebo ich kombinácie.

Prístup Contextual Retrieval od Anthropic je navrhnutý špeciálne na zlepšenie fázy vyhľadávania, aby sa relevantné informácie spoľahlivejšie dostali do kontextu modelu. ([anthropic.com](https://www.anthropic.com/engineering/contextual-retrieval))

---

## Krok 3: pridajte štruktúrovaný stav

V prípade AI agenta sa kontext neobmedzuje len na dokumenty.

Môže obsahovať aj štruktúrovaný stav:

```text
ÚLOHA
Aktuálny cieľ:
Pripraviť odpoveď zákazníkovi.

STAV
Zákazník overený: áno
Objednávka nájdená: áno
Nárok na vrátenie peňazí: áno

DOSTUPNÉ NÁSTROJE
- get_order
- issue_refund
- send_email

RELEVANTNÉ DÁTA
Objednávka #18452
Produkt: ...
Dátum nákupu: ...
```

Toto môže byť oveľa užitočnejšie než dlhý neštruktúrovaný blok textu.

**Dobre štruktúrovaný kontext pomáha modelu pochopiť, čo je dôležité, čo sa už stalo a čo ešte treba urobiť.**

---

## Krok 4: zbytočne neopakujte všetko

V dlhých konverzáciách sa môže nahromadiť veľa opakujúcich sa informácií.

Napríklad:

```text
Používateľ:
„Projekt sa vyvíja v Bratislave.“

Asistent:
„Rozumiem, projekt sa vyvíja v Bratislave.“

Používateľ:
„Áno, a termín je v decembri.“

Asistent:
„Rozumiem, projekt sa vyvíja v Bratislave
s termínom v decembri.“
```

Pokračujte tak stovky správ a kontext rýchlo narastie.

Agentový systém preto môže využívať:

- zhrnutia,
- kompaktný stav,
- štruktúrované poznámky,
- vyhľadávanie podľa relevancie.

Anthropic opisuje pre dlhodobo bežiacich agentov techniky ako **compaction** (zhutňovanie) a štruktúrované zapisovanie poznámok. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

---

## Pamäť môže byť v podstate ďalšou databázou

Sofistikovanejšia AI aplikácia môže oddeľovať niekoľko vrstiev:

```text
                 ┌───────────────┐
                 │   Databáza    │
                 │ používatelia /│
                 │ dáta          │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    Pamäť      │
                 │ zhrnutia /    │
                 │ preferencie   │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │   Vyhľadanie  │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    Kontext    │
                 └───────┬───────┘
                         ↓
                        LLM
```

Toto je oveľa lepšie škálovateľné než posielať všetky uložené informácie s každou požiadavkou.

---

## Aj nástroje sú súčasťou kontextu

AI agent nedostáva len text.

Môže mať k dispozícii aj nástroje.

Napríklad:

```text
Používateľ sa pýta:
„Kedy mi príde objednávka?“

        ↓

AI kontext
        ↓
dostupný nástroj:
get_order_status
        ↓
výsledok nástroja
        ↓
aktualizácia kontextu
        ↓
LLM
        ↓
odpoveď
```

Výsledok nástroja sa tak môže stať novou informáciou v kontexte ďalšej inferencie.

Context engineering teda nie je len o písaní promptov.

Treba rozhodnúť aj o tom:

- ktoré nástroje sú dostupné,
- kedy sa majú použiť,
- čo obsahujú ich výsledky,
- koľko informácií vracajú,
- ako sú tieto výsledky štruktúrované.

---

## Príliš veľa nástrojov môže byť tiež problém

Rovnaký princíp platí aj pre nástroje.

Ak agentovi dáte 100 rôznych nástrojov, nemusí byť vďaka tomu schopnejší.

Model musí rozumieť:

- čo jednotlivé nástroje robia,
- kedy ich použiť,
- aké parametre očakávajú,
- čo znamená ich výstup.

Dobre navrhnutý agent preto môže sprístupniť len nástroje relevantné pre aktuálnu úlohu.

**Kontext nie sú len dáta. Aj dostupné akcie a ich popisy sú súčasťou toho, čo model „vidí“.**

---

## Dobrý kontext je často kratší

Znie to neintuitívne.

Ak je k dispozícii viac informácií, prečo ich modelu nedať všetky?

Pretože záleží na podiele relevantných informácií.

Porovnajte:

```text
A:
100 strán
95 strán irelevantných
5 strán dôležitých

B:
12 strán
10 strán dôležitých
2 strany kontextu
```

Druhý kontext môže byť oveľa užitočnejší.

Výskum správania pri dlhom kontexte ukazuje, že výkon modelu môže ovplyvniť množstvo aj umiestnenie informácií. ([arxiv.org](https://arxiv.org/abs/2307.03172))

**Jedným z cieľov context engineeringu je preto znížiť informačný šum.**

---

## Okrem množstva záleží aj na štruktúre

Tá istá informácia môže byť ľahšie alebo ťažšie použiteľná podľa toho, ako je podaná.

Napríklad:

```text
Zákazník je Ján.
Objednávka je 18452.
Kúpená bola 12. mája.
Produkt je X.
Zákazník chce vrátiť peniaze.
Pravidlá vrátenia peňazí hovoria ...
```

Môže to fungovať.

Štruktúrovaná podoba je však prehľadnejšia:

```text
CUSTOMER
name: Ján

ORDER
id: 18452
product: X
purchase_date: 12. mája

REQUEST
type: refund

POLICY
...
```

Odporúčania Anthropic pre prompty s dlhým kontextom radia pri práci s viacerými dokumentmi používať štruktúrované značkovanie, napríklad XML tagy, aby model ľahšie rozlíšil jednotlivé dokumenty a ich metadáta. ([docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables))

---

## Čo by malo byť v kontexte?

Praktický kontrolný zoznam:

```text
[✓] aktuálna úloha
[✓] relevantné inštrukcie
[✓] potrebné údaje o používateľovi
[✓] relevantné dokumenty
[✓] aktuálny stav
[✓] potrebné nástroje
[✓] výsledky nástrojov
[✓] predchádzajúce rozhodnutia / zhrnutie

[✗] irelevantné dokumenty
[✗] zastarané informácie
[✗] duplicitné informácie
[✗] zbytočné nástroje
[✗] celá databáza
```

Presná odpoveď závisí od aplikácie.

Dôležitý je však spôsob uvažovania:

**nepýtajte sa „Čo môžeme poslať?“ Pýtajte sa „Čo model potrebuje?“**

---

## Context engineering v skutočnej AI aplikácii

Predstavte si AI asistenta, ktorý rieši support ticket.

Systém môže postupovať takto:

```text
1. Používateľ položí otázku
          ↓
2. Identifikácia zákazníka
          ↓
3. Vyhľadanie príslušnej objednávky
          ↓
4. Vyhľadanie relevantnej dokumentácie
          ↓
5. Kontrola oprávnení
          ↓
6. Zostavenie kontextu
          ↓
7. LLM odpovie
          ↓
8. V prípade potreby použitie nástroja
          ↓
9. Pridanie výsledku späť do kontextu
```

To je oveľa viac než napísať šikovný prompt.

Je to **context engineering**.

---

## Čo sa deje pri dlhotrvajúcich úlohách?

Agent môže na úlohe pracovať celé hodiny.

Jedno kontextové okno je však stále konečné.

Dlhodobo bežiace systémy preto môžu potrebovať:

- zhrnúť doterajšiu prácu,
- uložiť stav,
- začať nové kontextové okno,
- obnoviť dôležité informácie.

Anthropic opisuje pre dlhodobo bežiace agentové workflow techniky ako compaction, štruktúrované zapisovanie poznámok a viacero kontextových okien. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

Zjednodušene:

```text
Kontext 1
   ↓
práca
   ↓
zhrnutie / stav
   ↓
Kontext 2
   ↓
pokračovanie
   ↓
zhrnutie / stav
   ↓
Kontext 3
```

**Dlhodobá pamäť teda často nie je jedno obrovské kontextové okno. Je to stav spravovaný naprieč viacerými kontextmi.**

---

## Kontext sa stáva kľúčovou súčasťou návrhu AI aplikácií

LLM je len jednou zo súčastí moderného AI systému.

Rovnako dôležité je:

- aké dáta dostane,
- kedy ich dostane,
- v akom poradí,
- čo je zámerne vynechané,
- čo sa vyhľadá,
- čo sa uloží ako pamäť,
- ktoré nástroje sú dostupné.

```text
                 AI APLIKÁCIA

Dáta ────────┐
Pamäť ───────┤
RAG ─────────┤
Nástroje ────┼──→ Kontext → LLM → Výstup
História ────┤
Stav ────────┤
Inštrukcie ──┘
```

**Silná AI aplikácia nestojí len na silnom modeli. Čo aplikácia v skutočnosti dokáže, určuje model spolu s kontextom, ktorý sa preň zostaví.**

---

## Čo teda AI v skutočnosti „vidí“?

Automaticky nevidí celú vašu firemnú databázu.

Automaticky nemá k dispozícii všetky predchádzajúce konverzácie.

Nemusí vidieť každý dokument, ktorý ste kedy nahrali.

A nemusí využívať všetky časti dlhého kontextu rovnako dobre.

**Vidí informácie, ktoré jej aplikácia pre danú inferenciu vloží do kontextového okna.**

Preto dnes pri vývoji AI nie je čoraz dôležitejšou otázkou len:

> „Aký model máme použiť?“

Ale aj:

> „Aký kontext mu máme dať, aby mal naozaj k dispozícii informácie, ktoré potrebuje?“

---

## Dobrá AI nevidí všetko – vidí to podstatné

Pri tvorbe AI aplikácie je veľkosť kontextového okna dôležitým technickým parametrom, sama osebe však nie je stratégiou.

Skutočnou výzvou je navrhnúť systém, ktorý dokáže vyberať, zhusťovať, štruktúrovať a aktualizovať informácie, ktoré model potrebuje.

**Context engineering nie je o tom, dať AI čo najviac informácií. Je o tom, dať jej správne informácie v správnej chvíli.**

**softwaredevelopment.hu — AI riešenia, automatizácia a inteligentné aplikácie pre firmy.**

---

## Zdroje

- Anthropic: [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Anthropic: [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval)
- Anthropic: [Prompting Claude's long context window](https://www.anthropic.com/research/prompting-long-context)
- Anthropic Documentation: [Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)
- Anthropic Help Center: [How large is the Anthropic API's context window?](https://support.anthropic.com/en/articles/8606395-how-large-is-the-anthropic-api-s-context-window)
- Liu et al.: [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)
- Anthropic: [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
