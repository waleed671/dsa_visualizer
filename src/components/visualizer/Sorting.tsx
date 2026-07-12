import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, Shuffle, Play, Pause, RotateCcw } from "lucide-react";

type BarState = "default" | "comparing" | "swapping" | "pivot" | "sorted";
type Bar = { value: number; state: BarState };
type SortType = "bubble" | "merge" | "quick";

const COLORS: Record<BarState, string> = {
  default: "var(--purple)",
  comparing: "var(--cyan)",
  swapping: "var(--amber)",
  pivot: "var(--red)",
  sorted: "var(--green)",
};

function randomArray(n = 20): Bar[] {
  return Array.from({ length: n }, () => ({
    value: Math.floor(Math.random() * 90) + 10,
    state: "default" as BarState,
  }));
}

// ── Sorting algorithms: collect steps ────────────────────────────────────────
type Step = { bars: Bar[] };

function bubbleSortSteps(arr: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // comparing
      const s1: Bar[] = a.map((v, k) => ({
        value: v,
        state: k === j || k === j + 1 ? "comparing" : k >= n - i ? "sorted" : "default",
      }));
      steps.push({ bars: s1 });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        const s2: Bar[] = a.map((v, k) => ({
          value: v,
          state: k === j || k === j + 1 ? "swapping" : k >= n - i ? "sorted" : "default",
        }));
        steps.push({ bars: s2 });
      }
    }
  }
  steps.push({ bars: a.map(v => ({ value: v, state: "sorted" })) });
  return steps;
}

function quickSortSteps(arr: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...arr];
  const sorted = new Set<number>();

  function partition(low: number, high: number): number {
    const pivot = a[high];
    const pivotIdx = high;
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({
        bars: a.map((v, k) => ({
          value: v,
          state: k === pivotIdx ? "pivot" : k === j ? "comparing" : sorted.has(k) ? "sorted" : "default",
        })),
      });
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({
          bars: a.map((v, k) => ({
            value: v,
            state: k === pivotIdx ? "pivot" : k === i || k === j ? "swapping" : sorted.has(k) ? "sorted" : "default",
          })),
        });
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    sorted.add(i + 1);
    return i + 1;
  }

  function qs(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      qs(low, pi - 1);
      qs(pi + 1, high);
    } else if (low >= 0 && high >= 0 && low <= high) {
      sorted.add(low);
    }
  }

  qs(0, a.length - 1);
  steps.push({ bars: a.map(v => ({ value: v, state: "sorted" })) });
  return steps;
}

function mergeSortSteps(arr: number[]): Step[] {
  const steps: Step[] = [];
  const a = [...arr];

  function merge(left: number, mid: number, right: number) {
    const L = a.slice(left, mid + 1);
    const R = a.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < L.length && j < R.length) {
      steps.push({
        bars: a.map((v, idx) => ({
          value: v,
          state: idx === left + i || idx === mid + 1 + j ? "comparing" : "default",
        })),
      });
      if (L[i] <= R[j]) a[k++] = L[i++];
      else a[k++] = R[j++];
      steps.push({
        bars: a.map((v, idx) => ({
          value: v,
          state: idx === k - 1 ? "swapping" : "default",
        })),
      });
    }
    while (i < L.length) { a[k++] = L[i++]; }
    while (j < R.length) { a[k++] = R[j++]; }
  }

  function ms(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    ms(left, mid);
    ms(mid + 1, right);
    merge(left, mid, right);
  }

  ms(0, a.length - 1);
  steps.push({ bars: a.map(v => ({ value: v, state: "sorted" })) });
  return steps;
}

// ── main component ────────────────────────────────────────────────────────────
export function SortingVisualizer() {
  const [bars, setBars] = useState<Bar[]>(randomArray);
  const [sortType, setSortType] = useState<SortType>("bubble");
  const [sorting, setSorting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(60); // ms per step
  const [customInput, setCustomInput] = useState("");
  const pausedRef = useRef(false);
  const cancelRef = useRef(false);

  const reset = () => {
    cancelRef.current = true;
    pausedRef.current = false;
    setSorting(false);
    setPaused(false);
    setBars(b => b.map(bar => ({ ...bar, state: "default" })));
  };

  const randomize = () => {
    cancelRef.current = true;
    setSorting(false);
    setPaused(false);
    setBars(randomArray());
  };

  const applyCustom = () => {
    const vals = customInput.split(/[\s,]+/).map(Number).filter(v => !isNaN(v) && v > 0 && v <= 200);
    if (!vals.length) return;
    setBars(vals.map(v => ({ value: v, state: "default" })));
    setCustomInput("");
  };

  const sort = async () => {
    if (sorting) return;
    cancelRef.current = false;
    pausedRef.current = false;
    setSorting(true);
    setPaused(false);

    const values = bars.map(b => b.value);
    const steps =
      sortType === "bubble" ? bubbleSortSteps(values)
      : sortType === "quick" ? quickSortSteps(values)
      : mergeSortSteps(values);

    for (const step of steps) {
      if (cancelRef.current) break;
      while (pausedRef.current) {
        await new Promise(r => setTimeout(r, 100));
        if (cancelRef.current) break;
      }
      if (cancelRef.current) break;
      setBars(step.bars);
      await new Promise(r => setTimeout(r, speed));
    }
    setSorting(false);
    setPaused(false);
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(p => !p);
  };

  const maxVal = Math.max(...bars.map(b => b.value));

  const SubTab = ({ type, label }: { type: SortType; label: string }) => (
    <button
      onClick={() => { reset(); setSortType(type); }}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        sortType === type
          ? "bg-[color:var(--cyan)]/15 text-[color:var(--cyan)] border border-[color:var(--cyan)]/40"
          : "text-muted-foreground hover:text-foreground"
      }`}>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        <SubTab type="bubble" label="Bubble Sort" />
        <SubTab type="merge" label="Merge Sort" />
        <SubTab type="quick" label="Quick Sort" />
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-border bg-[color:var(--surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input value={customInput} onChange={e => setCustomInput(e.target.value)}
            placeholder="Custom: 40,70,25…"
            className="w-40 rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--cyan)]" />
          <button onClick={applyCustom} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-[color:var(--cyan)]/50 hover:text-[color:var(--cyan)]">Apply</button>
          <button onClick={randomize} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-[color:var(--cyan)]/50 hover:text-[color:var(--cyan)]">
            <Shuffle className="h-3.5 w-3.5" /> Randomize
          </button>
          <div className="h-5 w-px bg-border" />
          <button onClick={sort} disabled={sorting}
            className="flex items-center gap-1.5 rounded-lg bg-[color:var(--cyan)] px-4 py-1.5 text-xs font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-90 disabled:opacity-40">
            <Play className="h-3.5 w-3.5" /> Sort
          </button>
          {sorting && (
            <button onClick={togglePause}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                paused ? "border-[color:var(--cyan)]/50 text-[color:var(--cyan)]" : "border-border"
              }`}>
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {paused ? "Resume" : "Pause"}
            </button>
          )}
          <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-border-strong">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <div className="flex items-center gap-2 ml-2">
            <span className="font-mono text-xs text-muted-foreground">Speed</span>
            <input type="range" min={10} max={300} value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-24 accent-[color:var(--cyan)]" />
            <span className="font-mono text-xs text-muted-foreground">{speed}ms</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3">
          {(Object.entries(COLORS) as [BarState, string][]).map(([state, color]) => (
            <div key={state} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm" style={{ background: color }} />
              <span className="font-mono text-xs capitalize text-muted-foreground">{state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart canvas */}
      <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)]">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="relative flex h-[320px] items-end gap-0.5 px-4 pb-4 pt-4">
          {bars.map((bar, i) => (
            <motion.div
              key={i}
              layout
              style={{
                height: `${(bar.value / maxVal) * 100}%`,
                background: COLORS[bar.state],
                flex: 1,
                borderRadius: "4px 4px 0 0",
                boxShadow: bar.state !== "default"
                  ? `0 0 10px color-mix(in oklab, ${COLORS[bar.state]} 50%, transparent)`
                  : "none",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
              title={String(bar.value)}
            />
          ))}
        </div>
      </div>

      {/* Bar count + state */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-[color:var(--surface)] px-4 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">
          // {bars.length} elements · algorithm: {sortType} sort
        </span>
        {sorting && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-[color:var(--cyan)]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[color:var(--cyan)]" />
            {paused ? "Paused" : "Sorting…"}
          </span>
        )}
      </div>
    </div>
  );
}
