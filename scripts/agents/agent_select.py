#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Select — Tri et enrichissement éditorial via SDK Anthropic.

Lit actus_queue.json, envoie les items à Claude (Haiku, par batches),
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
D09 = vie associative / associations / culture
D10 = écoles / enseignement / Vert-Buisson
D11 = Manoir de la Noë / Plan B / patrimoine / tiers-lieu citoyen
D12 = city stade / Siméon Beliard / gymnase / équipements sportifs
D13 = canicule / plan municipal / îlots de fraîcheur / climat
""".strip()

PROMPT_TEMPLATE = """\
Tu es l'assistant éditorial de "Bruz en Action", association citoyenne qui suit les engagements de la majorité municipale de Bruz (35), mandat 2026-2032.

Analyse les articles ci-dessous et, pour chacun, retourne un objet JSON avec ces champs :
- "id"         : reprendre l'id de l'article
- "titre"      : reprendre le titre tel quel
- "resume"     : 2 phrases en français, factuel, sourcé, ton citoyen (pas militant) — accord adjectival correct (ex: "écoles bruzaises", "équipements bruzois") ; pour désigner les habitants, écrire "les Bruzois et les Bruzoises" ou "les habitants de Bruz"
- "pourquoi"   : 1 phrase courte expliquant pourquoi cet article est pertinent pour suivre le mandat (ou "hors scope" si pertinence 0)
- "dossier"    : le code dossier concerné parmi {dossiers_desc} — ou "à_classer" si tu hésites
- "pertinence" : entier 0-3 (0=hors sujet Bruz/mandat, 1=marginal, 2=pertinent, 3=essentiel)
- "source_url" : reprendre source_url tel quel
- "date"       : reprendre date tel quel

Retourne UNIQUEMENT un tableau JSON valide — aucun texte avant ou après.

Articles à analyser :
{items_json}
"""


BATCH_SIZE = 5
TIMEOUT_S  = 75


def _call_claude(prompt: str) -> str | None:
    import os
    env = {**os.environ, "BRUZ_AGENT": "1"}
    try:
        result = subprocess.run(
            [CLAUDE_CLI, "--print", "--model", MODEL, prompt],
            capture_output=True, text=True, timeout=TIMEOUT_S, env=env,
        )
        if result.returncode != 0:
            log(f"Claude CLI erreur : {result.stderr[:300]}", "ERR")
            return None
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        log(f"Claude CLI timeout ({TIMEOUT_S}s)", "ERR")
        return None
    except FileNotFoundError:
        log("claude CLI introuvable — vérifier PATH", "ERR")
        return None


def _parse_proposals(raw: str) -> list[dict] | None:
    try:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError) as e:
        log(f"Select : JSON invalide ({e})", "ERR")
        return None


def run() -> bool:
    queue = load_json(QUEUE_FILE)
    items = queue.get("items", [])

    if not items:
        log("Select : queue vide — rien à traiter.", "INFO")
        return False

    log(f"Select : {len(items)} item(s) à analyser via Claude (batches de {BATCH_SIZE})…")

    items_light = [
        {"id": i.get("id"), "titre": i.get("titre"),
         "detail": (i.get("detail") or "")[:300],
         "source_url": i.get("source_url"), "source_label": i.get("source_label", ""),
         "date": i.get("date"), "type": i.get("type")}
        for i in items
    ]

    all_proposals: list[dict] = []
    failed_items: list[dict] = []

    for batch_start in range(0, len(items_light), BATCH_SIZE):
        batch = items_light[batch_start:batch_start + BATCH_SIZE]
        log(f"  Batch {batch_start + 1}–{batch_start + len(batch)} / {len(items_light)}…")
        prompt = PROMPT_TEMPLATE.format(
            dossiers_desc=DOSSIERS_DESC,
            items_json=json.dumps(batch, ensure_ascii=False, indent=2),
        )
        raw = _call_claude(prompt)
        if not raw:
            log(f"  Batch {batch_start + 1} échoué — items conservés en queue.", "WARN")
            failed_items.extend(items[batch_start:batch_start + BATCH_SIZE])
            continue
        parsed = _parse_proposals(raw)
        if parsed is None:
            log(f"  Batch {batch_start + 1} JSON invalide — items conservés.", "WARN")
            failed_items.extend(items[batch_start:batch_start + BATCH_SIZE])
            continue
        # Enrichir avec source_label (non retourné par Claude, copié depuis l'item original)
        source_by_id = {i.get("id"): i.get("source_label", "") for i in items_light[batch_start:batch_start + BATCH_SIZE]}
        for p in parsed:
            p["source_label"] = source_by_id.get(p.get("id"), "")
        all_proposals.extend(parsed)

    if not all_proposals and failed_items:
        log("Select : tous les batches ont échoué — queue inchangée.", "ERR")
        return False

    # Remettre les items échoués en queue
    QUEUE_FILE.write_text(
        json.dumps({"items": failed_items, "meta": {"last_updated": today()}},
                   ensure_ascii=False, indent=2), encoding="utf-8"
    )
    if failed_items:
        log(f"  {len(failed_items)} item(s) réinjectés en queue pour le prochain run.", "WARN")

    proposals = all_proposals

    # Écrire proposals/YYYY-MM-DD.json
    PROPOSALS_DIR.mkdir(parents=True, exist_ok=True)
    proposal_file = PROPOSALS_DIR / f"{today()}.json"

    # Si un fichier du jour existe déjà, fusionner en dédupliquant par URL puis par titre
    existing_proposals = []
    if proposal_file.exists():
        try:
            existing_proposals = json.loads(proposal_file.read_text(encoding="utf-8"))
        except Exception:
            pass

    merged = existing_proposals + proposals
    seen_urls: set[str] = set()
    seen_titles: set[str] = set()
    all_proposals = []
    for p in merged:
        url_key = p.get("source_url", "")
        title_key = p.get("titre", "").lower()[:50]
        if url_key in seen_urls or title_key in seen_titles:
            continue
        if url_key:
            seen_urls.add(url_key)
        seen_titles.add(title_key)
        all_proposals.append(p)
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
