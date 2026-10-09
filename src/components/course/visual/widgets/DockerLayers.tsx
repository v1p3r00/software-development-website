import { useState } from 'react';
import { Frame, Seg, tr } from './Frame';
import type { WidgetProps } from './Frame';

type Order = 'naive' | 'smart';
type Change = 'none' | 'src' | 'pom';
interface Line {
  cmd: string;
  dep: 'base' | 'all' | 'pom' | 'src' | 'none';
  sec: number;
}
const FILES: Record<Order, Line[]> = {
  naive: [
    { cmd: 'FROM eclipse-temurin:21-jdk AS build', dep: 'base', sec: 0 },
    { cmd: 'WORKDIR /app', dep: 'none', sec: 0.1 },
    { cmd: 'COPY . .', dep: 'all', sec: 0.4 },
    { cmd: 'RUN ./mvnw dependency:go-offline', dep: 'none', sec: 95 },
    { cmd: 'RUN ./mvnw -q package -DskipTests', dep: 'none', sec: 28 },
  ],
  smart: [
    { cmd: 'FROM eclipse-temurin:21-jdk AS build', dep: 'base', sec: 0 },
    { cmd: 'WORKDIR /app', dep: 'none', sec: 0.1 },
    { cmd: 'COPY pom.xml mvnw .mvn/ ./', dep: 'pom', sec: 0.1 },
    { cmd: 'RUN ./mvnw dependency:go-offline', dep: 'none', sec: 95 },
    { cmd: 'COPY src ./src', dep: 'src', sec: 0.2 },
    { cmd: 'RUN ./mvnw -q package -DskipTests', dep: 'none', sec: 28 },
  ],
};

export default function DockerLayers({ lang }: WidgetProps) {
  const t = tr(lang);
  const [order, setOrder] = useState<Order>('naive');
  const [change, setChange] = useState<Change>('src');
  const [first, setFirst] = useState(false);
  const lines = FILES[order];
  // a layer rebuilds if its own input changed or any layer above it rebuilt
  let broken = first;
  const states = lines.map((l) => {
    if (!broken && (l.dep === 'all' ? change !== 'none' : l.dep === change)) broken = true;
    return broken;
  });
  const total = lines.reduce((s, l, i) => s + (states[i] ? l.sec : 0), 0);
  return (
    <Frame lang={lang} title={t('Docker layer cache', 'Docker rétegek gyorsítótára', 'Cache Docker vrstiev')} hint={t('Each instruction is a layer. Change a file and see which layers must rebuild.', 'Minden utasítás egy réteg. Módosíts egy fájlt, és nézd meg, melyik rétegeket kell újraépíteni.', 'Každá inštrukcia je vrstva. Zmeň súbor a pozri sa, ktoré vrstvy sa musia prebuildovať.')}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Seg label="order" value={order} onChange={setOrder} options={[{ v: 'naive', l: t('COPY everything first', 'Először minden COPY', 'Najprv COPY všetkého') }, { v: 'smart', l: t('Dependencies first', 'Függőségek előbb', 'Najprv závislosti') }]} />
        <Seg
          label="change"
          value={first ? ('first' as Change) : change}
          onChange={(c) => {
            if ((c as string) === 'first') setFirst(true);
            else {
              setFirst(false);
              setChange(c);
            }
          }}
          options={[
            { v: 'first' as Change, l: t('first build', 'első build', 'prvý build') },
            { v: 'src', l: t('edit a .java file', '.java fájl módosul', 'úprava súboru .java') },
            { v: 'pom', l: t('add a dependency', 'új függőség', 'pridanie závislosti') },
            { v: 'none', l: t('no change', 'nincs változás', 'bez zmeny') },
          ]}
        />
      </div>
      <ol className="mt-4 grid gap-1">
        {lines.map((l, i) => (
          <li key={order + i} className={'flex items-center gap-3 border px-3 py-2 font-mono text-[13.5px] transition-colors ' + (states[i] ? 'border-accent/70 bg-accent/10' : 'border-line bg-bg')}>
            <span className="w-5 text-right text-dim">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-text">{l.cmd}</span>
            <span className={'shrink-0 ' + (states[i] ? 'text-accent' : 'text-[#30a46c]')}>{states[i] ? `${t('REBUILD', 'ÚJRAÉPÍT', 'REBUILD')} ${l.sec >= 1 ? l.sec + 's' : ''}` : 'CACHED'}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <span className="font-mono text-[15.5px] text-text">
          {t('build time', 'build idő', 'čas buildu')}: <span className="text-accent">≈ {Math.round(total)} s</span>
        </span>
        <span className="text-[15px] text-muted">
          {order === 'naive' && change === 'src' && !first
            ? t('One edited source file invalidated COPY . . and every layer after it — dependencies download again.', 'Egyetlen módosított forrásfájl érvényteleníti a COPY . . réteget és minden utána következőt — újra letöltődnek a függőségek.', 'Jediný upravený zdrojový súbor zneplatnil COPY . . a každú vrstvu za ním – závislosti sa sťahujú znova.')
            : order === 'smart' && change === 'src' && !first
              ? t('Only the source layers rebuild; the slow dependency layer comes from cache.', 'Csak a forrás rétegek épülnek újra; a lassú függőségi réteg a gyorsítótárból jön.', 'Prebuildujú sa len vrstvy so zdrojákmi; pomalá vrstva so závislosťami ide z cache.')
              : t('Order instructions from least to most frequently changing.', 'Az utasításokat a legritkábban változótól a leggyakrabban változóig rendezd.', 'Zoraď inštrukcie od tých, čo sa menia najmenej, po tie, čo sa menia najčastejšie.')}
        </span>
      </div>
    </Frame>
  );
}
