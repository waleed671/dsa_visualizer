import { Link } from "@tanstack/react-router";
import { Database, LayoutGrid, ListChecks, UserCircle2, FlaskConical } from "lucide-react";

type LinkItem = {
  to: "/" | "/topics" | "/cheatsheet" | "/profile" | "/visualizer";
  label: string;
  end?: boolean;
  icon?: typeof LayoutGrid;
};

const links: LinkItem[] = [
  { to: "/", label: "Home", end: true },
  { to: "/topics", label: "Topics", icon: LayoutGrid },
  { to: "/cheatsheet", label: "Cheatsheet", icon: ListChecks },
  { to: "/visualizer", label: "Visualizer", icon: FlaskConical },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 font-mono text-sm font-bold">
          <Database className="h-5 w-5 text-[color:var(--cyan)]" />
          <span className="text-[color:var(--cyan)]">&lt;DSA</span>
          <span className="text-foreground">Hub</span>
          <span className="text-[color:var(--cyan)]">/&gt;</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={l.end ? { exact: true } : undefined}
              activeProps={{
                className:
                  "text-foreground bg-[color:var(--surface-2)] border-border-strong",
              }}
              className="flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground hover:bg-[color:var(--surface-2)]"
            >
              {l.icon ? <l.icon className="h-4 w-4" /> : null}
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
