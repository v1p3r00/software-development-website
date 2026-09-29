import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMisc';

/**
 * A hand-built wireframe of a figure at a desk, projected and rotated on a
 * canvas, with equations orbiting the head. Deliberately schematic rather than
 * a likeness: the engineering drawing that sits in front of the photograph.
 *
 * Coordinates: +x right, +y up, +z toward the viewer at angle 0. Hip at origin,
 * the desk in front of the figure, the floor at y = -46.
 */
type V3 = readonly [number, number, number];

const FLOOR = -46;

const P = {
  // torso
  hipL: [-13, 0, 2], hipR: [13, 0, 2],
  waistL: [-14, 18, -1], waistR: [14, 18, -1],
  chestL: [-16, 34, -4], chestR: [16, 34, -4],
  shoulderL: [-18, 50, -6], shoulderR: [18, 50, -6],
  neck: [0, 55, -5],

  // head, an octahedron
  headB: [0, 57, -3], headT: [0, 77, -3],
  headL: [-9, 67, -3], headR: [9, 67, -3],
  headF: [0, 67, 7], headK: [0, 67, -13],

  // arms reaching onto the desk
  elbowL: [-22, 29, 4], elbowR: [22, 29, 4],
  wristL: [-13, 26, 33], wristR: [13, 26, 33],

  // legs, feet on the floor
  kneeL: [-11, 2, 30], kneeR: [11, 2, 30],
  ankleL: [-11, FLOOR + 4, 34], ankleR: [11, FLOOR + 4, 34],
  toeL: [-11, FLOOR, 43], toeR: [11, FLOOR, 43],

  // chair
  seatBL: [-15, -5, -11], seatBR: [15, -5, -11],
  seatFL: [-15, -5, 13], seatFR: [15, -5, 13],
  seatLegBL: [-14, FLOOR, -10], seatLegBR: [14, FLOOR, -10],
  seatLegFL: [-14, FLOOR, 12], seatLegFR: [14, FLOOR, 12],
  backL: [-15, 22, -13], backR: [15, 22, -13],

  // desk
  deskBL: [-26, 24, 24], deskBR: [26, 24, 24],
  deskFL: [-26, 24, 56], deskFR: [26, 24, 56],
  deskLegBL: [-25, FLOOR, 25], deskLegBR: [25, FLOOR, 25],
  deskLegFL: [-25, FLOOR, 55], deskLegFR: [25, FLOOR, 55],

  // laptop, standing on the desk
  baseBL: [-17, 25, 30], baseBR: [17, 25, 30],
  baseFL: [-17, 25, 50], baseFR: [17, 25, 50],
  scrTL: [-16, 46, 44], scrTR: [16, 46, 44],
} satisfies Record<string, V3>;

type Key = keyof typeof P;
type Kind = 'body' | 'furniture' | 'device' | 'screen';
type Edge = readonly [Key, Key, Kind];

const EDGES: Edge[] = [
  ['hipL', 'waistL', 'body'], ['waistL', 'chestL', 'body'], ['chestL', 'shoulderL', 'body'],
  ['hipR', 'waistR', 'body'], ['waistR', 'chestR', 'body'], ['chestR', 'shoulderR', 'body'],
  ['hipL', 'hipR', 'body'], ['waistL', 'waistR', 'body'], ['chestL', 'chestR', 'body'],
  ['shoulderL', 'shoulderR', 'body'], ['shoulderL', 'neck', 'body'], ['shoulderR', 'neck', 'body'],
  ['neck', 'headB', 'body'],
  ['headB', 'headL', 'body'], ['headB', 'headR', 'body'], ['headB', 'headF', 'body'], ['headB', 'headK', 'body'],
  ['headT', 'headL', 'body'], ['headT', 'headR', 'body'], ['headT', 'headF', 'body'], ['headT', 'headK', 'body'],
  ['headL', 'headF', 'body'], ['headF', 'headR', 'body'], ['headR', 'headK', 'body'], ['headK', 'headL', 'body'],
  ['shoulderL', 'elbowL', 'body'], ['elbowL', 'wristL', 'body'],
  ['shoulderR', 'elbowR', 'body'], ['elbowR', 'wristR', 'body'],
  ['hipL', 'kneeL', 'body'], ['kneeL', 'ankleL', 'body'], ['ankleL', 'toeL', 'body'],
  ['hipR', 'kneeR', 'body'], ['kneeR', 'ankleR', 'body'], ['ankleR', 'toeR', 'body'],
  ['kneeL', 'kneeR', 'body'],

  ['seatBL', 'seatBR', 'furniture'], ['seatBR', 'seatFR', 'furniture'],
  ['seatFR', 'seatFL', 'furniture'], ['seatFL', 'seatBL', 'furniture'],
  ['seatBL', 'seatLegBL', 'furniture'], ['seatBR', 'seatLegBR', 'furniture'],
  ['seatFL', 'seatLegFL', 'furniture'], ['seatFR', 'seatLegFR', 'furniture'],
  ['seatBL', 'backL', 'furniture'], ['seatBR', 'backR', 'furniture'], ['backL', 'backR', 'furniture'],

  ['deskBL', 'deskBR', 'furniture'], ['deskBR', 'deskFR', 'furniture'],
  ['deskFR', 'deskFL', 'furniture'], ['deskFL', 'deskBL', 'furniture'],
  ['deskBL', 'deskLegBL', 'furniture'], ['deskBR', 'deskLegBR', 'furniture'],
  ['deskFL', 'deskLegFL', 'furniture'], ['deskFR', 'deskLegFR', 'furniture'],

  ['baseBL', 'baseBR', 'device'], ['baseBR', 'baseFR', 'device'],
  ['baseFR', 'baseFL', 'device'], ['baseFL', 'baseBL', 'device'],
  ['baseFL', 'scrTL', 'screen'], ['baseFR', 'scrTR', 'screen'],
  ['scrTL', 'scrTR', 'screen'], ['baseFL', 'baseFR', 'screen'],
];

const KEYS = Object.keys(P) as Key[];

/** the equations that orbit the head — phase, height, radius, text */
const EQUATIONS: Array<{ phase: number; y: number; r: number; text: string }> = [
  { phase: 0.0, y: 104, r: 30, text: 'e^iπ + 1 = 0' },
  { phase: 1.05, y: 66, r: 44, text: 'a² + b² = c²' },
  { phase: 2.1, y: 92, r: 36, text: '∑ 1/n²' },
  { phase: 3.14, y: 58, r: 40, text: '∫ f(x) dx' },
  { phase: 4.2, y: 98, r: 26, text: '∂f/∂x' },
  { phase: 5.25, y: 74, r: 42, text: 'O(n log n)' },
  { phase: 0.52, y: 84, r: 38, text: '√2' },
  { phase: 3.66, y: 88, r: 32, text: 'λ = c/f' },
];

function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string) => cs.getPropertyValue(name).trim() || '128 128 128';
  return { accent: v('--c-accent'), text: v('--c-text'), line: v('--c-line-strong') };
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

    const TILT = -0.2;
    let angle = reduced ? 0.7 : 0.35;
    let orbit = 0;
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced) {
        angle += dt * 0.34;
        orbit += dt * 0.5;
      }

      ctx.clearRect(0, 0, w, h);
      if (!w || !h) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const scale = Math.min(w / 135, h / 150);
      const cx = w * 0.44;
      const cy = h / 2 + 24 * scale;
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);
      const sinT = Math.sin(TILT);
      const cosT = Math.cos(TILT);

      const project = (px: number, py: number, pz: number) => {
        const rx = px * cosA + pz * sinA;
        const rz = -px * sinA + pz * cosA;
        const ry = py * cosT - rz * sinT;
        const rz2 = py * sinT + rz * cosT;
        const persp = 320 / (320 - rz2 * 0.55);
        return { x: cx + rx * scale * persp, y: cy - ry * scale * persp, d: rz2 };
      };

      const proj: Record<string, { x: number; y: number; d: number }> = {};
      for (const key of KEYS) proj[key] = project(...P[key]);

      // ground ring
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgb(${colors.line} / 0.3)`;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      for (let i = 0; i <= 56; i++) {
        const a = (i / 56) * Math.PI * 2;
        const g = project(Math.cos(a) * 48, FLOOR, Math.sin(a) * 48 + 20);
        if (i === 0) ctx.moveTo(g.x, g.y);
        else ctx.lineTo(g.x, g.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // edges, back to front
      const ordered = EDGES.map((e) => ({ e, d: (proj[e[0]].d + proj[e[1]].d) / 2 })).sort((a, b) => a.d - b.d);
      for (const { e, d } of ordered) {
        const [a, b, kind] = e;
        const fade = 0.35 + ((d + 70) / 180) * 0.65;
        ctx.strokeStyle =
          kind === 'body'
            ? `rgb(${colors.text} / ${(0.6 * fade).toFixed(3)})`
            : kind === 'furniture'
              ? `rgb(${colors.line} / ${(0.75 * fade).toFixed(3)})`
              : kind === 'device'
                ? `rgb(${colors.line} / ${fade.toFixed(3)})`
                : `rgb(${colors.accent} / ${fade.toFixed(3)})`;
        ctx.lineWidth = kind === 'screen' ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(proj[a].x, proj[a].y);
        ctx.lineTo(proj[b].x, proj[b].y);
        ctx.stroke();
      }

      for (const key of KEYS) {
        const p = proj[key];
        const fade = 0.3 + ((p.d + 70) / 180) * 0.7;
        ctx.fillStyle = `rgb(${colors.text} / ${(0.5 * fade).toFixed(3)})`;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }

      // the lit screen
      const s = [proj.baseFL, proj.baseFR, proj.scrTR, proj.scrTL];
      ctx.fillStyle = `rgb(${colors.accent} / 0.12)`;
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
      ctx.closePath();
      ctx.fill();

      // equations orbiting the head
      const head = proj.headT;
      const fontSize = Math.max(8, Math.round(6.2 * scale));
      ctx.font = `${fontSize}px "JetBrains Mono Variable", ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const eqs = EQUATIONS.map((eq) => {
        const a = eq.phase + orbit;
        return { eq, p: project(Math.cos(a) * eq.r, eq.y, Math.sin(a) * eq.r - 3) };
      }).sort((a, b) => a.p.d - b.p.d);

      for (const { eq, p } of eqs) {
        if (p.d < -46) continue;
        const fade = Math.min(1, 0.1 + ((p.d + 46) / 110) * 0.9);
        ctx.strokeStyle = `rgb(${colors.line} / ${(0.18 * fade).toFixed(3)})`;
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(head.x, head.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = `rgb(${colors.accent} / ${(0.85 * fade).toFixed(3)})`;
        ctx.fillText(eq.text, p.x, p.y);
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
      aria-label="Rotating wireframe model of a figure working at a desk, with equations orbiting the head"
    />
  );
}
