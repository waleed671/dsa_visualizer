export type Complexity = { op: string; values: string[] };
export type Algorithm = { name: string; best: string; avg: string; worst: string; space?: string };

export type Topic = {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  accent: "cyan" | "purple" | "green" | "amber" | "pink";
  category: string;
  complexityHeader: string[];
  complexity: Complexity[];
  concepts: { title: string; items: string[] };
  algorithms?: Algorithm[];
  code?: { js: string; py: string };
};

export const TOPICS: Topic[] = [
  {
    slug: "arrays",
    name: "Arrays",
    emoji: "📦",
    tagline: "Contiguous memory · O(1) random access",
    accent: "cyan",
    category: "linear_data_structure",
    complexityHeader: ["Operation", "Time", "Space"],
    complexity: [
      { op: "Access", values: ["O(1)", "O(1)"] },
      { op: "Search", values: ["O(n)", "O(1)"] },
      { op: "Insert (end)", values: ["O(1)*", "O(1)"] },
      { op: "Insert (middle)", values: ["O(n)", "O(1)"] },
      { op: "Delete", values: ["O(n)", "O(1)"] },
    ],
    concepts: {
      title: "Key Concepts",
      items: [
        "1D, 2D & multi-dimensional arrays",
        "Static vs Dynamic arrays",
        "Row-major vs Column-major order",
        "Sliding window technique",
        "Two pointer approach",
        "Prefix sum optimization",
      ],
    },
    code: {
      js: `// Two pointers — pair sum on sorted array
function pairSum(arr, target) {
  let l = 0, r = arr.length - 1;
  while (l < r) {
    const sum = arr[l] + arr[r];
    if (sum === target) return [l, r];
    sum < target ? l++ : r--;
  }
  return null;
}`,
      py: `# Sliding window — max sum subarray of size k
def max_sum(arr, k):
    s = sum(arr[:k]); best = s
    for i in range(k, len(arr)):
        s += arr[i] - arr[i - k]
        best = max(best, s)
    return best`,
    },
  },
  {
    slug: "linked-lists",
    name: "Linked Lists",
    emoji: "🔗",
    tagline: "Nodes connected via pointers",
    accent: "purple",
    category: "node_pointer_structure",
    complexityHeader: ["Operation", "Singly", "Doubly"],
    complexity: [
      { op: "Access", values: ["O(n)", "O(n)"] },
      { op: "Search", values: ["O(n)", "O(n)"] },
      { op: "Insert (head)", values: ["O(1)", "O(1)"] },
      { op: "Insert (tail)", values: ["O(n)", "O(1)"] },
      { op: "Delete", values: ["O(n)", "O(n)"] },
    ],
    concepts: {
      title: "Types & Techniques",
      items: [
        "Singly Linked List",
        "Doubly Linked List",
        "Circular Linked List",
        "Floyd's cycle detection",
        "Fast & slow pointers",
        "Reversing a linked list",
      ],
    },
    code: {
      js: `// Reverse a singly linked list
function reverse(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
      py: `# Floyd's cycle detection
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast: return True
    return False`,
    },
  },
  {
    slug: "stacks-queues",
    name: "Stacks & Queues",
    emoji: "📚",
    tagline: "LIFO and FIFO building blocks",
    accent: "green",
    category: "lifo_and_fifo",
    complexityHeader: ["Operation", "Stack", "Queue"],
    complexity: [
      { op: "Push / Enqueue", values: ["O(1)", "O(1)"] },
      { op: "Pop / Dequeue", values: ["O(1)", "O(1)"] },
      { op: "Peek / Front", values: ["O(1)", "O(1)"] },
      { op: "Search", values: ["O(n)", "O(n)"] },
    ],
    concepts: {
      title: "Common Patterns",
      items: [
        "Balanced parentheses (stack)",
        "Infix → Postfix conversion",
        "Min-stack in O(1)",
        "Circular queue with mod arithmetic",
        "Deque (double-ended)",
        "Priority queue via heap",
      ],
    },
    code: {
      js: `// Balanced parentheses
function isBalanced(s) {
  const map = { ')': '(', ']': '[', '}': '{' };
  const st = [];
  for (const c of s) {
    if ('([{'.includes(c)) st.push(c);
    else if (st.pop() !== map[c]) return false;
  }
  return st.length === 0;
}`,
      py: `# Queue using two stacks
class Queue:
    def __init__(self): self.i, self.o = [], []
    def push(self, x): self.i.append(x)
    def pop(self):
        if not self.o:
            while self.i: self.o.append(self.i.pop())
        return self.o.pop()`,
    },
  },
  {
    slug: "trees",
    name: "Trees",
    emoji: "🌳",
    tagline: "Hierarchical node structures",
    accent: "green",
    category: "hierarchical_structure",
    complexityHeader: ["Operation", "BST Avg", "BST Worst"],
    complexity: [
      { op: "Search", values: ["O(log n)", "O(n)"] },
      { op: "Insert", values: ["O(log n)", "O(n)"] },
      { op: "Delete", values: ["O(log n)", "O(n)"] },
      { op: "Traversal", values: ["O(n)", "O(n)"] },
    ],
    concepts: {
      title: "Traversals & Variants",
      items: [
        "Inorder (L → Root → R)",
        "Preorder (Root → L → R)",
        "Postorder (L → R → Root)",
        "Level-order BFS",
        "AVL tree (self-balancing)",
        "Red-Black tree",
      ],
    },
    code: {
      js: `// Inorder traversal (recursive)
function inorder(node, out = []) {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
  return out;
}`,
      py: `# Level-order BFS
from collections import deque
def level_order(root):
    if not root: return []
    q, out = deque([root]), []
    while q:
        n = q.popleft(); out.append(n.val)
        if n.left: q.append(n.left)
        if n.right: q.append(n.right)
    return out`,
    },
  },
  {
    slug: "graphs",
    name: "Graphs",
    emoji: "🕸️",
    tagline: "Vertices connected by edges",
    accent: "purple",
    category: "vertices_and_edges",
    complexityHeader: ["Algorithm", "Time", "Space"],
    complexity: [
      { op: "BFS", values: ["O(V+E)", "O(V)"] },
      { op: "DFS", values: ["O(V+E)", "O(V)"] },
      { op: "Dijkstra", values: ["O(E log V)", "O(V)"] },
      { op: "Bellman-Ford", values: ["O(VE)", "O(V)"] },
      { op: "Floyd-Warshall", values: ["O(V³)", "O(V²)"] },
    ],
    concepts: {
      title: "Types & Concepts",
      items: [
        "Directed vs Undirected",
        "Weighted vs Unweighted",
        "Adjacency Matrix · O(V²)",
        "Adjacency List · O(V+E)",
        "Topological sort (DAG)",
        "Minimum Spanning Tree",
      ],
    },
    code: {
      js: `// BFS shortest path on unweighted graph
function bfs(g, src) {
  const dist = new Map([[src, 0]]);
  const q = [src];
  while (q.length) {
    const u = q.shift();
    for (const v of g[u] || []) {
      if (!dist.has(v)) { dist.set(v, dist.get(u) + 1); q.push(v); }
    }
  }
  return dist;
}`,
      py: `# DFS recursive
def dfs(g, u, seen=None):
    if seen is None: seen = set()
    seen.add(u)
    for v in g.get(u, []):
        if v not in seen: dfs(g, v, seen)
    return seen`,
    },
  },
  {
    slug: "heaps",
    name: "Heaps",
    emoji: "🏔️",
    tagline: "Priority queue · complete binary tree",
    accent: "amber",
    category: "priority_queue",
    complexityHeader: ["Operation", "Min/Max Heap"],
    complexity: [
      { op: "Find Min/Max", values: ["O(1)"] },
      { op: "Insert", values: ["O(log n)"] },
      { op: "Delete Min/Max", values: ["O(log n)"] },
      { op: "Build Heap", values: ["O(n)"] },
      { op: "Heap Sort", values: ["O(n log n)"] },
    ],
    concepts: {
      title: "Key Concepts",
      items: [
        "Min-Heap: parent ≤ children",
        "Max-Heap: parent ≥ children",
        "Heapify Up (sift-up)",
        "Heapify Down (sift-down)",
        "K-largest / K-smallest elements",
        "Merge K sorted lists",
      ],
    },
    code: {
      js: `// K largest elements using min-heap (conceptual)
function kLargest(arr, k) {
  const heap = []; // min-heap of size k
  for (const x of arr) {
    if (heap.length < k) heap.push(x);
    else if (x > heap[0]) heap[0] = x;
    heap.sort((a, b) => a - b); // simplified
  }
  return heap;
}`,
      py: `import heapq
def k_largest(arr, k):
    return heapq.nlargest(k, arr)`,
    },
  },
  {
    slug: "sorting",
    name: "Sorting",
    emoji: "⚡",
    tagline: "Arranging elements in order",
    accent: "cyan",
    category: "comparison_based_sorting",
    complexityHeader: ["Algorithm", "Best", "Average", "Worst"],
    complexity: [],
    algorithms: [
      { name: "Bubble Sort", best: "Ω(n)", avg: "Θ(n²)", worst: "O(n²)" },
      { name: "Selection Sort", best: "Ω(n²)", avg: "Θ(n²)", worst: "O(n²)" },
      { name: "Insertion Sort", best: "Ω(n)", avg: "Θ(n²)", worst: "O(n²)" },
      { name: "Merge Sort", best: "Ω(n log n)", avg: "Θ(n log n)", worst: "O(n log n)" },
      { name: "Quick Sort", best: "Ω(n log n)", avg: "Θ(n log n)", worst: "O(n²)" },
      { name: "Heap Sort", best: "Ω(n log n)", avg: "Θ(n log n)", worst: "O(n log n)" },
      { name: "Counting Sort", best: "Ω(n+k)", avg: "Θ(n+k)", worst: "O(n+k)" },
      { name: "Radix Sort", best: "Ω(nk)", avg: "Θ(nk)", worst: "O(nk)" },
    ],
    concepts: {
      title: "When to Use",
      items: [
        "Quick Sort — general purpose, in-place",
        "Merge Sort — stable, predictable n log n",
        "Heap Sort — guaranteed n log n, in-place",
        "Counting/Radix — small integer ranges",
        "Insertion — tiny or nearly sorted arrays",
        "TimSort — Python/JS native",
      ],
    },
    code: {
      js: `// Quick sort (Lomuto partition)
function quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo >= hi) return a;
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) [a[i], a[j]] = [a[j], a[i]], i++;
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  quickSort(a, lo, i - 1); quickSort(a, i + 1, hi);
  return a;
}`,
      py: `def merge_sort(a):
    if len(a) <= 1: return a
    m = len(a) // 2
    L, R = merge_sort(a[:m]), merge_sort(a[m:])
    out, i, j = [], 0, 0
    while i < len(L) and j < len(R):
        if L[i] <= R[j]: out.append(L[i]); i += 1
        else: out.append(R[j]); j += 1
    return out + L[i:] + R[j:]`,
    },
  },
  {
    slug: "searching",
    name: "Searching",
    emoji: "🔍",
    tagline: "Locate elements efficiently",
    accent: "pink",
    category: "find_in_data",
    complexityHeader: ["Algorithm", "Best", "Average", "Worst"],
    complexity: [],
    algorithms: [
      { name: "Linear Search", best: "O(1)", avg: "O(n)", worst: "O(n)" },
      { name: "Binary Search", best: "O(1)", avg: "O(log n)", worst: "O(log n)" },
      { name: "Jump Search", best: "O(1)", avg: "O(√n)", worst: "O(√n)" },
      { name: "Interpolation", best: "O(1)", avg: "O(log log n)", worst: "O(n)" },
      { name: "Exponential", best: "O(1)", avg: "O(log n)", worst: "O(log n)" },
      { name: "Ternary Search", best: "O(1)", avg: "O(log₃ n)", worst: "O(log₃ n)" },
    ],
    concepts: {
      title: "Key Conditions",
      items: [
        "Linear: works on unsorted data",
        "Binary: requires a sorted array",
        "Binary: divide & conquer",
        "Search on the answer space",
        "Ternary: unimodal functions",
        "Exponential: unbounded ranges",
      ],
    },
    code: {
      js: `// Iterative binary search
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (arr[m] === target) return m;
    arr[m] < target ? (lo = m + 1) : (hi = m - 1);
  }
  return -1;
}`,
      py: `def binary_search(a, t):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        m = (lo + hi) // 2
        if a[m] == t: return m
        if a[m] < t: lo = m + 1
        else: hi = m - 1
    return -1`,
    },
  },
];

export const getTopic = (slug: string) => TOPICS.find((t) => t.slug === slug);
