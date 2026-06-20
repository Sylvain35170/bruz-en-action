import type { Metadata } from "next";
import metaData from "../../data/meta.json";
import SiteFooter from "../../components/SiteFooter";

const LOGO = "/bruz-en-action/logo.png";

export const metadata: Metadata = {
  title: "Rennes Métropole & Bruz — Bruz en Action",
  description: "Les décisions de Rennes Métropole qui impactent directement Bruz : T4, PLUiH, eau, assainissement, finances.",
  openGraph: {
    title: "Rennes Métropole & Bruz — Bruz en Action",
    description: "Les décisions de Rennes Métropole qui impactent directement Bruz : T4, PLUiH, eau, assainissement, finances.",
    url: "https://sylvain35170.github.io/bruz-en-action/metro",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

const DECISIONS = [
  {
    date: "Fév. 2026",
    titre: "Tracé T4 via Ker Lann validé",
    detail: "Le Conseil Métropolitain valide le tracé du trambus guidé T4 passant par Ker Lann, avec une densité imposée de 60 logements/ha sur ce secteur. Bruz ne vote pas ce tracé — c'est Rennes Métropole qui décide.",
    impact: "Fort",
    dossier: "D01",
    source_url: "https://data.megalis.bretagne.bzh/OpenData/213500473/Deliberation/2026/1012938/b6b1dc7396fa9a9946d085d957775ce4477276f63f188b960bb4886c785ccce2.pdf",
  },
  {
    date: "Déc. 2025",
    titre: "PLUiH — révision en cours",
    detail: "Le Plan Local d'Urbanisme intercommunal et de l'Habitat (PLUiH) de Rennes Métropole fixe les règles de construction sur tout le territoire. Sa révision en cours va redéfinir les zones constructibles et les densités autorisées à Bruz.",
    impact: "Fort",
    dossier: "D02",
    source_url: "https://metropole.rennes.fr/",
  },
  {
    date: "En cours",
    titre: "Eau et assainissement",
    detail: "La compétence eau potable et assainissement appartient à Rennes Métropole. Les tarifs, les investissements sur les réseaux et les objectifs de qualité sont décidés à l'échelle métropolitaine, pas à Bruz.",
    impact: "Moyen",
    dossier: null,
    source_url: "https://metropole.rennes.fr/",
  },
  {
    date: "En cours",
    titre: "Collecte des déchets",
    detail: "La collecte et le traitement des déchets ménagers sont une compétence Métropole. Les fréquences de collecte, les points d'apport volontaire et les déchèteries dépendent des décisions métropolitaines.",
    impact: "Moyen",
    dossier: null,
    source_url: "https://metropole.rennes.fr/",
  },
];

const COMPETENCES = [
  { icon: "🚌", label: "Transports", detail: "Réseau Star — tramway, bus, T4 (futur)" },
  { icon: "🏗️", label: "Urbanisme", detail: "PLUiH — règles de construction et densité" },
  { icon: "💧", label: "Eau", detail: "Production, distribution, assainissement" },
  { icon: "♻️", label: "Déchets", detail: "Collecte ménagère, déchèteries, tri" },
  { icon: "🌿", label: "Environnement", detail: "Espaces naturels, PCAET, biodiversité" },
  { icon: "🏘️", label: "Logement", detail: "PLH — objectifs de construction sociale" },
];

export default function MetroPage() {
  const { association, contact } = metaData;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="/bruz-en-action" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={140} height={44} style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 8px" }} />
            </a>
            <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
              {[
                { href: "/bruz-en-action/dossiers", label: "Dossiers" },
                { href: "/bruz-en-action/promesses", label: "Promesses" },
                { href: "/bruz-en-action/conseils", label: "CMs" },
              ].map(({ href, label }) => (
                <a key={href} href={href} style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{label}</a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", paddingBottom: 40 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(232,77,14,0.2)", color: "#f97316", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Au-delà de la mairie
          </div>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#fff" }}>
            Rennes Métropole & Bruz
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 640, margin: 0 }}>
            Beaucoup de décisions qui impactent le quotidien des Bruzois ne se prennent pas à la mairie — elles se prennent
            au Conseil Métropolitain de Rennes. Ce qui se vote là-bas conditionne l'urbanisme, les transports et les finances de Bruz.
          </p>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

          {/* Qui décide quoi */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
              Ce que décide Rennes Métropole
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
              {COMPETENCES.map(({ icon, label, detail }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{detail}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Bruz dispose de représentants au Conseil Métropolitain. Leurs votes sur ces sujets sont suivis dans les dossiers concernés.
            </p>
          </section>

          {/* Décisions récentes */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
              Décisions Métropole qui impactent Bruz
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {DECISIONS.map((d, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{d.date}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                        color: d.impact === "Fort" ? "#dc2626" : "#d97706",
                        background: d.impact === "Fort" ? "#fef2f2" : "#fffbeb",
                        padding: "2px 8px", borderRadius: 999 }}>
                        Impact {d.impact}
                      </span>
                    </div>
                    {d.dossier && (
                      <a href={`/bruz-en-action/dossiers/${d.dossier}`}
                        style={{ fontSize: 12, color: "#e84d0e", fontWeight: 600, textDecoration: "none" }}>
                        → Dossier {d.dossier}
                      </a>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{d.titre}</div>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: "0 0 12px" }}>{d.detail}</p>
                  {d.source_url && (
                    <a href={d.source_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "#0284c7", textDecoration: "none", fontWeight: 600 }}>
                      Source officielle ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Suivre les délibérations */}
          <section style={{ marginBottom: 48 }}>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0369a1", marginBottom: 12 }}>📂 Suivre les délibérations en temps réel</div>
              <p style={{ fontSize: 14, color: "#0f172a", lineHeight: 1.7, margin: "0 0 16px" }}>
                Toutes les délibérations de Bruz et de Rennes Métropole qui concernent Bruz sont publiées en open data sur Mégalis Bretagne.
              </p>
              <a href="https://data.megalis.bretagne.bzh/organization/commune-de-bruz" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#0369a1", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                Open data Mégalis — Bruz ↗
              </a>
            </div>
          </section>

          {/* Signal */}
          <section>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #e84d0e", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e84d0e", marginBottom: 8 }}>Vous avez repéré une décision Métropole qui impacte Bruz ?</div>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px", lineHeight: 1.6 }}>
                Si vous avez connaissance d'une délibération, d'un vote ou d'une décision au Conseil Métropolitain qui concerne Bruz et n'apparaît pas ici, signalez-le.
              </p>
              <a href={`mailto:${contact.email}?subject=${encodeURIComponent("[METRO] Décision à signaler")}`}
                style={{ fontSize: 13, color: "#e84d0e", fontWeight: 700, textDecoration: "none" }}>
                Nous écrire ↗
              </a>
            </div>
          </section>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
