"use client";

import { useState } from "react";
import type { Promesse, Pilier, Statut } from "../types";

interface Props {
  promesses: Promesse[];
  piliers: Pilier[];
  statuts: Statut[];
}

const STATUT_CSS: Record<string, { color: string; tint: string }> = {
  non_commence: { color: "var(--status-todo)",      tint: "var(--status-todo-tint)" },
  en_cours:     { color: "var(--status-progress)",  tint: "var(--status-progress-tint)" },
  tenu:         { color: "var(--status-done)",      tint: "var(--status-done-tint)" },
  partiel:      { color: "var(--status-partial)",   tint: "var(--status-partial-tint)" },
  abandonne:    { color: "var(--status-abandoned)", tint: "var(--status-abandoned-tint)" },
  inconnu:      { color: "var(--status-na)",        tint: "var(--status-na-tint)" },
};

export default function PromessesSection({ promesses, piliers, statuts }: Props) {
  const [pilierFilter, setPilierFilter] = useState<number | null>(null);
  const [statutFilter, setStatutFilter] = useState<string | null>(null);

  const filtered = promesses.filter((p) => {
    if (pilierFilter !== null && p.pilier_id !== pilierFilter) return false;
    if (statutFilter !== null && p.statut_id !== statutFilter) return false;
    return true;
  });

  const getPilier = (id: number) => piliers.find((p) => p.id === id);
  const getStatut = (id: string) => statuts.find((s) => s.id === id);
  const countByPilier = (id: number) => promesses.filter((p) => p.pilier_id === id).length;
  const countByStatut = (id: string) => promesses.filter((p) => p.statut_id === id).length;

  return (
    <section style={{ background: "var(--surface-card)", borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--section-gap) var(--container-pad)" }}>

        {/* Section head */}
        <div style={{ maxWidth: 680, marginBottom: "var(--space-8)" }}>
          <span className="eyebrow">Suivi des promesses</span>
          <h2 style={{ fontSize: "var(--fs-h2)", margin: "10px 0 0" }}>Chaque engagement, relié à sa source</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-lg)", margin: "10px 0 0", lineHeight: "var(--lh-relaxed)" }}>
            Filtrez par thème ou par statut.
          </p>
        </div>

        {/* Filtre piliers */}
        <div style={{ marginBottom: 14 }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Par thème</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <FilterPill active={pilierFilter === null} count={promesses.length} onClick={() => setPilierFilter(null)}>
              Tous
            </FilterPill>
            {piliers.map((p) => (
              <FilterPill
                key={p.id}
                active={pilierFilter === p.id}
                dotColor={p.color}
                count={countByPilier(p.id)}
                onClick={() => setPilierFilter(pilierFilter === p.id ? null : p.id)}
              >
                {p.emoji} {p.label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Filtre statuts */}
        <div style={{ marginBottom: 28 }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Par statut</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <FilterPill active={statutFilter === null} count={promesses.length} onClick={() => setStatutFilter(null)}>
              Tous
            </FilterPill>
            {statuts.map((s) => {
              const css = STATUT_CSS[s.id] ?? { color: s.color, tint: "#f8fafc" };
              return (
                <FilterPill
                  key={s.id}
                  active={statutFilter === s.id}
                  dotColor={css.color}
                  count={countByStatut(s.id)}
                  onClick={() => setStatutFilter(statutFilter === s.id ? null : s.id)}
                >
                  {s.label}
                </FilterPill>
              );
            })}
          </div>
        </div>

        {/* Table */}
        {promesses.length === 0 ? (
          <div style={{
            padding: "48px 16px",
            textAlign: "center",
            border: "2px dashed var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            background: "var(--surface-sunken)",
          }}>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)", margin: 0 }}>
              Aucune promesse saisie pour le moment.
            </p>
          </div>
        ) : (
          <>
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Promesse", "Thème", "Statut", "Horizon"].map((h) => (
                      <th key={h} style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: "var(--fs-xs)",
                        fontWeight: "var(--fw-bold)",
                        letterSpacing: "var(--ls-label)",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        background: "var(--surface-sunken)",
                        borderBottom: "1px solid var(--border-subtle)",
                        whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const pilier = getPilier(p.pilier_id);
                    const statut = getStatut(p.statut_id);
                    const css = STATUT_CSS[p.statut_id] ?? { color: "#94a3b8", tint: "#f8fafc" };
                    return (
                      <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                        <td style={{ padding: "14px 16px", fontSize: "var(--fs-sm)", color: "var(--text-strong)", fontWeight: "var(--fw-medium)", maxWidth: 480 }}>
                          <span style={{ display: "block" }}>{p.titre}</span>
                          {(p as any).ref && (
                            <span style={{ fontSize: "var(--fs-2xs)", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                              {(p as any).ref}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                          {pilier && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-xs)", fontWeight: "var(--fw-semibold)", color: pilier.color }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: pilier.color, flexShrink: 0 }} />
                              {pilier.label}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {statut && (
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 10px",
                              fontSize: "var(--fs-xs)",
                              fontWeight: "var(--fw-semibold)",
                              color: css.color,
                              background: css.tint,
                              border: `1px solid color-mix(in srgb, ${css.color} 24%, transparent)`,
                              borderRadius: "var(--radius-pill)",
                              whiteSpace: "nowrap",
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: css.color, flexShrink: 0 }} />
                              {statut.label}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "var(--fs-xs)", color: "var(--text-faint)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                          {(p as any).horizon || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--fs-sm)" }}>
                  Aucune promesse ne correspond à ces filtres.
                </div>
              )}
            </div>
            <div style={{ marginTop: 12, fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>
              {filtered.length} promesse{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""} sur {promesses.length}.
            </div>
          </>
        )}
      </div>
    </section>
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
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        fontSize: "var(--fs-xs)",
        fontWeight: "var(--fw-semibold)",
        fontFamily: "var(--font-sans)",
        borderRadius: "var(--radius-pill)",
        border: active ? "1.5px solid currentColor" : "1.5px solid var(--border-default)",
        background: active ? (dotColor ? `color-mix(in srgb, ${dotColor} 10%, white)` : "var(--slate-900)") : "var(--surface-card)",
        color: active ? (dotColor || "var(--text-on-dark)") : "var(--text-muted)",
        cursor: "pointer",
        transition: `all var(--dur-base) var(--ease-out)`,
      }}
    >
      {dotColor && (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
      )}
      {children}
      <span className="tabular" style={{
        marginLeft: 2,
        padding: "1px 6px",
        borderRadius: "var(--radius-pill)",
        background: active ? "rgba(255,255,255,0.2)" : "var(--surface-sunken)",
        fontSize: "var(--fs-2xs)",
        color: active ? "inherit" : "var(--text-faint)",
      }}>
        {count}
      </span>
    </button>
  );
}
