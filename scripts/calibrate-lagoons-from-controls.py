#!/usr/bin/env python3
"""Rebuild Lagoons GPS positions only after official unit-coordinate controls exist.

The script deliberately refuses to write coordinates until at least three official
controls are supplied for each of Al Ghaf, Al Sidr, and Ethir. It compares global
affine and quadratic transforms by leave-one-out error and keeps direct controls
exact in the output. This prevents another visual-guess shift of the Lagoons layer.
"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "server/data/lagoons.json"
CONTROLS_PATH = ROOT / "scripts/source-data/lagoons-controls.json"
AUDIT_PATH = ROOT / "tmp/lagoons-calibration-audit.md"
OUTPUT_PATH = ROOT / "client/src/data/lagoonsCoordinates.ts"
CLUSTERS = ("al-ghaf", "al-sidr", "ethir")
OUTLIER_RESIDUAL_M = 100.0


def feature_matrix(points: list[dict], model: str) -> np.ndarray:
    rows = []
    for point in points:
        x = float(point["map_x"])
        y = float(point["map_y"])
        rows.append([1, x, y] if model == "affine" else [1, x, y, x * x, x * y, y * y])
    return np.array(rows, dtype=float)


def fit_predict(train: list[dict], test: list[dict], model: str) -> list[tuple[float, float]]:
    matrix = feature_matrix(train, model)
    lat = np.array([float(point["latitude"]) for point in train])
    lng = np.array([float(point["longitude"]) for point in train])
    lat_coeff, *_ = np.linalg.lstsq(matrix, lat, rcond=None)
    lng_coeff, *_ = np.linalg.lstsq(matrix, lng, rcond=None)
    predicted = feature_matrix(test, model)
    return list(zip(predicted @ lat_coeff, predicted @ lng_coeff))


def distance_m(a_lat: float, a_lng: float, b_lat: float, b_lng: float) -> float:
    lat_scale = 111_320.0
    lng_scale = lat_scale * math.cos(math.radians((a_lat + b_lat) / 2))
    return math.hypot((a_lat - b_lat) * lat_scale, (a_lng - b_lng) * lng_scale)


def loo_rmse(controls: list[dict], model: str) -> float:
    errors = loo_errors(controls, model)
    if not errors:
        return math.inf
    return math.sqrt(sum(error * error for _, error in errors) / len(errors))


def loo_errors(controls: list[dict], model: str) -> list[tuple[dict, float]]:
    min_train = 6 if model == "quadratic" else 3
    if len(controls) - 1 < min_train:
        return []
    errors = []
    for index, held_out in enumerate(controls):
        train = controls[:index] + controls[index + 1 :]
        predicted_lat, predicted_lng = fit_predict(train, [held_out], model)[0]
        errors.append((held_out, distance_m(predicted_lat, predicted_lng, held_out["latitude"], held_out["longitude"])))
    return errors


def main() -> None:
    controls_document = json.loads(CONTROLS_PATH.read_text(encoding="utf-8"))
    controls = controls_document.get("controls", [])
    source = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    villas = source["villas"]
    by_name = {villa["unit_name"]: villa for villa in villas}

    existing_text = OUTPUT_PATH.read_text(encoding="utf-8")
    def retained_coordinate(unit_name: str) -> tuple[float, float] | None:
        escaped_name = re.escape(unit_name)
        unit_match = re.search(
            rf'\{{[^{{}}]*(?:"unit_name"|unit_name)\s*:\s*"{escaped_name}"[^{{}}]*\}}',
            existing_text,
            flags=re.DOTALL,
        )
        if unit_match is None:
            return None
        row = unit_match.group(0)
        lat_match = re.search(r'(?:"lat"|lat)\s*:\s*([\d.]+)', row)
        lng_match = re.search(r'(?:"lng"|lng)\s*:\s*([\d.]+)', row)
        if lat_match is None or lng_match is None:
            return None
        return float(lat_match.group(1)), float(lng_match.group(1))

    missing_clusters = [
        cluster
        for cluster in CLUSTERS
        if sum(control.get("cluster") == cluster for control in controls) < 3
    ]
    if missing_clusters:
        raise RuntimeError(
            "Refusing to calibrate Lagoons without at least 3 official controls per cluster. "
            f"Missing coverage: {', '.join(missing_clusters)}"
        )
    if len(controls) < 9:
        raise RuntimeError("At least 9 distributed official controls are required")

    enriched = []
    excluded_controls = []
    for control in controls:
        if control.get("calibrationExcluded"):
            excluded_controls.append(control)
            continue
        villa = by_name.get(control.get("unitName"))
        if villa is None:
            raise RuntimeError(f"Unknown Lagoons unit control: {control.get('unitName')}")
        if villa["cluster"] != control.get("cluster"):
            raise RuntimeError(f"Cluster mismatch for {control['unitName']}")
        enriched.append({**control, "map_x": villa["map_x"], "map_y": villa["map_y"]})

    unique_controls = []
    seen_coordinate_keys = set()
    for control in enriched:
        coordinate_key = (
            control["cluster"],
            control.get("sdn3PlotNumber"),
            round(float(control["latitude"]), 8),
            round(float(control["longitude"]), 8),
        )
        if coordinate_key not in seen_coordinate_keys:
            unique_controls.append(control)
            seen_coordinate_keys.add(coordinate_key)

    spatial_villas = [
        villa
        for villa in villas
        if villa.get("map_x") is not None and villa.get("map_y") is not None
    ]
    missing_masterplan_villas = [villa for villa in villas if villa not in spatial_villas]
    selected_model_by_cluster = {}
    scores_by_cluster = {}
    worst_errors_by_cluster = {}
    calibration_exclusions = []
    predictions_by_name = {}
    for cluster in CLUSTERS:
        cluster_controls = [control for control in unique_controls if control["cluster"] == cluster]
        cluster_villas = [villa for villa in spatial_villas if villa["cluster"] == cluster]
        fit_controls = cluster_controls[:]
        while True:
            cluster_scores = {
                model: loo_rmse(fit_controls, model)
                for model in ("affine", "quadratic")
            }
            selected_model = min(cluster_scores, key=cluster_scores.get)
            residuals = sorted(
                loo_errors(fit_controls, selected_model), key=lambda item: item[1], reverse=True
            )
            minimum_controls = 6 if selected_model == "quadratic" else 3
            if not residuals or residuals[0][1] <= OUTLIER_RESIDUAL_M or len(fit_controls) <= minimum_controls:
                break
            outlier, residual = residuals[0]
            fit_controls = [control for control in fit_controls if control["unitName"] != outlier["unitName"]]
            calibration_exclusions.append((cluster, outlier, residual))
        selected_model_by_cluster[cluster] = selected_model
        scores_by_cluster[cluster] = cluster_scores
        worst_errors_by_cluster[cluster] = sorted(
            loo_errors(fit_controls, selected_model), key=lambda item: item[1], reverse=True
        )[:5]
        for villa, prediction in zip(
            cluster_villas,
            fit_predict(fit_controls, cluster_villas, selected_model),
        ):
            predictions_by_name[villa["unit_name"]] = prediction
    direct_by_name = {control["unitName"]: control for control in unique_controls}

    rows = []
    for villa in spatial_villas:
        latitude, longitude = predictions_by_name[villa["unit_name"]]
        direct = direct_by_name.get(villa["unit_name"])
        rows.append(
            {
                "unit_name": villa["unit_name"],
                "cluster": villa["cluster"],
                "lat": round(float(direct["latitude"]) if direct else float(latitude), 8),
                "lng": round(float(direct["longitude"]) if direct else float(longitude), 8),
                "position_source": "official_user_control" if direct else f"masterplan_{selected_model_by_cluster[villa['cluster']]}_calibrated_to_official_controls",
                "bedrooms": str(villa.get("bedrooms") or ""),
                "plot_area_sqm": villa.get("plot_area_sqm") or 0,
                "status": villa.get("status") or "",
                "price": villa.get("selling_price_aed") or 0,
            }
        )

    omitted_missing_positions = []
    for villa in missing_masterplan_villas:
        fallback = retained_coordinate(villa["unit_name"])
        if fallback is None:
            omitted_missing_positions.append(villa["unit_name"])
            continue
        rows.append(
            {
                "unit_name": villa["unit_name"],
                "cluster": villa["cluster"],
                "lat": fallback[0],
                "lng": fallback[1],
                "position_source": "legacy_position_retained_no_masterplan_coordinate",
                "bedrooms": str(villa.get("bedrooms") or ""),
                "plot_area_sqm": villa.get("plot_area_sqm") or 0,
                "status": villa.get("status") or "",
                "price": villa.get("selling_price_aed") or 0,
            }
        )

    serialized = json.dumps(rows, indent=2, ensure_ascii=False)
    OUTPUT_PATH.write_text(
        "// Generated by scripts/calibrate-lagoons-from-controls.py.\n"
        "// Direct controls are official; all other positions are calibrated from Aldar master-plan geometry.\n"
        "export const lagoonsVillaCoords: { unit_name: string; cluster: string; lat: number; lng: number; position_source: string; bedrooms: string; plot_area_sqm: number; status: string; price: number }[] = "
        + serialized
        + ";\n",
        encoding="utf-8",
    )
    report = [
        "# Saadiyat Lagoons Calibration Audit",
        "",
        f"Controls: {len(enriched)} source rows / {len(unique_controls)} unique locations.",
        "",
        "| Cluster | Selected model | Affine LOO RMSE | Quadratic LOO RMSE |",
        "|---|---|---:|---:|",
        *[
            f"| {cluster} | {selected_model_by_cluster[cluster]} | "
            f"{scores_by_cluster[cluster]['affine']:.1f} m | "
            f"{scores_by_cluster[cluster]['quadratic']:.1f} m |"
            for cluster in CLUSTERS
        ],
        "",
        "## Direct controls excluded from the derived-position fit",
        "",
        "| Cluster | Unit | SDN3 Plot | Prior leave-one-out residual |",
        "|---|---|---:|---:|",
        *[
            f"| {cluster} | {control['unitName']} | {control.get('sdn3PlotNumber', '—')} | {error:.1f} m |"
            for cluster, control, error in calibration_exclusions
        ],
        "",
        "## Largest leave-one-out residuals",
        "",
        "| Cluster | Unit | SDN3 Plot | Residual |",
        "|---|---|---:|---:|",
        *[
            f"| {cluster} | {control['unitName']} | {control.get('sdn3PlotNumber', '—')} | {error:.1f} m |"
            for cluster in CLUSTERS
            for control, error in worst_errors_by_cluster[cluster]
        ],
        "",
        f"Excluded source rows awaiting a unit alias: {len(excluded_controls)}.",
        f"Units retaining a legacy map position because the Aldar master-plan source lacks map_x/map_y: {len(missing_masterplan_villas)}.",
        f"Units omitted because neither the Aldar master-plan nor the prior map layer provides a position: {', '.join(omitted_missing_positions) or 'none'}.",
        "Direct controls are written verbatim, including controls excluded only from the derived-position fit. Every other record is labeled as master-plan calibrated.",
    ]
    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    AUDIT_PATH.write_text("\n".join(report) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH} and {AUDIT_PATH}; selected {selected_model_by_cluster}")


if __name__ == "__main__":
    main()
