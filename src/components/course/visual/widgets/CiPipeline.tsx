import { useEffect, useRef, useState } from 'react';
import { Frame, Seg, tr } from './Frame';
import type { WidgetProps } from './Frame';

type J = 'checkout' | 'backend' | 'frontend' | 'image' | 'deploy';
type St = 'idle' | 'queued' | 'running' | 'passed' | 'failed' | 'skipped';
const JOBS: Array<{ id: J; name: string; needs: J[]; sec: number }> = [
  { id: 'checkout', name: 'checkout', needs: [], sec: 0.8 },
  { id: 'backend', name: 'backend: mvn verify', needs: ['checkout'], sec: 2.4 },
  { id: 'frontend', name: 'frontend: npm test', needs: ['checkout'], sec: 1.6 },
  { id: 'image', name: 'docker build & push', needs: ['backend', 'frontend'], sec: 1.6 },
  { id: 'deploy', name: 'deploy', needs: ['image'], sec: 1.2 },
];

export default function CiPipeline({ lang }: WidgetProps) {
  const t = tr(lang);
  const [branch, setBranch] = useState<'main' | 'feature/login'>('feature/login');
  const [broken, setBroken] = useState(false);
  const [st, setSt] = useState<Record<J, St>>({ checkout: 'idle', backend: 'idle', frontend: 'idle', image: 'idle', deploy: 'idle' });
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    const s: Record<J, St> = { checkout: 'queued', backend: 'queued', frontend: 'queued', image: 'queued', deploy: 'queued' };
    setSt({ ...s });
    const finish: Partial<Record<J, number>> = {};
    const result: Partial<Record<J, St>> = {};
    for (const j of JOBS) {
      const start = Math.max(0, ...j.needs.map((n) => finish[n]!));
      const upstreamFailed = j.needs.some((n) => result[n] !== 'passed');
      let r: St = 'passed';
      if (upstreamFailed) r = 'skipped';
      else if (j.id === 'backend' && broken) r = 'failed';
      else if (j.id === 'deploy' && branch !== 'main') r = 'skipped';
      result[j.id] = r;
      const dur = r === 'skipped' ? 0 : j.sec;
      finish[j.id] = start + dur;
      if (r !== 'skipped') timers.current.push(window.setTimeout(() => setSt((p) => ({ ...p, [j.id]: 'running' })), start * 1000));
      timers.current.push(window.setTimeout(() => setSt((p) => ({ ...p, [j.id]: r })), (start + dur) * 1000));
    }
  };

  const col: Record<St, string> = {
    idle: 'border-line text-dim',
    queued: 'border-line-strong text-muted',
    running: 'border-accent text-accent animate-pulse',
    passed: 'border-[#30a46c] text-[#30a46c]',
    failed: 'border-[#e5484d] text-[#e5484d] bg-[#e5484d]/10',
    skipped: 'border-dashed border-line-strong text-dim',
  };
  const icon: Record<St, string> = { idle: '○', queued: '◌', running: '◐', passed: '✓', failed: '✕', skipped: '⤼' };
  const job = (id: J) => {
    const j = JOBS.find((x) => x.id === id)!;
    return (
      <div className={'flex items-center gap-2 border px-3 py-2 font-mono text-[13.5px] transition-colors ' + col[st[id]]}>
        <span>{icon[st[id]]}</span>
        <span className="truncate">{j.name}</span>
      </div>
    );
  };
  const done = Object.values(st).every((s) => s === 'passed' || s === 'failed' || s === 'skipped');
  return (
    <Frame lang={lang} title={t('A CI/CD pipeline run', 'Egy CI/CD pipeline futása', 'Beh CI/CD pipeline')} hint={t('Jobs run in parallel when they can; a failing job stops everything that needs it.', 'A jobok párhuzamosan futnak, ha lehet; egy hibás job leállít mindent, ami tőle függ.', 'Joby bežia paralelne, keď sa dá; job, ktorý zlyhá, zastaví všetko, čo od neho závisí.')}>
      <div className="flex flex-wrap items-center gap-2">
        <Seg label="branch" options={['feature/login', 'main'] as const} value={branch} onChange={setBranch} />
        <label className="flex items-center gap-2 text-[14.5px] text-muted">
          <input type="checkbox" checked={broken} onChange={(e) => setBroken(e.target.checked)} className="accent-[rgb(var(--c-accent))]" />
          {t('break a backend test', 'egy backend teszt eltörése', 'rozbiť backendový test')}
        </label>
        <button type="button" className="vw-btn on ml-auto" onClick={run}>
          ▶ git push
        </button>
      </div>
      <div className="mt-5 grid items-center gap-2 sm:grid-cols-[1fr_auto_1.3fr_auto_1fr_auto_0.8fr]">
        {job('checkout')}
        <span className="hidden text-dim sm:block">→</span>
        <div className="grid gap-2">
          {job('backend')}
          {job('frontend')}
        </div>
        <span className="hidden text-dim sm:block">→</span>
        {job('image')}
        <span className="hidden text-dim sm:block">→</span>
        {job('deploy')}
      </div>
      <p className="mt-4 min-h-[2.5rem] text-[15px] leading-relaxed text-muted">
        {!done
          ? t('backend and frontend only need checkout, so they run at the same time.', 'A backend és a frontend csak a checkouttól függ, ezért egyszerre futnak.', 'backend a frontend potrebujú len checkout, takže bežia súčasne.')
          : st.backend === 'failed'
            ? t('The red check blocks the pull request: no image is built and nothing is deployed.', 'A piros jelzés blokkolja a pull requestet: nem épül image, és semmi sem kerül élesbe.', 'Červený check zablokuje pull request: nezbuilduje sa žiadny image a nič sa nenasadí.')
            : st.deploy === 'passed'
              ? t('Green on main: the new image is deployed automatically.', 'Zöld a mainen: az új image automatikusan élesbe kerül.', 'Zelená na main: nový image sa automaticky nasadí.')
              : t('Green on a feature branch: safe to merge. Deploy only runs on main.', 'Zöld egy feature ágon: nyugodtan merge-elhető. A deploy csak a mainen fut.', 'Zelená na feature vetve: môžeš pokojne mergnúť. Deploy beží len na main.')}
      </p>
    </Frame>
  );
}
