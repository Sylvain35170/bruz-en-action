#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Mailer — Envoie les propositions éditoriales par email.

Lit scripts/proposals/YYYY-MM-DD.json (généré par agent_select),
filtre les items pertinents (pertinence >= 1),
et envoie un email de synthèse aux directeurs éditoriaux.

Configuration : ~/.bruz-mailer.json (créer une fois, jamais commité)
{
  "from_email": "sylv.bertrand@gmail.com",
  "app_password": "xxxx xxxx xxxx xxxx",
  "to": ["sylv.bertrand@gmail.com", "hajjarnaoufal1@gmail.com"]
}

App Password Gmail : https://myaccount.google.com/apppasswords
(Nécessite la 2FA activée sur le compte Google)
"""

import json
import smtplib
import sys
from datetime import date, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import PROPOSALS_DIR, log, today

AGENT_NAME = "mailer"
CONFIG_FILE = Path.home() / ".bruz-mailer.json"

PERTINENCE_LABEL = {0: "⚪ hors sujet", 1: "🟡 marginal", 2: "🟠 pertinent", 3: "🔴 essentiel"}


def _load_config() -> dict | None:
    if not CONFIG_FILE.exists():
        log(f"Config manquante : {CONFIG_FILE}", "ERR")
        log("Créer ~/.bruz-mailer.json avec from_email, app_password, to[]", "ERR")
        return None
    try:
        return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    except Exception as e:
        log(f"Config invalide : {e}", "ERR")
        return None


def _build_email(proposals: list[dict], date_str: str) -> tuple[str, str]:
    """Retourne (sujet, corps HTML)."""
    n = len(proposals)
    sujet = f"[Bruz en Action] {n} proposition{'s' if n > 1 else ''} à examiner — {date_str}"

    lignes = []
    BORDER_COLOR = {0: "#cbd5e1", 1: "#fbbf24", 2: "#f97316", 3: "#ef4444"}
    for p in proposals:
        score = p.get("pertinence", 1)
        badge = PERTINENCE_LABEL.get(score, "")
        dossier = p.get("dossier", "à_classer")
        source_label = p.get("source_label", "")
        pourquoi = p.get("pourquoi", "")
        border = BORDER_COLOR.get(score, "#e2e8f0")
        lignes.append(f"""
<div style="border-left:4px solid {border};padding:12px 16px;margin:14px 0;background:#f8fafc">
  <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;line-height:1.8">
    <strong>Collecté via :</strong> {source_label or '—'} &nbsp;·&nbsp; {p.get('date','')}<br>
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
    🏛️ Bruz en Action — Propositions éditoriales du {date_str}
  </h2>
  <p style="color:#64748b">
    {n} article{'s' if n > 1 else ''} sélectionné{'s' if n > 1 else ''} par les agents de veille.
    Ouvre Claude Code et tape <strong>"on examine les propositions"</strong> pour les passer en revue.
  </p>
  {''.join(lignes)}
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="font-size:11px;color:#94a3b8">
    Généré automatiquement par les agents Bruz en Action · {date_str}
  </p>
</body></html>"""

    return sujet, corps


def run() -> bool:
    date_str = today()
    proposal_file = PROPOSALS_DIR / f"{date_str}.json"

    if not proposal_file.exists():
        log("Mailer : aucun fichier proposals du jour.", "INFO")
        return False

    try:
        all_proposals = json.loads(proposal_file.read_text(encoding="utf-8"))
    except Exception as e:
        log(f"Mailer : lecture proposals échouée ({e})", "ERR")
        return False

    # Ne garder que les pertinents (score >= 1) et récents (7 jours)
    date_min = (date.today() - timedelta(days=7)).isoformat()
    pertinents = [
        p for p in all_proposals
        if p.get("pertinence", 0) >= 1 and p.get("date", "") >= date_min
    ]

    if not pertinents:
        log("Mailer : aucun item pertinent — email non envoyé.", "INFO")
        return False

    config = _load_config()
    if not config:
        return False

    sujet, corps = _build_email(pertinents, date_str)

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = sujet
        msg["From"] = config["from_email"]
        msg["To"] = ", ".join(config["to"])
        msg.attach(MIMEText(corps, "html", "utf-8"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(config["from_email"], config["app_password"])
            server.sendmail(config["from_email"], config["to"], msg.as_string())

        log(f"Mailer : email envoyé à {config['to']} ({len(pertinents)} items)", "OK")
        return True

    except smtplib.SMTPAuthenticationError:
        log("Mailer : authentification Gmail échouée — vérifier app_password", "ERR")
        return False
    except Exception as e:
        log(f"Mailer : erreur SMTP ({e})", "ERR")
        return False


if __name__ == "__main__":
    run()
