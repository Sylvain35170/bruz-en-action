# BACKLOG — Bruz en Action

## 🔴 En cours

*(rien — l'audit site fond & forme, `AUDIT_SITE_2026-07.md`, est terminé : lots 1 à 4 tous livrés, dernier en date le 17/07 avec `/histoire`, `/connaitre-bruz` et `/glossaire`. Détail dans le git log.)*

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Parole des élus** — enrichir `data/elus.json` au fil du mandat

## 🟡 À faire — Agents de veille

- [ ] **Agent Gmail signalements** — lire emails labelisés [SIGNALEMENT], parser template structuré, ouvrir tickets JSON
- [ ] **agent_metropole_delibs — surveiller les premiers runs** (créé 14/07, cron 17h) : vérifier qu'une future délibération Bruz/Ker Lann/trambus/PLUiH arrive bien en queue puis en revue ; à l'acceptation, promouvoir manuellement les décisions majeures dans `cms.json > conseil_metropolitain`

## 🟡 À faire — Dossiers à instruire

- [ ] **D12** — City stade Siméon Belliard : toujours aucune délibération budgétaire trouvée pour la reconstruction (250-300k€ annoncés) ni avancée sur la procédure judiciaire riverains — re-vérifier périodiquement
- [ ] **D21 (Culture)** — Grand Logis : programmation, événement d'ampleur et évolution de jauge évoqués par la mairie (OF 10/07) mais aucun détail concret trouvé — re-creuser dès que la mairie communique
- [ ] **idees_ailleurs** — alimenter les dossiers D01–D12 avec des pratiques d'autres communes (champ JSON en place, vide sur tous sauf D13)
- [ ] **Images manquantes** — D05, D12, D15, D16, D20, D21, D22, D23, D24 n'ont pas d'illustration
- [ ] **D22 (Bonna Sabla)** — friche créée le 17/07, faits confirmés (fermeture usine, foncier en vente) mais reconversion/préemption non actée : suivre toute délibération Rennes Métropole/Bruz sur le DPU ou le devenir du site
- [ ] **D23 (Démocratie locale)** — créé le 17/07 (pilier 7, 5 promesses D1-D5 toutes non_commence) : suivre toute délibération créant CMJ/Conseil des sages ou désignant des référents de quartier
- [ ] **D11 (Manoir de la Noë)** — résultat de la concertation citoyenne « Nos Lieux Communs » du 9 juillet 2026 (usage de la partie non occupée du bâtiment/terrain) pas encore public — à suivre

## 🟡 À faire — Design & Illustrations

- [ ] **Illustration `/histoire`** — page livrée sans image dédiée, à ajouter si besoin
- [ ] **Nom de domaine propre** — en attente de financement (pas d'action possible pour l'instant)

## 🟡 À faire — Données & Connaissance

- [ ] **Glossaire** — `/glossaire` livré le 17/07 mais ne consolide que le champ `glossaire` de D03 (8 termes) ; l'ajouter à d'autres dossiers au fil de l'instruction (finances D04, urbanisme D02/D05, etc.)
- [ ] **`RECHERCHE_HISTOIRE.md` — trous mineurs restants** (non bloquants, page `/histoire` déjà publiée) : page histoire de la mairie (lien mort 404), période pavillonnaire 1960-90 non détaillée par quartier, histoire de Pont-Réan, illustrations via archives départementales 35
- [ ] **bruz.json** — entretenir la base au fil de l'eau (dernière revue 2026-07-20 : CFU 2023/2024/2025 et BP 2026 chiffrés en détail dans `finances_communales`)
- [ ] **D03 — données intermédiaires 2015-2021** — g1 (fiscalité locale, chapitre 731) reste vide sur cette période. Recherche 2026-07-20 : Mégalis n'a rien avant "Compte administratif 2022" pour Bruz (confirmé, pas juste un problème d'accès JS) ; decomptes-publics.fr a les données mais payantes (rapport dès 49,90€, pas acheté sans accord explicite) ; OFGL (gratuit) a une série "Impôts locaux" 2018-2024 mais périmètre différent de 731 (13,3 M€ OFGL 2022 vs 12,7 M€ publié, écart ~5%) — décision 2026-07-20 : ne pas mélanger les périmètres dans g1, laisser le trou tel quel. Piste non explorée : demander directement les comptes administratifs à la mairie/archives départementales.

## 🟡 À faire — Promesses

- [ ] **Audit statuts promesses.json** — ⏸ EN ATTENTE : discuter d'abord avec le maire des modes d'interaction/remontées avant de statuer (décision 2026-07-05). Contexte : les 50 promesses étaient toutes bloquées à `non_commence` depuis la création du tracker (jamais resynchronisées avec les décisions actées dans les dossiers). Une seule corrigée à ce jour (E1/#17 "adjoint vie économique" → `tenu`, 2026-07-04) — repasser sur les autres promesses liées à des décisions déjà actées ailleurs sur le site (ex. D04 maintien du taux TFB, D13 activation plan canicule)

## 🟡 À faire — Technique

- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents) — fichiers source à relocaliser
- [ ] **Actus** — enrichir au fil des décisions
- [ ] **Seuil dédup `is_already_published`** — surveiller les prochains runs `agent_select` : seuil de similarité de titre à 0.6 (`scripts/utils.py`), un cas limite repéré ("Stage de natation piscine de la Conterie" vs "Ouverture des inscriptions natation", ratio 0.70) — ajuster si trop/pas assez agressif
- [ ] **Registre pending.json** — surveiller les premiers runs post-refonte (2026-07-05) : plus aucun doublon inter-jours attendu dans les emails
- [ ] **Mailer API Gmail (migré du SMTP le 18/07)** — surveiller les prochains runs 17h : le SMTP échouait quand le VPN pro (Cisco Secure Client) était connecté au moment du run (ports 465/587 bloqués) ; l'API Gmail (HTTPS/443, OAuth2) contourne ce blocage — à confirmer sur plusieurs jours, y compris avec VPN connecté. Le refresh token (`~/.bruz-mailer-gmail/token.json`) doit tenir sans ré-authentification manuelle.
- [ ] **Convention prénom+nom dans `actus.json`/`cms.json`** — `dossiers.json` nettoyé (2026-07-04, 23 mentions "Houssin"/"Salmon" nus corrigées en noms complets), mais `actus.json` (~20 occurrences) et `cms.json` (~40) pas encore passés en revue — même règle à appliquer
- [ ] **Marqueurs chantiers `MapBruz.tsx`** — coordonnées géocodées via Nominatim OSM sur le nom de rue (précision rue, pas point de chantier exact) ; à affiner si un chantier ponctuel a une localisation plus précise disponible, et à mettre à jour/retirer au fil de la fin des travaux (pont de la Gare prévu réouvert 3 juillet 2026, etc.)

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier
