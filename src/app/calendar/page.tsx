"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Memory, MOODS } from "@/lib/types";
import { getMemories } from "@/lib/store";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { id } from "date-fns/locale";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)); // Default Oct 2026
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 9, 18));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getMemories();
      setMemories(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getMemoriesForDay = (day: Date) => {
    const formatted = format(day, "yyyy-MM-dd");
    return memories.filter((m) => m.event_date === formatted);
  };

  const selectedDateMemories = getMemoriesForDay(selectedDate);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const weekDayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
            Jejak Hari
          </span>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
            Memory Calendar.
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-2 max-w-xl">
            Lihat setiap tanggal di mana kita menorehkan cerita dan tawa bersama.
          </p>
        </div>

        <Link
          href={`/diary/new?date=${format(selectedDate, "yyyy-MM-dd")}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs sm:text-sm font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis di Tanggal Ini</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Month & Year Navigator */}
          <div className="flex items-center justify-between">
            <h2 className="font-editorial-heading text-xl sm:text-2xl font-medium text-[#302B29]">
              {format(currentMonth, "MMMM yyyy", { locale: id })}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-[#E9E1DB] hover:bg-[#FAF8F5] text-[#78655F] transition-colors"
                aria-label="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-[#E9E1DB] hover:bg-[#FAF8F5] text-[#78655F] transition-colors"
                aria-label="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDayNames.map((d) => (
              <span
                key={d}
                className="text-[11px] font-medium uppercase tracking-wider text-[#8D817B] py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((day) => {
              const dayMemories = getMemoriesForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const hasMemories = dayMemories.length > 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all text-xs font-editorial-body ${
                    isSelected
                      ? "bg-[#CFA6A3] text-white font-medium shadow-md shadow-[#CFA6A3]/30 scale-105"
                      : isCurrentMonth
                      ? "bg-[#FAF8F5] hover:bg-[#F1EBE4] text-[#302B29]"
                      : "bg-transparent text-[#8D817B]/40"
                  }`}
                >
                  <span>{format(day, "d")}</span>

                  {/* Dusty-rose memory dot indicator */}
                  {hasMemories && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isSelected ? "bg-white" : "bg-[#CFA6A3]"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8D817B] pt-2">
            <span className="w-2 h-2 rounded-full bg-[#CFA6A3]" />
            <span>Tanggal dengan cerita kenangan tersimpan</span>
          </div>
        </div>

        {/* Selected Date Details Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E9E1DB] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E1DB]">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8D817B] font-mono">
                  Kenangan Tanggal
                </span>
                <h3 className="font-editorial-heading text-lg font-medium text-[#302B29]">
                  {format(selectedDate, "d MMMM yyyy", { locale: id })}
                </h3>
              </div>
              <span className="text-xs bg-[#F1EBE4] text-[#78655F] px-2.5 py-1 rounded-full font-medium">
                {selectedDateMemories.length} cerita
              </span>
            </div>

            {selectedDateMemories.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <CalendarIcon className="w-8 h-8 text-[#CFA6A3]/60 mx-auto" />
                <p className="font-editorial-body text-xs text-[#8D817B]">
                  Belum ada cerita yang dicatat pada tanggal ini.
                </p>
                <Link
                  href={`/diary/new?date=${format(selectedDate, "yyyy-MM-dd")}`}
                  className="inline-block px-4 py-2 bg-[#F1EBE4] hover:bg-[#E9E1DB] text-[#302B29] rounded-full text-xs font-editorial-body transition-colors"
                >
                  + Tulis Cerita Tanggal Ini
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateMemories.map((mem) => (
                  <Link
                    key={mem.id}
                    href={`/diary/${mem.id}`}
                    className="block p-4 rounded-2xl bg-[#FAF8F5] border border-[#E9E1DB] hover:border-[#CFA6A3] transition-all group"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#F1EBE4]">
                        <Image
                          src={mem.cover_image_url || "/images/hero.jpg"}
                          alt={mem.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#8D817B]">
                          <span>{MOODS[mem.mood]?.emoji}</span>
                          <span>{MOODS[mem.mood]?.label}</span>
                          {mem.location_name && (
                            <>
                              <span>•</span>
                              <span className="truncate">{mem.location_name}</span>
                            </>
                          )}
                        </div>
                        <h4 className="font-editorial-heading text-sm font-medium text-[#302B29] truncate mt-1 group-hover:text-[#B88582] transition-colors">
                          {mem.title}
                        </h4>
                        <p className="font-editorial-body text-xs text-[#78655F] line-clamp-2 mt-1">
                          {mem.story}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
