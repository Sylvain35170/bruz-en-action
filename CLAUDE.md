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
| `cms.json` | Comptes-rendus CMs |
| `cms_megalis_2026.json` | Délibérations Mégalis enrichies |
| `evenements.json` | Agenda |
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
/promesses          Tableau de bord promesses
/promesses/[id]     Détail promesse
/elus               Liste 33 élus
/carte              Carte Leaflet interactive (ZAC Multisites, T4, équipements)
```

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

**Mailer** : envoie TOUS les pending (pas seulement le jour) dès qu'un item est nouveau,
sinon rappel tous les 3 jours max. Les items sans date ne sont plus perdus.
`--dry-run` pour tester sans envoyer.

**IDs** : `utils.stable_id(prefix, url)` (md5) — jamais `hash()` (randomisé par processus).

Agents : `agent_mairie` · `agent_ouestfrance` (Playwright + cookies Chrome ; lève si
dépendance manquante) · `agent_presse` (Google News RSS) · `agent_megalis` (YouTube RSS)
· `agent_bruz_mag` (PDF) · `agent_enrichissement_cm` (transcription + Claude) ·
`agent_dossiers` (hors cron, post-revue).

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
### 2026-07-03 — bruz-en-action : agent_select vidait la queue deux fois (perte silencieuse d'items en timeout)
→ dispatch: local:bruz-en-action

- **`agent_select.py` réinjectait les items en échec de batch (timeout Claude CLI) en fin de queue à la ligne ~155, puis une seconde écriture inconditionnelle juste après (ligne ~204, "vider la queue, items traités") écrasait cette réinjection avec un tableau vide.** Résultat : tout item dont le batch timeoutait (75s, fréquent avec BATCH_SIZE=5 sur des lots de 7+) disparaissait silencieusement au lieu d'être retraité au run suivant — aucune erreur, aucun log d'alerte visible dans le statut de run. Fix : supprimé la seconde écriture, la queue garde l'état
… _(learning complet dans `~/.shared-context/learnings.md`)_

### 2026-07-05 — bruz-en-action : refonte veille incrémentale + base de connaissance
→ dispatch: local:bruz-en-action

- **Pattern registre incrémental pour pipeline à revue humaine** — cause racine des doublons de veille (items re-scrapés/re-analysés/re-mailés 4 jours de suite) : `known_urls()` ne connaissait que publiés + queue, pas les items en attente de revue. Fix structurel : registre unique `scripts/proposals/pending.json` (statuts `pending`/`accepted`/`rejected` + `first_seen`/`decided_at`/`mailed_at`), inclus dans la dédup ; pertinence 0 auto-rejetée ; les rejets restent mémorisés à vie. Revue via `scripts/review_proposals.py --list/--accept/--reject`. Mailer : tout
… _(learning complet dans `~/.shared-context/learnings.md`)_

### 2026-07-05 — bruz-en-action : registre incrémental, hash() interdit, QA casse
→ dispatch: local:bruz-en-action

- **Registre `proposals/pending.json` = pivot de la veille** — les items y entrent une fois (pending/accepted/rejected) et `known_urls()` l'inclut : plus de re-scrape/re-mail avant revue. Ne pas recréer de fichiers `proposals/YYYY-MM-DD.json` (ancien format, archivé). Revue : `scripts/review_proposals.py`.
- **`hash()` interdit pour les IDs d'items** — randomisé par processus ; utiliser `utils.stable_id(prefix, url)` (md5).
- **QA insensible à la casse** — la homepage écrit « promesses » en minuscule et `/elus` rend « HOUSSIN » (formatNomPrenom) : tout `must_contain` sensible à la casse produit des faux échecs.
- **`stats_dossiers` (bruz.json) pilote le panneau « Chiffres de contexte »** — jamais de stat en dur dans le TSX ; `validate_data.py` vérifie la résolution des `valeur_path`. À lancer avant tout commit de `data/` (aussi en step CI).

### 2026-07-04 — bruz-en-action : link-checker ajouté, limites anti-bot, convention liens expirés
→ dispatch: local:bruz-en-action

- **Link-checker créé** (`agent_qa.py --links`/`--links-only` + `utils.check_url_status()`) — scanne `data/*.json`, distingue "cassé confirmé" (404/DNS/timeout) de "anti-bot probable" (403/429/redirections).
- **Ouest-France, HelloAsso, ac-rennes.fr, ARS Bretagne bloquent en 403 même avec un User-Agent navigateur** — pas de bypass simple, cohérent avec le piège OF déjà connu (Playwright `channel="chrome"` requis).
- **Convention `<clé>_expiree: true`** pour les sources mortes sans alternative — déjà en place avant cette session dans `dossiers.json` (commit `5e00862`), généralisée à `actus.json`/`elus.json`/`evenements.json`. Le link-checker les ignore désormais.
- **Wayback Machine (`archive.org/wayback/available`) rate-limite (429)** si appelée sans délai — espacer les requêtes d'~3s.

### 2026-06-28 — bruz-en-action : sources financières communes + cohérence visuelle
→ dispatch: local:bruz-en-action

- **Mégalis WebFetch inutilisable** — `data.megalis.bretagne.bzh` nécessite JS pour rendre ses listes de documents. WebFetch retourne seulement le titre "Délibérations et actes administratifs" sans aucun contenu. Seul workaround : `site:data.megalis.bretagne.bzh + SIREN` via WebSearch pour trouver des URLs directes de PDFs, puis les télécharger et lire via Read (rendu image).

- **decomptes-publics.fr** — source DGFiP fiable pour les données financières communales par habitant, disponibles jusqu'à N-1. URL : `https://www.decomptes-publics.fr/villes/{insee}-{cp

### 2026-06-27 — bruz-en-action : dates RFC actus.json + Edit vs Python sur gros JSON
→ dispatch: local:bruz-en-action

- **Dates RFC tronquées dans `actus.json`** — les actus issues du flux Google News RSS arrivent avec des dates tronquées ("Sun, 21 De", "Thu, 02 Ap"). À corriger systématiquement en ISO (YYYY-MM-DD) avant tout commit. Ne pas laisser passer le format RSS brut.
- **Edit vs Python pour les modifications complexes de `dossiers.json`** — tenter un `Edit` après modification par le linter de l'IDE provoque une erreur de conflit ("file modified since read"). Pour ajouter un dossier entier, passer par un script Python (`json.load` / `append` / `json.dump`) est plus fia

### 2026-07-01 — bruz-en-action : import_excel.py réécrit (schéma réel vs script obsolète)
→ dispatch: local:bruz-en-action

- **`scripts/import_excel.py` visait un fichier et un schéma qui n'existaient plus** : chemin attendu `input/promesses_source.xlsx` (réel : `input/BEA/referentiel_promesses_bruz.xlsx`, en-têtes en ligne 3, plusieurs feuilles) et schéma JSON plat (`statut`/`date_statut`/`source_url`) alors que `data/promesses.json` a un schéma structuré (`piliers[]`, `statuts[]`, `promesses[].source.{doc,url,section,page,verbatim}`). Le script n'avait probablement jamais tourné sur le vrai fichier — à exécuter au moins une fois après toute modification de script d'import pour é

### 2026-06-20 — bruz-en-action : bugs CSS + liens + posture éditoriale
- **Bug CSS heading héritage** — `globals.css` définit `h1, h2, h3, h4 { color: var(--text-strong) }` qui écrase l'héritage CSS des sections parentes. Tout h1/h2 dans un hero sombre sans `color` explicite → texte quasi-noir sur fond bleu nuit, invisible. Fix : poser `color: "#fff"` explicitement sur chaque heading de hero. Pages concernées : dossiers, dossiers/[id], promesses, conseils, élus.
- **Link-checker absent sur bruz-en-action** — pas de script QA dans ce projet. 3 URLs cassées non détectées : data.gouv.fr (slug renommé, ajouter `-depuis-2012`), data.economie.gouv.fr (dataset déplacé s

### 2026-06-22 — bruz-en-action : état repos + hook clôture + fix bye
- **Hook clôture non déclenché sur "bye"** — `EXIT_KEYWORDS` dans `~/.shared-context/agents/session_close_hook.py` ne contenait pas "bye" ni "au revoir". Fix appliqué : les deux mots-clés ajoutés en tête de liste.

- **`Dev` vs `dev`** — le dossier local s'appelle `Dev` (majuscule) mais macOS est insensible à la casse, `~/Documents/dev/` fonctionne partout.
- **bruz-en-action : tous les deploys sont propres** — GitHub Actions 100% success, local = remote, données CMs bien structurées. Le "pb de droit" évoqué en session n'a pas pu être reproduit — à surveiller si ça revient.
- **Hook Stop vs Us

### 2026-06-23 — bruz-en-action : mobile nav + pipeline éditorial
- **Nav dupliquée → composant client** — 14 pages avaient chacune leur nav HTML. Pattern : composant `NavBar.tsx` avec `"use client"`, hamburger drawer, classe `bea-nav-desktop` masquée via media query dans globals.css. Piège : une constante `LOGO` était encore utilisée dans le footer de la homepage après refactor → erreur de build TypeScript à prévoir.
- **Pipeline queue human-in-the-loop** — Pattern pour revue éditoriale : scrapers → `actus_queue.json` (gitignorée) plutôt qu'un flag `reviewed` dans actus.json. Actus.json ne contient que les items validés. `agent_dossiers` sort du cron automa

### 2026-06-24 — bruz-en-action : liens cassés + accès TCC
- **`https://www.ville-bruz.fr/bruz-mag/` → 404** — URL disparue côté mairie. À corriger dans `agent_bruz_mag.py` (URL de scraping) et dans les `sources_surveillance` des données JSON si elle y figure.
- **TCC macOS révoqué en cours de session** — une commande `ls` refusée peut révoquer l'accès au dossier Documents pour le processus courant. Fix : relancer Claude Code depuis `~/Documents/Dev/bruz-en-action/`, ou re-autoriser dans Paramètres Système → Confidentialité → Fichiers et dossiers.
- **Liens cassés Rennes Métropole non résolus** — les 7 URLs de `metropole.json` retournent toutes 200 HT

### 2026-06-24 — bruz-en-action : timeout agent_select + config mailer
- **Timeout Claude CLI dans agent_select** — 80 items en une seule passe dépasse le timeout de 120s. Fix à prévoir : augmenter le timeout dans agent_select.py, ou traiter la queue par batch (ex. 20 items max par appel Claude).
- **Config mailer `~/.bruz-mailer.json` absente** — blocage email silencieux : l'agent_mailer log "aucun fichier proposals" mais le vrai blocage est en amont (select timeout). À créer manuellement par l'utilisateur avec App Password Gmail.
- **LaunchD exit 19968 = exit code 78** — pas un crash Python, c'est le timeout de l'étape select qui fait échouer le run. Le job lau


### 2026-06-25 — bruz-en-action : redesign palette + illustrations Gemini
- **Extraction couleurs PIL** — pour matcher une palette existante depuis une image, `colorsys.rgb_to_hsv` + filtre par plage de teinte (hue_min/hue_max) + saturation min est bien plus fiable que la moyenne brute (qui se noie dans les blancs/fonds clairs).
- **`h1/h2/h3/h4 { color: inherit }`** — à privilégier sur `color: var(--text-strong)` dans globals.css dès qu'on a des sections sombres. Sinon les headings passent en noir sur fond navy (la règle CSS spécifique écrase l'héritage du parent).
- **Prompt Gemini illustrations flat** — pattern efficace : palette hex explicite + "no text, no wate

### 2026-06-27 — bruz-en-action : dates RFC actus.json + Edit vs Python gros JSON
- **Dates RFC tronquées** — actus issues de Google News RSS arrivent tronquées ("Sun, 21 De"). Corriger en ISO avant commit.
- **Edit sur gros JSON** — si le linter IDE modifie le fichier entre un Read et un Edit, l'outil Edit échoue. Passer par `json.load / append / json.dump` en Python pour les ajouts complexes.

### 2026-06-27 — bruz-en-action : formatNomPrenom helper
- **`formatNomPrenom` dans `app/utils.ts`** — affiche les élus au format `NOM - Prénom`. Split sur le dernier espace, dernière partie en majuscules. Appliqué sur `/elus` et panel "Qui décide ?" de `/en-profondeur`.
- **Ne pas appliquer à `qui_decide` (dossiers/[id])** — mélange de personnes et institutions. Laisser `{q.nom}` brut.

### 2026-06-27 — bruz-en-action : diagnostic agent launchd + youtube_transcript_api
- **Launchd exit 19968 persistant après fix** — même avec batching en place, `LastExitStatus` reste 19968 tant que le job n'est pas rechargé. Fix : `launchctl unload` + `launchctl load` du plist.
- **`youtube_transcript_api` absent** — warnings non-fatals dans agent_enrichissement_cm. Installer : `pip3 install youtube-transcript-api`.
- **Pattern debug "agent n'a pas tourné"** — 1) `launchctl list com.bruz-en-action.veille` → LastExitStatus, 2) `tail scripts/veille.log` → dernière date, 3) run manuel direct.

### 2026-06-27 — bruz-en-action : nuance éditoriale ancienne vs nouvelle équipe
- **Événements programmés avant le 20 mars 2026** — tout événement national accueilli tôt dans le mandat 2026-2032 a été engagé par l'ancienne équipe (Salmon). Distinguer dans le ton : "ancienne équipe a programmé / nouvelle assure la continuité". Exemple : Championnat de France boccia (juin 2026) → décision prise ~6-12 mois avant le changement de conseil.

### 2026-06-27 — bruz-en-action : pipeline veille OF + proposals
- **OF 403 headless Chromium** — `p.chromium.launch()` sans `channel` → 403 même avec cookies. Fix : `channel="chrome"` (Chrome système). Appliqué dans `agent_ouestfrance._scrape_with_playwright()`.
- **Doublons proposals si copie manuelle** — copier un ancien `proposals/YYYY-MM-DD.json` vers la date du jour avant `agent_select` produit des doublons (merge cumulatif). Fix dédup URL+titre dans `agent_select.py`. Ne pas copier manuellement un fichier proposals si on va relancer select.
- **Test mailer rapide** — pattern : copier proposals existant vers date du jour → `python3 -c "from agents.agent_mailer import run; run()"`. Valide le SMTP sans relancer les scrapers.

### 2026-06-27 — bruz-en-action : dossier fabriqué depuis titre paywall
- **Ne pas créer un dossier depuis un titre d'article inaccessible (paywall)** — D09 Grand Logis construit à partir du titre OF sans accès au corps → faits inventés ("seule salle de cinéma", "Bruz n'a pas d'autre cinéma"). Règle : sans source lisible, pas de `ce_quon_sait` — ou dossier marqué "à documenter".

### 2026-07-01 — bruz-en-action : fix définitif agent veille launchd
- **Cause réelle du blocage (pas TCC comme supposé)** : `launchd` refuse de `posix_spawn` directement un binaire ad-hoc signé non notarié (le python Homebrew) → `posix_spawn ... Operation not permitted`, alors que le même binaire tourne très bien depuis Terminal. En plus, `StandardOutPath`/`WorkingDirectory` sous `~/Documents` cassaient aussi l'init du job (exit 78 / `getcwd: Operation not permitted`).
- **Fix appliqué** : venv dédié hors Documents `~/.venvs/bruz-en-action/` (créé avec `python3 -m venv --copies`, dépendances : `requirements.txt` + `openpyxl` + `playwright`) ; plist `~/Library/LaunchAgents/com.bruz-en-action.veille.plist` avec `ProgramArguments = ["/bin/bash", "-c", "exec ~/.venvs/bruz-en-action/bin/python3 <repo>/scripts/run_agents.py"]` ; logs redirigés vers `~/Library/Logs/bruz-en-action-veille.log` ; `WorkingDirectory` retiré du plist.
- **Après tout futur `brew upgrade python`** : le venv `--copies` n'est PAS affecté (copie physique indépendante) — pas besoin de refaire ce fix, sauf si le venv lui-même est supprimé/recréé.
- **Diagnostic si ça recasse** : `launchctl kickstart -k gui/$(id -u)/com.bruz-en-action.veille` puis `command log show --last 20s --style compact --predicate 'eventMessage CONTAINS "bruz-en-action.veille"'` pour voir l'erreur exacte.
- **`scripts/import_excel.py` était obsolète** — visait un fichier/schéma différents du réel. Réécrit pour matcher `input/BEA/referentiel_promesses_bruz.xlsx` (en-têtes ligne 3) et mettre à jour `data/promesses.json` par `ref` sans écraser `detail`/`source`.

### 2026-06-28 — bruz-en-action : sources financières + cohérence hero
- **Mégalis WebFetch inutilisable** — le portail utilise JS, WebFetch retourne seulement l'en-tête. Workaround : `site:data.megalis.bretagne.bzh SIREN` via WebSearch → URLs directes → WebFetch pour télécharger → Read (rendu image).
- **decomptes-publics.fr** — données DGFiP N-1 par habitant : `https://www.decomptes-publics.fr/villes/{insee}-{cp}-{nom}`. Fiable pour estimation rapide quand le CFU officiel n'est pas accessible.
- **CFU délai légal = 30 juin N+1** — CFU 2025 de Bruz attendu avant le 30/06/2026. Non publié à la date de cette session.
- **Hero bleu marine obligatoire sur toutes les pages** — `linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)`. Vérifier à chaque nouvelle page.

### 2026-07-02 — bruz-en-action : TCC, Mégalis via navigateur, pipeline veille, dates paywall
- **TCC macOS peut se révoquer en cours de session** — accès à `~/Documents/dev/bruz-en-action` (lecture ET écriture) qui cesse brutalement (`Operation not permitted`). Fix : Réglages Système → Confidentialité et sécurité → Fichiers et dossiers, réautoriser l'app qui fait tourner Claude Code — l'accès revient immédiatement, pas besoin de relancer la session.
- **Mégalis : `claude-in-chrome` bat WebFetch/WebSearch** — le portail est en JS pur (WebFetch ne rend rien) et son moteur interne est mal indexé par Google (des docs récents n'apparaissent pas dans les résultats WebSearch). Méthode fiable : naviguer `data.megalis.bretagne.bzh/?recherche=<terme>&siren=<SIREN>` avec `claude-in-chrome`. Pour l'URL PDF exacte d'une annexe : ouvrir l'aperçu puis `read_network_requests` filtré sur `OpenData`. Complète le workaround du 2026-06-28 (`site:` + WebSearch), à garder en fallback si le SIREN n'est pas encore connu.
- **Un dossier au contenu vide peut être un bucket actif du pipeline de veille** — avant de fusionner/supprimer un dossier qui semble creux (ex. D05), vérifier ses mots-clés dans `agent_dossiers.py`/`agent_select.py` : il peut classer une thématique transverse distincte d'un dossier voisin en apparence similaire. Le fusionner aveuglément casse la classification automatique.
- **Ne jamais reconstruire une date tronquée par déduction** — items presse Google News RSS avec date coupée à 10 caractères (ex. "Thu, 22 Ja", mois sur 2 lettres ambigu). Préférer `date: null` à une date devinée.

### 2026-07-03 — bruz-en-action : agent_select vidait la queue deux fois + Ouest-France cassé
- **`agent_select.py` perdait silencieusement les items en timeout Claude CLI** — la réinjection en queue (ligne ~155) était écrasée par une seconde écriture inconditionnelle en fin de fonction (ligne ~204, "vider la queue"). Fix : supprimé la seconde écriture. Récupérable tant que l'item n'est pas dans `actus.json` : re-scraper la source suffit (dédoublonnage sur `actus.json` ∪ queue courante, pas d'historique séparé).
- **`browser_cookie3` absent de `~/.venvs/bruz-en-action/`** faisait échouer l'agent Ouest-France en silence (statut de run marqué "rien de nouveau" au lieu d'erreur). Installé + ajouté à `requirements.txt` — à réinstaller si le venv est un jour recréé.
