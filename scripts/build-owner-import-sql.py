"""Build safe SQL batches from the approved owner-workbook audit manifest.

The output is intentionally SQL-only: each batch is reviewed/executed through
the managed database interface and logs every actual owner change.
"""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "server/data/owner_workbook_2026_08_26_audit.json"
OUT = ROOT / "tmp/owner-import-sql"
BATCH_SIZE = 220


def sql(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("\\", "\\\\").replace("'", "''") + "'"


def main() -> None:
    records = json.loads(AUDIT.read_text())["approved_records"]
    OUT.mkdir(parents=True, exist_ok=True)
    for stale in OUT.glob("owner_import_*.sql"):
        stale.unlink()
    for start in range(0, len(records), BATCH_SIZE):
        batch = records[start : start + BATCH_SIZE]
        rows = ",\n".join(
            "(" + ", ".join([
                sql(record["villa_key"]),
                sql(record["community"]),
                sql(record["owner_name"]),
                sql(record.get("owner_phone")),
                sql(record["sheet"]),
                str(record["row"]),
            ]) + ")"
            for record in batch
        )
        query = f"""START TRANSACTION;
DROP TEMPORARY TABLE IF EXISTS owner_import;
CREATE TEMPORARY TABLE owner_import (
  villa_key VARCHAR(128) NOT NULL PRIMARY KEY,
  community VARCHAR(64) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  owner_phone VARCHAR(64) NULL,
  source_sheet VARCHAR(64) NOT NULL,
  source_row INT NOT NULL
);
INSERT INTO owner_import (villa_key, community, owner_name, owner_phone, source_sheet, source_row) VALUES
{rows};
INSERT INTO villa_listing_audit (villaKey, actorEmail, actorName, summary, changesJson)
SELECT i.villa_key,
  'bulk-owner-import@nasluxury.internal',
  'Newlagoonsandnoya.xlsx import',
  CONCAT('Imported protected owner information from ', i.source_sheet, ' row ', i.source_row),
  JSON_OBJECT(
    'ownerName', JSON_OBJECT('from', l.ownerName, 'to', i.owner_name),
    'ownerPhone', JSON_OBJECT('from', l.ownerPhone, 'to', i.owner_phone)
  )
FROM owner_import i
LEFT JOIN villa_listings l ON l.villaKey = i.villa_key
WHERE COALESCE(l.ownerName, '') <> i.owner_name
   OR COALESCE(l.ownerPhone, '') <> COALESCE(i.owner_phone, '');
INSERT INTO villa_listings (villaKey, community, ownerName, ownerPhone, updatedBy)
SELECT villa_key, community, owner_name, owner_phone, 'bulk-owner-import@nasluxury.internal'
FROM owner_import
ON DUPLICATE KEY UPDATE
  ownerName = VALUES(ownerName),
  ownerPhone = VALUES(ownerPhone),
  updatedBy = VALUES(updatedBy);
COMMIT;"""
        (OUT / f"owner_import_{start // BATCH_SIZE + 1:02d}.sql").write_text(query)
    print(json.dumps({"records": len(records), "batches": len(list(OUT.glob('owner_import_*.sql'))), "batch_size": BATCH_SIZE}))


if __name__ == "__main__":
    main()
