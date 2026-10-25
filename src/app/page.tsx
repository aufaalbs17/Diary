"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  BookOpen,
  Camera,
  MapPin,
  Calendar,
  ArrowRight,
  Heart,
  Mail,
  Lock,
  X,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Eye,
  Send,
  MessageCircle,
  Palette,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { ThemeCustomizerModal } from "@/components/ui/theme-customizer-modal";
import { DiaryStats, LittleNote, Memory, MOODS, CATEGORIES } from "@/lib/types";
import {
  getDiaryStats,
  getLittleNotes,
  getMemories,
  toggleFavorite,
  openLittleNote,
  sendLittleNote,
  deleteMemory,
  deleteLittleNote,
} from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/components/ui/toast-provider";

// Organic tilts for scrapbook cards
const CARD_TILTS = [
  "rotate-[-0.8deg] hover:rotate-0",
  "rotate-[0.7deg] hover:rotate-0",
  "rotate-[-0.5deg] hover:rotate-0",
  "rotate-[0.9deg] hover:rotate-0",
];

// Washi tape textures
const WASHI_TAPES = [
  "bg-gradient-to-r from-[#F8DEDC]/90 via-[#F3C5C0]/85 to-[#F8DEDC]/90 border-y border-[#E2AEAA]/60",
  "bg-gradient-to-r from-[#EAE6DF]/90 via-[#DDD6CC]/85 to-[#EAE6DF]/90 border-y border-[#C9C0B3]/60",
  "bg-gradient-to-r from-[#F5E6D8]/90 via-[#EED4BF]/85 to-[#F5E6D8]/90 border-y border-[#D6B59C]/60",
  "bg-gradient-to-r from-[#E5ECDE]/90 via-[#D3E0C9]/85 to-[#E5ECDE]/90 border-y border-[#B6CAAA]/60",
];

export default function HomePage() {
  const { user, partner, space } = useAuth();
  const { coverPhoto } = useTheme();
  const { success, info } = useToast();

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [stats, setStats] = useState<DiaryStats>({
    totalMemories: 0,
    totalPhotos: 0,
    totalVideos: 0,
    totalNotes: 0,
  });
  const [allMemories, setAllMemories] = useState<Memory[]>([]);
  const [featuredMemory, setFeaturedMemory] = useState<Memory | null>(null);
  const [latestNote, setLatestNote] = useState<LittleNote | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state for memories grid: "all" | "favorites" | "photos" | "dating" | "travel"
  const [activeFilter, setActiveFilter] = useState<
    "all" | "favorites" | "photos" | "dating" | "travel"
  >("all");

  // In-place Quick Modals (avoid kicking user to other pages)
  const [quickViewMemory, setQuickViewMemory] = useState<Memory | null>(null);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isReplyingNote, setIsReplyingNote] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Time-based greeting in Indonesian
  const [greeting, setGreeting] = useState("Selamat Datang");

  const currentNickname =
    user?.nickname ||
    user?.full_name ||
    (user?.id === "user-2" ? "Anathia" : "Aufa");
  const isAnathia =
    user?.id === "user-2" || currentNickname.toLowerCase().includes("anathia");
  const partnerNickname =
    partner?.nickname ||
    partner?.full_name ||
    (isAnathia ? "Aufa" : "Anathia");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      setGreeting("Selamat Pagi ☀️");
    } else if (hour >= 11 && hour < 15) {
      setGreeting("Selamat Siang 🌤️");
    } else if (hour >= 15 && hour < 18) {
      setGreeting("Selamat Sore ☕");
    } else {
      setGreeting("Selamat Malam 🌙");
    }

    async function loadHomeData() {
      setIsLoading(true);
      const [currentStats, memories, notes] = await Promise.all([
        getDiaryStats(),
        getMemories({ sortBy: "newest" }),
        getLittleNotes(),
      ]);

      setStats(currentStats);
      setAllMemories(memories);
      setFavoriteCount(memories.filter((m) => m.is_favorite).length);

      // Featured: first favorite or latest memory
      const featured =
        memories.find((m) => m.is_favorite) || memories[0] || null;
      setFeaturedMemory(featured);

      // Latest sweet note
      if (notes.length > 0) {
        setLatestNote(notes[0]);
      }

      setIsLoading(false);
    }
    loadHomeData();
  }, []);

  // Filtered memories list for the scrapbook
  const filteredMemories = useMemo(() => {
    let list = allMemories;
    if (activeFilter === "favorites") {
      list = list.filter((m) => m.is_favorite);
    } else if (activeFilter === "photos") {
      list = list.filter((m) => (m.media && m.media.length > 0) || m.cover_image_url);
    } else if (activeFilter === "dating") {
      list = list.filter((m) => (m.category as string) === "dating" || m.category === "special" || m.tags.includes("kencan"));
    } else if (activeFilter === "travel") {
      list = list.filter((m) => (m.category as string) === "travel" || m.category === "traveling" || m.category === "jalan_jalan" || m.tags.includes("jalan-jalan"));
    }
    return list.slice(0, 6);
  }, [allMemories, activeFilter]);

  const handleToggleFav = async (
    e: React.MouseEvent,
    memoryId: string,
    currentFav: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = await toggleFavorite(memoryId);
    if (updated) {
      setAllMemories((prev) =>
        prev.map((m) => (m.id === memoryId ? updated : m))
      );
      if (featuredMemory && featuredMemory.id === memoryId) {
        setFeaturedMemory(updated);
      }
      if (quickViewMemory && quickViewMemory.id === memoryId) {
        setQuickViewMemory(updated);
      }
      if (updated.is_favorite) {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.7 },
          colors: ["#E5928C", "#CFA6A3"],
        });
        success("Momen ditandai sebagai favorit bersama ♡");
        setFavoriteCount((c) => c + 1);
      } else {
        info("Dihapus dari daftar favorit.");
        setFavoriteCount((c) => Math.max(0, c - 1));
      }
    }
  };

  // Open Cute Pink Envelope Modal
  const handleOpenEnvelope = async () => {
    if (!latestNote) return;
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#F9CCD0", "#CFA6A3", "#E8A39E"],
    });
    if (!latestNote.is_opened) {
      await openLittleNote(latestNote.id);
      setLatestNote((prev) => (prev ? { ...prev, is_opened: true } : prev));
    }
    setIsEnvelopeOpen(true);
  };

  // Send a quick reply to the sweet note inline
  const handleSendQuickReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !latestNote) return;
    setIsSendingReply(true);
    try {
      await sendLittleNote({
        recipient_id: latestNote.sender_id,
        recipient_name: latestNote.sender_name,
        title: `Balasan untuk: ${latestNote.title}`,
        message: replyText.trim(),
        emoji: "💌",
      });
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#CFA6A3", "#F8DEDC", "#B88582"],
      });
      success(`Surat balasan manis berhasil dikirimkan ke ${latestNote.sender_name}! ♡`);
      setReplyText("");
      setIsReplyingNote(false);
      setIsEnvelopeOpen(false);
      const notes = await getLittleNotes();
      if (notes.length > 0) setLatestNote(notes[0]);
    } catch {
      info("Gagal mengirim balasan.");
    } finally {
      setIsSendingReply(false);
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
      {/* 1. Grand Editorial Scrapbook Hero Banner with Smooth Motion */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF5F0] to-[#F5ECE5] p-6 sm:p-12 border border-[#E9E1DB] shadow-xl shadow-[#78655F]/5"
      >
        {/* Postal Mark Watermark */}
        <div className="absolute -right-8 -bottom-8 w-56 h-56 rounded-full border-2 border-dashed border-[#CFA6A3]/20 flex items-center justify-center pointer-events-none select-none rotate-12">
          <div className="w-44 h-44 rounded-full border border-[#CFA6A3]/20 flex flex-col items-center justify-center text-[10px] text-[#CFA6A3]/30 font-mono text-center tracking-widest uppercase">
            <span>Aufa &amp; Anathia</span>
            <span className="my-1 text-sm text-[#CFA6A3]/40">🤍</span>
            <span>Little Moments</span>
          </div>
        </div>

        {/* Top Washi Tape accent */}
        <div
          className="absolute -top-3 left-12 w-32 h-6 bg-gradient-to-r from-[#F8DEDC]/90 via-[#F3C5C0]/85 to-[#F8DEDC]/90 border-y border-[#E2AEAA]/60 pointer-events-none shadow-2xs rotate-[-2deg]"
          style={{
            clipPath:
              "polygon(4% 0%, 96% 0%, 100% 15%, 96% 35%, 100% 55%, 96% 75%, 100% 100%, 0% 100%, 4% 75%, 0% 55%, 4% 35%, 0% 15%)",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            {/* Couple Monogram Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-[#E9E1DB] shadow-2xs text-xs font-editorial-body text-[#78655F]"
            >
              <span className="w-2 h-2 rounded-full bg-[#CFA6A3] animate-pulse" />
              <span className="font-medium text-[#302B29]">Aufa</span>
              <span className="text-[#CFA6A3]">♡</span>
              <span className="font-medium text-[#302B29]">Anathia</span>
              <span className="text-[#8D817B]/50">•</span>
              <span className="text-[#8D817B] font-mono text-[11px] uppercase tracking-wider">
                {greeting}
              </span>
            </motion.div>

            {/* Main Greeting Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="font-editorial-heading text-3xl sm:text-5xl lg:text-6xl font-normal text-[#302B29] tracking-tight leading-tight"
            >
              Our Little Moments.
            </motion.h1>

            {/* Poetic Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="font-editorial-quote text-xl sm:text-2xl text-[#78655F] italic leading-relaxed"
            >
              &ldquo;Karena setiap momen kecil punya cerita manis yang layak dikenang selamanya.&rdquo;
            </motion.p>

            {/* Action Buttons with Smooth Spring */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsCustomizerOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white/95 border border-[#E9E1DB] hover:border-[#CFA6A3] text-[#78655F] hover:text-[#302B29] rounded-full text-xs sm:text-sm font-editorial-body transition-all shadow-sm cursor-pointer"
                title="Ganti Foto Sampul Depan atau Wallpaper Latar Belakang"
              >
                <Palette className="w-4 h-4 text-[#CFA6A3]" />
                <span>Ganti Wallpaper &amp; Sampul 🎨</span>
              </motion.button>

              <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/diary/new"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white rounded-full text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tulis Cerita Baru</span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Hero Right: Customizable Polaroid Keepsake of Aufa & Anathia */}
          <div className="relative mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, rotate: 3, scale: 0.95 }}
              animate={{ opacity: 1, rotate: 2, scale: 1 }}
              whileHover={{ rotate: 0, scale: 1.03, y: -4 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              onClick={() => {
                const mem = allMemories.find((m) => m.id === "mem-uniqlo-date") || allMemories[0];
                if (mem) setQuickViewMemory(mem);
              }}
              className="cursor-pointer relative shrink-0 bg-white p-3.5 pb-4 rounded-2xl shadow-xl shadow-[#78655F]/12 border border-[#E8DFD5] w-64 sm:w-72 select-none group"
            >
              {/* Washi tape on top */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-gradient-to-r from-[#F8DEDC]/90 via-[#F3C5C0]/85 to-[#F8DEDC]/90 border-y border-[#E2AEAA]/60 pointer-events-none shadow-2xs rotate-[-1deg] z-20"
                style={{
                  clipPath:
                    "polygon(4% 0%, 96% 0%, 100% 15%, 96% 35%, 100% 55%, 96% 75%, 100% 100%, 0% 100%, 4% 75%, 0% 55%, 4% 35%, 0% 15%)",
                }}
              />

              {/* Photo Frame */}
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#F1EBE4] shadow-inner">
                <Image
                  src={coverPhoto.imageUrl || "/images/uniqlo-date.jpg"}
                  alt={coverPhoto.title || "Aufa & Anathia"}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-300 ease-out"
                  sizes="300px"
                  priority
                  loading="eager"
                  unoptimized
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-editorial-body text-[#302B29] border border-[#E9E1DB] flex items-center gap-1 shadow-xs">
                  <span>{coverPhoto.badgeEmoji || "🛍️"}</span>
                  <span className="font-medium">{coverPhoto.badge || "Uniqlo Date"}</span>
                </div>
              </div>

              {/* Caption */}
              <div className="pt-3 text-center">
                <p className="font-editorial-quote italic text-base sm:text-lg text-[#302B29] font-semibold truncate px-1">
                  {coverPhoto.title || "Aufa & Anathia 🤍"}
                </p>
                <p className="font-mono text-[10px] text-[#8D817B] uppercase tracking-wider mt-0.5 truncate px-1">
                  {coverPhoto.subtitle || "24 OKTOBER 2026 • MATCHING OUTFIT"}
                </p>
              </div>

              {/* Quick Change Badge on Polaroid */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCustomizerOpen(true);
                }}
                title="Ganti Foto Sampul Depan & Wallpaper"
                className="absolute -bottom-2.5 right-3 px-3 py-1 bg-white hover:bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] rounded-full shadow-md text-[10px] font-editorial-body font-medium text-[#78655F] hover:text-[#302B29] flex items-center gap-1.5 transition-colors cursor-pointer z-30"
              >
                <Palette className="w-3 h-3 text-[#CFA6A3]" />
                <span>Ganti Sampul &amp; Tema 🎨</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>



      {/* 2. Interactive Keepsake Stat Box Cards (Click filters/interacts right here!) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#8D817B]">
            Pilih kotak kenangan untuk menyaring cerita di bawah:
          </p>
          {activeFilter !== "all" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setActiveFilter("all")}
              className="text-xs text-[#CFA6A3] hover:text-[#B88582] font-editorial-body flex items-center gap-1 cursor-pointer"
            >
              <span>✕ Reset Saringan</span>
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Memories Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => setActiveFilter("all")}
            className={`cursor-pointer group relative bg-[#FFFDF9] p-5 sm:p-6 rounded-3xl border transition-all flex flex-col justify-between overflow-hidden ${
              activeFilter === "all"
                ? "border-[#CFA6A3] ring-2 ring-[#CFA6A3]/30 shadow-md shadow-[#CFA6A3]/10"
                : "border-[#E9E1DB] shadow-sm hover:border-[#CFA6A3]/60 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-2xs ${
                  activeFilter === "all"
                    ? "bg-[#CFA6A3] text-white scale-105"
                    : "bg-[#FAF5F0] border border-[#E9E1DB] text-[#CFA6A3] group-hover:bg-[#CFA6A3] group-hover:text-white"
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8D817B]">
                {activeFilter === "all" ? "Sedang Aktif ✓" : "Semua Cerita"}
              </span>
            </div>
            <div>
              <p className="font-editorial-heading text-3xl sm:text-4xl font-medium text-[#302B29]">
                {stats.totalMemories}
              </p>
              <p className="text-xs text-[#8D817B] font-editorial-body mt-1">
                Lembaran Kisah Bersama
              </p>
            </div>
          </motion.div>

          {/* Photos & Media Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => setActiveFilter("photos")}
            className={`cursor-pointer group relative bg-[#FFFDF9] p-5 sm:p-6 rounded-3xl border transition-all flex flex-col justify-between overflow-hidden ${
              activeFilter === "photos"
                ? "border-[#CFA6A3] ring-2 ring-[#CFA6A3]/30 shadow-md shadow-[#CFA6A3]/10"
                : "border-[#E9E1DB] shadow-sm hover:border-[#CFA6A3]/60 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-2xs ${
                  activeFilter === "photos"
                    ? "bg-[#CFA6A3] text-white scale-105"
                    : "bg-[#FAF5F0] border border-[#E9E1DB] text-[#CFA6A3] group-hover:bg-[#CFA6A3] group-hover:text-white"
                }`}
              >
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8D817B]">
                {activeFilter === "photos" ? "Sedang Aktif ✓" : "Filter Foto"}
              </span>
            </div>
            <div>
              <p className="font-editorial-heading text-3xl sm:text-4xl font-medium text-[#302B29]">
                {stats.totalPhotos + stats.totalVideos}
              </p>
              <p className="text-xs text-[#8D817B] font-editorial-body mt-1">
                Foto &amp; Rekaman Polaroid
              </p>
            </div>
          </motion.div>

          {/* Little Notes Card (Clicks open interactive pink envelope directly!) */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={handleOpenEnvelope}
            className="cursor-pointer group relative bg-[#FFFDF9] p-5 sm:p-6 rounded-3xl border border-[#E9E1DB] shadow-sm hover:border-[#CFA6A3] hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF5F0] border border-[#E9E1DB] text-[#CFA6A3] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#CFA6A3] group-hover:text-white transition-all shadow-2xs">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#CFA6A3] group-hover:underline">
                Buka Amplop 💌
              </span>
            </div>
            <div>
              <p className="font-editorial-heading text-3xl sm:text-4xl font-medium text-[#302B29]">
                {stats.totalNotes}
              </p>
              <p className="text-xs text-[#8D817B] font-editorial-body mt-1">
                Surat Kasih Berdua 💌
              </p>
            </div>
          </motion.div>

          {/* Favorite Memories Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => setActiveFilter("favorites")}
            className={`cursor-pointer group relative bg-[#FFFDF9] p-5 sm:p-6 rounded-3xl border transition-all flex flex-col justify-between overflow-hidden ${
              activeFilter === "favorites"
                ? "border-[#CFA6A3] ring-2 ring-[#CFA6A3]/30 shadow-md shadow-[#CFA6A3]/10"
                : "border-[#E9E1DB] shadow-sm hover:border-[#CFA6A3]/60 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-2xs ${
                  activeFilter === "favorites"
                    ? "bg-[#CFA6A3] text-white scale-105"
                    : "bg-[#FAF5F0] border border-[#E9E1DB] text-[#CFA6A3] group-hover:bg-[#CFA6A3] group-hover:text-white"
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8D817B]">
                {activeFilter === "favorites" ? "Sedang Aktif ✓" : "Filter Favorit"}
              </span>
            </div>
            <div>
              <p className="font-editorial-heading text-3xl sm:text-4xl font-medium text-[#302B29]">
                {favoriteCount}
              </p>
              <p className="text-xs text-[#8D817B] font-editorial-body mt-1">
                Kenangan Terfavorit ♡
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Featured Memory Scrapbook Folio with Smooth Hover & Quick View */}
      {featuredMemory && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#CFA6A3] text-sm animate-spin-once">✦</span>
              <h2 className="font-editorial-heading text-2xl sm:text-3xl font-normal text-[#302B29]">
                Kenangan Pilihan Hari Ini
              </h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setQuickViewMemory(featuredMemory)}
              className="text-xs font-editorial-body text-[#78655F] hover:text-[#302B29] flex items-center gap-1.5 group cursor-pointer"
            >
              <span>Baca Lembaran Ini</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#CFA6A3]" />
            </motion.button>
          </div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-[#FFFDF9] rounded-3xl sm:rounded-4xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 group border border-[#E9E1DB] shadow-lg shadow-[#78655F]/6"
          >
            {/* Washi Tape Corner Accent */}
            <div className="absolute top-3 left-6 w-24 h-5 bg-[#F8DEDC]/85 rotate-[-3deg] z-20 pointer-events-none rounded-xs border-y border-[#E2AEAA]/50 shadow-2xs" />

            {/* Cover image (Polaroid Frame Style) */}
            <div
              onClick={() => setQuickViewMemory(featuredMemory)}
              className="cursor-pointer relative lg:col-span-7 h-72 sm:h-96 lg:h-auto overflow-hidden bg-[#F1EBE4] p-3 sm:p-4"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner">
                <Image
                  src={featuredMemory.cover_image_url || "/images/hero.jpg"}
                  alt={featuredMemory.title}
                  fill
                  className="object-cover object-top group-hover:scale-104 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />

                {/* Mood Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-editorial-body text-[#302B29] border border-[#E9E1DB] shadow-xs flex items-center gap-1.5">
                  <span>{MOODS[featuredMemory.mood]?.emoji}</span>
                  <span className="font-medium">{MOODS[featuredMemory.mood]?.label}</span>
                </div>

                {/* Favorite Heart Toggle */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.15 }}
                  onClick={(e) =>
                    handleToggleFav(
                      e,
                      featuredMemory.id,
                      Boolean(featuredMemory.is_favorite)
                    )
                  }
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#CFA6A3] shadow-sm cursor-pointer"
                  title="Toggle Favorite"
                  aria-label="Toggle Favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      featuredMemory.is_favorite
                        ? "fill-[#CFA6A3] text-[#CFA6A3]"
                        : "text-[#8D817B]"
                    }`}
                  />
                </motion.button>
              </div>
            </div>

            {/* Content description */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-[#FFFDF9]">
              <div className="space-y-4">
                {/* Date & Location in cursive typography */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#8D817B] font-editorial-quote text-base">
                  <span className="flex items-center gap-1.5 text-[#78655F]">
                    <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
                    {formatDateIndo(featuredMemory.event_date)}
                  </span>
                  {featuredMemory.location_name && (
                    <>
                      <span className="text-[#CFA6A3]">•</span>
                      <span className="flex items-center gap-1.5 text-[#78655F] truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 text-[#CFA6A3]" />
                        {featuredMemory.location_name}
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h3
                  onClick={() => setQuickViewMemory(featuredMemory)}
                  className="cursor-pointer font-editorial-heading text-2xl sm:text-4xl font-normal text-[#302B29] leading-tight hover:text-[#B88582] transition-colors"
                >
                  {featuredMemory.title}
                </h3>

                {/* Story preview with illuminated initial */}
                <p className="font-editorial-body text-sm sm:text-base text-[#78655F] leading-relaxed line-clamp-4">
                  {featuredMemory.story}
                </p>

                {/* Tags */}
                {featuredMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {featuredMemory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF5F0] border border-[#E9E1DB] text-[#8D817B]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer with Instant Quick-View button */}
              <div className="pt-6 mt-6 border-t border-[#E9E1DB]/80 flex items-center justify-between text-xs text-[#8D817B]">
                <span className="font-editorial-quote text-sm text-[#78655F]">
                  Diabadikan oleh {featuredMemory.author_name}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuickViewMemory(featuredMemory)}
                  className="font-medium text-[#CFA6A3] hover:text-[#B88582] inline-flex items-center gap-1.5 text-xs font-editorial-body cursor-pointer"
                >
                  <span>Buka Lembaran</span>
                  <span>⟶</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      )}

      {/* 4. Cute Interactive Pink Envelope Preview (Interactive on page!) */}
      {latestNote && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FBF4F3] via-[#FFFDF9] to-[#FAF5F0] p-6 sm:p-8 border border-[#F2D7D5] shadow-sm group"
        >
          {/* Subtle floating heart in background */}
          <div className="absolute right-6 top-4 text-3xl opacity-15 pointer-events-none animate-gentle-float">
            💖
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div
              onClick={handleOpenEnvelope}
              className="flex items-start gap-4 cursor-pointer group-hover:opacity-95 transition-opacity"
            >
              {/* Cute Interactive Pink Envelope Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -4, 4, 0] }}
                whileTap={{ scale: 0.92 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FCDADB] to-[#F7BEC2] border-2 border-white shadow-md shadow-[#CFA6A3]/30 text-2xl flex items-center justify-center shrink-0"
              >
                {latestNote.emoji || "💌"}
              </motion.div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B88582] font-semibold">
                    Surat Kasih Terbaru
                  </span>
                  <span className="text-[#8D817B] text-xs">•</span>
                  <span className="text-xs text-[#8D817B] font-mono">
                    {formatDateIndo(latestNote.created_at)}
                  </span>
                </div>

                <h4 className="font-editorial-heading text-lg sm:text-xl font-medium text-[#302B29] group-hover:text-[#B88582] transition-colors">
                  Pesan Manis dari {latestNote.sender_name} untuk {latestNote.recipient_name}
                </h4>

                <p className="font-editorial-body text-xs sm:text-sm text-[#78655F] italic line-clamp-1 max-w-xl">
                  {latestNote.unlock_at && new Date(latestNote.unlock_at) > new Date()
                    ? "Surat tersegel rahasia, menanti saat yang tepat untuk dibaca... 🔒"
                    : `&ldquo;${latestNote.message}&rdquo;`}
                </p>
              </div>
            </div>

            {/* Click to Open Envelope Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenEnvelope}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white text-xs font-editorial-body font-medium shadow-md shadow-[#CFA6A3]/30 transition-all shrink-0 active:scale-95 self-end sm:self-auto cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Buka Amplop Pink 💌</span>
            </motion.button>
          </div>
        </motion.section>
      )}

      {/* 5. Scrapbook Grid with Smooth Animated Layout & Filters */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-editorial-heading text-2xl sm:text-3xl font-normal text-[#302B29]">
              Cerita Terbaru Kita
            </h2>
            <p className="text-xs sm:text-sm text-[#8D817B] font-editorial-body mt-0.5">
              Lembaran momen-momen manis yang baru saja kita lalui berdua.
            </p>
          </div>

          {/* Smooth Filter Tabs with layoutId pill */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F1EBE4]/70 rounded-full border border-[#E9E1DB] self-start sm:self-auto overflow-x-auto max-w-full">
            {[
              { id: "all", label: "Semua" },
              { id: "favorites", label: "Favorit ♡" },
              { id: "photos", label: "Polaroid 📸" },
              { id: "dating", label: "Kencan 💕" },
              { id: "travel", label: "Jalan ✈️" },
            ].map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-editorial-body transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "text-[#302B29] font-medium"
                      : "text-[#78655F] hover:text-[#302B29]"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="filter-active-pill"
                      className="absolute inset-0 bg-white border border-[#E9E1DB] rounded-full shadow-2xs -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Cards Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-9">
          <AnimatePresence mode="popLayout">
            {filteredMemories.map((mem, index) => {
              const tiltClass = CARD_TILTS[index % CARD_TILTS.length];
              const washiTape = WASHI_TAPES[index % WASHI_TAPES.length];

              return (
                <motion.div
                  layout
                  key={mem.id}
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  className={`relative group ${tiltClass}`}
                >
                  {/* Washi Tape Accent at Top Center */}
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-xs z-20 shadow-xs pointer-events-none ${washiTape}`}
                    style={{
                      clipPath:
                        "polygon(4% 0%, 96% 0%, 100% 10%, 97% 25%, 100% 40%, 96% 55%, 100% 70%, 97% 85%, 100% 100%, 0% 100%, 3% 85%, 0% 70%, 4% 55%, 0% 40%, 3% 25%, 0% 10%)",
                    }}
                  />

                  {/* Card Container: Clicking opens Instant Quick View Modal directly! */}
                  <div
                    onClick={() => setQuickViewMemory(mem)}
                    className="cursor-pointer block bg-[#FFFDF9] rounded-3xl p-3.5 sm:p-4 border border-[#E9E1DB] shadow-md shadow-[#78655F]/8 hover:shadow-2xl hover:shadow-[#78655F]/15 transition-shadow duration-300 ease-out flex flex-col h-full overflow-hidden will-change-transform"
                  >
                    {/* Polaroid Framed Photo */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F1EBE4] border border-[#EFE8E1] shadow-inner">
                      <Image
                        src={mem.cover_image_url || "/images/hero.jpg"}
                        alt={mem.title}
                        fill
                        className="object-cover object-top group-hover:scale-106 transition-transform duration-700 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      {/* Mood Badge */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-editorial-body text-[#302B29] flex items-center gap-1.5 shadow-sm border border-[#E9E1DB]">
                        <span>{MOODS[mem.mood]?.emoji}</span>
                        <span className="font-medium">{MOODS[mem.mood]?.label}</span>
                      </div>

                      {/* Favorite Heart Button */}
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.15 }}
                        onClick={(e) =>
                          handleToggleFav(e, mem.id, Boolean(mem.is_favorite))
                        }
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer ${
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
                      </motion.button>
                    </div>

                    {/* Card Editorial Information */}
                    <div className="pt-4 px-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Date & Location in cursive typography */}
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
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredMemories.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-[#FFFDF9] border border-[#E9E1DB] rounded-3xl p-8 max-w-md mx-auto">
            <span className="text-3xl">🌿</span>
            <p className="font-editorial-heading text-lg text-[#302B29]">
              Belum ada kenangan di kategori ini
            </p>
            <p className="text-xs text-[#8D817B] font-editorial-body">
              Cobalah memilih saringan lain atau tuliskan cerita baru bersama pasanganmu.
            </p>
            <button
              onClick={() => setActiveFilter("all")}
              className="px-4 py-2 bg-[#F1EBE4] hover:bg-[#E9E1DB] text-[#302B29] rounded-full text-xs font-editorial-body cursor-pointer"
            >
              Lihat Semua Cerita
            </button>
          </div>
        )}
      </section>

      {/* 6. Romantic Editorial Bookplate & Monogram Seal */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F1] to-[#F4ECE3] border border-[#E9E1DB] p-8 sm:p-14 text-center shadow-sm space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#CFA6A3]/60" />
          <span className="text-[#CFA6A3] text-lg font-serif">❧ ❦ ❧</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#CFA6A3]/60" />
        </div>

        <p className="font-editorial-quote text-2xl sm:text-3xl lg:text-4xl text-[#302B29] italic max-w-2xl mx-auto leading-relaxed">
          &ldquo;Beberapa momen terlalu indah untuk sekadar lewat begitu saja.&rdquo;
        </p>

        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#E9E1DB] shadow-2xs">
            <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
              Aufa &amp; Anathia 🤍 Our Little Moments
            </span>
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          MODALS & LIGHTBOXES (Keep user on the page with smooth motion!)
      ========================================================================= */}

      {/* A. CUTE PINK ENVELOPE MODAL (Animasi Amplop Pink Lucu & Lembaran Surat Kasih) */}
      <AnimatePresence>
        {isEnvelopeOpen && latestNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEnvelopeOpen(false);
                setIsReplyingNote(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Pink Envelope & Letter Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", stiffness: 320, damping: 25 }}
              className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-4xl shadow-2xl border border-[#F2D7D5] overflow-hidden z-10"
            >
              {/* Cute Pink Envelope Header simulation */}
              <div className="relative bg-gradient-to-b from-[#FCE8E7] via-[#F8D2D0] to-[#F1B9B5] px-6 pt-6 pb-8 border-b border-[#E9AFA9] text-center">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsEnvelopeOpen(false);
                    setIsReplyingNote(false);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#78655F] flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Wax Seal Stamp in Pink Envelope Flap */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#D98A84] to-[#F4BCB8] border-3 border-white shadow-lg flex items-center justify-center text-3xl mb-3 cursor-pointer select-none"
                >
                  {latestNote.emoji || "💌"}
                </motion.div>

                <p className="text-[11px] uppercase tracking-widest text-[#78655F] font-mono">
                  Surat Kasih untuk {latestNote.recipient_name} ♡
                </p>
                <h3 className="font-editorial-heading text-2xl font-medium text-[#302B29] mt-1">
                  {latestNote.title}
                </h3>
              </div>

              {/* Letter Body Parchment */}
              <div className="p-6 sm:p-8 space-y-6 bg-[#FFFDF9]">
                {/* Parchment Message Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-5 sm:p-6 bg-[#FAF6F0] rounded-2xl border border-[#E9DFC4]/50 shadow-inner space-y-3"
                >
                  <p className="font-editorial-quote text-lg sm:text-xl text-[#302B29] leading-relaxed italic whitespace-pre-line">
                    &ldquo;{latestNote.message}&rdquo;
                  </p>
                </motion.div>

                {/* Sender Info & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8D817B] pt-1">
                  <span className="font-editorial-body text-[11px]">
                    Tertulis: {formatDateIndo(latestNote.created_at)}
                  </span>
                  <span className="font-editorial-quote italic text-base text-[#78655F] font-semibold">
                    Dengan segenap cinta, {latestNote.sender_name} ♡
                  </span>
                </div>

                {/* Quick Reply Form (Slide down when toggled) */}
                <AnimatePresence>
                  {isReplyingNote && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleSendQuickReply}
                      className="space-y-3 pt-3 border-t border-[#E9E1DB] overflow-hidden"
                    >
                      <label className="text-xs font-editorial-body text-[#78655F] block font-medium">
                        Balas langsung untuk {latestNote.sender_name}:
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Tuliskan balasan manismu di sini...`}
                        className="w-full p-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3] resize-none leading-relaxed font-editorial-body"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsReplyingNote(false)}
                          className="px-4 py-2 rounded-full border border-[#E9E1DB] text-xs text-[#78655F] hover:bg-white"
                        >
                          Batal
                        </button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={isSendingReply}
                          className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium shadow-md shadow-[#CFA6A3]/30 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSendingReply ? "Mengirim..." : "Kirim Balasan 💌"}</span>
                        </motion.button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Modal Action Buttons */}
                {!isReplyingNote && (
                  <div className="pt-4 border-t border-[#E9E1DB] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEnvelopeOpen(false)}
                        className="px-4 py-2 rounded-full border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F] hover:bg-[#FAF8F5] cursor-pointer"
                      >
                        Lipat &amp; Simpan
                      </button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          if (latestNote && confirm("Apakah kamu yakin ingin menghapus surat manis ini?")) {
                            await deleteLittleNote(latestNote.id);
                            setLatestNote(null);
                            setStats((prev) => ({
                              ...prev,
                              totalNotes: Math.max(0, prev.totalNotes - 1),
                            }));
                            setIsEnvelopeOpen(false);
                            success("Surat manis berhasil dihapus");
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-rose-200 text-xs font-editorial-body text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Surat Manis"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsReplyingNote(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white text-xs font-editorial-body font-medium shadow-md shadow-[#CFA6A3]/30 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Balas Surat Ini ✍️</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* C. INSTANT QUICK VIEW MEMORY LIGHTBOX (Baca cerita langsung tanpa pindah halaman) */}
      <AnimatePresence>
        {quickViewMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewMemory(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Lightbox */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative w-full max-w-2xl bg-[#FFFDF9] rounded-3xl sm:rounded-4xl shadow-2xl border border-[#E9E1DB] overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header Photo */}
              <div className="relative h-64 sm:h-80 w-full shrink-0 bg-[#F1EBE4]">
                <Image
                  src={quickViewMemory.cover_image_url || "/images/hero.jpg"}
                  alt={quickViewMemory.title}
                  fill
                  className="object-cover object-top"
                />

                {/* Close Button */}
                <button
                  onClick={() => setQuickViewMemory(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Mood Pill */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-editorial-body text-[#302B29] border border-[#E9E1DB] shadow-sm flex items-center gap-1.5">
                  <span>{MOODS[quickViewMemory.mood]?.emoji}</span>
                  <span className="font-medium">{MOODS[quickViewMemory.mood]?.label}</span>
                </div>

                {/* Favorite Heart Toggle */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) =>
                    handleToggleFav(
                      e,
                      quickViewMemory.id,
                      Boolean(quickViewMemory.is_favorite)
                    )
                  }
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#CFA6A3] shadow-md cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      quickViewMemory.is_favorite
                        ? "fill-[#CFA6A3] text-[#CFA6A3]"
                        : "text-[#8D817B]"
                    }`}
                  />
                </motion.button>
              </div>

              {/* Story Content (Scrollable) */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#8D817B] font-editorial-quote text-base">
                  <span className="flex items-center gap-1.5 text-[#78655F]">
                    <Calendar className="w-4 h-4 text-[#CFA6A3]" />
                    {formatDateIndo(quickViewMemory.event_date)}
                  </span>
                  {quickViewMemory.location_name && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 text-[#78655F]">
                        <MapPin className="w-4 h-4 text-[#CFA6A3]" />
                        {quickViewMemory.location_name}
                      </span>
                    </>
                  )}
                </div>

                <h2 className="font-editorial-heading text-2xl sm:text-3xl font-medium text-[#302B29]">
                  {quickViewMemory.title}
                </h2>

                <p className="font-editorial-body text-sm sm:text-base text-[#78655F] leading-relaxed whitespace-pre-line">
                  {quickViewMemory.story}
                </p>

                {/* Tags */}
                {quickViewMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {quickViewMemory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-[#FAF5F0] border border-[#E9E1DB] text-[#8D817B]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Additional Media Gallery if present */}
                {quickViewMemory.media && quickViewMemory.media.length > 0 && (
                  <div className="pt-4 border-t border-[#E9E1DB] space-y-2">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#8D817B]">
                      Koleksi Foto Momen Ini:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {quickViewMemory.media.map((med, idx) => (
                        <div
                          key={med.id || idx}
                          className="relative aspect-square rounded-xl overflow-hidden bg-[#F1EBE4]"
                        >
                          <Image
                            src={med.file_path || "/images/hero.jpg"}
                            alt="Momen"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-[#E9E1DB] bg-[#FAF8F5] flex items-center justify-between">
                <span className="font-editorial-quote italic text-sm text-[#78655F]">
                  Diabadikan oleh {quickViewMemory.author_name}
                </span>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      if (
                        confirm(
                          `Apakah kamu yakin ingin menghapus kenangan "${quickViewMemory.title}"? Kenangan ini akan terhapus secara permanen.`
                        )
                      ) {
                        await deleteMemory(quickViewMemory.id);
                        setAllMemories((prev) =>
                          prev.filter((m) => m.id !== quickViewMemory.id)
                        );
                        setStats((prev) => ({
                          ...prev,
                          totalMemories: Math.max(0, prev.totalMemories - 1),
                        }));
                        setQuickViewMemory(null);
                        success("Kenangan berhasil dihapus");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-rose-200 text-xs font-editorial-body text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Kenangan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </motion.button>

                  <button
                    onClick={() => setQuickViewMemory(null)}
                    className="px-4 py-2 rounded-full border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F] hover:bg-white cursor-pointer"
                  >
                    Tutup
                  </button>

                  <Link
                    href={`/diary/${quickViewMemory.id}`}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#302B29] text-white text-xs font-editorial-body font-medium hover:bg-[#4A3E3B]"
                  >
                    <span>Halaman Detail Penuh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. THEME & COVER PHOTO CUSTOMIZER MODAL */}
      <ThemeCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
}

