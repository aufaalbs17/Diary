"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { LittleNote } from "@/lib/types";
import { getLittleNotes, openLittleNote, sendLittleNote } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast-provider";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const EMOJI_OPTIONS = ["💌", "🌷", "✨", "☕", "🤍", "🌙", "🌻", "🌿"];

export default function LittleNotesPage() {
  const { user, partner, space } = useAuth();
  const { success, error, info } = useToast();

  const [notes, setNotes] = useState<LittleNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOpenedNote, setActiveOpenedNote] = useState<LittleNote | null>(null);

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
    // Check if locked
    if (note.unlock_at && new Date(note.unlock_at) > new Date()) {
      info(
        `Surat ini masih terkunci hingga ${format(
          new Date(note.unlock_at),
          "d MMMM yyyy, HH:mm",
          { locale: id }
        )} 🔒`
      );
      return;
    }

    // Mark opened
    if (!note.is_opened) {
      await openLittleNote(note.id);
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, is_opened: true } : n))
      );
    }

    setActiveOpenedNote(note);
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      error("Mohon isi judul dan isi surat.");
      return;
    }

    setIsSending(true);
    try {
      const recipient = partner || {
        id: "user-2",
        nickname: "Alya",
      };

      const created = await sendLittleNote({
        recipient_id: recipient.id,
        recipient_name: recipient.nickname || "Kamu",
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
      success("Surat kecil berhasil dikirim dengan penuh kehangatan 💌");
    } catch (err) {
      error("Gagal mengirim surat.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
            Pesan Hangat
          </span>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
            Little Notes 💌
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-2 max-w-xl">
            Tinggalkan surat cinta kecil, kata-kata penyemangat, atau pesan kejutan yang terkunci hingga waktu tertentu.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Surat Kecil</span>
        </button>
      </div>

      {/* Notes / Envelopes Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#8D817B]">
          Mengumpulkan amplop surat...
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E9E1DB] rounded-3xl p-8 max-w-md mx-auto space-y-3">
          <Mail className="w-10 h-10 text-[#CFA6A3] mx-auto" />
          <h3 className="font-editorial-heading text-lg text-[#302B29]">
            Belum Ada Surat Tersimpan
          </h3>
          <p className="font-editorial-body text-xs text-[#8D817B]">
            Jadilah yang pertama menuliskan pesan hangat untuk pasanganmu hari ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {notes.map((note) => {
            const isLocked =
              note.unlock_at && new Date(note.unlock_at) > new Date();

            return (
              <div
                key={note.id}
                onClick={() => handleCardClick(note)}
                className={`paper-card rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all border ${
                  isLocked
                    ? "bg-[#FAF8F5] border-dashed border-[#E9E1DB]"
                    : "bg-white border-[#E9E1DB] hover:border-[#CFA6A3]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{note.emoji || "💌"}</span>
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-[11px] bg-[#F1EBE4] text-[#78655F] px-2.5 py-1 rounded-full">
                        <Lock className="w-3 h-3 text-[#CFA6A3]" />
                        <span>Terkunci</span>
                      </span>
                    ) : note.is_opened ? (
                      <span className="text-[10px] text-[#8D817B] font-editorial-body">
                        Terbuka
                      </span>
                    ) : (
                      <span className="text-[10px] bg-[#CFA6A3] text-white px-2 py-0.5 rounded-full font-medium">
                        Surat Baru!
                      </span>
                    )}
                  </div>

                  <h3 className="font-editorial-heading text-lg font-medium text-[#302B29] line-clamp-1">
                    {note.title}
                  </h3>

                  {isLocked ? (
                    <p className="font-editorial-body text-xs text-[#8D817B] mt-2 italic flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#CFA6A3]" />
                      <span>
                        Terbuka pada{" "}
                        {format(new Date(note.unlock_at!), "d MMM yyyy", {
                          locale: id,
                        })}
                      </span>
                    </p>
                  ) : (
                    <p className="font-editorial-body text-xs text-[#78655F] mt-2 line-clamp-3 leading-relaxed">
                      {note.message}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-[#E9E1DB]/70 flex items-center justify-between text-[11px] text-[#8D817B]">
                  <span>Dari {note.sender_name}</span>
                  <span>
                    {format(new Date(note.created_at), "d MMM", { locale: id })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Open Letter Modal Animation */}
      {activeOpenedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border-2 border-[#E9E1DB] rounded-3xl p-6 sm:p-10 max-w-lg w-full shadow-2xl relative space-y-6">
            <button
              onClick={() => setActiveOpenedNote(null)}
              className="absolute top-5 right-5 p-1.5 text-[#8D817B] hover:text-[#302B29] rounded-full hover:bg-[#FAF8F5]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="text-4xl inline-block mb-1">
                {activeOpenedNote.emoji}
              </span>
              <p className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
                Surat untuk {activeOpenedNote.recipient_name}
              </p>
              <h2 className="font-editorial-heading text-2xl sm:text-3xl font-medium text-[#302B29]">
                {activeOpenedNote.title}
              </h2>
            </div>

            <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E9E1DB]/60">
              <p className="font-editorial-quote text-base sm:text-lg text-[#302B29] leading-relaxed whitespace-pre-line">
                {activeOpenedNote.message}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8D817B] pt-2">
              <span>
                Tertulis pada{" "}
                {format(
                  new Date(activeOpenedNote.created_at),
                  "d MMMM yyyy, HH:mm",
                  { locale: id }
                )}
              </span>
              <span className="font-medium text-[#78655F]">
                Dengan kasih, {activeOpenedNote.sender_name} ♡
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Write New Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E1DB]">
              <h3 className="font-editorial-heading text-xl text-[#302B29]">
                Tulis Surat Kecil
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#8D817B] hover:text-[#302B29]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNote} className="space-y-4">
              {/* Emoji Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Pilih Stiker Emoji
                </label>
                <div className="flex gap-2">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setSelectedEmoji(em)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                        selectedEmoji === em
                          ? "bg-[#F1EBE4] border border-[#CFA6A3] scale-110"
                          : "hover:bg-[#FAF8F5]"
                      }`}
                    >
                      {em}
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
                  placeholder="Contoh: Terima kasih untuk hari ini 🤍"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Isi Pesan Surat *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan isi hatimu, pesan kejutan, atau hal manis..."
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3] resize-none"
                />
              </div>

              {/* Optional Future Unlock Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#CFA6A3]" />
                  <span>Kunci Hingga Tanggal Tertentu (Opsional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={unlockAt}
                  onChange={(e) => setUnlockAt(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                />
                <p className="text-[10px] text-[#8D817B]">
                  Bila diisi, pasanganmu tidak bisa membuka surat ini sebelum tanggal yang ditentukan.
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
                  className="flex-1 py-2.5 rounded-full bg-[#CFA6A3] hover:bg-[#B88582] text-white text-xs font-editorial-body font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "Mengirim..." : "Kirim Surat"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
