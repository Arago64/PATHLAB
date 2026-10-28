# PATHLAB — Interactive Pathfinding Visualizer & Benchmark

Explore **shortest-path algorithms on randomly distributed points** in a connected, Euclidean-weighted graph. Choose nodes A and B, play the search step by step, and compare quality and computational work on the **same network**.

### Algorithms

| Method | Type | Guaranteed shortest weighted path? |
|---|---|---|
| Dijkstra | Standard | Yes |
| A* (straight-line heuristic) | Standard | Yes |
| Breadth-first search | Standard | No — minimizes hops |
| Greedy best-first | Standard | No |
| Vector Chase | Custom #1 | No; can reach a dead end |
| Course Lock | Custom #2 | No; can reach a dead end |

**Vector Chase** inspects only immediate neighbors and chooses the direction best aligned with the current vector to the destination, requiring a decrease in Euclidean distance every step. No backtracking.

**Course Lock** projects the line A → B once, then chooses a forward-moving neighbor with a strong penalty for lateral deviation from this fixed line. No backtracking.

Both custom algorithms are educational heuristics **not** claimed to outperform established optimal solvers. A failure when a route exists is a meaningful result.

### Features

- Seeded procedural graph generation, configurable number of nodes and connectivity.
- Guaranteed graph connectivity via a minimum spanning tree.
- Click nodes to select origin and destination or generate a random pair.
- Canvas 2D animation: explored nodes, candidate edges and final route.
- Pause, resume, one-step, and adjustable animation speed; keyboard: `Space` to pause/resume, `→` to step.
- Benchmark for all six methods: route distance, relative difference from Dijkstra, visited nodes, edge examinations, median algorithm runtime.
- UI languages: English, Russian, German.
- No runtime framework dependencies, no cookies, no telemetry, no data uploads.

### Run locally

**Fastest:** double-click `PATHLAB_Standalone.html` — it contains the CSS and JavaScript inline and works offline.

**For the modular source version:** requires Node.js 22 or later (Node.js 24 LTS recommended) (for its static HTTP server):

```bash
npm start
# Open http://localhost:8080
```

Or use any static HTTP server (e.g. VS Code Live Server). Because the app uses native JavaScript ES modules, opening `index.html` as `file://` **may not work** in some browsers. For GitHub Pages, simply publish the repository root.

```bash
npm test
```

Tests use Node's built-in test runner; no `npm install` required. To rebuild the standalone HTML after modifying source files, run `python build_standalone.py`.

### Benchmark interpretation

Distances are Euclidean **coordinate units**, not kilometers. Edge weights are straight-line distances between each connected pair of nodes. The comparison uses the same graph and A/B points. Dijkstra and A* should agree to floating-point precision; BFS minimizes hops rather than distance. Benchmark timing is the median of 25 repeat runs **without** generating animation traces and is affected by hardware, JIT compilation and background browser activity. It is not a universal speed rating.

### Architecture

```text
index.html            interface
styles.css            responsive styling
src/graph.js          seeded graph generator, connected network (MST + nearest neighbors)
src/algorithms.js     standard methods, two own heuristics, benchmark driver
src/app.js            localization, controls, animation, drawing
server.js             tiny optional local server
tests/                correctness, determinism, edge-case and heuristic tests
```

### Portfolio angle

This repository demonstrates JavaScript ES modules, data structures (binary min-heap), graph algorithms, Canvas 2D, frame-based animation, benchmark design, internationalization, event handling, and automated correctness tests. The custom heuristics are designed to be explainable and falsifiable rather than presented as superior to Dijkstra/A*.

MIT License.
