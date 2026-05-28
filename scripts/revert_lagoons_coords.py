#!/usr/bin/env python3
"""Revert Lagoons Google Maps coordinates to the values in checkpoint 06ebce0
(pre-2026-05-28 'fix'). Updates both server JSON and client TS files."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SERVER_JSON = ROOT / "server" / "data" / "lagoons.json"
CLIENT_TS = ROOT / "client" / "src" / "data" / "lagoons.ts"

# Original coords (from git show 06ebce0:server/data/lagoons.json)
ORIGINAL = {
    "al-ghaf": ("24.527500", "54.441000"),
    "al-sidr": ("24.530000", "54.435500"),
    "ethir":   ("24.535200", "54.437000"),
}


def revert_server_json():
    data = json.loads(SERVER_JSON.read_text())
    n = 0
    for v in data["villas"]:
        c = v.get("cluster")
        if c in ORIGINAL:
            lat, lng = ORIGINAL[c]
            v["google_maps_url"] = f"https://www.google.com/maps?q={lat},{lng}"
            n += 1
    SERVER_JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"server JSON: reverted {n} villas")


def revert_client_ts():
    text = CLIENT_TS.read_text()
    # The TS file has community_centroids and per-villa google_maps_url strings.
    # Replace any q=lat,lng for the three clusters by re-mapping based on the
    # cluster name in nearby context. Simpler: do raw string substitution of
    # the new (current) coords back to the original ones.
    # The current (broken) coords we set: see fix_lagoons_coords_client.py
    CURRENT_TO_ORIGINAL = [
        # al-ghaf
        (("24.534000", "54.452500"), ORIGINAL["al-ghaf"]),
        # al-sidr
        (("24.536500", "54.451000"), ORIGINAL["al-sidr"]),
        # ethir
        (("24.538000", "54.450000"), ORIGINAL["ethir"]),
    ]
    n = 0
    for (cur_lat, cur_lng), (orig_lat, orig_lng) in CURRENT_TO_ORIGINAL:
        cur_str = f"{cur_lat},{cur_lng}"
        orig_str = f"{orig_lat},{orig_lng}"
        n_local = text.count(cur_str)
        text = text.replace(cur_str, orig_str)
        n += n_local
        print(f"  replaced {cur_str} -> {orig_str} ({n_local} occurrences)")
    CLIENT_TS.write_text(text)
    print(f"client TS: total {n} substitutions")


if __name__ == "__main__":
    revert_server_json()
    revert_client_ts()
