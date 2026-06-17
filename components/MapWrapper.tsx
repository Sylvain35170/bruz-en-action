"use client";

import dynamic from "next/dynamic";

const MapBruz = dynamic(() => import("./MapBruz"), {
  ssr: false,
  loading: () => (
    <div style={{
      height: "100%", minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f1f5f9", borderRadius: 12, color: "#64748b", fontSize: 14,
    }}>
      Chargement de la carte…
    </div>
  ),
});

export default function MapWrapper() {
  return <MapBruz />;
}
