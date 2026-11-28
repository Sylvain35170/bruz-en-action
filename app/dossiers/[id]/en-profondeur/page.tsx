import { notFound } from "next/navigation";
import dossiersData from "../../../../data/dossiers.json";
import metaData from "../../../../data/meta.json";
import NavBar from "../../../../components/NavBar";
import SiteFooter from "../../../../components/SiteFooter";
import { formatNomPrenom } from "../../../utils";

// Seuls les dossiers avec une page "En profondeur" sont listés ici
// IDs pilotés par le champ en_profondeur de dossiers.json — le contenu
// éditorial de chaque analyse reste dans ce fichier (blocs par id).
const EN_PROFONDEUR_IDS = dossiersData.dossiers
  .filter((d) => "en_profondeur" in d && d.en_profondeur)
  .map((d) => d.id);

export function generateStaticParams() {
  return EN_PROFONDEUR_IDS.map(id => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dossier = dossiersData.dossiers.find(d => d.id === id);
  if (!dossier) return {};
  return {
    title: `${dossier.titre} — En profondeur — Bruz en Action`,
    description: `Analyse détaillée : ${dossier.chapeau}`,
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #E8A040", display: "inline-block" }}>
      {children}
    </h2>
  );
}

function InfoBox({ icon, titre, children }: { icon: string; titre: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{titre}</h3>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: "#334155" }}>{children}</div>
    </div>
  );
}

export default async function EnProfondeurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!EN_PROFONDEUR_IDS.includes(id)) notFound();

  const dossier = dossiersData.dossiers.find(d => d.id === id);
  if (!dossier) notFound();

  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);

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
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(232,77,14,0.2)", color: "#E8A040", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              En profondeur
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{dossier.id}</span>
          </div>
          {id === "D01" && (<>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", maxWidth: 720, color: "#fff" }}>
              Trambus T4 à Bruz : pourquoi ça compte, qui décide, et quelle vision pour la ville ?
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.75)", maxWidth: 680, margin: 0 }}>
              Le T4 n'est pas un simple projet de transport. C'est une décision qui va remodeler Bruz pour trente ans.
              Voici ce qu'il faut comprendre — et les deux visions qui s'affrontent sur le terminus.
            </p>
          </>)}
          {id === "D02" && (<>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", maxWidth: 720, color: "#fff" }}>
              1 700 logements à Bruz : ce que ça change vraiment pour les habitants
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.75)", maxWidth: 680, margin: 0 }}>
              La ZAC Multisites va transformer Bruz en profondeur d'ici 2035. Mais construire des logements, ce n'est pas juste poser des briques.
              Voici les vraies questions — sur les écoles, la densité, les équipements — et ce qu'on va surveiller.
            </p>
          </>)}
          {id === "D07" && (<>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", maxWidth: 720, color: "#fff" }}>
              Sécurité à Bruz : gendarmerie, police municipale et caméras — qui fait quoi, et qu'est-ce qui va changer ?
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.75)", maxWidth: 680, margin: 0 }}>
              Le programme Houssin promet de doubler les effectifs de la police municipale et de renforcer la vidéoprotection. Mais que peut vraiment faire une PM dans une commune sous régime de gendarmerie ? Et où en est-on, huit mois après l'élection ?
            </p>
          </>)}
          {id === "D03" && (<>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", maxWidth: 720, color: "#fff" }}>
              Les finances de Bruz : ce que tout citoyen devrait savoir
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.75)", maxWidth: 680, margin: 0 }}>
              Une dette héritée d&apos;un emprunt toxique et remboursée pendant dix ans, des ressources modestes, des projets qui
              s&apos;accumulent et un nouvel emprunt pour les financer. Les chiffres sont publics mais dispersés : on les rassemble,
              on les recoupe, et on liste les questions qui restent ouvertes.
            </p>
          </>)}
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>

        {/* ── CONTENU D07 ── */}
        {id === "D07" && (<>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Qui s'occupe de la sécurité à Bruz ?</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { icon: "🎖️", label: "Gendarmerie nationale", detail: "Compétence principale : police judiciaire, sécurité routière, enquêtes, interventions d'urgence. Bruz dépend du groupement de gendarmerie d'Ille-et-Vilaine. L'État paie, l'État décide des effectifs.", couleur: "#1d4ed8" },
                { icon: "🚔", label: "Police municipale (PM)", detail: "Compétence communale : stationnement, tranquillité publique, arrêtés du maire, présence préventive. Effectifs et équipements décidés et financés par la commune. Le maire est l'autorité de police.", couleur: "#E8A040" },
                { icon: "📞", label: "CCAS & médiation", detail: "Prévention sociale, accompagnement des personnes vulnérables, médiation de quartier. Complémentaire aux forces de l'ordre — souvent plus efficace sur les incivilités du quotidien.", couleur: "#059669" },
              ].map(({ icon, label, detail, couleur }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `3px solid ${couleur}`, borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{detail}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Conséquence pratique : la commune peut renforcer sa PM, mais elle ne peut pas augmenter les effectifs de gendarmerie — c'est une décision de l'État.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce que la PM peut faire — et ce qu'elle ne peut pas</SectionTitle>
            <div className="bea-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>✓ Ce qu'elle peut faire</div>
                {["Verbaliser le stationnement illicite", "Contrôler les débits de boissons", "Relever les infractions au code de la route (certaines)", "Faire respecter les arrêtés municipaux (bruit, propreté)", "Présence préventive dans les quartiers", "Assistance aux opérations de police judiciaire (sous autorité gendarmerie)"].map(item => (
                  <div key={item} style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, padding: "4px 0", borderBottom: "1px solid #d1fae5" }}>{item}</div>
                ))}
              </div>
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>✗ Ce qu'elle ne peut pas faire</div>
                {["Conduire des enquêtes judiciaires", "Procéder à des gardes à vue", "Intervenir sur les crimes et délits (réservé gendarmerie)", "Augmenter les patrouilles de nuit sans budget dédié", "Décider seule d'installer des caméras (vote CM requis)"].map(item => (
                  <div key={item} style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, padding: "4px 0", borderBottom: "1px solid #fecaca" }}>{item}</div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>La promesse de renforcement — où en est-on ?</SectionTitle>
            <InfoBox icon="📋" titre="Ce qui était promis">
              Le programme « Un nouvel élan pour Bruz » s&apos;engage à « doubler les effectifs de la police municipale » (page 5) et à
              renforcer la vidéoprotection dans les zones sensibles. La délégation « Prévention et sécurité » a été confiée à Philippe Pagès,
              8e adjoint, en avril 2026.
            </InfoBox>
            <InfoBox icon="📍" titre="Où en est-on ?">
              La police municipale compte 8 agents : 1 responsable, 3 policiers municipaux, 2 agents de surveillance de la voie publique,
              1 secrétaire et 2 agents de surveillance des sorties d&apos;école. Les policiers sont armés (catégories B et D) et équipés de
              caméras-piétons. Un poste supplémentaire a été créé en 2026 (candidatures closes le 9 juillet). Le doublement promis reste
              à préciser : sur quelle base (8 agents, ou 4 policiers municipaux) et à quel horizon ?{" "}
              <em>Sources : fiche de poste et offre d&apos;emploi 2026 de la Ville ; Bruz Mag n°262.</em>
            </InfoBox>
            <InfoBox icon="❓" titre="Ce qu'on ne sait pas">
              Le budget de la police municipale n&apos;apparaît pas en ligne propre dans les documents budgétaires publiés. On ne connaît
              pas non plus les plages horaires de patrouille, ni la date et la délibération d&apos;origine du dispositif de vidéoprotection
              existant.
            </InfoBox>
            <InfoBox icon="🔍" titre="Ce qu'on attend">
              Un calendrier du doublement : combien d&apos;agents supplémentaires, avec quel budget, et pour quelles missions. Sans ça,
              le « renforcement » reste difficile à mesurer.
            </InfoBox>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>La vidéosurveillance : un débat qui arrive</SectionTitle>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 20 }}>
              Un dispositif de vidéoprotection existe déjà à Bruz : les policiers municipaux en assurent le suivi. La majorité annonce un
              audit avec la gendarmerie pour redéployer les caméras (Bruz Mag n°262), sans nouvelles caméras annoncées à ce stade. Étendre
              le dispositif est un sujet qui divise — voici les arguments des deux côtés.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { camp: "Arguments pour", items: ["Effet dissuasif reconnu sur les incivilités et dégradations", "Aide à l'élucidation des faits après coup (preuve judiciaire)", "Sentiment de sécurité pour certains habitants et commerçants", "Coût amorti sur 10 ans si bien dimensionné"], couleur: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
                { camp: "Arguments contre", items: ["Coût d'installation et maintenance élevé (dizaines de milliers €/caméra)", "Efficacité préventive contestée par plusieurs études", "Impact sur les libertés individuelles — encadrement légal strict (CNIL, CSI)", "Risque de déplacement des délits vers des zones non couvertes"], couleur: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
              ].map(({ camp, items, couleur, bg, border }) => (
                <div key={camp} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: couleur, marginBottom: 10 }}>{camp}</div>
                  {items.map(item => <div key={item} style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, paddingLeft: 12, borderLeft: `2px solid ${border}`, marginBottom: 6 }}>{item}</div>)}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 16 }}>
              Si la mairie souhaite installer de nouvelles caméras, cela nécessitera une délibération du conseil municipal, une autorisation préfectorale et un avis de la CNIL. Ce sera un moment de débat public.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les questions citoyennes</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { q: "Combien d'agents de PM faut-il pour « doubler » ?", d: "La PM compte 8 agents, dont 4 policiers municipaux (responsable compris). Le programme ne dit pas quelle base il double : 8 → 16, ou 4 → 8 policiers ? La réponse change le coût du tout au tout." },
                { q: "Quel est le budget PM 2026 ?", d: "Le budget 2026 crée un poste de police municipale (+3 ETP au total, avec les marchés publics et l'Atlas de la biodiversité), mais le coût total de la PM n'apparaît pas en ligne propre dans les documents publiés." },
                { q: "Quelles sont les plages horaires de patrouille ?", d: "La PM patrouille-t-elle la nuit ? Les week-ends ? Aucune information publique disponible." },
                { q: "Que disent les chiffres de délinquance ?", d: "Ils sont publics (ministère de l'Intérieur) et contrastés : en 2025, les cambriolages atteignent leur plus haut niveau en dix ans (68, +28 % sur un an), tandis que violences physiques, dégradations et escroqueries baissent sur un an. Détail dans le dossier D07." },
                { q: "Une convention PM-gendarmerie existe-t-elle ?", d: "Les communes peuvent signer des conventions de coordination avec la gendarmerie. Bruz en a-t-elle une ? Avec quel contenu ?" },
              ].map(({ q, d }, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #E8A040", borderRadius: 8, padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{q}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #E8A040", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E8A040", marginBottom: 10 }}>Notre lecture — position de Bruz en Action</div>
              <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                Le sentiment de sécurité, ça se construit avec des données — pas des slogans.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Bruz en Action n&apos;a pas de position sur le niveau de sécurité à Bruz, et les chiffres sont contrastés : cambriolages au plus haut depuis dix ans en 2025, violences et dégradations en baisse sur un an. Mais on a une attente : que les décisions sur la PM et la vidéosurveillance s'appuient sur des données publiques, pas sur un sentiment ou une posture politique.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Présenter les chiffres de délinquance en conseil municipal, et chiffrer le calendrier du doublement promis — c'est le minimum pour que les Bruzois puissent juger sur pièces.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce qu'on va surveiller</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { periode: "Fin 2026", description: "Le poste créé en 2026 est-il pourvu ? L'effectif passerait de 8 à 9 agents.", importance: "haute" },
                { periode: "2027", description: "Calendrier du doublement des effectifs promis — budget et nombre de postes.", importance: "haute" },
                { periode: "2026–2027", description: "Conclusions de l'audit vidéoprotection mené avec la gendarmerie : redéploiement, extension, coût.", importance: "haute" },
                { periode: "2026–2027", description: "Publication des chiffres de délinquance Bruz par le Ministère — en CM ou en communication.", importance: "moyenne" },
                { periode: "2026–2032", description: "Bilan à mi-mandat : le renforcement promis s'est-il traduit en agents et en présence terrain ?", importance: "neutre" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 100 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.importance === "haute" ? "#E8A040" : "#64748b" }}>{item.periode}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {item.description}
                    {item.importance === "haute" && <span style={{ display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#E8A040", background: "#fff1ee", padding: "1px 6px", borderRadius: 999 }}>À surveiller</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href={`/bruz-en-action/dossiers/${id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#0E2F62", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
              ← Retour au dossier D07
            </a>
            <a href="https://www.data.gouv.fr/fr/datasets/crimes-et-delits-enregistres-par-les-services-de-gendarmerie-et-de-police-depuis-2012/" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              📊 Données délinquance ↗
            </a>
          </div>

        </>)}

        {/* ── CONTENU D03 ── */}
        {id === "D03" && (<>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les chiffres de base</SectionTitle>
            <InfoBox icon="💶" titre="26,6 M€ de recettes et 18,9 M€ de dépenses de fonctionnement en 2025">
              La fiscalité locale (taxes foncières, taxe sur les résidences secondaires, droits de mutation) en apporte 15,3 M€,
              soit 58 %. Les dépenses vont d&apos;abord au personnel (10,8 M€, 57 %). La commune a investi 9,5 M€, dont 7,7 M€
              d&apos;équipement. <em>Source : compte financier unique 2025, recoupé avec la DGFiP et l&apos;OFGL.</em>
            </InfoBox>
            <InfoBox icon="🏛️" titre="Une commune aux ressources modestes">
              La dotation globale de fonctionnement de l&apos;État (2,56 M€ en 2025) représente 127 €/habitant, contre 208 € en
              moyenne pour les communes de même taille. Le potentiel financier de Bruz est inférieur de 15 % à cette moyenne, et son
              effort fiscal supérieur (1,30 contre 1,18). <strong>Bruz a moins de ressources et sollicite davantage ses contribuables.</strong>{" "}
              <em>Source : OFGL, comptes et dotations des communes.</em>
            </InfoBox>
            <InfoBox icon="📉" titre="La dette : 7,6 M€ fin 2025, dix ans après l'emprunt toxique">
              En 2015, la Ville est sortie d&apos;un emprunt indexé sur le franc suisse en payant 9,7 M€ d&apos;indemnité, dont
              l&apos;État rembourse 57,5 %. Sa dette a culminé à 28,2 M€, puis a baissé chaque année. Fin 2025 : 380 €/habitant,
              contre 1 002 € pour les communes de même taille, et 1,5 an de capacité de désendettement.{" "}
              <em>Sources : Chambre régionale des comptes (2018), DGFiP, OFGL.</em>
            </InfoBox>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les questions que tout citoyen devrait poser</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 20 }}>
              Pas besoin d&apos;être expert-comptable. Certaines réponses sont désormais publiques, d&apos;autres pas encore.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  q: "Quel est le montant du budget 2026 ?",
                  d: "41,6 M€ votés le 9 mars 2026 : 23,6 M€ en fonctionnement et 18,0 M€ en investissement. C'est une prévision ; le réalisé sera connu avec le compte financier unique 2026, courant 2027. Source : maquette du budget primitif 2026 (Mégalis)."
                },
                {
                  q: "Quelle est la dette de Bruz par habitant ?",
                  d: "380 € fin 2025 (7,6 M€), contre 1 002 € en moyenne pour les communes de même taille. Elle va remonter : un prêt de 4 M€ a été signé fin 2025 pour le 4e groupe scolaire. Sources : DGFiP ; arrêté du 1er décembre 2025."
                },
                {
                  q: "Combien d'années faudrait-il pour rembourser la dette avec l'épargne brute ?",
                  d: "1,5 an fin 2025 (7,6 M€ de dette pour 5,1 M€ d'épargne brute). Le seuil de vigilance se situe autour de 10 à 12 ans. Sources : DGFiP, OFGL."
                },
                {
                  q: "Comment le budget d'investissement se répartit-il entre les projets ?",
                  d: "Le plan pluriannuel présenté en janvier 2026 donne les grandes enveloppes (13,8 M€ en 2026, dont 7,2 M€ pour le 4e groupe scolaire et l'Hôtel de Ville), mais pas le détail ligne par ligne des autres projets. Source : rapport d'orientations budgétaires 2026."
                },
                {
                  q: "Que rapportent les entreprises installées à Bruz, Safran compris ?",
                  d: "À la commune, peu de chose directement : membre de Rennes Métropole, Bruz ne perçoit ni la CFE (1,9 M€ en 2025) ni la CVAE (1,6 M€ en 2023) de ses entreprises, qui vont à la Métropole. Elle garde la taxe foncière de leurs locaux et reçoit une dotation de solidarité communautaire. Source : OFGL."
                },
                {
                  q: "L'écart entre dépenses et recettes va-t-il se creuser ?",
                  d: "La Ville elle-même prévoit des dépenses de fonctionnement en hausse de 3 % par an contre 0,7 % pour les recettes jusqu'en 2031, avec l'ouverture du 4e groupe scolaire. Quelles économies ou quelles recettes nouvelles pour tenir ? Source : rapport d'orientations budgétaires 2026."
                },
              ].map(({ q, d }, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #E8A040", borderRadius: 8, padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{q}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les projets qui s&apos;accumulent</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 20 }}>
              Bruz dit ne pas être une ville riche, et les chiffres lui donnent raison. Pourtant les engagements financiers du mandat sont nombreux.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 14 }}>
              {[
                { icon: "🏫", label: "4e groupe scolaire", detail: "Autorisation de programme de 11 M€, dont 3,1 M€ réalisés fin 2025. Fin des travaux prévue en décembre 2026. Financé en partie par un prêt de 4 M€.", lien: "/bruz-en-action/dossiers/D10" },
                { icon: "🏛️", label: "Hôtel de Ville", detail: "Rénovation énergétique : enveloppe portée à 2,25 M€ en mai 2026 (+150 000 €). Subvention Fonds vert de 500 000 €.", lien: null },
                { icon: "🏗️", label: "ZAC Multisites", detail: "1 700 logements = équipements publics à anticiper : voirie, réseaux, écoles. Subvention Fonds vert de 600 000 € pour le secteur Gare.", lien: "/bruz-en-action/dossiers/D02" },
                { icon: "🚌", label: "T4 Trambus", detail: "Projet porté par Rennes Métropole : la part éventuelle de Bruz (aménagements) reste à chiffrer. Mise en service 2031.", lien: "/bruz-en-action/dossiers/D01" },
                { icon: "🏊", label: "Piscine Conterie", detail: "La contribution de Bruz au syndicat a fortement augmenté depuis 2019. Voir le dossier.", lien: "/bruz-en-action/dossiers/D06" },
                { icon: "🔒", label: "Police municipale", detail: "Renforcement promis — coût en personnel et équipements non chiffré publiquement.", lien: "/bruz-en-action/dossiers/D07" },
              ].map(({ icon, label, detail, lien }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: lien ? 10 : 0 }}>{detail}</div>
                  {lien && <a href={lien} style={{ fontSize: 11, color: "#E8A040", fontWeight: 700, textDecoration: "none" }}>Voir le dossier ↗</a>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
              Sources : délibérations AP/CP des 9 mars et 18 mai 2026, rapport d&apos;orientations budgétaires 2026 (Mégalis) ; Fonds vert (data.gouv.fr).
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>L&apos;effet Safran</SectionTitle>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
              L&apos;arrivée du groupe Safran à Bruz est présentée comme une bonne nouvelle économique. C&apos;en est probablement une — mais ses effets sur les finances communales sont souvent mal compris.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Ce qui est sûr", texte: "La CFE et la CVAE payées par Safran, comme par toutes les entreprises de Bruz, vont à Rennes Métropole et non à la commune (fiscalité professionnelle unique). Pour l'ensemble des entreprises bruzoises : 1,9 M€ de CFE en 2025. La commune perçoit la taxe foncière des bâtiments. Source : OFGL.", couleur: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
                { label: "Ce qui n'est pas dit", texte: "Le gain réel pour la commune : le montant de taxe foncière attendu sur les bâtiments de Safran, et l'éventuel effet sur la dotation de solidarité versée par la Métropole, n'ont pas été communiqués.", couleur: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                { label: "Ce qui est ignoré", texte: "L'arrivée de salariés Safran = nouveaux habitants potentiels = pression sur les équipements (écoles, transports, logements), qui eux sont à la charge de la commune. La recette fiscale doit être mise en face de ces coûts.", couleur: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
              ].map(({ label, texte, couleur, bg, border }) => (
                <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: couleur, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{texte}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #E8A040", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E8A040", marginBottom: 10 }}>Notre lecture — position de Bruz en Action</div>
              <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                La transparence financière n'est pas optionnelle.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Une commune bien gérée, c'est une commune qui documente ses choix et les explique aux habitants. Les chiffres existent — compte financier, rapports d&apos;orientations budgétaires, données de l&apos;État — mais ils sont dispersés dans des documents techniques, et parfois contradictoires : la note officielle du CFU 2023 affichait un ratio de dette faux, que nous avions nous-mêmes repris. Une lecture publique claire reste à faire : où vont les 15 M€ de fiscalité locale, quels projets sont financés et lesquels ne le sont pas.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Ce n'est pas une critique — c'est une attente légitime. Bruz en Action n'a pas de position sur le niveau de dépenses ou le taux d'imposition. On a une position sur l'accès à l'information : les Bruzois ont le droit de comprendre ce que la commune fait de leur argent.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.75, fontStyle: "italic" }}>
                Vous avez accès à des données financières sur Bruz que nous n'avons pas ?{" "}
                <a href={`mailto:${metaData.contact.email}?subject=${encodeURIComponent("[D03] Finances — données à partager")}`} style={{ color: "#E8A040" }}>Partagez-les avec nous</a>.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce qu'on va surveiller</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { periode: "Janvier 2027", description: "Débat d'orientation budgétaire 2027, le premier préparé par la nouvelle majorité : le plan pluriannuel d'investissement sera-t-il révisé ?", importance: "haute" },
                { periode: "Printemps 2027", description: "Compte financier unique 2026 : versement effectif du prêt de 4 M€, dette et épargne brute réelles fin 2026.", importance: "haute" },
                { periode: "Fin 2026 – 2027", description: "Coût final et ouverture du 4e groupe scolaire (11 M€) ; fin du chantier de l'Hôtel de Ville (2,25 M€).", importance: "haute" },
                { periode: "2027+", description: "Effet ciseau annoncé : dépenses +3 %/an contre recettes +0,7 %/an. L'épargne brute (21,5 % en 2025) restera-t-elle au-dessus du seuil d'alerte (10 à 15 %) ?", importance: "moyenne" },
                { periode: "D'ici 2030", description: "Fin de l'aide de l'État pour l'emprunt toxique (348 000 €/an) : comment sera compensée cette recette ?", importance: "neutre" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 100 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.importance === "haute" ? "#E8A040" : "#64748b" }}>{item.periode}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {item.description}
                    {item.importance === "haute" && <span style={{ display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#E8A040", background: "#fff1ee", padding: "1px 6px", borderRadius: 999 }}>À surveiller</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href={`/bruz-en-action/dossiers/${id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#0E2F62", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
              ← Retour au dossier D03
            </a>
            <a href="/bruz-en-action/statistiques#finances"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              📊 Le budget dans Bruz en chiffres
            </a>
          </div>

        </>)}

        {/* ── CONTENU D02 ── */}
        {id === "D02" && (<>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>C'est quoi la ZAC Multisites ?</SectionTitle>
            <InfoBox icon="🏗️" titre="Une Zone d'Aménagement Concerté sur plusieurs quartiers">
              La ZAC Multisites est un outil d'urbanisme qui permet à la commune de <strong>maîtriser la création de logements</strong> sur plusieurs secteurs en même temps.
              Création votée au conseil municipal du 15 décembre 2025 (24 voix pour, 7 contre) : environ 31 hectares, 92 000 m²
              de surface de plancher, soit environ 1 700 logements. Objectif de mixité : 30 % de locatif social, 15 % d&apos;accession
              sociale, 20 % à prix encadrés, 35 % libres. <em>Source : délibération de création de la ZAC (Mégalis).</em>
            </InfoBox>
            <InfoBox icon="🗺️" titre="Six secteurs — et Ker Lann à part">
              La ZAC couvre six secteurs : <strong>la Gare, le Grand Pâtis, la Haye de Pan, la Maison des Associations, la Noë et Mons</strong>.
              Cinq sont en renouvellement urbain, un seul en extension (environ 9 ha). Densités minimales du programme local de l&apos;habitat :
              67 logements/ha en renouvellement, 41 en extension.
              <strong> Ker Lann n&apos;en fait pas partie</strong> : c&apos;est une ZAC distincte, sur le tracé du T4, où Rennes Métropole
              impose 60 logements à l&apos;hectare et prévoit environ 600 logements.
            </InfoBox>
            <InfoBox icon="⚖️" titre="Bruz décide — mais pas seule">
              La ZAC Multisites est une initiative communale. Mais ses densités découlent du programme local de l&apos;habitat
              métropolitain, Rennes Métropole fixe celles de Ker Lann, et l&apos;Inspection Académique 35 pilote les ouvertures de classes.
              <strong> La commune construit, mais l'État et la Métropole fixent des contraintes.</strong>
            </InfoBox>
          </section>

          {/* ACTEURS */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les acteurs — qui fait quoi ?</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
              La ZAC Multisites implique plusieurs niveaux de décision. Voici les personnes et institutions qui pèsent réellement dans ce dossier.
            </p>

            {/* Mairie de Bruz */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#0E2F62", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 20, height: 2, background: "#0E2F62", display: "inline-block", flexShrink: 0 }} />
                Mairie de Bruz
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  {
                    nom: "Jean-Patrick Desguérets",
                    titre: "2ème adjoint — Aménagement de la Ville & Urbanisme",
                    roleZac: "Pilote opérationnel de la ZAC au quotidien. C'est lui qui présente les délibérations d'urbanisme en conseil municipal, suit les échanges avec les aménageurs et instruits les demandes de permis.",
                    badge: "Pilote opérationnel",
                    couleur: "#0E2F62",
                  },
                  {
                    nom: "Jérôme De Gayardon",
                    titre: "Conseiller délégué — Habitat & Aménagement urbain",
                    roleZac: "Suit les aspects logement et mixité sociale : quotas HLM au titre de la loi SRU, conventionnement des logements sociaux, répartition entre accession et locatif.",
                    badge: "Logement & mixité",
                    couleur: "#1A4177",
                  },
                  {
                    nom: "Jean-René Houssin",
                    titre: "Maire de Bruz",
                    roleZac: "Porteur politique du projet. Négocie directement avec Rennes Métropole sur les densités et le terminus T4. Signe les arrêtés de création de ZAC et préside le conseil municipal qui vote les délibérations.",
                    badge: "Décision politique",
                    couleur: "#0f172a",
                  },
                ].map(({ nom, titre, roleZac, badge, couleur }) => (
                  <div key={nom} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `3px solid ${couleur}`, borderRadius: 10, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{formatNomPrenom(nom)}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{titre}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: 999, flexShrink: 0 }}>{badge}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                      <strong style={{ color: "#0f172a" }}>Rôle dans la ZAC : </strong>{roleZac}
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", fontStyle: "italic" }}>
                  Source : <a href="https://www.ville-bruz.fr/actualites/decouvrez-les-elus-du-conseil-municipal-de-bruz/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Ville de Bruz — liste des élus 2026–2032 ↗</a>
                </p>
              </div>
            </div>

            {/* Rennes Métropole */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7c3aed", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 20, height: 2, background: "#7c3aed", display: "inline-block", flexShrink: 0 }} />
                Rennes Métropole
              </div>
              <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderLeft: "3px solid #7c3aed", borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 3 }}>Rennes Métropole — 43 communes, ~460 000 habitants</div>
                <div style={{ fontSize: 12, color: "#7c3aed", marginBottom: 14 }}>EPCI — compétences : urbanisme, mobilités, habitat intercommunal</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Sur Ker Lann", detail: "Impose 60 logements/ha dans le cadre du tracé T4. C'est une densité minimale contraignante, pas une recommandation — Bruz doit s'y conformer pour obtenir les financements T4 et la desserte." },
                    { label: "Sur le PLUi", detail: "Pilote le Plan Local d'Urbanisme intercommunal qui s'imposera à toutes les communes du territoire. La révision en cours fixe les règles de densité pour les années à venir." },
                    { label: "Point clé", detail: "Bruz est membre de Rennes Métropole et y vote au Conseil Métropolitain. La Métropole n'est pas un acteur extérieur — les élus bruzois y siègent et peuvent peser sur les décisions." },
                  ].map(({ label, detail }) => (
                    <div key={label} style={{ fontSize: 13, color: "#334155", lineHeight: 1.65 }}>
                      <strong style={{ color: "#7c3aed" }}>{label} : </strong>{detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* État & contrôle */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 20, height: 2, background: "#94a3b8", display: "inline-block", flexShrink: 0 }} />
                État & contrôle de légalité
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10 }}>
                {[
                  { nom: "Préfecture d'Ille-et-Vilaine", role: "Contrôle de légalité des délibérations communales. Les actes ZAC lui sont transmis, comme les modifications du PLUi métropolitain — elle peut les déférer au tribunal administratif." },
                  { nom: "Inspection Académique 35", role: "Pilote les ouvertures et fermetures de classes dans les groupes scolaires existants. Avec ~850 enfants supplémentaires attendus, c'est un défi de planification que la municipalité devra anticiper avec elle." },
                  { nom: "Enquête publique (commissaire-enquêteur)", role: "Toute évolution du PLUi (piloté par Rennes Métropole) et l'étude d'impact de la ZAC passent par une participation du public. C'est le moment légal pour les habitants de déposer leurs observations au dossier." },
                ].map(({ nom, role }) => (
                  <div key={nom} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>{nom}</div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{role}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DENSITÉ */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>La densité : ce que 60 lgts/ha signifie vraiment</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>
              Le chiffre de 60 logements par hectare, imposé à Ker Lann, est mentionné dans les délibérations — mais rarement expliqué.
              C&apos;est aussi le bon ordre de grandeur pour les secteurs de la ZAC Multisites (41 à 67 logements/ha). Que signifie-t-il
              concrètement pour les habitants ?
            </p>

            {/* Repère : 1 ha */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Point de repère : 1 hectare</div>
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  {[
                    { label: "Surface", valeur: "10 000 m²" },
                    { label: "Soit", valeur: "1,4 terrain de football (100 × 70 m)" },
                    { label: "Soit", valeur: "un carré de 100 m de côté" },
                    { label: "Ou encore", valeur: "~10 maisons avec jardins de 1 000 m²" },
                  ].map(({ label, valeur }) => (
                    <div key={label} style={{ display: "flex", gap: 12, fontSize: 13, color: "#334155", marginBottom: 7 }}>
                      <span style={{ color: "#94a3b8", minWidth: 52, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontWeight: 600 }}>{valeur}</span>
                    </div>
                  ))}
                </div>
                <svg viewBox="0 0 210 160" style={{ width: 210, flexShrink: 0 }}>
                  <rect x="10" y="10" width="120" height="120" fill="#f0f9ff" stroke="#0369a1" strokeWidth="2" rx="4" />
                  <text x="70" y="72" textAnchor="middle" fontSize="13" fill="#0369a1" fontWeight="800">1 ha</text>
                  <text x="70" y="89" textAnchor="middle" fontSize="9" fill="#64748b">10 000 m²</text>
                  <text x="70" y="102" textAnchor="middle" fontSize="9" fill="#64748b">100 m × 100 m</text>
                  <rect x="142" y="20" width="58" height="41" fill="#f0fdf4" stroke="#059669" strokeWidth="1.5" rx="3" />
                  <text x="171" y="38" textAnchor="middle" fontSize="8" fill="#059669" fontWeight="700">terrain ⚽</text>
                  <text x="171" y="51" textAnchor="middle" fontSize="8" fill="#059669">100 × 70 m</text>
                  <rect x="142" y="68" width="58" height="29" fill="#f0fdf4" stroke="#059669" strokeWidth="1" rx="3" strokeDasharray="3,2" />
                  <text x="171" y="87" textAnchor="middle" fontSize="8" fill="#94a3b8">× 0,4 ha</text>
                  <text x="70" y="148" textAnchor="middle" fontSize="9" fill="#0369a1">= 1,4 terrains de foot</text>
                </svg>
              </div>
            </div>

            {/* Comparatif densités */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Comparatif — logements et habitants par hectare</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 18 }}>Ratio appliqué : 2,3 habitants/logement (moyenne nationale)</div>
              {((): React.ReactNode => {
                const data: { label: string; lgts: number; couleur: string; isRef: boolean }[] = [
                  { label: "Lotissement pavillonnaire", lgts: 15, couleur: "#86efac", isRef: false },
                  { label: "Centre-bourg Bruz (estimation)", lgts: 25, couleur: "#6ee7b7", isRef: false },
                  { label: "Ker Lann — objectif Métropole", lgts: 60, couleur: "#E8A040", isRef: true },
                  { label: "Quartier dense (référence nat.)", lgts: 80, couleur: "#f87171", isRef: false },
                ];
                const MAX = 95;
                const BAR_W = 260;
                const ROW_H = 52;
                const PAD_L = 190;
                const SVG_W = PAD_L + BAR_W + 90;
                const SVG_H = data.length * ROW_H + 32;
                return (
                  <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", display: "block" }}>
                    <text x={PAD_L} y={14} fontSize={9} fill="#94a3b8" fontWeight="700">LGTS / HA</text>
                    <text x={PAD_L + BAR_W + 10} y={14} fontSize={9} fill="#94a3b8" fontWeight="700">HAB / HA</text>
                    {data.map(({ label, lgts, couleur, isRef }, i) => {
                      const y = i * ROW_H + 22;
                      const bW = (lgts / MAX) * BAR_W;
                      return (
                        <g key={i}>
                          {isRef && <rect x={2} y={y - 2} width={SVG_W - 4} height={ROW_H - 8} fill="#fff8f5" rx={6} />}
                          <text x={PAD_L - 10} y={y + 13} textAnchor="end" fontSize={11} fill={isRef ? "#0f172a" : "#64748b"} fontWeight={isRef ? "700" : "400"}>{label}</text>
                          <rect x={PAD_L} y={y + 2} width={bW} height={ROW_H - 20} rx={4} fill={couleur} />
                          <text x={PAD_L + bW + 6} y={y + 16} fontSize={12} fontWeight="700" fill="#0f172a">{lgts}</text>
                          <text x={PAD_L + BAR_W + 10} y={y + 16} fontSize={12} fill="#64748b">≈ {Math.round(lgts * 2.3)}</text>
                          {isRef && (
                            <text x={PAD_L + bW + 28} y={y + 30} fontSize={9} fill="#E8A040" fontWeight="700">← Ker Lann</text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                Estimation centre-bourg Bruz basée sur les typologies de bâti observées. Sources références : CEREMA, observatoires locaux de l'habitat.
              </p>
            </div>

            {/* Ce que ça implique en termes de bâti */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Ce que 60 lgts/ha implique en termes de bâti</div>
              {[
                { label: "Surface de terrain par logement", detail: "10 000 m² ÷ 60 lgts = 167 m² de terrain par logement — toutes circulations, parkings et espaces verts compris.", couleur: "#0369a1" },
                { label: "Maison individuelle ? Impossible", detail: "Une maison avec jardin nécessite 400 à 600 m² minimum. À 60 lgts/ha, on est structurellement en habitat collectif.", couleur: "#dc2626" },
                { label: "Hauteur attendue : R+2 à R+4", detail: "Le calcul réel donne 2 à 3 niveaux sur une emprise de 20-25 % (scénario courant dans les ZAC bretonnes), ou jusqu'à R+4-5 au plus près de la station T4 pour dégager plus d'espaces au sol. Pas de tours, mais aucun pavillon.", couleur: "#7c3aed" },
                { label: "À l'échelle de Ker Lann", detail: "Si Ker Lann concentre ~30 % des 1 700 logements (soit ~510 lgts) sur 8,5 ha, on obtient exactement 60 lgts/ha — soit ~1 170 habitants sur cette zone, l'équivalent d'un petit quartier.", couleur: "#E8A040" },
              ].map(({ label, detail, couleur }) => (
                <div key={label} style={{ display: "flex", gap: 14, paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ flexShrink: 0, width: 4, background: couleur, borderRadius: 2, alignSelf: "stretch" }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ZAN */}
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderLeft: "4px solid #0369a1", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0369a1", marginBottom: 12 }}>Pourquoi 60 lgts/ha est un minimum, pas un maximum</div>
              <p style={{ margin: "0 0 16px", fontSize: 14, color: "#0c4a6e", lineHeight: 1.75 }}>
                Pendant des décennies, construire de nouveaux logements à Bruz signifiait prendre de nouvelles terres : champs, prairies, lisières de forêt.
                Ce modèle est désormais interdit par la loi <strong>Zéro Artificialisation Nette (ZAN)</strong> votée en 2021.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 16, border: "1px solid #bae6fd", borderRadius: 8, overflow: "hidden" }}>
                {[
                  { etape: "Avant le ZAN", texte: "On construisait 15 maisons/ha sur des champs. Résultat : la ville s'étalait, les terres agricoles disparaissaient, les routes se saturaient.", icon: "🌾" },
                  { etape: "Avec le ZAN (2021→2031)", texte: "L'État impose de diviser par 2 la consommation de terres vierges. Si Bruz veut construire 1 700 logements, elle doit le faire sur beaucoup moins de surface — donc beaucoup plus dense.", icon: "⚖️" },
                  { etape: "Objectif 2050", texte: "Zéro hectare de terrain naturel ou agricole consommé net. Toute nouvelle construction devra compenser en renaturant une surface équivalente ailleurs.", icon: "🌱" },
                ].map(({ etape, texte, icon }, i) => (
                  <div key={etape} style={{ display: "flex", gap: 14, padding: "14px 16px", background: i % 2 === 0 ? "#f0f9ff" : "#e0f2fe", borderBottom: i < 2 ? "1px solid #bae6fd" : "none" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", marginBottom: 3 }}>{etape}</div>
                      <div style={{ fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>{texte}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0369a1", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.65 }}>
                  <strong>Ordre de grandeur, à Ker Lann :</strong> à 17 lgts/ha (pavillonnaire), les quelque 500 à 600 logements prévus occuperaient ~30 ha ; à 60 lgts/ha, une dizaine d&apos;hectares suffisent. D&apos;où la densité imposée par la Métropole. Et d&apos;ici 2035-2050, les révisions du PLUi pousseront probablement encore plus haut.
                </div>
              </div>
            </div>

            {/* Exemples métropolitains */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Exemples concrets dans Rennes Métropole</div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Ces ZAC sont déjà livrées ou en cours — les habitants de Bruz peuvent y aller voir ce que 60 lgts/ha donne en vrai.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    nom: "La Courrouze",
                    lieu: "Rennes / Saint-Jacques-de-la-Lande",
                    periode: "2010–2020 — livré",
                    densite: "~62 lgts/ha",
                    hauteur: "R+3 à R+7 (plus haut près du métro)",
                    logements: "~3 000 logements sur ~48 ha",
                    note: "La référence la plus proche de Ker Lann : même densité, même métropole, déjà habité. Un mix de collectif moyen (R+3-4) et de quelques immeubles plus hauts sur les axes structurants.",
                    couleur: "#0E2F62",
                  },
                  {
                    nom: "Baud-Chardonnet",
                    lieu: "Rennes (éco-quartier)",
                    periode: "2018–2026 — en cours",
                    densite: "~56 lgts/ha",
                    hauteur: "R+3 à R+6",
                    logements: "~1 400 logements sur ~25 ha",
                    note: "Éco-quartier ZAN-compatible cité en référence par Rennes Métropole. Bâtiments bioclimatiques, rez-de-chaussée actifs, espaces verts intégrés. Comparable à ce que Ker Lann devrait viser.",
                    couleur: "#059669",
                  },
                ].map(({ nom, lieu, periode, densite, hauteur, logements, note, couleur }) => (
                  <div key={nom} style={{ border: "1px solid #e2e8f0", borderLeft: `3px solid ${couleur}`, borderRadius: 10, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{nom}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{lieu} · {periode}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: 999, flexShrink: 0 }}>{densite}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: "#334155" }}>🏢 {hauteur}</span>
                      <span style={{ fontSize: 12, color: "#334155" }}>🏠 {logements}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, fontStyle: "italic" }}>{note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pour vs contre densité */}
            <div className="bea-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 10 }}>Arguments pour cette densité</div>
                {[
                  "Réduit l'étalement urbain et préserve les terres agricoles (ZAN)",
                  "Rentabilise les équipements publics (école, crèche, bus)",
                  "Condition du T4 : sans densité, pas de financement de la ligne",
                  "Logements collectifs = prix d'accession plus abordables",
                ].map(pt => <div key={pt} style={{ fontSize: 12, color: "#334155", lineHeight: 1.6, paddingLeft: 10, borderLeft: "2px solid #bbf7d0", marginBottom: 5 }}>{pt}</div>)}
              </div>
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 10 }}>Points de vigilance</div>
                {[
                  "Aucune maison individuelle possible à ces densités",
                  "Pression accrue sur les espaces verts et la qualité de vie",
                  "Risque de déficit d'équipements si les écoles ne suivent pas",
                  "Sentiment de densification rapide pour les riverains actuels",
                ].map(pt => <div key={pt} style={{ fontSize: 12, color: "#334155", lineHeight: 1.6, paddingLeft: 10, borderLeft: "2px solid #fecaca", marginBottom: 5 }}>{pt}</div>)}
              </div>
            </div>
          </section>

          {/* IMPLICATIONS */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce que 1 700 logements impliquent concrètement</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16 }}>
              {[
                { icon: "👶", titre: "~850 enfants scolarisables", texte: "À raison de 0,5 enfant par logement en moyenne, la ZAC va générer un besoin scolaire substantiel. Bruz dispose déjà de 3 groupes publics (Champ l'Évêque, Jacques Prévert, Vert Buisson) et d'un 4e en construction à Ker Lann (11 M€, fin des travaux prévue fin 2026), dimensionné d'abord pour les logements de Ker Lann. Les besoins propres aux six secteurs de la ZAC restent à chiffrer." },
                { icon: "🚗", titre: "Pression sur la mobilité", texte: "Plus d'habitants = plus de flux. Sans T4 en service avant 2031, les nouveaux arrivants dépendront de la voiture pour rejoindre Rennes." },
                { icon: "🌳", titre: "Espaces verts sous tension", texte: "La densification réduit mécaniquement les espaces ouverts. La charte de bonnes pratiques présentée en réunion publique reste à concrétiser." },
                { icon: "💶", titre: "Recettes fiscales à terme", texte: "1 700 logements = base taxable en hausse. Mais la part communale de la taxe d'aménagement ne sera pas perçue dans la ZAC : l'aménageur financera les voies, réseaux et espaces verts internes — les écoles et équipements de quartier restent à la charge de la commune, et précèdent les recettes." },
              ].map(({ icon, titre, texte }) => (
                <div key={titre} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{titre}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{texte}</div>
                </div>
              ))}
            </div>
          </section>

          {/* QUESTIONS SANS RÉPONSE */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les questions sans réponse publique</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>
              La création de la ZAC a été votée. Mais plusieurs questions essentielles restent sans réponse documentée.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { q: "Combien de classes supplémentaires pour la ZAC ?", d: "Le 4e groupe scolaire en construction à Ker Lann (autorisation de programme de 11 M€) répond d'abord aux logements de Ker Lann. Les besoins scolaires des six secteurs de la ZAC Multisites (~1 700 logements) ne sont pas chiffrés publiquement." },
                { q: "Quel aménageur pour la ZAC ?", d: "La délibération de création parle d'un « aménageur futur » : il sera désigné à l'étape suivante, avec le dossier de réalisation (concession à une SEM, une SPL ou un opérateur privé, ou réalisation en régie). Qui, quand, et à quelles conditions ?" },
                { q: "Quel calendrier secteur par secteur ?", d: "La ZAC couvre plusieurs quartiers mais aucun planning de mise en chantier n'a été rendu public. Qui commence quand, dans quel ordre ?" },
                { q: "Quelle mixité sociale ?", d: "Quelle part de logements sociaux dans les 1 700 ? La loi SRU impose des quotas — Bruz est-elle en conformité et à quel niveau vise-t-elle ?" },
                { q: "Quels équipements prévus et à quel coût ?", d: "L'aménageur prendra en charge les voies, réseaux et espaces verts internes. Pour les écoles, crèches et gymnases, aucun chiffrage public n'existe : il viendra avec le programme des équipements publics du dossier de réalisation." },
                { q: "Quelle concertation réelle ?", d: "La réunion publique de 2025 a été jugée trop unilatérale par la presse locale. Les habitants auront-ils voix au chapitre sur la densité lors des prochaines étapes (dossier de réalisation, modification du PLUi métropolitain) ?" },
              ].map(({ q, d }, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #E8A040", borderRadius: 8, padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{q}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </section>

          {/* NOTRE LECTURE */}
          <section style={{ marginBottom: 48 }}>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #E8A040", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E8A040", marginBottom: 10 }}>Notre lecture — position de Bruz en Action</div>
              <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                Construire dense, oui — mais en l'assumant, et avec les équipements derrière.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Bruz a besoin de logements. La commune grandit, les prix immobiliers poussent les familles plus loin,
                et une ville dynamique doit accueillir de nouveaux habitants. La ZAC Multisites est une réponse légitime à ce besoin.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                La densité de 60 lgts/ha imposée sur Ker Lann, à côté de la ZAC Multisites, est une condition du T4 — on ne peut pas avoir la ligne sans la densité.
                C'est un choix politique clair : <strong>accepter la densification en échange d'une desserte en transport en commun</strong>.
                Ce choix mérite d'être assumé publiquement, pas présenté comme une contrainte subie de la Métropole.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Mais 1 700 logements sans aménageur encore désigné, sans besoins scolaires chiffrés pour les six secteurs et sans
                programme d&apos;équipements publics, c&apos;est une promesse à moitié tenue. Les équipements doivent <em>précéder</em> les habitants — pas les rattraper dix ans après.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.75, fontStyle: "italic" }}>
                Vous avez des informations sur le plan scolaire, l'aménageur ou le calendrier de la ZAC ?{" "}
                <a href={`mailto:${metaData.contact.email}?subject=${encodeURIComponent("[D02] ZAC Multisites — informations")}`} style={{ color: "#E8A040" }}>Partagez-les avec nous</a>.
              </p>
            </div>
          </section>

          {/* CE QU'ON SURVEILLE */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce qu'on va surveiller</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { periode: "2026–2027", description: "Dossier de réalisation de la ZAC : programme des équipements publics, bilan financier, mode de réalisation.", importance: "haute" },
                { periode: "2026–2027", description: "Désignation de l'aménageur — délibération attendue en conseil municipal.", importance: "haute" },
                { periode: "2026–2027", description: "Besoins scolaires de la ZAC au-delà du 4e groupe scolaire de Ker Lann : extension ou nouvelle école ?", importance: "haute" },
                { periode: "2026–2028", description: "Dépôts de permis de construire secteur par secteur — le calendrier réel va se révéler.", importance: "moyenne" },
                { periode: "2027–2030", description: "Premiers chantiers — impact sur la circulation et la qualité de vie des riverains.", importance: "neutre" },
                { periode: "2031+", description: "Arrivée du T4 : les logements Ker Lann auront-ils la densité promise à Rennes Métropole ?", importance: "neutre" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 80 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.importance === "haute" ? "#E8A040" : "#64748b" }}>{item.periode}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {item.description}
                    {item.importance === "haute" && <span style={{ display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#E8A040", background: "#fff1ee", padding: "1px 6px", borderRadius: 999 }}>À surveiller</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href={`/bruz-en-action/dossiers/${id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#0E2F62", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
              ← Retour au dossier D02
            </a>
            <a href="/bruz-en-action/carte"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              🗺️ Voir la carte ZAC
            </a>
            <a href="/bruz-en-action/dossiers/D10"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              🏫 Dossier Écoles
            </a>
          </div>

        </>)}

        {/* ── CONTENU D01 ── */}
        {id === "D01" && (<>

          {/* C'est quoi le T4 */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>C'est quoi le Trambus T4 ?</SectionTitle>
            <InfoBox icon="🚌" titre="Un Bus à Haut Niveau de Service guidé">
              Le T4 est une ligne de <strong>trambus guidé</strong> (BHNS sur voie propre), à mi-chemin entre le tramway et le bus express.
              Moins coûteux que le tram sur rail, il circule sur une voie réservée, s'arrête à des stations fixes,
              et atteint des capacités de <strong>100 à 150 passagers par rame</strong>.
            </InfoBox>
            <InfoBox icon="🗺️" titre="De Rennes jusqu'à Bruz — ~21 stations">
              La ligne reliera le centre de Rennes aux portes de Bruz en passant par Cesson-Sévigné, Chantepie et Ker Lann.
              Maîtrise d'ouvrage : <strong>Rennes Métropole</strong> (réseau Star).
              Livraison prévue : <strong>2030–2031</strong>.
            </InfoBox>
            <InfoBox icon="⚠️" titre="Bruz ne décide pas — mais ses votes au Conseil Métropolitain comptent">
              Le tracé et le terminus sont validés par Rennes Métropole, pas par la mairie de Bruz.
              Bruz dispose cependant de <strong>représentants au Conseil Métropolitain</strong>.
              Le rapport de force politique — et la capacité à faire entendre la position de Bruz — est donc déterminant.
            </InfoBox>
          </section>

          {/* Pourquoi c'est crucial */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Pourquoi c'est crucial pour Bruz ?</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { icon: "👥", titre: "2ème ville de la métropole", texte: "~20 000 habitants, croissance soutenue. Bruz est la commune la mieux placée pour bénéficier d'une desserte forte vers Rennes." },
                { icon: "🚆", titre: "Gare TER déjà là", texte: "Bruz possède une gare SNCF active (ligne Rennes–Redon). Un terminus T4 à la gare crée un hub multimodal naturel sans infrastructure nouvelle." },
                { icon: "🏗️", titre: "ZAC Multisites en développement", texte: "Le secteur Ker Lann concentre emplois, commerces et logements futurs. Le T4 conditionne sa densification — Rennes Métropole impose 60 lgts/ha sur ce secteur." },
                { icon: "🚗", titre: "Navetteurs nombreux", texte: "Une large part des actifs bruzois travaille à Rennes. Le T4 est une alternative crédible à la voiture si le terminus est bien positionné." },
              ].map(({ icon, titre, texte }) => (
                <div key={titre} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{titre}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{texte}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Les deux visions */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Deux visions du terminus</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
              Là où la ligne se termine, c'est là que la ville se développe.
              Un terminus en centre-ville change tout vs un terminus en gare. Voici les deux lectures en présence.
            </p>
            <div className="bea-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* Ancienne majorité */}
              <div style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "#64748b", padding: "14px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Ancienne majorité · Salmon (2020–2026)</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Terminus centre-ville</div>
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      "Faire venir le T4 jusqu'au cœur de Bruz (place de l'Église ou proche)",
                      "Objectif : revitaliser le centre-bourg, attirer flux piétons",
                      "Implique des travaux lourds : voirie, réseaux enterrés, stationnement",
                      "Délais plus longs, coûts d'infrastructure élevés côté commune",
                      "Centre-ville transformé — partisans : dynamisme ; opposants : chantier long et impactant",
                    ].map((pt, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                        <span style={{ color: "#94a3b8", flexShrink: 0 }}>·</span>
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nouvelle majorité */}
              <div style={{ background: "#fff", border: "2px solid #E8A040", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", padding: "14px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Nouvelle majorité · Houssin (2026–2032)</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Terminus gare SNCF + hub multimodal</div>
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      "Terminus à la gare SNCF de Bruz — connexion TER + T4 au même point",
                      "Navettes électriques (bus ou véhicules légers) vers les quartiers et le centre-ville",
                      "Moins de travaux lourds sur le centre-bourg : moins d'impact sur la qualité de vie",
                      "Hub multimodal : une logique de rupture de charge fluide (train → T4 → navette)",
                      "Déploiement plus rapide, coûts de génie civil réduits côté Bruz",
                    ].map((pt, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                        <span style={{ color: "#E8A040", flexShrink: 0 }}>→</span>
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Notre lecture */}
          <section style={{ marginBottom: 48 }}>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #E8A040", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E8A040", marginBottom: 10 }}>Notre lecture — position de Bruz en Action</div>
              <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                Le hub multimodal gare SNCF nous semble la stratégie la plus pragmatique pour Bruz.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Bruz n'a pas les infrastructures souterraines d'une grande ville.
                Refaire le centre-bourg pour accueillir un trambus représente des années de chantier,
                des coûts importants, et un impact fort sur la vie quotidienne des habitants.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                À l'inverse, la gare SNCF est déjà un pôle de mobilité. Y connecter le T4 crée une rupture de charge
                efficace, et des navettes électriques peuvent desservir le centre de façon souple et évolutive —
                sans bétonner trente ans de voirie.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.75, fontStyle: "italic" }}>
                Nous soutenons la majorité Houssin et nous assumons cette posture.
                Si vous avez des arguments contraires documentés, <a href={`mailto:${metaData.contact.email}?subject=${encodeURIComponent("[D01] Argumentation terminus T4")}`} style={{ color: "#E8A040" }}>faites-les nous parvenir</a>.
              </p>
            </div>
          </section>

          {/* Ce qui va se décider */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce qui va se décider</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { periode: "2026–2027", description: "Délibération officielle de Rennes Métropole sur le terminus final. C'est le vote à surveiller au Conseil Métropolitain.", importance: "haute" },
                { periode: "2026–2028", description: "Concertation publique et études d'impact. L'occasion pour les Bruzois de se faire entendre.", importance: "moyenne" },
                { periode: "2028–2030", description: "Travaux de voirie et d'infrastructure sur le tracé Ker Lann–terminus.", importance: "neutre" },
                { periode: "2030–2031", description: "Mise en service prévue de la ligne T4.", importance: "neutre" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 80 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.importance === "haute" ? "#E8A040" : "#64748b" }}>{item.periode}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {item.description}
                    {item.importance === "haute" && <span style={{ display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#E8A040", background: "#fff1ee", padding: "1px 6px", borderRadius: 999 }}>À surveiller</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Retour dossier — D01 */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href={`/bruz-en-action/dossiers/${id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#0E2F62", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
              ← Retour au dossier {id}
            </a>
            <a href="/bruz-en-action/carte"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              🗺️ Voir la carte T4
            </a>
          </div>

        </>)}

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
