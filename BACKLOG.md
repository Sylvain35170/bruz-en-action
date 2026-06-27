# BACKLOG — Bruz en Action

## 🔴 En cours

*(rien)*

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Parole des élus** — enrichir `data/elus.json` au fil du mandat

## 🟡 À faire — Agents de veille

- [ ] **Agent Gmail signalements** — lire emails labelisés [SIGNALEMENT], parser template structuré, ouvrir tickets JSON

## 🟡 À faire — Dossiers à instruire

- [ ] **D02 en profondeur** — vérifier les chiffres La Courrouze / Baud-Chardonnet quand sources disponibles
- [ ] **D10 en profondeur** — Écoles + Vert-Buisson
- [ ] **D12** — City stade Siméon Belliard : suivre délibération reconstruction (250-300k€ annoncés, calendrier non précisé) + issue procédure judiciaire riverains
- [ ] **D13** — Canicule : suivre si mairie publie carte îlots / chiffres CCAS / PCS mis à jour
- [ ] **Nouveaux dossiers** — Bonnat-Sablat (préemption), travaux Bruz
- [ ] **idees_ailleurs** — alimenter les dossiers D01–D12 avec des pratiques d'autres communes (champ JSON en place, vide sur tous sauf D13)

## 🟡 À faire — Design & Illustrations

- [ ] **Vignettes dossiers restants** — D04 taxe, D07 sécurité, D09 culture, D11 patrimoine (prompts à générer) — D03 ✅ SVG fait
- [ ] **og-image** — remplacer par un visuel BEA aux bonnes couleurs quand disponible

## 🟡 À faire — Données & Connaissance

- [ ] **bruz.json** — compléter les champs `"À compléter"` : maire, médiathèque, salle de spectacle, chiffres budget 2026 détaillés (fonctionnement/investissement — CFU 2025 disponible courant 2026)
- [ ] **D03 — données intermédiaires 2015-2021** — compléter g1 (fiscalité locale) avec les années manquantes via comptes administratifs Mégalis
- [ ] **D03 — comparaison communes similaires** — trouver ratio dette/hab moyen OFGL pour communes 15-25k hab (situer les 81€/hab de Bruz)
- [ ] **STATS_CONTEXT** — ajouter mapping pour D04, D08, D09, D11, D12, D13 quand stats pertinentes identifiées

## 🟡 À faire — Technique

- [ ] **Script import_excel.py** — mise à jour auto des statuts depuis l'Excel
- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents)
- [ ] **Actus** — enrichir au fil des décisions

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier
- Page "Coup de pouce / Coup de cœur" — à définir
