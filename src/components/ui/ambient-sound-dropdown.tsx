"use client";

import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Disc,
  Sliders,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import {
  AMBIENT_TRACKS,
  AmbientTrackId,
  subscribeAmbientSound,
} from "@/lib/ambient-sound";
import { AmbientSoundWheel } from "./ambient-sound-wheel";

export function AmbientSoundDropdown() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<AmbientTrackId>("piano");
  const [isWheelOpen, setIsWheelOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAmbientSound((playing, trackId) => {
      setIsPlaying(playing);
      setCurrentTrackId(trackId);
    });
    return () => unsubscribe();
  }, []);

  // Keyboard shortcut: Press 'M' to open GTA Music Wheel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsWheelOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeTrack =
    AMBIENT_TRACKS.find((t) => t.id === currentTrackId) || AMBIENT_TRACKS[0];

  return (
    <>
      {/* Trigger Button that launches Radial Sound Wheel */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsWheelOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-editorial-body transition-all border cursor-pointer select-none ${
          isPlaying
            ? "bg-[#FAF5F0] border-[#CFA6A3] text-[#302B29] shadow-xs ring-2 ring-[#CFA6A3]/25"
            : "bg-white/80 border-[#E9E1DB] text-[#78655F] hover:text-[#302B29] hover:bg-white shadow-2xs"
        }`}
        title="Buka Pilihan Musik Suasana (Tekan M)"
      >
        <div className="flex items-center gap-1.5">
          {isPlaying ? (
            <Volume2 className="w-3.5 h-3.5 text-[#CFA6A3] animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[#8D817B]" />
          )}

          <span className="text-xs">{activeTrack.emoji}</span>

          <span className="hidden sm:inline font-medium truncate max-w-[130px] xl:max-w-[160px]">
            {isPlaying ? activeTrack.name : "Pilihan Musik Suasana"}
          </span>

          {isPlaying && (
            <span className="flex gap-0.5 items-end h-3 ml-0.5">
              <span className="w-0.5 h-2 bg-[#CFA6A3] animate-bounce" />
              <span className="w-0.5 h-3 bg-[#CFA6A3] animate-bounce delay-75" />
              <span className="w-0.5 h-1.5 bg-[#CFA6A3] animate-bounce delay-150" />
            </span>
          )}
        </div>

        {/* Music Badge indicator */}
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#FAF5F0] border border-[#E9E1DB] text-[#CFA6A3] font-semibold flex items-center gap-0.5">
          <span>🎵</span>
          <span className="hidden md:inline">Musik</span>
        </span>
      </motion.button>

      {/* Radial Sound Selector Wheel Modal */}
      <AmbientSoundWheel
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
      />
    </>
  );
}
