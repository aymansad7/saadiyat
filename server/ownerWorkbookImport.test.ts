import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

type OwnerRecord = {
  villa_key: string;
  community: "lagoons" | "aldar-other";
  owner_name: string;
  owner_phone: string | null;
};

const auditPath = path.resolve(process.cwd(), "server/data/owner_workbook_2026_08_26_audit.json");
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8")) as {
  approved_records: OwnerRecord[];
  ambiguous_records: unknown[];
  unmatched_records: unknown[];
  conflicting_records: unknown[];
  summary: Record<string, number>;
};

describe("New Lagoons and Noya owner workbook", () => {
  it("imports only exact, canonical owner records", () => {
    expect(audit.summary.approved).toBe(1533);
    expect(audit.summary.lagoons).toBe(694);
    expect(audit.summary.noya).toBe(839);
    expect(new Set(audit.approved_records.map(record => record.villa_key)).size).toBe(audit.approved_records.length);
    expect(audit.approved_records.every(record => record.villa_key.startsWith("lagoons/") || record.villa_key.startsWith("aldar-other/"))).toBe(true);
    expect(audit.approved_records.filter(record => record.community === "lagoons").some(record => Boolean(record.owner_phone))).toBe(true);
  });

  it("preserves ambiguous, unmatched, and conflicting rows outside the import manifest", () => {
    expect(audit.summary.ambiguous).toBe(254);
    expect(audit.summary.unmatched).toBe(283);
    expect(audit.summary.conflicts).toBe(0);
    const approved = new Set(audit.approved_records.map(record => record.villa_key));
    for (const record of audit.ambiguous_records as Array<{ candidates?: Array<{ villa_key?: string }> }>) {
      for (const candidate of record.candidates ?? []) expect(approved.has(candidate.villa_key ?? "")).toBe(false);
    }
  });
});
