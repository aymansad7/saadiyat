#!/usr/bin/env python3
"""Generate the authoritative Saadiyat Reserve + Dunes frontend registry."""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CLASSIFIED_PATH = ROOT / "tmp/saadiyat-reserve/plots-classified.csv"
DUNES_OFFICIAL_PATH = Path("/home/ubuntu/extract_dunes_official_units.csv")
ALDAR_PATH = ROOT / "server/data/aldar_saadiyat.json"
SALE_INVENTORY_PATH = ROOT / "scripts/source-data/saadiyat-reserve-inventory.json"
OUTPUT_PATH = ROOT / "client/src/data/saadiyatReserve.ts"

MASTERPLAN_PDF_URL = "/manus-storage/SaadiyatReservePlotsMasterplan_4bb2d343.pdf"
MASTERPLAN_IMAGE_URL = "/manus-storage/SaadiyatReservePlotsMasterplan_4c506cd8.png"
PAGE_WIDTH = 1190.2393798828125
PAGE_HEIGHT = 841.492919921875
SQFT_PER_SQM = 10.764


def numeric(value: str | None):
    if value is None or value == "":
        return None
    number = float(value)
    return int(number) if number.is_integer() else round(number, 2)


def main() -> None:
    with CLASSIFIED_PATH.open(newline="", encoding="utf-8") as handle:
        classified = list(csv.DictReader(handle))
    with DUNES_OFFICIAL_PATH.open(newline="", encoding="utf-8") as handle:
        dunes_rows = list(csv.DictReader(handle))
    aldar = json.loads(ALDAR_PATH.read_text(encoding="utf-8"))
    sale_inventory = json.loads(SALE_INVENTORY_PATH.read_text(encoding="utf-8"))
    dunes_project = next(project for project in aldar["projects"] if project["slug"] == "saadiyat-reserve-the-dunes")
    dunes_building = dunes_project["buildings"][0]

    official_by_plot = {
        int(row["Plot Number"]): row
        for row in dunes_rows
        if row["Found"].lower() == "true"
    }
    aldar_by_plot = {
        int(unit["unit_name"].rsplit("-", 1)[-1]): unit
        for unit in dunes_building["units"]
    }
    sale_by_plot = {int(row["unitNumber"]): row for row in sale_inventory}

    records = []
    for row in classified:
        plot_number = int(row["plot_number"])
        phase = int(row["phase"])
        is_dunes = phase == 3
        official = official_by_plot.get(plot_number)
        aldar_unit = aldar_by_plot.get(plot_number)
        sale = sale_by_plot.get(plot_number)
        if is_dunes and (official is None or aldar_unit is None):
            raise RuntimeError(f"Dunes Plot {plot_number} missing official or existing Aldar data")
        if not is_dunes and (official is not None or aldar_unit is not None):
            raise RuntimeError(f"Reserve land Plot {plot_number} unexpectedly has Dunes unit data")

        plot_area_sqm = numeric(row["area_sqm"])
        gfa_sqm = numeric(row["gfa_sqm"])
        unit_name = aldar_unit["unit_name"] if aldar_unit else None
        is_reserve_built_villa = bool(sale and sale["unitType"] == "Standalone Villa")
        inventory_kind = (
            "dunes_built_villa"
            if is_dunes
            else "reserve_built_villa"
            if is_reserve_built_villa
            else "reserve_land"
        )
        records.append(
            {
                "plotNumber": plot_number,
                "label": (
                    f"Villa {plot_number:03d}-01"
                    if is_dunes
                    else f"Villa {plot_number}"
                    if is_reserve_built_villa
                    else f"Plot {plot_number}"
                ),
                "phase": phase,
                "inventoryKind": inventory_kind,
                "villaKey": (
                    f"saadiyat-reserve-the-dunes/villa-{plot_number}"
                    if is_dunes
                    else f"saadiyat-reserve/plot-{plot_number}"
                ),
                "plotAreaSqm": plot_area_sqm,
                "plotAreaSqft": round(float(plot_area_sqm) * SQFT_PER_SQM, 2),
                "gfaSqm": gfa_sqm,
                "gfaSqft": round(float(gfa_sqm) * SQFT_PER_SQM, 2),
                "hotspotXPercent": round(float(row["pdf_x"]) / PAGE_WIDTH * 100, 5),
                "hotspotYPercent": round(float(row["pdf_y"]) / PAGE_HEIGHT * 100, 5),
                "latitude": round(float(row["latitude"]), 8),
                "longitude": round(float(row["longitude"]), 8),
                "positionSource": row["position_source"],
                "phaseSource": row["phase_source"],
                "availability": sale["availability"] if sale else None,
                "availabilityUpdatedAt": sale["sourceReceivedAt"] if sale else None,
                "askingPriceAed": sale["askingPriceAed"] if sale else None,
                "originalPriceAed": numeric(str(aldar_unit["price_aed"])) if aldar_unit else None,
                "ownerName": None,
                "ownerMobile": None,
                "transactionHistory": [],
                "saleInventory": sale,
                "dunes": (
                    {
                        "unitNumber": official["Unit Number"],
                        "unitName": unit_name,
                        "bedrooms": int(official["Bedrooms"]),
                        "villaType": official["Villa Type"],
                        "totalAreaSqm": numeric(official["Total Area Sqm"]),
                        "interiorAreaSqm": numeric(official["Interior Area Sqm"]),
                        "exteriorAreaSqm": numeric(official["Exterior Area Sqm"]),
                        "officialWorldAldarUrl": official["Official URL"],
                        "existingDetailsPath": (
                            f"/aldar-saadiyat/saadiyat-reserve-the-dunes/saadiyatreserve-dunes/{unit_name}"
                        ),
                        "launchStatus": aldar_unit["status"],
                        "launchPriceAed": numeric(str(aldar_unit["price_aed"])),
                        "unitModel": aldar_unit["unit_model"],
                        "unitCategory": aldar_unit["unit_category"],
                    }
                    if is_dunes
                    else None
                ),
            }
        )

    if len(records) != 306:
        raise RuntimeError(f"Expected 306 plots, got {len(records)}")
    counts = {phase: sum(record["phase"] == phase for record in records) for phase in (1, 2, 3)}
    if counts != {1: 116, 2: 107, 3: 83}:
        raise RuntimeError(f"Unexpected phase counts: {counts}")
    bedrooms = {
        bedroom_count: sum(
            bool(record["dunes"] and record["dunes"]["bedrooms"] == bedroom_count)
            for record in records
        )
        for bedroom_count in (4, 5)
    }
    if bedrooms != {4: 53, 5: 30}:
        raise RuntimeError(f"Unexpected Dunes bedroom counts: {bedrooms}")
    available_records = [record for record in records if record["availability"] == "available_for_sale"]
    sold_records = [record for record in records if record["availability"] == "sold"]
    reserve_built_villas = [record for record in records if record["inventoryKind"] == "reserve_built_villa"]
    if (len(available_records), len(sold_records), len(reserve_built_villas)) != (7, 2, 3):
        raise RuntimeError(
            "Unexpected sale inventory counts: "
            f"available={len(available_records)}, sold={len(sold_records)}, built={len(reserve_built_villas)}"
        )

    serialized = json.dumps(records, indent=2, ensure_ascii=False)
    content = f'''/**
 * Generated by scripts/generate-saadiyat-reserve-data.py.
 * Sources: official 2019 Saadiyat Reserve master plan, user-supplied SDE3
 * coordinates, official World of Aldar Dunes pages, and the existing Aldar
 * launch inventory. Do not edit this file manually.
 */

export const SAADIYAT_RESERVE_MASTERPLAN_PDF_URL = "{MASTERPLAN_PDF_URL}";
export const SAADIYAT_RESERVE_MASTERPLAN_IMAGE_URL = "{MASTERPLAN_IMAGE_URL}";
export const SAADIYAT_RESERVE_WORLD_ALDAR_URL = "https://world.aldar.com/uae/abudhabi/saadiyatreserve/dunes";

export type SaadiyatReservePhase = 1 | 2 | 3;
export type SaadiyatReserveInventoryKind = "reserve_land" | "reserve_built_villa" | "dunes_built_villa";
export type SaadiyatReservePositionSource =
  | "user_supplied_sde3_coordinate"
  | "masterplan_quadratic_calibrated_to_sde3_controls";

export interface SaadiyatReserveDunesDetails {{
  unitNumber: string;
  unitName: string;
  bedrooms: number;
  villaType: string;
  totalAreaSqm: number;
  interiorAreaSqm: number;
  exteriorAreaSqm: number;
  officialWorldAldarUrl: string;
  existingDetailsPath: string;
  launchStatus: string;
  launchPriceAed: number;
  unitModel: string;
  unitCategory: string;
}}

export interface SaadiyatReserveSaleInventory {{
  sourceSheet: "Buy";
  sourceRow: number;
  sourceReceivedAt: string;
  project: "Saadiyat Reserve";
  sourcePhase: string | null;
  unitType: "Residential Land" | "Standalone Villa";
  unitNumber: number;
  landAreaSqm: number;
  builtUpAreaSqm: number | null;
  floors: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  availability: "available_for_sale" | "sold";
  askingPriceAed: number | null;
  negotiable: boolean;
  referenceNumber: string | null;
  details: string | null;
}}

export interface SaadiyatReserveRecord {{
  plotNumber: number;
  label: string;
  phase: SaadiyatReservePhase;
  inventoryKind: SaadiyatReserveInventoryKind;
  villaKey: string;
  plotAreaSqm: number;
  plotAreaSqft: number;
  gfaSqm: number;
  gfaSqft: number;
  hotspotXPercent: number;
  hotspotYPercent: number;
  latitude: number;
  longitude: number;
  positionSource: SaadiyatReservePositionSource;
  phaseSource: "official_2019_masterplan_vector_boundary" | "user_confirmed_phase_control";
  availability: "available_for_sale" | "sold" | null;
  availabilityUpdatedAt: string | null;
  askingPriceAed: number | null;
  originalPriceAed: number | null;
  ownerName: null;
  ownerMobile: null;
  transactionHistory: [];
  saleInventory: SaadiyatReserveSaleInventory | null;
  dunes: SaadiyatReserveDunesDetails | null;
}}

export const SAADIYAT_RESERVE_RECORDS: SaadiyatReserveRecord[] = {serialized};

export const SAADIYAT_RESERVE_LAND_PLOTS = SAADIYAT_RESERVE_RECORDS.filter(
  record => record.inventoryKind === "reserve_land",
);
export const SAADIYAT_RESERVE_PHASE_1_PLOTS = SAADIYAT_RESERVE_RECORDS.filter(record => record.phase === 1);
export const SAADIYAT_RESERVE_PHASE_2_PLOTS = SAADIYAT_RESERVE_RECORDS.filter(record => record.phase === 2);
export const SAADIYAT_RESERVE_DUNES_VILLAS = SAADIYAT_RESERVE_RECORDS.filter(
  record => record.inventoryKind === "dunes_built_villa",
);
export const SAADIYAT_RESERVE_AVAILABLE_RECORDS = SAADIYAT_RESERVE_RECORDS.filter(
  record => record.availability === "available_for_sale",
);
export const SAADIYAT_RESERVE_BY_PLOT_NUMBER = new Map(
  SAADIYAT_RESERVE_RECORDS.map(record => [record.plotNumber, record]),
);
'''
    OUTPUT_PATH.write_text(content, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Counts: {counts}; Dunes bedrooms: {bedrooms}")


if __name__ == "__main__":
    main()
