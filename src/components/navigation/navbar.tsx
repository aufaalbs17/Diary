"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Clock,
  User,
  LogOut,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

import { motion, AnimatePresence } from "motion/react";
import { ProfileEditorModal } from "@/components/ui/profile-editor-modal";
import { AmbientSoundDropdown } from "@/components/ui/ambient-sound-dropdown";

export function Navbar() {
  const pathname = usePathname();
  const { user, partner, space, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const exploreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setIsExploreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsExploreOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Do not render navbar on /welcome, /login, or /auth pages
  if (pathname === "/welcome" || pathname === "/login" || pathname.startsWith("/auth")) {
    return null;
  }

  const primaryLinks = [
    { href: "/", label: "Beranda", icon: Sparkles },
    { href: "/diary", label: "Jurnal Kenangan", icon: BookOpen },
    { href: "/gallery", label: "Galeri Foto", icon: ImageIcon },
    { href: "/notes", label: "Surat Kasih 💌", icon: Mail },
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
      href: "/bucket-list",
      label: "Bucket List",
      desc: "Daftar impian & wishlist berdua",
      icon: Heart,
    },
  ];

  const isExploreActive = exploreLinks.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const activeHref =
    primaryLinks.find(
      (l) =>
        l.href === "/"
          ? pathname === "/"
          : pathname === l.href || pathname.startsWith(`${l.href}/`)
    )?.href || null;

  const currentHighlight = hoveredNav || activeHref;

  return (
    <header className="sticky top-0 z-40 w-full glass-header bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E9E1DB] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand with Aufa & Anathia subtitle & Heartbeat micro-animation */}
        <Link
          href="/"
          className="flex flex-col group transition-transform duration-200 active:scale-95 shrink-0 select-none"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-editorial-heading text-lg sm:text-xl font-medium tracking-tight text-[#302B29] group-hover:text-[#B88582] transition-colors duration-200 whitespace-nowrap">
              Our Little Moments
            </span>
            <motion.span
              whileHover={{ scale: 1.35, rotate: [0, -12, 12, -6, 0] }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="inline-block text-[#CFA6A3] text-sm cursor-pointer"
            >
              🤍
            </motion.span>
          </div>
          <span className="font-editorial-quote italic text-xs text-[#8D817B] -mt-0.5 group-hover:text-[#302B29] transition-colors duration-200 whitespace-nowrap">
            Aufa &amp; Anathia&apos;s Diary
          </span>
        </Link>

        {/* Desktop Navigation Links with Magnetic Gliding Indicator */}
        <nav
          onMouseLeave={() => setHoveredNav(null)}
          className="hidden lg:flex items-center gap-1.5 relative p-1 rounded-full bg-white/40 border border-[#E9E1DB]/60 backdrop-blur-xs"
        >
          {primaryLinks.map((link) => {
            const isItemActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const isHighlighted = currentHighlight === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoveredNav(link.href)}
                className={`relative px-4 py-2 rounded-full text-xs xl:text-sm font-editorial-body transition-colors duration-200 whitespace-nowrap select-none ${
                  isItemActive || isHighlighted
                    ? "text-[#302B29] font-medium"
                    : "text-[#78655F] hover:text-[#302B29]"
                }`}
              >
                {isHighlighted && (
                  <motion.div
                    layoutId="navbar-magnetic-pill"
                    className="absolute inset-0 bg-[#F1EBE4] border border-[#E9E1DB] rounded-full shadow-2xs -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 440,
                      damping: 32,
                      mass: 0.6,
                    }}
                    style={{
                      transform: "translate3d(0, 0, 0)",
                      backfaceVisibility: "hidden",
                    }}
                  />
                )}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Soundscape Player, Circular Fitur Tambahan, Quick Add & User Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Ambient Multi-Atmosphere Soundscape Wheel Launcher */}
          <div className="hidden sm:block">
            <AmbientSoundDropdown />
          </div>

          {/* Circular Fitur Tambahan Button ("kek bulet tapi bgitu di klik keluar fitur tambahan nya") */}
          <div className="relative" ref={exploreRef}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setIsExploreOpen(!isExploreOpen)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-2xs relative ${
                isExploreActive || isExploreOpen
                  ? "bg-[#FAF5F0] border-[#CFA6A3] text-[#302B29] shadow-xs ring-2 ring-[#CFA6A3]/25"
                  : "bg-white border-[#E9E1DB] text-[#78655F] hover:border-[#CFA6A3] hover:text-[#302B29] hover:bg-[#FAF8F5]"
              }`}
              title="Fitur Tambahan (Kalender, Timeline, Bucket List)"
              aria-label="Fitur Tambahan"
            >
              <LayoutGrid className="w-4 h-4 text-[#CFA6A3]" />
              {isExploreActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#CFA6A3] ring-2 ring-white" />
              )}
            </motion.button>

            {/* Fitur Tambahan Popover with Silky Spring */}
            <AnimatePresence>
              {isExploreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 28,
                    mass: 0.6,
                  }}
                  className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2.5 w-68 bg-white/95 backdrop-blur-xl border border-[#E9E1DB] rounded-3xl shadow-2xl p-2.5 z-50 overflow-hidden"
                >
                  <div className="px-3.5 py-2 border-b border-[#E9E1DB]/60 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-[#8D817B]">
                        Fitur Tambahan
                      </p>
                      <p className="font-editorial-heading font-medium text-[#302B29] text-xs">
                        Ruang Eksplorasi Bersama
                      </p>
                    </div>
                    <span className="text-[10px] bg-[#FAF5F0] text-[#B88582] border border-[#E9E1DB] px-2 py-0.5 rounded-full font-mono">
                      {exploreLinks.length} Fitur
                    </span>
                  </div>

                  <div className="space-y-1 pt-1.5">
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
                          className={`group flex items-start gap-3 p-2.5 rounded-2xl transition-all duration-200 ${
                            isActive
                              ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                              : "hover:bg-[#FAF8F5] text-[#78655F] hover:translate-x-1"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E9E1DB] flex items-center justify-center shrink-0 mt-0.5 text-[#CFA6A3] group-hover:scale-108 group-hover:bg-white transition-all shadow-2xs">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-editorial-heading text-xs font-medium text-[#302B29] whitespace-nowrap">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-[#8D817B] font-editorial-body line-clamp-1">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Add Button with Smooth Spring Hover & Rotating Icon */}
          <motion.div
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03, y: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              href="/diary/new"
              className="group flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#CFA6A3] to-[#B88582] hover:from-[#B88582] hover:to-[#A77370] text-white rounded-full text-xs sm:text-sm font-editorial-body font-medium transition-all duration-300 shadow-sm shadow-[#CFA6A3]/30 hover:shadow-md hover:shadow-[#CFA6A3]/45 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300 ease-out" />
              <span>Cerita Baru</span>
            </Link>
          </motion.div>

          {/* User Profile Pill with Smooth Spring Hover */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02, y: -0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E9E1DB] rounded-full hover:border-[#CFA6A3] hover:shadow-sm transition-all duration-200 text-xs text-[#302B29] shadow-2xs whitespace-nowrap cursor-pointer"
              title="Profil Akun (Aufa & Anathia)"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#CFA6A3] to-[#F1EBE4] flex items-center justify-center text-[#78655F] text-xs font-bold shadow-inner group-hover:scale-105 transition-transform">
                {user?.nickname?.charAt(0) || "A"}
              </div>
              <span className="font-editorial-body font-medium">
                {user?.nickname || "Aufa"}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[#8D817B] transition-transform duration-300 ease-out ${
                  isUserMenuOpen ? "rotate-180 text-[#302B29]" : ""
                }`}
              />
            </motion.button>

            {/* Dropdown Menu with Silky Spring */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 28,
                    mass: 0.6,
                  }}
                  className="absolute right-0 mt-2.5 w-68 bg-white/95 backdrop-blur-xl border border-[#E9E1DB] rounded-3xl shadow-2xl py-2.5 z-50 text-xs sm:text-sm overflow-hidden"
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

                  {/* Logged in User Card */}
                  <div className="p-3 bg-[#FAF8F5] border-b border-[#E9E1DB]/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#CFA6A3] to-[#F1EBE4] flex items-center justify-center text-[#78655F] text-xs font-bold border border-white shadow-2xs">
                        {user?.nickname?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-editorial-heading font-medium text-[#302B29] text-xs truncate">
                          {user?.nickname || user?.full_name || "Kamu"}
                        </p>
                        <p className="text-[10px] text-[#8D817B] font-mono">
                          {user?.email || "Akun Sedang Login"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full font-mono">
                      Aktif
                    </span>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#302B29] hover:bg-[#F1EBE4] transition-all duration-200 text-left cursor-pointer font-medium hover:translate-x-1"
                    >
                      <User className="w-3.5 h-3.5 text-[#CFA6A3]" />
                      <span>Atur Profil Saya 👤</span>
                    </button>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#78655F] hover:bg-[#FAF8F5] transition-all duration-200 hover:translate-x-1"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#CFA6A3]" />
                      <span>Pengaturan Ruang ⚙️</span>
                    </Link>

                    <div className="border-t border-[#E9E1DB]/60 my-1 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-all duration-200 text-left cursor-pointer hover:translate-x-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar / Ganti Akun 🚪</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Editor Modal */}
          <ProfileEditorModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />


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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="lg:hidden border-b border-[#E9E1DB] bg-white px-4 pt-3 pb-6 shadow-lg space-y-3 overflow-hidden"
          >
            {/* Mobile Soundscape Dropdown */}
            <div className="w-full flex justify-center py-1">
              <AmbientSoundDropdown />
            </div>

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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
