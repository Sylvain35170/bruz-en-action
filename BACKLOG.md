# BACKLOG — Bruz en Action

## 🔴 En cours

- [ ] **Section Dossiers** — cartes thématiques sur la homepage + data/dossiers.json

## 🟠 Prioritaire — Dossiers à créer

- [ ] **Dossier Trambus T4** — terminus Ker Lann vs gare, négociation Rennes Métropole, livraison 2031
- [ ] **Dossier ZAC multisite** — zones d'aménagement concertées en cours à Bruz (à rechercher)
- [ ] **Dossier Finances de la commune** — budget 2026, investissements, dette (sources CM janv. 2026)
- [ ] **Dossier Fiscalité mandature précédente** — évolution taux, comparatif communes similaires
- [ ] **Carte de la commune** — carte interactive Bruz (OpenStreetMap/Leaflet) avec zones/projets

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Agent de veille multi-source** — cron GitHub Actions : mairie, Facebook, Instagram, presse locale → actus auto
- [ ] **Section Conseil municipal** — séances, ordres du jour, liens CR (prochain CM : 3 juil., Halle Pagnol)
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
- Page individuelle par dossier (Next.js dynamic routes)

## ✅ Terminé

- Init projet Next.js 16 + Tailwind v4 + TypeScript
- Import référentiel Excel → 50 promesses, 10 thèmes peuplés
- Logo extrait et intégré (PDF → PNG recadré) + fix GitHub Pages (next/image → img + basePath)
- Design system Claude Design intégré (tokens, typo Public Sans, glassmorphism)
- Refonte ton : engagement citoyen positif, CTA HelloAsso, agenda, parole des élus
- Repo GitHub public (Sylvain35170/bruz-en-action) + GitHub Pages activé
- HelloAsso URL renseignée (helloasso.com/associations/bruz-en-action)
- Événements : vraies dates + vrais liens (Boccia, Foulées 11/10, Trans Musicales, etc.)
- Citations Houssin sourcées (TVR + programme)
