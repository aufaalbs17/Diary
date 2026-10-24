"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  X,
  Music,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Heart,
  Save,
  FileText,
  Trash2,
  Check,
  Plus,
} from "lucide-react";
import {
  CATEGORIES,
  CategoryKey,
  Memory,
  MemoryMedia,
  MOODS,
  MoodKey,
} from "@/lib/types";
import { saveMemory } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/lib/auth-context";

interface MemoryFormProps {
  initialData?: Partial<Memory>;
  isEdit?: boolean;
}

const AUTOSAVE_KEY = "olm_memory_draft_autosave_v1";

export function MemoryForm({ initialData, isEdit }: MemoryFormProps) {
  const router = useRouter();
  const { success, error, info } = useToast();
  const { user } = useAuth();

  const [title, setTitle] = useState(initialData?.title || "");
  const [eventDate, setEventDate] = useState(
    initialData?.event_date || new Date().toISOString().split("T")[0]
  );
  const [eventTime, setEventTime] = useState(initialData?.event_time || "");
  const [locationName, setLocationName] = useState(
    initialData?.location_name || ""
  );
  const [story, setStory] = useState(initialData?.story || "");
  const [mood, setMood] = useState<MoodKey>(
    initialData?.mood || "senang_banget"
  );
  const [category, setCategory] = useState<CategoryKey>(
    initialData?.category || "random"
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [spotifyUrl, setSpotifyUrl] = useState(initialData?.spotify_url || "");
  const [isFavorite, setIsFavorite] = useState(
    Boolean(initialData?.is_favorite)
  );
  const [extraNote, setExtraNote] = useState("");

  // Media
  const [mediaList, setMediaList] = useState<MemoryMedia[]>(
    initialData?.media || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore autosaved draft if creating new memory
  useEffect(() => {
    if (!isEdit && !initialData?.id) {
      try {
        const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.story) setStory(parsed.story);
          if (parsed.locationName) setLocationName(parsed.locationName);
          if (parsed.category) setCategory(parsed.category);
          if (parsed.mood) setMood(parsed.mood);
          if (parsed.tags) setTags(parsed.tags);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [isEdit, initialData]);

  // Periodic autosave for new entries
  useEffect(() => {
    if (isEdit) return;
    const interval = setInterval(() => {
      if (title.trim() || story.trim()) {
        localStorage.setItem(
          AUTOSAVE_KEY,
          JSON.stringify({
            title,
            story,
            locationName,
            category,
            mood,
            tags,
            savedAt: new Date().toISOString(),
          })
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [title, story, locationName, category, mood, tags, isEdit]);

  // Tags handling
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, "");
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Media Upload handler (converts file to base64 / blob URL for persistent local storage & upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newMediaItems: MemoryMedia[] = [];

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        newMediaItems.push({
          id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          file_path: base64Url,
          file_type: isVideo ? "video" : "image",
          caption: "",
          display_order: mediaList.length + newMediaItems.length + 1,
        });

        if (newMediaItems.length === files.length) {
          setMediaList((prev) => [...prev, ...newMediaItems]);
          setIsUploading(false);
          info(`${files.length} media berhasil ditambahkan.`);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleUpdateCaption = (mediaId: string, caption: string) => {
    setMediaList((prev) =>
      prev.map((m) => (m.id === mediaId ? { ...m, caption } : m))
    );
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== mediaId));
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!title.trim() && !isDraft) {
      error("Mohon isi judul kenangan.");
      return;
    }
    if (!story.trim() && !isDraft) {
      error("Ceritakan sedikit momen indah hari ini.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build notes list
      const notes = initialData?.notes ? [...initialData.notes] : [];
      if (extraNote.trim()) {
        notes.push({
          id: `note-${Date.now()}`,
          memory_id: initialData?.id || "",
          user_id: user?.id || "user-1",
          author_name: user?.nickname || user?.full_name || "Kita",
          note: extraNote.trim(),
          created_at: new Date().toISOString(),
        });
      }

      const coverImage =
        mediaList.find((m) => m.file_type === "image")?.file_path ||
        initialData?.cover_image_url ||
        "/images/hero.jpg";

      const memoryToSave: Partial<Memory> = {
        ...initialData,
        title: title.trim() || (isDraft ? "Draft Kenangan" : "Momen Hari Ini"),
        event_date: eventDate,
        event_time: eventTime,
        location_name: locationName.trim(),
        story: story.trim(),
        mood,
        category,
        tags,
        is_favorite: isFavorite,
        spotify_url: spotifyUrl.trim(),
        cover_image_url: coverImage,
        is_draft: isDraft,
        media: mediaList,
        notes,
      };

      const saved = await saveMemory(memoryToSave);

      // Clear draft autosave
      if (!isEdit) {
        localStorage.removeItem(AUTOSAVE_KEY);
      }

      success(
        isDraft
          ? "Draft kenangan berhasil disimpan."
          : isEdit
          ? "Kenangan berhasil diperbarui."
          : "Kenangan indah berhasil disimpan selamanya 🤍"
      );

      router.push(`/diary/${saved.id}`);
    } catch (err) {
      console.error(err);
      error("Terjadi kendala saat menyimpan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left pb-6 border-b border-[#E9E1DB]">
        <h1 className="font-editorial-heading text-3xl sm:text-4xl font-normal text-[#302B29]">
          {isEdit ? "Edit Kenangan" : "Let's remember today."}
        </h1>
        <p className="font-editorial-quote text-lg text-[#78655F] italic mt-1">
          &ldquo;Tulis cerita kecil yang ingin kita simpan selamanya.&rdquo;
        </p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-editorial-body text-[#78655F] uppercase tracking-wider">
            1. Judul Kenangan *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Kopi Pagi dan Obrolan Hangat di Sudut Kafe"
            className="w-full px-5 py-3.5 bg-white border border-[#E9E1DB] rounded-2xl text-base sm:text-lg text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3] font-editorial-heading shadow-2xs"
          />
        </div>

        {/* Date, Time, Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
              <span>2. Tanggal Kejadian *</span>
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#CFA6A3]" />
              <span>3. Waktu (Opsional)</span>
            </label>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#CFA6A3]" />
              <span>4. Lokasi Tempat</span>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Contoh: Kafe Daun Teduh, Bandung"
              className="w-full px-4 py-3 bg-white border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3]"
            />
          </div>
        </div>

        {/* Story */}
        <div className="space-y-2">
          <label className="text-xs font-editorial-body text-[#78655F] uppercase tracking-wider">
            5. Cerita Hari Ini *
          </label>
          <textarea
            rows={6}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Tuliskan momen apa yang terjadi hari ini, hal lucu yang kita tertawakan, perasaan yang dirasakan, atau percakapan kecil yang membekas..."
            className="w-full p-4 bg-white border border-[#E9E1DB] rounded-2xl text-sm sm:text-base text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3] leading-relaxed resize-y font-editorial-body"
          />
        </div>

        {/* Mood Selector */}
        <div className="space-y-2">
          <label className="text-xs font-editorial-body text-[#78655F] uppercase tracking-wider">
            9. Mood Hari Ini
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {Object.entries(MOODS).map(([key, config]) => {
              const isSelected = mood === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setMood(key as MoodKey)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                    isSelected
                      ? "bg-[#F1EBE4] border-[#CFA6A3] text-[#302B29] shadow-xs"
                      : "bg-white border-[#E9E1DB] text-[#78655F] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <span className="text-2xl mb-1">{config.emoji}</span>
                  <span className="text-xs font-editorial-body font-medium">
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-editorial-body text-[#78655F] uppercase tracking-wider">
            10. Kategori
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORIES).map(([key, config]) => {
              const isSelected = category === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setCategory(key as CategoryKey)}
                  className={`px-4 py-2 rounded-full text-xs font-editorial-body transition-all ${
                    isSelected
                      ? "bg-[#302B29] text-white shadow-xs"
                      : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Media Upload (Photos and Videos) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-editorial-body text-[#78655F] uppercase tracking-wider">
              6 & 7. Upload Foto & Video
            </label>
            <span className="text-xs text-[#8D817B]">
              {mediaList.length} berkas dipilih
            </span>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#E9E1DB] hover:border-[#CFA6A3] bg-white rounded-3xl p-6 text-center cursor-pointer transition-colors group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#F1EBE4] text-[#CFA6A3] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="font-editorial-body text-sm text-[#302B29] font-medium">
              Klik atau tarik foto & video ke sini
            </p>
            <p className="text-xs text-[#8D817B] mt-1">
              Mendukung banyak foto dan video (JPG, PNG, MP4, MOV)
            </p>
          </div>

          {/* Media Previews & Captions */}
          {mediaList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {mediaList.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E9E1DB] rounded-2xl p-3 shadow-xs space-y-2 relative group"
                >
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#F1EBE4]">
                    {item.file_type === "video" ? (
                      <video
                        src={item.file_path}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.file_path}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                      title="Hapus media"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md font-mono">
                      #{idx + 1} {item.file_type === "video" ? "Video" : "Foto"}
                    </span>
                  </div>

                  {/* Caption input */}
                  <div>
                    <input
                      type="text"
                      value={item.caption || ""}
                      onChange={(e) =>
                        handleUpdateCaption(item.id, e.target.value)
                      }
                      placeholder="Tuliskan cerita/keterangan foto ini..."
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-xs font-editorial-body text-[#78655F] uppercase tracking-wider">
            11. Tags (Kata Kunci)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Tambah tag baru (tekan Enter)"
              className="flex-1 px-4 py-2.5 bg-white border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3]"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2.5 bg-[#F1EBE4] hover:bg-[#E9E1DB] text-[#302B29] rounded-2xl text-xs font-editorial-body transition-colors"
            >
              Tambah
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E9E1DB] text-xs text-[#78655F]"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-[#8D817B] hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Spotify / Song Link */}
        <div className="space-y-2">
          <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-[#CFA6A3]" />
            <span>12. Lagu yang Mengingatkan Kita (Spotify Link)</span>
          </label>
          <input
            type="url"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder="https://open.spotify.com/track/..."
            className="w-full px-4 py-3 bg-white border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3]"
          />
        </div>

        {/* Personal Note */}
        <div className="space-y-2">
          <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#CFA6A3]" />
            <span>13. Catatan Pribadi dari {user?.nickname || "Kamu"}</span>
          </label>
          <textarea
            rows={3}
            value={extraNote}
            onChange={(e) => setExtraNote(e.target.value)}
            placeholder="Pesan atau catatan kecil yang ingin kamu sematkan pada kenangan ini..."
            className="w-full p-3 bg-white border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3]"
          />
        </div>

        {/* Favorite toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-editorial-body transition-all ${
              isFavorite
                ? "bg-[#CFA6A3]/20 border-[#CFA6A3] text-[#78655F]"
                : "bg-white border-[#E9E1DB] text-[#8D817B] hover:border-[#CFA6A3]"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? "fill-[#CFA6A3] text-[#CFA6A3]" : ""
              }`}
            />
            <span>
              {isFavorite ? "Tandai sebagai Kenangan Favorit" : "Jadikan Kenangan Favorit"}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E9E1DB]">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#E9E1DB] text-xs sm:text-sm font-editorial-body text-[#78655F] hover:bg-white transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-[#E9E1DB] hover:border-[#CFA6A3] text-[#78655F] text-xs sm:text-sm font-editorial-body transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Simpan Draft</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#CFA6A3] hover:bg-[#B88582] text-white text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Kenangan"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
