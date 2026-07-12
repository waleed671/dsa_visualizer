import { createFileRoute } from "@tanstack/react-router";
import { TOPICS } from "@/data/topics";

export const Route = createFileRoute("/cheatsheet")({
  head: () => ({
    meta: [
      { title: "Big-O Cheatsheet — DSA Hub" },
      { name: "description", content: "Quick reference of time and space complexities across data structures and algorithms." },
    ],
  }),
  component: Cheatsheet,
});

function Cheatsheet() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <header>
        <h1 className="text-3xl font-semibold md:text-4xl">Big-O Cheatsheet</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">// every operation, every structure, in one place</p>
      </header>

      <div className="mt-8 space-y-6">
        {TOPICS.map((t) => (
          <section key={t.slug} className="overflow-hidden rounded-2xl border border-border bg-[color:var(--surface)]">
            <div className={`accent-bar-${t.accent} h-[3px]`} />
            <div className="flex items-center gap-3 border-b border-border px-5 py-3">
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="font-mono text-xs text-muted-foreground">// {t.category}</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="bg-[color:var(--surface-2)] font-mono text-xs text-muted-foreground">
                    {(t.algorithms ? ["Algorithm", "Best", "Average", "Worst"] : t.complexityHeader).map((h) => (
                      <th key={h} className="px-4 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.algorithms
                    ? t.algorithms.map((a) => (
                        <tr key={a.name} className="border-b border-border last:border-0">
                          <td className="px-4 py-2.5">{a.name}</td>
                          <td className="px-4 py-2.5 font-mono text-[color:var(--green)]">{a.best}</td>
                          <td className="px-4 py-2.5 font-mono text-[color:var(--amber)]">{a.avg}</td>
                          <td className="px-4 py-2.5 font-mono text-[color:var(--red)]">{a.worst}</td>
                        </tr>
                      ))
                    : t.complexity.map((row) => (
                        <tr key={row.op} className="border-b border-border last:border-0">
                          <td className="px-4 py-2.5">{row.op}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="px-4 py-2.5 font-mono text-[color:var(--green)]">{v}</td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
