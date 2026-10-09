import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import '@fontsource-variable/playfair-display';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useTheme } from '../hooks/useTheme';
import { Section, SectionHeader, cx } from '../components/ui';
import { ConsultCta, Group, Segmented, Slider, Swatches, money } from '../components/tools/kit';
import { FIT, FONTS, createLightRig, drawDesign, makeUniforms, modelId, patchShirt, printCanvas, printTexture } from '../components/tools/shirtScene';
import type { Design, FontId, Garment, Gender, LightPreset, LightRig, ModelId, ShirtUniforms, Side } from '../components/tools/shirtScene';
import { createStage, download } from '../components/tools/stage';
import type { Stage } from '../components/tools/stage';
import { useGoToSection } from '../hooks/useGoToSection';
import { AppBar, AppCaption, AppCard, AppDots, AppPrice, AppRange, AppRow, AppSeg, AppSheet, AppShell, Download, Fab, FloatSeg, ImageIcon, Move, Palette, Shirt, Sun, TextIcon, Toast, Trash, Upload, Zoom, ZoomOut, usePhoneApp } from '../components/tools/phoneApp';

/** bump when a model file changes, so browsers fetch the new one instead of a cached copy */
const MODEL_VERSION = 7;

const SHIRTS = [
  { id: '#f4f3ef', en: 'White', hu: 'Fehér', sk: 'Biela' },
  { id: '#1d1e20', en: 'Black', hu: 'Fekete', sk: 'Čierna' },
  { id: '#9b9c9e', en: 'Heather grey', hu: 'Melírszürke', sk: 'Melírovaná sivá' },
  { id: '#1f2b47', en: 'Navy', hu: 'Sötétkék', sk: 'Námornícka modrá' },
  { id: '#b3262d', en: 'Red', hu: 'Piros', sk: 'Červená' },
  { id: '#2f4b36', en: 'Forest', hu: 'Erdőzöld', sk: 'Lesná zelená' },
  { id: '#d8c9a9', en: 'Sand', hu: 'Homok', sk: 'Piesková' },
  { id: '#9cc4e2', en: 'Sky', hu: 'Égkék', sk: 'Nebeská modrá' },
];
const INKS = [
  { id: '#141414', en: 'Black', hu: 'Fekete', sk: 'Čierna' },
  { id: '#ffffff', en: 'White', hu: 'Fehér', sk: 'Biela' },
  { id: '#ff5f1f', en: 'Orange', hu: 'Narancs', sk: 'Oranžová' },
  { id: '#d21c24', en: 'Red', hu: 'Piros', sk: 'Červená' },
  { id: '#c9a227', en: 'Gold', hu: 'Arany', sk: 'Zlatá' },
  { id: '#2a5fd1', en: 'Blue', hu: 'Kék', sk: 'Modrá' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const BASE: Record<Garment, number> = { tee: 5990, hoodie: 12990 };
const PRESETS: LightPreset[] = ['studio', 'daylight', 'golden', 'spotlight'];
type Size = (typeof SIZES)[number];

const T = {
  en: {
    title: '3D T-shirt & hoodie designer',
    subtitle: 'T-shirt and hoodie designer — demo prices',
    intro: 'Pick a model, a T-shirt or a hoodie and a colour, then put your text or your own image on the front or the back — the print wraps onto the 3D garment as you type.',
    model: 'Model',
    man: 'Man',
    woman: 'Woman',
    garment: 'Garment',
    hoodie: 'Hoodie',
    shirt: 'Colour',
    lighting: 'Lighting',
    lights: { studio: 'Studio', daylight: 'Daylight', golden: 'Golden hour', spotlight: 'Spotlight' },
    lightDir: 'Light direction',
    custom: 'Custom colour',
    side: 'Print side',
    front: 'Front',
    back: 'Back',
    text: 'Text',
    textHint: 'Up to 4 lines',
    font: 'Font',
    ink: 'Text colour',
    image: 'Image',
    upload: 'Upload an image',
    replace: 'Replace image',
    remove: 'Remove',
    imageHint: 'PNG with a transparent background works best. The file stays in your browser.',
    size: 'Print size',
    pos: 'Position',
    order: 'Order',
    shirtSize: 'Size',
    qty: 'Quantity',
    pcs: 'pcs',
    tee: 'T-shirt',
    printText: 'print, text',
    printImage: 'print, image',
    discount: 'Quantity discount',
    total: 'Total',
    demo: 'Demo prices, gross. Prices drop from 10, 25 and 50 pieces.',
    save: 'Save mockup',
    drag: 'Drag to rotate · scroll or pinch to zoom',
    loading: 'Loading the 3D model…',
    noGl: 'This browser could not start the 3D view.',
    views: { chest: 'Close-up', body: 'Full figure' },
    tabs: { garment: 'Garment', colour: 'Colour', text: 'Text', image: 'Image', place: 'Placement' },
    quote: 'Get a quote',
    closeSheet: 'Close',
    saveShort: 'Save',
    lightShort: 'Light',
    closer: 'Closer',
    wider: 'Full figure',
    textPh: 'Type your text…',
    noImage: 'No image on this side yet',
    piece: 'per piece',
    sample: 'softwaredevelopment.hu',
  },
  hu: {
    title: '3D póló- és pulóvertervező',
    subtitle: 'Póló- és pulóvertervező — bemutató árak',
    intro: 'Válassz modellt, pólót vagy kapucnis pulóvert és színt, majd tegyél szöveget vagy saját képet az elejére vagy a hátára — a minta gépelés közben rákerül a 3D ruhára.',
    model: 'Modell',
    man: 'Férfi',
    woman: 'Női',
    garment: 'Ruhadarab',
    hoodie: 'Kapucnis pulóver',
    shirt: 'Szín',
    lighting: 'Világítás',
    lights: { studio: 'Stúdió', daylight: 'Nappali fény', golden: 'Aranyóra', spotlight: 'Reflektor' },
    lightDir: 'Fény iránya',
    custom: 'Egyedi szín',
    side: 'Nyomat helye',
    front: 'Eleje',
    back: 'Háta',
    text: 'Szöveg',
    textHint: 'Legfeljebb 4 sor',
    font: 'Betűtípus',
    ink: 'Szöveg színe',
    image: 'Kép',
    upload: 'Kép feltöltése',
    replace: 'Kép cseréje',
    remove: 'Törlés',
    imageHint: 'Átlátszó hátterű PNG mutat a legjobban. A fájl a böngésződben marad.',
    size: 'Nyomat mérete',
    pos: 'Pozíció',
    order: 'Rendelés',
    shirtSize: 'Méret',
    qty: 'Mennyiség',
    pcs: 'db',
    tee: 'Póló',
    printText: 'nyomat, szöveg',
    printImage: 'nyomat, kép',
    discount: 'Mennyiségi kedvezmény',
    total: 'Összesen',
    demo: 'Bemutató árak, bruttó. 10, 25 és 50 darabtól olcsóbb.',
    save: 'Mockup mentése',
    drag: 'Húzd a forgatáshoz · görgess vagy csippents a nagyításhoz',
    loading: '3D modell betöltése…',
    noGl: 'Ez a böngésző nem tudta elindítani a 3D nézetet.',
    views: { chest: 'Közeli', body: 'Teljes alak' },
    tabs: { garment: 'Ruha', colour: 'Szín', text: 'Szöveg', image: 'Kép', place: 'Elhelyezés' },
    quote: 'Ajánlatkérés',
    closeSheet: 'Bezárás',
    saveShort: 'Mentés',
    lightShort: 'Fény',
    closer: 'Közelebb',
    wider: 'Teljes alak',
    textPh: 'Írd be a szöveget…',
    noImage: 'Ezen az oldalon még nincs kép',
    piece: 'darabonként',
    sample: 'softwaredevelopment.hu',
  },
  sk: {
    title: '3D návrhár tričiek a mikín',
    subtitle: 'Návrhár tričiek a mikín — orientačné ceny',
    intro: 'Vyberte model, tričko alebo mikinu a farbu, potom pridajte text alebo vlastný obrázok na prednú či zadnú stranu — potlač sa na 3D oblečenie prenáša už počas písania.',
    model: 'Model',
    man: 'Muž',
    woman: 'Žena',
    garment: 'Oblečenie',
    hoodie: 'Mikina s kapucňou',
    shirt: 'Farba',
    lighting: 'Osvetlenie',
    lights: { studio: 'Štúdio', daylight: 'Denné svetlo', golden: 'Zlatá hodinka', spotlight: 'Reflektor' },
    lightDir: 'Smer svetla',
    custom: 'Vlastná farba',
    side: 'Strana potlače',
    front: 'Predná',
    back: 'Zadná',
    text: 'Text',
    textHint: 'Najviac 4 riadky',
    font: 'Písmo',
    ink: 'Farba textu',
    image: 'Obrázok',
    upload: 'Nahrať obrázok',
    replace: 'Vymeniť obrázok',
    remove: 'Odstrániť',
    imageHint: 'Najlepšie vyzerá PNG s priehľadným pozadím. Súbor zostáva vo vašom prehliadači.',
    size: 'Veľkosť potlače',
    pos: 'Poloha',
    order: 'Objednávka',
    shirtSize: 'Veľkosť',
    qty: 'Množstvo',
    pcs: 'ks',
    tee: 'Tričko',
    printText: 'potlač, text',
    printImage: 'potlač, obrázok',
    discount: 'Množstevná zľava',
    total: 'Spolu',
    demo: 'Orientačné ceny s DPH. Od 10, 25 a 50 kusov sú nižšie.',
    save: 'Uložiť mockup',
    drag: 'Potiahnutím otočíte · kolieskom alebo prstami priblížite',
    loading: 'Načítava sa 3D model…',
    noGl: 'Tento prehliadač nedokázal spustiť 3D zobrazenie.',
    views: { chest: 'Detail', body: 'Celá postava' },
    tabs: { garment: 'Oblečenie', colour: 'Farba', text: 'Text', image: 'Obrázok', place: 'Umiestnenie' },
    quote: 'Získať ponuku',
    closeSheet: 'Zavrieť',
    saveShort: 'Uložiť',
    lightShort: 'Svetlo',
    closer: 'Bližšie',
    wider: 'Celá postava',
    textPh: 'Napíšte svoj text…',
    noImage: 'Na tejto strane zatiaľ nie je obrázok',
    piece: 'za kus',
    sample: 'softwaredevelopment.hu',
  },
};

const blank = (text: string): Design => ({ text, font: 'archivo', color: INKS[0].id, image: null, scale: 0.78, offset: 0 });

export default function ShirtDesigner() {
  const { lang, t: site } = useI18n();
  const t = T[lang];
  const { theme } = useTheme();
  useSeo({
    title: site.seo.shirtTitle,
    description: site.seo.shirtDescription,
    path: '/shirt-designer/',
    image: `/og/shirt-designer.${lang}.png`,
  });

  const phone = usePhoneApp();
  const [gender, setGender] = useState<Gender>('man');
  const [garment, setGarment] = useState<Garment>('tee');
  const [light, setLight] = useState<LightPreset>('studio');
  const [lightAz, setLightAz] = useState(30);
  const id: ModelId = modelId(garment, gender);
  const [color, setColor] = useState(SHIRTS[0].id);
  const [side, setSide] = useState<Side>('front');
  const [designs, setDesigns] = useState<Record<Side, Design>>(() => ({ front: blank(T[lang].sample), back: blank('') }));
  const [size, setSize] = useState<Size>('M');
  const [qty, setQty] = useState(1);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [modelReady, setModelReady] = useState<ModelId | null>(null);
  const framed = useRef(false);

  const design = designs[side];
  const setD = <K extends keyof Design>(k: K, v: Design[K]) => setDesigns((d) => ({ ...d, [side]: { ...d[side], [k]: v } }));

  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const models = useRef<Partial<Record<ModelId, THREE.Object3D>>>({});
  const rig = useRef<LightRig | null>(null);
  const uni = useRef<ShirtUniforms | null>(null);
  const canvases = useRef<Record<Side, HTMLCanvasElement> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // stage, lights and the print textures (made again when the layout switches between phone and desktop)
  useEffect(() => {
    const el = host.current;
    if (!el || phone === null) return;
    let s: Stage;
    try {
      s = createStage(el, { fov: 30 });
    } catch {
      setState('error');
      return;
    }
    stage.current = s;
    const pmrem = new THREE.PMREMGenerator(s.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    s.scene.environment = env;
    rig.current = createLightRig(s.scene, s.renderer);
    s.controls.minDistance = 0.45;
    s.controls.maxDistance = 3.2;
    s.controls.minPolarAngle = 0.35;
    s.controls.maxPolarAngle = Math.PI - 0.35;

    const cf = printCanvas();
    const cb = printCanvas();
    canvases.current = { front: cf, back: cb };
    uni.current = makeUniforms(printTexture(cf), printTexture(cb));
    setState('ready');
    return () => {
      for (const m of Object.values(models.current)) {
        m?.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry.dispose();
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.map?.dispose();
            mat.normalMap?.dispose();
            mat.dispose();
          }
        });
      }
      models.current = {};
      rig.current?.dispose();
      rig.current = null;
      uni.current?.uFront.value.dispose();
      uni.current?.uBack.value.dispose();
      env.dispose();
      pmrem.dispose();
      s.dispose();
      stage.current = null;
      framed.current = false;
      setModelReady(null);
      setState('loading');
    };
  }, [phone]);

  // background follows the theme
  useEffect(() => {
    const s = stage.current;
    if (!s) return;
    s.scene.background = new THREE.Color(theme === 'dark' ? '#17191c' : '#e9e7e2');
    s.render();
  }, [theme, state]);

  // load (once) and show the chosen model
  useEffect(() => {
    const s = stage.current;
    const u = uni.current;
    if (state !== 'ready' || !s || !u) return;
    let cancelled = false;
    const show = (g: ModelId) => {
      for (const [k, m] of Object.entries(models.current)) if (m) m.visible = k === g;
      const fit = FIT[g];
      u.uBand.value.set(fit.band[0], fit.band[1]);
      setModelReady(g);
      s.render();
    };
    if (models.current[id]) {
      show(id);
      return;
    }
    setModelReady(null);
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader
      .loadAsync(`/model/${id}.glb?v=${MODEL_VERSION}`)
      .then((gltf) => {
        if (cancelled || !stage.current) return;
        const root = gltf.scene;
        // model-space matrix of each mesh (a model with several materials nests its meshes under a group node)
        root.updateMatrixWorld(true);
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          // casts onto the floor only: the scans already carry their own baked shading, and
          // self-shadowing a simplified face shows its facets
          mesh.castShadow = true;
          patchShirt(mesh.material as THREE.MeshStandardMaterial, mesh.matrixWorld.clone(), u);
        });
        s.scene.add(root);
        models.current[id] = root;
        show(id);
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
    };
  }, [id, state]);

  // lighting
  useEffect(() => {
    rig.current?.set(light, lightAz);
    stage.current?.render();
  }, [light, lightAz, state]);

  // shirt colour
  useEffect(() => {
    if (!uni.current) return;
    uni.current.uTint.value.set(color);
    stage.current?.render();
  }, [color, state]);

  // print boxes follow the model and the position sliders
  useEffect(() => {
    const u = uni.current;
    if (!u) return;
    const fit = FIT[id];
    for (const sd of ['front', 'back'] as const) {
      const [cy, hw, hh] = fit[sd];
      const box = sd === 'front' ? u.uFrontBox.value : u.uBackBox.value;
      box.set(0, cy + designs[sd].offset * hh * 0.45, hw, hh);
    }
    stage.current?.render();
  }, [id, designs, state]);

  // redraw the prints
  useEffect(() => {
    const c = canvases.current;
    const u = uni.current;
    if (!c || !u) return;
    let stale = false;
    (async () => {
      for (const sd of ['front', 'back'] as const) {
        await drawDesign(c[sd], designs[sd]);
        if (stale) return;
        (sd === 'front' ? u.uFront.value : u.uBack.value).needsUpdate = true;
      }
      stage.current?.render();
    })();
    return () => {
      stale = true;
    };
  }, [designs, state]);

  // camera: close on the chest, from the side being edited
  const frame = (which: 'chest' | 'body', s2: Side = side, instant = false) => {
    const s = stage.current;
    if (!s) return;
    const y = which === 'chest' ? FIT[id].chest : 0.02;
    const d = which === 'chest' ? 1.1 : 2.3;
    const dir = s2 === 'front' ? 1 : -1;
    const target = new THREE.Vector3(0, y, 0);
    const pos = new THREE.Vector3(0.22 * d * dir, y + 0.06 * d, 0.97 * d * dir);
    if (instant) {
      s.controls.target.copy(target);
      s.camera.position.copy(pos);
      s.render();
    } else s.glide(target, pos);
  };
  useEffect(() => {
    if (!modelReady) return;
    if (!framed.current) {
      framed.current = true;
      frame('chest', side, true);
    } else frame('chest');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, modelReady]);

  const onFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setD('image', img);
    img.src = url;
  };

  const price = useMemo(() => {
    const lines: { label: string; value: number }[] = [];
    lines.push({ label: `${garment === 'tee' ? t.tee : t.hoodie} · ${size} × ${qty}`, value: BASE[garment] * qty });
    for (const sd of ['front', 'back'] as const) {
      const d = designs[sd];
      if (!d.text.trim() && !d.image) continue;
      const each = d.image ? 2990 : 1990;
      lines.push({ label: `${sd === 'front' ? t.front : t.back} ${d.image ? t.printImage : t.printText} × ${qty}`, value: each * qty });
    }
    const sub = lines.reduce((s, l) => s + l.value, 0);
    const rate = qty >= 50 ? 0.2 : qty >= 25 ? 0.15 : qty >= 10 ? 0.1 : 0;
    if (rate) lines.push({ label: `${t.discount} −${rate * 100}%`, value: -sub * rate });
    return { lines, total: sub * (1 - rate) };
  }, [designs, qty, size, t, garment]);

  const colors = (list: typeof SHIRTS) => list.map((c) => ({ id: c.id, hex: c.id, label: c[lang] }));
  const shirtName = SHIRTS.find((c) => c.id === color)?.[lang] ?? t.custom;
  const busy = state === 'ready' && !modelReady;
  const saveName =
    lang === 'hu' ? (garment === 'tee' ? 'polo-mockup.png' : 'pulover-mockup.png') : lang === 'sk' ? (garment === 'tee' ? 'tricko-mockup.png' : 'mikina-mockup.png') : `${garment === 'tee' ? 'tshirt' : 'hoodie'}-mockup.png`;
  const save = () => stage.current && download(stage.current.snapshot(), saveName);

  if (phone)
    return (
      <PhoneShirt
        t={t}
        lang={lang}
        host={host}
        state={state}
        busy={busy}
        ready={!!modelReady}
        gender={gender}
        setGender={setGender}
        garment={garment}
        setGarment={setGarment}
        color={color}
        setColor={setColor}
        side={side}
        setSide={setSide}
        design={design}
        setD={setD}
        light={light}
        setLight={setLight}
        size={size}
        setSize={setSize}
        qty={qty}
        setQty={setQty}
        price={price}
        frame={frame}
        save={save}
        onFile={onFile}
        shirtName={shirtName}
        colors={colors}
      />
    );

  return (
    <Section id="shirt-designer" className="pt-24 lg:pt-24">
      <SectionHeader
        index="12"
        title={t.title}
        inHeader
        subtitle={t.subtitle}
        right={
          <button
            type="button"
            onClick={save}
            disabled={!modelReady}
            data-cursor="follow"
            className="group flex items-center gap-2 font-mono text-[12.5px] uppercase tracking-tech text-text transition-colors hover:text-accent disabled:opacity-40"
          >
            {t.save} <span className="transition-transform group-hover:translate-y-0.5">↓</span>
          </button>
        }
      />
      <p className="mb-5 max-w-3xl text-[14px] leading-relaxed text-muted">{t.intro}</p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="relative h-[50vh] min-h-[340px] overflow-hidden border border-line bg-surface lg:sticky lg:top-24 lg:h-[calc(100vh-13rem)] lg:min-h-[480px]">
          <div ref={host} className="absolute inset-0" />
          {(state !== 'ready' || busy) && (
            <div className="absolute inset-0 grid place-items-center font-mono text-[12px] uppercase tracking-tech text-muted">
              {state === 'error' ? t.noGl : t.loading}
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-px border border-line bg-line">
            {(['front', 'back'] as const).map((sd) => (
              <button
                key={sd}
                type="button"
                onClick={() => setSide(sd)}
                aria-pressed={side === sd}
                data-cursor="follow"
                className={cx(
                  'px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-tech backdrop-blur transition-colors',
                  side === sd ? 'bg-accent text-onaccent' : 'bg-bg/85 text-muted hover:text-accent',
                )}
              >
                {sd === 'front' ? t.front : t.back}
              </button>
            ))}
          </div>
          <div className="absolute right-3 top-3 flex gap-px border border-line bg-line">
            {(['chest', 'body'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => frame(v)}
                data-cursor="follow"
                className="bg-bg/85 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-tech text-muted backdrop-blur transition-colors hover:text-accent"
              >
                {t.views[v]}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10.5px] uppercase tracking-tech text-muted">{t.drag}</div>
        </div>

        <aside className="min-w-0">
          <div className="border border-line bg-surface px-4 sm:px-5">
            <Group title={t.model}>
              <Segmented<Gender>
                value={gender}
                onChange={setGender}
                options={[
                  { id: 'man', label: t.man },
                  { id: 'woman', label: t.woman },
                ]}
              />
            </Group>
            <Group title={t.garment}>
              <Segmented<Garment>
                value={garment}
                onChange={setGarment}
                options={[
                  { id: 'tee', label: t.tee },
                  { id: 'hoodie', label: t.hoodie },
                ]}
              />
            </Group>
            <Group title={t.shirt} aside={shirtName}>
              <div className="flex flex-wrap items-center gap-2">
                <Swatches value={color} options={colors(SHIRTS)} onChange={setColor} />
                <label
                  title={t.custom}
                  data-cursor="follow"
                  className={cx(
                    'relative grid h-8 w-8 cursor-pointer place-items-center border font-mono text-[14px] text-muted',
                    SHIRTS.some((c) => c.id === color) ? 'border-line-strong' : 'border-accent outline outline-2 outline-offset-2 outline-accent',
                  )}
                  style={{ background: 'conic-gradient(#e53, #ec3, #4c5, #3ae, #a4e, #e53)' }}
                >
                  <span className="sr-only">{t.custom}</span>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                </label>
              </div>
            </Group>
            <Group title={t.lighting} aside={t.lights[light]}>
              <Segmented<LightPreset> value={light} onChange={setLight} options={PRESETS.map((p) => ({ id: p, label: t.lights[p] }))} />
              <div className="mt-3">
                <Slider label={t.lightDir} value={lightAz} min={-180} max={180} step={5} format={(v) => `${v}°`} onChange={setLightAz} />
              </div>
            </Group>
            <Group title={t.side}>
              <Segmented<Side>
                value={side}
                onChange={setSide}
                options={[
                  { id: 'front', label: t.front },
                  { id: 'back', label: t.back },
                ]}
              />
            </Group>
            <Group title={t.text} aside={t.textHint}>
              <textarea
                value={design.text}
                rows={3}
                maxLength={80}
                onChange={(e) => setD('text', e.target.value.split('\n').slice(0, 4).join('\n'))}
                className="w-full resize-none border border-line bg-bg px-3 py-2 font-mono text-[13px] text-text outline-none transition-colors focus:border-accent"
              />
              <div className="mt-2.5">
                <Segmented<FontId>
                  value={design.font}
                  onChange={(v) => setD('font', v)}
                  options={(Object.keys(FONTS) as FontId[]).map((id) => ({ id, label: FONTS[id].label }))}
                />
              </div>
              <div className="mt-3">
                <span className="mb-2 block font-mono text-[11px] uppercase tracking-tech text-muted">{t.ink}</span>
                <Swatches value={design.color} options={colors(INKS)} onChange={(v) => setD('color', v)} />
              </div>
            </Group>
            <Group title={t.image}>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  data-cursor="follow"
                  className="border border-line-strong px-3 py-2 font-mono text-[11px] uppercase tracking-tech text-text transition-colors hover:border-accent hover:text-accent"
                >
                  {design.image ? t.replace : t.upload}
                </button>
                {design.image && (
                  <button
                    type="button"
                    onClick={() => setD('image', null)}
                    data-cursor="follow"
                    className="border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-tech text-muted transition-colors hover:text-accent"
                  >
                    {t.remove}
                  </button>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </div>
              <p className="mt-2 text-[12px] leading-snug text-dim">{t.imageHint}</p>
            </Group>
            <Group title={`${t.size} · ${t.pos}`}>
              <div className="space-y-3">
                <Slider label={t.size} value={design.scale} min={0.35} max={1} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => setD('scale', v)} />
                <Slider label={t.pos} value={design.offset} min={-1} max={1} step={0.05} format={(v) => (v > 0 ? `+${Math.round(v * 100)}` : `${Math.round(v * 100)}`)} onChange={(v) => setD('offset', v)} />
              </div>
            </Group>
          </div>

          <div className="mt-4 border border-line bg-surface p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="label">{t.order}</span>
              <span className="font-mono text-2xs uppercase tracking-tech text-dim">demo</span>
            </div>
            <div className="mt-3 space-y-3">
              <Segmented<Size> value={size} onChange={setSize} options={SIZES.map((id) => ({ id, label: id }))} />
              <Slider label={t.qty} value={qty} min={1} max={100} step={1} format={(v) => `${v} ${t.pcs}`} onChange={setQty} />
            </div>
            <ul className="mt-4 space-y-1.5">
              {price.lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-3 text-[13px] text-muted">
                  <span className="min-w-0">{l.label}</span>
                  <span className="shrink-0 font-mono text-text">{l.value < 0 ? `−${money(-l.value, lang)}` : money(l.value, lang)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
              <span className="font-mono text-[12px] uppercase tracking-tech text-text">{t.total}</span>
              <span className="display text-[1.7rem] leading-none text-accent">{money(price.total, lang)}</span>
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

type Tab = 'garment' | 'colour' | 'text' | 'image' | 'place';
type Swatch = { id: string; hex: string; label: string };

/** the phone layout: an app screen built on the same 3D stage, prints and price list */
function PhoneShirt(p: {
  t: (typeof T)['en'];
  lang: 'en' | 'hu' | 'sk';
  host: React.RefObject<HTMLDivElement | null>;
  state: 'loading' | 'ready' | 'error';
  busy: boolean;
  ready: boolean;
  gender: Gender;
  setGender: (g: Gender) => void;
  garment: Garment;
  setGarment: (g: Garment) => void;
  color: string;
  setColor: (c: string) => void;
  side: Side;
  setSide: (s: Side) => void;
  design: Design;
  setD: <K extends keyof Design>(k: K, v: Design[K]) => void;
  light: LightPreset;
  setLight: (l: LightPreset) => void;
  size: Size;
  setSize: (s: Size) => void;
  qty: number;
  setQty: (n: number) => void;
  price: { lines: { label: string; value: number }[]; total: number };
  frame: (which: 'chest' | 'body') => void;
  save: () => void;
  onFile: (f: File | undefined) => void;
  shirtName: string;
  colors: (list: typeof SHIRTS) => Swatch[];
}) {
  const { t, lang, design, setD } = p;
  const goTo = useGoToSection();
  const [tab, setTab] = useState<Tab>('garment');
  const [sheet, setSheet] = useState(false);
  const [close, setClose] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const fmt = (n: number) => (n < 0 ? `−${money(-n, lang)}` : money(n, lang));

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const nextLight = () => {
    const l = PRESETS[(PRESETS.indexOf(p.light) + 1) % PRESETS.length];
    p.setLight(l);
    setToast(`${t.lighting}: ${t.lights[l]}`);
  };

  const tabs = [
    { id: 'garment' as const, label: t.tabs.garment, icon: <Shirt /> },
    { id: 'colour' as const, label: t.tabs.colour, icon: <Palette /> },
    { id: 'text' as const, label: t.tabs.text, icon: <TextIcon /> },
    { id: 'image' as const, label: t.tabs.image, icon: <ImageIcon /> },
    { id: 'place' as const, label: t.tabs.place, icon: <Move /> },
  ];

  const canvas = (
    <>
      <div ref={p.host} className="absolute inset-0" />
      {(p.state !== 'ready' || p.busy) && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center text-[13px] text-muted">{p.state === 'error' ? t.noGl : t.loading}</div>
      )}
      <div className="absolute left-3 top-3">
        <FloatSeg<Side>
          value={p.side}
          onChange={p.setSide}
          options={[
            { id: 'front', label: t.front },
            { id: 'back', label: t.back },
          ]}
        />
      </div>
      <Toast text={toast} />
      <div className="absolute right-3 top-3 flex flex-col gap-2.5">
        <Fab
          label={close ? t.wider : t.closer}
          onClick={() => {
            p.frame(close ? 'body' : 'chest');
            setClose((v) => !v);
          }}
          disabled={!p.ready}
        >
          {close ? <ZoomOut /> : <Zoom />}
        </Fab>
        <Fab label={t.lightShort} onClick={nextLight} disabled={!p.ready}>
          <Sun />
        </Fab>
        <Fab label={t.saveShort} onClick={p.save} disabled={!p.ready}>
          <Download />
        </Fab>
      </div>
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
            title={t.order}
            sub={`${p.garment === 'tee' ? t.tee : t.hoodie} · ${p.shirtName} · ${p.size} × ${p.qty}`}
            price={money(p.price.total, lang)}
            cta={t.quote}
            onOpen={() => setSheet(true)}
            onCta={goTo('contact')}
          />
        }
      >
        {tab === 'garment' && (
          <>
            <AppSeg<Gender>
              value={p.gender}
              onChange={p.setGender}
              options={[
                { id: 'man', label: t.man },
                { id: 'woman', label: t.woman },
              ]}
            />
            <AppRow className="mt-3">
              <AppCard wide on={p.garment === 'tee'} onClick={() => p.setGarment('tee')} icon={<GarmentIcon kind="tee" color={p.color} />} label={t.tee} sub={money(BASE.tee, lang)} />
              <AppCard wide on={p.garment === 'hoodie'} onClick={() => p.setGarment('hoodie')} icon={<GarmentIcon kind="hoodie" color={p.color} />} label={t.hoodie} sub={money(BASE.hoodie, lang)} />
            </AppRow>
          </>
        )}

        {tab === 'colour' && (
          <>
            <AppDots value={p.color} options={p.colors(SHIRTS)} onChange={p.setColor} custom={t.custom} />
            <AppCaption>
              <b className="font-medium text-text">{p.shirtName}</b>
            </AppCaption>
          </>
        )}

        {tab === 'text' && (
          <>
            <textarea
              value={design.text}
              rows={2}
              maxLength={80}
              placeholder={t.textPh}
              aria-label={`${t.text} · ${p.side === 'front' ? t.front : t.back}`}
              onChange={(e) => setD('text', e.target.value.split('\n').slice(0, 4).join('\n'))}
              className="w-full resize-none rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-[16px] text-text outline-none transition-colors placeholder:text-dim focus:border-accent"
            />
            <div className="app-row -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4">
              {(Object.keys(FONTS) as FontId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setD('font', id)}
                  aria-pressed={design.font === id}
                  aria-label={FONTS[id].label}
                  className={cx(
                    'shrink-0 rounded-full border px-4 py-1.5 text-[17px] leading-tight transition-colors',
                    design.font === id ? 'border-accent bg-accent/10 text-text' : 'border-line bg-surface text-muted',
                  )}
                  style={{ fontFamily: FONTS[id].family, fontWeight: FONTS[id].weight }}
                >
                  Aa <span className="ml-1 text-[12px] font-normal opacity-70" style={{ fontFamily: 'inherit' }}>{FONTS[id].label}</span>
                </button>
              ))}
            </div>
            <div className="mt-2">
              <AppDots value={design.color} options={p.colors(INKS)} onChange={(v) => setD('color', v)} />
            </div>
          </>
        )}

        {tab === 'image' && (
          <>
            <input
              ref={file}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                p.onFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            {design.image ? (
              <div className="flex items-center gap-3">
                <img src={design.image.src} alt="" className="h-[84px] w-[84px] shrink-0 rounded-2xl border border-line bg-[repeating-conic-gradient(rgb(var(--c-line))_0_25%,transparent_0_50%)] bg-[length:14px_14px] object-contain p-1.5" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <button type="button" onClick={() => file.current?.click()} className="flex items-center justify-center gap-2 rounded-full border border-line-strong bg-surface py-2.5 text-[13.5px] text-text">
                    <Upload className="h-4 w-4" /> {t.replace}
                  </button>
                  <button type="button" onClick={() => setD('image', null)} className="flex items-center justify-center gap-2 rounded-full border border-line py-2.5 text-[13.5px] text-muted">
                    <Trash className="h-4 w-4" /> {t.remove}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => file.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line-strong bg-surface py-5 text-text active:scale-[0.99]"
              >
                <Upload className="h-6 w-6 text-accent" />
                <span className="text-[14px] font-medium">{t.upload}</span>
                <span className="text-[12px] text-dim">{t.noImage}</span>
              </button>
            )}
            <AppCaption>{t.imageHint}</AppCaption>
          </>
        )}

        {tab === 'place' && (
          <div className="space-y-3 pt-1">
            <AppRange label={t.size} value={design.scale} min={0.35} max={1} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => setD('scale', v)} />
            <AppRange label={t.pos} value={design.offset} min={-1} max={1} step={0.05} format={(v) => (v > 0 ? `+${Math.round(v * 100)}` : `${Math.round(v * 100)}`)} onChange={(v) => setD('offset', v)} />
            <AppCaption>
              {t.side}: <b className="font-medium text-text">{p.side === 'front' ? t.front : t.back}</b>
            </AppCaption>
          </div>
        )}
      </AppShell>

      {sheet && (
        <AppSheet title={t.order} close={t.closeSheet} onClose={() => setSheet(false)}>
          <p className="mb-2 text-[13px] text-muted">{t.shirtSize}</p>
          <AppSeg<Size> value={p.size} onChange={p.setSize} options={SIZES.map((id) => ({ id, label: id }))} />
          <div className="mb-4 mt-4">
            <AppRange label={t.qty} value={p.qty} min={1} max={100} step={1} format={(v) => `${v} ${t.pcs}`} onChange={p.setQty} />
          </div>
          <AppPrice lines={p.price.lines.map((l) => ({ label: l.label, value: fmt(l.value) }))} total={money(p.price.total, lang)} totalLabel={t.total} note={t.demo} />
          <ConsultCta className="mt-4" />
        </AppSheet>
      )}
    </>
  );
}

/** a T-shirt or a hoodie, drawn in the chosen colour */
function GarmentIcon({ kind, color }: { kind: Garment; color: string }) {
  return (
    <svg viewBox="0 0 64 56" className="h-[52px] w-[60px]" aria-hidden>
      {kind === 'tee' ? (
        <path d="M22 4l-16 8 6 12 6-3v31h28V21l6 3 6-12-16-8c-1.5 4-5.3 6.5-10 6.5S23.5 8 22 4z" fill={color} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M21 9l-14 7 3 30 8-2v8h28v-8l8 2 3-30-14-7" fill={color} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M21 9c0-5 5-8 11-8s11 3 11 8c0 6-5 10-11 10S21 15 21 9z" fill={color} stroke="currentColor" strokeWidth="1.6" />
          <path d="M24 38h16v8H24z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        </>
      )}
    </svg>
  );
}
