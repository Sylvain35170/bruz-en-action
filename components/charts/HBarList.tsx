import Provenance from "./Provenance";

// Barres horizontales en div (pas de SVG nécessaire) — pour des catégories
// nommées : secteurs d'activité, faits constatés, dette par année…
// Une barre `confirme: false` est grisée (donnée non confirmée par une
// source officielle), même convention que SvgBarChart des dossiers.

export type HBarItem = {
  label: string;
  valeur: number;
  affiche?: string; // formatage spécifique (ex. "379,59 €") — sinon valeur brute
  confirme?: boolean;
  muted?: boolean; // barre de référence (ex. moyenne nationale) — grise, sans mention
  note?: string;
};

const ACCENT = "#E8A040";
const GRIS = "#94a3b8";

export default function HBarList({
  titre,
  sousTitre,
  items,
  source,
  sourceUrl,
  annee,
}: {
  titre: string;
  sousTitre?: string;
  items: HBarItem[];
  source: string;
  sourceUrl?: string;
  annee?: string | number;
}) {
  const max = Math.max(...items.map(i => i.valeur));
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{titre}</div>
      {sousTitre && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{sousTitre}</div>}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(item => (
          <div key={item.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
              <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
                {item.label}
                {item.confirme === false && (
                  <span style={{ fontSize: 11, color: GRIS, fontWeight: 500 }}> · non confirmé</span>
                )}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                {item.affiche ?? item.valeur.toLocaleString("fr-FR")}
              </span>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: 4, height: 10 }}>
              <div
                style={{
                  width: `${Math.max((item.valeur / max) * 100, 1.5)}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: item.confirme === false || item.muted ? GRIS : ACCENT,
                }}
              />
            </div>
            {item.note && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.note}</div>}
          </div>
        ))}
      </div>
      <Provenance source={source} annee={annee} url={sourceUrl} />
    </div>
  );
}
