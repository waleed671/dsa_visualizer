import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Plus, Trash2, UserCircle2 } from "lucide-react";
import { useProfileStore } from "@/store/profileStore";

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { hydrated, hydrate, profiles, activeId } = useProfileStore();
  useEffect(() => { 
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  if (!hydrated) return null;
  if (activeId && profiles.some((p) => p.id === activeId)) return <>{children}</>;
  return <ProfileScreen />;
}

function ProfileScreen() {
  const { profiles, createProfile, signIn, deleteProfile } = useProfileStore();
  const [mode, setMode] = useState<"pick" | "new">(profiles.length === 0 ? "new" : "pick");
  const [selected, setSelected] = useState<string | null>(profiles[0]?.id ?? null);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl border border-border-strong glass p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--surface-2)] text-[color:var(--cyan)]">
            <UserCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Welcome to DSA Hub</h1>
            <p className="font-mono text-xs text-muted-foreground">// local profile · this device only</p>
          </div>
        </div>

        {mode === "pick" && profiles.length > 0 ? (
          <div className="space-y-3">
            <label className="font-mono text-xs text-muted-foreground">Select profile</label>
            <div className="space-y-2">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 rounded-lg border p-3 transition cursor-pointer ${
                    selected === p.id ? "border-[color:var(--cyan)] bg-[color:var(--surface-2)]" : "border-border hover:border-border-strong"
                  }`}
                  onClick={() => setSelected(p.id)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface-2)] text-sm font-semibold text-[color:var(--cyan)]">
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm">{p.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Delete profile "${p.name}" and its gallery?`)) deleteProfile(p.id); }}
                    className="text-muted-foreground hover:text-[color:var(--red)]"
                    aria-label="Delete profile"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(""); }}
              className="w-full rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-2 font-mono text-sm outline-none focus:border-[color:var(--cyan)]"
            />
            {error && <p className="text-xs text-[color:var(--red)]">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!selected) return;
                  if (!signIn(selected, pin)) setError("Incorrect PIN");
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[color:var(--cyan)] px-4 py-2.5 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-90"
              >
                <LogIn className="h-4 w-4" /> Sign In
              </button>
              <button
                onClick={() => { setMode("new"); setError(""); setName(""); setPin(""); }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm transition hover:border-border-strong"
              >
                <Plus className="h-4 w-4" /> New
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="font-mono text-xs text-muted-foreground">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="mt-1 w-full rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[color:var(--cyan)]"
              />
            </div>
            <div>
              <label className="font-mono text-xs text-muted-foreground">Choose a 4-digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="mt-1 w-full rounded-lg border border-border bg-[color:var(--surface-2)] px-3 py-2 font-mono text-sm outline-none focus:border-[color:var(--cyan)]"
              />
            </div>
            {error && <p className="text-xs text-[color:var(--red)]">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!name.trim()) return setError("Enter a name");
                  if (pin.length < 4) return setError("PIN must be 4+ digits");
                  createProfile(name, pin);
                }}
                className="flex-1 rounded-lg bg-[color:var(--cyan)] px-4 py-2.5 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-90"
              >
                Create Profile
              </button>
              {profiles.length > 0 && (
                <button
                  onClick={() => { setMode("pick"); setError(""); }}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm transition hover:border-border-strong"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        )}
        <p className="mt-5 font-mono text-[10px] leading-relaxed text-muted-foreground">
          // PIN is stored locally and is NOT real authentication. Anyone with access to your device may bypass it.
        </p>
      </motion.div>
    </div>
  );
}
