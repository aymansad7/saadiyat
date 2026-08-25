"""Extract authoritative DCR facts from the downloaded Hidden Lagoons range.

This script reads only successfully downloaded PDFs, extracts their DCR tables,
converts WGS84 UTM Zone 40N plot boundaries, and keeps every parse failure explicit.
"""

from __future__ import annotations

import json
import math
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "tmp/sl9-dcrs/pdfs"
TEXT_DIR = ROOT / "tmp/sl9-dcrs/text"
OUTPUT = ROOT / "tmp/sl9-dcrs/extracted-records.json"

ADM_RE = re.compile(r"ADM\s+PLOT\s+ID\s*:\s*(\d+)", re.IGNORECASE)
ALDAR_RE = re.compile(r"ALDAR\s+PLOT\s+ID\s*:\s*([A-Z0-9-]+)", re.IGNORECASE)
TYPOLOGY_RE = re.compile(r"Plot\s+Typology\s+([A-Za-z0-9 .&/-]+?)\s+(?:FAR|Plot\s+Area)", re.IGNORECASE)
AREA_RE = re.compile(r"Plot\s+Area\s+([\d,]+(?:\.\d+)?)\s*Sqm", re.IGNORECASE)
GFA_RE = re.compile(r"Max\.\s+Gross\s+Floor\s+Area\s*\(GFA\)\s+([\d,]+(?:\.\d+)?)\s*Sqm", re.IGNORECASE)
POINT_RE = re.compile(r"^\s*([A-Z])\s+(\d{7}\.\d+)\s+(\d{6}\.\d+)", re.MULTILINE)


def utm_to_latlon(easting: float, northing: float, zone: int = 40) -> tuple[float, float]:
    semi_major = 6_378_137.0
    flattening = 1 / 298.257223563
    eccentricity_sq = 2 * flattening - flattening * flattening
    eccentricity_prime_sq = eccentricity_sq / (1 - eccentricity_sq)
    scale = 0.9996
    x = easting - 500_000
    meridional_arc = northing / scale
    mu = meridional_arc / (semi_major * (1 - eccentricity_sq / 4 - 3 * eccentricity_sq**2 / 64 - 5 * eccentricity_sq**3 / 256))
    e1 = (1 - math.sqrt(1 - eccentricity_sq)) / (1 + math.sqrt(1 - eccentricity_sq))
    phi1 = mu + (3 * e1 / 2 - 27 * e1**3 / 32) * math.sin(2 * mu) + (21 * e1**2 / 16 - 55 * e1**4 / 32) * math.sin(4 * mu) + (151 * e1**3 / 96) * math.sin(6 * mu)
    n1 = semi_major / math.sqrt(1 - eccentricity_sq * math.sin(phi1) ** 2)
    t1 = math.tan(phi1) ** 2
    c1 = eccentricity_prime_sq * math.cos(phi1) ** 2
    r1 = semi_major * (1 - eccentricity_sq) / (1 - eccentricity_sq * math.sin(phi1) ** 2) ** 1.5
    d = x / (n1 * scale)
    latitude = phi1 - (n1 * math.tan(phi1) / r1) * (d**2 / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1**2 - 9 * eccentricity_prime_sq) * d**4 / 24 + (61 + 90 * t1 + 298 * c1 + 45 * t1**2 - 252 * eccentricity_prime_sq - 3 * c1**2) * d**6 / 720)
    central_meridian = math.radians((zone - 1) * 6 - 180 + 3)
    longitude = central_meridian + (d - (1 + 2 * t1 + c1) * d**3 / 6 + (5 - 2 * c1 + 28 * t1 - 3 * c1**2 + 8 * eccentricity_prime_sq + 24 * t1**2) * d**5 / 120) / math.cos(phi1)
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
        return sum(point[0] for point in points) / len(points), sum(point[1] for point in points) / len(points)
    return centroid_x / (6 * signed_area), centroid_y / (6 * signed_area)


def clean(match: re.Match[str] | None) -> str | None:
    return re.sub(r"\s+", " ", match.group(1)).strip() if match else None


def parse_pdf(pdf: Path) -> dict:
    text_path = TEXT_DIR / f"{pdf.stem}.txt"
    subprocess.run(["pdftotext", "-layout", str(pdf), str(text_path)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    text = text_path.read_text(encoding="utf-8", errors="replace")
    adm_plot = clean(ADM_RE.search(text))
    aldar_plot = clean(ALDAR_RE.search(text))
    typology = clean(TYPOLOGY_RE.search(text))
    area_text = clean(AREA_RE.search(text))
    gfa_text = clean(GFA_RE.search(text))
    raw_points = [(float(easting), float(northing)) for _, northing, easting in POINT_RE.findall(text)]
    if not (adm_plot and aldar_plot and area_text and len(raw_points) >= 3):
        missing = []
        if not adm_plot: missing.append("ADM plot")
        if not aldar_plot: missing.append("Aldar plot")
        if not area_text: missing.append("plot area")
        if len(raw_points) < 3: missing.append("coordinate table")
        return {"dcrId": pdf.stem, "sourceUrl": f"https://geosmart.dmt.gov.ae/dcr/{pdf.stem}.pdf", "parseStatus": "incomplete", "missing": missing}
    centroid_easting, centroid_northing = polygon_centroid(raw_points)
    latitude, longitude = utm_to_latlon(centroid_easting, centroid_northing)
    phase_match = re.match(r"(SL\d+)-", aldar_plot, re.IGNORECASE)
    boundary = []
    for easting, northing in raw_points:
        lat, lng = utm_to_latlon(easting, northing)
        boundary.append({"lat": round(lat, 8), "lng": round(lng, 8)})
    plot_area = float(area_text.replace(",", ""))
    return {
        "dcrId": pdf.stem,
        "sourceUrl": f"https://geosmart.dmt.gov.ae/dcr/{pdf.stem}.pdf",
        "parseStatus": "complete",
        "admPlotId": int(adm_plot),
        "aldarPlotId": aldar_plot,
        "aldarPhase": phase_match.group(1).upper() if phase_match else None,
        "typology": typology,
        "plotAreaSqm": plot_area,
        "plotAreaSqft": round(plot_area * 10.7639104167, 2),
        "maxGfaSqm": float(gfa_text.replace(",", "")) if gfa_text else None,
        "centroid": {"lat": round(latitude, 8), "lng": round(longitude, 8)},
        "boundary": boundary,
        "googleMapsUrl": f"https://www.google.com/maps?q={latitude:.8f},{longitude:.8f}",
        "dmtUrl": f"https://geosmart.dmt.gov.ae/dcr/{pdf.stem}.pdf",
    }


def safe_parse(pdf: Path) -> dict:
    try:
        return parse_pdf(pdf)
    except Exception as error:
        return {"dcrId": pdf.stem, "sourceUrl": f"https://geosmart.dmt.gov.ae/dcr/{pdf.stem}.pdf", "parseStatus": "error", "error": str(error)}


def main() -> None:
    TEXT_DIR.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(PDF_DIR.glob("SDE3_*.pdf"))
    with ThreadPoolExecutor(max_workers=8) as executor:
        records = list(executor.map(safe_parse, pdfs))
    records.sort(key=lambda record: int(record["dcrId"].split("_")[1]))
    summary = {
        "downloadedPdfCount": len(pdfs),
        "completeCount": sum(record["parseStatus"] == "complete" for record in records),
        "incompleteCount": sum(record["parseStatus"] == "incomplete" for record in records),
        "errorCount": sum(record["parseStatus"] == "error" for record in records),
        "phaseCounts": {},
        "records": records,
    }
    for record in records:
        if record.get("aldarPhase"):
            summary["phaseCounts"][record["aldarPhase"]] = summary["phaseCounts"].get(record["aldarPhase"], 0) + 1
    OUTPUT.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps({key: summary[key] for key in ("downloadedPdfCount", "completeCount", "incompleteCount", "errorCount", "phaseCounts")}))


if __name__ == "__main__":
    main()
