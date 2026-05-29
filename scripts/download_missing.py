#!/usr/bin/env python3
"""Download missing DCR PDFs via Wayback Machine.

Strategy:
1. Query CDX API to find any existing snapshot
2. Fetch raw bytes via /web/<ts>id_/<origin> for the latest available snapshot
3. Fallback: try /save/ (save-now) endpoint
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path("/home/ubuntu/backups/raw")
MISSING_FILE = Path("/home/ubuntu/saadiyat/scripts/missing_pdfs.json")
LOG_FILE = Path("/home/ubuntu/backups/missing_download.log")

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"

def is_pdf(buf: bytes) -> bool:
    return len(buf) >= 100_000 and buf[:4] == b"%PDF"

def cdx_lookup(origin: str):
    """Return latest available snapshot timestamp or None."""
    cdx_url = (
        "https://web.archive.org/cdx/search/cdx?"
        + urllib.parse.urlencode({
            "url": origin,
            "output": "json",
            "limit": "-5",  # last 5 (newest)
            "filter": "statuscode:200",
            "fl": "timestamp,original",
        })
    )
    req = urllib.request.Request(cdx_url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read())
        # Skip header row
        rows = data[1:]
        if not rows:
            return None
        # Take the newest
        return rows[-1][0]
    except Exception as e:
        return None

def fetch_pdf(origin: str, ts: str) -> bytes | None:
    """Fetch raw PDF bytes from Wayback at a specific timestamp."""
    url = f"https://web.archive.org/web/{ts}id_/{origin}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read()
    except Exception:
        return None

def fetch_one(rel_path: str, origin: str):
    out = ROOT / rel_path
    if out.exists() and out.stat().st_size >= 100_000:
        return rel_path, "cached"
    out.parent.mkdir(parents=True, exist_ok=True)
    ts = cdx_lookup(origin)
    if ts is None:
        return rel_path, "no_snapshot"
    buf = fetch_pdf(origin, ts)
    if buf is None or not is_pdf(buf):
        return rel_path, f"bad_pdf(size={len(buf) if buf else 0})"
    out.write_bytes(buf)
    return rel_path, f"OK ({len(buf)//1024} KB) ts={ts}"

def main():
    missing = json.loads(MISSING_FILE.read_text())
    targets = []
    for gate, files in missing.items():
        for f in files:
            origin = f"https://geosmart.dmt.gov.ae/dcr/{f}"
            rel = f"{gate}/{f}"
            targets.append((rel, origin))
    print(f"Total to fetch: {len(targets)}")
    log_lines = []
    ok = 0
    fail = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        fut = {ex.submit(fetch_one, r, o): (r, o) for r, o in targets}
        for i, f in enumerate(as_completed(fut), 1):
            rel, status = f.result()
            line = f"[{i:3d}/{len(targets)}] {rel}: {status}"
            print(line, flush=True)
            log_lines.append(line)
            if status.startswith("OK") or status == "cached":
                ok += 1
            else:
                fail += 1
    LOG_FILE.write_text("\n".join(log_lines))
    print(f"\nDone. OK={ok}, FAIL={fail}, total={len(targets)}")

if __name__ == "__main__":
    main()
