"""Apply non-conflicting user-supplied Four Seasons controls and recalibrate derived markers.

The six ambiguous villa/plot assertions remain untouched until the user resolves them.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "client/src/data/fourSeasons.ts"
CONTROL_PATH = ROOT / "server/data/four-seasons-user-controls-2026-08-27.json"
REPORT_PATH = ROOT / "tmp/four-seasons-controls-apply.md"
AMBIGUOUS_VILLAS = {10, 15, 16, 20, 34, 35}


def features(x: float, y: float) -> list[float]:
    return [1.0, x, y, x * x, x * y, y * y]


def parse_villas(text: str) -> tuple[list[dict], re.Match[str]]:
    match = re.search(
        r"export const FOUR_SEASONS_VILLAS = (\[.*\]) as const satisfies readonly FourSeasonsVilla\[\];",
        text,
        re.DOTALL,
    )
    if not match:
        raise SystemExit("Could not parse FOUR_SEASONS_VILLAS")
    return json.loads(match.group(1)), match


def main() -> None:
    source = DATA_PATH.read_text(encoding="utf-8")
    villas, match = parse_villas(source)
    supplied = json.loads(CONTROL_PATH.read_text(encoding="utf-8"))
    by_villa = {villa["villaNumber"]: villa for villa in villas}

    # Retain all established direct controls (for example Villas 1 and 9). The
    # accepted new controls below supersede a same-villa coordinate such as 19.
    direct: dict[int, dict[str, float | int | str]] = {
        villa["villaNumber"]: {
            "plot": villa["sdn3PlotNumber"],
            "latitude": villa["latitude"],
            "longitude": villa["longitude"],
            "source": "previous user-supplied control",
        }
        for villa in villas
        if villa["positionSource"] == "user_supplied_sdn3_coordinate"
    }
    applied: list[int] = []
    withheld: list[int] = []
    for control in supplied:
        villa_number = control["villa"]
        if villa_number in AMBIGUOUS_VILLAS:
            withheld.append(villa_number)
            continue
        if villa_number not in by_villa:
            raise SystemExit(f"Unknown villa {villa_number}")
        direct[villa_number] = control
        applied.append(villa_number)

    points = []
    for villa_number, control in direct.items():
        villa = by_villa[villa_number]
        points.append(
            {
                "villa": villa_number,
                "x": villa["xPercent"] / 100,
                "y": villa["yPercent"] / 100,
                "latitude": float(control["latitude"]),
                "longitude": float(control["longitude"]),
            }
        )
    matrix = np.array([features(point["x"], point["y"]) for point in points])
    latitude_coefficients = np.linalg.lstsq(matrix, np.array([point["latitude"] for point in points]), rcond=None)[0]
    longitude_coefficients = np.linalg.lstsq(matrix, np.array([point["longitude"] for point in points]), rcond=None)[0]

    for villa in villas:
        direct_control = direct.get(villa["villaNumber"])
        if direct_control:
            villa["latitude"] = float(direct_control["latitude"])
            villa["longitude"] = float(direct_control["longitude"])
            villa["sdn3PlotNumber"] = int(direct_control["plot"])
            villa["positionSource"] = "user_supplied_sdn3_coordinate"
            continue
        vector = np.array(features(villa["xPercent"] / 100, villa["yPercent"] / 100))
        villa["latitude"] = round(float(vector @ latitude_coefficients), 8)
        villa["longitude"] = round(float(vector @ longitude_coefficients), 8)
        villa["sdn3PlotNumber"] = None
        villa["positionSource"] = "masterplan_quadratic_calibrated_to_sdn3_controls"

    serialized = json.dumps(villas, indent=2, ensure_ascii=False)
    DATA_PATH.write_text(source[: match.start(1)] + serialized + source[match.end(1) :], encoding="utf-8")
    lines = [
        "# Four Seasons Control Application — 27 Aug 2026",
        "",
        f"Applied {len(applied)} non-conflicting new direct controls and retained {len(direct) - len(applied)} previously direct user controls.",
        "",
        "## Withheld pending user confirmation",
        "",
        "- Villa 10 and Villa 20 both claim SDN3 Plot 101.",
        "- Villa 15 and Villa 16 both claim SDN3 Plot 96.",
        "- Villa 34 claims Plot 115 while the existing direct Villa 35 control is Plot 115; the new Villa 35 record instead claims Plot 116.",
        "",
        f"Applied new villas: {', '.join(map(str, applied))}.",
        "",
        "All other markers were recalibrated from the combined accepted direct controls using a quadratic master-plan transform. No ambiguous villa-to-plot association was overwritten.",
    ]
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Applied {len(applied)} controls; retained {len(direct)} direct controls; withheld {sorted(set(withheld))}")


if __name__ == "__main__":
    main()
