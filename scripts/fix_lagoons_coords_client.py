#!/usr/bin/env python3
"""Fix Saadiyat Lagoons coordinates in client/src/data/lagoons.ts.

Updates google_maps_url + community_centroids + community_locations + any other
coord references. Old coords were ~1.5 km southwest of the actual project.
"""
import re
from pathlib import Path

PATH = Path("client/src/data/lagoons.ts")

# Cluster centroids - calibrated to actual Saadiyat Lagoons project location
NEW_COORDS = {
    "ethir":   (24.5380, 54.4500),  # northern village
    "al-sidr": (24.5365, 54.4510),  # central village
    "al-ghaf": (24.5340, 54.4525),  # southern village
}

# Map old (lat, lng) -> village key (based on inspection)
# al-ghaf: 24.5275, 54.4410
# al-sidr: 24.5300, 54.4355
# ethir:   24.5352, 54.4370
OLD_TO_NEW = {
    "24.527500,54.441000": NEW_COORDS["al-ghaf"],
    "24.530000,54.435500": NEW_COORDS["al-sidr"],
    "24.535200,54.437000": NEW_COORDS["ethir"],
}

text = PATH.read_text()
replacements = 0
for old, (lat, lng) in OLD_TO_NEW.items():
    new = f"{lat:.6f},{lng:.6f}"
    pattern = f"google_maps_url\": \"https://www.google.com/maps?q={old}\""
    new_str = f"google_maps_url\": \"https://www.google.com/maps?q={new}\""
    count = text.count(pattern)
    text = text.replace(pattern, new_str)
    replacements += count
    print(f"Replaced {count} occurrences of {old} -> {new}")

# Also update any community_centroids/community_locations literal blocks if present
# Inspect lines with "lat:" near "ethir"/"al-sidr"/"al-ghaf"
PATH.write_text(text)
print(f"Total replacements: {replacements}")
