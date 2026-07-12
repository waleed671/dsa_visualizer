import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, Plus, Trash2, Play } from "lucide-react";

type Vertex = { id: string; label: string; x: number; y: number };
type Edge = { id: string; from: string; to: string; weight?: number };
type GraphMode = "undirected" | "directed";
type AlgoMode = "none" | "bfs" | "dfs";

let _vctr = 0;
let _ectr = 0;
const mkV = () => `v${++_vctr}`;
const mkE = () => `e${++_ectr}`;

const VERTEX_R = 22;
const COLOR = "var(--purple)";

export function GraphVisualizer() {
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mode, setMode] = useState<GraphMode>("undirected");
  const [algoMode, setAlgoMode] = useState<AlgoMode>("none");
  const [selectedVerts, setSelectedVerts] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [visitedEdges, setVisitedEdges] = useState<Set<string>>(new Set());
  const [log, setLog] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragOffset = useRef({ dx: 0, dy: 0 });

  // ── Add vertex ─────────────────────────────────────────────────────────────
  const addVertex = useCallback(() => {
    const label = labelInput.trim() || String(vertices.length + 1);
    const id = mkV();
    const cx = 60 + Math.random() * 480;
    const cy = 60 + Math.random() * 280;
    setVertices(vs => [...vs, { id, label, x: cx, y: cy }]);
    setLabelInput("");
    setLog(`✦ Added vertex "${label}"`);
  }, [labelInput, vertices.length]);

  // ── Remove vertex ─────────────────────────────────────────────────────────
  const removeVertex = () => {
    if (!selectedVerts.length) { setLog("✗ Select a vertex first"); return; }
    const id = selectedVerts[0];
    setVertices(vs => vs.filter(v => v.id !== id));
    setEdges(es => es.filter(e => e.from !== id && e.to !== id));
    setSelectedVerts([]);
    setLog(`✦ Removed vertex`);
  };

  // ── Add edge ──────────────────────────────────────────────────────────────
  const addEdge = () => {
    if (selectedVerts.length < 2) { setLog("✗ Select 2 vertices to add an edge"); return; }
    const [from, to] = selectedVerts;
    if (from === to) { setLog("✗ Cannot create self-loop"); return; }
    const exists = edges.some(e =>
      (e.from === from && e.to === to) ||
      (mode === "undirected" && e.from === to && e.to === from),
    );
    if (exists) { setLog("✗ Edge already exists"); return; }
    const w = parseInt(weightInput) || undefined;
    setEdges(es => [...es, { id: mkE(), from, to, weight: w }]);
    setSelectedVerts([]);
    setLog(`✦ Added edge ${vertices.find(v => v.id === from)?.label} → ${vertices.find(v => v.id === to)?.label}${w ? ` (w=${w})` : ""}`);
    setWeightInput("");
  };

  // ── Remove edge ───────────────────────────────────────────────────────────
  const removeEdge = () => {
    if (selectedVerts.length < 2) { setLog("✗ Select 2 vertices to remove edge"); return; }
    const [from, to] = selectedVerts;
    setEdges(es => es.filter(e =>
      !((e.from === from && e.to === to) ||
        (mode === "undirected" && e.from === to && e.to === from)),
    ));
    setSelectedVerts([]);
    setLog(`✦ Removed edge`);
  };

  // ── Vertex click (select for edge operations) ─────────────────────────────
  const onVertexClick = (id: string) => {
    setSelectedVerts(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const v = vertices.find(v => v.id === id)!;
    dragOffset.current = { dx: v.x - (e.clientX - rect.left), dy: v.y - (e.clientY - rect.top) };
    setDragging(id);
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left + dragOffset.current.dx;
    const y = e.clientY - rect.top + dragOffset.current.dy;
    setVertices(vs => vs.map(v => v.id === dragging ? { ...v, x: Math.max(VERTEX_R, Math.min(590, x)), y: Math.max(VERTEX_R, Math.min(370, y)) } : v));
  }, [dragging]);

  const onMouseUp = () => setDragging(null);

  // ── BFS/DFS ───────────────────────────────────────────────────────────────
  const runAlgo = async (type: "bfs" | "dfs") => {
    if (!vertices.length || animating) return;
    setAnimating(true);
    setHighlighted(new Set());
    setVisitedEdges(new Set());
    const start = selectedVerts[0] ?? vertices[0].id;
    const visited = new Set<string>();
    const visitedE = new Set<string>();
    const order: string[] = [];

    const getNeighbors = (id: string) =>
      edges
        .filter(e => e.from === id || (mode === "undirected" && e.to === id))
        .map(e => ({ neighbor: e.from === id ? e.to : e.from, edgeId: e.id }));

    if (type === "bfs") {
      const q: string[] = [start];
      visited.add(start);
      while (q.length) {
        const cur = q.shift()!;
        order.push(cur);
        setHighlighted(new Set(order));
        setVisitedEdges(new Set(visitedE));
        await new Promise(r => setTimeout(r, 600));
        for (const { neighbor, edgeId } of getNeighbors(cur)) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            visitedE.add(edgeId);
            q.push(neighbor);
          }
        }
      }
    } else {
      const stack: string[] = [start];
      while (stack.length) {
        const cur = stack.pop()!;
        if (visited.has(cur)) continue;
        visited.add(cur);
        order.push(cur);
        setHighlighted(new Set(order));
        setVisitedEdges(new Set(visitedE));
        await new Promise(r => setTimeout(r, 600));
        for (const { neighbor, edgeId } of getNeighbors(cur)) {
          if (!visited.has(neighbor)) {
            visitedE.add(edgeId);
            stack.push(neighbor);
          }
        }
      }
    }

    const labels = order.map(id => vertices.find(v => v.id === id)?.label ?? id);
    setLog(`✦ ${type.toUpperCase()} from "${vertices.find(v => v.id === start)?.label}": [${labels.join(" → ")}]`);
    setAnimating(false);
  };

  const Btn = ({ onClick, children, disabled = false, active = false }:
    { onClick: () => void; children: React.ReactNode; disabled?: boolean; active?: boolean }) => (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-30 ${
        active
          ? "border-[color:var(--purple)]/60 bg-[color:var(--purple)]/15 text-[color:var(--purple)]"
          : "border-border hover:border-[color:var(--purple)]/50 hover:bg-[color:var(--purple)]/8 hover:text-[color:var(--purple)]"
      }`}>
      {children}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode */}
          {(["undirected", "directed"] as GraphMode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setEdges([]); setSelectedVerts([]); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                mode === m
                  ? "border-[color:var(--purple)]/60 bg-[color:var(--purple)]/15 text-[color:var(--purple)]"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}>
              {m === "undirected" ? "⟷ Undirected" : "→ Directed"}
            </button>
          ))}
          <div className="h-5 w-px bg-border" />
          <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addVertex()}
            placeholder="Label"
            className="w-20 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--purple)]" />
          <Btn onClick={addVertex}><Plus className="h-3.5 w-3.5" /> Add Vertex</Btn>
          <Btn onClick={removeVertex}><Trash2 className="h-3.5 w-3.5" /> Remove Vertex</Btn>
          <div className="h-5 w-px bg-border" />
          <input value={weightInput} onChange={e => setWeightInput(e.target.value)}
            placeholder="Weight"
            className="w-20 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--purple)]" />
          <Btn onClick={addEdge}><Plus className="h-3.5 w-3.5" /> Add Edge</Btn>
          <Btn onClick={removeEdge}><Trash2 className="h-3.5 w-3.5" /> Remove Edge</Btn>
          <div className="h-5 w-px bg-border" />
          <Btn onClick={() => runAlgo("bfs")} disabled={animating} active={animating}>
            <Play className="h-3.5 w-3.5" /> BFS
          </Btn>
          <Btn onClick={() => runAlgo("dfs")} disabled={animating} active={animating}>
            <Play className="h-3.5 w-3.5" /> DFS
          </Btn>
          <button
            onClick={() => { setVertices([]); setEdges([]); setSelectedVerts([]); setHighlighted(new Set()); setVisitedEdges(new Set()); setLog(""); }}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20">
            Clear
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          // Click canvas to add vertex · Drag vertices to reposition · Select 2 vertices to add/remove edges · Blue = selected
        </p>
      </div>

      {/* SVG Canvas */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)]"
        style={{ height: 420 }}
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in oklab, var(--purple) 7%, transparent), transparent 70%)" }}
        />

        {vertices.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Share2 className="h-12 w-12 opacity-15" />
            <p className="text-sm">Click "Add Vertex" to start building your graph</p>
          </div>
        )}

        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{ cursor: dragging ? "grabbing" : "default" }}
        >
          {/* Arrowhead marker for directed */}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="var(--border-strong)" />
            </marker>
            <marker id="arrow-visited" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="var(--purple)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map(edge => {
            const from = vertices.find(v => v.id === edge.from);
            const to = vertices.find(v => v.id === edge.to);
            if (!from || !to) return null;
            const visited = visitedEdges.has(edge.id);
            // offset for directed
            const dx = to.x - from.x, dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / len, uy = dy / len;
            const x2 = to.x - ux * (VERTEX_R + 5);
            const y2 = to.y - uy * (VERTEX_R + 5);
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            return (
              <g key={edge.id}>
                <line
                  x1={from.x} y1={from.y} x2={mode === "directed" ? x2 : to.x} y2={mode === "directed" ? y2 : to.y}
                  stroke={visited ? "var(--purple)" : "var(--border-strong)"}
                  strokeWidth={visited ? 2.5 : 1.5}
                  markerEnd={mode === "directed" ? (visited ? "url(#arrow-visited)" : "url(#arrow)") : undefined}
                  style={{ transition: "stroke 0.3s" }}
                />
                {edge.weight !== undefined && (
                  <text x={mx} y={my - 6} textAnchor="middle"
                    fill="var(--muted-foreground)" fontSize={11} fontFamily="JetBrains Mono, monospace">
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {/* Vertices */}
          {vertices.map(v => {
            const isSelected = selectedVerts.includes(v.id);
            const isHighlighted = highlighted.has(v.id);
            return (
              <g
                key={v.id}
                onMouseDown={e => onMouseDown(e, v.id)}
                onClick={() => onVertexClick(v.id)}
                style={{ cursor: "grab" }}
              >
                <circle
                  cx={v.x} cy={v.y} r={VERTEX_R}
                  fill={
                    isHighlighted
                      ? "color-mix(in oklab, var(--purple) 30%, var(--surface-2))"
                      : isSelected
                        ? "color-mix(in oklab, var(--cyan) 20%, var(--surface-2))"
                        : "var(--surface-2)"
                  }
                  stroke={isHighlighted ? "var(--purple)" : isSelected ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth={isHighlighted || isSelected ? 2.5 : 1.5}
                  style={{
                    filter: isHighlighted
                      ? "drop-shadow(0 0 10px color-mix(in oklab, var(--purple) 70%, transparent))"
                      : isSelected
                        ? "drop-shadow(0 0 8px color-mix(in oklab, var(--cyan) 60%, transparent))"
                        : "none",
                    transition: "all 0.25s",
                  }}
                />
                <text x={v.x} y={v.y + 5} textAnchor="middle"
                  fill={isHighlighted ? "var(--purple)" : isSelected ? "var(--cyan)" : "var(--foreground)"}
                  fontSize={13} fontFamily="JetBrains Mono, monospace" fontWeight="bold"
                  style={{ userSelect: "none", pointerEvents: "none" }}>
                  {v.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5">
          <span className="font-mono text-xs text-muted-foreground">Vertices: </span>
          <span className="font-mono text-sm font-bold text-[color:var(--purple)]">{vertices.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5">
          <span className="font-mono text-xs text-muted-foreground">Edges: </span>
          <span className="font-mono text-sm font-bold text-[color:var(--purple)]">{edges.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5">
          <span className="font-mono text-xs text-muted-foreground">Selected: </span>
          <span className="font-mono text-sm font-bold text-[color:var(--cyan)]">
            {selectedVerts.length === 0 ? "none" : selectedVerts.map(id => vertices.find(v => v.id === id)?.label ?? id).join(", ")}
          </span>
        </div>
        {log && (
          <div className="flex-1 rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5">
            <span className="font-mono text-xs text-muted-foreground">// </span>
            <span className="font-mono text-sm text-[color:var(--purple)]">{log}</span>
          </div>
        )}
      </div>
    </div>
  );
}
