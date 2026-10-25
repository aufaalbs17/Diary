"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Video,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  Heart,
  Search,
  Sparkles,
  Layers,
  LayoutGrid,
  Film,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Trash2,
} from "lucide-react";
import { CATEGORIES, CategoryKey, MOODS } from "@/lib/types";
import { GalleryItem, getGalleryMedia, deleteGalleryMedia } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type ViewMode = "polaroid" | "masonry" | "filmstrip";

const WASHI_PATTERNS = [
  "repeating-linear-gradient(45deg, rgba(207,166,163,0.55) 0px, rgba(207,166,163,0.55) 8px, rgba(241,235,228,0.55) 8px, rgba(241,235,228,0.55) 16px)",
  "repeating-linear-gradient(-45deg, rgba(212,170,125,0.55) 0px, rgba(212,170,125,0.55) 8px, rgba(241,235,228,0.55) 8px, rgba(241,235,228,0.55) 16px)",
  "repeating-linear-gradient(45deg, rgba(166,137,124,0.55) 0px, rgba(166,137,124,0.55) 8px, rgba(241,235,228,0.55) 8px, rgba(241,235,228,0.55) 16px)",
  "repeating-linear-gradient(-45deg, rgba(196,142,154,0.55) 0px, rgba(196,142,154,0.55) 8px, rgba(241,235,228,0.55) 8px, rgba(241,235,228,0.55) 16px)",
];

const POLAROID_ROTATIONS = [
  "-rotate-1.5",
  "rotate-2",
  "-rotate-1",
  "rotate-1.5",
  "-rotate-2",
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMediaType, setSelectedMediaType] = useState<
    "all" | "image" | "video"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("polaroid");
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success } = useToast();

  const handleDeleteItem = async (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    if (
      confirm(
        `Apakah kamu yakin ingin menghapus foto "${item.caption || item.memory_title}" dari galeri?`
      )
    ) {
      await deleteGalleryMedia(item.id, item.memory_id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (activeMediaIndex !== null) {
        setActiveMediaIndex(null);
      }
      success("Foto berhasil dihapus dari galeri");
    }
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getGalleryMedia();
      setItems(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const formatDateIndo = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (selectedMediaType !== "all" && item.file_type !== selectedMediaType) {
        return false;
      }
      if (onlyFavorites && !item.is_favorite) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.memory_title.toLowerCase().includes(q);
        const matchLocation = item.location_name?.toLowerCase().includes(q);
        const matchCaption = item.caption?.toLowerCase().includes(q);
        if (!matchTitle && !matchLocation && !matchCaption) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCategory, selectedMediaType, onlyFavorites, searchQuery]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMediaIndex === null) return;
      if (e.key === "Escape") {
        setActiveMediaIndex(null);
      } else if (e.key === "ArrowLeft") {
        handlePrevMedia();
      } else if (e.key === "ArrowRight") {
        handleNextMedia();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMediaIndex, filteredItems.length]);

  const handlePrevMedia = () => {
    if (activeMediaIndex !== null && activeMediaIndex > 0) {
      setActiveMediaIndex(activeMediaIndex - 1);
    } else if (activeMediaIndex === 0 && filteredItems.length > 0) {
      setActiveMediaIndex(filteredItems.length - 1); // Loop to last
    }
  };

  const handleNextMedia = () => {
    if (
      activeMediaIndex !== null &&
      activeMediaIndex < filteredItems.length - 1
    ) {
      setActiveMediaIndex(activeMediaIndex + 1);
    } else if (
      activeMediaIndex === filteredItems.length - 1 &&
      filteredItems.length > 0
    ) {
      setActiveMediaIndex(0); // Loop to first
    }
  };

  const activeMedia =
    activeMediaIndex !== null ? filteredItems[activeMediaIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Gallery Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EBE4] border border-[#E9E1DB] text-[#78655F] text-xs font-editorial-body mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#CFA6A3]" />
            <span>Album Visual Aufa &amp; Anathia</span>
          </div>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight">
            Memory Gallery 🎞️
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-1.5 max-w-xl leading-relaxed">
            Setiap potret, senyum, dan rekaman detik berharga yang pernah kita
            abadikan bersama, tertata manis dalam album penuh kehangatan.
          </p>
        </div>

        {/* View Mode Switcher Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <div className="flex items-center bg-white border border-[#E9E1DB] rounded-full p-1 shadow-2xs">
            <button
              onClick={() => setViewMode("polaroid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-editorial-body transition-all ${
                viewMode === "polaroid"
                  ? "bg-[#CFA6A3] text-white shadow-xs font-medium"
                  : "text-[#78655F] hover:text-[#302B29]"
              }`}
              title="Tampilan Polaroid Scrapbook"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Polaroid</span>
            </button>
            <button
              onClick={() => setViewMode("masonry")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-editorial-body transition-all ${
                viewMode === "masonry"
                  ? "bg-[#CFA6A3] text-white shadow-xs font-medium"
                  : "text-[#78655F] hover:text-[#302B29]"
              }`}
              title="Tampilan Grid Editorial"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Editorial</span>
            </button>
            <button
              onClick={() => setViewMode("filmstrip")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-editorial-body transition-all ${
                viewMode === "filmstrip"
                  ? "bg-[#CFA6A3] text-white shadow-xs font-medium"
                  : "text-[#78655F] hover:text-[#302B29]"
              }`}
              title="Tampilan Roll Film 35mm"
            >
              <Film className="w-3.5 h-3.5" />
              <span>35mm Film</span>
            </button>
          </div>

          <div className="text-xs text-[#8D817B] font-mono px-2 py-1 rounded-full bg-[#FAF8F5] border border-[#E9E1DB]">
            {filteredItems.length} Potret
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter & Search Bar */}
      <div className="space-y-4">
        {/* Top Filters Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full font-editorial-body transition-all shrink-0 whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-[#302B29] text-white shadow-xs font-medium"
                  : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
              }`}
            >
              Semua Kategori
            </button>
            {Object.entries(CATEGORIES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3.5 py-1.5 rounded-full font-editorial-body transition-all shrink-0 whitespace-nowrap ${
                  selectedCategory === key
                    ? "bg-[#302B29] text-white shadow-xs font-medium"
                    : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[240px] shrink-0">
            <Search className="w-3.5 h-3.5 text-[#8D817B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi atau takarir..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E9E1DB] rounded-full text-xs text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D817B] hover:text-[#302B29]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-Filters Row: Media Type & Favorites */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2">
            {/* Media Type Toggle */}
            <div className="flex items-center gap-1 bg-white border border-[#E9E1DB] rounded-full p-1 shadow-2xs">
              <button
                onClick={() => setSelectedMediaType("all")}
                className={`px-3 py-1 rounded-full transition-colors ${
                  selectedMediaType === "all"
                    ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                    : "text-[#8D817B] hover:text-[#302B29]"
                }`}
              >
                Semua Format
              </button>
              <button
                onClick={() => setSelectedMediaType("image")}
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  selectedMediaType === "image"
                    ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                    : "text-[#8D817B] hover:text-[#302B29]"
                }`}
              >
                <ImageIcon className="w-3 h-3 text-[#CFA6A3]" />
                <span>Foto Saja</span>
              </button>
              <button
                onClick={() => setSelectedMediaType("video")}
                className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  selectedMediaType === "video"
                    ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                    : "text-[#8D817B] hover:text-[#302B29]"
                }`}
              >
                <Video className="w-3 h-3 text-[#CFA6A3]" />
                <span>Video Saja</span>
              </button>
            </div>

            {/* Favorite Only Filter */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all shadow-2xs ${
                onlyFavorites
                  ? "bg-[#CFA6A3] border-[#B88582] text-white font-medium"
                  : "bg-white border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  onlyFavorites
                    ? "fill-white text-white"
                    : "text-[#CFA6A3] fill-[#CFA6A3]"
                }`}
              />
              <span>Momen Terpilih</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Gallery Canvas */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-white border border-[#E9E1DB] rounded-3xl animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-white border border-[#E9E1DB] rounded-3xl p-8 max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E9E1DB] text-[#CFA6A3] flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-editorial-heading text-lg text-[#302B29]">
            Belum Ada Potret Ditemukan
          </h3>
          <p className="font-editorial-body text-xs text-[#8D817B] leading-relaxed">
            Coba ubah kata kunci pencarian atau pilih kategori lain untuk melihat
            koleksi foto kenangan kita.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedMediaType("all");
              setOnlyFavorites(false);
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-[#F1EBE4] hover:bg-[#E9E1DB] text-[#302B29] rounded-full text-xs font-editorial-body transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        /* Dynamic Layout Renderer based on viewMode */
        <div>
          {/* ============================================================== */}
          {/* MODE 1: POLAROID SCRAPBOOK (Organic, washi tape, cursive tags) */}
          {/* ============================================================== */}
          {viewMode === "polaroid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10 pt-4">
              {filteredItems.map((item, idx) => {
                const rotation =
                  POLAROID_ROTATIONS[idx % POLAROID_ROTATIONS.length];
                const washiPattern =
                  WASHI_PATTERNS[idx % WASHI_PATTERNS.length];

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`cursor-pointer group transform ${rotation} hover:rotate-0 hover:scale-102 transition-transform duration-300 ease-out will-change-transform relative`}
                  >
                    {/* Washi tape on top center */}
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-6 border border-white/60 backdrop-blur-xs transform -rotate-1 z-20 shadow-xs pointer-events-none"
                      style={{ background: washiPattern }}
                    />

                    {/* Polaroid Card Shell */}
                    <div className="bg-[#FFFDF9] border border-[#EBE3D7] rounded-xs p-3.5 pb-8 sm:p-4 sm:pb-9 shadow-lg shadow-[#78655F]/10 group-hover:shadow-2xl group-hover:shadow-[#78655F]/20 transition-shadow">
                      {/* Photo Container */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xs bg-[#F4EFEA] border border-[#EBE3D7]">
                        {item.file_type === "video" ? (
                          <div className="w-full h-full relative">
                            <video
                              src={item.file_path}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#302B29] shadow-md group-hover:scale-110 transition-transform">
                                <Video className="w-5 h-5 text-[#CFA6A3]" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.file_path}
                            alt={item.caption || item.memory_title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
                          />
                        )}

                        {/* Top Badges (Favorite & Mood) */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                          {item.is_favorite && (
                            <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#CFA6A3] shadow-xs">
                              <Heart className="w-3.5 h-3.5 fill-[#CFA6A3]" />
                            </div>
                          )}
                          {item.mood && (
                            <div className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[11px] shadow-xs font-editorial-body">
                              {MOODS[item.mood]?.emoji}
                            </div>
                          )}
                        </div>

                        {/* Hover Overlay with expand prompt */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-white/90 text-[#302B29] text-[11px] font-editorial-body font-medium shadow-md flex items-center gap-1">
                            <Maximize2 className="w-3 h-3 text-[#CFA6A3]" />
                            <span>Perbesar</span>
                          </span>
                        </div>
                      </div>

                      {/* Polaroid Handwritten Caption Section */}
                      <div className="pt-3 px-1 space-y-1">
                        <p className="font-editorial-heading text-sm sm:text-base font-medium text-[#302B29] truncate leading-tight group-hover:text-[#B88582] transition-colors">
                          {item.memory_title}
                        </p>
                        {item.caption ? (
                          <p className="font-editorial-quote text-xs sm:text-sm text-[#78655F] italic line-clamp-1 leading-snug">
                            &ldquo;{item.caption}&rdquo;
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#8D817B] font-editorial-body italic">
                            Kenangan manis berdua
                          </p>
                        )}

                        <div className="pt-1.5 border-t border-[#EFE8DF] flex items-center justify-between text-[10px] text-[#8D817B]">
                          <span className="font-mono">
                            {formatDateIndo(item.event_date)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {item.location_name && (
                              <span className="truncate max-w-[110px] italic">
                                📍 {item.location_name}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteItem(e, item)}
                              className="p-1 rounded-full text-[#8D817B] hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                              title="Hapus foto dari galeri"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE 2: EDITORIAL MASONRY (Curated magazine / museum gallery)  */}
          {/* ============================================================== */}
          {viewMode === "masonry" && (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setActiveMediaIndex(idx)}
                  className="break-inside-avoid paper-card rounded-3xl overflow-hidden cursor-pointer group relative bg-white border border-[#E9E1DB] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative w-full overflow-hidden bg-[#F4EFEA]">
                    {item.file_type === "video" ? (
                      <div className="aspect-[4/3] relative">
                        <video
                          src={item.file_path}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#302B29]">
                            <Video className="w-5 h-5 text-[#CFA6A3]" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.file_path}
                        alt={item.caption || item.memory_title}
                        loading="lazy"
                        className="w-full h-auto object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    )}

                    {/* Gradient Overlay & Editorial Caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                      <div className="flex items-center gap-1.5 text-[11px] text-white/80 font-mono mb-1">
                        <Calendar className="w-3 h-3 text-[#CFA6A3]" />
                        <span>{formatDateIndo(item.event_date)}</span>
                      </div>
                      <p className="font-editorial-heading text-base font-medium leading-snug">
                        {item.memory_title}
                      </p>
                      {item.caption && (
                        <p className="font-editorial-quote text-xs text-white/90 italic mt-0.5 line-clamp-2">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                      )}
                      {item.location_name && (
                        <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-[#CFA6A3]" />
                          <span className="truncate">{item.location_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE 3: 35MM FILMSTRIP (Kodak / Portra analog film roll)       */}
          {/* ============================================================== */}
          {viewMode === "filmstrip" && (
            <div className="p-4 sm:p-6 rounded-3xl bg-[#1E1917] border-2 border-[#382F2A] shadow-2xl space-y-6">
              <div className="flex items-center justify-between text-xs text-[#8D817B] font-mono px-2 border-b border-white/10 pb-3">
                <span className="tracking-widest text-[#D4AA7D]">
                  ✦ 35MM MEMORY NEGATIVE ROLL • AUFA &amp; ANATHIA
                </span>
                <span>ISO 400 • WARM SEPIA</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveMediaIndex(idx)}
                    className="bg-[#2A2320] border border-[#3E3430] rounded-xl p-2.5 space-y-2 cursor-pointer group hover:border-[#D4AA7D] transition-colors"
                  >
                    {/* Top Sprocket Perforations */}
                    <div className="flex justify-between px-1.5">
                      {[1, 2, 3, 4, 5, 6].map((hole) => (
                        <div
                          key={hole}
                          className="w-2.5 h-2 rounded-xs bg-[#1E1917] border border-white/10"
                        />
                      ))}
                    </div>

                    {/* Film Frame Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xs bg-black/50">
                      {item.file_type === "video" ? (
                        <div className="w-full h-full relative">
                          <video
                            src={item.file_path}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Video className="w-6 h-6 text-[#D4AA7D]" />
                          </div>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.file_path}
                          alt={item.caption || item.memory_title}
                          loading="lazy"
                          className="w-full h-full object-cover sepia-20 group-hover:sepia-0 group-hover:scale-103 transition-all duration-500"
                        />
                      )}

                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-[10px] text-[#D4AA7D] font-mono">
                        FRAME {idx + 1}A
                      </div>
                    </div>

                    {/* Bottom Sprocket Perforations */}
                    <div className="flex justify-between px-1.5">
                      {[1, 2, 3, 4, 5, 6].map((hole) => (
                        <div
                          key={hole}
                          className="w-2.5 h-2 rounded-xs bg-[#1E1917] border border-white/10"
                        />
                      ))}
                    </div>

                    {/* Filmstrip Footer text */}
                    <div className="px-1 text-[11px] text-[#E5DDD5]">
                      <p className="font-editorial-heading truncate">
                        {item.memory_title}
                      </p>
                      <p className="text-[9px] text-[#8D817B] font-mono truncate">
                        {formatDateIndo(item.event_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Luxury Cinema Lightbox Modal with Next/Prev Controls */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Top Control Bar */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between text-white z-50">
            <div className="text-xs font-mono text-white/70">
              Media {activeMediaIndex! + 1} dari {filteredItems.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => activeMedia && handleDeleteItem(e, activeMedia)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-white rounded-full bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 transition-colors cursor-pointer"
                title="Hapus foto ini dari galeri"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Foto</span>
              </button>

              <button
                onClick={() => setActiveMediaIndex(null)}
                className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Tutup Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrevMedia}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 backdrop-blur-xs rounded-full transition-all z-50 hover:scale-110 active:scale-95"
            aria-label="Media Sebelumnya (Panah Kiri)"
            title="Sebelumnya (Panah Kiri)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNextMedia}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 backdrop-blur-xs rounded-full transition-all z-50 hover:scale-110 active:scale-95"
            aria-label="Media Berikutnya (Panah Kanan)"
            title="Berikutnya (Panah Kanan)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Media Presentation Display */}
          <div className="relative max-w-4xl max-h-[70vh] w-full flex items-center justify-center px-4">
            {activeMedia.file_type === "video" ? (
              <video
                src={activeMedia.file_path}
                controls
                autoPlay
                className="max-h-[70vh] max-w-full rounded-2xl shadow-2xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeMedia.file_path}
                alt={activeMedia.caption || activeMedia.memory_title}
                className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl border-2 border-white/20"
              />
            )}
          </div>

          {/* Caption & Metadata Footer */}
          <div className="mt-4 text-center text-white max-w-xl space-y-2 px-4 z-40">
            <h3 className="font-editorial-heading text-lg sm:text-2xl font-medium">
              {activeMedia.memory_title}
            </h3>

            {activeMedia.caption && (
              <p className="font-editorial-quote text-sm sm:text-base text-white/90 italic">
                &ldquo;{activeMedia.caption}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/70 pt-2 font-editorial-body">
              <span className="font-mono">
                {formatDateIndo(activeMedia.event_date)}
              </span>

              {activeMedia.location_name && (
                <span>• 📍 {activeMedia.location_name}</span>
              )}

              {activeMedia.author_name && (
                <span>• Oleh {activeMedia.author_name}</span>
              )}

              <Link
                href={`/diary/${activeMedia.memory_id}`}
                className="inline-flex items-center gap-1 text-[#CFA6A3] hover:text-[#E5BEBC] transition-colors font-medium ml-2 underline underline-offset-4"
              >
                <span>Buka Cerita di Jurnal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
