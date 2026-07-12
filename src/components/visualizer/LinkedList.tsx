import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
type LLNode = { id: string; value: string };
let _id = 0;
const mkId = () => `ll${++_id}`;

const VIZ_CYAN = "var(--cyan)";

// ── tiny shared primitives ────────────────────────────────────────────────────
function VizInput({
  value, onChange, placeholder, className = "",
}: {
  value: string; onChange: (v: string) => void; placeholder: string; className?: string;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-24 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--cyan)] ${className}`}
    />
  );
}

function VizBtn({
  onClick, children, danger = false, disabled = false, active = false,
}: {
  onClick: () => void; children: React.ReactNode; danger?: boolean; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-30 ${
        danger
          ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : active
            ? "border-[color:var(--cyan)]/60 bg-[color:var(--cyan)]/15 text-[color:var(--cyan)]"
            : "border-border hover:border-[color:var(--cyan)]/50 hover:bg-[color:var(--cyan)]/8 hover:text-[color:var(--cyan)]"
      }`}
    >
      {children}
    </button>
  );
}

function VizLog({ log }: { log: string }) {
  if (!log) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5"
    >
      <span className="font-mono text-xs text-muted-foreground">// </span>
      <span className="font-mono text-sm text-[color:var(--cyan)]">{log}</span>
    </motion.div>
  );
}

// ── node box ──────────────────────────────────────────────────────────────────
function NodeBox({
  node, index, highlighted, color = VIZ_CYAN,
}: {
  node: LLNode; index: number; highlighted: boolean; color?: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 20 }}
      transition={{ type: "spring", damping: 20, stiffness: 280 }}
      className="relative flex h-16 min-w-[64px] flex-col items-center justify-center rounded-xl border-2 px-3 transition-all duration-300"
      style={{
        borderColor: highlighted ? color : "var(--border)",
        background: highlighted
          ? `color-mix(in oklab, ${color} 12%, var(--surface-2))`
          : "var(--surface-2)",
        boxShadow: highlighted
          ? `0 0 20px color-mix(in oklab, ${color} 35%, transparent), 0 0 40px color-mix(in oklab, ${color} 15%, transparent)`
          : "none",
      }}
    >
      <span className="font-mono text-sm font-bold">{node.value}</span>
      <span className="font-mono text-[9px] text-muted-foreground">[{index}]</span>
    </motion.div>
  );
}

// ── arrow ──────────────────────────────────────────────────────────────────────
function Arrow({ double = false }: { double?: boolean }) {
  return (
    <div className="flex items-center gap-0.5 px-1 text-[color:var(--cyan)]">
      {double && <span className="text-xs">←</span>}
      <div className="h-px w-5 bg-[color:var(--cyan)] opacity-70" />
      <span className="text-xs">→</span>
    </div>
  );
}

// ── empty state ───────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <ChevronRight className="h-12 w-12 opacity-15" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINKED LIST VISUALIZER
// ═══════════════════════════════════════════════════════════════════════════════
export function LinkedListVisualizer() {
  const [nodes, setNodes] = useState<LLNode[]>([]);
  const [history, setHistory] = useState<LLNode[][]>([]);
  const [value, setValue] = useState("");
  const [position, setPosition] = useState("");
  const [log, setLog] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [traversing, setTraversing] = useState(false);

  const save = (next: LLNode[], msg: string) => {
    setHistory(h => [...h, nodes]);
    setNodes(next);
    setLog(msg);
  };

  const highlight = (id: string, ms = 1800) => {
    setHighlighted(id);
    setTimeout(() => setHighlighted(null), ms);
  };

  const ops = {
    insertBegin: () => {
      if (!value.trim()) return;
      const n = { id: mkId(), value: value.trim() };
      save([n, ...nodes], `✦ Inserted "${value}" at beginning  →  head = ${value}`);
      setValue("");
      setTimeout(() => highlight(n.id), 50);
    },
    insertEnd: () => {
      if (!value.trim()) return;
      const n = { id: mkId(), value: value.trim() };
      save([...nodes, n], `✦ Inserted "${value}" at end  →  tail = ${value}`);
      setValue("");
      setTimeout(() => highlight(n.id), 50);
    },
    insertAt: () => {
      const pos = parseInt(position);
      if (!value.trim() || isNaN(pos) || pos < 0 || pos > nodes.length) {
        setLog(`✗ Invalid position. Must be 0–${nodes.length}`);
        return;
      }
      const n = { id: mkId(), value: value.trim() };
      const next = [...nodes];
      next.splice(pos, 0, n);
      save(next, `✦ Inserted "${value}" at position ${pos}`);
      setValue("");
      setTimeout(() => highlight(n.id), 50);
    },
    delBegin: () => {
      if (!nodes.length) { setLog("✗ List is empty"); return; }
      save(nodes.slice(1), `✦ Deleted "${nodes[0].value}" from beginning`);
    },
    delEnd: () => {
      if (!nodes.length) { setLog("✗ List is empty"); return; }
      save(nodes.slice(0, -1), `✦ Deleted "${nodes.at(-1)!.value}" from end`);
    },
    delByVal: () => {
      const idx = nodes.findIndex(n => n.value === value.trim());
      if (idx === -1) { setLog(`✗ Value "${value}" not found`); return; }
      save(nodes.filter((_, i) => i !== idx), `✦ Deleted node with value "${value}"`);
      setValue("");
    },
    delByPos: () => {
      const pos = parseInt(position);
      if (isNaN(pos) || pos < 0 || pos >= nodes.length) {
        setLog(`✗ Invalid position. Must be 0–${nodes.length - 1}`);
        return;
      }
      const next = [...nodes];
      const [removed] = next.splice(pos, 1);
      save(next, `✦ Deleted "${removed.value}" at position ${pos}`);
    },
    search: () => {
      const idx = nodes.findIndex(n => n.value === value.trim());
      if (idx === -1) { setLog(`✗ "${value}" not found in list`); setHighlighted(null); return; }
      highlight(nodes[idx].id);
      setLog(`✦ Found "${value}" at index ${idx}`);
    },
    traversal: async () => {
      if (traversing || !nodes.length) return;
      setTraversing(true);
      setLog("⟳ Traversing list…");
      for (const node of nodes) {
        setHighlighted(node.id);
        await new Promise(r => setTimeout(r, 550));
      }
      setHighlighted(null);
      setLog(`✦ Traversal complete — visited ${nodes.length} node${nodes.length !== 1 ? "s" : ""}`);
      setTraversing(false);
    },
    undo: () => {
      if (!history.length) return;
      setNodes(history.at(-1)!);
      setHistory(h => h.slice(0, -1));
      setLog("↩ Undo successful");
    },
    clear: () => save([], "✦ List cleared"),
    size: () => setLog(`✦ Size = ${nodes.length}`),
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <VizInput value={value} onChange={setValue} placeholder="Value" />
          <VizInput value={position} onChange={setPosition} placeholder="Position" />
          <div className="h-5 w-px bg-border" />
          <VizBtn onClick={ops.insertBegin}>Insert at Beginning</VizBtn>
          <VizBtn onClick={ops.insertEnd}>Insert at End</VizBtn>
          <VizBtn onClick={ops.insertAt}>Insert at Position</VizBtn>
          <div className="h-5 w-px bg-border" />
          <VizBtn onClick={ops.delBegin}>Delete Beginning</VizBtn>
          <VizBtn onClick={ops.delEnd}>Delete End</VizBtn>
          <VizBtn onClick={ops.delByVal}>Delete by Value</VizBtn>
          <VizBtn onClick={ops.delByPos}>Delete by Position</VizBtn>
          <div className="h-5 w-px bg-border" />
          <VizBtn onClick={ops.search}>Search</VizBtn>
          <VizBtn onClick={ops.traversal} disabled={traversing} active={traversing}>
            {traversing ? "Traversing…" : "Traversal"}
          </VizBtn>
          <VizBtn onClick={ops.size}>Size</VizBtn>
          <VizBtn onClick={ops.undo} disabled={!history.length}>↩ Undo</VizBtn>
          <VizBtn onClick={ops.clear} danger>Clear</VizBtn>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)]">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative flex min-h-[220px] flex-wrap items-center justify-center gap-0 p-6">
          {nodes.length === 0 ? (
            <EmptyState label="List is empty — insert a value to begin" />
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-0">
              <span className="mr-1 font-mono text-xs text-muted-foreground">null ←</span>
              <AnimatePresence mode="popLayout">
                {nodes.map((node, i) => (
                  <div key={node.id} className="flex items-center">
                    <NodeBox node={node} index={i} highlighted={highlighted === node.id} />
                    {i < nodes.length - 1 && <Arrow />}
                  </div>
                ))}
              </AnimatePresence>
              <span className="ml-1 font-mono text-xs text-muted-foreground">→ null</span>
            </div>
          )}
        </div>
      </div>

      <VizLog log={log} />
    </div>
  );
}
