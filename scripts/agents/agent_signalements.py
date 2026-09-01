#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Signalements — transforme les emails [SIGNALEMENT] reçus sur
sylv.bertrand@gmail.com (adresse de contact de l'association, cf. data/meta.json)
en tickets structurés pour triage.

Source : le bouton "Signaler" du site (components/SignalementButton.tsx) lit
`meta.json > contact.email` pour construire un mailto: avec un sujet
"[SIGNALEMENT] Réf : ..." et un corps structuré (TYPE / RÉFÉRENCE / MESSAGE /
SOURCE / EMAIL DE CONTACT). L'agent recherche ces emails par sujet — aucun
filtre/label Gmail à configurer, le bouton produit déjà ce préfixe dans tous
les cas — extrait les champs, et dépose un ticket dans
scripts/proposals/signalements.json.

Même compte Gmail que agent_mailer : réutilise son client OAuth existant
(~/.bruz-mailer-gmail/client_secret.json) plutôt que de faire créer un second
projet Google Cloud pour la même boîte — seul le token diffère (scope
`gmail.readonly` propre à cet agent, jamais `gmail.send`). L'agent ne modifie
jamais la boîte (pas de label posé, pas de message marqué lu) ; le
dédoublonnage vit entièrement dans le registre local : un `message_id` déjà
présent dans signalements.json n'est jamais re-transformé en ticket.

L'extraction du template est du best-effort : un citoyen peut répondre en
texte libre, supprimer des lignes, ou son client mail peut reformater le
corps. Si aucun des en-têtes attendus (TYPE/RÉFÉRENCE/MESSAGE/SOURCE) n'est
retrouvé, le ticket garde quand même le corps brut intégral (`parsed: false`)
plutôt que de perdre le signalement.

Configuration (première utilisation, une fois) :
  ~/.bruz-mailer-gmail/client_secret.json — DÉJÀ EN PLACE si agent_mailer
  tourne (même compte, même client OAuth). Sinon, credentials OAuth
  "Desktop app" (projet Google Cloud, API Gmail activée).
  ~/.bruz-signalements-gmail/token.json — propre à cet agent (scope différent
  du mailer) : généré au premier run (ouvre un navigateur pour le
  consentement — se connecter avec sylv.bertrand@gmail.com), puis rafraîchi
  automatiquement (silencieux, y compris depuis launchd).

Usage :
  python3 scripts/agents/agent_signalements.py --setup         # consentement OAuth (1 fois, à la main)
  python3 scripts/agents/agent_signalements.py                 # scan + dépose les tickets
  python3 scripts/agents/agent_signalements.py --list          # liste les tickets "nouveau"
  python3 scripts/agents/agent_signalements.py --close id1,id2 # marque des tickets "traité"
"""

from __future__ import annotations

import argparse
import base64
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import load_json, log, save_json, stable_id, today  # noqa: E402

AGENT_NAME = "signalements"

# Même compte que agent_mailer (sylv.bertrand@gmail.com) : on réutilise son
# client OAuth, seul le token (scope readonly, propre à cet agent) est séparé.
MAILER_CLIENT_SECRET = Path.home() / ".bruz-mailer-gmail" / "client_secret.json"
GMAIL_DIR = Path.home() / ".bruz-signalements-gmail"
GMAIL_CLIENT_SECRET = GMAIL_DIR / "client_secret.json"  # repli si le mailer n'est pas configuré
GMAIL_TOKEN = GMAIL_DIR / "token.json"
GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def _client_secret_path() -> Path:
    """Préfère le client OAuth déjà déployé pour le mailer (même compte)."""
    return MAILER_CLIENT_SECRET if MAILER_CLIENT_SECRET.exists() else GMAIL_CLIENT_SECRET

TICKETS_FILE = Path(__file__).parent.parent / "proposals" / "signalements.json"

# Doit rester synchro avec components/SignalementButton.tsx — pas de constante
# partagée possible (Python / TypeScript), donc à mettre à jour des deux côtés
# si le template du bouton change un jour.
GMAIL_QUERY = 'subject:"[SIGNALEMENT]"'
TYPES = [
    "Inexactitude ou imprécision",
    "Promesse manquante",
    "Info sur un dossier",
    "Lien cassé",
    "Autre",
]

RE_CHECKED = re.compile(r"^\s*\[([xX✓*])\]\s*(.+)$")
RE_HEADER = re.compile(r"^(RÉFÉRENCE|MESSAGE|SOURCE|EMAIL DE CONTACT)\s*(?:\(optionnel\))?\s*:\s*(.*)$", re.I)
RE_TAG = re.compile(r"<[^>]+>")


def _get_gmail_service():
    """Charge/rafraîchit les credentials OAuth et retourne le client Gmail API.

    Même mécanique que agent_mailer._get_gmail_service, mais sur un projet et
    un compte Google distincts (voir docstring du module).
    """
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build

    creds = None
    if GMAIL_TOKEN.exists():
        creds = Credentials.from_authorized_user_file(str(GMAIL_TOKEN), GMAIL_SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            client_secret = _client_secret_path()
            if not client_secret.exists():
                raise RuntimeError(f"Credentials OAuth manquantes : {client_secret}")
            flow = InstalledAppFlow.from_client_secrets_file(str(client_secret), GMAIL_SCOPES)
            creds = flow.run_local_server(port=0)
        GMAIL_DIR.mkdir(parents=True, exist_ok=True)
        GMAIL_TOKEN.write_text(creds.to_json(), encoding="utf-8")

    return build("gmail", "v1", credentials=creds)


def _decode_part(data: str) -> str:
    return base64.urlsafe_b64decode(data.encode("utf-8") + b"==").decode("utf-8", errors="replace")


def _extraire_corps(payload: dict) -> str:
    """Retourne le corps texte d'un message Gmail, en préférant text/plain.

    Replie sur text/html (tags retirés au tampon) si aucune partie texte brut
    n'existe — un client mail peut n'envoyer que du HTML sur une réponse.
    """
    def _parcourir(part: dict) -> tuple[str | None, str | None]:
        mime = part.get("mimeType", "")
        body = part.get("body", {})
        data = body.get("data")
        plain = html = None
        if data and mime == "text/plain":
            plain = _decode_part(data)
        elif data and mime == "text/html":
            html = _decode_part(data)
        for sous_partie in part.get("parts", []) or []:
            p2, h2 = _parcourir(sous_partie)
            plain = plain or p2
            html = html or h2
        return plain, html

    plain, html = _parcourir(payload)
    if plain:
        return plain
    if html:
        return RE_TAG.sub(" ", html)
    return ""


def parser_corps(corps: str) -> dict:
    """Extrait TYPE/RÉFÉRENCE/MESSAGE/SOURCE/EMAIL du corps structuré.

    Args:
        corps: Corps texte brut du message (déjà décodé).

    Returns:
        Dict avec `parsed` (bool) et les champs extraits (None si absents).
    """
    lignes = corps.splitlines()

    type_coche = None
    for ligne in lignes:
        m = RE_CHECKED.match(ligne)
        if m and m.group(2).strip() in TYPES:
            type_coche = m.group(2).strip()
            break

    sections: dict[str, list[str]] = {}
    section_courante = None
    for ligne in lignes:
        m = RE_HEADER.match(ligne.strip())
        if m:
            section_courante = m.group(1).upper()
            sections[section_courante] = [m.group(2).strip()] if m.group(2).strip() else []
            continue
        if ligne.strip() == "---":
            section_courante = None
            continue
        if section_courante:
            sections[section_courante].append(ligne.strip())

    def _join(cle: str) -> str | None:
        lignes_section = [l for l in sections.get(cle, []) if l]
        if not lignes_section:
            return None
        texte = " ".join(lignes_section).strip()
        # Les lignes de placeholder du template ("(décrivez le problème...)")
        # ne sont jamais un vrai contenu : les traiter comme absentes.
        if texte.startswith("(") and texte.endswith(")"):
            return None
        return texte or None

    reference = _join("RÉFÉRENCE")
    message = _join("MESSAGE")
    source = _join("SOURCE")
    email_contact = _join("EMAIL DE CONTACT")

    parsed = any([type_coche, reference, message, source, email_contact])
    return {
        "parsed": parsed,
        "type": type_coche,
        "reference": reference,
        "message": message,
        "source": source,
        "email_contact": email_contact,
    }


def _tickets_connus() -> set[str]:
    return {t.get("message_id") for t in load_json(TICKETS_FILE).get("items", [])}


def setup() -> None:
    """Déclenche le consentement OAuth navigateur (à faire une fois, à la main).

    C'est la seule voie pour créer `GMAIL_TOKEN` : `scan()` se saute tant qu'il
    n'existe pas (sinon `flow.run_local_server()` bloquerait launchd, cf.
    incident du 26/08). Ici on est forcément en interactif, donc on l'appelle.
    """
    if GMAIL_TOKEN.exists():
        log(f"Token déjà présent ({GMAIL_TOKEN}) — rien à faire. Test d'accès…", "INFO")
    try:
        service = _get_gmail_service()
        profil = service.users().getProfile(userId="me").execute()
        log(f"✅ Consentement OK — boîte : {profil.get('emailAddress')}", "OK")
    except Exception as e:
        log(f"Échec du consentement : {e}", "ERR")
        sys.exit(1)


def scan() -> bool:
    """Interroge Gmail et dépose un ticket par email [SIGNALEMENT] non déjà connu."""
    if not GMAIL_TOKEN.exists():
        # Pas encore configuré : état normal tant que le consentement navigateur
        # (token propre à cet agent) n'a pas été fait une fois à la main (voir
        # docstring du module). Tester client_secret ne suffit pas : il existe déjà
        # par réutilisation du client OAuth du mailer, donc ce garde-fou ne
        # détectait jamais l'absence de consentement — `_get_gmail_service()`
        # tombait alors sur `flow.run_local_server()`, qui attend un navigateur et
        # bloque indéfiniment sous launchd (tout run_agents.py suivant : Sélection,
        # Mailer, Dossiers... jamais exécuté). Ne pas logger en ERR — un run_agents
        # quotidien ne doit pas afficher "en erreur" pour une étape de setup non
        # faite, seulement pour une vraie panne une fois l'agent opérationnel.
        log("Signalements : consentement OAuth non fait — agent non configuré (setup à faire une fois, hors launchd).", "INFO")
        return False
    try:
        service = _get_gmail_service()
    except Exception as e:
        log(f"Signalements : Gmail API inaccessible ({e})", "ERR")
        return False

    try:
        resultats = service.users().messages().list(userId="me", q=GMAIL_QUERY).execute()
    except Exception as e:
        log(f"Signalements : recherche Gmail échouée ({e})", "ERR")
        return False

    messages = resultats.get("messages", [])
    if not messages:
        log("Signalements : aucun email [SIGNALEMENT] dans la boîte.", "INFO")
        return False

    connus = _tickets_connus()
    a_traiter = [m for m in messages if m["id"] not in connus]
    if not a_traiter:
        log("Signalements : aucun nouvel email (tous déjà transformés en ticket).", "INFO")
        return False

    registre = load_json(TICKETS_FILE)
    tickets = registre.setdefault("items", [])
    n_nouveaux = 0

    for ref in a_traiter:
        try:
            msg = service.users().messages().get(userId="me", id=ref["id"], format="full").execute()
        except Exception as e:
            log(f"Signalements : lecture du message {ref['id']} échouée ({e})", "WARN")
            continue

        headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
        corps = _extraire_corps(msg.get("payload", {}))
        champs = parser_corps(corps)

        ticket = {
            "id": stable_id("sig", ref["id"]),
            "message_id": ref["id"],
            "date_recu": headers.get("Date", ""),
            "expediteur": headers.get("From", ""),
            "sujet": headers.get("Subject", ""),
            "corps_brut": corps.strip()[:2000],
            "statut": "nouveau",
            "date_ticket": today(),
            **champs,
        }
        tickets.append(ticket)
        n_nouveaux += 1
        label = ticket["type"] or "(type non identifié)"
        log(f"  🆕 [{label}] {ticket['sujet'][:70]}", "NEW")
        if not champs["parsed"]:
            log(f"     ⚠️ template non reconnu — corps brut conservé intégralement", "WARN")

    if n_nouveaux == 0:
        return False

    TICKETS_FILE.parent.mkdir(parents=True, exist_ok=True)
    save_json(TICKETS_FILE, registre)
    log(f"Signalements : {n_nouveaux} nouveau(x) ticket(s) → {TICKETS_FILE.name}", "OK")
    return True


def lister() -> None:
    """Affiche les tickets au statut "nouveau"."""
    items = [t for t in load_json(TICKETS_FILE).get("items", []) if t.get("statut") == "nouveau"]
    if not items:
        log("Aucun ticket signalement en attente.", "INFO")
        return
    log(f"{len(items)} ticket(s) en attente :", "INFO")
    for t in items:
        print(f"\n  [{t['id']}] {t.get('type') or '(type non identifié)'} · reçu le {t.get('date_ticket')}")
        print(f"      Sujet    : {t.get('sujet', '')}")
        print(f"      De       : {t.get('expediteur', '')}")
        if t.get("reference"):
            print(f"      Référence: {t['reference']}")
        if t.get("message"):
            print(f"      Message  : {t['message'][:300]}")
        if t.get("source"):
            print(f"      Source   : {t['source']}")
        if t.get("email_contact"):
            print(f"      Contact  : {t['email_contact']}")
        if not t.get("parsed"):
            print(f"      ⚠️ Template non reconnu — corps brut : {t.get('corps_brut', '')[:300]}")


def fermer(ids: list[str]) -> None:
    """Marque des tickets comme traités."""
    registre = load_json(TICKETS_FILE)
    by_id = {t["id"]: t for t in registre.get("items", [])}
    inconnus = [i for i in ids if i not in by_id]
    if inconnus:
        log(f"IDs inconnus : {', '.join(inconnus)}", "ERR")
        sys.exit(1)
    for i in ids:
        by_id[i]["statut"] = "traité"
        by_id[i]["decided_at"] = today()
        log(f"  ✅ fermé : {by_id[i].get('sujet', '')[:70]}")
    save_json(TICKETS_FILE, registre)


def run() -> bool:
    return scan()


if __name__ == "__main__":
    parseur = argparse.ArgumentParser(description=__doc__)
    parseur.add_argument("--setup", action="store_true",
                         help="consentement OAuth navigateur (à faire une fois, à la main)")
    parseur.add_argument("--list", action="store_true", help="lister les tickets en attente")
    parseur.add_argument("--close", default="", help="IDs à marquer traités, séparés par des virgules")
    args = parseur.parse_args()

    if args.setup:
        setup()
    elif args.list:
        lister()
    elif args.close:
        fermer([i.strip() for i in args.close.split(",") if i.strip()])
    else:
        run()
