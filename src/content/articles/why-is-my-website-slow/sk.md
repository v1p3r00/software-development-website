---
title: "Prečo je môj web pomalý? Najčastejšie technické príčiny"
description: "Je váš web pomalý? Najčastejšie technické príčiny – od hostingu a obrázkov cez JavaScript a databázy až po cache a CDN."
tags: [website, performance, pagespeed, development, seo]
date: 2026-10-04 08:00
image: /articles/why-is-my-website-slow/share.jpg
---

Keď sa web zdá pomalý, je lákavé zvaliť vinu na hostingovú spoločnosť alebo jednoducho povedať, že je na stránke „priveľa vecí“.

Realita je zvyčajne zložitejšia.

Server môže odpovedať pomaly. Jediný prerastený obrázok môže zdržiavať najdôležitejší obsah. Priveľa JavaScriptu môže zamestnávať prehliadač. Plugin môže na každej stránke načítavať zbytočný kód. Alebo databázový dopyt môže server prinútiť čakať skôr, než vôbec niečo vráti.

Je tu aj ďalšia možnosť: stránka sa technicky môže načítať pomerne rýchlo, no aj tak pôsobí pomaly, pretože tlačidlá reagujú oneskorene alebo rozloženie poskakuje, kým sa obsah zobrazuje.

**Preto by sa výkon webu nemal zužovať na jediné skóre v PageSpeed.**

Google PageSpeed Insights kombinuje laboratórnu analýzu s dátami od skutočných používateľov (ak sú k dispozícii), a preto je užitočným východiskom na pochopenie toho, kde môžu byť problémy s výkonom. ([Google for Developers – About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about))

---

## Najprv: čo vlastne znamená „pomalý“?

Pomalý web môže mať niekoľko rôznych problémov.

### Pomalý je server

Prehliadač odošle požiadavku, no na prvú odpoveď čaká dlho.

```text
Prehliadač → server → databáza → aplikácia → HTML
                            ↑
                      dlhé čakanie
```

### Pomalý je prehliadač

Server už stránku odoslal, no prehliadač musí spracovať priveľa JavaScriptu, CSS alebo inej práce.

```text
Server → HTML + JS + CSS → prehliadač → spracovanie → použiteľná stránka
                                    ↑
                                priveľa práce
```

### Pomalé sú zdroje

HTML dorazí rýchlo, no veľký obrázok, štýly alebo skript tretej strany sa sťahujú dlho.

Prvým krokom je preto zistiť, **kde sa v skutočnosti čaká**.

---

## 1. Slabý alebo zle nakonfigurovaný hosting

Najjednoduchším vysvetlením je niekedy samotný server.

V lacnom alebo silno zdieľanom hostingovom prostredí môže o tie isté zdroje súperiť viacero webov. Špičky návštevnosti alebo aktivita iných webov môžu ovplyvniť čas odozvy.

Pomalá odpoveď servera však automaticky neznamená, že potrebujete lepší hosting.

Čas odozvy môže závisieť aj od:

- zaťaženia servera,
- behového prostredia,
- kódu aplikácie,
- výkonu databázy,
- podmienok v sieti,
- cachovania,
- umiestnenia servera.

Odporúčania web.dev k výkonu chápu čas odozvy servera a spracovanie v prehliadači ako samostatné časti celkového obrazu výkonu. ([web.dev – Understand the critical path](https://web.dev/learn/performance/understanding-the-critical-path))

### Čo s tým?

Nemeňte hosting hneď.

Najprv zistite, či je server naozaj úzkym hrdlom.

Ak jednoduchá statická stránka odpovedá rýchlo, no stránka napojená na databázu je pomalá, skutočný problém môže byť v aplikácii alebo v databáze.

**Drahší server automaticky nevyrieši neefektívny kód aplikácie.**

---

## 2. Vaše obrázky sú príliš veľké

Toto je jeden z najčastejších problémov a zároveň jeden z najľahšie odstrániteľných.

Moderné telefóny a fotoaparáty vytvárajú súbory s obrázkami veľké aj niekoľko megabajtov. Web často potrebuje len zlomok týchto dát.

Ak nahráte fotografiu širokú 5 000 pixelov a zobrazíte ju v šírke 800 pixelov, prehliadač možno aj tak musí stiahnuť oveľa väčší súbor.

web.dev uvádza obrázky ako jednu z najväčších kategórií zdrojov na webe, takže ich optimalizácia môže mať na výkon výrazný vplyv. ([web.dev – Image performance](https://web.dev/learn/performance/image-performance))

### Čo s tým?

- Poskytujte obrázky vo vhodných rozmeroch.
- Komprimujte ich.
- Kde je to vhodné, používajte moderné formáty obrázkov.
- Používajte responzívne obrázky.
- Odložte načítanie obrázkov, ktoré sú pod prvou viditeľnou časťou stránky.

Atribút `loading="lazy"` dokáže zabrániť tomu, aby sa obrázky mimo úvodnej viditeľnej oblasti sťahovali hneď. ([web.dev – Key performance issues](https://web.dev/learn/images/performance-issues))

Existuje však dôležitá výnimka: **hlavný obrázok viditeľný v hornej časti stránky automaticky nenačítavajte oneskorene (lazy-load)**, pretože jeho zdržanie môže spôsobiť, že sa najdôležitejší obsah zobrazí neskôr. ([web.dev – Key performance issues](https://web.dev/learn/images/performance-issues))

---

## 3. Priveľa JavaScriptu

JavaScript robí weby interaktívnymi.

Závisia od neho menu, animácie, formuláre, nákupné košíky, kalkulačky, analytika a množstvo ďalších funkcií.

Problém nastáva, keď sa JavaScript používa takmer na všetko.

Jednoduchý firemný web napríklad nemusí potrebovať desiatky skriptov bežiacich na každej stránke.

web.dev upozorňuje, že priveľa JavaScriptu môže spomaliť načítanie stránky a zhoršiť odozvu na interakcie. ([web.dev – Optimise resource loading](https://web.dev/learn/performance/optimize-resource-loading))

Prehliadač JavaScript nielen stiahne.

Musí ho aj sparsovať, skompilovať a vykonať.

### Čo s tým?

Skontrolujte:

- ktoré JavaScriptové súbory sa načítavajú,
- ktoré sú naozaj potrebné,
- ktoré sa načítavajú na každej stránke,
- či sa niektoré knižnice neduplikujú,
- či sa niektoré skripty dajú odložiť,
- či sa dá odstrániť nepoužívaný kód.

**Problémom nie je JavaScript. Problémom je zbytočný JavaScript.**

---

## 4. Priveľa pluginov a služieb tretích strán

Obzvlášť časté je to pri weboch postavených na hotových platformách.

Jeden plugin rieši kontaktné formuláre.

Ďalší cookies.

Ďalší analytiku.

Ďalší pridáva chat.

Ďalší animácie.

Nakoniec každý plugin niečím prispieva k načítaniu stránky.

JavaScript tretích strán môže byť obzvlášť problematický, pretože sa zvyčajne poskytuje zo systémov, ktoré priamo nemáte pod kontrolou. Môže ovplyvniť výkon, ale aj súkromie, bezpečnosť a správanie stránky. ([web.dev – Third-party JavaScript performance](https://web.dev/articles/third-party-javascript))

### Čo s tým?

Pluginy pravidelne prehodnocujte.

Pýtajte sa:

> Naozaj to ešte používame?

Ak je odpoveď nie, odstráňte ho.

Ak dva pluginy robia tú istú prácu, zvážte, či skutočne potrebujete oba.

A ak sa malá funkcia dá implementovať bez načítania veľkej knižnice, nemusí byť dôvod knižnicu pridávať.

---

## 5. Pomalé databázové dopyty

Tento problém je menej viditeľný, no pri webových aplikáciách môže byť veľmi dôležitý.

Predstavte si, že zákazník otvorí stránku.

Server musí načítať:

- údaje o zákazníkovi,
- objednávky,
- produkty,
- ceny,
- oprávnenia.

Ak je jeden z týchto dopytov pomalý, môže čakať celá stránka.

```text
HTTP požiadavka
   ↓
Backend
   ↓
SQL dopyt
   ↓
databáza čaká
   ↓
Backend
   ↓
HTML / JSON
   ↓
Prehliadač
```

Návštevník SQL dopyt nevidí.

Vidí len stránku, ktorá akoby nič nerobila.

### Čo to môže spôsobovať?

Napríklad:

- chýbajúce databázové indexy,
- neefektívne SQL,
- načítavanie priveľkého množstva dát,
- dopyty vykonávané jeden po druhom,
- zbytočné JOINy,
- problém N+1 dopytov,
- slabé filtrovanie vo veľkých tabuľkách.

### Čo s tým?

Toto nevyrieši plugin na kompresiu obrázkov.

Vývojár musí zmerať, ktoré dopyty trvajú najdlhšie a prečo.

**Ak server zdržiava databáza, prerobenie frontendu základný problém nevyrieši.**

---

## 6. Je to problém frontendu, alebo backendu?

Toto je jedna z najužitočnejších otázok.

### Problém na frontende

Server odpovedá rýchlo, no prehliadač má priveľa práce.

Typické príčiny:

- priveľa JavaScriptu,
- príliš veľké obrázky,
- nadmerné množstvo CSS,
- veľmi veľký DOM,
- animácie,
- skripty tretích strán.

### Problém na backende

Prehliadač čaká na server.

Typické príčiny:

- pomalé databázové dopyty,
- pomalé API,
- neefektívna logika backendu,
- nadmerné spracovanie na strane servera,
- pomalé externé API.

Tieto problémy si vyžadujú veľmi odlišné riešenia.

Namiesto vety:

> „Web je pomalý. Zrýchlite ho.“

sa preto najprv opýtajte:

**Kde systém v skutočnosti trávi čas?**

---

## 7. Chýba dostatočné cachovanie

Cachovanie je jednoduchá myšlienka:

**Ak niečo netreba znova počítať ani sťahovať, nenúťte používateľa robiť to znova.**

Ak si napríklad návštevník opakovane vyžiada ten istý CSS súbor, prehliadač ho nemusí zakaždým sťahovať odznova.

Rovnaký princíp sa dá uplatniť aj na serveri.

Ak sa stránka mení zriedka, jej časti sa môžu poskytovať z cache namiesto toho, aby sa pri každej požiadavke generovali odznova.

web.dev zaraďuje cachovanie a optimalizáciu načítavania zdrojov medzi dôležité súčasti zlepšovania výkonu webu. ([web.dev – Optimise resource loading](https://web.dev/learn/performance/optimize-resource-loading))

### Čo zvážiť?

V závislosti od webu môžu byť užitočné tieto vrstvy:

- cachovanie v prehliadači,
- cachovanie na strane servera,
- cachovanie v CDN,
- cachovanie statických súborov,
- starostlivo zvolené cachovanie odpovedí API.

Nie všetko by sa malo cachovať.

Personalizovaný zákaznícky dashboard si vyžaduje iný prístup ako verejný článok na blogu.

---

## 8. Nepoužívate CDN tam, kde by pomohla

Content Delivery Network (CDN) je distribuovaná sieť serverov navrhnutá tak, aby doručovala obsah bližšie k používateľom.

Namiesto toho, aby každá požiadavka putovala až na jeden pôvodný server, môžu sa uložené zdroje doručovať z miesta bližšieho k návštevníkovi.

web.dev vysvetľuje, že CDN môže zlepšiť výkon skrátením vzdialenosti v sieti a poskytovaním obsahu z cache bez toho, aby každá požiadavka musela putovať na pôvodný server. ([web.dev – Content delivery networks](https://web.dev/articles/content-delivery-networks))

CDN môže byť obzvlášť užitočná pre:

- obrázky,
- CSS,
- JavaScript,
- video,
- ďalšie statické súbory,
- weby s medzinárodnou návštevnosťou.

Pre malú miestnu firmu s pomerne skromným publikom to však nemusí byť prvá optimalizácia.

**CDN nie je čarovný vypínač výkonu. Je užitočná vtedy, keď rieši skutočný problém s doručovaním.**

---

## 9. Čo sú Core Web Vitals?

Core Web Vitals sú tri metriky navrhnuté na meranie dôležitých stránok používateľskej skúsenosti.

### LCP – Largest Contentful Paint

Zjednodušene:

**Ako rýchlo sa zobrazí hlavný viditeľný obsah?**

Môže to byť veľký obrázok, nadpis alebo iný výrazný obsah.

web.dev opisuje LCP ako dôležité meradlo vnímanej rýchlosti načítania. ([web.dev – Key performance issues](https://web.dev/learn/images/performance-issues))

### INP – Interaction to Next Paint

INP sleduje, ako rýchlo stránka reaguje na interakcie používateľa.

Napríklad:

```text
Kliknutie → spracovanie → vizuálna odozva
```

Ak kliknete na menu a prehliadaču trvá citeľne dlho, kým zareaguje, interakcia pôsobí zle.

### CLS – Cumulative Layout Shift

CLS meria vizuálnu stabilitu.

Možno ste to už zažili:

Chystáte sa kliknúť na tlačidlo, dočíta sa obrázok alebo reklama a zrazu sa celá stránka posunie.

Presne takýto problém má CLS zachytiť.

Aktuálnu sadu Core Web Vitals tvoria LCP, INP a CLS. ([Google for Developers – About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about))

**Za tromi technickými názvami sa skrývajú tri jednoduché otázky: zobrazí sa to rýchlo, reaguje to rýchlo a zostane to tam, kde má?**

---

## Ako merať rýchlosť webu?

Najjednoduchšie je začať nástrojom Google PageSpeed Insights.

https://pagespeed.web.dev/

Zadajte URL svojho webu a skontrolujte výsledky pre mobil aj desktop.

PageSpeed Insights poskytuje laboratórne dáta a, ak sú k dispozícii, aj dáta od skutočných používateľov. Tie pochádzajú z Chrome User Experience Report (CrUX). ([Google for Developers – About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about))

Tento rozdiel je dôležitý.

### Laboratórne dáta

Test beží v kontrolovanom prostredí.

Obzvlášť užitočný je pri diagnostike a odstraňovaní problémov počas vývoja.

### Dáta od skutočných používateľov

Odrážajú to, čo zažili skutoční návštevníci – ak je k dispozícii dostatok dát.

Môžu preto odhaliť úzke hrdlá, ktoré jeden kontrolovaný test neukáže.

**Nesústreďte sa len na skóre 0 – 100.**

Pozrite sa na diagnostiku a odporúčania, pretože pomáhajú vysvetliť, čo problém v skutočnosti spôsobuje.

---

## Čo opraviť ako prvé?

Toto je jedna z najdôležitejších otázok.

Nemusíte nevyhnutne zaviesť každé odporúčanie z PageSpeed.

Praktické poradie:

### 1. Veľké obrázky

Ak domovská stránka sťahuje niekoľko megabajtov obrázkov, začnite tam.

### 2. Zbytočný JavaScript

Nájdite skripty, ktoré nie sú potrebné alebo sa nemusia načítať hneď.

### 3. Pomalá odpoveď servera

Ak je prvá odpoveď pomalá, preverte hosting, kód aplikácie a výkon databázy.

### 4. Cachovanie

Cachujte statické zdroje a vhodný dynamický obsah tam, kde je to bezpečné a užitočné.

### 5. Skripty tretích strán

Prehodnoťte analytiku, chat, reklamu, widgety sociálnych sietí a ďalší externý kód.

### 6. CDN

Ak sú používatelia geograficky ďaleko od vášho pôvodného servera alebo poskytujete veľa statického obsahu, zvážte CDN.

### 7. Hlbšia optimalizácia backendu

Ak sú príčinou SQL dopyty, API alebo obchodná logika, potrebujete optimalizáciu na úrovni vývoja.

**Najprv opravte to, čo stojí najviac času alebo dát.**

---

## Neoptimalizujte kvôli skóre v PageSpeed

Skóre 100 vyzerá pekne.

Nie je to však obchodný cieľ.

Web automaticky neprinesie viac zákazníkov len preto, že má v PageSpeed Insights skóre 100.

Skutočným cieľom je, aby web:

- rýchlo zobrazil dôležitý obsah,
- dobre fungoval na mobile,
- rýchlo reagoval,
- zostal vizuálne stabilný,
- nesťahoval zbytočné dáta,
- nenechával používateľov čakať na neefektívne spracovanie na serveri.

Dokumentácia Google PageSpeed Insights tiež uvádza, že odporúčania na optimalizáciu treba posudzovať v kontexte nákladov na ich zavedenie a potenciálneho prínosu pre konkrétny web. ([Google – PageSpeed Insights FAQ](https://developers.google.com/speed/docs/insights/faq))

**Rýchly web nie je výsledok testu. Je to lepšia používateľská skúsenosť.**

---

## Kedy potrebujete vývojára?

Ak je problémom jeden príliš veľký obrázok, možno ho zvládnete opraviť sami.

Ak však riešite:

- pomalé API,
- databázové dopyty,
- spracovanie na strane servera,
- nadmerné množstvo JavaScriptu,
- zložité cachovanie,
- konfiguráciu CDN,
- problémy s vykresľovaním,

oplatí sa pozrieť na systém z pohľadu vývoja.

Optimalizácia výkonu je zvyčajne proces, nie jedno nastavenie.

```text
Meranie → identifikácia problému → zmena → opätovné meranie
```

**Dobrá práca na výkone začína dôkazmi, nie dohadmi.**

---

## Je váš web pomalý? Nezačínajte najdrahším riešením

Pomalý web automaticky nepotrebuje nový server, nový framework ani kompletnú prestavbu.

Môže to byť jeden príliš veľký obrázok.

Môže to byť päť zbytočných pluginov.

Môže to byť zle napísaný SQL dopyt.

Alebo jednoducho chýba vhodné cachovanie.

Najužitočnejším prvým krokom je zvyčajne meranie, po ktorom nasleduje krátky technický audit.

Otestujte web v PageSpeed Insights, nájdite najväčšie úzke hrdlo a **najprv opravte problém, ktorý skutočne ovplyvňuje skúsenosť používateľa.**

**softwaredevelopment.hu — Optimalizácia výkonu, vývoj webov a technické riešenia pre firmy.**

---

## Zdroje

- Google for Developers: [About PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about)
- Google for Developers: [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/rest)
- Google: [PageSpeed Insights](https://pagespeed.web.dev/)
- web.dev: [Understand the critical path](https://web.dev/learn/performance/understanding-the-critical-path)
- web.dev: [Optimise resource loading](https://web.dev/learn/performance/optimize-resource-loading)
- web.dev: [Image performance](https://web.dev/learn/performance/image-performance)
- web.dev: [Key performance issues](https://web.dev/learn/images/performance-issues)
- web.dev: [Third-party JavaScript performance](https://web.dev/articles/third-party-javascript)
- web.dev: [Content delivery networks](https://web.dev/articles/content-delivery-networks)
- web.dev: [Getting started with measuring Web Vitals](https://web.dev/articles/vitals-measurement-getting-started)
- Google for Developers: [PageSpeed Insights FAQ](https://developers.google.com/speed/docs/insights/faq)
