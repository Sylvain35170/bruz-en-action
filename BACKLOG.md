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
- [ ] **D20 en profondeur** — Ker Lann : suivre tout projet de résidence étudiante lié à la ZAC Ker Lann Sud, et vérifier s'il existe une réponse CROUS/logement conventionné (non identifiée à l'ouverture du dossier)
- [ ] **idees_ailleurs** — alimenter les dossiers D01–D12 avec des pratiques d'autres communes (champ JSON en place, vide sur tous sauf D13)

## 🟡 À faire — Design & Illustrations

*(rien — vignettes D04/D07/D11 et og-image faites)*

## 🟡 À faire — Données & Connaissance

- [ ] **bruz.json** — entretenir la base au fil de l'eau (dernière revue 2026-07-02 : ajout lycée Anita Conti, collège-lycée privé Saint-Joseph, détail campus Ker Lann + logement étudiant, CFU 2023 **et** CFU 2025 chiffrés en détail dans `finances_communales`). Reste à faire : chiffres budget 2026 détaillés (fonctionnement/investissement)
- [ ] **D03 — données intermédiaires 2015-2021** — compléter g1 (fiscalité locale) avec les années manquantes via comptes administratifs Mégalis (portail JS, accès direct requis)
- [ ] **D03 — CFU 2024 Bruz (officiel)** — toujours pas localisé au 2026-07-02, malgré navigation directe du portail Mégalis via `claude-in-chrome` (recherche "compte financier unique" filtrée sur le SIREN Bruz 213500473 : seuls CFU 2023 et CFU 2025 remontent, pas 2024). Devenu moins prioritaire : le CFU 2025 officiel (trouvé et documenté) donne un encours de dette 2025 de 7,6 M€/379,59€ par hab, cohérent avec un pic ~9,4 M€ fin 2024 (DGFiP) suivi d'un désendettement 2025 sans nouvel emprunt tiré. Méthode qui a marché pour trouver 2023/2025 : `data.megalis.bretagne.bzh/?recherche=compte+financier+unique&siren=213500473` dans le navigateur, chercher les résultats "FINANCES_APPROBATION DU CFU [année] DU BUDGET PRINCIPAL"
- [ ] **D03 — CFU 2025 Bruz** — à récupérer sur Mégalis dès publication (délai légal : 30 juin 2026, non disponible à ce jour)
- [ ] **STATS_CONTEXT** — ajouter mapping pour D04, D08, D11, D12, D13 quand stats pertinentes identifiées

## 🟡 À faire — Technique

- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents) — fichiers source à relocaliser
- [ ] **Actus** — enrichir au fil des décisions
- [ ] **Seuil dédup `is_already_published`** — surveiller les prochains runs `agent_select` : seuil de similarité de titre à 0.6 (`scripts/utils.py`), un cas limite repéré ("Stage de natation piscine de la Conterie" vs "Ouverture des inscriptions natation", ratio 0.70) — ajuster si trop/pas assez agressif

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier
- **Pages orphelines** — `/metro` (doublon quasi-exact de `/metropole`) et `/liens` ne sont liées depuis aucun nav ; décider suppression ou rattachement
