import type { Metadata } from "next";
import metropoleData from "../../data/metropole.json";
import metaData from "../../data/meta.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Rennes Métropole & Bruz — Bruz en Action",
  description: "Les dossiers métropolitains qui impactent directement Bruz : T4, PLUiH, incinérateur, métro, eau, représentants.",
  openGraph: {
    title: "Rennes Métropole & Bruz — Bruz en Action",
    description: "Les dossiers métropolitains qui impactent directement Bruz : T4, PLUiH, incinérateur, métro, eau, représentants.",
    url: "https://sylvain35170.github.io/bruz-en-action/metropole",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

const CATEGORIE_COLORS: Record<string, string> = {
  "Mobilités": "#2563eb",
  "Urbanisme": "#7c3aed",
  "Environnement": "#059669",
  "Services publics": "#0891b2",
  "Gouvernance": "#374151",
};

export default function MetropolePage() {
  const { association } = metaData;
  const dossiers = metropoleData.dossiers;
  const featured = dossiers.filter(d => d.featured);
  const autres = dossiers.filter(d => !d.featured);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(232,77,14,0.2)", color: "#f97316", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Au-delà de la mairie
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", color: "#fff" }}>
            Rennes Métropole & Bruz
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 660, margin: "0 0 28px" }}>
            Beaucoup de décisions qui changent la vie des Bruzois ne se prennent pas à la mairie.
            Elles se votent au Conseil Métropolitain de Rennes — où Bruz n'a qu'une poignée de voix sur 43 communes.
            Ce sont ces décisions qu'on documente ici.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { n: dossiers.length, label: "Dossiers suivis", color: "#e84d0e" },
              { n: dossiers.filter(d => d.actus_recentes.length > 0).length, label: "Avec actus récentes", color: "#0284c7" },
              { n: dossiers.reduce((acc, d) => acc + d.lien_dossiers_communaux.length, 0), label: "Liens avec dossiers Bruz", color: "#7c3aed" },
            ].map(({ n, label, color }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 18px", textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color }}>{n}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contexte */}
      <section style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 24px" }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#e84d0e", marginBottom: 8 }}>Ce que décide Rennes Métropole</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Transports (T4, métro, bus)", "Urbanisme (PLUiH)", "Eau & assainissement", "Collecte des déchets", "Logement (PLH)", "Environnement"].map(comp => (
                  <span key={comp} style={{ fontSize: 12, padding: "4px 10px", background: "#f1f5f9", borderRadius: 999, color: "#475569", fontWeight: 500 }}>{comp}</span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#64748b", maxWidth: 380, lineHeight: 1.6 }}>
              Bruz est l'une des 43 communes de Rennes Métropole. Elle contribue financièrement à toutes ces compétences — et ses habitants en subissent les décisions au quotidien.
            </div>
          </div>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px" }}>

          {/* Dossiers featured */}
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Dossiers prioritaires</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20, marginBottom: 48 }}>
            {featured.map(d => {
              const color = CATEGORIE_COLORS[d.categorie] ?? "#64748b";
              return (
                <a key={d.id} href={`/bruz-en-action/metropole/${d.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${color}`, borderRadius: 12, padding: "24px", height: "100%", transition: "box-shadow 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color, background: `${color}15`, padding: "3px 8px", borderRadius: 999 }}>{d.categorie}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{d.id}</span>
                    </div>
                    <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{d.titre}</h3>
                    <p style={{ margin: "0 0 14px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d.chapeau}</p>
                    {d.lien_dossiers_communaux.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {d.lien_dossiers_communaux.map(id => (
                          <span key={id} style={{ fontSize: 11, padding: "2px 8px", background: "#f0f9ff", color: "#0369a1", borderRadius: 999, fontWeight: 600 }}>→ Dossier {id}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>

          {/* Autres dossiers */}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Autres sujets suivis</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {autres.map(d => {
              const color = CATEGORIE_COLORS[d.categorie] ?? "#64748b";
              return (
                <a key={d.id} href={`/bruz-en-action/metropole/${d.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `3px solid ${color}`, borderRadius: 10, padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{d.categorie}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{d.id}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{d.titre}</div>
                  </div>
                </a>
              );
            })}
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
