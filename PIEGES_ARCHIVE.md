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
