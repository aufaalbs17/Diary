"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Trash2,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  Camera,
  Mail,
  CheckSquare,
  Sparkles,
  Edit3,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast-provider";
import { ProfileEditorModal } from "@/components/ui/profile-editor-modal";
import { getDiaryStats, clearAllDiaryData } from "@/lib/store";
import { DiaryStats } from "@/lib/types";

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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [stats, setStats] = useState<DiaryStats>({
    totalMemories: 0,
    totalPhotos: 0,
    totalVideos: 0,
    totalNotes: 0,
  });

  const loadStats = async () => {
    try {
      const s = await getDiaryStats();
      setStats(s);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

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

  const handleClearAllData = async () => {
    setIsClearingData(true);
    try {
      await clearAllDiaryData();
      await loadStats();
      setShowClearConfirm(false);
      success("Semua data jurnal, galeri, dan surat berhasil dibersihkan.");
    } catch {
      error("Gagal membersihkan data");
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-[#E9E1DB]/80">
        <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
          Pengaturan Pribadi &amp; Profil
        </span>
        <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
          Settings.
        </h1>
        <p className="font-editorial-body text-sm text-[#78655F] mt-2">
          Kelola profil akun, ruang kenangan bersama, dan manajemen penghapusan data.
        </p>
      </div>

      {/* 1. Account Profile Customizer Card */}
      <section className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E1DB]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#CFA6A3]" />
            <h2 className="font-editorial-heading text-xl text-[#302B29]">
              Profil Akun Pribadi
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#CFA6A3] to-[#B88582] text-white text-xs font-editorial-body font-medium shadow-md shadow-[#CFA6A3]/30 hover:opacity-95 transition-opacity cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Atur &amp; Edit Profil Saya 👤</span>
          </button>
        </div>

        <div className="p-3 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl flex items-center gap-2.5 text-xs text-[#78655F]">
          <span className="text-base">🔒</span>
          <span>
            <strong>Perlindungan Privasi:</strong> Pengaturan profil hanya dapat diubah oleh akun yang sedang aktif login. Kamu tidak dapat mengubah data profil pasanganmu.
          </span>
        </div>

        {/* Both Members Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Member 1: User (Active & Editable) */}
          <div className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#CFA6A3]/40 flex flex-col justify-between space-y-3 shadow-xs relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#F1EBE4] border-2 border-[#CFA6A3] shadow-sm shrink-0">
                  {user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={user.nickname || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-base text-[#78655F]">
                      {user?.nickname?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-editorial-heading text-base font-medium text-[#302B29]">
                      {user?.nickname || user?.full_name || "Kamu"}
                    </h3>
                    <span className="text-[10px] bg-[#CFA6A3] text-white px-2 py-0.5 rounded-full font-mono">
                      Sedang Login
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8D817B]">
                    {user?.full_name || "Akun Saya"}
                  </p>
                </div>
              </div>
            </div>

            {user?.bio && (
              <p className="font-editorial-quote italic text-xs text-[#78655F] line-clamp-2">
                &ldquo;{user.bio}&rdquo;
              </p>
            )}

            {user?.favorite_quote && (
              <p className="text-[11px] text-[#8D817B] font-editorial-body">
                💬 {user.favorite_quote}
              </p>
            )}

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F1EBE4] border border-[#E9E1DB] text-xs text-[#302B29] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#CFA6A3]" />
              <span>Edit Profil Saya</span>
            </button>
          </div>

          {/* Member 2: Partner (Locked & Protected) */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5]/80 border border-[#E9E1DB] flex flex-col justify-between space-y-3 opacity-90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#F1EBE4] border-2 border-white shadow-xs shrink-0">
                  {partner?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.avatar_url}
                      alt={partner.nickname || "Partner"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-base text-[#78655F]">
                      {partner?.nickname?.charAt(0) || "P"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-editorial-heading text-base font-medium text-[#302B29]">
                      {partner?.nickname || partner?.full_name || "Pasangan"}
                    </h3>
                    <span className="text-[10px] bg-[#FAF0EC] text-[#B88582] border border-[#CFA6A3]/40 px-2 py-0.5 rounded-full font-mono">
                      Pasangan ♡
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8D817B]">
                    {partner?.full_name || "Pasangan Tercinta"}
                  </p>
                </div>
              </div>
            </div>

            {partner?.bio && (
              <p className="font-editorial-quote italic text-xs text-[#78655F] line-clamp-2">
                &ldquo;{partner.bio}&rdquo;
              </p>
            )}

            {partner?.favorite_quote && (
              <p className="text-[11px] text-[#8D817B] font-editorial-body">
                💬 {partner.favorite_quote}
              </p>
            )}

            <div className="w-full mt-2 py-2 px-3 rounded-xl bg-white border border-[#E9E1DB] text-[11px] text-[#8D817B] flex items-center justify-center gap-1.5 select-none">
              <span>🔒 Terkunci (Hanya {partner?.nickname || "pasangan"} yang bisa edit)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Space & Invitation Code */}
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
            className="flex items-center gap-2 px-5 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium transition-all shadow-xs shrink-0 active:scale-95 cursor-pointer"
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
              className="px-5 py-2.5 bg-[#302B29] hover:bg-black text-white rounded-2xl text-xs font-editorial-body font-medium transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </section>

      {/* 3. Pusat Manajemen & Penghapusan Data (Danger Zone / Kelola Memori) */}
      <section className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-500" />
          <h2 className="font-editorial-heading text-xl text-[#302B29]">
            Pusat Manajemen &amp; Penghapusan Data
          </h2>
        </div>

        <p className="font-editorial-body text-xs text-[#78655F] leading-relaxed">
          Kamu memiliki kontrol penuh untuk mengelola dan menghapus kenangan, foto di galeri, surat manis, atau bahkan mereset semua data ruang jika ingin memulai lembaran baru.
        </p>

        {/* Data Stats Quick Access */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/diary"
            className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <BookOpen className="w-4 h-4 text-[#CFA6A3]" />
              <span className="text-[10px] text-rose-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Kelola 🗑️
              </span>
            </div>
            <div className="mt-2">
              <p className="font-editorial-heading text-2xl font-bold text-[#302B29]">
                {stats.totalMemories}
              </p>
              <p className="text-[11px] text-[#8D817B]">Jurnal Kenangan</p>
            </div>
          </Link>

          <Link
            href="/gallery"
            className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Camera className="w-4 h-4 text-[#CFA6A3]" />
              <span className="text-[10px] text-rose-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Kelola 🗑️
              </span>
            </div>
            <div className="mt-2">
              <p className="font-editorial-heading text-2xl font-bold text-[#302B29]">
                {stats.totalPhotos}
              </p>
              <p className="text-[11px] text-[#8D817B]">Foto di Galeri</p>
            </div>
          </Link>

          <Link
            href="/notes"
            className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Mail className="w-4 h-4 text-[#CFA6A3]" />
              <span className="text-[10px] text-rose-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Kelola 🗑️
              </span>
            </div>
            <div className="mt-2">
              <p className="font-editorial-heading text-2xl font-bold text-[#302B29]">
                {stats.totalNotes}
              </p>
              <p className="text-[11px] text-[#8D817B]">Surat Manis</p>
            </div>
          </Link>

          <Link
            href="/bucket-list"
            className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <CheckSquare className="w-4 h-4 text-[#CFA6A3]" />
              <span className="text-[10px] text-rose-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Kelola 🗑️
              </span>
            </div>
            <div className="mt-2">
              <p className="font-editorial-heading text-2xl font-bold text-[#302B29]">
                ✓
              </p>
              <p className="text-[11px] text-[#8D817B]">Bucket List</p>
            </div>
          </Link>
        </div>

        {/* Clear All Data Button / Danger Zone */}
        <div className="pt-4 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Bersihkan Seluruh Lembaran Kenangan</span>
            </p>
            <p className="text-[11px] text-rose-700/80 leading-relaxed">
              Menghapus semua entri jurnal kenangan, media galeri foto, dan surat manis dari ruang penyimpanan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-editorial-body font-medium shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Reset Semua Data
          </button>
        </div>
      </section>

      {/* 4. Backend & Database Status */}
      <section className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#CFA6A3]" />
          <h2 className="font-editorial-heading text-xl text-[#302B29]">
            Status Database &amp; Cloud Storage
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
          className="flex items-center gap-2 px-5 py-2.5 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-full text-xs font-editorial-body transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Ruang</span>
        </button>
      </div>

      {/* Profile Editor Modal */}
      <ProfileEditorModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Danger Zone: Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-editorial-heading text-xl text-[#302B29]">
                Konfirmasi Hapus Semua Data?
              </h3>
              <p className="font-editorial-body text-xs text-[#78655F] leading-relaxed">
                Tindakan ini akan menghapus <strong>seluruh catatan jurnal, foto galeri, dan surat manis</strong> secara permanen. Data yang telah dihapus tidak dapat dikembalikan.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E9E1DB] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                disabled={isClearingData}
                className="px-5 py-2.5 rounded-full border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleClearAllData}
                disabled={isClearingData}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-editorial-body font-medium shadow-md shadow-rose-600/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingData ? "Menghapus..." : "Ya, Hapus Semua"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
