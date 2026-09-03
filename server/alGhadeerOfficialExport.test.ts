import { describe, expect, it } from "vitest";
import { alGhadeerOfficialExportRows } from "./alGhadeerOfficialExport";

describe("Al Ghadeer official register export", () => {
  it("contains every captured unit with workbook-backed prices where the source publishes a positive value, without creating operational availability", () => {
    const rows = alGhadeerOfficialExportRows();
    expect(rows).toHaveLength(1243);
    expect(new Set(rows.map(row => `${row.project}::${row.unitCode}`)).size).toBe(1243);
    const pricedRows = rows.filter(row => row.priceAed != null);
    expect(pricedRows).toHaveLength(1242);
    expect(pricedRows.every(row => row.priceSourceCaptureDate === "2026-09-03")).toBe(true);
    expect(rows.filter(row => row.priceAed == null).map(row => row.unitCode)).toEqual([
      "AlGhadeerGardens-N2-V-004-Test-01",
    ]);
    expect(rows.every(row => row.operationalAvailability === null)).toBe(true);
  });

  it("retains the capture state separately and keeps every link at its exact unit code", () => {
    const rows = alGhadeerOfficialExportRows();
    expect(rows.every(row => row.captureDate === "2026-09-03")).toBe(true);
    expect(rows.every(row => row.officialLink?.includes(`/property/${encodeURIComponent(row.unitCode.split(/AlGhadeer(?:Gardens|Parks[12])-/)[1] ?? "" )}/0?`))).toBe(true);
    expect(rows.some(row => row.unitCode === "AlGhadeerGardens-N2-V-004-Test-01")).toBe(true);
  });
});
