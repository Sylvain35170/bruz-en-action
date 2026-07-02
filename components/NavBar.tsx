"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import metaData from "../data/meta.json";

const LOGO = "/bruz-en-action/logo.png";

const NAV_GROUPS = [
  {
    label: "📁 Suivre",
    links: [
      { href: "/bruz-en-action/dossiers", label: "📁 Dossiers" },
      { href: "/bruz-en-action/conseils", label: "🏛️ Conseils" },
      { href: "/bruz-en-action/chronologie", label: "🕐 Chronologie" },
      { href: "/bruz-en-action/metropole", label: "🏙️ Métropole" },
    ],
  },
  {
    label: "✅ Engagements",
    links: [
      { href: "/bruz-en-action/programme", label: "📋 Programme" },
      { href: "/bruz-en-action/promesses", label: "✅ Promesses" },
    ],
  },
  {
    label: "👥 Qui décide",
    links: [
      { href: "/bruz-en-action/elus", label: "👥 Élus" },
      { href: "/bruz-en-action/carte", label: "🗺️ Carte" },
    ],
  },
  {
    label: "💬 Participer",
    links: [
      { href: "/bruz-en-action/interagir", label: "💬 Interagir" },
      { href: "/bruz-en-action/coup-de-pouce", label: "🤲 Coup de pouce" },
    ],
  },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [drawerGroup, setDrawerGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const { association, contact, reseaux_sociaux } = metaData;

  const isGroupActive = (group: typeof NAV_GROUPS[number]) =>
    group.links.some(l => pathname === l.href || pathname?.startsWith(l.href + "/"));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setOpenGroup(null); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

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
        <nav ref={navRef} className="bea-nav-desktop" style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          {NAV_GROUPS.map(group => {
            const active = isGroupActive(group);
            const isOpen = openGroup === group.label;
            return (
              <div key={group.label} style={{ position: "relative" }}>
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: isOpen ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "none", cursor: "pointer", borderRadius: 6,
                    padding: "8px 10px",
                    fontSize: 13, color: active ? "#fff" : "rgba(255,255,255,0.75)", fontWeight: 600,
                  }}>
                  {group.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100,
                    background: "#0E2F62", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10, padding: 6, minWidth: 180,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  }}>
                    {group.links.map(l => {
                      const isActive = pathname === l.href || pathname?.startsWith(l.href + "/");
                      return (
                        <a key={l.href} href={l.href} onClick={() => setOpenGroup(null)}
                          className={`bea-drawer-link${isActive ? " active" : ""}`}
                          style={{ fontSize: 14, padding: "10px 12px" }}>
                          {l.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {reseaux_sociaux.facebook && (
            <a href={reseaux_sociaux.facebook} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", marginLeft: 8 }}>Facebook</a>
          )}
          {contact.hello_asso_url && (
            <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 18px", borderRadius: 999, background: "#f97316", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", marginLeft: 8 }}>
              ❤️ Adhérer
            </a>
          )}
        </nav>

        {/* Hamburger (mobile) — fond semi-transparent pour meilleure visibilité */}
        <button className="bea-hamburger" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 8,
            cursor: "pointer",
            padding: "10px 12px",
            color: "#fff",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
            overflowY: "auto",
          }} onClick={e => e.stopPropagation()}>

            {/* Drawer header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={120} height={38}
                style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 6, padding: "3px 8px" }} />
              <button onClick={() => setOpen(false)} aria-label="Fermer le menu"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, cursor: "pointer", color: "#fff", padding: "6px 8px", display: "flex" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Groups */}
            <nav style={{ display: "flex", flexDirection: "column", flex: 1, gap: 4 }}>
              {NAV_GROUPS.map(group => {
                const active = isGroupActive(group);
                const isExpanded = drawerGroup === group.label || active;
                return (
                  <div key={group.label}>
                    <button
                      onClick={() => setDrawerGroup(isExpanded && drawerGroup === group.label ? null : group.label)}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        width: "100%", background: "transparent", border: "none", cursor: "pointer",
                        padding: "13px 12px", borderRadius: 8,
                        color: "#fff", fontSize: 16, fontWeight: 700,
                      }}>
                      {group.label}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 12, gap: 2, marginBottom: 4 }}>
                        {group.links.map(l => {
                          const isActive = pathname === l.href || pathname?.startsWith(l.href + "/");
                          return (
                            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                              className={`bea-drawer-link${isActive ? " active" : ""}`}>
                              {l.label}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Séparateur */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", margin: "8px 0" }} />
              {reseaux_sociaux.facebook && (
                <a href={reseaux_sociaux.facebook} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                  className="bea-drawer-link" style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
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
