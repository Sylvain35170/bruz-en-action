// Ligne de provenance obligatoire sous chaque graphe / bloc de chiffres :
// source primaire + année de la donnée (+ lien si disponible).
export default function Provenance({
  source,
  annee,
  url,
}: {
  source: string;
  annee?: string | number;
  url?: string;
}) {
  const texte = annee ? `${source} — donnée ${annee}` : source;
  return (
    <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 10 }}>
      Source :{" "}
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "underline" }}>
          {texte}
        </a>
      ) : (
        texte
      )}
    </div>
  );
}
