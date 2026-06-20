import metaData from "../../data/meta.json";
import SiteFooter from "../../components/SiteFooter";
import SignalementButton from "../../components/SignalementButton";

const LOGO = "/bruz-en-action/logo.png";

export const metadata = {
  title: "Interagir avec la mairie — Bruz en Action",
  description: "Vos droits, les canaux officiels, et comment Bruz en Action s'engage avec la municipalité. Bienveillant, sourcé, exigeant.",
};

type Section = { icon: string; titre: string; contenu: string; detail?: string; lien?: { label: string; url: string } };

const CANAUX: Section[] = [
  {
    icon: "🏛️",
    titre: "Assister aux conseils municipaux",
    contenu: "Les séances du conseil municipal sont publiques. Tout habitant peut y assister en observateur. C'est l'endroit où les décisions officielles sont votées.",
    detail: "Dates et comptes-rendus disponibles sur notre page /conseils ou sur ville-bruz.fr.",
    lien: { label: "Voir les CMs →", url: "/bruz-en-action/conseils" },
  },
  {
    icon: "✉️",
    titre: "Questions écrites aux élus",
    contenu: "Vous pouvez adresser une question écrite à la mairie ou directement à un élu délégué. La réponse n'est pas garantie dans un délai légal strict, mais elle engage moralement.",
    detail: "Mairie de Bruz — 1 place Charles de Gaulle — 35170 Bruz",
    lien: { label: "Contacter la mairie →", url: "https://www.ville-bruz.fr/la-ville/la-mairie/contact/" },
  },
  {
    icon: "📋",
    titre: "Permanences des élus",
    contenu: "Le maire et les adjoints tiennent des permanences pour recevoir les habitants sur rendez-vous. C'est le canal direct pour exposer un problème local.",
    lien: { label: "Permanences sur ville-bruz.fr →", url: "https://www.ville-bruz.fr/la-ville/la-mairie/permanences/" },
  },
  {
    icon: "🗳️",
    titre: "Pétitions et concertations",
    contenu: "Pour les projets soumis à concertation publique (PLU, ZAC, voirie), des registres ou formulaires en ligne permettent de déposer un avis. Rennes Métropole organise également des concertations sur les projets métropolitains (T4, PLUiH).",
    lien: { label: "Métropole — concertations →", url: "https://www.metropole.rennes.fr/" },
  },
];

export default function InteragirPage() {
  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
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

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 8 }}>
            Engagement citoyen
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", color: "#fff" }}>
            Interagir avec la mairie
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 600, lineHeight: 1.75 }}>
            Vos droits, les canaux officiels, et comment nous, Bruz en Action, engageons le dialogue avec la municipalité.
            Bienveillant, sourcé, et exigeant.
          </p>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>

          {/* Notre posture */}
          <section style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
              Notre posture
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { icon: "🤝", titre: "Bienveillance", texte: "Nous soutenons la majorité Houssin et son projet. Nous ne cherchons pas à déstabiliser — nous cherchons à comprendre et à partager." },
                { icon: "📌", titre: "Exigence", texte: "La bienveillance ne signifie pas la complaisance. Les promesses ont été faites : nous les suivons. Les renoncements seront documentés." },
                { icon: "📄", titre: "Les faits d'abord", texte: "Nous n'attaquons pas les personnes. Nous parlons des décisions, des délibérations, des chiffres publics. Toute affirmation est sourcée." },
                { icon: "🔄", titre: "Correction bienvenue", texte: "Nous ne sommes pas des professionnels de la politique. Si nous nous trompons, signalez-le. Nous corrigeons sans ego." },
              ].map(({ icon, titre, texte }) => (
                <div key={titre} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{titre}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{texte}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Canaux officiels */}
          <section style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
              Les canaux officiels
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {CANAUX.map(({ icon, titre, contenu, detail, lien }) => (
                <div key={titre} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{titre}</div>
                    <p style={{ margin: "0 0 6px", fontSize: 14, color: "#334155", lineHeight: 1.7 }}>{contenu}</p>
                    {detail && <p style={{ margin: "0 0 10px", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{detail}</p>}
                    {lien && (
                      <a href={lien.url} target={lien.url.startsWith("http") ? "_blank" : undefined} rel={lien.url.startsWith("http") ? "noopener noreferrer" : undefined}
                        style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                        {lien.label}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Droit CADA */}
          <section style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
              Votre droit d'accès aux documents
            </h2>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #e84d0e", borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                La loi CADA : tout document administratif est accessible à tout citoyen
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                En vertu de la loi du 17 juillet 1978, tout document produit par une administration (mairie, métropole, préfecture…)
                est <strong>communicable sur demande</strong> — délibérations, marchés publics, budgets, comptes-rendus, rapports d'expertise.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Délai de réponse légal : <strong>1 mois</strong>.
                En cas de refus ou de silence, vous pouvez saisir la{" "}
                <a href="https://www.cada.fr/" target="_blank" rel="noopener noreferrer" style={{ color: "#e84d0e", fontWeight: 600 }}>Commission d'Accès aux Documents Administratifs (CADA)</a>.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14 }}>
              {[
                { etape: "1", titre: "Identifier le document", texte: "Nommez précisément ce que vous cherchez : numéro de délibération, date du CM, objet du marché." },
                { etape: "2", titre: "Adresser la demande", texte: "Courrier ou email à la mairie. Indiquez votre nom, l'objet exact, et la base légale (loi du 17 juillet 1978)." },
                { etape: "3", titre: "Attendre 1 mois", texte: "Délai légal de réponse. Si silence ou refus non motivé → saisine CADA gratuite en ligne." },
                { etape: "4", titre: "Consulter / recevoir", texte: "Consultation sur place ou envoi par email selon le document. Gratuit pour les documents numériques." },
              ].map(({ etape, titre, texte }) => (
                <div key={etape} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{etape}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{titre}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{texte}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <a href="https://www.cada.fr/faire-une-demande-de-communication" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 999, fontSize: 13, fontWeight: 600, color: "#334155", textDecoration: "none" }}>
                📋 Faire une demande CADA en ligne →
              </a>
            </div>
          </section>

          {/* Comment BEA interagit */}
          <section style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
              Comment Bruz en Action s'engage
            </h2>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
              {[
                { icon: "📬", titre: "Signalement avant publication", texte: "Avant de publier une correction ou une alerte, nous contactons la mairie pour vérification. On ne publie pas pour nuire." },
                { icon: "📎", titre: "Toujours une source", texte: "Chaque affirmation dans nos dossiers et suivis de promesses est sourcée (Mégalis, ville-bruz.fr, presse locale, CADA). Pas d'affirmation sans référence." },
                { icon: "🔔", titre: "Présence aux CMs", texte: "Nous suivons les conseils municipaux — en salle ou via les vidéos YouTube. C'est là que les décisions se prennent." },
                { icon: "🗣️", titre: "Dialogue ouvert", texte: "Des élus ou leurs équipes souhaitent nous contacter ? Notre email est public. Nous répondons à toute prise de contact constructive." },
              ].map(({ icon, titre, texte }, i, arr) => (
                <div key={titre} style={{ display: "flex", gap: 16, padding: "18px 22px", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{titre}</div>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{texte}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA signalement */}
          <section>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                Une info, une correction, une question ?
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>
                Si vous avez assisté à un CM, obtenu un document CADA, ou repéré une inexactitude sur ce site — faites-le nous savoir.
              </p>
              <SignalementButton reference="Interaction mairie" />
            </div>
          </section>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
