import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePrefersReducedMotion } from '../hooks/useMisc';
import { useI18n } from '../i18n';
import { CornerMarks, cx } from './ui';

/**
 * The hero figure: a glTF model rendered with three.js. It turns on its own,
 * can be dragged to rotate, and opens into a full-screen inspector on click.
 * Equations orbit the head, cycling in and out of a larger pool, drawn on a 2D
 * canvas above the WebGL one so the type stays crisp.
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

interface Stage {
  el: HTMLDivElement;
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
  const [ready, setReady] = useState(false);
  const [inspect, setInspect] = useState(false);

  const INLINE_DISTANCE = 4.2;
  const INSPECT_DISTANCE = 4.6;

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const start = async () => {
      const THREE = await import('three');
      const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch {
        return; // no WebGL: the hero simply goes without the model
      }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

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
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      let distance = INLINE_DISTANCE;
      let targetDistance = INLINE_DISTANCE;
      let elevation = 0.15;

      const accent = readAccent();
      const accentColor = new THREE.Color(accent[0] / 255, accent[1] / 255, accent[2] / 255);

      scene.add(new THREE.HemisphereLight(0xc8d2e0, 0x0a0a0c, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(-2.5, 3.2, 2.6);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x9fb0c8, 0.5);
      fill.position.set(2.6, 0.8, -2.2);
      scene.add(fill);
      const glow = new THREE.PointLight(accentColor, 6, 6, 2);
      glow.position.set(0.25, -0.1, 1.1);
      scene.add(glow);

      const pivot = new THREE.Group();
      scene.add(pivot);

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
      pivot.add(model);
      pivot.rotation.y = 0.35;

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
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        overlay.width = Math.round(w * dpr);
        overlay.height = Math.round(h * dpr);
        octx?.setTransform(dpr, 0, 0, dpr, 0, 0);
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
        targetDistance = Math.max(1.7, Math.min(6.5, targetDistance + e.deltaY * 0.0022));
      };
      el.addEventListener('wheel', wheel, { passive: false });

      let orbit = 0;
      let raf = 0;
      let last = performance.now();
      let solved = 0;
      const slots: Slot[] = [];
      for (let i = 0; i < SLOTS; i++) slots.push(spawn(last, new Set(slots.map((s) => s.text)), true));

      const frame = (now: number) => {
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

        distance += (targetDistance - distance) * Math.min(1, dt * 6);
        camera.position.set(0, elevation, distance);
        camera.lookAt(0, elevation * 0.25, 0);
        renderer.render(scene, camera);

        if (octx && w && h) {
          octx.clearRect(0, 0, w, h);
          const fontSize = Math.max(9, Math.min(21, Math.round(h / 38)));
          octx.font = `${fontSize}px "JetBrains Mono Variable", ui-monospace, monospace`;
          octx.textAlign = 'center';
          octx.textBaseline = 'middle';

          const head = orbitCentre.clone().project(camera);
          const hx = ((head.x + 1) / 2) * w;
          const hy = ((1 - head.y) / 2) * h;

          const placed = slots
            .map((slot, index) => {
              if (!reduced && now - slot.born > slot.life) {
                solved += 1;
                slots[index] = spawn(now, new Set(slots.map((s) => s.text)));
              }
              const current = slots[index];
              const a = current.phase + orbit + pivot.rotation.y;
              probe.set(Math.cos(a) * current.r, headY + current.y, Math.sin(a) * current.r);
              const p = probe.clone().project(camera);
              const age = now - current.born;
              const life = reduced
                ? 1
                : Math.min(age / FADE_IN, Math.max(0, (current.life - age) / FADE_OUT), 1);
              return {
                slot: current,
                x: ((p.x + 1) / 2) * w,
                y: ((1 - p.y) / 2) * h,
                depth: probe.z,
                life,
              };
            })
            .sort((m, n) => m.depth - n.depth);

          for (const e of placed) {
            const alpha = Math.min(1, Math.max(0, (e.depth + 0.95) / 1.7)) * e.life;
            if (alpha <= 0.04) continue;
            octx.strokeStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / ${(0.13 * alpha).toFixed(3)})`;
            octx.setLineDash([2, 4]);
            octx.lineWidth = 1;
            octx.beginPath();
            octx.moveTo(hx, hy);
            octx.lineTo(e.x, e.y);
            octx.stroke();
            octx.setLineDash([]);
            octx.fillStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / ${(0.9 * alpha).toFixed(3)})`;
            octx.fillText(e.slot.text, e.x, e.y);
          }

          const small = Math.max(8, Math.round(fontSize * 0.68));
          octx.font = `${small}px "JetBrains Mono Variable", ui-monospace, monospace`;
          octx.textAlign = 'right';
          octx.fillStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / 0.75)`;
          octx.fillText(`SOLVED ${String(solved).padStart(4, '0')}`, w - 10, small + 6);
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      stageRef.current = {
        el,
        setZoom: (d) => {
          targetDistance = d;
        },
        zoomBy: (d) => {
          targetDistance = Math.max(1.7, Math.min(6.5, targetDistance + d));
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
        cancelAnimationFrame(raf);
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
        renderer.dispose();
        el.remove();
        stageRef.current = null;
      };
    };

    const canIdle = typeof window.requestIdleCallback === 'function';
    const idle: number = canIdle
      ? window.requestIdleCallback(() => void start(), { timeout: 2000 })
      : window.setTimeout(() => void start(), 400);

    return () => {
      disposed = true;
      if (canIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cleanup?.();
    };
  }, [reduced]);

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
          className="fixed inset-0 z-[75] flex flex-col bg-bg/95 backdrop-blur-sm"
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
