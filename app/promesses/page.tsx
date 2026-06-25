import promessesData from "../../data/promesses.json";
import metaData from "../../data/meta.json";
import NavBar from "../../components/NavBar";
import PromessesSection from "../../components/PromessesSection";
import SiteFooter from "../../components/SiteFooter";
import SignalementButton from "../../components/SignalementButton";
import type { Pilier, Statut, Promesse } from "../../types";

export const metadata = {
  title: "Suivi des promesses — Bruz en Action",
  description: "Les 50 engagements du programme municipal de Bruz 2026-2031, suivis depuis leur source publique.",
  openGraph: {
    title: "Suivi des promesses — Bruz en Action",
    description: "Les 50 engagements du programme municipal de Bruz 2026-2031, suivis depuis leur source publique.",
    url: "https://sylvain35170.github.io/bruz-en-action/promesses",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

export default function Promesses() {
  const { piliers, statuts, promesses } = promessesData as {
    piliers: Pilier[]; statuts: Statut[]; promesses: Promesse[]; meta: unknown;
  };
  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);

  const total = promesses.length;
  const tenues = promesses.filter(p => p.statut_id === "tenu").length;
  const enCours = promesses.filter(p => p.statut_id === "en_cours").length;
  const nonCommences = promesses.filter(p => p.statut_id === "non_commence").length;
  const score = total > 0 ? Math.round((tenues / total) * 100) : 0;
  const countByPilier = (id: number) => promesses.filter(p => p.pilier_id === id).length;
  const tenusByPilier = (id: number) => promesses.filter(p => p.pilier_id === id && p.statut_id === "tenu").length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero + barre */}
      <div style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 8 }}>
            Transparence municipale
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#fff" }}>
            Les {total} engagements du mandat
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: "0 0 16px", maxWidth: 560 }}>
            Chaque promesse du programme 2026-2031, suivie depuis sa source publique.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "4px 12px" }}>
              🗓 Mise à jour trimestrielle — Prochaine : septembre 2026
            </span>
          </div>

          {/* Barre de progression */}
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{total} engagements</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#4ade80" }}>{score}% tenus</span>
            </div>
            <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden", display: "flex" }}>
              <div style={{ height: "100%", background: "#22c55e", width: `${(tenues / total) * 100}%` }} />
              <div style={{ height: "100%", background: "#f97316", width: `${(enCours / total) * 100}%` }} />
              <div style={{ height: "100%", background: "rgba(255,255,255,0.15)", width: `${(nonCommences / total) * 100}%` }} />
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
              {[
                { color: "#22c55e", label: `${tenues} tenus` },
                { color: "#f97316", label: `${enCours} en cours` },
                { color: "rgba(255,255,255,0.3)", label: `${nonCommences} non commencés` },
              ].map(({ color, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main style={{ flex: 1 }}>

        {/* Posture éditoriale */}
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px 0" }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #f97316", borderRadius: 10, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: 6 }}>Notre posture</div>
              <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                Nous savons que les choses prennent du temps : millefeuille administratif, complexités juridiques, contraintes budgétaires. Nous documentons cela sans l'ignorer.
                En revanche, tout <strong style={{ color: "#0f172a" }}>changement de cap ou renoncement explicite sera documenté</strong> — c'est notre engagement envers les habitants.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: 6 }}>Vous avez repéré une erreur ?</div>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                Nous ne sommes pas des professionnels de la politique. Si vous constatez une inexactitude, une imprécision, ou qu'il manque une promesse — signalez-le.
              </p>
              <SignalementButton reference="Promesses" />
            </div>
          </div>
        </div>

        {/* Piliers */}
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 40 }}>
            {piliers.map(pilier => {
              const count = countByPilier(pilier.id);
              const tenus = tenusByPilier(pilier.id);
              const pct = count > 0 ? Math.round((tenus / count) * 100) : 0;
              return (
                <div key={pilier.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ height: 4, background: pilier.color }} />
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{pilier.emoji} {pilier.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: `color-mix(in srgb, ${pilier.color} 12%, white)`, color: pilier.color }}>{count}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 999, background: pilier.color, width: `${pct}%` }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{pct}% tenus</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableau complet */}
        <PromessesSection promesses={promesses} piliers={piliers} statuts={statuts} />
      </main>

      <SiteFooter />
    </div>
  );
}
