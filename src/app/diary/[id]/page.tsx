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
  MessageSquare,
  Share2,
  Maximize2,
  X,
  Send,
  Sparkles,
} from "lucide-react";
import { Memory, MOODS, CATEGORIES } from "@/lib/types";
import { addMemoryNote, deleteMemory, getMemoryById } from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/lib/auth-context";

function MemoryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const memoryId = params?.id as string;
  const { user } = useAuth();
  const { success, error } = useToast();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [prevId, setPrevId] = useState<string | undefined>(undefined);
  const [nextId, setNextId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Fullscreen Lightbox
  const [activeLightboxMedia, setActiveLightboxMedia] = useState<{
    url: string;
    type: "image" | "video";
    caption?: string;
  } | null>(null);

  // Note addition
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
      setMemory({
        ...memory,
        notes: [...(memory.notes || []), created],
      });
      setNewNote("");
      success("Catatan kecil berhasil disematkan ♡");
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
      success("Kenangan telah dihapus.");
      router.push("/diary");
    } catch (err) {
      error("Gagal menghapus kenangan.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#CFA6A3] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-editorial-body text-xs text-[#8D817B]">
          Membuka lembaran kenangan...
        </p>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-editorial-heading text-2xl text-[#302B29]">
          Kenangan Tidak Ditemukan
        </h2>
        <p className="text-xs text-[#8D817B]">
          Mungkin cerita ini sudah dihapus atau tautan tidak valid.
        </p>
        <Link
          href="/diary"
          className="inline-block px-5 py-2.5 bg-[#CFA6A3] text-white rounded-full text-xs font-editorial-body"
        >
          Kembali ke Jurnal
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Back and Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/diary"
          className="flex items-center gap-1.5 text-xs font-editorial-body text-[#78655F] hover:text-[#302B29] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Jurnal</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/diary/${memory.id}/edit`}
            className="p-2 text-[#78655F] hover:text-[#302B29] rounded-xl hover:bg-white border border-[#E9E1DB] transition-all shadow-2xs"
            title="Edit Kenangan"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-rose-400 hover:text-rose-600 rounded-xl hover:bg-white border border-[#E9E1DB] transition-all shadow-2xs"
            title="Hapus Kenangan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Cover Image */}
      <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-xl shadow-[#78655F]/10 border-4 border-white group">
        <Image
          src={memory.cover_image_url || "/images/hero.jpg"}
          alt={memory.title}
          fill
          priority
          className="object-cover cursor-pointer"
          onClick={() =>
            setActiveLightboxMedia({
              url: memory.cover_image_url || "/images/hero.jpg",
              type: "image",
              caption: memory.title,
            })
          }
          sizes="(max-width: 1024px) 100vw, 900px"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-editorial-body text-[#302B29] flex items-center gap-1.5 shadow-xs">
          <span>{MOODS[memory.mood]?.emoji}</span>
          <span>{MOODS[memory.mood]?.label}</span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-editorial-body text-[#78655F] shadow-xs">
          {CATEGORIES[memory.category]?.label || "Momen"}
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-4 text-center sm:text-left border-b border-[#E9E1DB]/80 pb-8">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#8D817B]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
            {formatDateIndo(memory.event_date)}
          </span>
          {memory.event_time && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#CFA6A3]" />
              {memory.event_time}
            </span>
          )}
          {memory.location_name && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#CFA6A3]" />
              {memory.location_name}
            </span>
          )}
        </div>

        <h1 className="font-editorial-heading text-3xl sm:text-5xl font-medium text-[#302B29] leading-tight">
          {memory.title}
        </h1>

        <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
          {memory.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-0.5 rounded-full bg-[#F1EBE4] text-[#78655F]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Story Text */}
      <div className="prose prose-stone max-w-none">
        <p className="font-editorial-body text-base sm:text-lg text-[#302B29] leading-relaxed whitespace-pre-line">
          {memory.story}
        </p>
      </div>

      {/* Spotify Soundtrack Player if available */}
      {memory.spotify_url && (
        <div className="bg-white border border-[#E9E1DB] rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8D817B] font-mono">
                Lagu Pengiring Momen
              </p>
              <p className="font-editorial-body text-sm text-[#302B29] font-medium">
                Dengarkan di Spotify
              </p>
            </div>
          </div>
          <a
            href={memory.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#F1EBE4] hover:bg-[#E9E1DB] text-[#302B29] rounded-full text-xs font-editorial-body font-medium transition-colors"
          >
            Buka Lagu ↗
          </a>
        </div>
      )}

      {/* Additional Media Gallery */}
      {memory.media.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="font-editorial-heading text-xl text-[#302B29]">
            Foto & Rekaman Momen ({memory.media.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memory.media.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white border border-[#E9E1DB] rounded-2xl overflow-hidden shadow-xs group"
              >
                <div
                  className="relative aspect-[4/3] w-full cursor-pointer bg-[#F1EBE4]"
                  onClick={() =>
                    setActiveLightboxMedia({
                      url: item.file_path,
                      type: item.file_type,
                      caption: item.caption,
                    })
                  }
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
                      alt={item.caption || "Media"}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                </div>
                {item.caption && (
                  <p className="p-3 text-xs font-editorial-body text-[#78655F] italic border-t border-[#E9E1DB]/60">
                    &ldquo;{item.caption}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dual Notes Section from Both Users */}
      <section className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#CFA6A3]" />
          <h2 className="font-editorial-heading text-xl text-[#302B29]">
            Catatan Sudut Pandang Kita
          </h2>
        </div>

        {/* Existing notes */}
        {memory.notes && memory.notes.length > 0 ? (
          <div className="space-y-4">
            {memory.notes.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB]/70 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs text-[#8D817B]">
                  <span className="font-medium text-[#78655F]">
                    {n.author_name}
                  </span>
                  <span className="text-[11px]">
                    {formatDateIndo(n.created_at)}
                  </span>
                </div>
                <p className="font-editorial-body text-xs sm:text-sm text-[#302B29] leading-relaxed">
                  {n.note}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8D817B] italic">
            Belum ada catatan tambahan dari kita berdua.
          </p>
        )}

        {/* Add Note Input */}
        <form onSubmit={handleAddNote} className="space-y-3 pt-2">
          <textarea
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={`Tulis catatan kecil dari sudut pandang ${user?.nickname || "kamu"}...`}
            className="w-full p-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAddingNote || !newNote.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAddingNote ? "Menyimpan..." : "Kirim Catatan"}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Prev / Next Memory Navigation */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E9E1DB]">
        {prevId ? (
          <Link
            href={`/diary/${prevId}`}
            className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-[#E9E1DB] hover:border-[#CFA6A3] text-xs font-editorial-body text-[#78655F] transition-all group shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <div>
              <span className="block text-[10px] text-[#8D817B]">Sebelumnya</span>
              <span className="font-medium text-[#302B29] line-clamp-1">
                Kenangan Sebelumnya
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextId ? (
          <Link
            href={`/diary/${nextId}`}
            className="flex items-center justify-end gap-2 p-4 rounded-2xl bg-white border border-[#E9E1DB] hover:border-[#CFA6A3] text-xs font-editorial-body text-[#78655F] transition-all group text-right shadow-2xs"
          >
            <div>
              <span className="block text-[10px] text-[#8D817B]">Selanjutnya</span>
              <span className="font-medium text-[#302B29] line-clamp-1">
                Kenangan Selanjutnya
              </span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setActiveLightboxMedia(null)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
            {activeLightboxMedia.type === "video" ? (
              <video
                src={activeLightboxMedia.url}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-2xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeLightboxMedia.url}
                alt="Fullscreen"
                className="max-h-[80vh] max-w-full object-contain rounded-2xl"
              />
            )}
          </div>

          {activeLightboxMedia.caption && (
            <p className="mt-4 text-center text-white/90 text-sm max-w-lg font-editorial-body">
              {activeLightboxMedia.caption}
            </p>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-editorial-heading text-xl text-[#302B29]">
              Hapus Kenangan Ini?
            </h3>
            <p className="text-xs text-[#8D817B] leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Cerita dan semua foto yang tersimpan pada momen ini akan dihapus dari jurnal.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-editorial-body font-medium transition-colors"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
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
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-[#8D817B]">
          Memuat lembaran kenangan...
        </div>
      }
    >
      <MemoryDetailContent />
    </Suspense>
  );
}
