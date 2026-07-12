import elusData from "../../data/elus.json";
import metaData from "../../data/meta.json";
import institutionsData from "../../data/institutions.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";
import { formatNomPrenom } from "../utils";

export const metadata = {
  title: "Élus municipaux — Bruz en Action",
  description: "Composition du conseil municipal de Bruz 2026-2032 : maire, adjoints, conseillers délégués, opposition.",
  openGraph: {
    title: "Élus municipaux — Bruz en Action",
    description: "Composition du conseil municipal de Bruz 2026-2032 : maire, adjoints, conseillers délégués, opposition.",
    url: "https://sylvain35170.github.io/bruz-en-action/elus",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

export default function Elus() {
  const { elus, composition } = elusData;
  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);
  const maire = elus.find(e => e.type === "maire");
  const roleMaire = institutionsData.roles_municipaux.roles.find(r => r.id === "maire");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#E8A040", display: "block", marginBottom: 8 }}>
            Démocratie locale
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#fff" }}>
            Conseil municipal 2026–2032
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            33 élus — élection du {new Date(composition.date_election).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          {/* Stats élection */}
          <div style={{ display: "flex", gap: 20, marginTop: 28, flexWrap: "wrap" }}>
            {[
              { val: `${composition.majorite.sieges}/33`, label: "sièges majorité", sub: composition.majorite.score },
              { val: `${composition.opposition.sieges}/33`, label: "sièges opposition", sub: composition.opposition.liste },
              { val: composition.participation, label: "participation", sub: "1er tour" },
            ].map(({ val, label, sub }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 20px" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#E8A040" }}>{val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main style={{ flex: 1, maxWidth: 1120, margin: "0 auto", padding: "48px 24px", width: "100%" }}>

        {/* Le maire et ses pouvoirs */}
        {maire && roleMaire && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 20px", paddingBottom: 10, borderBottom: "2px solid #E8A040", display: "inline-block" }}>
              Le maire
            </h2>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "4px solid #E8A040", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                <p style={{ margin: 0, fontWeight: 800, color: "#0f172a", fontSize: 19 }}>{formatNomPrenom(maire.nom)}</p>
                <p style={{ margin: 0, fontSize: 14, color: "#2563eb", fontWeight: 600 }}>{maire.role}</p>
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "#94a3b8" }}>{roleMaire.qui}</p>
              {maire.citations && maire.citations.length > 0 && (
                <p style={{ margin: "0 0 22px", fontSize: 14, color: "#475569", fontStyle: "italic", lineHeight: 1.6 }}>
                  « {maire.citations[0].texte} »
                  <span style={{ fontStyle: "normal", fontSize: 12, color: "#94a3b8" }}> — {maire.citations[0].source}</span>
                </p>
              )}

              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 14px" }}>
                Ce qu&apos;il peut faire — ses pouvoirs
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                {roleMaire.points.map((p, i) => (
                  typeof p === "string" ? (
                    <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#475569", lineHeight: 1.55 }}>{p}</div>
                  ) : (
                    <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{p.titre}</div>
                      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{p.detail}</div>
                    </div>
                  )
                ))}
              </div>

              {"garde_fous" in roleMaire && roleMaire.garde_fous && (
                <div style={{ marginTop: 16, background: "#fffbeb", borderLeft: "3px solid #E8A040", borderRadius: "0 8px 8px 0", padding: "12px 16px", fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                  <strong>Garde-fous :</strong> {roleMaire.garde_fous}
                </div>
              )}

              <p style={{ margin: "16px 0 0", fontSize: 13 }}>
                <a href="/bruz-en-action/qui-fait-quoi" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                  → Comprendre qui fait quoi : maire, adjoints, conseil, métropole
                </a>
              </p>
            </div>
          </section>
        )}

        {/* Adjoints */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 20px", paddingBottom: 10, borderBottom: "2px solid #E8A040", display: "inline-block" }}>
            Les 9 adjoints
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {elus.filter(e => e.type === "adjoint").map(elu => (
              <div key={elu.id} style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px",
                borderLeft: "4px solid #3b82f6",
              }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{formatNomPrenom(elu.nom)}</p>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#2563eb", fontWeight: 600 }}>{elu.role}</p>
                {elu.delegation && <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{elu.delegation}</p>}
                {elu.citations && elu.citations.length > 0 && (
                  <p style={{ margin: "10px 0 0", fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 1.5 }}>
                    « {elu.citations[0].texte} »
                    {elu.citations[0].lien && <> <a href={elu.citations[0].lien} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>↗</a></>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Conseillers délégués */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 20px", paddingBottom: 10, borderBottom: "2px solid #E8A040", display: "inline-block" }}>
            Conseillers délégués
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {elus.filter(e => e.type === "delegue").map(elu => (
              <div key={elu.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px" }}>
                <p style={{ margin: "0 0 3px", fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{formatNomPrenom(elu.nom)}</p>
                {elu.delegation && <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{elu.delegation}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Majorité + Opposition */}
        <div className="bea-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 14px" }}>
              Conseillers — Majorité
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
              {elus.filter(e => e.type === "conseiller" && e.groupe === "majorite").map(e => (
                <span key={e.id} style={{ fontSize: 14, color: "#334155" }}>{formatNomPrenom(e.nom)}</span>
              ))}
            </div>
          </section>

          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", borderLeft: "4px solid #94a3b8" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 14px" }}>
              Opposition — {composition.opposition.sieges} sièges · {composition.opposition.liste}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 12 }}>
              {elus.filter(e => e.groupe === "opposition").map(e => (
                <span key={e.id} style={{ fontSize: 14, color: "#334155" }}>
                  {formatNomPrenom(e.nom)}{e.nom === "Philippe Salmon" ? " (ex-maire)" : ""}
                </span>
              ))}
            </div>
            <a href="https://bruz2026.fr" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>Site de l'opposition ↗</a>
          </section>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: "#94a3b8" }}>
          Source : <a href="https://www.ville-bruz.fr/wp-content/uploads/2026/05/Bruz-Mag-n%C2%B0260-de-mai-juin-2026.pdf" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Bruz Mag n°260 (mai-juin 2026)</a>
          {" · "}
          <a href="https://www.ville-bruz.fr/actualites/decouvrez-les-elus-du-conseil-municipal-de-bruz/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Page officielle ↗</a>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
