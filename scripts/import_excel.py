"""
import_excel.py — Convertit input/promesses_source.xlsx → data/promesses.json

Usage : python3 scripts/import_excel.py
"""

import json
import sys
from pathlib import Path
from datetime import date

try:
    import openpyxl
except ImportError:
    print("❌ openpyxl requis : pip install openpyxl")
    sys.exit(1)

ROOT = Path(__file__).parent.parent
INPUT_FILE = ROOT / "input" / "promesses_source.xlsx"
OUTPUT_FILE = ROOT / "data" / "promesses.json"

COLONNES_ATTENDUES = [
    "id", "pilier_id", "titre", "description",
    "statut", "date_statut", "source_url", "notes"
]

def load_existing():
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE) as f:
            return json.load(f)
    return {}

def main():
    if not INPUT_FILE.exists():
        print(f"❌ Fichier introuvable : {INPUT_FILE}")
        sys.exit(1)

    wb = openpyxl.load_workbook(INPUT_FILE, data_only=True)
    ws = wb.active

    headers = [cell.value for cell in next(ws.iter_rows(min_row=1, max_row=1))]
    print(f"Colonnes détectées : {headers}")

    existing = load_existing()
    promesses = []

    for row in ws.iter_rows(min_row=2, values_only=True):
        if not any(row):
            continue
        record = dict(zip(headers, row))
        promesses.append({
            "id":          str(record.get("id", "")),
            "pilier_id":   int(record.get("pilier_id", 0)),
            "titre":       str(record.get("titre", "")),
            "description": str(record.get("description", "") or ""),
            "statut":      str(record.get("statut", "non_commence")),
            "date_statut": str(record.get("date_statut", "") or ""),
            "source_url":  str(record.get("source_url", "") or ""),
            "notes":       str(record.get("notes", "") or ""),
        })

    output = {
        **existing,
        "meta": {
            **existing.get("meta", {}),
            "last_updated": str(date.today()),
            "updated_by": "import_excel.py",
            "total_promesses": len(promesses),
        },
        "promesses": promesses,
    }

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✅ {len(promesses)} promesses exportées → {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
