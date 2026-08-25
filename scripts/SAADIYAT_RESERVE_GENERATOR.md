# Saadiyat Reserve data generator

Run these commands in order from the project root:

```bash
python3 scripts/parse-saadiyat-reserve-masterplan.py
python3 scripts/classify-saadiyat-reserve-phases.py
python3 scripts/audit-saadiyat-reserve-calibration.py
python3 scripts/generate-saadiyat-reserve-data.py
```

The pipeline reads the official `SaadiyatReservePlotsMasterplan.pdf`, the saved
official Dunes extraction CSV, and `server/data/aldar_saadiyat.json`. It writes
`client/src/data/saadiyatReserve.ts` with all 306 records.

The source PDF is authoritative for plot number, printed plot area, GFA,
master-plan label position and phase boundary. World of Aldar is authoritative
for the 83 Dunes unit numbers, bedroom counts and unit areas. Existing Aldar
inventory is reused for historical launch fields and detail links.

Only the 17 user-supplied SDE3 coordinates are official per-plot coordinates.
Every other coordinate is a quadratic master-plan calibration and must retain
the source label `masterplan_quadratic_calibrated_to_sde3_controls`.

No Reserve plot or Dunes villa is marked currently available by this generator.
Availability, asking price, owners and transaction histories remain empty until
an authoritative current source is supplied.
