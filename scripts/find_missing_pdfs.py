#!/usr/bin/env python3
"""Compute which DCR PDFs are still missing for each community/gate."""
import os
import json

RAW_BASE = "/home/ubuntu/backups/raw"

EXPECTED = {
    "jawaher":      [f"SDN1_{n}.pdf"     for n in range(49, 132)],
    "sbv_gate1":    ["SDN2_6-1_2.pdf"] + [f"SDN2_6_{n}.pdf"   for n in range(3, 27)],
    "sbv_gate2":    [f"SDN2_{n}.pdf"     for n in range(1, 157)],
    "sbv_gate3":    [f"SDN2_2_{n}.pdf"   for n in range(1, 66)],
    "sbv_gate4":    [f"SDN2_3_{n}.pdf"   for n in range(1, 60)],
    "sbv_premium":  [f"SDN2_4_{n}.pdf"   for n in range(1, 16)],
    "sbv_gate7":    [f"SDN4_1_{n}.pdf"   for n in range(1, 127)],
}

missing_all = {}
total_missing = 0
total_expected = 0

for gate, expected in EXPECTED.items():
    folder = os.path.join(RAW_BASE, gate)
    have = set(os.listdir(folder)) if os.path.isdir(folder) else set()
    missing = [f for f in expected if f not in have]
    missing_all[gate] = missing
    total_expected += len(expected)
    total_missing += len(missing)
    print(f"{gate}: have {len(expected)-len(missing)}/{len(expected)}, missing {len(missing)}")

print(f"\nTotal expected: {total_expected}")
print(f"Total missing:  {total_missing}")

with open("/home/ubuntu/saadiyat/scripts/missing_pdfs.json", "w") as f:
    json.dump(missing_all, f, indent=2)

print(f"\nWrote missing list to scripts/missing_pdfs.json")
