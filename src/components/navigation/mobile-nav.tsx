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

export function MobileNav() {
  const pathname = usePathname();

  if (pathname === "/welcome" || pathname.startsWith("/auth")) {
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E9E1DB] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4 w-12 h-12 rounded-full bg-[#CFA6A3] hover:bg-[#B88582] text-white flex items-center justify-center shadow-lg shadow-[#CFA6A3]/50 transition-transform active:scale-90"
                aria-label="Tulis Cerita Baru"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-14 py-1 rounded-xl transition-colors ${
                isActive
                  ? "text-[#CFA6A3] font-medium"
                  : "text-[#8D817B] hover:text-[#302B29]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-editorial-body">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
