#!/usr/bin/env python3
"""Generate a typed Four Seasons inventory snapshot from an Alain Explore workbook.

The input is a point-in-time, owner-supplied XLSX export. Only records with
Project_Key=four_seasons and Is_Test_Record=false are emitted. Public price is
purposefully preserved as null when the source does not publish one.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from openpyxl import load_workbook

SOURCE = Path("/home/ubuntu/upload/ALAIN_Explore_All_Projects_20261009_150047.xlsx")
OUTPUT = Path("/home/ubuntu/saadiyat/client/src/data/fourSeasonsAlainExplore.ts")
PROJECT_KEY = "four_seasons"
SQFT_PER_SQM = 10.7639104167097


def number(value: Any) -> float | None:
    return float(value) if isinstance(value, (int, float)) else None


def source_type_label(value: str | None) -> str:
    labels = {
        "2BR_Apartment": "2 Bedroom Apartment",
        "3BR_Apartment": "3 Bedroom Apartment",
        "4BR_Duplex": "4 Bedroom Duplex",
        "4BR_Simplex": "4 Bedroom Simplex",
        "5BR_Penthouse": "5 Bedroom Penthouse",
        "5BR": "5 Bedroom Villa",
        "5BR_Plus": "5 Bedroom Plus Villa",
        "6BR_A": "6 Bedroom Villa · Type A",
        "6BR_B": "6 Bedroom Villa · Type B",
        "7BR_A": "7 Bedroom Villa · Type A",
        "7BR_B": "7 Bedroom Villa · Type B",
    }
    return labels.get(value or "", (value or "Unclassified").replace("_", " "))


def value_or_none(value: Any) -> str | None:
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def js(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def main() -> None:
    workbook = load_workbook(SOURCE, read_only=True, data_only=True)
    worksheet = workbook["Four_Seasons"]
    rows = worksheet.iter_rows(values_only=True)
    header = next(rows)
    records = [dict(zip(header, row)) for row in rows]

    units: list[dict[str, Any]] = []
    source_fetched_at: str | None = None
    for record in records:
        if record.get("Project_Key") != PROJECT_KEY or record.get("Is_Test_Record") is True:
            continue
        category = value_or_none(record.get("Category_Map"))
        unit_number = value_or_none(record.get("Unit_Number_API"))
        unit_code = value_or_none(record.get("Unit_Code_Map"))
        status = value_or_none(record.get("Status_Live_API"))
        if category not in {"villa", "apartment"} or not unit_number or not unit_code or not status:
            raise ValueError(f"Malformed commercial Four Seasons row: {record!r}")
        fetched_at = value_or_none(record.get("Fetched_At_UAE"))
        if source_fetched_at is None:
            source_fetched_at = fetched_at
        elif source_fetched_at != fetched_at:
            raise ValueError("Expected one consistent Four Seasons source fetch timestamp")

        saleable_sqm = number(record.get("Total_Saleable_Area_API_m2"))
        internal_sqm = number(record.get("Internal_Area_API_m2"))
        balcony_sqm = number(record.get("Balcony_Area_API_m2"))
        unit = {
            "unitKey": f"four-seasons/{'villa' if category == 'villa' else 'apartment'}-{unit_number.lower()}",
            "unitNumber": unit_number,
            "unitCode": unit_code,
            "category": category,
            "sourceStatus": status,
            "availableFromSource": record.get("Available_Live_API") is True,
            "bedrooms": int(record["Bedrooms_Map"]) if isinstance(record.get("Bedrooms_Map"), (int, float)) else None,
            "sourceType": value_or_none(record.get("Type_Map")),
            "displayType": source_type_label(value_or_none(record.get("Type_Map"))),
            "tower": int(record["Tower_Map"]) if isinstance(record.get("Tower_Map"), (int, float)) else None,
            "floor": value_or_none(record.get("Floor_Map")),
            "saleableAreaSqm": saleable_sqm,
            "saleableAreaSqft": round(saleable_sqm * SQFT_PER_SQM, 2) if saleable_sqm is not None else None,
            "internalAreaSqm": internal_sqm,
            "internalAreaSqft": round(internal_sqm * SQFT_PER_SQM, 2) if internal_sqm is not None else None,
            "balconyAreaSqm": balcony_sqm,
            "balconyAreaSqft": round(balcony_sqm * SQFT_PER_SQM, 2) if balcony_sqm is not None else None,
            "priceAed": number(record.get("Price_AED")),
            "pricePublication": value_or_none(record.get("Price_Publication")),
        }
        units.append(unit)

    units.sort(key=lambda item: (item["category"], (0, int(item["unitNumber"])) if item["unitNumber"].isdigit() else (1, item["unitNumber"])))
    villas = [unit for unit in units if unit["category"] == "villa"]
    apartments = [unit for unit in units if unit["category"] == "apartment"]

    def status_counts(items: list[dict[str, Any]]) -> dict[str, int]:
        output: dict[str, int] = {}
        for item in items:
            output[item["sourceStatus"]] = output.get(item["sourceStatus"], 0) + 1
        return dict(sorted(output.items()))

    metadata = {
        "sourceFilename": SOURCE.name,
        "project": "Four Seasons Private Residences Abu Dhabi at Saadiyat Beach",
        "projectKey": PROJECT_KEY,
        "sourceFetchedAtUae": source_fetched_at,
        "sourceUrl": "https://explore.alainam.ae/api/units?project_key=four_seasons",
        "sourceNotes": "Owner-supplied Alain Explore export. Status_Live_API is the source status. No public price field was provided for any commercial Four Seasons record.",
        "commercialUnitCount": len(units),
        "villaCount": len(villas),
        "apartmentCount": len(apartments),
        "statusCounts": status_counts(units),
        "villaStatusCounts": status_counts(villas),
        "apartmentStatusCounts": status_counts(apartments),
    }

    source_text = f'''/**
 * Four Seasons Private Residences — Alain Explore source snapshot.
 *
 * Generated from {SOURCE.name}, supplied by the project owner.
 * The source fetch was {source_fetched_at} and has no published public price for
 * any commercial Four Seasons unit. `sourceStatus` is deliberately separate from
 * NAS resale-listing status and municipal transaction history.
 */

export type FourSeasonsAlainSourceStatus = "Available" | "Blocked" | "Booked" | "Reserved" | "Sold";
export type FourSeasonsAlainUnitCategory = "villa" | "apartment";

export type FourSeasonsAlainUnit = {{
  unitKey: string;
  unitNumber: string;
  unitCode: string;
  category: FourSeasonsAlainUnitCategory;
  sourceStatus: FourSeasonsAlainSourceStatus;
  availableFromSource: boolean;
  bedrooms: number | null;
  sourceType: string | null;
  displayType: string;
  tower: number | null;
  floor: string | null;
  saleableAreaSqm: number | null;
  saleableAreaSqft: number | null;
  internalAreaSqm: number | null;
  internalAreaSqft: number | null;
  balconyAreaSqm: number | null;
  balconyAreaSqft: number | null;
  priceAed: number | null;
  pricePublication: string | null;
}};

export const FOUR_SEASONS_ALAIN_SNAPSHOT = {js(metadata)} as const;

export const FOUR_SEASONS_ALAIN_UNITS = {js(units)} as const satisfies readonly FourSeasonsAlainUnit[];

export const FOUR_SEASONS_ALAIN_VILLAS = FOUR_SEASONS_ALAIN_UNITS.filter(
  (unit) => unit.category === "villa",
);

export const FOUR_SEASONS_ALAIN_APARTMENTS = FOUR_SEASONS_ALAIN_UNITS.filter(
  (unit) => unit.category === "apartment",
);

export const FOUR_SEASONS_ALAIN_VILLA_BY_NUMBER = new Map(
  FOUR_SEASONS_ALAIN_VILLAS.map((unit) => [Number(unit.unitNumber), unit] as const),
);
'''
    OUTPUT.write_text(source_text, encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
