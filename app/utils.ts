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
