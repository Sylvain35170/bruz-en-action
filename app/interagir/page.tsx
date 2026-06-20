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
    contenu: "Le conseil municipal, c'est l'endroit où les décisions officielles se prennent et se votent. Les séances sont publiques — n'importe quel habitant peut s'asseoir en tribune et observer. C'est bien plus accessible qu'on ne le pense.",
    detail: "Dates et comptes-rendus disponibles sur notre page Conseils ou sur ville-bruz.fr.",
    lien: { label: "Voir les CMs →", url: "/bruz-en-action/conseils" },
  },
  {
    icon: "✉️",
    titre: "Écrire aux élus",
    contenu: "Pas besoin de se déplacer pour interpeller la mairie. Un courrier ou un email bien formulé, adressé à la mairie ou à l'élu délégué au sujet qui vous concerne, peut suffire à obtenir une réponse ou à faire avancer un sujet.",
    detail: "Mairie de Bruz — 1 place Charles de Gaulle — 35170 Bruz",
    lien: { label: "Contacter la mairie →", url: "https://www.ville-bruz.fr/la-ville/la-mairie/contact/" },
  },
  {
    icon: "📋",
    titre: "Permanences des élus",
    contenu: "Le maire et ses adjoints reçoivent les habitants sur rendez-vous. C'est le canal le plus direct pour parler d'un sujet concret — un trottoir défoncé, une inquiétude sur un projet, une question de voisinage. Plus simple qu'un email, souvent plus efficace.",
    lien: { label: "Permanences sur ville-bruz.fr →", url: "https://www.ville-bruz.fr/la-ville/la-mairie/permanences/" },
  },
  {
    icon: "🗳️",
    titre: "Concertations et consultations",
    contenu: "Quand un grand projet est soumis à concertation publique — PLU, ZAC, voirie — chaque habitant peut déposer un avis. C'est un droit peu connu mais réel. Rennes Métropole organise aussi ses propres consultations sur les projets à l'échelle de l'agglo (T4, PLUiH).",
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
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 640, lineHeight: 1.85 }}>
            La mairie de Bruz est proche et à l'écoute. Mais la démocratie locale, ça se nourrit de citoyens présents,
            curieux, et qui posent des questions. Voici comment s'y retrouver — et comment nous, Bruz en Action, on s'y prend.
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
                { icon: "🤝", titre: "Bienveillance", texte: "Nous avons soutenu Jean-René Houssin et nous croyons sincèrement en son projet pour Bruz. Notre rôle n'est pas de chercher la petite bête — c'est d'aider à comprendre et à valoriser ce qui se passe dans notre ville." },
                { icon: "📌", titre: "Exigence", texte: "Mais la confiance, ça se mérite dans la durée. Les engagements pris devant les Bruzois, on les suit de près. Si quelque chose change de cap ou est abandonné, on le dit — clairement, et sans ménagement." },
                { icon: "📄", titre: "Les faits d'abord", texte: "On ne s'en prend jamais aux personnes. On parle des décisions, des délibérations, des chiffres publics. Et on ne publie rien sans pouvoir citer sa source — vous pouvez tout vérifier." },
                { icon: "🔄", titre: "Correction bienvenue", texte: "On n'est pas omniscients, et la politique locale est complexe. Si on rate quelque chose ou si on se plante, on veut le savoir. Une correction bien faite vaut mieux qu'un article approximatif." },
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
                Vous avez le droit de tout lire — délibérations, marchés, rapports, budgets
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Vous avez entendu parler d'une délibération, d'un marché public, d'un rapport commandé par la mairie ? La loi du 17 juillet 1978
                donne à tout citoyen le droit d'en demander communication. Pas besoin d'être journaliste ou conseiller municipal —
                c'est un droit universel, souvent méconnu.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                L'administration a <strong>1 mois</strong> pour répondre. En cas de refus ou de silence,
                la{" "}
                <a href="https://www.cada.fr/" target="_blank" rel="noopener noreferrer" style={{ color: "#e84d0e", fontWeight: 600 }}>CADA (Commission d'Accès aux Documents Administratifs)</a>{" "}
                peut être saisie gratuitement en ligne.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14 }}>
              {[
                { etape: "1", titre: "Cibler le document", texte: "Nommez précisément ce que vous cherchez : numéro de délibération, date du CM, objet d'un marché... Plus c'est précis, plus c'est rapide." },
                { etape: "2", titre: "Envoyer la demande", texte: "Un email ou un courrier à la mairie suffit. Mentionnez votre nom, l'objet exact, et la loi du 17 juillet 1978 comme base légale." },
                { etape: "3", titre: "Patienter 1 mois", texte: "C'est le délai légal. Si la mairie ne répond pas ou refuse sans motif valable, vous pouvez saisir la CADA — c'est gratuit et en ligne." },
                { etape: "4", titre: "Lire et partager", texte: "Consultation sur place ou envoi par email. Les documents numériques sont transmis gratuitement. Et si vous trouvez quelque chose d'intéressant, on est preneurs !" },
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
                { icon: "📬", titre: "On vérifie avant de publier", texte: "Avant de publier une correction ou une mise au point, on contacte la mairie. Pas par crainte — par honnêteté. Si on se trompe, on le dit d'abord à ceux que ça concerne." },
                { icon: "📎", titre: "Toujours une source", texte: "Rien n'est affirmé sans référence vérifiable. Les données viennent des délibérations Mégalis, du site ville-bruz.fr, de la presse locale ou de demandes CADA. Vous pouvez tout contrôler." },
                { icon: "🔔", titre: "On suit les CMs de près", texte: "On essaie d'être présents — en salle quand c'est possible, sinon via les vidéos YouTube. C'est en suivant les conseils municipaux qu'on peut vraiment rendre compte de ce qui se décide." },
                { icon: "🗣️", titre: "Porte ouverte", texte: "Si des élus ou leurs équipes souhaitent nous contacter, notre email est public et on répond. On préfère un échange direct à un malentendu qui traîne." },
                { icon: "🔒", titre: "Notre indépendance", texte: "Si un élu nous transmet une information, on considère qu'elle a été validée par le maire avant de nous parvenir. Bruz en Action reste une association citoyenne indépendante — pas un canal de communication de la majorité." },
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
                Vous avez quelque chose à nous dire ?
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 14, color: "#64748b", lineHeight: 1.75 }}>
                Vous avez assisté à un CM, obtenu un document intéressant, repéré une inexactitude sur ce site — ou simplement une idée à partager ? On lit tout, on répond à ce qu'on peut.
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
