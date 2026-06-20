import metaData from "../data/meta.json";

const EMAIL = metaData.contact.email;

const TYPES = [
  "Inexactitude ou imprécision",
  "Promesse manquante",
  "Info sur un dossier",
  "Lien cassé",
  "Autre",
];

type Props = {
  reference?: string;   // ex: "D01 — Trambus T4" ou "Promesse #12"
  variant?: "inline" | "footer";
};

function buildMailto(ref?: string) {
  const subject = ref
    ? `[SIGNALEMENT] Réf : ${ref}`
    : "[SIGNALEMENT] Bruz en Action";

  const body = [
    "TYPE (choisir un) :",
    TYPES.map((t) => `  [ ] ${t}`).join("\n"),
    "",
    `RÉFÉRENCE : ${ref ?? "(ex: D01 — Trambus T4, Promesse #12)"}`,
    "",
    "MESSAGE :",
    "(décrivez le problème ou l'information)",
    "",
    "SOURCE :",
    "(lien ou document si applicable)",
    "",
    "EMAIL DE CONTACT (optionnel) :",
    "",
    "---",
    "Envoyé depuis www.archipel-formation.fr/bruz-en-action",
  ].join("\n");

  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function SignalementButton({ reference, variant = "inline" }: Props) {
  const href = buildMailto(reference);

  if (variant === "footer") {
    return (
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>
            Vous avez une info, une erreur à signaler ?
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
            Inexactitude, promesse manquante, lien cassé — on corrige.
          </div>
        </div>
        <a href={href}
          style={{
            flexShrink: 0,
            fontSize: 13, fontWeight: 700,
            padding: "8px 18px", borderRadius: 999,
            background: "rgba(249,115,22,0.15)",
            border: "1px solid rgba(249,115,22,0.4)",
            color: "#f97316", textDecoration: "none",
          }}>
          ✉️ Signaler
        </a>
      </div>
    );
  }

  return (
    <a href={href}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 12, fontWeight: 600,
        padding: "6px 14px", borderRadius: 999,
        background: "#f0f9ff",
        border: "1px solid #bae6fd",
        color: "#0369a1", textDecoration: "none",
      }}>
      ✉️ Signaler une erreur sur cette page
    </a>
  );
}
