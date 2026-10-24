"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Music,
  Maximize2,
  X,
  Send,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  User,
  Quote,
} from "lucide-react";
import { Memory, MOODS, CATEGORIES } from "@/lib/types";
import {
  addMemoryNote,
  deleteMemory,
  getMemoryById,
  toggleFavorite,
} from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/lib/auth-context";

function MemoryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const memoryId = params?.id as string;
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [prevId, setPrevId] = useState<string | undefined>(undefined);
  const [nextId, setNextId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Note addition
  const [selectedAuthor, setSelectedAuthor] = useState<"Aufa" | "Anathia">(
    user?.nickname?.toLowerCase().includes("anathia") ? "Anathia" : "Aufa"
  );
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (!memoryId) return;
      setIsLoading(true);
      const res = await getMemoryById(memoryId);
      setMemory(res.memory);
      setPrevId(res.prevId);
      setNextId(res.nextId);
      setIsLoading(false);
    }
    loadDetail();
  }, [memoryId]);

  const handleToggleFav = async () => {
    if (!memory) return;
    const updated = await toggleFavorite(memory.id);
    if (updated) {
      setMemory(updated);
      if (updated.is_favorite) {
        success("Kenangan ini ditandai sebagai favorit bersama ♡");
      } else {
        info("Dihapus dari daftar favorit.");
      }
    }
  };

  const formatDateIndo = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEEE, d MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !memory) return;

    setIsAddingNote(true);
    try {
      const created = await addMemoryNote(memory.id, newNote);
      // Ensure the author name aligns with chosen author tab
      created.author_name = selectedAuthor;
      setMemory({
        ...memory,
        notes: [...(memory.notes || []), created],
      });
      setNewNote("");
      success(`Catatan kecil dari ${selectedAuthor} berhasil disematkan ♡`);
    } catch (err) {
      error("Gagal menambahkan catatan.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!memory) return;
    setIsDeleting(true);
    try {
      await deleteMemory(memory.id);
      success("Lembaran kenangan telah dihapus.");
      router.push("/diary");
    } catch (err) {
      error("Gagal menghapus kenangan.");
      setIsDeleting(false);
    }
  };

  // Compile all media (cover + gallery) for lightbox
  const allMediaList = React.useMemo(() => {
    if (!memory) return [];
    const list: { url: string; type: "image" | "video"; caption?: string }[] = [];
    if (memory.cover_image_url) {
      list.push({
        url: memory.cover_image_url,
        type: "image",
        caption: memory.title,
      });
    }
    if (memory.media) {
      memory.media.forEach((m) => {
        if (m.file_path !== memory.cover_image_url) {
          list.push({
            url: m.file_path,
            type: m.file_type,
            caption: m.caption,
          });
        }
      });
    }
    return list;
  }, [memory]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#CFA6A3] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-editorial-heading text-lg text-[#78655F] italic">
          Membuka lembaran kenangan Aufa & Anathia...
        </p>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5 bg-[#FFFDF9] border border-[#E9E1DB] rounded-3xl p-8 shadow-sm">
        <h2 className="font-editorial-heading text-2xl text-[#302B29]">
          Lembaran Tidak Ditemukan
        </h2>
        <p className="font-editorial-body text-xs text-[#8D817B]">
          Mungkin cerita ini sudah dipindahkan atau tautan tidak valid.
        </p>
        <Link
          href="/diary"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Jurnal</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Navigation & Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <Link
          href="/diary"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F] hover:text-[#302B29] transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Lembaran Jurnal</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Favorite Toggle */}
          <button
            onClick={handleToggleFav}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-editorial-body border transition-all shadow-2xs ${
              memory.is_favorite
                ? "bg-[#CFA6A3] text-white border-[#CFA6A3]"
                : "bg-white text-[#78655F] border-[#E9E1DB] hover:border-[#CFA6A3]"
            }`}
            title={
              memory.is_favorite
                ? "Hapus dari favorit"
                : "Tandai sebagai favorit"
            }
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                memory.is_favorite ? "fill-white text-white" : "text-[#CFA6A3]"
              }`}
            />
            <span className="hidden sm:inline">
              {memory.is_favorite ? "Favorit" : "Favoritkan"}
            </span>
          </button>

          {/* Book Mode Link */}
          <Link
            href="/book"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#78655F] hover:text-[#302B29] rounded-full border border-[#E9E1DB] text-xs font-editorial-body transition-all shadow-2xs"
            title="Buka dalam Mode Buku"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#CFA6A3]" />
            <span className="hidden sm:inline">Mode Buku</span>
          </Link>

          {/* Edit */}
          <Link
            href={`/diary/${memory.id}/edit`}
            className="p-2 text-[#78655F] hover:text-[#302B29] rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E9E1DB] transition-all shadow-2xs"
            title="Edit Kenangan"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-rose-400 hover:text-rose-600 rounded-full bg-white hover:bg-rose-50 border border-[#E9E1DB] transition-all shadow-2xs"
            title="Hapus Kenangan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grand Open Journal Folio Canvas */}
      <div className="relative bg-[#FFFDF9] rounded-3xl sm:rounded-4xl p-6 sm:p-12 border border-[#EBE3DC] shadow-xl shadow-[#78655F]/8 space-y-10 overflow-hidden">
        {/* Washi Tape Header Accent */}
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-40 h-7 z-20 shadow-xs bg-gradient-to-r from-[#F8DEDC]/90 via-[#F3C5C0]/85 to-[#F8DEDC]/90 border-y border-[#E2AEAA]/60 pointer-events-none"
          style={{
            clipPath:
              "polygon(3% 0%, 97% 0%, 100% 15%, 97% 30%, 100% 45%, 96% 60%, 100% 75%, 97% 90%, 100% 100%, 0% 100%, 4% 90%, 0% 75%, 4% 60%, 0% 45%, 4% 30%, 0% 15%)",
          }}
        />

        {/* Vintage Postmark Stamp Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#E9E1DB]/80 pb-8">
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FAF5F0] border border-[#E9E1DB] text-[11px] font-mono tracking-wider text-[#8D817B] uppercase">
                {CATEGORIES[memory.category]?.label || "Momen Indah"}
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#E9E1DB] text-[11px] font-editorial-body text-[#302B29] flex items-center gap-1 shadow-2xs">
                <span>{MOODS[memory.mood]?.emoji}</span>
                <span>{MOODS[memory.mood]?.label}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="font-editorial-heading text-3xl sm:text-5xl lg:text-6xl font-normal text-[#302B29] tracking-tight leading-tight pt-1">
              {memory.title}
            </h1>

            {/* Date & Location in cursive typography */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[#78655F] font-editorial-quote text-lg sm:text-xl">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#CFA6A3]" />
                {formatDateIndo(memory.event_date)}
              </span>

              {memory.event_time && (
                <>
                  <span className="text-[#CFA6A3]">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#CFA6A3]" />
                    {memory.event_time} WIB
                  </span>
                </>
              )}

              {memory.location_name && (
                <>
                  <span className="text-[#CFA6A3]">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#CFA6A3]" />
                    {memory.location_name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Postal Cancellation Mark Watermark */}
          <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#CFA6A3]/40 p-1 flex items-center justify-center shrink-0 rotate-6 select-none pointer-events-none self-end sm:self-auto">
            <div className="w-full h-full rounded-full border border-[#CFA6A3]/30 flex flex-col items-center justify-center text-center text-[9px] font-mono text-[#8D817B] uppercase tracking-widest">
              <span>OUR MOMENTS</span>
              <span className="text-[12px] text-[#CFA6A3] my-0.5">🤍</span>
              <span>AUFA & ANATHIA</span>
            </div>
          </div>
        </div>

        {/* Hero Polaroid Framed Photo */}
        <div className="relative bg-white rounded-3xl p-3 sm:p-5 border border-[#E9E1DB] shadow-lg shadow-[#78655F]/8 group">
          {/* Subtle tape corner accents */}
          <div className="absolute -top-2 left-6 w-16 h-4 bg-[#F8DEDC]/80 rotate-[-4deg] z-10 pointer-events-none rounded-xs border-y border-[#E2AEAA]/50" />
          <div className="absolute -top-2 right-6 w-16 h-4 bg-[#F8DEDC]/80 rotate-[4deg] z-10 pointer-events-none rounded-xs border-y border-[#E2AEAA]/50" />

          <div
            className="relative aspect-[16/10] sm:aspect-[21/10] w-full rounded-2xl overflow-hidden bg-[#F1EBE4] cursor-pointer"
            onClick={() => setLightboxIndex(0)}
          >
            <Image
              src={memory.cover_image_url || "/images/hero.jpg"}
              alt={memory.title}
              fill
              priority
              className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
              sizes="(max-width: 1024px) 100vw, 900px"
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-xs text-xs font-editorial-body text-[#302B29] shadow-md">
                <Maximize2 className="w-3.5 h-3.5 text-[#CFA6A3]" />
                <span>Lihat Foto Penuh</span>
              </span>
            </div>
          </div>

          <div className="pt-3 px-2 flex items-center justify-between text-xs text-[#8D817B] font-editorial-quote italic text-sm">
            <span>&ldquo;{memory.title}&rdquo;</span>
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#CFA6A3]">
              Polaroid Ke-1 • Aufa & Anathia
            </span>
          </div>
        </div>

        {/* The Memory Story with Illuminated Drop Cap */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E9E1DB] to-transparent" />
            <span className="text-[#CFA6A3] text-sm select-none font-serif tracking-widest">
              ❧ Lembaran Kisah ❧
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E9E1DB] to-transparent" />
          </div>

          <div className="prose prose-stone max-w-none">
            <p className="font-editorial-body text-base sm:text-lg text-[#302B29] leading-relaxed whitespace-pre-line first-letter:float-left first-letter:text-6xl sm:first-letter:text-7xl first-letter:font-editorial-heading first-letter:text-[#CFA6A3] first-letter:pr-4 first-letter:pt-1 first-letter:leading-none">
              {memory.story}
            </p>
          </div>

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <span className="text-xs text-[#8D817B] font-mono">Kata Kunci:</span>
              {memory.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-[#FAF5F0] border border-[#E9E1DB] text-[#78655F]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Retro Vinyl Soundtrack Badge if spotify_url exists */}
        {memory.spotify_url && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2B2725] to-[#1C1918] p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 border border-[#3E3835]">
            <div className="flex items-center gap-4">
              {/* Spinning Vinyl Disk */}
              <div className="relative w-14 h-14 rounded-full bg-[#111111] border-2 border-[#444] flex items-center justify-center shrink-0 shadow-lg shadow-black/40 group">
                <div className="w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center text-black">
                  <Music className="w-3 h-3" />
                </div>
                {/* Grooves */}
                <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-2.5 rounded-full border border-white/5 pointer-events-none" />
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <p className="text-[10px] font-mono tracking-widest text-[#1DB954] uppercase">
                  Soundtrack Kenangan Bersama
                </p>
                <h4 className="font-editorial-heading text-lg font-medium text-white">
                  Lagu Pengiring Lembaran Ini
                </h4>
                <p className="font-editorial-body text-xs text-white/70">
                  Dengarkan alunan melodi yang menemani setiap momen ini di Spotify.
                </p>
              </div>
            </div>

            <a
              href={memory.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1DB954] hover:bg-[#1aa34a] text-black rounded-full text-xs font-editorial-body font-semibold transition-all shadow-md active:scale-95 shrink-0"
            >
              <span>Buka Spotify</span>
              <span>↗</span>
            </a>
          </div>
        )}

        {/* Additional Scrapbook Photo Album Gallery */}
        {memory.media && memory.media.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-[#E9E1DB]/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
                  Album Kenangan
                </span>
                <h3 className="font-editorial-heading text-2xl text-[#302B29] mt-0.5">
                  Foto & Rekaman Momen ({memory.media.length})
                </h3>
              </div>
              <p className="text-xs font-editorial-body text-[#8D817B] hidden sm:block">
                Klik foto untuk membuka layar penuh
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {memory.media.map((item, idx) => {
                const tilts = [
                  "-rotate-1 hover:rotate-0",
                  "rotate-1 hover:rotate-0",
                  "-rotate-0.5 hover:rotate-0",
                  "rotate-1.5 hover:rotate-0",
                ];
                const tilt = tilts[idx % tilts.length];

                return (
                  <div
                    key={item.id}
                    className={`relative bg-white rounded-3xl p-3 border border-[#E9E1DB] shadow-md shadow-[#78655F]/8 hover:shadow-xl transition-all duration-300 group ${tilt}`}
                  >
                    {/* Washi Tape strip */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#F8DEDC]/80 rotate-1 z-10 pointer-events-none rounded-xs border-y border-[#E2AEAA]/50 shadow-2xs" />

                    <div
                      className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden cursor-pointer bg-[#F1EBE4]"
                      onClick={() => setLightboxIndex(idx + 1)}
                    >
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
                          alt={item.caption || "Foto kenangan"}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    </div>

                    {item.caption && (
                      <p className="p-3 text-xs font-editorial-quote italic text-[#78655F] text-center text-sm">
                        &ldquo;{item.caption}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dual Perspectives Section (Catatan Sudut Pandang Aufa & Anathia) */}
        <section className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F2] to-[#F5ECE5] border border-[#E9E1DB] rounded-3xl p-6 sm:p-9 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9E1DB]/70 pb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#CFA6A3]" />
              <h3 className="font-editorial-heading text-xl sm:text-2xl text-[#302B29]">
                Catatan Sudut Pandang Kita
              </h3>
            </div>
            <p className="text-xs font-editorial-body text-[#8D817B]">
              Refleksi dan kata-kata kecil dari Aufa & Anathia
            </p>
          </div>

          {/* Sticky Notes Grid */}
          {memory.notes && memory.notes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {memory.notes.map((n, i) => {
                const isAnathia = n.author_name.toLowerCase().includes("anathia");
                return (
                  <div
                    key={n.id}
                    className={`relative p-5 rounded-2xl border shadow-sm space-y-3 transition-transform hover:-translate-y-1 ${
                      isAnathia
                        ? "bg-[#FDF4F3] border-[#F2D7D5] text-[#4A3E3B]"
                        : "bg-[#FBF8F3] border-[#E8DEC9] text-[#3E3733]"
                    }`}
                  >
                    {/* Push Pin */}
                    <div
                      className={`absolute -top-2.5 left-5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-xs ${
                        isAnathia
                          ? "bg-[#CFA6A3] text-white"
                          : "bg-[#78655F] text-white"
                      }`}
                    >
                      📌
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-editorial-heading text-sm font-medium">
                        {isAnathia ? "Catatan Anathia 🌸" : "Catatan Aufa ✒️"}
                      </span>
                      <span className="text-[11px] font-mono opacity-60">
                        {formatDateIndo(n.created_at)}
                      </span>
                    </div>

                    <p className="font-editorial-body text-xs sm:text-[13px] leading-relaxed italic">
                      &ldquo;{n.note}&rdquo;
                    </p>

                    <div className="text-right font-editorial-quote text-base opacity-75">
                      — {n.author_name}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 bg-white/60 rounded-2xl border border-dashed border-[#E9E1DB] p-4 text-xs font-editorial-body text-[#8D817B] italic">
              Belum ada catatan tambahan dari kita berdua. Tuliskan pesan pertamamu di bawah ini ♡
            </div>
          )}

          {/* Add Note Form with Author Selector */}
          <form
            onSubmit={handleAddNote}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E9E1DB] space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-editorial-body text-[#78655F]">
                Tulis catatan sebagai:
              </span>
              <div className="inline-flex rounded-full bg-[#FAF8F5] p-1 border border-[#E9E1DB]">
                <button
                  type="button"
                  onClick={() => setSelectedAuthor("Aufa")}
                  className={`px-3 py-1 rounded-full text-xs font-editorial-body transition-all ${
                    selectedAuthor === "Aufa"
                      ? "bg-[#302B29] text-white shadow-xs"
                      : "text-[#78655F] hover:text-[#302B29]"
                  }`}
                >
                  Aufa ✒️
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAuthor("Anathia")}
                  className={`px-3 py-1 rounded-full text-xs font-editorial-body transition-all ${
                    selectedAuthor === "Anathia"
                      ? "bg-[#CFA6A3] text-white shadow-xs"
                      : "text-[#78655F] hover:text-[#302B29]"
                  }`}
                >
                  Anathia 🌸
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={`Tulis apa yang kamu rasakan atau ingat tentang momen ini, ${selectedAuthor}...`}
              className="w-full p-3.5 bg-[#FAF8F5] hover:bg-white focus:bg-white border border-[#E9E1DB] rounded-xl text-xs sm:text-sm text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3] transition-colors"
            />

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isAddingNote || !newNote.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isAddingNote ? "Menyematkan..." : `Sematkan Catatan ${selectedAuthor}`}
                </span>
              </button>
            </div>
          </form>
        </section>

        {/* Previous & Next Memory Turn-Page Ribbon */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E9E1DB]">
          {prevId ? (
            <Link
              href={`/diary/${prevId}`}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] text-xs font-editorial-body text-[#78655F] transition-all group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#FAF5F0] flex items-center justify-center shrink-0 group-hover:-translate-x-1 transition-transform">
                <ChevronLeft className="w-4 h-4 text-[#CFA6A3]" />
              </div>
              <div className="overflow-hidden">
                <span className="block text-[10px] uppercase tracking-wider text-[#8D817B] font-mono">
                  Lembaran Sebelumnya
                </span>
                <span className="font-editorial-heading text-sm text-[#302B29] truncate block">
                  Buka Kisah Sebelumnya
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextId ? (
            <Link
              href={`/diary/${nextId}`}
              className="flex items-center justify-end gap-3 p-4 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] text-xs font-editorial-body text-[#78655F] transition-all group text-right shadow-2xs ml-auto w-full"
            >
              <div className="overflow-hidden">
                <span className="block text-[10px] uppercase tracking-wider text-[#8D817B] font-mono">
                  Lembaran Selanjutnya
                </span>
                <span className="font-editorial-heading text-sm text-[#302B29] truncate block">
                  Buka Kisah Berikutnya
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FAF5F0] flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-4 h-4 text-[#CFA6A3]" />
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && allMediaList[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white text-xs z-10">
            <span className="font-mono text-[#CFA6A3]">
              {lightboxIndex + 1} / {allMediaList.length} Foto
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Stage Media */}
          <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center py-2">
            {allMediaList.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + allMediaList.length) % allMediaList.length
                  )
                }
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="relative max-h-[75vh] max-w-full flex items-center justify-center">
              {allMediaList[lightboxIndex].type === "video" ? (
                <video
                  src={allMediaList[lightboxIndex].url}
                  controls
                  autoPlay
                  className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={allMediaList[lightboxIndex].url}
                  alt={allMediaList[lightboxIndex].caption || "Foto"}
                  className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>

            {allMediaList.length > 1 && (
              <button
                onClick={() =>
                  setLightboxIndex((lightboxIndex + 1) % allMediaList.length)
                }
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
                aria-label="Selanjutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Caption */}
          <div className="text-center text-white/90 text-sm max-w-lg font-editorial-quote italic pb-2">
            {allMediaList[lightboxIndex].caption ? (
              <p>&ldquo;{allMediaList[lightboxIndex].caption}&rdquo;</p>
            ) : (
              <p>Kenangan indah Aufa & Anathia</p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-editorial-heading text-2xl text-[#302B29]">
              Hapus Lembaran Cerita Ini?
            </h3>
            <p className="font-editorial-body text-xs sm:text-sm text-[#8D817B] leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Cerita dan semua foto yang tersimpan pada momen ini akan dihapus dari jurnal kita.
            </p>
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F] hover:bg-white"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-editorial-body font-medium transition-colors"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Lembaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function MemoryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-24 text-center text-xs text-[#8D817B]">
          Memuat lembaran kenangan...
        </div>
      }
    >
      <MemoryDetailContent />
    </Suspense>
  );
}
