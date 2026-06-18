import { notFound } from "next/navigation";
import cmsData from "../../../data/cms.json";
import metaData from "../../../data/meta.json";

const LOGO = "/bruz-en-action/logo.png";

type Deliberation = { numero: string; titre: string; vote: string; detail: string; source_url?: string };
type PointChaud = { sujet: string; tension: string; detail: string };
type Source = { label: string; url: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Seance = any;

export function generateStaticParams() {
  return cmsData.seances.map(s => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seance = cmsData.seances.find(s => s.id === id) as Seance;
  if (!seance) return {};
  return {
    title: `${seance.titre} — Conseil municipal de Bruz`,
    description: seance.resume_executif ?? seance.titre,
  };
}

const STATUT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  a_venir: { bg: "#eff6ff", color: "#1d4ed8", label: "À venir" },
  passe:   { bg: "#f0fdf4", color: "#15803d", label: "Compte rendu" },
};

const TENSION_STYLE: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  haute:        { bg: "#fef2f2", border: "#fecaca", color: "#7f1d1d", icon: "🔴" },
  modérée:      { bg: "#fff7ed", border: "#fed7aa", color: "#7c2d12", icon: "🟠" },
  structurelle: { bg: "#faf5ff", border: "#e9d5ff", color: "#4c1d95", icon: "🔵" },
  faible:       { bg: "#f0fdf4", border: "#bbf7d0", color: "#14532d", icon: "🟢" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: 19, fontWeight: 800, margin: "0 0 16px", color: "#0f172a",
      paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block",
    }}>{children}</h2>
  );
}

export default async function SeancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seance = cmsData.seances.find(s => s.id === id) as Seance;
  if (!seance) notFound();

  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);
  const statut = STATUT_STYLE[seance.statut] ?? STATUT_STYLE.passe;

  const allSeances = [...cmsData.seances].reverse();
  const idx = allSeances.findIndex(s => s.id === id);
  const prev = allSeances[idx + 1] ?? null;
  const next = allSeances[idx - 1] ?? null;

  const deliberations: Deliberation[] = seance.deliberations ?? [];
  const pointsChauds: PointChaud[] = seance.points_chauds ?? [];
  const impactBruzois: string[] = seance.impact_bruzois ?? [];
  const aSurveiller: string[] = seance.a_surveiller ?? [];
  const sources: Source[] = seance.sources ?? [];

  const isPending = seance.statut === "a_venir" || (deliberations.length === 0 && !seance.resume_executif?.includes("disponible") === false);

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
              <a href="/bruz-en-action/conseils" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>← Conseils municipaux</a>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316" }}>
              Conseil municipal
            </span>
            <span style={{ padding: "3px 10px", borderRadius: 999, background: statut.bg, color: statut.color, fontSize: 12, fontWeight: 700 }}>
              {statut.label}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", maxWidth: 720 }}>
            {seance.titre}
          </h1>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>
            {formatDate(seance.date)} — {seance.lieu}
          </div>
          {seance.resume_executif && (
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.82)", maxWidth: 680, margin: "12px 0 0" }}>
              {seance.resume_executif}
            </p>
          )}
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "1fr minmax(0, 288px)", gap: 48, alignItems: "start" }}>

          {/* Colonne principale */}
          <div>

            {/* Contexte */}
            {seance.contexte && (
              <section style={{ marginBottom: 40 }}>
                <SectionTitle>Contexte</SectionTitle>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px" }}>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: "#334155" }}>{seance.contexte}</p>
                </div>
              </section>
            )}

            {/* Note si données manquantes */}
            {seance.note && (
              <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 18px", marginBottom: 32, fontSize: 14, color: "#713f12" }}>
                ℹ️ {seance.note}
              </div>
            )}

            {/* À retenir */}
            {seance.points_cles?.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <SectionTitle>À retenir</SectionTitle>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {seance.points_cles.map((pt: string, i: number) => (
                    <li key={i} style={{
                      display: "flex", gap: 12, padding: "13px 16px",
                      background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #e84d0e",
                      borderRadius: 8, fontSize: 15, lineHeight: 1.6, color: "#334155",
                    }}>
                      <span style={{ color: "#e84d0e", fontWeight: 800, flexShrink: 0 }}>→</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Délibérations */}
            {deliberations.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <SectionTitle>Délibérations votées</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {deliberations.map((d, i) => (
                    <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                        <div>
                          {d.numero && <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 8 }}>{d.numero}</span>}
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{d.titre}</span>
                        </div>
                        {d.vote && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, flexShrink: 0,
                            background: d.vote.toLowerCase().includes("unanim") ? "#f0fdf4" : d.vote.toLowerCase().includes("contre") ? "#fff7ed" : "#f8fafc",
                            color: d.vote.toLowerCase().includes("unanim") ? "#15803d" : d.vote.toLowerCase().includes("contre") ? "#c2410c" : "#475569",
                            border: `1px solid ${d.vote.toLowerCase().includes("unanim") ? "#bbf7d0" : d.vote.toLowerCase().includes("contre") ? "#fed7aa" : "#e2e8f0"}`,
                          }}>{d.vote}</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#475569" }}>{d.detail}</p>
                      {d.source_url && (
                        <a href={d.source_url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "#2563eb" }}>
                          Délibération complète (PDF) ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Points chauds */}
            {pointsChauds.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <SectionTitle>Points de débat</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pointsChauds.map((p, i) => {
                    const style = TENSION_STYLE[p.tension] ?? TENSION_STYLE.modérée;
                    return (
                      <div key={i} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 10, padding: "16px 20px" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: style.color, marginBottom: 8 }}>
                          {style.icon} {p.sujet}
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: style.color }}>{p.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Impact Bruzois */}
            {impactBruzois.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <SectionTitle>Ce que ça change pour les Bruzois</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {impactBruzois.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 12, padding: "13px 16px",
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                      borderRadius: 10, fontSize: 15, lineHeight: 1.6, color: "#14532d",
                    }}>
                      <span style={{ flexShrink: 0 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* À surveiller */}
            {aSurveiller.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <SectionTitle>Ce qu'on surveille ensuite</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {aSurveiller.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 12, padding: "13px 16px",
                      background: "#f8fafc", border: "1px solid #e2e8f0",
                      borderRadius: 10, fontSize: 15, lineHeight: 1.6, color: "#334155",
                    }}>
                      <span style={{ color: "#64748b", flexShrink: 0 }}>→</span>
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Navigation prev/next */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 48, paddingTop: 24, borderTop: "1px solid #e2e8f0" }}>
              {prev ? (
                <a href={`/bruz-en-action/conseils/${prev.id}`}
                  style={{ flex: 1, padding: "14px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, textDecoration: "none", color: "#0f172a" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>← CM précédent</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{prev.titre}</div>
                </a>
              ) : <div style={{ flex: 1 }} />}
              {next ? (
                <a href={`/bruz-en-action/conseils/${next.id}`}
                  style={{ flex: 1, padding: "14px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, textDecoration: "none", color: "#0f172a", textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>CM suivant →</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{next.titre}</div>
                </a>
              ) : <div style={{ flex: 1 }} />}
            </div>
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 24 }}>

            {/* Infos séance */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                La séance
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                <div><span style={{ color: "#94a3b8" }}>Date :</span> <strong>{formatDate(seance.date)}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Lieu :</span> {seance.lieu}</div>
                <div><span style={{ color: "#94a3b8" }}>Délibérations :</span> {deliberations.length > 0 ? `${deliberations.length} examinées` : "à venir"}</div>
              </div>
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                  Sources
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#2563eb", lineHeight: 1.5, textDecoration: "none", borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                      {s.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Liens officiels */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                Liens officiels
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="https://www.ville-bruz.fr/ma-ville-de-bruz/conseil-municipal/conseil-municipal/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>Conseil municipal (CRs + délibérations) ↗</a>
                <a href="https://data.megalis.bretagne.bzh/organization/commune-de-bruz" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>Open data Mégalis Bretagne ↗</a>
                <a href="https://www.youtube.com/playlist?list=PLnSe2hJFinqpupninWlKBHSmzmwLW-8i7" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>CMs en audio sur YouTube ↗</a>
              </div>
            </div>

            {/* CTA contribuer */}
            {isPending && (
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#0369a1" }}>Vous étiez à cette séance ?</h3>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>
                  Partagez vos notes, impressions ou documents avec Bruz en Action.
                </p>
                <a href={contact.hello_asso_url || "#"} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: "#0369a1", textDecoration: "underline" }}>
                  Nous contacter →
                </a>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: "#0f172a", color: "rgba(255,255,255,0.6)", padding: "32px 24px", textAlign: "center" }}>
        <a href="/bruz-en-action/conseils" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13 }}>
          ← Retour aux conseils municipaux — {association.nom}
        </a>
      </footer>
    </div>
  );
}
