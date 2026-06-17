# BACKLOG — Bruz en Action

## 🔴 En cours

*(rien)*

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

- **Carte interactive `/carte`** — Leaflet + OSM, 6 secteurs ZAC Multisites (coords réelles Nominatim), corridor T4 (21 stations), équipements. D05 mis à jour et lié.
- Section Dossiers homepage : Trambus T4, ZAC Multisites, Finances 2026, Fiscalité Salmon — sourcés et déployés
- Pages dédiées `/dossiers/[id]` : 5 pages statiques (points clés, sources, sidebar, liens mairie)
- **Liste complète 33 élus 2026-2032** — Bruz Mag n°260 : maire + 9 adjoints + 11 délégués + 5 conseillers + 7 opposition, homepage restructurée en 3 niveaux
- **Page `/conseils`** — timeline CMs passées + section Rennes Métropole + sidebar (Mégalis, YouTube, chiffres conseil) ; nav header enrichie
- **Résumés CM enrichis** — CMs jan/mars/avr enrichis depuis Mégalis + Bruz Mag n°260 ; section Conseil Métropolitain ajoutée (ZAC Ker Lann + T4, 5 fév. 2026)
- **Fix carte Leaflet** — CSS global pour static export GitHub Pages (tuiles OSM + tracés ZAC/T4 visibles)
- **Dossiers enrichis** — D01 T4 : trambus expliqué, terminus gare = priorité Houssin, densité 60 lgts/ha ; D02 ZAC : 6 secteurs nommés, distinction Multisites/Ker Lann
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
