#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Mailer — Envoie les propositions éditoriales par email.

Lit le registre incrémental scripts/proposals/pending.json (généré par
agent_select) et envoie TOUT ce qui est en attente de revue (statut "pending"),
pas seulement les items du jour — un item reste signalé jusqu'à décision.

Envoi quotidien systématique (17h) : un email part à chaque run, avec les
pending du moment ou un message "rien de nouveau" si le registre est vide.

Usage :
  python3 scripts/agents/agent_mailer.py            # envoi réel
  python3 scripts/agents/agent_mailer.py --dry-run  # construit l'email sans l'envoyer

Envoi via l'API Gmail (HTTPS, OAuth2) — pas de SMTP. Choix fait le 18/07/2026 :
le VPN pro (Cisco Secure Client) bloque les ports SMTP (465/587) sortants, ce
qui faisait échouer le mailer quand le VPN était connecté au moment du run
17h. L'API Gmail passe en HTTPS/443, jamais bloqué par ce VPN.

Configuration :
  ~/.bruz-mailer.json (destinataires, jamais commité)
  {
    "from_email": "sylv.bertrand@gmail.com",
    "to": ["sylv.bertrand@gmail.com", "hajjarnaoufal1@gmail.com"]
  }

  ~/.bruz-mailer-gmail/client_secret.json — credentials OAuth "Desktop app"
  (projet Google Cloud "bruz-en-action-mailer", API Gmail, scope gmail.send).
  ~/.bruz-mailer-gmail/token.json — généré au premier run (ouvre un navigateur
  pour le consentement), puis réutilisé/rafraîchi automatiquement (silencieux,
  y compris depuis launchd) tant que le refresh token n'est pas révoqué.
"""

import json
import sys
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import load_registry, log, save_registry, today

AGENT_NAME = "mailer"
CONFIG_FILE = Path.home() / ".bruz-mailer.json"
GMAIL_DIR = Path.home() / ".bruz-mailer-gmail"
GMAIL_CLIENT_SECRET = GMAIL_DIR / "client_secret.json"
GMAIL_TOKEN = GMAIL_DIR / "token.json"
GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

PERTINENCE_LABEL = {0: "⚪ hors sujet", 1: "🟡 marginal", 2: "🟠 pertinent", 3: "🔴 essentiel"}


def _load_config() -> dict | None:
    if not CONFIG_FILE.exists():
        log(f"Config manquante : {CONFIG_FILE}", "ERR")
        log("Créer ~/.bruz-mailer.json avec from_email, to[]", "ERR")
        return None
    try:
        return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    except Exception as e:
        log(f"Config invalide : {e}", "ERR")
        return None


def _get_gmail_service():
    """Charge/rafraîchit les credentials OAuth et retourne le client Gmail API.

    Premier run : ouvre un navigateur pour le consentement (interactif,
    impossible depuis launchd). Runs suivants : rafraîchissement silencieux
    via le refresh token stocké dans token.json — compatible cron/launchd.
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
            if not GMAIL_CLIENT_SECRET.exists():
                raise RuntimeError(f"Credentials OAuth manquantes : {GMAIL_CLIENT_SECRET}")
            flow = InstalledAppFlow.from_client_secrets_file(str(GMAIL_CLIENT_SECRET), GMAIL_SCOPES)
            creds = flow.run_local_server(port=0)
        GMAIL_TOKEN.write_text(creds.to_json(), encoding="utf-8")

    return build("gmail", "v1", credentials=creds)


def _fmt_fr(iso: str) -> str:
    """2026-07-05 → 05/07."""
    try:
        return f"{iso[8:10]}/{iso[5:7]}"
    except Exception:
        return iso or ""


def _build_email(proposals: list[dict], date_str: str) -> tuple[str, str]:
    """Retourne (sujet, corps HTML). Les items jamais mailés sont badgés 🆕."""
    n = len(proposals)
    n_new = sum(1 for p in proposals if not p.get("mailed_at"))
    suffix = f" dont {n_new} nouvelle{'s' if n_new > 1 else ''}" if 0 < n_new < n else ""
    sujet = f"[Bruz en Action] {n} proposition{'s' if n > 1 else ''} en attente de revue{suffix} — {date_str}"

    lignes = []
    BORDER_COLOR = {0: "#cbd5e1", 1: "#fbbf24", 2: "#f97316", 3: "#ef4444"}
    for p in proposals:
        score = p.get("pertinence", 1)
        badge = PERTINENCE_LABEL.get(score, "")
        dossier = p.get("dossier", "à_classer")
        source_label = p.get("source_label", "")
        pourquoi = p.get("pourquoi", "")
        border = BORDER_COLOR.get(score, "#e2e8f0")
        if p.get("mailed_at"):
            attente = f"⏳ en attente depuis le {_fmt_fr(p.get('first_seen', ''))}"
        else:
            attente = "🆕 nouveau"
        lignes.append(f"""
<div style="border-left:4px solid {border};padding:12px 16px;margin:14px 0;background:#f8fafc">
  <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;line-height:1.8">
    <strong>Collecté via :</strong> {source_label or '—'} &nbsp;·&nbsp; {p.get('date') or 'date inconnue'} &nbsp;·&nbsp; {attente}<br>
    <strong>Dossier :</strong> {dossier} &nbsp;·&nbsp; {badge}
  </div>
  <div style="font-weight:600;color:#0f172a;font-size:15px;margin-bottom:6px">{p.get('titre','')}</div>
  <div style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:6px">{p.get('resume','')}</div>
  {f'<div style="font-size:12px;color:#64748b;font-style:italic;margin-bottom:6px">💡 {pourquoi}</div>' if pourquoi else ''}
  <a href="{p.get('source_url','#')}" style="font-size:12px;color:#3b82f6;display:inline-block">
    → Voir la source
  </a>
</div>""")

    corps = f"""<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px;color:#1e293b">
  <h2 style="color:#0f172a;border-bottom:2px solid #f97316;padding-bottom:8px">
    🏛️ Bruz en Action — Propositions en attente de revue
  </h2>
  <p style="color:#64748b">
    {n} article{'s' if n > 1 else ''} en attente de décision éditoriale.
    Ouvre Claude Code et tape <strong>"on examine les propositions"</strong> pour les passer en revue.
  </p>
  {''.join(lignes)}
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="font-size:11px;color:#94a3b8">
    Généré automatiquement par les agents Bruz en Action · {date_str}
  </p>
</body></html>"""

    return sujet, corps


def _build_empty_email(date_str: str) -> tuple[str, str]:
    """Email quotidien quand aucune proposition n'est en attente."""
    sujet = f"[Bruz en Action] Rien de nouveau — {date_str}"
    corps = f"""<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px;color:#1e293b">
  <h2 style="color:#0f172a;border-bottom:2px solid #f97316;padding-bottom:8px">
    🏛️ Bruz en Action — Veille du jour
  </h2>
  <p style="color:#64748b">
    Aucune proposition en attente de revue aujourd'hui.
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="font-size:11px;color:#94a3b8">
    Généré automatiquement par les agents Bruz en Action · {date_str}
  </p>
</body></html>"""
    return sujet, corps


def run(dry_run: bool = False) -> bool:
    date_str = today()
    registry = load_registry()
    pending = [p for p in registry["items"] if p.get("statut") == "pending"]

    # Envoi quotidien systématique à 17h, avec ou sans nouveauté.
    if not pending:
        sujet, corps = _build_empty_email(date_str)
    else:
        # Tri : nouveaux d'abord, puis pertinence décroissante, puis plus anciens en attente
        pending.sort(key=lambda p: (bool(p.get("mailed_at")), -p.get("pertinence", 0),
                                    p.get("first_seen", "")))
        sujet, corps = _build_email(pending, date_str)

    new_items = [p for p in pending if not p.get("mailed_at")]

    if dry_run:
        log(f"Mailer [dry-run] : {sujet}", "OK")
        log(f"Mailer [dry-run] : {len(pending)} items ({len(new_items)} nouveaux) — email non envoyé.", "OK")
        return False

    config = _load_config()
    if not config:
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = sujet
    msg["From"] = config["from_email"]
    msg["To"] = ", ".join(config["to"])
    msg.attach(MIMEText(corps, "html", "utf-8"))

    import base64
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")

    RETRY_DELAYS = (10, 30)  # secondes — filet pour les vrais aléas réseau transitoires

    try:
        service = _get_gmail_service()

        last_error = None
        for attempt, delay in enumerate((0, *RETRY_DELAYS)):
            if delay:
                log(f"Mailer : tentative {attempt + 1} dans {delay}s (dernière erreur : {last_error})", "WARN")
                time.sleep(delay)
            try:
                service.users().messages().send(userId="me", body={"raw": raw}).execute()
                break
            except Exception as e:
                last_error = e
                if attempt == len(RETRY_DELAYS):
                    raise

        if pending:
            for p in pending:
                p["mailed_at"] = date_str
            registry["meta"]["last_mailed_at"] = date_str
            save_registry(registry)
            log(f"Mailer : email envoyé à {config['to']} ({len(pending)} items, "
                f"{len(new_items)} nouveaux)", "OK")
        else:
            log(f"Mailer : email envoyé à {config['to']} (rien de nouveau)", "OK")
        return True

    except Exception as e:
        log(f"Mailer : erreur Gmail API ({e})", "ERR")
        return False


if __name__ == "__main__":
    run(dry_run="--dry-run" in sys.argv)
