import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  Loader2,
  Brain,
  Code2,
  ListChecks,
  Clock,
  Layers,
  BookmarkPlus,
} from "lucide-react";
import { solveFromImage } from "@/lib/solverFn";
import type { AISolution } from "@/lib/gemini";
import { useGalleryStore } from "@/store/galleryStore";
import { useProfileStore } from "@/store/profileStore";
import { compressImage } from "@/lib/imageUtils";

// ─── difficulty badge colours ────────────────────────────────────────────────
const diffColor = {
  Easy: "var(--green)",
  Medium: "var(--amber)",
  Hard: "var(--red)",
} as const;

// ─── tiny copy-button ─────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground"
    >
      {done ? (
        <><Check className="h-3.5 w-3.5 text-[color:var(--green)]" /> Copied</>
      ) : (
        <><Copy className="h-3.5 w-3.5" /> Copy</>
      )}
    </button>
  );
}

// ─── solution view ────────────────────────────────────────────────────────────
function SolutionPanel({
  sol,
  topicSlug,
  imageData,
  onClose,
}: {
  sol: AISolution;
  topicSlug: string;
  imageData: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"approach" | "js" | "py">("approach");
  const activeId = useProfileStore((s) => s.activeId);
  const [saved, setSaved] = useState(false);

  const saveToGallery = async () => {
    if (!activeId) return;
    try {
      const compressed = await compressImage(imageData);
      useGalleryStore.getState().add(activeId, {
        topicSlug,
        data: compressed,
        caption: sol.title,
        difficulty: sol.difficulty,
      });
      setSaved(true);
    } catch {
      alert("Storage full — delete some images first.");
    }
  };

  const diffC = diffColor[sol.difficulty] ?? "var(--cyan)";

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold leading-tight">{sol.title}</h3>
          <span
            className="mt-1 inline-block rounded-full px-2.5 py-0.5 font-mono text-xs font-medium"
            style={{
              color: diffC,
              background: `color-mix(in oklab, ${diffC} 15%, transparent)`,
            }}
          >
            {sol.difficulty}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          <div className="rounded-xl border border-border bg-[color:var(--surface-2)] px-3 py-2 text-center">
            <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Time
            </div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-[color:var(--cyan)]">
              {sol.timeComplexity}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-[color:var(--surface-2)] px-3 py-2 text-center">
            <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Layers className="h-3 w-3" /> Space
            </div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-[color:var(--cyan)]">
              {sol.spaceComplexity}
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-border bg-[color:var(--surface-2)] p-1">
        {(
          [
            { id: "approach", label: "Approach", icon: Brain },
            { id: "js", label: "JavaScript", icon: Code2 },
            { id: "py", label: "Python", icon: Code2 },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
              tab === id
                ? "bg-[color:var(--surface)] font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "approach" && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {sol.approach}
              </p>
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5" /> Algorithm Steps
                </div>
                <ol className="space-y-2">
                  {sol.algorithm.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--cyan)]/15 font-mono text-[10px] font-semibold text-[color:var(--cyan)]">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {(tab === "js" || tab === "py") && (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center justify-between border-b border-border bg-[color:var(--surface-2)] px-3 py-1.5">
                <span className="font-mono text-xs text-muted-foreground">
                  {tab === "js" ? "solution.js" : "solution.py"}
                </span>
                <CopyBtn text={tab === "js" ? sol.jsCode : sol.pyCode} />
              </div>
              <pre className="max-h-72 overflow-auto p-4 font-mono text-xs leading-relaxed text-foreground">
                <code>{tab === "js" ? sol.jsCode : sol.pyCode}</code>
              </pre>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Save to gallery */}
      <button
        onClick={saveToGallery}
        disabled={saved}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--cyan)]/40 bg-[color:var(--cyan)]/10 px-4 py-2.5 text-sm font-medium text-[color:var(--cyan)] transition hover:bg-[color:var(--cyan)]/20 disabled:opacity-60"
      >
        {saved ? (
          <><Check className="h-4 w-4 text-[color:var(--green)]" /> Saved to Gallery</>
        ) : (
          <><BookmarkPlus className="h-4 w-4" /> Save to Gallery</>
        )}
      </button>
    </div>
  );
}

// ─── thinking animation ───────────────────────────────────────────────────────
const THINKING_MSGS = [
  "Reading the problem…",
  "Identifying the approach…",
  "Selecting optimal algorithm…",
  "Writing the solution…",
  "Analysing complexity…",
];

function ThinkingState() {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % THINKING_MSGS.length),
      1200,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[color:var(--cyan)]/30"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <Brain className="h-8 w-8 text-[color:var(--cyan)]" />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="font-mono text-sm text-[color:var(--cyan)]"
        >
          {THINKING_MSGS[msgIdx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ─── main modal ───────────────────────────────────────────────────────────────
export function AISolverModal({
  topicSlug,
  topicName,
  onClose,
}: {
  topicSlug: string;
  topicName: string;
  onClose: () => void;
}) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState<"idle" | "solving" | "done" | "error">(
    "idle",
  );
  const [solution, setSolution] = useState<AISolution | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageData(e.target?.result as string);
      setSolution(null);
      setStatus("idle");
    };
    reader.readAsDataURL(file);
  };

  const solve = async () => {
    if (!imageData) return;
    setStatus("solving");
    setSolution(null);
    setErrorMsg("");
    try {
      const result = await solveFromImage({ data: { imageBase64: imageData, mimeType } });
      if ("error" in result && result.error) {
        setErrorMsg(result.error);
        setStatus("error");
      } else {
        setSolution(result as AISolution);
        setStatus("done");
      }
    } catch (e) {
      setErrorMsg(
        e instanceof Error ? e.message : "Unexpected error. Please try again.",
      );
      setStatus("error");
    }
  };

  const reset = () => {
    setImageData(null);
    setSolution(null);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="relative flex w-full max-w-2xl flex-col rounded-2xl border border-border-strong bg-[color:var(--surface)] shadow-2xl"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--cyan)]/15 text-[color:var(--cyan)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">AI Problem Solver</h2>
            <p className="font-mono text-xs text-muted-foreground">
              // {topicName} · powered by Gemini Flash
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg border border-border p-1.5 text-muted-foreground transition hover:border-border-strong hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Upload zone — always visible at top */}
          {status !== "solving" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-5 text-center transition ${
                drag
                  ? "border-[color:var(--cyan)] bg-[color:var(--cyan)]/5"
                  : imageData
                    ? "border-[color:var(--cyan)]/50 bg-[color:var(--surface-2)]"
                    : "border-border-strong bg-[color:var(--surface-2)] hover:border-[color:var(--cyan)]/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {imageData ? (
                <div className="relative">
                  <img
                    src={imageData}
                    alt="Problem screenshot"
                    className="mx-auto max-h-56 rounded-lg object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition hover:opacity-100">
                    <p className="text-sm text-white">Click to change image</p>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drop a screenshot here or{" "}
                    <span className="text-[color:var(--cyan)]">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, WEBP · up to 10 MB · or use camera on mobile
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Thinking animation */}
          {status === "solving" && <ThinkingState />}

          {/* Error state */}
          {status === "error" && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[color:var(--red)]/40 bg-[color:var(--red)]/8 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--red)]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[color:var(--red)]">
                  Solver error
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{errorMsg}</p>
                <button
                  onClick={reset}
                  className="mt-3 text-xs text-[color:var(--cyan)] underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Solution */}
          {status === "done" && solution && (
            <div className="mt-4">
              {/* Divider */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-1 font-mono text-xs text-[color:var(--cyan)]">
                  <Sparkles className="h-3 w-3" /> Solution
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <SolutionPanel
                sol={solution}
                topicSlug={topicSlug}
                imageData={imageData!}
                onClose={onClose}
              />
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        {status !== "solving" && (
          <div className="flex items-center gap-2 border-t border-border px-6 py-4">
            {status === "done" && (
              <button
                onClick={reset}
                className="rounded-xl border border-border px-4 py-2.5 text-sm transition hover:border-border-strong"
              >
                ← New problem
              </button>
            )}
            <button
              onClick={solve}
              disabled={!imageData || status === "solving"}
              className="ml-auto flex items-center gap-2 rounded-xl bg-[color:var(--cyan)] px-5 py-2.5 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "solving" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Solving…</>
              ) : status === "done" ? (
                <><Sparkles className="h-4 w-4" /> Re-solve</>
              ) : (
                <>Solve with AI <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── trigger button (used on topic pages) ────────────────────────────────────
export function AISolverButton({
  topicSlug,
  topicName,
}: {
  topicSlug: string;
  topicName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        id={`ai-solver-${topicSlug}`}
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-xl border border-[color:var(--cyan)]/30 bg-gradient-to-r from-[color:var(--cyan)]/10 to-[color:var(--purple)]/10 px-4 py-2.5 text-sm font-semibold text-[color:var(--cyan)] transition hover:border-[color:var(--cyan)]/60 hover:from-[color:var(--cyan)]/20 hover:to-[color:var(--purple)]/20"
      >
        <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
        Solve with AI
        <span className="rounded-full bg-[color:var(--cyan)]/20 px-1.5 py-0.5 font-mono text-[10px]">
          ✦ GEMINI
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <AISolverModal
            topicSlug={topicSlug}
            topicName={topicName}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
