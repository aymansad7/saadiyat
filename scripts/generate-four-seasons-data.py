#!/usr/bin/env python3
"""Generate Four Seasons villa data directly from the four supplied source PDFs."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_DIR = Path("/home/ubuntu/upload")
DEFAULT_OUTPUT = ROOT / "client/src/data/fourSeasons.ts"
AVAILABLE_PDF = "FourSeasonsPrivateResidences-Saadiy.pdf"
HISTORICAL_5BR_PDF = "5Bed.pdf"
HISTORICAL_6BR_PDF = "6Bed.pdf"
MASTERPLAN_PDF = "MASTERPLAN2_FSPR_(2).pdf"
PAGE_WIDTH = 2560.0
PAGE_HEIGHT = 1600.0
SQFT_PER_SQM = 10.764

# Plot areas printed in the individual developer Floorplan PDFs supplied on
# 23 Aug 2026. These sheets are not municipal DCRs and do not imply current
# availability. They supersede the older combined 5Bed/6Bed lists for static
# plot specifications when a current availability row is not present.
FLOORPLAN_PLOT_SQFT = {
    12: 17236, 13: 16985, 14: 14116, 15: 15044, 16: 14363,
    20: 13226, 21: 13938, 25: 17818, 27: 17942, 29: 18976,
    31: 19762, 33: 16840, 37: 13318, 38: 13662, 39: 16222,
    40: 13709, 43: 13325, 44: 13195, 48: 20508, 50: 18565,
}

# Official SDN3 controls supplied and mapped to master-plan Villa numbers by
# the user on 25 Aug 2026. Input coordinates were supplied as lng, lat and are
# stored below as lat, lng. Direct controls always override model predictions.
SDN3_CONTROLS = {
    1: {"plot": 82, "lat": 24.5505760, "lng": 54.4406091},
    9: {"plot": 90, "lat": 24.5526042, "lng": 54.4431438},
    19: {"plot": 100, "lat": 24.5501867, "lng": 54.4439628},
    20: {"plot": 101, "lat": 24.5497470, "lng": 54.4434013},
    35: {"plot": 115, "lat": 24.5477882, "lng": 54.4401724},
    36: {"plot": 118, "lat": 24.5478203, "lng": 54.4405966},
    47: {"plot": 128, "lat": 24.5494841, "lng": 54.4421687},
    53: {"plot": 132, "lat": 24.5508334, "lng": 54.4418692},
    56: {"plot": 129, "lat": 24.5521132, "lng": 54.4433158},
}

# Quadratic model selected by scripts/audit-four-seasons-calibration.py using
# the lowest leave-one-out RMSE (18.87 m versus 21.10 m for affine and
# 207.75 m RMSE for the previous two-corner envelope).
LATITUDE_COEFFICIENTS = [24.550907932884, 0.001473791523, -0.004810774057, 0.00151387505, 0.007477322992, -0.003276049735]
LONGITUDE_COEFFICIENTS = [54.436290640044, 0.005335294149, 0.005401578622, 0.001624938873, 0.000658385702, -0.000894037554]


AVAILABLE_LINE = re.compile(
    r"^Available\s+Villa\s+(?P<number>\d+)\s+"
    r"(?P<bedrooms>\d+)\s+BR\s+"
    r"(?P<label>\d+\s+BEDROOM\s+VILLA)\s+"
    r"(?P<view>Garden View|Golf Front)\s+"
    r"(?P<internal>[\d,]+\.\d+)\s+"
    r"(?P<external>[\d,]+\.\d+)\s+"
    r"(?P<total>[\d,]+\.\d+)\s+"
    r"(?P<plot>[\d,]+\.\d+)\s+"
    r"(?P<price>[\d,]+\.\d+)$"
)

WORD_RE = re.compile(
    r'<word xMin="(?P<xmin>[\d.]+)" yMin="(?P<ymin>[\d.]+)" '
    r'xMax="(?P<xmax>[\d.]+)" yMax="(?P<ymax>[\d.]+)">(?P<text>\d{1,2})</word>'
)

HISTORICAL_LINE = re.compile(
    r"^Available\s+(?P<number>\d+)\s+"
    r"(?P<label>\d+\s+BEDROOM(?:\s+PLUS)?\s+VILLA)\s+"
    r"(?P<view>Golf Front|Garden|Golf|Park|Sea)\s+"
    r"(?P<plot>[\d,]+)\s+"
    r"(?P<total>[\d,]+)\s+"
    r"(?P<price>[\d,]+)$"
)


def decimal(value: str) -> float:
    return float(value.replace(",", ""))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=DEFAULT_SOURCE_DIR,
        help="Folder containing the four original Four Seasons PDFs",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Generated TypeScript output path",
    )
    return parser.parse_args()


def run_extract(command: list[str], output_path: Path) -> None:
    try:
        completed = subprocess.run(command, check=True, capture_output=True)
    except FileNotFoundError as exc:
        raise SystemExit(
            f"Missing required PDF extraction utility: {command[0]}. "
            "Install poppler-utils before running this generator."
        ) from exc
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.decode("utf-8", errors="replace")
        raise SystemExit(f"PDF extraction failed: {' '.join(command)}\n{stderr}") from exc
    output_path.write_bytes(completed.stdout)


def extract_sources(source_dir: Path, work_dir: Path) -> tuple[Path, Path, Path, Path]:
    required = [AVAILABLE_PDF, HISTORICAL_5BR_PDF, HISTORICAL_6BR_PDF, MASTERPLAN_PDF]
    missing = [name for name in required if not (source_dir / name).is_file()]
    if missing:
        raise SystemExit(
            f"Missing source PDFs in {source_dir}: {', '.join(missing)}. "
            "See scripts/FOUR_SEASONS_GENERATOR.md."
        )

    available_text = work_dir / "available.txt"
    historical_5br_text = work_dir / "historical-5br.txt"
    historical_6br_text = work_dir / "historical-6br.txt"
    masterplan_bbox = work_dir / "masterplan.xml"

    run_extract(["pdftotext", "-layout", str(source_dir / AVAILABLE_PDF), "-"], available_text)
    run_extract(["pdftotext", "-layout", str(source_dir / HISTORICAL_5BR_PDF), "-"], historical_5br_text)
    run_extract(["pdftotext", "-layout", str(source_dir / HISTORICAL_6BR_PDF), "-"], historical_6br_text)
    run_extract(["pdftotext", "-bbox-layout", str(source_dir / MASTERPLAN_PDF), "-"], masterplan_bbox)
    return available_text, historical_5br_text, historical_6br_text, masterplan_bbox


def villa_type(number: int) -> str:
    if number <= 8:
        return "Beach Mansion"
    if number == 9:
        return "Royal Beach Mansion"
    if 10 <= number <= 13 or 17 <= number <= 19 or 36 <= number <= 50:
        return "Garden Villa"
    if 14 <= number <= 16 or 20 <= number <= 24:
        return "Golf View Villa"
    if 25 <= number <= 35:
        return "Golf Villa"
    return "Sea Side Villa"


def bedroom_count(number: int) -> int:
    if 1 <= number <= 9:
        return 7
    if 10 <= number <= 13 or 25 <= number <= 35 or 48 <= number <= 50:
        return 6
    return 5


def calibrated_coordinate(x_percent: float, y_percent: float) -> tuple[float, float]:
    x = x_percent / 100
    y = y_percent / 100
    features = [1.0, x, y, x * x, x * y, y * y]
    latitude = sum(coefficient * value for coefficient, value in zip(LATITUDE_COEFFICIENTS, features))
    longitude = sum(coefficient * value for coefficient, value in zip(LONGITUDE_COEFFICIENTS, features))
    return latitude, longitude


def generate(
    available_text: Path,
    historical_5br_text: Path,
    historical_6br_text: Path,
    masterplan_bbox: Path,
    output: Path,
) -> None:
    available: dict[int, dict] = {}
    for raw_line in available_text.read_text(encoding="utf-8", errors="replace").splitlines():
        match = AVAILABLE_LINE.match(raw_line.strip())
        if not match:
            continue
        values = match.groupdict()
        number = int(values["number"])
        available[number] = {
            "status": "available",
            "availabilityUpdatedAt": "2026-08-23",
            "view": values["view"],
            "internalAreaSqft": decimal(values["internal"]),
            "externalAreaSqft": decimal(values["external"]),
            "builtUpAreaSqft": decimal(values["total"]),
            "plotAreaSqft": decimal(values["plot"]),
            "askingPriceAed": decimal(values["price"]),
            "sourcePage": 1,
        }

    historical_specs: dict[int, dict] = {}
    for source_name, source_path in (
        ("5Bed.pdf", historical_5br_text),
        ("6Bed.pdf", historical_6br_text),
    ):
        for raw_line in source_path.read_text(encoding="utf-8", errors="replace").splitlines():
            match = HISTORICAL_LINE.match(raw_line.strip())
            if not match:
                continue
            values = match.groupdict()
            number = int(values["number"])
            historical_specs[number] = {
                # Deliberately ignore the historical row's availability word and price.
                # These old inventories may enrich permanent specifications only.
                "bedroomLabel": values["label"].title(),
                "view": values["view"],
                "plotAreaSqft": decimal(values["plot"]),
                "builtUpAreaSqft": decimal(values["total"]),
                "historicalSpecSource": source_name,
            }

    positions: dict[int, dict] = {}
    for match in WORD_RE.finditer(masterplan_bbox.read_text(encoding="utf-8", errors="replace")):
        number = int(match.group("text"))
        x_center = (float(match.group("xmin")) + float(match.group("xmax"))) / 2
        y_center = (float(match.group("ymin")) + float(match.group("ymax"))) / 2
        if not 1 <= number <= 56 or x_center >= 2000 or number in positions:
            continue
        positions[number] = {
            "xPercent": round(x_center / PAGE_WIDTH * 100, 4),
            "yPercent": round(y_center / PAGE_HEIGHT * 100, 4),
        }

    if len(available) != 11:
        raise SystemExit(f"Expected 11 available villas, found {len(available)}")
    if len(positions) != 56:
        missing = sorted(set(range(1, 57)) - positions.keys())
        raise SystemExit(f"Expected 56 master-plan positions, found {len(positions)}; missing={missing}")

    villas = []
    for number in range(1, 57):
        availability = available.get(number)
        historical = historical_specs.get(number)
        floorplan_plot_sqft = FLOORPLAN_PLOT_SQFT.get(number)
        built_up_sqft = (
            availability["builtUpAreaSqft"]
            if availability
            else historical["builtUpAreaSqft"] if historical else None
        )
        plot_area_sqft = (
            availability["plotAreaSqft"]
            if availability
            else floorplan_plot_sqft
            if floorplan_plot_sqft is not None
            else historical["plotAreaSqft"] if historical else None
        )
        record = {
            "villaKey": f"four-seasons/villa-{number}",
            "villaNumber": number,
            "label": f"Villa {number}",
            "villaType": villa_type(number),
            "bedrooms": bedroom_count(number),
            "bedroomLabel": historical["bedroomLabel"] if historical else None,
            "status": availability["status"] if availability else "unknown",
            "availabilityUpdatedAt": availability["availabilityUpdatedAt"] if availability else None,
            "view": availability["view"] if availability else historical["view"] if historical else None,
            "internalAreaSqft": availability["internalAreaSqft"] if availability else None,
            "externalAreaSqft": availability["externalAreaSqft"] if availability else None,
            "builtUpAreaSqft": built_up_sqft,
            "builtUpAreaSqm": round(built_up_sqft / SQFT_PER_SQM, 2) if built_up_sqft else None,
            "plotAreaSqft": plot_area_sqft,
            "plotAreaSqm": round(plot_area_sqft / SQFT_PER_SQM, 2) if plot_area_sqft else None,
            "askingPriceAed": availability["askingPriceAed"] if availability else None,
            "sourcePage": availability["sourcePage"] if availability else None,
            "historicalSpecSource": historical["historicalSpecSource"] if historical else None,
            **positions[number],
        }
        control = SDN3_CONTROLS.get(number)
        if control:
            record["latitude"] = control["lat"]
            record["longitude"] = control["lng"]
            record["sdn3PlotNumber"] = control["plot"]
            record["positionSource"] = "user_supplied_sdn3_coordinate"
        else:
            latitude, longitude = calibrated_coordinate(record["xPercent"], record["yPercent"])
            record["latitude"] = round(latitude, 8)
            record["longitude"] = round(longitude, 8)
            record["sdn3PlotNumber"] = None
            record["positionSource"] = "masterplan_quadratic_calibrated_to_sdn3_controls"
        villas.append(record)

    serialized = json.dumps(villas, indent=2, ensure_ascii=False)
    output.write_text(
        f'''/** Four Seasons Private Residences — availability + master-plan positions. */
export type FourSeasonsVilla = {{
  villaKey: string;
  villaNumber: number;
  label: string;
  villaType: string;
  bedrooms: number;
  bedroomLabel: string | null;
  status: "available" | "unknown";
  availabilityUpdatedAt: string | null;
  view: string | null;
  internalAreaSqft: number | null;
  externalAreaSqft: number | null;
  builtUpAreaSqft: number | null;
  builtUpAreaSqm: number | null;
  plotAreaSqft: number | null;
  plotAreaSqm: number | null;
  askingPriceAed: number | null;
  sourcePage: number | null;
  historicalSpecSource: "5Bed.pdf" | "6Bed.pdf" | null;
  xPercent: number;
  yPercent: number;
  latitude: number;
  longitude: number;
  sdn3PlotNumber: number | null;
  positionSource: "user_supplied_sdn3_coordinate" | "masterplan_quadratic_calibrated_to_sdn3_controls";
}};

export const FOUR_SEASONS_MASTERPLAN_IMAGE = "/manus-storage/FourSeasons_MasterPlan_aa0ee03b.png";
export const FOUR_SEASONS_MASTERPLAN_PDF = "/manus-storage/FourSeasons_MasterPlan_f2902c89.pdf";
export const FOUR_SEASONS_AVAILABILITY_DATE = "2026-08-23";

export const FOUR_SEASONS_VILLAS = {serialized} as const satisfies readonly FourSeasonsVilla[];
export const FOUR_SEASONS_AVAILABLE_VILLAS = FOUR_SEASONS_VILLAS.filter(villa => villa.status === "available");
''',
        encoding="utf-8",
    )
    print(f"Generated {len(villas)} villas ({len(available)} available) → {output}")


def main() -> None:
    args = parse_args()
    with tempfile.TemporaryDirectory(prefix="four-seasons-generator-") as temp_dir:
        extracted = extract_sources(args.source_dir.resolve(), Path(temp_dir))
        generate(*extracted, args.output.resolve())


if __name__ == "__main__":
    main()
