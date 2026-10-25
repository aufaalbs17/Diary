"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Heart,
  Calendar,
  MapPin,
  Plus,
  ArrowUpDown,
  X,
  BookOpen,
  Sparkles,
  Camera,
  Music,
  Compass,
  Trash2,
} from "lucide-react";
import { Memory, MOODS, CATEGORIES, CategoryKey, MoodKey } from "@/lib/types";
import { getMemories, toggleFavorite, deleteMemory } from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/components/ui/toast-provider";

// Organic tilt classes to give cards an authentic scrapbook feel
const CARD_TILTS = [
  "hover:rotate-0 rotate-[-0.8deg]",
  "hover:rotate-0 rotate-[0.7deg]",
  "hover:rotate-0 rotate-[-0.5deg]",
  "hover:rotate-0 rotate-[0.9deg]",
  "hover:rotate-0 rotate-[-0.6deg]",
  "hover:rotate-0 rotate-[0.5deg]",
];

// Washi tape patterns and styles
const WASHI_TAPES = [
  "bg-gradient-to-r from-[#F8DEDC]/90 via-[#F3C5C0]/85 to-[#F8DEDC]/90 border-y border-[#E2AEAA]/60",
  "bg-gradient-to-r from-[#EAE6DF]/90 via-[#DDD6CC]/85 to-[#EAE6DF]/90 border-y border-[#C9C0B3]/60",
  "bg-gradient-to-r from-[#F5E6D8]/90 via-[#EED4BF]/85 to-[#F5E6D8]/90 border-y border-[#D6B59C]/60",
  "bg-gradient-to-r from-[#E5ECDE]/90 via-[#D3E0C9]/85 to-[#E5ECDE]/90 border-y border-[#B6CAAA]/60",
];

export default function DiaryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [allMemoriesCount, setAllMemoriesCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [locationsCount, setLocationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { success, info } = useToast();

  // Filters
  const [search, setSearch] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const loadData = async () => {
    setIsLoading(true);
    // Fetch all for stats
    const all = await getMemories({ includeDrafts: false });
    setAllMemoriesCount(all.length);
    setFavoriteCount(all.filter((m) => m.is_favorite).length);
    const uniqueLocations = new Set(
      all.map((m) => m.location_name).filter(Boolean)
    );
    setLocationsCount(uniqueLocations.size);

    // Fetch filtered
    const data = await getMemories({
      search,
      isFavorite: onlyFavorites ? true : undefined,
      sortBy,
    });
    setMemories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, onlyFavorites, sortBy]);

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    memoryId: string,
    currentFav: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = await toggleFavorite(memoryId);
    if (updated) {
      setMemories((prev) =>
        prev.map((m) => (m.id === memoryId ? updated : m))
      );
      if (updated.is_favorite) {
        success("Momen ditandai sebagai favorit ♡");
        setFavoriteCount((c) => c + 1);
      } else {
        info("Dihapus dari daftar favorit");
        setFavoriteCount((c) => Math.max(0, c - 1));
      }
    }
  };

  const formatDateIndo = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const hasActiveFilters = search.trim() !== "" || onlyFavorites;

  const resetFilters = () => {
    setSearch("");
    setOnlyFavorites(false);
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-12 space-y-6 sm:space-y-10">
      {/* Vintage Scrapbook Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF5F0] to-[#F5ECE5] p-4.5 sm:p-10 border border-[#E9E1DB] shadow-lg shadow-[#78655F]/5">
        {/* Subtle decorative postmark watermark */}
        <div className="absolute -right-6 -bottom-6 w-48 h-48 rounded-full border-2 border-dashed border-[#CFA6A3]/20 flex items-center justify-center pointer-events-none select-none rotate-12">
          <div className="w-36 h-36 rounded-full border border-[#CFA6A3]/20 flex flex-col items-center justify-center text-[10px] text-[#CFA6A3]/30 font-mono text-center tracking-widest uppercase">
            <span>Aufa & Anathia</span>
            <span className="my-1">★ ★ ★</span>
            <span>Memories</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-[#E9E1DB] text-[10px] sm:text-[11px] font-mono tracking-widest text-[#8D817B] uppercase shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#CFA6A3]" />
              <span>Jurnal Kenangan • Aufa & Anathia</span>
            </div>

            <h1 className="font-editorial-heading text-2xl sm:text-5xl lg:text-6xl font-medium text-[#302B29] tracking-tight">
              Our Diary.
            </h1>

            <p className="font-editorial-body text-xs sm:text-base text-[#78655F] leading-relaxed">
              Kumpulan lembaran cerita, tawa hangat, dan jejak langkah kecil yang kita rajut bersama. Setiap halaman menyimpan sejuta makna yang tak lekang oleh waktu.
            </p>

            {/* Quick Inspiration Counters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-xs font-editorial-body text-[#78655F]">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-white/70 border border-[#E9E1DB]/80 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-[#CFA6A3]" />
                <strong className="text-[#302B29] font-medium">{allMemoriesCount}</strong> Cerita
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-white/70 border border-[#E9E1DB]/80 shadow-2xs">
                <Heart className="w-3.5 h-3.5 fill-[#CFA6A3] text-[#CFA6A3]" />
                <strong className="text-[#302B29] font-medium">{favoriteCount}</strong> Favorit
              </span>
              {locationsCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-white/70 border border-[#E9E1DB]/80 shadow-2xs">
                  <Compass className="w-3.5 h-3.5 text-[#CFA6A3]" />
                  <strong className="text-[#302B29] font-medium">{locationsCount}</strong> Tempat
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/book"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] text-xs sm:text-sm font-editorial-body text-[#78655F] hover:text-[#302B29] transition-all shadow-sm active:scale-95 text-center whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 text-[#CFA6A3]" />
              <span>Buka Mode Buku 📖</span>
            </Link>

            <Link
              href="/diary/new"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#CFA6A3] hover:bg-[#B88582] text-white text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 hover:shadow-lg active:scale-95 text-center whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tulis Cerita</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Clean Search & Quick Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md border border-[#E9E1DB] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8D817B] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul kenangan, cerita manis, lokasi, atau kata kunci..."
              className="w-full pl-11 pr-10 py-3 bg-[#FAF8F5] hover:bg-white focus:bg-white border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3] focus:ring-2 focus:ring-[#CFA6A3]/15 transition-all shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8D817B] hover:text-[#302B29] rounded-full hover:bg-[#F1EBE4] cursor-pointer"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-editorial-body transition-all shrink-0 cursor-pointer ${
                onlyFavorites
                  ? "bg-[#CFA6A3] text-white shadow-md shadow-[#CFA6A3]/25"
                  : "bg-[#FAF8F5] border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3] hover:text-[#302B29]"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  onlyFavorites ? "fill-white text-white" : "text-[#CFA6A3]"
                }`}
              />
              <span>Favorit Saja</span>
            </button>

            {/* Sort Toggle */}
            <button
              onClick={() =>
                setSortBy(sortBy === "newest" ? "oldest" : "newest")
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] text-[#78655F] hover:text-[#302B29] rounded-2xl text-xs font-editorial-body transition-all shrink-0 cursor-pointer"
              title="Urutan Cerita"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#CFA6A3]" />
              <span>{sortBy === "newest" ? "Terbaru Dahulu" : "Terlama Dahulu"}</span>
            </button>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-[#B88582] hover:text-[#9A6764] hover:bg-[#FAF5F0] rounded-2xl transition-colors font-editorial-body shrink-0 cursor-pointer"
                title="Reset pencarian"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Memories Scrapbook Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-4 border border-[#E9E1DB] shadow-sm animate-pulse space-y-4"
            >
              <div className="w-full aspect-[4/3] bg-[#F1EBE4] rounded-2xl" />
              <div className="w-2/3 h-5 bg-[#F1EBE4] rounded-md" />
              <div className="w-full h-3 bg-[#F1EBE4] rounded-md" />
              <div className="w-4/5 h-3 bg-[#F1EBE4] rounded-md" />
            </div>
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-20 bg-[#FFFDF9] border border-dashed border-[#E9E1DB] rounded-3xl p-8 space-y-5 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FAF5F0] text-[#CFA6A3] flex items-center justify-center mx-auto border border-[#E9E1DB]">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-editorial-heading text-2xl text-[#302B29]">
              Belum Ada Cerita yang Cocok
            </h3>
            <p className="font-editorial-body text-xs sm:text-sm text-[#8D817B] leading-relaxed">
              Tidak ada kenangan yang sesuai dengan filter pencarian ini. Coba ubah kata kunci atau bersihkan filter.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={resetFilters}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#FAF8F5] hover:bg-[#F1EBE4] border border-[#E9E1DB] text-[#302B29] rounded-full text-xs font-editorial-body transition-colors"
            >
              Tampilkan Semua Kenangan
            </button>
            <Link
              href="/diary/new"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium transition-colors"
            >
              + Tulis Cerita Baru
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-9">
          {memories.map((mem, index) => {
            const tiltClass = CARD_TILTS[index % CARD_TILTS.length];
            const washiTape = WASHI_TAPES[index % WASHI_TAPES.length];

            return (
              <div
                key={mem.id}
                className={`relative group transition-transform duration-300 ease-out will-change-transform ${tiltClass}`}
              >
                {/* Washi Tape Accent at Top Center */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-xs z-20 shadow-xs backdrop-blur-xs pointer-events-none ${washiTape}`}
                  style={{
                    clipPath:
                      "polygon(4% 0%, 96% 0%, 100% 10%, 97% 25%, 100% 40%, 96% 55%, 100% 70%, 97% 85%, 100% 100%, 0% 100%, 3% 85%, 0% 70%, 4% 55%, 0% 40%, 3% 25%, 0% 10%)",
                  }}
                />

                <Link
                  href={`/diary/${mem.id}`}
                  className="block bg-[#FFFDF9] rounded-3xl p-3.5 sm:p-4 border border-[#E9E1DB] shadow-md shadow-[#78655F]/8 hover:shadow-2xl hover:shadow-[#78655F]/15 transition-shadow duration-300 ease-out flex flex-col h-full overflow-hidden"
                >
                  {/* Polaroid-style Framed Photo */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F1EBE4] border border-[#EFE8E1] shadow-inner">
                    <Image
                      src={mem.cover_image_url || "/images/hero.jpg"}
                      alt={mem.title}
                      fill
                      className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Postal Stamp Mood Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-editorial-body text-[#302B29] flex items-center gap-1.5 shadow-sm border border-[#E9E1DB]">
                      <span>{MOODS[mem.mood]?.emoji}</span>
                      <span className="font-medium">{MOODS[mem.mood]?.label}</span>
                    </div>

                    {/* Delete Memory Button */}
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (
                          confirm(
                            `Apakah kamu yakin ingin menghapus kenangan "${mem.title}"? Kenangan ini akan terhapus secara permanen.`
                          )
                        ) {
                          await deleteMemory(mem.id);
                          setMemories((prev) => prev.filter((m) => m.id !== mem.id));
                          setAllMemoriesCount((prev) => Math.max(0, prev - 1));
                          success("Kenangan berhasil dihapus");
                        }
                      }}
                      className="absolute top-3 right-12 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#8D817B] hover:text-rose-600 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-sm opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                      title="Hapus Kenangan"
                      aria-label="Hapus Kenangan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Interactive Favorite Heart Button */}
                    <button
                      onClick={(e) =>
                        handleToggleFavorite(e, mem.id, Boolean(mem.is_favorite))
                      }
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-sm ${
                        mem.is_favorite
                          ? "bg-white text-[#CFA6A3] scale-110 shadow-rose-200"
                          : "bg-white/80 hover:bg-white text-[#8D817B] hover:text-[#CFA6A3]"
                      }`}
                      title={
                        mem.is_favorite
                          ? "Hapus dari favorit"
                          : "Tandai sebagai favorit"
                      }
                      aria-label="Toggle Favorite"
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          mem.is_favorite
                            ? "fill-[#CFA6A3] text-[#CFA6A3] scale-110"
                            : ""
                        }`}
                      />
                    </button>

                    {/* Media count pill if multiple */}
                    {mem.media && mem.media.length > 1 && (
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-editorial-body flex items-center gap-1 shadow-sm">
                        <Camera className="w-3 h-3" />
                        <span>{mem.media.length} foto</span>
                      </div>
                    )}
                  </div>

                  {/* Card Editorial Information */}
                  <div className="pt-4 px-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Date & Location in warm handwritten-like cursive font */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#8D817B] mb-2 font-editorial-quote text-[15px]">
                        <span className="flex items-center gap-1 text-[#78655F]">
                          <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
                          {formatDateIndo(mem.event_date)}
                        </span>
                        {mem.location_name && (
                          <>
                            <span className="text-[#CFA6A3]">•</span>
                            <span className="flex items-center gap-1 truncate max-w-[170px] text-[#78655F]">
                              <MapPin className="w-3.5 h-3.5 text-[#CFA6A3]" />
                              {mem.location_name}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Memory Title */}
                      <h3 className="font-editorial-heading text-xl font-medium text-[#302B29] line-clamp-1 group-hover:text-[#B88582] transition-colors">
                        {mem.title}
                      </h3>

                      {/* Story Excerpt */}
                      <p className="font-editorial-body text-xs sm:text-[13px] text-[#78655F] mt-2 line-clamp-3 leading-relaxed">
                        {mem.story}
                      </p>

                      {/* Tags */}
                      {mem.tags && mem.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-3">
                          {mem.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF5F0] border border-[#E9E1DB] text-[#8D817B]"
                            >
                              #{tag}
                            </span>
                          ))}
                          {mem.tags.length > 3 && (
                            <span className="text-[10px] text-[#8D817B]">
                              +{mem.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Bar */}
                    <div className="pt-4 mt-4 border-t border-[#E9E1DB]/70 flex items-center justify-between text-xs font-editorial-body text-[#8D817B]">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F5ECE5] text-[#78655F] font-medium">
                        {CATEGORIES[mem.category]?.label || "Momen"}
                      </span>

                      <span className="text-[#CFA6A3] font-medium group-hover:text-[#B88582] group-hover:translate-x-1 transition-all inline-flex items-center gap-1 text-[12px]">
                        <span>Buka Lembaran</span>
                        <span>⟶</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
