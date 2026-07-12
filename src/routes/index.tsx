import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Image as ImageIcon } from "lucide-react";
import { TOPICS } from "@/data/topics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSA Research Hub — Data Structures & Algorithms Reference" },
      { name: "description", content: "Interactive DSA reference: complexity tables, algorithms and a personal question gallery." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 text-center md:px-8 md:pt-28 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-[color:var(--cyan)]/30 bg-[color:var(--cyan)]/10 px-4 py-1.5 font-mono text-xs text-[color:var(--cyan)]"
          >
            <span className="blink h-1.5 w-1.5 rounded-full bg-[color:var(--green)]" />
            Interactive DSA Reference
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            Data Structures<br />
            <span className="gradient-text">& Algorithms</span><br />
            Research Hub
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Complete reference for Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Heaps, Sorting & Searching — with a personal question gallery for every topic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/topics" className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cyan)] px-5 py-3 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-90">
              Explore Topics <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/cheatsheet" className="inline-flex items-center gap-2 rounded-xl border border-border-strong px-5 py-3 text-sm font-medium hover:bg-[color:var(--surface-2)]">
              <Sparkles className="h-4 w-4" /> Big-O Cheatsheet
            </Link>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6">
            {[
              { num: "8", label: "Topics" },
              { num: "30+", label: "Algorithms" },
              { num: "∞", label: "Saved Questions" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-[color:var(--surface)]/40 p-4">
                <div className="font-mono text-3xl font-bold text-[color:var(--cyan)]">{s.num}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">All Topics</h2>
            <p className="font-mono text-sm text-muted-foreground">// pick a structure to dive in</p>
          </div>
          <Link to="/topics" className="text-sm text-[color:var(--cyan)] hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((t, i) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to="/topics/$slug" params={{ slug: t.slug }}
                className="group relative block overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-border-strong"
              >
                <div className={`accent-bar-${t.accent} absolute inset-x-0 top-0 h-[3px]`} />
                <div className="text-3xl">{t.emoji}</div>
                <div className="mt-3 text-base font-semibold">{t.name}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">// {t.category}</div>
                <div className="mt-4 flex items-center gap-1 text-xs text-[color:var(--cyan)] opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: BookOpen, title: "Complete reference", body: "Time/space complexities, algorithms, code snippets in JS & Python." },
            { icon: ImageIcon, title: "Question gallery", body: "Save screenshots of practice questions per topic with notes & difficulty." },
            { icon: Sparkles, title: "100% local", body: "No backend. Your data lives in your browser, private to your profile." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-[color:var(--surface)] p-5">
              <f.icon className="h-5 w-5 text-[color:var(--cyan)]" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
