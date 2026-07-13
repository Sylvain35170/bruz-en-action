"use client";

import { useState } from "react";
import type { Actu } from "../types";

interface Props {
  actus: Actu[];
  dossierTitres: Record<string, string>;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  presse:   { label: "Presse",   color: "#0284c7" },
  mairie:   { label: "Mairie",   color: "#16a34a" },
  analyse:  { label: "Analyse",  color: "#7c3aed" },
  decision: { label: "Décision", color: "#d97706" },
  alerte:   { label: "Alerte",   color: "#dc2626" },
  election: { label: "Élection", color: "#6366f1" },
};

function effectiveDate(a: Actu): string {
  return a.date ?? a.date_publication_estimee ?? "";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ActualitesList({ actus, dossierTitres }: Props) {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [dossierFilter, setDossierFilter] = useState<string>("");

  const sorted = [...actus].sort((a, b) => effectiveDate(b).localeCompare(effectiveDate(a)));

  const filtered = sorted.filter((a) => {
    if (typeFilter !== null && a.type !== typeFilter) return false;
    if (dossierFilter && a.dossier !== dossierFilter) return false;
    return true;
  });

  const types = Object.keys(TYPE_CONFIG).filter(t => actus.some(a => a.type === t));
  const countByType = (t: string) => actus.filter(a => a.type === t).length;
  const dossiersPresents = Object.keys(dossierTitres)
    .filter(id => actus.some(a => a.dossier === id))
    .sort();

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 60px" }}>

      {/* Filtres */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <FilterPill active={typeFilter === null} count={actus.length} onClick={() => setTypeFilter(null)}>
          Toutes
        </FilterPill>
        {types.map((t) => (
          <FilterPill
            key={t}
            active={typeFilter === t}
            dotColor={TYPE_CONFIG[t].color}
            count={countByType(t)}
            onClick={() => setTypeFilter(typeFilter === t ? null : t)}
          >
            {TYPE_CONFIG[t].label}
          </FilterPill>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        <label htmlFor="filtre-dossier" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8" }}>
          Dossier
        </label>
        <select
          id="filtre-dossier"
          value={dossierFilter}
          onChange={(e) => setDossierFilter(e.target.value)}
          style={{
            padding: "7px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
            background: "#fff", fontSize: 13, color: "#334155", maxWidth: "100%",
          }}
        >
          <option value="">Tous les dossiers</option>
          {dossiersPresents.map((id) => (
            <option key={id} value={id}>{id} — {dossierTitres[id]}</option>
          ))}
        </select>
        {(typeFilter || dossierFilter) && (
          <button
            onClick={() => { setTypeFilter(null); setDossierFilter(""); }}
            style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Liste */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((a) => {
          const cfg = TYPE_CONFIG[a.type] ?? { label: a.type, color: "#64748b" };
          const isAnalyse = a.type === "analyse" && a.contenu;
          const href = isAnalyse ? `/bruz-en-action/articles/${a.id}` : a.source_url;
          const dateEff = effectiveDate(a);
          return (
            <div key={a.id} style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
              padding: "16px 20px", borderLeft: `4px solid ${cfg.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{
                  padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                  color: cfg.color, background: `color-mix(in srgb, ${cfg.color} 10%, white)`,
                  border: `1px solid color-mix(in srgb, ${cfg.color} 25%, transparent)`,
                }}>
                  {cfg.label}
                </span>
                {dateEff && (
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}
                    title={a.date ? undefined : "Date estimée — date de publication sur ce site (date d'article non disponible)"}
                  >
                    {a.date ? fmtDate(dateEff) : `≈ ${fmtDate(dateEff)}`}
                  </span>
                )}
                {a.dossier && dossierTitres[a.dossier] && (
                  <a href={`/bruz-en-action/dossiers/${a.dossier}`}
                    style={{
                      fontSize: 11, fontWeight: 600, color: "#2563eb", textDecoration: "none",
                      padding: "2px 10px", borderRadius: 999, background: "#eff6ff", border: "1px solid #bfdbfe",
                    }}>
                    📁 {dossierTitres[a.dossier]}
                  </a>
                )}
                {a.source_label && (
                  <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>{a.source_label}</span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>
                {a.titre}
              </p>
              {(a.detail || a.resume) && (
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                  {a.detail || a.resume}
                </p>
              )}
              {href && !a.source_url_expiree && (
                <a href={href} target={isAnalyse ? undefined : "_blank"} rel={isAnalyse ? undefined : "noopener noreferrer"}
                  style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                  {isAnalyse ? "Lire l'analyse →" : "Voir la source ↗"}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "48px 16px", textAlign: "center", border: "2px dashed #e2e8f0", borderRadius: 12, color: "#94a3b8", fontSize: 14 }}>
          Aucune actualité ne correspond à ces filtres.
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: "#94a3b8" }}>
        {filtered.length} actualité{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""} sur {actus.length}.
        Les dates précédées de ≈ sont des dates de publication sur ce site (date d&apos;article non disponible).
      </div>
    </div>
  );
}

function FilterPill({
  children,
  active,
  dotColor,
  count,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  dotColor?: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", fontSize: 12, fontWeight: 600,
        borderRadius: 999,
        border: active ? "1.5px solid currentColor" : "1.5px solid #e2e8f0",
        background: active ? (dotColor ? `color-mix(in srgb, ${dotColor} 10%, white)` : "#0f172a") : "#fff",
        color: active ? (dotColor || "#fff") : "#64748b",
        cursor: "pointer",
      }}
    >
      {dotColor && <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />}
      {children}
      <span style={{
        marginLeft: 2, padding: "1px 6px", borderRadius: 999,
        background: active ? "rgba(255,255,255,0.25)" : "#f1f5f9",
        fontSize: 11, color: active ? "inherit" : "#94a3b8",
      }}>
        {count}
      </span>
    </button>
  );
}
