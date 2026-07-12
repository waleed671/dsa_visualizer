import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { TOPICS } from "@/data/topics";

export const Route = createFileRoute("/topics/")({
  head: () => ({
    meta: [
      { title: "All Topics — DSA Research Hub" },
      { name: "description", content: "Browse all 8 data structure and algorithm topics with complexity references." },
    ],
  }),
  component: TopicsPage,
});

function TopicsPage() {
  const [q, setQ] = useState("");
  const filtered = TOPICS.filter(
    (t) => t.name.toLowerCase().includes(q.toLowerCase()) || t.tagline.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">All Topics</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">// {TOPICS.length} structures · 30+ algorithms</p>
        </div>
        <div className="relative max-w-sm md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search topics…"
            className="w-full rounded-xl border border-border bg-[color:var(--surface)] px-9 py-2.5 text-sm outline-none focus:border-[color:var(--cyan)]"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t, i) => (
          <motion.div
            key={t.slug}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          >
            <Link
              to="/topics/$slug" params={{ slug: t.slug }}
              className="group relative block overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)] p-6 transition hover:-translate-y-0.5 hover:border-border-strong"
            >
              <div className={`accent-bar-${t.accent} absolute inset-x-0 top-0 h-[3px]`} />
              <div className="flex items-start justify-between">
                <div className="text-4xl">{t.emoji}</div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">{t.category.replace(/_/g, " ")}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
              <div className="mt-5 flex items-center gap-1 text-sm text-[color:var(--cyan)]">
                Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No topics match "{q}"
          </div>
        )}
      </div>
    </main>
  );
}
