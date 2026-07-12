import type { Metadata } from "next";
import institutionsData from "../../data/institutions.json";
import dossiersData from "../../data/dossiers.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";
import { NIVEAU_CONFIG } from "../utils";

export const metadata: Metadata = {
  title: "Qui fait quoi ? Commune, métropole, département, État — Bruz en Action",
  description: "Qui décide de quoi à Bruz : compétences de la commune, de Rennes Métropole, du département, de la région et de l'État — et rôles du maire, des adjoints et du conseil municipal.",
  openGraph: {
    title: "Qui fait quoi ? Commune, métropole, département, État — Bruz en Action",
    description: "Qui décide de quoi à Bruz : compétences de chaque échelon et rôles des élus municipaux.",
    url: "https://sylvain35170.github.io/bruz-en-action/qui-fait-quoi",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

const DOSSIER_TITRES: Record<string, string> = Object.fromEntries(
  dossiersData.dossiers.map(d => [d.id, d.titre])
);

export default function QuiFaitQuoiPage() {
  const { meta, echelons, roles_municipaux } = institutionsData;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(232,77,14,0.2)", color: "#f97316", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Comprendre les institutions
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", color: "#fff" }}>
            Qui fait quoi ?
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 680, margin: "0 0 28px" }}>
            {meta.chapeau}
          </p>
          {/* Légende des niveaux */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 8 }}>
            {echelons.map(e => {
              const cfg = NIVEAU_CONFIG[e.id];
              return (
                <a key={e.id} href={`#${e.id}`} style={{
                  fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none",
                  background: cfg?.couleur ?? "#64748b", padding: "5px 12px", borderRadius: 999,
                }}>
                  {e.badge}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px" }}>

          {/* Échelons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 56 }}>
            {echelons.map(e => {
              const couleur = NIVEAU_CONFIG[e.id]?.couleur ?? "#64748b";
              return (
                <section key={e.id} id={e.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${couleur}`, borderRadius: 12, padding: "28px 28px 24px", scrollMarginTop: 90 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                      color: couleur, background: `${couleur}14`, padding: "3px 10px", borderRadius: 999,
                    }}>
                      {e.badge}
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{e.portee}</span>
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>{e.nom}</h2>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: "0 0 18px", maxWidth: 760 }}>{e.description}</p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginBottom: 18 }}>
                    {e.competences.map((c, i) => (
                      <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{c.domaine}</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{c.detail}</div>
                        {"dossier_id" in c && c.dossier_id && DOSSIER_TITRES[c.dossier_id] && (
                          <a href={`/bruz-en-action/dossiers/${c.dossier_id}`} style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                            → Dossier {c.dossier_id} : {DOSSIER_TITRES[c.dossier_id]}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ background: `${couleur}0d`, borderLeft: `3px solid ${couleur}`, borderRadius: "0 8px 8px 0", padding: "12px 16px", fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                    <strong>À retenir :</strong> {e.a_retenir}
                    {e.id === "metropole" && (
                      <> <a href="/bruz-en-action/metropole" style={{ color: "#2563eb", fontWeight: 600 }}>Voir les dossiers métropolitains →</a></>
                    )}
                  </div>
                  {"note" in e && e.note && (
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, margin: "12px 0 0" }}>{e.note}</p>
                  )}
                </section>
              );
            })}
          </div>

          {/* Rôles municipaux */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>Et à l'intérieur de la mairie ?</h2>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, maxWidth: 760, margin: "0 0 24px" }}>
              {roles_municipaux.intro}{" "}
              <a href="/bruz-en-action/elus" style={{ color: "#2563eb", fontWeight: 600 }}>Voir la liste des 33 élus et leurs délégations →</a>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {roles_municipaux.roles.map(r => (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "22px 26px" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 2px" }}>{r.titre}</h3>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>{r.qui}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
                    {r.points.map((p, i) => (
                      <li key={i} style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Droits & devoirs */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 20px" }}>Droits et devoirs des élus</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: "3px solid #059669", borderRadius: 12, padding: "22px 26px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#059669", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Leurs droits</h3>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  {roles_municipaux.droits_devoirs.droits.map((d, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>{d}</li>
                  ))}
                </ul>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: "3px solid #E8A040", borderRadius: 12, padding: "22px 26px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#b45309", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Leurs devoirs</h3>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  {roles_municipaux.droits_devoirs.devoirs.map((d, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Sources */}
          <section style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 10 }}>Sources</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
              {meta.sources.map((s, i) => (
                <li key={i} style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>{s.label} ↗</a>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>Dernière mise à jour : {new Date(meta.derniere_maj).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          </section>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
