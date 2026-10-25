import { useLayoutEffect, useRef } from 'react';
import { defineSim, useFx, Stage, sp, spring, approach, clamp } from '../kit';
import type { Spring } from '../kit';

/**
 * A progress ring made of swirling particles. The filled arc is a glowing tube: every particle
 * spins around the tube's core while the whole stream flows along the ring, so the arc looks
 * like a twisting current. A comet head leads the progress and throws sparks. At 100% the ring
 * bursts outward and gathers itself again. Hover to pull the stream; hold to speed it up.
 */

const P = 900;

interface S {
  prog: number;
  shown: Spring;
  u: Float32Array; // position along the filled arc (0..1)
  phi: Float32Array; // angle around the tube
  ws: Float32Array; // spin speed
  tr: Float32Array; // tube radius factor
  hue: Uint8Array;
  // burst state
  bx: Float32Array;
  by: Float32Array;
  bvx: Float32Array;
  bvy: Float32Array;
  burst: number; // seconds since burst (-1 = none)
  boost: number;
  flash: number;
  idle: number;
  t: number;
  sparks: { x: number; y: number; vx: number; vy: number; life: number }[];
}

function geom(w: number, h: number) {
  const m = Math.min(w, h);
  return { m, cx: w / 2, cy: h / 2, R: m * 0.32, tube: m * 0.035 };
}

export const sim = defineSim<S>({
  init: (_w, _h, rand) => {
    const s: S = {
      prog: 0,
      shown: sp(0),
      u: new Float32Array(P),
      phi: new Float32Array(P),
      ws: new Float32Array(P),
      tr: new Float32Array(P),
      hue: new Uint8Array(P),
      bx: new Float32Array(P),
      by: new Float32Array(P),
      bvx: new Float32Array(P),
      bvy: new Float32Array(P),
      burst: -1,
      boost: 0,
      flash: 0,
      idle: 0,
      t: 0,
      sparks: [],
    };
    for (let i = 0; i < P; i++) {
      s.u[i] = rand();
      s.phi[i] = rand() * Math.PI * 2;
      s.ws[i] = (2 + rand() * 4) * (rand() < 0.5 ? 1 : -1);
      s.tr[i] = Math.sqrt(rand());
      s.hue[i] = Math.floor(rand() * 3);
    }
    return s;
  },
  step(s, f) {
    const { w, h, dt } = f;
    if (dt <= 0) return;
    const g = geom(w, h);
    s.t += dt;
    s.boost = approach(s.boost, f.p.down ? 1 : 0, 5, dt);
    if (f.pressed) f.emit({ name: 'whoosh', gain: 0.35, rate: 1.4 });
    if (s.burst < 0) {
      s.prog = Math.min(1, s.prog + dt * (0.16 + 0.06 * Math.sin(s.t * 2.3) + s.boost * 0.35));
      if (s.prog >= 1) {
        s.burst = 0;
        s.flash = 1;
        f.emit({ name: 'success', gain: 0.6 });
        f.emit({ name: 'spark', gain: 0.5 });
        // every particle leaves from where it is, flung outward with a spin
        for (let i = 0; i < P; i++) {
          const a = s.u[i] * Math.PI * 2 - Math.PI / 2;
          const r = g.R + Math.cos(s.phi[i]) * g.tube * s.tr[i];
          s.bx[i] = g.cx + Math.cos(a) * r;
          s.by[i] = g.cy + Math.sin(a) * r;
          const v = g.m * (0.4 + f.rand() * 1.2);
          s.bvx[i] = Math.cos(a) * v - Math.sin(a) * v * 0.4;
          s.bvy[i] = Math.sin(a) * v + Math.cos(a) * v * 0.4;
        }
      }
    } else {
      s.burst += dt;
      for (let i = 0; i < P; i++) {
        s.bvx[i] = approach(s.bvx[i], 0, 2.5, dt);
        s.bvy[i] = approach(s.bvy[i], 0, 2.5, dt);
        s.bx[i] += s.bvx[i] * dt;
        s.by[i] += s.bvy[i] * dt;
      }
      if (s.burst > 1.3) {
        s.burst = -1;
        s.prog = 0;
        s.shown.x = 0;
        s.shown.v = 0;
      }
    }
    spring(s.shown, s.prog, 120, 18, dt);
    s.flash = approach(s.flash, 0, 3, dt);
    // swirl: spin around the tube, and flow slowly along the arc
    const spin = 1 + s.boost * 2.5;
    for (let i = 0; i < P; i++) {
      s.phi[i] += s.ws[i] * dt * spin;
      s.u[i] += dt * 0.04 * spin * (0.6 + s.tr[i]);
      if (s.u[i] > 1) s.u[i] -= 1;
    }
    // sparks off the comet head
    if (s.burst < 0 && f.rand() < dt * (20 + s.boost * 40)) {
      const a = s.shown.x * Math.PI * 2 - Math.PI / 2;
      const hx = g.cx + Math.cos(a) * g.R;
      const hy = g.cy + Math.sin(a) * g.R;
      const out = (f.rand() - 0.3) * g.m * 0.6;
      s.sparks.push({ x: hx, y: hy, vx: Math.cos(a) * out - Math.sin(a) * g.m * 0.2, vy: Math.sin(a) * out + Math.cos(a) * g.m * 0.2, life: 0.4 + f.rand() * 0.4 });
    }
    for (const p of s.sparks) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.exp(-3 * dt);
      p.vy *= Math.exp(-3 * dt);
      p.life -= dt;
    }
    s.sparks = s.sparks.filter((p) => p.life > 0);
  },
});

const COLS = ['#5ef0ff', '#9b7bff', '#ff6fd8'];

export default function ParticleRing() {
  const fx = useFx(sim);
  const cv = useRef<HTMLCanvasElement>(null);
  const { w, h } = fx;
  useLayoutEffect(() => {
    const cn = cv.current;
    if (!cn) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cn.width !== Math.round(w * dpr)) cn.width = Math.round(w * dpr);
    if (cn.height !== Math.round(h * dpr)) cn.height = Math.round(h * dpr);
    const ctx = cn.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const s = fx.s;
    const g = geom(w, h);
    const { cx, cy, R, tube, m } = g;
    const p = Math.max(0, Math.min(1, s.shown.x));
    // the empty track
    ctx.strokeStyle = 'rgba(140,160,255,0.08)';
    ctx.lineWidth = tube * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(140,160,255,0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = 'lighter';
    // a soft glow under the filled arc
    if (s.burst < 0 && p > 0.005) {
      ctx.strokeStyle = 'rgba(120,110,255,0.22)';
      ctx.lineWidth = tube * 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
      ctx.stroke();
    }
    const sz = Math.max(1.2, m * 0.004);
    const fade = s.burst < 0 ? 1 : Math.max(0, 1 - s.burst / 1.1);
    const pull = fx.p.over ? 1 : 0;
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = COLS[c];
      for (let i = 0; i < P; i++) {
        if (s.hue[i] !== c) continue;
        let x: number;
        let y: number;
        let depth: number;
        if (s.burst >= 0) {
          x = s.bx[i];
          y = s.by[i];
          depth = 0.6;
        } else {
          // position on the twisted tube: along the arc, then around its core
          const a = -Math.PI / 2 + s.u[i] * p * Math.PI * 2;
          const off = Math.cos(s.phi[i]) * tube * s.tr[i];
          depth = 0.5 + 0.5 * Math.sin(s.phi[i]);
          x = cx + Math.cos(a) * (R + off);
          y = cy + Math.sin(a) * (R + off);
          if (pull > 0) {
            // the stream bends toward a hovering pointer
            const dx = fx.p.x - x;
            const dy = fx.p.y - y;
            const k = clamp(1 - Math.hypot(dx, dy) / (m * 0.22)) * 0.45 * pull;
            x += dx * k;
            y += dy * k;
          }
        }
        ctx.globalAlpha = (0.25 + 0.75 * depth) * fade;
        const r = sz * (0.6 + depth * 0.8);
        ctx.fillRect(x - r / 2, y - r / 2, r, r);
      }
    }
    ctx.globalAlpha = 1;
    if (s.burst < 0) {
      // the comet head
      const a = -Math.PI / 2 + p * Math.PI * 2;
      const hx = cx + Math.cos(a) * R;
      const hy = cy + Math.sin(a) * R;
      const gr = ctx.createRadialGradient(hx, hy, 0, hx, hy, tube * 2.6);
      gr.addColorStop(0, 'rgba(255,255,255,0.95)');
      gr.addColorStop(0.3, 'rgba(255,140,230,0.5)');
      gr.addColorStop(1, 'rgba(255,140,230,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(hx, hy, tube * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff2fb';
    for (const sp2 of s.sparks) {
      ctx.globalAlpha = Math.min(1, sp2.life * 2.5);
      ctx.fillRect(sp2.x - 1, sp2.y - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
    if (s.flash > 0.01) {
      const gr = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 1.6);
      gr.addColorStop(0, `rgba(180,160,255,0)`);
      gr.addColorStop(0.45, `rgba(180,160,255,${0.35 * s.flash})`);
      gr.addColorStop(1, 'rgba(180,160,255,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [fx.t, w, h, fx.s]);
  const { m, cx, cy } = geom(w, h);
  const s = fx.s;
  const done = s.burst >= 0;
  return (
    <Stage fx={fx} cursor="pointer" style={{ background: 'radial-gradient(90% 80% at 50% 50%, #171436 0%, #0b0a1c 60%, #050410 100%)' }}>
      <canvas ref={cv} style={{ position: 'absolute', inset: 0, width: w, height: h }} aria-hidden />
      <div
        style={{
          position: 'absolute',
          left: cx - m * 0.25,
          top: cy - m * 0.08,
          width: m * 0.5,
          textAlign: 'center',
          pointerEvents: 'none',
          fontFamily: "'Archivo Variable', Archivo, system-ui",
          fontWeight: 800,
          fontSize: m * 0.11,
          lineHeight: 1,
          color: '#fff',
          textShadow: '0 0 24px rgba(160,140,255,0.6)',
          transform: `scale(${1 + s.flash * 0.15})`,
        }}
      >
        {done ? '✓' : `${Math.round(Math.min(1, s.prog) * 100)}`}
        <div style={{ fontFamily: "'JetBrains Mono Variable', monospace", fontWeight: 400, fontSize: Math.max(10, m * 0.026), letterSpacing: '0.2em', color: '#9d95d9', marginTop: m * 0.02, textShadow: 'none' }}>
          {done ? 'COMPLETE' : 'PERCENT'}
        </div>
      </div>
      <button type="button" aria-label="Hold to speed up" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
    </Stage>
  );
}
