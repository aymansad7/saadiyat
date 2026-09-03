import { describe, expect, it } from "vitest";
import { latestGoogleCardRows, prepareLagoonsGoogleOwnerRecords } from "./lagoonsGoogleSheetOwnerImport";

const owner = { id: 7, displayName: "Reviewed owner", phone: "+971 50 123 4567", email: null };
const source = (overrides: Partial<{ status: "linked" | "unlinked" | "conflict"; villa_key: string; owner_phone: string | null }> = {}) => ({
  source_file: "LAGOONS_FROM_CRM_2026-09-03.xlsx",
  source_sheet: "Sheet1",
  source_row: 12,
  source_unit: "Lagoons-Wilds-SL8-V-127",
  owner_phone: "+971501234567",
  source_project: "Saadiyat Lagoons",
  status: "linked" as const,
  reason: "documented_cluster_phase_villa_key",
  villa_key: "lagoons/AlGhaf-127-03",
  ...overrides,
});

describe("Lagoons Google owner import", () => {
  it("uses an exact source unit only with one previously reviewed owner relation", () => {
    const result = prepareLagoonsGoogleOwnerRecords([source()], new Map([["lagoons/AlGhaf-127-03", [owner]]]));
    expect(result[0]).toMatchObject({ ownerId: 7, community: "lagoons", matchStatus: "linked" });
  });

  it("recognises equivalent UAE local and international phone notation without treating it as a second owner", () => {
    const result = prepareLagoonsGoogleOwnerRecords([source({ owner_phone: "050 123 4567" })], new Map([["lagoons/AlGhaf-127-03", [owner]]]));
    expect(result[0]).toMatchObject({ ownerId: 7, community: "lagoons", matchStatus: "linked" });
  });

  it("does not create an owner association from an exact unit if no reviewed owner exists", () => {
    const result = prepareLagoonsGoogleOwnerRecords([source()], new Map());
    expect(result[0]).toMatchObject({ ownerId: null, matchStatus: "unlinked", matchReason: "exact_unit_key_but_no_previously_reviewed_owner_relation" });
  });

  it("quarantines a CRM phone that conflicts with the reviewed owner profile", () => {
    const result = prepareLagoonsGoogleOwnerRecords([source({ owner_phone: "+971501234568" })], new Map([["lagoons/AlGhaf-127-03", [owner]]]));
    expect(result[0]).toMatchObject({ ownerId: 7, community: "lagoons", matchStatus: "conflict", matchReason: "google_crm_phone_conflicts_with_reviewed_owner_record" });
  });

  it("does not use a phone or source row without an exact unit key to create a relation", () => {
    const result = prepareLagoonsGoogleOwnerRecords([source({ status: "unlinked", villa_key: "" })], new Map([["lagoons/AlGhaf-127-03", [owner]]]));
    expect(result[0]).toMatchObject({ ownerId: null, community: null, matchStatus: "unlinked" });
  });

  it("uses the latest supplied CRM row per reviewed exact unit while retaining prior rows for history", () => {
    const prepared = prepareLagoonsGoogleOwnerRecords([
      source({ source_row: 12, owner_phone: "050 123 4567" }),
      source({ source_row: 19, owner_phone: "050 123 4568" }),
    ], new Map([["lagoons/AlGhaf-127-03", [owner]]]));
    const [group] = latestGoogleCardRows(prepared);
    expect(group.current.source_row).toBe(19);
    expect(group.current.matchStatus).toBe("conflict");
    expect(group.previous.map(row => row.source_row)).toEqual([12]);
  });
});
