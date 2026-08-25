#!/usr/bin/env python3
"""Recalibrate the existing Four Seasons generated registry from official controls."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "client/src/data/fourSeasons.ts"

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

LATITUDE_COEFFICIENTS = [24.550907932884, 0.001473791523, -0.004810774057, 0.00151387505, 0.007477322992, -0.003276049735]
LONGITUDE_COEFFICIENTS = [54.436290640044, 0.005335294149, 0.005401578622, 0.001624938873, 0.000658385702, -0.000894037554]


def calibrated_coordinate(x_percent: float, y_percent: float) -> tuple[float, float]:
    x = x_percent / 100
    y = y_percent / 100
    features = [1.0, x, y, x * x, x * y, y * y]
    return (
        sum(coefficient * value for coefficient, value in zip(LATITUDE_COEFFICIENTS, features)),
        sum(coefficient * value for coefficient, value in zip(LONGITUDE_COEFFICIENTS, features)),
    )


def main() -> None:
    text = DATA_PATH.read_text(encoding="utf-8")
    match = re.search(
        r"export const FOUR_SEASONS_VILLAS = (\[.*\]) as const satisfies readonly FourSeasonsVilla\[\];",
        text,
        re.DOTALL,
    )
    if not match:
        raise SystemExit("Could not parse FOUR_SEASONS_VILLAS")
    villas = json.loads(match.group(1))
    if len(villas) != 56:
        raise SystemExit(f"Expected 56 villas, found {len(villas)}")

    for villa in villas:
        control = CONTROLS.get(villa["villaNumber"])
        if control:
            villa["latitude"] = control["lat"]
            villa["longitude"] = control["lng"]
            villa["sdn3PlotNumber"] = control["plot"]
            villa["positionSource"] = "user_supplied_sdn3_coordinate"
        else:
            latitude, longitude = calibrated_coordinate(villa["xPercent"], villa["yPercent"])
            villa["latitude"] = round(latitude, 8)
            villa["longitude"] = round(longitude, 8)
            villa["sdn3PlotNumber"] = None
            villa["positionSource"] = "masterplan_quadratic_calibrated_to_sdn3_controls"

    serialized = json.dumps(villas, indent=2, ensure_ascii=False)
    text = text[: match.start(1)] + serialized + text[match.end(1) :]
    old_type = '  positionSource: "masterplan_calibrated_to_dcr";'
    new_type = (
        "  sdn3PlotNumber: number | null;\n"
        '  positionSource: "user_supplied_sdn3_coordinate" | '
        '"masterplan_quadratic_calibrated_to_sdn3_controls";'
    )
    if old_type not in text and "sdn3PlotNumber: number | null;" not in text:
        raise SystemExit("Could not locate FourSeasonsVilla positionSource type")
    text = text.replace(old_type, new_type)
    DATA_PATH.write_text(text, encoding="utf-8")
    print(f"Recalibrated {len(villas)} villas with {len(CONTROLS)} direct controls → {DATA_PATH}")


if __name__ == "__main__":
    main()
