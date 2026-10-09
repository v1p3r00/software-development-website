import { useState } from 'react';
import { Frame, Stepper, tr } from './Frame';
import type { WidgetProps } from './Frame';
import { useAutoplay } from './useAutoplay';

const CODE = [
  "console.log('A');",
  "setTimeout(() => console.log('B'), 0);",
  "Promise.resolve().then(() => console.log('C'));",
  "fetch('/api/user').then(() => console.log('D'));",
  "console.log('E');",
];

interface S {
  line: number;
  stack: string[];
  apis: string[];
  micro: string[];
  macro: string[];
  out: string[];
  en: string;
  hu: string;
  sk: string;
}
const STEPS: S[] = [
  { line: 0, stack: ['main()', "console.log('A')"], apis: [], micro: [], macro: [], out: ['A'], en: 'Synchronous code runs top to bottom on the call stack. A is printed immediately.', hu: 'A szinkron kód fentről lefelé fut a hívási vermen. Az A azonnal kiíródik.', sk: 'Synchrónny kód beží zhora nadol na zásobníku volaní. A sa vypíše okamžite.' },
  { line: 1, stack: ['main()', 'setTimeout(…)'], apis: ['timer 0 ms → B'], micro: [], macro: [], out: ['A'], en: 'setTimeout hands the callback to the browser’s timer and returns at once — it does not wait.', hu: 'A setTimeout átadja a callbacket a böngésző időzítőjének, és azonnal visszatér — nem vár.', sk: 'setTimeout odovzdá callback časovaču prehliadača a hneď sa vráti – nečaká.' },
  { line: 1, stack: ['main()'], apis: [], micro: [], macro: ['() => log B'], out: ['A'], en: 'The 0 ms timer fires, so its callback moves to the task (macrotask) queue. It still has to wait for the stack to be empty.', hu: 'A 0 ms-os időzítő lejár, a callback a feladat- (macrotask) sorba kerül. Még meg kell várnia, hogy kiürüljön a verem.', sk: 'Časovač s 0 ms vyprší, takže jeho callback sa presunie do fronty úloh (macrotask). Stále musí počkať, kým sa zásobník vyprázdni.' },
  { line: 2, stack: ['main()', 'Promise.then(…)'], apis: [], micro: ['() => log C'], macro: ['() => log B'], out: ['A'], en: 'A resolved promise queues its .then callback in the microtask queue.', hu: 'Egy teljesült promise a .then callbackjét a mikrofeladat-sorba teszi.', sk: 'Splnený promise zaradí svoj .then callback do fronty mikroúloh.' },
  { line: 3, stack: ['main()', 'fetch(…)'], apis: ['HTTP GET /api/user → D'], micro: ['() => log C'], macro: ['() => log B'], out: ['A'], en: 'fetch starts a network request in the background. Its .then runs only when the response arrives.', hu: 'A fetch a háttérben indít egy hálózati kérést. A .then csak akkor fut, ha megjön a válasz.', sk: 'fetch spustí sieťovú požiadavku na pozadí. Jeho .then sa spustí až po príchode odpovede.' },
  { line: 4, stack: ['main()', "console.log('E')"], apis: ['HTTP GET /api/user → D'], micro: ['() => log C'], macro: ['() => log B'], out: ['A', 'E'], en: 'E prints before B and C: all synchronous code finishes first.', hu: 'Az E a B és a C előtt íródik ki: előbb lefut minden szinkron kód.', sk: 'E sa vypíše pred B aj C: najprv dobehne všetok synchrónny kód.' },
  { line: -1, stack: [], apis: ['HTTP GET /api/user → D'], micro: ['() => log C'], macro: ['() => log B'], out: ['A', 'E'], en: 'The stack is empty. The event loop now drains ALL microtasks before taking the next task.', hu: 'Üres a verem. Az eseményhurok most kiüríti az ÖSSZES mikrofeladatot, mielőtt a következő feladatot venné.', sk: 'Zásobník je prázdny. Event loop teraz spracuje VŠETKY mikroúlohy, až potom vezme ďalšiu úlohu.' },
  { line: -1, stack: ['() => log C'], apis: ['HTTP GET /api/user → D'], micro: [], macro: ['() => log B'], out: ['A', 'E', 'C'], en: 'C runs: microtasks (promises) always beat timers.', hu: 'Lefut a C: a mikrofeladatok (promise-ok) mindig megelőzik az időzítőket.', sk: 'Spustí sa C: mikroúlohy (promises) majú vždy prednosť pred časovačmi.' },
  { line: -1, stack: ['() => log B'], apis: ['HTTP GET /api/user → D'], micro: [], macro: [], out: ['A', 'E', 'C', 'B'], en: 'Now the first task runs: B, even though its delay was 0 ms.', hu: 'Most fut az első feladat: B — pedig 0 ms volt a késleltetése.', sk: 'Teraz beží prvá úloha: B, hoci jej oneskorenie bolo 0 ms.' },
  { line: -1, stack: [], apis: [], micro: ['() => log D'], macro: [], out: ['A', 'E', 'C', 'B'], en: 'Some milliseconds later the response arrives; the fetch promise resolves and queues D as a microtask.', hu: 'Néhány milliszekundum múlva megjön a válasz; a fetch promise teljesül, és a D mikrofeladatként sorba áll.', sk: 'O pár milisekúnd príde odpoveď; promise z fetch sa splní a zaradí D ako mikroúlohu.' },
  { line: -1, stack: ['() => log D'], apis: [], micro: [], macro: [], out: ['A', 'E', 'C', 'B', 'D'], en: 'D runs last. Final output: A E C B D.', hu: 'A D fut utoljára. A végső kimenet: A E C B D.', sk: 'D beží posledné. Výsledný výstup: A E C B D.' },
];

function Box({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <div className="min-w-0 border border-line bg-bg">
      <div className="label border-b border-line px-2.5 py-1.5">{title}</div>
      <div className="flex min-h-[4.5rem] flex-col-reverse gap-1 p-2">
        {items.map((x, i) => (
          <div key={x + i} className={'truncate border px-2 py-1 font-mono text-[13px] ' + (accent && i === items.length - 1 ? 'border-accent bg-accent/15 text-accent' : 'border-line-strong text-text')}>
            {x}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EventLoop({ lang }: WidgetProps) {
  const t = tr(lang);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  useAutoplay(playing, i, STEPS.length, setI, setPlaying, 2200);
  const s = STEPS[i];
  return (
    <Frame lang={lang} title={t('The event loop, step by step', 'Az eseményhurok lépésről lépésre', 'Event loop krok za krokom')} hint={t('Predict the output order before you press Next.', 'Mielőtt a Tovább gombra kattintasz, tippeld meg a kiírás sorrendjét.', 'Skôr než stlačíš Ďalej, tipni si poradie výstupu.')}>
      <pre className="vw-code !whitespace-pre">
        {CODE.map((l, k) => (
          <div key={k} className={k === s.line ? '-mx-3.5 bg-accent/15 px-3.5 text-accent' : ''}>
            {l}
          </div>
        ))}
      </pre>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Box title={t('Call stack', 'Hívási verem', 'Zásobník volaní')} items={s.stack} accent />
        <Box title="Web APIs" items={s.apis} />
        <Box title={t('Microtasks', 'Mikrofeladatok', 'Mikroúlohy')} items={s.micro} />
        <Box title={t('Task queue', 'Feladatsor', 'Fronta úloh')} items={s.macro} />
      </div>
      <div className="mt-3 flex items-center gap-2 border border-line bg-bg px-3 py-2 font-mono text-[14.5px]">
        <span className="label">console</span>
        <span className="text-text">{s.out.join('  ')}</span>
      </div>
      <p className="mt-3 min-h-[3rem] text-[15.5px] leading-relaxed text-muted">{s[lang]}</p>
      <div className="mt-2">
        <Stepper lang={lang} i={i} n={STEPS.length} setI={setI} playing={playing} setPlaying={setPlaying} />
      </div>
    </Frame>
  );
}
