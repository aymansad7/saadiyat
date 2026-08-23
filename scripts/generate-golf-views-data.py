#!/usr/bin/env python3
"""Generate the Golf Views plot transaction TypeScript dataset from the audit."""

from __future__ import annotations

import json
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = PROJECT_ROOT / "client/src/data/golfViewsPlotData.ts"
AUDIT_PATH = PROJECT_ROOT / "tmp/golf-views-authoritative-audit.json"
OUTPUT_PATH = SOURCE_PATH


def parse_dcr_plots(source: str) -> list[dict]:
    pattern = re.compile(
        r'"(?P<villa_key>golf-views/[^"]+)":\s*\{'
        r'.*?landSqft:\s*(?P<land_sqft>[\d.]+),'
        r'.*?landSqm:\s*(?P<land_sqm>[\d.]+),',
        re.S,
    )
    return [
        {
            "villaKey": match.group("villa_key"),
            "landSqft": float(match.group("land_sqft")),
            "landSqm": float(match.group("land_sqm")),
        }
        for match in pattern.finditer(source)
    ]


def format_number(value: int | float | None) -> str:
    if value is None:
        return "null"
    if isinstance(value, int) or value.is_integer():
        return str(int(value))
    return f"{value:.2f}".rstrip("0").rstrip(".")


def main() -> None:
    source = SOURCE_PATH.read_text(encoding="utf-8")
    plots = parse_dcr_plots(source)
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    plot_lookup = {plot["villaKey"]: plot for plot in plots}
    histories: dict[str, list[dict]] = {}
    seen: set[tuple] = set()
    accepted_rows = [
        row
        for row in audit["allRows"]
        if row["status"] in {"exact", "user-confirmed", "needs-approval"}
    ]
    for row in accepted_rows:
        villa_key = row.get("assignedVillaKey") or row["nearestVillaKey"]
        identity = (
            villa_key,
            row["date"],
            row["priceAed"],
            row["saleType"],
            row["landSqm"],
        )
        if identity in seen:
            continue
        seen.add(identity)
        plot = plot_lookup[villa_key]
        is_possible = (
            row["status"] == "needs-approval"
            and row["priceAed"] == 10_173_628
            and abs(row["landSqm"] - 2845.15) <= 0.01
        )
        confidence = (
            "possible"
            if is_possible
            else "approved"
            if row["status"] == "needs-approval"
            else row["status"]
        )
        histories.setdefault(villa_key, []).append(
            {
                "date": row["date"],
                "priceAed": row["priceAed"],
                "saleType": row["saleType"],
                "builtUpAreaSqm": row.get("builtUpAreaSqm"),
                "builtUpAreaSqft": row.get("builtUpAreaSqft"),
                "ratePerSqft": round(row["priceAed"] / (row.get("builtUpAreaSqft") or plot["landSqft"])),
                "confidence": confidence,
                "areaDifferenceSqm": row["differenceSqm"],
            }
        )

    for transactions in histories.values():
        transactions.sort(key=lambda transaction: (transaction["date"], transaction["priceAed"]))

    final_matched_plot_count = sum(bool(transactions) for transactions in histories.values())

    lines = [
        "/**",
        " * Golf Views Plot Land Areas & Transaction History",
        " * DCR land areas are the authoritative plot identifiers.",
        " * Transactions source: ADREC SDN2 CSV supplied 23 Aug 2026.",
        " * Matching policy: exact matches, approved near matches, and documented unique-nearest user confirmations.",
        f" * Imported: {len(seen)} transactions across {final_matched_plot_count} plots.",
        " * User-confirmed correction: AED 55M resales dated 2024-03-18 and 2024-05-30 belong to Plot 6/6, not Plot 6/11.",
        " * Plot 6/15 transaction dated 2020-06-28 is marked Possible because two DCR plots are close in area.",
        " * User-confirmed unique-nearest matches: AED 76.5M -> Plot 6/14; AED 26M -> Plot 6/26.",
        " */",
        'import type { PlotTransaction } from "@/components/SimplePlotCard";',
        "",
        "export interface GolfViewsPlotData {",
        "  villaKey: string;",
        "  landSqft: number;",
        "  landSqm: number;",
        "  transactions: PlotTransaction[];",
        "}",
        "",
        "/** Map of villaKey -> DCR plot area plus confirmed transaction history. */",
        "export const golfViewsPlotData: Record<string, GolfViewsPlotData> = {",
    ]

    total_primary = 0
    total_secondary = 0
    dates: list[str] = []
    for plot in plots:
        villa_key = plot["villaKey"]
        transactions = histories.get(villa_key, [])
        lines.extend(
            [
                f'  "{villa_key}": {{',
                f'    villaKey: "{villa_key}",',
                f"    landSqft: {format_number(plot['landSqft'])},",
                f"    landSqm: {format_number(plot['landSqm'])},",
                "    transactions: [",
            ]
        )
        for transaction in transactions:
            sale_type = transaction["saleType"]
            total_primary += sale_type == "primary"
            total_secondary += sale_type == "secondary"
            dates.append(transaction["date"])
            lines.append(
                "      { "
                f'date: "{transaction["date"]}", '
                f'priceAed: {transaction["priceAed"]}, '
                f'saleType: "{sale_type}", '
                f'ratePerSqft: {format_number(transaction["ratePerSqft"])}, '
                f'builtUpAreaSqm: {format_number(transaction["builtUpAreaSqm"])}, '
                f'builtUpAreaSqft: {format_number(transaction["builtUpAreaSqft"])}, '
                f'confidence: "{transaction["confidence"]}", '
                f'areaDifferenceSqm: {format_number(transaction["areaDifferenceSqm"])} '
                "},"
            )
        lines.extend(["    ],", "  },"])

    lines.extend(
        [
            "};",
            "",
            "/** Get plot data by villaKey. */",
            "export function getGolfViewsPlot(villaKey: string): GolfViewsPlotData | undefined {",
            "  return golfViewsPlotData[villaKey];",
            "}",
            "",
            "/** Confirmed plot histories for the Golf Views summary table. */",
            "export const golfViewsTransactionRecords = Object.values(golfViewsPlotData)",
            "  .filter((plot) => plot.transactions.length > 0);",
            "",
            "export const GOLF_VIEWS_TRANSACTION_SUMMARY = {",
            f"  totalTransactions: {len(seen)},",
            f"  matchedPlots: {final_matched_plot_count},",
            f"  plotsWithDcrArea: {len(plots)},",
            f"  primaryTransactions: {total_primary},",
            f"  secondaryTransactions: {total_secondary},",
            f'  dateRange: {{ from: "{min(dates)}", to: "{max(dates)}" }},',
            "  possibleTransactions: 1,",
            f"  excludedUnmatchedRows: {audit['statusCounts'].get('not-matched', 0)},",
            '} as const;',
            "",
        ]
    )

    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(
        json.dumps(
            {
                "plotsWithDcrArea": len(plots),
                "matchedPlots": final_matched_plot_count,
                "totalTransactions": len(seen),
                "primaryTransactions": total_primary,
                "secondaryTransactions": total_secondary,
                "dateRange": {"from": min(dates), "to": max(dates)},
                "output": str(OUTPUT_PATH),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
