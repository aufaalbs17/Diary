import {
  BucketListItem,
  CategoryKey,
  DiaryStats,
  LittleNote,
  Memory,
  MemoryMedia,
  MemoryNote,
  MoodKey,
  Profile,
  Space,
} from "./types";
import {
  INITIAL_BUCKET_LIST,
  INITIAL_LITTLE_NOTES,
  INITIAL_MEMORIES,
  INITIAL_SPACE,
} from "./initial-data";
import { createClient, isSupabaseConfigured } from "./supabase/client";

const STORAGE_KEYS = {
  SPACE: "olm_space_v1",
  MEMORIES: "olm_memories_v1",
  BUCKET_LIST: "olm_bucket_list_v1",
  LITTLE_NOTES: "olm_little_notes_v1",
  ACTIVE_USER_ID: "olm_active_user_id_v1",
};

function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// ----------------------------------------------------------------------------
// Active User & Space Management
// ----------------------------------------------------------------------------

export function getActiveUser(): Profile {
  const space = getSpace();
  const activeId = getLocal<string>(STORAGE_KEYS.ACTIVE_USER_ID, "user-1");
  const member = space.members.find((m) => m.user_id === activeId);
  return (
    member?.profile ||
    space.members[0]?.profile || {
      id: "user-1",
      email: "rian@ourlittlemoments.id",
      full_name: "Rian Pratama",
      nickname: "Rian",
      avatar_url: "/images/hero.jpg",
      created_at: new Date().toISOString(),
    }
  );
}

export function setActiveUser(userId: string): void {
  setLocal(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("olm_user_changed"));
  }
}

export function getSpace(): Space {
  return getLocal<Space>(STORAGE_KEYS.SPACE, INITIAL_SPACE);
}

export function saveSpace(space: Space): void {
  setLocal(STORAGE_KEYS.SPACE, space);
}

export function joinSpaceByInviteCode(
  code: string,
  newMemberProfile: Profile
): { success: boolean; message: string } {
  const space = getSpace();
  if (space.invite_code.trim().toUpperCase() !== code.trim().toUpperCase()) {
    return { success: false, message: "Kode undangan tidak sesuai atau tidak valid." };
  }

  // Check 2 members rule
  const alreadyMember = space.members.some((m) => m.user_id === newMemberProfile.id);
  if (alreadyMember) {
    return { success: true, message: "Kamu sudah menjadi anggota ruang ini." };
  }

  if (space.members.length >= 2) {
    return {
      success: false,
      message: "Ruang kenangan ini sudah penuh (maksimum 2 orang sesuai aturan privasi).",
    };
  }

  const updatedSpace: Space = {
    ...space,
    members: [
      ...space.members,
      {
        id: `member-${Date.now()}`,
        space_id: space.id,
        user_id: newMemberProfile.id,
        role: "partner",
        profile: newMemberProfile,
        joined_at: new Date().toISOString(),
      },
    ],
  };

  saveSpace(updatedSpace);
  setActiveUser(newMemberProfile.id);
  return { success: true, message: "Selamat datang di ruang kenangan bersama ♡" };
}

// ----------------------------------------------------------------------------
// Memories (Our Diary)
// ----------------------------------------------------------------------------

export interface MemoryFilters {
  search?: string;
  category?: CategoryKey | "all";
  mood?: MoodKey | "all";
  isFavorite?: boolean;
  year?: string;
  sortBy?: "newest" | "oldest";
  includeDrafts?: boolean;
}

export async function getMemories(filters?: MemoryFilters): Promise<Memory[]> {
  // If Supabase is connected and ready, fetch from Supabase
  if (isSupabaseConfigured) {
    const supabase = createClient();
    if (supabase) {
      try {
        let query = supabase
          .from("memories")
          .select("*, media:memory_media(*), notes:memory_notes(*)")
          .order("event_date", { ascending: filters?.sortBy === "oldest" });

        if (!filters?.includeDrafts) {
          query = query.eq("is_draft", false);
        }
        if (filters?.category && filters.category !== "all") {
          query = query.eq("category", filters.category);
        }
        if (filters?.mood && filters.mood !== "all") {
          query = query.eq("mood", filters.mood);
        }
        if (filters?.isFavorite) {
          query = query.eq("is_favorite", true);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as Memory[];
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local store:", err);
      }
    }
  }

  // Local fallback
  let list = getLocal<Memory[]>(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES);

  if (!filters?.includeDrafts) {
    list = list.filter((m) => !m.is_draft);
  }

  if (filters?.category && filters.category !== "all") {
    list = list.filter((m) => m.category === filters.category);
  }

  if (filters?.mood && filters.mood !== "all") {
    list = list.filter((m) => m.mood === filters.mood);
  }

  if (filters?.isFavorite) {
    list = list.filter((m) => m.is_favorite);
  }

  if (filters?.year && filters.year !== "all") {
    list = list.filter((m) => m.event_date.startsWith(filters.year!));
  }

  if (filters?.search && filters.search.trim()) {
    const term = filters.search.toLowerCase().trim();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        m.story.toLowerCase().includes(term) ||
        m.location_name?.toLowerCase().includes(term) ||
        m.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  // Sort
  list.sort((a, b) => {
    const dateA = new Date(`${a.event_date}T${a.event_time || "00:00"}`).getTime();
    const dateB = new Date(`${b.event_date}T${b.event_time || "00:00"}`).getTime();
    return filters?.sortBy === "oldest" ? dateA - dateB : dateB - dateA;
  });

  return list;
}

export async function getMemoryById(
  id: string
): Promise<{ memory: Memory | null; prevId?: string; nextId?: string }> {
  const all = await getMemories({ includeDrafts: true });
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) {
    return { memory: null };
  }

  const memory = all[index];
  const nextId = index > 0 ? all[index - 1].id : undefined;
  const prevId = index < all.length - 1 ? all[index + 1].id : undefined;

  return { memory, prevId, nextId };
}

export async function saveMemory(memoryData: Partial<Memory>): Promise<Memory> {
  const all = getLocal<Memory[]>(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES);
  const activeUser = getActiveUser();
  const space = getSpace();

  const isEditing = Boolean(memoryData.id && all.some((m) => m.id === memoryData.id));

  let finalMemory: Memory;

  if (isEditing) {
    const existingIndex = all.findIndex((m) => m.id === memoryData.id);
    finalMemory = {
      ...all[existingIndex],
      ...memoryData,
      updated_at: new Date().toISOString(),
    } as Memory;
    all[existingIndex] = finalMemory;
  } else {
    finalMemory = {
      id: memoryData.id || `mem-${Date.now()}`,
      space_id: space.id,
      author_id: activeUser.id,
      author_name: activeUser.nickname || activeUser.full_name,
      title: memoryData.title || "Momen Indah",
      event_date: memoryData.event_date || new Date().toISOString().split("T")[0],
      event_time: memoryData.event_time || "",
      location_name: memoryData.location_name || "",
      location_lat: memoryData.location_lat,
      location_lng: memoryData.location_lng,
      story: memoryData.story || "",
      mood: memoryData.mood || "senang_banget",
      category: memoryData.category || "random",
      tags: memoryData.tags || [],
      is_favorite: Boolean(memoryData.is_favorite),
      spotify_url: memoryData.spotify_url || "",
      cover_image_url:
        memoryData.cover_image_url ||
        memoryData.media?.[0]?.file_path ||
        "/images/hero.jpg",
      is_draft: Boolean(memoryData.is_draft),
      media: memoryData.media || [],
      notes: memoryData.notes || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.unshift(finalMemory);
  }

  setLocal(STORAGE_KEYS.MEMORIES, all);

  // If Supabase is configured, persist to Supabase
  if (isSupabaseConfigured) {
    const supabase = createClient();
    if (supabase) {
      try {
        const { media, notes, ...dbMemory } = finalMemory;
        await supabase.from("memories").upsert(dbMemory);
      } catch (e) {
        console.error("Supabase upsert memory error:", e);
      }
    }
  }

  return finalMemory;
}

export async function deleteMemory(id: string): Promise<boolean> {
  let all = getLocal<Memory[]>(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES);
  all = all.filter((m) => m.id !== id);
  setLocal(STORAGE_KEYS.MEMORIES, all);

  if (isSupabaseConfigured) {
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("memories").delete().eq("id", id);
      } catch (e) {
        console.error("Supabase delete memory error:", e);
      }
    }
  }

  return true;
}

export async function addMemoryNote(
  memoryId: string,
  noteText: string
): Promise<MemoryNote> {
  const all = getLocal<Memory[]>(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES);
  const targetIndex = all.findIndex((m) => m.id === memoryId);
  if (targetIndex === -1) {
    throw new Error("Kenangan tidak ditemukan.");
  }

  const activeUser = getActiveUser();
  const newNote: MemoryNote = {
    id: `note-${Date.now()}`,
    memory_id: memoryId,
    user_id: activeUser.id,
    author_name: activeUser.nickname || activeUser.full_name,
    note: noteText.trim(),
    created_at: new Date().toISOString(),
  };

  const updatedNotes = [...(all[targetIndex].notes || []), newNote];
  all[targetIndex].notes = updatedNotes;
  setLocal(STORAGE_KEYS.MEMORIES, all);

  return newNote;
}

// ----------------------------------------------------------------------------
// Gallery
// ----------------------------------------------------------------------------

export interface GalleryItem {
  id: string;
  memory_id: string;
  memory_title: string;
  event_date: string;
  location_name?: string;
  category: CategoryKey;
  file_path: string;
  file_type: "image" | "video";
  caption?: string;
}

export async function getGalleryMedia(): Promise<GalleryItem[]> {
  const memories = await getMemories();
  const items: GalleryItem[] = [];

  for (const m of memories) {
    for (const media of m.media) {
      items.push({
        id: media.id,
        memory_id: m.id,
        memory_title: m.title,
        event_date: m.event_date,
        location_name: m.location_name,
        category: m.category,
        file_path: media.file_path,
        file_type: media.file_type,
        caption: media.caption,
      });
    }
  }

  return items;
}

// ----------------------------------------------------------------------------
// Little Notes 💌
// ----------------------------------------------------------------------------

export async function getLittleNotes(): Promise<LittleNote[]> {
  return getLocal<LittleNote[]>(STORAGE_KEYS.LITTLE_NOTES, INITIAL_LITTLE_NOTES);
}

export async function sendLittleNote(
  note: Omit<LittleNote, "id" | "space_id" | "sender_id" | "sender_name" | "created_at" | "is_opened">
): Promise<LittleNote> {
  const all = getLocal<LittleNote[]>(STORAGE_KEYS.LITTLE_NOTES, INITIAL_LITTLE_NOTES);
  const activeUser = getActiveUser();
  const space = getSpace();

  const newNote: LittleNote = {
    id: `note-letter-${Date.now()}`,
    space_id: space.id,
    sender_id: activeUser.id,
    sender_name: activeUser.nickname || activeUser.full_name,
    recipient_id: note.recipient_id,
    recipient_name: note.recipient_name,
    title: note.title,
    message: note.message,
    emoji: note.emoji || "💌",
    unlock_at: note.unlock_at,
    is_opened: false,
    created_at: new Date().toISOString(),
  };

  all.unshift(newNote);
  setLocal(STORAGE_KEYS.LITTLE_NOTES, all);
  return newNote;
}

export async function openLittleNote(id: string): Promise<boolean> {
  const all = getLocal<LittleNote[]>(STORAGE_KEYS.LITTLE_NOTES, INITIAL_LITTLE_NOTES);
  const index = all.findIndex((n) => n.id === id);
  if (index === -1) return false;

  const note = all[index];
  if (note.unlock_at && new Date(note.unlock_at) > new Date()) {
    return false; // Still locked!
  }

  all[index].is_opened = true;
  setLocal(STORAGE_KEYS.LITTLE_NOTES, all);
  return true;
}

// ----------------------------------------------------------------------------
// Bucket List
// ----------------------------------------------------------------------------

export async function getBucketList(): Promise<BucketListItem[]> {
  return getLocal<BucketListItem[]>(STORAGE_KEYS.BUCKET_LIST, INITIAL_BUCKET_LIST);
}

export async function toggleBucketItem(id: string): Promise<BucketListItem | null> {
  const all = getLocal<BucketListItem[]>(STORAGE_KEYS.BUCKET_LIST, INITIAL_BUCKET_LIST);
  const index = all.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const current = all[index];
  const isNowCompleted = !current.is_completed;
  all[index] = {
    ...current,
    is_completed: isNowCompleted,
    completed_at: isNowCompleted ? new Date().toISOString() : undefined,
  };

  setLocal(STORAGE_KEYS.BUCKET_LIST, all);
  return all[index];
}

export async function saveBucketItem(
  item: Partial<BucketListItem>
): Promise<BucketListItem> {
  const all = getLocal<BucketListItem[]>(STORAGE_KEYS.BUCKET_LIST, INITIAL_BUCKET_LIST);
  const space = getSpace();

  if (item.id && all.some((b) => b.id === item.id)) {
    const index = all.findIndex((b) => b.id === item.id);
    all[index] = { ...all[index], ...item };
    setLocal(STORAGE_KEYS.BUCKET_LIST, all);
    return all[index];
  }

  const newItem: BucketListItem = {
    id: `bucket-${Date.now()}`,
    space_id: space.id,
    title: item.title || "Mimpi Baru Bersama",
    category: item.category || "Petualangan Bersama",
    target_date: item.target_date,
    is_completed: false,
    notes: item.notes || "",
    photo_url: item.photo_url,
    created_at: new Date().toISOString(),
  };

  all.unshift(newItem);
  setLocal(STORAGE_KEYS.BUCKET_LIST, all);
  return newItem;
}

export async function deleteBucketItem(id: string): Promise<boolean> {
  let all = getLocal<BucketListItem[]>(STORAGE_KEYS.BUCKET_LIST, INITIAL_BUCKET_LIST);
  all = all.filter((b) => b.id !== id);
  setLocal(STORAGE_KEYS.BUCKET_LIST, all);
  return true;
}

// ----------------------------------------------------------------------------
// Dashboard Stats & Random Memory
// ----------------------------------------------------------------------------

export async function getDiaryStats(): Promise<DiaryStats> {
  const memories = await getMemories();
  let totalPhotos = 0;
  let totalVideos = 0;
  const placesSet = new Set<string>();

  for (const m of memories) {
    if (m.location_name && m.location_name.trim()) {
      placesSet.add(m.location_name.trim().toLowerCase());
    }
    for (const media of m.media) {
      if (media.file_type === "video") totalVideos++;
      else totalPhotos++;
    }
  }

  return {
    totalMemories: memories.length,
    totalPhotos,
    totalVideos,
    totalPlaces: placesSet.size,
  };
}

export async function getRandomMemory(): Promise<Memory | null> {
  const memories = await getMemories();
  if (memories.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * memories.length);
  return memories[randomIndex];
}
