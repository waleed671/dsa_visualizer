import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeftRight, Layers, ArrowRightLeft, GitBranch, Share2, Triangle, BarChart2 } from "lucide-react";
import { LinkedListVisualizer } from "@/components/visualizer/LinkedList";
import { DoublyLinkedListVisualizer } from "@/components/visualizer/DoublyLinkedList";
import { StackVisualizer } from "@/components/visualizer/Stack";
import { QueueVisualizer } from "@/components/visualizer/Queue";
import { BSTVisualizer } from "@/components/visualizer/BST";
import { HeapVisualizer } from "@/components/visualizer/Heap";
import { SortingVisualizer } from "@/components/visualizer/Sorting";
import { GraphVisualizer } from "@/components/visualizer/Graph";

export const Route = createFileRoute("/visualizer")({
  head: () => ({
    meta: [
      { title: "DSA Visualizer — Interactive Playground" },
      { name: "description", content: "Visualize Linked Lists, Stacks, Queues, BST, Heap, Sorting and Graphs with interactive animations." },
    ],
  }),
  component: VisualizerPage,
});

const TABS = [
  { id: "linked-list",        label: "Linked List",        short: "LL",    icon: ArrowRight,     color: "var(--cyan)" },
  { id: "doubly-linked-list", label: "Doubly Linked List", short: "DLL",   icon: ArrowLeftRight, color: "var(--purple)" },
  { id: "stack",              label: "Stack",              short: "Stack", icon: Layers,         color: "var(--green)" },
  { id: "queue",              label: "Queue",              short: "Queue", icon: ArrowRightLeft, color: "var(--amber)" },
  { id: "bst",                label: "BST",                short: "BST",   icon: GitBranch,      color: "var(--pink)" },
  { id: "heap",               label: "Heap",               short: "Heap",  icon: Triangle,       color: "var(--red)" },
  { id: "sorting",            label: "Sorting",            short: "Sort",  icon: BarChart2,      color: "var(--cyan)" },
  { id: "graph",              label: "Graph",              short: "Graph", icon: Share2,         color: "var(--purple)" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function VisualizerPage() {
  const [activeTab, setActiveTab] = useState<TabId>("linked-list");
  const active = TABS.find(t => t.id === activeTab)!;

  return (
    <main className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-15" />
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 60% 80% at 50% 0%, color-mix(in oklab, ${active.color} 18%, transparent), transparent 70%)`,
            transition: "background 0.5s ease",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-0 pt-8 md:px-8">
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border"
              style={{ background: `color-mix(in oklab, ${active.color} 15%, var(--surface))` }}
            >
              <active.icon className="h-6 w-6" style={{ color: active.color }} />
            </div>
            <div>
              <h1 className="gradient-text text-3xl font-bold tracking-tight">DSA Visualizer</h1>
              <p className="font-mono text-xs text-muted-foreground">// interactive data structure playground</p>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-0.5 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2 whitespace-nowrap rounded-t-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="viz-tab-bg"
                      className="absolute inset-0 rounded-t-xl border-x border-t border-border bg-[color:var(--surface)]"
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon
                      className="h-4 w-4 transition-transform group-hover:scale-110"
                      style={isActive ? { color: tab.color } : {}}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.short}</span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="viz-tab-line"
                      className="absolute inset-x-0 top-0 h-0.5 rounded-b-full"
                      style={{ background: tab.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content panel */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === "linked-list"        && <LinkedListVisualizer />}
            {activeTab === "doubly-linked-list" && <DoublyLinkedListVisualizer />}
            {activeTab === "stack"              && <StackVisualizer />}
            {activeTab === "queue"              && <QueueVisualizer />}
            {activeTab === "bst"                && <BSTVisualizer />}
            {activeTab === "heap"               && <HeapVisualizer />}
            {activeTab === "sorting"            && <SortingVisualizer />}
            {activeTab === "graph"              && <GraphVisualizer />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
