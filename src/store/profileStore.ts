import { create } from "zustand";
import { getProfiles, setProfiles, setActiveProfileId, getActiveProfileId } from "@/lib/storage";
import type { Profile } from "@/types/api";

const DEFAULT_PROFILE_ID = "p_default";

function ensureDefaultProfile(): Profile {
  const existing = getProfiles();
  const def = existing.find((p) => p.id === DEFAULT_PROFILE_ID);
  if (def) return def;
  const profile: Profile = {
    id: DEFAULT_PROFILE_ID,
    name: "Guest",
    pinHash: "",
    createdAt: Date.now(),
  };
  setProfiles([...existing, profile]);
  return profile;
}

type State = {
  hydrated: boolean;
  profiles: Profile[];
  activeId: string | null;
  hydrate: () => void;
  updateName: (name: string) => void;
  clear: () => void;
};

export const useProfileStore = create<State>((set, get) => ({
  hydrated: false,
  profiles: [],
  activeId: null,
  hydrate: () => {
    const defaultProfile = ensureDefaultProfile();
    const storedActive = getActiveProfileId();
    const profiles = getProfiles();
    // Always keep the default profile active
    const activeId = storedActive ?? defaultProfile.id;
    setActiveProfileId(activeId);
    set({ profiles, activeId, hydrated: true });
  },
  updateName: (name: string) => {
    const trimmed = name.trim() || "Guest";
    const profiles = get().profiles.map((p) =>
      p.id === get().activeId ? { ...p, name: trimmed } : p,
    );
    setProfiles(profiles);
    setActiveProfileId(get().activeId);
    set({ profiles });
  },
  clear: () => {
    // Reset to fresh default profile
    const profile: Profile = {
      id: DEFAULT_PROFILE_ID,
      name: "Guest",
      pinHash: "",
      createdAt: Date.now(),
    };
    setProfiles([profile]);
    setActiveProfileId(DEFAULT_PROFILE_ID);
    set({ profiles: [profile], activeId: DEFAULT_PROFILE_ID });
  },
}));

export const useActiveProfile = (): Profile | null => {
  const { profiles, activeId } = useProfileStore();
  return profiles.find((p) => p.id === activeId) ?? null;
};
