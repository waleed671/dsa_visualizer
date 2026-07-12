import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Triangle } from "lucide-react";

// ── Heap helpers ─────────────────────────────────────────────────────────────
function heapifyUp(arr: number[], type: "max" | "min"): number[] {
  const a = [...arr];
  let i = a.length - 1;
  const better = (x: number, y: number) => type === "max" ? x > y : x < y;
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (better(a[i], a[parent])) {
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    } else break;
  }
  return a;
}

function heapifyDown(arr: number[], i: number, type: "max" | "min"): number[] {
  const a = [...arr];
  const n = a.length;
  const better = (x: number, y: number) => type === "max" ? x > y : x < y;
  while (true) {
    let target = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && better(a[l], a[target])) target = l;
    if (r < n && better(a[r], a[target])) target = r;
    if (target === i) break;
    [a[i], a[target]] = [a[target], a[i]];
    i = target;
  }
  return a;
}

function insert(heap: number[], val: number, type: "max" | "min"): number[] {
  return heapifyUp([...heap, val], type);
}

function extract(heap: number[], type: "max" | "min"): number[] {
  if (!heap.length) return heap;
  const a = [...heap];
  [a[0], a[a.length - 1]] = [a[a.length - 1], a[0]];
  a.pop();
  return heapifyDown(a, 0, type);
}

// ── SVG Tree from array ───────────────────────────────────────────────────────
const NODE_R = 22;
const H_SPREAD = 1.8;

function getPositions(n: number): { x: number; y: number }[] {
  const pos: { x: number; y: number }[] = [];
  const V_GAP = 65;
  for (let i = 0; i < n; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    const levelStart = (1 << depth) - 1;
    const posInLevel = i - levelStart;
    const levelCount = 1 << depth;
    const totalWidth = 600;
    const cellW = totalWidth / levelCount;
    pos.push({
      x: cellW * posInLevel + cellW / 2,
      y: depth * V_GAP + NODE_R + 10,
    });
  }
  return pos;
}

function HeapTree({ heap, heapType, highlighted }: { heap: number[]; heapType: "max" | "min"; highlighted: number | null }) {
  const pos = getPositions(heap.length);
  const color = heapType === "max" ? "var(--red)" : "var(--cyan)";

  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 1; i < heap.length; i++) {
    const p = Math.floor((i - 1) / 2);
    edges.push({ x1: pos[p].x, y1: pos[p].y, x2: pos[i].x, y2: pos[i].y });
  }

  const maxY = pos.length ? Math.max(...pos.map(p => p.y)) : 0;

  return (
    <svg width="100%" height={maxY + NODE_R + 20} viewBox={`0 0 600 ${maxY + NODE_R + 20}`} preserveAspectRatio="xMidYMid meet">
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke="var(--border-strong)" strokeWidth={2} />
      ))}
      {heap.map((val, i) => {
        const hl = highlighted === i || (highlighted === null && i === 0 && heap.length > 0 && false);
        const isRoot = i === 0;
        return (
          <g key={i}>
            <circle cx={pos[i].x} cy={pos[i].y} r={NODE_R}
              fill={isRoot ? `color-mix(in oklab, ${color} 20%, var(--surface-2))` : "var(--surface-2)"}
              stroke={hl ? color : isRoot ? `color-mix(in oklab, ${color} 60%, var(--border))` : "var(--border-strong)"}
              strokeWidth={hl ? 2.5 : 1.5}
              style={{
                filter: hl ? `drop-shadow(0 0 8px ${color})` : isRoot ? `drop-shadow(0 0 4px color-mix(in oklab, ${color} 40%, transparent))` : "none",
                transition: "all 0.3s",
              }}
            />
            <text x={pos[i].x} y={pos[i].y + 5} textAnchor="middle"
              fill={isRoot ? color : "var(--foreground)"}
              fontSize={12} fontFamily="JetBrains Mono, monospace" fontWeight="bold">
              {val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export function HeapVisualizer() {
  const [heapType, setHeapType] = useState<"max" | "min">("max");
  const [heap, setHeap] = useState<number[]>([]);
  const [value, setValue] = useState("");
  const [log, setLog] = useState("");
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const color = heapType === "max" ? "var(--red)" : "var(--cyan)";

  const doInsert = () => {
    const v = parseInt(value);
    if (isNaN(v)) { setLog("✗ Enter a valid number"); return; }
    const next = insert(heap, v, heapType);
    setHeap(next);
    setLog(`✦ Inserted ${v}  →  ${heapType === "max" ? "max" : "min"} = ${next[0]}`);
    setValue("");
    setHighlighted(0);
    setTimeout(() => setHighlighted(null), 1500);
  };

  const doExtract = () => {
    if (!heap.length) { setLog("✗ Heap is empty"); return; }
    const top = heap[0];
    setHighlighted(0);
    setTimeout(() => {
      setHeap(h => extract(h, heapType));
      setLog(`✦ Extracted ${heapType === "max" ? "max" : "min"} = ${top}`);
      setHighlighted(null);
    }, 500);
  };

  const doPeek = () => {
    if (!heap.length) { setLog("✗ Heap is empty"); return; }
    setHighlighted(0);
    setLog(`✦ Peek → ${heap[0]} (${heapType === "max" ? "maximum" : "minimum"})`);
    setTimeout(() => setHighlighted(null), 1500);
  };

  const Btn = ({ onClick, children, danger = false, disabled = false }:
    { onClick: () => void; children: React.ReactNode; danger?: boolean; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-30 ${
        danger ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "border-border hover:border-[color:var(--red)]/50 hover:bg-[color:var(--red)]/8 hover:text-[color:var(--red)]"
      }`}
      style={!danger ? { "--hover-color": color } as React.CSSProperties : undefined}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tabs */}
      <div className="flex gap-2 rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        {(["max", "min"] as const).map(t => (
          <button key={t}
            onClick={() => { setHeapType(t); setHeap([]); setLog(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              heapType === t
                ? t === "max"
                  ? "bg-[color:var(--red)]/15 text-[color:var(--red)] border border-[color:var(--red)]/40"
                  : "bg-[color:var(--cyan)]/15 text-[color:var(--cyan)] border border-[color:var(--cyan)]/40"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            {t === "max" ? "▲ Max Heap" : "▽ Min Heap"}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doInsert()}
            placeholder="Number"
            className="w-24 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--red)]" />
          <Btn onClick={doInsert}>Insert</Btn>
          <Btn onClick={doExtract}>{heapType === "max" ? "Extract Max" : "Extract Min"}</Btn>
          <Btn onClick={doPeek}>Peek</Btn>
          <Btn onClick={() => setLog(`✦ Size = ${heap.length}`)}>Size</Btn>
          <Btn onClick={() => setLog(`✦ isEmpty → ${heap.length === 0}`)}>isEmpty</Btn>
          <Btn onClick={() => { setHeap([]); setLog("✦ Heap cleared"); }} danger>Clear</Btn>
        </div>
      </div>

      {/* Canvas: Tree + Array */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Tree */}
        <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)] lg:col-span-3">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse 50% 40% at 50% 0%, color-mix(in oklab, ${color} 8%, transparent), transparent 70%)` }} />
          <div className="relative flex min-h-[320px] items-center justify-center p-4">
            {heap.length === 0 ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Triangle className="h-10 w-10 opacity-15" />
                <p className="text-sm">{heapType === "max" ? "Max" : "Min"} Heap is empty</p>
              </div>
            ) : (
              <HeapTree heap={heap} heapType={heapType} highlighted={highlighted} />
            )}
          </div>
        </div>

        {/* Array representation */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-[color:var(--surface)] p-4 lg:col-span-2">
          <div className="font-mono text-xs text-muted-foreground">// Array representation</div>
          {heap.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Empty</div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {heap.map((val, i) => (
                  <motion.div key={`${val}-${i}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-6 text-right font-mono text-xs text-muted-foreground">[{i}]</span>
                    <div
                      className="flex h-9 flex-1 items-center rounded-lg border px-3 font-mono text-sm font-bold transition-all"
                      style={{
                        borderColor: i === 0 ? color : "var(--border)",
                        background: i === 0 ? `color-mix(in oklab, ${color} 10%, var(--surface-2))` : "var(--surface-2)",
                        color: i === 0 ? color : "var(--foreground)",
                      }}
                    >
                      {val}
                    </div>
                    {i === 0 && (
                      <span className="font-mono text-[9px] font-semibold" style={{ color }}>
                        {heapType === "max" ? "MAX" : "MIN"}
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {log && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5">
          <span className="font-mono text-xs text-muted-foreground">// </span>
          <span className="font-mono text-sm" style={{ color }}>{log}</span>
        </motion.div>
      )}
    </div>
  );
}
