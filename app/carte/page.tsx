import metaData from "../../data/meta.json";
import dossiersData from "../../data/dossiers.json";
import MapWrapper from "../../components/MapWrapper";

const LOGO = "/bruz-en-action/logo.png";

const d05 = dossiersData.dossiers.find(d => d.id === "D05");

export const metadata = {
  title: "Carte de Bruz — Bruz en Action",
  description: "Carte interactive de Bruz : zones ZAC Multisites, corridor trambus T4 et équipements.",
};

export default function CartePage() {
  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-page, #f9fafb)" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="/bruz-en-action" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={140} height={44}
                style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 8px" }} />
            </a>
            <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <a href="/bruz-en-action" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                ← Accueil
              </a>
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

      {/* ── TITRE ── */}
      <div style={{ background: "var(--surface-card, #fff)", borderBottom: "1px solid #e2e8f0", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 8 }}>
            Urbanisme · Projets
          </span>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a" }}>
            Carte de Bruz — projets &amp; quartiers
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: "#64748b", maxWidth: 640, lineHeight: 1.6 }}>
            Visualisation des zones de projet actives sur la commune : ZAC Multisites (1 700 logements à horizon 2040) et corridor Trambus T4.
            Tous les tracés sont <strong>indicatifs</strong> — sources mairie et Rennes Métropole.
          </p>
        </div>
      </div>

      {/* ── CARTE ── */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px", width: "100%", boxSizing: "border-box", flex: 1 }}>

        {/* Légende */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16, padding: "12px 16px", background: "var(--surface-card, #fff)", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ display: "inline-block", width: 20, height: 4, background: "#f97316", borderRadius: 2, opacity: 0.7 }} />
            ZAC Multisites (6 secteurs)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ display: "inline-block", width: 20, height: 4, background: "#7c3aed", borderRadius: 2, borderTop: "2px dashed #7c3aed" }} />
            Corridor Trambus T4
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>🏛️ ⚽ 📚 Équipements</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
            Cliquer sur les zones pour plus d'infos
          </span>
        </div>

        {/* Carte Leaflet */}
        <div style={{ height: 540, borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <MapWrapper />
        </div>

        {/* Blocs info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 28 }}>

          {/* ZAC */}
          <div style={{ background: "var(--surface-card, #fff)", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, borderTop: "3px solid #f97316" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>ZAC Multisites</h2>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
              Projet d'aménagement phare du mandat : 6 secteurs distribués sur la commune pour accueillir ~1 700 logements neufs à l'horizon 2040. Un enjeu clé pour la croissance de Bruz.
            </p>
            <ul style={{ margin: 0, padding: "0 0 0 1.2em", fontSize: 13, color: "#475569", display: "flex", flexDirection: "column", gap: 4 }}>
              <li>6 secteurs — périmètres validés en CM</li>
              <li>~1 700 logements programmés</li>
              <li>Mixité imposée : logement social + accession</li>
            </ul>
            <a href="/bruz-en-action/dossiers/D02" style={{ display: "inline-block", marginTop: 14, fontSize: 12, fontWeight: 600, color: "#f97316" }}>
              Lire le dossier ZAC →
            </a>
          </div>

          {/* T4 */}
          <div style={{ background: "var(--surface-card, #fff)", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, borderTop: "3px solid #7c3aed" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Trambus T4</h2>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
              Projet de transport en commun en site propre reliant Rennes à Bruz. La localisation exacte du terminus bruzois est un enjeu politique du mandat — le centre-ville est demandé par la municipalité.
            </p>
            <ul style={{ margin: 0, padding: "0 0 0 1.2em", fontSize: 13, color: "#475569", display: "flex", flexDirection: "column", gap: 4 }}>
              <li>Tracé indicatif — données Rennes Métropole</li>
              <li>Terminus cible : centre-bourg de Bruz</li>
              <li>Calendrier : horizon 2030+</li>
            </ul>
            <a href="/bruz-en-action/dossiers/D01" style={{ display: "inline-block", marginTop: 14, fontSize: 12, fontWeight: 600, color: "#7c3aed" }}>
              Lire le dossier T4 →
            </a>
          </div>

          {/* Sources */}
          {d05 && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Sources</h2>
              <ul style={{ margin: 0, padding: "0 0 0 1.2em", fontSize: 13, color: "#475569", display: "flex", flexDirection: "column", gap: 6 }}>
                {d05.sources.map((s, i) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
              <p style={{ margin: "12px 0 0", fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                Périmètres et tracés indicatifs — données à affiner avec les documents officiels de la commune et de Rennes Métropole.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0f172a", color: "rgba(255,255,255,0.5)", marginTop: "auto" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12 }}>© {association.fondee_en} {association.nom} · Association loi 1901</span>
          <a href="/bruz-en-action" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Retour accueil</a>
        </div>
      </footer>
    </div>
  );
}
