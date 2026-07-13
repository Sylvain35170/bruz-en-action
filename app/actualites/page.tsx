import actusData from "../../data/actus.json";
import dossiersData from "../../data/dossiers.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";
import ActualitesList from "../../components/ActualitesList";
import type { Actu } from "../../types";

export const metadata = {
  title: "Actualités — Bruz en Action",
  description: "Toutes les actualités de la veille citoyenne : presse locale, communications de la mairie, décisions et analyses — filtrables par type et par dossier.",
  openGraph: {
    title: "Actualités — Bruz en Action",
    description: "Toutes les actualités de la veille citoyenne : presse locale, communications de la mairie, décisions et analyses — filtrables par type et par dossier.",
    url: "https://sylvain35170.github.io/bruz-en-action/actualites",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

export default function Actualites() {
  const { actus } = actusData as { actus: Actu[]; meta: unknown };
  const dossierTitres: Record<string, string> = Object.fromEntries(
    dossiersData.dossiers.map(d => [d.id, d.titre])
  );
  const sources = new Set(actus.map(a => a.source_label).filter(Boolean));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9fafb" }}>

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#E8A040", display: "block", marginBottom: 8 }}>
            Veille citoyenne
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", color: "#fff" }}>
            Toutes les actualités
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
            L&apos;archive complète de la veille : presse locale, communications de la mairie,
            décisions et analyses. Chaque item est validé en revue éditoriale avant publication.
          </p>

          {/* Stats rapides */}
          <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            {[
              { val: actus.length, label: "actualités publiées" },
              { val: sources.size, label: "sources" },
              { val: actus.filter(a => a.dossier).length, label: "reliées à un dossier" },
            ].map(({ val, label }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#E8A040" }}>{val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main style={{ flex: 1 }}>
        <ActualitesList actus={actus} dossierTitres={dossierTitres} />
      </main>

      <SiteFooter />
    </div>
  );
}
