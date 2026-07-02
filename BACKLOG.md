# BACKLOG — Bruz en Action

## 🔴 En cours

*(rien)*

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Parole des élus** — enrichir `data/elus.json` au fil du mandat

## 🟡 À faire — Agents de veille

- [ ] **Agent Gmail signalements** — lire emails labelisés [SIGNALEMENT], parser template structuré, ouvrir tickets JSON

## 🟡 À faire — Dossiers à instruire

- [ ] **D15** — Offre de soins : surveiller arrêté zonage ARS Bretagne (été 2026), délibérations CM sur MSP, données CPAM sans-MT par commune
- [ ] **D02 en profondeur** — vérifier les chiffres La Courrouze / Baud-Chardonnet quand sources disponibles
- [ ] **D10 en profondeur** — Écoles + Vert-Buisson
- [ ] **D12** — City stade Siméon Belliard : suivre délibération reconstruction (250-300k€ annoncés, calendrier non précisé) + issue procédure judiciaire riverains
- [ ] **D13** — Canicule : suivre si mairie publie carte îlots / chiffres CCAS / PCS mis à jour
- [ ] **Nouveaux dossiers** — Bonnat-Sablat (préemption)
- [ ] **D14** — Chantiers : suivre réouverture pont de la Gare (3 juil.), planning Pasteur 2026, premiers chantiers ZAC Multisites
- [ ] **D11** — Plan B / Manoir de la Noë : suivre renouvellement convention guinguette après été 2026 + statut pérenne Plan B + toute délibération CM
- [ ] **D16** — Économie locale : commerce, artisanat, Ker Lann, aides aux entreprises — pilier 4 du programme, zéro dossier actuellement
- [ ] **D17** — Coup de pouce : associations et jeunes entreprises (subventions, salles, couveuse, coworking)
- [ ] **D18** — Démocratie locale : réunions de quartier, CMJ, transparence — pilier 7, mesurable sur le mandat
- [ ] **D19 (à créer)** — Équipements sportifs à Bruz : vue d'ensemble gymnases/terrains/city stades, au-delà du seul D12 (city stade Siméon Beliard) et D06 (piscine) — vérifier chevauchement avant création
- [ ] **D20 (à créer)** — Ker Lann : campus universitaire et projets de logement étudiant — angle distinct de D01 (T4) et D02 (ZAC Multisites), qui mentionnent Ker Lann sans le traiter comme sujet à part
- [ ] **idees_ailleurs** — alimenter les dossiers D01–D12 avec des pratiques d'autres communes (champ JSON en place, vide sur tous sauf D13)

## 🟡 À faire — Design & Illustrations

*(rien — vignettes D04/D07/D11 et og-image faites)*

## 🟡 À faire — Données & Connaissance

- [ ] **bruz.json** — compléter chiffres budget 2026 détaillés (fonctionnement/investissement — CFU 2025 disponible courant 2026)
- [ ] **D03 — données intermédiaires 2015-2021** — compléter g1 (fiscalité locale) avec les années manquantes via comptes administratifs Mégalis (portail JS, accès direct requis)
- [ ] **D03 — CFU 2024 Bruz** — récupérer le document officiel sur Mégalis pour confirmer les chiffres 2024 estimés : dette 9,4 M€, fiscalité 13,9 M€
- [ ] **D03 — CFU 2025 Bruz** — à récupérer sur Mégalis dès publication (délai légal : 30 juin 2026, non disponible à ce jour)
- [ ] **STATS_CONTEXT** — ajouter mapping pour D04, D08, D11, D12, D13 quand stats pertinentes identifiées

## 🟡 À faire — Technique

- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents) — fichiers source à relocaliser
- [ ] **Actus** — enrichir au fil des décisions
- [ ] **actus.json — dates RSS tronquées** — 73 items avec des dates non-ISO (ex. "Wed, 22 Ap", tronquées côté Google News RSS). Corrigées côté tri homepage (`app/page.tsx`, 2026-07-01) mais la donnée reste fausse en base — reconstituer les vraies dates ou les marquer `date: null`
- [ ] **Seuil dédup `is_already_published`** — surveiller les prochains runs `agent_select` : seuil de similarité de titre à 0.6 (`scripts/utils.py`), un cas limite repéré ("Stage de natation piscine de la Conterie" vs "Ouverture des inscriptions natation", ratio 0.70) — ajuster si trop/pas assez agressif

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier
- **Pages orphelines** — `/metro` (doublon quasi-exact de `/metropole`) et `/liens` ne sont liées depuis aucun nav ; décider suppression ou rattachement
