import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * The T-shirt material: the scanned models wear a white T-shirt, so  *
 * the shirt is found in the shader by colour (bright and unsaturated) *
 * inside a height band, then tinted and printed on.                   *
 * ------------------------------------------------------------------ */

export type Gender = 'man' | 'woman';
export type Side = 'front' | 'back';

/** measured on each model, in its own units (1 = body height, centred on 0) */
export const FIT: Record<Gender, { band: [number, number]; front: [number, number, number]; back: [number, number, number]; chest: number }> = {
  // [centre y, half width, half height]
  man: { band: [0.035, 0.375], front: [0.215, 0.1, 0.1], back: [0.225, 0.11, 0.11], chest: 0.21 },
  woman: { band: [0.122, 0.375], front: [0.255, 0.075, 0.075], back: [0.26, 0.085, 0.085], chest: 0.25 },
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

/** patch a glTF MeshStandardMaterial so it recolours and prints the shirt */
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
  float shade = clamp(lum / 0.72, 0.0, 1.12);
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
  mat.customProgramCacheKey = () => 'shirt-v1';
  mat.needsUpdate = true;
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
