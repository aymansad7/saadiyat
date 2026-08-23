#!/usr/bin/env python3
"""Audit Golf Views DCR plots that have no confirmed transaction history."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "client/src/data/golfViewsPlotData.ts"
AUDIT_FILE = ROOT / "tmp/golf-views-csv-analysis.json"
REPORT_FILE = ROOT / "tmp/golf-views-unmatched-plots.md"


def read_plots() -> list[dict]:
    source = DATA_FILE.read_text(encoding="utf-8")
    pattern = re.compile(
        r'"(?P<key>golf-views/[^"]+)":\s*\{.*?'
        r'landSqft:\s*(?P<sqft>[\d.]+),.*?'
        r'landSqm:\s*(?P<sqm>[\d.]+),.*?'
        r'transactions:\s*\[(?P<transactions>.*?)\]',
        re.S,
    )
    return [
        {
            "villaKey": match.group("key"),
            "landSqft": float(match.group("sqft")),
            "landSqm": float(match.group("sqm")),
            "hasTransactions": "priceAed" in match.group("transactions"),
        }
        for match in pattern.finditer(source)
    ]


def main() -> None:
    plots = read_plots()
    audit = json.loads(AUDIT_FILE.read_text(encoding="utf-8"))
    eligible_rows = [
        row
        for row in audit["allRows"]
        if row["project"] == "Saadiyat Beach District (Plots)"
        and row["community"].upper() == "SDN2"
        and row["landSqm"] > 0
    ]

    missing = [plot for plot in plots if not plot["hasTransactions"]]
    lines = [
        "# Golf Views plots without a confirmed transaction",
        "",
        "The table compares each DCR area with the nearest unassigned or ambiguous rows from the supplied SDN2 CSV. A row remains excluded when the area difference is not near-exact or when the row already belongs more closely to another unique DCR plot.",
        "",
        "| Plot | DCR m² | Nearest CSV m² | Difference m² | CSV status | Date | Price AED |",
        "| --- | ---: | ---: | ---: | --- | --- | ---: |",
    ]

    for plot in missing:
        candidates = sorted(
            eligible_rows,
            key=lambda row: abs(row["landSqm"] - plot["landSqm"]),
        )
        candidate = candidates[0]
        lines.append(
            "| {plot} | {dcr:.2f} | {csv:.2f} | {diff:.2f} | {status} | {date} | {price:,} |".format(
                plot=plot["villaKey"].split("/")[-1],
                dcr=plot["landSqm"],
                csv=candidate["landSqm"],
                diff=abs(candidate["landSqm"] - plot["landSqm"]),
                status=candidate["matchStatus"],
                date=candidate["date"],
                price=candidate["priceAed"],
            )
        )

    REPORT_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "plotsWithDcrArea": len(plots),
                "plotsWithConfirmedHistory": len(plots) - len(missing),
                "plotsWithoutConfirmedHistory": len(missing),
                "missingVillaKeys": [plot["villaKey"] for plot in missing],
                "report": str(REPORT_FILE),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
