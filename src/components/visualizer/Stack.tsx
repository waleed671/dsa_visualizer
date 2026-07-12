import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers } from "lucide-react";

const COLOR = "var(--green)";
const DEFAULT_CAP = 15;

function Btn({ onClick, children, danger = false, disabled = false }:
  { onClick: () => void; children: React.ReactNode; danger?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-30 ${
        danger
          ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "border-border hover:border-[color:var(--green)]/50 hover:bg-[color:var(--green)]/8 hover:text-[color:var(--green)]"
      }`}>
      {children}
    </button>
  );
}

export function StackVisualizer() {
  const [stack, setStack] = useState<{ id: string; value: string }[]>([]);
  const [history, setHistory] = useState<typeof stack[]>([]);
  const [value, setValue] = useState("");
  const [capInput, setCapInput] = useState(String(DEFAULT_CAP));
  const [capacity, setCapacity] = useState(DEFAULT_CAP);
  const [log, setLog] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);

  let _id = 0;
  const mkId = () => `s${Date.now()}${_id++}`;

  const save = (next: typeof stack, msg: string) => {
    setHistory(h => [...h, stack]);
    setStack(next);
    setLog(msg);
  };

  const hlTop = (id: string) => {
    setHighlighted(id);
    setTimeout(() => setHighlighted(null), 1500);
  };

  const push = () => {
    if (!value.trim()) return;
    if (stack.length >= capacity) { setLog(`✗ Stack overflow! Capacity is ${capacity}`); return; }
    const n = { id: mkId(), value: value.trim() };
    save([...stack, n], `✦ Pushed "${value}"  →  top = ${value}`);
    setValue("");
    setTimeout(() => hlTop(n.id), 50);
  };

  const pop = () => {
    if (!stack.length) { setLog("✗ Stack underflow — stack is empty"); return; }
    const top = stack.at(-1)!;
    save(stack.slice(0, -1), `✦ Popped "${top.value}"`);
  };

  const peek = () => {
    if (!stack.length) { setLog("✗ Stack is empty"); return; }
    const top = stack.at(-1)!;
    hlTop(top.id);
    setLog(`✦ Peek → "${top.value}" (top of stack)`);
  };

  const setCapFn = () => {
    const c = parseInt(capInput);
    if (isNaN(c) || c < 1) { setLog("✗ Invalid capacity"); return; }
    setCapacity(c);
    setLog(`✦ Capacity set to ${c}`);
  };

  const fill = stack.length;
  const pct = Math.round((fill / capacity) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && push()}
            placeholder="Value"
            className="w-24 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--green)]"
          />
          <Btn onClick={push}>Push</Btn>
          <Btn onClick={pop}>Pop</Btn>
          <Btn onClick={peek}>Peek</Btn>
          <Btn onClick={() => setLog(`✦ isEmpty → ${stack.length === 0}`)}>isEmpty</Btn>
          <Btn onClick={() => setLog(`✦ isFull → ${stack.length >= capacity}`)}>isFull</Btn>
          <Btn onClick={() => setLog(`✦ Size = ${stack.length}`)}>Size</Btn>
          <div className="h-5 w-px bg-border" />
          <input
            value={capInput} onChange={e => setCapInput(e.target.value)}
            placeholder="Capacity"
            className="w-20 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--green)]"
          />
          <Btn onClick={setCapFn}>Set Capacity</Btn>
          <Btn onClick={() => { if (!history.length) return; setStack(history.at(-1)!); setHistory(h => h.slice(0, -1)); setLog("↩ Undo"); }}>↩ Undo</Btn>
          <Btn onClick={() => save([], "✦ Stack cleared")} danger>Clear</Btn>
        </div>

        {/* Fill bar */}
        <div className="mt-3 flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">Fill: {fill} / {capacity}</span>
          <div className="flex-1 rounded-full border border-border bg-[color:var(--surface-2)] h-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }}
              style={{
                background: pct >= 90 ? "var(--red)" : pct >= 70 ? "var(--amber)" : "var(--green)",
              }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground w-10">{pct}%</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)]"
        style={{ minHeight: "360px" }}>
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 40% at 50% 100%, color-mix(in oklab, var(--green) 10%, transparent), transparent 70%)" }}
        />

        {stack.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Layers className="h-12 w-12 opacity-15" />
            <p className="text-sm">Stack is empty — push a value to begin</p>
          </div>
        ) : (
          <div className="relative flex flex-col-reverse items-center gap-2 p-6 pb-8">
            {/* Base label */}
            <div className="mt-2 flex w-[200px] items-center justify-center rounded-lg border border-dashed border-border py-1.5">
              <span className="font-mono text-xs text-muted-foreground">— base —</span>
            </div>

            <AnimatePresence>
              {stack.map((item, i) => {
                const isTop = i === stack.length - 1;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 40, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.8 }}
                    transition={{ type: "spring", damping: 22, stiffness: 300 }}
                    className="flex items-center gap-2"
                  >
                    {isTop && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="font-mono text-xs font-semibold"
                        style={{ color: COLOR }}
                      >
                        ← TOP
                      </motion.span>
                    )}
                    <div
                      className="flex h-12 w-[200px] items-center justify-center rounded-xl border-2 font-mono font-bold transition-all duration-300"
                      style={{
                        borderColor: highlighted === item.id ? COLOR : isTop ? `color-mix(in oklab, ${COLOR} 50%, var(--border))` : "var(--border)",
                        background: highlighted === item.id
                          ? `color-mix(in oklab, ${COLOR} 15%, var(--surface-2))`
                          : isTop
                            ? `color-mix(in oklab, ${COLOR} 6%, var(--surface-2))`
                            : "var(--surface-2)",
                        boxShadow: highlighted === item.id
                          ? `0 0 20px color-mix(in oklab, ${COLOR} 40%, transparent)`
                          : "none",
                      }}
                    >
                      {item.value}
                    </div>
                    {!isTop && <span className="w-14" />}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {log && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5">
          <span className="font-mono text-xs text-muted-foreground">// </span>
          <span className="font-mono text-sm text-[color:var(--green)]">{log}</span>
        </motion.div>
      )}
    </div>
  );
}
