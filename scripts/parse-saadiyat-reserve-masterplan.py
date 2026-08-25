#!/usr/bin/env python3
"""Parse Saadiyat Reserve plot labels from the official bbox-layout PDF export.

The source plan contains one text block per plot with Plot, Area and GFA. This
script preserves the printed values, records the PDF text position, fits a
global affine PDF-to-WGS84 calibration from user-supplied SDE3 controls, and
writes auditable CSV/Markdown outputs. It does not infer availability.
"""

from __future__ import annotations

import csv
import math
from pathlib import Path
import re

import numpy as np
import pymupdf


ROOT = Path(__file__).resolve().parents[1]
BBOX_PATH = ROOT / "tmp/saadiyat-reserve/masterplan-bbox.html"
PDF_PATH = Path("/home/ubuntu/upload/SaadiyatReservePlotsMasterplan.pdf")
CSV_PATH = ROOT / "tmp/saadiyat-reserve/plots-extracted.csv"
REPORT_PATH = ROOT / "tmp/saadiyat-reserve/parse-audit.md"


CONTROLS = {
    # Final phase interpretation from the user's corrections:
    # group B is Phase 1; group A is Phase 2; Phase 3 was renamed Dunes.
    1: {
        134: (54.4447532, 24.5217749),
        131: (54.4438846, 24.5211075),
        21: (54.4432384, 24.5251825),
        200: (54.4406262, 24.5249590),
        68: (54.4397131, 24.5233284),
        81: (54.4413981, 24.5216449),
    },
    2: {
        114: (54.4466872, 24.5198210),
        101: (54.4441996, 24.5188397),
        82: (54.4416178, 24.5214185),
        272: (54.4423814, 24.5219579),
        296: (54.4440922, 24.5202447),
        126: (54.4453330, 24.5212737),
    },
    3: {
        37: (54.4412528, 24.5280350),
        61: (54.4387504, 24.5242020),
        67: (54.4395702, 24.5234405),
        193: (54.4411050, 24.5238730),
        22: (54.4431780, 24.5253477),
    },
}


def parse_plots() -> tuple[list[dict], float, float]:
    document = pymupdf.open(PDF_PATH)
    page = document[0]
    page_width = float(page.rect.width)
    page_height = float(page.rect.height)
    data = page.get_text(
        "dict",
        flags=pymupdf.TEXT_PRESERVE_LIGATURES | pymupdf.TEXT_PRESERVE_WHITESPACE,
    )

    lines = []
    for block in data["blocks"]:
        for line in block.get("lines", []):
            text = "".join(span["text"] for span in line["spans"]).strip()
            if not text:
                continue
            bbox = line["bbox"]
            direction = line["dir"]
            magnitude = math.hypot(direction[0], direction[1]) or 1
            lines.append(
                {
                    "text": text,
                    "cx": (bbox[0] + bbox[2]) / 2,
                    "cy": (bbox[1] + bbox[3]) / 2,
                    "dx": direction[0] / magnitude,
                    "dy": direction[1] / magnitude,
                }
            )

    area_lines = []
    gfa_lines = []
    for line in lines:
        area_match = re.fullmatch(r"Area:\s*([0-9][0-9,.]*)", line["text"])
        gfa_match = re.fullmatch(r"GFA:\s*([0-9][0-9,.]*)", line["text"])
        if area_match:
            area_lines.append((line, float(area_match.group(1).replace(",", ""))))
        if gfa_match:
            gfa_lines.append((line, float(gfa_match.group(1).replace(",", ""))))

    def find_associated_value(number_line: dict, candidates, expected_perp: float):
        normal_x = -number_line["dy"]
        normal_y = number_line["dx"]
        scored = []
        for candidate, value in candidates:
            direction_dot = number_line["dx"] * candidate["dx"] + number_line["dy"] * candidate["dy"]
            if direction_dot < 0.998:
                continue
            delta_x = candidate["cx"] - number_line["cx"]
            delta_y = candidate["cy"] - number_line["cy"]
            along = delta_x * number_line["dx"] + delta_y * number_line["dy"]
            perpendicular = delta_x * normal_x + delta_y * normal_y
            if abs(along) > 3.5 or not expected_perp - 2.5 <= perpendicular <= expected_perp + 2.5:
                continue
            score = abs(along) * 2 + abs(perpendicular - expected_perp) + (1 - direction_dot) * 100
            scored.append((score, value))
        return min(scored, default=(None, None))[1]

    plots_by_number: dict[int, dict] = {}
    for line in lines:
        if not re.fullmatch(r"[1-9][0-9]{0,2}", line["text"]):
            continue
        plot_number = int(line["text"])
        if not 2 <= plot_number <= 307 or line["cy"] > 780:
            continue
        area_sqm = find_associated_value(line, area_lines, expected_perp=5.22)
        gfa_sqm = find_associated_value(line, gfa_lines, expected_perp=10.43)
        if area_sqm is None or gfa_sqm is None:
            continue
        candidate = {
            "plot_number": plot_number,
            "area_sqm": area_sqm,
            "gfa_sqm": gfa_sqm,
            "pdf_x": line["cx"],
            "pdf_y": line["cy"],
        }
        existing = plots_by_number.get(plot_number)
        if existing is None:
            plots_by_number[plot_number] = candidate
        else:
            # Prefer the candidate in the mapped development body over legends or scale labels.
            existing_center_distance = math.hypot(existing["pdf_x"] - 590, existing["pdf_y"] - 480)
            candidate_center_distance = math.hypot(candidate["pdf_x"] - 590, candidate["pdf_y"] - 480)
            if candidate_center_distance < existing_center_distance:
                plots_by_number[plot_number] = candidate

    plots = sorted(plots_by_number.values(), key=lambda plot: plot["plot_number"])
    document.close()
    return plots, page_width, page_height


def calibration_features(x_values, y_values, center, scale):
    x_normalized = (np.asarray(x_values) - center[0]) / scale[0]
    y_normalized = (np.asarray(y_values) - center[1]) / scale[1]
    return np.column_stack(
        [
            np.ones_like(x_normalized),
            x_normalized,
            y_normalized,
            x_normalized * x_normalized,
            x_normalized * y_normalized,
            y_normalized * y_normalized,
        ]
    )


def fit_calibration(plots_by_number: dict[int, dict]):
    rows = []
    lng_values = []
    lat_values = []
    control_rows = []
    for phase, controls in CONTROLS.items():
        for plot_number, (lng, lat) in controls.items():
            if plot_number not in plots_by_number:
                continue
            plot = plots_by_number[plot_number]
            rows.append([plot["pdf_x"], plot["pdf_y"]])
            lng_values.append(lng)
            lat_values.append(lat)
            control_rows.append((phase, plot_number, lng, lat, plot))

    coordinates = np.asarray(rows, dtype=float)
    center = (coordinates[:, 0].mean(), coordinates[:, 1].mean())
    scale = (coordinates[:, 0].std() or 1, coordinates[:, 1].std() or 1)
    matrix = calibration_features(coordinates[:, 0], coordinates[:, 1], center, scale)
    lng_coeffs, *_ = np.linalg.lstsq(matrix, np.asarray(lng_values), rcond=None)
    lat_coeffs, *_ = np.linalg.lstsq(matrix, np.asarray(lat_values), rcond=None)

    residuals = []
    for phase, plot_number, lng, lat, plot in control_rows:
        vector = calibration_features([plot["pdf_x"]], [plot["pdf_y"]], center, scale)[0]
        predicted_lng = float(vector @ lng_coeffs)
        predicted_lat = float(vector @ lat_coeffs)
        mean_lat = math.radians((lat + predicted_lat) / 2)
        east_m = (predicted_lng - lng) * 111_320 * math.cos(mean_lat)
        north_m = (predicted_lat - lat) * 110_540
        residuals.append(
            {
                "phase": phase,
                "plot_number": plot_number,
                "official_lng": lng,
                "official_lat": lat,
                "predicted_lng": predicted_lng,
                "predicted_lat": predicted_lat,
                "error_m": math.hypot(east_m, north_m),
            }
        )
    return lng_coeffs, lat_coeffs, center, scale, residuals


def main() -> None:
    plots, page_width, page_height = parse_plots()
    by_number = {plot["plot_number"]: plot for plot in plots}
    missing = [number for number in range(2, 308) if number not in by_number]
    missing_controls = [
        plot_number
        for controls in CONTROLS.values()
        for plot_number in controls
        if plot_number not in by_number
    ]
    lng_coeffs, lat_coeffs, center, scale, residuals = fit_calibration(by_number)
    control_lookup = {
        plot_number: (phase, lng, lat)
        for phase, controls in CONTROLS.items()
        for plot_number, (lng, lat) in controls.items()
    }

    for plot in plots:
        vector = calibration_features([plot["pdf_x"]], [plot["pdf_y"]], center, scale)[0]
        plot["calibrated_lng"] = float(vector @ lng_coeffs)
        plot["calibrated_lat"] = float(vector @ lat_coeffs)
        if plot["plot_number"] in control_lookup:
            phase, official_lng, official_lat = control_lookup[plot["plot_number"]]
            plot["control_phase"] = phase
            plot["longitude"] = official_lng
            plot["latitude"] = official_lat
            plot["position_source"] = "user_supplied_sde3_coordinate"
        else:
            plot["control_phase"] = ""
            plot["longitude"] = plot["calibrated_lng"]
            plot["latitude"] = plot["calibrated_lat"]
            plot["position_source"] = "masterplan_quadratic_calibrated_to_sde3_controls"

    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    with CSV_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "plot_number",
                "area_sqm",
                "gfa_sqm",
                "pdf_x",
                "pdf_y",
                "control_phase",
                "longitude",
                "latitude",
                "position_source",
            ],
        )
        writer.writeheader()
        writer.writerows(
            {key: plot[key] for key in writer.fieldnames}
            for plot in plots
        )

    max_error = max(row["error_m"] for row in residuals)
    mean_error = sum(row["error_m"] for row in residuals) / len(residuals)
    lines = [
        "# Saadiyat Reserve bbox parse audit",
        "",
        f"- Page size: {page_width:.3f} × {page_height:.3f} pt",
        f"- Parsed plot blocks: {len(plots)}",
        f"- Missing plot numbers: {missing or 'None'}",
        f"- Control plots missing from bbox blocks: {missing_controls or 'None'}",
        f"- Control points: {len(residuals)}",
        f"- Global quadratic mean residual: {mean_error:.2f} m",
        f"- Global quadratic maximum residual: {max_error:.2f} m",
        "",
        "## Control residuals",
        "",
        "| Phase | Plot | PDF x | PDF y | Error m |",
        "|---:|---:|---:|---:|---:|",
    ]
    for residual in sorted(residuals, key=lambda row: (row["phase"], row["plot_number"])):
        plot = by_number[residual["plot_number"]]
        lines.append(
            f"| {residual['phase']} | {residual['plot_number']} | {plot['pdf_x']:.2f} | {plot['pdf_y']:.2f} | {residual['error_m']:.2f} |"
        )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Parsed {len(plots)} plots; missing={missing}")
    print(f"Affine residual mean={mean_error:.2f}m max={max_error:.2f}m")
    print(f"Wrote {CSV_PATH}")
    print(f"Wrote {REPORT_PATH}")


if __name__ == "__main__":
    main()
