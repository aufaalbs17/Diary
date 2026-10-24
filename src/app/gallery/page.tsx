"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Video,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  Filter,
} from "lucide-react";
import { CATEGORIES, CategoryKey } from "@/lib/types";
import { GalleryItem, getGalleryMedia } from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | "image" | "video">("all");
  const [searchLocation, setSearchLocation] = useState("");
  const [activeMedia, setActiveMedia] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }
    if (selectedMediaType !== "all" && item.file_type !== selectedMediaType) {
      return false;
    }
    if (
      searchLocation.trim() &&
      !item.location_name
        ?.toLowerCase()
        .includes(searchLocation.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
            Koleksi Visual
          </span>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
            Memory Gallery.
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-2 max-w-xl">
            Semua momen foto dan video yang pernah kita abadikan, tersimpan rapi dalam satu galeri hangat.
          </p>
        </div>

        <div className="text-xs text-[#8D817B] font-editorial-body self-start sm:self-auto">
          Total {filteredItems.length} media
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category & Media Type */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
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

        {/* Media type toggle */}
        <div className="flex items-center gap-1.5 bg-white border border-[#E9E1DB] rounded-full p-1 text-xs self-start sm:self-auto">
          <button
            onClick={() => setSelectedMediaType("all")}
            className={`px-3 py-1 rounded-full transition-colors ${
              selectedMediaType === "all"
                ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                : "text-[#8D817B]"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedMediaType("image")}
            className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
              selectedMediaType === "image"
                ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                : "text-[#8D817B]"
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Foto</span>
          </button>
          <button
            onClick={() => setSelectedMediaType("video")}
            className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
              selectedMediaType === "video"
                ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                : "text-[#8D817B]"
            }`}
          >
            <Video className="w-3 h-3" />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Responsive Masonry / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-square bg-white border border-[#E9E1DB] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E9E1DB] rounded-3xl p-8 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#F1EBE4] text-[#CFA6A3] flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-editorial-heading text-lg text-[#302B29]">
            Belum Ada Media di Kategori Ini
          </h3>
          <p className="font-editorial-body text-xs text-[#8D817B] mt-1">
            Media akan otomatis muncul saat kamu menambahkan foto dan video ke jurnal.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveMedia(item)}
              className="break-inside-avoid paper-card rounded-2xl overflow-hidden cursor-pointer group relative bg-white"
            >
              <div className="relative w-full overflow-hidden bg-[#F1EBE4]">
                {item.file_type === "video" ? (
                  <div className="aspect-[4/3] relative">
                    <video
                      src={item.file_path}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-[#302B29]">
                        <Video className="w-5 h-5" />
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <p className="font-editorial-heading text-sm font-medium line-clamp-1">
                    {item.memory_title}
                  </p>
                  {item.caption && (
                    <p className="font-editorial-body text-xs text-white/80 line-clamp-2 mt-0.5 italic">
                      &ldquo;{item.caption}&rdquo;
                    </p>
                  )}
                  <span className="text-[10px] text-white/70 mt-1">
                    {formatDateIndo(item.event_date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setActiveMedia(null)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[75vh] w-full flex items-center justify-center">
            {activeMedia.file_type === "video" ? (
              <video
                src={activeMedia.file_path}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-2xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeMedia.file_path}
                alt={activeMedia.caption || activeMedia.memory_title}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl"
              />
            )}
          </div>

          <div className="mt-4 text-center text-white max-w-xl space-y-2">
            <h3 className="font-editorial-heading text-lg font-medium">
              {activeMedia.memory_title}
            </h3>
            {activeMedia.caption && (
              <p className="font-editorial-body text-xs text-white/80 italic">
                &ldquo;{activeMedia.caption}&rdquo;
              </p>
            )}
            <div className="flex items-center justify-center gap-4 text-xs text-white/60 pt-2">
              <span>{formatDateIndo(activeMedia.event_date)}</span>
              {activeMedia.location_name && (
                <span>• {activeMedia.location_name}</span>
              )}
              <Link
                href={`/diary/${activeMedia.memory_id}`}
                className="inline-flex items-center gap-1 text-[#CFA6A3] hover:underline"
              >
                <span>Lihat Jurnal Penuh</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
