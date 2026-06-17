# BACKLOG — Bruz en Action

## 🔴 En cours

- [ ] **Carte de la commune** — carte interactive Bruz (OpenStreetMap/Leaflet) avec zones ZAC + corridor T4

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Agent de veille multi-source** — cron GitHub Actions : mairie, Facebook, Instagram, presse locale → actus auto
- [ ] **Réseaux sociaux** — renseigner facebook/instagram dans `data/meta.json`
- [ ] **Parole des élus** — enrichir `data/elus.json` au fil du mandat

## 🟡 À faire

- [ ] **Images** — photos de Bruz / événements / asso (à fournir)
- [ ] **Script import_excel.py** — mise à jour auto des statuts depuis l'Excel
- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents)
- [ ] **Actus** — workflow de saisie des actus de suivi promesses
- [ ] **Page détail promesse** — fiche individuelle avec historique actus liées
- [ ] **SEO** — og:image, description, sitemap

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier

## ✅ Terminé

- Section Dossiers homepage : Trambus T4, ZAC Multisites, Finances 2026, Fiscalité Salmon — sourcés et déployés
- Pages dédiées `/dossiers/[id]` : 5 pages statiques (points clés, sources, sidebar, liens mairie)
- **Liste complète 33 élus 2026-2032** — Bruz Mag n°260 : maire + 9 adjoints + 11 délégués + 5 conseillers + 7 opposition, homepage restructurée en 3 niveaux
- **Résumés CM** — 4 séances (20 mars installation, 8 avril délégations/indemnités, 18 mai, 3 juil. à venir) — points clés sourcés Bruz Mag n°260 + Semaine à Bruz n°850
- **Coups de peinture** — barre de progression promesses, timeline CM avec dot pulsant, animations fade-in, og:image, favicon, photo hero (Bruz-place.jpg CC BY-SA 4.0 Yves LC)

## ✅ Terminé (antérieur)

- Init projet Next.js 16 + Tailwind v4 + TypeScript
- Import référentiel Excel → 50 promesses, 10 thèmes peuplés
- Logo extrait et intégré (PDF → PNG recadré) + fix GitHub Pages (next/image → img + basePath)
- Design system Claude Design intégré (tokens, typo Public Sans, glassmorphism)
- Refonte ton : engagement citoyen positif, CTA HelloAsso, agenda, parole des élus
- Repo GitHub public (Sylvain35170/bruz-en-action) + GitHub Pages activé
- HelloAsso URL renseignée (helloasso.com/associations/bruz-en-action)
- Événements : vraies dates + vrais liens (Boccia, Foulées 11/10, Trans Musicales, etc.)
- Citations Houssin sourcées (TVR + programme)
