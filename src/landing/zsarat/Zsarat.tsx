import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "@fontsource-variable/dm-sans";
import "./zsarat.css";
import {
  jump,
  reducedMotion,
  useCountUp,
  useInView,
  usePointerTilt,
  useReveal,
  useScrolledPast,
  useToast,
} from "../kit";

/**
 * Zsarát — a fictional live-fire tasting-menu restaurant in Budapest.
 * Dark, warm, theatrical: a plate that changes course by course as the menu scrolls.
 */

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const ft = (n: number) => `${n.toLocaleString("hu-HU")} Ft`;

type Course = {
  key: string;
  title: string;
  dish: string;
  parts: string;
  method: string;
  wine: string;
  wineNote: string;
};

const COURSES: Course[] = [
  {
    key: "hamu",
    title: "Hamu",
    dish: "Hamuban sült zeller",
    parts: "zeller · pörkölt mogyoró · lestyánolaj · barnavaj",
    method:
      "Hat órán át pihen a tegnapi tűz meleg hamujában, amíg a héja kéreggé, a belseje krémmé nem válik.",
    wine: "Somlói juhfark, 2021",
    wineNote:
      "Sós, vulkanikus, feszes savakkal — kinyitja a mogyoró pörkölt ízét.",
  },
  {
    key: "fogas",
    title: "Víz",
    dish: "Balatoni fogas",
    parts: "fogas · vajas fehérbor-mártás · füstölt paprikaolaj · kapor",
    method:
      "Bőrrel lefelé, izzó bükkfaszén fölött, öntöttvas rácson — kilencven másodperc, egyetlen fordítás.",
    wine: "Badacsonyi szürkebarát, 2020",
    wineNote: "Krémes test, érett körte és bazaltos ásványosság.",
  },
  {
    key: "cekla",
    title: "Föld",
    dish: "Parázsban sült cékla",
    parts: "cékla · érlelt kecskesajt · fekete ribizli · sóska",
    method:
      "Egészben a parázs közé temetjük, majd vékonyra szeleteljük — a füst a gyümölcsös édességet emeli ki.",
    wine: "Villányi kékfrankos rozé, 2023",
    wineNote: "Vadeper és rózsabors, hűvösen szervírozva.",
  },
  {
    key: "mangalica",
    title: "Füst",
    dish: "Mangalica tarja",
    parts: "mangalicatarja · égetett hagymasziromok · hordós lé · tárkony",
    method:
      "Tölgyfa füstjén érlelt hús, a végén szőlővenyigén lezárva; a hagymát közvetlenül a lángba tesszük.",
    wine: "Szekszárdi kadarka, 2021",
    wineNote: "Selymes, fűszeres, finom tanninokkal — a zsír legjobb barátja.",
  },
  {
    key: "kacsa",
    title: "Láng",
    dish: "Füstölt kacsamell",
    parts: "kacsamell · savanyú meggy · kakukkfű · zsályás pecsenyelé",
    method:
      "Bőrös oldalán lassan olvasztjuk, majd a lángnyelvek fölött kap kérget. Rózsaszín marad, ahogy kell.",
    wine: "Egri bikavér, 2019",
    wineNote: "Sötét meggy, cédrus és bors — a fogás tükörképe.",
  },
  {
    key: "szilva",
    title: "Parázs",
    dish: "Szilva és füst",
    parts:
      "besztercei szilva · füstölt tejszín · zabmorzsa · citromos kakukkfű",
    method:
      "A kihunyó parázson karamellizált szilva, szénen füstölt tejszínnel. Átvezetés az édes felé.",
    wine: "Tokaji szamorodni, száraz, 2018",
    wineNote: "Dió, aszalt alma és élesztős mélység — meglepően frissítő.",
  },
  {
    key: "parazs",
    title: "Izzás",
    dish: "Parázs",
    parts: "étcsokoládé · égetett méz · homoktövis · hamukakaó",
    method:
      "Hetven százalékos csokoládé, a tűzhely szélén égetett mézzel. Az utolsó fogás az utolsó izzó szén.",
    wine: "Tokaji aszú, 5 puttonyos, 2017",
    wineNote: "Sárgabarack, narancshéj és méz — hosszú, lassú lecsengés.",
  },
];

// invented producer names
const PRODUCERS = [
  "Rézkapu Pince",
  "Nádasvíz Halászat",
  "Zöldhalom Major",
  "Szélcsend Sajtműhely",
  "Kőröstető Szénégetők",
  "Hárskert Méhes",
  "Bükkalja Gombászat",
  "Vadrózsa Kertészet",
];

const QUOTES = [
  [
    "„Három és fél óra volt, és egyetlen percét sem néztem az órámat. A céklánál elcsendesedett az egész asztal.”",
    "Lukács Dóra",
    "Budapest",
  ],
  [
    "„Látni, ahogy a séf kézzel igazítja a parazsat a hal alatt — ez színház, csak ehető.”",
    "Henrik V.",
    "Bécs",
  ],
  [
    "„A borpárosítás bátor és pontos. A szamorodni a szilvához azóta is velem van.”",
    "Szabó Benedek",
    "Pécs",
  ],
];

const FAQ = [
  [
    "Mennyi ideig tart a vacsora?",
    "A hétfogásos menü nagyjából két és fél, a tízfogásos három és fél órát vesz igénybe. Kérjük, érkezzenek pontosan — a tűz a vendégek ritmusára ég.",
  ],
  [
    "Tudnak ételallergiához vagy diétához igazodni?",
    "Igen. Vegetáriánus menüt mindig főzünk, egyéb kéréseket legalább 48 órával a vacsora előtt kérünk jelezni. Teljesen vegán menüt jelenleg nem tudunk nyílt tűzön méltóan elkészíteni.",
  ],
  [
    "Van alkoholmentes párosítás?",
    "Van: házi erjesztett gyümölcsitalok, füstölt teák és verjus-alapú koktélok, fogásonként válogatva. Ára megegyezik a borpárosításéval.",
  ],
  [
    "Van öltözködési elvárás?",
    "Nincs. Legyen kényelmes — a pult mellett meleg van, a pincében hűvösebb. Egy könnyű réteg sosem árt.",
  ],
  [
    "Hozhatok gyermeket?",
    "Tizenkét éves kortól szeretettel várjuk a fiatal vendégeket is; nekik rövidebb, igazított menüt főzünk.",
  ],
  [
    "Mi a helyzet lemondás esetén?",
    "A vacsora előtt 72 óráig díjmentesen módosíthat vagy lemondhat. Ezt követően a menü árának felét számítjuk fel, mert a beszerzés már megtörtént.",
  ],
];

/* ---------------------------------------------------------------- small art */

function Grad({
  id,
  s,
  r,
  at,
}: {
  id: string;
  s: string;
  r?: boolean;
  at?: string;
}) {
  const stops = s.split(",").map((x, i) => {
    const [c, o, a] = x.split(" ");
    return <stop key={i} offset={o} stopColor={c} stopOpacity={a} />;
  });
  const v = (at || (r ? ".5 .5 .5" : "0 0 0 1")).split(" ");
  return r ? (
    <radialGradient id={id} cx={v[0]} cy={v[1]} r={v[2]}>
      {stops}
    </radialGradient>
  ) : (
    <linearGradient id={id} x1={v[0]} y1={v[1]} x2={v[2]} y2={v[3]}>
      {stops}
    </linearGradient>
  );
}

function Wordmark({ big = false }: { big?: boolean }) {
  return (
    <span className={`zs-wordmark ${big ? "zs-wordmark--xl" : ""}`}>
      <svg viewBox="0 0 20 26" className="zs-mark" aria-hidden>
        <path
          d="M10 1c1 5 7 8 7 15a7 7 0 0 1-14 0c0-4 2-6 4-8 0 3 1 5 3 5-2-4-1-9 0-12z"
          fill="currentColor"
        />
      </svg>
      Zsarát
    </span>
  );
}

function Sparks({ n = 9 }: { n?: number }) {
  return (
    <div className="zs-sparks" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--x": `${(i * 37) % 100}%`,
              "--dl": `${(i * 0.83) % 5}s`,
              "--dur": `${4.2 + ((i * 7) % 5) * 0.6}s`,
              "--dx": `${((i % 3) - 1) * 26}px`,
              "--s": `${0.6 + ((i * 3) % 4) * 0.22}`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function flame(cx: number, base: number, h: number, w: number) {
  return `M${cx - w} ${base} C${cx - w * 1.1} ${base - h * 0.45} ${cx - w * 0.25} ${base - h * 0.62} ${cx} ${base - h} C${cx + w * 0.15} ${base - h * 0.6} ${cx + w * 1.1} ${base - h * 0.48} ${cx + w} ${base} Z`;
}

function Hearth() {
  const bricks = useMemo(() => {
    const out: ReactNode[] = [];
    for (let a = 0; a <= 180; a += 12) {
      const r = (a * Math.PI) / 180;
      out.push(
        <line
          key={`v${a}`}
          x1={260 + 172 * Math.cos(r)}
          y1={262 - 172 * Math.sin(r)}
          x2={260 + 226 * Math.cos(r)}
          y2={262 - 226 * Math.sin(r)}
        />,
      );
    }
    for (let y = 290, row = 0; y < 560; y += 28, row++) {
      out.push(
        <line key={`hl${y}`} x1={34} y1={y} x2={88} y2={y} />,
        <line key={`hr${y}`} x1={432} y1={y} x2={486} y2={y} />,
      );
      const x = row % 2 ? 60 : 48;
      out.push(
        <line key={`jl${y}`} x1={x} y1={y} x2={x} y2={y + 28} />,
        <line key={`jr${y}`} x1={x + 412} y1={y} x2={x + 412} y2={y + 28} />,
      );
    }
    return out;
  }, []);
  const coals = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const x = 130 + ((i * 53) % 260);
        const y = 528 + ((i * 17) % 22);
        return (
          <ellipse
            key={i}
            className="zs-coal"
            cx={x}
            cy={y}
            rx={9 + (i % 4) * 3}
            ry={5 + (i % 3) * 2}
            style={{ "--dl": `${(i * 0.37) % 3}s` } as CSSProperties}
          />
        );
      }),
    [],
  );
  return (
    <svg
      viewBox="0 0 520 600"
      className="zs-hearth"
      role="img"
      aria-label="Nyílt tűzhely izzó parázzsal és lángokkal"
    >
      <defs>
        <Grad
          id="zs-h-in"
          r
          at=".5 .92 .85"
          s="#ffc06a 0,#E2572B .22,#5b1c0c .5,#140d0a 1"
        />
        <Grad id="zs-h-st" s="#3a2c24 0,#1d1612 1" />
        <Grad id="zs-h-log" s="#4a2e1e 0,#24150d .7,#ff7a36 1" />
        <Grad
          id="zs-h-coal"
          r
          at=".5 .4 .7"
          s="#ffd28a 0,#ff6a2a .5,#3a120a 1"
        />
        <Grad id="zs-h-floor" s="#4a382d 0,#1a1411 1" />
      </defs>
      {/* masonry */}
      <path d="M34 600V262a226 226 0 0 1 452 0v338z" fill="url(#zs-h-st)" />
      <path d="M88 600V262a172 172 0 0 1 344 0v338z" fill="url(#zs-h-in)" />
      <path
        d="M88 262a172 172 0 0 1 344 0v40c-40-60-110-92-172-92S128 242 88 302z"
        fill="#0d0907"
        opacity=".55"
      />
      <g stroke="#120d0a" strokeWidth="2.4" opacity=".85">
        {bricks}
      </g>
      <path
        d="M34 262a226 226 0 0 1 452 0"
        fill="none"
        stroke="rgb(255 200 150 / .12)"
        strokeWidth="2"
      />
      {/* coal bed */}
      <ellipse cx="260" cy="542" rx="164" ry="30" fill="#2a120a" />
      <ellipse
        cx="260"
        cy="536"
        rx="140"
        ry="20"
        fill="url(#zs-h-coal)"
        opacity=".85"
        className="zs-bed"
      />
      <g fill="url(#zs-h-coal)">{coals}</g>
      {/* logs */}
      <g transform="rotate(-10 260 510)">
        <rect
          x="128"
          y="496"
          width="236"
          height="30"
          rx="15"
          fill="url(#zs-h-log)"
        />
        <circle
          cx="143"
          cy="511"
          r="13"
          fill="#6b3a1e"
          stroke="#ff8a46"
          strokeWidth="2"
        />
        <circle
          cx="143"
          cy="511"
          r="6"
          fill="none"
          stroke="#3a1f10"
          strokeWidth="1.5"
        />
      </g>
      <g transform="rotate(12 260 510)">
        <rect
          x="170"
          y="500"
          width="230"
          height="28"
          rx="14"
          fill="url(#zs-h-log)"
        />
        <circle
          cx="386"
          cy="514"
          r="12"
          fill="#6b3a1e"
          stroke="#ff8a46"
          strokeWidth="2"
        />
        <circle
          cx="386"
          cy="514"
          r="5"
          fill="none"
          stroke="#3a1f10"
          strokeWidth="1.5"
        />
      </g>
      {/* flames */}
      <g className="zs-flame zs-flame--a">
        <path d={flame(250, 520, 230, 70)} fill="#E2572B" opacity=".9" />
        <path d={flame(254, 520, 170, 50)} fill="#f58a3c" />
        <path d={flame(258, 520, 110, 30)} fill="#ffd08a" />
      </g>
      <g className="zs-flame zs-flame--b">
        <path d={flame(186, 524, 150, 42)} fill="#E2572B" opacity=".85" />
        <path d={flame(190, 524, 96, 26)} fill="#ffb15c" />
      </g>
      <g className="zs-flame zs-flame--c">
        <path d={flame(330, 524, 170, 46)} fill="#E2572B" opacity=".85" />
        <path d={flame(326, 524, 110, 28)} fill="#ffb15c" />
        <path d={flame(326, 524, 60, 14)} fill="#fff0c8" />
      </g>
      {/* grate with onions charring */}
      <g>
        <rect x="104" y="452" width="312" height="7" rx="3" fill="#15100d" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <rect
            key={i}
            x={112 + i * 29}
            y="440"
            width="4"
            height="30"
            fill="#15100d"
          />
        ))}
        <rect
          x="104"
          y="452"
          width="312"
          height="2"
          fill="rgb(255 190 140 / .35)"
        />
        {[176, 344].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="444" rx="24" ry="9" fill="#2a1a12" />
            <ellipse cx={x} cy="441" rx="21" ry="7" fill="#e9d6b4" />
            <ellipse
              cx={x}
              cy="441"
              rx="14"
              ry="4.5"
              fill="none"
              stroke="#b9925e"
              strokeWidth="1.4"
            />
            <ellipse
              cx={x}
              cy="441"
              rx="7"
              ry="2.2"
              fill="none"
              stroke="#7a5432"
              strokeWidth="1.4"
            />
          </g>
        ))}
      </g>
      {/* hearth floor */}
      <rect
        x="10"
        y="560"
        width="500"
        height="40"
        rx="4"
        fill="url(#zs-h-floor)"
      />
      <rect
        x="10"
        y="560"
        width="500"
        height="2"
        fill="rgb(255 190 140 / .35)"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------- the plate */

const SPECKS = Array.from({ length: 70 }, (_, i) => {
  const a = i * 2.39996;
  const r = i < 44 ? 14 + ((i * 41) % 128) : 156 + ((i * 13) % 32);
  return [
    200 + Math.cos(a) * r,
    200 + Math.sin(a) * r,
    0.5 + (i % 3) * 0.45,
  ] as const;
});

function arc(n: number, r: number, from: number, to: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((from + ((to - from) * i) / Math.max(1, n - 1)) * Math.PI) / 180;
    return [200 + Math.cos(a) * r, 200 + Math.sin(a) * r, i] as const;
  });
}

function Dish({ k }: { k: string }) {
  switch (k) {
    case "hamu":
      return (
        <>
          {arc(18, 104, 120, 300).map(([x, y, i]) => (
            <circle
              key={i}
              cx={x + ((i * 7) % 11) - 5}
              cy={y + ((i * 5) % 9) - 4}
              r={1 + (i % 3) * 0.8}
              fill="#9b9188"
              opacity=".45"
            />
          ))}
          <ellipse
            cx="200"
            cy="204"
            rx="80"
            ry="74"
            fill="#9a6a2f"
            opacity=".35"
          />
          <circle cx="200" cy="200" r="60" fill="url(#zs-f-cel)" />
          <circle
            cx="200"
            cy="200"
            r="58"
            fill="none"
            stroke="#2a1f18"
            strokeWidth="6"
            opacity=".75"
          />
          <circle
            cx="200"
            cy="200"
            r="40"
            fill="none"
            stroke="#6b5640"
            strokeWidth="1"
            opacity=".45"
          />
          <circle
            cx="200"
            cy="200"
            r="22"
            fill="none"
            stroke="#6b5640"
            strokeWidth="1"
            opacity=".35"
          />
          <ellipse
            cx="184"
            cy="184"
            rx="18"
            ry="10"
            fill="#fff6e6"
            opacity=".35"
          />
          {arc(5, 82, -60, 60).map(([x, y, i]) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="7.5" ry="9.5" fill="#a8743d" />
              <path
                d={`M${x} ${y - 8}v16`}
                stroke="#5d3a1c"
                strokeWidth="1.2"
              />
            </g>
          ))}
          {arc(9, 96, 200, 320).map(([x, y, i]) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2 + (i % 3) * 1.4}
              fill="#6f8f3a"
            />
          ))}
          <path
            d="M150 128c10-16 26-18 36-12-10 2-22 6-36 12z"
            fill="#7d9a4a"
          />
        </>
      );
    case "fogas":
      return (
        <>
          <ellipse cx="205" cy="214" rx="100" ry="78" fill="#efe3c8" />
          <ellipse
            cx="190"
            cy="196"
            rx="70"
            ry="44"
            fill="#fff8ea"
            opacity=".5"
          />
          {[
            [140, 246, 6],
            [160, 262, 3.5],
            [250, 262, 5],
            [276, 236, 3],
            [228, 276, 3.6],
            [126, 214, 3],
            [292, 206, 4.2],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#d9482a" />
              <circle
                cx={x - r * 0.3}
                cy={y - r * 0.3}
                r={r * 0.3}
                fill="#ffb08a"
              />
            </g>
          ))}
          <g transform="rotate(-16 200 196)">
            <rect
              x="132"
              y="176"
              width="136"
              height="54"
              rx="26"
              fill="#f6efe4"
            />
            <rect
              x="132"
              y="166"
              width="136"
              height="54"
              rx="26"
              fill="url(#zs-f-skin)"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${158 + i * 22} 172l-10 42`}
                stroke="#3e2617"
                strokeWidth="3"
                strokeLinecap="round"
                opacity=".55"
              />
            ))}
            <rect
              x="148"
              y="172"
              width="80"
              height="10"
              rx="5"
              fill="#fff3d8"
              opacity=".35"
            />
          </g>
          <g
            stroke="#7d9a4a"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          >
            <path d="M262 142c8 6 16 8 24 6M270 146l2-8M278 148l4-7M266 144l-4-6" />
            <path d="M120 170c-6-6-8-14-6-20M117 160l-7-2M115 154l6-4" />
          </g>
        </>
      );
    case "cekla":
      return (
        <>
          {[0, 72, 144, 216, 288].map((a) => (
            <g key={a} transform={`rotate(${a} 200 200)`}>
              <path d="M168 146a32 32 0 0 1 64 0z" fill="url(#zs-f-beet)" />
              <path
                d="M178 146a22 22 0 0 1 44 0"
                fill="none"
                stroke="#d9608a"
                strokeWidth="1.2"
                opacity=".6"
              />
              <path
                d="M188 146a12 12 0 0 1 24 0"
                fill="none"
                stroke="#d9608a"
                strokeWidth="1.2"
                opacity=".5"
              />
            </g>
          ))}
          {[36, 156, 276].map((a) => {
            const r = (a * Math.PI) / 180;
            const x = 200 + Math.cos(r) * 62;
            const y = 200 + Math.sin(r) * 62;
            return (
              <g key={a} transform={`rotate(${a + 90} ${x} ${y})`}>
                <ellipse cx={x} cy={y} rx="16" ry="9" fill="#f4efe6" />
                <ellipse
                  cx={x - 4}
                  cy={y - 3}
                  rx="7"
                  ry="3"
                  fill="#fff"
                  opacity=".7"
                />
              </g>
            );
          })}
          <circle cx="200" cy="200" r="20" fill="#3a0f24" />
          <ellipse
            cx="194"
            cy="194"
            rx="7"
            ry="4"
            fill="#a0567a"
            opacity=".6"
          />
          {arc(8, 116, 0, 315).map(([x, y, i]) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2.5 + (i % 2) * 1.5}
              fill="#5a1430"
            />
          ))}
          {[96, 216, 336].map((a) => {
            const r = (a * Math.PI) / 180;
            const x = 200 + Math.cos(r) * 92;
            const y = 200 + Math.sin(r) * 92;
            return (
              <path
                key={a}
                transform={`rotate(${a} ${x} ${y})`}
                d={`M${x - 10} ${y}c6-8 14-8 20 0-6 8-14 8-20 0z`}
                fill="#6f9a3e"
              />
            );
          })}
        </>
      );
    case "mangalica":
      return (
        <>
          <path
            d="M120 236c-10-40 30-80 86-80s96 28 92 70-40 58-90 58-80-16-88-48z"
            fill="#4a2414"
          />
          <ellipse
            cx="190"
            cy="196"
            rx="54"
            ry="20"
            fill="#8a4a24"
            opacity=".35"
          />
          {[-24, -4, 16].map((a, i) => (
            <g key={a} transform={`rotate(${a} 200 250)`}>
              <rect
                x="172"
                y="122"
                width="56"
                height="112"
                rx="12"
                fill="#3b1f12"
              />
              <rect
                x="178"
                y="128"
                width="44"
                height="100"
                rx="9"
                fill="url(#zs-f-pork)"
              />
              <path
                d={`M184 ${150 + i * 6}c10 6 20-4 32 4M186 ${190 - i * 4}c8-4 18 6 28 0`}
                stroke="#f2dcc4"
                strokeWidth="2"
                fill="none"
                opacity=".55"
              />
            </g>
          ))}
          {[
            [112, 160],
            [292, 176],
            [270, 286],
          ].map(([x, y]) => (
            <g key={x}>
              <ellipse cx={x} cy={y} rx="18" ry="13" fill="#1e120c" />
              <ellipse
                cx={x}
                cy={y}
                rx="15"
                ry="10"
                fill="none"
                stroke="#e8d6b8"
                strokeWidth="2"
              />
              <ellipse cx={x} cy={y + 1} rx="10" ry="6" fill="#6b2f17" />
              <ellipse
                cx={x - 3}
                cy={y - 1}
                rx="4"
                ry="2"
                fill="#c27a4a"
                opacity=".6"
              />
            </g>
          ))}
          {arc(7, 112, 100, 170).map(([x, y, i]) => (
            <circle key={i} cx={x} cy={y} r="2" fill="#7d9a4a" />
          ))}
        </>
      );
    case "kacsa":
      return (
        <>
          <path
            d="M118 236a88 88 0 0 0 164 0"
            fill="none"
            stroke="#3a1410"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M126 240a80 80 0 0 0 148 0"
            fill="none"
            stroke="#7a2a20"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".7"
          />
          {arc(5, 62, 200, 340).map(([x, y, i]) => {
            const a = 200 + (140 * i) / 4;
            return (
              <g key={i} transform={`rotate(${a + 90} ${x} ${y})`}>
                <rect
                  x={x - 12}
                  y={y - 32}
                  width="24"
                  height="64"
                  rx="9"
                  fill="#2a1410"
                />
                <rect
                  x={x - 9}
                  y={y - 28}
                  width="18"
                  height="56"
                  rx="7"
                  fill="url(#zs-f-duck)"
                />
                <rect
                  x={x - 9}
                  y={y - 32}
                  width="18"
                  height="9"
                  rx="4"
                  fill="#e9cfa0"
                />
              </g>
            );
          })}
          {[
            [168, 252],
            [196, 268],
            [226, 256],
            [250, 236],
            [150, 230],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="7.5" fill="#8a0f1e" />
              <circle
                cx={x - 2.4}
                cy={y - 2.6}
                r="2.2"
                fill="#ff8a8a"
                opacity=".8"
              />
            </g>
          ))}
          {arc(10, 30, 0, 330).map(([x, y, i]) => (
            <circle key={i} cx={x} cy={y + 14} r="1.6" fill="#8aa356" />
          ))}
        </>
      );
    case "szilva":
      return (
        <>
          <circle cx="200" cy="200" r="38" fill="#efe4d2" />
          <path
            d="M200 200m-24 0a24 24 0 1 1 24 24a14 14 0 1 1 0-28a6 6 0 1 1-6 6"
            fill="none"
            stroke="#d6c4a6"
            strokeWidth="2"
          />
          {[20, 110, 200, 290].map((a) => {
            const r = (a * Math.PI) / 180;
            const x = 200 + Math.cos(r) * 74;
            const y = 200 + Math.sin(r) * 74;
            return (
              <g key={a} transform={`rotate(${a} ${x} ${y})`}>
                <ellipse cx={x} cy={y} rx="24" ry="19" fill="#4b1d3f" />
                <ellipse cx={x} cy={y} rx="20" ry="15" fill="url(#zs-f-plum)" />
                <ellipse cx={x + 4} cy={y} rx="7" ry="5" fill="#7a3a12" />
                <ellipse
                  cx={x - 7}
                  cy={y - 6}
                  rx="5"
                  ry="2"
                  fill="#fff0c0"
                  opacity=".6"
                />
              </g>
            );
          })}
          {arc(22, 118, 0, 340).map(([x, y, i]) => (
            <circle
              key={i}
              cx={x + ((i * 7) % 9) - 4}
              cy={y + ((i * 3) % 7) - 3}
              r={1.6 + (i % 3)}
              fill="#b8864f"
            />
          ))}
          <path
            d="M226 150c10-12 22-14 30-10M236 146l-2-7M246 142l1-7"
            stroke="#8aa356"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    default:
      return (
        <>
          {arc(26, 102, 150, 330).map(([x, y, i]) => (
            <circle
              key={i}
              cx={x + ((i * 5) % 9) - 4}
              cy={y + ((i * 7) % 9) - 4}
              r={0.8 + (i % 3) * 0.7}
              fill="#3a2418"
              opacity=".9"
            />
          ))}
          <path
            d="M126 262c40 26 104 30 152 6"
            fill="none"
            stroke="url(#zs-f-honey)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M140 266c30 14 70 18 104 8"
            fill="none"
            stroke="#ffe2a8"
            strokeWidth="2"
            strokeLinecap="round"
            opacity=".5"
          />
          <circle cx="200" cy="196" r="48" fill="url(#zs-f-choc)" />
          <ellipse cx="182" cy="176" rx="18" ry="9" fill="#fff" opacity=".12" />
          <path d="M210 160l9-6 4 8-7 5z" fill="#e8c46a" />
          <path d="M226 178l5-2 1 5-4 2z" fill="#e8c46a" />
          <path d="M238 214l26-30 6 12 14-6-10 22 12 4-30 18z" fill="#1c0e08" />
          <path
            d="M244 214l20-22 4 9 9-3-7 15 7 3-22 12z"
            fill="#E2572B"
            opacity=".8"
          />
          {[
            [142, 210, 7],
            [128, 236, 5],
            [154, 160, 4],
            [262, 248, 6],
            [282, 228, 3.6],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#f08a24" />
              <circle
                cx={x - r * 0.3}
                cy={y - r * 0.35}
                r={r * 0.32}
                fill="#ffe0a8"
              />
            </g>
          ))}
        </>
      );
  }
}

function Plate({ active }: { active: number }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className="zs-plate"
      role="img"
      aria-label={`${COURSES[active].dish} — felülnézetből, sötét kerámiatányéron`}
    >
      <defs>
        <Grad
          id="zs-p-rim"
          r
          at=".4 .36 .72"
          s="#3b3430 0,#221e1b .6,#121010 1"
        />
        <Grad id="zs-p-well" r at=".44 .4 .7" s="#2e2824 0,#191614 1" />
        <Grad
          id="zs-p-hl"
          at="0 0 1 1"
          s="#fff0dc 0 .28,#fff0dc .45 0,#E2572B 1 .25"
        />
        <Grad
          id="zs-f-cel"
          r
          at=".42 .4 .6"
          s="#f1e6d0 0,#c8b18a .6,#6a523c 1"
        />
        <Grad id="zs-f-skin" s="#e2c99a 0,#b8864a .5,#6e4a2c 1" />
        <Grad id="zs-f-beet" s="#b8265a 0,#5e0e2c 1" />
        <Grad id="zs-f-pork" at="0 0 1 1" s="#e6a08e 0,#b85e50 1" />
        <Grad id="zs-f-duck" s="#c45666 0,#8e2a3a 1" />
        <Grad
          id="zs-f-plum"
          r
          at=".5 .5 .6"
          s="#e7a84a 0,#b8642a .8,#6e2a3a 1"
        />
        <Grad id="zs-f-honey" at="0 0 1 0" s="#a8601c 0,#e09a3c .5,#7a3a12 1" />
        <Grad
          id="zs-f-choc"
          r
          at=".38 .34 .7"
          s="#6a4030 0,#2e1810 .45,#0e0604 1"
        />
      </defs>
      <circle cx="200" cy="200" r="196" fill="url(#zs-p-rim)" />
      <circle
        cx="200"
        cy="200"
        r="195"
        fill="none"
        stroke="url(#zs-p-hl)"
        strokeWidth="2.5"
      />
      <circle cx="200" cy="200" r="150" fill="url(#zs-p-well)" />
      <circle
        cx="200"
        cy="200"
        r="151"
        fill="none"
        stroke="#0a0908"
        strokeWidth="3"
        opacity=".7"
      />
      <circle
        cx="200"
        cy="200"
        r="154"
        fill="none"
        stroke="#fff0dc"
        strokeWidth="1"
        opacity=".08"
      />
      <g fill="#cbbba6" opacity=".16">
        {SPECKS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g transform="translate(200 200) scale(1.14) translate(-200 -200)">
        {COURSES.map((c, i) => (
          <g
            key={c.key}
            className={`zs-dish ${i === active ? "is-on" : ""}`}
            style={{ "--dir": i < active ? -1 : 1 } as CSSProperties}
          >
            <Dish k={c.key} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- sections */

function Nav() {
  const solid = useScrolledPast(30);
  return (
    <nav className={`zs-nav ${solid ? "is-solid" : ""}`} aria-label="Zsarát">
      <div className="zs-wrap zs-nav-in">
        <a
          href="#top"
          onClick={jump("top")}
          aria-label="Zsarát — vissza a tetejére"
        >
          <Wordmark />
        </a>
        <div className="zs-nav-links">
          {[
            ["menu", "Menü"],
            ["tuz", "A tűz"],
            ["pince", "Pince"],
            ["ajandek", "Utalvány"],
            ["gyik", "GYIK"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)}>
              {label}
            </a>
          ))}
        </div>
        <a
          href="#foglalas"
          onClick={jump("foglalas")}
          className="zs-btn zs-btn--sm zs-btn--line"
        >
          Asztalfoglalás
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const area = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  usePointerTilt(area, tilt, 8);
  return (
    <header className="zs-hero" id="top" ref={area}>
      <div className="zs-ember" aria-hidden />
      <div className="zs-wrap zs-hero-grid">
        <div className="zs-hero-copy">
          <p className="zs-kicker" data-reveal>
            Budapest · csak vacsora
          </p>
          <h1 className="zs-h1" data-reveal style={d(80)}>
            Minden fogás <em>tűzön</em> születik.
          </h1>
          <p className="zs-lead" data-reveal style={d(180)}>
            Tizennyolc szék, egy nyílt tűzhely és egy hét vagy tíz fogásos
            kóstolómenü, amely a Kárpát-medence évszakait meséli el — gáz és
            villany nélkül, csak fával, parázzsal és türelemmel.
          </p>
          <div className="zs-cta-row" data-reveal style={d(260)}>
            <a
              href="#foglalas"
              onClick={jump("foglalas")}
              className="zs-btn zs-btn--ember"
            >
              Asztalt foglalok <span aria-hidden>→</span>
            </a>
            <a
              href="#menu"
              onClick={jump("menu")}
              className="zs-btn zs-btn--ghost"
            >
              A menü fogásról fogásra
            </a>
          </div>
          <dl className="zs-hero-stats" data-reveal style={d(340)}>
            <div>
              <dt>szék a pult körül</dt>
              <dd>18</dd>
            </div>
            <div>
              <dt>fogás</dt>
              <dd>
                7 <span>/</span> 10
              </dd>
            </div>
            <div>
              <dt>a parázs szívében</dt>
              <dd>900 °C</dd>
            </div>
          </dl>
        </div>
        <div className="zs-hero-stage" data-reveal style={d(200)}>
          <div className="zs-tilt" ref={tilt}>
            <div className="zs-hearth-wrap">
              <Hearth />
              <Sparks n={10} />
            </div>
            <div className="zs-hero-tag zs-hero-tag--a">
              <span className="zs-live" /> Ma este 19:00-kor gyújtunk
            </div>
            <div className="zs-hero-tag zs-hero-tag--b">
              <b>bükk · tölgy · venyige</b>
              <span>háromféle fa, háromféle füst</span>
            </div>
          </div>
        </div>
      </div>
      <a
        href="#hitvallas"
        onClick={jump("hitvallas")}
        className="zs-scroll"
        aria-label="Görgetés lefelé"
      >
        <span />
      </a>
    </header>
  );
}

function Producers() {
  const row = (
    <>
      {PRODUCERS.map((p) => (
        <span key={p} className="zs-prod">
          {p}
          <i aria-hidden>✦</i>
        </span>
      ))}
    </>
  );
  return (
    <section className="zs-producers" aria-label="Termelőink">
      <p className="zs-producers-label">
        Akikkel együtt főzünk — 150 kilométeren belülről
      </p>
      <div className="zs-marquee" aria-hidden>
        <div className="zs-marquee-track">
          {row}
          {row}
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  const pillars = [
    [
      "I.",
      "Tűz",
      "Nincs gáz, nincs indukció. Minden fogás a tűzhelyen, a parázson vagy a hamuban készül — a hőfokot fával és kézzel szabályozzuk.",
    ],
    [
      "II.",
      "Évszak",
      "A menü hathetente megújul. Ha elfogy a fogas vagy véget ér a meggyszezon, a fogás is továbbáll.",
    ],
    [
      "III.",
      "Közelség",
      "Tizennyolc vendég ül a nyitott konyha körül. A szakácsok szolgálják fel, amit főztek, és el is mesélik.",
    ],
  ];
  return (
    <section className="zs-philo" id="hitvallas">
      <div className="zs-wrap">
        <div className="zs-philo-grid">
          <div className="zs-chef" data-reveal>
            <svg viewBox="0 0 220 260" className="zs-chef-art" aria-hidden>
              <defs>
                <Grad
                  id="zs-c-g"
                  r
                  at=".5 .8 .7"
                  s="#E2572B 0 .55,#E2572B 1 0"
                />
              </defs>
              <rect width="220" height="260" rx="110" fill="#1d1916" />
              <rect width="220" height="260" rx="110" fill="url(#zs-c-g)" />
              <path d="M40 260c4-50 34-74 70-74s66 24 70 74z" fill="#efe6d6" />
              <path d="M110 186v74" stroke="#cdbfa8" strokeWidth="1.5" />
              <circle cx="96" cy="214" r="2.5" fill="#9c8d78" />
              <circle cx="96" cy="234" r="2.5" fill="#9c8d78" />
              <path
                d="M92 186l18 18 18-18"
                fill="none"
                stroke="#cdbfa8"
                strokeWidth="1.5"
              />
              <rect
                x="98"
                y="152"
                width="24"
                height="30"
                rx="8"
                fill="#c99577"
              />
              <ellipse cx="110" cy="126" rx="34" ry="40" fill="#d8a687" />
              <path
                d="M74 120c0-34 18-50 38-50s36 14 36 46c-8-14-22-22-38-24-14 4-26 12-36 28z"
                fill="#2b1d16"
              />
              <path
                d="M78 104c10-30 56-36 70-6"
                fill="none"
                stroke="#3d2a20"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
            <div className="zs-chef-cap">
              <b>Kardos Imola</b>
              <span>séf és alapító</span>
            </div>
          </div>
          <div>
            <p className="zs-kicker" data-reveal>
              Hitvallás
            </p>
            <blockquote className="zs-quote-big" data-reveal style={d(100)}>
              „A tűz nem eszköz, hanem a konyha legidősebb szakácsa.{" "}
              <em>Mi csak megtanultunk figyelni rá.</em>”
            </blockquote>
            <p className="zs-body" data-reveal style={d(180)}>
              Kardos Imola tizenkét évig főzött mások konyháin, mielőtt egy régi
              pesti pince boltíve alatt megrakta az első tüzet. A Zsarát azóta
              is egyetlen kérdésre keres választ: mit tud a füst, a parázs és a
              hamu elmondani a hazai alapanyagokról, amit a villanysütő soha.
            </p>
          </div>
        </div>
        <div className="zs-pillars">
          {pillars.map(([n, h, p], i) => (
            <article
              key={n}
              className="zs-pillar"
              data-reveal
              style={d(i * 120)}
            >
              <span className="zs-num">{n}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Menu() {
  const [active, setActive] = useState(0);
  const items = useRef<Array<HTMLElement | null>>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-52% 0px -42% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  const go = (i: number) =>
    items.current[i]?.scrollIntoView({
      behavior: reducedMotion() ? "auto" : "smooth",
      block: "center",
    });
  const c = COURSES[active];
  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <section className="zs-menu" id="menu">
      <div className="zs-wrap">
        <div className="zs-menu-head">
          <p className="zs-kicker" data-reveal>
            Őszi kóstolómenü · 2026
          </p>
          <h2 className="zs-h2" data-reveal style={d(80)}>
            Hét fogás, <em>egy tűz</em> — görgessen végig a vacsorán.
          </h2>
        </div>
        <div className="zs-menu-grid">
          <div className="zs-stage">
            <div className="zs-stage-in">
              <div className="zs-stage-glow" aria-hidden />
              <div className="zs-plate-wrap">
                <div className="zs-plate-shadow" aria-hidden />
                <Plate active={active} />
              </div>
              <div className="zs-stage-meta">
                <svg viewBox="0 0 100 100" className="zs-ring" aria-hidden>
                  <circle cx="50" cy="50" r={R} className="zs-ring-bg" />
                  <circle
                    cx="50"
                    cy="50"
                    r={R}
                    className="zs-ring-fg"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - (active + 1) / COURSES.length)}
                  />
                </svg>
                <span className="zs-ring-n">
                  {String(active + 1).padStart(2, "0")}
                  <small>/07</small>
                </span>
                <div className="zs-stage-name" key={c.key}>
                  <span>{c.title}</span>
                  <b>{c.dish}</b>
                </div>
              </div>
              <div className="zs-dots" role="tablist" aria-label="Fogások">
                {COURSES.map((x, i) => (
                  <button
                    key={x.key}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`${i + 1}. fogás: ${x.dish}`}
                    className={i === active ? "is-on" : ""}
                    onClick={() => go(i)}
                  />
                ))}
              </div>
            </div>
          </div>
          <ol className="zs-courses">
            {COURSES.map((x, i) => (
              <li
                key={x.key}
                ref={(el) => {
                  items.current[i] = el;
                }}
                data-i={i}
                className={`zs-course ${i === active ? "is-on" : ""}`}
              >
                <span className="zs-course-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="zs-course-t">{x.title}</p>
                <h3>{x.dish}</h3>
                <p className="zs-course-parts">{x.parts}</p>
                <p className="zs-course-m">{x.method}</p>
                <div className="zs-pair">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M7 2h10l-1 7a4 4 0 0 1-8 0zM12 13v8M8 21h8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <b>{x.wine}</b>
                    <span>{x.wineNote}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="zs-menu-foot" data-reveal>
          A tízfogásos menü további három meglepetésfalatot tartalmaz a séf
          pultjáról — köztük a tűzhelyen sütött kovászos kenyeret
          mangalicazsírral.
        </p>
      </div>
    </section>
  );
}

function Fire() {
  const [ref, seen] = useInView<HTMLDListElement>(0.4);
  const t = useCountUp(900, seen, 1800);
  const h = useCountUp(14, seen, 1400);
  const km = useCountUp(150, seen, 1600);
  const day = [
    [
      "13:00",
      "Gyújtás",
      "Bükkfával indul a nap — két óra kell, mire a tűzhely kőfala átmelegszik.",
    ],
    [
      "16:30",
      "Parázságy",
      "A lángot hagyjuk lecsendesedni. Szétterítjük a parazsat: forró, közepes és pihenő zóna.",
    ],
    [
      "19:00",
      "Az első vendég",
      "Tölgyet teszünk rá a füstért, venyigét a gyors, illatos lángért.",
    ],
    [
      "23:30",
      "Hamu",
      "A kihűlő hamuba temetjük a holnapi zellert. A tűz sosem alszik ki teljesen.",
    ],
  ];
  return (
    <section className="zs-fire" id="tuz">
      <div className="zs-wrap">
        <div className="zs-fire-grid">
          <div>
            <p className="zs-kicker" data-reveal>
              A konyha
            </p>
            <h2 className="zs-h2" data-reveal style={d(80)}>
              Egy tűzhely, <em>tizennégy óra</em> izzás naponta.
            </h2>
            <p className="zs-body" data-reveal style={d(160)}>
              A tűzhelyet tokaji riolittufából rakta egy kőfaragó mester, a
              pince boltíve alá. Nincs páraelszívó-zúgás, nincs hőlégkeverés:
              csak a fa pattogása, a vas csendülése és tizennyolc vendég halk
              beszélgetése.
            </p>
            <dl className="zs-fire-stats" ref={ref}>
              <div>
                <dd>{Math.round(t)} °C</dd>
                <dt>a parázs szívében</dt>
              </div>
              <div>
                <dd>{Math.round(h)} óra</dd>
                <dt>ég a tűz naponta</dt>
              </div>
              <div>
                <dd>{Math.round(km)} km</dd>
                <dt>a legtávolabbi termelő</dt>
              </div>
            </dl>
          </div>
          <ol className="zs-day">
            {day.map(([time, h3, p], i) => (
              <li key={time} data-reveal style={d(i * 110)}>
                <span className="zs-day-t">{time}</span>
                <div>
                  <h3>{h3}</h3>
                  <p>{p}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Cellar() {
  const bottles = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const x = 86 + col * 30 + (row % 2) * 15;
        const y = 150 + row * 28;
        const wax = i % 11 === 3 || i % 13 === 7;
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="12"
              fill={wax ? "#7a1a10" : "#16201a"}
              stroke="#0c0a09"
              strokeWidth="2"
            />
            <circle cx={x} cy={y} r="5.5" fill={wax ? "#E2572B" : "#2a3a2e"} />
            <circle cx={x - 4} cy={y - 4} r="2" fill="#fff" opacity=".25" />
          </g>
        );
      }),
    [],
  );
  const regions = [
    ["Tokaj", "furmint, hárslevelű, szamorodni, aszú"],
    ["Somló", "juhfark és olaszrizling vulkáni talajról"],
    ["Szekszárd", "kadarka, kékfrankos, bikavér"],
    ["Badacsony", "szürkebarát és kéknyelű bazalton"],
  ];
  return (
    <section className="zs-cellar" id="pince">
      <div className="zs-wrap zs-cellar-grid">
        <div className="zs-cellar-art" data-reveal>
          <svg
            viewBox="0 0 420 380"
            role="img"
            aria-label="Boltíves borpince palackfekvő polccal és gyertyával"
          >
            <defs>
              <Grad id="zs-v-l" r at=".5 .1 .9" s="#E2572B 0 .35,#E2572B 1 0" />
            </defs>
            <path d="M20 380V170a190 150 0 0 1 380 0v210z" fill="#211a16" />
            <path
              d="M20 380V170a190 150 0 0 1 380 0v210z"
              fill="url(#zs-v-l)"
            />
            <path
              d="M20 170a190 150 0 0 1 380 0"
              fill="none"
              stroke="#3a2c22"
              strokeWidth="10"
            />
            <path
              d="M44 172a166 126 0 0 1 332 0"
              fill="none"
              stroke="#120e0b"
              strokeWidth="2"
              strokeDasharray="14 10"
            />
            <rect
              x="64"
              y="128"
              width="292"
              height="186"
              rx="6"
              fill="#120e0b"
            />
            {bottles}
            <rect
              x="40"
              y="320"
              width="340"
              height="12"
              rx="3"
              fill="#3a2a1e"
            />
            <path d="M210 20v52" stroke="#3a2c22" strokeWidth="2" />
            <path d="M196 72h28l-6 18h-16z" fill="#2a1f18" />
            <circle
              cx="210"
              cy="96"
              r="8"
              fill="#ffcf8a"
              className="zs-flicker"
            />
            <circle
              cx="210"
              cy="96"
              r="30"
              fill="#ffb35c"
              fillOpacity=".18"
              className="zs-flicker"
            />
            <rect
              x="362"
              y="290"
              width="12"
              height="30"
              rx="2"
              fill="#efe6d6"
            />
            <path
              d="M368 290c-5-8-1-14 0-18 1 4 5 10 0 18z"
              fill="#ffb35c"
              className="zs-flicker"
            />
          </svg>
        </div>
        <div>
          <p className="zs-kicker" data-reveal>
            Borpárosítás és pince
          </p>
          <h2 className="zs-h2" data-reveal style={d(80)}>
            Négyszáz tétel, <em>csak magyar</em> dűlőkről.
          </h2>
          <p className="zs-body" data-reveal style={d(160)}>
            Sommelier-nk, Vadász Levente minden fogáshoz egy pohárnyi történetet
            választ: kis családi pincéktől, vulkanikus dűlőkről, sokszor olyan
            évjáratokból, amelyek sosem kerülnek boltok polcára.
          </p>
          <ul className="zs-regions">
            {regions.map(([r, w], i) => (
              <li key={r} data-reveal style={d(200 + i * 80)}>
                <b>{r}</b>
                <span>{w}</span>
              </li>
            ))}
          </ul>
          <div className="zs-pair-prices" data-reveal style={d(300)}>
            <div>
              <span>Borpárosítás · 7 fogás</span>
              <b>{ft(26000)}</b>
            </div>
            <div>
              <span>Borpárosítás · 10 fogás</span>
              <b>{ft(36000)}</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivateRoom({ notify }: { notify: (m: string) => void }) {
  const chairs = Array.from({ length: 10 }, (_, i) => {
    const top = i < 5;
    const x = 104 + (i % 5) * 54;
    return (
      <rect
        key={i}
        x={x - 16}
        y={top ? 64 : 210}
        width="32"
        height="26"
        rx="8"
        fill="#2c231d"
        stroke="#3d3028"
      />
    );
  });
  return (
    <section className="zs-private">
      <div className="zs-wrap zs-private-in">
        <div>
          <p className="zs-kicker" data-reveal>
            Különterem
          </p>
          <h2 className="zs-h2" data-reveal style={d(80)}>
            A Boltív-szoba, <em>tíz vendégnek.</em>
          </h2>
          <p className="zs-body" data-reveal style={d(160)}>
            Egyetlen hosszú tölgyasztal a pince legmélyebb boltíve alatt, saját
            kis parázstartóval. Születésnapra, jegyességre, csapatvacsorára —
            egyedi menüvel, amelyet előre együtt állítunk össze.
          </p>
          <ul className="zs-ticks" data-reveal style={d(220)}>
            <li>6–10 vendég, kizárólagos használat</li>
            <li>A séf személyesen vezeti fel a fogásokat</li>
            <li>Vacsora 160 000 Ft-tól + szerviz</li>
          </ul>
          <button
            type="button"
            className="zs-btn zs-btn--line"
            data-reveal
            style={d(280)}
            onClick={() =>
              notify(
                "Köszönjük! Ez egy design-bemutató — ajánlatkérés nem lett elküldve.",
              )
            }
          >
            Ajánlatot kérek
          </button>
        </div>
        <div className="zs-table-art" data-reveal style={d(120)}>
          <svg
            viewBox="40 46 340 208"
            role="img"
            aria-label="Hosszú asztal felülnézetből tíz terítékkel és gyertyákkal"
          >
            <defs>
              <Grad id="zs-t-w" at="0 0 1 1" s="#5a3a24 0,#3a2416 1" />
              <Grad id="zs-t-c" r s="#ffcf8a 0 .7,#ffcf8a 1 0" />
            </defs>
            {chairs}
            <rect
              x="60"
              y="88"
              width="300"
              height="124"
              rx="14"
              fill="url(#zs-t-w)"
            />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path
                key={i}
                d={`M70 ${104 + i * 18}h280`}
                stroke="#2e1c10"
                strokeWidth="1"
                opacity=".5"
              />
            ))}
            {Array.from({ length: 10 }, (_, i) => {
              const top = i < 5;
              const x = 104 + (i % 5) * 54;
              const y = top ? 112 : 188;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill="#1d1916"
                    stroke="#3a322c"
                  />
                  <circle cx={x} cy={y} r="8" fill="#26201c" />
                  <circle
                    cx={x + 20}
                    cy={top ? y - 6 : y + 6}
                    r="4"
                    fill="none"
                    stroke="#cfc2ae"
                    strokeWidth="1"
                    opacity=".6"
                  />
                </g>
              );
            })}
            {[130, 210, 290].map((x) => (
              <g key={x}>
                <circle
                  cx={x}
                  cy="150"
                  r="34"
                  fill="url(#zs-t-c)"
                  className="zs-flicker"
                />
                <circle cx={x} cy="150" r="5" fill="#efe6d6" />
                <circle cx={x} cy="150" r="2.4" fill="#ffb35c" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

const PRICES = {
  7: { menu: 42000, wine: 26000 },
  10: { menu: 58000, wine: 36000 },
} as const;
const SLOTS = ["18:00", "18:30", "20:30", "21:00"];
const DAYS = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];
const MONTHS = [
  "jan.",
  "febr.",
  "márc.",
  "ápr.",
  "máj.",
  "jún.",
  "júl.",
  "aug.",
  "szept.",
  "okt.",
  "nov.",
  "dec.",
];

function Booking({ notify }: { notify: (m: string) => void }) {
  const dates = useMemo(() => {
    const out: Date[] = [];
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    for (let i = 1; out.length < 12; i++) {
      const x = new Date(base);
      x.setDate(base.getDate() + i);
      if (x.getDay() !== 1 && x.getDay() !== 2) out.push(x);
    }
    return out;
  }, []);
  const [di, setDi] = useState(0);
  const [slot, setSlot] = useState("");
  const [guests, setGuests] = useState(2);
  const [menu, setMenu] = useState<7 | 10>(7);
  const [wine, setWine] = useState(true);
  const booked = (dIdx: number, s: number) =>
    (dates[dIdx].getDate() * 7 + s * 5) % 4 === 0;
  const per = PRICES[menu].menu + (wine ? PRICES[menu].wine : 0);
  const total = per * guests;
  const day = dates[di];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!slot) {
      notify("Kérjük, válasszon időpontot.");
      return;
    }
    notify(
      `Asztal ${guests} főre, ${MONTHS[day.getMonth()]} ${day.getDate()}. ${slot} — design-bemutató, foglalás nem történt.`,
    );
  };
  return (
    <section className="zs-book" id="foglalas">
      <div className="zs-ember zs-ember--book" aria-hidden />
      <div className="zs-wrap zs-book-grid">
        <div className="zs-book-copy">
          <p className="zs-kicker" data-reveal>
            Asztalfoglalás
          </p>
          <h2 className="zs-h2" data-reveal style={d(80)}>
            Foglaljon helyet <em>a tűz mellett.</em>
          </h2>
          <p className="zs-body" data-reveal style={d(160)}>
            Szerdától vasárnapig, két ültetéssel. A foglalásokat hat héttel
            előre nyitjuk meg, minden hónap első hétfőjén, 10 órakor.
          </p>
          <ul className="zs-ticks" data-reveal style={d(220)}>
            <li>72 óráig díjmentes lemondás</li>
            <li>Vegetáriánus menü kérésre</li>
            <li>A pult melletti helyek kérhetők</li>
          </ul>
        </div>
        <form
          className="zs-widget"
          onSubmit={submit}
          data-reveal
          style={d(120)}
          noValidate
        >
          <fieldset>
            <legend>Dátum</legend>
            <div className="zs-dates">
              {dates.map((x, i) => (
                <button
                  key={x.toDateString()}
                  type="button"
                  className={i === di ? "is-on" : ""}
                  aria-pressed={i === di}
                  onClick={() => {
                    setDi(i);
                    if (slot && booked(i, SLOTS.indexOf(slot))) setSlot("");
                  }}
                >
                  <span>{DAYS[x.getDay()]}</span>
                  <b>{x.getDate()}</b>
                  <span>{MONTHS[x.getMonth()]}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Időpont</legend>
            <div className="zs-slots">
              {SLOTS.map((s, i) => {
                const full = booked(di, i);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={full}
                    className={slot === s ? "is-on" : ""}
                    aria-pressed={slot === s}
                    onClick={() => setSlot(s)}
                  >
                    {s}
                    {full && <small>betelt</small>}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="zs-row2">
            <fieldset>
              <legend>Vendégek</legend>
              <div className="zs-stepper">
                <button
                  type="button"
                  aria-label="Kevesebb vendég"
                  disabled={guests <= 1}
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                >
                  −
                </button>
                <output aria-live="polite">
                  {guests} <small>fő</small>
                </output>
                <button
                  type="button"
                  aria-label="Több vendég"
                  disabled={guests >= 8}
                  onClick={() => setGuests((g) => Math.min(8, g + 1))}
                >
                  +
                </button>
              </div>
            </fieldset>
            <fieldset>
              <legend>Menü</legend>
              <div className="zs-seg">
                {([7, 10] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={menu === m ? "is-on" : ""}
                    aria-pressed={menu === m}
                    onClick={() => setMenu(m)}
                  >
                    {m} fogás
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <label className="zs-toggle">
            <input
              type="checkbox"
              checked={wine}
              onChange={(e) => setWine(e.target.checked)}
            />
            <span className="zs-switch" aria-hidden />
            <span>
              Borpárosítás <small>+{ft(PRICES[menu].wine)} / fő</small>
            </span>
          </label>
          <div className="zs-total">
            <div>
              <span>Összesen</span>
              <small>
                {ft(per)} × {guests} fő · szerviz nélkül
              </small>
            </div>
            <b aria-live="polite">{ft(total)}</b>
          </div>
          <button type="submit" className="zs-btn zs-btn--ember zs-btn--block">
            Foglalás{" "}
            {slot
              ? `· ${MONTHS[day.getMonth()]} ${day.getDate()}. ${slot}`
              : ""}
          </button>
        </form>
      </div>
    </section>
  );
}

function Voucher({ notify }: { notify: (m: string) => void }) {
  const opts = [
    ["Hét fogás két főre", 84000],
    ["Tíz fogás két főre, borral", 188000],
    ["Szabad összeg", 30000],
  ] as const;
  const [o, setO] = useState(0);
  const [name, setName] = useState("");
  const area = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  usePointerTilt(area, tilt, 10);
  return (
    <section className="zs-voucher" id="ajandek" ref={area}>
      <div className="zs-wrap zs-voucher-grid">
        <div className="zs-v-stage" data-reveal>
          <div className="zs-v-tilt" ref={tilt}>
            <div className="zs-v-card">
              <div className="zs-v-top">
                <Wordmark />
                <span>Ajándékutalvány</span>
              </div>
              <p className="zs-v-to">
                Kedves <em>{name.trim() || "Ünnepelt"}</em>,
              </p>
              <p className="zs-v-what">egy este a tűz mellett vár rád.</p>
              <div className="zs-v-bot">
                <span>{opts[o][0]}</span>
                <b>{ft(opts[o][1])}</b>
              </div>
              <span className="zs-v-seal" aria-hidden>
                <svg viewBox="0 0 20 26">
                  <path
                    d="M10 1c1 5 7 8 7 15a7 7 0 0 1-14 0c0-4 2-6 4-8 0 3 1 5 3 5-2-4-1-9 0-12z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="zs-v-sheen" aria-hidden />
            </div>
          </div>
        </div>
        <div>
          <p className="zs-kicker" data-reveal>
            Ajándékutalvány
          </p>
          <h2 className="zs-h2" data-reveal style={d(80)}>
            Ajándékozzon <em>egy estét.</em>
          </h2>
          <p className="zs-body" data-reveal style={d(140)}>
            Egy évig érvényes, bármelyik estére beváltható. Kézzel írt
            kísérőkártyával, pecsétviasszal küldjük — vagy azonnal, e-mailben.
          </p>
          <div
            className="zs-v-opts"
            role="radiogroup"
            aria-label="Utalvány értéke"
            data-reveal
            style={d(200)}
          >
            {opts.map(([label, v], i) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={o === i}
                className={o === i ? "is-on" : ""}
                onClick={() => setO(i)}
              >
                <span>{label}</span>
                <b>{ft(v)}</b>
              </button>
            ))}
          </div>
          <div className="zs-v-form" data-reveal style={d(260)}>
            <label className="sr-only" htmlFor="zs-v-name">
              A megajándékozott neve
            </label>
            <input
              id="zs-v-name"
              value={name}
              maxLength={22}
              onChange={(e) => setName(e.target.value)}
              placeholder="A megajándékozott neve"
            />
            <button
              type="button"
              className="zs-btn zs-btn--ember"
              onClick={() =>
                notify(
                  "Az utalvány elkészült — design-bemutató, fizetés nem történt.",
                )
              }
            >
              Megrendelem
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="zs-quotes">
      <div className="zs-wrap">
        <p className="zs-kicker zs-center" data-reveal>
          Vendégeink írták
        </p>
        <h2 className="zs-h2 zs-center" data-reveal style={d(80)}>
          Amit a tűz <em>után</em> mondanak.
        </h2>
        <div className="zs-quote-grid">
          {QUOTES.map(([q, who, where], i) => (
            <figure
              key={who}
              className="zs-qcard"
              data-reveal
              style={d(i * 120)}
            >
              <blockquote>{q}</blockquote>
              <figcaption>
                <b>{who}</b> · {where}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="zs-fine zs-center">
          A vélemények kitaláltak — a Zsarát egy design-bemutató.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="zs-faq" id="gyik">
      <div className="zs-wrap zs-faq-grid">
        <div>
          <p className="zs-kicker" data-reveal>
            Gyakori kérdések
          </p>
          <h2 className="zs-h2" data-reveal style={d(80)}>
            Mielőtt <em>leül.</em>
          </h2>
        </div>
        <div className="zs-acc">
          {FAQ.map(([q, a], n) => (
            <div
              key={q}
              className={`zs-acc-item ${open === n ? "is-open" : ""}`}
              data-reveal
              style={d(n * 60)}
            >
              <button
                type="button"
                aria-expanded={open === n}
                onClick={() => setOpen(open === n ? -1 : n)}
              >
                {q}
                <span aria-hidden />
              </button>
              <div className="zs-acc-body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="zs-final">
      <div className="zs-ember zs-ember--final" aria-hidden />
      <Sparks n={8} />
      <div className="zs-wrap zs-final-in">
        <p className="zs-kicker zs-center" data-reveal>
          Szerdától vasárnapig · 18:00-tól
        </p>
        <h2 className="zs-h1 zs-h1--mid" data-reveal style={d(80)}>
          Ma este is <em>ég a tűz.</em>
        </h2>
        <p className="zs-lead zs-center" data-reveal style={d(160)}>
          Tizennyolc szék, két ültetés. Ha üres helyet lát, ne várjon túl
          sokáig.
        </p>
        <div
          className="zs-cta-row zs-cta-row--center"
          data-reveal
          style={d(240)}
        >
          <a
            href="#foglalas"
            onClick={jump("foglalas")}
            className="zs-btn zs-btn--ember"
          >
            Asztalt foglalok <span aria-hidden>→</span>
          </a>
          <a
            href="#ajandek"
            onClick={jump("ajandek")}
            className="zs-btn zs-btn--ghost"
          >
            Utalványt adok
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="zs-footer">
      <div className="zs-wrap">
        <div className="zs-footer-grid">
          <div>
            <Wordmark big />
            <p className="zs-fine">
              Tűzön főzött kóstolómenü, Budapest szívében.
            </p>
          </div>
          <div>
            <h4>Cím</h4>
            <ul>
              <li>Budapest V.</li>
              <li>Parázs köz 7., pinceszint</li>
            </ul>
          </div>
          <div>
            <h4>Nyitvatartás</h4>
            <ul>
              <li>Szerda – vasárnap</li>
              <li>18:00 – 24:00</li>
              <li>Hétfő, kedd: a tűz pihen</li>
            </ul>
          </div>
          <div>
            <h4>Kapcsolat</h4>
            <ul>
              <li>asztal@zsarat.example</li>
              <li>+36 1 000 0000</li>
            </ul>
          </div>
        </div>
        <div className="zs-footer-base">
          <span>© {new Date().getFullYear()} Zsarát</span>
          <span>
            A Zsarát kitalált márka — David Mészáros landing page koncepciója.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Zsarat() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const [toast, notify] = useToast(3600);
  return (
    <div ref={root} className="zsarat">
      <Nav />
      <Hero />
      <Producers />
      <Philosophy />
      <Menu />
      <Fire />
      <Cellar />
      <PrivateRoom notify={notify} />
      <Booking notify={notify} />
      <Voucher notify={notify} />
      <Testimonials />
      <Faq />
      <FinalCta />
      <Footer />
      <div
        className={`zs-toast ${toast ? "is-on" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </div>
  );
}
