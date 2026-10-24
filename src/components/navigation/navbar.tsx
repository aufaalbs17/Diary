"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Compass,
  Heart,
  Image as ImageIcon,
  Mail,
  Plus,
  Settings,
  Sparkles,
  ChevronDown,
  Volume2,
  VolumeX,
  Menu,
  X,
  Book,
  MapPin,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toggleAmbientSound, isAmbientPlaying } from "@/lib/ambient-sound";

export function Navbar() {
  const pathname = usePathname();
  const { user, partner, switchUser, space } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  useEffect(() => {
    setIsPlayingMusic(isAmbientPlaying());
  }, []);

  const handleToggleSound = () => {
    const nextState = toggleAmbientSound((playing) => setIsPlayingMusic(playing));
    setIsPlayingMusic(nextState);
  };

  // Do not render navbar on /welcome or /auth pages
  if (pathname === "/welcome" || pathname.startsWith("/auth")) {
    return null;
  }

  const primaryLinks = [
    { href: "/", label: "Beranda", icon: Sparkles },
    { href: "/diary", label: "Jurnal", icon: BookOpen },
    { href: "/gallery", label: "Galeri", icon: ImageIcon },
    { href: "/book", label: "Buku", icon: Book },
    { href: "/notes", label: "Surat Kecil 💌", icon: Mail },
  ];

  const exploreLinks = [
    {
      href: "/calendar",
      label: "Kalender Kenangan",
      desc: "Jejak cerita per tanggal",
      icon: Calendar,
    },
    {
      href: "/timeline",
      label: "Timeline Bersama",
      desc: "Garis waktu kronologis perjalanan",
      icon: Clock,
    },
    {
      href: "/places",
      label: "Tempat Kita",
      desc: "Peta kafe, pantai & sudut kota",
      icon: MapPin,
    },
    {
      href: "/bucket-list",
      label: "Bucket List",
      desc: "Daftar harapan & impian berdua",
      icon: Heart,
    },
  ];

  const isExploreActive = exploreLinks.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-all bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E9E1DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand with Aufa & Anathia subtitle */}
        <Link
          href="/"
          className="flex flex-col group transition-transform active:scale-95 shrink-0"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-editorial-heading text-lg sm:text-xl font-medium tracking-tight text-[#302B29] group-hover:text-[#B88582] transition-colors whitespace-nowrap">
              Our Little Moments
            </span>
            <span className="text-[#CFA6A3] text-sm group-hover:scale-110 transition-transform">
              🤍
            </span>
          </div>
          <span className="font-editorial-quote italic text-xs text-[#8D817B] -mt-0.5 group-hover:text-[#302B29] transition-colors whitespace-nowrap">
            Aufa & Anathia&apos;s Diary
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {primaryLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-editorial-body transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#F1EBE4] text-[#302B29] font-medium shadow-xs"
                    : "text-[#78655F] hover:text-[#302B29] hover:bg-[#F1EBE4]/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Explore Dropdown (Kalender, Timeline, Tempat Kita, Bucket List) */}
          <div className="relative">
            <button
              onClick={() => setIsExploreOpen(!isExploreOpen)}
              onMouseEnter={() => setIsExploreOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-editorial-body transition-all whitespace-nowrap ${
                isExploreActive || isExploreOpen
                  ? "bg-[#F1EBE4] text-[#302B29] font-medium shadow-xs"
                  : "text-[#78655F] hover:text-[#302B29] hover:bg-[#F1EBE4]/50"
              }`}
            >
              <span>Jelajahi</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isExploreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Explore Menu Popover */}
            {isExploreOpen && (
              <div
                onMouseLeave={() => setIsExploreOpen(false)}
                className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#E9E1DB] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="space-y-1">
                  {exploreLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsExploreOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                          isActive
                            ? "bg-[#F1EBE4] text-[#302B29]"
                            : "hover:bg-[#FAF8F5] text-[#78655F]"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E9E1DB] flex items-center justify-center shrink-0 mt-0.5 text-[#CFA6A3]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-editorial-heading text-xs font-medium text-[#302B29] whitespace-nowrap">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-[#8D817B] font-editorial-body">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions: Soundscape Player, Quick Add & User Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Ambient Rain / Atmosphere Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={isPlayingMusic ? "Matikan Suasana Hujan" : "Nyalakan Suasana Hujan Tenang 🌧️"}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-editorial-body transition-all border ${
              isPlayingMusic
                ? "bg-[#F1EBE4] border-[#CFA6A3] text-[#302B29] shadow-xs"
                : "bg-white/80 border-[#E9E1DB] text-[#8D817B] hover:text-[#302B29]"
            }`}
          >
            {isPlayingMusic ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#CFA6A3] animate-pulse" />
                <span className="whitespace-nowrap text-[11px]">Hujan Santai 🌧️</span>
                <span className="flex gap-0.5 items-end h-3 ml-0.5">
                  <span className="w-0.5 h-2 bg-[#CFA6A3] animate-bounce" />
                  <span className="w-0.5 h-3 bg-[#CFA6A3] animate-bounce delay-75" />
                  <span className="w-0.5 h-1.5 bg-[#CFA6A3] animate-bounce delay-150" />
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#8D817B]" />
                <span className="whitespace-nowrap text-[11px]">Suasana</span>
              </>
            )}
          </button>

          {/* Quick Add Button */}
          <Link
            href="/diary/new"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#CFA6A3] to-[#B88582] hover:opacity-95 text-white rounded-full text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-sm shadow-[#CFA6A3]/30 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cerita Baru</span>
          </Link>

          {/* User Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E9E1DB] rounded-full hover:border-[#CFA6A3] transition-all text-xs text-[#302B29] shadow-2xs whitespace-nowrap"
              title="Ganti Pengguna Aktif (Aufa & Anathia)"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#CFA6A3] to-[#F1EBE4] flex items-center justify-center text-[#78655F] text-xs font-bold shadow-inner">
                {user?.nickname?.charAt(0) || "A"}
              </div>
              <span className="font-editorial-body font-medium">
                {user?.nickname || "Aufa"}
              </span>
              <ChevronDown className="w-3 h-3 text-[#8D817B]" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white border border-[#E9E1DB] rounded-2xl shadow-xl py-2 z-50 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-[#E9E1DB]/60">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-[#8D817B]">
                    Ruang Kenangan Bersama
                  </p>
                  <p className="font-editorial-heading font-medium text-[#302B29] text-sm truncate mt-0.5">
                    {space?.name || "Ruang Kecil Kita"}
                  </p>
                </div>

                <div className="p-2 space-y-1">
                  <p className="px-2 py-1 text-[10px] font-medium text-[#8D817B] uppercase font-mono">
                    Ganti Profil Aktif (2 Orang):
                  </p>
                  {space?.members.map((m) => {
                    const isSelf = m.user_id === user?.id;
                    const nickname = m.profile?.nickname || m.profile?.full_name || "Anggota";
                    return (
                      <button
                        key={m.user_id}
                        onClick={() => {
                          switchUser(m.user_id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                          isSelf
                            ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                            : "text-[#78655F] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#CFA6A3]/20 flex items-center justify-center text-[#78655F] text-xs font-bold">
                            {nickname.charAt(0)}
                          </div>
                          <span className="whitespace-nowrap">{nickname}</span>
                        </div>
                        {isSelf && (
                          <span className="text-[10px] bg-[#CFA6A3] text-white px-2 py-0.5 rounded-full font-editorial-body">
                            Aktif
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[#E9E1DB]/60 pt-1 px-2">
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#78655F] hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#CFA6A3]" />
                    <span>Pengaturan Ruang</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 lg:hidden text-[#78655F] hover:text-[#302B29] rounded-xl hover:bg-[#F1EBE4] transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E9E1DB] bg-white px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200 shadow-lg space-y-3">
          {/* Mobile Soundscape button */}
          <button
            onClick={handleToggleSound}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB] text-xs text-[#78655F]"
          >
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#CFA6A3]" />
              <span>Suasana Hujan & Kafe Tenang</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                isPlayingMusic
                  ? "bg-[#CFA6A3] text-white font-medium"
                  : "bg-white text-[#8D817B]"
              }`}
            >
              {isPlayingMusic ? "Menyala" : "Mati"}
            </span>
          </button>

          <nav className="grid grid-cols-2 gap-2">
            {[...primaryLinks, ...exploreLinks].map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-editorial-body transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                      : "text-[#78655F] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#CFA6A3]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
