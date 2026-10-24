"use client";

import React, { useState } from "react";
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
  Users,
  Menu,
  X,
  Book,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/", label: "Beranda", icon: Sparkles },
  { href: "/diary", label: "Jurnal", icon: BookOpen },
  { href: "/gallery", label: "Galeri", icon: ImageIcon },
  { href: "/calendar", label: "Kalender", icon: Calendar },
  { href: "/timeline", label: "Timeline", icon: Compass },
  { href: "/places", label: "Tempat Kita", icon: Compass },
  { href: "/notes", label: "Surat Kecil 💌", icon: Mail },
  { href: "/bucket-list", label: "Bucket List", icon: Heart },
  { href: "/book", label: "Buku", icon: Book },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, partner, switchUser, space } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Do not render navbar on /welcome or /auth pages
  if (pathname === "/welcome" || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 group transition-transform active:scale-95"
        >
          <span className="font-editorial-heading text-lg sm:text-xl font-medium tracking-tight text-[#302B29] group-hover:text-[#B88582] transition-colors">
            Our Little Moments
          </span>
          <span className="text-[#CFA6A3] text-sm group-hover:scale-110 transition-transform">
            🤍
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-editorial-body transition-all ${
                  isActive
                    ? "bg-[#F1EBE4] text-[#302B29] font-medium shadow-sm"
                    : "text-[#8D817B] hover:text-[#302B29] hover:bg-[#FAF8F5]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Quick Add & Active User Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Button */}
          <Link
            href="/diary/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs sm:text-sm font-editorial-body transition-all shadow-sm shadow-[#CFA6A3]/40 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerita Baru</span>
          </Link>

          {/* User Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1 bg-white border border-[#E9E1DB] rounded-full hover:border-[#CFA6A3] transition-all text-xs text-[#302B29] shadow-xs"
              title="Ganti Pengguna Aktif"
            >
              <div className="w-6 h-6 rounded-full bg-[#F1EBE4] flex items-center justify-center text-[#78655F] text-xs font-semibold overflow-hidden">
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt={user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.nickname?.charAt(0) || "U"
                )}
              </div>
              <span className="font-editorial-body font-medium hidden md:inline">
                {user?.nickname || "Pengguna"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white border border-[#E9E1DB] rounded-2xl shadow-xl py-2 z-50 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-[#E9E1DB]/60">
                  <p className="text-[11px] text-[#8D817B]">Ruang Kenangan</p>
                  <p className="font-medium text-[#302B29] truncate">
                    {space?.name || "Our Little Space"}
                  </p>
                </div>

                <div className="p-2">
                  <p className="px-2 py-1 text-[11px] font-medium text-[#8D817B]">
                    Ganti Profil Aktif (2 Orang):
                  </p>
                  {space?.members.map((m) => (
                    <button
                      key={m.user_id}
                      onClick={() => {
                        switchUser(m.user_id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        m.user_id === user?.id
                          ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                          : "text-[#78655F] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#CFA6A3]/20 flex items-center justify-center text-[#78655F] text-[10px] font-bold">
                          {m.profile?.nickname?.charAt(0) || "U"}
                        </div>
                        <span>{m.profile?.nickname || m.profile?.full_name}</span>
                      </div>
                      {m.user_id === user?.id && (
                        <span className="text-[10px] bg-[#CFA6A3] text-white px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#E9E1DB]/60 pt-1 px-2">
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#78655F] hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
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
        <div className="lg:hidden border-b border-[#E9E1DB] bg-white px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200 shadow-lg">
          <nav className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
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
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-editorial-body transition-colors ${
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
