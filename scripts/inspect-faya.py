#!/usr/bin/env python3
"""Inspect Faya Al Saadiyat units and identify its largest plots."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    matches: list[dict] = []
    for filename in ("aldar_saadiyat.json", "aldar_other.json"):
        path = ROOT / "server/data" / filename
        data = json.loads(path.read_text(encoding="utf-8"))
        for project in data.get("projects", []):
            if "faya" not in project.get("name", "").lower():
                continue
            units = [
                {**unit, "building_name": building.get("name")}
                for building in project.get("buildings", [])
                for unit in building.get("units", [])
            ]
            ranked = sorted(
                units,
                key=lambda unit: float(
                    unit.get("plot_area_sqm")
                    or unit.get("total_area_sqm")
                    or unit.get("saleable_area_sqm")
                    or 0
                ),
                reverse=True,
            )
            matches.append(
                {
                    "file": filename,
                    "project": project.get("name"),
                    "slug": project.get("slug"),
                    "unitCount": len(units),
                    "top10": [
                        {
                            "unit_name": unit.get("unit_name"),
                            "building": unit.get("building_name"),
                            "plot_area_sqm": unit.get("plot_area_sqm"),
                            "saleable_area_sqm": unit.get("saleable_area_sqm"),
                            "total_area_sqm": unit.get("total_area_sqm"),
                            "price_aed": unit.get("price_aed"),
                        }
                        for unit in ranked[:10]
                    ],
                    "contains403": [
                        {
                            "unit_name": unit.get("unit_name"),
                            "building": unit.get("building_name"),
                            "plot_area_sqm": unit.get("plot_area_sqm"),
                            "saleable_area_sqm": unit.get("saleable_area_sqm"),
                            "total_area_sqm": unit.get("total_area_sqm"),
                            "price_aed": unit.get("price_aed"),
                        }
                        for unit in units
                        if "403" in str(unit.get("unit_name", ""))
                    ],
                }
            )
    print(json.dumps(matches, indent=2))


if __name__ == "__main__":
    main()
