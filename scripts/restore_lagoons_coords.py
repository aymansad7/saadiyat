#!/usr/bin/env python3
"""Restore Lagoons coordinates to the values that existed at checkpoint 06ebce0
(the last good state before the recent regression).

Coordinates come from `git show 06ebce0:server/data/lagoons.json` and apply to both:
  - server/data/lagoons.json
  - client/src/data/lagoons.ts (TS file with embedded JSON literal + google_maps_url strings)
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Authoritative coords from the original commit
ORIGINAL = {
    "al-ghaf": {"lat": 24.5275, "lng": 54.441},
    "al-sidr": {"lat": 24.530, "lng": 54.4355},
    "ethir":   {"lat": 24.5352, "lng": 54.437},
}

def fmt(n: float) -> str:
    # Match the formatting style used in the repo (no trailing zeros for clean URLs)
    s = f"{n:.4f}".rstrip("0").rstrip(".")
    return s

def restore_server_json():
    p = ROOT / "server" / "data" / "lagoons.json"
    data = json.loads(p.read_text())
    # community_centroids
    if "community_centroids" in data:
        data["community_centroids"] = ORIGINAL
    # per-villa coords + google_maps_url
    villas = data.get("villas", [])
    for v in villas:
        cluster = v.get("cluster")
        coords = ORIGINAL.get(cluster)
        if not coords:
            continue
        # location field if present
        if "location" in v and isinstance(v["location"], dict):
            v["location"]["lat"] = coords["lat"]
            v["location"]["lng"] = coords["lng"]
        if "lat" in v:
            v["lat"] = coords["lat"]
        if "lng" in v:
            v["lng"] = coords["lng"]
        # google_maps_url
        if "google_maps_url" in v:
            v["google_maps_url"] = (
                f"https://www.google.com/maps/search/?api=1&query={fmt(coords['lat'])},{fmt(coords['lng'])}"
            )
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"Updated {p}")

def restore_client_ts():
    p = ROOT / "client" / "src" / "data" / "lagoons.ts"
    text = p.read_text()

    # Patch community_centroids block. The block looks like:
    #   "community_centroids": {
    #     "ethir": { "lat": 24.538, "lng": 54.45 },
    #     "al-sidr": { "lat": 24.5365, "lng": 54.451 },
    #     "al-ghaf": { "lat": 24.534, "lng": 54.4525 }
    #   },
    new_centroids = (
        '"community_centroids": {\n'
        '    "ethir": {\n'
        f'      "lat": {ORIGINAL["ethir"]["lat"]},\n'
        f'      "lng": {ORIGINAL["ethir"]["lng"]}\n'
        '    },\n'
        '    "al-sidr": {\n'
        f'      "lat": {ORIGINAL["al-sidr"]["lat"]},\n'
        f'      "lng": {ORIGINAL["al-sidr"]["lng"]}\n'
        '    },\n'
        '    "al-ghaf": {\n'
        f'      "lat": {ORIGINAL["al-ghaf"]["lat"]},\n'
        f'      "lng": {ORIGINAL["al-ghaf"]["lng"]}\n'
        '    }\n'
        '  }'
    )
    text = re.sub(
        r'"community_centroids":\s*\{[^}]*?"ethir":\s*\{[^}]*?\}[^}]*?"al-sidr":\s*\{[^}]*?\}[^}]*?"al-ghaf":\s*\{[^}]*?\}\s*\}',
        new_centroids,
        text,
        count=1,
        flags=re.DOTALL,
    )

    # Patch per-villa google_maps_url. Each villa has its cluster name on a nearby line.
    # Strategy: split into per-villa blocks (between "{" of villas array entries), and
    # within each block, replace the q=lat,lng inside google_maps_url based on that block's cluster.
    def repl_block(match: re.Match) -> str:
        block = match.group(0)
        m = re.search(r'"cluster":\s*"([^"]+)"', block)
        if not m:
            return block
        cluster = m.group(1)
        coords = ORIGINAL.get(cluster)
        if not coords:
            return block
        new_q = f'q={fmt(coords["lat"])},{fmt(coords["lng"])}'
        return re.sub(r'q=[\d.]+,[\d.]+', new_q, block)

    # Match each villa object in the villas array (between "{" and "}" containing "unit_number" and "cluster")
    text = re.sub(
        r'\{\s*"id":[^{}]*?"unit_number":[^{}]*?"cluster":[^{}]*?\}',
        repl_block,
        text,
        flags=re.DOTALL,
    )

    p.write_text(text)
    print(f"Updated {p}")

if __name__ == "__main__":
    restore_server_json()
    restore_client_ts()
    print("Done.")
