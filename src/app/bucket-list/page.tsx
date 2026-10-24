"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Circle,
  Plus,
  Heart,
  Calendar,
  Sparkles,
  Trash2,
  Edit,
  ExternalLink,
  X,
  Camera,
} from "lucide-react";
import { BucketListItem } from "@/lib/types";
import {
  deleteBucketItem,
  getBucketList,
  saveBucketItem,
  toggleBucketItem,
} from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const BUCKET_CATEGORIES = [
  "Petualangan Bersama",
  "Nongkrong & Kuliner",
  "Momen Rumah",
  "Traveling Baru",
  "Kenangan Fisik",
  "Lainnya",
];

export default function BucketListPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Petualangan Bersama");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getBucketList();
      setItems(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const total = items.length;
  const completedCount = items.filter((i) => i.is_completed).length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const handleToggle = async (item: BucketListItem) => {
    const updated = await toggleBucketItem(item.id);
    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      if (updated.is_completed) {
        // Trigger subtle confetti
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#CFA6A3", "#F1EBE4", "#B88582", "#E2A76F"],
        });
        success("Mimpi bersama berhasil terwujud! ✨");
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle("");
    setCategory("Petualangan Bersama");
    setTargetDate("");
    setNotes("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BucketListItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setTargetDate(item.target_date || "");
    setNotes(item.notes || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteBucketItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    success("Item bucket list telah dihapus.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const saved = await saveBucketItem({
        id: editingItem?.id,
        title: title.trim(),
        category,
        target_date: targetDate || undefined,
        notes: notes.trim(),
      });

      if (editingItem) {
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? saved : i))
        );
        success("Bucket list diperbarui.");
      } else {
        setItems((prev) => [saved, ...prev]);
        success("Mimpi baru ditambahkan ke bucket list! 🤍");
      }
      setIsModalOpen(false);
    } catch (err) {
      error("Gagal menyimpan item.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
            Daftar Impian Berdua
          </span>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
            Our Bucket List.
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-2 max-w-xl">
            Rencana manis, petualangan sederhana, dan hal-hal yang ingin kita lakukan bersama suatu saat nanti.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Rencana</span>
        </button>
      </div>

      {/* Progress Box */}
      <div className="paper-card rounded-3xl p-6 bg-white border border-[#E9E1DB] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs uppercase tracking-wider text-[#8D817B] font-mono">
            Progres Rencana Bersama
          </p>
          <p className="font-editorial-heading text-xl sm:text-2xl text-[#302B29]">
            {completedCount} dari {total} harapan telah terwujud ({progressPercent}%)
          </p>
        </div>

        <div className="w-full sm:w-64 h-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#CFA6A3] to-[#B88582] rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bucket List Items */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#8D817B]">
          Memuat daftar rencana kita...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E9E1DB] rounded-3xl p-8 max-w-md mx-auto space-y-3">
          <Sparkles className="w-8 h-8 text-[#CFA6A3] mx-auto" />
          <h3 className="font-editorial-heading text-lg text-[#302B29]">
            Belum Ada Daftar Impian
          </h3>
          <p className="font-editorial-body text-xs text-[#8D817B]">
            Yuk tulis hal-hal seru yang ingin kita coba dan alami bersama!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.is_completed
                  ? "bg-[#FAF8F5]/80 border-[#E9E1DB] opacity-80"
                  : "bg-white border-[#E9E1DB] hover:border-[#CFA6A3]"
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggle(item)}
                  className="mt-0.5 sm:mt-0 text-[#CFA6A3] hover:scale-110 transition-transform shrink-0"
                  title={
                    item.is_completed
                      ? "Batalkan status selesai"
                      : "Tandai sudah terwujud"
                  }
                >
                  {item.is_completed ? (
                    <CheckCircle2 className="w-6 h-6 fill-[#CFA6A3] text-white" />
                  ) : (
                    <Circle className="w-6 h-6 stroke-[1.5]" />
                  )}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F1EBE4] text-[#78655F]">
                      {item.category}
                    </span>
                    {item.target_date && (
                      <span className="text-[10px] text-[#8D817B] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#CFA6A3]" />
                        {format(new Date(item.target_date), "d MMM yyyy", {
                          locale: id,
                        })}
                      </span>
                    )}
                  </div>

                  <p
                    className={`font-editorial-heading text-base sm:text-lg ${
                      item.is_completed
                        ? "line-through text-[#8D817B]"
                        : "text-[#302B29] font-medium"
                    }`}
                  >
                    {item.title}
                  </p>

                  {item.notes && (
                    <p className="font-editorial-body text-xs text-[#78655F] leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons & photo preview */}
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                {item.photo_url && (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#E9E1DB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photo_url}
                      alt="Kenangan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {item.memory_id && (
                  <Link
                    href={`/diary/${item.memory_id}`}
                    className="text-xs text-[#CFA6A3] hover:underline flex items-center gap-1 font-medium"
                    title="Buka jurnal kenangan terkait"
                  >
                    <span>Jurnal</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-[#8D817B] hover:text-[#302B29] rounded-lg"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-[#8D817B] hover:text-rose-500 rounded-lg"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E1DB]">
              <h3 className="font-editorial-heading text-xl text-[#302B29]">
                {editingItem ? "Edit Rencana" : "Tambah Rencana Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#8D817B] hover:text-[#302B29]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Rencana / Harapan Bersama *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Masak pasta aglio olio bareng"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                >
                  {BUCKET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Target Waktu (Opsional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Catatan / Rincian Ide
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan kecil tentang rencana ini..."
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3] resize-none"
                />
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
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-full bg-[#CFA6A3] hover:bg-[#B88582] text-white text-xs font-editorial-body font-medium transition-colors"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
