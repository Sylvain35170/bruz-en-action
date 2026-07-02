import type { Metadata } from "next";
import dossiers from "../../data/dossiers.json";
import metaData from "../../data/meta.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Chronologie — Bruz en Action",
  description: "Toutes les décisions et actualités qui ont marqué la vie municipale de Bruz depuis 2026 — classées par date.",
  openGraph: {
    title: "Chronologie — Bruz en Action",
    description: "Toutes les décisions et actualités qui ont marqué la vie municipale de Bruz depuis 2026 — classées par date.",
    url: "https://sylvain35170.github.io/bruz-en-action/chronologie",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

// Palette par dossier (cohérente avec les catégories)
const DOSSIER_COLORS: Record<string, string> = {
  D01: "#2563eb", // mobilité — bleu
  D02: "#7c3aed", // urbanisme — violet
  D03: "#059669", // finances — vert
  D04: "#dc2626", // taxe — rouge
  D05: "#0891b2", // carte — cyan
  D06: "#d97706", // piscine — ambre
  D07: "#374151", // sécurité — gris anthracite
  D09: "#db2777", // culture — rose
  D10: "#ea580c", // éducation — orange
  D11: "#65a30d", // patrimoine — vert clair
  D20: "#0d9488", // campus/étudiant — teal
};

type RawEvent = {
  date: string;
  type: "decision" | "actu";
  dossier_id: string;
  dossier_titre: string;
  texte: string;
  source_url: string | null;
};

function buildEvents(): RawEvent[] {
  const events: RawEvent[] = [];

  dossiers.dossiers.forEach((dos) => {
    const decisions: { date: string; description: string; source_url?: string }[] = (dos as any).decisions ?? [];
    const actus: { date: string; titre: string; detail?: string; source_url?: string }[] = (dos as any).actus_recentes ?? [];

    decisions.forEach((d) => {
      events.push({
        date: d.date,
        type: "decision",
        dossier_id: dos.id,
        dossier_titre: dos.titre,
        texte: d.description,
        source_url: d.source_url ?? null,
      });
    });

    actus.forEach((a) => {
      events.push({
        date: a.date,
        type: "actu",
        dossier_id: dos.id,
        dossier_titre: dos.titre,
        texte: a.titre,
        source_url: a.source_url ?? null,
      });
    });
  });

  return events.sort((a, b) => b.date.localeCompare(a.date));
}

function formatDate(iso: string): string {
  if (iso.length === 4) return iso; // année seule
  const expanded = iso.length === 7 ? `${iso}-01` : iso;
  return new Date(expanded).toLocaleDateString("fr-FR", { day: iso.length > 7 ? "numeric" : undefined, month: "long", year: "numeric" });
}

function monthKey(iso: string): string {
  if (iso.length <= 4) return iso;
  return iso.slice(0, 7); // YYYY-MM
}

function formatMonthKey(key: string): string {
  if (key.length === 4) return key;
  const [y, m] = key.split("-");
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export default function ChronologiePage() {
  const { association } = metaData;
  const events = buildEvents();

  // Group by month
  const grouped: { key: string; events: RawEvent[] }[] = [];
  events.forEach((e) => {
    const key = monthKey(e.date);
    const last = grouped[grouped.length - 1];
    if (last && last.key === key) {
      last.events.push(e);
    } else {
      grouped.push({ key, events: [e] });
    }
  });

  // Stats
  const decisions = events.filter((e) => e.type === "decision").length;
  const actus = events.filter((e) => e.type === "actu").length;
  const dossiersImpliques = new Set(events.map((e) => e.dossier_id)).size;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#fff" }}>
            Chronologie
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 560, margin: "0 0 28px" }}>
            Toutes les décisions et actualités documentées — classées du plus récent au plus ancien.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { n: decisions, label: "Décisions clés", color: "#E8A040" },
              { n: actus, label: "Actus documentées", color: "#0284c7" },
              { n: dossiersImpliques, label: "Dossiers concernés", color: "#7c3aed" },
            ].map(({ n, label, color }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color }}>{n}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

          {/* Légende */}
          <div style={{ display: "flex", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E8A040", display: "inline-block" }} />
              Décision officielle
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0284c7", display: "inline-block" }} />
              Actualité
            </div>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", paddingLeft: 32 }}>
            {/* Trait vertical */}
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: "#e2e8f0" }} />

            {grouped.map(({ key, events: groupEvents }) => (
              <div key={key} style={{ marginBottom: 36 }}>
                {/* Mois */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ position: "absolute", left: -28, width: 16, height: 16, borderRadius: "50%", background: "#0E2F62", border: "3px solid #f8fafc", boxShadow: "0 0 0 2px #cbd5e1", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0f172a" }}>
                    {formatMonthKey(key)}
                  </span>
                </div>

                {/* Events du mois */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {groupEvents.map((ev, i) => {
                    const color = DOSSIER_COLORS[ev.dossier_id] ?? "#64748b";
                    const isDecision = ev.type === "decision";
                    const dossierHref = `/bruz-en-action/dossiers/${ev.dossier_id}`;
                    return (
                      <div key={i} style={{ position: "relative", display: "flex", gap: 14, alignItems: "flex-start" }}>
                        {/* Dot */}
                        <div style={{ position: "absolute", left: -24, top: 14, width: 10, height: 10, borderRadius: "50%", background: isDecision ? "#E8A040" : "#0284c7", border: "2px solid #f8fafc", flexShrink: 0 }} />

                        {/* Card */}
                        <div style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "12px 16px" }}>
                          {/* Ligne haute : date + badges */}
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              {formatDate(ev.date)}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                              color: isDecision ? "#E8A040" : "#0284c7",
                              background: isDecision ? "#fff1ee" : "#f0f9ff",
                              padding: "1px 7px", borderRadius: 999 }}>
                              {isDecision ? "Décision" : "Actu"}
                            </span>
                            <a href={dossierHref}
                              style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: color, padding: "1px 8px", borderRadius: 999, textDecoration: "none" }}>
                              {ev.dossier_id}
                            </a>
                          </div>

                          {/* Texte — cliquable vers le dossier */}
                          <a href={dossierHref} style={{ textDecoration: "none", display: "block", marginBottom: ev.source_url ? 10 : 0 }}>
                            <p style={{ margin: 0, fontSize: 13, color: "#0f172a", lineHeight: 1.6, fontWeight: 500 }}>{ev.texte}</p>
                          </a>

                          {/* Pied de carte : source externe + lien dossier */}
                          {(ev.source_url) && (
                            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
                              {ev.source_url && (
                                <a href={ev.source_url} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: 12, color: "#0284c7", textDecoration: "none", fontWeight: 600 }}>
                                  Voir la source ↗
                                </a>
                              )}
                              <a href={dossierHref}
                                style={{ fontSize: 12, color: color, textDecoration: "none", fontWeight: 600, marginLeft: "auto" }}>
                                Dossier {ev.dossier_id} →
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
