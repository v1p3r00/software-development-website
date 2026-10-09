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

  const design = designs[side];
  const setD = <K extends keyof Design>(k: K, v: Design[K]) => setDesigns((d) => ({ ...d, [side]: { ...d[side], [k]: v } }));

  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const models = useRef<Partial<Record<ModelId, THREE.Object3D>>>({});
  const rig = useRef<LightRig | null>(null);
  const uni = useRef<ShirtUniforms | null>(null);
  const canvases = useRef<Record<Side, HTMLCanvasElement> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // stage, lights and the print textures
  useEffect(() => {
    const el = host.current;
    if (!el) return;
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
    };
  }, []);

  // background follows the theme
  useEffect(() => {
    const s = stage.current;
    if (!s) return;
    s.scene.background = new THREE.Color(theme === 'dark' ? '#17191c' : '#e9e7e2');
    s.render();
  }, [theme, state]);

  // load (once) and show the chosen model
  const [modelReady, setModelReady] = useState<ModelId | null>(null);
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
  const framed = useRef(false);
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
            onClick={() => stage.current && download(stage.current.snapshot(), lang === 'hu' ? (garment === 'tee' ? 'polo-mockup.png' : 'pulover-mockup.png') : lang === 'sk' ? (garment === 'tee' ? 'tricko-mockup.png' : 'mikina-mockup.png') : `${garment === 'tee' ? 'tshirt' : 'hoodie'}-mockup.png`)}
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
