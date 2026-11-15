/* SOKKAR — flowchart geometry + execution helpers.
   The layout is computed from the same node/edge data that the
   execution engine walks, so diagram and algorithm can never diverge. */

import type { FlowEdge, FlowNode, FlowNodeType } from './types';

/* ---------- number formatting ---------- */

export function fmt(n: number, sig = 6): string {
  if (!Number.isFinite(n)) return 'undefined';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-6) return n.toExponential(4);
  let s = Number(n.toPrecision(sig)).toString();
  return s;
}
export function money(n: number, symbol = '$'): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}${symbol}${Math.abs(n).toFixed(2)}`;
}
export function num(v: string): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v).trim());
  return n;
}
export function isNum(v: string): boolean {
  return v.trim() !== '' && Number.isFinite(parseFloat(v));
}

/* ---------- label wrapping ---------- */

export function wrapLabel(label: string, maxChars = 26): string[] {
  const words = label.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= maxChars) cur = (cur + ' ' + w).trim();
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

/* ---------- node sizes ---------- */

export const NODE_SIZE: Record<FlowNodeType, { w: number; h: number }> = {
  start: { w: 132, h: 42 },
  end: { w: 132, h: 42 },
  input: { w: 216, h: 52 },
  output: { w: 216, h: 52 },
  process: { w: 236, h: 62 },
  decision: { w: 216, h: 92 },
};

export interface LayoutNode extends FlowNode { x: number; y: number; w: number; h: number; }
export interface LayoutEdge extends FlowEdge { back: boolean; }
export interface FlowLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

/** Detect back edges with a DFS (edge to a node currently on the stack). */
function findBackEdges(nodes: FlowNode[], edges: FlowEdge[]): Set<string> {
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) adj.get(e.from)?.push(e.to);
  const state = new Map<string, 0 | 1 | 2>(); // 0 white, 1 gray, 2 black
  const back = new Set<string>();
  const dfs = (u: string) => {
    state.set(u, 1);
    for (const v of adj.get(u) ?? []) {
      const s = state.get(v) ?? 0;
      if (s === 1) back.add(`${u}->${v}`);
      else if (s === 0) dfs(v);
    }
    state.set(u, 2);
  };
  const start = nodes[0];
  if (start) dfs(start.id);
  for (const n of nodes) if ((state.get(n.id) ?? 0) === 0) dfs(n.id);
  return back;
}

/** Layered top-down layout. Longest-path layering on the DAG that remains
 *  after removing back edges, so loops stay compact. */
export function layoutFlow(nodes: FlowNode[], edges: FlowEdge[]): FlowLayout {
  const backSet = findBackEdges(nodes, edges);
  const forward = edges.filter(e => !backSet.has(`${e.from}->${e.to}`));

  // Kahn's algorithm on the DAG
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const n of nodes) { indeg.set(n.id, 0); adj.set(n.id, []); }
  for (const e of forward) {
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
    adj.get(e.from)?.push(e.to);
  }
  const depth = new Map<string, number>();
  const queue: string[] = [];
  for (const n of nodes) if ((indeg.get(n.id) ?? 0) === 0) { depth.set(n.id, 0); queue.push(n.id); }
  while (queue.length) {
    const u = queue.shift()!;
    const du = depth.get(u) ?? 0;
    for (const v of adj.get(u) ?? []) {
      depth.set(v, Math.max(depth.get(v) ?? 0, du + 1));
      indeg.set(v, (indeg.get(v) ?? 1) - 1);
      if ((indeg.get(v) ?? 0) === 0) queue.push(v);
    }
  }
  for (const n of nodes) if (!depth.has(n.id)) depth.set(n.id, 0);

  // DFS preorder for in-layer ordering
  const order = new Map<string, number>();
  let counter = 0;
  const seen = new Set<string>();
  const adjAll = new Map<string, string[]>();
  for (const n of nodes) adjAll.set(n.id, []);
  for (const e of edges) adjAll.get(e.from)?.push(e.to);
  const dfs2 = (u: string) => {
    if (seen.has(u)) return;
    seen.add(u);
    order.set(u, counter++);
    for (const v of adjAll.get(u) ?? []) dfs2(v);
  };
  if (nodes[0]) dfs2(nodes[0].id);
  for (const n of nodes) if (!order.has(n.id)) order.set(n.id, counter++);

  const layers = new Map<number, FlowNode[]>();
  for (const n of nodes) {
    const d = depth.get(n.id)!;
    if (!layers.has(d)) layers.set(d, []);
    layers.get(d)!.push(n);
  }
  const X = 252, Y = 128;
  const layoutNodes: LayoutNode[] = [];
  let maxDepth = 0;
  for (const [d, group] of layers) {
    maxDepth = Math.max(maxDepth, d);
    group.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    group.forEach((n, i) => {
      const { w, h } = NODE_SIZE[n.type];
      layoutNodes.push({ ...n, x: (i - (group.length - 1) / 2) * X, y: d * Y, w, h });
    });
  }
  let minX = Infinity, maxX = -Infinity;
  for (const n of layoutNodes) { minX = Math.min(minX, n.x - n.w / 2); maxX = Math.max(maxX, n.x + n.w / 2); }
  const padX = 130; // room for back-edge loops on the right
  const width = Math.max(maxX - minX + padX * 2, 460);
  const height = (maxDepth + 1) * Y + 120;
  const shift = -minX + padX;
  for (const n of layoutNodes) n.x += shift;
  // shift the loop gutter to the right edge
  return { nodes: layoutNodes, edges: edges.map(e => ({ ...e, back: backSet.has(`${e.from}->${e.to}`) })), width, height };
}

/** Edge endpoint: intersect a ray from `from` center toward `to` center with the target shape boundary. */
export function edgePath(a: LayoutNode, b: LayoutNode, back: boolean): { d: string; arrow: { x: number; y: number; angle: number }; mid: { x: number; y: number } } {
  if (back) {
    const right = Math.max(a.x + a.w / 2, b.x + b.w / 2) + 96;
    const y1 = a.y, y2 = b.y;
    const d = `M ${a.x + a.w / 2} ${y1} C ${right} ${y1}, ${right} ${y2}, ${b.x + b.w / 2} ${y2}`;
    return { d, arrow: { x: b.x + b.w / 2, y: y2, angle: 180 }, mid: { x: right - 24, y: (y1 + y2) / 2 } };
  }
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  // Decide anchor sides by dominant axis
  const dx = b.x - a.x, dy = b.y - a.y;
  let start = { x: a.x, y: a.y + a.h / 2 };
  let end = { x: b.x, y: b.y - b.h / 2 };
  if (Math.abs(dx) > Math.abs(dy) * 1.6) {
    start = { x: a.x + Math.sign(dx) * a.w / 2, y: a.y };
    end = { x: b.x - Math.sign(dx) * b.w / 2, y: b.y };
  }
  // Trim the end to the shape boundary properly (approximate with half-height/width along direction)
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
  const d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  return { d, arrow: { x: end.x, y: end.y, angle }, mid: { x: cx, y: cy } };
}

/* ---------- trace helpers ---------- */

export function failureSteps(validateNodeId: string, errNodeId: string, error: string, vars?: Record<string, string | number>) {
  return [
    { nodeId: validateNodeId, text: `Validation failed: ${error}`, tone: 'decision' as const, decision: { question: 'Inputs valid?', result: 'No' }, vars },
    { nodeId: errNodeId, text: error, tone: 'err' as const, vars },
  ];
}
