"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  KeyRound,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast-provider";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, logout, space } = useAuth();
  const { success, error, info } = useToast();

  const [selectedUser, setSelectedUser] = useState<"user-1" | "user-2">("user-1");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"quick" | "manual">("quick");

  // Manual form states
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");

  const aufaMember = space?.members.find((m) => m.user_id === "user-1");
  const anathiaMember = space?.members.find((m) => m.user_id === "user-2");

  const aufaProfile = aufaMember?.profile || {
    nickname: "Aufa",
    full_name: "Aufa",
    avatar_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    email: "aufa@ourlittlemoments.id",
  };

  const anathiaProfile = anathiaMember?.profile || {
    nickname: "Anathia",
    full_name: "Anathia",
    avatar_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    email: "anathia@ourlittlemoments.id",
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinToSubmit = pin.trim() || "1234";

    setIsSubmitting(true);
    try {
      const res = await login(selectedUser, pinToSubmit);
      if (res.success) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#CFA6A3", "#B88582", "#F8DEDC", "#F0EDE8"],
        });
        success(res.message);
        router.push("/");
      } else {
        error(res.message);
      }
    } catch {
      error("Terjadi kendala saat login. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) {
      info("Mohon masukkan email atau nama akun");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(manualEmail.trim(), manualPassword.trim() || "1234");
      if (res.success) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#CFA6A3", "#B88582", "#F8DEDC"],
        });
        success(res.message);
        router.push("/");
      } else {
        error(res.message);
      }
    } catch {
      error("Terjadi kesalahan saat verifikasi akun.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#302B29] flex flex-col justify-between overflow-x-hidden">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-[#CFA6A3]/18 via-[#F1EBE4]/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#B88582]/10 blur-3xl pointer-events-none" />

      {/* Top Navbar Minimal */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group transition-transform active:scale-95"
        >
          <span className="font-editorial-heading text-lg sm:text-xl font-medium tracking-tight text-[#302B29] group-hover:text-[#B88582] transition-colors">
            Our Little Moments
          </span>
          <span className="text-[#CFA6A3] text-sm group-hover:scale-125 transition-transform">
            🤍
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-[#8D817B] font-editorial-body">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Ruang Privat &amp; Aman</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-md border border-[#E9E1DB] rounded-3xl sm:rounded-4xl p-6 sm:p-8 shadow-xl shadow-[#78655F]/8"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF5F0] border border-[#E9E1DB] text-[11px] text-[#78655F] font-editorial-body mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#CFA6A3]" />
              <span>Ruang Kenangan Aufa &amp; Anathia</span>
            </div>
            <h1 className="font-editorial-heading text-2xl sm:text-3xl font-medium text-[#302B29] tracking-tight">
              Masuk ke Diary Kita
            </h1>
            <p className="font-editorial-body text-xs text-[#8D817B] mt-1.5 max-w-xs mx-auto">
              Setiap momen punya ceritanya sendiri. Pilih akunmu untuk masuk ke ruang berdua.
            </p>
          </div>

          {/* Already logged in alert */}
          {isAuthenticated && user && (
            <div className="mb-6 p-4 rounded-2xl bg-[#FAF5F0] border border-[#CFA6A3]/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-medium text-[#302B29]">
                    Kamu sedang masuk sebagai: <strong>{user.nickname}</strong>
                  </p>
                  <p className="text-[11px] text-[#8D817B]">
                    Klik tombol di bawah untuk langsung membuka beranda.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-3 py-1.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white text-xs font-editorial-body rounded-full transition-colors shrink-0 shadow-2xs"
              >
                Buka Beranda →
              </button>
            </div>
          )}

          {/* Toggle Tabs (Quick Select vs Manual) */}
          <div className="flex p-1 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("quick")}
              className={`flex-1 py-2 text-xs font-editorial-body rounded-xl transition-all cursor-pointer ${
                activeTab === "quick"
                  ? "bg-white text-[#302B29] font-medium shadow-2xs border border-[#E9E1DB]"
                  : "text-[#8D817B] hover:text-[#302B29]"
              }`}
            >
              Pilih Cepat Akun Berdua ♡
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-2 text-xs font-editorial-body rounded-xl transition-all cursor-pointer ${
                activeTab === "manual"
                  ? "bg-white text-[#302B29] font-medium shadow-2xs border border-[#E9E1DB]"
                  : "text-[#8D817B] hover:text-[#302B29]"
              }`}
            >
              Email / Sandi
            </button>
          </div>

          {activeTab === "quick" ? (
            <form onSubmit={handleQuickLogin} className="space-y-5">
              {/* Couple Avatar Cards */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#8D817B] block">
                  Pilih Akun yang Ingin Kamu Pakai:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Aufa Card */}
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedUser("user-1")}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col items-center gap-2 ${
                      selectedUser === "user-1"
                        ? "bg-[#FAF5F0] border-[#CFA6A3] shadow-md shadow-[#CFA6A3]/20"
                        : "bg-white border-[#E9E1DB] hover:border-[#D6CCC2]"
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={aufaProfile.avatar_url || ""}
                        alt="Aufa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-editorial-heading text-sm font-medium text-[#302B29]">
                        {aufaProfile.nickname || "Aufa"}
                      </h4>
                      <p className="text-[10px] text-[#8D817B] font-mono">
                        Akun Aufa
                      </p>
                    </div>
                    {selectedUser === "user-1" && (
                      <span className="text-[10px] bg-[#CFA6A3] text-white px-2 py-0.5 rounded-full font-editorial-body mt-0.5">
                        Dipilih ✓
                      </span>
                    )}
                  </motion.div>

                  {/* Anathia Card */}
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedUser("user-2")}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col items-center gap-2 ${
                      selectedUser === "user-2"
                        ? "bg-[#FAF5F0] border-[#CFA6A3] shadow-md shadow-[#CFA6A3]/20"
                        : "bg-white border-[#E9E1DB] hover:border-[#D6CCC2]"
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={anathiaProfile.avatar_url || ""}
                        alt="Anathia"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-editorial-heading text-sm font-medium text-[#302B29]">
                        {anathiaProfile.nickname || "Anathia"}
                      </h4>
                      <p className="text-[10px] text-[#8D817B] font-mono">
                        Akun Anathia
                      </p>
                    </div>
                    {selectedUser === "user-2" && (
                      <span className="text-[10px] bg-[#CFA6A3] text-white px-2 py-0.5 rounded-full font-editorial-body mt-0.5">
                        Dipilih ✓
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* PIN Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-editorial-body text-[#78655F] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#CFA6A3]" />
                    <span>PIN Keamanan / Sandi</span>
                  </label>
                  <span className="text-[11px] text-[#8D817B] font-mono">
                    Default PIN: 1234
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Masukkan PIN (Default: 1234)"
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] placeholder:text-[#8D817B]/60 focus:outline-hidden focus:border-[#CFA6A3] transition-colors pr-10 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D817B] hover:text-[#302B29] cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[11px] text-[#8D817B] italic">
                  💡 Langsung tekan tombol Masuk jika menggunakan PIN bawaan (1234).
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white rounded-2xl text-xs sm:text-sm font-editorial-body font-medium shadow-md shadow-[#CFA6A3]/30 hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? "Memverifikasi..."
                    : `Masuk sebagai ${
                        selectedUser === "user-1"
                          ? aufaProfile.nickname || "Aufa"
                          : anathiaProfile.nickname || "Anathia"
                      } ♡`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Email atau Nama Pengguna
                </label>
                <input
                  type="text"
                  required
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="aufa@ourlittlemoments.id atau anathia"
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-editorial-body text-[#78655F]">
                    PIN atau Sandi
                  </label>
                  <span className="text-[11px] text-[#8D817B] font-mono">
                    Default: 1234
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Masukkan PIN (Default: 1234)"
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D817B] hover:text-[#302B29] cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white rounded-2xl text-xs sm:text-sm font-editorial-body font-medium shadow-md shadow-[#CFA6A3]/30 hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isSubmitting ? "Memverifikasi..." : "Masuk ke Akun"}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          )}

          {/* Privacy Note */}
          <div className="mt-6 pt-5 border-t border-[#E9E1DB] text-center">
            <p className="font-editorial-body text-[11px] text-[#8D817B] leading-relaxed">
              Setiap akun memiliki privasi sendiri. Pengaturan profil akunmu hanya dapat diedit saat kamu login dengan akun tersebut.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 text-center text-xs text-[#8D817B]">
        <p className="font-editorial-body">
          Our Little Moments 🤍 · Ruang Cinta Aufa &amp; Anathia
        </p>
      </footer>
    </div>
  );
}
