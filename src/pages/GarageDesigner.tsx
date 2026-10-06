import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useTheme } from '../hooks/useTheme';
import { Section, SectionHeader } from '../components/ui';
import { ConsultCta, Group, Segmented, Slider, Swatches, Toggle, huf } from '../components/tools/kit';
import { buildGarage, buildGround, disposeGroup } from '../components/tools/garageScene';
import type { Cladding, Door, GarageOpts, Roof } from '../components/tools/garageScene';
import { createStage, download } from '../components/tools/stage';
import type { Stage } from '../components/tools/stage';

type View = 'front' | 'side' | 'top';

const WALLS = [
  { id: '#ebe8e2', en: 'White', hu: 'Fehér' },
  { id: '#d9cbb0', en: 'Sand', hu: 'Homok' },
  { id: '#9ea3a6', en: 'Grey', hu: 'Szürke' },
  { id: '#41464b', en: 'Anthracite', hu: 'Antracit' },
  { id: '#7a5539', en: 'Walnut', hu: 'Dió' },
  { id: '#5f6e58', en: 'Moss', hu: 'Moha' },
];
const TRIMS = [
  { id: '#34383c', en: 'Anthracite', hu: 'Antracit' },
  { id: '#f2f2f0', en: 'White', hu: 'Fehér' },
  { id: '#a8acb0', en: 'Silver', hu: 'Ezüst' },
  { id: '#5b3d2a', en: 'Brown', hu: 'Barna' },
  { id: '#7d2f2a', en: 'Oxide red', hu: 'Oxidvörös' },
];

const T = {
  en: {
    subtitle: 'Garage designer — demo prices',
    intro: 'Size the garage, then choose the roof, the door, the cladding and the colours — the 3D model and the estimate follow every change.',
    size: 'Size',
    width: 'Width',
    depth: 'Depth',
    height: 'Wall height',
    roof: 'Roof',
    roofs: { flat: 'Flat', mono: 'Mono-pitch', gable: 'Gable' },
    door: 'Garage door',
    doors: { sectional: 'Sectional', tilt: 'Up & over', swing: 'Swing' },
    doorCount: 'Number of doors',
    one: '1 door',
    two: '2 doors',
    cladding: 'Cladding',
    cladd: { sheet: 'Steel sheet', wood: 'Wood look', render: 'Render' },
    wall: 'Wall colour',
    trim: 'Roof & door colour',
    extras: 'Extras',
    sideDoor: 'Side door',
    window: 'Window',
    gutter: 'Gutter & downpipe',
    estimate: 'Estimate',
    demo: 'Demo prices, gross, without foundation work.',
    total: 'Total',
    items: {
      base: 'Garage structure',
      roof: 'Roof upgrade',
      doors: 'Garage door',
      side: 'Side door',
      window: 'Window',
      gutter: 'Gutter',
      clad: 'Wood-look cladding',
    },
    drag: 'Drag to rotate · scroll or pinch to zoom',
    save: 'Save image',
    loading: 'Loading the 3D view…',
    noGl: 'This browser could not start the 3D view.',
    views: { front: 'Front', side: 'Side', top: 'From above' },
  },
  hu: {
    subtitle: 'Garázstervező — bemutató árak',
    intro: 'Add meg a garázs méretét, majd válassz tetőt, kaput, burkolatot és színeket — a 3D modell és az árbecslés minden változtatást követ.',
    size: 'Méret',
    width: 'Szélesség',
    depth: 'Mélység',
    height: 'Falmagasság',
    roof: 'Tető',
    roofs: { flat: 'Lapos', mono: 'Félnyereg', gable: 'Nyereg' },
    door: 'Garázskapu',
    doors: { sectional: 'Szekcionált', tilt: 'Billenő', swing: 'Nyíló' },
    doorCount: 'Kapuk száma',
    one: '1 kapu',
    two: '2 kapu',
    cladding: 'Burkolat',
    cladd: { sheet: 'Trapézlemez', wood: 'Fahatású', render: 'Vakolt' },
    wall: 'Falszín',
    trim: 'Tető- és kapuszín',
    extras: 'Extrák',
    sideDoor: 'Oldalajtó',
    window: 'Ablak',
    gutter: 'Ereszcsatorna',
    estimate: 'Árbecslés',
    demo: 'Bemutató árak, bruttó, alapozás nélkül.',
    total: 'Összesen',
    items: {
      base: 'Garázs szerkezet',
      roof: 'Tető felár',
      doors: 'Garázskapu',
      side: 'Oldalajtó',
      window: 'Ablak',
      gutter: 'Ereszcsatorna',
      clad: 'Fahatású burkolat',
    },
    drag: 'Húzd a forgatáshoz · görgess vagy csippents a nagyításhoz',
    save: 'Kép mentése',
    loading: '3D nézet betöltése…',
    noGl: 'Ez a böngésző nem tudta elindítani a 3D nézetet.',
    views: { front: 'Elöl', side: 'Oldal', top: 'Felülről' },
  },
};

const m = (n: number) => `${n.toFixed(1).replace('.', ',')} m`;

/** the demo price list */
function estimate(g: GarageOpts, t: (typeof T)['en']) {
  const lines: { label: string; value: number }[] = [];
  const area = g.width * g.depth;
  const base = 450_000 + area * 95_000;
  lines.push({ label: `${t.items.base} · ${area.toFixed(1).replace('.', ',')} m²`, value: base });
  if (g.roof !== 'flat') lines.push({ label: t.items.roof, value: base * (g.roof === 'gable' ? 0.12 : 0.06) });
  const doorPrice = { sectional: 380_000, tilt: 190_000, swing: 160_000 }[g.door];
  lines.push({ label: `${t.items.doors} × ${g.doors}`, value: doorPrice * g.doors });
  if (g.cladding === 'wood') lines.push({ label: t.items.clad, value: base * 0.1 });
  if (g.sideDoor) lines.push({ label: t.items.side, value: 120_000 });
  if (g.window) lines.push({ label: t.items.window, value: 60_000 });
  if (g.gutter) lines.push({ label: t.items.gutter, value: 45_000 });
  return { lines, total: lines.reduce((s, l) => s + l.value, 0) };
}

export default function GarageDesigner() {
  const { lang, t: site } = useI18n();
  const t = T[lang];
  const { theme } = useTheme();
  useSeo({
    title: site.seo.garageTitle,
    description: site.seo.garageDescription,
    path: '/garage-designer/',
    image: `/og/garage-designer.${lang}.png`,
  });

  const [garage, setGarage] = useState<GarageOpts>({
    width: 3.4,
    depth: 6,
    height: 2.5,
    roof: 'gable',
    door: 'sectional',
    doors: 1,
    cladding: 'sheet',
    wall: WALLS[0].id,
    trim: TRIMS[0].id,
    sideDoor: true,
    window: true,
    gutter: true,
  });
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const groups = useRef<THREE.Object3D[]>([]);
  const sun = useRef<THREE.DirectionalLight | null>(null);
  const hemi = useRef<THREE.HemisphereLight | null>(null);

  const setG = <K extends keyof GarageOpts>(k: K, v: GarageOpts[K]) => setGarage((g) => ({ ...g, [k]: v }));

  // two doors need room
  const twoFits = garage.width >= 5.4;
  useEffect(() => {
    if (!twoFits && garage.doors === 2) setG('doors', 1);
  }, [twoFits, garage.doors]);

  // the stage
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let s: Stage;
    try {
      s = createStage(el, { fov: 38, shadows: true });
    } catch {
      setState('error');
      return;
    }
    stage.current = s;
    s.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    s.controls.minDistance = 4;
    s.controls.maxDistance = 60;
    const h = new THREE.HemisphereLight('#dfe9f5', '#5a6040', 1.4);
    s.scene.add(h);
    hemi.current = h;
    const d = new THREE.DirectionalLight('#fff3df', 2.6);
    d.position.set(12, 18, 10);
    d.castShadow = true;
    d.shadow.mapSize.set(2048, 2048);
    d.shadow.camera.left = d.shadow.camera.bottom = -22;
    d.shadow.camera.right = d.shadow.camera.top = 22;
    d.shadow.camera.far = 60;
    d.shadow.bias = -0.0004;
    d.shadow.normalBias = 0.03;
    s.scene.add(d);
    sun.current = d;
    s.camera.position.set(9, 6, 13);
    s.controls.target.set(0, 1.3, 0);
    setState('ready');
    return () => {
      for (const g of groups.current) disposeGroup(g);
      groups.current = [];
      s.dispose();
      stage.current = null;
    };
  }, []);

  // sky colour follows the site theme
  useEffect(() => {
    const s = stage.current;
    if (!s) return;
    const dark = theme === 'dark';
    const sky = new THREE.Color(dark ? '#3a4552' : '#dce6ec');
    s.scene.background = sky;
    s.scene.fog = new THREE.Fog(sky, 28, 75);
    // daylight in both themes, so the colours stay true; only the sky follows the site
    if (hemi.current) hemi.current.intensity = 1.5;
    if (sun.current) sun.current.intensity = 2.7;
    s.renderer.toneMappingExposure = 1.05;
    s.render();
  }, [theme, state]);

  // rebuild the model on every change
  useEffect(() => {
    const s = stage.current;
    if (!s) return;
    for (const g of groups.current) {
      s.scene.remove(g);
      disposeGroup(g);
    }
    const next = [buildGround(garage), buildGarage(garage)];
    for (const g of next) s.scene.add(g);
    groups.current = next;
    s.render();
  }, [garage, state]);

  // camera presets around the garage
  const pose = (which: View) => {
    const r = Math.max(garage.width, garage.depth) * 1.5 + 7;
    const target = new THREE.Vector3(0, garage.height * 0.55, 0);
    if (which === 'front') return { target, pos: new THREE.Vector3(0.55 * r, 0.42 * r, 0.75 * r) };
    if (which === 'side') return { target, pos: new THREE.Vector3(0.95 * r, 0.32 * r, 0.3 * r) };
    return { target: new THREE.Vector3(0, 0, 0), pos: new THREE.Vector3(0.01, 1.15 * r, 0.3 * r) };
  };
  const view = (which: View) => {
    const s = stage.current;
    if (!s) return;
    const { target, pos } = pose(which);
    s.glide(target, pos);
  };
  useEffect(() => {
    const s = stage.current;
    if (state !== 'ready' || !s) return;
    const { target, pos } = pose('front');
    s.controls.target.copy(target);
    s.camera.position.copy(pos);
    s.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const est = useMemo(() => estimate(garage, t), [garage, t]);
  const opts = <K extends string>(o: Record<K, string>) => (Object.keys(o) as K[]).map((id) => ({ id, label: o[id] }));
  const colors = (list: typeof WALLS) => list.map((c) => ({ id: c.id, hex: c.id, label: c[lang] }));

  return (
    <Section id="garage-designer" className="pt-24 lg:pt-24">
      <SectionHeader
        index="11"
        title={lang === 'hu' ? 'Garázstervező' : 'Garage designer'}
        inHeader
        subtitle={t.subtitle}
        right={
          <button
            type="button"
            onClick={() => stage.current && download(stage.current.snapshot(), lang === 'hu' ? 'garazs-terv.png' : 'garage-design.png')}
            disabled={state !== 'ready'}
            data-cursor="follow"
            className="group flex items-center gap-2 font-mono text-[12.5px] uppercase tracking-tech text-text transition-colors hover:text-accent disabled:opacity-40"
          >
            {t.save} <span className="transition-transform group-hover:translate-y-0.5">↓</span>
          </button>
        }
      />
      <p className="mb-5 max-w-3xl text-[14px] leading-relaxed text-muted">{t.intro}</p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        {/* viewport */}
        <div className="relative h-[46vh] min-h-[300px] overflow-hidden border border-line bg-surface lg:sticky lg:top-24 lg:h-[calc(100vh-13rem)] lg:min-h-[480px]">
          <div ref={host} className="absolute inset-0" />
          {state !== 'ready' && (
            <div className="absolute inset-0 grid place-items-center font-mono text-[12px] uppercase tracking-tech text-muted">
              {state === 'error' ? t.noGl : t.loading}
            </div>
          )}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="border border-line bg-bg/80 px-2 py-1 font-mono text-[11px] tracking-tech text-text backdrop-blur">
              {m(garage.width)} × {m(garage.depth)} × {m(garage.height)}
            </span>
          </div>
          <div className="absolute right-3 top-3 flex gap-px border border-line bg-line">
            {(['front', 'side', 'top'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => view(v)}
                data-cursor="follow"
                className="bg-bg/85 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-tech text-muted backdrop-blur transition-colors hover:text-accent"
              >
                {t.views[v]}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10.5px] uppercase tracking-tech text-muted">{t.drag}</div>
        </div>

        {/* controls */}
        <aside className="min-w-0">
          <div className="border border-line bg-surface px-4 sm:px-5">
            <Group title={t.size} aside={`${(garage.width * garage.depth).toFixed(1).replace('.', ',')} m²`}>
              <div className="space-y-3">
                <Slider label={t.width} value={garage.width} min={2.6} max={7} step={0.1} format={m} onChange={(v) => setG('width', v)} />
                <Slider label={t.depth} value={garage.depth} min={4.5} max={9} step={0.1} format={m} onChange={(v) => setG('depth', v)} />
                <Slider label={t.height} value={garage.height} min={2.2} max={3.2} step={0.05} format={m} onChange={(v) => setG('height', v)} />
              </div>
            </Group>
            <Group title={t.roof}>
              <Segmented<Roof> value={garage.roof} onChange={(v) => setG('roof', v)} options={opts(t.roofs)} />
            </Group>
            <Group title={t.door}>
              <div className="space-y-2">
                <Segmented<Door> value={garage.door} onChange={(v) => setG('door', v)} options={opts(t.doors)} />
                <Segmented<'1' | '2'>
                  value={String(garage.doors) as '1' | '2'}
                  onChange={(v) => setG('doors', v === '2' ? 2 : 1)}
                  options={[
                    { id: '1', label: t.one },
                    { id: '2', label: t.two, disabled: !twoFits },
                  ]}
                />
              </div>
            </Group>
            <Group title={t.cladding}>
              <Segmented<Cladding> value={garage.cladding} onChange={(v) => setG('cladding', v)} options={opts(t.cladd)} />
            </Group>
            <Group title={t.wall} aside={WALLS.find((c) => c.id === garage.wall)?.[lang]}>
              <Swatches value={garage.wall} options={colors(WALLS)} onChange={(v) => setG('wall', v)} />
            </Group>
            <Group title={t.trim} aside={TRIMS.find((c) => c.id === garage.trim)?.[lang]}>
              <Swatches value={garage.trim} options={colors(TRIMS)} onChange={(v) => setG('trim', v)} />
            </Group>
            <Group title={t.extras}>
              <div className="space-y-2">
                <Toggle label={t.sideDoor} checked={garage.sideDoor} onChange={(v) => setG('sideDoor', v)} />
                <Toggle label={t.window} checked={garage.window} onChange={(v) => setG('window', v)} />
                <Toggle label={t.gutter} checked={garage.gutter} onChange={(v) => setG('gutter', v)} />
              </div>
            </Group>
          </div>

          {/* estimate */}
          <div className="mt-4 border border-line bg-surface p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="label">{t.estimate}</span>
              <span className="font-mono text-2xs uppercase tracking-tech text-dim">demo</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {est.lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-3 text-[13px] text-muted">
                  <span className="min-w-0">{l.label}</span>
                  <span className="shrink-0 font-mono text-text">{huf(l.value)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
              <span className="font-mono text-[12px] uppercase tracking-tech text-text">{t.total}</span>
              <span className="display text-[1.7rem] leading-none text-accent">{huf(est.total)}</span>
            </div>
            <p className="mt-2 text-[12px] text-dim">{t.demo}</p>
          </div>

          <ConsultCta className="mt-4" />
        </aside>
      </div>
    </Section>
  );
}
