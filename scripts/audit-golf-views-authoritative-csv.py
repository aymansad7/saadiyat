#!/usr/bin/env python3
"""Audit the authoritative ADREC Golf Views CSV against DCR land areas.

Only near-exact rows (<= 0.75 m²) are automatically accepted. Rows with a
difference up to 10 m² are held for explicit user approval. User-confirmed
unique-nearest exceptions are assigned explicitly and retain their area delta.
"""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = Path(
    "/home/ubuntu/upload/"
    "AbuDhabi-Transactions-MasterExport_Land-1-993-sqm_Column-Project-Nam-"
    "saadiyat-beach-d_Column-Community-c-sdn2_Column-Property-Ty-villa_2026-08-23.csv"
)
DCR_PATH = ROOT / "client/src/data/golfViewsPlotData.ts"
OUT_JSON = ROOT / "tmp/golf-views-authoritative-audit.json"
OUT_MD = ROOT / "tmp/golf-views-authoritative-audit.md"

SQFT_PER_SQM = 10.764
EXACT_TOLERANCE_SQM = 0.75
REVIEW_TOLERANCE_SQM = 10.0
CONFIRMED_55M_PLOT = "golf-views/SDN2_6_6"
CONFIRMED_UNIQUE_NEAREST = {
    ("2025-11-28", 76_500_000): "golf-views/SDN2_6_14",
    ("2025-11-14", 26_000_000): "golf-views/SDN2_6_26",
}


def optional_float(value: str | None) -> float | None:
    if not value or not value.strip():
        return None
    return float(value)


def dcr_plots() -> list[dict]:
    source = DCR_PATH.read_text(encoding="utf-8")
    pattern = re.compile(
        r'"(?P<key>golf-views/[^"]+)":\s*\{.*?'
        r'landSqft:\s*(?P<sqft>[\d.]+),.*?'
        r'landSqm:\s*(?P<sqm>[\d.]+),',
        re.S,
    )
    return [
        {
            "villaKey": match.group("key"),
            "landSqft": float(match.group("sqft")),
            "landSqm": float(match.group("sqm")),
        }
        for match in pattern.finditer(source)
    ]


def classify(raw: dict[str, str], row_number: int, plots: list[dict]) -> dict:
    land_sqm = optional_float(raw.get("Land Plot Ground Area (SQM)"))
    built_up_sqm = optional_float(raw.get("Property Sold Area (SQM)"))
    price = optional_float(raw.get("Property Sale Price (AED)"))
    sale_sequence = (raw.get("Sale Sequence") or "").strip().lower()
    base = {
        "rowNumber": row_number,
        "date": (raw.get("Sale Application Date") or "").strip(),
        "project": (raw.get("Project Name") or "").strip(),
        "community": (raw.get("Community") or "").strip(),
        "layout": (raw.get("Property Layout") or "").strip(),
        "priceAed": int(round(price)) if price is not None else None,
        "landSqm": land_sqm,
        "landSqft": round(land_sqm * SQFT_PER_SQM, 2) if land_sqm else None,
        "builtUpAreaSqm": built_up_sqm,
        "builtUpAreaSqft": round(built_up_sqm * SQFT_PER_SQM, 2) if built_up_sqm else None,
        "saleType": "primary" if sale_sequence == "primary" else "secondary",
        "applicationType": (raw.get("Sale Application Type") or "").strip().lower(),
    }
    if land_sqm is None:
        return {**base, "status": "missing-land-area"}

    ranked = sorted(
        [
            {
                **plot,
                "differenceSqm": round(abs(plot["landSqm"] - land_sqm), 4),
            }
            for plot in plots
        ],
        key=lambda plot: plot["differenceSqm"],
    )
    nearest = ranked[0]
    second = ranked[1]

    if base["priceAed"] == 55_000_000 and abs(land_sqm - 2345.6) <= 0.01:
        assigned = next(plot for plot in plots if plot["villaKey"] == CONFIRMED_55M_PLOT)
        return {
            **base,
            "status": "user-confirmed",
            "assignedVillaKey": assigned["villaKey"],
            "assignedDcrLandSqm": assigned["landSqm"],
            "differenceSqm": round(abs(assigned["landSqm"] - land_sqm), 4),
            "nearestVillaKey": nearest["villaKey"],
            "nearestDifferenceSqm": nearest["differenceSqm"],
            "secondNearestVillaKey": second["villaKey"],
            "secondNearestDifferenceSqm": second["differenceSqm"],
        }

    override_key = CONFIRMED_UNIQUE_NEAREST.get((base["date"], base["priceAed"]))
    if override_key:
        assigned = next(plot for plot in plots if plot["villaKey"] == override_key)
        return {
            **base,
            "status": "user-confirmed",
            "assignedVillaKey": assigned["villaKey"],
            "assignedDcrLandSqm": assigned["landSqm"],
            "differenceSqm": round(abs(assigned["landSqm"] - land_sqm), 4),
            "nearestVillaKey": nearest["villaKey"],
            "nearestDifferenceSqm": nearest["differenceSqm"],
            "secondNearestVillaKey": second["villaKey"],
            "secondNearestDifferenceSqm": second["differenceSqm"],
        }

    if nearest["differenceSqm"] <= EXACT_TOLERANCE_SQM:
        status = "exact"
        assigned_key = nearest["villaKey"]
    elif nearest["differenceSqm"] <= REVIEW_TOLERANCE_SQM:
        status = "needs-approval"
        assigned_key = None
    else:
        status = "not-matched"
        assigned_key = None

    return {
        **base,
        "status": status,
        "assignedVillaKey": assigned_key,
        "assignedDcrLandSqm": nearest["landSqm"] if assigned_key else None,
        "differenceSqm": nearest["differenceSqm"],
        "nearestVillaKey": nearest["villaKey"],
        "nearestDifferenceSqm": nearest["differenceSqm"],
        "secondNearestVillaKey": second["villaKey"],
        "secondNearestDifferenceSqm": second["differenceSqm"],
    }


def main() -> None:
    plots = dcr_plots()
    rows: list[dict] = []
    with CSV_PATH.open(newline="", encoding="utf-8-sig") as handle:
        for row_number, raw in enumerate(csv.DictReader(handle), start=2):
            rows.append(classify(raw, row_number, plots))

    accepted = [row for row in rows if row["status"] in {"exact", "user-confirmed"}]
    reviews = [row for row in rows if row["status"] == "needs-approval"]
    histories: dict[str, list[dict]] = defaultdict(list)
    seen: set[tuple] = set()
    for row in accepted:
        identity = (
            row["assignedVillaKey"],
            row["date"],
            row["priceAed"],
            row["saleType"],
            row["landSqm"],
        )
        if identity in seen:
            continue
        seen.add(identity)
        dcr_plot = next(plot for plot in plots if plot["villaKey"] == row["assignedVillaKey"])
        histories[row["assignedVillaKey"]].append(
            {
                "date": row["date"],
                "priceAed": row["priceAed"],
                "saleType": row["saleType"],
                "ratePerSqft": round(row["priceAed"] / dcr_plot["landSqft"]),
                "sourceRow": row["rowNumber"],
                "csvLandSqm": row["landSqm"],
                "dcrLandSqm": dcr_plot["landSqm"],
                "differenceSqm": row["differenceSqm"],
                "builtUpAreaSqm": row["builtUpAreaSqm"],
                "builtUpAreaSqft": row["builtUpAreaSqft"],
                "matchStatus": row["status"],
            }
        )
    for transactions in histories.values():
        transactions.sort(key=lambda transaction: transaction["date"])

    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sourceCsv": str(CSV_PATH),
        "policy": {
            "exactToleranceSqm": EXACT_TOLERANCE_SQM,
            "reviewToleranceSqm": REVIEW_TOLERANCE_SQM,
            "defaultAreaUnit": "sqm",
            "sqftPerSqm": SQFT_PER_SQM,
        },
        "dcrPlotCount": len(plots),
        "csvRowCount": len(rows),
        "statusCounts": dict(Counter(row["status"] for row in rows)),
        "acceptedRowCount": len(accepted),
        "acceptedPlotCount": len(histories),
        "acceptedPlotKeys": sorted(histories),
        "histories": dict(sorted(histories.items())),
        "needsApproval": reviews,
        "notMatched": [row for row in rows if row["status"] == "not-matched"],
        "allRows": rows,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, indent=2), encoding="utf-8")

    lines = [
        "# Authoritative Golf Views CSV audit",
        "",
        f"- CSV rows: **{len(rows)}**",
        f"- Automatically accepted exact rows: **{sum(row['status'] == 'exact' for row in rows)}**",
        f"- User-confirmed AED 55M rows assigned to Plot 6/6: **{sum(row['status'] == 'user-confirmed' for row in rows)}**",
        f"- Rows requiring approval (difference >0.75 and <=10 m²): **{len(reviews)}**",
        f"- Rows not matched (>10 m²): **{sum(row['status'] == 'not-matched' for row in rows)}**",
        "",
        "## Requires user approval",
        "",
        "| Row | Date | Price AED | CSV m² | Candidate plot | DCR m² | Difference m² | Second candidate | Second diff m² |",
        "| ---: | --- | ---: | ---: | --- | ---: | ---: | --- | ---: |",
    ]
    for row in reviews:
        candidate = next(plot for plot in plots if plot["villaKey"] == row["nearestVillaKey"])
        lines.append(
            f"| {row['rowNumber']} | {row['date']} | {row['priceAed']:,} | {row['landSqm']:.2f} | "
            f"`{row['nearestVillaKey']}` | {candidate['landSqm']:.2f} | {row['nearestDifferenceSqm']:.2f} | "
            f"`{row['secondNearestVillaKey']}` | {row['secondNearestDifferenceSqm']:.2f} |"
        )
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "csvRows": len(rows),
                "statusCounts": report["statusCounts"],
                "acceptedPlots": len(histories),
                "needsApproval": len(reviews),
                "auditMarkdown": str(OUT_MD),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
