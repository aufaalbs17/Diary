"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowRight, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast-provider";

export default function WelcomePage() {
  const router = useRouter();
  const { user, space, joinSpace } = useAuth();
  const { success, error } = useToast();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnterSpace = () => {
    router.push("/");
  };

  const handleJoinSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsSubmitting(true);
    const result = joinSpace(inviteCode.trim());
    setIsSubmitting(false);

    if (result.success) {
      success(result.message);
      setIsInviteModalOpen(false);
      router.push("/");
    } else {
      error(result.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#302B29] flex flex-col justify-between overflow-hidden">
      {/* Decorative background subtle gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#CFA6A3]/10 via-[#F1EBE4]/30 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-editorial-heading text-lg font-medium text-[#302B29]">
            Our Little Moments
          </span>
          <span className="text-[#CFA6A3] text-sm">🤍</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[#78655F] hover:text-[#302B29] bg-white/60 hover:bg-white rounded-full border border-[#E9E1DB] transition-all"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#CFA6A3]" />
            <span>Punya Kode Undangan?</span>
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8 sm:py-16 flex flex-col items-center text-center">
        {/* Soft tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1EBE4] border border-[#E9E1DB] text-xs text-[#78655F] font-editorial-body mb-8 animate-in fade-in duration-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#CFA6A3]" />
          <span>Ruang Pribadi Aufa &amp; Anathia ♡</span>
        </div>

        {/* Title */}
        <h1 className="font-editorial-heading text-4xl sm:text-6xl md:text-7xl font-normal text-[#302B29] tracking-tight leading-[1.15] max-w-3xl mb-6">
          Our Little Moments.
        </h1>

        {/* Subtitle */}
        <p className="font-editorial-quote text-xl sm:text-2xl text-[#78655F] italic mb-6 max-w-2xl">
          &ldquo;A little space for the moments we never want to forget.&rdquo;
        </p>

        {/* Indonesian descriptive text */}
        <p className="font-editorial-body text-sm sm:text-base text-[#8D817B] max-w-xl leading-relaxed mb-10">
          Untuk semua cerita kecil, perjalanan sederhana, tawa yang tidak direncanakan,
          dan kenangan yang ingin selalu kita simpan.
        </p>

        {/* Hero Photo with Frame & Soft Shadow */}
        <div className="relative w-full max-w-3xl aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl shadow-[#78655F]/15 border-4 border-white mb-10 group">
          <Image
            src="/images/hero.jpg"
            alt="Momen obrolan hangat berdua"
            fill
            priority
            className="object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, 900px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 text-left text-white drop-shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/80 font-mono">
                Ruang Bersama
              </p>
              <p className="font-editorial-heading text-lg sm:text-xl font-medium">
                {space?.name || "Our Little Space"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privat & Aman</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleEnterSpace}
            className="group flex items-center gap-3 px-8 py-4 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-base font-editorial-body font-medium transition-all shadow-lg shadow-[#CFA6A3]/30 hover:shadow-xl hover:shadow-[#CFA6A3]/40 active:scale-95"
          >
            <span>Buka Kenangan Kita</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 text-center text-xs text-[#8D817B]">
        <p className="font-editorial-body">
          Some moments are too beautiful to forget. 🤍
        </p>
      </footer>

      {/* Invite Code Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#F1EBE4] text-[#CFA6A3] flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="font-editorial-heading text-2xl font-normal text-[#302B29]">
                Gabung ke Ruang Kenangan
              </h2>
              <p className="text-xs text-[#8D817B] mt-2">
                Masukkan kode undangan 6-12 karakter yang diberikan oleh pasanganmu.
              </p>
            </div>

            <form onSubmit={handleJoinSpace} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: MOMENTS-2026"
                  className="w-full text-center tracking-widest uppercase font-mono px-4 py-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3]"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F] hover:bg-[#FAF8F5]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !inviteCode.trim()}
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#CFA6A3] hover:bg-[#B88582] text-white text-xs font-editorial-body font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Memverifikasi..." : "Gabung Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
