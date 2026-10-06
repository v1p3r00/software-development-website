import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePrefersReducedMotion } from '../hooks/useMisc';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../i18n';
import { CornerMarks, cx } from './ui';

/**
 * The hero figure: a glTF model rendered with three.js. It turns on its own,
 * can be dragged to rotate, and opens into a full-screen inspector on click.
 * Equations orbit the head, cycling in and out of a larger pool, drawn on a 2D
 * canvas above the WebGL one so the type stays crisp.
 *
 * Lighting follows the site theme: in dark mode a low-key room where the laptop
 * screen lights the figure's face; in light mode soft overcast daylight with a
 * diffuse contact shadow.
 *
 * three and the model load lazily, after first paint, so neither blocks the page.
 */
const MODEL_URL = '/model/programmer.glb';

const POOL = [
  'e^iπ + 1 = 0', 'a² + b² = c²', '∑ 1/n² = π²/6', '∫ f(x) dx', '∂f/∂x', 'λ = c/f',
  'O(n log n)', '√2 ≈ 1.41421', 'φ = (1+√5)/2', 'E = mc²', '∇ · E = ρ/ε₀', 'lim x→∞',
  'P(A|B) = P(B|A)P(A)/P(B)', 'x = (-b ± √Δ)/2a', 'i² = -1', 'n! = n(n-1)!',
  'Σ aᵢxᵢ = b', 'f(x) = ax + b', 'A ∪ B', 'det(A) ≠ 0', 'θ = arctan(y/x)',
  'σ² = E[(X-μ)²]', 'dy/dx = 0', '2^10 = 1024', 'ε > 0 ∃δ', 'Ω(n) ≤ T(n)',
];

const SLOTS = 8;
const FADE_IN = 900;
const FADE_OUT = 1100;

interface Slot {
  text: string;
  phase: number;
  y: number;
  r: number;
  born: number;
  life: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function spawn(now: number, taken: Set<string>, first = false): Slot {
  let text = POOL[Math.floor(Math.random() * POOL.length)];
  for (let i = 0; i < 12 && taken.has(text); i++) text = POOL[Math.floor(Math.random() * POOL.length)];
  return {
    text,
    phase: rand(0, Math.PI * 2),
    y: rand(-0.22, 0.24),
    r: rand(0.62, 1.02),
    born: first ? now - rand(0, 6000) : now,
    life: rand(5200, 9400),
  };
}

function readAccent(): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim();
  const parts = v.split(/\s+/).map(Number);
  return parts.length === 3 && parts.every(Number.isFinite)
    ? (parts as [number, number, number])
    : [255, 95, 31];
}

type Mode = 'dark' | 'light';

/** Devices that should not spend a GPU on a decorative figure at all. */
function isLowEnd() {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    (nav.deviceMemory ?? 8) <= 2 ||
    (nav.hardwareConcurrency ?? 8) <= 2 ||
    nav.connection?.saveData === true
  );
}

/** Touch-first, usually phone/tablet GPUs: render lighter. */
const isCoarse = () => window.matchMedia?.('(pointer: coarse)').matches ?? false;

/** Idle turn is slow, so 30 fps reads the same and halves the GPU work. */
const IDLE_FRAME_MS = 1000 / 30;

/** A small dark-theme code editor, drawn once, used as the laptop's display. */
function drawEditor(THREE: typeof import('three')) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 420;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0d1422';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#16213a';
  g.fillRect(0, 0, c.width, 34); // tab bar
  g.fillRect(0, 34, 44, c.height); // gutter
  g.fillStyle = '#0d1422';
  g.fillRect(52, 6, 130, 28); // active tab
  const palette = ['#7aa2ff', '#c3e88d', '#ff9e64', '#bb9af7', '#89ddff', '#e0e6f0'];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let row = 0, y = 52; y < c.height - 12; row++, y += 19) {
    g.fillStyle = '#3b4a6b';
    g.fillRect(14, y, 18, 7); // line number
    let x = 60 + (row % 5 === 0 ? 0 : 22 * (1 + Math.floor(rnd() * 3)));
    const words = 1 + Math.floor(rnd() * 5);
    for (let w = 0; w < words && x < c.width - 30; w++) {
      const len = 18 + Math.floor(rnd() * 70);
      g.fillStyle = palette[Math.floor(rnd() * palette.length)];
      g.fillRect(x, y, len, 7);
      x += len + 10;
    }
  }
  g.fillStyle = '#7aa2ff';
  g.fillRect(60, 52 + 19 * 9, 3, 12); // cursor
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

interface Stage {
  el: HTMLDivElement;
  setMode: (mode: Mode) => void;
  setZoom: (distance: number) => void;
  zoomBy: (delta: number) => void;
  resetView: () => void;
}

export default function HeroModel({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const inlineHost = useRef<HTMLDivElement>(null);
  const modalHost = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const reduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const themeRef = useRef<Mode>(theme);
  themeRef.current = theme;
  const [ready, setReady] = useState(false);
  const [inspect, setInspect] = useState(false);

  const INLINE_DISTANCE = 4.2;
  const INSPECT_DISTANCE = 4.6;
  /** closest zoom, and the distance at which the aim starts moving to the face */
  const MIN_DISTANCE = 1.5;
  const FACE_FROM = 4.2;

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const coarse = isCoarse();
    const dpr = window.devicePixelRatio || 1;
    const pixelRatio = Math.min(coarse ? 1.25 : 1.5, dpr);

    const start = async () => {
      const THREE = await import('three');
      const [{ GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
        import('three/examples/jsm/environments/RoomEnvironment.js'),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        // MSAA only where pixels are big enough to need it; on dense screens it
        // multiplies fill cost for no visible gain
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: !coarse && dpr < 1.5,
          powerPreference: 'low-power',
        });
      } catch {
        return; // no WebGL: the hero simply goes without the model
      }
      renderer.setPixelRatio(pixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap; // honours shadow.radius, for a soft overcast shadow

      // one stage, moved between the hero and the inspector, so the model and
      // its GPU resources are only ever created once
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;inset:0;touch-action:none;';
      const overlay = document.createElement('canvas');
      overlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
      el.append(renderer.domElement, overlay);
      const octx = overlay.getContext('2d');

      const scene = new THREE.Scene();
      const pivot = new THREE.Group();
      scene.add(pivot);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      let distance = INLINE_DISTANCE;
      let targetDistance = INLINE_DISTANCE;
      let elevation = 0.15;

      let accent = readAccent();

      const hemi = new THREE.HemisphereLight(0xc8d2e0, 0x0a0a0c, 1.1);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.shadow.mapSize.set(coarse ? 512 : 1024, coarse ? 512 : 1024);
      key.shadow.camera.left = -1.6;
      key.shadow.camera.right = 1.6;
      key.shadow.camera.top = 1.6;
      key.shadow.camera.bottom = -1.6;
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 14;
      key.shadow.bias = -0.0004;
      key.shadow.normalBias = 0.025;
      key.shadow.radius = coarse ? 4 : 6;
      key.shadow.blurSamples = 8;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x9fb0c8, 0.5);
      scene.add(fill);
      const glow = new THREE.PointLight(0xffffff, 6, 6, 2);
      glow.position.set(0.25, -0.1, 1.1);
      scene.add(glow);

      // the laptop screen, as a cool spot aimed up at the face; it lives in the
      // pivot so it turns with the figure. Positions are in the model's
      // normalised space (figure faces +z, 2 units tall).
      const SCREEN_LIGHT = 4.2;
      const screen = new THREE.SpotLight(0xa9c9ff, SCREEN_LIGHT, 2.4, 0.75, 0.9, 1.6);
      screen.position.set(-0.148, 0.18, 0.553);
      screen.target.position.set(-0.09, 0.72, 0.1);
      pivot.add(screen, screen.target);

      // the display itself: a glowing panel laid over the lid, showing an editor
      // lid plane, measured by ray-casting the model: tilted ~25° back, yawed slightly
      const lidFace = new THREE.Vector3(0.108, 0.419, -0.901).normalize(); // out of the display, towards the face
      const lidEdge = new THREE.Vector3(0.993, 0, 0.119).normalize(); // along the hinge
      const lidUp = new THREE.Vector3().crossVectors(lidEdge, lidFace).normalize(); // hinge to top
      const display = new THREE.Mesh(
        new THREE.PlaneGeometry(0.45, 0.3),
        new THREE.MeshBasicMaterial({ map: drawEditor(THREE), toneMapped: false }),
      );
      display.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(lidUp, lidFace), lidUp, lidFace),
      );
      display.position.set(-0.153, 0.16, 0.598).addScaledVector(lidUp, 0.012).addScaledVector(lidFace, 0.006);
      pivot.add(display);

      // a floor that only shows the shadow the sun casts, to ground the figure
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 8),
        new THREE.ShadowMaterial({ color: 0x1a1210, opacity: 0.14 }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // soft sky reflections for the daylight look, built on first use
      let daylightEnv: InstanceType<typeof THREE.Texture> | null = null;
      const pmrem = new THREE.PMREMGenerator(renderer);

      let light = false;
      const setMode = (mode: Mode) => {
        accent = readAccent();
        light = mode === 'light';
        if (light) {
          // overcast: a bright, even sky, the sun lost behind cloud overhead
          renderer.toneMappingExposure = 1.0;
          hemi.color.set(0xeef2f7);
          hemi.groundColor.set(0xb9b6ae);
          hemi.intensity = 2.3;
          key.color.set(0xf2f5fa);
          key.intensity = 1.0;
          key.position.set(0.4, 6, 1.2);
          key.castShadow = true;
          fill.color.set(0xdfe6ef);
          fill.intensity = 0.55;
          fill.position.set(2.8, 1.6, -2.4);
          glow.intensity = 0;
          screen.visible = false;
          (display.material as InstanceType<typeof THREE.MeshBasicMaterial>).color.setScalar(0.72); // screen, in daylight
          floor.visible = true;
          (floor.material as InstanceType<typeof THREE.ShadowMaterial>).opacity = 0.16;
          if (!daylightEnv) daylightEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          scene.environment = daylightEnv;
          scene.environmentIntensity = 0.85;
        } else {
          // a dim room: the laptop screen does most of the work on the face
          renderer.toneMappingExposure = 1.15;
          hemi.color.set(0xa9b6c8);
          hemi.groundColor.set(0x0a0a0c);
          hemi.intensity = 0.55;
          key.color.set(0xdfe6f0);
          key.intensity = 1.1;
          key.position.set(-2.5, 3.2, -1.6); // behind, as a rim
          key.castShadow = false;
          fill.color.set(0x9fb0c8);
          fill.intensity = 0.35;
          fill.position.set(2.6, 0.8, -2.2);
          glow.color.setRGB(accent[0] / 255, accent[1] / 255, accent[2] / 255);
          glow.intensity = 1.2;
          screen.visible = true;
          (display.material as InstanceType<typeof THREE.MeshBasicMaterial>).color.setScalar(1.25); // lit, in the dark
          floor.visible = false;
          scene.environment = null;
        }
      };


      const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(MODEL_URL);
      if (disposed) {
        renderer.dispose();
        return;
      }

      const model = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const centre = new THREE.Vector3();
      bounds.getSize(size);
      bounds.getCenter(centre);
      const unit = 2 / Math.max(size.x, size.y, size.z);
      model.position.sub(centre);
      model.scale.setScalar(unit);
      model.position.multiplyScalar(unit);
      model.traverse((obj) => {
        const mesh = obj as InstanceType<typeof THREE.Mesh>;
        if (mesh.isMesh) {
          // only the floor receives: self-shadowing every mesh means a soft
          // shadow-map lookup per pixel of the whole figure, every frame
          mesh.castShadow = true;
          mesh.receiveShadow = false;
        }
      });
      pivot.add(model);

      // where the face is: the centre of the highest slice of the figure,
      // in the pivot's own space (measured before the pivot is turned)
      const face = new THREE.Vector3(0, (bounds.max.y - centre.y) * unit - 0.22, 0);
      {
        pivot.updateMatrixWorld(true);
        const top = (bounds.max.y - centre.y) * unit;
        const v = new THREE.Vector3();
        const sum = new THREE.Vector3();
        let n = 0;
        model.traverse((obj) => {
          const mesh = obj as InstanceType<typeof THREE.Mesh>;
          const pos = mesh.isMesh ? mesh.geometry?.attributes?.position : undefined;
          if (!pos) return;
          const step = Math.max(1, Math.floor(pos.count / 4000));
          for (let i = 0; i < pos.count; i += step) {
            v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
            if (v.y > top - 0.32) {
              sum.add(v);
              n++;
            }
          }
        });
        if (n) face.copy(sum.divideScalar(n));
        face.y -= 0.1; // below the crown: eyes rather than hair
      }
      const faceWorld = new THREE.Vector3();
      const look = new THREE.Vector3();
      pivot.rotation.y = 0.35;
      floor.position.y = (bounds.min.y - centre.y) * unit;
      setMode(themeRef.current);

      const headY = (bounds.max.y - centre.y) * unit + 0.12;
      const orbitCentre = new THREE.Vector3(0, headY, 0);
      const probe = new THREE.Vector3();

      let w = 0;
      let h = 0;
      const resize = () => {
        const rect = el.getBoundingClientRect();
        w = Math.max(1, rect.width);
        h = Math.max(1, rect.height);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        overlay.width = Math.round(w * pixelRatio);
        overlay.height = Math.round(h * pixelRatio);
        octx?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      /* ---- drag to rotate ---- */
      let dragging = false;
      let pointerId = -1;
      let lastX = 0;
      let lastY = 0;
      let spin = 0; // extra rotation contributed by dragging
      let velocity = 0;

      const down = (e: PointerEvent) => {
        dragging = true;
        pointerId = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
        velocity = 0;
        el.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!dragging || e.pointerId !== pointerId) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        spin += dx * 0.008;
        velocity = dx * 0.008;
        elevation = Math.max(-0.6, Math.min(1.1, elevation + dy * 0.004));
      };
      const up = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        dragging = false;
        pointerId = -1;
      };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);

      const wheel = (e: WheelEvent) => {
        e.preventDefault();
        targetDistance = Math.max(MIN_DISTANCE, Math.min(6.5, targetDistance + e.deltaY * 0.0022));
      };
      el.addEventListener('wheel', wheel, { passive: false });

      let orbit = 0;
      let raf = 0;
      let last = performance.now();
      let lastDrawn = 0;
      let solved = 0;
      const slots: Slot[] = [];
      for (let i = 0; i < SLOTS; i++) slots.push(spawn(last, new Set(slots.map((s) => s.text)), true));
      // reused every frame, so the loop allocates nothing
      const head = new THREE.Vector3();
      const projected = new THREE.Vector3();
      const placed = Array.from({ length: SLOTS }, () => ({ slot: slots[0], x: 0, y: 0, depth: 0, life: 0 }));
      const byDepth = (m: (typeof placed)[number], n: (typeof placed)[number]) => m.depth - n.depth;
      const takenTexts = () => new Set(slots.map((s) => s.text)); // only on a respawn, a few times a minute

      // run only while the figure is on screen and the tab is visible
      let onScreen = false;
      let running = false;
      const resume = () => {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };
      const pause = () => {
        running = false;
        cancelAnimationFrame(raf);
      };
      const sync = () => (onScreen && !document.hidden ? resume() : pause());
      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      });
      io.observe(el);
      document.addEventListener('visibilitychange', sync);

      const frame = (now: number) => {
        if (!running) return;
        raf = requestAnimationFrame(frame);
        // full rate while someone is handling it, half rate for the idle turn
        const interactive = dragging || Math.abs(velocity) > 1e-4 || Math.abs(targetDistance - distance) > 1e-3 || el.parentElement === modalHost.current;
        if (!interactive && now - lastDrawn < IDLE_FRAME_MS - 2) return;
        lastDrawn = now;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        if (!dragging) {
          // let a flick carry on for a moment, then fall back to the idle turn
          spin += velocity;
          velocity *= 0.94;
          if (!reduced) spin += dt * 0.3;
        }
        if (!reduced) orbit += dt * 0.45;
        pivot.rotation.y = 0.35 + spin;
        // the odd shift in what is on screen, so the glow is not dead still
        if (screen.visible && !reduced) {
          screen.intensity = SCREEN_LIGHT * (0.93 + 0.05 * Math.sin(now / 900) + 0.02 * Math.sin(now / 137));
        }

        distance += (targetDistance - distance) * Math.min(1, dt * 6);
        // zooming in drifts the aim from the figure's middle to its face
        const zoom = Math.min(1, Math.max(0, (FACE_FROM - distance) / (FACE_FROM - MIN_DISTANCE)));
        const ease = zoom * zoom * (3 - 2 * zoom);
        pivot.updateMatrixWorld();
        faceWorld.copy(face).applyMatrix4(pivot.matrixWorld);
        look.set(0, elevation * 0.25, 0).lerp(faceWorld, ease);
        camera.position.set(look.x, look.y + (elevation - elevation * 0.25) * (1 - ease * 0.7), look.z + distance);
        camera.lookAt(look);
        renderer.render(scene, camera);

        if (octx && w && h) {
          octx.clearRect(0, 0, w, h);
          const fontSize = Math.max(9, Math.min(21, Math.round(h / 38)));
          octx.font = `${light ? 600 : 400} ${fontSize}px "JetBrains Mono Variable", ui-monospace, monospace`;
          octx.textAlign = 'center';
          octx.textBaseline = 'middle';

          head.copy(orbitCentre).project(camera);
          const hx = ((head.x + 1) / 2) * w;
          const hy = ((1 - head.y) / 2) * h;

          for (let index = 0; index < SLOTS; index++) {
            if (!reduced && now - slots[index].born > slots[index].life) {
              solved += 1;
              slots[index] = spawn(now, takenTexts());
            }
            const current = slots[index];
            const a = current.phase + orbit + pivot.rotation.y;
            probe.set(Math.cos(a) * current.r, headY + current.y, Math.sin(a) * current.r);
            projected.copy(probe).project(camera);
            const age = now - current.born;
            const e = placed[index];
            e.slot = current;
            e.x = ((projected.x + 1) / 2) * w;
            e.y = ((1 - projected.y) / 2) * h;
            e.depth = probe.z;
            e.life = reduced ? 1 : Math.min(age / FADE_IN, Math.max(0, (current.life - age) / FADE_OUT), 1);
          }
          placed.sort(byDepth);

          for (const e of placed) {
            const depthFade = Math.min(1, Math.max(0, (e.depth + 0.95) / 1.7));
            // on white, the far side of the orbit has to stay readable too
            const alpha = (light ? 0.5 + 0.5 * depthFade : depthFade) * e.life;
            if (alpha <= 0.04) continue;
            octx.strokeStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / ${((light ? 0.3 : 0.13) * alpha).toFixed(3)})`;
            octx.setLineDash([2, 4]);
            octx.lineWidth = 1;
            octx.beginPath();
            octx.moveTo(hx, hy);
            octx.lineTo(e.x, e.y);
            octx.stroke();
            octx.setLineDash([]);
            if (light) {
              // a paper-white halo keeps the type legible over the photograph
              octx.lineJoin = 'round';
              octx.lineWidth = 4;
              octx.strokeStyle = `rgb(255 255 255 / ${(0.7 * alpha).toFixed(3)})`;
              octx.strokeText(e.slot.text, e.x, e.y);
            }
            octx.fillStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / ${(Math.min(1, light ? 1.1 : 0.9) * alpha).toFixed(3)})`;
            octx.fillText(e.slot.text, e.x, e.y);
          }

          const small = Math.max(8, Math.round(fontSize * 0.68));
          octx.font = `${small}px "JetBrains Mono Variable", ui-monospace, monospace`;
          octx.textAlign = 'right';
          octx.fillStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / ${light ? 0.95 : 0.75})`;
          octx.fillText(`SOLVED ${String(solved).padStart(4, '0')}`, w - 10, small + 6);
        }
      };

      stageRef.current = {
        el,
        setMode,
        setZoom: (d) => {
          targetDistance = d;
        },
        zoomBy: (d) => {
          targetDistance = Math.max(MIN_DISTANCE, Math.min(6.5, targetDistance + d));
        },
        resetView: () => {
          elevation = 0.15;
          spin = 0.0;
          velocity = 0;
        },
      };
      inlineHost.current?.appendChild(el);
      resize();
      setReady(true);

      cleanup = () => {
        pause();
        io.disconnect();
        document.removeEventListener('visibilitychange', sync);
        ro.disconnect();
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.removeEventListener('wheel', wheel);
        scene.traverse((obj) => {
          const mesh = obj as InstanceType<typeof THREE.Mesh>;
          if (mesh.isMesh) {
            mesh.geometry?.dispose();
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const m of mats) m?.dispose?.();
          }
        });
        daylightEnv?.dispose();
        pmrem.dispose();
        renderer.dispose();
        el.remove();
        stageRef.current = null;
      };
    };

    if (isLowEnd()) return; // decorative only: low-memory / data-saver devices skip it

    // download and build only once the hero is (nearly) in view, then on idle
    const canIdle = typeof window.requestIdleCallback === 'function';
    let idle = 0;
    const host = inlineHost.current;
    const schedule = () => {
      idle = canIdle
        ? window.requestIdleCallback(() => void start(), { timeout: 2000 })
        : window.setTimeout(() => void start(), 400);
    };
    let gate: IntersectionObserver | undefined;
    if (host && 'IntersectionObserver' in window) {
      gate = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          gate?.disconnect();
          schedule();
        },
        { rootMargin: '200px' },
      );
      gate.observe(host);
    } else schedule();

    return () => {
      disposed = true;
      gate?.disconnect();
      if (canIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cleanup?.();
    };
  }, [reduced]);

  /* ---- relight when the theme changes ---- */
  useEffect(() => {
    // the provider writes data-theme in its own effect, which runs after this
    // one, so read the new accent on the next frame
    const id = requestAnimationFrame(() => stageRef.current?.setMode(theme));
    return () => cancelAnimationFrame(id);
  }, [theme, ready]);

  /* ---- move the stage between the hero and the inspector ---- */
  useEffect(() => {
    const stage = stageRef.current;
    const target = inspect ? modalHost.current : inlineHost.current;
    if (!stage || !target) return;
    target.appendChild(stage.el);
    stage.setZoom(inspect ? INSPECT_DISTANCE : INLINE_DISTANCE);
    if (!inspect) stage.resetView();
  }, [inspect, ready]);

  useEffect(() => {
    if (!inspect) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspect(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [inspect]);

  // a drag should not also count as a click
  const pressed = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pressed.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const from = pressed.current;
      pressed.current = null;
      if (!from) return;
      if (Math.hypot(e.clientX - from.x, e.clientY - from.y) < 5) setInspect((v) => !v);
    },
    [],
  );

  return (
    <>
      <div
        ref={inlineHost}
        className={cx(className, 'pointer-events-auto cursor-grab active:cursor-grabbing')}
        role="button"
        tabIndex={0}
        aria-label={t.hero.inspectModel}
        data-cursor="inspect"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setInspect(true);
          }
        }}
        style={{ opacity: ready ? 1 : 0, transition: 'opacity .8s cubic-bezier(.16,1,.3,1)' }}
      />

      {inspect &&
        createPortal(
        <div
          className="fixed inset-0 z-[75] flex flex-col bg-bg/[0.97]"
          role="dialog"
          aria-modal="true"
          aria-label={t.hero.inspectModel}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-3 sm:px-8">
            <div>
              <div className="label-a">Model / dm_desk.glb</div>
              <div className="label mt-0.5">{t.hero.inspectHint}</div>
            </div>
            <button
              type="button"
              onClick={() => setInspect(false)}
              data-cursor="follow"
              className="flex items-center gap-3 border border-line px-3 py-2 font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {t.nav.close}
              <span className="border border-line px-1.5 py-0.5">ESC</span>
            </button>
          </div>

          <div className="relative flex-1">
            <div className="tech-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <div ref={modalHost} className="absolute inset-0 touch-none" />
            <CornerMarks className="m-6" />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 sm:px-8">
            <span className="label hidden sm:block">drag to rotate · scroll to zoom</span>
            <div className="flex items-center gap-2">
              {([['−', 0.5], ['+', -0.5]] as const).map(([glyph, delta]) => (
                <button
                  key={glyph}
                  type="button"
                  onClick={() => stageRef.current?.zoomBy(delta)}
                  aria-label={glyph === '+' ? 'Zoom in' : 'Zoom out'}
                  data-cursor="follow"
                  className="grid h-9 w-9 place-items-center border border-line font-mono text-sm text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {glyph}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  stageRef.current?.resetView();
                  stageRef.current?.setZoom(INSPECT_DISTANCE);
                }}
                data-cursor="follow"
                className="border border-line px-3 py-2 font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
              >
                Reset
              </button>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
