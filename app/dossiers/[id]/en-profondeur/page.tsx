import { notFound } from "next/navigation";
import dossiersData from "../../../../data/dossiers.json";
import metaData from "../../../../data/meta.json";
import NavBar from "../../../../components/NavBar";
import SiteFooter from "../../../../components/SiteFooter";

// Seuls les dossiers avec une page "En profondeur" sont listés ici
const EN_PROFONDEUR_IDS = ["D01", "D02", "D03", "D07"];

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
    <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #E8920E", display: "inline-block" }}>
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
      <header style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(232,77,14,0.2)", color: "#f97316", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
              Le programme Houssin promet un renforcement de la police municipale. Mais que peut vraiment faire une PM dans une commune sous régime de gendarmerie ? Et la vidéosurveillance, c'est pour quand ?
            </p>
          </>)}
          {id === "D03" && (<>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", maxWidth: 720, color: "#fff" }}>
              Les finances de Bruz : ce que tout citoyen devrait savoir avant le CM du 3 juillet
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.75)", maxWidth: 680, margin: 0 }}>
              Budget voté dans la tension, projets qui s'accumulent, dette non publiée.
              Avant que la nouvelle équipe présente ses premières orientations financières, voici les questions qu'on se pose — et les chiffres qu'on attend.
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
                { icon: "🚔", label: "Police municipale (PM)", detail: "Compétence communale : stationnement, tranquillité publique, arrêtés du maire, présence préventive. Effectifs et équipements décidés et financés par la commune. Le maire est l'autorité de police.", couleur: "#E8920E" },
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
              Le programme « Un nouvel élan pour Bruz » mentionne un renforcement de la police municipale. La délégation sécurité a été attribuée à un élu au CM d'avril 2026. C'est le premier acte — le reste n'est pas encore annoncé.
            </InfoBox>
            <InfoBox icon="❓" titre="Ce qu'on ne sait pas">
              Les effectifs actuels de la PM de Bruz ne sont <strong>pas publiés</strong>. On ne sait pas combien d'agents sont en poste, quels sont leurs horaires de patrouille, ni quel est le budget PM dans les comptes 2026. Sans base de référence, impossible de mesurer un « renforcement ».
            </InfoBox>
            <InfoBox icon="🔍" titre="Ce qu'on attend">
              Une délibération précise : X agents supplémentaires, budget alloué, calendrier de recrutement, périmètre d'intervention élargi. Sans ça, le « renforcement » reste une intention sans contenu mesurable.
            </InfoBox>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>La vidéosurveillance : un débat qui arrive</SectionTitle>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 20 }}>
              Plusieurs communes voisines ont investi dans des systèmes de vidéoprotection. À Bruz, aucune délibération n'a encore été votée. C'est un sujet qui divise — voici les arguments des deux côtés.
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
              Si la mairie souhaite installer des caméras, cela nécessitera une délibération du conseil municipal, une autorisation préfectorale et un avis de la CNIL. Ce sera un moment de débat public.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les questions citoyennes</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { q: "Combien d'agents de PM à Bruz aujourd'hui ?", d: "Non publié. C'est pourtant la base pour évaluer toute promesse de renforcement." },
                { q: "Quel est le budget PM 2026 ?", d: "Non communiqué dans le budget voté en mars. Une ligne dédiée existe — son montant n'est pas public." },
                { q: "Quelles sont les plages horaires de patrouille ?", d: "La PM patrouille-t-elle la nuit ? Les week-ends ? Aucune information publique disponible." },
                { q: "Quels sont les chiffres de délinquance à Bruz ?", d: "Les données du Ministère de l'Intérieur (data.gouv.fr) sont publiques par commune — mais elles n'ont jamais été présentées en CM ni commentées par la mairie." },
                { q: "Une convention PM-gendarmerie existe-t-elle ?", d: "Les communes peuvent signer des conventions de coordination avec la gendarmerie. Bruz en a-t-elle une ? Avec quel contenu ?" },
              ].map(({ q, d }, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #E8920E", borderRadius: 8, padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{q}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #E8920E", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E8920E", marginBottom: 10 }}>Notre lecture — position de Bruz en Action</div>
              <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                Le sentiment de sécurité, ça se construit avec des données — pas des slogans.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Bruz en Action n'a pas de position sur le niveau de sécurité à Bruz — la délinquance est faible comparée aux villes de taille similaire. Mais on a une attente : que les décisions sur la PM et la vidéosurveillance s'appuient sur des données publiques, pas sur un sentiment ou une posture politique.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Publier les effectifs PM, les chiffres de délinquance en CM, et budgéter clairement le « renforcement » promis — c'est le minimum pour que les Bruzois puissent juger sur pièces.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce qu'on va surveiller</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { periode: "CM juillet 2026", description: "Budget PM dans les comptes 2026 — en hausse par rapport à 2025 ?", importance: "haute" },
                { periode: "2026", description: "Délibération sur les effectifs PM ou le recrutement d'agents supplémentaires.", importance: "haute" },
                { periode: "2026", description: "Toute délibération sur la vidéoprotection — localisation, coût, autorisation préfectorale.", importance: "haute" },
                { periode: "2026–2027", description: "Publication des chiffres de délinquance Bruz par le Ministère — en CM ou en communication.", importance: "moyenne" },
                { periode: "2026–2032", description: "Bilan à mi-mandat : le renforcement promis s'est-il traduit en agents et en présence terrain ?", importance: "neutre" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 100 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.importance === "haute" ? "#E8920E" : "#64748b" }}>{item.periode}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {item.description}
                    {item.importance === "haute" && <span style={{ display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#E8920E", background: "#fff1ee", padding: "1px 6px", borderRadius: 999 }}>À surveiller</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href={`/bruz-en-action/dossiers/${id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#1B3A6B", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
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
            <InfoBox icon="💶" titre="10,2 M€ de recettes fiscales directes (2023)">
              Taxe foncière bâtie, TFNB et CFE combinées. En 2013, ce chiffre était de 7,3 M€ — soit une hausse de <strong>+40 % en dix ans</strong>, tirée à la fois par la croissance de la base taxable (nouveaux habitants, nouvelles entreprises) et les hausses de taux votées.
            </InfoBox>
            <InfoBox icon="🏛️" titre="La DGF : une dotation de l'État qui stagne">
              La Dotation Globale de Fonctionnement versée par l'État à Bruz est estimée à environ 1,5 M€ — stable depuis plusieurs années. Elle couvre une part marginale des dépenses de fonctionnement et <strong>ne peut pas financer les investissements</strong>.
            </InfoBox>
            <InfoBox icon="📊" titre="La dette : un angle mort du débat public">
              Le ratio dette/habitant et la capacité de désendettement de Bruz <strong>ne sont pas encore publiés pour 2026</strong>. C'est pourtant le chiffre clé pour évaluer la marge de manœuvre de la nouvelle équipe. On attend le compte administratif 2025.
            </InfoBox>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les questions que tout citoyen devrait poser</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 20 }}>
              Pas besoin d'être expert-comptable. Ces questions sont celles de n'importe quel contribuable bruzois soucieux de la bonne utilisation des deniers publics.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  q: "Quel est le montant exact du budget 2026 ?",
                  d: "Le budget a été voté le 9 mars 2026 — mais le montant global (section fonctionnement + investissement) n'a pas été communiqué clairement au public. Le compte administratif 2025 donnera les chiffres réels de l'exercice précédent."
                },
                {
                  q: "Quelle est la dette de Bruz par habitant ?",
                  d: "C'est l'indicateur de référence pour comparer les communes. Pour une ville de 20 000 habitants, la moyenne nationale tourne autour de 700–900 €/habitant. Où se situe Bruz ? La réponse n'est pas publiée."
                },
                {
                  q: "Combien d'années faudrait-il pour rembourser la dette avec l'épargne brute ?",
                  d: "La capacité de désendettement (dette / épargne brute annuelle) est le thermomètre financier d'une commune. Au-delà de 12 ans, les marges sont sérieusement contraintes. Pour Bruz : inconnu."
                },
                {
                  q: "Comment le budget d'investissement 2026 se répartit-il entre les projets ?",
                  d: "T4 (co-financement Métropole), ZAC Multisites, rénovation piscine Conterie, voirie, numérique… Quelle ligne pour quel montant ? Aucune répartition publique n'a été communiquée à ce jour."
                },
                {
                  q: "Quel gain fiscal attend-on de Safran ?",
                  d: "L'arrivée du groupe Safran à Bruz génère une CFE (cotisation foncière des entreprises) significative. Au CM du 20 mars 2026, la majorité est restée prudente sur les chiffres. Le montant attendu n'a pas été communiqué."
                },
                {
                  q: "Les tarifs des services municipaux vont-ils augmenter ?",
                  d: "Piscine, restauration scolaire, activités sportives, crèches… Les tarifs relèvent des délibérations du conseil. Aucune révision tarifaire n'a été votée publiquement depuis l'installation de la nouvelle équipe."
                },
              ].map(({ q, d }, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #E8920E", borderRadius: 8, padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{q}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les projets qui s'accumulent</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 20 }}>
              Bruz dit ne pas être une ville riche. Pourtant les engagements financiers du mandat sont nombreux.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 14 }}>
              {[
                { icon: "🚌", label: "T4 Trambus", detail: "Co-financement Métropole : la part de Bruz reste à chiffrer. Mise en service 2031.", lien: "/bruz-en-action/dossiers/D01" },
                { icon: "🏗️", label: "ZAC Multisites", detail: "1 700 logements = coût d'équipements publics à anticiper : voirie, réseaux, école.", lien: "/bruz-en-action/dossiers/D02" },
                { icon: "🏊", label: "Piscine Conterie", detail: "Déficit chronique estimé à plusieurs centaines de milliers d'€/an. Rénovation non budgétée.", lien: "/bruz-en-action/dossiers/D06" },
                { icon: "🏫", label: "Écoles", detail: "1 700 logements = ~850 enfants scolarisables. Aucun plan de construction scolaire annoncé.", lien: "/bruz-en-action/dossiers/D10" },
                { icon: "🏛️", label: "Hôtel de Ville", detail: "Travaux de rénovation en cours — retour des services prévu fin juin 2026.", lien: null },
                { icon: "🔒", label: "Police municipale", detail: "Renforcement promis — coût en personnel et équipements non chiffré publiquement.", lien: "/bruz-en-action/dossiers/D07" },
              ].map(({ icon, label, detail, lien }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: lien ? 10 : 0 }}>{detail}</div>
                  {lien && <a href={lien} style={{ fontSize: 11, color: "#E8920E", fontWeight: 700, textDecoration: "none" }}>Voir le dossier ↗</a>}
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>L'enjeu du CM du 3 juillet 2026</SectionTitle>
            <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderLeft: "4px solid #d97706", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 10 }}>📅 Conseil municipal — vendredi 3 juillet, 19h — Halle Pagnol</div>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.7 }}>
                C'est la <strong>première séance budgétaire à fort enjeu du mandat Houssin</strong>. Trois mois après l'installation du conseil, la nouvelle équipe va présenter ses premières décisions financières : budget primitif 2026, orientations d'investissement, capacité d'emprunt.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.7 }}>
                C'est le moment de vérité entre les promesses de campagne et les contraintes financières héritées de la mandature Salmon.{" "}
                <strong>La séance est ouverte au public.</strong>
              </p>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>L'effet Safran</SectionTitle>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
              L'arrivée du groupe Safran à Bruz est présentée comme une bonne nouvelle économique. C'en est probablement une — mais ses effets sur les finances communales méritent d'être précisés.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Ce qui est sûr", texte: "Safran génère une CFE (cotisation foncière des entreprises) au bénéfice de Bruz. C'est une recette réelle, versée annuellement.", couleur: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
                { label: "Ce qui n'est pas dit", texte: "Le montant de cette CFE n'a pas été communiqué. Au CM du 20 mars 2026, la majorité est restée évasive. On parle de centaines de milliers d'euros — ou de millions ?", couleur: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                { label: "Ce qui est ignoré", texte: "L'arrivée de salariés Safran = nouveaux habitants potentiels = pression sur les équipements (écoles, transports, logements). La recette fiscale doit être mise en face de ces coûts.", couleur: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
              ].map(({ label, texte, couleur, bg, border }) => (
                <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: couleur, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{texte}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #E8920E", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E8920E", marginBottom: 10 }}>Notre lecture — position de Bruz en Action</div>
              <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                La transparence financière n'est pas optionnelle.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Une commune bien gérée, c'est une commune qui documente ses choix et les explique aux habitants. Le budget voté en mars 2026 dans une ambiance tendue mérite une lecture publique claire : où vont les 10 M€ de recettes fiscales, quelle est la dette réelle, quels projets sont financés et lesquels ne le sont pas.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Ce n'est pas une critique — c'est une attente légitime. Bruz en Action n'a pas de position sur le niveau de dépenses ou le taux d'imposition. On a une position sur l'accès à l'information : les Bruzois ont le droit de comprendre ce que la commune fait de leur argent.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.75, fontStyle: "italic" }}>
                Vous avez accès à des données financières sur Bruz que nous n'avons pas ?{" "}
                <a href={`mailto:${metaData.contact.email}?subject=${encodeURIComponent("[D03] Finances — données à partager")}`} style={{ color: "#E8920E" }}>Partagez-les avec nous</a>.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce qu'on va surveiller</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { periode: "3 juillet 2026", description: "CM — budget primitif 2026 : montants par poste, capacité d'emprunt, orientations d'investissement.", importance: "haute" },
                { periode: "Été 2026", description: "Compte administratif 2025 : les chiffres réels de l'exercice — dont la dette et l'épargne brute.", importance: "haute" },
                { periode: "2026", description: "Montant officialisé de la CFE Safran et impact sur les recettes communales.", importance: "haute" },
                { periode: "2026–2027", description: "Révision éventuelle des tarifs des services : cantine, piscine, activités — pas encore votée.", importance: "moyenne" },
                { periode: "2027+", description: "Premier bilan financier de la mandature : taux d'exécution du budget d'investissement.", importance: "neutre" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 100 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.importance === "haute" ? "#E8920E" : "#64748b" }}>{item.periode}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {item.description}
                    {item.importance === "haute" && <span style={{ display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#E8920E", background: "#fff1ee", padding: "1px 6px", borderRadius: 999 }}>À surveiller</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href={`/bruz-en-action/dossiers/${id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#1B3A6B", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
              ← Retour au dossier D03
            </a>
            <a href="/bruz-en-action/conseils/CM-2026-07-03"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              🏛️ CM du 3 juillet 2026
            </a>
          </div>

        </>)}

        {/* ── CONTENU D02 ── */}
        {id === "D02" && (<>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>C'est quoi la ZAC Multisites ?</SectionTitle>
            <InfoBox icon="🏗️" titre="Une Zone d'Aménagement Concerté sur plusieurs quartiers">
              La ZAC Multisites est un outil d'urbanisme qui permet à la commune de <strong>maîtriser la création de logements</strong> sur plusieurs secteurs en même temps.
              Création officielle votée au conseil municipal de décembre 2025 — 1 700 nouveaux logements prévus d'ici 2035.
            </InfoBox>
            <InfoBox icon="🗺️" titre="Plusieurs secteurs, dont Ker Lann en tête">
              Les 1 700 logements sont répartis sur plusieurs quartiers de Bruz.
              Le secteur <strong>Ker Lann</strong> est le plus contraint : Rennes Métropole y impose une densité de <strong>60 logements à l'hectare</strong> dans le cadre du tracé T4.
              Le Vert-Buisson est le premier secteur identifié publiquement — 67 logements déjà en projet.
            </InfoBox>
            <InfoBox icon="⚖️" titre="Bruz décide — mais pas seule">
              La ZAC est sous maîtrise d'ouvrage communale. Mais Rennes Métropole impose les densités liées au T4 sur Ker Lann,
              et l'Inspection Académique 35 pilote les ouvertures de classes.
              <strong> La commune construit, mais l'État et la Métropole fixent des contraintes.</strong>
            </InfoBox>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce que 1 700 logements impliquent concrètement</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { icon: "👶", titre: "~850 enfants scolarisables", texte: "À raison de 0,5 enfant par logement en moyenne, la ZAC va générer un besoin scolaire considérable. Aucun plan d'école neuve n'a été annoncé à ce jour." },
                { icon: "🚗", titre: "Pression sur la mobilité", texte: "Plus d'habitants = plus de flux. Sans T4 en service avant 2031, les nouveaux arrivants dépendront de la voiture pour rejoindre Rennes." },
                { icon: "🌳", titre: "Espaces verts sous tension", texte: "La densification réduit mécaniquement les espaces ouverts. La charte de bonnes pratiques présentée en réunion publique reste à concrétiser." },
                { icon: "💶", titre: "Recettes fiscales à terme", texte: "1 700 logements = base taxable en hausse. Mais les équipements à financer (écoles, voirie, réseaux) précèdent les recettes de plusieurs années." },
              ].map(({ icon, titre, texte }) => (
                <div key={titre} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{titre}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{texte}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Les questions sans réponse publique</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>
              La création de la ZAC a été votée. Mais plusieurs questions essentielles restent sans réponse documentée.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { q: "Combien d'écoles supplémentaires ?", d: "Aucune délibération sur la construction ou l'extension d'une école primaire n'a été publiée à ce jour. Le plan scolaire du mandat n'est pas connu." },
                { q: "Quel calendrier secteur par secteur ?", d: "La ZAC couvre plusieurs quartiers mais aucun planning de mise en chantier n'a été rendu public. Qui commence quand ?" },
                { q: "Quelle mixité sociale ?", d: "Quelle part de logements sociaux dans les 1 700 ? La loi SRU impose des quotas — Bruz est-elle en conformité ?" },
                { q: "Quels équipements en face ?", d: "Crèches, gymnases, espaces verts — aucun chiffrage public des équipements à créer en parallèle des logements." },
                { q: "Quelle concertation réelle ?", d: "La réunion publique de 2025 a été jugée trop unilatérale par la presse locale. Les habitants auront-ils voix au chapitre sur la densité ?" },
              ].map(({ q, d }, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #E8920E", borderRadius: 8, padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{q}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #E8920E", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E8920E", marginBottom: 10 }}>Notre lecture — position de Bruz en Action</div>
              <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                Construire, oui — mais pas sans plan scolaire ni concertation réelle.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Bruz a besoin de logements. La commune grandit, les prix immobiliers poussent les familles plus loin,
                et une ville dynamique doit accueillir de nouveaux habitants. La ZAC Multisites est une réponse légitime à ce besoin.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Mais 1 700 logements sans calendrier d'école, sans chiffrage des équipements et sans concertation documentée,
                c'est une promesse à moitié tenue. Les équipements doivent <em>précéder</em> les habitants — pas les rattraper dix ans après.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.75, fontStyle: "italic" }}>
                Vous avez des informations sur le plan scolaire ou le calendrier de la ZAC ?{" "}
                <a href={`mailto:${metaData.contact.email}?subject=${encodeURIComponent("[D02] ZAC Multisites — informations")}`} style={{ color: "#E8920E" }}>Partagez-les avec nous</a>.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce qu'on va surveiller</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { periode: "2026", description: "Révision du PLU pour intégrer les nouvelles densités — vote au conseil municipal.", importance: "haute" },
                { periode: "2026–2027", description: "Annonce d'un plan scolaire : construction ou extension d'école primaire ?", importance: "haute" },
                { periode: "2026–2028", description: "Dépôts de permis de construire secteur par secteur — le calendrier réel va se révéler.", importance: "moyenne" },
                { periode: "2027–2030", description: "Premiers chantiers — impact sur la circulation, la qualité de vie des riverains.", importance: "neutre" },
                { periode: "2031+", description: "Arrivée du T4 : les logements Ker Lann auront-ils la densité promise à Rennes Métropole ?", importance: "neutre" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 80 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.importance === "haute" ? "#E8920E" : "#64748b" }}>{item.periode}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {item.description}
                    {item.importance === "haute" && <span style={{ display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#E8920E", background: "#fff1ee", padding: "1px 6px", borderRadius: 999 }}>À surveiller</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href={`/bruz-en-action/dossiers/${id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#1B3A6B", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
              ← Retour au dossier D02
            </a>
            <a href="/bruz-en-action/carte"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              🗺️ Voir la carte ZAC
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

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
              <div style={{ background: "#fff", border: "2px solid #E8920E", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", padding: "14px 20px" }}>
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
                        <span style={{ color: "#E8920E", flexShrink: 0 }}>→</span>
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
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #E8920E", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E8920E", marginBottom: 10 }}>Notre lecture — position de Bruz en Action</div>
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
                Si vous avez des arguments contraires documentés, <a href={`mailto:${metaData.contact.email}?subject=${encodeURIComponent("[D01] Argumentation terminus T4")}`} style={{ color: "#E8920E" }}>faites-les nous parvenir</a>.
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
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.importance === "haute" ? "#E8920E" : "#64748b" }}>{item.periode}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {item.description}
                    {item.importance === "haute" && <span style={{ display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#E8920E", background: "#fff1ee", padding: "1px 6px", borderRadius: 999 }}>À surveiller</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Retour dossier — D01 */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href={`/bruz-en-action/dossiers/${id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#1B3A6B", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
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
