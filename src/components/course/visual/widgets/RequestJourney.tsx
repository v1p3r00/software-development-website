import { useState } from 'react';
import { Frame, Stepper, tr } from './Frame';
import type { WidgetProps } from './Frame';
import { useAutoplay } from './useAutoplay';

const ACTORS = [
  { id: 'browser', en: 'Browser', hu: 'Böngésző', sk: 'Prehliadač', x: 70 },
  { id: 'dns', en: 'DNS resolver', hu: 'DNS-feloldó', sk: 'DNS resolver', x: 250 },
  { id: 'cdn', en: 'CDN / static files', hu: 'CDN / statikus fájlok', sk: 'CDN / statické súbory', x: 430 },
  { id: 'server', en: 'App server', hu: 'Alkalmazásszerver', sk: 'Aplikačný server', x: 610 },
] as const;
type A = (typeof ACTORS)[number]['id'];

const STEPS: Array<{ from: A; to: A; ms: number; en: [string, string]; hu: [string, string]; sk: [string, string] }> = [
  { from: 'browser', to: 'browser', ms: 0, en: ['You type shop.example.com', 'The browser parses the URL: scheme https, host shop.example.com, path /.'], hu: ['Beírod: shop.example.com', 'A böngésző szétszedi az URL-t: séma https, host shop.example.com, útvonal /.'], sk: ['Zadáš shop.example.com', 'Prehliadač rozloží URL: schéma https, host shop.example.com, cesta /.'] },
  { from: 'browser', to: 'dns', ms: 20, en: ['DNS lookup', '“What is the IP address of shop.example.com?” Cached answers make this almost instant.'], hu: ['DNS-lekérdezés', '„Mi a shop.example.com IP-címe?” Gyorsítótárból ez szinte azonnali.'], sk: ['DNS lookup', '„Aká je IP adresa shop.example.com?“ Vďaka odpovediam z cache je to takmer okamžité.'] },
  { from: 'dns', to: 'browser', ms: 15, en: ['IP address returned', 'The resolver answers with an IP address, e.g. 93.184.216.34.'], hu: ['Megjön az IP-cím', 'A feloldó egy IP-címmel válaszol, pl. 93.184.216.34.'], sk: ['Prišla IP adresa', 'Resolver odpovie IP adresou, napr. 93.184.216.34.'] },
  { from: 'browser', to: 'server', ms: 60, en: ['TCP + TLS handshake', 'A connection is opened and encrypted (HTTPS) before any data is sent.'], hu: ['TCP + TLS kézfogás', 'Létrejön és titkosított lesz a kapcsolat (HTTPS), mielőtt bármi adat menne.'], sk: ['TCP + TLS handshake', 'Spojenie sa otvorí a zašifruje (HTTPS) ešte predtým, než sa pošlú akékoľvek dáta.'] },
  { from: 'browser', to: 'server', ms: 10, en: ['GET / HTTP request', 'Method, path and headers (cookies, accepted languages) travel to the server.'], hu: ['GET / HTTP-kérés', 'A metódus, az útvonal és a fejlécek (sütik, nyelvek) eljutnak a szerverhez.'], sk: ['HTTP požiadavka GET /', 'Metóda, cesta a hlavičky (cookies, akceptované jazyky) putujú na server.'] },
  { from: 'server', to: 'server', ms: 80, en: ['Server builds the response', 'Routing, business logic, maybe a database query — then an HTML document.'], hu: ['A szerver összeállítja a választ', 'Útválasztás, üzleti logika, esetleg adatbázis-lekérdezés — majd egy HTML-dokumentum.'], sk: ['Server zostaví odpoveď', 'Routing, biznis logika, možno dopyt do databázy – a potom HTML dokument.'] },
  { from: 'server', to: 'browser', ms: 40, en: ['200 OK + HTML', 'Status code, headers (Content-Type: text/html) and the HTML body come back.'], hu: ['200 OK + HTML', 'Visszajön az állapotkód, a fejlécek (Content-Type: text/html) és a HTML-törzs.'], sk: ['200 OK + HTML', 'Vráti sa stavový kód, hlavičky (Content-Type: text/html) a telo HTML.'] },
  { from: 'browser', to: 'cdn', ms: 90, en: ['CSS, JS and images', 'Parsing the HTML reveals more files; the browser fetches them in parallel, often from a CDN.'], hu: ['CSS, JS és képek', 'A HTML feldolgozása közben újabb fájlok derülnek ki; a böngésző párhuzamosan tölti le őket, gyakran CDN-ről.'], sk: ['CSS, JS a obrázky', 'Pri spracovaní HTML sa objavia ďalšie súbory; prehliadač ich sťahuje paralelne, často z CDN.'] },
  { from: 'browser', to: 'browser', ms: 50, en: ['Render', 'DOM + CSSOM → layout → paint. JavaScript runs and makes the page interactive.'], hu: ['Megjelenítés', 'DOM + CSSOM → elrendezés → festés. Lefut a JavaScript, és interaktív lesz az oldal.'], sk: ['Vykreslenie', 'DOM + CSSOM → layout → paint. Spustí sa JavaScript a stránka sa stane interaktívnou.'] },
];

export default function RequestJourney({ lang }: WidgetProps) {
  const t = tr(lang);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  useAutoplay(playing, i, STEPS.length, setI, setPlaying, 1700);
  const s = STEPS[i];
  const ax = (id: A) => ACTORS.find((a) => a.id === id)!.x;
  const total = STEPS.slice(0, i + 1).reduce((a, b) => a + b.ms, 0);
  const moving = s.from !== s.to;
  return (
    <Frame lang={lang} title={t('The journey of a page load', 'Egy oldalbetöltés útja', 'Cesta načítania stránky')} hint={t('Step through what happens between pressing Enter and seeing the page.', 'Lépésenként: mi történik az Enter lenyomása és az oldal megjelenése között.', 'Prejdi krok za krokom, čo sa deje medzi stlačením Enteru a zobrazením stránky.')}>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 680 150" className="dg block w-full min-w-[520px]" role="img" aria-label={s[lang][0]}>
          {ACTORS.map((a) => {
            const active = a.id === s.from || a.id === s.to;
            return (
              <g key={a.id}>
                <line x1={a.x} x2={a.x} y1={52} y2={140} className="dg-life" />
                <rect x={a.x - 62} y={10} width={124} height={40} rx={3} className={'dg-box' + (active ? ' hl' : '')} />
                <text x={a.x} y={31} textAnchor="middle" dominantBaseline="middle" className={'dg-label' + (active ? ' hl' : '')} style={{ fontSize: 13.5 }}>
                  {a[lang]}
                </text>
              </g>
            );
          })}
          {moving && (
            <line x1={ax(s.from)} x2={ax(s.to)} y1={96} y2={96} className="dg-edge hl" strokeDasharray="4 4" />
          )}
          <circle
            key={i}
            r={7}
            cy={96}
            cx={ax(s.to)}
            className="fill-accent"
            style={{ animation: moving ? 'vw-travel 0.9s cubic-bezier(.16,1,.3,1)' : undefined, ['--from' as string]: `${ax(s.from) - ax(s.to)}px` }}
          />
          {!moving && <circle cx={ax(s.to)} cy={96} r={14} className="fill-none stroke-accent" style={{ animation: 'vw-pulse 1.2s ease-out infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />}
        </svg>
      </div>
      <div className="mt-4 grid gap-1 border-l-2 border-accent pl-4">
        <div className="font-mono text-2xs uppercase tracking-tech text-accent">
          {t('Step', 'Lépés', 'Krok')} {i + 1} · ≈ {total} ms {t('so far', 'eddig', 'zatiaľ')}
        </div>
        <div className="text-[17.5px] font-semibold text-text">{s[lang][0]}</div>
        <p className="text-[15.5px] leading-relaxed text-muted">{s[lang][1]}</p>
      </div>
      <div className="mt-5">
        <Stepper lang={lang} i={i} n={STEPS.length} setI={setI} playing={playing} setPlaying={setPlaying} />
      </div>
    </Frame>
  );
}
