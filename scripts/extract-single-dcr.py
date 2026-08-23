#!/usr/bin/env python3
"""Extract plot area and UTM Zone 40N boundary/centroid from a DCR text file."""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path


AREA_RE = re.compile(r"PLOT AREA\s+([\d,]+(?:\.\d+)?)\s+sq\.m", re.IGNORECASE)
POINT_RE = re.compile(r"^\s*(\d+)\s+(\d{6}\.\d+)\s+(\d{7}\.\d+)", re.MULTILINE)


def utm_to_latlon(easting: float, northing: float, zone: int = 40) -> tuple[float, float]:
    """Convert WGS84 UTM Zone 40N coordinates to latitude/longitude."""
    semi_major = 6_378_137.0
    flattening = 1 / 298.257223563
    eccentricity_sq = 2 * flattening - flattening * flattening
    eccentricity_prime_sq = eccentricity_sq / (1 - eccentricity_sq)
    scale = 0.9996
    x = easting - 500_000
    meridional_arc = northing / scale
    mu = meridional_arc / (
        semi_major
        * (
            1
            - eccentricity_sq / 4
            - 3 * eccentricity_sq**2 / 64
            - 5 * eccentricity_sq**3 / 256
        )
    )
    e1 = (1 - math.sqrt(1 - eccentricity_sq)) / (1 + math.sqrt(1 - eccentricity_sq))
    phi1 = (
        mu
        + (3 * e1 / 2 - 27 * e1**3 / 32) * math.sin(2 * mu)
        + (21 * e1**2 / 16 - 55 * e1**4 / 32) * math.sin(4 * mu)
        + (151 * e1**3 / 96) * math.sin(6 * mu)
    )
    n1 = semi_major / math.sqrt(1 - eccentricity_sq * math.sin(phi1) ** 2)
    t1 = math.tan(phi1) ** 2
    c1 = eccentricity_prime_sq * math.cos(phi1) ** 2
    r1 = semi_major * (1 - eccentricity_sq) / (1 - eccentricity_sq * math.sin(phi1) ** 2) ** 1.5
    d = x / (n1 * scale)
    latitude = phi1 - (n1 * math.tan(phi1) / r1) * (
        d**2 / 2
        - (5 + 3 * t1 + 10 * c1 - 4 * c1**2 - 9 * eccentricity_prime_sq) * d**4 / 24
        + (61 + 90 * t1 + 298 * c1 + 45 * t1**2 - 252 * eccentricity_prime_sq - 3 * c1**2)
        * d**6
        / 720
    )
    central_meridian = math.radians((zone - 1) * 6 - 180 + 3)
    longitude = central_meridian + (
        d
        - (1 + 2 * t1 + c1) * d**3 / 6
        + (5 - 2 * c1 + 28 * t1 - 3 * c1**2 + 8 * eccentricity_prime_sq + 24 * t1**2)
        * d**5
        / 120
    ) / math.cos(phi1)
    return math.degrees(latitude), math.degrees(longitude)


def polygon_centroid(points: list[tuple[float, float]]) -> tuple[float, float]:
    signed_area = 0.0
    centroid_x = 0.0
    centroid_y = 0.0
    for index, (x0, y0) in enumerate(points):
        x1, y1 = points[(index + 1) % len(points)]
        cross = x0 * y1 - x1 * y0
        signed_area += cross
        centroid_x += (x0 + x1) * cross
        centroid_y += (y0 + y1) * cross
    signed_area *= 0.5
    if abs(signed_area) < 1e-9:
        return (
            sum(point[0] for point in points) / len(points),
            sum(point[1] for point in points) / len(points),
        )
    return centroid_x / (6 * signed_area), centroid_y / (6 * signed_area)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: extract-single-dcr.py <pdftotext-output.txt>")
    text_path = Path(sys.argv[1])
    text = text_path.read_text(encoding="utf-8", errors="replace")
    area_match = AREA_RE.search(text)
    points = [(float(easting), float(northing)) for _, easting, northing in POINT_RE.findall(text)]
    if not area_match or len(points) < 3:
        raise SystemExit("Could not find plot area and at least three coordinate points")

    centroid_easting, centroid_northing = polygon_centroid(points)
    latitude, longitude = utm_to_latlon(centroid_easting, centroid_northing)
    boundary = []
    for easting, northing in points:
        lat, lng = utm_to_latlon(easting, northing)
        boundary.append({"lat": round(lat, 8), "lng": round(lng, 8)})

    result = {
        "plotAreaSqm": float(area_match.group(1).replace(",", "")),
        "plotAreaSqft": round(float(area_match.group(1).replace(",", "")) * 10.7639104167, 2),
        "centroid": {"lat": round(latitude, 8), "lng": round(longitude, 8)},
        "boundary": boundary,
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
