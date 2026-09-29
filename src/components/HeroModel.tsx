import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMisc';

/**
 * The hero figure: a glTF model rendered with three.js, turning slowly, with
 * equations orbiting its head drawn on a 2D canvas above the WebGL one so the
 * type stays crisp. three and the model are both loaded lazily, after first
 * paint, so neither blocks the page.
 */
const MODEL_URL = '/model/programmer.glb';

const EQUATIONS: Array<{ phase: number; y: number; r: number; text: string }> = [
  { phase: 0.0, y: 0.34, r: 0.62, text: 'e^iπ + 1 = 0' },
  { phase: 0.52, y: 0.2, r: 0.74, text: '√2' },
  { phase: 1.05, y: -0.04, r: 0.86, text: 'a² + b² = c²' },
  { phase: 2.1, y: 0.26, r: 0.7, text: '∑ 1/n²' },
  { phase: 3.14, y: -0.12, r: 0.8, text: '∫ f(x) dx' },
  { phase: 3.66, y: 0.24, r: 0.66, text: 'λ = c/f' },
  { phase: 4.2, y: 0.3, r: 0.56, text: '∂f/∂x' },
  { phase: 5.25, y: 0.06, r: 0.82, text: 'O(n log n)' },
];

function readAccent(): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim();
  const parts = v.split(/\s+/).map(Number);
  return parts.length === 3 && parts.every(Number.isFinite)
    ? (parts as [number, number, number])
    : [255, 95, 31];
}

export default function HeroModel({ className = '' }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const overlay = overlayRef.current;
    if (!host || !overlay) return;

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
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0.15, 4.2);

      const accent = readAccent();
      const accentColor = new THREE.Color(accent[0] / 255, accent[1] / 255, accent[2] / 255);

      scene.add(new THREE.HemisphereLight(0xc8d2e0, 0x0a0a0c, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(-2.5, 3.2, 2.6);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x9fb0c8, 0.5);
      fill.position.set(2.6, 0.8, -2.2);
      scene.add(fill);
      // a warm bounce, as if it came off the screen the figure is looking at
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
      const center = new THREE.Vector3();
      bounds.getSize(size);
      bounds.getCenter(center);
      const unit = 2 / Math.max(size.x, size.y, size.z);
      model.position.sub(center);
      model.scale.setScalar(unit);
      model.position.multiplyScalar(unit);
      pivot.add(model);
      pivot.rotation.y = 0.35;

      // where the equations orbit: just above the top of the model
      const headY = ((bounds.max.y - center.y) * unit) + 0.12;
      const orbitCentre = new THREE.Vector3(0, headY, 0);
      const probe = new THREE.Vector3();
      setReady(true);

      const octx = overlay.getContext('2d');
      let w = 0;
      let h = 0;
      const resize = () => {
        const rect = host.getBoundingClientRect();
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
      ro.observe(host);
      resize();

      let orbit = 0;
      let raf = 0;
      let last = performance.now();

      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!reduced) {
          pivot.rotation.y += dt * 0.3;
          orbit += dt * 0.45;
        }
        renderer.render(scene, camera);

        if (octx) {
          octx.clearRect(0, 0, w, h);
          const fontSize = Math.max(9, Math.round(w / 34));
          octx.font = `${fontSize}px "JetBrains Mono Variable", ui-monospace, monospace`;
          octx.textAlign = 'center';
          octx.textBaseline = 'middle';

          const head = orbitCentre.clone().project(camera);
          const hx = ((head.x + 1) / 2) * w;
          const hy = ((1 - head.y) / 2) * h;

          const placed = EQUATIONS.map((eq) => {
            const a = eq.phase + orbit + pivot.rotation.y;
            probe.set(Math.cos(a) * eq.r, headY + eq.y, Math.sin(a) * eq.r);
            const depth = probe.z;
            const p = probe.clone().project(camera);
            return { eq, x: ((p.x + 1) / 2) * w, y: ((1 - p.y) / 2) * h, depth };
          }).sort((m, n) => m.depth - n.depth);

          for (const e of placed) {
            const fade = Math.min(1, Math.max(0, (e.depth + 0.95) / 1.7));
            if (fade <= 0.04) continue;
            octx.strokeStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / ${(0.13 * fade).toFixed(3)})`;
            octx.setLineDash([2, 4]);
            octx.lineWidth = 1;
            octx.beginPath();
            octx.moveTo(hx, hy);
            octx.lineTo(e.x, e.y);
            octx.stroke();
            octx.setLineDash([]);
            octx.fillStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / ${(0.9 * fade).toFixed(3)})`;
            octx.fillText(e.eq.text, e.x, e.y);
          }
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        scene.traverse((obj) => {
          const mesh = obj as InstanceType<typeof THREE.Mesh>;
          if (mesh.isMesh) {
            mesh.geometry?.dispose();
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const m of mats) m?.dispose?.();
          }
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // let the page paint before pulling in three and the model
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

  return (
    <div
      className={className}
      role="img"
      aria-label="Rotating 3D model of David at his desk, with equations orbiting his head"
      style={{ opacity: ready ? 1 : 0, transition: 'opacity .8s cubic-bezier(.16,1,.3,1)' }}
    >
      <div ref={hostRef} className="absolute inset-0" />
      <canvas ref={overlayRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
