# BACKLOG — Bruz en Action

## 🔴 En cours

*(rien)*

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Parole des élus** — enrichir `data/elus.json` au fil du mandat

## 🟡 À faire — Agents de veille

- [ ] **Bruz Mag URL** — URL de téléchargement PDF absente de la nav mairie ; en attendant couvert par Google News RSS
- [ ] **Comptes officiels** — Facebook Ville de Bruz, Houssin, Bruz Métropole → `data/meta.json` sources_surveillees

## 🟡 À faire — Dossiers à instruire

- [ ] **D09 et suivants** — nouveaux dossiers à ouvrir selon l'actualité (cinéma Grand Logis / Cinéville, école, Manoir de la Noë…)

## 🟡 À faire — Technique

- [ ] **Images** — photos de Bruz / événements / asso (à fournir)
- [ ] **Script import_excel.py** — mise à jour auto des statuts depuis l'Excel
- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents)
- [ ] **Actus** — enrichir au fil des décisions (schema en place, 6 seeds)
- [ ] **SEO** — og:image, description, sitemap

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier
- Page `/metro` dédiée aux décisions Rennes Métropole impactant Bruz (T4, PLUiH, eau/assainissement)

## ✅ Terminé

- **D06 Piscine · D07 Sécurité PM · D08 Équipements sportifs** — dossiers créés, pages générées, actus_recentes alimentées, catégories colorées dans l'index
- **Pipeline veille automatique** — 5 agents (YouTube CMs, mairie actus, Google News presse, Bruz Mag, enrichissement dossiers) + orchestrateur + launchd 17h ; actus presse matchées par mots-clés → `dossiers.json` actus_recentes
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
- **Pages CM individuelles `/conseils/[id]`** — 5 pages (jan/mars/avr/mai/juil) avec contexte, délibérations, points de débat, impact Bruzois, à surveiller ; nav prev/next ; index /conseils mis à jour avec liens
- **Page `/conseils`** — timeline CMs passées + section Rennes Métropole + sidebar (Mégalis, YouTube, chiffres conseil) ; nav header enrichie
- **Résumés CM enrichis** — CMs jan/mars/avr enrichis depuis Mégalis + Bruz Mag n°260 ; section Conseil Métropolitain ajoutée (ZAC Ker Lann + T4, 5 fév. 2026)
- **Fix carte Leaflet** — CSS global pour static export GitHub Pages (tuiles OSM + tracés ZAC/T4 visibles)
- **Pages promesses `/promesses/[id]`** — 50 pages statiques : détail, historique actus, dossiers liés, nav prev/next ; tableau homepage cliquable
- **actus.json** — schema + 6 actus seeds (délégations, ZAC Ker Lann, élection)
- **D04 démographie mandature Salmon** — population 17,4K→19,1K→~20K hab., parc 8200→9400 logements, 3 graphiques SVG (pop/logements/indices base 100), 7 sources (INSEE, OFGL, Proxiti, Mégalis, Observatoire territoires)
- **Graphiques SVG dossiers finances** — D03/D04 : recettes fiscales 2013→2023, structure recettes estimée ; composants SvgBarChart + SvgHorizontalBarChart inline ; corrections population 18K→20K et budget 20-25→30-40 M€
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
