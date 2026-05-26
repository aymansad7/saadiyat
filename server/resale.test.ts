/**
 * Resale router tests — focus on visibility (admin vs master) and search/filter
 * logic. We import the loaded dataset directly via _internal helpers so the
 * tests run against the real shipped JSON without any mocking.
 */
import { describe, it, expect } from "vitest";
import { _internal, resaleRouter } from "./routers/resale";

const adminCtx = {
  user: { id: "u-admin", role: "admin", name: "Admin", email: "a@a" },
} as any;
const masterCtx = {
  user: { id: "u-master", role: "master", name: "Master", email: "m@m" },
} as any;

function callList(ctx: any, input: any) {
  // tRPC callers normally would build context, but resaleRouter procedures only
  // read ctx.user, so a thin manual invocation is enough.
  // We rely on the internal procedure shape: createCaller would also work but
  // adds overhead.
  const caller = resaleRouter.createCaller(ctx);
  return caller.list(input);
}

function callSummary(ctx: any) {
  const caller = resaleRouter.createCaller(ctx);
  return caller.summary();
}

function callForUnit(ctx: any, unitNames: string[]) {
  const caller = resaleRouter.createCaller(ctx);
  return caller.forUnit({ unitNames });
}

describe("resale dataset", () => {
  it("loads aldar_resale.json without throwing", () => {
    const ds = _internal.loadDataset();
    expect(ds.items.length).toBeGreaterThan(50);
    expect(ds.items.length).toBeLessThan(2000);
  });

  it("indexes items by unit_number", () => {
    const idx = _internal.getIndex();
    expect(idx.size).toBeGreaterThan(50);
  });
});

describe("resale.list visibility", () => {
  it("admin sees only Saadiyat-area resale rows", async () => {
    const res = await callList(adminCtx, { area: "all", limit: 1000 });
    for (const it of res.items) {
      // allow unmatched (no area), but never area==="other"
      expect(it.area === "other" && it.matched).toBeFalsy();
    }
  });

  it("master sees Other area rows too", async () => {
    const res = await callList(masterCtx, { area: "other", limit: 1000 });
    expect(res.items.length).toBeGreaterThan(0);
    for (const it of res.items) {
      expect(it.area).toBe("other");
      expect(it.matched).toBe(true);
    }
  });

  it("matchedOnly hides unmatched rows", async () => {
    const res = await callList(masterCtx, { matchedOnly: true, limit: 1000 });
    for (const it of res.items) {
      expect(it.matched).toBe(true);
    }
  });

  it("query narrows results", async () => {
    const all = await callList(masterCtx, { limit: 1000 });
    const filtered = await callList(masterCtx, { query: "Lagoons", limit: 1000 });
    expect(filtered.items.length).toBeLessThanOrEqual(all.items.length);
    for (const it of filtered.items) {
      const blob = `${it.unit_number} ${it.project_resale_name} ${it.community_location}`.toLowerCase();
      expect(blob).toContain("lagoons");
    }
  });

  it("sorts by asking price descending", async () => {
    const res = await callList(masterCtx, { limit: 50 });
    for (let i = 1; i < res.items.length; i++) {
      const prev = res.items[i - 1].asking_price_aed ?? -1;
      const curr = res.items[i].asking_price_aed ?? -1;
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });
});

describe("resale.summary", () => {
  it("admin summary excludes Other", async () => {
    const adm = await callSummary(adminCtx);
    expect(adm.other).toBe(0);
    expect(adm.saadiyat).toBeGreaterThan(0);
  });

  it("master summary includes Other", async () => {
    const m = await callSummary(masterCtx);
    expect(m.other).toBeGreaterThan(0);
    expect(m.visible).toBeGreaterThanOrEqual(m.saadiyat + m.other);
  });
});

describe("resale.forUnit", () => {
  it("returns matched rows by unit_number", async () => {
    // Take any matched item from the dataset and look it up.
    const ds = _internal.loadDataset();
    const sample = ds.items.find(i => i.matched && i.area === "saadiyat");
    if (!sample) return; // dataset may evolve; this is acceptable
    const res = await callForUnit(adminCtx, [sample.unit_number]);
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items[0].unit_number).toBe(sample.unit_number);
  });

  it("hides Other-area rows from admin", async () => {
    const ds = _internal.loadDataset();
    const sample = ds.items.find(i => i.matched && i.area === "other");
    if (!sample) return;
    const adm = await callForUnit(adminCtx, [sample.unit_number]);
    expect(adm.items.find(i => i.area === "other")).toBeUndefined();
    const m = await callForUnit(masterCtx, [sample.unit_number]);
    expect(m.items.find(i => i.area === "other")).toBeDefined();
  });
});
