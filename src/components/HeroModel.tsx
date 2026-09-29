import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMisc';

/**
 * A hand-built wireframe of a seated figure working on a laptop, projected and
 * rotated on a canvas. Deliberately schematic rather than a likeness: it reads
 * as the engineering drawing that sits in front of the photograph.
 *
 * Coordinates: +x right, +y up, +z toward the viewer at angle 0. Hip at origin,
 * legs extending forward, laptop resting across the thighs.
 */
type V3 = readonly [number, number, number];

const P = {
  hipL: [-13, 0, 2], hipR: [13, 0, 2],
  waistL: [-14, 18, -1], waistR: [14, 18, -1],
  chestL: [-16, 34, -4], chestR: [16, 34, -4],
  shoulderL: [-18, 50, -6], shoulderR: [18, 50, -6],
  neck: [0, 55, -5],

  headB: [0, 57, -3],
  headT: [0, 77, -3],
  headL: [-9, 67, -3], headR: [9, 67, -3],
  headF: [0, 67, 7], headK: [0, 67, -13],

  elbowL: [-23, 28, 2], elbowR: [23, 28, 2],
  wristL: [-13, 17, 26], wristR: [13, 17, 26],

  kneeL: [-11, 3, 44], kneeR: [11, 3, 44],
  ankleL: [-11, -38, 41], ankleR: [11, -38, 41],
  toeL: [-11, -44, 50], toeR: [11, -44, 50],

  // laptop: base across the thighs, screen hinged at the far edge, tilted back
  baseBL: [-16, 7, 13], baseBR: [16, 7, 13],
  baseFL: [-16, 9, 35], baseFR: [16, 9, 35],
  scrTL: [-15, 30, 27], scrTR: [15, 30, 27],
} satisfies Record<string, V3>;

type Key = keyof typeof P;
type Edge = readonly [Key, Key, 'body' | 'device' | 'screen'];

const EDGES: Edge[] = [
  // torso
  ['hipL', 'waistL', 'body'], ['waistL', 'chestL', 'body'], ['chestL', 'shoulderL', 'body'],
  ['hipR', 'waistR', 'body'], ['waistR', 'chestR', 'body'], ['chestR', 'shoulderR', 'body'],
  ['hipL', 'hipR', 'body'], ['waistL', 'waistR', 'body'], ['chestL', 'chestR', 'body'],
  ['shoulderL', 'shoulderR', 'body'],
  ['shoulderL', 'neck', 'body'], ['shoulderR', 'neck', 'body'],
  // head
  ['neck', 'headB', 'body'],
  ['headB', 'headL', 'body'], ['headB', 'headR', 'body'], ['headB', 'headF', 'body'], ['headB', 'headK', 'body'],
  ['headT', 'headL', 'body'], ['headT', 'headR', 'body'], ['headT', 'headF', 'body'], ['headT', 'headK', 'body'],
  ['headL', 'headF', 'body'], ['headF', 'headR', 'body'], ['headR', 'headK', 'body'], ['headK', 'headL', 'body'],
  // arms
  ['shoulderL', 'elbowL', 'body'], ['elbowL', 'wristL', 'body'],
  ['shoulderR', 'elbowR', 'body'], ['elbowR', 'wristR', 'body'],
  // legs
  ['hipL', 'kneeL', 'body'], ['kneeL', 'ankleL', 'body'], ['ankleL', 'toeL', 'body'],
  ['hipR', 'kneeR', 'body'], ['kneeR', 'ankleR', 'body'], ['ankleR', 'toeR', 'body'],
  ['kneeL', 'kneeR', 'body'],
  // laptop base
  ['baseBL', 'baseBR', 'device'], ['baseBR', 'baseFR', 'device'],
  ['baseFR', 'baseFL', 'device'], ['baseFL', 'baseBL', 'device'],
  // laptop screen
  ['baseFL', 'scrTL', 'screen'], ['baseFR', 'scrTR', 'screen'],
  ['scrTL', 'scrTR', 'screen'], ['baseFL', 'baseFR', 'screen'],
];

const KEYS = Object.keys(P) as Key[];

function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string) => cs.getPropertyValue(name).trim() || '128 128 128';
  return {
    accent: v('--c-accent'),
    text: v('--c-text'),
    line: v('--c-line-strong'),
  };
}

export default function HeroModel({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let colors = readTheme();
    const themeObserver = new MutationObserver(() => {
      colors = readTheme();
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

    const TILT = -0.22; // look slightly down on the figure
    let angle = reduced ? 0.7 : 0.35;
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced) angle += dt * 0.42;

      ctx.clearRect(0, 0, w, h);
      if (!w || !h) {
        raf = requestAnimationFrame(draw);
        return;
      }

      // the figure spans ~120 units across (rotated) and ~135 tall
      const scale = Math.min(w / 125, h / 145);
      const cx = w / 2;
      const cy = h / 2 + 17 * scale;
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);
      const sinT = Math.sin(TILT);
      const cosT = Math.cos(TILT);

      // project every named point once per frame
      const proj: Record<string, { x: number; y: number; d: number }> = {};
      for (const key of KEYS) {
        const [px, py, pz] = P[key];
        // rotate about Y, then tilt about X
        const rx = px * cosA + pz * sinA;
        const rz = -px * sinA + pz * cosA;
        const ry = py * cosT - rz * sinT;
        const rz2 = py * sinT + rz * cosT;
        const persp = 300 / (300 - rz2 * 0.6);
        proj[key] = { x: cx + rx * scale * persp, y: cy - ry * scale * persp, d: rz2 };
      }

      // ground ring, so the figure reads as sitting in a space
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgb(${colors.line} / 0.35)`;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const gx = Math.cos(a) * 44;
        const gz = Math.sin(a) * 44;
        const rx = gx * cosA + gz * sinA;
        const rz = -gx * sinA + gz * cosA;
        const ry = -46 * cosT - rz * sinT;
        const rz2 = -46 * sinT + rz * cosT;
        const persp = 300 / (300 - rz2 * 0.6);
        const x = cx + rx * scale * persp;
        const y = cy - ry * scale * persp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // edges, painted back to front
      const drawn = EDGES.map((e) => ({ e, d: (proj[e[0]].d + proj[e[1]].d) / 2 })).sort((a, b) => a.d - b.d);
      for (const { e, d } of drawn) {
        const [a, b, kind] = e;
        const fade = 0.35 + ((d + 60) / 160) * 0.65;
        ctx.strokeStyle =
          kind === 'body'
            ? `rgb(${colors.text} / ${(0.55 * fade).toFixed(3)})`
            : kind === 'device'
              ? `rgb(${colors.line} / ${fade.toFixed(3)})`
              : `rgb(${colors.accent} / ${fade.toFixed(3)})`;
        ctx.lineWidth = kind === 'screen' ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(proj[a].x, proj[a].y);
        ctx.lineTo(proj[b].x, proj[b].y);
        ctx.stroke();
      }

      // joints
      for (const key of KEYS) {
        const p = proj[key];
        const fade = 0.3 + ((p.d + 60) / 160) * 0.7;
        ctx.fillStyle = `rgb(${colors.text} / ${(0.5 * fade).toFixed(3)})`;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }

      // the lit screen, filled so the laptop reads as switched on
      const s = [proj.baseFL, proj.baseFR, proj.scrTR, proj.scrTL];
      ctx.fillStyle = `rgb(${colors.accent} / 0.12)`;
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
      ctx.closePath();
      ctx.fill();

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
      aria-label="Rotating wireframe model of a seated figure working on a laptop"
    />
  );
}
