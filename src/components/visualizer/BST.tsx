import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch } from "lucide-react";

// ── BST node type ─────────────────────────────────────────────────────────────
type BNode = { value: number; left: BNode | null; right: BNode | null };

// ── Layout node (with SVG coords) ────────────────────────────────────────────
type LNode = { value: number; x: number; y: number; left: LNode | null; right: LNode | null; id: string };

const NODE_R = 24;
const H_GAP = 60;
const V_GAP = 70;

// Inorder numbering → assigns x
function layoutTree(node: BNode | null, depth: number, counter: { n: number }): LNode | null {
  if (!node) return null;
  const left = layoutTree(node.left, depth + 1, counter);
  const x = counter.n++ * H_GAP;
  const right = layoutTree(node.right, depth + 1, counter);
  return { value: node.value, x, y: depth * V_GAP, left, right, id: `bst${node.value}` };
}

function bstInsert(root: BNode | null, val: number): BNode {
  if (!root) return { value: val, left: null, right: null };
  if (val < root.value) return { ...root, left: bstInsert(root.left, val) };
  if (val > root.value) return { ...root, right: bstInsert(root.right, val) };
  return root; // duplicate
}

function bstDelete(root: BNode | null, val: number): BNode | null {
  if (!root) return null;
  if (val < root.value) return { ...root, left: bstDelete(root.left, val) };
  if (val > root.value) return { ...root, right: bstDelete(root.right, val) };
  if (!root.left) return root.right;
  if (!root.right) return root.left;
  // find inorder successor
  let succ = root.right;
  while (succ.left) succ = succ.left;
  return { ...root, value: succ.value, right: bstDelete(root.right, succ.value) };
}

function bstSearch(root: BNode | null, val: number): number[] {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.value);
    if (val === cur.value) break;
    cur = val < cur.value ? cur.left : cur.right;
  }
  return path;
}

function inorder(node: BNode | null, out: number[] = []): number[] {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.value);
  inorder(node.right, out);
  return out;
}
function preorder(node: BNode | null, out: number[] = []): number[] {
  if (!node) return out;
  out.push(node.value);
  preorder(node.left, out);
  preorder(node.right, out);
  return out;
}
function postorder(node: BNode | null, out: number[] = []): number[] {
  if (!node) return out;
  postorder(node.left, out);
  postorder(node.right, out);
  out.push(node.value);
  return out;
}
function levelorder(node: BNode | null): number[] {
  if (!node) return [];
  const out: number[] = [];
  const q: BNode[] = [node];
  while (q.length) {
    const cur = q.shift()!;
    out.push(cur.value);
    if (cur.left) q.push(cur.left);
    if (cur.right) q.push(cur.right);
  }
  return out;
}
function bstHeight(node: BNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(bstHeight(node.left), bstHeight(node.right));
}
function bstMin(node: BNode | null): number | null {
  if (!node) return null;
  return node.left ? bstMin(node.left) : node.value;
}
function bstMax(node: BNode | null): number | null {
  if (!node) return null;
  return node.right ? bstMax(node.right) : node.value;
}

// ── SVG rendering ─────────────────────────────────────────────────────────────
function TreeSVG({ layout, highlighted }: { layout: LNode | null; highlighted: Set<number> }) {
  if (!layout) return null;

  const nodes: LNode[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];

  function collect(n: LNode | null) {
    if (!n) return;
    nodes.push(n);
    if (n.left) {
      edges.push({ x1: n.x + NODE_R, y1: n.y + NODE_R, x2: n.left.x + NODE_R, y2: n.left.y + NODE_R });
      collect(n.left);
    }
    if (n.right) {
      edges.push({ x1: n.x + NODE_R, y1: n.y + NODE_R, x2: n.right.x + NODE_R, y2: n.right.y + NODE_R });
      collect(n.right);
    }
  }
  collect(layout);

  // compute SVG bounds
  const minX = Math.min(...nodes.map(n => n.x));
  const maxX = Math.max(...nodes.map(n => n.x));
  const maxY = Math.max(...nodes.map(n => n.y));
  const W = maxX - minX + NODE_R * 2 + 40;
  const H = maxY + NODE_R * 2 + 40;
  const offX = -minX + 20;

  return (
    <svg width={W} height={H} className="overflow-visible">
      {/* Edges */}
      {edges.map((e, i) => (
        <line key={i}
          x1={e.x1 + offX} y1={e.y1 + 20} x2={e.x2 + offX} y2={e.y2 + 20}
          stroke="var(--border-strong)" strokeWidth={2}
        />
      ))}
      {/* Nodes */}
      {nodes.map(n => {
        const hl = highlighted.has(n.value);
        const cx = n.x + NODE_R + offX;
        const cy = n.y + NODE_R + 20;
        return (
          <g key={n.id}>
            <circle cx={cx} cy={cy} r={NODE_R}
              fill={hl ? "color-mix(in oklab, var(--pink) 20%, var(--surface-2))" : "var(--surface-2)"}
              stroke={hl ? "var(--pink)" : "var(--border-strong)"}
              strokeWidth={hl ? 2.5 : 1.5}
              style={{ filter: hl ? "drop-shadow(0 0 8px color-mix(in oklab, var(--pink) 60%, transparent))" : "none", transition: "all 0.3s" }}
            />
            <text x={cx} y={cy + 5} textAnchor="middle"
              fill={hl ? "var(--pink)" : "var(--foreground)"}
              fontSize={13} fontFamily="JetBrains Mono, monospace" fontWeight="bold"
            >{n.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export function BSTVisualizer() {
  const [root, setRoot] = useState<BNode | null>(null);
  const [history, setHistory] = useState<(BNode | null)[]>([]);
  const [value, setValue] = useState("");
  const [log, setLog] = useState("");
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const [animating, setAnimating] = useState(false);

  const save = (next: BNode | null, msg: string) => {
    setHistory(h => [...h, root]);
    setRoot(next);
    setLog(msg);
  };

  const animate = async (vals: number[], msg: string) => {
    if (animating) return;
    setAnimating(true);
    setLog(`⟳ ${msg}…`);
    for (const v of vals) {
      setHighlighted(new Set([v]));
      await new Promise(r => setTimeout(r, 600));
    }
    setHighlighted(new Set());
    setLog(`✦ ${msg}: [${vals.join(", ")}]`);
    setAnimating(false);
  };

  const insert = () => {
    const v = parseInt(value);
    if (isNaN(v)) { setLog("✗ Enter a valid number"); return; }
    save(bstInsert(root, v), `✦ Inserted ${v}`);
    setValue("");
  };

  const del = () => {
    const v = parseInt(value);
    if (isNaN(v)) { setLog("✗ Enter a valid number"); return; }
    save(bstDelete(root, v), `✦ Deleted ${v}`);
    setValue("");
  };

  const search = async () => {
    const v = parseInt(value);
    if (isNaN(v) || !root) { setLog("✗ Enter a value or tree is empty"); return; }
    const path = bstSearch(root, v);
    setAnimating(true);
    setLog(`⟳ Searching ${v}…`);
    for (const p of path) {
      setHighlighted(new Set([p]));
      await new Promise(r => setTimeout(r, 600));
    }
    const found = path.at(-1) === v;
    setHighlighted(found ? new Set([v]) : new Set());
    setLog(found ? `✦ Found ${v} — path: [${path.join(" → ")}]` : `✗ ${v} not found — path: [${path.join(" → ")}]`);
    setTimeout(() => setHighlighted(new Set()), 2000);
    setAnimating(false);
  };

  const COLOR = "var(--pink)";

  // layout
  const counter = { n: 0 };
  const layout = layoutTree(root, 0, counter);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && insert()}
            placeholder="Number"
            className="w-24 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--pink)]" />
          {[
            { label: "Insert", fn: insert },
            { label: "Delete", fn: del },
            { label: "Search", fn: search },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn} disabled={animating}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-30 hover:border-[color:var(--pink)]/50 hover:bg-[color:var(--pink)]/8 hover:text-[color:var(--pink)]">
              {label}
            </button>
          ))}
          <div className="h-5 w-px bg-border" />
          {[
            { label: "Inorder", fn: () => animate(inorder(root), "Inorder") },
            { label: "Preorder", fn: () => animate(preorder(root), "Preorder") },
            { label: "Postorder", fn: () => animate(postorder(root), "Postorder") },
            { label: "Level-order", fn: () => animate(levelorder(root), "Level-order") },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn} disabled={animating}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-30 hover:border-[color:var(--pink)]/50 hover:bg-[color:var(--pink)]/8 hover:text-[color:var(--pink)]">
              {label}
            </button>
          ))}
          <div className="h-5 w-px bg-border" />
          <button onClick={() => setLog(`✦ Min = ${bstMin(root) ?? "empty"}`)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-[color:var(--pink)]/50 hover:text-[color:var(--pink)]">Find Min</button>
          <button onClick={() => setLog(`✦ Max = ${bstMax(root) ?? "empty"}`)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-[color:var(--pink)]/50 hover:text-[color:var(--pink)]">Find Max</button>
          <button onClick={() => setLog(`✦ Height = ${bstHeight(root)}`)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-[color:var(--pink)]/50 hover:text-[color:var(--pink)]">Height</button>
          <button onClick={() => { if (!history.length) return; setRoot(history.at(-1)!); setHistory(h => h.slice(0, -1)); setLog("↩ Undo"); }}
            disabled={!history.length}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-border-strong disabled:opacity-30">↩ Undo</button>
          <button onClick={() => save(null, "✦ Tree cleared")}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20">Clear</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-[360px] overflow-auto rounded-2xl border border-border bg-[color:var(--surface)]">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 40% at 50% 0%, color-mix(in oklab, var(--pink) 10%, transparent), transparent 70%)" }}
        />
        <div className="relative flex min-h-[360px] items-center justify-center p-8">
          {!root ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <GitBranch className="h-12 w-12 opacity-15" />
              <p className="text-sm">Tree is empty — insert a number to begin</p>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TreeSVG layout={layout} highlighted={highlighted} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {log && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5">
          <span className="font-mono text-xs text-muted-foreground">// </span>
          <span className="font-mono text-sm text-[color:var(--pink)]">{log}</span>
        </motion.div>
      )}
    </div>
  );
}
