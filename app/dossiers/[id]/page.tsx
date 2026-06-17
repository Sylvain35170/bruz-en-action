import { notFound } from "next/navigation";
import dossiersData from "../../../data/dossiers.json";
import metaData from "../../../data/meta.json";

const LOGO = "/bruz-en-action/logo.png";

export function generateStaticParams() {
  return dossiersData.dossiers.map(d => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dossier = dossiersData.dossiers.find(d => d.id === id);
  if (!dossier) return {};
  return { title: `${dossier.titre} — Bruz en Action`, description: dossier.chapeau };
}

const STATUT_LABEL: Record<string, string> = {
  en_cours: "En cours",
  publie: "Publié",
  a_venir: "À venir",
};
const STATUT_COLOR: Record<string, string> = {
  en_cours: "#d97706",
  publie: "#16a34a",
  a_venir: "#64748b",
};

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dossier = dossiersData.dossiers.find(d => d.id === id);
  if (!dossier) notFound();

  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);

  const autresDossiers = dossiersData.dossiers.filter(d => d.id !== id).slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "var(--surface-page, #f9fafb)" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="/bruz-en-action" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={140} height={44} style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 8px" }} />
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

      {/* Hero dossier */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>{dossier.categorie}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: STATUT_COLOR[dossier.statut] ?? "#64748b" }}>
              ● {STATUT_LABEL[dossier.statut] ?? dossier.statut}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 20px", maxWidth: 720 }}>
            {dossier.titre}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.8)", maxWidth: 680, margin: 0 }}>
            {dossier.chapeau}
          </p>
          <p style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Ouvert le {new Date(dossier.date_ouverture).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      {/* Contenu */}
      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "1fr minmax(0, 320px)", gap: 48, alignItems: "start" }}>

          {/* Colonne principale */}
          <div>
            {dossier.points_cles.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 16px", color: "#0f172a" }}>Points clés</h2>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {dossier.points_cles.map((pt, i) => (
                    <li key={i} style={{
                      display: "flex", gap: 12, padding: "14px 16px",
                      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                      fontSize: 15, lineHeight: 1.6, color: "#334155",
                    }}>
                      <span style={{ color: "#38bdf8", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>→</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Bloc "contribuer" */}
            <section style={{
              padding: "24px", background: "#f0f9ff", border: "1px solid #bae6fd",
              borderRadius: 12, marginBottom: 40,
            }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0369a1" }}>
                📋 Vous avez des informations sur ce dossier ?
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#0c4a6e", lineHeight: 1.6 }}>
                Bruz en Action est une association citoyenne non partisane. Si vous avez connaissance de décisions, de documents publics ou de faits en lien avec ce dossier, contactez-nous.
              </p>
              <a href={contact.hello_asso_url || "https://www.helloasso.com/associations/bruz-en-action"}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 14, fontWeight: 600, color: "#0369a1", textDecoration: "underline" }}>
                Nous contacter via HelloAsso →
              </a>
            </section>
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 24 }}>

            {/* Sources */}
            {dossier.sources.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                  Sources
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {dossier.sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#2563eb", lineHeight: 1.4, textDecoration: "none", borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                      {s.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Liens utiles mairie */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                Liens officiels
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="https://www.ville-bruz.fr/" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "#2563eb" }}>Site Ville de Bruz ↗</a>
                <a href="https://www.ville-bruz.fr/ma-ville-de-bruz/conseil-municipal/conseil-municipal/" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "#2563eb" }}>Conseil municipal (CRs + délibérations) ↗</a>
                <a href="https://data.megalis.bretagne.bzh/organization/commune-de-bruz" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "#2563eb" }}>Open data Mégalis Bretagne ↗</a>
                <a href="https://www.youtube.com/playlist?list=PLnSe2hJFinqpupninWlKBHSmzmwLW-8i7" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "#2563eb" }}>CMs en audio sur YouTube ↗</a>
              </div>
            </div>

            {/* Autres dossiers */}
            {autresDossiers.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                  Autres dossiers
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {autresDossiers.map(d => (
                    <a key={d.id} href={`/bruz-en-action/dossiers/${d.id}`}
                      style={{ fontSize: 13, color: "#2563eb", lineHeight: 1.4 }}>
                      {d.titre}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: "#0f172a", color: "rgba(255,255,255,0.6)", padding: "32px 24px", textAlign: "center" }}>
        <a href="/bruz-en-action" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13 }}>
          ← Retour à l'accueil — {association.nom}
        </a>
      </footer>
    </div>
  );
}
