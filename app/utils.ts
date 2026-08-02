/** Niveaux institutionnels des acteurs `qui_decide` (dossiers.json) et de la page /qui-fait-quoi */
export const NIVEAU_CONFIG: Record<string, { label: string; couleur: string }> = {
  commune: { label: "Commune", couleur: "#2563eb" },
  metropole: { label: "Rennes Métropole", couleur: "#7c3aed" },
  intercommunal: { label: "Intercommunal", couleur: "#0891b2" },
  departement: { label: "Département 35", couleur: "#059669" },
  region: { label: "Région Bretagne", couleur: "#d97706" },
  etat: { label: "État", couleur: "#374151" },
  autre: { label: "Autre acteur", couleur: "#64748b" },
};

/**
 * Thèmes de l'agenda (/agenda).
 *
 * Le champ `categorie` d'evenements.json est le tag brut scrapé sur le site de
 * la mairie : 15 valeurs pour 44 événements, avec des doublons sémantiques
 * (Association / Vie associative) et un nom de série pris pour une catégorie
 * (Des Places et Vous). Le regroupement vit donc **dans le code** et pas dans
 * les données : `agent_agenda` réécrit les événements à chaque scraping, un
 * champ ajouté à la main y serait perdu au run suivant.
 */
export const THEMES_AGENDA: { id: string; label: string; couleur: string; tags: string[] }[] = [
  { id: "culture",     label: "Culture & spectacles",    couleur: "#7c3aed",
    tags: ["Théâtre", "Concert", "Spectacle", "Exposition", "Culture"] },
  { id: "rencontres",  label: "Rencontres & citoyenneté", couleur: "#2563eb",
    tags: ["Rencontre", "Des Places et Vous"] },
  { id: "mediatheque", label: "Médiathèque",             couleur: "#0891b2",
    tags: ["Médiathèque"] },
  { id: "solidarite",  label: "Solidarité & entraide",   couleur: "#059669",
    tags: ["Solidarité"] },
  { id: "ateliers",    label: "Ateliers",                couleur: "#d97706",
    tags: ["Atelier"] },
  { id: "associatif",  label: "Vie associative",         couleur: "#db2777",
    tags: ["Association", "Vie associative"] },
  { id: "vie_locale",  label: "Vie locale & commerce",   couleur: "#ea580c",
    tags: ["Braderie", "Vie locale", "Marché"] },
  { id: "sport",       label: "Sport",                   couleur: "#16a34a",
    tags: ["Sport", "Sport & Handisport"] },
  // Bac de secours obligatoire : sans lui, un tag inconnu ferait disparaître
  // l'événement de toutes les sections sans la moindre erreur — c'est le défaut
  // constaté sur /coup-de-pouce le 2026-07-28.
  { id: "autres",      label: "Autres rendez-vous",      couleur: "#64748b", tags: [] },
];

/** Thème d'un événement d'après son tag mairie. Jamais null : repli sur « autres ». */
export function themeEvenement(categorie?: string | null): string {
  if (categorie) {
    const t = THEMES_AGENDA.find(th => th.tags.some(
      tag => tag.toLowerCase() === categorie.trim().toLowerCase()
    ));
    if (t) return t.id;
  }
  return "autres";
}

/**
 * Fiche minimum d'un dossier publié (audit A5) : une illustration et au moins
 * 4 faits sourcés. En dessous du seuil, le dossier porte un badge
 * « Dossier en construction » sur /dossiers et /dossiers/[id].
 */
export function isDossierEnConstruction(d: { image?: unknown; ce_quon_sait?: unknown }): boolean {
  const nbFaits = Array.isArray(d.ce_quon_sait) ? d.ce_quon_sait.length : 0;
  return !d.image || nbFaits < 4;
}

/** "Jean-René Houssin" → "HOUSSIN - Jean-René" */
export function formatNomPrenom(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length < 2) return fullName;
  const prenom = parts.slice(0, -1).join(" ");
  const nom = parts[parts.length - 1].toUpperCase();
  return `${nom} - ${prenom}`;
}
