"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export interface MapPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  date: string;
  photoUrl?: string;
  memoryId?: string;
}

export default function PlacesMap({ places }: { places: MapPlace[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy existing instance if already created
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter: [number, number] =
      places.length > 0 ? [places[0].lat, places[0].lng] : [-6.9175, 107.6191];

    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 6,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const customIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: #CFA6A3; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(120,101,95,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16],
    });

    places.forEach((p) => {
      const formattedDate = format(new Date(p.date), "d MMM yyyy", {
        locale: id,
      });

      const popupContent = `
        <div style="font-family: inherit; max-width: 200px; padding: 4px;">
          ${
            p.photoUrl
              ? `<div style="width: 100%; aspect-ratio: 16/10; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #f1ebe4;">
                  <img src="${p.photoUrl}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>`
              : ""
          }
          <div style="font-size: 13px; font-weight: 600; color: #302B29; line-height: 1.2;">${
            p.name
          }</div>
          <div style="font-size: 11px; color: #8D817B; margin-top: 4px;">${formattedDate}</div>
          ${
            p.memoryId
              ? `<a href="/diary/${p.memoryId}" style="display: inline-block; font-size: 11px; color: #CFA6A3; font-weight: 500; margin-top: 6px; text-decoration: underline;">Buka di Jurnal →</a>`
              : ""
          }
        </div>
      `;

      L.marker([p.lat, p.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [places]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[450px] sm:h-[550px] rounded-3xl overflow-hidden border border-[#E9E1DB] shadow-xs relative z-10"
    />
  );
}
