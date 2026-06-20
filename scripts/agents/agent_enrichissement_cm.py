#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent d'enrichissement automatique des Conseils Municipaux.

Pipeline :
  1. Scan YouTube RSS → détecte les CMs dont la vidéo est disponible
  2. Filtre ceux qui ne sont pas encore enrichis dans cms.json (≤2 délibérations)
  3. Récupère la transcription automatique (youtube-transcript-api)
  4. Enrichissement :
     - Si ANTHROPIC_API_KEY est dispo → Claude Haiku (qualité supérieure)
     - Sinon → extraction par règles (regex)
  5. Met à jour cms.json

Aucune dépendance LLM obligatoire — fonctionne en local si pas de clé.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, fetch, load_json, log, save_json, today

YOUTUBE_RSS = "https://www.youtube.com/feeds/videos.xml?channel_id=UCfaKRNhoJ4chuaEtWV-bWjg"
CM_TITLE_PATTERN = re.compile(r"conseil\s+municipal", re.I)

MOIS = {
    "janvier": "01", "février": "02", "mars": "03", "avril": "04",
    "mai": "05", "juin": "06", "juillet": "07", "août": "08",
    "septembre": "09", "octobre": "10", "novembre": "11", "décembre": "12",
}

# Noms d'élus à ignorer dans les titres extraits (transcription brute)
ELUS_PREFIXES = re.compile(
    r"^(monsieur|madame|m\.|mme\.?)\s+\w+[\s,\.]+", re.I
)
# Thèmes par mots-clés
THEMES = {
    "Finance": ["budget", "crédit", "dépense", "recette", "emprunt", "subvention",
                "dotation", "dsu", "taxe", "garantie", "décision modificative", "autorisation"],
    "Urbanisme": ["zac", "plan local", "plu", "permis de construire", "foncier",
                  "aménagement", "réserve foncière", "cession", "préemption", "voirie"],
    "Éducation": ["école", "scolaire", "élève", "collège", "maternelle",
                  "élémentaire", "cantine", "restauration scolaire"],
    "Social": ["ccas", "solidarité", "aide", "handicap", "logement"],
    "Personnel": ["poste", "emploi", "agent", "rh", "recrutement", "tableau des effectifs"],
    "Culture": ["culture", "médiathèque", "spectacle", "bibliothèque", "patrimoine", "festival"],
    "Transition écologique": ["énergie", "biodiversité", "transition", "environnement", "mobilité"],
    "Animation": ["association", "fête", "événement", "convention", "partenariat"],
}

MAX_TRANSCRIPT_CHARS = 80_000

PROMPT_CLAUDE = """Tu es un analyste politique spécialisé dans les affaires municipales françaises.
Voici la transcription automatique (reconnaissance vocale, avec erreurs) d'un Conseil Municipal de la ville de Bruz (35).

La transcription est brute : mots mal retranscrits, noms propres déformés, ponctuation absente.
Corrige avec bon sens : "lulzou/tulzo/leulzou/lutulzo" = Letulzo, "ossin/houssin" = Houssin,
"désguérets" = Désguérets, "lorissard/lorissart" = Lorissard, etc.

Extrais les informations suivantes au format JSON strict :

{{
  "titre": "Titre court et factuel (ex: 'Budget 2026 et ZAC Multisites')",
  "resume_executif": "3-5 phrases résumant l'essentiel pour un citoyen bruzois",
  "points_cles": ["4-6 faits marquants concis avec chiffres si présents"],
  "deliberations": [
    {{
      "numero": "numéro tel qu'énoncé (ex: '26-05-01')",
      "titre": "Intitulé propre de la délibération",
      "vote": "Unanimité | X pour / Y contre / Z abstentions | Majoritaire | etc.",
      "detail": "1-3 phrases factuelles (montants, acteurs, enjeux)"
    }}
  ],
  "points_chauds": [
    {{
      "sujet": "Titre du point de tension",
      "tension": "haute | modérée | faible",
      "detail": "Qui dit quoi, quelle réponse, quel résultat"
    }}
  ],
  "impact_bruzois": ["3-5 impacts concrets sur le quotidien des habitants"],
  "a_surveiller": ["3-5 points à suivre lors des prochains CMs"]
}}

Élus majorité : Houssin (maire), Letulzo (finances), Désguérets (urbanisme), Briend (RH),
Daron (vie asso), Lorissard (social), Daniel (économie), Pagès (sécurité), Loton (éducation), Viter (culture)
Opposition : Salmon, Duran, Diaz, Chevalier, Delaunay, Chevet

Ne retourne QUE le JSON, sans commentaire ni markdown.

Titre YouTube : {titre_youtube}

TRANSCRIPTION :
{transcript}
"""

CLAUDE_CLI = "claude"  # claude CLI — déjà authentifié via Claude Code


# ---------------------------------------------------------------------------
# YouTube RSS
# ---------------------------------------------------------------------------

def _extract_date_from_title(titre: str) -> str | None:
    m = re.search(r"(\d{1,2})\s+(" + "|".join(MOIS) + r")\s+(\d{4})", titre.lower())
    if m:
        return f"{m.group(3)}-{MOIS[m.group(2)]}-{int(m.group(1)):02d}"
    return None


def _get_youtube_cms() -> list[dict]:
    r = fetch(YOUTUBE_RSS)
    if not r:
        return []
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
    }
    items = []
    try:
        root = ElementTree.fromstring(r.content)
        for entry in root.findall("atom:entry", ns):
            titre = entry.findtext("atom:title", "", ns).strip()
            if not CM_TITLE_PATTERN.search(titre):
                continue
            vid_id = entry.findtext("yt:videoId", "", ns).strip()
            published = entry.findtext("atom:published", today(), ns)[:10]
            date_cm = _extract_date_from_title(titre) or published
            items.append({
                "id": f"CM-{date_cm}",
                "date": date_cm,
                "titre_youtube": titre,
                "video_id": vid_id,
                "youtube_url": f"https://youtu.be/{vid_id}",
            })
    except Exception as e:
        log(f"Parse YouTube RSS : {e}", "WARN")
    return items


# ---------------------------------------------------------------------------
# Transcription
# ---------------------------------------------------------------------------

def _get_transcript(video_id: str) -> str | None:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        api = YouTubeTranscriptApi()
        t = api.fetch(video_id, languages=["fr"])
        return " ".join(s.text for s in t)[:MAX_TRANSCRIPT_CHARS]
    except Exception as e:
        log(f"  Transcription {video_id} : {e}", "WARN")
        return None


# ---------------------------------------------------------------------------
# Mode A : extraction via claude CLI (déjà authentifié)
# ---------------------------------------------------------------------------

def _enrich_with_claude_cli(transcript: str, titre_youtube: str) -> dict | None:
    """Appelle le CLI `claude` installé — aucune clé séparée requise (auth Claude Code)."""
    prompt = PROMPT_CLAUDE.format(titre_youtube=titre_youtube, transcript=transcript)
    try:
        result = subprocess.run(
            [CLAUDE_CLI, "--print", prompt, "--output-format", "json"],
            capture_output=True, text=True, timeout=300,
        )
        if result.returncode != 0:
            log(f"  claude CLI erreur : {result.stderr[:200]}", "ERR")
            return None

        outer = json.loads(result.stdout)
        raw = outer.get("result", "").strip()
        # Supprimer les éventuelles fences markdown ```json ... ```
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```\s*$", "", raw).strip()
        if not raw:
            log("  claude CLI : réponse vide", "ERR")
            return None
        return json.loads(raw)

    except subprocess.TimeoutExpired:
        log("  claude CLI : timeout", "ERR")
        return None
    except json.JSONDecodeError as e:
        log(f"  JSON invalide (claude CLI) : {e}", "ERR")
        return None
    except FileNotFoundError:
        log("  claude CLI introuvable dans PATH", "WARN")
        return None
    except Exception as e:
        log(f"  Erreur claude CLI : {e}", "ERR")
        return None


# ---------------------------------------------------------------------------
# Mode B : extraction par règles
# ---------------------------------------------------------------------------

def _detect_vote(bloc: str) -> str:
    re_unanimite = re.compile(r"(voté?e? à l[''']unanimité|adopté?e? à l[''']unanimité|unanimité)", re.I)
    re_chiffre = re.compile(r"(\d+)\s*voix?\s*(?:contre|pour)\s*(\d+)", re.I)
    re_abs = re.compile(r"(\d+)\s*abstentions?", re.I)

    if re_unanimite.search(bloc):
        m_abs = re_abs.search(bloc)
        if m_abs and int(m_abs.group(1)) > 0:
            return f"Unanimité avec {m_abs.group(1)} abstention(s)"
        return "Unanimité"
    m_chiffre = re_chiffre.search(bloc)
    m_abs = re_abs.search(bloc)
    if m_chiffre:
        a, b = m_chiffre.group(1), m_chiffre.group(2)
        abs_str = f" / {m_abs.group(1)} abstention(s)" if m_abs else ""
        return f"{a} pour / {b} contre{abs_str}"
    if m_abs and int(m_abs.group(1)) > 0:
        return f"Majoritaire — {m_abs.group(1)} abstention(s)"
    if re.search(r"adopté|voté|approuvé", bloc, re.I):
        return "Adoptée"
    return "—"


def _detect_theme(bloc: str) -> str:
    bloc_low = bloc.lower()
    scores = {t: sum(1 for m in mots if m in bloc_low) for t, mots in THEMES.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "Divers"


def _extract_title(raw: str) -> str:
    """Nettoie un titre brut : supprime préfixes d'élus, artefacts de transcription."""
    raw = re.sub(r"\s+", " ", raw).strip()
    # Supprimer "M. Letulzo — Finance" type de préfixes parlementaires
    raw = ELUS_PREFIXES.sub("", raw)
    # Supprimer le thème annoncé ("Finance —", "Urbanisme —", etc.)
    raw = re.sub(r"^(?:" + "|".join(THEMES.keys()) + r")\s*[—–-]\s*", "", raw, flags=re.I)
    # Supprimer interjections
    raw = re.sub(r"^(euh|donc|alors|voilà)[,\s]+", "", raw, flags=re.I)
    raw = raw.strip(" ,.")
    if raw:
        raw = raw[0].upper() + raw[1:]
    return raw[:100]


def _enrich_with_rules(transcript: str, cm_date: str, titre_youtube: str) -> dict:
    """Extraction par règles — fallback si pas de clé API."""
    annee = cm_date[:4][2:] if cm_date else "26"
    mois_num = cm_date[5:7] if len(cm_date) >= 7 else "00"

    # Marqueurs de délibérations — déduplication sur le numéro
    pattern = re.compile(r"délibération\s+num[eé]ro\s+(\d+)[\.,]?\s*", re.I)
    matches = list(pattern.finditer(transcript))

    # Dédupliquer : garder première occurrence par numéro
    seen_nums: set[str] = set()
    unique_matches = []
    for m in matches:
        num = m.group(1)
        if num not in seen_nums:
            seen_nums.add(num)
            unique_matches.append(m)
    matches = unique_matches

    deliberations = []
    for i, m in enumerate(matches):
        num_str = m.group(1)
        debut = m.end()
        fin = matches[i + 1].start() if i + 1 < len(matches) else min(debut + 2000, len(transcript))
        bloc = transcript[debut:fin].strip()

        # Titre : premier segment avant "merci", "qui vote", "des questions"
        parts = re.split(
            r"(?:merci|qui vote|y a-t-il|des questions|des remarques|des observations|voilà pour)[,\s]",
            bloc[:500], maxsplit=1, flags=re.I,
        )
        titre_raw = parts[0].strip()
        # Chercher un sujet plus court dans les 150 premiers chars
        first_sentence = re.split(r"[.!?]\s", titre_raw[:200])[0]
        titre = _extract_title(first_sentence)

        vote = _detect_vote(bloc[-600:])
        theme = _detect_theme(bloc)

        # Détail : suite propre
        suite = bloc[len(titre_raw):].strip()
        suite = re.sub(r"\s+", " ", suite)[:350].strip()

        numero = f"{annee}-{mois_num}-{num_str.zfill(2)}"
        deliberations.append({
            "numero": numero,
            "titre": titre or f"Délibération n°{num_str}",
            "vote": vote,
            "theme": theme,
            "detail": suite,
        })

    themes = {}
    votes_serres = []
    for d in deliberations:
        t = d.get("theme", "Divers")
        themes[t] = themes.get(t, 0) + 1
        if "contre" in d.get("vote", "") or "abstention" in d.get("vote", ""):
            votes_serres.append(d["titre"])

    theme_dom = max(themes, key=themes.get) if themes else "divers"
    resume = (
        f"Séance du {titre_youtube.lower()} — {len(deliberations)} délibération(s). "
        f"Thème dominant : {theme_dom}. "
    )
    resume += (
        f"Vote(s) non unanime(s) : {'; '.join(votes_serres[:2])}."
        if votes_serres
        else "Toutes adoptées à l'unanimité."
    )

    points_cles = []
    for d in deliberations:
        vote = d.get("vote", "")
        if "contre" in vote or "abstention" in vote:
            points_cles.append(f"{d['titre']} — {vote}")
        elif d.get("theme") in ("Finance", "Urbanisme", "Social"):
            m = re.search(r"(\d[\d\s]*[€]|\d[\d\s]*000\s*€|\d+\s*[MK]€)", d.get("detail", ""), re.I)
            points_cles.append(f"{d['titre']}{' (' + m.group(1).strip() + ')' if m else ''}")
        if len(points_cles) >= 6:
            break

    return {
        "titre": titre_youtube,
        "resume_executif": resume,
        "points_cles": points_cles[:6] or [d["titre"] for d in deliberations[:4]],
        "deliberations": deliberations,
        "points_chauds": [],
        "impact_bruzois": [],
        "a_surveiller": [
            "Publication des délibérations sur Mégalis Bretagne",
            "Bruz Mag — prochain numéro",
        ],
    }


# ---------------------------------------------------------------------------
# Mise à jour séance
# ---------------------------------------------------------------------------

def _apply_enrichissement(seance: dict, enrichi: dict, video_id: str, youtube_url: str,
                           titre_youtube: str) -> dict:
    seance["titre"] = enrichi.get("titre") or titre_youtube
    seance["resume_executif"] = enrichi.get("resume_executif", "")
    seance["points_cles"] = enrichi.get("points_cles", [])
    seance["deliberations"] = enrichi.get("deliberations", [])
    seance.setdefault("points_chauds", enrichi.get("points_chauds", []))
    seance.setdefault("impact_bruzois", enrichi.get("impact_bruzois", []))
    seance.setdefault("a_surveiller", enrichi.get("a_surveiller", []))
    sources = seance.get("sources", [])
    if not any("youtu" in s.get("url", "") for s in sources):
        sources.insert(0, {"label": f"Vidéo YouTube — {titre_youtube}", "url": youtube_url})
    seance["sources"] = sources
    seance["youtube_id"] = video_id
    seance["youtube_url"] = youtube_url
    seance["statut"] = "passe"
    return seance


# ---------------------------------------------------------------------------
# Point d'entrée
# ---------------------------------------------------------------------------

def run() -> bool:
    log("Enrichissement CMs — mode : claude CLI + fallback règles")

    cms_data = load_json(DATA_DIR / "cms.json")
    seances_by_id = {s["id"]: s for s in cms_data.get("seances", []) if "id" in s}

    yt_cms = _get_youtube_cms()
    if not yt_cms:
        log("Aucun CM trouvé sur YouTube.", "WARN")
        return False

    updated = False
    for yt in yt_cms:
        cm_id = yt["id"]
        seance = seances_by_id.get(cm_id)

        if not seance:
            seance = {
                "id": cm_id, "date": yt["date"], "statut": "passe",
                "lieu": "Halle Pagnol, Bruz — 19h", "titre": yt["titre_youtube"],
                "points_cles": [], "deliberations": [], "points_chauds": [],
                "impact_bruzois": [], "a_surveiller": [], "sources": [],
            }
            seances_by_id[cm_id] = seance
            log(f"  Nouvelle séance créée : {cm_id}", "NEW")

        if len(seance.get("deliberations", [])) > 2:
            log(f"  {cm_id} déjà enrichi — ignoré")
            continue
        if seance.get("statut") == "a_venir":
            log(f"  {cm_id} à venir — ignoré")
            continue

        log(f"  Traitement {cm_id} — {yt['titre_youtube'][:55]}…")
        transcript = _get_transcript(yt["video_id"])
        if not transcript:
            log(f"  {cm_id} : transcription indisponible", "WARN")
            continue

        log(f"  Transcription : {len(transcript)} chars")

        # Mode A : claude CLI (authentifié via Claude Code)
        enrichi = _enrich_with_claude_cli(transcript, yt["titre_youtube"])
        if not enrichi:
            log("  claude CLI a échoué — fallback règles", "WARN")

        # Mode B : règles (fallback ou par défaut)
        if not enrichi:
            enrichi = _enrich_with_rules(transcript, yt["date"], yt["titre_youtube"])

        seance = _apply_enrichissement(
            seance, enrichi, yt["video_id"], yt["youtube_url"], yt["titre_youtube"]
        )
        seances_by_id[cm_id] = seance
        log(f"  {cm_id} : {len(seance['deliberations'])} délib extraites", "OK")
        updated = True

    if updated:
        cms_data["seances"] = sorted(
            seances_by_id.values(), key=lambda s: s.get("date", ""), reverse=True
        )
        cms_data.setdefault("meta", {})["last_updated"] = today()
        save_json(DATA_DIR / "cms.json", cms_data)
        log("cms.json mis à jour.", "OK")
    else:
        log("Aucun CM à enrichir.")

    return updated


if __name__ == "__main__":
    run()
