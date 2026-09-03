import { describe, expect, it } from "vitest";
import { alGhadeerOfficialExportRows } from "./alGhadeerOfficialExport";

describe("Al Ghadeer official register export", () => {
  it("contains every captured unit and restores only the exact R2 historical prices without creating operational availability", () => {
    const rows = alGhadeerOfficialExportRows();
    expect(rows).toHaveLength(1243);
    expect(new Set(rows.map(row => `${row.project}::${row.unitCode}`)).size).toBe(1243);
    const r2PricedRows = rows.filter(row => row.cluster === "R2" && row.priceAed != null);
    expect(r2PricedRows).toHaveLength(434);
    expect(r2PricedRows.every(row => row.priceSourceCaptureDate === "2026-08-12")).toBe(true);
    expect(rows.filter(row => row.cluster !== "R2").every(row => row.priceAed === null)).toBe(true);
    expect(rows.every(row => row.operationalAvailability === null)).toBe(true);
  });

  it("retains the capture state separately and keeps every link at its exact unit code", () => {
    const rows = alGhadeerOfficialExportRows();
    expect(rows.every(row => row.captureDate === "2026-09-03")).toBe(true);
    expect(rows.every(row => row.officialLink?.includes(`/property/${encodeURIComponent(row.unitCode.split(/AlGhadeer(?:Gardens|Parks[12])-/)[1] ?? "" )}/0?`))).toBe(true);
    expect(rows.some(row => row.unitCode === "AlGhadeerGardens-N2-V-004-Test-01")).toBe(true);
  });
});
