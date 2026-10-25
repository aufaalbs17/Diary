"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Plus,
  Image as ImageIcon,
  Mail,
} from "lucide-react";
import { motion } from "motion/react";

export function MobileNav() {
  const pathname = usePathname();

  if (pathname === "/welcome" || pathname === "/login" || pathname.startsWith("/auth")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Beranda", icon: Sparkles },
    { href: "/diary", label: "Jurnal", icon: BookOpen },
    { href: "/diary/new", label: "Tambah", icon: Plus, isAction: true },
    { href: "/gallery", label: "Galeri", icon: ImageIcon },
    { href: "/notes", label: "Surat", icon: Mail },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E9E1DB] pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-lg shadow-black/5">
      <div className="flex items-center justify-around h-15 sm:h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.isAction) {
            return (
              <motion.div
                key={item.href}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  href={item.href}
                  className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-[#CFA6A3] to-[#B88582] text-white flex items-center justify-center shadow-lg shadow-[#CFA6A3]/50"
                  aria-label="Tulis Cerita Baru"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </Link>
              </motion.div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 w-14 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? "text-[#302B29] font-medium"
                  : "text-[#8D817B] hover:text-[#302B29]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-1 w-8 h-1 bg-[#CFA6A3] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#CFA6A3]" : ""}`} />
              </motion.div>
              <span className="text-[10px] font-editorial-body">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
