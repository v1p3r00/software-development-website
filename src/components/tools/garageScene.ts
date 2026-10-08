import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * A procedural garage, rebuilt from plain options.                   *
 * Units are metres; the garage door faces +z, the plot opens to +z.  *
 * Every roof is solved from the wall line, so the roof underside     *
 * sits exactly on the wall tops and the gable / mono infills.        *
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
  handle: string;
  sideDoor: boolean;
  window: boolean;
  gutter: boolean;
}

/** handle finishes: colour plus how metallic and glossy they read */
export const HANDLE_FINISH: Record<string, { metalness: number; roughness: number }> = {
  '#c9ccd0': { metalness: 0.95, roughness: 0.22 }, // brushed stainless
  '#1b1c1e': { metalness: 0.55, roughness: 0.38 }, // matt black
  '#c49a52': { metalness: 1, roughness: 0.28 }, // brass
  '#b87452': { metalness: 1, roughness: 0.3 }, // copper
  '#f2f2f0': { metalness: 0.1, roughness: 0.35 }, // white
};

/* ---------- textures drawn once in a canvas ---------- */

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
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
  // the same ribs as a height map, for light to catch
  sheetBump: () =>
    canvasTex(
      128,
      16,
      (g) => {
        g.fillStyle = '#000';
        g.fillRect(0, 0, 128, 16);
        for (const x0 of [0, 64]) {
          const gr = g.createLinearGradient(x0, 0, x0 + 64, 0);
          gr.addColorStop(0, '#000');
          gr.addColorStop(0.28, '#000');
          gr.addColorStop(0.36, '#fff');
          gr.addColorStop(0.62, '#fff');
          gr.addColorStop(0.7, '#000');
          g.fillStyle = gr;
          g.fillRect(x0, 0, 64, 16);
        }
      },
      false,
    ),
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
  woodBump: () =>
    canvasTex(
      256,
      256,
      (g) => {
        g.fillStyle = '#fff';
        g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 4; i++) {
          g.fillStyle = '#000';
          g.fillRect(0, i * 64 + 61, 256, 3);
        }
      },
      false,
    ),
  render: () =>
    canvasTex(128, 128, (g) => {
      g.fillStyle = '#f3f3f3';
      g.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
        g.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5);
      }
    }),
  // sectional door: four panels, each with a groove and a soft fold
  sectional: () =>
    canvasTex(64, 256, (g) => {
      g.fillStyle = '#f4f4f4';
      g.fillRect(0, 0, 64, 256);
      for (let i = 0; i < 4; i++) {
        const y = i * 64;
        const gr = g.createLinearGradient(0, y, 0, y + 64);
        gr.addColorStop(0, '#d2d2d2');
        gr.addColorStop(0.06, '#ffffff');
        gr.addColorStop(0.5, '#ededed');
        gr.addColorStop(0.94, '#f7f7f7');
        gr.addColorStop(1, '#bdbdbd');
        g.fillStyle = gr;
        g.fillRect(0, y, 64, 64);
      }
    }),
  sectionalBump: () =>
    canvasTex(
      64,
      256,
      (g) => {
        g.fillStyle = '#fff';
        g.fillRect(0, 0, 64, 256);
        for (let i = 0; i < 4; i++) {
          g.fillStyle = '#000';
          g.fillRect(0, i * 64, 64, 3);
          g.fillStyle = '#9a9a9a';
          g.fillRect(0, i * 64 + 31, 64, 2);
        }
      },
      false,
    ),
  // lawn with soft, uneven colour
  grass: () =>
    canvasTex(512, 512, (g) => {
      g.fillStyle = '#62874a';
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = 30 + Math.random() * 90;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        const c = Math.random() > 0.5 ? '130,165,85' : '60,95,45';
        gr.addColorStop(0, `rgba(${c},0.18)`);
        gr.addColorStop(1, `rgba(${c},0)`);
        g.fillStyle = gr;
        g.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
      for (let i = 0; i < 16000; i++) {
        const v = Math.random();
        g.fillStyle = v > 0.5 ? `rgba(175,205,120,${v * 0.22})` : `rgba(35,65,28,${v * 0.3})`;
        g.fillRect(Math.random() * 512, Math.random() * 512, 1.2, 3.2);
      }
    }),
  // large-format concrete pavers, staggered, with joints
  pavers: () =>
    canvasTex(256, 256, (g) => {
      g.fillStyle = '#6f6d69';
      g.fillRect(0, 0, 256, 256);
      const rows = 4;
      const h = 256 / rows;
      for (let r = 0; r < rows; r++) {
        const off = r % 2 ? 64 : 0;
        for (let k = -1; k < 2; k++) {
          const x = k * 128 + off;
          const v = 168 + Math.random() * 18;
          g.fillStyle = `rgb(${v},${v - 3},${v - 8})`;
          g.fillRect(x + 2, r * h + 2, 124, h - 4);
          for (let i = 0; i < 260; i++) {
            g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
            g.fillRect(x + 2 + Math.random() * 124, r * h + 2 + Math.random() * (h - 4), 1.4, 1.4);
          }
        }
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
  if (o.cladding === 'sheet')
    return std(o.wall, { map: pattern('sheet', w / 1.28, 1), bumpMap: pattern('sheetBump', w / 1.28, 1), bumpScale: 1.2, roughness: 0.42, metalness: 0.45 });
  if (o.cladding === 'wood') return std(o.wall, { map: pattern('wood', w / 1.2, h / 0.8), bumpMap: pattern('woodBump', w / 1.2, h / 0.8), bumpScale: 1, roughness: 0.78 });
  return std(o.wall, { map: pattern('render', w / 1.5, h / 1.5), roughness: 0.92, metalness: 0 });
}

/** one cladding material for every wall piece, tiled per metre; pair it with worldUV so the pattern runs on across joints */
function cladMat(o: GarageOpts) {
  if (o.cladding === 'sheet')
    return std(o.wall, { map: pattern('sheet', 1 / 1.28, 1 / 2.5), bumpMap: pattern('sheetBump', 1 / 1.28, 1 / 2.5), bumpScale: 1.2, roughness: 0.42, metalness: 0.45 });
  if (o.cladding === 'wood') return std(o.wall, { map: pattern('wood', 1 / 1.2, 1 / 0.8), bumpMap: pattern('woodBump', 1 / 1.2, 1 / 0.8), bumpScale: 1, roughness: 0.78 });
  return std(o.wall, { map: pattern('render', 1 / 1.5, 1 / 1.5), roughness: 0.92, metalness: 0 });
}

/** replace a mesh's UVs with a box projection of its position in the garage, in metres */
function worldUV(m: THREE.Mesh) {
  m.updateMatrix();
  const geo = m.geometry;
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).applyMatrix4(m.matrix);
    n.fromBufferAttribute(nor, i).applyQuaternion(m.quaternion);
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    if (ay > ax && ay > az) uv.set([p.x, p.z], i * 2);
    else if (ax > az) uv.set([p.z, p.y], i * 2);
    else uv.set([p.x, p.y], i * 2);
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

const handleMat = (o: GarageOpts) => std(o.handle, HANDLE_FINISH[o.handle] ?? { metalness: 0.9, roughness: 0.25 });

/** a slim lever handle on a rose, pointing along +x (s = -1 mirrors it) */
function lever(mat: THREE.Material, x: number, y: number, z: number, s = 1, along: 'x' | 'z' = 'x') {
  const g = new THREE.Group();
  const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.012, 20), mat);
  rose.rotation.x = Math.PI / 2;
  const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.11, 4, 10), mat);
  grip.rotation.z = Math.PI / 2;
  grip.position.set(s * 0.06, 0, 0.035);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.035, 10), mat);
  neck.rotation.x = Math.PI / 2;
  neck.position.z = 0.018;
  g.add(rose, neck, grip);
  for (const c of g.children) c.castShadow = true;
  g.position.set(x, y, z);
  if (along === 'z') g.rotation.y = Math.PI / 2;
  return g;
}

/* ---------- mood lights (only built at night) ---------- */

const WARM = '#ffb866';

/** a wall lantern: a slim dark housing with a glowing lens and a warm light */
function lantern(x: number, y: number, z: number, night: boolean, faceX = 0) {
  const g = new THREE.Group();
  const body = std('#1d1f22', { metalness: 0.6, roughness: 0.4 });
  g.add(box(0.12, 0.34, 0.1, body, 0, 0, 0));
  const lens = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.26, 0.02),
    new THREE.MeshStandardMaterial({ color: '#fff2dc', emissive: WARM, emissiveIntensity: night ? 3.2 : 0, roughness: 0.3 }),
  );
  lens.position.z = 0.055;
  g.add(lens);
  if (night) {
    const l = new THREE.PointLight(WARM, 5, 7, 2);
    l.position.set(0, 0, 0.35);
    g.add(l);
    // a soft wash down the wall
    const down = new THREE.SpotLight(WARM, 9, 6, 0.75, 0.9, 2);
    down.position.set(0, -0.1, 0.12);
    down.target.position.set(0, -2, 0.25);
    g.add(down, down.target);
  }
  g.position.set(x, y, z);
  g.rotation.y = faceX ? (faceX > 0 ? Math.PI / 2 : -Math.PI / 2) : 0;
  return g;
}

/** a low garden bollard along the driveway */
function bollard(x: number, z: number, night: boolean) {
  const g = new THREE.Group();
  const body = std('#2a2c2f', { metalness: 0.5, roughness: 0.45 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.55, 20), body);
  post.position.y = 0.275;
  post.castShadow = true;
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.058, 0.07, 20),
    new THREE.MeshStandardMaterial({ color: '#fff4e0', emissive: WARM, emissiveIntensity: night ? 2.6 : 0 }),
  );
  lens.position.y = 0.47;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 20), body);
  cap.position.y = 0.52;
  g.add(post, lens, cap);
  if (night) {
    const l = new THREE.PointLight(WARM, 2.2, 3.2, 2);
    l.position.y = 0.45;
    g.add(l);
  }
  g.position.set(x, 0, z);
  return g;
}

/* ---------- the garage ---------- */

export function buildGarage(o: GarageOpts, night = false): THREE.Group {
  const g = new THREE.Group();
  const { width: W, depth: D, height: H } = o;
  const t = 0.12; // wall thickness
  const y0 = 0.12; // slab top
  const top = y0 + H;
  const trim = std(o.trim, { roughness: 0.42, metalness: 0.45 });
  const hm = handleMat(o);
  const clad = cladMat(o);

  // slab with a darker chamfered plinth
  g.add(box(W + 0.3, 0.12, D + 0.3, std('#8f8c87', { roughness: 0.95 }), 0, 0.06, 0));
  g.add(box(W + 0.34, 0.03, D + 0.34, std('#6d6a66', { roughness: 0.9 }), 0, 0.015, 0));

  // side and back walls
  g.add(box(t, H, D, clad, -W / 2 + t / 2, y0 + H / 2, 0));
  g.add(box(t, H, D, clad, W / 2 - t / 2, y0 + H / 2, 0));
  g.add(box(W - 2 * t, H, t, clad, 0, y0 + H / 2, -D / 2 + t / 2));

  // front wall around the door opening(s)
  const n = o.doors;
  const dw = n === 2 ? Math.min(2.6, (W - 0.9) / 2) : Math.min(o.door === 'swing' ? 2.6 : 3.0, W - 0.9);
  const dh = Math.min(2.25, H - 0.35);
  const gap = n === 2 ? W - 2 * dw - 0.6 : 0; // pier between two doors
  const side = (W - n * dw - gap) / 2;
  const z = D / 2 - t / 2;
  g.add(box(side, H, t, clad, -W / 2 + side / 2, y0 + H / 2, z));
  g.add(box(side, H, t, clad, W / 2 - side / 2, y0 + H / 2, z));
  if (n === 2) g.add(box(gap, H, t, clad, 0, y0 + H / 2, z));
  g.add(box(W - 2 * side, H - dh, t, clad, 0, y0 + dh + (H - dh) / 2, z));

  // corner flashings: they close the wall joints and frame the building
  const cf = 0.07;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(cf, H, cf, trim, sx * (W / 2 - cf / 2 + 0.012), y0 + H / 2, sz * (D / 2 - cf / 2 + 0.012)));

  // doors, set into the opening with a reveal; each one registers how it moves, so they can open without a rebuild
  const doorX = n === 2 ? [-(gap / 2 + dw / 2), gap / 2 + dw / 2] : [0];
  const dz = D / 2 - t + 0.035;
  const movers: ((k: number) => void)[] = [];
  for (const x of doorX) {
    if (o.door === 'sectional') {
      // four panels that run up a curved track and back under the roof
      const zt = D / 2 - t - 0.03;
      const ph = dh / 4;
      const r = Math.max(0.12, Math.min(0.25, H - dh - 0.08));
      const arc = (Math.PI / 2) * r;
      const panels: THREE.Group[] = [];
      for (let i = 0; i < 4; i++) {
        const map = pattern('sectional', dw / 0.5, 0.25);
        const bump = pattern('sectionalBump', dw / 0.5, 0.25);
        map.offset.y = bump.offset.y = i * 0.25;
        const pg = new THREE.Group();
        pg.add(box(dw, ph - 0.004, 0.045, std(o.trim, { map, bumpMap: bump, bumpScale: 1.4, roughness: 0.36, metalness: 0.4 })));
        if (i === 0) {
          // a long pull bar near the bottom
          pg.add(box(0.42, 0.025, 0.025, hm, 0, 0.42 - ph / 2, 0.045));
          for (const sg of [-1, 1]) pg.add(box(0.02, 0.02, 0.04, hm, sg * 0.19, 0.42 - ph / 2, 0.03));
        }
        g.add(pg);
        panels.push(pg);
      }
      movers.push((k) => {
        panels.forEach((pg, i) => {
          const sv = (i + 0.5) * ph + k * dh;
          if (sv <= dh) {
            pg.position.set(x, y0 + sv, zt);
            pg.rotation.x = 0;
          } else if (sv <= dh + arc) {
            const a = (sv - dh) / r;
            pg.position.set(x, y0 + dh + r * Math.sin(a), zt - r + r * Math.cos(a));
            pg.rotation.x = -a;
          } else {
            pg.position.set(x, y0 + dh + r, zt - r - (sv - dh - arc));
            pg.rotation.x = -Math.PI / 2;
          }
        });
      });
    } else if (o.door === 'tilt') {
      // up & over: the top runs back under the head, the bottom swings out into a canopy
      const zt = D / 2 - t - 0.02;
      const leaf = new THREE.Group();
      leaf.add(box(dw, dh, 0.05, std(o.trim, { map: pattern('sheet', dw / 0.9, 1), bumpMap: pattern('sheetBump', dw / 0.9, 1), bumpScale: 1.2, roughness: 0.38, metalness: 0.45 })));
      leaf.add(box(0.3, 0.05, 0.03, hm, 0, dh * 0.45 - dh / 2, 0.045));
      leaf.add(box(0.07, 0.07, 0.012, hm, 0, dh * 0.45 - dh / 2, 0.03));
      g.add(leaf);
      movers.push((k) => {
        const a = k * (Math.PI / 2 - 0.02);
        leaf.rotation.x = -a;
        leaf.position.set(x, y0 + dh - (dh / 2) * Math.cos(a) - 0.04 * Math.sin(a), zt - 0.2 * dh * Math.sin(a));
      });
    } else {
      // two swing leaves on outer hinges, meeting on a cover strip, with lever handles
      const leaves: THREE.Group[] = [];
      for (const sg of [-1, 1]) {
        const hinge = new THREE.Group();
        hinge.position.set(x + (sg * dw) / 2, y0, dz + 0.025);
        const lw = dw / 2 - 0.004;
        hinge.add(box(lw, dh, 0.05, wallMat({ ...o, wall: o.trim }, dw / 2, dh), (-sg * lw) / 2, dh / 2, -0.025));
        hinge.add(lever(hm, -sg * (dw / 2 - 0.09), 1.05, 0.005, sg));
        if (sg === 1) hinge.add(box(0.04, dh, 0.012, trim, -dw / 2, dh / 2, 0.006));
        hinge.userData.side = sg;
        g.add(hinge);
        leaves.push(hinge);
      }
      movers.push((k) => {
        for (const h of leaves) h.rotation.y = h.userData.side * k * 1.75;
      });
    }
    // frame: head and jambs wrap the reveal, flush with the wall face
    // (they overlap the wall ends by a few millimetres, so no faces are coplanar and nothing flickers)
    g.add(box(dw + 0.13, 0.07, t + 0.02, trim, x, y0 + dh + 0.03, D / 2 - t / 2));
    for (const s of [-1, 1]) g.add(box(0.07, dh - 0.004, t + 0.02, trim, x + s * (dw / 2 + 0.03), y0 + dh / 2, D / 2 - t / 2));
  }

  // side door (right wall), with its own frame, canopy and lever
  if (o.sideDoor) {
    const sz = D / 2 - 1.3;
    g.add(box(0.05, 2.0, 0.9, std(o.trim, { roughness: 0.36, metalness: 0.35 }), W / 2 + 0.005, y0 + 1.0, sz));
    g.add(box(0.07, 0.06, 1.02, trim, W / 2 + 0.01, y0 + 2.03, sz));
    for (const s of [-1, 1]) g.add(box(0.07, 2.0, 0.06, trim, W / 2 + 0.01, y0 + 1.0, sz + s * 0.48));
    g.add(box(0.5, 0.05, 1.2, trim, W / 2 + 0.25, y0 + 2.28, sz));
    g.add(lever(hm, W / 2 + 0.035, y0 + 1.02, sz - 0.34, -1, 'z'));
    if (night) g.add(lantern(W / 2 + 0.06, y0 + 1.9, sz + 0.75, true, 1));
  }
  // window (left wall): frame, sill, glass that glows from inside at night
  if (o.window) {
    const wy = y0 + H * 0.62;
    g.add(box(0.06, 0.66, 1.06, trim, -W / 2 - 0.01, wy, 0));
    g.add(
      box(
        0.03,
        0.54,
        0.94,
        new THREE.MeshStandardMaterial({ color: night ? '#ffd9a0' : '#8fa8bb', roughness: 0.05, metalness: night ? 0 : 0.7, emissive: night ? '#ffb15a' : '#000', emissiveIntensity: night ? 1.4 : 0 }),
        -W / 2 - 0.04,
        wy,
        0,
      ),
    );
    g.add(box(0.03, 0.54, 0.03, trim, -W / 2 - 0.055, wy, 0));
    g.add(box(0.14, 0.04, 1.16, trim, -W / 2 - 0.06, wy - 0.35, 0));
  }

  // roof
  const ov = 0.3; // overhang
  const T = 0.1; // roof sheet thickness
  const roofMat = (rx: number, ry: number) =>
    std(o.trim, { map: pattern('sheet', rx, ry), bumpMap: pattern('sheetBump', rx, ry), bumpScale: 1.2, roughness: 0.4, metalness: 0.5 });
  const fascia = std(o.trim, { roughness: 0.4, metalness: 0.45 });
  let gutterSide = 1;
  let eaveY = top;

  if (o.roof === 'flat') {
    g.add(box(W + 2 * ov, 0.16, D + 2 * ov, roofMat(1, 1), 0, top + 0.08, 0));
    // a crisp fascia band all round
    for (const s of [-1, 1]) {
      g.add(box(W + 2 * ov + 0.06, 0.26, 0.03, fascia, 0, top + 0.1, s * (D / 2 + ov + 0.015)));
      g.add(box(0.03, 0.26, D + 2 * ov, fascia, s * (W / 2 + ov + 0.015), top + 0.1, 0));
    }
    eaveY = top - 0.02;
  } else if (o.roof === 'mono') {
    const R = 0.55; // rise across the walls, low side left
    const k = R / W;
    const ang = Math.atan(k);
    const span = W + 2 * ov;
    const L = span / Math.cos(ang);
    const slab = box(L, T, D + 2 * ov, roofMat((D + 2 * ov) / 1.28, 1), 0, 0, 0);
    // the underside passes through (-W/2, top) and (W/2, top + R)
    slab.position.set(-(T / 2) * Math.sin(ang), top + R / 2 + (T / 2) * Math.cos(ang), 0);
    slab.rotation.z = ang;
    // ribs run down the slope: turn the texture
    (slab.material as THREE.MeshStandardMaterial).map!.rotation = Math.PI / 2;
    (slab.material as THREE.MeshStandardMaterial).bumpMap!.rotation = Math.PI / 2;
    g.add(slab);
    // infills: the triangles front and back, and the strip on top of the high wall
    for (const zz of [D / 2 - t / 2, -D / 2 + t / 2]) {
      const sh = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(W / 2, R)]);
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), clad);
      m.position.set(0, top, zz - t / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    }
    g.add(box(t, R, D, clad, W / 2 - t / 2, top + R / 2, 0));
    g.add(box(cf, R, cf, trim, W / 2 - cf / 2 + 0.012, top + R / 2, D / 2 - cf / 2 + 0.012));
    g.add(box(cf, R, cf, trim, W / 2 - cf / 2 + 0.012, top + R / 2, -D / 2 + cf / 2 - 0.012));
    // barge boards on the sloped edges, fascia on the low and high edges
    for (const s of [-1, 1]) {
      const b = box(L + 0.02, 0.2, 0.03, fascia, slab.position.x, slab.position.y - 0.03, s * (D / 2 + ov + 0.015));
      b.rotation.z = ang;
      g.add(b);
    }
    const lowY = top - k * ov;
    const highY = top + R + k * ov;
    g.add(box(0.03, 0.2, D + 2 * ov + 0.06, fascia, -(W / 2 + ov) - 0.01, lowY + 0.02, 0));
    g.add(box(0.03, 0.2, D + 2 * ov + 0.06, fascia, W / 2 + ov + 0.01, highY + 0.02, 0));
    gutterSide = -1;
    eaveY = lowY - 0.06;
  } else {
    const R = Math.min(1.4, W * 0.28); // apex above the wall tops
    const k = R / (W / 2);
    const ang = Math.atan(k);
    const hs = W / 2 + ov;
    const L = hs / Math.cos(ang);
    for (const s of [-1, 1]) {
      const p = box(L + 0.04, T, D + 2 * ov, roofMat((D + 2 * ov) / 1.28, 1), 0, 0, 0);
      // the underside runs from the apex (0, top + R) through the wall top (±W/2, top)
      p.position.set(s * (hs / 2) - s * (T / 2) * Math.sin(ang), top + R - k * (hs / 2) + (T / 2) * Math.cos(ang), 0);
      p.rotation.z = -s * ang;
      (p.material as THREE.MeshStandardMaterial).map!.rotation = Math.PI / 2;
      (p.material as THREE.MeshStandardMaterial).bumpMap!.rotation = Math.PI / 2;
      g.add(p);
      // barge boards along both sloped gable edges
      for (const sz of [-1, 1]) {
        const b = box(L + 0.06, 0.2, 0.03, fascia, p.position.x, p.position.y - 0.03, sz * (D / 2 + ov + 0.015));
        b.rotation.z = -s * ang;
        g.add(b);
      }
      // eave fascia
      g.add(box(0.03, 0.2, D + 2 * ov + 0.06, fascia, s * (hs + 0.01), top - k * ov + 0.02, 0));
    }
    // ridge cap
    const cap = box(0.3, 0.06, D + 2 * ov + 0.06, fascia, 0, top + R + T / Math.cos(ang) + 0.01, 0);
    g.add(cap);
    for (const zz of [D / 2 - t / 2, -D / 2 + t / 2]) {
      const sh = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, R)]);
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), clad);
      m.position.set(0, top, zz - t / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    }
    eaveY = top - k * ov - 0.06;
  }

  // half-round gutter under the eave edge, and a downpipe at the front corner
  if (o.gutter) {
    const gm = std(o.trim, { metalness: 0.6, roughness: 0.32 });
    const gx = gutterSide * (W / 2 + ov + 0.07);
    const gut = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, D + 2 * ov, 20, 1, false, 0, Math.PI), gm);
    gut.rotation.set(Math.PI / 2, 0, gutterSide > 0 ? 0 : Math.PI);
    gut.rotation.x = Math.PI / 2;
    gut.rotation.y = gutterSide > 0 ? -Math.PI / 2 : Math.PI / 2;
    gut.position.set(gx, eaveY, 0);
    gut.castShadow = true;
    g.add(gut);
    const pz = D / 2 + ov - 0.15;
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, eaveY - 0.12, 14), gm);
    pipe.position.set(gx, (eaveY + 0.12) / 2, pz);
    pipe.castShadow = true;
    g.add(pipe);
    // the elbow back to the wall line and the shoe at the bottom
    const shoe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 14), gm);
    shoe.rotation.z = (gutterSide * Math.PI) / 5;
    shoe.position.set(gx + gutterSide * 0.04, 0.14, pz);
    g.add(shoe);
  }

  // night: lanterns either side of the door(s) and a warm downlight strip under the front eave
  if (night) {
    const lx = W / 2 - side / 2;
    const ly = Math.min(y0 + dh + 0.2, top - 0.25);
    if (side > 0.35) for (const s of [-1, 1]) g.add(lantern(s * lx, ly, D / 2 + 0.05, true));
    // a slim linear light over each door head
    for (const x of doorX) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(dw * 0.92, 0.025, 0.035),
        new THREE.MeshStandardMaterial({ color: '#fff3df', emissive: WARM, emissiveIntensity: 2.4 }),
      );
      strip.position.set(x, y0 + dh + 0.13, D / 2 + 0.05);
      g.add(strip);
    }
    for (const x of doorX) {
      // grazing the door face, so the panels read
      const s = new THREE.SpotLight(WARM, 20, 8, 0.85, 0.8, 2);
      s.position.set(x, top - 0.05, D / 2 + ov * 0.7);
      s.target.position.set(x, 0, D / 2 + 0.3);
      g.add(s, s.target);
    }
  }
  g.traverse((c) => {
    const mesh = c as THREE.Mesh;
    if (mesh.isMesh && mesh.material === clad && mesh.parent === g) worldUV(mesh);
  });
  g.userData.doors = movers;
  setDoors(g, 0);
  return g;
}

/** open the garage doors: 0 closed, 1 fully open */
export function setDoors(g: THREE.Object3D, k: number) {
  const movers = g.userData.doors as ((k: number) => void)[] | undefined;
  movers?.forEach((m) => m(k));
}

/* ---------- the plot ---------- */

/** lawn, a paved drive with kerbs, garden lights at night and the oak trees */
export function buildGround(garage: GarageOpts, tree: THREE.Object3D | null, night = false): THREE.Group {
  const g = new THREE.Group();
  const grass = new THREE.Mesh(new THREE.CircleGeometry(140, 72), new THREE.MeshStandardMaterial({ map: pattern('grass', 40, 40), roughness: 1 }));
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  g.add(grass);

  const dl = 9;
  const dw = Math.min(garage.width, 5.2);
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(dw, dl), new THREE.MeshStandardMaterial({ map: pattern('pavers', dw / 1.2, dl / 1.2), roughness: 0.85 }));
  drive.rotation.x = -Math.PI / 2;
  drive.position.set(0, 0.012, garage.depth / 2 + 0.15 + dl / 2);
  drive.receiveShadow = true;
  g.add(drive);
  const kerb = std('#d6d3cc', { roughness: 0.9 });
  for (const s of [-1, 1]) g.add(box(0.1, 0.06, dl, kerb, s * (dw / 2 + 0.05), 0.03, garage.depth / 2 + 0.15 + dl / 2));

  for (const zz of [garage.depth / 2 + 2.6, garage.depth / 2 + 6.4]) for (const s of [-1, 1]) g.add(bollard(s * (dw / 2 + 0.45), zz, night));

  // the oaks frame the garage from behind and the sides, each turned and sized a little differently
  if (tree) {
    // kept outside the ring the camera presets move on, so they frame the view instead of blocking it
    const w = garage.width / 2;
    const d = garage.depth / 2;
    const spots: [number, number, number, number][] = [
      [-w - 11, -d - 7, 8.6, 0.4],
      [w + 10, -d - 12, 9.6, 2.1],
      [-w - 19, d + 2, 7.4, 4.0],
      [w + 23, -d + 1, 8.2, 5.3],
      [-3, -d - 19, 10.5, 1.2],
      [-w - 17, d + 15, 6.8, 3.1],
    ];
    for (const [x, z, h, rot] of spots) {
      const tr = tree.clone();
      tr.scale.setScalar(h);
      tr.position.set(x, 0, z);
      tr.rotation.y = rot;
      tr.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });
      tr.userData.shared = true;
      g.add(tr);
    }
  }
  return g;
}

/** free GPU memory of a rebuilt group (textures are clones of cached canvases; tree clones share the loaded model) */
export function disposeGroup(g: THREE.Object3D) {
  g.traverse((o) => {
    if (o.userData.shared) return;
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    let p: THREE.Object3D | null = m.parent;
    while (p) {
      if (p.userData.shared) return;
      p = p.parent;
    }
    m.geometry.dispose();
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mat of mats) {
      const sm = mat as THREE.MeshStandardMaterial;
      sm.map?.dispose();
      sm.bumpMap?.dispose();
      mat.dispose();
    }
  });
}
