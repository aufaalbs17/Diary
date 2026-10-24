"use client";

import React, { useState } from "react";
import {
  Settings,
  Users,
  Copy,
  Check,
  ShieldCheck,
  Database,
  LogOut,
  Save,
  User,
  Heart,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast-provider";

export default function SettingsPage() {
  const {
    user,
    partner,
    space,
    allMembers,
    isConfiguredWithSupabase,
    updateProfile,
    updateSpaceName,
    logout,
  } = useAuth();
  const { success, error, info } = useToast();

  const [spaceName, setSpaceName] = useState(space?.name || "Our Little Space");
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [copied, setCopied] = useState(false);

  const handleSaveSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceName.trim()) return;
    updateSpaceName(spaceName.trim());
    success("Nama ruang kenangan berhasil diperbarui.");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    updateProfile({ nickname: nickname.trim() });
    success("Nama panggilanmu berhasil diperbarui.");
  };

  const copyInviteCode = () => {
    if (!space?.invite_code) return;
    navigator.clipboard.writeText(space.invite_code);
    setCopied(true);
    success("Kode undangan berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-[#E9E1DB]/80">
        <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
          Pengaturan Pribadi
        </span>
        <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
          Settings.
        </h1>
        <p className="font-editorial-body text-sm text-[#78655F] mt-2">
          Kelola ruang kenangan bersama, profil pribadi, dan undangan untuk pasangan.
        </p>
      </div>

      {/* 1. Space & Invitation Code */}
      <section className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#CFA6A3]" />
          <h2 className="font-editorial-heading text-xl text-[#302B29]">
            Kode Undangan Ruang Kenangan
          </h2>
        </div>

        <p className="font-editorial-body text-xs text-[#78655F] leading-relaxed">
          Ruang kenangan ini dirancang khusus dan privat hanya untuk 2 orang. Bagikan kode ini kepada pasanganmu agar dia bisa bergabung ke dalam ruang yang sama.
        </p>

        <div className="p-4 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono text-[#8D817B] uppercase">
              Kode Akses Pasangan
            </p>
            <p className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-[#302B29] mt-0.5">
              {space?.invite_code || "MOMENTS-2026"}
            </p>
          </div>

          <button
            onClick={copyInviteCode}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium transition-all shadow-xs shrink-0 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Kode Undangan</span>
              </>
            )}
          </button>
        </div>

        {/* Space Name Form */}
        <form onSubmit={handleSaveSpace} className="space-y-3 pt-2">
          <label className="text-xs font-editorial-body text-[#78655F]">
            Nama Ruang Kenangan Bersama
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#302B29] hover:bg-black text-white rounded-2xl text-xs font-editorial-body font-medium transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </section>

      {/* 2. Members of the Space (Max 2) */}
      <section className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#CFA6A3]" />
            <h2 className="font-editorial-heading text-xl text-[#302B29]">
              Anggota Ruang ({allMembers.length} / 2 Orang)
            </h2>
          </div>
          <span className="text-xs bg-[#F1EBE4] text-[#78655F] px-3 py-1 rounded-full font-editorial-body">
            Maksimum 2 Anggota
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allMembers.map((m) => (
            <div
              key={m.user_id}
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                m.user_id === user?.id
                  ? "bg-[#FAF8F5] border-[#CFA6A3]"
                  : "bg-white border-[#E9E1DB]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F1EBE4] flex items-center justify-center text-[#78655F] font-bold text-sm">
                  {m.profile?.nickname?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-editorial-heading text-sm font-medium text-[#302B29]">
                    {m.profile?.nickname || m.profile?.full_name}
                  </p>
                  <p className="text-[11px] text-[#8D817B]">
                    {m.role === "owner" ? "Pemilik Ruang" : "Pasangan"}
                  </p>
                </div>
              </div>
              {m.user_id === user?.id && (
                <span className="text-[10px] bg-[#CFA6A3] text-white px-2.5 py-0.5 rounded-full">
                  Kamu
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. My Profile Settings */}
      <section className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#CFA6A3]" />
          <h2 className="font-editorial-heading text-xl text-[#302B29]">
            Profil Pribadi
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-editorial-body text-[#78655F]">
              Nama Panggilan (Muncul di Jurnal & Surat)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-editorial-body text-[#78655F]">
              Email Terdaftar
            </label>
            <input
              type="text"
              disabled
              value={user?.email || "user@ourlittlemoments.id"}
              className="w-full px-4 py-2.5 bg-[#FAF8F5]/60 border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#8D817B] cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium transition-colors"
          >
            Perbarui Profil
          </button>
        </form>
      </section>

      {/* 4. Backend & Database Status */}
      <section className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#CFA6A3]" />
          <h2 className="font-editorial-heading text-xl text-[#302B29]">
            Status Database & Cloud Storage
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isConfiguredWithSupabase ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
            <div>
              <p className="font-editorial-body text-xs font-medium text-[#302B29]">
                {isConfiguredWithSupabase
                  ? "Terhubung ke Supabase PostgreSQL & RLS"
                  : "Mode Lokal Mandiri (Simulasi Berkelanjutan Aktif)"}
              </p>
              <p className="text-[11px] text-[#8D817B]">
                {isConfiguredWithSupabase
                  ? "Semua data, media, dan autentikasi disinkronkan secara langsung ke server cloud Supabase."
                  : "Data tersimpan aman di browser. Untuk menghubungkan ke cloud Supabase pribadi, isi NEXT_PUBLIC_SUPABASE_URL di .env.local dan jalankan schema.sql."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Logout */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-full text-xs font-editorial-body transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Ruang</span>
        </button>
      </div>
    </div>
  );
}
