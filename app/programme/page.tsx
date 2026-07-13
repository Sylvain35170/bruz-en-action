import programmeData from "../../data/programme.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "Programme — Bruz en Action",
  description: "Les 10 priorités du programme « Un nouvel élan pour Bruz » — mandat 2026-2032.",
  openGraph: {
    title: "Programme — Bruz en Action",
    description: "Les 10 priorités du programme « Un nouvel élan pour Bruz » — mandat 2026-2032.",
    url: "https://sylvain35170.github.io/bruz-en-action/programme",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

const PRIORITES = programmeData.priorites;
const PROGRAMME_META = programmeData.meta;

export default function ProgrammePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ background: "#0E2F62", padding: "16px 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "var(--container-max, 1120px)", margin: "0 auto" }}>
          <NavBar />
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1a4a8a 100%)", color: "#fff", padding: "48px 24px 40px" }}>
          <div style={{ maxWidth: "var(--container-max, 1120px)", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Mandat {PROGRAMME_META.mandat.replace("-", "–")}
                </p>
                <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                  « {PROGRAMME_META.liste} »
                </h1>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginTop: 12, maxWidth: 560 }}>
                  Les 10 priorités du programme présenté par Jean-René Houssin lors des élections municipales du 15 mars 2026.
                  Ce document est la source de référence pour le suivi des engagements.
                </p>
              </div>
              <a
                href={`/bruz-en-action/${PROGRAMME_META.pdf}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 20px", borderRadius: 8,
                  background: "#E8A040", color: "#0E2F62",
                  fontWeight: 700, fontSize: 14, textDecoration: "none",
                  flexShrink: 0, whiteSpace: "nowrap",
                }}
              >
                📄 Télécharger le programme (PDF)
              </a>
            </div>
          </div>
        </div>

        {/* Priorités */}
        <div style={{ maxWidth: "var(--container-max, 1120px)", margin: "0 auto", padding: "40px 24px 60px" }}>
          <div style={{ display: "grid", gap: 32 }}>
            {PRIORITES.map((p) => (
              <div key={p.num} style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                overflow: "hidden",
                borderLeft: `5px solid ${p.color}`,
              }}>
                {/* En-tête priorité */}
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 36, height: 36, borderRadius: "50%",
                      background: p.color, color: "#fff",
                      fontSize: 13, fontWeight: 800, flexShrink: 0,
                    }}>{p.num}</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "clamp(15px, 2.5vw, 18px)", fontWeight: 700, color: "#0f172a" }}>
                        {p.emoji} {p.titre}
                      </h2>
                      <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b", fontStyle: "italic" }}>{p.accroche}</p>
                    </div>
                  </div>
                </div>

                {/* Corps */}
                <div style={{ padding: "16px 24px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                  {/* Engagements */}
                  <div>
                    <h3 style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8" }}>
                      Nos engagements
                    </h3>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {p.engagements.map((e, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#334155", display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ color: p.color, flexShrink: 0, marginTop: 2 }}>•</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8" }}>
                      Nos actions
                    </h3>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {p.actions.map((a, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#334155", display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ color: p.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lien vers promesses */}
          <div style={{
            marginTop: 40, padding: "24px 28px",
            background: "#eff6ff", borderRadius: 12,
            border: "1px solid #bfdbfe",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 16, flexWrap: "wrap",
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: "#1e40af", fontSize: 15 }}>
                Suivre la réalisation de ces engagements
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#3b82f6" }}>
                Consultez le tableau de bord des 50 promesses du mandat et leur état d'avancement.
              </p>
            </div>
            <a href="/bruz-en-action/promesses"
              style={{
                padding: "10px 20px", borderRadius: 8,
                background: "#1d4ed8", color: "#fff",
                fontWeight: 700, fontSize: 14, textDecoration: "none",
                flexShrink: 0,
              }}>
              ✅ Tableau de bord promesses
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
