#!/usr/bin/env python3
"""Classify Saadiyat Reserve plots from the official colored vector boundaries.

The 2019 ArcMap PDF draws Phase 1, Phase 2 and Phase 3 as blue, purple and
green dashed closed boundaries. This script reconstructs each boundary from
the original vector line segments, closes the dash gaps, fills the polygons,
and samples every parsed plot label. Phase 3 is cross-validated against the
83 official Dunes villa IDs exposed by World of Aldar.
"""

from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path

import pymupdf
from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = Path("/home/ubuntu/upload/SaadiyatReservePlotsMasterplan.pdf")
PLOTS_PATH = ROOT / "tmp/saadiyat-reserve/plots-extracted.csv"
OUTPUT_PATH = ROOT / "tmp/saadiyat-reserve/plots-classified.csv"
REPORT_PATH = ROOT / "tmp/saadiyat-reserve/phase-classification-audit.md"
MASK_DIR = ROOT / "tmp/saadiyat-reserve/phase-masks"

SCALE = 1
BOUNDARY_WIDTH = 5
CLOSE_KERNEL = 11

PHASE_COLORS = {
    1: (0.0, 0.4392, 1.0),
    2: (0.5177, 0.0, 0.6588),
    3: (0.2196, 0.6588, 0.0),
}

DUNES_PLOTS = set(range(82, 131)) | {272, 274} | set(range(276, 308))


def rounded_color(color):
    return tuple(round(component, 4) for component in color)


def point(value):
    return (round(value.x * SCALE), round(value.y * SCALE))


def draw_item(draw: ImageDraw.ImageDraw, item, width: int) -> None:
    kind = item[0]
    if kind == "l":
        draw.line([point(item[1]), point(item[2])], fill=255, width=width)
    elif kind == "c":
        p0, p1, p2, p3 = item[1:5]
        samples = []
        for index in range(25):
            t = index / 24
            mt = 1 - t
            x = mt**3 * p0.x + 3 * mt**2 * t * p1.x + 3 * mt * t**2 * p2.x + t**3 * p3.x
            y = mt**3 * p0.y + 3 * mt**2 * t * p1.y + 3 * mt * t**2 * p2.y + t**3 * p3.y
            samples.append((round(x * SCALE), round(y * SCALE)))
        draw.line(samples, fill=255, width=width)
    elif kind == "re":
        rectangle = item[1]
        draw.rectangle(
            [
                round(rectangle.x0 * SCALE),
                round(rectangle.y0 * SCALE),
                round(rectangle.x1 * SCALE),
                round(rectangle.y1 * SCALE),
            ],
            outline=255,
            width=width,
        )


def build_boundary_layers(page):
    size = (round(page.rect.width * SCALE), round(page.rect.height * SCALE))
    masks = {phase: Image.new("L", size, 0) for phase in PHASE_COLORS}
    draws = {phase: ImageDraw.Draw(mask) for phase, mask in masks.items()}
    segment_counts = Counter()

    for drawing in page.get_drawings(extended=True):
        color = drawing.get("color")
        if not color or round(drawing.get("width") or 0, 3) != 2.979:
            continue
        rounded = rounded_color(color)
        phase = next((phase for phase, expected in PHASE_COLORS.items() if rounded == expected), None)
        if phase is None:
            continue
        for item in drawing["items"]:
            draw_item(draws[phase], item, BOUNDARY_WIDTH)
            segment_counts[phase] += 1

    MASK_DIR.mkdir(parents=True, exist_ok=True)
    for phase, boundary in masks.items():
        boundary.save(MASK_DIR / f"phase-{phase}-boundary.png")
    global_boundary = Image.new("L", size, 0)
    for boundary in masks.values():
        global_boundary = ImageChops.lighter(global_boundary, boundary)
    closed = global_boundary.filter(ImageFilter.MaxFilter(CLOSE_KERNEL)).filter(ImageFilter.MinFilter(CLOSE_KERNEL))
    global_boundary.save(MASK_DIR / "all-phases-boundary.png")
    closed.save(MASK_DIR / "all-phases-closed.png")
    return closed, segment_counts


def build_component_masks(closed_boundary: Image.Image, plots_by_number: dict[int, dict]) -> dict[int, Image.Image]:
    # Seeds are visually unambiguous interior plots on the official phase plan.
    seed_plots = {1: 200, 2: 172, 3: 100}
    masks = {}
    for phase, plot_number in seed_plots.items():
        plot = plots_by_number[plot_number]
        seed = (round(float(plot["pdf_x"]) * SCALE), round(float(plot["pdf_y"]) * SCALE))
        flooded = closed_boundary.copy()
        ImageDraw.floodfill(flooded, seed, 128, thresh=0)
        component = flooded.point(lambda pixel: 255 if pixel == 128 else 0)
        component.save(MASK_DIR / f"phase-{phase}-mask.png")
        masks[phase] = component
    return masks


def main() -> None:
    document = pymupdf.open(PDF_PATH)
    page = document[0]
    closed_boundary, segment_counts = build_boundary_layers(page)

    with PLOTS_PATH.open(newline="", encoding="utf-8") as handle:
        plots = list(csv.DictReader(handle))
    plots_by_number = {int(plot["plot_number"]): plot for plot in plots}
    masks = build_component_masks(closed_boundary, plots_by_number)

    ambiguous = []
    unclassified = []
    for plot in plots:
        x = round(float(plot["pdf_x"]) * SCALE)
        y = round(float(plot["pdf_y"]) * SCALE)
        matched = [phase for phase, mask in masks.items() if mask.getpixel((x, y)) > 0]
        if len(matched) == 1:
            plot["phase"] = str(matched[0])
        elif len(matched) > 1:
            plot["phase"] = ""
            ambiguous.append((int(plot["plot_number"]), matched))
        else:
            plot["phase"] = ""
            unclassified.append(int(plot["plot_number"]))

        plot_number = int(plot["plot_number"])
        if plot_number == 21:
            plot["phase"] = "1"
            if plot_number in unclassified:
                unclassified.remove(plot_number)
        plot["inventory_kind"] = "dunes_built_villa" if plot_number in DUNES_PLOTS else "reserve_land"
        plot["phase_source"] = (
            "user_confirmed_phase_control"
            if plot_number == 21
            else "official_2019_masterplan_vector_boundary"
        )

    fieldnames = list(plots[0].keys())
    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(plots)

    phase_counts = Counter(plot["phase"] or "unclassified" for plot in plots)
    classified_phase3 = {
        int(plot["plot_number"])
        for plot in plots
        if plot["phase"] == "3"
    }
    missing_dunes = sorted(DUNES_PLOTS - classified_phase3)
    extra_phase3 = sorted(classified_phase3 - DUNES_PLOTS)

    lines = [
        "# Saadiyat Reserve phase-classification audit",
        "",
        f"- Parsed plots: {len(plots)}",
        f"- Vector boundary segments: {dict(sorted(segment_counts.items()))}",
        f"- Phase counts: {dict(sorted(phase_counts.items()))}",
        f"- Ambiguous plot centers: {ambiguous or 'None'}",
        f"- Unclassified plot centers: {unclassified or 'None'}",
        f"- Official Dunes plots missing from Phase 3 mask: {missing_dunes or 'None'}",
        f"- Phase 3 mask plots absent from official Dunes inventory: {extra_phase3 or 'None'}",
    ]
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    document.close()
    print("\n".join(lines[2:]))
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Wrote {REPORT_PATH}")


if __name__ == "__main__":
    main()
