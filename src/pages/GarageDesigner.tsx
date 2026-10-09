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
import { useGoToSection } from '../hooks/useGoToSection';
import { AppBar, AppCaption, AppCard, AppDots, AppPrice, AppRange, AppRow, AppSeg, AppSheet, AppShell, AppSwitch, Door as DoorTab, Download, Fab, FloatSeg, Palette, Plusbox, Roof as RoofTab, Ruler, usePhoneApp } from '../components/tools/phoneApp';
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
    doors: { sectional: 'Sectional', tilt: 'Up & over', swing: 'Swing', none: 'Door only' },
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
      entry: 'Entrance door',
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
    tabs: { size: 'Size', roof: 'Roof', door: 'Door', look: 'Look', extras: 'Extras' },
    quote: 'Get a quote',
    colourOf: { wall: 'Walls', trim: 'Roof & door', handle: 'Handle' },
    area: 'Floor area',
    closeSheet: 'Close',
    saveShort: 'Save',
    doorsShort: 'Doors',
    twoNeeds: 'Two doors need a width of at least 5,4 m.',
    summary: 'Estimate',
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
    doors: { sectional: 'Szekcionált', tilt: 'Billenő', swing: 'Nyíló', none: 'Csak ajtó' },
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
      entry: 'Bejárati ajtó',
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
    tabs: { size: 'Méret', roof: 'Tető', door: 'Kapu', look: 'Megjelenés', extras: 'Extrák' },
    quote: 'Ajánlatkérés',
    colourOf: { wall: 'Fal', trim: 'Tető és kapu', handle: 'Kilincs' },
    area: 'Alapterület',
    closeSheet: 'Bezárás',
    saveShort: 'Mentés',
    doorsShort: 'Kapu',
    twoNeeds: 'Két kapuhoz legalább 5,4 m szélesség kell.',
    summary: 'Árbecslés',
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
    doors: { sectional: 'Sekcionálna', tilt: 'Výklopná', swing: 'Krídlová', none: 'Len dvere' },
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
      entry: 'Vchodové dvere',
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
    tabs: { size: 'Rozmery', roof: 'Strecha', door: 'Brána', look: 'Vzhľad', extras: 'Doplnky' },
    quote: 'Získať ponuku',
    colourOf: { wall: 'Steny', trim: 'Strecha a brána', handle: 'Kľučka' },
    area: 'Zastavaná plocha',
    closeSheet: 'Zavrieť',
    saveShort: 'Uložiť',
    doorsShort: 'Brána',
    twoNeeds: 'Dve brány potrebujú šírku aspoň 5,4 m.',
    summary: 'Odhad ceny',
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
  // "door only": a closed front with one entrance door instead of a garage door
  if (g.door === 'none') lines.push({ label: t.items.entry, value: 140_000 });
  else {
    const doorPrice = { sectional: 380_000, tilt: 190_000, swing: 160_000 }[g.door];
    lines.push({ label: `${t.items.doors} × ${g.doors}`, value: doorPrice * g.doors });
  }
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

  const phone = usePhoneApp();
  const setG = <K extends keyof GarageOpts>(k: K, v: GarageOpts[K]) => setGarage((g) => ({ ...g, [k]: v }));

  // two doors need room
  const twoFits = garage.width >= 5.4;
  useEffect(() => {
    if (!twoFits && garage.doors === 2) setG('doors', 1);
  }, [twoFits, garage.doors]);

  // the stage (made again when the layout switches between phone and desktop)
  useEffect(() => {
    const el = host.current;
    if (!el || phone === null) return;
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
      setState('loading');
    };
  }, [phone]);

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
  const save = () => stage.current && download(stage.current.snapshot(), { en: 'garage-design.png', hu: 'garazs-terv.png', sk: 'garaz-navrh.png' }[lang]);

  if (phone)
    return (
      <PhoneGarage
        t={t}
        lang={lang}
        garage={garage}
        setG={setG}
        twoFits={twoFits}
        est={est}
        host={host}
        state={state}
        open={open}
        setOpen={setOpen}
        view={view}
        save={save}
        colors={colors}
      />
    );

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
            onClick={save}
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
                    { id: '2', label: t.two, disabled: !twoFits || garage.door === 'none' },
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

/* ---------------------------------------------------------------- phone */

type Tab = 'size' | 'roof' | 'door' | 'look' | 'extras';
type ColourOf = 'wall' | 'trim' | 'handle';
type Swatch = { id: string; hex: string; label: string };

/** the phone layout: an app screen built on the same 3D stage and price list */
function PhoneGarage({
  t,
  lang,
  garage,
  setG,
  twoFits,
  est,
  host,
  state,
  open,
  setOpen,
  view,
  save,
  colors,
}: {
  t: (typeof T)['en'];
  lang: 'en' | 'hu' | 'sk';
  garage: GarageOpts;
  setG: <K extends keyof GarageOpts>(k: K, v: GarageOpts[K]) => void;
  twoFits: boolean;
  est: { lines: { label: string; value: number }[]; total: number };
  host: React.RefObject<HTMLDivElement | null>;
  state: 'loading' | 'ready' | 'error';
  open: boolean;
  setOpen: (f: (v: boolean) => boolean) => void;
  view: (v: View) => void;
  save: () => void;
  colors: (list: typeof WALLS) => Swatch[];
}) {
  const goTo = useGoToSection();
  const [tab, setTab] = useState<Tab>('size');
  const [colourOf, setColourOf] = useState<ColourOf>('wall');
  const [sheet, setSheet] = useState(false);
  const [lastView, setLastView] = useState<View | null>('front');
  const area = `${(garage.width * garage.depth).toFixed(1).replace('.', ',')} m²`;
  const list = { wall: WALLS, trim: TRIMS, handle: HANDLES }[colourOf];
  const sub = [t.roofs[garage.roof], garage.door === 'none' ? t.doors.none : `${t.doors[garage.door]}${garage.doors === 2 ? ' ×2' : ''}`, t.cladd[garage.cladding]].join(' · ');
  const opts = <K extends string>(o: Record<K, string>) => (Object.keys(o) as K[]).map((id) => ({ id, label: o[id] }));

  const tabs = [
    { id: 'size' as const, label: t.tabs.size, icon: <Ruler /> },
    { id: 'roof' as const, label: t.tabs.roof, icon: <RoofTab /> },
    { id: 'door' as const, label: t.tabs.door, icon: <DoorTab /> },
    { id: 'look' as const, label: t.tabs.look, icon: <Palette /> },
    { id: 'extras' as const, label: t.tabs.extras, icon: <Plusbox /> },
  ];

  const canvas = (
    <>
      <div ref={host} className="absolute inset-0" onPointerDown={() => setLastView(null)} />
      {state !== 'ready' && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center text-[13px] text-muted">{state === 'error' ? t.noGl : t.loading}</div>
      )}
      <div className="absolute left-3 top-3">
        <FloatSeg<View>
          value={lastView}
          onChange={(v) => {
            setLastView(v);
            view(v);
          }}
          options={(['front', 'side', 'top'] as const).map((v) => ({ id: v, label: t.views[v] }))}
        />
      </div>
      <div className="absolute right-3 top-3 flex flex-col gap-2.5">
        <Fab label={open ? t.close : t.open} on={open} onClick={() => setOpen((v) => !v)} disabled={state !== 'ready'}>
          <GateIcon open={open} />
        </Fab>
        <Fab label={t.saveShort} onClick={save} disabled={state !== 'ready'}>
          <Download />
        </Fab>
      </div>
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-line-strong bg-bg/75 px-3 py-1.5 font-mono text-[11.5px] text-text backdrop-blur-md">
        {m(garage.width)} × {m(garage.depth)}
      </span>
    </>
  );

  return (
    <>
      <AppShell
        label={t.subtitle}
        canvas={canvas}
        tabs={tabs}
        tab={tab}
        onTab={setTab}
        bar={
          <AppBar
            title={t.summary}
            sub={sub}
            price={money(est.total, lang)}
            cta={t.quote}
            onOpen={() => setSheet(true)}
            onCta={goTo('contact')}
          />
        }
      >
        {tab === 'size' && (
          <div className="space-y-3 pt-1">
            <AppRange label={t.width} value={garage.width} min={2.6} max={7} step={0.1} format={m} onChange={(v) => setG('width', v)} />
            <AppRange label={t.depth} value={garage.depth} min={4.5} max={9} step={0.1} format={m} onChange={(v) => setG('depth', v)} />
            <AppRange label={t.height} value={garage.height} min={2.2} max={3.2} step={0.05} format={m} onChange={(v) => setG('height', v)} />
            <p className="flex justify-between border-t border-line pt-3 text-[12.5px] text-muted">
              <span>{t.area}</span>
              <b className="font-mono font-normal text-text">{area}</b>
            </p>
          </div>
        )}

        {tab === 'roof' && (
          <AppRow>
            {(Object.keys(t.roofs) as Roof[]).map((r) => (
              <AppCard key={r} wide on={garage.roof === r} onClick={() => setG('roof', r)} icon={<RoofIcon roof={r} />} label={t.roofs[r]} />
            ))}
          </AppRow>
        )}

        {tab === 'door' && (
          <>
            <AppRow>
              {(Object.keys(t.doors) as Door[]).map((d) => (
                <AppCard key={d} on={garage.door === d} onClick={() => setG('door', d)} icon={<DoorIcon door={d} />} label={t.doors[d]} />
              ))}
            </AppRow>
            {garage.door !== 'none' && (
              <>
                <AppSeg<'1' | '2'>
                  className="mt-3"
                  value={String(garage.doors) as '1' | '2'}
                  onChange={(v) => setG('doors', v === '2' ? 2 : 1)}
                  options={[
                    { id: '1', label: t.one },
                    { id: '2', label: t.two, disabled: !twoFits },
                  ]}
                />
                {!twoFits && <AppCaption>{t.twoNeeds}</AppCaption>}
              </>
            )}
          </>
        )}

        {tab === 'look' && (
          <>
            <AppSeg<Cladding> value={garage.cladding} onChange={(v) => setG('cladding', v)} options={opts(t.cladd)} />
            <div className="mt-3.5 flex items-center gap-2">
              {(['wall', 'trim', 'handle'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setColourOf(k)}
                  aria-pressed={colourOf === k}
                  className={`flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12px] transition-colors ${colourOf === k ? 'border-text text-text' : 'border-line text-muted'}`}
                >
                  <span className="h-3 w-3 shrink-0 rounded-full border border-black/20" style={{ background: garage[k] }} />
                  <span className="truncate">{t.colourOf[k]}</span>
                </button>
              ))}
            </div>
            <div className="mt-2.5">
              <AppDots value={garage[colourOf]} options={colors(list)} onChange={(v) => setG(colourOf, v)} />
            </div>
          </>
        )}

        {tab === 'extras' && (
          <div className="space-y-2">
            <AppSwitch label={t.sideDoor} icon={<SideDoorIcon />} checked={garage.sideDoor} onChange={(v) => setG('sideDoor', v)} />
            <AppSwitch label={t.window} icon={<WindowIcon />} checked={garage.window} onChange={(v) => setG('window', v)} />
            <AppSwitch label={t.gutter} icon={<GutterIcon />} checked={garage.gutter} onChange={(v) => setG('gutter', v)} />
          </div>
        )}
      </AppShell>

      {sheet && (
        <AppSheet title={t.estimate} close={t.closeSheet} onClose={() => setSheet(false)}>
          <p className="mb-3 text-[13px] text-muted">
            {m(garage.width)} × {m(garage.depth)} × {m(garage.height)} · {sub}
          </p>
          <AppPrice lines={est.lines.map((l) => ({ label: l.label, value: money(l.value, lang) }))} total={money(est.total, lang)} totalLabel={t.total} note={t.demo} />
          <ConsultCta className="mt-4" />
        </AppSheet>
      )}
    </>
  );
}

/* the option pictures: simple line drawings of each choice */
const svg = (children: React.ReactNode, className = 'h-[50px] w-[78px]') => (
  <svg viewBox="0 0 78 50" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);

function RoofIcon({ roof }: { roof: Roof }) {
  const top = roof === 'flat' ? 'M8 18h62' : roof === 'mono' ? 'M8 22L70 10' : 'M6 22L39 6l33 16';
  const walls = roof === 'flat' ? 'M12 18v28h54V18' : roof === 'mono' ? 'M12 21.2V46h54V11.6' : 'M12 19v27h54V19';
  return svg(
    <>
      <path d={top} strokeWidth="2.4" />
      <path d={walls} opacity="0.55" />
      <path d="M26 46V30h26v16" opacity="0.55" />
      <path d="M2 46h74" opacity="0.35" />
    </>,
  );
}

function DoorIcon({ door }: { door: Door }) {
  const frame = <path d="M14 46V10h50v36" opacity="0.45" />;
  if (door === 'none')
    return svg(
      <>
        {frame}
        <path d="M14 10h50v36H14z" opacity="0.2" fill="currentColor" stroke="none" />
        <rect x="33" y="20" width="12" height="26" />
        <path d="M42 33h1.5" strokeWidth="2.2" />
      </>,
    );
  if (door === 'sectional')
    return svg(
      <>
        {frame}
        <rect x="22" y="17" width="34" height="29" />
        {[23.5, 30, 36.5].map((y) => (
          <path key={y} d={`M22 ${y}h34`} opacity="0.7" />
        ))}
      </>,
    );
  if (door === 'tilt')
    return svg(
      <>
        {frame}
        <rect x="22" y="17" width="34" height="29" />
        <path d="M26 21l26 21M52 21L26 42" opacity="0.35" />
        <path d="M37 38h4" strokeWidth="2.4" />
      </>,
    );
  return svg(
    <>
      {frame}
      <rect x="22" y="17" width="34" height="29" />
      <path d="M39 17v29" />
      <path d="M35.5 30v4M42.5 30v4" strokeWidth="2.2" />
    </>,
  );
}

function GateIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 20.5V8.5L12 3.5l8.5 5v12" />
      {open ? <path d="M7 11h10v2.5H7z" /> : <><rect x="7" y="11" width="10" height="9.5" /><path d="M7 14h10M7 17h10" /></>}
    </svg>
  );
}

const small = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
    {d}
  </svg>
);
const SideDoorIcon = () => small(<><rect x="6.5" y="3.5" width="11" height="17" /><path d="M14.5 12h.8" strokeWidth="2.2" /></>);
const WindowIcon = () => small(<><rect x="4" y="5" width="16" height="14" /><path d="M12 5v14M4 12h16" /></>);
const GutterIcon = () => small(<path d="M3 6h15v3H3zM16 9v9a2 2 0 0 0 2 2h2" />);
