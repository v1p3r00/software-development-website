import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useTheme } from '../hooks/useTheme';
import { Section, SectionHeader } from '../components/ui';
import { ConsultCta, Group, Segmented, Slider, Swatches, Toggle, money } from '../components/tools/kit';
import { buildGarage, buildGround, disposeGroup, setDoors } from '../components/tools/garageScene';
import type { Cladding, Door, GarageOpts, Roof } from '../components/tools/garageScene';
import { createSky } from '../components/tools/garageSky';
import type { Sky } from '../components/tools/garageSky';
import { createStage, download } from '../components/tools/stage';
import type { Stage } from '../components/tools/stage';

type View = 'front' | 'side' | 'top';

const WALLS = [
  { id: '#ebe8e2', en: 'White', hu: 'Fehér', sk: 'Biela' },
  { id: '#d9cbb0', en: 'Sand', hu: 'Homok', sk: 'Piesková' },
  { id: '#9ea3a6', en: 'Grey', hu: 'Szürke', sk: 'Sivá' },
  { id: '#41464b', en: 'Anthracite', hu: 'Antracit', sk: 'Antracitová' },
  { id: '#7a5539', en: 'Walnut', hu: 'Dió', sk: 'Orech' },
  { id: '#5f6e58', en: 'Moss', hu: 'Moha', sk: 'Machová' },
];
const TRIMS = [
  { id: '#34383c', en: 'Anthracite', hu: 'Antracit', sk: 'Antracitová' },
  { id: '#f2f2f0', en: 'White', hu: 'Fehér', sk: 'Biela' },
  { id: '#a8acb0', en: 'Silver', hu: 'Ezüst', sk: 'Strieborná' },
  { id: '#5b3d2a', en: 'Brown', hu: 'Barna', sk: 'Hnedá' },
  { id: '#7d2f2a', en: 'Oxide red', hu: 'Oxidvörös', sk: 'Oxidovo červená' },
];
const HANDLES = [
  { id: '#c9ccd0', en: 'Stainless', hu: 'Rozsdamentes', sk: 'Nerez' },
  { id: '#1b1c1e', en: 'Matt black', hu: 'Matt fekete', sk: 'Matná čierna' },
  { id: '#c49a52', en: 'Brass', hu: 'Sárgaréz', sk: 'Mosadz' },
  { id: '#b87452', en: 'Copper', hu: 'Vörösréz', sk: 'Meď' },
  { id: '#f2f2f0', en: 'White', hu: 'Fehér', sk: 'Biela' },
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
    doors: { sectional: 'Sectional', tilt: 'Up & over', swing: 'Swing', none: 'No gate' },
    doorCount: 'Number of doors',
    one: '1 door',
    two: '2 doors',
    cladding: 'Cladding',
    cladd: { sheet: 'Steel sheet', wood: 'Wood look', render: 'Render' },
    wall: 'Wall colour',
    trim: 'Roof & door colour',
    handle: 'Handle finish',
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
    open: 'Open doors',
    close: 'Close doors',
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
    doors: { sectional: 'Szekcionált', tilt: 'Billenő', swing: 'Nyíló', none: 'Nincs kapu' },
    doorCount: 'Kapuk száma',
    one: '1 kapu',
    two: '2 kapu',
    cladding: 'Burkolat',
    cladd: { sheet: 'Trapézlemez', wood: 'Fahatású', render: 'Vakolt' },
    wall: 'Falszín',
    trim: 'Tető- és kapuszín',
    handle: 'Kilincs színe',
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
    open: 'Kapu nyitása',
    close: 'Kapu zárása',
  },
  sk: {
    subtitle: 'Návrhár garáže — orientačné ceny',
    intro: 'Zadajte rozmery garáže a potom vyberte strechu, bránu, obklad a farby — 3D model aj odhad ceny sa prispôsobia každej zmene.',
    size: 'Rozmery',
    width: 'Šírka',
    depth: 'Hĺbka',
    height: 'Výška steny',
    roof: 'Strecha',
    roofs: { flat: 'Plochá', mono: 'Pultová', gable: 'Sedlová' },
    door: 'Garážová brána',
    doors: { sectional: 'Sekcionálna', tilt: 'Výklopná', swing: 'Krídlová', none: 'Bez brány' },
    doorCount: 'Počet brán',
    one: '1 brána',
    two: '2 brány',
    cladding: 'Obklad',
    cladd: { sheet: 'Trapézový plech', wood: 'Imitácia dreva', render: 'Omietka' },
    wall: 'Farba stien',
    trim: 'Farba strechy a brány',
    handle: 'Povrch kľučky',
    extras: 'Doplnky',
    sideDoor: 'Bočné dvere',
    window: 'Okno',
    gutter: 'Odkvapový žľab a zvod',
    estimate: 'Odhad ceny',
    demo: 'Orientačné ceny s DPH, bez základov.',
    total: 'Spolu',
    items: {
      base: 'Konštrukcia garáže',
      roof: 'Príplatok za strechu',
      doors: 'Garážová brána',
      side: 'Bočné dvere',
      window: 'Okno',
      gutter: 'Odkvapový žľab',
      clad: 'Obklad s imitáciou dreva',
    },
    drag: 'Potiahnutím otočíte · kolieskom alebo prstami priblížite',
    save: 'Uložiť obrázok',
    loading: 'Načítava sa 3D zobrazenie…',
    noGl: 'Tento prehliadač nedokázal spustiť 3D zobrazenie.',
    views: { front: 'Spredu', side: 'Zboku', top: 'Zhora' },
    open: 'Otvoriť bránu',
    close: 'Zatvoriť bránu',
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
  const doorPrice = { sectional: 380_000, tilt: 190_000, swing: 160_000, none: 0 }[g.door];
  if (doorPrice) lines.push({ label: `${t.items.doors} × ${g.doors}`, value: doorPrice * g.doors });
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
    handle: HANDLES[0].id,
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
  const sky = useRef<Sky | null>(null);
  const [oak, setOak] = useState<THREE.Object3D | null>(null);
  const night = theme === 'dark';
  const [open, setOpen] = useState(false);
  const openK = useRef(0);

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
    d.shadow.camera.left = d.shadow.camera.bottom = -28;
    d.shadow.camera.right = d.shadow.camera.top = 28;
    d.shadow.camera.far = 80;
    d.shadow.bias = -0.0004;
    d.shadow.normalBias = 0.03;
    s.scene.add(d);
    sun.current = d;
    sky.current = createSky(s.scene, s.renderer);
    // the oak model arrives a moment later; the garage shows without it meanwhile
    let alive = true;
    new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .loadAsync('/model/oak.glb')
      .then((gltf) => {
        if (alive) setOak(gltf.scene);
      })
      .catch(() => {});
    s.camera.position.set(9, 6, 13);
    s.controls.target.set(0, 1.3, 0);
    setState('ready');
    return () => {
      alive = false;
      sky.current?.dispose();
      sky.current = null;
      for (const g of groups.current) disposeGroup(g);
      groups.current = [];
      s.dispose();
      stage.current = null;
    };
  }, []);

  // light theme: sunny day with a blue sky and clouds; dark theme: a starry night lit by the garage's own lights
  useEffect(() => {
    const s = stage.current;
    if (!s || !sun.current || !hemi.current) return;
    const d = sun.current;
    const h = hemi.current;
    if (night) {
      d.position.set(-14, 16, -6); // moonlight from behind, so the lit front reads
      d.color.set('#9db2ff');
      d.intensity = 0.8;
      h.color.set('#6a7fb0');
      h.groundColor.set('#1a1f2a');
      h.intensity = 0.85;
      s.renderer.toneMappingExposure = 1.1;
    } else {
      d.position.set(13, 19, 11);
      d.color.set('#fff1d8');
      d.intensity = 3.1;
      h.color.set('#cfe3ff');
      h.groundColor.set('#5f6a45');
      h.intensity = 1.05;
      s.renderer.toneMappingExposure = 1.0;
    }
    sky.current?.set(night, d.position.clone());
    s.render();
  }, [night, state]);

  // rebuild the model on every change
  useEffect(() => {
    const s = stage.current;
    if (!s) return;
    for (const g of groups.current) {
      s.scene.remove(g);
      disposeGroup(g);
    }
    const built = buildGarage(garage, night);
    setDoors(built, openK.current);
    const next = [buildGround(garage, oak, night), built];
    for (const g of next) s.scene.add(g);
    groups.current = next;
    s.render();
  }, [garage, state, oak, night]);

  // open / close the garage doors with a short eased animation
  useEffect(() => {
    const s = stage.current;
    if (!s) return;
    const from = openK.current;
    const to = open ? 1 : 0;
    if (from === to) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ms = reduced ? 1 : 1600 * Math.abs(to - from);
    const t0 = performance.now();
    let raf = 0;
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      openK.current = from + (to - from) * ease(p);
      const g = groups.current[1];
      if (g) setDoors(g, openK.current);
      s.render();
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // camera presets around the garage
  const pose = (which: View) => {
    const r = Math.max(garage.width, garage.depth) * 1.5 + 7;
    const target = new THREE.Vector3(0, garage.height * 0.55, 0);
    if (which === 'front') return { target, pos: new THREE.Vector3(0.55 * r, 0.26 * r, 0.78 * r) };
    if (which === 'side') return { target, pos: new THREE.Vector3(0.96 * r, 0.2 * r, 0.3 * r) };
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
        title={{ en: 'Garage designer', hu: 'Garázstervező', sk: 'Návrhár garáže' }[lang]}
        inHeader
        subtitle={t.subtitle}
        right={
          <button
            type="button"
            onClick={() => stage.current && download(stage.current.snapshot(), { en: 'garage-design.png', hu: 'garazs-terv.png', sk: 'garaz-navrh.png' }[lang])}
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
          {garage.door !== 'none' && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              disabled={state !== 'ready'}
              aria-pressed={open}
              data-cursor="follow"
              className="absolute bottom-3 right-3 border border-line bg-bg/85 px-3 py-2 font-mono text-[11px] uppercase tracking-tech text-text backdrop-blur transition-colors hover:text-accent disabled:opacity-40"
            >
              {open ? t.close : t.open}
            </button>
          )}
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
                <Segmented<Door> value={garage.door} onChange={(v) => setG('door', v)} options={opts(t.doors)} cols={2} />
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
            <Group title={t.handle} aside={HANDLES.find((c) => c.id === garage.handle)?.[lang]}>
              <Swatches value={garage.handle} options={colors(HANDLES)} onChange={(v) => setG('handle', v)} />
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
                  <span className="shrink-0 font-mono text-text">{money(l.value, lang)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
              <span className="font-mono text-[12px] uppercase tracking-tech text-text">{t.total}</span>
              <span className="display text-[1.7rem] leading-none text-accent">{money(est.total, lang)}</span>
            </div>
            <p className="mt-2 text-[12px] text-dim">{t.demo}</p>
          </div>

          <ConsultCta className="mt-4" />
        </aside>
      </div>
    </Section>
  );
}
