import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMisc';

/**
 * A low-poly figure at a desk, flat-shaded and rendered the way a PlayStation 1
 * would have done it: a tiny internal framebuffer scaled up with no smoothing,
 * vertices snapped to that grid so they wobble as the model turns, and colours
 * quantised to a coarse palette. Equations orbit the head on top, drawn at full
 * resolution so they stay readable.
 *
 * Coordinates: +x right, +y up, +z toward the viewer at angle 0.
 */
type V3 = [number, number, number];
type Tri = { a: V3; b: V3; c: V3; color: V3; emissive?: boolean };

const FLOOR = -46;

const SKIN: V3 = [196, 142, 105];
const HAIR: V3 = [52, 42, 35];
const SHIRT: V3 = [60, 62, 68];
const TROUSER: V3 = [78, 80, 86];
const DESK: V3 = [96, 98, 103];
const CHAIR: V3 = [70, 72, 77];
const DEVICE: V3 = [112, 114, 119];

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

/**
 * A rectangular tube between two points, with its own half-width in x and z at
 * each end. Every limb, panel and slab in the model is one of these.
 */
function box(a: V3, b: V3, rxA: number, rzA: number, rxB: number, rzB: number, color: V3, emissive = false): Tri[] {
  const dir = norm(sub(b, a));
  const upGuess: V3 = Math.abs(dir[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0];
  const right = norm(cross(dir, upGuess));
  const up = norm(cross(right, dir));

  const at = (p: V3, rx: number, rz: number, sx: number, sz: number): V3 => [
    p[0] + right[0] * rx * sx + up[0] * rz * sz,
    p[1] + right[1] * rx * sx + up[1] * rz * sz,
    p[2] + right[2] * rx * sx + up[2] * rz * sz,
  ];

  const v = [
    at(a, rxA, rzA, -1, -1), at(a, rxA, rzA, 1, -1), at(a, rxA, rzA, 1, 1), at(a, rxA, rzA, -1, 1),
    at(b, rxB, rzB, -1, -1), at(b, rxB, rzB, 1, -1), at(b, rxB, rzB, 1, 1), at(b, rxB, rzB, -1, 1),
  ];
  const quads: Array<[number, number, number, number]> = [
    [0, 1, 2, 3], [7, 6, 5, 4],
    [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0],
  ];
  const tris: Tri[] = [];
  for (const [i, j, k, l] of quads) {
    tris.push({ a: v[i], b: v[j], c: v[k], color, emissive });
    tris.push({ a: v[i], b: v[k], c: v[l], color, emissive });
  }
  return tris;
}


/** A ring-by-ring lathe. Each ring is an ellipse in xz at its own height, with
 *  its own forward offset, so the profile can be shaped like a face. */
function lathe(
  rings: Array<{ y: number; rx: number; rz: number; zc: number }>,
  color: V3,
  segments = 10,
  capBottom?: V3,
  capTop?: V3,
): Tri[] {
  const ring = (r: { y: number; rx: number; rz: number; zc: number }) =>
    Array.from({ length: segments }, (_, i) => {
      const a = (i / segments) * Math.PI * 2;
      return [Math.sin(a) * r.rx, r.y, Math.cos(a) * r.rz + r.zc] as V3;
    });

  const loops = rings.map(ring);
  const tris: Tri[] = [];
  for (let r = 0; r < loops.length - 1; r++) {
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments;
      const a = loops[r][i];
      const b = loops[r][j];
      const c = loops[r + 1][j];
      const d = loops[r + 1][i];
      tris.push({ a, b, c, color }, { a, b: c, c: d, color });
    }
  }
  if (capBottom) {
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments;
      tris.push({ a: capBottom, b: loops[0][j], c: loops[0][i], color });
    }
  }
  if (capTop) {
    const top = loops[loops.length - 1];
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments;
      tris.push({ a: capTop, b: top[i], c: top[j], color });
    }
  }
  return tris;
}

/** Head profile: jaw, cheeks, brow, skull. +z is the front of the face. */
const HEAD_RINGS = [
  { y: 58.4, rx: 3.88, rz: 4.33, zc: 1.6 },
  { y: 60.8, rx: 6.38, rz: 6.61, zc: 1.0 },
  { y: 63.6, rx: 7.98, rz: 8.21, zc: 0.4 },
  { y: 66.6, rx: 8.89, rz: 9.12, zc: 0.0 },
  { y: 69.6, rx: 9.12, rz: 9.46, zc: -0.5 },
  { y: 72.6, rx: 8.78, rz: 9.12, zc: -0.9 },
  { y: 75.4, rx: 7.07, rz: 7.52, zc: -1.3 },
  { y: 77.4, rx: 4.10, rz: 4.45, zc: -1.5 },
];

function headMesh(): Tri[] {
  const tris: Tri[] = [
    ...lathe(HEAD_RINGS, SKIN, 10, [0, 56.4, 2.2], [0, 78.8, -1.5]),
    // nose
    {
      a: [0, 70.4, 9.3] as V3, b: [-2.1, 66.3, 9.1] as V3, c: [0, 65.4, 11.9] as V3, color: SKIN,
    },
    { a: [0, 70.4, 9.3] as V3, b: [0, 65.4, 11.9] as V3, c: [2.1, 66.3, 9.1] as V3, color: SKIN },
    { a: [-2.1, 66.3, 9.1] as V3, b: [2.1, 66.3, 9.1] as V3, c: [0, 65.4, 11.9] as V3, color: SKIN },
    // ears
    ...box([-8.9, 68.6, -1.2], [-10.1, 68.6, -1.2], 1.1, 2.7, 1.1, 2.7, SKIN),
    ...box([8.9, 68.6, -1.2], [10.1, 68.6, -1.2], 1.1, 2.7, 1.1, 2.7, SKIN),
  ];

  // hair: the same skull, a little larger, from the brow up and around the back
  const hairRings = HEAD_RINGS.slice(3).map((r, i) => ({
    y: r.y + (i === 0 ? 0 : 0.2),
    rx: r.rx + 0.75,
    rz: r.rz + 0.75,
    zc: r.zc - 1.4,
  }));
  tris.push(...lathe(hairRings, HAIR, 10, undefined, [0, 79.6, -2.9]));
  return tris;
}

function buildMesh(): Tri[] {
  const hip: V3 = [0, 0, 2];
  const shoulder: V3 = [0, 49, -5];
  const shoulderL: V3 = [-16, 47, -5];
  const shoulderR: V3 = [16, 47, -5];
  const elbowL: V3 = [-21, 30, 4];
  const elbowR: V3 = [21, 30, 4];
  const wristL: V3 = [-13, 26, 32];
  const wristR: V3 = [13, 26, 32];
  const hipL: V3 = [-10, 0, 4];
  const hipR: V3 = [10, 0, 4];
  const kneeL: V3 = [-10, 2, 30];
  const kneeR: V3 = [10, 2, 30];
  const ankleL: V3 = [-10, FLOOR + 4, 34];
  const ankleR: V3 = [10, FLOOR + 4, 34];
  const toeL: V3 = [-10, FLOOR, 43];
  const toeR: V3 = [10, FLOOR, 43];

  return [
    // chair
    ...box([0, -7, 1], [0, -4, 1], 15, 12, 15, 12, CHAIR),
    ...box([0, -4, -11], [0, 13, -12], 13, 1.4, 12, 1.4, CHAIR),
    ...box([-13, FLOOR, -9], [-13, -6, -9], 1.4, 1.4, 1.4, 1.4, CHAIR),
    ...box([13, FLOOR, -9], [13, -6, -9], 1.4, 1.4, 1.4, 1.4, CHAIR),
    ...box([-13, FLOOR, 11], [-13, -6, 11], 1.4, 1.4, 1.4, 1.4, CHAIR),
    ...box([13, FLOOR, 11], [13, -6, 11], 1.4, 1.4, 1.4, 1.4, CHAIR),

    // desk
    ...box([0, 22, 40], [0, 24, 40], 26, 16, 26, 16, DESK),
    ...box([-24, FLOOR, 26], [-24, 22, 26], 1.6, 1.6, 1.6, 1.6, DESK),
    ...box([24, FLOOR, 26], [24, 22, 26], 1.6, 1.6, 1.6, 1.6, DESK),
    ...box([-24, FLOOR, 54], [-24, 22, 54], 1.6, 1.6, 1.6, 1.6, DESK),
    ...box([24, FLOOR, 54], [24, 22, 54], 1.6, 1.6, 1.6, 1.6, DESK),

    // legs
    ...box(hipL, kneeL, 6, 6, 5, 5, TROUSER),
    ...box(hipR, kneeR, 6, 6, 5, 5, TROUSER),
    ...box(kneeL, ankleL, 5, 5, 3.6, 3.6, TROUSER),
    ...box(kneeR, ankleR, 5, 5, 3.6, 3.6, TROUSER),
    ...box(ankleL, toeL, 3.6, 3, 3.4, 2.6, SHIRT),
    ...box(ankleR, toeR, 3.6, 3, 3.4, 2.6, SHIRT),

    // torso, arms
    ...box(hip, shoulder, 13, 9, 18, 10, SHIRT),
    ...box(shoulderL, elbowL, 4.4, 4.4, 3.6, 3.6, SHIRT),
    ...box(shoulderR, elbowR, 4.4, 4.4, 3.6, 3.6, SHIRT),
    ...box(elbowL, wristL, 3.6, 3.6, 2.8, 2.8, SHIRT),
    ...box(elbowR, wristR, 3.6, 3.6, 2.8, 2.8, SHIRT),
    ...box(wristL, [-11, 25, 38], 2.8, 2.2, 2.4, 1.8, SKIN),
    ...box(wristR, [11, 25, 38], 2.8, 2.2, 2.4, 1.8, SKIN),

    // neck, head, hair
    ...box([0, 48, -5], [0, 57, -4], 4, 4, 4.2, 4.2, SKIN),
    ...headMesh(),

    // laptop
    ...box([0, 24, 40], [0, 25.4, 40], 17, 10, 17, 10, DEVICE),
    ...box([0, 25, 50], [0, 46, 44], 16, 0.7, 15, 0.7, DEVICE),
  ];
}

const MESH = buildMesh();

const EQUATIONS: Array<{ phase: number; y: number; r: number; text: string }> = [
  { phase: 0.0, y: 78, r: 30, text: 'e^iπ + 1 = 0' },
  { phase: 0.52, y: 76, r: 38, text: '√2' },
  { phase: 1.05, y: 54, r: 44, text: 'a² + b² = c²' },
  { phase: 2.1, y: 80, r: 36, text: '∑ 1/n²' },
  { phase: 3.14, y: 50, r: 40, text: '∫ f(x) dx' },
  { phase: 3.66, y: 88, r: 32, text: 'λ = c/f' },
  { phase: 4.2, y: 84, r: 26, text: '∂f/∂x' },
  { phase: 5.25, y: 62, r: 42, text: 'O(n log n)' },
];

function readAccent() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim();
  const [r, g, b] = v.split(/\s+/).map(Number);
  return Number.isFinite(r) ? ([r, g, b] as V3) : ([255, 95, 31] as V3);
}

export default function HeroModel({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let accent = readAccent();
    const themeObserver = new MutationObserver(() => {
      accent = readAccent();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let w = 0;
    let h = 0;
    const ro = new ResizeObserver(([entry]) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = entry.contentRect.width;
      h = entry.contentRect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    ro.observe(canvas);

    const TILT = -0.2;
    const LIGHT = norm([-0.45, 0.78, 0.55]);
    let angle = reduced ? 0.7 : 0.35;
    let orbit = 0;
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced) {
        angle += dt * 0.32;
        orbit += dt * 0.5;
      }

      ctx.clearRect(0, 0, w, h);
      if (!w || !h) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const scale = Math.min(w / 130, h / 160);
      const cx = w * 0.42;
      const cy = h / 2 + 26 * scale;
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);
      const sinT = Math.sin(TILT);
      const cosT = Math.cos(TILT);

      const view = (p: V3) => {
        const rx = p[0] * cosA + p[2] * sinA;
        const rz = -p[0] * sinA + p[2] * cosA;
        const ry = p[1] * cosT - rz * sinT;
        const rz2 = p[1] * sinT + rz * cosT;
        return [rx, ry, rz2] as V3;
      };
      const project = (v: V3) => {
        const persp = 320 / (320 - v[2] * 0.55);
        return [cx + v[0] * scale * persp, cy - v[1] * scale * persp] as const;
      };

      const drawn = MESH.map((t) => {
        const va = view(t.a);
        const vb = view(t.b);
        const vc = view(t.c);
        return { t, va, vb, vc, d: (va[2] + vb[2] + vc[2]) / 3 };
      }).sort((p, n) => p.d - n.d);

      for (const { t, va, vb, vc } of drawn) {
        const pa = project(va);
        const pb = project(vb);
        const pc = project(vc);
        // backface cull in screen space
        const area = (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pc[0] - pa[0]) * (pb[1] - pa[1]);
        if (area >= 0) continue;

        let col: V3;
        if (t.emissive) {
          col = accent;
        } else {
          const n = norm(cross(sub(vb, va), sub(vc, va)));
          const lambert = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
          const shade = 0.34 + 0.66 * lambert;
          col = [t.color[0] * shade, t.color[1] * shade, t.color[2] * shade];
        }
        ctx.fillStyle = `rgb(${col[0].toFixed(0)} ${col[1].toFixed(0)} ${col[2].toFixed(0)})`;
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.lineTo(pc[0], pc[1]);
        ctx.closePath();
        ctx.fill();
      }

      // the lit face of the screen sits on the side that looks at the figure
      const scrV = [
        view([-15, 25.6, 49.2]), view([15, 25.6, 49.2]), view([15, 45.4, 43.5]), view([-15, 45.4, 43.5]),
      ];
      const sn = norm(cross(sub(scrV[1], scrV[0]), sub(scrV[3], scrV[0])));
      if (sn[2] > 0) {
        const p2 = scrV.map(project);
        ctx.fillStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / 0.9)`;
        ctx.beginPath();
        ctx.moveTo(p2[0][0], p2[0][1]);
        for (let i = 1; i < p2.length; i++) ctx.lineTo(p2[i][0], p2[i][1]);
        ctx.closePath();
        ctx.fill();
      }

      // equations, at full resolution
      const headTop = (() => {
        const v = view([0, 74, -3]);
        const persp = 320 / (320 - v[2] * 0.55);
        return { x: cx + v[0] * scale * persp, y: cy - v[1] * scale * persp };
      })();
      const fontSize = Math.max(9, Math.round(w / 42));
      ctx.font = `${fontSize}px "JetBrains Mono Variable", ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const eqs = EQUATIONS.map((eq) => {
        const a = eq.phase + orbit;
        const v = view([Math.cos(a) * eq.r, eq.y, Math.sin(a) * eq.r - 3]);
        const persp = 320 / (320 - v[2] * 0.55);
        return {
          eq,
          x: cx + v[0] * scale * persp,
          y: cy - v[1] * scale * persp,
          d: v[2],
        };
      }).sort((a, b) => a.d - b.d);

      for (const e of eqs) {
        if (e.d < -46) continue;
        const fade = Math.min(1, 0.1 + ((e.d + 46) / 110) * 0.9);
        ctx.strokeStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / ${(0.14 * fade).toFixed(3)})`;
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headTop.x, headTop.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgb(${accent[0]} ${accent[1]} ${accent[2]} / ${(0.85 * fade).toFixed(3)})`;
        ctx.fillText(e.eq.text, e.x, e.y);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Rotating low-poly model of a figure working at a desk, with equations orbiting the head"
    />
  );
}
