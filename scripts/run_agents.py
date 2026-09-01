#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Orchestrateur des agents de veille — Bruz en Action.
Lance tous les agents séquentiellement, commit + push si des données ont changé.

Usage : python3 scripts/run_agents.py
Cron  : launchd @ 17h — voir ~/Library/LaunchAgents/com.bruz-en-action.veille.plist
"""

import json
import signal
import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from utils import ROOT, errors_logged, git_commit_push, log, reset_errors

# Garde-fou anti-blocage : aucun agent ne doit pouvoir figer tout le run.
# Le 26/08, agent_signalements est tombé sur flow.run_local_server() (attente
# navigateur) et a bloqué le process 6 jours — launchd voyant le job « running »
# a sauté tous les runs suivants. SIGALRM interrompt l'agent fautif (serveur
# wsgiref, socket, subprocess Claude CLI…) et le run continue avec les autres.
# 300s laisse largement la marge aux agents lents (Claude CLI, Playwright).
AGENT_TIMEOUT_S = 300


class AgentTimeout(Exception):
    """Levée quand un agent dépasse AGENT_TIMEOUT_S."""


def _raise_timeout(signum, frame):
    raise AgentTimeout(f"pas de retour après {AGENT_TIMEOUT_S}s — agent interrompu")

RUN_DIR  = Path.home() / ".shared-context" / "agent_runs"
LOG_FILE = Path(__file__).parent / "veille.log"


def _write_run_status(start: datetime, agent_steps: dict, any_updated: bool) -> None:
    """Écrit ~/.shared-context/agent_runs/bruz_veille.json après chaque run."""
    RUN_DIR.mkdir(parents=True, exist_ok=True)
    has_error = any("❌" in str(v) for v in agent_steps.values())
    data = {
        "agent":      "bruz_veille",
        "run_at":     start.strftime("%Y-%m-%d %H:%M"),
        "status":     "error" if has_error else "ok",
        "duration_s": (datetime.now() - start).seconds,
        "updated":    any_updated,
        "steps":      agent_steps,
        "log":        str(LOG_FILE),
    }
    (RUN_DIR / "bruz_veille.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )


AGENTS = [
    # ── Collecte ──────────────────────────────────────────────────────────
    ("Enrichissement CMs", "agents.agent_enrichissement_cm"),  # Claude CLI → cms.json
    ("Mégalis",            "agents.agent_megalis"),            # XML open data → cms.json
    ("Bruz Mag",           "agents.agent_bruz_mag"),           # PDF/RSS → cms.json
    ("Mairie",             "agents.agent_mairie"),             # scraping → actus_queue.json
    ("Agenda",             "agents.agent_agenda"),             # scraping → evenements.json (direct, sans revue)
    ("Métropole",          "agents.agent_metropole_delibs"),   # API open data RM → actus_queue.json
    ("Ouest-France",       "agents.agent_ouestfrance"),        # scraping OF direct → actus_queue.json
    ("Presse",             "agents.agent_presse"),             # RSS Google News → actus_queue.json
    ("Coup de pouce",      "agents.agent_coup_de_pouce"),      # bulletins PDF → proposals/coup_de_pouce_pending.json
    ("Signalements",       "agents.agent_signalements"),       # Gmail bruzenaction@ → proposals/signalements.json
    # ── Sélection éditoriale (Claude CLI) ────────────────────────────────
    ("Sélection",          "agents.agent_select"),             # → proposals/YYYY-MM-DD.json
    ("Mailer",             "agents.agent_mailer"),             # → email directeurs éditoriaux
    # Pas de push automatique — le push se fait après revue humaine dans Claude Code
]


def main() -> None:
    start = datetime.now()
    log(f"=== Veille Bruz en Action — {start.strftime('%Y-%m-%d %H:%M')} ===")

    any_updated  = False
    agent_steps: dict = {}

    for name, module_path in AGENTS:
        log(f"\n── Agent {name} ──────────────────────────")
        reset_errors()
        signal.signal(signal.SIGALRM, _raise_timeout)
        signal.alarm(AGENT_TIMEOUT_S)
        try:
            import importlib
            mod = importlib.import_module(module_path)
            updated = mod.run()
            errs = errors_logged()
            if errs:
                # L'agent a échoué sans lever : ne surtout pas le compter en succès.
                agent_steps[name] = f"❌ {errs[0]}"
                log(f"Agent {name} : EN ERREUR — {errs[0]}", "ERR")
            elif updated:
                any_updated = True
                agent_steps[name] = "✅ mis à jour"
                log(f"Agent {name} : données mises à jour.", "OK")
            else:
                agent_steps[name] = "✅ rien de nouveau"
                log(f"Agent {name} : rien de nouveau.")
        except AgentTimeout as e:
            agent_steps[name] = f"❌ {e}"
            log(f"Agent {name} : TIMEOUT — {e}", "ERR")
        except Exception as e:
            agent_steps[name] = f"❌ {e}"
            log(f"Agent {name} a planté : {e}", "ERR")
            import traceback
            traceback.print_exc()
        finally:
            signal.alarm(0)  # désarme le watchdog quoi qu'il arrive
        time.sleep(1)  # politesse entre agents

    log("\n── Bilan ──────────────────────────────────")
    en_erreur = [n for n, s in agent_steps.items() if s.startswith("❌")]
    if en_erreur:
        log(f"{len(en_erreur)} agent(s) en erreur : {', '.join(en_erreur)}", "ERR")

    if any_updated:
        log("Données collectées.", "OK")
        log("En attente de revue humaine → push après validation dans Claude Code.")
        agent_steps["push"] = "⏳ en attente revue"
    else:
        log("Aucune donnée nouvelle — rien à faire.")

    # Le bilan ne doit jamais affirmer un envoi qui n'a pas eu lieu.
    if "Mailer" in en_erreur:
        log("Notification NON envoyée — les propositions restent dans le registre.", "ERR")
    elif agent_steps.get("Mailer") == "✅ mis à jour":
        log("Notification envoyée.", "OK")

    elapsed = (datetime.now() - start).seconds
    log(f"Terminé en {elapsed}s.")
    _write_run_status(start, agent_steps, any_updated)


if __name__ == "__main__":
    main()
