import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * The garment material: the scanned models wear a white T-shirt or   *
 * hoodie, so the garment is found in the shader by colour (bright and *
 * unsaturated) inside a height band, then tinted and printed on.      *
 * ------------------------------------------------------------------ */

export type Gender = 'man' | 'woman';
export type Garment = 'tee' | 'hoodie';
export type ModelId = `${Garment}-${Gender}`;
export type Side = 'front' | 'back';

export const modelId = (garment: Garment, gender: Gender): ModelId => `${garment}-${gender}`;

/**
 * Measured on each model, in its own units (1 = body height, centred on 0).
 * band: the garment's height range (keeps white shoes and the whites of the eyes out);
 * front / back: [centre y, half width, half height] of the print area; chest: camera target.
 * The hoodies' front prints sit above the pouch pocket, the backs below the hood.
 */
export const FIT: Record<ModelId, { band: [number, number]; front: [number, number, number]; back: [number, number, number]; chest: number }> = {
  'tee-man': { band: [-0.04, 0.372], front: [0.2, 0.092, 0.092], back: [0.205, 0.1, 0.1], chest: 0.2 },
  'tee-woman': { band: [-0.04, 0.365], front: [0.222, 0.072, 0.072], back: [0.205, 0.085, 0.085], chest: 0.205 },
  'hoodie-man': { band: [-0.04, 0.385], front: [0.255, 0.078, 0.078], back: [0.205, 0.1, 0.1], chest: 0.22 },
  'hoodie-woman': { band: [-0.04, 0.37], front: [0.222, 0.064, 0.064], back: [0.155, 0.08, 0.08], chest: 0.2 },
};

export interface ShirtUniforms {
  uTint: { value: THREE.Color };
  uBand: { value: THREE.Vector2 };
  uFront: { value: THREE.Texture };
  uBack: { value: THREE.Texture };
  uFrontBox: { value: THREE.Vector4 };
  uBackBox: { value: THREE.Vector4 };
}

export function makeUniforms(front: THREE.Texture, back: THREE.Texture): ShirtUniforms {
  return {
    uTint: { value: new THREE.Color('#ffffff') },
    uBand: { value: new THREE.Vector2(0, 0.4) },
    uFront: { value: front },
    uBack: { value: back },
    uFrontBox: { value: new THREE.Vector4(0, 0.2, 0.1, 0.1) },
    uBackBox: { value: new THREE.Vector4(0, 0.2, 0.1, 0.1) },
  };
}

/** patch a glTF MeshStandardMaterial so it recolours and prints the garment */
export function patchShirt(mat: THREE.MeshStandardMaterial, local: THREE.Matrix4, u: ShirtUniforms) {
  mat.metalness = 0;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u, { uLocal: { value: local } });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uLocal;\nvarying vec3 vShirtPos;\nvarying vec3 vShirtNrm;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvShirtPos = (uLocal * vec4(transformed, 1.0)).xyz;\nvShirtNrm = normalize(mat3(uLocal) * objectNormal);',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform vec3 uTint;
uniform vec2 uBand;
uniform sampler2D uFront;
uniform sampler2D uBack;
uniform vec4 uFrontBox;
uniform vec4 uBackBox;
varying vec3 vShirtPos;
varying vec3 vShirtNrm;
vec4 shirtPrint(sampler2D tex, vec4 box, float mirror) {
  vec2 uv = vec2(mirror * (vShirtPos.x - box.x) / (2.0 * box.z) + 0.5, (vShirtPos.y - box.y) / (2.0 * box.w) + 0.5);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture2D(tex, uv);
}`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
{
  vec3 c = diffuseColor.rgb;
  float hi = max(max(c.r, c.g), c.b);
  float lo = min(min(c.r, c.g), c.b);
  float sat = (hi - lo) / max(hi, 1e-3);
  float white = smoothstep(0.035, 0.12, lo) * (1.0 - smoothstep(0.2, 0.36, sat));
  float y = vShirtPos.y;
  float band = smoothstep(uBand.x - 0.012, uBand.x + 0.012, y) * (1.0 - smoothstep(uBand.y - 0.012, uBand.y + 0.012, y));
  float mask = white * band;
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float shade = clamp(lum / 0.9, 0.0, 1.08);
  vec3 shirt = uTint * shade;
  float fz = smoothstep(0.12, 0.35, vShirtNrm.z);
  float bz = smoothstep(0.12, 0.35, -vShirtNrm.z);
  vec4 pf = shirtPrint(uFront, uFrontBox, 1.0);
  vec4 pb = shirtPrint(uBack, uBackBox, -1.0);
  float shadeP = mix(1.0, shade, 0.55);
  shirt = mix(shirt, pf.rgb * shadeP, pf.a * fz);
  shirt = mix(shirt, pb.rgb * shadeP, pb.a * bz);
  diffuseColor.rgb = mix(c, shirt, mask);
}`,
      );
  };
  mat.customProgramCacheKey = () => 'shirt-v2';
  mat.needsUpdate = true;
}

/* ---------- lighting ---------- */

export type LightPreset = 'studio' | 'daylight' | 'golden' | 'spotlight';

interface PresetSpec {
  key: [color: string, intensity: number, elevationDeg: number];
  fill: [string, number];
  rim: [string, number];
  hemi: [sky: string, ground: string, intensity: number];
  env: number;
  exposure: number;
  shadow: number;
}

/** three-point setups: a shadow-casting key, a soft fill, a rim from behind, sky light and reflections */
export const LIGHTS: Record<LightPreset, PresetSpec> = {
  studio: { key: ['#fff3e2', 2.3, 38], fill: ['#e6edff', 0.55], rim: ['#dfe8ff', 1.3], hemi: ['#ffffff', '#8a8070', 0.35], env: 0.6, exposure: 1, shadow: 0.32 },
  daylight: { key: ['#fff1d8', 3, 58], fill: ['#bcd4ff', 0.35], rim: ['#ffffff', 0.7], hemi: ['#c4defc', '#a08a6a', 0.75], env: 0.45, exposure: 0.95, shadow: 0.45 },
  golden: { key: ['#ffb36a', 2.7, 24], fill: ['#7088cc', 0.4], rim: ['#ffd29a', 1.7], hemi: ['#ffdcb6', '#5a4a3a', 0.35], env: 0.32, exposure: 1.02, shadow: 0.5 },
  spotlight: { key: ['#ffffff', 3.4, 34], fill: ['#c9d4ff', 0.3], rim: ['#ff6a2a', 4.2], hemi: ['#ffffff', '#202020', 0.2], env: 0.18, exposure: 1.04, shadow: 0.7 },
};

export interface LightRig {
  /** apply a preset; azimuth (degrees) turns the key light around the model, the rim follows opposite */
  set: (preset: LightPreset, azimuthDeg: number) => void;
  dispose: () => void;
}

/** the rig and a shadow-catching floor at the model's feet (y = -0.5) */
export function createLightRig(scene: THREE.Scene, renderer: THREE.WebGLRenderer): LightRig {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const hemi = new THREE.HemisphereLight();
  const key = new THREE.DirectionalLight();
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 3;
  const cam = key.shadow.camera;
  cam.left = cam.bottom = -1.1;
  cam.right = cam.top = 1.1;
  cam.near = 0.1;
  cam.far = 6;
  const fill = new THREE.DirectionalLight();
  const rim = new THREE.DirectionalLight();
  // the floor only shows the shadow, fading out towards its rim so it never ends in a hard edge
  const floorMat = new THREE.ShadowMaterial({ transparent: true, depthWrite: false });
  floorMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vFloor;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFloor = position.xy;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vFloor;')
      .replace(
        'gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );',
        'gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) * ( 1.0 - smoothstep( 0.35, 1.0, length( vFloor ) ) ) );',
      );
  };
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1, 64), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  floor.receiveShadow = true;
  scene.add(hemi, key, key.target, fill, rim, floor);

  const place = (l: THREE.DirectionalLight, az: number, el: number, r = 3) => {
    const a = THREE.MathUtils.degToRad(az);
    const e = THREE.MathUtils.degToRad(el);
    l.position.set(Math.sin(a) * Math.cos(e) * r, 0.15 + Math.sin(e) * r, Math.cos(a) * Math.cos(e) * r);
  };

  return {
    set(preset, azimuth) {
      const p = LIGHTS[preset];
      key.color.set(p.key[0]);
      key.intensity = p.key[1];
      place(key, azimuth, p.key[2]);
      fill.color.set(p.fill[0]);
      fill.intensity = p.fill[1];
      place(fill, azimuth - 75, 12);
      rim.color.set(p.rim[0]);
      rim.intensity = p.rim[1];
      place(rim, azimuth + 165, 28);
      hemi.color.set(p.hemi[0]);
      hemi.groundColor.set(p.hemi[1]);
      hemi.intensity = p.hemi[2];
      scene.environmentIntensity = p.env;
      renderer.toneMappingExposure = p.exposure;
      (floor.material as THREE.ShadowMaterial).opacity = p.shadow;
    },
    dispose() {
      scene.remove(hemi, key, key.target, fill, rim, floor);
      key.shadow.map?.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
    },
  };
}

/* ---------- the print, drawn in a square canvas ---------- */

export interface Design {
  text: string;
  font: FontId;
  color: string;
  image: HTMLImageElement | null;
  /** 0.3 – 1 of the print area */
  scale: number;
  /** -1 (low) … 1 (high) */
  offset: number;
}

export const FONTS = {
  archivo: { family: '"Archivo Variable", Archivo, sans-serif', weight: 800, label: 'Archivo' },
  playfair: { family: '"Playfair Display Variable", "Playfair Display", serif', weight: 700, label: 'Playfair' },
  mono: { family: '"JetBrains Mono Variable", "JetBrains Mono", monospace', weight: 700, label: 'Mono' },
  caveat: { family: 'Caveat, cursive', weight: 500, label: 'Caveat' },
} as const;
export type FontId = keyof typeof FONTS;

export const PRINT_PX = 1024;

export function printCanvas() {
  const c = document.createElement('canvas');
  c.width = c.height = PRINT_PX;
  return c;
}

export function printTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** draw a design into its canvas: the image on top, the text under it, both centred */
export async function drawDesign(c: HTMLCanvasElement, d: Design) {
  const f = FONTS[d.font];
  const lines = d.text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (lines.length) {
    try {
      await document.fonts.load(`${f.weight} 100px ${f.family}`, lines.join(' '));
    } catch {
      /* the fallback font will do */
    }
  }
  const g = c.getContext('2d')!;
  const S = PRINT_PX;
  g.clearRect(0, 0, S, S);
  const box = S * d.scale;
  const top = (S - box) / 2;
  const hasImg = !!d.image;
  const textH = lines.length ? (hasImg ? box * 0.3 : box * Math.min(1, 0.32 * lines.length)) : 0;
  const imgH = hasImg ? box - textH - (lines.length ? box * 0.04 : 0) : 0;
  // centre the whole block vertically
  let y = top + (box - imgH - textH - (hasImg && lines.length ? box * 0.04 : 0)) / 2;

  if (d.image) {
    const r = Math.min(box / d.image.naturalWidth, imgH / d.image.naturalHeight);
    const w = d.image.naturalWidth * r;
    const h = d.image.naturalHeight * r;
    g.drawImage(d.image, (S - w) / 2, y + (imgH - h) / 2, w, h);
    y += imgH + (lines.length ? box * 0.04 : 0);
  }
  if (lines.length) {
    g.fillStyle = d.color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const lh = textH / lines.length;
    for (const [i, line] of lines.entries()) {
      let size = lh * 0.82;
      g.font = `${f.weight} ${size}px ${f.family}`;
      const w = g.measureText(line).width;
      if (w > box) {
        size *= box / w;
        g.font = `${f.weight} ${size}px ${f.family}`;
      }
      g.fillText(line, S / 2, y + lh * (i + 0.5));
    }
  }
}
