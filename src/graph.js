/** Deterministic connected geometric graph generator. No dependencies. */
export const WIDTH = 1000;
export const HEIGHT = 620;

export function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function euclidean(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function generateGraph({ count = 105, neighbors = 5, seed = 42 } = {}) {
  if (!Number.isInteger(count) || count < 2 || count > 500) throw new RangeError('count must be 2…500');
  if (!Number.isInteger(neighbors) || neighbors < 1 || neighbors > count - 1) throw new RangeError('Invalid neighbor count');
  const random = mulberry32(seed);
  const nodes = [];
  const minSep = Math.max(14, Math.sqrt((WIDTH * HEIGHT) / count) * 0.36);
  const margin = 31;
  for (let id = 0; id < count; id++) {
    let node;
    for (let tries = 0; tries < 90; tries++) {
      node = { id, x: margin + random() * (WIDTH - 2 * margin), y: margin + random() * (HEIGHT - 2 * margin) };
      if (nodes.every(other => euclidean(node, other) >= minSep)) break;
    }
    nodes.push(node);
  }
  const candidates = [];
  const byNode = Array.from({ length: count }, () => []);
  for (let u = 0; u < count; u++) for (let v = u + 1; v < count; v++) {
    const w = euclidean(nodes[u], nodes[v]);
    const pair = { u, v, w };
    candidates.push(pair);
    byNode[u].push(pair);
    byNode[v].push(pair);
  }
  const chosen = new Map();
  const add = ({ u, v, w }) => chosen.set(`${u}:${v}`, { u, v, w });
  for (const pairs of byNode) {
    pairs.sort((a, b) => a.w - b.w);
    for (const pair of pairs.slice(0, neighbors)) add(pair);
  }
  // Minimum spanning tree guarantees reachability even for sparse networks.
  const parent = Array.from({ length: count }, (_, i) => i);
  const root = n => {
    while (parent[n] !== n) { parent[n] = parent[parent[n]]; n = parent[n]; }
    return n;
  };
  candidates.sort((a, b) => a.w - b.w);
  for (const pair of candidates) {
    const ru = root(pair.u), rv = root(pair.v);
    if (ru !== rv) { parent[ru] = rv; add(pair); }
  }
  const edges = [...chosen.values()].map((e, id) => ({ ...e, id }));
  const adj = Array.from({ length: count }, () => []);
  for (const { u, v, w, id } of edges) {
    adj[u].push({ to: v, w, edgeId: id });
    adj[v].push({ to: u, w, edgeId: id });
  }
  for (const list of adj) list.sort((a, b) => a.w - b.w);
  let start = 0, goal = count - 1, maxDist = -1;
  for (const pair of candidates) {
    if (pair.w > maxDist) { maxDist = pair.w; start = pair.u; goal = pair.v; }
  }
  return { nodes, edges, adj, start, goal, seed, neighbors };
}

export function findEdge(graph, a, b) {
  return graph.adj[a].find(entry => entry.to === b)?.edgeId ?? -1;
}
