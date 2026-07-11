import bulletinsData from "../../data/bulletins.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "Publications municipales — Bruz en Action",
  description: "Bruz Mag et Semaine à Bruz : les bulletins d'information officiels de la mairie, classés par date, avec accès direct aux PDF.",
  openGraph: {
    title: "Publications municipales — Bruz en Action",
    description: "Bruz Mag et Semaine à Bruz : les bulletins d'information officiels de la mairie, classés par date, avec accès direct aux PDF.",
    url: "https://sylvain35170.github.io/bruz-en-action/publications",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

const TYPE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  bruz_mag:      { bg: "#faf5ff", color: "#7c3aed", label: "Bruz Mag" },
  semaine_bruz:  { bg: "#eff6ff", color: "#1d4ed8", label: "Semaine à Bruz" },
};

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function Publications() {
  const bulletins = [...bulletinsData.bulletins].sort((a, b) => b.date.localeCompare(a.date));
  const nBruzMag = bulletins.filter(b => b.type === "bruz_mag").length;
  const nSemaine = bulletins.filter(b => b.type === "semaine_bruz").length;

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
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 8 }}>
            Communication municipale
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", color: "#fff" }}>
            Publications municipales
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
            Bruz Mag (bimestriel) et Semaine à Bruz (bimensuel) : les bulletins d&apos;information officiels
            de la mairie, avec accès direct aux PDF. Distincts des séances de conseil municipal, suivies
            sur la page <a href="/bruz-en-action/conseils" style={{ color: "#fff", textDecoration: "underline" }}>Conseils municipaux</a>.
          </p>

          <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            {[
              { val: bulletins.length, label: "publications suivies" },
              { val: nBruzMag, label: "Bruz Mag" },
              { val: nSemaine, label: "Semaine à Bruz" },
            ].map(({ val, label }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#f97316" }}>{val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {bulletins.map(b => {
              const style = TYPE_STYLE[b.type] ?? TYPE_STYLE.bruz_mag;
              const pdfUrl = b.sources?.[0]?.url;
              return (
                <div key={b.id} style={{
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                  padding: "18px 20px", borderLeft: `4px solid ${style.color}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                    <span style={{ padding: "2px 10px", borderRadius: 999, background: style.bg, color: style.color, fontSize: 11, fontWeight: 700 }}>
                      {style.label}
                    </span>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{formatDateShort(b.date)}</span>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{b.titre}</p>
                  {b.points_cles?.length > 0 && (
                    <ul style={{ margin: "0 0 12px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {b.points_cles.slice(0, 5).map((pt: string, i: number) => (
                        <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                          <span style={{ color: style.color, fontWeight: 700, flexShrink: 0 }}>→</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {pdfUrl && (
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                      Télécharger le PDF ↗
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <SiteFooter />
    </div>
  );
}
