#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Orchestrateur des agents de veille — Bruz en Action.
Lance tous les agents séquentiellement, commit + push si des données ont changé.

Usage : python3 scripts/run_agents.py
Cron  : launchd @ 17h — voir ~/Library/LaunchAgents/com.bruz-en-action.veille.plist
"""

import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from utils import ROOT, log, git_commit_push

AGENTS = [
    ("Enrichissement CMs", "agents.agent_enrichissement_cm"),  # avant les autres
    ("Mégalis",            "agents.agent_megalis"),
    ("Mairie",             "agents.agent_mairie"),
    ("Bruz Mag",           "agents.agent_bruz_mag"),
    ("Presse",             "agents.agent_presse"),
    ("Dossiers",           "agents.agent_dossiers"),  # toujours en dernier
]


def main() -> None:
    start = datetime.now()
    log(f"=== Veille Bruz en Action — {start.strftime('%Y-%m-%d %H:%M')} ===")

    any_updated = False

    for name, module_path in AGENTS:
        log(f"\n── Agent {name} ──────────────────────────")
        try:
            import importlib
            mod = importlib.import_module(module_path)
            updated = mod.run()
            if updated:
                any_updated = True
                log(f"Agent {name} : données mises à jour.", "OK")
            else:
                log(f"Agent {name} : rien de nouveau.")
        except Exception as e:
            log(f"Agent {name} a planté : {e}", "ERR")
            import traceback
            traceback.print_exc()
        time.sleep(1)  # politesse entre agents

    log("\n── Bilan ──────────────────────────────────")
    if any_updated:
        message = f"chore(veille): mise à jour automatique {start.strftime('%Y-%m-%d')}"
        pushed = git_commit_push(message)
        if pushed:
            log("Push réussi → GitHub Pages va se rebuilder.", "OK")
            # QA post-deploy : attend 90s que GitHub Pages rebuild, puis vérifie
            log("\n── Agent QA ────────────────────────────────")
            try:
                import importlib
                qa = importlib.import_module("agents.agent_qa")
                qa.run(wait_seconds=90)
            except Exception as e:
                log(f"Agent QA a planté : {e}", "ERR")
        else:
            log("Commit/push échoué — vérifier les logs git.", "ERR")
    else:
        log("Aucune donnée nouvelle — pas de commit.")

    elapsed = (datetime.now() - start).seconds
    log(f"Terminé en {elapsed}s.")


if __name__ == "__main__":
    main()
