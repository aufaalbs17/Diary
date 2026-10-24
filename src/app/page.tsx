"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  BookOpen,
  Image as ImageIcon,
  Video,
  MapPin,
  Calendar,
  Shuffle,
  ArrowRight,
  Heart,
  Quote,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DiaryStats, Memory, MOODS } from "@/lib/types";
import { getDiaryStats, getMemories, getRandomMemory } from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function HomePage() {
  const router = useRouter();
  const { user, partner, space } = useAuth();
  const [stats, setStats] = useState<DiaryStats>({
    totalMemories: 0,
    totalPhotos: 0,
    totalVideos: 0,
    totalPlaces: 0,
  });
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [featuredMemory, setFeaturedMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true);
      const currentStats = await getDiaryStats();
      const memories = await getMemories({ sortBy: "newest" });
      setStats(currentStats);
      setRecentMemories(memories.slice(0, 4));

      // Featured: first favorite or latest memory
      const featured = memories.find((m) => m.is_favorite) || memories[0] || null;
      setFeaturedMemory(featured);
      setIsLoading(false);
    }
    loadHomeData();
  }, []);

  const handleRandomMemory = async () => {
    const random = await getRandomMemory();
    if (random) {
      router.push(`/diary/${random.id}`);
    }
  };

  const formatDateIndo = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. Welcome Greeting Section */}
      <section className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#E9E1DB]/70">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EBE4] text-[#78655F] text-xs font-editorial-body mb-3">
            <span>{space?.name || "Ruang Kecil Kita"}</span>
            <span className="text-[#CFA6A3]">♡</span>
            <span>
              {user?.nickname || "Kita"} & {partner?.nickname || "Kamu"}
            </span>
          </div>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight">
            Hello, welcome to our little space ♡
          </h1>
          <p className="font-editorial-quote text-lg sm:text-xl text-[#78655F] italic mt-2">
            &ldquo;Karena setiap momen kecil punya cerita yang layak dikenang.&rdquo;
          </p>
        </div>

        {/* Quick Add and Random Memory Buttons */}
        <div className="flex items-center justify-center sm:justify-start gap-3 shrink-0">
          <button
            onClick={handleRandomMemory}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E9E1DB] hover:border-[#CFA6A3] text-[#78655F] hover:text-[#302B29] rounded-full text-xs sm:text-sm font-editorial-body transition-all shadow-xs active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#CFA6A3]" />
            <span>Kenangan Acak ✨</span>
          </button>

          <Link
            href="/diary/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Cerita Baru</span>
          </Link>
        </div>
      </section>

      {/* 2. Our Memories Stats Section (No anniversary/dating counters!) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="paper-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#F1EBE4] text-[#78655F] flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-[#CFA6A3]" />
          </div>
          <div>
            <p className="font-editorial-heading text-3xl sm:text-4xl font-normal text-[#302B29]">
              {stats.totalMemories}
            </p>
            <p className="text-xs text-[#8D817B] font-editorial-body mt-1">
              Cerita Kenangan
            </p>
          </div>
        </div>

        <div className="paper-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#F1EBE4] text-[#78655F] flex items-center justify-center mb-4">
            <ImageIcon className="w-5 h-5 text-[#CFA6A3]" />
          </div>
          <div>
            <p className="font-editorial-heading text-3xl sm:text-4xl font-normal text-[#302B29]">
              {stats.totalPhotos}
            </p>
            <p className="text-xs text-[#8D817B] font-editorial-body mt-1">
              Foto Tersimpan
            </p>
          </div>
        </div>

        <div className="paper-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#F1EBE4] text-[#78655F] flex items-center justify-center mb-4">
            <Video className="w-5 h-5 text-[#CFA6A3]" />
          </div>
          <div>
            <p className="font-editorial-heading text-3xl sm:text-4xl font-normal text-[#302B29]">
              {stats.totalVideos}
            </p>
            <p className="text-xs text-[#8D817B] font-editorial-body mt-1">
              Klip Video
            </p>
          </div>
        </div>

        <div className="paper-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#F1EBE4] text-[#78655F] flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5 text-[#CFA6A3]" />
          </div>
          <div>
            <p className="font-editorial-heading text-3xl sm:text-4xl font-normal text-[#302B29]">
              {stats.totalPlaces}
            </p>
            <p className="text-xs text-[#8D817B] font-editorial-body mt-1">
              Tempat Dijelajahi
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Memory Section */}
      {featuredMemory && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#CFA6A3] text-sm">✦</span>
              <h2 className="font-editorial-heading text-xl sm:text-2xl font-normal text-[#302B29]">
                Kenangan Pilihan
              </h2>
            </div>
            <Link
              href={`/diary/${featuredMemory.id}`}
              className="text-xs font-editorial-body text-[#78655F] hover:text-[#302B29] flex items-center gap-1 group"
            >
              <span>Baca Selengkapnya</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="paper-card rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 group">
            {/* Cover image */}
            <div className="relative lg:col-span-7 h-72 sm:h-96 lg:h-auto overflow-hidden">
              <Image
                src={featuredMemory.cover_image_url || "/images/hero.jpg"}
                alt={featuredMemory.title}
                fill
                className="object-cover group-hover:scale-102 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-editorial-body text-[#302B29] border border-white/40 shadow-xs flex items-center gap-1.5">
                <span>{MOODS[featuredMemory.mood]?.emoji}</span>
                <span>{MOODS[featuredMemory.mood]?.label}</span>
              </div>
            </div>

            {/* Content description */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-[#8D817B]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
                    {formatDateIndo(featuredMemory.event_date)}
                  </span>
                  {featuredMemory.location_name && (
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#CFA6A3]" />
                      {featuredMemory.location_name}
                    </span>
                  )}
                </div>

                <h3 className="font-editorial-heading text-2xl sm:text-3xl font-medium text-[#302B29] leading-snug">
                  {featuredMemory.title}
                </h3>

                <p className="font-editorial-body text-sm text-[#78655F] leading-relaxed line-clamp-4">
                  {featuredMemory.story}
                </p>

                {/* Tags */}
                {featuredMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {featuredMemory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E9E1DB] text-[#8D817B]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[#E9E1DB]/60 flex items-center justify-between text-xs text-[#8D817B]">
                <span>Ditulis oleh {featuredMemory.author_name}</span>
                <Link
                  href={`/diary/${featuredMemory.id}`}
                  className="font-medium text-[#B88582] hover:text-[#78655F] transition-colors"
                >
                  Buka Jurnal →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Recent Memories Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial-heading text-xl sm:text-2xl font-normal text-[#302B29]">
              Cerita Terbaru
            </h2>
            <p className="text-xs text-[#8D817B] font-editorial-body mt-0.5">
              Momen-momen terakhir yang kita tulis bersama.
            </p>
          </div>
          <Link
            href="/diary"
            className="text-xs font-editorial-body text-[#78655F] hover:text-[#302B29] flex items-center gap-1 group"
          >
            <span>Semua Cerita</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentMemories.map((mem) => (
            <Link
              key={mem.id}
              href={`/diary/${mem.id}`}
              className="paper-card rounded-3xl overflow-hidden flex flex-col group transition-all"
            >
              {/* Photo */}
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

              {/* Text */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8D817B] mb-2">
                    <span>{formatDateIndo(mem.event_date)}</span>
                    {mem.location_name && (
                      <>
                        <span>•</span>
                        <span className="truncate">{mem.location_name}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-editorial-heading text-lg font-medium text-[#302B29] line-clamp-1 group-hover:text-[#B88582] transition-colors">
                    {mem.title}
                  </h3>
                  <p className="font-editorial-body text-xs text-[#78655F] mt-2 line-clamp-2 leading-relaxed">
                    {mem.story}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E9E1DB]/60 flex items-center justify-between text-[11px] text-[#8D817B]">
                  <span>{mem.media.length} foto / media</span>
                  <span className="text-[#CFA6A3] group-hover:translate-x-1 transition-transform">
                    Baca →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Editorial Quote Banner */}
      <section className="rounded-3xl bg-[#F1EBE4]/60 border border-[#E9E1DB] p-8 sm:p-12 text-center relative overflow-hidden">
        <Quote className="w-12 h-12 text-[#CFA6A3]/30 mx-auto mb-4" />
        <p className="font-editorial-quote text-2xl sm:text-3xl text-[#302B29] italic max-w-2xl mx-auto leading-relaxed">
          &ldquo;Beberapa momen terlalu indah untuk sekadar lewat begitu saja.&rdquo;
        </p>
        <p className="font-editorial-body text-xs text-[#8D817B] mt-4 uppercase tracking-widest font-mono">
          Our Little Moments 🤍
        </p>
      </section>
    </div>
  );
}
