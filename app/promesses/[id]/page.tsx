import { notFound } from "next/navigation";
import promessesData from "../../../data/promesses.json";
import actusData from "../../../data/actus.json";
import dossiersData from "../../../data/dossiers.json";
import metaData from "../../../data/meta.json";
import SiteFooter from "../../../components/SiteFooter";

const LOGO = "/bruz-en-action/logo.png";

const STATUT_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  non_commence: { bg: "#f8fafc", color: "#475569", border: "#e2e8f0", label: "Non commencé" },
  en_cours:     { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: "En cours" },
  tenu:         { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Tenu ✓" },
  partiel:      { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", label: "Partiellement tenu" },
  abandonne:    { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", label: "Abandonné" },
  inconnu:      { bg: "#f8fafc", color: "#94a3b8", border: "#e2e8f0", label: "Non évaluable" },
};

const TYPE_ACTU: Record<string, { icon: string; color: string }> = {
  decision: { icon: "🗳", color: "#2563eb" },
  alerte:   { icon: "⚠️", color: "#d97706" },
  election: { icon: "🏛", color: "#7c3aed" },
  avancee:  { icon: "✅", color: "#16a34a" },
  recul:    { icon: "⬇️", color: "#dc2626" },
  info:     { icon: "ℹ️", color: "#0369a1" },
};

export function generateStaticParams() {
  return promessesData.promesses.map(p => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promesse = promessesData.promesses.find(p => String(p.id) === id);
  if (!promesse) return {};
  return {
    title: `${promesse.titre} — Bruz en Action`,
    description: `Suivi de la promesse ${promesse.ref} : ${promesse.detail}`,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PromessePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promesse = promessesData.promesses.find(p => String(p.id) === id) as any;
  if (!promesse) notFound();

  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);

  const pilier = promessesData.piliers.find(p => p.id === promesse.pilier_id);
  const statut = STATUT_STYLE[promesse.statut_id] ?? STATUT_STYLE.non_commence;
  const statutLabel = promessesData.statuts.find(s => s.id === promesse.statut_id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actusLiees = (actusData.actus as any[])
    .filter((a: { promesses_liees?: number[] }) => a.promesses_liees?.includes(Number(promesse.id)))
    .sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date));

  const dossiersLies = dossiersData.dossiers.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d => (d as any).promesses_liees?.includes(promesse.id)
  );

  const autresPromesses = promessesData.promesses
    .filter(p => p.pilier_id === promesse.pilier_id && String(p.id) !== id)
    .slice(0, 5);

  const allPromesses = promessesData.promesses;
  const idx = allPromesses.findIndex(p => String(p.id) === id);
  const prev = idx > 0 ? allPromesses[idx - 1] : null;
  const next = idx < allPromesses.length - 1 ? allPromesses[idx + 1] : null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="/bruz-en-action" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={140} height={44} style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 8px" }} />
            </a>
            <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <a href="/bruz-en-action/#promesses" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>← Toutes les promesses</a>
              {hasHelloAsso && (
                <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "7px 16px", borderRadius: 999, background: "#f97316", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  ❤️ Adhérer
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {pilier && (
              <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700 }}>
                {pilier.emoji} {pilier.label}
              </span>
            )}
            <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>
              {promesse.ref}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.3rem, 2.5vw, 2rem)", fontWeight: 800, lineHeight: 1.3, margin: "0 0 20px", maxWidth: 720 }}>
            {promesse.titre}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              padding: "6px 14px", borderRadius: 999,
              background: statut.bg, color: statut.color,
              border: `1px solid ${statut.border}`,
              fontSize: 13, fontWeight: 700,
            }}>
              {statut.label}
            </span>
            {promesse.horizon && (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                Horizon : {promesse.horizon}
              </span>
            )}
          </div>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "1fr minmax(0, 288px)", gap: 48, alignItems: "start" }}>

          {/* Colonne principale */}
          <div>

            {/* Détail */}
            {promesse.detail && (
              <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
                  La promesse en détail
                </h2>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px" }}>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: "#334155" }}>{promesse.detail}</p>
                </div>
              </section>
            )}

            {/* Dossiers liés */}
            {dossiersLies.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
                  Dossiers associés
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {dossiersLies.map(d => (
                    <a key={d.id} href={`/bruz-en-action/dossiers/${d.id}`}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, textDecoration: "none" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{d.categorie}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{d.titre}</div>
                      </div>
                      <span style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, flexShrink: 0 }}>Voir le dossier →</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Historique actus */}
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
                Historique du suivi
              </h2>

              {actusLiees.length === 0 ? (
                <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 15, color: "#94a3b8" }}>Aucune actu enregistrée pour cette promesse.</p>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "#cbd5e1" }}>Le suivi démarrera dès les premières décisions.</p>
                </div>
              ) : (
                <div style={{ position: "relative", paddingLeft: 24 }}>
                  <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "#e2e8f0" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {actusLiees.map(a => {
                      const typeStyle = TYPE_ACTU[a.type] ?? TYPE_ACTU.info;
                      return (
                        <div key={a.id} style={{ position: "relative" }}>
                          <div style={{ position: "absolute", left: -22, top: 6, width: 10, height: 10, borderRadius: "50%", background: typeStyle.color, border: "2px solid #fff", boxShadow: `0 0 0 2px ${typeStyle.color}` }} />
                          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{formatDate(a.date)}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: typeStyle.color, background: `${typeStyle.color}18`, padding: "2px 8px", borderRadius: 999 }}>
                                {typeStyle.icon} {a.type}
                              </span>
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{a.titre}</div>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#475569" }}>{a.detail}</p>
                            <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                              {a.source_url && (
                                <a href={a.source_url} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: 12, color: "#2563eb" }}>
                                  {a.source_label} ↗
                                </a>
                              )}
                              {a.cm_lie && (
                                <a href={`/bruz-en-action/conseils/${a.cm_lie}`}
                                  style={{ fontSize: 12, color: "#7c3aed" }}>
                                  Voir le CM →
                                </a>
                              )}
                              {a.dossier_lie && (
                                <a href={`/bruz-en-action/dossiers/${a.dossier_lie}`}
                                  style={{ fontSize: 12, color: "#0369a1" }}>
                                  Voir le dossier →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Navigation prev/next dans le pilier */}
            {(prev || next) && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingTop: 24, borderTop: "1px solid #e2e8f0" }}>
                {prev ? (
                  <a href={`/bruz-en-action/promesses/${prev.id}`}
                    style={{ flex: 1, padding: "12px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, textDecoration: "none" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>← Promesse précédente</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{prev.ref} — {prev.titre.slice(0, 50)}{prev.titre.length > 50 ? "…" : ""}</div>
                  </a>
                ) : <div style={{ flex: 1 }} />}
                {next ? (
                  <a href={`/bruz-en-action/promesses/${next.id}`}
                    style={{ flex: 1, padding: "12px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, textDecoration: "none", textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Promesse suivante →</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{next.ref} — {next.titre.slice(0, 50)}{next.titre.length > 50 ? "…" : ""}</div>
                  </a>
                ) : <div style={{ flex: 1 }} />}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 24 }}>

            {/* Fiche promesse */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                Fiche
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Référence</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{promesse.ref}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8" }}>Statut</span>
                  <span style={{ padding: "3px 10px", borderRadius: 999, background: statut.bg, color: statut.color, border: `1px solid ${statut.border}`, fontSize: 12, fontWeight: 700 }}>
                    {statutLabel?.label ?? statut.label}
                  </span>
                </div>
                {promesse.horizon && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Horizon</span>
                    <span style={{ fontFamily: "monospace", color: "#475569" }}>{promesse.horizon}</span>
                  </div>
                )}
                {pilier && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#94a3b8" }}>Thème</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: pilier.color }}>{pilier.emoji} {pilier.label}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Actus</span>
                  <span style={{ fontWeight: 700, color: actusLiees.length > 0 ? "#0f172a" : "#94a3b8" }}>{actusLiees.length}</span>
                </div>
              </div>
            </div>

            {/* Autres promesses du même pilier */}
            {autresPromesses.length > 0 && pilier && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                  {pilier.emoji} Autres promesses {pilier.label}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {autresPromesses.map(p => (
                    <a key={p.id} href={`/bruz-en-action/promesses/${p.id}`}
                      style={{ fontSize: 13, color: "#2563eb", lineHeight: 1.5, textDecoration: "none", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8", marginRight: 6 }}>{p.ref}</span>
                      {p.titre.slice(0, 55)}{p.titre.length > 55 ? "…" : ""}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Signaler */}
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#0369a1" }}>Vous avez une info ?</h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>
                Une décision, un document public ou un fait lié à cette promesse ? Partagez-le avec Bruz en Action.
              </p>
              <a href={contact.hello_asso_url || "#"} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 600, color: "#0369a1", textDecoration: "underline" }}>
                Nous contacter →
              </a>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
