# BACKLOG — Bruz en Action

## 🔴 En cours

*(rien)*

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Parole des élus** — enrichir `data/elus.json` au fil du mandat

## 🟡 À faire — Agents de veille

- [ ] **Bruz Mag URL** — URL de téléchargement PDF absente de la nav mairie ; en attendant couvert par Google News RSS
- [ ] **Comptes officiels** — Facebook Ville de Bruz, Houssin, Bruz Métropole → `data/meta.json` sources_surveillees

## 🟡 À faire — Dossiers à instruire

*(rien)*

## 🟡 À faire — Technique

- [ ] **QA sur Archipel** — porter `qa/check-links.mjs` (ou équivalent) sur le projet Archipel
- [ ] **Lien ville-bruz.fr éducation** — URL `/vivre-a-bruz/enfance-et-education/` a changé (404), trouver la nouvelle URL mairie pour D10
- [ ] **Images** — remplacer og-image.jpg + footer par vraies photos quand disponibles (events / asso)
- [ ] **Script import_excel.py** — mise à jour auto des statuts depuis l'Excel
- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents)
- [ ] **Actus** — enrichir au fil des décisions (schema en place, seeds en place)
- [ ] **SEO** — description, sitemap
- [ ] **Agent Gmail signalements** — lire emails labelisés [SIGNALEMENT], parser template structuré, ouvrir tickets JSON

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier
- Page `/metro` dédiée aux décisions Rennes Métropole impactant Bruz (T4, PLUiH, eau/assainissement)
- Page `/liens` — liens utiles (mairie, Bruz Mag, La Semaine, Mégalis, YouTube, HelloAsso…)
- Page "En profondeur" pour d'autres dossiers (D03 finances, D06 piscine…)
