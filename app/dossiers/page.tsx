import dossiersData from "../../data/dossiers.json";
import metaData from "../../data/meta.json";
import SiteFooter from "../../components/SiteFooter";

const LOGO = "/bruz-en-action/logo.png";

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
};

const STATUT_LABEL: Record<string, string> = {
  en_cours: "En cours",
  publie: "Publié",
  a_venir: "À venir",
};

const CATEGORIE_COLOR: Record<string, string> = {
  Mobilités: "#0ea5e9",
  Urbanisme: "#8b5cf6",
  Finances: "#16a34a",
  "Équipements": "#f59e0b",
  "Services publics": "#ef4444",
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="/bruz-en-action" style={{ textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={140} height={44} style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 8px" }} />
            </a>
            <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <a href="/bruz-en-action/conseils" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>🏛️ Conseils</a>
              <a href="/bruz-en-action/carte" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>🗺️ Carte</a>
              <a href="/bruz-en-action" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>← Accueil</a>
              {contact.hello_asso_url && (
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

              return (
                <a key={d.id} href={href} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                  <div style={{
                    background: "#fff", border: "1px solid #e2e8f0",
                    borderTop: `3px solid ${d.featured ? "var(--brand-accent, #e84d0e)" : catColor}`,
                    borderRadius: 12, padding: 24,
                    display: "flex", flexDirection: "column", gap: 12, height: "100%",
                  }}>
                    {/* Méta */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 999,
                        background: `color-mix(in srgb, ${catColor} 10%, white)`,
                        color: catColor, fontSize: 11, fontWeight: 700,
                        letterSpacing: "0.07em", textTransform: "uppercase",
                      }}>{d.categorie}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        {d.featured && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--brand-accent, #e84d0e)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            ● Actif
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{STATUT_LABEL[d.statut] ?? d.statut}</span>
                      </div>
                    </div>

                    {/* Titre + chapeau */}
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>{d.titre}</h2>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d.chapeau}</p>

                    {/* Pied de carte */}
                    <div style={{
                      marginTop: "auto", paddingTop: 12,
                      borderTop: "1px solid #f1f5f9",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}>
                        {d.lien_externe ? "Ouvrir la carte →" : "Lire le dossier →"}
                      </span>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {newsCount > 0 && (
                          <span style={{ fontSize: 11, color: "#64748b" }}>
                            {newsCount} actu{newsCount > 1 ? "s" : ""}
                          </span>
                        )}
                        {d.last_activity && (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            Màj {new Date(d.last_activity).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        )}
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
