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

- **Leaflet + Next.js export statique** : import dynamique obligatoire (`dynamic(() => import(...), { ssr: false })`). CSS Leaflet chargé via `globals.css`.
- **basePath** : tout lien `<Link href="...">` doit être relatif ou utiliser le basePath — pas de `/bruz-en-action/...` en dur dans le code (Next.js l'ajoute).
- **Images** : `unoptimized: true` dans `next.config.ts` — pas d'optimisation Next Image.
- **Export statique** : pas d'API routes, pas de middleware, pas de `getServerSideProps`.

---

## Déploiement

```bash
npm run build        # génère out/
# puis git push → GitHub Actions deploy ou push manuel de out/
```

Le dossier `out/` est le livrable déployé sur GitHub Pages.

---

## Backlog

`~/Documents/Dev/bruz-en-action/BACKLOG.md`
