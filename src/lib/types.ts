export type MoodKey =
  | "senang_banget"
  | "bahagia"
  | "lucu"
  | "terharu"
  | "tenang"
  | "berkesan";

export interface MoodConfig {
  key: MoodKey;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export const MOODS: Record<MoodKey, MoodConfig> = {
  senang_banget: {
    key: "senang_banget",
    label: "Senang Banget",
    emoji: "🥰",
    description: "Penuh kehangatan dan rasa bahagia yang mendalam",
    color: "#CFA6A3",
  },
  bahagia: {
    key: "bahagia",
    label: "Bahagia",
    emoji: "😊",
    description: "Senyum manis yang menemani langkah hari ini",
    color: "#D4B28C",
  },
  lucu: {
    key: "lucu",
    label: "Lucu",
    emoji: "😂",
    description: "Momen konyol dan tawa lepas yang tak terduga",
    color: "#E2A76F",
  },
  terharu: {
    key: "terharu",
    label: "Terharu",
    emoji: "🥹",
    description: "Sentuhan hati yang membuat mata sedikit berkaca-kaca",
    color: "#B88582",
  },
  tenang: {
    key: "tenang",
    label: "Tenang",
    emoji: "🌷",
    description: "Kedamaian sederhana di tengah ramainya dunia",
    color: "#9EA896",
  },
  berkesan: {
    key: "berkesan",
    label: "Berkesan",
    emoji: "✨",
    description: "Momen magis yang akan selalu diingat",
    color: "#C2A3C7",
  },
};

export type CategoryKey =
  | "jalan_jalan"
  | "makan_bareng"
  | "nongkrong"
  | "traveling"
  | "random"
  | "special"
  | "lainnya";

export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  iconName: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  jalan_jalan: { key: "jalan_jalan", label: "Jalan-Jalan", iconName: "Footprints" },
  makan_bareng: { key: "makan_bareng", label: "Makan Bareng", iconName: "Utensils" },
  nongkrong: { key: "nongkrong", label: "Nongkrong", iconName: "Coffee" },
  traveling: { key: "traveling", label: "Traveling", iconName: "Compass" },
  random: { key: "random", label: "Random Moments", iconName: "Sparkles" },
  special: { key: "special", label: "Special Moments", iconName: "Heart" },
  lainnya: { key: "lainnya", label: "Lainnya", iconName: "Bookmark" },
};

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  nickname: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  role: "owner" | "partner";
  profile?: Profile;
  joined_at: string;
}

export interface Space {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  members: SpaceMember[];
  created_at: string;
}

export interface MemoryMedia {
  id: string;
  memory_id?: string;
  file_path: string;
  file_type: "image" | "video";
  caption?: string;
  display_order: number;
  created_at?: string;
}

export interface MemoryNote {
  id: string;
  memory_id: string;
  user_id: string;
  author_name: string;
  note: string;
  created_at: string;
}

export interface Memory {
  id: string;
  space_id: string;
  author_id: string;
  author_name?: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string; // HH:mm
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  story: string;
  mood: MoodKey;
  category: CategoryKey;
  tags: string[];
  is_favorite: boolean;
  spotify_url?: string;
  cover_image_url?: string;
  is_draft: boolean;
  media: MemoryMedia[];
  notes: MemoryNote[];
  created_at: string;
  updated_at: string;
}

export interface LittleNote {
  id: string;
  space_id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  title: string;
  message: string;
  emoji: string;
  unlock_at?: string;
  is_opened: boolean;
  created_at: string;
}

export interface BucketListItem {
  id: string;
  space_id: string;
  title: string;
  category: string;
  target_date?: string;
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
  photo_url?: string;
  memory_id?: string;
  created_at: string;
}

export interface DiaryStats {
  totalMemories: number;
  totalPhotos: number;
  totalVideos: number;
  totalPlaces: number;
}
