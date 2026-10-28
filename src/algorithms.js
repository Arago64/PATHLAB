/** Pathfinding over weighted, undirected geometric graphs. */
import { euclidean, findEdge } from './graph.js';

export const ALGORITHMS = [
  { id: 'dijkstra', name: 'Dijkstra', kind: 'optimal', description: 'Expands the lowest-cost frontier first. Guaranteed minimum weighted distance with non-negative edges.', complexity: 'O((V + E) log V)' },
  { id: 'astar', name: 'A*', kind: 'optimal', description: 'Uses exact travel distance plus straight-line heuristic. Optimal because Euclidean distance never overestimates.', complexity: 'O((V + E) log V)' },
  { id: 'bfs', name: 'Breadth-first search', kind: 'baseline', description: 'Minimizes hops, not weighted distance. Useful as an unweighted baseline.', complexity: 'O(V + E)' },
  { id: 'greedy', name: 'Greedy best-first', kind: 'heuristic', description: 'Chooses the frontier node closest to B. Fast in some graphs; not shortest-path optimal.', complexity: 'O((V + E) log V)' },
  { id: 'vector', name: 'Vector Chase', kind: 'custom', description: 'Custom #1: at each node, looks only one edge ahead; picks the most goal-aligned neighbor that reduces remaining straight-line distance. Never backtracks.', complexity: 'O(E), no backtracking' },
  { id: 'course', name: 'Course Lock', kind: 'custom', description: 'Custom #2: follows the original A→B bearing, penalizes sideways deviation and prefers forward projected progress. Never backtracks.', complexity: 'O(E), no backtracking' }
];

class MinHeap {
  constructor() { this.data = []; }
  get size() { return this.data.length; }
  push(item) {
    const a = this.data; a.push(item);
    for (let i = a.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (a[p].priority <= a[i].priority) break;
      [a[i], a[p]] = [a[p], a[i]]; i = p;
    }
  }
  pop() {
    const a = this.data;
    if (a.length === 0) return undefined;
    const top = a[0], end = a.pop();
    if (a.length) {
      a[0] = end;
      let i = 0;
      while (true) {
        let left = i * 2 + 1, right = left + 1, min = i;
        if (left < a.length && a[left].priority < a[min].priority) min = left;
        if (right < a.length && a[right].priority < a[min].priority) min = right;
        if (min === i) break;
        [a[min], a[i]] = [a[i], a[min]]; i = min;
      }
    }
    return top;
  }
}

function output(graph, start, goal, prev, visited, checks, trace) {
  const path = [];
  let cursor = goal;
  const seen = new Set();
  while (cursor !== -1 && cursor !== undefined && !seen.has(cursor)) {
    seen.add(cursor); path.push(cursor);
    if (cursor === start) break;
    cursor = prev[cursor];
  }
  const found = path.at(-1) === start;
  if (!found) path.length = 0;
  else path.reverse();
  const pathEdges = [];
  let distance = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    pathEdges.push(findEdge(graph, a, b));
    distance += euclidean(graph.nodes[a], graph.nodes[b]);
  }
  return { found, path, pathEdges, distance: found ? distance : Infinity, hops: found ? path.length - 1 : 0, visited, checks, trace };
}

function emit(trace, event) { if (trace) trace.push(event); }

function prioritySearch(graph, start, goal, kind, trace) {
  const n = graph.nodes.length;
  const g = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const heap = new MinHeap();
  const h = id => euclidean(graph.nodes[id], graph.nodes[goal]);
  g[start] = 0;
  heap.push({ id: start, priority: kind === 'greedy' ? h(start) : kind === 'astar' ? h(start) : 0 });
  let visited = 0, checks = 0;
  while (heap.size) {
    const { id: u } = heap.pop();
    if (closed[u]) continue;
    closed[u] = 1; visited++;
    emit(trace, { type: 'visit', node: u });
    if (u === goal) break;
    for (const edge of graph.adj[u]) {
      checks++;
      const v = edge.to;
      emit(trace, { type: 'check', edge: edge.edgeId, node: v });
      if (closed[v]) continue;
      const candidate = g[u] + edge.w;
      const improve = kind === 'greedy' ? prev[v] === -1 && v !== start : candidate < g[v] - 1e-10;
      if (improve) {
        g[v] = candidate;
        prev[v] = u;
        const priority = kind === 'greedy' ? h(v) : candidate + (kind === 'astar' ? h(v) : 0);
        heap.push({ id: v, priority });
        emit(trace, { type: 'discover', edge: edge.edgeId, node: v });
      }
    }
  }
  return output(graph, start, goal, prev, visited, checks, trace);
}

function bfs(graph, start, goal, trace) {
  const n = graph.nodes.length;
  const prev = new Int32Array(n).fill(-1);
  const seen = new Uint8Array(n);
  const queue = [start]; let head = 0, visited = 0, checks = 0;
  seen[start] = 1;
  while (head < queue.length) {
    const u = queue[head++]; visited++;
    emit(trace, { type: 'visit', node: u });
    if (u === goal) break;
    for (const edge of graph.adj[u]) {
      checks++;
      const v = edge.to;
      emit(trace, { type: 'check', edge: edge.edgeId, node: v });
      if (seen[v]) continue;
      seen[v] = 1; prev[v] = u; queue.push(v);
      emit(trace, { type: 'discover', edge: edge.edgeId, node: v });
    }
  }
  return output(graph, start, goal, prev, visited, checks, trace);
}

function directional(graph, start, goal, kind, trace) {
  const n = graph.nodes.length;
  const prev = new Int32Array(n).fill(-1);
  const seen = new Uint8Array(n);
  const a = graph.nodes[start], b = graph.nodes[goal];
  const dx = b.x - a.x, dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length, uy = dy / length;
  let u = start, visited = 0, checks = 0;
  seen[start] = 1;
  for (let iteration = 0; iteration < n && u !== goal; iteration++) {
    visited++;
    emit(trace, { type: 'visit', node: u });
    const pos = graph.nodes[u];
    const distanceToGoal = euclidean(pos, b);
    const progress = (pos.x - a.x) * ux + (pos.y - a.y) * uy;
    let best = null, bestScore = Infinity;
    for (const edge of graph.adj[u]) {
      checks++;
      const v = edge.to, next = graph.nodes[v];
      emit(trace, { type: 'check', edge: edge.edgeId, node: v });
      if (seen[v]) continue;
      let score;
      if (kind === 'vector') {
        const remaining = euclidean(next, b);
        if (remaining >= distanceToGoal - 1e-8) continue;
        const stepX = next.x - pos.x, stepY = next.y - pos.y;
        const cosine = (stepX * (b.x - pos.x) + stepY * (b.y - pos.y)) / (edge.w * distanceToGoal);
        score = (1 - cosine) * 500 + remaining * 0.08;
      } else {
        const nextProgress = (next.x - a.x) * ux + (next.y - a.y) * uy;
        if (nextProgress <= progress + 1e-8 || nextProgress > length + 1e-8) continue;
        const deviation = Math.abs((next.x - a.x) * uy - (next.y - a.y) * ux);
        score = deviation * 2.4 + (length - nextProgress) * 0.24 + edge.w * 0.12;
      }
      if (score < bestScore) { bestScore = score; best = edge; }
    }
    if (!best) break;
    prev[best.to] = u;
    seen[best.to] = 1;
    emit(trace, { type: 'discover', edge: best.edgeId, node: best.to });
    u = best.to;
  }
  if (u === goal) { visited++; emit(trace, { type: 'visit', node: goal }); }
  return output(graph, start, goal, prev, visited, checks, trace);
}

export function solve(graph, start, goal, algorithm, { record = false } = {}) {
  if (!Number.isInteger(start) || !Number.isInteger(goal) || start < 0 || goal < 0 || start >= graph.nodes.length || goal >= graph.nodes.length) throw new RangeError('Invalid start/goal');
  const trace = record ? [] : null;
  if (start === goal) return { found: true, path: [start], pathEdges: [], distance: 0, hops: 0, visited: 1, checks: 0, trace: trace ?? null };
  switch (algorithm) {
    case 'dijkstra': case 'astar': case 'greedy': return prioritySearch(graph, start, goal, algorithm, trace);
    case 'bfs': return bfs(graph, start, goal, trace);
    case 'vector': case 'course': return directional(graph, start, goal, algorithm, trace);
    default: throw new Error('Unknown algorithm: ' + algorithm);
  }
}

/** Median wall clock time across repeated no-trace runs; not a cross-device benchmark. */
export function benchmark(graph, start, goal, repeat = 25) {
  const output = {};
  for (const { id } of ALGORITHMS) {
    solve(graph, start, goal, id); // JIT warm-up
    const times = [];
    let result;
    for (let i = 0; i < repeat; i++) {
      const t0 = performance.now();
      result = solve(graph, start, goal, id);
      times.push(performance.now() - t0);
    }
    times.sort((a, b) => a - b);
    output[id] = { ...result, ms: times[Math.floor(times.length / 2)] };
  }
  return output;
}
