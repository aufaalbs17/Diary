"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Calendar,
  MapPin,
  Heart,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Memory, MOODS } from "@/lib/types";
import { getMemories } from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function TimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
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

  const years = Array.from(
    new Set(memories.map((m) => m.event_date.split("-")[0]))
  ).sort((a, b) => b.localeCompare(a));

  const filtered = memories.filter((m) => {
    if (selectedYear !== "all") {
      return m.event_date.startsWith(selectedYear);
    }
    return true;
  });

  const formatDateIndo = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
            Jejak Langkah
          </span>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
            Our Timeline.
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-2 max-w-xl">
            Alur kronologis setiap pengalaman dan momen nyata yang kita bagikan bersama dari waktu ke waktu.
          </p>
        </div>

        {/* Year Selector */}
        {years.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white border border-[#E9E1DB] rounded-full p-1 text-xs self-start sm:self-auto">
            <button
              onClick={() => setSelectedYear("all")}
              className={`px-3.5 py-1.5 rounded-full font-editorial-body transition-colors ${
                selectedYear === "all"
                  ? "bg-[#302B29] text-white"
                  : "text-[#78655F] hover:bg-[#FAF8F5]"
              }`}
            >
              Semua Tahun
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3.5 py-1.5 rounded-full font-editorial-body transition-colors ${
                  selectedYear === y
                    ? "bg-[#302B29] text-white"
                    : "text-[#78655F] hover:bg-[#FAF8F5]"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Stream */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#8D817B]">
          Memuat garis waktu perjalanan kita...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E9E1DB] rounded-3xl p-8 max-w-md mx-auto">
          <p className="font-editorial-body text-xs text-[#8D817B]">
            Belum ada cerita yang dicatat pada rentang tahun ini.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#E9E1DB] ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12 py-4">
          {filtered.map((mem) => (
            <div key={mem.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-6 w-4 h-4 rounded-full bg-white border-3 border-[#CFA6A3] group-hover:scale-125 transition-transform shadow-xs" />

              {/* Card */}
              <div className="paper-card rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 bg-white">
                <div className="relative md:col-span-5 aspect-[16/10] md:aspect-auto overflow-hidden bg-[#F1EBE4]">
                  <Image
                    src={mem.cover_image_url || "/images/hero.jpg"}
                    alt={mem.title}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-editorial-body text-[#302B29] flex items-center gap-1 shadow-xs">
                    <span>{MOODS[mem.mood]?.emoji}</span>
                    <span>{MOODS[mem.mood]?.label}</span>
                  </div>
                </div>

                <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#8D817B]">
                      <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
                      <span className="font-medium text-[#78655F]">
                        {formatDateIndo(mem.event_date)}
                      </span>
                      {mem.location_name && (
                        <>
                          <span>•</span>
                          <span className="truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#CFA6A3]" />
                            {mem.location_name}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-editorial-heading text-xl sm:text-2xl font-medium text-[#302B29]">
                      {mem.title}
                    </h3>

                    <p className="font-editorial-body text-xs sm:text-sm text-[#78655F] leading-relaxed line-clamp-3">
                      {mem.story}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E9E1DB]/60 flex items-center justify-between text-xs">
                    <span className="text-[#8D817B]">
                      Ditulis oleh {mem.author_name}
                    </span>
                    <Link
                      href={`/diary/${mem.id}`}
                      className="text-[#CFA6A3] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Buka Momen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
