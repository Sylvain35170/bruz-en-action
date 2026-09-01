#!/bin/bash
# -*- coding: utf-8 -*-
#
# Décharge et supprime les jobs launchd de Bruz en Action.
# Usage :  bash scripts/launchd/uninstall.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCH_AGENTS="$HOME/Library/LaunchAgents"
GUI="gui/$(id -u)"

for tpl in "$SCRIPT_DIR"/*.plist.template; do
    label="$(basename "$tpl" .plist.template)"
    dest="$LAUNCH_AGENTS/$label.plist"

    launchctl bootout "$GUI/$label" 2>/dev/null || true
    rm -f "$dest"
    echo "🗑️  $label déchargé et supprimé"
done
