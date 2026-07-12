import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { getGallery, setGallery } from "@/lib/storage";
import type { GalleryItem } from "@/types/api";

type State = {
  items: GalleryItem[];
  loadedFor: string | null;
  load: (profileId: string) => void;
  add: (profileId: string, item: Omit<GalleryItem, "id" | "createdAt">) => void;
  remove: (profileId: string, id: string) => void;
  clear: (profileId: string) => void;
  importItems: (profileId: string, items: GalleryItem[]) => void;
};

export const useGalleryStore = create<State>((set, get) => ({
  items: [],
  loadedFor: null,
  load: (profileId) => set({ items: getGallery(profileId), loadedFor: profileId }),
  add: (profileId, item) => {
    const next: GalleryItem = {
      ...item,
      id: `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    const items = [next, ...get().items];
    setGallery(profileId, items);
    set({ items });
  },
  remove: (profileId, id) => {
    const items = get().items.filter((x) => x.id !== id);
    setGallery(profileId, items);
    set({ items });
  },
  clear: (profileId) => {
    setGallery(profileId, []);
    set({ items: [] });
  },
  importItems: (profileId, items) => {
    setGallery(profileId, items);
    set({ items });
  },
}));

// useShallow ensures the selector uses a shallow-equality check on the resulting array,
// so even though .filter() creates a new array reference every call, the component only
// re-renders when the actual contents of the array change — preventing an infinite loop.
export const useTopicGallery = (slug: string) =>
  useGalleryStore(useShallow((s) => s.items.filter((i) => i.topicSlug === slug)));
