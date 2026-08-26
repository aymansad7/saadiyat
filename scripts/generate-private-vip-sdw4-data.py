#!/usr/bin/env python3
"""Generate source-backed Private Owners VIP and SDW4 Building Plot registries.

Reads the DCR probe manifest, downloads only accessible official GeoSmart PDFs,
extracts each official UTM Zone 40N boundary table, converts its centroid to
WGS84 and writes a TypeScript data registry. Missing PDFs stay out of the
registry; no position or availability is invented.
"""
from __future__ import annotations

import json
import re
import subprocess
import urllib.request
from math import cos, pi, sin, sqrt, tan
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROBE = ROOT / "scripts/source-data/private-vip-sdw4-dcr-probe.json"
CENTROIDS = ROOT / "scripts/source-data/sdw4-dcr-centroids.json"
TMP = ROOT / "tmp/private-vip-sdw4-dcr"
OUT = ROOT / "client/src/data/privateOwnersVip.ts"


def utm40n_to_lat_lng(easting: float, northing: float) -> tuple[float, float]:
    """WGS84 UTM Zone 40N inverse projection, returned as latitude, longitude."""
    a, ecc_sq, k0 = 6378137.0, 0.00669438, 0.9996
    ecc_prime_sq = ecc_sq / (1 - ecc_sq)
    e1 = (1 - sqrt(1 - ecc_sq)) / (1 + sqrt(1 - ecc_sq))
    x, y = easting - 500000.0, northing
    m = y / k0
    mu = m / (a * (1 - ecc_sq / 4 - 3 * ecc_sq**2 / 64 - 5 * ecc_sq**3 / 256))
    phi1 = mu + (3 * e1 / 2 - 27 * e1**3 / 32) * sin(2 * mu) + (21 * e1**2 / 16 - 55 * e1**4 / 32) * sin(4 * mu) + (151 * e1**3 / 96) * sin(6 * mu)
    n1 = a / sqrt(1 - ecc_sq * sin(phi1) ** 2)
    t1, c1 = tan(phi1) ** 2, ecc_prime_sq * cos(phi1) ** 2
    r1 = a * (1 - ecc_sq) / (1 - ecc_sq * sin(phi1) ** 2) ** 1.5
    d = x / (n1 * k0)
    lat = phi1 - (n1 * tan(phi1) / r1) * (d**2 / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1**2 - 9 * ecc_prime_sq) * d**4 / 24 + (61 + 90 * t1 + 298 * c1 + 45 * t1**2 - 252 * ecc_prime_sq - 3 * c1**2) * d**6 / 720)
    lng = (d - (1 + 2 * t1 + c1) * d**3 / 6 + (5 - 2 * c1 + 28 * t1 - 3 * c1**2 + 8 * ecc_prime_sq + 24 * t1**2) * d**5 / 120) / cos(phi1)
    return round(lat * 180 / pi, 7), round((lng * 180 / pi) + 57, 7)


def extract_centroid(identifier: str) -> tuple[float, float] | None:
    TMP.mkdir(parents=True, exist_ok=True)
    pdf = TMP / f"{identifier}.pdf"
    if not pdf.exists():
        urllib.request.urlretrieve(f"https://geosmart.dmt.gov.ae/dcr/{identifier}.pdf", pdf)
    text = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], check=True, capture_output=True, text=True).stdout
    matches = re.findall(r"^\s*\d+\s+(2\d{5}\.\d+)\s+(2\d{6}\.\d+)", text, flags=re.MULTILINE)
    points = [(float(easting), float(northing)) for easting, northing in matches]
    if len(points) < 3:
        return None
    easting = sum(point[0] for point in points) / len(points)
    northing = sum(point[1] for point in points) / len(points)
    return utm40n_to_lat_lng(easting, northing)


def quoted(value: object) -> str:
    return json.dumps(value, ensure_ascii=False)


def main() -> None:
    raw = json.loads(PROBE.read_text())
    centroid_raw = json.loads(CENTROIDS.read_text())
    documented_centroids = {
        item["output"]["dcr_id"]: item["output"]["centroid"]
        for item in centroid_raw["results"]
        if item["output"].get("readable") and item["output"].get("centroid") not in {None, "NOT AVAILABLE"}
    }
    private, buildings, unavailable = [], [], []
    for result in raw["results"]:
        item = result["output"]
        identifier = item["dcr_id"]
        if item.get("accessible") is not True:
            unavailable.append(identifier)
            continue
        try:
            if identifier in documented_centroids:
                lat, lng = documented_centroids[identifier].split(",")
                centroid = (float(lat), float(lng))
            else:
                centroid = extract_centroid(identifier)
        except Exception as error:
            print(f"Skipping {identifier}: {error}")
            unavailable.append(identifier)
            continue
        if not centroid:
            print(f"Skipping {identifier}: official UTM table not parsed")
            unavailable.append(identifier)
            continue
        record = {
            "id": identifier,
            "villaKey": f"{'private-owners-vip' if identifier.startswith('SDN3_') else 'building-plots-sdw4'}/{identifier}",
            "plotNumber": item["plot_number"],
            "projectLabel": item["project_label"],
            "landSqm": item["land_area_sqm"],
            "landSqft": round(item["land_area_sqm"] * 10.764, 2),
            "maxGfaSqm": item["built_area_sqm"],
            "maxGfaSqft": round(item["built_area_sqm"] * 10.764, 2),
            "latitude": centroid[0],
            "longitude": centroid[1],
            "dcrUrl": f"https://geosmart.dmt.gov.ae/dcr/{identifier}.pdf",
            "googleMapsUrl": f"https://www.google.com/maps?q={centroid[0]},{centroid[1]}",
            "locationSource": "Official DCR UTM boundary centroid",
        }
        (private if identifier.startswith("SDN3_") else buildings).append(record)

    def emit_records(records: list[dict]) -> str:
        return "[\n" + ",\n".join("  " + quoted(row) for row in records) + "\n]"

    OUT.write_text(
        "// Generated by scripts/generate-private-vip-sdw4-data.py from official GeoSmart DCRs.\n"
        "// Coordinates are centroids of the official UTM Zone 40N plot-boundary tables.\n\n"
        "export type DcrCommunityPlot = {\n"
        "  id: string; villaKey: string; plotNumber: string; projectLabel: string; landSqm: number; landSqft: number; maxGfaSqm: number; maxGfaSqft: number;\n"
        "  latitude: number; longitude: number; dcrUrl: string; googleMapsUrl: string; locationSource: string;\n"
        "};\n\n"
        f"export const PRIVATE_OWNERS_VIP_PLOTS: DcrCommunityPlot[] = {emit_records(private)};\n\n"
        f"export const BUILDING_PLOTS_SDW4: DcrCommunityPlot[] = {emit_records(buildings)};\n\n"
        f"export const PRIVATE_OWNERS_VIP_UNAVAILABLE_DCRS = {quoted([item for item in unavailable if item.startswith('SDN3_')])} as const;\n"
        f"export const BUILDING_PLOTS_SDW4_UNAVAILABLE_DCRS = {quoted([item for item in unavailable if item.startswith('SDW4_')])} as const;\n"
    )
    print(json.dumps({"private_records": len(private), "building_records": len(buildings), "unavailable": unavailable}, indent=2))


if __name__ == "__main__":
    main()
