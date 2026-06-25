import metaData from "../data/meta.json";
import SignalementButton from "./SignalementButton";

const { association, contact, reseaux_sociaux } = metaData;

export default function SiteFooter() {
  return (
    <footer style={{ background: "#1B3A6B", color: "rgba(255,255,255,0.6)" }}>
      {/* Bande image + présentation */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{
          maxWidth: "var(--container-max, 1120px)", margin: "0 auto",
          padding: "40px 24px",
          display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bruz-en-action/og-image.jpg"
            alt="Bruz En Action"
            style={{ width: "min(200px, 100%)", borderRadius: 12, opacity: 0.9, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 220 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bruz-en-action/logo.png"
              alt={association.nom}
              height={36}
              style={{ objectFit: "contain", marginBottom: 12, filter: "brightness(0) invert(1)" }}
            />
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", maxWidth: 480 }}>
              {association.description}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {reseaux_sociaux.facebook && (
                <a href={reseaux_sociaux.facebook} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "4px 12px" }}>
                  Facebook
                </a>
              )}
              {reseaux_sociaux.instagram && (
                <a href={reseaux_sociaux.instagram} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "4px 12px" }}>
                  Instagram
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`}
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "4px 12px" }}>
                  {contact.email}
                </a>
              )}
            </div>
          </div>
          {/* Nav rapide */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Navigation</span>
            {[
              { href: "/bruz-en-action", label: "Accueil" },
              { href: "/bruz-en-action/dossiers", label: "Dossiers" },
              { href: "/bruz-en-action/conseils", label: "Conseils municipaux" },
              { href: "/bruz-en-action/promesses", label: "Promesses" },
              { href: "/bruz-en-action/elus", label: "Élus" },
              { href: "/bruz-en-action/carte", label: "Carte" },
              { href: "/bruz-en-action/interagir", label: "Interagir" },
              { href: "/bruz-en-action/chronologie", label: "Chronologie" },
              { href: "/bruz-en-action/metropole", label: "Rennes Métropole" },
            ].map(({ href, label }) => (
              <a key={href} href={href}
                style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Signalement */}
      <div style={{ maxWidth: "var(--container-max, 1120px)", margin: "0 auto", padding: "20px 24px 0" }}>
        <SignalementButton variant="footer" />
      </div>

      {/* Bas de page */}
      <div style={{ maxWidth: "var(--container-max, 1120px)", margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11 }}>© {association.fondee_en} {association.nom} · Association loi 1901 · Bruz (35170)</span>
        {contact.hello_asso_url && (
          <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: "#f97316", textDecoration: "none", fontWeight: 600 }}>
            ❤️ Adhérer sur HelloAsso
          </a>
        )}
      </div>
    </footer>
  );
}
