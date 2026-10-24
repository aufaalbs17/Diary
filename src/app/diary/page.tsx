"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Heart,
  Calendar,
  MapPin,
  Plus,
  ArrowUpDown,
  X,
  BookOpen,
} from "lucide-react";
import { Memory, MOODS, CATEGORIES, CategoryKey, MoodKey } from "@/lib/types";
import { getMemories } from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function DiaryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getMemories({
        search,
        category: selectedCategory as CategoryKey | "all",
        mood: selectedMood as MoodKey | "all",
        isFavorite: onlyFavorites ? true : undefined,
        sortBy,
      });
      setMemories(data);
      setIsLoading(false);
    }
    loadData();
  }, [search, selectedCategory, selectedMood, onlyFavorites, sortBy]);

  const formatDateIndo = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedMood !== "all" ||
    onlyFavorites;

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedMood("all");
    setOnlyFavorites(false);
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
            Jurnal Kenangan Bersama
          </span>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
            Our Diary.
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-2 max-w-xl">
            Kumpulan cerita, tawa, dan setiap langkah kecil yang kita lalui bersama.
          </p>
        </div>

        <Link
          href="/diary/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Cerita Baru</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8D817B] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul kenangan, cerita, lokasi, atau tag..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E9E1DB] rounded-full text-xs sm:text-sm text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3] transition-colors shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D817B] hover:text-[#302B29]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-editorial-body transition-all shrink-0 ${
                onlyFavorites
                  ? "bg-[#CFA6A3] text-white shadow-xs"
                  : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  onlyFavorites ? "fill-white" : "text-[#CFA6A3]"
                }`}
              />
              <span>Favorit</span>
            </button>

            {/* Sort Toggle */}
            <button
              onClick={() =>
                setSortBy(sortBy === "newest" ? "oldest" : "newest")
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E9E1DB] hover:border-[#CFA6A3] text-[#78655F] rounded-full text-xs font-editorial-body transition-all shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#CFA6A3]" />
              <span>{sortBy === "newest" ? "Terbaru" : "Terlama"}</span>
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full font-editorial-body transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-[#302B29] text-white"
                : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
            }`}
          >
            Semua Kategori
          </button>
          {Object.entries(CATEGORIES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3.5 py-1.5 rounded-full font-editorial-body transition-all shrink-0 ${
                selectedCategory === key
                  ? "bg-[#302B29] text-white"
                  : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Mood Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[#8D817B] text-[11px] shrink-0 font-editorial-body">
            Mood:
          </span>
          <button
            onClick={() => setSelectedMood("all")}
            className={`px-3 py-1 rounded-full font-editorial-body transition-all shrink-0 ${
              selectedMood === "all"
                ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                : "text-[#78655F] hover:bg-[#F1EBE4]/50"
            }`}
          >
            Semua
          </button>
          {Object.entries(MOODS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedMood(key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-editorial-body transition-all shrink-0 ${
                selectedMood === key
                  ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                  : "text-[#78655F] hover:bg-[#F1EBE4]/50"
              }`}
            >
              <span>{config.emoji}</span>
              <span>{config.label}</span>
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#B88582] hover:underline ml-2 shrink-0 font-editorial-body"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Memories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="paper-card rounded-3xl h-80 animate-pulse bg-white p-4"
            >
              <div className="w-full h-44 bg-[#F1EBE4] rounded-2xl mb-4" />
              <div className="w-2/3 h-5 bg-[#F1EBE4] rounded-md mb-2" />
              <div className="w-full h-3 bg-[#F1EBE4] rounded-md mb-2" />
              <div className="w-1/2 h-3 bg-[#F1EBE4] rounded-md" />
            </div>
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E9E1DB] rounded-3xl p-8 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F1EBE4] text-[#CFA6A3] flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-editorial-heading text-xl text-[#302B29]">
            Belum Ada Kenangan yang Cocok
          </h3>
          <p className="font-editorial-body text-xs text-[#8D817B]">
            Tidak menemukan cerita dengan filter yang kamu pilih. Coba sesuaikan kata kunci atau reset filter.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2 bg-[#F1EBE4] hover:bg-[#E9E1DB] text-[#302B29] rounded-full text-xs font-editorial-body transition-colors"
          >
            Tampilkan Semua Kenangan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((mem) => (
            <Link
              key={mem.id}
              href={`/diary/${mem.id}`}
              className="paper-card rounded-3xl overflow-hidden flex flex-col group transition-all"
            >
              {/* Cover Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F1EBE4]">
                <Image
                  src={mem.cover_image_url || "/images/hero.jpg"}
                  alt={mem.title}
                  fill
                  className="object-cover group-hover:scale-104 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-editorial-body text-[#302B29] flex items-center gap-1">
                  <span>{MOODS[mem.mood]?.emoji}</span>
                  <span>{MOODS[mem.mood]?.label}</span>
                </div>
                {mem.is_favorite && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#CFA6A3]">
                    <Heart className="w-3.5 h-3.5 fill-[#CFA6A3]" />
                  </div>
                )}
              </div>

              {/* Memory Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8D817B] mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#CFA6A3]" />
                      {formatDateIndo(mem.event_date)}
                    </span>
                    {mem.location_name && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="w-3 h-3 text-[#CFA6A3]" />
                          {mem.location_name}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-editorial-heading text-lg font-medium text-[#302B29] line-clamp-1 group-hover:text-[#B88582] transition-colors">
                    {mem.title}
                  </h3>

                  <p className="font-editorial-body text-xs text-[#78655F] mt-2 line-clamp-3 leading-relaxed">
                    {mem.story}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E9E1DB]/60 flex items-center justify-between text-[11px] text-[#8D817B]">
                  <span>
                    {CATEGORIES[mem.category]?.label || "Momen"} • {mem.media.length} media
                  </span>
                  <span className="text-[#CFA6A3] font-medium group-hover:translate-x-1 transition-transform">
                    Buka Cerita →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
