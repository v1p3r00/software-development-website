/**
 * Visual blocks inside lesson Markdown. A lesson body is plain Markdown plus fenced blocks:
 *
 *   ~~~diagram            JSON spec (flow | sequence | layers | tree | steps), see Diagram.tsx
 *   ~~~callout tip Title  Markdown; variants: tip | warn | ide | note | info
 *   ~~~compare            JSON { left: {title, lang?, code, note?}, right: {...} }
 *   ~~~terms              JSON [{ term, def }]
 *   ~~~widget name        optional JSON props; an interactive explainer from widgets/index.ts
 *
 * No Vite/React imports here: scripts/seo.ts uses toPlainMarkdown() for the static pages.
 */

export type CalloutVariant = 'tip' | 'warn' | 'ide' | 'note' | 'info';
export type Tone = 'blue' | 'violet' | 'green' | 'amber' | 'pink' | 'cyan' | 'orange' | 'red' | 'indigo' | 'teal';

export type Segment =
  | { type: 'md'; text: string }
  | { type: 'diagram'; spec: DiagramSpec }
  | { type: 'callout'; variant: CalloutVariant; title: string; md: string }
  | { type: 'compare'; spec: CompareSpec }
  | { type: 'terms'; items: { term: string; def: string }[] }
  | { type: 'widget'; name: string; props: Record<string, unknown> }
  | { type: 'error'; kind: string; message: string; raw: string };

export interface FlowNode {
  id: string;
  label: string;
  sub?: string;
  kind?: 'user' | 'client' | 'server' | 'db' | 'service' | 'external' | 'file' | 'queue' | 'cloud' | 'code';
  highlight?: boolean;
  tone?: Tone;
  /** optional minimum column (rank), to line a node up with others */
  col?: number;
}
export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}
export interface FlowSpec {
  type: 'flow';
  direction?: 'LR' | 'TB';
  title?: string;
  caption?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
export interface SequenceSpec {
  type: 'sequence';
  title?: string;
  caption?: string;
  actors: string[];
  steps: Array<{ from: string; to: string; label: string; dashed?: boolean } | { note: string; over: string | string[] }>;
}
export interface LayersSpec {
  type: 'layers';
  title?: string;
  caption?: string;
  pyramid?: boolean;
  layers: Array<{ label: string; sub?: string; items?: string[]; highlight?: boolean; tone?: Tone }>;
}
export interface TreeNode {
  label: string;
  sub?: string;
  highlight?: boolean;
  tone?: Tone;
  children?: TreeNode[];
}
export interface TreeSpec {
  type: 'tree';
  title?: string;
  caption?: string;
  root: TreeNode;
}
export interface StepsSpec {
  type: 'steps';
  title?: string;
  caption?: string;
  steps: Array<{ label: string; sub?: string; tone?: Tone }>;
}
export type DiagramSpec = FlowSpec | SequenceSpec | LayersSpec | TreeSpec | StepsSpec;

export interface CompareSide {
  title: string;
  lang?: string;
  code: string;
  note?: string;
}
export interface CompareSpec {
  left: CompareSide;
  right: CompareSide;
}

const OPEN = /^~~~(diagram|callout|compare|terms|widget)\b(.*)$/;
const CALLOUTS: CalloutVariant[] = ['tip', 'warn', 'ide', 'note', 'info'];

function validDiagram(s: unknown): string | null {
  const d = s as Record<string, unknown>;
  if (!d || typeof d !== 'object') return 'not an object';
  const arr = (k: string) => Array.isArray(d[k]);
  switch (d.type) {
    case 'flow': {
      if (!arr('nodes') || !arr('edges')) return 'flow needs nodes[] and edges[]';
      const ids = new Set((d.nodes as FlowNode[]).map((n) => n?.id));
      if ((d.nodes as FlowNode[]).some((n) => typeof n?.id !== 'string' || typeof n?.label !== 'string')) return 'flow node needs id and label';
      const bad = (d.edges as FlowEdge[]).find((e) => !ids.has(e?.from) || !ids.has(e?.to));
      return bad ? `edge ${bad?.from}→${bad?.to} references an unknown node` : null;
    }
    case 'sequence': {
      if (!arr('actors') || !arr('steps')) return 'sequence needs actors[] and steps[]';
      const actors = new Set(d.actors as string[]);
      for (const st of d.steps as Array<Record<string, unknown>>) {
        if ('note' in st) {
          const over = Array.isArray(st.over) ? st.over : [st.over];
          if (over.some((o) => !actors.has(o as string))) return `note over unknown actor ${String(st.over)}`;
        } else if (!actors.has(st.from as string) || !actors.has(st.to as string) || typeof st.label !== 'string') return 'sequence step needs known from/to and a label';
      }
      return null;
    }
    case 'layers':
      return arr('layers') && (d.layers as unknown[]).length ? null : 'layers needs layers[]';
    case 'tree':
      return d.root && typeof (d.root as TreeNode).label === 'string' ? null : 'tree needs root.label';
    case 'steps':
      return arr('steps') && (d.steps as unknown[]).length ? null : 'steps needs steps[]';
    default:
      return `unknown diagram type ${String(d.type)}`;
  }
}

function parseBlock(kind: string, info: string, raw: string): Segment {
  const err = (message: string): Segment => ({ type: 'error', kind, message, raw });
  try {
    if (kind === 'callout') {
      const [v = 'note', ...rest] = info.trim().split(/\s+/);
      const variant = (CALLOUTS as string[]).includes(v) ? (v as CalloutVariant) : 'note';
      const title = (CALLOUTS as string[]).includes(v) ? rest.join(' ') : info.trim();
      return { type: 'callout', variant, title, md: raw };
    }
    if (kind === 'widget') {
      const name = info.trim().split(/\s+/)[0] ?? '';
      if (!name) return err('widget needs a name');
      const props = raw.trim() ? JSON.parse(raw) : {};
      return { type: 'widget', name, props };
    }
    const data = JSON.parse(raw);
    if (kind === 'diagram') {
      const problem = validDiagram(data);
      return problem ? err(problem) : { type: 'diagram', spec: data };
    }
    if (kind === 'compare') {
      if (!data?.left?.code || !data?.right?.code) return err('compare needs left.code and right.code');
      return { type: 'compare', spec: data };
    }
    if (!Array.isArray(data) || data.some((x) => typeof x?.term !== 'string' || typeof x?.def !== 'string')) return err('terms needs [{term, def}]');
    return { type: 'terms', items: data };
  } catch (e) {
    return err((e as Error).message);
  }
}

/** split a lesson body into Markdown and visual blocks */
export function parseBody(body: string): Segment[] {
  const lines = body.split('\n');
  const out: Segment[] = [];
  let md: string[] = [];
  const flush = () => {
    if (md.join('').trim()) out.push({ type: 'md', text: md.join('\n') });
    md = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const m = OPEN.exec(lines[i].trimEnd());
    if (!m) {
      md.push(lines[i]);
      continue;
    }
    // collect until the matching closing fence; nested ~~~lang fences (code inside a callout) are allowed
    let depth = 0;
    const raw: string[] = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      const l = lines[j].trimEnd();
      if (/^~~~\s*$/.test(l)) {
        if (depth === 0) break;
        depth--;
      } else if (/^~~~\S/.test(l)) depth++;
      raw.push(lines[j]);
    }
    flush();
    out.push(parseBlock(m[1], m[2] ?? '', raw.join('\n')));
    i = j;
  }
  flush();
  return out;
}

function diagramText(d: DiagramSpec): string {
  const head = [d.title, d.caption].filter(Boolean).join(' — ');
  let items: string[] = [];
  if (d.type === 'flow') items = d.edges.map((e) => `${d.nodes.find((n) => n.id === e.from)?.label} → ${d.nodes.find((n) => n.id === e.to)?.label}${e.label ? ` (${e.label})` : ''}`);
  if (d.type === 'sequence') items = d.steps.map((s) => ('note' in s ? s.note : `${s.from} → ${s.to}: ${s.label}`));
  if (d.type === 'layers') items = d.layers.map((l) => [l.label, l.sub].filter(Boolean).join(': '));
  if (d.type === 'steps') items = d.steps.map((s, i) => `${i + 1}. ${[s.label, s.sub].filter(Boolean).join(': ')}`);
  if (d.type === 'tree') {
    const walk = (n: TreeNode, depth: number): string[] => [`${'  '.repeat(depth)}${n.label}`, ...(n.children ?? []).flatMap((c) => walk(c, depth + 1))];
    items = walk(d.root, 0);
  }
  return `${head ? `*${head}*\n\n` : ''}${items.map((x) => (d.type === 'steps' ? x : `- ${x}`)).join('\n')}`;
}

/** the body as plain Markdown (for static SEO pages and search) */
export function toPlainMarkdown(body: string): string {
  return parseBody(body)
    .map((s) => {
      switch (s.type) {
        case 'md':
          return s.text;
        case 'diagram':
          return diagramText(s.spec);
        case 'callout':
          return `> ${s.title ? `**${s.title}** ` : ''}${s.md.replace(/\n/g, '\n> ')}`;
        case 'compare':
          return [s.spec.left, s.spec.right].map((x) => `**${x.title}**\n\n~~~${x.lang ?? ''}\n${x.code}\n~~~${x.note ? `\n\n${x.note}` : ''}`).join('\n\n');
        case 'terms':
          return s.items.map((x) => `- **${x.term}**: ${x.def}`).join('\n');
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}
