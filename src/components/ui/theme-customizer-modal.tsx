"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Camera,
  Palette,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Heart,
  Image as ImageIcon,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  useTheme,
  THEME_PRESETS,
  COVER_PRESETS,
  CoverPhotoConfig,
} from "@/lib/theme-context";
import { useToast } from "@/components/ui/toast-provider";

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCustomizerModal({
  isOpen,
  onClose,
}: ThemeCustomizerModalProps) {
  const {
    currentTheme,
    coverPhoto,
    customWallpaperUrl,
    wallpaperPattern,
    setThemeId,
    setCustomWallpaperUrl,
    setWallpaperPattern,
    updateCoverPhoto,
    resetAll,
  } = useTheme();

  const { success, info } = useToast();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"cover" | "wallpaper">("cover");

  // Form states for temporary edits
  const [title, setTitle] = useState(coverPhoto.title);
  const [subtitle, setSubtitle] = useState(coverPhoto.subtitle);
  const [badge, setBadge] = useState(coverPhoto.badge);
  const [badgeEmoji, setBadgeEmoji] = useState(coverPhoto.badgeEmoji);
  const [selectedImageUrl, setSelectedImageUrl] = useState(coverPhoto.imageUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync inputs when coverPhoto changes
  useEffect(() => {
    setTitle(coverPhoto.title);
    setSubtitle(coverPhoto.subtitle);
    setBadge(coverPhoto.badge);
    setBadgeEmoji(coverPhoto.badgeEmoji);
    setSelectedImageUrl(coverPhoto.imageUrl);
  }, [coverPhoto]);

  // Handle uploading custom polaroid cover photo with canvas compression
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const canvas = document.createElement("canvas");
        const maxDim = 800;
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
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          setSelectedImageUrl(compressed);
          updateCoverPhoto({ imageUrl: compressed });
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.6 },
            colors: ["#CFA6A3", "#F8DEDC"],
          });
          success("Foto sampul berhasil diganti! ✨");
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading custom wallpaper background with canvas compression
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      info("Mohon pilih file gambar untuk wallpaper");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1280;
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
          const compressed = canvas.toDataURL("image/jpeg", 0.8);
          setCustomWallpaperUrl(compressed);
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
          });
          success("Wallpaper latar belakang web berhasil diterapkan! 🖼️");
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetCover = (preset: typeof COVER_PRESETS[0]) => {
    setSelectedImageUrl(preset.config.imageUrl);
    setTitle(preset.config.title);
    setSubtitle(preset.config.subtitle);
    setBadge(preset.config.badge);
    setBadgeEmoji(preset.config.badgeEmoji);
    updateCoverPhoto(preset.config);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.6 },
      colors: ["#CFA6A3", "#FAF8F5"],
    });
    success(`Foto sampul diubah ke "${preset.name}"!`);
  };

  const handleSaveTextEdits = (e: React.FormEvent) => {
    e.preventDefault();
    updateCoverPhoto({
      title: title.trim() || "Aufa & Anathia 🤍",
      subtitle: subtitle.trim() || "OUR LITTLE MOMENTS",
      badge: badge.trim() || "Kenangan",
      badgeEmoji: badgeEmoji.trim() || "✨",
      imageUrl: selectedImageUrl,
    });
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.65 },
    });
    success("Pengaturan sampul tersimpan! ♡");
    onClose();
  };

  const handleReset = () => {
    resetAll();
    setSelectedImageUrl(COVER_PRESETS[0].config.imageUrl);
    setTitle(COVER_PRESETS[0].config.title);
    setSubtitle(COVER_PRESETS[0].config.subtitle);
    setBadge(COVER_PRESETS[0].config.badge);
    setBadgeEmoji(COVER_PRESETS[0].config.badgeEmoji);
    info("Pengaturan sampul & tema dikembalikan ke awal.");
  };

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

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="relative w-full max-w-2xl bg-[#FFFDF9] rounded-3xl sm:rounded-4xl shadow-2xl border border-[#E9E1DB] overflow-hidden z-10 max-h-[85vh] my-auto flex flex-col"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#E9E1DB] flex items-center justify-between bg-gradient-to-r from-[#FAF6F1] via-[#FFFDF9] to-[#F8EFF1]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#E9E1DB] flex items-center justify-center text-[#CFA6A3] shadow-xs">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial-heading text-xl font-medium text-[#302B29]">
                    Kustomisasi Sampul &amp; Wallpaper
                  </h3>
                  <p className="font-editorial-body text-xs text-[#8D817B]">
                    Ganti foto polaroid depan atau ubah suasana tema halaman web
                  </p>
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

            {/* Tab Navigation */}
            <div className="flex border-b border-[#E9E1DB] bg-[#FAF8F5] px-6">
              <button
                type="button"
                onClick={() => setActiveTab("cover")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-editorial-body font-medium transition-colors border-b-2 cursor-pointer ${
                  activeTab === "cover"
                    ? "border-[#CFA6A3] text-[#302B29] font-semibold"
                    : "border-transparent text-[#8D817B] hover:text-[#302B29]"
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[#CFA6A3]" />
                <span>Foto Sampul Depan (Polaroid)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("wallpaper")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-editorial-body font-medium transition-colors border-b-2 cursor-pointer ${
                  activeTab === "wallpaper"
                    ? "border-[#CFA6A3] text-[#302B29] font-semibold"
                    : "border-transparent text-[#8D817B] hover:text-[#302B29]"
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-[#CFA6A3]" />
                <span>Wallpaper &amp; Warna Web</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {activeTab === "cover" ? (
                /* TAB 1: GANTI FOTO SAMPUL DEPAN */
                <div className="space-y-6">
                  {/* Live Polaroid Preview */}
                  <div className="p-4 rounded-3xl bg-[#FAF5F0] border border-[#E9E1DB] flex flex-col sm:flex-row items-center gap-6">
                    {/* Mini Polaroid */}
                    <div className="relative bg-white p-2.5 pb-3.5 rounded-2xl shadow-md border border-[#E9E1DB] w-44 shrink-0 select-none">
                      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#F1EBE4]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedImageUrl || "/images/uniqlo-date.jpg"}
                          alt="Cover Preview"
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[9px] font-editorial-body text-[#302B29] border border-[#E9E1DB] flex items-center gap-1 shadow-xs">
                          <span>{badgeEmoji || "✨"}</span>
                          <span className="font-medium truncate max-w-[70px]">
                            {badge || "Kenangan"}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 text-center">
                        <p className="font-editorial-quote italic text-sm text-[#302B29] font-semibold truncate">
                          {title || "Aufa & Anathia 🤍"}
                        </p>
                        <p className="font-mono text-[8px] text-[#8D817B] uppercase tracking-wider truncate mt-0.5">
                          {subtitle || "MATCHING OUTFIT"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1 text-center sm:text-left">
                      <div>
                        <h4 className="font-editorial-heading text-lg font-medium text-[#302B29]">
                          Foto Sampul Utama Polaroid
                        </h4>
                        <p className="font-editorial-body text-xs text-[#78655F] leading-relaxed">
                          Foto ini tampil di hero beranda dengan gaya scrapbook polaroid. Kamu bisa mengunggah foto pribadimu sendiri atau memilih foto dari galeri.
                        </p>
                      </div>

                      {/* Upload Button */}
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah Foto Sendiri 📷</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preset Choices */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#8D817B] block">
                      Atau Pilih dari Album Foto Kita:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {COVER_PRESETS.map((preset) => {
                        const isSelected =
                          selectedImageUrl === preset.config.imageUrl;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => handleSelectPresetCover(preset)}
                            className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                              isSelected
                                ? "bg-[#F1EBE4] border-[#CFA6A3] ring-2 ring-[#CFA6A3]/30 shadow-xs"
                                : "bg-white border-[#E9E1DB] hover:bg-[#FAF8F5]"
                            }`}
                          >
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF5F0] shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={preset.config.imageUrl}
                                alt={preset.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-editorial-body text-xs font-medium text-[#302B29] truncate">
                                {preset.name}
                              </p>
                              <span className="text-[10px] text-[#8D817B]">
                                {preset.config.badge}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Caption & Text Editor */}
                  <form onSubmit={handleSaveTextEdits} className="space-y-4 pt-2 border-t border-[#E9E1DB]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-editorial-body text-[#78655F]">
                          Judul Polaroid
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Aufa & Anathia 🤍"
                          className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-editorial-body text-[#78655F]">
                          Keterangan / Tanggal
                        </label>
                        <input
                          type="text"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          placeholder="24 OKTOBER 2026 • MATCHING OUTFIT"
                          className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-editorial-body text-[#78655F]">
                          Label Stiker Sudut
                        </label>
                        <input
                          type="text"
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                          placeholder="Uniqlo Date"
                          className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-editorial-body text-[#78655F]">
                          Emoji Stiker
                        </label>
                        <input
                          type="text"
                          value={badgeEmoji}
                          onChange={(e) => setBadgeEmoji(e.target.value)}
                          placeholder="🛍️"
                          className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E9E1DB] rounded-xl text-xs text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#302B29] text-white rounded-full text-xs font-editorial-body font-medium hover:bg-black transition-colors cursor-pointer"
                      >
                        Terapkan Keterangan Polaroid
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* TAB 2: GANTI TEMA & WALLPAPER LATAR BELAKANG */
                <div className="space-y-6">
                  {/* Preset Theme Palettes */}
                  <div className="space-y-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#8D817B] block">
                      Pilihan Palet Warna Scrapbook:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {THEME_PRESETS.map((t) => {
                        const isSelected = currentTheme.id === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setThemeId(t.id);
                              confetti({
                                particleCount: 20,
                                spread: 40,
                                origin: { y: 0.6 },
                              });
                              success(`Tema ${t.name} diterapkan!`);
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-[#F1EBE4] border-[#CFA6A3] ring-2 ring-[#CFA6A3]/40 shadow-xs"
                                : "bg-white border-[#E9E1DB] hover:bg-[#FAF8F5]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{t.emoji}</span>
                              <div>
                                <p className="font-editorial-body text-xs font-semibold text-[#302B29]">
                                  {t.name}
                                </p>
                                <p className="text-[10px] text-[#8D817B] line-clamp-1">
                                  {t.desc}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <div
                                className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: t.bgColor }}
                              />
                              <div
                                className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: t.roseColor }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Background Photo Upload */}
                  <div className="p-4 rounded-3xl bg-[#FAF5F0] border border-[#E9E1DB] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#CFA6A3]" />
                        <h4 className="font-editorial-heading text-sm font-medium text-[#302B29]">
                          Foto Wallpaper Latar Belakang Web
                        </h4>
                      </div>
                      {customWallpaperUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomWallpaperUrl(null);
                            info("Wallpaper foto kustom dihapus.");
                          }}
                          className="text-xs text-rose-500 hover:underline cursor-pointer"
                        >
                          Hapus Wallpaper
                        </button>
                      )}
                    </div>

                    <input
                      ref={bgFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBgUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-[#CFA6A3]/60 rounded-2xl text-xs font-editorial-body text-[#78655F] hover:bg-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-[#CFA6A3]" />
                      <span>
                        {customWallpaperUrl
                          ? "Ganti Foto Wallpaper Saat Ini 🖼️"
                          : "+ Unggah Foto Wallpaper Latar Belakang 🖼️"}
                      </span>
                    </button>
                  </div>

                  {/* Animated Pattern Decor */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#8D817B] block">
                      Efek Animasi Melayang:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setWallpaperPattern("none");
                          info("Efek partikel dinonaktifkan.");
                        }}
                        className={`p-3 rounded-2xl border text-left text-xs font-editorial-body cursor-pointer ${
                          wallpaperPattern === "none"
                            ? "bg-[#F1EBE4] border-[#CFA6A3] font-medium"
                            : "bg-white border-[#E9E1DB] text-[#78655F]"
                        }`}
                      >
                        <span>🍃 Polos / Tenang</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWallpaperPattern("hearts");
                          confetti({
                            particleCount: 35,
                            spread: 50,
                            origin: { y: 0.6 },
                          });
                          success("Efek Hati & Kelopak Bunga Melayang aktif! 💖");
                        }}
                        className={`p-3 rounded-2xl border text-left text-xs font-editorial-body cursor-pointer ${
                          wallpaperPattern === "hearts"
                            ? "bg-[#F1EBE4] border-[#CFA6A3] font-medium"
                            : "bg-white border-[#E9E1DB] text-[#78655F]"
                        }`}
                      >
                        <span>💖 Hati &amp; Kelopak Bunga Melayang</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E9E1DB] bg-[#FAF8F5] flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-editorial-body text-[#8D817B] hover:text-[#302B29] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Standar</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white text-xs font-editorial-body font-medium shadow-md shadow-[#CFA6A3]/30 cursor-pointer"
              >
                Selesai ✓
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
