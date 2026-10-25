import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, approach, clamp } from '../kit';

/**
 * Tap the sky: a rocket climbs from the harbour to exactly where you tapped (launch speed is
 * solved from the height, so its apex is the tap) and bursts. Stars fly out on a sphere, slow
 * down in the air (drag), droop under gravity and leave trails that are their own recent path.
 * Shells come in a few classic types: peony, ring, gold willow (heavy drag, long hanging tails)
 * and crackle (stars that twinkle out). The burst flashes the sky and reflects in the water.
 */

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  ci: number; // which of the shell's two colours
  hx: number[]; // recent positions: the trail
  hy: number[];
}
interface Shell {
  kind: 'peony' | 'ring' | 'willow' | 'crackle';
  cols: [string, string];
  stars: Star[];
  drag: number;
  age: number;
}
interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ty: number;
  shell: Shell['kind'];
  cols: [string, string];
  hx: number[];
  hy: number[];
}
interface S {
  rockets: Rocket[];
  shells: Shell[];
  flash: number;
  flashCol: string;
  idle: number;
  next: number;
  t: number;
}

const PALETTE: [string, string][] = [
  ['#ff5e7e', '#ffd0dc'],
  ['#7ad7ff', '#ffffff'],
  ['#ffd36b', '#ff8a3d'],
  ['#b28dff', '#7ad7ff'],
  ['#7dffb0', '#fff7a8'],
  ['#ff6b3d', '#ffd36b'],
];
const KINDS: Shell['kind'][] = ['peony', 'ring', 'willow', 'crackle', 'peony'];
const water = (h: number) => h * 0.84;
const TRAIL = 9;

export const sim = defineSim<S>({
  init: () => ({ rockets: [], shells: [], flash: 0, flashCol: '#fff', idle: 2.2, next: 0, t: 0 }),
  step(s, f) {
    const { dt, p, w, h } = f;
    const m = Math.min(w, h);
    const g = m * 0.55;
    s.t += dt;
    s.idle = f.pressed ? 0 : s.idle + dt;
    const launch = (x: number, y: number) => {
      const ty = clamp(y, h * 0.08, water(h) - m * 0.2);
      const y0 = water(h) - 2;
      // v² = 2 g Δh puts the apex at the tap
      const vy = -Math.sqrt(2 * g * (y0 - ty));
      const k = Math.floor(f.rand() * KINDS.length);
      s.rockets.push({ x: x + (f.rand() - 0.5) * m * 0.04, y: y0, vx: (f.rand() - 0.5) * m * 0.05, vy, ty, shell: KINDS[k], cols: PALETTE[Math.floor(f.rand() * PALETTE.length)], hx: [], hy: [] });
      f.emit({ name: 'whoosh', gain: 0.45, rate: 1.5 + f.rand() * 0.3, pan: (x / w) * 2 - 1 });
    };
    if (f.pressed && p.y < water(h)) launch(p.x, p.y);
    if (s.idle > 2.5 && s.t > s.next) {
      launch(w * (0.15 + f.rand() * 0.7), h * (0.12 + f.rand() * 0.3));
      s.next = s.t + 0.7 + f.rand() * 1.1;
    }

    for (const r of s.rockets) {
      r.vy += g * dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.hx.push(r.x);
      r.hy.push(r.y);
      if (r.hx.length > 14) {
        r.hx.shift();
        r.hy.shift();
      }
      if (r.vy >= -m * 0.02) {
        // apex: burst
        const n = r.shell === 'ring' ? 70 : r.shell === 'willow' ? 110 : 130;
        const speed = m * (r.shell === 'willow' ? 0.75 : 0.62);
        const stars: Star[] = [];
        const tilt = f.rand() * Math.PI, tz = 0.35 + f.rand() * 0.4;
        for (let i = 0; i < n; i++) {
          let vx: number, vy: number;
          if (r.shell === 'ring') {
            // a tilted ring: a circle seen at an angle
            const a = (i / n) * Math.PI * 2;
            const cx = Math.cos(a), cy = Math.sin(a) * tz;
            vx = (cx * Math.cos(tilt) - cy * Math.sin(tilt)) * speed;
            vy = (cx * Math.sin(tilt) + cy * Math.cos(tilt)) * speed;
          } else {
            // uniform on a sphere, projected: a full, round peony
            const u = f.rand() * 2 - 1, a = f.rand() * Math.PI * 2, q = Math.sqrt(1 - u * u);
            const sv = speed * (0.9 + f.rand() * 0.15);
            vx = q * Math.cos(a) * sv;
            vy = q * Math.sin(a) * sv;
          }
          const max = r.shell === 'willow' ? 2.6 + f.rand() * 0.8 : 1.3 + f.rand() * 0.7;
          stars.push({ x: r.x, y: r.y, vx: vx + r.vx, vy: vy + r.vy, life: max, max, ci: i % 3 === 0 ? 1 : 0, hx: [], hy: [] });
        }
        s.shells.push({ kind: r.shell, cols: r.shell === 'willow' ? ['#ffcf6b', '#fff0c0'] : r.cols, stars, drag: r.shell === 'willow' ? 3.2 : 1.9, age: 0 });
        s.flash = Math.min(1, s.flash + 0.8);
        s.flashCol = r.shell === 'willow' ? '#ffcf6b' : r.cols[0];
        f.emit({ name: 'thud', gain: 0.9, rate: 0.7 + f.rand() * 0.2, pan: (r.x / w) * 2 - 1 });
        f.emit({ name: 'pop', gain: 0.6, rate: 0.6, pan: (r.x / w) * 2 - 1 });
        r.ty = -1; // mark spent
      }
    }
    s.rockets = s.rockets.filter((r) => r.ty >= 0);

    for (const sh of s.shells) {
      const prevAge = sh.age;
      sh.age += dt;
      if (sh.kind === 'crackle' && prevAge < 1.1 && sh.age >= 1.1) f.emit({ name: 'spark', gain: 0.5, rate: 1.2 });
      const d = Math.exp(-sh.drag * dt);
      for (const st of sh.stars) {
        st.vx *= d;
        st.vy = st.vy * d + g * 0.55 * dt; // stars fall slower than the rocket: lots of drag
        st.x += st.vx * dt;
        st.y += st.vy * dt;
        st.life -= dt;
        st.hx.push(st.x);
        st.hy.push(st.y);
        const len = sh.kind === 'willow' ? TRAIL * 2 : TRAIL;
        if (st.hx.length > len) {
          st.hx.shift();
          st.hy.shift();
        }
      }
      sh.stars = sh.stars.filter((st) => st.life > -0.4);
    }
    s.shells = s.shells.filter((sh) => sh.stars.length);
    s.flash = approach(s.flash, 0, 5, dt);
  },
});

export default function Fireworks() {
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
    const wy = water(h);
    const sky = c.createLinearGradient(0, 0, 0, wy);
    sky.addColorStop(0, '#03040c');
    sky.addColorStop(0.7, '#0b0f26');
    sky.addColorStop(1, '#1b1838');
    c.fillStyle = sky;
    c.fillRect(0, 0, w, wy);
    // the burst lights the whole sky for a moment
    if (s.flash > 0.01) {
      c.globalAlpha = s.flash * 0.09;
      c.fillStyle = s.flashCol;
      c.fillRect(0, 0, w, wy);
      c.globalAlpha = 1;
    }

    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const r of s.rockets) {
      c.strokeStyle = 'rgba(255,210,150,0.8)';
      c.lineWidth = 1.6;
      c.beginPath();
      for (let i = 0; i < r.hx.length; i++) (i ? c.lineTo : c.moveTo).call(c, r.hx[i], r.hy[i]);
      c.stroke();
      c.fillStyle = '#fff4dc';
      c.beginPath();
      c.arc(r.x, r.y, 2, 0, 6.283);
      c.fill();
    }
    for (const sh of s.shells) {
      for (let ci = 0; ci < 2; ci++) {
        // bucket by brightness so each shell is a handful of strokes
        for (let lv = 0; lv < 4; lv++) {
          c.beginPath();
          let any = false;
          for (const st of sh.stars) {
            if (st.ci !== ci) continue;
            let k = clamp(st.life / st.max + 0.15);
            // crackle stars twinkle out at the end of their life
            if (sh.kind === 'crackle' && sh.age > 1.1) k *= (Math.sin(st.x * 0.7 + sh.age * 60) > 0.2 ? 1 : 0.1);
            if (Math.min(3, Math.floor(k * 4)) !== lv || k <= 0.02) continue;
            any = true;
            c.moveTo(st.hx[0], st.hy[0]);
            for (let i = 1; i < st.hx.length; i++) c.lineTo(st.hx[i], st.hy[i]);
          }
          if (!any) continue;
          const a = (lv + 0.6) / 4;
          c.strokeStyle = sh.cols[ci];
          c.globalAlpha = a * 0.25;
          c.lineWidth = m * 0.009;
          c.stroke();
          c.globalAlpha = a;
          c.lineWidth = Math.max(1, m * 0.0028);
          c.stroke();
        }
      }
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';

    // the skyline
    c.fillStyle = '#05060f';
    let x = 0, i = 0;
    while (x < w) {
      const bw = m * (0.03 + ((i * 37) % 7) * 0.01);
      const bh = m * (0.03 + ((i * 53) % 11) * 0.011);
      c.fillRect(x, wy - bh, bw + 1, bh);
      // lit windows
      c.fillStyle = 'rgba(255,200,120,0.5)';
      for (let yy = wy - bh + m * 0.012; yy < wy - m * 0.01; yy += m * 0.022)
        for (let xx = x + m * 0.008; xx < x + bw - m * 0.01; xx += m * 0.016) if (((xx * 13 + yy * 7) | 0) % 5 === 0) c.fillRect(xx, yy, m * 0.006, m * 0.008);
      c.fillStyle = '#05060f';
      x += bw;
      i++;
    }
    // the harbour: a squashed, rippled mirror of the sky
    c.fillStyle = '#04050b';
    c.fillRect(0, wy, w, h - wy);
    const rows = Math.ceil((h - wy) / 2);
    for (let r = 0; r < rows; r++) {
      const y = wy + r * 2;
      const src = wy - (y - wy) * 2.2;
      if (src < 0) break;
      const off = Math.sin(r * 0.8 + s.t * 2.2) * (1 + r * 0.15);
      c.globalAlpha = 0.6 * (1 - r / rows);
      c.drawImage(cv, 0, src * dpr, w * dpr, 2 * dpr, off, y, w, 2);
    }
    c.globalAlpha = 1;
    const vg = c.createRadialGradient(w / 2, h * 0.45, m * 0.35, w / 2, h * 0.45, Math.max(w, h) * 0.8);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);
  }, [fx.t, w, h, s]);

  return (
    <Stage fx={fx} cursor="crosshair" style={{ background: '#03040c' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      <button
        type="button"
        aria-label="Launch a firework"
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'crosshair' }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
        }}
      />
    </Stage>
  );
}
