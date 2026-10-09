import { useState } from 'react';
import { Frame, tr } from './Frame';
import type { WidgetProps } from './Frame';

const LAYERS = [
  { id: 'e2e', en: 'End-to-end', hu: 'End-to-end', sk: 'End-to-end', sec: 12, flaky: 0.02, tool: 'Playwright', confEn: 'The whole app works for a real user', confHu: 'Az egész app működik egy valódi felhasználónak', confSk: 'Celá aplikácia funguje pre skutočného používateľa' },
  { id: 'int', en: 'Integration', hu: 'Integrációs', sk: 'Integračné', sec: 1.5, flaky: 0.003, tool: '@SpringBootTest + Testcontainers', confEn: 'Parts work together (DB, HTTP, config)', confHu: 'A részek együtt működnek (DB, HTTP, konfiguráció)', confSk: 'Časti fungujú spolu (DB, HTTP, konfigurácia)' },
  { id: 'unit', en: 'Unit', hu: 'Unit', sk: 'Unit', sec: 0.01, flaky: 0.0001, tool: 'JUnit 5 · Vitest', confEn: 'One function or class is correct', confHu: 'Egy függvény vagy osztály helyes', confSk: 'Jedna funkcia alebo trieda je správna' },
] as const;

export default function TestPyramid({ lang }: WidgetProps) {
  const t = tr(lang);
  const [n, setN] = useState<Record<string, number>>({ e2e: 10, int: 60, unit: 400 });
  const [sel, setSel] = useState<string>('unit');
  const secs = LAYERS.reduce((s, l) => s + n[l.id] * l.sec, 0);
  const pFlaky = 1 - LAYERS.reduce((p, l) => p * Math.pow(1 - l.flaky, n[l.id]), 1);
  const max = Math.max(...Object.values(n));
  const shape = n.unit >= n.int && n.int >= n.e2e ? t('a healthy pyramid', 'egészséges piramis', 'zdravá pyramída') : n.e2e > n.unit ? t('an ice-cream cone (slow and flaky)', 'fagyitölcsér (lassú és instabil)', 'kornútok zmrzliny (pomalý a nestabilný)') : t('a lopsided shape', 'egyenetlen forma', 'nevyvážený tvar');
  const fmt = (s: number) => (s < 60 ? `${s.toFixed(0)} s` : `${(s / 60).toFixed(1)} min`);
  const l = LAYERS.find((x) => x.id === sel)!;
  return (
    <Frame lang={lang} title={t('Balance your test suite', 'Egyensúlyozd ki a tesztkészletet', 'Vyváž svoju sadu testov')} hint={t('Change how many tests you have at each level and watch speed and flakiness.', 'Állítsd be, hány teszted van szintenként, és figyeld a sebességet és az instabilitást.', 'Nastav, koľko testov máš na každej úrovni, a sleduj rýchlosť a nestabilitu.')}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-1.5">
          {LAYERS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setSel(x.id)}
              className={'mx-auto flex items-center justify-between gap-2 border px-3 py-2.5 text-left transition-all duration-300 ' + (sel === x.id ? 'border-accent bg-accent/15' : 'border-line-strong bg-bg hover:border-accent')}
              style={{ width: `${Math.max(34, (n[x.id] / max) * 100)}%` }}
            >
              <span className="text-[15px] font-semibold text-text">{x[lang]}</span>
              <span className="font-mono text-[13.5px] text-accent">{n[x.id]}</span>
            </button>
          ))}
        </div>
        <div className="grid content-start gap-3">
          {LAYERS.map((x) => (
            <label key={x.id} className="grid gap-1">
              <span className="label">{x[lang]}: {n[x.id]} · ~{x.sec < 1 ? `${x.sec * 1000} ms` : `${x.sec} s`} {t('each', 'darabja', 'na test')}</span>
              <input className="vw-range" type="range" min={0} max={x.id === 'unit' ? 800 : x.id === 'int' ? 300 : 200} value={n[x.id]} onChange={(e) => setN({ ...n, [x.id]: Number(e.target.value) })} aria-label={x.en} />
            </label>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="border border-line px-3 py-2">
          <div className="font-mono text-[17.5px] font-semibold text-text">{fmt(secs)}</div>
          <div className="label">{t('suite runtime', 'futásidő', 'čas behu sady')}</div>
        </div>
        <div className="border border-line px-3 py-2">
          <div className={'font-mono text-[17.5px] font-semibold ' + (pFlaky > 0.3 ? 'text-[#e5484d]' : 'text-text')}>{(pFlaky * 100).toFixed(0)}%</div>
          <div className="label">{t('chance of a flaky run', 'instabil futás esélye', 'šanca na nestabilný beh')}</div>
        </div>
        <div className="col-span-2 border border-line px-3 py-2 sm:col-span-1">
          <div className="text-[15.5px] font-semibold text-text">{shape}</div>
          <div className="label">{t('shape', 'forma', 'tvar')}</div>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        <span className="font-semibold text-text">{l[lang]}</span> · {l.tool} — {{ en: l.confEn, hu: l.confHu, sk: l.confSk }[lang]}.
      </p>
    </Frame>
  );
}
