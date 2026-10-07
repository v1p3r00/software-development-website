import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useGoToSection } from '../hooks/useGoToSection';
import { Arrow, cx } from '../components/ui';
import { ORDER, SHOTS } from '../components/tools/justiceShots';
import type { Shot, ShotId } from '../components/tools/justiceShots';

const MODEL_URL = '/model/justice.glb';
const FLOOR_Y = -0.94;

const COPY = {
  en: {
    menu: { face: 'Justitia', law: 'Scale', about: 'Full View', contact: 'Contact' },
    shots: {
      face: {
        kicker: '3D model camera study',
        title: 'Justitia',
        body: 'One statue, four viewpoints. The menu does not switch pages here — it sends the camera on a flight around the model.',
      },
      law: {
        kicker: '01 / Law',
        title: 'Weighing it up',
        body: 'Every case starts with two pans. Facts, risks and options are weighed against each other before a decision is made.',
      },
      about: {
        kicker: '02 / About',
        title: 'The whole picture',
        body: 'Step back and the details form a figure. Good advice works the same way: the parts only make sense once you see how they fit together.',
      },
      contact: {
        kicker: '03 / Contact',
        title: 'Get in touch',
        body: 'Want a site like this — your own model, your own story, told by the camera? Ask for a free consultation.',
      },
    },
    cta: 'Free consultation',
    hint: 'Scroll, swipe or use the arrow keys',
    loading: 'Loading the model',
    noGl: 'This browser could not start the 3D view.',
    note: 'Demo content',
  },
  hu: {
    menu: { face: 'Iustitia', law: 'Jog', about: 'Rólunk', contact: 'Kapcsolat' },
    shots: {
      face: {
        kicker: '3D modell kameratanulmány',
        title: 'Iustitia',
        body: 'Egy szobor, négy nézőpont. A menü itt nem oldalt vált, hanem útnak indítja a kamerát a modell körül.',
      },
      law: {
        kicker: '01 / Mérleg',
        title: 'Mérlegelés',
        body: 'Minden ügy két serpenyővel kezdődik. Tényeket, kockázatokat és lehetőségeket mérünk össze, mielőtt döntés születik.',
      },
      about: {
        kicker: '02 / Teljes kép',
        title: 'Az egész kép',
        body: 'Távolabbról a részletekből összeáll az alak. A jó tanács is így működik: a részek akkor kapnak értelmet, ha látszik, hogyan illeszkednek.',
      },
      contact: {
        kicker: '03 / Kapcsolat',
        title: 'Kapcsolat',
        body: 'Ilyen weboldalt szeretnél — saját modellel, saját történettel, amit a kamera mesél el? Kérj ingyenes konzultációt.',
      },
    },
    cta: 'Ingyenes konzultáció',
    hint: 'Görgess, húzd vagy használd a nyilakat',
    loading: 'A modell betöltése',
    noGl: 'Ez a böngésző nem tudta elindítani a 3D nézetet.',
    note: 'Bemutató tartalom',
  },
};

type V3 = THREE.Vector3;
const v = (a: [number, number, number]) => new THREE.Vector3(...a);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (x: number) => x * x * (3 - 2 * x);

/** the shot as it applies to this screen */
function resolve(s: Shot, portrait: boolean) {
  return portrait
    ? { pos: v(s.mobile.pos), target: v(s.mobile.target), fov: s.mobile.fov, frameX: 0, frameY: 0.32, aperture: s.aperture * 0.8 }
    : { pos: v(s.pos), target: v(s.target), fov: s.fov, frameX: s.frame, frameY: 0, aperture: s.aperture };
}
type Pose = ReturnType<typeof resolve>;

/** a soft dark radial texture (floor glow, contact shadow) */
function radialTexture(inner: string, outer: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function CameraStudy() {
  const { lang, t: site } = useI18n();
  const c = COPY[lang];
  const goTo = useGoToSection();
  useSeo({
    title: site.seo.cameraTitle,
    description: site.seo.cameraDescription,
    path: '/camera-study/',
    image: `/og/camera-study.${lang}.png`,
  });

  const host = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const api = useRef<{ fly: (id: ShotId) => void } | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<ShotId>('face');
  const [shown, setShown] = useState<ShotId | null>(null);
  const activeRef = useRef<ShotId>('face');

  const fly = useCallback((id: ShotId) => {
    if (id === activeRef.current) return;
    activeRef.current = id;
    setActive(id);
    setShown(null);
    api.current?.fly(id);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const i = ORDER.indexOf(activeRef.current) + dir;
      if (i >= 0 && i < ORDER.length) fly(ORDER[i]);
    },
    [fly],
  );

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4;
    const useDof = !coarse && !lowEnd;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !useDof, powerPreference: 'high-performance' });
    } catch {
      setState('error');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse || lowEnd ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = new THREE.Color('#0a0a0c');
    scene.background = bg;
    scene.fog = new THREE.Fog(bg, 3.2, 9);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.32;

    // light: warm key from the front right, cool rim from behind, a low fill
    const key = new THREE.SpotLight('#ffe2b8', 9, 9, 0.5, 0.65, 1.2);
    key.position.set(1.6, 2.4, 2.2);
    key.target.position.set(0, 0.1, 0);
    scene.add(key, key.target);
    const rim = new THREE.DirectionalLight('#9fb8ff', 1.6);
    rim.position.set(-1.8, 1.4, -2.2);
    scene.add(rim);
    const rim2 = new THREE.DirectionalLight('#ffd2a0', 0.9);
    rim2.position.set(2.2, 0.6, -1.6);
    scene.add(rim2);
    scene.add(new THREE.HemisphereLight('#3a3d48', '#120d08', 0.6));

    // floor: a dark disc that fades into the fog, with a contact shadow under the base
    const floorTex = radialTexture('rgba(60,52,40,1)', 'rgba(10,10,12,1)');
    const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 64), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55, metalness: 0.25 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y;
    scene.add(floor);
    const shadowTex = radialTexture('rgba(0,0,0,0.85)', 'rgba(0,0,0,0)');
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = FLOOR_Y + 0.002;
    scene.add(shadow);

    // drifting dust: gives depth and catches the light as the camera moves
    const N = coarse ? 260 : 520;
    const dustPos = new Float32Array(N * 3);
    const seeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 3.6;
      dustPos[i * 3 + 1] = FLOOR_Y + Math.random() * 2.6;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 3.6;
      seeds[i] = Math.random() * 100;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.006,
      map: radialTexture('rgba(255,236,200,1)', 'rgba(255,236,200,0)'),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 30);

    // post: depth of field on capable desktops
    let composer: EffectComposer | null = null;
    let bokeh: BokehPass | null = null;
    if (useDof) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bokeh = new BokehPass(scene, camera, { focus: 1, aperture: 0.01, maxblur: 0.006 });
      composer.addPass(bokeh);
      composer.addPass(new OutputPass());
    }

    // camera state
    let W = 1;
    let H = 1;
    let portrait = false;
    let pose: Pose = resolve(SHOTS.face, false);
    const cur = { pos: pose.pos.clone(), target: pose.target.clone(), fov: pose.fov, frameX: pose.frameX, frameY: pose.frameY, aperture: pose.aperture };
    let flight: { from: typeof cur; to: Pose; ctrl: V3; t0: number; dur: number; id: ShotId } | null = null;
    // the opening move: a slow push-in on the face once the model is ready
    let intro: { t0: number; dur: number } | null = null;

    const resize = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      if (!W || !H) return;
      renderer.setSize(W, H, false);
      composer?.setSize(W, H);
      camera.aspect = W / H;
      const p = W / H < 0.9;
      if (p !== portrait) {
        portrait = p;
        pose = resolve(SHOTS[activeRef.current], portrait);
        if (!flight) Object.assign(cur, { pos: pose.pos.clone(), target: pose.target.clone(), fov: pose.fov, frameX: pose.frameX, frameY: pose.frameY, aperture: pose.aperture });
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    /** a curved path that swings outward around the statue instead of cutting through it */
    const controlPoint = (a: V3, b: V3) => {
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const flat = new THREE.Vector2(mid.x, mid.z);
      const r = Math.max(Math.hypot(a.x, a.z), Math.hypot(b.x, b.z));
      if (flat.length() < 0.001) flat.set(1, 1);
      flat.setLength(r * 1.18 + 0.22);
      return new THREE.Vector3(flat.x, Math.max(a.y, b.y) + 0.12, flat.y);
    };

    api.current = {
      fly: (id) => {
        const to = resolve(SHOTS[id], portrait);
        if (reduced) {
          Object.assign(cur, { pos: to.pos.clone(), target: to.target.clone(), fov: to.fov, frameX: to.frameX, frameY: to.frameY, aperture: to.aperture });
          flight = null;
          pose = to;
          setShown(id);
          return;
        }
        const from = { pos: cur.pos.clone(), target: cur.target.clone(), fov: cur.fov, frameX: cur.frameX, frameY: cur.frameY, aperture: cur.aperture };
        const dist = from.pos.distanceTo(to.pos);
        flight = { from, to, ctrl: controlPoint(from.pos, to.pos), t0: performance.now(), dur: Math.min(3600, Math.max(2200, 1700 + dist * 650)), id };
        intro = null;
      },
    };

    // pointer parallax, eased
    const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e: PointerEvent) => {
      ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);

    const tmp = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    const anchor = new THREE.Vector3();
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let shownSet = true;

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = now / 1000;

      if (flight) {
        const k = Math.min(1, (now - flight.t0) / flight.dur);
        const e = easeInOut(k);
        const f = flight.from;
        const to = flight.to;
        // position along a quadratic curve; the gaze leads slightly so the camera turns into the move
        const a = f.pos;
        const b = flight.ctrl;
        const p2 = to.pos;
        const u = 1 - e;
        cur.pos.set(u * u * a.x + 2 * u * e * b.x + e * e * p2.x, u * u * a.y + 2 * u * e * b.y + e * e * p2.y, u * u * a.z + 2 * u * e * b.z + e * e * p2.z);
        const et = easeInOut(Math.min(1, k * 1.12));
        cur.target.lerpVectors(f.target, to.target, et);
        cur.fov = THREE.MathUtils.lerp(f.fov, to.fov, e);
        cur.frameX = THREE.MathUtils.lerp(f.frameX, to.frameX, e);
        cur.frameY = THREE.MathUtils.lerp(f.frameY, to.frameY, e);
        // focus pulls during the move: the blur eases off mid-flight and settles on the new subject
        cur.aperture = THREE.MathUtils.lerp(f.aperture, to.aperture, e) * (1 - 0.7 * Math.sin(Math.PI * e));
        if (k > 0.72 && !shownSet) {
          shownSet = true;
          setShown(flight.id);
        }
        if (k >= 1) {
          pose = to;
          flight = null;
        }
      } else if (intro) {
        const k = Math.min(1, (now - intro.t0) / intro.dur);
        const e = smooth(smooth(k));
        // start further back and slightly higher, settle on the face
        const back = 1 - e;
        cur.pos.copy(pose.pos).addScaledVector(tmp.subVectors(pose.pos, pose.target).normalize(), back * 0.55);
        cur.pos.y += back * 0.12;
        cur.target.copy(pose.target);
        cur.aperture = pose.aperture * e;
        if (k >= 1) intro = null;
      }
      if (flight && shownSet && (now - flight.t0) / flight.dur < 0.72) shownSet = false;

      // breathing drift and pointer parallax, scaled by distance so close-ups stay calm
      ptr.sx += (ptr.x - ptr.sx) * Math.min(1, dt * 2.5);
      ptr.sy += (ptr.y - ptr.sy) * Math.min(1, dt * 2.5);
      const dist = cur.pos.distanceTo(cur.target);
      camera.position.copy(cur.pos);
      camera.lookAt(cur.target);
      right.setFromMatrixColumn(camera.matrix, 0);
      up.setFromMatrixColumn(camera.matrix, 1);
      const drift = reduced ? 0 : 1;
      camera.position
        .addScaledVector(right, (Math.sin(time * 0.23) * 0.012 + ptr.sx * 0.035) * dist * drift)
        .addScaledVector(up, (Math.sin(time * 0.31) * 0.008 - ptr.sy * 0.022) * dist * drift);
      camera.lookAt(cur.target);
      camera.fov = cur.fov;
      // composition: shift the frame so the subject sits off-centre, leaving room for the text
      camera.setViewOffset(W, H, (-cur.frameX * W) / 2, (cur.frameY * H) / 2, W, H);
      camera.updateProjectionMatrix();

      // dust drifts slowly upward and sideways
      const pos = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < N; i++) {
        let y = pos.getY(i) + dt * 0.012;
        if (y > FLOOR_Y + 2.6) y = FLOOR_Y;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(time * 0.2 + seeds[i]) * dt * 0.004);
      }
      pos.needsUpdate = true;

      if (bokeh && composer) {
        (bokeh.uniforms as Record<string, THREE.IUniform>).focus.value = camera.position.distanceTo(cur.target);
        (bokeh.uniforms as Record<string, THREE.IUniform>).aperture.value = cur.aperture;
        composer.render();
      } else renderer.render(scene, camera);

      // pin the text panel next to the subject
      const pnl = panel.current;
      if (pnl) {
        if (portrait) {
          pnl.style.transform = '';
        } else {
          const s = SHOTS[activeRef.current];
          anchor.set(...s.anchor).project(camera);
          const x = (anchor.x * 0.5 + 0.5) * W;
          const y = (-anchor.y * 0.5 + 0.5) * H;
          const pw = pnl.offsetWidth;
          const ph = pnl.offsetHeight;
          let px = s.side === 'left' ? x - pw - 56 : x + 56;
          let py = y - ph / 2;
          px = Math.max(32, Math.min(W - pw - 32, px));
          py = Math.max(96, Math.min(H - ph - 120, py));
          pnl.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
        }
      }

      if (visible) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    // pause off screen / hidden tab
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden;
      if (visible) start();
    });
    io.observe(el);
    const onVis = () => {
      visible = !document.hidden;
      if (visible) start();
    };
    document.addEventListener('visibilitychange', onVis);

    // the model
    let model: THREE.Object3D | null = null;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    let cancelled = false;
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (cancelled) return;
        model = gltf.scene;
        model.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            const mat = m.material as THREE.MeshStandardMaterial;
            mat.envMapIntensity = 1;
          }
        });
        scene.add(model);
        pose = resolve(SHOTS.face, portrait);
        Object.assign(cur, { pos: pose.pos.clone(), target: pose.target.clone(), fov: pose.fov, frameX: pose.frameX, frameY: pose.frameY, aperture: 0 });
        if (!reduced) intro = { t0: performance.now(), dur: 3200 };
        setState('ready');
        window.setTimeout(() => !cancelled && activeRef.current === 'face' && setShown('face'), reduced ? 0 : 1400);
        start();
      },
      (e) => e.total && setProgress(e.loaded / e.total),
      () => !cancelled && setState('error'),
    );
    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      model?.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry.dispose();
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.map?.dispose();
        mat.normalMap?.dispose();
        mat.roughnessMap?.dispose();
        mat.dispose();
      });
      dustGeo.dispose();
      dustMat.map?.dispose();
      dustMat.dispose();
      floorTex.dispose();
      shadowTex.dispose();
      env.dispose();
      pmrem.dispose();
      composer?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
  }, []);

  // wheel, keys and swipes step through the shots
  useEffect(() => {
    let lock = 0;
    const go = (dir: 1 | -1) => {
      const now = Date.now();
      if (now < lock) return;
      lock = now + 1400;
      step(dir);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 12) return;
      e.preventDefault();
      go(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') go(1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1);
    };
    let ty = 0;
    let tx = 0;
    const onTouchStart = (e: TouchEvent) => {
      ty = e.touches[0].clientY;
      tx = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = ty - e.changedTouches[0].clientY;
      const dx = tx - e.changedTouches[0].clientX;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 50) return;
      go((Math.abs(dy) > Math.abs(dx) ? dy : dx) > 0 ? 1 : -1);
    };
    const el = host.current;
    el?.addEventListener('wheel', onWheel, { passive: false });
    el?.addEventListener('touchstart', onTouchStart, { passive: true });
    el?.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      el?.removeEventListener('wheel', onWheel);
      el?.removeEventListener('touchstart', onTouchStart);
      el?.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [step]);

  const shot = shown ? c.shots[shown] : null;
  const idx = ORDER.indexOf(active);

  return (
    <section id="camera-study" className="relative h-[100svh] w-full overflow-hidden bg-[#0a0a0c] text-[#f1ece4]">
      <h1 className="sr-only">{lang === 'hu' ? '3D modell kameratanulmány' : '3D Model Camera Study'}</h1>
      <div ref={host} className="absolute inset-0" aria-hidden />

      {/* vignette and film grain feel */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(0,0,0,0.55)_100%)]" />

      {/* loader */}
      <div
        className={cx(
          'pointer-events-none absolute inset-0 grid place-items-center bg-[#0a0a0c] transition-opacity duration-1000',
          state === 'ready' ? 'opacity-0' : 'opacity-100',
        )}
      >
        <div className="w-56 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#b9ad98]">{state === 'error' ? c.noGl : c.loading}</div>
          {state !== 'error' && (
            <div className="mt-4 h-px w-full bg-white/10">
              <div className="h-px bg-[#d8b77a] transition-[width] duration-300" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* the text that travels with the camera */}
      <div
        ref={panel}
        className={cx(
          'absolute z-10 transition-[opacity,filter] duration-700 ease-out',
          'inset-x-4 bottom-28 [@media(min-aspect-ratio:9/10)]:inset-x-auto [@media(min-aspect-ratio:9/10)]:bottom-auto [@media(min-aspect-ratio:9/10)]:left-0 [@media(min-aspect-ratio:9/10)]:top-0 [@media(min-aspect-ratio:9/10)]:w-[min(380px,40vw)]',
          '[@media(max-aspect-ratio:9/10)]:!transform-none',
          shot ? 'opacity-100 blur-0' : 'pointer-events-none opacity-0 blur-[6px]',
        )}
        aria-live="polite"
      >
        {shot && (
          <div key={shown} className="border-l border-[#d8b77a]/60 bg-black/40 py-1 pl-5 pr-4 backdrop-blur-[3px] sm:bg-[#0a0a0c]/45 sm:py-6 sm:pl-6 sm:pr-7 [@media(max-height:640px)]:sm:py-4 sm:backdrop-blur-md [text-shadow:0_1px_12px_rgba(0,0,0,.55)]">
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#d8b77a]">{shot.kicker}</div>
            <h2 className="mt-3 font-serif text-[clamp(2rem,4.4vw,3.6rem)] [@media(max-height:640px)]:mt-2 [@media(max-height:640px)]:text-[1.9rem] font-light italic leading-[0.95] tracking-tight">{shot.title}</h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-[#d9d2c6] sm:text-[15.5px] [@media(max-height:640px)]:mt-2 [@media(max-height:640px)]:text-[13.5px]">{shot.body}</p>
            {shown === 'contact' && (
              <a
                href="/#contact"
                onClick={goTo('contact')}
                data-cursor="follow"
                className="group mt-6 inline-flex items-center gap-3 border border-[#d8b77a] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.2em] text-[#f1ece4] transition-colors hover:bg-[#d8b77a] hover:text-[#0a0a0c]"
              >
                {c.cta}
                <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* menu */}
      <nav
        aria-label={lang === 'hu' ? 'Kameraállások' : 'Camera positions'}
        className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0a0a0c]/85 via-[#0a0a0c]/40 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-20 sm:pb-8"
      >
        <div className="mx-auto w-fit">
          <ul className="flex items-end gap-1 sm:gap-2">
            {ORDER.map((id, i) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => fly(id)}
                  aria-current={active === id ? 'step' : undefined}
                  data-cursor="follow"
                  className={cx(
                    'group relative px-3 pb-3 pt-2 text-left transition-colors sm:px-5',
                    active === id ? 'text-[#f1ece4]' : 'text-[#f1ece4]/45 hover:text-[#f1ece4]/85',
                  )}
                >
                  <span className="block font-mono text-[10px] tracking-[0.25em] text-[#d8b77a]/80">0{i}</span>
                  <span className="mt-1 block font-serif text-[17px] italic sm:text-[20px]">{c.menu[id]}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="relative mx-3 h-px bg-white/15 sm:mx-5">
            <div
              className="absolute inset-y-0 left-0 bg-[#d8b77a] transition-[width] duration-[1800ms] ease-[cubic-bezier(.65,0,.35,1)]"
              style={{ width: `${(idx / (ORDER.length - 1)) * 100}%` }}
            />
          </div>
        </div>
        <div className="mt-3 hidden text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/35 sm:block">{c.hint}</div>
      </nav>

      <div className="pointer-events-none absolute bottom-8 right-6 z-20 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 lg:block">{c.note}</div>
    </section>
  );
}
