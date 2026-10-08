import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * Sky for the garage designer: a gradient dome with a sun disc and   *
 * drifting cloud sprites by day, a deep blue dome with stars and a   *
 * moon by night. The same dome is baked into a PMREM environment so  *
 * glass, handles and metal pick up matching reflections.             *
 * ------------------------------------------------------------------ */

const R = 300; // inside the camera far plane (400)

interface Look {
  top: string;
  horizon: string;
  bottom: string;
  glow: string;
  disc: number;
  fog: string;
}
const DAY: Look = { top: '#2f6fc4', horizon: '#cfe2f2', bottom: '#b9cbd6', glow: '#fff4dc', disc: 1, fog: '#cbdcea' };
const NIGHT: Look = { top: '#03060f', horizon: '#1a2a44', bottom: '#0a0f1a', glow: '#c8d6ff', disc: 0.55, fog: '#121b2b' };

function domeMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color() },
      horizon: { value: new THREE.Color() },
      bottom: { value: new THREE.Color() },
      glow: { value: new THREE.Color() },
      sunDir: { value: new THREE.Vector3(0, 1, 0) },
      disc: { value: 1 },
      night: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 top, horizon, bottom, glow, sunDir;
      uniform float disc, night;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = h > 0.0 ? mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(horizon, bottom, clamp(-h * 6.0, 0.0, 1.0));
        float c = max(dot(d, normalize(sunDir)), 0.0);
        // wide warm halo, tight bloom and the disc itself
        col += glow * (pow(c, 8.0) * 0.18 + pow(c, 220.0) * 0.6) * disc;
        col = mix(col, glow * (night > 0.5 ? 1.6 : 6.0), smoothstep(0.9993, 0.9996, c) * disc);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

/** a soft cumulus drawn from overlapping radial puffs */
function cloudTexture(seed: number) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d')!;
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const puffs = 14 + Math.floor(rnd() * 8);
  for (let i = 0; i < puffs; i++) {
    const x = 90 + rnd() * 330;
    const y = 120 + (rnd() - 0.5) * 60 - Math.sin(((x - 90) / 330) * Math.PI) * 40;
    const r = 40 + rnd() * 55;
    const grd = g.createRadialGradient(x, y - r * 0.2, r * 0.1, x, y, r);
    grd.addColorStop(0, 'rgba(255,255,255,0.95)');
    grd.addColorStop(0.55, 'rgba(246,248,252,0.7)');
    grd.addColorStop(1, 'rgba(230,236,244,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  // a slightly grey belly
  const shade = g.createLinearGradient(0, 120, 0, 230);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(120,135,160,0.35)');
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = shade;
  g.fillRect(0, 0, 512, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture(inner: string, outer: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.18, inner);
  grd.addColorStop(0.24, outer);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stars() {
  const n = 1800;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const tint = [new THREE.Color('#ffffff'), new THREE.Color('#cfdcff'), new THREE.Color('#fff0d8')];
  for (let i = 0; i < n; i++) {
    // upper hemisphere, a little denser towards the zenith
    const y = 0.04 + Math.pow(rnd(), 0.8) * 0.96;
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    pos.set([Math.cos(a) * r * (R - 6), y * (R - 6), Math.sin(a) * r * (R - 6)], i * 3);
    const b = 0.35 + Math.pow(rnd(), 3) * 0.9;
    const c = tint[Math.floor(rnd() * 3)];
    col.set([c.r * b, c.g * b, c.b * b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false, transparent: true, toneMapped: false });
  return new THREE.Points(geo, mat);
}

export interface Sky {
  /** switch between the day and the night sky; `sun` is the direction to the sun or moon */
  set: (night: boolean, sun: THREE.Vector3) => void;
  dispose: () => void;
}

export function createSky(scene: THREE.Scene, renderer: THREE.WebGLRenderer): Sky {
  const root = new THREE.Group();
  root.name = 'sky';
  const domeMat = domeMaterial();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 24), domeMat);
  dome.renderOrder = -10;
  root.add(dome);

  // clouds: sprites on a ring well inside the dome, kept low so they read from the default views
  const clouds = new THREE.Group();
  const cloudTex = [cloudTexture(1), cloudTexture(2), cloudTexture(3), cloudTexture(4)];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.sin(i * 3.7) * 0.18;
    const dist = 170 + ((i * 37) % 70);
    const m = new THREE.SpriteMaterial({ map: cloudTex[i % 4], fog: false, depthWrite: false, transparent: true, opacity: 0.92 });
    const sp = new THREE.Sprite(m);
    const w = 55 + ((i * 53) % 45);
    sp.scale.set(w, w * 0.5, 1);
    sp.position.set(Math.cos(a) * dist, 16 + ((i * 29) % 34), Math.sin(a) * dist);
    sp.renderOrder = -9;
    clouds.add(sp);
  }
  root.add(clouds);

  const starField = stars();
  starField.renderOrder = -9;
  root.add(starField);

  const moonTex = glowTexture('rgba(240,244,255,1)', 'rgba(170,190,255,0.22)');
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, fog: false, depthWrite: false, transparent: true, toneMapped: false }));
  moon.scale.setScalar(34);
  moon.renderOrder = -8;
  root.add(moon);
  scene.add(root);

  // environment maps baked from the dome alone, one per look
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envs: Partial<Record<'day' | 'night', THREE.Texture>> = {};
  const bake = (key: 'day' | 'night') => {
    if (envs[key]) return envs[key]!;
    const s = new THREE.Scene();
    const d = new THREE.Mesh(dome.geometry, domeMat);
    s.add(d);
    envs[key] = pmrem.fromScene(s, 0, 0.1, R * 2).texture;
    return envs[key]!;
  };

  const set = (night: boolean, sun: THREE.Vector3) => {
    const L = night ? NIGHT : DAY;
    const u = domeMat.uniforms;
    u.top.value.set(L.top);
    u.horizon.value.set(L.horizon);
    u.bottom.value.set(L.bottom);
    u.glow.value.set(L.glow);
    u.sunDir.value.copy(sun).normalize();
    // at night the moon is a sprite; the dome only adds its faint halo
    u.disc.value = night ? 0.35 : L.disc;
    u.night.value = night ? 1 : 0;
    clouds.visible = !night;
    starField.visible = night;
    moon.visible = night;
    moon.position.copy(sun).normalize().multiplyScalar(R - 20);
    scene.background = null;
    scene.fog = new THREE.Fog(L.fog, 45, 150);
    scene.environment = bake(night ? 'night' : 'day');
    scene.environmentIntensity = night ? 0.35 : 0.55;
  };

  return {
    set,
    dispose: () => {
      scene.remove(root);
      dome.geometry.dispose();
      domeMat.dispose();
      for (const t of cloudTex) t.dispose();
      clouds.children.forEach((c) => ((c as THREE.Sprite).material as THREE.SpriteMaterial).dispose());
      starField.geometry.dispose();
      (starField.material as THREE.Material).dispose();
      moonTex.dispose();
      (moon.material as THREE.Material).dispose();
      for (const e of Object.values(envs)) e?.dispose();
      pmrem.dispose();
    },
  };
}
