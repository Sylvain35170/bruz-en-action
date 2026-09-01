#!/bin/bash
# -*- coding: utf-8 -*-
#
# Installe (ou réinstalle) les jobs launchd de Bruz en Action à partir des
# templates versionnés dans ce dossier.
#
#   scripts/launchd/
#     ├── com.bruz-en-action.veille.plist.template      (veille quotidienne 17h)
#     ├── com.bruz-en-action.linkcheck.plist.template   (link-check lundi 8h)
#     ├── install.sh    ← ce script
#     └── uninstall.sh
#
# Les templates contiennent 3 placeholders substitués ici :
#   __VENV_PYTHON__  → python du venv dédié (~/.venvs/bruz-en-action/bin/python3)
#   __REPO__         → racine du dépôt (déduite de l'emplacement de ce script)
#   __HOME__         → $HOME
#
# Idempotent : relançable à volonté, il recharge les jobs (bootout + bootstrap).
#
# Usage :  bash scripts/launchd/install.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
VENV_PYTHON="$HOME/.venvs/bruz-en-action/bin/python3"
LAUNCH_AGENTS="$HOME/Library/LaunchAgents"
GUI="gui/$(id -u)"

if [[ ! -x "$VENV_PYTHON" ]]; then
    echo "⚠️  venv introuvable : $VENV_PYTHON"
    echo "    Crée-le d'abord :  python3 -m venv ~/.venvs/bruz-en-action && \\"
    echo "                       ~/.venvs/bruz-en-action/bin/pip install -r $REPO/scripts/requirements.txt"
    exit 1
fi

mkdir -p "$LAUNCH_AGENTS" "$HOME/Library/Logs"

for tpl in "$SCRIPT_DIR"/*.plist.template; do
    label="$(basename "$tpl" .plist.template)"
    dest="$LAUNCH_AGENTS/$label.plist"

    sed -e "s|__VENV_PYTHON__|$VENV_PYTHON|g" \
        -e "s|__REPO__|$REPO|g" \
        -e "s|__HOME__|$HOME|g" \
        "$tpl" > "$dest"

    plutil -lint "$dest" >/dev/null

    launchctl bootout  "$GUI/$label" 2>/dev/null || true
    launchctl bootstrap "$GUI" "$dest"

    echo "✅ $label → $dest"
    launchctl print "$GUI/$label" | grep -E "^\s+(state|program) =" | sed 's/^/     /'
done

echo
echo "Fait. Vérifie les prochains créneaux :  launchctl print $GUI/com.bruz-en-action.veille | grep -A3 'next fire'"
