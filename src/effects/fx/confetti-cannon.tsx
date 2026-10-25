import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, sp, spring, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * Two party cannons in the floor corners. Click anywhere: both fire at that point; hold to keep
 * firing. Every scrap of paper is a little flat plate: it tumbles about its own axis (we see its
 * apparent width shrink and its back face go darker), air drag depends on how flat it is to the
 * fall (face-down = parachute, edge-on = drops), and that flip also pushes it sideways, which is
 * what makes real confetti flutter and zig-zag. Pieces land and pile up on the floor.
 */

const MAX = 1100;
const COLORS = ['#ff4d6d', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff9f1c', '#f7f7ff'];

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number; // in-plane angle
  va: number;
  ph: number; // tumble phase (the flip)
  vph: number;
  w: number;
  h: number;
  c: number; // colour index
  round: boolean;
  rest: number; // seconds on the floor (-1 while flying)
}

interface S {
  ps: P[];
  recoil: [Spring, Spring];
  aimL: number; // cannon angles
  aimR: number;
  smoke: { x: number; y: number; vx: number; vy: number; r: number; life: number }[];
  hold: number;
  idle: number;
  t: number;
  lastPaper: number;
}

const floorY = (h: number) => h * 0.9;
const cannonPos = (w: number, h: number, side: 0 | 1) => {
  const m = Math.min(w, h);
  return { x: side ? w - m * 0.09 : m * 0.09, y: floorY(h) - m * 0.03 };
};

export const sim = defineSim<S>({
  init: () => ({ ps: [], recoil: [sp(), sp()], aimL: -1, aimR: -2.1, smoke: [], hold: 0, idle: 2, t: 0, lastPaper: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const m = Math.min(w, h);
    s.t += dt;
    s.idle = p.down || f.pressed ? 0 : s.idle + dt;
    // aim at the pointer (or, idle, at a point drifting across the sky)
    const auto = s.idle > 2.5;
    const tx = auto ? w * (0.5 + 0.25 * Math.sin(s.t * 0.9)) : p.x;
    const ty = auto ? h * 0.25 : Math.min(p.y, floorY(h) - m * 0.15);
    const L = cannonPos(w, h, 0), R = cannonPos(w, h, 1);
    s.aimL = clamp(Math.atan2(ty - L.y, tx - L.x), -Math.PI * 0.49, -0.15);
    s.aimR = clamp(Math.atan2(ty - R.y, tx - R.x), -Math.PI + 0.15, -Math.PI * 0.51);

    const fire = (side: 0 | 1, n: number, power: number) => {
      const c = cannonPos(w, h, side);
      const ang = side ? s.aimR : s.aimL;
      const dist = Math.hypot(tx - c.x, ty - c.y);
      const v0 = dist * 6.2 * power; // drag eats most of it: the burst stops near the target
      const mx = c.x + Math.cos(ang) * m * 0.1, my = c.y + Math.sin(ang) * m * 0.1;
      for (let i = 0; i < n; i++) {
        if (s.ps.length >= MAX) s.ps.splice(0, 1 + (s.ps.length - MAX));
        const spread = (f.rand() - 0.5) * 0.75;
        const v = v0 * (0.45 + f.rand() * 0.8);
        const sz = m * (0.012 + f.rand() * 0.012);
        s.ps.push({
          x: mx, y: my,
          vx: Math.cos(ang + spread) * v,
          vy: Math.sin(ang + spread) * v,
          a: f.rand() * 6.28, va: (f.rand() - 0.5) * 14,
          ph: f.rand() * 6.28, vph: (6 + f.rand() * 12) * (f.rand() < 0.5 ? -1 : 1),
          w: sz, h: sz * (0.45 + f.rand() * 0.3),
          c: Math.floor(f.rand() * COLORS.length),
          round: f.rand() < 0.18,
          rest: -1,
        });
      }
      for (let i = 0; i < 6; i++)
        s.smoke.push({ x: mx, y: my, vx: Math.cos(ang + (f.rand() - 0.5)) * m * (0.2 + f.rand() * 0.5), vy: Math.sin(ang + (f.rand() - 0.5)) * m * (0.2 + f.rand() * 0.5), r: m * 0.02, life: 1 });
      s.recoil[side].v += f.reduced ? 3 : 9;
    };
    const volley = (big: boolean) => {
      fire(0, big ? 110 : 18, 1);
      fire(1, big ? 110 : 18, 1);
      if (big) f.emit({ name: 'pop', gain: 0.9, rate: 0.75 });
      else f.emit({ name: 'pop', gain: 0.35, rate: 1.1 + f.rand() * 0.2 });
    };
    if (f.pressed) {
      volley(true);
      s.hold = 0;
    } else if (p.down) {
      s.hold += dt;
      // a held press keeps the cannons coughing out bursts
      if (s.hold > 0.35 && (s.hold % 0.12) < dt) volley(false);
    }
    if (auto && s.t % 3.2 < dt) volley(true);
    spring(s.recoil[0], 0, 400, 16, dt);
    spring(s.recoil[1], 0, 400, 16, dt);

    const g = m * 1.2; // gravity, px/s²
    const fy = floorY(h);
    let flying = 0;
    for (const q of s.ps) {
      if (q.rest >= 0) {
        q.rest += dt;
        continue;
      }
      flying++;
      q.ph += q.vph * dt;
      q.a += q.va * dt;
      const face = Math.abs(Math.cos(q.ph)); // 1 = flat to the airflow
      // air drag; a flat card catches much more air than one falling edge-on
      const sp = Math.hypot(q.vx, q.vy);
      const d = Math.exp(-(1.6 + 4.4 * face + 0.0012 * (600 / m) * sp) * dt);
      q.vx *= d;
      q.vy *= d;
      q.vy += g * dt;
      // the flip pushes the card sideways: the zig-zag flutter
      q.vx += Math.sin(q.ph) * m * 0.9 * dt * (sp < m * 0.6 ? 1 : 0.3);
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      if (q.y > fy - q.h * 0.2 && q.vy > 0) {
        // land: lie flat, with a tiny scatter so the pile looks natural
        q.y = fy - f.rand() * m * 0.012;
        q.rest = 0;
        q.ph = f.rand() < 0.5 ? 0.25 : Math.PI + 0.25;
      }
      if (q.x < -50 || q.x > w + 50) q.rest = 99;
    }
    // paper whisper while lots of it is in the air
    if (flying > 120 && s.t - s.lastPaper > 0.6) {
      f.emit({ name: 'paper', gain: clamp(flying / 600, 0.1, 0.4) });
      s.lastPaper = s.t;
    }
    // the floor pile slowly clears so the stage never fills up
    s.ps = s.ps.filter((q) => q.rest < 7);
    for (const sm of s.smoke) {
      sm.vx *= Math.exp(-4 * dt);
      sm.vy = sm.vy * Math.exp(-4 * dt) - m * 0.05 * dt;
      sm.x += sm.vx * dt;
      sm.y += sm.vy * dt;
      sm.r += m * 0.08 * dt;
      sm.life -= dt * 1.4;
    }
    s.smoke = s.smoke.filter((sm) => sm.life > 0);
  },
});

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
}

export default function ConfettiCannon() {
  const fx = useFx(sim);
  const ref = useRef<HTMLCanvasElement>(null);
  const { s, w, h } = fx;

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const c = cv.getContext('2d')!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = Math.min(w, h);
    const fy = floorY(h);
    // a dark party room with a soft spotlight
    const bg = c.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.35, Math.max(w, h) * 0.8);
    bg.addColorStop(0, '#2b2350');
    bg.addColorStop(0.55, '#141127');
    bg.addColorStop(1, '#08070f');
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    const fl = c.createLinearGradient(0, fy, 0, h);
    fl.addColorStop(0, '#1d1834');
    fl.addColorStop(1, '#0a0912');
    c.fillStyle = fl;
    c.fillRect(0, fy, w, h - fy);
    c.fillStyle = 'rgba(180,170,255,0.12)';
    c.fillRect(0, fy, w, 1);

    // smoke puffs at the muzzles
    for (const sm of s.smoke) {
      const gr = c.createRadialGradient(sm.x, sm.y, 0, sm.x, sm.y, sm.r);
      gr.addColorStop(0, `rgba(230,225,255,${0.22 * sm.life})`);
      gr.addColorStop(1, 'rgba(230,225,255,0)');
      c.fillStyle = gr;
      c.fillRect(sm.x - sm.r, sm.y - sm.r, sm.r * 2, sm.r * 2);
    }

    // confetti: each card is a rotated rect, squashed by its flip
    for (const q of s.ps) {
      const fyk = Math.cos(q.ph);
      const ca = Math.cos(q.a), sa = Math.sin(q.a);
      const fade = q.rest > 5 ? 1 - (q.rest - 5) / 2 : 1;
      if (fade <= 0) continue;
      c.globalAlpha = fade;
      // a contact shadow under pieces on the floor
      if (q.rest >= 0) {
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.fillStyle = 'rgba(0,0,0,0.35)';
        c.fillRect(q.x - q.w * 0.5, q.y + 1, q.w, 1.5);
      }
      const fk = q.rest >= 0 ? 0.28 : fyk; // resting pieces lie flat (seen nearly edge-on)
      c.setTransform(dpr * ca, dpr * sa, -dpr * sa * fk, dpr * ca * fk, dpr * q.x, dpr * q.y);
      // the front face catches the light; the back is darker
      const lit = fk > 0 ? 0.75 + 0.35 * fk : 0.45 + 0.2 * -fk;
      c.fillStyle = shade(COLORS[q.c], Math.min(1.15, lit));
      if (q.round) {
        c.beginPath();
        c.arc(0, 0, q.h * 0.7, 0, 6.283);
        c.fill();
      } else c.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
    }
    c.globalAlpha = 1;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    // the cannons: glossy party poppers on little stands
    for (const side of [0, 1] as const) {
      const p = cannonPos(w, h, side);
      const ang = side ? s.aimR : s.aimL;
      const rk = s.recoil[side].x * m * 0.006;
      c.save();
      c.translate(p.x, p.y);
      c.fillStyle = 'rgba(0,0,0,0.45)';
      c.beginPath();
      c.ellipse(0, m * 0.03, m * 0.07, m * 0.012, 0, 0, 6.283);
      c.fill();
      c.rotate(ang);
      c.translate(-rk, 0);
      const L = m * 0.12, r0 = m * 0.022, r1 = m * 0.045;
      const body = c.createLinearGradient(0, -r1, 0, r1);
      body.addColorStop(0, side ? '#7df9ff' : '#ff8fb1');
      body.addColorStop(0.35, side ? '#1fb6d6' : '#ff3d77');
      body.addColorStop(1, side ? '#0b4c66' : '#7a0c33');
      c.fillStyle = body;
      c.beginPath();
      c.moveTo(-L * 0.15, -r0);
      c.lineTo(L, -r1);
      c.lineTo(L, r1);
      c.lineTo(-L * 0.15, r0);
      c.closePath();
      c.fill();
      // gold stripes
      c.strokeStyle = 'rgba(255,215,120,0.85)';
      c.lineWidth = m * 0.006;
      for (const u of [0.3, 0.6]) {
        const r = r0 + (r1 - r0) * ((u + 0.15) / 1.15);
        c.beginPath();
        c.moveTo(L * u, -r);
        c.lineTo(L * u, r);
        c.stroke();
      }
      c.fillStyle = '#20132e';
      c.beginPath();
      c.ellipse(L, 0, r1 * 0.28, r1, 0, 0, 6.283);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.fillRect(0, -r0 * 0.75, L * 0.9, m * 0.004);
      c.restore();
    }
    const vg = c.createRadialGradient(w / 2, h / 2, m * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }, [fx.t, w, h, s]);

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: '#08070f' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      <button
        type="button"
        aria-label="Fire the confetti cannons"
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'crosshair' }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
