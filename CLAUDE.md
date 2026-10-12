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
sans date ne sont plus perdus. `--dry-run` pour tester sans envoyer. Depuis le 27/08,
le mail inclut aussi les candidats coup de pouce en attente
(`agent_coup_de_pouce.candidats_en_attente()` — section dédiée, sans `mailed_at` : un
candidat reste listé tant qu'il n'a pas de `statut` "publié"/"rejeté" posé à la main
après recopie dans `data/coup_de_pouce.json`) : avant, il fallait penser à taper
`--list` manuellement, ce qui les faisait passer inaperçus.

**IDs** : `utils.stable_id(prefix, url)` (md5) — jamais `hash()` (randomisé par processus).

**Coup de pouce — expiration (`data/coup_de_pouce.json`)** : un item expose 3 mois par
défaut à compter de `dernier_signal` (`app/coup-de-pouce/page.tsx`, `EXPOSITION_JOURS`),
ou jusqu'à `date_fin` si l'échéance est explicite (événement daté — `date_fin` prime
toujours). Passé le délai, l'item ne disparaît pas : il bascule dans la section archive
repliable en bas de page, toujours consultable. Quand un item déjà publié est reconfirmé
par un nouveau signal (bulletin, presse), mettre à jour `dernier_signal` (pas
`date_ajout`, qui reste la date de première découverte affichée sur la fiche) pour
repousser l'échéance de 3 mois.

Agents : `agent_mairie` · `agent_ouestfrance` (Playwright + cookies Chrome ; lève si
dépendance manquante ; alimente aussi `coup_de_pouce_pending.json` via
`agent_coup_de_pouce.depuis_presse()` sur ses articles déjà filtrés — pas de second
scraper OF) · `agent_presse` (Google News RSS) · `agent_megalis` (YouTube RSS)
· `agent_bruz_mag` (PDF) · `agent_signalements` (Gmail — voir sous-section dédiée) ·
`agent_enrichissement_cm` (transcription + Claude) ·
`agent_metropole_delibs` (API open data `data.rennesmetropole.fr`, dataset
`deliberations-rennes-metropole-2021-copie` → queue de veille ; ⚠️ ODSQL : full-text nu
parenthésé + filtre de champ = 0 résultat silencieux, utiliser `delib_objet like "…"` +
date littérale ; les CR du conseil métropolitain ne sont PAS cherchables sur Mégalis) ·
`agent_agenda` (scraping agenda mairie → `evenements.json` **en direct, sans revue** —
événements marqués `source: agenda_mairie`, les saisies manuelles ne sont jamais touchées,
purge auto des événements passés de +30 j) · `agent_dossiers` (hors cron, post-revue).

Lancement : `python3 scripts/run_agents.py` (launchd tous les jours 17h).
Logs : `~/Library/Logs/bruz-en-action-veille.log`.
Environnement d'exécution : venv dédié `~/.venvs/bruz-en-action/` (voir piège 2026-07-01 ci-dessous — ne pas repointer le plist sur un python homebrew direct ou un venv sous `~/Documents`).

**Jobs launchd versionnés dans `scripts/launchd/`** (templates + `install.sh`) — c'est la
source de vérité, plus `~/Library/LaunchAgents/` seul. `bash scripts/launchd/install.sh`
régénère et recharge les 2 jobs (veille 17h, linkcheck lundi 8h). Le run est wrappé
`perl alarm 1800` (backstop 30 min) + watchdog SIGALRM par agent (300 s) dans
`run_agents.py` — cf. piège du blocage 6 jours (26/08 → 01/09).

### Validation données — `scripts/validate_data.py`

Garde-fou avant commit et en CI (step avant `npm run build` dans `deploy.yml`) :
dates ISO ou null, IDs uniques, statuts promesses dans le référentiel, URLs http(s),
pas de `undefined`/`[object Object]` sérialisés. **À lancer avant tout commit de `data/`.**

### QA — link-checker (`scripts/agents/agent_qa.py`)

Vérifie les pages du site déployé (contenu attendu, absence de `undefined`/`[object Object]`) et, avec `--links`/`--links-only`, l'accessibilité de toutes les URLs `source_url`/`url`/`lien` trouvées dans `data/*.json`. Distingue "cassé confirmé" (404/DNS/timeout) d'"anti-bot probable" (403/429 — Ouest-France, HelloAsso, ac-rennes.fr, ARS Bretagne bloquent systématiquement même avec un User-Agent navigateur).

Automatisé en launchd : `com.bruz-en-action.linkcheck`, tous les lundis 8h, même venv dédié que la veille. Logs : `~/Library/Logs/bruz-en-action-linkcheck.log`.

Convention pour les liens confirmés morts sans alternative trouvée : ajouter `<clé>_expiree: true` à côté du champ URL plutôt que de supprimer la source (le link-checker les ignore ensuite).

### Signalements citoyens — `scripts/agents/agent_signalements.py`

Transforme les emails `[SIGNALEMENT]` reçus sur l'adresse de contact de
l'association (`meta.json > contact.email` — `sylv.bertrand@gmail.com`, **le
même compte que `agent_mailer`**, cf. piège 2026-08-26 ci-dessous) en tickets
dans `scripts/proposals/signalements.json` (gitignoré). Recherche par sujet
(`subject:"[SIGNALEMENT]"`) — aucun filtre/label Gmail à configurer. Dédoublonnage
par `message_id` directement dans le registre de tickets ; la boîte Gmail n'est
jamais modifiée (scope `gmail.readonly` seul).

Extraction du template best-effort (TYPE/RÉFÉRENCE/MESSAGE/SOURCE/EMAIL DE CONTACT) :
si aucun en-tête n'est reconnu (réponse en texte libre, client mail qui reformate),
le ticket garde `parsed: false` et le corps brut intégral plutôt que de perdre le
signalement.

- `--list` : tickets au statut `nouveau`
- `--close id1,id2` : marque des tickets `traité` après action (correction du site
  faite à la main, ou signalement classé sans suite)

**Setup requis avant premier run (une fois)** : même compte que le mailer →
réutilise son client OAuth (`~/.bruz-mailer-gmail/client_secret.json`, repli sur
`~/.bruz-signalements-gmail/client_secret.json` si absent) — pas de nouveau
projet Google Cloud à créer. Seul le token diffère (`~/.bruz-signalements-gmail/token.json`,
scope `gmail.readonly` propre à cet agent). Lancer **`python3 scripts/agents/agent_signalements.py --setup`**
une fois à la main pour le consentement navigateur (`--setup` est la seule voie
qui crée le token — un `run` nu se saute tant que le token n'existe pas, pour ne
jamais déclencher `flow.run_local_server()` sous launchd, cf. incident 6 j du 26/08).

---

## Règles métier

- **IDs dossiers** : `D01`, `D02`, … format fixe — ne jamais renuméroter
- **Promesses** : 50 au total — statuts : `non_commence` · `en_cours` · `tenu` · `partiel` · `abandonne` · `inconnu`
- **Élus opposition** : inclus dans `elus.json` — rôle neutre/factuel
- **Ton éditorial** : factuel, sourcé, constructif — pas de militantisme partisan
- **Segments ML** : sans objet ici (projet citoyen, pas ProPME)

---

## Pièges connus
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
