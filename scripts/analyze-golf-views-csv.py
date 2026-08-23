#!/usr/bin/env python3
"""Analyze ADREC SDN2 CSV rows against Golf Views DCR land areas.

This script is intentionally read-only with respect to application source data. It
produces an audit JSON/Markdown report so matches can be reviewed before import.
"""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = Path(
    "/home/ubuntu/upload/"
    "AbuDhabi-Transactions-MasterExport_Column-Project-Nam-"
    "Saadiyat-beach-district_Column-Community-c-Sdn2_Column-"
    "Property-Ty-Vill_2026-08-23.csv"
)
DCR_DATA_PATH = PROJECT_ROOT / "client/src/data/golfViewsPlotData.ts"
OUT_JSON = PROJECT_ROOT / "tmp/golf-views-csv-analysis.json"
OUT_MD = PROJECT_ROOT / "tmp/golf-views-csv-analysis.md"

SQFT_PER_SQM = 10.763910416709722
MAX_MATCH_DIFF_SQM = 10.0
EXACT_MATCH_DIFF_SQM = 0.75
MIN_SECOND_NEAREST_MARGIN_SQM = 3.0


def parse_optional_float(value: str | None) -> float | None:
    if value is None or not value.strip():
        return None
    return float(value.strip())


def parse_dcr_plots(source: str) -> list[dict]:
    block_pattern = re.compile(
        r'"(?P<villa_key>golf-views/[^"]+)":\s*\{'
        r'.*?landSqft:\s*(?P<land_sqft>[\d.]+),'
        r'.*?landSqm:\s*(?P<land_sqm>[\d.]+),',
        re.S,
    )
    plots = []
    for match in block_pattern.finditer(source):
        plots.append(
            {
                "villaKey": match.group("villa_key"),
                "landSqft": float(match.group("land_sqft")),
                "landSqm": float(match.group("land_sqm")),
            }
        )
    return plots


def normalize_row(row: dict[str, str], row_number: int) -> dict:
    land_sqm = parse_optional_float(row.get("Land Plot Ground Area (SQM)"))
    price = parse_optional_float(row.get("Property Sale Price (AED)"))
    sold_sqm = parse_optional_float(row.get("Property Sold Area (SQM)"))
    sequence = (row.get("Sale Sequence") or "").strip().lower()
    sale_type = "primary" if sequence == "primary" else "secondary"
    return {
        "rowNumber": row_number,
        "date": (row.get("Sale Application Date") or "").strip(),
        "project": (row.get("Project Name") or "").strip(),
        "community": (row.get("Community") or "").strip(),
        "propertyType": (row.get("Property Type") or "").strip(),
        "layout": (row.get("Property Layout") or "").strip(),
        "priceAed": int(round(price)) if price is not None else None,
        "soldAreaSqm": sold_sqm,
        "landSqm": land_sqm,
        "landSqft": round(land_sqm * SQFT_PER_SQM, 2) if land_sqm is not None else None,
        "applicationType": (row.get("Sale Application Type") or "").strip().lower(),
        "saleType": sale_type,
        "saleSequenceRaw": sequence,
    }


def match_row(row: dict, plots: list[dict]) -> dict:
    land_sqm = row["landSqm"]
    if land_sqm is None:
        return {**row, "matchStatus": "missing-land-area"}

    ranked = sorted(
        (
            {
                **plot,
                "diffSqm": round(abs(plot["landSqm"] - land_sqm), 4),
                "diffSqft": round(abs(plot["landSqm"] - land_sqm) * SQFT_PER_SQM, 2),
            }
            for plot in plots
        ),
        key=lambda item: item["diffSqm"],
    )
    nearest = ranked[0]
    second = ranked[1] if len(ranked) > 1 else None
    second_margin = (
        round(second["diffSqm"] - nearest["diffSqm"], 4) if second else None
    )

    within_tolerance = nearest["diffSqm"] <= MAX_MATCH_DIFF_SQM
    near_exact = nearest["diffSqm"] <= EXACT_MATCH_DIFF_SQM
    uniquely_closer = second is None or second_margin >= MIN_SECOND_NEAREST_MARGIN_SQM
    status = "matched" if within_tolerance and (near_exact or uniquely_closer) else (
        "ambiguous" if within_tolerance else "unmatched"
    )
    return {
        **row,
        "matchStatus": status,
        "matchedVillaKey": nearest["villaKey"] if status == "matched" else None,
        "matchedDcrLandSqm": nearest["landSqm"] if status == "matched" else None,
        "matchedDcrLandSqft": nearest["landSqft"] if status == "matched" else None,
        "nearestVillaKey": nearest["villaKey"],
        "nearestDiffSqm": nearest["diffSqm"],
        "nearestDiffSqft": nearest["diffSqft"],
        "secondNearestVillaKey": second["villaKey"] if second else None,
        "secondNearestDiffSqm": second["diffSqm"] if second else None,
        "secondNearestMarginSqm": second_margin,
    }


def transaction_identity(row: dict) -> tuple:
    return (
        row["matchedVillaKey"],
        row["date"],
        row["priceAed"],
        row["saleType"],
        row["landSqm"],
    )


def main() -> None:
    plots = parse_dcr_plots(DCR_DATA_PATH.read_text(encoding="utf-8"))
    if not plots:
        raise RuntimeError("No Golf Views DCR plot areas found")

    rows: list[dict] = []
    with CSV_PATH.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        for row_number, raw in enumerate(reader, start=2):
            normalized = normalize_row(raw, row_number)
            rows.append(match_row(normalized, plots))

    matched = [row for row in rows if row["matchStatus"] == "matched"]
    unique_matched: list[dict] = []
    duplicate_rows: list[dict] = []
    seen: set[tuple] = set()
    for row in matched:
        identity = transaction_identity(row)
        if identity in seen:
            duplicate_rows.append(row)
            continue
        seen.add(identity)
        unique_matched.append(row)

    histories: dict[str, list[dict]] = defaultdict(list)
    for row in unique_matched:
        rate_per_sqft = (
            round(row["priceAed"] / row["matchedDcrLandSqft"])
            if row["priceAed"] and row["matchedDcrLandSqft"]
            else None
        )
        histories[row["matchedVillaKey"]].append(
            {
                "date": row["date"],
                "priceAed": row["priceAed"],
                "saleType": row["saleType"],
                "ratePerSqft": rate_per_sqft,
                "sourceRow": row["rowNumber"],
                "csvLandSqm": row["landSqm"],
                "dcrLandSqm": row["matchedDcrLandSqm"],
                "differenceSqm": row["nearestDiffSqm"],
                "propertyType": row["propertyType"],
                "layout": row["layout"],
                "applicationType": row["applicationType"],
            }
        )

    for transactions in histories.values():
        transactions.sort(key=lambda item: (item["date"], item["priceAed"] or 0))

    status_counts = Counter(row["matchStatus"] for row in rows)
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sourceCsv": str(CSV_PATH),
        "matchingRules": {
            "maxDifferenceSqm": MAX_MATCH_DIFF_SQM,
            "nearExactDifferenceSqm": EXACT_MATCH_DIFF_SQM,
            "minimumSecondNearestMarginSqm": MIN_SECOND_NEAREST_MARGIN_SQM,
            "dedupeKey": ["villaKey", "date", "priceAed", "saleType", "landSqm"],
        },
        "dcrPlotCount": len(plots),
        "csvRowCount": len(rows),
        "statusCounts": dict(status_counts),
        "matchedRowCountAfterDedupe": len(unique_matched),
        "duplicateMatchedRowCount": len(duplicate_rows),
        "matchedPlotCount": len(histories),
        "matchedPlotKeys": sorted(histories),
        "projectCounts": dict(Counter(row["project"] for row in rows)),
        "saleTypeCounts": dict(Counter(row["saleType"] for row in rows)),
        "matchedSaleTypeCounts": dict(Counter(row["saleType"] for row in unique_matched)),
        "histories": dict(sorted(histories.items())),
        "unmatchedOrAmbiguous": [
            row for row in rows if row["matchStatus"] != "matched"
        ],
        "duplicateRows": duplicate_rows,
        "allRows": rows,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, indent=2), encoding="utf-8")

    md_lines = [
        "# Golf Views CSV Matching Audit",
        "",
        f"- DCR plots available: **{len(plots)}**",
        f"- CSV rows: **{len(rows)}**",
        f"- Matched rows: **{status_counts.get('matched', 0)}**",
        f"- Matched rows after dedupe: **{len(unique_matched)}**",
        f"- Matched plots: **{len(histories)}**",
        f"- Ambiguous rows: **{status_counts.get('ambiguous', 0)}**",
        f"- Unmatched rows: **{status_counts.get('unmatched', 0)}**",
        f"- Missing land area: **{status_counts.get('missing-land-area', 0)}**",
        "",
        "## Matched plots",
        "",
        "| Plot | DCR land sqm | Sales | Primary | Secondary | Latest date | Latest price |",
        "| --- | ---: | ---: | ---: | ---: | --- | ---: |",
    ]
    plot_lookup = {plot["villaKey"]: plot for plot in plots}
    for villa_key, transactions in sorted(histories.items()):
        latest = transactions[-1]
        primary_count = sum(tx["saleType"] == "primary" for tx in transactions)
        secondary_count = sum(tx["saleType"] == "secondary" for tx in transactions)
        md_lines.append(
            f"| `{villa_key}` | {plot_lookup[villa_key]['landSqm']:.2f} | "
            f"{len(transactions)} | {primary_count} | {secondary_count} | "
            f"{latest['date']} | {latest['priceAed']:,} |"
        )

    md_lines.extend(["", "## Unmatched or ambiguous rows", ""])
    md_lines.append(
        "| Row | Date | Land sqm | Price | Status | Nearest plot | Difference sqm | Second margin sqm |"
    )
    md_lines.append("| ---: | --- | ---: | ---: | --- | --- | ---: | ---: |")
    for row in report["unmatchedOrAmbiguous"]:
        md_lines.append(
            f"| {row['rowNumber']} | {row['date']} | {row['landSqm'] or ''} | "
            f"{row['priceAed'] or ''} | {row['matchStatus']} | "
            f"`{row.get('nearestVillaKey', '')}` | {row.get('nearestDiffSqm', '')} | "
            f"{row.get('secondNearestMarginSqm', '')} |"
        )
    OUT_MD.write_text("\n".join(md_lines) + "\n", encoding="utf-8")

    print(json.dumps({key: report[key] for key in [
        "dcrPlotCount",
        "csvRowCount",
        "statusCounts",
        "matchedRowCountAfterDedupe",
        "duplicateMatchedRowCount",
        "matchedPlotCount",
        "saleTypeCounts",
        "matchedSaleTypeCounts",
    ]}, indent=2))
    print(f"Audit JSON: {OUT_JSON}")
    print(f"Audit Markdown: {OUT_MD}")


if __name__ == "__main__":
    main()
