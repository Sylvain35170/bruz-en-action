"use client";
import { useState, useEffect } from "react";
import metaData from "../data/meta.json";

const LOGO = "/bruz-en-action/logo.png";

const NAV_LINKS = [
  { href: "/bruz-en-action/dossiers", label: "📁 Dossiers" },
  { href: "/bruz-en-action/conseils", label: "🏛️ Conseils" },
  { href: "/bruz-en-action/promesses", label: "✅ Promesses" },
  { href: "/bruz-en-action/programme", label: "📋 Programme" },
  { href: "/bruz-en-action/elus", label: "👥 Élus" },
  { href: "/bruz-en-action/carte", label: "🗺️ Carte" },
  { href: "/bruz-en-action/interagir", label: "💬 Interagir" },
  { href: "/bruz-en-action/chronologie", label: "🕐 Chronologie" },
  { href: "/bruz-en-action/metropole", label: "🏙️ Métropole" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { association, contact, reseaux_sociaux } = metaData;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        {/* Logo */}
        <a href="/bruz-en-action" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt={association.nom} width={140} height={44}
            style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 8px" }} />
        </a>

        {/* Desktop nav */}
        <nav className="bea-nav-desktop" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600, textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
          {reseaux_sociaux.facebook && (
            <a href={reseaux_sociaux.facebook} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Facebook</a>
          )}
          {contact.hello_asso_url && (
            <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 18px", borderRadius: 999, background: "#f97316", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              ❤️ Adhérer
            </a>
          )}
        </nav>

        {/* Hamburger (mobile) */}
        <button className="bea-hamburger" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#fff", display: "none" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)" }}
          onClick={() => setOpen(false)}>
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "min(300px, 85vw)", height: "100%",
            background: "#0E2F62",
            display: "flex", flexDirection: "column",
            padding: "20px 16px",
          }} onClick={e => e.stopPropagation()}>

            {/* Drawer header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={120} height={38}
                style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 6, padding: "3px 8px" }} />
              <button onClick={() => setOpen(false)} aria-label="Fermer le menu"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 4 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav style={{ display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                  style={{ padding: "13px 12px", borderRadius: 8, color: "#fff", fontSize: 16, fontWeight: 600, textDecoration: "none", display: "block" }}>
                  {l.label}
                </a>
              ))}
              {reseaux_sociaux.facebook && (
                <a href={reseaux_sociaux.facebook} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                  style={{ padding: "13px 12px", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 500, textDecoration: "none", display: "block" }}>
                  📘 Facebook
                </a>
              )}
            </nav>

            {contact.hello_asso_url && (
              <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 999, background: "#f97316", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", marginTop: 12 }}>
                ❤️ Adhérer à l'association
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
