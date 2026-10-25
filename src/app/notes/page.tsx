"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Mail,
  Lock,
  Sparkles,
  Plus,
  Send,
  X,
  Heart,
  Clock,
  CheckCircle2,
  Reply,
  Stamp,
  User,
  Calendar,
  Trash2,
} from "lucide-react";
import { LittleNote } from "@/lib/types";
import {
  getLittleNotes,
  openLittleNote,
  sendLittleNote,
  deleteLittleNote,
} from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast-provider";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

const SEAL_OPTIONS = [
  { emoji: "💌", label: "Surat Kasih", color: "from-[#D99A96] to-[#B87A76]" },
  { emoji: "🌷", label: "Bunga Tulip", color: "from-[#C48E9A] to-[#A36C78]" },
  { emoji: "✨", label: "Kejutan Manis", color: "from-[#D4AA7D] to-[#B3885C]" },
  { emoji: "☕", label: "Obrolan Kafe", color: "from-[#A6897C] to-[#806457]" },
  { emoji: "🤍", label: "Hati Murni", color: "from-[#D8C7C2] to-[#B5A19B]" },
  { emoji: "🌙", label: "Malam Tenang", color: "from-[#9DA5B4] to-[#767E8F]" },
];

export default function LittleNotesPage() {
  const { user, partner, space } = useAuth();
  const { success, error, info } = useToast();

  const [notes, setNotes] = useState<LittleNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOpenedNote, setActiveOpenedNote] = useState<LittleNote | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "to_anathia" | "to_aufa" | "locked">("all");

  // Current user & Partner resolution (Strictly 2 members: Aufa & Anathia)
  const currentNickname =
    user?.nickname ||
    user?.full_name ||
    (user?.id === "user-2" ? "Anathia" : "Aufa");
  const isAnathia =
    user?.id === "user-2" ||
    currentNickname.toLowerCase().includes("anathia");

  const partnerNickname =
    partner?.nickname ||
    partner?.full_name ||
    (isAnathia ? "Aufa" : "Anathia");
  const partnerId = partner?.id || (isAnathia ? "user-1" : "user-2");

  // New Note Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("💌");
  const [unlockAt, setUnlockAt] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getLittleNotes();
      setNotes(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleCardClick = async (note: LittleNote) => {
    const isLocked = note.unlock_at && new Date(note.unlock_at) > new Date();

    if (isLocked) {
      info(
        `Surat ini masih tersegel rapi hingga ${format(
          new Date(note.unlock_at!),
          "d MMMM yyyy, HH:mm",
          { locale: id }
        )} 🔒`
      );
      return;
    }

    if (!note.is_opened) {
      await openLittleNote(note.id);
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, is_opened: true } : n))
      );
    }

    setActiveOpenedNote(note);
  };

  const handleOpenComposer = (replyTo?: LittleNote) => {
    if (replyTo) {
      setTitle(`Balasan: ${replyTo.title}`);
      setMessage("");
      setActiveOpenedNote(null);
    } else {
      setTitle("");
      setMessage("");
    }
    setIsModalOpen(true);
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      error("Mohon isi judul dan isi surat.");
      return;
    }

    setIsSending(true);
    try {
      const created = await sendLittleNote({
        recipient_id: partnerId,
        recipient_name: partnerNickname,
        title: title.trim(),
        message: message.trim(),
        emoji: selectedEmoji,
        unlock_at: unlockAt ? new Date(unlockAt).toISOString() : undefined,
      });

      setNotes((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setTitle("");
      setMessage("");
      setUnlockAt("");
      success(`Surat manis telah dimasukkan ke dalam amplop untuk ${partnerNickname} 💌`);
    } catch (err) {
      error("Gagal mengirim surat.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (selectedFilter === "locked") {
        return n.unlock_at && new Date(n.unlock_at) > new Date();
      }
      if (selectedFilter === "to_anathia") {
        return n.recipient_name?.toLowerCase().includes("anathia");
      }
      if (selectedFilter === "to_aufa") {
        return n.recipient_name?.toLowerCase().includes("aufa");
      }
      return true;
    });
  }, [notes, selectedFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
            Kotak Surat Pribadi
          </span>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
            Little Notes 💌
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-2 max-w-xl">
            Tinggalkan surat cinta kecil, kata-kata penyemangat, atau pesan kejutan yang terkunci hingga waktu tertentu.
          </p>
        </div>

        <button
          onClick={() => handleOpenComposer()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#CFA6A3] to-[#B88582] hover:opacity-95 text-white rounded-full text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Surat Kecil</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedFilter("all")}
          className={`px-4 py-2 rounded-full font-editorial-body transition-all whitespace-nowrap ${
            selectedFilter === "all"
              ? "bg-[#302B29] text-white shadow-xs"
              : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
          }`}
        >
          Semua Surat ({notes.length})
        </button>
        <button
          onClick={() => setSelectedFilter("to_anathia")}
          className={`px-4 py-2 rounded-full font-editorial-body transition-all whitespace-nowrap ${
            selectedFilter === "to_anathia"
              ? "bg-[#302B29] text-white shadow-xs"
              : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
          }`}
        >
          Untuk Anathia ♡
        </button>
        <button
          onClick={() => setSelectedFilter("to_aufa")}
          className={`px-4 py-2 rounded-full font-editorial-body transition-all whitespace-nowrap ${
            selectedFilter === "to_aufa"
              ? "bg-[#302B29] text-white shadow-xs"
              : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
          }`}
        >
          Untuk Aufa ♡
        </button>
        <button
          onClick={() => setSelectedFilter("locked")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-editorial-body transition-all whitespace-nowrap ${
            selectedFilter === "locked"
              ? "bg-[#302B29] text-white shadow-xs"
              : "bg-white border border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3]"
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-[#CFA6A3]" />
          <span>Terkunci</span>
        </button>
      </div>

      {/* Realistic Postal Envelopes Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-xs text-[#8D817B]">
          Mengumpulkan amplop surat...
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E9E1DB] rounded-3xl p-8 max-w-md mx-auto space-y-3">
          <Mail className="w-10 h-10 text-[#CFA6A3] mx-auto" />
          <h3 className="font-editorial-heading text-lg text-[#302B29]">
            Belum Ada Surat di Kategori Ini
          </h3>
          <p className="font-editorial-body text-xs text-[#8D817B]">
            Tuliskan kata-kata manis pertama untuk pasanganmu sekarang.
          </p>
          <button
            onClick={() => handleOpenComposer()}
            className="px-4 py-2 bg-[#F1EBE4] hover:bg-[#E9E1DB] text-[#302B29] rounded-full text-xs font-editorial-body transition-colors"
          >
            + Tulis Surat Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const isLocked =
              note.unlock_at && new Date(note.unlock_at) > new Date();

            return (
              <div
                key={note.id}
                onClick={() => handleCardClick(note)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl ${
                  isLocked
                    ? "bg-[#F7F4F0] border-2 border-dashed border-[#DFCFC4] shadow-sm"
                    : "bg-[#FFFFFF] border border-[#E8DFD7] shadow-md shadow-[#78655F]/6"
                }`}
              >
                {/* Vintage Airmail Stripe Edge Banner */}
                <div
                  className="h-2 w-full"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, #CFA6A3 0, #CFA6A3 12px, #FFFFFF 12px, #FFFFFF 20px, #B88582 20px, #B88582 32px, #FFFFFF 32px, #FFFFFF 40px)",
                  }}
                />

                {/* Envelope Top Flap Simulation */}
                <div className="relative bg-gradient-to-b from-[#F9F6F0] to-[#F1EAE0] px-5 pt-4 pb-5 border-b border-[#E3D8CC]">
                  {/* Postmark stamp in corner */}
                  <div className="absolute top-3 right-4 text-right pointer-events-none opacity-70">
                    <div className="border border-[#78655F]/40 rounded-full px-2 py-0.5 text-[8px] font-mono tracking-widest text-[#78655F] uppercase inline-block -rotate-6">
                      POST • {note.recipient_name}
                    </div>
                  </div>

                  {/* Wax Seal Stamp in Center */}
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#CFA6A3] to-[#E5BEBC] border-2 border-white shadow-md flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {note.emoji || "💌"}
                      </div>
                      {isLocked && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#78655F] text-white flex items-center justify-center shadow-xs">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[11px] bg-[#EAE2D8] text-[#78655F] px-2.5 py-1 rounded-full font-medium">
                          <Lock className="w-3 h-3 text-[#B88582]" />
                          <span>Terkunci</span>
                        </span>
                      ) : note.is_opened ? (
                        <span className="text-[11px] text-[#8D817B] font-editorial-body flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#CFA6A3]" />
                          <span>Sudah Dibaca</span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white px-2.5 py-0.5 rounded-full font-medium shadow-xs animate-pulse">
                          Surat Baru ✉️
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Envelope Body / Letter Preview */}
                <div className="p-6 space-y-3 bg-[#FCFBF8] min-h-[170px] flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Recipient tag */}
                    <div className="flex items-center gap-1 text-[11px] text-[#8D817B] font-editorial-body">
                      <span>Untuk:</span>
                      <span className="font-semibold text-[#302B29]">
                        {note.recipient_name}
                      </span>
                    </div>

                    <h3 className="font-editorial-heading text-lg font-medium text-[#302B29] leading-snug group-hover:text-[#B88582] transition-colors line-clamp-1">
                      {note.title}
                    </h3>

                    {isLocked ? (
                      <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E9E0D4] text-xs text-[#8D817B] space-y-1">
                        <p className="font-medium text-[#78655F] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#CFA6A3]" />
                          <span>Kapsul Waktu Rahasia</span>
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          Bisa dibuka pada:{" "}
                          <span className="font-medium text-[#302B29]">
                            {format(new Date(note.unlock_at!), "d MMMM yyyy", {
                              locale: id,
                            })}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="font-editorial-body text-xs text-[#78655F] line-clamp-3 leading-relaxed">
                        {note.message}
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Sender & Date */}
                  <div className="pt-3 border-t border-[#EFE8DF] flex items-center justify-between text-[11px] text-[#8D817B]">
                    <span className="font-medium text-[#78655F]">
                      Dari {note.sender_name} ♡
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px]">
                        {format(new Date(note.created_at), "d MMM yyyy", {
                          locale: id,
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus surat "${note.title}"?`)) {
                            await deleteLittleNote(note.id);
                            setNotes((prev) => prev.filter((n) => n.id !== note.id));
                            success("Surat manis berhasil dihapus");
                          }
                        }}
                        className="p-1 rounded-full text-[#8D817B] hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                        title="Hapus Surat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Realistic Opened Letter Modal with Smooth Motion */}
      <AnimatePresence>
        {activeOpenedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveOpenedNote(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 25 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative max-w-xl w-full bg-[#FAF7F2] border-4 border-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 overflow-hidden z-10"
            >
              {/* Airmail header strip */}
              <div
                className="absolute top-0 left-0 right-0 h-2.5"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, #CFA6A3 0, #CFA6A3 12px, #FFFFFF 12px, #FFFFFF 20px, #B88582 20px, #B88582 32px, #FFFFFF 32px, #FFFFFF 40px)",
                }}
              />

              {/* Close Button */}
              <button
                onClick={() => setActiveOpenedNote(null)}
                className="absolute top-5 right-5 p-2 text-[#8D817B] hover:text-[#302B29] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Tutup Surat"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Letter Header */}
              <div className="text-center space-y-2 pt-2 border-b border-[#E8DFD5] pb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#CFA6A3] to-[#E5BEBC] border-2 border-white shadow-md flex items-center justify-center text-2xl mx-auto mb-2">
                  {activeOpenedNote.emoji}
                </div>
                <p className="text-[11px] uppercase tracking-widest text-[#8D817B] font-mono">
                  Surat Pribadi untuk {activeOpenedNote.recipient_name}
                </p>
                <h2 className="font-editorial-heading text-2xl sm:text-3xl font-medium text-[#302B29]">
                  {activeOpenedNote.title}
                </h2>
              </div>

              {/* Letter Body Parchment */}
              <div className="bg-white/80 p-6 sm:p-8 rounded-2xl border border-[#E8DFD5] shadow-xs">
                <p className="font-editorial-quote text-lg sm:text-xl text-[#302B29] leading-relaxed whitespace-pre-line">
                  {activeOpenedNote.message}
                </p>
              </div>

              {/* Signature & Timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#8D817B] pt-1">
                <span className="font-editorial-body text-[11px]">
                  Tertulis pada{" "}
                  {format(
                    new Date(activeOpenedNote.created_at),
                    "EEEE, d MMMM yyyy • HH:mm",
                    { locale: id }
                  )}
                </span>
                <span className="font-editorial-quote italic text-base text-[#78655F] font-semibold">
                  Dengan segenap kasih, {activeOpenedNote.sender_name} ♡
                </span>
              </div>

              {/* Actions: Reply, Delete or Close */}
              <div className="pt-4 border-t border-[#E8DFD5] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveOpenedNote(null)}
                    className="px-4 py-2 rounded-full border border-[#E3D8CC] text-xs font-editorial-body text-[#78655F] hover:bg-white cursor-pointer"
                  >
                    Lipat &amp; Simpan
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Apakah kamu yakin ingin menghapus surat "${activeOpenedNote.title}"?`)) {
                        await deleteLittleNote(activeOpenedNote.id);
                        setNotes((prev) => prev.filter((n) => n.id !== activeOpenedNote.id));
                        setActiveOpenedNote(null);
                        success("Surat manis berhasil dihapus");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-rose-200 text-xs font-editorial-body text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Surat Manis"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

                {activeOpenedNote.recipient_name?.toLowerCase() === currentNickname.toLowerCase() ? (
                  <button
                    type="button"
                    onClick={() => handleOpenComposer(activeOpenedNote)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white text-xs font-editorial-body font-medium shadow-md shadow-[#CFA6A3]/30 hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Balas Surat Ini ✍️</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#8D817B] font-editorial-body">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#CFA6A3]" />
                    <span>Surat ini telah kamu kirimkan untuk {activeOpenedNote.recipient_name}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Composer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E1DB]">
              <div>
                <h3 className="font-editorial-heading text-xl text-[#302B29]">
                  Tulis Surat Kecil
                </h3>
                <p className="text-xs text-[#8D817B] mt-0.5">
                  Dari <span className="font-medium text-[#302B29]">{currentNickname}</span> untuk <span className="font-medium text-[#B88582]">{partnerNickname} ♡</span>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#8D817B] hover:text-[#302B29] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNote} className="space-y-4">
              {/* Recipient Display (Locked strictly to Partner - No self-sending) */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-editorial-body text-[#78655F]">
                    Penerima Surat:
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EBE4] border border-[#CFA6A3] text-xs font-medium text-[#302B29] shadow-2xs">
                    <Heart className="w-3.5 h-3.5 text-[#CFA6A3] fill-[#CFA6A3]" />
                    <span>Untuk {partnerNickname} ♡</span>
                  </span>
                </div>
                <span className="text-[11px] text-[#8D817B] font-editorial-quote italic">
                  Akun aktif: {currentNickname}
                </span>
              </div>

              {/* Seal Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Pilih Stiker Segel Lilin (*Wax Seal*)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SEAL_OPTIONS.map((item) => (
                    <button
                      type="button"
                      key={item.emoji}
                      onClick={() => setSelectedEmoji(item.emoji)}
                      className={`p-2 rounded-2xl border text-center transition-transform flex flex-col items-center gap-1 ${
                        selectedEmoji === item.emoji
                          ? "bg-[#F1EBE4] border-[#CFA6A3] scale-105 shadow-xs"
                          : "bg-[#FAF8F5] border-[#E9E1DB] hover:bg-[#F1EBE4]/50"
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-[9px] text-[#78655F] leading-tight font-editorial-body">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Judul Surat *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Contoh: Terima kasih sudah selalu ada untukku, ${partnerNickname} 🤍`}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Isi Surat *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Tuliskan ungkapan hatimu, cerita manis, atau pesan rahasia untuk ${partnerNickname}...`}
                  className="w-full p-3.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3] resize-none leading-relaxed font-editorial-body"
                />
              </div>

              {/* Lock Date */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB]">
                <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#CFA6A3]" />
                  <span>Kunci Surat (Kapsul Waktu Opsional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={unlockAt}
                  onChange={(e) => setUnlockAt(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E1DB] rounded-xl text-xs text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                />
                <p className="text-[10px] text-[#8D817B]">
                  Bila ditentukan, surat akan tersegel dan hanya bisa dibuka setelah tanggal tersebut.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#CFA6A3] to-[#B88582] hover:opacity-95 text-white text-xs font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "Memasukkan Amplop..." : "Kirim Surat"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
