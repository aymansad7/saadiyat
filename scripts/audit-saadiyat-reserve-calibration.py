#!/usr/bin/env python3
"""Compare stable PDF-to-WGS84 calibration models using official controls."""

from __future__ import annotations

import csv
import math
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
PLOTS_PATH = ROOT / "tmp/saadiyat-reserve/plots-classified.csv"
REPORT_PATH = ROOT / "tmp/saadiyat-reserve/calibration-audit.md"


def features(x: np.ndarray, y: np.ndarray, model: str, center, scale):
    xn = (x - center[0]) / scale[0]
    yn = (y - center[1]) / scale[1]
    if model == "affine":
        return np.column_stack([np.ones_like(xn), xn, yn])
    if model == "quadratic":
        return np.column_stack([np.ones_like(xn), xn, yn, xn * xn, xn * yn, yn * yn])
    raise ValueError(model)


def fit_predict(train, test, model: str):
    center = (train[:, 0].mean(), train[:, 1].mean())
    scale = (train[:, 0].std() or 1, train[:, 1].std() or 1)
    design = features(train[:, 0], train[:, 1], model, center, scale)
    lng_coeffs, *_ = np.linalg.lstsq(design, train[:, 2], rcond=None)
    lat_coeffs, *_ = np.linalg.lstsq(design, train[:, 3], rcond=None)
    test_design = features(test[:, 0], test[:, 1], model, center, scale)
    return test_design @ lng_coeffs, test_design @ lat_coeffs


def error_m(predicted_lng, predicted_lat, official_lng, official_lat):
    mean_lat = np.radians((predicted_lat + official_lat) / 2)
    east = (predicted_lng - official_lng) * 111_320 * np.cos(mean_lat)
    north = (predicted_lat - official_lat) * 110_540
    return np.sqrt(east * east + north * north)


def main():
    with PLOTS_PATH.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    controls = [row for row in rows if row["control_phase"]]
    matrix = np.asarray(
        [
            [float(row["pdf_x"]), float(row["pdf_y"]), float(row["longitude"]), float(row["latitude"])]
            for row in controls
        ],
        dtype=float,
    )

    summaries = []
    details = {}
    for model in ("affine", "quadratic"):
        train_lng, train_lat = fit_predict(matrix, matrix, model)
        train_errors = error_m(train_lng, train_lat, matrix[:, 2], matrix[:, 3])

        loo_errors = []
        for index in range(len(matrix)):
            train = np.delete(matrix, index, axis=0)
            test = matrix[index : index + 1]
            predicted_lng, predicted_lat = fit_predict(train, test, model)
            loo_errors.append(
                float(error_m(predicted_lng, predicted_lat, test[:, 2], test[:, 3])[0])
            )
        summaries.append(
            {
                "model": model,
                "train_mean": float(train_errors.mean()),
                "train_max": float(train_errors.max()),
                "loo_mean": sum(loo_errors) / len(loo_errors),
                "loo_max": max(loo_errors),
            }
        )
        details[model] = loo_errors

    chosen = min(summaries, key=lambda item: (item["loo_mean"], item["loo_max"]))["model"]
    lines = [
        "# Saadiyat Reserve calibration audit",
        "",
        f"- Official controls: {len(controls)}",
        f"- Selected model by lowest leave-one-out mean error: **{chosen}**",
        "",
        "| Model | Training mean m | Training max m | LOO mean m | LOO max m |",
        "|---|---:|---:|---:|---:|",
    ]
    for summary in summaries:
        lines.append(
            f"| {summary['model']} | {summary['train_mean']:.2f} | {summary['train_max']:.2f} | {summary['loo_mean']:.2f} | {summary['loo_max']:.2f} |"
        )
    lines.extend([
        "",
        "## Leave-one-out residuals",
        "",
        "| Plot | Stated phase group | Affine m | Quadratic m |",
        "|---:|---:|---:|---:|",
    ])
    for index, row in enumerate(controls):
        lines.append(
            f"| {row['plot_number']} | {row['control_phase']} | {details['affine'][index]:.2f} | {details['quadratic'][index]:.2f} |"
        )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines[:12]))
    print(f"Wrote {REPORT_PATH}")


if __name__ == "__main__":
    main()
