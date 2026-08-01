import type { Metadata } from "next";
import bruz from "../../data/bruz.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";
import StatTile from "../../components/charts/StatTile";
import LineSeriesChart from "../../components/charts/LineSeriesChart";
import HBarList from "../../components/charts/HBarList";
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
  { id: "finances", label: "💶 Finances" },
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
  const dette = fin.dette_par_habitant_serie;

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
          <SectionTitle emoji="💶">Finances communales</SectionTitle>
          <TuilesGrid>
            <StatTile valeur={fin.taxe_fonciere_batie_taux} label={`Taux de taxe foncière bâtie (${fin.annee_taux})`} note="Maintenu au niveau atteint après la hausse de 2024" />
            <StatTile valeur={`${(fin.cfu_2025.recettes_reelles_fonctionnement / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M€`} label="Recettes réelles de fonctionnement (2025)" note="CFU 2025 officiel" />
            <StatTile valeur={`${fin.cfu_2025.ratio_endettement_pct_rrf.toLocaleString("fr-FR")} %`} label="Dette / recettes de fonctionnement (2025)" note={`${fin.cfu_2023.ratio_endettement_pct_rrf.toLocaleString("fr-FR")} % en 2023`} />
          </TuilesGrid>
          <HBarList
            titre="Encours de dette par habitant"
            sousTitre="Le recours à l'emprunt accompagne les grands chantiers du mandat (4e groupe scolaire, Hôtel de Ville, ZAC)."
            items={dette.valeurs.map(v => ({
              label: String(v.annee),
              valeur: v.valeur,
              affiche: `${v.valeur.toLocaleString("fr-FR")} €`,
              confirme: v.confirme,
              note: v.source,
            }))}
            source="CFU officiels (Mégalis) et DGFiP"
            sourceUrl="https://data.megalis.bretagne.bzh/?siren=213500473"
          />
          <CommentLire>{dette.note}</CommentLire>
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
