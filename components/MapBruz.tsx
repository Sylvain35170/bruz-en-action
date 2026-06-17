"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const BRUZ_CENTER: [number, number] = [48.0245, -1.7490];

/* ── ZAC Multisites — 6 secteurs réels (périmètres indicatifs centrés sur localisation réelle) ── */
const D = 0.004; // demi-côté des boîtes (~400m)
function box(lat: number, lng: number, dLat = D, dLng = D): [number, number][] {
  return [
    [lat + dLat, lng - dLng],
    [lat + dLat, lng + dLng],
    [lat - dLat, lng + dLng],
    [lat - dLat, lng - dLng],
  ];
}

const ZAC_SECTEURS = [
  { nom: "ZAC Secteur Gare",                   coords: box(48.0283, -1.7498, 0.003, 0.004) },
  { nom: "ZAC Secteur Grand-Pâtis",            coords: box(48.0172, -1.7432, 0.003, 0.004) },
  { nom: "ZAC Secteur Haye de Pan",            coords: box(48.0286, -1.7268, 0.003, 0.004) },
  { nom: "ZAC Secteur Maison des Associations",coords: box(48.0262, -1.7376, 0.003, 0.004) },
  { nom: "ZAC Secteur Noë",                    coords: box(48.0200, -1.7532, 0.003, 0.004) },
  { nom: "ZAC Secteur Mons",                   coords: box(48.0249, -1.7717, 0.003, 0.004) },
];

/* ── Corridor T4 — 21 stations (tracé indicatif basé sur C7 actuelle) ── */
const T4_CORRIDOR: [number, number][] = [
  [48.0980, -1.7060], // Saint-Jacques - Gaîté (métro B terminus)
  [48.0805, -1.7129], // Mairie de Saint-Jacques
  [48.0740, -1.7170], // Haut Bois / La Martinière
  [48.0676, -1.7227], // Aéroport Rennes Bretagne
  [48.0598, -1.7345], // Parc Expo
  [48.0490, -1.7360], // Gautrais / Porte de Ker Lann
  [48.0432, -1.7394], // Ker Lann (Cœur Campus)
  [48.0360, -1.7430], // Robert-Schuman / Croix Madame
  [48.0283, -1.7498], // Gare de Bruz
  [48.0245, -1.7511], // Bruz Centre (terminus)
];

/* ── Équipements clés ── */
const EQUIPEMENTS = [
  { nom: "Mairie de Bruz", coords: [48.0245, -1.7511] as [number, number], emoji: "🏛️" },
  { nom: "Gare de Bruz (SNCF)", coords: [48.0283, -1.7498] as [number, number], emoji: "🚉" },
  { nom: "Ker Lann (campus)", coords: [48.0432, -1.7394] as [number, number], emoji: "🎓" },
  { nom: "Aéroport Rennes Bretagne", coords: [48.0676, -1.7227] as [number, number], emoji: "✈️" },
  { nom: "Maison des Associations Bruz", coords: [48.0262, -1.7376] as [number, number], emoji: "🏠" },
];

export default function MapBruz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    (async () => {
      const L = (await import("leaflet")).default;

      /* Fix icônes Leaflet sous webpack */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!).setView(BRUZ_CENTER, 13);
      mapRef.current = map;

      /* Fond OSM */
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      /* ZAC Multisites */
      ZAC_SECTEURS.forEach((sec) => {
        L.polygon(sec.coords, {
          color: "#f97316",
          fillColor: "#f97316",
          fillOpacity: 0.18,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<strong style="font-size:13px">${sec.nom}</strong><br><span style="font-size:11px;color:#64748b">ZAC Multisites · périmètre indicatif</span>`
          );
      });

      /* T4 corridor */
      L.polyline(T4_CORRIDOR, {
        color: "#7c3aed",
        weight: 5,
        opacity: 0.8,
        dashArray: "12,6",
      })
        .addTo(map)
        .bindPopup(
          `<strong style="font-size:13px">Corridor Trambus T4</strong><br><span style="font-size:11px;color:#64748b">Rennes → Bruz · tracé indicatif</span>`
        );

      /* Équipements */
      EQUIPEMENTS.forEach((eq) => {
        const icon = L.divIcon({
          html: `<span style="font-size:22px;line-height:1">${eq.emoji}</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          className: "",
        });
        L.marker(eq.coords, { icon })
          .addTo(map)
          .bindPopup(`<strong style="font-size:13px">${eq.nom}</strong>`);
      });
    })();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%", minHeight: 480, borderRadius: 12, zIndex: 0 }}
    />
  );
}
