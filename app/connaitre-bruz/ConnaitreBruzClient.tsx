"use client";

import { useMemo, useState } from "react";
import bruz from "../../data/bruz.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

type Fact = { label: string; valeur: string; note?: string };
type Section = {
  id: string;
  emoji: string;
  titre: string;
  facts: Fact[];
  source?: string;
  sourceUrl?: string;
  dossierLien?: { href: string; label: string };
};

const fr = (n: number) => n.toLocaleString("fr-FR");

function buildSections(): Section[] {
  const id = bruz.identite;
  const gouv = bruz.gouvernance;
  const edu = bruz.education;
  const eq = bruz.equipements;
  const urb = bruz.urbanisme;
  const tr = bruz.transports;
  const sp = bruz.sport;
  const eco = bruz.economie_locale;
  const env = bruz.environnement_climat;
  const cult = bruz.culture_patrimoine;

  return [
    {
      id: "identite",
      emoji: "🪪",
      titre: "Identité",
      facts: [
        { label: "Code INSEE", valeur: id.code_insee },
        { label: "Code postal", valeur: id.code_postal },
        { label: "Département", valeur: id.departement },
        { label: "Intercommunalité", valeur: id.intercommunalite },
        { label: "Situation", valeur: id.situation },
        { label: "Rang départemental", valeur: id.rang_departemental },
      ],
    },
    {
      id: "gouvernance",
      emoji: "🏛️",
      titre: "Gouvernance",
      facts: [
        { label: "Mandat en cours", valeur: gouv.mandat_en_cours },
        { label: "Maire", valeur: gouv.maire },
        { label: "Liste majoritaire", valeur: gouv.liste_majoritaire },
        { label: "Nombre d'élus", valeur: `${gouv.nombre_elus}`, note: gouv.note },
      ],
      dossierLien: { href: "/bruz-en-action/elus", label: "Voir tous les élus" },
    },
    {
      id: "education",
      emoji: "🎓",
      titre: "Éducation",
      facts: [
        { label: "Écoles primaires publiques", valeur: `${edu.ecoles_primaires_publiques.length}`, note: edu.ecoles_primaires_publiques.map(e => e.nom).join(", ") },
        { label: "Écoles privées", valeur: `${edu.ecoles_privees.length}`, note: edu.ecoles_privees.map(e => e.nom).join(", ") },
        { label: "Collège public", valeur: edu.college.nom },
        { label: "Collège-lycée privé", valeur: edu.college_lycee_prive?.nom ?? "—", note: edu.college_lycee_prive?.reseau },
        { label: "Lycée public", valeur: edu.lycee?.nom ?? "—", note: edu.lycee?.note },
        { label: "Campus Ker Lann", valeur: `${edu.enseignement_superieur.etablissements_nb} établissements, ${edu.enseignement_superieur.etudiants} étudiants`, note: edu.enseignement_superieur.etablissements_notables.join(" · ") },
        { label: "Logement étudiant", valeur: `${edu.enseignement_superieur.logement_etudiant.residences_recensees} résidences`, note: edu.enseignement_superieur.logement_etudiant.note },
        { label: "Projet en cours", valeur: edu.projets[0]?.nom ?? "—", note: `${edu.projets[0]?.statut} — ${edu.projets[0]?.capacite_prevue}` },
      ],
      dossierLien: { href: "/bruz-en-action/dossiers/D10", label: "Dossier D10 — Offre scolaire" },
    },
    {
      id: "equipements",
      emoji: "🏢",
      titre: "Équipements",
      facts: [
        { label: "Piscine", valeur: eq.piscine.nom, note: `${eq.piscine.gestionnaire} — ${eq.piscine.note}` },
        { label: "Médiathèque", valeur: eq.mediatheque.nom, note: eq.mediatheque.adresse },
        { label: "Salle de spectacle", valeur: eq.salle_spectacle.nom, note: eq.salle_spectacle.salles.map(s => `${s.nom} (${s.capacite})`).join(" · ") },
      ],
      dossierLien: { href: "/bruz-en-action/dossiers/D06", label: "Dossier D06 — Piscine de la Conterie" },
    },
    {
      id: "urbanisme",
      emoji: "🏗️",
      titre: "Urbanisme",
      facts: [
        { label: "ZAC Multisites", valeur: `${fr(urb.zac_multisites.logements_prevus)} logements prévus à horizon ${urb.zac_multisites.horizon}`, note: urb.zac_multisites.description },
        { label: "Impact scolaire estimé", valeur: urb.zac_multisites.impact_scolaire_estime },
        { label: "Secteurs principaux", valeur: urb.secteurs_principaux.join(", ") },
      ],
      dossierLien: { href: "/bruz-en-action/dossiers/D02", label: "Dossier D02 — ZAC Multisites" },
    },
    {
      id: "transports",
      emoji: "🚌",
      titre: "Transports",
      facts: [
        { label: "T4 (trambus)", valeur: tr.t4_tramway.description, note: `Mise en service estimée ${tr.t4_tramway.horizon_mise_en_service} — pilote : ${tr.t4_tramway.pilote}` },
        { label: "Gares", valeur: tr.ferroviaire.gares.join(", "), note: `${tr.ferroviaire.frequence} — ${tr.ferroviaire.temps_trajet_rennes} jusqu'à Rennes` },
        { label: "Lignes de bus STAR", valeur: tr.bus_star.lignes.map(l => l.ligne).join(", ") },
      ],
      dossierLien: { href: "/bruz-en-action/dossiers/D01", label: "Dossier D01 — Trambus T4" },
    },
    {
      id: "sport",
      emoji: "⚽",
      titre: "Sport",
      facts: [
        { label: "Salles couvertes", valeur: `${sp.salles_couvertes_nb}`, note: sp.salles_couvertes.map(s => s.nom).join(", ") },
        { label: "Équipements extérieurs", valeur: `${sp.equipements_exterieurs.length}`, note: sp.equipements_exterieurs.join(" · ") },
        { label: "City stade Siméon Beliard", valeur: "démonté en 2026", note: sp.city_stades.simeon_beliard.reconstruction_annoncee },
      ],
      dossierLien: { href: "/bruz-en-action/dossiers/D24", label: "Dossier D24 — Équipements sportifs" },
    },
    {
      id: "economie",
      emoji: "💼",
      titre: "Économie locale",
      facts: [
        { label: "Zones d'activité", valeur: `${eco.zones_activite_nb}`, note: eco.zones_activite.map(z => `${z.nom} (${z.surface_ha ?? "?"} ha, ${z.entreprises_nb ?? "?"} entreprises)`).join(" · ") },
        { label: "Marché hebdomadaire", valeur: `depuis ${eco.marches.marche_hebdomadaire.depuis}, ${eco.marches.marche_hebdomadaire.commercants_nb} commerçants` },
        { label: "Adjoint vie économique", valeur: eco.adjoint_vie_economique },
        { label: "Vacance commerciale", valeur: eco.vacance_commerciale },
      ],
      dossierLien: { href: "/bruz-en-action/dossiers/D16", label: "Dossier D16 — Économie locale" },
    },
    {
      id: "environnement",
      emoji: "🌳",
      titre: "Environnement & climat",
      facts: [
        { label: "Plan canicule", valeur: `dernière activation ${env.plan_canicule.derniere_activation}`, note: env.plan_canicule.mesures_2026.join(" · ") },
        { label: "Îlots de fraîcheur", valeur: env.ilots_de_fraicheur },
        { label: "Végétalisation", valeur: env.vegetalisation },
        { label: "Espaces verts principaux", valeur: env.espaces_verts_principaux.join(", ") },
        { label: "Financement mobilisable", valeur: env.financement },
      ],
      dossierLien: { href: "/bruz-en-action/dossiers/D13", label: "Dossier D13 — Canicule" },
    },
    {
      id: "culture",
      emoji: "🎭",
      titre: "Culture & patrimoine",
      facts: [
        { label: "Manoir de la Noë", valeur: cult.manoir_de_la_noe.occupant, note: cult.manoir_de_la_noe.zone_grise },
        { label: "Guinguette estivale", valeur: cult.manoir_de_la_noe.guinguette },
      ],
      dossierLien: { href: "/bruz-en-action/dossiers/D11", label: "Dossier D11 — Manoir de la Noë / Plan B" },
    },
  ];
}

function matches(section: Section, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const haystack = [
    section.titre,
    ...section.facts.flatMap((f) => [f.label, f.valeur, f.note ?? ""]),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export default function ConnaitreBruzClient() {
  const [query, setQuery] = useState("");
  const sections = useMemo(buildSections, []);
  const visibles = sections.filter((s) => matches(s, query));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      <section style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#fff" }}>
            🧭 Connaître Bruz
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 640, margin: "0 0 24px" }}>
            La base de connaissance de Bruz en Action, rendue navigable — identité, gouvernance, écoles,
            équipements, transports, sport, économie, environnement, culture. Chaque fait vient de{" "}
            <code style={{ background: "rgba(255,255,255,0.12)", padding: "1px 6px", borderRadius: 4 }}>bruz.json</code>,
            notre unique source de vérité.
          </p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un mot-clé (ex : école, T4, marché, canicule…)"
            style={{
              width: "100%",
              maxWidth: 480,
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: 14,
            }}
          />
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 56px" }}>
          {visibles.length === 0 && (
            <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", padding: "40px 0" }}>
              Aucun résultat pour « {query} ».
            </p>
          )}
          {visibles.map((s) => (
            <section key={s.id} id={s.id} style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span>{s.emoji}</span>
                {s.titre}
              </h2>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                {s.facts.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      padding: "12px 18px",
                      borderTop: i === 0 ? "none" : "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#64748b" }}>{f.label}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", textAlign: "right" }}>{f.valeur}</span>
                    </div>
                    {f.note && <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{f.note}</div>}
                  </div>
                ))}
              </div>
              {s.dossierLien && (
                <div style={{ marginTop: 10 }}>
                  <a href={s.dossierLien.href} style={{ fontSize: 13, fontWeight: 600, color: "#1A4177", textDecoration: "none" }}>
                    📁 {s.dossierLien.label} →
                  </a>
                </div>
              )}
            </section>
          ))}

          <div style={{ marginTop: 24, padding: "16px 20px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>💡 Pour les chiffres et séries longues</div>
            <div style={{ fontSize: 13, lineHeight: 1.65, color: "#78350f" }}>
              Population, logement, emploi, finances, santé et sécurité sont détaillés avec graphiques sur{" "}
              <a href="/bruz-en-action/statistiques" style={{ color: "#78350f", fontWeight: 700 }}>
                /statistiques
              </a>{" "}
              — et l'histoire longue de la commune sur{" "}
              <a href="/bruz-en-action/histoire" style={{ color: "#78350f", fontWeight: 700 }}>
                /histoire
              </a>
              .
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
