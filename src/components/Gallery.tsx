import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash2, X, Upload } from "lucide-react";
import { useGalleryStore, useTopicGallery } from "@/store/galleryStore";
import { useProfileStore } from "@/store/profileStore";
import { compressImage } from "@/lib/imageUtils";
import type { GalleryItem } from "@/types/api";

const DIFFICULTIES: GalleryItem["difficulty"][] = ["Easy", "Medium", "Hard"];
const diffColor: Record<GalleryItem["difficulty"], string> = {
  Easy: "var(--green)",
  Medium: "var(--amber)",
  Hard: "var(--red)",
};

export function Gallery({ topicSlug, topicName }: { topicSlug: string; topicName: string }) {
  const activeId = useProfileStore((s) => s.activeId);
  const loadedFor = useGalleryStore((s) => s.loadedFor);
  const items = useTopicGallery(topicSlug);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (activeId && loadedFor !== activeId) {
      useGalleryStore.getState().load(activeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, loadedFor]);

  // Wait until profile is hydrated
  if (!activeId) return null;

  const handleRemove = (itemId: string) => {
    if (confirm("Delete this image?")) {
      useGalleryStore.getState().remove(activeId, itemId);
    }
  };

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          📸 Your Question Images
        </div>
        <div className="h-px flex-1 bg-border" />
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--cyan)]/40 bg-[color:var(--cyan)]/10 px-3 py-1.5 text-xs font-medium text-[color:var(--cyan)] transition hover:bg-[color:var(--cyan)]/20"
        >
          <ImagePlus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No images yet. Click <span className="text-[color:var(--cyan)]">Add</span> to upload a question screenshot.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-border bg-[color:var(--surface-2)] transition hover:border-[color:var(--cyan)]"
              onClick={() => setLightbox(item)}
            >
              <img src={item.data} alt={item.caption || topicName} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/85 to-transparent p-2">
                <span className="truncate text-xs text-foreground">{item.caption || "Untitled"}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 font-mono text-[10px]"
                  style={{ background: `color-mix(in oklab, ${diffColor[item.difficulty]} 18%, transparent)`, color: diffColor[item.difficulty] }}
                >
                  {item.difficulty[0]}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                className="absolute right-1.5 top-1.5 hidden rounded-full bg-black/70 p-1.5 text-[color:var(--red)] group-hover:block"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {uploadOpen && (
          <UploadModal
            topicSlug={topicSlug}
            topicName={topicName}
            profileId={activeId}
            onClose={() => setUploadOpen(false)}
          />
        )}
        {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </section>
  );
}

function UploadModal({
  topicSlug, topicName, profileId, onClose,
}: { topicSlug: string; topicName: string; profileId: string; onClose: () => void }) {
  const [data, setData] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [difficulty, setDifficulty] = useState<GalleryItem["difficulty"]>("Medium");
  const [drag, setDrag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      try {
        const compressed = await compressImage(raw);
        setData(compressed);
      } catch {
        setData(raw); // fallback to original if compression fails
      }
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!data || saving) return;
    setSaving(true);
    try {
      useGalleryStore.getState().add(profileId, { topicSlug, data, caption: caption.trim(), difficulty });
      onClose();
    } catch {
      alert("Storage is full. Delete some images and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="relative w-full max-w-lg rounded-2xl border border-border-strong bg-[color:var(--surface)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-3 top-3 rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-lg font-semibold">Upload Question Image</h3>
        <p className="font-mono text-xs text-[color:var(--cyan)]">// {topicName}</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault(); setDrag(false);
            const f = e.dataTransfer.files[0]; if (f) handleFile(f);
          }}
          onClick={() => setInputKey((k) => k + 1)}
          className={`mt-4 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${drag ? "border-[color:var(--cyan)] bg-[color:var(--cyan)]/5" : "border-border-strong bg-[color:var(--surface-2)]"}`}
        >
          <input
            key={inputKey}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            ref={(el) => {
              if (el && inputKey > 0) el.click();
            }}
          />
          {data ? (
            <img src={data} alt="preview" className="mx-auto max-h-48 rounded-lg" />
          ) : (
            <>
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag & drop or <span className="text-[color:var(--cyan)]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP — auto-compressed before saving</p>
            </>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="font-mono text-xs text-muted-foreground">Caption (optional)</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. LeetCode 121 — Best time to buy stock"
              className="mt-1 w-full rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[color:var(--cyan)]"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-muted-foreground">Difficulty</label>
            <div className="mt-1 flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                    difficulty === d ? "border-[color:var(--cyan)] bg-[color:var(--cyan)]/10" : "border-border hover:border-border-strong"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:border-border-strong">Cancel</button>
          <button
            onClick={save} disabled={!data || saving}
            className="flex-1 rounded-lg bg-[color:var(--cyan)] px-4 py-2.5 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save Question"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute right-4 top-4 rounded-lg border border-border bg-[color:var(--surface)] p-2" aria-label="Close">
        <X className="h-5 w-5" />
      </button>
      <div className="max-w-5xl">
        <img src={item.data} alt={item.caption} className="max-h-[80vh] rounded-xl border border-border-strong" />
        {item.caption && <p className="mt-3 text-center text-sm text-muted-foreground">{item.caption}</p>}
      </div>
    </motion.div>
  );
}
