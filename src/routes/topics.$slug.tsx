import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { getTopic, TOPICS, type Topic } from "@/data/topics";
import { Gallery } from "@/components/Gallery";
import { AISolverButton } from "@/components/AISolver";

export const Route = createFileRoute("/topics/$slug")({
  loader: ({ params }): { topic: Topic } => {
    const t = getTopic(params.slug);
    if (!t) throw notFound();
    return { topic: t };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.topic.name} — DSA Hub` : "Topic" },
      { name: "description", content: loaderData?.topic.tagline ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">Topic not found</h1>
      <Link to="/topics" className="mt-4 inline-block text-[color:var(--cyan)]">← Back to topics</Link>
    </main>
  ),
  component: TopicDetail,
});

function TopicDetail() {
  const data = Route.useLoaderData() as { topic: Topic };
  const topic = data.topic;
  const idx = TOPICS.findIndex((t) => t.slug === topic.slug);
  const next = TOPICS[(idx + 1) % TOPICS.length];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <Link to="/topics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All Topics
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="mt-6 flex flex-wrap items-start gap-4"
      >
        <div className="text-5xl">{topic.emoji}</div>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold md:text-4xl">{topic.name}</h1>
          <p className="font-mono text-sm text-muted-foreground">// {topic.category}</p>
          <p className="mt-2 text-muted-foreground">{topic.tagline}</p>
        </div>
        <div className="pt-1">
          <AISolverButton topicSlug={topic.slug} topicName={topic.name} />
        </div>
      </motion.div>

      <article className={`relative mt-8 overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)] p-6 md:p-8`}>
        <div className={`accent-bar-${topic.accent} absolute inset-x-0 top-0 h-[3px]`} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {topic.complexity.length > 0 && (
            <div>
              <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Complexity</h2>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-[color:var(--surface-2)] font-mono text-xs text-muted-foreground">
                      {topic.complexityHeader.map((h) => (
                        <th key={h} className="px-3 py-2 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topic.complexity.map((row) => (
                      <tr key={row.op} className="border-b border-border last:border-0">
                        <td className="px-3 py-2.5">{row.op}</td>
                        {row.values.map((v, i) => (
                          <td key={i} className="px-3 py-2.5 font-mono text-[color:var(--green)]">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">{topic.concepts.title}</h2>
            <ul className="space-y-2 rounded-xl border border-border bg-[color:var(--surface-2)] p-4 text-sm">
              {topic.concepts.items.map((it) => (
                <li key={it} className="flex gap-2 text-muted-foreground">
                  <span className="text-[color:var(--cyan)]">›</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {topic.algorithms && (
          <div className="mt-6">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Algorithms</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topic.algorithms.map((a) => (
                <div key={a.name} className="rounded-xl border border-border bg-[color:var(--surface-2)] p-4">
                  <div className="font-semibold">{a.name}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge label={a.best} kind="best" />
                    <Badge label={a.avg} kind="avg" />
                    <Badge label={a.worst} kind="worst" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topic.code && <CodeTabs js={topic.code.js} py={topic.code.py} />}

        <Gallery topicSlug={topic.slug} topicName={topic.name} />
      </article>

      <Link
        to="/topics/$slug" params={{ slug: next.slug }}
        className="mt-8 flex items-center justify-between rounded-2xl border border-border bg-[color:var(--surface)] p-5 transition hover:border-border-strong"
      >
        <div>
          <div className="font-mono text-xs text-muted-foreground">// next topic</div>
          <div className="mt-1 text-lg font-semibold">{next.emoji} {next.name}</div>
        </div>
        <span className="text-[color:var(--cyan)]">→</span>
      </Link>
    </main>
  );
}

function Badge({ label, kind }: { label: string; kind: "best" | "avg" | "worst" }) {
  const map = {
    best: { c: "var(--green)" },
    avg: { c: "var(--amber)" },
    worst: { c: "var(--red)" },
  } as const;
  const c = map[kind].c;
  return (
    <span
      className="rounded-full border px-2 py-0.5 font-mono text-[10px]"
      style={{ color: c, background: `color-mix(in oklab, ${c} 12%, transparent)`, borderColor: `color-mix(in oklab, ${c} 30%, transparent)` }}
    >
      {label}
    </span>
  );
}

function CodeTabs({ js, py }: { js: string; py: string }) {
  const [tab, setTab] = useState<"js" | "py">("js");
  const [copied, setCopied] = useState(false);
  const code = tab === "js" ? js : py;
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="mt-6">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Code</h2>
      <div className="overflow-hidden rounded-xl border border-border bg-[color:var(--surface-2)]">
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
          <div className="flex gap-1">
            {(["js", "py"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-2.5 py-1 font-mono text-xs transition ${tab === t ? "bg-[color:var(--surface)] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "js" ? "JavaScript" : "Python"}
              </button>
            ))}
          </div>
          <button onClick={copy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            {copied ? <><Check className="h-3.5 w-3.5 text-[color:var(--green)]" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
          </button>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground"><code>{code}</code></pre>
      </div>
    </div>
  );
}
