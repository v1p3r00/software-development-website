import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * A procedural garage, rebuilt from plain options.                   *
 * Units are metres; the garage door faces +z, the plot opens to +z.  *
 * ------------------------------------------------------------------ */

export type Roof = 'flat' | 'gable' | 'mono';
export type Door = 'sectional' | 'tilt' | 'swing';
export type Cladding = 'sheet' | 'wood' | 'render';

export interface GarageOpts {
  width: number;
  depth: number;
  height: number;
  roof: Roof;
  door: Door;
  doors: 1 | 2;
  cladding: Cladding;
  wall: string;
  trim: string;
  sideDoor: boolean;
  window: boolean;
  gutter: boolean;
}

/* ---------- textures drawn once in a canvas ---------- */

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** greyscale patterns, tinted by the material colour */
const patterns = {
  // trapezoid steel sheet: ribs every ~20 cm
  sheet: () =>
    canvasTex(128, 16, (g) => {
      g.fillStyle = '#f2f2f2';
      g.fillRect(0, 0, 128, 16);
      for (const [x, w, c] of [[0, 18, '#d6d6d6'], [18, 6, '#ffffff'], [24, 18, '#e2e2e2'], [42, 4, '#bdbdbd']] as const) {
        g.fillStyle = c;
        g.fillRect(x, 0, w, 16);
        g.fillRect(x + 64, 0, w, 16);
      }
    }),
  // timber cladding: boards with grain
  wood: () =>
    canvasTex(256, 256, (g) => {
      for (let i = 0; i < 4; i++) {
        const y = i * 64;
        g.fillStyle = ['#efe7dc', '#e6dccd', '#f4ede4', '#e9e0d3'][i];
        g.fillRect(0, y, 256, 64);
        g.strokeStyle = 'rgba(120,90,60,0.18)';
        for (let k = 0; k < 9; k++) {
          g.beginPath();
          const yy = y + 6 + k * 6.5;
          g.moveTo(0, yy);
          g.bezierCurveTo(80, yy + 3, 170, yy - 3, 256, yy + 1);
          g.stroke();
        }
        g.fillStyle = 'rgba(40,30,20,0.55)';
        g.fillRect(0, y + 62, 256, 2);
      }
    }),
  render: () =>
    canvasTex(128, 128, (g) => {
      g.fillStyle = '#f3f3f3';
      g.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
        g.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5);
      }
    }),
  // sectional door: horizontal panels with a groove
  sectional: () =>
    canvasTex(64, 128, (g) => {
      g.fillStyle = '#f4f4f4';
      g.fillRect(0, 0, 64, 128);
      for (let i = 0; i < 4; i++) {
        g.fillStyle = '#c9c9c9';
        g.fillRect(0, i * 32, 64, 2);
        g.fillStyle = '#ffffff';
        g.fillRect(0, i * 32 + 2, 64, 1);
        g.fillStyle = '#e4e4e4';
        g.fillRect(0, i * 32 + 15, 64, 1);
      }
    }),
  // grass, with soft noise
  grass: () =>
    canvasTex(256, 256, (g) => {
      g.fillStyle = '#6f9150';
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 5000; i++) {
        const v = Math.random();
        g.fillStyle = v > 0.5 ? `rgba(160,190,110,${v * 0.25})` : `rgba(40,70,30,${v * 0.3})`;
        g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 3);
      }
    }),
  gravel: () =>
    canvasTex(256, 256, (g) => {
      g.fillStyle = '#b9b2a6';
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 4000; i++) {
        const v = 120 + Math.random() * 110;
        g.fillStyle = `rgb(${v},${v - 6},${v - 14})`;
        g.beginPath();
        g.arc(Math.random() * 256, Math.random() * 256, 0.8 + Math.random() * 1.8, 0, 7);
        g.fill();
      }
    }),
};

type Pat = keyof typeof patterns;
const cache = new Map<Pat, THREE.Texture>();
function pattern(name: Pat, rx: number, ry: number) {
  let base = cache.get(name);
  if (!base) {
    base = patterns[name]();
    cache.set(name, base);
  }
  const t = base.clone();
  t.needsUpdate = true;
  t.repeat.set(rx, ry);
  return t;
}

/* ---------- small helpers ---------- */

function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.08, ...extra });

/** a wall clad in the chosen material; u/v repeat follow its real size */
function wallMat(o: GarageOpts, w: number, h: number) {
  if (o.cladding === 'sheet') return std(o.wall, { map: pattern('sheet', w / 1.28, 1), roughness: 0.45, metalness: 0.35 });
  if (o.cladding === 'wood') return std(o.wall, { map: pattern('wood', w / 1.2, h / 0.8), roughness: 0.8 });
  return std(o.wall, { map: pattern('render', w / 1.5, h / 1.5), roughness: 0.92, metalness: 0 });
}

/* ---------- the garage ---------- */

export function buildGarage(o: GarageOpts): THREE.Group {
  const g = new THREE.Group();
  const { width: W, depth: D, height: H } = o;
  const t = 0.12; // wall thickness
  const trim = std(o.trim, { roughness: 0.5, metalness: 0.3 });

  // slab
  g.add(box(W + 0.3, 0.12, D + 0.3, std('#9b9893', { roughness: 0.95 }), 0, 0.06, 0));

  // side and back walls
  g.add(box(t, H, D, wallMat(o, D, H), -W / 2 + t / 2, H / 2 + 0.12, 0));
  g.add(box(t, H, D, wallMat(o, D, H), W / 2 - t / 2, H / 2 + 0.12, 0));
  g.add(box(W, H, t, wallMat(o, W, H), 0, H / 2 + 0.12, -D / 2 + t / 2));

  // front wall around the door opening(s)
  const n = o.doors;
  const dw = n === 2 ? Math.min(2.6, (W - 0.9) / 2) : Math.min(o.door === 'swing' ? 2.6 : 3.0, W - 0.7);
  const dh = Math.min(2.25, H - 0.35);
  const gap = n === 2 ? W - 2 * dw - 0.6 : 0; // pier between two doors
  const side = (W - n * dw - gap) / 2;
  const z = D / 2 - t / 2;
  const y0 = 0.12;
  g.add(box(side, H, t, wallMat(o, side, H), -W / 2 + side / 2, y0 + H / 2, z));
  g.add(box(side, H, t, wallMat(o, side, H), W / 2 - side / 2, y0 + H / 2, z));
  if (n === 2) g.add(box(gap, H, t, wallMat(o, gap, H), 0, y0 + H / 2, z));
  g.add(box(W - 2 * side, H - dh, t, wallMat(o, W, H - dh), 0, y0 + dh + (H - dh) / 2, z));

  // doors
  const doorX = n === 2 ? [-(gap / 2 + dw / 2), gap / 2 + dw / 2] : [0];
  for (const x of doorX) {
    const dz = D / 2 - t + 0.03;
    if (o.door === 'sectional') {
      g.add(box(dw, dh, 0.05, std(o.trim, { map: pattern('sectional', dw / 0.5, 1), roughness: 0.4, metalness: 0.35 }), x, y0 + dh / 2, dz));
    } else if (o.door === 'tilt') {
      g.add(box(dw, dh, 0.05, std(o.trim, { map: pattern('sheet', dw / 0.9, 1), roughness: 0.4, metalness: 0.4 }), x, y0 + dh / 2, dz));
      g.add(box(0.28, 0.05, 0.04, std('#c8c8c8', { metalness: 0.9, roughness: 0.25 }), x, y0 + dh * 0.45, dz + 0.04));
    } else {
      // two swing leaves with a visible split and handles
      for (const s of [-1, 1]) {
        g.add(box(dw / 2 - 0.015, dh, 0.05, wallMat({ ...o, wall: o.trim }, dw / 2, dh), x + (s * dw) / 4, y0 + dh / 2, dz));
        g.add(box(0.03, 0.22, 0.04, std('#bdbdbd', { metalness: 0.9, roughness: 0.25 }), x + s * 0.06, y0 + dh * 0.5, dz + 0.04));
      }
    }
    // frame
    g.add(box(dw + 0.1, 0.06, 0.08, trim, x, y0 + dh + 0.03, D / 2 - 0.02));
    for (const s of [-1, 1]) g.add(box(0.05, dh, 0.08, trim, x + (s * (dw + 0.05)) / 2, y0 + dh / 2, D / 2 - 0.02));
  }

  // side door (right wall) and window (left wall)
  if (o.sideDoor) {
    g.add(box(0.05, 2.0, 0.9, std(o.trim, { roughness: 0.4, metalness: 0.3 }), W / 2 + 0.01, y0 + 1.0, D / 2 - 1.3));
    g.add(box(0.04, 0.03, 0.14, std('#c8c8c8', { metalness: 0.9, roughness: 0.25 }), W / 2 + 0.05, y0 + 1.0, D / 2 - 1.62));
  }
  if (o.window) {
    g.add(box(0.05, 0.6, 1.0, trim, -W / 2 - 0.01, y0 + H * 0.62, 0));
    g.add(box(0.03, 0.5, 0.9, new THREE.MeshStandardMaterial({ color: '#9fb6c8', roughness: 0.05, metalness: 0.6 }), -W / 2 - 0.035, y0 + H * 0.62, 0));
  }

  // roof
  const top = y0 + H;
  const roofMat = std(o.trim, { map: pattern('sheet', 1, (D + 0.6) / 1.28), roughness: 0.45, metalness: 0.4 });
  const ov = 0.25; // overhang
  if (o.roof === 'flat') {
    g.add(box(W + 2 * ov, 0.16, D + 2 * ov, roofMat, 0, top + 0.08, 0));
    g.add(box(W + 2 * ov + 0.04, 0.22, 0.05, trim, 0, top + 0.1, D / 2 + ov));
  } else if (o.roof === 'mono') {
    const rise = 0.55;
    const run = W + 2 * ov;
    const len = Math.hypot(run, rise);
    const slab = box(len, 0.12, D + 2 * ov, std(o.trim, { map: pattern('sheet', 1, 1), roughness: 0.45, metalness: 0.4 }), 0, top + rise / 2 + 0.06, 0);
    slab.rotation.z = Math.atan2(rise, run);
    g.add(slab);
    // the raised wall triangle on the front and back
    for (const zz of [D / 2 - t / 2, -D / 2 + t / 2]) {
      const sh = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(W / 2, rise * (W / run))]);
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), wallMat(o, W, rise));
      m.position.set(0, top, zz - t / 2);
      m.castShadow = true;
      g.add(m);
    }
  } else {
    const rise = Math.min(1.4, W * 0.28);
    const half = W / 2 + ov;
    const len = Math.hypot(half, rise);
    for (const s of [-1, 1]) {
      const p = box(len, 0.12, D + 2 * ov, std(o.trim, { map: pattern('sheet', 1, 1), roughness: 0.45, metalness: 0.4 }), (s * half) / 2, top + rise / 2 + 0.06, 0);
      p.rotation.z = -s * Math.atan2(rise, half);
      g.add(p);
    }
    g.add(box(0.12, 0.12, D + 2 * ov, trim, 0, top + rise + 0.1, 0));
    for (const zz of [D / 2 - t / 2, -D / 2 + t / 2]) {
      const sh = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, rise * (W / 2 / half))]);
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), wallMat(o, W, rise));
      m.position.set(0, top, zz - t / 2);
      m.castShadow = true;
      g.add(m);
    }
  }

  // gutter + downpipe along the right eave
  if (o.gutter) {
    const gm = std(o.trim, { metalness: 0.6, roughness: 0.35 });
    const eaveY = o.roof === 'mono' ? top + 0.55 : o.roof === 'flat' ? top + 0.02 : top - 0.02;
    const gx = W / 2 + ov + 0.04;
    const gut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, D + 2 * ov, 16), gm);
    gut.rotation.x = Math.PI / 2;
    gut.position.set(gx, eaveY, 0);
    gut.castShadow = true;
    g.add(gut);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, eaveY - 0.1, 12), gm);
    pipe.position.set(gx, (eaveY + 0.1) / 2, D / 2 + ov - 0.15);
    pipe.castShadow = true;
    g.add(pipe);
  }
  return g;
}

/** ground, driveway and a few trees for scale */
export function buildGround(garage: GarageOpts): THREE.Group {
  const g = new THREE.Group();
  const grass = new THREE.Mesh(new THREE.CircleGeometry(120, 64), new THREE.MeshStandardMaterial({ map: pattern('grass', 54, 54), roughness: 1 }));
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  g.add(grass);
  const dl = 9;
  const drive = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.min(garage.width, 5), dl),
    new THREE.MeshStandardMaterial({ map: pattern('gravel', Math.min(garage.width, 5) / 1.5, dl / 1.5), roughness: 1 }),
  );
  drive.rotation.x = -Math.PI / 2;
  drive.position.set(0, 0.01, garage.depth / 2 + dl / 2);
  drive.receiveShadow = true;
  g.add(drive);
  // simple trees, placed outside the plot
  const trunk = std('#6b4a32', { roughness: 0.9 });
  const leaves = std('#4f7a3a', { roughness: 0.9 });
  for (const [x, z, s] of [[-garage.width / 2 - 4.5, -2, 1.1], [garage.width / 2 + 5, -4, 0.9], [-garage.width / 2 - 6, 4, 0.8]] as const) {
    g.add(box(0.25 * s, 1.6 * s, 0.25 * s, trunk, x, 0.8 * s, z));
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3 * s, 1), leaves);
    crown.position.set(x, 2.4 * s, z);
    crown.castShadow = true;
    g.add(crown);
  }
  return g;
}

/** free GPU memory of a rebuilt group (textures are clones of cached canvases) */
export function disposeGroup(g: THREE.Object3D) {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry.dispose();
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mat of mats) {
      (mat as THREE.MeshStandardMaterial).map?.dispose();
      mat.dispose();
    }
  });
}
