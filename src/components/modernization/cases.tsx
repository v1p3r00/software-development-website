import type { ComponentType } from 'react';
import type { L10n } from '../../data/projects';
import OldBakery from './bakery/OldBakery';
import NewBakery from './bakery/NewBakery';
import OldLaw from './law/OldLaw';
import NewLaw from './law/NewLaw';
import OldShop from './shop/OldShop';
import NewShop from './shop/NewShop';
import './mz.css';
import './bakery/bakery.css';
import './law/law.css';
import './shop/shop.css';

/** one before/after pair on the modernization page — every brand is fictional */
export interface ShowCase {
  id: 'bakery' | 'law' | 'shop';
  tab: L10n;
  kind: L10n;
  address: string;
  Old: ComponentType;
  New: ComponentType<{ mobile?: boolean }>;
  /** fills the before layer under a short old page */
  beforeBg: string;
  /** what to click in the redesign */
  tryIt: L10n;
  changes: Array<{ t: L10n; d: L10n }>;
}

export const cases: ShowCase[] = [
  {
    id: 'bakery',
    tab: { en: 'Confectionery', hu: 'Cukrászda' },
    kind: { en: 'Málnavirág — a neighbourhood confectionery since 1972', hu: 'Málnavirág — környékbeli cukrászda 1972 óta' },
    address: 'malnavirag-cukraszda.hu',
    Old: OldBakery,
    New: NewBakery,
    beforeBg: '#d63384',
    tryIt: {
      en: 'Try it: hover “Kínálat” for the mega menu, design a cake (it redraws live), add to the cart, book a table.',
      hu: 'Próbáld ki: vidd az egeret a „Kínálat” fölé, tervezz tortát (élőben rajzolódik), tegyél valamit a kosárba, foglalj asztalt.',
    },
    changes: [
      {
        t: { en: 'Mobile first', hu: 'Mobil az első' },
        d: {
          en: 'A fixed 830px column becomes a layout built for the phone — compare the two in Mobile view.',
          hu: 'A fix 830 pixeles hasábból telefonra tervezett elrendezés lesz — nézd meg Mobil nézetben.',
        },
      },
      {
        t: { en: 'Order a cake online', hu: 'Online tortarendelés' },
        d: {
          en: '“Orders by phone only” becomes a configurator: occasion, flavour, size and inscription with a live preview and price.',
          hu: 'A „rendelés kizárólag telefonon” helyett konfigurátor: alkalom, íz, méret és felirat, élő előnézettel és árral.',
        },
      },
      {
        t: { en: 'Cart & table booking', hu: 'Kosár és asztalfoglalás' },
        d: {
          en: 'A cart drawer with quantities and a free-delivery bar, plus table booking with day, time and party size.',
          hu: 'Kosár mennyiségekkel és ingyenes szállítás sávval, valamint asztalfoglalás nappal, időponttal és létszámmal.',
        },
      },
      {
        t: { en: 'Live information', hu: 'Élő információk' },
        d: {
          en: '“Open now / opens at…” is calculated from the opening hours; the seasonal offer counts down in real time.',
          hu: 'A „most nyitva / ekkor nyit” a nyitvatartásból számolódik, a szezonális ajánlat valós időben számol vissza.',
        },
      },
    ],
  },
  {
    id: 'law',
    tab: { en: 'Law firm', hu: 'Ügyvédi iroda' },
    kind: { en: 'Halmos & Rét — a business law firm', hu: 'Halmos & Rét — üzleti jogi iroda' },
    address: 'halmos-ret.hu',
    Old: OldLaw,
    New: NewLaw,
    beforeBg: '#d9dde4',
    tryIt: {
      en: 'Try it: hover “Szakterületek”, switch practice areas, open the FAQ, book a consultation, send the contact form.',
      hu: 'Próbáld ki: vidd az egeret a „Szakterületek” fölé, válts szakterületet, nyisd ki a GYIK-et, foglalj konzultációt, küldd el az űrlapot.',
    },
    changes: [
      {
        t: { en: 'Trust at first glance', hu: 'Bizalom első ránézésre' },
        d: {
          en: 'Clipart and a welcome paragraph give way to a clear promise, figures and recognisable practice areas.',
          hu: 'A clipart és az üdvözlő bekezdés helyett világos ígéret, számok és felismerhető szakterületek.',
        },
      },
      {
        t: { en: 'Book a consultation', hu: 'Konzultáció foglalása' },
        d: {
          en: 'A three-step booking: topic, a free time slot and contact details — instead of “call us during office hours”.',
          hu: 'Háromlépéses foglalás: téma, szabad időpont és elérhetőség — a „hívjon minket irodaidőben” helyett.',
        },
      },
      {
        t: { en: 'Answers before the call', hu: 'Válaszok a hívás előtt' },
        d: {
          en: 'Practice-area tabs, transparent fee models and an FAQ answer the questions clients would otherwise phone about.',
          hu: 'Szakterület-fülek, átlátható díjazás és GYIK válaszolja meg azt, amiért egyébként telefonálnának.',
        },
      },
      {
        t: { en: 'Forms that guide', hu: 'Vezető űrlapok' },
        d: {
          en: 'Inline validation, a consent checkbox and a clear confirmation instead of a bare mailto link.',
          hu: 'Azonnali ellenőrzés, adatkezelési hozzájárulás és egyértelmű visszajelzés egy puszta mailto link helyett.',
        },
      },
    ],
  },
  {
    id: 'shop',
    tab: { en: 'Webshop', hu: 'Webshop' },
    kind: { en: 'Kőmáz — a handmade ceramics shop', hu: 'Kőmáz — kézműves kerámia webshop' },
    address: 'komaz-keramia.hu',
    Old: OldShop,
    New: NewShop,
    beforeBg: '#e9eef5',
    tryIt: {
      en: 'Try it: search, filter and sort, switch glaze colours on a product, add to the wishlist and cart, change quantities.',
      hu: 'Próbáld ki: keress, szűrj és rendezz, válts mázszínt egy terméken, tegyél kedvencekhez és kosárba, módosítsd a mennyiséget.',
    },
    changes: [
      {
        t: { en: 'Find it fast', hu: 'Gyorsan megtalálható' },
        d: {
          en: 'Live search, category filters, price range and sorting replace a category tree and a “search” page.',
          hu: 'Élő keresés, kategóriaszűrők, ársáv és rendezés a kategóriafa és a külön keresőoldal helyett.',
        },
      },
      {
        t: { en: 'Product cards that sell', hu: 'Termékkártyák, amik eladnak' },
        d: {
          en: 'Glaze swatches recolour the product, quick add, wishlist hearts, ratings and stock hints on every card.',
          hu: 'A mázszín-választó átszínezi a terméket; gyors kosárba tétel, kedvencek, értékelés és készletjelzés minden kártyán.',
        },
      },
      {
        t: { en: 'A cart that keeps you', hu: 'Kosár, ami megtart' },
        d: {
          en: 'A slide-in cart with quantities, a free-shipping progress bar and a coupon field — no page reloads.',
          hu: 'Becsúszó kosár mennyiségekkel, ingyenes szállítás sávval és kuponmezővel — oldalújratöltés nélkül.',
        },
      },
      {
        t: { en: 'Built for phones', hu: 'Telefonra tervezve' },
        d: {
          en: 'A two-column product grid, a filter sheet and a sticky cart button where the thumb is.',
          hu: 'Kéthasábos termékrács, szűrőpanel és kéznél lévő kosár gomb.',
        },
      },
    ],
  },
];
