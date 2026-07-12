import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Trash2, Upload, UserCircle2, Pencil, Check } from "lucide-react";
import { useActiveProfile, useProfileStore } from "@/store/profileStore";
import { useGalleryStore } from "@/store/galleryStore";
import { storageUsageKB } from "@/lib/storage";
import type { GalleryItem } from "@/types/api";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — DSA Hub" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const profile = useActiveProfile();
  const updateName = useProfileStore((s) => s.updateName);
  const { items, importItems, clear } = useGalleryStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  if (!profile) return null;

  const startEdit = () => {
    setNameInput(profile.name);
    setEditingName(true);
  };
  const commitEdit = () => {
    updateName(nameInput);
    setEditingName(false);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile: profile.name, items }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dsa-hub-${profile.name}-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.items)) throw new Error("Invalid file");
      importItems(profile.id, parsed.items as GalleryItem[]);
      alert(`Imported ${parsed.items.length} items.`);
    } catch (e) {
      alert("Import failed: " + (e instanceof Error ? e.message : "unknown error"));
    }
  };

  const usage = storageUsageKB();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--surface-2)] text-[color:var(--cyan)]">
          <UserCircle2 className="h-8 w-8" />
        </div>
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                className="rounded-lg border border-[color:var(--cyan)] bg-[color:var(--surface-2)] px-3 py-1.5 text-xl font-semibold outline-none"
              />
              <button onClick={commitEdit} className="rounded-lg bg-[color:var(--cyan)]/15 p-2 text-[color:var(--cyan)] hover:bg-[color:var(--cyan)]/25">
                <Check className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{profile.name}</h1>
              <button onClick={startEdit} className="rounded-lg p-1.5 text-muted-foreground hover:text-[color:var(--cyan)]" aria-label="Edit name">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="font-mono text-xs text-muted-foreground">// local profile · {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Saved questions" value={items.length} />
        <Stat label="Storage used" value={`${usage} KB`} />
        <Stat label="Topics with images" value={new Set(items.map((i) => i.topicSlug)).size} />
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-[color:var(--surface)] p-6">
        <h2 className="text-lg font-semibold">Backup &amp; restore</h2>
        <p className="mt-1 text-sm text-muted-foreground">Export your gallery as JSON or import a previous backup.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={exportData} className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--cyan)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)]">
            <Download className="h-4 w-4" /> Export JSON
          </button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:border-border-strong">
            <Upload className="h-4 w-4" /> Import JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[color:var(--red)]/30 bg-[color:var(--red)]/5 p-6">
        <h2 className="text-lg font-semibold text-[color:var(--red)]">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">Permanently delete every saved image for this profile.</p>
        <button
          onClick={() => { if (confirm("Delete ALL saved images for this profile?")) clear(profile.id); }}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[color:var(--red)]/40 bg-[color:var(--red)]/10 px-4 py-2 text-sm font-semibold text-[color:var(--red)]"
        >
          <Trash2 className="h-4 w-4" /> Clear all images
        </button>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-[color:var(--surface)] p-4">
      <div className="font-mono text-3xl font-bold text-[color:var(--cyan)]">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
