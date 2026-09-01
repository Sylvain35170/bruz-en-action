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
scope `gmail.readonly` propre à cet agent). Lancer
`python3 scripts/agents/agent_signalements.py` une fois à la main pour le
consentement navigateur. Tant qu'aucun client_secret n'est trouvé, l'agent se
signale en `INFO` (pas `ERR`) pour ne pas faire passer le run quotidien en
échec pour une étape de configuration non faite.

---

## Règles métier

- **IDs dossiers** : `D01`, `D02`, … format fixe — ne jamais renuméroter
- **Promesses** : 50 au total — statuts : `non_commence` · `en_cours` · `tenu` · `partiel` · `abandonne` · `inconnu`
- **Élus opposition** : inclus dans `elus.json` — rôle neutre/factuel
- **Ton éditorial** : factuel, sourcé, constructif — pas de militantisme partisan
- **Segments ML** : sans objet ici (projet citoyen, pas ProPME)

---

## Pièges connus
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
