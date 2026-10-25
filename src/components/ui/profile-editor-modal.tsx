"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Check,
  Calendar,
  Quote,
  Camera,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast-provider";

const AVATAR_PRESETS = [
  {
    label: "Aufa",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    initial: "A",
  },
  {
    label: "Anathia",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    initial: "N",
  },
  {
    label: "Kucing Lucu",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80",
    initial: "🐱",
  },
  {
    label: "Bunga Mawar",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80",
    initial: "🌹",
  },
  {
    label: "Kopi Hangat",
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80",
    initial: "☕",
  },
];

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditorModal({
  isOpen,
  onClose,
}: ProfileEditorModalProps) {
  const { user, updateProfile } = useAuth();
  const { success, error, info } = useToast();

  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imgError, setImgError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form strictly with the currently logged-in user only
  useEffect(() => {
    if (!isOpen || !user) return;
    setNickname(user.nickname || "");
    setFullName(user.full_name || "");
    setBio(user.bio || "");
    setBirthday(user.birthday || "");
    setFavoriteQuote(user.favorite_quote || "");
    setAvatarUrl(user.avatar_url || "");
    setImgError(false);
  }, [isOpen, user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      info("Mohon pilih file gambar (JPG, PNG, atau WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // High quality canvas downscale to max 256x256 to ensure light localStorage & fast sync
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setAvatarUrl(compressed);
          setImgError(false);
          confetti({
            particleCount: 20,
            spread: 40,
            origin: { y: 0.6 },
          });
          success("Foto avatar berhasil dimuat!");
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      info("Nama panggilan tidak boleh kosong");
      return;
    }

    if (!user) {
      error("Silakan login terlebih dahulu untuk mengubah profil.");
      return;
    }

    setIsSubmitting(true);
    try {
      // STRICT: Always update user.id ONLY!
      const res = await updateProfile(
        {
          nickname: nickname.trim(),
          full_name: fullName.trim() || nickname.trim(),
          bio: bio.trim(),
          birthday: birthday.trim(),
          favorite_quote: favoriteQuote.trim(),
          avatar_url: avatarUrl,
        },
        user.id
      );

      if (res.success) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#CFA6A3", "#B88582", "#F8DEDC"],
        });
        success("Profil akun pribadimu berhasil disimpan! ✨");
        onClose();
      } else {
        error(res.message);
      }
    } catch {
      error("Gagal menyimpan profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl sm:rounded-4xl shadow-2xl border border-[#E9E1DB] overflow-hidden z-10 max-h-[85vh] my-auto flex flex-col"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#E9E1DB] flex items-center justify-between bg-gradient-to-r from-[#FAF6F1] via-[#FFFDF9] to-[#FDF4F3]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#E9E1DB] flex items-center justify-center text-[#CFA6A3] shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial-heading text-xl font-medium text-[#302B29]">
                    Atur Profil Saya
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#78655F] font-editorial-body">
                      <span>Akun:</span>
                      <strong className="text-[#302B29] font-medium">
                        {user?.nickname || user?.full_name || "Pengguna"}
                      </strong>
                    </span>
                    <span className="text-[#CFA6A3]">·</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Akun Login Terverifikasi</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border border-[#E9E1DB] hover:bg-[#FAF8F5] text-[#78655F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Informational Notice */}
            <div className="px-6 py-2.5 bg-[#FAF8F5] border-b border-[#E9E1DB] flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#8D817B] font-editorial-body">
                🔒 Sesuai privasi berdua, kamu hanya dapat mengedit profil akun kamu sendiri.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Avatar Section */}
              <div className="p-4 rounded-3xl bg-[#FAF5F0] border border-[#E9E1DB] flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white border-2 border-[#CFA6A3] shadow-md shrink-0 flex items-center justify-center">
                  {avatarUrl && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#78655F] text-2xl font-bold bg-gradient-to-tr from-[#CFA6A3] to-[#F1EBE4]">
                      {nickname ? nickname.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div>
                    <h4 className="font-editorial-heading text-sm font-medium text-[#302B29]">
                      Foto Profil / Avatar
                    </h4>
                    <p className="text-[11px] text-[#8D817B]">
                      Unggah foto sendiri atau pilih salah satu preset avatar di bawah.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E9E1DB] hover:border-[#CFA6A3] rounded-full text-xs text-[#78655F] hover:text-[#302B29] transition-colors cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#CFA6A3]" />
                      <span>Unggah Foto Sendiri 📷</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl("");
                          setImgError(false);
                        }}
                        className="text-xs text-rose-500 hover:underline px-2 py-1"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Avatar Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#8D817B] block">
                  Atau Pilih Preset Avatar Cepat:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => {
                        setAvatarUrl(p.url);
                        setImgError(false);
                      }}
                      className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        avatarUrl === p.url
                          ? "border-[#CFA6A3] scale-110 shadow-md ring-2 ring-[#CFA6A3]/30"
                          : "border-white hover:border-[#E9E1DB] shadow-xs"
                      }`}
                      title={p.label}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-editorial-body text-[#78655F]">
                    Nama Panggilan (Nickname) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Contoh: Aufa / Anathia"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-editorial-body text-[#78655F]">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                  />
                </div>
              </div>

              {/* Bio / Status */}
              <div className="space-y-1">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Bio / Catatan Kasih Singkat
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tuliskan ungkapan perasaan atau moto manis kalian..."
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3] resize-none font-editorial-body leading-relaxed"
                />
              </div>

              {/* Birthday / Special Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
                    <span>Tanggal Lahir / Spesial</span>
                  </label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-[#CFA6A3]" />
                    <span>Kata Mutiara Berdua</span>
                  </label>
                  <input
                    type="text"
                    value={favoriteQuote}
                    onChange={(e) => setFavoriteQuote(e.target.value)}
                    placeholder="Momen kecil, cinta selamanya."
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E9E1DB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Batal
                </button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium shadow-md shadow-[#CFA6A3]/30 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Profil Saya"}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
