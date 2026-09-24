import type { VisualKey } from '../data/projects';

const L = 'rgb(var(--c-line-strong))';
const D = 'rgb(var(--c-line))';
const A = 'rgb(var(--c-accent))';
const T = 'rgb(var(--c-text))';

/**
 * Wireframe previews used in place of client screenshots.
 * Each variant is a schematic of the kind of system the project is.
 */
export default function ProjectVisual({ variant }: { variant: VisualKey }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" fill="none" aria-hidden role="presentation">
      <rect x="0" y="0" width="320" height="200" fill="rgb(var(--c-surface-2))" />
      <g opacity="0.5">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="200" stroke={D} strokeWidth="0.5" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="320" y2={i * 40} stroke={D} strokeWidth="0.5" />
        ))}
      </g>
      {render(variant)}
      <rect x="0.5" y="0.5" width="319" height="199" stroke={D} strokeWidth="1" />
    </svg>
  );
}

function render(variant: VisualKey) {
  switch (variant) {
    case 'dashboard':
      return (
        <g>
          <rect x="16" y="16" width="70" height="168" stroke={L} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x="24" y={28 + i * 22} width={i === 1 ? 46 : 54} height="6" fill={i === 1 ? A : D} />
          ))}
          <rect x="98" y="16" width="206" height="40" stroke={L} />
          <rect x="106" y="30" width="60" height="6" fill={T} opacity="0.6" />
          <rect x="106" y="42" width="120" height="4" fill={D} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={98 + i * 70} y="68" width="62" height="48" stroke={L} />
              <rect x={106 + i * 70} y="80" width="24" height="10" fill={i === 0 ? A : D} />
              <rect x={106 + i * 70} y="96" width="40" height="4" fill={D} />
            </g>
          ))}
          <rect x="98" y="128" width="206" height="56" stroke={L} />
          <polyline
            points="106,172 130,158 154,164 178,140 202,148 226,126 250,134 274,116 296,122"
            stroke={A}
            strokeWidth="1.5"
          />
        </g>
      );
    case 'ledger':
      return (
        <g>
          <rect x="16" y="16" width="288" height="26" stroke={L} />
          <rect x="24" y="26" width="52" height="6" fill={T} opacity="0.6" />
          <circle cx="292" cy="29" r="4" fill={A} />
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i}>
              <line x1="16" y1={58 + i * 26} x2="304" y2={58 + i * 26} stroke={D} />
              <rect x="24" y={64 + i * 26} width="70" height="5" fill={D} />
              <rect x="120" y={64 + i * 26} width="46" height="5" fill={D} />
              <rect x="196" y={64 + i * 26} width="30" height="5" fill={i === 2 ? A : D} />
              <rect x={260 - i * 6} y={64 + i * 26} width={44 + i * 6} height="5" fill={T} opacity="0.35" />
            </g>
          ))}
          <line x1="180" y1="16" x2="180" y2="184" stroke={L} strokeDasharray="3 3" />
        </g>
      );
    case 'market':
      return (
        <g>
          {/* ticker strip */}
          <rect x="16" y="16" width="288" height="20" stroke={D} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={24 + i * 56} y="23" width="18" height="5" fill={T} opacity="0.45" />
              <rect x={46 + i * 56} y="23" width="12" height="5" fill={i === 1 ? A : D} />
            </g>
          ))}
          {/* candlesticks */}
          {[
            [44, 108, 70],
            [72, 96, 56],
            [100, 118, 84],
            [128, 88, 52],
            [156, 104, 64],
            [184, 74, 44],
            [212, 92, 60],
            [240, 66, 36],
            [268, 80, 50],
          ].map(([x, top, bottom], i) => (
            <g key={x}>
              <line
                x1={x}
                y1={Math.min(top, bottom) - 10}
                x2={x}
                y2={Math.max(top, bottom) + 10}
                stroke={L}
                strokeWidth="0.8"
              />
              <rect
                x={x - 5}
                y={Math.min(top, bottom)}
                width="10"
                height={Math.abs(bottom - top)}
                fill={i === 7 ? A : 'rgb(var(--c-bg))'}
                stroke={i === 7 ? A : L}
              />
            </g>
          ))}
          {/* trend + axis */}
          <polyline
            points="44,89 72,76 100,101 128,70 156,84 184,59 212,76 240,51 268,65"
            stroke={A}
            strokeWidth="1"
            opacity="0.55"
          />
          <line x1="16" y1="160" x2="304" y2="160" stroke={D} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={44 + i * 48} y1="160" x2={44 + i * 48} y2="166" stroke={L} strokeWidth="0.8" />
          ))}
          <rect x="16" y="174" width="52" height="6" fill={D} />
          <rect x="252" y="174" width="52" height="6" fill={D} />
        </g>
      );
    case 'map':
      return (
        <g>
          <path
            d="M70 46 L104 34 L142 44 L176 32 L214 46 L246 40 L262 62 L250 92 L262 122 L232 150 L196 144 L166 160 L128 152 L96 162 L72 138 L84 104 L62 78 Z"
            stroke={L}
            strokeWidth="1"
            fill="rgb(var(--c-surface))"
          />
          {[
            [118, 78],
            [176, 66],
            [214, 100],
            [150, 120],
            [96, 124],
            [236, 64],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={i === 1 ? 4 : 2.5} fill={i === 1 ? A : T} opacity={i === 1 ? 1 : 0.5} />
              {i === 1 && <circle cx={x} cy={y} r="10" stroke={A} strokeWidth="0.8" opacity="0.6" />}
            </g>
          ))}
          <line x1="118" y1="78" x2="176" y2="66" stroke={A} strokeWidth="0.6" strokeDasharray="2 2" />
          <line x1="176" y1="66" x2="214" y2="100" stroke={A} strokeWidth="0.6" strokeDasharray="2 2" />
          <rect x="16" y="16" width="56" height="8" fill={D} />
          <rect x="248" y="176" width="56" height="8" fill={D} />
        </g>
      );
    case 'pipeline':
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={20 + i * 76} y="76" width="56" height="48" stroke={i === 3 ? A : L} />
              <rect x={30 + i * 76} y="90" width="36" height="4" fill={D} />
              <rect x={30 + i * 76} y="100" width="24" height="4" fill={D} />
              {i < 3 && <path d={`M${76 + i * 76} 100 h20 m-6 -4 l6 4 l-6 4`} stroke={A} strokeWidth="1" />}
            </g>
          ))}
          <rect x="20" y="24" width="284" height="28" stroke={D} strokeDasharray="4 3" />
          <rect x="30" y="34" width="60" height="6" fill={D} />
          <g opacity="0.8">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect key={i} x={20 + i * 36} y={166 - (i % 4) * 8} width="22" height={(i % 4) * 8 + 10} fill={i === 5 ? A : D} />
            ))}
          </g>
        </g>
      );
    case 'table':
      return (
        <g>
          <rect x="16" y="16" width="288" height="168" stroke={L} />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`r${i}`} x1="16" y1={40 + i * 21} x2="304" y2={40 + i * 21} stroke={D} />
          ))}
          {[76, 150, 224].map((x) => (
            <line key={x} x1={x} y1="16" x2={x} y2="184" stroke={D} />
          ))}
          <rect x="16" y="16" width="288" height="24" fill="rgb(var(--c-surface))" />
          <rect x="24" y="25" width="38" height="6" fill={T} opacity="0.5" />
          <rect x="84" y="25" width="38" height="6" fill={T} opacity="0.5" />
          <rect x="158" y="25" width="38" height="6" fill={T} opacity="0.5" />
          <rect x="232" y="25" width="38" height="6" fill={T} opacity="0.5" />
          <rect x="232" y="46" width="48" height="10" fill={A} opacity="0.85" />
          <rect x="232" y="130" width="34" height="10" fill={A} opacity="0.4" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} opacity="0.6">
              <rect x="24" y={46 + i * 21} width="40" height="5" fill={D} />
              <rect x="84" y={46 + i * 21} width="52" height="5" fill={D} />
              <rect x="158" y={46 + i * 21} width="46" height="5" fill={D} />
            </g>
          ))}
        </g>
      );
    case 'layout':
      return (
        <g>
          <rect x="16" y="16" width="288" height="36" stroke={L} />
          <rect x="26" y="30" width="26" height="8" fill={A} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={200 + i * 30} y="32" width="20" height="4" fill={D} />
          ))}
          <rect x="16" y="62" width="176" height="80" stroke={L} fill="rgb(var(--c-surface))" />
          <rect x="30" y="78" width="96" height="12" fill={T} opacity="0.55" />
          <rect x="30" y="98" width="130" height="5" fill={D} />
          <rect x="30" y="108" width="112" height="5" fill={D} />
          <rect x="30" y="122" width="52" height="12" stroke={A} />
          <rect x="202" y="62" width="102" height="80" stroke={L} />
          <path d="M202 142 L240 104 L268 126 L304 92" stroke={L} strokeWidth="1" />
          <circle cx="278" cy="84" r="7" stroke={A} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={16 + i * 100} y="152" width="88" height="32" stroke={D} />
          ))}
        </g>
      );
    case 'cube':
    default:
      return (
        <g>
          <g stroke={L} strokeWidth="1">
            <path d="M118 62 L202 62 L202 146 L118 146 Z" />
            <path d="M146 40 L230 40 L230 124 L146 124 Z" />
            <path d="M118 62 L146 40 M202 62 L230 40 M202 146 L230 124 M118 146 L146 124" />
          </g>
          <circle cx="174" cy="93" r="3" fill={A} />
          <path d="M174 93 L118 62 M174 93 L230 124 M174 93 L202 62 M174 93 L146 124" stroke={A} strokeWidth="0.6" opacity="0.7" />
          <line x1="16" y1="93" x2="104" y2="93" stroke={D} strokeDasharray="3 3" />
          <line x1="244" y1="93" x2="304" y2="93" stroke={D} strokeDasharray="3 3" />
          <rect x="16" y="168" width="60" height="6" fill={D} />
          <rect x="248" y="26" width="56" height="6" fill={D} />
        </g>
      );
  }
}
