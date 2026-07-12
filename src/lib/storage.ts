// Local-only "auth" + gallery storage helpers.
// All data namespaced by profile id under a single root key.
// Types are defined in @/types/api

import type { Profile, GalleryItem } from "@/types/api";

export type { Profile, GalleryItem };

const ROOT = "dsa-hub:v1";

const safeRead = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed", e);
    throw e;
  }
};

// Profiles
export const getProfiles = (): Profile[] => safeRead(`${ROOT}:profiles`, []);
export const setProfiles = (p: Profile[]) => safeWrite(`${ROOT}:profiles`, p);
export const getActiveProfileId = (): string | null =>
  typeof window === "undefined" ? null : localStorage.getItem(`${ROOT}:active`);
export const setActiveProfileId = (id: string | null) => {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(`${ROOT}:active`, id);
  else localStorage.removeItem(`${ROOT}:active`);
};

// Gallery (per profile)
const galleryKey = (profileId: string) => `${ROOT}:${profileId}:gallery`;
export const getGallery = (profileId: string): GalleryItem[] =>
  safeRead(galleryKey(profileId), []);
export const setGallery = (profileId: string, items: GalleryItem[]) =>
  safeWrite(galleryKey(profileId), items);

// Estimate localStorage usage in KB.
export function storageUsageKB(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    total += (k.length + (localStorage.getItem(k)?.length || 0)) * 2;
  }
  return Math.round(total / 1024);
}
