import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * A small three.js stage shared by the configurators: renderer, camera, orbit
 * controls and a render loop that only runs while something moves (dragging,
 * damping or a camera glide), so an idle configurator costs nothing.
 */
export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  /** draw a frame soon */
  render: () => void;
  /** glide the camera to a new target and position */
  glide: (target: THREE.Vector3, position: THREE.Vector3, ms?: number) => void;
  /** a PNG of the current view */
  snapshot: () => string;
  dispose: () => void;
}

export function createStage(host: HTMLElement, { fov = 40, shadows = false } = {}): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.touchAction = 'none';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.05, 400);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.enablePan = false;

  let raf = 0;
  let tween: { t0: number; ms: number; fromT: THREE.Vector3; toT: THREE.Vector3; fromP: THREE.Vector3; toP: THREE.Vector3 } | null = null;
  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  const frame = (now: number) => {
    raf = 0;
    let again = false;
    if (tween) {
      const k = Math.min(1, (now - tween.t0) / tween.ms);
      const e = ease(k);
      controls.target.lerpVectors(tween.fromT, tween.toT, e);
      camera.position.lerpVectors(tween.fromP, tween.toP, e);
      if (k < 1) again = true;
      else tween = null;
    }
    if (controls.update()) again = true;
    renderer.render(scene, camera);
    if (again) render();
  };
  const render = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  controls.addEventListener('change', render);

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const glide = (target: THREE.Vector3, position: THREE.Vector3, ms = 900) => {
    if (reduced) {
      controls.target.copy(target);
      camera.position.copy(position);
      render();
      return;
    }
    tween = { t0: performance.now(), ms, fromT: controls.target.clone(), toT: target.clone(), fromP: camera.position.clone(), toP: position.clone() };
    render();
  };

  const snapshot = () => {
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  };

  return {
    renderer,
    scene,
    camera,
    controls,
    render,
    glide,
    snapshot,
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

/** start a file download of a data URL */
export function download(url: string, name: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
