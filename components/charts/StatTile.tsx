// Tuile KPI — un chiffre-titre, son libellé, une note optionnelle.
// Server component, zéro JS client (export statique).
export default function StatTile({
  valeur,
  label,
  note,
}: {
  valeur: string;
  label: string;
  note?: string;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.15 }}>{valeur}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginTop: 4 }}>{label}</div>
      {note && <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4, lineHeight: 1.45 }}>{note}</div>}
    </div>
  );
}
