import type { Metadata } from "next";
import dossiers from "../../data/dossiers.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Glossaire — Bruz en Action",
  description: "Les sigles et notions de la vie municipale de Bruz expliqués simplement : DGF, TFB, CFU, CAF, FPIC…",
  openGraph: {
    title: "Glossaire — Bruz en Action",
    description: "Les sigles et notions de la vie municipale de Bruz expliqués simplement.",
    url: "https://sylvain35170.github.io/bruz-en-action/glossaire",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

type Entree = { terme: string; definition: string; dossierId: string; dossierTitre: string };

function buildGlossaire(): Entree[] {
  const entrees: Entree[] = [];
  dossiers.dossiers.forEach((d) => {
    const glossaire: { terme: string; definition: string }[] = (d as any).glossaire ?? [];
    glossaire.forEach((g) => {
      entrees.push({ ...g, dossierId: d.id, dossierTitre: d.titre });
    });
  });
  return entrees.sort((a, b) => a.terme.localeCompare(b.terme, "fr"));
}

export default function GlossairePage() {
  const entrees = buildGlossaire();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      <section style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#fff" }}>
            📖 Glossaire
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 640, margin: 0 }}>
            Les sigles et notions rencontrés dans nos dossiers, expliqués simplement — {entrees.length} terme{entrees.length > 1 ? "s" : ""} pour l'instant,
            au fil de l'instruction des dossiers.
          </p>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 56px" }}>
          {entrees.map((e, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{e.terme}</div>
              <p style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.7, color: "#334155" }}>{e.definition}</p>
              <a href={`/bruz-en-action/dossiers/${e.dossierId}`} style={{ fontSize: 12, fontWeight: 600, color: "#1A4177", textDecoration: "none" }}>
                📁 Dossier {e.dossierId} — {e.dossierTitre} →
              </a>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
