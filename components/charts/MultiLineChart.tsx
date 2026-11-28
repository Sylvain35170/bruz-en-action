import Provenance from "./Provenance";

// Courbes comparées (2 à 3 séries) sur un axe d'années — SVG rendu côté
// serveur, zéro JS client. Même grammaire visuelle que LineSeriesChart :
// la série principale (Bruz) en orange, les séries de référence en gris
// pointillé ; valeur annotée en fin de courbe, annotations datées
// optionnelles (pics exceptionnels), table des données repliée dessous.

export type SerieNommee = {
  nom: string;
  points: { annee: number; valeur: number }[];
  reference?: boolean; // série de comparaison : gris, pointillé
  couleur?: string;
};

export type Annotation = { annee: number; texte: string };

const ACCENT = "#E8A040";
const BLEU = "#1A4177";
const GRIS = "#94a3b8";

export default function MultiLineChart({
  titre,
  sousTitre,
  series,
  unite,
  decimales = 0,
  annotations = [],
  source,
  sourceUrl,
}: {
  titre: string;
  sousTitre?: string;
  series: SerieNommee[];
  unite?: string; // suffixe affiché (ex. " M€", " €/hab")
  decimales?: number;
  annotations?: Annotation[];
  source: string;
  sourceUrl?: string;
}) {
  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

  const W = 720, H = 300, PAD_L = 56, PAD_R = 96, PAD_T = 28, PAD_B = 34;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const tous = series.flatMap(s => s.points);
  const xMin = Math.min(...tous.map(p => p.annee));
  const xMax = Math.max(...tous.map(p => p.annee));
  // Maximum arrondi à un pas « rond » (1, 2, 2,5, 5 × 10^n) pour des graduations lisibles.
  const brut = Math.max(...tous.map(p => p.valeur)) * 1.05;
  const puissance = Math.pow(10, Math.floor(Math.log10(brut / 4)));
  const pasY = [1, 2, 2.5, 5, 10, 20].map(m => m * puissance).find(m => Math.ceil(brut / m) <= 5) ?? 20 * puissance;
  const nbGrad = Math.ceil(brut / pasY);
  const yMax = pasY * nbGrad;

  const x = (a: number) => PAD_L + ((a - xMin) / (xMax - xMin)) * chartW;
  const y = (v: number) => PAD_T + chartH * (1 - v / yMax);

  const pas = xMax - xMin > 12 ? 4 : 2;
  const xTicks: number[] = [];
  for (let a = xMin; a <= xMax; a += pas) xTicks.push(a);
  if (xTicks[xTicks.length - 1] !== xMax) xTicks.push(xMax);

  const couleurDe = (s: SerieNommee, i: number) =>
    s.couleur ?? (s.reference ? GRIS : i === 0 ? ACCENT : BLEU);

  // Étiquettes de fin de courbe : écartées verticalement si elles se chevauchent.
  const fins = series
    .map((s, i) => {
      const dernier = s.points[s.points.length - 1];
      return { i, yv: y(dernier.valeur), texte: `${fmt(dernier.valeur)}${unite ?? ""}`, nom: s.nom };
    })
    .sort((a, b) => a.yv - b.yv);
  for (let k = 1; k < fins.length; k++) {
    if (fins[k].yv - fins[k - 1].yv < 24) fins[k].yv = fins[k - 1].yv + 24;
  }

  const annees = Array.from(new Set(tous.map(p => p.annee))).sort((a, b) => a - b);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{titre}</div>
      {sousTitre && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{sousTitre}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 6 }}>
        {series.map((s, i) => (
          <span key={s.nom} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
            <svg width={22} height={8} aria-hidden="true">
              <line x1={0} y1={4} x2={22} y2={4} stroke={couleurDe(s, i)} strokeWidth={s.reference ? 2 : 3} strokeDasharray={s.reference ? "4 3" : undefined} />
            </svg>
            {s.nom}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block" }} role="img" aria-label={titre}>
        {Array.from({ length: nbGrad }, (_, k) => pasY * (k + 1)).map(v => (
          <g key={v}>
            <line x1={PAD_L} y1={y(v)} x2={W - PAD_R} y2={y(v)} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD_L - 6} y={y(v) + 4} textAnchor="end" fontSize={9.5} fill="#94a3b8">
              {fmt(v)}
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
        {annotations.map(an => (
          <g key={an.annee + an.texte}>
            <line x1={x(an.annee)} y1={PAD_T - 6} x2={x(an.annee)} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="2 3" />
            <text x={x(an.annee)} y={PAD_T - 10} textAnchor="middle" fontSize={9.5} fill="#64748b">{an.texte}</text>
          </g>
        ))}
        {series.map((s, i) => {
          const d = s.points.map((p, k) => `${k === 0 ? "M" : "L"}${x(p.annee).toFixed(1)},${y(p.valeur).toFixed(1)}`).join(" ");
          const c = couleurDe(s, i);
          return (
            <g key={s.nom}>
              <path d={d} fill="none" stroke={c} strokeWidth={s.reference ? 2 : 2.5} strokeDasharray={s.reference ? "5 4" : undefined} strokeLinejoin="round" strokeLinecap="round" />
              {!s.reference && s.points.map(p => (
                <circle key={p.annee} cx={x(p.annee)} cy={y(p.valeur)} r={2.5} fill={c} />
              ))}
            </g>
          );
        })}
        {fins.map(f => {
          const s = series[f.i];
          const dernier = s.points[s.points.length - 1];
          return (
            <g key={s.nom}>
              <circle cx={x(dernier.annee)} cy={y(dernier.valeur)} r={4} fill={couleurDe(s, f.i)} stroke="#fff" strokeWidth={2} />
              <text x={x(dernier.annee) + 8} y={f.yv + 4} fontSize={10.5} fontWeight="bold" fill="#0f172a">{f.texte}</text>
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
                {series.map(s => (
                  <th key={s.nom} style={{ textAlign: "right", padding: "3px 0 3px 16px", borderBottom: "1px solid #e2e8f0" }}>
                    {s.nom}{unite ? ` (${unite.trim()})` : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {annees.map(a => (
                <tr key={a}>
                  <td style={{ padding: "2px 12px 2px 0" }}>{a}</td>
                  {series.map(s => {
                    const p = s.points.find(q => q.annee === a);
                    return <td key={s.nom} style={{ textAlign: "right", padding: "2px 0 2px 16px" }}>{p ? fmt(p.valeur) : "—"}</td>;
                  })}
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
