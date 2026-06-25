import dossiersData from "../../data/dossiers.json";
import metaData from "../../data/meta.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "Dossiers — Bruz en Action",
  description: "Tous les dossiers thématiques suivis par Bruz en Action : T4, ZAC, finances, fiscalité…",
  openGraph: {
    title: "Dossiers — Bruz en Action",
    description: "Tous les dossiers thématiques suivis par Bruz en Action : T4, ZAC, finances, fiscalité…",
    url: "https://sylvain35170.github.io/bruz-en-action/dossiers",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

type Dossier = typeof dossiersData.dossiers[0] & {
  featured?: boolean;
  last_activity?: string;
  lien_externe?: string;
  actus_recentes?: { date: string; titre: string }[];
  chapeau?: string;
};

const STATUT_LABEL: Record<string, string> = {
  en_cours: "En cours",
  publie: "Publié",
  a_venir: "À venir",
};

const CATEGORIE_COLOR: Record<string, string> = {
  Mobilités: "#0369a1",
  Urbanisme: "#6d28d9",
  Finances: "#15803d",
  Équipements: "#b45309",
  "Services publics": "#dc2626",
  Environnement: "#059669",
  Éducation: "#ea580c",
  Sécurité: "#374151",
  Culture: "#be185d",
  Patrimoine: "#65a30d",
};

export default function DossiersPage() {
  const { association, contact } = metaData;
  const dossiers = dossiersData.dossiers as Dossier[];

  const sorted = [...dossiers].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    const ad = a.last_activity ?? a.date_ouverture;
    const bd = b.last_activity ?? b.date_ouverture;
    return bd.localeCompare(ad);
  });

  const categories = Array.from(new Set(dossiers.map(d => d.categorie)));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-page, #f9fafb)" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)" }}>
            Enquêtes &amp; analyses
          </span>
          <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, lineHeight: 1.2, margin: "12px 0 16px", color: "#fff" }}>
            Tous les dossiers
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", maxWidth: 620, margin: "0 0 24px", lineHeight: 1.7 }}>
            {dossiers.length} dossiers thématiques — sources vérifiables uniquement, mis à jour en continu selon l&apos;actualité municipale.
          </p>
          {/* Filtres catégories */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map(cat => (
              <span key={cat} style={{
                padding: "4px 12px", borderRadius: 999,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600,
              }}>
                {cat} · {dossiers.filter(d => d.categorie === cat).length}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Grille */}
      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 24 }}>
            {sorted.map(d => {
              const newsCount = d.actus_recentes?.length ?? 0;
              const catColor = CATEGORIE_COLOR[d.categorie] ?? "#64748b";
              const href = d.lien_externe ?? `/bruz-en-action/dossiers/${d.id}`;

              const lastActu = d.actus_recentes?.[0];
              const lastActuDate = lastActu?.date
                ? new Date(lastActu.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                : null;

              return (
                <a key={d.id} href={href} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                  <div style={{
                    border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden",
                    display: "flex", flexDirection: "column", height: "100%",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.15s",
                  }}>
                    {/* Bandeau coloré — catégorie + titre */}
                    <div style={{
                      background: catColor,
                      padding: "20px 20px 18px",
                      position: "relative",
                    }}>
                      {d.featured && (
                        <span style={{
                          position: "absolute", top: 12, right: 12,
                          fontSize: 10, fontWeight: 700, color: "#fff",
                          background: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: 999,
                          letterSpacing: "0.06em", textTransform: "uppercase",
                        }}>● Actif</span>
                      )}
                      <span style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: "rgba(255,255,255,0.75)",
                        display: "block", marginBottom: 8,
                      }}>{d.categorie}</span>
                      <h2 style={{
                        margin: 0, fontSize: 15, fontWeight: 700, color: "#fff",
                        lineHeight: 1.4,
                      }}>{d.titre}</h2>
                    </div>

                    {/* Corps blanc */}
                    <div style={{
                      background: "#fff", padding: "16px 20px",
                      display: "flex", flexDirection: "column", gap: 12, flex: 1,
                    }}>
                      {/* Chapeau tronqué */}
                      {d.chapeau && (
                        <p style={{
                          margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6,
                          display: "-webkit-box", WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                        }}>{d.chapeau}</p>
                      )}

                      {/* Dernière actu */}
                      {lastActu && (
                        <div style={{
                          borderLeft: `3px solid ${catColor}`, paddingLeft: 10,
                          marginTop: 4,
                        }}>
                          <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                            Dernière actu · {lastActuDate}
                          </span>
                          <p style={{
                            margin: "3px 0 0", fontSize: 12, color: "#334155", lineHeight: 1.5,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                          }}>{lastActu.titre}</p>
                        </div>
                      )}

                      {/* Pied */}
                      <div style={{
                        marginTop: "auto", paddingTop: 12,
                        borderTop: "1px solid #f1f5f9",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: catColor }}>
                          {d.lien_externe ? "Ouvrir la carte →" : "Lire le dossier →"}
                        </span>
                        <span style={{
                          fontSize: 11, color: "#94a3b8",
                          padding: "2px 8px", borderRadius: 999, background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}>
                          {STATUT_LABEL[d.statut] ?? d.statut}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Note bas de page */}
          <p style={{ marginTop: 40, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
            Les dossiers marqués <strong style={{ color: "var(--brand-accent, #e84d0e)" }}>● Actif</strong> remontent automatiquement en tête selon les dernières actualités collectées.
          </p>
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
