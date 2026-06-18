# BACKLOG — Bruz en Action

## 🔴 En cours

*(rien)*

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Parole des élus** — enrichir `data/elus.json` au fil du mandat

## 🟡 À faire — Agents de veille

- [ ] **Agent Mégalis** — scan automatique des nouveaux IDs délibérations Bruz + Rennes Métropole → MAJ `cms.json` (cron GitHub Actions hebdomadaire)
- [ ] **Agent mairie** — scrape `ville-bruz.fr/actualites/` + `conseil-municipal/` → détection nouveaux CR, arrêtés, délibérations
- [ ] **Agent Bruz Mag** — détection nouveau numéro (PDF mairie) → extraction OCR + résumé → MAJ `cms.json`
- [ ] **Agent presse locale** — scrape Ouest-France/Semaine à Bruz sur mots-clés Bruz → actus auto dans `data/actus.json`
- [ ] **Comptes officiels à surveiller** — Facebook Ville de Bruz (`@villedebruz`), compte Houssin, compte Bruz Métropole ; renseigner dans `data/meta.json` → sources_surveillees

## 🟡 À faire — Dossiers à instruire

- [ ] **D06 — Piscine de Bruz** : état du bâtiment actuel, promesse de rénovation/nouveau équipement ?, coût estimé, timeline. Sources : délibérations budget, Bruz Mag, programme Houssin
- [ ] **D07 — Sécurité / police municipale** : effectifs actuels, promesse de renforcement (confirmée dans délégations 8 avr.), vidéoprotection — où en est-on ? Sources : délibérations, budget, Bruz Mag
- [ ] **D08 — City stade / équipements sportifs** : état des terrains de proximité, projets neufs ou rénovation, lien avec ZAC Multisites (secteur Mons ?). Sources : mairie, délégation Fabrice Jan (sport)

## 🟡 À faire — Technique

- [ ] **Images** — photos de Bruz / événements / asso (à fournir)
- [ ] **Script import_excel.py** — mise à jour auto des statuts depuis l'Excel
- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents)
- [ ] **Actus** — workflow de saisie des actus de suivi promesses
- [ ] **Page détail promesse** — fiche individuelle avec historique actus liées
- [ ] **SEO** — og:image, description, sitemap

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier
- Page `/metro` dédiée aux décisions Rennes Métropole impactant Bruz (T4, PLUiH, eau/assainissement)

## ✅ Terminé

- **Page `/dossiers`** — index complet, tri featured + last_activity, badge actif, couleur par catégorie, compteur actus
- **Rotation dossiers homepage** — 4 cards rotatifs (featured first + last_activity desc), lien "Tous les dossiers"
- **dossiers.json** — champs `featured` et `last_activity` ajoutés (D01–D05), prêts pour agent 6
- **"Qui sommes-nous" refondé** — citation Art. 2 statuts, origine Houssin/Un nouvel élan assumée, 3 piliers On suit / On écoute / On transmet
- **meta.json** — description, mission, positionnement alignés sur les statuts loi 1901
- **Nav enrichie** — lien 📁 Dossiers dans toutes les pages
- **Carte interactive `/carte`** — Leaflet + OSM, 6 secteurs ZAC Multisites (coords réelles Nominatim), corridor T4 (21 stations), équipements. D05 mis à jour et lié.
- Section Dossiers homepage : Trambus T4, ZAC Multisites, Finances 2026, Fiscalité Salmon — sourcés et déployés
- Pages dédiées `/dossiers/[id]` : 5 pages statiques (points clés, sources, sidebar, liens mairie)
- **Liste complète 33 élus 2026-2032** — Bruz Mag n°260 : maire + 9 adjoints + 11 délégués + 5 conseillers + 7 opposition, homepage restructurée en 3 niveaux
- **Page `/conseils`** — timeline CMs passées + section Rennes Métropole + sidebar (Mégalis, YouTube, chiffres conseil) ; nav header enrichie
- **Résumés CM enrichis** — CMs jan/mars/avr enrichis depuis Mégalis + Bruz Mag n°260 ; section Conseil Métropolitain ajoutée (ZAC Ker Lann + T4, 5 fév. 2026)
- **Fix carte Leaflet** — CSS global pour static export GitHub Pages (tuiles OSM + tracés ZAC/T4 visibles)
- **Pages dossiers refondues** — D01–D04 : 7 nouvelles sections par dossier (pourquoi, gouvernance, décisions, coût/financement, impact qualité de vie, risques systémiques, conclusion + actus récentes)
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
