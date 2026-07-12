// Palette unique des catégories de dossiers — seule source de vérité.
// Utilisée par la homepage, l'index dossiers, la chronologie et les pages métropole.
export const CATEGORIE_COLOR: Record<string, string> = {
  Mobilités: "#0369a1",
  Urbanisme: "#6d28d9",
  Finances: "#15803d",
  Équipements: "#b45309",
  "Services publics": "#dc2626",
  Environnement: "#059669",
  Éducation: "#ea580c",
  Sécurité: "#374151",
  Culture: "#be185d",
  Patrimoine: "#65a30d",
  Santé: "#0d9488",
  Économie: "#a16207",
  Gouvernance: "#475569",
};

export function catColor(categorie: string): string {
  return CATEGORIE_COLOR[categorie] ?? "#64748b";
}
