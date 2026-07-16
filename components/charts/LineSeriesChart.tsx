import Provenance from "./Provenance";

// Courbe de série longue, SVG rendu côté serveur (zéro JS client).
// Axe X à l'échelle des années (les recensements ne sont pas équidistants).
// Labels directs sélectifs : premier, dernier, minimum et maximum de la série.
// Fallback accessibilité : table des données repliée sous le graphe.

export type SeriePoint = { annee: number; valeur: number };

const ACCENT = "#E8A040";

function formatNombre(n: number): string {
  return n.toLocaleString("fr-FR");
}

export default function LineSeriesChart({
  titre,
  sousTitre,
  serie,
  unite,
  source,
  sourceUrl,
}: {
  titre: string;
  sousTitre?: string;
  serie: SeriePoint[];
  unite?: string;
  source: string;
  sourceUrl?: string;
}) {
  const W = 720, H = 280, PAD_L = 56, PAD_R = 20, PAD_T = 18, PAD_B = 34;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const annees = serie.map(p => p.annee);
  const valeurs = serie.map(p => p.valeur);
  const xMin = Math.min(...annees), xMax = Math.max(...annees);
  const yMax = Math.max(...valeurs) * 1.08;

  const x = (annee: number) => PAD_L + ((annee - xMin) / (xMax - xMin)) * chartW;
  const y = (valeur: number) => PAD_T + chartH * (1 - valeur / yMax);

  const path = serie.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.annee).toFixed(1)},${y(p.valeur).toFixed(1)}`).join(" ");
  const area = `${path} L${x(xMax).toFixed(1)},${PAD_T + chartH} L${x(xMin).toFixed(1)},${PAD_T + chartH} Z`;

  // Labels directs sélectifs : premier, dernier, min, max (dédupliqués)
  const iMin = valeurs.indexOf(Math.min(...valeurs));
  const iMax = valeurs.indexOf(Math.max(...valeurs));
  const labelIdx = Array.from(new Set([0, serie.length - 1, iMin, iMax]));

  // Ticks X : décennies rondes tous les 25 ans
  const xTicks: number[] = [];
  for (let a = Math.ceil(xMin / 25) * 25; a <= xMax; a += 25) xTicks.push(a);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{titre}</div>
      {sousTitre && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{sousTitre}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block" }} role="img" aria-label={titre}>
        {[0.25, 0.5, 0.75, 1].map(p => (
          <g key={p}>
            <line x1={PAD_L} y1={y(yMax * p)} x2={W - PAD_R} y2={y(yMax * p)} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD_L - 6} y={y(yMax * p) + 4} textAnchor="end" fontSize={9.5} fill="#94a3b8">
              {formatNombre(Math.round(yMax * p))}
            </text>
          </g>
        ))}
        <line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH} stroke="#e2e8f0" strokeWidth={1} />
        {xTicks.map(a => (
          <g key={a}>
            <line x1={x(a)} y1={PAD_T + chartH} x2={x(a)} y2={PAD_T + chartH + 4} stroke="#cbd5e1" strokeWidth={1} />
            <text x={x(a)} y={PAD_T + chartH + 16} textAnchor="middle" fontSize={10} fill="#64748b">{a}</text>
          </g>
        ))}
        <path d={area} fill="rgba(232,160,64,0.10)" />
        <path d={path} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {labelIdx.map(i => {
          const p = serie[i];
          const estDernier = i === serie.length - 1;
          const dx = estDernier ? -4 : 0;
          const anchor = estDernier ? "end" : i === 0 ? "start" : "middle";
          const dy = i === iMin ? 16 : -8; // le minimum est annoté sous le point
          return (
            <g key={p.annee}>
              <circle cx={x(p.annee)} cy={y(p.valeur)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />
              <text x={x(p.annee) + dx} y={y(p.valeur) + dy} textAnchor={anchor} fontSize={10.5} fontWeight="bold" fill="#0f172a">
                {formatNombre(p.valeur)}
              </text>
            </g>
          );
        })}
      </svg>
      <details style={{ marginTop: 10 }}>
        <summary style={{ fontSize: 12, color: "#64748b", cursor: "pointer" }}>Voir les données du graphique</summary>
        <div style={{ overflowX: "auto" }}>
          <table style={{ fontSize: 12, color: "#334155", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "3px 12px 3px 0", borderBottom: "1px solid #e2e8f0" }}>Année</th>
                <th style={{ textAlign: "right", padding: "3px 0", borderBottom: "1px solid #e2e8f0" }}>{unite ?? "Valeur"}</th>
              </tr>
            </thead>
            <tbody>
              {serie.map(p => (
                <tr key={p.annee}>
                  <td style={{ padding: "2px 12px 2px 0" }}>{p.annee}</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>{formatNombre(p.valeur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <Provenance source={source} url={sourceUrl} />
    </div>
  );
}
