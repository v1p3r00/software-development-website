import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { DiagramSpec, FlowNode, FlowSpec, LayersSpec, SequenceSpec, StepsSpec, Tone, TreeNode, TreeSpec } from './blocks';
import { TONES, kindTone } from './tones';

// ---------- text metrics (Inter 15px labels, JetBrains Mono 12px sub text) ----------
const CH = 8.6;
const SUB = 7.3;
const LINE = 20;
const SUBLINE = 16;

function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  for (const para of String(text).split('\n')) {
    let cur = '';
    for (const w of para.split(/\s+/)) {
      if (!w) continue;
      if (cur && (cur + ' ' + w).length > max) {
        out.push(cur);
        cur = w;
      } else cur = cur ? cur + ' ' + w : w;
    }
    out.push(cur);
  }
  return out;
}
const textW = (lines: string[], ch: number) => Math.max(0, ...lines.map((l) => l.length * ch));

/** measures the available width, so wide diagrams can switch layout or scroll */
function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(820);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function Svg({ width, height, avail, label, children }: { width: number; height: number; avail: number; label: string; children: ReactNode }) {
  // small diagrams are scaled up a little; wide ones shrink to 72% and then scroll sideways
  const shown = width <= avail ? Math.min(avail, width * 1.12) : Math.max(avail, width * 0.85);
  return (
    <div className={shown > avail ? 'overflow-x-auto pb-2' : undefined}>
      <svg role="img" aria-label={label} viewBox={`0 0 ${width} ${height}`} width={shown} height={(height * shown) / width} className="dg mx-auto block max-w-none">
        {children}
      </svg>
    </div>
  );
}

/** one arrowhead per colour; markers don't inherit the referencing path's colour */
function Heads({ id }: { id: string }) {
  return (
    <defs>
      {TONES.map((t) => (
        <g key={t} className={'tone-' + t}>
          <marker id={`${id}-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="dg-head" />
          </marker>
        </g>
      ))}
    </defs>
  );
}

function Glyph({ kind, x, y }: { kind: FlowNode['kind']; x: number; y: number }) {
  const t = `translate(${x - 10} ${y}) scale(1.25)`;
  switch (kind) {
    case 'user':
      return <g transform={t} className="dg-glyph"><circle cx="8" cy="4.5" r="3.5" /><path d="M1.5 15c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5" /></g>;
    case 'client':
      return <g transform={t} className="dg-glyph"><rect x="1" y="1" width="14" height="10" rx="1" /><path d="M5 15h6M8 11v4" /></g>;
    case 'server':
      return <g transform={t} className="dg-glyph"><rect x="1.5" y="1" width="13" height="6" rx="1" /><rect x="1.5" y="9" width="13" height="6" rx="1" /><path d="M4.5 4h1M4.5 12h1" /></g>;
    case 'external':
    case 'cloud':
      return <g transform={t} className="dg-glyph"><path d="M4.5 13.5h7.5a3.5 3.5 0 0 0 .4-7 4.5 4.5 0 0 0-8.6 1.2A3 3 0 0 0 4.5 13.5z" /></g>;
    case 'file':
      return <g transform={t} className="dg-glyph"><path d="M3 1h7l3.5 3.5V15H3z M10 1v3.5h3.5" /></g>;
    case 'queue':
      return <g transform={t} className="dg-glyph"><path d="M2 3.5h12M2 8h12M2 12.5h12" /></g>;
    case 'code':
      return <g transform={t} className="dg-glyph"><path d="M5.5 3.5 1.5 8l4 4.5M10.5 3.5l4 4.5-4 4.5" /></g>;
    case 'service':
      return <g transform={t} className="dg-glyph"><rect x="1.5" y="1.5" width="13" height="13" rx="2" /><path d="M5 8h6M8 5v6" /></g>;
    default:
      return null;
  }
}

function EdgeLabel({ x, y, text, anchor = 'middle' }: { x: number; y: number; text: string; anchor?: 'middle' | 'start' }) {
  const w = text.length * SUB + 12;
  const x0 = anchor === 'middle' ? x - w / 2 : x - 4;
  return (
    <g>
      <rect className="dg-lbg" x={x0} y={y - 10} width={w} height={20} rx={10} />
      <text x={anchor === 'middle' ? x : x + 2} y={y + 0.5} className="dg-elabel" textAnchor={anchor} dominantBaseline="middle">
        {text}
      </text>
    </g>
  );
}

// ---------- flow ----------
interface Box {
  n: FlowNode;
  tone: Tone;
  lines: string[];
  sub: string[];
  w: number;
  h: number;
  x: number;
  y: number;
  rank: number;
}
const GLYPH = 26;

function layoutFlow(spec: FlowSpec, dir: 'LR' | 'TB') {
  const nodes = spec.nodes;
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const out = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  spec.edges.forEach((e) => out.get(e.from)!.push(e.to));
  // back edges via DFS in declaration order
  const color = new Map<string, number>();
  const back = new Set<string>();
  const dfs = (id: string) => {
    color.set(id, 1);
    for (const t of out.get(id)!) {
      if (color.get(t) === 1) back.add(id + '>' + t);
      else if (!color.get(t)) dfs(t);
    }
    color.set(id, 2);
  };
  nodes.forEach((n) => !color.get(n.id) && dfs(n.id));
  // longest-path ranks over forward edges (col sets a minimum rank)
  const rank = new Map<string, number>(nodes.map((n) => [n.id, Math.max(0, Math.floor(n.col ?? 0))]));
  const fwd = spec.edges.filter((e) => !back.has(e.from + '>' + e.to) && e.from !== e.to);
  for (let k = 0; k < nodes.length; k++) {
    let changed = false;
    for (const e of fwd) {
      if (rank.get(e.to)! < rank.get(e.from)! + 1) {
        rank.set(e.to, rank.get(e.from)! + 1);
        changed = true;
      }
    }
    if (!changed) break;
  }
  const maxRank = Math.max(0, ...rank.values());
  const ranks: string[][] = Array.from({ length: maxRank + 1 }, () => []);
  nodes.forEach((n) => ranks[rank.get(n.id)!].push(n.id));
  // one barycenter sweep to reduce crossings
  for (let r = 1; r <= maxRank; r++) {
    const prevPos = new Map(ranks[r - 1].map((id, i) => [id, i]));
    const bc = (id: string) => {
      const ps = fwd.filter((e) => e.to === id && prevPos.has(e.from)).map((e) => prevPos.get(e.from)!);
      return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : idx.get(id)! / nodes.length;
    };
    ranks[r] = [...ranks[r]].sort((a, b) => bc(a) - bc(b) || idx.get(a)! - idx.get(b)!);
  }
  const boxes = new Map<string, Box>();
  nodes.forEach((n, i) => {
    const lines = wrap(n.label, dir === 'TB' ? 22 : 18);
    const sub = n.sub ? wrap(n.sub, dir === 'TB' ? 30 : 24) : [];
    const glyph = n.kind && n.kind !== 'db' ? GLYPH : 0;
    const w = Math.max(dir === 'TB' ? 140 : 118, textW(lines, CH), textW(sub, SUB)) + 36;
    const h = 28 + glyph + (n.kind === 'db' ? 14 : 0) + lines.length * LINE + (sub.length ? sub.length * SUBLINE + 4 : 0);
    const tone = n.tone ?? (n.kind ? kindTone[n.kind] : TONES[(rank.get(n.id)! + i) % 6]);
    boxes.set(n.id, { n, tone, lines, sub, w, h, x: 0, y: 0, rank: rank.get(n.id)! });
  });
  // gaps leave room for edge labels
  const labelLen = (r: number) =>
    Math.max(0, ...spec.edges.filter((e) => e.label && rank.get(e.to) === r + 1 && rank.get(e.from) === r).map((e) => e.label!.length * SUB));
  const gapX = (r: number) => Math.min(200, Math.max(64, labelLen(r) + 40));
  const PAD = 14;
  const loops = spec.edges.some((e) => back.has(e.from + '>' + e.to) || (rank.get(e.from) === rank.get(e.to) && e.from !== e.to));
  if (dir === 'LR') {
    const colW = ranks.map((ids) => Math.max(...ids.map((id) => boxes.get(id)!.w)));
    const colH = ranks.map((ids) => ids.reduce((s, id) => s + boxes.get(id)!.h, 0) + (ids.length - 1) * 26);
    const H = Math.max(...colH);
    let x = PAD;
    ranks.forEach((ids, r) => {
      let y = PAD + (H - colH[r]) / 2;
      ids.forEach((id) => {
        const b = boxes.get(id)!;
        b.x = x + (colW[r] - b.w) / 2;
        b.y = y;
        y += b.h + 26;
      });
      x += colW[r] + gapX(r);
    });
    return { boxes, back, width: x - gapX(maxRank) + PAD, height: H + PAD * 2 + (loops ? 46 : 0) };
  }
  const rowW = ranks.map((ids) => ids.reduce((s, id) => s + boxes.get(id)!.w, 0) + (ids.length - 1) * 30);
  const rowH = ranks.map((ids) => Math.max(...ids.map((id) => boxes.get(id)!.h)));
  const W = Math.max(...rowW);
  let y = PAD;
  ranks.forEach((ids, r) => {
    let x = PAD + (W - rowW[r]) / 2;
    ids.forEach((id) => {
      const b = boxes.get(id)!;
      b.x = x;
      b.y = y + (rowH[r] - b.h) / 2;
      x += b.w + 30;
    });
    y += rowH[r] + (spec.edges.some((e) => e.label && rank.get(e.from) === r) ? 64 : 48);
  });
  return { boxes, back, width: W + PAD * 2 + (loops ? 70 : 0), height: y - 48 + PAD };
}

function NodeShape({ b }: { b: Box }) {
  const { n, x, y, w, h } = b;
  const glyph = n.kind && n.kind !== 'db' ? GLYPH : 0;
  const ly = y + 14 + glyph + (n.kind === 'db' ? 14 : 0) + LINE / 2;
  const sy = ly + (b.lines.length - 1) * LINE + LINE / 2 + SUBLINE / 2 + 3;
  return (
    <g className={'tone-' + b.tone + (n.highlight ? ' hl' : '')}>
      {n.kind === 'db' ? (
        <>
          <path className="dg-box" d={`M${x} ${y + 9} a${w / 2} 9 0 0 0 ${w} 0 v${h - 18} a${w / 2} 9 0 0 1 ${-w} 0 z`} />
          <ellipse className="dg-box" cx={x + w / 2} cy={y + 9} rx={w / 2} ry={9} />
        </>
      ) : (
        <rect className="dg-box" x={x} y={y} width={w} height={h} rx={n.kind === 'user' ? Math.min(24, h / 2) : 8} />
      )}
      {glyph > 0 && <Glyph kind={n.kind} x={x + w / 2} y={y + 12} />}
      {b.lines.map((l, i) => (
        <text key={i} x={x + w / 2} y={ly + i * LINE} className="dg-label" textAnchor="middle" dominantBaseline="middle">
          {l}
        </text>
      ))}
      {b.sub.map((l, i) => (
        <text key={'s' + i} x={x + w / 2} y={sy + i * SUBLINE} className="dg-sub" textAnchor="middle" dominantBaseline="middle">
          {l}
        </text>
      ))}
    </g>
  );
}

function Flow({ spec, avail, label }: { spec: FlowSpec; avail: number; label: string }) {
  const id = useId().replace(/:/g, '');
  let dir = spec.direction ?? 'LR';
  let L = layoutFlow(spec, dir);
  if (dir === 'LR' && L.width * 0.85 > avail) {
    dir = 'TB';
    L = layoutFlow(spec, 'TB');
  }
  const pairs = new Set(spec.edges.map((e) => e.from + '>' + e.to));
  const edges = spec.edges.map((e, i) => {
    const a = L.boxes.get(e.from)!;
    const b = L.boxes.get(e.to)!;
    const twin = pairs.has(e.to + '>' + e.from) && e.from !== e.to;
    const off = twin ? (e.from < e.to ? -8 : 8) : 0;
    let d: string;
    let mx: number;
    let my: number;
    const isBack = L.back.has(e.from + '>' + e.to) || a.rank === b.rank;
    if (dir === 'LR' && !isBack && b.rank > a.rank) {
      const sx = a.x + a.w, sy = a.y + a.h / 2 + off, ex = b.x, ey = b.y + b.h / 2 + off;
      const dx = Math.max(26, (ex - sx) / 2);
      d = `M${sx} ${sy} C${sx + dx} ${sy} ${ex - dx} ${ey} ${ex - 2} ${ey}`;
      mx = (sx + ex) / 2;
      my = (sy + ey) / 2 - (twin ? (off < 0 ? 12 : -12) : 12);
    } else if (dir === 'TB' && !isBack && b.rank > a.rank) {
      const sx = a.x + a.w / 2 + off, sy = a.y + a.h, ex = b.x + b.w / 2 + off, ey = b.y;
      const dy = Math.max(22, (ey - sy) / 2);
      d = `M${sx} ${sy} C${sx} ${sy + dy} ${ex} ${ey - dy} ${ex} ${ey - 2}`;
      mx = (sx + ex) / 2 + (twin ? off * 6 : 0);
      my = (sy + ey) / 2;
    } else if (dir === 'LR') {
      const sx = a.x + a.w / 2, sy = a.y + a.h, ex = b.x + b.w / 2, ey = b.y + b.h;
      const low = Math.max(sy, ey) + 34;
      d = `M${sx} ${sy} C${sx} ${low} ${ex} ${low} ${ex} ${ey + 2}`;
      mx = (sx + ex) / 2;
      my = low - 5;
    } else {
      const sx = a.x + a.w, sy = a.y + a.h / 2, ex = b.x + b.w, ey = b.y + b.h / 2;
      const right = Math.max(sx, ex) + 46;
      d = `M${sx} ${sy} C${right} ${sy} ${right} ${ey} ${ex + 2} ${ey}`;
      mx = right - 8;
      my = (sy + ey) / 2;
    }
    return { e, d, mx, my, tone: a.tone, hl: Boolean(a.n.highlight && b.n.highlight), key: i };
  });
  return (
    <Svg width={L.width} height={L.height} avail={avail} label={label}>
      <Heads id={id} />
      {edges.map(({ e, d, tone, hl, key }) => (
        <g key={key} className={'tone-' + tone + (hl ? ' hl' : '')}>
          <path d={d} className={'dg-edge' + (e.dashed ? ' dashed' : '')} markerEnd={`url(#${id}-${tone})`} />
        </g>
      ))}
      {[...L.boxes.values()].map((b) => (
        <NodeShape key={b.n.id} b={b} />
      ))}
      {edges.map(({ e, mx, my, tone, key }) =>
        e.label ? (
          <g key={'l' + key} className={'tone-' + tone}>
            <EdgeLabel x={mx} y={my} text={e.label} />
          </g>
        ) : null,
      )}
    </Svg>
  );
}

// ---------- sequence ----------
const ACTOR_TONES: Tone[] = ['blue', 'violet', 'green', 'pink', 'cyan', 'amber'];

function Sequence({ spec, avail, label }: { spec: SequenceSpec; avail: number; label: string }) {
  const id = useId().replace(/:/g, '');
  const n = spec.actors.length;
  const tone = (a: string) => ACTOR_TONES[Math.max(0, spec.actors.indexOf(a)) % ACTOR_TONES.length];
  const aw = spec.actors.map((a) => Math.max(110, a.length * CH + 34));
  const gaps = Array.from({ length: Math.max(0, n - 1) }, (_, i) => Math.max(140, (aw[i] + aw[i + 1]) / 2 + 28));
  spec.steps.forEach((s) => {
    if ('note' in s) return;
    const i = spec.actors.indexOf(s.from), j = spec.actors.indexOf(s.to);
    const [lo, hi] = i < j ? [i, j] : [j, i];
    if (lo === hi) return;
    const need = s.label.length * SUB + 40;
    const have = gaps.slice(lo, hi).reduce((a, b) => a + b, 0);
    if (have < need) for (let k = lo; k < hi; k++) gaps[k] += (need - have) / (hi - lo);
  });
  const xs: number[] = [];
  let x = 16 + aw[0] / 2;
  spec.actors.forEach((_, i) => {
    xs.push(x);
    x += gaps[i] ?? 0;
  });
  const lastSelf = spec.steps.some((s) => !('note' in s) && s.from === s.to && s.from === spec.actors[n - 1]);
  const width = xs[n - 1] + Math.max(aw[n - 1] / 2, lastSelf ? 160 : 0) + 16;
  const AH = 38;
  let y = 16 + AH + 22;
  const rows = spec.steps.map((s, k) => {
    if ('note' in s) {
      const overs = Array.isArray(s.over) ? s.over : [s.over];
      const over = overs.map((a) => xs[spec.actors.indexOf(a)]);
      const lines = wrap(s.note, 42);
      const lo = Math.min(...over), hi = Math.max(...over);
      const w = Math.max(hi - lo + 70, textW(lines, SUB) + 26);
      const r = { k, kind: 'note' as const, x: Math.max(4, (lo + hi) / 2 - w / 2), y: y + 4, w, h: lines.length * SUBLINE + 14, lines };
      y += r.h + 20;
      return r;
    }
    const a = xs[spec.actors.indexOf(s.from)], b = xs[spec.actors.indexOf(s.to)];
    const r = { k, kind: 'msg' as const, a, b, y: y + 24, s };
    y += a === b ? 60 : 46;
    return r;
  });
  const height = y + AH + 16;
  const fullWidth = Math.max(width, ...rows.map((r) => (r.kind === 'note' ? r.x + r.w + 6 : 0)));
  const actor = (yy: number) =>
    spec.actors.map((name, i) => (
      <g key={name + yy} className={'tone-' + tone(name) + ' hl'}>
        <rect className="dg-box" x={xs[i] - aw[i] / 2} y={yy} width={aw[i]} height={AH} rx={8} />
        <text x={xs[i]} y={yy + AH / 2 + 0.5} className="dg-label" textAnchor="middle" dominantBaseline="middle">
          {name}
        </text>
      </g>
    ));
  return (
    <Svg width={fullWidth} height={height} avail={avail} label={label}>
      <Heads id={id} />
      {spec.actors.map((a, i) => (
        <g key={a} className={'tone-' + tone(a)}>
          <line x1={xs[i]} x2={xs[i]} y1={16 + AH} y2={height - 16 - AH} className="dg-life" />
        </g>
      ))}
      {rows.map((r) =>
        r.kind === 'note' ? (
          <g key={r.k} className="tone-amber">
            <rect className="dg-note" x={r.x} y={r.y} width={r.w} height={r.h} rx={6} />
            {r.lines.map((l, i) => (
              <text key={i} x={r.x + r.w / 2} y={r.y + 7 + SUBLINE / 2 + i * SUBLINE} className="dg-sub strong" textAnchor="middle" dominantBaseline="middle">
                {l}
              </text>
            ))}
          </g>
        ) : r.a === r.b ? (
          <g key={r.k} className={'tone-' + tone(r.s.from)}>
            <path d={`M${r.a} ${r.y - 8} h40 v24 h-38`} className={'dg-edge' + (r.s.dashed ? ' dashed' : '')} markerEnd={`url(#${id}-${tone(r.s.from)})`} />
            <EdgeLabel x={r.a + 50} y={r.y + 4} text={r.s.label} anchor="start" />
          </g>
        ) : (
          <g key={r.k} className={'tone-' + tone(r.s.from)}>
            <line x1={r.a} x2={r.b + (r.b > r.a ? -3 : 3)} y1={r.y} y2={r.y} className={'dg-edge' + (r.s.dashed ? ' dashed' : '')} markerEnd={`url(#${id}-${tone(r.s.from)})`} />
            <text x={(r.a + r.b) / 2} y={r.y - 10} className="dg-elabel" textAnchor="middle">
              {r.s.label}
            </text>
          </g>
        ),
      )}
      {actor(16)}
      {actor(height - 16 - AH)}
    </Svg>
  );
}

// ---------- tree ----------
interface TBox {
  t: TreeNode;
  tone: Tone;
  lines: string[];
  sub: string[];
  w: number;
  h: number;
  x: number;
  y: number;
  span: number;
  kids: TBox[];
}
const BRANCH_TONES: Tone[] = ['blue', 'green', 'violet', 'amber', 'pink', 'cyan'];

function Tree({ spec, avail, label }: { spec: TreeSpec; avail: number; label: string }) {
  const GAP = 16, LV = 70;
  const build = (t: TreeNode, tone: Tone, depth: number, i: number): TBox => {
    const own = t.tone ?? (depth === 1 ? BRANCH_TONES[i % BRANCH_TONES.length] : tone);
    const lines = wrap(t.label, 18);
    const sub = t.sub ? wrap(t.sub, 22) : [];
    const w = Math.max(72, textW(lines, CH), textW(sub, SUB)) + 26;
    const kids = (t.children ?? []).map((c, k) => build(c, own, depth + 1, k));
    const kidsW = kids.reduce((s, k) => s + k.span, 0) + Math.max(0, kids.length - 1) * GAP;
    return { t, tone: own, lines, sub, w, h: lines.length * LINE + (sub.length ? sub.length * SUBLINE + 2 : 0) + 20, x: 0, y: 0, span: Math.max(w, kidsW), kids };
  };
  const root = build(spec.root, spec.root.tone ?? 'orange', 0, 0);
  const levelH: number[] = [];
  const measure = (b: TBox, d: number) => {
    levelH[d] = Math.max(levelH[d] ?? 0, b.h);
    b.kids.forEach((k) => measure(k, d + 1));
  };
  measure(root, 0);
  const place = (b: TBox, left: number, d: number) => {
    b.y = 12 + levelH.slice(0, d).reduce((s, h) => s + h + LV - 30, 0);
    const kidsW = b.kids.reduce((s, k) => s + k.span, 0) + Math.max(0, b.kids.length - 1) * GAP;
    let x = left + (b.span - kidsW) / 2;
    b.kids.forEach((k) => {
      place(k, x, d + 1);
      x += k.span + GAP;
    });
    b.x = left + b.span / 2 - b.w / 2;
  };
  place(root, 12, 0);
  const all: TBox[] = [];
  const links: Array<[TBox, TBox]> = [];
  const walk = (b: TBox) => {
    all.push(b);
    b.kids.forEach((k) => {
      links.push([b, k]);
      walk(k);
    });
  };
  walk(root);
  const width = root.span + 24;
  const height = Math.max(...all.map((b) => b.y + b.h)) + 12;
  return (
    <Svg width={width} height={height} avail={avail} label={label}>
      {links.map(([p, c], i) => {
        const sx = p.x + p.w / 2, sy = p.y + p.h, ex = c.x + c.w / 2, ey = c.y;
        const my = (sy + ey) / 2;
        return (
          <g key={i} className={'tone-' + c.tone}>
            <path d={`M${sx} ${sy} V${my} H${ex} V${ey}`} className="dg-edge" />
          </g>
        );
      })}
      {all.map((b, i) => (
        <g key={i} className={'tone-' + b.tone + (b.t.highlight || b === root ? ' hl' : '')}>
          <rect className="dg-box" x={b.x} y={b.y} width={b.w} height={b.h} rx={8} />
          {b.lines.map((l, k) => (
            <text key={k} x={b.x + b.w / 2} y={b.y + 10 + LINE / 2 + k * LINE} className="dg-label" textAnchor="middle" dominantBaseline="middle">
              {l}
            </text>
          ))}
          {b.sub.map((l, k) => (
            <text key={'s' + k} x={b.x + b.w / 2} y={b.y + 12 + b.lines.length * LINE + SUBLINE / 2 + k * SUBLINE} className="dg-sub" textAnchor="middle" dominantBaseline="middle">
              {l}
            </text>
          ))}
        </g>
      ))}
    </Svg>
  );
}

// ---------- layers, pyramid, steps ----------
const LAYER_TONES: Tone[] = ['blue', 'violet', 'green', 'amber', 'pink', 'cyan'];
const PYRAMID_TONES: Tone[] = ['pink', 'amber', 'green', 'blue', 'violet'];

function Layers({ spec, avail, label }: { spec: LayersSpec; avail: number; label: string }) {
  if (spec.pyramid) {
    const n = spec.layers.length;
    const W = 640, RH = 72;
    const top = 90;
    return (
      <Svg width={W} height={n * RH + 14} avail={avail} label={label}>
        {spec.layers.map((l, i) => {
          const w0 = top + ((W - 20 - top) * i) / n, w1 = top + ((W - 20 - top) * (i + 1)) / n;
          const y = 7 + i * RH;
          const cx = W / 2;
          return (
            <g key={i} className={'tone-' + (l.tone ?? PYRAMID_TONES[i % PYRAMID_TONES.length]) + (l.highlight ? ' hl' : '')}>
              <path className="dg-box" d={`M${cx - w0 / 2} ${y} H${cx + w0 / 2} L${cx + w1 / 2} ${y + RH - 5} H${cx - w1 / 2} z`} />
              <text x={cx} y={y + (l.sub ? 25 : 33)} className="dg-label big" textAnchor="middle" dominantBaseline="middle">
                {l.label}
              </text>
              {l.sub && (
                <text x={cx} y={y + 47} className="dg-sub" textAnchor="middle" dominantBaseline="middle">
                  {l.sub}
                </text>
              )}
            </g>
          );
        })}
      </Svg>
    );
  }
  return (
    <ol className="grid gap-2.5">
      {spec.layers.map((l, i) => (
        <li key={i} className={'vis-layer tone-' + (l.tone ?? LAYER_TONES[i % LAYER_TONES.length]) + (l.highlight ? ' hl' : '')}>
          <div>
            <div className="vis-layer-title">{l.label}</div>
            {l.sub && <div className="mt-1 font-mono text-[12.5px] leading-snug text-muted">{l.sub}</div>}
          </div>
          {l.items && l.items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {l.items.map((it) => (
                <span key={it} className="vis-chip">
                  {it}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

const STEP_TONES: Tone[] = ['blue', 'violet', 'pink', 'amber', 'green', 'cyan'];

function Steps({ spec }: { spec: StepsSpec }) {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))]">
      {spec.steps.map((s, i) => (
        <li key={i} className={'vis-step tone-' + (s.tone ?? STEP_TONES[i % STEP_TONES.length])}>
          <div className="vis-step-num">{i + 1}</div>
          <div className="mt-3 text-[16px] font-semibold leading-snug text-text">{s.label}</div>
          {s.sub && <div className="mt-1.5 text-[13.5px] leading-snug text-muted">{s.sub}</div>}
          {i < spec.steps.length - 1 && (
            <span aria-hidden className="vis-step-arrow">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function Diagram({ spec, kicker }: { spec: DiagramSpec; kicker: string }) {
  const [ref, avail] = useWidth<HTMLDivElement>();
  const label = [spec.title, spec.caption].filter(Boolean).join(' — ') || spec.type;
  let body: ReactNode;
  if (spec.type === 'flow') body = <Flow spec={spec} avail={avail} label={label} />;
  else if (spec.type === 'sequence') body = <Sequence spec={spec} avail={avail} label={label} />;
  else if (spec.type === 'tree') body = <Tree spec={spec} avail={avail} label={label} />;
  else if (spec.type === 'layers') body = <Layers spec={spec} avail={avail} label={label} />;
  else body = <Steps spec={spec} />;
  return (
    <figure className="vis-figure">
      <div className="vis-kicker">{kicker}</div>
      {spec.title && <div className="vis-title">{spec.title}</div>}
      <div ref={ref} className="mt-5">
        {body}
      </div>
      {spec.caption && <figcaption className="vis-caption">{spec.caption}</figcaption>}
    </figure>
  );
}
