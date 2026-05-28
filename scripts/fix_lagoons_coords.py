"""
Correct Saadiyat Lagoons cluster coordinates.

Previous (incorrect ~1.5km SW of project):
  al-ghaf 24.527500, 54.441000
  al-sidr 24.530000, 54.435500
  ethir   24.535200, 54.437000

New (within the real project footprint, verified via satellite imagery):
  ethir   24.5380, 54.4500   # northern part of Lagoons
  al-sidr 24.5365, 54.4510   # central part
  al-ghaf 24.5340, 54.4525   # southern part
"""
import json
from pathlib import Path

NEW_COORDS = {
    "ethir":   (24.5380, 54.4500),
    "al-sidr": (24.5365, 54.4510),
    "al-ghaf": (24.5340, 54.4525),
}

src = Path("server/data/lagoons.json")
data = json.loads(src.read_text())

updated = 0
for v in data["villas"]:
    cluster = v.get("cluster")
    if cluster in NEW_COORDS:
        lat, lng = NEW_COORDS[cluster]
        v["google_maps_url"] = f"https://www.google.com/maps?q={lat:.4f},{lng:.4f}"
        v["latitude"] = lat
        v["longitude"] = lng
        updated += 1

src.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
print(f"Updated coords on {updated} villas")
