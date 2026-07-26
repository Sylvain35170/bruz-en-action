#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Select — Tri et enrichissement éditorial via SDK Anthropic.

Lit actus_queue.json, envoie les items à Claude (Haiku, par batches),
récupère pour chaque item :
  - resume      : 2 phrases en français
  - dossier     : un ID de DOSSIERS_DESC ou "à_classer"
  - pertinence  : 0-3 (0 = hors sujet, 3 = très pertinent)

Alimente le registre incrémental scripts/proposals/pending.json :
  - pertinence >= 1 → statut "pending" (en attente de revue humaine)
  - pertinence 0    → statut "rejected" (auto, mémorisé pour ne jamais re-proposer)
Supprime de la queue les items traités ; les batches en échec restent en queue.
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import (DATA_DIR, QUEUE_FILE, is_already_published, load_json,
                   load_registry, log, save_registry, today)

AGENT_NAME = "select"
# Chemin complet nécessaire : sous launchd, PATH ne contient que /usr/bin:/bin:/usr/sbin:/sbin,
# donc "claude" seul (résolu via PATH) échoue silencieusement (exit 78) hors shell interactif.
CLAUDE_CLI = shutil.which("claude") or "/opt/homebrew/bin/claude"
MODEL = "claude-haiku-4-5-20251001"


def build_dossiers_desc() -> str:
    """Construit la table id → mots-clés pour le prompt, DEPUIS data/dossiers.json.

    Source unique : chaque dossier porte un champ `mots_cles_ia` (liste). Ouvrir un
    nouveau dossier avec ses mots-clés le rend automatiquement routable par l'agent —
    fini la liste codée en dur qui dérivait de dossiers.json (D21 Culture y manquait,
    D08/D09/D14 y traînaient après suppression/fusion). Repli sur le titre si un
    dossier n'a pas encore de `mots_cles_ia`.
    """
    dossiers = load_json(DATA_DIR / "dossiers.json").get("dossiers", [])
    lignes = []
    for dos in dossiers:
        did = dos.get("id")
        mots = dos.get("mots_cles_ia") or []
        if not did:
            continue
        desc = " / ".join(mots) if mots else (dos.get("titre") or "").strip()
        lignes.append(f"{did} = {desc}")
    return "\n".join(lignes)


DOSSIERS_DESC = build_dossiers_desc()

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


# Batches observés à ~62s pour 5 items (run du 04/07) — timeout 75s trop juste
BATCH_SIZE = 5
TIMEOUT_S  = 150


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
        # Lever plutôt que retourner False : l'orchestrateur doit marquer le run
        # en erreur, pas afficher "rien de nouveau" (panne Claude CLI ≠ absence d'actu).
        raise RuntimeError(f"Select : tous les batches ont échoué ({len(failed_items)} items conservés en queue)")

    # Remettre les items échoués en queue
    QUEUE_FILE.write_text(
        json.dumps({"items": failed_items, "meta": {"last_updated": today()}},
                   ensure_ascii=False, indent=2), encoding="utf-8"
    )
    if failed_items:
        log(f"  {len(failed_items)} item(s) réinjectés en queue pour le prochain run.", "WARN")

    # Écarter les items déjà publiés dans actus.json (même sujet reformulé par un autre
    # scraper source, URL différente donc non filtré en amont dans la queue)
    proposals = []
    n_already_published = 0
    for p in all_proposals:
        if is_already_published(p.get("titre", ""), p.get("source_url", "")):
            n_already_published += 1
            continue
        proposals.append(p)
    if n_already_published:
        log(f"  {n_already_published} item(s) déjà publié(s) — écarté(s) de la sélection.", "INFO")

    # Réenrichir avec le type d'item (perdu par Claude, utile à la revue)
    type_by_id = {i.get("id"): i.get("type", "") for i in items_light}

    # Alimenter le registre incrémental — chaque item y entre UNE fois
    registry = load_registry()
    reg_items = registry["items"]
    known_reg_urls = {i.get("source_url", "") for i in reg_items}
    known_reg_titles = {i.get("titre", "").lower()[:50] for i in reg_items}

    n_new_pending = 0
    n_auto_rejected = 0
    for p in proposals:
        url_key = p.get("source_url", "")
        title_key = p.get("titre", "").lower()[:50]
        if (url_key and url_key in known_reg_urls) or title_key in known_reg_titles:
            continue  # déjà dans le registre (pending ou décidé) — ne pas re-proposer
        pertinent = p.get("pertinence", 0) >= 1
        p["type"] = type_by_id.get(p.get("id"), "")
        p["statut"] = "pending" if pertinent else "rejected"
        p["first_seen"] = today()
        p["decided_at"] = None if pertinent else today()
        p["mailed_at"] = None
        reg_items.append(p)
        if url_key:
            known_reg_urls.add(url_key)
        known_reg_titles.add(title_key)
        if pertinent:
            n_new_pending += 1
        else:
            n_auto_rejected += 1

    if n_new_pending or n_auto_rejected:
        save_registry(registry)

    n_pending_total = sum(1 for i in reg_items if i.get("statut") == "pending")
    log(f"Select : {len(proposals)} analysés → {n_new_pending} nouveau(x) pending, "
        f"{n_auto_rejected} auto-rejeté(s) — {n_pending_total} en attente de revue", "OK")
    return n_new_pending > 0


if __name__ == "__main__":
    run()
