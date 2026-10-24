"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  MapPin,
  Heart,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Memory, MOODS } from "@/lib/types";
import { getMemories } from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function BookViewPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getMemories({ sortBy: "oldest" });
      setMemories(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const totalPages = memories.length;
  const currentMemory = memories[currentPageIndex] || null;

  const handlePrev = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
  };

  const handleNext = () => {
    if (currentPageIndex < totalPages - 1)
      setCurrentPageIndex(currentPageIndex + 1);
  };

  const formatDateIndo = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEEE, d MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
            Buku Kenangan Interaktif
          </span>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
            Book View.
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-2 max-w-xl">
            Buka lembaran kenangan kita layaknya membaca buku harian fisik bersampul hangat.
          </p>
        </div>

        {/* Page indicator & navigation */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs text-[#8D817B] font-editorial-body">
            Lembar {currentPageIndex + 1} dari {totalPages || 1}
          </span>
          <div className="flex items-center gap-1.5 bg-white border border-[#E9E1DB] rounded-full p-1 shadow-2xs">
            <button
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#78655F] disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Lembar Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPageIndex >= totalPages - 1}
              className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#78655F] disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Lembar Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-xs text-[#8D817B]">
          Membuka lembaran buku...
        </div>
      ) : !currentMemory ? (
        <div className="text-center py-20 bg-white border border-[#E9E1DB] rounded-3xl p-8 max-w-md mx-auto space-y-3">
          <BookOpen className="w-8 h-8 text-[#CFA6A3] mx-auto" />
          <h3 className="font-editorial-heading text-lg text-[#302B29]">
            Belum Ada Halaman Cerita
          </h3>
          <p className="font-editorial-body text-xs text-[#8D817B]">
            Tambahkan cerita pertama di Our Diary untuk melihatnya dalam format buku.
          </p>
        </div>
      ) : (
        /* The Two-Page Book Spread (Desktop) / Single-Page (Mobile) */
        <div className="relative paper-card rounded-3xl sm:rounded-4xl overflow-hidden bg-white border-2 border-[#E9E1DB] shadow-2xl shadow-[#78655F]/15">
          {/* Subtle center spine seam on desktop */}
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-black/5 via-transparent to-black/5 pointer-events-none z-20" />

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">
            {/* Left Page: Cover Photo, Date, Location, Stamp */}
            <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E9E1DB] bg-[#FAF8F5]/50 relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#8D817B]">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
                    {formatDateIndo(currentMemory.event_date)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F1EBE4] text-[#78655F] text-[11px]">
                    {MOODS[currentMemory.mood]?.emoji}{" "}
                    {MOODS[currentMemory.mood]?.label}
                  </span>
                </div>

                {/* Editorial Photo Frame */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border-4 border-white shadow-md shadow-[#78655F]/10 group">
                  <Image
                    src={currentMemory.cover_image_url || "/images/hero.jpg"}
                    alt={currentMemory.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {currentMemory.is_favorite && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#CFA6A3]">
                      <Heart className="w-4 h-4 fill-[#CFA6A3]" />
                    </div>
                  )}
                </div>

                {currentMemory.location_name && (
                  <p className="text-xs text-[#78655F] flex items-center gap-1.5 italic">
                    <MapPin className="w-3.5 h-3.5 text-[#CFA6A3]" />
                    <span>{currentMemory.location_name}</span>
                  </p>
                )}
              </div>

              {/* Page Number footer */}
              <div className="pt-6 flex items-center justify-between text-xs text-[#8D817B]">
                <span className="font-editorial-quote italic text-sm">
                  Our Little Moments
                </span>
                <span className="font-mono text-[11px]">
                  Hal. {currentPageIndex * 2 + 1}
                </span>
              </div>
            </div>

            {/* Right Page: Title, Story, Handwritten-style Note */}
            <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white relative">
              <div className="space-y-6">
                <div>
                  <h2 className="font-editorial-heading text-2xl sm:text-4xl font-normal text-[#302B29] leading-snug">
                    {currentMemory.title}
                  </h2>
                </div>

                {/* Story text */}
                <p className="font-editorial-body text-sm sm:text-base text-[#302B29] leading-relaxed whitespace-pre-line">
                  {currentMemory.story}
                </p>

                {/* Notes stamp */}
                {currentMemory.notes && currentMemory.notes.length > 0 && (
                  <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E9E1DB] space-y-2 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#78655F] font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#CFA6A3]" />
                      <span>Catatan Pinggir</span>
                    </div>
                    {currentMemory.notes.map((n) => (
                      <p
                        key={n.id}
                        className="font-editorial-quote text-sm text-[#78655F] italic"
                      >
                        &ldquo;{n.note}&rdquo; — {n.author_name}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom right: Link to full memory detail and page number */}
              <div className="pt-6 border-t border-[#E9E1DB]/60 flex items-center justify-between text-xs text-[#8D817B]">
                <Link
                  href={`/diary/${currentMemory.id}`}
                  className="text-[#CFA6A3] hover:underline flex items-center gap-1 font-medium font-editorial-body"
                >
                  <span>Buka di Jurnal Penuh</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <span className="font-mono text-[11px]">
                  Hal. {currentPageIndex * 2 + 2}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
