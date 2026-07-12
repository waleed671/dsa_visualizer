// API client for database operations

export type Profile = {
  id: string;
  name: string;
  pin_hash: string;
  created_at: number;
};

export type GalleryItem = {
  id: string;
  profile_id?: string;
  profileId?: string;
  topic_slug?: string;
  topicSlug?: string;
  data: string;
  caption: string;
  difficulty: "Easy" | "Medium" | "Hard";
  created_at?: number;
  createdAt?: number;
};

// Profile API
export const profileApi = {
  getAll: async (): Promise<Profile[]> => {
    const res = await fetch("/api/profiles");
    if (!res.ok) throw new Error("Failed to fetch profiles");
    return res.json();
  },

  create: async (name: string, pin: string): Promise<Profile> => {
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin }),
    });
    if (!res.ok) throw new Error("Failed to create profile");
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/profiles?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete profile");
  },

  signIn: async (id: string, pin: string): Promise<{ success: boolean; profile?: Profile }> => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pin }),
    });
    if (!res.ok) return { success: false };
    return res.json();
  },
};

// Gallery API
export const galleryApi = {
  getAll: async (profileId: string, topicSlug?: string): Promise<GalleryItem[]> => {
    const params = new URLSearchParams({ profileId });
    if (topicSlug) params.append("topicSlug", topicSlug);
    const res = await fetch(`/api/gallery?${params}`);
    if (!res.ok) throw new Error("Failed to fetch gallery");
    return res.json();
  },

  add: async (
    profileId: string,
    item: Omit<GalleryItem, "id" | "created_at" | "createdAt" | "profile_id" | "profileId">
  ): Promise<GalleryItem> => {
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, ...item }),
    });
    if (!res.ok) throw new Error("Failed to add gallery item");
    return res.json();
  },

  remove: async (id: string, profileId: string): Promise<void> => {
    const res = await fetch(`/api/gallery?id=${id}&profileId=${profileId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove gallery item");
  },

  clear: async (profileId: string): Promise<void> => {
    const res = await fetch(`/api/gallery/clear?profileId=${profileId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to clear gallery");
  },

  import: async (profileId: string, items: GalleryItem[]): Promise<void> => {
    const res = await fetch("/api/gallery/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, items }),
    });
    if (!res.ok) throw new Error("Failed to import gallery items");
  },
};
