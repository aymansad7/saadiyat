# Four Seasons data generator

`generate-four-seasons-data.py` rebuilds `client/src/data/fourSeasons.ts` from the four original PDF sources. It no longer depends on pre-existing `/tmp` extraction files.

## Required source files

Place these exact files in one folder:

| File | Permitted use |
|---|---|
| `FourSeasonsPrivateResidences-Saadiy.pdf` | **Only current availability source.** Supplies the 11 available villas, current prices and the 2026-08-23 date. |
| `MASTERPLAN2_FSPR_(2).pdf` | Official 56-villa master plan and clickable hotspot positions. |
| `5Bed.pdf` | Historical inventory. Permanent specifications only; its availability words and prices are deliberately ignored. |
| `6Bed.pdf` | Historical inventory. Permanent specifications only; its availability words and prices are deliberately ignored. |

The generator requires Poppler's `pdftotext` utility, including its `-bbox-layout` option. It is available in the Manus development sandbox.

## Run

```bash
python3 scripts/generate-four-seasons-data.py \
  --source-dir /home/ubuntu/upload
```

The default output is `client/src/data/fourSeasons.ts`. Use `--output` only for verification or diffing.

## Data-integrity guarantees

The script exits unless it finds **exactly 11 current available villas** and **exactly 56 unique master-plan villa positions**. Historical files never populate `status`, `availabilityUpdatedAt`, `askingPriceAed`, `internalAreaSqft` or `externalAreaSqft`.

Master-plan latitude/longitude values are calibrated approximations using project DCR control bounds. They are labelled `masterplan_calibrated_to_dcr` and must not be described as individual official DCR coordinates. Bedroom ranges and villa category labels are master-plan reference classifications, not substitutes for an individual villa's DCR or title-deed specifications.
