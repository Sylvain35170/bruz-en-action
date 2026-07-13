# BACKLOG — Bruz en Action

## 🔴 En cours

- [ ] **Audit site fond & forme** — `AUDIT_SITE_2026-07.md` : lots 1, 2 et 3 faits (lot 3 terminé le 13/07 : A6, A10, A4, A7, A1, A3, A5 badge « en construction » + mention décisions vides, A8 agent_agenda + repli section homepage). Lot 4 (stats / connaissance / histoire) non arbitré. Nom de domaine propre : en attente de financement

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Parole des élus** — enrichir `data/elus.json` au fil du mandat

## 🟡 À faire — Agents de veille

- [ ] **Agent Gmail signalements** — lire emails labelisés [SIGNALEMENT], parser template structuré, ouvrir tickets JSON

## 🟡 À faire — Dossiers à instruire

- [ ] **D15** — Offre de soins : arrêté zonage ARS toujours pas publié au 13/07 mais page « Publication du nouveau zonage médecin » créée côté ARS (accès restreint → imminent), re-vérifier sous quelques jours ; le classement de Bruz est dans le xlsx « Tableau de données communes » de la consultation si besoin d'anticiper ; délibérations CM sur MSP, données CPAM sans-MT par commune
- [ ] **D01** — Trambus T4 : choix final entre les 2 variantes centre-ville (courte Parc de la Herverie / longue-prolongée au-delà du Vau-Gaillard) non tranché à ce jour — suivre la concertation continue et une éventuelle nouvelle délibération Rennes Métropole
- [ ] **D02 en profondeur** — vérifier les chiffres La Courrouze / Baud-Chardonnet quand sources disponibles
- [ ] **D10 en profondeur** — Écoles + Vert-Buisson, + suivre l'issue du point 29 du CM du 3 juillet (mesures carte scolaire)
- [ ] **D12** — City stade Siméon Belliard : suivre délibération reconstruction (250-300k€ annoncés, calendrier non précisé) + issue procédure judiciaire riverains
- [ ] **D13** — Canicule : suivre si mairie publie carte îlots / chiffres CCAS / PCS mis à jour
- [ ] **Nouveaux dossiers** — Bonnat-Sablat (préemption)
- [ ] **D05 (ex-D14 fusionné)** — Bruz en carte : pont de la Gare rouvert (publié 2026-07-06) — reste à suivre planning Pasteur 2026, premiers chantiers ZAC Multisites
- [ ] **D05 — référents de quartier** — vérifier si Bruz a un dispositif de conseils/référents de quartier (aucune donnée source actuellement dans `elus.json` ni ailleurs) ; si oui, sourcer noms + périmètres et alimenter le nouveau champ `referents_quartier` (scaffold vide en place) ; sinon documenter l'absence
- [ ] **D11** — Plan B / Manoir de la Noë : suivre renouvellement convention guinguette après été 2026 + statut pérenne Plan B + toute délibération CM
- [ ] **D16 en profondeur** — Économie locale : dossier ouvert (2026-07-04, zones Ker Lann/Champ Niguel/Haie Gautrais, marchés, 5 promesses liées) — reste à documenter : rencontres trimestrielles commerçants (E2), animations (E3), présence Ker Lann (E4), circuits courts achats communaux (E5), taux de vacance commerciale (aucune donnée trouvée)
- [ ] **D17** — Coup de pouce : associations et jeunes entreprises (subventions, salles, couveuse, coworking)
- [ ] **D18** — Démocratie locale : réunions de quartier, CMJ, transparence — pilier 7, mesurable sur le mandat
- [ ] **D19 (à créer)** — Équipements sportifs à Bruz : vue d'ensemble gymnases/terrains/city stades, au-delà du seul D12 (city stade Siméon Beliard) et D06 (piscine) — vérifier chevauchement avant création
- [ ] **D20 en profondeur** — Ker Lann : « My Campus Rennes Ker Lann » (78 logements privés LMNP, Bouygues) trouvé et documenté, livraison T4 2027 à vérifier ; toujours aucune résidence CROUS/conventionnée identifiée — creuser cette piste spécifiquement
- [ ] **idees_ailleurs** — alimenter les dossiers D01–D12 avec des pratiques d'autres communes (champ JSON en place, vide sur tous sauf D13)
- [ ] **D21 (nouveau, Culture)** — créé le 11/07 suite revue éditoriale (Grand Logis, programmation culturelle) : `decisions` vide, pas d'image, une seule actu — à enrichir dès que la mairie communique plus de détails
- [ ] **Images manquantes** — D05, D12, D15, D16, D20, D21 n'ont pas d'illustration
- [ ] **D15, D16 — `decisions` vide** — dossiers "en cours" sans aucune décision tracée à ce jour, à vérifier si des décisions existent (CM, arrêtés) qui n'ont pas encore été rattachées

## 🟡 À faire — Design & Illustrations

*(rien — vignettes D04/D07/D11 et og-image faites)*

## 🟡 À faire — Données & Connaissance

- [ ] **bruz.json** — entretenir la base au fil de l'eau (dernière revue 2026-07-02 : ajout lycée Anita Conti, collège-lycée privé Saint-Joseph, détail campus Ker Lann + logement étudiant, CFU 2023 **et** CFU 2025 chiffrés en détail dans `finances_communales`). Reste à faire : chiffres budget 2026 détaillés (fonctionnement/investissement)
- [ ] **D03 — données intermédiaires 2015-2021** — compléter g1 (fiscalité locale) avec les années manquantes via comptes administratifs Mégalis (portail JS, accès direct requis)
- [ ] **D03 — CFU 2024 Bruz (officiel)** — toujours pas localisé au 2026-07-02, malgré navigation directe du portail Mégalis via `claude-in-chrome` (recherche "compte financier unique" filtrée sur le SIREN Bruz 213500473 : seuls CFU 2023 et CFU 2025 remontent, pas 2024). Devenu moins prioritaire : le CFU 2025 officiel (trouvé et documenté) donne un encours de dette 2025 de 7,6 M€/379,59€ par hab, cohérent avec un pic ~9,4 M€ fin 2024 (DGFiP) suivi d'un désendettement 2025 sans nouvel emprunt tiré. Méthode qui a marché pour trouver 2023/2025 : `data.megalis.bretagne.bzh/?recherche=compte+financier+unique&siren=213500473` dans le navigateur, chercher les résultats "FINANCES_APPROBATION DU CFU [année] DU BUDGET PRINCIPAL"
- [ ] **D03 — CFU 2025 Bruz** — à récupérer sur Mégalis dès publication (délai légal : 30 juin 2026, non disponible à ce jour)

## 🟡 À faire — Promesses

- [ ] **Audit statuts promesses.json** — ⏸ EN ATTENTE : discuter d'abord avec le maire des modes d'interaction/remontées avant de statuer (décision 2026-07-05). Contexte : les 50 promesses étaient toutes bloquées à `non_commence` depuis la création du tracker (jamais resynchronisées avec les décisions actées dans les dossiers). Une seule corrigée à ce jour (E1/#17 "adjoint vie économique" → `tenu`, 2026-07-04) — repasser sur les autres promesses liées à des décisions déjà actées ailleurs sur le site (ex. D04 maintien du taux TFB, D13 activation plan canicule)

## 🟡 À faire — Technique

- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents) — fichiers source à relocaliser
- [ ] **Actus** — enrichir au fil des décisions
- [ ] **Seuil dédup `is_already_published`** — surveiller les prochains runs `agent_select` : seuil de similarité de titre à 0.6 (`scripts/utils.py`), un cas limite repéré ("Stage de natation piscine de la Conterie" vs "Ouverture des inscriptions natation", ratio 0.70) — ajuster si trop/pas assez agressif
- [ ] **Registre pending.json** — surveiller les premiers runs post-refonte (2026-07-05) : plus aucun doublon inter-jours attendu dans les emails
- [ ] **Mailer quotidien systématique** — vérifier sur quelques jours (depuis 2026-07-08) que le mail à 17h part bien à chaque run, y compris "rien de nouveau"
- [ ] **Convention prénom+nom dans `actus.json`/`cms.json`** — `dossiers.json` nettoyé (2026-07-04, 23 mentions "Houssin"/"Salmon" nus corrigées en noms complets), mais `actus.json` (~20 occurrences) et `cms.json` (~40) pas encore passés en revue — même règle à appliquer
- [ ] **Marqueurs chantiers `MapBruz.tsx`** — coordonnées géocodées via Nominatim OSM sur le nom de rue (précision rue, pas point de chantier exact) ; à affiner si un chantier ponctuel a une localisation plus précise disponible, et à mettre à jour/retirer au fil de la fin des travaux (pont de la Gare prévu réouvert 3 juillet 2026, etc.)

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier
