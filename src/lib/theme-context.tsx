"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CoverPhotoConfig {
  imageUrl: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeEmoji: string;
}

export interface WallpaperTheme {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  bgColor: string;
  textColor: string;
  roseColor: string;
  borderColor: string;
  surfaceColor: string;
  headerBg: string;
  isDark?: boolean;
}

export const THEME_PRESETS: WallpaperTheme[] = [
  {
    id: "warm-cream",
    name: "Scrapbook Krem Hangat",
    emoji: "📜",
    desc: "Warna krem linen klasik, lembut dan estetik alami.",
    bgColor: "#FAF8F5",
    textColor: "#302B29",
    roseColor: "#CFA6A3",
    borderColor: "#E9E1DB",
    surfaceColor: "#FFFFFF",
    headerBg: "rgba(250, 248, 245, 0.88)",
    isDark: false,
  },
  {
    id: "rose-romance",
    name: "Rosé Romance Blush",
    emoji: "🌸",
    desc: "Nuansa merah muda pastel manis & romantis.",
    bgColor: "#FDF5F5",
    textColor: "#3A2628",
    roseColor: "#D98A84",
    borderColor: "#F3D8D7",
    surfaceColor: "#FFFFFF",
    headerBg: "rgba(253, 245, 245, 0.88)",
    isDark: false,
  },
  {
    id: "matcha-sage",
    name: "Matcha Sage Mist",
    emoji: "🍵",
    desc: "Nuansa hijau sage sejuk, damai, dan menenangkan.",
    bgColor: "#F4F7F2",
    textColor: "#283327",
    roseColor: "#9BB095",
    borderColor: "#DCE5D8",
    surfaceColor: "#FFFFFF",
    headerBg: "rgba(244, 247, 242, 0.88)",
    isDark: false,
  },
  {
    id: "lavender-cloud",
    name: "Lavender Twilight",
    emoji: "💜",
    desc: "Sentuhan ungu pastel lembut yang manis & dreamy.",
    bgColor: "#F7F5FA",
    textColor: "#2F2939",
    roseColor: "#B5A1C8",
    borderColor: "#E4DFEC",
    surfaceColor: "#FFFFFF",
    headerBg: "rgba(247, 245, 250, 0.88)",
    isDark: false,
  },
  {
    id: "midnight-stars",
    name: "Midnight Romance",
    emoji: "🌙",
    desc: "Mode malam temaram berdua dengan bintang malam.",
    bgColor: "#1E1A22",
    textColor: "#F4EEF8",
    roseColor: "#D4A3A8",
    borderColor: "#3D3445",
    surfaceColor: "#27222C",
    headerBg: "rgba(30, 26, 34, 0.88)",
    isDark: true,
  },
];

export const COVER_PRESETS: {
  id: string;
  name: string;
  config: CoverPhotoConfig;
}[] = [
  {
    id: "uniqlo-date",
    name: "Mirror Selfie Uniqlo 🛍️",
    config: {
      imageUrl: "/images/uniqlo-date.jpg",
      title: "Aufa & Anathia 🤍",
      subtitle: "24 OKTOBER 2026 • MATCHING OUTFIT",
      badge: "Uniqlo Date",
      badgeEmoji: "🛍️",
    },
  },
  {
    id: "cafe-morning",
    name: "Sudut Kafe Pagi ☕",
    config: {
      imageUrl: "/images/hero.jpg",
      title: "Aufa & Anathia 🤍",
      subtitle: "18 OKTOBER 2026 • KAFE DAUN TEDUH",
      badge: "Kafe Pagi",
      badgeEmoji: "☕",
    },
  },
  {
    id: "picnic",
    name: "Piknik Berdua 🧺",
    config: {
      imageUrl: "/images/picnic.jpg",
      title: "Aufa & Anathia 🤍",
      subtitle: "02 OKTOBER 2026 • TAMAN KOTA",
      badge: "Piknik Santai",
      badgeEmoji: "🧺",
    },
  },
  {
    id: "beach-sunset",
    name: "Pantai Senja 🏖️",
    config: {
      imageUrl: "/images/beach.jpg",
      title: "Aufa & Anathia 🤍",
      subtitle: "25 SEPTEMBER 2026 • PANTAI INDAH",
      badge: "Pantai Senja",
      badgeEmoji: "🏖️",
    },
  },
  {
    id: "bookstore",
    name: "Toko Buku Kecil 📖",
    config: {
      imageUrl: "/images/bookstore.jpg",
      title: "Aufa & Anathia 🤍",
      subtitle: "14 SEPTEMBER 2026 • TOKO BUKU KECIL",
      badge: "Buku & Cerita",
      badgeEmoji: "📖",
    },
  },
  {
    id: "walk",
    name: "Jalan di Hutan 🌲",
    config: {
      imageUrl: "/images/walk.jpg",
      title: "Aufa & Anathia 🤍",
      subtitle: "10 OKTOBER 2026 • JALAN SETAPAK",
      badge: "Jalan Santai",
      badgeEmoji: "🌲",
    },
  },
];

const DEFAULT_COVER: CoverPhotoConfig = COVER_PRESETS[0].config;

interface ThemeSettingsState {
  themeId: string;
  customWallpaperUrl: string | null;
  wallpaperPattern: "none" | "grain" | "hearts" | "dots";
  coverPhoto: CoverPhotoConfig;
}

const STORAGE_KEY = "olm_theme_settings_v3";

interface ThemeContextType {
  currentTheme: WallpaperTheme;
  coverPhoto: CoverPhotoConfig;
  customWallpaperUrl: string | null;
  wallpaperPattern: "none" | "grain" | "hearts" | "dots";
  setThemeId: (id: string) => void;
  setCustomWallpaperUrl: (url: string | null) => void;
  setWallpaperPattern: (pattern: "none" | "grain" | "hearts" | "dots") => void;
  updateCoverPhoto: (config: Partial<CoverPhotoConfig>) => void;
  resetAll: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettingsState>(() => {
    if (typeof window === "undefined") {
      return {
        themeId: "warm-cream",
        customWallpaperUrl: null,
        wallpaperPattern: "none",
        coverPhoto: DEFAULT_COVER,
      };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading theme settings:", e);
    }
    return {
      themeId: "warm-cream",
      customWallpaperUrl: null,
      wallpaperPattern: "none",
      coverPhoto: DEFAULT_COVER,
    };
  });

  const currentTheme =
    THEME_PRESETS.find((t) => t.id === settings.themeId) || THEME_PRESETS[0];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving theme settings:", e);
    }

    // Apply CSS variables & body background smoothly
    const root = document.documentElement;
    root.style.setProperty("--bg-color", currentTheme.bgColor);
    root.style.setProperty("--surface-color", currentTheme.surfaceColor);
    root.style.setProperty("--rose-color", currentTheme.roseColor);
    root.style.setProperty("--border-color", currentTheme.borderColor);
    root.style.setProperty("--text-primary", currentTheme.textColor);

    document.body.style.backgroundColor = currentTheme.bgColor;
    document.body.style.color = currentTheme.textColor;

    if (settings.customWallpaperUrl) {
      document.body.style.backgroundImage = `url(${settings.customWallpaperUrl})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.body.style.backgroundImage = "none";
    }
  }, [settings, currentTheme]);

  const setThemeId = (themeId: string) => {
    setSettings((prev) => ({ ...prev, themeId }));
  };

  const setCustomWallpaperUrl = (customWallpaperUrl: string | null) => {
    setSettings((prev) => ({ ...prev, customWallpaperUrl }));
  };

  const setWallpaperPattern = (
    wallpaperPattern: "none" | "grain" | "hearts" | "dots"
  ) => {
    setSettings((prev) => ({ ...prev, wallpaperPattern }));
  };

  const updateCoverPhoto = (partial: Partial<CoverPhotoConfig>) => {
    setSettings((prev) => ({
      ...prev,
      coverPhoto: {
        ...prev.coverPhoto,
        ...partial,
      },
    }));
  };

  const resetAll = () => {
    setSettings({
      themeId: "warm-cream",
      customWallpaperUrl: null,
      wallpaperPattern: "none",
      coverPhoto: DEFAULT_COVER,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        coverPhoto: settings.coverPhoto,
        customWallpaperUrl: settings.customWallpaperUrl,
        wallpaperPattern: settings.wallpaperPattern,
        setThemeId,
        setCustomWallpaperUrl,
        setWallpaperPattern,
        updateCoverPhoto,
        resetAll,
      }}
    >
      {/* Optional pattern overlay (Compositor GPU isolated) */}
      {settings.wallpaperPattern === "hearts" && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-20 select-none overflow-hidden"
          style={{ contain: "strict", willChange: "transform" }}
        >
          <div className="absolute top-10 left-10 text-3xl animate-gentle-float gpu-accelerated">💖</div>
          <div className="absolute top-1/3 right-12 text-2xl animate-gentle-float delay-100 gpu-accelerated">🤍</div>
          <div className="absolute bottom-20 left-1/4 text-2xl animate-gentle-float delay-200 gpu-accelerated">🌸</div>
          <div className="absolute top-2/3 right-1/4 text-xl animate-gentle-float delay-300 gpu-accelerated">✨</div>
        </div>
      )}

      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
