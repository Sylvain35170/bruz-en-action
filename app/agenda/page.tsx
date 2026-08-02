import evenementsData from "../../data/evenements.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";
import { THEMES_AGENDA, themeEvenement } from "../utils";

export const metadata = {
  title: "Agenda de Bruz — Bruz en Action",
  description: "Tous les rendez-vous à venir à Bruz, classés par thème : culture, médiathèque, rencontres citoyennes, solidarité, vie associative, sport.",
  openGraph: {
    title: "Agenda de Bruz — Bruz en Action",
    description: "Tous les rendez-vous à venir à Bruz, classés par thème : culture, médiathèque, rencontres citoyennes, solidarité, vie associative, sport.",
    url: "https://sylvain35170.github.io/bruz-en-action/agenda",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

type Evenement = {
  id: string;
  titre: string;
  date: string;
  date_fin?: string;
  categorie?: string;
  lieu?: string;
  organisateur?: string;
  note?: string;
  lien?: string;
  lien_label?: string;
};

function formatJour(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function formatPeriode(e: Evenement) {
  const debut = formatJour(e.date);
  if (!e.date_fin || e.date_fin === e.date) return debut;
  return `du ${debut} au ${formatJour(e.date_fin)}`;
}

export default function Agenda() {
  // Les dates sont des chaînes ISO : la comparaison lexicographique suffit et
  // évite le décalage de fuseau d'un new Date() en heure locale.
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const evenements = evenementsData.evenements as Evenement[];

  const aVenir = evenements
    .filter(e => (e.date_fin ?? e.date) >= aujourdhui)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Un thème sans événement à venir n'est pas affiché, mais « Autres » l'est
  // dès qu'il contient quelque chose : c'est le signal qu'un tag mairie est
  // apparu sans mapping.
  const parTheme = THEMES_AGENDA
    .map(th => ({ ...th, evts: aVenir.filter(e => themeEvenement(e.categorie) === th.id) }))
    .filter(th => th.evts.length > 0);

  const nonClasses = parTheme.find(th => th.id === "autres")?.evts.length ?? 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9fafb" }}>

      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      <div style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#E8A040", display: "block", marginBottom: 8 }}>
            Vie de la commune
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", color: "#fff" }}>
            Agenda de Bruz
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
            Tous les rendez-vous à venir, classés par thème. L&apos;agenda est alimenté
            automatiquement depuis le site de la Ville, complété à la main quand une
            information nous parvient autrement. La page d&apos;accueil n&apos;en montre que
            les quatre prochains.
          </p>

          <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            {[
              { val: aVenir.length, label: "rendez-vous à venir" },
              { val: parTheme.length, label: "thèmes" },
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
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>

          {aVenir.length === 0 && (
            <p style={{ fontSize: 15, color: "#64748b" }}>
              Aucun rendez-vous à venir n&apos;est actuellement recensé.
            </p>
          )}

          {/* Sommaire — évite de faire défiler toute la page pour trouver un thème */}
          {parTheme.length > 1 && (
            <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
              {parTheme.map(th => (
                <a key={th.id} href={`#${th.id}`} style={{
                  padding: "6px 14px", borderRadius: 999, background: "#fff",
                  border: `1px solid ${th.couleur}33`, color: th.couleur,
                  fontSize: 13, fontWeight: 600, textDecoration: "none",
                }}>
                  {th.label} <span style={{ opacity: 0.6 }}>{th.evts.length}</span>
                </a>
              ))}
            </nav>
          )}

          {parTheme.map(th => (
            <section key={th.id} id={th.id} style={{ marginBottom: 44, scrollMarginTop: 24 }}>
              <h2 style={{
                fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px",
                paddingLeft: 12, borderLeft: `4px solid ${th.couleur}`,
              }}>
                {th.label}
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px", paddingLeft: 16 }}>
                {th.evts.length} rendez-vous
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {th.evts.map(e => (
                  <article key={e.id} style={{
                    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                    padding: "16px 18px", borderLeft: `4px solid ${th.couleur}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: th.couleur }}>
                        {formatPeriode(e)}
                      </span>
                      {e.categorie && (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>· {e.categorie}</span>
                      )}
                    </div>
                    <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{e.titre}</p>
                    {(e.lieu || e.organisateur) && (
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#475569" }}>
                        {[e.lieu, e.organisateur].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {e.note && (
                      <p style={{ margin: "0 0 10px", fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{e.note}</p>
                    )}
                    {e.lien && (
                      <a href={e.lien} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                        {e.lien_label || "En savoir plus"} ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}

          {nonClasses > 0 && (
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
              {nonClasses} rendez-vous {nonClasses > 1 ? "sont regroupés" : "est regroupé"} sous
              « Autres rendez-vous » : leur catégorie n&apos;a pas encore de thème associé.
            </p>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
