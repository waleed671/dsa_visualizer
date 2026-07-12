import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLOR = "var(--amber)";
const DEFAULT_CAP = 15;

type QItem = { id: string; value: string; priority?: number };
let _ctr = 0;
const mkId = () => `q${Date.now()}${_ctr++}`;

type SubTab = "queue" | "deque" | "priority";

function Btn({ onClick, children, danger = false, disabled = false, active = false }:
  { onClick: () => void; children: React.ReactNode; danger?: boolean; disabled?: boolean; active?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-30 ${
        danger ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : active ? "border-[color:var(--amber)]/60 bg-[color:var(--amber)]/15 text-[color:var(--amber)]"
          : "border-border hover:border-[color:var(--amber)]/50 hover:bg-[color:var(--amber)]/8 hover:text-[color:var(--amber)]"
      }`}>
      {children}
    </button>
  );
}

function SubTabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-[color:var(--amber)]/15 text-[color:var(--amber)] border border-[color:var(--amber)]/40"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function QueueNode({ item, label, highlighted }: { item: QItem; label?: string; highlighted: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5, x: -30 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.5, x: 30 }}
      transition={{ type: "spring", damping: 22, stiffness: 300 }}
      className="flex flex-col items-center gap-1"
    >
      {label && <span className="font-mono text-[9px] font-semibold" style={{ color: COLOR }}>{label}</span>}
      <div
        className="flex h-14 min-w-[64px] flex-col items-center justify-center rounded-xl border-2 px-3 transition-all duration-300"
        style={{
          borderColor: highlighted ? COLOR : label ? `color-mix(in oklab, ${COLOR} 40%, var(--border))` : "var(--border)",
          background: highlighted ? `color-mix(in oklab, ${COLOR} 15%, var(--surface-2))` : "var(--surface-2)",
          boxShadow: highlighted ? `0 0 20px color-mix(in oklab, ${COLOR} 35%, transparent)` : "none",
        }}
      >
        <span className="font-mono text-sm font-bold">{item.value}</span>
        {item.priority !== undefined && (
          <span className="font-mono text-[9px] text-muted-foreground">p={item.priority}</span>
        )}
      </div>
    </motion.div>
  );
}

export function QueueVisualizer() {
  const [subTab, setSubTab] = useState<SubTab>("queue");
  const [queue, setQueue] = useState<QItem[]>([]);
  const [value, setValue] = useState("");
  const [priority, setPriority] = useState("");
  const [capInput, setCapInput] = useState(String(DEFAULT_CAP));
  const [capacity, setCapacity] = useState(DEFAULT_CAP);
  const [log, setLog] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const hl = (id: string, ms = 1500) => { setHighlighted(id); setTimeout(() => setHighlighted(null), ms); };

  const enqueueFn = () => {
    if (!value.trim()) return;
    if (queue.length >= capacity) { setLog(`✗ Queue full! Capacity is ${capacity}`); return; }
    const n: QItem = { id: mkId(), value: value.trim() };
    if (subTab === "priority") {
      const p = parseInt(priority) || 0;
      n.priority = p;
      const next = [...queue, n].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
      setQueue(next);
    } else {
      setQueue(q => [...q, n]);
    }
    setLog(`✦ Enqueued "${value}"${subTab === "priority" ? ` (priority ${priority || 0})` : ""}`);
    setValue("");
    setTimeout(() => hl(n.id), 50);
  };

  const dequeueFn = () => {
    if (!queue.length) { setLog("✗ Queue is empty"); return; }
    const front = queue[0];
    setQueue(q => q.slice(1));
    setLog(`✦ Dequeued "${front.value}" from front`);
  };

  const insertFront = () => {
    if (!value.trim()) return;
    if (queue.length >= capacity) { setLog("✗ Queue full"); return; }
    const n: QItem = { id: mkId(), value: value.trim() };
    setQueue(q => [n, ...q]);
    setLog(`✦ Inserted "${value}" at front`);
    setValue("");
    setTimeout(() => hl(n.id), 50);
  };

  const deleteLast = () => {
    if (!queue.length) { setLog("✗ Queue is empty"); return; }
    const last = queue.at(-1)!;
    setQueue(q => q.slice(0, -1));
    setLog(`✦ Deleted "${last.value}" from rear`);
  };

  const setCapFn = () => {
    const c = parseInt(capInput);
    if (isNaN(c) || c < 1) { setLog("✗ Invalid capacity"); return; }
    setCapacity(c);
    setLog(`✦ Capacity set to ${c}`);
  };

  const fill = queue.length;
  const pct = Math.round((fill / capacity) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tabs */}
      <div className="flex gap-2 rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        {(["queue", "deque", "priority"] as SubTab[]).map(t => (
          <SubTabBtn key={t} label={t === "priority" ? "Priority Queue" : t.charAt(0).toUpperCase() + t.slice(1)}
            active={subTab === t} onClick={() => { setSubTab(t); setQueue([]); setLog(""); }} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === "Enter" && enqueueFn()}
            placeholder="Value"
            className="w-24 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--amber)]" />
          {subTab === "priority" && (
            <input value={priority} onChange={e => setPriority(e.target.value)} placeholder="Priority"
              className="w-20 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--amber)]" />
          )}
          <div className="h-5 w-px bg-border" />
          <Btn onClick={enqueueFn}>{subTab === "priority" ? "Insert" : "Enqueue"}</Btn>
          <Btn onClick={dequeueFn}>{subTab === "priority" ? "Extract Max" : "Dequeue"}</Btn>
          {subTab === "deque" && (
            <>
              <Btn onClick={insertFront}>Insert Front</Btn>
              <Btn onClick={deleteLast}>Delete Rear</Btn>
            </>
          )}
          <Btn onClick={() => { if (queue.length) { hl(queue[0].id); setLog(`✦ Front = "${queue[0].value}"`); } else setLog("✗ Empty"); }}>Front</Btn>
          <Btn onClick={() => { if (queue.length) { hl(queue.at(-1)!.id); setLog(`✦ Rear = "${queue.at(-1)!.value}"`); } else setLog("✗ Empty"); }}>Rear</Btn>
          <Btn onClick={() => setLog(`✦ isEmpty → ${queue.length === 0}`)}>isEmpty</Btn>
          <Btn onClick={() => setLog(`✦ isFull → ${queue.length >= capacity}`)}>isFull</Btn>
          <Btn onClick={() => setLog(`✦ Size = ${queue.length}`)}>Size</Btn>
          <div className="h-5 w-px bg-border" />
          <input value={capInput} onChange={e => setCapInput(e.target.value)} placeholder="Capacity"
            className="w-20 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--amber)]" />
          <Btn onClick={setCapFn}>Set Capacity</Btn>
          <Btn onClick={() => { setQueue([]); setLog("✦ Cleared"); }} danger>Clear</Btn>
        </div>

        {/* Fill bar */}
        <div className="mt-3 flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">Fill: {fill} / {capacity}</span>
          <div className="flex-1 h-2 rounded-full border border-border bg-[color:var(--surface-2)] overflow-hidden">
            <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }}
              style={{ background: pct >= 90 ? "var(--red)" : pct >= 70 ? "var(--amber)" : "var(--green)" }} />
          </div>
          <span className="font-mono text-xs text-muted-foreground w-10">{pct}%</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)]">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in oklab, var(--amber) 8%, transparent), transparent 70%)" }}
        />
        <div className="relative flex min-h-[220px] flex-wrap items-center justify-center gap-0 p-6">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="font-mono text-4xl opacity-15">→</div>
              <p className="text-sm">
                {subTab === "priority" ? "Priority queue is empty" : subTab === "deque" ? "Deque is empty" : "Queue is empty"} — add an element to begin
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-0">
              {subTab !== "priority" && (
                <span className="mr-2 font-mono text-[9px] font-semibold" style={{ color: COLOR }}>FRONT</span>
              )}
              <AnimatePresence mode="popLayout">
                {queue.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-0">
                    <QueueNode
                      item={item}
                      highlighted={highlighted === item.id}
                      label={subTab === "priority" ? `#${i + 1}` : undefined}
                    />
                    {i < queue.length - 1 && (
                      <div className="px-1 text-[color:var(--amber)] text-xs opacity-60">→</div>
                    )}
                  </div>
                ))}
              </AnimatePresence>
              {subTab !== "priority" && (
                <span className="ml-2 font-mono text-[9px] font-semibold" style={{ color: COLOR }}>REAR</span>
              )}
            </div>
          )}
        </div>
      </div>

      {log && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5">
          <span className="font-mono text-xs text-muted-foreground">// </span>
          <span className="font-mono text-sm text-[color:var(--amber)]">{log}</span>
        </motion.div>
      )}
    </div>
  );
}
