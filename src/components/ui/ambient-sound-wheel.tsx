"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Volume2,
  Volume1,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Music,
  Check,
  Disc,
} from "lucide-react";
import {
  AMBIENT_TRACKS,
  AmbientTrackId,
  isAmbientPlaying,
  playAmbientTrack,
  playWheelTickSound,
  setAmbientVolume,
  stopAmbientSound,
  subscribeAmbientSound,
} from "@/lib/ambient-sound";

export interface WheelItem {
  id: AmbientTrackId | "mute";
  name: string;
  shortName: string;
  emoji: string;
  description: string;
  category: "Musik" | "Alam" | "Suasana" | "Kontrol";
  color: string;
}

const WHEEL_ITEMS: WheelItem[] = [
  {
    id: "piano",
    name: "Piano Romantis Berdua",
    shortName: "Piano",
    emoji: "🎹",
    description: "Melodi arpeggio piano pentatonic yang manis & menenangkan hati",
    category: "Musik",
    color: "#CFA6A3",
  },
  {
    id: "rain",
    name: "Hujan Rintik Tenang",
    shortName: "Hujan",
    emoji: "🌧️",
    description: "Rintik hujan lembut dan sejuk di jendela kamar",
    category: "Alam",
    color: "#9BB3C9",
  },
  {
    id: "music_box",
    name: "Kotak Musik Nostalgia",
    shortName: "Kotak Musik",
    emoji: "🎵",
    description: "Dentang kotak musik klasik penuh memori manis berdua",
    category: "Musik",
    color: "#E2B1B1",
  },
  {
    id: "cafe",
    name: "Kafe Hangat & Lofi",
    shortName: "Kafe Lofi",
    emoji: "☕",
    description: "Suasana kedai kopi santai dengan sentuhan vinyl hangat",
    category: "Suasana",
    color: "#C9A788",
  },
  {
    id: "waves",
    name: "Deburan Ombak Senja",
    shortName: "Ombak",
    emoji: "🌊",
    description: "Ritme ombak pantai yang damai saat matahari terbenam",
    category: "Alam",
    color: "#8FAFC4",
  },
  {
    id: "fireplace",
    name: "Api Unggun & Perapian",
    shortName: "Perapian",
    emoji: "🔥",
    description: "Percikan kayu hangat di malam hari yang syahdu",
    category: "Suasana",
    color: "#D99573",
  },
  {
    id: "night_forest",
    name: "Malam Hening & Jangkrik",
    shortName: "Malam",
    emoji: "🌌",
    description: "Semilir angin malam bertabur bintang yang sunyi",
    category: "Alam",
    color: "#9B95B8",
  },
  {
    id: "mute",
    name: "Hening (Matikan Suara)",
    shortName: "Hening",
    emoji: "🔇",
    description: "Jeda seluruh suara latar dan nikmati keheningan berdua",
    category: "Kontrol",
    color: "#A39792",
  },
];

interface AmbientSoundWheelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AmbientSoundWheel({ isOpen, onClose }: AmbientSoundWheelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<AmbientTrackId>("piano");
  const [volume, setVolume] = useState(0.6);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  const wheelRef = useRef<HTMLDivElement>(null);
  const prevHoveredIndexRef = useRef<number>(0);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateRect = useCallback(() => {
    if (wheelRef.current) {
      cachedRectRef.current = wheelRef.current.getBoundingClientRect();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateRect();
      window.addEventListener("resize", updateRect, { passive: true });
      return () => {
        window.removeEventListener("resize", updateRect);
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
    }
  }, [isOpen, updateRect]);

  useEffect(() => {
    const unsubscribe = subscribeAmbientSound((playing, trackId, vol) => {
      setIsPlaying(playing);
      setCurrentTrackId(trackId);
      setVolume(vol);

      // Default hovered index to active track
      const activeIdx = WHEEL_ITEMS.findIndex((it) => it.id === trackId);
      if (activeIdx !== -1 && !isPlaying) {
        setHoveredIndex(activeIdx);
      }
    });
    return () => unsubscribe();
  }, [isPlaying]);

  // Sync hoveredIndex to current playing on open
  useEffect(() => {
    if (isOpen) {
      if (!isPlaying) {
        setHoveredIndex(7); // default to mute if stopped
      } else {
        const idx = WHEEL_ITEMS.findIndex((it) => it.id === currentTrackId);
        if (idx !== -1) setHoveredIndex(idx);
      }
    }
  }, [isOpen, isPlaying, currentTrackId]);

  // Keyboard shortcut: ESC to close, M to toggle, Arrow keys to navigate
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "m" || e.key === "M") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setHoveredIndex((prev) => {
          const next = (prev + 1) % WHEEL_ITEMS.length;
          playWheelTickSound();
          return next;
        });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setHoveredIndex((prev) => {
          const next = (prev - 1 + WHEEL_ITEMS.length) % WHEEL_ITEMS.length;
          playWheelTickSound();
          return next;
        });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelectIndex(hoveredIndex);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hoveredIndex, onClose]);

  const handleSelectIndex = (index: number) => {
    const item = WHEEL_ITEMS[index];
    if (item.id === "mute") {
      stopAmbientSound();
    } else {
      playAmbientTrack(item.id);
    }
    playWheelTickSound();
  };

  const handleSliceHover = (index: number) => {
    if (index !== prevHoveredIndexRef.current) {
      prevHoveredIndexRef.current = index;
      setHoveredIndex(index);
      playWheelTickSound();
    }
  };

  // Mouse radial pointer tracking (RAF throttled for buttery smooth 60-120fps)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafIdRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      let rect = cachedRectRef.current;
      if (!rect && wheelRef.current) {
        rect = wheelRef.current.getBoundingClientRect();
        cachedRectRef.current = rect;
      }
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);

      // If cursor is within the radial ring active zone
      if (distance > 50 && distance < 260) {
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (angle < 0) angle += 360;

        const shifted = (angle + 90 + 22.5) % 360;
        const sliceIdx = Math.floor(shifted / 45);

        if (sliceIdx >= 0 && sliceIdx < WHEEL_ITEMS.length) {
          if (sliceIdx !== prevHoveredIndexRef.current) {
            prevHoveredIndexRef.current = sliceIdx;
            setHoveredIndex(sliceIdx);
            playWheelTickSound();
          }
        }
      }
    });
  }, []);

  if (!mounted) return null;

  const activeHoveredItem = WHEEL_ITEMS[hoveredIndex] || WHEEL_ITEMS[0];
  const isHoveredCurrent =
    activeHoveredItem.id === "mute"
      ? !isPlaying
      : isPlaying && currentTrackId === activeHoveredItem.id;

  // Geometry parameters for 8-slice donut wheel
  const size = 460;
  const center = size / 2;
  const outerR = 215;
  const innerR = 115;
  const gapDeg = 2.4; // separation between weapon wheel wedges

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
          {/* Dark Cinematic Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          />

          {/* Radial Ambient Glow */}
          <div
            className="fixed inset-0 pointer-events-none transition-colors duration-500 opacity-25"
            style={{
              background: `radial-gradient(circle at center, ${activeHoveredItem.color} 0%, transparent 65%)`,
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.88, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative z-10 flex flex-col items-center justify-center max-w-xl w-full"
            onMouseMove={handleMouseMove}
          >
            {/* Top Bar Header */}
            <div className="w-full flex items-center justify-between px-4 pb-3 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#CFA6A3]">
                  <Disc className="w-4 h-4 animate-spin [animation-duration:8s]" />
                </div>
                <div>
                  <h3 className="font-editorial-heading text-base sm:text-lg font-medium text-white tracking-wide flex items-center gap-2">
                    <span>Pilihan Musik Suasana</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#CFA6A3]/30 text-[#F8DEDC] border border-[#CFA6A3]/40">
                      8 Melodi
                    </span>
                  </h3>
                  <p className="text-[11px] text-white/60 font-editorial-body hidden sm:block">
                    Pilih alunan melodi latar untuk menemani membaca dan menulis kenangan manis
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The Interactive Radial Wheel */}
            <div
              ref={wheelRef}
              className="relative flex items-center justify-center my-1 sm:my-2"
              style={{ width: size, height: size, maxWidth: "90vw", maxHeight: "90vw" }}
            >
              {/* Outer Decorative Ring */}
              <div className="absolute inset-0 rounded-full border border-white/15 pointer-events-none scale-102" />
              <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none scale-106 border-dashed animate-[spin_60s_linear_infinite]" />

              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible drop-shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
              >
                <defs>
                  {/* Subtle gradients for slices */}
                  <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#CFA6A3" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#A36B67" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#252120" stopOpacity="0.82" />
                    <stop offset="100%" stopColor="#1C1817" stopOpacity="0.92" />
                  </linearGradient>
                </defs>

                {WHEEL_ITEMS.map((item, index) => {
                  const isHovered = hoveredIndex === index;
                  const isItemPlaying =
                    item.id === "mute"
                      ? !isPlaying
                      : isPlaying && currentTrackId === item.id;

                  // 8 slices: slice 0 centered at 12 o'clock (-90 deg)
                  const sliceCenterDeg = -90 + index * 45;
                  const startDeg = sliceCenterDeg - (22.5 - gapDeg / 2);
                  const endDeg = sliceCenterDeg + (22.5 - gapDeg / 2);

                  const startRad = (startDeg * Math.PI) / 180;
                  const endRad = (endDeg * Math.PI) / 180;
                  const midRad = (sliceCenterDeg * Math.PI) / 180;

                  // Slice expands outward when hovered (GTA V effect)
                  const offset = isHovered ? 10 : 0;
                  const offsetX = Math.cos(midRad) * offset;
                  const offsetY = Math.sin(midRad) * offset;

                  const curCenter = { x: center + offsetX, y: center + offsetY };

                  // Outer arc points
                  const x1_out = curCenter.x + outerR * Math.cos(startRad);
                  const y1_out = curCenter.y + outerR * Math.sin(startRad);
                  const x2_out = curCenter.x + outerR * Math.cos(endRad);
                  const y2_out = curCenter.y + outerR * Math.sin(endRad);

                  // Inner arc points
                  const x1_in = curCenter.x + innerR * Math.cos(startRad);
                  const y1_in = curCenter.y + innerR * Math.sin(startRad);
                  const x2_in = curCenter.x + innerR * Math.cos(endRad);
                  const y2_in = curCenter.y + innerR * Math.sin(endRad);

                  // SVG path for annular wedge
                  const pathD = `
                    M ${x1_in} ${y1_in}
                    L ${x1_out} ${y1_out}
                    A ${outerR} ${outerR} 0 0 1 ${x2_out} ${y2_out}
                    L ${x2_in} ${y2_in}
                    A ${innerR} ${innerR} 0 0 0 ${x1_in} ${y1_in}
                    Z
                  `;

                  // Midpoint for placing emoji and text
                  const labelR = (outerR + innerR) / 2;
                  const labelX = curCenter.x + labelR * Math.cos(midRad);
                  const labelY = curCenter.y + labelR * Math.sin(midRad);

                  return (
                    <g
                      key={item.id}
                      onClick={() => handleSelectIndex(index)}
                      onMouseEnter={() => handleSliceHover(index)}
                      className="cursor-pointer transition-all duration-150"
                    >
                      {/* Wedge Slice Path */}
                      <path
                        d={pathD}
                        fill={isHovered ? "url(#activeGrad)" : "url(#defaultGrad)"}
                        stroke={
                          isHovered
                            ? "#FFF"
                            : isItemPlaying
                            ? item.color
                            : "rgba(255, 255, 255, 0.16)"
                        }
                        strokeWidth={isHovered ? 2.5 : isItemPlaying ? 2 : 1}
                        className="transition-colors duration-150 filter drop-shadow-sm"
                      />

                      {/* Playing Highlight Ring Line */}
                      {isItemPlaying && (
                        <circle
                          cx={labelX}
                          cy={labelY}
                          r={22}
                          fill="none"
                          stroke={isHovered ? "#FFF" : item.color}
                          strokeWidth={1.5}
                          strokeDasharray="4 2"
                          className="animate-spin [animation-duration:12s]"
                        />
                      )}

                      {/* Icon / Emoji in slice */}
                      <text
                        x={labelX}
                        y={labelY - 5}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={isHovered ? "22" : "19"}
                        className="pointer-events-none transition-all duration-150 select-none"
                      >
                        {item.emoji}
                      </text>

                      {/* Short label in slice */}
                      <text
                        x={labelX}
                        y={labelY + 16}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="10"
                        fontWeight={isHovered ? "700" : "500"}
                        fill={isHovered ? "#FFF" : "rgba(255, 255, 255, 0.85)"}
                        className="font-editorial-body pointer-events-none tracking-tight select-none"
                      >
                        {item.shortName}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Central Information Hub (Inside inner circle) */}
              <div
                className="absolute w-[210px] h-[210px] rounded-full bg-[#181514]/90 backdrop-blur-xl border border-white/20 shadow-inner flex flex-col items-center justify-center p-3 text-center pointer-events-auto cursor-pointer group"
                onClick={() => handleSelectIndex(hoveredIndex)}
                title="Klik untuk memilih"
              >
                {/* Center Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-30 pointer-events-none"
                  style={{ backgroundColor: activeHoveredItem.color }}
                />

                {/* Big Emoji */}
                <motion.div
                  key={activeHoveredItem.id}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="text-3xl mb-1 relative z-10 drop-shadow-md"
                >
                  {activeHoveredItem.emoji}
                </motion.div>

                {/* Title */}
                <h4 className="font-editorial-heading text-xs sm:text-sm font-semibold text-white tracking-tight leading-tight line-clamp-2 px-1 relative z-10">
                  {activeHoveredItem.name}
                </h4>

                {/* Category & Status */}
                <div className="flex items-center gap-1.5 mt-1.5 relative z-10">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                    {activeHoveredItem.category}
                  </span>

                  {isHoveredCurrent && (
                    <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Aktif</span>
                    </span>
                  )}
                </div>

                {/* Subtitle / Action hint */}
                <p className="text-[10px] text-white/50 font-editorial-body mt-1 relative z-10 group-hover:text-white/80 transition-colors">
                  {isHoveredCurrent
                    ? "Sedang berputar di latar ♡"
                    : "Klik untuk putar suara ini ↵"}
                </p>
              </div>
            </div>

            {/* Bottom Controls Bar (Volume Slider, Play/Pause & Close Button) */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-3 sm:p-4 mt-2 shadow-2xl flex flex-col gap-2.5 text-white">
              {/* Description of active item */}
              <div className="text-center px-2">
                <p className="text-xs text-white/80 font-editorial-body italic line-clamp-1">
                  &ldquo;{activeHoveredItem.description}&rdquo;
                </p>
              </div>

              {/* Volume Slider & Actions */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                {/* Volume control */}
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-white/70">
                    {volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#CFA6A3]" />
                    )}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#CFA6A3]"
                  />
                  <span className="text-[10px] font-mono text-white/70 w-8 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                {/* Play / Mute Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isPlaying) {
                      stopAmbientSound();
                    } else {
                      playAmbientTrack(currentTrackId);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-editorial-body font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isPlaying
                      ? "bg-white/20 hover:bg-white/30 text-white"
                      : "bg-[#CFA6A3] hover:bg-[#B88582] text-white"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>Jeda</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Putar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Keyboard navigation helper */}
              <div className="text-center">
                <span className="text-[10px] text-white/40 font-mono">
                  Tips: Gunakan arah panah ← → atau gerakkan kursor untuk memutar roda (Tekan ESC / M untuk tutup)
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
