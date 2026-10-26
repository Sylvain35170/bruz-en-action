# Archive — Pièges connus
> Entrées de plus de 30 jours retirées automatiquement de `CLAUDE.md`. Le git log fait foi pour le contexte complet.

### 2026-06-20 — bruz-en-action : bugs CSS + liens + posture éditoriale
- **Bug CSS heading héritage** — `globals.css` définit `h1, h2, h3, h4 { color: var(--text-strong) }` qui écrase l'héritage CSS des sections parentes. Tout h1/h2 dans un hero sombre sans `color` explicite → texte quasi-noir sur fond bleu nuit, invisible. Fix : poser `color: "#fff"` explicitement sur chaque heading de hero. Pages concernées : dossiers, dossiers/[id], promesses, conseils, élus.
- **Link-checker absent sur bruz-en-action** — pas de script QA dans ce projet. 3 URLs cassées non détectées : data.gouv.fr (slug renommé, ajouter `-depuis-2012`), data.economie.gouv.fr (dataset déplacé
… _(learning complet dans `~/.shared-context/learnings.md`)_

### 2026-06-22 — bruz-en-action : état repos + hook clôture + fix bye
- **Hook clôture non déclenché sur "bye"** — `EXIT_KEYWORDS` dans `~/.shared-context/agents/session_close_hook.py` ne contenait pas "bye" ni "au revoir". Fix appliqué : les deux mots-clés ajoutés en tête de liste.

- **`Dev` vs `dev`** — le dossier local s'appelle `Dev` (majuscule) mais macOS est insensible à la casse, `~/Documents/dev/` fonctionne partout.
- **bruz-en-action : tous les deploys sont propres** — GitHub Actions 100% success, local = remote, données CMs bien structurées. Le "pb de droit" évoqué en session n'a pas pu être reproduit — à surveiller si ça revient.
- **Hook Stop vs
… _(learning complet dans `~/.shared-context/learnings.md`)_

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

### 2026-06-27 — bruz-en-action : dates RFC actus.json + Edit vs Python sur gros JSON
→ dispatch: local:bruz-en-action

- **Dates RFC tronquées dans `actus.json`** — les actus issues du flux Google News RSS arrivent avec des dates tronquées ("Sun, 21 De", "Thu, 02 Ap"). À corriger systématiquement en ISO (YYYY-MM-DD) avant tout commit. Ne pas laisser passer le format RSS brut.
- **Edit vs Python pour les modifications complexes de `dossiers.json`** — tenter un `Edit` après modification par le linter de l'IDE provoque une erreur de conflit ("file modified since read"). Pour ajouter un dossier entier, passer par un script Python (`json.load` / `append` / `json.dump`) est plus fia

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

### 2026-06-28 — bruz-en-action : sources financières communes + cohérence visuelle
→ dispatch: local:bruz-en-action

- **Mégalis WebFetch inutilisable** — `data.megalis.bretagne.bzh` nécessite JS pour rendre ses listes de documents. WebFetch retourne seulement le titre "Délibérations et actes administratifs" sans aucun contenu. Seul workaround : `site:data.megalis.bretagne.bzh + SIREN` via WebSearch pour trouver des URLs directes de PDFs, puis les télécharger et lire via Read (rendu image).

- **decomptes-publics.fr** — source DGFiP fiable pour les données financières communales par habitant, disponibles jusqu'à N-1. URL : `https://www.decomptes-publics.fr/villes/{insee}-{cp

### 2026-06-28 — bruz-en-action : sources financières + cohérence hero
- **Mégalis WebFetch inutilisable** — le portail utilise JS, WebFetch retourne seulement l'en-tête. Workaround : `site:data.megalis.bretagne.bzh SIREN` via WebSearch → URLs directes → WebFetch pour télécharger → Read (rendu image).
- **decomptes-publics.fr** — données DGFiP N-1 par habitant : `https://www.decomptes-publics.fr/villes/{insee}-{cp}-{nom}`. Fiable pour estimation rapide quand le CFU officiel n'est pas accessible.
- **CFU délai légal = 30 juin N+1** — CFU 2025 de Bruz attendu avant le 30/06/2026. Non publié à la date de cette session.
- **Hero bleu marine obligatoire sur toutes les pages** — `linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)`. Vérifier à chaque nouvelle page.

### 2026-07-01 — bruz-en-action : import_excel.py réécrit (schéma réel vs script obsolète)
→ dispatch: local:bruz-en-action

- **`scripts/import_excel.py` visait un fichier et un schéma qui n'existaient plus** : chemin attendu `input/promesses_source.xlsx` (réel : `input/BEA/referentiel_promesses_bruz.xlsx`, en-têtes en ligne 3, plusieurs feuilles) et schéma JSON plat (`statut`/`date_statut`/`source_url`) alors que `data/promesses.json` a un schéma structuré (`piliers[]`, `statuts[]`, `promesses[].source.{doc,url,section,page,verbatim}`). Le script n'avait probablement jamais tourné sur le vrai fichier — à exécuter au moins une fois après toute modification de script d'import pour é

### 2026-07-01 — bruz-en-action : fix définitif agent veille launchd
- **Cause réelle du blocage (pas TCC comme supposé)** : `launchd` refuse de `posix_spawn` directement un binaire ad-hoc signé non notarié (le python Homebrew) → `posix_spawn ... Operation not permitted`, alors que le même binaire tourne très bien depuis Terminal. En plus, `StandardOutPath`/`WorkingDirectory` sous `~/Documents` cassaient aussi l'init du job (exit 78 / `getcwd: Operation not permitted`).
- **Fix appliqué** : venv dédié hors Documents `~/.venvs/bruz-en-action/` (créé avec `python3 -m venv --copies`, dépendances : `requirements.txt` + `openpyxl` + `playwright`) ; plist `~/Library/LaunchAgents/com.bruz-en-action.veille.plist` avec `ProgramArguments = ["/bin/bash", "-c", "exec ~/.venvs/bruz-en-action/bin/python3 <repo>/scripts/run_agents.py"]` ; logs redirigés vers `~/Library/Logs/bruz-en-action-veille.log` ; `WorkingDirectory` retiré du plist.
- **Après tout futur `brew upgrade python`** : le venv `--copies` n'est PAS affecté (copie physique indépendante) — pas besoin de refaire ce fix, sauf si le venv lui-même est supprimé/recréé.
- **Diagnostic si ça recasse** : `launchctl kickstart -k gui/$(id -u)/com.bruz-en-action.veille` puis `command log show --last 20s --style compact --predicate 'eventMessage CONTAINS "bruz-en-action.veille"'` pour voir l'erreur exacte.
- **`scripts/import_excel.py` était obsolète** — visait un fichier/schéma différents du réel. Réécrit pour matcher `input/BEA/referentiel_promesses_bruz.xlsx` (en-têtes ligne 3) et mettre à jour `data/promesses.json` par `ref` sans écraser `detail`/`source`.

### 2026-07-02 — bruz-en-action : TCC, Mégalis via navigateur, pipeline veille, dates paywall
- **TCC macOS peut se révoquer en cours de session** — accès à `~/Documents/dev/bruz-en-action` (lecture ET écriture) qui cesse brutalement (`Operation not permitted`). Fix : Réglages Système → Confidentialité et sécurité → Fichiers et dossiers, réautoriser l'app qui fait tourner Claude Code — l'accès revient immédiatement, pas besoin de relancer la session.
- **Mégalis : `claude-in-chrome` bat WebFetch/WebSearch** — le portail est en JS pur (WebFetch ne rend rien) et son moteur interne est mal indexé par Google (des docs récents n'apparaissent pas dans les résultats WebSearch). Méthode fiable : naviguer `data.megalis.bretagne.bzh/?recherche=<terme>&siren=<SIREN>` avec `claude-in-chrome`. Pour l'URL PDF exacte d'une annexe : ouvrir l'aperçu puis `read_network_requests` filtré sur `OpenData`. Complète le workaround du 2026-06-28 (`site:` + WebSearch), à garder en fallback si le SIREN n'est pas encore connu.
- **Un dossier au contenu vide peut être un bucket actif du pipeline de veille** — avant de fusionner/supprimer un dossier qui semble creux (ex. D05), vérifier ses mots-clés dans `agent_dossiers.py`/`agent_select.py` : il peut classer une thématique transverse distincte d'un dossier voisin en apparence similaire. Le fusionner aveuglément casse la classification automatique.
- **Ne jamais reconstruire une date tronquée par déduction** — items presse Google News RSS avec date coupée à 10 caractères (ex. "Thu, 22 Ja", mois sur 2 lettres ambigu). Préférer `date: null` à une date devinée.

### 2026-07-03 — bruz-en-action : agent_select vidait la queue deux fois (perte silencieuse d'items en timeout)
→ dispatch: local:bruz-en-action

- **`agent_select.py` réinjectait les items en échec de batch (timeout Claude CLI) en fin de queue à la ligne ~155, puis une seconde écriture inconditionnelle juste après (ligne ~204, "vider la queue, items traités") écrasait cette réinjection avec un tableau vide.** Résultat : tout item dont le batch timeoutait (75s, fréquent avec BATCH_SIZE=5 sur des lots de 7+) disparaissait silencieusement au lieu d'être retraité au run suivant — aucune erreur, aucun log d'alerte visible dans le statut de run. Fix : supprimé la seconde écriture, la queue garde l'état
… _(learning complet dans `~/.shared-context/learnings.md`)_

### 2026-07-03 — bruz-en-action : agent_select vidait la queue deux fois + Ouest-France cassé
- **`agent_select.py` perdait silencieusement les items en timeout Claude CLI** — la réinjection en queue (ligne ~155) était écrasée par une seconde écriture inconditionnelle en fin de fonction (ligne ~204, "vider la queue"). Fix : supprimé la seconde écriture. Récupérable tant que l'item n'est pas dans `actus.json` : re-scraper la source suffit (dédoublonnage sur `actus.json` ∪ queue courante, pas d'historique séparé).
- **`browser_cookie3` absent de `~/.venvs/bruz-en-action/`** faisait échouer l'agent Ouest-France en silence (statut de run marqué "rien de nouveau" au lieu d'erreur). Installé + ajouté à `requirements.txt` — à réinstaller si le venv est un jour recréé.

### 2026-07-04 — bruz-en-action : link-checker ajouté, limites anti-bot, convention liens expirés
→ dispatch: local:bruz-en-action

- **Link-checker créé** (`agent_qa.py --links`/`--links-only` + `utils.check_url_status()`) — scanne `data/*.json`, distingue "cassé confirmé" (404/DNS/timeout) de "anti-bot probable" (403/429/redirections).
- **Ouest-France, HelloAsso, ac-rennes.fr, ARS Bretagne bloquent en 403 même avec un User-Agent navigateur** — pas de bypass simple, cohérent avec le piège OF déjà connu (Playwright `channel="chrome"` requis).
- **Convention `<clé>_expiree: true`** pour les sources mortes sans alternative — déjà en place avant cette session dans `dossiers.json` (commit `5e00862`), généralisée à `actus.json`/`elus.json`/`evenements.json`. Le link-checker les ignore désormais.
- **Wayback Machine (`archive.org/wayback/available`) rate-limite (429)** si appelée sans délai — espacer les requêtes d'~3s.

### 2026-07-07 — bruz-en-action : revue éditoriale, plantage transitoire agent_select, validation dédup
→ dispatch: local:bruz-en-action

- **`agent_select` planté le 05/07 au soir** (~15 min puis erreur Claude CLI vide, stderr vide malgré returncode≠0) — retry le lendemain a fonctionné en 4s. Probablement transitoire (réseau/API) : en cas d'erreur vide, relancer avant de creuser le code.
- **Seuil dédup `is_already_published` (0.6) validé sur cas réel** — 2 items du 06/07 correctement écartés comme doublons (ratio 0.72 et 0.93) de stories déjà publiées fin juin.
- **Revue éditoriale : pas d'outil dédié nécessaire** — pour ~10 items pending tous les 3-4 jours, le triage en chat (proposition accept/reject + confirmation + `review_proposals.py`) suffit.

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

### 2026-07-11 — bruz-en-action : agent_dossiers recréait des doublons à chaque run
- **`agent_dossiers.py` ne dédupliquait `actus_recentes` que par `source_url`** (`known_urls_by_dossier`) — pas par (date, titre). Or une même séance de CM a plusieurs sources (convocation Mégalis, Semaine à Bruz, Bruz Mag, vidéo/audio YouTube) et un même dossier peut matcher plusieurs mots-clés : résultat, chaque run d'`agent_dossiers` réinjectait un doublon de l'événement déjà présent avec une URL différente. Les dossiers dédupliqués à la main (D01-D07, D10, D12, D13) redevenaient sales dès le prochain `agent_dossiers` post-revue.
- **Fix** : ajout de `known_events_by_dossier` (clé `(date, titre)`) en plus de `known_urls_by_dossier`. Branche `actus.json` : skip si l'event_key existe déjà. Branche `cms.json` : une seule source insérée par séance (la première non déjà connue), `break` après insertion — plus de boucle sur toutes les sources d'une même séance.
- **Vérifié idempotent** : un second `agent_dossiers` juste après ne réinjecte rien ("aucune nouvelle info à injecter").

### 2026-07-11 — bruz-en-action : Bruz Mag/Semaine à Bruz mélangés aux séances de CM
- **`agent_bruz_mag.py` injectait les bulletins municipaux (Bruz Mag, Semaine à Bruz) dans le même "seances" que les séances de conseil municipal (`cms.json`)**, avec un champ `type` pour les distinguer — mais rien côté site ne filtrait dessus. Résultat : `/conseils` affichait des bulletins comme s'ils étaient des CM, avec leur propre page `/conseils/SAB-858`.
- **Fix** : nouveau fichier `data/bulletins.json` (schéma propre, sans `statut`), nouvelle page `/publications` (ajoutée à la nav). `agent_bruz_mag.py` écrit désormais dans `bulletins.json`. `cms.json` ne contient plus que des séances CM — `/conseils` n'a plus besoin de filtrer.
- **Repère pour la suite** : toute nouvelle source de veille doit avoir son propre fichier `data/*.json` si elle n'est pas structurellement une actu (`actus.json`) ou une séance de CM (`cms.json`) — ne pas réutiliser un tableau existant "parce que c'est proche".

### 2026-07-10 — bruz-en-action : pages mairie réutilisées en place (dédup URL insuffisante)
- **La mairie republie certaines pages d'alerte à la même URL** au lieu d'en créer une nouvelle — ex. `/actualites/vigilance-canicule/` est passée de "Vigilance jaune canicule" (18/06/2026) à "Vigilance rouge canicule" (10/07/2026) sans changer d'adresse. `known_urls()` dédupliquant uniquement par `source_url`, ce type de mise à jour était silencieusement ignoré par `agent_mairie.py`.
- **Fix** : `utils.check_content_changed(url, texte)` hash le texte du bloc scrapé et le compare au dernier hash connu (registre local `scripts/proposals/content_hashes.json`, gitignoré). `agent_mairie.py` requeue désormais l'item avec un id distinct (`stable_id(url + "#" + today())`, suffixe "(mise à jour)") quand une URL déjà connue a changé de contenu — pas de collision avec la décision de revue déjà prise sur l'ancienne version.
- **Portée du fix** : uniquement `agent_mairie.py` pour l'instant (source la plus concernée par ce pattern). À étendre à `agent_presse`/`agent_ouestfrance` si le même symptôme apparaît côté presse.

### 2026-07-13 — bruz-en-action : agent_agenda, dates estimées, fin du lot 3 audit
→ dispatch: local:bruz-en-action

- **Agenda ville-bruz.fr scrapable mais `datetime` décalé** — cartes `article.event` bien structurées (`time.date-from/.date-to`, `.card-tags .term`, `h3.card-title a`), mais l'attribut `datetime` peut être décalé d'un jour vs le jour affiché (Bal des pompiers : affiché « 13 juillet », datetime 2026-07-14). `agent_agenda.py` parse donc les spans jour/mois affichés et ne prend que l'année du `datetime`. Corollaire homepage : toujours **trier par date avant `slice()`** — le filter+slice sans tri prenait les 4 premiers événements dans l'ordre du fichier
… _(learning complet dans `~/.shared-context/learnings.md`)_

### 2026-07-13 — agent_agenda : datetime décalé, tri homepage, dates estimées, TS JSON
- **Agenda ville-bruz.fr** : cartes `article.event` propres, mais l'attribut `datetime` de `time.date-from` peut être décalé d'un jour vs le jour affiché → `agent_agenda.py` parse les spans jour/mois affichés, seule l'année vient du `datetime`.
- **Homepage : trier par date avant `slice()`** — filter+slice sans tri prenait les 4 premiers événements dans l'ordre du fichier (septembre avant juillet).
- **ARS Bretagne** : 403 sur WebFetch/curl mais navigable via `claude-in-chrome` ; une page indexée par Google qui retourne « Accès refusé » = brouillon Drupal → publication imminente.
- **TS + imports JSON** : typer les helpers `{champ?: unknown}` + `Array.isArray` — une signature étroite (`ce_quon_sait?: unknown[]`) est rejetée par l'union inférée de `dossiers.json`.
- **`date_publication_estimee`** : champ distinct pour les actus sans date d'article (affiché ≈), posé par `review_proposals.py` à l'acceptation ; backfill historique fait via `git log --reverse` sur `actus.json` (première apparition de l'id = date d'entrée).

### 2026-07-16 — agent_dossiers : last_activity futur + sur-matching mots-clés
- **Une actu datée dans le futur épinglait son dossier en tête de tri** — l'annonce du CM de rentrée (date 2026-09-21) avait mis `last_activity: 2026-09-21` sur D03, le plaçant premier sur la homepage et `/dossiers` jusqu'à fin septembre. Fix : `agent_dossiers` plafonne `last_activity` à `today()` (`min(news["date"], today())`) dans les deux branches (actus + cms).
- **Le champ `dossier` posé à la revue fait foi** — `agent_dossiers` re-matchait toutes les actus par mots-clés en ignorant le classement de la revue humaine : la bio de Robert Barré (Ker Lann, ZAC du Vert Buisson, finances) partait dans D01/D02/D03/D10 hors sujet. Fix : si `actu["dossier"]` correspond à un ID de dossier existant, injection uniquement là ; repli mots-clés sinon (`à_classer`, champ absent). Effet de bord à connaître : au premier run post-fix, les actus anciennes classées mais jamais matchées entrent dans leur dossier assigné.
- **Séances à venir : `points_cles` vides → `detail` vide** — repli sur `resume_executif` ajouté dans la branche cms.

### 2026-07-17 — bruz-en-action : balayage dossiers + lot 4 audit (/histoire, /connaitre-bruz, /glossaire)
→ dispatch: local:bruz-en-action + global

- **Contenu halluciné détecté** : l'agrégateur Archyde donnait des chiffres très précis (12 ha, projet nommé "Quai Vilaine Sud", 800 logements, financements chiffrés à l'euro) sur la friche Bonna Sabla à Bruz — en réalité mélangés avec deux **autres** sites Bonna Sabla réels en reconversion ailleurs en France (Vendargues-34, Plaisance-du-Touch-31). Réflexe général : quand un seul agrégateur de faible fiabilité sort des chiffres très précis non recoupés par une source primaire/officielle, présumer l'hallucination et vérifier ailleurs (ici : Mégalis,
… _(learning complet dans `~/.shared-context/learnings.md`)_

### 2026-07-17 — bruz-en-action : balayage dossiers, contenu halluciné, lot 4 audit livré
- **Contenu halluciné détecté sur un agrégateur tiers (Archyde)** — chiffres très précis (12 ha, "Quai Vilaine Sud", 800 logements) sur la friche Bonna Sabla à Bruz, en réalité mélangés avec deux autres sites Bonna Sabla réels ailleurs en France. Réflexe : un seul agrégateur de faible fiabilité + chiffres non recoupés = présumer l'hallucination, vérifier via Mégalis/sources officielles avant d'écrire (dossier créé D22 avec uniquement les faits confirmés).
- **`fetch_insee.py` écrase `series_longues.population` à chaque run** — les points Cassini/EHESS (1793-1872, hors couverture INSEE) doivent être fusionnés *dans le script* (constante `CASSINI_1793_1946` + merge dans `ecrire_bruz_json`), jamais ajoutés à la main dans `bruz.json`.
- **Test d'une page avec filtre client-side (`use client`) via `serve` local** — `serve out/` seul casse le `basePath` (`_next/static/*` en 503, tout semble non-hydraté). Fix : symlink `out` → `bruz-en-action/` dans un dossier parent, puis servir ce parent. Et pour taper dans un input contrôlé React via claude-in-chrome, `computer.type` ne déclenche pas toujours l'`onChange` — dispatcher l'event `input` via le setter natif JS si le test semble ne rien faire.
- **Lot 4 de l'audit livré** (`/histoire`, `/connaitre-bruz`, `/glossaire`) — nouveau fichier `data/histoire.json` (frise, cycles d'urbanisation, maires) suit le même pattern que les autres data files (source unique, pages ne font que le rendre).

### 2026-07-18 — bruz-en-action : mailer SMTP bloqué par VPN pro, migration API Gmail
- **Le VPN pro Orange (Cisco Secure Client, profil "DEV ACCESS") bloque les ports SMTP sortants (465 et 587)** — testé en direct : `nc -zv smtp.gmail.com 465/587` timeout/no route to host alors que ping/DNS/HTTPS (443) passent normalement. Le mailer de la veille (17h, `agent_mailer.py`) échouait silencieusement quand ce VPN était connecté au moment du run — pas de perte de données (le registre `pending.json` garde les items non mailés), juste pas de notification ce jour-là.
- **Diagnostic à ne pas précipiter** : un premier réflexe a incriminé à tort CyberGhost (VPN perso, en réalité désactivé) avant de vérifier via `ps aux`/`scutil --nc`/DNS (`francetelecom.fr`) que le vrai coupable était Cisco Secure Client. Toujours vérifier quel process tient réellement le tunnel (`lsof -i`, `ps aux | grep vpn`) avant d'accuser un VPN par déduction.
- **Fix définitif** : migration SMTP → API Gmail (HTTPS/443, jamais bloqué par ce VPN). Projet GCP dédié `bruz-en-action-mailer-502808`, scope `gmail.send`, credentials OAuth "Desktop app" stockées hors repo (`~/.bruz-mailer-gmail/client_secret.json` + `token.json`, jamais commitées, chmod 600). Premier consentement interactif fait une fois (via navigateur) ; ensuite le refresh token permet un fonctionnement 100% autonome depuis `launchd`.
- **Piège annexe OAuth** : le premier essai de consentement a échoué en `403 access_denied` bien que l'email de test venait d'être ajouté dans "Audience > Test users" — en fait le clic sur "Save" n'avait pas pris (page rechargée avant que le chip email soit confirmé). Toujours re-vérifier via `get_page_text` que la liste des test users n'est pas vide avant de retenter le consentement (pas la peine d'attendre une propagation Google qui n'était pas le vrai problème).

### 2026-07-26 — bruz-en-action : build cassé 6 jours, archive de pièges en boucle, routage des dossiers
- **Supprimer un champ de `data/*.json` sans greper ses consommateurs casse le build en silence** — `dette_ecart_2023_2024` retiré de `bruz.json` le 20/07 (à raison : le CFU 2024 officiel venait d'être trouvé), mais `/statistiques` le lisait toujours → échec au type-check, 3 déploiements GitHub Pages en échec, prod figée 6 jours sans que ça se voie. Greper le nom du champ dans `app/` avant toute suppression, et passer un `gh run list` en fin de session : un commit réussi ne prouve pas que le site est déployé.
- **`agent_select` route depuis `dossiers.json`, plus depuis une liste en dur** — `DOSSIERS_DESC` maintenue à la main avait raté D21 Culture (jamais proposé au classement depuis sa création) et gardait D08/D09/D14 supprimés/fusionnés. `build_dossiers_desc()` lit désormais le champ `mots_cles_ia` de chaque dossier : **tout nouveau dossier doit porter ses `mots_cles_ia`** pour être routable (repli sur le titre sinon).
- **Export statique : pas de slash final** — `/statistiques/` renvoie 404, la bonne URL est `/statistiques` (le build génère `statistiques.html`, pas un dossier). À savoir avant de conclure qu'une page est cassée en la testant au curl.
- **`PIEGES_ARCHIVE.md` accumulait des copies de la même entrée** — bug de l'outillage de clôture (`_append_piege()` ne dédupliquait que sur `CLAUDE.md`, pas sur l'archive où `_rotate_pieges()` venait de déplacer l'entrée). Corrigé en amont dans dm2p-copilot-setup ; l'archive a été dédupliquée (14 entrées → 5).

### 2026-07-28 — extraction PDF en colonnes, boucle de veille, audit UI incomplet
- **Les bulletins municipaux sont sur 5-6 colonnes : les extraire en bandes fixes produit de fausses informations.** `extract_text()` linéaire entrelace les colonnes ; découper en N bandes est pire. Sans recouvrement les emails sont tronqués en bord de bande ; avec recouvrement un fragment de la colonne voisine déborde sur la même ligne — « EMMAÜS BRUZ » lu « EMMAÜS BRUZ Grat » n'est plus reconnu comme intertitre, son bloc est absorbé et **le mail d'Emmaüs est attribué à l'association précédente**. Méthode retenue dans `agent_coup_de_pouce.detecter_colonnes()` : repérer les gouttières (bandes verticales sans aucun mot) via `page.extract_words()`. Corollaires : tester `all(c.isupper() ...)` plutôt qu'une classe de caractères (le `Ü` manquait), et retirer les emails avant de chercher une URL (sinon `orange.fr` sort de `secath.seiche@orange.fr`). **Relire les contacts de chaque candidat contre le PDF avant publication.**
- **Tout `continue` placé avant l'écriture au registre condamne l'item à revenir chaque jour.** `agent_select` écartait les doublons déjà publiés avant la boucle alimentant `pending.json` : jamais mémorisés, donc re-scrapés, et le filtre s'appliquant après l'analyse Claude, chaque run repayait un appel modèle pour le même item. Même famille que le bug ayant motivé le registre le 05/07. Un item ne sort jamais du flux sans être mémorisé, quel que soit le motif du rejet.
- **Un lot d'audit coché n'est pas un lot livré : ouvrir le site et cliquer.** Trois défauts vivants en prod alors que les 4 lots de `AUDIT_SITE_2026-07.md` étaient clos — `/metro` retirée de la nav et du sitemap mais jamais supprimée du repo (servie en 200 avec des données en dur divergentes), liens dossiers en dur sans garde-fou (désormais contrôlés par `validate_data.validate_liens_nav()`), et libellés coupés en deux lignes dans les déroulants, visibles seulement en ouvrant un menu.
- **Un champ énuméré qui pilote un filtre d'affichage doit être validé en erreur.** `/coup-de-pouce` construit ses sections par `byType()` : un `type` hors référentiel fait disparaître l'item de toutes les sections sans erreur, tout en gonflant `items.length` — ce qui empêche même le message « aucune initiative » de s'afficher.
- **Prompts d'illustration : lister la palette ne suffit pas, il faut interdire.** Sur 9 illustrations, la 4e a dérivé (arbres verts, aucun or) jusqu'à ce que le prompt impose « NO GREEN AT ALL » et « gold must be clearly present ». Voir `PROMPTS_ILLUSTRATIONS.md` et `scripts/integre_illustration.py`.

### 2026-08-01 — mailer muet 7 jours, boucle de veille Presse, API Mégalis

- **Une app OAuth Google en statut « Testing » révoque son refresh token tous les 7 jours.** `invalid_grant` du 25/07 au 01/08 sur `agent_mailer`, sans rien changer côté code. Reconsentir ne rachète que 7 jours : publier l'app (*Auth Platform → Audience → Publish app* → `In production`). L'écran « app non validée » et le bandeau « requires verification » sont sans conséquence en usage perso. Sur un compte gmail.com, « Make internal » est grisé.
- **Un agent qui échoue proprement (`log ERR` + `return False`) était compté en succès** — le bilan affirmait « propositions envoyées » alors qu'aucun mail ne partait. `utils.log` journalise désormais les `ERR` (`errors_logged()`/`reset_errors()`) et `run_agents` tranche entre *rien de nouveau* et *en panne* (`status: error` visible dans `/status`). Instrumenter le logger couvre les 11 agents d'un coup.
- **Google News redirige vers `consent.google.com` avec un jeton `escs=` régénéré à chaque requête** : la dédup par `source_url` ne matchait jamais, l'article repartait en queue à chaque run. Dédup sur `stable_id` (`known_ids()`, dédup id-first dans `append_to_queue`). Ne jamais *stocker* une URL de consentement — elle envoie le lecteur sur un écran Google. `requests` ne franchit pas ce mur (ni HEAD nu, ni cookie `CONSENT`) : résoudre dans le navigateur.
- **Soft-404 : `organization/commune-de-bruz` répond 200 mais retombe sur l'accueil Mégalis.** Invisible pour `agent_qa --links`. `validate_data.check_urls_interdites()` échoue désormais sur ces motifs — **et scanne aussi `app/**/*.tsx`** : après avoir corrigé 28 occurrences dans `data/`, 4 liens câblés en dur dans le TSX étaient toujours servis en prod. Corriger les données ne suffit pas ; vérifier sur le site déployé.
- **L'API Mégalis est publique et sans authentification** — contrairement à ce que ce fichier affirmait depuis juin. `data-publication.megalis.bretagne.bzh/mq_apis/actes/v1/search?siren=213500473`, trouvée en lisant le trafic réseau du portail (SPA Angular). `agent_megalis` s'appuie dessus (typologies `99_DE`/`99_HP`, fenêtre 15 j sur la date de publication). **SIREN de Bruz = 213500473.**
- **Un « probablement » dans un résumé de veille ne se publie jamais.** Une proposition disait Bruz « probablement concernée » par un arrêté barbecue ; l'article citait Rennes, Bourgbarré, La Chapelle-Thouarault et Chartres-de-Bretagne, pas Bruz. Corollaire outillage : `find` (recherche sémantique navigateur) l'avait rapportée comme mentionnée — le texte disait l'inverse. Lire le contenu avant de conclure.
- **`agent_agenda` réécrit `evenements.json` à chaque scraping** : un champ ajouté à la main y serait perdu. Le regroupement thématique de `/agenda` vit donc dans `THEMES_AGENDA` (`app/utils.ts`), dérivé du tag brut. `themeEvenement()` ne renvoie jamais null — bac « Autres rendez-vous » obligatoire, et la page affiche le nombre de non-classés pour qu'un nouveau tag mairie se voie.

### 2026-08-14 — Deux détails d'outillage de revue
→ dispatch: local:bruz-en-action

- `review_proposals.py --dossier` s'applique à **tout le lot accepté** : classer des
  items dans des dossiers différents demande autant d'appels que de dossiers.
- Les titres remontés par `agent_megalis` sont les libellés bruts des actes et arrivent
  illisibles (« Finances — Ogec saint theodore guerin — Garantie d'emprunt — Err —
  Plume »). Réécrits à la main à la revue ; à nettoyer dans l'agent si ça se répète —
  ce sera visible au CM du 21/09, qui doit remonter ~46 actes d'un coup.

---

### 2026-08-14 — Relire le PDF ne sert pas qu'à détecter les erreurs de colonnes
→ dispatch: local:bruz-en-action

Vérification des deux candidats contre la Semaine à Bruz n°858 : les attributions
étaient **correctes** (le `06 14 69 29 73` bien dans le bloc JAB, l'email atelier philo
bien distinct du `taichi.responsable@albruz.fr` voisin). Mais `chapeau: corps[:400]`
tronque le texte et fait perdre de l'information utile — la cotisation JAB (30 € + 20 €)
avait sauté, alors que c'est précisément ce que cherche quelqu'un qui veut s'inscrire.
La relecture PDF rattrape aussi ça, pas seulement les fausses attributions.

### 2026-08-14 — Pas de source, pas de publication (coup de pouce)
→ dispatch: local:bruz-en-action

Règle éditoriale posée le 14/08. Un lien vers le site **national** des Restos du Cœur ne
source pas l'antenne bruzoise ni son appel à bénévoles : CP01 et CP02 (aucun lien du
tout) retirés. CP03 conservé, son site officiel promu en `source` après vérification
qu'il répond 200 et documente bien la ferme bruzoise. `validate_data` passe de 3
warnings à 0 — les warnings pointaient exactement ces items.

### 2026-08-14 — Un filtre sur la date du jour est figé au build en export statique
→ dispatch: local:bruz-en-action + global

`app/coup-de-pouce/page.tsx` filtrait ses items sur `date_fin >= new Date()`, et son
commentaire affirmait que « l'item disparaît de lui-même une fois l'échéance passée ».
Faux : la page est un composant serveur (pas de `"use client"`) dans un export statique,
donc `new Date()` est évalué **au build**, pas à la visite — et `deploy.yml` ne se
déclenchait que sur `push`. La guinguette CHOQUE (`date_fin: 2026-08-15`) serait restée
affichée comme en cours tant que personne n'aurait poussé. Les mêmes lignes existent sur
la homepage (`app/page.tsx`, événements à venir) et `/agenda` : trois pages concernées.

Fix : `schedule: cron "17 4 * * *"` dans `deploy.yml` — un rebuild quotidien rend la
date de nouveau vraie sur les trois pages d'un coup. L'alternative (passer les filtres
côté client) demandait trois modifications et autant de tests.

➡️ Règle : dans un site statique, toute logique qui compare à « aujourd'hui » a besoin
d'un rebuild périodique, sinon elle ment silencieusement. Et un commentaire de code qui
affirme un comportement automatique ne prouve rien — le confronter au mode de rendu.
Même famille que « build vert ≠ UI correcte » : rien ici n'échoue, l'information est
juste périmée.

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

### 2026-08-26 — bruz-en-action : l'adresse de contact du site pointait vers une boîte qui n'existe pas
→ dispatch: local:bruz-en-action

`meta.json > contact.email` valait `bruzenaction@gmail.com` depuis le lancement du
site — repris tel quel par `SignalementButton.tsx` (bouton "Signaler" sur
dossiers/promesses/footer) et prévu comme cible de l'agent Signalements. Cette
adresse n'existe pas. Corrigée vers `sylv.bertrand@gmail.com` (même compte que
`agent_mailer`) le 26/08 — ce qui a aussi permis de simplifier le setup OAuth de
l'agent Signalements : réutilisation du client OAuth du mailer au lieu d'un
nouveau projet Google Cloud (seul le token diffère, scope `gmail.readonly`).

➡️ Tout signalement citoyen envoyé depuis le lancement du site est parti dans le
vide, sans erreur visible côté visiteur (un mailto: vers une adresse inexistante
ne prévient personne). Une adresse de contact affichée sur un site doit être
vérifiée en conditions réelles (s'envoyer un email de test), pas seulement
relue — rien dans le code ni le build ne peut détecter qu'une boîte n'existe pas.

### 2026-08-20 — bruz-en-action : une fiche cms.json "complète" peut quand même avoir un trou politique
→ dispatch: local:bruz-en-action

Le PV Mégalis du CM du 18 mai avait déjà une fiche détaillée dans `cms.json` (36
délibérations, points chauds CCAS/restauration/handicap). Mais le point le plus tendu de
la séance — délibération 26-05-37 (suppressions/créations de postes), débat opposition
vs majorité sur la suppression du poste direction culture/vie associative/sport — n'y
figurait pas.

➡️ Une proposition Mégalis pointant vers un PV déjà "couvert" mérite quand même une
lecture intégrale avant rejet — la fiche existante peut avoir raté le passage le plus
substantiel politiquement, en général le débat contradictoire plutôt que l'énoncé des
délibérations techniques.

### 2026-08-20 — bruz-en-action : une date "impossible" dans une actu mairie n'est pas une erreur d'extraction
→ dispatch: local:bruz-en-action

L'actu STAR de la mairie (publiée 20/08) annonçait "lundi 31 septembre" — date qui
n'existe pas. Vérifié directement dans le HTML brut (`curl` + grep) : c'est bien une
coquille sur le site source, pas une hallucination du fetch. Recoupement calendrier :
le 31 août 2026 tombe un lundi et correspond au calendrier habituel de rentrée STAR —
publié avec la date corrigée et la coquille source mentionnée explicitement.

➡️ Une date impossible dans un texte source doit être vérifiée au niveau HTML brut avant
de conclure à une erreur d'outillage, puis recoupée par calendrier plutôt que publiée
telle quelle ou silencieusement corrigée sans mention.

### 2026-08-20 — Date impossible dans une actu source, et fiche CM déjà "complète" mais trouée
→ dispatch: local:bruz-en-action

- **Une date impossible dans un texte source (« lundi 31 septembre ») n'est pas une
  erreur d'extraction** : vérifiée dans le HTML brut (`curl` + grep), c'était une vraie
  coquille du site mairie. Recoupée par calendrier (31 août 2026 = lundi, cohérent avec
  la rentrée STAR) et publiée avec la date corrigée + la coquille source mentionnée
  explicitement — jamais corriger en silence, jamais publier tel quel.
- **Une fiche `cms.json` déjà détaillée peut quand même rater le passage le plus
  politique du PV** : la fiche `CM-2026-05-18` couvrait 36 délibérations mais pas le
  débat opposition/majorité sur la suppression du poste direction culture/vie
  associative/sport (délib. 26-05-37) — le point le plus tendu de la séance. Une
  proposition Mégalis vers un PV « déjà couvert » mérite quand même une lecture
  intégrale avant rejet.

### 2026-08-27 — coup_de_pouce_pending.json ne se vidait jamais après publication
→ dispatch: local:bruz-en-action

CP08 (Marche Nordique JAB) et CP09 (Atelier Philo ALB) avaient été validés et recopiés
dans `data/coup_de_pouce.json` le 14/08 (`statut: "publié"`, `cp_id` posés à la main),
mais jamais retirés de `coup_de_pouce_pending.json` — contrairement à `pending.json`
(actus), ce registre n'a aucun mécanisme de sortie. Résultat : `--list` les
re-proposait à chaque fois, et le nouveau branchement du mailer (voir ci-dessous)
les aurait envoyés indéfiniment. Fix : `agent_coup_de_pouce.candidats_en_attente()`
filtre les items dont `statut` vaut `"publié"`/`"rejeté"` — utilisé par `--list` et
par le mailer, sans supprimer les items du fichier (`deja_connus()` a besoin de
la mémoire complète pour éviter une re-proposition du même titre).

➡️ Un registre "pending" sans mécanisme de sortie explicite finit toujours par
re-proposer indéfiniment ce qui a déjà été traité manuellement ailleurs.

### 2026-09-01 — agent_bruz_mag : titre capté depuis le texte du lien
→ dispatch: local:bruz-en-action

Le lien de téléchargement sur ville-bruz.fr a pour texte « Télécharger(ouverture dans un
nouvel onglet) » : capté tel quel comme `titre` de bulletin (affiché sur `/publications`)
**et** comme `sources[].label`, à chaque numéro depuis le lancement, corrigé à la main
à chaque fois. Fix : `titre_et_date()` reconstruit titre + date ISO depuis le **nom de
fichier du PDF** (`Semaine-a-Bruz-n°859-du-27-aout-au-2-septembre-2026.pdf`). Repli sur
« Semaine à Bruz n°XXX » si le schéma de nommage change. ➡️ Quand le texte visible d'un
lien est générique, l'info utile est dans l'URL / le nom de fichier.

### 2026-09-01 — agent_select sous-cote la pertinence (juge sur le RSS, pas l'article)
→ dispatch: local:bruz-en-action

`agent_select` (Claude Haiku) note la pertinence sur le **titre + résumé RSS**, pas
l'article complet. Le renommage de la place du Vert-Buisson (décision CM + opposition +
collectif médical sur la sécurité des soins) a été noté **p1 « marginal »** alors que
c'était le sujet du jour (p3, publié en D23). Décision : pas de fix agent (sur-ajustement
sur un cas), la revue humaine reste le filet. ➡️ Toujours **lire l'article complet** (via
l'extension Chrome pour Ouest-France qui bloque les bots) avant de trancher — le résumé
de l'agent ne suffit pas. Liens Google News RSS : résolus vers l'URL réelle via
`batchexecute` (cf. `learnings.md`), le mur `consent.google.com` bloque `requests`.

### 2026-09-01 — la veille a été bloquée 6 jours par un agent figé sur un prompt navigateur
→ dispatch: local:bruz-en-action

`agent_signalements` (livré le 26/08) testait `client_secret` pour son garde-fou de
setup. Or ce fichier existe déjà (client OAuth réutilisé du mailer), donc au premier run
launchd du 26/08 l'agent est passé le garde-fou et est tombé sur
`flow.run_local_server()` — qui attend un navigateur et **bloque indéfiniment sous
launchd**. Le process est resté vivant 6 jours ; `launchd`, voyant le job encore
`running`, a **sauté tous les créneaux 17h suivants** (27/08 → 01/09). Aucune alerte :
le job n'était pas « en échec », il était « en cours ».

Fixes : (1) garde-fou sur `GMAIL_TOKEN.exists()` (le consentement navigateur), pas sur
`client_secret` ; (2) watchdog `SIGALRM` par agent (300 s) dans `run_agents.py` ;
(3) backstop `perl alarm 1800` dans le plist (`scripts/launchd/`).

➡️ Un job launchd sans borne de durée peut mourir en silence : bloqué ≠ en échec, et un
`StartCalendarInterval` ne redéclenche jamais tant que l'instance précédente vit. Tout
run planifié doit avoir un timeout dur. Et jamais de `run_local_server()` / prompt
interactif dans du code appelé depuis launchd.

### 2026-09-05 — Un échec par valeur de retour (`None`) peut ne jamais être loggé
*(2026-09-14)* `agent_presse._resolve_gnews()` (bruz-en-action) retournait `None` sur échec
sans lever d'exception ; l'appelant ne loggait que dans son `except`. Résultat : zéro trace
d'échec dans tout l'historique du log malgré des échecs réels documentés. Le code
fonctionnait en test isolé — ce qui masquait le vrai bug, l'absence de trace.

➡️ Une fonction dont le chemin d'échec passe par une valeur de retour (`None`, `False`,
liste vide) doit logger **à la source**, pas compter sur un `except` qui ne couvre que les
exceptions. Ce trou d'observabilité ne se voit qu'en cherchant activement les traces
attendues et en constatant leur absence — jamais en relisant le code.

### 2026-09-05 — Piège Bonna Sabla — 2e occurrence de conflation, cette fois via un avis MRAe
→ dispatch: local:bruz-en-action

Recherche du 05/09 sur l'avenir du site Bonna Sabla (D22) : un résultat MRAe fait remonter
`avis_mrae_pabonnasabla-realestate_apo63.pdf` — le suffixe `apo63` correspond au département
63 (Puy-de-Dôme), un site Bonna Sabla homonyme sans rapport avec Bruz (35). Un second résultat
« ZAC Bruz » concernait en réalité D02 (Multisites), pas Bonna Sabla. S'ajoute au piège Archyde
déjà identifié le 2026-07-17 (chiffres 12 ha / 2,5-4 M€ / 12 M€ agrégés à tort avec d'autres
sites Bonna Sabla en France).

➡️ « Bonna Sabla » est un nom d'entreprise avec plusieurs sites en France : ne jamais exploiter
un résultat de recherche sur ce sujet sans qu'il nomme explicitement Bruz/35170 (ou le bon code
département/INSEE) dans le document lui-même, pas seulement dans le titre du résultat.

### 2026-09-05 — `dossiers.json` — le schéma de `decisions[]` est `{date, description, source_url}`, pas `{date, titre, detail}`
→ dispatch: local:bruz-en-action

En enrichissant D23 (renommage place Robert-Barré), j'ai ajouté une entrée `decisions` avec
les champs `titre`/`detail` par analogie avec `actus_recentes` — `validate_data.py` n'a rien
signalé (pas de contrôle de schéma strict par section), mais la carte "Décisions clés" du
site déployé est restée vide (seule la date s'affichait). Seule la vérification visuelle sur
le site déployé (règle "build vert ≠ UI correcte") l'a révélée. Corrigé en confrontant au
schéma réel d'un autre dossier (`description` + `source_url`, pas `titre`/`detail`).

➡️ Avant d'ajouter un champ structuré à un fichier `data/*.json` de ce projet, vérifier le
schéma exact sur un exemple existant du même champ dans un autre dossier plutôt que de
déduire par analogie avec un champ voisin — et toujours confirmer le rendu sur le site
déployé après un ajout de ce type, pas seulement `validate_data.py`.

### 2026-09-05 — dossiers.json : schéma de decisions[], et 2e conflation Bonna Sabla
→ dispatch: local:bruz-en-action

**`decisions[]` = `{date, description, source_url}`**, pas `{date, titre, detail}` (analogie
trompeuse avec `actus_recentes`). `validate_data.py` n'a rien signalé — la carte "Décisions
clés" est restée vide sur le site déployé (seule la date affichée) jusqu'à vérification
visuelle. Toujours confronter un nouveau champ structuré à un exemple existant du même champ
dans un autre dossier, et confirmer le rendu déployé après ajout.

**Bonna Sabla (D22) — 2e occurrence de conflation** (après le piège Archyde du 2026-07-17) :
un avis MRAe `avis_mrae_pabonnasabla-realestate_apo63.pdf` (suffixe `apo63` = Puy-de-Dôme, site
homonyme sans rapport) et un avis « ZAC Bruz » qui concerne en fait D02, pas Bonna Sabla, sont
remontés dans une recherche. ➡️ Ne jamais exploiter un résultat sur Bonna Sabla sans qu'il
nomme explicitement Bruz/35170 dans le document lui-même.

### 2026-09-06 — Un échec par valeur de retour (`None`) peut ne jamais être loggé
*(2026-09-14)* `agent_presse._resolve_gnews()` (bruz-en-action) retournait `None` sur échec
sans lever d'exception ; l'appelant ne loggait que dans son `except`. Résultat : zéro trace
d'échec dans tout l'historique du log malgré des échecs réels documentés. Le code
fonctionnait en test isolé — ce qui masquait le vrai bug, l'absence de trace.

➡️ Une fonction dont le chemin d'échec passe par une valeur de retour (`None`, `False`,
liste vide) doit logger **à la source**, pas compter sur un `except` qui ne couvre que les
exceptions. Ce trou d'observabilité ne se voit qu'en cherchant activement les traces
attendues et en constatant leur absence — jamais en relisant le code.
### 2026-09-08 — une recette de contournement se périme sans prévenir (Google News, tags agenda, palette)
→ dispatch: local:bruz-en-action

**Résolution des liens Google News RSS.** Le format `rss/articles/CBMi…` est un protobuf
opaque : seule Google peut le déplier, via `batchexecute` (jetons `data-n-a-sg` /
`data-n-a-ts` lus dans le HTML de la page, rejoués en POST). La recette notée le 01/09
utilisait le cookie `CONSENT=YES+…` — **il ne franchit plus le mur de consentement**
(on retombe sur `consent.google.com`, la page ne porte alors aucun jeton et la résolution
échoue en silence). Le cookie qui marche au 08/09 est **`SOCS`**. Intégré dans
`agent_presse._resolve_url()`, qui conserve le lien brut en cas d'échec plutôt que de
perdre la source (cf. `presse-f2c23dbc`, jamais retrouvé). ⚠️ Google throttle vite : après
quelques requêtes, GET comme POST tombent en `ReadTimeout` — ce n'est pas un bug de code,
c'est le débit. Ne pas « corriger » un timeout en refaisant la logique.

**Le bac de secours absorbe, il ne prévient pas.** `THEMES_AGENDA` (`app/utils.ts`) range
les tags mairie inconnus dans « Autres rendez-vous » : le 08/09, **7 tags n'étaient mappés
nulle part et 25 événements y étaient tombés** sans que rien ne le signale — le BACKLOG
affirmait encore « les 15 tags actuels sont tous mappés ». Même famille dans
`lib/categories.ts` : la catégorie `Institutions` n'y figurait pas, donc **D23 tombait sur
le gris de repli depuis sa création**. ➡️ Un repli silencieux exige un **inventaire
périodique** (tags présents dans les données vs tags mappés dans le code), jamais l'attente
d'un signal — par construction, il n'en émettra aucun.

### 2026-09-13 — Un échec par valeur de retour (`None`) peut ne jamais être loggé
*(2026-09-14)* `agent_presse._resolve_gnews()` (bruz-en-action) retournait `None` sur échec
sans lever d'exception ; l'appelant ne loggait que dans son `except`. Résultat : zéro trace
d'échec dans tout l'historique du log malgré des échecs réels documentés. Le code
fonctionnait en test isolé — ce qui masquait le vrai bug, l'absence de trace.

➡️ Une fonction dont le chemin d'échec passe par une valeur de retour (`None`, `False`,
liste vide) doit logger **à la source**, pas compter sur un `except` qui ne couvre que les
exceptions. Ce trou d'observabilité ne se voit qu'en cherchant activement les traces
attendues et en constatant leur absence — jamais en relisant le code.
### 2026-09-14 — 1. `agent_bruz_mag` — l'heuristique par lignes en majuscules ne survit pas à une mise en page en colonnes
→ dispatch: local:bruz-en-action

`points_cles` était extrait des PDF (Bruz Mag / Semaine à Bruz) en repérant les lignes
tout en majuscules — cassé structurellement par la mise en page en colonnes (fragments
type « Découverte De Bruz 07 50 84 53 14 »), corrigé à la main à chaque numéro depuis le
lancement. Remplacé par un résumé via le CLI `claude` (même pattern que `agent_select` /
`agent_enrichissement_cm`, cf. piège 6c déjà connu de ce projet). Testé en direct sur le
n°860 : 8 points clés propres et pertinents. Repli en liste vide + WARN si le CLI échoue,
plutôt que publier des fragments qui donnent un faux sentiment de complétude.

### 2026-09-14 — agent_bruz_mag : l'heuristique par majuscules ne survit pas aux colonnes du PDF
→ dispatch: local:bruz-en-action

`points_cles` était extrait en repérant les lignes tout en majuscules — cassé par la mise
en page en colonnes (fragments type « Découverte De Bruz 07 50 84 53 14 »), corrigé à la
main à chaque numéro. Remplacé par un résumé via le CLI `claude` (même pattern que
`agent_select`/`agent_enrichissement_cm`). Testé sur le n°860 : 8 points propres. Repli en
liste vide + WARN si le CLI échoue, plutôt que des fragments illisibles.

### 2026-09-14 — agent_presse : un échec par `None` ne loggait jamais rien
→ dispatch: local:bruz-en-action

`_resolve_gnews()` retournait `None` sur échec (mur de consentement, jetons absents, pas de
`garturlres`) sans lever d'exception. L'appelant (`_resolve_url`) ne loggait que dans son
`except` — zéro trace d'échec dans tout l'historique du log malgré des échecs réels
(`presse-d9faf61e`, `presse-d09063fd`). La résolution elle-même fonctionne (revalidée en
direct le 14/09) : le vrai bug était l'absence de logging, pas la logique batchexecute.
Fix : WARN à chaque point de sortie en échec de `_resolve_gnews`.

### 2026-09-13 — Vérifier le site déployé avec les URL en `.html`
→ dispatch: local:bruz-en-action

`curl …/dossiers/D23/` (barre oblique finale) renvoie une page sans le contenu attendu ;
`…/dossiers/D23.html` le contient. Une vérification par grep sur la mauvaise forme conclut à
tort qu'une actu est absente. Les bulletins s'affichent sur `/publications.html`, pas sur
`/actualites.html`.

### 2026-09-13 — Une actu acceptée est publiée telle quelle, défauts compris
→ dispatch: local:bruz-en-action

`review_proposals.py --accept` recopie la proposition sans retouche (`actus.json`), puis
`agent_dossiers` la duplique (`dossiers.json`). Vu sur `presse-c7455728` : titre suffixé
« - ouest-france.fr », `source_label` = requête de veille (« CM Bruz ») au lieu de l'éditeur,
résumé extrapolé (« révèle les tensions… »).
➡️ Relire titre/source/`detail` avant le build ; corriger dans **les deux** fichiers.

### 2026-09-13 — Vérifier le déployé avec les URL en `.html`
→ dispatch: local:bruz-en-action

`curl …/dossiers/D23/` ne contient pas le contenu attendu, `…/dossiers/D23.html` oui — un grep
sur la mauvaise forme conclut à tort à une absence. Bulletins : `/publications.html`.