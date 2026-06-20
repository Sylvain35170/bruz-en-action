import cmsData from "../../data/cms.json";
import elusData from "../../data/elus.json";
import metaData from "../../data/meta.json";
import SiteFooter from "../../components/SiteFooter";

const LOGO = "/bruz-en-action/logo.png";

export const metadata = {
  title: "Conseils municipaux — Bruz en Action",
  description: "Suivi des séances du conseil municipal de Bruz 2026-2031 : résumés, délibérations, décisions de Rennes Métropole impactant Bruz.",
  openGraph: {
    title: "Conseils municipaux — Bruz en Action",
    description: "Suivi des séances du conseil municipal de Bruz 2026-2031 : résumés, délibérations, décisions de Rennes Métropole impactant Bruz.",
    url: "https://sylvain35170.github.io/bruz-en-action/conseils",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

const STATUT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  a_venir:  { bg: "#eff6ff", color: "#1d4ed8", label: "À venir" },
  passe:    { bg: "#f0fdf4", color: "#15803d", label: "Passé" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function Conseils() {
  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);
  const seancesPasses = cmsData.seances.filter(s => s.statut === "passe").reverse();
  const seancesAvenir = cmsData.seances.filter(s => s.statut === "a_venir");
  const metroDecisions = (cmsData as typeof cmsData & { conseil_metropolitain?: { id: string; date: string; titre: string; impact_bruz: string; points_cles: string[]; sources: { label: string; url: string }[] }[] }).conseil_metropolitain ?? [];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9fafb" }}>

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <a href="/bruz-en-action" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={140} height={44}
                style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 8px" }} />
            </a>
            <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <a href="/bruz-en-action" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>← Accueil</a>
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

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 8 }}>
            Démocratie locale
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", color: "#fff" }}>
            Conseils municipaux 2026–2031
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
            Résumés des séances, délibérations clés et décisions de Rennes Métropole impactant Bruz.
            Sources : délibérations open data (Mégalis Bretagne), Bruz Mag, séances audio YouTube.
          </p>

          {/* Stats rapides */}
          <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            {[
              { val: cmsData.seances.filter(s => s.statut === "passe").length, label: "séances passées" },
              { val: cmsData.seances.filter(s => s.statut === "a_venir").length, label: "à venir" },
              { val: metroDecisions.length, label: "décision métropole" },
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
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "1fr minmax(0, 300px)", gap: 40, alignItems: "start" }}>

          {/* COLONNE PRINCIPALE */}
          <div>

            {/* PROCHAINS CMs */}
            {seancesAvenir.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  📅 Prochaines séances
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {seancesAvenir.map(cm => (
                    <a key={cm.id} href={`/bruz-en-action/conseils/${cm.id}`} style={{ textDecoration: "none", display: "block" }}>
                      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 20px", borderLeft: "4px solid #3b82f6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, color: "#1e40af", fontSize: 15 }}>{formatDate(cm.date)}</span>
                          <span style={{ padding: "2px 10px", borderRadius: 999, background: "#3b82f6", color: "#fff", fontSize: 11, fontWeight: 700 }}>À venir</span>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#1e3a8a" }}>{cm.lieu}</p>
                        <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 600, color: "#2563eb" }}>Ce qu'on attend de cette séance →</p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* SÉANCES PASSÉES */}
            <section style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
                📋 Séances passées
              </h2>

              <div style={{ position: "relative", paddingLeft: 36 }}>
                {/* Ligne verticale */}
                <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "#e2e8f0", borderRadius: 2 }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {seancesPasses.map((cm, idx) => {
                    const hasPts = cm.points_cles && cm.points_cles.length > 0;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const ytUrl: string | undefined = (cm as any).youtube_url;
                    return (
                      <div key={cm.id} style={{ position: "relative", paddingBottom: idx < seancesPasses.length - 1 ? 28 : 0 }}>
                        {/* Dot */}
                        <div style={{
                          position: "absolute", left: -32, top: 6,
                          width: 14, height: 14, borderRadius: "50%",
                          background: hasPts ? "#3b82f6" : "#cbd5e1",
                          border: "2px solid #fff", boxShadow: `0 0 0 2px ${hasPts ? "#3b82f6" : "#cbd5e1"}`,
                        }} />

                        <div style={{
                          background: "#fff", border: "1px solid #e2e8f0",
                          borderRadius: 12, padding: "18px 20px",
                          borderTop: `3px solid ${hasPts ? "#3b82f6" : "#e2e8f0"}`,
                        }}>
                          {/* En-tête */}
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: hasPts ? 12 : 4, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{formatDateShort(cm.date)}</span>
                            <span style={{ fontSize: 13, color: "#475569", fontWeight: 500, flex: 1 }}>{cm.titre}</span>
                            {ytUrl && (
                              <a href={ytUrl} target="_blank" rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                                ▶ YouTube
                              </a>
                            )}
                          </div>

                          {/* Points clés */}
                          {hasPts && (
                            <ul style={{ margin: "0 0 12px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                              {cm.points_cles.slice(0, 3).map((pt: string, i: number) => (
                                <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                                  <span style={{ color: "#3b82f6", fontWeight: 700, flexShrink: 0 }}>→</span>
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Lien fiche */}
                          <a href={`/bruz-en-action/conseils/${cm.id}`} style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                            Détail →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CONSEIL MÉTROPOLITAIN */}
            {metroDecisions.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    🏙️ Rennes Métropole — décisions impactant Bruz
                  </h2>
                  <span style={{ padding: "3px 10px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    Nouveau
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
                  La commune de Bruz appartient à Rennes Métropole (53 communes). Certaines décisions métropolitaines
                  s&apos;imposent à la commune — tracé T4, ZAC Ker Lann, PLUiH, budget transports...
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {metroDecisions.map(decision => (
                    <div key={decision.id} style={{
                      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                      padding: "20px 22px", borderLeft: "4px solid #8b5cf6",
                    }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{formatDateShort(decision.date)}</span>
                        <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>{decision.titre}</span>
                        <span style={{ marginLeft: "auto", padding: "2px 10px", borderRadius: 999, background: "#faf5ff", color: "#7c3aed", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                          Impact {decision.impact_bruz}
                        </span>
                      </div>

                      <ul style={{ margin: "0 0 12px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                        {decision.points_cles.map((pt, i) => (
                          <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                            <span style={{ color: "#8b5cf6", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>

                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {decision.sources.map((s, i) => (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12, color: "#2563eb", textDecoration: "none" }}>
                            {s.label} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Accès direct délibérations */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>Délibérations en open data</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: "0 0 14px" }}>
                Toutes les délibérations de Bruz sont publiées sur Mégalis Bretagne (plateforme régionale d&apos;open data).
              </p>
              <a href={cmsData.meta.deliberations_megalis} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                Mégalis Bretagne — Bruz ↗
              </a>
            </div>

            {/* Audio YouTube */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>Séances en audio</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: "0 0 14px" }}>
                Les conseils municipaux sont enregistrés et publiés sur la chaîne YouTube officielle de la Ville de Bruz.
              </p>
              <a href={cmsData.meta.youtube} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626", textDecoration: "none", fontWeight: 600 }}>
                ▶ YouTube — Ville de Bruz ↗
              </a>
            </div>

            {/* Venir aux CMs */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#14532d", margin: "0 0 10px" }}>Assister aux séances</h3>
              <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, margin: "0 0 10px" }}>
                Les séances sont ouvertes au public. Lieu : Halle Pagnol, Bruz (pendant les travaux de l&apos;Hôtel de Ville).
              </p>
              <a href="https://www.ville-bruz.fr/ma-ville-de-bruz/conseil-municipal/conseil-municipal/" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>
                Calendrier sur ville-bruz.fr ↗
              </a>
            </div>

            {/* Qui sont les élus */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>Le conseil en chiffres</h3>
              {[
                { label: "Élus au total", val: elusData.composition.total_sieges },
                { label: "Majorité (Houssin)", val: `${elusData.composition.majorite.sieges} sièges` },
                { label: "Opposition (Bruz avec vous)", val: `${elusData.composition.opposition.sieges} sièges` },
                { label: "Femmes", val: "17 / 33" },
                { label: "Âge moyen", val: "57 ans" },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{val}</span>
                </div>
              ))}
              <a href="/bruz-en-action#elus" style={{ display: "inline-block", marginTop: 12, fontSize: 12, color: "#2563eb" }}>
                Voir tous les élus →
              </a>
            </div>

          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <SiteFooter />
    </div>
  );
}
