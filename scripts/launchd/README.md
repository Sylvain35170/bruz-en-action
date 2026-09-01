# Jobs launchd — Bruz en Action

Planification macOS de la veille. **Source de vérité versionnée** — avant, les
`.plist` ne vivaient que dans `~/Library/LaunchAgents/`, hors dépôt : aucune trace
des modifs dans le git log, rien à réinstaller sur une nouvelle machine.

| Job | Quand | Commande | Log |
|-----|-------|----------|-----|
| `com.bruz-en-action.veille` | tous les jours 17h00 | `run_agents.py` (wrappé `perl alarm 1800`) | `~/Library/Logs/bruz-en-action-veille.log` |
| `com.bruz-en-action.linkcheck` | lundi 8h00 | `agent_qa.py --links-only` | `~/Library/Logs/bruz-en-action-linkcheck.log` |

## Installation / mise à jour

```bash
bash scripts/launchd/install.sh
```

Idempotent : régénère les `.plist` depuis les templates (substitution des chemins
`__VENV_PYTHON__` / `__REPO__` / `__HOME__`), les lint, et recharge les jobs
(`launchctl bootout` + `bootstrap`). **À relancer après toute modif d'un template.**

Prérequis : le venv dédié `~/.venvs/bruz-en-action/` doit exister.

## Désinstallation

```bash
bash scripts/launchd/uninstall.sh
```

## Le backstop `perl alarm 1800`

Le wrapper `perl -e 'alarm shift; exec @ARGV' 1800 …` tue le run s'il dépasse
30 min. Sans lui, un agent figé (le 26/08 : `agent_signalements` bloqué sur
`flow.run_local_server()` en attente d'un navigateur) laisse le process vivant
indéfiniment → `launchd` voit le job « running » et **saute tous les créneaux
suivants**. C'est resté 6 jours sans veille. Défense complémentaire : watchdog
`SIGALRM` par agent (300 s) dans `run_agents.py`.

## Inspection

```bash
launchctl print gui/$(id -u)/com.bruz-en-action.veille        # état, prochain tir
launchctl kickstart -k gui/$(id -u)/com.bruz-en-action.veille # forcer un run maintenant
```
