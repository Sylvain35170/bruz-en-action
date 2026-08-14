# CLAUDE.md — Bruz en Action

## Contexte projet

Site citoyen de l'association **Bruz en Action** (loi 1901) — secrétaire : Sylvain Bertrand.
Objectif : suivre les engagements de la majorité municipale de Bruz (mandat 2026-2032, liste « Un nouvel élan pour Bruz »).

**Déploiement** : GitHub Pages — `https://sylvain35170.github.io/bruz-en-action/`
**Repo GitHub** : `https://github.com/Sylvain35170/bruz-en-action`
**Repo local** : `~/Documents/Dev/bruz-en-action/`

---

## Stack technique

| Couche | Techno |
|--------|--------|
| Framework | Next.js 16 (TypeScript) — export statique (`output: "export"`) |
| Style | Tailwind CSS v4 |
| Carte | Leaflet 1.9 + OpenStreetMap |
| Pipeline veille | Python — `scripts/agents/` + `run_agents.py` |
| Déploiement | `npm run build` → dossier `out/` → GitHub Pages |

`basePath` = `/bruz-en-action` — **toujours préfixer les liens internes et assets avec ce basePath.**

---

## Structure données (`data/`)

| Fichier | Contenu |
|---------|---------|
| `dossiers.json` | Dossiers thématiques (D01–D11+) — structure citoyen |
| `promesses.json` | 50 promesses du programme municipal |
| `elus.json` | 33 élus 2026-2032 (maire + adjoints + délégués + opposition) |
| `actus.json` | Actualités (schema + seeds) |
| `cms.json` | Comptes-rendus CMs — séances de conseil municipal **uniquement** |
| `cms_megalis_2026.json` | Délibérations Mégalis enrichies |
| `bulletins.json` | Bruz Mag + Semaine à Bruz — distinct de `cms.json` (voir piège 2026-07-11) |
| `evenements.json` | Agenda |
| `institutions.json` | Page /qui-fait-quoi : compétences par échelon (commune/métropole/département/région/État) + rôles municipaux |
| `meta.json` | Description asso, bureau, contacts, sources surveillées |

### Structure dossier (schema citoyen)
```
ce_quon_sait · qui_decide · decisions · ce_quon_suit
```
Champs clés : `featured` (bool), `last_activity` (date ISO), `actus_recentes` (array), `categorie` (avec couleur).

---

## Pages / routes

```
/                   Homepage (hero + dossiers rotatifs + agenda + promesses + actus)
/dossiers           Index dossiers (tri featured + last_activity)
/dossiers/[id]      Détail dossier
/conseils           Timeline CMs + section Rennes Métropole
/conseils/[id]      Détail CM (délibérations, points clés, à surveiller)
/publications       Bruz Mag + Semaine à Bruz (data/bulletins.json)
/promesses          Tableau de bord promesses
/promesses/[id]     Détail promesse
/elus               Liste 33 élus
/qui-fait-quoi      Pédagogie institutions : compétences par échelon + rôles maire/adjoints/conseil
/carte              Carte Leaflet interactive (ZAC Multisites, T4, équipements)
```

### Champ `niveau` dans `qui_decide` (dossiers.json)
Chaque acteur de `qui_decide` porte un `niveau` : `commune` · `metropole` · `intercommunal` ·
`departement` · `region` · `etat` · `autre`. Config badges/couleurs : `NIVEAU_CONFIG` dans
`app/utils.ts` (partagée entre `/dossiers/[id]` et `/qui-fait-quoi`). Tout nouvel acteur
ajouté à un dossier doit avoir son `niveau`.

---

## Pipeline veille (`scripts/agents/`)

Collecte → sélection → revue humaine, **incrémentale jusqu'à revue** (refonte 2026-07-05) :

```
scrapers (mairie/OF/presse/mégalis/bruz_mag)
   → data/actus_queue.json                (gitignoré)
   → agent_select (Claude Haiku)
   → scripts/proposals/pending.json       (REGISTRE incrémental, gitignoré)
   → agent_mailer (email des pending)
   → revue humaine → data/actus.json → build + push
```

**Le registre `scripts/proposals/pending.json`** est le pivot : chaque item y entre une
seule fois avec un statut (`pending` / `accepted` / `rejected` + `first_seen`,
`decided_at`, `mailed_at`). `utils.known_urls()` inclut le registre → un item en attente
de revue ou rejeté n'est **jamais** re-scrapé, re-analysé ni re-mailé. Les items à
pertinence 0 sont auto-rejetés (mémorisés). Ne pas recréer de fichiers
`proposals/YYYY-MM-DD.json` (ancien format, archivé dans `proposals/archive/`).

**Revue — `scripts/review_proposals.py`** (convention "on examine les propositions") :
- `--list` : affiche les pending triés par pertinence
- `--accept id1,id2 --reject id3 [--dossier D05]` : publie dans `actus.json` + fige les statuts
- `--purge-accepted` : nettoie les accepted de +60 jours (les rejected restent — mémoire anti re-proposition)
- Après acceptation : `agent_dossiers` → `npm run build` → commit + push `data/`

**Mailer** : envoi quotidien systématique à 17h (un email à chaque run), avec TOUS les
pending du moment ou un message "rien de nouveau" si le registre est vide. Les items
sans date ne sont plus perdus. `--dry-run` pour tester sans envoyer.

**IDs** : `utils.stable_id(prefix, url)` (md5) — jamais `hash()` (randomisé par processus).

Agents : `agent_mairie` · `agent_ouestfrance` (Playwright + cookies Chrome ; lève si
dépendance manquante) · `agent_presse` (Google News RSS) · `agent_megalis` (YouTube RSS)
· `agent_bruz_mag` (PDF) · `agent_enrichissement_cm` (transcription + Claude) ·
`agent_metropole_delibs` (API open data `data.rennesmetropole.fr`, dataset
`deliberations-rennes-metropole-2021-copie` → queue de veille ; ⚠️ ODSQL : full-text nu
parenthésé + filtre de champ = 0 résultat silencieux, utiliser `delib_objet like "…"` +
date littérale ; les CR du conseil métropolitain ne sont PAS cherchables sur Mégalis) ·
`agent_agenda` (scraping agenda mairie → `evenements.json` **en direct, sans revue** —
événements marqués `source: agenda_mairie`, les saisies manuelles ne sont jamais touchées,
purge auto des événements passés de +30 j) · `agent_dossiers` (hors cron, post-revue).

Lancement : `python3 scripts/run_agents.py` (launchd 17h en semaine).
Logs : `~/Library/Logs/bruz-en-action-veille.log`.
Environnement d'exécution : venv dédié `~/.venvs/bruz-en-action/` (voir piège 2026-07-01 ci-dessous — ne pas repointer le plist sur un python homebrew direct ou un venv sous `~/Documents`).

### Validation données — `scripts/validate_data.py`

Garde-fou avant commit et en CI (step avant `npm run build` dans `deploy.yml`) :
dates ISO ou null, IDs uniques, statuts promesses dans le référentiel, URLs http(s),
pas de `undefined`/`[object Object]` sérialisés. **À lancer avant tout commit de `data/`.**

### QA — link-checker (`scripts/agents/agent_qa.py`)

Vérifie les pages du site déployé (contenu attendu, absence de `undefined`/`[object Object]`) et, avec `--links`/`--links-only`, l'accessibilité de toutes les URLs `source_url`/`url`/`lien` trouvées dans `data/*.json`. Distingue "cassé confirmé" (404/DNS/timeout) d'"anti-bot probable" (403/429 — Ouest-France, HelloAsso, ac-rennes.fr, ARS Bretagne bloquent systématiquement même avec un User-Agent navigateur).

Automatisé en launchd : `com.bruz-en-action.linkcheck`, tous les lundis 8h, même venv dédié que la veille. Logs : `~/Library/Logs/bruz-en-action-linkcheck.log`.

Convention pour les liens confirmés morts sans alternative trouvée : ajouter `<clé>_expiree: true` à côté du champ URL plutôt que de supprimer la source (le link-checker les ignore ensuite).

---

## Règles métier

- **IDs dossiers** : `D01`, `D02`, … format fixe — ne jamais renuméroter
- **Promesses** : 50 au total — statuts : `non_commence` · `en_cours` · `tenu` · `partiel` · `abandonne` · `inconnu`
- **Élus opposition** : inclus dans `elus.json` — rôle neutre/factuel
- **Ton éditorial** : factuel, sourcé, constructif — pas de militantisme partisan
- **Segments ML** : sans objet ici (projet citoyen, pas ProPME)

---

## Pièges connus
### 2026-08-14 — expiration figée au build, règle de source coup de pouce

- **En export statique, un filtre sur « aujourd'hui » est évalué au BUILD, pas à la visite.**
  `/coup-de-pouce` (`date_fin`), la homepage et `/agenda` (événements à venir) sont des
  composants serveur sans `"use client"` : leur `new Date()` date du dernier build, et
  `deploy.yml` ne partait que sur `push`. La guinguette CP07 (`date_fin: 2026-08-15`)
  serait restée affichée comme en cours indéfiniment. Fix : `schedule: cron "17 4 * * *"`
  dans `deploy.yml`. Le commentaire du code affirmait l'inverse (« l'item disparaît de
  lui-même ») — un commentaire n'est pas une preuve, le confronter au mode de rendu.
- **Coup de pouce : pas de source, pas de publication.** Un lien vers un site national ne
  source pas une antenne locale (CP01 Restos du Cœur retiré, CP02 sans lien retiré).
  `validate_data` signale ces items en warning — 0 warning = tout est sourcé.
- **Relire le PDF ne sert pas qu'aux erreurs de colonnes** : `chapeau: corps[:400]` tronque
  et fait perdre de l'info utile (la cotisation JAB 30 € + 20 € avait sauté).
- **`review_proposals --dossier` s'applique à tout le lot** — un appel par dossier cible.
  Et les titres bruts `agent_megalis` sont illisibles (« … — Err — Plume »), à réécrire
  à la revue.

### 2026-08-01 — mailer muet 7 jours, boucle de veille Presse, API Mégalis

- **Une app OAuth Google en statut « Testing » révoque son refresh token tous les 7 jours.** `invalid_grant` du 25/07 au 01/08 sur `agent_mailer`, sans rien changer côté code. Reconsentir ne rachète que 7 jours : publier l'app (*Auth Platform → Audience → Publish app* → `In production`). L'écran « app non validée » et le bandeau « requires verification » sont sans conséquence en usage perso. Sur un compte gmail.com, « Make internal » est grisé.
- **Un agent qui échoue proprement (`log ERR` + `return False`) était compté en succès** — le bilan affirmait « propositions envoyées » alors qu'aucun mail ne partait. `utils.log` journalise désormais les `ERR` (`errors_logged()`/`reset_errors()`) et `run_agents` tranche entre *rien de nouveau* et *en panne* (`status: error` visible dans `/status`). Instrumenter le logger couvre les 11 agents d'un coup.
- **Google News redirige vers `consent.google.com` avec un jeton `escs=` régénéré à chaque requête** : la dédup par `source_url` ne matchait jamais, l'article repartait en queue à chaque run. Dédup sur `stable_id` (`known_ids()`, dédup id-first dans `append_to_queue`). Ne jamais *stocker* une URL de consentement — elle envoie le lecteur sur un écran Google. `requests` ne franchit pas ce mur (ni HEAD nu, ni cookie `CONSENT`) : résoudre dans le navigateur.
- **Soft-404 : `organization/commune-de-bruz` répond 200 mais retombe sur l'accueil Mégalis.** Invisible pour `agent_qa --links`. `validate_data.check_urls_interdites()` échoue désormais sur ces motifs — **et scanne aussi `app/**/*.tsx`** : après avoir corrigé 28 occurrences dans `data/`, 4 liens câblés en dur dans le TSX étaient toujours servis en prod. Corriger les données ne suffit pas ; vérifier sur le site déployé.
- **L'API Mégalis est publique et sans authentification** — contrairement à ce que ce fichier affirmait depuis juin. `data-publication.megalis.bretagne.bzh/mq_apis/actes/v1/search?siren=213500473`, trouvée en lisant le trafic réseau du portail (SPA Angular). `agent_megalis` s'appuie dessus (typologies `99_DE`/`99_HP`, fenêtre 15 j sur la date de publication). **SIREN de Bruz = 213500473.**
- **Un « probablement » dans un résumé de veille ne se publie jamais.** Une proposition disait Bruz « probablement concernée » par un arrêté barbecue ; l'article citait Rennes, Bourgbarré, La Chapelle-Thouarault et Chartres-de-Bretagne, pas Bruz. Corollaire outillage : `find` (recherche sémantique navigateur) l'avait rapportée comme mentionnée — le texte disait l'inverse. Lire le contenu avant de conclure.
- **`agent_agenda` réécrit `evenements.json` à chaque scraping** : un champ ajouté à la main y serait perdu. Le regroupement thématique de `/agenda` vit donc dans `THEMES_AGENDA` (`app/utils.ts`), dérivé du tag brut. `themeEvenement()` ne renvoie jamais null — bac « Autres rendez-vous » obligatoire, et la page affiche le nombre de non-classés pour qu'un nouveau tag mairie se voie.

### 2026-07-28 — extraction PDF en colonnes, boucle de veille, audit UI incomplet
- **Les bulletins municipaux sont sur 5-6 colonnes : les extraire en bandes fixes produit de fausses informations.** `extract_text()` linéaire entrelace les colonnes ; découper en N bandes est pire. Sans recouvrement les emails sont tronqués en bord de bande ; avec recouvrement un fragment de la colonne voisine déborde sur la même ligne — « EMMAÜS BRUZ » lu « EMMAÜS BRUZ Grat » n'est plus reconnu comme intertitre, son bloc est absorbé et **le mail d'Emmaüs est attribué à l'association précédente**. Méthode retenue dans `agent_coup_de_pouce.detecter_colonnes()` : repérer les gouttières (bandes verticales sans aucun mot) via `page.extract_words()`. Corollaires : tester `all(c.isupper() ...)` plutôt qu'une classe de caractères (le `Ü` manquait), et retirer les emails avant de chercher une URL (sinon `orange.fr` sort de `secath.seiche@orange.fr`). **Relire les contacts de chaque candidat contre le PDF avant publication.**
- **Tout `continue` placé avant l'écriture au registre condamne l'item à revenir chaque jour.** `agent_select` écartait les doublons déjà publiés avant la boucle alimentant `pending.json` : jamais mémorisés, donc re-scrapés, et le filtre s'appliquant après l'analyse Claude, chaque run repayait un appel modèle pour le même item. Même famille que le bug ayant motivé le registre le 05/07. Un item ne sort jamais du flux sans être mémorisé, quel que soit le motif du rejet.
- **Un lot d'audit coché n'est pas un lot livré : ouvrir le site et cliquer.** Trois défauts vivants en prod alors que les 4 lots de `AUDIT_SITE_2026-07.md` étaient clos — `/metro` retirée de la nav et du sitemap mais jamais supprimée du repo (servie en 200 avec des données en dur divergentes), liens dossiers en dur sans garde-fou (désormais contrôlés par `validate_data.validate_liens_nav()`), et libellés coupés en deux lignes dans les déroulants, visibles seulement en ouvrant un menu.
- **Un champ énuméré qui pilote un filtre d'affichage doit être validé en erreur.** `/coup-de-pouce` construit ses sections par `byType()` : un `type` hors référentiel fait disparaître l'item de toutes les sections sans erreur, tout en gonflant `items.length` — ce qui empêche même le message « aucune initiative » de s'afficher.
- **Prompts d'illustration : lister la palette ne suffit pas, il faut interdire.** Sur 9 illustrations, la 4e a dérivé (arbres verts, aucun or) jusqu'à ce que le prompt impose « NO GREEN AT ALL » et « gold must be clearly present ». Voir `PROMPTS_ILLUSTRATIONS.md` et `scripts/integre_illustration.py`.

### 2026-07-26 — bruz-en-action : build cassé 6 jours, archive de pièges en boucle, routage des dossiers
- **Supprimer un champ de `data/*.json` sans greper ses consommateurs casse le build en silence** — `dette_ecart_2023_2024` retiré de `bruz.json` le 20/07 (à raison : le CFU 2024 officiel venait d'être trouvé), mais `/statistiques` le lisait toujours → échec au type-check, 3 déploiements GitHub Pages en échec, prod figée 6 jours sans que ça se voie. Greper le nom du champ dans `app/` avant toute suppression, et passer un `gh run list` en fin de session : un commit réussi ne prouve pas que le site est déployé.
- **`agent_select` route depuis `dossiers.json`, plus depuis une liste en dur** — `DOSSIERS_DESC` maintenue à la main avait raté D21 Culture (jamais proposé au classement depuis sa création) et gardait D08/D09/D14 supprimés/fusionnés. `build_dossiers_desc()` lit désormais le champ `mots_cles_ia` de chaque dossier : **tout nouveau dossier doit porter ses `mots_cles_ia`** pour être routable (repli sur le titre sinon).
- **Export statique : pas de slash final** — `/statistiques/` renvoie 404, la bonne URL est `/statistiques` (le build génère `statistiques.html`, pas un dossier). À savoir avant de conclure qu'une page est cassée en la testant au curl.
- **`PIEGES_ARCHIVE.md` accumulait des copies de la même entrée** — bug de l'outillage de clôture (`_append_piege()` ne dédupliquait que sur `CLAUDE.md`, pas sur l'archive où `_rotate_pieges()` venait de déplacer l'entrée). Corrigé en amont dans dm2p-copilot-setup ; l'archive a été dédupliquée (14 entrées → 5).

### 2026-07-18 — bruz-en-action : mailer SMTP bloqué par VPN pro, migration API Gmail
- **Le VPN pro Orange (Cisco Secure Client, profil "DEV ACCESS") bloque les ports SMTP sortants (465 et 587)** — testé en direct : `nc -zv smtp.gmail.com 465/587` timeout/no route to host alors que ping/DNS/HTTPS (443) passent normalement. Le mailer de la veille (17h, `agent_mailer.py`) échouait silencieusement quand ce VPN était connecté au moment du run — pas de perte de données (le registre `pending.json` garde les items non mailés), juste pas de notification ce jour-là.
- **Diagnostic à ne pas précipiter** : un premier réflexe a incriminé à tort CyberGhost (VPN perso, en réalité désactivé) avant de vérifier via `ps aux`/`scutil --nc`/DNS (`francetelecom.fr`) que le vrai coupable était Cisco Secure Client. Toujours vérifier quel process tient réellement le tunnel (`lsof -i`, `ps aux | grep vpn`) avant d'accuser un VPN par déduction.
- **Fix définitif** : migration SMTP → API Gmail (HTTPS/443, jamais bloqué par ce VPN). Projet GCP dédié `bruz-en-action-mailer-502808`, scope `gmail.send`, credentials OAuth "Desktop app" stockées hors repo (`~/.bruz-mailer-gmail/client_secret.json` + `token.json`, jamais commitées, chmod 600). Premier consentement interactif fait une fois (via navigateur) ; ensuite le refresh token permet un fonctionnement 100% autonome depuis `launchd`.
- **Piège annexe OAuth** : le premier essai de consentement a échoué en `403 access_denied` bien que l'email de test venait d'être ajouté dans "Audience > Test users" — en fait le clic sur "Save" n'avait pas pris (page rechargée avant que le chip email soit confirmé). Toujours re-vérifier via `get_page_text` que la liste des test users n'est pas vide avant de retenter le consentement (pas la peine d'attendre une propagation Google qui n'était pas le vrai problème).

### 2026-07-17 — bruz-en-action : balayage dossiers + lot 4 audit (/histoire, /connaitre-bruz, /glossaire)
→ dispatch: local:bruz-en-action + global

- **Contenu halluciné détecté** : l'agrégateur Archyde donnait des chiffres très précis (12 ha, projet nommé "Quai Vilaine Sud", 800 logements, financements chiffrés à l'euro) sur la friche Bonna Sabla à Bruz — en réalité mélangés avec deux **autres** sites Bonna Sabla réels en reconversion ailleurs en France (Vendargues-34, Plaisance-du-Touch-31). Réflexe général : quand un seul agrégateur de faible fiabilité sort des chiffres très précis non recoupés par une source primaire/officielle, présumer l'hallucination et vérifier ailleurs (ici : Mégalis,
… _(learning complet dans `~/.shared-context/learnings.md`)_

### 2026-07-16 — agent_dossiers : last_activity futur + sur-matching mots-clés
- **Une actu datée dans le futur épinglait son dossier en tête de tri** — l'annonce du CM de rentrée (date 2026-09-21) avait mis `last_activity: 2026-09-21` sur D03, le plaçant premier sur la homepage et `/dossiers` jusqu'à fin septembre. Fix : `agent_dossiers` plafonne `last_activity` à `today()` (`min(news["date"], today())`) dans les deux branches (actus + cms).
- **Le champ `dossier` posé à la revue fait foi** — `agent_dossiers` re-matchait toutes les actus par mots-clés en ignorant le classement de la revue humaine : la bio de Robert Barré (Ker Lann, ZAC du Vert Buisson, finances) partait dans D01/D02/D03/D10 hors sujet. Fix : si `actu["dossier"]` correspond à un ID de dossier existant, injection uniquement là ; repli mots-clés sinon (`à_classer`, champ absent). Effet de bord à connaître : au premier run post-fix, les actus anciennes classées mais jamais matchées entrent dans leur dossier assigné.
- **Séances à venir : `points_cles` vides → `detail` vide** — repli sur `resume_executif` ajouté dans la branche cms.

### 2026-07-17 — bruz-en-action : balayage dossiers, contenu halluciné, lot 4 audit livré
- **Contenu halluciné détecté sur un agrégateur tiers (Archyde)** — chiffres très précis (12 ha, "Quai Vilaine Sud", 800 logements) sur la friche Bonna Sabla à Bruz, en réalité mélangés avec deux autres sites Bonna Sabla réels ailleurs en France. Réflexe : un seul agrégateur de faible fiabilité + chiffres non recoupés = présumer l'hallucination, vérifier via Mégalis/sources officielles avant d'écrire (dossier créé D22 avec uniquement les faits confirmés).
- **`fetch_insee.py` écrase `series_longues.population` à chaque run** — les points Cassini/EHESS (1793-1872, hors couverture INSEE) doivent être fusionnés *dans le script* (constante `CASSINI_1793_1946` + merge dans `ecrire_bruz_json`), jamais ajoutés à la main dans `bruz.json`.
- **Test d'une page avec filtre client-side (`use client`) via `serve` local** — `serve out/` seul casse le `basePath` (`_next/static/*` en 503, tout semble non-hydraté). Fix : symlink `out` → `bruz-en-action/` dans un dossier parent, puis servir ce parent. Et pour taper dans un input contrôlé React via claude-in-chrome, `computer.type` ne déclenche pas toujours l'`onChange` — dispatcher l'event `input` via le setter natif JS si le test semble ne rien faire.
- **Lot 4 de l'audit livré** (`/histoire`, `/connaitre-bruz`, `/glossaire`) — nouveau fichier `data/histoire.json` (frise, cycles d'urbanisation, maires) suit le même pattern que les autres data files (source unique, pages ne font que le rendre).
