#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Select — Tri et enrichissement éditorial via Claude CLI.

Lit actus_queue.json, envoie les items à Claude (Haiku, batch unique),
récupère pour chaque item :
  - resume      : 2 phrases en français
  - dossier     : D01-D13 ou "à_classer"
  - pertinence  : 0-3 (0 = hors sujet, 3 = très pertinent)

Écrit le résultat dans scripts/proposals/YYYY-MM-DD.json.
Supprime de la queue les items traités (quel que soit leur score).
Items avec pertinence 0 apparaissent dans les proposals avec flag "ignore".
"""

import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, QUEUE_FILE, PROPOSALS_DIR, load_json, log, save_json, today

AGENT_NAME = "select"
CLAUDE_CLI = "claude"
MODEL = "claude-haiku-4-5-20251001"

DOSSIERS_DESC = """
D01 = T4 / trambus / transport en commun / Ker Lann / gare Bruz
D02 = ZAC Multisites / logement / urbanisme / aménagement
D03 = budget municipal / finances / conseil municipal
D04 = fiscalité / taxe foncière / impôts locaux
D05 = équipements publics / carte / quartiers
D06 = piscine / La Conterie / équipement aquatique
D07 = police municipale / sécurité / vidéoprotection
D08 = sports / city stade / gymnase / équipements sportifs
D09 = vie associative / associations / culture
D10 = écoles / enseignement / Vert-Buisson
D11 = environnement / espaces verts / biodiversité
D12 = CoSEC / salle de spectacle / équipement culturel
D13 = canicule / plan municipal / îlots de fraîcheur / climat
""".strip()

PROMPT_TEMPLATE = """\
Tu es l'assistant éditorial de "Bruz en Action", association citoyenne qui suit les engagements de la majorité municipale de Bruz (35), mandat 2026-2032.

Analyse les articles ci-dessous et, pour chacun, retourne un objet JSON avec ces champs :
- "id"         : reprendre l'id de l'article
- "titre"      : reprendre le titre tel quel
- "resume"     : 2 phrases en français, factuel, sourcé, ton citoyen (pas militant)
- "dossier"    : le code dossier concerné parmi {dossiers_desc} — ou "à_classer" si tu hésites
- "pertinence" : entier 0-3 (0=hors sujet Bruz/mandat, 1=marginal, 2=pertinent, 3=essentiel)
- "source_url" : reprendre source_url tel quel
- "date"       : reprendre date tel quel

Retourne UNIQUEMENT un tableau JSON valide — aucun texte avant ou après.

Articles à analyser :
{items_json}
"""


def _call_claude(prompt: str) -> str | None:
    try:
        result = subprocess.run(
            [CLAUDE_CLI, "--print", "--model", MODEL, prompt],
            capture_output=True, text=True, timeout=120,
        )
        if result.returncode != 0:
            log(f"Claude CLI erreur : {result.stderr[:300]}", "ERR")
            return None
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        log("Claude CLI timeout (120s)", "ERR")
        return None
    except FileNotFoundError:
        log("claude CLI introuvable — vérifier PATH", "ERR")
        return None


def run() -> bool:
    queue = load_json(QUEUE_FILE)
    items = queue.get("items", [])

    if not items:
        log("Select : queue vide — rien à traiter.", "INFO")
        return False

    log(f"Select : {len(items)} item(s) à analyser via Claude…")

    # Préparer le prompt avec les items (on ne passe que les champs utiles)
    items_light = [
        {"id": i.get("id"), "titre": i.get("titre"), "detail": i.get("detail", ""),
         "source_url": i.get("source_url"), "date": i.get("date"), "type": i.get("type")}
        for i in items
    ]
    prompt = PROMPT_TEMPLATE.format(
        dossiers_desc=DOSSIERS_DESC,
        items_json=json.dumps(items_light, ensure_ascii=False, indent=2),
    )

    raw = _call_claude(prompt)
    if not raw:
        log("Select : échec Claude CLI — queue conservée pour le prochain run.", "WARN")
        return False

    # Parser le JSON retourné
    try:
        # Extraire le JSON si Claude a ajouté du texte malgré la consigne
        start = raw.find("[")
        end = raw.rfind("]") + 1
        proposals = json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError) as e:
        log(f"Select : JSON invalide ({e}) — queue conservée.", "ERR")
        return False

    # Écrire proposals/YYYY-MM-DD.json
    PROPOSALS_DIR.mkdir(parents=True, exist_ok=True)
    proposal_file = PROPOSALS_DIR / f"{today()}.json"

    # Si un fichier du jour existe déjà, fusionner
    existing_proposals = []
    if proposal_file.exists():
        try:
            existing_proposals = json.loads(proposal_file.read_text(encoding="utf-8"))
        except Exception:
            pass

    all_proposals = existing_proposals + proposals
    proposal_file.write_text(
        json.dumps(all_proposals, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Vider la queue (items traités, quelle que soit la pertinence)
    QUEUE_FILE.write_text(
        json.dumps({"items": [], "meta": {"last_updated": today()}},
                   ensure_ascii=False, indent=2), encoding="utf-8"
    )

    n_pertinent = sum(1 for p in proposals if p.get("pertinence", 0) >= 1)
    log(f"Select : {len(proposals)} analysés, {n_pertinent} pertinents → {proposal_file.name}", "OK")
    return n_pertinent > 0


if __name__ == "__main__":
    run()
