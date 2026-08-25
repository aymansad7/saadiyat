#!/usr/bin/env python3
"""Audit Reserve Excel rows against the authoritative 306-record registry source."""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INVENTORY_PATH = ROOT / "scripts/source-data/saadiyat-reserve-inventory.json"
CLASSIFIED_PATH = ROOT / "tmp/saadiyat-reserve/plots-classified.csv"
REPORT_PATH = ROOT / "tmp/saadiyat-reserve/inventory-match-audit.md"


def main() -> None:
    inventory = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    with CLASSIFIED_PATH.open(newline="", encoding="utf-8") as handle:
        classified = {int(row["plot_number"]): row for row in csv.DictReader(handle)}

    lines = [
        "# Saadiyat Reserve Inventory Match Audit",
        "",
        "Rows are matched by the explicit Reserve unit/plot number. Land and GFA differences are retained as audit fields; they do not cause area-based reassignment.",
        "",
        "| Excel row | Unit | Registry phase | Excel type | Status | Price | Land delta | GFA delta | Result |",
        "|---:|---:|---:|---|---|---:|---:|---:|---|",
    ]
    available = 0
    sold = 0
    built = 0
    for row in inventory:
        plot = classified.get(row["unitNumber"])
        if plot is None:
            raise RuntimeError(f"Unit {row['unitNumber']} missing from 306-record registry")
        registry_phase = int(plot["phase"])
        if row["sourcePhase"]:
            expected_phase = int(row["sourcePhase"].replace("Phase", "").strip())
            if expected_phase != registry_phase:
                raise RuntimeError(
                    f"Unit {row['unitNumber']} phase mismatch: Excel {expected_phase}, registry {registry_phase}"
                )
        land_delta = round(float(row["landAreaSqm"]) - float(plot["area_sqm"]), 2)
        gfa_delta = None
        if row["builtUpAreaSqm"] is not None:
            gfa_delta = round(float(row["builtUpAreaSqm"]) - float(plot["gfa_sqm"]), 2)
        if abs(land_delta) > 5:
            raise RuntimeError(f"Unit {row['unitNumber']} land delta too large: {land_delta} m²")
        if gfa_delta is not None and abs(gfa_delta) > 5:
            raise RuntimeError(f"Unit {row['unitNumber']} GFA delta too large: {gfa_delta} m²")

        available += row["availability"] == "available_for_sale"
        sold += row["availability"] == "sold"
        built += row["unitType"] == "Standalone Villa"
        lines.append(
            f"| {row['sourceRow']} | {row['unitNumber']} | {registry_phase} | {row['unitType']} | "
            f"{row['availability']} | {row['askingPriceAed'] or '—'} | {land_delta:+.2f} m² | "
            f"{f'{gfa_delta:+.2f} m²' if gfa_delta is not None else '—'} | matched by exact unit number |"
        )

    if (available, sold, built) != (7, 2, 3):
        raise RuntimeError(f"Unexpected counts: available={available}, sold={sold}, built={built}")
    lines.extend(
        [
            "",
            f"**Summary:** {len(inventory)} matched rows; {available} available for sale; {sold} marked sold; {built} Phase 2 built villas.",
            "",
            "Plot 81 has a 3.89 m² difference between the Excel (800.00 m²) and official master plan (796.11 m²). The explicit unit number remains the match key, while both values remain source-traceable.",
        ]
    )
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {REPORT_PATH}")


if __name__ == "__main__":
    main()
