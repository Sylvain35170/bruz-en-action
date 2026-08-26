# BACKLOG — Bruz en Action

## 🔴 En cours

*(rien — l'audit site fond & forme, `AUDIT_SITE_2026-07.md`, est terminé : lots 1 à 4 tous livrés, dernier en date le 17/07 avec `/histoire`, `/connaitre-bruz` et `/glossaire`. Détail dans le git log.)*

> ⚠️ Le 2026-07-27, deux reliquats de cet audit ont été retrouvés **en production** alors que les lots étaient marqués clos : `/metro` (B9) jamais supprimée et toujours servie en 200, et le câblage en dur des liens dossiers (B10). Un troisième défaut (libellés coupés en deux lignes dans les déroulants de la nav) n'est apparu qu'en ouvrant réellement un menu dans le navigateur. Avant de cocher un lot d'audit, ouvrir le site déployé et manipuler l'UI — le diff et le build vert ne montrent ni les pages orphelines ni les défauts de rendu derrière une interaction.

## 🟠 Prioritaire — Fonctionnalités

- [ ] **Parole des élus** — enrichir `data/elus.json` au fil du mandat
- [ ] **Coup de pouce — règle de publication** : pas de source, pas de publication (posée le 14/08). Les candidats de `agent_coup_de_pouce` se relisent avec `--list` puis se recopient à la main dans `data/coup_de_pouce.json` — l'agent ne publie jamais seul. **Relire chaque contact contre le PDF du bulletin avant publication** (piège du 28/07 : débordement entre colonnes).
- [ ] **Alcooliques Anonymes — à publier ou non** (trouvé dans la Semaine à Bruz n°858, réunions tous les vendredis 20h30 à la Maison des associations, 06 52 42 75 86 / aabruz35@gmail.com) : information publique et utile, mais la mettre en avant sur un site de veille citoyenne est un choix éditorial qui touche à la santé et à l'addiction — **décision de l'association, pas de l'agent**. Non publié à ce stade.

## 🟡 À faire — Agents de veille

- [ ] **Agent Gmail signalements** — lire emails labelisés [SIGNALEMENT], parser template structuré, ouvrir tickets JSON
- [ ] **agent_metropole_delibs — surveiller les premiers runs** (créé 14/07, cron 17h) : vérifier qu'une future délibération arrive bien en queue puis en revue ; à l'acceptation, promouvoir manuellement les décisions majeures dans `cms.json > conseil_metropolitain`. Le silence Bruz/Ker Lann/trambus jusqu'au 01/08 est confirmé réel (vérifié le 25/08 par recherche full-text sans filtre de date sur les 2 993 enregistrements du dataset — pas un changement de périmètre), mais `PLUiH` ne matchait en fait **jamais** depuis la création de l'agent (0/2993, le terme réel est toujours écrit « Plan Local d'Urbanisme intercommunal »). Corrigé le 25/08 : mot-clé remplacé + ajout de `MusikHALL`, `Mérol`, `Bonna Sabla`, `Manoir de la Noë`. ⚠️ Le dataset lui-même a ~8 semaines de retard de publication (dernier enregistrement toutes communes : 02/07/2026) — normal, pas un bug.
- [ ] **`agent_megalis` — le 21/09, prévoir une revue humaine du lot COMPLET (~46 actes), pas un tri auto** (vérifié le 26/08 sur données réelles) :
  - ✅ **Timeout non risqué** : `TIMEOUT_S = 150` (déjà relevé depuis les 75 s d'origine, `agent_select.py:80`) contre un batch de 5 réellement mesuré à 86,5 s — marge confortable, aucun changement nécessaire.
  - ⚠️ **L'auto-rejet en pertinence 0 ne réduira quasi rien le volume** : testé sur 5 actes réels dont deux purement administratifs (« Délégations du conseil municipal données au maire », « Création d'emplois non permanents ») — Claude Haiku leur donne 2 et 1, jamais 0. Il ne faut pas compter sur ce filtre pour absorber le pic ; anticiper que la quasi-totalité des ~46 actes atterrira en `pending`.
  - ❌ **Filtrer en amont sur `classification_code` déconseillé** : la distribution réelle (`classification_code` 5.2 « Fonctionnement des assemblées » = 9 actes/100, etc.) n'isole aucun bucket franchement inintéressant sans risque — le piège du 20/08 (le PV du 18/05, « complet », avait quand même raté le point le plus politique de la séance, justement rangé dans une rubrique procédurale) s'applique à l'identique à un filtre par code. Un tri en amont pourrait faire disparaître silencieusement l'acte le plus sensible du lot.
  - **Titres** : `_lisible()` fonctionne comme prévu — l'exemple illisible du 14/08 (« … — Err — Plume ») vient d'un objet source déjà tronqué côté Mégalis, pas d'un défaut de la fonction ; rien à corriger côté agent.
  - **Donc** : le 21/09, prévoir un vrai créneau de revue humaine pour ~46 items (`review_proposals.py --list` trie déjà par pertinence, `--accept`/`--reject` acceptent une liste d'IDs en un seul appel — pas de limite pratique constatée), pas un run qui se traite tout seul.
- [ ] **Étendre les motifs interdits de `validate_data.check_urls_interdites()`** — le garde-fou créé le 01/08 n'attrape que `consent.google.com` et `organization/commune-de-bruz`, les deux cas déjà constatés. Toute nouvelle URL « vivante en apparence » (200 + page de repli) devra y être ajoutée. À terme, mieux vaudrait apprendre à `agent_qa --links` à comparer le contenu servi au contenu attendu, plutôt que d'entretenir une liste noire.
- [ ] **agent_coup_de_pouce ← presse — surveiller les premiers runs** (branché le 25/08) : `agent_ouestfrance.run()` passe désormais ses articles filtrés (déjà pertinents Bruz) à `agent_coup_de_pouce.depuis_presse()`, qui dépose les candidats détectés dans le même registre que les bulletins (`coup_de_pouce_pending.json`) — pas de second scraper OF, réutilise le flux Playwright existant. Testé isolément avec des articles synthétiques (détection OK, faux positifs évités), pas encore vu tourner en conditions réelles (cookies Chrome + Playwright). Limite connue : le dédoublonnage (`deja_connus`) compare des titres normalisés, pas le fond — un même sujet titré différemment entre bulletin et presse (ex. "Les Gamins du Marais" vs "Bruz. La ferme des Gamins du Marais cherche...") peut être proposé deux fois ; la revue humaine tranche. Pistes de sources complémentaires non implémentées, à évaluer plus tard : campagne OnParticipe (financement participatif), podcast Radio Laser.
- [ ] **`coup_de_pouce_pending.json` — 2 doublons stagnants** (repéré le 25/08) : `cdp-66970e52` (Marche Nordique JAB) et `cdp-21df69a8` (Atelier philo ALB) sont déjà publiés sous CP08/CP09 mais traînent encore dans le registre pending — contrairement à `pending.json` (actus), ce registre n'est pas purgé après acceptation. À nettoyer à la main ou à outiller (`--purge-accepted` équivalent).
- [ ] **agent_coup_de_pouce — surveiller les premiers runs** (créé 28/07, cron 17h) : il lit les PDF des bulletins et son extraction est le point fragile. Trois défauts d'attribution ont été trouvés et corrigés au test (débordement entre colonnes, domaine d'email pris pour un site, en-tête de rubrique collé au titre) — **relire les contacts de chaque candidat contre le PDF avant publication**, une mauvaise attribution produit une information fausse. Les motifs de détection (`SIGNAUX`) sont volontairement stricts : élargir si des appels évidents passent à travers.

## 🟡 À faire — Dossiers à instruire

- [ ] **D12** — City stade Siméon Belliard : toujours aucune délibération budgétaire trouvée pour la reconstruction (250-300k€ annoncés) ni avancée sur la procédure judiciaire riverains — re-vérifier périodiquement
- [ ] **D21 (Culture)** — Grand Logis : programmation, événement d'ampleur et évolution de jauge évoqués par la mairie (OF 10/07) mais aucun détail concret trouvé — re-creuser dès que la mairie communique
- [ ] **idees_ailleurs** — alimenter les dossiers avec des pratiques d'autres communes. État au 2026-07-27 : renseigné sur D13 (5 idées), D15 (3) et D05 (2) ; **vide sur les 15 autres** (D01, D02, D03, D04, D06, D07, D10, D11, D12, D16, D20, D21, D22, D23, D24)
- [ ] **D22 (Bonna Sabla)** — friche créée le 17/07, faits confirmés (fermeture usine, foncier en vente) mais reconversion/préemption non actée : suivre toute délibération Rennes Métropole/Bruz sur le DPU ou le devenir du site. Re-vérifié le 2026-07-20 : rien de nouveau sur Mégalis ni sur l'open data délibérations Rennes Métropole (recherches "Bonna Sabla"/"Bihardais") — ⚠️ un résultat WebSearch Archyde refait surface avec des chiffres très précis (12 ha, pollution HAP, remédiation 2,5-4 M€, subvention régionale 12 M€) : ne pas l'utiliser, c'est le même agrégateur déjà pris en flagrant délit de conflation avec d'autres sites Bonna Sabla en France (piège 2026-07-17)
- [ ] **D23 (Démocratie locale)** — créé le 17/07 (pilier 7, 5 promesses D1-D5 toutes non_commence) : suivre toute délibération créant CMJ/Conseil des sages ou désignant des référents de quartier
- [ ] **D11 (Manoir de la Noë)** — résultat de la concertation citoyenne « Nos Lieux Communs » du 9 juillet 2026 (usage de la partie non occupée du bâtiment/terrain) pas encore public — à suivre

- [ ] **Agenda — surveiller l'apparition de nouveaux tags mairie** : `/agenda` (créée le 02/08) regroupe les tags bruts d'`evenements.json` en 8 thèmes via `THEMES_AGENDA` (`app/utils.ts`). Les 15 tags actuels sont tous mappés. Si la mairie en introduit un nouveau, l'événement tombe dans « Autres rendez-vous » et la page l'annonce en bas — c'est le signal qu'il faut compléter le mapping. Ne jamais laisser un thème filtrer sans bac de secours.

## 🟡 À faire — Design & Illustrations

- [ ] **Illustration `/histoire`** — page livrée sans image dédiée, à ajouter si besoin
- [ ] **Tout nouveau dossier doit repartir de `PROMPTS_ILLUSTRATIONS.md`** (bloc de style + `scripts/integre_illustration.py`) — les 18 dossiers sont illustrés au 2026-07-27, ne pas laisser un nouveau dossier sans image
- [ ] **Nom de domaine propre** — en attente de financement (pas d'action possible pour l'instant)

## 🟡 À faire — Données & Connaissance

- [ ] **Glossaire** — `/glossaire` livré le 17/07 mais ne consolide que le champ `glossaire` de D03 (8 termes) ; l'ajouter à d'autres dossiers au fil de l'instruction (finances D04, urbanisme D02/D05, etc.)
- [ ] **`RECHERCHE_HISTOIRE.md` — trous mineurs restants** (non bloquants, page `/histoire` déjà publiée) : page histoire de la mairie (lien mort 404), période pavillonnaire 1960-90 non détaillée par quartier, histoire de Pont-Réan, illustrations via archives départementales 35
- [ ] **bruz.json** — entretenir la base au fil de l'eau (dernière revue 2026-07-20 : CFU 2023/2024/2025 et BP 2026 chiffrés en détail dans `finances_communales`)
- [ ] **D03 — données intermédiaires 2015-2021** — g1 (fiscalité locale, chapitre 731) reste vide sur cette période. Recherche 2026-07-20 : Mégalis n'a rien avant "Compte administratif 2022" pour Bruz (confirmé, pas juste un problème d'accès JS) ; decomptes-publics.fr a les données mais payantes (rapport dès 49,90€, pas acheté sans accord explicite) ; OFGL (gratuit) a une série "Impôts locaux" 2018-2024 mais périmètre différent de 731 (13,3 M€ OFGL 2022 vs 12,7 M€ publié, écart ~5%) — décision 2026-07-20 : ne pas mélanger les périmètres dans g1, laisser le trou tel quel. Piste non explorée : demander directement les comptes administratifs à la mairie/archives départementales.

## 🟡 À faire — Promesses

- [ ] **Audit statuts promesses.json** — ⏸ EN ATTENTE : discuter d'abord avec le maire des modes d'interaction/remontées avant de statuer (décision 2026-07-05). Contexte : les 50 promesses étaient toutes bloquées à `non_commence` depuis la création du tracker (jamais resynchronisées avec les décisions actées dans les dossiers). Une seule corrigée à ce jour (E1/#17 "adjoint vie économique" → `tenu`, 2026-07-04) — repasser sur les autres promesses liées à des décisions déjà actées ailleurs sur le site (ex. D04 maintien du taux TFB, D13 activation plan canicule)

## 🟡 À faire — Technique

- [ ] **`agent_bruz_mag` — titres captés depuis le texte du lien** : les trois derniers bulletins avaient `label: "Télécharger(ouverture dans un nouvel onglet)"` et BM-260 avait ce texte **en guise de titre**, affiché tel quel sur `/publications`. Corrigé à la main le 28/07 pour les 5 bulletins existants, mais la cause est dans le scraper — le prochain bulletin repartira avec le même défaut tant que l'extraction de titre n'est pas fiabilisée.
- [ ] **CRs réunions** — réimporter les docx (encodage zip raté sur les accents) — fichiers source à relocaliser
- [ ] **Actus** — enrichir au fil des décisions
- [ ] **Seuil dédup `is_already_published`** — seuil de similarité de titre à 0.6 (`scripts/utils.py`) : le cas limite "Stage de natation piscine de la Conterie" vs "Ouverture des inscriptions natation" (ratio 0.70) reste à arbitrer sur le fond — est-ce vraiment un doublon ? Depuis le 2026-07-27 il est au moins mémorisé comme tel et ne coûte plus un appel Claude par run. Si le seuil s'avère trop agressif, il faudra **purger les items `motif_rejet: "doublon d'une story déjà publiée"`** du registre pour qu'ils soient reproposés
- [ ] **Étendre `check_content_changed` à la presse** — un article Ouest-France peut être réécrit sous la même URL, comme les pages mairie (piège 2026-07-10, fix limité à `agent_mairie`). Le cas qui l'avait révélé (`presse-6a717d8b`, titre devenu contraire à la source) a été rejeté le 10/07 et n'est plus en attente, mais rien n'empêche le prochain de passer à la revue avec un titre périmé.
- [ ] **`presse-f2c23dbc` (Grand Logis, publié le 10/07) — source à retrouver** : l'URL stockée était tronquée à 291 caractères (identifiant d'article coupé), ni déballable ni résolvable. Marquée `source_url_expiree: true` le 01/08. À re-sourcer à la main si l'article est retrouvé — voir aussi le dossier D21 ci-dessus, même sujet.
- [ ] **Convention prénom+nom dans `actus.json`/`cms.json`** — `dossiers.json` nettoyé (2026-07-04, 23 mentions "Houssin"/"Salmon" nus corrigées en noms complets), mais `actus.json` (~20 occurrences) et `cms.json` (~40) pas encore passés en revue — même règle à appliquer
- [ ] **Marqueurs chantiers `MapBruz.tsx`** — coordonnées géocodées via Nominatim OSM sur le nom de rue (précision rue, pas point de chantier exact) ; à affiner si un chantier ponctuel a une localisation plus précise disponible, et à mettre à jour/retirer au fil de la fin des travaux (pont de la Gare prévu réouvert 3 juillet 2026, etc.)

## 💡 Idées

- Alertes email/RSS quand une promesse change de statut
- Export PDF du tableau de bord par pilier
