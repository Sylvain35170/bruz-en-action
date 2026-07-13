import type { Metadata } from "next";
import metaData from "../../data/meta.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Mentions légales — Bruz en Action",
  description: "Éditeur, directeur de publication, hébergement et données personnelles du site Bruz en Action.",
  openGraph: {
    title: "Mentions légales — Bruz en Action",
    description: "Éditeur, directeur de publication, hébergement et données personnelles du site Bruz en Action.",
    url: "https://sylvain35170.github.io/bruz-en-action/mentions-legales",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

export default function MentionsLegales() {
  const { association, bureau, contact } = metaData;

  const sections: { titre: string; contenu: React.ReactNode }[] = [
    {
      titre: "Éditeur du site",
      contenu: (
        <>
          <p>
            <strong>{association.nom}</strong>, association régie par la loi du 1<sup>er</sup> juillet 1901,
            dont le siège est situé à Bruz (35170).
          </p>
          <p>
            Contact : <a href={`mailto:${contact.email}`} style={{ color: "#2563eb" }}>{contact.email}</a>
          </p>
        </>
      ),
    },
    {
      titre: "Directeur de la publication",
      contenu: (
        <p>{bureau.president}, président de l&apos;association.</p>
      ),
    },
    {
      titre: "Hébergement",
      contenu: (
        <p>
          Le site est hébergé par <strong>GitHub Pages</strong> — GitHub, Inc., 88 Colin P. Kelly Jr Street,
          San Francisco, CA 94107, États-Unis — <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>pages.github.com ↗</a>.
        </p>
      ),
    },
    {
      titre: "Données personnelles",
      contenu: (
        <>
          <p>
            Ce site ne dépose <strong>aucun cookie</strong>, n&apos;utilise <strong>aucun outil de mesure
            d&apos;audience</strong> ni traceur, et ne requiert aucune création de compte. Les polices de
            caractères sont hébergées sur le site lui-même : aucune donnée n&apos;est transmise à un service
            tiers lors de la consultation.
          </p>
          <p>
            L&apos;hébergeur (GitHub) peut collecter les adresses IP des visiteurs dans ses journaux techniques,
            à des fins de sécurité — voir sa{" "}
            <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
              politique de confidentialité ↗
            </a>.
          </p>
          <p>
            Si vous nous écrivez par email, les informations transmises sont utilisées uniquement pour traiter
            votre demande et ne sont ni cédées ni utilisées à d&apos;autres fins. Vous pouvez exercer vos droits
            d&apos;accès, de rectification et d&apos;effacement en écrivant à{" "}
            <a href={`mailto:${contact.email}`} style={{ color: "#2563eb" }}>{contact.email}</a>.
          </p>
        </>
      ),
    },
    {
      titre: "Propriété intellectuelle et crédits",
      contenu: (
        <>
          <p>
            Les contenus rédactionnels de ce site sont produits par l&apos;association. Les documents officiels
            cités (délibérations, bulletins municipaux, articles de presse) appartiennent à leurs auteurs
            respectifs — chaque citation renvoie vers sa source.
          </p>
          <p>
            Fond de carte : © les contributeurs d&apos;<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>OpenStreetMap ↗</a>.
          </p>
        </>
      ),
    },
    {
      titre: "Indépendance",
      contenu: (
        <p>
          Ce site est édité par une association citoyenne indépendante. Il ne s&apos;agit <strong>pas</strong> du
          site officiel de la Ville de Bruz (<a href="https://www.ville-bruz.fr/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>ville-bruz.fr ↗</a>)
          ni d&apos;une publication de la majorité municipale.
        </p>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 40 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: 0, color: "#fff" }}>
            Mentions légales
          </h1>
        </div>
      </div>

      <main style={{ flex: 1, maxWidth: 800, margin: "0 auto", padding: "40px 24px 56px", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {sections.map(s => (
            <section key={s.titre} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "22px 26px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>{s.titre}</h2>
              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 8 }}>
                {s.contenu}
              </div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
