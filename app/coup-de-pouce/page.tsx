import NavBar from "../../components/NavBar";
import coupData from "../../data/coup_de_pouce.json";

type TypeItem = "association" | "commerce" | "cause";
type BesoinItem = "bénévoles" | "dons" | "clients" | "visibilité" | "signatures" | null;

interface CoupDePouce {
  id: string;
  type: TypeItem;
  titre: string;
  chapeau: string;
  besoin: BesoinItem;
  lien: string | null;
  contact: string | null;
  date_ajout: string;
  active: boolean;
}

const TYPE_CONFIG: Record<TypeItem, { label: string; color: string; bg: string; emoji: string }> = {
  association: { label: "Association", color: "#1d4ed8", bg: "#eff6ff", emoji: "🤝" },
  commerce:    { label: "Commerce",    color: "#15803d", bg: "#f0fdf4", emoji: "🛍️" },
  cause:       { label: "Cause",       color: "#b45309", bg: "#fffbeb", emoji: "📣" },
};

const BESOIN_LABEL: Record<string, string> = {
  bénévoles:  "🙋 Cherche des bénévoles",
  dons:       "💝 Cherche des dons",
  clients:    "🛒 À découvrir",
  visibilité: "📢 Cherche de la visibilité",
  signatures: "✍️ Pétition en cours",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function CoupDePoucePage() {
  const items = (coupData.items as CoupDePouce[]).filter(i => i.active);

  const byType = (type: TypeItem) => items.filter(i => i.type === type);
  const associations = byType("association");
  const commerces    = byType("commerce");
  const causes       = byType("cause");

  const sections: { type: TypeItem; items: CoupDePouce[] }[] = (
    [
      { type: "cause"       as TypeItem, items: causes },
      { type: "association" as TypeItem, items: associations },
      { type: "commerce"    as TypeItem, items: commerces },
    ] as { type: TypeItem; items: CoupDePouce[] }[]
  ).filter(s => s.items.length > 0);

  return (
    <main>
      {/* Hero */}
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div className="bea-header-inner" style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 56px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤲</div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            Coup de pouce
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.82)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
            Des causes à soutenir, des commerces à découvrir, des associations qui ont besoin de vous.
            Bruz en Action met en lumière des initiatives locales qui méritent d&apos;être connues.
          </p>
        </div>
      </header>

      {/* Contenu */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        {items.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "1.05rem" }}>
            Aucune initiative référencée pour l&apos;instant.
          </p>
        ) : (
          sections.map(({ type, items: sectionItems }) => {
            const cfg = TYPE_CONFIG[type];
            return (
              <section key={type} style={{ marginBottom: 48 }}>
                <h2 style={{
                  fontSize: "1.1rem", fontWeight: 700, color: cfg.color,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  borderBottom: `2px solid ${cfg.color}`, paddingBottom: 8, marginBottom: 24,
                }}>
                  {cfg.emoji} {cfg.label}s
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {sectionItems.map(item => (
                    <article key={item.id} style={{
                      background: "#fff", borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      padding: "20px 24px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                          {item.titre}
                        </h3>
                        {item.besoin && (
                          <span style={{
                            fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                            background: cfg.bg, color: cfg.color, whiteSpace: "nowrap", flexShrink: 0,
                          }}>
                            {BESOIN_LABEL[item.besoin] ?? item.besoin}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "10px 0 0", color: "#334155", fontSize: "0.95rem", lineHeight: 1.6 }}>
                        {item.chapeau}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                        {item.lien && (
                          <a href={item.lien} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8", textDecoration: "none" }}>
                            Voir le site →
                          </a>
                        )}
                        {item.contact && (
                          <a href={`mailto:${item.contact}`}
                            style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8", textDecoration: "none" }}>
                            Contacter →
                          </a>
                        )}
                        <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>
                          Ajouté le {fmtDate(item.date_ajout)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })
        )}

        {/* Appel à contribution */}
        <div style={{
          marginTop: 48, background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)",
          borderRadius: 16, padding: "32px 28px", color: "#fff", textAlign: "center",
        }}>
          <p style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: "#fff" }}>
            Vous avez une initiative à signaler ?
          </p>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", marginBottom: 20 }}>
            Une association qui cherche des bénévoles, un nouveau commerce, une cause locale — partagez-le nous.
          </p>
          <a href="/bruz-en-action/interagir"
            style={{ display: "inline-block", padding: "12px 28px", borderRadius: 999, background: "#f97316", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
            Nous contacter
          </a>
        </div>
      </div>
    </main>
  );
}
