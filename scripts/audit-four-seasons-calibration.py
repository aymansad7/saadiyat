#!/usr/bin/env python3
"""Audit Four Seasons master-plan georeferencing against nine official controls."""

from __future__ import annotations

import json
import math
import re
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "client/src/data/fourSeasons.ts"
REPORT_PATH = ROOT / "tmp/four-seasons-calibration-audit.md"

CONTROLS = {
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


def load_villas() -> list[dict]:
    text = DATA_PATH.read_text(encoding="utf-8")
    match = re.search(
        r"export const FOUR_SEASONS_VILLAS = (\[.*\]) as const satisfies readonly FourSeasonsVilla\[\];",
        text,
        re.DOTALL,
    )
    if not match:
        raise SystemExit("Could not parse FOUR_SEASONS_VILLAS")
    return json.loads(match.group(1))


def features(x: float, y: float, model: str) -> list[float]:
    if model == "affine":
        return [1.0, x, y]
    if model == "quadratic":
        return [1.0, x, y, x * x, x * y, y * y]
    raise ValueError(model)


def fit(points: list[dict], model: str) -> tuple[np.ndarray, np.ndarray]:
    matrix = np.array([features(point["x"], point["y"], model) for point in points])
    latitudes = np.array([point["lat"] for point in points])
    longitudes = np.array([point["lng"] for point in points])
    return np.linalg.lstsq(matrix, latitudes, rcond=None)[0], np.linalg.lstsq(matrix, longitudes, rcond=None)[0]


def predict(x: float, y: float, model: str, lat_coeff: np.ndarray, lng_coeff: np.ndarray) -> tuple[float, float]:
    vector = np.array(features(x, y, model))
    return float(vector @ lat_coeff), float(vector @ lng_coeff)


def distance_m(lat_a: float, lng_a: float, lat_b: float, lng_b: float) -> float:
    mean_lat = math.radians((lat_a + lat_b) / 2)
    north = (lat_a - lat_b) * 111_320
    east = (lng_a - lng_b) * 111_320 * math.cos(mean_lat)
    return math.hypot(north, east)


def model_metrics(points: list[dict], model: str) -> dict:
    lat_coeff, lng_coeff = fit(points, model)
    fitted_errors = []
    for point in points:
        lat, lng = predict(point["x"], point["y"], model, lat_coeff, lng_coeff)
        fitted_errors.append(distance_m(lat, lng, point["lat"], point["lng"]))

    loo_errors = []
    loo_by_villa = {}
    for held_index, held in enumerate(points):
        training = [point for index, point in enumerate(points) if index != held_index]
        loo_lat_coeff, loo_lng_coeff = fit(training, model)
        lat, lng = predict(held["x"], held["y"], model, loo_lat_coeff, loo_lng_coeff)
        error = distance_m(lat, lng, held["lat"], held["lng"])
        loo_errors.append(error)
        loo_by_villa[held["villa"]] = error

    return {
        "model": model,
        "lat_coeff": lat_coeff,
        "lng_coeff": lng_coeff,
        "fit_rmse": math.sqrt(sum(error * error for error in fitted_errors) / len(fitted_errors)),
        "fit_max": max(fitted_errors),
        "loo_rmse": math.sqrt(sum(error * error for error in loo_errors) / len(loo_errors)),
        "loo_max": max(loo_errors),
        "loo_by_villa": loo_by_villa,
    }


def main() -> None:
    villas = {villa["villaNumber"]: villa for villa in load_villas()}
    points = []
    for villa_number, control in CONTROLS.items():
        villa = villas[villa_number]
        points.append(
            {
                "villa": villa_number,
                "plot": control["plot"],
                "x": villa["xPercent"] / 100,
                "y": villa["yPercent"] / 100,
                "old_lat": villa["latitude"],
                "old_lng": villa["longitude"],
                "lat": control["lat"],
                "lng": control["lng"],
            }
        )

    old_errors = {
        point["villa"]: distance_m(point["old_lat"], point["old_lng"], point["lat"], point["lng"])
        for point in points
    }
    metrics = [model_metrics(points, model) for model in ("affine", "quadratic")]
    selected = min(metrics, key=lambda result: result["loo_rmse"])

    lines = [
        "# Four Seasons Calibration Audit",
        "",
        "The audit compares the existing two-corner envelope with affine and quadratic transforms. Model selection uses leave-one-out RMSE, not in-sample fit, to reduce overfitting.",
        "",
        "| Model | Fit RMSE | Fit max | Leave-one-out RMSE | Leave-one-out max |",
        "|---|---:|---:|---:|---:|",
        f"| Existing envelope | {math.sqrt(sum(error * error for error in old_errors.values()) / len(old_errors)):.2f} m | {max(old_errors.values()):.2f} m | n/a | n/a |",
    ]
    for result in metrics:
        lines.append(
            f"| {result['model'].title()} | {result['fit_rmse']:.2f} m | {result['fit_max']:.2f} m | {result['loo_rmse']:.2f} m | {result['loo_max']:.2f} m |"
        )

    lines.extend(
        [
            "",
            f"**Selected model:** `{selected['model']}` because it has the lowest leave-one-out RMSE.",
            "",
            "| Villa | SDN3 plot | Existing error | Affine LOO error | Quadratic LOO error |",
            "|---:|---:|---:|---:|---:|",
        ]
    )
    affine = next(result for result in metrics if result["model"] == "affine")
    quadratic = next(result for result in metrics if result["model"] == "quadratic")
    for point in points:
        villa = point["villa"]
        lines.append(
            f"| {villa} | {point['plot']} | {old_errors[villa]:.2f} m | {affine['loo_by_villa'][villa]:.2f} m | {quadratic['loo_by_villa'][villa]:.2f} m |"
        )

    lines.extend(
        [
            "",
            "## Selected coefficients",
            "",
            f"Latitude: `{json.dumps([round(float(value), 12) for value in selected['lat_coeff']])}`",
            "",
            f"Longitude: `{json.dumps([round(float(value), 12) for value in selected['lng_coeff']])}`",
            "",
            "The nine controls must be written back exactly as supplied after transforming the remaining villas. Derived villas remain labelled as master-plan calibrated.",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {REPORT_PATH}")
    print(f"selected={selected['model']} loo_rmse={selected['loo_rmse']:.2f}m loo_max={selected['loo_max']:.2f}m")


if __name__ == "__main__":
    main()
