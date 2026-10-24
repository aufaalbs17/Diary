"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  MapPin,
  Heart,
  ExternalLink,
  Sparkles,
  Music,
  List,
  Shuffle,
  Volume2,
  VolumeX,
  Bookmark,
  X,
  Disc3,
  Quote,
} from "lucide-react";
import { Memory, MOODS } from "@/lib/types";
import { getMemories, toggleFavorite } from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toggleAmbientSound, isAmbientPlaying } from "@/lib/ambient-sound";
import { useToast } from "@/components/ui/toast-provider";

// Paper rustle sound synthesis using Web Audio API
function playPageFlipSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioContextClass();
    const duration = 0.16;
    const buffer = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * duration),
      ctx.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const progress = i / data.length;
      const decay = Math.exp(-progress * 6);
      data[i] = (Math.random() * 2 - 1) * decay * 0.12;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(650, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      280,
      ctx.currentTime + duration
    );
    filter.Q.value = 1.0;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export default function BookViewPage() {
  const { success } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isPageFlipping, setIsPageFlipping] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getMemories({ sortBy: "oldest" });
      setMemories(data);
      setIsLoading(false);
    }
    load();
    setIsPlayingMusic(isAmbientPlaying());
  }, []);

  const totalPages = memories.length;
  const currentMemory = memories[currentPageIndex] || null;

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      playPageFlipSound();
      setIsPageFlipping(true);
      setTimeout(() => setIsPageFlipping(false), 250);
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPageIndex < totalPages - 1) {
      playPageFlipSound();
      setIsPageFlipping(true);
      setTimeout(() => setIsPageFlipping(false), 250);
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handleRandomPage = () => {
    if (totalPages <= 1) return;
    let nextIndex = Math.floor(Math.random() * totalPages);
    while (nextIndex === currentPageIndex && totalPages > 1) {
      nextIndex = Math.floor(Math.random() * totalPages);
    }
    playPageFlipSound();
    setIsPageFlipping(true);
    setTimeout(() => setIsPageFlipping(false), 250);
    setCurrentPageIndex(nextIndex);
  };

  const handleToggleBookmark = async () => {
    if (!currentMemory) return;
    const updated = await toggleFavorite(currentMemory.id);
    if (updated) {
      setMemories((prev) =>
        prev.map((m) =>
          m.id === currentMemory.id
            ? { ...m, is_favorite: updated.is_favorite }
            : m
        )
      );
      if (updated.is_favorite) {
        success("Halaman ini telah ditandai dengan pita favorit 🤍");
      }
    }
  };

  const handleToggleSound = () => {
    const nextState = toggleAmbientSound((playing) =>
      setIsPlayingMusic(playing)
    );
    setIsPlayingMusic(nextState);
  };

  const formatDateIndo = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEEE, d MMMM yyyy", { locale: id });
    } catch {
      return dateStr;
    }
  };

  // Extract first letter for classical Drop Cap
  const dropCapLetter = currentMemory?.story
    ? currentMemory.story.trim().charAt(0)
    : "";
  const remainingStory = currentMemory?.story
    ? currentMemory.story.trim().slice(1)
    : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Header & Luxury Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EBE4] border border-[#E9E1DB] text-[#78655F] text-xs font-editorial-body mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#CFA6A3]" />
            <span>Buku Harian Scrapbook Fisik</span>
          </div>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight">
            Book View 📖
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-1.5 max-w-xl">
            Buka lembaran kenangan Aufa &amp; Anathia layaknya memegang buku jurnal
            fisik bersampul kulit hangat dan bersudut kertas antik.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ambient Cafe/Rain sound button */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-editorial-body transition-all border ${
              isPlayingMusic
                ? "bg-[#CFA6A3] text-white border-[#B88582] shadow-xs"
                : "bg-white text-[#78655F] border-[#E9E1DB] hover:border-[#CFA6A3]"
            }`}
            title="Putar Suasana Hujan & Kafe Tenang"
          >
            {isPlayingMusic ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isPlayingMusic ? "Suasana Menyala" : "Suasana Hujan"}
            </span>
          </button>

          {/* Table of Contents Button */}
          <button
            onClick={() => setIsTocOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F] hover:text-[#302B29] hover:border-[#CFA6A3] transition-all shadow-2xs"
            title="Buka Daftar Isi Kenangan"
          >
            <List className="w-3.5 h-3.5 text-[#CFA6A3]" />
            <span>Daftar Isi</span>
          </button>

          {/* Random Page Button */}
          <button
            onClick={handleRandomPage}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F] hover:text-[#302B29] hover:border-[#CFA6A3] transition-all shadow-2xs"
            title="Buka Halaman Acak"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#CFA6A3]" />
            <span className="hidden sm:inline">Halaman Acak</span>
          </button>

          {/* Page Turn Navigator */}
          <div className="flex items-center gap-2 bg-white border border-[#E9E1DB] rounded-full p-1 shadow-2xs">
            <button
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#78655F] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Lembar Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-medium text-[#302B29] whitespace-nowrap">
              {currentPageIndex + 1} / {totalPages || 1}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPageIndex >= totalPages - 1}
              className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#78655F] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Lembar Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-32 text-center text-xs text-[#8D817B] space-y-3">
          <BookOpen className="w-8 h-8 text-[#CFA6A3] mx-auto animate-pulse" />
          <p>Membuka lembaran buku kenangan Aufa &amp; Anathia...</p>
        </div>
      ) : !currentMemory ? (
        <div className="text-center py-24 bg-white border border-[#E9E1DB] rounded-3xl p-8 max-w-md mx-auto space-y-4">
          <BookOpen className="w-10 h-10 text-[#CFA6A3] mx-auto" />
          <h3 className="font-editorial-heading text-xl text-[#302B29]">
            Belum Ada Halaman Cerita
          </h3>
          <p className="font-editorial-body text-xs text-[#8D817B] leading-relaxed">
            Tuliskan kenangan pertamamu di Our Diary untuk melihatnya dirangkai
            menjadi lembaran buku harian yang indah.
          </p>
          <Link
            href="/diary/new"
            className="inline-block px-5 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs font-editorial-body transition-colors shadow-sm"
          >
            + Tulis Cerita Baru
          </Link>
        </div>
      ) : (
        /* 2. Physical Open Hardcover Leather Journal Container */
        <div className="relative mx-auto my-4">
          {/* Outer Leather Hardcover Casing */}
          <div className="relative p-2.5 sm:p-4 md:p-5 lg:p-6 bg-gradient-to-tr from-[#312622] via-[#453731] to-[#362B26] rounded-[2.2rem] sm:rounded-[3rem] shadow-[0_30px_70px_-15px_rgba(40,25,18,0.45)] border-2 border-[#D9BA8F]/30">
            {/* Fine Gold-Foil Debossed Frame on the Cover Lip */}
            <div className="absolute inset-1.5 sm:inset-2.5 border border-[#D9BA8F]/25 rounded-[2rem] sm:rounded-[2.7rem] pointer-events-none" />

            {/* Stacked Paper Page Edges (Visible on left & right sides) */}
            <div className="relative rounded-[1.8rem] sm:rounded-[2.4rem] overflow-hidden bg-[#F8F4EC] shadow-2xl">
              {/* Stacked Pages Depth Illusion (Left & Right multi-page lines) */}
              <div
                className="hidden lg:block absolute left-0 top-0 bottom-0 w-3 z-30 pointer-events-none opacity-80"
                style={{
                  background:
                    "repeating-linear-gradient(to right, #EDE5DA 0px, #EDE5DA 1px, #DFD4C5 1px, #DFD4C5 2px)",
                  boxShadow: "inset -2px 0 5px rgba(0,0,0,0.1)",
                }}
              />
              <div
                className="hidden lg:block absolute right-0 top-0 bottom-0 w-3 z-30 pointer-events-none opacity-80"
                style={{
                  background:
                    "repeating-linear-gradient(to left, #EDE5DA 0px, #EDE5DA 1px, #DFD4C5 1px, #DFD4C5 2px)",
                  boxShadow: "inset 2px 0 5px rgba(0,0,0,0.1)",
                }}
              />

              {/* Realistic Satin Bookmark Ribbon (Draped from center spine) */}
              <div
                onClick={handleToggleBookmark}
                title={
                  currentMemory.is_favorite
                    ? "Halaman ini ditandai pita favorit (Klik untuk lepas)"
                    : "Klik pita untuk menandai halaman favorit"
                }
                className="cursor-pointer group absolute -top-1 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center transition-transform hover:scale-105 active:scale-95"
              >
                {/* Ribbon top anchor */}
                <div className="w-7 h-3 bg-[#8A5A57] rounded-b-xs shadow-md" />
                {/* Ribbon body */}
                <div
                  className={`w-6 h-28 sm:h-36 transition-all duration-300 relative shadow-lg ${
                    currentMemory.is_favorite
                      ? "bg-gradient-to-b from-[#CFA6A3] via-[#B88582] to-[#A36C69] shadow-[#8A5A57]/40"
                      : "bg-gradient-to-b from-[#E2D5CC] via-[#C9B9AD] to-[#B3A094] opacity-75 group-hover:opacity-100"
                  }`}
                  style={{
                    filter: "drop-shadow(2px 5px 6px rgba(0,0,0,0.25))",
                  }}
                >
                  {/* Subtle silk woven texture stripe */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 bg-white/20" />

                  {/* Bookmark Gold Heart Charm */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
                        currentMemory.is_favorite
                          ? "fill-[#FFFDF8] text-[#FFFDF8]"
                          : "text-white/80 group-hover:fill-white"
                      }`}
                    />
                  </div>

                  {/* V-cut swallowtail ribbon notch */}
                  <div
                    className="absolute -bottom-3 left-0 right-0 h-3"
                    style={{
                      background: "inherit",
                      clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                    }}
                  />
                </div>
              </div>

              {/* Center Spine Crease & Shadow Gutter (Desktop only) */}
              <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-16 pointer-events-none z-20">
                {/* Deep gutter shadow */}
                <div className="w-full h-full bg-gradient-to-r from-black/15 via-black/4 to-black/15" />
                {/* Center spine thread stitch marks */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-1 border-t-2 border-[#C5A059]/50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-4 h-1 border-t-2 border-[#C5A059]/50" />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-1 border-t-2 border-[#C5A059]/50" />
              </div>

              {/* Two-Page Spread Grid */}
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 min-h-[640px] transition-opacity duration-200 ${
                  isPageFlipping ? "opacity-40" : "opacity-100"
                }`}
              >
                {/* ========================================================= */}
                {/* LEFT PAGE: Scrapbook Artifacts, Polaroid, Stamps, Postal  */}
                {/* ========================================================= */}
                <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E8DFC8]/70 bg-[#FCFAF6] relative">
                  {/* Subtle page curvature gradient towards spine */}
                  <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-r from-transparent to-black/5 pointer-events-none" />

                  <div className="space-y-6">
                    {/* Top Header: Vintage Journal Stamp & Date */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DF]">
                      <div className="flex items-center gap-2">
                        <span className="font-editorial-heading text-xs tracking-wider text-[#78655F] uppercase">
                          Lembar Kenangan
                        </span>
                        <span className="text-[#CFA6A3]">•</span>
                        <span className="font-mono text-[11px] text-[#8D817B]">
                          No. {currentPageIndex + 1}
                        </span>
                      </div>

                      {/* Mood Wax Stamp Accent */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#E8DEC0] shadow-2xs">
                        <span className="text-sm">
                          {MOODS[currentMemory.mood]?.emoji || "🤍"}
                        </span>
                        <span className="text-[11px] font-editorial-body text-[#78655F] font-medium">
                          {MOODS[currentMemory.mood]?.label || "Momen Indah"}
                        </span>
                      </div>
                    </div>

                    {/* Scrapbook Polaroid Photo Frame */}
                    <div className="relative pt-3 pb-2 flex justify-center">
                      <div className="relative w-full max-w-md bg-[#FFFDF9] border border-[#EBE3D7] rounded-xs p-3.5 pb-10 sm:p-4 sm:pb-12 shadow-xl shadow-[#78655F]/15 transform -rotate-1 hover:rotate-0 transition-transform duration-500 group">
                        {/* Washi Tape across top border */}
                        <div
                          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#CFA6A3]/45 border border-white/60 backdrop-blur-xs transform -rotate-1 z-20 shadow-xs pointer-events-none"
                          style={{
                            background:
                              "repeating-linear-gradient(45deg, rgba(207,166,163,0.5) 0px, rgba(207,166,163,0.5) 8px, rgba(241,235,228,0.5) 8px, rgba(241,235,228,0.5) 16px)",
                          }}
                        />

                        {/* Photo Image container */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xs bg-[#F4EFEA] border border-[#EBE3D7]">
                          <Image
                            src={
                              currentMemory.cover_image_url || "/images/hero.jpg"
                            }
                            alt={currentMemory.title}
                            fill
                            className="object-cover group-hover:scale-103 transition-transform duration-700"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                          />

                          {/* Subtle photo film gloss overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
                        </div>

                        {/* Handwritten Polaroid Caption */}
                        <div className="pt-3 px-1 text-center space-y-1">
                          <p className="font-editorial-quote text-base sm:text-lg text-[#302B29] italic leading-tight truncate">
                            &ldquo;
                            {currentMemory.media?.[0]?.caption ||
                              currentMemory.title}
                            &rdquo;
                          </p>
                          <p className="font-mono text-[10px] text-[#8D817B]">
                            {formatDateIndo(currentMemory.event_date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Artifacts: Location Pin & Postal Stamp Badge */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#78655F]">
                      {currentMemory.location_name ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EE] border border-[#EAE0D2]">
                          <MapPin className="w-3.5 h-3.5 text-[#CFA6A3]" />
                          <span className="font-editorial-body italic text-[11px] truncate max-w-[200px]">
                            {currentMemory.location_name}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}

                      {/* Vintage Postmark Ring Stamp */}
                      <div className="border-2 border-dashed border-[#CFA6A3]/60 rounded-full px-3 py-1 text-[9px] font-mono tracking-widest text-[#B88582] uppercase transform rotate-2">
                        POST • AUFA &amp; ANATHIA
                      </div>
                    </div>
                  </div>

                  {/* Left Page Footer & Dog-Ear Flip Corner */}
                  <div className="pt-8 border-t border-[#EFE8DF] flex items-center justify-between text-xs text-[#8D817B] relative">
                    <span className="font-editorial-quote italic text-sm text-[#78655F]">
                      Our Little Moments
                    </span>

                    <span className="font-mono text-[11px] tracking-wider">
                      Hal. {currentPageIndex * 2 + 1}
                    </span>

                    {/* Interactive Dog-Ear: Flip to previous page */}
                    {currentPageIndex > 0 && (
                      <button
                        onClick={handlePrev}
                        title="Klik untuk membalik ke lembar sebelumnya"
                        className="group absolute -bottom-6 -left-6 w-12 h-12 flex items-end justify-start p-1.5 transition-all"
                      >
                        <div className="w-0 h-0 border-solid border-t-[20px] border-l-[20px] border-t-transparent border-l-[#CFA6A3]/70 group-hover:border-l-[#B88582] group-hover:scale-110 transition-transform shadow-sm" />
                      </button>
                    )}
                  </div>
                </div>

                {/* ========================================================= */}
                {/* RIGHT PAGE: Editorial Title, Illuminated Story, Marginalia */}
                {/* ========================================================= */}
                <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-[#FDFCF9] relative">
                  {/* Subtle page curvature gradient near spine */}
                  <div className="hidden lg:block absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />

                  <div className="space-y-6">
                    {/* Top Right: Tag Pills & Date Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DF]">
                      <div className="flex items-center gap-1.5 text-xs text-[#8D817B] font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
                        <span>{formatDateIndo(currentMemory.event_date)}</span>
                      </div>

                      {/* Tag pill */}
                      {currentMemory.tags && currentMemory.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-editorial-body px-2.5 py-0.5 rounded-full bg-[#FAF5EE] border border-[#E8DEC0] text-[#78655F]">
                            #{currentMemory.tags[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Story Title with Filigree Flourish */}
                    <div className="space-y-2">
                      <h2 className="font-editorial-heading text-2xl sm:text-4xl font-normal text-[#302B29] leading-snug tracking-tight">
                        {currentMemory.title}
                      </h2>
                      <div className="text-[#CFA6A3]/70 text-xs tracking-widest font-mono">
                        ✦ • ────── ୨♡୧ ────── • ✦
                      </div>
                    </div>

                    {/* Story Narrative with Classic Illuminated Drop Cap */}
                    <div className="prose prose-stone max-w-none">
                      <p className="font-editorial-body text-sm sm:text-base text-[#3B3431] leading-relaxed sm:leading-loose whitespace-pre-line text-justify">
                        {dropCapLetter && (
                          <span className="font-editorial-heading float-left text-4xl sm:text-5xl font-serif text-[#B88582] mr-3 mt-1 leading-none drop-shadow-2xs select-none">
                            {dropCapLetter}
                          </span>
                        )}
                        {remainingStory}
                      </p>
                    </div>

                    {/* Spotify Soundtrack Mini Tape (if attached) */}
                    {currentMemory.spotify_url && (
                      <a
                        href={currentMemory.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5EE] border border-[#E8DEC0] text-xs font-editorial-body text-[#78655F] hover:text-[#302B29] hover:border-[#CFA6A3] transition-colors group shadow-2xs"
                      >
                        <Disc3 className="w-3.5 h-3.5 text-[#CFA6A3] group-hover:rotate-180 transition-transform duration-700" />
                        <span>Putar Lagu Kenangan Ini 🎵</span>
                        <ExternalLink className="w-3 h-3 text-[#8D817B]" />
                      </a>
                    )}

                    {/* Dual-Perspective Marginalia ("Catatan Pinggir" Scrapbook Sticky) */}
                    {currentMemory.notes && currentMemory.notes.length > 0 && (
                      <div className="relative mt-4 bg-[#FAF6EE] p-4 sm:p-5 rounded-2xl border border-[#E6DCC8] shadow-xs space-y-2.5">
                        {/* Washi Tape on the top right corner of sticky note */}
                        <div className="absolute -top-2.5 right-6 w-14 h-4 bg-[#D9CFC2]/70 backdrop-blur-xs transform rotate-2 z-10 pointer-events-none border border-white/50" />

                        <div className="flex items-center gap-2 text-xs font-medium text-[#78655F]">
                          <Quote className="w-3.5 h-3.5 text-[#CFA6A3]" />
                          <span className="font-editorial-heading uppercase tracking-wider text-[11px]">
                            Catatan Pinggir Kita
                          </span>
                        </div>

                        <div className="space-y-2">
                          {currentMemory.notes.map((n) => (
                            <div key={n.id} className="text-xs space-y-0.5">
                              <p className="font-editorial-quote text-sm text-[#302B29] italic leading-relaxed">
                                &ldquo;{n.note}&rdquo;
                              </p>
                              <p className="text-[10px] text-[#8D817B] text-right font-editorial-body font-medium">
                                — {n.author_name} ♡
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Page Footer & Dog-Ear Flip Corner */}
                  <div className="pt-8 border-t border-[#EFE8DF] flex items-center justify-between text-xs text-[#8D817B] relative">
                    <Link
                      href={`/diary/${currentMemory.id}`}
                      className="text-[#CFA6A3] hover:text-[#B88582] flex items-center gap-1 font-medium font-editorial-body transition-colors group"
                    >
                      <span>Buka di Jurnal Lengkap</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <span className="font-mono text-[11px] tracking-wider">
                      Hal. {currentPageIndex * 2 + 2}
                    </span>

                    {/* Interactive Dog-Ear: Flip to next page */}
                    {currentPageIndex < totalPages - 1 && (
                      <button
                        onClick={handleNext}
                        title="Klik untuk membalik ke lembar berikutnya"
                        className="group absolute -bottom-6 -right-6 w-12 h-12 flex items-end justify-end p-1.5 transition-all"
                      >
                        <div className="w-0 h-0 border-solid border-t-[20px] border-r-[20px] border-t-transparent border-r-[#CFA6A3]/70 group-hover:border-r-[#B88582] group-hover:scale-110 transition-transform shadow-sm" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Table of Contents Drawer / Modal ("Daftar Isi Kenangan") */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E1DB]">
              <div>
                <h3 className="font-editorial-heading text-xl sm:text-2xl text-[#302B29]">
                  Daftar Isi Jurnal Kenangan 📖
                </h3>
                <p className="text-xs text-[#8D817B] mt-1 font-editorial-body">
                  Pilih lembaran cerita untuk langsung membuka halamannya di buku.
                </p>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="p-1.5 text-[#8D817B] hover:text-[#302B29] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Book Chapters/Pages */}
            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {memories.map((mem, idx) => {
                const isCurrent = idx === currentPageIndex;
                return (
                  <button
                    key={mem.id}
                    onClick={() => {
                      playPageFlipSound();
                      setCurrentPageIndex(idx);
                      setIsTocOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl border text-left transition-all ${
                      isCurrent
                        ? "bg-[#F1EBE4] border-[#CFA6A3] shadow-xs"
                        : "bg-white border-[#E9E1DB] hover:border-[#CFA6A3] hover:bg-white"
                    }`}
                  >
                    {/* Chapter Number Badge */}
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E9E1DB] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] uppercase font-mono text-[#8D817B]">
                        Hal
                      </span>
                      <span className="text-xs font-bold text-[#302B29]">
                        {idx * 2 + 1}
                      </span>
                    </div>

                    {/* Thumbnail preview */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#E9E1DB]">
                      <Image
                        src={mem.cover_image_url || "/images/hero.jpg"}
                        alt={mem.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    {/* Chapter info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-editorial-heading text-sm font-medium text-[#302B29] truncate">
                        {mem.title}
                      </h4>
                      <p className="font-editorial-body text-[11px] text-[#8D817B] flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{formatDateIndo(mem.event_date)}</span>
                        {mem.location_name && (
                          <>
                            <span>•</span>
                            <span className="truncate">{mem.location_name}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Mood & Favorite */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {mem.is_favorite && (
                        <Heart className="w-3.5 h-3.5 text-[#CFA6A3] fill-[#CFA6A3]" />
                      )}
                      <span className="text-base">
                        {MOODS[mem.mood]?.emoji || "🤍"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#E9E1DB] text-center">
              <span className="text-xs text-[#8D817B] font-editorial-quote italic">
                Aufa &amp; Anathia&apos;s Diary • Total {totalPages} Cerita Kenangan
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
