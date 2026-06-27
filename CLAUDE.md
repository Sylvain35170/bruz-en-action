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

5 agents Python + orchestrateur :
- `agent_mairie.py` — actus site ville-bruz.fr
- `agent_presse.py` — Google News presse locale (mots-clés → dossiers)
- `agent_bruz_mag.py` — Bruz Mag (PDF/RSS)
- `agent_megalis.py` — délibérations Mégalis
- `agent_dossiers.py` — enrichissement `dossiers.json` actus_recentes

Lancement : `python3 scripts/run_agents.py` (launchd 17h en semaine).
Logs : `scripts/veille.log`.

---

## Règles métier

- **IDs dossiers** : `D01`, `D02`, … format fixe — ne jamais renuméroter
- **Promesses** : 50 au total — statuts : `tenue` · `en_cours` · `non_tenue` · `inconnue`
- **Élus opposition** : inclus dans `elus.json` — rôle neutre/factuel
- **Ton éditorial** : factuel, sourcé, constructif — pas de militantisme partisan
- **Segments ML** : sans objet ici (projet citoyen, pas ProPME)

---

## Pièges connus
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
