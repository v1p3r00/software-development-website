import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp, lerp } from '../kit';
import type { Spring } from '../kit';

/**
 * A starfield in 3D. Each star is a point flying at the camera; its streak is the line between
 * where it is now and where it was a moment ago, so streak length is literally speed. A click
 * spools the drive (stars pull back first, like a gasp), then the speed spring snaps to warp,
 * the field flashes and blue-shifts. Release and it coasts back down. The vanishing point leans
 * toward the cursor. Left alone, it jumps by itself every few seconds.
 */

const N = 900;
const DEPTH = 12; // far plane, scene units

interface S {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  speed: Spring; // scene units / s
  warp: number; // seconds into the current jump, -1 when cruising
  hold: boolean;
  flash: number;
  vx: number; // vanishing point, px offset from centre
  vy: number;
  idle: number;
  t: number;
}

const CRUISE = 0.9;
const WARP = 38;

export const sim = defineSim<S>({
  init(_w, _h, rand) {
    const x = new Float32Array(N), y = new Float32Array(N), z = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      x[i] = (rand() * 2 - 1) * 5;
      y[i] = (rand() * 2 - 1) * 5;
      z[i] = 0.2 + rand() * DEPTH;
    }
    return { x, y, z, speed: sp(CRUISE), warp: -1, hold: false, flash: 0, vx: 0, vy: 0, idle: 0, t: 0 };
  },
  step(s, f) {
    const { dt, p, w, h } = f;
    s.t += dt;
    s.idle = p.over || p.down ? 0 : s.idle + dt;
    const jump = () => {
      s.warp = 0;
      f.emit({ name: 'whoosh', gain: 0.8, rate: 0.7 });
    };
    if (f.pressed && s.warp < 0) jump();
    // self-demo: a jump every ~6 s while nobody is around
    if (s.warp < 0 && s.idle > 3 && (s.t % 6.5) < dt) jump();
    s.hold = p.down;
    let target = CRUISE;
    if (s.warp >= 0) {
      s.warp += dt;
      const spool = 0.35; // the gasp: the field eases backwards before the kick
      if (s.warp < spool) target = -1.2;
      else if (s.warp < 2.2 || s.hold) target = WARP;
      else {
        target = CRUISE;
        if (s.speed.x < CRUISE * 2.5) s.warp = -1;
      }
      if (s.warp >= spool && s.warp - dt < spool) {
        s.flash = 1;
        f.emit({ name: 'zap', gain: 0.9, rate: 0.6 });
      }
      if (s.warp >= 2.2 && s.warp - dt < 2.2 && !s.hold) f.emit({ name: 'whoosh', gain: 0.5, rate: 0.5 });
    }
    // stiff going up (a kick), lazy coming down (coasting)
    spring(s.speed, target, target > s.speed.x ? 26 : 5, target > s.speed.x ? 8 : 4.6, dt);
    s.flash = approach(s.flash, 0, 4, dt);
    const tx = p.over ? (p.x - w / 2) * 0.28 : Math.sin(s.t * 0.3) * w * 0.05;
    const ty = p.over ? (p.y - h / 2) * 0.28 : Math.cos(s.t * 0.23) * h * 0.04;
    s.vx = approach(s.vx, tx, 3, dt);
    s.vy = approach(s.vy, ty, 3, dt);
    const dz = s.speed.x * dt;
    for (let i = 0; i < N; i++) {
      s.z[i] -= dz;
      if (s.z[i] < 0.05) {
        s.z[i] += DEPTH;
        // respawn far away, never dead centre (it would sit still on the vanishing point)
        const a = f.rand() * 6.283, r = 0.2 + f.rand() * 5;
        s.x[i] = Math.cos(a) * r;
        s.y[i] = Math.sin(a) * r;
      } else if (s.z[i] > DEPTH + 0.2) s.z[i] -= DEPTH;
    }
  },
});

export default function WarpSpeed() {
  const fx = useFx(sim);
  const ref = useRef<HTMLCanvasElement>(null);
  const { s, w, h } = fx;
  const k = clamp((s.speed.x - CRUISE) / (WARP - CRUISE), 0, 1); // 0 cruise .. 1 full warp

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const g = cv.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // a little camera shake while the drive is at full burn
    const shake = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? k * k * 2.5 : 0;
    const cx = w / 2 + s.vx + Math.sin(s.t * 71) * shake;
    const cy = h / 2 + s.vy + Math.cos(s.t * 63) * shake;
    const F = Math.max(w, h) * 0.55; // focal length

    // deep space: a faint nebula, blue-shifted at warp
    const bg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.8);
    bg.addColorStop(0, `rgb(${lerp(26, 40, k)},${lerp(18, 60, k)},${lerp(48, 120, k)})`);
    bg.addColorStop(0.45, `rgb(${lerp(10, 8, k)},${lerp(8, 18, k)},${lerp(24, 50, k)})`);
    bg.addColorStop(1, '#020208');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);

    g.globalCompositeOperation = 'lighter';
    g.lineCap = 'round';
    // streak length = distance travelled in a short exposure
    const expo = 0.012 + k * 0.03;
    const back = s.speed.x * expo;
    const buckets: string[] = ['#9fb8ff', '#c9d6ff', '#ffffff'];
    for (let b = 0; b < 3; b++) {
      g.strokeStyle = buckets[b];
      g.beginPath();
      for (let i = b; i < N; i += 3) {
        const z = s.z[i];
        const z2 = Math.min(DEPTH, z + Math.max(0.004, back));
        const x1 = cx + (s.x[i] / z) * F, y1 = cy + (s.y[i] / z) * F;
        if (x1 < -50 || x1 > w + 50 || y1 < -50 || y1 > h + 50) continue;
        const x2 = cx + (s.x[i] / z2) * F, y2 = cy + (s.y[i] / z2) * F;
        g.moveTo(x2, y2);
        g.lineTo(x1 + 0.01, y1);
      }
      // nearer stars fade in from the dark; width grows with speed
      g.globalAlpha = 0.55 + b * 0.2;
      g.lineWidth = 1.2 + b * 0.4 + k * 0.6;
      g.stroke();
    }
    // the bright core of the tunnel at warp
    if (k > 0.02) {
      const r = Math.min(w, h) * (0.12 + k * 0.25);
      const core = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      core.addColorStop(0, `rgba(210,230,255,${0.7 * k})`);
      core.addColorStop(0.35, `rgba(110,150,255,${0.25 * k})`);
      core.addColorStop(1, 'rgba(60,80,255,0)');
      g.globalAlpha = 1;
      g.fillStyle = core;
      g.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    g.globalCompositeOperation = 'source-over';
    // the jump flash
    if (s.flash > 0.01) {
      g.globalAlpha = s.flash * 0.75;
      g.fillStyle = '#e8f0ff';
      g.fillRect(0, 0, w, h);
    }
    g.globalAlpha = 1;
    const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.7)');
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
  }, [fx.t, w, h, s, k]);

  const m = Math.min(w, h);
  const c = s.speed.x < 0 ? 0 : s.speed.x / CRUISE;
  return (
    <Stage fx={fx} cursor="pointer" style={{ background: '#020208' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      {/* a quiet HUD: the speed readout */}
      <div
        style={{
          position: 'absolute',
          left: m * 0.05,
          bottom: m * 0.05,
          fontFamily: "'JetBrains Mono Variable', monospace",
          fontSize: Math.max(10, m * 0.03),
          letterSpacing: '0.12em',
          color: `rgba(200,220,255,${0.45 + k * 0.5})`,
          textShadow: `0 0 ${8 + k * 14}px rgba(120,160,255,${0.3 + k * 0.6})`,
        }}
      >
        <div style={{ opacity: 0.6 }}>{s.warp >= 0 && s.warp < 0.35 ? 'SPOOLING' : k > 0.5 ? 'WARP' : 'IMPULSE'}</div>
        <div style={{ fontSize: '1.9em', fontWeight: 600 }}>{(k > 0.02 ? 1 + k * 8.6 : c * 0.25).toFixed(k > 0.02 ? 1 : 2)}</div>
      </div>
      <button
        type="button"
        aria-label="Jump to light speed"
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
