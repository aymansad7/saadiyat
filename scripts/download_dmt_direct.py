#!/usr/bin/env python3
"""Download missing DCR PDFs directly from DMT GeoSmart."""
import json
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path("/home/ubuntu/backups/raw")
MISSING_FILE = Path("/home/ubuntu/saadiyat/scripts/missing_pdfs.json")
LOG_FILE = Path("/home/ubuntu/backups/dmt_direct_download.log")
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

def is_pdf(buf: bytes) -> bool:
    return len(buf) >= 100_000 and buf[:4] == b"%PDF"

def fetch_one(rel_path: str, origin: str):
    out = ROOT / rel_path
    if out.exists() and out.stat().st_size >= 100_000:
        return rel_path, "cached"
    out.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(3):
        try:
            req = urllib.request.Request(origin, headers={"User-Agent": UA, "Accept": "application/pdf"})
            with urllib.request.urlopen(req, timeout=60) as r:
                buf = r.read()
            if is_pdf(buf):
                out.write_bytes(buf)
                return rel_path, f"OK ({len(buf)//1024} KB)"
            else:
                if attempt == 2:
                    return rel_path, f"bad_pdf(size={len(buf)})"
        except Exception as e:
            if attempt == 2:
                return rel_path, f"err: {type(e).__name__}: {str(e)[:80]}"
        time.sleep(2.0)
    return rel_path, "exhausted"

def main():
    missing = json.loads(MISSING_FILE.read_text())
    targets = []
    for gate, files in missing.items():
        for f in files:
            origin = f"https://geosmart.dmt.gov.ae/dcr/{f}"
            rel = f"{gate}/{f}"
            targets.append((rel, origin))
    print(f"Total: {len(targets)}", flush=True)
    log = []
    ok = 0; fail = 0
    with ThreadPoolExecutor(max_workers=4) as ex:
        fut = {ex.submit(fetch_one, r, o): (r, o) for r, o in targets}
        for i, f in enumerate(as_completed(fut), 1):
            rel, status = f.result()
            line = f"[{i:3d}/{len(targets)}] {rel}: {status}"
            print(line, flush=True)
            log.append(line)
            if status.startswith("OK") or status == "cached":
                ok += 1
            else:
                fail += 1
    LOG_FILE.write_text("\n".join(log))
    print(f"\nOK={ok}, FAIL={fail}, total={len(targets)}")

if __name__ == "__main__":
    main()
