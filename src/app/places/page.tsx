"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  List,
  Map as MapIcon,
  Plus,
  Calendar,
  ExternalLink,
  X,
} from "lucide-react";
import { Memory } from "@/lib/types";
import { getMemories } from "@/lib/store";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MapPlace } from "@/components/places/places-map";
import { useToast } from "@/components/ui/toast-provider";

const DynamicPlacesMap = dynamic(
  () => import("@/components/places/places-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] sm:h-[550px] rounded-3xl bg-white border border-[#E9E1DB] flex items-center justify-center text-xs text-[#8D817B]">
        Memuat peta interaktif...
      </div>
    ),
  }
);

export default function PlacesPage() {
  const { success } = useToast();
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal manual place add
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceDate, setNewPlaceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newPlaceLat, setNewPlaceLat] = useState("");
  const [newPlaceLng, setNewPlaceLng] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const memories = await getMemories();
      const extracted: MapPlace[] = [];

      memories.forEach((m) => {
        if (m.location_name) {
          extracted.push({
            id: m.id,
            name: m.location_name,
            lat: m.location_lat || -6.9175,
            lng: m.location_lng || 107.6191,
            date: m.event_date,
            photoUrl: m.cover_image_url || m.media?.[0]?.file_path,
            memoryId: m.id,
          });
        }
      });

      setPlaces(extracted);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleAddManualPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    const lat = parseFloat(newPlaceLat) || -6.2088; // Default Jakarta if unspecified
    const lng = parseFloat(newPlaceLng) || 106.8456;

    const manualPlace: MapPlace = {
      id: `manual-place-${Date.now()}`,
      name: newPlaceName.trim(),
      lat,
      lng,
      date: newPlaceDate,
      photoUrl: "/images/hero.jpg",
    };

    setPlaces((prev) => [manualPlace, ...prev]);
    setIsAddModalOpen(false);
    setNewPlaceName("");
    setNewPlaceLat("");
    setNewPlaceLng("");
    success("Tempat kenangan baru berhasil ditambahkan!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1DB]/80">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8D817B] font-mono">
            Peta Kenangan
          </span>
          <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-[#302B29] tracking-tight mt-1">
            Places We&apos;ve Been.
          </h1>
          <p className="font-editorial-body text-sm text-[#78655F] mt-2 max-w-xl">
            Peta interaktif sudut-sudut kota, kafe, pantai, dan jalanan yang pernah kita telusuri bersama.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-[#E9E1DB] rounded-full p-1 text-xs">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-editorial-body transition-colors ${
                viewMode === "map"
                  ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                  : "text-[#8D817B] hover:text-[#302B29]"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Peta</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-editorial-body transition-colors ${
                viewMode === "list"
                  ? "bg-[#F1EBE4] text-[#302B29] font-medium"
                  : "text-[#8D817B] hover:text-[#302B29]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#CFA6A3] hover:bg-[#B88582] text-white rounded-full text-xs font-editorial-body font-medium transition-all shadow-md shadow-[#CFA6A3]/30 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tempat</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "map" ? (
        <div className="space-y-4">
          <DynamicPlacesMap places={places} />
          <p className="text-center text-xs text-[#8D817B] font-editorial-body">
            Klik pada pin merah muda untuk melihat foto kenangan dan cerita di tempat tersebut.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((p) => (
            <div
              key={p.id}
              className="paper-card rounded-3xl overflow-hidden bg-white p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {p.photoUrl && (
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#F1EBE4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-[#8D817B]">
                  <Calendar className="w-3.5 h-3.5 text-[#CFA6A3]" />
                  <span>
                    {format(new Date(p.date), "d MMMM yyyy", { locale: id })}
                  </span>
                </div>
                <h3 className="font-editorial-heading text-lg font-medium text-[#302B29]">
                  {p.name}
                </h3>
              </div>

              {p.memoryId && (
                <div className="pt-4 mt-4 border-t border-[#E9E1DB] flex justify-end">
                  <Link
                    href={`/diary/${p.memoryId}`}
                    className="text-xs text-[#CFA6A3] hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>Lihat di Jurnal</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Manual Place Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E9E1DB] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E1DB]">
              <h3 className="font-editorial-heading text-xl text-[#302B29]">
                Catat Tempat Kenangan Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#8D817B] hover:text-[#302B29]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualPlace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Nama Tempat / Kafe / Lokasi *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="Contoh: Kedai Kopi Sudut, Braga"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-editorial-body text-[#78655F]">
                  Tanggal Kunjungan
                </label>
                <input
                  type="date"
                  value={newPlaceDate}
                  onChange={(e) => setNewPlaceDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs sm:text-sm text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-editorial-body text-[#78655F]">
                    Latitude (Opsional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newPlaceLat}
                    onChange={(e) => setNewPlaceLat(e.target.value)}
                    placeholder="-6.9175"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-editorial-body text-[#78655F]">
                    Longitude (Opsional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newPlaceLng}
                    onChange={(e) => setNewPlaceLng(e.target.value)}
                    placeholder="107.6191"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E9E1DB] rounded-2xl text-xs text-[#302B29] focus:outline-hidden focus:border-[#CFA6A3]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#E9E1DB] text-xs font-editorial-body text-[#78655F]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#CFA6A3] hover:bg-[#B88582] text-white text-xs font-editorial-body font-medium transition-colors"
                >
                  Simpan Tempat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
