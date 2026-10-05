import { useId } from 'react';
import type { ReactElement } from 'react';

/*
 * Drawn illustrations for the modernization mockups — no photos anywhere.
 * Everything is parametric SVG, so one drawing serves several products.
 */

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const r = c((n >> 16) & 255);
  const g = c((n >> 8) & 255);
  const b = c(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/* ------------------------------------------------------------------ cakes */

export type Topping = 'berries' | 'candles' | 'flowers' | 'macarons' | 'nuts' | 'sprinkles' | 'none';

export interface CakeProps {
  /** sponge / side colour */
  body: string;
  /** cream between layers and on top */
  cream: string;
  /** a ganache drip over the edge */
  drip?: string;
  top?: Topping;
  /** colour of the topping (berries, flowers…) */
  accent?: string;
  tiers?: 1 | 2 | 3;
  /** visible cream layers on a "naked" cake */
  layers?: number;
  plate?: boolean;
  /** text piped on the top, e.g. from an order form */
  writing?: string;
  className?: string;
}

function Tier({
  cx,
  y,
  w,
  h,
  cream,
  drip,
  layers,
  gid,
}: {
  cx: number;
  y: number;
  w: number;
  h: number;
  cream: string;
  drip?: string;
  layers: number;
  gid: string;
}) {
  const r = w / 2;
  const ry = w * 0.13;
  const side = `M${cx - r},${y} L${cx - r},${y + h} A${r},${ry} 0 0 0 ${cx + r},${y + h} L${cx + r},${y} Z`;
  // drip: follow the front edge with drops of varied length
  let dripPath = '';
  if (drip) {
    const n = 9;
    const edge = (x: number) => y + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / r) ** 2));
    const xs = Array.from({ length: n + 1 }, (_, i) => cx - r + (i * w) / n);
    let d = `M${xs[0]},${y + h * 0.06}`;
    for (let i = 0; i < n; i++) {
      const x0 = xs[i];
      const x1 = xs[i + 1];
      const m = (x0 + x1) / 2;
      const drop = h * (i % 2 ? 0.42 - ((i * 13) % 5) / 40 : 0.24);
      const e0 = edge(x0) + h * 0.06;
      const e1 = edge(x1) + h * 0.06;
      const em = edge(m) + drop;
      d += ` C${x0 + 2},${e0 + 2} ${m - 4},${em} ${m},${em} C${m + 4},${em} ${x1 - 2},${e1 + 2} ${x1},${e1}`;
    }
    dripPath = `${d} L${cx + r},${y} A${r},${ry} 0 0 0 ${cx - r},${y} Z`;
  }
  return (
    <g>
      <path d={side} fill={`url(#${gid}-side)`} />
      {Array.from({ length: layers }, (_, i) => {
        const ly = y + ((i + 1) * h) / (layers + 1);
        return (
          <path
            key={i}
            d={`M${cx - r},${ly} A${r},${ry} 0 0 0 ${cx + r},${ly}`}
            fill="none"
            stroke={cream}
            strokeWidth={h / 9}
            opacity={0.95}
          />
        );
      })}
      {drip && <path d={dripPath} fill={drip} />}
      <ellipse cx={cx} cy={y} rx={r} ry={ry} fill={drip ?? cream} />
      <ellipse cx={cx - r * 0.25} cy={y - ry * 0.25} rx={r * 0.45} ry={ry * 0.35} fill="#fff" opacity={0.18} />
    </g>
  );
}

function Toppings({ kind, cx, y, w, accent }: { kind: Topping; cx: number; y: number; w: number; accent: string }) {
  const r = w / 2;
  const ry = w * 0.13;
  const ring = (n: number, scale = 0.72) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return { x: cx + Math.cos(a) * r * scale, y: y + Math.sin(a) * ry * scale, back: Math.sin(a) < 0 };
    }).sort((p, q) => p.y - q.y);
  if (kind === 'berries')
    return (
      <g>
        {ring(9).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y - 5} r={w * 0.045} fill={accent} />
            <circle cx={p.x - w * 0.015} cy={p.y - 6.5} r={w * 0.013} fill="#fff" opacity={0.6} />
          </g>
        ))}
        <path d={`M${cx - 8},${y - 4} q8,-14 16,0`} fill="#5f8f4e" />
      </g>
    );
  if (kind === 'candles')
    return (
      <g>
        {[-0.3, -0.1, 0.1, 0.3].map((o, i) => (
          <g key={i}>
            <rect x={cx + o * w - 2.5} y={y - 30 + (i % 2) * 3} width={5} height={24} rx={1.5} fill={i % 2 ? accent : '#fff'} />
            <path
              d={`M${cx + o * w},${y - 40 + (i % 2) * 3} q4,6 0,9 q-4,-3 0,-9`}
              fill="#ffb627"
              className="mz-flame"
            />
          </g>
        ))}
      </g>
    );
  if (kind === 'flowers')
    return (
      <g>
        {ring(7, 0.8).map((p, i) => (
          <g key={i} transform={`translate(${p.x},${p.y - 4})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-5} rx={3.6} ry={5.5} fill={accent} transform={`rotate(${a})`} opacity={0.95} />
            ))}
            <circle r={2.6} fill="#ffd36e" />
          </g>
        ))}
      </g>
    );
  if (kind === 'macarons')
    return (
      <g>
        {ring(7, 0.8).map((p, i) => (
          <g key={i} transform={`translate(${p.x},${p.y - 7})`}>
            <rect x={-8} y={-6} width={16} height={5} rx={2.5} fill={i % 2 ? accent : shade(accent, 0.2)} />
            <rect x={-7.5} y={-1.5} width={15} height={2.4} fill="#fff6ea" />
            <rect x={-8} y={0.6} width={16} height={5} rx={2.5} fill={i % 2 ? accent : shade(accent, 0.2)} />
          </g>
        ))}
      </g>
    );
  if (kind === 'nuts')
    return (
      <g>
        {ring(10, 0.7).map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y - 3} rx={6} ry={3.6} fill={accent} transform={`rotate(${i * 33} ${p.x} ${p.y - 3})`} />
        ))}
      </g>
    );
  if (kind === 'sprinkles')
    return (
      <g>
        {Array.from({ length: 26 }, (_, i) => {
          const a = i * 2.39;
          const d = 0.15 + ((i * 53) % 80) / 100;
          const x = cx + Math.cos(a) * r * 0.85 * d;
          const yy = y + Math.sin(a) * ry * 0.85 * d;
          const cols = ['#ff6fa8', '#ffd36e', '#7ad3c8', '#9b8cff', '#fff'];
          return <rect key={i} x={x} y={yy} width={6} height={2} rx={1} fill={cols[i % 5]} transform={`rotate(${i * 47} ${x} ${yy})`} />;
        })}
      </g>
    );
  return null;
}

export function Cake({
  body,
  cream,
  drip,
  top = 'berries',
  accent = '#d81b60',
  tiers = 1,
  layers = 2,
  plate = true,
  writing,
  className,
}: CakeProps) {
  const gid = useId().replace(/:/g, '');
  const base = { w: 150, h: 64 };
  const parts: Array<{ y: number; w: number; h: number }> = [];
  let bottom = 140;
  for (let t = 0; t < tiers; t++) {
    const w = base.w * (1 - t * 0.27);
    const h = base.h * (tiers > 1 ? 0.62 : 1);
    parts.push({ y: bottom - h, w, h });
    bottom -= h;
  }
  const topTier = parts[parts.length - 1];
  return (
    <svg viewBox="0 0 200 170" className={className} role="img" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-side`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(body, -0.12)} />
          <stop offset="0.35" stopColor={body} />
          <stop offset="0.7" stopColor={shade(body, 0.06)} />
          <stop offset="1" stopColor={shade(body, -0.16)} />
        </linearGradient>
      </defs>
      {plate && (
        <>
          <ellipse cx={100} cy={146} rx={92} ry={17} fill="#000" opacity={0.08} />
          <ellipse cx={100} cy={142} rx={90} ry={16} fill="#fdfbf8" stroke="#e8e0dc" />
        </>
      )}
      {parts.map((p, i) => (
        <Tier key={i} cx={100} y={p.y} w={p.w} h={p.h} cream={cream} drip={drip} layers={layers} gid={gid} />
      ))}
      {writing && (
        <text
          x={100}
          y={topTier.y + topTier.w * 0.07}
          textAnchor="middle"
          fontFamily="'Caveat', cursive"
          fontSize={Math.max(9, 17 - writing.length * 0.25)}
          fill={drip ? '#fff' : shade(accent, -0.15)}
        >
          {writing}
        </text>
      )}
      <Toppings kind={top} cx={100} y={topTier.y} w={topTier.w} accent={accent} />
    </svg>
  );
}

/** a tray of petits fours */
export function Petits({ className, colors = ['#f48fb1', '#6d4c41', '#fff3e0', '#ce93d8'] }: { className?: string; colors?: string[] }) {
  const items = [
    { x: 30, y: 72 },
    { x: 80, y: 66 },
    { x: 130, y: 72 },
    { x: 55, y: 104 },
    { x: 105, y: 104 },
    { x: 155, y: 100 },
  ];
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden>
      <ellipse cx={100} cy={145} rx={92} ry={16} fill="#fdfbf8" stroke="#e8e0dc" />
      {items.map((p, i) => {
        const c = colors[i % colors.length];
        return (
          <g key={i} transform={`translate(${p.x - 18},${p.y})`}>
            <path d="M0,10 L18,4 L36,10 L36,32 L18,38 L0,32 Z" fill={shade(c, -0.08)} />
            <path d="M18,16 L36,10 L36,32 L18,38 Z" fill={shade(c, -0.18)} />
            <path d="M0,10 L18,4 L36,10 L18,16 Z" fill={shade(c, 0.12)} />
            <path d="M0,18 L18,24 L36,18" stroke="#fff6ea" strokeWidth={2.4} fill="none" opacity={0.8} />
            <circle cx={18} cy={9} r={3} fill={i % 2 ? '#e53965' : '#fff'} />
          </g>
        );
      })}
    </svg>
  );
}

/** a simple teddy-bear figure cake */
export function FigureCake({ className, body = '#fff7f0', bear = '#d9a066', accent = '#f48fb1' }: { className?: string; body?: string; bear?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden>
      <ellipse cx={100} cy={146} rx={90} ry={16} fill="#fdfbf8" stroke="#e8e0dc" />
      <path d="M38,98 L38,138 A62,14 0 0 0 162,138 L162,98 Z" fill={body} stroke="#eadbd0" />
      <ellipse cx={100} cy={98} rx={62} ry={14} fill={shade(body, 0.02)} stroke="#eadbd0" />
      <path d="M40,120 Q100,136 160,120" stroke={accent} strokeWidth={5} fill="none" />
      <g transform="translate(100 74)">
        <ellipse cx={0} cy={18} rx={22} ry={18} fill={bear} />
        <circle cx={0} cy={-8} r={18} fill={bear} />
        <circle cx={-14} cy={-22} r={7} fill={bear} />
        <circle cx={14} cy={-22} r={7} fill={bear} />
        <circle cx={-14} cy={-22} r={3.5} fill={shade(bear, 0.15)} />
        <circle cx={14} cy={-22} r={3.5} fill={shade(bear, 0.15)} />
        <ellipse cx={0} cy={-2} rx={8} ry={6} fill={shade(bear, 0.2)} />
        <circle cx={-6} cy={-11} r={2} fill="#3a2520" />
        <circle cx={6} cy={-11} r={2} fill="#3a2520" />
        <circle cx={0} cy={-4} r={2.2} fill="#3a2520" />
        <path d="M-8,8 L0,14 L8,8 L0,4 Z" fill={accent} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------- ceramics */

export type Ware = 'mug' | 'vase' | 'bowl' | 'plate' | 'teapot' | 'planter' | 'cup';

/** speckled glaze ceramics for the webshop */
export function Ceramic({ kind, glaze, className }: { kind: Ware; glaze: string; className?: string }) {
  const gid = useId().replace(/:/g, '');
  const dark = shade(glaze, -0.14);
  const fill = `url(#${gid}-g)`;
  const speck = (
    <g opacity={0.35}>
      {Array.from({ length: 34 }, (_, i) => (
        <circle key={i} cx={50 + ((i * 47) % 100)} cy={45 + ((i * 29) % 95)} r={0.7 + (i % 3) * 0.35} fill={shade(glaze, -0.4)} />
      ))}
    </g>
  );
  const shapes: Record<Ware, ReactElement> = {
    mug: (
      <g>
        <path d="M136,78 c26,0 26,44 -2,44" stroke={dark} strokeWidth={9} fill="none" />
        <path d="M60,62 L60,138 Q60,150 74,150 L126,150 Q140,150 140,138 L140,62 Z" fill={fill} />
        <ellipse cx={100} cy={62} rx={40} ry={9} fill={dark} />
        <ellipse cx={100} cy={63} rx={35} ry={6.5} fill={shade(glaze, -0.3)} />
      </g>
    ),
    cup: (
      <g>
        <ellipse cx={100} cy={146} rx={58} ry={10} fill={shade(glaze, 0.08)} stroke={dark} />
        <path d="M134,92 c20,0 20,30 -4,30" stroke={dark} strokeWidth={7} fill="none" />
        <path d="M58,84 Q60,140 100,140 Q140,140 142,84 Z" fill={fill} />
        <ellipse cx={100} cy={84} rx={42} ry={8} fill={shade(glaze, -0.3)} />
      </g>
    ),
    vase: (
      <g>
        <path d="M84,30 L116,30 L114,48 Q150,72 146,108 Q142,148 100,150 Q58,148 54,108 Q50,72 86,48 Z" fill={fill} />
        <ellipse cx={100} cy={30} rx={16} ry={4} fill={shade(glaze, -0.3)} />
      </g>
    ),
    bowl: (
      <g>
        <path d="M36,82 Q40,146 100,146 Q160,146 164,82 Z" fill={fill} />
        <ellipse cx={100} cy={82} rx={64} ry={14} fill={shade(glaze, -0.25)} />
        <ellipse cx={100} cy={84} rx={56} ry={10} fill={shade(glaze, 0.1)} />
      </g>
    ),
    plate: (
      <g>
        <ellipse cx={100} cy={112} rx={78} ry={28} fill={dark} />
        <ellipse cx={100} cy={106} rx={78} ry={28} fill={fill} />
        <ellipse cx={100} cy={106} rx={50} ry={17} fill={shade(glaze, -0.06)} />
      </g>
    ),
    teapot: (
      <g>
        <path d="M146,96 Q176,78 178,60" stroke={dark} strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M54,92 c-28,0 -28,40 0,40" stroke={dark} strokeWidth={8} fill="none" />
        <path d="M52,84 Q46,148 100,148 Q154,148 148,84 Z" fill={fill} />
        <ellipse cx={100} cy={84} rx={48} ry={10} fill={dark} />
        <ellipse cx={100} cy={78} rx={26} ry={7} fill={shade(glaze, 0.05)} />
        <circle cx={100} cy={70} r={6} fill={dark} />
      </g>
    ),
    planter: (
      <g>
        {[-40, -18, 0, 18, 40].map((a, i) => (
          <path key={i} d={`M100,78 q${a * 0.6},-30 ${a},-50`} stroke="#5d8a54" strokeWidth={4} fill="none" />
        ))}
        {[-40, -18, 0, 18, 40].map((a, i) => (
          <ellipse key={`l${i}`} cx={100 + a} cy={28 + Math.abs(a) * 0.3} rx={9} ry={15} fill={i % 2 ? '#6fa063' : '#4f8a48'} transform={`rotate(${a} ${100 + a} ${28 + Math.abs(a) * 0.3})`} />
        ))}
        <path d="M58,78 L68,146 L132,146 L142,78 Z" fill={fill} />
        <rect x={54} y={72} width={92} height={14} rx={3} fill={dark} />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${gid}-g`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(glaze, -0.12)} />
          <stop offset="0.4" stopColor={shade(glaze, 0.06)} />
          <stop offset="1" stopColor={shade(glaze, -0.18)} />
        </linearGradient>
        <clipPath id={`${gid}-c`}>{shapes[kind]}</clipPath>
      </defs>
      <ellipse cx={100} cy={152} rx={70} ry={8} fill="#000" opacity={0.08} />
      {shapes[kind]}
      <g clipPath={`url(#${gid}-c)`}>{speck}</g>
    </svg>
  );
}

/* -------------------------------------------------------------- law */

export function Scales({ className, color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke={color} strokeWidth={1.6} aria-hidden>
      <path d="M32 8v46M20 54h24M14 16h36M32 12l-2 4h4z" />
      <path d="M14 16l-8 18h16zM50 16l-8 18h16z" />
      <path d="M6 34a8 4 0 0 0 16 0M42 34a8 4 0 0 0 16 0" />
    </svg>
  );
}

/** columns of a classical façade, drawn as fine lines — the law-firm hero art */
export function Facade({ className, color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" stroke={color} strokeWidth={1} aria-hidden>
      <path d="M20 90 L200 20 L380 90 Z" />
      <path d="M50 84 L200 30 L350 84" opacity={0.5} />
      <path d="M20 96h360M30 104h340" />
      {[50, 110, 170, 230, 290, 350].map((x) => (
        <g key={x}>
          <path d={`M${x - 14} 112h28M${x - 10} 118h20`} />
          <path d={`M${x - 9} 118 L${x - 9} 262 M${x + 9} 118 L${x + 9} 262`} />
          {[-4, 0, 4].map((o) => (
            <path key={o} d={`M${x + o} 122 L${x + o} 258`} opacity={0.4} />
          ))}
          <path d={`M${x - 12} 262h24M${x - 15} 268h30`} />
        </g>
      ))}
      <path d="M10 274h380M0 282h400" />
    </svg>
  );
}

/** a stylised portrait — silhouette with hair and suit, no face, no photo */
export function Avatar({ initials, hue, hair = 'short', className }: { initials: string; hue: number; hair?: 'short' | 'long' | 'bun'; className?: string }) {
  const gid = useId().replace(/:/g, '');
  const skin = `hsl(${(hue + 20) % 360} 28% 84%)`;
  const hairC = `hsl(${hue} 18% 26%)`;
  const suit = `hsl(${hue} 32% 22%)`;
  return (
    <svg viewBox="0 0 120 150" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 26% 88%)`} />
          <stop offset="1" stopColor={`hsl(${hue} 24% 70%)`} />
        </linearGradient>
      </defs>
      <rect width="120" height="150" fill={`url(#${gid})`} />
      <circle cx="94" cy="30" r="40" fill="#fff" opacity="0.18" />
      {hair === 'long' && <path d="M38 62c-4-26 8-42 22-42s26 16 22 42c-2 16 4 26 8 34H30c4-8 10-18 8-34z" fill={hairC} />}
      <path d="M14 150c2-30 20-46 46-46s44 16 46 46z" fill={suit} />
      <path d="M50 104l10 22 10-22z" fill="#f4f1ea" />
      <path d="M57 108l3 14 3-14z" fill={`hsl(${(hue + 180) % 360} 30% 40%)`} />
      <rect x="53" y="86" width="14" height="20" rx="6" fill={skin} />
      <ellipse cx="60" cy="66" rx="19" ry="23" fill={skin} />
      {hair === 'short' && <path d="M40 64c-2-22 10-32 21-32 13 0 22 10 19 30-4-10-12-16-22-16-8 0-14 6-18 18z" fill={hairC} />}
      {hair === 'long' && <path d="M41 62c0-18 9-28 20-28s20 10 19 26c-6-8-14-12-22-12-6 0-12 6-17 14z" fill={hairC} />}
      {hair === 'bun' && (
        <>
          <circle cx="60" cy="34" r="10" fill={hairC} />
          <path d="M41 64c-1-20 9-30 19-30s20 10 19 30c-3-12-11-18-19-18s-16 6-19 18z" fill={hairC} />
        </>
      )}
      <text x="108" y="142" textAnchor="end" fontFamily="Georgia, serif" fontSize="9" fill="#fff" opacity="0.85" letterSpacing="1">
        {initials}
      </text>
    </svg>
  );
}
