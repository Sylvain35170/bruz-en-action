/** "Jean-René Houssin" → "HOUSSIN - Jean-René" */
export function formatNomPrenom(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length < 2) return fullName;
  const prenom = parts.slice(0, -1).join(" ");
  const nom = parts[parts.length - 1].toUpperCase();
  return `${nom} - ${prenom}`;
}
