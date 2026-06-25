import type { Metadata } from "next";
import metaData from "../../data/meta.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Liens utiles — Bruz en Action",
  description: "Mairie, Bruz Mag, Mégalis, Rennes Métropole, presse locale, données ouvertes — tous les liens utiles pour suivre la vie à Bruz.",
  openGraph: {
    title: "Liens utiles — Bruz en Action",
    description: "Mairie, Bruz Mag, Mégalis, Rennes Métropole, presse locale, données ouvertes — tous les liens utiles pour suivre la vie à Bruz.",
    url: "https://sylvain35170.github.io/bruz-en-action/liens",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

const SECTIONS = [
  {
    titre: "Mairie de Bruz",
    icon: "🏛️",
    liens: [
      { label: "Site officiel", url: "https://www.ville-bruz.fr/", desc: "Actualités, services, agenda" },
      { label: "Conseil municipal — délibérations", url: "https://www.ville-bruz.fr/ma-ville-de-bruz/conseil-municipal/conseil-municipal/", desc: "Comptes-rendus et délibérations officielles" },
      { label: "Bruz Mag & Bulletins municipaux", url: "https://www.ville-bruz.fr/ma-ville-de-bruz/bulletins-municipaux/", desc: "Bruz Mag (bimestriel) + La Semaine à Bruz (bimensuel) — tous les PDFs" },
      { label: "Agenda", url: "https://www.ville-bruz.fr/mes-loisirs/agenda/", desc: "Événements et manifestations" },
      { label: "Facebook Ville de Bruz", url: "https://www.facebook.com/villedebruz", desc: "Page officielle de la mairie" },
      { label: "Facebook Jean-René Houssin", url: "https://www.facebook.com/jeanrene.houssin/", desc: "Profil du maire" },
    ],
  },
  {
    titre: "Rennes Métropole",
    icon: "🌐",
    liens: [
      { label: "Site Rennes Métropole", url: "https://metropole.rennes.fr/", desc: "Compétences : T4, PLUiH, eau, déchets…" },
      { label: "Open data Mégalis — délibérations Bruz", url: "https://data.megalis.bretagne.bzh/organization/commune-de-bruz", desc: "Toutes les délibérations officielles de Bruz en open data" },
      { label: "Facebook Rennes Métropole", url: "https://www.facebook.com/metropole.rennes", desc: "Rennes Ville et Métropole" },
    ],
  },
  {
    titre: "Données ouvertes",
    icon: "📊",
    liens: [
      { label: "DGFiP — Fiscalité locale", url: "https://www.data.gouv.fr/fr/datasets/impots-locaux/", desc: "Taux officiels taxe foncière commune par commune" },
      { label: "OFGL — Finances des communes", url: "https://www.data.gouv.fr/fr/organizations/observatoire-des-finances-et-de-la-gestion-publique-locale/", desc: "Observatoire des finances et de la gestion publique locale" },
      { label: "Délinquance — data.gouv.fr", url: "https://www.data.gouv.fr/fr/datasets/crimes-et-delits-enregistres-par-les-services-de-gendarmerie-et-de-police-depuis-2012/", desc: "Crimes et délits enregistrés par commune" },
      { label: "Inspection Académique 35", url: "https://www.ac-rennes.fr/", desc: "Secteurs scolaires, ouvertures/fermetures de classes" },
    ],
  },
  {
    titre: "Presse locale",
    icon: "📰",
    liens: [
      { label: "Ouest-France — Bruz", url: "https://www.ouest-france.fr/bretagne/bruz-35170/", desc: "Articles locaux (abonnement requis)" },
      { label: "La Semaine dans le Bocage", url: "https://www.lasemainedanslebocage.fr/communes/bruz", desc: "Hebdomadaire local" },
    ],
  },
  {
    titre: "Équipements culturels",
    icon: "🎭",
    liens: [
      { label: "Le Grand Logis", url: "https://www.legrandlogis.fr/", desc: "Salle culturelle et cinéma de Bruz" },
    ],
  },
  {
    titre: "Bruz en Action",
    icon: "🤝",
    liens: [
      { label: "Nous rejoindre — HelloAsso", url: metaData.contact.hello_asso_url, desc: "Adhérer à l'association" },
      { label: "Facebook Bruz en Action", url: metaData.reseaux_sociaux.facebook, desc: "Notre page" },
      { label: "Instagram Bruz en Action", url: metaData.reseaux_sociaux.instagram, desc: "Notre compte" },
      { label: `Nous écrire`, url: `mailto:${metaData.contact.email}`, desc: metaData.contact.email },
    ],
  },
];

export default function LiensPage() {
  const { association } = metaData;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 40 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#fff" }}>
            Liens utiles
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 600, margin: 0 }}>
            Mairie, Métropole, presse locale, données ouvertes — les ressources pour suivre ce qui se passe à Bruz.
          </p>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {SECTIONS.map((section) => (
              <section key={section.titre}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 20 }}>{section.icon}</span>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{section.titre}</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {section.liens.map((lien) => (
                    <a key={lien.url} href={lien.url} target={lien.url.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer"
                      style={{ display: "block", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px", textDecoration: "none", transition: "border-color 0.15s" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{lien.label} ↗</div>
                      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{lien.desc}</div>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
