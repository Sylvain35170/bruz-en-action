import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "Programme — Bruz en Action",
  description: "Les 10 priorités du programme « Un nouvel élan pour Bruz » — mandat 2026-2032.",
  openGraph: {
    title: "Programme — Bruz en Action",
    description: "Les 10 priorités du programme « Un nouvel élan pour Bruz » — mandat 2026-2032.",
    url: "https://sylvain35170.github.io/bruz-en-action/programme",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

const PRIORITES = [
  {
    num: 1,
    emoji: "🏘️",
    titre: "Maîtriser le développement pour protéger le cadre de vie",
    accroche: "Développer Bruz sans perdre son identité.",
    color: "#7c3aed",
    engagements: [
      "Maîtriser strictement la densification et refuser tout projet qui dégrade le cadre de vie.",
      "Exiger une qualité architecturale à la hauteur de notre ville.",
      "Associer les habitants aux évolutions de leur quartier.",
      "Poursuivre la rénovation énergétique du patrimoine communal.",
    ],
    actions: [
      "Mettre en concurrence les aménageurs publics et privés pour la ZAC Multisites afin d'obtenir les meilleures garanties pour Bruz.",
      "Adapter la densité selon l'identité et la capacité de chaque quartier.",
      "Repenser le renouvellement urbain en privilégiant la surélévation plutôt que l'étalement.",
      "Organiser une concertation quartier par quartier.",
      "Accélérer la rénovation énergétique des bâtiments municipaux.",
    ],
  },
  {
    num: 2,
    emoji: "🚌",
    titre: "Faciliter la vie quotidienne et les mobilités",
    accroche: "Se déplacer à Bruz doit être simple, sûr et adapté à tous.",
    color: "#0ea5e9",
    engagements: [
      "Sécuriser en priorité les déplacements des piétons et des cyclistes, tout en préservant une place équilibrée à la voiture.",
      "Améliorer les liaisons entre quartiers, centre-ville et équipements publics.",
      "Défendre auprès de la Métropole des solutions de transport réellement utiles aux Bruzois.",
    ],
    actions: [
      "Obtenir le terminus du trambus à la gare.",
      "Créer deux circuits de navettes électriques desservant centre-ville et quartiers.",
      "Aménager 60 nouvelles places de stationnement proches du centre.",
      "Installer des bornes de recharge électrique supplémentaires.",
      "Optimiser le plan de circulation pour rendre les déplacements plus fluides.",
      "Relier les quartiers par des connexions piétonnes et cyclables sécurisées.",
    ],
  },
  {
    num: 3,
    emoji: "🚔",
    titre: "Assurer la tranquillité, la sécurité et la propreté",
    accroche: "Le respect commence par l'espace public.",
    color: "#dc2626",
    engagements: [
      "Renforcer la tranquillité publique et lutter contre les incivilités.",
      "Améliorer la propreté de la ville et la réactivité des services.",
      "Développer une présence humaine et rassurante de la police municipale dans l'espace public.",
    ],
    actions: [
      "Ouvrir un hôtel de police visible et accessible.",
      "Doubler les effectifs de la police municipale.",
      "Améliorer l'utilisation de la vidéoprotection et la renforcer dans les zones sensibles.",
      "Réorganiser la planification du nettoyage de la ville.",
      "Établir des conventions pour faciliter la disponibilité des sapeurs-pompiers volontaires.",
      "Créer des espaces de vie adaptés aux animaux domestiques (parcs canins…).",
    ],
  },
  {
    num: 4,
    emoji: "💼",
    titre: "Renforcer le commerce et l'attractivité économique",
    accroche: "Une ville attractive est une ville qui crée de l'activité et de l'emploi.",
    color: "#2563eb",
    engagements: [
      "Soutenir activement le commerce de proximité et la vitalité du centre-ville.",
      "Favoriser l'installation de nouveaux entrepreneurs et porteurs de projets.",
      "Valoriser les initiatives économiques responsables et créatrices d'emplois.",
      "Faire de l'attractivité économique et commerçante un levier du dynamisme local, sans artificialiser la ville.",
    ],
    actions: [
      "Nommer un adjoint dédié à la vie économique et à l'artisanat.",
      "Organiser des rencontres trimestrielles avec les commerçants.",
      "Encourager les animations commerciales (braderie, carnaval, marché à manger…).",
      "Affirmer la présence de la Ville au Campus de Ker Lann.",
      "Privilégier les circuits courts et l'économie locale.",
    ],
  },
  {
    num: 5,
    emoji: "🎭",
    titre: "Soutenir les associations, le sport et la culture",
    accroche: "Les associations, le sport et la culture font vivre Bruz.",
    color: "#ec4899",
    engagements: [
      "Garantir un accès équitable aux équipements sportifs et culturels.",
      "Encourager la pratique sportive pour tous les âges.",
      "Développer une offre culturelle accessible, diverse et de proximité.",
      "Valoriser les associations comme partenaires essentiels de la vie locale.",
    ],
    actions: [
      "Construire un nouveau boulodrome couvert.",
      "Créer une salle d'arts martiaux.",
      "Aménager des espaces de jeux collectifs (street ball, volley, pump track).",
      "Organiser un festival national du spectacle vivant.",
      "Célébrer les mérites sportifs chaque année.",
      "Édifier un observatoire d'astronomie.",
      "Développer le sport adapté et le handisport.",
      "Accueillir l'Université du Temps Libre.",
    ],
  },
  {
    num: 6,
    emoji: "👥",
    titre: "Accompagner tous les âges de la vie et garantir l'accès aux services",
    accroche: "Une ville responsable prend soin de chaque génération.",
    color: "#9333ea",
    engagements: [
      "Anticiper les besoins scolaires et périscolaires liés à l'évolution démographique.",
      "Répondre aux attentes de toutes les générations.",
      "Renforcer la prévention, lutter contre l'isolement, faire respecter la parité homme femme.",
      "Consolider l'action sociale de la ville.",
      "Porter attention aux besoins spécifiques de chaque public.",
    ],
    actions: [
      "Déployer une Maison France Services pour faciliter les démarches administratives.",
      "Instaurer une commission locale d'attribution de logement avec l'ensemble des bailleurs sociaux.",
      "Rénover la Maison des jeunes.",
      "Organiser un repas annuel de nos aînés.",
      "Étendre la sécurité aux entrées et sorties de toutes les écoles.",
      "Améliorer l'accessibilité pour les personnes à mobilité réduite.",
    ],
  },
  {
    num: 7,
    emoji: "🗳️",
    titre: "Renforcer une véritable démocratie locale",
    accroche: "Informer, associer, décider.",
    color: "#f59e0b",
    engagements: [
      "Consulter les habitants aux moments clés, lorsque leur avis peut réellement influencer les décisions.",
      "Rendre les réunions de quartier plus utiles, plus efficaces et orientées vers l'action.",
      "Garantir une information transparente.",
    ],
    actions: [
      "Désigner des élus référents par quartier.",
      "Organiser des réunions régulières dans chaque quartier.",
      "Créer un Conseil municipal des jeunes.",
      "Mettre en place un Conseil des sages pour mieux répondre aux attentes des seniors.",
      "Publier un compte-rendu clair des décisions municipales.",
    ],
  },
  {
    num: 8,
    emoji: "💰",
    titre: "Gérer avec responsabilité les finances de la ville",
    accroche: "Bien gérer l'argent public et défendre fermement les intérêts de Bruz.",
    color: "#d97706",
    engagements: [
      "Maîtriser les dépenses et garantir une gestion rigoureuse.",
      "Maintenir une fiscalité contenue.",
      "Reconnaître l'engagement des agents de la ville et valoriser leurs compétences.",
    ],
    actions: [
      "Assurer une gestion stricte et transparente de l'argent public, en maîtrisant les dépenses, en préservant une fiscalité juste et en garantissant un endettement utile et responsable.",
      "Investir là où c'est nécessaire, en orientant chaque euro vers les priorités réelles des habitants et vers les projets qui amélioreront concrètement leur quotidien.",
      "Optimiser nos services publics, en maîtrisant la masse salariale, en anticipant les départs et en adaptant l'organisation pour maintenir un service efficace et proche des citoyens.",
      "Remettre à plat une gestion transparente et responsable de la piscine de la Conterie.",
    ],
  },
  {
    num: 9,
    emoji: "🌿",
    titre: "Réussir la Transition écologique avec pragmatisme",
    accroche: "Protéger et préserver notre environnement.",
    color: "#16a34a",
    engagements: [
      "Intégrer les enjeux climatiques dans toutes les politiques municipales.",
      "Protéger la biodiversité locale.",
    ],
    actions: [
      "Végétaliser les espaces publics et créer des îlots de fraîcheur.",
      "Réduire la consommation énergétique des bâtiments municipaux.",
      "Soutenir l'installation de fermes bio.",
      "Préserver les continuités écologiques.",
      "Encourager les pratiques durables par des dispositifs incitatifs (navettes électriques).",
      "Adapter l'aménagement urbain aux épisodes climatiques extrêmes.",
      "Rétablir la collecte de végétaux chez les personnes âgées.",
    ],
  },
  {
    num: 10,
    emoji: "🏙️",
    titre: "Affirmer Bruz dans et avec la Métropole",
    accroche: "Partenaire loyal oui – Commune effacée non.",
    color: "#6366f1",
    engagements: [
      "Défendre avec détermination les intérêts de Bruz au sein de Rennes Métropole.",
      "Refuser toute perte de souveraineté communale sur les décisions structurantes.",
      "Exiger une relation plus équilibrée entre la ville-centre et les communes périphériques.",
      "Renforcer le poids politique de Bruz dans les instances métropolitaines.",
    ],
    actions: [
      "Obtenir le droit à l'expérimentation et à la différenciation pour adapter les politiques métropolitaines aux spécificités de Bruz.",
      "Négocier une gouvernance plus équilibrée entre Rennes et les autres communes.",
      "Défendre systématiquement les projets utiles à Bruz dans les arbitrages métropolitains.",
      "Rendre compte régulièrement aux habitants des décisions prises à l'échelle métropolitaine.",
      "Mobiliser les autres communes partageant les mêmes enjeux pour peser collectivement dans les décisions.",
    ],
  },
];

export default function ProgrammePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ background: "#0E2F62", padding: "16px 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "var(--container-max, 1120px)", margin: "0 auto" }}>
          <NavBar />
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1a4a8a 100%)", color: "#fff", padding: "48px 24px 40px" }}>
          <div style={{ maxWidth: "var(--container-max, 1120px)", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Mandat 2026–2032
                </p>
                <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                  « Un nouvel élan pour Bruz »
                </h1>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginTop: 12, maxWidth: 560 }}>
                  Les 10 priorités du programme présenté par Jean-René Houssin lors des élections municipales du 15 mars 2026.
                  Ce document est la source de référence pour le suivi des engagements.
                </p>
              </div>
              <a
                href="/bruz-en-action/docs/programme-2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 20px", borderRadius: 8,
                  background: "#f97316", color: "#fff",
                  fontWeight: 700, fontSize: 14, textDecoration: "none",
                  flexShrink: 0, whiteSpace: "nowrap",
                }}
              >
                📄 Télécharger le programme (PDF)
              </a>
            </div>
          </div>
        </div>

        {/* Priorités */}
        <div style={{ maxWidth: "var(--container-max, 1120px)", margin: "0 auto", padding: "40px 24px 60px" }}>
          <div style={{ display: "grid", gap: 32 }}>
            {PRIORITES.map((p) => (
              <div key={p.num} style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                overflow: "hidden",
                borderLeft: `5px solid ${p.color}`,
              }}>
                {/* En-tête priorité */}
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 36, height: 36, borderRadius: "50%",
                      background: p.color, color: "#fff",
                      fontSize: 13, fontWeight: 800, flexShrink: 0,
                    }}>{p.num}</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "clamp(15px, 2.5vw, 18px)", fontWeight: 700, color: "#0f172a" }}>
                        {p.emoji} {p.titre}
                      </h2>
                      <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b", fontStyle: "italic" }}>{p.accroche}</p>
                    </div>
                  </div>
                </div>

                {/* Corps */}
                <div style={{ padding: "16px 24px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                  {/* Engagements */}
                  <div>
                    <h3 style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8" }}>
                      Nos engagements
                    </h3>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {p.engagements.map((e, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#334155", display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ color: p.color, flexShrink: 0, marginTop: 2 }}>•</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8" }}>
                      Nos actions
                    </h3>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {p.actions.map((a, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#334155", display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ color: p.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lien vers promesses */}
          <div style={{
            marginTop: 40, padding: "24px 28px",
            background: "#eff6ff", borderRadius: 12,
            border: "1px solid #bfdbfe",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 16, flexWrap: "wrap",
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: "#1e40af", fontSize: 15 }}>
                Suivre la réalisation de ces engagements
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#3b82f6" }}>
                Consultez le tableau de bord des 50 promesses du mandat et leur état d'avancement.
              </p>
            </div>
            <a href="/bruz-en-action/promesses"
              style={{
                padding: "10px 20px", borderRadius: 8,
                background: "#1d4ed8", color: "#fff",
                fontWeight: 700, fontSize: 14, textDecoration: "none",
                flexShrink: 0,
              }}>
              ✅ Tableau de bord promesses
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
