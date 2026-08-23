#!/usr/bin/env python3
"""Generate a typed pending Four Seasons transaction registry from the ADREC CSV."""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    "/home/ubuntu/upload/AbuDhabi-Transactions-MasterExport_Column-Project-Nam-four_Column-Property-Ty-v_2026-08-23.csv"
)
OUTPUT = ROOT / "client/src/data/fourSeasonsPendingTransactions.ts"


def number(value: str) -> float:
    return float(value.strip()) if value.strip() else 0.0


def main() -> None:
    records: list[dict] = []
    with SOURCE.open(encoding="utf-8-sig", newline="") as handle:
        for row_number, row in enumerate(csv.DictReader(handle), start=2):
            records.append(
                {
                    "id": f"four-seasons-pending-row-{row_number}",
                    "sourceRow": row_number,
                    "date": row["Sale Application Date"].strip(),
                    "assetClass": row["Asset Class"].strip(),
                    "propertyType": row["Property Type"].strip(),
                    "layout": row["Property Layout"].strip(),
                    "district": row["District"].strip(),
                    "community": row["Community"].strip(),
                    "projectName": row["Project Name"].strip(),
                    "priceAed": number(row["Property Sale Price (AED)"]),
                    "builtUpAreaSqm": number(row["Property Sold Area (SQM)"]),
                    "rateAedPerSqm": number(row["Rate (AED per SQM)"]),
                    "landAreaSqm": number(row["Land Plot Ground Area (SQM)"]),
                    "saleApplicationType": row["Sale Application Type"].strip(),
                    "saleSequence": row["Sale Sequence"].strip(),
                    "matchStatus": "pending_land_match",
                    "matchedVillaKey": None,
                }
            )

    serialized = json.dumps(records, indent=2, ensure_ascii=False)
    contents = f'''/**
 * Four Seasons municipal transaction registry.
 * Source: {SOURCE.name}
 * Imported: 2026-08-23
 *
 * These records remain intentionally unmatched until the user supplies the
 * official plot/villa list and areas. Do not infer unit assignments.
 */
export type FourSeasonsPendingTransaction = {{
  id: string;
  sourceRow: number;
  date: string;
  assetClass: string;
  propertyType: string;
  layout: string;
  district: string;
  community: string;
  projectName: string;
  priceAed: number;
  builtUpAreaSqm: number;
  rateAedPerSqm: number;
  landAreaSqm: number;
  saleApplicationType: string;
  saleSequence: string;
  matchStatus: "pending_land_match";
  matchedVillaKey: null;
}};

export const FOUR_SEASONS_PENDING_TRANSACTIONS = {serialized} as const satisfies readonly FourSeasonsPendingTransaction[];

export const FOUR_SEASONS_PENDING_SUMMARY = {{
  recordCount: FOUR_SEASONS_PENDING_TRANSACTIONS.length,
  latestDate: FOUR_SEASONS_PENDING_TRANSACTIONS[0]?.date ?? null,
  totalValueAed: FOUR_SEASONS_PENDING_TRANSACTIONS.reduce((sum, record) => sum + record.priceAed, 0),
  status: "pending_land_match" as const,
}};
'''
    OUTPUT.write_text(contents, encoding="utf-8")
    print(f"Generated {{len(records)}} pending Four Seasons transactions → {{OUTPUT}}")


if __name__ == "__main__":
    main()
