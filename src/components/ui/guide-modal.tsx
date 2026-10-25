"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Mail,
  Camera,
  Music,
  LayoutGrid,
  Palette,
  X,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEnvelope?: () => void;
  onOpenCustomizer?: () => void;
}

export function GuideModal({
  isOpen,
  onClose,
  onOpenEnvelope,
  onOpenCustomizer,
}: GuideModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut listener (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const tutorialSteps = [
    {
      id: "step-1",
      number: "01",
      icon: BookOpen,
      title: "Tulis & Abadikan Cerita",
      description:
        "Klik tombol '+ Tulis Cerita Baru' untuk mencatat kencan manis, jalan-jalan santai, foto polaroid, stempel mood emoji, lokasi tempat bertemu, dan playlist lagu Spotify kenangan berdua.",
      badge: "Jurnal Kenangan",
      actionType: "link" as const,
      actionLabel: "Tulis Cerita",
      href: "/diary/new",
    },
    {
      id: "step-2",
      number: "02",
      icon: Mail,
      title: "Kirim & Balas Surat Kasih",
      description:
        "Kirimkan surat cinta rahasia beramplop pink manis untuk pasanganmu. Buka amplop animasi lucu bersama dan balas surat secara instan langsung dari beranda.",
      badge: "Surat Kasih 💌",
      actionType: "envelope" as const,
      actionLabel: "Buka Amplop",
    },
    {
      id: "step-3",
      number: "03",
      icon: Camera,
      title: "Jelajahi Galeri Foto Estetik",
      description:
        "Koleksi foto berdua tersimpan rapi dengan 3 mode tampilan memukau: Polaroid Scrapbook vintage, lembaran klise 35mm Filmstrip, atau Cinema Lightbox layar penuh.",
      badge: "Galeri Foto",
      actionType: "link" as const,
      actionLabel: "Buka Galeri",
      href: "/gallery",
    },
    {
      id: "step-4",
      number: "04",
      icon: Music,
      title: "Pilihan Musik Suasana",
      description:
        "Nyalakan alunan melodi latar yang menenangkan saat membaca jurnal bersama. Tersedia 8 melodi lembut (Piano, Kafe Lofi, Ombak, Hujan) lewat tombol di kanan atas navbar.",
      badge: "Shortcut: Tekan 'M'",
      actionType: "info" as const,
      actionLabel: "8 Melodi 🎵",
    },
    {
      id: "step-5",
      number: "05",
      icon: LayoutGrid,
      title: "Jelajahi Fitur Tambahan",
      description:
        "Klik tombol bulat (⊞) di navbar kanan atas untuk membuka Kalender Kenangan per tanggal, garis waktu kronologis Timeline Bersama, dan daftar impian Bucket List.",
      badge: "Tombol Bulat di Navbar",
      actionType: "link" as const,
      actionLabel: "Buka Kalender",
      href: "/calendar",
    },
    {
      id: "step-6",
      number: "06",
      icon: Palette,
      title: "Ganti Sampul & Atur Profil",
      description:
        "Kustomisasi foto polaroid sampul depan, pilih tema warna kesukaan, dan perbarui foto profil maupun bio akun masing-masing (Aufa & Anathia) secara terproteksi.",
      badge: "Personalisasi",
      actionType: "customizer" as const,
      actionLabel: "Ganti Sampul",
    },
  ];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-3xl sm:rounded-4xl shadow-2xl border border-[#E9E1DB] overflow-hidden z-10 max-h-[86vh] sm:max-h-[92vh] flex flex-col my-auto"
          >
            {/* Header */}
            <div className="p-4 sm:p-8 bg-gradient-to-r from-[#FFFDF9] via-[#FAF5F0] to-[#F5ECE5] border-b border-[#E9E1DB] flex items-start justify-between gap-3 sm:gap-4 shrink-0 relative">
              {/* Washi tape accent */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 sm:w-36 h-6 bg-gradient-to-r from-[#F8DEDC]/90 via-[#F3C5C0]/85 to-[#F8DEDC]/90 border-y border-[#E2AEAA]/60 pointer-events-none shadow-2xs rotate-[0.5deg]"
                style={{
                  clipPath:
                    "polygon(4% 0%, 96% 0%, 100% 15%, 96% 35%, 100% 55%, 96% 75%, 100% 100%, 0% 100%, 4% 75%, 0% 55%, 4% 35%, 0% 15%)",
                }}
              />

              <div className="space-y-1 sm:space-y-1.5">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white border border-[#E9E1DB] shadow-2xs text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#78655F]">
                  <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#CFA6A3]" />
                  <span>Panduan Ruang Kenangan Kita</span>
                </div>
                <h2 className="font-editorial-heading text-lg sm:text-3xl font-medium text-[#302B29] leading-snug">
                  Tata Cara Mengisi &amp; Menikmati Web Bersama
                </h2>
                <p className="font-editorial-body text-[11px] sm:text-sm text-[#78655F]">
                  Panduan ringkas dan manis untuk mengabadikan momen, berkirim pesan cinta, dan menjelajahi fitur website kita.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F1EBE4] border border-[#E9E1DB] text-[#78655F] hover:text-[#302B29] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                title="Tutup (ESC)"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body with 6 Cards */}
            <div className="p-3.5 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {tutorialSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className="group relative bg-white rounded-3xl p-5 border border-[#E9E1DB] hover:border-[#CFA6A3] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      {/* Step Number Watermark */}
                      <span className="absolute top-3 right-4 font-editorial-heading text-3xl font-bold text-[#E9E1DB]/60 pointer-events-none select-none">
                        {step.number}
                      </span>

                      <div className="space-y-3 relative z-10">
                        <div className="w-10 h-10 rounded-2xl bg-[#FAF5F0] border border-[#E9E1DB] text-[#CFA6A3] flex items-center justify-center shadow-2xs group-hover:bg-[#CFA6A3] group-hover:text-white transition-all">
                          <Icon className="w-4 h-4" />
                        </div>

                        <div>
                          <h3 className="font-editorial-heading text-base font-medium text-[#302B29]">
                            {step.title}
                          </h3>
                          <p className="font-editorial-body text-xs text-[#78655F] mt-1.5 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#E9E1DB]/60 flex items-center justify-between text-xs font-editorial-body">
                        <span className="text-[11px] font-mono text-[#8D817B]">
                          {step.badge}
                        </span>
                        {step.actionType === "link" ? (
                          <Link
                            href={step.href!}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 font-medium text-[#CFA6A3] hover:text-[#B88582] transition-colors"
                          >
                            <span>{step.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : step.actionType === "customizer" ? (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenCustomizer?.();
                            }}
                            className="inline-flex items-center gap-1 font-medium text-[#CFA6A3] hover:text-[#B88582] transition-colors cursor-pointer"
                          >
                            <span>{step.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : step.actionType === "envelope" ? (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenEnvelope?.();
                            }}
                            className="inline-flex items-center gap-1 font-medium text-[#CFA6A3] hover:text-[#B88582] transition-colors cursor-pointer"
                          >
                            <span>{step.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[#CFA6A3] font-medium font-mono text-[11px]">
                            {step.actionLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Tips Callout */}
              <div className="rounded-2xl bg-white border border-[#E9E1DB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-editorial-body text-[#78655F] shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="font-medium text-[#302B29]">
                      Tips Tombol Pintas Keyboard
                    </p>
                    <p className="text-[11px] text-[#8D817B]">
                      Tekan tombol{" "}
                      <kbd className="px-1.5 py-0.5 rounded-md bg-[#FAF5F0] border border-[#E9E1DB] font-mono text-[10px] text-[#302B29] font-bold">
                        M
                      </kbd>{" "}
                      kapan saja untuk membuka pilihan musik suasana, atau{" "}
                      <kbd className="px-1.5 py-0.5 rounded-md bg-[#FAF5F0] border border-[#E9E1DB] font-mono text-[10px] text-[#302B29] font-bold">
                        ESC
                      </kbd>{" "}
                      untuk menutup jendela modal.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-[#FAF5F0] hover:bg-[#E9E1DB] text-[#302B29] font-medium transition-colors shrink-0 cursor-pointer text-center"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
