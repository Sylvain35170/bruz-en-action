import type { Metadata } from "next";
import bruz from "../../data/bruz.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";
import StatTile from "../../components/charts/StatTile";
import LineSeriesChart from "../../components/charts/LineSeriesChart";
import HBarList from "../../components/charts/HBarList";
import MultiLineChart from "../../components/charts/MultiLineChart";
import Provenance from "../../components/charts/Provenance";

export const metadata: Metadata = {
  title: "Bruz en chiffres — statistiques de la commune | Bruz en Action",
  description:
    "Les chiffres clés de Bruz, sourcés et à jour : population depuis 1876, logement, emploi et revenus, finances communales, santé, sécurité.",
  openGraph: {
    title: "Bruz en chiffres — statistiques de la commune | Bruz en Action",
    description:
      "Population depuis 1876, logement, emploi, finances communales, santé, sécurité : les chiffres clés de Bruz, sourcés.",
    url: "https://sylvain35170.github.io/bruz-en-action/statistiques",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

const SECTIONS = [
  { id: "population", label: "👥 Population" },
  { id: "logement", label: "🏠 Logement" },
  { id: "emploi", label: "💼 Emploi & revenus" },
  { id: "finances", label: "💶 Budget" },
  { id: "sante", label: "🩺 Santé" },
  { id: "securite", label: "🚔 Sécurité" },
];

function SectionTitle({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 21, fontWeight: 800, color: "#0f172a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
      <span>{emoji}</span>
      {children}
    </h2>
  );
}

// Encadré pédagogique « Comment lire ce chiffre ? » — même style que les
// blocs « Ce qu'on surveille » des dossiers.
function CommentLire({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 20px", marginBottom: 24 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>💡 Comment lire ce chiffre ?</div>
      <div style={{ fontSize: 13, lineHeight: 1.65, color: "#78350f" }}>{children}</div>
    </div>
  );
}

function TuilesGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
      {children}
    </div>
  );
}

function LienDossier({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} style={{ fontSize: 13, fontWeight: 600, color: "#1A4177", textDecoration: "none" }}>
      📁 {label} →
    </a>
  );
}

const fr = (n: number) => n.toLocaleString("fr-FR");

export default function StatistiquesPage() {
  const demo = bruz.demographie;
  const pop = bruz.series_longues.population;
  const seriePop = Object.entries(pop.valeurs).map(([annee, valeur]) => ({
    annee: Number(annee),
    valeur: Number(valeur),
  }));
  const densite = Math.round(demo.population_reference / demo.superficie_km2);

  const log = bruz.logements;
  const evolRP = Object.entries(log.evolution_residences_principales).map(([annee, valeur]) => ({
    label: annee,
    valeur: Number(valeur),
  }));

  const emploi = bruz.emploi_revenus;
  const secteurs: { label: string; valeur: number }[] = [
    { label: "Commerce, transports, services", valeur: emploi.secteurs_etablissements.commerce_transport_services_pct },
    { label: "Administration, éducation, santé", valeur: emploi.secteurs_etablissements.administration_education_sante_pct },
    { label: "Construction", valeur: emploi.secteurs_etablissements.construction_pct },
    { label: "Industrie", valeur: emploi.secteurs_etablissements.industrie_pct },
    { label: "Agriculture", valeur: emploi.secteurs_etablissements.agriculture_pct },
  ];

  const fin = bruz.finances_communales;
  const dgfip = fin.series_dgfip;
  const exos = Object.entries(dgfip.annees).map(([annee, e]) => ({ annee: Number(annee), ...e }));
  const dernier = exos[exos.length - 1];
  const meur = (n: number, d = 1) => `${(n / 1_000_000).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d })} M€`;
  const gm = fin.cfu_2025.grandes_masses;
  // Espaces insécables : « 2,2 M€ · 8 % » ne doit jamais se couper en fin de ligne.
  const montant = (v: number) => (v >= 1_000_000 ? meur(v) : `${Math.round(v / 1000).toLocaleString("fr-FR")} k€`);
  const pctDe = (v: number, total: number) => {
    const pct = (v / total) * 100;
    return `${montant(v)} · ${pct < 1 ? "< 1" : Math.round(pct)} %`.replace(/ /g, "\u00a0");
  };
  const ofgl = fin.series_ofgl;
  const exosOfgl = Object.entries(ofgl.annees).map(([annee, e]) => ({ annee: Number(annee), ...e }));
  const capaciteDesendettement = dernier.encours_dette / dernier.epargne_brute;
  const ent = fin.fiscalite_entreprises;

  const sante = bruz.sante;
  const secu = bruz.securite;
  const analyses: Record<string, string> = {
    "Violences physiques et sexuelles": secu.analyse_vs_references_nationales.violences_physiques,
    Cambriolages: secu.analyse_vs_references_nationales.cambriolages,
    "Vols et dégradations": secu.analyse_vs_references_nationales.vols_petite_delinquance,
    Stupéfiants: secu.analyse_vs_references_nationales.stupefiants,
  };

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
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(232,77,14,0.2)", color: "#f97316", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Connaître Bruz
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", color: "#fff" }}>
            Bruz en chiffres
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 680, margin: "0 0 28px" }}>
            Les chiffres clés de la commune, tous sourcés (INSEE, DGFiP, comptes officiels) avec leur année de
            référence. Cette page est générée depuis la base de connaissance de l&apos;association — aucun chiffre
            n&apos;est saisi à la main.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 8 }}>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{ fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", padding: "5px 12px", borderRadius: 999 }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main style={{ flex: 1, maxWidth: 1120, margin: "0 auto", padding: "40px 24px 56px", width: "100%", boxSizing: "border-box" }}>
        {/* ————— Population ————— */}
        <section id="population" style={{ marginBottom: 48 }}>
          <SectionTitle emoji="👥">Population</SectionTitle>
          <TuilesGrid>
            <StatTile valeur={fr(demo.population_reference)} label="Population légale 2023" note={`En vigueur au ${demo.en_vigueur}`} />
            <StatTile valeur={fr(demo.population_recensement)} label={`Population municipale (${demo.annee_recensement})`} />
            <StatTile valeur={`+${demo.taux_croissance_annuel_2017_2023}/an`} label="Croissance 2017-2023" note={`Solde naturel ${demo.solde_naturel} + solde migratoire ${demo.solde_migratoire}`} />
            <StatTile valeur={`${fr(densite)} hab/km²`} label="Densité" note={`${demo.superficie_km2} km² de superficie`} />
          </TuilesGrid>
          <CommentLire>
            La <strong>population légale</strong> ({fr(demo.population_reference)}) sert de référence réglementaire —{" "}
            {demo.note.toLowerCase().replace(/^bruz/, "Bruz")}. La <strong>population municipale</strong> ({fr(demo.population_recensement)}),
            plus restrictive, est celle des séries statistiques et du graphique ci-dessous : les deux chiffres sont
            corrects, ils ne comptent pas la même chose.
          </CommentLire>
          <LineSeriesChart
            titre="Population de Bruz depuis 1876"
            sousTitre="La courbe raconte la commune : bourg rural (~3 000 hab.) jusqu'aux années 1950, puis la périurbanisation multiplie la population par 5 depuis 1968."
            serie={seriePop}
            unite="Habitants"
            source={pop.source}
            sourceUrl={pop.source_url}
          />
        </section>

        {/* ————— Logement ————— */}
        <section id="logement" style={{ marginBottom: 48 }}>
          <SectionTitle emoji="🏠">Logement</SectionTitle>
          <TuilesGrid>
            <StatTile valeur={fr(log.total_logements)} label={`Logements (${log.annee_reference})`} note={`${log.residences_principales_pct.toLocaleString("fr-FR")} % de résidences principales`} />
            <StatTile valeur={`${log.logements_vacants_pct.toLocaleString("fr-FR")} %`} label="Logements vacants" />
            <StatTile valeur={`${log.hlm_pct.toLocaleString("fr-FR")} %`} label="Logements HLM" />
            <StatTile valeur={`${log.proprietaires_pct.toLocaleString("fr-FR")} %`} label="Propriétaires" note={`${log.maisons_pct.toLocaleString("fr-FR")} % de maisons`} />
            <StatTile valeur={bruz.menages.taille_moyenne.toLocaleString("fr-FR")} label="Personnes par ménage" note={`${fr(bruz.menages.total_menages)} ménages`} />
          </TuilesGrid>
          <HBarList
            titre="Résidences principales : la croissance continue"
            sousTitre={log.note}
            items={evolRP}
            source="INSEE RP2023"
            annee={log.annee_reference}
            sourceUrl="https://www.insee.fr/fr/statistiques/2011101?geo=COM-35047"
          />
          <LienDossier href="/bruz-en-action/dossiers/D02" label="Dossier ZAC Multisites : 1 700 logements d'ici 2035" />
        </section>

        {/* ————— Emploi & revenus ————— */}
        <section id="emploi" style={{ marginBottom: 48 }}>
          <SectionTitle emoji="💼">Emploi &amp; revenus</SectionTitle>
          <TuilesGrid>
            <StatTile valeur={`${fr(emploi.revenu_median_uc)} €`} label="Revenu médian par unité de consommation" note="Filosofi 2023" />
            <StatTile valeur={`${emploi.taux_pauvrete_pct.toLocaleString("fr-FR")} %`} label="Taux de pauvreté" />
            <StatTile valeur={`${emploi.taux_chomage_15_64_ans.toLocaleString("fr-FR")} %`} label="Chômage des 15-64 ans" note={`${emploi.taux_chomage_jeunes_15_24_ans.toLocaleString("fr-FR")} % chez les 15-24 ans`} />
            <StatTile valeur={fr(emploi.emplois_sur_place)} label="Emplois sur la commune" note={`${fr(emploi.etablissements_fin_2024)} établissements fin 2024`} />
          </TuilesGrid>
          <HBarList
            titre="Établissements par secteur d'activité"
            items={secteurs.map(s => ({ ...s, affiche: `${s.valeur.toLocaleString("fr-FR")} %` }))}
            source={emploi.source}
            annee={emploi.annee_reference}
            sourceUrl="https://www.insee.fr/fr/statistiques/2011101?geo=COM-35047"
          />
          <LienDossier href="/bruz-en-action/dossiers/D16" label="Dossier Économie locale" />
        </section>

        {/* ————— Finances ————— */}
        <section id="finances" style={{ marginBottom: 48 }}>
          <SectionTitle emoji="💶">Le budget de la commune</SectionTitle>
          <TuilesGrid>
            <StatTile valeur={meur(gm.total_recettes_reelles_fonctionnement)} label="Recettes de fonctionnement (2025)" note="Dont 2,5 M€ de cessions exceptionnelles" />
            <StatTile valeur={meur(gm.total_depenses_reelles_fonctionnement)} label="Dépenses de fonctionnement (2025)" note={`Dont ${meur(gm.depenses_fonctionnement[0].valeur)} de personnel`} />
            <StatTile valeur={meur(gm.total_depenses_reelles_investissement)} label="Dépenses d'investissement (2025)" note={`Dont ${meur(gm.depenses_investissement[0].valeur)} d'équipement`} />
            <StatTile valeur={meur(dernier.encours_dette)} label={`Dette au 31/12/${dernier.annee}`} note={`${fr(Math.round(dernier.bruz_hab.encours_dette_hab ?? 0))} €/hab · communes de même taille : ${fr(Math.round(dernier.strate_hab.encours_dette_hab ?? 0))} €/hab`} />
            <StatTile valeur={`${capaciteDesendettement.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} an`} label="Capacité de désendettement (2025)" note="Années d'épargne qu'il faudrait pour rembourser toute la dette" />
            <StatTile valeur={fin.taxe_fonciere_batie_taux} label={`Taux de taxe foncière bâtie (${fin.annee_taux})`} note="Inchangé depuis la hausse de 2024" />
          </TuilesGrid>
          <div style={{ marginTop: -8, marginBottom: 20 }}>
            <Provenance source="Recettes, dépenses, investissement : compte financier unique 2025 (Ville de Bruz)" url={gm.source_url} />
            <Provenance source="Dette, capacité de désendettement, comparaison : DGFiP, comptes individuels des communes" url={dgfip.source_url} />
            <Provenance source="Taux 2026 : délibération du 9 mars 2026 (Mégalis)" url="https://data.megalis.bretagne.bzh/OpenData/213500473/Deliberation/2026/1046215/7441083a9549c6ac76f64eb7e5ef718e9392d8ce4b90665ebca715428ecf1c4f.pdf" />
          </div>
          <CommentLire>
            Ces montants sont ceux réellement encaissés et dépensés en 2025 (compte financier unique). Le chiffre souvent
            cité de {meur(fin.bp_2026.total_budget)} pour 2026 est le budget <em>voté</em> : une prévision, qui additionne
            fonctionnement et investissement et inclut des écritures comptables internes. Il n&apos;est pas comparable au réalisé.
          </CommentLire>

          <MultiLineChart
            titre={`Recettes et dépenses de fonctionnement depuis ${exosOfgl[0].annee}`}
            sousTitre="L'écart entre les deux courbes, c'est l'épargne : ce qui reste pour investir et rembourser la dette. En millions d'euros."
            series={[
              { nom: "Recettes", points: exosOfgl.map(e => ({ annee: e.annee, valeur: e.recettes_fonctionnement / 1e6 })) },
              { nom: "Dépenses", couleur: "#1A4177", points: exosOfgl.map(e => ({ annee: e.annee, valeur: e.depenses_fonctionnement / 1e6 })) },
            ]}
            unite=" M€"
            decimales={1}
            annotations={[{ annee: 2023, texte: "Dissolution de la SPL NOA" }]}
            source={ofgl.source}
            sourceUrl={ofgl.source_url}
          />
          <CommentLire>
            Opérations réelles, hors ventes de biens. Le pic de 2023 est exceptionnel : la dissolution de la société
            d&apos;aménagement NOA a rapporté 4,8 M€ non reconductibles. De 2018 à 2025, recettes et dépenses ont progressé au
            même rythme (+34 %). Mais en 2025, les dépenses (+2,5 %) ont augmenté plus vite que les recettes (+0,8 %), et la
            Ville prévoit que l&apos;écart se resserre : dépenses +3 % par an, recettes +0,7 % jusqu&apos;en 2031 (rapport
            d&apos;orientations budgétaires 2026).
          </CommentLire>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <HBarList
              titre="D'où vient l'argent ? (fonctionnement 2025)"
              sousTitre={`${meur(gm.total_recettes_reelles_fonctionnement)} de recettes réelles`}
              items={gm.recettes_fonctionnement.map(r => ({
                label: r.label,
                valeur: r.valeur,
                affiche: pctDe(r.valeur, gm.total_recettes_reelles_fonctionnement),
                muted: "exceptionnel" in r && r.exceptionnel === true,
              }))}
              source={gm.source}
              sourceUrl={gm.source_url}
            />
            <HBarList
              titre="Où va l'argent ? (fonctionnement 2025)"
              sousTitre={`${meur(gm.total_depenses_reelles_fonctionnement)} de dépenses réelles`}
              items={gm.depenses_fonctionnement.map(r => ({
                label: r.label,
                valeur: r.valeur,
                affiche: pctDe(r.valeur, gm.total_depenses_reelles_fonctionnement),
              }))}
              source={gm.source}
              sourceUrl={gm.source_url}
            />
          </div>
          <HBarList
            titre="Ce que la commune a investi en 2025"
            sousTitre={`${meur(gm.total_depenses_reelles_investissement)} de dépenses réelles d'investissement — dont les travaux du 4e groupe scolaire et de l'Hôtel de Ville`}
            items={gm.depenses_investissement.filter(r => r.valeur > 10_000).map(r => ({
              label: r.label,
              valeur: r.valeur,
              affiche: pctDe(r.valeur, gm.total_depenses_reelles_investissement),
            }))}
            source={gm.source}
            sourceUrl={gm.source_url}
          />
          <CommentLire>{gm.note}</CommentLire>

          <MultiLineChart
            titre="Dépenses d'équipement par habitant"
            sousTitre="Travaux, constructions et acquisitions, comparés à la moyenne des communes de même taille. En euros par habitant."
            series={[
              { nom: "Bruz", points: exos.map(e => ({ annee: e.annee, valeur: e.bruz_hab.depenses_equipement_hab ?? 0 })) },
              { nom: "Communes de même taille", reference: true, points: exos.map(e => ({ annee: e.annee, valeur: e.strate_hab.depenses_equipement_hab ?? 0 })) },
            ]}
            unite=" €"
            source={dgfip.source}
            sourceUrl={dgfip.source_url}
          />
          <CommentLire>
            Jusqu&apos;en 2014, Bruz investissait à peu près comme les communes de sa taille. De 2015 à 2024, elle a investi
            chaque année nettement moins, souvent deux fois moins ou davantage (2015-2016, 2022-2024) : l&apos;effort est allé
            au remboursement de la dette héritée de l&apos;emprunt toxique. Le rattrapage commence en 2025 avec le chantier du
            4e groupe scolaire.
          </CommentLire>

          <MultiLineChart
            titre="Dette par habitant depuis 2009"
            sousTitre="Encours de dette au 31 décembre, rapporté à la population. En euros par habitant."
            series={[
              { nom: "Bruz", points: exos.map(e => ({ annee: e.annee, valeur: e.bruz_hab.encours_dette_hab ?? 0 })) },
              { nom: "Communes de même taille", reference: true, points: exos.map(e => ({ annee: e.annee, valeur: e.strate_hab.encours_dette_hab ?? 0 })) },
            ]}
            unite=" €"
            annotations={[{ annee: 2015, texte: "Sortie de l'emprunt toxique" }]}
            source={dgfip.source}
            sourceUrl={dgfip.source_url}
          />
          <CommentLire>
            Le pic de 2015-2016 vient de l&apos;emprunt toxique : pour en sortir, la Ville a financé une indemnité de 9,7 M€,
            dont l&apos;État rembourse 57,5 % en quinze ans (348 000 € par an). Hormis un prêt de 1 M€ en 2016 et un prêt de la
            CAF à taux zéro en 2020, la commune n&apos;a plus emprunté : sa dette a été divisée par près de quatre entre 2015
            et 2025. Un nouveau prêt de {meur(fin.emprunt_2026.montant, 0)} sur{" "}
            {fin.emprunt_2026.duree_ans} ans a été signé fin 2025 auprès du {fin.emprunt_2026.preteur} pour le 4e groupe
            scolaire : la dette remontera en 2026. La moyenne de comparaison change en 2024, quand Bruz passe le seuil de
            20 000 habitants.
          </CommentLire>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "4px solid #1A4177", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>🏭 Et les entreprises installées à Bruz ?</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "#334155" }}>
              Leurs impôts économiques ne vont pas à la commune mais à {ent.beneficiaire.split(" (")[0]} : {meur(ent.cfe_produit)} de
              cotisation foncière des entreprises (CFE) en {ent.cfe_annee} et {meur(ent.cvae_produit)} de CVAE en {ent.cvae_annee}.
              Bruz ne perçoit que la taxe foncière de leurs locaux et, en retour, une dotation de solidarité versée par la
              Métropole (incluse dans les « reversements » ci-dessus). L&apos;attribution de compensation est même négative
              ({fr(ent.attribution_compensation ?? 0)} € par an) : depuis le transfert de la voirie en 2014, c&apos;est la commune
              qui la verse.
            </div>
            <Provenance source={ent.source} url={ent.source_url} />
          </div>

          <LienDossier href="/bruz-en-action/dossiers/D03" label="Dossier Finances : les arbitrages du mandat" />
        </section>

        {/* ————— Santé ————— */}
        <section id="sante" style={{ marginBottom: 48 }}>
          <SectionTitle emoji="🩺">Santé</SectionTitle>
          <TuilesGrid>
            <StatTile valeur={String(sante.medecins_generalistes_nb)} label="Médecins généralistes" note="Quasi-totalité en secteur 1" />
            <StatTile valeur={String(sante.pharmacies_nb)} label="Pharmacies" />
            <StatTile valeur={String(sante.cabinets_infirmiers_nb)} label="Cabinets infirmiers" />
            <StatTile valeur={sante.msp.officielle ? "Oui" : "Non"} label="Maison de santé pluriprofessionnelle labellisée" note={sante.zonage_ars.statut === "en attente" ? "Zonage ARS 2026 : classement en attente" : undefined} />
          </TuilesGrid>
          <HBarList
            titre="Densité de médecins généralistes pour 100 000 habitants"
            sousTitre={sante.note_densite}
            items={[
              { label: "Bruz", valeur: sante.densite_generalistes_pour_100k },
              { label: "France entière", valeur: sante.densite_nationale_pour_100k, muted: true },
            ]}
            source="Annuaire santé Ameli / Drees"
            annee={sante.annee_reference}
            sourceUrl={sante.sources[1]}
          />
          <LienDossier href="/bruz-en-action/dossiers/D15" label="Dossier Offre de soins : médecins, désert médical, et après ?" />
        </section>

        {/* ————— Sécurité ————— */}
        <section id="securite" style={{ marginBottom: 48 }}>
          <SectionTitle emoji="🚔">Sécurité</SectionTitle>
          <CommentLire>{secu.note_methodologie}</CommentLire>
          <HBarList
            titre="Faits constatés à Bruz en 2024"
            sousTitre="Le niveau relatif compte plus que le chiffre brut : la comparaison aux références nationales figure sous chaque barre."
            items={[
              { label: "Stupéfiants", valeur: secu.faits_constates_2024.stupefiants, note: analyses["Stupéfiants"] },
              { label: "Vols et dégradations", valeur: secu.faits_constates_2024.vols_et_degradations, note: analyses["Vols et dégradations"] },
              { label: "Violences physiques et sexuelles", valeur: secu.faits_constates_2024.violences_physiques_et_sexuelles, note: analyses["Violences physiques et sexuelles"] },
              { label: "Cambriolages", valeur: secu.faits_constates_2024.cambriolages, note: analyses["Cambriolages"] },
            ]}
            source={secu.faits_constates_2024.source.split(" — ")[0]}
            annee={2024}
            sourceUrl="https://www.bien-dans-ma-ville.fr/bruz-35047/"
          />
          <LienDossier href="/bruz-en-action/dossiers/D07" label="Dossier Sécurité et tranquillité publique" />
        </section>

        {/* ————— Méthodologie ————— */}
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>📚 D&apos;où viennent ces chiffres ?</div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "#475569", margin: 0 }}>
            Tous les chiffres de cette page proviennent de la base de connaissance sourcée de l&apos;association
            (INSEE, DGFiP, comptes financiers officiels publiés sur Mégalis, annuaires santé). La série de
            population est importée automatiquement depuis le fichier INSEE « Historique des populations
            communales » — chaque bloc affiche sa source et son année de référence. Un chiffre vous semble faux
            ou dépassé ? <a href="/bruz-en-action/interagir" style={{ color: "#1A4177", fontWeight: 600 }}>Signalez-le nous</a>.
          </p>
          <Provenance source={`Base de connaissance mise à jour le ${bruz._meta.derniere_mise_a_jour}`} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
