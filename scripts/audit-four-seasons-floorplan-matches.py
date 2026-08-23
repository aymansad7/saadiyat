#!/usr/bin/env python3
"""Audit Four Seasons municipal land areas against supplied developer floorplans.

This script reports candidates only. It never writes assignments. Confirmed records
remain explicit in client/src/data/fourSeasonsTransactions.ts so user confirmation
and ambiguity decisions stay reviewable.
"""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PENDING_FILE = ROOT / "client/src/data/fourSeasonsPendingTransactions.ts"
OUTPUT_FILE = ROOT / "tmp/four-seasons-floorplan-match-audit.md"
SQFT_PER_SQM = 10.764
LAND_TOLERANCE_SQM = 10.0
SELLABLE_TOLERANCE_SQM = 20.0


# Values printed in the developer Floorplan PDFs supplied on 23 Aug 2026.
# "sellable_sqft" is deliberately not called BUA because the documents label it
# SELLABLE AREA. It is used only as a secondary compatibility check.
FLOORPLANS = {
    12: {"bedrooms": 6, "plot_sqft": 17236, "sellable_sqft": 22718},
    13: {"bedrooms": 6, "plot_sqft": 16985, "sellable_sqft": 22718},
    14: {"bedrooms": 5, "plot_sqft": 14116, "sellable_sqft": 19123},
    15: {"bedrooms": 5, "plot_sqft": 15044, "sellable_sqft": 19123},
    16: {"bedrooms": 5, "plot_sqft": 14363, "sellable_sqft": 19123},
    20: {"bedrooms": 5, "plot_sqft": 13226, "sellable_sqft": 17451},
    21: {"bedrooms": 5, "plot_sqft": 13938, "sellable_sqft": 17451},
    25: {"bedrooms": 6, "plot_sqft": 17818, "sellable_sqft": 22718},
    27: {"bedrooms": 6, "plot_sqft": 17942, "sellable_sqft": 22718},
    29: {"bedrooms": 6, "plot_sqft": 18976, "sellable_sqft": 22718},
    31: {"bedrooms": 6, "plot_sqft": 19762, "sellable_sqft": 22718},
    33: {"bedrooms": 6, "plot_sqft": 16840, "sellable_sqft": 22718},
    37: {"bedrooms": 5, "plot_sqft": 13318, "sellable_sqft": 17451},
    38: {"bedrooms": 5, "plot_sqft": 13662, "sellable_sqft": 17451},
    39: {"bedrooms": 5, "plot_sqft": 16222, "sellable_sqft": 17451},
    40: {"bedrooms": 5, "plot_sqft": 13709, "sellable_sqft": 17451},
    43: {"bedrooms": 5, "plot_sqft": 13325, "sellable_sqft": 17451},
    44: {"bedrooms": 5, "plot_sqft": 13195, "sellable_sqft": 17451},
    48: {"bedrooms": 6, "plot_sqft": 20508, "sellable_sqft": 20008},
    50: {"bedrooms": 6, "plot_sqft": 18565, "sellable_sqft": 20008},
}


TX_PATTERN = re.compile(
    r'"sourceRow": (?P<source_row>\d+),.*?'
    r'"date": "(?P<date>[^"]+)",.*?'
    r'"layout": "(?P<layout>[^"]+)",.*?'
    r'"priceAed": (?P<price>[\d.]+),.*?'
    r'"builtUpAreaSqm": (?P<bua>[\d.]+),.*?'
    r'"landAreaSqm": (?P<land>[\d.]+),',
    re.DOTALL,
)


def layout_compatible(layout: str, bedrooms: int) -> bool:
    if layout == "5 beds":
        return bedrooms == 5
    if layout == "6+ beds":
        return bedrooms >= 6
    return False


def main() -> None:
    source = PENDING_FILE.read_text(encoding="utf-8")
    transactions = [
        {
            "source_row": int(match.group("source_row")),
            "date": match.group("date"),
            "layout": match.group("layout"),
            "price": float(match.group("price")),
            "bua": float(match.group("bua")),
            "land": float(match.group("land")),
        }
        for match in TX_PATTERN.finditer(source)
    ]

    lines = [
        "# Four Seasons Floorplan-to-Municipal Match Audit",
        "",
        f"Tolerance: land ≤ {LAND_TOLERANCE_SQM:.0f} m²; sellable/BUA secondary check ≤ {SELLABLE_TOLERANCE_SQM:.0f} m².",
        "The developer documents label the internal total as **Sellable Area**, not municipal BUA.",
        "",
        "| Source row | Date | Layout | Land m² | Price AED | Candidate | Plot m² | Land Δ | Sellable Δ | Classification |",
        "| ---: | --- | --- | ---: | ---: | --- | ---: | ---: | ---: | --- |",
    ]

    for tx in transactions:
        candidates = []
        for villa_number, details in FLOORPLANS.items():
            if not layout_compatible(tx["layout"], details["bedrooms"]):
                continue
            plot_sqm = details["plot_sqft"] / SQFT_PER_SQM
            sellable_sqm = details["sellable_sqft"] / SQFT_PER_SQM
            land_delta = abs(tx["land"] - plot_sqm)
            sellable_delta = abs(tx["bua"] - sellable_sqm)
            if land_delta <= LAND_TOLERANCE_SQM:
                classification = "compatible" if sellable_delta <= SELLABLE_TOLERANCE_SQM else "BUA incompatible"
                candidates.append((villa_number, plot_sqm, land_delta, sellable_delta, classification))

        if not candidates:
            lines.append(
                f'| {tx["source_row"]} | {tx["date"]} | {tx["layout"]} | {tx["land"]:.2f} | {tx["price"]:,.0f} | — | — | — | — | no supplied-floorplan candidate |'
            )
            continue

        for index, (villa_number, plot_sqm, land_delta, sellable_delta, classification) in enumerate(candidates):
            prefix = (
                f'| {tx["source_row"]} | {tx["date"]} | {tx["layout"]} | {tx["land"]:.2f} | {tx["price"]:,.0f}'
                if index == 0
                else "|  |  |  |  | "
            )
            lines.append(
                f"{prefix} | Villa {villa_number} | {plot_sqm:.2f} | {land_delta:.2f} | {sellable_delta:.2f} | {classification} |"
            )

    lines.extend(
        [
            "",
            "## Explicit decisions",
            "",
            "- Villa 9 / row 2 is user-confirmed; it does not rely on floorplan-area matching.",
            "- Rows with repeated 1,176.03 m² land remain pending because the area is not transaction-unique.",
            "- A compatible candidate is not automatically a confirmed match. Multiple candidates, reused areas, or material deltas remain pending/possible.",
        ]
    )
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_FILE} with {len(transactions)} municipal rows")


if __name__ == "__main__":
    main()
